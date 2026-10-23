/**
 * Minuteur focus 10 / 15 / 25 min (+ prefs.minuteur) : un ensō qui se vide.
 *
 * - Deux variantes du même îlot : « barre » (carte compacte en bas de la Sidebar, ≥ 1024 px) et
 *   « pastille » (bulle flottante au-dessus des onglets, < 1024 px, seulement quand il tourne).
 * - Un seul état partagé par les deux (au niveau du module), gardé dans sessionStorage « manabi:minuteur »
 *   avec l'horodatage de fin : aucune dérive, et il survit au changement de page.
 * - Écoute window « manabi:minuteur » {minutes?, action: 'demarrer'|'pause'|'reprendre'|'arreter'} ;
 *   émet « manabi:minuteur:etat » (detail = Session) à chaque changement.
 * - À la fin : « Fais une pause de 5 min », son doux (WebAudio) seulement si l'utilisateur a démarré
 *   lui-même, notification système seulement s'il l'a autorisée d'un clic.
 * - Lecteur d'écran : annonces polies au démarrage, à la pause, à la fin, puis chaque minute.
 * Garder ce nom de fichier et l'export par défaut (Sidebar et BaseLayout l'importent).
 */
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useManabi } from './useManabi.ts';
import IconeSvg from './IconeSvg.tsx';
import { lire } from '../lib/store.ts';
import { url } from '../lib/url.ts';
import './minuteur.css';

// ─── Contrat ─────────────────────────────────────────────────────────────────

export const CLE_MINUTEUR = 'manabi:minuteur';
export const EVENEMENT_MINUTEUR = 'manabi:minuteur';
export const EVENEMENT_ETAT_MINUTEUR = 'manabi:minuteur:etat';
export const DUREES = [10, 15, 25] as const;
const MINUTE = 60_000;
/** Une session finie depuis plus longtemps est oubliée (on revient à « prêt »). */
const OUBLI_FINI = 30 * MINUTE;
/** Fin ratée de plus d'une minute (onglet fermé…) : ni son ni notification. */
const FIN_RECENTE = MINUTE;

export type ActionMinuteur = 'demarrer' | 'pause' | 'reprendre' | 'arreter';
export interface DetailMinuteur {
  minutes?: number;
  action: ActionMinuteur;
}

interface Commun {
  /** Durée choisie dans ce minuteur (null = celle des réglages). */
  choix: number | null;
  /** Notification de fin autorisée par un clic. */
  notifier: boolean;
}

export type Session =
  | (Commun & { etat: 'pret' })
  | (Commun & { etat: 'en-cours'; duree: number; fin: number; son: boolean })
  | (Commun & { etat: 'pause'; duree: number; reste: number; son: boolean })
  | (Commun & { etat: 'fini'; duree: number; finiLe: number });

export const SESSION_VIDE: Session = Object.freeze({ etat: 'pret', choix: null, notifier: false });

// ─── Logique pure (testée dans tests/minuteur.test.ts) ──────────────────────

/** Minutes entières entre 1 et 120 ; `defaut` si la valeur n'est pas un nombre. */
export function bornerMinutes(m: unknown, defaut = 15): number {
  const n = typeof m === 'number' && Number.isFinite(m) ? Math.round(m) : defaut;
  return Math.min(120, Math.max(1, n));
}

const nombre = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Relit la session stockée ; toute valeur abîmée donne une session vide. */
export function analyserSession(brut: string | null): Session {
  let o: Record<string, unknown>;
  try {
    const v: unknown = brut ? JSON.parse(brut) : null;
    if (!v || typeof v !== 'object' || Array.isArray(v)) return SESSION_VIDE;
    o = v as Record<string, unknown>;
  } catch {
    return SESSION_VIDE;
  }
  const commun: Commun = {
    choix: nombre(o.choix) ? bornerMinutes(o.choix) : null,
    notifier: o.notifier === true,
  };
  const duree = bornerMinutes(o.duree);
  const son = o.son === true;
  if (o.etat === 'en-cours' && nombre(o.fin)) return { ...commun, etat: 'en-cours', duree, fin: o.fin, son };
  if (o.etat === 'pause' && nombre(o.reste)) {
    return { ...commun, etat: 'pause', duree, reste: Math.min(duree * MINUTE, Math.max(0, o.reste)), son };
  }
  if (o.etat === 'fini') return { ...commun, etat: 'fini', duree, finiLe: nombre(o.finiLe) ? o.finiLe : 0 };
  return { ...commun, etat: 'pret' };
}

