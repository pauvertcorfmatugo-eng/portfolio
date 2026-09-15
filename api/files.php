<?php
/**
 * Cloud privé : lister, envoyer, télécharger, renommer, supprimer.
 * Toutes les actions demandent d'être connecté.
 *
 *   GET  files.php?action=list&path=Photos
 *   GET  files.php?action=download&path=Photos/a.jpg[&inline=1]
 *   POST files.php?action=mkdir     {"path": "Photos", "name": "2026"}
 *   POST files.php?action=rename    {"path": "Photos/a.jpg", "name": "b.jpg"}
 *   POST files.php?action=delete    {"path": "Photos/b.jpg"}
 *   POST files.php?action=upload&path=…&name=…&size=…&offset=…&uploadId=…   (corps = morceau brut)
 */

declare(strict_types=1);

require __DIR__ . '/_lib/bootstrap.php';
require __DIR__ . '/_lib/storage.php';

require_auth();

switch ($_GET['action'] ?? '') {
    case 'list':
        require_method('GET');
        $dir = resolve_dir((string) ($_GET['path'] ?? ''));
        $items = [];
        foreach (new DirectoryIterator($dir) as $entry) {
            if ($entry->isDot() || is_hidden_entry($entry->getFilename())) {
                continue;
            }
            $items[] = entry_info($dir . '/' . $entry->getFilename());
        }
        json_response(['path' => relative_of($dir), 'items' => $items, 'disk' => disk_info()]);

    case 'download':
        require_method('GET');
        send_file(resolve_existing((string) ($_GET['path'] ?? '')), ($_GET['inline'] ?? '') === '1');

    case 'mkdir':
        require_method('POST');
        require_csrf();
        $body = json_body();
        $parent = resolve_dir(str_field($body, 'path', 4000));
        $target = $parent . '/' . validate_name(str_field($body, 'name', 255));
        if (file_exists($target)) {
            fail('Un élément porte déjà ce nom.', 409);
        }
        mkdir($target, 0770);
        json_response(['item' => entry_info($target)]);

    case 'rename':
        require_method('POST');
        require_csrf();
        $body = json_body();
        $source = resolve_existing(str_field($body, 'path', 4000));
        if (same_path($source, storage_root())) {
            fail('Impossible de renommer la racine.');
        }
        $target = dirname($source) . '/' . validate_name(str_field($body, 'name', 255));
        // Sous Windows, « photo.jpg » → « Photo.jpg » désigne le même fichier : on l'autorise.
        if (file_exists($target) && !same_path($source, $target)) {
            fail('Un élément porte déjà ce nom.', 409);
        }
        rename($source, $target);
        json_response(['item' => entry_info($target)]);

    case 'delete':
        require_method('POST');
        require_csrf();
        $target = resolve_existing(str_field(json_body(), 'path', 4000));
        if (same_path($target, storage_root())) {
            fail('Impossible de supprimer la racine.');
        }
        delete_recursive($target);
        json_response(['ok' => true]);

    case 'upload':
        require_method('POST');
        require_csrf();
        receive_chunk();

    default:
        fail('Action inconnue.', 404);
}

/**
 * Reçoit un morceau de fichier et l'ajoute au fichier temporaire.
 * Au dernier morceau, le fichier complet est déplacé dans le dossier choisi.
 * Si la connexion coupe, le navigateur reprend là où le serveur s'est arrêté (réponse 409).
 */
