import { describe, expect, it } from 'vitest';
import { ETAT_INITIAL, normaliser } from '../src/lib/store.ts';
import { MODELES, nomModele, testerCleAnthropic, URL_MODELES } from '../src/islands/reglages/anthropic.ts';
import {
  analyserFichier,
  majuscule,
  momentRelatif,
  nomExport,
  nomVoix,
  pourcent,
  resumeEtat,
  vitesse,
} from '../src/islands/reglages/format.ts';

describe('momentRelatif', () => {
  const maintenant = new Date(2026, 9, 8, 14, 32, 0); // 8 oct. 2026, 14:32 (heure locale)
  const il = (ms: number) => new Date(maintenant.getTime() - ms).toISOString();

  it('jamais, à l’instant, il y a N min', () => {
    expect(momentRelatif(null, maintenant)).toBe('jamais');
    expect(momentRelatif('pas une date', maintenant)).toBe('jamais');
    expect(momentRelatif(il(20_000), maintenant)).toBe('à l’instant');
    expect(momentRelatif(il(3 * 60_000 + 5_000), maintenant)).toBe('il y a 3 min');
  });

  it('aujourd’hui, hier, puis la date', () => {
    expect(momentRelatif(new Date(2026, 9, 8, 9, 5).toISOString(), maintenant)).toBe('aujourd’hui à 09:05');
    expect(momentRelatif(new Date(2026, 9, 7, 22, 40).toISOString(), maintenant)).toBe('hier à 22:40');
    expect(momentRelatif(new Date(2026, 8, 30, 8, 0).toISOString(), maintenant)).toBe('le 30 sept. 2026 à 08:00');
  });

  it('majuscule pour une valeur seule', () => {
    expect(majuscule('il y a 3 min')).toBe('Il y a 3 min');
    expect(majuscule('à l’instant')).toBe('À l’instant');
  });
});

describe('formats', () => {
  it('pourcent et vitesse', () => {
    expect(pourcent(1)).toBe('100 %');
    expect(pourcent(1.15)).toBe('115 %');
    expect(vitesse(1)).toBe('1,0×');
    expect(vitesse(1.5)).toBe('1,5×');
  });

  it('nom de voix lisible', () => {
    expect(nomVoix('Microsoft Denise Online (Natural) - French (France)', 'fr-FR')).toBe('Denise (naturelle) · fr-FR');
    expect(nomVoix('Google français', 'fr-FR')).toBe('français · fr-FR');
    expect(nomVoix('Thomas', 'fr-CA')).toBe('Thomas · fr-CA');
  });

  it('nom du fichier exporté', () => {
    expect(nomExport(new Date(2026, 9, 8))).toBe('manabi-sauvegarde-2026-10-08.json');
  });
});

describe('analyserFichier', () => {
  it('refuse un fichier qui n’est pas une sauvegarde', () => {
    expect(analyserFichier('{oups')).toEqual({ ok: false, message: 'Ce fichier n’est pas un JSON valide.' });
    expect(analyserFichier('[1, 2]')).toMatchObject({ ok: false, message: expect.stringMatching(/sauvegarde Manabi/) });
    expect(analyserFichier('{"version": 1}')).toMatchObject({ ok: false });
  });

  it('résume une sauvegarde valide', () => {
    const e = normaliser(structuredClone(ETAT_INITIAL));
    e.maj = new Date(2026, 9, 8, 12).toISOString();
    e.progression['react/01-jsx'] = { sectionsVues: [], termine: false, derniereVisite: e.maj };
    e.stats.petales = 230;
    const r = analyserFichier(JSON.stringify(e));
    expect(r).toMatchObject({ ok: true, resume: 'Sauvegarde du 8 oct. 2026 : 1 cours · 0 carte · 230 pétales.' });
    expect(resumeEtat(e)).toBe('1 cours · 0 carte · 230 pétales');
  });
});

describe('testerCleAnthropic', () => {
  type Appel = { url: string; init: RequestInit | undefined };

  const faux = (status: number, corps: unknown, appels: Appel[] = []) =>
    (async (url: RequestInfo | URL, init?: RequestInit) => {
      appels.push({ url: String(url), init });
      return new Response(JSON.stringify(corps), { status, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;

  it('envoie la clé seulement à api.anthropic.com, avec les bons en-têtes', async () => {
    const appels: Appel[] = [];
    await testerCleAnthropic('  sk-ant-cle  ', 'claude-sonnet-5-5', faux(200, { data: [] }, appels));
    expect(appels).toHaveLength(1);
    const a = appels[0]!;
    expect(a.url.startsWith(`${URL_MODELES}?`)).toBe(true);
    const h = new Headers(a.init?.headers);
    expect(h.get('x-api-key')).toBe('sk-ant-cle');
    expect(h.get('anthropic-version')).toBe('2023-06-01');
    expect(h.get('anthropic-dangerous-direct-browser-access')).toBe('true');
    expect(a.init?.method ?? 'GET').toBe('GET');
    expect(a.init?.body).toBeUndefined();
  });

  it('clé valide : dit si le modèle choisi est disponible', async () => {
    const liste = { data: [{ id: 'claude-sonnet-5-5' }, { id: 'claude-haiku-5-5' }], has_more: false };
    expect(await testerCleAnthropic('k', 'claude-sonnet-5-5', faux(200, liste))).toEqual({ ok: true, message: 'Clé valide. Sonnet 5.5 est disponible.' });
    expect(await testerCleAnthropic('k', 'claude-opus-5-5', faux(200, liste))).toMatchObject({ ok: true, message: expect.stringMatching(/Opus 5\.5 n’apparaît pas/) });
    expect(await testerCleAnthropic('k', 'claude-opus-5-5', faux(200, { ...liste, has_more: true }))).toEqual({ ok: true, message: 'Clé valide.' });
  });

  it('erreurs en français', async () => {
    expect(await testerCleAnthropic('k', 'x', faux(401, {}))).toMatchObject({ ok: false, message: expect.stringMatching(/refusée/) });
    expect(await testerCleAnthropic('k', 'x', faux(429, {}))).toMatchObject({ ok: false, message: expect.stringMatching(/Trop de requêtes/) });
    expect(await testerCleAnthropic('k', 'x', faux(529, {}))).toMatchObject({ ok: false, message: expect.stringMatching(/529/) });
    const horsLigne = (async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;
    expect(await testerCleAnthropic('k', 'x', horsLigne)).toMatchObject({ ok: false, message: expect.stringMatching(/connexion/) });
  });

  it('modèles proposés : Sonnet 5.5 par défaut, puis Opus et Haiku', () => {
    expect(MODELES.map((m) => m.id)).toEqual(['claude-sonnet-5-5', 'claude-opus-5-5', 'claude-haiku-5-5']);
    expect(nomModele('claude-haiku-5-5')).toBe('Haiku 5.5');
    expect(nomModele('autre')).toBe('autre');
  });
});
