#!/usr/bin/env node
// Vérifie TOUS les cours et toutes les matières, avec le même schéma que le build.
//
//   npm run verifier            → rapport lisible, groupé par fichier
//   npm run verifier -- --json  → rapport JSON (pour un outil ou une IA)
//
// Code de sortie : 0 si aucune erreur (les avertissements ne bloquent pas), 1 sinon.

import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import {
  BLOCS_CONNUS,
  DOSSIER_COURS,
  DOSSIER_MATIERES,
  DOSSIER_PUBLIC,
  MOTIF_FICHIER_COURS,
  MOTIF_SLUG,
  analyserCorps,
  analyserCours,
  blocsDeCodeOuverts,
  chargerValidation,
  chargerYaml,
  cheminLisible,
  couleur,
  decouperFrontmatter,
  listerFichiers,
  pluriel,
} from './outils.mjs'

const enJson = process.argv.includes('--json')
if (process.argv.includes('--aide') || process.argv.includes('-h')) {
  console.log('Usage : node scripts/verifier-contenu.mjs [--json]')
  process.exit(0)
}

/** rapport[fichier] = { erreurs: [], avertissements: [] } */
const rapport = new Map()
const noter = (fichier, genre, message) => {
  if (!rapport.has(fichier)) rapport.set(fichier, { erreurs: [], avertissements: [] })
  rapport.get(fichier)[genre].push(message)
}
const erreur = (fichier, message) => noter(fichier, 'erreurs', message)
const avertir = (fichier, message) => noter(fichier, 'avertissements', message)

const EMOJI = /\p{Emoji_Presentation}/u
const GENERAL = '(général)'

// --- 1. Outils du projet -------------------------------------------------------

const { fonctions, problemes } = await chargerValidation()
for (const p of problemes) erreur(GENERAL, p)
const yaml = await chargerYaml()
if (!yaml) erreur(GENERAL, 'Le paquet « yaml » est introuvable : lance « npm ci » (ou « npm install »).')

// --- 2. Matières ------------------------------------------------------------------

const fichiersMatieres = await listerFichiers(DOSSIER_MATIERES)
const matieresConnues = new Set()
const ordres = new Map()
let nbMatieres = 0

for (const chemin of fichiersMatieres) {
  const lisible = cheminLisible(chemin)
  const nom = chemin.split(sep).pop()
  if (!/\.ya?ml$/.test(nom)) {
    if (!nom.startsWith('.')) avertir(lisible, 'fichier ignoré : une matière est un fichier .yaml.')
    continue
  }
  nbMatieres++
  const slug = nom.replace(/\.ya?ml$/, '')
  matieresConnues.add(slug)
  if (nom.endsWith('.yml')) avertir(lisible, 'extension .yml : renomme le fichier en .yaml.')
  if (!MOTIF_SLUG.test(slug)) erreur(lisible, `nom de fichier « ${slug} » invalide : minuscules, chiffres et tirets seulement (ex. html-css.yaml).`)
  if (!yaml) continue

  let data
  try {
    data = yaml.parse(await readFile(chemin, 'utf8'))
  } catch (e) {
    erreur(lisible, `YAML invalide : ${premiereLigne(e.message)}`)
    continue
  }
  if (typeof fonctions.validerMatiere === 'function') {
    const r = fonctions.validerMatiere(data)
    if (!r.ok) for (const m of r.erreurs ?? []) erreur(lisible, m)
  }
  const ordre = data?.ordre
  if (Number.isFinite(ordre)) {
    if (!ordres.has(ordre)) ordres.set(ordre, [])
    ordres.get(ordre).push(lisible)
  }
}
for (const [ordre, fichiers] of ordres) {
  if (fichiers.length > 1) for (const f of fichiers) avertir(f, `ordre ${ordre} partagé avec : ${fichiers.filter((x) => x !== f).join(', ')}.`)
}

// --- 3. Cours ----------------------------------------------------------------------

const fichiersCours = await listerFichiers(DOSSIER_COURS)
const chapitres = new Map() // `${matiere}#${n}` → [fichiers]
let nbCours = 0

