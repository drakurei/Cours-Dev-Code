---
titre: "Afficher une liste avec .map() et key"
matiere: react
type: cours
chapitre: 5
niveau: debutant
duree: 10
date: 2026-09-23
source: "Cours live React (Discord)"
tags: [react, listes, map, key]
essentiel: "Pour afficher un composant par élément d'un tableau, on utilise .map() dans le JSX. Chaque élément renvoyé reçoit une prop key unique et stable, de préférence un id. Les données vivent dans un fichier à part, importé avec import."
retenir:
  - "Un composant par élément : tableau.map(…) dans le JSX, avec une key sur chaque élément renvoyé."
  - "Avec des parenthèses, le return est implicite ; avec des accolades, il faut écrire return."
  - "La key est unique et stable, de préférence un id, et se place sur l'élément renvoyé par le map."
  - "Si la liste peut être absente : liste && liste.map(…) ou liste?.map(…)."
  - "Les données vont dans un fichier .js à part ; ajouter un article = ajouter un objet."
definitions:
  - terme: ".map()"
    definition: "Méthode de tableau qui renvoie un nouveau tableau, en transformant chaque élément avec une fonction. L'original ne change pas."
    exemple: "[1, 2, 3].map((n) => n * 2)  // [2, 4, 6]"
  - terme: "key"
    definition: "Prop spéciale qui permet à React d'identifier chaque élément d'une liste pour mettre le DOM à jour correctement. Unique et stable."
    exemple: "<Article key={article.id} article={article} />"
  - terme: "Retour implicite"
    definition: "Une fonction fléchée avec des parenthèses (ou sans accolades) renvoie sa valeur sans écrire return."
    exemple: "(article) => (<Article article={article} />)"
  - terme: "Tableau d'objets"
    definition: "Un tableau dont chaque élément est un objet avec les mêmes propriétés. C'est la forme classique des données d'une liste."
    exemple: "[{ id: 1, titre: 'Festival' }, { id: 2, titre: 'Jazz' }]"
  - terme: "Chaînage optionnel (?.)"
    definition: "Opérateur qui s'arrête et renvoie undefined si la valeur à gauche est undefined ou null, au lieu de planter."
    exemple: "tags?.map((tag) => <span key={tag}>{tag}</span>)"
  - terme: ".forEach()"
    definition: "Méthode qui parcourt un tableau sans rien renvoyer. Elle sert à faire une action pour chaque élément, pas à afficher."
    exemple: "articles.forEach((article) => console.log(article.titre))"
flashcards:
  - q: "Que renvoie .map() ?"
    r: "Un nouveau tableau, transformé élément par élément. Le tableau d'origine ne change pas."
  - q: "Comment afficher une carte par article ?"
    r: "`{articles.map((article) => <Article key={article.id} article={article} />)}`"
  - q: "Mon map n'affiche rien et il n'y a pas d'erreur : pourquoi ?"
    r: "Des accolades sans return. Utilise des parenthèses `(article) => ( … )` ou ajoute `return`."
  - q: "À quoi sert la prop key ?"
    r: "À ce que React identifie chaque élément de la liste pour mettre le DOM à jour correctement."
  - q: "Quelle est la meilleure key ?"
    r: "Un id venant des données : `key={article.id}`. Le texte convient s'il est unique."
  - q: "Pourquoi éviter key={index} ?"
    r: "Si la liste est filtrée ou triée, l'index d'un élément change : React peut se tromper d'élément."
  - q: "Sur quelle balise mettre la key ?"
    r: "Sur l'élément directement renvoyé par le map, pas sur une balise à l'intérieur."
  - q: "« Cannot read properties of undefined (reading 'map') » : que se passe-t-il ?"
    r: "La liste vaut undefined : la prop n'est pas passée ou porte un autre nom."
  - q: "Quelle différence entre `tags && tags.map(…)` et `tags?.map(…)` ?"
    r: "Aucune ici : les deux ne parcourent la liste que si elle existe. `?.` est plus court."
  - q: "Pourquoi ranger les articles dans src/data/articles.js ?"
    r: "Pour séparer le code et le contenu : ajouter un article = ajouter un objet, sans toucher aux composants."
  - q: "Le composant enfant peut-il lire props.key ?"
    r: "Non, key est réservée à React et n'arrive pas dans les props. Si l'enfant a besoin de l'id, passe-le aussi en prop normale."
