import { describe, expect, it } from 'vitest';
import {
  appliquerCommande,
  DELAI_ECRITURE,
  delaiProchainTic,
  dureeParDefaut,
  etatAffiche,
  formaterTemps,
  lireSession,
  MIROIR_INITIAL,
  resteMs,
  synchroniser,
  tempsEnMots,
  type Miroir,
  type SessionMinuteur,
} from '../src/islands/accueil/minuteur.ts';

const T0 = 1_000_000;
const enCours = (fin: number, duree = 15): SessionMinuteur => ({ etat: 'en-cours', fin, duree });

describe('lireSession (format du Minuteur global)', () => {
  it('clé absente = prêt ; formats connus', () => {
    expect(lireSession(null)).toEqual({ etat: 'pret' });
    expect(lireSession(JSON.stringify({ etat: 'en-cours', fin: 5, duree: 15 }))).toEqual(enCours(5));
    expect(lireSession(JSON.stringify({ etat: 'pause', reste: 1000, duree: 10 }))).toEqual({ etat: 'pause', reste: 1000, duree: 10 });
    expect(lireSession(JSON.stringify({ etat: 'fini', duree: 25 }))).toEqual({ etat: 'fini', duree: 25 });
  });

  it('JSON abîmé ou format inconnu = null (on ne déduit rien)', () => {
    expect(lireSession('{pas du json')).toBeNull();
    expect(lireSession(JSON.stringify({ etat: 'en-cours' }))).toBeNull();
    expect(lireSession(JSON.stringify({ phase: 'running', end: 3 }))).toBeNull();
    expect(lireSession('42')).toBeNull();
  });
});

describe('appliquerCommande (miroir optimiste)', () => {
  it('démarrer, pause, reprendre, arrêter', () => {
    const s1 = appliquerCommande({ etat: 'pret' }, { action: 'demarrer', minutes: 10 }, T0);
    expect(s1).toEqual(enCours(T0 + 600_000, 10));
    const s2 = appliquerCommande(s1, { action: 'pause' }, T0 + 60_000);
    expect(s2).toEqual({ etat: 'pause', reste: 540_000, duree: 10 });
    const s3 = appliquerCommande(s2, { action: 'reprendre' }, T0 + 120_000);
    expect(s3).toEqual(enCours(T0 + 660_000, 10));
    expect(appliquerCommande(s3, { action: 'arreter' }, T0)).toEqual({ etat: 'pret' });
  });

  it('commandes sans effet hors de leur état ; durée par défaut 15', () => {
    expect(appliquerCommande({ etat: 'pret' }, { action: 'pause' }, T0)).toEqual({ etat: 'pret' });
    expect(appliquerCommande(enCours(T0 + 5), { action: 'reprendre' }, T0)).toEqual(enCours(T0 + 5));
    expect(appliquerCommande({ etat: 'pret' }, { action: 'demarrer' }, T0)).toEqual(enCours(T0 + 900_000));
  });
});

describe('synchroniser', () => {
  const lance: Miroir = { session: enCours(T0 + 900_000), depuis: T0, cleVue: false };

  it('juste après une commande, le miroir local fait foi', () => {
    expect(synchroniser(lance, null, T0 + 200)).toBe(lance);
  });

  it('clé jamais vue : son absence ne veut rien dire (le Minuteur range peut-être ailleurs)', () => {
    expect(synchroniser(lance, null, T0 + DELAI_ECRITURE + 10)).toBe(lance);
  });

  it('session valide stockée : on s’y recale (fin exacte du Minuteur)', () => {
    const brut = JSON.stringify({ etat: 'en-cours', fin: T0 + 900_012, duree: 15 });
    const m = synchroniser(lance, brut, T0 + DELAI_ECRITURE + 10);
    expect(m.session).toEqual(enCours(T0 + 900_012));
    expect(m.cleVue).toBe(true);
  });

  it('clé déjà vue puis retirée : arrêté ailleurs', () => {
    const vu: Miroir = { ...lance, cleVue: true };
    expect(synchroniser(vu, null, T0 + DELAI_ECRITURE + 10).session).toEqual({ etat: 'pret' });
  });

  it('format inconnu : on garde le miroir', () => {
    expect(synchroniser(lance, '{"phase":"x"}', T0 + 10_000)).toBe(lance);
  });

  it('au chargement : reprend une session lancée sur une autre page', () => {
    const brut = JSON.stringify({ etat: 'pause', reste: 30_000, duree: 25 });
    expect(synchroniser(MIROIR_INITIAL, brut, T0).session).toEqual({ etat: 'pause', reste: 30_000, duree: 25 });
  });
});

describe('affichage', () => {
  it('reste, état affiché, temps', () => {
    expect(resteMs(enCours(T0 + 61_500), T0)).toBe(61_500);
    expect(resteMs({ etat: 'pause', reste: 42, duree: 1 }, T0)).toBe(42);
    expect(resteMs({ etat: 'pret' }, T0)).toBe(0);
    expect(etatAffiche(enCours(T0 - 1), T0)).toBe('fini');
    expect(etatAffiche(enCours(T0 + 1), T0)).toBe('en-cours');
    expect(formaterTemps(754_000)).toBe('12:34');
    expect(formaterTemps(900_000)).toBe('15:00');
    expect(formaterTemps(-5)).toBe('00:00');
    expect(formaterTemps(59_001)).toBe('01:00');
  });

  it('prochain rafraîchissement calé sur les secondes du Minuteur', () => {
    expect(delaiProchainTic(enCours(T0 + 61_250), T0)).toBe(260);
    expect(delaiProchainTic(enCours(T0 + 61_000), T0)).toBe(1010);
    expect(delaiProchainTic({ etat: 'pause', reste: 1234, duree: 1 }, T0)).toBe(1000);
    expect(delaiProchainTic(enCours(T0 - 5), T0)).toBe(1000);
  });

  it('temps en mots pour les lecteurs d’écran', () => {
    expect(tempsEnMots(754_000)).toBe('12 minutes et 34 secondes');
    expect(tempsEnMots(60_000)).toBe('1 minute');
    expect(tempsEnMots(1_000)).toBe('1 seconde');
  });

  it('durée par défaut : la préférence si elle fait partie des choix', () => {
    expect(dureeParDefaut(25)).toBe(25);
    expect(dureeParDefaut(20)).toBe(15);
  });
});
