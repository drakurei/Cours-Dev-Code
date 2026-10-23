/**
 * Révision espacée FSRS (ts-fsrs 5.4) : planifier une carte, prévoir les intervalles,
 * composer les cartes du jour, noter une carte.
 *
 * - Paramètres FSRS par défaut, pas d'apprentissage courts activés (1 min, 10 min),
 *   fuzz activé (désactivable pour les tests : _reglerFuzz(false)).
 * - Les cartes sont stockées en ISO dans le store (CarteSRS) : conversion ici.
 * - Le « jour » est le jour local de Jonathan (jourLocal du store), pas celui de Greenwich.
 */
import { createEmptyCard, fsrs, generatorParameters, StrategyMode, type Card, type FSRS, type Grade } from 'ts-fsrs';
import { BAREME, ecartJours, gagnerPetales, jourLocal, modifier, type CarteId, type CarteSRS, type CoursId, type Etat } from './store.ts';

// ─── Notes ───────────────────────────────────────────────────────────────────

export type Note = 1 | 2 | 3 | 4;
export const NOTES: readonly Note[] = [1, 2, 3, 4];
export const LIBELLES_NOTES = { 1: 'Raté', 2: 'Dur', 3: 'Bien', 4: 'Facile' } as const satisfies Record<Note, string>;

export function estNote(n: unknown): n is Note {
  return n === 1 || n === 2 || n === 3 || n === 4;
}

// ─── Moteur ts-fsrs ──────────────────────────────────────────────────────────

let fuzzActif = true;
let moteur: FSRS | null = null;

/**
 * Graine du fuzz : le jour local, pas la milliseconde. L'aperçu affiché sur un bouton
 * (« 3 j ») donne ainsi le même résultat que la note réelle, une seconde plus tard.
 */
function graineDuJour(this: unknown): string {
  const s = this as { review_time: Date; current: Card };
  return `${jourLocal(s.review_time)}_${s.current.reps}_${s.current.difficulty * s.current.stability}`;
}

function planificateur(): FSRS {
  if (!moteur) {
    moteur = fsrs(generatorParameters({ enable_fuzz: fuzzActif, enable_short_term: true }));
    moteur.useStrategy(StrategyMode.SEED, graineDuJour);
  }
  return moteur;
}

/** Réservé aux tests : coupe (ou remet) le fuzz pour des intervalles exacts. */
export function _reglerFuzz(actif: boolean): void {
  fuzzActif = actif;
  moteur = null;
}

// ─── Conversion store ↔ ts-fsrs ──────────────────────────────────────────────

function versCard(c: CarteSRS): Card {
  const card: Card = {
    due: new Date(c.due),
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
    learning_steps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
  };
  if (c.last_review) card.last_review = new Date(c.last_review);
  return card;
}

function carteDe(carte: CarteSRS | undefined, maintenant: Date): Card {
  return carte ? versCard(carte) : createEmptyCard(maintenant);
}

/**
 * Nouvelle planification d'une carte (pure). `carte` absente = carte jamais vue.
 * elapsed_days (champ déprécié, que ts-fsrs ne relit pas) = jours LOCAUX depuis la révision
 * précédente : il sert à savoir si une carte a été introduite aujourd'hui.
 */
export function planifier(carte: CarteSRS | undefined, note: Note, maintenant: Date = new Date()): CarteSRS {
  const { card } = planificateur().next(carteDe(carte, maintenant), maintenant, note as Grade);
  const precedente = carte?.last_review ? new Date(carte.last_review) : null;
  const ecart = precedente ? Math.max(0, ecartJours(jourLocal(precedente), jourLocal(maintenant)) || 0) : 0;
  return {
    coursId: carte?.coursId ?? '',
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: ecart,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state as CarteSRS['state'],
    last_review: maintenant.toISOString(),
  };
}

// ─── Intervalles lisibles ────────────────────────────────────────────────────

const MINUTE = 60_000;
const HEURE = 60 * MINUTE;
const JOUR = 24 * HEURE;

/** Durée → « 10 min », « 3 h », « 2 j », « 4 mois », « 1 an ». */
export function formaterIntervalle(ms: number): string {
  const d = Math.max(0, ms);
  if (d < HEURE) return `${Math.max(1, Math.round(d / MINUTE))} min`;
  if (d < JOUR) return `${Math.max(1, Math.round(d / HEURE))} h`;
  const jours = Math.round(d / JOUR);
  if (jours < 30) return `${Math.max(1, jours)} j`;
  if (jours < 365) return `${Math.max(1, Math.round(jours / 30))} mois`;
  const ans = Math.round((jours / 365) * 10) / 10;
  return `${String(ans).replace('.', ',')} ${ans >= 2 ? 'ans' : 'an'}`;
}

