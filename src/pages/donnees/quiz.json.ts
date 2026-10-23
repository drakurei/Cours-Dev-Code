/**
 * /donnees/quiz.json : toutes les questions de quiz publiées, dans l'ordre de lecture.
 * Format : src/lib/apprentissage/donnees.ts (QuestionJson[]).
 */
import type { APIRoute } from 'astro';
import { coursPublies } from '../../lib/cours.ts';
import { preparerDonneesCours } from '../../lib/donnees-cours.ts';
import { questionsDuCours, type QuestionJson } from '../../lib/apprentissage/donnees.ts';

export const GET: APIRoute = async () => {
  const liste = await coursPublies();
  const parCours = await Promise.all(
    liste.map(async (c) => (c.data.quiz.length ? questionsDuCours(c, await preparerDonneesCours(c.id, c.data)) : [])),
  );
  const questions: QuestionJson[] = parCours.flat();
  return new Response(JSON.stringify(questions), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
