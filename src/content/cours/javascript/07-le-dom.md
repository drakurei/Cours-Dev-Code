---
titre: "Le DOM : sélectionner et modifier la page"
matiere: javascript
type: cours
chapitre: 7
niveau: debutant
duree: 12
date: 2026-05-27
source: "Bachelor dev : exos DOM et projets"
tags: [javascript, dom, queryselector, classlist, dataset]
essentiel: "Le DOM, c'est la page HTML vue par JavaScript : un arbre d'objets. On sélectionne un élément (`getElementById`, `querySelector`), puis on change son texte (`textContent`), ses classes (`classList`) ou son style. On peut aussi créer des éléments, les ajouter et les supprimer."
retenir:
  - "`getElementById(\"id\")` sans dièse ; `querySelector(\"#id\")` avec, comme en CSS."
  - "Pour afficher une saisie, `textContent`, jamais `innerHTML` (faille XSS)."
  - "Préfère `classList` à `style` : l'apparence reste dans le CSS."
  - "Les valeurs de `dataset` sont toujours des chaînes."
  - "Un élément créé avec `createElement` n'apparaît qu'une fois ajouté avec `appendChild`."
definitions:
  - terme: "DOM"
    definition: "Document Object Model : la page HTML représentée comme un arbre d'objets que JavaScript peut lire et modifier."
  - terme: "Élément HTML"
    definition: "Un nœud du DOM qui correspond à une balise : `<p>`, `<button>`, `<img>`…"
    exemple: "document.getElementById(\"miroir\")"
  - terme: "Sélecteur CSS"
    definition: "Texte qui désigne des éléments, comme dans une feuille de style : `#id`, `.classe`, `balise`, ou une combinaison."
    exemple: "`.miniatures img`"
  - terme: "textContent"
    definition: "Propriété qui lit ou remplace le texte brut d'un élément. Les balises éventuelles sont affichées telles quelles, pas interprétées."
    exemple: "miroir.textContent = \"Bonjour\";"
  - terme: "innerHTML"
    definition: "Propriété qui lit ou remplace le HTML d'un élément. Dangereuse avec une saisie de l'utilisateur."
    exemple: "el.answers.innerHTML = \"\";"
  - terme: "classList"
    definition: "Outil pour ajouter (`add`), retirer (`remove`) ou basculer (`toggle`) les classes CSS d'un élément."
    exemple: "ampoule.classList.toggle(\"on\")"
  - terme: "dataset"
    definition: "Accès en JavaScript aux attributs `data-*` d'un élément. Les valeurs sont toujours des chaînes."
    exemple: "`btn.dataset.humeur`"
  - terme: "XSS (cross-site scripting)"
    definition: "Faille où un pirate fait exécuter son propre code dans la page, souvent via `innerHTML` rempli avec une saisie non filtrée."
flashcards:
  - q: "Qu'est-ce que le DOM ?"
    r: "La page HTML vue par JavaScript : un arbre d'objets qu'on peut lire et modifier."
  - q: "`getElementById(\"miroir\")` ou `getElementById(\"#miroir\")` ?"
    r: "Sans dièse : `getElementById(\"miroir\")`. Le dièse, c'est pour `querySelector(\"#miroir\")`."
  - q: "`querySelector` ou `querySelectorAll` ?"
    r: "`querySelector` renvoie le premier élément trouvé ; `querySelectorAll` les renvoie tous, dans une NodeList."
  - q: "Que renvoie `querySelector` si rien ne correspond ?"
    r: "`null`."
  - q: "`textContent` ou `innerHTML` pour afficher ce que l'utilisateur a tapé ?"
    r: "`textContent`. `innerHTML` interpréterait le HTML tapé et ouvrirait une faille XSS."
  - q: "Que fait `classList.toggle(\"on\")` ?"
    r: "Ajoute la classe si elle est absente, la retire si elle est présente."
  - q: "Comment lire `data-humeur=\"triste\"` en JavaScript ?"
    r: "`element.dataset.humeur`, qui vaut `\"triste\"`."
  - q: "Comment s'écrit `data-native-country` dans `dataset` ?"
    r: "En camelCase : `dataset.nativeCountry`."
  - q: "Pourquoi `carre.style.left = 120` ne fait rien ?"
    r: "Il manque l'unité : il faut `\"120px\"`."
  - q: "Que fait `appendChild` sur un élément déjà présent dans la page ?"
    r: "Il le déplace à sa nouvelle place : un élément n'existe qu'à un seul endroit."
