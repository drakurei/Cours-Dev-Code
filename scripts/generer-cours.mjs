#!/usr/bin/env node
// inbox/ → cours Manabi, avec l'API Claude.
//
//   npm run generer                      → traite inbox/ (clé dans ANTHROPIC_API_KEY)
//   npm run generer -- --essai           → n'appelle pas l'API : affiche ce qui serait envoyé
//   npm run generer -- --dossier <dir>   → traite un autre dossier que inbox/
//
// Variables : ANTHROPIC_API_KEY (obligatoire hors --essai), MANABI_MODELE (défaut claude-sonnet-5-5,
// ex. claude-opus-5-5), MANABI_EFFORT (low | medium | high | xhigh | max, défaut medium),
// MANABI_REPLI=non (désactive le repli serveur en cas de refus).
//
// Une source = un fichier de inbox/ (pdf, png, jpg, jpeg, webp, md, txt) ou un sous-dossier
// (tous ses fichiers = un seul cours). Consigne facultative : <nom>.consigne.txt à côté du fichier,
// ou un fichier *.consigne.txt dans le sous-dossier.
//
// Appels HTTP directs (fetch natif) : les scripts du repo n'ont aucune dépendance hors du projet.

import { existsSync } from 'node:fs'
import { appendFile, copyFile, mkdir, readdir, readFile, rename, rm, rmdir, stat, writeFile } from 'node:fs/promises'
import { basename, extname, join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { construirePrompt, dateDuJour, extrairePrompt } from '../src/lib/prompt.ts'
import {
  COULEURS_MATIERE,
  DOSSIER_COURS,
  DOSSIER_MATIERES,
  DOSSIER_PUBLIC,
  MOTIF_SLUG,
  RACINE,
  analyserCorps,
  analyserCours,
  chargerValidation,
  chargerYaml,
  cheminLisible,
  couleur,
  decouperFrontmatter,
  deuxChiffres,
  lireMatieres,
  nomDepuisSlug,
  normaliserFinsDeLigne,
  numerosPris,
  pluriel,
  slugifier,
  yamlMatiere,
} from './outils.mjs'

// --- Réglages ---------------------------------------------------------------

const URL_API = `${(process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/+$/, '')}/v1/messages`
const VERSION_API = '2023-06-01'
const MODELE_DEFAUT = 'claude-sonnet-5-5'
// Modèles qui acceptent le repli serveur « fallbacks: "default" » (refus de sécurité → autre modèle).
const MODELES_AVEC_REPLI = new Set(['claude-sonnet-5-5', 'claude-opus-5-5', 'claude-opus-5', 'claude-fable-5-1'])
const BETA_REPLI = 'server-side-fallback-2026-07-01'
const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max']
const MAX_TOKENS = 64000 // réponse en streaming : de la place pour la réflexion + le cours
const TENTATIVES_MAX = 4
const DELAI_REQUETE_MS = 15 * 60 * 1000
const CODES_REESSAYABLES = new Set([408, 409, 429, 500, 502, 503, 504, 529])

// Limites de l'API : 10 Mo par image (en base64), 32 Mo par requête, plus de 20 images = images ≤ 2000 px.
const LIMITE_IMAGE_BASE64 = 10 * 1024 * 1024
const LIMITE_REQUETE = 30 * 1024 * 1024
const IMAGES_CONSEILLEES = 20

const FORMATS = {
  '.pdf': { genre: 'pdf', media: 'application/pdf', libelle: 'PDF' },
  '.png': { genre: 'image', media: 'image/png', libelle: 'image PNG' },
  '.jpg': { genre: 'image', media: 'image/jpeg', libelle: 'image JPEG' },
  '.jpeg': { genre: 'image', media: 'image/jpeg', libelle: 'image JPEG' },
  '.webp': { genre: 'image', media: 'image/webp', libelle: 'image WebP' },
  '.md': { genre: 'texte', libelle: 'texte Markdown' },
  '.txt': { genre: 'texte', libelle: 'texte' },
}
const IGNORES = new Set(['readme.md', '.gitkeep', '.ds_store', 'thumbs.db', 'desktop.ini'])
const SUFFIXE_CONSIGNE = '.consigne.txt'
const DOSSIER_A_REVOIR = '_a-revoir'

// --- Arguments ---------------------------------------------------------------

let args
try {
  args = parseArgs({
    options: {
      essai: { type: 'boolean', default: false },
      dossier: { type: 'string' },
      modele: { type: 'string' },
      aide: { type: 'boolean', short: 'h' },
    },
  })
} catch (e) {
  console.error(couleur.rouge(e.message))
  process.exit(1)
}
if (args.values.aide) {
  console.log('Usage : node scripts/generer-cours.mjs [--essai] [--dossier <chemin>] [--modele <id>]')
  process.exit(0)
}

const ESSAI = args.values.essai
const DOSSIER_INBOX = resolve(args.values.dossier ?? join(RACINE, 'inbox'))
const MODELE = (args.values.modele || process.env.MANABI_MODELE || MODELE_DEFAUT).trim()
const EFFORT = (process.env.MANABI_EFFORT || 'medium').trim()
const REPLI = MODELES_AVEC_REPLI.has(MODELE) && process.env.MANABI_REPLI !== 'non'
const CLE = (process.env.ANTHROPIC_API_KEY || '').trim()

if (!EFFORTS.includes(EFFORT)) {
  console.error(couleur.rouge(`MANABI_EFFORT doit valoir ${EFFORTS.join(', ')} (reçu « ${EFFORT} »).`))
  process.exit(1)
}

class ErreurApi extends Error {
  constructor(message, { fatale = false, reessayable = false, statut = null } = {}) {
    super(message)
    this.fatale = fatale // inutile de continuer avec les autres sources (clé, modèle, facturation)
    this.reessayable = reessayable // problème passager : la source reste dans inbox/
    this.statut = statut
  }
}

class ProblemeContenu extends Error {} // la source part dans inbox/_a-revoir/

// --- Programme ----------------------------------------------------------------

const journalResume = [] // lignes du résumé (GitHub Actions)
const bilan = { crees: 0, aRevoir: 0, echecs: 0 }

console.log(couleur.gras(`Manabi — inbox → cours${ESSAI ? ' (essai : aucun appel à l\'API)' : ''}`))
console.log(couleur.gris(`dossier : ${cheminLisible(DOSSIER_INBOX) || DOSSIER_INBOX}`))

if (!existsSync(DOSSIER_INBOX)) {
  console.log(`Le dossier ${DOSSIER_INBOX} n'existe pas : rien à faire.`)
  process.exit(0)
}

const unites = await collecterUnites(DOSSIER_INBOX)
if (unites.length === 0) {
  console.log('Rien à transformer : dépose un PDF, des images ou un .md dans inbox/.')
  process.exit(0)
}
console.log(`${pluriel(unites.length, 'source')} à transformer.\n`)

if (!ESSAI && !CLE) {
  const message = [
    'Pas de clé API : ANTHROPIC_API_KEY est vide, rien n\'a été généré.',
    '- En local : export ANTHROPIC_API_KEY="sk-ant-..." puis relance npm run generer.',
    '- Sur GitHub : Settings → Secrets and variables → Actions → New repository secret, nom ANTHROPIC_API_KEY.',
    '- Sans clé : utilise le prompt universel (PROMPT-COURS.md) ou l\'Atelier du site.',
  ]
  console.log(message.join('\n'))
  await resumeGithub(['### Inbox : aucune génération', '', ...message])
  process.exit(0)
}

const gabarit = extrairePrompt(await readFile(join(RACINE, 'PROMPT-COURS.md'), 'utf8'))
const matieres = (await lireMatieres()).map(({ slug, nom }) => ({ slug, nom }))

let fonctions = {}
if (!ESSAI) {
  const validation = await chargerValidation()
  if (validation.problemes.length > 0) {
    console.error(couleur.rouge(`Validation impossible :\n- ${validation.problemes.join('\n- ')}`))
    process.exit(1)
  }
  fonctions = validation.fonctions
  console.log(couleur.gris(`modèle : ${MODELE} · effort : ${EFFORT} · repli serveur : ${REPLI ? 'oui' : 'non'}\n`))
}

for (const unite of unites) {
  console.log(`${couleur.bleu('→')} ${couleur.gras(unite.nom)}`)
  try {
    if (ESSAI) {
      await essayer(unite)
      continue
    }
    const resultat = await traiter(unite)
    bilan.crees++
    journalResume.push(`| ${unite.nom} | créé | \`${resultat.cours}\` |`)
  } catch (erreur) {
    if (ESSAI) {
      // Mode essai : on signale, on ne déplace jamais rien.
      console.log(`  ${couleur.jaune('problème')}  ${erreur.message}`)
    } else if (erreur instanceof ProblemeContenu) {
      bilan.aRevoir++
      console.log(`  ${couleur.jaune('à revoir')}  ${erreur.message}`)
      try {
        const ou = await mettreDeCote(unite, erreur)
        console.log(`  ${couleur.gris(`rangé dans ${ou} (avec la réponse de l'IA et les erreurs)`)}`)
      } catch (e) {
        console.log(`  ${couleur.rouge('impossible de ranger la source dans _a-revoir')} : ${e.message}`)
      }
      journalResume.push(`| ${unite.nom} | à revoir | ${echapperTableau(erreur.message)} |`)
    } else {
      bilan.echecs++
      console.log(`  ${couleur.rouge('échec')}  ${erreur.message}`)
      console.log(`  ${couleur.gris('la source reste dans inbox/ : elle sera retentée au prochain passage.')}`)
      journalResume.push(`| ${unite.nom} | échec | ${echapperTableau(erreur.message)} |`)
      if (erreur.fatale) {
        console.log(couleur.rouge('Arrêt : ce problème bloquerait aussi les sources suivantes.'))
        break
      }
    }
  }
  console.log('')
}

if (!ESSAI) {
  const ligne = `${pluriel(bilan.crees, 'cours créé', 'cours créés')}, ${bilan.aRevoir} à revoir, ${pluriel(bilan.echecs, 'échec')}.`
  console.log(couleur.gras(ligne))
  await resumeGithub([
    '### Inbox → cours',
    '',
    ligne,
    '',
    '| Source | Résultat | Détail |',
    '|---|---|---|',
    ...journalResume,
    '',
    bilan.aRevoir > 0 ? 'Les sources « à revoir » sont dans `inbox/_a-revoir/` avec la réponse de l\'IA : corrige-la dans l\'Atelier ou à la main.' : '',
  ])
  process.exitCode = bilan.echecs > 0 ? 1 : 0
}

// --- Collecte des sources ------------------------------------------------------

async function collecterUnites(dossier) {
  const entrees = (await readdir(dossier, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))
  const consignes = new Map() // base → chemin
  const unitesTrouvees = []

  for (const e of entrees) {
    if (e.isFile() && e.name.toLowerCase().endsWith(SUFFIXE_CONSIGNE)) {
      consignes.set(e.name.slice(0, -SUFFIXE_CONSIGNE.length).toLowerCase(), join(dossier, e.name))
    }
  }

  for (const e of entrees) {
    const nom = e.name
    if (nom.startsWith('.') || nom.startsWith('_') || IGNORES.has(nom.toLowerCase())) continue
    const chemin = join(dossier, nom)

    if (e.isDirectory()) {
      const fichiers = (await readdir(chemin, { withFileTypes: true })).filter((f) => f.isFile()).map((f) => f.name).sort()
      const consigne = fichiers.find((f) => f.toLowerCase().endsWith(SUFFIXE_CONSIGNE) || f.toLowerCase() === 'consigne.txt')
      const sources = fichiers.filter((f) => f !== consigne && !f.startsWith('.') && FORMATS[extname(f).toLowerCase()])
      const autres = fichiers.filter((f) => f !== consigne && !f.startsWith('.') && !FORMATS[extname(f).toLowerCase()])
      for (const f of autres) console.log(couleur.gris(`ignoré : ${nom}/${f} (format non pris en charge)`))
      if (sources.length === 0) continue
      unitesTrouvees.push({
        nom: `${nom}/`,
        base: nom,
        dossier: chemin,
        chemins: sources.map((f) => join(chemin, f)),
        consigne: consigne ? join(chemin, consigne) : null,
      })
      continue
    }

    if (!e.isFile() || nom.toLowerCase().endsWith(SUFFIXE_CONSIGNE)) continue
    const ext = extname(nom).toLowerCase()
    if (!FORMATS[ext]) {
      console.log(couleur.gris(`ignoré : ${nom} (format non pris en charge : pdf, png, jpg, jpeg, webp, md, txt)`))
      continue
    }
    const base = nom.slice(0, -ext.length)
    unitesTrouvees.push({ nom, base, dossier: null, chemins: [chemin], consigne: consignes.get(base.toLowerCase()) ?? null })
  }
  return unitesTrouvees
}

/** Consigne : « matiere: react », « type: tp », « niveau: avance » en tête (facultatif), puis le texte libre. */
async function lireConsigne(chemin) {
  const reglages = {}
  if (!chemin) return { reglages, texte: '' }
  const lignes = normaliserFinsDeLigne(await readFile(chemin, 'utf8')).split('\n')
  let i = 0
  for (; i < lignes.length; i++) {
    const m = /^\s*(mati[eè]re|type|niveau)\s*:\s*(.+?)\s*$/i.exec(lignes[i])
    if (!m) break
    const cle = m[1].toLowerCase().startsWith('mati') ? 'matiere' : m[1].toLowerCase()
    reglages[cle] = cle === 'matiere' ? slugifier(m[2], 4) : m[2].toLowerCase()
  }
  return { reglages, texte: lignes.slice(i).join('\n').trim() }
}

/** Prépare les blocs du message : PDF et images d'abord, puis le prompt (qui contient les textes). */
async function preparerMessage(unite) {
  const { reglages, texte: consigne } = await lireConsigne(unite.consigne)
  const blocs = []
  const joints = []
  const textes = []
  const details = []
  let taille = 0
  let images = 0

  for (const chemin of unite.chemins) {
    const nom = basename(chemin)
    const format = FORMATS[extname(nom).toLowerCase()]
    const octets = (await stat(chemin)).size
    details.push(`${nom} (${format.libelle}, ${tailleLisible(octets)})`)

    if (format.genre === 'texte') {
      const contenu = normaliserFinsDeLigne(await readFile(chemin, 'utf8')).trim()
      textes.push(unite.chemins.length > 1 ? `--- Fichier : ${nom} ---\n${contenu}` : contenu)
      taille += contenu.length
      continue
    }

    const base64 = (await readFile(chemin)).toString('base64')
    if (format.genre === 'image') {
      images++
      if (base64.length > LIMITE_IMAGE_BASE64) {
        throw new ProblemeContenu(`${nom} est trop lourde (${tailleLisible(octets)}) : 7,5 Mo maximum par image. Compresse-la ou réduis-la.`)
      }
    }
    joints.push(nom)
    blocs.push({ type: 'text', text: `Fichier joint ${joints.length} : ${nom}` })
    blocs.push(
      format.genre === 'pdf'
        ? { type: 'document', source: { type: 'base64', media_type: format.media, data: base64 } }
        : { type: 'image', source: { type: 'base64', media_type: format.media, data: base64 } },
    )
    taille += base64.length
  }

  if (taille > LIMITE_REQUETE) {
    throw new ProblemeContenu(`la source pèse trop lourd pour une seule requête (${tailleLisible(taille)} encodés, 30 Mo maximum) : découpe-la en plusieurs dépôts.`)
  }
  if (images > IMAGES_CONSEILLEES) {
    console.log(`  ${couleur.jaune('attention')}  ${images} images : au-delà de 20, chaque image doit faire 2000 px de côté au plus.`)
  }

  const prompt = construirePrompt(gabarit, {
    matieres,
    matiere: reglages.matiere,
    type: reglages.type,
    niveau: reglages.niveau,
    consigne,
    date: dateDuJour(),
    source: textes.join('\n\n'),
    nomsFichiersJoints: joints,
  })
  // cache_control : si une correction est nécessaire, le 2e appel relit la source depuis le cache.
  blocs.push({ type: 'text', text: prompt, cache_control: { type: 'ephemeral' } })
  return { blocs, prompt, details, consigne, reglages }
}

// --- Mode essai -------------------------------------------------------------------

async function essayer(unite) {
  const { blocs, prompt, details, consigne, reglages } = await preparerMessage(unite)
  console.log(`  fichiers : ${details.join(', ')}`)
  if (unite.consigne) console.log(`  consigne : ${cheminLisible(unite.consigne) || basename(unite.consigne)}`)
  if (Object.keys(reglages).length) console.log(`  réglages : ${Object.entries(reglages).map(([k, v]) => `${k}=${v}`).join(', ')}`)
  if (consigne) console.log(`  consigne libre : ${consigne.split('\n')[0].slice(0, 100)}`)
  console.log(`  modèle : ${MODELE} · effort : ${EFFORT} · repli serveur : ${REPLI ? 'oui' : 'non'} · max_tokens : ${MAX_TOKENS}`)
  console.log(`  blocs envoyés : ${blocs.map((b) => (b.type === 'text' ? `texte (${b.text.length} car.)` : b.type)).join(' + ')}`)
  console.log(couleur.gris('  ----- prompt -----'))
  console.log(prompt)
  console.log(couleur.gris('  ----- fin du prompt -----'))
}

// --- Traitement d'une source ---------------------------------------------------------

async function traiter(unite) {
  const { blocs, details } = await preparerMessage(unite)
  console.log(`  ${couleur.gris(details.join(', '))}`)

  const messages = [{ role: 'user', content: blocs }]
  let reponse = await appelerClaude(messages)
  let essai = await examiner(reponse)

  if (!essai.ok) {
    console.log(`  ${couleur.jaune('correction')}  ${pluriel(essai.erreurs.length, 'erreur')} : je les renvoie à l'IA une fois.`)
    for (const e of essai.erreurs.slice(0, 8)) console.log(couleur.gris(`    - ${e}`))
    messages.push(
      { role: 'assistant', content: reponse.texte.trim() || '(réponse vide)' },
      {
        role: 'user',
        content: [
          'Ton fichier ne passe pas la validation de Manabi. Erreurs :',
          ...essai.erreurs.map((e) => `- ${e}`),
          '',
          'Corrige-les et renvoie le fichier COMPLET corrigé, au même format : un seul bloc ````markdown … ````, rien avant ni après. Ne change que ce qui est nécessaire.',
        ].join('\n'),
      },
    )
    reponse = await appelerClaude(messages)
    essai = await examiner(reponse)
  }

  if (!essai.ok) {
    const erreur = new ProblemeContenu(`le cours reste invalide après correction (${pluriel(essai.erreurs.length, 'erreur')}).`)
    erreur.reponse = essai.contenu ?? reponse.texte
    erreur.erreurs = essai.erreurs
    throw erreur
  }
  for (const a of essai.avertissements) console.log(`  ${couleur.gris(`note : ${a}`)}`)
  return ecrireCours(unite, essai.contenu, essai.data)
}

/** Extrait, répare et valide la réponse. */
async function examiner(reponse) {
  if (reponse.stopReason === 'refusal') {
    const categorie = reponse.stopDetails?.category ? ` (catégorie : ${reponse.stopDetails.category})` : ''
    const erreur = new ProblemeContenu(`l'IA a refusé de traiter cette source${categorie}. Essaie le prompt universel dans une autre IA, ou reformule la consigne.`)
    erreur.reponse = reponse.texte
    throw erreur
  }
  if (reponse.stopReason === 'max_tokens') {
    const erreur = new ProblemeContenu('réponse coupée (limite de longueur atteinte) : découpe la source en plusieurs dépôts.')
    erreur.reponse = reponse.texte
    throw erreur
  }

  const extrait = extraireFichier(reponse.texte)
  if (!extrait) {
    return { ok: false, contenu: null, erreurs: ['Aucun bloc ````markdown … ```` trouvé dans ta réponse, ni de frontmatter (---).'], avertissements: [] }
  }
  const { texte: contenu, corrections } = await reparer(extrait)
  if (corrections.length) console.log(`  ${couleur.gris(`réparé : ${corrections.join(', ')}`)}`)

  const verdict = await analyserCours(contenu, fonctions)
  const corps = analyserCorps(contenu)
  const erreurs = [...verdict.erreurs, ...corps.erreurs]
  return { ok: verdict.ok && corps.erreurs.length === 0, contenu, data: verdict.data, erreurs, avertissements: corps.avertissements }
}

/** Le contenu du dernier bloc complet à 4 accents graves (ou plus) ; sinon, à partir du frontmatter. */
function extraireFichier(texte) {
  const lignes = normaliserFinsDeLigne(texte).split('\n')
  let dernier = null
  for (let i = 0; i < lignes.length; i++) {
    const ouverture = /^\s*(`{4,}|~{4,})\s*(markdown|md)?\s*$/i.exec(lignes[i])
    if (!ouverture) continue
    const marque = ouverture[1]
    for (let j = i + 1; j < lignes.length; j++) {
      const t = lignes[j].trim()
      if (t.length >= marque.length && [...t].every((c) => c === marque[0])) {
        dernier = lignes.slice(i + 1, j).join('\n')
        i = j
        break
      }
    }
  }
  if (dernier !== null) return dernier

  // Repli : pas de bloc à 4 accents graves (souvent un bloc à 3 autour, ou pas de bloc du tout).
  const debut = lignes.findIndex((l, i) => l.trim() === '---' && lignes.slice(i + 1, i + 4).some((s) => /^(titre\s*:|#\s*fichier)/.test(s.trim())))
  const debutSansTirets = lignes.findIndex((l) => /^titre\s*:/.test(l.trim()))
  const depart = debut !== -1 ? debut : debutSansTirets
  if (depart === -1) return null
  let fin = lignes.length
  while (fin > depart && lignes[fin - 1].trim() === '') fin--
  if (fin > depart && /^\s*(`{3,}|~{3,})\s*$/.test(lignes[fin - 1])) fin--
  return lignes.slice(depart, fin).join('\n')
}

/** Petites réparations sûres : bloc autour, --- manquants, tabulations, guillemets typographiques… */
async function reparer(brut) {
  const corrections = []
  let texte = normaliserFinsDeLigne(brut).trim()

  if (!texte.startsWith('---')) {
    texte = `---\n${texte}`
    corrections.push('--- d\'ouverture ajouté')
  }
  if (!decouperFrontmatter(texte)) {
    // Le YAML s'arrête juste avant la première notion (## …) ou le premier bloc (:::…).
    const lignes = texte.split('\n')
    const i = lignes.findIndex((l, n) => n > 0 && (/^##\s/.test(l) || /^:::/.test(l)))
    if (i !== -1) {
      lignes.splice(i, 0, '---', '')
      texte = lignes.join('\n')
      corrections.push('--- de fermeture ajouté')
    }
  }

  const morceaux = decouperFrontmatter(texte)
  if (!morceaux) return { texte: `${texte}\n`, corrections }

  let yamlTexte = morceaux.yaml
  if (yamlTexte.includes('\t')) {
    yamlTexte = yamlTexte.replace(/\t/g, '  ')
    corrections.push('tabulations remplacées')
  }
  // « titre: “Texte” » → « titre: "Texte" » (seulement quand les guillemets typographiques délimitent la valeur).
  const avant = yamlTexte
  yamlTexte = yamlTexte
    .split('\n')
    .map((ligne) => {
      const m = /^(\s*(?:-\s+)?(?:[A-Za-z_][\w-]*\s*:\s+)?)[“”„](.*)[“”]\s*$/.exec(ligne)
      return m ? `${m[1]}"${m[2].replace(/(?<!\\)"/g, '\\"')}"` : ligne
    })
    .join('\n')
  if (yamlTexte !== avant) corrections.push('guillemets typographiques')

  // Si le YAML ne se lit pas : guillemets doubles et barres obliques inverses non échappés.
  const yaml = await chargerYaml()
  if (yaml && !yamlValide(yaml, yamlTexte)) {
    const tente = yamlTexte
      .split('\n')
      .map((ligne) => {
        const m = /^(\s*(?:-\s+)?(?:[A-Za-z_][\w-]*\s*:\s+)?)"(.*)"\s*$/.exec(ligne)
        if (!m) return ligne
        const interieur = m[2].replace(/\\(?!["\\nt])/g, '\\\\').replace(/(?<!\\)"/g, '\\"')
        return `${m[1]}"${interieur}"`
      })
      .join('\n')
    if (yamlValide(yaml, tente)) {
      yamlTexte = tente
      corrections.push('guillemets échappés dans le YAML')
    }
  }

  const corps = morceaux.corps.replace(/^\n*/, '')
  return { texte: `---\n${yamlTexte}\n---\n\n${corps.trimEnd()}\n`, corrections }
}

function yamlValide(yaml, texte) {
  try {
    yaml.parse(texte)
    return true
  } catch {
    return false
  }
}

// --- Écriture du cours ------------------------------------------------------------------

async function ecrireCours(unite, contenu, data) {
  const yaml = await chargerYaml()
  const morceaux = decouperFrontmatter(contenu)
  let brut = {}
  try {
    brut = yaml.parse(morceaux.yaml) ?? {}
  } catch {
    /* déjà validé : ne devrait pas arriver */
  }

  const matiere = String(data?.matiere ?? brut.matiere ?? '').trim()
  if (!MOTIF_SLUG.test(matiere)) throw new ProblemeContenu(`matière « ${matiere} » invalide.`)

  // Nom du fichier : NN-slug.md
  const conseil = /^#\s*fichier\s*:\s*(\d{1,2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md\s*$/m.exec(morceaux.yaml)
  const slug = conseil?.[2] ?? (slugifier(data?.titre ?? brut.titre ?? '', 5) || 'cours')
  const pris = await numerosPris(matiere)
  const chapitreIA = Number.isInteger(brut.chapitre) ? brut.chapitre : null
  let numero = chapitreIA && chapitreIA >= 1 && chapitreIA <= 99 && !pris.has(chapitreIA) ? chapitreIA : pris.size ? Math.max(...pris) + 1 : 1
  const dossierCours = join(DOSSIER_COURS, matiere)
  while (existsSync(join(dossierCours, `${deuxChiffres(numero)}-${slug}.md`))) numero++
  if (numero > 99) throw new ProblemeContenu(`la matière « ${matiere} » a déjà 99 chapitres.`)
  const nomFichier = `${deuxChiffres(numero)}-${slug}.md`

  let yamlTexte = morceaux.yaml
  yamlTexte = conseil ? yamlTexte.replace(/^#\s*fichier\s*:.*$/m, `# fichier : ${nomFichier}`) : `# fichier : ${nomFichier}\n${yamlTexte}`
  if (chapitreIA !== null && chapitreIA !== numero) yamlTexte = yamlTexte.replace(/^chapitre\s*:.*$/m, `chapitre: ${numero}`)

  // Matière : créée si elle n'existe pas (avec nouvelleMatiere si l'IA l'a fournie).
  if (!existsSync(join(DOSSIER_MATIERES, `${matiere}.yaml`)) && !existsSync(join(DOSSIER_MATIERES, `${matiere}.yml`))) {
    await creerMatiere(matiere, brut.nouvelleMatiere)
  }
  // nouvelleMatiere ne sert qu'à créer le tome : on ne le garde pas dans le cours.
  yamlTexte = retirerCle(yamlTexte, 'nouvelleMatiere')

  // Fichiers joints (PDF, images) → public/media/<matiere>/ et champ « fichiers ».
  const dossierMedia = join(DOSSIER_PUBLIC, 'media', matiere)
  const medias = []
  for (const chemin of unite.chemins) {
    const ext = extname(chemin).toLowerCase()
    if (FORMATS[ext].genre === 'texte') continue
    const base = basename(chemin, extname(chemin))
    let nomMedia = `${deuxChiffres(numero)}-${slugifier(base, 6) || 'fichier'}${ext === '.jpeg' ? '.jpg' : ext}`
    for (let k = 2; existsSync(join(dossierMedia, nomMedia)); k++) {
      nomMedia = `${deuxChiffres(numero)}-${slugifier(base, 6) || 'fichier'}-${k}${ext === '.jpeg' ? '.jpg' : ext}`
    }
    medias.push({ source: chemin, destination: join(dossierMedia, nomMedia), titre: titreDepuisNom(base, ext), chemin: `/media/${matiere}/${nomMedia}` })
  }
  if (medias.length > 0) yamlTexte = ajouterFichiers(yamlTexte, medias, yaml)

  const texteFinal = `---\n${yamlTexte}\n---\n\n${morceaux.corps.replace(/^\n*/, '').trimEnd()}\n`

  // D'abord écrire (cours + médias), ensuite seulement vider inbox/.
  await mkdir(dossierCours, { recursive: true })
  const cheminCours = join(dossierCours, nomFichier)
  await writeFile(cheminCours, texteFinal, { encoding: 'utf8', flag: 'wx' })
  console.log(`  ${couleur.vert('créé')}  ${cheminLisible(cheminCours)}`)
  for (const m of medias) {
    await mkdir(dossierMedia, { recursive: true })
    await copyFile(m.source, m.destination)
    console.log(`  ${couleur.vert('rangé')}  ${cheminLisible(m.destination)}`)
  }
  await viderSource(unite)
  return { cours: cheminLisible(cheminCours) }
}

/** Retire une clé de premier niveau du YAML (la ligne « cle: » et ses lignes indentées). */
function retirerCle(yamlTexte, cle) {
  const lignes = yamlTexte.split('\n')
  const debut = lignes.findIndex((l) => new RegExp(`^${cle}\\s*:`).test(l))
  if (debut === -1) return yamlTexte
  let fin = debut + 1
  while (fin < lignes.length && (/^\s/.test(lignes[fin]) || lignes[fin].trim() === '')) fin++
  lignes.splice(debut, fin - debut)
  return lignes.join('\n')
}

function ajouterFichiers(yamlTexte, medias, yaml) {
  let existants = []
  try {
    const d = yaml.parse(yamlTexte)
    if (Array.isArray(d?.fichiers)) existants = d.fichiers.filter((f) => f && typeof f.chemin === 'string')
  } catch {
    /* ignoré */
  }
  const lignes = retirerCle(yamlTexte, 'fichiers').split('\n')
  while (lignes.length > 0 && lignes[lignes.length - 1].trim() === '') lignes.pop()
  const tous = [...existants, ...medias.map(({ titre, chemin }) => ({ titre, chemin }))]
  lignes.push('fichiers:')
  for (const f of tous) {
    lignes.push(`  - titre: ${JSON.stringify(String(f.titre ?? basename(f.chemin)))}`, `    chemin: ${JSON.stringify(f.chemin)}`)
  }
  return lignes.join('\n')
}

async function creerMatiere(slug, proposee) {
  const p = proposee && typeof proposee === 'object' ? proposee : {}
  const matieresActuelles = await lireMatieres()
  const ordre = matieresActuelles.reduce((max, m) => (m.ordre < 999 ? Math.max(max, m.ordre) : max), 0) + 1
  const nom = typeof p.nom === 'string' && p.nom.trim() ? p.nom.trim() : nomDepuisSlug(slug)
  const kanji = typeof p.kanji === 'string' && [...p.kanji.trim()].length === 1 ? p.kanji.trim() : nom.charAt(0).toUpperCase()
  const contenu = yamlMatiere({
    nom,
    kanji,
    lecture: typeof p.lecture === 'string' && p.lecture.trim() ? p.lecture.trim() : 'à compléter — lecture et sens du kanji',
    couleur: COULEURS_MATIERE.includes(p.couleur) ? p.couleur : 'sumi',
    description: typeof p.description === 'string' && p.description.trim() ? p.description.trim() : `Les cours de ${nom}.`,
    ordre,
  })
  if (typeof fonctions.validerMatiere === 'function') {
    const yaml = await chargerYaml()
    const r = fonctions.validerMatiere(yaml.parse(contenu))
    if (!r.ok) console.log(`  ${couleur.jaune('attention')}  matière à vérifier : ${(r.erreurs ?? []).join(' ; ')}`)
  }
  await mkdir(DOSSIER_MATIERES, { recursive: true })
  const chemin = join(DOSSIER_MATIERES, `${slug}.yaml`)
  await writeFile(chemin, contenu, { encoding: 'utf8', flag: 'wx' })
  console.log(`  ${couleur.vert('matière')}  ${cheminLisible(chemin)} (${nom}, ${kanji})`)
}

async function viderSource(unite) {
  const aSupprimer = [...unite.chemins, ...(unite.consigne ? [unite.consigne] : [])]
  for (const chemin of aSupprimer) await rm(chemin, { force: true })
  if (unite.dossier) {
    try {
      await rmdir(unite.dossier) // seulement s'il est vide
    } catch {
      console.log(couleur.gris(`  ${unite.nom} n'est pas vide (fichiers ignorés) : laissé en place.`))
    }
  }
}

/** Range la source et la réponse de l'IA dans inbox/_a-revoir/<nom>/ pour une correction à la main. */
async function mettreDeCote(unite, erreur) {
  const racine = join(DOSSIER_INBOX, DOSSIER_A_REVOIR)
  let cible = join(racine, unite.base)
  for (let k = 2; existsSync(cible); k++) cible = join(racine, `${unite.base}-${k}`)
  await mkdir(cible, { recursive: true })
  const aDeplacer = [...unite.chemins, ...(unite.consigne ? [unite.consigne] : [])]
  for (const chemin of aDeplacer) await deplacer(chemin, join(cible, basename(chemin)))
  if (unite.dossier) await rmdir(unite.dossier).catch(() => {})
  const explication = [
    `Source : ${unite.nom}`,
    `Date : ${new Date().toISOString()}`,
    `Problème : ${erreur.message}`,
    ...(erreur.erreurs?.length ? ['', 'Erreurs de validation :', ...erreur.erreurs.map((e) => `- ${e}`)] : []),
    '',
    'Que faire :',
    ...(erreur.reponse
      ? ['- corrige reponse-ia.md (ou colle-la dans l\'Atelier, étape Vérifier), puis range-la dans src/content/cours/<matiere>/ ;']
      : []),
    '- remets la source dans inbox/ (avec une consigne <nom>.consigne.txt plus précise) pour relancer la génération ;',
    '- ou passe par le prompt universel (PROMPT-COURS.md) dans une autre IA.',
    '',
  ].join('\n')
  await writeFile(join(cible, 'erreurs.txt'), explication, 'utf8')
  if (erreur.reponse) await writeFile(join(cible, 'reponse-ia.md'), `${String(erreur.reponse).trim()}\n`, 'utf8')
  return cheminLisible(cible) || cible
}

async function deplacer(source, destination) {
  try {
    await rename(source, destination)
  } catch {
    await copyFile(source, destination)
    await rm(source, { force: true })
  }
}

// --- API Claude (Messages, streaming SSE) ------------------------------------------------

async function appelerClaude(messages) {
  const options = { repli: REPLI, effort: EFFORT }

  for (let tentative = 1; ; tentative++) {
    const corps = { model: MODELE, max_tokens: MAX_TOKENS, stream: true, messages }
    if (options.effort) corps.output_config = { effort: options.effort }
    if (options.repli) corps.fallbacks = 'default'
    const entetes = { 'content-type': 'application/json', 'x-api-key': CLE, 'anthropic-version': VERSION_API }
    if (options.repli) entetes['anthropic-beta'] = BETA_REPLI

    let reponseHttp
    try {
      reponseHttp = await fetch(URL_API, {
        method: 'POST',
        headers: entetes,
        body: JSON.stringify(corps),
        signal: AbortSignal.timeout(DELAI_REQUETE_MS),
      })
    } catch (e) {
      if (tentative < TENTATIVES_MAX) {
        await patienter(delaiAttente(tentative), `connexion impossible (${e.cause?.code ?? e.name})`)
        continue
      }
      throw new ErreurApi(`connexion à l'API impossible : ${e.message}`, { reessayable: true })
    }

    if (!reponseHttp.ok) {
      const brut = await reponseHttp.text()
      let detail = brut.slice(0, 300)
      try {
        detail = JSON.parse(brut).error?.message ?? detail
      } catch {
        /* réponse non JSON */
      }
      const statut = reponseHttp.status
      // Fonction facultative refusée par ce modèle ou ce compte : on l'enlève et on recommence.
      if (statut === 400 && options.repli && /fallback|anthropic-beta/i.test(detail)) {
        options.repli = false
        console.log(couleur.gris('  repli serveur indisponible : nouvel essai sans.'))
        continue
      }
      if (statut === 400 && options.effort && /effort|output_config/i.test(detail)) {
        options.effort = null
        console.log(couleur.gris('  réglage d\'effort refusé par ce modèle : nouvel essai sans.'))
        continue
      }
      if (CODES_REESSAYABLES.has(statut) && tentative < TENTATIVES_MAX) {
        await patienter(delaiAttente(tentative, reponseHttp.headers.get('retry-after')), `HTTP ${statut}`)
        continue
      }
      throw erreurHttp(statut, detail)
    }

    try {
      return await lireFlux(reponseHttp)
    } catch (e) {
      if (e instanceof ErreurApi && e.reessayable && tentative < TENTATIVES_MAX) {
        await patienter(delaiAttente(tentative), e.message)
        continue
      }
      throw e
    }
  }
}

function erreurHttp(statut, detail) {
  const messages = {
    400: [`requête refusée (400) : ${detail}`, { reessayable: false }],
    401: [`clé API refusée (401) : vérifie ANTHROPIC_API_KEY. ${detail}`, { fatale: true }],
    402: [`problème de facturation (402) : vérifie le crédit et le plafond de dépenses du compte Anthropic. ${detail}`, { fatale: true }],
    403: [`accès refusé (403) : ${detail}`, { fatale: true }],
    404: [`modèle « ${MODELE} » introuvable ou non disponible pour ce compte (404) : vérifie MANABI_MODELE. ${detail}`, { fatale: true }],
    413: [`requête trop grosse (413) : réduis la source (PDF plus court, images compressées). ${detail}`, { reessayable: false }],
    429: [`trop de requêtes (429) : réessaie plus tard. ${detail}`, { reessayable: true }],
    529: [`API surchargée (529) : réessaie plus tard. ${detail}`, { reessayable: true }],
  }
  const [message, options] = messages[statut] ?? [`erreur ${statut} de l'API : ${detail}`, { reessayable: statut >= 500 }]
  // 400 et 413 viennent en général de la source elle-même (PDF illisible, trop gros) : _a-revoir.
  if (statut === 400 || statut === 413) return new ProblemeContenu(message)
  return new ErreurApi(message, { ...options, statut })
}

/** Lit le flux SSE et renvoie { texte, stopReason, stopDetails, modele, usage }. */
async function lireFlux(reponseHttp) {
  const decodeur = new TextDecoder()
  const blocs = []
  const etat = { modele: MODELE, stopReason: null, stopDetails: null, usage: {}, fini: false }
  let tampon = ''
  let caracteres = 0
  let dernierePosition = Date.now()
  const enDirect = Boolean(process.stderr.isTTY)

  const traiterEvenement = (brut) => {
    const donnees = brut
      .split('\n')
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).replace(/^ /, ''))
      .join('\n')
    if (!donnees) return
    let evt
    try {
      evt = JSON.parse(donnees)
    } catch {
      return
    }
    switch (evt.type) {
      case 'message_start':
        etat.modele = evt.message?.model ?? etat.modele
        Object.assign(etat.usage, evt.message?.usage ?? {})
        break
      case 'content_block_start': {
        const bloc = evt.content_block ?? {}
        blocs[evt.index] = { type: bloc.type, texte: typeof bloc.text === 'string' ? bloc.text : '' }
        if (bloc.type === 'fallback') {
          console.log(couleur.gris(`\n  repli : ${bloc.from?.model ?? '?'} a refusé, ${bloc.to?.model ?? '?'} continue.`))
          etat.modele = bloc.to?.model ?? etat.modele
        }
        break
      }
      case 'content_block_delta':
        if (evt.delta?.type === 'text_delta' && blocs[evt.index]) {
          blocs[evt.index].texte += evt.delta.text
          caracteres += evt.delta.text.length
        }
        break
      case 'message_delta':
        etat.stopReason = evt.delta?.stop_reason ?? etat.stopReason
        etat.stopDetails = evt.delta?.stop_details ?? evt.stop_details ?? etat.stopDetails
        Object.assign(etat.usage, evt.usage ?? {})
        break
      case 'message_stop':
        etat.fini = true
        break
      case 'error': {
        const type = evt.error?.type ?? 'error'
        const reessayable = ['overloaded_error', 'api_error', 'rate_limit_error'].includes(type)
        throw new ErreurApi(`erreur pendant la réponse (${type}) : ${evt.error?.message ?? ''}`, { reessayable })
      }
      default:
        break // ping, etc.
    }
  }

  for await (const morceau of reponseHttp.body) {
    tampon += decodeur.decode(morceau, { stream: true }).replace(/\r\n?/g, '\n')
    let fin
    while ((fin = tampon.indexOf('\n\n')) !== -1) {
      traiterEvenement(tampon.slice(0, fin))
      tampon = tampon.slice(fin + 2)
    }
    if (enDirect) process.stderr.write(`\r  réception… ${caracteres} caractères   `)
    else if (Date.now() - dernierePosition > 20000) {
      console.log(couleur.gris(`  réception… ${caracteres} caractères`))
      dernierePosition = Date.now()
    }
  }
  if (tampon.trim()) traiterEvenement(tampon)
  if (enDirect) process.stderr.write('\r\x1b[2K')

  if (!etat.fini) throw new ErreurApi('la réponse a été coupée avant la fin (connexion interrompue).', { reessayable: true })

  const texte = blocs.filter((b) => b?.type === 'text').map((b) => b.texte).join('')
  const u = etat.usage
  const cache = u.cache_read_input_tokens ? `, ${u.cache_read_input_tokens} lus depuis le cache` : ''
  console.log(couleur.gris(`  ${etat.modele} : ${u.input_tokens ?? '?'} jetons en entrée${cache}, ${u.output_tokens ?? '?'} en sortie (arrêt : ${etat.stopReason ?? '?'})`))
  return { texte, stopReason: etat.stopReason, stopDetails: etat.stopDetails, modele: etat.modele, usage: u }
}

function delaiAttente(tentative, retryAfter = null) {
  const secondes = Number(retryAfter)
  if (Number.isFinite(secondes) && secondes > 0) return Math.min(secondes * 1000, 120000)
  return Math.min(2000 * 2 ** (tentative - 1), 60000) + Math.floor(Math.random() * 1000)
}

async function patienter(ms, raison) {
  console.log(couleur.gris(`  ${raison} : nouvel essai dans ${Math.round(ms / 1000)} s…`))
  await new Promise((r) => setTimeout(r, ms))
}

// --- Divers ---------------------------------------------------------------------

function tailleLisible(octets) {
  if (octets < 1024) return `${octets} o`
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(0)} Ko`
  return `${(octets / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`
}

function titreDepuisNom(base, ext) {
  const texte = base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Fichier'
  const genre = FORMATS[ext]?.genre === 'pdf' ? 'PDF' : 'image'
  return `${texte.charAt(0).toUpperCase()}${texte.slice(1)} (${genre})`
}

function echapperTableau(texte) {
  return String(texte).replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

async function resumeGithub(lignes) {
  const fichier = process.env.GITHUB_STEP_SUMMARY
  if (!fichier) return
  try {
    await appendFile(fichier, `${lignes.join('\n')}\n`, 'utf8')
  } catch {
    /* le résumé est un plus, pas une obligation */
  }
}
