/**
 * Tome « manabi » (le mode d'emploi du site) : le texte des cours doit dire la même chose que le code.
 * Si un de ces tests casse, mets à jour src/content/cours/manabi/ (ou le code, si c'est lui qui a tort).
 */
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { parserCours } from '../src/lib/frontmatter.ts';
import { BAREME } from '../src/lib/store.ts';
import { _reglerFuzz, formaterIntervalle, LIBELLES_NOTES, minutesEstimees, planifier } from '../src/lib/srs.ts';
import type { CarteSRS } from '../src/lib/store.ts';

const DOSSIER = new URL('../src/content/cours/manabi/', import.meta.url);
const lireCours = (nom: string) => readFileSync(new URL(`${nom}.md`, DOSSIER), 'utf8');
const NOMS = ['01-bienvenue', '02-creer-un-cours', '03-travailler-partout'];
const bienvenue = lireCours('01-bienvenue');

/** Corps sans les blocs de code (``` ou ````). */
function sansCode(corps: string): string {
  return corps.replace(/^(`{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '');
}

describe('tome manabi : format', () => {
  it.each(NOMS)('%s : frontmatter valide et chaque notion suit Quoi → Exemple → Piège → Où', (nom) => {
    const r = parserCours(lireCours(nom));
    expect(r.erreurs).toEqual([]);
    const notions = sansCode(r.corps).split(/^## /m).slice(1);
    expect(notions.length).toBeGreaterThanOrEqual(2);
    for (const notion of notions) {
      const blocs = [...notion.matchAll(/^:{3,}([a-z]+)/gm)].map((m) => m[1]);
      expect(blocs.slice(0, 4), notion.split('\n')[0]).toEqual(['quoi', 'exemple', 'piege', 'ou']);
    }
  });
});

describe('tome manabi : accord avec le code', () => {
  beforeAll(() => _reglerFuzz(false));
  afterAll(() => _reglerFuzz(true));

  it('barème des pétales (01, notion « Pétales, série et hanko »)', () => {
    expect(bienvenue).toMatch(new RegExp(`Notion vue\\s+\\+${BAREME.notionVue} pétale`));
    expect(bienvenue).toMatch(new RegExp(`Carte révisée\\s+\\+${BAREME.carteRevisee}\\n`));
    expect(bienvenue).toMatch(new RegExp(`Bonne réponse au quiz\\s+\\+${BAREME.bonneReponse}\\n`));
    expect(bienvenue).toMatch(new RegExp(`Exercice fait\\s+\\+${BAREME.exerciceFait}\\n`));
    expect(bienvenue).toMatch(new RegExp(`Cours terminé \\(hanko 済\\)\\s+\\+${BAREME.coursTermine}\\n`));
  });

  it('libellés et touches des notes', () => {
    const notes = ([1, 2, 3, 4] as const).map((n) => `${n} ${LIBELLES_NOTES[n]}`).join(' · ');
    expect(bienvenue).toContain(notes);
  });

  it('durée estimée de la mission « Réviser 12 cartes »', () => {
    expect(bienvenue).toContain(`Réviser 12 cartes · environ ${minutesEstimees(12)} min`);
  });

  it('intervalles d’une carte toujours notée « Bien » (sans fuzz)', () => {
    let carte: CarteSRS | undefined;
    let t = new Date(2026, 9, 8, 10, 0);
    const delais: string[] = [];
    for (let i = 0; i < 5; i++) {
      carte = { ...planifier(carte, 3, t), coursId: 'manabi/01-bienvenue' };
      const due = new Date(carte.due);
      delais.push(formaterIntervalle(due.getTime() - t.getTime()));
      t = due;
    }
    expect(bienvenue).toContain(delais.join(' → '));
  });
});
