import { describe, expect, it } from 'vitest';
import { rendreMarkdown } from '../src/lib/markdown/pipeline.ts';

const BASE = '/Cours-Dev-Code';
const rendre = (md: string) => rendreMarkdown(md, BASE);

describe('blocs (:::nom)', () => {
  it('rend un bloc connu avec son kanji, son libellé et son corps', async () => {
    const html = await rendre(':::quoi\nUn **événement**.\n:::');
    expect(html).toContain('<aside class="bloc bloc--quoi" data-bloc="quoi">');
    expect(html).toContain('<span class="kanji" lang="ja" aria-hidden="true" title="nani — quoi">何</span>');
    expect(html).toContain('<span class="bloc__titre">Quoi</span>');
    expect(html).toContain('<div class="bloc__corps">');
    expect(html).toContain('<strong>événement</strong>');
  });

  it('rend tous les blocs du contrat', async () => {
    for (const [nom, kanji] of [
      ['exemple', '例'],
      ['piege', '罠'],
      ['ou', '場'],
      ['astuce', '技'],
      ['info', '知'],
      ['attention', '注'],
      ['retenir', '覚'],
    ]) {
      const html = await rendre(`:::${nom}\nTexte.\n:::`);
      expect(html, nom).toContain(`bloc--${nom}`);
      expect(html, nom).toContain(`>${kanji}</span>`);
    }
  });

  it('utilise le titre personnalisé :::ou[…]', async () => {
    const html = await rendre(':::ou[Dans *mon-blog*]\nLe bouton.\n:::');
    expect(html).toContain('<span class="bloc__titre">Dans <em>mon-blog</em></span>');
    expect(html).not.toContain('Où ça sert');
  });

  it('affiche un bloc inconnu comme « info », sans erreur', async () => {
    const html = await rendre(':::nuage\nBloc inconnu.\n:::');
    expect(html).toContain('bloc--info');
    expect(html).toContain('<span class="bloc__titre">Info</span>');
  });

  it('garde le code dans un bloc', async () => {
    const html = await rendre(':::exemple\n```jsx title="App.jsx"\n<button />\n```\n:::');
    expect(html).toContain('<figure class="code" data-lang="jsx"><figcaption class="code__titre">App.jsx</figcaption>');
    expect(html).not.toContain('metastring');
  });
});

describe('directives non gérées → texte brut', () => {
  it('laisse « C:\\Users » et « 10:30 » intacts', async () => {
    const html = await rendre('Le dossier C:\\Users\\jonat, à 10:30.');
    expect(html).toBe('<p>Le dossier C:\\Users\\jonat, à 10:30.</p>');
  });

  it('remet « a:hover » et « localhost:abc[x]{y=1} » à l’identique', async () => {
    const html = await rendre('Le sélecteur a:hover et localhost:abc[x]{y=1}.');
    expect(html).toBe('<p>Le sélecteur a:hover et localhost:abc[x]{y=1}.</p>');
  });

  it('remet une directive feuille inconnue en paragraphe', async () => {
    const html = await rendre('::truc{a=1}');
    expect(html).toBe('<p>::truc{a=1}</p>');
  });
});

describe('::pdf', () => {
  it('rend une visionneuse avec repli et lien, base préfixée', async () => {
    const html = await rendre('::pdf{src="/media/react/slides.pdf" titre="Slides"}');
    expect(html).toContain('<figure class="doc-pdf" data-pdf="/media/react/slides.pdf">');
    expect(html).toContain('<object class="doc-pdf__vue" data="/Cours-Dev-Code/media/react/slides.pdf" type="application/pdf" aria-label="Slides">');
    expect(html).toContain('Ouvrir le PDF');
    expect(html).toContain('target="_blank" rel="noopener"');
  });

  it('sans src : laissé en texte', async () => {
    const html = await rendre('::pdf{titre="Slides"}');
    expect(html).toBe('<p>::pdf{titre="Slides"}</p>');
  });
});

describe('assainissement et liens', () => {
  it('retire les scripts, les on* et javascript:', async () => {
    const html = await rendre('<script>alert(1)</script>\n\n<a href="javascript:alert(1)" onclick="x()">lien</a> <img src="x.png" onerror="alert(1)">');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('alert');
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('onerror');
    expect(html).toContain('<a>lien</a>');
  });

  it('garde le HTML sûr (details, kbd)', async () => {
    const html = await rendre('<details><summary>Voir</summary>caché</details>\n\nTouche <kbd>Ctrl</kbd>');
    expect(html).toContain('<details><summary>Voir</summary>caché</details>');
    expect(html).toContain('<kbd>Ctrl</kbd>');
  });

  it('préfixe la base aux chemins absolus, pas aux liens externes', async () => {
    const html = await rendre('![Schéma](/media/react/schema.png) [doc](https://react.dev) [ici](/tomes/) [déjà](/Cours-Dev-Code/x/)');
    expect(html).toContain('src="/Cours-Dev-Code/media/react/schema.png"');
    expect(html).toContain('href="https://react.dev"');
    expect(html).toContain('href="/Cours-Dev-Code/tomes/"');
    expect(html).toContain('href="/Cours-Dev-Code/x/"');
  });
});

describe('notions (##)', () => {
  it('donne des ids lisibles et uniques, et enveloppe chaque ## dans une section', async () => {
    const html = await rendre('Intro.\n\n## Réagir à un clic\n\nA.\n\n## Réagir à un clic\n\nB.\n\n## Quiz\n\nC.');
    expect(html).toContain('<section class="notion" data-notion="reagir-a-un-clic"><h2 id="reagir-a-un-clic">');
    expect(html).toContain('<h2 id="reagir-a-un-clic-2">');
    // « quiz » est réservé par la page du cours.
    expect(html).toContain('<h2 id="quiz-2">');
    expect(html.startsWith('<p>Intro.</p>')).toBe(true);
  });

  it('enveloppe les tableaux pour le défilement mobile', async () => {
    const html = await rendre('| a | b |\n| - | - |\n| 1 | 2 |');
    expect(html).toContain('<div class="tableau" tabindex="0" role="region" aria-label="Tableau (défilable)"><table>');
  });
});
