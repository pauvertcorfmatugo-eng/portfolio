import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, MessageCircle } from 'lucide-react';
import { projets } from '../../data/projets';
import SectionHead from '../../components/SectionHead.jsx';
import { GithubIcon } from '../../components/BrandIcons.jsx';
import { useChat } from '../../components/chat/ChatContext.jsx';
import './Projects.css';

const num = (n) => String(n).padStart(2, '0');

function Featured({ p }) {
  return (
    <article className="feat reveal">
      <div className="feat-main">
        <div className="feat-top">
          <span className="mono feat-num">01</span>
          <span className="feat-badge">Étude de cas</span>
        </div>
        <h3 className="feat-title">
          <Link to={`/projets/${p.slug}`}>{p.titre}</Link>
        </h3>
        <p className="feat-desc">{p.desc}</p>
        <ul className="tags">
          {p.tags.map((t) => (
            <li key={t} className="tag">
              {t}
            </li>
          ))}
        </ul>
        <div className="feat-actions">
          <Link to={`/projets/${p.slug}`} className="btn btn-primary">
            Lire l'étude de cas <ArrowRight />
          </Link>
          {p.lien && (
            <a href={p.lien} className="btn btn-outline" target="_blank" rel="noreferrer">
              <GithubIcon /> Code source
            </a>
          )}
        </div>
      </div>

      <div className="feat-side">
        {p.pointsCles?.length > 0 && (
          <>
            <p className="feat-side-title mono">{'// points clés'}</p>
            <ul className="feat-points">
              {p.pointsCles.map((pt) => (
                <li key={pt}>
                  <Check /> {pt}
                </li>
              ))}
            </ul>
          </>
        )}
        {p.infos?.length > 0 && (
          <dl className="feat-infos">
            {p.infos.map((i) => (
              <div key={i.label}>
                <dt>{i.label}</dt>
                <dd>{i.valeur}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}

function ProjectCard({ p, n, delay }) {
  const chat = useChat();
  return (
    <article className="proj reveal" style={{ '--delay': delay }}>
      <span className="mono proj-num">{num(n)}</span>
      <h3 className="proj-title">{p.titre}</h3>
      <p className="proj-desc">{p.desc}</p>
      <ul className="tags">
        {p.tags.map((t) => (
          <li key={t} className="tag">
            {t}
          </li>
        ))}
      </ul>
      <div className="proj-links">
        {p.details && (
          <Link to={`/projets/${p.slug}`} className="btn btn-outline btn-sm">
            Présentation <ArrowRight />
          </Link>
        )}
        {p.lien && (
          <a href={p.lien} className="btn btn-outline btn-sm" target="_blank" rel="noreferrer">
            <GithubIcon /> Voir le code <ArrowUpRight />
          </a>
        )}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => chat.open(`Parle-moi du projet ${p.titre}`)}>
          <MessageCircle /> Une question ?
        </button>
      </div>
    </article>
  );
}

export default function Projects() {
  const featured = projets.find((p) => p.vedette);
  const others = projets.filter((p) => p !== featured);

  return (
    <section id="projets" className="section">
      <div className="container">
        <SectionHead
          index="03"
          title="Projets"
          sub="Stage, projets de formation et projets personnels — avec une étude de cas détaillée de mon stage."
        />

        {featured && <Featured p={featured} />}

        <div className="proj-grid">
          {others.map((p, i) => (
            <ProjectCard key={p.slug} p={p} n={i + (featured ? 2 : 1)} delay={`${i * 0.08}s`} />
          ))}
        </div>
      </div>
    </section>
  );
}
