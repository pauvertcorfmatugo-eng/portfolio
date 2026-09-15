<?php
/**
 * Socle commun à tous les points d'entrée de l'API :
 * réponses JSON, gestion des erreurs, sessions, CSRF, base SQLite, limitation des tentatives.
 */

declare(strict_types=1);

$GLOBALS['CONFIG'] = require __DIR__ . '/../config.php';

function config(string $key, mixed $default = null): mixed
{
    return $GLOBALS['CONFIG'][$key] ?? $default;
}

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store');

// ── Erreurs → JSON ────────────────────────────────────────────

final class ApiException extends RuntimeException
{
    public function __construct(string $message, public readonly int $status = 400, public readonly array $extra = [])
    {
        parent::__construct($message);
    }
}

function json_response(array $data, int $status = 200): never
{
    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400, array $extra = []): never
{
    throw new ApiException($message, $status, $extra);
}

set_error_handler(function (int $severity, string $message, string $file, int $line): bool {
    if (!(error_reporting() & $severity)) {
        return false; // erreur masquée avec @
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

set_exception_handler(function (Throwable $e): void {
    if ($e instanceof ApiException) {
        json_response(['error' => $e->getMessage()] + $e->extra, $e->status);
    }
    error_log('[portfolio-api] ' . $e);
    json_response(['error' => config('debug') ? $e->getMessage() : 'Erreur interne du serveur.'], 500);
});

// ── Lecture de la requête ─────────────────────────────────────

function require_method(string ...$allowed): void
{
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($method, $allowed, true)) {
        header('Allow: ' . implode(', ', $allowed));
        fail('Méthode non autorisée.', 405);
    }
}

function json_body(): array
{
    $type = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
    // Exiger du JSON bloque les formulaires envoyés depuis un autre site.
    if (!str_starts_with($type, 'application/json')) {
        fail('Contenu JSON attendu.', 415);
    }
    $data = json_decode((string) file_get_contents('php://input', false, null, 0, 1_000_000), true);
    if (!is_array($data)) {
        fail('Corps de requête invalide.');
    }
    return $data;
}

function str_field(array $data, string $key, int $maxLength): string
{
    $value = $data[$key] ?? '';
    if (!is_string($value)) {
        fail("Champ « $key » invalide.");
    }
    $value = trim($value);
    if (mb_strlen($value) > $maxLength) {
        fail("Champ « $key » trop long ($maxLength caractères max).");
    }
    return $value;
}

function is_https(): bool
{
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        return true;
    }
    return config('trust_proxy') && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
}

function client_ip(): string
{
    if (config('trust_proxy')) {
        $forwarded = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
        $first = trim(explode(',', $forwarded)[0]);
        if (filter_var($first, FILTER_VALIDATE_IP)) {
            return $first;
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/** L'IP n'est jamais stockée en clair (RGPD) : seulement une empreinte. */
function client_fingerprint(): string
{
    return hash_hmac('sha256', client_ip(), (string) config('secret', 'portfolio'));
}

// ── Dossiers privés ───────────────────────────────────────────

/** Crée le dossier si besoin et interdit à Apache de le servir. */
function private_dir(string $dir): string
{
    if (!is_dir($dir) && !@mkdir($dir, 0770, true) && !is_dir($dir)) {
        fail('Impossible de créer le dossier ' . basename($dir) . '.', 500);
    }
    if (!is_file($dir . '/.htaccess')) {
        @file_put_contents($dir . '/.htaccess', "Require all denied\n");
    }
    return rtrim(str_replace('\\', '/', (string) realpath($dir)), '/');
}

function data_dir(): string
{
    static $dir = null;
    return $dir ??= private_dir((string) config('data_dir'));
}

// ── Base SQLite ───────────────────────────────────────────────

function db(): PDO
{
    static $pdo = null;
    if ($pdo) {
        return $pdo;
    }
    $pdo = new PDO('sqlite:' . data_dir() . '/portfolio.sqlite', null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA busy_timeout = 3000');
    $pdo->exec('PRAGMA journal_mode = WAL');
    $pdo->exec(<<<'SQL'
        CREATE TABLE IF NOT EXISTS messages (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT    NOT NULL DEFAULT '',
            email      TEXT    NOT NULL DEFAULT '',
            message    TEXT    NOT NULL,
            source     TEXT    NOT NULL DEFAULT 'contact',
            ip_hash    TEXT    NOT NULL,
            created_at TEXT    NOT NULL,
            read_at    TEXT
        );
        CREATE TABLE IF NOT EXISTS attempts (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            bucket     TEXT    NOT NULL,
            ip_hash    TEXT    NOT NULL,
            created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_attempts ON attempts (bucket, ip_hash, created_at);
    SQL);
    return $pdo;
}

// ── Limitation des tentatives (anti brute-force / anti-spam) ──

function rate_limit(string $bucket, int $max, int $windowSeconds): void
{
    $now = time();
    db()->prepare('DELETE FROM attempts WHERE created_at < ?')->execute([$now - 86400]);

    $stmt = db()->prepare('SELECT COUNT(*) AS n, MIN(created_at) AS oldest FROM attempts
                           WHERE bucket = ? AND ip_hash = ? AND created_at > ?');
    $stmt->execute([$bucket, client_fingerprint(), $now - $windowSeconds]);
    $row = $stmt->fetch();

    if ((int) $row['n'] >= $max) {
        $retry = max(1, (int) $row['oldest'] + $windowSeconds - $now);
        header('Retry-After: ' . $retry);
        fail('Trop de tentatives. Réessayez dans ' . (int) ceil($retry / 60) . ' min.', 429, ['retryAfter' => $retry]);
    }
}

function rate_hit(string $bucket): void
{
    db()->prepare('INSERT INTO attempts (bucket, ip_hash, created_at) VALUES (?, ?, ?)')
        ->execute([$bucket, client_fingerprint(), time()]);
}

function rate_clear(string $bucket): void
{
    db()->prepare('DELETE FROM attempts WHERE bucket = ? AND ip_hash = ?')->execute([$bucket, client_fingerprint()]);
}

// ── Session et authentification ───────────────────────────────

function is_configured(): bool
{
    $hash = (string) config('password_hash');
    return $hash !== '' && password_get_info($hash)['algo'] !== null;
}

const SESSION_NAME = 'upc_session';

/**
 * Démarre la session. Avec $onlyIfExists, ne fait rien si le visiteur n'en a pas déjà une :
 * on évite de créer un fichier de session pour chaque simple visiteur.
 */
function start_session(bool $onlyIfExists = false): void
{
    if (session_status() === PHP_SESSION_ACTIVE || ($onlyIfExists && empty($_COOKIE[SESSION_NAME]))) {
        return;
    }
    $idle = max(5, (int) config('session_idle_minutes', 120)) * 60;

    // Sessions rangées dans data/sessions : le nettoyage suit notre durée d'inactivité.
    session_save_path(private_dir(data_dir() . '/sessions'));
    ini_set('session.gc_maxlifetime', (string) $idle);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_name(SESSION_NAME);
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => is_https(),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();

    if (isset($_SESSION['user'], $_SESSION['last_seen']) && time() - (int) $_SESSION['last_seen'] > $idle) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    $_SESSION['last_seen'] = time();
}

function current_user(): ?string
{
    return $_SESSION['user'] ?? null;
}

function require_auth(): string
{
    start_session(onlyIfExists: true);
    return current_user() ?? fail('Connexion requise.', 401);
}

function csrf_token(): string
{
    return $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}

/** Toute action qui modifie quelque chose doit renvoyer le jeton reçu à la connexion. */
function require_csrf(): void
{
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (empty($_SESSION['csrf']) || !is_string($sent) || !hash_equals($_SESSION['csrf'], $sent)) {
        fail('Jeton de sécurité invalide, rechargez la page.', 403);
    }
}
