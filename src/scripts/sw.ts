/**
 * Service worker : enregistrement (production seulement) et annonce des mises à jour.
 *
 * Quand une nouvelle version attend, le toast [data-maj] de BaseLayout apparaît :
 * « Nouvelle version disponible — Recharger ». Le bouton demande au worker en attente
 * de prendre la main (SKIP_WAITING), puis la page se recharge une fois.
 * « Plus tard » (ou Échap) : la même version n'est plus proposée pendant la session de l'onglet.
 * En développement : aucun worker, et celui d'un ancien aperçu est retiré (il servirait de vieux fichiers).
 */
import { url } from '../lib/url.ts';

const CLE_IGNOREE = 'manabi:maj-ignoree';
/** Vérifie une mise à jour au retour sur l'onglet, au plus une fois par heure. */
const INTERVALLE_VERIFICATION = 60 * 60 * 1000;

const portee = url('/');
let rechargementDemande = false;
/** Le worker proposé en ce moment (le plus récent qui attend). */
let propose: { reg: ServiceWorkerRegistration; worker: ServiceWorker; version: string } | null = null;
/** Derniers workers déjà examinés (évite deux toasts pour le même). */
const examines = new WeakSet<ServiceWorker>();

function lireIgnoree(): string | null {
  try {
    return window.sessionStorage.getItem(CLE_IGNOREE);
  } catch {
    return null;
  }
}

function ecrireIgnoree(version: string): void {
  try {
    window.sessionStorage.setItem(CLE_IGNOREE, version);
  } catch {
    /* stockage indisponible : le toast reviendra à la prochaine page */
  }
}

/** Demande sa version au worker (réponse par MessageChannel), « inconnue » au bout d'une seconde. */
function versionDe(worker: ServiceWorker): Promise<string> {
  return new Promise((resolve) => {
    const canal = new MessageChannel();
    const minuterie = window.setTimeout(() => resolve('inconnue'), 1000);
    canal.port1.onmessage = (ev) => {
      window.clearTimeout(minuterie);
      resolve(typeof ev.data === 'string' ? ev.data : 'inconnue');
    };
    try {
      worker.postMessage({ type: 'VERSION' }, [canal.port2]);
    } catch {
      window.clearTimeout(minuterie);
      resolve('inconnue');
    }
  });
}

const toast = () => document.querySelector<HTMLElement>('[data-maj]');

function cacherToast(): void {
  const t = toast();
  if (t) t.hidden = true;
}

/** Branche une seule fois les boutons du toast : ils agissent toujours sur le worker proposé. */
function brancherToast(): void {
  const t = toast();
  if (!t) return;
  const recharger = t.querySelector<HTMLButtonElement>('[data-maj-recharger]');
  const plusTard = () => {
    if (propose) ecrireIgnoree(propose.version);
    propose = null;
    cacherToast();
  };

  recharger?.addEventListener('click', () => {
    if (!propose) return;
    rechargementDemande = true;
    recharger.disabled = true;
    recharger.setAttribute('aria-busy', 'true');
    const enAttente = propose.reg.waiting ?? propose.worker;
    // Déjà actif (un autre onglet l'a installé) : un simple rechargement suffit.
    if (enAttente.state === 'activated' || enAttente.state === 'redundant') window.location.reload();
    else enAttente.postMessage({ type: 'SKIP_WAITING' });
  });
  t.querySelector<HTMLButtonElement>('[data-maj-fermer]')?.addEventListener('click', plusTard);
  t.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    ev.stopPropagation();
    plusTard();
  });
}

async function proposerMiseAJour(reg: ServiceWorkerRegistration, worker: ServiceWorker): Promise<void> {
  const t = toast();
  if (!t || examines.has(worker)) return;
  examines.add(worker);
  const version = await versionDe(worker);
  if (lireIgnoree() === version || worker.state === 'redundant') return;

  propose = { reg, worker, version };
  const dejaVisible = !t.hidden;
  t.hidden = false;
  // Le texte arrive dans une région déjà présente (role=status) : il est bien annoncé.
  const annonce = document.querySelector<HTMLElement>('[data-maj-annonce]');
  if (annonce && !dejaVisible) annonce.textContent = 'Nouvelle version disponible. Bouton Recharger pour l’installer.';
}

function suivre(reg: ServiceWorkerRegistration): void {
  brancherToast();
  // Une version attend déjà (installée pendant une visite précédente).
  if (reg.waiting && navigator.serviceWorker.controller) void proposerMiseAJour(reg, reg.waiting);

  reg.addEventListener('updatefound', () => {
    const nouveau = reg.installing;
    if (!nouveau) return;
    nouveau.addEventListener('statechange', () => {
      // Sans contrôleur, c'est la toute première installation : rien à proposer.
      if (nouveau.state === 'installed' && navigator.serviceWorker.controller) void proposerMiseAJour(reg, nouveau);
    });
  });

  let derniereVerification = Date.now();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || Date.now() - derniereVerification < INTERVALLE_VERIFICATION) return;
    derniereVerification = Date.now();
    reg.update().catch(() => {});
  });
}

async function enregistrer(): Promise<void> {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!rechargementDemande) return;
    rechargementDemande = false;
    window.location.reload();
  });
  try {
    const reg = await navigator.serviceWorker.register(url('/sw.js'), { scope: portee, updateViaCache: 'none' });
    suivre(reg);
  } catch {
    /* navigation privée stricte, HTTP… : le site marche sans */
  }
}

async function desinscrire(): Promise<void> {
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.filter((r) => new URL(r.scope).pathname === portee).map((r) => r.unregister()));
  } catch {
    /* rien */
  }
}

if ('serviceWorker' in navigator) {
  if (!import.meta.env.PROD) void desinscrire();
  // Après le chargement : le précache ne dispute pas la bande passante à la première page.
  else if (document.readyState === 'complete') void enregistrer();
  else window.addEventListener('load', () => void enregistrer(), { once: true });
}
