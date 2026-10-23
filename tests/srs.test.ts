import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  _reglerFuzz,
  apercuIntervalles,
  cartesDuJour,
  formaterEcheance,
  formaterIntervalle,
  introduiteLe,
  LIBELLES_NOTES,
  minutesEstimees,
  noter,
  nouvellesIntroduites,
  planifier,
  prochaineEcheance,
} from '../src/lib/srs.ts';
import { _viderCache, ETAT_INITIAL, EVENEMENT_PETALES, lire, normaliser, type CarteSRS, type Etat } from '../src/lib/store.ts';

const MIN = 60_000;
const JOUR = 86_400_000;
/** Dates LOCALES : le « jour » de Manabi est le jour local, quel que soit le fuseau de la machine. */
const le = (j: number, h = 10, m = 0) => new Date(2026, 9, j, h, m);

const etatAvec = (srs: Record<string, CarteSRS>, prefs: Partial<Etat['prefs']> = {}): Etat =>
  normaliser({ ...structuredClone(ETAT_INITIAL), srs, prefs: { ...ETAT_INITIAL.prefs, ...prefs } });

/** Carte vue une fois (note Bien) à la date donnée. */
const vue = (coursId: string, quand: Date): CarteSRS => ({ ...planifier(undefined, 3, quand), coursId });

beforeEach(() => _reglerFuzz(false));
afterEach(() => _reglerFuzz(true));

describe('planifier', () => {
  it('carte nouvelle : pas courts puis jours (paramètres FSRS par défaut)', () => {
    const t = le(8);
    const ecart = (n: 1 | 2 | 3 | 4) => Date.parse(planifier(undefined, n, t).due) - t.getTime();
    expect(ecart(1)).toBe(1 * MIN);
    expect(ecart(2)).toBe(6 * MIN);
    expect(ecart(3)).toBe(10 * MIN);
    expect(ecart(4)).toBe(8 * JOUR);
  });

  it('dates en ISO, compteurs et état FSRS à jour', () => {
    const t = le(8);
    const c = planifier(undefined, 3, t);
    expect(c.last_review).toBe(t.toISOString());
    expect(c.due).toBe(new Date(t.getTime() + 10 * MIN).toISOString());
    expect(c).toMatchObject({ coursId: '', reps: 1, lapses: 0, state: 1, elapsed_days: 0 });
    const facile = planifier(undefined, 4, t);
    expect(facile.state).toBe(2);
    expect(facile.scheduled_days).toBe(8);
  });

  it('garde le coursId et compte les jours locaux depuis la révision précédente', () => {
    const premiere = { ...planifier(undefined, 4, le(1)), coursId: 'react/06-usestate' };
    const seconde = planifier(premiere, 3, le(9));
    expect(seconde.coursId).toBe('react/06-usestate');
    expect(seconde.elapsed_days).toBe(8);
    expect(seconde.reps).toBe(2);
    expect(Date.parse(seconde.due)).toBeGreaterThan(le(9).getTime() + 8 * JOUR);
  });

  it('un oubli (Raté en révision) compte un lapse et repasse en réapprentissage', () => {
    const revision = { ...planifier(undefined, 4, le(1)), coursId: 'x' };
    const oubli = planifier(revision, 1, le(9));
    expect(oubli.lapses).toBe(1);
    expect(oubli.state).toBe(3);
  });
});