const commun = (s: Session): Commun => ({ choix: s.choix, notifier: s.notifier });

export function demarrer(s: Session, minutes: number, maintenant: number, son: boolean): Session {
  const duree = bornerMinutes(minutes);
  return { ...commun(s), choix: duree, etat: 'en-cours', duree, fin: maintenant + duree * MINUTE, son };
}

export function mettreEnPause(s: Session, maintenant: number): Session {
  if (s.etat !== 'en-cours') return s;
  return { ...commun(s), etat: 'pause', duree: s.duree, reste: Math.max(0, s.fin - maintenant), son: s.son };
}

export function reprendre(s: Session, maintenant: number): Session {
  if (s.etat !== 'pause') return s;
  return { ...commun(s), etat: 'en-cours', duree: s.duree, fin: maintenant + s.reste, son: s.son };
}

export function arreter(s: Session): Session {
  return s.etat === 'pret' ? s : { ...commun(s), etat: 'pret' };
}

/** Fait avancer le temps : en cours → fini à l'heure de fin ; fini ancien → prêt. */
export function avancer(s: Session, maintenant: number): Session {
  if (s.etat === 'en-cours' && maintenant >= s.fin) return { ...commun(s), etat: 'fini', duree: s.duree, finiLe: s.fin };
  if (s.etat === 'fini' && maintenant - s.finiLe > OUBLI_FINI) return { ...commun(s), etat: 'pret' };
  return s;
}

/** Applique une action de l'événement « manabi:minuteur ». Renvoie la même session si rien ne change. */
export function appliquerAction(
  s: Session,
  detail: Partial<DetailMinuteur> | null | undefined,
  maintenant: number,
  options: { defaut: number; son: boolean },
): Session {
  switch (detail?.action) {
    case 'demarrer':
      return demarrer(s, nombre(detail.minutes) ? detail.minutes : options.defaut, maintenant, options.son);
    case 'pause':
      return mettreEnPause(s, maintenant);
    case 'reprendre':
      return reprendre(s, maintenant);
    case 'arreter':
      return arreter(s);
    default:
      return s;
  }
}

/** Temps restant (ms). Prêt : la durée qui serait lancée. */
export function resteMs(s: Session, maintenant: number, defaut: number): number {
  switch (s.etat) {
    case 'en-cours':
      return Math.max(0, s.fin - maintenant);
    case 'pause':
      return s.reste;
    case 'fini':
      return 0;
    default:
      return bornerMinutes(defaut) * MINUTE;
  }
}

/** Part du trait encore visible (1 = cercle plein, 0 = vide). */
export function fractionRestante(s: Session, maintenant: number): number {
  if (s.etat === 'pret') return 1;
  if (s.etat === 'fini') return 0;
  return Math.min(1, Math.max(0, resteMs(s, maintenant, s.duree) / (s.duree * MINUTE)));
}

