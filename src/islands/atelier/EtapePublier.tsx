/**
 * Étape 4 — Publier : télécharger le .md (avec son chemin), ou publier sur GitHub
 * (drakurei/Cours-Dev-Code, branche main) : matière créée si besoin, fichiers joints dans
 * public/media/<matiere>/, puis le cours. Le site se met à jour tout seul (~2 min).
 */
import { useId, useMemo, useState } from 'react';
import { octetsVersBase64, tailleLisible } from '../../lib/atelier/base64.ts';
import {
  cheminMatiere,
  choisirNumero,
  completerMatiere,
  nomFichierCours,
  nomMedia,
  preparerFichierFinal,
  slugDuCours,
  titreMedia,
  yamlMatiere,
  type FichierJoint,
} from '../../lib/atelier/fichier.ts';
import { DEPOT, ErreurGitHub, publierCours, URL_ACTIONS, type EtapePublication, type ResultatPublication } from '../../lib/atelier/github.ts';
import { lireSecrets } from '../../lib/store.ts';
import { annoncer, telechargerTexte, useAtelier } from './contexte.ts';
import Icone from './Icone.tsx';
import { TuileFichier } from './EtapeSource.tsx';

const ETAPES_PUBLICATION: { cle: EtapePublication; libelle: string }[] = [
  { cle: 'dossier', libelle: 'Lecture du dossier de la matière' },
  { cle: 'matiere', libelle: 'Création de la matière' },
  { cle: 'medias', libelle: 'Envoi des fichiers joints' },
  { cle: 'cours', libelle: 'Envoi du cours' },
];

type Avancement = Partial<Record<EtapePublication, { etat: 'en-cours' | 'fait'; detail?: string | undefined }>>;

