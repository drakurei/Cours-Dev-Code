---
titre: "Boucles : for et while"
matiere: javascript
type: cours
chapitre: 3
niveau: debutant
duree: 10
date: 2026-05-26
source: "Bachelor dev : pack JS et js-exercices"
tags: [javascript, boucles, for, while]
essentiel: "Une boucle répète un bloc. `for` sert quand tu sais combien de tours faire (départ ; condition ; pas), `while` quand tu répètes tant qu'une condition reste vraie. Vérifie toujours que ta boucle peut s'arrêter."
retenir:
  - "`for (let i = 1; i <= 5; i++)` fait 5 tours : i vaut 1, 2, 3, 4 puis 5."
  - "Le pas peut descendre (`i--`) ou sauter (`i += 2`)."
  - "Un accumulateur se déclare AVANT la boucle et se met à jour DANS la boucle."
  - "`while` répète tant que sa condition est vraie : quelque chose dans la boucle doit finir par la rendre fausse."
definitions:
  - terme: "Boucle"
    definition: "Un bloc de code répété plusieurs fois, tant qu'une condition reste vraie."
  - terme: "Itération (boucle)"
    definition: "Un tour de boucle : un passage complet dans le bloc."
  - terme: "Compteur"
    definition: "La variable (souvent `i`) qui change à chaque tour d'une boucle `for`."
    exemple: "for (let i = 0; i < 5; i++)"
  - terme: "Incrémenter"
    definition: "Ajouter 1 à une variable. Décrémenter : retirer 1."
    exemple: "i++ // comme i = i + 1"
  - terme: "Accumulateur"
    definition: "Variable déclarée avant la boucle, qui cumule un résultat à chaque tour : total, produit, compteur d'essais."
    exemple: "resultat *= i;"
  - terme: "Boucle infinie"
    definition: "Boucle dont la condition ne devient jamais fausse : le programme ne s'arrête pas et la page se fige."
flashcards:
  - q: "Les 3 parties d'un `for` ?"
    r: "Le départ (`let i = 0`), la condition pour continuer (`i < 5`) et le pas (`i++`)."
  - q: "Combien de tours fait `for (let i = 1; i <= 5; i++)` ?"
    r: "5 tours : i vaut 1, 2, 3, 4 puis 5."
  - q: "Combien de tours fait `for (let i = 0; i < 5; i++)` ?"
    r: "5 aussi : i vaut 0, 1, 2, 3 puis 4."
  - q: "Comment compter de 2 en 2 ?"
    r: "Avec le pas `i += 2`."
  - q: "Quelle boucle pour descendre de 5 à 1 ?"
    r: "`for (let i = 5; i >= 1; i--)` : la condition s'inverse avec `>=`."
  - q: "Pourquoi un produit commence à 1 et pas à 0 ?"
    r: "Parce que 0 multiplié par n'importe quoi donne 0."
  - q: "Que fait `resultat *= i` ?"
    r: "Multiplie `resultat` par `i` et range le résultat dans `resultat`."
  - q: "`for` ou `while` pour « Devine le nombre » ?"
    r: "`while` : on ne sait pas d'avance combien d'essais il faudra."
  - q: "Qu'est-ce qu'une boucle infinie ?"
    r: "Une boucle dont la condition reste toujours vraie : la page se fige."
  - q: "Que donne `\"#\".repeat(3)` ?"
    r: "La chaîne `\"###\"`."
