---
titre: "Méthodes de tableaux : forEach, filter, map, find, reduce"
matiere: javascript
type: cours
chapitre: 6
niveau: intermediaire
duree: 12
date: 2026-05-26
source: "Bachelor dev : cours JS n°2 et projets"
tags: [javascript, tableaux, foreach, filter, map, reduce, callback]
essentiel: "Ces méthodes reçoivent une fonction, appelée pour chaque élément. `forEach` agit, `filter` garde, `map` transforme, `find` trouve le premier, `every` vérifie tout, `reduce` résume en une seule valeur. `filter` et `map` renvoient un nouveau tableau sans toucher à l'original."
retenir:
  - "Pour retenir : forEach = agir, filter = garder, map = transformer, find = trouver, reduce = résumer."
  - "La fonction passée doit renvoyer une valeur (sauf avec `forEach`) : avec des accolades, n'oublie pas `return`."
  - "`find` renvoie un élément ou `undefined` ; `filter` renvoie toujours un tableau, parfois vide."
  - "Donne toujours une valeur de départ à `reduce` pour un total : `reduce((somme, x) => somme + x, 0)`."
  - "`querySelectorAll` renvoie une NodeList : `forEach` marche dessus, pas `map` ni `filter` (passe par `Array.from`)."
definitions:
  - terme: "Callback (fonction de rappel)"
    definition: "Fonction passée en argument à une autre fonction, qui l'appellera plus tard : pour chaque élément, à chaque clic…"
    exemple: "dogs.forEach(function (dog) { … })"
  - terme: "filter"
    definition: "Méthode qui renvoie un nouveau tableau avec seulement les éléments pour lesquels la fonction renvoie `true`."
    exemple: "books.filter(b => b.id !== 133712)"
  - terme: "map"
    definition: "Méthode qui renvoie un nouveau tableau de même longueur, où chaque élément a été transformé."
    exemple: "entrepreneurs.map(e => e.first + ' ' + e.last)"
  - terme: "find"
    definition: "Méthode qui renvoie le premier élément qui passe le test, ou `undefined` si aucun ne passe."
    exemple: "books.find(b => b.id === 873495)"
  - terme: "reduce"
    definition: "Méthode qui réduit un tableau à une seule valeur grâce à un accumulateur mis à jour à chaque élément."
    exemple: "notes.reduce((somme, n) => somme + n, 0)"
  - terme: "NodeList"
    definition: "Liste d'éléments HTML renvoyée par `querySelectorAll`. Elle a `forEach` et `length`, mais pas `map` ni `filter`."
    exemple: "Array.from(document.querySelectorAll(\".card\"))"
flashcards:
  - q: "Quelle méthode pour garder seulement certains éléments ?"
    r: "`filter` : elle renvoie un nouveau tableau avec les éléments qui passent le test."
  - q: "Quelle méthode pour transformer chaque élément ?"
    r: "`map` : autant d'éléments qu'au départ, chacun transformé."
  - q: "Que renvoie `forEach` ?"
    r: "`undefined` : `forEach` sert à agir, pas à fabriquer un tableau."
  - q: "Différence entre `find` et `filter` ?"
    r: "`find` renvoie le premier élément trouvé (ou `undefined`) ; `filter` renvoie le tableau de tous ceux qui passent."
  - q: "Que renvoie `every` ?"
    r: "`true` si tous les éléments passent le test, sinon `false`. Son cousin `some` : `true` si au moins un passe."
  - q: "À quoi sert le 0 dans `reduce((s, b) => s + b.rented, 0)` ?"
    r: "C'est la valeur de départ de l'accumulateur `s`."
  - q: "`filter` modifie-t-il le tableau d'origine ?"
    r: "Non : il renvoie un nouveau tableau. `sort`, lui, modifie l'original."
  - q: "Comment « supprimer » un élément avec `filter` ?"
    r: "En gardant tous les autres : `books.filter(b => b.id !== 133712)`."
  - q: "Pourquoi `document.querySelectorAll(\".card\").map(...)` plante ?"
    r: "C'est une NodeList : elle a `forEach` mais pas `map`. Convertis avec `Array.from()`."
  - q: "Que reçoit la fonction de `forEach` ?"
    r: "L'élément en cours, puis son index (et enfin le tableau entier)."
