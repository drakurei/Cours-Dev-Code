import MiniSearch from 'minisearch';
import { describe, expect, it } from 'vitest';
import {
  baseTerme,
  cleTerme,
  correspond,
  motsRequete,
  precisionTerme,
  traiterTerme,
} from '../src/lib/recherche/normaliser.ts';
import {
  construireIndex,
  decoderEntites,
  extraireNotions,
  markdownVersTexte,
  texteBrutHtml,
  type CoursSource,
} from '../src/lib/recherche/documents.ts';
import {
  chercher,
  compterResultats,
  creerMoteur,
  decouper,
  grouper,
  partiesCamel,
  rechercheSimple,
  rechercher,
  termesIndex,
} from '../src/lib/recherche/moteur.ts';
import { extrait, plages, surligner } from '../src/lib/recherche/surligner.ts';
import { ajouterRecente, CLE_RECENTES, ecrireRecentes, lireRecentes } from '../src/lib/recherche/recents.ts';
import type { DocRecherche } from '../src/lib/recherche/types.ts';

// ─── Normalisation ───────────────────────────────────────────────────────────

describe('normalisation', () => {
  it('ignore accents et majuscules, retire les mots vides', () => {
    expect(traiterTerme('État')).toBe('etat');
    expect(traiterTerme('Élément')).toBe('element');
    expect(traiterTerme('de')).toBeNull();
    expect(traiterTerme('  ')).toBeNull();
    expect(motsRequete("L'état d'un composant")).toEqual(['etat', 'composant']);
    expect(motsRequete('  useState   ')).toEqual(['usestate']);
  });

  it('teste la présence de tous les mots', () => {
    expect(correspond('etat (state) une valeur que react surveille', ['etat', 'react'])).toBe(true);
    expect(correspond('etat (state)', ['etat', 'vue'])).toBe(false);
    expect(correspond('peu importe', [])).toBe(true);
  });

  it('calcule la clé, la base et la précision d’un terme', () => {
    expect(cleTerme('État (state)')).toBe('etat');
    expect(cleTerme('état')).toBe('etat');
    expect(cleTerme('.map()')).toBe('map');
    expect(cleTerme('Pull Request (PR)')).toBe(cleTerme('Pull request (PR)'));
    expect(cleTerme("Remonter l'état (lifting state up)")).toBe('remonter l etat');
    expect(cleTerme('C#')).toBe('c#');
    expect(cleTerme('===')).toBe('===');
    expect(baseTerme('Product Owner (PO)')).toBe('Product Owner');
    expect(baseTerme('translate()')).toBe('translate');
    expect(precisionTerme('Itération (prompt)')).toBe('prompt');
    expect(precisionTerme('Hook')).toBe('');
  });
});

// ─── Texte brut et notions ───────────────────────────────────────────────────

describe('texte brut', () => {
  it('décode les entités', () => {
    expect(decoderEntites('l&#39;état &amp; &lt;div&gt; &#x2019; &nbsp;fin')).toBe('l\'état & <div> ’  fin');
  });

  it('retire en-têtes de blocs, code, titres et balises', () => {
    const html =
      '<section class="notion" data-notion="a"><h2 id="a">Titre</h2>' +
      '<aside class="bloc bloc--quoi"><p class="bloc__tete"><span class="kanji">何</span><span>Quoi</span></p>' +
      '<div class="bloc__corps"><p>Un <strong>état</strong> change , vraiment .</p></div></aside>' +
      '<figure class="code"><figcaption>App.jsx</figcaption><pre><code>const x = 1</code></pre></figure></section>';
    expect(texteBrutHtml(html)).toBe('Un état change, vraiment.');
  });

  it('transforme le Markdown en texte', () => {
    expect(markdownVersTexte('Le **hook** `useState` et [la doc](https://react.dev).')).toBe('Le hook useState et la doc.');
    expect(markdownVersTexte('max_tokens reste intact')).toBe('max_tokens reste intact');
    expect(markdownVersTexte('*important* et _ici_')).toBe('important et ici');
    expect(markdownVersTexte(undefined)).toBe('');
  });

  it('extrait les notions (ancre, titre, texte) dans l’ordre', () => {
    const html =
      '<p>intro</p><section class="notion" data-notion="reagir-a-un-clic"><h2 id="reagir-a-un-clic">Réagir à un <code>clic</code></h2><p>Texte A.</p></section>' +
      '<section class="notion" data-notion="l-etat"><h2 id="l-etat">L&#39;état</h2><p>Texte B.</p></section>';
    expect(extraireNotions(html)).toEqual([
      { ancre: 'reagir-a-un-clic', titre: 'Réagir à un clic', texte: 'Texte A.' },
      { ancre: 'l-etat', titre: "L'état", texte: 'Texte B.' },
    ]);
    expect(extraireNotions('<p>rien</p>')).toEqual([]);
  });
});

