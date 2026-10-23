/**
 * Collections de contenu : « cours » (Markdown) et « matieres » (YAML).
 * Les schémas viennent de src/lib/schema.ts (les mêmes que l'Atelier et les scripts).
 *
 * Variables facultatives (tests, builds en parallèle) :
 *   MANABI_CONTENU  dossier des cours    (défaut ./src/content/cours)
 *   MANABI_MATIERES dossier des matières (défaut ./src/content/matieres)
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { coursSchema, matiereSchema } from './lib/schema.ts';

const env = process.env;

/** Id = chemin sans extension, toujours en « / » : « react/06-usestate ». Un champ slug: ne le change pas. */
function idDepuisChemin({ entry }: { entry: string }): string {
  return entry.replace(/\\/g, '/').replace(/\.(md|ya?ml)$/i, '');
}

const cours = defineCollection({
  // Les fichiers qui commencent par « _ » sont ignorés (modèles, notes perso).
  loader: glob({
    pattern: '**/[^_]*.md',
    base: env.MANABI_CONTENU || './src/content/cours',
    generateId: idDepuisChemin,
  }),
  schema: coursSchema,
});

const matieres = defineCollection({
  loader: glob({
    pattern: '**/*.{yaml,yml}',
    base: env.MANABI_MATIERES || './src/content/matieres',
    generateId: idDepuisChemin,
  }),
  schema: matiereSchema,
});

export const collections = { cours, matieres };
