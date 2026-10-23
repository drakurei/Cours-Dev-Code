---
titre: "Responsive : media queries et tailles fluides"
matiere: html-css
type: cours
chapitre: 5
niveau: intermediaire
duree: 10
date: 2026-10-08
source: "kanban-board, quiz-dynamique, sass_exercice_1 et le mixin responsive de projet-scss"
tags: [css, responsive, media-queries, mobile, clamp]
essentiel: "Une page responsive s'adapte à la largeur de l'écran. Trois outils : la balise `meta viewport`, des tailles fluides (`%`, `max-width`, `clamp()`) et des media queries `@media (max-width: …)` qui changent le CSS sous un seuil."
retenir:
  - "Sans `meta viewport`, les media queries ne marchent pas comme prévu sur téléphone."
  - "Une media query se place après la règle qu'elle modifie : à égalité, la dernière règle gagne."
  - "`max-width` = desktop first (on adapte vers le petit écran), `min-width` = mobile first (on enrichit vers le grand)."
  - "Une largeur fixe (`width: 450px`) déborde sur un écran de 375 px : préfère `max-width` ou `min()`."
  - "On teste avec le mode appareil des DevTools : F12 puis `Ctrl + Maj + M`."
definitions:
  - terme: "Responsive"
    definition: "Une page qui s'adapte à toutes les largeurs d'écran, du téléphone au grand écran, sans défilement horizontal."
  - terme: "Media query"
    definition: "Un bloc `@media` dont les règles ne s'appliquent que si une condition est vraie, par exemple une largeur de fenêtre."
    exemple: "@media (max-width: 900px) { … }"
  - terme: "Breakpoint (point de rupture)"
    definition: "La largeur à partir de laquelle la mise en page change. Dans mes projets : 480 px, 768 px, 900 px."
    exemple: "$breakpoint-mobile: 768px;"
  - terme: "Desktop first"
    definition: "Écrire le CSS pour grand écran, puis le corriger pour les petits écrans avec `max-width`."
  - terme: "Mobile first"
    definition: "Écrire le CSS pour téléphone, puis l'enrichir pour les grands écrans avec `min-width`."
  - terme: "clamp()"
    definition: "Fonction CSS `clamp(min, idéal, max)` : la valeur suit l'idéal sans descendre sous le min ni dépasser le max."
    exemple: "font-size: clamp(28px, 4vw, 42px);"
flashcards:
  - q: "Que dit la balise `meta viewport` au téléphone ?"
    r: "D'utiliser la vraie largeur de son écran (`width=device-width`) au lieu d'environ 980 px, sans zoom au départ."
  - q: "Quand s'applique `@media (max-width: 900px)` ?"
    r: "Quand la fenêtre fait 900 px de large ou moins."
  - q: "Quand s'applique `@media (min-width: 901px)` ?"
    r: "Quand la fenêtre fait 901 px de large ou plus."
  - q: "Pourquoi placer les media queries à la fin ?"
    r: "À spécificité égale, la dernière règle gagne. Placée avant la règle de base, la media query serait écrasée."
  - q: "Desktop first ou mobile first : quelle condition pour chacun ?"
    r: "Desktop first utilise `max-width`, mobile first utilise `min-width`."
  - q: "À 900 px pile, `max-width: 900px` et `min-width: 900px` s'appliquent-ils ?"
    r: "Oui, tous les deux : les deux bornes sont incluses. Décale l'une d'un pixel (900 et 901)."
  - q: "Que fait `clamp(28px, 4vw, 42px)` ?"
    r: "La taille vaut 4 % de la largeur de la fenêtre, mais jamais moins de 28 px ni plus de 42 px."
  - q: "Comment rendre fluide une boîte de 450 px ?"
    r: "`width: 100%; max-width: 450px;` ou `width: min(450px, 100%);`."
  - q: "Peut-on écrire une variable CSS `--mobile` dans une media query ?"
    r: "Non : une variable CSS ne marche pas dans la condition d'un `@media`. Une variable Sass, si, car elle est remplacée à la compilation."
  - q: "Comment trouver l'élément qui crée un défilement horizontal ?"
    r: "Ajouter temporairement `* { outline: 1px solid red; }` et chercher la boîte qui dépasse le bord droit."
