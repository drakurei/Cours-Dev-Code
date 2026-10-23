/**
 * L'Atelier (CONCEPTION §7) : créer un cours en 4 étapes, une seule visible à la fois.
 * Brouillon sauvegardé automatiquement dans ce navigateur ; fichiers gardés en mémoire.
 * Monté en client:only="react" dans src/pages/atelier.astro.
 */
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gabarit from '../../../PROMPT-COURS.md?raw';
import { diagnostiquer } from '../../lib/atelier/analyse.ts';
import { brouillonVide, ecrireBrouillon, effacerBrouillon, estVide, lireBrouillon, type Brouillon, type Etape } from '../../lib/atelier/brouillon.ts';
import { reparerCours } from '../../lib/atelier/reparer.ts';
import { lireSecrets } from '../../lib/store.ts';
import { useManabi } from '../useManabi.ts';
import { annoncer, Contexte, ilYA, type Binaire, type ContexteAtelier, type MatiereAtelier, type MiseAJour } from './contexte.ts';
import { useGeneration } from './useGeneration.ts';
import Stepper from './Stepper.tsx';
import EtapeSource from './EtapeSource.tsx';
import EtapeGenerer from './EtapeGenerer.tsx';
import EtapeVerifier from './EtapeVerifier.tsx';
import EtapePublier from './EtapePublier.tsx';
import ResumeSource, { ResumeCours } from './ResumeSource.tsx';
import Icone from './Icone.tsx';
import './atelier.css';

export interface PropsAtelier {
  matieres: MatiereAtelier[];
  /** Noms des fichiers de cours existants, par matière (« 06-usestate ») : prochain numéro hors ligne. */
  coursParMatiere: Record<string, string[]>;
  urlReglages: string;
}

const TITRES: Record<Etape, string> = { 1: 'Source', 2: 'Générer', 3: 'Vérifier', 4: 'Publier' };

/** Présence des secrets (jamais leur valeur dans l'état React), relue quand on revient sur l'onglet. */
function useSecrets() {
  const lire = () => {
    const s = lireSecrets();
    return { aCle: !!s.anthropicKey, aJeton: !!s.githubToken };
  };
  const [etat, setEtat] = useState(lire);
  useEffect(() => {
    const relire = () =>
      setEtat((avant) => {
        const n = lire();
        return n.aCle === avant.aCle && n.aJeton === avant.aJeton ? avant : n;
      });
    window.addEventListener('focus', relire);
    window.addEventListener('storage', relire);
    document.addEventListener('visibilitychange', relire);
    return () => {
      window.removeEventListener('focus', relire);
      window.removeEventListener('storage', relire);
      document.removeEventListener('visibilitychange', relire);
    };
  }, []);
  return etat;
}

type Sauvegarde = { etat: 'ok' | 'echec' | 'vide'; quand: number };