/** 754 000 ms → « 12:34 » (seconde entamée = comptée). */
export function formater(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function minutesRestantes(ms: number): number {
  return Math.max(0, Math.ceil(ms / MINUTE));
}

export function texteMinutes(m: number): string {
  return `${m} minute${m > 1 ? 's' : ''}`;
}

/** « 12 minutes restantes », « 1 minute restante ». */
export function texteRestant(m: number): string {
  return `${texteMinutes(m)} restante${m > 1 ? 's' : ''}`;
}

/** 754 000 ms → « 12 minutes 34 secondes » (pour l'étiquette du minuteur). */
export function texteLong(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const sec = total % 60;
  const parties = [];
  if (m) parties.push(texteMinutes(m));
  if (sec || !m) parties.push(`${sec} seconde${sec > 1 ? 's' : ''}`);
  return parties.join(' ');
}

/** 10, 15, 25, la durée des réglages et celle choisie, triées sans doublon. */
export function dureesProposees(pref: number, choix: number | null = null): number[] {
  const durees = new Set<number>([...DUREES, bornerMinutes(pref)]);
  if (choix !== null) durees.add(bornerMinutes(choix));
  return [...durees].sort((a, b) => a - b);
}

/** Ce que le lecteur d'écran entend après un changement. */
export function annonceChangement(avant: Session, apres: Session, maintenant: number): string {
  if (apres.etat === 'en-cours' && avant.etat === 'pause') {
    return `Minuteur repris : ${texteRestant(minutesRestantes(apres.fin - maintenant))}.`;
  }
  if (apres.etat === 'en-cours') return `Minuteur lancé : ${texteMinutes(apres.duree)}.`;
  if (apres.etat === 'pause') return `Minuteur en pause : ${texteRestant(minutesRestantes(apres.reste))}.`;
  if (apres.etat === 'fini') return `Session de ${texteMinutes(apres.duree)} terminée. Fais une pause de 5 min.`;
  if (avant.etat === 'en-cours' || avant.etat === 'pause') return 'Minuteur arrêté.';
  return '';
}

// ─── État partagé (navigateur) ───────────────────────────────────────────────

interface Instantane {
  session: Session;
  maintenant: number;
  annonce: string;
  /** Augmente à chaque fin : la pastille s'ouvre pour montrer le message. */
  fins: number;
}

const SERVEUR: Instantane = Object.freeze({ session: SESSION_VIDE, maintenant: 0, annonce: '', fins: 0 });
let instantane: Instantane = SERVEUR;
let nAnnonces = 0;
const abonnes = new Set<() => void>();
let minuterieTic = 0;
let minuterieFin = 0;
let derniereMinute = -1;
let initialise = false;

function publier(partiel: Partial<Instantane>): void {
  instantane = { ...instantane, ...partiel };
  for (const f of abonnes) f();
}

function sAbonner(f: () => void): () => void {
  abonnes.add(f);
  return () => abonnes.delete(f);
}

function lireStockage(): string | null {
  try {
    return window.sessionStorage.getItem(CLE_MINUTEUR);
  } catch {
    return null;
  }
}

function ecrireStockage(s: Session): void {
  try {
    if (s.etat === 'pret' && s.choix === null && !s.notifier) window.sessionStorage.removeItem(CLE_MINUTEUR);
    else window.sessionStorage.setItem(CLE_MINUTEUR, JSON.stringify(s));
  } catch {
    /* stockage indisponible : le minuteur vit le temps de la page */
  }
}

function dureeParDefaut(): number {
  return instantane.session.choix ?? lire().prefs.minuteur;
}

/** Même texte deux fois de suite : une espace insécable en plus pour qu'il soit relu. */
function texteAnnonce(texte: string): string {
  nAnnonces++;
  return nAnnonces % 2 ? texte : `${texte} `;
}

function changer(s: Session, annonce?: string): void {
  const t = Date.now();
  if (s.etat === 'en-cours') derniereMinute = minutesRestantes(s.fin - t);
  ecrireStockage(s);
  publier({ session: s, maintenant: t, ...(annonce ? { annonce: texteAnnonce(annonce) } : {}) });
  planifier();
  try {
    window.dispatchEvent(new CustomEvent(EVENEMENT_ETAT_MINUTEUR, { detail: s }));
  } catch {
    /* l'événement est un bonus */
  }
}

/** Deux minuteries : une pour l'affichage (chaque seconde, onglet visible), une pour la fin exacte. */
function planifier(): void {
  window.clearTimeout(minuterieTic);
  window.clearTimeout(minuterieFin);
  const s = instantane.session;
  if (s.etat !== 'en-cours') return;
  const reste = s.fin - Date.now();
  minuterieFin = window.setTimeout(verifierFin, Math.max(0, reste) + 20);
  if (document.visibilityState === 'visible') minuterieTic = window.setTimeout(tic, (reste % 1000 || 1000) + 10);
}

function tic(): void {
  window.clearTimeout(minuterieTic);
  const s = instantane.session;
  if (s.etat !== 'en-cours') return;
  const t = Date.now();
  if (t >= s.fin) {
    verifierFin();
    return;
  }
  const m = minutesRestantes(s.fin - t);
  const annonce = m !== derniereMinute && m >= 1 ? texteAnnonce(`${texteRestant(m)}.`) : undefined;
  derniereMinute = m;
  publier({ maintenant: t, ...(annonce ? { annonce } : {}) });
  if (document.visibilityState === 'visible') minuterieTic = window.setTimeout(tic, ((s.fin - t) % 1000 || 1000) + 10);
}

function verifierFin(): void {
  const avant = instantane.session;
  const t = Date.now();
  const apres = avancer(avant, t);
  if (apres === avant) {
    planifier(); // réveil un peu en avance
    return;
  }
  changer(apres, annonceChangement(avant, apres, t));
  if (apres.etat !== 'fini' || avant.etat !== 'en-cours') return;
  publier({ fins: instantane.fins + 1 });
  if (t - apres.finiLe > FIN_RECENTE) return;
  if (avant.son) void jouerSon();
  if (apres.notifier) void notifierFin(apres.duree);
}

// ─── Son (WebAudio) et notification ──────────────────────────────────────────

type Activation = { isActive: boolean; hasBeenActive: boolean };
const activation = (): Activation | undefined => (navigator as Navigator & { userActivation?: Activation }).userActivation;

let audio: AudioContext | null = null;

function contexteAudio(): AudioContext | null {
  if (audio) return audio;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    audio = new Ctor();
  } catch {
    audio = null;
  }
  return audio;
}

