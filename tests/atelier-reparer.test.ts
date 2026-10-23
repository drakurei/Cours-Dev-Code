import { describe, expect, it } from 'vitest';
import { reparerCours, extraireFichier } from '../src/lib/atelier/reparer.ts';
import { diagnostiquer } from '../src/lib/atelier/analyse.ts';

// Un cours valide, tel que PROMPT-COURS.md le demande (contient des blocs ``` à l'intérieur).
const COURS = [
  '---',
  '# fichier : 06-usestate.md',
  'titre: "useState : l\'état d\'un composant"',
  'matiere: react',
  'type: cours',
  'niveau: debutant',
  'essentiel: "useState crée une valeur que React surveille."',
  'flashcards:',
  '  - q: "Que fait setCompte(5) ?"',
  '    r: "Met l\'état à 5."',
  'quiz:',
  '  - question: "Quel hook crée un état ?"',
  '    choix:',
  '      - "useState"',
  '      - "useEffect"',
  '    reponse: "useState"',
  'exercices:',
  '  - titre: "Un compteur"',
  '    enonce: "Crée un compteur."',
  '    solution: |',
  '      ```jsx',
  '      const [n, setN] = useState(0)',
  '      ```',
  '      - Étape : appeler setN.',
  '---',
  '',
  '## Créer un état',
  '',
  ':::quoi',
  '**useState** crée un état.',
  ':::',
  '',
  ':::exemple',
  '```jsx',
  'const [n, setN] = useState(0)',
  '```',
  ':::',
  '',
].join('\n');

const valide = (texte: string) => diagnostiquer(texte).ok;

describe('reparerCours : sorties réelles d’IA', () => {
  it('ne touche pas à un fichier déjà propre (idempotent)', () => {
    const r = reparerCours(COURS);
    expect(r.corrections).toEqual([]);
    expect(r.texte).toBe(COURS);
    expect(r.nomConseille).toBe('06-usestate.md');
    expect(reparerCours(r.texte).texte).toBe(r.texte);
  });

  it('1. bloc ````markdown avec du texte avant et après (ChatGPT)', () => {
    const brut = `Voici ton fichier de révision :\n\n\`\`\`\`markdown\n${COURS}\`\`\`\`\n\nN'hésite pas si tu veux plus d'exercices !`;
    const r = reparerCours(brut);
    expect(r.texte).toBe(COURS);
    expect(r.corrections).toEqual(expect.arrayContaining(['bloc ````markdown retiré', 'texte avant le cours retiré', 'texte après le cours retiré']));
    expect(valide(r.texte)).toBe(true);
  });

  it('2. bloc à 3 accents graves ```markdown (les ``` internes restent)', () => {
    const r = reparerCours(`\`\`\`markdown\n${COURS}\`\`\``);
    expect(r.texte).toBe(COURS);
    expect(valide(r.texte)).toBe(true);
  });

  it('3. deux blocs : garde le dernier (version corrigée)', () => {
    const v1 = COURS.replace('useState : l\'état', 'Version 1');
    const r = reparerCours(`\`\`\`\`markdown\n${v1}\`\`\`\`\nPetite correction :\n\`\`\`\`markdown\n${COURS}\`\`\`\``);
    expect(r.texte).toBe(COURS);
  });

  it('4. BOM et fins de ligne Windows', () => {
    const r = reparerCours(`\uFEFF${COURS.replace(/\n/g, '\r\n')}`);
    expect(r.texte).toBe(COURS);
    expect(r.corrections).toEqual(expect.arrayContaining(['BOM retiré', 'fins de ligne Windows']));
  });

  it('5. « --- » d’ouverture manquant', () => {
    const r = reparerCours(COURS.replace(/^---\n/, ''));
    expect(r.texte).toBe(COURS);
    expect(r.corrections).toContain('« --- » d’ouverture ajouté');
  });

  it('6. « --- » de fermeture manquant (le YAML s’arrête avant la 1re notion)', () => {
    const r = reparerCours(COURS.replace('---\n\n## Créer', '\n## Créer'));
    expect(r.corrections).toContain('« --- » de fermeture ajouté');
    expect(valide(r.texte)).toBe(true);
  });

  it('7. tabulations dans le YAML', () => {
    const r = reparerCours(COURS.replace('  - q: "Que', '\t- q: "Que').replace('    r: "Met', '\t  r: "Met'));
    expect(r.corrections).toContain('tabulations remplacées par des espaces');
    expect(valide(r.texte)).toBe(true);
  });

  it('8. guillemets typographiques autour des valeurs', () => {
    const r = reparerCours(COURS.replace('essentiel: "useState crée une valeur que React surveille."', 'essentiel: “useState crée une valeur que React surveille.”'));
    expect(r.corrections).toContain('guillemets typographiques remplacés');
    expect(r.texte).toBe(COURS);
  });

  it('9. guillemets doubles et barres obliques non échappés', () => {
    const casse = COURS.replace('titre: "useState : l\'état d\'un composant"', 'titre: "Le mot "const" et C:\\Users"');
    expect(valide(casse)).toBe(false);
    const r = reparerCours(casse);
    expect(r.corrections).toContain('guillemets échappés dans le YAML');
    const d = diagnostiquer(r.texte);
    expect(d.ok).toBe(true);
    expect(d.data?.titre).toBe('Le mot "const" et C:\\Users');
  });

  it('10. « : » dans un texte sans guillemets (typographie française)', () => {
    const casse = COURS.replace('titre: "useState : l\'état d\'un composant"', "titre: useState : l'état d'un composant");
    expect(valide(casse)).toBe(false);
    const r = reparerCours(casse);
    expect(r.corrections).toContain('textes avec « : » mis entre guillemets');
    expect(diagnostiquer(r.texte).data?.titre).toBe("useState : l'état d'un composant");
    // Le bloc « solution: | » n'est pas touché (sa ligne « - Étape : … » reste du texte).
    expect(r.texte).toContain('      - Étape : appeler setN.');
  });

  it('11. copie à la main depuis ChatGPT (« markdown / Copier le code » au-dessus)', () => {
    const r = reparerCours(`markdown\nCopier le code\n${COURS}`);
    expect(r.texte).toBe(COURS);
    expect(r.corrections).toContain('texte avant le cours retiré');
  });

  it('12. « # fichier » écrit avant le « --- »', () => {
    const r = reparerCours(COURS.replace('---\n# fichier : 06-usestate.md\n', '# fichier : 06-usestate.md\n---\n'));
    expect(r.texte).toBe(COURS);
    expect(r.nomConseille).toBe('06-usestate.md');
  });

  it('13. frontmatter rangé dans un bloc ```yaml', () => {
    const [, yaml, corps] = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(COURS) ?? [];
    const r = reparerCours(`Voici le fichier :\n\`\`\`yaml\n---\n${yaml}\n---\n\`\`\`\n${corps}`);
    expect(r.corrections).toContain('clôture ``` en trop retirée');
    expect(valide(r.texte)).toBe(true);
  });

  it('14. espaces insécables avant « : » dans les clés', () => {
    const r = reparerCours(COURS.replace('matiere: react', 'matiere\u00A0: react'));
    expect(r.corrections).toContain('espaces en trop avant « : »');
    expect(r.texte).toBe(COURS);
  });

  it('15. bloc à tildes ~~~~markdown', () => {
    expect(reparerCours(`~~~~markdown\n${COURS}~~~~\n`).texte).toBe(COURS);
  });
});

describe('extraireFichier', () => {
  it('rend le texte tel quel quand il n’y a rien à extraire', () => {
    expect(extraireFichier('bonjour').contenu).toBe('bonjour');
  });
});
