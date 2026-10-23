/**
 * « Réparer automatiquement » (Atelier, étape Vérifier) : petites corrections SÛRES
 * sur la réponse d'une IA, avant la validation.
 *
 * - garde le dernier bloc ````markdown complet (ou ```markdown, ~~~~) et jette le texte autour ;
 * - BOM, fins de ligne Windows, espaces insécables ;
 * - « --- » d'ouverture ou de fermeture manquant ;
 * - YAML : tabulations, guillemets typographiques autour des valeurs, guillemets ou « : »
 *   non échappés (seulement si le YAML ne se lisait pas et que la correction le rend lisible) ;
 * - lit le nom conseillé « # fichier : NN-slug.md ».
 * Pur (seul import : le paquet yaml) : testable dans Node.
 */
import { parseDocument } from 'yaml';
import { decouper, lireNomConseille } from './analyse.ts';

export interface Reparation {
  texte: string;
  /** Ce qui a été corrigé, en français court (vide : rien à réparer). */
  corrections: string[];
  nomConseille: string | null;
}

const yamlLisible = (yaml: string): boolean => {
  try {
    return parseDocument(yaml).errors.length === 0;
  } catch {
    return false;
  }
};

const estCloture = (ligne: string, marque: string): boolean => {
  const t = ligne.trim();
  return t.length >= marque.length && [...t].every((c) => c === marque[0]);
};

/**
 * Isole le fichier dans une réponse d'IA. Renvoie le contenu et ce qui a été retiré.
 * Ordre : dernier bloc à 4 accents graves (ou tildes) complet ; bloc ```markdown qui entoure ;
 * à défaut, tout à partir du frontmatter.
 */
