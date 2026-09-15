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
