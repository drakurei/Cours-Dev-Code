/**
 * Plugin rehype : préfixe la base du site (« /Cours-Dev-Code ») aux liens absolus.
 * « /media/react/schema.png » → « /Cours-Dev-Code/media/react/schema.png ».
 * Ne touche ni aux liens externes, ni à « //cdn… », ni aux chemins déjà préfixés.
 */
import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

export interface OptionsBaseUrl {
  /** Base du site, ex. « /Cours-Dev-Code ». « / » ou « » = rien à faire. */
  base: string;
}

/** Attributs qui contiennent une URL. */
const ATTRIBUTS = ['src', 'href', 'data', 'poster'] as const;

/** Préfixe un chemin si (et seulement si) il commence par UN seul « / ». */
export function prefixerChemin(valeur: string, base: string): string {
  const b = base.replace(/\/+$/, '');
  if (!b || !valeur.startsWith('/') || valeur.startsWith('//')) return valeur;
  if (valeur === b || valeur.startsWith(`${b}/`)) return valeur; // déjà préfixé
  return `${b}${valeur}`;
}

export function rehypeBaseUrl(options: OptionsBaseUrl) {
  const base = options?.base ?? '';
  return (tree: Root) => {
    if (!base.replace(/\/+$/, '')) return;
    visit(tree, 'element', (node) => {
      for (const attr of ATTRIBUTS) {
        const v = node.properties[attr];
        if (typeof v === 'string') node.properties[attr] = prefixerChemin(v, base);
      }
    });
  };
}
