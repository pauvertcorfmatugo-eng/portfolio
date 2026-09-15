<?php
/**
 * Accès au dossier de stockage du cloud.
 * Règle d'or : tout chemin venant du navigateur est vérifié pour qu'il reste
 * À L'INTÉRIEUR du dossier de stockage (pas de « ../ » pour remonter ailleurs).
 */

declare(strict_types=1);

const TMP_DIR_NAME = '.upc-tmp';

// Fichiers de configuration serveur : on refuse de les créer (ils pourraient
// désactiver la protection du dossier) et on les masque dans la liste.
const RESERVED_NAMES = ['.htaccess', '.htpasswd', '.user.ini', 'web.config', TMP_DIR_NAME];

function storage_root(): string
{
    static $root = null;
    return $root ??= private_dir((string) config('storage_dir'));
}

function same_path(string $a, string $b): bool
{
    // Windows ne tient pas compte de la casse
    return PHP_OS_FAMILY === 'Windows' ? strcasecmp($a, $b) === 0 : $a === $b;
}

function is_inside_storage(string $absolute): bool
{
    $root = storage_root();
    $prefix = $root . '/';
    return same_path($absolute, $root)
        || same_path(substr($absolute, 0, strlen($prefix)), $prefix);
}

/** « /Photos//2024/ » → « Photos/2024 » ; refuse « .. » */
function clean_relative_path(string $path): string
{
    $parts = [];
    foreach (explode('/', str_replace('\\', '/', $path)) as $segment) {
        if ($segment === '' || $segment === '.') {
            continue;
        }
        if ($segment === '..' || preg_match('/[\x00-\x1F]/', $segment)) {
            fail('Chemin invalide.');
        }
        $parts[] = $segment;
    }
    return implode('/', $parts);
}

/** Chemin absolu d'un élément existant, garanti dans le stockage. */
function resolve_existing(string $relative): string
{
    $relative = clean_relative_path($relative);
    $candidate = storage_root() . ($relative === '' ? '' : '/' . $relative);
    $real = realpath($candidate);
    if ($real === false) {
        fail('Élément introuvable.', 404);
    }
    // realpath suit les liens symboliques : on revérifie la destination finale.
    $real = rtrim(str_replace('\\', '/', $real), '/');
    if (!is_inside_storage($real)) {
        fail('Chemin invalide.');
    }
    return $real;
}

function resolve_dir(string $relative): string
{
    $dir = resolve_existing($relative);
    if (!is_dir($dir)) {
        fail("Ce n'est pas un dossier.");
    }
    return $dir;
}

function relative_of(string $absolute): string
{
    return ltrim(substr($absolute, strlen(storage_root())), '/');
}

function validate_name(string $name): string
{
    $name = trim($name);
    if ($name === '' || $name === '.' || $name === '..' || !mb_check_encoding($name, 'UTF-8')) {
        fail('Nom invalide.');
    }
    if (mb_strlen($name) > 200) {
        fail('Nom trop long (200 caractères max).');
    }
    if (preg_match('/[\/\\\\:*?"<>|\x00-\x1F]/u', $name)) {
        fail('Le nom ne peut pas contenir : / \\ : * ? " < > |');
    }
    if (preg_match('/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i', $name)) {
        fail('Ce nom est réservé par Windows.');
    }
    if (str_ends_with($name, '.')) {
        fail('Le nom ne peut pas finir par un point.');
    }
    foreach (RESERVED_NAMES as $reserved) {
        if (strcasecmp($name, $reserved) === 0) {
            fail('Ce nom est réservé.');
        }
    }
    return $name;
}

function is_hidden_entry(string $name): bool
{
    foreach (RESERVED_NAMES as $reserved) {
        if (strcasecmp($name, $reserved) === 0) {
            return true;
        }
    }
    return false;
}

/** « photo.jpg » déjà pris → « photo (1).jpg », « photo (2).jpg »… */
function unique_path(string $dir, string $name): string
{
    $path = $dir . '/' . $name;
    if (!file_exists($path)) {
        return $path;
    }
    $dot = strrpos($name, '.');
    $base = $dot > 0 ? substr($name, 0, $dot) : $name;
    $ext = $dot > 0 ? substr($name, $dot) : '';
    for ($i = 1; $i < 10000; $i++) {
        $path = "$dir/$base ($i)$ext";
        if (!file_exists($path)) {
            return $path;
        }
    }
    fail('Impossible de trouver un nom libre.', 409);
}

function entry_info(string $absolute): array
{
    $isDir = is_dir($absolute);
    return [
        'name' => basename($absolute),
        'type' => $isDir ? 'dir' : 'file',
        'size' => $isDir ? null : filesize($absolute),
        'mtime' => filemtime($absolute),
    ];
}

function delete_recursive(string $path): void
{
    if (is_link($path) || is_file($path)) {
        unlink($path);
        return;
    }
    $items = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($items as $item) {
        $item->isDir() && !$item->isLink() ? rmdir($item->getPathname()) : unlink($item->getPathname());
    }
    rmdir($path);
}

function ini_bytes(string $key): int
{
    $value = trim((string) ini_get($key));
    if ($value === '' || $value === '0' || $value === '-1') {
        return 0;
    }
    $number = (int) $value;
    return match (strtolower(substr($value, -1))) {
        'g' => $number * 1024 ** 3,
        'm' => $number * 1024 ** 2,
        'k' => $number * 1024,
        default => $number,
    };
}

/**
 * Taille des morceaux d'envoi. Le fichier est envoyé en plusieurs requêtes
 * pour contourner la limite de PHP (8 Mo par requête par défaut dans WAMP).
 */
function chunk_size(): int
{
    $configured = (int) config('chunk_bytes', 0);
    if ($configured > 0) {
        return $configured;
    }
    $postMax = ini_bytes('post_max_size');
    $size = $postMax > 0 ? (int) floor($postMax * 0.9) : 16 * 1024 ** 2;
    return max(256 * 1024, min($size, 16 * 1024 ** 2));
}

function upload_limits(): array
{
    return [
        'chunkSize' => chunk_size(),
        'maxFileSize' => (int) config('max_file_bytes', 0),
    ];
}

function disk_info(): array
{
    $root = storage_root();
    $free = @disk_free_space($root);
    $total = @disk_total_space($root);
    return [
        'free' => $free === false ? null : (int) $free,
        'total' => $total === false ? null : (int) $total,
    ];
}

/** Types affichables directement dans le navigateur (aperçu). */
function preview_mime(string $name): ?string
{
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $text = ['txt', 'md', 'log', 'csv', 'json', 'xml', 'ini', 'conf', 'sql', 'php', 'js', 'jsx', 'ts', 'css',
        'html', 'py', 'sh', 'bat', 'ps1', 'yml', 'yaml', 'c', 'cpp', 'h', 'cs', 'java'];
    if (in_array($ext, $text, true)) {
        return 'text/plain; charset=utf-8'; // jamais interprété comme une page web
    }
    return [
        'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'gif' => 'image/gif',
        'webp' => 'image/webp', 'avif' => 'image/avif', 'bmp' => 'image/bmp',
        'pdf' => 'application/pdf',
        'mp4' => 'video/mp4', 'webm' => 'video/webm', 'mov' => 'video/quicktime',
        'mp3' => 'audio/mpeg', 'ogg' => 'audio/ogg', 'wav' => 'audio/wav', 'm4a' => 'audio/mp4', 'flac' => 'audio/flac',
    ][$ext] ?? null;
}
