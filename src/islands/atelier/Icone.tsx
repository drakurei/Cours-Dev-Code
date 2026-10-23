/**
 * Icônes de l'Atelier : celles du site (src/lib/icones.ts) + quelques-unes propres à l'Atelier,
 * même style (24×24, trait 1,75 façon SF Symbols). Toujours décoratives (aria-hidden).
 */
import { ICONES, type NomIcone } from '../../lib/icones.ts';

const ICONES_ATELIER = {
  televerser: '<path d="M12 15V4.5M7.5 9 12 4.5 16.5 9"/><path d="M4.5 14.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/>',
  telecharger: '<path d="M12 4.5V15M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 14.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/>',
  branche: '<circle cx="7" cy="5.5" r="2"/><circle cx="7" cy="18.5" r="2"/><circle cx="17" cy="7.5" r="2"/><path d="M7 7.5v9M17 9.5c0 4.5-7.5 3.5-9.6 7.3"/>',
  corbeille: '<path d="M4.5 7h15M9.5 7V5.2a.7.7 0 0 1 .7-.7h3.6a.7.7 0 0 1 .7.7V7M6.8 7l.9 11.4a1.3 1.3 0 0 0 1.3 1.1h6a1.3 1.3 0 0 0 1.3-1.1L17.2 7"/>',
  eclair: '<path d="M13.2 3.5 5.8 13.2h5.6l-.6 7.3 7.4-9.7h-5.6z"/>',
  baguette: '<path d="m4.5 19.5 11-11"/><path d="m13.5 6.5 4 4"/><path d="M18.5 3.5v3M17 5h3M7.5 4v2.5M6.25 5.25h2.5M19 15v2.5M17.75 16.25h2.5"/>',
  alerte: '<path d="M10.6 4.8a1.6 1.6 0 0 1 2.8 0l7 12.3a1.6 1.6 0 0 1-1.4 2.4H5a1.6 1.6 0 0 1-1.4-2.4z"/><path d="M12 9.5v4M12 16.6v.01"/>',
  arret: '<rect x="6.5" y="6.5" width="11" height="11" rx="2.2"/>',
  oeil: '<path d="M2.8 12S6.2 5.8 12 5.8 21.2 12 21.2 12 17.8 18.2 12 18.2 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.8"/>',
  crayon: '<path d="M15.2 5.3a2 2 0 0 1 2.8 0l.7.7a2 2 0 0 1 0 2.8L8.5 19 4.5 19.5 5 15.5z"/><path d="m13.5 7 3.5 3.5"/>',
  texte: '<path d="M5 6.5h14M5 11h14M5 15.5h14M5 20h8"/>',
  cle: '<circle cx="8" cy="15.5" r="3.5"/><path d="m10.5 13 8.5-8.5M16 7.5l2.2 2.2M13.8 9.7l1.6 1.6"/>',
  info: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8v.01"/>',
  recommencer: '<path d="M19 12a7 7 0 1 1-2.05-4.95"/><path d="M19.2 4.6v3.6h-3.6"/>',
  annuler: '<path d="M9 7.5 4.5 12 9 16.5"/><path d="M5 12h9.5a5 5 0 0 1 0 10H12"/>',
  pages: '<rect x="7.5" y="3.5" width="12" height="15" rx="2"/><path d="M4.5 7v11.5a2 2 0 0 0 2 2H16"/>',
} as const;

export type NomIconeAtelier = NomIcone | keyof typeof ICONES_ATELIER;

const TOUTES: Record<NomIconeAtelier, string> = { ...ICONES, ...ICONES_ATELIER };

export default function Icone({ nom, taille = 20, className }: { nom: NomIconeAtelier; taille?: number; className?: string }) {
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
      dangerouslySetInnerHTML={{ __html: TOUTES[nom] }}
    />
  );
}
