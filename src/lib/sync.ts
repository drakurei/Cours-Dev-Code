/**
 * Synchronisation de la progression avec un Gist GitHub SECRET (CONCEPTION §6 et §8).
 *
 * - Un seul fichier « manabi-progression.json » dans un Gist secret du compte de l'utilisateur.
 * - Les secrets (jeton GitHub, clé Anthropic) ne partent JAMAIS : on n'envoie que l'Etat
 *   normalisé (champs connus seulement), et un garde-fou bloque l'envoi si un secret apparaît
 *   quand même dans le texte.
 * - Préférences propres à l'appareil (voix, gistId) : jamais envoyées, jamais écrasées.
 * - Fonctions réseau pures (fetch injectable, donc testables) + orchestration avec le store.
 * - Méta de l'appareil (synchro auto, horodatages) sous « manabi:v1:sync » : elle ne doit
 *   pas voyager avec la progression, donc elle reste hors de « manabi:v1 ».
 */
import { fusionner, importer, lire, lireSecrets, modifier, normaliser, type Etat, type Secrets } from './store.ts';

// ─── Constantes ──────────────────────────────────────────────────────────────

export const NOM_FICHIER = 'manabi-progression.json';
export const DESCRIPTION = 'Manabi — progression (ne pas modifier)';
export const API_GITHUB = 'https://api.github.com';
export const DEPOT = { proprietaire: 'drakurei', nom: 'Cours-Dev-Code' } as const;
/** Page de création d'un jeton fine-grained. */
export const URL_NOUVEAU_JETON = 'https://github.com/settings/personal-access-tokens/new';
/** Une synchro automatique au plus toutes les 2 minutes. */
export const DELAI_AUTO_MS = 2 * 60_000;
export const CLE_SYNC = 'manabi:v1:sync';
/** Événement window : detail = InfoSync. */
export const EVENEMENT_SYNC = 'manabi:sync';
/** Au-delà, fetch refuse keepalive (limite de 64 Ko par requête). */
const LIMITE_KEEPALIVE = 60_000;

// ─── Types ───────────────────────────────────────────────────────────────────

export type CodeErreur =
  | 'sans-jeton'
  | 'jeton-refuse'
  | 'droits'
  | 'introuvable'
  | 'limite'
  | 'reseau'
  | 'format'
  | 'secret'
  | 'serveur';

/** Erreur de synchro avec un message français prêt à afficher. */
export class ErreurSync extends Error {
  code: CodeErreur;
  statut: number | null;

  constructor(code: CodeErreur, message: string, statut: number | null = null) {
    super(message);
    this.name = 'ErreurSync';
    this.code = code;
    this.statut = statut;
  }
}

export interface OptionsReseau {
  jeton: string;
  /** fetch injectable (tests). Défaut : fetch du navigateur. */
  fetch?: typeof fetch;
  /** Laisse partir la requête même si la page se ferme (onglet caché). */
  keepalive?: boolean;
}

interface FichierGist {
  content?: string;
  truncated?: boolean;
  raw_url?: string;
}

export interface Gist {
  id: string;
  html_url?: string;
  updated_at?: string;
  description?: string | null;
  public?: boolean;
  files: Record<string, FichierGist | null>;
}

export interface Sauvegarde {
  id: string;
  url: string | null;
  /** null : le Gist existe mais le fichier a disparu. */
  etat: Etat | null;
}

export type ModeSync = 'envoyer' | 'recuperer' | 'synchroniser';

export interface ResultatSync {
  mode: ModeSync;
  gistId: string;
  url: string | null;
  /** Le Gist vient d'être créé. */
  cree: boolean;
  /** Le Gist a été écrit. */
  envoye: boolean;
  /** La progression de ce navigateur a changé. */
  recu: boolean;
  /** ISO, fin de la synchro. */
  le: string;
}

