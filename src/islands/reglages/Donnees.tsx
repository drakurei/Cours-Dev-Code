/**
 * Données : ce que garde ce navigateur, réinitialiser la progression, effacer les secrets.
 * Chaque action destructive passe par un dialogue de confirmation (focus sur « Annuler »).
 */
import { useState } from 'react';
import { ETAT_INITIAL, modifier, type Secrets } from '../../lib/store.ts';
import { ErreurSync, lancerSync } from '../../lib/sync.ts';
import { egalSuperficiel, useManabi } from '../useManabi.ts';
import { Dialogue, Ligne, Liste, Section, Statut } from './controles.tsx';
import { resumeEtat } from './format.ts';

interface Props {
  secrets: Secrets;
  ecrireSecrets: (partiel: { githubToken?: string | null; anthropicKey?: string | null }) => void;
}

/** Remet la progression à zéro en gardant les réglages (thème, voix, Gist…). */
function viderProgression(): void {
  modifier((b) => {
    const vide = structuredClone(ETAT_INITIAL);
    b.progression = vide.progression;
    b.srs = vide.srs;
    b.quiz = vide.quiz;
    b.exercices = vide.exercices;
    b.stats = vide.stats;
  });
}

export default function Donnees({ secrets, ecrireSecrets }: Props) {
  const { resume, gistId } = useManabi((e) => ({ resume: resumeEtat(e), gistId: e.prefs.gistId }), egalSuperficiel);
  const [dialogue, setDialogue] = useState<'reinitialiser' | 'secrets' | null>(null);
  const [aussiEnLigne, setAussiEnLigne] = useState(true);
  const [message, setMessage] = useState<{ ton: 'neutre' | 'ok' | 'erreur'; texte: string }>({ ton: 'neutre', texte: '' });

  const synchroPossible = Boolean(secrets.githubToken && gistId);
  const aDesSecrets = Boolean(secrets.githubToken || secrets.anthropicKey);

  const reinitialiser = async () => {
    setDialogue(null);
    viderProgression();
    if (!(synchroPossible && aussiEnLigne)) {
      setMessage({ ton: 'ok', texte: 'Progression remise à zéro. Tes réglages sont gardés.' });
      return;
    }
    setMessage({ ton: 'neutre', texte: 'Progression remise à zéro. Envoi en ligne…' });
    try {
      await lancerSync('envoyer');
      setMessage({ ton: 'ok', texte: 'Progression remise à zéro, ici et en ligne.' });
    } catch (e) {
      setMessage({ ton: 'erreur', texte: `Remise à zéro faite ici, mais pas en ligne : ${e instanceof ErreurSync ? e.message : 'erreur inconnue.'}` });
    }
  };

  const effacerSecrets = () => {
    setDialogue(null);
    ecrireSecrets({ githubToken: null, anthropicKey: null });
    setMessage({ ton: 'ok', texte: 'Jeton GitHub et clé API effacés de ce navigateur.' });
  };

  return (
    <Section id="donnees" titre="Données">
      <Liste note="Tout est rangé dans ce navigateur. Les secrets ne sont jamais exportés ni synchronisés.">
        <Ligne libelle="Dans ce navigateur" valeur={resume} />
        <button type="button" className="r-ligne r-ligne--action r-ligne--danger" onClick={() => setDialogue('reinitialiser')}>
          Réinitialiser la progression
        </button>
        <button type="button" className="r-ligne r-ligne--action r-ligne--danger" onClick={() => setDialogue('secrets')} disabled={!aDesSecrets}>
          Effacer les secrets
          {!aDesSecrets && <span className="r-ligne__detail"> Aucun secret enregistré.</span>}
        </button>
        <div className="r-ligne r-ligne--statut">
          <Statut message={message.texte} ton={message.ton} />
        </div>
      </Liste>

      <Dialogue
        ouvert={dialogue === 'reinitialiser'}
        titre="Réinitialiser la progression ?"
        onFermer={() => setDialogue(null)}
        actions={
          <>
            <button type="button" className="btn btn--secondaire" data-focus-initial onClick={() => setDialogue(null)}>
              Annuler
            </button>
            <button type="button" className="btn r-btn-danger" onClick={() => void reinitialiser()}>
              Réinitialiser
            </button>
          </>
        }
      >
        <p>Notions vues, cours terminés, cartes, quiz, pétales et série repartent de zéro. Tes réglages et tes secrets sont gardés.</p>
        {synchroPossible && (
          <label className="r-option">
            <input type="checkbox" checked={aussiEnLigne} onChange={(ev) => setAussiEnLigne(ev.target.checked)} />
            <span>
              <strong>Vider aussi la sauvegarde en ligne</strong>
              <span className="r-option__detail">Sinon, la prochaine synchro ramènera ta progression.</span>
            </span>
          </label>
        )}
      </Dialogue>

      <Dialogue
        ouvert={dialogue === 'secrets'}
        titre="Effacer les secrets ?"
        onFermer={() => setDialogue(null)}
        actions={
          <>
            <button type="button" className="btn btn--secondaire" data-focus-initial onClick={() => setDialogue(null)}>
              Annuler
            </button>
            <button type="button" className="btn r-btn-danger" onClick={effacerSecrets}>
              Effacer
            </button>
          </>
        }
      >
        <p>Le jeton GitHub et la clé API seront effacés de ce navigateur. La synchro et la génération automatique s’arrêtent jusqu’à ce que tu les recolles.</p>
      </Dialogue>
    </Section>
  );
}
