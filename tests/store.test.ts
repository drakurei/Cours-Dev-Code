import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  _viderCache,
  abonner,
  CLE,
  CLE_SECRETS,
  compterActivite,
  ecrireSecrets,
  ETAT_INITIAL,
  exporter,
  fusionner,
  gagnerPetales,
  importer,
  lire,
  lireSecrets,
  marquerSectionVue,
  marquerTermine,
  modifier,
  normaliser,
  serieDuJour,
  type Etat,
} from '../src/lib/store.ts';

/** Faux navigateur minimal : window (EventTarget) + localStorage en mémoire. */
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
  const fenetre = Object.assign(new EventTarget(), { localStorage });
  vi.stubGlobal('window', fenetre);
  return donnees;
}

const etat = (partiel: Partial<Etat> & { stats?: Partial<Etat['stats']> } = {}): Etat =>
  normaliser({ ...structuredClone(ETAT_INITIAL), ...partiel, stats: { ...ETAT_INITIAL.stats, ...partiel.stats } });

describe('rendu serveur', () => {
  it('lire() renvoie ETAT_INITIAL sans window', () => {
    expect(lire()).toBe(ETAT_INITIAL);
  });
});

describe('store dans le navigateur', () => {
  let donnees: Map<string, string>;

  beforeEach(() => {
    donnees = installerNavigateur();
    _viderCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('démarre vide et renvoie un instantané stable', () => {
    const a = lire();
    expect(a.version).toBe(1);
    expect(a.prefs.minuteur).toBe(15);
    expect(lire()).toBe(a);
  });

  it('modifier() sauvegarde, met maj et émet manabi:change', () => {
    const recu: Etat[] = [];
    const stop = abonner((e) => recu.push(e));
    const avant = lire();
    modifier((b) => {
      b.prefs.theme = 'sombre';
    });
    const apres = lire();
    expect(apres).not.toBe(avant);
    expect(apres.prefs.theme).toBe('sombre');
    expect(apres.maj).not.toBe(ETAT_INITIAL.maj);
    expect(JSON.parse(donnees.get(CLE) ?? '{}').prefs.theme).toBe('sombre');
    expect(recu).toHaveLength(1);
    stop();
    modifier((b) => {
      b.prefs.theme = 'clair';
    });
    expect(recu).toHaveLength(1);
  });

  it('survit à un JSON abîmé et à des valeurs hors limites', () => {
    donnees.set(CLE, '{pas du json');
    expect(lire().prefs.theme).toBe('auto');
    _viderCache();
    donnees.set(CLE, JSON.stringify({ version: 1, prefs: { taille: 9, theme: 'rose' } }));
    expect(lire().prefs.taille).toBe(1.4);
    expect(lire().prefs.theme).toBe('auto');
  });

  it('marque une notion vue une seule fois (+1 pétale)', () => {
    expect(marquerSectionVue('react/06-usestate', 'creer-un-etat')).toBe(true);
    expect(marquerSectionVue('react/06-usestate', 'creer-un-etat')).toBe(false);
    expect(lire().progression['react/06-usestate']?.sectionsVues).toEqual(['creer-un-etat']);
    expect(lire().stats.petales).toBe(1);
  });

  it('marque un cours terminé (+10 pétales) et émet manabi:petales', () => {
    const gains: unknown[] = [];
    window.addEventListener('manabi:petales', (e) => gains.push((e as CustomEvent).detail));
    expect(marquerTermine('react/06-usestate')).toBe(true);
    expect(marquerTermine('react/06-usestate')).toBe(false);
    const p = lire().progression['react/06-usestate'];
    expect(p?.termine).toBe(true);
    expect(p?.termineLe).toBeTypeOf('string');
    expect(lire().stats.petales).toBe(10);
    expect(gains).toEqual([{ n: 10, raison: 'cours terminé', total: 10 }]);
  });

  it('exporte sans les secrets et réimporte', () => {
    ecrireSecrets({ githubToken: 'test-jeton' });
    gagnerPetales(5, 'exercice');
    const json = exporter();
    expect(json).not.toContain('test-jeton');
    modifier((b) => {
      b.stats.petales = 0;
    });
    importer(json);
    expect(lire().stats.petales).toBe(5);
    expect(() => importer('{"rien": true}')).toThrow(/sauvegarde Manabi/);
    expect(() => importer('pas du json')).toThrow(/JSON valide/);
  });

  it('écrit et efface les secrets à part', () => {
    ecrireSecrets({ githubToken: ' abc ', anthropicKey: 'cle' });
    expect(lireSecrets()).toEqual({ githubToken: 'abc', anthropicKey: 'cle' });
    expect(donnees.get(CLE)).toBeUndefined();
    ecrireSecrets({ githubToken: null });
    expect(lireSecrets()).toEqual({ anthropicKey: 'cle' });
    ecrireSecrets({ anthropicKey: '' });
    expect(donnees.has(CLE_SECRETS)).toBe(false);
  });

  it('suit les écritures des autres onglets (événement storage)', () => {
    const recu: number[] = [];
    abonner((e) => recu.push(e.stats.petales));
    const autre = structuredClone(ETAT_INITIAL);
    autre.stats.petales = 42;
    const json = JSON.stringify(autre);
    donnees.set(CLE, json);
    const ev = Object.assign(new Event('storage'), { key: CLE, newValue: json });
    window.dispatchEvent(ev);
    expect(recu).toEqual([42]);
    expect(lire().stats.petales).toBe(42);
  });
});

describe('série de jours', () => {
  it('avance, se maintient le même jour et repart à 1 après un trou', () => {
    const e = etat();
    compterActivite(e, '2026-10-01');
    expect(e.stats.serie).toEqual({ actuelle: 1, record: 1, dernierJour: '2026-10-01' });
    compterActivite(e, '2026-10-01');
    expect(e.stats.serie.actuelle).toBe(1);
    expect(e.stats.jours['2026-10-01']).toBe(2);
    compterActivite(e, '2026-10-02');
    compterActivite(e, '2026-10-03');
    expect(e.stats.serie).toEqual({ actuelle: 3, record: 3, dernierJour: '2026-10-03' });
    compterActivite(e, '2026-10-06');
    expect(e.stats.serie).toEqual({ actuelle: 1, record: 3, dernierJour: '2026-10-06' });
  });

  it('passe d’un mois à l’autre', () => {
    const e = etat();
    compterActivite(e, '2026-09-30');
    compterActivite(e, '2026-10-01');
    expect(e.stats.serie.actuelle).toBe(2);
  });

  it('affiche 0 si la série est cassée', () => {
    const e = etat({ stats: { petales: 0, jours: {}, serie: { actuelle: 5, record: 5, dernierJour: '2026-10-01' } } });
    expect(serieDuJour(e, '2026-10-02')).toBe(5);
    expect(serieDuJour(e, '2026-10-03')).toBe(0);
  });
});

describe('fusionner', () => {
  it('garde l’entrée la plus récente, clé par clé', () => {
    const a = etat({
      maj: '2026-10-02T10:00:00.000Z',
      quiz: {
        x: { meilleur: 3, total: 5, tentatives: 2, dernier: '2026-10-02T09:00:00.000Z' },
        y: { meilleur: 1, total: 5, tentatives: 1, dernier: '2026-10-01T09:00:00.000Z' },
      },
    });
    const b = etat({
      maj: '2026-10-01T10:00:00.000Z',
      quiz: { y: { meilleur: 4, total: 5, tentatives: 3, dernier: '2026-10-03T09:00:00.000Z' } },
    });
    const f = fusionner(a, b);
    expect(f.quiz.x?.meilleur).toBe(3);
    expect(f.quiz.y?.meilleur).toBe(4);
    expect(f.maj).toBe('2026-10-02T10:00:00.000Z');
  });

  it('prend le max des pétales et des jours, et unit les notions vues', () => {
    const a = etat({
      stats: { petales: 12, jours: { '2026-10-01': 3 }, serie: { actuelle: 2, record: 4, dernierJour: '2026-10-01' } },
      progression: { c: { sectionsVues: ['a'], termine: false, derniereVisite: '2026-10-01T08:00:00.000Z' } },
    });
    const b = etat({
      stats: { petales: 7, jours: { '2026-10-01': 5, '2026-10-02': 1 }, serie: { actuelle: 3, record: 3, dernierJour: '2026-10-02' } },
      progression: { c: { sectionsVues: ['b'], termine: true, termineLe: '2026-10-02T08:00:00.000Z', derniereVisite: '2026-10-02T08:00:00.000Z' } },
    });
    const f = fusionner(a, b);
    expect(f.stats.petales).toBe(12);
    expect(f.stats.jours).toEqual({ '2026-10-01': 5, '2026-10-02': 1 });
    expect(f.stats.serie).toEqual({ actuelle: 3, record: 4, dernierJour: '2026-10-02' });
    expect(f.progression.c?.sectionsVues.sort()).toEqual(['a', 'b']);
    expect(f.progression.c?.termine).toBe(true);
  });

  it('ne modifie pas ses entrées', () => {
    const a = etat({ stats: { petales: 1, jours: {}, serie: { actuelle: 0, record: 0, dernierJour: '' } } });
    const b = etat();
    const copie = structuredClone(a);
    fusionner(a, b);
    expect(a).toEqual(copie);
  });
});
