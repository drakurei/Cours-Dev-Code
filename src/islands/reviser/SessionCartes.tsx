/**
 * Une session de cartes : une grande carte au centre, Espace pour retourner, 1-4 pour noter,
 * « 3 / 12 », Pause, puis l'écran de fin (pétales gagnés, série, prochaine échéance).
 * Les cartes en pas d'apprentissage (1 min, 10 min) reviennent dans la session.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import type { CarteJson } from '../../lib/apprentissage/donnees.ts';
import { listeLisible } from '../../lib/apprentissage/donnees.ts';
import { apresNote, carteCourante, creerFile, estFinie, numero, terminer, type FileSession } from '../../lib/apprentissage/session.ts';
import {
  apercuIntervalles,
  cartesDuJour,
  formaterEcheance,
  LIBELLES_NOTES,
  minutesEstimees,
  noter,
  prochaineEcheance,
  type Note,
} from '../../lib/srs.ts';
import { lire, serieDuJour } from '../../lib/store.ts';
import { url } from '../../lib/url.ts';
import { useManabi } from '../useManabi.ts';
import IconeSvg from '../IconeSvg.tsx';
import CarteRevision from '../apprentissage/CarteRevision.tsx';
import { Enso, LignesVitesse, Segments, Source } from '../apprentissage/communs.tsx';

interface Props {
  /** File de départ (déjà composée et limitée). */
  ids: string[];
  cartes: ReadonlyMap<string, CarteJson>;
  /** Cartes du périmètre (toutes, ou celles d'un tome) : pour savoir s'il en reste après. */
  toutes: CarteJson[];
  actif: boolean;
  /** Relance une session avec les cartes encore dues. */
  onContinuer: () => void;
  onQuizEclair?: (() => void) | undefined;
  /** Remplace la liste des matières en tête (ex. le nom du tome). */
  contexte?: ReactNode;
}

function minuteur(action: 'pause' | 'reprendre'): void {
  window.dispatchEvent(new CustomEvent('manabi:minuteur', { detail: { action } }));
}

/** Le minuteur tourne-t-il ? (état gardé par l'îlot Minuteur dans sessionStorage « manabi:minuteur »). */
function minuteurEnCours(): boolean {
  try {
    const brut = window.sessionStorage.getItem('manabi:minuteur');
    return !!brut && (JSON.parse(brut) as { etat?: unknown }).etat === 'en-cours';
  } catch {
    return false;
  }
}

