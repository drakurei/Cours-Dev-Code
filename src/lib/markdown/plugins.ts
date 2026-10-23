/**
 * LA liste des plugins Markdown, source unique pour :
 *   - le build (astro.config.mjs),
 *   - les textes du frontmatter rendus au build (rendu-serveur.ts),
 *   - l'aperçu de l'Atelier dans le navigateur (pipeline.ts).
 *
 * Ordre : remark (gfm → directive → blocs → meta du code) puis rehype en deux temps :
 *   avant(base) : HTML brut → assainissement → base du site      (entrée non fiable)
 *   [coloration Shiki au build / figure simple dans l'aperçu]
 *   apres       : ids des titres → tableaux défilants → sections « notion » (transformations sûres)
 * Aucun import lourd ici (ni Shiki ni Astro) : ce fichier part aussi dans le navigateur.
 */
import type { Plugin } from 'unified';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { remarkBlocs } from './directives.ts';
import { remarkMetaCode } from './code.ts';
import { rehypeBaseUrl } from './base-url.ts';
import { schemaSanitize } from './sanitize.ts';
import { rehypeNotions, rehypeTitres } from './titres.ts';
import { rehypeNettoyerTableaux, rehypeTableaux } from './tableaux.ts';

/**
 * Un plugin, seul ou avec ses options. Type commun accepté à la fois par unified().use()
 * et par la config Markdown d'Astro.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Branchement = Plugin<any[], any, any> | [Plugin<any[], any, any>, any];

/** Options de remark-rehype : HTML brut gardé (assaini ensuite) et notes de bas de page en français. */
export const optionsRemarkRehype = {
  allowDangerousHtml: true,
  footnoteLabel: 'Notes',
  footnoteBackLabel: (i: number, j: number) => `Revenir à l’appel de note ${i + 1}${j > 1 ? `-${j}` : ''}`,
};

export const pluginsRemark: Branchement[] = [remarkGfm, remarkDirective, remarkBlocs, remarkMetaCode];

export function pluginsRehypeAvant(base: string): Branchement[] {
  return [rehypeNettoyerTableaux, rehypeRaw, [rehypeSanitize, schemaSanitize], [rehypeBaseUrl, { base }]];
}

export const pluginsRehypeApres: Branchement[] = [rehypeTitres, rehypeTableaux, rehypeNotions];
