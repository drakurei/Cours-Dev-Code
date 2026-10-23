---
titre: "Intro à React : du JavaScript pur à Vite"
matiere: react
type: cours
chapitre: 1
niveau: debutant
duree: 8
date: 2026-09-22
source: "Cours live React (Discord)"
tags: [react, vite, npm, bases]
essentiel: "React est une bibliothèque JavaScript pour construire des interfaces. Tu décris ce que tu veux voir, React met la page à jour. Un projet se crée avec Vite, et le fichier main.jsx affiche le composant App dans la div #root de index.html."
retenir:
  - "React est une bibliothèque JavaScript : tu décris l'interface, React s'occupe de mettre la page à jour."
  - "Un projet React se crée et se lance avec Vite : npm create vite@latest, npm install, npm run dev."
  - "Il n'y a qu'une seule page HTML : React s'accroche à la div #root et y affiche App."
  - "Une bibliothèque s'installe avec npm install, puis ne marche qu'une fois importée dans le code."
  - "On ne touche jamais à node_modules : il se recrée avec npm install."
definitions:
  - terme: "React"
    definition: "Bibliothèque JavaScript pour construire des interfaces à partir de composants. Elle met la page à jour à ta place."
  - terme: "DOM"
    definition: "La page HTML vue comme un arbre d'objets que JavaScript peut lire et modifier. Avec React, tu ne le manipules plus à la main."
    exemple: "document.getElementById('root')"
  - terme: "Déclaratif"
    definition: "Style de code où tu décris le résultat voulu, sans écrire chaque étape. React est déclaratif ; document.createElement est impératif."
  - terme: "Vite"
    definition: "L'outil qui crée le projet, lance le serveur local et fabrique la version finale du site (le build) dans dist/."
    exemple: "npm create vite@latest mon-projet"
  - terme: "npm"
    definition: "L'installateur de bibliothèques (npm install) et le lanceur des scripts du package.json (npm run dev)."
    exemple: "npm install bootstrap"
  - terme: "Dépendance"
    definition: "Une bibliothèque dont le projet a besoin, listée dans package.json et installée dans node_modules."
    exemple: "`\"react\": \"^19.2.8\"`"
  - terme: "HMR"
    definition: "Rechargement à chaud (Hot Module Replacement) : tu sauvegardes un fichier, la page se met à jour toute seule, sans recharger."
flashcards:
  - q: "React, c'est un langage ?"
    r: "Non : c'est une bibliothèque JavaScript pour construire des interfaces."
  - q: "Impératif ou déclaratif : lequel décrit React ?"
    r: "Déclaratif : tu dis ce que tu veux voir, React s'occupe du comment."
  - q: "À quoi sert le paquet react-dom ?"
    r: "À afficher les composants React dans le navigateur, c'est-à-dire dans le DOM."
  - q: "Les 3 commandes pour démarrer un projet Vite ?"
    r: "`npm create vite@latest mon-projet`, puis `npm install` dans le dossier, puis `npm run dev`."
  - q: "Sur quelle adresse tourne le serveur de Vite par défaut ?"
    r: "`http://localhost:5173`"
  - q: "Que contient index.html d'indispensable pour React ?"
    r: "Une `<div id=\"root\">` : React y affiche toute l'application."
  - q: "Que fait la dernière ligne de main.jsx ?"
    r: "Elle prend la div #root et y affiche le composant `<App />`."
  - q: "Pourquoi un console.log de composant s'affiche deux fois en développement ?"
    r: "`StrictMode` exécute les composants deux fois pour repérer les erreurs. C'est normal, ça n'arrive pas en production."
  - q: "Les classes Bootstrap ne font rien : quelle est la cause la plus probable ?"
    r: "L'import du CSS de Bootstrap manque dans `main.jsx`."
  - q: "« Missing script: \"dev\" » : que faire ?"
    r: "Le terminal n'est pas dans le dossier du projet : fais `cd mon-projet`, puis relance `npm run dev`."
