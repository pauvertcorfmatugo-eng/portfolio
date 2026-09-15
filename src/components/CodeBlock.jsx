import { useMemo, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import php from 'highlight.js/lib/languages/php';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import { Check, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import './CodeBlock.css';

// Langages disponibles pour la coloration (ajoute-en ici si besoin).
hljs.registerLanguage('php', php);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);

const COLLAPSE_AFTER = 18;

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default function CodeBlock({ id, titre, langage = 'plaintext', contenu }) {
  const code = contenu.replace(/\s+$/, '');
  const lineCount = code.split('\n').length;
  const collapsible = lineCount > COLLAPSE_AFTER;
  const [expanded, setExpanded] = useState(!collapsible);
  const [copied, setCopied] = useState(false);

  // highlight.js échappe lui-même le HTML du code.
  const html = useMemo(
    () => (hljs.getLanguage(langage) ? hljs.highlight(code, { language: langage }).value : escapeHtml(code)),
    [code, langage],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* presse-papiers indisponible */
    }
  }

  return (
    <figure className="code" id={id}>
      <figcaption className="code-head">
        <span className="code-lang">{langage}</span>
        <span className="code-title">{titre}</span>
        <button type="button" className="code-copy" onClick={copy} aria-label="Copier le code">
          {copied ? <Check /> : <Copy />}
          <span>{copied ? 'Copié' : 'Copier'}</span>
        </button>
      </figcaption>

      <div className={`code-body${expanded ? '' : ' is-collapsed'}`}>
        <div className="code-gutter" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <pre tabIndex={0}>
          <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      </div>

      {collapsible && (
        <button type="button" className="code-toggle" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded}>
          {expanded ? <ChevronUp /> : <ChevronDown />}
          {expanded ? 'Réduire' : `Afficher les ${lineCount} lignes`}
        </button>
      )}
    </figure>
  );
}
