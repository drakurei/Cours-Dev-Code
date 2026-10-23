---
titre: "Variables et types : ranger des valeurs"
matiere: javascript
type: cours
chapitre: 1
niveau: debutant
duree: 12
date: 2026-05-26
source: "Bachelor dev : pack JS et js-exercices"
tags: [javascript, variables, types, chaines, conversion]
essentiel: "Une variable est une boîte avec un nom : `const` si tu ne la réassignes jamais, `let` si elle doit changer. Chaque valeur a un type (string, number, boolean…). `prompt()` renvoie une chaîne, jamais un nombre : convertis-la avec `parseInt()` ou `Number()` avant de calculer."
retenir:
  - "Par défaut, écris `const` ; passe à `let` seulement si la variable doit être réassignée."
  - "`typeof` donne le type d'une valeur : `\"string\"`, `\"number\"`, `\"boolean\"`…"
  - "Dès qu'une chaîne est dans l'addition, `+` colle au lieu de calculer : `\"5\" + 2` donne `\"52\"`."
  - "Les méthodes de chaîne (`slice`, `trim`, `toLowerCase`…) renvoient une nouvelle chaîne : elles ne modifient jamais l'originale."
  - "Une conversion ratée donne `NaN` : vérifie avec `Number.isNaN()`."
definitions:
  - terme: "Variable"
    definition: "Une boîte nommée qui garde une valeur pour s'en servir plus loin."
    exemple: "let score = 0;"
  - terme: "const"
    definition: "Déclare une variable qu'on ne peut pas réassigner. C'est le choix par défaut."
    exemple: "const badgeNumber = 7;"
  - terme: "Type"
    definition: "La nature d'une valeur : string (texte), number (nombre), boolean (vrai / faux), undefined, null, object…"
    exemple: "`typeof 30 // \"number\"`"
  - terme: "Chaîne (string)"
    definition: "Une valeur de type texte, écrite entre guillemets ou entre accents graves."
    exemple: "`\"Bonjour\"`"
  - terme: "Concaténation"
    definition: "Coller des chaînes bout à bout avec l'opérateur `+`."
    exemple: "`\"Il est \" + heure + \" heures.\"`"
  - terme: "Gabarit (template literal)"
    definition: "Chaîne écrite entre accents graves dans laquelle `${}` insère une valeur."
    exemple: "`` `Il est ${heure} heures.` ``"
  - terme: "NaN"
    definition: "« Not a Number » : la valeur obtenue quand une conversion ou un calcul en nombre est impossible."
    exemple: "parseInt(\"abc\") // NaN"
  - terme: "Modulo (%)"
    definition: "Opérateur qui donne le reste d'une division entière. Pratique pour savoir si un nombre est pair."
    exemple: "`7 % 2 // 1`"
flashcards:
  - q: "`let` ou `const` par défaut ?"
    r: "`const`. On passe à `let` seulement si la variable doit être réassignée."
  - q: "Que renvoie `typeof 30` ?"
    r: "La chaîne `\"number\"`."
  - q: "Que donne `\"5\" + 2` ?"
    r: "`\"52\"` : avec une chaîne, `+` colle le texte au lieu de calculer."
  - q: "Quel type renvoie `prompt()` ?"
    r: "Une chaîne, même si on tape un nombre. Ou `null` si l'utilisateur clique sur Annuler."
  - q: "`parseInt(\"12 ans\")` ou `Number(\"12 ans\")` : lequel donne 12 ?"
    r: "`parseInt`, qui lit jusqu'au premier caractère qui n'est pas un chiffre. `Number` donne `NaN`."
  - q: "Comment insérer une variable dans un gabarit ?"
    r: "Entre accents graves, avec `${}` : `` `Il est ${heure} heures.` ``."
  - q: "Que renvoie `\"Bonjour\".slice(1, -1)` ?"
    r: "`\"onjou\"` : la chaîne sans son premier ni son dernier caractère."
  - q: "Que vaut `\"Bonjour\".length` ?"
    r: "7 : le nombre de caractères."
  - q: "Comment savoir si un nombre `n` est pair ?"
    r: "`n % 2 === 0` : le reste de la division par 2 vaut 0."
  - q: "Comment tirer un entier entre 1 et 100 ?"
    r: "`Math.floor(Math.random() * 100) + 1`."
