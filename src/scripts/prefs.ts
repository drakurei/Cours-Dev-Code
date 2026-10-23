/**
 * Préférences d'affichage → attributs de <html>, à chaque « manabi:change ».
 * (Le script anti-flash du <head> fait la même chose AVANT le premier rendu ;
 *  garder les deux synchronisés : voir src/layouts/BaseLayout.astro.)
 *
 *   data-theme="light|dark"         thème résolu (auto → prefers-color-scheme)
 *   data-theme-choix="auto|clair|sombre"
 *   data-font="atkinson|systeme"
 *   data-motion="auto|reduit"
 *   data-petales="oui|non"
 *   style="--user-scale: 1.1"
 */
import { abonner, lire, type Prefs } from '../lib/store.ts';

const COULEUR_THEME = { light: '#f6f5f2', dark: '#121114' } as const;
const sombreSysteme = window.matchMedia('(prefers-color-scheme: dark)');

export function themeResolu(choix: Prefs['theme']): 'light' | 'dark' {
  if (choix === 'sombre') return 'dark';
  if (choix === 'clair') return 'light';
  return sombreSysteme.matches ? 'dark' : 'light';
}

export function appliquerPrefs(p: Prefs, racine: HTMLElement = document.documentElement): void {
  const theme = themeResolu(p.theme);
  const d = racine.dataset;
  if (d.theme !== theme) d.theme = theme;
  d.themeChoix = p.theme;
  d.font = p.police === 'systeme' ? 'systeme' : 'atkinson';
  d.motion = p.animations === 'reduites' ? 'reduit' : 'auto';
  d.petales = p.petales ? 'oui' : 'non';
  racine.style.setProperty('--user-scale', String(p.taille));

  // Barre du navigateur / de la PWA : suit le thème choisi, pas seulement celui du système.
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = p.theme === 'auto' ? (meta.media.includes('dark') ? COULEUR_THEME.dark : COULEUR_THEME.light) : COULEUR_THEME[theme];
  }
}

appliquerPrefs(lire().prefs);
abonner((e) => appliquerPrefs(e.prefs));
sombreSysteme.addEventListener('change', () => appliquerPrefs(lire().prefs));
