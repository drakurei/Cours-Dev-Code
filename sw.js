// Généré au build (version 1b4ab3b73df3). Ne pas modifier : voir integrations/sw-modele.js.
/**
 * Manabi 学び — service worker (hors-ligne).
 *
 * Fichier MODÈLE : integrations/service-worker.ts le copie dans <dist>/sw.js à la fin du build,
 * en remplaçant le marqueur du manifeste par { version, base, precache, horsLigne, polices }.
 *
 * Stratégies :
 *   pages HTML            réseau d'abord (4 s au plus), copie en cache, puis repli cache → /hors-ligne/
 *   _astro, JSON, icônes  cache d'abord (précachés au build)
 *   public/media et reste cache d'abord, mis en cache à l'usage, rafraîchi en arrière-plan
 *   Google Fonts          stale-while-revalidate
 *   jamais en cache       requêtes non GET, api.github.com, api.anthropic.com, autres origines
 */

const MANIFESTE = {"version":"1b4ab3b73df3","base":"/Cours-Dev-Code/","precache":["/Cours-Dev-Code/404.html","/Cours-Dev-Code/_astro/Atelier.C__R4yds.js","/Cours-Dev-Code/_astro/Atelier.cBgrBaHR.css","/Cours-Dev-Code/_astro/BaseLayout.astro_astro_type_script_index_0_lang.0XAACns_.js","/Cours-Dev-Code/_astro/BaseLayout.qWF8P62v.css","/Cours-Dev-Code/_astro/CarteRevision.CUVSVKVn.js","/Cours-Dev-Code/_astro/CommandPalette.C-Mj0dwL.js","/Cours-Dev-Code/_astro/CoursLayout.astro_astro_type_script_index_0_lang.DLlPXjkL.js","/Cours-Dev-Code/_astro/Exercices.MpnepBpw.js","/Cours-Dev-Code/_astro/Flashcards.lqecNlMt.js","/Cours-Dev-Code/_astro/IconeSvg.qFbUUVpv.js","/Cours-Dev-Code/_astro/Minuteur.DDu6QPxY.js","/Cours-Dev-Code/_astro/MinuteurRapide.anrOE0sO.js","/Cours-Dev-Code/_astro/MissionDuJour.KGclBtw1.js","/Cours-Dev-Code/_astro/Quiz.DjOC8yjd.js","/Cours-Dev-Code/_astro/Quiz.Dy6DW_Xs.js","/Cours-Dev-Code/_astro/Reglages.1AmYSYE4.css","/Cours-Dev-Code/_astro/Reglages.Cmt2SspB.js","/Cours-Dev-Code/_astro/Reprendre.Cgny-dGZ.js","/Cours-Dev-Code/_astro/Reviser.CGuBBWeB.js","/Cours-Dev-Code/_astro/Reviser.jUTH-B9L.css","/Cours-Dev-Code/_astro/Revisions.DN5ejtbv.js","/Cours-Dev-Code/_astro/Visuels.DOhOUg_6.js","/Cours-Dev-Code/_astro/_..Bxgmoys0.css","/Cours-Dev-Code/_astro/_matiere_.BSE_G-lX.css","/Cours-Dev-Code/_astro/_matiere_.astro_astro_type_script_index_0_lang.V8u9YFhP.js","/Cours-Dev-Code/_astro/apprentissage.BfNoGU_e.css","/Cours-Dev-Code/_astro/apprentissage.Bl4po1Fk.js","/Cours-Dev-Code/_astro/atkinson-hyperlegible-next-latin-ext-wght-italic.Cigfgs4r.woff2","/Cours-Dev-Code/_astro/atkinson-hyperlegible-next-latin-ext-wght-normal.C6vrW8VD.woff2","/Cours-Dev-Code/_astro/atkinson-hyperlegible-next-latin-wght-italic.DC5MiAaX.woff2","/Cours-Dev-Code/_astro/atkinson-hyperlegible-next-latin-wght-normal.BcXVPD7q.woff2","/Cours-Dev-Code/_astro/clavier.MCZ9wDLi.js","/Cours-Dev-Code/_astro/client.Dy9YixfH.js","/Cours-Dev-Code/_astro/code.DxFBVilm.js","/Cours-Dev-Code/_astro/ecouter.DRMnSCAw.js","/Cours-Dev-Code/_astro/es.BdnkOsEN.js","/Cours-Dev-Code/_astro/glossaire.BhZUyVy4.css","/Cours-Dev-Code/_astro/glossaire.astro_astro_type_script_index_0_lang.D1jEZYYk.js","/Cours-Dev-Code/_astro/icones.Ch-VMrjZ.js","/Cours-Dev-Code/_astro/images.DWStfCmx.js","/Cours-Dev-Code/_astro/index.DaTSRSRH.css","/Cours-Dev-Code/_astro/jetbrains-mono-cyrillic-wght-italic.CfQkWpeR.woff2","/Cours-Dev-Code/_astro/jetbrains-mono-cyrillic-wght-normal.D73BlboJ.woff2","/Cours-Dev-Code/_astro/jetbrains-mono-greek-wght-italic.Dmq-fBVQ.woff2","/Cours-Dev-Code/_astro/jetbrains-mono-greek-wght-normal.Bw9x6K1M.woff2","/Cours-Dev-Code/_astro/jetbrains-mono-latin-ext-wght-italic.BrDczivE.woff2","/Cours-Dev-Code/_astro/jetbrains-mono-latin-ext-wght-normal.DBQx-q_a.woff2","/Cours-Dev-Code/_astro/jetbrains-mono-latin-wght-italic.B2M6KQje.woff2","/Cours-Dev-Code/_astro/jetbrains-mono-latin-wght-normal.B9CIFXIH.woff2","/Cours-Dev-Code/_astro/jetbrains-mono-vietnamese-wght-italic.Dcombn6O.woff2","/Cours-Dev-Code/_astro/jetbrains-mono-vietnamese-wght-normal.Bt-aOZkq.woff2","/Cours-Dev-Code/_astro/jsx-runtime.BzgyUtJl.js","/Cours-Dev-Code/_astro/libelles.gHYaZdQb.js","/Cours-Dev-Code/_astro/normaliser.Lx3DXdEL.js","/Cours-Dev-Code/_astro/pipeline.BZURpone.js","/Cours-Dev-Code/_astro/preload-helper.Cu84ySV4.js","/Cours-Dev-Code/_astro/react-dom.BUrlqAcn.js","/Cours-Dev-Code/_astro/react.DB-4Zxce.js","/Cours-Dev-Code/_astro/session.CFr5F_yP.js","/Cours-Dev-Code/_astro/source.Bqav8-LN.js","/Cours-Dev-Code/_astro/srs.BFlIVbSD.js","/Cours-Dev-Code/_astro/store.ClT9S7sE.js","/Cours-Dev-Code/_astro/sync.pm3hdgTD.js","/Cours-Dev-Code/_astro/texte.BbM_7C0u.js","/Cours-Dev-Code/_astro/url.D7pCQYZZ.js","/Cours-Dev-Code/_astro/useAujourdhui.CiDvPh-C.js","/Cours-Dev-Code/_astro/useManabi.BTeKa7Rg.js","/Cours-Dev-Code/atelier/","/Cours-Dev-Code/donnees/cartes.json","/Cours-Dev-Code/donnees/quiz.json","/Cours-Dev-Code/favicon.svg","/Cours-Dev-Code/glossaire/","/Cours-Dev-Code/hors-ligne/","/Cours-Dev-Code/icons/apple-touch-icon.png","/Cours-Dev-Code/icons/icon-192.png","/Cours-Dev-Code/icons/icon-512.png","/Cours-Dev-Code/icons/maskable-512.png","/Cours-Dev-Code/","/Cours-Dev-Code/manifest.webmanifest","/Cours-Dev-Code/projets/","/Cours-Dev-Code/reglages/","/Cours-Dev-Code/reviser/","/Cours-Dev-Code/search-index.json","/Cours-Dev-Code/tomes/gestion-projet/","/Cours-Dev-Code/tomes/html-css/","/Cours-Dev-Code/tomes/ia-seo/","/Cours-Dev-Code/tomes/","/Cours-Dev-Code/tomes/javascript/","/Cours-Dev-Code/tomes/manabi/","/Cours-Dev-Code/tomes/projets/","/Cours-Dev-Code/tomes/react/"],"horsLigne":"/Cours-Dev-Code/hors-ligne/","polices":["https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&display=swap&text=0123456789%E3%81%86%E3%81%8A%E3%81%93%E3%81%A1%E3%81%AB%E3%81%AF%E3%81%B0%E3%81%B3%E3%82%88%E3%82%89%E3%82%93%E4%BB%8A%E4%BD%95%E4%BD%9C%E4%BE%8B%E5%86%86%E5%8B%95%E5%95%8F%E5%A0%B4%E5%A4%9C%E5%AD%90%E5%AD%A6%E5%B7%A5%E5%B7%BB%E5%BD%A2%E5%BE%A9%E5%BF%9C%E6%8A%80%E6%8E%A2%E6%96%B0%E6%9B%B8%E6%9C%AD%E6%B3%A8%E6%B8%88%E7%9B%B8%E7%9F%A5%E7%AC%AC%E7%B5%84%E7%B7%B4%E7%BD%A0%E8%8A%B1%E8%A6%81%E8%A6%9A%E8%A8%AD%E8%A9%B1%E8%BE%9E%E8%BF%B7%E9%80%A3"]} || { version: 'dev', base: '/', precache: [], horsLigne: null, polices: [] };