quiz:
  - question: "Que vaut `[1, 2, 3, 4].filter(n => n % 2 === 0)` ?"
    choix:
      - "[2, 4]"
      - "[1, 3]"
      - "[false, true, false, true]"
      - "2"
    reponse: "[2, 4]"
    explication: "`filter` garde les éléments pour lesquels la fonction renvoie `true` : les nombres pairs."
  - question: "Que vaut `[1, 2, 3].map(n => n * 10)` ?"
    choix:
      - "[10, 20, 30]"
      - "60"
      - "[1, 2, 3]"
      - "undefined"
    reponse: "[10, 20, 30]"
    explication: "`map` remplace chaque élément par ce que renvoie la fonction. Le tableau d'origine ne change pas."
  - question: "Aucun livre n'a l'id 42. Que renvoie `books.find(b => b.id === 42)` ?"
    choix:
      - "[]"
      - "null"
      - "undefined"
      - "false"
    reponse: "undefined"
    explication: "`find` renvoie `undefined` quand rien ne correspond. C'est `filter` qui renverrait un tableau vide."
  - question: "Que vaut `[5, 8, 2].reduce((total, n) => total + n, 0)` ?"
    choix:
      - "15"
      - "582"
      - "[5, 8, 2]"
      - "0"
    reponse: "15"
    explication: "L'accumulateur part de 0, puis 0 + 5 = 5, 5 + 8 = 13, 13 + 2 = 15."
  - question: "Quelle méthode répond à « tous les livres ont-ils été empruntés au moins une fois ? »"
    choix:
      - "some"
      - "every"
      - "find"
      - "map"
    reponse: "every"
    explication: "`every` renvoie `true` seulement si TOUS les éléments passent le test `book.rented > 0`."
  - question: "Que vaut `x` après `let x = [1, 2].forEach(n => n * 2);` ?"
    choix:
      - "[2, 4]"
      - "undefined"
      - "[1, 2]"
      - "4"
    reponse: "undefined"
    explication: "`forEach` ne renvoie jamais rien d'utile. Pour obtenir `[2, 4]`, il faut `map`."