quiz:
  - question: "Que vaut `[1, 2, 3].map((n) => n * 2)` ?"
    choix:
      - "[1, 2, 3]"
      - "[2, 4, 6]"
      - "12"
      - "undefined"
    reponse: "[2, 4, 6]"
    explication: ".map() renvoie un nouveau tableau où chaque élément est passé dans la fonction : 1, 2, 3 deviennent 2, 4, 6."
  - question: "`{articles.map((a) => { <Article key={a.id} article={a} /> })}` : qu'est-ce qui s'affiche ?"
    choix:
      - "Toutes les cartes"
      - "Rien"
      - "Seulement la première carte"
      - "Une erreur de syntaxe"
    reponse: "Rien"
    explication: "Avec des accolades, la fonction ne renvoie rien sans return. Le map produit un tableau de undefined : React n'affiche rien."
  - question: "Quelle key choisir pour une liste d'articles qu'on peut filtrer ?"
    choix:
      - "key={index}"
      - "key={article.id}"
      - "key={Math.random()}"
    reponse: "key={article.id}"
    explication: "L'id est unique et ne change jamais. L'index change quand on filtre, et Math.random() change à chaque rendu."
  - question: "Dans ProductGrid, le map renvoie `<div key={product.id} className=\"col\"><ProductCard product={product} /></div>`. Où doit être la key ?"
    choix:
      - "Sur la div, car c'est elle que le map renvoie"
      - "Sur ProductCard"
      - "Sur les deux"
    reponse: "Sur la div, car c'est elle que le map renvoie"
    explication: "La key va sur l'élément le plus haut renvoyé à chaque tour du map. C'est exactement ce que fait ProductGrid.jsx dans PokéBistro."
  - question: "La console affiche « Each child in a list should have a unique \"key\" prop ». Que faire ?"
    choix:
      - "Ajouter key={…} sur l'élément renvoyé par le map"
      - "Remplacer .map() par .forEach()"
      - "Importer key depuis react"
    reponse: "Ajouter key={…} sur l'élément renvoyé par le map"
    explication: "forEach ne renvoie rien, donc n'afficherait rien ; key n'est pas un import, c'est une prop spéciale."
  - question: "Pourquoi utilise-t-on .map() et pas .forEach() dans le JSX ?"
    choix:
      - "Parce que .forEach() est interdit en React"
      - "Parce que .map() renvoie un tableau de JSX que React affiche, alors que .forEach() ne renvoie rien"
      - "Parce que .map() est plus rapide"
    reponse: "Parce que .map() renvoie un tableau de JSX que React affiche, alors que .forEach() ne renvoie rien"
    explication: "forEach reste utile pour construire une liste ou faire une action, comme le dédoublonnage des mots-clés dans App.jsx."
