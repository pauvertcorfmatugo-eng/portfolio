document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ANIMATION SCROLL ---
    // IntersectionObserver plutôt qu'un calcul manuel sur "scroll" : ça évite de dépendre
    // de window.innerHeight au moment du chargement (pas encore fiable juste après le DOM ready)
    // et ça active directement les sections déjà visibles à l'ouverture de la page.
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    reveals.forEach((reveal) => revealObserver.observe(reveal));

    // --- 2. GESTION DU THEME (Clair par défaut) ---
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = themeBtn.querySelector('i');
    const body = document.body;

    // Si l'utilisateur avait mis "dark" avant
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.add('fa-moon'); // Défaut
    }

    themeBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        if (body.classList.contains('dark-mode')) {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });

    // --- 3. MODAL CONTACT ---
    const openBtn = document.getElementById('open-contact');
    const closeBtn = document.getElementById('close-modal');
    const modal = document.getElementById('contact-modal');

    if(openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('open');
        });
    }

    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('open');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('open');
        }
    });

    // --- 4. MODAL PRÉSENTATION DE PROJET (photos, texte, code) ---
    const projectModal = document.getElementById('project-modal');
    const projectModalBody = document.getElementById('project-modal-body');
    const closeProjectModal = document.getElementById('close-project-modal');

    const escapeHtml = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    const renderProjectModal = (projet) => {
        const details = projet.details || {};
        let html = `<h3>${escapeHtml(projet.titre)}</h3>`;

        if (details.photos && details.photos.length) {
            html += '<div class="pm-photos">';
            details.photos.forEach((src) => {
                html += `<img src="${src}" alt="${escapeHtml(projet.titre)}" class="pm-photo">`;
            });
            html += '</div>';
        }

        if (details.sections && details.sections.length) {
            details.sections.forEach((sec) => {
                html += `<div class="pm-section"><h4>${escapeHtml(sec.titre)}</h4><p>${escapeHtml(sec.texte)}</p></div>`;
            });
        }

        if (details.code && details.code.length) {
            details.code.forEach((bloc) => {
                html += '<div class="pm-code-block">';
                if (bloc.titre) html += `<div class="pm-code-title">${escapeHtml(bloc.titre)}</div>`;
                html += `<pre class="pm-code"><code class="language-${bloc.langage || 'plaintext'}">${escapeHtml(bloc.contenu || '')}</code></pre>`;
                html += '</div>';
            });
        }

        if (!details.photos?.length && !details.sections?.length && !details.code?.length) {
            html += '<p class="pm-empty">Contenu à venir...</p>';
        }

        projectModalBody.innerHTML = html;

        // Coloration syntaxique si highlight.js est chargé
        if (window.hljs) {
            projectModalBody.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));
        }

        // Ouverture des photos en grand
        projectModalBody.querySelectorAll('.pm-photo').forEach((img) => {
            img.addEventListener('click', () => openLightbox(img.src));
        });
    };

    document.querySelectorAll('.btn-projet-detail').forEach((btn) => {
        btn.addEventListener('click', () => {
            const projet = projectsData[btn.dataset.projectIndex];
            if (projet) {
                renderProjectModal(projet);
                projectModal.classList.add('open');
            }
        });
    });

    if (closeProjectModal) {
        closeProjectModal.addEventListener('click', () => projectModal.classList.remove('open'));
    }

    window.addEventListener('click', (e) => {
        if (e.target === projectModal) projectModal.classList.remove('open');
    });

    // --- 5. LIGHTBOX PHOTO (agrandissement d'une image du projet) ---
    const lightbox = document.getElementById('photo-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightboxBtn = document.getElementById('close-lightbox');

    function openLightbox(src) {
        lightboxImg.src = src;
        lightbox.classList.add('open');
    }

    if (closeLightboxBtn) {
        closeLightboxBtn.addEventListener('click', () => lightbox.classList.remove('open'));
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.classList.remove('open');
        });
    }

    // Fermeture au clavier (Échap) pour toutes les fenêtres
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.classList.remove('open');
            projectModal.classList.remove('open');
            lightbox.classList.remove('open');
        }
    });
});

