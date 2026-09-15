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

**Tu n'as pas besoin de ton ordinateur.** AlwaysData fournit Node.js et PHP en SSH :
tout se fait sur le serveur, depuis n'importe quel navigateur ou terminal.

Dans tout ce qui suit, remplace `COMPTE` par le nom de ton compte AlwaysData.

| Étape | Où ça se passe |
|---|---|
| 1. Créer le site | Interface web d'AlwaysData (`admin.alwaysdata.com`) |
| 2. Activer SSH | Interface web d'AlwaysData |
| 3 à 6. Le reste | En SSH, sur le serveur |

---

### Étape 1 — Créer le site

Dans `admin.alwaysdata.com` → **Web → Sites → Ajouter un site** :

- **Adresses** : `COMPTE.alwaysdata.net` (ou ton nom de domaine)
- **Type** : **PHP**, version **8.1 ou plus**
- **Répertoire racine** : `/www`

Fais-le maintenant, même si le dossier est encore vide : dès que l'adresse est
enregistrée, AlwaysData commence à générer tout seul le certificat HTTPS
(Let's Encrypt). Il n'y a rien à acheter ni à installer.

### Étape 2 — Trouver ton nom d'utilisateur et activer SSH

Ton **nom d'utilisateur SSH est le nom de ton compte AlwaysData** : à la création
du compte, un utilisateur portant ce nom est créé automatiquement. Ce n'est ni ton
adresse email, ni ton identifiant GitHub.

Trois façons de le retrouver :

- Dans **Environnement → Utilisateurs** (ou **Accès distant → SSH** selon la version
  de l'interface) : l'utilisateur listé, c'est lui.
- Dans l'adresse du site créée à l'étape 1 : `COMPTE.alwaysdata.net` → `COMPTE` est
  ton nom de compte.
- Dans l'email de bienvenue reçu à l'inscription.

Sur cette même page **Environnement → Utilisateurs**, modifie l'utilisateur pour
**activer la connexion par mot de passe** : l'accès SSH est désactivé par défaut,
et tant qu'il ne l'est pas, la connexion sera refusée même avec le bon nom.

Profites-en pour **définir (ou redéfinir) le mot de passe de cet utilisateur Unix** :
ce n'est pas celui de l'interface d'administration, c'est un mot de passe distinct.

### Étape 3 — Se connecter et récupérer le code

```bash
ssh COMPTE@ssh-COMPTE.alwaysdata.net
```

Le `COMPTE` est le même des deux côtés du `@`.

> **Pas de client SSH sous la main** (téléphone, ordinateur prêté) ? AlwaysData
> propose un terminal dans le navigateur à l'adresse `https://ssh-COMPTE.alwaysdata.net`.
> Leur propre documentation le décrit comme lent et peu fiable, mais il dépanne.

Une fois connecté, le dépôt est **privé**, donc il faut s'authentifier. Le plus
simple est de mettre le jeton directement dans l'adresse : git ne demande alors
plus rien.

```bash
cd ~
git clone https://JETON@github.com/pauvertcorfmatugo-eng/portfolio.git
cd portfolio
```

Remplace `JETON` par le jeton d'accès personnel créé sur GitHub (il commence par
`ghp_` ou `github_pat_`). Il doit donner le droit de **lecture sur ce dépôt** : un
jeton *fine-grained* limité à `portfolio` avec « Contents : Read-only » suffit, un
jeton *classic* avec la case `repo` aussi.

> **Si tu préfères la méthode interactive** (`git clone https://github.com/...`),
> git pose deux questions :
> - `Username for 'https://github.com'` → **`pauvertcorfmatugo-eng`**, ton identifiant
>   GitHub. Ni ton email, ni ton nom d'utilisateur AlwaysData.
> - `Password for ...` → **le jeton**, pas ton mot de passe GitHub. Rien ne s'affiche
>   pendant que tu le colles, c'est normal : tape puis valide.
>
> À savoir : d'après la documentation GitHub, l'identifiant demandé n'est pas utilisé
> pour t'authentifier — **seul le jeton compte**. Git exige qu'un identifiant soit saisi,
> mais si tu te trompes dessus et que le jeton est bon, la connexion passe quand même.
> Autrement dit, le seul vrai risque d'échec ici, c'est le jeton ou ses droits.

> **Le jeton reste enregistré** dans `~/portfolio/.git/config` sur le serveur, en clair.
> Sur ton propre hébergement avec un jeton en lecture seule limité à ce dépôt, c'est
> acceptable — et c'est ce qui permet aux `git pull` suivants de ne rien redemander.
> Pour l'effacer une fois le site en ligne :
>
> ```bash
> git -C ~/portfolio remote set-url origin https://github.com/pauvertcorfmatugo-eng/portfolio.git
> ```
>
> Les mises à jour redemanderont alors identifiant et jeton à chaque fois.

> Alternative sans jeton du tout : passer le dépôt en public dans les réglages GitHub,
> et le `git clone` ne demandera plus rien.

### Étape 4 — Compiler le site

```bash
export NODEJS_VERSION=22
npm install
npm run build:deploy
```

`npm install` prend une minute ou deux. À la fin, tu dois lire
« ✔ Dossier « deploy/ » prêt. ».

### Étape 5 — Installer le site dans `www/`

```bash
cp -r ~/portfolio/deploy/. ~/www/
ls ~/www
```

Tu dois voir : `index.html`, `assets`, `api`, `data`, `.htaccess`.

### Étape 6 — Créer ton mot de passe

```bash
cd ~/www
php api/tools/setup.php
```

Le script demande un identifiant et un mot de passe (12 caractères minimum) et
crée `api/config.local.php`. C'est ce mot de passe qui protège `/espace`.

### Vérifier que tout marche

Ouvre dans le navigateur :

| Adresse | Ce que tu dois voir |
|---|---|
| `https://COMPTE.alwaysdata.net/` | Le portfolio |
| `https://COMPTE.alwaysdata.net/projets/ministages44` | L'étude de cas — si cette page s'affiche, le `.htaccess` fonctionne |
| `https://COMPTE.alwaysdata.net/espace` | L'écran de connexion |

Puis envoie-toi un message depuis le formulaire de contact : il doit apparaître
dans `/espace` après connexion.

### Ton CV

Le PDF n'est pas dans le dépôt. Envoie-le directement à cet emplacement (par SFTP,
ou depuis l'interface **Fichiers** d'AlwaysData) :