quiz:
  - question: "Dans le kanban, sous quelle largeur les colonnes passent-elles en colonne avec `@media (max-width: 900px)` ?"
    choix:
      - "Au-dessus de 900 px"
      - "À 900 px ou moins"
      - "Seulement à 900 px pile"
    reponse: "À 900 px ou moins"
    explication: "`max-width: 900px` veut dire « largeur maximale 900 px » : la règle s'applique de 0 à 900 px inclus."
  - question: "Une media query est écrite au début du fichier, avant `.kanban { flex-direction: row; }`. Elle ne marche pas. Pourquoi ?"
    choix:
      - "Les media queries doivent être dans un fichier à part"
      - "À spécificité égale, la règle écrite plus bas l'écrase"
      - "Il manque le mot `screen`"
    reponse: "À spécificité égale, la règle écrite plus bas l'écrase"
    explication: "La media query ne rend pas ses règles plus fortes. Place-la après la règle de base."
  - question: "Quelle approche correspond à « une colonne par défaut, puis une ligne dès 901 px » ?"
    choix:
      - "Desktop first avec `max-width`"
      - "Mobile first avec `min-width`"
      - "Aucune, c'est impossible en CSS"
    reponse: "Mobile first avec `min-width`"
    explication: "On écrit d'abord la version téléphone, puis on enrichit pour les grands écrans avec `@media (min-width: 901px)`."
  - question: "La modale du kanban a `width: 450px`. Sur un écran de 375 px ?"
    choix:
      - "Elle se réduit toute seule à 375 px"
      - "Elle déborde de l'écran"
      - "Elle passe automatiquement en plein écran"
    reponse: "Elle déborde de l'écran"
    explication: "Une largeur fixe ne s'adapte jamais. `width: 100%; max-width: 450px;` la garde à 450 px au maximum, mais jamais plus large que l'écran."
  - question: "`sass_exercice_1` répète trois fois `@media screen and (max-width: 768px)`. Meilleure correction ?"
    choix:
      - "Les regrouper dans un seul bloc `@media`"
      - "Mettre `!important` partout"
      - "Supprimer les media queries"
    reponse: "Les regrouper dans un seul bloc `@media`"
    explication: "Un seuil = un bloc. Le CSS est plus court et tous les réglages mobiles sont au même endroit."
  - question: "Que vaut `font-size: clamp(28px, 4vw, 42px)` sur un écran de 375 px de large ?"
    choix:
      - "15 px"
      - "28 px"
      - "42 px"
    reponse: "28 px"
    explication: "4vw = 4 % de 375 = 15 px, en dessous du minimum : `clamp` remonte la valeur à 28 px."
exercices:
  - titre: "Le quiz sur petit écran"
    niveau: facile
    enonce: "Dans `quiz-dynamique`, sous 480 px de large, réduis le padding de `.screen` à 1.5rem et la taille du `h1` à 1.6rem."
    indices:
      - "Desktop first : la condition est `max-width`."
      - "Dans le bloc `@media`, réécris seulement ce qui change."
    solution: |
      ```css
      @media (max-width: 480px) {
        .screen { padding: 1.5rem; }
        h1 { font-size: 1.6rem; }
      }
      ```
  - titre: "Réparer la modale du kanban"
    niveau: moyen
    enonce: "La modale du kanban déborde sur un téléphone de 375 px. Corrige le HTML (il manque une balise) et le CSS : la boîte `.modal-content` garde 450 px au maximum, ne dépasse jamais l'écran et ne touche pas les bords (16 px d'espace)."
    indices:
      - "Sans `meta viewport`, le téléphone fait comme s'il avait 980 px : commence par là."
      - "Remplace la largeur fixe par `width: 100%` + `max-width`."
      - "L'espace autour de la boîte peut venir d'un `padding` sur le fond `.modal`."
    solution: |
      ```html
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ```
      ```css
      .modal {
        padding: 16px; /* espace entre la boîte et les bords */
      }

      .modal-content {
        width: 100%;
        max-width: 450px;
      }
      ```
  - titre: "Le kanban en mobile first"
    niveau: difficile
    enonce: "Réécris la mise en page du kanban en mobile first : par défaut, les colonnes sont empilées et prennent toute la largeur ; à partir de 901 px, elles se mettent côte à côte, avec 320 px de large chacune et 24 px d'espace."
    indices:
      - "La règle de base est la version téléphone : `flex-direction: column`."
      - "La media query utilise `min-width: 901px`."
      - "Sur mobile, `width: 100%` ; sur grand écran, `width: 320px`."
    solution: |
      ```css
      .kanban {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .column {
        width: 100%;
      }

      @media (min-width: 901px) {
        .kanban {
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: center;
          align-items: flex-start;
        }

        .column {
          width: 320px;
        }
      }
      ```
---

## La balise meta viewport

:::quoi
Sans consigne, un téléphone affiche la page comme sur un écran d'environ **980 px**, puis la rétrécit. La balise **viewport** lui dit d'utiliser la vraie largeur de son écran.
:::

:::exemple
```html title="quiz-dynamique/index.html"
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quiz Dynamique</title>
</head>
```
:::

