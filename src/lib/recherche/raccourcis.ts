/**
 * Raccourcis clavier du site, affichés par la feuille « ? » (une seule source de vérité).
 */

export interface Raccourci {
  /** Touches, chacune dans son <kbd>. « Mod » = ⌘ sur Mac, Ctrl ailleurs. */
  touches: string[];
  /** Plusieurs combinaisons équivalentes (« J » ou « K »). */
  ou?: string[][];
  /** Ce que fait le raccourci, en une phrase courte. */
  action: string;
}

export interface GroupeRaccourcis {
  titre: string;
  /** Où le raccourci marche. */
  contexte: string;
  raccourcis: Raccourci[];
}

export const RACCOURCIS: ReadonlyArray<GroupeRaccourcis> = [
  {
    titre: 'Partout',
    contexte: 'Sauf quand tu écris dans un champ.',
    raccourcis: [
      { touches: ['Mod', 'K'], action: 'Ouvrir ou fermer la recherche.' },
      { touches: ['/'], action: 'Ouvrir la recherche.' },
      { touches: ['?'], action: 'Afficher ces raccourcis.' },
    ],
  },
  {
    titre: 'Dans un cours',
    contexte: 'Sur la page d’un cours.',
    raccourcis: [
      { touches: ['F'], action: 'Mode Focus : une notion à la fois, en plein écran.' },
      { touches: ['J'], ou: [['K']], action: 'Notion suivante (J) ou précédente (K).' },
      { touches: ['←'], ou: [['→']], action: 'En Mode Focus : notion précédente ou suivante.' },
      { touches: ['Échap'], action: 'Quitter le Mode Focus, fermer une fenêtre.' },
    ],
  },
  {
    titre: 'En révision',
    contexte: 'Pendant une session de cartes.',
    raccourcis: [
      { touches: ['Espace'], action: 'Retourner la carte pour voir la réponse.' },
      { touches: ['1'], ou: [['2'], ['3'], ['4']], action: 'Noter : Raté, Dur, Bien, Facile.' },
    ],
  },
];

/** Vrai sur Mac, iPhone et iPad (⌘ au lieu de Ctrl). */
export function estMac(plateforme: string, agent = ''): boolean {
  return /Mac|iPhone|iPad|iPod/i.test(plateforme) || /Mac OS/i.test(agent);
}

/** Libellé d'une touche selon la plateforme. */
export function libelleTouche(touche: string, mac: boolean): string {
  if (touche === 'Mod') return mac ? '⌘' : 'Ctrl';
  return touche;
}

/** Nom lisible d'une touche pour les lecteurs d'écran. */
export function nomTouche(touche: string, mac: boolean): string {
  const noms: Record<string, string> = {
    Mod: mac ? 'Commande' : 'Contrôle',
    '/': 'barre oblique',
    '?': 'point d’interrogation',
    '←': 'flèche gauche',
    '→': 'flèche droite',
    '↑': 'flèche haut',
    '↓': 'flèche bas',
  };
  return noms[touche] ?? touche;
}
