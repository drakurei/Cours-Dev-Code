---
titre: "Les composants : découper l'interface"
matiere: react
type: cours
chapitre: 3
niveau: debutant
duree: 9
date: 2026-09-22
source: "Cours live React (Discord)"
tags: [react, composants, import, export]
essentiel: "Un composant est une fonction qui retourne du JSX, avec un nom qui commence par une Majuscule. On en met un par fichier : ce fichier l'exporte avec export default, celui qui l'utilise l'importe. Ensuite, il s'utilise comme une balise."
retenir:
  - "Un composant est une fonction qui retourne du JSX, nommée en PascalCase."
  - "Un fichier par composant, rangé dans src/components/ ; App.jsx assemble le tout."
  - "Le fichier du composant l'exporte (export default), celui qui l'utilise l'importe (import)."
  - "Export par défaut : import sans accolades. Export nommé : import avec accolades et le même nom."
  - "Une page React est un arbre de composants : App est le parent de tous les autres."
definitions:
  - terme: "Composant"
    definition: "Une fonction qui retourne du JSX, utilisée comme une balise. Un morceau d'interface réutilisable."
    exemple: "function Header() { return <h1>Mon Blog</h1> }"
  - terme: "PascalCase"
    definition: "Écriture où chaque mot commence par une majuscule. Obligatoire pour les noms de composants."
    exemple: "`SearchBar`, `CategoryFilter`, `MotsCles`"
  - terme: "Export par défaut"
    definition: "La chose principale qu'un fichier rend disponible, avec export default. Un seul par fichier ; il s'importe sans accolades."
    exemple: "export default Footer"
  - terme: "Export nommé"
    definition: "Une chose exportée par son nom, avec export devant sa déclaration. Un fichier peut en avoir plusieurs ; ils s'importent entre accolades."
    exemple: "export const tags = ['populaire', 'épicé']"
  - terme: "Import"
    definition: "La ligne qui fait entrer dans un fichier ce qu'un autre fichier exporte."
    exemple: "import Footer from './components/Footer'"
  - terme: "Chemin relatif"
    definition: "Un chemin qui part du fichier actuel : ./ veut dire « le même dossier », ../ « le dossier au-dessus »."
    exemple: "import IconHeart from './IconHeart'"
  - terme: "Parent et enfant"
    definition: "Un composant qui en affiche un autre est son parent ; celui qui est affiché est son enfant."
    exemple: "App est le parent de Article"
flashcards:
  - q: "C'est quoi un composant React ?"
    r: "Une fonction qui retourne du JSX, nommée en PascalCase, utilisée comme une balise : `<Article />`."
  - q: "Pourquoi un composant doit commencer par une majuscule ?"
    r: "En minuscule, React croit que c'est une balise HTML et n'appelle pas ta fonction."
  - q: "Que fait `export default Footer` ?"
    r: "Il rend le composant Footer utilisable dans les autres fichiers."
  - q: "Comment utiliser Footer dans App.jsx ?"
    r: "`import Footer from './components/Footer'` en haut du fichier, puis `<Footer />` dans le JSX."
  - q: "L'extension .jsx est-elle obligatoire dans l'import ?"
    r: "Non, Vite la retrouve tout seul : './components/Nav' suffit."
  - q: "Que veut dire ./ au début d'un chemin d'import ?"
    r: "« À partir du dossier du fichier actuel ». ../ remonte d'un dossier."
  - q: "« Footer is not defined » : quelle est la cause ?"
    r: "L'import de Footer manque en haut du fichier."
  - q: "« Failed to resolve import » : quelle est la cause ?"
    r: "Le chemin ou le nom du fichier dans l'import est faux."
  - q: "Quand met-on des accolades dans un import ?"
    r: "Pour un export nommé : `import { useState } from 'react'`. Pas d'accolades pour un export par défaut."
  - q: "Quel composant assemble tous les autres dans mon-blog ?"
    r: "App, dans `src/App.jsx` : il importe 8 composants et les affiche."
