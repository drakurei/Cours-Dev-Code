/**
 * Génération automatique avec Claude (streaming), gardée au niveau de l'Atelier :
 * changer d'étape ne coupe pas la réponse en cours. Le texte est affiché au fil de l'eau
 * (une mise à jour par image d'écran au plus).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ErreurClaude, genererAvecClaude, type BlocContenu, type EtatGeneration } from '../../lib/atelier/anthropic.ts';

export type StatutGeneration = 'repos' | 'en-cours' | 'fini' | 'erreur';

export interface Generation {
  statut: StatutGeneration;
  phase: EtatGeneration | null;
  texte: string;
  erreur: ErreurClaude | null;
  modele: string | null;
  lancer: (o: { cle: string; modele: string; contenu: BlocContenu[] }) => void;
  arreter: () => void;
  oublier: () => void;
}

export function useGeneration(surFini: (texte: string) => void): Generation {
  const [statut, setStatut] = useState<StatutGeneration>('repos');
  const [phase, setPhase] = useState<EtatGeneration | null>(null);
  const [texte, setTexte] = useState('');
  const [erreur, setErreur] = useState<ErreurClaude | null>(null);
  const [modele, setModele] = useState<string | null>(null);
  const controle = useRef<AbortController | null>(null);
  const tampon = useRef('');
  const image = useRef(0);
  const fini = useRef(surFini);
  fini.current = surFini;

  useEffect(() => () => controle.current?.abort(), []);

  const lancer = useCallback<Generation['lancer']>(({ cle, modele: m, contenu }) => {
    controle.current?.abort();
    const c = new AbortController();
    controle.current = c;
    tampon.current = '';
    setTexte('');
    setErreur(null);
    setModele(m);
    setStatut('en-cours');
    setPhase({ phase: 'connexion' });

    const vider = () => {
      image.current = 0;
      setTexte(tampon.current);
    };

    genererAvecClaude({
      cle,
      modele: m,
      contenu,
      signal: c.signal,
      surTexte: (_morceau, total) => {
        tampon.current = total;
        if (!image.current) image.current = window.requestAnimationFrame(vider);
      },
      surEtat: (e) => {
        // « écriture » change à chaque morceau : on n'en garde que le premier pour l'état.
        setPhase((avant) => (e.phase === 'ecriture' && avant?.phase === 'ecriture' ? avant : e));
      },
    })
      .then((r) => {
        if (controle.current !== c) return;
        window.cancelAnimationFrame(image.current);
        image.current = 0;
        setTexte(r.texte);
        setModele(r.modele);
        setStatut('fini');
        setPhase(null);
        fini.current(r.texte);
      })
      .catch((e: unknown) => {
        if (controle.current !== c) return;
        window.cancelAnimationFrame(image.current);
        image.current = 0;
        const err = e instanceof ErreurClaude ? e : new ErreurClaude('Erreur inattendue pendant la génération.', 'serveur');
        setTexte(err.partiel || tampon.current);
        setErreur(err);
        setStatut('erreur');
        setPhase(null);
      });
  }, []);

  const arreter = useCallback(() => controle.current?.abort(), []);
  const oublier = useCallback(() => {
    controle.current?.abort();
    controle.current = null;
    setStatut('repos');
    setTexte('');
    setErreur(null);
    setPhase(null);
  }, []);

  return { statut, phase, texte, erreur, modele, lancer, arreter, oublier };
}
