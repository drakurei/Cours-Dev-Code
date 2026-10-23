/**
 * Étape 2 — Générer : (a) le prompt universel à copier dans n'importe quelle IA,
 * (b) la génération automatique avec Claude (clé enregistrée dans les Réglages).
 */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { OngletGenerer } from '../../lib/atelier/brouillon.ts';
import { octetsVersBase64, tailleLisible } from '../../lib/atelier/base64.ts';
import { construireContenu, LIMITE_REQUETE, type PieceJointe } from '../../lib/atelier/anthropic.ts';
import { preparerEnvoi, promptPour } from '../../lib/atelier/source.ts';
import { lireSecrets } from '../../lib/store.ts';
import { annoncer, copierTexte, nombreFr, useAtelier } from './contexte.ts';
import Icone from './Icone.tsx';
import Segments, { idOnglet, idPanneau } from './Segments.tsx';

/** Les IA s'ouvrent simplement dans un nouvel onglet : jamais de contenu dans l'URL. */
const IA = [
  { nom: 'ChatGPT', url: 'https://chatgpt.com/' },
  { nom: 'Claude', url: 'https://claude.ai/new' },
  { nom: 'Gemini', url: 'https://gemini.google.com/' },
] as const;

const PROMPT_LONG = 100_000;

export default function EtapeGenerer() {
  const { b, maj } = useAtelier();
  const base = useId();
  return (
    <section className="carte at-panneau at-generer" aria-labelledby={`${base}-titre`}>
      <div className="at-panneau__tete">
        <h2 id={`${base}-titre`} className="at-panneau__titre at-panneau__titre--grand" data-titre-etape="" tabIndex={-1}>
          Générer le cours
        </h2>
        <Segments<OngletGenerer>
          idBase={`${base}-gen`}
          label="Façon de générer"
          valeur={b.ongletGenerer}
          onChange={(v) => maj({ ongletGenerer: v })}
          options={[
            { valeur: 'universel', libelle: 'N’importe quelle IA' },
            { valeur: 'claude', libelle: 'Automatique (Claude)' },
          ]}
        />
      </div>
      <div role="tabpanel" id={idPanneau(`${base}-gen`, 'universel')} aria-labelledby={idOnglet(`${base}-gen`, 'universel')} hidden={b.ongletGenerer !== 'universel'}>
        {b.ongletGenerer === 'universel' && <Universel />}
      </div>
      <div role="tabpanel" id={idPanneau(`${base}-gen`, 'claude')} aria-labelledby={idOnglet(`${base}-gen`, 'claude')} hidden={b.ongletGenerer !== 'claude'}>
        {b.ongletGenerer === 'claude' && <Automatique />}
      </div>
    </section>
  );
}

function useMatieresPrompt() {
  const { matieres } = useAtelier();
  return useMemo(() => matieres.map((m) => ({ slug: m.slug, nom: m.nom })), [matieres]);
}

