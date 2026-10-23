#!/usr/bin/env node
// Crée un cours vide, prêt à remplir, à partir d'un modèle commenté.
//
//   npm run nouveau -- <matiere> "<Titre du cours>" [--type tp] [--niveau intermediaire]
//   ex. npm run nouveau -- react "useEffect : les effets de bord"
//
// → src/content/cours/<matiere>/<NN>-<slug>.md (NN = prochain numéro libre)
// → crée aussi src/content/matieres/<matiere>.yaml si la matière n'existe pas encore.

import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { dateDuJour } from '../src/lib/prompt.ts'
import {
  DOSSIER_COURS,
  DOSSIER_MATIERES,
  MOTIF_SLUG,
  cheminLisible,
  couleur,
  deuxChiffres,
  lireMatieres,
  nomDepuisSlug,
  prochainNumero,
  slugifier,
  yamlMatiere,
} from './outils.mjs'

const TYPES = ['cours', 'projet', 'tp', 'memo']
const NIVEAUX = ['debutant', 'intermediaire', 'avance']

function aide(code = 0) {
  console.log(`Usage : npm run nouveau -- <matiere> "<Titre>" [--type ${TYPES.join('|')}] [--niveau ${NIVEAUX.join('|')}]
Exemple : npm run nouveau -- react "useEffect : les effets de bord"`)
  process.exit(code)
}

let args
try {
  args = parseArgs({
    allowPositionals: true,
    options: {
      type: { type: 'string', default: 'cours' },
      niveau: { type: 'string', default: 'debutant' },
      aide: { type: 'boolean', short: 'h' },
    },
  })
} catch (e) {
  console.error(couleur.rouge(e.message))
  aide(1)
}
if (args.values.aide) aide(0)

const [matiereBrute, ...motsDuTitre] = args.positionals
const titre = motsDuTitre.join(' ').trim()
if (!matiereBrute || !titre) aide(1)

const matiere = slugifier(matiereBrute, 4)
if (!MOTIF_SLUG.test(matiere)) {
  console.error(couleur.rouge(`Matière « ${matiereBrute} » invalide : minuscules, chiffres et tirets (ex. html-css).`))
  process.exit(1)
}
if (matiere !== matiereBrute) console.log(couleur.gris(`matière « ${matiereBrute} » → slug « ${matiere} »`))

const { type, niveau } = args.values
if (!TYPES.includes(type)) {
  console.error(couleur.rouge(`--type doit valoir ${TYPES.join(', ')}.`))
  process.exit(1)
}
if (!NIVEAUX.includes(niveau)) {
  console.error(couleur.rouge(`--niveau doit valoir ${NIVEAUX.join(', ')}.`))
  process.exit(1)
}
if (titre.length > 90) {
  console.error(couleur.rouge(`Titre trop long (${titre.length} caractères, 90 au maximum).`))
  process.exit(1)
}

const slug = slugifier(titre, 5) || 'cours'
const numero = await prochainNumero(matiere)
if (numero > 99) {
  console.error(couleur.rouge(`La matière « ${matiere} » a déjà 99 chapitres : le numéro NN n'a que deux chiffres.`))
  process.exit(1)
}

// 1. La matière, si elle n'existe pas encore.
const cheminMatiere = join(DOSSIER_MATIERES, `${matiere}.yaml`)
if (!existsSync(cheminMatiere) && !existsSync(join(DOSSIER_MATIERES, `${matiere}.yml`))) {
  const matieres = await lireMatieres()
  const ordre = matieres.reduce((max, m) => (m.ordre < 999 ? Math.max(max, m.ordre) : max), 0) + 1
  const nom = nomDepuisSlug(matiere)
  await mkdir(DOSSIER_MATIERES, { recursive: true })
  await writeFile(
    cheminMatiere,
    yamlMatiere({
      nom,
      kanji: nom.charAt(0).toUpperCase(),
      lecture: 'à compléter — lecture et sens du kanji',
      couleur: 'sumi',
      description: `À compléter : de quoi parle le tome ${nom}.`,
      ordre,
    }),
    'utf8',
  )
  console.log(`${couleur.vert('matière créée')}  ${cheminLisible(cheminMatiere)} ${couleur.gris('(choisis un kanji et une couleur)')}`)
}

