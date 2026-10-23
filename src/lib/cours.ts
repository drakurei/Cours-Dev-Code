/**
 * Cours : fonctions pures (testables) + lectures de collection côté build.
 * Les fonctions pures acceptent n'importe quelle entrée { id, data, body } :
 * CollectionEntry<'cours'> convient tel quel.
 */
import type { Cours, Definition } from './schema.ts';
import { numeroDepuisNom } from './frontmatter.ts';
import { dureeLecture, normaliser } from './texte.ts';
import { matiereOuDefaut, trierMatieres, type EntreeMatiere, type MatiereVue } from './matieres.ts';
import { urlCours } from './url.ts';

/** Forme minimale d'une entrée de cours (compatible CollectionEntry<'cours'>). */
export interface EntreeCours {
  id: string;
  data: Cours;
  body?: string | undefined;
}

/** Cours prêt à afficher. `entree` garde l'objet d'origine (pour render()). */
export interface CoursVue<E extends EntreeCours = EntreeCours> {
  id: string;
  /** Dernière partie de l'id : « 06-usestate ». */
  slug: string;
  data: Cours;
  matiere: MatiereVue;
  chapitre: number;
  /** Minutes (frontmatter ou calculée depuis le texte). */
  duree: number;
  url: string;
  estProjet: boolean;
  entree: E;
}

export interface Voisins<E extends EntreeCours = EntreeCours> {
  precedent: CoursVue<E> | null;
  suivant: CoursVue<E> | null;
}

export interface DefinitionGlobale extends Definition {
  coursId: string;
  coursTitre: string;
  chapitre: number;
  matiere: MatiereVue;
  url: string;
  /** Lettre de l'index A-Z (« # » pour les chiffres et symboles). */
  lettre: string;
}

export interface Section {
  id: string;
  titre: string;
}

export interface Tome<E extends EntreeCours = EntreeCours> {
  matiere: MatiereVue;
  cours: CoursVue<E>[];
  /** Somme des durées, en minutes. */
  duree: number;
}

// ─── Pur ─────────────────────────────────────────────────────────────────────

/** Numéro d'épisode : frontmatter, sinon NN du nom de fichier, sinon 0. */
export function chapitreDe(e: EntreeCours): number {
  return e.data.chapitre ?? numeroDepuisNom(e.id) ?? 0;
}

/** Durée en minutes : frontmatter, sinon calculée depuis le corps. */
export function dureeDe(e: EntreeCours): number {
  return e.data.duree ?? dureeLecture(e.body ?? '');
}

export function estProjet(e: EntreeCours | CoursVue): boolean {
  return e.data.type === 'projet';
}

export function estPublie(e: EntreeCours | CoursVue): boolean {
  return !e.data.brouillon;
}

export function versVue<E extends EntreeCours>(e: E, matieres: ReadonlyArray<EntreeMatiere>): CoursVue<E> {
  return {
    id: e.id,
    slug: e.id.split('/').pop() ?? e.id,
    data: e.data,
    matiere: matiereOuDefaut(e.data.matiere, matieres),
    chapitre: chapitreDe(e),
    duree: dureeDe(e),
    url: urlCours(e.id),
    estProjet: estProjet(e),
    entree: e,
  };
}

/** Tri de lecture : ordre du tome, puis chapitre, puis titre. */
export function trierCours<C extends CoursVue>(liste: ReadonlyArray<C>): C[] {
  return [...liste].sort(
    (a, b) =>
      a.matiere.ordre - b.matiere.ordre ||
      a.matiere.slug.localeCompare(b.matiere.slug) ||
      a.chapitre - b.chapitre ||
      a.data.titre.localeCompare(b.data.titre, 'fr'),
  );
}

/** Vues publiées (sans brouillons) et triées. */
export function preparerCours<E extends EntreeCours>(
  entrees: ReadonlyArray<E>,
  matieres: ReadonlyArray<EntreeMatiere>,
): CoursVue<E>[] {
  return trierCours(entrees.filter(estPublie).map((e) => versVue(e, matieres)));
}

