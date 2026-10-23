---
titre: "Événements et formulaires : réagir à l'utilisateur"
matiere: javascript
type: cours
chapitre: 8
niveau: intermediaire
duree: 14
date: 2026-05-29
source: "Bachelor dev : exos DOM et feedback-form"
tags: [javascript, evenements, formulaires, validation, dom]
essentiel: "`addEventListener` branche une fonction sur un événement : `click`, `input`, `submit`… La fonction reçoit l'objet `event`, et `event.target` est l'élément touché. Sur un formulaire, appelle `event.preventDefault()` pour éviter le rechargement, puis vérifie les champs avec `validity`."
retenir:
  - "On donne la fonction à `addEventListener` sans l'appeler : `closeModal`, pas `closeModal()`."
  - "`input` part à chaque frappe ; `submit` s'écoute sur le formulaire, pas sur le bouton."
  - "`value` est toujours une chaîne, même pour `type=\"number\"`."
  - "`event.preventDefault()` annule le comportement du navigateur : rechargement du formulaire, saut du lien `#`."
  - "Le JS ne trouve un élément que s'il existe déjà : script en bas du `body` ou `DOMContentLoaded`."
definitions:
  - terme: "Événement"
    definition: "Quelque chose qui se produit sur la page : un clic, une frappe, l'envoi d'un formulaire, la fin du chargement…"
  - terme: "Écouteur (listener)"
    definition: "Fonction branchée avec `addEventListener`, appelée à chaque fois que l'événement se produit."
    exemple: "btnLampe.addEventListener(\"click\", allumer)"
  - terme: "event.target"
    definition: "L'élément qui a déclenché l'événement, par exemple le champ dans lequel on vient de taper."
    exemple: "miroir.textContent = event.target.value;"
  - terme: "preventDefault"
    definition: "Méthode de l'objet `event` qui annule le comportement par défaut du navigateur."
    exemple: "event.preventDefault();"
  - terme: "Délégation d'événement"
    definition: "Un seul écouteur posé sur un parent gère les événements de tous ses enfants, grâce à `event.target`."
    exemple: "form.addEventListener(\"input\", (e) => validerChamp(e.target))"
  - terme: "Constraint Validation API"
    definition: "Les outils de validation intégrés au navigateur : attributs `required`, `minlength`, `type=\"email\"`… et propriété `validity` en JavaScript."
    exemple: "`input.validity.valueMissing`"
  - terme: "DOMContentLoaded"
    definition: "Événement envoyé quand tout le HTML a été lu : le DOM est prêt à être manipulé."
    exemple: "document.addEventListener(\"DOMContentLoaded\", init);"
flashcards:
  - q: "Que fait `btn.addEventListener(\"click\", f)` ?"
    r: "Il appelle la fonction `f` à chaque clic sur le bouton."
  - q: "Pourquoi pas de parenthèses dans `addEventListener(\"click\", closeModal)` ?"
    r: "On confie la fonction pour plus tard. `closeModal()` l'exécuterait tout de suite, au chargement."
  - q: "Que désigne `event.target` ?"
    r: "L'élément qui a déclenché l'événement."
  - q: "Différence entre les événements `input` et `change` ?"
    r: "`input` part à chaque frappe ; `change` seulement quand la valeur est validée (champ quitté, option choisie)."
  - q: "Pourquoi écouter `submit` plutôt que `click` sur le bouton ?"
    r: "`submit` marche aussi avec la touche Entrée et concerne tout le formulaire."
  - q: "À quoi sert `event.preventDefault()` dans un `submit` ?"
    r: "À empêcher le rechargement de la page quand le formulaire est envoyé."
  - q: "De quel type est `input.value` pour un `type=\"number\"` ?"
    r: "Toujours une chaîne : convertis-la avec `Number()` avant de calculer."
  - q: "Que signifie `validity.valueMissing` ?"
    r: "Le champ est `required` mais il est vide."
  - q: "Que signifie `validity.typeMismatch` ?"
    r: "Le format ne correspond pas au type, par exemple une adresse sans @ dans un `type=\"email\"`."
  - q: "À quoi sert `novalidate` sur un `<form>` ?"
    r: "À couper les bulles d'erreur du navigateur pour afficher ses propres messages."
  - q: "Pourquoi `getElementById` renvoie `null` alors que l'id existe ?"
    r: "Le script s'exécute avant que le HTML soit lu : mets-le en bas du `body` ou attends `DOMContentLoaded`."