/** Méta propre à l'appareil (jamais synchronisée). */
export interface MetaSync {
  auto: boolean;
  /** ISO, dernière synchro réussie. */
  derniere: string | null;
  /** ISO, dernière tentative (réussie ou non) : sert à espacer la synchro auto. */
  tentative: string | null;
  /** Message de la dernière erreur (null si la dernière synchro a réussi). */
  erreur: string | null;
  /** Lien du Gist (affichage). */
  url: string | null;
}

export type InfoSync =
  | { etat: 'en-cours'; mode: ModeSync }
  | { etat: 'ok'; mode: ModeSync; resultat: ResultatSync }
  | { etat: 'erreur'; mode: ModeSync; message: string; code: CodeErreur }
  | { etat: 'meta' };

export type EtatVerification = 'ok' | 'erreur' | 'info';

export interface Verification {
  etat: EtatVerification;
  titre: string;
  detail: string;
}

export interface RapportJeton {
  login: string | null;
  verifications: Verification[];
}

// ─── Outils ──────────────────────────────────────────────────────────────────

const estObjet = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

function nomDepot(): string {
  return `${DEPOT.proprietaire}/${DEPOT.nom}`;
}

/** JSON aux clés triées (et listes de textes triées) : compare deux états sans dépendre de l'ordre. */
function stable(v: unknown): unknown {
  if (Array.isArray(v)) {
    const liste = v.map(stable);
    return liste.every((x) => typeof x === 'string') ? [...(liste as string[])].sort() : liste;
  }
  if (estObjet(v)) {
    const sortie: Record<string, unknown> = {};
    for (const k of Object.keys(v).sort()) sortie[k] = stable(v[k]);
    return sortie;
  }
  return v;
}

/** Forme comparable : sans `maj` ni préférences propres à l'appareil. */
function comparable(e: Etat): string {
  const n = normaliser(e);
  return JSON.stringify(stable({ ...n, maj: '', prefs: { ...n.prefs, voix: null, gistId: null } }));
}

/** Vrai si deux états portent la même progression (hors date et appareil). */
export function memeContenu(a: Etat, b: Etat): boolean {
  return comparable(a) === comparable(b);
}

// ─── Contenu envoyé ──────────────────────────────────────────────────────────

/**
 * Texte du fichier du Gist. normaliser() ne garde que les champs connus de l'Etat :
 * rien d'autre (et donc aucun secret) ne peut s'y glisser. Garde-fou en plus : si un
 * secret apparaît quand même (collé dans un champ texte), l'envoi est refusé.
 */
export function contenuGist(etat: Etat, secrets: Secrets = {}): string {
  const propre = normaliser(etat);
  propre.prefs.voix = null;
  propre.prefs.gistId = null;
  const texte = JSON.stringify(propre, null, 2);
  for (const s of Object.values(secrets)) {
    if (typeof s !== 'string' || s.length < 8) continue;
    if (texte.includes(s) || texte.includes(JSON.stringify(s).slice(1, -1))) {
      throw new ErreurSync('secret', 'Envoi annulé : un secret se trouvait dans la progression. Rien n’a été envoyé.');
    }
  }
  return texte;
}

/** Lit le texte d'une sauvegarde (Gist ou fichier). Lève une ErreurSync « format » si ce n'en est pas une. */
export function analyserSauvegarde(texte: string): Etat {
  let brut: unknown;
  try {
    brut = JSON.parse(texte);
  } catch {
    throw new ErreurSync('format', 'La sauvegarde en ligne est abîmée (JSON illisible).');
  }
  if (!estObjet(brut) || brut.version === undefined || !estObjet(brut.prefs)) {
    throw new ErreurSync('format', 'Ce Gist ne contient pas une sauvegarde Manabi.');
  }
  return normaliser(brut);
}

// ─── Réseau GitHub ───────────────────────────────────────────────────────────

/** Minutes avant la fin d'une limite de requêtes (en-tête x-ratelimit-reset, en secondes). */
function minutesAvant(reset: string | null): number {
  const t = Number(reset);
  if (!Number.isFinite(t) || t <= 0) return 1;
  return Math.max(1, Math.round((t * 1000 - Date.now()) / 60_000));
}

