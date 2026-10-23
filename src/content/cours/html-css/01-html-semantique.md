---
titre: "HTML sémantique : donner du sens à la page"
matiere: html-css
type: cours
chapitre: 1
niveau: debutant
duree: 9
date: 2026-07-29
source: "Projets d'école quiz-dynamique, kanban-board et quiz-interactif"
tags: [html, semantique, accessibilite, formulaires, aria]
essentiel: "Une balise HTML dit ce qu'est un contenu, pas à quoi il ressemble. Avec `header`, `nav`, `main`, `section` et `footer`, la page devient claire pour le navigateur, Google et les lecteurs d'écran. L'apparence, c'est le travail du CSS."
retenir:
  - "Chaque page part du même squelette : `<!DOCTYPE html>`, `lang=\"fr\"`, `charset`, `viewport`, `title`."
  - "On choisit une balise pour son sens, jamais pour son apparence."
  - "Un seul `h1` par page, puis des `h2` et des `h3` dans l'ordre, sans sauter de niveau."
  - "Chaque champ de formulaire a un `label` relié ; le `placeholder` ne compte pas."
  - "ARIA complète le HTML, il ne le remplace pas : un vrai `button` bat toujours une `div` cliquable."
definitions:
  - terme: "HTML sémantique"
    definition: "Utiliser la balise qui correspond au sens du contenu (titre, menu, contenu principal…) au lieu de mettre des `div` partout."
    exemple: "<nav> pour un menu, <main> pour le contenu principal"
  - terme: "Balise de structure (landmark)"
    definition: "Balise qui découpe la page en grandes zones : `header`, `nav`, `main`, `aside`, `footer`. Un lecteur d'écran permet de sauter de l'une à l'autre."
  - terme: "Viewport"
    definition: "La zone visible de la page dans le navigateur. La balise `meta viewport` dit au téléphone d'utiliser la vraie largeur de son écran."
    exemple: "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />"
  - terme: "Label"
    definition: "Le texte qui nomme un champ de formulaire. Relié au champ, il est lu par les lecteurs d'écran et un clic dessus active le champ."
    exemple: "<label for=\"lang-select\">Langue :</label>"
  - terme: "ARIA"
    definition: "Des attributs (`role`, `aria-*`) qui donnent des informations en plus aux technologies d'assistance quand le HTML seul ne suffit pas."
    exemple: "aria-live=\"polite\""
  - terme: "Lecteur d'écran"
    definition: "Logiciel qui lit la page à voix haute (NVDA, VoiceOver). Il s'appuie sur les balises et sur les attributs ARIA pour comprendre la page."
flashcards:
  - q: "À quoi sert `lang=\"fr\"` sur la balise `html` ?"
    r: "Il indique la langue de la page : le lecteur d'écran prend la bonne prononciation et le navigateur sait quand proposer une traduction."
  - q: "Que se passe-t-il sur téléphone sans la balise `meta viewport` ?"
    r: "La page est affichée comme sur un écran d'environ 980 px puis rétrécie : tout est minuscule et les media queries ne se déclenchent pas comme prévu."
  - q: "Différence entre `div` et `section` ?"
    r: "`div` n'a aucun sens : c'est une boîte pour le style. `section` est une partie thématique de la page, en général avec un titre."
  - q: "Combien de `main` visibles par page ?"
    r: "Un seul : il contient le contenu principal, propre à cette page."
  - q: "Pourquoi ne pas prendre un `h3` juste parce qu'il est plus petit ?"
    r: "Le niveau de titre décrit l'importance dans le plan de la page. La taille se règle en CSS."
  - q: "Deux façons de relier un `label` à son champ ?"
    r: "Mettre `for` sur le label avec la même valeur que l'`id` du champ, ou placer le champ à l'intérieur du label."
  - q: "Un `placeholder` remplace-t-il un `label` ?"
    r: "Non : il disparaît dès qu'on tape et son texte gris est souvent peu lisible. Il donne un exemple, pas un nom."
  - q: "À quoi sert `aria-live=\"polite\"` ?"
    r: "Le lecteur d'écran annonce les changements de cet élément quand il a fini de parler. Pratique pour un score ou un message de résultat."
  - q: "Que fait `aria-labelledby=\"intro-title\"` sur une `section` ?"
    r: "Il nomme la section avec le texte de l'élément `id=\"intro-title\"` : le lecteur d'écran annonce ce nom quand on entre dans la zone."
  - q: "Pourquoi un `button` plutôt qu'une `div` cliquable ?"
    r: "Le `button` s'atteint avec Tab, se déclenche avec Entrée et Espace, et il est annoncé comme un bouton. Une `div` n'a rien de tout ça."
