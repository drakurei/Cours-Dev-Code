/**
 * API REST de GitHub pour l'Atelier :
 * - lire un repo public (README, package.json, arborescence, fichiers clés) comme source d'un cours ;
 * - publier un cours dans drakurei/Cours-Dev-Code (API Contents, branche main).
 *
 * Sécurité : le jeton ne part QUE vers https://api.github.com, dans l'en-tête Authorization,
 * jamais dans une URL ni dans la console. `fetch` est injectable (tests).
 */
import { texteVersBase64 } from './base64.ts';
import {
  cheminCours,
  cheminMatiere,
  choisirNumero,
  completerMatiere,
  nomFichierCours,
  nomMedia,
  preparerFichierFinal,
  slugDuCours,
  titreMedia,
  yamlMatiere,
  type FichierJoint,
} from './fichier.ts';

export const API_GITHUB = 'https://api.github.com';
export const DEPOT = { proprietaire: 'drakurei', nom: 'Cours-Dev-Code', branche: 'main' } as const;
export const URL_ACTIONS = `https://github.com/${DEPOT.proprietaire}/${DEPOT.nom}/actions`;

export type CodeErreurGitHub = 'jeton' | 'droits' | 'quota' | 'introuvable' | 'conflit' | 'invalide' | 'reseau' | 'autre';

export class ErreurGitHub extends Error {
  readonly statut: number | null;
  readonly code: CodeErreurGitHub;
  constructor(message: string, code: CodeErreurGitHub, statut: number | null = null) {
    super(message);
    this.name = 'ErreurGitHub';
    this.code = code;
    this.statut = statut;
  }
}

type Fetch = typeof fetch;

export interface OptionsClient {
  jeton?: string | undefined;
  fetch?: Fetch;
}

interface ReponseApi<T> {
  statut: number;
  donnees: T | null;
  entetes: Headers;
}

/** Chemin de fichier → segments encodés (« public/media/react/07 slides.pdf »). */
export function encoderChemin(chemin: string): string {
  return chemin
    .split('/')
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join('/');
}

/** Client minimal : construit les requêtes, toujours vers api.github.com. */
export function creerClient(options: OptionsClient = {}) {
  const f: Fetch = options.fetch ?? ((...a) => globalThis.fetch(...a));
  const jeton = options.jeton?.trim() || '';

  async function requete<T>(methode: 'GET' | 'PUT', chemin: string, corps?: unknown, accept = 'application/vnd.github+json'): Promise<ReponseApi<T>> {
    if (!chemin.startsWith('/')) throw new Error('chemin d’API invalide');
    const url = new URL(chemin, API_GITHUB);
    if (url.origin !== API_GITHUB) throw new Error('origine interdite');
    const entetes: Record<string, string> = { Accept: accept, 'X-GitHub-Api-Version': '2022-11-28' };
    if (jeton) entetes.Authorization = `Bearer ${jeton}`;
    if (corps !== undefined) entetes['Content-Type'] = 'application/json';

    let r: Response;
    try {
      r = await f(url.toString(), {
        method: methode,
        headers: entetes,
        body: corps === undefined ? null : JSON.stringify(corps),
        cache: 'no-store',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      });
    } catch {
      throw new ErreurGitHub('Connexion à GitHub impossible : vérifie ta connexion internet.', 'reseau');
    }
    let donnees: T | null = null;
    const brut = await r.text();
    if (brut) {
      try {
        donnees = JSON.parse(brut) as T;
      } catch {
        donnees = brut as unknown as T; // contenu brut (Accept raw)
      }
    }
    return { statut: r.status, donnees, entetes: r.headers };
  }

  return { requete, aJeton: jeton !== '' };
}

export type ClientGitHub = ReturnType<typeof creerClient>;

