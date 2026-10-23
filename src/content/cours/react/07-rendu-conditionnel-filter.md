---
titre: "Rendu conditionnel et .filter()"
matiere: react
type: cours
chapitre: 7
niveau: debutant
duree: 11
date: 2026-09-23
source: "Cours live React (Discord)"
tags: [react, conditions, ternaire, filter, recherche]
essentiel: "Pour afficher selon une condition : && pour « afficher ou rien », le ternaire pour « soit l'un, soit l'autre ». Pour filtrer une liste, .filter() garde les éléments pour lesquels la fonction renvoie true, puis .map() affiche le résultat."
retenir:
  - "{condition && …} affiche l'élément ou rien ; {condition ? A : B} affiche l'un ou l'autre."
  - "Avec un nombre, compare toujours : liste.length > 0 && …, sinon un 0 s'affiche."
  - "Un if classique ne va pas dans le JSX : on calcule avant le return."
  - ".filter() renvoie un nouveau tableau, l'original n'est jamais modifié."
  - "Recherche : toLowerCase() des deux côtés, includes(), champs reliés par || ; plusieurs filtres reliés par &&."
definitions:
  - terme: "Rendu conditionnel"
    definition: "Afficher un élément, ou un autre, ou rien, selon une condition. En JSX : &&, le ternaire, ou un if avant le return."
  - terme: "Ternaire"
    definition: "L'opérateur `condition ? siVrai : siFaux`, qui renvoie l'une des deux valeurs. Un if/else qui tient dans une expression, donc utilisable dans le JSX."
    exemple: "{ouvert ? 'Réduire' : 'Lire la suite'}"
  - terme: "Opérateur &&"
    definition: "« ET » logique. Dans le JSX, `{a && b}` affiche b si a est vrai. Sinon il affiche a : rien pour false, null, undefined ou '', mais 0 s'affiche."
    exemple: "{valeur && <button>Effacer</button>}"
  - terme: "Falsy"
    definition: "Valeur qui compte comme fausse dans une condition : `false`, `0`, `''` (texte vide), `null`, `undefined` et `NaN`."
    exemple: "if ('') { … }  // ne s'exécute pas"
  - terme: ".filter()"
    definition: "Méthode de tableau qui renvoie un nouveau tableau avec seulement les éléments pour lesquels la fonction renvoie true."
    exemple: "[3, 12, 7, 20].filter((n) => n > 10)  // [12, 20]"
  - terme: "includes()"
    definition: "Teste si un texte contient un autre texte (ou si un tableau contient une valeur). Renvoie true ou false."
    exemple: "'Nuit du jazz'.includes('jazz')  // true"
  - terme: "toLowerCase() et trim()"
    definition: "toLowerCase() met un texte en minuscules ; trim() enlève les espaces au début et à la fin."
    exemple: "'  Jazz '.trim().toLowerCase()  // 'jazz'"
flashcards:
  - q: "Comment afficher un bouton seulement si valeur n'est pas vide ?"
    r: "`{valeur && <button>Effacer</button>}`"
  - q: "Comment afficher soit A, soit B ?"
    r: "Avec un ternaire : `{condition ? <A /> : <B />}`."
  - q: "Pourquoi `{articles.length && <Liste />}` est un piège ?"
    r: "Si la liste est vide, 0 s'affiche à l'écran. Écris `{articles.length > 0 && <Liste />}`."
  - q: "Peut-on écrire un if au milieu du JSX ?"
    r: "Non. On le met avant le return, ou on utilise && ou un ternaire."
  - q: "Comment un composant peut-il n'afficher rien du tout ?"
    r: "En renvoyant `null` : `if (!isOpen) { return null }`, comme la Modal de PokéBistro."
  - q: "Que renvoie .filter() ?"
    r: "Un nouveau tableau avec seulement les éléments pour lesquels la fonction renvoie true. L'original ne change pas."
  - q: "Comment rendre une recherche insensible aux majuscules ?"
    r: "`toLowerCase()` sur le texte cherché et sur chaque champ, puis `includes()`."
  - q: "À quoi sert trim() dans la recherche ?"
    r: "À enlever les espaces tapés au début et à la fin."
  - q: "Pourquoi `motsCles.join(' ')` dans la recherche de mon-blog ?"
    r: "Pour transformer le tableau `['jazz', 'Paris']` en texte `'jazz Paris'` et chercher dedans avec includes()."
  - q: "Recherche vide : que s'affiche-t-il ?"
    r: "Tous les articles, car `includes('')` est toujours vrai."
  - q: "|| ou && pour relier les champs d'une recherche ?"
    r: "|| : il suffit qu'un champ corresponde (titre OU catégorie OU texte OU mots-clés)."
  - q: "|| ou && pour combiner recherche et catégorie ?"
    r: "&& : l'article doit passer les deux filtres."
