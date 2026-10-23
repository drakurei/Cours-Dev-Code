---
titre: "Tableaux et objets : ranger plusieurs valeurs"
matiere: javascript
type: cours
chapitre: 5
niveau: debutant
duree: 14
date: 2026-05-26
source: "Bachelor dev : cours JS n°2 et projets"
tags: [javascript, tableaux, objets, json, localstorage, date]
essentiel: "Un tableau range des valeurs dans l'ordre, numérotées à partir de 0. Un objet range des valeurs sous des noms : ses propriétés. On les combine souvent en tableau d'objets, comme les livres de la bibliothèque ou les questions du quiz."
retenir:
  - "Le premier élément est `tab[0]`, le dernier `tab[tab.length - 1]`."
  - "`push` ajoute à la fin et `sort` trie : tous les deux modifient le tableau lui-même."
  - "`sort()` trie comme du texte : pour des nombres, écris `sort((a, b) => a - b)`."
  - "`objet.propriete` pour un nom fixe, `objet[variable]` quand le nom est dans une variable."
  - "`localStorage` ne garde que des chaînes : `JSON.stringify` pour ranger, `JSON.parse` pour relire."
definitions:
  - terme: "Tableau"
    definition: "Liste ordonnée de valeurs, appelées éléments, numérotées à partir de 0."
    exemple: "['Akita Inu', 'Beagle']"
  - terme: "Index (tableau)"
    definition: "Le numéro de la place d'un élément dans un tableau (ou d'un caractère dans une chaîne). Le premier est 0."
    exemple: "dogs[0]"
  - terme: "Objet"
    definition: "Ensemble de propriétés `nom: valeur` écrit entre accolades."
    exemple: "{ firstName: 'Julie', age: 17 }"
  - terme: "Propriété"
    definition: "Une paire nom / valeur rangée dans un objet. On la lit avec un point ou des crochets."
    exemple: "`user.age`"
  - terme: "Méthode"
    definition: "Fonction rangée dans un objet, appelée avec `objet.methode()`."
    exemple: "user.fullName()"
  - terme: "this"
    definition: "Dans une méthode, désigne l'objet qui appelle cette méthode."
    exemple: "return this.age >= 18;"
  - terme: "JSON"
    definition: "Format texte qui représente des objets et des tableaux, pour les stocker ou les envoyer."
    exemple: "JSON.stringify({ score: 3 }) // '{\"score\":3}'"
  - terme: "localStorage"
    definition: "Stockage du navigateur qui garde des chaînes, même après la fermeture de l'onglet."
    exemple: "localStorage.setItem(\"kanban-theme\", \"dark\")"
flashcards:
  - q: "Quel est l'index du premier élément d'un tableau ?"
    r: "0."
  - q: "Comment lire le dernier élément de `dogs` ?"
    r: "`dogs[dogs.length - 1]`."
  - q: "Que fait `push()` ?"
    r: "Ajoute un élément à la fin du tableau, en modifiant le tableau lui-même."
  - q: "Que renvoie `\"14/07/2005\".split(\"/\")` ?"
    r: "Le tableau `[\"14\", \"07\", \"2005\"]` : trois chaînes, pas trois nombres."
  - q: "Pourquoi `[12, 9, 100].sort()` donne `[100, 12, 9]` ?"
    r: "`sort()` compare comme du texte : « 100 » < « 12 » < « 9 ». Pour des nombres : `sort((a, b) => a - b)`."
  - q: "Point ou crochets : quand écrire `objet[cle]` ?"
    r: "Quand le nom de la propriété est dans une variable, comme `messages[humeur]`."
  - q: "Que désigne `this` dans `user.fullName()` ?"
    r: "L'objet `user`, celui qui appelle la méthode."
  - q: "Pourquoi `getMonth() + 1` ?"
    r: "`getMonth()` compte de 0 (janvier) à 11 (décembre)."
  - q: "Pourquoi `JSON.stringify` avant `localStorage.setItem` ?"
    r: "`localStorage` ne stocke que des chaînes : `stringify` transforme l'objet en texte JSON."
  - q: "Que renvoie `localStorage.getItem()` si la clé n'existe pas ?"
    r: "`null`."
