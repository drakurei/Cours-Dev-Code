/**
 * Format des endpoints /donnees/cartes.json et /donnees/quiz.json (contrat du projet),
 * et leur construction à partir des cours préparés. Pur : testable sans Astro.
 *
 * Champs du contrat : cartes {id, coursId, matiere, titreCours, q, r, qHtml, rHtml} ;
 * quiz {coursId, matiere, titreCours, index, questionHtml, choix, reponseIndex, explicationHtml}.
 * Champs en plus, pour l'affichage : matiereNom, kanji, couleur, chapitre, urlCours.
 */
import type { Couleur } from '../schema.ts';
import type { ChoixRendu, DonneesCours } from '../donnees-cours.ts';

/** D'où vient une carte ou une question (affiché en tête de carte). */
export interface SourceCours {
  coursId: string;
  /** Slug de la matière (« react »). */
  matiere: string;
  matiereNom: string;
  kanji: string;
  couleur: Couleur;
  chapitre: number;
  titreCours: string;
  urlCours: string;
}

export interface CarteJson extends SourceCours {
  /** CarteId `${coursId}::${hash(q)}`. */
  id: string;
  q: string;
  r: string;
  qHtml: string;
  rHtml: string;
}

export interface QuestionJson extends SourceCours {
  index: number;
  questionHtml: string;
  choix: ChoixRendu[];
  reponseIndex: number;
  explicationHtml: string;
}

/** Forme minimale d'un cours (compatible CoursVue). */
export interface CoursSource {
  id: string;
  chapitre: number;
  url: string;
  data: { titre: string };
  matiere: { slug: string; nom: string; kanji: string; couleur: Couleur };
}

export function sourceDe(cours: CoursSource): SourceCours {
  return {
    coursId: cours.id,
    matiere: cours.matiere.slug,
    matiereNom: cours.matiere.nom,
    kanji: cours.matiere.kanji,
    couleur: cours.matiere.couleur,
    chapitre: cours.chapitre,
    titreCours: cours.data.titre,
    urlCours: cours.url,
  };
}

/** Flashcards d'un cours, dans l'ordre du frontmatter (une question en double = une carte). */
export function cartesDuCours(cours: CoursSource, donnees: Pick<DonneesCours, 'flashcards'>): CarteJson[] {
  const source = sourceDe(cours);
  const vus = new Set<string>();
  const sortie: CarteJson[] = [];
  for (const f of donnees.flashcards) {
    if (vus.has(f.id)) continue;
    vus.add(f.id);
    sortie.push({ ...source, id: f.id, q: f.q, r: f.r, qHtml: f.qHtml, rHtml: f.rHtml });
  }
  return sortie;
}

/** Questions de quiz d'un cours (seulement celles dont la bonne réponse est connue). */
export function questionsDuCours(cours: CoursSource, donnees: Pick<DonneesCours, 'quiz'>): QuestionJson[] {
  const source = sourceDe(cours);
  return donnees.quiz
    .filter((q) => q.reponseIndex >= 0 && q.reponseIndex < q.choix.length)
    .map((q) => ({
      ...source,
      index: q.index,
      questionHtml: q.questionHtml,
      choix: q.choix,
      reponseIndex: q.reponseIndex,
      explicationHtml: q.explicationHtml,
    }));
}

/** Libellé lisible d'une source pour les lecteurs d'écran : « React, chapitre 6 ». */
export function libelleSource(s: Pick<SourceCours, 'matiereNom' | 'chapitre'>): string {
  return `${s.matiereNom}, chapitre ${s.chapitre}`;
}

/** « React », « React et CSS », « React, JavaScript et CSS ». */
export function listeLisible(noms: ReadonlyArray<string>): string {
  const u = [...new Set(noms)];
  if (u.length <= 1) return u[0] ?? '';
  return `${u.slice(0, -1).join(', ')} et ${u[u.length - 1]}`;
}
