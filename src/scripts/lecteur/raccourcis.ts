/**
 * Raccourcis clavier du lecteur (jamais quand on tape dans un champ ni quand une fenêtre est ouverte) :
 *   Page :        F = Mode Focus · J / K = section suivante / précédente (défilement doux)
 *   Mode Focus :  → ou J = étape suivante · ← ou K = précédente · Début / Fin · Échap ou F = quitter
 * « / », « ? » et ⌘/Ctrl K appartiennent à la palette (îlot global).
 */
import { cibleVoisine } from './etapes.ts';
import type { ControleFocus } from './focus.ts';
import { titreDe } from './sommaire.ts';
import { dansUnChamp, defileHorizontalement, defilerVers, dialogueOuvert, focaliser, toucheSimple } from './outils.ts';

/** Ligne de lecture pour J / K : juste sous la barre d'outils collante. */
function ligne(): number {
  return window.innerWidth >= 1024 ? 120 : 140;
}

/** Défile vers la section voisine (J : 1, K : -1) et y place le focus clavier. */
export function sectionVoisine(sections: HTMLElement[], sens: 1 | -1): boolean {
  const hauts = sections.map((s) => s.getBoundingClientRect().top);
  const i = cibleVoisine(hauts, ligne(), sens);
  const cible = sections[i];
  if (!cible) return false;
  defilerVers(cible);
  focaliser(titreDe(cible));
  return true;
}

export function brancherRaccourcis(focus: ControleFocus | null, sections: () => HTMLElement[]): void {
  window.addEventListener('keydown', (ev) => {
    if (ev.defaultPrevented || !toucheSimple(ev) || dansUnChamp(ev.target) || dialogueOuvert()) return;
    const touche = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
    let fait = false;

    if (focus?.actif()) {
      // Les flèches restent au code ou au tableau qui défile horizontalement.
      const flecheLibre = !defileHorizontalement(ev.target);
      if (touche === 'Escape' || (touche === 'f' && !ev.repeat)) {
        focus.fermer();
        fait = true;
      } else if (touche === 'j' || (touche === 'ArrowRight' && flecheLibre)) {
        focus.suivant();
        fait = true;
      } else if (touche === 'k' || (touche === 'ArrowLeft' && flecheLibre)) {
        focus.precedent();
        fait = true;
      } else if (touche === 'Home' && !ev.shiftKey) {
        focus.premiere();
        fait = true;
      } else if (touche === 'End' && !ev.shiftKey) {
        focus.derniere();
        fait = true;
      }
    } else if (touche === 'f' && !ev.shiftKey && !ev.repeat && focus) {
      focus.ouvrir();
      fait = true;
    } else if ((touche === 'j' || touche === 'k') && !ev.shiftKey) {
      fait = sectionVoisine(sections(), touche === 'j' ? 1 : -1);
    }

    if (fait) ev.preventDefault();
  });
}
