import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _viderCache, ecrireSecrets, ETAT_INITIAL, lire, modifier, normaliser, type Etat } from '../src/lib/store.ts';
import {
  analyserSauvegarde,
  CLE_SYNC,
  contenuGist,
  DELAI_AUTO_MS,
  demarrerSynchroAuto,
  DESCRIPTION,
  ErreurSync,
  EVENEMENT_SYNC,
  lancerSync,
  lireMetaSync,
  memeContenu,
  NOM_FICHIER,
  synchroAutoDue,
  syncEnCours,
  testerJetonGitHub,
  type InfoSync,
  type MetaSync,
} from '../src/lib/sync.ts';

const JETON = 'github_pat_11ABCDEFG0123456789_secretdetest';
const CLE_IA = 'sk-ant-api03-cle-de-test-tres-secrete';

// ─── Faux navigateur (window + localStorage) ─────────────────────────────────

function installerNavigateur() {
  const donnees = new Map<string, string>();
  const localStorage = {
    getItem: (k: string) => donnees.get(k) ?? null,
    setItem: (k: string, v: string) => void donnees.set(k, String(v)),
    removeItem: (k: string) => void donnees.delete(k),
    clear: () => donnees.clear(),
    key: (i: number) => [...donnees.keys()][i] ?? null,
    get length() {
      return donnees.size;
    },
  };
  vi.stubGlobal('window', Object.assign(new EventTarget(), { localStorage }));
  return donnees;
}

// ─── Faux GitHub (API Gists en mémoire) ──────────────────────────────────────

interface GistMemoire {
  id: string;
  description: string;
  public: boolean;
  updated_at: string;
  html_url: string;
  files: Record<string, { content: string }>;
}

interface Appel {
  methode: string;
  url: string;
  corps: string | undefined;
  auth: string | null;
}

function json(status: number, corps: unknown, entetes: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(corps), { status, headers: { 'content-type': 'application/json', ...entetes } });
}

function fauxGitHub(options: { portees?: string | null; pousser?: boolean } = {}) {
  const gists = new Map<string, GistMemoire>();
  const appels: Appel[] = [];
  let n = 0;
  let horloge = Date.parse('2026-10-01T10:00:00Z');
  const maintenant = () => new Date((horloge += 1000)).toISOString();

  const faux = (async (entree: RequestInfo | URL, init: RequestInit = {}) => {
    const url = String(entree);
    const methode = init.method ?? 'GET';
    const corps = typeof init.body === 'string' ? init.body : undefined;
    const auth = new Headers(init.headers).get('authorization');
    appels.push({ methode, url, corps, auth });

    const u = new URL(url);
    if (u.host === 'gist.githubusercontent.com') {
      const g = gists.get(u.pathname.split('/')[2] ?? '');
      return g ? new Response(g.files[NOM_FICHIER]?.content ?? '', { status: 200 }) : new Response('', { status: 404 });
    }
    if (auth !== `Bearer ${JETON}`) return json(401, { message: 'Bad credentials' });

    const p = u.pathname;
    if (p === '/user') {
      return json(200, { login: 'drakurei' }, options.portees === undefined || options.portees === null ? {} : { 'x-oauth-scopes': options.portees });
    }
    if (p === '/repos/drakurei/Cours-Dev-Code') {
      return json(200, { full_name: 'drakurei/Cours-Dev-Code', permissions: { push: options.pousser ?? true, pull: true } });
    }
    if (p === '/gists' && methode === 'GET') {
      return json(200, [...gists.values()].map((g) => ({ ...g, files: Object.fromEntries(Object.keys(g.files).map((k) => [k, { filename: k }])) })));
    }
    if (p === '/gists' && methode === 'POST') {
      const b = JSON.parse(corps ?? '{}') as { description: string; public: boolean; files: Record<string, { content: string }> };
      const id = `g${++n}`;
      const g: GistMemoire = { id, description: b.description, public: b.public, updated_at: maintenant(), html_url: `https://gist.github.com/${id}`, files: b.files };
      gists.set(id, g);
      return json(201, g);
    }
    const m = /^\/gists\/([^/]+)$/.exec(p);
    if (m) {
      const g = gists.get(decodeURIComponent(m[1] ?? ''));
      if (!g) return json(404, { message: 'Not Found' });
      if (methode === 'GET') return json(200, g);
      if (methode === 'PATCH') {
        const b = JSON.parse(corps ?? '{}') as { description?: string; files: Record<string, { content: string }> };
        Object.assign(g.files, b.files);
        if (b.description) g.description = b.description;
        g.updated_at = maintenant();
        return json(200, g);
      }
    }
    return json(404, { message: 'Not Found' });
  }) as typeof globalThis.fetch;

  /** Ajoute un Gist déjà présent sur le compte (créé par un autre appareil). */
  const ajouter = (etat: Etat, id = 'distant', fichiers: Record<string, { content: string }> = {}) => {
    const g: GistMemoire = {
      id,
      description: DESCRIPTION,
      public: false,
      updated_at: maintenant(),
      html_url: `https://gist.github.com/${id}`,
      files: { ...fichiers, [NOM_FICHIER]: { content: JSON.stringify(etat) } },
    };
    gists.set(id, g);
    return g;
  };

  const ecritures = () => appels.filter((a) => a.methode !== 'GET');
  return { fetch: faux, gists, appels, ajouter, ecritures };
}

