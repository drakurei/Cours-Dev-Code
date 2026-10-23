/**
 * Logique pure du quiz : score, erreurs, mention, résultat enregistré (store.quiz).
 */
import type { ResultatQuiz } from '../store.ts';

/** Réponses d'un tour : index de la question → bonne réponse ou non. */
export type Reponses = ReadonlyMap<number, boolean>;

export interface Score {
  bonnes: number;
  total: number;
  /** 0..1 (0 si aucune question). */
  ratio: number;
}

export function score(reponses: Reponses, total: number = reponses.size): Score {
  let bonnes = 0;
  for (const ok of reponses.values()) if (ok) bonnes++;
  return { bonnes, total, ratio: total > 0 ? Math.min(1, bonnes / total) : 0 };
}

/** Index des questions ratées, dans l'ordre du tour. */
export function erreurs(reponses: Reponses): number[] {
  return [...reponses].filter(([, ok]) => !ok).map(([i]) => i);
}

export type Mention = 'parfait' | 'bien' | 'encore';

/** Parfait = tout juste ; bien = au moins 60 % ; sinon on refait un tour. */
export function mention(s: Score): Mention {
  if (s.total > 0 && s.bonnes === s.total) return 'parfait';
  return s.ratio >= 0.6 ? 'bien' : 'encore';
}

export const TEXTES_MENTION: Record<Mention, string> = {
  parfait: 'Parfait.',
  bien: 'Bien joué.',
  encore: 'Encore un tour ?',
};

/**
 * Résultat d'une tentative complète. `meilleur` repart du score si le nombre de questions
 * a changé (cours modifié) : un ancien 5/5 ne doit pas dépasser un nouveau total de 4.
 */
export function resultatQuiz(ancien: ResultatQuiz | undefined, s: Score, maintenant: Date = new Date()): ResultatQuiz {
  const memeTotal = ancien !== undefined && ancien.total === s.total;
  return {
    meilleur: memeTotal ? Math.max(ancien.meilleur, s.bonnes) : s.bonnes,
    total: s.total,
    tentatives: (ancien?.tentatives ?? 0) + 1,
    dernier: maintenant.toISOString(),
  };
}

/** Lettre d'un choix : 0 → « A ». */
export function lettre(i: number): string {
  return String.fromCharCode(65 + i);
}