quiz:
  - question: "Quelle balise contient le contenu principal, propre à la page ?"
    choix:
      - "`<section>`"
      - "`<main>`"
      - "`<div id=\"main\">`"
      - "`<article>`"
    reponse: "`<main>`"
    explication: "`main` est la zone du contenu principal, une seule par page. Une `div`, même avec `id=\"main\"`, n'a aucun sens pour le navigateur."
  - question: "`kanban-board/index.html` n'a pas de `meta viewport`. Que se passe-t-il sur un téléphone ?"
    choix:
      - "Rien, la balise est facultative"
      - "La page s'affiche dézoomée et `@media (max-width: 900px)` ne se déclenche pas"
      - "Le fichier CSS ne se charge plus"
      - "Le JavaScript ne s'exécute plus"
    reponse: "La page s'affiche dézoomée et `@media (max-width: 900px)` ne se déclenche pas"
    explication: "Sans viewport, le téléphone fait comme s'il avait environ 980 px de large. 980 est plus grand que 900 : la media query reste inactive."
  - question: "Quel code relie correctement le texte « Langue » à la liste déroulante ?"
    choix:
      - "`<label>Langue</label> <select id=\"lang\">`"
      - "`<label for=\"lang\">Langue</label> <select id=\"lang\">`"
      - "`<label name=\"lang\">Langue</label> <select name=\"lang\">`"
    reponse: "`<label for=\"lang\">Langue</label> <select id=\"lang\">`"
    explication: "Le lien se fait avec `for` sur le label et le même `id` sur le champ. `name` sert à l'envoi du formulaire, pas au lien avec le label."
  - question: "Quel ordre de titres est correct ?"
    choix:
      - "h1 → h3 → h2"
      - "h1 → h2 → h3"
      - "h2 → h1 → h3"
      - "Peu importe, c'est une question de style"
    reponse: "h1 → h2 → h3"
    explication: "Les titres forment le plan de la page : on descend d'un niveau à la fois, sans en sauter."
  - question: "Quel attribut fait annoncer automatiquement un score qui change ?"
    choix:
      - "`aria-label`"
      - "`aria-live=\"polite\"`"
      - "`role=\"group\"`"
      - "`aria-hidden=\"true\"`"
    reponse: "`aria-live=\"polite\"`"
    explication: "`aria-live` crée une zone surveillée : chaque changement de texte est lu. `aria-hidden=\"true\"` ferait l'inverse, il cache l'élément aux lecteurs d'écran."
  - question: "Pourquoi une `div` avec un écouteur de clic fait un mauvais bouton ?"
    choix:
      - "Une `div` ne peut pas avoir de couleur de fond"
      - "Elle ne s'atteint pas au clavier et n'est pas annoncée comme un bouton"
      - "Le clic ne fonctionne jamais sur une `div`"
    reponse: "Elle ne s'atteint pas au clavier et n'est pas annoncée comme un bouton"
    explication: "Le clic à la souris marche, mais la personne au clavier ou au lecteur d'écran est bloquée. Un `button` gère tout ça tout seul."
exercices:
  - titre: "Le squelette parfait"
    niveau: facile
    enonce: "Écris le début d'une page en français : le DOCTYPE, la balise `html`, puis un `head` avec l'encodage UTF-8, le viewport mobile, le titre « Kanban Board » et le lien vers `style.css`."
    indices:
      - "La langue se met en attribut sur la balise `html`."
      - "Il faut deux balises `meta` : `charset` et `viewport`."
      - "Le viewport vaut `width=device-width, initial-scale=1.0`."
    solution: |
      ```html
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Kanban Board</title>
        <link rel="stylesheet" href="style.css" />
      </head>
      ```
  - titre: "Un formulaire qui se lit"
    niveau: moyen
    enonce: "Écris deux champs de la modale du kanban : un champ texte « Titre » relié par `for` et `id`, et une zone de texte « Description » reliée en la plaçant dans son label. Ajoute un bouton « Enregistrer »."
    indices:
      - "La valeur de `for` doit être identique à l'`id` du champ."
      - "La zone de texte multiligne, c'est `textarea`."
      - "Un bouton qui n'envoie pas de formulaire prend `type=\"button\"`."
    solution: |
      ```html
      <label for="cardTitle">Titre</label>
      <input type="text" id="cardTitle" />

      <label>
        Description
        <textarea id="cardDescription"></textarea>
      </label>

      <button type="button" id="saveCardBtn">Enregistrer</button>
      ```
  - titre: "L'écran de résultat en sémantique"
    niveau: difficile
    enonce: "Dans `quiz-interactif`, l'écran de résultat est une `div`. Réécris-le : une zone principale avec une section nommée par son titre « Résultat final », un paragraphe de score annoncé automatiquement aux lecteurs d'écran, et un vrai bouton « Recommencer »."
    indices:
      - "La zone principale, c'est `main` ; la partie de page, c'est `section`."
      - "Donne un `id` au titre et utilise-le dans `aria-labelledby` sur la section."
      - "Le score qui change prend `aria-live=\"polite\"`."
    solution: |
      ```html
      <main>
        <section id="result-screen" aria-labelledby="result-title">
          <h2 id="result-title">Résultat final</h2>
          <p id="score-text" aria-live="polite">Score : 4 / 5</p>
          <button type="button" id="restart-btn">Recommencer</button>
        </section>
      </main>
      ```
