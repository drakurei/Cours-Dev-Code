/**
 * Synchronisation : jeton GitHub (tester + aide en 3 étapes), sauvegarde Gist
 * (synchroniser, envoyer, récupérer, auto, dernière synchro), export / import JSON.
 */
import { useRef, useState } from 'react';
import { exporter, importer, type Prefs, type Secrets } from '../../lib/store.ts';
import {
  DEPOT,
  ecrireMetaSync,
  ErreurSync,
  lancerSync,
  testerJetonGitHub,
  URL_NOUVEAU_JETON,
  type ModeSync,
  type RapportJeton,
  type ResultatSync,
} from '../../lib/sync.ts';
import IconeSvg from '../IconeSvg.tsx';
import { ChampSecret, Dialogue, Interrupteur, LienExterne, Ligne, Liste, Section, Statut, Verifications } from './controles.tsx';
import { useEtatSync, useMaintenant } from './etat.ts';
import { analyserFichier, majuscule, momentRelatif, nomExport } from './format.ts';

type Message = { ton: 'neutre' | 'ok' | 'erreur'; texte: string };
const VIDE: Message = { ton: 'neutre', texte: '' };

function messageResultat(r: ResultatSync): string {
  if (r.cree) return 'Sauvegarde en ligne créée. Tes autres appareils peuvent maintenant la récupérer.';
  if (r.mode === 'envoyer') return 'Envoyé : la sauvegarde en ligne est à jour.';
  if (r.mode === 'recuperer') return r.recu ? 'Récupéré : ce navigateur a maintenant la progression en ligne.' : 'Déjà identique à la sauvegarde en ligne.';
  if (r.recu && r.envoye) return 'Synchronisé : les nouveautés des deux côtés sont réunies.';
  if (r.recu) return 'Synchronisé : nouveautés récupérées.';
  if (r.envoye) return 'Synchronisé : sauvegarde en ligne mise à jour.';
  return 'Déjà à jour.';
}

const LIBELLE_EN_COURS: Record<ModeSync, string> = {
  synchroniser: 'Synchronisation…',
  envoyer: 'Envoi…',
  recuperer: 'Récupération…',
};

interface Props {
  prefs: Prefs;
  secrets: Secrets;
  ecrireSecrets: (partiel: { githubToken?: string | null }) => void;
}

