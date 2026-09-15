// Client de l'API PHP (dossier /api).
// En développement, Vite redirige /api vers WAMP (voir vite.config.js).

const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

let csrfToken = null;

export function setCsrfToken(token) {
  csrfToken = token || null;
}

export class ApiError extends Error {
  constructor(message, status, data = null, offline = false) {
    super(message);
    this.status = status;
    this.data = data;
    // true quand l'API ne répond pas (WAMP éteint, hébergement sans PHP…)
    this.offline = offline;
  }
}

export function apiUrl(file, params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) query.set(key, String(value));
  }
  const qs = query.toString();
  return `${BASE}/${file}${qs ? `?${qs}` : ''}`;
}

export async function request(file, { params, method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET' && csrfToken) headers['X-CSRF-Token'] = csrfToken;

  let res;
  try {
    res = await fetch(apiUrl(file, params), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError('Impossible de joindre le serveur.', 0, null, true);
  }

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!isJson || data === null) {
    // Pas de JSON : ce n'est pas notre API qui a répondu.
    throw new ApiError("L'API ne répond pas.", res.status, null, true);
  }
  if (!res.ok) {
    throw new ApiError(data.error || `Erreur ${res.status}`, res.status, data, res.status >= 502);
  }
  return data;
}

/** Envoie un morceau de fichier (XHR pour suivre la progression). */
export function uploadChunk({ params, blob, onProgress, signal }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl('files.php', { action: 'upload', ...params }));
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    if (csrfToken) xhr.setRequestHeader('X-CSRF-Token', csrfToken);

    xhr.upload.onprogress = (e) => onProgress?.(e.loaded);
    xhr.onload = () => {
      const data = xhr.response;
      if (xhr.status >= 200 && xhr.status < 300 && data) resolve(data);
      else reject(new ApiError(data?.error || `Erreur ${xhr.status}`, xhr.status, data));
    };
    xhr.onerror = () => reject(new ApiError('Connexion interrompue.', 0, null, true));
    xhr.onabort = () => reject(new ApiError('Envoi annulé.', -1));

    if (signal) {
      if (signal.aborted) return reject(new ApiError('Envoi annulé.', -1));
      signal.addEventListener('abort', () => xhr.abort(), { once: true });
    }
    xhr.send(blob);
  });
}
