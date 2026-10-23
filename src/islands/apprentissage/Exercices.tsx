/**
 * Exercices d'un cours : énoncé, indices dévoilés UN PAR UN, puis la solution ;
 * « Je l'ai fait » (+5 pétales la première fois) est mémorisé dans store.exercices.
 * Le HTML vient du build, déjà assaini (rehype-sanitize).
 */
import { useEffect, useRef, useState } from 'react';
import { BAREME, gagnerPetales, lire, modifier } from '../../lib/store.ts';
import { NIVEAUX_EXERCICE_LIBELLES } from '../../lib/libelles.ts';
import type { ExerciceRendu } from '../../lib/donnees-cours.ts';
import { useManabi } from '../useManabi.ts';
import IconeSvg from '../IconeSvg.tsx';
import { Gain } from './communs.tsx';
import './apprentissage.css';

type ExerciceJeu = Pick<ExerciceRendu, 'index' | 'cle' | 'titreHtml' | 'niveau' | 'enonceHtml' | 'indicesHtml' | 'solutionHtml'>;

interface Props {
  exercices: ExerciceJeu[];
}

export default function Exercices({ exercices }: Props) {
  return (
    <ol className="ap-exercices" role="list">
      {exercices.map((e) => (
        <li key={e.cle}>
          <Exercice exercice={e} />
        </li>
      ))}
    </ol>
  );
}

function Exercice({ exercice: e }: { exercice: ExerciceJeu }) {
  const fait = useManabi((s) => s.exercices[e.cle]?.fait === true);
  const [indices, setIndices] = useState(0);
  const [solution, setSolution] = useState(false);
  const [gain, setGain] = useState(0);
  const [annonce, setAnnonce] = useState('');
  const refSolution = useRef<HTMLDivElement>(null);
  const focusSolution = useRef(false);
  const total = e.indicesHtml.length;
  const idTitre = `exercice-${e.cle.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  useEffect(() => {
    if (!solution || !focusSolution.current) return;
    focusSolution.current = false;
    refSolution.current?.focus({ preventScroll: true });
  }, [solution]);

  const texte = (html: string) => {
    const d = document.createElement('template');
    d.innerHTML = html; // HTML du build, assaini ; un <template> n'exécute ni ne charge rien
    return d.content.textContent?.trim() ?? '';
  };

  const aide = () => {
    if (indices < total) {
      setAnnonce(`Indice ${indices + 1} : ${texte(e.indicesHtml[indices] ?? '')}`);
      setIndices(indices + 1);
    } else if (e.solutionHtml) {
      focusSolution.current = true;
      setSolution(true);
    }
  };

  const basculer = () => {
    const deja = lire().exercices[e.cle];
    const maintenant = new Date().toISOString();
    modifier((s) => {
      s.exercices[e.cle] = { fait: !fait, le: maintenant };
    });
    if (!fait && !deja) {
      gagnerPetales(BAREME.exerciceFait, 'exercice fait');
      setGain(BAREME.exerciceFait);
      setAnnonce(`Exercice fait. Plus ${BAREME.exerciceFait} pétales.`);
    } else {
      setGain(0);
      setAnnonce(fait ? 'Exercice remis à faire.' : 'Exercice fait.');
    }
  };

  const libelleAide = indices < total ? `Voir l’indice ${indices + 1}/${total}` : e.solutionHtml && !solution ? 'Voir la solution' : null;

  return (
    <article className="ap-exercice carte" data-fait={fait ? 'true' : undefined} aria-labelledby={idTitre}>
      <header className="ap-exercice__tete">
        <span className="ap-exercice__num">Exercice {e.index + 1}</span>
        <span className="puce" data-niveau={e.niveau}>
          {NIVEAUX_EXERCICE_LIBELLES[e.niveau]}
        </span>
        {fait && (
          <span className="puce puce--accent ap-exercice__fait">
            <IconeSvg nom="coche" taille={14} />
            Fait
          </span>
        )}
      </header>
      <h3 className="ap-exercice__titre" id={idTitre} dangerouslySetInnerHTML={{ __html: e.titreHtml }} />
      <div className="ap-exercice__enonce" dangerouslySetInnerHTML={{ __html: e.enonceHtml }} />

      {(indices > 0 || solution) && (
        <div className="ap-exercice__aides">
          {e.indicesHtml.slice(0, indices).map((html, i) => (
            <div key={i} className="ap-aide">
              <p className="ap-aide__titre">Indice {i + 1}</p>
              <div className="ap-aide__corps" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          ))}
          {solution && (
            <div className="ap-aide ap-aide--solution" ref={refSolution} tabIndex={-1}>
              <p className="ap-aide__titre">Solution</p>
              <div className="ap-aide__corps" dangerouslySetInnerHTML={{ __html: e.solutionHtml }} />
            </div>
          )}
        </div>
      )}

      <div className="ap-exercice__actions">
        {libelleAide && (
          <button type="button" className="btn ap-btn-contour" onClick={aide}>
            {libelleAide}
          </button>
        )}
        <span className="ap-exercice__fin">
          <Gain n={gain} />
          <button type="button" className="btn btn--secondaire ap-exercice__bouton" aria-pressed={fait} onClick={basculer}>
            <span className="ap-exercice__case" aria-hidden="true">
              {fait && <IconeSvg nom="coche" taille={14} />}
            </span>
            Je l’ai fait
          </button>
        </span>
      </div>
      <p className="sr-only" role="status">
        {annonce}
      </p>
    </article>
  );
}
