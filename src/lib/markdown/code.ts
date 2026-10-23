/**
 * Blocs de code : même structure HTML sur le site (Shiki) et dans l'aperçu (sans couleurs).
 *
 *   ```jsx title="App.jsx"
 *   → <figure class="code" data-lang="jsx">
 *       <figcaption class="code__titre">App.jsx</figcaption>   (si title="…")
 *       <pre class="astro-code …">…</pre>
 *     </figure>
 *
 * Le bouton « Copier » est ajouté dans chaque figure.code par src/scripts/code.ts.
 */
import type { Code, Root as RacineMd } from 'mdast';
import type { Element, ElementContent, Root } from 'hast';
import { h } from 'hastscript';
import { SKIP, visit } from 'unist-util-visit';

/** Lit title="…" (ou titre="…", guillemets simples ou doubles) dans la meta d'un bloc de code. */
export function extraireTitre(meta: string | null | undefined): string | null {
  if (!meta) return null;
  const m = /(?:^|\s)(?:title|titre)=(?:"([^"]*)"|'([^']*)'|(\S+))/.exec(meta);
  const titre = (m?.[1] ?? m?.[2] ?? m?.[3] ?? '').trim();
  return titre || null;
}

/** Enveloppe un <pre> dans la figure commune. */
export function figureCode(pre: Element, langue: string, titre: string | null): Element {
  const enfants: ElementContent[] = [];
  if (titre) enfants.push(h('figcaption', { className: ['code__titre'] }, titre));
  enfants.push(pre);
  return h('figure', { className: ['code'], dataLang: langue || 'texte' }, enfants);
}

/**
 * Plugin remark : recopie la meta d'un bloc de code dans l'attribut `metastring` du <code>.
 * rehype-sanitize jette les données internes des nœuds ; cet attribut, lui, est autorisé
 * et Astro le lit pour Shiki (meta.__raw).
 */
export function remarkMetaCode() {
  return (tree: RacineMd) => {
    visit(tree, 'code', (node: Code) => {
      if (!node.meta) return;
      node.data = { ...node.data, hProperties: { ...(node.data?.hProperties ?? {}), metastring: node.meta } };
    });
  };
}

/** Langue d'un <code class="language-jsx"> (ou « texte »). */
function langueDe(code: Element): string {
  const brut: unknown = code.properties.className;
  const liste: string[] = Array.isArray(brut) ? brut.map(String) : String(brut ?? '').split(/\s+/);
  const l = liste.find((c) => c.startsWith('language-'));
  return l ? l.slice('language-'.length) : 'texte';
}

/**
 * Plugin rehype pour l'aperçu (pas de Shiki) : même figure que sur le site,
 * <pre class="code-brut"> sans couleurs.
 */
export function rehypeFigureCode() {
  return (tree: Root) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'pre' || !parent || index === undefined) return;
      if (parent.type === 'element' && parent.tagName === 'figure') return;
      const code = node.children.find((c): c is Element => c.type === 'element' && c.tagName === 'code');
      if (!code) return;
      const meta = typeof code.properties.metastring === 'string' ? code.properties.metastring : null;
      delete code.properties.metastring;
      node.properties.className = ['code-brut'];
      node.properties.tabIndex = 0;
      parent.children[index] = figureCode(node, langueDe(code), extraireTitre(meta));
      return SKIP;
    });
  };
}
