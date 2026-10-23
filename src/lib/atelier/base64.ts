/**
 * Base64 sûr pour l'UTF-8 et les fichiers binaires (API GitHub Contents, API Claude).
 * btoa() seul casse sur « é » ou « 学 » : on passe toujours par des octets.
 * Pur, sans dépendance : navigateur et Node 24 (btoa/atob globaux).
 */

/** Taille des tranches : String.fromCharCode(...tranche) ne dépasse pas la pile. */
const TRANCHE = 0x8000;

/** Octets → base64 (sans retour à la ligne, comme l'attendent GitHub et Claude). */
export function octetsVersBase64(octets: Uint8Array): string {
  let binaire = '';
  for (let i = 0; i < octets.length; i += TRANCHE) {
    binaire += String.fromCharCode(...octets.subarray(i, i + TRANCHE));
  }
  return btoa(binaire);
}

/** Texte (UTF-8) → base64. */
export function texteVersBase64(texte: string): string {
  return octetsVersBase64(new TextEncoder().encode(texte));
}

/** base64 → octets. Les retours à la ligne (réponses de GitHub) sont tolérés. */
export function base64VersOctets(base64: string): Uint8Array {
  const binaire = atob(base64.replace(/\s+/g, ''));
  const octets = new Uint8Array(binaire.length);
  for (let i = 0; i < binaire.length; i++) octets[i] = binaire.charCodeAt(i);
  return octets;
}

/** base64 → texte UTF-8. */
export function base64VersTexte(base64: string): string {
  return new TextDecoder().decode(base64VersOctets(base64));
}

/** Taille réelle (en octets) d'une chaîne base64 une fois décodée. */
export function tailleDecodee(base64: string): number {
  const propre = base64.replace(/\s+/g, '');
  const remplissage = propre.endsWith('==') ? 2 : propre.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((propre.length * 3) / 4) - remplissage);
}

/** « 1,4 Mo », « 320 Ko », « 12 o ». */
export function tailleLisible(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`;
}
