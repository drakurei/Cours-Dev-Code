---
titre: "Fonctions : écrire une fois, réutiliser partout"
matiere: javascript
type: cours
chapitre: 4
niveau: debutant
duree: 12
date: 2026-05-26
source: "Bachelor dev : pack JS et js-exercices"
tags: [javascript, fonctions, return, portee, fonction-flechee]
essentiel: "Une fonction est une recette avec un nom : on la déclare une fois, on l'appelle autant qu'on veut. Elle reçoit des paramètres et renvoie un résultat avec `return`. La fonction fléchée `() => {}` est une écriture courte, très utilisée pour les événements."
retenir:
  - "Déclarer ne lance rien : il faut appeler la fonction, avec des parenthèses."
  - "Paramètre = le nom dans la déclaration ; argument = la valeur envoyée à l'appel."
  - "`return` renvoie une valeur ET arrête la fonction."
  - "`console.log` affiche, `return` renvoie : seul `return` permet de réutiliser le résultat."
  - "Une variable déclarée avec `let` ou `const` n'existe que dans son bloc `{ }`."
definitions:
  - terme: "Fonction"
    definition: "Bloc de code nommé et réutilisable, qui s'exécute quand on l'appelle."
    exemple: "function fact(n) { … }"
  - terme: "Paramètre"
    definition: "Nom de variable écrit dans la déclaration d'une fonction ; il recevra une valeur à l'appel."
    exemple: "function greet(name, age)"
  - terme: "Argument"
    definition: "Valeur réelle envoyée à la fonction au moment de l'appel."
    exemple: "greet(\"Emma\", 22)"
  - terme: "return"
    definition: "Renvoie une valeur à l'endroit de l'appel et arrête immédiatement la fonction."
    exemple: "return resultat;"
  - terme: "Return de garde"
    definition: "`return` placé en haut d'une fonction pour sortir tout de suite dans un cas spécial."
    exemple: "if (chaine.length < 2) return chaine;"
  - terme: "Fonction fléchée"
    definition: "Écriture courte d'une fonction avec `=>`. Sans accolades, la valeur de l'expression est renvoyée : le `return` est implicite."
    exemple: "const double = (n) => n * 2;"
  - terme: "Portée"
    definition: "Zone du code où une variable existe : le bloc `{ }` pour `let` et `const`, toute la fonction pour `var`."
flashcards:
  - q: "Déclarer une fonction suffit-il à l'exécuter ?"
    r: "Non : il faut l'appeler, avec des parenthèses : `welcomeUser(\"Alex\")`."
  - q: "Paramètre ou argument : lequel est écrit dans la déclaration ?"
    r: "Le paramètre. L'argument est la valeur passée à l'appel."
  - q: "Que renvoie une fonction sans `return` ?"
    r: "`undefined`."
  - q: "Différence entre `console.log` et `return` ?"
    r: "`console.log` affiche dans la console ; `return` renvoie la valeur pour qu'on puisse la réutiliser."
  - q: "Que se passe-t-il pour le code écrit après un `return` ?"
    r: "Il n'est jamais exécuté : la fonction s'arrête au `return`."
  - q: "Écris `double` en fonction fléchée."
    r: "`const double = (n) => n * 2;`"
  - q: "Avec `const double = (n) => { n * 2 };`, que renvoie `double(3)` ?"
    r: "`undefined` : avec des accolades, il faut écrire `return` soi-même."
  - q: "Que fait `greet(\"Emma\")` si `greet` attend `(name, age)` ?"
    r: "`age` vaut `undefined` : « Bonjour Emma, tu as undefined ans. »"
  - q: "Une variable `let` déclarée dans une boucle existe-t-elle après la boucle ?"
    r: "Non : elle n'existe que dans son bloc `{ }`. Y accéder dehors donne une ReferenceError."
