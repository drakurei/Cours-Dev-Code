/**
 * Ajoute un bouton discret « Écouter » à chaque notion (section.notion > h2).
 * Le bouton n'existe qu'avec JavaScript et la synthèse vocale : sans elles, rien ne s'affiche.
 * La lecture elle-même est gérée par src/scripts/ecouter.ts (délégation de clic sur [data-ecouter]).
 */
import { ICONES } from '../../lib/icones.ts';
import { syntheseDisponible } from '../ecouter.ts';

const svg = (contenu: string, classe: string) =>
  `<svg class="${classe}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${contenu}</svg>`;

export const ICONE_PARLER = svg(ICONES['haut-parleur'], 'ecouter__parler');
export const ICONE_ARRET = svg('<rect x="7" y="7" width="10" height="10" rx="2.5"/>', 'ecouter__arret');

export function ajouterBoutonsEcoute(corps: HTMLElement | null): void {
  if (!corps || !syntheseDisponible()) return;
  for (const notion of corps.querySelectorAll<HTMLElement>(':scope > section.notion[data-notion]')) {
    const id = notion.dataset.notion;
    const titre = notion.querySelector<HTMLElement>(':scope > h2');
    if (!id || !titre || notion.querySelector(':scope > .lecteur-ecouter')) continue;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--discret lecteur-ecouter';
    btn.dataset.ecouter = `section.notion[data-notion="${CSS.escape(id)}"]`;
    btn.innerHTML = `${ICONE_PARLER}${ICONE_ARRET}<span class="lecteur-ecouter__libelle" data-libelle>Écouter</span>`;
    // Nom accessible distinct pour chaque notion (« Écouter : Réagir à un clic »).
    const precision = document.createElement('span');
    precision.className = 'sr-only';
    precision.textContent = ` : ${titre.textContent?.replace(/\s+/g, ' ').trim() ?? ''}`;
    btn.append(precision);

    titre.after(btn);
    notion.dataset.ecoute = '';
  }
}
