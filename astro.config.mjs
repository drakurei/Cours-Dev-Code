// @ts-check
// Configuration Astro de Manabi 学び.
// Les plugins Markdown viennent de src/lib/markdown/plugins.ts : la MÊME liste sert
// au site (ici), aux textes du frontmatter et à l'aperçu de l'Atelier.
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { unified, rehypeShiki } from '@astrojs/markdown-remark';

import {
  optionsRemarkRehype,
  pluginsRemark,
  pluginsRehypeAvant,
  pluginsRehypeApres,
} from './src/lib/markdown/plugins.ts';
import { configShiki } from './src/lib/markdown/shiki.ts';
import serviceWorker from './integrations/service-worker.ts';

const BASE = '/Cours-Dev-Code';

// Variables facultatives : plusieurs builds en parallèle sans se gêner.
//   MANABI_OUT (dossier de sortie), MANABI_CACHE (cache Vite/Astro),
//   MANABI_CONTENU et MANABI_MATIERES (lus dans src/content.config.ts).
const env = process.env;

export default defineConfig({
  site: 'https://drakurei.github.io',
  base: BASE,
  trailingSlash: 'always',
  outDir: env.MANABI_OUT || './dist',
  cacheDir: env.MANABI_CACHE || './node_modules/.astro',
  // Compression HTML « classique » : garde les espaces entre éléments en ligne
  // (le mode « jsx » par défaut d'Astro 7 collerait « <b>a</b> <i>b</i> »).
  compressHTML: true,
  integrations: [react(), serviceWorker()],
  build: {
    inlineStylesheets: 'auto',
  },
  devToolbar: { enabled: false },
  server: {
    // GitHub Codespaces : l'aperçu passe par *.app.github.dev (sinon « Blocked request »).
    // Ailleurs : la valeur par défaut d'Astro (localhost seulement).
    allowedHosts: env.CODESPACES ? ['.app.github.dev'] : [],
  },
  markdown: {
    // Coloration lancée À LA MAIN dans rehypePlugins, APRÈS l'assainissement :
    // rehype-sanitize n'a ainsi jamais à autoriser les attributs style de Shiki.
    syntaxHighlight: false,
    shikiConfig: configShiki,
    processor: unified({
      gfm: false, // remark-gfm est déjà dans pluginsRemark (même ordre que l'aperçu)
      smartypants: false, // sinon « --force » deviendrait « –force » dans le texte
      remarkPlugins: pluginsRemark,
      remarkRehype: optionsRemarkRehype,
      rehypePlugins: [...pluginsRehypeAvant(BASE), [rehypeShiki, configShiki], ...pluginsRehypeApres],
    }),
  },
});
