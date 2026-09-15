import { useId, useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { request } from '../lib/api';
import { profil } from '../data/profil';
import './MessageForm.css';

/**
 * Formulaire « Laisser un message ». Les messages arrivent dans l'espace privé (onglet Messages).
 * Si l'API n'est pas joignable (ex. site hébergé sans PHP), on propose l'email à la place.
 */
export default function MessageForm({ source = 'contact', prefill = '', compact = false }) {
  const id = useId();
  const [form, setForm] = useState({ name: '', email: '', message: prefill, website: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState(null);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    try {
      await request('messages.php', { params: { action: 'send' }, method: 'POST', body: { ...form, source } });
      setStatus('sent');
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="msg-sent" role="status">
        <CheckCircle2 />
        <div>
          <strong>Message envoyé, merci !</strong>
          <p>
            {form.email
              ? `${profil.prenom} vous répondra à l'adresse ${form.email}.`
              : `Sans adresse email, ${profil.prenom} ne pourra pas vous répondre : n'hésitez pas à écrire à ${profil.email}.`}
          </p>
        </div>
      </div>
    );
  }

  const mailto = `mailto:${profil.email}?subject=${encodeURIComponent('Contact depuis votre portfolio')}&body=${encodeURIComponent(form.message)}`;

  return (
    <form className={`msg-form${compact ? ' is-compact' : ''}`} onSubmit={submit}>
      <div className="msg-row">
        <div className="field">
          <label htmlFor={`${id}-name`}>
            Nom <span className="hint">(facultatif)</span>
          </label>
          <input
            id={`${id}-name`}
            className="input"
            value={form.name}
            onChange={update('name')}
            maxLength={80}
            autoComplete="name"
          />
        </div>
        <div className="field">
          <label htmlFor={`${id}-email`}>
            Email <span className="hint">(pour la réponse)</span>
          </label>
          <input
            id={`${id}-email`}
            className="input"
            type="email"
            value={form.email}
            onChange={update('email')}
            maxLength={160}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor={`${id}-message`}>Message</label>
        <textarea
          id={`${id}-message`}
          className="input"
          value={form.message}
          onChange={update('message')}
          required
          minLength={5}
          maxLength={3000}
          rows={compact ? 3 : 5}
          placeholder={compact ? '' : 'Une offre de stage, une question sur un projet…'}
        />
      </div>

      {/* Piège à robots : champ invisible pour les humains, rempli par les robots de spam. */}
      <div className="msg-hp" aria-hidden="true">
        <label>
          Site web
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} />
        </label>
      </div>

      {status === 'error' && (
        <div className="form-error" role="alert">
          <AlertCircle />
          <div>
            {error?.offline ? (
              <>
                L'envoi n'est pas disponible pour le moment. <a href={mailto}>Écrivez par email</a> à la place.
              </>
            ) : (
              error?.message
            )}
          </div>
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
        {status === 'sending' ? <span className="spinner" aria-hidden="true" /> : <Send />}
        {status === 'sending' ? 'Envoi…' : 'Envoyer le message'}
      </button>
    </form>
  );
}