export default function EtapePublier() {
  const { b, maj, diagnostic, matieres, coursParMatiere, binaires, secrets, urlReglages, allerA, recommencer } = useAtelier();
  const base = useId();
  const [envoi, setEnvoi] = useState<'repos' | 'en-cours' | 'erreur'>('repos');
  const [avancement, setAvancement] = useState<Avancement>({});
  const [erreur, setErreur] = useState<ErreurGitHub | null>(null);
  const [resultat, setResultat] = useState<ResultatPublication | null>(null);

  const data = diagnostic?.data ?? null;
  const brut = diagnostic?.brut ?? null;

  const calcul = useMemo(() => {
    if (!data || !diagnostic) return null;
    const matiere = data.matiere;
    const connue = matieres.find((m) => m.slug === matiere);
    const chapitre = brut?.chapitre ?? data.chapitre;
    const numero = choisirNumero(chapitre, coursParMatiere[matiere] ?? []);
    const slug = slugDuCours(diagnostic.nomConseille, data.titre);
    const ordre = Math.max(0, ...matieres.map((m) => (m.ordre < 999 ? m.ordre : 0))) + 1;
    const nouvelle = connue ? null : completerMatiere(matiere, brut?.nouvelleMatiere, ordre, b.nomNouvelleMatiere);
    return { matiere, connue, chapitre, numero, slug, nomFichier: nomFichierCours(numero, slug), nouvelle, ordre };
  }, [data, diagnostic, brut, matieres, coursParMatiere, b.nomNouvelleMatiere]);

  // Fichiers qu'on peut joindre : PDF et images encore en mémoire (pas les pages rendues).
  const candidats = useMemo(
    () => [
      ...b.pdfs.filter((p) => binaires.has(p.id)).map((p) => ({ id: p.id, nom: p.nom, taille: p.taille, format: 'PDF', genre: 'pdf' as const })),
      ...b.images
        .filter((i) => !i.depuisPdf && binaires.has(i.id))
        .map((i) => ({ id: i.id, nom: i.nom, taille: i.taille, format: i.type.split('/')[1]?.toUpperCase().replace('JPEG', 'JPG') ?? 'IMG', genre: 'image' as const })),
    ],
    [b.pdfs, b.images, binaires],
  );
  const choisis = candidats.filter((c) => b.joindre.includes(c.id));

  // Noms des fichiers joints pour le téléchargement (le numéro vient de la version en ligne).
  const mediasLocaux = useMemo(() => {
    if (!calcul) return [];
    const pris: string[] = [];
    return choisis.map((c) => {
      const nom = nomMedia(calcul.numero, c.nom, pris);
      pris.push(nom);
      return { ...c, nomMedia: nom, joint: { titre: titreMedia(c.nom), chemin: `/media/${calcul.matiere}/${nom}` } satisfies FichierJoint };
    });
  }, [calcul, choisis]);

  if (!diagnostic?.ok || !data || !calcul) {
    return (
      <section className="carte at-panneau" aria-labelledby={`${base}-titre`}>
        <h2 id={`${base}-titre`} className="at-panneau__titre at-panneau__titre--grand" data-titre-etape="" tabIndex={-1}>
          Publier le cours
        </h2>
        <p className="at-champ__aide">Le cours doit d’abord être valide.</p>
        <div>
          <button type="button" className="btn btn--secondaire" onClick={() => allerA(3)}>
            Retour à Vérifier
          </button>
        </div>
      </section>
    );
  }

  const texteFinal = preparerFichierFinal(b.reponse, {
    numero: calcul.numero,
    slug: calcul.slug,
    chapitre: calcul.chapitre,
    fichiers: mediasLocaux.map((m) => m.joint),
    fichiersExistants: data.fichiers,
  });

  const telecharger = () => {
    telechargerTexte(calcul.nomFichier, texteFinal);
    annoncer(`${calcul.nomFichier} téléchargé. Range-le dans src/content/cours/${calcul.matiere}/.`);
  };

  const telechargerMedia = (id: string, nom: string) => {
    const bin = binaires.get(id);
    if (!bin) return;
    const url = URL.createObjectURL(new Blob([bin.octets as BlobPart], { type: bin.type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = nom;
    document.body.append(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const publier = async () => {
    const jeton = lireSecrets().githubToken;
    if (!jeton) return;
    setEnvoi('en-cours');
    setErreur(null);
    setAvancement({});
    annoncer('Publication sur GitHub…');
    try {
      const r = await publierCours(
        {
          texte: b.reponse,
          matiere: calcul.matiere,
          titre: data.titre,
          chapitre: calcul.chapitre,
          nomConseille: diagnostic.nomConseille,
          nouvelleMatiere: brut?.nouvelleMatiere,
          nomMatiereSaisi: b.nomNouvelleMatiere,
          ordreMatiere: calcul.ordre,
          joints: choisis.flatMap((c) => {
            const bin = binaires.get(c.id);
            return bin ? [{ nom: c.nom, base64: octetsVersBase64(bin.octets) }] : [];
          }),
          fichiersExistants: data.fichiers,
        },
        { jeton },
        (etape, etat, detail) => setAvancement((a) => ({ ...a, [etape]: { etat, detail } })),
      );
      setResultat(r);
      setEnvoi('repos');
      annoncer(`Cours publié : ${r.nomFichier}. Le site sera à jour dans environ 2 minutes.`);
    } catch (e) {
      setErreur(e instanceof ErreurGitHub ? e : new ErreurGitHub('Publication impossible : réessaie dans un moment.', 'autre'));
      setEnvoi('erreur');
    }
  };

  // ─── Publié ─────────────────────────────────────────────────────────────
  if (resultat) {
    return (
      <section className="carte at-panneau at-publie" aria-labelledby={`${base}-titre`}>
        <span className="at-hanko" lang="ja" aria-hidden="true">
          済
        </span>
        <h2 id={`${base}-titre`} className="at-panneau__titre at-panneau__titre--grand" data-titre-etape="" tabIndex={-1}>
          Cours publié
        </h2>
        <p className="at-publie__texte">
          <code>{resultat.chemin}</code> est sur GitHub{resultat.matiereCreee ? ', avec sa nouvelle matière' : ''}
          {resultat.medias.length ? ` et ${resultat.medias.length} fichier${resultat.medias.length > 1 ? 's' : ''} joint${resultat.medias.length > 1 ? 's' : ''}` : ''}. Le site sera à jour dans environ 2 minutes.
        </p>
        <div className="at-rangee">
          <a className="btn btn--secondaire" href={resultat.urlFichier} target="_blank" rel="noopener noreferrer">
            Voir le fichier
            <Icone nom="externe" taille={16} />
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
          <a className="btn btn--discret" href={URL_ACTIONS} target="_blank" rel="noopener noreferrer">
            Suivre la mise en ligne
            <Icone nom="externe" taille={16} />
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
        </div>
        <div className="at-actions at-actions--dans-carte">
          <span />
          <button type="button" className="btn btn--primaire btn--grand" onClick={recommencer}>
            <Icone nom="recommencer" />
            Créer un autre cours
          </button>
        </div>
      </section>
    );
  }

  const enCours = envoi === 'en-cours';

  return (
    <section className="carte at-panneau at-publier" aria-labelledby={`${base}-titre`}>
      <h2 id={`${base}-titre`} className="at-panneau__titre at-panneau__titre--grand" data-titre-etape="" tabIndex={-1}>
        Publier le cours
      </h2>

      <div className="at-fichier-final">
        <TuileFichier format="MD" genre="texte" />
        <div className="at-fichier__corps">
          <p className="at-fichier__nom">
            <code>{calcul.nomFichier}</code>
          </p>
          <p className="at-fichier__meta">
            dans <code>src/content/cours/{calcul.matiere}/</code>
          </p>
          <p className="at-fichier__meta">
            {data.titre}
            {calcul.nouvelle ? ` · nouvelle matière « ${calcul.nouvelle.nom} » (${calcul.nouvelle.kanji})` : ''}
          </p>
        </div>
      </div>

      {candidats.length > 0 && (
        <fieldset className="at-joints">
          <legend className="at-champ__label">Fichiers joints au cours</legend>
          <p className="at-champ__aide">Ils s’affichent dans la page du cours, rubrique Documents.</p>
          <ul role="list" className="at-pile at-pile--serree">
            {candidats.map((c) => {
              const local = mediasLocaux.find((m) => m.id === c.id);
              return (
                <li key={c.id}>
                  <label className="at-case">
                    <input
                      type="checkbox"
                      checked={b.joindre.includes(c.id)}
                      disabled={enCours}
                      onChange={(ev) => {
                        const oui = ev.target.checked;
                        maj((p) => ({ joindre: oui ? [...p.joindre, c.id] : p.joindre.filter((x) => x !== c.id) }));
                      }}
                    />
                    <span>
                      {c.nom}
                      <span className="at-case__aide">
                        {tailleLisible(c.taille)}
                        {local ? ` → public/media/${calcul.matiere}/${local.nomMedia}` : ''}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      )}

      {secrets.aJeton ? (
        <div className="at-pile">
          {(enCours || envoi === 'erreur') && (
            <ol className="at-avancement" role="list" aria-live="polite">
              {ETAPES_PUBLICATION.filter((e) => e.cle !== 'matiere' || calcul.nouvelle || avancement.matiere)
                .filter((e) => e.cle !== 'medias' || choisis.length > 0)
                .map((e) => {
                  const a = avancement[e.cle];
                  return (
                    <li key={e.cle} data-etat={a?.etat ?? 'attente'}>
                      <span className="at-avancement__icone" aria-hidden="true">
                        {a?.etat === 'fait' ? <Icone nom="coche" taille={14} /> : a?.etat === 'en-cours' ? <span className="at-roue" /> : null}
                      </span>
                      {e.libelle}
                      {a?.detail ? <span className="at-avancement__detail"> · {a.detail}</span> : null}
                      <span className="sr-only">{a?.etat === 'fait' ? ' : fait' : a?.etat === 'en-cours' ? ' : en cours' : ''}</span>
                    </li>
                  );
                })}
            </ol>
          )}
          {erreur && (
            <div className="at-message at-message--erreur" role="alert">
              <Icone nom="alerte" taille={18} />
              <div className="at-pile at-pile--serree">
                <span>{erreur.message}</span>
                {(erreur.code === 'jeton' || erreur.code === 'droits') && <a href={urlReglages}>Ouvrir les Réglages</a>}
              </div>
            </div>
          )}
          <div className="at-actions at-actions--dans-carte">
            <button type="button" className="btn btn--discret" onClick={telecharger} disabled={enCours}>
              <Icone nom="telecharger" />
              Télécharger le .md
            </button>
            <button type="button" className="btn btn--primaire btn--grand" onClick={() => void publier()} disabled={enCours}>
              {enCours ? <span className="at-roue at-roue--claire" aria-hidden="true" /> : <Icone nom="televerser" />}
              {enCours ? 'Publication…' : envoi === 'erreur' ? 'Réessayer' : 'Publier sur GitHub'}
            </button>
          </div>
          <p className="at-champ__aide">
            Dans {DEPOT.proprietaire}/{DEPOT.nom}, branche {DEPOT.branche}. Le numéro est revérifié sur GitHub juste avant l’envoi.
          </p>
        </div>
      ) : (
        <div className="at-pile">
          <div className="at-note at-note--info">
            <span className="at-note__kanji" lang="ja" aria-hidden="true">
              知
            </span>
            <div className="at-note__corps">
              <p className="at-note__titre">Range le fichier dans le repo</p>
              <p className="at-note__texte">
                Mets <code>{calcul.nomFichier}</code> dans <code>src/content/cours/{calcul.matiere}/</code>
                {calcul.nouvelle ? (
                  <>
                    , et la matière dans <code>{cheminMatiere(calcul.matiere)}</code>
                  </>
                ) : null}
                {mediasLocaux.length ? (
                  <>
                    , les fichiers joints dans <code>public/media/{calcul.matiere}/</code>
                  </>
                ) : null}
                , puis commit et push. Pour publier d’ici, ajoute un jeton GitHub dans les <a href={urlReglages}>Réglages</a>.
              </p>
            </div>
          </div>
          <div className="at-actions at-actions--dans-carte">
            <div className="at-rangee at-rangee--serree">
              {calcul.nouvelle && (
                <button type="button" className="btn btn--discret" onClick={() => calcul.nouvelle && telechargerTexte(`${calcul.matiere}.yaml`, yamlMatiere(calcul.nouvelle), 'text/yaml;charset=utf-8')}>
                  <Icone nom="telecharger" />
                  Matière (.yaml)
                </button>
              )}
              {mediasLocaux.map((m) => (
                <button key={m.id} type="button" className="btn btn--discret" onClick={() => telechargerMedia(m.id, m.nomMedia)}>
                  <Icone nom="telecharger" />
                  {m.nomMedia}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn--primaire btn--grand" onClick={telecharger}>
              <Icone nom="telecharger" />
              Télécharger le .md
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