quiz:
  - question: "Que vaut `x` ? `function carre(n) { console.log(n * n); }` puis `let x = carre(3);`"
    choix:
      - "9"
      - "undefined"
      - "\"9\""
      - "Une erreur"
    reponse: "undefined"
    explication: "`carre` affiche 9 dans la console mais ne renvoie rien : sans `return`, une fonction renvoie `undefined`."
  - question: "Que renvoie `cutWord(\"Hi\")` avec la fonction de `exo9/cut-word.js` ?"
    choix:
      - "\"Hi\""
      - "\"\" (chaîne vide)"
      - "\"i\""
      - "undefined"
    reponse: "\"\" (chaîne vide)"
    explication: "« Hi » a 2 caractères, donc pas de return de garde : `\"Hi\".slice(1, -1)` enlève le premier et le dernier, il ne reste rien."
  - question: "Quelle écriture équivaut à `function triple(n) { return n * 3; }` ?"
    choix:
      - "const triple = (n) => n * 3;"
      - "const triple = (n) => { n * 3 };"
      - "const triple = (n) => return n * 3;"
      - "const triple => (n) n * 3;"
    reponse: "const triple = (n) => n * 3;"
    explication: "Sans accolades, la valeur de l'expression est renvoyée automatiquement. Avec accolades, il faudrait `return`. La 3e et la 4e sont des erreurs de syntaxe."
  - question: "Dans `greet(\"Emma\", 22)`, que sont `\"Emma\"` et 22 ?"
    choix:
      - "Des paramètres"
      - "Des arguments"
      - "Des valeurs de retour"
    reponse: "Des arguments"
    explication: "Les arguments sont les valeurs envoyées à l'appel. Les paramètres sont `name` et `age`, dans la déclaration."
  - question: "Qu'affiche `console.log(test());` avec `function test() { return 1; console.log(\"fin\"); }` ?"
    choix:
      - "fin, puis 1"
      - "1"
      - "fin"
      - "undefined"
    reponse: "1"
    explication: "`return 1` arrête la fonction : le `console.log(\"fin\")` n'est jamais atteint."
  - question: "Pourquoi `console.log(blocs)` placé après la boucle déclenche une ReferenceError ?"
    choix:
      - "blocs a été déclaré avec let dans la boucle"
      - "repeat() a échoué"
      - "console.log est interdit dans une fonction"
    reponse: "blocs a été déclaré avec let dans la boucle"
    explication: "Avec `let`, la variable n'existe que dans le bloc `{ }` de la boucle : dehors, elle est inconnue."
exercices:
  - titre: "Le message de bienvenue"
    niveau: facile
    enonce: "Écris une fonction `bienvenue(prenom)` qui **renvoie** une chaîne comme « Bienvenue, Léa ! » Affiche ensuite le résultat pour deux prénoms."
    indices:
      - "La fonction utilise `return`, pas `console.log`."
      - "C'est à l'appel qu'on affiche : `console.log(bienvenue(\"Léa\"))`."
    solution: |
      ```js
      function bienvenue(prenom) {
        return "Bienvenue, " + prenom + " !";
      }

      console.log(bienvenue("Léa"));  // Bienvenue, Léa !
      console.log(bienvenue("Alex")); // Bienvenue, Alex !
      ```
  - titre: "Le prix TTC"
    niveau: moyen
    enonce: "Écris une fonction fléchée `prixTTC(ht, taux)` qui renvoie le prix toutes taxes comprises : le prix HT plus `ht * taux / 100`. `prixTTC(100, 20)` doit renvoyer 120 et `prixTTC(50, 5.5)` doit renvoyer 52.75."
    indices:
      - "Deux paramètres, dans l'ordre : `(ht, taux)`."
      - "Une seule expression : pas besoin d'accolades ni de `return`."
    solution: |
      ```js
      const prixTTC = (ht, taux) => ht + (ht * taux) / 100;

      console.log(prixTTC(100, 20)); // 120
      console.log(prixTTC(50, 5.5)); // 52.75
      ```
  - titre: "Le plus grand des trois"
    niveau: difficile
    enonce: "Écris `maxDeTrois(a, b, c)` qui renvoie le plus grand des trois nombres. Si l'un des arguments n'est pas un nombre, renvoie `null` tout de suite (return de garde). `maxDeTrois(5, 12, 3)` renvoie 12 ; `maxDeTrois(5, \"12\", 3)` renvoie `null`."
    indices:
      - "Le return de garde : `if (typeof a !== \"number\" || …) return null;`."
      - "Pars de `let max = a;` puis compare avec `b` et `c`."
      - "N'utilise pas `Math.max` : le but est d'écrire la logique toi-même."
    solution: |
      ```js
      function maxDeTrois(a, b, c) {
        if (typeof a !== "number" || typeof b !== "number" || typeof c !== "number") {
          return null; // cas spécial : on sort tout de suite
        }
        let max = a;
        if (b > max) max = b;
        if (c > max) max = c;
        return max;
      }

      console.log(maxDeTrois(5, 12, 3));   // 12
      console.log(maxDeTrois(5, "12", 3)); // null
      ```
---

## Déclarer et appeler

:::quoi
On **déclare** une fonction avec `function nom() { … }`. Elle ne fait rien tant qu'on ne l'**appelle** pas, avec des parenthèses : `nom()`.
:::

:::exemple
```js title="js-exercices-pack/script.js"
function welcomeUser(name) {
  console.log("Bienvenue, " + name + " ! Prêt à coder ?");
}

welcomeUser("Alex");
welcomeUser("Léa");
```
:::

