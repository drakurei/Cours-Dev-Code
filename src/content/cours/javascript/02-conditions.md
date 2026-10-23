---
titre: "Conditions : if, else if, else"
matiere: javascript
type: cours
chapitre: 2
niveau: debutant
duree: 10
date: 2026-05-26
source: "Bachelor dev : pack JS et js-exercices"
tags: [javascript, conditions, comparaison, logique]
essentiel: "`if` exécute un bloc seulement si la condition est vraie ; `else if` et `else` gèrent les autres cas, testés dans l'ordre. Compare toujours avec `===` (valeur ET type). `&&` veut dire « et », `||` veut dire « ou »."
retenir:
  - "Les conditions sont testées de haut en bas : la première vraie gagne, les suivantes sont ignorées."
  - "`===` compare la valeur et le type ; `==` convertit avant de comparer, donc `\"18\" == 18` est vrai."
  - "`&&` : toutes les conditions doivent être vraies. `||` : une seule suffit."
  - "Six valeurs falsy (fausses) à connaître : `false`, `0`, `\"\"`, `null`, `undefined`, `NaN`."
  - "Le ternaire `condition ? a : b` choisit entre deux valeurs en une ligne."
definitions:
  - terme: "Condition"
    definition: "Une expression qui vaut `true` ou `false` et qui décide quel bloc s'exécute."
    exemple: "age >= 18"
  - terme: "Égalité stricte (===)"
    definition: "Compare la valeur ET le type, sans aucune conversion. Son contraire est `!==`."
    exemple: "\"18\" === 18 // false"
  - terme: "Opérateur logique"
    definition: "`&&` (et), `||` (ou) et `!` (non) : ils combinent ou inversent des conditions."
    exemple: "a === b && b === c"
  - terme: "Falsy"
    definition: "Valeur qui compte comme fausse dans un `if`. Les six à connaître : `false`, `0`, `\"\"`, `null`, `undefined` et `NaN`."
    exemple: "if (!data) return false;"
  - terme: "Truthy"
    definition: "Toute valeur qui n'est pas falsy : elle compte comme vraie dans un `if`, y compris `\"0\"` et `\"false\"`."
    exemple: "if (span) span.textContent = \"\";"
  - terme: "Ternaire"
    definition: "Raccourci `condition ? valeurSiVrai : valeurSiFaux` qui renvoie l'une des deux valeurs."
    exemple: "let depart = (choix === \"pair\") ? 0 : 1;"
flashcards:
  - q: "Différence entre `=` et `===` ?"
    r: "`=` range une valeur dans une variable ; `===` compare deux valeurs et leur type."
  - q: "Que valent `\"18\" == 18` et `\"18\" === 18` ?"
    r: "`true` avec `==` (il convertit), `false` avec `===` (string et number sont différents)."
  - q: "Dans un `if` / `else if`, deux conditions sont vraies. Laquelle s'exécute ?"
    r: "La première dans l'ordre. Les suivantes sont ignorées."
  - q: "Que signifie `&&` ?"
    r: "« Et » : vrai seulement si toutes les conditions sont vraies."
  - q: "Que signifie `||` ?"
    r: "« Ou » : vrai si au moins une condition est vraie."
  - q: "Comment écrire « âge entre 18 et 30 inclus » ?"
    r: "`age >= 18 && age <= 30` : on répète la variable des deux côtés."
  - q: "Cite les 6 valeurs falsy à connaître."
    r: "`false`, `0`, `\"\"` (chaîne vide), `null`, `undefined` et `NaN`."
  - q: "`\"0\"` est-il truthy ou falsy ?"
    r: "Truthy : c'est une chaîne non vide."
  - q: "Écris le ternaire qui met 0 si `choix` vaut `\"pair\"`, sinon 1."
    r: "`let depart = (choix === \"pair\") ? 0 : 1;`"
  - q: "Que fait `!trouve` ?"
    r: "Il inverse le booléen : `!trouve` est vrai tant que `trouve` vaut `false`."
