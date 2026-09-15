<?php
/**
 * Configuration de l'API.
 *
 * Ne mets PAS tes secrets ici : ils vont dans config.local.php,
 * créé par « php api/tools/setup.php » et jamais publié (voir .gitignore).
 * Toute valeur de config.local.php remplace celle d'ici.
 */

$defaults = [
    // Identifiants de l'espace privé (le mot de passe est stocké haché)
    'username'      => 'ugo',
    'password_hash' => '',

    // Clé aléatoire servant à anonymiser les adresses IP enregistrées
    'secret' => '',

    // Dossier des fichiers du cloud.
    // Idéalement HORS du dossier du site (ex. 'D:/cloud' chez toi, '/srv/cloud' sur un VPS,
    // ou le point de montage d'un NAS). Par défaut : Portfolio/storage (protégé par .htaccess).
    'storage_dir' => dirname(__DIR__) . '/storage',

    // Base SQLite (messages, anti-bruteforce) et sessions
    'data_dir' => dirname(__DIR__) . '/data',

    // Taille maximale d'un fichier envoyé (0 = pas de limite)
    'max_file_bytes' => 20 * 1024 ** 3, // 20 Go

    // Taille des morceaux d'envoi (0 = calculée d'après post_max_size de PHP)
    'chunk_bytes' => 0,

    // Déconnexion automatique après X minutes d'inactivité
    'session_idle_minutes' => 120,

    // true si le site passe par un reverse proxy (Nginx, Cloudflare Tunnel…)
    // pour lire la vraie IP du visiteur et détecter le HTTPS
    'trust_proxy' => false,

    // true pour afficher le détail des erreurs (jamais en production)
    'debug' => false,
];

$local = is_file(__DIR__ . '/config.local.php') ? require __DIR__ . '/config.local.php' : [];

return array_merge($defaults, is_array($local) ? $local : []);
