<?php 
require_once 'includes/data.php'; 
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio | <?= $profil['nom'] ?></title>
    
    <link rel="stylesheet" href="asset/css/variables.css">
    <link rel="stylesheet" href="asset/css/global.css">
    <link rel="stylesheet" href="asset/components/nav.css">
    <link rel="stylesheet" href="asset/components/hero.css">
    <link rel="stylesheet" href="asset/components/projects.css">
    <link rel="stylesheet" href="asset/components/timeline.css">
    <link rel="stylesheet" href="asset/components/project-modal.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
</head>
<body>

    <div class="bg-animation">
        <div id="orb1" class="orb"></div>
        <div id="orb2" class="orb"></div>
    </div>

    <nav class="glass-nav">
        <div class="logo">Ugo.PC</div>
        <ul class="nav-links">
            <li><a href="#accueil">Accueil</a></li>
            <li><a href="#competences">Compétences</a></li>
            <li><a href="#parcours">Parcours</a></li>
            <li><a href="#projets">Projets</a></li>
            <li><button id="theme-toggle" class="theme-btn"><i class="fas fa-moon"></i></button></li>
        </ul>
    </nav>

    <section id="accueil" class="section hero">
        <div class="container reveal">
            <h1><?= $profil['nom'] ?></h1>
            <h2 class="gradient-text"><?= $profil['titre'] ?></h2>
            <p class="bio"><?= $profil['accroche'] ?></p>
            
            <div class="hero-buttons">
                <button id="open-contact" class="btn-primary">Me contacter</button>
                <a href="asset/img/CV_Ugo_Pauvert_Corfmat.pdf" download class="btn-secondary">
                    <i class="fas fa-download"></i> Télécharger CV
                </a>
            </div>
        </div>
    </section>

    <section id="competences" class="section">
        <div class="container reveal">
            <h3 class="section-title">Compétences</h3>
            <div class="grid-3">
                <?php foreach($competences as $domaine => $skills): ?>
                    <div class="card glass">
                        <h4><?= $domaine ?></h4>
                        <div class="skills-wrapper">
                            <?php foreach($skills as $skill): ?>
                                <div class="skill-item">
                                    <div class="skill-info">
                                        <span class="skill-name"><?= $skill['nom'] ?></span>
                                        <span class="skill-percentage"><?= $skill['niveau'] ?>%</span>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: <?= $skill['niveau'] ?>%;"></div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <section id="parcours" class="section">
        <div class="container reveal">
            <h3 class="section-title">Parcours</h3>
            <div class="timeline">
                <div class="timeline-item glass">
                    <span class="date">2023 - 2025</span>
                    <h4>BTS SIO (Option SLAM)</h4>
                    <span class="place">Lycée Carcouët, Nantes</span>
                    <p>Développement d'applications et web.</p>
                </div>

                <?php foreach($experiences as $exp): ?>
                <div class="timeline-item glass">
                    <span class="date"><?= $exp['date'] ?></span>
                    <h4><?= $exp['poste'] ?></h4>
                    <span class="place"><?= $exp['lieu'] ?></span>
                    <p><?= $exp['desc'] ?></p>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <section id="projets" class="section">
        <div class="container reveal">
            <h3 class="section-title">Projets</h3>
            <div class="grid-2">
                <?php foreach($projets as $i => $projet): ?>
                    <div class="card glass">
                        <h4><?= $projet['titre'] ?></h4>
                        <p><?= $projet['desc'] ?></p>
    
                        <div class="tags-container">
                            <?php foreach($projet['tags'] as $tag): ?>
                                <span class="tag"><?= $tag ?></span>
                            <?php endforeach; ?>
                        </div>

                        <?php if(isset($projet['lien'])): ?>
                            <a href="<?= $projet['lien'] ?>" target="_blank" class="btn-projet-link">
                                <i class="fab fa-github"></i> Voir le code
                            </a>
                        <?php endif; ?>

                        <?php if(isset($projet['details'])): ?>
                            <button type="button" class="btn-projet-link btn-projet-detail" data-project-index="<?= $i ?>">
                                <i class="fas fa-arrow-up-right-from-square"></i> Voir la présentation
                            </button>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <div id="contact-modal" class="modal-overlay">
        <div class="modal-content glass">
            <button id="close-modal" class="close-btn">&times;</button>
            <h3>Restons en contact</h3>
            <p>Retrouvez-moi sur les plateformes suivantes :</p>
            <div class="social-links">
                <a href="mailto:<?= $profil['email'] ?>" class="social-btn gmail"><i class="fas fa-envelope"></i> Gmail</a>
                <a href="https://www.linkedin.com/in/ugo-pauvert-corfmat-93299a39b/" target="_blank" class="social-btn linkedin"><i class="fab fa-linkedin-in"></i> LinkedIn</a>
                <a href="https://github.com/pauvertcorfmatugo-eng" target="_blank" class="social-btn github"><i class="fab fa-github"></i> GitHub</a>
            </div>
        </div>
    </div>

    <div id="project-modal" class="modal-overlay project-modal-overlay">
        <div class="modal-content glass project-modal-content">
            <button id="close-project-modal" class="close-btn">&times;</button>
            <div id="project-modal-body">
                <!-- Rempli automatiquement en JavaScript -->
            </div>
        </div>
    </div>

    <div id="photo-lightbox" class="photo-lightbox-overlay">
        <button id="close-lightbox" class="close-btn">&times;</button>
        <img id="lightbox-img" src="" alt="Aperçu photo">
    </div>

    <footer>
        <p>&copy; 2026 Ugo Pauvert--Corfmat</p>
    </footer>

    <script>
        // JSON_HEX_TAG : indispensable car certains extraits de code contiennent
        // une balise de fermeture <\/script>, qui fermerait cette balise trop tôt sans échappement.
        const projectsData = <?= json_encode($projets, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script src="asset/js/script.js"></script>
</body>
</html>