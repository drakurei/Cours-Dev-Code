/**
 * Glossaire : un même terme défini dans plusieurs cours (ou tomes) = UNE entrée,
 * avec toutes ses définitions et les tomes concernés. Pur et générique (testable).
 */
import { lettreIndex } from '../cours.ts';
import { baseTerme, cleTerme, normaliser } from './normaliser.ts';

/** Ce qu'il faut savoir d'une définition pour la regrouper. */
export interface DefinitionSource {
  terme: string;
  /** Slug de la matière (tome). */
  matiere: string;
  /** Ordre du tome (tri des définitions et des puces). */
  ordreMatiere: number;
  chapitre: number;
}

export interface EntreeGlossaire<D extends DefinitionSource> {
  /** Clé normalisée (sert d'ancre : « terme-<cle> »). */
  cle: string;
  /** Terme affiché. */
  terme: string;
  /** Lettre de l'index A-Z (« # » pour chiffres et symboles). */
  lettre: string;
  /** Définitions, dans l'ordre des tomes puis des épisodes. */
  definitions: D[];
  /** Slugs des tomes concernés, sans doublon, dans l'ordre des tomes. */
  matieres: string[];
}

/**
 * Terme affiché d'un groupe : l'orthographe commune si toutes les définitions l'écrivent pareil
 * (casse et accents ignorés), sinon la forme sans précision de la première
 * (« Itération (prompt) » + « Itération » → « Itération »).
 */
export function termeCommun(termes: ReadonlyArray<string>): string {
  const premier = termes[0]?.trim() ?? '';
  const tousPareils = termes.every((t) => normaliser(t) === normaliser(premier));
  if (tousPareils) return premier;
  const sansPrecision = termes.find((t) => normaliser(baseTerme(t)) === normaliser(t));
  return sansPrecision?.trim() ?? baseTerme(premier);
}

/** Regroupe les définitions par terme et trie les entrées de A à Z. */
export function regrouperTermes<D extends DefinitionSource>(definitions: ReadonlyArray<D>): EntreeGlossaire<D>[] {
  const groupes = new Map<string, D[]>();
  for (const d of definitions) {
    const cle = cleTerme(d.terme);
    const liste = groupes.get(cle);
    if (liste) liste.push(d);
    else groupes.set(cle, [d]);
  }

  const entrees: EntreeGlossaire<D>[] = [];
  for (const [cle, liste] of groupes) {
    const triees = [...liste].sort((a, b) => a.ordreMatiere - b.ordreMatiere || a.matiere.localeCompare(b.matiere) || a.chapitre - b.chapitre);
    const terme = termeCommun(triees.map((d) => d.terme));
    entrees.push({
      cle,
      terme,
      lettre: lettreIndex(cle),
      definitions: triees,
      matieres: [...new Set(triees.map((d) => d.matiere))],
    });
  }

  return entrees.sort((a, b) => {
    // « # » (chiffres et symboles) à la fin, comme l'index.
    if (a.lettre === '#' && b.lettre !== '#') return 1;
    if (b.lettre === '#' && a.lettre !== '#') return -1;
    return a.cle.localeCompare(b.cle, 'fr') || a.terme.localeCompare(b.terme, 'fr');
  });
}

/** Lettres présentes, dans l'ordre A → Z puis « # ». */
export function lettresPresentes(entrees: ReadonlyArray<{ lettre: string }>): string[] {
  const set = new Set(entrees.map((e) => e.lettre));
  return [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#'].filter((l) => set.has(l));
}

/** Ancre d'une entrée : « terme-etat », « terme-pull-request ». */
export function ancreTerme(cle: string): string {
  const slug = cle
    .replace(/#/g, '-diese')
    .replace(/\+/g, '-plus')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `terme-${slug || 'symbole'}`;
}

/** Ancre d'une lettre de l'index : « lettre-a », « lettre-autres » pour « # ». */
export function ancreLettre(lettre: string): string {
  return lettre === '#' ? 'lettre-autres' : `lettre-${lettre.toLowerCase()}`;
}
