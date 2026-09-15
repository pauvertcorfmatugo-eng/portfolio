import { ArrowDown, Download, GraduationCap, MapPin, MessageCircle } from 'lucide-react';
import { competences, liens, parcours, profil, recherche } from '../../data/profil';
import { publicUrl } from '../../lib/paths';
import { useChat } from '../../components/chat/ChatContext.jsx';
import { GithubIcon, LinkedinIcon } from '../../components/BrandIcons.jsx';
import './Hero.css';

const formation = parcours.find((p) => p.type === 'formation');

/** Carte « profil.json » : un résumé du profil façon fichier de code. */
function ProfileFile() {
  const stack = competences.find((g) => g.domaine === 'Backend')?.skills.map((s) => s.nom.split(' ')[0]) ?? [];
  const entries = [
    ['nom', profil.nom],
    ['role', profil.titre],
    ['formation', formation?.titre],
    ['stack', stack],
    ['focus', profil.focus],
    ['base', profil.localisation],
    ['recherche', recherche.disponible ? `${recherche.type.toLowerCase()} en informatique` : null],
  ].filter(([, value]) => value && value.length);

  const str = (s) => <span className="pf-str">"{s}"</span>;

  return (
    <figure className="pf reveal" style={{ '--delay': '0.2s' }} aria-label="Résumé du profil">
      <figcaption className="pf-bar">
        <span className="pf-file">profil.json</span>
        <span className="pf-meta">UTF-8 · JSON</span>
      </figcaption>
      <pre className="pf-code">
        <code>
          <span className="pf-line">
            <span className="pf-punc">{'{'}</span>
          </span>
          {entries.map(([key, value], i) => (
            <span className="pf-line" key={key}>
              {'  '}
              <span className="pf-key">"{key}"</span>
              <span className="pf-punc">: </span>
              {Array.isArray(value) ? (
                <>
                  <span className="pf-punc">[</span>
                  {value.map((v, j) => (
                    <span key={v}>
                      {str(v)}
                      {j < value.length - 1 && <span className="pf-punc">, </span>}
                    </span>
                  ))}
                  <span className="pf-punc">]</span>
                </>
              ) : (
                str(value)
              )}
              {i < entries.length - 1 && <span className="pf-punc">,</span>}
            </span>
          ))}
          <span className="pf-line">
            <span className="pf-punc">{'}'}</span>
            <span className="pf-cursor" aria-hidden="true" />
          </span>
        </code>
      </pre>
    </figure>
  );
}

export default function Hero() {
  const chat = useChat();
  const [prenom, ...reste] = profil.nom.split(' ');
  const nom = reste.join(' ');

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="profil" className="hero">
      <div className="hero-grid-bg" aria-hidden="true" />
      <div className="container">
        {recherche.disponible && (
          <p className="hero-status reveal">
            <span className="hero-status-dot" aria-hidden="true" />
            En recherche de {recherche.type.toLowerCase()}
            {recherche.periode && <span className="hero-status-extra"> · {recherche.periode}</span>}
          </p>
        )}

        <h1 className="hero-name reveal" style={{ '--delay': '0.05s' }}>
          <span>{prenom}</span>{' '}
          <span className="hero-name-last">
            {nom.split('--').map((part, i, all) => (
              <span key={part}>
                {part}
                {i < all.length - 1 && (
                  <>
                    <span className="hero-dash">--</span>
                    <wbr />
                  </>
                )}
              </span>
            ))}
          </span>
        </h1>

        <div className="hero-grid">
          <div className="hero-main">
            <p className="hero-role reveal" style={{ '--delay': '0.1s' }}>
              <strong>{profil.titre}</strong>
              {profil.focus?.length > 0 && (
                <>
                  <span className="hero-role-sep" aria-hidden="true">
                    /
                  </span>
                  <span>{profil.focus.join(' & ')}</span>
                </>
              )}
            </p>

            <p className="hero-bio reveal" style={{ '--delay': '0.15s' }}>
              {profil.accroche}
            </p>

            <div className="hero-cta reveal" style={{ '--delay': '0.2s' }}>
              <a href="#contact" className="btn btn-primary" onClick={scrollTo('contact')}>
                Me contacter <ArrowDown />
              </a>
              <a href={publicUrl(profil.cv)} className="btn btn-outline" download>
                <Download /> Télécharger le CV
              </a>
              <button type="button" className="btn btn-ghost" onClick={() => chat.open()}>
                <MessageCircle /> Poser une question
              </button>
            </div>

            <ul className="hero-meta reveal" style={{ '--delay': '0.25s' }}>
              <li>
                <MapPin /> {profil.localisation}
              </li>
              {formation && (
                <li>
                  <GraduationCap /> {formation.titre}
                </li>
              )}
              <li className="hero-meta-links">
                <a href={liens.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                  <GithubIcon />
                </a>
                <a href={liens.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <LinkedinIcon />
                </a>
              </li>
            </ul>
          </div>

          <ProfileFile />
        </div>
      </div>
    </section>
  );
}
