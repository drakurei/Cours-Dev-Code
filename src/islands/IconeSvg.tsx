/**
 * Icône fonctionnelle pour les îlots React (mêmes tracés que src/components/Icone.astro).
 */
import { ICONES, type NomIcone } from '../lib/icones.ts';

interface Props {
  nom: NomIcone;
  taille?: number;
  className?: string;
}

export default function IconeSvg({ nom, taille = 20, className }: Props) {
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
      dangerouslySetInnerHTML={{ __html: ICONES[nom] }}
    />
  );
}
