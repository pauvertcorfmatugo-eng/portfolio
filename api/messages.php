<?php
/**
 * Messages laissés par les visiteurs (formulaire de contact et chat).
 *
 *   POST messages.php?action=send     (public)   {"name", "email", "message", "source"}
 *   GET  messages.php?action=list     (privé)
 *   POST messages.php?action=read     (privé)    {"id": 3, "read": true}
 *   POST messages.php?action=delete   (privé)    {"id": 3}
 */

declare(strict_types=1);

require __DIR__ . '/_lib/bootstrap.php';

switch ($_GET['action'] ?? '') {
    case 'send':
        require_method('POST');
        $body = json_body();

        // Piège à robots : ce champ est invisible pour un humain.
        if (!empty($body['website'])) {
            json_response(['ok' => true]);
        }

        $message = str_field($body, 'message', 3000);
        $name = str_field($body, 'name', 80);
        $email = str_field($body, 'email', 160);
        if (mb_strlen($message) < 5) {
            fail('Le message est trop court.');
        }
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            fail("L'adresse email n'est pas valide.");
        }
        $source = in_array($body['source'] ?? '', ['chat', 'contact'], true) ? $body['source'] : 'contact';

        rate_limit('message', 5, 3600); // 5 messages par heure et par visiteur
        db()->prepare('INSERT INTO messages (name, email, message, source, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)')
            ->execute([$name, $email, $message, $source, client_fingerprint(), gmdate('c')]);
        rate_hit('message');

        json_response(['ok' => true]);

    case 'list':
        require_method('GET');
        require_auth();
        $items = db()->query('SELECT id, name, email, message, source, created_at, read_at
                              FROM messages ORDER BY id DESC LIMIT 500')->fetchAll();
        foreach ($items as &$item) {
            $item['id'] = (int) $item['id'];
        }
        $unread = (int) db()->query('SELECT COUNT(*) FROM messages WHERE read_at IS NULL')->fetchColumn();
        json_response(['items' => $items, 'unread' => $unread]);

    case 'read':
        require_method('POST');
        require_auth();
        require_csrf();
        $body = json_body();
        $id = filter_var($body['id'] ?? null, FILTER_VALIDATE_INT) ?: fail('Identifiant invalide.');
        $read = ($body['read'] ?? true) !== false;
        db()->prepare('UPDATE messages SET read_at = ? WHERE id = ?')->execute([$read ? gmdate('c') : null, $id]);
        json_response(['ok' => true]);

    case 'delete':
        require_method('POST');
        require_auth();
        require_csrf();
        $id = filter_var(json_body()['id'] ?? null, FILTER_VALIDATE_INT) ?: fail('Identifiant invalide.');
        db()->prepare('DELETE FROM messages WHERE id = ?')->execute([$id]);
        json_response(['ok' => true]);

    default:
        fail('Action inconnue.', 404);
}
