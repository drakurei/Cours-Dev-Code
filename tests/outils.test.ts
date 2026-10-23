import { describe, expect, it } from 'vitest';
import { prefixerBase } from '../src/lib/url.ts';
import { dureeLecture, hashCourt, idCarte, normaliser, pluriel, slugifier, tronquer } from '../src/lib/texte.ts';
import { caracteresKanji, KANJI_BLOCS, urlPoliceKanji } from '../src/lib/kanji.ts';
import { matiereOuDefaut } from '../src/lib/matieres.ts';
import {
  definitionsGlobales,
  lettreIndex,
  preparerCours,
  precedentSuivant,
  regrouperEnTomes,
  sectionsDuCours,
  type EntreeCours,
} from '../src/lib/cours.ts';
import { validerCours, validerMatiere, type Cours, type Matiere } from '../src/lib/schema.ts';
import { formaterDate } from '../src/lib/libelles.ts';

const BASE = '/Cours-Dev-Code';

describe('url', () => {
  it('préfixe la base et ajoute le slash final des pages', () => {
    expect(prefixerBase('/tomes/', BASE)).toBe('/Cours-Dev-Code/tomes/');
    expect(prefixerBase('/', BASE)).toBe('/Cours-Dev-Code/');
    expect(prefixerBase('tomes', BASE)).toBe('/Cours-Dev-Code/tomes/');
    expect(prefixerBase('/cours/react/06-usestate#etat', BASE)).toBe('/Cours-Dev-Code/cours/react/06-usestate/#etat');
    expect(prefixerBase('/reviser/?onglet=quiz', BASE)).toBe('/Cours-Dev-Code/reviser/?onglet=quiz');
  });

  it('ne touche pas aux fichiers, liens externes, ancres ni chemins déjà préfixés', () => {
    expect(prefixerBase('/manifest.webmanifest', BASE)).toBe('/Cours-Dev-Code/manifest.webmanifest');
    expect(prefixerBase('/media/react/slides.pdf', BASE)).toBe('/Cours-Dev-Code/media/react/slides.pdf');
    expect(prefixerBase('https://react.dev', BASE)).toBe('https://react.dev');
    expect(prefixerBase('#quiz', BASE)).toBe('#quiz');
    expect(prefixerBase('/Cours-Dev-Code/tomes/', BASE)).toBe('/Cours-Dev-Code/tomes/');
    expect(prefixerBase('//cdn.exemple.fr/x.js', BASE)).toBe('//cdn.exemple.fr/x.js');
  });
});

describe('texte', () => {
  it('normalise et slugifie', () => {
    expect(normaliser('  État   ÉLÉMENT ')).toBe('etat element');
    expect(slugifier('Réagir à un clic !')).toBe('reagir-a-un-clic');
    expect(slugifier("L'état d'un composant")).toBe('l-etat-d-un-composant');
  });

  it('calcule une durée de lecture d’au moins 1 minute', () => {
    expect(dureeLecture('court')).toBe(1);
    expect(dureeLecture('mot '.repeat(1000))).toBe(5);
  });

  it('donne un hash stable et un id de carte', () => {
    expect(hashCourt('abc')).toBe(hashCourt('abc'));
    expect(hashCourt('abc')).not.toBe(hashCourt('abd'));
    expect(idCarte('react/06-usestate', 'Que fait setX ?')).toMatch(/^react\/06-usestate::[0-9a-z]+$/);
    expect(idCarte('a', 'Éé')).toBe(idCarte('a', 'ee'));
  });

  it('tronque et accorde', () => {
    expect(tronquer('bonjour tout le monde', 16)).toBe('bonjour tout…');
    expect(tronquer('court', 16)).toBe('court');
    expect(pluriel(1, 'carte')).toBe('1 carte');
    expect(pluriel(3, 'carte')).toBe('3 cartes');
  });

  it('formate les dates sans dépendre du fuseau', () => {
    expect(formaterDate('2026-09-23')).toBe('23 sept. 2026');
    expect(formaterDate('2026-01-05', true)).toBe('5 janvier 2026');
  });
});