quiz:
  - question: "Qu'affiche `console.log(\"5\" + 2)` ?"
    choix:
      - "7"
      - "52"
      - "NaN"
      - "Une erreur"
    reponse: "52"
    explication: "Avec une chaîne, `+` concatène : le 2 devient `\"2\"` et on obtient `\"52\"`. Pour additionner, convertis d'abord : `Number(\"5\") + 2`."
  - question: "Quel mot-clé choisir pour un score qui augmente pendant la partie ?"
    choix:
      - "const"
      - "let"
      - "typeof"
    reponse: "let"
    explication: "Le score est réassigné à chaque point : il faut `let`. `const` interdit la réassignation."
  - question: "Que renvoie `typeof \"30\"` ?"
    choix:
      - "\"number\""
      - "\"string\""
      - "\"boolean\""
      - "\"text\""
    reponse: "\"string\""
    explication: "Des guillemets font toujours une chaîne, même s'il n'y a que des chiffres dedans."
  - question: "L'utilisateur tape « vingt » dans `let age = parseInt(prompt(\"Âge ?\"));`. Que vaut `age` ?"
    choix:
      - "0"
      - "NaN"
      - "\"vingt\""
      - "20"
    reponse: "NaN"
    explication: "« vingt » ne commence pas par un chiffre : `parseInt` ne peut rien lire et renvoie `NaN`."
  - question: "Quelle expression simule un dé (entier de 1 à 6) ?"
    choix:
      - "Math.floor(Math.random() * 6) + 1"
      - "Math.floor(Math.random() * 6)"
      - "Math.floor(Math.random() * 7)"
      - "Math.random(6)"
    reponse: "Math.floor(Math.random() * 6) + 1"
    explication: "`Math.random() * 6` va de 0 à 5,99… ; `Math.floor` donne 0 à 5 ; le `+ 1` décale vers 1 à 6. Sans `+ 1`, tu obtiens 0 à 5 ; avec `* 7`, 0 à 6."
  - question: "Que renvoie `\"Bonjour\".slice(1, -1)` ?"
    choix:
      - "\"Bonjou\""
      - "\"onjour\""
      - "\"onjou\""
      - "\"B\""
    reponse: "\"onjou\""
    explication: "`slice(1, -1)` part de l'index 1 (le « o ») et s'arrête avant le dernier caractère : le premier et le dernier sautent."
