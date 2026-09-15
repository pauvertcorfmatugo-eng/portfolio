import { competences, niveauLabel } from '../../data/profil';
import { projets } from '../../data/projets';
import SectionHead from '../../components/SectionHead.jsx';
import './Skills.css';

const SEGMENTS = 10;

function Meter({ value, label }) {
  const filled = Math.round((value / 100) * SEGMENTS);
  return (
    <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={label}>
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <span key={i} className={i < filled ? 'on' : undefined} style={{ '--i': i }} />
      ))}
    </div>
  );
}

// Outils présents dans les projets mais pas dans la liste des compétences.
const skillWords = competences.flatMap((g) => g.skills.map((s) => s.nom.split(' ')[0].toLowerCase()));
const extras = [...new Set(projets.flatMap((p) => p.tags))].filter((t) => !skillWords.includes(t.toLowerCase()));

export default function Skills() {
  return (
    <section id="competences" className="section">
      <div className="container">
        <SectionHead
          index="02"
          title="Compétences"
          sub="Les technologies que je pratique, et où j'en suis sur chacune."
        />

        <div className="skills-grid">
          {competences.map((groupe, gi) => (
            <article key={groupe.domaine} className="skill-card reveal" style={{ '--delay': `${gi * 0.07}s` }}>
              <header className="skill-card-head">
                <h3>{groupe.domaine}</h3>
                <span className="mono">{String(groupe.skills.length).padStart(2, '0')}</span>
              </header>
              <ul className="skill-list">
                {groupe.skills.map((skill) => (
                  <li key={skill.nom}>
                    <div className="skill-top">
                      <span className="skill-name">{skill.nom}</span>
                      <span className="skill-level">{niveauLabel(skill)}</span>
                    </div>
                    <Meter value={skill.niveau} label={`${skill.nom} : ${niveauLabel(skill)}`} />
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {extras.length > 0 && (
          <p className="skills-extra reveal">
            <span className="mono">Aussi utilisés en projet</span>
            <span className="tags">
              {extras.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </span>
          </p>
        )}
      </div>
    </section>
  );
}
