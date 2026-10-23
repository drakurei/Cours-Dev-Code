/** Types partagés par les composants du lecteur. */

/** Section « Pour réviser » du sommaire (documents, définitions, exercices, quiz, flashcards). */
export interface EntreeRevision {
  id: string;
  kanji: string;
  libelle: string;
  nombre: number;
  /** Bloc dont les couleurs servent au badge kanji. */
  bloc: 'definition' | 'exemple' | 'astuce' | 'info' | 'ou' | 'quoi';
}
