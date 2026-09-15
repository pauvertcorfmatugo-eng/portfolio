import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '../lib/hooks';

export default function NotFound() {
  useDocumentTitle('Page introuvable');

  return (
    <section className="section">
      <div className="container" style={{ display: 'grid', gap: '1.2rem', justifyItems: 'start', minHeight: '50vh' }}>
        <p className="eyebrow">Erreur 404</p>
        <h1 className="sec-title">Cette page n'existe pas.</h1>
        <p className="sec-sub">Le lien est peut-être incorrect, ou la page a été déplacée.</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft /> Retour à l'accueil
        </Link>
      </div>
    </section>
  );
}
