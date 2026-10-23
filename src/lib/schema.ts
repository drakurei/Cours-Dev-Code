/**
 * Schéma des cours et des matières (contrat §4 de docs/CONCEPTION.md).
 *
 * Utilisé par : le build Astro (src/content.config.ts), l'Atelier (navigateur)
 * et les scripts Node (import('../src/lib/schema.ts')).
 * Contraintes : n'importe QUE 'zod' et reste en TypeScript « effaçable »
 * (pas d'enum, de namespace ni de paramètres-propriétés) pour que Node 24 l'exécute tel quel.
 */
import { z } from 'zod';

// ─── Constantes partagées ────────────────────────────────────────────────────

export const COULEURS = ['sakura', 'ai', 'matcha', 'shu', 'fuji', 'yamabuki', 'kon', 'sora', 'sumi'] as const;
export const TYPES = ['cours', 'projet', 'tp', 'memo'] as const;
export const NIVEAUX = ['debutant', 'intermediaire', 'avance'] as const;
export const NIVEAUX_EXERCICE = ['facile', 'moyen', 'difficile'] as const;
export const STATUTS_PROJET = ['en-cours', 'termine', 'en-pause'] as const;

/** Slug de matière ou de cours : minuscules, chiffres, tirets. */
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** Date du frontmatter : AAAA-MM-JJ. */
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const LIMITES = {
  titre: 90,
  essentiel: 400,
  choixMin: 2,
  choixMax: 6,
} as const;

export type Couleur = (typeof COULEURS)[number];
export type TypeCours = (typeof TYPES)[number];
export type Niveau = (typeof NIVEAUX)[number];
export type NiveauExercice = (typeof NIVEAUX_EXERCICE)[number];
export type StatutProjet = (typeof STATUTS_PROJET)[number];

// ─── Briques ─────────────────────────────────────────────────────────────────

/** Minuscules sans accents, espaces → tirets : « Débutant » → « debutant », « En cours » → « en-cours ». */
function normaliserValeur(v: unknown): unknown {
  if (typeof v !== 'string') return v;
  return v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

/** Liste fermée, tolérante aux accents et majuscules (une IA écrit souvent « débutant »). */
function choixParmi<const T extends readonly [string, ...string[]]>(valeurs: T) {
  return z.preprocess(
    normaliserValeur,
    z.enum(valeurs, { error: () => `doit valoir ${valeurs.map((v) => `« ${v} »`).join(', ')}` }),
  );
}

/** Texte obligatoire, non vide, longueur max facultative. */
function texte(max?: number) {
  const base = z
    .string({ error: (iss) => (iss.input === undefined ? 'champ obligatoire' : 'doit être un texte') })
    .trim()
    .min(1, { error: 'ne doit pas être vide' });
  if (max === undefined) return base;
  return base.max(max, {
    error: (iss) => `${max} caractères maximum (actuellement ${String(iss.input ?? '').length})`,
  });
}

/** Nombre entier, accepté aussi sous forme de chaîne (« 8 »). */
function entier(min: number, max: number) {
  return z.preprocess(
    (v) => (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)) ? Number(v) : v),
    z
      .number({ error: 'doit être un nombre' })
      .int({ error: 'doit être un nombre entier' })
      .min(min, { error: `doit être au moins ${min}` })
      .max(max, { error: `doit être au plus ${max}` }),
  );
}

