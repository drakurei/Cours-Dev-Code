/**
 * Intégration Astro « manabi:service-worker » : écrit <outDir>/sw.js à la fin du build.
 *
 * - Précache : toutes les pages HTML, _astro/*, les JSON (search-index, donnees/*), les icônes,
 *   le manifest et les polices locales. Jamais public/media (mis en cache à l'usage).
 * - Version : empreinte de la liste des fichiers, de leur taille et du contenu des fichiers
 *   sans empreinte dans le nom (HTML, JSON…). Elle change à chaque build qui change quelque chose.
 * - Le code du worker vit dans integrations/sw-modele.js (stratégies détaillées en tête du fichier).
 * - Enregistrement côté navigateur : src/scripts/sw.ts (production seulement).
 * Ne pas renommer ce fichier ni son export par défaut : astro.config.mjs l'importe.
 */
import type { AstroIntegration } from 'astro';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface ContexteServiceWorker {
  /** Dossier de sortie du build (chemin absolu). */
  dossier: string;
  /** Base du site, ex. « /Cours-Dev-Code/ ». */
  base: string;
  /** Pages générées, chemins relatifs à la base (« », « tomes/ », « cours/react/06-usestate/ »…). */
  pages: string[];
}

/** Un fichier du dossier de sortie (chemin relatif, séparateur « / »). */
export interface FichierSortie {
  chemin: string;
  taille: number;
}

/** Ce que le worker reçoit à la place du marqueur. */
export interface ManifesteSW {
  version: string;
  base: string;
  /** URL absolues (avec la base) à précacher. */
  precache: string[];
  /** URL de la page hors-ligne, ou null si elle manque. */
  horsLigne: string | null;
  /** Feuilles Google Fonts des pages (gardées à l'installation, avec leurs fichiers de police). */
  polices: string[];
}

export const NOM_SW = 'sw.js';
export const PAGE_HORS_LIGNE = 'hors-ligne/index.html';
export const MARQUEUR = '/*__MANIFESTE__*/ null';
/** Au-delà, un fichier n'est pas précaché (il sera mis en cache à l'usage). */
export const TAILLE_MAX_PRECACHE = 5 * 1024 * 1024;

const POLICES = /\.(woff2?|ttf|otf)$/i;
const RACINE = new Set(['manifest.webmanifest', 'favicon.svg']);

/** Liste récursive des fichiers d'un dossier, triée. */
export async function listerFichiers(dossier: string): Promise<FichierSortie[]> {
  const sortie: FichierSortie[] = [];
  const parcourir = async (rel: string): Promise<void> => {
    const entrees = await readdir(join(dossier, rel), { withFileTypes: true });
    for (const e of entrees) {
      const chemin = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) await parcourir(chemin);
      else if (e.isFile()) sortie.push({ chemin, taille: (await stat(join(dossier, chemin))).size });
    }
  };
  await parcourir('');
  return sortie.sort((a, b) => (a.chemin < b.chemin ? -1 : a.chemin > b.chemin ? 1 : 0));
}

/** Faut-il précacher ce fichier ? */
export function doitPrecacher({ chemin, taille }: FichierSortie): boolean {
  if (chemin === NOM_SW || chemin.endsWith('.map')) return false;
  if (chemin.startsWith('media/')) return false; // public/media : cache à l'usage
  // Pages de cours : mises en cache à la lecture (sinon chaque déploiement re-télécharge ~9 Mo).
  // Les révisions restent hors-ligne grâce à donnees/*.json, précachés.
  if (chemin.startsWith('cours/')) return false;
  // pdf.js ne sert qu'à l'Atelier (qui a besoin du réseau de toute façon).
  if (/^_astro\/pdf(\.worker)?[.-]/.test(chemin)) return false;
  if (taille > TAILLE_MAX_PRECACHE) return false;
  if (chemin.startsWith('_astro/') || chemin.startsWith('icons/')) return true;
  if (RACINE.has(chemin)) return true;
  return /\.(html|json)$/i.test(chemin) || POLICES.test(chemin);
}

/** « tomes/index.html » → « /Cours-Dev-Code/tomes/ » ; « 404.html » → « /Cours-Dev-Code/404.html ». */
export function cheminVersUrl(chemin: string, base: string): string {
  const b = base.endsWith('/') ? base : `${base}/`;
  const propre = chemin === 'index.html' ? '' : chemin.endsWith('/index.html') ? chemin.slice(0, -'index.html'.length) : chemin;
  return b + propre.split('/').map(encodeURIComponent).join('/');
}

/** Fichiers dont le nom ne change pas avec le contenu : leur contenu entre dans la version. */
export function sansEmpreinte(chemin: string): boolean {
  return !chemin.startsWith('_astro/');
}

/** Version courte et stable : même entrée → même version. */
export function calculerVersion(fichiers: ReadonlyArray<FichierSortie & { empreinte?: string }>): string {
  const h = createHash('sha256');
  for (const f of [...fichiers].sort((a, b) => (a.chemin < b.chemin ? -1 : 1))) {
    h.update(`${f.chemin}\t${f.taille}\t${f.empreinte ?? ''}\n`);
  }
  return h.digest('hex').slice(0, 12);
}

