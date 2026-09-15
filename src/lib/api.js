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
