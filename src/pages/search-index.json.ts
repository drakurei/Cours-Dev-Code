/**
 * /search-index.json — index de recherche généré au build, chargé par la palette
 * à sa première ouverture : cours, notions (avec ancre), définitions, tomes et pages.
 */
import type { APIRoute } from 'astro';
import { render } from 'astro:content';
import { coursPublies, sectionsDuCours, tomesPublies } from '../lib/cours.ts';
import { construireIndex, ORDRE_PAGES, type CoursSource } from '../lib/recherche/documents.ts';
import { KANJI_NAVIGATION } from '../lib/kanji.ts';
import { TYPES_LIBELLES } from '../lib/libelles.ts';
import { url, urlTome } from '../lib/url.ts';

export const GET: APIRoute = async () => {
  const [liste, tomes] = await Promise.all([coursPublies(), tomesPublies()]);

  const cours: CoursSource[] = await Promise.all(
    liste.map(async (c) => {
      // HTML déjà rendu par la collection ; sinon, repli sur les titres des ##.
      const html = c.entree.rendered?.html;
      const sections = html ? [] : sectionsDuCours((await render(c.entree)).headings);
      return {
        id: c.id,
        url: c.url,
        titre: c.data.titre,
        matiere: c.matiere.slug,
        chapitre: c.chapitre,
        duree: c.duree,
        essentiel: c.data.essentiel,
        retenir: c.data.retenir,
        tags: c.data.tags,
        type: c.data.type === 'cours' ? '' : TYPES_LIBELLES[c.data.type],
        definitions: c.data.definitions,
        html,
        sections,
      };
    }),
  );

  const index = construireIndex({
    cours,
    matieres: tomes
      .filter((t) => t.cours.length > 0)
      .map((t) => ({
        slug: t.matiere.slug,
        nom: t.matiere.nom,
        kanji: t.matiere.kanji,
        couleur: t.matiere.couleur,
        url: urlTome(t.matiere.slug),
        ordre: t.matiere.ordre,
        description: t.matiere.description,
        nbCours: t.cours.length,
      })),
    pages: ORDRE_PAGES.map((cle) => ({ cle, url: url(KANJI_NAVIGATION[cle].chemin) })),
  });

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
