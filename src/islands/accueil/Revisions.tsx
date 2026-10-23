/**
 * Révisions du jour (#revisions-dues) : ensō de l'avancement du jour, cartes à revoir,
 * nouvelles cartes, et ce qui attend demain. L'en-tête de la tuile est statique (index.astro).
 */
import { useMemo } from 'react';
import Enso from './Enso.tsx';
import { resumeRevisions } from './logique.ts';
import { useAujourdhui } from './useAujourdhui.ts';

const cartes = (n: number) => `${n} carte${n > 1 ? 's' : ''}`;

export default function Revisions() {
  const { etat, cartes: connues, jour, maintenant } = useAujourdhui();
  const ids = useMemo(() => connues.map((c) => c.id), [connues]);
  const r = useMemo(() => resumeRevisions(etat, jour, ids, maintenant), [etat, jour, ids, maintenant]);
  const restantes = r.aRevoir + r.nouvelles;
  const fini = restantes === 0 && r.faites > 0;

  const resume =
    restantes > 0
      ? `${cartes(restantes)} aujourd’hui : ${r.aRevoir} à revoir et ${r.nouvelles} nouvelle${r.nouvelles > 1 ? 's' : ''}.`
      : fini
        ? `Révisions du jour terminées : ${cartes(r.faites)} revue${r.faites > 1 ? 's' : ''}.`
        : 'Rien à revoir aujourd’hui.';

  return (
    <div className="revisions" data-fini={fini ? '' : undefined}>
      <div className="revisions__enso">
        <Enso valeur={fini ? 1 : r.part} taille={96} />
        <span className="revisions__centre" aria-hidden="true">
          {fini ? (
            <span className="revisions__fait" lang="ja">
              済
            </span>
          ) : (
            <>
              <span className="revisions__nombre">{restantes}</span>
              <span className="revisions__unite">{restantes > 1 ? 'cartes' : 'carte'}</span>
            </>
          )}
        </span>
      </div>
      <p className="sr-only">{resume}</p>
      <ul className="revisions__liste" role="list" aria-hidden="true">
        {restantes > 0 ? (
          <>
            <li>
              <span className="revisions__pastille revisions__pastille--revoir" />
              <span>
                <strong>{r.aRevoir}</strong> à revoir
              </span>
            </li>
            <li>
              <span className="revisions__pastille revisions__pastille--nouvelles" />
              <span>
                <strong>{r.nouvelles}</strong> nouvelle{r.nouvelles > 1 ? 's' : ''}
              </span>
            </li>
          </>
        ) : (
          <li className="revisions__bravo">{fini ? 'C’est fait pour aujourd’hui.' : 'Rien à revoir aujourd’hui.'}</li>
        )}
      </ul>
      <p className="revisions__demain">Demain : {r.demain > 0 ? cartes(r.demain) : 'aucune carte'}</p>
    </div>
  );
}
