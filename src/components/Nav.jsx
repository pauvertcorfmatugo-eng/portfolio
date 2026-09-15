import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Download, Menu, Moon, Sun, X } from 'lucide-react';
import { profil } from '../data/profil';
import { useTheme } from '../lib/hooks';
import { publicUrl } from '../lib/paths';
import './Nav.css';

const SECTIONS = [
  { id: 'profil', label: 'Profil' },
  { id: 'competences', label: 'Compétences' },
  { id: 'projets', label: 'Projets' },
  { id: 'parcours', label: 'Parcours' },
  { id: 'contact', label: 'Contact' },
];

export default function Nav() {
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const [theme, toggleTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('profil');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Surligne dans le menu la section actuellement à l'écran.
  useEffect(() => {
    if (!onHome) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [onHome]);

  const goTo = (event, id) => {
    setOpen(false);
    if (onHome) {
      event.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const links = SECTIONS.map(({ id, label }) => {
    const isActive = onHome && active === id;
    return (
      <Link
        key={id}
        to={{ pathname: '/', hash: `#${id}` }}
        onClick={(e) => goTo(e, id)}
        className={isActive ? 'is-active' : undefined}
        aria-current={isActive ? 'location' : undefined}
      >
        {label}
      </Link>
    );
  });

  return (
    <header className={`nav${scrolled || open ? ' is-solid' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="nav-logo" onClick={(e) => goTo(e, 'profil')} aria-label="Accueil">
          ugo<span className="nav-logo-dot">.</span>pc
          <span className="nav-caret" aria-hidden="true">
            _
          </span>
        </Link>

        <nav className="nav-links" aria-label="Navigation principale">
          {links}
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="icon-btn bare"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'}
            title={theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
          <a className="btn btn-outline btn-sm nav-cv" href={publicUrl(profil.cv)} download>
            CV <Download />
          </a>
          <button
            type="button"
            className="icon-btn bare nav-burger"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="nav-mobile"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <div id="nav-mobile" className="nav-mobile" hidden={!open}>
        <nav className="container" aria-label="Navigation mobile">
          {links}
          <a className="btn btn-primary" href={publicUrl(profil.cv)} download>
            Télécharger le CV <Download />
          </a>
        </nav>
      </div>
    </header>
  );
}
