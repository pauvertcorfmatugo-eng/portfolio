import { X } from 'lucide-react';
import { useEscape } from '../lib/hooks';
import './Lightbox.css';

/** Affiche une image en grand. Fermeture : clic à côté, bouton ou touche Échap. */
export default function Lightbox({ src, alt, onClose }) {
  useEscape(onClose, Boolean(src));
  if (!src) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}>
      <img src={src} alt={alt} onClick={(e) => e.stopPropagation()} />
      <button type="button" className="icon-btn lightbox-close" onClick={onClose} aria-label="Fermer">
        <X />
      </button>
    </div>
  );
}
