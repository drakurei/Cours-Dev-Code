/**
 * Raccourcis clavier des îlots d'apprentissage.
 * - Jamais quand le focus est dans un champ de saisie, ni avec ⌘ / Ctrl / Alt.
 * - Portée « globale » (page Réviser) : toute la page ; « locale » (page de cours) :
 *   seulement quand le focus est dans l'îlot, pour ne pas voler Espace au défilement.
 */
import { useEffect, useRef, type RefObject } from 'react';

export type Portee = 'globale' | 'locale';

export function dansUnChamp(cible: EventTarget | null): boolean {
  const el = cible as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName ?? ''));
}

/**
 * Élément qui réagit déjà seul à Espace / Entrée (bouton, lien, onglet à choisir…).
 * L'onglet déjà sélectionné n'en fait pas partie : il s'active au focus, Espace n'y fait rien.
 */
export function surUnControle(cible: EventTarget | null): boolean {
  const el = cible as HTMLElement | null;
  if (!el || typeof el.closest !== 'function') return false;
  return !!el.closest(
    'button:not([role="tab"]), a[href], summary, [role="button"], [role="tab"]:not([aria-selected="true"]), [role="link"], [role="radio"], [role="checkbox"]',
  );
}

/**
 * Écoute keydown sur window. `gestionnaire` renvoie true quand il a traité la touche
 * (le comportement par défaut est alors annulé).
 */
export function useRaccourcis(
  actif: boolean,
  racine: RefObject<HTMLElement | null>,
  portee: Portee,
  gestionnaire: (ev: KeyboardEvent) => boolean,
): void {
  const g = useRef(gestionnaire);
  g.current = gestionnaire;

  useEffect(() => {
    if (!actif) return;
    const surTouche = (ev: KeyboardEvent) => {
      if (ev.defaultPrevented || ev.isComposing || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (dansUnChamp(ev.target)) return;
      if (portee === 'locale' && !racine.current?.contains(document.activeElement)) return;
      if (g.current(ev)) ev.preventDefault();
    };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [actif, portee, racine]);
}

/** Chiffre 1-9 d'une touche (rangée du haut ou pavé numérique), sinon null. */
export function chiffre(ev: KeyboardEvent): number | null {
  const m = /^(?:Digit|Numpad)([1-9])$/.exec(ev.code);
  if (m) return Number(m[1]);
  return /^[1-9]$/.test(ev.key) ? Number(ev.key) : null;
}

/** Animations réduites (réglage du site ou préférence du système). */
export function mouvementReduit(): boolean {
  if (typeof document === 'undefined') return true;
  if (document.documentElement.dataset.motion === 'reduit') return true;
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Fait défiler doucement jusqu'à l'élément s'il dépasse de l'écran (sans saut si déjà visible). */
export function ramenerEnVue(el: HTMLElement | null): void {
  if (!el || typeof el.getBoundingClientRect !== 'function') return;
  const r = el.getBoundingClientRect();
  const marge = 72;
  if (r.top >= marge && r.top <= window.innerHeight - 160) return;
  el.scrollIntoView({ block: 'start', behavior: mouvementReduit() ? 'auto' : 'smooth' });
}
