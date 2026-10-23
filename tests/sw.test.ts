import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  calculerVersion,
  cheminVersUrl,
  codeServiceWorker,
  doitPrecacher,
  extrairePolices,
  genererServiceWorker,
  lireModele,
  MARQUEUR,
  preparerManifeste,
  TAILLE_MAX_PRECACHE,
  type ManifesteSW,
} from '../integrations/service-worker.ts';

const BASE = '/Cours-Dev-Code/';
const ORIGINE = 'https://exemple.test';

describe('intégration : liste des fichiers', () => {
  it('transforme un chemin de fichier en URL de page', () => {
    expect(cheminVersUrl('index.html', BASE)).toBe('/Cours-Dev-Code/');
    expect(cheminVersUrl('tomes/index.html', BASE)).toBe('/Cours-Dev-Code/tomes/');
    expect(cheminVersUrl('cours/react/06-usestate/index.html', BASE)).toBe('/Cours-Dev-Code/cours/react/06-usestate/');
    expect(cheminVersUrl('404.html', BASE)).toBe('/Cours-Dev-Code/404.html');
    expect(cheminVersUrl('_astro/client.Ab1.js', '/Cours-Dev-Code')).toBe('/Cours-Dev-Code/_astro/client.Ab1.js');
    expect(cheminVersUrl('icons/mon icône.png', BASE)).toBe('/Cours-Dev-Code/icons/mon%20ic%C3%B4ne.png');
  });

  it('précache pages de l’app, _astro, JSON, icônes, manifest et polices ; jamais les médias, les cours ni pdf.js', () => {
    const oui = [
      'index.html',
      'tomes/react/index.html',
      '404.html',
      '_astro/client.Ab1.js',
      '_astro/BaseLayout.Cd2.css',
      '_astro/atkinson-latin.Ef3.woff2',
      'search-index.json',
      'donnees/cartes.json',
      'donnees/quiz.json',
      'icons/icon-192.png',
      'manifest.webmanifest',
      'favicon.svg',
      'polices/locale.woff2',
    ];
    const non = [
      'media/react/slides.pdf',
      'media/react/schema.png',
      'cours/react/06-usestate/index.html',
      '_astro/pdf.worker.min.CjEcRF4W.mjs',
      '_astro/pdf.B2gYPjRu.js',
      'sw.js',
      '_astro/client.Ab1.js.map',
      '.nojekyll',
      'robots.txt',
    ];
    for (const chemin of oui) expect(doitPrecacher({ chemin, taille: 1000 }), chemin).toBe(true);
    for (const chemin of non) expect(doitPrecacher({ chemin, taille: 1000 }), chemin).toBe(false);
    expect(doitPrecacher({ chemin: '_astro/enorme.js', taille: TAILLE_MAX_PRECACHE + 1 })).toBe(false);
  });

  it('calcule une version stable, qui change avec une taille ou un contenu', () => {
    const a = [
      { chemin: 'index.html', taille: 10, empreinte: 'x' },
      { chemin: '_astro/a.js', taille: 20 },
    ];
    const v = calculerVersion(a);
    expect(v).toMatch(/^[0-9a-f]{12}$/);
    expect(calculerVersion([...a].reverse())).toBe(v);
    expect(calculerVersion([{ ...a[0]!, taille: 11 }, a[1]!])).not.toBe(v);
    expect(calculerVersion([{ ...a[0]!, empreinte: 'y' }, a[1]!])).not.toBe(v);
    expect(calculerVersion([...a, { chemin: 'tomes/index.html', taille: 5 }])).not.toBe(v);
  });

  it('injecte le manifeste dans le modèle', async () => {
    const modele = await lireModele();
    expect(modele).toContain(MARQUEUR);
    const code = codeServiceWorker(modele, { version: 'abc', base: BASE, precache: ['/Cours-Dev-Code/'], horsLigne: null, polices: [] });
    expect(code).not.toContain(MARQUEUR);
    expect(code).toContain('"version":"abc"');
    expect(() => new Function(code)).not.toThrow(); // syntaxe valide
    expect(() => codeServiceWorker('sans marqueur', { version: 'a', base: '/', precache: [], horsLigne: null, polices: [] })).toThrow();
  });

  it('trouve les feuilles Google Fonts d’une page', () => {
    const html =
      '<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>' +
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&amp;display=swap&amp;text=%E5%AD%A6" media="print">' +
      '<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&amp;display=swap&amp;text=%E5%AD%A6"></noscript>';
    expect(extrairePolices(html)).toEqual(['https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&display=swap&text=%E5%AD%A6']);
    expect(extrairePolices('<p>rien</p>')).toEqual([]);
  });
});

