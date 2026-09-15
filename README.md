# Portfolio — Ugo Pauvert--Corfmat

Portfolio en **React** (Vite) avec une petite **API PHP** pour l'espace privé.

- **Site public** : profil, compétences, projets (avec étude de cas détaillée), parcours, contact.
- **Assistant (chat)** : répond automatiquement aux questions des visiteurs à partir du contenu du site.
  S'il ne sait pas répondre, il propose de t'envoyer un message.
- **Espace privé** (`/espace`) : ton cloud personnel (fichiers) + les messages reçus. Protégé par mot de passe.

L'ancienne version PHP est conservée dans [`ancien/`](ancien/).

---

## 1. Lancer le site en local

Prérequis : WAMP démarré (icône verte) et Node.js installé.

> Node.js vient d'être installé : ouvre un **nouveau** terminal pour que la commande `npm` soit reconnue.

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
| Réponses de l'assistant | `src/components/chat/brain.js` |

L'assistant lit directement `profil.js` et `projets.js` : si tu modifies ton contenu, ses réponses suivent.

## 4. Version compilée

```bash
npm run build:wamp   # version servie par WAMP : http://localhost/Portfolio/
npm run build        # version pour un serveur (VPS) : dossier dist/
```

## 5. Structure

```
Portfolio/
├── src/                  Site React
│   ├── data/             ← TOUT le contenu du site
│   ├── components/       Navigation, chat, blocs de code…
│   ├── pages/            Accueil, page projet, espace privé
│   └── styles/           Couleurs et styles de base
├── public/               Fichiers servis tels quels (CV, images, favicon)
├── api/                  API PHP
│   ├── auth.php          Connexion / déconnexion
│   ├── files.php         Cloud : lister, envoyer, télécharger, renommer, supprimer
│   ├── messages.php      Messages du formulaire et du chat
│   ├── config.php        Réglages par défaut
│   ├── _lib/             Code partagé (sessions, sécurité, stockage)
│   └── tools/setup.php   Création du mot de passe
├── data/                 Base SQLite + sessions (privé, créé automatiquement)
├── storage/              Fichiers du cloud par défaut (privé)
└── ancien/               Ancienne version du portfolio
```

## 6. Sécurité en place

- Mot de passe haché (bcrypt), jamais stocké en clair.
- 5 tentatives de connexion ratées par quart d'heure et par IP, puis blocage.
- Session protégée (cookie `HttpOnly` + `SameSite=Strict`), déconnexion après 2 h d'inactivité.
- Jeton CSRF obligatoire pour toute modification (envoi, suppression…).
- Impossible de sortir du dossier de stockage (`../` refusé, liens symboliques vérifiés).
- `data/`, `storage/`, `api/_lib`, `api/tools` et les fichiers de config sont interdits d'accès via Apache.
- Les aperçus de fichiers ne peuvent pas exécuter de script (texte servi en `text/plain`, CSP `sandbox`).
- Formulaire de contact : piège à robots + 5 messages par heure et par visiteur. Les IP ne sont jamais
  stockées en clair.

## 7. Plus tard : accéder à ton cloud depuis l'extérieur

Deux approches, selon ce que tu veux :

**Option A — un VPS** (serveur loué, ~4 à 6 €/mois : OVH, Hetzner, Scaleway…)
- Le portfolio est en ligne 24 h/24 avec une vraie adresse (nom de domaine ~10 €/an).
- Installe Debian + Nginx (ou Apache) + PHP 8.3, puis copie `dist/` + `api/` dans le dossier web.
- Mets `storage_dir` et `data_dir` **en dehors** du dossier web (ex. `/srv/portfolio/storage`).
- **HTTPS obligatoire** (gratuit avec Let's Encrypt / `certbot`) : sans lui, ton mot de passe passerait en clair.
- Pense à augmenter `post_max_size` dans `php.ini` (ex. `64M`) : les envois seront plus rapides.
- Limite : l'espace disque d'un VPS est souvent petit (40 à 80 Go).

**Option B — un NAS / PC chez toi** (beaucoup de stockage, pas d'abonnement)
- Le cloud tourne chez toi : WAMP (ou Linux + Apache/PHP) sur une machine allumée en permanence.
- `storage_dir` peut pointer vers le disque du NAS.
- Pour y accéder depuis l'extérieur **sans ouvrir de port sur ta box**, le plus simple et le plus sûr :
  - **Tailscale** (VPN gratuit) : seul toi y accèdes, depuis tes appareils. Idéal pour un cloud perso.
  - **Cloudflare Tunnel** (gratuit, avec un nom de domaine) : accès public en HTTPS. Mets alors
    `'trust_proxy' => true` dans `api/config.local.php`.
- Évite d'ouvrir directement les ports 80/443 de ta box vers WAMP : WAMP n'est pas fait pour être exposé
  sur Internet.

**Combo courant** : portfolio public sur un VPS (ou hébergement gratuit type Netlify pour la partie React),
et cloud chez toi accessible via Tailscale. Dans ce cas, le chat et le formulaire de contact passent par
l'API du VPS.
