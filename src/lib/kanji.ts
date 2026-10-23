/**
 * Kanji repères (§2.5) : blocs, sections du lecteur, navigation.
 * Toujours affichés avec lang="ja" aria-hidden="true" + le libellé français lisible.
 */

export interface KanjiInfo {
  kanji: string;
  /** Lecture romanisée et sens (infobulle). */
  lecture: string;
  /** Libellé français affiché à côté. */
  libelle: string;
}

/** Blocs du corps d'un cours (:::quoi, :::exemple…). */
export const KANJI_BLOCS = {
  essentiel: { kanji: '要', lecture: 'yō — l’essentiel', libelle: 'L’essentiel en 30 s' },
  quoi: { kanji: '何', lecture: 'nani — quoi', libelle: 'Quoi' },
  exemple: { kanji: '例', lecture: 'rei — exemple', libelle: 'Exemple' },
  piege: { kanji: '罠', lecture: 'wana — piège', libelle: 'Piège' },
  ou: { kanji: '場', lecture: 'ba — le lieu', libelle: 'Où ça sert' },
  astuce: { kanji: '技', lecture: 'waza — technique', libelle: 'Astuce' },
  info: { kanji: '知', lecture: 'chi — savoir', libelle: 'Info' },
  attention: { kanji: '注', lecture: 'chū — attention', libelle: 'Attention' },
  retenir: { kanji: '覚', lecture: 'oboe — retenir', libelle: 'À retenir' },
} as const satisfies Record<string, KanjiInfo>;

export type NomBloc = keyof typeof KANJI_BLOCS;
export const NOMS_BLOCS = Object.keys(KANJI_BLOCS) as NomBloc[];

/** Sections fixes du lecteur de cours. */
export const KANJI_SECTIONS = {
  essentiel: KANJI_BLOCS.essentiel,
  retenir: KANJI_BLOCS.retenir,
  definition: { kanji: '辞', lecture: 'ji — dictionnaire', libelle: 'Définitions' },
  exercice: { kanji: '練', lecture: 'ren — s’entraîner', libelle: 'Exercices' },
  quiz: { kanji: '問', lecture: 'mon — question', libelle: 'Quiz' },
  flashcard: { kanji: '札', lecture: 'fuda — carte', libelle: 'Flashcards' },
  documents: { kanji: '書', lecture: 'sho — écrit', libelle: 'Documents' },
  termine: { kanji: '済', lecture: 'sumi — terminé', libelle: 'Terminé' },
  projet: { kanji: '作', lecture: 'saku — créer', libelle: 'Fiche projet' },
} as const satisfies Record<string, KanjiInfo>;

export type NomSection = keyof typeof KANJI_SECTIONS;

/** Entrées de navigation (barre latérale, onglets). `chemin` est relatif à la base du site. */
export const KANJI_NAVIGATION = {
  aujourdhui: { kanji: '今', lecture: 'ima — maintenant', libelle: 'Aujourd’hui', chemin: '/' },
  tomes: { kanji: '巻', lecture: 'maki — tome', libelle: 'Tomes', chemin: '/tomes/' },
  reviser: { kanji: '復', lecture: 'fuku — revenir', libelle: 'Réviser', chemin: '/reviser/' },
  projets: { kanji: '作', lecture: 'saku — créer', libelle: 'Projets', chemin: '/projets/' },
  glossaire: { kanji: '辞', lecture: 'ji — dictionnaire', libelle: 'Glossaire', chemin: '/glossaire/' },
  atelier: { kanji: '工', lecture: 'kō — fabriquer', libelle: 'Atelier', chemin: '/atelier/' },
  reglages: { kanji: '設', lecture: 'setsu — régler', libelle: 'Réglages', chemin: '/reglages/' },
} as const satisfies Record<string, KanjiInfo & { chemin: string }>;

export type PageNav = keyof typeof KANJI_NAVIGATION;
export const PAGES_NAV = Object.keys(KANJI_NAVIGATION) as PageNav[];

/** Mots japonais de l'interface (salutations, 404, récompenses, logo…). */
export const MOTS_JAPONAIS = {
  logo: '学び',
  bonjourMatin: 'おはよう',
  bonjour: 'こんにちは',
  bonsoir: 'こんばんは',
  perdu: '迷子',
  petales: '花びら',
  serie: '連',
  tome: '巻',
  episode: '第話',
  enso: '円相',
  nuit: '夜',
  recents: '新',
} as const;

/** Tous les caractères japonais (et chiffres) que la police Mincho doit savoir dessiner. */
export function caracteresKanji(supplement: Iterable<string> = []): string {
  const sources: string[] = [
    ...Object.values(KANJI_BLOCS).map((k) => k.kanji),
    ...Object.values(KANJI_SECTIONS).map((k) => k.kanji),
    ...Object.values(KANJI_NAVIGATION).map((k) => k.kanji),
    ...Object.values(MOTS_JAPONAIS),
    '0123456789',
    ...supplement,
  ];
  const uniques = new Set<string>();
  for (const s of sources) for (const c of s) if (c.trim()) uniques.add(c);
  return [...uniques].sort().join('');
}

/** Liste figée de la V1 (pratique pour les tests et les scripts). */
export const TOUS_LES_KANJI = caracteresKanji();

/** URL Google Fonts de Shippori Mincho limitée aux caractères utilisés (quelques Ko). */
export function urlPoliceKanji(supplement: Iterable<string> = []): string {
  const texte = encodeURIComponent(caracteresKanji(supplement));
  return `https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&display=swap&text=${texte}`;
}
