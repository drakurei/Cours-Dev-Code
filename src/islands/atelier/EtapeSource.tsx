/**
 * Étape 1 — Source : fichiers (PDF, images, .md/.txt), texte collé ou repo GitHub,
 * puis les choix du cours (matière, type, niveau, consigne).
 */
import { useId, useRef, useState, type ClipboardEvent, type DragEvent } from 'react';
import { NOUVELLE_MATIERE, type ImageSource, type OngletSource, type PdfSource } from '../../lib/atelier/brouillon.ts';
import { tailleLisible } from '../../lib/atelier/base64.ts';
import { lireRepoPublic, ErreurGitHub } from '../../lib/atelier/github.ts';
import { slugMatiere } from '../../lib/atelier/source.ts';
import { lireSecrets } from '../../lib/store.ts';
import { NIVEAUX_LIBELLES, TYPES_LIBELLES } from '../../lib/libelles.ts';
import { NIVEAUX, TYPES } from '../../lib/schema.ts';
import { annoncer, nombreFr, nouvelId, useAtelier } from './contexte.ts';
import Icone from './Icone.tsx';
import Segments, { idOnglet, idPanneau } from './Segments.tsx';

const ACCEPTE = '.pdf,.png,.jpg,.jpeg,.webp,.md,.markdown,.txt,application/pdf,image/png,image/jpeg,image/webp,text/markdown,text/plain';
const MAX_TEXTE = 2 * 1024 * 1024;
const MAX_PDF = 60 * 1024 * 1024;