const VERSION = MANIFESTE.version;
const BASE = MANIFESTE.base;
const PREFIXE = 'manabi-';
const CACHE_PRECACHE = `${PREFIXE}precache-${VERSION}`;
const CACHE_PAGES = `${PREFIXE}pages-${VERSION}`;
const CACHE_RESSOURCES = `${PREFIXE}ressources-v1`;
const CACHE_POLICES = `${PREFIXE}polices-v1`;
const CACHES_GARDES = new Set([CACHE_PRECACHE, CACHE_PAGES, CACHE_RESSOURCES, CACHE_POLICES]);

const JAMAIS = new Set(['api.github.com', 'api.anthropic.com']);
const POLICES = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);
/** Fichiers dont le nom contient une empreinte : même URL = même contenu. */
const IMMUABLE = /\/_astro\//;
const DELAI_RESEAU = 4000;
const MAX_RESSOURCES = 150;

const absolue = (chemin) => new URL(chemin, self.location.origin).href;

// ─── Installation : précache ─────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(precacher().then(() => precacherPolices().catch(() => {})));
});

async function precacher() {
  const cache = await caches.open(CACHE_PRECACHE);
  const deja = new Set((await cache.keys()).map((r) => r.url));
  const anciens = await anciensPrecaches();
  const aFaire = MANIFESTE.precache.map(absolue).filter((u) => !deja.has(u));
  await parPaquets(aFaire, 6, async (url) => {
    // Un fichier à empreinte déjà téléchargé par une version précédente : on le recopie.
    if (IMMUABLE.test(url)) {
      for (const ancien of anciens) {
        const r = await ancien.match(url);
        if (r) {
          await cache.put(url, r);
          return;
        }
      }
    }
    const reponse = await fetch(new Request(url, { cache: 'reload', credentials: 'same-origin' }));
    if (!reponse.ok) throw new Error(`Précache impossible : ${url} (${reponse.status})`);
    await cache.put(url, await sansRedirection(reponse));
  });
}

