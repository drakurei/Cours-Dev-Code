/**
 * État partagé par les étapes de l'Atelier (contexte React) + petits outils navigateur.
 */
import { createContext, useContext } from 'react';
import type { Brouillon, Etape } from '../../lib/atelier/brouillon.ts';
import type { Diagnostic } from '../../lib/atelier/analyse.ts';
import type { Couleur } from '../../lib/schema.ts';
import type { Generation } from './useGeneration.ts';

export interface MatiereAtelier {
  slug: string;
  nom: string;
  kanji: string;
  couleur: Couleur;
  lecture?: string | undefined;
  ordre: number;
}

/** Octets d'un fichier déposé (gardés en mémoire seulement, jamais dans le brouillon). */
export interface Binaire {
  octets: Uint8Array;
  type: string;
  /** data: URL des vignettes (pages d'un PDF, image). */
  vignettes: string[];
}

export type MiseAJour = Partial<Brouillon> | ((b: Brouillon) => Partial<Brouillon>);

export interface ContexteAtelier {
  b: Brouillon;
  maj: (m: MiseAJour) => void;
  binaires: ReadonlyMap<string, Binaire>;
  poserBinaire: (id: string, bin: Binaire | null) => void;
  allerA: (e: Etape) => void;
  matieres: MatiereAtelier[];
  coursParMatiere: Record<string, string[]>;
  urlReglages: string;
  secrets: { aCle: boolean; aJeton: boolean };
  modeleIA: string;
  diagnostic: Diagnostic | null;
  /** Texte du prompt universel (PROMPT-COURS.md). */
  gabarit: string;
  generation: Generation;
  /** Efface le brouillon et repart de l'étape 1. */
  recommencer: () => void;
  /** Réparations faites sur la dernière réponse de Claude (affichées à l'étape Vérifier). */
  reparationsAuto: string[];
}

export const Contexte = createContext<ContexteAtelier | null>(null);

export function useAtelier(): ContexteAtelier {
  const c = useContext(Contexte);
  if (!c) throw new Error('useAtelier hors de <Atelier>');
  return c;
}

/** Identifiant court pour un fichier déposé. */
export function nouvelId(prefixe: string): string {
  const alea = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
  return `${prefixe}-${alea}`;
}

/** Annonce polie pour les lecteurs d'écran (zone [data-annonce] du BaseLayout). */
export function annoncer(message: string): void {
  const zone = document.querySelector<HTMLElement>('[data-annonce]');
  if (!zone) return;
  zone.textContent = '';
  window.setTimeout(() => {
    zone.textContent = message;
  }, 40);
}

/** Copie dans le presse-papiers (Clipboard API, puis repli textarea). */
export async function copierTexte(texte: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texte);
    return true;
  } catch {
    const zone = document.createElement('textarea');
    zone.value = texte;
    zone.setAttribute('readonly', '');
    zone.className = 'sr-only';
    document.body.append(zone);
    zone.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    zone.remove();
    return ok;
  }
}

/** Fait télécharger un texte comme fichier. */
export function telechargerTexte(nom: string, texte: string, type = 'text/markdown;charset=utf-8'): void {
  const url = URL.createObjectURL(new Blob([texte], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nom;
  a.rel = 'noopener';
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** « il y a 2 min » à partir d'une date. */
export function ilYA(quand: number, maintenant = Date.now()): string {
  const s = Math.max(0, Math.round((maintenant - quand) / 1000));
  if (s < 45) return 'à l’instant';
  const min = Math.round(s / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  return h < 24 ? `il y a ${h} h` : 'il y a plus d’un jour';
}

/** Nombre en français : 4 812. */
export const nombreFr = (n: number): string => n.toLocaleString('fr-FR');
