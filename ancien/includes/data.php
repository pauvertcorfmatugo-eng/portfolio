<?php
$profil = [
    'nom' => 'Ugo Pauvert--Corfmat',
    'titre' => 'Développeur Web & App',
    'accroche' => 'Futur développeur (BTS SIO SLAM), je conçois des applications web et logicielles complètes. Toujours avide de découvrir de nouveaux langages, j\'ai un fort attrait pour l\'optimisation des bases de données et la création d\'architectures backend performantes.',
    'email' => 'pauvertcorfmat.ugo@gmail.com',
    'telephone' => '06 13 32 73 32',
    'localisation' => 'Nantes / Pornic'
];

// Compétences avec niveaux pour les jauges
$competences = [
    'Backend' => [
        ['nom' => 'PHP (Procédural/Objet)', 'niveau' => 80],
        ['nom' => 'C# (Visual Studio)', 'niveau' => 70],
        ['nom' => 'SQL (Avancé)', 'niveau' => 75]
    ],
    'Conception' => [
        ['nom' => 'UML', 'niveau' => 60],
        ['nom' => 'Merise (MCD)', 'niveau' => 65]
    ],
    'Système' => [
        ['nom' => 'Linux / Bash', 'niveau' => 50],
        ['nom' => 'Virtualisation (VM)', 'niveau' => 70],
        ['nom' => 'Hardware / Montage PC', 'niveau' => 90]
    ],
    'Langues' => [
        ['nom' => 'Français', 'niveau' => 100],
        ['nom' => 'Anglais (Intermédiaire)', 'niveau' => 40]
    ]
];

$experiences = [
    [
        'date' => 'Mars 2025 - Actuel',
        'poste' => 'Cuisinier (CDD)',
        'lieu' => 'Restaurant',
        'desc' => 'Préparation des plats et services.'
    ],
    [
        'date' => 'Étés 2023 & 2024',
        'poste' => 'Agent de nettoyage',
        'lieu' => 'Camping des Pierres Couchées',
        'desc' => 'Nettoyage de mobil-homes.'
    ]
];