describe('apercuIntervalles', () => {
  it('carte nouvelle : 1 min, 6 min, 10 min, 8 j', () => {
    expect(apercuIntervalles(undefined, le(8))).toEqual({ 1: '1 min', 2: '6 min', 3: '10 min', 4: '8 j' });
  });

  it("annonce ce que planifier fera vraiment, fuzz compris, dans la même journée", () => {
    _reglerFuzz(true);
    let carte: CarteSRS = { ...planifier(undefined, 4, le(1)), coursId: 'x' };
    carte = { ...planifier(carte, 3, le(9)), coursId: 'x' };
    const t1 = new Date(carte.due);
    const t2 = new Date(t1.getTime() + 45_000);
    const apercu = apercuIntervalles(carte, t1);
    for (const n of [1, 2, 3, 4] as const) {
      expect(formaterIntervalle(Date.parse(planifier(carte, n, t2).due) - t2.getTime())).toBe(apercu[n]);
    }
  });

  it('le fuzz garde un intervalle proche du calcul exact', () => {
    let carte: CarteSRS = { ...planifier(undefined, 4, le(1)), coursId: 'x' };
    carte = { ...planifier(carte, 3, le(9)), coursId: 'x' };
    const exact = planifier(carte, 3, le(30)).scheduled_days;
    _reglerFuzz(true);
    const flou = planifier(carte, 3, le(30)).scheduled_days;
    expect(Math.abs(flou - exact)).toBeLessThanOrEqual(Math.ceil(exact * 0.15) + 1);
  });
});

describe('formatage', () => {
  it('formaterIntervalle', () => {
    expect(formaterIntervalle(20_000)).toBe('1 min');
    expect(formaterIntervalle(59 * MIN)).toBe('59 min');
    expect(formaterIntervalle(90 * MIN)).toBe('2 h');
    expect(formaterIntervalle(25 * 60 * MIN)).toBe('1 j');
    expect(formaterIntervalle(12 * JOUR)).toBe('12 j');
    expect(formaterIntervalle(45 * JOUR)).toBe('2 mois');
    expect(formaterIntervalle(400 * JOUR)).toBe('1,1 an');
    expect(formaterIntervalle(800 * JOUR)).toBe('2,2 ans');
  });

  it('formaterEcheance', () => {
    const t = le(8, 10);
    expect(formaterEcheance(new Date(t.getTime() - MIN), t)).toBe('maintenant');
    expect(formaterEcheance(new Date(t.getTime() + 10 * MIN), t)).toBe('dans 10 min');
    expect(formaterEcheance(le(9, 8).toISOString(), t)).toBe('demain');
    expect(formaterEcheance(le(11, 8), t)).toBe('dans 3 j');
  });

  it('prochaineEcheance : la plus proche dans le futur', () => {
    const t = le(8);
    const etat = etatAvec({
      passee: { ...vue('a', le(1)) },
      loin: { ...planifier(undefined, 4, le(7)), coursId: 'a' },
      proche: { ...vue('a', t) },
    });
    expect(prochaineEcheance(etat, t)).toBe(etat.srs.proche?.due);
    expect(prochaineEcheance(etatAvec({}), t)).toBeNull();
  });

  it('libellés des notes et minutes estimées', () => {
    expect(LIBELLES_NOTES).toEqual({ 1: 'Raté', 2: 'Dur', 3: 'Bien', 4: 'Facile' });
    expect(minutesEstimees(0)).toBe(0);
    expect(minutesEstimees(1)).toBe(1);
    expect(minutesEstimees(12)).toBe(5);
    expect(minutesEstimees(15)).toBe(6);
  });
});