export default function SessionCartes({ ids, cartes, toutes, actif, onContinuer, onQuizEclair, contexte }: Props) {
  const [file, setFile] = useState<FileSession>(() => creerFile(ids.filter((id) => cartes.has(id))));
  const [retournee, setRetournee] = useState(false);
  const [pause, setPause] = useState(false);
  const [petales, setPetales] = useState(0);
  // Cartes notées au moins une fois (même si elles reviennent plus tard dans la file).
  const [vues, setVues] = useState<ReadonlySet<string>>(() => new Set());
  const [maintenant, setMaintenant] = useState(() => new Date());
  const [annonce, setAnnonce] = useState('');
  const racine = useRef<HTMLDivElement>(null);
  const refReprendre = useRef<HTMLButtonElement>(null);
  const refFin = useRef<HTMLParagraphElement>(null);
  const aFocaliser = useRef<'reprendre' | 'carte' | 'fin' | null>(null);

  const id = carteCourante(file);
  const carte = id ? cartes.get(id) : undefined;
  const srs = useManabi((e) => (id ? e.srs[id] : undefined));
  const intervalles = useMemo(() => apercuIntervalles(srs, maintenant), [srs, maintenant]);
  const fini = estFinie(file);

  // Matières et durée annoncées au départ (elles ne bougent pas pendant la session).
  const [entete] = useState(() => {
    const noms = file.file.map((x) => cartes.get(x)?.matiereNom ?? '').filter(Boolean);
    return `${listeLisible(noms)} · ≈ ${minutesEstimees(file.total)} min`;
  });

  useEffect(() => {
    const cible = aFocaliser.current;
    if (!cible) return;
    aFocaliser.current = null;
    if (cible === 'reprendre') refReprendre.current?.focus();
    else if (cible === 'fin') refFin.current?.focus({ preventScroll: true });
    else racine.current?.querySelector<HTMLButtonElement>('.ap-carte__face:not([inert]) .ap-carte__retourner')?.focus({ preventScroll: true });
  });

  const retourner = () => {
    setRetournee((r) => !r);
    setMaintenant(new Date());
  };

  const noterCarte = (n: Note) => {
    if (!carte || !retournee) return;
    const t = new Date();
    noter(carte.id, carte.coursId, n, t);
    const due = lire().srs[carte.id]?.due;
    const suite = apresNote(file, carte.id, due ? Date.parse(due) - t.getTime() : null);
    setFile(suite);
    setPetales((p) => p + 1);
    setVues((v) => new Set(v).add(carte.id));
    setRetournee(false);
    setMaintenant(new Date());
    setAnnonce(`${LIBELLES_NOTES[n]} : revoir dans ${intervalles[n]}.`);
    if (estFinie(suite)) aFocaliser.current = 'fin';
  };

  // La pause de la session met aussi le minuteur en pause, s'il tournait ; il ne reprend que dans ce cas.
  const minuteurSuspendu = useRef(false);
  const relancerMinuteur = () => {
    if (!minuteurSuspendu.current) return;
    minuteurSuspendu.current = false;
    minuteur('reprendre');
  };
  useEffect(() => relancerMinuteur, []);

  const basculerPause = () => {
    const enPause = !pause;
    setPause(enPause);
    if (enPause && minuteurEnCours()) {
      minuteurSuspendu.current = true;
      minuteur('pause');
    } else if (!enPause) relancerMinuteur();
    aFocaliser.current = enPause ? 'reprendre' : 'carte';
    setAnnonce(enPause ? 'Session en pause.' : 'Session reprise.');
  };

  const arreter = () => {
    relancerMinuteur();
    setPause(false);
    setFile((f) => terminer(f));
    aFocaliser.current = 'fin';
  };

  if (fini) {
    return (
      <FinSession
        racine={racine}
        refFin={refFin}
        revues={vues.size}
        complete={file.faites.length >= file.total}
        petales={petales}
        toutes={toutes}
        onContinuer={onContinuer}
        onQuizEclair={onQuizEclair}
      />
    );
  }
  if (!carte) return null;

  const n = numero(file);
  return (
    <div className="rv-session" ref={racine}>
      <div className="rv-session__tete">
        <p className="rv-session__info">{contexte ?? entete}</p>
        <p className="rv-compteur">
          <span className="sr-only">Carte </span>
          {n}
          <span aria-hidden="true"> / </span>
          <span className="sr-only"> sur </span>
          {file.total}
        </p>
      </div>
      <Segments total={file.total} faits={file.faites.length} />

      {pause ? (
        <div className="rv-centre">
          <Enso valeur={vues.size / Math.max(1, file.total)} taille={88}>
            <span className="rv-centre__compte">
              {vues.size}
              <span>/{file.total}</span>
            </span>
          </Enso>
          <p className="rv-centre__titre">En pause.</p>
          <p className="rv-centre__texte">Tes notes sont enregistrées. Reprends quand tu veux.</p>
          <button ref={refReprendre} type="button" className="btn btn--primaire btn--grand" onClick={basculerPause}>
            <IconeSvg nom="lecture" taille={18} />
            Reprendre
          </button>
        </div>
      ) : (
        <CarteRevision
          carte={carte}
          cle={`${carte.id}:${file.retours[carte.id] ?? 0}`}
          entete={<Source source={carte} />}
          statut={srs ? 'À revoir' : 'Nouvelle'}
          retournee={retournee}
          onRetourner={retourner}
          intervalles={intervalles}
          onNoter={noterCarte}
          portee="globale"
          actif={actif}
          taille="grande"
        />
      )}

      <div className="rv-session__actions">
        {!pause && (
          <button type="button" className="btn btn--discret" onClick={basculerPause}>
            <IconeSvg nom="pause" taille={18} />
            Pause
          </button>
        )}
        <button type="button" className="btn btn--discret" onClick={arreter}>
          Terminer pour aujourd’hui
        </button>
      </div>
      <p className="sr-only" role="status">
        {annonce}
      </p>
    </div>
  );
}

