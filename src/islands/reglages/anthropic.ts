/**
 * Clé API Anthropic : modèles proposés et test de la clé depuis le navigateur.
 * La clé ne part que vers api.anthropic.com, jamais ailleurs.
 */

export const URL_MODELES = 'https://api.anthropic.com/v1/models';
export const URL_CLES = 'https://platform.claude.com/settings/keys';
export const URL_LIMITES = 'https://platform.claude.com/settings/limits';

export interface ModeleIA {
  id: string;
  nom: string;
  detail: string;
}

/** Modèles proposés dans les Réglages (le 1er est le défaut du store). */
export const MODELES: readonly ModeleIA[] = [
  { id: 'claude-sonnet-5-5', nom: 'Sonnet 5.5', detail: 'Rapide et précis. Recommandé.' },
  { id: 'claude-opus-5-5', nom: 'Opus 5.5', detail: 'Le plus puissant, plus lent et plus cher.' },
  { id: 'claude-haiku-5-5', nom: 'Haiku 5.5', detail: 'Le plus rapide et le moins cher.' },
];

export function nomModele(id: string): string {
  return MODELES.find((m) => m.id === id)?.nom ?? id;
}

export interface ResultatCle {
  ok: boolean;
  message: string;
}

interface ListeModeles {
  data?: { id?: string }[];
  has_more?: boolean;
}

/**
 * GET /v1/models avec la clé : 200 = clé valide (+ dit si le modèle choisi est disponible).
 * Ne lève jamais : renvoie un message français prêt à afficher.
 */
export async function testerCleAnthropic(cle: string, modele: string, f: typeof fetch = globalThis.fetch): Promise<ResultatCle> {
  let rep: Response;
  try {
    rep = await f(`${URL_MODELES}?limit=100`, {
      headers: {
        'x-api-key': cle.trim(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      cache: 'no-store',
    });
  } catch {
    return { ok: false, message: 'Pas de connexion à Anthropic. Vérifie ton réseau, puis réessaie.' };
  }

  if (rep.status === 401) return { ok: false, message: 'Clé refusée : elle est fausse ou désactivée.' };
  if (rep.status === 403) return { ok: false, message: 'Cette clé n’a pas accès à l’API.' };
  if (rep.status === 429) return { ok: false, message: 'Trop de requêtes. Réessaie dans une minute.' };
  if (rep.status >= 500) return { ok: false, message: `Anthropic ne répond pas (erreur ${rep.status}). Réessaie plus tard.` };
  if (!rep.ok) return { ok: false, message: `Anthropic a répondu une erreur ${rep.status}.` };

  let liste: ListeModeles = {};
  try {
    liste = (await rep.json()) as ListeModeles;
  } catch {
    /* clé valide quand même */
  }
  const ids = (liste.data ?? []).map((m) => m.id).filter((id): id is string => typeof id === 'string');
  const nom = nomModele(modele);
  if (ids.includes(modele)) return { ok: true, message: `Clé valide. ${nom} est disponible.` };
  if (ids.length && !liste.has_more) return { ok: true, message: `Clé valide, mais ${nom} n’apparaît pas dans tes modèles.` };
  return { ok: true, message: 'Clé valide.' };
}