---

## Le squelette d'une page

:::quoi
Toute page HTML part du même **squelette** : le `DOCTYPE`, la **langue**, l'**encodage**, le **viewport** et le titre de l'onglet.
:::

:::exemple
```html title="quiz-dynamique/index.html"
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quiz Dynamique</title>
  <link rel="stylesheet" href="style.css" />
</head>
```
:::

:::piege
Oublier la balise **viewport** : sur téléphone, la page s'affiche dézoomée et tes media queries ne se déclenchent pas.
:::

:::ou[Dans mes projets]
`quiz-dynamique/index.html` a le squelette complet. `kanban-board/index.html` et `quiz-interactif/pages/index.html` n'ont pas de viewport : à corriger.
:::

## Les balises de structure

:::quoi
`header`, `nav`, `main`, `section` et `footer` découpent la page en **zones qui ont un sens**. Une `div` n'a aucun sens : c'est juste une boîte pour le style.
:::

:::exemple
```html title="quiz-dynamique/index.html"
<main class="app">
  <section id="screen-intro" class="screen" aria-labelledby="intro-title">
    <h1 id="intro-title">Quiz Dynamique</h1>
  </section>
  <section id="screen-question" class="screen hidden">
    <header class="quiz-header">…</header>
  </section>
</main>
```
:::

:::piege
Un seul `main` visible par page. Et `header` n'est pas réservé au haut du site : il peut aussi ouvrir une `section`, comme l'en-tête du quiz.
:::

:::ou[Dans mes projets]
`quiz-dynamique` (main, section, header) et `projet-scss/index.html` (header, nav, section, footer). Le `kanban-board` n'utilise que des `div` : bon candidat pour un passage en sémantique.
:::

## La hiérarchie des titres

:::quoi
Les titres `h1` à `h6` forment le **plan** de la page : un seul `h1`, puis des `h2`, puis des `h3`, sans sauter de niveau.
:::

:::exemple
```html title="kanban-board/index.html"
<h1>Kanban Board</h1>
<div class="column" data-status="todo">
  <h2>To Do <span class="counter">0</span></h2>
  <div class="card" data-id="1" data-priority="high">
    <h3>Tâche 1</h3>
  </div>
</div>
```
:::

:::piege
Choisir un `h3` parce qu'il est plus petit. La taille se règle en **CSS** ; le niveau dit l'**importance**.
:::

:::ou[Dans kanban-board]
Le plan est propre : `h1` pour le tableau, `h2` pour chaque colonne, `h3` pour chaque carte.
:::

## Les formulaires et leurs labels

:::quoi
Chaque champ a un **label** relié : soit `for` avec la valeur de l'`id` du champ, soit le champ placé **dans** le label. Un clic sur le texte active alors le champ.
:::

:::exemple
```html
<!-- quiz-interactif : for + id -->
<label for="lang-select">Langue :</label>
<select id="lang-select">…</select>

<!-- kanban-board : le champ dans le label -->
<label>Titre <input type="text" id="cardTitle"></label>
```
:::

:::piege
Le `placeholder` n'est pas un label : il disparaît dès qu'on tape. La barre de recherche du kanban n'a qu'un placeholder.
:::

:::ou[Dans mes projets]
La modale du `kanban-board` (titre, description, priorité) et le sélecteur de langue de `quiz-interactif`.
:::

## ARIA : le complément, pas la base

:::quoi
Les attributs **ARIA** ajoutent des informations pour les lecteurs d'écran quand le HTML seul ne suffit pas : nommer une zone, annoncer un changement, dire qu'un bouton est enfoncé.
:::

:::exemple
```html title="quiz-dynamique/index.html"
<div id="theme-picker" class="theme-picker" role="group" aria-label="Choix du thème"></div>

<span id="timer" class="timer" aria-live="polite">10</span>

<div class="progress-bar" role="progressbar"
     aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
```
:::

:::piege
**Pas d'ARIA vaut mieux qu'un mauvais ARIA.** Un vrai `button` bat toujours une `div` avec `role="button"`. Et `aria-live` sur un minuteur annonce chaque seconde : vite pénible.
:::

:::ou[Dans mes projets]
`quiz-dynamique` : `aria-labelledby` sur les écrans, `aria-live` sur le minuteur et le badge de difficulté. `quiz-interactif` : `aria-pressed` sur le bouton du mode sombre.
:::
