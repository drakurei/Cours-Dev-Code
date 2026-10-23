/**
 * Mode Focus (§5) : une seule étape plein écran à la fois.
 *   [L'essentiel] → chaque notion (section.notion) → [Fin : « J'ai compris ce cours » + épisode suivant]
 *
 * Fonctionne « sur place » : la page ne change pas, <html data-focus="actif"> masque le reste
 * (navigation, pétales, autres sections) et src/styles/lecteur.css agrandit l'étape affichée.
 *   [data-focus-hote]       enfant de l'article qui contient l'étape (#essentiel, #contenu-cours, #lecteur-fin)
 *   [data-focus-courante]   l'étape affichée ; son h2 reçoit data-focus-libelle (« Notion 2 sur 4 »)
 *
 * Commandes : button[data-focus-ouvrir] (partout), [data-focus-quitter], [data-focus-precedent],
 * [data-focus-suivant], points générés dans [data-focus-points], compteur [data-focus-compteur],
 * bouton Écouter [data-focus-ecouter] (vise l'étape courante), annonces [data-focus-annonce].
 * Événement window « manabi:focus » {action: 'ouvrir' | 'fermer' | 'basculer'}.
 * Mémoire : sessionStorage « manabi:focus » {coursId, etape, actif} (voir etapes.ts).
 */
import { marquerSectionVue } from '../../lib/store.ts';
import { arreterLecture } from '../ecouter.ts';
import {
  borner,
  CLE_MEMOIRE,
  construireEtapes,
  ecrireMemoire,
  ID_ESSENTIEL,
  indexEtape,
  libelleCompteur,
  libelleEtape,
  libelleNotion,
  lireMemoire,
  sensBalayage,
  type Etape,
} from './etapes.ts';
import { annoncer, defileHorizontalement, defilerVers, ecrireSession, focaliser, lireSession, mouvementReduit } from './outils.ts';

export interface ControleFocus {
  actif(): boolean;
  /** Ouvre le Mode Focus sur une étape (id), sinon sur la notion à l'écran. */
  ouvrir(etape?: string | null): void;
  fermer(): void;
  basculer(): void;
  aller(index: number): void;
  suivant(): void;
  precedent(): void;
  premiere(): void;
  derniere(): void;
}

interface EtapeDom extends Etape {
  /** Élément affiché. */
  el: HTMLElement;
  /** Enfant de l'article à garder visible. */
  hote: HTMLElement;
  /** Titre focalisé à l'arrivée sur l'étape. */
  elTitre: HTMLElement;
  /** Où revenir dans la page en sortant. */
  retour: HTMLElement;
  /** Sélecteur du texte lu par « Écouter ». */
  lecture: string;
}

export interface OptionsFocus {
  coursId: string;
  /** Section à l'écran (scrollspy), pour ouvrir le Focus là où on lit. */
  sectionCourante?: () => string | null;
}

const ATTR_FOCUS = 'data-focus';

