/**
 * Quiz : UNE question à la fois, correction immédiate (bonne réponse surlignée + explication),
 * +2 pétales par bonne réponse (une fois par question et par tentative), score final avec ensō,
 * « Refaire les erreurs », « Recommencer ». Résultat dans store.quiz (si coursId).
 *
 * Clavier : 1-6 choisit une réponse (le focus va dessus), Entrée valide puis passe à la suite.
 * Sert au lecteur (portée locale) et au quiz éclair de /reviser/ (portée globale).
 * Le HTML des questions vient du build, déjà assaini (rehype-sanitize).
 */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { BAREME, gagnerPetales, modifier, type ResultatQuiz } from '../../lib/store.ts';
import { erreurs, lettre, mention, resultatQuiz, score, TEXTES_MENTION } from '../../lib/apprentissage/quiz.ts';
import type { SourceCours } from '../../lib/apprentissage/donnees.ts';
import { useManabi } from '../useManabi.ts';
import IconeSvg from '../IconeSvg.tsx';
import { chiffre, ramenerEnVue, surUnControle, useRaccourcis, type Portee } from './clavier.ts';
import { Enso, Gain, LignesVitesse, Segments, Source } from './communs.tsx';
import './apprentissage.css';

export interface QuestionJeu {
  index: number;
  questionHtml: string;
  choix: { texte: string; html: string }[];
  reponseIndex: number;
  explicationHtml: string;
  /** Quiz éclair : d'où vient la question. */
  source?: SourceCours | undefined;
}

interface Props {
  questions: QuestionJeu[];
  /** Cours du quiz : son résultat va dans store.quiz. Absent pour le quiz éclair. */
  coursId?: string | undefined;
  portee?: Portee;
  actif?: boolean;
  /** Proposé après un sans-faute (ex. passer aux flashcards du cours). */
  suite?: { href: string; libelle: string } | undefined;
  /** Quiz éclair : tirer 10 nouvelles questions. */
  onNouveauTirage?: (() => void) | undefined;
}

type Tour = { ordre: number[]; type: 'complet' | 'erreurs' };
type Cible = 'question' | 'suivant' | 'fin' | null;

const egalResultat = (a: ResultatQuiz | undefined, b: ResultatQuiz | undefined) =>
  a === b || (!!a && !!b && a.meilleur === b.meilleur && a.total === b.total && a.tentatives === b.tentatives);