export function coursDeMatiere<C extends CoursVue>(slug: string, liste: ReadonlyArray<C>): C[] {
  return liste.filter((c) => c.matiere.slug === slug);
}

/** Épisodes voisins dans le même tome (la liste doit être triée). */
export function precedentSuivant<E extends EntreeCours>(id: string, liste: ReadonlyArray<CoursVue<E>>): Voisins<E> {
  const courant = liste.find((c) => c.id === id);
  if (!courant) return { precedent: null, suivant: null };
  const tome = coursDeMatiere(courant.matiere.slug, liste);
  const i = tome.findIndex((c) => c.id === id);
  return { precedent: tome[i - 1] ?? null, suivant: tome[i + 1] ?? null };
}

/** Lettre d'index : « État » → « E », « 3D » → « # ». */
export function lettreIndex(terme: string): string {
  const c = normaliser(terme).charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : '#';
}

/** Toutes les définitions de tous les cours, triées A-Z (glossaire). */
export function definitionsGlobales(liste: ReadonlyArray<CoursVue>): DefinitionGlobale[] {
  const toutes: DefinitionGlobale[] = [];
  for (const c of liste) {
    for (const d of c.data.definitions) {
      toutes.push({
        ...d,
        coursId: c.id,
        coursTitre: c.data.titre,
        chapitre: c.chapitre,
        matiere: c.matiere,
        url: c.url,
        lettre: lettreIndex(d.terme),
      });
    }
  }
  return toutes.sort((a, b) => normaliser(a.terme).localeCompare(normaliser(b.terme), 'fr'));
}

/** Notions d'un cours (les ##) à partir des headings de render(). */
export function sectionsDuCours(headings: ReadonlyArray<{ depth: number; slug: string; text: string }>): Section[] {
  return headings
    .filter((h) => h.depth === 2 && h.slug !== 'footnote-label') // titre caché des notes GFM
    .map((h) => ({ id: h.slug, titre: h.text.trim() }));
}

/** Regroupe les cours par tome : matières déclarées + matières inconnues utilisées par un cours. */
export function regrouperEnTomes<E extends EntreeCours>(
  liste: ReadonlyArray<CoursVue<E>>,
  matieres: ReadonlyArray<EntreeMatiere>,
): Tome<E>[] {
  const parSlug = new Map<string, MatiereVue>();
  for (const m of matieres) parSlug.set(m.id, matiereOuDefaut(m.id, matieres));
  for (const c of liste) if (!parSlug.has(c.matiere.slug)) parSlug.set(c.matiere.slug, c.matiere);
  return trierMatieres([...parSlug.values()]).map((matiere) => {
    const cours = coursDeMatiere(matiere.slug, liste);
    return { matiere, cours, duree: cours.reduce((s, c) => s + c.duree, 0) };
  });
}

/** Les plus récents d'abord (date du frontmatter), à date égale l'ordre de lecture. */
export function coursRecents<C extends CoursVue>(liste: ReadonlyArray<C>, n = 4): C[] {
  return [...liste]
    .filter((c) => c.data.date)
    .sort((a, b) => (b.data.date ?? '').localeCompare(a.data.date ?? ''))
    .slice(0, n);
}

// ─── Build (astro:content) ───────────────────────────────────────────────────

/** Tous les cours publiés, triés (matière.ordre puis chapitre). Côté build uniquement. */
export async function coursPublies() {
  const { getCollection } = await import('astro:content');
  const [entrees, matieres] = await Promise.all([getCollection('cours'), getCollection('matieres')]);
  return preparerCours(entrees, matieres);
}

/** Tous les tomes avec leurs cours publiés. Côté build uniquement. */
export async function tomesPublies() {
  const { getCollection } = await import('astro:content');
  const [entrees, matieres] = await Promise.all([getCollection('cours'), getCollection('matieres')]);
  return regrouperEnTomes(preparerCours(entrees, matieres), matieres);
}
