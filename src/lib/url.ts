/**
 * Liens internes : TOUJOURS passer par url() (le site vit sous /Cours-Dev-Code/).
 */

/** Base du site, sans slash final : « /Cours-Dev-Code » (ou « » à la racine). */
function base(): string {
  const brut = (import.meta.env?.BASE_URL as string | undefined) ?? '/';
  return brut.replace(/\/+$/, '');
}

/** Ajoute la base à un chemin et respecte trailingSlash: 'always' (hors fichiers). */
export function prefixerBase(chemin: string, baseSite: string): string {
  if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(chemin)) return chemin; // externe, protocole ou ancre seule
  const b = baseSite.replace(/\/+$/, '');

  // Sépare chemin, requête et ancre pour ne toucher qu'au chemin.
  const m = /^([^?#]*)(\?[^#]*)?(#.*)?$/.exec(chemin);
  let p = m?.[1] ?? '';
  const suite = `${m?.[2] ?? ''}${m?.[3] ?? ''}`;

  p = `/${p.replace(/^\/+/, '')}`.replace(/\/{2,}/g, '/');
  if (b && (p === b || p.startsWith(`${b}/`))) return `${p}${suite}`; // déjà préfixé
  // Ajoute « / » final aux pages (pas aux fichiers comme .json, .pdf, .png).
  if (!p.endsWith('/') && !/\.[a-z0-9]{1,12}$/i.test(p)) p += '/';
  return `${b}${p}${suite}`;
}

/** url('/tomes/') → « /Cours-Dev-Code/tomes/ » ; url('/cours/react/06-usestate#etat') aussi. */
export function url(chemin = '/'): string {
  return prefixerBase(chemin, base());
}

/** Fichier de public/ (images, PDF) : urlMedia('/media/react/schema.png') ou urlMedia('react/schema.png'). */
export function urlMedia(chemin: string): string {
  if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(chemin)) return chemin;
  const propre = chemin.replace(/^\/+/, '');
  const complet = propre.startsWith('media/') || propre.startsWith('icons/') ? `/${propre}` : `/media/${propre}`;
  return prefixerBase(complet, base());
}

/** URL de la page d'un cours à partir de son id (« react/06-usestate »). */
export function urlCours(id: string): string {
  return url(`/cours/${id}/`);
}

/** URL de la page d'un tome (matière). */
export function urlTome(matiere: string): string {
  return url(`/tomes/${matiere}/`);
}