quiz:
  - question: "Quel appel sélectionne TOUTES les images de `.miniatures` ?"
    choix:
      - "document.getElementById(\".miniatures img\")"
      - "document.querySelector(\".miniatures img\")"
      - "document.querySelectorAll(\".miniatures img\")"
    reponse: "document.querySelectorAll(\".miniatures img\")"
    explication: "`querySelectorAll` renvoie tous les éléments qui correspondent. `querySelector` n'en renvoie qu'un, et `getElementById` attend un id, pas un sélecteur."
  - question: "Quelle ligne cache un élément ?"
    choix:
      - "el.style.display = \"none\";"
      - "el.style = none;"
      - "el.display = \"hidden\";"
      - "el.classList.hide();"
    reponse: "el.style.display = \"none\";"
    explication: "C'est ce que fait le lien « Faire disparaître la calculatrice ». `display` est une propriété de `style`, et `classList` n'a pas de méthode `hide`."
  - question: "Un utilisateur tape `<img src=x onerror=alert(1)>` comme titre de carte. Quelle propriété l'affiche sans danger ?"
    choix:
      - "innerHTML"
      - "textContent"
      - "outerHTML"
    reponse: "textContent"
    explication: "`textContent` affiche le texte tel quel. Avec `innerHTML`, l'image serait créée et son `onerror` exécuterait du code."
  - question: "Que vaut `card.dataset.id` pour `<div class=\"card\" data-id=\"5\">` ?"
    choix:
      - "5 (un nombre)"
      - "\"5\" (une chaîne)"
      - "undefined"
      - "\"data-id\""
    reponse: "\"5\" (une chaîne)"
    explication: "Les attributs HTML sont du texte : `dataset` renvoie toujours des chaînes. C'est pour ça que `loadState()` du Kanban convertit l'id sauvegardé avec `Number()` avant de calculer le prochain."
  - question: "L'ampoule a déjà la classe `on`. Que fait `ampoule.classList.toggle(\"on\")` ?"
    choix:
      - "Rien"
      - "Elle retire la classe on"
      - "Elle ajoute une deuxième classe on"
      - "Elle déclenche une erreur"
    reponse: "Elle retire la classe on"
    explication: "`toggle` bascule : présente, la classe est retirée ; absente, elle est ajoutée. C'est l'interrupteur de la lampe."
  - question: "Après `const btn = document.createElement(\"button\");`, pourquoi le bouton n'apparaît pas ?"
    choix:
      - "Il lui manque un id"
      - "Il n'a pas été ajouté avec appendChild"
      - "createElement ne marche que pour les div"
      - "Il faut recharger la page"
    reponse: "Il n'a pas été ajouté avec appendChild"
    explication: "`createElement` crée l'élément en mémoire. Il faut l'insérer dans la page avec `appendChild` ou `prepend`."
