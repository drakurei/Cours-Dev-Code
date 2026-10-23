/**
 * Recherches récentes de la palette : quelques requêtes gardées dans CE navigateur
 * (jamais exportées ni synchronisées). Tout accès au stockage est protégé.
 */
import { normaliser } from './normaliser.ts';

export const CLE_RECENTES = 'manabi:v1:recherches';
export const MAX_RECENTES = 5;

/** Ajoute une requête en tête (sans doublon, casse et accents ignorés). Pur. */
export function ajouterRecente(liste: ReadonlyArray<string>, requete: string, max = MAX_RECENTES): string[] {
  const q = requete.trim().replace(/\s+/g, ' ');
  if (!q) return [...liste].slice(0, max);
  const n = normaliser(q);
  return [q, ...liste.filter((r) => normaliser(r) !== n)].slice(0, max);
}

/** Lit la liste (vide si rien, abîmée ou stockage indisponible). */
export function lireRecentes(stockage: Pick<Storage, 'getItem'> | null = stockageLocal()): string[] {
  try {
    const brut: unknown = JSON.parse(stockage?.getItem(CLE_RECENTES) ?? '[]');
    return Array.isArray(brut) ? brut.filter((r): r is string => typeof r === 'string' && !!r.trim()).slice(0, MAX_RECENTES) : [];
  } catch {
    return [];
  }
}

/** Enregistre la liste (silencieux si le stockage est indisponible). */
export function ecrireRecentes(liste: ReadonlyArray<string>, stockage: Pick<Storage, 'setItem' | 'removeItem'> | null = stockageLocal()): void {
  try {
    if (!stockage) return;
    if (liste.length) stockage.setItem(CLE_RECENTES, JSON.stringify(liste.slice(0, MAX_RECENTES)));
    else stockage.removeItem(CLE_RECENTES);
  } catch {
    /* navigation privée ou quota : on oublie, sans erreur */
  }
}

function stockageLocal(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}
