/**
 * Minuteur rapide de l'accueil : télécommande du Minuteur global (src/islands/Minuteur.tsx).
 *
 * Contrat : on ENVOIE l'événement window « manabi:minuteur » {minutes?, action}.
 * Pour afficher le temps restant (le Minuteur est caché sous 1024 px), on garde un miroir
 * local, recalé sur l'état que publie le Minuteur (« manabi:minuteur:etat ») et sur sa session
 * dans sessionStorage « manabi:minuteur », quand ce format est reconnu.
 * Format inconnu ou clé jamais vue : le miroir local fait foi.
 */

export const EVENEMENT_MINUTEUR = 'manabi:minuteur';
/** Publié par le Minuteur global à chaque changement (detail = sa session). */
export const EVENEMENT_ETAT_MINUTEUR = 'manabi:minuteur:etat';
export const CLE_SESSION_MINUTEUR = 'manabi:minuteur';
export const DUREES = [10, 15, 25] as const;
export type Duree = (typeof DUREES)[number];

export type ActionMinuteur = 'demarrer' | 'pause' | 'reprendre' | 'arreter';
export interface CommandeMinuteur {
  minutes?: number;
  action: ActionMinuteur;
}

export type SessionMinuteur =
  | { etat: 'pret' }
  | { etat: 'en-cours'; fin: number; duree: number }
  | { etat: 'pause'; reste: number; duree: number }
  | { etat: 'fini'; duree: number };

const PRET: SessionMinuteur = { etat: 'pret' };

/** Durée proposée par défaut : la préférence si elle fait partie des choix, sinon 15. */
export function dureeParDefaut(prefMinutes: number): Duree {
  return (DUREES as readonly number[]).includes(prefMinutes) ? (prefMinutes as Duree) : 15;
}

const nombre = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/**
 * Lit la session écrite par le Minuteur. Clé absente → « pret » ;
 * JSON abîmé ou format inconnu → null (on ne sait pas : ne rien en déduire).
 */
export function lireSession(brut: string | null): SessionMinuteur | null {
  if (brut === null) return PRET;
  let s: unknown;
  try {
    s = JSON.parse(brut);
  } catch {
    return null;
  }
  if (!s || typeof s !== 'object') return null;
  const o = s as Record<string, unknown>;
  const duree = nombre(o.duree) && o.duree > 0 ? o.duree : null;
  if (o.etat === 'pret') return PRET;
  if (duree === null) return null;
  if (o.etat === 'en-cours' && nombre(o.fin)) return { etat: 'en-cours', fin: o.fin, duree };
  if (o.etat === 'pause' && nombre(o.reste)) return { etat: 'pause', reste: Math.max(0, o.reste), duree };
  if (o.etat === 'fini') return { etat: 'fini', duree };
  return null;
}

/** Ce que fera le Minuteur en recevant la commande (miroir optimiste). */
export function appliquerCommande(s: SessionMinuteur, c: CommandeMinuteur, maintenant: number): SessionMinuteur {
  switch (c.action) {
    case 'demarrer': {
      const duree = nombre(c.minutes) && c.minutes > 0 ? c.minutes : 15;
      return { etat: 'en-cours', fin: maintenant + duree * 60_000, duree };
    }
    case 'pause':
      return s.etat === 'en-cours' ? { etat: 'pause', reste: Math.max(0, s.fin - maintenant), duree: s.duree } : s;
    case 'reprendre':
      return s.etat === 'pause' ? { etat: 'en-cours', fin: maintenant + s.reste, duree: s.duree } : s;
    case 'arreter':
      return PRET;
  }
}

export interface Miroir {
  session: SessionMinuteur;
  /** Heure (ms) de notre dernière commande : on laisse au Minuteur le temps de l'écrire. */
  depuis: number;
  /** La clé de session a déjà contenu une session valide : son absence veut dire « arrêté ». */
  cleVue: boolean;
}

export const MIROIR_INITIAL: Miroir = { session: PRET, depuis: 0, cleVue: false };

/** Délai laissé au Minuteur pour écrire sa session après une commande. */
export const DELAI_ECRITURE = 1500;