:::piege
Sans parenthèses, `welcomeUser` désigne la fonction **sans l'exécuter**. Pour la lancer : `welcomeUser("Alex")`.
:::

:::ou[Dans js-exercices-pack]
Exercice 9 du pack, et `pyramide(nb)` en bas de `exo6/mario-pyramid.js`.
:::

## Paramètres et arguments

:::quoi
Les **paramètres** sont les noms entre parenthèses dans la déclaration. Les **arguments** sont les valeurs envoyées à l'appel, **dans le même ordre**.
:::

:::exemple
```js title="js-exercices-pack/script.js"
function greet(name, age) {
  console.log("Bonjour " + name + ", tu as " + age + " ans.");
}

greet("Emma", 22);   // name = "Emma", age = 22
greet("Jules", 44);
```
:::

:::piege
L'ordre compte : `greet(22, "Emma")` affiche « Bonjour 22, tu as Emma ans. » Un argument oublié vaut **undefined**.
:::

:::ou[Dans js-exercices-pack]
Exercice 10 du pack, et `welcomeKiosk(name, age, inscribed)` dans l'exercice 12 : la borne d'accueil.
:::

## Renvoyer un résultat : return

:::quoi
**return** renvoie une valeur à l'endroit de l'appel. On peut la ranger dans une variable, l'afficher ou la réutiliser dans un calcul.
:::

:::exemple
```js title="exo8/factorial.js"
function fact(n) {
  let resultat = 1;
  for (let i = 2; i <= n; i++) {
    resultat *= i;
  }
  return resultat;
}

console.log(fact(4)); // 24
```
:::

:::piege
**console.log affiche, return renvoie.** Une fonction sans `return` renvoie **undefined** : `let x = welcomeUser("Alex");` met `undefined` dans `x`.
:::

:::ou[Dans factorial.js et le Kanban]
`exo8/factorial.js`, et `getPriorityLabel(priority)` du **Kanban**, qui renvoie le libellé « Haute », « Moyenne » ou « Faible ».
:::

## Sortir tôt : le return de garde

:::quoi
`return` **arrête** la fonction tout de suite. On s'en sert au début pour écarter un cas spécial : c'est un **return de garde**.
:::

:::exemple
```js title="exo9/cut-word.js"
function cutWord(chaine) {
  if (chaine.length < 2) {
    return chaine;               // cas spécial : on sort tout de suite
  }
  return chaine.slice(1, -1);
}

console.log(cutWord("Bonjour")); // onjou
console.log(cutWord("A"));       // A
```
:::

:::piege
Le code placé **après** un `return` ne s'exécute jamais. Mets les cas spéciaux **en haut** de la fonction.
:::

:::ou[Dans cut-word.js et la calculatrice]
`exo9/cut-word.js`, la division par zéro de `calculatrice/script.js` (une alerte puis `return`) et `if (!tousValides) return;` dans `feedback-form/script.js`.
:::

## La fonction fléchée

:::quoi
La **fonction fléchée** `(param) => { … }` est une écriture courte. Pour **une seule expression**, on enlève les accolades et le `return` : la valeur est renvoyée toute seule.
:::

:::exemple
```js
function double(n) {          // classique
  return n * 2;
}
const doubleFleche = (n) => n * 2;  // fléchée : même résultat

form.addEventListener("input", (event) => {  // feedback-form/script.js
  validerChamp(event.target);
});
```
:::

:::piege
Avec des accolades, il faut un `return` : avec `const double = (n) => { n * 2 };`, `double(3)` renvoie **undefined**.
:::

:::ou[Dans feedback-form et le Kanban]
Les écouteurs `input` et `submit` de `feedback-form/script.js`, et tout le **Kanban** : `columns.forEach(column => { … })`.
:::

## La portée : où vit une variable

:::quoi
Une variable déclarée avec **let** ou **const** n'existe que dans son **bloc** `{ … }` : c'est sa **portée**. Une variable créée dans une fonction est invisible en dehors.
:::

:::exemple
```js
function pyramide(etages) {
  for (let i = 1; i <= etages; i++) {
    let blocs = "#".repeat(i);
    console.log(blocs);
  }
  console.log(blocs); // ReferenceError : blocs n'existe que dans la boucle
}
```
:::

:::piege
**var** ignore les blocs : il ne connaît que la fonction. Une variable `var` « fuit » hors d'un `if` ou d'un `for`, d'où des bugs : préfère `let` et `const`.
:::

:::ou[Dans mario-pyramid.js et le Kanban]
Dans `exo6/mario-pyramid.js`, `espaces` et `blocs` sont recréées à chaque étage. Dans le **Kanban**, les `const` déclarées dans le `DOMContentLoaded` n'existent que dans cette fonction.
:::
