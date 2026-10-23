import { describe, expect, it } from 'vitest';
import {
  ajouterFichiers,
  choisirNumero,
  completerMatiere,
  nomMedia,
  numerosPris,
  preparerFichierFinal,
  prochainNumero,
  retirerCle,
  slugDuCours,
  titreMedia,
  yamlMatiere,
} from '../src/lib/atelier/fichier.ts';
import { base64VersTexte, octetsVersBase64, tailleDecodee, tailleLisible, texteVersBase64, base64VersOctets } from '../src/lib/atelier/base64.ts';
import { diagnostiquer } from '../src/lib/atelier/analyse.ts';
import { validerMatiere } from '../src/lib/schema.ts';
import { parse } from 'yaml';

describe('prochain numéro', () => {
  it('max + 1, à partir de noms de fichiers ou d’ids', () => {
    expect(prochainNumero(['01-intro.md', '02-jsx.md', '09-recap-mon-blog.md', 'README.md'])).toBe(10);
    expect(prochainNumero(['react/01-intro', 'react/06-usestate'])).toBe(7);
    expect(prochainNumero([])).toBe(1);
    expect([...numerosPris(['03-a.md', 'x.md', '3-b.md'])]).toEqual([3]);
  });

  it('garde le chapitre de l’IA s’il est libre', () => {
    const noms = ['01-a.md', '02-b.md', '05-c.md'];
    expect(choisirNumero(4, noms)).toBe(4);
    expect(choisirNumero('4', noms)).toBe(4);
    expect(choisirNumero(2, noms)).toBe(6); // pris
    expect(choisirNumero(undefined, noms)).toBe(6);
    expect(choisirNumero(0, noms)).toBe(6);
    expect(choisirNumero(150, noms)).toBe(6);
  });

  it('slug : celui conseillé par l’IA, sinon depuis le titre (5 mots)', () => {
    expect(slugDuCours('06-usestate.md', 'peu importe')).toBe('usestate');
    expect(slugDuCours(null, "useState : l'état d'un composant React")).toBe('usestate-l-etat-d-un');
    expect(slugDuCours(null, '???')).toBe('cours');
  });
});

describe('base64 UTF-8', () => {
  it('encode et décode les accents, les kanji et les emoji', () => {
    const texte = 'Été 学び — « guillemets » 🎴 \n fin';
    const b64 = texteVersBase64(texte);
    expect(b64).toBe(Buffer.from(texte, 'utf8').toString('base64'));
    expect(base64VersTexte(b64)).toBe(texte);
  });

  it('gère les gros fichiers binaires sans dépasser la pile', () => {
    const octets = new Uint8Array(300_000).map((_, i) => i % 256);
    const b64 = octetsVersBase64(octets);
    expect(b64).toBe(Buffer.from(octets).toString('base64'));
    expect(base64VersOctets(b64)).toEqual(octets);
    expect(tailleDecodee(b64)).toBe(300_000);
  });

  it('tolère les retours à la ligne de GitHub et formate les tailles', () => {
    expect(base64VersTexte('w6l0\nw6k=')).toBe('été');
    expect(tailleLisible(512)).toBe('512 o');
    expect(tailleLisible(2048)).toBe('2 Ko');
    expect(tailleLisible(1.5 * 1024 * 1024)).toBe('1,5 Mo');
  });
});

const COURS = [
  '---',
  '# fichier : 01-docker.md',
  'titre: "Docker : les conteneurs"',
  'matiere: docker',
  'chapitre: 1',
  'essentiel: "Un conteneur emballe une application."',
  'nouvelleMatiere:',
  '  nom: "Docker"',
  '  kanji: "箱"',
  '  lecture: "hako — la boîte"',
  '  couleur: sora',
  '  description: "Emballer et lancer des applications."',
  'tags: [docker]',
  '---',
  '',
  '## Un conteneur',
  '',
  ':::quoi',
  'Une **boîte**.',
  ':::',
  '',
].join('\n');

describe('fichier final', () => {
  it('met à jour « # fichier », le chapitre, retire nouvelleMatiere et ajoute les fichiers joints', () => {
    const final = preparerFichierFinal(COURS, {
      numero: 3,
      slug: 'docker',
      chapitre: 1,
      fichiers: [{ titre: 'Slides (PDF)', chemin: '/media/docker/03-slides.pdf' }],
    });
    expect(final).toContain('# fichier : 03-docker.md');
    expect(final).toContain('chapitre: 3');
    expect(final).not.toContain('nouvelleMatiere');
    expect(final).toContain('tags: [docker]');
    const d = diagnostiquer(final);
    expect(d.ok).toBe(true);
    expect(d.data?.fichiers).toEqual([{ titre: 'Slides (PDF)', chemin: '/media/docker/03-slides.pdf' }]);
    expect(d.data?.chapitre).toBe(3);
  });

  it('ajoute « # fichier » s’il manque et garde les fichiers déjà listés', () => {
    const sans = COURS.replace('# fichier : 01-docker.md\n', '');
    const final = preparerFichierFinal(sans, {
      numero: 2,
      slug: 'docker',
      fichiersExistants: [{ titre: 'Ancien', chemin: '/media/docker/ancien.png' }],
      fichiers: [{ titre: 'Nouveau', chemin: '/media/docker/02-nouveau.png' }],
    });
    expect(final.split('\n')[1]).toBe('# fichier : 02-docker.md');
    expect(diagnostiquer(final).data?.fichiers.map((f) => f.titre)).toEqual(['Ancien', 'Nouveau']);
  });

  it('retirerCle et ajouterFichiers', () => {
    expect(retirerCle('a: 1\nfichiers:\n  - x\nb: 2', 'fichiers')).toBe('a: 1\nb: 2');
    expect(ajouterFichiers('a: 1', [], [])).toBe('a: 1');
  });

  it('noms et titres des fichiers joints', () => {
    expect(nomMedia(7, 'Cours React 07.PDF')).toBe('07-cours-react-07.pdf');
    expect(nomMedia(7, 'photo.jpeg', ['07-photo.jpg'])).toBe('07-photo-2.jpg');
    expect(titreMedia('cours-react_07.pdf')).toBe('Cours react 07 (PDF)');
    expect(titreMedia('tableau.png')).toBe('Tableau (image)');
  });
});

describe('nouvelle matière', () => {
  it('reprend nouvelleMatiere de l’IA et donne un YAML valide', () => {
    const brut = parse(/^---\n([\s\S]*?)\n---/.exec(COURS)?.[1] ?? '') as Record<string, unknown>;
    const m = completerMatiere('docker', brut.nouvelleMatiere, 8);
    expect(m).toEqual({ nom: 'Docker', kanji: '箱', lecture: 'hako — la boîte', couleur: 'sora', description: 'Emballer et lancer des applications.', ordre: 8 });
    const r = validerMatiere(parse(yamlMatiere(m)));
    expect(r.ok).toBe(true);
  });

  it('valeurs par défaut sûres (kanji de plusieurs caractères, couleur inconnue)', () => {
    const m = completerMatiere('base-de-donnees', { kanji: '箱箱', couleur: 'rouge' }, 9, 'Bases de données');
    expect(m.nom).toBe('Bases de données');
    expect(m.kanji).toBe('B');
    expect(m.couleur).toBe('sumi');
    expect(validerMatiere(parse(yamlMatiere(m))).ok).toBe(true);
  });
});