/** À appeler pendant un geste (clic, touche) : le navigateur autorise alors le son. */
function deverrouillerAudio(): void {
  const c = contexteAudio();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

/** Une note de cloche douce : trois partiels sinus qui s'éteignent lentement. */
function cloche(c: AudioContext, debut: number, frequence: number, volume: number): void {
  for (const [multiple, part] of [
    [1, 1],
    [2.01, 0.22],
    [3.02, 0.07],
  ] as const) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequence * multiple;
    gain.gain.setValueAtTime(0.0001, debut);
    gain.gain.exponentialRampToValueAtTime(volume * part, debut + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, debut + 2.6);
    osc.connect(gain).connect(c.destination);
    osc.start(debut);
    osc.stop(debut + 2.7);
  }
}

async function jouerSon(): Promise<void> {
  // Sans aucun geste sur cette page, le navigateur refuserait : on n'essaie même pas.
  if (!audio && activation()?.hasBeenActive === false) return;
  const c = contexteAudio();
  if (!c) return;
  if (c.state !== 'running') {
    await Promise.race([c.resume().catch(() => {}), new Promise((r) => window.setTimeout(r, 300))]);
  }
  if (c.state !== 'running') return; // jamais de son en retard
  const t = c.currentTime + 0.05;
  cloche(c, t, 659.25, 0.12); // mi
  cloche(c, t + 0.6, 987.77, 0.08); // si
}

async function notifierFin(duree: number): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (document.visibilityState === 'visible' && document.hasFocus()) return; // il voit déjà le message
  const titre = 'Session terminée';
  const options: NotificationOptions = {
    body: `${texteMinutes(duree)} de focus. Fais une pause de 5 min.`,
    icon: url('/icons/icon-192.png'),
    tag: 'manabi-minuteur',
    lang: 'fr',
  };
  try {
    const reg = await navigator.serviceWorker?.getRegistration(url('/'));
    if (reg) {
      await reg.showNotification(titre, options);
      return;
    }
  } catch {
    /* on tente la notification simple */
  }
  try {
    new Notification(titre, options);
  } catch {
    /* Android sans service worker : tant pis, le message reste à l'écran */
  }
}