:::piege
Sans elle, `@media (max-width: 900px)` ne se déclenche pas sur un téléphone : il croit avoir 980 px de large.
:::

:::ou[Dans mes projets]
Présente dans `quiz-dynamique`. Absente de `kanban-board/index.html` : sa media query à 900 px est donc inactive sur un vrai téléphone.
:::

## Écrire une media query

:::quoi
`@media (max-width: 900px) { … }` applique ses règles **seulement** quand la fenêtre fait 900 px de large **ou moins**. Dedans, on réécrit juste ce qui change.
:::

:::exemple
```css title="kanban-board/style.css"
.kanban { display: flex; flex-wrap: wrap; }

@media (max-width: 900px) {
  .kanban {
    flex-direction: column;
    align-items: center;
  }
}
```
:::

:::piege
À **spécificité égale**, la dernière règle gagne : une media query placée **avant** la règle de base est écrasée. Mets-la après.
:::

:::ou[Dans mes projets]
Les colonnes du kanban empilées sous 900 px ; `quiz-dynamique` sous 480 px (padding et titre plus petits).
:::

## Desktop first ou mobile first

:::quoi
**Desktop first** : on écrit pour grand écran puis on corrige avec `max-width`. **Mobile first** : on écrit pour téléphone puis on enrichit avec `min-width`, souvent avec moins de code à annuler.
:::

:::exemple
```css
/* Desktop first (mes projets) : une colonne sous 900 px */
.kanban { flex-direction: row; }
@media (max-width: 900px) { .kanban { flex-direction: column; } }

/* Mobile first : une colonne par défaut, une ligne dès 901 px */
.kanban { flex-direction: column; }
@media (min-width: 901px) { .kanban { flex-direction: row; } }
```
:::

:::piege
`max-width: 900px` **inclut** 900 px. Si tu mélanges `max-width: 900px` et `min-width: 900px`, les deux s'appliquent à 900 px pile.
:::

:::ou[Dans mes projets]
Tous mes projets sont en desktop first (`max-width`), comme le mixin `responsive($breakpoint)` de `projet-scss`.
:::

## Regrouper ses media queries

:::quoi
Un même seuil = **un seul bloc** `@media`. Répéter le même `@media` alourdit le fichier et éparpille les réglages mobiles.
:::

:::exemple
```css
/* sass_exercice_1 : 3 blocs identiques regroupés en 1 */
@media screen and (max-width: 768px) {
  .header     { font-size: 14px; }
  .button     { font-size: 12px; }
  .card-title { font-size: 20px; }
}
```
:::

:::piege
Le seuil écrit en dur partout : le jour où tu le changes, tu en oublies un. En Sass, mets-le dans une variable. En CSS pur, une variable `--x` ne marche **pas** dans la condition d'un `@media`.
:::

:::ou[Dans mes projets]
Le « problème 3 » de `sass_exercice_1`. Bien fait dans `projet-scss` : tout le responsive est groupé à la fin de `_footer.scss` avec `$breakpoint-mobile`.
:::

## Des tailles fluides

:::quoi
Plutôt que des largeurs fixes, on combine **`width: 100%` + `max-width`**, `min()` et **`clamp(min, idéal, max)`** : la taille suit l'écran entre deux bornes.
:::

:::exemple
```css
.app { width: 100%; max-width: 560px; }     /* quiz-dynamique */
h1 { font-size: clamp(28px, 4vw, 42px); }   /* kanban-board */
.modal-content { width: min(450px, 100%); } /* au lieu de width: 450px */
img { max-width: 100%; height: auto; }      /* une image ne déborde jamais */
```
:::

:::piege
`width: 450px` sur la modale du kanban **déborde** sur un écran de 375 px, comme `width: 600px` sur la photo de l'exercice 3. Une largeur fixe sur un gros bloc = défilement horizontal.
:::

:::ou[Dans mes projets]
`.app` de `quiz-dynamique` (fluide jusqu'à 560 px), le titre du kanban en `clamp()`.
:::

## Tester son responsive

:::quoi
Les DevTools simulent un téléphone : **F12**, puis **Ctrl + Maj + M** (mode appareil). Choisis 375 px de large et fais défiler toute la page.
:::

:::exemple
```css
/* Une barre de défilement horizontale ? Trouve le coupable : */
* { outline: 1px solid red; }
/* outline ne change pas la taille des boîtes :     */
/* la boîte qui dépasse le bord droit est la fautive */
```
:::

:::piege
Retire la règle `outline` avant de commit. Et teste aussi sur ton vrai téléphone : zoom, clavier qui s'ouvre, doigt plus large qu'une souris.
:::

:::ou[À vérifier]
La modale du kanban à 375 px et le tableau récapitulatif de l'écran de résultat de `quiz-interactif`.
:::
