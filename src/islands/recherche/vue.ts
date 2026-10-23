/**
 * Modèle d'affichage de la palette : groupes et options (sans DOM, sans React).
 */
import type { Progression } from '../../lib/store.ts';
import type { Groupe, Resultat } from '../../lib/recherche/moteur.ts';
import type { DocRecherche } from '../../lib/recherche/types.ts';

export type GenreOption = 'doc' | 'recente' | 'effacer';

export interface OptionVue {
  /** Clé React et suffixe d'id DOM (unique dans la liste). */
  cle: string;
  genre: GenreOption;
  doc?: DocRecherche;
  /** Termes trouvés (surlignage) ; absent hors recherche. */
  resultat?: Resultat;
  /** Requête récente à remettre dans le champ. */
  recente?: string;
  /** Option mise en avant (« Meilleur résultat »). */
  meilleur?: boolean;
}

export interface GroupeVue {
  cle: string;
  titre: string;
  options: OptionVue[];
}

/** Cours les plus récemment ouverts (ids), du plus récent au plus ancien. */
export function derniersCours(progression: Progression, n = 3): string[] {
  return Object.entries(progression)
    .filter(([, p]) => !!p.derniereVisite)
    .sort(([, a], [, b]) => b.derniereVisite.localeCompare(a.derniereVisite))
    .slice(0, n)
    .map(([id]) => id);
}

const optionDoc = (prefixe: string, doc: DocRecherche): OptionVue => ({ cle: `${prefixe}:${doc.id}`, genre: 'doc', doc });

export interface SourcesVides {
  /** Documents de l'index (null tant qu'il charge). */
  docs: Map<string, DocRecherche> | null;
  progression: Progression;
  recentes: ReadonlyArray<string>;
  actions: ReadonlyArray<DocRecherche>;
  pages: ReadonlyArray<DocRecherche>;
}

/** Palette ouverte sans requête : Reprendre, Recherches récentes, Actions, Pages. */
export function groupesVides({ docs, progression, recentes, actions, pages }: SourcesVides): GroupeVue[] {
  const groupes: GroupeVue[] = [];

  if (docs) {
    const reprendre = derniersCours(progression)
      .map((id) => docs.get(`cours:${id}`))
      .filter((d): d is DocRecherche => !!d);
    if (reprendre.length) groupes.push({ cle: 'reprendre', titre: 'Reprendre', options: reprendre.map((d) => optionDoc('reprendre', d)) });
  }

  if (recentes.length) {
    groupes.push({
      cle: 'recentes',
      titre: 'Recherches récentes',
      options: [
        ...recentes.map((r, i): OptionVue => ({ cle: `recente:${i}`, genre: 'recente', recente: r })),
        { cle: 'effacer', genre: 'effacer' },
      ],
    });
  }

  if (actions.length) groupes.push({ cle: 'action', titre: 'Actions', options: actions.map((d) => optionDoc('action', d)) });
  if (pages.length) groupes.push({ cle: 'page', titre: 'Pages', options: pages.map((d) => optionDoc('page', d)) });
  return groupes;
}

/** Résultats d'une recherche → groupes affichés ; `enPlus` s'ajoute aux Actions (glossaire). */
export function groupesRecherche(groupes: ReadonlyArray<Groupe>, enPlus: ReadonlyArray<DocRecherche> = []): GroupeVue[] {
  const vues: GroupeVue[] = groupes.map((g) => ({
    cle: g.cle,
    titre: g.titre,
    options: g.resultats.map((r) => ({ cle: `${g.cle}:${r.doc.id}`, genre: 'doc', doc: r.doc, resultat: r, meilleur: g.cle === 'meilleur' })),
  }));
  if (enPlus.length) {
    const options = enPlus.map((d) => optionDoc('plus', d));
    const actions = vues.find((g) => g.cle === 'action');
    if (actions) actions.options.push(...options);
    else vues.push({ cle: 'action', titre: 'Actions', options });
  }
  return vues;
}

/** Liste à plat (navigation ↑ ↓ et aria-activedescendant). */
export function aplatir(groupes: ReadonlyArray<GroupeVue>): OptionVue[] {
  return groupes.flatMap((g) => g.options);
}