exercices:
  - titre: "La carte de visite"
    niveau: facile
    enonce: "Déclare un prénom et un âge, puis affiche « Je m'appelle Alex et j'ai 21 ans. » avec un gabarit. Ajoute 1 à l'âge et affiche la phrase à nouveau."
    indices:
      - "Le prénom ne change pas : `const`. L'âge change : `let`."
      - "Un gabarit s'écrit entre accents graves : `` `j'ai ${age} ans` ``."
      - "`age++` ajoute 1 à l'âge."
    solution: |
      ```js
      const prenom = "Alex";
      let age = 21;
      console.log(`Je m'appelle ${prenom} et j'ai ${age} ans.`);

      age++;
      console.log(`Je m'appelle ${prenom} et j'ai ${age} ans.`); // ... j'ai 22 ans.
      ```
  - titre: "Le lancer de dé"
    niveau: moyen
    enonce: "Tire un entier au hasard entre 1 et 6, puis affiche « Tu as fait 4 (number) » : la valeur tirée et son type."
    indices:
      - "`Math.random()` donne un nombre entre 0 (inclus) et 1 (exclu)."
      - "Multiplie par 6, arrondis vers le bas avec `Math.floor`, puis ajoute 1."
      - "`typeof de` donne le type de la variable."
    solution: |
      ```js
      const de = Math.floor(Math.random() * 6) + 1;
      console.log(`Tu as fait ${de} (${typeof de})`); // Tu as fait 4 (number)
      ```
  - titre: "Le nettoyeur de saisie"
    niveau: difficile
    enonce: "On simule deux saisies : `const saisie = \"  Bonjour  \";` et `const quantite = \"3\";`.\n\nAffiche le mot sans espaces autour et en minuscules, puis sa longueur (7). Affiche ensuite le mot sans sa première ni sa dernière lettre. Enfin, ajoute 2 à la quantité : tu dois obtenir 5, pas « 32 »."
    indices:
      - "Commence par `trim()` et range le résultat dans une variable : les méthodes ne modifient pas la chaîne d'origine."
      - "`slice(1, -1)` enlève le premier et le dernier caractère."
      - "`quantite` est une chaîne : `quantite + 2` colle et donne « 32 ». Convertis-la avec `Number()` avant de calculer."
    solution: |
      ```js
      const saisie = "  Bonjour  ";
      const quantite = "3";

      const mot = saisie.trim();
      console.log(mot.toLowerCase());    // bonjour
      console.log(mot.length);           // 7
      console.log(mot.slice(1, -1));     // onjou
      console.log(Number(quantite) + 2); // 5
      ```
---

## Ranger une valeur : let et const

:::quoi
Une **variable** garde une valeur sous un nom. Avec **const**, la variable ne pourra jamais être réassignée. Avec **let**, elle pourra changer.
:::

:::exemple
```js title="js-exercices-pack/script.js"
const firstName = "Alex";  // le prénom ne change pas → const
let role = "visiteur";     // le rôle pourrait changer → let
const badgeNumber = 7;     // le numéro de badge ne change pas → const

console.log("Badge n°" + badgeNumber + " – Bienvenue " + firstName + " (" + role + ")");
```
:::

:::piege
Réassigner une **const** plante : `firstName = "Léa"` déclenche une **TypeError**. Évite aussi **var** (vu dans la calculatrice) : c'est l'ancienne façon, avec des règles de portée piégeuses.
:::

:::ou[Dans js-exercices-pack]
Exercices 1 et 2 du pack : `const` pour le prénom et le badge, `let` pour le rôle et le score qui évoluent.
:::

## Connaître le type : typeof

:::quoi
Chaque valeur a un **type**. Les trois plus courants : **string** (texte), **number** (nombre) et **boolean** (`true` / `false`). L'opérateur **typeof** te le donne.
:::

:::exemple
```js title="js-exercices-pack/script.js"
let userName = "Marie";
let userAge = 30;
let isLoggedIn = true;

console.log("userName est de type " + typeof userName);     // string
console.log("userAge est de type " + typeof userAge);       // number
console.log("isLoggedIn est de type " + typeof isLoggedIn); // boolean
```
:::

:::piege
`typeof "30"` renvoie **"string"** : des guillemets font du texte, même avec des chiffres. Et `typeof null` renvoie **"object"**, un vieux bug du langage.
:::

:::ou[Dans js-exercices-pack]
Exercice 3 du pack : afficher le type de `userName`, `userAge` et `isLoggedIn`.
:::

## Assembler du texte

:::quoi
Entre deux chaînes, **+** les **concatène** (les colle). Plus lisible : le **gabarit**, écrit entre accents graves, qui insère une valeur avec `${}`.
:::

:::exemple
```js
let prenom = "Stella";
let heure = 11;

console.log(prenom + " : Il est " + heure + " heures."); // concaténation
console.log(`${prenom} : Il est ${heure} heures.`);      // gabarit, même résultat
```
:::

:::piege
Dès qu'une **chaîne** est dans l'addition, `+` colle au lieu de calculer : `"5" + 2` donne **"52"**, pas 7.
:::

