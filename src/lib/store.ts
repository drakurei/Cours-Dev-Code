/**
 * Stockage local de Manabi (contrat §6 de docs/CONCEPTION.md).
 *
 * - Une seule clé localStorage : « manabi:v1 » (JSON) ; les secrets à part : « manabi:v1:secrets ».
 * - Sûr au rendu serveur : aucun accès à window au chargement du module.
 * - Tout accès au stockage est protégé (navigation privée, quota) : le site marche sans.
 * - Chaque modification émet l'événement window « manabi:change » (detail = Etat) ;
 *   les autres onglets sont suivis via l'événement « storage ».
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type CoursId = string;
/** `${coursId}::${hashCourt(question)}` — voir idCarte() dans src/lib/texte.ts. */
export type CarteId = string;

export interface ProgressionCours {
  /** ids des ## vus. */
  sectionsVues: string[];
  termine: boolean;
  /** ISO. */
  termineLe?: string;
  /** ISO. */
  derniereVisite: string;
}
export type Progression = Record<CoursId, ProgressionCours>;

/**
 * Carte FSRS sérialisée (compatible ts-fsrs `CardInput`) : les dates sont des chaînes ISO.
 * state : 0 = nouvelle, 1 = apprentissage, 2 = révision, 3 = réapprentissage.
 */
export interface CarteSRS {
  coursId: CoursId;
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: 0 | 1 | 2 | 3;
  last_review?: string;
}

export interface ResultatQuiz {
  meilleur: number;
  total: number;
  tentatives: number;
  /** ISO. */
  dernier: string;
}

export interface ExerciceFait {
  fait: boolean;
  /** ISO. */
  le: string;
}

export interface Serie {
  actuelle: number;
  record: number;
  /** AAAA-MM-JJ (date locale). */
  dernierJour: string;
}

export interface Stats {
  petales: number;
  serie: Serie;
  /** AAAA-MM-JJ → nombre d'actions ce jour-là. */
  jours: Record<string, number>;
}

export interface Prefs {
  theme: 'auto' | 'clair' | 'sombre';
  police: 'atkinson' | 'systeme';
  /** 0.9 à 1.4 → --user-scale. */
  taille: number;
  animations: 'auto' | 'reduites';
  petales: boolean;
  nouvellesCartesParJour: number;
  tailleSession: number;
  /** Minutes. */
  minuteur: number;
  voix: string | null;
  vitesseVoix: number;
  gistId: string | null;
  modeleIA: string;
}

export interface Etat {
  version: 1;
  /** ISO, dernière modification. */
  maj: string;
  progression: Progression;
  srs: Record<CarteId, CarteSRS>;
  quiz: Record<CoursId, ResultatQuiz>;
  /** Clé `${coursId}::${index}`. */
  exercices: Record<string, ExerciceFait>;
  stats: Stats;
  prefs: Prefs;
}

export interface Secrets {
  githubToken?: string;
  anthropicKey?: string;
}