type Contexte = 'lecture' | 'creation' | 'ecriture';

async function erreurHttp(rep: Response, contexte: Contexte): Promise<ErreurSync> {
  let message = '';
  try {
    const corps: unknown = await rep.json();
    if (estObjet(corps) && typeof corps.message === 'string') message = corps.message;
  } catch {
    /* corps vide ou non JSON */
  }
  const s = rep.status;
  if (s === 401) {
    return new ErreurSync('jeton-refuse', 'GitHub refuse ce jeton : il est faux ou expiré. Crée-en un nouveau.', s);
  }
  if ((s === 403 || s === 429) && (rep.headers.get('x-ratelimit-remaining') === '0' || /rate limit/i.test(message))) {
    const n = minutesAvant(rep.headers.get('x-ratelimit-reset'));
    return new ErreurSync('limite', `GitHub limite les requêtes pour l’instant. Réessaie dans ${n} min.`, s);
  }
  // Jeton fine-grained sans le droit Gists : 403, ou 404 à la création.
  if (s === 403 || (s === 404 && contexte === 'creation')) {
    return new ErreurSync('droits', 'Ce jeton n’a pas le droit d’utiliser les Gists. Ajoute « Gists : lecture et écriture ».', s);
  }
  if (s === 404) return new ErreurSync('introuvable', 'Sauvegarde introuvable sur GitHub.', s);
  if (s === 422) return new ErreurSync('format', 'GitHub a refusé les données envoyées.', s);
  if (s >= 500) return new ErreurSync('serveur', `GitHub ne répond pas (erreur ${s}). Réessaie dans un instant.`, s);
  return new ErreurSync('serveur', `GitHub a répondu une erreur ${s}${message ? ` : ${message}` : ''}.`, s);
}

interface Reponse<T> {
  donnees: T;
  entetes: Headers;
}

async function requete<T>(
  chemin: string,
  o: OptionsReseau,
  init: { methode?: 'GET' | 'POST' | 'PATCH'; corps?: unknown; contexte?: Contexte } = {},
): Promise<Reponse<T>> {
  // Variable locale : appeler window.fetch comme méthode d'un objet lèverait « Illegal invocation ».
  const f = o.fetch ?? globalThis.fetch;
  const corps = init.corps === undefined ? undefined : JSON.stringify(init.corps);
  let rep: Response;
  try {
    rep = await f(`${API_GITHUB}${chemin}`, {
      method: init.methode ?? 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${o.jeton}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(corps === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(corps === undefined ? {} : { body: corps }),
      // Jamais le cache HTTP : « Récupérer » doit voir la dernière version.
      cache: 'no-store',
      ...(o.keepalive && corps !== undefined && corps.length < LIMITE_KEEPALIVE ? { keepalive: true } : {}),
    });
  } catch {
    throw new ErreurSync('reseau', 'Pas de connexion à GitHub. Vérifie ton réseau, puis réessaie.');
  }
  if (!rep.ok) throw await erreurHttp(rep, init.contexte ?? 'lecture');
  let donnees: T;
  try {
    donnees = (await rep.json()) as T;
  } catch {
    throw new ErreurSync('serveur', 'Réponse de GitHub illisible. Réessaie dans un instant.', rep.status);
  }
  return { donnees, entetes: rep.headers };
}

const aLeFichier = (g: Gist): boolean => estObjet(g.files) && Object.prototype.hasOwnProperty.call(g.files, NOM_FICHIER);

/** Cherche, parmi les Gists du compte, celui qui contient manabi-progression.json (le plus récent). */
export async function trouverGist(o: OptionsReseau): Promise<string | null> {
  for (let page = 1; page <= 5; page++) {
    const { donnees } = await requete<Gist[]>(`/gists?per_page=100&page=${page}`, o);
    if (!Array.isArray(donnees)) return null;
    const trouves = donnees.filter(aLeFichier);
    if (trouves.length) {
      trouves.sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''));
      return trouves[0]?.id ?? null;
    }
    if (donnees.length < 100) break;
  }
  return null;
}