exercices:
  - titre: "Le titre de la page"
    niveau: facile
    enonce: "La page contient `<h1 id=\"titre\">Bonjour</h1>` et `<p class=\"info\">Texte</p>`. Remplace le texte du titre par « Manabi », mets-le en vermillon (`#C8382A`) et ajoute la classe `important` au paragraphe."
    indices:
      - "Le titre a un id : `getElementById(\"titre\")`. Le paragraphe a une classe : `querySelector(\".info\")`."
      - "La couleur : `style.color`. La classe : `classList.add`."
    solution: |
      ```js
      const titre = document.getElementById("titre");
      titre.textContent = "Manabi";
      titre.style.color = "#C8382A";

      const info = document.querySelector(".info");
      info.classList.add("important");
      ```
  - titre: "La liste de courses"
    niveau: moyen
    enonce: "À partir de `const courses = [\"riz\", \"nori\", \"saumon\"];` et d'une liste vide `<ul id=\"liste\"></ul>`, crée un `<li>` par article."
    indices:
      - "Parcours le tableau avec `forEach`."
      - "Pour chaque article : `createElement(\"li\")`, puis `textContent`, puis `appendChild`."
    solution: |
      ```js
      const courses = ["riz", "nori", "saumon"];
      const liste = document.getElementById("liste");

      courses.forEach((article) => {
        const li = document.createElement("li");
        li.textContent = article;
        liste.appendChild(li);
      });
      ```
  - titre: "Les badges de priorité"
    niveau: difficile
    enonce: "La page contient plusieurs `<div class=\"card\" data-priority=\"high\">` (ou `medium`, `low`) et un `<p id=\"compteur\"></p>`.\n\nAjoute à chaque carte un `<span>` de classe `priority high` (selon sa priorité) qui affiche « Haute », « Moyenne » ou « Faible ». Écris ensuite dans le compteur le nombre de cartes urgentes, par exemple « 2 carte(s) urgente(s) »."
    indices:
      - "Un objet fait la correspondance : `const LIBELLES = { high: \"Haute\", medium: \"Moyenne\", low: \"Faible\" };`."
      - "Lis la priorité avec `card.dataset.priority`, puis `LIBELLES[priorite]` (crochets !)."
      - "Compte les `high` dans une variable déclarée avant le `forEach`."
    solution: |
      ```js
      const LIBELLES = { high: "Haute", medium: "Moyenne", low: "Faible" };
      const cards = document.querySelectorAll(".card");
      let nbUrgentes = 0;

      cards.forEach((card) => {
        const priorite = card.dataset.priority;
        const badge = document.createElement("span");
        badge.className = "priority " + priorite;
        badge.textContent = LIBELLES[priorite];
        card.appendChild(badge);
        if (priorite === "high") nbUrgentes++;
      });

      document.getElementById("compteur").textContent = nbUrgentes + " carte(s) urgente(s)";
      ```
---

## Sélectionner un élément

:::quoi
Avant de modifier, il faut **sélectionner**. **getElementById("id")** cherche par id. **querySelector("sélecteur")** renvoie le **premier** élément qui correspond. **querySelectorAll** les renvoie **tous**, dans une NodeList.
:::

:::exemple
```js title="dom-tp1/script.js"
var champTexte = document.getElementById("champTexte");
var miroir = document.getElementById("miroir");

var miniatures = document.querySelectorAll(".miniatures img");
```
:::

:::piege
getElementById s'écrit **sans dièse** (`getElementById("miroir")`), querySelector **avec** (`querySelector("#miroir")`). Si rien ne correspond, les deux renvoient **null**.
:::

:::ou[Dans dom-tp1 et feedback-form]
Le début de chaque exo DOM (`dom-tp1`, `js-dom-exos`, calculatrice) et `document.querySelector("#form")` dans `feedback-form/script.js`.
:::

## Changer le texte : textContent

:::quoi
**textContent** lit ou remplace le **texte** d'un élément. **innerHTML** remplace son **HTML** : les balises sont interprétées. Pour un champ de formulaire, ce qui est tapé se lit avec **value**.
:::

:::exemple
```js
var miroir = document.getElementById("miroir");
miroir.textContent = "Bonjour";              // remplace le texte

var champTexte = document.getElementById("champTexte");
console.log(champTexte.value);               // ce que l'utilisateur a tapé

el.answers.innerHTML = "";                   // Quiz : vide la zone des réponses
```
:::

:::piege
**innerHTML avec une saisie = faille XSS** : un pirate peut y glisser du code. Pour du texte, **toujours textContent**. Le **Kanban** met `data.title` dans innerHTML : c'est à corriger.
:::

:::ou[Dans js-dom-exos et dom-tp1]
Le mot mystère et le pseudo en direct de `js-dom-exos/script.js`, le miroir de texte de `dom-tp1/script.js`, et `makeCard()` du **Kanban** pour le contre-exemple.
:::

## Changer l'apparence : classList et style