quiz:
  - question: "Avec `let dogs = ['Akita', 'Beagle', 'Labrador'];`, que vaut `dogs[1]` ?"
    choix:
      - "'Akita'"
      - "'Beagle'"
      - "'Labrador'"
      - "undefined"
    reponse: "'Beagle'"
    explication: "Les index commencent à 0 : `dogs[0]` est 'Akita', `dogs[1]` est 'Beagle'."
  - question: "Que donne `[12, 9, 100].sort()` ?"
    choix:
      - "[9, 12, 100]"
      - "[100, 12, 9]"
      - "[100, 9, 12]"
      - "[12, 9, 100]"
    reponse: "[100, 12, 9]"
    explication: "Sans fonction de comparaison, `sort` compare des chaînes caractère par caractère : « 1 » passe avant « 9 »."
  - question: "Comment lire la propriété dont le nom est rangé dans la variable `humeur` ?"
    choix:
      - "messages.humeur"
      - "messages[humeur]"
      - "messages(humeur)"
      - "messages->humeur"
    reponse: "messages[humeur]"
    explication: "`messages.humeur` chercherait une propriété qui s'appelle littéralement « humeur ». Les crochets utilisent la valeur de la variable."
  - question: "Le 14 juillet, que renvoie `new Date().getMonth()` ?"
    choix:
      - "7"
      - "6"
      - "14"
      - "\"juillet\""
    reponse: "6"
    explication: "Les mois vont de 0 (janvier) à 11 (décembre) : juillet vaut 6. D'où le `+ 1` de `exo7/happy-birthday.js`."
  - question: "Que contient `parties[1]` après `let parties = \"25/12/2005\".split(\"/\");` ?"
    choix:
      - "12 (un nombre)"
      - "\"12\" (une chaîne)"
      - "\"25\""
      - "[\"12\"]"
    reponse: "\"12\" (une chaîne)"
    explication: "`split` renvoie des morceaux de chaîne. Il faut `parseInt(parties[1])` pour obtenir le nombre 12."
  - question: "Que range `localStorage.setItem(\"k\", JSON.stringify({ score: 3 }))` ?"
    choix:
      - "L'objet { score: 3 }"
      - "La chaîne '{\"score\":3}'"
      - "La chaîne \"[object Object]\""
      - "Le nombre 3"
    reponse: "La chaîne '{\"score\":3}'"
    explication: "`JSON.stringify` transforme l'objet en texte JSON. Sans lui, on obtiendrait « [object Object] »."
  - question: "Dans une méthode écrite avec `function()`, que désigne `this` ?"
    choix:
      - "La fonction elle-même"
      - "L'objet qui appelle la méthode"
      - "Le dernier objet créé"
    reponse: "L'objet qui appelle la méthode"
    explication: "Dans `user.isMajor()`, `this` vaut `user` : `this.age` lit donc `user.age`."
