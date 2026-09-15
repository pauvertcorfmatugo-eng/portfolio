# Portfolio — Ugo Pauvert--Corfmat

Portfolio en **React** (Vite) avec une petite **API PHP** pour le formulaire de contact
et l'espace privé.

- **Site public** : profil, compétences, projets (avec étude de cas détaillée), parcours, contact.
- **Espace privé** (`/espace`) : les messages reçus via le formulaire de contact. Protégé par mot de passe.

L'ancienne version PHP est conservée dans [`ancien/`](ancien/).

---

## 1. Lancer le site en local

Prérequis : WAMP démarré (icône verte) et Node.js installé.

```bash
cd F:\wamp64\www\Portfolio
npm install        # la première fois seulement
npm run dev        # puis ouvre http://localhost:5173
```

Le site se recharge tout seul à chaque modification. Les appels à l'API sont redirigés vers WAMP
(`http://localhost/Portfolio/api`).

## 2. Configurer l'espace privé (une seule fois)

Crée ton identifiant et ton mot de passe :

```bash
F:\wamp64\bin\php\php8.3.28\php.exe api\tools\setup.php
```

Le script crée `api/config.local.php` (mot de passe **haché**, jamais en clair). Ce fichier ne doit
jamais être publié : il est exclu par le `.gitignore`. Relance le script pour changer de mot de passe.

Ensuite : lien « Espace privé » en bas de page, ou directement `http://localhost:5173/espace`.

## 3. Modifier le contenu

| Quoi | Où |
|---|---|
| Nom, accroche, email, liens, recherche de stage | `src/data/profil.js` |
| Compétences et niveaux, parcours | `src/data/profil.js` |
| Projets, étude de cas | `src/data/projets.js` |
| Extraits de code de l'étude de cas | `src/data/code/ministages44/*.sql / *.php` |
| Photos des projets | `public/projets/` (puis chemin dans `projets.js`) |
| **Ton CV** | `public/cv/CV_Ugo_Pauvert_Corfmat.pdf` |
| Couleur d'accent, typo | `src/styles/tokens.css` (`--accent`) |

## 4. Mettre le site en ligne sur AlwaysData

### a. Préparer le dossier à envoyer

```bash
npm run build:deploy
```

Un dossier **`deploy/`** apparaît : c'est *exactement* ce qu'il faut mettre en ligne
(le site compilé + `api/` + `data/`).

### b. Créer le site chez AlwaysData

Dans l'administration AlwaysData :

1. **Web → Sites → Ajouter un site**
   - Type : **PHP** (version **8.1 ou plus**)
   - Racine : `/www` (ou le dossier que tu préfères, par ex. `/www/portfolio`)
   - Adresse : ton sous-domaine `xxx.alwaysdata.net`, ou ton nom de domaine.
2. **Envoie le contenu de `deploy/`** dans ce dossier (FTP, SFTP ou SSH).
   Attention : le *contenu* du dossier, pas le dossier `deploy` lui-même.
   L'arborescence sur le serveur doit ressembler à :

   ```
   www/
   ├── index.html      ← le site
   ├── assets/
   ├── .htaccess       ← routage des pages (/projets/…, /espace)
   ├── api/            ← l'API PHP
   └── data/           ← base SQLite + sessions (créées toutes seules)
   ```

3. **Crée ton mot de passe**, en SSH (`ssh xxx@ssh-xxx.alwaysdata.net`) :

   ```bash
   cd ~/www
   php api/tools/setup.php
   ```

4. **Active le HTTPS** (gratuit, dans *Web → Sites → SSL*). C'est indispensable :
   sans lui, ton mot de passe circulerait en clair.

### c. Vérifier

- `https://ton-site/` → le portfolio.
- `https://ton-site/projets/ministages44` → l'étude de cas (si cette page s'affiche,
  le `.htaccess` fonctionne).
- `https://ton-site/espace` → la connexion à l'espace privé.
- Envoie-toi un message depuis le formulaire de contact : il doit apparaître dans l'espace privé.

### d. Pour mettre à jour le site plus tard

Relance `npm run build:deploy` et renvoie le contenu de `deploy/`.
Ne touche pas à `data/` (tes messages sont dedans) ni à `api/config.local.php` (ton mot de passe).

> **Si le CV ne se télécharge pas** : place ton PDF dans `public/cv/CV_Ugo_Pauvert_Corfmat.pdf`
> avant de compiler (voir `public/cv/LISEZ-MOI.txt`).

> **Option plus sûre pour les données** : mets la base hors du dossier web. Ajoute dans
> `api/config.local.php` : `'data_dir' => '/home/TON-COMPTE/prive/portfolio-data',`

## 5. Autres façons de compiler

```bash
npm run build        # version simple pour un serveur : dossier dist/
npm run build:wamp   # version servie par WAMP : http://localhost/Portfolio/
```

## 6. Structure

```
Portfolio/
├── src/                  Site React
│   ├── data/             ← TOUT le contenu du site
│   ├── components/       Navigation, formulaire de contact, blocs de code…
│   ├── pages/            Accueil, page projet, espace privé
│   └── styles/           Couleurs et styles de base
├── public/               Fichiers servis tels quels (CV, images, favicon)
├── api/                  API PHP
│   ├── auth.php          Connexion / déconnexion
│   ├── messages.php      Messages du formulaire de contact
│   ├── config.php        Réglages par défaut
│   ├── _lib/             Code partagé (sessions, sécurité, base)
│   └── tools/setup.php   Création du mot de passe
├── data/                 Base SQLite + sessions (privé, créé automatiquement)
├── scripts/              Préparation du dossier à mettre en ligne
└── ancien/               Ancienne version du portfolio
```

## 7. Sécurité en place

- Mot de passe haché (bcrypt), jamais stocké en clair.
- 5 tentatives de connexion ratées par quart d'heure et par IP, puis blocage.
- Session protégée (cookie `HttpOnly` + `SameSite=Strict`), déconnexion après 2 h d'inactivité.
- Jeton CSRF obligatoire pour toute modification (lecture, suppression d'un message…).
- `data/`, `api/_lib`, `api/tools` et les fichiers de config sont interdits d'accès via Apache.
- Formulaire de contact : piège à robots + 5 messages par heure et par visiteur. Les IP ne sont jamais
  stockées en clair.
