import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Lock, LogIn } from 'lucide-react';
import { request } from '../../lib/api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await request('auth.php', {
        params: { action: 'login' },
        method: 'POST',
        body: { username, password },
      });
      onLogin(session);
    } catch (err) {
      setError(err.message);
      setPassword('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="esp-login">
      <div className="esp-login-card">
        <div className="esp-lock" aria-hidden="true">
          <Lock />
        </div>
        <h1>Espace privé</h1>
        <p className="muted">Accès réservé au propriétaire du site.</p>

        <form onSubmit={submit} className="esp-login-form">
          <div className="field">
            <label htmlFor="login-user">Identifiant</label>
            <input
              id="login-user"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="login-pass">Mot de passe</label>
            <input
              id="login-pass"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="form-error" role="alert">
              <AlertCircle />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? <span className="spinner" aria-hidden="true" /> : <LogIn />}
            Se connecter
          </button>
        </form>
      </div>

      <Link to="/" className="esp-back">
        <ArrowLeft /> Retour au portfolio
      </Link>
    </div>
  );
}