// 2. Le cours.
const dossier = join(DOSSIER_COURS, matiere)
const cheminCours = join(dossier, `${deuxChiffres(numero)}-${slug}.md`)
if (existsSync(cheminCours)) {
  console.error(couleur.rouge(`${cheminLisible(cheminCours)} existe déjà : rien n'a été modifié.`))
  process.exit(1)
}
await mkdir(dossier, { recursive: true })
await writeFile(cheminCours, modele({ titre, matiere, type, niveau, numero }), 'utf8')

console.log(`${couleur.vert('cours créé')}     ${cheminLisible(cheminCours)}`)
console.log('')
console.log('Ensuite :')
console.log(`  1. Remplis le fichier (ou colle la sortie du prompt universel, PROMPT-COURS.md).`)
console.log(`  2. Passe « brouillon: true » à false quand il est prêt.`)
console.log(`  3. npm run verifier, puis npm run dev pour le voir.`)

// ---------------------------------------------------------------------------

function modele({ titre, matiere, type, niveau, numero }) {
  const q = (v) => JSON.stringify(v)
  const lignesProjet =
    type === 'projet'
      ? `projet:                 # seulement pour type: projet
  repo: "https://github.com/drakurei/NOM-DU-REPO"
  demo: ""
  stack: [React, Vite]
  statut: en-cours       # en-cours | termine | en-pause
  role: "À écrire : ce que tu as fait, en une phrase."
`
      : ''
  // Une ligne YAML suivie de son commentaire, alignés en colonne.
  const l = (code, commentaire) => `${code.padEnd(Math.max(code.length + 2, 30))}# ${commentaire}`
  return `---
# Modèle de cours Manabi. Format complet : docs/CONCEPTION.md § 4 et PROMPT-COURS.md.
# Règles YAML : textes entre guillemets doubles, deux espaces d'indentation, jamais de tabulation.
${l(`titre: ${q(titre)}`, 'obligatoire, 90 caractères max')}
${l(`matiere: ${matiere}`, 'obligatoire, slug de la matière')}
${l(`type: ${type}`, 'cours | projet | tp | memo')}
${l(`chapitre: ${numero}`, 'ordre dans le tome')}
${l(`niveau: ${niveau}`, 'debutant | intermediaire | avance')}
${l('duree: 5', 'minutes de lecture')}
date: ${dateDuJour()}
source: "À écrire : d'où vient le cours (slides, cours live, repo…)"
tags: [${matiere}]
essentiel: "À écrire : l'essentiel en 30 secondes, en 1 à 3 phrases (400 caractères max)."
retenir:               # 3 à 5 phrases « à retenir »
  - "À écrire."
definitions:           # 3 à 8 termes → alimentent le glossaire
  - terme: "À écrire"
    definition: "Une phrase simple."
    exemple: "facultatif : une ligne de code"
flashcards:            # 6 à 15 cartes → révision espacée
  - q: "À écrire : une question précise ?"
    r: "La réponse en une ou deux phrases."
# quiz:                # 4 à 8 questions ; reponse = le TEXTE EXACT d'un des choix
#   - question: "Question ?"
#     choix:
#       - "Proposition A"
#       - "Proposition B"
#       - "Proposition C"
#     reponse: "Proposition B"
#     explication: "Pourquoi c'est la bonne réponse."
# exercices:           # 2 à 4, du plus facile au plus difficile
#   - titre: "Titre de l'exercice"
#     niveau: facile   # facile | moyen | difficile
#     enonce: "Ce qu'il faut faire."
#     indices:
#       - "Un indice vague."
#       - "Un indice plus précis."
#     solution: |
#       \`\`\`js
#       // la solution
#       \`\`\`
${lignesProjet}brouillon: true        # caché des listes ; passe à false quand le cours est prêt
---

## Première notion

:::quoi
Une phrase : ce que c'est, avec le **mot-clé en gras**.
:::

:::exemple
\`\`\`js
// 3 à 8 lignes d'exemple
\`\`\`
:::

:::piege
Une ligne : l'erreur classique à éviter.
:::

:::ou
Où ça sert en vrai (ou :::ou[Dans mon-projet] avec le vrai fichier).
:::
`
}
