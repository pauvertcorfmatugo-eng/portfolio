import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Code2, MessageCircle } from 'lucide-react';
import { getProjet, projets } from '../data/projets';
import { profil } from '../data/profil';
import { useDocumentTitle, useReveal } from '../lib/hooks';
import { publicUrl } from '../lib/paths';
import CodeBlock from '../components/CodeBlock.jsx';
import Lightbox from '../components/Lightbox.jsx';
import { GithubIcon } from '../components/BrandIcons.jsx';
import { useChat } from '../components/chat/ChatContext.jsx';
import NotFound from './NotFound.jsx';
import './ProjectPage.css';

const EMPTY = [];

/** Paragraphes séparés par une ligne vide ; lignes commençant par « • » → liste. */
function RichText({ text }) {
  return text.split(/\n{2,}/).map((block, i) => {
    const lines = block.split('\n');
    if (lines.every((l) => l.trim().startsWith('•'))) {
      return (
        <ul key={i} className="case-list">
          {lines.map((l, j) => (
            <li key={j}>{l.replace(/^\s*•\s*/, '')}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i}>
        {lines.map((l, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {l}
          </Fragment>
        ))}
      </p>
    );
  });
}

/** Sommaire qui suit la lecture. */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-20% 0px -70% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

function CaseStudy({ p }) {
  const ref = useReveal();
  const chat = useChat();
  const [photo, setPhoto] = useState(null);
  const details = p.details;
  const sections = details?.sections ?? EMPTY;
  const code = details?.code ?? EMPTY;
  const photos = details?.photos ?? EMPTY;

  const toc = useMemo(
    () => [
      ...sections.map((s, i) => ({ id: `partie-${i + 1}`, label: s.titre })),
      ...(code.length ? [{ id: 'code', label: `Extraits de code (${code.length})` }] : []),
    ],
    [sections, code.length],
  );
  const tocIds = useMemo(() => toc.map((t) => t.id), [toc]);
  const active = useActiveSection(tocIds);

  const autres = projets.filter((x) => x.details && x.slug !== p.slug);

  const jump = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <article className="case" ref={ref}>
      <header className="case-hero">
        <div className="container">
          <Link to="/#projets" className="case-back">
            <ArrowLeft /> Tous les projets
          </Link>
          <p className="eyebrow reveal">{details ? 'Étude de cas' : 'Projet'}</p>
          <h1 className="case-title reveal" style={{ '--delay': '0.05s' }}>
            {p.titre}
          </h1>
          <p className="case-lead reveal" style={{ '--delay': '0.1s' }}>
            {p.desc}
          </p>

          <div className="case-meta reveal" style={{ '--delay': '0.15s' }}>
            {p.infos?.map((i) => (
              <div key={i.label} className="case-meta-item">
                <span className="mono">{i.label}</span>
                <strong>{i.valeur}</strong>
              </div>
            ))}
            <div className="case-meta-item">
              <span className="mono">Stack</span>
              <ul className="tags">
                {p.tags.map((t) => (
                  <li key={t} className="tag">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {p.lien && (
            <a href={p.lien} className="btn btn-outline case-github" target="_blank" rel="noreferrer">
              <GithubIcon /> Voir le code sur GitHub
            </a>
          )}
        </div>
      </header>

      {details ? (
        <div className="container case-layout">
          <nav className="case-toc" aria-label="Sommaire">
            <p className="case-toc-title mono">Sommaire</p>
            <ol>
              {toc.map((t, i) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} onClick={jump(t.id)} className={active === t.id ? 'is-active' : undefined}>
                    <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                    {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="case-content">
            {photos.length > 0 && (
              <div className="case-photos">
                {photos.map((src) => (
                  <button type="button" key={src} onClick={() => setPhoto(src)} aria-label="Agrandir l'image">
                    <img src={publicUrl(src)} alt={p.titre} loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {sections.map((s, i) => (
              <section key={s.titre} id={`partie-${i + 1}`} className="case-section reveal">
                <h2>
                  <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                  {s.titre}
                </h2>
                <RichText text={s.texte} />
              </section>
            ))}

            {code.length > 0 && (
              <section id="code" className="case-section case-code">
                <h2>
                  <span className="mono">
                    <Code2 />
                  </span>
                  Extraits de code
                </h2>
                <p className="case-code-intro">Des morceaux choisis du travail réalisé, commentés.</p>
                <div className="case-code-list">
                  {code.map((c, i) => (
                    <CodeBlock key={c.titre} id={`code-${i + 1}`} {...c} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      ) : (
        <div className="container case-empty">
          <p>La présentation détaillée de ce projet n'est pas encore rédigée.</p>
          <button type="button" className="btn btn-outline" onClick={() => chat.open(`Parle-moi du projet ${p.titre}`)}>
            <MessageCircle /> Poser une question sur ce projet
          </button>
        </div>
      )}

      <div className="container">
        <aside className="case-cta">
          <div>
            <p className="case-cta-title">Ce projet vous parle ?</p>
            <p className="case-cta-text">
              {profil.prenom} recherche un stage : discutons-en.
            </p>
          </div>
          <div className="case-cta-actions">
            <Link to="/#contact" className="btn btn-primary">
              Me contacter <ArrowRight />
            </Link>
            {autres[0] ? (
              <Link to={`/projets/${autres[0].slug}`} className="btn btn-outline">
                Projet suivant <ArrowRight />
              </Link>
            ) : (
              <Link to="/#projets" className="btn btn-outline">
                Autres projets
              </Link>
            )}
          </div>
        </aside>
      </div>

      <Lightbox src={photo && publicUrl(photo)} alt={p.titre} onClose={() => setPhoto(null)} />
    </article>
  );
}

export default function ProjectPage() {
  const { slug } = useParams();
  const p = getProjet(slug);
  useDocumentTitle(p ? `${p.titre} — ${profil.nom}` : 'Projet introuvable');

  if (!p) return <NotFound />;
  // key : on repart de zéro quand on passe d'un projet à l'autre
  return <CaseStudy key={p.slug} p={p} />;
}