```
~/www/cv/CV_Ugo_Pauvert_Corfmat.pdf
```

Pas besoin de recompiler : le bouton « Télécharger le CV » pointe déjà là.

### Mettre à jour le site plus tard

```bash
cd ~/portfolio
git pull
export NODEJS_VERSION=22
npm run build:deploy
cp -r ~/portfolio/deploy/. ~/www/
```

`cp` écrase les fichiers du site mais **ne touche ni à `data/`** (tes messages sont
dedans) **ni à `api/config.local.php`** (ton mot de passe) : ces deux-là ne sont pas
dans `deploy/`.

### Si ça coince

| Symptôme | À faire |
|---|---|
| `Permission denied` à la connexion SSH | Trois causes possibles, dans cet ordre : la connexion par mot de passe n'est pas activée sur l'utilisateur (étape 2) ; le mot de passe Unix n'a jamais été défini (il est distinct de celui de l'interface d'administration) ; le nom d'utilisateur n'est pas le nom du compte. |
| `Could not resolve hostname` | L'adresse est `ssh-COMPTE.alwaysdata.net`, avec le préfixe `ssh-`. Le nom de compte est identique des deux côtés du `@`. |
| `Authentication failed` au `git clone` | Le mot de passe demandé par git est le **jeton** GitHub, pas le mot de passe du compte GitHub. L'identifiant est `pauvertcorfmatugo-eng`. |
| La page d'accueil marche, mais `/projets/...` renvoie une erreur 404 | Vérifie que `~/www/.htaccess` existe (`ls -a ~/www`). C'est un fichier caché, beaucoup de clients FTP ne le copient pas. |
| `/espace` affiche « API injoignable » | Vérifie que `~/www/api/` est bien là et que le type du site est **PHP**, pas « Fichiers statiques ». |
| Erreur du serveur à l'envoi d'un message | La base SQLite manque peut-être : `php -m \| grep -i sqlite` doit afficher `pdo_sqlite`. Vérifie aussi que `~/www/data/` est accessible en écriture. |
| `npm: command not found` | Refais `export NODEJS_VERSION=22` : la variable est perdue à chaque nouvelle connexion SSH. |

### Optionnel, plus sûr : les données hors du dossier web

Par défaut la base est dans `~/www/data/`, protégée par un `.htaccess`. Pour la
mettre carrément hors de portée du web :

```bash
mkdir -p ~/prive/portfolio-data
```

puis ajoute cette ligne dans `~/www/api/config.local.php`, avant le `);` final :

```php
  'data_dir' => '/home/COMPTE/prive/portfolio-data',
```

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
