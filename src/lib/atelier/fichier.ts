/**
 * Le fichier final d'un cours (Atelier, étape Publier) : numéro NN, nom NN-slug.md,
 * fichiers joints, nouvelle matière. Pur, sans dépendance (testable dans Node).
 * Mêmes règles que scripts/generer-cours.mjs (ecrireCours, creerMatiere).
 */
import { decouper } from './analyse.ts';
import { slugifier } from '../texte.ts';
import { COULEURS, SLUG_RE, type Couleur } from '../schema.ts';

export interface FichierJoint {
  titre: string;
  /** Chemin public : /media/<matiere>/NN-nom.ext */
  chemin: string;
}

export interface NouvelleMatiere {
  nom: string;
  kanji: string;
  lecture: string;
  couleur: Couleur;
  description: string;
  ordre: number;
}

const FICHIER_COURS_RE = /^(\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*(?:\.md)?$/;

export const deuxChiffres = (n: number): string => String(n).padStart(2, '0');

/** Numéros NN déjà pris, à partir de noms de fichiers (« 06-usestate.md ») ou d'ids (« react/06-usestate »). */
export function numerosPris(noms: Iterable<string>): Set<number> {
  const pris = new Set<number>();
  for (const brut of noms) {
    const nom = brut.replace(/\\/g, '/').split('/').pop() ?? '';
    const m = FICHIER_COURS_RE.exec(nom);
    if (m) pris.add(Number(m[1]));
  }
  return pris;
}

/** Prochain numéro libre : le plus grand + 1 (1 si le dossier est vide). */
export function prochainNumero(noms: Iterable<string>): number {
  const pris = numerosPris(noms);
  return pris.size === 0 ? 1 : Math.max(...pris) + 1;
}

/** Le chapitre donné par l'IA s'il est libre (1 à 99), sinon le prochain numéro. */
export function choisirNumero(chapitre: unknown, noms: Iterable<string>): number {
  const pris = numerosPris(noms);
  const n = typeof chapitre === 'number' ? chapitre : typeof chapitre === 'string' ? Number(chapitre) : Number.NaN;
  if (Number.isInteger(n) && n >= 1 && n <= 99 && !pris.has(n)) return n;
  return pris.size === 0 ? 1 : Math.max(...pris) + 1;
}

/** Slug du fichier : celui conseillé par l'IA (« # fichier : 06-usestate.md »), sinon tiré du titre. */
export function slugDuCours(nomConseille: string | null, titre: string): string {
  const conseil = /^\d{2}-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/.exec(nomConseille ?? '')?.[1];
  if (conseil) return conseil;
  const depuisTitre = slugifier(titre).split('-').filter(Boolean).slice(0, 5).join('-');
  return depuisTitre || 'cours';
}

export function nomFichierCours(numero: number, slug: string): string {
  return `${deuxChiffres(numero)}-${slug}.md`;
}

export function cheminCours(matiere: string, nomFichier: string): string {
  return `src/content/cours/${matiere}/${nomFichier}`;
}

export function cheminMatiere(matiere: string): string {
  return `src/content/matieres/${matiere}.yaml`;
}

// ─── YAML brut (lignes) ──────────────────────────────────────────────────────

/** Retire une clé de premier niveau (la ligne « cle: » et ses lignes indentées). */
export function retirerCle(yaml: string, cle: string): string {
  const lignes = yaml.split('\n');
  const debut = lignes.findIndex((l) => new RegExp(`^${cle}\\s*:`).test(l));
  if (debut === -1) return yaml;
  let fin = debut + 1;
  while (fin < lignes.length && (/^\s/.test(lignes[fin] ?? '') || (lignes[fin] ?? '').trim() === '')) fin++;
  // Une ligne vide qui précède la clé suivante reste en place.
  while (fin > debut + 1 && (lignes[fin - 1] ?? '').trim() === '' && fin < lignes.length) fin--;
  lignes.splice(debut, fin - debut);
  return lignes.join('\n');
}

/** Ajoute (ou complète) le champ « fichiers » à la fin du YAML. */
export function ajouterFichiers(yaml: string, existants: FichierJoint[], nouveaux: FichierJoint[]): string {
  if (nouveaux.length === 0) return yaml;
  const lignes = retirerCle(yaml, 'fichiers').split('\n');
  while (lignes.length > 0 && (lignes[lignes.length - 1] ?? '').trim() === '') lignes.pop();
  lignes.push('fichiers:');
  for (const f of [...existants, ...nouveaux]) {
    lignes.push(`  - titre: ${JSON.stringify(f.titre)}`, `    chemin: ${JSON.stringify(f.chemin)}`);
  }
  return lignes.join('\n');
}

export interface OptionsFinal {
  numero: number;
  slug: string;
  /** Fichiers joints envoyés dans public/media/<matiere>/ (ajoutés au champ fichiers). */
  fichiers?: FichierJoint[];
  /** Fichiers déjà listés dans le YAML (gardés). */
  fichiersExistants?: FichierJoint[];
  /** Chapitre écrit par l'IA (corrigé s'il ne correspond pas au numéro choisi). */
  chapitre?: unknown;
}

/**
 * Texte final du cours : commentaire « # fichier : NN-slug.md » à jour, chapitre cohérent,
 * nouvelleMatiere retirée (elle ne sert qu'à créer le tome), fichiers joints ajoutés.
 */
export function preparerFichierFinal(texte: string, options: OptionsFinal): string {
  const d = decouper(texte.replace(/\r\n?/g, '\n'));
  if (!d) return texte;
  const nom = nomFichierCours(options.numero, options.slug);
  let yaml = d.yaml;

  yaml = /^[ \t]*#[ \t]*fichier[ \t]*:.*$/m.test(yaml)
    ? yaml.replace(/^[ \t]*#[ \t]*fichier[ \t]*:.*$/m, `# fichier : ${nom}`)
    : `# fichier : ${nom}\n${yaml}`;

  const chapitre = Number(options.chapitre);
  if (options.chapitre !== undefined && options.chapitre !== null && chapitre !== options.numero) {
    yaml = yaml.replace(/^chapitre\s*:.*$/m, `chapitre: ${options.numero}`);
  }

  yaml = retirerCle(yaml, 'nouvelleMatiere');
  yaml = ajouterFichiers(yaml, options.fichiersExistants ?? [], options.fichiers ?? []);

  return `---\n${yaml.replace(/\n+$/, '')}\n---\n\n${d.corps.replace(/^\s*\n/, '').trimEnd()}\n`;
}

// ─── Fichiers joints ─────────────────────────────────────────────────────────

/** Extension normalisée d'un fichier joint (« .jpeg » → « .jpg »). */
export function extensionDe(nom: string): string {
  const ext = /\.([a-z0-9]{1,8})$/i.exec(nom)?.[1]?.toLowerCase() ?? '';
  return ext === 'jpeg' ? 'jpg' : ext;
}

/** « Cours React 07.pdf » → « 07-cours-react-07.pdf » (unique parmi `pris`). */
export function nomMedia(numero: number, nomOriginal: string, pris: Iterable<string> = []): string {
  const dejaPris = new Set([...pris].map((n) => n.toLowerCase()));
  const ext = extensionDe(nomOriginal);
  const base = slugifier(nomOriginal.replace(/\.[a-z0-9]{1,8}$/i, '')).split('-').filter(Boolean).slice(0, 6).join('-') || 'fichier';
  const suffixe = ext ? `.${ext}` : '';
  let nom = `${deuxChiffres(numero)}-${base}${suffixe}`;
  for (let k = 2; dejaPris.has(nom); k++) nom = `${deuxChiffres(numero)}-${base}-${k}${suffixe}`;
  return nom;
}

/** Titre lisible d'un fichier joint : « cours-react_07.pdf » → « Cours react 07 (PDF) ». */
export function titreMedia(nomOriginal: string): string {
  const ext = extensionDe(nomOriginal);
  const base = nomOriginal.replace(/\.[a-z0-9]{1,8}$/i, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Fichier';
  const genre = ext === 'pdf' ? 'PDF' : 'image';
  return `${base.charAt(0).toUpperCase()}${base.slice(1)} (${genre})`;
}

// ─── Nouvelle matière ────────────────────────────────────────────────────────

/** « gestion-projet » → « Gestion projet ». */
export function nomDepuisSlug(slug: string): string {
  const s = slug.replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const texteOu = (v: unknown, defaut: string): string => (typeof v === 'string' && v.trim() ? v.trim() : defaut);

/** Valeurs complètes d'une nouvelle matière, à partir du champ nouvelleMatiere de l'IA (facultatif). */
export function completerMatiere(slug: string, proposee: unknown, ordre: number, nomSaisi = ''): NouvelleMatiere {
  const p = proposee && typeof proposee === 'object' && !Array.isArray(proposee) ? (proposee as Record<string, unknown>) : {};
  const nom = texteOu(p.nom, texteOu(nomSaisi, nomDepuisSlug(slug)));
  const kanjiPropose = typeof p.kanji === 'string' ? p.kanji.trim() : '';
  const couleur = typeof p.couleur === 'string' && (COULEURS as readonly string[]).includes(p.couleur) ? (p.couleur as Couleur) : 'sumi';
  return {
    nom,
    kanji: Array.from(kanjiPropose).length === 1 ? kanjiPropose : (Array.from(nom)[0] ?? '?').toUpperCase(),
    lecture: texteOu(p.lecture, 'à compléter — lecture et sens du kanji'),
    couleur,
    description: texteOu(p.description, `Les cours de ${nom}.`),
    ordre,
  };
}

/** Texte YAML d'une matière (chaînes en JSON = chaînes YAML valides). Même forme que scripts/outils.mjs. */
export function yamlMatiere(m: NouvelleMatiere): string {
  const q = (v: string) => JSON.stringify(v);
  return [
    '# Matière (un tome) : voir docs/CONCEPTION.md § 4.4',
    `# kanji : 1 caractère · couleur : ${COULEURS.join(' | ')} · ordre : numéro du tome`,
    `nom: ${q(m.nom)}`,
    `kanji: ${q(m.kanji)}`,
    `lecture: ${q(m.lecture)}`,
    `couleur: ${m.couleur}`,
    `description: ${q(m.description)}`,
    `ordre: ${m.ordre}`,
    '',
  ].join('\n');
}

/** Slug valide pour une matière (minuscules, chiffres, tirets). */
export function estSlug(s: string): boolean {
  return SLUG_RE.test(s);
}