/** Détail de l'événement window « manabi:petales » (pour une animation ou un toast). */
export interface GainPetales {
  n: number;
  raison: string;
  total: number;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

export const CLE = 'manabi:v1';
export const CLE_SECRETS = 'manabi:v1:secrets';
export const EVENEMENT = 'manabi:change';
export const EVENEMENT_PETALES = 'manabi:petales';

/** Barème des pétales (§6). */
export const BAREME = {
  notionVue: 1,
  bonneReponse: 2,
  carteRevisee: 1,
  exerciceFait: 5,
  coursTermine: 10,
} as const;

export const PREFS_DEFAUT: Prefs = {
  theme: 'auto',
  police: 'atkinson',
  taille: 1,
  animations: 'auto',
  petales: true,
  nouvellesCartesParJour: 15,
  tailleSession: 15,
  minuteur: 15,
  voix: null,
  vitesseVoix: 1,
  gistId: null,
  modeleIA: 'claude-sonnet-5-5',
};

const EPOQUE = '1970-01-01T00:00:00.000Z';

function geler<T>(o: T): T {
  if (o && typeof o === 'object') {
    for (const v of Object.values(o)) geler(v);
    Object.freeze(o);
  }
  return o;
}

/** État vide (gelé : ne jamais le muter, passer par modifier()). */
export const ETAT_INITIAL: Readonly<Etat> = geler({
  version: 1,
  maj: EPOQUE,
  progression: {},
  srs: {},
  quiz: {},
  exercices: {},
  stats: { petales: 0, serie: { actuelle: 0, record: 0, dernierJour: '' }, jours: {} },
  prefs: { ...PREFS_DEFAUT },
}) as Etat;

// ─── Outils ──────────────────────────────────────────────────────────────────

const estObjet = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const texteOu = (v: unknown, d: string): string => (typeof v === 'string' ? v : d);
const nombreOu = (v: unknown, d: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const borner = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));
const parmi = <T extends string>(v: unknown, valeurs: readonly T[], d: T): T =>
  typeof v === 'string' && (valeurs as readonly string[]).includes(v) ? (v as T) : d;

function cloner<T>(o: T): T {
  return typeof structuredClone === 'function' ? structuredClone(o) : (JSON.parse(JSON.stringify(o)) as T);
}

