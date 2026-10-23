/**
 * File d'une session de cartes (pure, immuable).
 *
 * Une carte notée qui revient dans peu de temps (pas d'apprentissage : 1 min, 10 min) est
 * remise un peu plus loin dans la file, comme dans Anki. Les autres sortent de la file.
 * La progression compte les cartes DISTINCTES terminées : « 3 / 12 » ne recule jamais.
 */

export interface FileSession {
  /** Cartes restantes, la première est à l'écran. */
  readonly file: readonly string[];
  /** Cartes sorties de la file (terminées pour cette session). */
  readonly faites: readonly string[];
  /** Nombre de retours déjà faits par carte. */
  readonly retours: Readonly<Record<string, number>>;
  /** Nombre de cartes distinctes au départ. */
  readonly total: number;
}

export interface OptionsFile {
  /** Une carte due dans moins de ce délai revient dans la session (défaut 20 min). */
  horizonMs?: number;
  /** Nombre de cartes intercalées avant son retour (défaut 3). */
  ecart?: number;
  /** Retours maximum par carte et par session (défaut 3). */
  retoursMax?: number;
}

const DEFAUTS: Required<OptionsFile> = { horizonMs: 20 * 60_000, ecart: 3, retoursMax: 3 };

export function creerFile(ids: ReadonlyArray<string>): FileSession {
  const uniques = [...new Set(ids)];
  return { file: uniques, faites: [], retours: {}, total: uniques.length };
}

export function carteCourante(f: FileSession): string | undefined {
  return f.file[0];
}

export function estFinie(f: FileSession): boolean {
  return f.file.length === 0;
}

/** Numéro affiché (« 3 » dans « 3 / 12 ») : la prochaine carte distincte. */
export function numero(f: FileSession): number {
  return Math.min(f.total, f.faites.length + 1);
}

/**
 * Après une note. `revientDansMs` = délai avant la prochaine échéance de la carte
 * (null si inconnu : la carte sort de la file).
 */
export function apresNote(f: FileSession, id: string, revientDansMs: number | null, options: OptionsFile = {}): FileSession {
  const o = { ...DEFAUTS, ...options };
  if (!f.file.includes(id)) return f; // carte absente : rien ne change
  const reste = f.file.filter((x) => x !== id);

  const dejaRevenue = f.retours[id] ?? 0;
  const revient = revientDansMs !== null && revientDansMs <= o.horizonMs && dejaRevenue < o.retoursMax;
  if (!revient) {
    return { ...f, file: reste, faites: f.faites.includes(id) ? f.faites : [...f.faites, id] };
  }
  const position = Math.min(o.ecart, reste.length);
  return {
    ...f,
    file: [...reste.slice(0, position), id, ...reste.slice(position)],
    retours: { ...f.retours, [id]: dejaRevenue + 1 },
  };
}

/** Arrête la session : ce qui reste n'est pas compté comme fait. */
export function terminer(f: FileSession): FileSession {
  return { ...f, file: [] };
}

// ─── Composer une session ────────────────────────────────────────────────────

/** Session du jour : les cartes dues d'abord, puis les nouvelles, au plus `taille`. */
export function composerSession(jour: { dues: readonly string[]; nouvelles: readonly string[] }, taille: number): string[] {
  return [...new Set([...jour.dues, ...jour.nouvelles])].slice(0, Math.max(1, Math.floor(taille)));
}

/**
 * Révision libre (rien n'est dû) : les cartes déjà vues, de la plus proche échéance à la plus
 * lointaine, puis les jamais vues dans l'ordre de lecture ; au plus `taille`.
 */
export function sessionLibre(
  srs: Readonly<Record<string, { due: string }>>,
  toutes: ReadonlyArray<{ id: string }>,
  taille: number,
): string[] {
  const ids = [...new Set(toutes.map((c) => c.id))];
  const vues = ids.filter((id) => srs[id]).sort((a, b) => Date.parse(srs[a]?.due ?? '') - Date.parse(srs[b]?.due ?? ''));
  const jamais = ids.filter((id) => !srs[id]);
  return [...vues, ...jamais].slice(0, Math.max(1, Math.floor(taille)));
}
