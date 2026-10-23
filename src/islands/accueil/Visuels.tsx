/**
 * Petits éléments partagés par les îlots de l'accueil : épisode (第N話), pile de cartes,
 * hanko 済. Tous décoratifs sauf mention contraire.
 */
import { useId, type ReactNode } from 'react';

/** « React · 第6話 » : le kanji est caché aux lecteurs d'écran, qui lisent « chapitre 6 ». */
export function Episode({ matiere, chapitre }: { matiere: string; chapitre: number }) {
  return (
    <>
      {matiere ? `${matiere} · ` : ''}
      <span lang="ja" aria-hidden="true">
        第{chapitre}話
      </span>
      <span className="sr-only">chapitre {chapitre}</span>
    </>
  );
}

/** Badge kanji d'un tome (classes globales .badge-kanji). */
export function BadgeTome({ kanji, couleur, taille = 'xs' }: { kanji?: string | undefined; couleur?: string | undefined; taille?: 'xs' | 'sm' }) {
  if (!kanji) return null;
  return (
    <span className={`badge-kanji badge-kanji--${taille}`} data-couleur={couleur} lang="ja" aria-hidden="true">
      {kanji}
    </span>
  );
}

/** Trois cartes empilées, légèrement tournées ; `children` = la face de la carte du dessus. */
export function PileCartes({ children, couleur }: { children: ReactNode; couleur?: string | undefined }) {
  return (
    <div className="mission-pile" data-couleur={couleur} aria-hidden="true">
      <span className="mission-pile__carte mission-pile__carte--3" />
      <span className="mission-pile__carte mission-pile__carte--2" />
      <span className="mission-pile__carte mission-pile__carte--1">{children}</span>
      <svg className="mission-pile__petale" width="16" height="16" viewBox="0 0 20 20" focusable="false">
        <path d="M10 18.5C5.6 15.3 3.6 9.9 5.6 5C6.6 2.6 8.3 2 9.3 3.8L10 5.2L10.7 3.8C11.7 2 13.4 2.6 14.4 5C16.4 9.9 14.4 15.3 10 18.5Z" />
      </svg>
    </div>
  );
}

/** Hanko 済 (même dessin que src/components/Hanko.astro), avec lignes de vitesse 集中線. */
export function HankoTermine({ taille = 112 }: { taille?: number }) {
  const id = `acc-hanko-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const rayons = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <span className="acc-hanko" style={{ width: taille, height: taille }} aria-hidden="true">
      <svg className="acc-hanko__lignes" viewBox="0 0 200 200" focusable="false">
        {rayons.map((a, i) => (
          <line key={a} x1="100" y1={i % 2 ? 18 : 6} x2="100" y2={i % 3 ? 44 : 52} transform={`rotate(${a} 100 100)`} />
        ))}
      </svg>
      <svg className="acc-hanko__tampon" viewBox="0 0 64 64" width={taille} height={taille} focusable="false">
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={2} seed={11} result="bruit" />
          <feColorMatrix in="bruit" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.4 0 0 0 2.1" result="trous" />
          <feComposite in="SourceGraphic" in2="trous" operator="in" result="encre" />
          <feDisplacementMap in="encre" in2="bruit" scale={1.4} />
        </filter>
        <g filter={`url(#${id})`}>
          <rect x="5" y="5" width="54" height="54" rx="11" />
          <text x="32" y="33" textAnchor="middle" dominantBaseline="central">
            済
          </text>
        </g>
      </svg>
    </span>
  );
}
