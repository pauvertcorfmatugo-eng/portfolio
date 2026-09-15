import { useCallback, useEffect, useRef, useState } from 'react';

/** Thème clair/sombre, mémorisé dans le navigateur. */
export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* navigation privée : tant pis, le choix ne sera pas mémorisé */
      }
      return next;
    });
  }, []);

  return [theme, toggle];
}

/** Ajoute la classe "is-visible" aux éléments .reveal quand ils entrent à l'écran. */
export function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = root.matches('.reveal') ? [root] : [...root.querySelectorAll('.reveal')];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return ref;
}

/** Met à jour le titre de l'onglet. */
export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

/** Ferme avec la touche Échap. */
export function useEscape(onEscape, active = true) {
  useEffect(() => {
    if (!active) return;
    const handler = (e) => e.key === 'Escape' && onEscape();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onEscape, active]);
}