quiz:
  - question: "Combien de fois s'affiche le message dans `for (let i = 0; i < 5; i++) { console.log(\"Courage\"); }` ?"
    choix:
      - "4"
      - "5"
      - "6"
    reponse: "5"
    explication: "i prend les valeurs 0, 1, 2, 3 et 4 : cinq tours. À 5, la condition `i < 5` devient fausse."
  - question: "Qu'affiche `for (let i = 1; i <= 7; i += 2) console.log(i);` ?"
    choix:
      - "1 2 3 4 5 6 7"
      - "1 3 5 7"
      - "2 4 6"
      - "1 3 5"
    reponse: "1 3 5 7"
    explication: "On part de 1 et on saute de 2 : 1, 3, 5, 7. Le tour suivant donnerait 9, qui n'est pas <= 7."
  - question: "Que vaut `resultat` à la fin ? `let resultat = 1; for (let i = 2; i <= 5; i++) resultat *= i;`"
    choix:
      - "15"
      - "24"
      - "60"
      - "120"
    reponse: "120"
    explication: "1 × 2 × 3 × 4 × 5 = 120 : c'est la factorielle de 5, comme dans `exo8/factorial.js`."
  - question: "Pourquoi `for (let i = 5; i <= 1; i--)` n'affiche rien ?"
    choix:
      - "i-- est interdit dans un for"
      - "5 <= 1 est faux dès le départ"
      - "Il faut écrire while"
      - "La boucle est infinie"
    reponse: "5 <= 1 est faux dès le départ"
    explication: "La condition est testée avant le premier tour. En descente, il faut `i >= 1`."
  - question: "Dans « Devine le nombre », qu'est-ce qui arrête la boucle `while (!trouve)` ?"
    choix:
      - "essais++"
      - "trouve = true"
      - "console.log(\"Correct !\")"
      - "parseInt()"
    reponse: "trouve = true"
    explication: "Quand `trouve` passe à `true`, `!trouve` devient faux et la boucle s'arrête."
  - question: "Pour additionner les nombres de 1 à 10, où écrire `let total = 0;` ?"
    choix:
      - "Avant la boucle"
      - "Dans la boucle"
      - "Après la boucle"
    reponse: "Avant la boucle"
    explication: "Dans la boucle, `total` repartirait à 0 à chaque tour. Après, il serait trop tard."
exercices:
  - titre: "La table de 3"
    niveau: facile
    enonce: "Affiche la table de multiplication de 3, de « 3 x 1 = 3 » à « 3 x 10 = 30 »."
    indices:
      - "Une boucle `for` de 1 à 10 inclus : `i <= 10`."
      - "À chaque tour, affiche `\"3 x \" + i + \" = \" + 3 * i`."
    solution: |
      ```js
      for (let i = 1; i <= 10; i++) {
        console.log("3 x " + i + " = " + 3 * i);
      }
      ```
  - titre: "Le compte à rebours"
    niveau: facile
    enonce: "Avec une boucle `while`, affiche 10, 9, 8… jusqu'à 1, puis « Décollage ! »"
    indices:
      - "Crée `let compte = 10;` avant la boucle."
      - "Continue tant que `compte >= 1`, et retire 1 à chaque tour avec `compte--`."
      - "Le message final se place après la boucle."
    solution: |
      ```js
      let compte = 10;

      while (compte >= 1) {
        console.log(compte);
        compte--; // sans cette ligne : boucle infinie
      }
      console.log("Décollage !");
      ```
  - titre: "La somme"
    niveau: moyen
    enonce: "Calcule la somme des nombres de 1 à 100 (tu dois trouver 5050), puis la somme des seuls nombres pairs de 1 à 100 (2550)."
    indices:
      - "Un accumulateur `let total = 0;` déclaré avant la boucle."
      - "À chaque tour : `total += i;`."
      - "Pour les pairs, pars de 2 et saute de 2 en 2."
    solution: |
      ```js
      let total = 0;
      for (let i = 1; i <= 100; i++) {
        total += i;
      }
      console.log(total); // 5050

      let totalPairs = 0;
      for (let i = 2; i <= 100; i += 2) {
        totalPairs += i;
      }
      console.log(totalPairs); // 2550
      ```
  - titre: "Le sapin"
    niveau: difficile
    enonce: "Inspire-toi de la pyramide de Mario pour dessiner un sapin centré de 4 étages. L'étage i contient 2 × i − 1 étoiles, précédées de 4 − i espaces."
    indices:
      - "Même structure que `exo6/mario-pyramid.js` : une boucle de 1 à `etages`."
      - "`\" \".repeat(etages - i)` pour les espaces."
      - "`\"*\".repeat(2 * i - 1)` pour les étoiles : 1, 3, 5, 7."
    solution: |
      ```js
      let etages = 4;

      for (let i = 1; i <= etages; i++) {
        let espaces = " ".repeat(etages - i);
        let etoiles = "*".repeat(2 * i - 1);
        console.log(espaces + etoiles);
      }
      //    *
      //   ***
      //  *****
      // *******
      ```