// ─── Construction de l'index ─────────────────────────────────────────────────

const COURS: CoursSource[] = [
  {
    id: 'react/06-usestate',
    url: '/base/cours/react/06-usestate/',
    titre: 'Événements et useState',
    matiere: 'react',
    chapitre: 6,
    duree: 11,
    essentiel: 'Une valeur qui change à l’écran doit être un **état** créé avec `useState`.',
    retenir: ['On ne modifie jamais l’état directement.'],
    tags: ['hooks', 'state'],
    definitions: [
      { terme: 'État (state)', definition: 'Une valeur que React surveille.', exemple: 'const [compte, setCompte] = useState(0)' },
      { terme: 'Hook', definition: 'Une fonction React qui commence par use.' },
    ],
    html:
      '<section class="notion" data-notion="reagir-a-un-evenement"><h2 id="reagir-a-un-evenement">Réagir à un événement</h2><p>Un événement s’écrit onClick.</p></section>' +
      '<section class="notion" data-notion="l-input-controle"><h2 id="l-input-controle">L’input contrôlé</h2><p>value et onChange, avec localStorage.</p></section>',
  },
  {
    id: 'javascript/07-le-dom',
    url: '/base/cours/javascript/07-le-dom/',
    titre: 'Le DOM',
    matiere: 'javascript',
    chapitre: 7,
    duree: 9,
    essentiel: 'Le DOM est la page vue par JavaScript : on la lit avec getElementById.',
    definitions: [{ terme: 'DOM', definition: 'L’arbre des éléments de la page.' }],
    sections: [{ id: 'selectionner', titre: 'Sélectionner un élément' }],
  },
];

const MATIERES = [
  { slug: 'react', nom: 'React', kanji: '応', couleur: 'ai' as const, url: '/base/tomes/react/', ordre: 2, description: 'Les composants.', nbCours: 1 },
  { slug: 'javascript', nom: 'JavaScript', kanji: '動', couleur: 'yamabuki' as const, url: '/base/tomes/javascript/', ordre: 3, nbCours: 1 },
];

const INDEX = construireIndex({
  cours: COURS,
  matieres: MATIERES,
  pages: [{ cle: 'glossaire', url: '/base/glossaire/' }, { cle: 'reglages', url: '/base/reglages/' }],
  genere: '2026-10-08T00:00:00.000Z',
});