/** Lit un Gist et sa sauvegarde (null si le fichier n'y est plus). */
export async function lireGist(id: string, o: OptionsReseau): Promise<Sauvegarde> {
  const { donnees: gist } = await requete<Gist>(`/gists/${encodeURIComponent(id)}`, o);
  const fichier = estObjet(gist.files) ? gist.files[NOM_FICHIER] : null;
  if (!fichier) return { id: gist.id, url: gist.html_url ?? null, etat: null };

  let texte = fichier.content ?? '';
  // Au-delà de 1 Mo, l'API tronque : on lit la version brute (sans le jeton, inutile ici).
  if (fichier.truncated && fichier.raw_url) {
    const f = o.fetch ?? globalThis.fetch;
    try {
      const brut = await f(fichier.raw_url, { cache: 'no-store' });
      if (!brut.ok) throw new Error(String(brut.status));
      texte = await brut.text();
    } catch {
      throw new ErreurSync('reseau', 'Impossible de lire la sauvegarde complète sur GitHub. Réessaie.');
    }
  }
  return { id: gist.id, url: gist.html_url ?? null, etat: analyserSauvegarde(texte) };
}

/** Crée le Gist SECRET de sauvegarde. */
export async function creerGist(contenu: string, o: OptionsReseau): Promise<Gist> {
  const { donnees } = await requete<Gist>('/gists', o, {
    methode: 'POST',
    contexte: 'creation',
    corps: { description: DESCRIPTION, public: false, files: { [NOM_FICHIER]: { content: contenu } } },
  });
  return donnees;
}

/** Remplace le contenu du fichier de sauvegarde. */
export async function mettreAJourGist(id: string, contenu: string, o: OptionsReseau): Promise<Gist> {
  const { donnees } = await requete<Gist>(`/gists/${encodeURIComponent(id)}`, o, {
    methode: 'PATCH',
    contexte: 'ecriture',
    corps: { description: DESCRIPTION, files: { [NOM_FICHIER]: { content: contenu } } },
  });
  return donnees;
}

/** Trouve la sauvegarde : d'abord le Gist mémorisé, sinon parmi les Gists du compte. */
export async function chercherSauvegarde(gistId: string | null, o: OptionsReseau): Promise<Sauvegarde | null> {
  if (gistId) {
    try {
      return await lireGist(gistId, o);
    } catch (e) {
      if (!(e instanceof ErreurSync && e.code === 'introuvable')) throw e;
      // Gist supprimé ou id d'un autre compte : on cherche.
    }
  }
  const id = await trouverGist(o);
  return id ? lireGist(id, o) : null;
}

/**
 * Écrit le contenu dans le Gist connu, ou dans celui du compte, ou dans un nouveau Gist.
 * Cherche d'abord : un 2e appareil ne crée pas un 2e Gist.
 */
export async function ecrireSauvegarde(
  gistId: string | null,
  contenu: string,
  o: OptionsReseau,
): Promise<{ gist: Gist; cree: boolean }> {
  if (gistId) {
    try {
      return { gist: await mettreAJourGist(gistId, contenu, o), cree: false };
    } catch (e) {
      if (!(e instanceof ErreurSync && e.code === 'introuvable')) throw e;
    }
  }
  const existant = await trouverGist(o);
  if (existant) return { gist: await mettreAJourGist(existant, contenu, o), cree: false };
  return { gist: await creerGist(contenu, o), cree: true };
}

// ─── Tester un jeton ─────────────────────────────────────────────────────────

interface Utilisateur {
  login?: string;
}

interface Depot {
  full_name?: string;
  permissions?: { push?: boolean; pull?: boolean; admin?: boolean };
}

/**
 * Vérifie un jeton : compte (GET /user), accès au repo drakurei/Cours-Dev-Code, droit Gists.
 * Un jeton fine-grained ne dit pas ses droits : ceux-là se vérifient au premier usage.
 * Lève une ErreurSync seulement pour une panne réseau ou une limite.
 */
