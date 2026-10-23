/**
 * Petits outils de texte, purs et sans dépendance (navigateur, Node, build).
 */

/** Minuscules, sans accents ni espaces superflus : sert aux recherches et aux tris. */
export function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Nombre de mots d'un texte Markdown (le code et la syntaxe sont comptés grossièrement). */
export function compterMots(texte: string): number {
  const nettoye = texte
    .replace(/^---[\s\S]*?---/, ' ') // frontmatter éventuel
    .replace(/[#>*_`~[\]()!|:{}-]+/g, ' ');
  const mots = nettoye.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu);
  return mots ? mots.length : 0;
}

/** Durée de lecture en minutes (≈ 200 mots/min), minimum 1. */
export function dureeLecture(texte: string, motsParMinute = 200): number {
  return Math.max(1, Math.round(compterMots(texte) / motsParMinute));
}

/** « Réagir à un clic ! » → « reagir-a-un-clic » (identifiants, ancres, noms de fichiers). */
export function slugifier(texte: string): string {
  return normaliser(texte)
    .replace(/['’]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/** Empreinte courte et stable (djb2 → base 36) : même texte = même résultat, partout. */
export function hashCourt(texte: string): string {
  let h = 5381;
  for (let i = 0; i < texte.length; i++) {
    h = ((h << 5) + h + texte.charCodeAt(i)) | 0; // h * 33 + c, sur 32 bits
  }
  return (h >>> 0).toString(36);
}

/** Identifiant d'une flashcard : `${coursId}::${hash(question)}` (contrat §6). */
export function idCarte(coursId: string, question: string): string {
  return `${coursId}::${hashCourt(normaliser(question))}`;
}

/** Coupe proprement un texte trop long, sur un mot, avec « … ». */
export function tronquer(texte: string, max: number): string {
  if (texte.length <= max) return texte;
  const coupe = texte.slice(0, max - 1);
  const dernierEspace = coupe.lastIndexOf(' ');
  return `${(dernierEspace > max * 0.6 ? coupe.slice(0, dernierEspace) : coupe).trimEnd()}…`;
}

/** 1 → « 1 carte », 3 → « 3 cartes » (pluriel simple). */
export function pluriel(n: number, singulier: string, plurielForme = `${singulier}s`): string {
  return `${n} ${n > 1 ? plurielForme : singulier}`;
}