exercices:
  - titre: "La playlist"
    niveau: facile
    enonce: "Crée un tableau de trois titres de musique, ajoute un quatrième titre avec `push`, puis affiche le premier titre, le dernier et le nombre de titres."
    indices:
      - "Le premier : index 0."
      - "Le dernier : `playlist[playlist.length - 1]`."
    solution: |
      ```js
      const playlist = ["Gurenge", "Unravel", "Blue Bird"];
      playlist.push("Kaikai Kitan");

      console.log(playlist[0]);                   // Gurenge
      console.log(playlist[playlist.length - 1]); // Kaikai Kitan
      console.log(playlist.length);               // 4
      ```
  - titre: "La date à la française"
    niveau: moyen
    enonce: "Écris une fonction `versFrancais(dateIso)` qui transforme `\"2005-07-14\"` en `\"14/07/2005\"`."
    indices:
      - "`split(\"-\")` donne `[\"2005\", \"07\", \"14\"]`."
      - "Recolle les morceaux dans l'autre ordre : index 2, puis 1, puis 0."
    solution: |
      ```js
      function versFrancais(dateIso) {
        const parties = dateIso.split("-"); // ["2005", "07", "14"]
        return parties[2] + "/" + parties[1] + "/" + parties[0];
      }

      console.log(versFrancais("2005-07-14")); // 14/07/2005
      ```
  - titre: "La fiche joueur"
    niveau: moyen
    enonce: "Crée un objet `joueur` avec `pseudo`, `niveau: 1` et `points: 0`, et une méthode `gagner(n)` qui ajoute n points. Chaque fois que les points atteignent 100, le niveau monte de 1 et on retire 100 points.\n\nTest : après deux `gagner(60)`, niveau 2 et 20 points. Après un `gagner(250)` de plus, niveau 4 et 70 points."
    indices:
      - "Une méthode s'écrit `gagner: function (n) { … }`."
      - "Dans la méthode, `this.points` désigne les points du joueur."
      - "Après l'ajout, une boucle `while (this.points >= 100)` : un gros gain peut faire monter de plusieurs niveaux."
    solution: |
      ```js
      const joueur = {
        pseudo: "Kenji",
        niveau: 1,
        points: 0,
        gagner: function (n) {
          this.points += n;
          while (this.points >= 100) { // un gros gain peut valoir plusieurs niveaux
            this.niveau++;
            this.points -= 100;
          }
        }
      };

      joueur.gagner(60);
      joueur.gagner(60);
      console.log(joueur.niveau, joueur.points); // 2 20

      joueur.gagner(250);
      console.log(joueur.niveau, joueur.points); // 4 70
      ```
  - titre: "Le classement sauvegardé"
    niveau: difficile
    enonce: "Avec un tableau de joueurs `{ pseudo, points }`, trie-le du meilleur au moins bon score. Transforme-le ensuite en texte JSON (ce qu'on rangerait dans `localStorage`), relis ce texte avec `JSON.parse` et affiche le pseudo du premier."
    indices:
      - "Pour trier des objets par nombre : `sort((a, b) => b.points - a.points)`."
      - "`JSON.stringify(joueurs)` donne une chaîne ; `JSON.parse(texte)` redonne un tableau."
      - "Le premier du tableau relu : `relu[0].pseudo`."
    solution: |
      ```js
      const joueurs = [
        { pseudo: "Aiko", points: 40 },
        { pseudo: "Kenji", points: 95 },
        { pseudo: "Mei", points: 70 }
      ];

      joueurs.sort((a, b) => b.points - a.points); // du plus grand au plus petit

      const texte = JSON.stringify(joueurs); // à ranger avec localStorage.setItem
      const relu = JSON.parse(texte);        // ce que redonnerait getItem + parse
      console.log(relu[0].pseudo);           // Kenji
      ```
---

## Le tableau : une liste numérotée

:::quoi
Un **tableau** range des **éléments** dans l'ordre. Chaque élément a un **index** qui commence à **0**. **length** donne le nombre d'éléments, **push()** en ajoute un à la fin.
:::

:::exemple
```js
let dogs = ['Akita Inu', 'Bouvier bernois', 'Beagle']; // js-cours2
dogs.push('Labrador');
dogs.push('Golden Retriever');

console.log(dogs[0]);      // Akita Inu
console.log(dogs.length);  // 5
```
:::

:::piege
Le dernier élément est `dogs[dogs.length - 1]` : `dogs[dogs.length]` vaut **undefined**. Et `const` n'empêche pas `push` : il interdit seulement de réassigner tout le tableau.
:::

:::ou[Dans js-cours2]
Exercice 1 du cours JS n°2, « Dogs array ». Dans le **Quiz Dynamique**, `questions[currentIndex]` lit la question en cours.
:::

## split : de la chaîne au tableau

:::quoi
**split(séparateur)** coupe une chaîne et renvoie un **tableau** de morceaux. Chaque morceau reste une **chaîne**. L'inverse, **join(séparateur)**, recolle un tableau en chaîne.
:::

:::exemple
```js title="exo7/happy-birthday.js"
// dateNaissance vaut par exemple "14/07/2005"
let parties   = dateNaissance.split("/");  // ["14", "07", "2005"]
let jourNaiss = parseInt(parties[0]);      // 14
let moisNaiss = parseInt(parties[1]);      // 7
```
:::

:::piege
Les morceaux sont des **chaînes** : `"07" === 7` est faux. Convertis avec `parseInt()` avant de comparer à un nombre.
:::

:::ou[Dans happy-birthday.js]
`exo7/happy-birthday.js` découpe la date « jj/mm/aaaa » saisie, pour la comparer au jour et au mois d'aujourd'hui.
:::

## Trier avec sort

:::quoi
**sort()** trie le tableau **lui-même** : il le modifie. Sans argument, il trie **comme du texte**, caractère par caractère. Pour des nombres, donne-lui une **fonction de comparaison**.
:::

:::exemple
```js
let dogs = ['Labrador', 'Akita Inu', 'Beagle'];
dogs.sort();                  // ['Akita Inu', 'Beagle', 'Labrador']

let notes = [12, 9, 100];
notes.sort();                 // [100, 12, 9] : trié comme du texte !
notes.sort((a, b) => a - b);  // [9, 12, 100] : ordre croissant
notes.sort((a, b) => b - a);  // [100, 12, 9] : ordre décroissant
```
:::