function Universel() {
  const { b, binaires, gabarit, allerA } = useAtelier();
  const matieres = useMatieresPrompt();
  const base = useId();
  const [ouvert, setOuvert] = useState(false);
  const [copie, setCopie] = useState<'oui' | 'non' | null>(null);
  const minuterie = useRef(0);
  const envoi = useMemo(() => preparerEnvoi(b, 'universel', new Set(binaires.keys())), [b, binaires]);
  const prompt = useMemo(() => promptPour(gabarit, b, matieres, envoi), [gabarit, b, matieres, envoi]);

  useEffect(() => () => window.clearTimeout(minuterie.current), []);

  const copier = async () => {
    const ok = await copierTexte(prompt);
    setCopie(ok ? 'oui' : 'non');
    annoncer(ok ? 'Prompt copié. Colle-le dans ton IA.' : 'Copie impossible : ouvre le prompt et sélectionne-le à la main.');
    if (!ok) setOuvert(true);
    window.clearTimeout(minuterie.current);
    minuterie.current = window.setTimeout(() => setCopie(null), 2400);
  };

  return (
    <div className="at-pile at-pile--large">
      <ol className="at-mini-etapes" role="list">
        <li>
          <span aria-hidden="true">1</span>Copie le prompt
        </li>
        <li>
          <span aria-hidden="true">2</span>
          {envoi.joints.length ? 'Colle-le dans ton IA avec tes fichiers' : 'Colle-le dans ton IA'}
        </li>
        <li>
          <span aria-hidden="true">3</span>Reviens coller sa réponse
        </li>
      </ol>

      <div className="at-prompt" data-ouvert={ouvert ? '' : undefined}>
        <div className="at-prompt__tete">
          <span className="at-prompt__nom">PROMPT-COURS.md + ta source</span>
          <span className="at-prompt__compte">{nombreFr(prompt.length)} caractères</span>
        </div>
        <pre id={`${base}-prompt`} className="at-prompt__texte" tabIndex={0} aria-label="Prompt complet">
          <code>{prompt}</code>
        </pre>
        <button type="button" className="at-prompt__voir" aria-expanded={ouvert} aria-controls={`${base}-prompt`} onClick={() => setOuvert((o) => !o)}>
          {ouvert ? 'Réduire le prompt' : 'Voir tout le prompt'}
        </button>
      </div>

      {prompt.length > PROMPT_LONG && (
        <p className="at-message at-message--alerte">
          <Icone nom="alerte" taille={18} />
          Prompt très long : certaines IA gratuites le refusent. À l’étape Source, décoche « Mettre le texte dans le prompt » et joins le PDF à la place.
        </p>
      )}

      <div className="at-rangee">
        <button type="button" className="btn btn--primaire btn--grand" onClick={() => void copier()}>
          <Icone nom={copie === 'oui' ? 'coche' : 'copier'} />
          {copie === 'oui' ? 'Prompt copié' : 'Copier le prompt'}
        </button>
        <span className="at-rangee__liant">puis ouvrir</span>
        <div className="at-rangee at-rangee--serree">
          {IA.map((ia) => (
            <a key={ia.nom} className="at-pilule" href={ia.url} target="_blank" rel="noopener noreferrer">
              {ia.nom}
              <Icone nom="externe" taille={14} />
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          ))}
        </div>
      </div>

      {envoi.joints.length > 0 && (
        <div className="at-note at-note--astuce">
          <span className="at-note__kanji" lang="ja" aria-hidden="true">
            技
          </span>
          <div className="at-note__corps">
            <p className="at-note__titre">Joins aussi tes fichiers dans l’IA</p>
            <p className="at-note__texte">{envoi.joints.join(', ')} : glisse-les dans la conversation avec le prompt.</p>
          </div>
        </div>
      )}

      <div className="at-note at-note--info">
        <span className="at-note__kanji" lang="ja" aria-hidden="true">
          知
        </span>
        <div className="at-note__corps">
          <p className="at-note__titre">Ensuite, colle la réponse à l’étape 3</p>
          <p className="at-note__texte">Manabi répare les petites erreurs, vérifie le format et te montre l’aperçu avant de publier.</p>
        </div>
        <button type="button" className="at-note__bouton" onClick={() => allerA(3)}>
          Aller à l’étape 3
          <Icone nom="chevron-droite" taille={16} />
        </button>
      </div>
    </div>
  );
}

const LIBELLES_PHASE = {
  connexion: 'Connexion à Claude…',
  reflexion: 'Claude lit la source et réfléchit…',
  ecriture: 'Claude écrit le cours…',
  repli: 'Un autre modèle prend le relais…',
  'nouvel-essai': 'Nouvel essai…',
} as const;

