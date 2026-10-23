/**
 * Chargement paresseux de la recherche : /search-index.json + MiniSearch (import dynamique).
 * Une seule fois par page ; un échec (hors ligne) autorise un nouvel essai plus tard.
 */
import type MiniSearch from 'minisearch';
import { url } from '../../lib/url.ts';
import type { DocRecherche, IndexRecherche } from '../../lib/recherche/types.ts';
import { creerMoteur, type Moteur } from '../../lib/recherche/moteur.ts';

export interface Recherche {
  index: IndexRecherche;
  moteur: Moteur;
}

let enCours: Promise<{ index: IndexRecherche; MS: typeof MiniSearch }> | null = null;

function estIndex(v: unknown): v is IndexRecherche {
  const o = v as Partial<IndexRecherche> | null;
  return !!o && o.version === 1 && Array.isArray(o.documents) && typeof o.matieres === 'object';
}

/** Télécharge l'index et la bibliothèque (en parallèle). */
export function prechargerRecherche(): Promise<{ index: IndexRecherche; MS: typeof MiniSearch }> {
  enCours ??= Promise.all([
    fetch(url('/search-index.json'), { headers: { Accept: 'application/json' } }).then(async (r) => {
      if (!r.ok) throw new Error(`Index introuvable (${r.status})`);
      const json: unknown = await r.json();
      if (!estIndex(json)) throw new Error('Index illisible');
      return json;
    }),
    import('minisearch').then((m) => m.default),
  ]).then(([index, MS]) => ({ index, MS }));
  enCours.catch(() => {
    enCours = null;
  });
  return enCours;
}

/** Index + moteur prêt, avec les documents propres à la page (actions, pages). */
export async function chargerRecherche(supplements: ReadonlyArray<DocRecherche>): Promise<Recherche> {
  const { index, MS } = await prechargerRecherche();
  return { index, moteur: creerMoteur(MS, [...index.documents, ...supplements]) };
}

/** Repli sans index (hors ligne) : moteur sur les seules pages et actions, si MiniSearch répond. */
export async function moteurDeSecours(docs: ReadonlyArray<DocRecherche>): Promise<Moteur | null> {
  try {
    const MS = (await import('minisearch')).default;
    return creerMoteur(MS, docs);
  } catch {
    return null;
  }
}
