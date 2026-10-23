/**
 * Normalisation pour la recherche : accents et majuscules ignorés, mots vides retirés.
 * La même fonction sert à l'index, à la requête, au surlignage et au filtre du glossaire.
 */
import { normaliser } from '../texte.ts';

export { normaliser };

/** Mots trop courants pour aider à trouver (déjà normalisés). */
export const MOTS_VIDES: ReadonlySet<string> = new Set([
  'a', 'au', 'aux', 'c', 'ce', 'ces', 'd', 'de', 'des', 'du', 'en', 'et', 'j', 'l', 'la', 'le', 'les',
  'm', 'n', 'ou', 'par', 'pour', 's', 'sa', 'se', 'ses', 'son', 'sur', 't', 'un', 'une',
  'the', 'of', 'to', 'and',
]);

/** Découpe en mots : tout ce qui n'est ni lettre ni chiffre sépare (comme MiniSearch). */
const SEPARATEUR = /[^\p{L}\p{N}]+/u;

/** Terme pour l'index et la requête : normalisé, ou null s'il ne sert à rien. */
export function traiterTerme(terme: string): string | null {
  const t = normaliser(terme);
  return t && !MOTS_VIDES.has(t) ? t : null;
}

/** Mots utiles d'une requête, normalisés (« L'état d'un composant » → ["etat", "composant"]). */
export function motsRequete(requete: string): string[] {
  return normaliser(requete)
    .split(SEPARATEUR)
    .filter((m) => m && !MOTS_VIDES.has(m));
}

/** Vrai si tous les mots de la requête apparaissent dans le texte déjà normalisé. */
export function correspond(texteNormalise: string, mots: ReadonlyArray<string>): boolean {
  return mots.every((m) => texteNormalise.includes(m));
}

/**
 * Clé de regroupement d'un terme du glossaire : sans accents, sans casse, sans précision
 * entre parenthèses ni ponctuation. « État (state) », « état » et « Etat » → « etat » ;
 * « .map() » → « map » ; « Pull Request (PR) » → « pull request ».
 */
export function cleTerme(terme: string): string {
  const n = normaliser(terme);
  const sansPrecision = n
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^\p{L}\p{N}#+]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
  return sansPrecision || n;
}

/** Précision entre parenthèses d'un terme : « Itération (prompt) » → « prompt ». */
export function precisionTerme(terme: string): string {
  const m = /\(([^)]+)\)\s*$/.exec(terme.trim());
  return m?.[1]?.trim() ?? '';
}

/** Terme sans sa précision finale : « Product Owner (PO) » → « Product Owner ». */
export function baseTerme(terme: string): string {
  const base = terme.replace(/\s*\([^)]*\)\s*$/, '').trim();
  return base || terme.trim();
}