describe('construction de l’index', () => {
  it('produit cours, notions, définitions, tomes et pages', () => {
    expect(INDEX.version).toBe(1);
    expect(INDEX.genere).toBe('2026-10-08T00:00:00.000Z');
    expect(INDEX.matieres.react).toEqual({ nom: 'React', kanji: '応', couleur: 'ai' });
    const parType = (t: string) => INDEX.documents.filter((d) => d.type === t).map((d) => d.id);
    expect(parType('cours')).toEqual(['cours:react/06-usestate', 'cours:javascript/07-le-dom']);
    expect(parType('notion')).toEqual([
      'notion:react/06-usestate#reagir-a-un-evenement',
      'notion:react/06-usestate#l-input-controle',
      'notion:javascript/07-le-dom#selectionner',
    ]);
    expect(parType('definition')).toEqual(['definition:react/06-usestate:0', 'definition:react/06-usestate:1', 'definition:javascript/07-le-dom:0']);
    expect(parType('page')).toEqual(['page:glossaire', 'page:reglages', 'tome:react', 'tome:javascript']);
  });

  it('remplit chaque document avec liens et ancres', () => {
    const cours = INDEX.documents.find((d) => d.id === 'cours:react/06-usestate');
    expect(cours?.notions).toEqual([
      { titre: 'Réagir à un événement', ancre: 'reagir-a-un-evenement' },
      { titre: 'L’input contrôlé', ancre: 'l-input-controle' },
    ]);
    expect(cours?.texte.startsWith('Une valeur qui change à l’écran doit être un état créé avec useState.')).toBe(true);
    expect(cours?.motsCles).toContain('React');
    expect(cours?.motsCles).toContain('hooks');
    expect(cours?.motsCles).toContain('L’input contrôlé');

    const notion = INDEX.documents.find((d) => d.id === 'notion:react/06-usestate#l-input-controle');
    expect(notion).toMatchObject({ url: '/base/cours/react/06-usestate/#l-input-controle', coursTitre: 'Événements et useState', chapitre: 6, matiere: 'react' });

    const def = INDEX.documents.find((d) => d.id === 'definition:react/06-usestate:0');
    expect(def).toMatchObject({ titre: 'État (state)', url: '/base/cours/react/06-usestate/#definitions', texte: 'Une valeur que React surveille.', exemple: 'const [compte, setCompte] = useState(0)' });

    const tome = INDEX.documents.find((d) => d.id === 'tome:react');
    expect(tome).toMatchObject({ titre: 'React', kanji: '応', detail: 'Tome 2 · 1 épisode', url: '/base/tomes/react/' });
  });

  it('a des ids uniques et se sérialise en JSON', () => {
    const ids = INDEX.documents.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(JSON.parse(JSON.stringify(INDEX))).toEqual(INDEX);
  });
});

// ─── Moteur ──────────────────────────────────────────────────────────────────

const ACTION: DocRecherche = { id: 'action:theme-sombre', type: 'action', titre: 'Thème sombre', url: '', texte: '', motsCles: 'theme sombre nuit dark' };
const moteur = creerMoteur(MiniSearch, [...INDEX.documents, ACTION]);

describe('découpage', () => {
  it('coupe sur tout ce qui n’est ni lettre ni chiffre', () => {
    expect(decouper('e.target.value, <button>')).toEqual(['e', 'target', 'value', 'button']);
    expect(partiesCamel('getElementById')).toEqual(['get', 'Element', 'By', 'Id']);
    expect(termesIndex('useState')).toEqual(['usestate', 'use', 'state']);
    expect(termesIndex('DOM')).toEqual(['dom']);
    expect(termesIndex('la')).toBeNull();
  });
});

describe('recherche', () => {
  it('ignore les accents dans la requête et dans l’index', () => {
    const ids = rechercher(moteur, 'etat').map((r) => r.doc.id);
    expect(ids).toContain('definition:react/06-usestate:0');
    expect(rechercher(moteur, 'ÉVÉNEMENT')[0]?.doc.id).toMatch(/react\/06-usestate/);
  });

  it('cherche par préfixe et avec une faute de frappe', () => {
    expect(rechercher(moteur, 'usest').map((r) => r.doc.id)).toContain('cours:react/06-usestate');
    expect(rechercher(moteur, 'localstorag').map((r) => r.doc.id)).toContain('notion:react/06-usestate#l-input-controle');
    expect(rechercher(moteur, 'evenemnt').length).toBeGreaterThan(0);
  });

  it('trouve un mot à l’intérieur d’un camelCase', () => {
    expect(rechercher(moteur, 'storage').map((r) => r.doc.id)).toContain('notion:react/06-usestate#l-input-controle');
  });

  it('passe en OU quand le ET ne donne rien', () => {
    expect(rechercher(moteur, 'dom zzzzqqq').map((r) => r.doc.id)).toContain('definition:javascript/07-le-dom:0');
  });

  it('groupe les résultats dans un ordre fixe, meilleur résultat en tête', () => {
    const groupes = chercher(moteur, 'dom');
    expect(groupes[0]?.cle).toBe('meilleur');
    const cles = groupes.slice(1).map((g) => g.cle);
    const ordre = ['cours', 'notion', 'definition', 'page', 'action'];
    expect([...cles].sort((a, b) => ordre.indexOf(a) - ordre.indexOf(b))).toEqual(cles);
    expect(compterResultats(groupes)).toBe(rechercher(moteur, 'dom').length);
  });

  it('respecte le filtre et les limites', () => {
    const sansDefinitions = chercher(moteur, 'etat', { filtre: (d) => d.type !== 'definition', meilleur: false });
    expect(sansDefinitions.some((g) => g.cle === 'definition')).toBe(false);
    const limite = grouper(rechercher(moteur, 'react'), { limites: { notion: 1 }, meilleur: false });
    expect(limite.find((g) => g.cle === 'notion')?.resultats.length ?? 0).toBeLessThanOrEqual(1);
  });

  it('trouve les actions par synonyme', () => {
    expect(rechercher(moteur, 'nuit')[0]?.doc.id).toBe('action:theme-sombre');
  });

  it('a un repli simple sans MiniSearch', () => {
    const docs = [ACTION, ...INDEX.documents.filter((d) => d.type === 'page')];
    expect(rechercheSimple(docs, 'dark').map((r) => r.doc.id)).toEqual(['action:theme-sombre']);
    expect(rechercheSimple(docs, 'parametres').map((r) => r.doc.id)).toEqual(['page:reglages']);
    expect(rechercheSimple(docs, '')).toEqual([]);
  });
});