/** Intervalle prévu pour chaque note : { 1: '1 min', 2: '6 min', 3: '10 min', 4: '8 j' }. */
export function apercuIntervalles(carte: CarteSRS | undefined, maintenant: Date = new Date()): Record<Note, string> {
  const apercu = planificateur().repeat(carteDe(carte, maintenant), maintenant);
  const t = maintenant.getTime();
  const sortie = {} as Record<Note, string>;
  for (const n of NOTES) sortie[n] = formaterIntervalle(apercu[n as Grade].card.due.getTime() - t);
  return sortie;
}

/** Libellé d'une échéance : « maintenant », « dans 10 min », « dans 3 h », « demain », « dans 4 j ». */
export function formaterEcheance(due: string | Date, maintenant: Date = new Date()): string {
  const d = typeof due === 'string' ? new Date(due) : due;
  const ms = d.getTime() - maintenant.getTime();
  if (Number.isNaN(ms) || ms <= 0) return 'maintenant';
  const jours = ecartJours(jourLocal(maintenant), jourLocal(d));
  if (jours <= 0) return `dans ${formaterIntervalle(ms)}`;
  if (jours === 1) return 'demain';
  return `dans ${formaterIntervalle(jours * JOUR)}`;
}

/** Prochaine échéance (ISO) après `maintenant` parmi toutes les cartes du store, ou null. */
export function prochaineEcheance(etat: Etat, maintenant: Date = new Date()): string | null {
  const t = maintenant.getTime();
  let min = Number.POSITIVE_INFINITY;
  let iso: string | null = null;
  for (const c of Object.values(etat.srs)) {
    const d = Date.parse(c.due);
    if (d > t && d < min) {
      min = d;
      iso = c.due;
    }
  }
  return iso;
}

// ─── Cartes du jour ──────────────────────────────────────────────────────────

/** Une carte a été introduite aujourd'hui si toutes ses révisions datent d'aujourd'hui (jour local). */
export function introduiteLe(carte: CarteSRS, jour: string): boolean {
  if (!carte.last_review || carte.reps < 1 || carte.lapses > 0 || carte.elapsed_days > 0) return false;
  return jourLocal(new Date(carte.last_review)) === jour;
}

/** Nombre de cartes nouvelles déjà introduites aujourd'hui (tous cours confondus). */
export function nouvellesIntroduites(etat: Etat, maintenant: Date = new Date()): number {
  const jour = jourLocal(maintenant);
  let n = 0;
  for (const c of Object.values(etat.srs)) if (introduiteLe(c, jour)) n++;
  return n;
}

export interface CartesDuJour {
  /** Cartes déjà vues dont la révision est due, de la plus en retard à la plus récente. */
  dues: string[];
  /** Cartes jamais vues, dans l'ordre de lecture, dans la limite du jour. */
  nouvelles: string[];
}

/**
 * Compose les cartes du jour. `toutes` = les cartes connues, dans l'ordre de lecture des cours
 * (cartes.json). Une carte du store absente de `toutes` (cours supprimé) est ignorée.
 */
export function cartesDuJour(
  etat: Etat,
  toutes: ReadonlyArray<{ id: string; coursId: string }>,
  maintenant: Date = new Date(),
): CartesDuJour {
  const t = maintenant.getTime();
  const vus = new Set<string>();
  const dues: { id: string; due: number; ordre: number }[] = [];
  const jamaisVues: string[] = [];

  toutes.forEach((c, ordre) => {
    if (vus.has(c.id)) return; // deux questions identiques = une seule carte
    vus.add(c.id);
    const s = etat.srs[c.id];
    if (!s) jamaisVues.push(c.id);
    else {
      const due = Date.parse(s.due);
      if (due <= t) dues.push({ id: c.id, due, ordre });
    }
  });

  dues.sort((a, b) => a.due - b.due || a.ordre - b.ordre);
  const reste = Math.max(0, etat.prefs.nouvellesCartesParJour - nouvellesIntroduites(etat, maintenant));
  return { dues: dues.map((d) => d.id), nouvelles: jamaisVues.slice(0, reste) };
}

/** Durée estimée d'une session (≈ 25 s par carte, retours compris), en minutes. */
export function minutesEstimees(nbCartes: number): number {
  if (!(nbCartes > 0)) return 0;
  return Math.max(1, Math.round((nbCartes * 25) / 60));
}

// ─── Action ──────────────────────────────────────────────────────────────────

/** Note une carte : la replanifie dans le store (dates ISO) et donne +1 pétale. */
export function noter(carteId: CarteId, coursId: CoursId, note: Note, maintenant: Date = new Date()): void {
  if (typeof window === 'undefined' || !estNote(note)) return;
  modifier((e) => {
    e.srs[carteId] = { ...planifier(e.srs[carteId], note, maintenant), coursId };
  });
  gagnerPetales(BAREME.carteRevisee, 'carte révisée');
}
