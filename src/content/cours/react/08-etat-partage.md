---
titre: "Partager l'état entre composants"
matiere: react
type: cours
chapitre: 8
niveau: intermediaire
duree: 10
date: 2026-09-23
source: "Cours live React (Discord)"
tags: [react, state, props, callback]
essentiel: "Quand plusieurs composants ont besoin d'une même valeur, l'état vit chez leur parent commun. Le parent passe la valeur et la fonction de modification en props ; l'enfant affiche l'une et appelle l'autre. Les données descendent, les événements remontent."
retenir:
  - "L'état vit dans le parent commun des composants qui en ont besoin. S'il ne sert qu'à un composant, il reste local."
  - "Le parent passe la valeur et la fonction de modification en props."
  - "L'enfant affiche la valeur et appelle la fonction : les données descendent, les événements remontent."
  - "Une prop qui est une fonction s'appelle onQuelqueChose : onChange, onClick, onMotCle."
  - "On passe la fonction (onChange={setRecherche}), on ne l'appelle pas (onChange={setRecherche()})."
definitions:
  - terme: "État local"
    definition: "Un état qui ne sert qu'à un seul composant et qui vit dans ce composant."
    exemple: "const [aime, setAime] = useState(false)  // dans Article"
  - terme: "Parent commun"
    definition: "Le composant le plus proche qui contient tous les composants ayant besoin d'une même valeur. C'est là que vit l'état partagé."
    exemple: "App contient SearchBar, MotsCles et la liste"
  - terme: "Remonter l'état"
    definition: "Déplacer un état vers le parent commun de plusieurs composants, pour qu'ils puissent tous le lire. En anglais : lifting state up."
  - terme: "Fonction en prop (callback)"
    definition: "Une fonction passée en prop par le parent, que l'enfant appelle pour le prévenir qu'il s'est passé quelque chose."
    exemple: "<SearchBar onChange={setRecherche} />"
  - terme: "Flux de données"
    definition: "Le sens dans lequel l'information circule : les valeurs descendent du parent vers l'enfant, les événements remontent par les fonctions reçues."
flashcards:
  - q: "Où mettre un état utilisé par plusieurs composants ?"
    r: "Dans leur parent commun, le plus proche qui les contient tous."
  - q: "Où mettre un état qui ne sert qu'à une carte ?"
    r: "Dans la carte elle-même : c'est un état local, comme ouvert et aime dans Article."
  - q: "La question à se poser pour placer un état ?"
    r: "« Qui a besoin de cette valeur ? » Un seul composant : local. Plusieurs : dans le parent commun."
  - q: "Les données descendent, les événements… ?"
    r: "… remontent : l'enfant appelle une fonction reçue en prop, et c'est l'état du parent qui change."
  - q: "Que passe App à SearchBar dans mon-blog ?"
    r: "La valeur et la fonction : `<SearchBar valeur={recherche} onChange={setRecherche} />`."
  - q: "Que se passe-t-il quand SearchBar appelle onChange('jazz') ?"
    r: "C'est setRecherche('jazz') : l'état de App change, App se redessine, la liste se filtre."
  - q: "Pourquoi recherche est dans App et pas dans SearchBar ?"
    r: "Parce que la liste et la barre des mots-clés en ont aussi besoin. Dans SearchBar, App ne le verrait pas."
  - q: "Comment nommer une prop qui est une fonction ?"
    r: "onQuelqueChose, comme les événements HTML : onChange, onClick, onMotCle."
  - q: "`onChange={setRecherche}` ou `onChange={(v) => setRecherche(v)}` ?"
    r: "Les deux marchent pareil. La première passe la fonction directement, la seconde l'enveloppe."
  - q: "« Too many re-renders » : quelle est la cause la plus fréquente ici ?"
    r: "Un setX appelé pendant le rendu au lieu d'être passé, comme `onChange={setRecherche()}`."
  - q: "Comment un badge #jazz dans une carte filtre-t-il toute la liste ?"
    r: "Article reçoit `onMotCle={setRecherche}` ; au clic, il appelle `onMotCle('jazz')`, donc l'état de App change."
  - q: "Que fait PokéBistro quand la valeur doit traverser beaucoup de composants ?"
    r: "Il utilise un Context : `useContext(FilterContext)` au lieu de passer les props étage par étage (chapitre 10)."
