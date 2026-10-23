/**
 * Libellés français des valeurs du schéma + formatage des dates. Pur, sans dépendance.
 */
import type { Niveau, NiveauExercice, StatutProjet, TypeCours } from './schema.ts';

export const NIVEAUX_LIBELLES: Record<Niveau, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

export const NIVEAUX_EXERCICE_LIBELLES: Record<NiveauExercice, string> = {
  facile: 'Facile',
  moyen: 'Moyen',
  difficile: 'Difficile',
};

export const TYPES_LIBELLES: Record<TypeCours, string> = {
  cours: 'Cours',
  projet: 'Projet',
  tp: 'TP',
  memo: 'Mémo',
};

export const STATUTS_PROJET_LIBELLES: Record<StatutProjet, string> = {
  'en-cours': 'En cours',
  termine: 'Terminé',
  'en-pause': 'En pause',
};

const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** « 2026-09-23 » → « 23 sept. 2026 » (ou « 23 septembre 2026 » si long). Indépendant du fuseau. */
export function formaterDate(date: string | undefined, long = false): string {
  if (!date) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  if (!m) return date;
  const [, a, mo, j] = m;
  const mois = (long ? MOIS : MOIS_COURTS)[Number(mo) - 1] ?? mo;
  return `${Number(j)} ${mois} ${a}`;
}