/** Date locale AAAA-MM-JJ (le « jour » de Jonathan, pas celui de Greenwich). */
export function jourLocal(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Nombre de jours entre deux dates AAAA-MM-JJ (b - a). */
export function ecartJours(a: string, b: string): number {
  const ta = Date.parse(`${a}T00:00:00Z`);
  const tb = Date.parse(`${b}T00:00:00Z`);
  if (Number.isNaN(ta) || Number.isNaN(tb)) return Number.NaN;
  return Math.round((tb - ta) / 86_400_000);
}

/** Série affichable aujourd'hui : 0 si le dernier jour actif date d'avant-hier ou plus. */
export function serieDuJour(etat: Etat, aujourdhui: string = jourLocal()): number {
  const { actuelle, dernierJour } = etat.stats.serie;
  if (!dernierJour) return 0;
  const ecart = ecartJours(dernierJour, aujourdhui);
  return ecart === 0 || ecart === 1 ? actuelle : 0;
}

/** Compte une action du jour et fait avancer la série (mutation du brouillon). */
export function compterActivite(brouillon: Etat, aujourdhui: string = jourLocal()): void {
  const s = brouillon.stats;
  s.jours[aujourdhui] = (s.jours[aujourdhui] ?? 0) + 1;
  if (s.serie.dernierJour === aujourdhui) return;
  const ecart = s.serie.dernierJour ? ecartJours(s.serie.dernierJour, aujourdhui) : Number.NaN;
  if (ecart < 0) return; // horloge revenue en arrière : on ne casse rien
  s.serie.actuelle = ecart === 1 ? s.serie.actuelle + 1 : 1;
  s.serie.dernierJour = aujourdhui;
  s.serie.record = Math.max(s.serie.record, s.serie.actuelle);
}

// ─── Normalisation / migration ───────────────────────────────────────────────

function normaliserPrefs(brut: unknown): Prefs {
  const p = estObjet(brut) ? brut : {};
  const d = PREFS_DEFAUT;
  return {
    theme: parmi(p.theme, ['auto', 'clair', 'sombre'] as const, d.theme),
    police: parmi(p.police, ['atkinson', 'systeme'] as const, d.police),
    taille: borner(nombreOu(p.taille, d.taille), 0.9, 1.4),
    animations: parmi(p.animations, ['auto', 'reduites'] as const, d.animations),
    petales: typeof p.petales === 'boolean' ? p.petales : d.petales,
    nouvellesCartesParJour: borner(Math.round(nombreOu(p.nouvellesCartesParJour, d.nouvellesCartesParJour)), 0, 200),
    tailleSession: borner(Math.round(nombreOu(p.tailleSession, d.tailleSession)), 5, 100),
    minuteur: borner(Math.round(nombreOu(p.minuteur, d.minuteur)), 1, 120),
    voix: typeof p.voix === 'string' ? p.voix : null,
    vitesseVoix: borner(nombreOu(p.vitesseVoix, d.vitesseVoix), 0.5, 2),
    gistId: typeof p.gistId === 'string' && p.gistId ? p.gistId : null,
    modeleIA: texteOu(p.modeleIA, d.modeleIA) || d.modeleIA,
  };
}

/** Garde les seules entrées objets d'un dictionnaire et les passe à `f` (null = jetée). */
function dico<T>(brut: unknown, f: (v: Record<string, unknown>) => T | null): Record<string, T> {
  const sortie: Record<string, T> = {};
  if (!estObjet(brut)) return sortie;
  for (const [k, v] of Object.entries(brut)) {
    if (!estObjet(v)) continue;
    const r = f(v);
    if (r !== null) sortie[k] = r;
  }
  return sortie;
}

/**
 * Transforme n'importe quelle valeur (ancien format, JSON abîmé, import) en Etat valide.
 * Les champs inconnus sont jetés, les manquants reçoivent leur valeur par défaut.
 */
export function normaliser(brut: unknown): Etat {
  const b = estObjet(brut) ? brut : {};
  // Migration : une future version 2 ajoutera ici sa conversion depuis la 1.
  const stats = estObjet(b.stats) ? b.stats : {};
  const serie = estObjet(stats.serie) ? stats.serie : {};
  const jours: Record<string, number> = {};
  if (estObjet(stats.jours)) {
    for (const [j, n] of Object.entries(stats.jours)) if (typeof n === 'number' && n > 0) jours[j] = Math.round(n);
  }

  return {
    version: 1,
    maj: texteOu(b.maj, EPOQUE),
    progression: dico(b.progression, (v) => ({
      sectionsVues: Array.isArray(v.sectionsVues) ? [...new Set(v.sectionsVues.filter((s) => typeof s === 'string'))] : [],
      termine: v.termine === true,
      ...(typeof v.termineLe === 'string' ? { termineLe: v.termineLe } : {}),
      derniereVisite: texteOu(v.derniereVisite, EPOQUE),
    })),
    srs: dico(b.srs, (v) => {
      if (typeof v.coursId !== 'string' || typeof v.due !== 'string') return null;
      const etatCarte = nombreOu(v.state, 0);
      return {
        coursId: v.coursId,
        due: v.due,
        stability: nombreOu(v.stability, 0),
        difficulty: nombreOu(v.difficulty, 0),
        elapsed_days: nombreOu(v.elapsed_days, 0),
        scheduled_days: nombreOu(v.scheduled_days, 0),
        learning_steps: nombreOu(v.learning_steps, 0),
        reps: nombreOu(v.reps, 0),
        lapses: nombreOu(v.lapses, 0),
        state: (etatCarte >= 0 && etatCarte <= 3 ? Math.round(etatCarte) : 0) as CarteSRS['state'],
        ...(typeof v.last_review === 'string' ? { last_review: v.last_review } : {}),
      };
    }),
    quiz: dico(b.quiz, (v) => ({
      meilleur: nombreOu(v.meilleur, 0),
      total: nombreOu(v.total, 0),
      tentatives: nombreOu(v.tentatives, 0),
      dernier: texteOu(v.dernier, EPOQUE),
    })),
    exercices: dico(b.exercices, (v) => ({ fait: v.fait === true, le: texteOu(v.le, EPOQUE) })),
    stats: {
      petales: Math.max(0, Math.round(nombreOu(stats.petales, 0))),
      serie: {
        actuelle: Math.max(0, Math.round(nombreOu(serie.actuelle, 0))),
        record: Math.max(0, Math.round(nombreOu(serie.record, 0))),
        dernierJour: texteOu(serie.dernierJour, ''),
      },
      jours,
    },
    prefs: normaliserPrefs(b.prefs),
  };
}

// ─── Accès au stockage (toujours protégé) ────────────────────────────────────

function stockage(): Storage | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null; // accès refusé (cookies bloqués, iframe…)
  }
}

