import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Download,
  Eye,
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
  FolderPlus,
  HardDrive,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { apiUrl, request } from '../../lib/api';
import { extension, formatBytes, formatDate } from '../../lib/format';
import { randomId, uploadFile } from '../../lib/uploader';
import Modal from '../../components/Modal.jsx';
import Uploads from './Uploads.jsx';
import Preview, { previewKind } from './Preview.jsx';

const ICONS = [
  [['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp', 'svg', 'heic'], FileImage],
  [['mp4', 'webm', 'mov', 'mkv', 'avi'], FileVideo],
  [['mp3', 'ogg', 'wav', 'm4a', 'flac'], FileAudio],
  [['zip', 'rar', '7z', 'tar', 'gz', 'iso'], FileArchive],
  [['xls', 'xlsx', 'ods', 'csv'], FileSpreadsheet],
  [['pdf', 'doc', 'docx', 'odt', 'txt', 'md', 'rtf'], FileText],
  [['php', 'js', 'jsx', 'ts', 'css', 'html', 'sql', 'py', 'sh', 'json', 'c', 'cpp', 'cs', 'java'], FileCode],
];

function iconFor(item) {
  if (item.type === 'dir') return Folder;
  const ext = extension(item.name);
  return ICONS.find(([exts]) => exts.includes(ext))?.[1] ?? File;
}

const joinPath = (dir, name) => (dir ? `${dir}/${name}` : name);