quiz:
  - question: "recherche est utilisé par SearchBar, MotsCles et la liste d'articles. Où doit vivre cet état ?"
    choix:
      - "Dans SearchBar"
      - "Dans App, leur parent commun"
      - "Dans chaque composant, avec trois useState"
    reponse: "Dans App, leur parent commun"
    explication: "Trois useState séparés ne seraient pas synchronisés. Un seul état, dans le parent commun, partagé par props."
  - question: "Quel état doit rester local dans Article ?"
    choix:
      - "recherche"
      - "categorie"
      - "aime"
    reponse: "aime"
    explication: "aime ne concerne qu'une carte, et chaque carte a besoin du sien. recherche et categorie servent à plusieurs composants."
  - question: "Comment App permet-il à SearchBar de changer la recherche ?"
    choix:
      - "En lui passant setRecherche en prop"
      - "SearchBar modifie directement la variable recherche de App"
      - "En important App dans SearchBar"
    reponse: "En lui passant setRecherche en prop"
    explication: "L'enfant ne touche jamais l'état du parent : il appelle la fonction qu'on lui a donnée, ici sous le nom onChange."
  - question: "Dans SearchBar, `onChange={(e) => onChange(e.target.value)}` : que reçoit le onChange de la prop ?"
    choix:
      - "L'objet événement e"
      - "Le texte tapé"
      - "Rien"
    reponse: "Le texte tapé"
    explication: "Le onChange de l'input reçoit e ; SearchBar en extrait e.target.value et passe seulement le texte à la prop onChange."
  - question: "`<SearchBar onChange={setRecherche()} />` : que se passe-t-il ?"
    choix:
      - "Ça marche comme onChange={setRecherche}"
      - "setRecherche est appelée pendant le rendu, ce qui relance le rendu en boucle"
      - "La recherche se vide au clic"
    reponse: "setRecherche est appelée pendant le rendu, ce qui relance le rendu en boucle"
    explication: "Avec les parenthèses, la fonction s'exécute au lieu d'être passée. Changer l'état pendant le rendu relance le rendu : React s'arrête avec « Too many re-renders »."
  - question: "On clique sur #jazz dans une carte. Qu'est-ce qui change en premier ?"
    choix:
      - "L'état recherche de App"
      - "La prop article de la carte"
      - "Le fichier articles.js"
    reponse: "L'état recherche de App"
    explication: "Le badge appelle onMotCle('jazz'), qui est setRecherche. Ensuite App se redessine et toute la page suit."
exercices:
  - titre: "Un enfant qui prévient le parent"
    niveau: facile
    enonce: "Crée un composant BoutonPlus qui reçoit une prop onPlus et l'appelle au clic. Dans App, garde un état compte, affiche-le, et passe à BoutonPlus une fonction qui ajoute 1."
    indices:
      - "L'état compte vit dans App, pas dans le bouton."
      - "Dans BoutonPlus : onClick={onPlus}."
      - "Dans App : onPlus={() => setCompte(compte + 1)}."
    solution: |
      ```jsx
      import { useState } from 'react'

      function BoutonPlus({ onPlus }) {
        return <button type="button" onClick={onPlus}>+1</button>
      }

      function App() {
        const [compte, setCompte] = useState(0)

        return (
          <>
            <p>Compte : {compte}</p>
            <BoutonPlus onPlus={() => setCompte(compte + 1)} />
          </>
        )
      }

      export default App
      ```
  - titre: "La barre de recherche"
    niveau: moyen
    enonce: "Crée SearchBar qui reçoit valeur et onChange et affiche un input contrôlé. Dans App, garde l'état recherche et affiche « Tu cherches : … » sous la barre."
    indices:
      - "App : const [recherche, setRecherche] = useState('')."
      - "App passe valeur={recherche} et onChange={setRecherche}."
      - "SearchBar : value={valeur} et onChange={(e) => onChange(e.target.value)}."
    solution: |
      ```jsx
      import { useState } from 'react'

      function SearchBar({ valeur, onChange }) {
        return (
          <input
            type="text"
            className="form-control"
            value={valeur}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      }

      function App() {
        const [recherche, setRecherche] = useState('')

        return (
          <>
            <SearchBar valeur={recherche} onChange={setRecherche} />
            <p>Tu cherches : {recherche}</p>
          </>
        )
      }

      export default App
      ```
  - titre: "Des badges qui remplissent la recherche"
    niveau: difficile
    enonce: "Ajoute à l'exercice précédent un composant Badges qui reçoit motsCles (['jazz', 'rock', 'live']), actif et onClick. Cliquer sur un badge remplit la barre de recherche avec ce mot ; le badge égal à la recherche est en noir (text-bg-dark), les autres en clair (text-bg-light)."
    indices:
      - "App passe motsCles, actif={recherche} et onClick={setRecherche}."
      - "Dans le map de Badges, calcule la classe avant le return : mot === actif."
      - "Au clic : onClick={() => onClick(mot)}, avec une flèche puisqu'il y a un argument."
    solution: |
      ```jsx
      import { useState } from 'react'

      function Badges({ motsCles, actif, onClick }) {
        return (
          <div className="d-flex gap-2">
            {motsCles.map((mot) => {
              let classe = 'badge text-bg-light'
              if (mot === actif) {
                classe = 'badge text-bg-dark'
              }
              return (
                <button key={mot} type="button" className={classe} onClick={() => onClick(mot)}>
                  #{mot}
                </button>
              )
            })}
          </div>
        )
      }

      function App() {
        const [recherche, setRecherche] = useState('')

        return (
          <>
            <input value={recherche} onChange={(e) => setRecherche(e.target.value)} />
            <Badges motsCles={['jazz', 'rock', 'live']} actif={recherche} onClick={setRecherche} />
          </>
        )
      }

      export default App
      ```
