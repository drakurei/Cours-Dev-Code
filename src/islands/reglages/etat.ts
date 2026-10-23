/**
 * État partagé par les sections des Réglages : préférences (store), méta de synchro,
 * secrets de ce navigateur, horloge pour les « il y a 3 min ».
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { CLE_SECRETS, ecrireSecrets, lireSecrets, modifier, type Prefs, type Secrets } from '../../lib/store.ts';
import { CLE_SYNC, EVENEMENT_SYNC, lireMetaSync, syncEnCours, type MetaSync, type ModeSync } from '../../lib/sync.ts';

/** Change une préférence : le store sauvegarde et prefs.ts réapplique les attributs de <html>. */
export function changerPref<K extends keyof Prefs>(cle: K, valeur: Prefs[K]): void {
  modifier((b) => {
    b.prefs[cle] = valeur;
  });
}

// ─── Méta de synchro ─────────────────────────────────────────────────────────

export interface EtatSync {
  meta: MetaSync;
  enCours: ModeSync | null;
}

let instantane: { cle: string; valeur: EtatSync } | null = null;

function lireEtatSync(): EtatSync {
  const meta = lireMetaSync();
  const enCours = syncEnCours();
  const cle = JSON.stringify([meta, enCours]);
  if (!instantane || instantane.cle !== cle) instantane = { cle, valeur: { meta, enCours } };
  return instantane.valeur;
}

function abonnerSync(cb: () => void): () => void {
  const surStorage = (ev: StorageEvent) => {
    if (ev.key === null || ev.key === CLE_SYNC) cb();
  };
  window.addEventListener(EVENEMENT_SYNC, cb);
  window.addEventListener('storage', surStorage);
  return () => {
    window.removeEventListener(EVENEMENT_SYNC, cb);
    window.removeEventListener('storage', surStorage);
  };
}

const ETAT_SYNC_SERVEUR: EtatSync = {
  meta: { auto: false, derniere: null, tentative: null, erreur: null, url: null },
  enCours: null,
};

/** Méta de synchro (dernière synchro, erreur, auto) + synchro en cours. */
export function useEtatSync(): EtatSync {
  return useSyncExternalStore(abonnerSync, lireEtatSync, () => ETAT_SYNC_SERVEUR);
}

// ─── Secrets ─────────────────────────────────────────────────────────────────

/** Secrets de ce navigateur (suivis entre onglets). L'écriture vide efface. */
export function useSecrets(): [Secrets, (partiel: { [K in keyof Secrets]?: string | null }) => void] {
  const [secrets, setSecrets] = useState<Secrets>(() => lireSecrets());

  useEffect(() => {
    const surStorage = (ev: StorageEvent) => {
      if (ev.key === null || ev.key === CLE_SECRETS) setSecrets(lireSecrets());
    };
    window.addEventListener('storage', surStorage);
    return () => window.removeEventListener('storage', surStorage);
  }, []);

  const ecrire = useCallback((partiel: { [K in keyof Secrets]?: string | null }) => {
    ecrireSecrets(partiel);
    setSecrets(lireSecrets());
  }, []);

  return [secrets, ecrire];
}

// ─── Horloge ─────────────────────────────────────────────────────────────────

/** Date courante, rafraîchie toutes les `ms` (pour « il y a 3 min »). */
export function useMaintenant(ms = 30_000): Date {
  const [maintenant, setMaintenant] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setMaintenant(new Date()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return maintenant;
}
