import { Briefcase, GraduationCap } from 'lucide-react';
import { parcours } from '../../data/profil';
import SectionHead from '../../components/SectionHead.jsx';
import './Timeline.css';

const TYPES = {
  formation: { label: 'Formation', Icon: GraduationCap },
  experience: { label: 'Expérience', Icon: Briefcase },
};

export default function Timeline() {
  return (
    <section id="parcours" className="section section-alt">
      <div className="container">
        <SectionHead index="04" title="Parcours" sub="Formation et expériences professionnelles." />

        <ol className="tl">
          {parcours.map((item, i) => {
            const { label, Icon } = TYPES[item.type] ?? TYPES.experience;
            return (
              <li key={`${item.titre}-${item.date}`} className="tl-item reveal" style={{ '--delay': `${i * 0.08}s` }}>
                <p className="tl-date mono">{item.date}</p>
                <div className="tl-marker" aria-hidden="true">
                  <Icon />
                </div>
                <div className="tl-body">
                  <span className={`tl-type is-${item.type}`}>{label}</span>
                  <h3>{item.titre}</h3>
                  <p className="tl-place">{item.lieu}</p>
                  <p className="tl-desc">{item.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
