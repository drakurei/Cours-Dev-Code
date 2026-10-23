/**
 * Rendu Markdown → HTML assaini, identique au site mais SANS coloration Shiki.
 * Pour l'aperçu de l'Atelier : à charger en import dynamique côté navigateur
 *   const { rendreMarkdown } = await import('../lib/markdown/pipeline.ts');
 */
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { optionsRemarkRehype, pluginsRehypeApres, pluginsRehypeAvant, pluginsRemark } from './plugins.ts';
import { rehypeFigureCode } from './code.ts';

function baseDuSite(): string {
  return ((import.meta.env?.BASE_URL as string | undefined) ?? '/').replace(/\/+$/, '');
}

let processeur: ReturnType<typeof creer> | null = null;

function creer(base: string) {
  return unified()
    .use(remarkParse)
    .use(pluginsRemark)
    .use(remarkRehype, optionsRemarkRehype)
    .use(pluginsRehypeAvant(base))
    .use(rehypeFigureCode)
    .use(pluginsRehypeApres)
    .use(rehypeStringify);
}

/** Corps d'un cours (sans frontmatter) → HTML prêt à injecter. */
export async function rendreMarkdown(corps: string, base: string = baseDuSite()): Promise<string> {
  const p = base === baseDuSite() ? (processeur ??= creer(base)) : creer(base);
  return String(await p.process(corps));
}
