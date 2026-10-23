import { describe, expect, it } from 'vitest';
import {
  analyserSession,
  annonceChangement,
  appliquerAction,
  arreter,
  avancer,
  bornerMinutes,
  demarrer,
  dureesProposees,
  formater,
  fractionRestante,
  mettreEnPause,
  minutesRestantes,
  reprendre,
  resteMs,
  SESSION_VIDE,
  texteLong,
  texteRestant,
  type Session,
} from '../src/islands/Minuteur.tsx';

const MIN = 60_000;
const T0 = Date.UTC(2026, 9, 8, 10, 0, 0);

describe('minuteur : cycle d’une session', () => {
  it('démarre avec un horodatage de fin (pas de compte à rebours qui dérive)', () => {
    const s = demarrer(SESSION_VIDE, 15, T0, true);
    expect(s).toMatchObject({ etat: 'en-cours', duree: 15, fin: T0 + 15 * MIN, son: true, choix: 15 });
    // Le temps restant ne dépend que de l'heure : 7 min 30 plus tard, il reste 7 min 30.
    expect(resteMs(s, T0 + 7.5 * MIN, 15)).toBe(7.5 * MIN);
  });

  it('pause, reprise, arrêt', () => {
    const s = demarrer(SESSION_VIDE, 10, T0, false);
    const p = mettreEnPause(s, T0 + 4 * MIN);
    expect(p).toMatchObject({ etat: 'pause', reste: 6 * MIN });
    // Le temps passé en pause ne compte pas.
    const r = reprendre(p, T0 + 60 * MIN);
    expect(r).toMatchObject({ etat: 'en-cours', fin: T0 + 66 * MIN });
    expect(arreter(r)).toMatchObject({ etat: 'pret', choix: 10 });
    // Actions sans effet : renvoient la même session.
    expect(mettreEnPause(p, T0)).toBe(p);
    expect(reprendre(s, T0)).toBe(s);
    expect(arreter(SESSION_VIDE)).toBe(SESSION_VIDE);
  });

  it('passe à « fini » à l’heure de fin, puis oublie une fin trop ancienne', () => {
    const s = demarrer(SESSION_VIDE, 25, T0, true);
    expect(avancer(s, T0 + 25 * MIN - 1)).toBe(s);
    const f = avancer(s, T0 + 25 * MIN);
    expect(f).toMatchObject({ etat: 'fini', duree: 25, finiLe: T0 + 25 * MIN });
    expect(avancer(f, T0 + 40 * MIN)).toBe(f);
    expect(avancer(f, T0 + 60 * MIN).etat).toBe('pret');
  });

  it('garde le choix de durée et l’autorisation de notifier', () => {
    const base: Session = { etat: 'pret', choix: 25, notifier: true };
    const s = demarrer(base, 10, T0, false);
    expect(s).toMatchObject({ choix: 10, notifier: true });
    expect(arreter(s)).toEqual({ etat: 'pret', choix: 10, notifier: true });
  });
});

describe('minuteur : événement « manabi:minuteur »', () => {
  const opts = { defaut: 15, son: false };

  it('démarre avec les minutes données, sinon la durée par défaut', () => {
    expect(appliquerAction(SESSION_VIDE, { action: 'demarrer', minutes: 25 }, T0, opts)).toMatchObject({ duree: 25 });
    expect(appliquerAction(SESSION_VIDE, { action: 'demarrer' }, T0, opts)).toMatchObject({ duree: 15, son: false });
    expect(appliquerAction(SESSION_VIDE, { action: 'demarrer', minutes: 999 }, T0, opts)).toMatchObject({ duree: 120 });
  });

  it('pause / reprendre / arrêter, et ignore une action inconnue', () => {
    const s = appliquerAction(SESSION_VIDE, { action: 'demarrer', minutes: 10 }, T0, opts);
    const p = appliquerAction(s, { action: 'pause' }, T0 + MIN, opts);
    expect(p.etat).toBe('pause');
    expect(appliquerAction(p, { action: 'reprendre' }, T0 + 2 * MIN, opts).etat).toBe('en-cours');
    expect(appliquerAction(p, { action: 'arreter' }, T0, opts).etat).toBe('pret');
    expect(appliquerAction(p, { action: 'danser' as never }, T0, opts)).toBe(p);
    expect(appliquerAction(p, null, T0, opts)).toBe(p);
  });
});