describe('cartesDuJour', () => {
  const toutes = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({ id, coursId: 'cours' }));

  it('dues triées par échéance, futures exclues, nouvelles dans l’ordre de lecture', () => {
    const t = le(8, 12);
    const etat = etatAvec({
      c: { ...vue('cours', le(8, 11, 55)) }, // due à 12 h 05 : pas encore
      d: { ...vue('cours', le(8, 9)) }, // due à 9 h 10
      b: { ...vue('cours', le(8, 8)) }, // due à 8 h 10
    });
    expect(cartesDuJour(etat, toutes, t)).toEqual({ dues: ['b', 'd'], nouvelles: ['a', 'e', 'f'].slice(0, 15 - 3) });
  });

  it('ignore les cartes du store inconnues et les doublons', () => {
    const t = le(8, 12);
    const etat = etatAvec({ orpheline: vue('supprime', le(1)), a: vue('cours', le(1)) });
    const r = cartesDuJour(etat, [...toutes, { id: 'a', coursId: 'cours' }, { id: 'b', coursId: 'cours' }], t);
    expect(r.dues).toEqual(['a']);
    expect(r.nouvelles).toEqual(['b', 'c', 'd', 'e', 'f']);
  });

  it('limite les nouvelles à prefs.nouvellesCartesParJour', () => {
    const r = cartesDuJour(etatAvec({}, { nouvellesCartesParJour: 2 }), toutes, le(8));
    expect(r.nouvelles).toEqual(['a', 'b']);
    expect(cartesDuJour(etatAvec({}, { nouvellesCartesParJour: 0 }), toutes, le(8)).nouvelles).toEqual([]);
  });

  it('retire les nouvelles déjà introduites aujourd’hui', () => {
    const t = le(8, 18);
    const etat = etatAvec({ a: vue('cours', le(8, 9)), b: vue('cours', le(8, 9, 5)) }, { nouvellesCartesParJour: 3 });
    expect(nouvellesIntroduites(etat, t)).toBe(2);
    expect(cartesDuJour(etat, toutes, t).nouvelles).toEqual(['c']);
  });

  it('changement de jour : les introductions d’hier ne comptent plus', () => {
    const etat = etatAvec({ a: vue('cours', le(7, 23, 50)), b: vue('cours', le(7, 9)) }, { nouvellesCartesParJour: 3 });
    expect(cartesDuJour(etat, toutes, le(7, 23, 59)).nouvelles).toEqual(['c']);
    const lendemain = cartesDuJour(etat, toutes, le(8, 0, 5));
    expect(lendemain.nouvelles).toEqual(['c', 'd', 'e']);
    expect(lendemain.dues).toEqual(['b', 'a']);
  });

  it('une carte revue aujourd’hui mais introduite avant ne compte pas comme nouvelle du jour', () => {
    const hier: CarteSRS = vue('cours', le(7, 9));
    const revue = { ...planifier(hier, 3, le(8, 9)), coursId: 'cours' };
    expect(introduiteLe(revue, '2026-10-08')).toBe(false);
    expect(introduiteLe(hier, '2026-10-07')).toBe(true);
    const oubliee = { ...planifier({ ...planifier(undefined, 4, le(1)), coursId: 'x' }, 1, le(8)), coursId: 'x' };
    expect(introduiteLe(oubliee, '2026-10-08')).toBe(false);
  });
});

describe('noter (avec un faux navigateur)', () => {
  beforeEach(() => {
    const donnees = new Map<string, string>();
    const localStorage = {
      getItem: (k: string) => donnees.get(k) ?? null,
      setItem: (k: string, v: string) => void donnees.set(k, String(v)),
      removeItem: (k: string) => void donnees.delete(k),
    };
    vi.stubGlobal('window', Object.assign(new EventTarget(), { localStorage }));
    _viderCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    _viderCache();
  });

  it('enregistre la carte (ISO, coursId) et donne 1 pétale', () => {
    const gains: unknown[] = [];
    window.addEventListener(EVENEMENT_PETALES, (e) => gains.push((e as CustomEvent).detail));
    const t = le(8);
    noter('react/06-usestate::abc', 'react/06-usestate', 3, t);
    const carte = lire().srs['react/06-usestate::abc'];
    expect(carte).toMatchObject({ coursId: 'react/06-usestate', reps: 1, state: 1, last_review: t.toISOString() });
    expect(carte?.due).toBe(new Date(t.getTime() + 10 * MIN).toISOString());
    expect(lire().stats.petales).toBe(1);
    expect(gains).toEqual([{ n: 1, raison: 'carte révisée', total: 1 }]);

    noter('react/06-usestate::abc', 'react/06-usestate', 3, new Date(t.getTime() + 10 * MIN));
    expect(lire().srs['react/06-usestate::abc']?.state).toBe(2);
    expect(lire().stats.petales).toBe(2);
  });

  it('ignore une note invalide', () => {
    noter('x::1', 'x', 7 as 1, le(8));
    expect(lire().srs['x::1']).toBeUndefined();
    expect(lire().stats.petales).toBe(0);
  });
});