describe('intégration : écriture de sw.js', () => {
  let dossier = '';

  beforeEach(async () => {
    dossier = await mkdtemp(join(tmpdir(), 'manabi-sw-'));
    const fichiers: Record<string, string> = {
      'index.html': '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho&amp;text=%E5%AD%A6"><h1>Aujourd’hui</h1>',
      'hors-ligne/index.html': '<h1>Hors-ligne</h1>',
      'cours/react/06-usestate/index.html': '<h1>useState</h1>',
      '_astro/client.Ab1.js': 'console.log(1)',
      'search-index.json': '[]',
      'donnees/cartes.json': '[]',
      'icons/icon-192.png': 'png',
      'manifest.webmanifest': '{}',
      'media/react/slides.pdf': '%PDF',
    };
    for (const [chemin, contenu] of Object.entries(fichiers)) {
      await mkdir(join(dossier, chemin, '..'), { recursive: true });
      await writeFile(join(dossier, chemin), contenu);
    }
  });

  afterEach(async () => {
    await rm(dossier, { recursive: true, force: true });
  });

  it('écrit sw.js avec la liste attendue, sans les médias ni les pages de cours', async () => {
    const resume = await genererServiceWorker({ dossier, base: BASE, pages: [] });
    expect(resume).toMatch(/^sw\.js \(version [0-9a-f]{12}, 7 fichiers/);
    const code = await readFile(join(dossier, 'sw.js'), 'utf8');
    expect(code).not.toContain('"/Cours-Dev-Code/cours/react/06-usestate/"');
    expect(code).toContain('"/Cours-Dev-Code/donnees/cartes.json"');
    expect(code).toContain('"horsLigne":"/Cours-Dev-Code/hors-ligne/"');
    expect(code).not.toContain('slides.pdf');
    expect(code).toContain('"polices":["https://fonts.googleapis.com/css2?family=Shippori+Mincho&text=%E5%AD%A6"]');
  });

  it('change de version quand une page change, même à taille égale', async () => {
    const avant = (await preparerManifeste(dossier, BASE)).manifeste.version;
    await writeFile(join(dossier, 'index.html'), '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho&amp;text=%E5%AD%A6"><h1>Aujourd’hua</h1>');
    const apres = (await preparerManifeste(dossier, BASE)).manifeste.version;
    expect(apres).not.toBe(avant);
    // Un média ne fait pas changer la version (il n'est pas précaché).
    await writeFile(join(dossier, 'media/react/slides.pdf'), '%PDF-2');
    expect((await preparerManifeste(dossier, BASE)).manifeste.version).toBe(apres);
  });

  it('sans page hors-ligne : horsLigne vaut null et le build prévient', async () => {
    await rm(join(dossier, 'hors-ligne'), { recursive: true });
    const avertir = vi.fn();
    await genererServiceWorker({ dossier, base: BASE, pages: [] }, avertir);
    expect(avertir).toHaveBeenCalledWith(expect.stringContaining('hors-ligne'));
    expect((await preparerManifeste(dossier, BASE)).manifeste.horsLigne).toBeNull();
  });
});

// ─── Le worker lui-même, dans un faux environnement de service worker ────────

type Req = Request | { url: string; method: string; mode: string; destination: string; headers: Headers; cache: string };
const urlDe = (r: Req | string) => new URL(typeof r === 'string' ? r : r.url, ORIGINE).href;

class FauxCache {
  donnees = new Map<string, Response>();
  async match(r: Req | string, options?: { ignoreSearch?: boolean }) {
    const cle = urlDe(r);
    const direct = this.donnees.get(cle);
    if (direct) return direct.clone();
    if (options?.ignoreSearch) {
      const sans = cle.split('?')[0];
      for (const [k, v] of this.donnees) if (k.split('?')[0] === sans) return v.clone();
    }
    return undefined;
  }
  async put(r: Req | string, rep: Response) {
    this.donnees.set(urlDe(r), rep.clone());
  }
  async keys() {
    return [...this.donnees.keys()].map((url) => ({ url }));
  }
  async delete(r: Req | string | { url: string }) {
    return this.donnees.delete(urlDe(r as Req));
  }
}

class FauxCaches {
  caches = new Map<string, FauxCache>();
  async open(nom: string) {
    if (!this.caches.has(nom)) this.caches.set(nom, new FauxCache());
    return this.caches.get(nom)!;
  }
  async keys() {
    return [...this.caches.keys()];
  }
  async delete(nom: string) {
    return this.caches.delete(nom);
  }
  async match(r: Req | string, options?: { ignoreSearch?: boolean }) {
    for (const c of this.caches.values()) {
      const rep = await c.match(r, options);
      if (rep) return rep;
    }
    return undefined;
  }
}

/** Réponse « basic » (même origine), comme celles d'un vrai fetch. */
function reponse(corps: string, status = 200): Response {
  const r = new Response(corps, { status, headers: { 'Content-Type': 'text/html' } });
  Object.defineProperty(r, 'type', { value: 'basic' });
  return r;
}

const MANIFESTE: ManifesteSW = {
  version: 'v2',
  base: BASE,
  precache: ['/Cours-Dev-Code/', '/Cours-Dev-Code/reviser/', '/Cours-Dev-Code/hors-ligne/', '/Cours-Dev-Code/_astro/a.Ab1.js', '/Cours-Dev-Code/donnees/cartes.json'],
  horsLigne: '/Cours-Dev-Code/hors-ligne/',
  polices: ['https://fonts.googleapis.com/css2?family=Shippori+Mincho'],
};

async function installerWorker(fetchImpl: (r: Req | string) => Promise<Response>) {
  const ecouteurs = new Map<string, (ev: unknown) => void>();
  const skipWaiting = vi.fn();
  const self = {
    location: new URL(`${ORIGINE}${BASE}sw.js`),
    registration: { navigationPreload: { enable: async () => {} } },
    clients: { claim: vi.fn(async () => {}), matchAll: async () => [], openWindow: async () => {} },
    skipWaiting,
    addEventListener: (type: string, f: (ev: unknown) => void) => ecouteurs.set(type, f),
  };
  const caches = new FauxCaches();
  const fetch = vi.fn(fetchImpl);
  // Délai réseau raccourci : la course réseau / cache se joue en quelques millisecondes.
  const minuterie = (f: () => void) => setTimeout(f, 5);
  const code = codeServiceWorker(await lireModele(), MANIFESTE);
  new Function('self', 'caches', 'fetch', 'setTimeout', code)(self, caches, fetch, minuterie);

  const etendre = async (type: string, extra: Record<string, unknown> = {}) => {
    const attentes: Promise<unknown>[] = [];
    ecouteurs.get(type)!({ waitUntil: (p: Promise<unknown>) => attentes.push(p), ...extra });
    await Promise.all(attentes);
  };

  /** Simule une requête ; renvoie la réponse (ou null si le worker laisse passer). */
  const requete = async (url: string, options: { method?: string; navigation?: boolean; headers?: Record<string, string> } = {}) => {
    const req: Req = {
      url: new URL(url, ORIGINE).href,
      method: options.method ?? 'GET',
      mode: options.navigation ? 'navigate' : 'cors',
      destination: options.navigation ? 'document' : 'script',
      headers: new Headers(options.headers),
      cache: 'default',
    };
    let promesse: Promise<Response> | null = null;
    const attentes: Promise<unknown>[] = [];
    ecouteurs.get('fetch')!({
      request: req,
      preloadResponse: Promise.resolve(undefined),
      respondWith: (p: Promise<Response>) => (promesse = p),
      waitUntil: (p: Promise<unknown>) => attentes.push(p),
    });
    if (!promesse) return null;
    const r = await (promesse as Promise<Response>);
    // Les tâches de fond (copies en cache) ; un réseau qui ne répond jamais ne bloque pas le test.
    await Promise.race([Promise.all(attentes), new Promise((ok) => setTimeout(ok, 50))]);
    return r;
  };

  return { caches, fetch, skipWaiting, etendre, requete, ecouteurs, clients: self.clients };
}

describe('service worker', () => {
  const enLigne = async (r: Req | string) => {
    const url = urlDe(r);
    if (url.includes('fonts.googleapis.com')) return reponse('@font-face{src:url(https://fonts.gstatic.com/s/shippori/a.woff2) format("woff2")}');
    if (url.includes('fonts.gstatic.com')) return reponse('woff2');
    return reponse(`réseau ${new URL(url).pathname}`);
  };
  const horsLigne = async () => {
    throw new TypeError('Failed to fetch');
  };

  it('précache toute la liste à l’installation, puis la police des kanji', async () => {
    const w = await installerWorker(enLigne);
    await w.etendre('install');
    const cache = await w.caches.open('manabi-precache-v2');
    expect((await cache.keys()).length).toBe(MANIFESTE.precache.length);
    const polices = (await (await w.caches.open('manabi-polices-v1')).keys()).map((r) => r.url);
    expect(polices).toEqual(['https://fonts.googleapis.com/css2?family=Shippori+Mincho', 'https://fonts.gstatic.com/s/shippori/a.woff2']);
    expect(w.fetch).toHaveBeenCalledTimes(MANIFESTE.precache.length + 2);
  });

  it('une police injoignable n’empêche pas l’installation', async () => {
    const w = await installerWorker(async (r) => (urlDe(r).includes('fonts.') ? horsLigne() : reponse('ok')));
    await expect(w.etendre('install')).resolves.toBeUndefined();
  });

  it('recopie les fichiers à empreinte d’une version précédente au lieu de les retélécharger', async () => {
    const w = await installerWorker(enLigne);
    const ancien = await w.caches.open('manabi-precache-v1');
    await ancien.put(`${ORIGINE}/Cours-Dev-Code/_astro/a.Ab1.js`, reponse('ancien js'));
    await w.etendre('install');
    const telecharges = w.fetch.mock.calls.map(([r]) => urlDe(r as Req));
    expect(telecharges).not.toContain(`${ORIGINE}/Cours-Dev-Code/_astro/a.Ab1.js`);
    expect(telecharges).toContain(`${ORIGINE}/Cours-Dev-Code/reviser/`); // HTML : toujours retéléchargé
  });

  it('échoue l’installation si un fichier manque (pas de demi-cache)', async () => {
    const w = await installerWorker(async (r) => (urlDe(r).endsWith('cartes.json') ? reponse('', 404) : reponse('ok')));
    await expect(w.etendre('install')).rejects.toThrow(/Précache impossible/);
  });

  it('nettoie les anciens caches Manabi à l’activation, sans toucher aux autres', async () => {
    const w = await installerWorker(enLigne);
    for (const nom of ['manabi-precache-v1', 'manabi-pages-v1', 'manabi-precache-v2', 'manabi-ressources-v1', 'autre-site']) await w.caches.open(nom);
    await w.etendre('activate');
    expect((await w.caches.keys()).sort()).toEqual(['autre-site', 'manabi-precache-v2', 'manabi-ressources-v1']);
    expect(w.clients.claim).toHaveBeenCalled();
  });

  it('laisse passer les requêtes non GET, les API et les autres origines', async () => {
    const w = await installerWorker(enLigne);
    expect(await w.requete('/Cours-Dev-Code/donnees/cartes.json', { method: 'POST' })).toBeNull();
    expect(await w.requete('https://api.github.com/repos/drakurei/Cours-Dev-Code')).toBeNull();
    expect(await w.requete('https://api.anthropic.com/v1/messages')).toBeNull();
    expect(await w.requete('https://ailleurs.test/x.js')).toBeNull();
    expect(await w.requete('/autre-site/')).toBeNull(); // hors de la portée
    expect(await w.requete('/Cours-Dev-Code/sw.js')).toBeNull();
    expect(await w.requete('/Cours-Dev-Code/media/video.mp4', { headers: { range: 'bytes=0-' } })).toBeNull();
    expect(w.fetch).not.toHaveBeenCalled();
  });

  it('pages : réseau d’abord, avec une copie gardée pour plus tard', async () => {
    const w = await installerWorker(enLigne);
    const r = await w.requete('/Cours-Dev-Code/tomes/', { navigation: true });
    expect(await r!.text()).toBe('réseau /Cours-Dev-Code/tomes/');
    const copie = await (await w.caches.open('manabi-pages-v2')).match(`${ORIGINE}/Cours-Dev-Code/tomes/`);
    expect(copie).toBeDefined();
  });

  it('pages hors-ligne : la copie en cache, sinon la page hors-ligne', async () => {
    const w = await installerWorker(enLigne);
    await w.etendre('install');
    w.fetch.mockImplementation(horsLigne);
    const accueil = await w.requete('/Cours-Dev-Code/?depuis=pwa', { navigation: true });
    expect(await accueil!.text()).toBe('réseau /Cours-Dev-Code/');
    const sansSlash = await w.requete('/Cours-Dev-Code/reviser', { navigation: true });
    expect(await sansSlash!.text()).toBe('réseau /Cours-Dev-Code/reviser/');
    const inconnue = await w.requete('/Cours-Dev-Code/cours/nouveau/', { navigation: true });
    expect(await inconnue!.text()).toBe('réseau /Cours-Dev-Code/hors-ligne/');
  });

  it('pages : un réseau trop lent cède la place à la copie en cache', async () => {
    const w = await installerWorker(enLigne);
    await w.etendre('install');
    w.fetch.mockImplementation(() => new Promise<Response>(() => {})); // ne répond jamais
    const r = await w.requete('/Cours-Dev-Code/reviser/', { navigation: true }).catch(() => null);
    expect(await r!.text()).toBe('réseau /Cours-Dev-Code/reviser/');
  });

  it('sans page hors-ligne en cache : une page de secours minimale', async () => {
    const w = await installerWorker(horsLigne);
    const r = await w.requete('/Cours-Dev-Code/glossaire/', { navigation: true });
    expect(r!.status).toBe(503);
    expect(await r!.text()).toContain('Tu es hors-ligne.');
  });

  it('ressources précachées : cache d’abord, sans réseau', async () => {
    const w = await installerWorker(enLigne);
    await w.etendre('install');
    w.fetch.mockClear();
    const r = await w.requete('/Cours-Dev-Code/_astro/a.Ab1.js');
    expect(await r!.text()).toBe('réseau /Cours-Dev-Code/_astro/a.Ab1.js');
    const donnees = await w.requete('/Cours-Dev-Code/donnees/cartes.json');
    expect(donnees!.status).toBe(200);
    expect(w.fetch).not.toHaveBeenCalled();
  });

  it('médias : mis en cache à l’usage, puis servis même hors-ligne', async () => {
    const w = await installerWorker(enLigne);
    await w.requete('/Cours-Dev-Code/media/react/schema.png');
    expect(await (await w.caches.open('manabi-ressources-v1')).match(`${ORIGINE}/Cours-Dev-Code/media/react/schema.png`)).toBeDefined();
    w.fetch.mockImplementation(horsLigne);
    const r = await w.requete('/Cours-Dev-Code/media/react/schema.png');
    expect(await r!.text()).toBe('réseau /Cours-Dev-Code/media/react/schema.png');
  });

  it('Google Fonts : stale-while-revalidate', async () => {
    const w = await installerWorker(enLigne);
    const police = 'https://fonts.googleapis.com/css2?family=Shippori+Mincho&text=x';
    expect(await (await w.requete(police))!.text()).toContain('@font-face');
    w.fetch.mockImplementation(async () => reponse('@font-face{nouvelle}'));
    expect(await (await w.requete(police))!.text()).toContain('gstatic'); // la copie tout de suite
    expect(await (await w.requete(police))!.text()).toBe('@font-face{nouvelle}'); // rafraîchie en arrière-plan
  });

  it('Google Fonts hors-ligne sans copie : une feuille vide, pas une erreur', async () => {
    const w = await installerWorker(horsLigne);
    const r = await w.requete('https://fonts.googleapis.com/css2?family=Inconnue');
    expect(r!.status).toBe(200);
    expect(await r!.text()).toBe('');
    const fichier = await w.requete('https://fonts.gstatic.com/s/inconnue.woff2');
    expect(fichier!.type).toBe('error');
  });

  it('répond aux messages SKIP_WAITING et VERSION', async () => {
    const w = await installerWorker(enLigne);
    w.ecouteurs.get('message')!({ data: { type: 'SKIP_WAITING' } });
    expect(w.skipWaiting).toHaveBeenCalled();
    const postMessage = vi.fn();
    w.ecouteurs.get('message')!({ data: { type: 'VERSION' }, ports: [{ postMessage }] });
    expect(postMessage).toHaveBeenCalledWith('v2');
  });
});
