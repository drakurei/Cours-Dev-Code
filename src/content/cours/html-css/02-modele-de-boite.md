---
titre: "Le modèle de boîte : marges, bordures et box-sizing"
matiere: html-css
type: cours
chapitre: 2
niveau: debutant
duree: 9
date: 2026-10-08
source: "Resets et conteneurs de kanban-board, quiz-dynamique, quiz-interactif et projet-scss"
tags: [css, modele-de-boite, box-sizing, display, unites]
essentiel: "Chaque élément est une boîte en 4 couches : le contenu, le padding, la bordure, la marge. Avec `box-sizing: border-box`, la largeur que tu écris inclut le padding et la bordure : fini les calculs surprises."
retenir:
  - "De l'intérieur vers l'extérieur : contenu → padding → bordure → marge."
  - "Le reset `* { box-sizing: border-box; margin: 0; padding: 0; }` ouvre presque tous mes projets."
  - "`max-width` + `margin: 0 auto` centre un bloc horizontalement."
  - "`block` prend toute la ligne, `inline` suit le texte, `inline-block` suit le texte mais accepte une taille."
  - "`rem` dépend de la police de `html`, `%` du parent, `vh` de la hauteur de la fenêtre."
definitions:
  - terme: "Modèle de boîte"
    definition: "La règle qui décrit chaque élément comme une boîte : contenu, padding, bordure, marge."
  - terme: "Padding"
    definition: "L'espace intérieur, entre le contenu et la bordure. Le fond de l'élément le couvre."
    exemple: "padding: 15px;"
  - terme: "Marge (margin)"
    definition: "L'espace extérieur, transparent, qui éloigne la boîte de ses voisines."
    exemple: "margin-bottom: 15px;"
  - terme: "box-sizing"
    definition: "Dit ce que compte `width`. `content-box` (défaut) : le contenu seul. `border-box` : contenu + padding + bordure."
    exemple: "box-sizing: border-box;"
  - terme: "Reset CSS"
    definition: "Les premières règles d'une feuille de style, qui effacent les marges par défaut du navigateur et fixent `box-sizing` pour tous les éléments."
    exemple: "* { box-sizing: border-box; margin: 0; padding: 0; }"
  - terme: "rem"
    definition: "Unité relative à la taille de police de l'élément `html` (16 px par défaut). `2rem` = 32 px."
  - terme: "Fusion des marges"
    definition: "Quand deux marges verticales de blocs se touchent, elles ne s'additionnent pas : seule la plus grande compte."
flashcards:
  - q: "Les 4 couches d'une boîte, de l'intérieur vers l'extérieur ?"
    r: "Le contenu, le padding, la bordure, la marge."
  - q: "Le fond (`background`) couvre-t-il la marge ?"
    r: "Non : il couvre le contenu et le padding, et passe sous la bordure. La marge reste transparente."
  - q: "`width: 300px; padding: 15px;` en `content-box` : largeur affichée ?"
    r: "330 px : 300 de contenu + 15 de padding à gauche + 15 à droite."
  - q: "La même règle en `border-box` : largeur affichée ?"
    r: "300 px. Le contenu se réduit à 270 px pour laisser la place au padding."
  - q: "Que fait `margin: 0 auto` sur un bloc avec `max-width` ?"
    r: "Marges du haut et du bas à 0, gauche et droite automatiques : le bloc est centré horizontalement."
  - q: "Que donne `margin: 0 auto 20px` ?"
    r: "Haut 0, gauche et droite auto, bas 20 px."
  - q: "Pourquoi `width` ne marche pas sur un `span` ?"
    r: "Un `span` est `inline` : il ignore `width` et `height`. Passe-le en `inline-block` ou en `block`."
  - q: "Combien vaut `2rem` avec les réglages par défaut du navigateur ?"
    r: "32 px, car la police de `html` fait 16 px par défaut."
  - q: "Différence entre `display: none` et `visibility: hidden` ?"
    r: "`display: none` retire la boîte : sa place disparaît. `visibility: hidden` la cache mais garde sa place."
  - q: "Un paragraphe a `margin-bottom: 20px`, le suivant `margin-top: 30px`. Espace entre eux ?"
    r: "30 px : les marges verticales fusionnent, la plus grande gagne."
  - q: "Que vaut `100vh` ?"
    r: "100 % de la hauteur de la fenêtre du navigateur."