function lireBrut(cle: string): string | null {
  try {
    return stockage()?.getItem(cle) ?? null;
  } catch {
    return null;
  }
}

function ecrireBrut(cle: string, valeur: string | null): boolean {
  try {
    const s = stockage();
    if (!s) return false;
    if (valeur === null) s.removeItem(cle);
    else s.setItem(cle, valeur);
    return true;
  } catch {
    return false; // quota plein, navigation privée…
  }
}

function emettre(nom: string, detail: unknown): void {
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent(nom, { detail }));
    }
  } catch {
    /* rien : l'événement est un bonus */
  }
}

// ─── État en mémoire ─────────────────────────────────────────────────────────

let cache: Etat | null = null;
let brutCache: string | null = null;

function charger(): Etat {
  const brut = lireBrut(CLE);
  brutCache = brut;
  if (!brut) return cloner(ETAT_INITIAL);
  try {
    return normaliser(JSON.parse(brut));
  } catch {
    return cloner(ETAT_INITIAL); // JSON abîmé : on repart proprement sans planter
  }
}

/**
 * État courant. Renvoie le MÊME objet tant que rien ne change (instantané stable
 * pour useSyncExternalStore). Ne pas le muter : utiliser modifier().
 * Côté serveur : toujours ETAT_INITIAL.
 */
export function lire(): Etat {
  if (typeof window === 'undefined') return ETAT_INITIAL;
  if (cache === null) cache = charger();
  return cache;
}

function remplacer(etat: Etat): void {
  const json = JSON.stringify(etat);
  ecrireBrut(CLE, json);
  brutCache = json;
  cache = etat;
  emettre(EVENEMENT, etat);
}

/** Mute un brouillon (copie), met à jour `maj`, sauvegarde et émet « manabi:change ». */
export function modifier(fn: (brouillon: Etat) => void): void {
  if (typeof window === 'undefined') return;
  const brouillon = cloner(lire());
  fn(brouillon);
  brouillon.maj = new Date().toISOString();
  remplacer(normaliser(brouillon));
}

/**
 * S'abonne aux changements (cet onglet + les autres onglets).
 * Renvoie la fonction de désabonnement. Compatible useSyncExternalStore.
 */
export function abonner(cb: (e: Etat) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const surChange = () => cb(lire());
  const surStorage = (ev: StorageEvent) => {
    if (ev.key !== null && ev.key !== CLE) return;
    if (ev.newValue === brutCache) return;
    cache = null; // un autre onglet a écrit : on relira
    cb(lire());
  };
  window.addEventListener(EVENEMENT, surChange);
  window.addEventListener('storage', surStorage);
  return () => {
    window.removeEventListener(EVENEMENT, surChange);
    window.removeEventListener('storage', surStorage);
  };
}

// ─── Export / import / fusion ────────────────────────────────────────────────

/** JSON de l'état (sans les secrets, qui vivent sous une autre clé). */
export function exporter(): string {
  return JSON.stringify(lire(), null, 2);
}

/**
 * Importe un JSON exporté. `mode` : « remplacer » (défaut) ou « fusionner » avec l'état actuel.
 * Lève une Error en français si le texte n'est pas un export Manabi.
 */
export function importer(json: string, mode: 'remplacer' | 'fusionner' = 'remplacer'): void {
  let brut: unknown;
  try {
    brut = JSON.parse(json);
  } catch {
    throw new Error('Ce fichier n’est pas un JSON valide.');
  }
  if (!estObjet(brut) || brut.version === undefined || !estObjet(brut.prefs)) {
    throw new Error('Ce JSON n’est pas une sauvegarde Manabi (champs « version » et « prefs » absents).');
  }
  const importe = normaliser(brut);
  const final = mode === 'fusionner' ? fusionner(lire(), importe) : importe;
  remplacer({ ...final, maj: new Date().toISOString() });
}

