/**
 * Minuteur rapide (#minuteur-rapide) : 10 / 15 / 25 min (contrôle segmenté = vrais boutons radio)
 * + Lancer. Il pilote le Minuteur global par l'événement « manabi:minuteur » et affiche le temps
 * restant (utile sous 1024 px, où la barre latérale et son minuteur sont cachés).
 * Les annonces aux lecteurs d'écran sont faites par le Minuteur global (pas de doublon ici).
 */
import { useEffect, useId, useRef, useState } from 'react';
import IconeSvg from '../IconeSvg.tsx';
import { lire } from '../../lib/store.ts';
import {
  appliquerCommande,
  delaiProchainTic,
  DUREES,
  dureeParDefaut,
  envoyerCommande,
  etatAffiche,
  EVENEMENT_ETAT_MINUTEUR,
  EVENEMENT_MINUTEUR,
  lireSession,
  formaterTemps,
  lireSessionBrute,
  MIROIR_INITIAL,
  resteMs,
  synchroniser,
  tempsEnMots,
  type CommandeMinuteur,
  type Duree,
  type Miroir,
} from './minuteur.ts';

const ACTIONS: readonly CommandeMinuteur['action'][] = ['demarrer', 'pause', 'reprendre', 'arreter'];
const STATUTS = { 'en-cours': 'En cours', pause: 'En pause', fini: 'Terminé' } as const;

export default function MinuteurRapide() {
  const nom = useId();
  const [duree, setDuree] = useState<Duree>(() => dureeParDefaut(lire().prefs.minuteur));
  const [miroir, setMiroir] = useState<Miroir>(() => synchroniser(MIROIR_INITIAL, lireSessionBrute(), Date.now()));
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const principal = useRef<HTMLButtonElement>(null);
  const sessionRef = useRef(miroir.session);
  const replanifier = useRef<() => void>(() => {});
  useEffect(() => {
    sessionRef.current = miroir.session;
    replanifier.current(); // nouvelle session : on se recale tout de suite sur ses secondes
  }, [miroir.session]);

  // Recalage sur le Minuteur global (il peut être piloté d'ailleurs : barre latérale, palette),
  // au rythme de ses secondes quand il tourne.
  useEffect(() => {
    let minuterie = 0;
    const planifier = () => {
      window.clearTimeout(minuterie);
      minuterie = window.setTimeout(tic, delaiProchainTic(sessionRef.current, Date.now()));
    };
    function tic() {
      const t = Date.now();
      setMiroir((m) => synchroniser(m, lireSessionBrute(), t));
      if (sessionRef.current.etat === 'en-cours') setMaintenant(t);
      planifier();
    }
    replanifier.current = planifier;
    planifier();
    const surCommande = (ev: Event) => {
      const c = (ev as CustomEvent<CommandeMinuteur | undefined>).detail;
      if (!c || !ACTIONS.includes(c.action)) return;
      const t = Date.now();
      setMaintenant(t);
      setMiroir((m) => ({ ...m, session: appliquerCommande(m.session, c, t), depuis: t }));
    };
    // État publié par le Minuteur global à chaque changement : recalage immédiat.
    const surEtat = (ev: Event) => {
      const s = lireSession(JSON.stringify((ev as CustomEvent<unknown>).detail ?? null));
      if (!s) return;
      setMaintenant(Date.now());
      setMiroir((m) => ({ ...m, session: s, cleVue: true }));
    };
    window.addEventListener(EVENEMENT_MINUTEUR, surCommande);
    window.addEventListener(EVENEMENT_ETAT_MINUTEUR, surEtat);
    return () => {
      window.clearTimeout(minuterie);
      replanifier.current = () => {};
      window.removeEventListener(EVENEMENT_MINUTEUR, surCommande);
      window.removeEventListener(EVENEMENT_ETAT_MINUTEUR, surEtat);
    };
  }, []);

  const commander = (c: CommandeMinuteur) => {
    const t = Date.now();
    setMaintenant(t);
    setMiroir((m) => ({ ...m, session: appliquerCommande(m.session, c, t), depuis: t }));
    envoyerCommande(c);
  };

  const session = miroir.session;
  const etat = etatAffiche(session, maintenant);
  const actif = etat === 'en-cours' || etat === 'pause';
  const reste = actif ? resteMs(session, maintenant) : duree * 60_000;
  const dureeActive = session.etat !== 'pret' ? session.duree : duree;

  const actionPrincipale = () => {
    if (etat === 'en-cours') commander({ action: 'pause' });
    else if (etat === 'pause') commander({ action: 'reprendre' });
    else commander({ minutes: duree, action: 'demarrer' });
  };

  return (
    <div className="minuteur-rapide" data-etat={etat}>
      <div className="minuteur-rapide__ligne">
        <p className="minuteur-rapide__temps" role="timer" aria-label={actif ? `Temps restant : ${tempsEnMots(reste)}` : `Durée : ${duree} minutes`}>
          {etat === 'fini' ? '00:00' : formaterTemps(reste)}
        </p>
        {etat !== 'pret' && <span className="minuteur-rapide__statut">{STATUTS[etat]}</span>}
      </div>

      <fieldset className="segments" disabled={actif}>
        <legend className="sr-only">Durée de la session</legend>
        {DUREES.map((d) => (
          <label key={d} className="segments__option">
            <input
              className="segments__radio"
              type="radio"
              name={nom}
              value={d}
              checked={actif ? dureeActive === d : duree === d}
              onChange={() => setDuree(d)}
            />
            <span className="segments__libelle">{d} min</span>
          </label>
        ))}
      </fieldset>

      {/* Le bouton principal reste le même élément d'un état à l'autre : le focus clavier ne saute pas. */}
      <div className="minuteur-rapide__actions">
        <button ref={principal} type="button" className="btn btn--secondaire minuteur-rapide__principal" onClick={actionPrincipale}>
          <IconeSvg nom={etat === 'en-cours' ? 'pause' : 'lecture'} taille={16} />
          {etat === 'en-cours' ? 'Pause' : etat === 'pause' ? 'Reprendre' : etat === 'fini' ? 'Relancer' : 'Lancer'}
          {!actif && <span className="sr-only"> {duree} minutes</span>}
        </button>
        {actif && (
          <button
            type="button"
            className="btn btn--discret"
            onClick={() => {
              commander({ action: 'arreter' });
              principal.current?.focus();
            }}
          >
            Arrêter
          </button>
        )}
      </div>
    </div>
  );
}
