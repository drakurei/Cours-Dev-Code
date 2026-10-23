import { describe, expect, it } from 'vitest';
import { decouperPhrases, PHRASE_CODE, ponctuer, texteAEcouter, type NoeudLecture } from '../src/scripts/lecteur/texte-ecoute.ts';

// Mini DOM : juste ce que lit texteAEcouter (nodeType, nodeName, attributs, enfants).
type Enfant = NoeudLecture | string;

function t(texte: string): NoeudLecture {
  return { nodeType: 3, nodeName: '#text', nodeValue: texte, childNodes: [] };
}

function el(nom: string, attributs: Record<string, string> = {}, ...enfants: Enfant[]): NoeudLecture {
  return {
    nodeType: 1,
    nodeName: nom.toUpperCase(),
    nodeValue: null,
    childNodes: enfants.map((e) => (typeof e === 'string' ? t(e) : e)),
    getAttribute: (n) => (n in attributs ? (attributs[n] ?? null) : null),
    hasAttribute: (n) => n in attributs,
  };
}

/** Un bloc tel que le produit le pipeline Markdown. */
function bloc(type: string, titre: string, ...corps: Enfant[]): NoeudLecture {
  return el(
    'aside',
    { class: `bloc bloc--${type}`, 'data-bloc': type },
    el('p', { class: 'bloc__tete' }, el('span', { class: 'kanji', lang: 'ja', 'aria-hidden': 'true' }, '例'), el('span', { class: 'bloc__titre' }, titre)),
    el('div', { class: 'bloc__corps' }, ...corps),
  );
}

describe('texteAEcouter', () => {
  const notion = el(
    'section',
    { class: 'notion', 'data-notion': 'reagir' },
    el('h2', { id: 'reagir' }, 'Réagir à un clic'),
    el('button', { class: 'btn lecteur-ecouter' }, 'Écouter'),
    bloc('quoi', 'Quoi', el('p', {}, 'Un ', el('strong', {}, 'événement'), ' reçoit une ', el('strong', {}, 'fonction'), '.')),
    bloc(
      'exemple',
      'Exemple',
      el(
        'figure',
        { class: 'code', 'data-lang': 'jsx' },
        el('figcaption', { class: 'code__titre' }, 'App.jsx'),
        el('pre', { class: 'astro-code' }, el('code', {}, '<button onClick={f}>Clique</button>')),
        el('button', { class: 'code__copier' }, 'Copier'),
      ),
    ),
    bloc('piege', 'Piège', el('p', {}, el('code', {}, 'onClick={f()}'), ' exécute la fonction tout de suite')),
    bloc('ou', 'Dans mon-blog', el('ul', {}, el('li', {}, 'Le bouton J’aime'), el('li', {}, 'Le filtre'))),
  );

  it('lit le titre, le texte utile et remplace le code', () => {
    expect(texteAEcouter(notion)).toBe(
      'Réagir à un clic. Un événement reçoit une fonction. Exemple de code. Piège. onClick={f()} exécute la fonction tout de suite. Dans mon-blog. Le bouton J’aime. Le filtre.',
    );
  });

  it('ne lit ni les boutons, ni les kanji, ni les titres de fichier, ni les textes cachés', () => {
    const texte = texteAEcouter(notion);
    for (const absent of ['Écouter', 'Copier', 'App.jsx', '例', 'Quoi.', 'Exemple.']) expect(texte).not.toContain(absent);
    const cache = el('div', {}, el('p', {}, 'Visible'), el('p', { hidden: '' }, 'Caché'), el('span', { class: 'sr-only' }, 'Pour lecteur'), el('p', { 'data-ecoute': 'non' }, 'Non'));
    expect(texteAEcouter(cache)).toBe('Visible.');
  });

  it('dit une seule fois « Exemple de code » pour un bloc pre seul', () => {
    const exemple = bloc('exemple', 'Exemple', el('pre', {}, el('code', {}, 'let a = 1')));
    expect(texteAEcouter(exemple)).toBe(PHRASE_CODE);
  });

  it('lit le texte alternatif des images et saute les renvois de notes', () => {
    const p = el('p', {}, 'Voir le schéma', el('sup', {}, el('a', { 'data-footnote-ref': '', href: '#fn1' }, '1')), el('img', { alt: 'Arbre des composants', src: 'x.png' }));
    expect(texteAEcouter(p)).toBe('Voir le schéma. Image : Arbre des composants.');
  });

  it('écarte ce qui n’est pas affiché quand on le précise', () => {
    const fin = el('section', {}, el('h2', {}, 'Fin du cours'), el('p', { class: 'avant' }, 'Tamponne le cours'), el('p', { class: 'apres' }, 'Cours tamponné'));
    const visible = (n: NoeudLecture) => n.getAttribute?.('class') !== 'apres';
    expect(texteAEcouter(fin, visible)).toBe('Fin du cours. Tamponne le cours.');
    // La racine est toujours lue, même si le test de visibilité la refuse.
    expect(texteAEcouter(el('p', { class: 'apres' }, 'Seul'), visible)).toBe('Seul.');
  });

  it('garde la ponctuation existante et ignore le vide', () => {
    expect(texteAEcouter(el('div', {}, el('p', {}, 'Vraiment ?'), el('p', {}, '   '), el('p', {}, 'Oui !')))).toBe('Vraiment ? Oui !');
    expect(texteAEcouter(el('div'))).toBe('');
  });
});

describe('ponctuer', () => {
  it('ajoute un point seulement si besoin', () => {
    expect(ponctuer('Bonjour')).toBe('Bonjour.');
    expect(ponctuer('Bonjour.')).toBe('Bonjour.');
    expect(ponctuer('Exemple :')).toBe('Exemple :');
    expect(ponctuer('  ')).toBe('');
  });
});

describe('decouperPhrases', () => {
  it('regroupe les phrases courtes jusqu’à la limite', () => {
    expect(decouperPhrases('Un. Deux. Trois.', 10)).toEqual(['Un. Deux.', 'Trois.']);
    expect(decouperPhrases('Une phrase. Une autre.', 200)).toEqual(['Une phrase. Une autre.']);
  });

  it('coupe une phrase trop longue sur une virgule ou un espace', () => {
    const longue = `${'mot '.repeat(30)}fin, ${'suite '.repeat(10)}.`;
    const morceaux = decouperPhrases(longue, 60);
    expect(morceaux.length).toBeGreaterThan(1);
    for (const m of morceaux) expect(m.length).toBeLessThanOrEqual(60);
    expect(morceaux.join(' ').replace(/\s+/g, ' ')).toBe(longue.replace(/\s+/g, ' ').trim());
  });

  it('renvoie une liste vide pour un texte vide', () => {
    expect(decouperPhrases('   ')).toEqual([]);
  });
});