const plusRecent = (a: string | undefined, b: string | undefined): number => (a ?? '').localeCompare(b ?? '');

/** Pour chaque clé : garde l'entrée dont la date est la plus récente (b gagne à égalité). */
function fusionnerDico<T>(a: Record<string, T>, b: Record<string, T>, date: (v: T) => string | undefined): Record<string, T> {
  const sortie: Record<string, T> = { ...a };
  for (const [k, vb] of Object.entries(b)) {
    const va = sortie[k];
    sortie[k] = va === undefined || plusRecent(date(vb), date(va)) >= 0 ? vb : va;
  }
  return sortie;
}

/**
 * Fusion pour la synchro : « le plus récent gagne », entrée par entrée.
 * Pétales et série = max ; jours = max par jour ; préférences = celles de l'état le plus récent.
 * Pure : ne modifie ni a ni b.
 */
export function fusionner(a: Etat, b: Etat): Etat {
  const A = normaliser(a);
  const B = normaliser(b);
  const bPlusRecent = plusRecent(B.maj, A.maj) >= 0;

  const progression = fusionnerDico(A.progression, B.progression, (p) => p.termineLe && p.termineLe > p.derniereVisite ? p.termineLe : p.derniereVisite);
  // Une notion vue ou un cours terminé ne « se dé-voit » pas : on unit ces informations.
  for (const [id, p] of Object.entries(progression)) {
    const pa = A.progression[id];
    const pb = B.progression[id];
    const vues = new Set([...(pa?.sectionsVues ?? []), ...(pb?.sectionsVues ?? [])]);
    const termine = Boolean(pa?.termine || pb?.termine);
    const termineLe = [pa?.termineLe, pb?.termineLe].filter((x): x is string => !!x).sort()[0];
    progression[id] = {
      ...p,
      sectionsVues: [...vues],
      termine,
      ...(termine && termineLe ? { termineLe } : {}),
    };
    if (!termine) delete progression[id]?.termineLe;
  }

  const jours: Record<string, number> = { ...A.stats.jours };
  for (const [j, n] of Object.entries(B.stats.jours)) jours[j] = Math.max(jours[j] ?? 0, n);

  const serieA = A.stats.serie;
  const serieB = B.stats.serie;
  const serieRecente = plusRecent(serieB.dernierJour, serieA.dernierJour) > 0 ? serieB : serieA;
  const memeJour = serieA.dernierJour === serieB.dernierJour;

  return {
    version: 1,
    maj: bPlusRecent ? B.maj : A.maj,
    progression,
    srs: fusionnerDico(A.srs, B.srs, (c) => c.last_review),
    quiz: fusionnerDico(A.quiz, B.quiz, (q) => q.dernier),
    exercices: fusionnerDico(A.exercices, B.exercices, (e) => e.le),
    stats: {
      petales: Math.max(A.stats.petales, B.stats.petales),
      serie: {
        actuelle: memeJour ? Math.max(serieA.actuelle, serieB.actuelle) : serieRecente.actuelle,
        record: Math.max(serieA.record, serieB.record),
        dernierJour: serieRecente.dernierJour,
      },
      jours,
    },
    prefs: { ...(bPlusRecent ? B.prefs : A.prefs) },
  };
}

// ─── Actions métier ──────────────────────────────────────────────────────────

/** Ajoute des pétales et compte l'activité du jour (mutation du brouillon). */
function ajouterPetales(e: Etat, n: number): void {
  e.stats.petales = Math.max(0, e.stats.petales + Math.round(n));
  compterActivite(e);
}

function annoncerGain(n: number, raison: string): void {
  emettre(EVENEMENT_PETALES, { n, raison, total: lire().stats.petales } satisfies GainPetales);
}