function receive_chunk(): never
{
    set_time_limit(0);

    $uploadId = (string) ($_GET['uploadId'] ?? '');
    if (!preg_match('/^[a-f0-9]{16,64}$/', $uploadId)) {
        fail("Identifiant d'envoi invalide.");
    }
    $size = filter_var($_GET['size'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
    $offset = filter_var($_GET['offset'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
    if ($size === false || $offset === false || $offset > $size) {
        fail("Paramètres d'envoi invalides.");
    }
    $max = (int) config('max_file_bytes', 0);
    if ($max > 0 && $size > $max) {
        fail('Fichier trop volumineux.', 413);
    }

    $dir = resolve_dir((string) ($_GET['path'] ?? ''));
    $name = validate_name((string) ($_GET['name'] ?? ''));

    $tmpDir = storage_root() . '/' . TMP_DIR_NAME;
    if (!is_dir($tmpDir)) {
        mkdir($tmpDir, 0770);
    }
    $part = "$tmpDir/$uploadId.part";

    if ($offset === 0) {
        clean_stale_parts($tmpDir);
        $free = @disk_free_space($dir);
        if ($free !== false && $free < $size + 50 * 1024 ** 2) {
            fail('Espace disque insuffisant.', 507);
        }
    }

    clearstatcache(true, $part);
    $received = is_file($part) ? filesize($part) : 0;
    if ($offset !== $received) {
        fail('Reprise de l\'envoi.', 409, ['received' => $received]);
    }

    $in = fopen('php://input', 'rb');
    $out = fopen($part, $offset === 0 ? 'wb' : 'ab');
    stream_copy_to_stream($in, $out, $size - $offset + 1);
    fclose($in);
    fclose($out);

    clearstatcache(true, $part);
    $received = filesize($part);
    if ($received > $size) {
        unlink($part);
        fail('Le fichier reçu est plus gros que prévu.');
    }
    if ($received < $size) {
        json_response(['done' => false, 'received' => $received]);
    }

    $target = unique_path($dir, $name);
    rename($part, $target);
    json_response(['done' => true, 'received' => $received, 'item' => entry_info($target)]);
}

/** Supprime les envois abandonnés depuis plus de 24 h. */
function clean_stale_parts(string $tmpDir): void
{
    foreach (glob($tmpDir . '/*.part') ?: [] as $file) {
        if (filemtime($file) < time() - 86400) {
            @unlink($file);
        }
    }
}

/** Envoie un fichier (téléchargement ou aperçu), avec prise en charge des plages pour les vidéos. */
function send_file(string $file, bool $inline): never
{
    if (!is_file($file)) {
        fail('Fichier introuvable.', 404);
    }
    set_time_limit(0);
    session_write_close(); // ne bloque pas les autres requêtes pendant un long téléchargement

    $name = basename($file);
    $size = filesize($file);
    $mime = $inline ? preview_mime($name) : null;
    $asciiName = preg_replace('/[^\x20-\x7E]|["\\\\]/', '_', $name);

    if ($mime) {
        header('Content-Type: ' . $mime);
        header("Content-Disposition: inline; filename=\"$asciiName\"; filename*=UTF-8''" . rawurlencode($name));
        if ($mime !== 'application/pdf') {
            // Empêche tout script de s'exécuter si le fichier est ouvert seul dans un onglet.
            header("Content-Security-Policy: sandbox; default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'");
        }
    } else {
        header('Content-Type: application/octet-stream');
        header("Content-Disposition: attachment; filename=\"$asciiName\"; filename*=UTF-8''" . rawurlencode($name));
    }
    header('Accept-Ranges: bytes');
    header('Cache-Control: private, no-store');

    $start = 0;
    $end = $size - 1;
    if (isset($_SERVER['HTTP_RANGE']) && preg_match('/^bytes=(\d*)-(\d*)$/', trim($_SERVER['HTTP_RANGE']), $m)) {
        if ($m[1] === '' && $m[2] !== '') {
            $start = max(0, $size - (int) $m[2]);
        } else {
            $start = (int) $m[1];
            if ($m[2] !== '') {
                $end = min((int) $m[2], $size - 1);
            }
        }
        if ($start > $end || $start >= $size) {
            http_response_code(416);
            header("Content-Range: bytes */$size");
            exit;
        }
        http_response_code(206);
        header("Content-Range: bytes $start-$end/$size");
    }
    header('Content-Length: ' . ($size === 0 ? 0 : $end - $start + 1));

    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    if ($size > 0) {
        $fp = fopen($file, 'rb');
        fseek($fp, $start);
        $remaining = $end - $start + 1;
        while ($remaining > 0 && !feof($fp) && !connection_aborted()) {
            $chunk = fread($fp, min(1024 * 1024, $remaining));
            echo $chunk;
            flush();
            $remaining -= strlen($chunk);
        }
        fclose($fp);
    }
    exit;
}
