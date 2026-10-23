/**
 * Petits composants partagés par les îlots d'apprentissage : ensō, source d'une carte,
 * segments de progression, gain de pétales, état vide, lignes de vitesse.
 */
import { useId, type CSSProperties, type ReactNode } from 'react';
import type { SourceCours } from '../../lib/apprentissage/donnees.ts';

/** Même tracé que src/components/Enso.astro (cercle au pinceau ouvert en haut à droite). */
const TRAIT = 'M64 13C42 5 13 18 10.5 46C8 74 30 92.5 54 90.5C78 88.5 92 69 89.5 46C88 31 79.5 21 70.5 16.5';

export function Enso({ valeur, taille = 96, children }: { valeur: number; taille?: number; children?: ReactNode }) {
  const v = Math.min(1, Math.max(0, valeur));
  const filtre = `ap-encre-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <span
      className="ap-enso"
      data-plein={v >= 1 ? 'true' : undefined}
      data-vide={v <= 0 ? 'true' : undefined}
      style={{ '--valeur': v, '--taille': `${taille}px` } as CSSProperties}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width={taille} height={taille} focusable="false">
        <filter id={filtre} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} result="bruit" />
          <feDisplacementMap in="SourceGraphic" in2="bruit" scale={2.2} />
        </filter>
        <path className="ap-enso__fond" d={TRAIT} pathLength={100} />
        <path className="ap-enso__trait" d={TRAIT} pathLength={100} filter={`url(#${filtre})`} />
      </svg>
      {children !== undefined && <span className="ap-enso__centre">{children}</span>}
    </span>
  );
}

/** Lignes de vitesse 集中線 derrière une célébration (score parfait, session finie). */
export function LignesVitesse() {
  const rayons = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <svg className="ap-lignes" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      {rayons.map((a, i) => (
        <line key={a} x1="100" y1={i % 2 ? 14 : 4} x2="100" y2={i % 3 ? 40 : 48} transform={`rotate(${a} 100 100)`} />
      ))}
    </svg>
  );
}

/** « 応 React · 第6話 » : d'où vient la carte (le numéro d'épisode est lu en français). */
export function Source({ source }: { source: Pick<SourceCours, 'kanji' | 'couleur' | 'matiereNom' | 'chapitre'> }) {
  return (
    <span className="ap-source">
      <span className="badge-kanji badge-kanji--sm" data-couleur={source.couleur} lang="ja" aria-hidden="true">
        {source.kanji}
      </span>
      <span>
        {source.matiereNom}
        {' · '}
        <span lang="ja" aria-hidden="true">
          第{source.chapitre}話
        </span>
        <span className="sr-only">chapitre {source.chapitre}</span>
      </span>
    </span>
  );
}

/** Segments de progression (décoratifs : le texte « 3 / 12 » porte l'information). */
export function Segments({ total, faits, courant = true }: { total: number; faits: number; courant?: boolean }) {
  if (total <= 0) return null;
  if (total > 30) {
    return (
      <span className="ap-barre" aria-hidden="true">
        <span style={{ width: `${Math.min(100, (faits / total) * 100)}%` }} />
      </span>
    );
  }
  return (
    <span className="ap-segments" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} data-etat={i < faits ? 'fait' : i === faits && courant ? 'courant' : undefined} />
      ))}
    </span>
  );
}

/** « +2 花びら » : pétales gagnés (lu « plus 2 pétales »). */
export function Gain({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="ap-gain">
      +{n}
      <span lang="ja" aria-hidden="true">
        花
      </span>
      <span className="sr-only"> {n > 1 ? 'pétales' : 'pétale'}</span>
    </span>
  );
}

/** État vide : un kanji, une phrase, une action (même esprit que src/components/EtatVide.astro). */
export function EtatVide({ kanji, titre, texte, children }: { kanji: string; titre: string; texte?: string; children?: ReactNode }) {
  return (
    <div className="ap-vide">
      <span className="ap-vide__kanji" lang="ja" aria-hidden="true">
        {kanji}
      </span>
      <p className="ap-vide__titre">{titre}</p>
      {texte && <p className="ap-vide__texte">{texte}</p>}
      {children && <div className="ap-vide__actions">{children}</div>}
    </div>
  );
}

/** Flèche « retourner » (absente des icônes partagées). */
export function IconeRetourner({ taille = 18 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M15.5 8A6 6 0 1 0 16 11.5" />
      <path d="M15.8 4v4h-4" />
    </svg>
  );
}
