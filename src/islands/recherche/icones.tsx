/**
 * Icônes propres à la palette (même trait que src/lib/icones.ts : 24×24, 1,75, façon SF Symbols).
 */
import { ICONES, type NomIcone } from '../../lib/icones.ts';

const ICONES_PALETTE = {
  soleil: '<circle cx="12" cy="12" r="3.75"/><path d="M12 3.5v1.75M12 18.75v1.75M3.5 12h1.75M18.75 12h1.75M6 6l1.25 1.25M16.75 16.75 18 18M6 18l1.25-1.25M16.75 7.25 18 6"/>',
  lune: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
  auto: '<circle cx="12" cy="12" r="7.75"/><path d="M12 4.25v15.5" /><path d="M12 4.25a7.75 7.75 0 0 1 0 15.5z" fill="currentColor" stroke="none"/>',
  focus: '<path d="M4.5 9V6a1.5 1.5 0 0 1 1.5-1.5h3M15 4.5h3A1.5 1.5 0 0 1 19.5 6v3M19.5 15v3a1.5 1.5 0 0 1-1.5 1.5h-3M9 19.5H6A1.5 1.5 0 0 1 4.5 18v-3"/><circle cx="12" cy="12" r="2.25"/>',
  clavier: '<rect x="3" y="6.5" width="18" height="11" rx="2"/><path d="M7 10h.01M10.5 10h.01M14 10h.01M17.5 10h.01M8 14h8"/>',
  historique: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9"/><path d="M4.5 4.75V9h4.25"/><path d="M12 8.25V12l2.75 1.75"/>',
  entree: '<path d="M19 6v5a3 3 0 0 1-3 3H6"/><path d="m9.5 10.5-3.5 3.5 3.5 3.5"/>',
  effacer: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  livre: '<path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13.5H6.5A1.5 1.5 0 0 0 5 19V5.5z"/><path d="M5 19a1.5 1.5 0 0 0 1.5 1.5H19"/>',
} as const;

export type NomIconePalette = keyof typeof ICONES_PALETTE | NomIcone;

const TOUTES: Record<string, string> = { ...ICONES, ...ICONES_PALETTE };

interface Props {
  nom: NomIconePalette;
  taille?: number;
  className?: string;
}

/** Icône décorative (le libellé est porté par l'élément parent). */
export function IconePalette({ nom, taille = 20, className }: Props) {
  return (
    <svg
      className={className}
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      // Tracés constants définis dans le code (aucune donnée utilisateur).
      dangerouslySetInnerHTML={{ __html: TOUTES[nom] ?? '' }}
    />
  );
}
