/**
 * Flashcards d'un cours : le paquet, une carte à la fois. Retourner (clic, Espace),
 * noter (boutons ou 1-4, avec l'intervalle prévu) : noter() ajoute la carte aux révisions
 * espacées. Fin du paquet → récap.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { apercuIntervalles, formaterEcheance, LIBELLES_NOTES, NOTES, noter, type Note } from '../../lib/srs.ts';
import { url } from '../../lib/url.ts';
import { useManabi } from '../useManabi.ts';
import CarteRevision, { type CarteAffichee } from './CarteRevision.tsx';
import { ramenerEnVue, type Portee } from './clavier.ts';
import { Enso, Gain, Segments } from './communs.tsx';
import './apprentissage.css';

interface Props {
  cartes: CarteAffichee[];
  coursId: string;
  portee?: Portee;
}

/** « Nouvelle », « À revoir » ou « Prévue demain » selon le store. */
export function statutCarte(due: string | undefined, maintenant: Date): string {
  if (!due) return 'Nouvelle';
  return Date.parse(due) <= maintenant.getTime() ? 'À revoir' : `Prévue ${formaterEcheance(due, maintenant)}`;
}

export default function Flashcards({ cartes, coursId, portee = 'locale' }: Props) {
  const [ordre, setOrdre] = useState<number[]>(() => cartes.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [retournee, setRetournee] = useState(false);
  const [notes, setNotes] = useState<Map<number, Note>>(() => new Map());
  const [fin, setFin] = useState(false);
  const [petales, setPetales] = useState(0);
  // Heure lue après le montage : le rendu serveur et l'hydratation restent identiques.
  const [maintenant, setMaintenant] = useState<Date | null>(null);
  const [annonce, setAnnonce] = useState('');
  const racine = useRef<HTMLDivElement>(null);
  const refFin = useRef<HTMLParagraphElement>(null);
  const focusFin = useRef(false);

  const ci = ordre[pos] ?? 0;
  const carte = cartes[ci];
  const srs = useManabi((e) => (carte ? e.srs[carte.id] : undefined));
  const intervalles = useMemo(() => (maintenant ? apercuIntervalles(srs, maintenant) : null), [srs, maintenant]);

  useEffect(() => setMaintenant(new Date()), []);

  useEffect(() => {
    if (!fin || !focusFin.current) return;
    focusFin.current = false;
    refFin.current?.focus({ preventScroll: true });
    ramenerEnVue(racine.current);
  }, [fin]);

  if (!carte) return null;

  const retourner = () => {
    setRetournee((r) => !r);
    setMaintenant(new Date());
  };

  const noterCarte = (n: Note) => {
    if (!retournee) return;
    noter(carte.id, coursId, n);
    setNotes((m) => new Map(m).set(ci, n));
    setPetales((p) => p + 1);
    setAnnonce(`${LIBELLES_NOTES[n]}${intervalles ? ` : revoir dans ${intervalles[n]}` : ''}.`);
    setRetournee(false);
    setMaintenant(new Date());
    if (pos + 1 < ordre.length) setPos(pos + 1);
    else {
      focusFin.current = true;
      setFin(true);
    }
  };

  const relancer = (indices: number[]) => {
    setOrdre(indices);
    setPos(0);
    setNotes(new Map());
    setRetournee(false);
    setFin(false);
    setAnnonce('');
    setMaintenant(new Date());
  };

  if (fin) {
    const compte = (n: Note) => [...notes.values()].filter((x) => x === n).length;
    const difficiles = ordre.filter((i) => (notes.get(i) ?? 4) <= 2);
    return (
      <div className="ap-paquet carte" ref={racine}>
        <div className="ap-fin">
          <div className="ap-fin__visuel">
            <Enso valeur={1} taille={96}>
              <span className="ap-fin__kanji" lang="ja" aria-hidden="true">
                札
              </span>
            </Enso>
          </div>
          <p className="ap-fin__titre" ref={refFin} tabIndex={-1}>
            Paquet terminé.
          </p>
          <p className="ap-fin__texte">
            {ordre.length} {ordre.length > 1 ? 'cartes revues' : 'carte revue'}
            {' · '}
            <Gain n={petales} />
            <br />
            Elles reviendront au bon moment dans Réviser.
          </p>
          <ul className="ap-recap" role="list" aria-label="Tes notes">
            {NOTES.map((n) => (
              <li key={n} data-note={n}>
                <span className="ap-recap__nombre">{compte(n)}</span>
                <span className="ap-recap__libelle">{LIBELLES_NOTES[n]}</span>
              </li>
            ))}
          </ul>
          <div className="ap-fin__actions">
            {difficiles.length > 0 ? (
              <>
                <button type="button" className="btn btn--primaire" onClick={() => relancer(difficiles)}>
                  Revoir {difficiles.length > 1 ? `les ${difficiles.length} cartes difficiles` : 'la carte difficile'}
                </button>
                <button type="button" className="btn btn--secondaire" onClick={() => relancer(cartes.map((_, i) => i))}>
                  Recommencer
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn--secondaire" onClick={() => relancer(cartes.map((_, i) => i))}>
                  Recommencer le paquet
                </button>
                <a className="btn btn--discret" href={url('/reviser/')}>
                  Aller à Réviser
                </a>
              </>
            )}
          </div>
        </div>
        <p className="sr-only" role="status">
          {annonce}
        </p>
      </div>
    );
  }

  return (
    <div className="ap-paquet" ref={racine}>
      <Segments total={ordre.length} faits={pos} />
      <CarteRevision
        carte={carte}
        cle={`${pos}:${carte.id}`}
        entete={
          <span>
            Carte {pos + 1}
            <span className="ap-faible"> sur {ordre.length}</span>
          </span>
        }
        statut={maintenant ? statutCarte(srs?.due, maintenant) : undefined}
        retournee={retournee}
        onRetourner={retourner}
        intervalles={intervalles}
        onNoter={noterCarte}
        portee={portee}
      />
      <p className="sr-only" role="status">
        {annonce}
      </p>
    </div>
  );
}
