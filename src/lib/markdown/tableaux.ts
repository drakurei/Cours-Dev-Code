/**
 * Plugin rehype : enveloppe chaque <table> dans <div class="tableau"> qui défile
 * horizontalement sur mobile (et reste atteignable au clavier).
 */
import type { Element, Root } from 'hast';
import { SKIP, visit } from 'unist-util-visit';

const STRUCTURE_TABLEAU = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr']);

/**
 * À placer AVANT rehype-raw : retire les retours à la ligne entre les cellules.
 * Sinon le parseur HTML les « sort » du tableau (foster parenting) en une pile de lignes vides.
 */
export function rehypeNettoyerTableaux() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (!STRUCTURE_TABLEAU.has(node.tagName)) return;
      node.children = node.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
    });
  };
}

export function rehypeTableaux() {
  return (tree: Root) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'table' || !parent || index === undefined) return;
      if (parent.type === 'element' && parent.tagName === 'div' && String(parent.properties.className ?? '').includes('tableau')) return;
      const enveloppe: Element = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['tableau'], tabIndex: 0, role: 'region', ariaLabel: 'Tableau (défilable)' },
        children: [node],
      };
      parent.children[index] = enveloppe;
      return SKIP;
    });
  };
}
