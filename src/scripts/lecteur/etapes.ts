/**
 * Lecteur de cours : logique pure (aucun accès au DOM ni à window).
 * Testée dans tests/lecteur-etapes.test.ts.
 *
 *   Étapes du Mode Focus : [L'essentiel] → chaque notion (##) → [Fin du cours].
 *   Mémoire de session, balayage au doigt, scrollspy, J/K, barre de lecture.
 */

export type TypeEtape = 'essentiel' | 'notion' | 'fin';

export interface Etape {
  /** « essentiel », id de la notion (data-notion) ou « fin ». */
  id: string;
  type: TypeEtape;
  titre: string;
}

export const ID_ESSENTIEL = 'essentiel';
export const ID_FIN = 'fin';
export const TITRE_ESSENTIEL = 'L’essentiel en 30 s';
export const TITRE_FIN = 'Fin du cours';

/** Liste des étapes à partir des notions de la page (doublons et ids vides ignorés). */
export function construireEtapes(notions: ReadonlyArray<{ id: string; titre: string }>): Etape[] {
  const vus = new Set<string>([ID_ESSENTIEL, ID_FIN]);
  const etapes: Etape[] = [{ id: ID_ESSENTIEL, type: 'essentiel', titre: TITRE_ESSENTIEL }];
  for (const n of notions) {
    const id = n.id.trim();
    if (!id || vus.has(id)) continue;
    vus.add(id);
    etapes.push({ id, type: 'notion', titre: n.titre.replace(/\s+/g, ' ').trim() || 'Notion' });
  }
  etapes.push({ id: ID_FIN, type: 'fin', titre: TITRE_FIN });
  return etapes;
}

/** Ramène un index dans [0, total - 1] (0 si la liste est vide ou l'index invalide). */
export function borner(index: number, total: number): number {
  if (total <= 0 || !Number.isFinite(index)) return 0;
  return Math.min(total - 1, Math.max(0, Math.trunc(index)));
}

/** Index d'une étape par son id, -1 si absente. */
export function indexEtape(etapes: ReadonlyArray<Etape>, id: string | null | undefined): number {
  if (!id) return -1;
  return etapes.findIndex((e) => e.id === id);
}

/** « 2 / 6 » */
export function libelleCompteur(index: number, total: number): string {
  return `${borner(index, total) + 1} / ${Math.max(total, 1)}`;
}

/** « Étape 2 sur 6 : Réagir à un clic » (lecteurs d'écran, infobulles des points). */
export function libelleEtape(etapes: ReadonlyArray<Etape>, index: number): string {
  const i = borner(index, etapes.length);
  const e = etapes[i];
  return e ? `Étape ${i + 1} sur ${etapes.length} : ${e.titre}` : '';
}

/** « Notion 2 sur 4 » pour une étape de type notion, '' sinon. */
export function libelleNotion(etapes: ReadonlyArray<Etape>, index: number): string {
  const e = etapes[index];
  if (!e || e.type !== 'notion') return '';
  const notions = etapes.filter((x) => x.type === 'notion');
  return `Notion ${notions.indexOf(e) + 1} sur ${notions.length}`;
}

// ─── Mémoire de session (sessionStorage) ─────────────────────────────────────

export const CLE_MEMOIRE = 'manabi:focus';

export interface MemoireFocus {
  coursId: string;
  /** Id de l'étape affichée. */
  etape: string;
  /** Mode Focus ouvert (rechargement, épisode suivant enchaîné depuis le Focus). */
  actif: boolean;
}

/** Lit la mémoire si elle concerne ce cours (JSON abîmé ou autre cours → null). */
export function lireMemoire(brut: string | null | undefined, coursId: string): MemoireFocus | null {
  if (!brut) return null;
  try {
    const m: unknown = JSON.parse(brut);
    if (!m || typeof m !== 'object') return null;
    const { coursId: c, etape, actif } = m as Record<string, unknown>;
    if (c !== coursId || typeof etape !== 'string') return null;
    return { coursId, etape, actif: actif === true };
  } catch {
    return null;
  }
}