export function brancherFocus({ coursId, sectionCourante }: OptionsFocus): ControleFocus | null {
  const racine = document.documentElement;
  const essentiel = document.getElementById('essentiel');
  const corps = document.getElementById('contenu-cours');
  const fin = document.getElementById('lecteur-fin');
  const finPage = document.getElementById('fin-du-cours');
  if (!essentiel || !corps || !fin) {
    racine.removeAttribute(ATTR_FOCUS);
    return null;
  }

  // ─── Étapes ───
  const sectionsNotions = [...corps.querySelectorAll<HTMLElement>(':scope > section.notion[data-notion]')];
  const parId = new Map(sectionsNotions.map((s) => [s.dataset.notion ?? '', s]));
  const etapes: EtapeDom[] = construireEtapes(
    sectionsNotions.map((s) => ({ id: s.dataset.notion ?? '', titre: s.querySelector(':scope > h2')?.textContent ?? '' })),
  ).map((e) => {
    if (e.type === 'essentiel') {
      const elTitre = document.getElementById('essentiel-titre') ?? essentiel;
      return { ...e, el: essentiel, hote: essentiel, elTitre, retour: essentiel, lecture: '#essentiel-texte' };
    }
    if (e.type === 'fin') {
      const elTitre = document.getElementById('lecteur-fin-titre') ?? fin;
      return { ...e, el: fin, hote: fin, elTitre, retour: finPage ?? fin, lecture: '#lecteur-fin' };
    }
    const el = parId.get(e.id) as HTMLElement;
    const elTitre = el.querySelector<HTMLElement>(':scope > h2') ?? el;
    return { ...e, el, hote: corps, elTitre, retour: el, lecture: `section.notion[data-notion="${CSS.escape(e.id)}"]` };
  });

  // ─── Chrome du Focus ───
  const q = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel);
  const compteur = q('[data-focus-compteur]');
  const listePoints = q('[data-focus-points]');
  const btnPrecedent = q<HTMLButtonElement>('[data-focus-precedent]');
  const btnSuivant = q<HTMLButtonElement>('[data-focus-suivant]');
  const btnEcouter = q<HTMLButtonElement>('[data-focus-ecouter]');
  const zoneAnnonce = q('[data-focus-annonce]');
  const tete = q('[data-focus-tete]');
  const pied = q('[data-focus-pied]');

  const points: HTMLButtonElement[] = etapes.map((e, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'focus-point';
    btn.dataset.focusAller = String(i);
    btn.dataset.titre = e.titre;
    btn.dataset.type = e.type;
    btn.setAttribute('aria-label', libelleEtape(etapes, i));
    li.append(btn);
    listePoints?.append(li);
    return btn;
  });

  let index = 0;

  const actif = () => racine.getAttribute(ATTR_FOCUS) === 'actif';

  const memoriser = (ouvert: boolean) => {
    const e = etapes[index];
    if (e) ecrireSession(CLE_MEMOIRE, ecrireMemoire({ coursId, etape: e.id, actif: ouvert }));
  };

  const nettoyer = () => {
    for (const el of document.querySelectorAll('[data-focus-hote]')) el.removeAttribute('data-focus-hote');
    for (const el of document.querySelectorAll('[data-focus-courante]')) el.removeAttribute('data-focus-courante');
  };

  const majChrome = () => {
    const e = etapes[index];
    if (compteur) compteur.textContent = libelleCompteur(index, etapes.length);
    points.forEach((p, i) => {
      p.dataset.etat = i < index ? 'passee' : i === index ? 'courante' : 'a-venir';
      if (i === index) p.setAttribute('aria-current', 'step');
      else p.removeAttribute('aria-current');
    });
    btnPrecedent?.setAttribute('aria-disabled', String(index === 0));
    btnSuivant?.setAttribute('aria-disabled', String(index === etapes.length - 1));
    if (btnEcouter && e) {
      btnEcouter.dataset.ecouter = e.lecture;
      const precision = btnEcouter.querySelector('[data-focus-ecouter-titre]');
      if (precision) precision.textContent = ` : ${e.titre}`;
    }
    majOmbres();
  };

  // Filets sous l'en-tête / au-dessus du pied quand le texte passe dessous.
  const majOmbres = () => {
    if (!actif()) return;
    const doc = document.scrollingElement ?? racine;
    tete?.toggleAttribute('data-defile', window.scrollY > 4);
    pied?.toggleAttribute('data-defile', window.scrollY + window.innerHeight < doc.scrollHeight - 4);
  };

  const animer = (el: HTMLElement, sens: -1 | 0 | 1) => {
    if (mouvementReduit() || typeof el.animate !== 'function') return;
    const depart = sens === 0 ? 'translateY(8px)' : `translateX(${sens * 20}px)`;
    el.animate([{ opacity: 0, transform: depart }, { opacity: 1, transform: 'none' }], {
      duration: 280,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    });
  };

  /**
   * Affiche l'étape i. `entree` : ouverture du Focus. `garderFocus` : clic sur un bouton du pied,
   * le focus clavier y reste (pour enchaîner) et l'annonce donne le titre de l'étape.
   */
  const afficher = (i: number, sens: -1 | 0 | 1, { entree = false, garderFocus = false } = {}) => {
    const j = borner(i, etapes.length);
    const e = etapes[j];
    if (!e || (!entree && j === index && actif())) return;
    arreterLecture(); // changer d'étape coupe la voix
    nettoyer();
    racine.setAttribute(ATTR_FOCUS, 'actif');
    e.hote.setAttribute('data-focus-hote', '');
    e.el.setAttribute('data-focus-courante', '');
    if (e.type === 'notion') e.elTitre.dataset.focusLibelle = libelleNotion(etapes, j);
    index = j;
    majChrome();
    window.scrollTo({ top: 0, behavior: 'instant' });
    animer(e.el, sens);
    if (!garderFocus) focaliser(e.elTitre);
    if (e.type === 'notion') marquerSectionVue(coursId, e.id);
    memoriser(true);
    if (garderFocus) annoncer(zoneAnnonce, libelleEtape(etapes, j));
    else if (!entree) annoncer(zoneAnnonce, `Étape ${j + 1} sur ${etapes.length}`);
  };

  /** Étape correspondant à ce qu'on lit dans la page. */
  const etapeDepuisPage = (): number => {
    const id = sectionCourante?.() ?? null;
    if (!id) return 0;
    const i = indexEtape(etapes, id);
    if (i >= 0) return i;
    return id === ID_ESSENTIEL ? 0 : etapes.length - 1; // sections de révision : après les notions
  };

  const ouvrir = (etape?: string | null) => {
    const demandee = etape ? indexEtape(etapes, etape) : -1;
    const i = demandee >= 0 ? demandee : etapeDepuisPage();
    if (actif()) return afficher(i, i > index ? 1 : -1);
    afficher(i, 0, { entree: true });
    annoncer(zoneAnnonce, `Mode Focus, étape ${index + 1} sur ${etapes.length}. Échap pour quitter.`);
  };

  const fermer = () => {
    if (!actif()) {
      racine.removeAttribute(ATTR_FOCUS); // état « attente » du script en ligne
      return;
    }
    const e = etapes[index];
    arreterLecture();
    nettoyer();
    racine.removeAttribute(ATTR_FOCUS);
    tete?.removeAttribute('data-defile');
    pied?.removeAttribute('data-defile');
    memoriser(false);
    if (e) {
      defilerVers(e.retour, true); // retour à la position de l'étape dans la page
      focaliser(e.type === 'fin' ? e.retour : e.elTitre);
    }
    annoncer(zoneAnnonce, 'Mode Focus fermé.');
  };

  const controle: ControleFocus = {
    actif,
    ouvrir,
    fermer,
    basculer: () => (actif() ? fermer() : ouvrir()),
    aller: (i) => afficher(i, i > index ? 1 : -1),
    suivant: () => {
      if (index < etapes.length - 1) afficher(index + 1, 1);
    },
    precedent: () => {
      if (index > 0) afficher(index - 1, -1);
    },
    premiere: () => afficher(0, -1),
    derniere: () => afficher(etapes.length - 1, 1),
  };

  // ─── Branchements ───
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-focus-ouvrir]')) {
    btn.hidden = false;
    btn.addEventListener('click', () => ouvrir());
  }
  document.addEventListener('click', (ev) => {
    const cible = ev.target as Element | null;
    if (!cible || !actif()) return;
    const bouton = cible.closest<HTMLButtonElement>('button');
    if (!bouton || bouton.getAttribute('aria-disabled') === 'true') return;
    const garder = { garderFocus: true };
    if (bouton.matches('[data-focus-quitter]')) fermer();
    else if (bouton.matches('[data-focus-precedent]')) afficher(index - 1, -1, garder);
    else if (bouton.matches('[data-focus-suivant]')) afficher(index + 1, 1, garder);
    else if (bouton.dataset.focusAller !== undefined) {
      const i = Number(bouton.dataset.focusAller);
      afficher(i, i > index ? 1 : -1, garder);
    }
  });

  // Épisode suivant choisi depuis le Focus : on enchaîne en Focus sur le prochain cours.
  for (const lien of document.querySelectorAll<HTMLAnchorElement>('a[data-focus-continuer][data-cours-suivant]')) {
    lien.addEventListener('click', () => {
      if (!actif()) return;
      const suivant = lien.dataset.coursSuivant ?? '';
      ecrireSession(CLE_MEMOIRE, ecrireMemoire({ coursId: suivant, etape: ID_ESSENTIEL, actif: true }));
    });
  }

  window.addEventListener('manabi:focus', (ev) => {
    const action = (ev as CustomEvent<{ action?: string } | undefined>).detail?.action;
    if (action === 'ouvrir') ouvrir();
    else if (action === 'fermer') fermer();
    else if (action === 'basculer') controle.basculer();
  });

  // Balayage gauche / droite au doigt (sauf sur un code ou un tableau qui défile).
  let depart: { x: number; y: number; t: number } | null = null;
  document.addEventListener(
    'touchstart',
    (ev) => {
      const t = ev.touches[0];
      depart = actif() && ev.touches.length === 1 && t && !defileHorizontalement(ev.target) ? { x: t.clientX, y: t.clientY, t: ev.timeStamp } : null;
    },
    { passive: true },
  );
  document.addEventListener(
    'touchend',
    (ev) => {
      const t = ev.changedTouches[0];
      if (!depart || !t || !actif()) return;
      const sens = sensBalayage({ dx: t.clientX - depart.x, dy: t.clientY - depart.y, duree: ev.timeStamp - depart.t });
      depart = null;
      if (sens === 1) controle.suivant();
      else if (sens === -1) controle.precedent();
    },
    { passive: true },
  );
  document.addEventListener('touchcancel', () => (depart = null), { passive: true });

  let demande = 0;
  window.addEventListener(
    'scroll',
    () => {
      if (!demande) demande = window.requestAnimationFrame(() => ((demande = 0), majOmbres()));
    },
    { passive: true },
  );

  // Rechargement (ou épisode enchaîné) : on reprend l'étape mémorisée.
  const memoire = lireMemoire(lireSession(CLE_MEMOIRE), coursId);
  if (memoire?.actif) ouvrir(memoire.etape);
  else racine.removeAttribute(ATTR_FOCUS);

  return controle;
}