function Automatique() {
  const { b, binaires, gabarit, secrets, modeleIA, urlReglages, generation, allerA, reparationsAuto } = useAtelier();
  const matieres = useMatieresPrompt();
  const sortie = useRef<HTMLPreElement>(null);
  const envoi = useMemo(() => preparerEnvoi(b, 'claude', new Set(binaires.keys())), [b, binaires]);
  const taille = useMemo(() => {
    let n = 0;
    for (const id of [...envoi.pdfs, ...envoi.images]) n += Math.ceil(((binaires.get(id)?.octets.length ?? 0) * 4) / 3);
    return n;
  }, [envoi, binaires]);
  const perdus = [...b.pdfs.filter((p) => !binaires.has(p.id) && !p.enImages), ...b.images.filter((i) => !i.depuisPdf && !binaires.has(i.id))].map((x) => x.nom);
  const tropGros = taille > LIMITE_REQUETE;
  const enCours = generation.statut === 'en-cours';

  // La sortie suit le texte qui arrive (sauf si on remonte pour lire).
  useEffect(() => {
    const el = sortie.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 80) el.scrollTop = el.scrollHeight;
  }, [generation.texte]);

  if (!secrets.aCle) {
    return (
      <div className="at-sans-cle">
        <span className="badge-kanji badge-kanji--lg" lang="ja" aria-hidden="true">
          設
        </span>
        <div className="at-pile at-pile--serree">
          <p className="at-sans-cle__titre">Ajoute ta clé API Claude dans les Réglages</p>
          <p className="at-sans-cle__texte">
            Elle reste dans ce navigateur et ne part que vers l’API d’Anthropic. Crée-la sur la console Anthropic avec un plafond de dépenses, puis colle-la dans Réglages, rubrique IA.
          </p>
          <p className="at-sans-cle__texte">En attendant, l’onglet « N’importe quelle IA » marche partout, sans clé.</p>
          <div>
            <a className="btn btn--secondaire" href={urlReglages}>
              Ouvrir les Réglages
              <Icone nom="chevron-droite" taille={16} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  const lancer = () => {
    const cle = lireSecrets().anthropicKey;
    if (!cle) return;
    const pieces: PieceJointe[] = [];
    for (const id of envoi.pdfs) {
      const bin = binaires.get(id);
      const nom = b.pdfs.find((p) => p.id === id)?.nom ?? 'document.pdf';
      if (bin) pieces.push({ nom, type: 'application/pdf', base64: octetsVersBase64(bin.octets) });
    }
    for (const id of envoi.images) {
      const bin = binaires.get(id);
      const nom = b.images.find((i) => i.id === id)?.nom ?? 'image.png';
      if (bin) pieces.push({ nom, type: bin.type, base64: octetsVersBase64(bin.octets) });
    }
    const prompt = promptPour(gabarit, b, matieres, envoi);
    generation.lancer({ cle, modele: modeleIA, contenu: construireContenu(prompt, pieces) });
    annoncer('Génération lancée.');
  };

  const nbPdf = envoi.pdfs.length;
  const nbImages = envoi.images.length;
  const contenuEnvoye = [
    'le prompt',
    nbPdf ? `${nbPdf} PDF` : '',
    nbImages ? `${nbImages} image${nbImages > 1 ? 's' : ''}` : '',
  ]
    .filter(Boolean)
    .join(' + ');

  return (
    <div className="at-pile at-pile--large">
      <dl className="at-envoi">
        <div>
          <dt>Modèle</dt>
          <dd>
            <code>{modeleIA}</code>
            <span className="at-envoi__aide">modifiable dans les Réglages</span>
          </dd>
        </div>
        <div>
          <dt>Envoyé</dt>
          <dd>
            {contenuEnvoye}
            {taille > 0 && <span className="at-envoi__aide">{tailleLisible(taille)}</span>}
          </dd>
        </div>
      </dl>

      {perdus.length > 0 && (
        <p className="at-message at-message--alerte">
          <Icone nom="alerte" taille={18} />
          {perdus.join(', ')} : à redéposer à l’étape Source (le brouillon garde seulement le texte).
        </p>
      )}
      {tropGros && (
        <p className="at-message at-message--erreur">
          <Icone nom="alerte" taille={18} />
          Trop lourd pour une seule requête ({tailleLisible(taille)}, 30 Mo au plus) : retire des images ou découpe le PDF.
        </p>
      )}
      {b.reponse.trim() && !enCours && generation.statut !== 'fini' && (
        <p className="at-champ__aide">La réponse remplacera le texte de l’étape Vérifier.</p>
      )}

      <div className="at-rangee">
        {enCours ? (
          <button type="button" className="btn btn--secondaire btn--grand" onClick={generation.arreter}>
            <Icone nom="arret" />
            Arrêter
          </button>
        ) : generation.statut === 'fini' ? (
          <>
            <button type="button" className="btn btn--primaire btn--grand" onClick={() => allerA(3)}>
              Vérifier le cours
              <Icone nom="fleche-droite" />
            </button>
            <button type="button" className="btn btn--discret" onClick={lancer} disabled={tropGros}>
              <Icone nom="recommencer" />
              Recommencer
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--primaire btn--grand" onClick={lancer} disabled={tropGros}>
            <Icone nom="eclair" />
            Générer avec Claude
          </button>
        )}
        <p className="at-ligne-etat" aria-live="polite">
          {enCours && <span className="at-roue" aria-hidden="true" />}
          {enCours && generation.phase ? LIBELLES_PHASE[generation.phase.phase] : ''}
          {enCours && generation.texte ? ` ${nombreFr(generation.texte.length)} caractères reçus.` : ''}
          {generation.statut === 'fini' ? `Cours reçu : ${nombreFr(generation.texte.length)} caractères, déjà placé à l’étape Vérifier.` : ''}
        </p>
      </div>

      {generation.statut === 'fini' && reparationsAuto.length > 0 && (
        <p className="at-champ__aide">Réparé automatiquement : {reparationsAuto.join(', ')}.</p>
      )}

      {generation.erreur && (
        <div className={`at-message ${generation.erreur.code === 'arrete' ? 'at-message--neutre' : 'at-message--erreur'}`} role="alert">
          <Icone nom={generation.erreur.code === 'arrete' ? 'info' : 'alerte'} taille={18} />
          <div className="at-pile at-pile--serree">
            <span>{generation.erreur.message}</span>
            {(generation.erreur.code === 'cle' || generation.erreur.code === 'modele') && (
              <a href={urlReglages}>Ouvrir les Réglages</a>
            )}
            {generation.texte.trim() && <GarderDebut texte={generation.texte} />}
          </div>
        </div>
      )}

      {(enCours || generation.texte) && (
        <pre ref={sortie} className="at-sortie" tabIndex={0} aria-label="Réponse de Claude" aria-busy={enCours}>
          <code>{generation.texte || ' '}</code>
        </pre>
      )}
    </div>
  );
}

function GarderDebut({ texte }: { texte: string }) {
  const { maj, allerA } = useAtelier();
  return (
    <div>
      <button
        type="button"
        className="btn btn--secondaire"
        onClick={() => {
          maj({ reponse: texte });
          allerA(3);
        }}
      >
        Garder le début dans l’éditeur
      </button>
    </div>
  );
}