// ─── Actions (boutons et événement) ──────────────────────────────────────────

function agir(detail: DetailMinuteur, son: boolean): void {
  const avant = instantane.session;
  const t = Date.now();
  const apres = appliquerAction(avant, detail, t, { defaut: dureeParDefaut(), son });
  if (apres !== avant) changer(apres, annonceChangement(avant, apres, t));
}

/** Geste explicite sur un bouton du minuteur. */
function agirDepuisBouton(detail: DetailMinuteur): void {
  if (detail.action === 'demarrer') deverrouillerAudio();
  agir(detail, true);
}

function choisirDuree(minutes: number): void {
  const s = instantane.session;
  if (s.etat === 'pret' || s.etat === 'fini') changer({ ...s, choix: bornerMinutes(minutes) });
}

function fermerFin(): void {
  const s = instantane.session;
  if (s.etat === 'fini') changer({ ...commun(s), etat: 'pret' });
}

async function basculerNotification(): Promise<void> {
  if (instantane.session.notifier) {
    changer({ ...instantane.session, notifier: false }, 'Notification de fin désactivée.');
    return;
  }
  if (!('Notification' in window)) return;
  let permission = Notification.permission;
  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission();
    } catch {
      permission = 'denied';
    }
  }
  if (permission === 'granted') {
    changer({ ...instantane.session, notifier: true }, 'Tu seras prévenu à la fin, même dans un autre onglet.');
  } else {
    changer(instantane.session, 'Notifications bloquées par le navigateur.');
  }
}

/** Son au prochain geste sur cette page (une nouvelle page repart sans autorisation audio). */
function preparerSon(): void {
  const s = instantane.session;
  if (s.etat !== 'en-cours' || !s.son || audio) return;
  const geste = () => {
    deverrouillerAudio();
    window.removeEventListener('pointerdown', geste, true);
    window.removeEventListener('keydown', geste, true);
  };
  window.addEventListener('pointerdown', geste, true);
  window.addEventListener('keydown', geste, true);
}

function initialiser(): void {
  if (initialise || typeof window === 'undefined') return;
  initialise = true;
  const s = analyserSession(lireStockage());
  instantane = { session: s, maintenant: Date.now(), annonce: '', fins: 0 };
  if (s.etat === 'en-cours') derniereMinute = minutesRestantes(s.fin - Date.now());

  window.addEventListener(EVENEMENT_MINUTEUR, (ev) => {
    const detail = (ev as CustomEvent<DetailMinuteur | undefined>).detail;
    if (!detail || typeof detail !== 'object') return;
    // Lancé pendant un clic ou une touche (ex. bouton de l'accueil) = lancé par l'utilisateur.
    const geste = activation()?.isActive === true;
    if (geste && detail.action === 'demarrer') deverrouillerAudio();
    agir(detail, geste);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') tic();
  });

  preparerSon();
  verifierFin(); // fini pendant le changement de page ? sinon, planifie les minuteries
}

initialiser();

const lireInstantane = () => instantane;
const lireServeur = () => SERVEUR;

// ─── Affichage ───────────────────────────────────────────────────────────────

const TRAIT = 'M24 6.5C33.8 6.4 41.9 13.9 41.8 23.6C41.7 33.4 34.2 41.7 24.4 41.6C14.6 41.5 6.5 34.3 6.6 24.6C6.7 15.6 12.6 8.4 21.2 7.1';

