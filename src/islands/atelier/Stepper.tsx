/**
 * Les 4 étapes (Source → Générer → Vérifier → Publier). Une seule visible à la fois ;
 * on revient en arrière d'un clic. Publier n'est ouvert que si le cours est valide.
 */
import { useId } from 'react';
import type { Etape } from '../../lib/atelier/brouillon.ts';
import { annoncer, useAtelier } from './contexte.ts';
import Icone from './Icone.tsx';

const TITRES: Record<Etape, string> = { 1: 'Source', 2: 'Générer', 3: 'Vérifier', 4: 'Publier' };

export default function Stepper() {
  const { b, allerA, diagnostic, secrets } = useAtelier();
  const base = useId();

  const sousTitre = (n: Etape): string => {
    if (n === 1) {
      const premier = b.pdfs[0]?.nom ?? b.images[0]?.nom ?? b.textesFichiers[0]?.nom ?? b.repo?.slug;
      const total = b.pdfs.length + b.images.filter((i) => !i.depuisPdf).length + b.textesFichiers.length + (b.repo ? 1 : 0);
      if (premier) return total > 1 ? `${premier} + ${total - 1}` : premier;
      return b.texte.trim() ? 'Texte collé' : 'PDF, images, texte, repo';
    }
    if (n === 2) return b.ongletGenerer === 'claude' ? 'Automatique' : 'Copier le prompt';
    if (n === 3) {
      if (!diagnostic) return 'Coller la réponse';
      if (diagnostic.ok) return 'Cours valide';
      const e = diagnostic.erreurs.length;
      return `${e} erreur${e > 1 ? 's' : ''}`;
    }
    return secrets.aJeton ? 'Sur GitHub' : 'Télécharger';
  };

  const publierOuvert = diagnostic?.ok === true;

  return (
    <nav className="at-etapes" aria-label="Étapes de création">
      <ol>
        {([1, 2, 3, 4] as const).map((n) => {
          const actuelle = b.etape === n;
          const faite = n < b.etape || (n === 3 && publierOuvert && b.etape !== 3);
          const fermee = n === 4 && !publierOuvert;
          const etat = actuelle ? 'actuelle' : faite ? 'faite' : 'a-venir';
          return (
            <li key={n} data-etat={etat}>
              <button
                type="button"
                className="at-etape"
                aria-current={actuelle ? 'step' : undefined}
                aria-disabled={fermee ? 'true' : undefined}
                aria-describedby={`${base}-sous-titre-${n}`}
                onClick={() => {
                  if (fermee) {
                    annoncer('Publier s’ouvre quand le cours est valide (étape Vérifier).');
                    return;
                  }
                  if (!actuelle) allerA(n);
                }}
              >
                <span className="at-etape__rond" aria-hidden="true">
                  {faite && !actuelle ? <Icone nom="coche" taille={16} /> : n}
                </span>
                <span className="at-etape__texte">
                  <span className="at-etape__titre">
                    <span className="sr-only">Étape {n} : </span>
                    {TITRES[n]}
                    <span className="sr-only">{actuelle ? ' (en cours)' : faite ? ' (faite)' : fermee ? ' (pas encore disponible)' : ''}</span>
                  </span>
                  {/* Le sous-titre décrit l'étape sans faire partie de son nom (« Étape 2 : Générer »). */}
                  <span id={`${base}-sous-titre-${n}`} className="at-etape__sous-titre" aria-hidden="true">
                    {sousTitre(n)}
                  </span>
                </span>
              </button>
              {n < 4 && <span className="at-etape__trait" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
