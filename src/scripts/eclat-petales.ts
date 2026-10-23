/**
 * Éclat de pétales 花びら : à chaque « manabi:petales », une petite gerbe de 5 à 8 pétales
 * près de l'élément touché (ou en haut à droite), et l'annonce « +N pétales » pour les lecteurs d'écran.
 * Pas d'animation si : animations réduites (système ou réglage), pétales désactivés, Mode Focus.
 * L'annonce, elle, reste toujours.
 */
import { EVENEMENT_PETALES, type GainPetales } from '../lib/store.ts';

const TRACE = 'M10 23C4 19 1.5 12 3 6.5 4 3 7 1.5 8.8 3.6L10 5l1.2-1.4C13 1.5 16 3 17 6.5c1.5 5.5-1 12.5-7 16.5Z';
const SVG = 'http://www.w3.org/2000/svg';
/** Au-delà, une nouvelle gerbe attend que les précédentes soient retombées. */
const MAX_VIVANTS = 32;
/** Les gains rapprochés sont additionnés en une seule annonce. */
const DELAI_ANNONCE = 450;
/** Une interaction plus ancienne ne sert plus d'origine à la gerbe. */
const FRAICHEUR = 2500;

const html = document.documentElement;
const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)');

let vivants = 0;
let cumul = 0;
let minuterieAnnonce = 0;
let derniere: { cible: Element; t: number } | null = null;

/** 1 → 5 pétales, 2 → 6, 4 → 7, 8 et plus → 8. */
export function nombrePetales(n: number): number {
  return Math.min(8, 5 + Math.floor(Math.log2(Math.max(1, n))));
}

export function texteAnnonce(n: number): string {
  return `+${n} pétale${n > 1 ? 's' : ''}`;
}

function animationsPermises(): boolean {
  return (
    !mouvementReduit.matches &&
    html.dataset.motion !== 'reduit' &&
    html.dataset.petales !== 'non' &&
    !html.hasAttribute('data-focus') &&
    typeof Element.prototype.animate === 'function'
  );
}

const borner = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Coin haut-droit de l'élément touché récemment, sinon le haut à droite de l'écran. */
function origine(): { x: number; y: number } {
  const recente = derniere && performance.now() - derniere.t < FRAICHEUR ? derniere.cible : null;
  const l = window.innerWidth;
  const h = window.innerHeight;
  if (recente && recente !== document.body && recente !== html && recente.isConnected) {
    const r = recente.getBoundingClientRect();
    const visible = (r.width > 0 || r.height > 0) && r.bottom > 0 && r.top < h && r.right > 0 && r.left < l;
    if (visible) return { x: borner(r.right - 6, 24, l - 24), y: borner(r.top + 6, 24, h - 24) };
  }
  return { x: l - 56, y: 64 };
}

function gerbe(x: number, y: number, n: number): void {
  if (vivants + n > MAX_VIVANTS) return;
  const conteneur = document.createElement('div');
  conteneur.setAttribute('aria-hidden', 'true');
  conteneur.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;z-index:60;pointer-events:none';
  document.body.append(conteneur);

  let restants = n;
  vivants += n;
  for (let i = 0; i < n; i++) {
    const taille = 9 + Math.random() * 6;
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('viewBox', '0 0 20 24');
    svg.setAttribute('width', taille.toFixed(1));
    svg.setAttribute('height', (taille * 1.2).toFixed(1));
    svg.style.cssText = `position:absolute;left:${(x - taille / 2).toFixed(1)}px;top:${(y - taille * 0.6).toFixed(1)}px;overflow:visible`;
    const trace = document.createElementNS(SVG, 'path');
    trace.setAttribute('d', TRACE);
    trace.style.fill = `var(--c-petal-${(i % 2) + 1})`;
    svg.append(trace);
    conteneur.append(svg);

    // Éventail vers le haut (de -160° à -20°), puis une petite chute.
    const angle = ((-160 + (140 * i) / Math.max(1, n - 1) + (Math.random() * 20 - 10)) * Math.PI) / 180;
    const distance = 34 + Math.random() * 42;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const chute = 26 + Math.random() * 34;
    const tour = (Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 160);
    const animation = svg.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg) scale(0.4)', opacity: 0 },
        { transform: `translate(${dx * 0.8}px, ${dy * 0.8}px) rotate(${tour * 0.4}deg) scale(1)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${dx}px, ${dy + chute}px) rotate(${tour}deg) scale(0.85)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 450, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
    );
    const fin = () => {
      vivants--;
      if (--restants === 0) conteneur.remove();
    };
    animation.finished.then(fin, fin);
  }
}

function annoncer(n: number): void {
  cumul += n;
  window.clearTimeout(minuterieAnnonce);
  minuterieAnnonce = window.setTimeout(() => {
    const region = document.querySelector<HTMLElement>('[data-annonce-petales]');
    const texte = texteAnnonce(cumul);
    cumul = 0;
    if (!region) return;
    // Vider puis remplir : un même texte deux fois de suite est quand même relu.
    region.textContent = '';
    window.setTimeout(() => (region.textContent = texte), 40);
  }, DELAI_ANNONCE);
}

function noterInteraction(cible: EventTarget | Element | null): void {
  if (cible instanceof Element) derniere = { cible, t: performance.now() };
}

document.addEventListener('pointerdown', (ev) => noterInteraction(ev.target), { capture: true, passive: true });
document.addEventListener('keydown', () => noterInteraction(document.activeElement), { capture: true, passive: true });

window.addEventListener(EVENEMENT_PETALES, (ev) => {
  const detail = (ev as CustomEvent<Partial<GainPetales> | undefined>).detail;
  const n = Math.round(Number(detail?.n ?? 0));
  if (!Number.isFinite(n) || n <= 0) return;
  annoncer(n);
  if (!animationsPermises()) return;
  const { x, y } = origine();
  gerbe(x, y, nombrePetales(n));
});
