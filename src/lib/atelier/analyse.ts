/**
 * Analyse d'un fichier de cours pour l'Atelier (étape Vérifier) : TypeScript pur, sans fs.
 *
 * - decouper : frontmatter / corps, avec les numéros de ligne du fichier.
 * - analyserCorps : blocs ::: équilibrés, blocs de code fermés, pas de titre #, au moins une notion
 *   (mêmes règles que analyserCorps de scripts/outils.mjs).
 * - diagnostiquer : parserCours (le schéma du build) + analyse du corps, chaque problème avec sa ligne.
 */
import { parseDocument, isMap, isSeq, type Document } from 'yaml';
import { parserCours } from '../frontmatter.ts';
import type { Cours } from '../schema.ts';

export const BLOCS_CONNUS = ['quoi', 'exemple', 'piege', 'ou', 'astuce', 'info', 'attention', 'retenir'] as const;

export interface Probleme {
  /** Ligne du fichier complet (1 = première ligne), null si le problème concerne tout le fichier. */
  ligne: number | null;
  message: string;
  /** Message d'origine (YAML), pour les curieux. */
  detail?: string;
}

export interface Decoupage {
  yaml: string;
  corps: string;
  /** Ligne du fichier où commence le YAML. */
  ligneYaml: number;
  /** Ligne du fichier où commence le corps. */
  ligneCorps: number;
}

export interface AnalyseCorps {
  erreurs: Probleme[];
  avertissements: Probleme[];
  notions: string[];
}

export interface Resume {
  titre: string;
  matiere: string;
  type: string;
  niveau: string;
  essentiel: string;
  notions: number;
  definitions: number;
  flashcards: number;
  quiz: number;
  exercices: number;
  retenir: number;
}

export interface Diagnostic {
  ok: boolean;
  data: Cours | null;
  /** YAML brut lu (même si le schéma échoue) : sert pour nouvelleMatiere, chapitre… */
  brut: Record<string, unknown> | null;
  corps: string;
  erreurs: Probleme[];
  avertissements: Probleme[];
  notions: string[];
  resume: Resume | null;
  /** « 06-usestate.md » lu dans le commentaire « # fichier : … » (null si absent ou invalide). */
  nomConseille: string | null;
}