export default function Synchro({ prefs, secrets, ecrireSecrets }: Props) {
  const jeton = secrets.githubToken ?? '';
  const { meta, enCours } = useEtatSync();
  const maintenant = useMaintenant();

  // Test du jeton.
  const [test, setTest] = useState<{ etat: 'repos' | 'en-cours' } | { etat: 'fini'; rapport: RapportJeton } | { etat: 'erreur'; message: string }>({
    etat: 'repos',
  });

  // Synchro manuelle.
  const [message, setMessage] = useState<Message>(VIDE);
  const [confirmer, setConfirmer] = useState<'envoyer' | 'recuperer' | null>(null);

  // Fichier.
  const fichier = useRef<HTMLInputElement>(null);
  const [messageFichier, setMessageFichier] = useState<Message>(VIDE);
  const [aImporter, setAImporter] = useState<{ texte: string; nom: string; resume: string } | null>(null);
  const [modeImport, setModeImport] = useState<'fusionner' | 'remplacer'>('fusionner');

  const changerJeton = (v: string) => {
    ecrireSecrets({ githubToken: v });
    setTest({ etat: 'repos' });
  };

  const tester = async () => {
    setTest({ etat: 'en-cours' });
    try {
      setTest({ etat: 'fini', rapport: await testerJetonGitHub(jeton) });
    } catch (e) {
      setTest({ etat: 'erreur', message: e instanceof Error ? e.message : 'Test impossible. Réessaie.' });
    }
  };

  const lancer = async (mode: ModeSync) => {
    setConfirmer(null);
    setMessage({ ton: 'neutre', texte: LIBELLE_EN_COURS[mode] });
    try {
      setMessage({ ton: 'ok', texte: messageResultat(await lancerSync(mode)) });
    } catch (e) {
      setMessage({ ton: 'erreur', texte: e instanceof ErreurSync ? e.message : 'La synchro a échoué. Réessaie.' });
    }
  };

  const exporterFichier = () => {
    try {
      const nom = nomExport();
      const lien = document.createElement('a');
      lien.href = URL.createObjectURL(new Blob([exporter()], { type: 'application/json' }));
      lien.download = nom;
      document.body.append(lien);
      lien.click();
      lien.remove();
      window.setTimeout(() => URL.revokeObjectURL(lien.href), 2000);
      setMessageFichier({ ton: 'ok', texte: `Fichier téléchargé : ${nom}` });
    } catch {
      setMessageFichier({ ton: 'erreur', texte: 'Export impossible dans ce navigateur.' });
    }
  };

  const choisirFichier = async (liste: FileList | null) => {
    const f = liste?.[0];
    if (fichier.current) fichier.current.value = ''; // pour pouvoir rechoisir le même fichier
    if (!f) return;
    let texte: string;
    try {
      texte = await f.text();
    } catch {
      setMessageFichier({ ton: 'erreur', texte: 'Impossible de lire ce fichier.' });
      return;
    }
    const analyse = analyserFichier(texte);
    if (!analyse.ok) {
      setMessageFichier({ ton: 'erreur', texte: analyse.message });
      return;
    }
    setMessageFichier(VIDE);
    setModeImport('fusionner');
    setAImporter({ texte, nom: f.name, resume: analyse.resume });
  };

  const importerFichier = () => {
    if (!aImporter) return;
    try {
      importer(aImporter.texte, modeImport);
      setMessageFichier({ ton: 'ok', texte: modeImport === 'fusionner' ? 'Sauvegarde fusionnée avec ta progression.' : 'Progression remplacée par la sauvegarde.' });
    } catch (e) {
      setMessageFichier({ ton: 'erreur', texte: e instanceof Error ? e.message : 'Import impossible.' });
    }
    setAImporter(null);
  };

  const occupe = enCours !== null;
  const lienGist = meta.url ?? (prefs.gistId ? `https://gist.github.com/${prefs.gistId}` : null);

  return (
    <Section id="synchronisation" titre="Synchronisation">
      {/* ─── Jeton ─── */}
      <Liste titre="Jeton GitHub" note="Le jeton reste dans ce navigateur. Il n’est jamais exporté ni synchronisé.">
        <Ligne libelle="Jeton d’accès" pile etiquette detail={jeton ? 'Enregistré dans ce navigateur.' : 'Sert à la synchro et à la publication depuis l’Atelier.'}>
          {(ids) => (
            <div className="r-pile">
              <ChampSecret ids={ids} valeur={jeton} onChange={changerJeton} nom="le jeton GitHub" placeholder="github_pat_…" />
              <div className="r-actions">
                <button type="button" className="btn btn--secondaire" onClick={tester} disabled={!jeton || test.etat === 'en-cours'}>
                  {test.etat === 'en-cours' ? 'Test…' : 'Tester'}
                </button>
              </div>
              <div aria-live="polite">
                {test.etat === 'fini' && <Verifications liste={test.rapport.verifications} />}
                {test.etat === 'erreur' && <p className="r-statut r-statut--erreur">{test.message}</p>}
              </div>
            </div>
          )}
        </Ligne>
        <details className="r-aide">
          <summary className="r-ligne r-aide__resume">
            <span className="r-ligne__libelle">Créer un jeton en 3 étapes</span>
            <IconeSvg nom="chevron-droite" taille={18} className="r-aide__chevron" />
          </summary>
          <ol className="r-etapes">
            <li>
              Ouvre <LienExterne href={URL_NOUVEAU_JETON}>la page « New fine-grained token »</LienExterne> de GitHub. Nom : <strong>Manabi</strong>.
            </li>
            <li>
              <strong>Repository access</strong> : choisis <strong>Only select repositories</strong>, puis{' '}
              <strong>
                {DEPOT.proprietaire}/{DEPOT.nom}
              </strong>
              .
            </li>
            <li>
              <strong>Permissions</strong> : <strong>Contents</strong> et <strong>Gists</strong> en <strong>Read and write</strong>. Clique{' '}
              <strong>Generate token</strong>, puis colle le jeton ici.
            </li>
          </ol>
        </details>
      </Liste>

      {/* ─── Sauvegarde en ligne ─── */}
      <Liste
        titre="Sauvegarde en ligne"
        note="Un Gist secret « manabi-progression.json » sur ton compte GitHub. Seule ta progression y va, jamais tes secrets."
      >
        <Ligne
          libelle="Dernière synchro"
          valeur={occupe ? LIBELLE_EN_COURS[enCours] : majuscule(momentRelatif(meta.derniere, maintenant))}
          detail={meta.erreur && !message.texte ? <span className="r-texte-erreur">Échec : {meta.erreur}</span> : undefined}
        />
        <div className="r-ligne r-ligne--pile">
          <button type="button" className="btn btn--primaire btn--bloc" onClick={() => lancer('synchroniser')} disabled={!jeton || occupe}>
            Synchroniser maintenant
          </button>
          <Statut message={jeton ? message.texte : 'Ajoute d’abord ton jeton GitHub, juste au-dessus.'} ton={jeton ? message.ton : 'neutre'} />
        </div>
        <Ligne libelle="Envoyer" detail="Remplace la sauvegarde en ligne par ce navigateur.">
          <button type="button" className="btn btn--secondaire" onClick={() => setConfirmer('envoyer')} disabled={!jeton || occupe}>
            Envoyer
          </button>
        </Ligne>
        <Ligne libelle="Récupérer" detail="Remplace ce navigateur par la sauvegarde en ligne.">
          <button type="button" className="btn btn--secondaire" onClick={() => setConfirmer('recuperer')} disabled={!jeton || occupe}>
            Récupérer
          </button>
        </Ligne>
        <Ligne libelle="Synchro automatique" detail="Au chargement d’une page et quand tu quittes l’onglet, au plus toutes les 2 min." etiquette className="r-ligne--interrupteur">
          {(ids) => <Interrupteur ids={ids} actif={meta.auto} onChange={(v) => ecrireMetaSync({ auto: v })} />}
        </Ligne>
        {lienGist && (
          <div className="r-ligne">
            <LienExterne href={lienGist} className="r-lien">
              Voir le Gist sur GitHub
            </LienExterne>
          </div>
        )}
      </Liste>

      {/* ─── Fichier ─── */}
      <Liste titre="Fichier" note="Sans compte ni jeton : un fichier .json à garder où tu veux.">
        <Ligne libelle="Exporter" detail="Télécharge ta progression, sans tes secrets.">
          <button type="button" className="btn btn--secondaire" onClick={exporterFichier}>
            Exporter
          </button>
        </Ligne>
        <Ligne libelle="Importer" detail="Depuis un fichier exporté. Tu choisis ensuite : fusionner ou remplacer.">
          <button type="button" className="btn btn--secondaire" onClick={() => fichier.current?.click()}>
            Choisir…
          </button>
          <input
            ref={fichier}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(ev) => void choisirFichier(ev.target.files)}
          />
        </Ligne>
        <div className="r-ligne r-ligne--statut">
          <Statut message={messageFichier.texte} ton={messageFichier.ton} />
        </div>
      </Liste>

      {/* ─── Confirmations ─── */}
      <Dialogue
        ouvert={confirmer !== null}
        titre={confirmer === 'recuperer' ? 'Récupérer la sauvegarde en ligne ?' : 'Envoyer cette progression ?'}
        onFermer={() => setConfirmer(null)}
        actions={
          <>
            <button type="button" className="btn btn--secondaire" data-focus-initial onClick={() => setConfirmer(null)}>
              Annuler
            </button>
            <button type="button" className="btn r-btn-danger" onClick={() => confirmer && void lancer(confirmer)}>
              {confirmer === 'recuperer' ? 'Récupérer' : 'Envoyer'}
            </button>
          </>
        }
      >
        <p>
          {confirmer === 'recuperer'
            ? 'La progression de ce navigateur sera remplacée par celle en ligne.'
            : 'La sauvegarde en ligne sera remplacée par la progression de ce navigateur.'}
        </p>
        <p className="r-dialogue__aide">Pour tout garder des deux côtés, choisis plutôt « Synchroniser maintenant ».</p>
      </Dialogue>

      <Dialogue
        ouvert={aImporter !== null}
        titre="Importer cette sauvegarde ?"
        onFermer={() => setAImporter(null)}
        actions={
          <>
            <button type="button" className="btn btn--secondaire" data-focus-initial onClick={() => setAImporter(null)}>
              Annuler
            </button>
            <button type="button" className={modeImport === 'remplacer' ? 'btn r-btn-danger' : 'btn btn--primaire'} onClick={importerFichier}>
              {modeImport === 'remplacer' ? 'Remplacer' : 'Fusionner'}
            </button>
          </>
        }
      >
        <p>
          <strong>{aImporter?.nom}</strong>
          <br />
          {aImporter?.resume}
        </p>
        <fieldset className="r-options">
          <legend className="sr-only">Comment importer</legend>
          <label className="r-option">
            <input type="radio" name="mode-import" value="fusionner" checked={modeImport === 'fusionner'} onChange={() => setModeImport('fusionner')} />
            <span>
              <strong>Fusionner</strong>
              <span className="r-option__detail">Garde le plus récent de chaque côté. Recommandé.</span>
            </span>
          </label>
          <label className="r-option">
            <input type="radio" name="mode-import" value="remplacer" checked={modeImport === 'remplacer'} onChange={() => setModeImport('remplacer')} />
            <span>
              <strong>Remplacer</strong>
              <span className="r-option__detail">Efface ta progression actuelle.</span>
            </span>
          </label>
        </fieldset>
      </Dialogue>
    </Section>
  );
}
