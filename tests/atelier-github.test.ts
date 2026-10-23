import { describe, expect, it } from 'vitest';
import {
  choisirFichiersCles,
  encoderChemin,
  ErreurGitHub,
  lireRepoPublic,
  lireSlugRepo,
  publierCours,
  texteDuRepo,
  type EntreePublication,
} from '../src/lib/atelier/github.ts';
import { base64VersTexte } from '../src/lib/atelier/base64.ts';

interface Appel {
  url: string;
  methode: string;
  entetes: Record<string, string>;
  corps: Record<string, unknown> | null;
}

/** fetch simulé : une table « MÉTHODE chemin » → réponse. Garde chaque appel. */
function simuler(routes: Record<string, (a: Appel) => { statut: number; json?: unknown; texte?: string; entetes?: Record<string, string> }>) {
  const appels: Appel[] = [];
  const f = (async (entree: RequestInfo | URL, init?: RequestInit) => {
    const url = String(entree);
    const methode = init?.method ?? 'GET';
    const entetes = (init?.headers ?? {}) as Record<string, string>;
    const appel: Appel = { url, methode, entetes, corps: typeof init?.body === 'string' ? (JSON.parse(init.body) as Record<string, unknown>) : null };
    appels.push(appel);
    const chemin = url.replace('https://api.github.com', '');
    const route = routes[`${methode} ${chemin}`] ?? routes[`${methode} ${chemin.split('?')[0]}`];
    const r = route ? route(appel) : { statut: 404, json: { message: 'Not Found' } };
    const corps = r.texte ?? (r.json === undefined ? '' : JSON.stringify(r.json));
    return new Response(corps, { status: r.statut, headers: r.entetes ?? {} });
  }) as typeof fetch;
  return { fetch: f, appels };
}

const COURS = ['---', '# fichier : 01-useeffect.md', 'titre: "useEffect"', 'matiere: react', 'chapitre: 6', 'essentiel: "Un effet."', '---', '', '## A', ''].join('\n');

const entree = (over: Partial<EntreePublication> = {}): EntreePublication => ({
  texte: COURS,
  matiere: 'react',
  titre: 'useEffect',
  chapitre: 6,
  nomConseille: '01-useeffect.md',
  ordreMatiere: 8,
  joints: [],
  fichiersExistants: [],
  ...over,
});

const D = '/repos/drakurei/Cours-Dev-Code';

describe('lireSlugRepo', () => {
  it('accepte owner/repo et les liens GitHub', () => {
    expect(lireSlugRepo('drakurei/tp-react-blog')).toEqual({ proprietaire: 'drakurei', nom: 'tp-react-blog' });
    expect(lireSlugRepo('https://github.com/drakurei/tp-react-blog.git')).toEqual({ proprietaire: 'drakurei', nom: 'tp-react-blog' });
    expect(lireSlugRepo('github.com/drakurei/PokeBistro/tree/main/src')).toEqual({ proprietaire: 'drakurei', nom: 'PokeBistro' });
    expect(lireSlugRepo('git@github.com:drakurei/x.git')).toEqual({ proprietaire: 'drakurei', nom: 'x' });
    expect(lireSlugRepo('pas un repo')).toBeNull();
    expect(lireSlugRepo('https://gitlab.com/a/b')).toBeNull();
  });
  it('encode chaque segment d’un chemin', () => {
    expect(encoderChemin('public/media/react/07 slides é.pdf')).toBe('public/media/react/07%20slides%20%C3%A9.pdf');
  });
});