// Même motif que src/lib/frontmatter.ts : « --- » en tête (BOM et lignes vides tolérés).
const OUVERTURE_RE = /^﻿?\s*---[ \t]*\r?\n/;
const FRONTMATTER_RE = /^﻿?\s*---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
const EMOJI = /\p{Emoji_Presentation}/u;
export const NOM_FICHIER_RE = /^(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;

const compterLignes = (texte: string): number => (texte.match(/\n/g) ?? []).length;

/** Sépare frontmatter et corps en gardant les numéros de ligne du fichier. */
export function decouper(texte: string): Decoupage | null {
  const m = FRONTMATTER_RE.exec(texte);
  if (!m) return null;
  const ouverture = OUVERTURE_RE.exec(texte)?.[0] ?? '';
  return {
    yaml: m[1] ?? '',
    corps: texte.slice(m[0].length),
    ligneYaml: compterLignes(ouverture) + 1,
    ligneCorps: compterLignes(m[0]) + 1,
  };
}

/** « # fichier : 06-usestate.md » (première ligne du frontmatter, écrite par l'IA). */
export function lireNomConseille(texte: string): string | null {
  const m = /^[ \t]*#[ \t]*fichier[ \t]*:[ \t]*(\S+)[ \t]*$/im.exec(decouper(texte)?.yaml ?? '');
  const nom = m?.[1]?.toLowerCase() ?? '';
  return NOM_FICHIER_RE.test(nom) ? nom : null;
}

/** Contrôle la structure du corps. Les numéros de ligne sont ceux du fichier complet. */
export function analyserCorps(texteComplet: string): AnalyseCorps {
  const texte = texteComplet.replace(/\r\n?/g, '\n');
  const d = decouper(texte);
  const corps = d ? d.corps : texte;
  const decalage = d ? d.ligneCorps : 1;
  const erreurs: Probleme[] = [];
  const avertissements: Probleme[] = [];
  const notions: string[] = [];
  const pile: { nom: string; deuxPoints: number; ligne: number }[] = [];
  let code: { marque: string; longueur: number; ligne: number } | null = null;

  corps.split('\n').forEach((ligne, index) => {
    const n = index + decalage;

    if (code) {
      const fin = /^\s*(`{3,}|~{3,})\s*$/.exec(ligne);
      if (fin?.[1] && fin[1][0] === code.marque && fin[1].length >= code.longueur) code = null;
      return;
    }

    const cloture = /^\s*(`{3,}|~{3,})(.*)$/.exec(ligne);
    if (cloture?.[1] && !(cloture[1][0] === '`' && (cloture[2] ?? '').includes('`'))) {
      code = { marque: cloture[1][0] ?? '`', longueur: cloture[1].length, ligne: n };
      if (!(cloture[2] ?? '').trim()) avertissements.push({ ligne: n, message: 'bloc de code sans langage (ex. ```js).' });
      return;
    }

    const directive = /^\s*(:{3,})\s*([A-Za-z][\w-]*)?(.*)$/.exec(ligne);
    if (directive) {
      const deuxPoints = directive[1]?.length ?? 3;
      const nom = directive[2];
      const reste = directive[3] ?? '';
      if (nom) {
        if (!(BLOCS_CONNUS as readonly string[]).includes(nom)) {
          avertissements.push({
            ligne: n,
            message: `bloc inconnu « :::${nom} » (il sera affiché comme info). Blocs possibles : ${BLOCS_CONNUS.join(', ')}.`,
          });
        }
        const parent = pile[pile.length - 1];
        if (parent) {
          avertissements.push({
            ligne: n,
            message: `bloc :::${nom} ouvert dans le bloc :::${parent.nom} de la ligne ${parent.ligne} (un ::: manque peut-être).`,
          });
        }
        pile.push({ nom, deuxPoints, ligne: n });
      } else if (!reste.trim()) {
        const ouvert = pile[pile.length - 1];
        if (!ouvert) erreurs.push({ ligne: n, message: '« ::: » ferme un bloc qui n’a jamais été ouvert.' });
        else if (deuxPoints >= ouvert.deuxPoints) pile.pop();
      }
      return;
    }

    if (/^#\s/.test(ligne)) {
      avertissements.push({
        ligne: n,
        message: 'titre « # » dans le corps : le titre vient du frontmatter, une notion commence par ##.',
      });
    }
    if (/^##\s/.test(ligne)) {
      notions.push(ligne.replace(/^##\s+/, '').trim());
      while (pile.length > 0) {
        const ouvert = pile.pop();
        if (!ouvert) break;
        erreurs.push({
          ligne: ouvert.ligne,
          message: `le bloc :::${ouvert.nom} n’est pas fermé avant la notion de la ligne ${n} (ajoute « ::: » seul sur une ligne).`,
        });
      }
    }
  });

  const ouvert = code as { marque: string; longueur: number; ligne: number } | null;
  if (ouvert) {
    erreurs.push({
      ligne: ouvert.ligne,
      message: `bloc de code ouvert mais jamais fermé (il manque la ligne ${ouvert.marque.repeat(ouvert.longueur)}).`,
    });
  }
  for (const bloc of pile) {
    erreurs.push({ ligne: bloc.ligne, message: `le bloc :::${bloc.nom} n’est jamais fermé (ajoute « ::: » seul sur une ligne).` });
  }
  if (notions.length === 0) {
    avertissements.push({ ligne: null, message: 'aucune notion « ## » : le Mode Focus n’aura rien à afficher.' });
  }
  return { erreurs, avertissements, notions };
}

/** Vrai si un texte (ex. la solution d'un exercice) laisse un bloc de code ouvert. */
export function blocsDeCodeOuverts(texte: string): boolean {
  let ouvert: string | null = null;
  for (const ligne of texte.replace(/\r\n?/g, '\n').split('\n')) {
    const m = /^\s*(`{3,}|~{3,})(.*)$/.exec(ligne);
    if (!m?.[1]) continue;
    if (ouvert) {
      if (m[1][0] === ouvert[0] && m[1].length >= ouvert.length && !(m[2] ?? '').trim()) ouvert = null;
    } else ouvert = m[1];
  }
  return ouvert !== null;
}

// ─── Lignes des erreurs du schéma ────────────────────────────────────────────

type Segment = string | number;

/** « quiz[2].reponse » → ['quiz', 2, 'reponse'] ; null si ce n'est pas un chemin. */
export function lireChemin(texte: string): Segment[] | null {
  if (!/^[A-Za-z_][\w-]*(?:\[\d+\]|\.[A-Za-z_][\w-]*)*$/.test(texte)) return null;
  const segments: Segment[] = [];
  for (const m of texte.matchAll(/\[(\d+)\]|\.?([A-Za-z_][\w-]*)/g)) {
    if (m[1] !== undefined) segments.push(Number(m[1]));
    else if (m[2] !== undefined) segments.push(m[2]);
  }
  return segments;
}

/** Position (dans le YAML) du nœud le plus proche du chemin : la clé si elle existe, sinon le parent. */
function positionDuChemin(doc: Document, chemin: Segment[]): number | null {
  for (let n = chemin.length; n > 0; n--) {
    const parent = n === 1 ? doc.contents : doc.getIn(chemin.slice(0, n - 1), true);
    const dernier = chemin[n - 1];
    if (typeof dernier === 'string' && isMap(parent)) {
      const paire = parent.items.find((p) => {
        const k = p.key as { value?: unknown } | null;
        return (k && typeof k === 'object' ? k.value : k) === dernier;
      });
      const range = (paire?.key as { range?: [number, number, number] } | null)?.range;
      if (range) return range[0];
    }
    if (typeof dernier === 'number' && isSeq(parent)) {
      const item = parent.items[dernier] as { range?: [number, number, number] } | undefined;
      if (item?.range) return item.range[0];
    }
  }
  return null;
}

const CODES_YAML: Record<string, string> = {
  DUPLICATE_KEY: 'ce champ apparaît deux fois',
  BAD_INDENT: 'mauvaise indentation (deux espaces par niveau, alignés)',
  TAB_AS_INDENT: 'tabulation interdite : indente avec des espaces',
  MISSING_CHAR: 'un guillemet, un crochet ou une accolade n’est pas fermé',
  BAD_DQ_ESCAPE: 'barre oblique inverse mal échappée dans un texte entre guillemets (écris \\\\)',
  BLOCK_AS_IMPLICIT_KEY: 'texte sur plusieurs lignes : mets-le entre guillemets ou utilise |',
  MULTILINE_IMPLICIT_KEY: 'texte sur plusieurs lignes : mets-le entre guillemets ou utilise |',
  UNEXPECTED_TOKEN: 'caractère inattendu (souvent un guillemet en trop, ou « : » dans un texte sans guillemets)',
  BAD_SCALAR_START: 'une valeur ne peut pas commencer par ce caractère : mets-la entre guillemets',
  MISSING_KEY: 'une clé manque avant « : »',
};

/** Texte YAML → ligne et message en français de la première erreur (null si le YAML se lit). */
function erreurYaml(d: Decoupage): Probleme | null {
  const doc = parseDocument(d.yaml);
  const e = doc.errors[0];
  if (!e) return null;
  const ligne = e.linePos?.[0]?.line;
  return {
    ligne: ligne ? d.ligneYaml + ligne - 1 : d.ligneYaml,
    message: `YAML invalide : ${CODES_YAML[e.code] ?? 'le frontmatter ne se lit pas'}.`,
    detail: e.message.split('\n')[0],
  };
}

function lireBrut(yaml: string): Record<string, unknown> | null {
  try {
    const doc = parseDocument(yaml);
    if (doc.errors.length) return null;
    const v: unknown = doc.toJS();
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// ─── Diagnostic complet ──────────────────────────────────────────────────────

/**
 * Valide un cours avec le schéma du build (parserCours) et la structure du corps.
 * Chaque problème porte sa ligne quand on peut la retrouver.
 */
export function diagnostiquer(texteBrut: string): Diagnostic {
  const texte = texteBrut.replace(/\r\n?/g, '\n');
  const d = decouper(texte);
  const corps = analyserCorps(texte);
  const erreurs: Probleme[] = [];
  const avertissements: Probleme[] = [...corps.avertissements];
  let data: Cours | null = null;
  let brut: Record<string, unknown> | null = null;

  if (!d) {
    erreurs.push({ ligne: 1, message: 'le fichier doit commencer par un frontmatter entre deux lignes « --- ».' });
  } else {
    const yamlKo = erreurYaml(d);
    if (yamlKo) {
      erreurs.push(yamlKo);
    } else {
      brut = lireBrut(d.yaml);
      const r = parserCours(texte);
      if (r.ok && r.data) {
        data = r.data;
      } else {
        const doc = parseDocument(d.yaml);
        for (const message of r.erreurs) {
          const i = message.indexOf(' : ');
          const chemin = i > 0 ? lireChemin(message.slice(0, i)) : null;
          const position = chemin ? positionDuChemin(doc, chemin) : null;
          const ligne = position === null ? d.ligneYaml : d.ligneYaml + compterLignes(d.yaml.slice(0, position));
          erreurs.push({ ligne, message: `${message}${/[.!?]$/.test(message) ? '' : '.'}` });
        }
      }
    }
  }
  erreurs.push(...corps.erreurs);

  // Comme scripts/verifier-contenu.mjs : solutions d'exercice et emoji.
  const exercices = Array.isArray(brut?.exercices) ? (brut.exercices as unknown[]) : [];
  exercices.forEach((ex, i) => {
    const solution = (ex as { solution?: unknown } | null)?.solution;
    if (typeof solution === 'string' && blocsDeCodeOuverts(solution)) {
      avertissements.push({ ligne: d?.ligneYaml ?? null, message: `exercices[${i}].solution : un bloc de code n’est pas fermé.` });
    }
  });
  const ligneEmoji = texte.split('\n').findIndex((l) => EMOJI.test(l));
  if (ligneEmoji !== -1) {
    avertissements.push({ ligne: ligneEmoji + 1, message: 'emoji : pas d’emoji dans les cours (les kanji servent d’icônes).' });
  }

  const trier = (a: Probleme, b: Probleme) => (a.ligne ?? 0) - (b.ligne ?? 0);
  erreurs.sort(trier);
  avertissements.sort(trier);

  const resume: Resume | null = data
    ? {
        titre: data.titre,
        matiere: data.matiere,
        type: data.type,
        niveau: data.niveau,
        essentiel: data.essentiel,
        notions: corps.notions.length,
        definitions: data.definitions.length,
        flashcards: data.flashcards.length,
        quiz: data.quiz.length,
        exercices: data.exercices.length,
        retenir: data.retenir.length,
      }
    : null;

  return {
    ok: erreurs.length === 0 && data !== null,
    data,
    brut,
    corps: d?.corps ?? texte,
    erreurs,
    avertissements,
    notions: corps.notions,
    resume,
    nomConseille: lireNomConseille(texte),
  };
}