---

## Le problème : une valeur, deux composants

:::quoi
On tape la recherche dans `SearchBar`, mais c'est `App` qui filtre les articles. Si l'état est enfermé dans `SearchBar`, **App ne le voit pas**.
:::

:::exemple
```jsx
// Faux : l'état est enfermé dans SearchBar
function SearchBar() {
  const [recherche, setRecherche] = useState('')
  return <input value={recherche} onChange={(e) => setRecherche(e.target.value)} />
}
// App ne connaît pas recherche : la liste ne se filtre jamais
```
:::

:::piege
C'est l'erreur classique : on peut taper dans la barre, tout a l'air de marcher, mais **rien ne se filtre**.
:::

:::ou[Dans mon-blog]
C'est pour ça que `recherche` est déclaré dans `src/App.jsx`, et pas dans `src/components/SearchBar.jsx`.
:::

## Où mettre l'état ?

:::quoi
Dans le composant **le plus proche** qui **contient tous ceux** qui ont besoin de la valeur. Demande-toi toujours : qui a besoin de cette valeur ?
:::

:::exemple
```text
recherche → SearchBar, la liste, MotsCles → dans App (le parent commun)
categorie → CategoryFilter, la liste      → dans App
ouvert    → une seule carte               → dans Article (état local)
aime      → une seule carte               → dans Article (état local)
```
:::

:::piege
L'inverse est aussi une erreur : `aime` dans `App` donnerait **un seul** J'aime pour toutes les cartes.
:::

:::ou[Dans mes projets]
C'est la répartition exacte de mon-blog. PokéBistro : `isCartOpen` est dans `App.jsx`, car le `Header` ouvre le panier et le `Cart` le ferme.
:::

:::info
Pour aller plus loin : quand une valeur doit traverser beaucoup de composants, PokéBistro utilise un **Context** (`src/contexts/FilterContext.jsx`). Les composants la lisent avec `useContext(FilterContext)`, sans props à passer étage par étage. C'est le chapitre 10.
:::

## Les données descendent, les événements remontent

:::quoi
Le parent passe **la valeur** en prop : elle descend. Il passe aussi **la fonction de modification** en prop : l'enfant l'appelle, et l'information remonte.
:::

:::exemple
```jsx title="src/App.jsx"
const [recherche, setRecherche] = useState('')

<SearchBar valeur={recherche} onChange={setRecherche} />
// valeur : la donnée qui descend ; onChange : la fonction qui fait remonter l'info
```
:::

:::piege
`onChange={setRecherche()}` avec parenthèses : la fonction est **appelée** pendant le rendu au lieu d'être **passée**. Résultat : erreur « Too many re-renders ».
:::

:::ou[Dans mon-blog]
`src/App.jsx` : `<SearchBar valeur={recherche} onChange={setRecherche} />` et `<CategoryFilter categories={categories} active={categorie} onChange={setCategorie} />`.
:::

## L'enfant appelle la fonction reçue

:::quoi
L'enfant **affiche** la valeur et **appelle** la fonction quand il se passe quelque chose. Il ne sait pas que c'est `setRecherche` : pour lui, c'est juste la prop `onChange`.
:::

:::exemple
```jsx title="src/components/SearchBar.jsx"
function SearchBar({ valeur, onChange }) {
  return (
    <input
      type="text"
      className="form-control"
      value={valeur}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
```
:::

:::piege
Deux `onChange` différents : celui de l'**input** reçoit l'événement `e`, celui de la **prop** reçoit le **texte**. SearchBar fait le lien avec `e.target.value`.
:::

:::ou[Dans mon-blog]
Quand `SearchBar` appelle `onChange('jazz')`, c'est l'état de `App` qui change : `App` se redessine, la liste filtrée est recalculée.
:::

## Un badge qui filtre toute la liste

:::quoi
Ça marche à n'importe quel niveau : un enfant change l'état du parent **sans le connaître**. Il appelle juste la fonction reçue en prop.
:::

:::exemple
```jsx title="src/components/Article.jsx"
{article.motsCles.map((mot) => (
  <button key={mot} type="button" className="badge text-bg-light badge-filtre" onClick={() => onMotCle(mot)}>
    #{mot}
  </button>
))}
// dans App.jsx : <Article … onMotCle={setRecherche} />
```
:::

:::piege
`onClick={onMotCle(mot)}` appelle la fonction **pendant le rendu** : React avertit « Cannot update a component while rendering a different component ». Écris `() => onMotCle(mot)`.
:::

:::ou[Dans mon-blog]
Cliquer sur `#jazz` dans une carte appelle `onMotCle('jazz')`, donc `setRecherche('jazz')` : la barre affiche « jazz » et la liste se filtre. Même principe pour le badge de catégorie avec `onCategorie={setCategorie}`.
:::

:::astuce
Convention : une prop-fonction s'appelle **onQuelqueChose** (`onChange`, `onClick`, `onMotCle`). Passer `setRecherche` directement ou `(v) => setRecherche(v)` revient au même.
:::