/** Un état avec une progression donnée (date de mise à jour fixée). */
function etatAvec(maj: string, sections: Record<string, string[]>, petales = 0): Etat {
  const e = normaliser(structuredClone(ETAT_INITIAL));
  e.maj = maj;
  for (const [id, vues] of Object.entries(sections)) {
    e.progression[id] = { sectionsVues: vues, termine: false, derniereVisite: maj };
  }
  e.stats.petales = petales;
  return e;
}

function contenuDistant(g: { files: Record<string, { content: string }> }): Etat {
  return analyserSauvegarde(g.files[NOM_FICHIER]?.content ?? '');
}

beforeEach(() => {
  installerNavigateur();
  _viderCache();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  _viderCache();
});

// ─── Contenu envoyé : jamais de secret ───────────────────────────────────────

describe('contenuGist', () => {
  it('n’envoie que l’état normalisé, sans voix ni gistId', () => {
    const e = etatAvec('2026-10-01T10:00:00.000Z', { 'react/01-a': ['x'] });
    e.prefs.voix = 'Microsoft Denise';
    e.prefs.gistId = 'abc';
    // Un champ inconnu (ex. un secret ajouté par erreur) est jeté.
    (e as unknown as Record<string, unknown>).secrets = { githubToken: JETON };
    const texte = contenuGist(e, { githubToken: JETON, anthropicKey: CLE_IA });
    const relu = JSON.parse(texte) as Record<string, unknown> & { prefs: Etat['prefs'] };
    expect(texte).not.toContain(JETON);
    expect(relu.secrets).toBeUndefined();
    expect(relu.prefs.voix).toBeNull();
    expect(relu.prefs.gistId).toBeNull();
    expect(Object.keys(relu).sort()).toEqual(['exercices', 'maj', 'prefs', 'progression', 'quiz', 'srs', 'stats', 'version']);
  });

  it('refuse d’envoyer si un secret s’est glissé dans un champ texte', () => {
    const e = etatAvec('2026-10-01T10:00:00.000Z', {});
    e.prefs.modeleIA = CLE_IA;
    expect(() => contenuGist(e, { anthropicKey: CLE_IA })).toThrow(ErreurSync);
    try {
      contenuGist(e, { anthropicKey: CLE_IA });
    } catch (err) {
      expect((err as ErreurSync).code).toBe('secret');
    }
  });
});

describe('analyserSauvegarde / memeContenu', () => {
  it('rejette un JSON abîmé ou étranger avec un message clair', () => {
    expect(() => analyserSauvegarde('{pas du json')).toThrow(/abîmée/);
    expect(() => analyserSauvegarde('{"bonjour": 1}')).toThrow(/sauvegarde Manabi/);
  });

  it('ignore la date, l’ordre des entrées et les préférences de l’appareil', () => {
    const a = etatAvec('2026-10-01T10:00:00.000Z', { 'a/01-x': ['s1', 's2'], 'b/01-y': [] });
    const b = etatAvec('2026-10-01T10:00:00.000Z', { 'b/01-y': [], 'a/01-x': ['s2', 's1'] });
    b.maj = '2026-10-02T10:00:00.000Z';
    b.prefs.voix = 'Thomas';
    b.prefs.gistId = 'zzz';
    expect(memeContenu(a, b)).toBe(true);
    b.stats.petales = 3;
    expect(memeContenu(a, b)).toBe(false);
  });
});