describe('kanji', () => {
  it('liste tous les caractères sans doublon, matières comprises', () => {
    const c = caracteresKanji(['応']);
    expect(c).toContain(KANJI_BLOCS.quoi.kanji);
    expect(c).toContain('応');
    expect(new Set(c).size).toBe([...c].length);
    expect(urlPoliceKanji()).toMatch(/^https:\/\/fonts\.googleapis\.com\/css2\?family=Shippori\+Mincho.*&text=0123456789%E3/);
  });
});

// ─── Cours ───────────────────────────────────────────────────────────────────

function cours(id: string, partiel: Record<string, unknown>, body = 'texte'): EntreeCours {
  const r = validerCours({ titre: id, essentiel: 'E', ...partiel });
  if (!r.ok) throw new Error(r.erreurs.join('\n'));
  return { id, data: r.data as Cours, body };
}

function matiere(id: string, partiel: Record<string, unknown>): { id: string; data: Matiere } {
  const r = validerMatiere({ nom: id, kanji: '応', ...partiel });
  if (!r.ok) throw new Error(r.erreurs.join('\n'));
  return { id, data: r.data };
}

describe('cours', () => {
  const matieres = [matiere('react', { ordre: 2, couleur: 'ai' }), matiere('html-css', { ordre: 1, nom: 'HTML & CSS' })];
  const entrees = [
    cours('react/06-usestate', { matiere: 'react', definitions: [{ terme: 'État', definition: 'Valeur.' }] }),
    cours('react/02-props', { matiere: 'react', definitions: [{ terme: 'Props', definition: 'Paramètres.' }] }),
    cours('html-css/01-balises', { matiere: 'html-css' }),
    cours('react/09-brouillon', { matiere: 'react', brouillon: true }),
    cours('inconnue/01-x', { matiere: 'inconnue', type: 'projet' }),
  ];
  const liste = preparerCours(entrees, matieres);

  it('trie par tome puis chapitre et ignore les brouillons', () => {
    expect(liste.map((c) => c.id)).toEqual(['html-css/01-balises', 'react/02-props', 'react/06-usestate', 'inconnue/01-x']);
    expect(liste[1]?.chapitre).toBe(2);
  });

  it('donne un style par défaut à une matière inconnue', () => {
    const m = matiereOuDefaut('sans-tome', matieres);
    expect(m).toMatchObject({ slug: 'sans-tome', kanji: 'S', couleur: 'sumi', parDefaut: true });
    expect(liste[3]?.estProjet).toBe(true);
  });

  it('trouve les épisodes voisins dans le même tome', () => {
    const v = precedentSuivant('react/02-props', liste);
    expect(v.precedent).toBeNull();
    expect(v.suivant?.id).toBe('react/06-usestate');
  });

  it('regroupe en tomes, matières sans cours comprises', () => {
    const tomes = regrouperEnTomes(liste, [...matieres, matiere('vide', { ordre: 5 })]);
    expect(tomes.map((t) => [t.matiere.slug, t.cours.length])).toEqual([
      ['html-css', 1],
      ['react', 2],
      ['vide', 0],
      ['inconnue', 1],
    ]);
  });

  it('construit le glossaire A-Z', () => {
    const defs = definitionsGlobales(liste);
    expect(defs.map((d) => [d.terme, d.lettre, d.coursId])).toEqual([
      ['État', 'E', 'react/06-usestate'],
      ['Props', 'P', 'react/02-props'],
    ]);
    expect(lettreIndex('3D')).toBe('#');
  });

  it('extrait les notions (##) en ignorant le titre caché des notes', () => {
    expect(
      sectionsDuCours([
        { depth: 2, slug: 'a', text: 'A' },
        { depth: 3, slug: 'b', text: 'B' },
        { depth: 2, slug: 'footnote-label', text: 'Notes' },
      ]),
    ).toEqual([{ id: 'a', titre: 'A' }]);
  });
});
