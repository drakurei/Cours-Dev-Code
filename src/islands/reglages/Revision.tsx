/**
 * Révision (nouvelles cartes par jour, taille d'une session) et Minuteur (durée par défaut).
 */
import type { Prefs } from '../../lib/store.ts';
import { Compteur, Ligne, Liste, Section, Segmente, type OptionSegment } from './controles.tsx';
import { changerPref } from './etat.ts';

const DUREES = [10, 15, 25] as const;

export function Revision({ prefs }: { prefs: Prefs }) {
  return (
    <Section id="revision" titre="Révision">
      <Liste note="Peu de cartes à la fois : des sessions courtes que tu finis vraiment.">
        <Ligne libelle="Nouvelles cartes par jour" detail="Cartes jamais vues, ajoutées chaque jour.">
          {(ids) => (
            <Compteur
              ids={ids}
              valeur={prefs.nouvellesCartesParJour}
              min={0}
              max={100}
              pas={5}
              unite="nouvelles cartes"
              onChange={(v) => changerPref('nouvellesCartesParJour', v)}
            />
          )}
        </Ligne>
        <Ligne libelle="Taille d’une session" detail="Nombre de cartes par session.">
          {(ids) => (
            <Compteur ids={ids} valeur={prefs.tailleSession} min={5} max={50} pas={5} unite="cartes par session" onChange={(v) => changerPref('tailleSession', v)} />
          )}
        </Ligne>
      </Liste>
    </Section>
  );
}

export function Minuteur({ prefs }: { prefs: Prefs }) {
  // Une durée venue d'un import (ex. 20 min) reste visible et sélectionnée.
  const valeurs: number[] = [...DUREES];
  if (!valeurs.includes(prefs.minuteur)) valeurs.push(prefs.minuteur);
  valeurs.sort((a, b) => a - b);
  const options: OptionSegment<number>[] = valeurs.map((m) => ({ valeur: m, libelle: `${m} min` }));
  return (
    <Section id="minuteur" titre="Minuteur">
      <Liste note="Une session courte, puis une vraie pause.">
        <Ligne libelle="Durée par défaut">
          {(ids) => <Segmente ids={ids} valeur={prefs.minuteur} options={options} onChange={(v) => changerPref('minuteur', v)} />}
        </Ligne>
      </Liste>
    </Section>
  );
}
