/**
 * IA : clé API Anthropic (tester), modèle utilisé par l'Atelier, rappel du plafond de dépenses.
 */
import { useState } from 'react';
import type { Prefs, Secrets } from '../../lib/store.ts';
import { ChampSecret, LienExterne, Ligne, Liste, ListeChoix, Section, Statut } from './controles.tsx';
import { changerPref } from './etat.ts';
import { MODELES, testerCleAnthropic, URL_CLES, URL_LIMITES } from './anthropic.ts';

interface Props {
  prefs: Prefs;
  secrets: Secrets;
  ecrireSecrets: (partiel: { anthropicKey?: string | null }) => void;
}

export default function IA({ prefs, secrets, ecrireSecrets }: Props) {
  const cle = secrets.anthropicKey ?? '';
  const [test, setTest] = useState<{ ton: 'neutre' | 'ok' | 'erreur'; texte: string; enCours: boolean }>({ ton: 'neutre', texte: '', enCours: false });

  const tester = async () => {
    setTest({ ton: 'neutre', texte: 'Test…', enCours: true });
    const r = await testerCleAnthropic(cle, prefs.modeleIA);
    setTest({ ton: r.ok ? 'ok' : 'erreur', texte: r.message, enCours: false });
  };

  // Un modèle venu d'un import (inconnu ici) reste visible et coché.
  const options = MODELES.map((m) => ({ valeur: m.id, libelle: m.nom, detail: m.detail }));
  if (!options.some((o) => o.valeur === prefs.modeleIA)) options.push({ valeur: prefs.modeleIA, libelle: prefs.modeleIA, detail: 'Modèle personnalisé.' });

  return (
    <Section id="ia" titre="IA">
      <Liste
        titre="Clé API Anthropic"
        note={
          <>
            Facultatif : sert seulement à la génération automatique de l’Atelier. La clé reste dans ce navigateur.{' '}
            <LienExterne href={URL_CLES}>Créer une clé</LienExterne>
          </>
        }
      >
        <Ligne libelle="Clé API" pile etiquette detail={cle ? 'Enregistrée dans ce navigateur.' : undefined}>
          {(ids) => (
            <div className="r-pile">
              <ChampSecret
                ids={ids}
                valeur={cle}
                nom="la clé API"
                placeholder="sk-ant-…"
                onChange={(v) => {
                  ecrireSecrets({ anthropicKey: v });
                  setTest({ ton: 'neutre', texte: '', enCours: false });
                }}
              />
              <div className="r-actions">
                <button type="button" className="btn btn--secondaire" onClick={tester} disabled={!cle || test.enCours}>
                  {test.enCours ? 'Test…' : 'Tester'}
                </button>
              </div>
              <Statut message={test.enCours ? '' : test.texte} ton={test.ton} />
            </div>
          )}
        </Ligne>
      </Liste>

      <Liste titre="Modèle">
        <ListeChoix libelle="Modèle utilisé par l’Atelier" valeur={prefs.modeleIA} options={options} onChange={(v) => changerPref('modeleIA', v)} />
      </Liste>

      <aside className="bloc bloc--attention r-rappel" aria-label="Rappel : plafond de dépenses">
        <p className="bloc__tete">
          <span className="kanji" lang="ja" aria-hidden="true">
            注
          </span>
          <span className="bloc__titre">Mets un plafond de dépenses sur ta clé</span>
        </p>
        <div className="bloc__corps">
          <p>
            Une clé sans limite peut coûter cher si elle fuit. Fixe un petit montant par mois dans{' '}
            <LienExterne href={URL_LIMITES}>la console Claude, rubrique Limits</LienExterne>.
          </p>
        </div>
      </aside>
    </Section>
  );
}
