import { describe, expect, it } from 'vitest';
import {
  borner,
  cibleVoisine,
  construireEtapes,
  ecrireMemoire,
  ID_ESSENTIEL,
  ID_FIN,
  indexEtape,
  libelleCompteur,
  libelleEtape,
  libelleNotion,
  libelleRestant,
  lireMemoire,
  minutesRestantes,
  progressionLecture,
  sectionCourante,
  sensBalayage,
} from '../src/scripts/lecteur/etapes.ts';

const notions = [
  { id: 'reagir-a-un-clic', titre: 'Réagir à un clic' },
  { id: 'usestate', titre: '  useState :\n une valeur  ' },
  { id: 'setx', titre: 'Changer avec setX' },
];

describe('construireEtapes', () => {
  it('encadre les notions par L’essentiel et la fin', () => {
    const etapes = construireEtapes(notions);
    expect(etapes.map((e) => e.id)).toEqual([ID_ESSENTIEL, 'reagir-a-un-clic', 'usestate', 'setx', ID_FIN]);
    expect(etapes.map((e) => e.type)).toEqual(['essentiel', 'notion', 'notion', 'notion', 'fin']);
  });

  it('nettoie les titres, ignore doublons, ids vides et ids réservés', () => {
    const etapes = construireEtapes([...notions, { id: 'usestate', titre: 'Doublon' }, { id: ' ', titre: 'Vide' }, { id: 'fin', titre: 'Fin' }]);
    expect(etapes).toHaveLength(5);
    expect(etapes[2]?.titre).toBe('useState : une valeur');
  });

  it('marche sans aucune notion', () => {
    expect(construireEtapes([]).map((e) => e.id)).toEqual([ID_ESSENTIEL, ID_FIN]);
  });
});

describe('navigation entre étapes', () => {
  const etapes = construireEtapes(notions);

  it('borne les index', () => {
    expect(borner(-3, 5)).toBe(0);
    expect(borner(9, 5)).toBe(4);
    expect(borner(2.7, 5)).toBe(2);
    expect(borner(Number.NaN, 5)).toBe(0);
    expect(borner(3, 0)).toBe(0);
  });

  it('retrouve une étape par son id', () => {
    expect(indexEtape(etapes, 'setx')).toBe(3);
    expect(indexEtape(etapes, 'inconnue')).toBe(-1);
    expect(indexEtape(etapes, null)).toBe(-1);
  });

  it('formate le compteur et les libellés', () => {
    expect(libelleCompteur(1, 5)).toBe('2 / 5');
    expect(libelleCompteur(12, 5)).toBe('5 / 5');
    expect(libelleEtape(etapes, 1)).toBe('Étape 2 sur 5 : Réagir à un clic');
    expect(libelleNotion(etapes, 1)).toBe('Notion 1 sur 3');
    expect(libelleNotion(etapes, 3)).toBe('Notion 3 sur 3');
    expect(libelleNotion(etapes, 0)).toBe('');
    expect(libelleNotion(etapes, 4)).toBe('');
  });
});

describe('mémoire de session', () => {
  it('relit ce qui a été écrit pour le même cours', () => {
    const brut = ecrireMemoire({ coursId: 'react/06-usestate', etape: 'setx', actif: true });
    expect(lireMemoire(brut, 'react/06-usestate')).toEqual({ coursId: 'react/06-usestate', etape: 'setx', actif: true });
  });

  it('ignore un autre cours, un JSON abîmé ou incomplet', () => {
    const brut = ecrireMemoire({ coursId: 'react/06-usestate', etape: 'setx', actif: false });
    expect(lireMemoire(brut, 'react/07-autre')).toBeNull();
    expect(lireMemoire('{pas du json', 'react/06-usestate')).toBeNull();
    expect(lireMemoire(null, 'react/06-usestate')).toBeNull();
    expect(lireMemoire('{"coursId":"react/06-usestate"}', 'react/06-usestate')).toBeNull();
    expect(lireMemoire('"texte"', 'react/06-usestate')).toBeNull();
  });

  it('considère actif seulement s’il vaut true', () => {
    expect(lireMemoire('{"coursId":"a","etape":"fin","actif":"oui"}', 'a')?.actif).toBe(false);
  });
});