exercices:
  - titre: "Des mots-clés en hashtags"
    niveau: facile
    enonce: "En JavaScript pur, transforme le tableau ['jazz', 'rock', 'live'] en ['#jazz', '#rock', '#live'] avec .map(), puis affiche le résultat dans la console."
    indices:
      - "La fonction reçoit un mot et renvoie un nouveau texte."
      - "'#' + mot colle le dièse devant le mot."
    solution: |
      ```js
      const motsCles = ['jazz', 'rock', 'live']
      const hashtags = motsCles.map((mot) => '#' + mot)

      console.log(hashtags) // ['#jazz', '#rock', '#live']
      ```
  - titre: "Une liste de mots-clés"
    niveau: moyen
    enonce: "Crée un composant ListeMotsCles qui reçoit une prop motsCles (un tableau de textes) et affiche un badge Bootstrap par mot, précédé de #. Pas d'avertissement de key dans la console."
    indices:
      - "motsCles.map((mot) => …) dans le JSX, entre accolades."
      - "Chaque mot est unique : il peut servir de key."
      - "Le badge : `<span className=\"badge text-bg-light\">`."
    solution: |
      ```jsx
      function ListeMotsCles({ motsCles }) {
        return (
          <div className="d-flex flex-wrap gap-2">
            {motsCles.map((mot) => (
              <span key={mot} className="badge text-bg-light">
                #{mot}
              </span>
            ))}
          </div>
        )
      }

      // utilisation : <ListeMotsCles motsCles={['jazz', 'Paris']} />
      ```
  - titre: "Des cartes depuis un fichier de données"
    niveau: difficile
    enonce: "Crée src/data/films.js avec 3 films (id, titre, annee) exporté par défaut. Crée un composant Film qui reçoit un film et affiche « titre (annee) ». Dans App, importe les films et affiche un Film par film."
    indices:
      - "Un tableau d'objets, puis export default films."
      - "Dans App : import films from './data/films', puis films.map(…)."
      - "La key va sur `<Film />`, avec film.id ; le film entier passe en prop."
    solution: |
      ```jsx
      // src/data/films.js
      const films = [
        { id: 1, titre: 'Le Voyage de Chihiro', annee: 2001 },
        { id: 2, titre: 'Your Name', annee: 2016 },
        { id: 3, titre: 'Princesse Mononoké', annee: 1997 },
      ]
      export default films

      // src/components/Film.jsx
      function Film({ film }) {
        return <li>{film.titre} ({film.annee})</li>
      }
      export default Film

      // src/App.jsx
      import films from './data/films'
      import Film from './components/Film'

      function App() {
        return (
          <ul>
            {films.map((film) => (
              <Film key={film.id} film={film} />
            ))}
          </ul>
        )
      }

      export default App
      ```
---

## Rappel JavaScript : .map()

:::quoi
`.map()` parcourt un tableau et renvoie un **nouveau tableau**, transformé élément par élément. L'original ne change pas.
:::

:::exemple
```js
const nombres = [1, 2, 3]
const doubles = nombres.map((n) => n * 2)

console.log(doubles) // [2, 4, 6]
console.log(nombres) // [1, 2, 3] : l'original ne change pas
```
:::

:::piege
`.forEach()` parcourt aussi, mais **ne renvoie rien** : dans le JSX, il n'affiche rien. Pour afficher, c'est `.map()`.
:::

:::ou[Dans mon-blog]
`src/App.jsx` utilise `forEach` pour **construire** la liste des mots-clés, et `map` pour **afficher** les cartes.
:::

## Un composant par élément

:::quoi
Dans le JSX, `.map()` transforme chaque objet du tableau en `<Article />`, et React affiche le tableau obtenu. Lecture : « **pour chaque article, fabrique une carte** ».
:::

:::exemple
```jsx title="src/App.jsx"
{articlesFiltres.map((article) => (
  <Article
    key={article.id}
    article={article}
    onCategorie={setCategorie}
    onMotCle={setRecherche}
  />
))}
```
:::

:::piege
`(article) => { <Article /> }` avec des **accolades** n'affiche **rien** : il manque `return`. Avec des **parenthèses** `( … )`, le `return` est implicite.
:::

:::ou[Dans mes projets]
mon-blog : `articlesFiltres.map` dans `App.jsx`, `motsCles.map` dans `MotsCles.jsx` et `Article.jsx`. PokéBistro : `visibleProducts.map` dans `ProductGrid.jsx`.
:::

## Quand il faut des accolades et un return

:::quoi
Pour **calculer** avant d'afficher (une classe, un booléen), ouvre des accolades, fais ton calcul, puis écris `return`.
:::