/** Ajoute des pétales, compte l'activité du jour (série) et émet « manabi:petales ». */
export function gagnerPetales(n: number, raison: string): void {
  if (typeof window === 'undefined') return;
  modifier((e) => ajouterPetales(e, n));
  annoncerGain(n, raison);
}

function progressionDe(e: Etat, coursId: CoursId): ProgressionCours {
  return (e.progression[coursId] ??= { sectionsVues: [], termine: false, derniereVisite: new Date().toISOString() });
}

/** Note la visite d'un cours (alimente « Reprendre »). Ne donne pas de pétale. */
export function enregistrerVisite(coursId: CoursId): void {
  modifier((e) => {
    progressionDe(e, coursId).derniereVisite = new Date().toISOString();
  });
}

/** Marque une notion (##) comme vue : +1 pétale la première fois. Renvoie true si c'était nouveau. */
export function marquerSectionVue(coursId: CoursId, sectionId: string): boolean {
  if (typeof window === 'undefined') return false;
  if (lire().progression[coursId]?.sectionsVues.includes(sectionId)) return false;
  modifier((e) => {
    const p = progressionDe(e, coursId);
    p.sectionsVues.push(sectionId);
    p.derniereVisite = new Date().toISOString();
    ajouterPetales(e, BAREME.notionVue);
  });
  annoncerGain(BAREME.notionVue, 'notion vue');
  return true;
}

/** Marque un cours terminé : +10 pétales la première fois. Renvoie true si c'était nouveau. */
export function marquerTermine(coursId: CoursId): boolean {
  if (typeof window === 'undefined') return false;
  if (estTermine(coursId)) return false;
  modifier((e) => {
    const p = progressionDe(e, coursId);
    const maintenant = new Date().toISOString();
    p.termine = true;
    p.termineLe = maintenant;
    p.derniereVisite = maintenant;
    ajouterPetales(e, BAREME.coursTermine);
  });
  annoncerGain(BAREME.coursTermine, 'cours terminé');
  return true;
}

export function estTermine(coursId: CoursId): boolean {
  return lire().progression[coursId]?.termine === true;
}

/** Nombre de cartes déjà apprises dont la révision est due (badge « à réviser »). */
export function compterCartesDues(etat: Etat, maintenant: Date = new Date()): number {
  const t = maintenant.getTime();
  let n = 0;
  for (const c of Object.values(etat.srs)) if (Date.parse(c.due) <= t) n++;
  return n;
}

/** Remet tout à zéro (les secrets sont gardés : voir ecrireSecrets). */
export function reinitialiser(): void {
  if (typeof window === 'undefined') return;
  remplacer({ ...cloner(ETAT_INITIAL), maj: new Date().toISOString() });
}

// ─── Secrets (jamais exportés ni synchronisés) ──────────────────────────────

export function lireSecrets(): Secrets {
  const brut = lireBrut(CLE_SECRETS);
  if (!brut) return {};
  try {
    const s: unknown = JSON.parse(brut);
    if (!estObjet(s)) return {};
    return {
      ...(typeof s.githubToken === 'string' && s.githubToken ? { githubToken: s.githubToken } : {}),
      ...(typeof s.anthropicKey === 'string' && s.anthropicKey ? { anthropicKey: s.anthropicKey } : {}),
    };
  } catch {
    return {};
  }
}

/** Met à jour une partie des secrets ; une valeur vide ou null efface ce secret. */
export function ecrireSecrets(partiel: { [K in keyof Secrets]?: string | null | undefined }): void {
  const s: Secrets = { ...lireSecrets() };
  for (const cle of ['githubToken', 'anthropicKey'] as const) {
    if (!(cle in partiel)) continue;
    const v = partiel[cle];
    if (typeof v === 'string' && v.trim()) s[cle] = v.trim();
    else delete s[cle];
  }
  ecrireBrut(CLE_SECRETS, Object.keys(s).length ? JSON.stringify(s) : null);
}

/** Réservé aux tests : oublie l'état en mémoire. */
export function _viderCache(): void {
  cache = null;
  brutCache = null;
}