quiz:
  - question: "Que fait `createRoot(document.getElementById('root')).render(<App />)` ?"
    choix:
      - "Il crée un nouveau fichier App.jsx"
      - "Il affiche le composant App dans la div #root"
      - "Il installe React dans le projet"
      - "Il lance le serveur local"
    reponse: "Il affiche le composant App dans la div #root"
    explication: "C'est le branchement de main.jsx : React prend la div #root de index.html et y affiche App."
  - question: "Quelle commande lance le serveur de développement ?"
    choix:
      - "npm install"
      - "npm run dev"
      - "npm run build"
      - "npm create vite@latest"
    reponse: "npm run dev"
    explication: "npm install installe les dépendances, npm run build fabrique le site dans dist/, npm create vite@latest crée le projet."
  - question: "Tu lances `npm run dev` et tu lis « Missing script: \"dev\" ». Pourquoi ?"
    choix:
      - "React n'est pas installé"
      - "Le terminal n'est pas dans le dossier du projet"
      - "Le port 5173 est déjà occupé"
      - "Il faut écrire npm dev"
    reponse: "Le terminal n'est pas dans le dossier du projet"
    explication: "npm lit le package.json du dossier où tu es. S'il n'y trouve pas de script dev, il s'arrête. Fais cd dans le dossier du projet."
  - question: "Quel est le rôle du paquet react-dom ?"
    choix:
      - "Gérer les adresses des pages"
      - "Afficher les composants dans le navigateur"
      - "Installer les dépendances"
      - "Écrire le CSS à ta place"
    reponse: "Afficher les composants dans le navigateur"
    explication: "react contient la logique (composants, état), react-dom fait le lien avec la page du navigateur."
  - question: "React est dit déclaratif. Ça veut dire que…"
    choix:
      - "Tu décris le résultat voulu, React met la page à jour"
      - "Tu crées chaque balise avec document.createElement"
      - "Tu déclares toutes les variables avec var"
    reponse: "Tu décris le résultat voulu, React met la page à jour"
    explication: "Créer les balises à la main, c'est le style impératif du JavaScript pur. Avec React, tu écris le JSX du résultat."
  - question: "Tu supprimes le dossier node_modules par erreur. Que fais-tu ?"
    choix:
      - "Tu recrées le projet avec Vite"
      - "Tu relances npm install"
      - "Tu le récupères dans la corbeille, sinon le projet est perdu"
    reponse: "Tu relances npm install"
    explication: "node_modules se reconstruit à partir de package.json. C'est pour ça qu'on ne le pousse jamais sur GitHub."
exercices:
  - titre: "Démarrer un projet Vite"
    niveau: facile
    enonce: "Crée un projet React nommé essai-react avec Vite, installe les dépendances et lance le serveur. Ouvre l'adresse affichée dans le terminal."
    indices:
      - "La première commande commence par npm create vite@latest."
      - "Choisis React, puis JavaScript. À « Install with npm and start now? », réponds No."
      - "Entre dans le dossier avec cd avant npm install."
    solution: |
      ```bash
      npm create vite@latest essai-react   # choisir React, puis JavaScript
      cd essai-react
      npm install
      npm run dev                          # ouvrir http://localhost:5173
      ```
  - titre: "Ajouter Bootstrap"
    niveau: moyen
    enonce: "Dans essai-react, installe Bootstrap et fais en sorte qu'un `<button className=\"btn btn-primary\">` s'affiche en bleu."
    indices:
      - "L'installation se fait dans le terminal, dans le dossier du projet."
      - "Installer ne suffit pas : il faut importer le CSS de Bootstrap."
      - "L'import se met dans src/main.jsx, avant celui de index.css."
    solution: |
      ```bash
      npm install bootstrap
      ```

      ```jsx
      // src/main.jsx
      import 'bootstrap/dist/css/bootstrap.min.css'
      import './index.css'

      // src/App.jsx
      function App() {
        return <button className="btn btn-primary">Bonjour</button>
      }

      export default App
      ```
  - titre: "main.jsx de mémoire"
    niveau: difficile
    enonce: "Sans regarder, réécris src/main.jsx : il importe createRoot, StrictMode et App, puis affiche `<App />` dans la div #root, entouré de StrictMode."
    indices:
      - "createRoot vient de 'react-dom/client', StrictMode vient de 'react'."
      - "document.getElementById('root') retrouve la div de index.html."
      - "La fin ressemble à `.render(<StrictMode><App /></StrictMode>)`."
    solution: |
      ```jsx
      import { StrictMode } from 'react'
      import { createRoot } from 'react-dom/client'
      import App from './App.jsx'

      createRoot(document.getElementById('root')).render(
        <StrictMode>
          <App />
        </StrictMode>,
      )
      ```
---

## React, c'est quoi ?

:::quoi
**React** est une **bibliothèque JavaScript** pour construire des interfaces. Tu **décris** ce que tu veux voir, React met la page à jour à ta place.
:::