export default function Atelier({ matieres, coursParMatiere, urlReglages }: PropsAtelier) {
  const [b, setB] = useState<Brouillon>(() => lireBrouillon() ?? brouillonVide());
  const [binaires, setBinaires] = useState<Map<string, Binaire>>(() => new Map());
  const [sauvegarde, setSauvegarde] = useState<Sauvegarde>(() => ({ etat: estVide(b) ? 'vide' : 'ok', quand: Date.parse(b.maj) || Date.now() }));
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const [reparationsAuto, setReparationsAuto] = useState<string[]>([]);
  const [cible, setCible] = useState<HTMLElement | null>(null);
  const secrets = useSecrets();
  const modeleIA = useManabi((e) => e.prefs.modeleIA);
  const racine = useRef<HTMLDivElement>(null);
  const dialogue = useRef<HTMLDialogElement>(null);
  const dernier = useRef(b);
  dernier.current = b;
  const etapePrecedente = useRef(b.etape);

  const maj = useCallback((m: MiseAJour) => setB((p) => ({ ...p, ...(typeof m === 'function' ? m(p) : m) })), []);
  const poserBinaire = useCallback((id: string, bin: Binaire | null) => {
    setBinaires((p) => {
      const n = new Map(p);
      if (bin) n.set(id, bin);
      else n.delete(id);
      return n;
    });
  }, []);
  const allerA = useCallback((e: Etape) => maj({ etape: e }), [maj]);

  const generation = useGeneration((texte) => {
    const r = reparerCours(texte);
    setReparationsAuto(r.corrections);
    maj({ reponse: r.texte });
    annoncer('Cours reçu de Claude. Il est prêt à vérifier.');
  });

  const { oublier } = generation;
  const recommencer = useCallback(() => {
    oublier();
    effacerBrouillon();
    setBinaires(new Map());
    setReparationsAuto([]);
    setB({ ...brouillonVide(), maj: new Date().toISOString() });
    setSauvegarde({ etat: 'vide', quand: Date.now() });
    annoncer('Brouillon effacé. Nouveau cours.');
  }, [oublier]);

  // Sauvegarde automatique (un peu après la dernière frappe), et tout de suite en quittant la page.
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (estVide(b) && b.etape === 1) {
        effacerBrouillon();
        setSauvegarde({ etat: 'vide', quand: Date.now() });
        return;
      }
      const ok = ecrireBrouillon({ ...b, maj: new Date().toISOString() });
      setSauvegarde({ etat: ok ? 'ok' : 'echec', quand: Date.now() });
      setMaintenant(Date.now());
    }, 600);
    return () => window.clearTimeout(t);
  }, [b]);

  useEffect(() => {
    const enregistrer = () => {
      if (!estVide(dernier.current)) ecrireBrouillon({ ...dernier.current, maj: new Date().toISOString() });
    };
    const horloge = window.setInterval(() => setMaintenant(Date.now()), 30_000);
    window.addEventListener('pagehide', enregistrer);
    setCible(document.getElementById('atelier-statut'));
    return () => {
      window.clearInterval(horloge);
      window.removeEventListener('pagehide', enregistrer);
    };
  }, []);

  // Changement d'étape : on remonte au début et le titre de l'étape prend le focus.
  useEffect(() => {
    if (etapePrecedente.current === b.etape) return;
    etapePrecedente.current = b.etape;
    const el = racine.current;
    if (el) {
      const haut = el.getBoundingClientRect().top;
      if (haut < 0 || haut > window.innerHeight * 0.6) el.scrollIntoView({ block: 'start' });
      el.querySelector<HTMLElement>('[data-titre-etape]')?.focus({ preventScroll: true });
    }
    annoncer(`Étape ${b.etape} sur 4 : ${TITRES[b.etape]}.`);
  }, [b.etape]);

  // Validation en direct : différée pour que la frappe reste fluide.
  const reponse = useDeferredValue(b.reponse);
  const diagnostic = useMemo(() => (reponse.trim() ? diagnostiquer(reponse) : null), [reponse]);

  const contexte: ContexteAtelier = {
    b,
    maj,
    binaires,
    poserBinaire,
    allerA,
    matieres,
    coursParMatiere,
    urlReglages,
    secrets,
    modeleIA,
    diagnostic,
    gabarit,
    generation,
    recommencer,
    reparationsAuto,
  };

  const statut = (
    <div className="at-statut">
      <p className="at-statut__texte" data-etat={sauvegarde.etat}>
        {sauvegarde.etat === 'echec' ? (
          <>
            <Icone nom="alerte" taille={14} />
            Brouillon non enregistré (stockage indisponible)
          </>
        ) : sauvegarde.etat === 'ok' ? (
          <>
            <Icone nom="coche" taille={14} />
            Brouillon enregistré · {ilYA(sauvegarde.quand, maintenant)}
          </>
        ) : (
          'Brouillon enregistré automatiquement'
        )}
      </p>
      {!estVide(b) && (
        <button type="button" className="at-lien at-statut__nouveau" onClick={() => dialogue.current?.showModal()}>
          Nouveau cours
        </button>
      )}
    </div>
  );

  return (
    <Contexte.Provider value={contexte}>
      {cible ? createPortal(statut, cible) : statut}
      <div ref={racine} className="at" data-etape={b.etape}>
        <Stepper />
        {b.etape === 1 && <EtapeSource />}
        {b.etape === 2 && (
          <div className="at-colonnes at-colonnes--resume">
            <ResumeSource />
            <EtapeGenerer />
          </div>
        )}
        {b.etape === 3 && <EtapeVerifier />}
        {b.etape === 4 && (
          <div className="at-colonnes at-colonnes--resume">
            <ResumeCours />
            <EtapePublier />
          </div>
        )}
      </div>

      <dialog
        ref={dialogue}
        className="at-dialogue verre"
        aria-labelledby="at-dialogue-titre"
        aria-describedby="at-dialogue-texte"
        onClick={(ev) => {
          if (ev.target === dialogue.current) dialogue.current?.close();
        }}
      >
        <h2 id="at-dialogue-titre" className="at-dialogue__titre">
          Effacer ce brouillon ?
        </h2>
        <p id="at-dialogue-texte" className="at-dialogue__texte">
          La source, le prompt et la réponse de l’IA seront effacés de ce navigateur. Les cours déjà publiés ne bougent pas.
        </p>
        <div className="at-dialogue__actions">
          <button type="button" className="btn btn--discret" onClick={() => dialogue.current?.close()} autoFocus>
            Annuler
          </button>
          <button
            type="button"
            className="btn btn--primaire"
            onClick={() => {
              dialogue.current?.close();
              recommencer();
            }}
          >
            Effacer
          </button>
        </div>
      </dialog>
    </Contexte.Provider>
  );
}
