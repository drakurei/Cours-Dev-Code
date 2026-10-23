/**
 * Brouillon de l'Atelier : tout ce qu'on a saisi, sauvegardé automatiquement dans ce navigateur.
 *
 * Clé à part (« manabi:v1:atelier ») : un brouillon n'est ni de la progression ni un réglage,
 * il ne doit pas partir dans l'export ni dans la synchro Gist. Les fichiers eux-mêmes (PDF,
 * images) restent en mémoire : seuls leurs noms, leurs pages et leur texte sont gardés.
 * Tout accès au stockage est protégé (navigation privée, quota plein).
 */
import type { SourceRepo } from './github.ts';

export const CLE_BROUILLON = 'manabi:v1:atelier';

export type Etape = 1 | 2 | 3 | 4;
export type OngletSource = 'fichiers' | 'texte' | 'repo';
export type OngletGenerer = 'universel' | 'claude';

export interface PdfSource {
  id: string;
  nom: string;
  taille: number;
  pages: number;
  /** Texte de chaque page. */
  textes: string[];
  /** Presque pas de texte : PDF scanné (photos de pages). */
  scanne: boolean;
  /** Mettre le texte extrait dans le prompt (sinon : fichier à joindre dans l'IA). */
  inclureTexte: boolean;
  /** Pages rendues en images (elles remplacent le PDF pour Claude). */
  enImages: boolean;
}

export interface ImageSource {
  id: string;
  nom: string;
  taille: number;
  type: string;
  largeur: number;
  hauteur: number;
  redimensionnee: boolean;
  /** Id du PDF d'origine (page rendue en image). */
  depuisPdf?: string;
}

export interface TexteSource {
  id: string;
  nom: string;
  contenu: string;
}

export interface Brouillon {
  version: 1;
  maj: string;
  etape: Etape;
  ongletSource: OngletSource;
  texte: string;
  textesFichiers: TexteSource[];
  pdfs: PdfSource[];
  images: ImageSource[];
  repoSaisie: string;
  repo: SourceRepo | null;
  /** Slug d'une matière existante, NOUVELLE_MATIERE, ou '' (l'IA choisit). */
  matiere: string;
  nomNouvelleMatiere: string;
  type: string;
  niveau: string;
  consigne: string;
  ongletGenerer: OngletGenerer;
  /** Texte de l'éditeur (étape Vérifier). */
  reponse: string;
  /** Ids des fichiers à joindre au cours (public/media/). */
  joindre: string[];
}

export const NOUVELLE_MATIERE = '__nouvelle__';

export function brouillonVide(): Brouillon {
  return {
    version: 1,
    maj: new Date(0).toISOString(),
    etape: 1,
    ongletSource: 'fichiers',
    texte: '',
    textesFichiers: [],
    pdfs: [],
    images: [],
    repoSaisie: '',
    repo: null,
    matiere: '',
    nomNouvelleMatiere: '',
    type: '',
    niveau: '',
    consigne: '',
    ongletGenerer: 'universel',
    reponse: '',
    joindre: [],
  };
}

const estObjet = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const texte = (v: unknown, d = ''): string => (typeof v === 'string' ? v : d);
const nombre = (v: unknown, d = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const parmi = <T extends string | number>(v: unknown, valeurs: readonly T[], d: T): T => (valeurs.includes(v as T) ? (v as T) : d);
const liste = <T>(v: unknown, f: (x: Record<string, unknown>) => T | null): T[] =>
  Array.isArray(v) ? v.filter(estObjet).map(f).filter((x): x is T => x !== null) : [];

/** Remet n'importe quelle valeur lue en brouillon valide (champs inconnus jetés). */
export function normaliserBrouillon(brut: unknown): Brouillon {
  const b = estObjet(brut) ? brut : {};
  const vide = brouillonVide();
  const repo = estObjet(b.repo) && typeof b.repo.slug === 'string' && Array.isArray(b.repo.fichiers) ? (b.repo as unknown as SourceRepo) : null;
  return {
    version: 1,
    maj: texte(b.maj, vide.maj),
    etape: parmi(b.etape, [1, 2, 3, 4] as const, 1),
    ongletSource: parmi(b.ongletSource, ['fichiers', 'texte', 'repo'] as const, 'fichiers'),
    texte: texte(b.texte),
    textesFichiers: liste(b.textesFichiers, (x) => (typeof x.id === 'string' ? { id: x.id, nom: texte(x.nom, 'texte.md'), contenu: texte(x.contenu) } : null)),
    pdfs: liste(b.pdfs, (x) =>
      typeof x.id === 'string'
        ? {
            id: x.id,
            nom: texte(x.nom, 'document.pdf'),
            taille: nombre(x.taille),
            pages: nombre(x.pages),
            textes: Array.isArray(x.textes) ? x.textes.map((t) => texte(t)) : [],
            scanne: x.scanne === true,
            inclureTexte: x.inclureTexte !== false,
            enImages: x.enImages === true,
          }
        : null,
    ),
    images: liste(b.images, (x) =>
      typeof x.id === 'string'
        ? {
            id: x.id,
            nom: texte(x.nom, 'image.png'),
            taille: nombre(x.taille),
            type: texte(x.type, 'image/png'),
            largeur: nombre(x.largeur),
            hauteur: nombre(x.hauteur),
            redimensionnee: x.redimensionnee === true,
            ...(typeof x.depuisPdf === 'string' ? { depuisPdf: x.depuisPdf } : {}),
          }
        : null,
    ),
    repoSaisie: texte(b.repoSaisie),
    repo,
    matiere: texte(b.matiere),
    nomNouvelleMatiere: texte(b.nomNouvelleMatiere),
    type: texte(b.type),
    niveau: texte(b.niveau),
    consigne: texte(b.consigne),
    ongletGenerer: parmi(b.ongletGenerer, ['universel', 'claude'] as const, 'universel'),
    reponse: texte(b.reponse),
    joindre: Array.isArray(b.joindre) ? b.joindre.filter((x): x is string => typeof x === 'string') : [],
  };
}

/** Vrai si le brouillon ne contient encore rien d'utile. */
export function estVide(b: Brouillon): boolean {
  return (
    !b.texte.trim() &&
    b.textesFichiers.length === 0 &&
    b.pdfs.length === 0 &&
    b.images.length === 0 &&
    !b.repo &&
    !b.consigne.trim() &&
    !b.reponse.trim()
  );
}

function stockage(): Storage | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function lireBrouillon(): Brouillon | null {
  try {
    const brut = stockage()?.getItem(CLE_BROUILLON);
    return brut ? normaliserBrouillon(JSON.parse(brut)) : null;
  } catch {
    return null; // stockage bloqué ou JSON abîmé : on repart à zéro
  }
}

/** Enregistre le brouillon. Renvoie false si le stockage refuse (quota, navigation privée). */
export function ecrireBrouillon(b: Brouillon): boolean {
  const s = stockage();
  if (!s) return false;
  try {
    s.setItem(CLE_BROUILLON, JSON.stringify(b));
    return true;
  } catch {
    // Quota plein : on réessaie sans les gros textes (pages des PDF, fichiers du repo).
    try {
      const leger: Brouillon = { ...b, pdfs: b.pdfs.map((p) => ({ ...p, textes: [] })), repo: b.repo ? { ...b.repo, fichiers: [] } : null };
      s.setItem(CLE_BROUILLON, JSON.stringify(leger));
      return true;
    } catch {
      return false;
    }
  }
}

export function effacerBrouillon(): void {
  try {
    stockage()?.removeItem(CLE_BROUILLON);
  } catch {
    /* rien à faire */
  }
}