describe('publierCours (fetch simulé)', () => {
  it('liste le dossier, prend le chapitre libre, écrit le cours en base64 UTF-8', async () => {
    const { fetch, appels } = simuler({
      [`GET ${D}/contents/src/content/cours/react`]: () => ({ statut: 200, json: [{ name: '01-intro.md', type: 'file' }, { name: '05-listes.md', type: 'file' }] }),
      [`GET ${D}/contents/src/content/matieres/react.yaml`]: () => ({ statut: 200, json: {} }),
      [`PUT ${D}/contents/src/content/cours/react/06-useeffect.md`]: () => ({ statut: 201, json: { content: { html_url: 'https://github.com/x' } } }),
    });
    const r = await publierCours(entree(), { jeton: 'ghp_SECRET', fetch });
    expect(r.nomFichier).toBe('06-useeffect.md');
    expect(r.chemin).toBe('src/content/cours/react/06-useeffect.md');
    expect(r.urlFichier).toBe('https://github.com/x');
    expect(r.matiereCreee).toBe(false);

    const put = appels.find((a) => a.methode === 'PUT');
    expect(put?.corps?.branch).toBe('main');
    expect(put?.corps?.message).toBe('Atelier : ajoute le cours react « useEffect »');
    expect(base64VersTexte(String(put?.corps?.content))).toContain('# fichier : 06-useeffect.md');
    // Le jeton : seulement dans l'en-tête Authorization, vers api.github.com, jamais dans l'URL.
    for (const a of appels) {
      expect(a.url.startsWith('https://api.github.com/')).toBe(true);
      expect(a.url).not.toContain('SECRET');
      expect(a.entetes.Authorization).toBe('Bearer ghp_SECRET');
    }
  });

  it('nouvelle matière : crée le YAML, envoie les fichiers joints, puis le cours', async () => {
    const { fetch, appels } = simuler({
      [`GET ${D}/contents/src/content/cours/docker`]: () => ({ statut: 404, json: { message: 'Not Found' } }),
      [`GET ${D}`]: () => ({ statut: 200, json: { default_branch: 'main' } }),
      [`GET ${D}/contents/public/media/docker`]: () => ({ statut: 404 }),
      [`PUT ${D}/contents/src/content/matieres/docker.yaml`]: () => ({ statut: 201, json: {} }),
      [`PUT ${D}/contents/public/media/docker/01-slides.pdf`]: () => ({ statut: 201, json: {} }),
      [`PUT ${D}/contents/src/content/cours/docker/01-docker.md`]: () => ({ statut: 201, json: {} }),
    });
    const r = await publierCours(
      entree({
        matiere: 'docker',
        titre: 'Docker',
        chapitre: undefined,
        nomConseille: '01-docker.md',
        nouvelleMatiere: { nom: 'Docker', kanji: '箱', couleur: 'sora' },
        joints: [{ nom: 'Slides.pdf', base64: 'JVBERi0=' }],
      }),
      { jeton: 't', fetch },
    );
    expect(r.matiereCreee).toBe(true);
    expect(r.medias).toEqual([{ titre: 'Slides (PDF)', chemin: '/media/docker/01-slides.pdf' }]);
    const puts = appels.filter((a) => a.methode === 'PUT').map((a) => a.url.split('/contents/')[1]);
    expect(puts).toEqual(['src/content/matieres/docker.yaml', 'public/media/docker/01-slides.pdf', 'src/content/cours/docker/01-docker.md']);
    const matiere = base64VersTexte(String(appels.find((a) => a.url.endsWith('docker.yaml') && a.methode === 'PUT')?.corps?.content));
    expect(matiere).toContain('kanji: "箱"');
    expect(matiere).toContain('ordre: 8');
    const cours = base64VersTexte(String(appels.at(-1)?.corps?.content));
    expect(cours).toContain('chemin: "/media/docker/01-slides.pdf"');
  });

  it('422 (le fichier existe déjà) : relit le dossier et prend le numéro suivant', async () => {
    let listes = 0;
    const { fetch } = simuler({
      [`GET ${D}/contents/src/content/cours/react`]: () => {
        listes++;
        return { statut: 200, json: listes === 1 ? [] : [{ name: '06-autre.md', type: 'file' }] };
      },
      [`GET ${D}/contents/src/content/matieres/react.yaml`]: () => ({ statut: 200, json: {} }),
      [`PUT ${D}/contents/src/content/cours/react/06-useeffect.md`]: () => ({ statut: 422, json: { message: '"sha" wasn\'t supplied.' } }),
      [`PUT ${D}/contents/src/content/cours/react/07-useeffect.md`]: () => ({ statut: 201, json: {} }),
    });
    const r = await publierCours(entree(), { jeton: 't', fetch });
    expect(r.nomFichier).toBe('07-useeffect.md');
  });

  it('409 (conflit) : réessaie le même fichier', async () => {
    let essais = 0;
    const { fetch } = simuler({
      [`GET ${D}/contents/src/content/cours/react`]: () => ({ statut: 200, json: [] }),
      [`GET ${D}/contents/src/content/matieres/react.yaml`]: () => ({ statut: 200, json: {} }),
      [`PUT ${D}/contents/src/content/cours/react/06-useeffect.md`]: () => (++essais === 1 ? { statut: 409, json: {} } : { statut: 201, json: {} }),
    });
    const r = await publierCours(entree(), { jeton: 't', fetch, delaiConflit: 0 });
    expect(r.nomFichier).toBe('06-useeffect.md');
    expect(essais).toBe(2);
  });

  it.each([
    [401, {}, 'jeton'],
    [403, {}, 'droits'],
    [403, { 'x-ratelimit-remaining': '0' }, 'quota'],
  ] as const)('statut %i → erreur « %s » en français', async (statut, entetes, code) => {
    const { fetch } = simuler({ [`GET ${D}/contents/src/content/cours/react`]: () => ({ statut, json: { message: 'x' }, entetes }) });
    const e = await publierCours(entree(), { jeton: 't', fetch }).catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ErreurGitHub);
    expect((e as ErreurGitHub).code).toBe(code);
    expect((e as ErreurGitHub).message).toMatch(/[éèà]|GitHub/);
  });

  it('404 sur le dépôt : jeton sans accès', async () => {
    const { fetch } = simuler({});
    const e = (await publierCours(entree(), { jeton: 't', fetch }).catch((x: unknown) => x)) as ErreurGitHub;
    expect(e.code).toBe('introuvable');
    expect(e.message).toContain('drakurei/Cours-Dev-Code');
  });

  it('sans jeton : refuse avant tout appel', async () => {
    const { fetch, appels } = simuler({});
    await expect(publierCours(entree(), { jeton: '', fetch })).rejects.toMatchObject({ code: 'jeton' });
    expect(appels).toHaveLength(0);
  });

  it('erreur réseau', async () => {
    const f = (async () => {
      throw new TypeError('Failed to fetch');
    }) as typeof fetch;
    await expect(publierCours(entree(), { jeton: 't', fetch: f })).rejects.toMatchObject({ code: 'reseau' });
  });
});

