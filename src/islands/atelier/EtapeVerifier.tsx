/**
 * Étape 3 — Vérifier : coller / éditer la réponse, réparer automatiquement,
 * validation en direct (même schéma que le build), erreurs cliquables, aperçu.
 */
import { useId, useMemo, useRef, useState } from 'react';
import { reparerCours } from '../../lib/atelier/reparer.ts';
import type { Probleme, Resume as ResumeCours } from '../../lib/atelier/analyse.ts';
import { KANJI_SECTIONS } from '../../lib/kanji.ts';
import { annoncer, nombreFr, useAtelier } from './contexte.ts';
import Apercu from './Apercu.tsx';
import Editeur, { type EditeurApi } from './Editeur.tsx';
import Icone from './Icone.tsx';
import Segments, { idOnglet, idPanneau } from './Segments.tsx';

type Vue = 'texte' | 'apercu';

const pluriel = (n: number, mot: string) => `${nombreFr(n)} ${mot}${n > 1 ? 's' : ''}`;

export default function EtapeVerifier() {
  const { b, maj, diagnostic, allerA, reparationsAuto } = useAtelier();
  const base = useId();
  const editeur = useRef<EditeurApi>(null);
  const [vue, setVue] = useState<Vue>('texte');
  const [reparation, setReparation] = useState<{ avant: string; corrections: string[] } | null>(null);

  const apresReparation = useMemo(() => (b.reponse.trim() ? reparerCours(b.reponse) : null), [b.reponse]);
  const reparable = !!apresReparation && apresReparation.corrections.length > 0 && apresReparation.texte !== b.reponse;
  const lignesErreur = useMemo(() => new Set((diagnostic?.erreurs ?? []).map((e) => e.ligne).filter((l): l is number => l !== null)), [diagnostic]);
  const lignesAvert = useMemo(() => new Set((diagnostic?.avertissements ?? []).map((e) => e.ligne).filter((l): l is number => l !== null)), [diagnostic]);

  const reparer = () => {
    if (!apresReparation) return;
    if (!reparable) {
      setReparation({ avant: b.reponse, corrections: [] });
      annoncer('Rien à réparer automatiquement.');
      return;
    }
    setReparation({ avant: b.reponse, corrections: apresReparation.corrections });
    maj({ reponse: apresReparation.texte });
    annoncer(`Réparé : ${apresReparation.corrections.join(', ')}.`);
  };

  const allerA_Ligne = (p: Probleme) => {
    if (p.ligne === null) return;
    setVue('texte');
    window.requestAnimationFrame(() => editeur.current?.allerALaLigne(p.ligne ?? 1));
  };

  const vide = !b.reponse.trim();
  const nbErreurs = diagnostic?.erreurs.length ?? 0;
  const resume = diagnostic?.resume;

  return (
    <section className="carte at-panneau at-verifier" aria-labelledby={`${base}-titre`}>
      <div className="at-panneau__tete">
        <h2 id={`${base}-titre`} className="at-panneau__titre at-panneau__titre--grand" data-titre-etape="" tabIndex={-1}>
          Vérifier le cours
        </h2>
        {!vide && (
          <Segments<Vue>
            idBase={`${base}-vue`}
            label="Affichage"
            valeur={vue}
            onChange={setVue}
            options={[
              { valeur: 'texte', libelle: 'Texte' },
              { valeur: 'apercu', libelle: 'Aperçu' },
            ]}
          />
        )}
      </div>

      {/* Verdict : une phrase, une action. */}
      <div aria-live="polite" className="at-pile at-pile--serree">
        {vide ? (
          <p className="at-champ__aide">Colle toute la réponse de l’IA, même avec du texte autour : Manabi garde le cours et répare le reste.</p>
        ) : diagnostic?.ok ? (
          <div className="at-verdict at-verdict--ok">
            <Icone nom="coche" taille={20} />
            <p>
              <strong>Cours valide.</strong>{' '}
              {resume &&
                [pluriel(resume.notions, 'notion'), pluriel(resume.flashcards, 'flashcard'), pluriel(resume.quiz, 'question'), pluriel(resume.exercices, 'exercice')].join(' · ')}
            </p>
          </div>
        ) : (
          <div className="at-verdict at-verdict--erreur">
            <Icone nom="alerte" taille={20} />
            <p>
              <strong>{pluriel(nbErreurs, 'erreur')} à corriger.</strong> {reparable ? 'La réparation automatique peut en régler une partie.' : 'Clique sur une erreur pour aller à sa ligne.'}
            </p>
          </div>
        )}
        {reparation && (
          <p className="at-champ__aide at-reparation">
            {reparation.corrections.length ? `Réparé : ${reparation.corrections.join(', ')}.` : 'Rien à réparer automatiquement.'}{' '}
            {reparation.corrections.length > 0 && (
              <button
                type="button"
                className="at-lien"
                onClick={() => {
                  maj({ reponse: reparation.avant });
                  setReparation(null);
                  annoncer('Réparation annulée.');
                }}
              >
                Annuler
              </button>
            )}
          </p>
        )}
        {!reparation && reparationsAuto.length > 0 && <p className="at-champ__aide">Réponse de Claude réparée : {reparationsAuto.join(', ')}.</p>}
      </div>

      {!vide && diagnostic && (diagnostic.erreurs.length > 0 || diagnostic.avertissements.length > 0) && (
        <ListeProblemes erreurs={diagnostic.erreurs} avertissements={diagnostic.avertissements} surClic={allerA_Ligne} />
      )}

      <div
        role={vide ? undefined : 'tabpanel'}
        id={idPanneau(`${base}-vue`, 'texte')}
        aria-labelledby={vide ? undefined : idOnglet(`${base}-vue`, 'texte')}
        hidden={!vide && vue !== 'texte'}
        className="at-champ"
      >
        <label htmlFor={`${base}-editeur`} className="at-champ__label">
          Fichier du cours (Markdown)
        </label>
        <Editeur
          ref={editeur}
          id={`${base}-editeur`}
          valeur={b.reponse}
          onChange={(v) => {
            maj({ reponse: v });
            if (reparation) setReparation(null);
          }}
          onColler={(texte, champVide) => {
            // Collé dans un éditeur vide : on répare tout de suite (le plus souvent un bloc ````markdown).
            if (!champVide) return false;
            const r = reparerCours(texte);
            maj({ reponse: r.texte });
            setReparation({ avant: texte, corrections: r.corrections });
            if (r.corrections.length) annoncer(`Collé et réparé : ${r.corrections.join(', ')}.`);
            return true;
          }}
          lignesErreur={lignesErreur}
          lignesAvertissement={lignesAvert}
          describedBy={`${base}-editeur-aide`}
        />
        <p id={`${base}-editeur-aide`} className="at-champ__aide">
          {vide ? 'Le bloc ````markdown et le texte autour sont retirés tout seuls au collage.' : `${pluriel(b.reponse.split('\n').length, 'ligne')} · la validation suit chaque modification.`}
        </p>
      </div>

      {!vide && (
        <div role="tabpanel" id={idPanneau(`${base}-vue`, 'apercu')} aria-labelledby={idOnglet(`${base}-vue`, 'apercu')} hidden={vue !== 'apercu'}>
          {vue === 'apercu' && diagnostic && (
            <div className="at-pile at-pile--large">
              {resume && <Resume resume={resume} />}
              <Apercu diagnostic={diagnostic} />
            </div>
          )}
        </div>
      )}

      <div className="at-actions at-actions--dans-carte">
        <button type="button" className={`btn ${reparable && !diagnostic?.ok ? 'btn--secondaire' : 'btn--discret'}`} onClick={reparer} disabled={vide}>
          <Icone nom="baguette" />
          Réparer automatiquement
        </button>
        <button type="button" className="btn btn--primaire btn--grand" disabled={!diagnostic?.ok} onClick={() => allerA(4)}>
          Continuer
          <Icone nom="fleche-droite" />
        </button>
      </div>
    </section>
  );
}

