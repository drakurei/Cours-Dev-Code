/**
 * Sommaire du cours : scrollspy, notions vues, temps restant, feuille mobile.
 *
 *   a[data-sommaire="id"]          lien du rail (aside.sommaire) ou de la feuille ; reçoit
 *                                  aria-current="location" quand sa section est à l'écran,
 *                                  data-vue="true" quand la notion est vue ([data-sommaire-etat] = « vue »).
 *   [data-sommaire-reste]          « Environ 5 min restantes » / « Tout est lu ».
 *   button[data-sommaire-ouvrir]   ouvre dialog#lecteur-feuille-sommaire (< 1280 px).
 *   [data-fermer-feuille-sommaire] ferme la feuille.
 */
import { abonner, lire, type Etat } from '../../lib/store.ts';
import { libelleRestant, minutesRestantes, sectionCourante } from './etapes.ts';
import { defilerVers, focaliser } from './outils.ts';

export interface ControleSommaire {
  /** Id de la section à l'écran (« essentiel », id de notion, « quiz »…), ou null. */
  courante(): string | null;
  /** Sections suivies, dans l'ordre de la page. */
  cibles(): HTMLElement[];
}

/** Élément d'une section du sommaire : la section.notion d'un titre ##, sinon l'élément de cet id. */
export function sectionDe(id: string): HTMLElement | null {
  const el = document.getElementById(id);
  if (!el) return null;
  return el.closest<HTMLElement>('section.notion[data-notion]') ?? el;
}

/** Titre à focaliser pour une section (h2 d'une notion, titre d'une section de révision). */
export function titreDe(section: HTMLElement): HTMLElement {
  return section.querySelector<HTMLElement>('h2') ?? section;
}

/** Ligne de lecture : une section devient « courante » quand son haut la dépasse. */
const ligneLecture = () => Math.min(window.innerHeight * 0.3, 260);

export function brancherSommaire(coursId: string, duree: number): ControleSommaire {
  const liens = [...document.querySelectorAll<HTMLAnchorElement>('a[data-sommaire]')];
  const ids = [...new Set(liens.map((a) => a.dataset.sommaire ?? '').filter(Boolean))];
  const sections = ids.map((id) => ({ id, el: sectionDe(id) })).filter((s): s is { id: string; el: HTMLElement } => !!s.el);
  const notions = new Set(
    [...document.querySelectorAll<HTMLElement>('#contenu-cours section.notion[data-notion]')].map((n) => n.dataset.notion ?? ''),
  );
  let courante: string | null = null;

  // ─── Scrollspy ───
  const marquer = (id: string | null) => {
    if (id === courante) return;
    courante = id;
    for (const a of liens) {
      if (a.dataset.sommaire === id) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    }
    garderVisible();
  };

  // Le lien actif reste visible dans le rail s'il déborde (sans faire défiler la page).
  const rail = document.querySelector<HTMLElement>('aside.sommaire .sommaire__nav');
  const garderVisible = () => {
    const lien = rail?.querySelector<HTMLElement>('a[aria-current="location"]');
    if (!rail || !lien || rail.scrollHeight <= rail.clientHeight) return;
    const r = rail.getBoundingClientRect();
    const l = lien.getBoundingClientRect();
    if (l.top < r.top + 8) rail.scrollTop -= r.top + 8 - l.top;
    else if (l.bottom > r.bottom - 8) rail.scrollTop += l.bottom - (r.bottom - 8);
  };

  const recalculer = () => {
    if (!sections.length || document.documentElement.hasAttribute('data-focus')) return;
    const hauts = sections.map((s) => s.el.getBoundingClientRect().top);
    const racine = document.scrollingElement ?? document.documentElement;
    const enBas = window.innerHeight + window.scrollY >= racine.scrollHeight - 2;
    const i = sectionCourante(hauts, ligneLecture(), { enBas, hauteurVue: window.innerHeight });
    marquer(sections[i]?.id ?? null);
  };

  if ('IntersectionObserver' in window && sections.length) {
    const observateur = new IntersectionObserver(recalculer, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
    for (const s of sections) observateur.observe(s.el);
  }
  window.addEventListener('scrollend', recalculer, { passive: true });
  window.addEventListener('resize', recalculer, { passive: true });
  recalculer();

  // ─── Notions vues + temps restant ───
  const zonesReste = document.querySelectorAll<HTMLElement>('[data-sommaire-reste]');
  const appliquer = (etat: Etat) => {
    const p = etat.progression[coursId];
    const vues = new Set(p?.sectionsVues ?? []);
    for (const a of liens) {
      const id = a.dataset.sommaire ?? '';
      if (!notions.has(id)) continue;
      const vue = vues.has(id);
      a.dataset.vue = String(vue);
      const etatTexte = a.querySelector('[data-sommaire-etat]');
      if (etatTexte) etatTexte.textContent = vue ? ' (vue)' : '';
    }
    const nbVues = [...notions].filter((id) => vues.has(id)).length;
    const texte = libelleRestant(minutesRestantes(duree, nbVues, notions.size, p?.termine));
    for (const z of zonesReste) z.textContent = texte;
  };
  appliquer(lire());
  abonner(appliquer);

  // ─── Feuille « Sommaire » (petits écrans) ───
  const feuille = document.getElementById('lecteur-feuille-sommaire') as HTMLDialogElement | null;
  if (feuille && typeof feuille.showModal === 'function') {
    for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-sommaire-ouvrir]')) {
      btn.hidden = false;
      btn.addEventListener('click', () => feuille.showModal());
    }
    feuille.addEventListener('click', (ev) => {
      const cible = ev.target as Element;
      // Clic sur le voile (hors du contenu) ou sur un bouton de fermeture.
      if (cible === feuille || cible.closest('[data-fermer-feuille-sommaire]')) {
        feuille.close();
        return;
      }
      const lien = cible.closest<HTMLAnchorElement>('a[data-sommaire]');
      const section = lien ? sectionDe(lien.dataset.sommaire ?? '') : null;
      if (!lien || !section) return;
      ev.preventDefault();
      feuille.close();
      history.replaceState(history.state, '', `#${lien.dataset.sommaire}`);
      defilerVers(section);
      focaliser(titreDe(section));
    });
  }

  return {
    courante: () => courante,
    cibles: () => sections.map((s) => s.el),
  };
}
