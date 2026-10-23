/**
 * Page /reviser/ (îlot client:only) : trois onglets — Cartes (session FSRS du jour),
 * Quiz éclair (10 questions au hasard), Par tome. Une seule carte ou question à l'écran.
 * L'onglet ouvert suit l'ancre de l'URL (#cartes, #eclair, #tome).
 */
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { CarteJson } from '../../lib/apprentissage/donnees.ts';
import { composerSession } from '../../lib/apprentissage/session.ts';
import { cartesDuJour } from '../../lib/srs.ts';
import { lire } from '../../lib/store.ts';
import { url } from '../../lib/url.ts';
import { useManabi } from '../useManabi.ts';
import { EtatVide } from '../apprentissage/communs.tsx';
import SessionCartes from './SessionCartes.tsx';
import QuizEclair from './QuizEclair.tsx';
import ParTome from './ParTome.tsx';
import { chargerCartes, type CoursResume, type TomeResume } from './charger.ts';
import '../apprentissage/apprentissage.css';
import './reviser.css';

const ONGLETS = [
  { id: 'cartes', libelle: 'Cartes', kanji: '札' },
  { id: 'eclair', libelle: 'Quiz éclair', kanji: '問' },
  { id: 'tome', libelle: 'Par tome', kanji: '巻' },
] as const;

type Onglet = (typeof ONGLETS)[number]['id'];
const estOnglet = (v: string): v is Onglet => ONGLETS.some((o) => o.id === v);

interface Props {
  tomes: TomeResume[];
  /** Cours publiés dans l'ordre de lecture (pour proposer le prochain à lire). */
  cours: CoursResume[];
}