quiz:
  - question: "Quel nom de composant est correct ?"
    choix:
      - "`function searchBar()`"
      - "`function SearchBar()`"
      - "`function search-bar()`"
    reponse: "`function SearchBar()`"
    explication: "Un composant s'écrit en PascalCase. En minuscule, React le prend pour une balise HTML ; le tiret est interdit dans un nom de fonction."
  - question: "Le fichier Footer.jsx se termine par `export default Footer`. Quel import est juste ?"
    choix:
      - "`import { Footer } from './components/Footer'`"
      - "`import Footer from './components/Footer'`"
      - "`import './components/Footer'`"
    reponse: "`import Footer from './components/Footer'`"
    explication: "Un export par défaut s'importe sans accolades. La troisième ligne exécute le fichier mais ne récupère rien."
  - question: "filters.js contient `export const tags = [...]`. Quel import est juste ?"
    choix:
      - "`import tags from '../../data/filters'`"
      - "`import { tags } from '../../data/filters'`"
      - "`import { Tags } from '../../data/filters'`"
    reponse: "`import { tags } from '../../data/filters'`"
    explication: "Un export nommé s'importe entre accolades, avec exactement le même nom, majuscules comprises."
  - question: "La console affiche « Header is not defined ». Que manque-t-il ?"
    choix:
      - "L'import de Header en haut du fichier"
      - "Le CSS de Bootstrap"
      - "Une key sur Header"
    reponse: "L'import de Header en haut du fichier"
    explication: "Le fichier utilise `<Header />` sans l'avoir importé : JavaScript ne connaît pas ce nom."
  - question: "Dans Article.jsx, rangé dans src/components/, comment importer IconHeart.jsx, rangé dans le même dossier ?"
    choix:
      - "`import IconHeart from './IconHeart'`"
      - "`import IconHeart from './components/IconHeart'`"
      - "`import IconHeart from 'IconHeart'`"
    reponse: "`import IconHeart from './IconHeart'`"
    explication: "./ part du dossier du fichier actuel, ici src/components/. Sans ./, Vite chercherait un paquet npm nommé IconHeart."
  - question: "Où déclarer un composant ?"
    choix:
      - "Au niveau principal du fichier, une fonction par composant"
      - "À l'intérieur d'un autre composant, pour le garder près de son parent"
      - "Dans index.html"
    reponse: "Au niveau principal du fichier, une fonction par composant"
    explication: "Déclaré dans un autre composant, il est recréé à chaque rendu du parent et perd son état."
exercices:
  - titre: "Ton premier composant"
    niveau: facile
    enonce: "Crée src/components/Header.jsx : un composant Header qui affiche un h1 « Mon Blog » et un paragraphe d'accroche. Utilise-le dans App.jsx."
    indices:
      - "Une fonction Header qui retourne du JSX, puis export default Header."
      - "Dans App.jsx : import Header from './components/Header'."
      - "Dans le JSX de App : `<Header />`."
    solution: |
      ```jsx
      // src/components/Header.jsx
      function Header() {
        return (
          <header className="text-center py-5">
            <h1>Mon Blog</h1>
            <p>Musique, festivals, concerts et culture.</p>
          </header>
        )
      }

      export default Header

      // src/App.jsx
      import Header from './components/Header'

      function App() {
        return <Header />
      }

      export default App
      ```
  - titre: "Découper une page"
    niveau: moyen
    enonce: "Un App.jsx contient en dur une nav, un header et un footer. Range chacun dans son fichier (Nav.jsx, Header.jsx, Footer.jsx) et fais en sorte que App les assemble."
    indices:
      - "Trois fichiers dans src/components/, chacun avec sa fonction et son export default."
      - "Trois imports en haut de App.jsx."
      - "Trois balises côte à côte : il faut un fragment."
    solution: |
      ```jsx
      // src/components/Nav.jsx
      function Nav() {
        return <nav className="navbar bg-dark">Mon Blog</nav>
      }
      export default Nav

      // src/components/Footer.jsx
      function Footer() {
        return <footer className="bg-dark text-white py-4">Copyright &copy; 2026</footer>
      }
      export default Footer

      // src/App.jsx (Header.jsx est fait comme dans l'exercice 1)
      import Nav from './components/Nav'
      import Header from './components/Header'
      import Footer from './components/Footer'

      function App() {
        return (
          <>
            <Nav />
            <Header />
            <Footer />
          </>
        )
      }

      export default App
      ```
  - titre: "Export par défaut et export nommé"
    niveau: difficile
    enonce: "Crée src/data/site.js qui exporte par défaut le nom du site ('Mon Blog') et, par nom, un tableau liens (['Accueil', 'Articles', 'Contact']). Dans Nav.jsx, importe les deux et affiche le nom du site puis le premier lien."
    indices:
      - "export default pour le nom, export const pour le tableau."
      - "Les deux s'importent sur la même ligne : le défaut d'abord, puis le nommé entre accolades."
      - "Le premier élément d'un tableau : liens[0]."
    solution: |
      ```jsx
      // src/data/site.js
      const nomDuSite = 'Mon Blog'
      export const liens = ['Accueil', 'Articles', 'Contact']
      export default nomDuSite

      // src/components/Nav.jsx
      import nomDuSite, { liens } from '../data/site'

      function Nav() {
        return (
          <nav className="navbar bg-dark text-white px-3">
            {nomDuSite} · {liens[0]}
          </nav>
        )
      }

      export default Nav
      ```
---

## Un composant, c'est une fonction

:::quoi
Un **composant** est une **fonction qui retourne du JSX**, avec un nom qui commence par une **Majuscule**. On l'utilise ensuite comme une balise.
:::