export async function testerJetonGitHub(jeton: string, options: { fetch?: typeof fetch } = {}): Promise<RapportJeton> {
  const o: OptionsReseau = { jeton: jeton.trim(), ...(options.fetch ? { fetch: options.fetch } : {}) };
  const verifications: Verification[] = [];

  let login: string | null = null;
  let portees: string[] | null = null;
  try {
    const { donnees, entetes } = await requete<Utilisateur>('/user', o);
    login = donnees.login ?? null;
    const brut = entetes.get('x-oauth-scopes');
    portees = brut === null ? null : brut.split(',').map((p) => p.trim()).filter(Boolean);
    verifications.push({ etat: 'ok', titre: 'Jeton valide', detail: login ? `Compte GitHub : ${login}.` : 'Compte GitHub reconnu.' });
  } catch (e) {
    if (e instanceof ErreurSync && (e.code === 'jeton-refuse' || e.code === 'droits')) {
      verifications.push({ etat: 'erreur', titre: 'Jeton refusé', detail: 'GitHub ne reconnaît pas ce jeton : il est faux ou expiré.' });
      return { login: null, verifications };
    }
    throw e;
  }

  // Accès au repo.
  try {
    const { donnees } = await requete<Depot>(`/repos/${DEPOT.proprietaire}/${DEPOT.nom}`, o);
    if (donnees.permissions?.push === false) {
      verifications.push({ etat: 'erreur', titre: `Repo ${nomDepot()}`, detail: 'Lecture seule : ce compte ne peut pas publier depuis l’Atelier.' });
    } else if (portees !== null) {
      const ecrit = portees.includes('repo') || portees.includes('public_repo');
      verifications.push(
        ecrit
          ? { etat: 'ok', titre: `Repo ${nomDepot()}`, detail: 'Écriture autorisée : l’Atelier pourra publier.' }
          : { etat: 'erreur', titre: `Repo ${nomDepot()}`, detail: 'Ajoute la portée « public_repo » au jeton pour publier.' },
      );
    } else {
      verifications.push({ etat: 'ok', titre: `Repo ${nomDepot()}`, detail: 'Accessible. Le droit d’écriture se vérifie à la première publication.' });
    }
  } catch (e) {
    if (!(e instanceof ErreurSync) || e.code === 'reseau' || e.code === 'limite') throw e;
    const invisible = e.code === 'introuvable' || e.code === 'droits';
    verifications.push({
      etat: 'erreur',
      titre: `Repo ${nomDepot()}`,
      detail: invisible ? 'Ce jeton ne voit pas le repo. Choisis-le dans « Repository access ».' : e.message,
    });
  }

  // Droit Gists : lisible seulement pour un jeton classique (en-tête x-oauth-scopes).
  if (portees !== null) {
    verifications.push(
      portees.includes('gist')
        ? { etat: 'ok', titre: 'Gists', detail: 'Autorisés : la synchro peut marcher.' }
        : { etat: 'erreur', titre: 'Gists', detail: 'Ajoute la portée « gist » au jeton pour synchroniser.' },
    );
  } else {
    verifications.push({ etat: 'info', titre: 'Gists', detail: 'Droit vérifié à la première synchro.' });
  }

  return { login, verifications };
}

// ─── Méta de l'appareil (synchro auto, horodatages) ──────────────────────────

const META_DEFAUT: MetaSync = { auto: false, derniere: null, tentative: null, erreur: null, url: null };

function stockage(): Storage | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

function emettre(detail: InfoSync): void {
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent<InfoSync>(EVENEMENT_SYNC, { detail }));
    }
  } catch {
    /* l'événement est un bonus */
  }
}

const texteOuNull = (v: unknown): string | null => (typeof v === 'string' && v ? v : null);

