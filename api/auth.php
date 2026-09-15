<?php
/**
 * Connexion à l'espace privé.
 *
 *   GET  auth.php?action=me       → état de la session
 *   POST auth.php?action=login    {"username": "...", "password": "..."}
 *   POST auth.php?action=logout
 */

declare(strict_types=1);

require __DIR__ . '/_lib/bootstrap.php';

function session_state(): array
{
    $user = current_user();
    return [
        'configured' => is_configured(),
        'authenticated' => $user !== null,
        'user' => $user,
        'csrf' => $user !== null ? csrf_token() : null,
    ];
}

switch ($_GET['action'] ?? '') {
    case 'me':
        require_method('GET');
        start_session(onlyIfExists: true);
        json_response(session_state());

    case 'login':
        require_method('POST');
        if (!is_configured()) {
            fail("L'espace privé n'est pas encore configuré (php api/tools/setup.php).", 503);
        }
        $body = json_body();
        start_session();
        rate_limit('login', 5, 15 * 60); // 5 essais ratés par quart d'heure

        $username = str_field($body, 'username', 100);
        $password = $body['password'] ?? '';
        if (!is_string($password) || strlen($password) > 1024) {
            fail('Mot de passe invalide.');
        }

        // Les deux vérifications sont toujours faites : même durée de réponse dans tous les cas.
        $userOk = hash_equals(mb_strtolower((string) config('username')), mb_strtolower($username));
        $passOk = password_verify($password, (string) config('password_hash'));

        if (!$userOk || !$passOk) {
            rate_hit('login');
            usleep(random_int(250_000, 600_000)); // ralentit les robots
            fail('Identifiant ou mot de passe incorrect.', 401);
        }

        rate_clear('login');
        session_regenerate_id(true); // nouvelle session : empêche la fixation de session
        $_SESSION = ['user' => (string) config('username'), 'last_seen' => time()];
        json_response(session_state());

    case 'logout':
        require_method('POST');
        start_session(onlyIfExists: true);
        if (session_status() === PHP_SESSION_ACTIVE) {
            if (current_user() !== null) {
                require_csrf();
            }
            $_SESSION = [];
            session_destroy();
        }
        setcookie(SESSION_NAME, '', ['expires' => time() - 3600, 'path' => '/', 'samesite' => 'Strict', 'httponly' => true, 'secure' => is_https()]);
        json_response(['ok' => true]);

    default:
        fail('Action inconnue.', 404);
}