/** Message d'erreur en français pour un statut HTTP de GitHub. */
export function erreurDepuisStatut(statut: number, entetes: Headers | null, donnees: unknown, contexte: string): ErreurGitHub {
  const detail = (donnees && typeof donnees === 'object' && 'message' in donnees ? String((donnees as { message: unknown }).message) : '').slice(0, 200);
  const restant = entetes?.get('x-ratelimit-remaining');
  if (statut === 401) {
    return new ErreurGitHub('Jeton GitHub refusé (expiré ou mal copié) : crée-en un nouveau et colle-le dans les Réglages.', 'jeton', 401);
  }
  if ((statut === 403 || statut === 429) && (restant === '0' || /rate limit/i.test(detail))) {
    return new ErreurGitHub('Limite de requêtes GitHub atteinte : attends quelques minutes (ou ajoute un jeton dans les Réglages).', 'quota', statut);
  }
  if (statut === 403) {
    return new ErreurGitHub(
      `Accès refusé par GitHub (${contexte}) : le jeton doit avoir la permission « Contents : Read and write » sur ${DEPOT.proprietaire}/${DEPOT.nom}.`,
      'droits',
      403,
    );
  }
  if (statut === 404) {
    return new ErreurGitHub(`Introuvable sur GitHub (${contexte}) : vérifie le nom, ou que le jeton a accès à ce dépôt.`, 'introuvable', 404);
  }
  if (statut === 409) {
    return new ErreurGitHub('Conflit : le dépôt a changé pendant l’envoi. Réessaie dans quelques secondes.', 'conflit', 409);
  }
  if (statut === 422) {
    return new ErreurGitHub(`GitHub a refusé le fichier (${contexte}) : ${detail || 'données invalides'}.`, 'invalide', 422);
  }
  return new ErreurGitHub(`Erreur GitHub ${statut} (${contexte})${detail ? ` : ${detail}` : ''}.`, 'autre', statut);
}

// ─── Lecture d'un repo public (source d'un cours) ────────────────────────────

export interface SlugRepo {
  proprietaire: string;
  nom: string;
}