function ListeProblemes({ erreurs, avertissements, surClic }: { erreurs: Probleme[]; avertissements: Probleme[]; surClic: (p: Probleme) => void }) {
  const base = useId();
  const ligne = (p: Probleme, genre: 'erreur' | 'avertissement', i: number) => (
    <li key={`${genre}-${i}`} className="at-probleme" data-genre={genre}>
      {p.ligne !== null ? (
        <button type="button" className="at-probleme__ligne" onClick={() => surClic(p)}>
          <span className="sr-only">{genre === 'erreur' ? 'Erreur' : 'Remarque'}, aller à la </span>
          ligne {p.ligne}
        </button>
      ) : (
        <span className="at-probleme__ligne at-probleme__ligne--fixe">
          <span className="sr-only">{genre === 'erreur' ? 'Erreur' : 'Remarque'} : </span>
          fichier
        </span>
      )}
      <span className="at-probleme__texte">
        {p.message.charAt(0).toUpperCase() + p.message.slice(1)}
        {p.detail && <span className="at-probleme__detail">{p.detail}</span>}
      </span>
    </li>
  );
  return (
    <div className="at-problemes">
      {erreurs.length > 0 && (
        <>
          <h3 id={`${base}-e`} className="sr-only">
            Erreurs
          </h3>
          <ul aria-labelledby={`${base}-e`} role="list">
            {erreurs.map((p, i) => ligne(p, 'erreur', i))}
          </ul>
        </>
      )}
      {avertissements.length > 0 && (
        <details className="at-remarques" open={erreurs.length === 0}>
          <summary>
            {pluriel(avertissements.length, 'remarque')} <span className="at-remarques__aide">(n’empêchent pas de publier)</span>
          </summary>
          <ul role="list">{avertissements.map((p, i) => ligne(p, 'avertissement', i))}</ul>
        </details>
      )}
    </div>
  );
}

function Resume({ resume }: { resume: ResumeCours }) {
  const tuiles = [
    { cle: 'notions', kanji: '話', libelle: 'notions', n: resume.notions },
    { cle: 'definitions', kanji: KANJI_SECTIONS.definition.kanji, libelle: 'définitions', n: resume.definitions },
    { cle: 'flashcards', kanji: KANJI_SECTIONS.flashcard.kanji, libelle: 'flashcards', n: resume.flashcards },
    { cle: 'quiz', kanji: KANJI_SECTIONS.quiz.kanji, libelle: 'questions de quiz', n: resume.quiz },
    { cle: 'exercices', kanji: KANJI_SECTIONS.exercice.kanji, libelle: 'exercices', n: resume.exercices },
  ];
  return (
    <ul className="at-compteurs" role="list" aria-label="Résumé du cours">
      {tuiles.map((t) => (
        <li key={t.cle} className="at-compteur">
          <span className="at-compteur__kanji" lang="ja" aria-hidden="true">
            {t.kanji}
          </span>
          <span className="at-compteur__nombre">{t.n}</span>
          <span className="at-compteur__libelle">{t.libelle}</span>
        </li>
      ))}
    </ul>
  );
}
