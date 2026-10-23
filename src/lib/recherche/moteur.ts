/**
 * Moteur de recherche de la palette (MiniSearch) : options partagées, création, recherche groupée.
 * MiniSearch est passé en paramètre : la palette le charge en import dynamique, les tests en direct.
 */
import type MiniSearch from 'minisearch';
import type { Options, SearchResult } from 'minisearch';
import { motsRequete, normaliser, traiterTerme } from './normaliser.ts';
import type { DocRecherche, TypeDoc } from './types.ts';

/** Découpe en mots : tout ce qui n'est ni lettre ni chiffre sépare (« e.target.value » → 3 mots). */
export function decouper(texte: string): string[] {
  return texte.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

/** Parties d'un mot en camelCase : « getElementById » → ["get", "Element", "By", "Id"]. */
export function partiesCamel(mot: string): string[] {
  return mot.split(/(?<=\p{Ll})(?=\p{Lu})|(?<=\p{Lu})(?=\p{Lu}\p{Ll})|(?<=\p{L})(?=\p{N})|(?<=\p{N})(?=\p{L})/u);
}

/** Terme à indexer : le mot entier + ses parties camelCase (« useState » → usestate, use, state). */
export function termesIndex(mot: string): string[] | null {
  const entier = traiterTerme(mot);
  if (!entier) return null;
  const parties = partiesCamel(mot);
  if (parties.length < 2) return [entier];
  const extra = parties.map((p) => traiterTerme(p)).filter((p): p is string => !!p && p.length > 1 && p !== entier);
  return [entier, ...new Set(extra)];
}

/** Poids par type de document (départage les égalités ; les pages courtes passent devant). */
export const POIDS_TYPES: Record<TypeDoc, number> = {
  page: 1.25,
  action: 1.2,
  cours: 1.15,
  definition: 1.05,
  notion: 1,
};

function typeDepuisId(id: string): TypeDoc {
  const t = id.slice(0, id.indexOf(':'));
  if (t === 'tome') return 'page';
  return (t in POIDS_TYPES ? t : 'notion') as TypeDoc;
}

/** Options MiniSearch : accents ignorés, recherche floue et par préfixe, titre prioritaire. */
export function optionsMoteur(): Options<DocRecherche> {
  return {
    idField: 'id',
    fields: ['titre', 'motsCles', 'texte'],
    storeFields: [],
    tokenize: decouper,
    extractField: (doc, champ) => {
      const v = (doc as unknown as Record<string, unknown>)[champ];
      return typeof v === 'string' ? v : '';
    },
    processTerm: termesIndex,
    searchOptions: {
      tokenize: decouper,
      processTerm: traiterTerme,
      boost: { titre: 4, motsCles: 2, texte: 1 },
      prefix: true,
      fuzzy: (terme) => (terme.length >= 4 ? 0.2 : false),
      maxFuzzy: 2,
      combineWith: 'AND',
      boostDocument: (id) => POIDS_TYPES[typeDepuisId(String(id))],
    },
  };
}

export interface Moteur {
  ms: MiniSearch<DocRecherche>;
  docs: Map<string, DocRecherche>;
}

/** Crée le moteur et indexe les documents (ids en double ignorés : le premier gagne). */
export function creerMoteur(MS: typeof MiniSearch, documents: ReadonlyArray<DocRecherche>): Moteur {
  const docs = new Map<string, DocRecherche>();
  for (const d of documents) if (!docs.has(d.id)) docs.set(d.id, d);
  const ms = new MS(optionsMoteur());
  ms.addAll([...docs.values()]);
  return { ms, docs };
}

// ─── Recherche groupée ───────────────────────────────────────────────────────

export type CleGroupe = 'meilleur' | TypeDoc;

export interface Resultat {
  doc: DocRecherche;
  score: number;
  /** Termes du document qui correspondent (normalisés), pour le surlignage. */
  termes: string[];
  /** Mots de la requête (normalisés). */
  requete: string[];
}

export interface Groupe {
  cle: CleGroupe;
  titre: string;
  resultats: Resultat[];
}

export const TITRES_GROUPES: Record<CleGroupe, string> = {
  meilleur: 'Meilleur résultat',
  cours: 'Cours',
  notion: 'Notions',
  definition: 'Définitions',
  page: 'Pages',
  action: 'Actions',
};

/** Ordre fixe des groupes (toujours la même structure). */
export const ORDRE_GROUPES: ReadonlyArray<TypeDoc> = ['cours', 'notion', 'definition', 'page', 'action'];

export const LIMITES_GROUPES: Record<TypeDoc, number> = { cours: 4, notion: 5, definition: 4, page: 3, action: 3 };

export interface OptionsChercher {
  limites?: Partial<Record<TypeDoc, number>>;
  /** Garde seulement les documents qui passent (ex. : action Focus hors d'un cours). */
  filtre?: (doc: DocRecherche) => boolean;
  /** « Meilleur résultat » en tête (défaut : oui, dès 2 résultats). */
  meilleur?: boolean;
}

/** Bonus quand le titre correspond à la requête mot pour mot ou la commence. */
function bonusTitre(doc: DocRecherche, requeteNormalisee: string): number {
  const titre = normaliser(doc.titre);
  if (titre === requeteNormalisee) return 2;
  if (titre.startsWith(requeteNormalisee)) return 1.35;
  return 1;
}

/** Résultats bruts triés (ET entre les mots, puis OU si rien ne sort). */
export function rechercher(moteur: Moteur, requete: string, filtre?: (doc: DocRecherche) => boolean): Resultat[] {
  const mots = motsRequete(requete);
  if (!mots.length) return [];
  const accepter = (r: SearchResult) => {
    const d = moteur.docs.get(String(r.id));
    return !!d && (!filtre || filtre(d));
  };
  let bruts = moteur.ms.search(requete, { filter: accepter });
  if (!bruts.length && mots.length > 1) bruts = moteur.ms.search(requete, { filter: accepter, combineWith: 'OR' });

  const q = normaliser(requete);
  return bruts
    .map((r) => {
      const doc = moteur.docs.get(String(r.id)) as DocRecherche;
      return { doc, score: r.score * bonusTitre(doc, q), termes: r.terms, requete: mots };
    })
    .sort((a, b) => b.score - a.score);
}

/** Recherche groupée : « Meilleur résultat », puis Cours, Notions, Définitions, Pages, Actions. */
export function chercher(moteur: Moteur, requete: string, options: OptionsChercher = {}): Groupe[] {
  const resultats = rechercher(moteur, requete, options.filtre);
  return grouper(resultats, options);
}

/** Regroupe des résultats triés par score (pur). */
export function grouper(resultats: ReadonlyArray<Resultat>, options: OptionsChercher = {}): Groupe[] {
  const limites = { ...LIMITES_GROUPES, ...options.limites };
  const groupes: Groupe[] = [];
  let reste = [...resultats];

  const meilleur = options.meilleur ?? true;
  if (meilleur && reste.length >= 2 && reste[0]) {
    groupes.push({ cle: 'meilleur', titre: TITRES_GROUPES.meilleur, resultats: [reste[0]] });
    reste = reste.slice(1);
  }

  for (const type of ORDRE_GROUPES) {
    const items = reste.filter((r) => r.doc.type === type).slice(0, limites[type]);
    if (items.length) groupes.push({ cle: type, titre: TITRES_GROUPES[type], resultats: items });
  }
  return groupes;
}

/**
 * Recherche de secours sans MiniSearch (index en chargement ou hors ligne) :
 * tous les mots doivent commencer un mot du titre ou des mots-clés.
 */
export function rechercheSimple(docs: ReadonlyArray<DocRecherche>, requete: string, filtre?: (doc: DocRecherche) => boolean): Resultat[] {
  const mots = motsRequete(requete);
  if (!mots.length) return [];
  const q = normaliser(requete);
  const sortie: Resultat[] = [];
  for (const doc of docs) {
    if (filtre && !filtre(doc)) continue;
    const termes = decouper(`${doc.titre} ${doc.motsCles ?? ''}`)
      .map((t) => traiterTerme(t))
      .filter((t): t is string => !!t);
    const trouves = mots.map((m) => termes.find((t) => t.startsWith(m)));
    if (trouves.some((t) => !t)) continue;
    sortie.push({ doc, score: POIDS_TYPES[doc.type] * bonusTitre(doc, q), termes: trouves as string[], requete: mots });
  }
  return sortie.sort((a, b) => b.score - a.score);
}

/** Nombre total de résultats affichés. */
export function compterResultats(groupes: ReadonlyArray<Groupe>): number {
  return groupes.reduce((n, g) => n + g.resultats.length, 0);
}
