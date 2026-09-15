/** Adresse d'un fichier du dossier public/ (tient compte du chemin de base du site). */
export function publicUrl(path) {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