exercices:
  - titre: "Les soldes"
    niveau: facile
    enonce: "Avec `const prix = [20, 45, 8, 120];`, crée le tableau des prix avec 10 % de remise (`[18, 40.5, 7.2, 108]`), puis le tableau des prix d'origine supérieurs à 30 (`[45, 120]`)."
    indices:
      - "Transformer chaque prix : `map`. Une remise de 10 %, c'est multiplier par 0.9."
      - "Garder certains prix : `filter` avec `p > 30`."
    solution: |
      ```js
      const prix = [20, 45, 8, 120];

      const soldes = prix.map((p) => p * 0.9);
      console.log(soldes); // [18, 40.5, 7.2, 108]

      const chers = prix.filter((p) => p > 30);
      console.log(chers);  // [45, 120]
      ```
  - titre: "La petite bibliothèque"
    niveau: moyen
    enonce: "Avec le tableau ci-dessous, affiche le nombre total d'emprunts (125) et le titre du livre d'id 2 (« Dune »). Dis enfin si tous les livres ont été empruntés au moins une fois (`false`).\n\n`const livres = [{ id: 1, titre: \"Akira\", emprunts: 40 }, { id: 2, titre: \"Dune\", emprunts: 85 }, { id: 3, titre: \"Monster\", emprunts: 0 }];`"
    indices:
      - "Le total : `reduce` avec une valeur de départ de 0."
      - "Un seul livre précis : `find`."
      - "« Tous » : `every`."
    solution: |
      ```js
      const livres = [
        { id: 1, titre: "Akira", emprunts: 40 },
        { id: 2, titre: "Dune", emprunts: 85 },
        { id: 3, titre: "Monster", emprunts: 0 }
      ];

      const total = livres.reduce((somme, l) => somme + l.emprunts, 0);
      console.log(total); // 125

      const livre = livres.find((l) => l.id === 2);
      console.log(livre.titre); // Dune

      const tousEmpruntes = livres.every((l) => l.emprunts > 0);
      console.log(tousEmpruntes); // false
      ```
  - titre: "Le bilan du quiz"
    niveau: difficile
    enonce: "Avec les résultats ci-dessous, affiche trois choses : les noms des thèmes réussis (au moins la moitié des points), le pourcentage global de bonnes réponses arrondi (73 %) et le thème au meilleur score.\n\n`const resultats = [{ theme: \"culture\", score: 4, total: 5 }, { theme: \"maths\", score: 2, total: 5 }, { theme: \"web\", score: 5, total: 5 }];`"
    indices:
      - "Thèmes réussis : `filter` (score / total >= 0.5) puis `map` pour ne garder que le nom."
      - "Pourcentage : deux `reduce` (bonnes réponses et nombre de questions), puis `Math.round`."
      - "Meilleur thème : `reduce` qui garde le plus grand, comme `mostRented` dans `js-cours2`."
    solution: |
      ```js
      const resultats = [
        { theme: "culture", score: 4, total: 5 },
        { theme: "maths", score: 2, total: 5 },
        { theme: "web", score: 5, total: 5 }
      ];

      const reussis = resultats
        .filter((r) => r.score / r.total >= 0.5)
        .map((r) => r.theme);
      console.log(reussis); // ['culture', 'web']

      const bonnes = resultats.reduce((somme, r) => somme + r.score, 0);    // 11
      const questions = resultats.reduce((somme, r) => somme + r.total, 0); // 15
      console.log(Math.round((bonnes / questions) * 100) + " %");           // 73 %

      const meilleur = resultats.reduce((max, r) => (r.score > max.score ? r : max));
      console.log(meilleur.theme); // web
      ```
---

## forEach : agir sur chaque élément

:::quoi
**forEach** appelle une fonction pour **chaque élément**, dans l'ordre. La fonction reçoit l'élément, puis son index. forEach ne renvoie rien : on s'en sert pour **agir** (afficher, brancher un écouteur…).
:::

:::exemple
```js
const dogs = ['Akita Inu', 'Beagle', 'Labrador'];

dogs.forEach(function (dog, index) {
  console.log(index + " : " + dog);
});
// 0 : Akita Inu
// 1 : Beagle
// 2 : Labrador
```
:::

:::piege
forEach renvoie toujours **undefined** : `let x = tab.forEach(...)` ne sert à rien. Et on ne peut pas l'arrêter en route (`break` y est interdit) : utilise alors `find` ou une boucle `for`.
:::

:::ou[Dans les exos DOM]
Partout où il y a plusieurs éléments : `labels.forEach` (`calculatrice/script.js`), `miniatures.forEach` (`dom-tp1/script.js`), `boutons.forEach` (`js-dom-exos/script.js`).
:::

## filter : garder certains éléments

:::quoi
**filter** renvoie un **nouveau tableau** avec seulement les éléments pour lesquels la fonction renvoie **true**. Le tableau d'origine ne change pas.
:::

:::exemple
```js title="js-cours2/script.js"
let bornIn70s = entrepreneurs.filter(function(e) {
  return e.year >= 1970 && e.year <= 1979;
});

let booksAfterDelete = books.filter(function(book) {
  return book.id !== 133712;   // « supprimer » = garder tous les autres
});
```
:::

:::piege
Oublie le `return` dans la fonction (avec accolades) et elle renvoie undefined : tu obtiens **un tableau vide**. En fléchée courte, pas de souci : `books.filter(b => b.id !== 133712)`.
:::

