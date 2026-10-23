/**
 * Tirage aléatoire REPRODUCTIBLE (même graine = même tirage) : quiz éclair, tests.
 * Pur, sans dépendance.
 */

/** Générateur mulberry32 : nombres dans [0, 1). */
export function generateur(graine: number): () => number {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Graine stable depuis un texte (« 2026-10-08 », « react »…). */
export function graineDepuis(texte: string): number {
  let h = 2166136261;
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Copie mélangée (Fisher-Yates) ; la liste d'origine n'est pas touchée. */
export function melanger<T>(liste: ReadonlyArray<T>, graine: number): T[] {
  const sortie = [...liste];
  const alea = generateur(graine);
  for (let i = sortie.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [sortie[i], sortie[j]] = [sortie[j] as T, sortie[i] as T];
  }
  return sortie;
}

/** `n` éléments distincts tirés au hasard (tous si la liste est plus courte). */
export function tirer<T>(liste: ReadonlyArray<T>, n: number, graine: number): T[] {
  return melanger(liste, graine).slice(0, Math.max(0, Math.floor(n)));
}