$projets = [
    [
        'titre' => 'Decap Velo (Gestion Cyclisme)',
        'desc' => 'Application de gestion de clubs et courses cyclistes avec base de données relationnelle.',
        'tags' => ['PHP', 'SQL', 'Bootstrap'],
        // AJOUTE CETTE LIGNE AVEC TON VRAI LIEN GITHUB :
        'lien' => 'https://github.com/pauvertcorfmatugo-eng/Projet-BTS-SIO-Site-de-Gestion-Cyclisme' 
    ],
    [
        'titre' => 'Cloud Maison',
        'desc' => 'Création et gestion d\'un cloud personnel.',
        'tags' => ['Réseau', 'Hardware']
        // Si un projet n'a pas de lien, tu ne mets rien ici !
    ],
    [
        'titre' => 'Stage BTS SIO — Ministages44',
        'desc' => 'Reprise d\'une application de réservations de ministages pour les établissements de Loire Atlantique. Développement de nouvelles fonctions, changement du design et de la base de données.',
        'tags' => ['PHP', 'SQL', 'Bootstrap', 'Agile', 'Git'],

        // Tout ce qui est dans "details" s'affiche dans la fenêtre qui s'ouvre
        // quand on clique sur "Voir la présentation".
        'details' => [

            // Mets ici les chemins de tes photos (captures d'écran du site,
            // schéma de la base, photo de l'équipe...). Place les fichiers
            // dans asset/img/ puis écris leur nom ici.
            // Exemple : 'asset/img/stage-1.jpg'
            'photos' => [
                // 'asset/img/stage-1.jpg',
                // 'asset/img/stage-2.jpg',
            ],

            'sections' => [
                [
                    'titre' => 'Le contexte',
                    'texte' => "Stage de 1ère année de BTS SIO sur Ministages44, une application déjà existante utilisée par les établissements de l'Académie de Nantes.\n\nLe site permet à un établissement de réserver des créneaux de mini-stages d'observation chez un autre établissement, mais aussi de proposer ses propres créneaux pour accueillir des élèves venant de l'extérieur (journées portes ouvertes, découverte de filières).\n\nNous étions une équipe de trois — Henry (documentation, développement), Mathys (design, développement) et moi (base de données, développement) — en méthode agile, avec des points réguliers auprès des référents pour valider les règles de gestion au fur et à mesure."
                ],
                [
                    'titre' => 'Mon rôle : base de données et back-end',
                    'texte' => "J'étais responsable de la base de données et de la partie back-end, ainsi que de la mise en place de l'environnement de travail de l'équipe.\n\nJ'ai configuré le dépôt GitHub privé du projet et rédigé la procédure d'installation pour l'équipe (clonage, jeton d'accès personnel, cycle pull / add / commit / push, résolution des conflits de fusion).\n\nJ'ai aussi ouvert mon serveur WampServer en accès réseau : Henry et Mathys pouvaient travailler directement sur une base commune sans avoir à réinstaller l'environnement chacun de leur côté, et voyaient immédiatement l'effet des modifications."
                ],
                [
                    'titre' => 'Sécurisation des comptes utilisateurs',
                    'texte' => "C'était le chantier le plus important. À la reprise du projet, les mots de passe étaient stockés en clair dans la table des utilisateurs.\n\nJ'ai mis en place une chaîne complète :\n\n• hachage bcrypt (password_hash / password_verify) à la création de compte et à chaque modification ;\n• un script de migration exécuté une seule fois pour hacher les mots de passe déjà présents en base, en détectant ceux qui l'étaient déjà ;\n• une politique de mot de passe vérifiée par expression régulière : 8 caractères minimum, une majuscule, une minuscule, un chiffre, un caractère spécial ;\n• un forçage de changement à la connexion pour les comptes existants dont le mot de passe ne respectait pas la règle, avec affichage des critères en direct ;\n• une fonction « mot de passe oublié » qui envoie un lien de réinitialisation à l'adresse officielle de l'établissement via SMTP (PHPMailer).\n\nSur la page profil, le champ mot de passe a été revu : il ne montre plus la valeur existante, reste vide par défaut, et n'est traité que s'il est rempli — sinon les autres informations sont mises à jour sans toucher au mot de passe."
                ],
                [
                    'titre' => 'Le problème des comptes en double',
                    'texte' => "En analysant la base, j'ai découvert que certaines personnes possédaient deux comptes : un profil « programmeur » pour créer des stages et un profil « réservation » pour en réserver. La cause : le profil programmeur ne pouvait réserver que ses propres stages.\n\nC'est un cas fréquent en établissement, où le DDFPT assure souvent les deux fonctions.\n\nJ'ai écrit une requête SQL pour identifier tous les cas — même nom et même prénom rattachés à deux profils différents — puis, après validation de la règle de gestion avec les référents, j'ai étendu les droits du profil programmeur pour qu'il puisse réserver sur les stages des autres établissements. Un seul compte suffit désormais."
                ],
                [
                    'titre' => 'Refonte de la base et correction des réservations',
                    'texte' => "Les informations d'établissement (nom, RNE, adresse, ville, type, académie) étaient mélangées avec celles des utilisateurs dans une seule table. Je les ai extraites dans une table dédiée, reliée par clé étrangère.\n\nCe changement de structure a cassé plusieurs requêtes de réservation, qui pointaient encore sur les anciennes colonnes. J'ai repris les fichiers concernés — reserver.php, rqtReserver.php et les scripts AJAX de chargement des établissements, formations et mini-stages — pour les adapter aux nouvelles jointures. Problème résolu.\n\nJ'ai également mis en place la génération automatique des identifiants à l'inscription, au format mnstg suivi des quatre derniers caractères du RNE de l'établissement (ex. mnstg329U), pour éviter les doublons et garder une convention lisible."
                ],
                [
                    'titre' => 'Ce que j\'en retire',
                    'texte' => "Travailler sur une application déjà en service change tout : on ne part pas d'une page blanche, il faut comprendre le code des autres avant de le modifier, et chaque changement de base de données a des répercussions en cascade.\n\nLa méthode agile a été utile pour ça : plutôt que de tout figer au départ, on validait les règles de gestion au fil de l'eau avec les référents, ce qui a fait évoluer certaines décisions en cours de route — comme la fusion des profils programmeur et réservation.\n\nLe projet n'est pas terminé. Des chantiers restent ouverts, notamment le contrôle d'accès aux pages d'administration, que j'ai identifié comme insuffisant : les pages vérifient qu'un utilisateur est connecté, mais pas toujours son niveau de droits. La génération des conventions en PDF et la documentation technique des fonctions existantes sont aussi en cours."
                ],
            ],

            'code' => [
                [
                    'titre' => 'Détection des comptes en double (même personne, deux profils)',
                    'langage' => 'sql',
                    'contenu' => <<<'SQL'
-- Repère les utilisateurs présents deux fois sous deux profils
-- différents : profil 2 (programmeur) et profil 4 (réservation).
-- Ce diagnostic a servi de base à la fusion des deux profils.
SELECT u.identifiant, u.nom, u.prenom,
       p.nom AS profil, f.nom AS fonction,
       e.nom AS nometab, e.ville, u.RNE
FROM t_utilisateur AS u
INNER JOIN t_profil        AS p ON u.idprofil  = p.id
LEFT  JOIN t_fonction      AS f ON u.idfonction = f.id
LEFT  JOIN t_etablissement AS e ON u.id_etablissement = e.id
WHERE (u.nom, u.prenom) IN (
        SELECT nom, prenom
        FROM t_utilisateur
        WHERE idprofil IN (2, 4)
        GROUP BY nom, prenom
        HAVING COUNT(DISTINCT idprofil) = 2
      )
ORDER BY u.nom, u.prenom, u.idprofil;
SQL
                ],
                [
                    'titre' => 'Migration des mots de passe en clair vers bcrypt (script exécuté une seule fois)',
                    'langage' => 'php',
                    'contenu' => <<<'PHP'
// Les mots de passe existants étaient stockés en clair en base.
// Ce script les hache sans toucher à ceux déjà sécurisés.
set_time_limit(600); // grosse base : on évite la coupure
require_once("Class/Connexion.class.php");

$result = $mysqli->query("SELECT id, mdp FROM t_utilisateur");
$count = 0; $ignore = 0;

while ($row = $result->fetch_assoc()) {
    // Un hash bcrypt commence toujours par $2y$ : on le saute
    if (strpos($row['mdp'], '$2y$') === 0) {
        $ignore++;
        continue;
    }

    $nouveau_hash = password_hash($row['mdp'], PASSWORD_BCRYPT);

    $stmt = $mysqli->prepare("UPDATE t_utilisateur SET mdp = ? WHERE id = ?");
    $stmt->bind_param("si", $nouveau_hash, $row['id']);
    $stmt->execute();
    $stmt->close();
    $count++;
}

echo "Mots de passe hachés : $count — déjà sécurisés : $ignore";
PHP
                ],
                [
                    'titre' => 'Connexion : vérification bcrypt + forçage si le mot de passe est trop faible',
                    'langage' => 'php',
                    'contenu' => <<<'PHP'
// Requête préparée : protection contre l'injection SQL
$stmt = $mysqli->prepare("SELECT u.*, e.nom AS nometab, e.ville
        FROM t_utilisateur u
        LEFT JOIN t_etablissement e ON u.rattacher = e.id
        WHERE u.identifiant = ?");
$stmt->bind_param("s", $Pseudo);
$stmt->execute();
$Utilisateur = $stmt->get_result()->fetch_assoc();

// On compare le mot de passe saisi au hash stocké
if (!password_verify($MotDePasse, $Utilisateur['mdp'])) {
    echo "<script>alert('Identifiant ou mot de passe incorrect');
          document.location.href='index.php';</script>";
    exit;
}

// Comptes anciens : mot de passe valide mais ne respectant pas
// la nouvelle politique -> on force le changement avant d'entrer
// 8 caractères min, 1 minuscule, 1 majuscule, 1 chiffre, 1 spécial
if (!preg_match("/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/", $MotDePasse)) {
    $_SESSION['IdUtilisateur']  = $Utilisateur['id'];
    $_SESSION['ForceChangeMDP'] = true;
    header('Location: force_changement_mdp.php');
    exit;
}

// Profil conservé en session : pilote l'affichage du menu
// et l'accès aux pages selon le rôle
$_SESSION['IdProfil'] = $Utilisateur['idprofil'];
PHP
                ],
                [
                    'titre' => 'Modification du profil : le mot de passe n\'est traité que s\'il est saisi',
                    'langage' => 'php',
                    'contenu' => <<<'PHP'
function updateProfil(){
    global $mysqli;

    // Champ laissé vide -> on met à jour le reste sans toucher au mot de passe
    if (!empty($_POST['mdp'])) {

        // Même règle que partout ailleurs dans l'application
        if (!preg_match("/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/", $_POST['mdp'])) {
            return "erreur_regex"; // déclenche la fenêtre d'alerte côté client
        }

        $nouveau_mdp = password_hash($_POST['mdp'], PASSWORD_BCRYPT);

        rajouterHistorique("modification profil : ".$_SESSION['IdUtilisateur']);

        $rqt = 'UPDATE t_utilisateur SET mdp="'.$nouveau_mdp.'", ...
                WHERE id='.$_SESSION['IdUtilisateur'];
    } else {
        rajouterHistorique("modification profil : ".$_SESSION['IdUtilisateur']);
        $rqt = 'UPDATE t_utilisateur SET nom=..., prenom=..., mail=..., tel=...
                WHERE id='.$_SESSION['IdUtilisateur'];
    }

    mysqli_query($mysqli, $rqt) or exit(mysqli_error($mysqli));
    return "ok";
}
PHP
                ],
                [
                    'titre' => 'Base de données — stages et réservations, avec trigger de mise à jour des places',
                    'langage' => 'sql',
                    'contenu' => <<<'SQL'
CREATE TABLE `t_ministage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idOffrant` int NOT NULL,
  `idformation` int NOT NULL,
  `date` date NOT NULL,
  `hdebut` varchar(5) NOT NULL,
  `hfin` varchar(5) NOT NULL,
  `nbplace` int NOT NULL,
  `nbplacereste` int NOT NULL,
  `lieu` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `t_reservation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idmini` int NOT NULL,
  `nom` varchar(30) NOT NULL,
  `prenom` varchar(30) NOT NULL,
  `idReservant` int NOT NULL,
  `confirmation` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_ReservationToMinistage`
    FOREIGN KEY (`idmini`) REFERENCES `t_ministage` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Trigger : à chaque nouvelle réservation, on décrémente
-- automatiquement le nombre de places restantes du stage
CREATE TRIGGER `after_insert_reserv` AFTER INSERT ON `t_reservation`
FOR EACH ROW
    UPDATE t_ministage
    SET nbplacereste = nbplacereste - 1
    WHERE id = (SELECT idmini FROM t_reservation WHERE id = NEW.id);
SQL
                ],
                [
                    'titre' => 'Réservation d\'un mini-stage (empêche le surbooking)',
                    'langage' => 'php',
                    'contenu' => <<<'PHP'
function insertMinistage(){
    global $mysqli;
    $idMini = (int)$_POST['mini'];

    // On vérifie qu'il reste de la place avant de valider
    $rqtVerif = 'SELECT m.nbplace,
                 (SELECT COUNT(*) FROM t_reservation r WHERE r.idmini = m.id) AS inscrits
                 FROM t_ministage m WHERE m.id = ' . $idMini;
    $resVerif = mysqli_query($mysqli, $rqtVerif) or exit(mysqli_error($mysqli));
    $verif = mysqli_fetch_assoc($resVerif);

    if ($verif['inscrits'] >= $verif['nbplace']) {
        return ['erreur' => 'Oh non ! Ce stage est déjà tout plein !'];
    }

    rajouterHistorique("ajout reservation : " . $idMini);

    $rqt = 'INSERT INTO t_reservation (idmini, nom, prenom, idReservant, confirmation, rappel, absence)
            VALUES (' . $idMini . ', "' . $_POST['nom'] . '", "' . $_POST['prenom'] . '", '
            . $_SESSION['IdUtilisateur'] . ', 0, 0, 0)';
    mysqli_query($mysqli, $rqt) or exit(mysqli_error($mysqli));

    // Le trigger SQL se charge de mettre à jour nbplacereste automatiquement
}
PHP
                ],
            ],
        ],
    ]
];
?>