quiz:
  - question: "`{valeur && <button>Effacer</button>}` avec valeur = '' : qu'est-ce qui s'affiche ?"
    choix:
      - "Le bouton"
      - "Rien"
      - "Le texte false"
    reponse: "Rien"
    explication: "'' est falsy : && s'arrête et renvoie '', un texte vide qui n'affiche rien. Dès qu'on tape une lettre, le bouton apparaît."
  - question: "`{articles.length && <p>Il y a des articles</p>}` avec une liste vide : qu'est-ce qui s'affiche ?"
    choix:
      - "Rien"
      - "Le chiffre 0"
      - "Une erreur"
    reponse: "Le chiffre 0"
    explication: "articles.length vaut 0, && renvoie 0, et React affiche les nombres. La bonne écriture : articles.length > 0 && …"
  - question: "Que vaut `[3, 12, 7, 20].filter((n) => n > 10)` ?"
    choix:
      - "[12, 20]"
      - "[3, 7]"
      - "true"
      - "2"
    reponse: "[12, 20]"
    explication: ".filter() garde les éléments pour lesquels la fonction renvoie true : seuls 12 et 20 sont plus grands que 10."
  - question: "Pourquoi appeler toLowerCase() sur la recherche ET sur le titre ?"
    choix:
      - "Pour que la recherche ignore les majuscules"
      - "Pour enlever les espaces"
      - "Pour trier les articles par ordre alphabétique"
    reponse: "Pour que la recherche ignore les majuscules"
    explication: "includes() fait la différence entre « Jazz » et « jazz ». En mettant les deux en minuscules, elles se correspondent."
  - question: "La barre de recherche est vide. Combien d'articles s'affichent ?"
    choix:
      - "Aucun"
      - "Tous"
      - "Seulement le premier"
    reponse: "Tous"
    explication: "includes('') renvoie toujours true : chaque article passe le filtre de recherche."
  - question: "Comment garder les articles de la bonne catégorie ET qui correspondent à la recherche ?"
    choix:
      - "`return bonneCategorie && correspond`"
      - "`return bonneCategorie || correspond`"
      - "`return correspond`"
    reponse: "`return bonneCategorie && correspond`"
    explication: "&& exige les deux conditions. Avec ||, un article de la bonne catégorie passerait même sans correspondre à la recherche."
  - question: "Où écrire un if classique dans un composant ?"
    choix:
      - "Avant le return"
      - "Entre accolades au milieu du JSX"
      - "Dans le className"
    reponse: "Avant le return"
    explication: "Le JSX n'accepte que des expressions. Le if calcule une variable avant le return, ou devient un ternaire."
