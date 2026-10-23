/**
 * Palette de commandes : chercher un cours, une notion, une définition, une page, lancer une action.
 *
 * S'ouvre avec ⌘/Ctrl K, « / » (hors champ de saisie), l'événement window « manabi:recherche »
 * (detail facultatif : { requete }) et tout clic sur [data-action="recherche"].
 * « ? » ouvre la feuille des raccourcis (même îlot).
 *
 * L'index (/search-index.json) et MiniSearch ne sont chargés qu'à la première ouverture
 * (ou dès que le pointeur survole un bouton de recherche). Motif ARIA combobox + listbox groupée.
 */
import { useCallback, useDeferredValue, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { compterCartesDues } from '../lib/store.ts';
import { chercher, compterResultats, rechercheSimple, grouper, type Moteur } from '../lib/recherche/moteur.ts';
import { ajouterRecente, ecrireRecentes, lireRecentes } from '../lib/recherche/recents.ts';
import type { DocRecherche, MatiereIndex } from '../lib/recherche/types.ts';
import { pluriel } from '../lib/texte.ts';
import { useManabi } from './useManabi.ts';
import {
  actionDisponible,
  documentsActions,
  executerAction,
  idAction,
  idDoc,
  ORDRE_ACTIONS,
  urlsCouvertes,
  type ContexteActions,
} from './recherche/actions.ts';
import { chargerRecherche, moteurDeSecours, prechargerRecherche, type Recherche } from './recherche/chargement.ts';
import { IconePalette } from './recherche/icones.tsx';
import OptionPalette from './recherche/OptionPalette.tsx';
import Raccourcis from './recherche/Raccourcis.tsx';
import { aplatir, groupesRecherche, groupesVides, type OptionVue } from './recherche/vue.ts';
import './palette.css';

export interface EntreePalette {
  titre: string;
  url: string;
  kanji?: string;
  /** Texte secondaire (rubrique, description courte). */
  detail?: string;
}

interface Props {
  pages: EntreePalette[];
}

type EtatIndex = 'inactif' | 'chargement' | 'pret' | 'erreur';

const CHAMPS_TEXTE = /^(text|search|email|url|tel|password|number|date|datetime-local|month|week|time)$/i;

/** Vrai si l'utilisateur écrit dans un champ (« / » et « ? » doivent alors rester des caractères). */
function dansUnChamp(cible: EventTarget | null): boolean {
  const el = cible as HTMLElement | null;
  if (!el || !(el instanceof HTMLElement)) return false;
  if (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
  return el.tagName === 'INPUT' && CHAMPS_TEXTE.test((el as HTMLInputElement).type || 'text');
}

const VIDE: Record<string, MatiereIndex> = {};

export default function CommandPalette({ pages }: Props) {
  const dialogue = useRef<HTMLDialogElement>(null);
  const feuille = useRef<HTMLDialogElement>(null);
  const champ = useRef<HTMLInputElement>(null);
  const appuiSurVoile = useRef(false);
  const base = useId();

  const [requete, setRequete] = useState('');
  const [actif, setActif] = useState(0);
  const [etatIndex, setEtatIndex] = useState<EtatIndex>('inactif');
  const [recherche, setRecherche] = useState<Recherche | null>(null);
  const [secours, setSecours] = useState<Moteur | null>(null);
  const [recentes, setRecentes] = useState<string[]>([]);
  const [page, setPage] = useState({ surCours: false, enFocus: false });
  const [annonce, setAnnonce] = useState('');

  const theme = useManabi((e) => e.prefs.theme);
  const minutes = useManabi((e) => e.prefs.minuteur);
  const progression = useManabi((e) => e.progression);
  const cartesDues = useManabi((e) => compterCartesDues(e));

  const requeteDifferee = useDeferredValue(requete);

  const contexte: ContexteActions = useMemo(
    () => ({ ...page, theme, minutes, cartesDues, requete: requeteDifferee }),
    [page, theme, minutes, cartesDues, requeteDifferee],
  );

  // Documents propres à la page : actions + pages reçues du layout.
  const docsActions = useMemo(() => documentsActions(), []);
  const docsPages = useMemo<DocRecherche[]>(
    () =>
      pages.map((p) => ({
        id: `page:${p.url}`,
        type: 'page',
        titre: p.titre,
        url: p.url,
        texte: p.detail ?? '',
        ...(p.kanji ? { kanji: p.kanji } : {}),
        ...(p.detail ? { detail: p.detail } : {}),
      })),
    [pages],
  );
  const couvertes = useMemo(() => new Set(urlsCouvertes()), []);

  // ─── Chargement de l'index ─────────────────────────────────────────────────

  const etatCharge = useRef<EtatIndex>('inactif');
  const charger = useCallback(() => {
    if (etatCharge.current === 'chargement' || etatCharge.current === 'pret') return;
    const fixer = (e: EtatIndex) => {
      etatCharge.current = e;
      setEtatIndex(e);
    };
    fixer('chargement');
    const supplements = [...docsActions, ...docsPages];
    chargerRecherche(supplements)
      .then((r) => {
        setRecherche(r);
        fixer('pret');
      })
      .catch(async () => {
        fixer('erreur'); // un nouvel essai aura lieu à la prochaine ouverture
        setSecours(await moteurDeSecours(supplements));
      });
  }, [docsActions, docsPages]);

  // ─── Ouvrir / fermer ───────────────────────────────────────────────────────

  const ouvrir = useCallback(
    (requeteInitiale = '') => {
      const d = dialogue.current;
      if (!d) return;
      if (feuille.current?.open) feuille.current.close();
      if (d.open) {
        champ.current?.focus();
        champ.current?.select();
        return;
      }
      setRequete(requeteInitiale);
      setActif(0);
      setRecentes(lireRecentes());
      setPage({
        surCours: !!document.querySelector('[data-notions-cours]'),
        enFocus: document.documentElement.hasAttribute('data-focus'),
      });
      d.showModal();
      champ.current?.focus();
      charger();
    },
    [charger],
  );

  const fermer = useCallback(() => {
    if (dialogue.current?.open) dialogue.current.close();
  }, []);

  const ouvrirRaccourcis = useCallback(() => {
    fermer();
    const f = feuille.current;
    if (f && !f.open) {
      f.showModal();
      // Le focus va sur le contenu (lisible et défilable au clavier), pas sur le bouton Fermer.
      f.querySelector<HTMLElement>('[data-contenu-feuille]')?.focus();
    }
  }, [fermer]);

  const fermerRaccourcis = useCallback(() => {
    if (feuille.current?.open) feuille.current.close();
  }, []);

  // Raccourcis globaux, clics sur [data-action="recherche"], événement « manabi:recherche ».
  useEffect(() => {
    const surTouche = (ev: globalThis.KeyboardEvent) => {
      if (ev.defaultPrevented || ev.isComposing) return;
      const mod = ev.metaKey || ev.ctrlKey;
      if (mod && !ev.altKey && !ev.shiftKey && ev.key.toLowerCase() === 'k') {
        ev.preventDefault();
        if (dialogue.current?.open) fermer();
        else ouvrir();
        return;
      }
      if (mod || ev.altKey || dansUnChamp(ev.target)) return;
      if (ev.key === '/') {
        ev.preventDefault();
        ouvrir();
      } else if (ev.key === '?') {
        ev.preventDefault();
        if (feuille.current?.open) fermerRaccourcis();
        else ouvrirRaccourcis();
      }
    };
    const surClic = (ev: MouseEvent) => {
      if ((ev.target as Element | null)?.closest?.('[data-action="recherche"]')) ouvrir();
    };
    // Intention d'ouvrir (survol, focus) : on commence à télécharger l'index.
    const surIntention = (ev: Event) => {
      if ((ev.target as Element | null)?.closest?.('[data-action="recherche"]')) prechargerRecherche().catch(() => {});
    };
    const surEvenement = (ev: Event) => {
      const r = (ev as CustomEvent<{ requete?: unknown } | null>).detail?.requete;
      ouvrir(typeof r === 'string' ? r : '');
    };
    window.addEventListener('keydown', surTouche);
    document.addEventListener('click', surClic);
    document.addEventListener('pointerover', surIntention, { passive: true });
    document.addEventListener('focusin', surIntention);
    window.addEventListener('manabi:recherche', surEvenement);
    return () => {
      window.removeEventListener('keydown', surTouche);
      document.removeEventListener('click', surClic);
      document.removeEventListener('pointerover', surIntention);
      document.removeEventListener('focusin', surIntention);
      window.removeEventListener('manabi:recherche', surEvenement);
    };
  }, [ouvrir, fermer, ouvrirRaccourcis, fermerRaccourcis]);

  // ─── Résultats ─────────────────────────────────────────────────────────────

  const moteur = recherche?.moteur ?? secours;
  const matieres = recherche?.index.matieres ?? VIDE;
  const q = requeteDifferee.trim();

  const filtre = useCallback(
    (doc: DocRecherche) => {
      const ida = idAction(doc.id);
      if (ida) return actionDisponible(ida, contexte);
      return !(doc.type === 'page' && couvertes.has(doc.url));
    },
    [contexte, couvertes],
  );

  const { groupes, nbTrouves } = useMemo(() => {
    if (!q) {
      return {
        groupes: groupesVides({
          docs: recherche?.moteur.docs ?? null,
          progression,
          recentes,
          actions: ORDRE_ACTIONS.filter((id) => actionDisponible(id, contexte)).map(
            (id) => docsActions.find((d) => d.id === idDoc(id)) as DocRecherche,
          ),
          pages: docsPages.filter((d) => !couvertes.has(d.url)),
        }),
        nbTrouves: 0,
      };
    }
    const bruts = moteur ? chercher(moteur, q, { filtre }) : grouper(rechercheSimple([...docsActions, ...docsPages], q, filtre));
    const glossaire: DocRecherche[] = actionDisponible('glossaire', contexte)
      ? [{ id: idDoc('glossaire'), type: 'action', titre: 'Chercher dans le glossaire', url: '', texte: '' }]
      : [];
    return { groupes: groupesRecherche(bruts, glossaire), nbTrouves: compterResultats(bruts) };
  }, [q, moteur, filtre, recherche, progression, recentes, contexte, docsActions, docsPages, couvertes]);

  const options = useMemo(() => aplatir(groupes), [groupes]);
  const indexActif = options.length ? Math.min(actif, options.length - 1) : -1;
  const idListe = `${base}-liste`;
  const idOption = (i: number) => `${base}-o-${i}`;
  const chargeEncore = !!q && etatIndex === 'chargement' && !recherche;

  // Option active toujours visible quand on navigue au clavier.
  useEffect(() => {
    if (indexActif < 0) return;
    document.getElementById(idOption(indexActif))?.scrollIntoView({ block: 'nearest' });
  }, [indexActif, groupes]);

  // Annonce du nombre de résultats (après une courte pause dans la frappe).
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!q) setAnnonce('');
      else if (chargeEncore) setAnnonce('Chargement de la recherche…');
      else setAnnonce(nbTrouves ? `${pluriel(nbTrouves, 'résultat')} pour « ${q} ».` : `Aucun résultat pour « ${q} ».`);
    }, 450);
    return () => window.clearTimeout(t);
  }, [q, nbTrouves, chargeEncore]);

  // ─── Choisir une option ────────────────────────────────────────────────────

  const choisir = (o: OptionVue, nouvelOnglet = false) => {
    if (o.genre === 'recente' && o.recente) {
      setRequete(o.recente);
      setActif(0);
      champ.current?.focus();
      return;
    }
    if (o.genre === 'effacer') {
      ecrireRecentes([]);
      setRecentes([]);
      setActif(0);
      champ.current?.focus();
      return;
    }
    const doc = o.doc;
    if (!doc) return;
    const ida = idAction(doc.id);
    // On garde les recherches de contenu (pas « sombre » pour changer de thème).
    if (requete.trim() && (!ida || ida === 'glossaire')) {
      const liste = ajouterRecente(recentes, requete);
      ecrireRecentes(liste);
      setRecentes(liste);
    }
    if (ida) {
      fermer();
      executerAction(ida, { ...contexte, requete }, { ouvrirRaccourcis }, nouvelOnglet);
      return;
    }
    if (nouvelOnglet) {
      window.open(doc.url, '_blank', 'noopener');
      return;
    }
    fermer();
    window.location.assign(doc.url);
  };

  const surClavier = (ev: KeyboardEvent<HTMLDialogElement>) => {
    // Rien ne remonte jusqu'au lecteur ni à la révision tant que la palette est ouverte.
    ev.stopPropagation();
    const mod = ev.metaKey || ev.ctrlKey;
    if (mod && ev.key.toLowerCase() === 'k') {
      ev.preventDefault();
      fermer();
      return;
    }
    if (ev.nativeEvent.isComposing) return;
    // Échap ferme toujours (un champ « search » viderait d'abord le texte).
    if (ev.key === 'Escape') {
      ev.preventDefault();
      fermer();
      return;
    }
    if (ev.target !== champ.current) return;
    const n = options.length;
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      if (!n) return;
      const pas = ev.key === 'ArrowDown' ? 1 : -1;
      setActif((indexActif + pas + n) % n);
    } else if ((ev.key === 'PageDown' || ev.key === 'PageUp') && n) {
      ev.preventDefault();
      setActif(Math.max(0, Math.min(n - 1, indexActif + (ev.key === 'PageDown' ? 5 : -5))));
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      const o = options[indexActif];
      if (o) choisir(o, mod);
    }
  };

  const surToucheFeuille = (ev: KeyboardEvent<HTMLDialogElement>) => {
    const mod = ev.metaKey || ev.ctrlKey;
    if (ev.key === '?' && !mod) {
      ev.preventDefault();
      fermerRaccourcis();
    } else if ((ev.key === '/' && !mod) || (mod && ev.key.toLowerCase() === 'k')) {
      ev.preventDefault();
      ouvrir();
    }
  };

  // ─── Rendu ─────────────────────────────────────────────────────────────────

  let indexOption = -1;
  const rienTrouve = !!q && !chargeEncore && nbTrouves === 0;

  return (
    <>
      <dialog
        ref={dialogue}
        className="palette verre"
        aria-label="Recherche"
        onKeyDown={surClavier}
        onPointerDown={(ev) => {
          appuiSurVoile.current = ev.target === ev.currentTarget;
        }}
        onClick={(ev) => {
          // Clic sur le voile (et pas la fin d'une sélection de texte commencée dans le champ).
          if (ev.target === ev.currentTarget && appuiSurVoile.current) fermer();
        }}
      >
        <div className="palette__boite">
          <div className="palette__champ">
            <IconePalette nom="recherche" taille={20} className="palette__loupe" />
            <input
              ref={champ}
              type="search"
              enterKeyHint="go"
              value={requete}
              onChange={(ev) => {
                setRequete(ev.target.value);
                setActif(0);
              }}
              placeholder="Cours, mot, action…"
              aria-label="Rechercher dans Manabi"
              role="combobox"
              aria-expanded={options.length > 0}
              aria-controls={options.length ? idListe : undefined}
              aria-autocomplete="list"
              aria-activedescendant={indexActif >= 0 ? idOption(indexActif) : undefined}
              aria-describedby={`${base}-aide`}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            {requete && (
              <button
                type="button"
                className="palette__effacer"
                aria-label="Effacer la recherche"
                onClick={() => {
                  setRequete('');
                  setActif(0);
                  champ.current?.focus();
                }}
              >
                <IconePalette nom="effacer" taille={16} />
              </button>
            )}
            <button type="button" className="palette__fermer" onClick={fermer}>
              <span className="palette__fermer-bureau">Échap</span>
              <span className="palette__fermer-mobile">Annuler</span>
            </button>
          </div>

          <div className="palette__corps">
            {rienTrouve && (
              <div className="palette__vide">
                <span className="palette__vide-kanji" lang="ja" aria-hidden="true">
                  迷子
                </span>
                <p className="palette__vide-titre">Rien trouvé pour « {q} »</p>
                <p className="palette__vide-texte">Essaie un mot plus court, ou sans accent.</p>
              </div>
            )}
            {chargeEncore && (
              <p className="palette__info">
                <span className="palette__sablier" aria-hidden="true" />
                Chargement de la recherche…
              </p>
            )}
            {etatIndex === 'erreur' && (
              <p className="palette__info">Recherche des cours indisponible (hors ligne ?). Les pages et les actions restent là.</p>
            )}

            {options.length > 0 && (
              <div className="palette__liste" id={idListe} role="listbox" aria-label={q ? 'Résultats' : 'Suggestions'}>
                {groupes.map((g) => {
                  const idTitre = `${base}-g-${g.cle}`;
                  return (
                    <ul key={g.cle} className="palette__groupe" role="group" aria-labelledby={idTitre} data-groupe={g.cle}>
                      <li className="palette__groupe-titre" id={idTitre} role="presentation">
                        {g.titre}
                      </li>
                      {g.options.map((o) => {
                        indexOption += 1;
                        const i = indexOption;
                        return (
                          <OptionPalette
                            key={o.cle}
                            option={o}
                            id={idOption(i)}
                            actif={i === indexActif}
                            matieres={matieres}
                            contexte={contexte}
                            onSurvol={() => setActif(i)}
                            onChoisir={(nouvelOnglet) => choisir(o, nouvelOnglet)}
                          />
                        );
                      })}
                    </ul>
                  );
                })}
              </div>
            )}
          </div>

          <p className="sr-only" id={`${base}-aide`}>
            Flèches haut et bas pour choisir, Entrée pour ouvrir, Échap pour fermer.
          </p>
          <p className="palette__pied" aria-hidden="true">
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> pour choisir
            </span>
            <span>
              <kbd>↵</kbd> pour ouvrir
            </span>
            <span>
              <kbd>Échap</kbd> pour fermer
            </span>
            <span className="palette__pied-droite">
              <kbd>?</kbd> raccourcis
            </span>
          </p>
          <p className="sr-only" role="status">
            {annonce}
          </p>
        </div>
      </dialog>

      <Raccourcis ref={feuille} surTouche={surToucheFeuille} onFermer={fermerRaccourcis} />
    </>
  );
}