export function ecrireMemoire(m: MemoireFocus): string {
  return JSON.stringify({ coursId: m.coursId, etape: m.etape, actif: m.actif });
}

// ─── Balayage au doigt ──────────────────────────────────────────────────────

export interface Geste {
  /** Déplacement horizontal en px (négatif = vers la gauche). */
  dx: number;
  dy: number;
  /** Durée en ms. */
  duree: number;
}

export const SEUIL_BALAYAGE = 56;

/**
 * Sens d'un balayage : 1 = étape suivante (doigt vers la gauche), -1 = précédente, 0 = rien.
 * Il faut un geste net, surtout horizontal et rapide : un défilement vertical ne compte pas.
 */
export function sensBalayage({ dx, dy, duree }: Geste, seuil = SEUIL_BALAYAGE): -1 | 0 | 1 {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return 0;
  if (Math.abs(dx) < seuil || duree > 900) return 0;
  if (Math.abs(dy) > Math.abs(dx) * 0.6) return 0;
  return dx < 0 ? 1 : -1;
}

// ─── Position dans la page ──────────────────────────────────────────────────

/**
 * Section courante du sommaire : la dernière dont le haut a passé la ligne de lecture.
 * `hauts` = top (px, relatif à la fenêtre) de chaque section, dans l'ordre de la page.
 * En bas de page, la dernière section visible l'emporte (une courte section finale
 * ne monte jamais jusqu'à la ligne). Renvoie 0 avant la première section, -1 si vide.
 */
export function sectionCourante(
  hauts: ReadonlyArray<number>,
  ligne: number,
  options: { enBas?: boolean; hauteurVue?: number } = {},
): number {
  if (!hauts.length) return -1;
  let courante = 0;
  for (let i = 0; i < hauts.length; i++) if ((hauts[i] ?? Infinity) <= ligne) courante = i;
  if (options.enBas && options.hauteurVue !== undefined) {
    for (let i = hauts.length - 1; i > courante; i--) {
      if ((hauts[i] ?? Infinity) < options.hauteurVue) return i;
    }
  }
  return courante;
}

/**
 * Cible de J (sens 1) ou K (sens -1) parmi les hauts des sections, par rapport à la ligne de lecture.
 * K au milieu d'une section remonte d'abord à son début. Renvoie -1 s'il n'y a rien plus loin.
 */
export function cibleVoisine(hauts: ReadonlyArray<number>, ligne: number, sens: 1 | -1): number {
  if (!hauts.length) return -1;
  const tolerance = 4;
  let c = -1;
  for (let i = 0; i < hauts.length; i++) if ((hauts[i] ?? Infinity) <= ligne + tolerance) c = i;
  if (sens === 1) return c + 1 < hauts.length ? c + 1 : -1;
  if (c === -1) return -1;
  const dansLaSection = (hauts[c] ?? 0) < ligne - 48;
  return dansLaSection ? c : c - 1;
}

/** Part lue (0..1) d'un article : `haut` = top de l'article (px), `hauteur` = sa hauteur, `vue` = hauteur de la fenêtre. */
export function progressionLecture(haut: number, hauteur: number, vue: number): number {
  const parcours = hauteur - vue;
  if (!Number.isFinite(parcours) || parcours <= 0) return haut <= 0 ? 1 : 0;
  return Math.min(1, Math.max(0, -haut / parcours));
}

/** Minutes de lecture restantes (arrondi au-dessus, 0 si tout est vu). */
export function minutesRestantes(duree: number, vues: number, total: number, termine = false): number {
  if (termine || total <= 0 || vues >= total) return 0;
  const reste = duree * (1 - Math.max(0, vues) / total);
  return Math.max(1, Math.ceil(reste));
}

/** « Environ 5 min restantes » / « Tout est lu ». */
export function libelleRestant(minutes: number): string {
  if (minutes <= 0) return 'Tout est lu';
  return `Environ ${minutes} min restante${minutes > 1 ? 's' : ''}`;
}