/** Lit la méta (valeurs par défaut si absente, abîmée ou stockage bloqué). */
export function lireMetaSync(): MetaSync {
  try {
    const brut = stockage()?.getItem(CLE_SYNC);
    if (!brut) return { ...META_DEFAUT };
    const m: unknown = JSON.parse(brut);
    if (!estObjet(m)) return { ...META_DEFAUT };
    return {
      auto: m.auto === true,
      derniere: texteOuNull(m.derniere),
      tentative: texteOuNull(m.tentative),
      erreur: texteOuNull(m.erreur),
      url: texteOuNull(m.url),
    };
  } catch {
    return { ...META_DEFAUT };
  }
}

/** Met à jour une partie de la méta et prévient l'interface (événement « manabi:sync »). */
export function ecrireMetaSync(partiel: Partial<MetaSync>): MetaSync {
  const m = { ...lireMetaSync(), ...partiel };
  try {
    stockage()?.setItem(CLE_SYNC, JSON.stringify(m));
  } catch {
    /* quota, navigation privée : la synchro marche quand même */
  }
  emettre({ etat: 'meta' });
  return m;
}

// ─── Orchestration (store + réseau) ──────────────────────────────────────────

let enCours: { mode: ModeSync; promesse: Promise<ResultatSync> } | null = null;

/** Mode de la synchro en cours dans cet onglet (null si aucune). */
export function syncEnCours(): ModeSync | null {
  return enCours?.mode ?? null;
}

/** Remplace la progression locale en gardant les préférences de l'appareil. */
function remplacerLocal(etat: Etat, gistId: string): void {
  const local = lire();
  const final: Etat = { ...etat, prefs: { ...etat.prefs, voix: local.prefs.voix, gistId } };
  importer(JSON.stringify(final), 'remplacer');
}

function retenirGist(id: string): void {
  if (lire().prefs.gistId !== id) {
    modifier((b) => {
      b.prefs.gistId = id;
    });
  }
}

async function executer(mode: ModeSync, options: { fetch?: typeof fetch; keepalive?: boolean }): Promise<ResultatSync> {
  const secrets = lireSecrets();
  const jeton = secrets.githubToken;
  if (!jeton) throw new ErreurSync('sans-jeton', 'Ajoute d’abord ton jeton GitHub.');
  const o: OptionsReseau = { jeton, ...(options.fetch ? { fetch: options.fetch } : {}) };
  const ecriture: OptionsReseau = { ...o, ...(options.keepalive ? { keepalive: true } : {}) };
  const gistId = lire().prefs.gistId;

  let id: string;
  let url: string | null;
  let cree = false;
  let envoye = false;
  let recu = false;

  if (mode === 'envoyer') {
    const r = await ecrireSauvegarde(gistId, contenuGist(lire(), secrets), ecriture);
    id = r.gist.id;
    url = r.gist.html_url ?? null;
    cree = r.cree;
    envoye = true;
    retenirGist(id);
  } else {
    const distant = await chercherSauvegarde(gistId, o);
    if (mode === 'recuperer') {
      if (!distant?.etat) {
        throw new ErreurSync('introuvable', 'Aucune sauvegarde en ligne pour l’instant. Commence par « Envoyer ».');
      }
      id = distant.id;
      url = distant.url;
      recu = !memeContenu(lire(), distant.etat);
      remplacerLocal(distant.etat, id);
    } else if (!distant) {
      // Première synchro : on crée la sauvegarde avec la progression de ce navigateur.
      const r = await ecrireSauvegarde(null, contenuGist(lire(), secrets), ecriture);
      id = r.gist.id;
      url = r.gist.html_url ?? null;
      cree = r.cree;
      envoye = true;
      retenirGist(id);
    } else {
      id = distant.id;
      url = distant.url;
      // Lu APRÈS le réseau : une action faite pendant la requête n'est pas perdue.
      const actuel = lire();
      const fusion = distant.etat ? fusionner(actuel, distant.etat) : actuel;
      recu = !memeContenu(fusion, actuel);
      if (recu) remplacerLocal(fusion, id);
      else retenirGist(id);
      const aEnvoyer = lire();
      // N'écrit le Gist que s'il manque quelque chose en ligne (pas de révision inutile).
      if (!distant.etat || !memeContenu(aEnvoyer, distant.etat)) {
        await mettreAJourGist(id, contenuGist(aEnvoyer, secrets), ecriture);
        envoye = true;
      }
    }
  }

  return { mode, gistId: id, url, cree, envoye, recu, le: new Date().toISOString() };
}