exercices:
  - titre: "Garder les concerts"
    niveau: facile
    enonce: "En JavaScript pur, garde seulement les articles de la catégorie 'Concert' avec .filter(). Puis affiche leurs titres dans la console avec .map(). Le tableau : `[{ titre: 'Rock en Seine : le retour', categorie: 'Festival' }, { titre: 'Nuit du jazz à Paris', categorie: 'Concert' }, { titre: 'Concert acoustique dans une église', categorie: 'Concert' }]`."
    indices:
      - "La fonction de .filter() renvoie article.categorie === 'Concert'."
      - "Ensuite, .map((article) => article.titre) ne garde que les titres."
    solution: |
      ```js
      const articles = [
        { titre: 'Rock en Seine : le retour', categorie: 'Festival' },
        { titre: 'Nuit du jazz à Paris', categorie: 'Concert' },
        { titre: 'Concert acoustique dans une église', categorie: 'Concert' },
      ]

      const concerts = articles.filter((article) => article.categorie === 'Concert')
      console.log(concerts.map((article) => article.titre))
      // ['Nuit du jazz à Paris', 'Concert acoustique dans une église']
      ```
  - titre: "Un message quand c'est vide"
    niveau: moyen
    enonce: "Crée un composant ListeArticles qui reçoit une prop articles. Si la liste est vide, il affiche « Aucun article ne correspond. » ; sinon, une liste ul avec un li par titre."
    indices:
      - "Un ternaire sur articles.length === 0."
      - "Dans la branche « sinon », un articles.map(…) avec une key."
    solution: |
      ```jsx
      function ListeArticles({ articles }) {
        return articles.length === 0 ? (
          <p>Aucun article ne correspond.</p>
        ) : (
          <ul>
            {articles.map((article) => (
              <li key={article.id}>{article.titre}</li>
            ))}
          </ul>
        )
      }

      export default ListeArticles
      ```
  - titre: "La fonction de filtre de mon-blog"
    niveau: difficile
    enonce: "Écris une fonction filtrerArticles(articles, recherche, categorie) qui renvoie les articles de la bonne catégorie ('Toutes' = toutes) ET dont le titre ou un mot-clé contient la recherche, sans tenir compte des majuscules ni des espaces autour. Teste-la avec node."
    indices:
      - "Prépare le texte une seule fois : recherche.trim().toLowerCase()."
      - "Deux constantes dans le filter : bonneCategorie (avec le cas 'Toutes') et correspond (avec ||)."
      - "Pour les mots-clés : article.motsCles.join(' ').toLowerCase().includes(texte)."
    solution: |
      ```js
      function filtrerArticles(articles, recherche, categorie) {
        const texte = recherche.trim().toLowerCase()

        return articles.filter((article) => {
          const bonneCategorie = categorie === 'Toutes' || article.categorie === categorie
          const correspond =
            article.titre.toLowerCase().includes(texte) ||
            article.motsCles.join(' ').toLowerCase().includes(texte)
          return bonneCategorie && correspond
        })
      }

      const articles = [
        { id: 1, titre: "Festival de l'été", categorie: 'Festival', motsCles: ['été', 'live'] },
        { id: 2, titre: 'Nuit du jazz à Paris', categorie: 'Concert', motsCles: ['jazz', 'Paris'] },
      ]
      console.log(filtrerArticles(articles, '  PARIS ', 'Toutes').length) // 1
      console.log(filtrerArticles(articles, '', 'Festival').length)       // 1
      console.log(filtrerArticles(articles, 'jazz', 'Festival').length)   // 0
      ```
---

## Afficher ou rien : &&

:::quoi
`{condition && <X />}` : si la condition est vraie, React affiche `<X />` ; sinon, rien. Lecture : « condition **et** l'élément ».
:::

:::exemple
```jsx title="src/components/SearchBar.jsx"
{valeur && (
  <button type="button" className="btn btn-outline-secondary" onClick={() => onChange('')}>
    Effacer
  </button>
)}
```
:::

:::piege
Avec un **nombre**, le `0` s'affiche : `{articles.length && <Liste />}` écrit « 0 » quand la liste est vide. Compare toujours : `{articles.length > 0 && <Liste />}`.
:::

:::ou[Dans mes projets]
mon-blog, `SearchBar.jsx` : le bouton Effacer n'apparaît que si on a tapé quelque chose. PokéBistro, `ProductCard.jsx` : `{quantity > 0 && …}` affiche « 2 dans le panier » seulement si le plat y est.
:::

## Soit A, soit B : le ternaire

:::quoi
`condition ? siVrai : siFaux` est un **if/else qui tient dans une expression**. Il marche dans le JSX pour choisir une balise, un texte ou une classe.
:::

:::exemple
```jsx title="src/App.jsx"
{articlesFiltres.length === 0 ? (
  <p>Aucun article ne correspond à ta recherche.</p>
) : (
  <div className="row">…les cartes…</div>
)}

// aussi pour une classe (Article.jsx)
<p className={ouvert ? 'card-text' : 'card-text texte-article'}>
```
:::

:::piege
Le ternaire a **toujours deux branches** : `cond ? <A />` sans `: …` est une erreur de syntaxe. Pour « A ou rien », c'est `&&`.
:::

:::ou[Dans mon-blog]
`src/App.jsx` : le message « Aucun article ne correspond » à la place de la grille. `src/components/Article.jsx` : `{ouvert ? 'Réduire' : 'Lire la suite'}`.
:::

