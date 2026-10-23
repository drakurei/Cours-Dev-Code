/**
 * Hooks partagés par les îlots de l'accueil : l'état du store, l'heure (les cartes
 * deviennent dues avec le temps) et les cartes du jour, calculés une fois par rendu.
 */
import { useEffect, useMemo, useState } from 'react';
import { useManabi } from '../useManabi.ts';
import type { Etat } from '../../lib/store.ts';
import { lireCartes, lireEpisodes, type CarteRef } from './donnees.ts';
import type { Episode } from './logique.ts';
import { cartesDuJour, type CartesDuJour } from './revision.ts';

/** Heure courante, rafraîchie toutes les `pas` ms et au retour sur l'onglet. */
export function useMaintenant(pas = 60_000): Date {
  const [t, setT] = useState(() => Date.now());
  useEffect(() => {
    const maj = () => setT(Date.now());
    const id = window.setInterval(maj, pas);
    const surVisibilite = () => {
      if (document.visibilityState === 'visible') maj();
    };
    document.addEventListener('visibilitychange', surVisibilite);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', surVisibilite);
    };
  }, [pas]);
  return useMemo(() => new Date(t), [t]);
}

export interface Aujourdhui {
  etat: Etat;
  episodes: Episode[];
  cartes: CarteRef[];
  jour: CartesDuJour;
  maintenant: Date;
}

export function useAujourdhui(): Aujourdhui {
  const etat = useManabi((e) => e);
  const maintenant = useMaintenant();
  const episodes = useMemo(lireEpisodes, []);
  const cartes = useMemo(lireCartes, []);
  const jour = useMemo(() => cartesDuJour(etat, cartes, maintenant), [etat, cartes, maintenant]);
  return { etat, episodes, cartes, jour, maintenant };
}
