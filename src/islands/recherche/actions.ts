/**
 * Actions de la palette : documents indexés (titre et synonymes fixes) + libellés selon le contexte
 * + exécution. Les événements suivent les contrats entre îlots (manabi:focus, manabi:minuteur).
 */
import { modifier, type Prefs } from '../../lib/store.ts';
import { KANJI_NAVIGATION } from '../../lib/kanji.ts';
import { pluriel } from '../../lib/texte.ts';
import { url } from '../../lib/url.ts';
import type { DocRecherche } from '../../lib/recherche/types.ts';
import type { NomIconePalette } from './icones.tsx';

export type IdAction =
  | 'reviser'
  | 'focus'
  | 'theme-clair'
  | 'theme-sombre'
  | 'theme-auto'
  | 'minuteur'
  | 'atelier'
  | 'reglages'
  | 'raccourcis'
  | 'glossaire';

/** Ce que la palette sait de la page et des préférences au moment de l'affichage. */
export interface ContexteActions {
  /** Page d'un cours (Mode Focus disponible). */
  surCours: boolean;
  /** Mode Focus déjà ouvert. */
  enFocus: boolean;
  theme: Prefs['theme'];
  minutes: number;
  cartesDues: number;
  /** Requête tapée (pour « Chercher dans le glossaire »). */
  requete: string;
}

/** Vue d'une action à l'écran. */
export interface VueAction {
  titre: string;
  detail: string;
  /** Icône, ou kanji de navigation. */
  icone?: NomIconePalette;
  kanji?: string;
  /** Touche rappelée à droite (« F », « ? »). */
  touche?: string;
  /** Réglage déjà actif (thème). */
  actuel?: boolean;
  /** URL quand l'action ouvre une page (Ctrl/⌘ + Entrée = nouvel onglet). */
  url?: string;
}

const MOTS: Record<IdAction, string> = {
  reviser: 'reviser revision cartes flashcards quiz memoire srs session du jour',
  focus: 'mode focus concentration plein ecran une notion a la fois zen',
  'theme-clair': 'theme clair jour lumineux washi apparence couleurs light',
  'theme-sombre': 'theme sombre nuit yoru apparence couleurs dark',
  'theme-auto': 'theme automatique auto systeme apparence couleurs',
  minuteur: 'minuteur timer chrono pomodoro session temps concentration lancer',
  atelier: 'atelier creer un cours nouveau importer pdf images generer ia',
  reglages: 'reglages parametres preferences options apparence voix synchronisation',
  raccourcis: 'raccourcis clavier touches aide shortcuts',
  glossaire: 'glossaire definitions',
};

const TITRES_INDEX: Record<IdAction, string> = {
  reviser: 'Réviser maintenant',
  focus: 'Mode Focus',
  'theme-clair': 'Thème clair',
  'theme-sombre': 'Thème sombre',
  'theme-auto': 'Thème automatique',
  minuteur: 'Lancer le minuteur',
  atelier: 'Ouvrir l’Atelier',
  reglages: 'Ouvrir les Réglages',
  raccourcis: 'Raccourcis clavier',
  glossaire: 'Chercher dans le glossaire',
};

/** Ordre d'affichage quand la recherche est vide. */
export const ORDRE_ACTIONS: ReadonlyArray<IdAction> = [
  'reviser',
  'focus',
  'minuteur',
  'theme-clair',
  'theme-sombre',
  'theme-auto',
  'atelier',
  'reglages',
  'raccourcis',
];

export const idDoc = (id: IdAction): string => `action:${id}`;
export const idAction = (idDocument: string): IdAction | null =>
  idDocument.startsWith('action:') ? (idDocument.slice(7) as IdAction) : null;

/** Documents indexés (libellés fixes : l'index n'a pas à être refait quand le contexte change). */
export function documentsActions(): DocRecherche[] {
  return ORDRE_ACTIONS.map((id) => ({
    id: idDoc(id),
    type: 'action' as const,
    titre: TITRES_INDEX[id],
    url: '',
    texte: '',
    motsCles: MOTS[id],
  }));
}

/** URL des pages déjà couvertes par une action (pour éviter les doublons). */
export function urlsCouvertes(): string[] {
  return [url(KANJI_NAVIGATION.reviser.chemin), url(KANJI_NAVIGATION.atelier.chemin), url(KANJI_NAVIGATION.reglages.chemin)];
}

/** Vrai si l'action a du sens dans ce contexte. */
export function actionDisponible(id: IdAction, c: ContexteActions): boolean {
  if (id === 'focus') return c.surCours;
  if (id === 'glossaire') return c.requete.trim().length >= 2;
  return true;
}

const LIBELLES_THEME: Record<Prefs['theme'], string> = { clair: 'clair', sombre: 'sombre', auto: 'automatique' };