quiz:
  - question: "`.column { width: 300px; padding: 15px; border: 1px solid #ccc; }` sans `box-sizing`. Quelle largeur s'affiche ?"
    choix:
      - "300 px"
      - "315 px"
      - "330 px"
      - "332 px"
    reponse: "332 px"
    explication: "En `content-box`, tout s'ajoute : 300 + 15 + 15 (padding) + 1 + 1 (bordure) = 332 px."
  - question: "La même règle avec `box-sizing: border-box`. Quelle largeur s'affiche ?"
    choix:
      - "270 px"
      - "300 px"
      - "332 px"
    reponse: "300 px"
    explication: "En `border-box`, `width` est la taille totale. Le contenu se réduit à 268 px pour faire de la place au padding et à la bordure."
  - question: "Comment centrer horizontalement le bloc `.container` ?"
    choix:
      - "`text-align: center;`"
      - "`max-width: 1100px; margin: 0 auto;`"
      - "`margin: auto 0;`"
      - "`align: center;`"
    reponse: "`max-width: 1100px; margin: 0 auto;`"
    explication: "Il faut une largeur limitée et des marges gauche et droite en `auto`. `text-align` centre le texte à l'intérieur, pas le bloc."
  - question: "Une pastille `span.priority` reçoit `margin-top: 12px` mais ne descend pas. Pourquoi ?"
    choix:
      - "Le `span` est `inline` : ses marges verticales n'ont pas d'effet"
      - "Il faut écrire la marge en `rem`"
      - "Le reset `margin: 0` l'emporte toujours"
    reponse: "Le `span` est `inline` : ses marges verticales n'ont pas d'effet"
    explication: "C'est pour ça que le kanban met `.priority` en `display: inline-block` : la pastille reste dans le texte mais accepte marges et taille."
  - question: "Avec la taille de police par défaut du navigateur, combien fait `h1 { font-size: 2rem; }` ?"
    choix:
      - "2 px"
      - "20 px"
      - "32 px"
    reponse: "32 px"
    explication: "`rem` se base sur la police de `html`, 16 px par défaut : 2 × 16 = 32 px."
  - question: "Quelle règle cache un écran de quiz sans lui garder de place ?"
    choix:
      - "`visibility: hidden;`"
      - "`opacity: 0;`"
      - "`display: none;`"
    reponse: "`display: none;`"
    explication: "`display: none` retire la boîte de la page. `visibility: hidden` et `opacity: 0` la rendent invisible, mais sa place reste occupée."
exercices:
  - titre: "Le reset de départ"
    niveau: facile
    enonce: "Écris le reset qui ouvre `projet-scss` : pour tous les éléments, y compris les pseudo-éléments `::before` et `::after`, la largeur inclut padding et bordure, et les marges et paddings par défaut sont à zéro."
    indices:
      - "Le sélecteur universel, c'est `*`."
      - "Ajoute `*::before` et `*::after` séparés par des virgules."
      - "La propriété clé : `box-sizing`."
    solution: |
      ```css
      *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      ```
  - titre: "Calculer une boîte"
    niveau: moyen
    enonce: "Une carte a `width: 250px; padding: 20px; border: 5px solid; margin: 10px;`. Calcule sa largeur affichée et la place totale qu'elle occupe (marges comprises), d'abord en `content-box`, puis en `border-box`."
    indices:
      - "Le padding et la bordure comptent deux fois : à gauche et à droite."
      - "La marge ne fait pas partie de la largeur affichée, mais elle occupe de la place."
      - "En `border-box`, la largeur affichée est exactement `width`."
    solution: |
      ```text
      content-box
        largeur affichée = 250 + 20 + 20 + 5 + 5 = 300 px
        place occupée    = 300 + 10 + 10       = 320 px

      border-box
        largeur affichée = 250 px (le contenu fait 250 - 40 - 10 = 200 px)
        place occupée    = 250 + 10 + 10       = 270 px
      ```
  - titre: "Un écran de quiz propre"
    niveau: difficile
    enonce: "Écris le CSS d'un `.screen` : 560 px de large au maximum, centré, `padding` de 2rem, fond blanc, coins arrondis de 14 px, et 20 px d'espace sous lui. Ajoute une pastille `span.badge` dans le texte, avec un padding de 0.2rem 0.6rem et 8 px d'espace au-dessus qui fonctionne vraiment."
    indices:
      - "Centrer : une largeur maximale et des marges gauche et droite en `auto`."
      - "Le raccourci `margin` à trois valeurs : haut, côtés, bas."
      - "Un `span` a besoin de `inline-block` pour que sa marge du haut agisse."
    solution: |
      ```css
      .screen {
        max-width: 560px;
        margin: 0 auto 20px;
        padding: 2rem;
        background: #fff;
        border-radius: 14px;
      }

      .badge {
        display: inline-block;
        margin-top: 8px;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
      }
      ```
---

## Les quatre couches d'une boîte

