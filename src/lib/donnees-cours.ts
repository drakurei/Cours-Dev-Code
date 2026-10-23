/**
 * Données d'un cours prêtes pour l'affichage ET pour les îlots interactifs (quiz, flashcards,
 * exercices) : le Markdown du frontmatter est déjà rendu en HTML assaini au build.
 * Côté serveur uniquement (utilise le rendu Markdown du build).
 *
 *   <Quiz client:visible coursId={donnees.coursId} questions={donnees.quiz} />
 */
import type { Cours, NiveauExercice } from './schema.ts';
import { idCarte } from './texte.ts';
import { rendreEnLigne, rendreTexte } from './markdown/rendu-serveur.ts';

export interface ChoixRendu {
  texte: string;
  html: string;
}

export interface QuestionRendue {
  index: number;
  question: string;
  questionHtml: string;
  choix: ChoixRendu[];
  /** Texte exact de la bonne réponse et sa position dans `choix`. */
  reponse: string;
  reponseIndex: number;
  explicationHtml: string;
}

export interface FlashcardRendue {
  /** CarteId : `${coursId}::${hash(q)}` (clé du store SRS). */
  id: string;
  q: string;
  r: string;
  qHtml: string;
  rHtml: string;
}

export interface ExerciceRendu {
  index: number;
  /** Clé du store : `${coursId}::${index}`. */
  cle: string;
  titre: string;
  titreHtml: string;
  niveau: NiveauExercice;
  enonceHtml: string;
  indicesHtml: string[];
  solutionHtml: string;
}

export interface DefinitionRendue {
  terme: string;
  termeHtml: string;
  definitionHtml: string;
  exempleHtml: string;
}

export interface DonneesCours {
  coursId: string;
  titre: string;
  quiz: QuestionRendue[];
  flashcards: FlashcardRendue[];
  exercices: ExerciceRendu[];
  definitions: DefinitionRendue[];
  retenirHtml: string[];
  essentielHtml: string;
}

const RESSEMBLE_A_DU_CODE = /[(){}[\]=;<>]|=>|^\s*(const|let|var|function|import|export|npm|npx|git|cd)\b/;

/** Exemple de définition : une ligne qui ressemble à du code → code en ligne ; sinon Markdown tel quel. */
function exempleEnMarkdown(exemple: string | undefined): string {
  const e = exemple?.trim();
  if (!e) return '';
  if (e.includes('```') || e.includes('\n') || !RESSEMBLE_A_DU_CODE.test(e) || /^`.*`$/.test(e)) return e;
  return e.includes('`') ? `\`\` ${e} \`\`` : `\`${e}\``;
}

export async function preparerDonneesCours(coursId: string, data: Cours): Promise<DonneesCours> {
  const [quiz, flashcards, exercices, definitions, retenirHtml, essentielHtml] = await Promise.all([
    Promise.all(
      data.quiz.map(async (q, index) => ({
        index,
        question: q.question,
        questionHtml: await rendreEnLigne(q.question),
        choix: await Promise.all(q.choix.map(async (texte) => ({ texte, html: await rendreEnLigne(texte) }))),
        reponse: q.reponse,
        reponseIndex: q.choix.indexOf(q.reponse),
        explicationHtml: await rendreTexte(q.explication),
      })),
    ),
    Promise.all(
      data.flashcards.map(async (f) => ({
        id: idCarte(coursId, f.q),
        q: f.q,
        r: f.r,
        qHtml: await rendreEnLigne(f.q),
        rHtml: await rendreTexte(f.r),
      })),
    ),
    Promise.all(
      data.exercices.map(async (e, index) => ({
        index,
        cle: `${coursId}::${index}`,
        titre: e.titre,
        titreHtml: await rendreEnLigne(e.titre),
        niveau: e.niveau,
        enonceHtml: await rendreTexte(e.enonce),
        indicesHtml: await Promise.all(e.indices.map((i) => rendreTexte(i))),
        solutionHtml: await rendreTexte(e.solution),
      })),
    ),
    Promise.all(
      data.definitions.map(async (d) => ({
        terme: d.terme,
        termeHtml: await rendreEnLigne(d.terme),
        definitionHtml: await rendreTexte(d.definition),
        exempleHtml: await rendreTexte(exempleEnMarkdown(d.exemple)),
      })),
    ),
    Promise.all(data.retenir.map((r) => rendreEnLigne(r))),
    rendreEnLigne(data.essentiel),
  ]);
  return { coursId, titre: data.titre, quiz, flashcards, exercices, definitions, retenirHtml, essentielHtml };
}