// ─── Création / mise à jour du Gist ──────────────────────────────────────────

describe('lancerSync', () => {
  it('sans jeton : erreur claire, aucune requête', async () => {
    const gh = fauxGitHub();
    await expect(lancerSync('synchroniser', { fetch: gh.fetch })).rejects.toMatchObject({ code: 'sans-jeton' });
    expect(gh.appels).toHaveLength(0);
    expect(lireMetaSync().erreur).toMatch(/jeton GitHub/);
  });

  it('1re synchro : crée un Gist SECRET, retient son id et l’heure', async () => {
    const gh = fauxGitHub();
    ecrireSecrets({ githubToken: JETON });
    modifier((b) => {
      b.stats.petales = 12;
    });

    const r = await lancerSync('synchroniser', { fetch: gh.fetch });

    expect(r).toMatchObject({ mode: 'synchroniser', cree: true, envoye: true, recu: false });
    const creation = gh.appels.find((a) => a.methode === 'POST');
    expect(creation?.url).toBe('https://api.github.com/gists');
    const corps = JSON.parse(creation?.corps ?? '{}') as { public: boolean; description: string; files: Record<string, unknown> };
    expect(corps.public).toBe(false);
    expect(corps.description).toBe(DESCRIPTION);
    expect(Object.keys(corps.files)).toEqual([NOM_FICHIER]);

    expect(lire().prefs.gistId).toBe(r.gistId);
    const g = gh.gists.get(r.gistId);
    expect(g && contenuDistant(g).stats.petales).toBe(12);
    const meta = lireMetaSync();
    expect(meta.derniere).not.toBeNull();
    expect(meta.erreur).toBeNull();
    expect(meta.url).toBe(`https://gist.github.com/${r.gistId}`);
  });

  it('rien de neuf : aucune écriture (pas de révision inutile)', async () => {
    const gh = fauxGitHub();
    ecrireSecrets({ githubToken: JETON });
    await lancerSync('synchroniser', { fetch: gh.fetch });
    const avant = gh.ecritures().length;

    const r = await lancerSync('synchroniser', { fetch: gh.fetch });

    expect(r).toMatchObject({ envoye: false, recu: false, cree: false });
    expect(gh.ecritures()).toHaveLength(avant);
  });

  it('fusionne la progression d’un autre appareil, puis envoie le résultat', async () => {
    const gh = fauxGitHub();
    ecrireSecrets({ githubToken: JETON });
    gh.ajouter(etatAvec('2026-10-01T09:00:00.000Z', { 'react/01-jsx': ['a', 'b'] }, 30));
    modifier((b) => {
      b.progression['js/01-variables'] = { sectionsVues: ['let'], termine: false, derniereVisite: new Date().toISOString() };
      b.stats.petales = 5;
    });

    const r = await lancerSync('synchroniser', { fetch: gh.fetch });

    expect(r).toMatchObject({ gistId: 'distant', recu: true, envoye: true, cree: false });
    // Local : les deux progressions.
    const local = lire();
    expect(Object.keys(local.progression).sort()).toEqual(['js/01-variables', 'react/01-jsx']);
    expect(local.stats.petales).toBe(30);
    expect(local.prefs.gistId).toBe('distant');
    // En ligne : pareil (PATCH, pas de 2e Gist).
    expect(gh.gists.size).toBe(1);
    const enLigne = contenuDistant(gh.gists.get('distant')!);
    expect(Object.keys(enLigne.progression).sort()).toEqual(['js/01-variables', 'react/01-jsx']);
    expect(gh.appels.some((a) => a.methode === 'PATCH' && a.url.endsWith('/gists/distant'))).toBe(true);
  });

  it('envoyer : gistId oublié (404) → retrouve le Gist du compte au lieu d’en créer un 2e', async () => {
    const gh = fauxGitHub();
    ecrireSecrets({ githubToken: JETON });
    gh.ajouter(etatAvec('2026-10-01T09:00:00.000Z', {}), 'existant', { 'autre.txt': { content: 'x' } });
    modifier((b) => {
      b.prefs.gistId = 'supprime';
      b.stats.petales = 7;
    });

    const r = await lancerSync('envoyer', { fetch: gh.fetch });

    expect(r).toMatchObject({ gistId: 'existant', cree: false, envoye: true });
    expect(gh.gists.size).toBe(1);
    expect(gh.appels.some((a) => a.methode === 'POST')).toBe(false);
    expect(contenuDistant(gh.gists.get('existant')!).stats.petales).toBe(7);
    expect(lire().prefs.gistId).toBe('existant');
  });

  it('récupérer : remplace la progression locale mais garde la voix et le Gist de l’appareil', async () => {
    const gh = fauxGitHub();
    ecrireSecrets({ githubToken: JETON });
    const distant = etatAvec('2026-10-01T09:00:00.000Z', { 'react/02-props': ['p'] }, 99);
    distant.prefs.theme = 'sombre';
    distant.prefs.voix = 'Voix d’un autre appareil';
    gh.ajouter(distant);
    modifier((b) => {
      b.progression['js/01-x'] = { sectionsVues: [], termine: false, derniereVisite: new Date().toISOString() };
      b.prefs.voix = 'Ma voix';
    });

    const r = await lancerSync('recuperer', { fetch: gh.fetch });

    expect(r).toMatchObject({ recu: true, envoye: false });
    const local = lire();
    expect(Object.keys(local.progression)).toEqual(['react/02-props']);
    expect(local.stats.petales).toBe(99);
    expect(local.prefs.theme).toBe('sombre');
    expect(local.prefs.voix).toBe('Ma voix');
    expect(local.prefs.gistId).toBe('distant');
    expect(gh.ecritures()).toHaveLength(0);
  });

  it('récupérer sans sauvegarde en ligne : message qui dit quoi faire', async () => {
    const gh = fauxGitHub();
    ecrireSecrets({ githubToken: JETON });
    await expect(lancerSync('recuperer', { fetch: gh.fetch })).rejects.toThrow(/Envoyer/);
  });

  it('lit la version brute quand l’API tronque le fichier (sans envoyer le jeton)', async () => {
    const gh = fauxGitHub();
    ecrireSecrets({ githubToken: JETON });
    const g = gh.ajouter(etatAvec('2026-10-01T09:00:00.000Z', { 'react/03-x': ['a'] }, 4), 'gros');
    const fetchTronque = (async (entree: RequestInfo | URL, init?: RequestInit) => {
      const rep = await gh.fetch(entree, init);
      if (String(entree) === 'https://api.github.com/gists/gros' && (init?.method ?? 'GET') === 'GET') {
        return json(200, { ...g, files: { [NOM_FICHIER]: { content: '{', truncated: true, raw_url: 'https://gist.githubusercontent.com/drakurei/gros/raw/manabi-progression.json' } } });
      }
      return rep;
    }) as typeof fetch;

    await lancerSync('recuperer', { fetch: fetchTronque });

    expect(lire().stats.petales).toBe(4);
    const brut = gh.appels.find((a) => a.url.startsWith('https://gist.githubusercontent.com/'));
    expect(brut?.auth).toBeNull();
  });

  it('les secrets ne partent jamais : ni dans les corps, ni vers un autre hôte', async () => {
    const gh = fauxGitHub();
    ecrireSecrets({ githubToken: JETON, anthropicKey: CLE_IA });
    gh.ajouter(etatAvec('2026-10-01T09:00:00.000Z', { 'react/01-jsx': ['a'] }));
    modifier((b) => {
      b.stats.petales = 3;
    });

    await lancerSync('synchroniser', { fetch: gh.fetch });
    await lancerSync('envoyer', { fetch: gh.fetch });

    expect(gh.appels.length).toBeGreaterThan(2);
    for (const a of gh.appels) {
      expect(a.corps ?? '').not.toContain(JETON);
      expect(a.corps ?? '').not.toContain(CLE_IA);
      expect(a.url).not.toContain(JETON);
      if (a.auth) expect(a.url.startsWith('https://api.github.com/')).toBe(true);
    }
    for (const g of gh.gists.values()) {
      const texte = JSON.stringify(g);
      expect(texte).not.toContain(JETON);
      expect(texte).not.toContain(CLE_IA);
    }
  });

  it('traduit les erreurs HTTP et réseau en français', async () => {
    ecrireSecrets({ githubToken: JETON });
    const repondre = (rep: () => Response | Promise<Response>) => (async () => rep()) as unknown as typeof fetch;

    await expect(lancerSync('synchroniser', { fetch: repondre(() => json(401, { message: 'Bad credentials' })) })).rejects.toMatchObject({
      code: 'jeton-refuse',
      message: expect.stringMatching(/faux ou expiré/),
    });
    await expect(
      lancerSync('synchroniser', {
        fetch: repondre(() => json(403, { message: 'API rate limit exceeded' }, { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(Math.ceil(Date.now() / 1000) + 300) })),
      }),
    ).rejects.toMatchObject({ code: 'limite', message: expect.stringMatching(/5 min/) });
    await expect(lancerSync('envoyer', { fetch: repondre(() => json(403, { message: 'Resource not accessible by personal access token' })) })).rejects.toMatchObject({
      code: 'droits',
    });
    await expect(lancerSync('synchroniser', { fetch: repondre(() => Promise.reject(new TypeError('Failed to fetch'))) })).rejects.toMatchObject({
      code: 'reseau',
      message: expect.stringMatching(/connexion/),
    });
    await expect(lancerSync('synchroniser', { fetch: repondre(() => json(502, {})) })).rejects.toMatchObject({ code: 'serveur' });
    expect(lireMetaSync().erreur).toMatch(/502/);
  });

  it('les derniers événements « manabi:sync » voient la synchro terminée', async () => {
    const gh = fauxGitHub();
    ecrireSecrets({ githubToken: JETON });
    const vus: { etat: string; enCours: string | null }[] = [];
    window.addEventListener(EVENEMENT_SYNC, (ev) => vus.push({ etat: (ev as CustomEvent<InfoSync>).detail.etat, enCours: syncEnCours() }));

    await lancerSync('synchroniser', { fetch: gh.fetch });

    expect(vus[0]).toEqual({ etat: 'en-cours', enCours: 'synchroniser' });
    expect(vus.at(-1)).toEqual({ etat: 'ok', enCours: null });
    expect(syncEnCours()).toBeNull();
  });

  it('une seule synchro à la fois : la 2e attend la 1re', async () => {
    const gh = fauxGitHub();
    ecrireSecrets({ githubToken: JETON });
    const [a, b] = await Promise.all([lancerSync('synchroniser', { fetch: gh.fetch }), lancerSync('synchroniser', { fetch: gh.fetch })]);
    expect(a.cree).toBe(true);
    expect(b.cree).toBe(false);
    expect(gh.gists.size).toBe(1);
  });
});