// ─── Surlignage ──────────────────────────────────────────────────────────────

describe('surlignage', () => {
  it('surligne malgré les accents', () => {
    expect(surligner('État (state)', ['etat'])).toEqual([
      { texte: 'État', marque: true },
      { texte: ' (state)', marque: false },
    ]);
  });

  it('ne surligne que le préfixe tapé et seulement en début de mot', () => {
    expect(surligner('Le useState de React', ['usestate'], ['uses'])).toEqual([
      { texte: 'Le ', marque: false },
      { texte: 'useS', marque: true },
      { texte: 'tate de React', marque: false },
    ]);
    expect(plages('pause', ['use'])).toEqual([]);
  });

  it('suit les frontières camelCase et fusionne les chevauchements', () => {
    expect(plages('localStorage', ['storage'])).toEqual([[5, 12]]);
    expect(plages('react reactif', ['react', 'reactif'])).toEqual([[0, 5], [6, 13]]);
  });

  it('fait un extrait centré sur la correspondance', () => {
    const texte = `${'mot '.repeat(60)}cible au milieu ${'fin '.repeat(40)}`.trim();
    const e = extrait(texte, ['cible'], 80);
    expect(e.startsWith('…')).toBe(true);
    expect(e.endsWith('…')).toBe(true);
    expect(e).toContain('cible');
    expect(e.length).toBeLessThanOrEqual(84);
    expect(extrait('court', ['x'], 80)).toBe('court');
  });
});

// ─── Recherches récentes ─────────────────────────────────────────────────────

describe('recherches récentes', () => {
  it('ajoute en tête, sans doublon, avec un maximum', () => {
    expect(ajouterRecente(['hook', 'dom'], 'Dom')).toEqual(['Dom', 'hook']);
    expect(ajouterRecente(['a', 'b', 'c', 'd', 'e'], 'f')).toEqual(['f', 'a', 'b', 'c', 'd']);
    expect(ajouterRecente(['a'], '   ')).toEqual(['a']);
  });

  it('lit et écrit sans jamais lever d’erreur', () => {
    const donnees = new Map<string, string>();
    const stockage = {
      getItem: (k: string) => donnees.get(k) ?? null,
      setItem: (k: string, v: string) => void donnees.set(k, v),
      removeItem: (k: string) => void donnees.delete(k),
    };
    ecrireRecentes(['etat', 'hook'], stockage);
    expect(lireRecentes(stockage)).toEqual(['etat', 'hook']);
    donnees.set(CLE_RECENTES, '{abîmé');
    expect(lireRecentes(stockage)).toEqual([]);
    ecrireRecentes([], stockage);
    expect(donnees.has(CLE_RECENTES)).toBe(false);
    const casse = {
      getItem: () => {
        throw new Error('privé');
      },
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {},
    };
    expect(lireRecentes(casse)).toEqual([]);
    expect(() => ecrireRecentes(['x'], casse)).not.toThrow();
    expect(lireRecentes(null)).toEqual([]);
  });
});
