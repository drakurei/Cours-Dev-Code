import { describe, expect, it } from 'vitest';
import { erreurs, lettre, mention, resultatQuiz, score } from '../src/lib/apprentissage/quiz.ts';
import { generateur, graineDepuis, melanger, tirer } from '../src/lib/apprentissage/tirage.ts';
import { apresNote, carteCourante, composerSession, creerFile, estFinie, numero, sessionLibre, terminer } from '../src/lib/apprentissage/session.ts';
import { cartesDuCours, libelleSource, listeLisible, questionsDuCours, type CoursSource } from '../src/lib/apprentissage/donnees.ts';

describe('score du quiz', () => {
  const reponses = new Map([
    [0, true],
    [1, false],
    [2, true],
    [3, false],
    [4, true],
  ]);

  it('compte les bonnes réponses et les erreurs', () => {
    expect(score(reponses)).toEqual({ bonnes: 3, total: 5, ratio: 0.6 });
    expect(erreurs(reponses)).toEqual([1, 3]);
    expect(score(new Map(), 0)).toEqual({ bonnes: 0, total: 0, ratio: 0 });
  });

  it('mention : parfait, bien (≥ 60 %), encore', () => {
    expect(mention({ bonnes: 5, total: 5, ratio: 1 })).toBe('parfait');
    expect(mention({ bonnes: 3, total: 5, ratio: 0.6 })).toBe('bien');
    expect(mention({ bonnes: 2, total: 5, ratio: 0.4 })).toBe('encore');
    expect(mention({ bonnes: 0, total: 0, ratio: 0 })).toBe('encore');
  });

  it('résultat enregistré : meilleur score, tentatives, date', () => {
    const t = new Date('2026-10-08T10:00:00Z');
    const premier = resultatQuiz(undefined, { bonnes: 3, total: 5, ratio: 0.6 }, t);
    expect(premier).toEqual({ meilleur: 3, total: 5, tentatives: 1, dernier: t.toISOString() });
    const moins = resultatQuiz(premier, { bonnes: 2, total: 5, ratio: 0.4 }, t);
    expect(moins).toMatchObject({ meilleur: 3, tentatives: 2 });
    // Le cours a changé de nombre de questions : le meilleur repart du score actuel.
    expect(resultatQuiz({ ...premier, meilleur: 5 }, { bonnes: 2, total: 4, ratio: 0.5 }, t)).toMatchObject({ meilleur: 2, total: 4 });
  });

  it('lettres des choix', () => {
    expect([0, 1, 2, 5].map(lettre)).toEqual(['A', 'B', 'C', 'F']);
  });
});

describe('tirage reproductible', () => {
  const liste = Array.from({ length: 40 }, (_, i) => i);

  it('même graine = même tirage ; graines différentes = tirages différents', () => {
    expect(tirer(liste, 10, 42)).toEqual(tirer(liste, 10, 42));
    expect(tirer(liste, 10, 42)).not.toEqual(tirer(liste, 10, 43));
    expect(graineDepuis('2026-10-08')).toBe(graineDepuis('2026-10-08'));
    expect(graineDepuis('react')).not.toBe(graineDepuis('javascript'));
  });

  it('éléments distincts, au plus la taille de la liste, liste d’origine intacte', () => {
    const copie = [...liste];
    const t = tirer(liste, 10, 7);
    expect(t).toHaveLength(10);
    expect(new Set(t).size).toBe(10);
    expect(tirer([1, 2, 3], 10, 7).sort()).toEqual([1, 2, 3]);
    expect(tirer(liste, -2, 7)).toEqual([]);
    expect(liste).toEqual(copie);
    expect(melanger(liste, 1).sort((a, b) => a - b)).toEqual(liste);
  });

  it('générateur dans [0, 1) et à peu près uniforme', () => {
    const alea = generateur(123);
    let somme = 0;
    for (let i = 0; i < 2000; i++) {
      const x = alea();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      somme += x;
    }
    expect(somme / 2000).toBeGreaterThan(0.45);
    expect(somme / 2000).toBeLessThan(0.55);
  });
});