// ─── Tester le jeton ─────────────────────────────────────────────────────────

describe('testerJetonGitHub', () => {
  it('jeton classique avec repo et gist : tout est vert', async () => {
    const gh = fauxGitHub({ portees: 'repo, gist' });
    const r = await testerJetonGitHub(JETON, { fetch: gh.fetch });
    expect(r.login).toBe('drakurei');
    expect(r.verifications.map((v) => v.etat)).toEqual(['ok', 'ok', 'ok']);
    expect(gh.appels.map((a) => new URL(a.url).pathname)).toEqual(['/user', '/repos/drakurei/Cours-Dev-Code']);
  });

  it('jeton classique sans « gist » : le dit clairement', async () => {
    const gh = fauxGitHub({ portees: 'public_repo' });
    const r = await testerJetonGitHub(JETON, { fetch: gh.fetch });
    expect(r.verifications[2]).toMatchObject({ etat: 'erreur', detail: expect.stringMatching(/gist/) });
  });

  it('jeton fine-grained : droits Gists vérifiés à la 1re synchro', async () => {
    const gh = fauxGitHub({ portees: null });
    const r = await testerJetonGitHub(JETON, { fetch: gh.fetch });
    expect(r.verifications.map((v) => v.etat)).toEqual(['ok', 'ok', 'info']);
  });

  it('jeton refusé : une seule ligne, sans autre requête', async () => {
    const gh = fauxGitHub();
    const r = await testerJetonGitHub('mauvais-jeton', { fetch: gh.fetch });
    expect(r.login).toBeNull();
    expect(r.verifications).toEqual([expect.objectContaining({ etat: 'erreur', titre: 'Jeton refusé' })]);
    expect(gh.appels).toHaveLength(1);
  });

  it('compte sans droit d’écriture sur le repo', async () => {
    const gh = fauxGitHub({ portees: 'repo, gist', pousser: false });
    const r = await testerJetonGitHub(JETON, { fetch: gh.fetch });
    expect(r.verifications[1]).toMatchObject({ etat: 'erreur', detail: expect.stringMatching(/Lecture seule/) });
  });
});

