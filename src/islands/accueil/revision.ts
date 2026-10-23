/**
 * Pont vers la répétition espacée (src/lib/srs.ts) : une seule porte d'entrée pour l'accueil.
 * Si srs.ts lève une erreur (état abîmé…), repli propre : cartes dues = cartes du store
 * dont la date est passée (même règle que compterCartesDues), aucune nouvelle carte.
 */
import type { Etat } from '../../lib/store.ts';
import { cartesDuJour as cartesSrs, minutesEstimees as minutesSrs, type CartesDuJour } from '../../lib/srs.ts';
import type { CarteRef } from './donnees.ts';

export type { CartesDuJour };

/** Repli : cartes déjà apprises dont la révision est due, la plus en retard d'abord. */
export function duesDuStore(etat: Etat, maintenant: Date = new Date()): string[] {
  const t = maintenant.getTime();
  return Object.entries(etat.srs)
    .filter(([, c]) => Date.parse(c.due) <= t)
    .sort(([, a], [, b]) => a.due.localeCompare(b.due))
    .map(([id]) => id);
}

/** Cartes du jour (dues + nouvelles). `toutes` = cartes du site, dans l'ordre de lecture. */
export function cartesDuJour(etat: Etat, toutes: readonly CarteRef[], maintenant: Date = new Date()): CartesDuJour {
  try {
    const r = cartesSrs(etat, toutes, maintenant);
    return { dues: [...r.dues], nouvelles: [...r.nouvelles] };
  } catch {
    return { dues: duesDuStore(etat, maintenant), nouvelles: [] };
  }
}

/** Minutes pour n cartes (repli : environ 30 s par carte). */
export function minutesEstimees(n: number): number {
  try {
    const m = minutesSrs(n);
    if (Number.isFinite(m)) return m;
  } catch {
    /* repli ci-dessous */
  }
  return Math.max(1, Math.round(n / 2));
}
