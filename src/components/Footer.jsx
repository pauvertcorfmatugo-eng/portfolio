import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { liens, profil } from '../data/profil';
import { GithubIcon, LinkedinIcon } from './BrandIcons.jsx';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>
          © {new Date().getFullYear()} {profil.nom}
        </p>
        <p className="footer-stack mono">React · Vite · PHP</p>
        <div className="footer-links">
          <a className="icon-btn bare" href={liens.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <GithubIcon />
          </a>
          <a className="icon-btn bare" href={liens.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <LinkedinIcon />
          </a>
          <Link className="footer-private" to="/espace">
            <Lock /> Espace privé
          </Link>
        </div>
      </div>
    </footer>
  );
}
