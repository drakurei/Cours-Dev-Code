// Outils partagés par les scripts Manabi (Node 24, ESM, aucune dépendance hors du projet).
// Utilisé par verifier-contenu.mjs, nouveau-cours.mjs et generer-cours.mjs.

import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..')
export const DOSSIER_COURS = join(RACINE, 'src', 'content', 'cours')
export const DOSSIER_MATIERES = join(RACINE, 'src', 'content', 'matieres')
export const DOSSIER_PUBLIC = join(RACINE, 'public')

export const MOTIF_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
export const MOTIF_FICHIER_COURS = /^(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/
export const BLOCS_CONNUS = ['quoi', 'exemple', 'piege', 'ou', 'astuce', 'info', 'attention', 'retenir']
export const COULEURS_MATIERE = ['sakura', 'ai', 'matcha', 'shu', 'fuji', 'yamabuki', 'kon', 'sora', 'sumi']

// --- Affichage --------------------------------------------------------------

const avecCouleurs = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR
const teinte = (code) => (texte) => (avecCouleurs ? `\x1b[${code}m${texte}\x1b[0m` : String(texte))

export const couleur = {
  rouge: teinte('31'),
  vert: teinte('32'),
  jaune: teinte('33'),
  bleu: teinte('34'),
  gris: teinte('90'),
  gras: teinte('1'),
}

/** Chemin relatif à la racine du projet, avec des / (lisible sous Windows aussi). */
export function cheminLisible(absolu) {
  const rel = relative(RACINE, absolu)
  if (!rel) return '.'
  return rel.startsWith('..') || /^[a-z]:/i.test(rel) ? absolu : rel.split(sep).join('/')
}

/** « 1 erreur », « 3 erreurs ». */
export function pluriel(n, mot, motPluriel = `${mot}s`) {
  return `${n} ${n > 1 ? motPluriel : mot}`
}

// --- Texte ------------------------------------------------------------------

/** « useState : l'état d'un composant » → « usestate-l-etat-d-un-composant » (6 mots max). */
export function slugifier(texte, motsMax = 6) {
  return String(texte)
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .split('-')
    .filter(Boolean)
    .slice(0, motsMax)
    .join('-')
}

export function deuxChiffres(n) {
  return String(n).padStart(2, '0')
}

export function normaliserFinsDeLigne(texte) {
  return String(texte).replace(/^﻿/, '').replace(/\r\n?/g, '\n')
}

// --- Fichiers ---------------------------------------------------------------

/** Liste récursive des fichiers d'un dossier (chemins absolus, triés). */
export async function listerFichiers(dossier) {
  if (!existsSync(dossier)) return []
  const resultats = []
  for (const entree of await readdir(dossier, { withFileTypes: true })) {
    const chemin = join(dossier, entree.name)
    if (entree.isDirectory()) resultats.push(...(await listerFichiers(chemin)))
    else if (entree.isFile()) resultats.push(chemin)
  }
  return resultats.sort((a, b) => a.localeCompare(b))
}

// --- Dépendances du projet (chargées à la demande) ---------------------------

let yamlCharge
/** Le paquet « yaml » du projet, ou null s'il n'est pas installé (npm ci pas encore fait). */
export async function chargerYaml() {
  if (yamlCharge === undefined) {
    try {
      yamlCharge = await import('yaml')
    } catch {
      yamlCharge = null
    }
  }
  return yamlCharge
}

/**
 * Charge src/lib/schema.ts et src/lib/frontmatter.ts (Node 24 lit le TypeScript effaçable)
 * et fusionne leurs exports : validerCours, validerMatiere, parserCours, separerFrontmatter.
 */
export async function chargerValidation() {
  const fonctions = {}
  const problemes = []
  for (const nom of ['schema.ts', 'frontmatter.ts']) {
    const chemin = join(RACINE, 'src', 'lib', nom)
    if (!existsSync(chemin)) {
      problemes.push(`src/lib/${nom} est introuvable.`)
      continue
    }
    try {
      Object.assign(fonctions, await import(pathToFileURL(chemin).href))
    } catch (erreur) {
      problemes.push(`src/lib/${nom} ne se charge pas : ${erreur.message}`)
    }
  }
  return { fonctions, problemes }
}

/** Sépare « ---\nyaml\n---\ncorps » ; renvoie aussi la ligne où commence le corps. */
export function decouperFrontmatter(texte) {
  const lignes = normaliserFinsDeLigne(texte).split('\n')
  if (lignes[0].trim() !== '---') return null
  for (let i = 1; i < lignes.length; i++) {
    if (lignes[i].trim() === '---') {
      return {
        yaml: lignes.slice(1, i).join('\n'),
        corps: lignes.slice(i + 1).join('\n'),
        ligneCorps: i + 2, // numéro (1 = première ligne) de la 1re ligne du corps
      }
    }
  }
  return null
}

/**
 * Analyse un cours complet avec les fonctions du projet.
 * Renvoie { ok, data, erreurs } ; erreurs = messages en français.
 */
export async function analyserCours(texte, fonctions) {
  const { parserCours, separerFrontmatter, validerCours } = fonctions
  if (typeof parserCours === 'function') {
    const r = await parserCours(texte)
    return { ok: Boolean(r?.ok), data: r?.data, erreurs: r?.erreurs ?? [] }
  }
  // Repli : découpe + YAML + schéma.
  const morceaux =
    typeof separerFrontmatter === 'function' ? separerFrontmatter(texte) : decouperFrontmatter(texte)
  if (!morceaux) return { ok: false, erreurs: ['Frontmatter introuvable : le fichier doit commencer par --- et le YAML se fermer par ---.'] }
  const yaml = await chargerYaml()
  if (!yaml) return { ok: false, erreurs: ['Le paquet « yaml » manque : lance npm ci.'] }
  let data
  try {
    data = yaml.parse(morceaux.yaml)
  } catch (erreur) {
    return { ok: false, erreurs: [`YAML invalide : ${erreur.message}`] }
  }
  if (typeof validerCours !== 'function') return { ok: false, erreurs: ['validerCours introuvable dans src/lib/schema.ts.'] }
  const r = validerCours(data)
  return r.ok ? { ok: true, data: r.data, erreurs: [] } : { ok: false, data, erreurs: r.erreurs ?? [] }
}

// --- Structure du corps (directives ::: et blocs de code) --------------------

/**
 * Contrôle le corps Markdown d'un cours :
 * blocs ::: équilibrés, blocs de code fermés, pas de titre #, au moins une notion ##.
 * Les numéros de ligne sont ceux du fichier complet.
 */
export function analyserCorps(texteComplet) {
  const morceaux = decouperFrontmatter(texteComplet)
  const corps = morceaux ? morceaux.corps : normaliserFinsDeLigne(texteComplet)
  const decalage = morceaux ? morceaux.ligneCorps : 1
  const erreurs = []
  const avertissements = []
  const notions = []
  const pile = [] // blocs ::: ouverts
  let code = null // bloc de code ouvert

  const lignes = corps.split('\n')
  lignes.forEach((ligne, index) => {
    const n = index + decalage

    if (code) {
      const fin = /^\s*(`{3,}|~{3,})\s*$/.exec(ligne)
      if (fin && fin[1][0] === code.marque && fin[1].length >= code.longueur) code = null
      return
    }

    const cloture = /^\s*(`{3,}|~{3,})(.*)$/.exec(ligne)
    if (cloture && !(cloture[1][0] === '`' && cloture[2].includes('`'))) {
      code = { marque: cloture[1][0], longueur: cloture[1].length, ligne: n }
      if (!cloture[2].trim()) avertissements.push(`ligne ${n} : bloc de code sans langage (ex. \`\`\`js).`)
      return
    }

    const directive = /^\s*(:{3,})\s*([A-Za-z][\w-]*)?(.*)$/.exec(ligne)
    if (directive) {
      const [, deuxPoints, nom, reste] = directive
      if (nom) {
        if (!BLOCS_CONNUS.includes(nom)) {
          avertissements.push(`ligne ${n} : bloc inconnu « :::${nom} » (il sera affiché comme info). Blocs possibles : ${BLOCS_CONNUS.join(', ')}.`)
        }
        if (pile.length > 0) {
          const parent = pile[pile.length - 1]
          avertissements.push(`ligne ${n} : bloc :::${nom} ouvert dans le bloc :::${parent.nom} de la ligne ${parent.ligne} (un ::: manque peut-être).`)
        }
        pile.push({ nom, deuxPoints: deuxPoints.length, ligne: n })
      } else if (!reste.trim()) {
        const ouvert = pile[pile.length - 1]
        if (!ouvert) erreurs.push(`ligne ${n} : « ::: » ferme un bloc qui n'a jamais été ouvert.`)
        else if (deuxPoints.length >= ouvert.deuxPoints) pile.pop()
      }
      return
    }

    if (/^#\s/.test(ligne)) avertissements.push(`ligne ${n} : titre « # » dans le corps (le titre vient du frontmatter ; une notion commence par ##).`)
    if (/^##\s/.test(ligne)) {
      notions.push(ligne.replace(/^##\s+/, '').trim())
      while (pile.length > 0) {
        const ouvert = pile.pop()
        erreurs.push(`ligne ${ouvert.ligne} : le bloc :::${ouvert.nom} n'est pas fermé avant la notion de la ligne ${n} (ajoute « ::: » seul sur une ligne).`)
      }
    }
  })

  if (code) erreurs.push(`ligne ${code.ligne} : bloc de code ouvert mais jamais fermé (il manque la ligne ${code.marque.repeat(code.longueur)}).`)
  for (const ouvert of pile) {
    erreurs.push(`ligne ${ouvert.ligne} : le bloc :::${ouvert.nom} n'est jamais fermé (ajoute « ::: » seul sur une ligne).`)
  }
  if (notions.length === 0) avertissements.push('aucune notion « ## » : le Mode Focus n\'aura rien à afficher.')

  return { erreurs, avertissements, notions }
}

/** Blocs de code non fermés dans un texte (ex. la solution d'un exercice). */
export function blocsDeCodeOuverts(texte) {
  let ouvert = null
  for (const ligne of normaliserFinsDeLigne(texte).split('\n')) {
    const m = /^\s*(`{3,}|~{3,})(.*)$/.exec(ligne)
    if (!m) continue
    if (ouvert) {
      if (m[1][0] === ouvert[0] && m[1].length >= ouvert.length && !m[2].trim()) ouvert = null
    } else ouvert = m[1]
  }
  return ouvert !== null
}

// --- Matières ---------------------------------------------------------------

/** Matières existantes : [{ slug, nom, ordre, chemin }], triées par ordre. */
export async function lireMatieres() {
  const yaml = await chargerYaml()
  const fichiers = (await listerFichiers(DOSSIER_MATIERES)).filter((f) => /\.ya?ml$/.test(f))
  const matieres = []
  for (const chemin of fichiers) {
    const slug = chemin.split(sep).pop().replace(/\.ya?ml$/, '')
    const texte = await readFile(chemin, 'utf8')
    let data = {}
    try {
      data = yaml ? yaml.parse(texte) ?? {} : lectureYamlMinimale(texte)
    } catch {
      data = lectureYamlMinimale(texte)
    }
    matieres.push({
      slug,
      nom: typeof data.nom === 'string' ? data.nom : slug,
      ordre: Number.isFinite(Number(data.ordre)) ? Number(data.ordre) : 999,
      chemin,
    })
  }
  return matieres.sort((a, b) => a.ordre - b.ordre || a.slug.localeCompare(b.slug))
}

/** Lecture de secours des clés simples « cle: valeur » (si le paquet yaml manque). */
function lectureYamlMinimale(texte) {
  const data = {}
  for (const ligne of normaliserFinsDeLigne(texte).split('\n')) {
    const m = /^([a-z]\w*):\s*(.+?)\s*$/i.exec(ligne)
    if (m) data[m[1]] = m[2].replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
  }
  return data
}

/** Numéros NN déjà pris dans src/content/cours/<matiere>/. */
export async function numerosPris(matiere) {
  const dossier = join(DOSSIER_COURS, matiere)
  const pris = new Set()
  if (!existsSync(dossier)) return pris
  for (const nom of await readdir(dossier)) {
    const m = MOTIF_FICHIER_COURS.exec(nom)
    if (m) pris.add(Number(m[1]))
  }
  return pris
}

/** Prochain numéro libre (max + 1). */
export async function prochainNumero(matiere) {
  const pris = await numerosPris(matiere)
  return pris.size === 0 ? 1 : Math.max(...pris) + 1
}

/** Texte YAML d'une nouvelle matière (chaînes en JSON = chaînes YAML valides). */
export function yamlMatiere({ nom, kanji, lecture, couleur: teinteMatiere, description, ordre }) {
  const q = (v) => JSON.stringify(String(v))
  return [
    '# Matière (un tome) : voir docs/CONCEPTION.md § 4.4',
    `# kanji : 1 caractère · couleur : ${COULEURS_MATIERE.join(' | ')} · ordre : numéro du tome`,
    `nom: ${q(nom)}`,
    `kanji: ${q(kanji)}`,
    `lecture: ${q(lecture)}`,
    `couleur: ${COULEURS_MATIERE.includes(teinteMatiere) ? teinteMatiere : 'sumi'}`,
    `description: ${q(description)}`,
    `ordre: ${ordre}`,
    '',
  ].join('\n')
}

/** Nom lisible depuis un slug : « gestion-projet » → « Gestion projet ». */
export function nomDepuisSlug(slug) {
  const texte = slug.replace(/-/g, ' ')
  return texte.charAt(0).toUpperCase() + texte.slice(1)
}