## Calculer avant le return

:::quoi
Un `if` classique ne s'écrit pas au milieu du JSX. Quand la logique est longue, calcule **avant le `return`** avec des `if` normaux, puis affiche le résultat.
:::

:::exemple
```jsx title="src/App.jsx"
let message = articlesFiltres.length + ' article'
if (articlesFiltres.length > 1) {
  message += 's'
}
if (recherche) {
  message += ' pour « ' + recherche + ' »'
}
// dans le return : <p className="text-muted mb-0">{message}</p>
```
:::

:::piege
`{ if (ouvert) { … } }` dans le JSX : erreur de syntaxe. Le `if` va avant le `return`, ou se transforme en ternaire.
:::

:::ou[Dans mes projets]
mon-blog : `message` dans `App.jsx`, la variable `classe` dans `CategoryFilter.jsx`. PokéBistro, `Modal.jsx` : `if (!isOpen) { return null }`, le composant n'affiche **rien** quand la modal est fermée.
:::

## .filter() : garder ce qui correspond

:::quoi
`.filter()` garde les éléments pour lesquels la fonction renvoie `true`, dans un **nouveau tableau**. L'original n'est jamais modifié.
:::

:::exemple
```js
const nombres = [3, 12, 7, 20]
const grands = nombres.filter((n) => n > 10)

console.log(grands)  // [12, 20]
console.log(nombres) // [3, 12, 7, 20] : l'original ne change pas
```
:::

:::piege
La fonction doit **renvoyer** un booléen : avec des accolades sans `return`, elle renvoie `undefined` et **rien n'est gardé**.
:::

:::ou[Dans mes projets]
mon-blog, `App.jsx` : `articles.filter(…)` donne `articlesFiltres`, affichés ensuite avec `.map()`. PokéBistro, `CategoryBlock.jsx` : `products.filter(…).length` compte les plats de chaque catégorie.
:::

:::info
Pas besoin de « supprimer » des cartes : à chaque rendu, la liste filtrée repart de **toute** la liste.
:::

## Une recherche qui ignore les majuscules

:::quoi
On met **tout en minuscules** des deux côtés avec `toLowerCase()`, puis `includes()` teste si le champ **contient** la recherche. Avec `||`, il suffit qu'**un** champ corresponde.
:::

:::exemple
```jsx title="src/App.jsx"
const texteRecherche = recherche.trim().toLowerCase()

const correspond =
  article.titre.toLowerCase().includes(texteRecherche) ||
  article.categorie.toLowerCase().includes(texteRecherche) ||
  article.texte.toLowerCase().includes(texteRecherche) ||
  article.motsCles.join(' ').toLowerCase().includes(texteRecherche)
```
:::

:::piege
`toLowerCase()` oublié d'un côté : « Jazz » ne trouve pas « jazz ».
:::

:::ou[Dans mes projets]
mon-blog, `App.jsx` : recherche sur le titre, la catégorie, le texte et les mots-clés. PokéBistro, `src/utils/filterProducts.js` va plus loin : il enlève aussi les accents, donc « epice » trouve « épicé ».
:::

:::astuce
`trim()` enlève les espaces autour de ce qui est tapé. `join(' ')` transforme `['jazz', 'Paris']` en `'jazz Paris'` pour pouvoir chercher dedans. Recherche vide : `includes('')` est toujours vrai, donc tout s'affiche.
:::

## Combiner deux filtres

:::quoi
Deux conditions reliées par `&&` : l'article doit passer **les deux**, la bonne catégorie **et** la recherche.
:::

:::exemple
```jsx title="src/App.jsx"
const articlesFiltres = articles.filter((article) => {
  const bonneCategorie = categorie === 'Toutes' || article.categorie === categorie
  const correspond = article.titre.toLowerCase().includes(texteRecherche) // … etc.
  return bonneCategorie && correspond
})
```
:::

:::piege
« Toutes » se traite à part : aucun article n'a la catégorie « Toutes ». Sans `categorie === 'Toutes' ||`, la liste serait vide.
:::

:::ou[Dans mes projets]
mon-blog, `App.jsx` : 2 filtres (catégorie et recherche). PokéBistro, `src/utils/filterProducts.js` : 4 filtres (recherche, catégorie, tag, prix) reliés par `&&`.
:::