describe('file de session', () => {
  const MIN = 60_000;

  it('déduplique et commence par la première carte', () => {
    const f = creerFile(['a', 'b', 'a', 'c']);
    expect(f.file).toEqual(['a', 'b', 'c']);
    expect(f.total).toBe(3);
    expect(carteCourante(f)).toBe('a');
    expect(numero(f)).toBe(1);
  });

  it('une carte due bientôt revient après 3 autres ; une carte lointaine sort', () => {
    let f = creerFile(['a', 'b', 'c', 'd', 'e']);
    f = apresNote(f, 'a', 10 * MIN);
    expect(f.file).toEqual(['b', 'c', 'd', 'a', 'e']);
    expect(numero(f)).toBe(1);
    f = apresNote(f, 'b', 2 * 24 * 60 * MIN);
    expect(f.file).toEqual(['c', 'd', 'a', 'e']);
    expect(f.faites).toEqual(['b']);
    expect(numero(f)).toBe(2);
  });

  it('pas plus de 3 retours par carte, puis elle sort', () => {
    let f = creerFile(['a']);
    for (let i = 0; i < 3; i++) {
      f = apresNote(f, 'a', MIN);
      expect(f.file).toEqual(['a']);
    }
    f = apresNote(f, 'a', MIN);
    expect(estFinie(f)).toBe(true);
    expect(f.faites).toEqual(['a']);
    expect(numero(f)).toBe(1);
  });

  it('carte inconnue : rien ne change ; terminer vide la file', () => {
    const f = creerFile(['a', 'b']);
    expect(apresNote(f, 'z', null)).toBe(f);
    const fin = terminer(f);
    expect(estFinie(fin)).toBe(true);
    expect(fin.faites).toEqual([]);
  });
});

describe('composer une session', () => {
  it('dues puis nouvelles, sans doublon, au plus la taille', () => {
    expect(composerSession({ dues: ['a', 'b'], nouvelles: ['c', 'd', 'a'] }, 3)).toEqual(['a', 'b', 'c']);
    expect(composerSession({ dues: [], nouvelles: [] }, 15)).toEqual([]);
    expect(composerSession({ dues: ['a', 'b'], nouvelles: [] }, 0)).toEqual(['a']);
  });

  it('révision libre : vues par échéance, puis jamais vues dans l’ordre', () => {
    const srs = { c: { due: '2026-10-20T10:00:00Z' }, a: { due: '2026-10-12T10:00:00Z' } };
    const toutes = ['a', 'b', 'c', 'd'].map((id) => ({ id }));
    expect(sessionLibre(srs, toutes, 10)).toEqual(['a', 'c', 'b', 'd']);
    expect(sessionLibre(srs, toutes, 3)).toEqual(['a', 'c', 'b']);
  });
});

describe('données des endpoints', () => {
  const cours: CoursSource = {
    id: 'react/06-usestate',
    chapitre: 6,
    url: '/Cours-Dev-Code/cours/react/06-usestate/',
    data: { titre: 'useState' },
    matiere: { slug: 'react', nom: 'React', kanji: '応', couleur: 'ai' },
  };

  it('cartesDuCours : source complète, doublons retirés', () => {
    const f = { id: 'react/06-usestate::x', q: 'Q', r: 'R', qHtml: 'Q', rHtml: '<p>R</p>' };
    const cartes = cartesDuCours(cours, { flashcards: [f, { ...f }] });
    expect(cartes).toEqual([
      {
        id: f.id,
        coursId: cours.id,
        matiere: 'react',
        matiereNom: 'React',
        kanji: '応',
        couleur: 'ai',
        chapitre: 6,
        titreCours: 'useState',
        urlCours: cours.url,
        q: 'Q',
        r: 'R',
        qHtml: 'Q',
        rHtml: '<p>R</p>',
      },
    ]);
  });

  it('questionsDuCours : garde seulement les questions avec une bonne réponse connue', () => {
    const choix = [
      { texte: 'a', html: 'a' },
      { texte: 'b', html: 'b' },
    ];
    const base = { question: 'Q', questionHtml: 'Q', choix, reponse: 'a', explicationHtml: '' };
    const q = questionsDuCours(cours, {
      quiz: [
        { ...base, index: 0, reponseIndex: 0 },
        { ...base, index: 1, reponseIndex: -1 },
      ],
    });
    expect(q).toHaveLength(1);
    expect(q[0]).toMatchObject({ coursId: cours.id, index: 0, reponseIndex: 0, matiereNom: 'React', titreCours: 'useState' });
  });

  it('libellés lisibles', () => {
    expect(libelleSource({ matiereNom: 'React', chapitre: 6 })).toBe('React, chapitre 6');
    expect(listeLisible(['React'])).toBe('React');
    expect(listeLisible(['React', 'CSS', 'React'])).toBe('React et CSS');
    expect(listeLisible(['React', 'JavaScript', 'CSS'])).toBe('React, JavaScript et CSS');
    expect(listeLisible([])).toBe('');
  });
});
