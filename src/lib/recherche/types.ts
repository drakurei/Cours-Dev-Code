/**
 * Types partagés de la recherche : index généré au build (/search-index.json)
 * et documents lus par la palette de commandes.
 */
import type { Couleur } from '../schema.ts';

/** Nature d'un document : sert au regroupement des résultats. */
export type TypeDoc = 'cours' | 'notion' | 'definition' | 'page' | 'action';

/** Tome (matière) réduit à ce que la palette affiche. */
export interface MatiereIndex {
  nom: string;
  kanji: string;
  couleur: Couleur;
}

/** Une notion (##) d'un cours : titre et ancre (id du titre). */
export interface NotionIndex {
  titre: string;
  ancre: string;
}

/** Un document cherchable. Les champs indexés sont titre, motsCles et texte. */
export interface DocRecherche {
  /** Unique, préfixé par le type : « cours:react/06-usestate », « notion:…#ancre »… */
  id: string;
  type: TypeDoc;
  titre: string;
  /** URL complète (base comprise). Vide pour une action sans lien. */
  url: string;
  /** Texte brut abrégé : indexé et affiché en extrait. */
  texte: string;
  /** Mots-clés indexés (tags, matière, titres des notions, synonymes). */
  motsCles?: string;
  /** Slug de la matière (clé de IndexRecherche.matieres). */
  matiere?: string;
  /** Numéro d'épisode du cours (第N話). */
  chapitre?: number;
  /** Titre du cours parent (notions, définitions). */
  coursTitre?: string;
  /** Minutes de lecture (cours). */
  duree?: number;
  /** Kanji propre au document (pages, tomes). */
  kanji?: string;
  /** Ligne secondaire déjà formulée (pages, tomes, actions). */
  detail?: string;
  /** Notions du cours (documents de type cours). */
  notions?: NotionIndex[];
  /** Exemple d'une définition (brut). */
  exemple?: string;
}

/** Contenu de /search-index.json. */
export interface IndexRecherche {
  version: 1;
  /** ISO, date du build. */
  genere: string;
  matieres: Record<string, MatiereIndex>;
  documents: DocRecherche[];
}