:::exemple
```jsx
// JavaScript pur : je dis COMMENT faire, étape par étape (impératif)
const titre = document.createElement('h1')
titre.textContent = 'Bonjour'
document.body.appendChild(titre)

// React : je dis CE QUE je veux voir (déclaratif)
<h1>Bonjour</h1>
```
:::

:::piege
React n'est pas un nouveau langage : c'est du **JavaScript**. Fonctions, tableaux, objets : tout ce que tu sais en JS sert directement.
:::

:::ou[Dans mon-blog]
Tu n'écris jamais `document.createElement` : tout l'affichage est décrit en JSX dans `src/App.jsx` et `src/components/`.
:::

## Les deux paquets : react et react-dom

:::quoi
Le cœur de React tient en deux paquets : **react** (la logique : composants, état) et **react-dom** (l'affichage dans le navigateur).
:::

:::exemple
```json title="package.json"
"dependencies": {
  "bootstrap": "^5.3.8",
  "react": "^19.2.8",
  "react-dom": "^19.2.8"
}
```
:::

:::piege
`createRoot` vient de **react-dom/client**, pas de `react`. Mauvais paquet dans l'import : page blanche et erreur dans la console.
:::

:::ou[Dans mes projets]
Le `package.json` de mon-blog et celui de PokéBistro listent tous les deux `react` et `react-dom` en version 19.
:::

## Créer et lancer un projet avec Vite

:::quoi
**Vite** crée le projet React et lance un **serveur local**. La page se met à jour à chaque sauvegarde : c'est le HMR.
:::

:::exemple
```bash
npm create vite@latest mon-projet   # choisir React, puis JavaScript
cd mon-projet
npm install                         # installe les dépendances dans node_modules
npm run dev                         # serveur local : http://localhost:5173
```
:::

:::piege
« Could not read package.json » ou « Missing script: "dev" » : le terminal n'est pas **dans le dossier du projet**. Fais `cd` d'abord.
:::

:::ou[Dans mes projets]
mon-blog est dans `exo-React/mon-blog`, PokéBistro dans `exo-React/poke-bistro` : c'est là qu'il faut être avant `npm run dev`.
:::

:::info
En cours, le prof est passé par le JavaScript pur, puis par React chargé par un **CDN**, puis par Vite. C'était pour voir d'où ça vient : dans tes projets, c'est **toujours Vite**.
:::

## Les fichiers importants

:::quoi
Il n'y a qu'**une seule page HTML** : `index.html`. React s'accroche à sa `<div id="root">` et y affiche tout le site.
:::

:::exemple
```text
index.html        la seule page HTML, avec <div id="root"></div>
src/main.jsx      le branchement de React
src/App.jsx       le composant principal
src/components/   tes composants
src/data/         tes données
package.json      nom, scripts et dépendances du projet
```
:::

:::piege
On ne touche **jamais** à `node_modules` : il se recrée avec `npm install`. Il est dans `.gitignore`, donc il ne part pas sur GitHub.
:::

:::ou[Dans mon-blog]
Exactement cette structure, avec en plus `src/App.css` pour ton CSS perso et `src/data/articles.js` pour les 13 articles.
:::

## main.jsx : le branchement

:::quoi
`main.jsx` est le **point d'entrée** : il prend la `div#root` de `index.html` et y affiche `<App />`. Ce fichier est à connaître par cœur.
:::

:::exemple
```jsx title="src/main.jsx"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```
:::

:::piege
Un id différent (`'app'` au lieu de `'root'`) : page blanche et erreur « Target container is not a DOM element ».
:::

:::ou[Dans mes projets]
Le `src/main.jsx` de mon-blog et celui de PokéBistro suivent ce modèle, avec en plus leurs imports de CSS.
:::

:::info
En développement, **StrictMode** exécute tes composants **deux fois** pour repérer les erreurs. Un `console.log` dans un composant s'affiche donc en double : c'est normal.
:::

## Installer une bibliothèque

:::quoi
On installe avec `npm install`, puis on **importe** dans le code. Sans import, rien ne se charge.
:::

:::exemple
```jsx title="src/main.jsx"
// d'abord, dans le terminal : npm install bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js' // pour le menu burger
import './index.css'
```
:::

:::piege
Les classes `container`, `btn`… sont écrites mais **rien ne change** : l'import du CSS de Bootstrap manque dans `main.jsx`.
:::

:::ou[Dans mes projets]
mon-blog importe le CSS et le JS de Bootstrap dans `src/main.jsx`. PokéBistro importe Bootstrap dans `src/styles/globals.css` et gère le menu burger avec un état React, sans le JS de Bootstrap.
:::
