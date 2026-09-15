import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useEscape } from '../lib/hooks';
import './Modal.css';

/** Fenêtre de dialogue simple (fermeture : Échap, clic à côté ou bouton). */
export default function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  useEscape(onClose);

  useEffect(() => {
    const previous = document.activeElement;
    const first = ref.current?.querySelector('input, textarea, button:not(.modal-close)');
    first?.focus();
    return () => previous?.focus?.();
  }, []);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={`modal${wide ? ' is-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn bare modal-close" onClick={onClose} aria-label="Fermer">
            <X />
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