describe('minuteur : stockage', () => {
  it('relit une session enregistrée', () => {
    const s = demarrer(SESSION_VIDE, 15, T0, true);
    expect(analyserSession(JSON.stringify(s))).toEqual(s);
    const p = mettreEnPause(s, T0 + MIN);
    expect(analyserSession(JSON.stringify(p))).toEqual(p);
  });

  it('accepte l’ancien format de la fondation', () => {
    expect(analyserSession(JSON.stringify({ etat: 'en-cours', fin: T0, duree: 15 }))).toMatchObject({ etat: 'en-cours', fin: T0, son: false });
  });

  it('résiste aux données abîmées', () => {
    expect(analyserSession(null)).toBe(SESSION_VIDE);
    expect(analyserSession('{pas du json')).toBe(SESSION_VIDE);
    expect(analyserSession('[1,2]')).toBe(SESSION_VIDE);
    expect(analyserSession(JSON.stringify({ etat: 'en-cours', fin: 'demain' })).etat).toBe('pret');
    expect(analyserSession(JSON.stringify({ etat: 'pause', reste: 10 ** 12, duree: 10 }))).toMatchObject({ reste: 10 * MIN });
    expect(analyserSession(JSON.stringify({ etat: 'pret', choix: -4 }))).toMatchObject({ choix: 1 });
  });
});

describe('minuteur : affichage et annonces', () => {
  it('formate le temps restant', () => {
    expect(formater(15 * MIN)).toBe('15:00');
    expect(formater(754_000)).toBe('12:34');
    expect(formater(754_001)).toBe('12:35'); // seconde entamée = comptée
    expect(formater(-5)).toBe('00:00');
    expect(texteLong(754_000)).toBe('12 minutes 34 secondes');
    expect(texteLong(60_000)).toBe('1 minute');
    expect(texteLong(1_000)).toBe('1 seconde');
    expect(texteLong(0)).toBe('0 seconde');
  });

  it('annonce les minutes (et non les secondes)', () => {
    expect(minutesRestantes(14 * MIN + 1)).toBe(15);
    expect(minutesRestantes(14 * MIN)).toBe(14);
    expect(texteRestant(1)).toBe('1 minute restante');
    expect(texteRestant(12)).toBe('12 minutes restantes');
  });

  it('vide l’ensō avec le temps', () => {
    const s = demarrer(SESSION_VIDE, 10, T0, false);
    expect(fractionRestante(SESSION_VIDE, T0)).toBe(1);
    expect(fractionRestante(s, T0)).toBe(1);
    expect(fractionRestante(s, T0 + 2.5 * MIN)).toBe(0.75);
    expect(fractionRestante(avancer(s, T0 + 11 * MIN), T0 + 11 * MIN)).toBe(0);
  });

  it('propose 10, 15, 25 et la durée des réglages', () => {
    expect(dureesProposees(15)).toEqual([10, 15, 25]);
    expect(dureesProposees(20)).toEqual([10, 15, 20, 25]);
    expect(dureesProposees(45, 5)).toEqual([5, 10, 15, 25, 45]);
    expect(bornerMinutes('x', 15)).toBe(15);
    expect(bornerMinutes(0.4)).toBe(1);
  });

  it('dit ce qui vient de se passer', () => {
    const s = demarrer(SESSION_VIDE, 15, T0, true);
    const p = mettreEnPause(s, T0 + 3 * MIN);
    expect(annonceChangement(SESSION_VIDE, s, T0)).toBe('Minuteur lancé : 15 minutes.');
    expect(annonceChangement(s, p, T0)).toBe('Minuteur en pause : 12 minutes restantes.');
    expect(annonceChangement(p, reprendre(p, T0 + 10 * MIN), T0 + 10 * MIN)).toBe('Minuteur repris : 12 minutes restantes.');
    expect(annonceChangement(s, avancer(s, T0 + 15 * MIN), T0)).toBe('Session de 15 minutes terminée. Fais une pause de 5 min.');
    expect(annonceChangement(s, arreter(s), T0)).toBe('Minuteur arrêté.');
    expect(annonceChangement(SESSION_VIDE, SESSION_VIDE, T0)).toBe('');
  });
});
