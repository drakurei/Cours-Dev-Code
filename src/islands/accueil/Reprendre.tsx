/**
 * Reprendre (#reprendre) : les 3 derniers cours ouverts et pas encore terminés,
 * avec leur ensō et « k / n notions ». L'en-tête de la tuile est statique (index.astro).
 */
import { useMemo } from 'react';
import IconeSvg from '../IconeSvg.tsx';
import Enso from './Enso.tsx';
import { Episode } from './Visuels.tsx';
import { aReprendre, pourcent, texteNotions } from './logique.ts';
import { useAujourdhui } from './useAujourdhui.ts';

export default function Reprendre() {
  const { etat, episodes } = useAujourdhui();
  const liste = useMemo(() => aReprendre(etat, episodes, 3), [etat, episodes]);

  if (liste.length === 0) {
    return (
      <div className="reprendre reprendre--vide">
        <p className="reprendre__vide-titre">Rien à reprendre pour l’instant.</p>
        <p className="reprendre__vide-texte">Les cours que tu ouvres s’affichent ici, avec ta progression.</p>
      </div>
    );
  }

  return (
    <ul className="reprendre" role="list">
      {liste.map(({ episode: ep, avancement: a }) => (
        <li key={ep.id} className="reprendre__item" data-couleur={ep.couleur}>
          <a className="ligne-cours" href={ep.url}>
            <Enso valeur={a.part} taille={44} className="ligne-cours__enso" />
            <span className="ligne-cours__texte">
              <span className="ligne-cours__titre">{ep.titre}</span>
              <span className="ligne-cours__meta">
                <Episode matiere={ep.matiere} chapitre={ep.chapitre} /> · {texteNotions(a)}
              </span>
            </span>
            <span className="ligne-cours__pourcent">{pourcent(a.part)}</span>
            <IconeSvg nom="chevron-droite" taille={16} className="ligne-cours__chevron" />
          </a>
        </li>
      ))}
    </ul>
  );
}