export function extraireFichier(texte: string): { contenu: string; corrections: string[] } {
  const lignes = texte.split('\n');
  const corrections: string[] = [];
  const nonVide = (l: string) => l.trim() !== '';

  // 1. Dernier bloc complet à 4 accents graves ou plus (le format demandé par PROMPT-COURS.md).
  let dernier: { debut: number; fin: number } | null = null;
  for (let i = 0; i < lignes.length; i++) {
    const ouverture = /^\s*(`{4,}|~{4,})\s*(markdown|md|text)?\s*$/i.exec(lignes[i] ?? '');
    if (!ouverture?.[1]) continue;
    for (let j = i + 1; j < lignes.length; j++) {
      if (estCloture(lignes[j] ?? '', ouverture[1])) {
        dernier = { debut: i, fin: j };
        i = j;
        break;
      }
    }
  }

  // 2. Bloc à 3 accents graves annoncé « markdown » : de son ouverture à la dernière clôture nue.
  if (!dernier) {
    const debut = lignes.findIndex((l) => /^\s*(`{3}|~{3})\s*(markdown|md)\s*$/i.test(l));
    if (debut !== -1) {
      const marque = /^\s*(`{3}|~{3})/.exec(lignes[debut] ?? '')?.[1] ?? '```';
      let fin = -1;
      for (let j = lignes.length - 1; j > debut; j--) {
        if ((lignes[j] ?? '').trim() === marque) {
          fin = j;
          break;
        }
      }
      dernier = { debut, fin: fin === -1 ? lignes.length : fin };
    }
  }

  if (dernier) {
    corrections.push('bloc ````markdown retiré');
    if (lignes.slice(0, dernier.debut).some(nonVide)) corrections.push('texte avant le cours retiré');
    if (lignes.slice(dernier.fin + 1).some(nonVide)) corrections.push('texte après le cours retiré');
    return { contenu: lignes.slice(dernier.debut + 1, dernier.fin).join('\n'), corrections };
  }

  // 3. Pas de bloc : on part du frontmatter (« --- » suivi d'un champ, ou « titre: » sans « --- »).
  const estChamp = (l: string) => /^(#\s*fichier\s*:|[A-Za-z_][\w-]*\s*:)/.test(l.trim());
  let depart = lignes.findIndex((l, i) => l.trim() === '---' && lignes.slice(i + 1, i + 4).some(estChamp));
  if (depart === -1) depart = lignes.findIndex((l) => /^(#\s*fichier\s*:|titre\s*:)/.test(l.trim()));
  // « # fichier : … » juste au-dessus du « --- » : il fait partie du cours.
  if (depart > 0 && /^#\s*fichier\s*:/.test((lignes[depart - 1] ?? '').trim())) depart--;
  if (depart > 0 && lignes.slice(0, depart).some(nonVide)) {
    corrections.push('texte avant le cours retiré');
    return { contenu: lignes.slice(depart).join('\n'), corrections };
  }
  return { contenu: texte, corrections };
}

/** Échappe une valeur pour l'écrire entre guillemets doubles. */
function entreGuillemets(valeur: string): string {
  return `"${valeur.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/**
 * Marque les lignes qui sont le contenu d'un bloc « clé: | » (solution d'un exercice…) :
 * on n'y touche jamais, c'est du texte libre (souvent du code).
 */
function contenuDeBlocs(lignes: string[]): boolean[] {
  const masque = lignes.map(() => false);
  let indentCle = -1;
  lignes.forEach((ligne, i) => {
    const indent = /^ */.exec(ligne)?.[0].length ?? 0;
    if (indentCle >= 0) {
      if (ligne.trim() === '' || indent > indentCle) {
        masque[i] = true;
        return;
      }
      indentCle = -1;
    }
    const m = /^(\s*(?:-\s+)?)([A-Za-z_][\w-]*\s*:\s*)?[|>][+-]?\d*\s*(?:#.*)?$/.exec(ligne);
    if (m && (m[2] || /-\s+$/.test(m[1] ?? ''))) indentCle = (m[1] ?? '').length;
  });
  return masque;
}

/** Applique `f` aux lignes YAML hors des blocs « | ». */
function parLigne(yaml: string, f: (ligne: string) => string): string {
  const lignes = yaml.split('\n');
  const masque = contenuDeBlocs(lignes);
  return lignes.map((l, i) => (masque[i] ? l : f(l))).join('\n');
}

/** Corrige les lignes YAML « clé: "…" » dont l'intérieur casse le YAML (guillemets, \). */
function echapperGuillemets(yaml: string): string {
  return parLigne(yaml, (ligne) => {
    const m = /^(\s*(?:-\s+)?(?:[A-Za-z_][\w-]*\s*:\s+)?)"(.*)"\s*$/.exec(ligne);
    if (!m) return ligne;
    const interieur = (m[2] ?? '').replace(/\\(?!["\\nt])/g, '\\\\').replace(/(?<!\\)"/g, '\\"');
    return `${m[1]}"${interieur}"`;
  });
}

/** Met entre guillemets les valeurs sans guillemets qui contiennent « : » (« titre: useState : l'état »). */
function citerDeuxPoints(yaml: string): string {
  const VALEUR = /([^"'[{|>&*!%@`#\s].*?)\s*$/.source;
  const avecCle = new RegExp(`^(\\s*(?:-\\s+)?[A-Za-z_][\\w-]*:\\s+)${VALEUR}`);
  const element = new RegExp(`^(\\s*-\\s+)${VALEUR}`);
  return parLigne(yaml, (ligne) => {
    // « clé: valeur » (valeur sans guillemet, ni liste, ni bloc |) ou « - valeur ».
    const cle = avecCle.exec(ligne);
    const m = cle ?? element.exec(ligne);
    if (!m) return ligne;
    const valeur = m[2] ?? '';
    // « - q: … » est une clé (pas d'espace avant « : », contrairement à la typographie française).
    if (!cle && /^[A-Za-z_][\w-]*:(\s|$)/.test(valeur)) return ligne;
    if (!/:\s|:$/.test(valeur)) return ligne;
    return `${m[1]}${entreGuillemets(valeur)}`;
  });
}

/** Répare la réponse d'une IA. Ne change rien si le texte est déjà propre. */
export function reparerCours(brut: string): Reparation {
  const corrections: string[] = [];
  let texte = brut;

  if (texte.startsWith('\uFEFF')) {
    texte = texte.slice(1);
    corrections.push('BOM retiré');
  }
  if (/\r/.test(texte)) {
    texte = texte.replace(/\r\n?/g, '\n');
    corrections.push('fins de ligne Windows');
  }

  const extrait = extraireFichier(texte);
  corrections.push(...extrait.corrections);
  texte = extrait.contenu.replace(/^\s+/, '').trimEnd();

  // « # fichier : … » écrit AVANT le « --- » : on le range dans le frontmatter.
  const avant = /^(#\s*fichier\s*:[^\n]*)\n\s*---[ \t]*\n/.exec(texte);
  if (avant) {
    texte = `---\n${avant[1]}\n${texte.slice(avant[0].length)}`;
    corrections.push('« # fichier » rangé dans le frontmatter');
  } else if (!/^---[ \t]*$/.test(texte.split('\n')[0] ?? '')) {
    texte = `---\n${texte}`;
    corrections.push('« --- » d’ouverture ajouté');
  }
  if (!decouper(texte)) {
    // Le YAML s'arrête juste avant la première notion (## …) ou le premier bloc (:::…).
    const lignes = texte.split('\n');
    const i = lignes.findIndex((l, n) => n > 0 && (/^##\s/.test(l) || /^:::/.test(l)));
    if (i !== -1) {
      let fin = i;
      while (fin > 1 && (lignes[fin - 1] ?? '').trim() === '') fin--;
      lignes.splice(fin, 0, '---');
      texte = lignes.join('\n');
      corrections.push('« --- » de fermeture ajouté');
    }
  }

  const d = decouper(texte);
  if (!d) {
    return { texte: `${texte}\n`, corrections, nomConseille: lireNomConseille(texte) };
  }

  let yaml = d.yaml;
  if (/\t/.test(yaml)) {
    yaml = yaml.replace(/\t/g, '  ');
    corrections.push('tabulations remplacées par des espaces');
  }
  const sansInsecables = yaml
    .replace(/^[\u00A0\u202F ]+/gm, (debut) => debut.replace(/[\u00A0\u202F]/g, ' '))
    .replace(/^(\s*(?:-\s+)?[A-Za-z_][\w-]*)[\u00A0\u202F ]+:/gm, '$1:');
  if (sansInsecables !== yaml) {
    yaml = sansInsecables;
    corrections.push('espaces en trop avant « : »');
  }
  // « titre: “Texte” » → « titre: "Texte" » (seulement quand ils délimitent toute la valeur).
  const typo = parLigne(yaml, (ligne) => {
    const m = /^(\s*(?:-\s+)?(?:[A-Za-z_][\w-]*\s*:\s+)?)[“”„‘’](.*)[“”‘’]\s*$/.exec(ligne);
    return m ? `${m[1]}"${(m[2] ?? '').replace(/(?<!\\)"/g, '\\"')}"` : ligne;
  });
  if (typo !== yaml) {
    yaml = typo;
    corrections.push('guillemets typographiques remplacés');
  }

  if (!yamlLisible(yaml)) {
    const echappe = echapperGuillemets(yaml);
    if (echappe !== yaml && yamlLisible(echappe)) {
      yaml = echappe;
      corrections.push('guillemets échappés dans le YAML');
    } else {
      const cite = citerDeuxPoints(echappe);
      if (cite !== echappe && yamlLisible(cite)) {
        yaml = cite;
        corrections.push('textes avec « : » mis entre guillemets');
      }
    }
  }

  let corps = d.corps.replace(/^\s*\n/, '').trimEnd();
  // Frontmatter rangé par l'IA dans un bloc ```yaml : la clôture reste en tête du corps.
  if (/^(`{3,}|~{3,})[ \t]*(\n|$)/.test(corps)) {
    corps = corps.replace(/^(`{3,}|~{3,})[ \t]*\n?/, '').replace(/^\s*\n/, '');
    corrections.push('clôture ``` en trop retirée');
  }
  const final = `---\n${yaml}\n---\n\n${corps}\n`;
  return { texte: final, corrections, nomConseille: lireNomConseille(final) };
}