export default function Reviser({ tomes, cours }: Props) {
  const [onglet, setOnglet] = useState<Onglet>(() => {
    const h = typeof location !== 'undefined' ? location.hash.slice(1) : '';
    return estOnglet(h) ? h : 'cartes';
  });
  const [cartes, setCartes] = useState<CarteJson[] | null>(null);
  const [erreur, setErreur] = useState(false);
  const refsOnglets = useRef<(HTMLButtonElement | null)[]>([]);

  const charger = () => {
    setErreur(false);
    chargerCartes()
      .then(setCartes)
      .catch(() => setErreur(true));
  };
  useEffect(charger, []);

  // Une ancre changée à la main (lien « Quiz éclair » de l'accueil, par exemple).
  useEffect(() => {
    const surAncre = () => {
      const h = location.hash.slice(1);
      if (estOnglet(h)) setOnglet(h);
    };
    window.addEventListener('hashchange', surAncre);
    return () => window.removeEventListener('hashchange', surAncre);
  }, []);

  const parId = useMemo(() => new Map((cartes ?? []).map((c) => [c.id, c])), [cartes]);
  const aReviser = useManabi((e) => {
    if (!cartes) return 0;
    const r = cartesDuJour(e, cartes);
    return Math.min(e.prefs.tailleSession, r.dues.length + r.nouvelles.length);
  });

  const choisir = (o: Onglet, focus = false) => {
    setOnglet(o);
    try {
      history.replaceState(history.state, '', `#${o}`);
    } catch {
      /* rien : l'ancre est un confort */
    }
    if (focus) refsOnglets.current[ONGLETS.findIndex((x) => x.id === o)]?.focus();
  };

  const surTouche = (ev: KeyboardEvent<HTMLDivElement>) => {
    const i = ONGLETS.findIndex((o) => o.id === onglet);
    const cible =
      ev.key === 'ArrowRight' ? (i + 1) % ONGLETS.length
      : ev.key === 'ArrowLeft' ? (i - 1 + ONGLETS.length) % ONGLETS.length
      : ev.key === 'Home' ? 0
      : ev.key === 'End' ? ONGLETS.length - 1
      : -1;
    const o = ONGLETS[cible];
    if (!o) return;
    ev.preventDefault();
    choisir(o.id, true);
  };

  return (
    <div className="rv">
      <div className="rv-onglets" role="tablist" aria-label="Mode de révision" onKeyDown={surTouche}>
        {ONGLETS.map((o, i) => {
          const choisi = o.id === onglet;
          return (
            <button
              key={o.id}
              ref={(el) => {
                refsOnglets.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`rv-onglet-${o.id}`}
              className="rv-onglet"
              aria-selected={choisi}
              aria-controls={`rv-panneau-${o.id}`}
              tabIndex={choisi ? 0 : -1}
              onClick={() => choisir(o.id)}
            >
              <span className="rv-onglet__kanji" lang="ja" aria-hidden="true">
                {o.kanji}
              </span>
              <span>{o.libelle}</span>
              {o.id === 'cartes' && aReviser > 0 && (
                <span className="rv-onglet__nb">
                  {aReviser}
                  <span className="sr-only"> à réviser</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id="rv-panneau-cartes" aria-labelledby="rv-onglet-cartes" hidden={onglet !== 'cartes'} className="rv-panneau">
        <PanneauCartes
          cartes={cartes}
          parId={parId}
          erreur={erreur}
          onRecharger={charger}
          actif={onglet === 'cartes'}
          cours={cours}
          onQuizEclair={() => choisir('eclair', true)}
        />
      </div>
      <div role="tabpanel" id="rv-panneau-eclair" aria-labelledby="rv-onglet-eclair" hidden={onglet !== 'eclair'} className="rv-panneau">
        <QuizEclair tomes={tomes} actif={onglet === 'eclair'} />
      </div>
      <div role="tabpanel" id="rv-panneau-tome" aria-labelledby="rv-onglet-tome" hidden={onglet !== 'tome'} className="rv-panneau">
        {cartes ? (
          <ParTome tomes={tomes} cartes={cartes} parId={parId} actif={onglet === 'tome'} />
        ) : (
          <Chargement erreur={erreur} onRecharger={charger} />
        )}
      </div>
    </div>
  );
}

function Chargement({ erreur, onRecharger }: { erreur: boolean; onRecharger: () => void }) {
  if (erreur) {
    return (
      <EtatVide kanji="札" titre="Impossible de charger les cartes." texte="Vérifie ta connexion, puis réessaie.">
        <button type="button" className="btn btn--secondaire" onClick={onRecharger}>
          Réessayer
        </button>
      </EtatVide>
    );
  }
  return (
    <div className="rv-squelette" aria-busy="true">
      <span className="sr-only" role="status">
        Chargement des cartes…
      </span>
      <div className="rv-squelette__ligne" />
      <div className="rv-squelette__carte" />
    </div>
  );
}

interface PropsCartes {
  cartes: CarteJson[] | null;
  parId: ReadonlyMap<string, CarteJson>;
  erreur: boolean;
  onRecharger: () => void;
  actif: boolean;
  cours: CoursResume[];
  onQuizEclair: () => void;
}

function PanneauCartes({ cartes, parId, erreur, onRecharger, actif, cours, onQuizEclair }: PropsCartes) {
  const [session, setSession] = useState<{ ids: string[]; cle: number } | null>(null);
  const aLire = useManabi((e) => cours.find((c) => !e.progression[c.id]?.termine) ?? null);

  // La session est composée une fois (puis à chaque « Encore N cartes ») : elle ne bouge pas pendant qu'on révise.
  useEffect(() => {
    if (!cartes) return;
    const etat = lire();
    setSession((s) => ({ ids: composerSession(cartesDuJour(etat, cartes), etat.prefs.tailleSession), cle: s?.cle ?? 0 }));
  }, [cartes]);

  if (!cartes || !session) return <Chargement erreur={erreur} onRecharger={onRecharger} />;

  if (session.ids.length === 0) {
    return (
      <EtatVide kanji="花" titre="Rien à réviser." texte="Le cerisier se repose. Tes prochaines cartes arriveront d’elles-mêmes.">
        <button type="button" className="btn btn--primaire" onClick={onQuizEclair}>
          Faire un quiz éclair
        </button>
        <a className="btn btn--secondaire" href={aLire ? aLire.url : url('/tomes/')}>
          {aLire ? 'Lire un cours' : 'Parcourir les tomes'}
        </a>
      </EtatVide>
    );
  }

  const continuer = () => {
    const etat = lire();
    setSession((s) => ({ ids: composerSession(cartesDuJour(etat, cartes), etat.prefs.tailleSession), cle: (s?.cle ?? 0) + 1 }));
  };

  return (
    <SessionCartes
      key={session.cle}
      ids={session.ids}
      cartes={parId}
      toutes={cartes}
      actif={actif}
      onContinuer={continuer}
      onQuizEclair={onQuizEclair}
    />
  );
}
