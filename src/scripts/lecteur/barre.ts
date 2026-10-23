/**
 * Barre de progression de lecture (fine, en haut) et barre d'outils collante.
 *
 *   [data-barre-lecture]   role="progressbar" : --progression (0..1) + aria-valuenow / aria-valuetext
 *   [data-outils-lecteur]  reçoit data-colle quand elle colle en haut (fond verre + ombre)
 */
import { progressionLecture } from './etapes.ts';

export function brancherBarre(article: HTMLElement | null): void {
  const barre = document.querySelector<HTMLElement>('[data-barre-lecture]');
  const outils = document.querySelector<HTMLElement>('[data-outils-lecteur]');
  if (!article) return;
  if (barre) barre.hidden = false;

  let dernier = -1;
  let demande = 0;
  // Petits écrans : la barre d'outils s'efface en lisant vers le bas, revient en remontant.
  const petitEcran = window.matchMedia('(max-width: 1023px)');
  let yPrecedent = window.scrollY;
  // Position « top » de la barre d'outils quand elle est collante (NaN si elle ne colle pas).
  let hautCollant = Number.NaN;
  const mesurer = () => {
    if (!outils) return;
    const s = getComputedStyle(outils);
    hautCollant = s.position === 'sticky' ? parseFloat(s.top) : Number.NaN;
  };

  const maj = () => {
    demande = 0;
    if (document.documentElement.hasAttribute('data-focus')) return;
    if (barre) {
      const r = article.getBoundingClientRect();
      const p = progressionLecture(r.top, r.height, window.innerHeight);
      barre.style.setProperty('--progression', p.toFixed(4));
      const pourcent = Math.round(p * 100);
      if (pourcent !== dernier) {
        dernier = pourcent;
        barre.setAttribute('aria-valuenow', String(pourcent));
        barre.setAttribute('aria-valuetext', `${pourcent} % lu`);
      }
    }
    if (outils) {
      const y = window.scrollY;
      const colle = Number.isFinite(hautCollant) && y > 0 && outils.getBoundingClientRect().top <= hautCollant + 0.5;
      outils.toggleAttribute('data-colle', colle);
      const ecart = y - yPrecedent;
      if (!colle || !petitEcran.matches || ecart < -8) outils.removeAttribute('data-cache');
      else if (ecart > 8) outils.setAttribute('data-cache', '');
      if (Math.abs(ecart) > 8 || !colle) yPrecedent = y;
    }
  };

  const planifier = () => {
    if (!demande) demande = window.requestAnimationFrame(maj);
  };

  mesurer();
  window.addEventListener('scroll', planifier, { passive: true });
  window.addEventListener('resize', () => {
    mesurer();
    planifier();
  }, { passive: true });
  // Le contenu peut changer de hauteur (images, îlots qui s'hydratent) : on recalcule.
  if ('ResizeObserver' in window) new ResizeObserver(planifier).observe(article);
  // Retour du Mode Focus : la page réapparaît, on remet la barre à jour.
  new MutationObserver(planifier).observe(document.documentElement, { attributes: true, attributeFilter: ['data-focus'] });
  maj();
}
