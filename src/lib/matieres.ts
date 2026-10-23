/**
 * Matières (tomes). Fonctions pures + une lecture de collection côté build.
 */
import type { Couleur, Matiere } from './schema.ts';

/** Matière prête à afficher : toujours complète, même si le YAML manque. */
export interface MatiereVue extends Matiere {
  slug: string;
  /** true si aucun fichier src/content/matieres/<slug>.yaml n'existe. */
  parDefaut: boolean;
}

/** Forme minimale d'une entrée de collection (compatible CollectionEntry<'matieres'>). */
export interface EntreeMatiere {
  id: string;
  data: Matiere;
}

/** Libellé lisible d'un slug : « html-css » → « Html css ». */
function nomDepuisSlug(slug: string): string {
  const s = slug.replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Matière par son slug, ou une matière par défaut (kanji = 1re lettre en majuscule, couleur sumi). */
export function matiereOuDefaut(slug: string, liste: ReadonlyArray<EntreeMatiere>): MatiereVue {
  const trouvee = liste.find((m) => m.id === slug);
  if (trouvee) return { ...trouvee.data, slug, parDefaut: false };
  return {
    slug,
    nom: nomDepuisSlug(slug),
    kanji: (slug.charAt(0) || '?').toUpperCase(),
    couleur: 'sumi',
    description: '',
    ordre: 999,
    parDefaut: true,
  };
}

/** Tri des tomes : ordre puis nom. */
export function trierMatieres<T extends Pick<Matiere, 'ordre' | 'nom'>>(liste: ReadonlyArray<T>): T[] {
  return [...liste].sort((a, b) => a.ordre - b.ordre || a.nom.localeCompare(b.nom, 'fr'));
}

/** Variable CSS d'accent d'une couleur de matière (définies dans tokens.css). */
export function varCouleur(couleur: Couleur): string {
  return `var(--m-${couleur})`;
}

/** Toutes les matières déclarées (YAML), triées. Côté build uniquement. */
export async function toutesLesMatieres(): Promise<MatiereVue[]> {
  const { getCollection } = await import('astro:content');
  const entrees = await getCollection('matieres');
  return trierMatieres(entrees.map((e) => ({ ...e.data, slug: e.id, parDefaut: false })));
}
