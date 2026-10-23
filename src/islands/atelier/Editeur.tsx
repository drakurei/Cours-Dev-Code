/**
 * Éditeur du fichier de cours : zone de texte monospace avec numéros de ligne
 * (les lignes en erreur sont marquées), et « aller à la ligne » pour les erreurs cliquables.
 */
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';

export interface EditeurApi {
  allerALaLigne: (ligne: number) => void;
}

interface Props {
  id: string;
  valeur: string;
  onChange: (v: string) => void;
  onColler?: (texte: string, champVide: boolean) => boolean;
  lignesErreur: ReadonlySet<number>;
  lignesAvertissement: ReadonlySet<number>;
  describedBy?: string;
}

const Editeur = forwardRef<EditeurApi, Props>(function Editeur({ id, valeur, onChange, onColler, lignesErreur, lignesAvertissement, describedBy }, ref) {
  const zone = useRef<HTMLTextAreaElement>(null);
  const numeros = useRef<HTMLDivElement>(null);
  const total = useMemo(() => valeur.split('\n').length, [valeur]);

  useImperativeHandle(ref, () => ({
    allerALaLigne(ligne: number) {
      const t = zone.current;
      if (!t) return;
      const lignes = t.value.split('\n');
      const n = Math.min(Math.max(1, ligne), lignes.length);
      let debut = 0;
      for (let i = 0; i < n - 1; i++) debut += (lignes[i]?.length ?? 0) + 1;
      const fin = debut + (lignes[n - 1]?.length ?? 0);
      t.focus({ preventScroll: true });
      t.setSelectionRange(debut, fin);
      const hauteur = parseFloat(getComputedStyle(t).lineHeight) || 20;
      t.scrollTop = Math.max(0, (n - 1) * hauteur - t.clientHeight / 3);
      t.scrollLeft = 0;
      t.scrollIntoView({ block: 'nearest' });
    },
  }));

  const synchroniser = () => {
    const t = zone.current;
    const g = numeros.current;
    if (t && g) g.style.transform = `translateY(${-t.scrollTop}px)`;
  };

  return (
    <div className="at-editeur">
      <div className="at-editeur__gouttiere" aria-hidden="true">
        <div ref={numeros} className="at-editeur__numeros">
          {Array.from({ length: total }, (_, i) => {
            const n = i + 1;
            const etat = lignesErreur.has(n) ? 'erreur' : lignesAvertissement.has(n) ? 'avertissement' : undefined;
            return (
              <span key={n} data-etat={etat}>
                {n}
              </span>
            );
          })}
        </div>
      </div>
      <textarea
        ref={zone}
        id={id}
        className="at-editeur__zone"
        value={valeur}
        wrap="off"
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        aria-describedby={describedBy}
        placeholder={'Colle ici toute la réponse de l’IA (le bloc ````markdown … ````).'}
        onChange={(ev) => onChange(ev.target.value)}
        onScroll={synchroniser}
        onPaste={(ev) => {
          if (!onColler) return;
          const texte = ev.clipboardData.getData('text/plain');
          if (texte && onColler(texte, ev.currentTarget.value.trim() === '')) ev.preventDefault();
        }}
      />
    </div>
  );
});

export default Editeur;
