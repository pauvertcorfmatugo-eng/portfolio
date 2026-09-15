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