export default function Quiz({ questions, coursId, portee = 'locale', actif = true, suite, onNouveauTirage }: Props) {
  const tous = () => questions.map((_, i) => i);
  const [tour, setTour] = useState<Tour>(() => ({ ordre: tous(), type: 'complet' }));
  const [pos, setPos] = useState(0);
  const [choisi, setChoisi] = useState<number | null>(null);
  const [reponses, setReponses] = useState<Map<number, boolean>>(() => new Map());
  const [recompensees, setRecompensees] = useState<Set<number>>(() => new Set());
  const [petales, setPetales] = useState(0);
  const [gain, setGain] = useState(0);
  const [fini, setFini] = useState(false);
  const [annonce, setAnnonce] = useState('');
  const resultat = useManabi((e) => (coursId ? e.quiz[coursId] : undefined), egalResultat);

  const racine = useRef<HTMLDivElement>(null);
  const refQuestion = useRef<HTMLDivElement>(null);
  const refSuivant = useRef<HTMLButtonElement>(null);
  const refFin = useRef<HTMLParagraphElement>(null);
  const refsChoix = useRef<(HTMLButtonElement | null)[]>([]);
  const cible = useRef<Cible>(null);
  const idQuestion = `${useId()}-question`;

  // Déplace le focus après un changement d'écran (jamais au premier affichage).
  useEffect(() => {
    const c = cible.current;
    if (!c) return;
    cible.current = null;
    const el = c === 'question' ? refQuestion.current : c === 'suivant' ? refSuivant.current : refFin.current;
    el?.focus({ preventScroll: true });
    if (c !== 'suivant') ramenerEnVue(racine.current);
  });

  const qi = tour.ordre[pos] ?? 0;
  const q = questions[qi];
  const dernier = pos + 1 >= tour.ordre.length;

  const repondre = (i: number) => {
    if (!q || fini || choisi !== null) return;
    const juste = i === q.reponseIndex;
    setChoisi(i);
    setReponses((m) => new Map(m).set(qi, juste));
    let n = 0;
    if (juste && !recompensees.has(qi)) {
      n = BAREME.bonneReponse;
      setRecompensees((s) => new Set(s).add(qi));
      setPetales((p) => p + n);
      gagnerPetales(n, 'bonne réponse au quiz');
    }
    setGain(n);
    const texteBonne = refsChoix.current[q.reponseIndex]?.querySelector('.ap-choix__texte')?.textContent?.trim() ?? '';
    setAnnonce(
      juste
        ? `Bonne réponse.${n ? ` Plus ${n} pétales.` : ''}`
        : `Pas tout à fait. La bonne réponse est ${lettre(q.reponseIndex)} : ${texteBonne}.`,
    );
    cible.current = 'suivant';
  };

  const suivant = () => {
    if (choisi === null) return;
    setAnnonce('');
    setGain(0);
    if (!dernier) {
      setPos((p) => p + 1);
      setChoisi(null);
      cible.current = 'question';
      return;
    }
    setFini(true);
    if (tour.type === 'complet' && coursId) {
      const s = score(reponses, tour.ordre.length);
      modifier((e) => {
        e.quiz[coursId] = resultatQuiz(e.quiz[coursId], s);
      });
    }
    cible.current = 'fin';
  };

  const relancer = (t: Tour, nouvelleTentative: boolean) => {
    setTour(t);
    setPos(0);
    setChoisi(null);
    setReponses(new Map());
    setFini(false);
    setGain(0);
    setAnnonce('');
    if (nouvelleTentative) {
      setRecompensees(new Set());
      setPetales(0);
    }
    cible.current = 'question';
  };

  useRaccourcis(actif && !fini, racine, portee, (ev) => {
    const n = chiffre(ev);
    if (n !== null && choisi === null) {
      const bouton = refsChoix.current[n - 1];
      if (!bouton) return false;
      bouton.focus();
      return true;
    }
    if (ev.key === 'Enter' && choisi !== null && !surUnControle(ev.target)) {
      suivant();
      return true;
    }
    return false;
  });

  if (!q) return null;

  if (fini) {
    const s = score(reponses, tour.ordre.length);
    const restantes = erreurs(reponses);
    const m = mention(s);
    const titre =
      tour.type === 'erreurs' ? (restantes.length === 0 ? 'Erreurs corrigées.' : 'Presque.') : TEXTES_MENTION[m];
    const detail =
      tour.type === 'erreurs'
        ? `${s.bonnes} sur ${s.total} ${s.total > 1 ? 'corrigées' : 'corrigée'}`
        : `${s.bonnes} ${s.bonnes > 1 ? 'bonnes réponses' : 'bonne réponse'} sur ${s.total}`;
    const meilleur = resultat && resultat.total === s.total && tour.type === 'complet' ? resultat.meilleur : null;

    let principal: ReactNode = null;
    let secondaire: ReactNode = null;
    if (restantes.length > 0) {
      principal = (
        <button type="button" className="btn btn--primaire" onClick={() => relancer({ ordre: restantes, type: 'erreurs' }, false)}>
          Refaire les erreurs
        </button>
      );
    } else if (suite) {
      principal = (
        <a className="btn btn--primaire" href={suite.href}>
          {suite.libelle}
        </a>
      );
    } else if (onNouveauTirage) {
      principal = (
        <button type="button" className="btn btn--primaire" onClick={onNouveauTirage}>
          Nouveau tirage
        </button>
      );
    }
    if (onNouveauTirage && restantes.length > 0) {
      secondaire = (
        <button type="button" className="btn btn--secondaire" onClick={onNouveauTirage}>
          Nouveau tirage
        </button>
      );
    } else if (!onNouveauTirage || suite) {
      secondaire = (
        <button type="button" className="btn btn--secondaire" onClick={() => relancer({ ordre: tous(), type: 'complet' }, true)}>
          Recommencer
        </button>
      );
    }

    return (
      <div className="ap-quiz carte" ref={racine}>
        <div className="ap-fin" data-mention={m}>
          <div className="ap-fin__visuel">
            {m === 'parfait' && <LignesVitesse />}
            <Enso valeur={s.ratio} taille={120}>
              <span className="ap-fin__score">
                {s.bonnes}
                <span>/{s.total}</span>
              </span>
            </Enso>
          </div>
          <p className="ap-fin__titre" ref={refFin} tabIndex={-1}>
            {titre}
          </p>
          <p className="ap-fin__texte">
            {detail}
            {petales > 0 && (
              <>
                {' · '}
                <Gain n={petales} />
              </>
            )}
            {meilleur !== null && meilleur > s.bonnes && <> · meilleur score {meilleur}/{s.total}</>}
          </p>
          <div className="ap-fin__actions">
            {principal}
            {secondaire}
          </div>
        </div>
      </div>
    );
  }

  const juste = choisi !== null && choisi === q.reponseIndex;

  return (
    <div className="ap-quiz carte" ref={racine} data-corrige={choisi !== null ? 'true' : undefined}>
      <div className="ap-quiz__tete">
        <p className="ap-quiz__compteur">
          {tour.type === 'erreurs' ? 'À refaire' : 'Question'} {pos + 1}
          <span className="ap-faible"> sur {tour.ordre.length}</span>
        </p>
        <Segments total={tour.ordre.length} faits={pos + (choisi !== null ? 1 : 0)} courant={choisi === null} />
      </div>

      {q.source && <Source source={q.source} />}

      <div className="ap-quiz__question" id={idQuestion} ref={refQuestion} tabIndex={-1} dangerouslySetInnerHTML={{ __html: q.questionHtml }} />

      <ol className="ap-quiz__choix" role="list" aria-labelledby={idQuestion}>
        {q.choix.map((c, i) => {
          const etat = choisi === null ? undefined : i === q.reponseIndex ? 'bonne' : i === choisi ? 'fausse' : 'attenuee';
          return (
            <li key={`${qi}-${i}`}>
              <button
                type="button"
                className="ap-choix"
                data-etat={etat}
                aria-disabled={choisi !== null || undefined}
                ref={(el) => {
                  refsChoix.current[i] = el;
                }}
                onClick={() => repondre(i)}
              >
                <span className="ap-choix__lettre" aria-hidden="true">
                  {etat === 'bonne' ? <IconeSvg nom="coche" taille={16} /> : etat === 'fausse' ? <IconeSvg nom="fermer" taille={14} /> : lettre(i)}
                </span>
                <span className="sr-only">{lettre(i)} : </span>
                <span className="ap-choix__texte" dangerouslySetInnerHTML={{ __html: c.html }} />
                {etat === 'bonne' && <span className="sr-only"> (bonne réponse)</span>}
                {etat === 'fausse' && <span className="sr-only"> (ta réponse)</span>}
              </button>
            </li>
          );
        })}
      </ol>

      {choisi === null ? (
        <p className="ap-quiz__aide ap-souris" aria-hidden="true">
          <kbd>1</kbd>–<kbd>{Math.min(9, q.choix.length)}</kbd> pour choisir, <kbd>Entrée</kbd> pour valider
        </p>
      ) : (
        <div className="ap-retour" data-juste={juste ? 'true' : 'false'}>
          <p className="ap-retour__titre">
            <span className="ap-retour__icone" aria-hidden="true">
              <IconeSvg nom={juste ? 'coche' : 'fleche-droite'} taille={16} />
            </span>
            <span>{juste ? 'Bonne réponse' : `Pas tout à fait : c’est la ${lettre(q.reponseIndex)}`}</span>
            <Gain n={gain} />
          </p>
          {q.explicationHtml && <div className="ap-retour__texte" dangerouslySetInnerHTML={{ __html: q.explicationHtml }} />}
          <div className="ap-retour__actions">
            <button ref={refSuivant} type="button" className="btn btn--primaire" onClick={suivant}>
              {dernier ? 'Voir mon score' : 'Question suivante'}
              <IconeSvg nom="fleche-droite" taille={18} />
            </button>
          </div>
        </div>
      )}

      <p className="sr-only" role="status">
        {annonce}
      </p>
    </div>
  );
}
