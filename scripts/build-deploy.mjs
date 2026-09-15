// Prépare le dossier « deploy/ » : exactement ce qu'il faut envoyer sur l'hébergeur
// (AlwaysData, VPS…). Lancé par « npm run build:deploy », après la compilation.
//
//   deploy/          →  contenu à copier dans le dossier web du site (www/ chez AlwaysData)
//   ├── index.html, assets/, cv/…   le site compilé
//   ├── .htaccess                   routage de l'application monopage
//   ├── api/                        l'API PHP
//   └── data/                       base SQLite et sessions (créées à la première visite)

import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'deploy');

if (!existsSync(resolve(root, 'dist/index.html'))) {
  console.error('Le site n\'est pas compilé : lance « npm run build » d\'abord.');
  process.exit(1);
}

await rm(out, { recursive: true, force: true });
await cp(resolve(root, 'dist'), out, { recursive: true });
await cp(resolve(root, 'api'), resolve(out, 'api'), { recursive: true });

// Le mot de passe se crée sur le serveur : ce fichier ne doit jamais être envoyé.
await rm(resolve(out, 'api/config.local.php'), { force: true });

// Dossier privé de la base SQLite et des sessions.
await mkdir(resolve(out, 'data'), { recursive: true });
await writeFile(resolve(out, 'data/.htaccess'), 'Require all denied\n');

console.log('✔ Dossier « deploy/ » prêt.');
console.log('  → Envoie tout son contenu dans le dossier web de ton hébergeur.');
console.log('  → Puis, en SSH : php api/tools/setup.php (crée ton mot de passe).');