type Genre = 'pdf' | 'image' | 'texte' | null;
function genreDe(f: File): Genre {
  const nom = f.name.toLowerCase();
  if (f.type === 'application/pdf' || nom.endsWith('.pdf')) return 'pdf';
  if (/^image\/(png|jpeg|webp)$/.test(f.type) || /\.(png|jpe?g|webp)$/.test(nom)) return 'image';
  if (/^text\//.test(f.type) || /\.(md|markdown|txt)$/.test(nom)) return 'texte';
  return null;
}

/** Tuile « page » avec le format (PDF, PNG, MD…), comme dans la maquette. */
export function TuileFichier({ format, genre }: { format: string; genre: 'pdf' | 'image' | 'texte' }) {
  return (
    <span className="at-tuile" data-genre={genre} aria-hidden="true">
      {format}
    </span>
  );
}

export default function EtapeSource() {
  const { b, maj, binaires, poserBinaire, allerA } = useAtelier();
  const base = useId();
  const champFichiers = useRef<HTMLInputElement>(null);
  const [survol, setSurvol] = useState(false);
  const [enCours, setEnCours] = useState<Record<string, string>>({});
  const [erreurs, setErreurs] = useState<string[]>([]);
  const [lectureRepo, setLectureRepo] = useState<string | null>(null);
  const [erreurRepo, setErreurRepo] = useState<string | null>(null);

  const etat = (id: string, message: string | null) =>
    setEnCours((e) => {
      const copie = { ...e };
      if (message === null) delete copie[id];
      else copie[id] = message;
      return copie;
    });

  // ─── Fichiers ───────────────────────────────────────────────────────────
  async function ajouterFichiers(liste: File[]) {
    const problemes: string[] = [];
    for (const f of liste) {
      const genre = genreDe(f);
      if (!genre) {
        problemes.push(`${f.name} : format non pris en charge (PDF, PNG, JPG, WEBP, .md ou .txt).`);
        continue;
      }
      if (genre === 'texte') {
        if (f.size > MAX_TEXTE) {
          problemes.push(`${f.name} : texte trop long (2 Mo au plus).`);
          continue;
        }
        const contenu = (await f.text()).replace(/^﻿/, '').replace(/\r\n?/g, '\n');
        maj((p) => ({ textesFichiers: [...p.textesFichiers, { id: nouvelId('txt'), nom: f.name, contenu }] }));
        annoncer(`${f.name} ajouté.`);
        continue;
      }
      if (genre === 'pdf') {
        if (f.size > MAX_PDF) {
          problemes.push(`${f.name} : PDF trop lourd (60 Mo au plus).`);
          continue;
        }
        const id = nouvelId('pdf');
        etat(id, `Lecture de ${f.name}…`);
        try {
          const octets = new Uint8Array(await f.arrayBuffer());
          const { lirePdf, vignettesPdf } = await import('../../lib/atelier/pdf.ts');
          const lu = await lirePdf(octets);
          const vignettes = await vignettesPdf(octets, 3).catch(() => []);
          poserBinaire(id, { octets, type: 'application/pdf', vignettes });
          const pdf: PdfSource = { id, nom: f.name, taille: f.size, pages: lu.pages, textes: lu.textes, scanne: lu.scanne, inclureTexte: !lu.scanne, enImages: false };
          maj((p) => ({ pdfs: [...p.pdfs, pdf], joindre: [...p.joindre, id] }));
          annoncer(`${f.name} : ${lu.pages} page${lu.pages > 1 ? 's' : ''}${lu.scanne ? ', presque pas de texte (PDF scanné)' : ', texte extrait'}.`);
        } catch (e) {
          const motDePasse = e instanceof Error && /password/i.test(`${e.name} ${e.message}`);
          problemes.push(`${f.name} : ${motDePasse ? 'PDF protégé par un mot de passe' : 'PDF illisible (fichier abîmé ?)'}.`);
        } finally {
          etat(id, null);
        }
        continue;
      }
      // Image
      const id = nouvelId('img');
      etat(id, `Préparation de ${f.name}…`);
      try {
        const { preparerImage } = await import('../../lib/atelier/images.ts');
        const im = await preparerImage(f);
        const octets = new Uint8Array(await im.blob.arrayBuffer());
        poserBinaire(id, { octets, type: im.type, vignettes: [im.vignette] });
        const image: ImageSource = { id, nom: f.name, taille: octets.length, type: im.type, largeur: im.largeur, hauteur: im.hauteur, redimensionnee: im.redimensionnee };
        maj((p) => ({ images: [...p.images, image], joindre: [...p.joindre, id] }));
        annoncer(`${f.name} ajoutée${im.redimensionnee ? ', réduite à 2000 px' : ''}.`);
      } catch (e) {
        problemes.push(`${f.name} : ${e instanceof Error ? e.message : 'image illisible'}.`);
      } finally {
        etat(id, null);
      }
    }
    setErreurs(problemes);
    if (problemes.length) annoncer(problemes.join(' '));
  }

  function retirer(id: string) {
    const derivees = b.images.filter((i) => i.depuisPdf === id).map((i) => i.id);
    for (const x of [id, ...derivees]) poserBinaire(x, null);
    maj((p) => ({
      pdfs: p.pdfs.filter((x) => x.id !== id),
      images: p.images.filter((x) => x.id !== id && x.depuisPdf !== id),
      textesFichiers: p.textesFichiers.filter((x) => x.id !== id),
      joindre: p.joindre.filter((x) => x !== id && !derivees.includes(x)),
    }));
    annoncer('Fichier retiré.');
  }

  async function pagesEnImages(pdf: PdfSource) {
    const bin = binaires.get(pdf.id);
    if (!bin) return;
    etat(pdf.id, 'Rendu des pages…');
    try {
      const outils = await import('../../lib/atelier/pdf.ts');
      const { vignetteDe } = await import('../../lib/atelier/images.ts');
      const pages = await outils.pagesEnImages(bin.octets, 1600, outils.MAX_PAGES_IMAGES, (n, total) => etat(pdf.id, `Rendu de la page ${n} sur ${total}…`));
      const racine = pdf.nom.replace(/\.pdf$/i, '');
      const nouvelles: ImageSource[] = [];
      for (const p of pages) {
        const id = nouvelId('pg');
        const octets = new Uint8Array(await p.blob.arrayBuffer());
        poserBinaire(id, { octets, type: 'image/png', vignettes: [await vignetteDe(p.blob).catch(() => '')] });
        nouvelles.push({ id, nom: `${racine}-p${String(p.page).padStart(2, '0')}.png`, taille: octets.length, type: 'image/png', largeur: p.largeur, hauteur: p.hauteur, redimensionnee: false, depuisPdf: pdf.id });
      }
      maj((prev) => ({ images: [...prev.images, ...nouvelles], pdfs: prev.pdfs.map((x) => (x.id === pdf.id ? { ...x, enImages: true } : x)) }));
      annoncer(`${pages.length} pages transformées en images${pdf.pages > pages.length ? ` (les ${pages.length} premières)` : ''}.`);
    } catch {
      setErreurs([`${pdf.nom} : impossible de rendre les pages en images.`]);
    } finally {
      etat(pdf.id, null);
    }
  }

  function annulerImages(pdf: PdfSource) {
    for (const i of b.images) if (i.depuisPdf === pdf.id) poserBinaire(i.id, null);
    maj((p) => ({ images: p.images.filter((i) => i.depuisPdf !== pdf.id), pdfs: p.pdfs.map((x) => (x.id === pdf.id ? { ...x, enImages: false } : x)) }));
  }

  const surDepot = (ev: DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    setSurvol(false);
    const fichiers = [...ev.dataTransfer.files];
    if (fichiers.length) void ajouterFichiers(fichiers);
    else {
      const texte = ev.dataTransfer.getData('text/plain');
      if (texte.trim()) maj((p) => ({ texte: p.texte ? `${p.texte}\n\n${texte}` : texte, ongletSource: 'texte' }));
    }
  };

  const surColler = (ev: ClipboardEvent<HTMLDivElement>) => {
    const fichiers = [...ev.clipboardData.files];
    if (fichiers.length) {
      ev.preventDefault();
      void ajouterFichiers(fichiers);
    }
  };

  // ─── Repo ───────────────────────────────────────────────────────────────
  async function lireRepo() {
    setErreurRepo(null);
    setLectureRepo('Lecture du repo…');
    try {
      const repo = await lireRepoPublic(b.repoSaisie, { jeton: lireSecrets().githubToken }, setLectureRepo);
      maj({ repo });
      annoncer(`${repo.slug} lu : ${repo.fichiers.length} fichiers clés.`);
    } catch (e) {
      setErreurRepo(e instanceof ErreurGitHub ? e.message : 'Lecture impossible : réessaie dans un moment.');
    } finally {
      setLectureRepo(null);
    }
  }

  const fichiersVisibles = b.pdfs.length + b.images.filter((i) => !i.depuisPdf).length + b.textesFichiers.length;
  const enCoursListe = Object.entries(enCours);
  const pdfsEnCours = new Set(enCoursListe.map(([id]) => id));

  return (
    <div className="at-etape-source">
      <div className="at-colonnes">
        <section className="carte at-panneau" aria-labelledby={`${base}-titre-source`}>
          <div className="at-panneau__tete">
            <h2 id={`${base}-titre-source`} className="at-panneau__titre" data-titre-etape="" tabIndex={-1}>
              Ta source
            </h2>
            <Segments<OngletSource>
              idBase={`${base}-source`}
              label="Type de source"
              valeur={b.ongletSource}
              onChange={(v) => maj({ ongletSource: v })}
              options={[
                { valeur: 'fichiers', libelle: 'Fichiers', badge: fichiersVisibles },
                { valeur: 'texte', libelle: 'Texte', badge: b.texte.trim() ? 1 : 0 },
                { valeur: 'repo', libelle: 'Repo GitHub', badge: b.repo ? 1 : 0 },
              ]}
            />
          </div>

          {/* Fichiers */}
          <div
            role="tabpanel"
            id={idPanneau(`${base}-source`, 'fichiers')}
            aria-labelledby={idOnglet(`${base}-source`, 'fichiers')}
            hidden={b.ongletSource !== 'fichiers'}
            className="at-pile"
          >
            <div
              className="at-depot"
              data-survol={survol ? '' : undefined}
              onDragOver={(ev) => {
                ev.preventDefault();
                setSurvol(true);
              }}
              onDragLeave={() => setSurvol(false)}
              onDrop={surDepot}
              onPaste={surColler}
            >
              <span className="at-depot__icone" aria-hidden="true">
                <Icone nom="televerser" taille={26} />
              </span>
              <p className="at-depot__titre">Dépose ici un PDF, des images ou un fichier .md</p>
              <p className="at-depot__aide">Photo du tableau, capture de slides, notes… Tu peux aussi coller une capture (Ctrl V).</p>
              <button type="button" className="btn btn--secondaire" onClick={() => champFichiers.current?.click()}>
                <Icone nom="document" />
                Choisir des fichiers
              </button>
              <input
                ref={champFichiers}
                type="file"
                multiple
                accept={ACCEPTE}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(ev) => {
                  const liste = [...(ev.target.files ?? [])];
                  ev.target.value = '';
                  if (liste.length) void ajouterFichiers(liste);
                }}
              />
            </div>

            <div aria-live="polite" className="at-pile at-pile--serree">
              {enCoursListe
                .filter(([id]) => !b.pdfs.some((p) => p.id === id))
                .map(([id, message]) => (
                  <p key={id} className="at-ligne-etat">
                    <span className="at-roue" aria-hidden="true" />
                    {message}
                  </p>
                ))}
              {erreurs.map((e) => (
                <p key={e} className="at-message at-message--erreur">
                  <Icone nom="alerte" taille={18} />
                  {e}
                </p>
              ))}
            </div>

            {fichiersVisibles > 0 && (
              <ul className="at-fichiers" role="list">
                {b.pdfs.map((p) => {
                  const bin = binaires.get(p.id);
                  const pages = b.images.filter((i) => i.depuisPdf === p.id);
                  const aTexte = !p.scanne && p.textes.some((t) => t.trim());
                  return (
                    <li key={p.id} className="at-fichier">
                      <TuileFichier format="PDF" genre="pdf" />
                      <div className="at-fichier__corps">
                        <p className="at-fichier__nom">{p.nom}</p>
                        <p className={`at-fichier__meta${p.scanne ? ' at-fichier__meta--alerte' : ' at-fichier__meta--ok'}`}>
                          <Icone nom={p.scanne ? 'alerte' : 'coche'} taille={15} />
                          {p.pages} page{p.pages > 1 ? 's' : ''} · {p.scanne ? 'presque pas de texte (PDF scanné)' : 'texte extrait'} · {tailleLisible(p.taille)}
                        </p>
                        {bin && bin.vignettes.length > 0 && (
                          <div className="at-vignettes" aria-hidden="true">
                            {bin.vignettes.map((v, i) => (
                              <img key={i} src={v} alt="" width={52} height={70} />
                            ))}
                            {p.pages > bin.vignettes.length && <span className="at-vignettes__plus">+{p.pages - bin.vignettes.length}</span>}
                          </div>
                        )}
                        {aTexte && (
                          <label className="at-case">
                            <input
                              type="checkbox"
                              checked={p.inclureTexte}
                              onChange={(ev) => {
                                const v = ev.target.checked;
                                maj((prev) => ({ pdfs: prev.pdfs.map((x) => (x.id === p.id ? { ...x, inclureTexte: v } : x)) }));
                              }}
                            />
                            <span>
                              Mettre le texte dans le prompt
                              <span className="at-case__aide">Sinon, joins le PDF dans ton IA.</span>
                            </span>
                          </label>
                        )}
                        {p.scanne && bin && !p.enImages && (
                          <div className="at-fichier__action">
                            <p className="at-fichier__aide">Pour Claude, rends les pages en images (20 au plus).</p>
                            <button type="button" className="btn btn--secondaire" disabled={pdfsEnCours.has(p.id)} onClick={() => void pagesEnImages(p)}>
                              <Icone nom="pages" />
                              Transformer en images
                            </button>
                          </div>
                        )}
                        {p.enImages && (
                          <p className="at-fichier__aide">
                            {pages.length} page{pages.length > 1 ? 's' : ''} en images.{' '}
                            <button type="button" className="at-lien" onClick={() => annulerImages(p)}>
                              Annuler
                            </button>
                          </p>
                        )}
                        {!bin && <p className="at-fichier__aide">Fichier à redéposer pour l’envoyer (le brouillon garde seulement son texte).</p>}
                        {enCours[p.id] && (
                          <p className="at-ligne-etat" aria-live="polite">
                            <span className="at-roue" aria-hidden="true" />
                            {enCours[p.id]}
                          </p>
                        )}
                      </div>
                      <button type="button" className="btn btn--icone btn--discret at-fichier__retirer" aria-label={`Retirer ${p.nom}`} onClick={() => retirer(p.id)}>
                        <Icone nom="corbeille" />
                      </button>
                    </li>
                  );
                })}
                {b.images
                  .filter((i) => !i.depuisPdf)
                  .map((im) => {
                    const bin = binaires.get(im.id);
                    const vignette = bin?.vignettes[0];
                    return (
                      <li key={im.id} className="at-fichier">
                        {vignette ? <img className="at-fichier__image" src={vignette} alt="" width={44} height={56} /> : <TuileFichier format={im.type.split('/')[1]?.toUpperCase().replace('JPEG', 'JPG') ?? 'IMG'} genre="image" />}
                        <div className="at-fichier__corps">
                          <p className="at-fichier__nom">{im.nom}</p>
                          <p className="at-fichier__meta">
                            {nombreFr(im.largeur)} × {nombreFr(im.hauteur)} px{im.redimensionnee ? ' · réduite à 2000 px' : ''} · {tailleLisible(im.taille)}
                          </p>
                          {!bin && <p className="at-fichier__aide">Image à redéposer pour l’envoyer.</p>}
                        </div>
                        <button type="button" className="btn btn--icone btn--discret at-fichier__retirer" aria-label={`Retirer ${im.nom}`} onClick={() => retirer(im.id)}>
                          <Icone nom="corbeille" />
                        </button>
                      </li>
                    );
                  })}
                {b.textesFichiers.map((t) => (
                  <li key={t.id} className="at-fichier">
                    <TuileFichier format={t.nom.toLowerCase().endsWith('.txt') ? 'TXT' : 'MD'} genre="texte" />
                    <div className="at-fichier__corps">
                      <p className="at-fichier__nom">{t.nom}</p>
                      <p className="at-fichier__meta">{nombreFr(t.contenu.length)} caractères</p>
                    </div>
                    <button type="button" className="btn btn--icone btn--discret at-fichier__retirer" aria-label={`Retirer ${t.nom}`} onClick={() => retirer(t.id)}>
                      <Icone nom="corbeille" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Texte */}
          <div
            role="tabpanel"
            id={idPanneau(`${base}-source`, 'texte')}
            aria-labelledby={idOnglet(`${base}-source`, 'texte')}
            hidden={b.ongletSource !== 'texte'}
            className="at-champ"
          >
            <label htmlFor={`${base}-texte`} className="at-champ__label">
              Ton texte
            </label>
            <textarea
              id={`${base}-texte`}
              className="at-saisie at-saisie--texte"
              rows={12}
              value={b.texte}
              placeholder="Colle ici tes notes, un cours, un énoncé de TP…"
              aria-describedby={`${base}-texte-aide`}
              onChange={(ev) => maj({ texte: ev.target.value })}
            />
            <p id={`${base}-texte-aide`} className="at-champ__aide">
              {b.texte.trim() ? `${nombreFr(b.texte.length)} caractères.` : 'Le Markdown est accepté.'}
            </p>
          </div>

          {/* Repo */}
          <div
            role="tabpanel"
            id={idPanneau(`${base}-source`, 'repo')}
            aria-labelledby={idOnglet(`${base}-source`, 'repo')}
            hidden={b.ongletSource !== 'repo'}
            className="at-pile"
          >
            <form
              className="at-champ"
              onSubmit={(ev) => {
                ev.preventDefault();
                if (!lectureRepo) void lireRepo();
              }}
            >
              <label htmlFor={`${base}-repo`} className="at-champ__label">
                Repo GitHub public
              </label>
              <div className="at-rangee-saisie">
                <input
                  id={`${base}-repo`}
                  className="at-saisie"
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  autoCapitalize="off"
                  placeholder="drakurei/tp-react-blog"
                  value={b.repoSaisie}
                  aria-describedby={`${base}-repo-aide`}
                  aria-invalid={erreurRepo ? true : undefined}
                  onChange={(ev) => maj({ repoSaisie: ev.target.value })}
                />
                <button type="submit" className="btn btn--secondaire" disabled={!b.repoSaisie.trim() || lectureRepo !== null}>
                  <Icone nom="branche" />
                  Lire le repo
                </button>
              </div>
              <p id={`${base}-repo-aide`} className="at-champ__aide">
                Propriétaire/nom ou lien. Manabi lit le README, le package.json, l’arborescence et jusqu’à 8 fichiers clés.
              </p>
            </form>
            <div aria-live="polite">
              {lectureRepo && (
                <p className="at-ligne-etat">
                  <span className="at-roue" aria-hidden="true" />
                  {lectureRepo}
                </p>
              )}
              {erreurRepo && (
                <p className="at-message at-message--erreur">
                  <Icone nom="alerte" taille={18} />
                  {erreurRepo}
                </p>
              )}
            </div>
            {b.repo && (
              <div className="at-fichier at-fichier--repo">
                <span className="at-tuile" data-genre="repo" aria-hidden="true">
                  <Icone nom="branche" taille={20} />
                </span>
                <div className="at-fichier__corps">
                  <p className="at-fichier__nom">{b.repo.slug}</p>
                  {b.repo.description && <p className="at-fichier__meta">{b.repo.description}</p>}
                  <p className="at-fichier__meta at-fichier__meta--ok">
                    <Icone nom="coche" taille={15} />
                    {[b.repo.readme ? 'README' : null, b.repo.packageJson ? 'package.json' : null, `${b.repo.fichiers.length} fichier${b.repo.fichiers.length > 1 ? 's' : ''} clé${b.repo.fichiers.length > 1 ? 's' : ''}`, `${nombreFr(b.repo.totalFichiers)} fichiers au total`]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {b.repo.fichiers.length > 0 && (
                    <ul className="at-liste-code" role="list">
                      {b.repo.fichiers.map((f) => (
                        <li key={f.chemin}>{f.chemin}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <button type="button" className="btn btn--icone btn--discret at-fichier__retirer" aria-label={`Retirer ${b.repo.slug}`} onClick={() => maj({ repo: null })}>
                  <Icone nom="corbeille" />
                </button>
              </div>
            )}
          </div>
        </section>

        <ChoixDuCours />
      </div>

      <div className="at-actions">
        <p className="at-actions__aide">
          {fichiersVisibles + (b.texte.trim() ? 1 : 0) + (b.repo ? 1 : 0) === 0
            ? 'Pas de source ? Tu pourras la coller dans l’IA, après le prompt.'
            : 'Tout est gardé dans ce navigateur, même si tu fermes la page.'}
        </p>
        <button type="button" className="btn btn--primaire btn--grand" onClick={() => allerA(2)}>
          Continuer
          <Icone nom="fleche-droite" />
        </button>
      </div>
    </div>
  );
}

/** Les choix du cours : matière, type, niveau, consigne (liste groupée façon Réglages iOS). */
export function ChoixDuCours() {
  const { b, maj, matieres } = useAtelier();
  const base = useId();
  const slug = slugMatiere(b);
  return (
    <section className="carte at-panneau at-choix" aria-labelledby={`${base}-titre`}>
      <h2 id={`${base}-titre`} className="at-panneau__titre">
        Ton cours
      </h2>
      <div className="at-champ">
        <label htmlFor={`${base}-matiere`} className="at-champ__label">
          Matière
        </label>
        <div className="at-select">
          <select id={`${base}-matiere`} className="at-saisie" value={b.matiere} onChange={(ev) => maj({ matiere: ev.target.value })}>
            <option value="">L’IA choisit</option>
            {matieres.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.nom}
              </option>
            ))}
            <option value={NOUVELLE_MATIERE}>Nouvelle matière…</option>
          </select>
          <Icone nom="chevron-droite" taille={16} className="at-select__chevron" />
        </div>
      </div>
      {b.matiere === NOUVELLE_MATIERE && (
        <div className="at-champ">
          <label htmlFor={`${base}-nouvelle`} className="at-champ__label">
            Nom de la nouvelle matière
          </label>
          <input
            id={`${base}-nouvelle`}
            className="at-saisie"
            type="text"
            placeholder="Docker"
            value={b.nomNouvelleMatiere}
            aria-describedby={`${base}-nouvelle-aide`}
            onChange={(ev) => maj({ nomNouvelleMatiere: ev.target.value })}
          />
          <p id={`${base}-nouvelle-aide`} className="at-champ__aide">
            {slug ? (
              <>
                Dossier : <code>{slug}</code>. L’IA propose le kanji et la couleur du tome.
              </>
            ) : (
              'L’IA propose le kanji et la couleur du tome.'
            )}
          </p>
        </div>
      )}
      <div className="at-champ-duo">
        <div className="at-champ">
          <label htmlFor={`${base}-type`} className="at-champ__label">
            Type
          </label>
          <div className="at-select">
            <select id={`${base}-type`} className="at-saisie" value={b.type} onChange={(ev) => maj({ type: ev.target.value })}>
              <option value="">L’IA choisit</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPES_LIBELLES[t]}
                </option>
              ))}
            </select>
            <Icone nom="chevron-droite" taille={16} className="at-select__chevron" />
          </div>
        </div>
        <div className="at-champ">
          <label htmlFor={`${base}-niveau`} className="at-champ__label">
            Niveau
          </label>
          <div className="at-select">
            <select id={`${base}-niveau`} className="at-saisie" value={b.niveau} onChange={(ev) => maj({ niveau: ev.target.value })}>
              <option value="">L’IA choisit</option>
              {NIVEAUX.map((n) => (
                <option key={n} value={n}>
                  {NIVEAUX_LIBELLES[n]}
                </option>
              ))}
            </select>
            <Icone nom="chevron-droite" taille={16} className="at-select__chevron" />
          </div>
        </div>
      </div>
      <div className="at-champ">
        <label htmlFor={`${base}-consigne`} className="at-champ__label">
          Ce que je veux
        </label>
        <textarea
          id={`${base}-consigne`}
          className="at-saisie"
          rows={3}
          placeholder="Ex. court, avec un exemple tiré de mon-blog."
          value={b.consigne}
          onChange={(ev) => maj({ consigne: ev.target.value })}
        />
      </div>
    </section>
  );
}
