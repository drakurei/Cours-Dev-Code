/**
 * Feuille des raccourcis clavier (touche « ? ») : un <dialog> modal, fermé par Échap,
 * par le bouton ou par un clic sur le voile.
 */
import { useEffect, useId, useState, type KeyboardEvent as ClavierReact, type Ref } from 'react';
import { estMac, libelleTouche, nomTouche, RACCOURCIS, type Raccourci } from '../../lib/recherche/raccourcis.ts';
import { IconePalette } from './icones.tsx';

interface Props {
  ref: Ref<HTMLDialogElement>;
  /** Touche gérée par la feuille elle-même (les autres ne remontent pas jusqu'au lecteur). */
  surTouche: (ev: ClavierReact<HTMLDialogElement>) => void;
  onFermer: () => void;
}

function Touches({ touches, mac }: { touches: string[]; mac: boolean }) {
  return (
    <span className="touches">
      {touches.map((t, i) => (
        <span key={`${t}-${i}`} className="touches__groupe">
          {i > 0 && <span className="touches__plus" aria-hidden="true">+</span>}
          <kbd aria-hidden="true">{libelleTouche(t, mac)}</kbd>
          <span className="sr-only">{nomTouche(t, mac)}</span>
        </span>
      ))}
    </span>
  );
}

function Ligne({ r, mac }: { r: Raccourci; mac: boolean }) {
  return (
    <li className="raccourcis__ligne">
      <span className="raccourcis__action">{r.action}</span>
      <span className="raccourcis__touches">
        <Touches touches={r.touches} mac={mac} />
        {r.ou?.map((autre, i) => (
          <span key={i} className="raccourcis__ou">
            <span className="sr-only"> ou </span>
            <Touches touches={autre} mac={mac} />
          </span>
        ))}
      </span>
    </li>
  );
}

export default function Raccourcis({ ref, surTouche, onFermer }: Props) {
  const base = useId();
  const [mac, setMac] = useState(false);

  // Après hydratation seulement : le serveur ne connaît pas la plateforme.
  useEffect(() => setMac(estMac(navigator.platform, navigator.userAgent)), []);

  return (
    <dialog
      ref={ref}
      className="raccourcis verre"
      aria-labelledby={`${base}-titre`}
      aria-describedby={`${base}-texte`}
      onKeyDown={(ev) => {
        surTouche(ev);
        ev.stopPropagation(); // le lecteur et la révision n'ont pas à réagir derrière la feuille
      }}
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) onFermer(); // clic sur le voile
      }}
      onClose={onFermer}
    >
      <div className="raccourcis__boite" tabIndex={-1} data-contenu-feuille>
        <header className="raccourcis__tete">
          <span className="badge-kanji badge-kanji--md" lang="ja" aria-hidden="true" title="waza — technique">
            技
          </span>
          <div className="raccourcis__titres">
            <h2 className="raccourcis__titre" id={`${base}-titre`}>
              Raccourcis clavier
            </h2>
            <p className="raccourcis__texte" id={`${base}-texte`}>
              Trouver, lire et réviser sans quitter le clavier.
            </p>
          </div>
          <button type="button" className="btn btn--icone raccourcis__fermer" onClick={onFermer} aria-label="Fermer les raccourcis">
            <IconePalette nom="fermer" taille={20} />
          </button>
        </header>

        <div className="raccourcis__groupes">
          {RACCOURCIS.map((g) => (
            <section key={g.titre} className="raccourcis__groupe" aria-labelledby={`${base}-${g.titre}`}>
              <h3 className="raccourcis__groupe-titre" id={`${base}-${g.titre}`}>
                {g.titre}
              </h3>
              <p className="raccourcis__contexte">{g.contexte}</p>
              <ul className="raccourcis__liste" role="list">
                {g.raccourcis.map((r) => (
                  <Ligne key={r.action} r={r} mac={mac} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </dialog>
  );
}