quiz:
  - question: "Quelle ligne branche correctement la fonction `allumer` sur un clic ?"
    choix:
      - "btn.addEventListener(\"click\", allumer);"
      - "btn.addEventListener(\"click\", allumer());"
      - "btn.addEventListener(click, allumer);"
      - "btn.onClick(allumer);"
    reponse: "btn.addEventListener(\"click\", allumer);"
    explication: "Le type d'événement est une chaîne, et la fonction est donnée sans parenthèses. Avec `allumer()`, elle s'exécuterait tout de suite."
  - question: "Quel événement pour mettre un texte à jour à chaque frappe ?"
    choix:
      - "click"
      - "input"
      - "submit"
      - "load"
    reponse: "input"
    explication: "`input` se déclenche à chaque modification du champ : c'est le pseudo en direct de `js-dom-exos`."
  - question: "Sans `event.preventDefault()` dans le `submit` de la calculatrice, que se passe-t-il ?"
    choix:
      - "Le calcul est faux"
      - "La page se recharge à chaque envoi"
      - "Le formulaire ne s'envoie pas"
      - "Rien de spécial"
    reponse: "La page se recharge à chaque envoi"
    explication: "Par défaut, un formulaire envoyé recharge la page : tout ce qui était affiché disparaît."
  - question: "Un champ `<input type=\"email\" required>` contient « bonjour ». Quelle propriété vaut `true` ?"
    choix:
      - "validity.valueMissing"
      - "validity.typeMismatch"
      - "validity.tooShort"
      - "validity.valid"
    reponse: "validity.typeMismatch"
    explication: "Le champ n'est pas vide (`valueMissing` est faux), mais « bonjour » n'a pas le format d'une adresse e-mail. Donc `valid` est faux aussi."
  - question: "Un écouteur `input` est posé sur le `<form>`. L'utilisateur tape dans le champ e-mail. Que vaut `event.target` ?"
    choix:
      - "Le formulaire"
      - "Le champ e-mail"
      - "Le bouton Envoyer"
      - "document"
    reponse: "Le champ e-mail"
    explication: "L'événement part du champ et remonte jusqu'au formulaire. `event.target` reste le champ touché : c'est la délégation de `feedback-form`."
  - question: "`document.getElementById(\"btn\")` renvoie `null` alors que le bouton existe. Cause la plus probable ?"
    choix:
      - "Le script est dans le head et s'exécute avant le HTML"
      - "Il faut écrire \"#btn\""
      - "getElementById ne marche pas sur les boutons"
    reponse: "Le script est dans le head et s'exécute avant le HTML"
    explication: "Au moment où le script tourne, le bouton n'existe pas encore. Place le script en bas du `body`, ajoute `defer`, ou attends `DOMContentLoaded`."
