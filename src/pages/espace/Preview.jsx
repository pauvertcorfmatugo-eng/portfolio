import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import Modal from '../../components/Modal.jsx';
import { extension, formatBytes, formatDate } from '../../lib/format';

// Doit correspondre à preview_mime() dans api/_lib/storage.php
const KINDS = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp'],
  pdf: ['pdf'],
  video: ['mp4', 'webm', 'mov'],
  audio: ['mp3', 'ogg', 'wav', 'm4a', 'flac'],
  text: ['txt', 'md', 'log', 'csv', 'json', 'xml', 'ini', 'conf', 'sql', 'php', 'js', 'jsx', 'ts', 'css', 'html',
    'py', 'sh', 'bat', 'ps1', 'yml', 'yaml', 'c', 'cpp', 'h', 'cs', 'java'],
};

const TEXT_LIMIT = 512 * 1024;

export function previewKind(name) {
  const ext = extension(name);
  return Object.keys(KINDS).find((kind) => KINDS[kind].includes(ext)) ?? null;
}

export default function Preview({ item, url, downloadHref, onClose }) {
  const kind = previewKind(item.name);
  const [text, setText] = useState(null);

  useEffect(() => {
    if (kind !== 'text') return;
    if (item.size > TEXT_LIMIT) {
      setText({ error: `Fichier trop long pour l'aperçu (plus de ${formatBytes(TEXT_LIMIT)}).` });
      return;
    }
    let cancelled = false;
    fetch(url, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error())))
      .then((value) => !cancelled && setText({ value }))
      .catch(() => !cancelled && setText({ error: 'Aperçu indisponible.' }));
    return () => {
      cancelled = true;
    };
  }, [kind, url, item.size]);

  return (
    <Modal title={item.name} onClose={onClose} wide>
      <div className={`preview is-${kind ?? 'none'}`}>
        {kind === 'image' && <img src={url} alt={item.name} />}
        {kind === 'pdf' && <iframe src={url} title={item.name} />}
        {kind === 'video' && <video src={url} controls preload="metadata" />}
        {kind === 'audio' && <audio src={url} controls preload="metadata" />}
        {kind === 'text' &&
          (text === null ? (
            <span className="spinner" aria-label="Chargement" />
          ) : text.error ? (
            <p className="muted">{text.error}</p>
          ) : (
            <pre>{text.value}</pre>
          ))}
        {!kind && <p className="muted">Pas d'aperçu pour ce type de fichier.</p>}
      </div>
      <div className="modal-actions preview-actions">
        <span className="muted">
          {formatBytes(item.size)} · {formatDate(item.mtime)}
        </span>
        <a className="btn btn-primary btn-sm" href={downloadHref} download>
          <Download /> Télécharger
        </a>
      </div>
    </Modal>
  );
}