export default function Files({ uploadLimits, onAuthError }) {
  const [params, setParams] = useSearchParams();
  const path = params.get('dossier') ?? '';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState({ key: 'name', dir: 1 });
  const [filter, setFilter] = useState('');
  const [dialog, setDialog] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState([]);

  const fileInput = useRef(null);
  const pathRef = useRef(path);
  const queue = useRef([]);
  const running = useRef(false);
  const controllers = useRef(new Map());
  const dragDepth = useRef(0);

  const handleError = useCallback(
    (err) => {
      if (err.status === 401) onAuthError();
      return err.message;
    },
    [onAuthError],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await request('files.php', { params: { action: 'list', path: pathRef.current } });
      setData(res);
    } catch (err) {
      setError(handleError(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    pathRef.current = path;
    setFilter('');
    load();
  }, [path, load]);

  const openDir = (dir) => setParams(dir ? { dossier: dir } : {});

  // ── Tri et filtre ──────────────────────────────────────────
  const items = useMemo(() => {
    if (!data) return [];
    const q = filter.trim().toLowerCase();
    const list = q ? data.items.filter((i) => i.name.toLowerCase().includes(q)) : [...data.items];
    const collator = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' });
    return list.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1; // dossiers d'abord
      const va = a[sort.key] ?? 0;
      const vb = b[sort.key] ?? 0;
      const cmp = sort.key === 'name' ? collator.compare(a.name, b.name) : va - vb;
      return cmp * sort.dir;
    });
  }, [data, filter, sort]);

  const sortBy = (key) => setSort((s) => ({ key, dir: s.key === key ? -s.dir : key === 'name' ? 1 : -1 }));

  // ── Envois ─────────────────────────────────────────────────
  const patchUpload = (id, patch) => setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const runQueue = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    while (queue.current.length) {
      const task = queue.current.shift();
      const controller = new AbortController();
      controllers.current.set(task.id, controller);
      patchUpload(task.id, { status: 'uploading' });
      try {
        await uploadFile({
          file: task.file,
          dir: task.dir,
          chunkSize: uploadLimits?.chunkSize || 2 * 1024 * 1024,
          onProgress: (loaded) => patchUpload(task.id, { loaded }),
          signal: controller.signal,
        });
        patchUpload(task.id, { status: 'done', loaded: task.file.size });
        if (task.dir === pathRef.current) load();
      } catch (err) {
        patchUpload(task.id, err.status === -1 ? { status: 'canceled' } : { status: 'error', error: handleError(err) });
      } finally {
        controllers.current.delete(task.id);
      }
    }
    running.current = false;
  }, [uploadLimits, load, handleError]);

  const enqueue = (fileList, folders = []) => {
    const max = uploadLimits?.maxFileSize || 0;
    const tasks = [];
    const rows = folders.map((name) => ({
      id: randomId(),
      name,
      size: 0,
      loaded: 0,
      status: 'error',
      error: 'Dossier ignoré : créez-le puis envoyez son contenu',
    }));
    for (const file of fileList) {
      const id = randomId();
      if (max && file.size > max) {
        rows.push({ id, name: file.name, size: file.size, loaded: 0, status: 'error', error: `Trop volumineux (max ${formatBytes(max)})` });
        continue;
      }
      tasks.push({ id, file, dir: path });
      rows.push({ id, name: file.name, size: file.size, loaded: 0, status: 'queued' });
    }
    setUploads((list) => [...list, ...rows]);
    queue.current.push(...tasks);
    runQueue();
  };

  const cancelUpload = (id) => {
    queue.current = queue.current.filter((t) => t.id !== id);
    controllers.current.get(id)?.abort();
    setUploads((list) => list.map((u) => (u.id === id && u.status === 'queued' ? { ...u, status: 'canceled' } : u)));
  };

  // Annule les envois en cours si on quitte la page.
  useEffect(() => {
    const ctrls = controllers.current;
    return () => ctrls.forEach((c) => c.abort());
  }, []);

  // ── Glisser-déposer ────────────────────────────────────────
  const hasFiles = (e) => [...(e.dataTransfer?.types ?? [])].includes('Files');
  const dropHandlers = {
    onDragEnter: (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current++;
      setDragging(true);
    },
    onDragOver: (e) => hasFiles(e) && e.preventDefault(),
    onDragLeave: (e) => {
      if (!hasFiles(e)) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragging(false);
    },
    onDrop: (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      const files = [];
      const folders = [];
      for (const it of e.dataTransfer.items) {
        if (it.kind !== 'file') continue;
        const entry = it.webkitGetAsEntry?.();
        const file = it.getAsFile();
        if (entry?.isDirectory) folders.push(entry.name);
        else if (file) files.push(file);
      }
      if (files.length || folders.length) enqueue(files, folders);
    },
  };

  // ── Actions ────────────────────────────────────────────────
  async function submitDialog(e) {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get('name')?.toString().trim();
    setDialog((d) => ({ ...d, busy: true, error: null }));
    try {
      if (dialog.type === 'mkdir') {
        await request('files.php', { params: { action: 'mkdir' }, method: 'POST', body: { path, name } });
      } else if (dialog.type === 'rename') {
        await request('files.php', {
          params: { action: 'rename' },
          method: 'POST',
          body: { path: joinPath(path, dialog.item.name), name },
        });
      } else if (dialog.type === 'delete') {
        await request('files.php', { params: { action: 'delete' }, method: 'POST', body: { path: joinPath(path, dialog.item.name) } });
      }
      setDialog(null);
      load();
    } catch (err) {
      setDialog((d) => ({ ...d, busy: false, error: handleError(err) }));
    }
  }

  const downloadUrl = (item, inline = false) =>
    apiUrl('files.php', { action: 'download', path: joinPath(path, item.name), inline: inline ? 1 : undefined });

  const openItem = (item) => {
    if (item.type === 'dir') openDir(joinPath(path, item.name));
    else setPreview(item);
  };

  const segments = path ? path.split('/') : [];
  const disk = data?.disk;
  const usedPct = disk?.total ? Math.round(((disk.total - disk.free) / disk.total) * 100) : null;

  return (
    <div className="files" {...dropHandlers}>
      <div className="files-toolbar">
        <nav className="crumbs" aria-label="Emplacement">
          <button type="button" onClick={() => openDir('')} className={segments.length === 0 ? 'is-current' : undefined}>
            <HardDrive /> Mon cloud
          </button>
          {segments.map((seg, i) => (
            <span key={i} className="crumb">
              <ChevronRight aria-hidden="true" />
              <button
                type="button"
                onClick={() => openDir(segments.slice(0, i + 1).join('/'))}
                className={i === segments.length - 1 ? 'is-current' : undefined}
              >
                {seg}
              </button>
            </span>
          ))}
        </nav>

        <div className="files-actions">
          <label className="files-search">
            <Search aria-hidden="true" />
            <input
              type="search"
              placeholder="Filtrer…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filtrer les fichiers de ce dossier"
            />
          </label>
          <button type="button" className="icon-btn" onClick={load} aria-label="Actualiser" title="Actualiser">
            <RefreshCw className={loading ? 'spin' : undefined} />
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setDialog({ type: 'mkdir' })}>
            <FolderPlus /> Nouveau dossier
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => fileInput.current?.click()}>
            <UploadCloud /> Envoyer
          </button>
          <input
            ref={fileInput}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files?.length) enqueue([...e.target.files]);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <div className="files-panel">
        <div className="files-head" role="row">
          <SortButton label="Nom" k="name" sort={sort} onSort={sortBy} />
          <SortButton label="Taille" k="size" sort={sort} onSort={sortBy} className="col-size" />
          <SortButton label="Modifié" k="mtime" sort={sort} onSort={sortBy} className="col-date" />
          <span className="col-actions" />
        </div>

        {error && (
          <div className="files-state">
            <p className="form-error">{error}</p>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => (path ? openDir('') : load())}>
              {path ? 'Revenir à la racine' : 'Réessayer'}
            </button>
          </div>
        )}

        {!error && data && items.length === 0 && (
          <div className="files-state">
            <UploadCloud className="files-empty-icon" />
            <p>{filter ? 'Aucun élément ne correspond au filtre.' : 'Ce dossier est vide.'}</p>
            {!filter && <p className="muted">Glissez des fichiers ici, ou utilisez le bouton « Envoyer ».</p>}
          </div>
        )}

        <ul className="files-list">
          {items.map((item) => {
            const Icon = iconFor(item);
            return (
              <li key={item.name} className={`file-row is-${item.type}`}>
                <button type="button" className="file-name" onClick={() => openItem(item)} title={item.name}>
                  <Icon aria-hidden="true" />
                  <span>{item.name}</span>
                </button>
                <span className="col-size mono">{item.type === 'dir' ? '—' : formatBytes(item.size)}</span>
                <span className="col-date">{formatDate(item.mtime)}</span>
                <span className="col-actions">
                  {item.type === 'file' && previewKind(item.name) && (
                    <button type="button" className="icon-btn bare" onClick={() => setPreview(item)} aria-label={`Aperçu de ${item.name}`} title="Aperçu">
                      <Eye />
                    </button>
                  )}
                  {item.type === 'file' && (
                    <a className="icon-btn bare" href={downloadUrl(item)} download aria-label={`Télécharger ${item.name}`} title="Télécharger">
                      <Download />
                    </a>
                  )}
                  <button type="button" className="icon-btn bare" onClick={() => setDialog({ type: 'rename', item })} aria-label={`Renommer ${item.name}`} title="Renommer">
                    <Pencil />
                  </button>
                  <button type="button" className="icon-btn bare is-danger" onClick={() => setDialog({ type: 'delete', item })} aria-label={`Supprimer ${item.name}`} title="Supprimer">
                    <Trash2 />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>

        {dragging && (
          <div className="files-drop">
            <UploadCloud />
            <p>Déposez pour envoyer dans « {segments.at(-1) ?? 'Mon cloud'} »</p>
          </div>
        )}
      </div>

      <footer className="files-foot">
        <span>
          {data ? `${data.items.filter((i) => i.type === 'dir').length} dossier(s), ${data.items.filter((i) => i.type === 'file').length} fichier(s)` : ''}
        </span>
        {disk?.total ? (
          <span className="disk">
            <span className="disk-bar" aria-hidden="true">
              <span style={{ width: `${usedPct}%` }} />
            </span>
            {formatBytes(disk.free)} libres sur {formatBytes(disk.total)}
          </span>
        ) : null}
      </footer>

      <Uploads uploads={uploads} onCancel={cancelUpload} onClear={() => setUploads((l) => l.filter((u) => u.status === 'uploading' || u.status === 'queued'))} />

      {dialog && (
        <Modal
          title={
            dialog.type === 'mkdir' ? 'Nouveau dossier' : dialog.type === 'rename' ? 'Renommer' : 'Supprimer définitivement ?'
          }
          onClose={() => setDialog(null)}
        >
          <form onSubmit={submitDialog}>
            {dialog.type === 'delete' ? (
              <p>
                « <strong>{dialog.item.name}</strong> »{' '}
                {dialog.item.type === 'dir' ? 'et tout son contenu seront supprimés.' : 'sera supprimé.'} Cette action est irréversible.
              </p>
            ) : (
              <div className="field">
                <label htmlFor="dialog-name">Nom</label>
                <input
                  id="dialog-name"
                  name="name"
                  className="input"
                  defaultValue={dialog.item?.name ?? ''}
                  required
                  maxLength={200}
                  autoComplete="off"
                  onFocus={(e) => {
                    // sélectionne le nom sans l'extension
                    const v = e.target.value;
                    const dot = dialog.item?.type === 'file' ? v.lastIndexOf('.') : -1;
                    e.target.setSelectionRange(0, dot > 0 ? dot : v.length);
                  }}
                />
              </div>
            )}
            {dialog.error && <p className="form-error" style={{ marginTop: '1rem' }}>{dialog.error}</p>}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDialog(null)}>
                Annuler
              </button>
              <button type="submit" className={`btn btn-sm ${dialog.type === 'delete' ? 'btn-danger' : 'btn-primary'}`} disabled={dialog.busy}>
                {dialog.type === 'mkdir' ? 'Créer' : dialog.type === 'rename' ? 'Renommer' : 'Supprimer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {preview && (
        <Preview
          item={preview}
          url={downloadUrl(preview, true)}
          downloadHref={downloadUrl(preview)}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}

function SortButton({ label, k, sort, onSort, className }) {
  const active = sort.key === k;
  return (
    <button type="button" className={`sort-btn ${className ?? ''}${active ? ' is-active' : ''}`} onClick={() => onSort(k)}>
      {label}
      {active && (sort.dir === 1 ? <ArrowUp aria-label="croissant" /> : <ArrowDown aria-label="décroissant" />)}
    </button>
  );
}