:::quoi
**classList** ajoute (**add**), retire (**remove**) ou bascule (**toggle**) une classe CSS. **style** modifie une propriété CSS directement, écrite en **camelCase** (`backgroundColor`).
:::

:::exemple
```js
ampoule.classList.toggle("on");       // js-dom-exos : allume / éteint
img.classList.add("active");          // dom-tp1 : la miniature choisie
formulaire.style.display = "none";    // calculatrice : cacher
carre.style.left = newLeft + "px";    // dom-tp1 : déplacer (unité obligatoire)
```
:::

:::piege
Avec style, n'oublie pas l'**unité** : `carre.style.left = 120` ne fait rien, il faut `"120px"`. Et préfère **classList** : l'apparence reste dans le CSS.
:::

:::ou[Dans js-dom-exos, dom-tp1 et la calculatrice]
La lampe de `js-dom-exos/script.js`, afficher / cacher la calculatrice, le carré qui bouge et la miniature `active` de la galerie dans `dom-tp1/script.js`.
:::

## Les attributs data- : dataset

:::quoi
Un attribut **data-quelquechose** range une information dans le HTML. En JavaScript, on la lit ou on l'écrit avec **dataset.quelquechose**.
:::

:::exemple
```js
// HTML : <img src="mini.jpg" alt="Forêt" data-large="grande.jpg">
var img = document.querySelector(".miniatures img");
console.log(img.dataset.large);   // "grande.jpg"

// HTML : <div class="card" data-priority="high">
card.dataset.priority = "low";    // écrit data-priority="low"
```
:::

:::piege
Les valeurs de dataset sont **toujours des chaînes** : `card.dataset.id` vaut `"5"`, pas 5. Et les tirets deviennent du camelCase : `data-native-country` se lit `dataset.nativeCountry`.
:::

:::ou[Dans js-dom-exos et dom-tp1]
Les humeurs de `js-dom-exos/script.js` (`data-humeur`), la galerie de `dom-tp1/script.js` (`data-large`), les infos au survol de la calculatrice (`data-info`), `data-priority` et `data-status` du **Kanban**.
:::

## Créer et ajouter un élément

:::quoi
**document.createElement("balise")** crée un élément **en mémoire**. On le remplit, puis **appendChild()** l'insère à la fin d'un parent, ou **prepend()** au début.
:::

:::exemple
```js title="quiz-dynamique/script.js"
// Object.keys(quizData) : ["culture", "maths", "web"]
Object.keys(quizData).forEach((themeKey) => {
  const btn = document.createElement("button");
  btn.className = "theme-btn";
  btn.textContent = quizData[themeKey].label;
  btn.addEventListener("click", () => selectTheme(themeKey));
  el.themePicker.appendChild(btn);
});
```
:::

:::piege
Un élément créé **n'apparaît pas** tant qu'il n'est pas ajouté. Et `appendChild` sur un élément **déjà dans la page** le **déplace** : c'est ce qui fait marcher le glisser-déposer du Kanban.
:::

:::ou[Dans le Quiz Dynamique et le Kanban]
`renderThemePicker()` et les boutons de réponse du **Quiz Dynamique**, `makeCard()` du **Kanban**, la barre d'outils créée en JS (`addButton`).
:::

## Supprimer et vider

:::quoi
**element.remove()** retire l'élément de la page. Pour vider un conteneur d'un coup : `conteneur.innerHTML = ""`.
:::

:::exemple
```js
card.remove();                    // Kanban : supprimer une carte

el.answers.innerHTML = "";        // Quiz : vider les anciennes réponses...
q.answers.forEach((answer) => {   // ... puis créer les nouvelles
  const btn = document.createElement("button");
  btn.textContent = answer;
  el.answers.appendChild(btn);
});
```
:::

:::piege
Si tu oublies de **vider** avant de recréer, les éléments **s'accumulent** : chaque question ajouterait ses réponses à celles de la question d'avant.
:::

:::ou[Dans le Kanban et le Quiz Dynamique]
La suppression d'une carte, après `confirm()`, dans le **Kanban**, et `renderQuestion()` du **Quiz Dynamique**.
:::
