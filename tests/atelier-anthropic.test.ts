import { describe, expect, it } from 'vitest';
import {
  BETA_REPLI,
  construireContenu,
  construireRequete,
  ErreurClaude,
  genererAvecClaude,
  lireFlux,
  URL_ANTHROPIC,
  type EtatGeneration,
} from '../src/lib/atelier/anthropic.ts';

/** Flux SSE tel que l'API Messages l'envoie. */
function sse(evenements: Record<string, unknown>[], coupe = false): string {
  const lignes = evenements.map((e) => `event: ${String(e.type)}\ndata: ${JSON.stringify(e)}\n\n`);
  const texte = lignes.join('');
  return coupe ? texte.slice(0, texte.lastIndexOf('event: message_stop')) : texte;
}

const FLUX_OK = [
  { type: 'message_start', message: { model: 'claude-sonnet-5-5', usage: { input_tokens: 10 } } },
  { type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '' } },
  { type: 'content_block_stop', index: 0 },
  { type: 'content_block_start', index: 1, content_block: { type: 'text', text: '' } },
  { type: 'ping' },
  { type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: '````markdown\n---\ntitre: "Été' } },
  { type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: ' 学び"\n---\n````' } },
  { type: 'content_block_stop', index: 1 },
  { type: 'message_delta', delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 20 } },
  { type: 'message_stop' },
];

/** Découpe un texte en morceaux d'octets au hasard (un caractère UTF-8 peut être coupé en deux). */
function fluxDe(texte: string, taille = 7): ReadableStream<Uint8Array> {
  const octets = new TextEncoder().encode(texte);
  let i = 0;
  return new ReadableStream({
    pull(c) {
      if (i >= octets.length) return c.close();
      c.enqueue(octets.slice(i, i + taille));
      i += taille;
    },
  });
}

interface Appel {
  url: string;
  init: RequestInit;
}

function simuler(reponses: (() => Response)[]) {
  const appels: Appel[] = [];
  let n = 0;
  const f = (async (url: RequestInfo | URL, init?: RequestInit) => {
    appels.push({ url: String(url), init: init ?? {} });
    const r = reponses[Math.min(n, reponses.length - 1)];
    n++;
    if (!r) throw new Error('pas de réponse');
    return r();
  }) as typeof fetch;
  return { fetch: f, appels };
}

const ok = () => new Response(fluxDe(sse(FLUX_OK)), { status: 200, headers: { 'content-type': 'text/event-stream' } });
const erreur = (statut: number, type: string, message: string) => () => new Response(JSON.stringify({ type: 'error', error: { type, message } }), { status: statut });

describe('construireRequete', () => {
  it('appel direct navigateur : URL fixe, en-têtes, modèle, streaming, effort, repli', () => {
    const contenu = construireContenu('PROMPT', [
      { nom: 'cours.pdf', type: 'application/pdf', base64: 'JVBE' },
      { nom: 'tableau.jpg', type: 'image/jpeg', base64: '/9j/' },
    ]);
    const { url, entetes, corps } = construireRequete({ cle: ' sk-ant-TEST ', modele: 'claude-sonnet-5-5', contenu });
    expect(url).toBe(URL_ANTHROPIC);
    expect(entetes).toMatchObject({
      'x-api-key': 'sk-ant-TEST',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'anthropic-beta': BETA_REPLI,
      'content-type': 'application/json',
    });
    expect(corps).toMatchObject({ model: 'claude-sonnet-5-5', stream: true, max_tokens: 64000, output_config: { effort: 'medium' }, fallbacks: 'default' });
    expect(contenu.map((b) => b.type)).toEqual(['text', 'document', 'text', 'image', 'text']);
    expect(contenu[1]).toEqual({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: 'JVBE' }, title: 'cours.pdf' });
    expect(contenu[3]).toEqual({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: '/9j/' } });
    expect(contenu.at(-1)).toEqual({ type: 'text', text: 'PROMPT' });
    expect(JSON.stringify(corps)).not.toContain('sk-ant');
  });

  it('modèle sans repli serveur : ni fallbacks ni en-tête bêta', () => {
    const { entetes, corps } = construireRequete({ cle: 'k', modele: 'claude-haiku-5-5', contenu: [] });
    expect(entetes['anthropic-beta']).toBeUndefined();
    expect(corps.fallbacks).toBeUndefined();
    expect(construireRequete({ cle: 'k', contenu: [] }).corps.model).toBe('claude-sonnet-5-5');
  });
});

describe('lireFlux', () => {
  it('reconstitue le texte (UTF-8 coupé entre deux morceaux) et signale les phases', async () => {
    const etats: EtatGeneration['phase'][] = [];
    const morceaux: string[] = [];
    const r = await lireFlux(fluxDe(sse(FLUX_OK), 5), 'm', (m) => morceaux.push(m), (e) => etats.push(e.phase));
    expect(r.texte).toBe('````markdown\n---\ntitre: "Été 学び"\n---\n````');
    expect(r.stopReason).toBe('end_turn');
    expect(r.modele).toBe('claude-sonnet-5-5');
    expect(morceaux).toHaveLength(2);
    expect(etats).toContain('reflexion');
    expect(etats.at(-1)).toBe('ecriture');
  });

  it('flux coupé avant message_stop : erreur, le début est gardé', async () => {
    const e = (await lireFlux(fluxDe(sse(FLUX_OK, true)), 'm').catch((x: unknown) => x)) as ErreurClaude;
    expect(e.code).toBe('interrompu');
    expect(e.partiel).toContain('titre');
  });

  it('événement error dans le flux', async () => {
    const flux = sse([FLUX_OK[0] as Record<string, unknown>, { type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }]);
    await expect(lireFlux(fluxDe(flux), 'm')).rejects.toMatchObject({ code: 'surcharge' });
  });
});

