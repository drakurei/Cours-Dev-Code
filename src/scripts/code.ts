/**
 * Bouton « Copier » sur chaque bloc de code (figure.code, voir src/lib/markdown/code.ts).
 * Fonctionne aussi pour du HTML injecté plus tard (aperçu de l'Atelier) : appeler ajouterBoutonsCopier(racine).
 */
import { ICONES } from '../lib/icones.ts';

const ICONE = (nom: 'copier' | 'coche') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONES[nom]}</svg>`;

let annonceur: HTMLElement | null = null;

/** Zone aria-live commune pour annoncer « Code copié » aux lecteurs d'écran. */
function annoncer(message: string): void {
  if (!annonceur) {
    annonceur = document.createElement('div');
    annonceur.className = 'sr-only';
    annonceur.setAttribute('aria-live', 'polite');
    document.body.append(annonceur);
  }
  annonceur.textContent = '';
  window.setTimeout(() => {
    if (annonceur) annonceur.textContent = message;
  }, 30);
}

async function copierTexte(texte: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texte);
    return true;
  } catch {
    // Repli (http, anciens navigateurs) : textarea temporaire.
    const zone = document.createElement('textarea');
    zone.value = texte;
    zone.setAttribute('readonly', '');
    zone.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.append(zone);
    zone.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    zone.remove();
    return ok;
  }
}

function libelle(btn: HTMLButtonElement, copie: boolean): void {
  btn.dataset.etat = copie ? 'copie' : '';
  btn.innerHTML = `${ICONE(copie ? 'coche' : 'copier')}<span>${copie ? 'Copié' : 'Copier'}</span>`;
}

export function ajouterBoutonsCopier(racine: ParentNode = document): void {
  for (const figure of racine.querySelectorAll<HTMLElement>('figure.code:not([data-copier])')) {
    const pre = figure.querySelector('pre');
    if (!pre) continue;
    figure.dataset.copier = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code__copier';
    const nom = figure.querySelector('.code__titre')?.textContent?.trim();
    btn.setAttribute('aria-label', nom ? `Copier le code de ${nom}` : 'Copier le code');
    libelle(btn, false);
    let minuterie = 0;
    btn.addEventListener('click', async () => {
      const ok = await copierTexte(pre.innerText.replace(/\n$/, ''));
      annoncer(ok ? 'Code copié.' : 'Impossible de copier : sélectionne le code à la main.');
      if (!ok) return;
      libelle(btn, true);
      window.clearTimeout(minuterie);
      minuterie = window.setTimeout(() => libelle(btn, false), 1600);
    });
    figure.append(btn);
  }
}

ajouterBoutonsCopier();
