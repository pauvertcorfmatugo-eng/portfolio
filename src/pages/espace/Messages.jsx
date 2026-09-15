import { useCallback, useEffect, useState } from 'react';
import { Inbox, Mail, MailOpen, RefreshCw, Reply, Trash2 } from 'lucide-react';
import { request } from '../../lib/api';
import { formatDate } from '../../lib/format';
import Modal from '../../components/Modal.jsx';

/** Messages laissés par les visiteurs depuis le formulaire de contact. */
export default function Messages({ onAuthError }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const handleError = useCallback(
    (err) => {
      if (err.status === 401) onAuthError();
      setError(err.message);
    },
    [onAuthError],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await request('messages.php', { params: { action: 'list' } });
      setItems(res.items);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    load();
  }, [load]);

  async function setRead(message, read) {
    try {
      await request('messages.php', { params: { action: 'read' }, method: 'POST', body: { id: message.id, read } });
      setItems(items.map((m) => (m.id === message.id ? { ...m, read_at: read ? new Date().toISOString() : null } : m)));
    } catch (err) {
      handleError(err);
    }
  }

  async function remove() {
    const message = toDelete;
    setToDelete(null);
    try {
      await request('messages.php', { params: { action: 'delete' }, method: 'POST', body: { id: message.id } });
      setItems(items.filter((m) => m.id !== message.id));
    } catch (err) {
      handleError(err);
    }
  }

  const replyHref = (m) => {
    const quote = m.message
      .split('\n')
      .map((l) => `> ${l}`)
      .join('\n');
    return `mailto:${m.email}?subject=${encodeURIComponent('Re: votre message sur mon portfolio')}&body=${encodeURIComponent(`\n\n${quote}`)}`;
  };

  return (
    <div className="inbox">
      <div className="inbox-head">
        <p className="muted">Messages envoyés depuis le formulaire de contact du portfolio.</p>
        <button type="button" className="icon-btn" onClick={load} aria-label="Actualiser" title="Actualiser">
          <RefreshCw className={loading ? 'spin' : undefined} />
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {items && items.length === 0 && (
        <div className="inbox-empty">
          <Inbox />
          <p>Aucun message pour le moment.</p>
        </div>
      )}

      <ul className="inbox-list">
        {items?.map((m) => (
          <li key={m.id} className={`msg${m.read_at ? '' : ' is-unread'}`}>
            <header className="msg-head">
              <div>
                <strong>{m.name || 'Anonyme'}</strong>
                {m.email && (
                  <a href={`mailto:${m.email}`} className="msg-email">
                    {m.email}
                  </a>
                )}
              </div>
              <div className="msg-meta">
                <time dateTime={m.created_at}>{formatDate(m.created_at)}</time>
              </div>
            </header>
            <p className="msg-text">{m.message}</p>
            <div className="msg-actions">
              {m.email && (
                <a className="btn btn-outline btn-sm" href={replyHref(m)} onClick={() => !m.read_at && setRead(m, true)}>
                  <Reply /> Répondre
                </a>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRead(m, !m.read_at)}>
                {m.read_at ? <Mail /> : <MailOpen />}
                {m.read_at ? 'Marquer non lu' : 'Marquer lu'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm is-danger" onClick={() => setToDelete(m)}>
                <Trash2 /> Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>

      {toDelete && (
        <Modal title="Supprimer ce message ?" onClose={() => setToDelete(null)}>
          <p>Le message de « {toDelete.name || toDelete.email || 'Anonyme'} » sera définitivement supprimé.</p>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setToDelete(null)}>
              Annuler
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={remove}>
              Supprimer
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