describe('genererAvecClaude (fetch simulé)', () => {
  it('envoie la requête et renvoie le texte', async () => {
    const { fetch, appels } = simuler([ok]);
    const r = await genererAvecClaude({ cle: 'sk-ant-SECRET', contenu: construireContenu('P'), fetch });
    expect(r.texte).toContain('学び');
    expect(appels).toHaveLength(1);
    expect(appels[0]?.url).toBe('https://api.anthropic.com/v1/messages');
    expect(appels[0]?.url).not.toContain('SECRET');
    expect(JSON.parse(String(appels[0]?.init.body)).messages[0].role).toBe('user');
  });

  it.each([
    [401, 'authentication_error', 'invalid x-api-key', 'cle'],
    [429, 'rate_limit_error', 'Number of request tokens has exceeded your per-minute rate limit', 'quota'],
    [400, 'invalid_request_error', 'Your credit balance is too low to access the Anthropic API.', 'credit'],
    [404, 'not_found_error', 'model: claude-x', 'modele'],
    [413, 'request_too_large', 'Request exceeds the maximum size', 'trop-gros'],
  ] as const)('HTTP %i → erreur « %s » en français', async (statut, type, message, code) => {
    const { fetch } = simuler([erreur(statut, type, message)]);
    const e = (await genererAvecClaude({ cle: 'k', contenu: [], fetch }).catch((x: unknown) => x)) as ErreurClaude;
    expect(e).toBeInstanceOf(ErreurClaude);
    expect(e.code).toBe(code);
    expect(e.message).not.toMatch(/invalid x-api-key/);
  });

  it('repli refusé par le compte (400) : nouvel essai sans fallbacks', async () => {
    const { fetch, appels } = simuler([erreur(400, 'invalid_request_error', 'fallbacks: Extra inputs are not permitted'), ok]);
    const r = await genererAvecClaude({ cle: 'k', contenu: [], fetch });
    expect(r.stopReason).toBe('end_turn');
    expect(appels).toHaveLength(2);
    const second = JSON.parse(String(appels[1]?.init.body)) as Record<string, unknown>;
    expect(second.fallbacks).toBeUndefined();
    expect((appels[1]?.init.headers as Record<string, string>)['anthropic-beta']).toBeUndefined();
  });

  it('surcharge (529) : un seul nouvel essai', async () => {
    const { fetch, appels } = simuler([erreur(529, 'overloaded_error', 'Overloaded'), ok]);
    await genererAvecClaude({ cle: 'k', contenu: [], fetch, delaiNouvelEssai: 0 });
    expect(appels).toHaveLength(2);
    const { fetch: f2 } = simuler([erreur(529, 'overloaded_error', 'Overloaded')]);
    await expect(genererAvecClaude({ cle: 'k', contenu: [], fetch: f2, delaiNouvelEssai: 0 })).rejects.toMatchObject({ code: 'surcharge' });
  });

  it('réseau coupé et bouton Arrêter', async () => {
    const reseau = (async () => {
      throw new TypeError('Failed to fetch');
    }) as typeof fetch;
    await expect(genererAvecClaude({ cle: 'k', contenu: [], fetch: reseau })).rejects.toMatchObject({ code: 'reseau' });

    const controle = new AbortController();
    const lent = ((_u: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_ok, ko) => {
        init?.signal?.addEventListener('abort', () => ko(new DOMException('Arrêt', 'AbortError')));
      })) as typeof fetch;
    const attente = genererAvecClaude({ cle: 'k', contenu: [], fetch: lent, signal: controle.signal });
    controle.abort();
    await expect(attente).rejects.toMatchObject({ code: 'arrete' });
  });

  it('refus et réponse coupée (max_tokens)', async () => {
    const refus = () =>
      new Response(
        fluxDe(sse([FLUX_OK[0] as Record<string, unknown>, { type: 'message_delta', delta: { stop_reason: 'refusal', stop_details: { category: 'cyber' } } }, { type: 'message_stop' }])),
        { status: 200 },
      );
    await expect(genererAvecClaude({ cle: 'k', contenu: [], fetch: simuler([refus]).fetch })).rejects.toMatchObject({ code: 'refus' });
    const coupe = () =>
      new Response(
        fluxDe(sse([...FLUX_OK.slice(0, 7), { type: 'message_delta', delta: { stop_reason: 'max_tokens' } }, { type: 'message_stop' }] as Record<string, unknown>[])),
        { status: 200 },
      );
    const e = (await genererAvecClaude({ cle: 'k', contenu: [], fetch: simuler([coupe]).fetch }).catch((x: unknown) => x)) as ErreurClaude;
    expect(e.code).toBe('coupe');
    expect(e.partiel).toContain('titre');
  });
});
