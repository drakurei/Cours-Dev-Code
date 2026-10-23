---
titre: "CSS position : relative, absolute, fixed, sticky"
matiere: html-css
type: cours
chapitre: 3
niveau: debutant
duree: 11
date: 2026-03-26
source: "Exercices CSS position : retour en haut, modale centrée, légende d'image, bannière"
tags: [css, position, modale, sticky, z-index]
essentiel: "`position` sort un élément de sa place normale. `relative` sert de repère, `absolute` se cale dans ce repère, `fixed` se cale sur la fenêtre, `sticky` colle pendant le scroll. On le place ensuite avec `top`, `right`, `bottom` et `left`."
retenir:
  - "`absolute` se place par rapport au plus proche ancêtre positionné : mets `position: relative` sur le parent."
  - "`fixed` reste au même endroit de l'écran pendant le scroll."
  - "`sticky` reste dans le flux, puis colle dès qu'il atteint son seuil, par exemple `top: 0`."
  - "Centrer une modale : `top: 50%; left: 50%; transform: translate(-50%, -50%)`, ou un parent en flex."
  - "`z-index` règle qui passe devant ; il agit sur les éléments positionnés."
definitions:
  - terme: "Flux normal"
    definition: "La place naturelle des éléments : les blocs les uns sous les autres, le texte de gauche à droite. Un élément `static` ou `relative` y reste."
  - terme: "Élément positionné"
    definition: "Un élément dont `position` vaut `relative`, `absolute`, `fixed` ou `sticky`, c'est-à-dire tout sauf `static`."
  - terme: "Bloc conteneur (repère)"
    definition: "La boîte par rapport à laquelle `top`, `right`, `bottom` et `left` sont calculés. Pour `absolute`, c'est le plus proche ancêtre positionné."
  - terme: "Contexte d'empilement"
    definition: "Un groupe de calques créé par un élément (avec `z-index`, `transform`, `opacity` inférieure à 1…). Ses enfants ne peuvent pas passer devant un élément extérieur au groupe."
  - terme: "inset"
    definition: "Raccourci pour `top`, `right`, `bottom` et `left` en une seule propriété."
    exemple: "inset: 0;"
  - terme: "translate()"
    definition: "Fonction de `transform` qui déplace un élément sans toucher au flux. En pourcentage, elle se base sur la taille de l'élément lui-même."
    exemple: "transform: translate(-50%, -50%);"
flashcards:
  - q: "Valeur par défaut de `position` ?"
    r: "`static` : l'élément suit le flux, et `top` ou `left` n'ont aucun effet."
  - q: "Par rapport à quoi se place un élément en `absolute` ?"
    r: "Par rapport au plus proche ancêtre positionné. S'il n'y en a pas, par rapport au début de la page."
  - q: "Comment faire d'un parent le repère d'un enfant en `absolute` ?"
    r: "Mettre `position: relative` sur le parent."
  - q: "Un élément en `absolute` garde-t-il sa place dans le flux ?"
    r: "Non : les voisins se placent comme s'il n'existait pas."
  - q: "Que fait `position: relative; top: 10px;` ?"
    r: "Il décale l'élément de 10 px vers le bas, mais sa place d'origine reste réservée."
  - q: "Par rapport à quoi se place un élément en `fixed` ?"
    r: "Par rapport à la fenêtre : il reste au même endroit de l'écran pendant le scroll."
  - q: "Différence entre `fixed` et `sticky` ?"
    r: "`fixed` sort du flux et reste toujours à l'écran. `sticky` reste dans le flux et ne colle qu'à partir de son seuil, tant que son parent est visible."
  - q: "Trois raisons pour lesquelles un `sticky` ne colle pas ?"
    r: "Pas de `top` (ou de `bottom`), un ancêtre en `overflow: hidden` ou `auto`, ou un parent à peine plus haut que l'élément."
  - q: "À quoi sert `transform: translate(-50%, -50%)` dans une modale ?"
    r: "Il recule la modale de la moitié de sa largeur et de sa hauteur : son centre se pose sur le point visé, et non plus son coin."
  - q: "Que vaut `inset: 0` ?"
    r: "`top: 0; right: 0; bottom: 0; left: 0;` : l'élément couvre tout son repère."
  - q: "Un `z-index` sur un élément `static` ?"
    r: "Aucun effet, sauf si l'élément est un enfant de flex ou de grid."
