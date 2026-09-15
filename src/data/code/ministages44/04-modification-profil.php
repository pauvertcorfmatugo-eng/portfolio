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
