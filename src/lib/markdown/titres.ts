/**
 * Titres et notions.
 *
 * rehypeTitres  : id stable et lisible sur chaque h2-h4 (« Réagir à un clic » → « reagir-a-un-clic »),
 *                 sans doublon, sans jamais réutiliser un id réservé par la page du cours.
 * rehypeNotions : chaque ## de premier niveau + son contenu → <section class="notion" data-notion="id">
 *                 (une notion = une étape du Mode Focus, une « section vue »).
 */
import type { Element, ElementContent, Root, RootContent } from 'hast';
import { visit } from 'unist-util-visit';
import { slugifier } from '../texte.ts';

/** Ids déjà utilisés par la page d'un cours : un titre ne peut pas les prendre. */
export const IDS_RESERVES = [
  'contenu',
  'contenu-cours',
  'essentiel',
  'retenir',
  'documents',
  'definitions',
  'exercices',
  'quiz',
  'flashcards',
  'fiche-projet',
  'fin-du-cours',
  'sommaire',
  'navigation',
  'recherche',
] as const;

const TITRES = new Set(['h2', 'h3', 'h4']);

/** Texte visible d'un élément hast. */
export function texteHast(n: Element | ElementContent | RootContent): string {
  if (n.type === 'text') return n.value;
  if ('children' in n) return n.children.map((c) => texteHast(c as ElementContent)).join('');
  return '';
}

/** Distributeur d'ids uniques : « exemple », « exemple-2 »… */
export function creerSlugger(reserves: Iterable<string> = IDS_RESERVES) {
  const pris = new Set<string>(reserves);
  return (texte: string): string => {
    const base = slugifier(texte) || 'notion';
    let id = base;
    for (let i = 2; pris.has(id); i++) id = `${base}-${i}`;
    pris.add(id);
    return id;
  };
}

export function rehypeTitres() {
  return (tree: Root) => {
    const slug = creerSlugger();
    visit(tree, 'element', (node) => {
      if (!TITRES.has(node.tagName)) return;
      const existant = node.properties.id;
      node.properties.id = typeof existant === 'string' && existant ? slug(existant) : slug(texteHast(node));
    });
  };
}

/** <section data-footnotes> générée par GFM. */
function estNotesDeBasDePage(n: RootContent): boolean {
  return n.type === 'element' && n.tagName === 'section' && n.properties.dataFootnotes !== undefined;
}

/** Id du titre caché des notes de bas de page (à exclure du sommaire). */
export const ID_TITRE_NOTES = 'footnote-label';

export function rehypeNotions() {
  return (tree: Root) => {
    const sortie: RootContent[] = [];
    let courante: Element | null = null;
    for (const enfant of tree.children) {
      if (enfant.type === 'element' && enfant.tagName === 'h2') {
        const id = typeof enfant.properties.id === 'string' ? enfant.properties.id : '';
        courante = {
          type: 'element',
          tagName: 'section',
          properties: { className: ['notion'], dataNotion: id },
          children: [enfant],
        };
        sortie.push(courante);
      } else if (estNotesDeBasDePage(enfant)) {
        courante = null; // les notes restent en dehors des notions, en fin de cours
        sortie.push(enfant);
      } else if (courante && enfant.type !== 'doctype') {
        courante.children.push(enfant);
      } else {
        sortie.push(enfant);
      }
    }
    tree.children = sortie;
  };
}
