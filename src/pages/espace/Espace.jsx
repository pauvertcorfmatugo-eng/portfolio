import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Moon, ServerOff, Settings, Sun } from 'lucide-react';
import { request, setCsrfToken } from '../../lib/api';
import { useDocumentTitle, useTheme } from '../../lib/hooks';
import Login from './Login.jsx';
import Messages from './Messages.jsx';
import './Espace.css';

/** Empêche les moteurs de recherche d'indexer l'espace privé. */
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}

function Notice({ icon: Icon, title, children }) {
  return (
    <div className="esp-notice">
      <Icon />
      <h1>{title}</h1>
      {children}
    </div>
  );
}

export default function Espace() {
  useDocumentTitle('Espace privé — ugo.pc');
  useNoIndex();
  const [theme, toggleTheme] = useTheme();
  const [session, setSession] = useState(null); // null = chargement
  const [error, setError] = useState(null);

  const applySession = useCallback((s) => {
    setCsrfToken(s.csrf);
    setSession(s);
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      applySession(await request('auth.php', { params: { action: 'me' } }));
    } catch (err) {
      setError(err);
      setSession(false);
    }
  }, [applySession]);

  useEffect(() => {
    load();
  }, [load]);

  // Session expirée pendant l'utilisation : retour à l'écran de connexion.
  const onAuthError = useCallback(() => {
    setCsrfToken(null);
    setSession((s) => (s ? { ...s, authenticated: false, user: null, csrf: null } : s));
  }, []);

  async function logout() {
    try {
      await request('auth.php', { params: { action: 'logout' }, method: 'POST' });
    } catch {
      /* déjà déconnecté */
    }
    onAuthError();
  }

  const authed = session?.authenticated;

  let content;
  if (session === null) {
    content = (
      <div className="page-loading">
        <span className="spinner" aria-label="Chargement" />
      </div>
    );
  } else if (session === false) {
    content = (
      <Notice icon={ServerOff} title={error?.offline ? 'API injoignable' : 'Erreur du serveur'}>
        {error?.offline ? (
          <p>
            Le serveur PHP ne répond pas. En local, vérifie que <strong>WAMP est démarré</strong> (icône verte), puis
            recharge la page.
          </p>
        ) : (
          <p>{error?.message}</p>
        )}
        <button type="button" className="btn btn-outline btn-sm" onClick={load}>
          Réessayer
        </button>
      </Notice>
    );
  } else if (!session.configured) {
    content = (
      <Notice icon={Settings} title="Espace pas encore configuré">
        <p>Crée ton identifiant et ton mot de passe en lançant, depuis le dossier du projet :</p>
        <pre className="esp-cmd">F:\wamp64\bin\php\php8.3.28\php.exe api\tools\setup.php</pre>
        <button type="button" className="btn btn-outline btn-sm" onClick={load}>
          C'est fait, recharger
        </button>
      </Notice>
    );
  } else if (!authed) {
    content = <Login onLogin={applySession} />;
  } else {
    content = <Messages onAuthError={onAuthError} />;
  }

  return (
    <div className="esp">
      <header className="esp-top">
        <div className="container esp-top-inner">
          <Link to="/" className="esp-logo">
            ugo<span>.</span>pc
            <span className="esp-logo-tag">espace privé</span>
          </Link>
          <div className="esp-top-actions">
            <button
              type="button"
              className="icon-btn bare"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'}
            >
              {theme === 'dark' ? <Sun /> : <Moon />}
            </button>
            {authed && (
              <>
                <span className="esp-user mono">{session.user}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
                  <LogOut /> Déconnexion
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="container esp-main">{content}</main>
    </div>
  );
}