exercices:
  - titre: "Le compteur de clics"
    niveau: facile
    enonce: "La page contient `<button id=\"btn\">Clique</button>` et `<p id=\"total\">0</p>`. À chaque clic, augmente le nombre affiché."
    indices:
      - "Un compteur `let compte = 0;` déclaré en dehors de l'écouteur."
      - "Dans l'écouteur : `compte++`, puis `total.textContent = compte`."
    solution: |
      ```js
      const btn = document.getElementById("btn");
      const total = document.getElementById("total");
      let compte = 0;

      btn.addEventListener("click", () => {
        compte++;
        total.textContent = compte;
      });
      ```
  - titre: "Les caractères restants"
    niveau: moyen
    enonce: "La page contient `<textarea id=\"message\" maxlength=\"140\"></textarea>` et `<p id=\"reste\">140</p>`. Affiche en direct le nombre de caractères restants, et ajoute la classe `alerte` au paragraphe quand il en reste moins de 20."
    indices:
      - "L'événement `input` part à chaque frappe."
      - "Restants : `140 - event.target.value.length`."
      - "`classList.toggle(\"alerte\", condition)` ajoute la classe si la condition est vraie et la retire sinon."
    solution: |
      ```js
      const message = document.getElementById("message");
      const reste = document.getElementById("reste");

      message.addEventListener("input", (event) => {
        const restants = 140 - event.target.value.length;
        reste.textContent = restants;
        reste.classList.toggle("alerte", restants < 20);
      });
      ```
  - titre: "L'inscription validée"
    niveau: difficile
    enonce: "Crée un formulaire `novalidate` avec un pseudo (`required`, `minlength=\"3\"`) et un e-mail (`type=\"email\"`, `required`), un `<span>` d'erreur sous chaque champ et un `<p id=\"succes\">`.\n\nÀ l'envoi, empêche le rechargement et affiche sous chaque champ le message qui correspond à `validity`. Si tout est bon, écris « Bienvenue, Kenji ! » dans `#succes`."
    indices:
      - "Écoute `submit` sur le formulaire et commence par `event.preventDefault()`."
      - "Une fonction `message(input)` renvoie le texte d'erreur selon `valueMissing`, `typeMismatch` et `tooShort`, ou une chaîne vide."
      - "Une variable `toutEstBon` passe à `false` dès qu'un champ a une erreur ; si elle est fausse, `return`."
    solution: |
      ```html
      <form id="inscription" novalidate>
        <input id="pseudo" required minlength="3">
        <span id="pseudo-erreur"></span>
        <input id="email" type="email" required>
        <span id="email-erreur"></span>
        <button type="submit">S'inscrire</button>
      </form>
      <p id="succes"></p>
      ```

      ```js
      const form = document.getElementById("inscription");

      function message(input) {
        if (input.validity.valueMissing) return "Ce champ est obligatoire.";
        if (input.validity.typeMismatch) return "Format invalide.";
        // tooShort ne se déclenche qu'après une vraie saisie (pas avec input.value = …)
        if (input.validity.tooShort) return "Minimum " + input.minLength + " caractères.";
        return "";
      }

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        let toutEstBon = true;

        form.querySelectorAll("input").forEach((input) => {
          const erreur = message(input);
          document.getElementById(input.id + "-erreur").textContent = erreur;
          if (erreur !== "") toutEstBon = false;
        });

        if (!toutEstBon) return;
        const pseudo = document.getElementById("pseudo").value;
        document.getElementById("succes").textContent = "Bienvenue, " + pseudo + " !";
      });
      ```
---

## Écouter un événement

:::quoi
**addEventListener("type", fonction)** exécute la fonction **à chaque fois** que l'événement se produit sur l'élément. On donne la fonction **sans l'appeler**.
:::

:::exemple
```js title="js-dom-exos/script.js"
var btnLampe = document.getElementById("btnLampe");
var ampoule = document.getElementById("ampoule");

btnLampe.addEventListener("click", function() {
    ampoule.classList.toggle("on");
});
```
:::

:::piege
`addEventListener("click", closeModal())` exécute `closeModal` **tout de suite** et branche son résultat (undefined). Écris `closeModal` sans parenthèses, comme le **Kanban** : `cancelBtn.addEventListener("click", closeModal)`.
:::

:::ou[Dans js-dom-exos et le Kanban]
La lampe de `js-dom-exos/script.js`, le bouton « Bouge » de `dom-tp1/script.js`, et tous les boutons du **Kanban** et du **Quiz Dynamique**.
:::

## L'objet event et event.target

:::quoi
La fonction reçoit un objet **event** qui décrit ce qui s'est passé. **event.target** est l'élément qui a déclenché l'événement.
:::

:::exemple
```js title="dom-tp1/script.js"
// event.target.value = la valeur de l'élément qui a déclenché l'événement
champTexte.addEventListener("input", function (event) {
  miroir.textContent = event.target.value;
});
```
:::

:::piege
Si l'écouteur est sur un **parent** (le formulaire entier), `event.target` est l'**enfant** touché, pas le parent. C'est voulu dans feedback-form : un seul écouteur pour tous les champs.
:::

:::ou[Dans dom-tp1, feedback-form et le Kanban]
Le miroir de texte de `dom-tp1/script.js`, `validerChamp(event.target)` dans `feedback-form/script.js`, et `if (e.target === modal)` qui ferme la modale du **Kanban** quand on clique à côté.
:::

