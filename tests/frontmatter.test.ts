import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { numeroDepuisNom, parserCours, separerFrontmatter } from '../src/lib/frontmatter.ts';

const fixture = (chemin: string) => readFileSync(new URL(`./fixtures/cours/${chemin}`, import.meta.url), 'utf8');

describe('separerFrontmatter', () => {
  it('sépare le YAML du corps', () => {
    const r = separerFrontmatter('---\ntitre: "A"\n---\n\n## Corps\n');
    expect(r).toEqual({ yaml: 'titre: "A"', corps: '\n## Corps\n' });
  });

  it('accepte les fins de ligne Windows et un BOM', () => {
    const r = separerFrontmatter('﻿---\r\ntitre: A\r\n---\r\nTexte');
    expect(r?.yaml).toBe('titre: A');
    expect(r?.corps).toBe('Texte');
  });

  it('renvoie null sans frontmatter', () => {
    expect(separerFrontmatter('## Pas de frontmatter')).toBeNull();
    expect(separerFrontmatter('---\ntitre: A\n')).toBeNull();
  });
});

describe('parserCours', () => {
  it('lit et valide la fixture complète', () => {
    const r = parserCours(fixture('demo/01-demo.md'));
    expect(r.erreurs).toEqual([]);
    expect(r.ok).toBe(true);
    expect(r.data?.matiere).toBe('demo');
    expect(r.data?.niveau).toBe('debutant');
    expect(r.data?.date).toBe('2026-09-23');
    expect(r.data?.quiz).toHaveLength(2);
    expect(r.corps).toContain('## Créer un état');
  });

  it('lit la fixture de projet', () => {
    const r = parserCours(fixture('demo/02-projet-demo.md'));
    expect(r.ok).toBe(true);
    expect(r.data?.type).toBe('projet');
    expect(r.data?.projet?.statut).toBe('termine');
  });

  it('signale un YAML cassé avec la ligne', () => {
    const r = parserCours('---\ntitre: "A\nmatiere: react\n---\nTexte');
    expect(r.ok).toBe(false);
    expect(r.erreurs[0]).toMatch(/^YAML invalide/);
  });

  it('signale l’absence de frontmatter', () => {
    const r = parserCours('Juste du texte.');
    expect(r.ok).toBe(false);
    expect(r.erreurs[0]).toContain('frontmatter');
  });

  it('renvoie les erreurs du schéma', () => {
    const r = parserCours('---\ntitre: A\nmatiere: react\nessentiel: E\nquiz:\n  - question: Q\n    choix: [a, b]\n    reponse: c\n---\n');
    expect(r.ok).toBe(false);
    expect(r.erreurs[0]).toMatch(/^quiz\[0\]\.reponse/);
  });
});

describe('numeroDepuisNom', () => {
  it('lit le numéro en tête du nom', () => {
    expect(numeroDepuisNom('06-usestate')).toBe(6);
    expect(numeroDepuisNom('react/12-effets.md')).toBe(12);
    expect(numeroDepuisNom('react\\03-props')).toBe(3);
    expect(numeroDepuisNom('usestate')).toBeNull();
    expect(numeroDepuisNom('2026notes')).toBeNull();
  });
});
