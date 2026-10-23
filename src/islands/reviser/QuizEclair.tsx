/**
 * Quiz éclair : 10 questions tirées au hasard (tous les tomes ou un seul), avec le même
 * composant que le quiz du lecteur. Tirage reproductible : une graine = un tirage.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { QuestionJson } from '../../lib/apprentissage/donnees.ts';
import { tirer } from '../../lib/apprentissage/tirage.ts';
import IconeSvg from '../IconeSvg.tsx';
import Quiz, { type QuestionJeu } from '../apprentissage/Quiz.tsx';
import { EtatVide } from '../apprentissage/communs.tsx';
import { chargerQuiz, type TomeResume } from './charger.ts';

const NOMBRE = 10;
const TOUS = 'tous';

const nouvelleGraine = () => (Date.now() ^ Math.floor(Math.random() * 0x1_0000_0000)) >>> 0;

interface Props {
  tomes: TomeResume[];
  actif: boolean;
}

export default function QuizEclair({ tomes, actif }: Props) {
  const [questions, setQuestions] = useState<QuestionJson[] | null>(null);
  const [erreur, setErreur] = useState(false);
  const [portee, setPortee] = useState(TOUS);
  const [graine, setGraine] = useState<number | null>(null);
  const refLancer = useRef<HTMLButtonElement>(null);
  const refQuiz = useRef<HTMLDivElement>(null);
  const aFocaliser = useRef<'quiz' | 'reglage' | null>(null);

  const charger = () => {
    setErreur(false);
    chargerQuiz()
      .then(setQuestions)
      .catch(() => setErreur(true));
  };

  // Chargé seulement quand l'onglet s'ouvre.
  useEffect(() => {
    if (actif && !questions && !erreur) charger();
  }, [actif]);

  useEffect(() => {
    const c = aFocaliser.current;
    if (!c) return;
    aFocaliser.current = null;
    if (c === 'reglage') refLancer.current?.focus();
    else refQuiz.current?.querySelector<HTMLElement>('.ap-quiz__question')?.focus({ preventScroll: true });
  });

  const parTome = useMemo(() => {
    const m = new Map<string, number>();
    for (const q of questions ?? []) m.set(q.matiere, (m.get(q.matiere) ?? 0) + 1);
    return m;
  }, [questions]);

  const tirage: QuestionJeu[] = useMemo(() => {
    if (graine === null || !questions) return [];
    const pool = portee === TOUS ? questions : questions.filter((q) => q.matiere === portee);
    return tirer(pool, NOMBRE, graine).map((q) => ({ ...q, source: q }));
  }, [graine, questions, portee]);

  const lancer = () => {
    setGraine(nouvelleGraine());
    aFocaliser.current = 'quiz';
  };

  if (erreur) {
    return (
      <EtatVide kanji="問" titre="Impossible de charger les questions." texte="Vérifie ta connexion, puis réessaie.">
        <button type="button" className="btn btn--secondaire" onClick={charger}>
          Réessayer
        </button>
      </EtatVide>
    );
  }

  if (!questions) {
    return (
      <div className="rv-squelette" aria-busy="true">
        <span className="sr-only" role="status">
          Chargement des questions…
        </span>
        <div className="rv-squelette__carte rv-squelette__carte--quiz" />
      </div>
    );
  }

  if (questions.length === 0) {
    return <EtatVide kanji="問" titre="Pas encore de quiz." texte="Les questions apparaîtront ici dès qu’un cours en aura." />;
  }

  const nomPortee = portee === TOUS ? 'Tous les tomes' : (tomes.find((t) => t.slug === portee)?.nom ?? portee);

  if (graine !== null && tirage.length > 0) {
    return (
      <div className="rv-eclair-jeu" ref={refQuiz}>
        <div className="rv-eclair-jeu__barre">
          <button
            type="button"
            className="btn btn--discret rv-retour"
            onClick={() => {
              setGraine(null);
              aFocaliser.current = 'reglage';
            }}
          >
            <IconeSvg nom="chevron-gauche" taille={18} />
            Changer de tome
          </button>
          <span className="rv-eclair-jeu__portee">{nomPortee}</span>
        </div>
        <Quiz key={graine} questions={tirage} portee="globale" actif={actif} onNouveauTirage={lancer} />
      </div>
    );
  }

  const disponibles = tomes.filter((t) => (parTome.get(t.slug) ?? 0) > 0);
  const nb = portee === TOUS ? questions.length : (parTome.get(portee) ?? 0);

  return (
    <div className="rv-eclair carte">
      <span className="badge-kanji badge-kanji--lg" lang="ja" aria-hidden="true">
        問
      </span>
      <div className="rv-eclair__texte">
        <p className="rv-eclair__titre">{Math.min(NOMBRE, nb)} questions au hasard</p>
        <p className="rv-eclair__sous-titre">Une à la fois, corrigées tout de suite.</p>
      </div>
      <fieldset className="rv-portee">
        <legend className="rv-portee__legende">Tomes</legend>
        <div className="rv-portee__liste">
          <label className="rv-puce">
            <input type="radio" name="rv-portee" value={TOUS} checked={portee === TOUS} onChange={() => setPortee(TOUS)} />
            <span>Tous</span>
            <span className="rv-puce__nb">
              {questions.length}
              <span className="sr-only"> questions</span>
            </span>
          </label>
          {disponibles.map((t) => (
            <label className="rv-puce" key={t.slug}>
              <input type="radio" name="rv-portee" value={t.slug} checked={portee === t.slug} onChange={() => setPortee(t.slug)} />
              <span className="badge-kanji badge-kanji--sm" data-couleur={t.couleur} lang="ja" aria-hidden="true">
                {t.kanji}
              </span>
              <span>{t.nom}</span>
              <span className="rv-puce__nb">
                {parTome.get(t.slug)}
                <span className="sr-only"> questions</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button ref={refLancer} type="button" className="btn btn--primaire btn--grand" onClick={lancer}>
        Lancer le quiz
      </button>
    </div>
  );
}