:::exemple
```jsx
function Titre() {
  return <h1>Bonjour à tous</h1>
}

// utilisable comme une balise, autant de fois que tu veux
<Titre />
<Titre />
```
:::

:::piege
`function titre()` en minuscule : React croit que `<titre />` est une balise HTML inconnue et n'appelle pas ta fonction.
:::

:::ou[Dans mon-blog]
`Nav`, `Header`, `Article`, `SearchBar`, `Footer`… : chaque morceau de la page est une fonction dans `src/components/`.
:::

## Un fichier par composant

:::quoi
Chaque morceau de l'interface va dans **son propre fichier**, rangé dans `src/components/`. `App.jsx` est le chef d'orchestre qui les assemble.
:::

:::exemple
```text
src/
├── App.jsx              assemble tout
├── components/
│   ├── Nav.jsx          la barre de navigation
│   ├── Header.jsx       le titre et l'accroche
│   ├── Article.jsx      une carte d'article
│   └── Footer.jsx       le pied de page
└── data/articles.js     les données
```
:::

:::piege
Tout mettre dans `App.jsx` donne un fichier de 300 lignes impossible à relire. Si un morceau a un nom (« la carte », « la barre de recherche »), il mérite son composant.
:::

:::ou[Dans mes projets]
mon-blog : 10 fichiers à plat dans `src/components/`. PokéBistro : un dossier par composant, par exemple `src/components/ProductCard/ProductCard.jsx`.
:::

## export default : rendre le composant disponible

:::quoi
À la fin du fichier, `export default NomDuComposant` rend le composant **utilisable ailleurs**.
:::

:::exemple
```jsx title="src/components/Footer.jsx"
function Footer() {
  const annee = new Date().getFullYear()
  return (
    <footer className="bg-dark text-white mt-5 py-4">
      <p className="text-center mb-0">Copyright &copy; {annee} - Mon Blog</p>
    </footer>
  )
}

export default Footer
```
:::

:::piege
`export default` oublié : le navigateur affiche « does not provide an export named 'default' » et la page reste blanche.
:::

:::ou[Dans mon-blog]
Chaque fichier de `src/components/` se termine par `export default` suivi du nom du composant.
:::

## import : utiliser le composant ailleurs

:::quoi
En haut du fichier qui s'en sert, `import Nom from './chemin'` fait entrer le composant. Le couple **export default ⇄ import** relie les fichiers.
:::

:::exemple
```jsx title="src/App.jsx"
import Nav from './components/Nav'
import Footer from './components/Footer'  // .jsx optionnel
function App() {
  return (
    <>
      <Nav />
      <Footer />
    </>
  )
}
```
:::

:::piege
« Footer is not defined » : l'`import` manque. « Failed to resolve import » : le chemin ou le nom du fichier est faux. Respecte aussi les **majuscules** : Windows pardonne `./footer`, un serveur Linux non.
:::

:::ou[Dans mon-blog]
`src/App.jsx` importe 8 composants et les données `articles`. Dans `Article.jsx`, `import IconHeart from './IconHeart'` : `./` = le même dossier.
:::

## Export nommé : les accolades dans l'import

:::quoi
Un fichier peut aussi exporter **plusieurs choses par leur nom**. On les importe **entre accolades**, avec exactement le même nom.
:::

:::exemple
```jsx
// src/data/filters.js : deux exports nommés (extrait)
export const categories = ['Bento', 'Burger', 'Bowl']
export const tags = ['populaire', 'épicé', 'végétarien']

// dans un composant
import { tags } from '../../data/filters'   // nommé : accolades, même nom
import Button from '../Button/Button'       // par défaut : sans accolades
import { useState } from 'react'            // useState est aussi un export nommé
```
:::

:::piege
`import tags from '../../data/filters'` sans accolades cherche l'export **par défaut**, qui n'existe pas : erreur.
:::

:::ou[Dans PokéBistro]
`src/data/filters.js` exporte `categories`, `tags` et `priceRanges` par leur nom. `src/components/Sidebar/TagBlock.jsx` fait `import { tags } from '../../data/filters'`.
:::

## Des composants emboîtés

:::quoi
`App` est lui-même un composant. Une page React est un **arbre** : un **parent** affiche des **enfants**, qui peuvent avoir leurs propres enfants.
:::

:::exemple
```text
App
├── Nav
├── Header
├── MotsCles
├── SearchBar
├── CategoryFilter
├── Article (une par article)
│   └── IconHeart
└── Footer
```
:::

:::piege
Ne déclare jamais un composant **à l'intérieur** d'un autre : il serait recréé à chaque rendu du parent et perdrait son état. Une fonction par composant, au niveau principal du fichier.
:::

:::ou[Dans mon-blog]
C'est l'arbre de mon-blog, sans `IconSearch` ni `IconFrown`. `App` garde l'état et passe les données à ses enfants (chapitres 4 et 8).
:::