/** « owner/repo », « https://github.com/owner/repo(.git)(/tree/…) » → { proprietaire, nom } ; null sinon. */
export function lireSlugRepo(saisie: string): SlugRepo | null {
  const s = saisie
    .trim()
    .replace(/^git@github\.com:/i, '')
    .replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '')
    .replace(/[?#].*$/, '');
  const m = /^([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([A-Za-z0-9._-]{1,100}?)(?:\.git)?(?:\/.*)?$/.exec(s);
  if (!m?.[1] || !m[2] || m[2] === '.' || m[2] === '..') return null;
  return { proprietaire: m[1], nom: m[2] };
}

export interface FichierRepo {
  chemin: string;
  contenu: string;
  taille: number;
}

export interface SourceRepo {
  slug: string;
  url: string;
  description: string;
  branche: string;
  readme: FichierRepo | null;
  packageJson: FichierRepo | null;
  /** Arborescence (limitée), chemins triés. */
  arborescence: string[];
  totalFichiers: number;
  fichiers: FichierRepo[];
}

export const LIMITE_FICHIER_REPO = 30 * 1024;
export const MAX_FICHIERS_REPO = 8;
const MAX_ARBORESCENCE = 150;

const DOSSIERS_IGNORES = /(^|\/)(node_modules|dist|build|out|coverage|vendor|\.git|\.next|\.nuxt|\.astro|\.cache|\.vscode|\.idea|__pycache__|target|bin|obj)(\/|$)/i;
const FICHIERS_IGNORES = /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb|composer\.lock|poetry\.lock|Cargo\.lock|\.DS_Store|Thumbs\.db)$/i;
const EXT_TEXTE = /\.(m?[jt]sx?|cjs|vue|svelte|astro|html?|css|s[ac]ss|less|json|md|mdx|py|php|java|kt|go|rb|rs|c|h|cpp|cs|sql|ya?ml|toml|sh|ps1|twig|blade\.php|ejs|hbs)$/i;
const MINIFIE = /\.min\.(js|css)$/i;

/** Note d'intérêt d'un fichier pour comprendre un projet (plus haut = plus utile). */
export function noterFichier(chemin: string): number {
  const p = chemin.toLowerCase();
  const nom = p.split('/').pop() ?? p;
  const profondeur = p.split('/').length - 1;
  let note = 0;
  if (/^(src\/)?(main|index|server)\.(m?[jt]sx?|vue|py|php|go|rb)$/.test(p)) note += 60;
  if (/^(src\/)?app\.(m?[jt]sx?|vue|py|php|go|rb)$/.test(p)) note += 55;
  if (/^(app|src\/app|pages|src\/pages)\/(page|index|layout)\.[jt]sx?$/.test(p)) note += 50;
  if (/^index\.html?$/.test(p)) note += 45;
  if (/^(vite|astro|next|nuxt|svelte|webpack|tailwind)\.config\.[cm]?[jt]s$/.test(nom) && profondeur === 0) note += 25;
  if (/^src\//.test(p)) note += 20;
  if (/(^|\/)(components?|pages|routes|views|hooks|services|api|lib|store|controllers?|models?)\//.test(p)) note += 12;
  if (/\.(jsx|tsx|vue|svelte|astro)$/.test(p)) note += 6;
  if (/\.(css|s[ac]ss|less)$/.test(p)) note -= 6;
  if (/\.(json|ya?ml|toml)$/.test(p)) note -= 10;
  if (/\.md$/.test(p)) note -= 15;
  if (/(^|\/)(tests?|__tests__|spec|e2e|cypress|\.github)\//.test(p) || /\.(test|spec)\./.test(p)) note -= 25;
  if (/^\./.test(nom)) note -= 30;
  note -= profondeur * 3;
  return note;
}

/** Les fichiers clés à lire : texte, ≤ 30 Ko, hors README/package.json, les mieux notés. */
export function choisirFichiersCles(arbre: { path: string; size?: number; type: string }[], max = MAX_FICHIERS_REPO): string[] {
  return arbre
    .filter((e) => e.type === 'blob')
    .filter((e) => !DOSSIERS_IGNORES.test(e.path) && !FICHIERS_IGNORES.test(e.path) && !MINIFIE.test(e.path))
    .filter((e) => EXT_TEXTE.test(e.path) && (e.size ?? 0) > 0 && (e.size ?? 0) <= LIMITE_FICHIER_REPO)
    .filter((e) => !/^readme(\.\w+)?$/i.test(e.path) && e.path !== 'package.json')
    .map((e) => ({ chemin: e.path, note: noterFichier(e.path) }))
    .sort((a, b) => b.note - a.note || a.chemin.localeCompare(b.chemin))
    .slice(0, max)
    .map((e) => e.chemin);
}

interface InfoRepo {
  default_branch?: string;
  description?: string | null;
  html_url?: string;
  full_name?: string;
}
interface ArbreGit {
  tree?: { path: string; type: string; size?: number }[];
  truncated?: boolean;
}

/** Lit un repo public. `surEtape` reçoit des messages courts pour la barre d'état. */
export async function lireRepoPublic(saisie: string, options: OptionsClient = {}, surEtape: (m: string) => void = () => {}): Promise<SourceRepo> {
  const slug = lireSlugRepo(saisie);
  if (!slug) throw new ErreurGitHub('Écris le repo sous la forme propriétaire/nom (ex. drakurei/tp-react-blog) ou colle son lien GitHub.', 'invalide');
  const client = creerClient(options);
  const base = `/repos/${encodeURIComponent(slug.proprietaire)}/${encodeURIComponent(slug.nom)}`;
  const nomComplet = `${slug.proprietaire}/${slug.nom}`;

  surEtape('Lecture du repo…');
  const info = await client.requete<InfoRepo>('GET', base);
  if (info.statut !== 200 || !info.donnees) throw erreurDepuisStatut(info.statut, info.entetes, info.donnees, nomComplet);
  const branche = info.donnees.default_branch || 'main';

  surEtape('Lecture de l’arborescence…');
  const arbre = await client.requete<ArbreGit>('GET', `${base}/git/trees/${encodeURIComponent(branche)}?recursive=1`);
  if (arbre.statut !== 200 || !arbre.donnees) throw erreurDepuisStatut(arbre.statut, arbre.entetes, arbre.donnees, 'arborescence');
  const entrees = arbre.donnees.tree ?? [];
  const visibles = entrees.filter((e) => !DOSSIERS_IGNORES.test(e.path) && !FICHIERS_IGNORES.test(e.path));
  const blobs = visibles.filter((e) => e.type === 'blob');

  const lireBrut = async (chemin: string): Promise<FichierRepo | null> => {
    const r = await client.requete<string>('GET', `${base}/contents/${encoderChemin(chemin)}?ref=${encodeURIComponent(branche)}`, undefined, 'application/vnd.github.raw+json');
    if (r.statut !== 200 || typeof r.donnees !== 'string') return null;
    const contenu = r.donnees.length > LIMITE_FICHIER_REPO ? `${r.donnees.slice(0, LIMITE_FICHIER_REPO)}\n[…coupé]` : r.donnees;
    return { chemin, contenu, taille: r.donnees.length };
  };

  const cheminReadme = blobs.find((e) => /^readme(\.(md|markdown|txt|rst))?$/i.test(e.path))?.path;
  const readme = cheminReadme ? await lireBrut(cheminReadme) : null;
  const packageJson = blobs.some((e) => e.path === 'package.json') ? await lireBrut('package.json') : null;

  const cles = choisirFichiersCles(blobs);
  const fichiers: FichierRepo[] = [];
  for (const [i, chemin] of cles.entries()) {
    surEtape(`Lecture des fichiers clés (${i + 1}/${cles.length})…`);
    const f = await lireBrut(chemin);
    if (f) fichiers.push(f);
  }

  const arborescence = visibles
    .map((e) => (e.type === 'tree' ? `${e.path}/` : e.path))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, MAX_ARBORESCENCE);

  return {
    slug: info.donnees.full_name || nomComplet,
    url: info.donnees.html_url || `https://github.com/${nomComplet}`,
    description: info.donnees.description?.trim() || '',
    branche,
    readme,
    packageJson,
    arborescence,
    totalFichiers: blobs.length,
    fichiers,
  };
}

/** Clôture de bloc de code plus longue que toute suite d'accents graves du contenu. */
function cloture(contenu: string): string {
  const plusLongue = Math.max(2, ...[...contenu.matchAll(/`+/g)].map((m) => m[0].length));
  return '`'.repeat(Math.max(3, plusLongue + 1));
}

const langueDe = (chemin: string): string => /\.([a-z0-9]+)$/i.exec(chemin)?.[1]?.toLowerCase() ?? '';

/** La source d'un repo, mise en texte pour le prompt. */
export function texteDuRepo(r: SourceRepo): string {
  const parties = [`Repo GitHub : ${r.slug} (${r.url})`];
  if (r.description) parties.push(`Description : ${r.description}`);
  parties.push(`Branche : ${r.branche}`);
  const bloc = (titre: string, f: FichierRepo) => {
    const c = cloture(f.contenu);
    return `## ${titre}\n${c}${langueDe(f.chemin)}\n${f.contenu.trimEnd()}\n${c}`;
  };
  if (r.readme) parties.push(`## ${r.readme.chemin}\n${r.readme.contenu.trim()}`);
  if (r.packageJson) parties.push(bloc('package.json', r.packageJson));
  if (r.arborescence.length) {
    const extrait = r.arborescence.length < r.totalFichiers ? ` (extrait : ${r.arborescence.length} entrées sur ${r.totalFichiers} fichiers)` : '';
    parties.push(`## Arborescence${extrait}\n${r.arborescence.join('\n')}`);
  }
  for (const f of r.fichiers) parties.push(bloc(f.chemin, f));
  return parties.join('\n\n');
}

// ─── Publication dans drakurei/Cours-Dev-Code ────────────────────────────────

export interface JointAPublier {
  nom: string;
  base64: string;
}

export interface EntreePublication {
  /** Texte du cours, validé. */
  texte: string;
  matiere: string;
  titre: string;
  chapitre?: unknown;
  nomConseille: string | null;
  /** Champ nouvelleMatiere du YAML brut (facultatif). */
  nouvelleMatiere?: unknown;
  /** Nom tapé dans l'étape Source (« Nouvelle matière »). */
  nomMatiereSaisi?: string;
  /** Numéro du tome si la matière doit être créée. */
  ordreMatiere: number;
  joints: JointAPublier[];
  fichiersExistants: FichierJoint[];
}

export interface ResultatPublication {
  chemin: string;
  nomFichier: string;
  urlFichier: string;
  urlActions: string;
  matiereCreee: boolean;
  medias: FichierJoint[];
}

interface EntreeDossier {
  name: string;
  type: string;
}
interface ReponseEcriture {
  content?: { html_url?: string; path?: string };
}

/** Une étape de publication, pour la liste de progression. */
export type EtapePublication = 'dossier' | 'matiere' | 'medias' | 'cours';

/** Liste les noms d'un dossier (vide s'il n'existe pas encore). */
async function listerDossier(client: ClientGitHub, chemin: string): Promise<string[]> {
  const base = `/repos/${DEPOT.proprietaire}/${DEPOT.nom}`;
  const r = await client.requete<EntreeDossier[]>('GET', `${base}/contents/${encoderChemin(chemin)}?ref=${DEPOT.branche}`);
  if (r.statut === 200 && Array.isArray(r.donnees)) return r.donnees.map((e) => e.name);
  if (r.statut === 404) {
    // Dossier absent… ou dépôt inaccessible avec ce jeton : on vérifie le dépôt.
    const depot = await client.requete<InfoRepo>('GET', base);
    if (depot.statut === 200) return [];
    throw erreurDepuisStatut(depot.statut, depot.entetes, depot.donnees, `${DEPOT.proprietaire}/${DEPOT.nom}`);
  }
  throw erreurDepuisStatut(r.statut, r.entetes, r.donnees, chemin);
}

async function existe(client: ClientGitHub, chemin: string): Promise<boolean> {
  const r = await client.requete<unknown>('GET', `/repos/${DEPOT.proprietaire}/${DEPOT.nom}/contents/${encoderChemin(chemin)}?ref=${DEPOT.branche}`);
  if (r.statut === 200) return true;
  if (r.statut === 404) return false;
  throw erreurDepuisStatut(r.statut, r.entetes, r.donnees, chemin);
}

/** Crée un fichier (sans sha : refusé s'il existe déjà, code 422). */
async function creerFichier(client: ClientGitHub, chemin: string, base64: string, message: string): Promise<ReponseApi<ReponseEcriture>> {
  return client.requete<ReponseEcriture>('PUT', `/repos/${DEPOT.proprietaire}/${DEPOT.nom}/contents/${encoderChemin(chemin)}`, {
    message,
    content: base64,
    branch: DEPOT.branche,
  });
}

const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Publie le cours : (1) liste le dossier pour le prochain NN libre, (2) crée la matière si besoin,
 * (3) envoie les fichiers joints dans public/media/<matiere>/, (4) écrit le cours (en dernier,
 * pour qu'il ne référence jamais un fichier absent). Un commit par fichier, messages en français.
 */
export async function publierCours(
  entree: EntreePublication,
  options: OptionsClient & { delaiConflit?: number },
  surEtape: (etape: EtapePublication, etat: 'en-cours' | 'fait', detail?: string) => void = () => {},
): Promise<ResultatPublication> {
  const client = creerClient(options);
  if (!client.aJeton) throw new ErreurGitHub('Aucun jeton GitHub : ajoute-le dans les Réglages.', 'jeton');
  const { matiere } = entree;
  const delaiConflit = options.delaiConflit ?? 1200;

  surEtape('dossier', 'en-cours');
  let noms = await listerDossier(client, `src/content/cours/${matiere}`);
  let numero = choisirNumero(entree.chapitre, noms);
  const slug = slugDuCours(entree.nomConseille, entree.titre);
  surEtape('dossier', 'fait', nomFichierCours(numero, slug));

  // Matière : créée si son fichier n'existe pas sur GitHub.
  let matiereCreee = false;
  if (!(await existe(client, cheminMatiere(matiere))) && !(await existe(client, `src/content/matieres/${matiere}.yml`))) {
    surEtape('matiere', 'en-cours');
    const m = completerMatiere(matiere, entree.nouvelleMatiere, entree.ordreMatiere, entree.nomMatiereSaisi);
    const r = await creerFichier(client, cheminMatiere(matiere), texteVersBase64(yamlMatiere(m)), `Atelier : crée la matière « ${m.nom} »`);
    if (r.statut !== 201 && r.statut !== 200) throw erreurDepuisStatut(r.statut, r.entetes, r.donnees, cheminMatiere(matiere));
    matiereCreee = true;
    surEtape('matiere', 'fait', m.nom);
  }

  // Fichiers joints.
  const medias: FichierJoint[] = [];
  if (entree.joints.length > 0) {
    surEtape('medias', 'en-cours', `0/${entree.joints.length}`);
    const pris = await listerDossier(client, `public/media/${matiere}`);
    for (const [i, joint] of entree.joints.entries()) {
      const nom = nomMedia(numero, joint.nom, pris);
      pris.push(nom);
      const chemin = `public/media/${matiere}/${nom}`;
      const r = await creerFichier(client, chemin, joint.base64, `Atelier : ajoute le fichier joint « ${joint.nom} » (${matiere})`);
      if (r.statut !== 201 && r.statut !== 200) throw erreurDepuisStatut(r.statut, r.entetes, r.donnees, chemin);
      medias.push({ titre: titreMedia(joint.nom), chemin: `/media/${matiere}/${nom}` });
      surEtape('medias', i + 1 === entree.joints.length ? 'fait' : 'en-cours', `${i + 1}/${entree.joints.length}`);
    }
  }

  // Le cours, en dernier. 422 = un fichier du même nom vient d'apparaître : numéro suivant.
  surEtape('cours', 'en-cours');
  for (let essai = 1; ; essai++) {
    const nomFichier = nomFichierCours(numero, slug);
    const chemin = cheminCours(matiere, nomFichier);
    const texte = preparerFichierFinal(entree.texte, {
      numero,
      slug,
      chapitre: entree.chapitre,
      fichiers: medias,
      fichiersExistants: entree.fichiersExistants,
    });
    const r = await creerFichier(client, chemin, texteVersBase64(texte), `Atelier : ajoute le cours ${matiere} « ${entree.titre} »`);
    if (r.statut === 201 || r.statut === 200) {
      surEtape('cours', 'fait', nomFichier);
      return {
        chemin,
        nomFichier,
        urlFichier: r.donnees?.content?.html_url || `https://github.com/${DEPOT.proprietaire}/${DEPOT.nom}/blob/${DEPOT.branche}/${encoderChemin(chemin)}`,
        urlActions: URL_ACTIONS,
        matiereCreee,
        medias,
      };
    }
    if (r.statut === 409 && essai < 3) {
      await attendre(delaiConflit); // la branche a bougé : même fichier, un peu plus tard
      continue;
    }
    if (r.statut === 422 && essai < 3) {
      noms = await listerDossier(client, `src/content/cours/${matiere}`);
      numero = choisirNumero(undefined, [...noms, nomFichier]);
      continue;
    }
    throw erreurDepuisStatut(r.statut, r.entetes, r.donnees, chemin);
  }
}
