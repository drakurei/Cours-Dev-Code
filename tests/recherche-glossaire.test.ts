import { describe, expect, it } from 'vitest';
import { ancreLettre, ancreTerme, lettresPresentes, regrouperTermes, termeCommun } from '../src/lib/recherche/glossaire.ts';
import { filtrerTermes } from '../src/islands/glossaire/filtre.ts';

const def = (terme: string, matiere: string, ordreMatiere: number, chapitre: number) => ({ terme, matiere, ordreMatiere, chapitre });

describe('regroupement des termes', () => {
  const entrees = regrouperTermes([
    def('État (state)', 'react', 2, 6),
    def('Composant', 'react', 2, 3),
    def('Itération (prompt)', 'ia-seo', 6, 1),
    def('Itération', 'gestion-projet', 5, 1),
    def('État (state)', 'react', 2, 8),
    def('Composant', 'manabi', 1, 2),
    def('.map()', 'javascript', 3, 6),
    def('Product Owner (PO)', 'gestion-projet', 5, 1),
    def('Product Owner', 'gestion-projet', 5, 3),
    def('3D', 'html-css', 4, 2),
    def('DOM', 'javascript', 3, 7),
    def('dom', 'react', 2, 1),
  ]);
  const parCle = new Map(entrees.map((e) => [e.cle, e]));

  it('fait UNE entrée par terme, même défini dans plusieurs tomes', () => {
    expect(entrees.map((e) => e.cle)).toEqual(['composant', 'dom', 'etat', 'iteration', 'map', 'product owner', '3d']);
    expect(parCle.get('etat')?.definitions).toHaveLength(2);
    expect(parCle.get('iteration')?.definitions).toHaveLength(2);
  });

  it('trie les définitions et les tomes dans l’ordre des tomes puis des épisodes', () => {
    const composant = parCle.get('composant');
    expect(composant?.matieres).toEqual(['manabi', 'react']);
    expect(composant?.definitions.map((d) => d.matiere)).toEqual(['manabi', 'react']);
    expect(parCle.get('etat')?.definitions.map((d) => d.chapitre)).toEqual([6, 8]);
    expect(parCle.get('etat')?.matieres).toEqual(['react']);
    expect(parCle.get('dom')?.matieres).toEqual(['react', 'javascript']);
  });

  it('choisit un terme affiché lisible', () => {
    expect(parCle.get('etat')?.terme).toBe('État (state)');
    expect(parCle.get('iteration')?.terme).toBe('Itération');
    expect(parCle.get('product owner')?.terme).toBe('Product Owner');
    expect(parCle.get('map')?.terme).toBe('.map()');
    expect(termeCommun(['Pull request (PR)', 'Pull Request (PR)'])).toBe('Pull request (PR)');
    expect(termeCommun(['XSS (a)', 'XSS (b)'])).toBe('XSS');
  });

  it('range les lettres A-Z puis « # » à la fin', () => {
    expect(parCle.get('map')?.lettre).toBe('M');
    expect(parCle.get('3d')?.lettre).toBe('#');
    expect(lettresPresentes(entrees)).toEqual(['C', 'D', 'E', 'I', 'M', 'P', '#']);
  });

  it('donne des ancres sûres', () => {
    expect(ancreTerme('product owner')).toBe('terme-product-owner');
    expect(ancreTerme('c#')).toBe('terme-c-diese');
    expect(ancreTerme('===')).toBe('terme-symbole');
    expect(ancreLettre('A')).toBe('lettre-a');
    expect(ancreLettre('#')).toBe('lettre-autres');
  });
});

describe('filtre du glossaire', () => {
  const termes = [
    { texte: 'etat (state) une valeur que react surveille', tomes: ['react'] },
    { texte: 'dom l arbre des elements de la page', tomes: ['javascript', 'react'] },
    { texte: 'scrum un cadre de travail agile', tomes: ['gestion-projet'] },
  ];

  it('filtre par mots (accents ignorés) et par tome', () => {
    expect(filtrerTermes(termes, '')).toEqual([0, 1, 2]);
    expect(filtrerTermes(termes, 'État')).toEqual([0]);
    expect(filtrerTermes(termes, "l'arbre de la page")).toEqual([1]);
    expect(filtrerTermes(termes, '', 'react')).toEqual([0, 1]);
    expect(filtrerTermes(termes, 'agile', 'react')).toEqual([]);
    expect(filtrerTermes(termes, 'react valeur')).toEqual([0]);
  });
});
