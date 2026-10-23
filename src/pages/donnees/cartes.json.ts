/**
 * /donnees/cartes.json : toutes les flashcards publiées, dans l'ordre de lecture des cours
 * (tome puis chapitre). Format : src/lib/apprentissage/donnees.ts (CarteJson[]).
 */
import type { APIRoute } from 'astro';
import { coursPublies } from '../../lib/cours.ts';
import { preparerDonneesCours } from '../../lib/donnees-cours.ts';
import { cartesDuCours, type CarteJson } from '../../lib/apprentissage/donnees.ts';

export const GET: APIRoute = async () => {
  const liste = await coursPublies();
  const parCours = await Promise.all(
    liste.map(async (c) => (c.data.flashcards.length ? cartesDuCours(c, await preparerDonneesCours(c.id, c.data)) : [])),
  );
  const cartes: CarteJson[] = parCours.flat();
  return new Response(JSON.stringify(cartes), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
