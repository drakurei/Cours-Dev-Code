/**
 * Chargement des données de révision (générées au build) : une seule requête par page,
 * nouvel essai possible après une erreur (hors-ligne sans cache, par exemple).
 */
import type { CarteJson, QuestionJson } from '../../lib/apprentissage/donnees.ts';
import { url } from '../../lib/url.ts';

const cache = new Map<string, Promise<unknown>>();

function chargerJson<T>(chemin: string): Promise<T> {
  let p = cache.get(chemin) as Promise<T> | undefined;
  if (!p) {
    p = fetch(url(chemin), { headers: { Accept: 'application/json' } })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<T>;
      })
      .catch((e: unknown) => {
        cache.delete(chemin);
        throw e;
      });
    cache.set(chemin, p);
  }
  return p;
}

export const chargerCartes = () => chargerJson<CarteJson[]>('/donnees/cartes.json');
export const chargerQuiz = () => chargerJson<QuestionJson[]>('/donnees/quiz.json');

/** Ce que reviser.astro passe à l'îlot. */
export interface TomeResume {
  slug: string;
  nom: string;
  kanji: string;
  lecture?: string | undefined;
  couleur: CarteJson['couleur'];
}

export interface CoursResume {
  id: string;
  titre: string;
  url: string;
}