---

## La boucle for

:::quoi
**for** répète un bloc un nombre de fois connu. Trois parties, séparées par des points-virgules : le **départ**, la **condition** pour continuer, le **pas** après chaque tour.
:::

:::exemple
```js title="js-exercices-pack/script.js"
for (let i = 0; i < 5; i++) {
  console.log("Courage, tu vas y arriver !");
}
// 5 tours : i vaut 0, 1, 2, 3 puis 4
```
:::

:::piege
En partant de 0, `i < 5` fait **5 tours** ; `i <= 5` en ferait **6**. Compte toujours la première et la dernière valeur de `i`.
:::

:::ou[Dans js-exercices-pack]
Exercice 7 du pack : afficher cinq fois le message d'encouragement.
:::

## Monter, descendre, sauter

:::quoi
Le **pas** décide comment `i` avance : **i++** monte de 1, **i--** descend de 1, **i += 2** saute de 2 en 2.
:::

:::exemple
```js
for (let i = 5; i >= 1; i--) {      // pack, ex. 8 : 5, 4, 3, 2, 1
  console.log(i);
}

for (let i = 0; i <= 10; i += 2) {  // exo5 : 0, 2, 4, 6, 8, 10
  console.log(i);
}
```
:::

:::piege
En descente, la condition s'inverse : `i >= 1`, pas `i <= 1`. Sinon la boucle ne démarre même pas, car `5 <= 1` est faux.
:::

:::ou[Dans even-odd.js]
`exo5/even-odd.js` part de 0 (les pairs) ou de 1 (les impairs) puis saute de 2. `exo4/by-two.js` affiche `i -> i * 2` de 1 au nombre choisi.
:::

## L'accumulateur

:::quoi
Un **accumulateur** est une variable créée **avant** la boucle et mise à jour **à chaque tour** : un total, un produit, un nombre d'essais.
:::

:::exemple
```js
let n = 4;
let resultat = 1;               // créé AVANT la boucle

for (let i = 2; i <= n; i++) {
  resultat *= i;                // resultat = resultat * i
}
console.log(resultat);          // 24, soit 2 × 3 × 4
```
:::

:::piege
Déclare l'accumulateur **hors** de la boucle : dedans, il repartirait de zéro à chaque tour. Et pour un produit, commence à **1**, pas à 0.
:::

:::ou[Dans factorial.js]
La fonction `fact(n)` de `exo8/factorial.js` (`resultat *= i`) et `essais++` dans `exo10/guess-number.js`.
:::

## Construire ligne par ligne

:::quoi
À chaque tour, on peut **calculer une ligne** à partir de `i`. **repeat(n)** répète une chaîne n fois.
:::

:::exemple
```js
let etages = 3;
for (let i = 1; i <= etages; i++) {
  let espaces = " ".repeat(etages - i);
  let blocs   = "#".repeat(i);
  console.log(espaces + blocs);
}
//   #
//  ##
// ###
```
:::

:::piege
`repeat()` avec un nombre **négatif** plante (**RangeError**). Ici `etages - i` vaut au minimum 0 : tout va bien.
:::

:::ou[Dans mario-pyramid.js]
`exo6/mario-pyramid.js` : la pyramide de Mario, alignée à droite grâce aux espaces placés devant les `#`.
:::

## La boucle while

:::quoi
**while** répète **tant que** la condition est vraie. Idéal quand on ne sait pas d'avance combien de tours il faudra.
:::

:::exemple
```js
let trouve = false;
while (!trouve) {
  let proposition = parseInt(prompt("Ton nombre ?"));
  essais++;
  if (proposition < nombreSecret) console.log("Trop bas !");
  else if (proposition > nombreSecret) console.log("Trop haut !");
  else trouve = true;   // la condition devient fausse : on sort
}
```
:::

:::piege
Si rien ne rend la condition fausse, c'est une **boucle infinie** : la page se fige. Ici, oublier `trouve = true` bloquerait le jeu pour toujours.
:::

:::ou[Dans guess-number.js]
`exo10/guess-number.js` : « Devine le nombre », on boucle jusqu'à la bonne réponse et on compte les essais.
:::