:::exemple
```jsx title="src/components/CategoryFilter.jsx"
{categories.map((cat) => {
  let classe = 'btn btn-sm rounded-pill btn-outline-dark'
  if (cat === active) {
    classe = 'btn btn-sm rounded-pill btn-dark'
  }
  return (
    <button key={cat} type="button" className={classe} onClick={() => onChange(cat)}>{cat}</button>
  )
})}
```
:::

:::piege
Accolades et `return` oublié : la fonction renvoie `undefined` à chaque tour, la liste reste vide, **sans erreur**.
:::

:::ou[Dans mes projets]
`CategoryFilter.jsx` et `MotsCles.jsx` de mon-blog, `TagBlock.jsx` de PokéBistro : la classe du bouton actif est calculée avant le `return`.
:::

## La prop key

:::quoi
La propriété **key** permet à React d'**identifier** chaque élément d'une liste pour gérer les mises à jour du DOM. Elle doit être **unique** dans la liste et **stable**.
:::

:::exemple
```jsx
key={article.id}  // idéal : un id venant des données
key={mot}         // correct si le texte est unique dans la liste
key={index}       // dernier recours : à éviter si la liste se filtre ou se trie
```
:::

:::piege
Avertissement « Each child in a list should have a unique "key" prop » : mets la `key` sur l'élément **directement renvoyé** par le `map`.
:::

:::ou[Dans mes projets]
mon-blog : `key={article.id}` dans `App.jsx`, `key={mot}` dans `MotsCles.jsx`, `key={cat}` dans `CategoryFilter.jsx`. PokéBistro, `ProductGrid.jsx` : la `key` est sur la `<div className="col">`, car c'est elle que le `map` renvoie.
:::

:::info
`key` n'arrive pas dans les props de l'enfant : `props.key` vaut `undefined`. Si la carte a besoin de l'id, passe-le aussi dans une prop normale.
:::

## Si la liste peut ne pas exister

:::quoi
Si le tableau vaut `undefined` (prop pas passée), `.map()` **plante**. On vérifie avant, avec `&&` ou avec `?.`.
:::

:::exemple
```jsx
// tags peut valoir undefined si la prop n'est pas passée
{tags && tags.map((tag) => <span key={tag}>{tag}</span>)} // si tags existe, alors…
{tags?.map((tag) => <span key={tag}>{tag}</span>)}        // pareil, plus court
```
:::

:::piege
« Cannot read properties of undefined (reading 'map') » : la liste n'existe pas. Vérifie d'abord le **nom de la prop** des deux côtés, avant d'ajouter `?.`.
:::

:::ou[Dans PokéBistro]
Tes listes viennent toujours de `src/data/` : elles existent, pas besoin de `?.`. Le cas voisin, une liste **vide**, est dans `ProductCard.jsx` : `{product.tags.length > 0 && ( <ul>…</ul> )}`.
:::

## Les données dans un fichier à part

:::quoi
Les données sont un **tableau d'objets** dans `src/data/articles.js`, exporté puis importé. Ajouter un article = ajouter un objet, rien d'autre à changer.
:::

:::exemple
```js title="src/data/articles.js"
const articles = [
  { id: 1, titre: "Festival de l'été", categorie: "Festival", motsCles: ["été", "plein air", "live"] },
  { id: 2, titre: "Nuit du jazz à Paris", categorie: "Concert", motsCles: ["jazz", "saxophone", "Paris"] },
]

export default articles

// dans src/App.jsx
import articles from './data/articles'
```
:::

:::piege
Une **virgule oubliée** entre deux objets : erreur de syntaxe sur tout le fichier, et page blanche.
:::

:::ou[Dans mes projets]
mon-blog : 13 articles dans `src/data/articles.js` (id, titre, categorie, motsCles, image, date, texte). PokéBistro : 28 plats dans `src/data/products.js`.
:::
