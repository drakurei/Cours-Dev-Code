import { describe, expect, it } from 'vitest';
import { estScanne, preparerEnvoi, promptPour, slugMatiere, texteDuPdf } from '../src/lib/atelier/source.ts';
import { brouillonVide, normaliserBrouillon, NOUVELLE_MATIERE, type Brouillon } from '../src/lib/atelier/brouillon.ts';
import { dimensionsReduites } from '../src/lib/atelier/images.ts';

const GABARIT = '<!-- PROMPT:DEBUT -->\n~~~text\nMatière : {{MATIERE}} / Type : {{TYPE}} / Consigne : {{CONSIGNE}} / Date : {{DATE}}\n{{MATIERES}}\n~~~\n<!-- PROMPT:FIN -->';

function brouillon(over: Partial<Brouillon> = {}): Brouillon {
  return { ...brouillonVide(), ...over };
}

const PDF_TEXTE = { id: 'p1', nom: 'cours.pdf', taille: 1000, pages: 2, textes: ['Page un, assez de texte pour un vrai PDF.', 'Page deux, encore du texte lisible.'], scanne: false, inclureTexte: true, enImages: false };
const PDF_SCAN = { id: 'p2', nom: 'scan.pdf', taille: 1000, pages: 2, textes: ['', ' '], scanne: true, inclureTexte: true, enImages: false };
const IMAGE = { id: 'i1', nom: 'tableau.jpg', taille: 500, type: 'image/jpeg', largeur: 100, hauteur: 80, redimensionnee: false };

describe('preparerEnvoi', () => {
  it('universel : texte du PDF dans le prompt, images et PDF scanné à joindre', () => {
    const b = brouillon({ texte: 'Mes notes', pdfs: [PDF_TEXTE, PDF_SCAN], images: [IMAGE] });
    const e = preparerEnvoi(b, 'universel', new Set());
    expect(e.source).toContain('Mes notes');
    expect(e.source).toContain('--- PDF : cours.pdf (2 pages) ---');
    expect(e.source).toContain('[page 2]');
    expect(e.joints).toEqual(['scan.pdf', 'tableau.jpg']);
  });

  it('universel : PDF « à joindre » au lieu de son texte', () => {
    const e = preparerEnvoi(brouillon({ pdfs: [{ ...PDF_TEXTE, inclureTexte: false }] }), 'universel', new Set());
    expect(e.source).toBe('');
    expect(e.joints).toEqual(['cours.pdf']);
  });

  it('claude : PDF en document et images en blocs, sans doublon de texte', () => {
    const b = brouillon({ pdfs: [PDF_TEXTE], images: [IMAGE] });
    const e = preparerEnvoi(b, 'claude', new Set(['p1', 'i1']));
    expect(e.pdfs).toEqual(['p1']);
    expect(e.images).toEqual(['i1']);
    expect(e.source).not.toContain('Page un');
    expect(e.joints).toEqual(['cours.pdf', 'tableau.jpg']);
  });

  it('claude : PDF transformé en images → seules les pages partent ; fichier perdu → son texte', () => {
    const scan = { ...PDF_SCAN, enImages: true };
    const page = { ...IMAGE, id: 'pg1', nom: 'scan-p01.png', depuisPdf: 'p2' };
    const e = preparerEnvoi(brouillon({ pdfs: [scan, PDF_TEXTE], images: [page] }), 'claude', new Set(['pg1']));
    expect(e.pdfs).toEqual([]);
    expect(e.images).toEqual(['pg1']);
    expect(e.source).toContain('Page un'); // p1 n'est plus en mémoire
    // En mode universel, la page rendue n'est pas listée : on joint le PDF.
    expect(preparerEnvoi(brouillon({ pdfs: [scan], images: [page] }), 'universel', new Set()).joints).toEqual(['scan.pdf']);
  });
});

describe('promptPour', () => {
  it('remplit matière, type et consigne ; nouvelle matière → slug + consigne', () => {
    const b = brouillon({ matiere: NOUVELLE_MATIERE, nomNouvelleMatiere: 'Bases de données', type: 'cours', consigne: 'Court.' });
    expect(slugMatiere(b)).toBe('bases-de-donnees');
    const p = promptPour(GABARIT, b, [{ slug: 'react', nom: 'React' }], preparerEnvoi(b, 'universel', new Set()), '2026-10-08');
    expect(p).toContain('Matière : bases-de-donnees / Type : cours');
    expect(p).toContain('Court.\nNouvelle matière : « Bases de données »');
    expect(p).toContain('Date : 2026-10-08');
    expect(p).toContain('  - react — React');
    expect(p).not.toContain('~~~');
  });
});

describe('outils de la source', () => {
  it('estScanne et texteDuPdf', () => {
    expect(estScanne(['', 'a'])).toBe(true);
    expect(estScanne(['x'.repeat(200)])).toBe(false);
    expect(texteDuPdf('a.pdf', ['un', '', 'trois'])).toBe('--- PDF : a.pdf (3 pages) ---\n[page 1]\nun\n\n[page 3]\ntrois');
  });
  it('dimensionsReduites : 2000 px au plus, proportions gardées', () => {
    expect(dimensionsReduites(4000, 3000)).toEqual({ largeur: 2000, hauteur: 1500 });
    expect(dimensionsReduites(800, 600)).toEqual({ largeur: 800, hauteur: 600 });
  });
  it('normaliserBrouillon : valeurs abîmées → brouillon valide', () => {
    const b = normaliserBrouillon({ etape: 9, ongletSource: 'x', pdfs: [{ id: 'a', textes: [1, 'ok'] }, 'nul'], joindre: ['a', 3], repo: { slug: 1 } });
    expect(b.etape).toBe(1);
    expect(b.ongletSource).toBe('fichiers');
    expect(b.pdfs).toHaveLength(1);
    expect(b.pdfs[0]?.textes).toEqual(['', 'ok']);
    expect(b.joindre).toEqual(['a']);
    expect(b.repo).toBeNull();
    expect(normaliserBrouillon(null)).toEqual(brouillonVide());
  });
});