describe('sensBalayage', () => {
  it('doigt vers la gauche = suivant, vers la droite = précédent', () => {
    expect(sensBalayage({ dx: -120, dy: 10, duree: 250 })).toBe(1);
    expect(sensBalayage({ dx: 90, dy: -20, duree: 300 })).toBe(-1);
  });

  it('ignore les petits gestes, les gestes lents et le défilement vertical', () => {
    expect(sensBalayage({ dx: -30, dy: 0, duree: 100 })).toBe(0);
    expect(sensBalayage({ dx: -200, dy: 0, duree: 1500 })).toBe(0);
    expect(sensBalayage({ dx: -80, dy: 120, duree: 200 })).toBe(0);
    expect(sensBalayage({ dx: Number.NaN, dy: 0, duree: 100 })).toBe(0);
  });
});

describe('sectionCourante (scrollspy)', () => {
  it('prend la dernière section passée sous la ligne de lecture', () => {
    expect(sectionCourante([-900, -200, 150, 700], 250)).toBe(2);
    expect(sectionCourante([-900, -200, 400, 700], 250)).toBe(1);
  });

  it('renvoie 0 avant la première section et -1 sans section', () => {
    expect(sectionCourante([300, 900], 250)).toBe(0);
    expect(sectionCourante([], 250)).toBe(-1);
  });

  it('en bas de page, la dernière section visible l’emporte', () => {
    expect(sectionCourante([-900, 100, 500, 760], 250, { enBas: true, hauteurVue: 800 })).toBe(3);
    expect(sectionCourante([-900, 100, 500, 900], 250, { enBas: true, hauteurVue: 800 })).toBe(2);
  });
});

describe('cibleVoisine (J / K)', () => {
  const hauts = [-800, -300, 120, 600, 1400];

  it('J va à la section qui suit la ligne de lecture', () => {
    expect(cibleVoisine(hauts, 120, 1)).toBe(3);
    expect(cibleVoisine([300, 800], 120, 1)).toBe(0);
    expect(cibleVoisine([-500, -100], 120, 1)).toBe(-1);
  });

  it('K remonte au début de la section si on est dedans, sinon à la précédente', () => {
    expect(cibleVoisine(hauts, 120, -1)).toBe(1); // la section 2 est pile sur la ligne
    expect(cibleVoisine([-800, -300, -60, 600], 120, -1)).toBe(2); // au milieu de la section 2
    expect(cibleVoisine([300, 800], 120, -1)).toBe(-1);
    expect(cibleVoisine([], 120, -1)).toBe(-1);
  });
});

describe('progression de lecture et temps restant', () => {
  it('calcule la part lue de l’article', () => {
    expect(progressionLecture(0, 3000, 1000)).toBe(0);
    expect(progressionLecture(-1000, 3000, 1000)).toBe(0.5);
    expect(progressionLecture(-5000, 3000, 1000)).toBe(1);
    expect(progressionLecture(200, 3000, 1000)).toBe(0);
    expect(progressionLecture(0, 600, 1000)).toBe(1); // article plus court que l'écran
  });

  it('estime les minutes restantes', () => {
    expect(minutesRestantes(10, 0, 5)).toBe(10);
    expect(minutesRestantes(10, 2, 5)).toBe(6);
    expect(minutesRestantes(10, 4, 5)).toBe(2);
    expect(minutesRestantes(1, 4, 5)).toBe(1);
    expect(minutesRestantes(10, 5, 5)).toBe(0);
    expect(minutesRestantes(10, 1, 5, true)).toBe(0);
    expect(minutesRestantes(10, 0, 0)).toBe(0);
  });

  it('accorde le libellé', () => {
    expect(libelleRestant(5)).toBe('Environ 5 min restantes');
    expect(libelleRestant(1)).toBe('Environ 1 min restante');
    expect(libelleRestant(0)).toBe('Tout est lu');
  });
});