/** Police des kanji (Google Fonts) : la feuille et ses fichiers, pour lire les kanji hors-ligne dès la 1re visite. */
async function precacherPolices() {
  const cache = await caches.open(CACHE_POLICES);
  for (const url of MANIFESTE.polices || []) {
    if (await cache.match(url)) continue;
    const feuille = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!feuille.ok) continue;
    const css = await feuille.clone().text();
    await cache.put(url, feuille);
    const fichiers = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)\s'"]+)\)/g)].map((m) => m[1]);
    await parPaquets(fichiers, 4, async (f) => {
      if (await cache.match(f)) return;
      const r = await fetch(f, { mode: 'cors', credentials: 'omit' });
      if (r.ok) await cache.put(f, r);
    });
  }
}

async function anciensPrecaches() {
  const noms = (await caches.keys()).filter((n) => n.startsWith(`${PREFIXE}precache-`) && n !== CACHE_PRECACHE);
  return Promise.all(noms.map((n) => caches.open(n)));
}

/** Lance `fn` sur chaque élément, `n` à la fois. */
async function parPaquets(liste, n, fn) {
  let i = 0;
  const travailleur = async () => {
    while (i < liste.length) await fn(liste[i++]);
  };
  await Promise.all(Array.from({ length: Math.min(n, liste.length) }, travailleur));
}