/** Ensō au pinceau qui se vide : un trait principal et deux bouts effilés. */
function EnsoMinuteur({ fraction, taille }: { fraction: number; taille: number }) {
  const l = Math.min(1, Math.max(0, fraction)) * 100;
  const corps = Math.max(0, l - 10);
  const bout1 = Math.min(6, l * 0.6);
  const bout2 = Math.min(4, l * 0.4);
  return (
    <svg className="minuteur__enso" viewBox="0 0 48 48" width={taille} height={taille} aria-hidden="true" focusable="false">
      <path className="minuteur__enso-fond" d={TRAIT} />
      <g className="minuteur__enso-trait" data-vide={l === 0 ? '' : undefined}>
        <path d={TRAIT} pathLength={100} strokeWidth={4.4} strokeDasharray={`${corps} 200`} />
        <path d={TRAIT} pathLength={100} strokeWidth={3.4} strokeDasharray={`${bout1} 200`} strokeDashoffset={-corps} />
        <path d={TRAIT} pathLength={100} strokeWidth={2.4} strokeDasharray={`${bout2} 200`} strokeDashoffset={-(corps + bout1)} />
      </g>
    </svg>
  );
}

function IconeCloche({ barree }: { barree: boolean }) {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5z" />
      <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
      {barree && <path d="M4.5 4.5l15 15" />}
    </svg>
  );
}

function IconeStop() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="5" y="5" width="14" height="14" rx="3" fill="currentColor" />
    </svg>
  );
}

function titreDe(s: Session): string {
  if (s.etat === 'en-cours') return `Focus · ${s.duree} min`;
  if (s.etat === 'pause') return 'En pause';
  if (s.etat === 'fini') return 'Session terminée';
  return 'Minuteur focus';
}

interface Props {
  /** « barre » : carte de la Sidebar (défaut). « pastille » : bulle flottante sur mobile. */
  variante?: 'barre' | 'pastille';
}

export default function Minuteur({ variante = 'barre' }: Props) {
  const pref = useManabi((e) => e.prefs.minuteur);
  const { session, maintenant, annonce, fins } = useSyncExternalStore(sAbonner, lireInstantane, lireServeur);
  // Notifications : connues seulement côté navigateur (après hydratation, pas d'écart serveur/client).
  const [notifPossible, setNotifPossible] = useState(false);
  useEffect(() => {
    setNotifPossible('Notification' in window && Notification.permission !== 'denied');
  }, [session.notifier, annonce]);

  const defaut = session.choix ?? pref;
  const reste = resteMs(session, maintenant, defaut);
  const fraction = fractionRestante(session, maintenant);
  const temps = formater(reste);
  const libelleTemps = session.etat === 'pret' ? `Durée : ${texteMinutes(bornerMinutes(defaut))}` : `Temps restant : ${texteLong(reste)}`;

  const props = { session, defaut, pref, reste, temps, libelleTemps, fraction, notifPossible, fins };
  return (
    <div className={`minuteur minuteur--${variante}`} data-etat={session.etat}>
      {variante === 'pastille' ? <Pastille {...props} /> : <Carte {...props} />}
      <p className="sr-only" aria-live="polite">
        {annonce}
      </p>
    </div>
  );
}

interface PropsVue {
  session: Session;
  defaut: number;
  pref: number;
  reste: number;
  temps: string;
  libelleTemps: string;
  fraction: number;
  notifPossible: boolean;
  fins: number;
}

function BoutonCloche({ session, notifPossible, classe }: { session: Session; notifPossible: boolean; classe: string }) {
  if (!notifPossible && !session.notifier) return null;
  return (
    <button
      type="button"
      className={classe}
      aria-pressed={session.notifier}
      aria-label="Me prévenir à la fin"
      title={session.notifier ? 'Notification de fin activée' : 'Me prévenir à la fin'}
      onClick={() => void basculerNotification()}
    >
      <IconeCloche barree={!session.notifier} />
    </button>
  );
}