/** Recale le miroir sur la session stockée, si elle est fiable. Pure. */
export function synchroniser(m: Miroir, brut: string | null, maintenant: number): Miroir {
  const stockee = lireSession(brut);
  if (stockee === null) return m; // format inconnu : on garde notre miroir
  const cleVue = m.cleVue || brut !== null;
  if (maintenant - m.depuis < DELAI_ECRITURE) return cleVue === m.cleVue ? m : { ...m, cleVue };
  // Clé absente alors qu'on ne l'a jamais vue : le Minuteur la range peut-être ailleurs.
  if (brut === null && !m.cleVue) return m;
  if (memeSession(stockee, m.session)) return cleVue === m.cleVue ? m : { ...m, cleVue };
  return { session: stockee, depuis: m.depuis, cleVue };
}

function memeSession(a: SessionMinuteur, b: SessionMinuteur): boolean {
  if (a.etat !== b.etat) return false;
  if (a.etat === 'en-cours' && b.etat === 'en-cours') return a.fin === b.fin && a.duree === b.duree;
  if (a.etat === 'pause' && b.etat === 'pause') return a.reste === b.reste && a.duree === b.duree;
  if (a.etat === 'fini' && b.etat === 'fini') return a.duree === b.duree;
  return true;
}

/** Temps restant en ms (0 si fini ou prêt). */
export function resteMs(s: SessionMinuteur, maintenant: number): number {
  if (s.etat === 'en-cours') return Math.max(0, s.fin - maintenant);
  if (s.etat === 'pause') return s.reste;
  return 0;
}

/** Une session « en cours » dont l'heure est passée est finie. */
export function etatAffiche(s: SessionMinuteur, maintenant: number): SessionMinuteur['etat'] {
  return s.etat === 'en-cours' && s.fin <= maintenant ? 'fini' : s.etat;
}

/**
 * Délai avant le prochain rafraîchissement : en cours, juste après le changement de seconde
 * affichée (même rythme que le Minuteur global, pas d'écart d'une seconde) ; sinon 1 s.
 */
export function delaiProchainTic(s: SessionMinuteur, maintenant: number): number {
  if (s.etat !== 'en-cours' || s.fin <= maintenant) return 1000;
  return ((s.fin - maintenant) % 1000 || 1000) + 10;
}

/** 754 000 ms → « 12:34 » (arrondi à la seconde supérieure, comme le Minuteur). */
export function formaterTemps(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** « 12 minutes et 34 secondes » (pour les lecteurs d'écran). */
export function tempsEnMots(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(total / 60);
  const sec = total % 60;
  const m = `${min} minute${min > 1 ? 's' : ''}`;
  if (sec === 0) return m;
  const s = `${sec} seconde${sec > 1 ? 's' : ''}`;
  return min === 0 ? s : `${m} et ${s}`;
}

// ─── Navigateur ──────────────────────────────────────────────────────────────

export function lireSessionBrute(): string | null {
  try {
    return window.sessionStorage.getItem(CLE_SESSION_MINUTEUR);
  } catch {
    return null; // stockage bloqué : le miroir local suffit
  }
}

/**
 * Envoie la commande au Minuteur. S'il n'est pas encore hydraté (client:idle),
 * on attend son hydratation (3 s au plus) pour ne pas perdre l'événement.
 */
export function envoyerCommande(c: CommandeMinuteur): void {
  const envoyer = () => window.dispatchEvent(new CustomEvent<CommandeMinuteur>(EVENEMENT_MINUTEUR, { detail: c }));
  const enAttente = [...document.querySelectorAll<HTMLElement>('astro-island[ssr][component-url*="/Minuteur."]')];
  if (enAttente.length === 0) {
    envoyer();
    return;
  }
  let fait = false;
  const une = () => {
    if (fait) return;
    fait = true;
    window.clearTimeout(minuterie);
    envoyer();
  };
  const minuterie = window.setTimeout(une, 3000);
  for (const ile of enAttente) ile.addEventListener('astro:hydrate', une, { once: true });
}