/** Une réponse issue d'une redirection ne peut pas servir une navigation : on la recopie. */
async function sansRedirection(reponse) {
  if (!reponse.redirected) return reponse;
  return new Response(await reponse.blob(), {
    status: reponse.status,
    statusText: reponse.statusText,
    headers: reponse.headers,
  });
}

// ─── Activation : nettoyage des anciens caches ───────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const noms = await caches.keys();
      await Promise.all(noms.filter((n) => n.startsWith(PREFIXE) && !CACHES_GARDES.has(n)).map((n) => caches.delete(n)));
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable().catch(() => {});
      await self.clients.claim();
    })(),
  );
});

// ─── Messages de la page ─────────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  const type = event.data && event.data.type;
  if (type === 'SKIP_WAITING') self.skipWaiting();
  if (type === 'VERSION' && event.ports && event.ports[0]) event.ports[0].postMessage(VERSION);
});

// Notification du minuteur : un clic ramène sur le site.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const fenetres = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const fenetre = fenetres.find((c) => new URL(c.url).pathname.startsWith(BASE));
      if (fenetre) return fenetre.focus();
      return self.clients.openWindow(BASE);
    })(),
  );
});

// ─── Requêtes ────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return;

  const url = new URL(request.url);
  if (JAMAIS.has(url.hostname)) return;
  if (POLICES.has(url.hostname)) {
    event.respondWith(staleWhileRevalidate(event, CACHE_POLICES));
    return;
  }
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (url.pathname === `${BASE}sw.js`) return;
  if (request.headers.has('range')) return; // lecture partielle (vidéo, PDF) : le réseau

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(page(event));
    return;
  }
  event.respondWith(ressource(event));
});

/** Pages : réseau d'abord ; au-delà de DELAI_RESEAU, la copie en cache si elle existe. */
async function page(event) {
  const { request } = event;
  let copie = null;
  const reseau = (async () => {
    const prechargee = await event.preloadResponse;
    const reponse = prechargee || (await fetch(request));
    if (reponse.status === 200 && reponse.type === 'basic') copie = reponse.clone();
    return reponse;
  })();
  // waitUntil tout de suite : la copie peut arriver après la réponse servie depuis le cache.
  event.waitUntil(
    reseau
      .then(async () => {
        if (copie) await (await caches.open(CACHE_PAGES)).put(request, copie);
      })
      .catch(() => {}),
  );

  try {
    const reponse = await premiereReponse(reseau, () => pageEnCache(request), DELAI_RESEAU);
    if (reponse.status >= 500) return (await pageEnCache(request)) || reponse;
    return reponse;
  } catch {
    return (await pageEnCache(request)) || (await pageHorsLigne());
  }
}