:::piege
Les **majuscules** passent avant les minuscules : `sort()` range « Zèbre » avant « abeille ». Pour du texte français, trie avec `(a, b) => a.localeCompare(b)`.
:::

:::ou[Dans js-cours2 et le Kanban]
`dogs.sort()` dans `js-cours2/script.js`. Le tri par priorité du **Kanban** : `PRIORITY_ORDER[b.dataset.priority] - PRIORITY_ORDER[a.dataset.priority]`.
:::

## L'objet : des valeurs avec un nom

:::quoi
Un **objet** range des valeurs sous des **noms** : ses **propriétés**. On les lit avec un **point** (`user.age`), ou avec des **crochets** quand le nom est dans une variable (`messages[humeur]`).
:::

:::exemple
```js
let user = { firstName: 'Julie', lastName: 'Martin', age: 17 };
console.log(user.firstName);   // Julie
user.age = 18;                 // modifier une propriété
user.city = 'Lyon';            // en ajouter une

const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };  // Kanban
let priorite = "high";
console.log(PRIORITY_ORDER[priorite]);  // 3 : le nom vient de la variable
```
:::

:::piege
`PRIORITY_ORDER.priorite` cherche une propriété qui s'appelle **littéralement** « priorite » : **undefined**. Avec une variable, utilise les **crochets**.
:::

:::ou[Dans js-cours2 et js-dom-exos]
`user` et `dogsObjects[0].nativeCountry = 'Japon'` dans `js-cours2/script.js`, `messages[humeur]` dans `js-dom-exos/script.js`, `quizData[currentTheme]` dans le **Quiz Dynamique**.
:::

## La méthode et this

:::quoi
Une **méthode** est une fonction rangée dans un objet. À l'intérieur, **this** désigne l'objet qui l'appelle.
:::

:::exemple
```js
let user = {
  firstName: 'Julie',
  lastName: 'Martin',
  age: 17,
  isMajor: function() {
    return this.age >= 18;   // this = user
  }
};
console.log(user.isMajor()); // false
```
:::

:::piege
Une méthode écrite en **fonction fléchée** n'a pas son propre `this` : `isMajor: () => this.age >= 18` ne lit pas `user.age`. Garde `function()` pour les méthodes.
:::

:::ou[Dans js-cours2]
Exercice 2 du cours JS n°2 : les méthodes `fullName()` et `isMajor()` de l'objet `user`.
:::

## Date : un objet tout prêt

:::quoi
**new Date()** crée un objet qui contient la date et l'heure actuelles. Ses méthodes lisent chaque partie : **getDate()** (le jour du mois), **getMonth()** (le mois), **getFullYear()** (l'année).
:::

:::exemple
```js title="exo7/happy-birthday.js"
let aujourdhui = new Date();
let jourAujourdhui  = aujourdhui.getDate();
let moisAujourdhui  = aujourdhui.getMonth() + 1; // getMonth() commence à 0
```
:::

:::piege
**getMonth()** compte de **0 à 11** (janvier = 0) : ajoute 1. Et **getDay()** donne le jour de la **semaine** (0 = dimanche), pas le jour du mois.
:::

:::ou[Dans happy-birthday.js et js-cours2]
`exo7/happy-birthday.js` (30 % de remise le jour de l'anniversaire) et `new Date().getFullYear()` pour calculer l'âge des entrepreneurs dans `js-cours2/script.js`.
:::

## JSON : sauvegarder dans le navigateur

:::quoi
**localStorage** garde des données dans le navigateur, même après la fermeture, mais **seulement des chaînes**. **JSON.stringify()** transforme un tableau ou un objet en chaîne ; **JSON.parse()** fait l'inverse.
:::

:::exemple
```js
const STORAGE_KEY = "kanban-state";

// Sauvegarder : tableau d'objets → chaîne
localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));

// Relire : chaîne → tableau (null si rien n'a été sauvegardé)
const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
```
:::

:::piege
Sans `JSON.stringify`, `localStorage.setItem("cle", cards)` range un texte inutile : **« [object Object] »** pour chaque objet. Et `getItem` renvoie **null** si la clé n'existe pas.
:::

:::ou[Dans le Kanban et le Quiz Dynamique]
`saveState()` et `loadState()` du **Kanban**, le thème sombre mémorisé (`kanban-theme`), et le meilleur score par thème du **Quiz Dynamique** (`quizBestScore_culture`…).
:::
