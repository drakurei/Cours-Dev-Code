/**
 * Ensō 円相 en React : même tracé et même encre que src/components/Enso.astro
 * (styles dans accueil.css, classes .acc-enso).
 */
import { useId, type CSSProperties, type ReactNode } from 'react';

const TRAIT = 'M64 13C42 5 13 18 10.5 46C8 74 30 92.5 54 90.5C78 88.5 92 69 89.5 46C88 31 79.5 21 70.5 16.5';

interface Props {
  /** 0..1 */
  valeur: number;
  taille?: number;
  /** Lu par les lecteurs d'écran ; absent = décoratif (aria-hidden). */
  libelle?: string;
  /** Contenu au centre (pourcentage, nombre…). */
  children?: ReactNode;
  className?: string;
}

export default function Enso({ valeur, taille = 56, libelle, children, className }: Props) {
  const v = Math.min(1, Math.max(0, Number.isFinite(valeur) ? valeur : 0));
  const pourcent = Math.round(v * 100);
  const idFiltre = `acc-encre-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const avecEncre = taille >= 40;
  const style = { '--valeur': v, '--taille': `${taille}px` } as CSSProperties;
  const a11y = libelle ? { role: 'img', 'aria-label': `${libelle} : ${pourcent} %` } : { 'aria-hidden': true };

  return (
    <span className={['acc-enso', className].filter(Boolean).join(' ')} data-valeur={pourcent} style={style} {...a11y}>
      <svg viewBox="0 0 100 100" width={taille} height={taille} aria-hidden="true" focusable="false">
        {avecEncre && (
          <filter id={idFiltre} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} result="bruit" />
            <feDisplacementMap in="SourceGraphic" in2="bruit" scale={2.2} />
          </filter>
        )}
        <path className="acc-enso__fond" d={TRAIT} pathLength={100} />
        <path className="acc-enso__trait" d={TRAIT} pathLength={100} filter={avecEncre ? `url(#${idFiltre})` : undefined} />
      </svg>
      {children !== undefined && (
        <span className="acc-enso__centre" aria-hidden="true">
          {children}
        </span>
      )}
    </span>
  );
}
