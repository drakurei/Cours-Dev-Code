/**
 * Boutons « Écouter » (synthèse vocale fr-FR) : button[data-ecouter="<sélecteur CSS du texte>"].
 *
 * - Cachés (attribut hidden) tant que le navigateur ne sait pas parler ; retiré ici sinon.
 * - Un seul bouton actif à la fois : son libellé [data-libelle] passe à « Arrêter ».
 *   (aria-pressed n'est mis à jour que si le bouton le porte déjà.)
 * - Lit le texte utile (src/scripts/lecteur/texte-ecoute.ts) : « Exemple de code » à la place du code.
 * - Voix et vitesse : prefs.voix / prefs.vitesseVoix (relues à chaque lecture).
 * - Coupé en quittant la page ; le lecteur le coupe aussi en changeant d'étape du Mode Focus.
 * Délégation de clic : marche aussi pour les boutons ajoutés plus tard.
 *
 * API : syntheseDisponible(), basculerEcoute(btn), arreterLecture().
 */
import { lire } from '../lib/store.ts';
import { decouperPhrases, texteAEcouter } from './lecteur/texte-ecoute.ts';

const synthese: SpeechSynthesis | null =
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
    ? window.speechSynthesis
    : null;

let actif: HTMLButtonElement | null = null;
/** Numéro de lecture : une lecture arrêtée ne doit plus toucher aux boutons. */
let jeton = 0;

export function syntheseDisponible(): boolean {
  return synthese !== null;
}

function voixChoisie(): SpeechSynthesisVoice | null {
  if (!synthese) return null;
  const { voix } = lire().prefs;
  const toutes = synthese.getVoices();
  return (
    toutes.find((v) => v.name === voix) ??
    toutes.find((v) => v.lang === 'fr-FR') ??
    toutes.find((v) => v.lang.toLowerCase().startsWith('fr')) ??
    null
  );
}

function afficher(btn: HTMLButtonElement, parle: boolean): void {
  const libelle = btn.querySelector('[data-libelle]');
  if (libelle) libelle.textContent = parle ? 'Arrêter' : 'Écouter';
  if (btn.hasAttribute('aria-pressed')) btn.setAttribute('aria-pressed', String(parle));
  if (parle) btn.dataset.etatEcoute = 'lecture';
  else delete btn.dataset.etatEcoute;
}

/** On ne lit que ce qui est affiché (texte masqué par CSS, dépliant fermé…). */
function estAffiche(n: unknown): boolean {
  const el = n as Element;
  if (typeof el.checkVisibility !== 'function' || el.checkVisibility()) return true;
  // display: contents (titres de blocs en Mode Focus) n'a pas de boîte mais son texte est affiché.
  return getComputedStyle(el).display === 'contents';
}

function cibleDe(btn: HTMLButtonElement): Element | null {
  const selecteur = btn.dataset.ecouter;
  if (!selecteur) return null;
  try {
    return document.querySelector(selecteur);
  } catch {
    return null; // sélecteur invalide : on ne lit rien
  }
}

/** Arrête la lecture en cours et remet le bouton actif à « Écouter ». */
export function arreterLecture(): void {
  jeton++;
  if (actif) afficher(actif, false);
  actif = null;
  if (synthese && (synthese.speaking || synthese.pending)) synthese.cancel();
}

/** Lance (ou arrête, si c'est déjà lui) la lecture du texte visé par ce bouton. */
export function basculerEcoute(btn: HTMLButtonElement): void {
  if (!synthese) return;
  if (actif === btn) {
    arreterLecture();
    return;
  }
  const cible = cibleDe(btn);
  const morceaux = cible ? decouperPhrases(texteAEcouter(cible, estAffiche)) : [];
  if (!morceaux.length) return;

  arreterLecture();
  const monJeton = jeton;
  actif = btn;
  afficher(btn, true);

  const { vitesseVoix } = lire().prefs;
  const voix = voixChoisie();
  const finir = () => {
    if (monJeton !== jeton) return;
    if (actif) afficher(actif, false);
    actif = null;
  };

  morceaux.forEach((texte, i) => {
    const phrase = new SpeechSynthesisUtterance(texte);
    phrase.lang = 'fr-FR';
    phrase.rate = vitesseVoix;
    if (voix) phrase.voice = voix;
    if (i === morceaux.length - 1) phrase.onend = finir;
    // « interrupted » / « canceled » = arrêt volontaire : déjà géré par arreterLecture().
    phrase.onerror = (ev) => {
      if (ev.error !== 'interrupted' && ev.error !== 'canceled') finir();
    };
    synthese.speak(phrase);
  });
}

if (synthese) {
  for (const btn of document.querySelectorAll<HTMLButtonElement>('button[data-ecouter]')) btn.hidden = false;
  document.addEventListener('click', (ev) => {
    const btn = (ev.target as Element | null)?.closest<HTMLButtonElement>('button[data-ecouter]');
    if (!btn || btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
    basculerEcoute(btn);
  });
  // Quitter la page coupe la voix (sinon certains navigateurs continuent de parler).
  window.addEventListener('pagehide', arreterLecture);
  // Chrome charge la liste des voix au premier appel : on la demande tout de suite.
  synthese.getVoices();
}
