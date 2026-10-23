/**
 * Contrôle segmenté façon iOS = onglets ARIA (role tablist/tab/tabpanel).
 * Clavier : ← → (et Début / Fin) changent d'onglet ; activation immédiate.
 */
import { useRef, type KeyboardEvent, type ReactNode } from 'react';

export interface OptionSegment<T extends string> {
  valeur: T;
  libelle: ReactNode;
  /** Petit compteur à droite du libellé (ex. nombre de fichiers). */
  badge?: number | undefined;
}

interface Props<T extends string> {
  idBase: string;
  label: string;
  valeur: T;
  options: OptionSegment<T>[];
  onChange: (v: T) => void;
  className?: string;
}

export const idOnglet = (idBase: string, v: string) => `${idBase}-onglet-${v}`;
export const idPanneau = (idBase: string, v: string) => `${idBase}-panneau-${v}`;

export default function Segments<T extends string>({ idBase, label, valeur, options, onChange, className }: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const surTouche = (ev: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = options.length;
    const cible = ev.key === 'ArrowRight' ? (i + 1) % n : ev.key === 'ArrowLeft' ? (i - 1 + n) % n : ev.key === 'Home' ? 0 : ev.key === 'End' ? n - 1 : -1;
    if (cible === -1) return;
    ev.preventDefault();
    const o = options[cible];
    if (!o) return;
    onChange(o.valeur);
    refs.current[cible]?.focus();
  };

  return (
    <div className={['at-segments', className].filter(Boolean).join(' ')} role="tablist" aria-label={label}>
      {options.map((o, i) => {
        const choisi = o.valeur === valeur;
        return (
          <button
            key={o.valeur}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={idOnglet(idBase, o.valeur)}
            aria-selected={choisi}
            aria-controls={idPanneau(idBase, o.valeur)}
            tabIndex={choisi ? 0 : -1}
            onClick={() => onChange(o.valeur)}
            onKeyDown={(ev) => surTouche(ev, i)}
          >
            {o.libelle}
            {o.badge ? (
              <span className="at-segments__badge">
                <span className="sr-only"> (</span>
                {o.badge}
                <span className="sr-only">)</span>
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