:::ou[Dans chat-simulator.js]
`exo1/chat-simulator.js` construit tout le dialogue avec `+`. Le gabarit sert partout dans le **Quiz Dynamique** : `` `Question ${currentIndex + 1} / ${questions.length}` ``.
:::

## Les outils des chaînes

:::quoi
Une **chaîne** a une longueur (**length**), des caractères numérotés à partir de **0**, et des **méthodes** toutes prêtes pour la couper, la chercher ou la nettoyer.
:::

:::exemple
```js
const mot = "Bonjour";
mot.length;            // 7
mot[0];                // "B" : on compte à partir de 0
mot.slice(1, -1);      // "onjou" : sans le premier ni le dernier caractère
mot.toLowerCase();     // "bonjour"
mot.includes("jour");  // true
"  salut  ".trim();    // "salut" : enlève les espaces autour
"#".repeat(3);         // "###"
```
:::

:::piege
Ces méthodes **ne modifient pas** la chaîne : elles en **renvoient** une nouvelle. `mot.toLowerCase();` tout seul ne sert à rien, il faut ranger le résultat dans une variable.
:::

:::ou[Dans cut-word.js et le Kanban]
`exo9/cut-word.js` (`slice(1, -1)`), `exo6/mario-pyramid.js` (`repeat`) et le **Kanban** : la recherche compare `toLowerCase()` + `includes()`, et le titre d'une carte passe par `trim()`.
:::

## Lire une saisie : prompt et conversion

:::quoi
**prompt()** pose une question et renvoie la réponse sous forme de **chaîne**. Pour calculer, convertis-la avec **parseInt()** (nombre entier) ou **Number()**.
:::

:::exemple
```js
let age = parseInt(prompt("Quel est votre âge ?")); // exo2/majority.js

parseInt("42");      // 42
parseInt("12 ans");  // 12 : lit jusqu'au premier caractère qui n'est pas un chiffre
Number("12 ans");    // NaN : toute la chaîne doit être un nombre
Number("");          // 0 : attention, un champ vide devient 0
```
:::

:::piege
Si la saisie n'est pas un nombre, tu obtiens **NaN** (Not a Number), et `NaN < 18` vaut **false**. Vérifie avec `Number.isNaN(age)`.
:::

:::ou[Dans majority.js et la calculatrice]
`exo2/majority.js` et `exo4/by-two.js` (`parseInt(prompt(...))`), puis `calculatrice/script.js` : `Number(document.getElementById("nombre1").value)`, car la valeur d'un champ est aussi une chaîne.
:::

:::info
`prompt()` et `alert()` n'existent que dans le **navigateur**. Pour tester ces exercices, ouvre la page puis la console avec **F12**.
:::

## Calculer et tirer au hasard

:::quoi
Les **opérateurs** de calcul : `+ - * /` et **%**, le reste de la division. L'objet **Math** fournit les outils : **Math.floor()** arrondit vers le bas, **Math.random()** donne un nombre entre 0 (inclus) et 1 (exclu).
:::

:::exemple
```js
let nombreSecret = Math.floor(Math.random() * 100) + 1; // exo10 : de 1 à 100

console.log(7 % 2);           // 1 : 7 est impair
console.log(10 % 2);          // 0 : 10 est pair
console.log(Math.floor(4.9)); // 4

let essais = 0;
essais++;                     // essais vaut 1 (comme essais = essais + 1)
```
:::

:::piege
Sans le `+ 1`, `Math.floor(Math.random() * 100)` donne de **0 à 99**. Et diviser par zéro ne plante pas : `5 / 0` donne **Infinity**.
:::

:::ou[Dans guess-number.js et dom-tp1]
`exo10/guess-number.js` (le nombre secret et `essais++`), `dom-tp1/script.js` (la position au hasard du carré qui bouge), `exo8/factorial.js` (`resultat *= i`).
:::
