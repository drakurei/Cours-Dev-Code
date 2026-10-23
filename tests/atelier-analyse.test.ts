import { describe, expect, it } from 'vitest';
import { analyserCorps, decouper, diagnostiquer, lireChemin, lireNomConseille } from '../src/lib/atelier/analyse.ts';

const lignes = (...l: string[]) => l.join('\n');

const ENTETE = lignes('---', '# fichier : 02-let-const.md', 'titre: "let et const"', 'matiere: javascript', 'essentiel: "const par défaut."', '---', '');

describe('decouper', () => {
  it('donne le YAML, le corps et leurs lignes', () => {
    const d = decouper(lignes(ENTETE, '## A', 'texte'));
    expect(d?.ligneYaml).toBe(2);
    expect(d?.ligneCorps).toBe(7);
    expect(d?.corps.startsWith('\n## A')).toBe(true);
  });
  it('null sans frontmatter', () => {
    expect(decouper('## A')).toBeNull();
  });
});

describe('analyserCorps', () => {
  it('accepte un corps correct', () => {
    const r = analyserCorps(lignes(ENTETE, '## Déclarer', ':::quoi', '**const**', ':::', '', ':::exemple', '```js', 'const a = 1', '```', ':::'));
    expect(r.erreurs).toEqual([]);
    expect(r.avertissements).toEqual([]);
    expect(r.notions).toEqual(['Déclarer']);
  });

  it('signale un bloc ::: jamais fermé avec la ligne du fichier', () => {
    const r = analyserCorps(lignes(ENTETE, '## A', ':::quoi', 'texte'));
    expect(r.erreurs).toHaveLength(1);
    expect(r.erreurs[0]?.ligne).toBe(9);
  });

  it('signale un bloc non fermé avant la notion suivante', () => {
    const r = analyserCorps(lignes(ENTETE, '## A', ':::piege', 'x', '## B', 'y'));
    expect(r.erreurs[0]?.message).toContain('pas fermé avant la notion de la ligne 11');
  });

  it('signale un bloc de code jamais fermé et un « ::: » orphelin', () => {
    const r = analyserCorps(lignes(ENTETE, '## A', ':::', '```js', 'x'));
    expect(r.erreurs.map((e) => e.ligne)).toEqual([9, 10]);
  });

  it('les ::: dans un bloc de code ne comptent pas', () => {
    const r = analyserCorps(lignes(ENTETE, '## A', '```md', ':::quoi', '```'));
    expect(r.erreurs).toEqual([]);
  });

  it('avertit : titre #, bloc inconnu, code sans langage, aucune notion', () => {
    expect(analyserCorps(lignes(ENTETE, '# Titre')).avertissements.map((a) => a.message).join(' ')).toMatch(/titre « # ».*aucune notion/);
    expect(analyserCorps(lignes(ENTETE, '## A', ':::bidule', ':::')).avertissements[0]?.message).toContain('bloc inconnu');
    expect(analyserCorps(lignes(ENTETE, '## A', '```', 'x', '```')).avertissements[0]?.message).toContain('sans langage');
  });
});

describe('diagnostiquer', () => {
  it('cours valide : ok, résumé et nom conseillé', () => {
    const d = diagnostiquer(lignes(ENTETE, '## A', ':::quoi', 'x', ':::'));
    expect(d.ok).toBe(true);
    expect(d.resume).toMatchObject({ titre: 'let et const', matiere: 'javascript', notions: 1, flashcards: 0 });
    expect(d.nomConseille).toBe('02-let-const.md');
  });

  it('erreur du schéma avec la ligne du champ', () => {
    const texte = lignes(
      '---',
      'titre: "Quiz"',
      'matiere: javascript',
      'essentiel: "x"',
      'quiz:',
      '  - question: "Q ?"',
      '    choix: ["a", "b"]',
      '    reponse: "c"',
      '---',
      '## A',
    );
    const d = diagnostiquer(texte);
    expect(d.ok).toBe(false);
    const e = d.erreurs.find((x) => x.message.startsWith('quiz[0].reponse'));
    expect(e?.ligne).toBe(8);
  });

  it('champ obligatoire manquant : ligne du début du YAML', () => {
    const d = diagnostiquer(lignes('---', 'matiere: react', 'essentiel: "x"', '---', '## A'));
    expect(d.erreurs[0]?.message).toMatch(/^titre : champ obligatoire/);
    expect(d.erreurs[0]?.ligne).toBe(2);
  });

  it('YAML illisible : message en français et ligne exacte', () => {
    const d = diagnostiquer(lignes('---', 'titre: "x"', 'matiere: react', 'essentiel: "a" b"', '---', '## A'));
    expect(d.ok).toBe(false);
    expect(d.erreurs[0]?.message).toMatch(/^YAML invalide/);
    expect(d.erreurs[0]?.ligne).toBe(4);
  });

  it('sans frontmatter', () => {
    expect(diagnostiquer('## A').erreurs[0]?.message).toContain('frontmatter');
  });

  it('emoji et solution d’exercice non fermée : avertissements', () => {
    const d = diagnostiquer(
      lignes('---', 'titre: "x"', 'matiere: react', 'essentiel: "y"', 'exercices:', '  - titre: "E"', '    enonce: "f"', '    solution: |', '      ```js', '      x', '---', '## A 🎉'),
    );
    const messages = d.avertissements.map((a) => a.message).join(' | ');
    expect(messages).toContain('exercices[0].solution');
    expect(messages).toContain('emoji');
  });
});

describe('outils', () => {
  it('lireChemin', () => {
    expect(lireChemin('quiz[2].reponse')).toEqual(['quiz', 2, 'reponse']);
    expect(lireChemin('titre')).toEqual(['titre']);
    expect(lireChemin('le frontmatter doit')).toBeNull();
  });
  it('lireNomConseille', () => {
    expect(lireNomConseille(lignes('---', '# fichier : 03-Flexbox.md', 'titre: "x"', '---'))).toBe('03-flexbox.md');
    expect(lireNomConseille(lignes('---', '# fichier : flexbox.md', '---'))).toBeNull();
  });
});
