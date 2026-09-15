<?php
// Page affichée quand on ouvre http://localhost/Portfolio/ dans WAMP.
// Le site React se lance avec « npm run dev » (http://localhost:5173),
// ou se compile pour WAMP avec « npm run build:wamp » (servi alors dans dist/).
$build = __DIR__ . '/dist/index.html';
if (is_file($build) && str_contains((string) file_get_contents($build), '/Portfolio/dist/')) {
    header('Location: dist/');
    exit;
}
?>
<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Portfolio — lancement</title>
    <style>
        body { font: 16px/1.6 system-ui, sans-serif; max-width: 640px; margin: 4rem auto; padding: 0 1.25rem; color: #141518; background: #f5f4ef; }
        code { background: #e7e5dd; padding: .15rem .4rem; border-radius: 4px; }
        a { color: #1f4be0; }
    </style>
</head>
<body>
    <h1>Portfolio (React)</h1>
    <p>Le site n'est pas encore compilé pour WAMP. Deux façons de le voir :</p>
    <ol>
        <li>Développement : <code>npm run dev</code> puis <a href="http://localhost:5173">http://localhost:5173</a></li>
        <li>Version compilée : <code>npm run build:wamp</code> puis recharge cette page.</li>
    </ol>
    <p>L'ancienne version est toujours là : <a href="ancien/">ancien/</a></p>
</body>
</html>