:::quoi
Tout élément est une **boîte** : le **contenu**, puis le **padding** (espace intérieur), la **bordure**, et la **marge** (espace extérieur, transparent).
:::

:::exemple
```css title="kanban-board/style.css"
.card {
  background: #fafafa;
  border-left: 6px solid #3498db;
  border-radius: 8px;
  padding: 15px;       /* entre le bord et le texte */
  margin-bottom: 15px; /* entre deux cartes */
}
```
:::

:::piege
Le **fond** couvre le padding, jamais la marge. Pour éloigner deux cartes : la marge. Pour aérer le texte : le padding.
:::

:::info
**Fusion des marges** : deux marges verticales qui se touchent ne s'additionnent pas. `20px` + `30px` donnent `30px`. Ça n'arrive pas entre les enfants d'un conteneur flex ou grid.
:::

:::ou[Dans mes projets]
Les cartes et les colonnes du `kanban-board`, les écrans `.screen` de `quiz-dynamique` (`padding: 2rem`).
:::

## box-sizing: border-box

:::quoi
Par défaut (`content-box`), `width` ne compte que le contenu : le padding et la bordure s'ajoutent. Avec **`border-box`**, `width` est la **taille totale**.
:::

:::exemple
```css
/* Le reset de mes projets */
* { box-sizing: border-box; margin: 0; padding: 0; }

.column { width: 300px; padding: 15px; }
/* content-box : 300 + 15 + 15 = 330 px à l'écran */
/* border-box  : 300 px, et le contenu fait 270 px */
```
:::

:::piege
Le reset `margin: 0` efface aussi les marges des titres et des paragraphes : remets-les là où il en faut, comme `h1 { margin-bottom: 30px; }` dans le kanban.
:::

:::ou[Dans mes projets]
Première règle de `kanban-board/style.css` et de `quiz-dynamique/style.css`. Dans `projet-scss/scss/_base.scss`, avec `*::before` et `*::after` en plus.
:::

## Centrer un bloc avec margin auto

:::quoi
Un bloc avec une **largeur limitée** et des marges gauche et droite en `auto` se centre horizontalement : les deux marges se partagent l'espace libre.
:::

:::exemple
```css title="quiz-interactif/assets/css/layout.css"
#intro-screen,
#question-screen,
#result-screen {
  max-width: 600px;
  margin: 0 auto 20px; /* haut 0, côtés auto, bas 20px */
  padding: 20px;
  border-radius: 8px;
}
```
:::

:::piege
Sans `width` ni `max-width`, un bloc prend déjà toute la largeur : `auto` n'a rien à partager. Et `margin: auto` ne centre pas **verticalement** un bloc normal.
:::

:::ou[Dans mes projets]
Les trois écrans de `quiz-interactif`, le `.container` de `projet-scss` et de `sass_exercice_3` (`max-width: 1100px`).
:::

## display : block, inline, inline-block, none

:::quoi
`display` dit comment la boîte se place. **block** prend toute la ligne, **inline** reste dans le texte sans accepter de taille, **inline-block** reste dans le texte mais accepte une taille, **none** retire l'élément.
:::

:::exemple
```css
/* kanban-board : pastille de priorité dans le texte */
.priority { display: inline-block; margin-top: 12px; padding: 5px 10px; }

/* quiz-interactif : les réponses empilées, une par ligne */
#answers button { display: block; width: 60%; margin: 8px auto; }

/* quiz-dynamique : cacher un écran */
.hidden { display: none !important; }
```
:::

:::piege
Sur un élément **inline** (`span`, `a`), `width`, `height` et les marges du haut et du bas n'ont aucun effet. Passe-le en `inline-block`.
:::

:::ou[Dans mes projets]
`.priority` du kanban, `.hidden` des deux quiz, les boutons de réponse de `quiz-interactif`.
:::

## Les unités : px, rem, %, vh

:::quoi
**px** est une taille fixe, **rem** dépend de la police de `html` (16 px par défaut) et **%** dépend du parent. **vh** et **vw** valent 1 % de la hauteur et de la largeur de la fenêtre.
:::

:::exemple
```css title="quiz-dynamique/style.css"
body { min-height: 100vh; padding: 1rem; }
.app { width: 100%; max-width: 560px; }
h1   { font-size: 2rem; } /* 2 × 16 = 32 px */
```
:::

:::piege
`em` ressemble à `rem`, mais il dépend de la police de l'élément lui-même : imbriqué, il se multiplie (`1.2em` dans `1.2em` = 1,44 fois). Préfère `rem` pour les tailles de texte.
:::

:::ou[Dans mes projets]
`quiz-dynamique/style.css` (du `rem` partout) et `projet-scss/scss/_variables.scss` (`$taille-titre: 2rem; // 32px`).
:::