quiz:
  - question: "Avec `let temperature = 22;` et les tests dans cet ordre (>= 25 chaud, >= 18 bon, >= 10 frais, sinon froid), quel message s'affiche ?"
    choix:
      - "Il fait chaud"
      - "Il fait bon"
      - "Il fait frais"
      - "Il fait froid"
    reponse: "Il fait bon"
    explication: "22 n'est pas >= 25, mais il est >= 18 : c'est la première condition vraie, on s'arrête là. Le test >= 10 n'est même pas regardé."
  - question: "Que vaut `\"18\" === 18` ?"
    choix:
      - "true"
      - "false"
      - "Une erreur"
    reponse: "false"
    explication: "`===` compare aussi le type : une chaîne n'est jamais strictement égale à un nombre."
  - question: "Avec `a = 5`, `b = 5` et `c = 3`, que vaut `a === b && b === c` ?"
    choix:
      - "true"
      - "false"
      - "5"
    reponse: "false"
    explication: "`a === b` est vrai, mais `b === c` est faux. Avec `&&`, une seule condition fausse rend tout faux."
  - question: "Laquelle de ces valeurs est truthy ?"
    choix:
      - "0"
      - "\"\""
      - "\"0\""
      - "null"
    reponse: "\"0\""
    explication: "`\"0\"` est une chaîne non vide, donc truthy. `0`, la chaîne vide et `null` sont falsy."
  - question: "Que vaut `depart` après `let depart = (\"impair\" === \"pair\") ? 0 : 1;` ?"
    choix:
      - "0"
      - "1"
      - "\"impair\""
      - "true"
    reponse: "1"
    explication: "La condition est fausse, donc le ternaire renvoie la valeur après les deux-points : 1."
  - question: "Pourquoi `if (age = 18)` est un bug ?"
    choix:
      - "Il compare mal les types"
      - "Il range 18 dans age au lieu de comparer"
      - "Il plante toujours"
      - "Il manque des guillemets autour de 18"
    reponse: "Il range 18 dans age au lieu de comparer"
    explication: "Un seul `=` est une affectation : `age` vaut maintenant 18 et la condition est toujours vraie. Pour comparer, écris `===`."
exercices:
  - titre: "Le videur"
    niveau: facile
    enonce: "Avec `let age = 16;`, affiche « Entrée libre » à partir de 18 ans, sinon « Reviens dans 2 an(s) », où 2 est calculé (18 moins l'âge)."
    indices:
      - "Un seul `if (age >= 18)` avec un `else` suffit."
      - "Dans le `else`, calcule `18 - age` entre parenthèses pour ne pas le coller au texte."
    solution: |
      ```js
      let age = 16;

      if (age >= 18) {
        console.log("Entrée libre");
      } else {
        console.log("Reviens dans " + (18 - age) + " an(s)"); // Reviens dans 2 an(s)
      }
      ```
  - titre: "La mention"
    niveau: moyen
    enonce: "Avec `let note = 14;`, affiche « Très bien » (16 et plus), « Bien » (14 et plus), « Assez bien » (12 et plus), « Passable » (10 et plus) ou « Ajourné »."
    indices:
      - "Utilise une chaîne de `else if`."
      - "Commence par le cas le plus strict (>= 16), sinon une note de 17 afficherait « Passable »."
    solution: |
      ```js
      let note = 14;

      if (note >= 16) {
        console.log("Très bien");
      } else if (note >= 14) {
        console.log("Bien"); // affiché pour 14
      } else if (note >= 12) {
        console.log("Assez bien");
      } else if (note >= 10) {
        console.log("Passable");
      } else {
        console.log("Ajourné");
      }
      ```
  - titre: "La borne d'accueil"
    niveau: difficile
    enonce: "Avec `let age = 15;` et `let inscrit = \"oui\";` : affiche « Accès complet » (18 ans et plus), « Accès junior » (13 à 17 ans) ou « Accès refusé ». Si la personne est inscrite ET a au moins 13 ans, ajoute « Un cadeau vous attend ». Affiche enfin le tarif avec un ternaire : 5 € avant 18 ans, 10 € sinon."
    indices:
      - "Trois cas d'accès : `if`, `else if`, `else`."
      - "Le cadeau est une condition à part, avec `&&`."
      - "Le ternaire : `const tarif = age < 18 ? 5 : 10;`."
    solution: |
      ```js
      let age = 15;
      let inscrit = "oui";

      if (age >= 18) {
        console.log("Accès complet");
      } else if (age >= 13) {
        console.log("Accès junior");
      } else {
        console.log("Accès refusé");
      }

      if (inscrit === "oui" && age >= 13) {
        console.log("Un cadeau vous attend");
      }

      const tarif = age < 18 ? 5 : 10;
      console.log("Tarif : " + tarif + " €"); // Tarif : 5 €
      ```
---

## Choisir : if et else

:::quoi
**if** exécute un bloc **seulement si** la condition est vraie. **else** gère tous les autres cas.
:::

:::exemple
```js title="js-exercices-pack/script.js"
let accessAge = 20;

if (accessAge >= 18) {
  console.log("Accès autorisé");
} else {
  console.log("Accès refusé");
}
```
:::

:::piege
Un seul `=` **range** une valeur : `if (age = 18)` met 18 dans `age` et la condition est toujours vraie. Pour comparer, écris `===`.
:::