/** Vrai si « AAAA-MM-JJ » existe dans le calendrier (refuse 2026-02-31). */
function dateExiste(s: string): boolean {
  if (!DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** Date AAAA-MM-JJ (chaîne ou Date YAML) → toujours une chaîne « AAAA-MM-JJ ». */
const dateSchema = z
  .union([z.date(), z.string()], { error: 'doit être une date au format AAAA-MM-JJ' })
  .transform((v, ctx) => {
    const s = v instanceof Date ? (Number.isNaN(v.getTime()) ? '' : v.toISOString().slice(0, 10)) : v.trim();
    if (!dateExiste(s)) {
      ctx.issues.push({ code: 'custom', input: v, message: 'doit être une date au format AAAA-MM-JJ (ex. 2026-09-23)' });
      return z.NEVER;
    }
    return s;
  });

/** Liste facultative : absente → []. */
function liste<T extends z.ZodType>(element: T) {
  return z.array(element, { error: 'doit être une liste' }).default([]);
}

/** Lien http(s). */
const urlSchema = z
  .string({ error: 'doit être un lien' })
  .trim()
  .regex(/^https?:\/\/\S+$/, { error: 'doit être un lien complet (https://…)' });

/** Chemin d'un fichier joint : /media/… (dans public/) ou lien http(s). */
const cheminSchema = z
  .string({ error: 'doit être un chemin' })
  .trim()
  .regex(/^(\/(?!\/)\S*|https?:\/\/\S+)$/, { error: 'doit commencer par / (ex. /media/react/slides.pdf) ou https://' });

// ─── Sous-schémas ────────────────────────────────────────────────────────────

export const definitionSchema = z.object({
  terme: texte(),
  definition: texte(),
  exemple: z.string().trim().optional(),
});

export const flashcardSchema = z.object({
  q: texte(),
  r: texte(),
});

export const questionQuizSchema = z
  .object({
    question: texte(),
    choix: z
      .array(texte(), { error: 'doit être une liste de réponses possibles' })
      .min(LIMITES.choixMin, { error: `il faut au moins ${LIMITES.choixMin} choix` })
      .max(LIMITES.choixMax, { error: `${LIMITES.choixMax} choix maximum` }),
    reponse: texte(),
    explication: z.string().trim().optional(),
  })
  .superRefine((q, ctx) => {
    if (!q.choix.includes(q.reponse)) {
      ctx.addIssue({
        code: 'custom',
        path: ['reponse'],
        message: "doit être exactement l'un des choix (même texte, mêmes majuscules)",
      });
    }
    if (new Set(q.choix).size !== q.choix.length) {
      ctx.addIssue({ code: 'custom', path: ['choix'], message: 'deux choix sont identiques' });
    }
  });

export const exerciceSchema = z.object({
  titre: texte(),
  niveau: choixParmi(NIVEAUX_EXERCICE).default('facile'),
  enonce: texte(),
  indices: liste(texte()),
  solution: z.string().trim().optional(),
});

export const projetSchema = z.object({
  repo: urlSchema.optional(),
  demo: urlSchema.optional(),
  stack: liste(texte()),
  statut: choixParmi(STATUTS_PROJET).optional(),
  role: z.string().trim().optional(),
});

export const fichierSchema = z.object({
  titre: texte(),
  chemin: cheminSchema,
});

// ─── Cours ───────────────────────────────────────────────────────────────────

/**
 * Frontmatter d'un cours. Les champs inconnus sont ignorés (tolérés).
 * `chapitre` et `duree` absents sont calculés ailleurs (nom du fichier, longueur du texte) :
 * voir chapitreDe() et dureeDe() dans src/lib/cours.ts.
 */
export const coursSchema = z.object({
  titre: texte(LIMITES.titre),
  matiere: z
    .string({ error: (iss) => (iss.input === undefined ? 'champ obligatoire' : 'doit être un texte') })
    .trim()
    .regex(SLUG_RE, { error: 'doit être un slug : minuscules, chiffres et tirets (ex. html-css)' }),
  type: choixParmi(TYPES).default('cours'),
  chapitre: entier(0, 999).optional(),
  niveau: choixParmi(NIVEAUX).default('debutant'),
  duree: entier(1, 600).optional(),
  date: dateSchema.optional(),
  source: z.string().trim().optional(),
  tags: liste(z.string().trim()),
  essentiel: texte(LIMITES.essentiel),
  retenir: liste(texte()),
  definitions: liste(definitionSchema),
  flashcards: liste(flashcardSchema),
  quiz: liste(questionQuizSchema),
  exercices: liste(exerciceSchema),
  projet: projetSchema.optional(),
  fichiers: liste(fichierSchema),
  brouillon: z.boolean({ error: 'doit valoir true ou false' }).default(false),
});

// ─── Matière ─────────────────────────────────────────────────────────────────

export const matiereSchema = z.object({
  nom: texte(40),
  kanji: z
    .string({ error: (iss) => (iss.input === undefined ? 'champ obligatoire' : 'doit être un texte') })
    .trim()
    .refine((k) => Array.from(k).length === 1, { error: 'doit être UN seul caractère (ex. 応)' }),
  lecture: z.string().trim().optional(),
  couleur: choixParmi(COULEURS).default('sumi'),
  description: z.string().trim().default(''),
  ordre: entier(0, 999).default(99),
});

export type Cours = z.output<typeof coursSchema>;
export type CoursEntree = z.input<typeof coursSchema>;
export type Matiere = z.output<typeof matiereSchema>;
export type Definition = z.output<typeof definitionSchema>;
export type Flashcard = z.output<typeof flashcardSchema>;
export type QuestionQuiz = z.output<typeof questionQuizSchema>;
export type Exercice = z.output<typeof exerciceSchema>;
export type Projet = z.output<typeof projetSchema>;
export type Fichier = z.output<typeof fichierSchema>;

// ─── Validation lisible (Atelier, scripts) ──────────────────────────────────

export type Resultat<T> = { ok: true; data: T } | { ok: false; erreurs: string[] };

/** ['quiz', 2, 'reponse'] → « quiz[2].reponse » */
export function formaterChemin(chemin: ReadonlyArray<PropertyKey>): string {
  let s = '';
  for (const morceau of chemin) {
    if (typeof morceau === 'number') s += `[${morceau}]`;
    else s += s ? `.${String(morceau)}` : String(morceau);
  }
  return s;
}

/** Messages zod → « champ : message » en français. */
export function formaterErreurs(issues: ReadonlyArray<z.core.$ZodIssue>): string[] {
  return issues.map((iss) => {
    const chemin = formaterChemin(iss.path);
    return chemin ? `${chemin} : ${iss.message}` : iss.message;
  });
}

const erreursFr = z.locales.fr().localeError;

function valider<S extends z.ZodType>(schema: S, data: unknown): Resultat<z.output<S>> {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, erreurs: ['le frontmatter doit être une liste de champs « clé: valeur »'] };
  }
  const r = schema.safeParse(data, { error: erreursFr });
  return r.success ? { ok: true, data: r.data } : { ok: false, erreurs: formaterErreurs(r.error.issues) };
}

/** Valide le frontmatter d'un cours. */
export function validerCours(data: unknown): Resultat<Cours> {
  return valider(coursSchema, data);
}

/** Valide le YAML d'une matière. */
export function validerMatiere(data: unknown): Resultat<Matiere> {
  return valider(matiereSchema, data);
}
