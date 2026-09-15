<?php
/**
 * Configuration de l'espace privé (à lancer dans un terminal, jamais depuis le navigateur) :
 *
 *     F:\wamp64\bin\php\php8.3.28\php.exe api\tools\setup.php
 *
 * Crée ou met à jour api/config.local.php : identifiant, mot de passe (haché), dossier de stockage.
 * Relance-le quand tu veux changer de mot de passe.
 */

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$apiDir = dirname(__DIR__);
$projectDir = dirname($apiDir);
$configFile = $apiDir . '/config.local.php';
$current = is_file($configFile) ? (require $configFile) : [];
$current = is_array($current) ? $current : [];

/** Lit une ligne ; retire le caractère invisible (BOM) que certaines consoles Windows ajoutent. */
function read_line(): string
{
    $line = fgets(STDIN);
    return $line === false ? '' : preg_replace('/^\xEF\xBB\xBF/', '', rtrim($line, "\r\n"));
}

function ask(string $question, string $default = ''): string
{
    echo $question . ($default !== '' ? " [$default]" : '') . ' : ';
    $line = trim(read_line());
    return $line === '' ? $default : $line;
}

function ask_secret(string $question): string
{
    echo $question . ' : ';
    $hide = PHP_OS_FAMILY !== 'Windows' && stream_isatty(STDIN);
    if ($hide) {
        shell_exec('stty -echo');
    }
    $line = read_line();
    if ($hide) {
        shell_exec('stty echo');
        echo PHP_EOL;
    }
    return $line;
}

echo PHP_EOL . "=== Espace privé du portfolio : configuration ===" . PHP_EOL . PHP_EOL;
if (PHP_OS_FAMILY === 'Windows') {
    echo "(Sous Windows, le mot de passe s'affiche pendant la saisie : vérifie que personne ne regarde.)" . PHP_EOL . PHP_EOL;
}

$username = ask('Identifiant', $current['username'] ?? 'ugo');

while (true) {
    $password = ask_secret('Mot de passe (12 caractères minimum)');
    if (mb_strlen($password) < 12) {
        echo "  → Trop court. Astuce : une phrase de passe (ex. « 4 mots au hasard ») est facile à retenir et solide." . PHP_EOL;
        continue;
    }
    if (ask_secret('Confirme le mot de passe') !== $password) {
        echo "  → Les deux saisies sont différentes, recommence." . PHP_EOL;
        continue;
    }
    break;
}

$defaultStorage = $current['storage_dir'] ?? str_replace('\\', '/', $projectDir) . '/storage';
echo PHP_EOL . "Dossier où seront rangés les fichiers du cloud." . PHP_EOL;
echo "Conseil : un dossier HORS du site web (ex. D:/cloud), ou le dossier d'un NAS." . PHP_EOL;
$storage = str_replace('\\', '/', ask('Dossier de stockage', $defaultStorage));

$config = [
    'username' => $username,
    'password_hash' => password_hash($password, PASSWORD_DEFAULT),
    'secret' => $current['secret'] ?? bin2hex(random_bytes(32)),
    'storage_dir' => $storage,
] + $current;

$php = "<?php\n// Généré par api/tools/setup.php — NE PAS PUBLIER ce fichier (il est dans .gitignore).\n\nreturn "
    . var_export($config, true) . ";\n";
file_put_contents($configFile, $php);

foreach ([$storage, $config['data_dir'] ?? $projectDir . '/data'] as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0770, true);
    }
    if (!is_file($dir . '/.htaccess')) {
        file_put_contents($dir . '/.htaccess', "Require all denied\n");
    }
}

echo PHP_EOL . "✔ Configuration enregistrée dans api/config.local.php" . PHP_EOL;
echo "✔ Stockage : $storage" . PHP_EOL;
echo PHP_EOL . "Connecte-toi sur la page /espace du site avec l'identifiant « $username »." . PHP_EOL . PHP_EOL;
