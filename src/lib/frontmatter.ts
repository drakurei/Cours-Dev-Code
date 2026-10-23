/**
 * Lecture d'un fichier de cours complet (frontmatter YAML + corps Markdown),
 * hors d'Astro : Atelier (navigateur) et scripts Node.
 * N'importe que 'yaml' et './schema.ts' (exécutable tel quel par Node 24).
 */
import { parse as parseYaml, YAMLParseError } from 'yaml';
import { validerCours, type Cours } from './schema.ts';

export interface Separation {
  yaml: string;
  corps: string;
}

export interface CoursParse {
  ok: boolean;
  data?: Cours;
  corps: string;
  erreurs: string[];
}

// « --- » en tête (BOM et lignes vides tolérés), puis le YAML, puis « --- » seul sur sa ligne.
const FRONTMATTER_RE = /^﻿?\s*---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

/** Sépare le frontmatter du corps. `null` si le texte ne commence pas par un bloc « --- ». */
export function separerFrontmatter(texte: string): Separation | null {
  const m = FRONTMATTER_RE.exec(texte);
  if (!m) return null;
  return { yaml: m[1] ?? '', corps: texte.slice(m[0].length) };
}

/** Lit et valide un cours. Les erreurs sont en français et citent le champ ou la ligne. */
export function parserCours(texte: string): CoursParse {
  const sep = separerFrontmatter(texte);
  if (!sep) {
    return {
      ok: false,
      corps: texte,
      erreurs: ['le fichier doit commencer par un frontmatter entre deux lignes « --- »'],
    };
  }

  let donnees: unknown;
  try {
    donnees = parseYaml(sep.yaml, { prettyErrors: true });
  } catch (e) {
    const ligne = e instanceof YAMLParseError && e.linePos ? ` (ligne ${e.linePos[0].line + 1} du fichier)` : '';
    const detail = e instanceof Error ? e.message.split('\n')[0] : String(e);
    return { ok: false, corps: sep.corps, erreurs: [`YAML invalide${ligne} : ${detail}`] };
  }

  const r = validerCours(donnees ?? {});
  return r.ok
    ? { ok: true, data: r.data, corps: sep.corps, erreurs: [] }
    : { ok: false, corps: sep.corps, erreurs: r.erreurs };
}

/** « 06-usestate » (ou « react/06-usestate.md ») → 6 ; pas de numéro → null. */
export function numeroDepuisNom(nom: string): number | null {
  const base = nom.replace(/\\/g, '/').split('/').pop() ?? '';
  const m = /^(\d{1,3})(?:-|$)/.exec(base);
  return m ? Number(m[1]) : null;
}
