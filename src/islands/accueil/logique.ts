/**
 * Page « Aujourd'hui » : logique pure, sans navigateur (testée dans tests/accueil.test.ts).
 *
 * - choisirMission() : LA mission du jour (une seule action principale) + un lien secondaire.
 * - aReprendre()     : les 3 derniers cours ouverts, pas encore terminés.
 * - resumeRevisions(): à revoir, nouvelles, faites aujourd'hui, demain.
 */
import { composerSession } from '../../lib/apprentissage/session.ts';
import { jourLocal, type Etat } from '../../lib/store.ts';

/** Un épisode de l'ordre de lecture (script#ordre-de-lecture, écrit par src/pages/index.astro). */
export interface Episode {
  id: string;
  url: string;
  titre: string;
  chapitre: number;
  /** Nom affiché de la matière (« React »). */
  matiere: string;
  /** Minutes. */
  duree: number;
  essentiel: string;
  /** Kanji et couleur du tome (facultatifs : ajoutés par l'accueil). */
  kanji?: string;
  couleur?: string;
  /** Ids des notions (##) du cours, dans l'ordre. */
  notions?: string[];
}

export interface Avancement {
  /** Notions vues qui existent encore dans le cours. */
  vues: number;
  total: number;
  /** 0..1 (1 si terminé). */
  part: number;
  termine: boolean;
  /** Au moins une notion vue (ou terminé). */
  commence: boolean;
}

export interface Suggestion {
  type: 'continuer' | 'commencer';
  episode: Episode;
  avancement: Avancement;
}

export type Mission =
  | { type: 'vide' }
  | { type: 'bienvenue'; episode: Episode }
  | {
      type: 'reviser';
      /** Cartes de la session proposée (plafonnée). */
      cartes: number;
      /** Toutes les cartes du jour (dues + nouvelles). */
      total: number;
      minutes: number;
      /** Matières des cartes, dans l'ordre de la session (sans doublon). */
      matieres: string[];
      /** Épisode de la première carte (illustration). */
      premier: Episode | null;
      secondaire: Suggestion | null;
    }
  | { type: 'continuer'; episode: Episode; avancement: Avancement; minutes: number; secondaire: Suggestion | null }
  | { type: 'commencer'; episode: Episode }
  | { type: 'termine'; cours: number };

export interface EntreesMission {
  etat: Etat;
  /** Ordre de lecture complet (tomes puis chapitres). */
  episodes: readonly Episode[];
  /** Ids des cartes dues et des nouvelles cartes du jour (srs.cartesDuJour). */
  dues: readonly string[];
  nouvelles: readonly string[];
  /** Durée estimée d'une session de n cartes (srs.minutesEstimees). */
  minutes: (n: number) => number;
  /** Taille maximale d'une session (prefs.tailleSession) ; sans plafond si absent. */
  plafond?: number;
}

/** Id de cours d'une carte : `${coursId}::${hash}`. */
export function coursDeCarte(carteId: string): string {
  const i = carteId.lastIndexOf('::');
  return i < 0 ? carteId : carteId.slice(0, i);
}

/** Où en est-on dans ce cours ? Ne compte que les notions qui existent encore. */
export function avancement(etat: Etat, ep: Episode): Avancement {
  const p = etat.progression[ep.id];
  const vuesBrutes = p?.sectionsVues ?? [];
  const notions = ep.notions;
  const total = notions?.length ?? 0;
  const vues = notions ? notions.filter((n) => vuesBrutes.includes(n)).length : Math.min(vuesBrutes.length, total);
  const termine = p?.termine === true;
  return {
    vues,
    total,
    part: termine ? 1 : total > 0 ? vues / total : 0,
    termine,
    commence: termine || vues > 0,
  };
}

/** Aucune trace d'apprentissage : ni cours ouvert, ni carte, ni quiz. */
export function estPremiereVisite(etat: Etat): boolean {
  return (
    Object.keys(etat.progression).length === 0 &&
    Object.keys(etat.srs).length === 0 &&
    Object.keys(etat.quiz).length === 0
  );
}

/** Le cours commencé, non terminé, ouvert le plus récemment. */
export function coursEnCours(etat: Etat, episodes: readonly Episode[]): Suggestion | null {
  let meilleur: Suggestion | null = null;
  let date = '';
  for (const episode of episodes) {
    const a = avancement(etat, episode);
    if (a.termine || !a.commence) continue;
    const d = etat.progression[episode.id]?.derniereVisite ?? '';
    if (!meilleur || d > date) {
      meilleur = { type: 'continuer', episode, avancement: a };
      date = d;
    }
  }
  return meilleur;
}

/** Le prochain cours jamais lu, dans l'ordre de lecture (sauf `exclu`). */
export function prochainNonLu(etat: Etat, episodes: readonly Episode[], exclu?: string): Suggestion | null {
  for (const episode of episodes) {
    if (episode.id === exclu) continue;
    const a = avancement(etat, episode);
    if (!a.commence) return { type: 'commencer', episode, avancement: a };
  }
  return null;
}

/** Minutes restantes d'un cours commencé (au moins 1). */
export function minutesRestantes(ep: Episode, a: Avancement): number {
  return Math.max(1, Math.round(ep.duree * (1 - a.part)));
}

/**
 * LA mission du jour. Priorité :
 * première visite → Bienvenue ; cartes du jour → réviser ; cours commencé → continuer ;
 * prochain cours non lu → commencer ; tout est lu → félicitations.
 */