/** Réponse du réseau, sauf s'il tarde : la copie en cache (si elle existe) passe alors devant. */
function premiereReponse(reseau, secours, delai) {
  return new Promise((resolve, reject) => {
    let fini = false;
    const minuterie = setTimeout(async () => {
      const r = await secours().catch(() => undefined);
      if (r && !fini) {
        fini = true;
        resolve(r);
      }
    }, delai);
    reseau.then(
      (r) => {
        clearTimeout(minuterie);
        if (!fini) {
          fini = true;
          resolve(r);
        }
      },
      (e) => {
        clearTimeout(minuterie);
        if (!fini) {
          fini = true;
          reject(e);
        }
      },
    );
  });
}

/** Copie d'une page : précache de cette version, puis pages déjà ouvertes. Requête et ancre ignorées. */
async function pageEnCache(request) {
  const url = new URL(request.url);
  url.search = '';
  url.hash = '';
  const candidats = [url.href];
  if (!url.pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(url.pathname)) candidats.push(`${url.href}/`);
  for (const nom of [CACHE_PRECACHE, CACHE_PAGES]) {
    const cache = await caches.open(nom);
    for (const c of candidats) {
      const r = await cache.match(c);
      if (r) return r;
    }
  }
  return undefined;
}

async function pageHorsLigne() {
  if (MANIFESTE.horsLigne) {
    const r = await caches.match(absolue(MANIFESTE.horsLigne));
    if (r) return r;
  }
  return new Response(
    '<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Hors-ligne · Manabi</title><body style="font-family:system-ui,sans-serif;padding:2rem"><h1>Tu es hors-ligne.</h1><p>Les pages déjà ouvertes restent disponibles.</p></body></html>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

/** Ressources : cache d'abord. Hors précache (médias…) : mise en cache à l'usage + rafraîchissement discret. */
async function ressource(event) {
  const { request } = event;
  const enCache = await caches.match(request);
  if (enCache) {
    if (!IMMUABLE.test(request.url) && !(await estPrecache(request))) {
      event.waitUntil(rafraichir(request).catch(() => {}));
    }
    return enCache;
  }
  try {
    return await rafraichir(request);
  } catch {
    // Hors-ligne : une copie avec une autre requête (?v=…) vaut mieux que rien.
    return (await caches.match(request, { ignoreSearch: true })) || Response.error();
  }
}

async function estPrecache(request) {
  const cache = await caches.open(CACHE_PRECACHE);
  return !!(await cache.match(request));
}

async function rafraichir(request) {
  const reponse = await fetch(request);
  if (reponse.status === 200 && reponse.type === 'basic') {
    const copie = reponse.clone();
    const cache = await caches.open(CACHE_RESSOURCES);
    await cache.put(request, copie);
    await limiter(cache, MAX_RESSOURCES);
  }
  return reponse;
}

/** Garde les `max` entrées les plus récentes (l'ordre des clés suit l'ordre d'ajout). */
async function limiter(cache, max) {
  const cles = await cache.keys();
  for (const cle of cles.slice(0, Math.max(0, cles.length - max))) await cache.delete(cle);
}

/** Google Fonts : la copie tout de suite, la version du réseau pour la prochaine fois. */
async function staleWhileRevalidate(event, nomCache) {
  const { request } = event;
  const cache = await caches.open(nomCache);
  const enCache = await cache.match(request);
  const reseau = fetch(request).then((r) => {
    if (r.ok || r.type === 'opaque') {
      const copie = r.clone();
      cache.put(request, copie).catch(() => {});
    }
    return r;
  });
  if (enCache) {
    event.waitUntil(reseau.catch(() => {}));
    return enCache;
  }
  // Hors-ligne sans copie : une feuille vide plutôt qu'une erreur (les kanji passent en police système).
  return reseau.catch(() =>
    new URL(request.url).hostname === 'fonts.googleapis.com'
      ? new Response('', { headers: { 'Content-Type': 'text/css; charset=utf-8' } })
      : Response.error(),
  );
}
