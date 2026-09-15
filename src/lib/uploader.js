import { uploadChunk } from './api';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function randomId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Envoie un fichier morceau par morceau.
 * - Si le réseau coupe, on réessaie (3 fois max) ;
 * - si le serveur a déjà reçu une partie (réponse 409), on reprend à cet endroit.
 */
export async function uploadFile({ file, dir, chunkSize, onProgress, signal }) {
  const uploadId = randomId();
  let offset = 0;
  let failures = 0;

  for (;;) {
    const end = Math.min(offset + chunkSize, file.size);
    try {
      const res = await uploadChunk({
        params: { path: dir, name: file.name, size: file.size, offset, uploadId },
        blob: file.slice(offset, end),
        onProgress: (loaded) => onProgress(offset + loaded),
        signal,
      });
      failures = 0;
      offset = res.received;
      onProgress(offset);
      if (res.done) return res.item;
    } catch (err) {
      if (err.status === 409 && typeof err.data?.received === 'number') {
        offset = err.data.received;
        continue;
      }
      const definitive = err.status === -1 || (err.status >= 400 && err.status < 500);
      if (definitive || ++failures > 3) throw err;
      await sleep(1000 * failures);
    }
  }
}
