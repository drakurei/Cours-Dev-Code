/**
 * Hook React : lit une partie de l'état Manabi et se redessine quand elle change.
 *
 *   const petales = useManabi((e) => e.stats.petales);
 *   const prefs = useManabi((e) => e.prefs);
 *
 * Rendu serveur et hydratation : la valeur vient de ETAT_INITIAL, puis l'état réel
 * du navigateur prend le relais (pas d'erreur d'hydratation).
 */
import { useCallback, useRef, useSyncExternalStore } from 'react';
import { abonner, ETAT_INITIAL, lire, type Etat } from '../lib/store.ts';

type Memo<T> = { etat: Etat; valeur: T } | null;

/**
 * @param selecteur fonction pure (e) => valeur ; peut être déclarée en ligne.
 * @param egal comparaison pour éviter un rendu quand la valeur n'a pas changé (défaut : Object.is).
 */
export function useManabi<T>(selecteur: (e: Etat) => T, egal: (a: T, b: T) => boolean = Object.is): T {
  const memo = useRef<Memo<T>>(null);
  const memoServeur = useRef<Memo<T>>(null);
  // Le sélecteur le plus récent, sans réabonner à chaque rendu.
  const sel = useRef(selecteur);
  sel.current = selecteur;

  const instantane = useCallback((source: Etat, ref: { current: Memo<T> }): T => {
    const m = ref.current;
    if (m && m.etat === source) return m.valeur; // même état → même valeur (stable)
    const valeur = sel.current(source);
    if (m && egal(m.valeur, valeur)) {
      ref.current = { etat: source, valeur: m.valeur };
      return m.valeur;
    }
    ref.current = { etat: source, valeur };
    return valeur;
  }, [egal]);

  return useSyncExternalStore(
    abonner,
    () => instantane(lire(), memo),
    () => instantane(ETAT_INITIAL, memoServeur),
  );
}

/** Égalité superficielle (objets et tableaux d'un niveau) — pratique pour les sélecteurs qui composent. */
export function egalSuperficiel<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => Object.is((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}
