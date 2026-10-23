/**
 * Données posées au build par src/pages/index.astro, lues une seule fois côté navigateur :
 *   script#ordre-de-lecture  Episode[] (ordre des tomes puis des chapitres)
 *   script#cartes-accueil    string[]  (ids de toutes les flashcards publiées)
 * Lire le DOM plutôt que des props évite de répéter ces listes dans chaque îlot.
 */
import type { Episode } from './logique.ts';

export interface CarteRef {
  id: string;
  coursId: string;
}

function lireJson(id: string): unknown {
  try {
    return JSON.parse(document.getElementById(id)?.textContent ?? 'null');
  } catch {
    return null;
  }
}

const texte = (v: unknown): v is string => typeof v === 'string';

/** Garde seulement les épisodes bien formés (le JSON vient du build, mais prudence). */
export function validerEpisodes(brut: unknown): Episode[] {
  if (!Array.isArray(brut)) return [];
  const sortie: Episode[] = [];
  for (const e of brut) {
    if (!e || typeof e !== 'object') continue;
    const o = e as Record<string, unknown>;
    if (!texte(o.id) || !texte(o.url) || !texte(o.titre)) continue;
    sortie.push({
      id: o.id,
      url: o.url,
      titre: o.titre,
      chapitre: typeof o.chapitre === 'number' ? o.chapitre : 0,
      matiere: texte(o.matiere) ? o.matiere : '',
      duree: typeof o.duree === 'number' && o.duree > 0 ? o.duree : 1,
      essentiel: texte(o.essentiel) ? o.essentiel : '',
      ...(texte(o.kanji) ? { kanji: o.kanji } : {}),
      ...(texte(o.couleur) ? { couleur: o.couleur } : {}),
      ...(Array.isArray(o.notions) ? { notions: o.notions.filter(texte) } : {}),
    });
  }
  return sortie;
}

/** Ids de cartes → {id, coursId} (l'id commence par l'id du cours : `${coursId}::${hash}`). */
export function validerCartes(brut: unknown): CarteRef[] {
  if (!Array.isArray(brut)) return [];
  return brut.filter(texte).flatMap((id) => {
    const i = id.lastIndexOf('::');
    return i > 0 ? [{ id, coursId: id.slice(0, i) }] : [];
  });
}

let episodes: Episode[] | null = null;
let cartes: CarteRef[] | null = null;

export function lireEpisodes(): Episode[] {
  return (episodes ??= validerEpisodes(lireJson('ordre-de-lecture')));
}

export function lireCartes(): CarteRef[] {
  return (cartes ??= validerCartes(lireJson('cartes-accueil')));
}
