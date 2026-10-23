/**
 * Identifiants uniques pour le HTML généré au build (filtres SVG, aria-labelledby…).
 * Compteur de module : stable d'un build à l'autre (même ordre de rendu).
 */
let compteur = 0;

export function idUnique(prefixe = 'id'): string {
  compteur = (compteur + 1) % 1_000_000;
  return `${prefixe}-${compteur.toString(36)}`;
}
