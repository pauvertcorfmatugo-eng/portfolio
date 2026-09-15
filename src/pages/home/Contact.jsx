import { useState } from 'react';
import { ArrowUpRight, Check, Copy, Download, MapPin } from 'lucide-react';
import { liens, profil } from '../../data/profil';
import { publicUrl } from '../../lib/paths';
import SectionHead from '../../components/SectionHead.jsx';
import MessageForm from '../../components/MessageForm.jsx';
import { GithubIcon, LinkedinIcon } from '../../components/BrandIcons.jsx';
import './Contact.css';

export default function Contact() {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profil.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profil.email}`;
    }
  }

  return (
    <section id="contact" className="section">
      <div className="container">
        <SectionHead index="05" title="Contact" />

        <div className="contact-grid">
          <div className="contact-intro reveal">
            <p className="contact-big">
              Un stage à proposer&nbsp;?
              <br />
              <span>Parlons-en.</span>
            </p>
            <p className="contact-text">Le plus simple : un email, ou un message via le formulaire.</p>

            <div className="contact-mail">
              <a href={`mailto:${profil.email}`} className="contact-mail-link">
                {profil.email}
              </a>
              <button type="button" className="icon-btn" onClick={copyEmail} aria-label="Copier l'adresse email">
                {copied ? <Check /> : <Copy />}
              </button>
              <span className="contact-copied" role="status">
                {copied ? 'Adresse copiée' : ''}
              </span>
            </div>

            <ul className="contact-links">
              <li>
                <a href={liens.linkedin} target="_blank" rel="noreferrer">
                  <LinkedinIcon /> LinkedIn <ArrowUpRight className="contact-arrow" />
                </a>
              </li>
              <li>
                <a href={liens.github} target="_blank" rel="noreferrer">
                  <GithubIcon /> GitHub <ArrowUpRight className="contact-arrow" />
                </a>
              </li>
              <li>
                <a href={publicUrl(profil.cv)} download>
                  <Download /> CV (PDF) <ArrowUpRight className="contact-arrow" />
                </a>
              </li>
            </ul>

            <p className="contact-loc mono">
              <MapPin /> {profil.localisation}
            </p>
          </div>

          <div className="contact-card reveal" style={{ '--delay': '0.1s' }}>
            <h3>Écrire un message</h3>
            <MessageForm />
          </div>
        </div>
      </div>
    </section>
  );
}
