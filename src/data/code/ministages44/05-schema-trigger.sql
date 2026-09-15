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