/** Libellés affichés selon le contexte. */
export function vueAction(id: IdAction, c: ContexteActions): VueAction {
  switch (id) {
    case 'reviser':
      return {
        titre: 'Réviser maintenant',
        detail: c.cartesDues > 0 ? `${pluriel(c.cartesDues, 'carte')} à revoir aujourd’hui` : 'Cartes du jour, quiz éclair',
        kanji: KANJI_NAVIGATION.reviser.kanji,
        url: url(KANJI_NAVIGATION.reviser.chemin),
      };
    case 'focus':
      return c.enFocus
        ? { titre: 'Quitter le Mode Focus', detail: 'Revenir à la page complète', icone: 'focus', touche: 'Échap' }
        : { titre: 'Mode Focus', detail: 'Une notion à la fois, en plein écran', icone: 'focus', touche: 'F' };
    case 'theme-clair':
    case 'theme-sombre':
    case 'theme-auto': {
      const choix = id === 'theme-clair' ? 'clair' : id === 'theme-sombre' ? 'sombre' : 'auto';
      const actuel = c.theme === choix;
      return {
        titre: `Thème ${LIBELLES_THEME[choix]}`,
        detail: actuel ? 'Thème actuel' : choix === 'auto' ? 'Suit le réglage de l’appareil' : choix === 'clair' ? 'Papier washi, lumineux' : 'Yoru, pour le soir',
        icone: choix === 'clair' ? 'soleil' : choix === 'sombre' ? 'lune' : 'auto',
        actuel,
      };
    }
    case 'minuteur':
      return { titre: `Lancer le minuteur · ${c.minutes} min`, detail: 'Une session courte, sans distraction', icone: 'horloge' };
    case 'atelier':
      return {
        titre: 'Ouvrir l’Atelier',
        detail: 'Créer un cours depuis un PDF, des images ou un texte',
        kanji: KANJI_NAVIGATION.atelier.kanji,
        url: url(KANJI_NAVIGATION.atelier.chemin),
      };
    case 'reglages':
      return {
        titre: 'Ouvrir les Réglages',
        detail: 'Apparence, révision, voix, synchronisation',
        kanji: KANJI_NAVIGATION.reglages.kanji,
        url: url(KANJI_NAVIGATION.reglages.chemin),
      };
    case 'raccourcis':
      return { titre: 'Raccourcis clavier', detail: 'Toutes les touches utiles', icone: 'clavier', touche: '?' };
    case 'glossaire': {
      const q = c.requete.trim();
      return {
        titre: `Chercher « ${q} » dans le glossaire`,
        detail: 'Toutes les définitions, filtrées',
        kanji: KANJI_NAVIGATION.glossaire.kanji,
        url: `${url(KANJI_NAVIGATION.glossaire.chemin)}?q=${encodeURIComponent(q)}`,
      };
    }
  }
}

/** Annonce polie pour les lecteurs d'écran (zone [data-annonce] du BaseLayout). */
export function annoncer(message: string): void {
  const zone = document.querySelector<HTMLElement>('[data-annonce]');
  if (!zone) return;
  zone.textContent = '';
  window.setTimeout(() => {
    zone.textContent = message;
  }, 60);
}

export interface Executeurs {
  ouvrirRaccourcis: () => void;
}

/**
 * Exécute une action (la palette est déjà fermée).
 * Renvoie false si rien n'a été fait (action inconnue).
 */
export function executerAction(id: IdAction, c: ContexteActions, x: Executeurs, nouvelOnglet = false): boolean {
  const vue = vueAction(id, c);
  if (vue.url) {
    if (nouvelOnglet) window.open(vue.url, '_blank', 'noopener');
    else window.location.assign(vue.url);
    return true;
  }
  switch (id) {
    case 'focus':
      window.dispatchEvent(new CustomEvent('manabi:focus', { detail: { action: c.enFocus ? 'fermer' : 'ouvrir' } }));
      return true;
    case 'theme-clair':
    case 'theme-sombre':
    case 'theme-auto': {
      const choix = id === 'theme-clair' ? 'clair' : id === 'theme-sombre' ? 'sombre' : 'auto';
      modifier((b) => {
        b.prefs.theme = choix;
      });
      annoncer(`Thème ${LIBELLES_THEME[choix]} activé.`);
      return true;
    }
    case 'minuteur':
      // Le Minuteur annonce lui-même le départ (pas de double annonce).
      window.dispatchEvent(new CustomEvent('manabi:minuteur', { detail: { minutes: c.minutes, action: 'demarrer' } }));
      return true;
    case 'raccourcis':
      x.ouvrirRaccourcis();
      return true;
    default:
      return false;
  }
}