:::ou[Dans js-cours2]
Exercices 3 et 4 du cours JS n°2 : les entrepreneurs nés dans les années 70, puis la suppression du livre 133712.
:::

## map : transformer chaque élément

:::quoi
**map** renvoie un **nouveau tableau de même longueur**, où chaque élément est remplacé par ce que renvoie la fonction.
:::

:::exemple
```js title="js-cours2/script.js"
let fullNames = entrepreneurs.map(function(e) {
  return e.first + ' ' + e.last;
});
// ['Steve Jobs', 'Oprah Winfrey', 'Bill Gates', …]
```
:::

:::piege
map sert à **transformer**, pas à trier ni à filtrer : il renvoie toujours **autant** d'éléments. Pour seulement afficher, préfère `forEach`.
:::

:::ou[Dans js-cours2 et le Quiz Dynamique]
Exercice 3 du cours JS n°2 (noms complets, âges). Dans le **Quiz Dynamique**, `ordered.map(shuffleAnswers)` mélange les réponses de chaque question.
:::

## find et every : chercher et vérifier

:::quoi
**find** renvoie le **premier élément** qui passe le test, ou **undefined**. **every** renvoie **true** si **tous** les éléments passent le test. Son cousin **some** : true si **au moins un** passe.
:::

:::exemple
```js title="js-cours2/script.js"
let foundBook = books.find(function(book) {
  return book.id === 873495;
});

let allRented = books.every(function(book) {
  return book.rented > 0;
});
```
:::

:::piege
Si rien n'est trouvé, `find` renvoie **undefined** et `foundBook.title` plante (**TypeError**). Vérifie `if (foundBook)` avant de t'en servir.
:::

:::ou[Dans js-cours2]
Exercice 4 du cours JS n°2, « Library » : trouver le livre 873495, et savoir si tous les livres ont été empruntés au moins une fois.
:::

## reduce : tout résumer en une valeur

:::quoi
**reduce** parcourt le tableau avec un **accumulateur**. À chaque élément, la fonction reçoit l'accumulateur et l'élément, et renvoie le **nouvel accumulateur**. À la fin, il ne reste qu'une valeur.
:::

:::exemple
```js
// Le livre le plus emprunté (js-cours2/script.js)
let mostRented = books.reduce(function(max, book) {
  return book.rented > max.rented ? book : max;
});

// Le total des emprunts : l'accumulateur part de 0
let total = books.reduce((somme, book) => somme + book.rented, 0);
```
:::

:::piege
Pour un total, donne toujours la **valeur de départ** (le `0` final). Sans elle, `reduce` part du premier élément, et plante sur un tableau **vide** (TypeError).
:::

:::ou[Dans js-cours2]
Exercice 4 du cours JS n°2 : le livre le plus emprunté et le moins emprunté, chacun en un seul `reduce`.
:::

## Enchaîner et convertir

:::quoi
`filter` et `map` renvoient un tableau : on peut donc **enchaîner** les méthodes, une par ligne. Une **NodeList** (le résultat de `querySelectorAll`) n'a que `forEach` parmi ces méthodes : **Array.from()** la transforme en vrai tableau.
:::

:::exemple
```js
const noms70 = entrepreneurs
  .filter((e) => e.year >= 1970 && e.year <= 1979)
  .map((e) => e.first + " " + e.last);
// ['Elon Musk', 'Marissa Mayer', 'Larry Page', …]

const cards = Array.from(column.querySelectorAll(".card"));  // Kanban
cards.sort((a, b) => PRIORITY_ORDER[b.dataset.priority] - PRIORITY_ORDER[a.dataset.priority]);
```
:::

:::piege
`document.querySelectorAll(".card").map(...)` plante : **TypeError**, map n'existe pas sur une NodeList. Passe par `Array.from(liste)` ou `[...liste]`.
:::

:::ou[Dans le Kanban et le Quiz Dynamique]
Le tri par priorité du **Kanban** (`Array.from(...)` puis `sort`) et `[...el.answers.children]` dans le **Quiz Dynamique**.
:::
