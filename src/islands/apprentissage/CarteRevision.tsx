/**
 * Une flashcard qui se retourne (clic, Espace) + les 4 boutons de note (touches 1-4).
 * Composant contrôlé : le parent tient la carte, la face visible et ce que fait une note.
 * Animation 3D douce ; fondu si les animations sont réduites (CSS).
 * Le HTML des cartes vient du build, déjà assaini (rehype-sanitize, src/lib/markdown/sanitize.ts).
 */
import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react';
import { LIBELLES_NOTES, NOTES, type Note } from '../../lib/srs.ts';
import { chiffre, surUnControle, useRaccourcis, type Portee } from './clavier.ts';
import { IconeRetourner } from './communs.tsx';

export interface CarteAffichee {
  id: string;
  qHtml: string;
  rHtml: string;
}

interface Props {
  carte: CarteAffichee;
  /** À gauche de l'en-tête de la carte (source ou « Carte 3 sur 12 »). */
  entete: ReactNode;
  /** Pastille à droite : « Nouvelle », « À revoir »… */
  statut?: string | undefined;
  retournee: boolean;
  onRetourner: () => void;
  /** Intervalle prévu par note (null tant qu'il n'est pas calculé). */
  intervalles: Record<Note, string> | null;
  onNoter: (n: Note) => void;
  portee: Portee;
  actif?: boolean;
  /** Grande carte au centre (page Réviser) ou carte du lecteur. */
  taille?: 'grande' | 'normale';
  /**
   * Change à chaque nouvelle carte (ou retour d'une carte) : la carte est recréée côté recto,
   * sans rotation arrière qui laisserait voir la réponse suivante.
   */
  cle?: string;
}

export default function CarteRevision({
  carte,
  entete,
  statut,
  retournee,
  onRetourner,
  intervalles,
  onNoter,
  portee,
  actif = true,
  taille = 'normale',
  cle = carte.id,
}: Props) {
  const racine = useRef<HTMLDivElement>(null);
  const refRecto = useRef<HTMLButtonElement>(null);
  const refVerso = useRef<HTMLButtonElement>(null);
  const base = useId();
  const idQuestion = `${base}-q`;
  const idReponse = `${base}-r`;
  const idNotes = `${base}-n`;

  useRaccourcis(actif, racine, portee, (ev) => {
    if (ev.key === ' ' || ev.code === 'Space') {
      if (surUnControle(ev.target)) return false; // un bouton gère Espace lui-même
      onRetourner();
      return true;
    }
    const n = chiffre(ev);
    if (n !== null && n <= 4 && retournee) {
      onNoter(n as Note);
      return true;
    }
    return false;
  });

  // La face cachée devient inerte : on garde le focus sur le bouton de la face visible.
  // (Le focus peut être sur body ou sur un ancêtre focalisable, comme <main tabindex="-1">.)
  const premier = useRef(true);
  const apresClic = useRef(false);
  useEffect(() => {
    if (premier.current) {
      premier.current = false;
      return;
    }
    const actuel = document.activeElement;
    const ici = !!racine.current && (!actuel || actuel === document.body || actuel.contains(racine.current) || racine.current.contains(actuel));
    if (apresClic.current || ici) (retournee ? refVerso : refRecto).current?.focus({ preventScroll: true });
    apresClic.current = false;
  }, [retournee, cle]);

  const surClic = (ev: MouseEvent<HTMLDivElement>) => {
    const cible = ev.target as HTMLElement;
    if (cible.closest('a, button, summary')) return;
    if (window.getSelection()?.toString()) return; // l'utilisateur sélectionne du texte
    apresClic.current = true;
    onRetourner();
  };

  const tete = (
    <div className="ap-carte__tete">
      <span className="ap-carte__entete">{entete}</span>
      {statut && <span className="ap-carte__statut">{statut}</span>}
    </div>
  );

  return (
    <div className="ap-revision" ref={racine} data-taille={taille}>
      <div key={cle} className="ap-carte" data-face={retournee ? 'verso' : 'recto'} onClick={surClic}>
        <div className="ap-carte__interieur">
          <div className="ap-carte__face ap-carte__face--recto" inert={retournee} aria-hidden={retournee || undefined}>
            {tete}
            <div className="ap-carte__corps">
              <p className="ap-carte__label">Question</p>
              <div className="ap-carte__question" id={idQuestion} dangerouslySetInnerHTML={{ __html: carte.qHtml }} />
            </div>
            <button ref={refRecto} type="button" className="ap-carte__retourner" onClick={onRetourner} aria-describedby={idQuestion}>
              <IconeRetourner />
              <span className="ap-tactile">Touche la carte pour voir la réponse</span>
              <span className="ap-souris">Voir la réponse</span>
              <kbd className="ap-souris" aria-hidden="true">
                Espace
              </kbd>
            </button>
          </div>
          <div className="ap-carte__face ap-carte__face--verso" inert={!retournee} aria-hidden={!retournee || undefined}>
            {tete}
            <div className="ap-carte__corps">
              <div className="ap-carte__rappel" dangerouslySetInnerHTML={{ __html: carte.qHtml }} />
              <span className="ap-carte__trait" aria-hidden="true" />
              <p className="ap-carte__label ap-carte__label--reponse">Réponse</p>
              <div className="ap-carte__reponse" id={idReponse} dangerouslySetInnerHTML={{ __html: carte.rHtml }} />
            </div>
            <button ref={refVerso} type="button" className="ap-carte__retourner" onClick={onRetourner} aria-describedby={idReponse}>
              <IconeRetourner />
              <span>Revoir la question</span>
            </button>
          </div>
        </div>
      </div>

      <div className="ap-notes" role="group" aria-labelledby={idNotes} data-pret={retournee ? 'true' : undefined}>
        <p className="ap-notes__titre" id={idNotes}>
          {retournee ? 'Comment c’était ?' : 'Retourne la carte, puis note-toi.'}
        </p>
        <div className="ap-notes__boutons">
          {NOTES.map((n) => (
            <button
              key={n}
              type="button"
              className="ap-note"
              data-note={n}
              disabled={!retournee}
              onClick={() => onNoter(n)}
              aria-label={intervalles ? `${LIBELLES_NOTES[n]}, revoir dans ${intervalles[n]}` : LIBELLES_NOTES[n]}
            >
              <span className="ap-note__libelle">{LIBELLES_NOTES[n]}</span>
              <span className="ap-note__delai">{intervalles ? intervalles[n] : ' '}</span>
              <kbd className="ap-note__touche ap-souris" aria-hidden="true">
                {n}
              </kbd>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