quiz:
  - question: "Exercice 1 : quelle valeur garde le bouton « retour en haut » en bas à droite pendant le scroll ?"
    choix:
      - "`position: relative;`"
      - "`position: absolute;`"
      - "`position: fixed;`"
      - "`position: static;`"
    reponse: "`position: fixed;`"
    explication: "`fixed` se cale sur la fenêtre, pas sur la page : le bouton ne bouge pas quand on fait défiler."
  - question: "Exercice 3 : la légende est en `absolute` avec `bottom: 0; left: 0;`. Pourquoi reste-t-elle sur la photo ?"
    choix:
      - "Parce que `.photo-container` est en `position: relative`"
      - "Parce que l'image est en `display: block`"
      - "Parce qu'un `absolute` se place toujours sur son parent direct"
    reponse: "Parce que `.photo-container` est en `position: relative`"
    explication: "Un `absolute` se cale sur le plus proche ancêtre positionné, pas forcément sur son parent direct. Ici, ce repère est `.photo-container`."
  - question: "Exercice 4 : la bannière doit rester dans le flux puis coller en haut. Quel code ?"
    choix:
      - "`position: fixed; top: 0;`"
      - "`position: sticky; top: 0;`"
      - "`position: sticky;`"
      - "`position: absolute; top: 0;`"
    reponse: "`position: sticky; top: 0;`"
    explication: "`sticky` a besoin d'un seuil : sans `top`, il ne colle jamais. `fixed` marcherait à l'écran, mais il sort du flux et passe par-dessus le contenu."
  - question: "Une modale a `position: fixed; top: 50%; left: 50%;` sans `transform`. Où est-elle ?"
    choix:
      - "Parfaitement centrée"
      - "Décalée vers le bas à droite"
      - "Collée en haut à gauche"
    reponse: "Décalée vers le bas à droite"
    explication: "C'est son coin haut gauche qui est au centre de l'écran. `translate(-50%, -50%)` la recule de la moitié de sa taille."
  - question: "Que vaut `inset: 0` ?"
    choix:
      - "`margin: 0;`"
      - "`top: 0; right: 0; bottom: 0; left: 0;`"
      - "`padding: 0;`"
      - "`z-index: 0;`"
    reponse: "`top: 0; right: 0; bottom: 0; left: 0;`"
    explication: "C'est le raccourci des 4 côtés. Avec `position: fixed`, l'élément couvre toute la fenêtre, comme le fond de la modale du kanban."
  - question: "Un élément a `z-index: 999` mais reste derrière les autres. Cause la plus probable ?"
    choix:
      - "Il est en `position: static`"
      - "999 n'est pas assez grand"
      - "`z-index` n'accepte que des valeurs négatives"
    reponse: "Il est en `position: static`"
    explication: "`z-index` n'agit que sur un élément positionné (ou un enfant de flex ou de grid). Augmenter le nombre ne change rien."
exercices:
  - titre: "Le bouton retour en haut"
    niveau: facile
    enonce: "Exercice 1 : place `.back-to-top` dans le coin inférieur droit de l'écran, à 20 px des bords, et fais-le rester visible pendant le scroll."
    indices:
      - "Quelle valeur de `position` se cale sur la fenêtre ?"
      - "On le place avec `bottom` et `right`."
    solution: |
      ```css
      .back-to-top {
        position: fixed;
        bottom: 20px;
        right: 20px;
      }
      ```
  - titre: "La légende sur la photo"
    niveau: facile
    enonce: "Exercice 3 : place `.caption` dans le coin inférieur gauche de la photo, par-dessus l'image. `.photo-container` est déjà en `position: relative`."
    indices:
      - "Le parent sert déjà de repère : l'enfant doit sortir du flux."
      - "Coin inférieur gauche : `bottom` et `left` à 0."
    solution: |
      ```css
      .caption {
        position: absolute;
        bottom: 0;
        left: 0;
      }
      ```
  - titre: "La bannière collante"
    niveau: moyen
    enonce: "Exercice 4 : la `.banner` doit rester dans le flux en haut de la page, puis rester collée en haut de l'écran pendant le scroll. Elle doit passer au-dessus du contenu qui défile."
    indices:
      - "Contrairement à `fixed`, cette valeur garde l'élément dans le flux."
      - "Il faut un seuil : à quelle distance du bord haut colle-t-elle ?"
      - "Un `z-index` garantit qu'elle reste devant."
    solution: |
      ```css
      .banner {
        position: sticky;
        top: 0;
        z-index: 10;
      }
      ```
  - titre: "La modale centrée, deux méthodes"
    niveau: difficile
    enonce: "Exercice 2 : centre `.modal` (`width: 300px; height: 200px`) au milieu de la fenêtre, horizontalement et verticalement. Écris la méthode A (position + transform), puis la méthode B (flex sur `body`)."
    indices:
      - "Méthode A : `top: 50%` et `left: 50%` placent le coin haut gauche au centre."
      - "Méthode A : `translate` en pourcentage se base sur la taille de la modale elle-même."
      - "Méthode B : sans hauteur, `body` est aussi haut que la modale. Donne-lui `min-height: 100vh`."
    solution: |
      ```css
      /* Méthode A : position + transform */
      .modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      /* Méthode B : flex sur le parent */
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      ```
---