describe('lireRepoPublic (fetch simulé)', () => {
  const R = '/repos/drakurei/tp-react-blog';
  it('lit README, package.json, arborescence et fichiers clés, sans jeton', async () => {
    const { fetch, appels } = simuler({
      [`GET ${R}`]: () => ({ statut: 200, json: { default_branch: 'main', description: 'Mon blog', html_url: 'https://github.com/drakurei/tp-react-blog', full_name: 'drakurei/tp-react-blog' } }),
      [`GET ${R}/git/trees/main`]: () => ({
        statut: 200,
        json: {
          tree: [
            { path: 'README.md', type: 'blob', size: 20 },
            { path: 'package.json', type: 'blob', size: 30 },
            { path: 'package-lock.json', type: 'blob', size: 9000 },
            { path: 'src', type: 'tree' },
            { path: 'src/main.jsx', type: 'blob', size: 100 },
            { path: 'src/App.jsx', type: 'blob', size: 200 },
            { path: 'node_modules/react/index.js', type: 'blob', size: 10 },
            { path: 'public/logo.png', type: 'blob', size: 5000 },
            { path: 'src/gros.js', type: 'blob', size: 90_000 },
          ],
        },
      }),
      [`GET ${R}/contents/README.md`]: () => ({ statut: 200, texte: '# Mon blog\n```js\nx\n```' }),
      [`GET ${R}/contents/package.json`]: () => ({ statut: 200, texte: '{"name":"blog"}' }),
      [`GET ${R}/contents/src/main.jsx`]: () => ({ statut: 200, texte: 'import App' }),
      [`GET ${R}/contents/src/App.jsx`]: () => ({ statut: 200, texte: 'export default function App() {}' }),
    });
    const r = await lireRepoPublic('https://github.com/drakurei/tp-react-blog', { fetch });
    expect(r.slug).toBe('drakurei/tp-react-blog');
    expect(r.readme?.contenu).toContain('Mon blog');
    expect(r.fichiers.map((f) => f.chemin)).toEqual(['src/main.jsx', 'src/App.jsx']);
    expect(r.arborescence).not.toContain('node_modules/react/index.js');
    expect(r.arborescence).not.toContain('package-lock.json');
    expect(appels.every((a) => !a.entetes.Authorization)).toBe(true);
    const texte = texteDuRepo(r);
    expect(texte).toContain('Repo GitHub : drakurei/tp-react-blog');
    expect(texte).toContain('## src/App.jsx');
    expect(texte).toContain('```jsx\nexport default function App() {}\n```');
  });

  it('repo introuvable : message clair', async () => {
    const { fetch } = simuler({});
    await expect(lireRepoPublic('drakurei/nexiste-pas', { fetch })).rejects.toMatchObject({ code: 'introuvable' });
    await expect(lireRepoPublic('n importe quoi', { fetch })).rejects.toMatchObject({ code: 'invalide' });
  });

  it('choisit au plus 8 fichiers, les points d’entrée d’abord', () => {
    const arbre = Array.from({ length: 20 }, (_, i) => ({ path: `src/components/C${i}.jsx`, type: 'blob', size: 100 }));
    arbre.push({ path: 'src/main.jsx', type: 'blob', size: 50 }, { path: 'tests/a.test.js', type: 'blob', size: 50 });
    const cles = choisirFichiersCles(arbre);
    expect(cles).toHaveLength(8);
    expect(cles[0]).toBe('src/main.jsx');
    expect(cles).not.toContain('tests/a.test.js');
  });
});
