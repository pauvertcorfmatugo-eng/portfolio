import { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Clock, X } from 'lucide-react';
import { formatBytes } from '../../lib/format';

const ACTIVE = ['queued', 'uploading'];

/** Panneau flottant listant les envois (progression, annulation). */
export default function Uploads({ uploads, onCancel, onClear }) {
  const [collapsed, setCollapsed] = useState(false);
  if (uploads.length === 0) return null;

  const active = uploads.filter((u) => ACTIVE.includes(u.status));
  const total = active.reduce((sum, u) => sum + u.size, 0);
  const loaded = active.reduce((sum, u) => sum + u.loaded, 0);
  const pct = total ? Math.floor((loaded / total) * 100) : 100;

  return (
    <aside className="uploads" aria-label="Envois de fichiers">
      <header className="uploads-head">
        <strong>
          {active.length ? `Envoi de ${active.length} fichier${active.length > 1 ? 's' : ''} · ${pct} %` : 'Envois terminés'}
        </strong>
        {!active.length && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>
            Effacer
          </button>
        )}
        <button
          type="button"
          className="icon-btn bare"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Déplier' : 'Replier'}
        >
          {collapsed ? <ChevronUp /> : <ChevronDown />}
        </button>
      </header>

      {!collapsed && (
        <ul className="uploads-list">
          {uploads.map((u) => {
            const progress = u.size ? Math.min(100, (u.loaded / u.size) * 100) : u.status === 'done' ? 100 : 0;
            return (
              <li key={u.id} className={`upload is-${u.status}`}>
                <span className="upload-icon" aria-hidden="true">
                  {u.status === 'done' && <CheckCircle2 />}
                  {u.status === 'error' && <AlertCircle />}
                  {u.status === 'queued' && <Clock />}
                  {u.status === 'uploading' && <span className="spinner" />}
                  {u.status === 'canceled' && <X />}
                </span>
                <div className="upload-info">
                  <span className="upload-name" title={u.name}>
                    {u.name}
                  </span>
                  <span className="upload-meta">
                    {u.status === 'error'
                      ? u.error
                      : u.status === 'canceled'
                        ? 'Annulé'
                        : u.status === 'queued'
                          ? `En attente · ${formatBytes(u.size)}`
                          : `${formatBytes(u.loaded)} / ${formatBytes(u.size)}`}
                  </span>
                  {ACTIVE.includes(u.status) && (
                    <span className="upload-bar">
                      <span style={{ width: `${progress}%` }} />
                    </span>
                  )}
                </div>
                {ACTIVE.includes(u.status) && (
                  <button type="button" className="icon-btn bare" onClick={() => onCancel(u.id)} aria-label={`Annuler ${u.name}`}>
                    <X />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