for (const chemin of fichiersCours) {
  const lisible = cheminLisible(chemin)
  const morceaux = relative(DOSSIER_COURS, chemin).split(sep)
  const nom = morceaux[morceaux.length - 1]

  if (nom.startsWith('.')) continue
  if (!nom.endsWith('.md')) {
    if (/\.(mdx|markdown)$/.test(nom)) erreur(lisible, 'format non pris en charge : un cours est un fichier .md (pas de MDX).')
    else if (/\.(png|jpe?g|webp|gif|svg|pdf)$/i.test(nom)) avertir(lisible, 'les images et PDF vont dans public/media/<matiere>/, pas dans src/content/cours/.')
    else avertir(lisible, 'fichier ignoré (pas un .md).')
    continue
  }
  nbCours++

  // Emplacement : src/content/cours/<matiere>/<NN>-<slug>.md
  if (morceaux.length !== 2) {
    erreur(lisible, 'emplacement invalide : un cours se range dans src/content/cours/<matiere>/<NN>-<slug>.md (un seul niveau de dossier).')
  }
  const dossierMatiere = morceaux.length >= 2 ? morceaux[0] : null
  if (dossierMatiere && !MOTIF_SLUG.test(dossierMatiere)) {
    erreur(lisible, `dossier « ${dossierMatiere} » invalide : minuscules, chiffres et tirets seulement.`)
  }
  const nomValide = MOTIF_FICHIER_COURS.exec(nom)
  if (!nomValide) {
    erreur(lisible, `nom de fichier « ${nom} » invalide : il faut NN-slug.md (2 chiffres, puis minuscules, chiffres et tirets), ex. 06-usestate.md.`)
  }

  const texte = await readFile(chemin, 'utf8')
  if (texte.includes('\t')) avertir(lisible, 'le fichier contient des tabulations : en YAML, indente avec des espaces.')

  // Frontmatter : même analyse que le build.
  let data = null
  if (problemes.length === 0) {
    const r = await analyserCours(texte, fonctions)
    for (const m of r.erreurs) erreur(lisible, m)
    data = r.data ?? null
  }
  // Schéma en échec : les contrôles suivants se font quand même, sur le YAML brut.
  if (!data && yaml) {
    const morceaux = decouperFrontmatter(texte)
    try {
      const brut = morceaux ? yaml.parse(morceaux.yaml) : null
      if (brut && typeof brut === 'object' && !Array.isArray(brut)) data = brut
    } catch {
      /* YAML illisible : l'erreur est déjà signalée */
    }
  }

  if (data && typeof data === 'object') {
    const matiere = data.matiere
    if (typeof matiere === 'string') {
      if (dossierMatiere && matiere !== dossierMatiere) {
        erreur(lisible, `matiere: ${matiere} ne correspond pas au dossier « ${dossierMatiere} » : déplace le fichier ou corrige le champ.`)
      }
      if (fichiersMatieres.length > 0 && !matieresConnues.has(matiere)) {
        avertir(lisible, `matière « ${matiere} » inconnue : crée src/content/matieres/${matiere}.yaml (sinon le tome aura un style par défaut).`)
      }
    }
    const numero = Number.isInteger(data.chapitre) ? data.chapitre : nomValide ? Number(nomValide[1]) : null
    if (numero !== null && typeof matiere === 'string') {
      const cle = `${matiere}#${numero}`
      if (!chapitres.has(cle)) chapitres.set(cle, [])
      chapitres.get(cle).push(lisible)
    }
    for (const [i, exercice] of (Array.isArray(data.exercices) ? data.exercices : []).entries()) {
      if (typeof exercice?.solution === 'string' && blocsDeCodeOuverts(exercice.solution)) {
        avertir(lisible, `exercices[${i}].solution : un bloc de code n'est pas fermé.`)
      }
    }
    for (const [i, fichier] of (Array.isArray(data.fichiers) ? data.fichiers : []).entries()) {
      const c = fichier?.chemin
      if (typeof c === 'string' && c.startsWith('/') && !existsSync(join(DOSSIER_PUBLIC, ...c.split('/').filter(Boolean)))) {
        avertir(lisible, `fichiers[${i}] : « ${c} » introuvable dans public/.`)
      }
    }
  }

  // Corps : blocs ::: et blocs de code.
  const corps = analyserCorps(texte)
  for (const m of corps.erreurs) erreur(lisible, m)
  for (const m of corps.avertissements) avertir(lisible, m)

  const lignesEmoji = texte
    .split(/\r?\n/)
    .map((l, i) => (EMOJI.test(l) ? i + 1 : 0))
    .filter(Boolean)
  if (lignesEmoji.length > 0) avertir(lisible, `emoji ligne ${lignesEmoji.slice(0, 5).join(', ')} : pas d'emoji dans les cours (les kanji servent d'icônes).`)
}

for (const [cle, fichiers] of chapitres) {
  if (fichiers.length > 1) {
    const [matiere, numero] = cle.split('#')
    for (const f of fichiers) avertir(f, `chapitre ${numero} en double dans « ${matiere} » (avec ${fichiers.filter((x) => x !== f).join(', ')}).`)
  }
}

// --- 4. Rapport ----------------------------------------------------------------------

const entrees = [...rapport.entries()].sort(([a], [b]) => (a === GENERAL ? -1 : b === GENERAL ? 1 : a.localeCompare(b)))
const totalErreurs = entrees.reduce((n, [, r]) => n + r.erreurs.length, 0)
const totalAvertissements = entrees.reduce((n, [, r]) => n + r.avertissements.length, 0)

if (enJson) {
  const sortie = {
    ok: totalErreurs === 0,
    cours: nbCours,
    matieres: nbMatieres,
    erreurs: totalErreurs,
    avertissements: totalAvertissements,
    fichiers: entrees.map(([fichier, r]) => ({ fichier, ...r })),
  }
  console.log(JSON.stringify(sortie, null, 2))
} else {
  console.log(couleur.gras('Manabi — vérification du contenu'))
  console.log(couleur.gris(`blocs reconnus : ${BLOCS_CONNUS.join(', ')}`))
  console.log('')
  for (const [fichier, r] of entrees) {
    const marque = r.erreurs.length > 0 ? couleur.rouge('✗') : couleur.jaune('!')
    console.log(`${marque} ${couleur.gras(fichier)}`)
    for (const m of r.erreurs) console.log(`    ${couleur.rouge('erreur')}  ${m}`)
    for (const m of r.avertissements) console.log(`    ${couleur.jaune('attention')}  ${m}`)
    console.log('')
  }
  const bilan = `${pluriel(nbCours, 'cours', 'cours')} et ${pluriel(nbMatieres, 'matière')} vérifiés : ${pluriel(totalErreurs, 'erreur')}, ${pluriel(totalAvertissements, 'avertissement')}.`
  if (totalErreurs > 0) {
    console.log(couleur.rouge(couleur.gras(bilan)))
    console.log(couleur.gris('Format attendu : docs/CONCEPTION.md § 4 et PROMPT-COURS.md.'))
  } else {
    console.log(couleur.vert(couleur.gras(`✓ ${bilan}`)))
  }
}

process.exitCode = totalErreurs > 0 ? 1 : 0

function premiereLigne(texte) {
  return String(texte).split('\n')[0]
}