/** Feuilles Google Fonts liées par une page HTML (href décodé). */
export function extrairePolices(html: string): string[] {
  const urls = new Set<string>();
  for (const m of html.matchAll(/<link\b[^>]*\bhref="(https:\/\/fonts\.googleapis\.com\/css2?\?[^"]+)"/g)) {
    urls.add((m[1] ?? '').replace(/&amp;/g, '&'));
  }
  return [...urls];
}

/** Code final du worker : le modèle avec le manifeste injecté. */
export function codeServiceWorker(modele: string, manifeste: ManifesteSW): string {
  if (!modele.includes(MARQUEUR)) throw new Error(`Marqueur ${MARQUEUR} absent du modèle du service worker.`);
  // Le manifeste est du JSON : c'est aussi un littéral JavaScript valide (ES2019+).
  const json = JSON.stringify(manifeste);
  return `// Généré au build (version ${manifeste.version}). Ne pas modifier : voir integrations/sw-modele.js.\n${modele.replace(MARQUEUR, () => json)}`;
}

/** Modèle du worker (integrations/sw-modele.js). */
export async function lireModele(): Promise<string> {
  const candidats = [
    fileURLToPath(new URL('./sw-modele.js', import.meta.url)),
    resolve(process.cwd(), 'integrations/sw-modele.js'),
  ];
  const fichier = candidats.find((c) => existsSync(c));
  if (!fichier) throw new Error('integrations/sw-modele.js introuvable.');
  return readFile(fichier, 'utf8');
}

/** Prépare le manifeste à partir du dossier de sortie. */
export async function preparerManifeste(dossier: string, base: string): Promise<{ manifeste: ManifesteSW; octets: number; ignores: string[] }> {
  const tous = await listerFichiers(dossier);
  const retenus = tous.filter(doitPrecacher);
  // Fichiers écartés seulement à cause de leur taille (à signaler au build).
  const ignores = tous.filter((f) => f.taille > TAILLE_MAX_PRECACHE && doitPrecacher({ ...f, taille: 0 })).map((f) => f.chemin);
  const avecEmpreinte = await Promise.all(
    retenus.map(async (f) =>
      sansEmpreinte(f.chemin)
        ? { ...f, empreinte: createHash('md5').update(await readFile(join(dossier, f.chemin))).digest('hex') }
        : f,
    ),
  );
  const b = base.endsWith('/') ? base : `${base}/`;
  const horsLigne = retenus.some((f) => f.chemin === PAGE_HORS_LIGNE) ? cheminVersUrl(PAGE_HORS_LIGNE, b) : null;
  // Toutes les pages partagent le même <head> : l'accueil suffit pour trouver les polices.
  const accueil = retenus.find((f) => f.chemin === 'index.html');
  const polices = accueil ? extrairePolices(await readFile(join(dossier, accueil.chemin), 'utf8')) : [];
  return {
    manifeste: {
      version: calculerVersion(avecEmpreinte),
      base: b,
      precache: retenus.map((f) => cheminVersUrl(f.chemin, b)),
      horsLigne,
      polices,
    },
    octets: retenus.reduce((s, f) => s + f.taille, 0),
    ignores,
  };
}

/** Écrit sw.js dans contexte.dossier et renvoie un résumé pour le journal du build. */
export async function genererServiceWorker(contexte: ContexteServiceWorker, avertir: (m: string) => void = () => {}): Promise<string | null> {
  const { manifeste, octets, ignores } = await preparerManifeste(contexte.dossier, contexte.base);
  if (!manifeste.horsLigne) avertir('page hors-ligne absente : repli minimal intégré au worker.');
  for (const f of ignores) avertir(`trop gros pour le précache (mis en cache à l'usage) : ${f}`);
  const fichier = join(contexte.dossier, NOM_SW);
  await writeFile(fichier, codeServiceWorker(await lireModele(), manifeste), 'utf8');
  const mo = (octets / 1024 / 1024).toFixed(1).replace('.', ',');
  return `${NOM_SW} (version ${manifeste.version}, ${manifeste.precache.length} fichiers, ${mo} Mo en précache)`;
}

export default function serviceWorker(): AstroIntegration {
  let base = '/';
  return {
    name: 'manabi:service-worker',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = config.base.endsWith('/') ? config.base : `${config.base}/`;
      },
      'astro:build:done': async ({ dir, pages, logger }) => {
        const contexte: ContexteServiceWorker = {
          dossier: fileURLToPath(dir),
          base,
          pages: pages.map((p) => p.pathname),
        };
        const resultat = await genererServiceWorker(contexte, (m) => logger.warn(m));
        logger.info(resultat ? `service worker écrit : ${resultat}` : 'service worker : rien à écrire');
      },
    },
  };
}
