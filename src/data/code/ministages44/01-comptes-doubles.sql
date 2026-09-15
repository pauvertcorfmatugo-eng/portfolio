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