## Choisir le bon événement

:::quoi
Chaque **événement** a son moment :

- **click** : un clic ;
- **input** : à **chaque frappe**, ou à chaque mouvement d'un curseur `range` ;
- **change** : quand la valeur est validée (champ quitté, option choisie) ;
- **mouseenter** / **mouseleave** : la souris entre sur l'élément / en sort.
:::

:::exemple
```js
// js-dom-exos : le texte suit le curseur en direct
volume.addEventListener("input", function () {
  affichageVolume.textContent = "Volume : " + volume.value + "%";
});

// calculatrice : une info apparaît au survol d'un label
label.addEventListener("mouseenter", function () {
  zoneInfo.textContent = label.dataset.info;
});
```
:::

:::piege
**value est toujours une chaîne**, même pour `type="number"` ou `type="range"`. Convertis avec `Number()` avant de calculer, comme le carré et le cube de dom-tp1.
:::

:::ou[Dans js-dom-exos et la calculatrice]
Le volume et le pseudo en direct de `js-dom-exos/script.js`, l'info au survol de `calculatrice/script.js`, la recherche en direct du **Kanban**.
:::

## Le formulaire : submit et preventDefault

:::quoi
On écoute **submit** sur le **formulaire**, pas `click` sur le bouton : ça marche aussi avec la touche Entrée. **event.preventDefault()** empêche le rechargement de la page.
:::

:::exemple
```js title="calculatrice/script.js"
formCalc.addEventListener("submit", function (event) {
  // On empêche la page de se recharger
  event.preventDefault();

  var n1 = Number(document.getElementById("nombre1").value);
  var n2 = Number(document.getElementById("nombre2").value);
  var op = document.getElementById("operation").value;
  // ... calcul selon op, puis alert du résultat
});
```
:::

:::piege
Sans preventDefault, la page se **recharge** et tout ce que tu as affiché disparaît. Même chose pour un lien `href="#"` : preventDefault évite le saut en haut de page.
:::

:::ou[Dans la calculatrice et feedback-form]
Le calcul de `calculatrice/script.js` et ses liens afficher / cacher, puis l'envoi de `feedback-form/script.js`.
:::

## Valider un champ : validity

:::quoi
Les attributs HTML (**required**, **minlength**, **type="email"**) posent les règles. En JavaScript, **input.validity** dit ce qui ne va pas : **valueMissing** (vide), **typeMismatch** (mauvais format), **tooShort** (trop court) ou **valid** (tout est bon).
:::

:::exemple
```js
// feedback-form/script.js : un message selon l'erreur
function getMessageErreur(input) {
  if (input.validity.valueMissing) return "Ce champ est obligatoire.";
  if (input.validity.typeMismatch) return "Adresse email invalide.";
  if (input.validity.tooShort) return "Minimum " + input.minLength + " caractères.";
  return "";
}
```
:::

:::piege
**novalidate** sur le `<form>` coupe les bulles du navigateur pour afficher **tes** messages : la vérification se fait alors en JS. Et un contrôle côté navigateur ne remplace **jamais** une vérification côté serveur.
:::

:::ou[Dans feedback-form]
`feedback-form/script.js` : un message sous chaque champ, les classes `valid` / `invalid`, puis le message de succès quand tout est bon.
:::

## Attendre que la page soit prête

:::quoi
Le JS ne trouve un élément que s'il **existe déjà**. Place le `<script>` **en bas** du `<body>`, ou attends l'événement **DOMContentLoaded**.
:::

:::exemple
```js title="quiz-dynamique/script.js"
function init() {
  renderThemePicker();
  el.btnStart.addEventListener("click", startQuiz);
  el.btnNext.addEventListener("click", goToNext);
}

document.addEventListener("DOMContentLoaded", init);
```
:::

:::piege
Un script dans le `<head>`, sans `defer` ni DOMContentLoaded, obtient **null** à chaque `getElementById` : erreur « Cannot read properties of null ».
:::

:::ou[Dans le Quiz Dynamique et le Kanban]
`init()` du **Quiz Dynamique**, le `DOMContentLoaded` qui enveloppe tout le **Kanban**. Dans les exos DOM, la balise script est placée juste avant la fin du `body`.
:::
