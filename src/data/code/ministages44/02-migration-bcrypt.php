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
