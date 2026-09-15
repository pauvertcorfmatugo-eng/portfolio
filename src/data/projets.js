// ─────────────────────────────────────────────────────────────
//  PROJETS
//  - slug       : identifiant dans l'URL (/projets/<slug>)
//  - lien       : lien GitHub (facultatif)
//  - details    : présentation complète (facultatif). Si présent, le projet
//                 a sa propre page avec sections, photos et extraits de code.
//  - photos     : place les images dans public/projets/ puis écris le chemin,
//                 ex. 'projets/ministages-accueil.jpg'
//  - code       : les extraits sont de vrais fichiers dans src/data/code/
// ─────────────────────────────────────────────────────────────

import comptesDoubles from './code/ministages44/01-comptes-doubles.sql?raw';
import migrationBcrypt from './code/ministages44/02-migration-bcrypt.php?raw';
import connexion from './code/ministages44/03-connexion.php?raw';
import modificationProfil from './code/ministages44/04-modification-profil.php?raw';
import schemaTrigger from './code/ministages44/05-schema-trigger.sql?raw';
import reservation from './code/ministages44/06-reservation.php?raw';

export const projets = [
  {
    slug: 'ministages44',
    titre: 'Stage BTS SIO — Ministages44',
    desc: "Reprise d'une application de réservations de ministages pour les établissements de Loire Atlantique. Développement de nouvelles fonctions, changement du design et de la base de données.",
    tags: ['PHP', 'SQL', 'Bootstrap', 'Agile', 'Git'],
    vedette: true,
    // Résumé affiché sur la carte de la page d'accueil (tiré de la présentation)
    pointsCles: [
      'Mots de passe en clair migrés vers bcrypt',
      'Refonte de la base : table établissement dédiée',
      'Fusion des comptes en double via une requête SQL',
      'Équipe de 3, méthode agile',
    ],
    infos: [
      { label: 'Contexte', valeur: 'Stage de 1ère année de BTS SIO' },
      { label: 'Mon rôle', valeur: 'Base de données & back-end' },
      { label: 'Équipe', valeur: '3 personnes, méthode agile' },
    ],
    details: {
      photos: [
        // 'projets/ministages-1.jpg',
        // 'projets/ministages-2.jpg',
      ],
      sections: [
        {
          titre: 'Le contexte',
          texte:
            "Stage de 1ère année de BTS SIO sur Ministages44, une application déjà existante utilisée par les établissements de l'Académie de Nantes.\n\nLe site permet à un établissement de réserver des créneaux de mini-stages d'observation chez un autre établissement, mais aussi de proposer ses propres créneaux pour accueillir des élèves venant de l'extérieur (journées portes ouvertes, découverte de filières).\n\nNous étions une équipe de trois — Henry (documentation, développement), Mathys (design, développement) et moi (base de données, développement) — en méthode agile, avec des points réguliers auprès des référents pour valider les règles de gestion au fur et à mesure.",
        },
        {
          titre: 'Mon rôle : base de données et back-end',
          texte:
            "J'étais responsable de la base de données et de la partie back-end, ainsi que de la mise en place de l'environnement de travail de l'équipe.\n\nJ'ai configuré le dépôt GitHub privé du projet et rédigé la procédure d'installation pour l'équipe (clonage, jeton d'accès personnel, cycle pull / add / commit / push, résolution des conflits de fusion).\n\nJ'ai aussi ouvert mon serveur WampServer en accès réseau : Henry et Mathys pouvaient travailler directement sur une base commune sans avoir à réinstaller l'environnement chacun de leur côté, et voyaient immédiatement l'effet des modifications.",
        },
        {
          titre: 'Sécurisation des comptes utilisateurs',
          texte:
            "C'était le chantier le plus important. À la reprise du projet, les mots de passe étaient stockés en clair dans la table des utilisateurs.\n\nJ'ai mis en place une chaîne complète :\n\n• hachage bcrypt (password_hash / password_verify) à la création de compte et à chaque modification ;\n• un script de migration exécuté une seule fois pour hacher les mots de passe déjà présents en base, en détectant ceux qui l'étaient déjà ;\n• une politique de mot de passe vérifiée par expression régulière : 8 caractères minimum, une majuscule, une minuscule, un chiffre, un caractère spécial ;\n• un forçage de changement à la connexion pour les comptes existants dont le mot de passe ne respectait pas la règle, avec affichage des critères en direct ;\n• une fonction « mot de passe oublié » qui envoie un lien de réinitialisation à l'adresse officielle de l'établissement via SMTP (PHPMailer).\n\nSur la page profil, le champ mot de passe a été revu : il ne montre plus la valeur existante, reste vide par défaut, et n'est traité que s'il est rempli — sinon les autres informations sont mises à jour sans toucher au mot de passe.",
        },
        {
          titre: 'Le problème des comptes en double',
          texte:
            "En analysant la base, j'ai découvert que certaines personnes possédaient deux comptes : un profil « programmeur » pour créer des stages et un profil « réservation » pour en réserver. La cause : le profil programmeur ne pouvait réserver que ses propres stages.\n\nC'est un cas fréquent en établissement, où le DDFPT assure souvent les deux fonctions.\n\nJ'ai écrit une requête SQL pour identifier tous les cas — même nom et même prénom rattachés à deux profils différents — puis, après validation de la règle de gestion avec les référents, j'ai étendu les droits du profil programmeur pour qu'il puisse réserver sur les stages des autres établissements. Un seul compte suffit désormais.",
        },
        {
          titre: 'Refonte de la base et correction des réservations',
          texte:
            "Les informations d'établissement (nom, RNE, adresse, ville, type, académie) étaient mélangées avec celles des utilisateurs dans une seule table. Je les ai extraites dans une table dédiée, reliée par clé étrangère.\n\nCe changement de structure a cassé plusieurs requêtes de réservation, qui pointaient encore sur les anciennes colonnes. J'ai repris les fichiers concernés — reserver.php, rqtReserver.php et les scripts AJAX de chargement des établissements, formations et mini-stages — pour les adapter aux nouvelles jointures. Problème résolu.\n\nJ'ai également mis en place la génération automatique des identifiants à l'inscription, au format mnstg suivi des quatre derniers caractères du RNE de l'établissement (ex. mnstg329U), pour éviter les doublons et garder une convention lisible.",
        },
        {
          titre: "Ce que j'en retire",
          texte:
            "Travailler sur une application déjà en service change tout : on ne part pas d'une page blanche, il faut comprendre le code des autres avant de le modifier, et chaque changement de base de données a des répercussions en cascade.\n\nLa méthode agile a été utile pour ça : plutôt que de tout figer au départ, on validait les règles de gestion au fil de l'eau avec les référents, ce qui a fait évoluer certaines décisions en cours de route — comme la fusion des profils programmeur et réservation.\n\nLe projet n'est pas terminé. Des chantiers restent ouverts, notamment le contrôle d'accès aux pages d'administration, que j'ai identifié comme insuffisant : les pages vérifient qu'un utilisateur est connecté, mais pas toujours son niveau de droits. La génération des conventions en PDF et la documentation technique des fonctions existantes sont aussi en cours.",
        },
      ],
      code: [
        {
          titre: 'Détection des comptes en double (même personne, deux profils)',
          langage: 'sql',
          contenu: comptesDoubles,
        },
        {
          titre: 'Migration des mots de passe en clair vers bcrypt (script exécuté une seule fois)',
          langage: 'php',
          contenu: migrationBcrypt,
        },
        {
          titre: 'Connexion : vérification bcrypt + forçage si le mot de passe est trop faible',
          langage: 'php',
          contenu: connexion,
        },
        {
          titre: "Modification du profil : le mot de passe n'est traité que s'il est saisi",
          langage: 'php',
          contenu: modificationProfil,
        },
        {
          titre: 'Base de données — stages et réservations, avec trigger de mise à jour des places',
          langage: 'sql',
          contenu: schemaTrigger,
        },
        {
          titre: "Réservation d'un mini-stage (empêche le surbooking)",
          langage: 'php',
          contenu: reservation,
        },
      ],
    },
  },
  {
    slug: 'decap-velo',
    titre: 'Decap Velo (Gestion Cyclisme)',
    desc: 'Application de gestion de clubs et courses cyclistes avec base de données relationnelle.',
    tags: ['PHP', 'SQL', 'Bootstrap'],
    lien: 'https://github.com/pauvertcorfmatugo-eng/Projet-BTS-SIO-Site-de-Gestion-Cyclisme',
  },
  {
    slug: 'cloud-maison',
    titre: 'Cloud Maison',
    desc: "Création et gestion d'un cloud personnel.",
    tags: ['Réseau', 'Hardware'],
  },
];

export const getProjet = (slug) => projets.find((p) => p.slug === slug);