interface PropsFin {
  racine: RefObject<HTMLDivElement | null>;
  refFin: RefObject<HTMLParagraphElement | null>;
  revues: number;
  /** Toutes les cartes de la file sont sorties (sinon : arrêtée avant la fin). */
  complete: boolean;
  petales: number;
  toutes: CarteJson[];
  onContinuer: () => void;
  onQuizEclair?: (() => void) | undefined;
}

function FinSession({ racine, refFin, revues, complete, petales, toutes, onContinuer, onQuizEclair }: PropsFin) {
  const serie = useManabi((e) => serieDuJour(e));
  const prochaine = useManabi((e) => prochaineEcheance(e));
  const restantes = useManabi((e) => {
    const r = cartesDuJour(e, toutes);
    return Math.min(e.prefs.tailleSession, r.dues.length + r.nouvelles.length);
  });

  return (
    <div className="rv-session" ref={racine}>
      <div className="rv-centre rv-centre--fin">
        <div className="ap-fin__visuel">
          {complete && revues > 0 && <LignesVitesse />}
          <Enso valeur={1} taille={104}>
            <span className="rv-centre__kanji" lang="ja" aria-hidden="true">
              済
            </span>
          </Enso>
        </div>
        <p className="rv-centre__titre" ref={refFin} tabIndex={-1}>
          {complete ? 'Session terminée.' : 'Session arrêtée.'}
        </p>
        <p className="rv-centre__texte">
          {revues > 0
            ? `${revues} ${revues > 1 ? 'cartes revues' : 'carte revue'}. Elles reviendront au bon moment.`
            : 'Aucune carte notée. Elles t’attendent.'}
        </p>
        <ul className="rv-stats" role="list">
          <li className="rv-stat">
            <span className="rv-stat__kanji" lang="ja" aria-hidden="true">
              花
            </span>
            <span className="rv-stat__valeur">+{petales}</span>
            <span className="rv-stat__libelle">{petales > 1 ? 'Pétales' : 'Pétale'}</span>
          </li>
          <li className="rv-stat">
            <span className="rv-stat__kanji" lang="ja" aria-hidden="true">
              連
            </span>
            <span className="rv-stat__valeur">
              {serie} {serie > 1 ? 'jours' : 'jour'}
            </span>
            <span className="rv-stat__libelle">Série</span>
          </li>
          <li className="rv-stat">
            <span className="rv-stat__kanji" lang="ja" aria-hidden="true">
              復
            </span>
            <span className="rv-stat__valeur">{prochaine ? formaterEcheance(prochaine) : 'rien de prévu'}</span>
            <span className="rv-stat__libelle">Prochaine révision</span>
          </li>
        </ul>
        <div className="ap-fin__actions">
          {restantes > 0 ? (
            <>
              <button type="button" className="btn btn--primaire" onClick={onContinuer}>
                Encore {restantes} {restantes > 1 ? 'cartes' : 'carte'}
              </button>
              <a className="btn btn--discret" href={url('/')}>
                Retour à l’accueil
              </a>
            </>
          ) : (
            <>
              {onQuizEclair && (
                <button type="button" className="btn btn--secondaire" onClick={onQuizEclair}>
                  Un quiz éclair ?
                </button>
              )}
              <a className="btn btn--discret" href={url('/')}>
                Retour à l’accueil
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