/** Carte compacte de la Sidebar. */
function Carte({ session, defaut, pref, temps, libelleTemps, fraction, notifPossible }: PropsVue) {
  const idTitre = useId();
  const principal = useRef<HTMLButtonElement>(null);
  const duree = bornerMinutes(defaut);
  // Après « Arrêter » ou « Fermer », le focus revient sur le bouton principal (il ne se perd pas).
  const puisRevenir = (f: () => void) => () => {
    f();
    window.requestAnimationFrame(() => principal.current?.focus());
  };

  let actions: ReactNode;
  if (session.etat === 'en-cours') {
    actions = (
      <>
        <button ref={principal} type="button" className="minuteur__bouton" aria-label="Mettre en pause" title="Pause" onClick={() => agirDepuisBouton({ action: 'pause' })}>
          <IconeSvg nom="pause" taille={18} />
        </button>
        <button type="button" className="minuteur__bouton" aria-label="Arrêter le minuteur" title="Arrêter" onClick={puisRevenir(() => agirDepuisBouton({ action: 'arreter' }))}>
          <IconeStop />
        </button>
      </>
    );
  } else if (session.etat === 'pause') {
    actions = (
      <>
        <button ref={principal} type="button" className="minuteur__bouton minuteur__bouton--plein" aria-label="Reprendre" title="Reprendre" onClick={() => agirDepuisBouton({ action: 'reprendre' })}>
          <IconeSvg nom="lecture" taille={18} />
        </button>
        <button type="button" className="minuteur__bouton" aria-label="Arrêter le minuteur" title="Arrêter" onClick={puisRevenir(() => agirDepuisBouton({ action: 'arreter' }))}>
          <IconeStop />
        </button>
      </>
    );
  } else if (session.etat === 'fini') {
    // Fin : le message d'abord, une seule action (relancer), fermer en haut à droite.
    return (
      <div className="minuteur__carte" role="group" aria-labelledby={idTitre}>
        <div className="minuteur__tete">
          <p className="minuteur__titre" id={idTitre}>
            {titreDe(session)}
          </p>
          <button type="button" className="minuteur__mini" aria-label="Fermer" title="Fermer" onClick={puisRevenir(fermerFin)}>
            <IconeSvg nom="fermer" taille={16} />
          </button>
        </div>
        <p className="minuteur__message">Fais une pause de 5 min.</p>
        <button
          ref={principal}
          type="button"
          className="btn btn--secondaire btn--bloc minuteur__relancer"
          onClick={puisRevenir(() => agirDepuisBouton({ action: 'demarrer', minutes: session.duree }))}
        >
          <IconeSvg nom="lecture" taille={16} />
          Relancer {session.duree}{'\u00a0'}min
        </button>
      </div>
    );
  } else {
    actions = (
      <button ref={principal} type="button" className="minuteur__bouton minuteur__bouton--plein" aria-label={`Démarrer ${texteMinutes(duree)}`} title="Démarrer" onClick={() => agirDepuisBouton({ action: 'demarrer', minutes: duree })}>
        <IconeSvg nom="lecture" taille={18} />
      </button>
    );
  }

  return (
    <div className="minuteur__carte" role="group" aria-labelledby={idTitre}>
      <div className="minuteur__tete">
        <p className="minuteur__titre" id={idTitre}>
          {titreDe(session)}
        </p>
        <BoutonCloche session={session} notifPossible={notifPossible} classe="minuteur__mini minuteur__cloche" />
      </div>
      <div className="minuteur__corps">
        <EnsoMinuteur fraction={fraction} taille={40} />
        <span className="minuteur__temps" role="timer" aria-label={libelleTemps}>
          {temps}
        </span>
        <div className="minuteur__actions">{actions}</div>
      </div>
      {session.etat === 'pret' && (
        <div className="minuteur__durees" role="group" aria-label="Durée">
          {dureesProposees(pref, session.choix).map((d) => (
            <button key={d} type="button" className="minuteur__duree" aria-pressed={d === duree} onClick={() => choisirDuree(d)}>
              {d}
              {'\u00a0'}min
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Pastille flottante (< 1024 px) : visible quand le minuteur tourne, en pause ou vient de finir. */
function Pastille({ session, reste, temps, fraction, notifPossible, fins }: PropsVue) {
  const idPanneau = useId();
  const [ouvert, setOuvert] = useState(false);
  const zone = useRef<HTMLDivElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);

  // À la fin d'une session, le panneau s'ouvre pour montrer le message (sans prendre le focus).
  useEffect(() => {
    if (fins > 0) setOuvert(true);
  }, [fins]);

  useEffect(() => {
    if (session.etat === 'pret') setOuvert(false);
  }, [session.etat]);

  useEffect(() => {
    if (!ouvert) return;
    const dehors = (ev: PointerEvent) => {
      if (zone.current && !zone.current.contains(ev.target as Node)) setOuvert(false);
    };
    const touche = (ev: KeyboardEvent) => {
      if (ev.key !== 'Escape') return;
      setOuvert(false);
      bouton.current?.focus();
    };
    document.addEventListener('pointerdown', dehors);
    document.addEventListener('keydown', touche);
    return () => {
      document.removeEventListener('pointerdown', dehors);
      document.removeEventListener('keydown', touche);
    };
  }, [ouvert]);

  if (session.etat === 'pret') return null;

  const libelle =
    session.etat === 'fini'
      ? 'Minuteur : session terminée'
      : `Minuteur${session.etat === 'pause' ? ' en pause' : ''} : ${texteRestant(minutesRestantes(reste))}`;
  // La pastille disparaît après « Arrêter » ou « Fermer » : le focus va au contenu, pas dans le vide.
  const puisContenu = (f: () => void) => () => {
    f();
    document.getElementById('contenu')?.focus({ preventScroll: true });
  };

  return (
    <div className="minuteur__flottant" ref={zone}>
      <div className="minuteur__panneau verre" id={idPanneau} role="group" aria-label="Commandes du minuteur" hidden={!ouvert}>
        <p className="minuteur__titre">{titreDe(session)}</p>
        {session.etat === 'fini' && <p className="minuteur__message">Fais une pause de 5 min.</p>}
        <div className="minuteur__panneau-actions">
          {session.etat === 'en-cours' && (
            <button type="button" className="btn btn--secondaire minuteur__action" onClick={() => agirDepuisBouton({ action: 'pause' })}>
              <IconeSvg nom="pause" taille={18} />
              Pause
            </button>
          )}
          {session.etat === 'pause' && (
            <button type="button" className="btn btn--primaire minuteur__action" onClick={() => agirDepuisBouton({ action: 'reprendre' })}>
              <IconeSvg nom="lecture" taille={18} />
              Reprendre
            </button>
          )}
          {session.etat === 'fini' && (
            <button type="button" className="btn btn--primaire minuteur__action" onClick={() => agirDepuisBouton({ action: 'demarrer', minutes: session.duree })}>
              <IconeSvg nom="lecture" taille={18} />
              Relancer
            </button>
          )}
          {session.etat === 'fini' ? (
            <button type="button" className="btn minuteur__action" onClick={puisContenu(fermerFin)}>
              Fermer
            </button>
          ) : (
            <button type="button" className="btn minuteur__action" onClick={puisContenu(() => agirDepuisBouton({ action: 'arreter' }))}>
              <IconeStop />
              Arrêter
            </button>
          )}
          {session.etat !== 'fini' && <BoutonCloche session={session} notifPossible={notifPossible} classe="btn btn--icone minuteur__cloche" />}
        </div>
      </div>
      <button
        ref={bouton}
        type="button"
        className="minuteur__pastille verre"
        aria-expanded={ouvert}
        aria-controls={idPanneau}
        aria-label={libelle}
        onClick={() => setOuvert((o) => !o)}
      >
        <EnsoMinuteur fraction={fraction} taille={24} />
        <span className="minuteur__pastille-temps" aria-hidden="true">
          {session.etat === 'fini' ? 'Pause' : temps}
        </span>
      </button>
    </div>
  );
}