:::ou[Dans js-exercices-pack]
Exercice 4 du pack : autoriser l'accès à partir de 18 ans.
:::

## Plusieurs cas : else if

:::quoi
**else if** ajoute un cas intermédiaire. Les conditions sont testées **dans l'ordre** : la première vraie gagne, les autres sont ignorées.
:::

:::exemple
```js title="js-exercices-pack/script.js"
let temperature = 22;
if (temperature >= 25) {
  console.log("Il fait chaud");
} else if (temperature >= 18) {
  console.log("Il fait bon");   // affiché : 22 >= 18
} else if (temperature >= 10) {
  console.log("Il fait frais");
} else {
  console.log("Il fait froid");
}
```
:::

:::piege
L'**ordre** compte. Si tu testes `>= 10` en premier, 22 affiche « Il fait frais » : mets toujours le cas le plus strict en haut.
:::

:::ou[Dans majority.js]
`exo2/majority.js` (mineur, majeur, puis majorité internationale à 21 ans) et la météo des exercices 5 et 11 du pack.
:::

## Comparer : === et ==

:::quoi
**===** (égalité stricte) compare la **valeur et le type**. **==** convertit d'abord les types, ce qui donne des surprises. **!==** veut dire « strictement différent ».
:::

:::exemple
```js
let x = "18"; // une chaîne, pas un nombre

console.log(x == 18);   // true  : == convertit "18" en 18
console.log(x === 18);  // false : string ≠ number
console.log(x !== 18);  // true
```
:::

:::piege
Avec `==`, `0 == ""` et `null == undefined` sont **vrais**. Utilise **toujours `===`** et **`!==`**.
:::

:::ou[Dans js-exercices-pack et le Kanban]
Exercice 6 du pack (`"18"` contre 18). Dans le **Kanban**, `if (title === "")` refuse une carte sans titre.
:::

## Combiner : && et ||

:::quoi
**&&** (et) : vrai si **toutes** les conditions sont vraies. **||** (ou) : vrai si **au moins une** l'est. **!** (non) inverse : `!true` vaut `false`.
:::

:::exemple
```js title="exo3/comparator.js"
let a = 5;
let b = 5;
let c = 3;
if (a === b && b === c) {
  console.log("Les trois variables sont identiques.");
} else if (a === b || a === c || b === c) {
  console.log("Deux des variables sont de valeurs égales."); // affiché
} else {
  console.log("Les trois variables sont différentes.");
}
```
:::

:::piege
`age > 18 && < 30` est une erreur de syntaxe : répète la variable, `age > 18 && age < 30`.
:::

:::ou[Dans comparator.js]
`exo3/comparator.js`, et `while (!trouve)` dans `exo10/guess-number.js` : on boucle tant que le nombre n'est **pas** trouvé.
:::

## Vrai ou faux sans booléen

:::quoi
Dans un `if`, toute valeur devient vraie ou fausse. Six valeurs **falsy** (fausses) sont à connaître : `false`, `0`, `""`, `null`, `undefined`, `NaN`. Les autres valeurs courantes sont **truthy** (vraies).
:::

:::exemple
```js
const span = erreurs[input.name];  // feedback-form : undefined si pas de span
if (span) span.textContent = "";   // seulement si le span existe

const data = JSON.parse(localStorage.getItem(STORAGE_KEY)); // Kanban
if (!data) return false;           // null : rien n'a été sauvegardé
```
:::

:::piege
`"0"` et `"false"` sont des chaînes **non vides**, donc **truthy**. Et `x || 1` remplace aussi un vrai 0 : utilise `x ?? 1` si 0 est une valeur valable.
:::

:::ou[Dans feedback-form et le Kanban]
`if (span)` dans `feedback-form/script.js`, `if (!data)` dans `loadState()` du **Kanban**, `q.difficulty || 1` dans le **Quiz Dynamique**.
:::

## Le ternaire : un if en une ligne

:::quoi
Le **ternaire** `condition ? siVrai : siFaux` choisit entre **deux valeurs**. Pratique pour remplir une variable.
:::

:::exemple
```js
let choix = "pair";                       // exo5 : la réponse de prompt()
let depart = (choix === "pair") ? 0 : 1;  // exo5/even-odd.js
console.log(depart);                      // 0
```
:::

:::piege
Réserve-le aux choix **simples**. Des ternaires imbriqués deviennent illisibles : passe alors à `if` / `else if`.
:::

:::ou[Dans even-odd.js et le Kanban]
`exo5/even-odd.js` (départ à 0 ou à 1) et la recherche du **Kanban** : `card.style.display = visible ? "" : "none"`.
:::