export function choisirMission(e: EntreesMission): Mission {
  const { etat, episodes } = e;
  const premier = episodes[0];
  if (!premier) return { type: 'vide' };
  if (estPremiereVisite(etat)) return { type: 'bienvenue', episode: premier };

  const enCours = coursEnCours(etat, episodes);
  const prochain = prochainNonLu(etat, episodes);

  // Même composition que la page /reviser/ : dues d'abord, puis nouvelles, sans doublon.
  const jour = { dues: e.dues, nouvelles: e.nouvelles };
  const ids = composerSession(jour, Number.POSITIVE_INFINITY);
  if (ids.length > 0) {
    const session = e.plafond && e.plafond > 0 ? composerSession(jour, e.plafond) : ids;
    const parId = new Map(episodes.map((ep) => [ep.id, ep]));
    const matieres: string[] = [];
    for (const id of session) {
      const m = parId.get(coursDeCarte(id))?.matiere;
      if (m && !matieres.includes(m)) matieres.push(m);
    }
    const premiereCarte = session[0];
    return {
      type: 'reviser',
      cartes: session.length,
      total: ids.length,
      minutes: Math.max(1, Math.round(e.minutes(session.length))),
      matieres,
      premier: premiereCarte ? (parId.get(coursDeCarte(premiereCarte)) ?? null) : null,
      secondaire: enCours ?? prochain,
    };
  }

  if (enCours) {
    return {
      type: 'continuer',
      episode: enCours.episode,
      avancement: enCours.avancement,
      minutes: minutesRestantes(enCours.episode, enCours.avancement),
      secondaire: prochainNonLu(etat, episodes, enCours.episode.id),
    };
  }

  if (prochain) return { type: 'commencer', episode: prochain.episode };
  return { type: 'termine', cours: episodes.length };
}

export interface CoursAReprendre {
  episode: Episode;
  avancement: Avancement;
  /** ISO. */
  derniereVisite: string;
}

/** Les n derniers cours ouverts (visite enregistrée) et pas encore terminés, du plus récent au plus ancien. */
export function aReprendre(etat: Etat, episodes: readonly Episode[], n = 3): CoursAReprendre[] {
  const liste: CoursAReprendre[] = [];
  for (const episode of episodes) {
    const p = etat.progression[episode.id];
    if (!p || p.termine) continue;
    const t = Date.parse(p.derniereVisite);
    if (!Number.isFinite(t) || t <= 0) continue; // jamais ouvert (date par défaut)
    liste.push({ episode, avancement: avancement(etat, episode), derniereVisite: p.derniereVisite });
  }
  return liste.sort((a, b) => b.derniereVisite.localeCompare(a.derniereVisite)).slice(0, n);
}

export interface ResumeRevisions {
  aRevoir: number;
  nouvelles: number;
  /** Cartes différentes déjà révisées aujourd'hui. */
  faites: number;
  /** Cartes apprises dont la révision tombe demain. */
  demain: number;
  /** Avancement du jour, 0..1 (1 = tout est fait, 0 s'il n'y avait rien). */
  part: number;
}

/**
 * Résumé du jour. `connues` limite le comptage aux cartes qui existent encore sur le site
 * (une carte d'un cours supprimé ne compte plus) ; vide = pas de filtre.
 */
export function resumeRevisions(
  etat: Etat,
  jour: { dues: readonly string[]; nouvelles: readonly string[] },
  connues: readonly string[] = [],
  maintenant: Date = new Date(),
): ResumeRevisions {
  const filtre = connues.length ? new Set(connues) : null;
  const aujourdhui = jourLocal(maintenant);
  const lendemain = new Date(maintenant);
  lendemain.setDate(lendemain.getDate() + 1);
  const demainJour = jourLocal(lendemain);

  let faites = 0;
  let demain = 0;
  for (const [id, carte] of Object.entries(etat.srs)) {
    if (filtre && !filtre.has(id)) continue;
    if (carte.last_review && jourLocal(new Date(carte.last_review)) === aujourdhui) faites++;
    const due = Date.parse(carte.due);
    if (Number.isFinite(due) && due > maintenant.getTime() && jourLocal(new Date(due)) === demainJour) demain++;
  }
  const restantes = jour.dues.length + jour.nouvelles.length;
  const totalJour = faites + restantes;
  return {
    aRevoir: jour.dues.length,
    nouvelles: jour.nouvelles.length,
    faites,
    demain,
    part: totalJour > 0 ? faites / totalJour : 0,
  };
}

// ─── Textes ──────────────────────────────────────────────────────────────────

/** « React », « React et CSS », « React, JavaScript et CSS », « React, JavaScript et 2 autres ». */
export function listeMatieres(noms: readonly string[], max = 3): string {
  if (noms.length <= 1) return noms[0] ?? '';
  if (noms.length > max) {
    const reste = noms.length - (max - 1);
    return `${noms.slice(0, max - 1).join(', ')} et ${reste} autres`;
  }
  return `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}`;
}

/** « 3 / 5 notions » (espaces fines insécables autour de la barre). */
export function texteNotions(a: Pick<Avancement, 'vues' | 'total'>): string {
  return `${a.vues} / ${a.total} notion${a.total > 1 ? 's' : ''}`;
}

/** 0.6 → « 60 % » (espace fine insécable). */
export function pourcent(part: number): string {
  return `${Math.round(Math.min(1, Math.max(0, part)) * 100)} %`;
}
