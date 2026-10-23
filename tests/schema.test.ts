import { describe, expect, it } from 'vitest';
import { formaterChemin, SLUG_RE, validerCours, validerMatiere } from '../src/lib/schema.ts';

const minimal = {
  titre: "useState : l'état d'un composant",
  matiere: 'react',
  essentiel: 'useState crée une valeur que React surveille.',
};

describe('validerCours', () => {
  it('accepte un cours minimal et remplit les valeurs par défaut', () => {
    const r = validerCours(minimal);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.type).toBe('cours');
    expect(r.data.niveau).toBe('debutant');
    expect(r.data.brouillon).toBe(false);
    expect(r.data.quiz).toEqual([]);
    expect(r.data.definitions).toEqual([]);
    expect(r.data.chapitre).toBeUndefined();
  });

  it('accepte un cours complet', () => {
    const r = validerCours({
      ...minimal,
      type: 'projet',
      chapitre: 6,
      niveau: 'intermediaire',
      duree: 8,
      date: '2026-09-23',
      tags: ['react', 'hooks'],
      retenir: ['On appelle setX.'],
      definitions: [{ terme: 'État', definition: 'Une valeur surveillée.', exemple: 'useState(0)' }],
      flashcards: [{ q: 'Que fait setX(5) ?', r: "Met l'état à 5." }],
      quiz: [{ question: 'Q ?', choix: ['a', 'b', 'c'], reponse: 'b', explication: 'Parce que.' }],
      exercices: [{ titre: 'Compteur', niveau: 'moyen', enonce: 'Fais-le.', indices: ['Un état.'], solution: '```js\nx\n```' }],
      projet: { repo: 'https://github.com/drakurei/x', stack: ['React'], statut: 'termine', role: 'Seul' },
      fichiers: [{ titre: 'Slides', chemin: '/media/react/slides.pdf' }],
    });
    expect(r.ok).toBe(true);
  });

  it('refuse une réponse de quiz absente des choix, avec le chemin du champ', () => {
    const r = validerCours({
      ...minimal,
      quiz: [
        { question: 'Q1', choix: ['a', 'b'], reponse: 'a' },
        { question: 'Q2', choix: ['a', 'b'], reponse: 'b' },
        { question: 'Q3', choix: ['Oui', 'Non'], reponse: 'oui' },
      ],
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erreurs).toHaveLength(1);
    expect(r.erreurs[0]).toMatch(/^quiz\[2\]\.reponse : doit être exactement l'un des choix/);
  });

  it('exige 2 à 6 choix', () => {
    const un = validerCours({ ...minimal, quiz: [{ question: 'Q', choix: ['a'], reponse: 'a' }] });
    const sept = validerCours({ ...minimal, quiz: [{ question: 'Q', choix: ['a', 'b', 'c', 'd', 'e', 'f', 'g'], reponse: 'a' }] });
    expect(un.ok || sept.ok).toBe(false);
    if (!un.ok) expect(un.erreurs[0]).toContain('quiz[0].choix');
    if (!sept.ok) expect(sept.erreurs[0]).toContain('6 choix maximum');
  });

  it('limite essentiel à 400 caractères et titre à 90', () => {
    const r = validerCours({ ...minimal, titre: 't'.repeat(91), essentiel: 'e'.repeat(401) });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erreurs).toContain('titre : 90 caractères maximum (actuellement 91)');
    expect(r.erreurs).toContain('essentiel : 400 caractères maximum (actuellement 401)');
  });

  it('signale les champs obligatoires manquants en français', () => {
    const r = validerCours({});
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erreurs).toEqual(
      expect.arrayContaining(['titre : champ obligatoire', 'matiere : champ obligatoire', 'essentiel : champ obligatoire']),
    );
  });

  it('tolère (et ignore) les champs inconnus', () => {
    const r = validerCours({ ...minimal, slug: 'autre', inventeParUneIA: 42 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data).not.toHaveProperty('inventeParUneIA');
    expect(r.data).not.toHaveProperty('slug');
  });

  it('accepte la date en chaîne ou en Date, et la renvoie en AAAA-MM-JJ', () => {
    const chaine = validerCours({ ...minimal, date: '2026-09-23' });
    const date = validerCours({ ...minimal, date: new Date('2026-09-23T00:00:00Z') });
    expect(chaine.ok && chaine.data.date).toBe('2026-09-23');
    expect(date.ok && date.data.date).toBe('2026-09-23');
    const fausse = validerCours({ ...minimal, date: '2026-02-31' });
    expect(fausse.ok).toBe(false);
  });

  it('tolère accents et majuscules dans les listes fermées', () => {
    const r = validerCours({ ...minimal, niveau: 'Débutant', type: 'Mémo', projet: { statut: 'En cours' } });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.niveau).toBe('debutant');
    expect(r.data.type).toBe('memo');
    expect(r.data.projet?.statut).toBe('en-cours');
  });

  it('refuse un slug de matière invalide et un lien de repo invalide', () => {
    const r = validerCours({ ...minimal, matiere: 'HTML CSS', projet: { repo: 'github.com/x' } });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erreurs.some((e) => e.startsWith('matiere :'))).toBe(true);
    expect(r.erreurs.some((e) => e.startsWith('projet.repo :'))).toBe(true);
  });

  it('refuse un frontmatter qui n’est pas un objet', () => {
    expect(validerCours(null).ok).toBe(false);
    expect(validerCours(['a']).ok).toBe(false);
  });
});

describe('validerMatiere', () => {
  it('accepte une matière et applique les valeurs par défaut', () => {
    const r = validerMatiere({ nom: 'React', kanji: '応' });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.couleur).toBe('sumi');
    expect(r.data.ordre).toBe(99);
  });

  it('exige un seul kanji et une couleur connue', () => {
    const r = validerMatiere({ nom: 'React', kanji: '応用', couleur: 'violet' });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erreurs[0]).toMatch(/^kanji :/);
    expect(r.erreurs[1]).toMatch(/^couleur :/);
  });
});

describe('outils', () => {
  it('formate les chemins de champ', () => {
    expect(formaterChemin(['quiz', 2, 'reponse'])).toBe('quiz[2].reponse');
    expect(formaterChemin(['projet', 'stack', 0])).toBe('projet.stack[0]');
  });

  it('SLUG_RE suit le contrat', () => {
    expect(SLUG_RE.test('html-css')).toBe(true);
    expect(SLUG_RE.test('06-usestate')).toBe(true);
    expect(SLUG_RE.test('Html')).toBe(false);
    expect(SLUG_RE.test('a--b')).toBe(false);
  });
});
