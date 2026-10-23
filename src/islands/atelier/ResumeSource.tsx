/**
 * Colonnes de rappel : « Ta source » (étape Générer) et « Ton cours » (étape Publier).
 */
import { useId } from 'react';
import { KANJI_SECTIONS } from '../../lib/kanji.ts';
import { NOUVELLE_MATIERE } from '../../lib/atelier/brouillon.ts';
import { NIVEAUX_LIBELLES, TYPES_LIBELLES } from '../../lib/libelles.ts';
import type { Niveau, TypeCours } from '../../lib/schema.ts';
import { nombreFr, useAtelier } from './contexte.ts';
import Icone from './Icone.tsx';
import { TuileFichier } from './EtapeSource.tsx';

export default function ResumeSource() {
  const { b, allerA, binaires, matieres } = useAtelier();
  const base = useId();
  const matiere = matieres.find((m) => m.slug === b.matiere);
  const pdf = b.pdfs[0];
  const vignettes = pdf ? (binaires.get(pdf.id)?.vignettes ?? []) : [];
  const images = b.images.filter((i) => !i.depuisPdf);

  const elements: { cle: string; format: string; genre: 'pdf' | 'image' | 'texte' | 'repo'; nom: string; meta: string; alerte?: boolean }[] = [
    ...b.pdfs.map((p) => ({
      cle: p.id,
      format: 'PDF',
      genre: 'pdf' as const,
      nom: p.nom,
      meta: `${p.pages} page${p.pages > 1 ? 's' : ''} · ${p.enImages ? 'pages en images' : p.scanne ? 'PDF scanné' : 'texte extrait'}`,
      alerte: p.scanne && !p.enImages,
    })),
    ...images.map((i) => ({ cle: i.id, format: 'IMG', genre: 'image' as const, nom: i.nom, meta: `${nombreFr(i.largeur)} × ${nombreFr(i.hauteur)} px` })),
    ...b.textesFichiers.map((t) => ({ cle: t.id, format: 'MD', genre: 'texte' as const, nom: t.nom, meta: `${nombreFr(t.contenu.length)} caractères` })),
    ...(b.texte.trim() ? [{ cle: 'texte', format: 'TXT', genre: 'texte' as const, nom: 'Texte collé', meta: `${nombreFr(b.texte.trim().length)} caractères` }] : []),
    ...(b.repo ? [{ cle: 'repo', format: '', genre: 'repo' as const, nom: b.repo.slug, meta: `${b.repo.fichiers.length} fichiers clés lus` }] : []),
  ];

  return (
    <section className="carte at-panneau at-resume" aria-labelledby={`${base}-titre`}>
      <div className="at-resume__tete">
        <h2 id={`${base}-titre`} className="at-panneau__titre">
          Ta source
        </h2>
        <button type="button" className="btn btn--discret" onClick={() => allerA(1)}>
          Modifier
          <span className="sr-only"> la source</span>
        </button>
      </div>

      {elements.length === 0 ? (
        <p className="at-resume__vide">Pas encore de source : colle-la dans l’IA, juste après le prompt.</p>
      ) : (
        <ul className="at-resume__liste" role="list">
          {elements.slice(0, 4).map((e) => (
            <li key={e.cle} className="at-resume__element">
              {e.genre === 'repo' ? (
                <span className="at-tuile" data-genre="repo" aria-hidden="true">
                  <Icone nom="branche" taille={18} />
                </span>
              ) : (
                <TuileFichier format={e.format} genre={e.genre} />
              )}
              <span className="at-resume__textes">
                <span className="at-resume__nom">{e.nom}</span>
                <span className={`at-resume__meta${e.alerte ? ' at-resume__meta--alerte' : ' at-resume__meta--ok'}`}>
                  <Icone nom={e.alerte ? 'alerte' : 'coche'} taille={14} />
                  {e.meta}
                </span>
              </span>
            </li>
          ))}
          {elements.length > 4 && <li className="at-resume__plus">et {elements.length - 4} de plus</li>}
        </ul>
      )}

      {vignettes.length > 0 && pdf && (
        <div className="at-vignettes" aria-hidden="true">
          {vignettes.map((v, i) => (
            <img key={i} src={v} alt="" width={52} height={70} />
          ))}
          {pdf.pages > vignettes.length && <span className="at-vignettes__plus">+{pdf.pages - vignettes.length}</span>}
        </div>
      )}

      <dl className="at-resume__choix">
        <div>
          <dt>Matière</dt>
          <dd>
            {matiere ? (
              <>
                <span className="badge-kanji badge-kanji--xs" data-couleur={matiere.couleur} lang="ja" aria-hidden="true">
                  {matiere.kanji}
                </span>
                {matiere.nom}
              </>
            ) : b.matiere === NOUVELLE_MATIERE ? (
              b.nomNouvelleMatiere.trim() || 'Nouvelle matière'
            ) : (
              'L’IA choisit'
            )}
          </dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{TYPES_LIBELLES[b.type as TypeCours] ?? 'L’IA choisit'}</dd>
        </div>
        <div>
          <dt>Niveau</dt>
          <dd>{NIVEAUX_LIBELLES[b.niveau as Niveau] ?? 'L’IA choisit'}</dd>
        </div>
        {b.consigne.trim() && (
          <div className="at-resume__consigne">
            <dt>Ce que je veux</dt>
            <dd>{b.consigne.trim()}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}

/** « Ton cours » : ce qui va être publié (titre, matière, contenu). */
export function ResumeCours() {
  const { diagnostic, matieres, allerA } = useAtelier();
  const base = useId();
  const r = diagnostic?.resume;
  const data = diagnostic?.data;
  if (!r || !data) return null;
  const matiere = matieres.find((m) => m.slug === r.matiere);
  const lignes = [
    { cle: 'notions', kanji: '話', libelle: 'Notions', n: r.notions },
    { cle: 'definitions', kanji: KANJI_SECTIONS.definition.kanji, libelle: 'Définitions', n: r.definitions },
    { cle: 'flashcards', kanji: KANJI_SECTIONS.flashcard.kanji, libelle: 'Flashcards', n: r.flashcards },
    { cle: 'quiz', kanji: KANJI_SECTIONS.quiz.kanji, libelle: 'Questions de quiz', n: r.quiz },
    { cle: 'exercices', kanji: KANJI_SECTIONS.exercice.kanji, libelle: 'Exercices', n: r.exercices },
  ];
  return (
    <section className="carte at-panneau at-resume" aria-labelledby={`${base}-titre`}>
      <div className="at-resume__tete">
        <h2 id={`${base}-titre`} className="at-panneau__titre">
          Ton cours
        </h2>
        <button type="button" className="btn btn--discret" onClick={() => allerA(3)}>
          Modifier
          <span className="sr-only"> le cours</span>
        </button>
      </div>
      <p className="at-resume__titre-cours">{data.titre}</p>
      <dl className="at-resume__choix">
        <div>
          <dt>Matière</dt>
          <dd>
            <span className="badge-kanji badge-kanji--xs" data-couleur={matiere?.couleur ?? 'sumi'} lang="ja" aria-hidden="true">
              {matiere?.kanji ?? (r.matiere.charAt(0).toUpperCase() || '?')}
            </span>
            {matiere?.nom ?? r.matiere}
          </dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{TYPES_LIBELLES[data.type]}</dd>
        </div>
        <div>
          <dt>Niveau</dt>
          <dd>{NIVEAUX_LIBELLES[data.niveau]}</dd>
        </div>
        {lignes.map((l) => (
          <div key={l.cle}>
            <dt>
              <span className="at-resume__kanji" lang="ja" aria-hidden="true">
                {l.kanji}
              </span>
              {l.libelle}
            </dt>
            <dd>{l.n}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
