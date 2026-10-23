/**
 * Petits outils DOM partagés par les modules du lecteur.
 */

/** Vrai si l'utilisateur tape dans un champ : aucun raccourci ne doit alors réagir. */
export function dansUnChamp(cible: EventTarget | null): boolean {
  const el = cible as HTMLElement | null;
  if (!el || typeof el.tagName !== 'string') return false;
  return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || !!el.closest?.('[contenteditable=""], [contenteditable="true"]');
}

/** Une fenêtre modale (palette, feuille…) est ouverte : on lui laisse le clavier. */
export function dialogueOuvert(): boolean {
  return !!document.querySelector('dialog[open]');
}

/** Touche sans Ctrl / ⌘ / Alt (Maj tolérée pour les majuscules) et hors composition IME. */
export function toucheSimple(ev: KeyboardEvent): boolean {
  return !ev.ctrlKey && !ev.metaKey && !ev.altKey && !ev.isComposing;
}

/** Animations réduites : réglage du site ou préférence du système. */
export function mouvementReduit(): boolean {
  return (
    document.documentElement.dataset.motion === 'reduit' ||
    (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  );
}

/** Défile jusqu'à un élément (doux, sauf animations réduites ou `instant`). */
export function defilerVers(el: Element, instant = false): void {
  el.scrollIntoView({ block: 'start', behavior: instant || mouvementReduit() ? 'instant' : 'smooth' });
}

/**
 * Donne le focus clavier à un titre ou une section (tabindex="-1" ajouté au besoin),
 * sans faire défiler : le point de départ de Tab suit ainsi la lecture.
 */
export function focaliser(el: HTMLElement | null): void {
  if (!el) return;
  if (!el.hasAttribute('tabindex')) {
    el.tabIndex = -1;
    el.dataset.focusCible = '';
  }
  el.focus({ preventScroll: true });
}

/** Élément qui défile horizontalement (code, tableau) : ses flèches lui appartiennent. */
export function defileHorizontalement(cible: EventTarget | null): boolean {
  const el = (cible as Element | null)?.closest?.('pre, .tableau, [data-defilement-horizontal]');
  return !!el && el.scrollWidth > el.clientWidth + 1;
}

/** Lit / écrit sessionStorage sans jamais planter (navigation privée, stockage bloqué). */
export function lireSession(cle: string): string | null {
  try {
    return window.sessionStorage.getItem(cle);
  } catch {
    return null;
  }
}

export function ecrireSession(cle: string, valeur: string): void {
  try {
    window.sessionStorage.setItem(cle, valeur);
  } catch {
    /* rien : la mémoire est un bonus */
  }
}

/** Annonce polie pour les lecteurs d'écran (vidée puis remplie pour être relue même si identique). */
export function annoncer(zone: HTMLElement | null, message: string): void {
  if (!zone) return;
  zone.textContent = '';
  window.setTimeout(() => {
    zone.textContent = message;
  }, 40);
}