## Le flux et position: relative

:::quoi
Par défaut (`static`), les éléments suivent le **flux** : les uns sous les autres. **relative** garde l'élément à sa place et en fait un **repère** pour ses enfants en `absolute`.
:::

:::exemple
```css title="exercice-3-legende-image/style.css"
.photo-container {
  position: relative; /* repère pour la légende */
  width: 600px;
  height: 400px;
}
```
:::

:::piege
`top`, `left`, etc. n'ont **aucun effet** sur un élément `static`. Et `relative` + `top: 10px` décale l'élément, mais sa place d'origine reste vide.
:::

:::ou[Dans mes projets]
`.photo-container` de l'exercice 3, `.card` du `kanban-board` (repère des boutons modifier et supprimer).
:::

## position: absolute

:::quoi
**absolute** sort l'élément du **flux** (ses voisins ne lui gardent plus de place) et le place par rapport au plus proche **ancêtre positionné**.
:::

:::exemple
```css title="exercice-3-legende-image/style.css"
.caption {
  position: absolute; /* calée dans .photo-container */
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
}
```
:::

:::piege
Sans ancêtre positionné, l'élément se cale sur le début de la page : ta légende atterrit en bas à gauche du premier écran, loin de la photo.
:::

:::ou[Dans mes projets]
La légende de l'exercice 3, `.delete-btn` et `.edit-btn` du `kanban-board` (`top: 8px; right: 8px`), le soulignement `a::after` de `sass_exercice_3`.
:::

## position: fixed

:::quoi
**fixed** place l'élément par rapport à la **fenêtre** : il reste au même endroit de l'écran, même quand on fait défiler la page.
:::

:::exemple
```css title="exercice-1-retour-haut/style.css"
.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
```
:::

:::piege
Si un ancêtre a un `transform` ou un `filter`, le `fixed` se cale sur cet ancêtre et plus sur la fenêtre. Garde tes éléments `fixed` hors des cartes animées.
:::

:::ou[Dans mes projets]
Le bouton de l'exercice 1, `#theme-toggle` et `#lang-switcher` de `quiz-interactif` (coins haut droit et haut gauche), le fond de la modale du `kanban-board`.
:::

## position: sticky

:::quoi
**sticky** est hybride : l'élément reste dans le flux comme `relative`, puis **colle** dès qu'il atteint son seuil pendant le scroll.
:::

:::exemple
```css title="exercice-4-banniere/style.css"
.banner {
  position: sticky;
  top: 0;
  background-color: #2ecc71;
  padding: 1rem;
}
```
:::

:::piege
Sans `top` (ou `bottom`), rien ne colle. Un ancêtre en `overflow: hidden` ou `auto` casse aussi le collage, et l'élément ne colle que **tant que son parent est visible**.
:::

:::ou[Dans mes projets]
La bannière de l'exercice 4. Dans Manabi, le sommaire à droite d'un cours est en `sticky`.
:::

## Centrer une modale

:::quoi
Méthode **A** : `fixed` + `top: 50%; left: 50%` place le coin haut gauche au centre, puis `translate(-50%, -50%)` recule de la moitié de la taille. Méthode **B** : un parent en **flex** centre son enfant.
:::

:::exemple
```css
/* A — exercice 2 : la modale se centre elle-même */
.modal { position: fixed; top: 50%; left: 50%;
         transform: translate(-50%, -50%); }

/* B — kanban-board : le fond plein écran centre la boîte */
.modal { position: fixed; inset: 0;
         display: flex; justify-content: center; align-items: center; }
```
:::

:::piege
Sans `translate(-50%, -50%)`, la modale est décalée vers le bas à droite : c'est son coin, pas son centre, qui est au milieu.
:::

:::ou[Dans mes projets]
La modale violette de l'exercice 2. `#cardModal` du `kanban-board` : `inset: 0` étire le fond sombre sur tout l'écran et flex centre `.modal-content`.
:::

## z-index : qui passe devant

:::quoi
`z-index` règle l'**ordre d'empilement** : la plus grande valeur passe devant. Il agit sur les éléments positionnés, et sur les enfants de flex ou de grid.
:::

:::exemple
```css title="kanban-board/style.css"
.modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .45);
  z-index: 999; /* devant les colonnes et les cartes */
}
```
:::

:::piege
Un enfant reste coincé dans le **contexte d'empilement** de son parent (créé par un `z-index`, un `transform` ou une `opacity` inférieure à 1) : même `z-index: 9999` ne le fait pas sortir.
:::

:::ou[Dans kanban-board]
Le fond de la modale passe devant tout le tableau avec `z-index: 999`.
:::
