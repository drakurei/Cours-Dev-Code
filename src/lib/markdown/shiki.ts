/**
 * Coloration du code (build uniquement) : Rosé Pine Dawn (clair) / Rosé Pine Moon (sombre).
 *
 * Notations disponibles dans les cours :
 *   ```jsx title="App.jsx"        → titre du bloc
 *   ```js {2,4-5}                 → lignes surlignées
 *   const x = 1 // [!code highlight]   → ligne surlignée
 *   const y = 2 // [!code ++]           → ligne ajoutée (diff)
 *   const z = 3 // [!code --]           → ligne retirée (diff)
 */
import type { Element, Root } from 'hast';
import type { ShikiTransformer } from 'shiki';
import type { ShikiConfig } from '@astrojs/markdown-remark';
import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationHighlight,
} from '@shikijs/transformers';
import { extraireTitre, figureCode } from './code.ts';

/** Enveloppe chaque bloc dans <figure class="code"> (+ <figcaption> si title="…"). */
export function transformerTitre(): ShikiTransformer {
  return {
    name: 'manabi:titre',
    root(racine: Root) {
      const i = racine.children.findIndex((n) => n.type === 'element' && n.tagName === 'pre');
      const pre = racine.children[i] as Element | undefined;
      if (!pre) return;
      const meta = (this.options.meta as { __raw?: string } | undefined)?.__raw;
      racine.children[i] = figureCode(pre, String(this.options.lang ?? 'texte'), extraireTitre(meta));
    },
  };
}

export const configShiki: ShikiConfig = {
  themes: { light: 'rose-pine-dawn', dark: 'rose-pine-moon' },
  // Couleurs du thème clair dans style="…", sombre dans --shiki-dark (bascule en CSS : blocs.css).
  defaultColor: 'light',
  wrap: false,
  langAlias: { texte: 'plaintext' },
  transformers: [
    transformerNotationHighlight(),
    transformerNotationDiff(),
    transformerMetaHighlight(),
    transformerTitre(),
  ],
};