/**
 * Lance une synchro : « envoyer » (ce navigateur → Gist), « recuperer » (Gist → ce navigateur,
 * remplace), « synchroniser » (récupère, fusionne, envoie). Une seule à la fois par onglet.
 * Met à jour la méta (horodatage ou erreur) et émet « manabi:sync ».
 */
export function lancerSync(mode: ModeSync, options: { fetch?: typeof fetch; keepalive?: boolean } = {}): Promise<ResultatSync> {
  const precedente = enCours?.promesse.catch(() => null) ?? Promise.resolve(null);
  const promesse = precedente.then(async () => {
    enCours = { mode, promesse };
    emettre({ etat: 'en-cours', mode });
    ecrireMetaSync({ tentative: new Date().toISOString() });
    // Libère AVANT les derniers événements : l'interface qui les écoute voit « fini ».
    const liberer = () => {
      if (enCours?.promesse === promesse) enCours = null;
    };
    try {
      const resultat = await executer(mode, options);
      liberer();
      ecrireMetaSync({ derniere: new Date().toISOString(), erreur: null, url: resultat.url });
      emettre({ etat: 'ok', mode, resultat });
      return resultat;
    } catch (e) {
      liberer();
      const err = e instanceof ErreurSync ? e : new ErreurSync('serveur', 'La synchro a échoué. Réessaie dans un instant.');
      ecrireMetaSync({ erreur: err.message });
      emettre({ etat: 'erreur', mode, message: err.message, code: err.code });
      throw err;
    }
  });
  enCours = { mode, promesse };
  return promesse;
}

// ─── Synchro automatique ─────────────────────────────────────────────────────

const MARQUE = Symbol.for('manabi.sync.auto');

/** Vrai si une synchro auto doit partir maintenant (pure, testable). */
export function synchroAutoDue(
  meta: MetaSync,
  raison: 'chargement' | 'cache',
  majLocale: string,
  maintenant: number = Date.now(),
): boolean {
  if (!meta.auto) return false;
  const tentative = meta.tentative ? Date.parse(meta.tentative) : Number.NaN;
  if (!Number.isNaN(tentative) && maintenant - tentative < DELAI_AUTO_MS) return false;
  // Onglet caché : seulement s'il y a du nouveau ici depuis la dernière synchro.
  if (raison === 'cache' && meta.derniere && majLocale <= meta.derniere) return false;
  return true;
}

/**
 * Synchro auto (si activée dans les Réglages) : au chargement de la page et quand l'onglet
 * se cache, au plus toutes les 2 min. À appeler une fois par page (sans effet si déjà lancée).
 * Renvoie la fonction d'arrêt.
 */
export function demarrerSynchroAuto(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};
  const w = window as Window & { [MARQUE]?: boolean };
  if (w[MARQUE]) return () => {};
  w[MARQUE] = true;

  const tenter = (raison: 'chargement' | 'cache') => {
    if (enCours || !lireSecrets().githubToken) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    if (!synchroAutoDue(lireMetaSync(), raison, lire().maj)) return;
    lancerSync('synchroniser', { keepalive: raison === 'cache' }).catch(() => {
      /* l'erreur est gardée dans la méta et affichée dans les Réglages */
    });
  };

  const surVisibilite = () => {
    if (document.visibilityState === 'hidden') tenter('cache');
  };
  document.addEventListener('visibilitychange', surVisibilite);
  tenter('chargement');

  return () => {
    document.removeEventListener('visibilitychange', surVisibilite);
    w[MARQUE] = false;
  };
}