// ─── Synchro automatique ─────────────────────────────────────────────────────

describe('synchro automatique', () => {
  const meta = (m: Partial<MetaSync> = {}): MetaSync => ({ auto: true, derniere: null, tentative: null, erreur: null, url: null, ...m });
  const t0 = Date.parse('2026-10-08T12:00:00.000Z');

  it('désactivée : jamais', () => {
    expect(synchroAutoDue(meta({ auto: false }), 'chargement', '', t0)).toBe(false);
  });

  it('au plus toutes les 2 minutes (tentatives comprises)', () => {
    const recente = new Date(t0 - DELAI_AUTO_MS + 1000).toISOString();
    const ancienne = new Date(t0 - DELAI_AUTO_MS - 1000).toISOString();
    expect(synchroAutoDue(meta({ tentative: recente }), 'chargement', '', t0)).toBe(false);
    expect(synchroAutoDue(meta({ tentative: ancienne }), 'chargement', '', t0)).toBe(true);
  });

  it('onglet caché : seulement s’il y a du nouveau depuis la dernière synchro', () => {
    const derniere = '2026-10-08T11:00:00.000Z';
    expect(synchroAutoDue(meta({ derniere }), 'cache', '2026-10-08T10:59:00.000Z', t0)).toBe(false);
    expect(synchroAutoDue(meta({ derniere }), 'cache', '2026-10-08T11:30:00.000Z', t0)).toBe(true);
  });

  it('démarre une synchro au chargement puis quand l’onglet se cache', async () => {
    const gh = fauxGitHub();
    vi.stubGlobal('fetch', gh.fetch);
    const doc = Object.assign(new EventTarget(), { visibilityState: 'visible' as DocumentVisibilityState });
    vi.stubGlobal('document', doc);
    ecrireSecrets({ githubToken: JETON });
    window.localStorage.setItem(CLE_SYNC, JSON.stringify({ auto: true }));

    const arreter = demarrerSynchroAuto();
    await vi.waitFor(() => expect(lireMetaSync().derniere).not.toBeNull());
    expect(gh.gists.size).toBe(1);
    // 2e appel : sans effet (déjà démarrée).
    expect(demarrerSynchroAuto()).toBeTypeOf('function');

    // Onglet caché trop tôt : rien (2 min pas écoulées).
    const avant = gh.appels.length;
    modifier((b) => {
      b.stats.petales = 1;
    });
    doc.visibilityState = 'hidden';
    doc.dispatchEvent(new Event('visibilitychange'));
    await new Promise((r) => setTimeout(r, 10));
    expect(gh.appels.length).toBe(avant);

    // Après 2 min : la synchro part et envoie la nouveauté.
    window.localStorage.setItem(CLE_SYNC, JSON.stringify({ ...lireMetaSync(), tentative: new Date(Date.now() - DELAI_AUTO_MS - 1).toISOString() }));
    doc.dispatchEvent(new Event('visibilitychange'));
    await vi.waitFor(() => expect(contenuDistant([...gh.gists.values()][0]!).stats.petales).toBe(1));
    arreter();
  });
});
