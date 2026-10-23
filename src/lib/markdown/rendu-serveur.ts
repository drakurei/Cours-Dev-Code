/**
 * Rendu au BUILD des textes du frontmatter (énoncés, solutions, réponses, définitions…)
 * avec exactement les mêmes plugins que le corps des cours, coloration Shiki comprise.
 * Côté serveur uniquement (Astro) : ne jamais importer depuis un îlot.
 */
import {
  createMarkdownProcessor,
  rehypeShiki,
  type RehypePlugins,
  type RemarkPlugins,
} from '@astrojs/markdown-remark';
import { optionsRemarkRehype, pluginsRehypeAvant, pluginsRemark } from './plugins.ts';
import { configShiki } from './shiki.ts';
import { rehypeTableaux } from './tableaux.ts';

type Rendu = Awaited<ReturnType<typeof createMarkdownProcessor>>;
let rendu: Promise<Rendu> | null = null;
const cacheHtml = new Map<string, Promise<string>>();

function processeur(): Promise<Rendu> {
  const base = ((import.meta.env?.BASE_URL as string | undefined) ?? '/').replace(/\/+$/, '');
  rendu ??= createMarkdownProcessor({
    syntaxHighlight: false,
    gfm: false,
    smartypants: false,
    remarkPlugins: pluginsRemark as RemarkPlugins,
    remarkRehype: optionsRemarkRehype,
    rehypePlugins: [...pluginsRehypeAvant(base), [rehypeShiki, configShiki], rehypeTableaux] as RehypePlugins,
  });
  return rendu;
}

/** Markdown (bloc) → HTML. */
export function rendreTexte(texte: string | undefined | null): Promise<string> {
  const source = (texte ?? '').trim();
  if (!source) return Promise.resolve('');
  let html = cacheHtml.get(source);
  if (!html) {
    html = processeur().then(async (p) => (await p.render(source)).code);
    cacheHtml.set(source, html);
  }
  return html;
}

/** Markdown d'une ligne → HTML sans le <p> autour (titres, questions, choix, termes). */
export async function rendreEnLigne(texte: string | undefined | null): Promise<string> {
  const html = await rendreTexte(texte);
  const m = /^<p>([\s\S]*)<\/p>\s*$/.exec(html);
  return m && !m[1]?.includes('<p>') ? (m[1] ?? '') : html;
}
