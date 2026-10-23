---
titre: "Flexbox et Grid : aligner et répartir"
matiere: html-css
type: cours
chapitre: 4
niveau: debutant
duree: 11
date: 2026-07-28
source: "kanban-board, quiz-dynamique, quiz-interactif et le mixin flex-container de projet-scss"
tags: [css, flexbox, grid, mise-en-page, alignement]
essentiel: "`display: flex` aligne les enfants d'un conteneur sur une ligne ou une colonne. `justify-content` règle l'axe principal, `align-items` l'axe secondaire, `gap` l'espace entre eux. Pour des lignes ET des colonnes : `display: grid`."
retenir:
  - "Flex agit sur les enfants directs du conteneur, pas sur les petits-enfants."
  - "`justify-content` agit sur l'axe principal (le sens de `flex-direction`), `align-items` sur l'axe secondaire."
  - "Centrer : `display: flex; justify-content: center; align-items: center;` sur un parent qui a une hauteur."
  - "`flex-wrap: wrap` laisse les enfants passer à la ligne ; `gap` les espace sans marges."
  - "`flex: 1` sur un enfant : il prend sa part de l'espace libre."
definitions:
  - terme: "Conteneur flex"
    definition: "L'élément qui reçoit `display: flex`. Il range ses enfants directs."
    exemple: ".kanban { display: flex; }"
  - terme: "Élément flex"
    definition: "Un enfant direct d'un conteneur flex. C'est sur lui qu'on règle `flex`, `flex-grow` ou `align-self`."
  - terme: "Axe principal"
    definition: "Le sens dans lequel les éléments flex se suivent : horizontal avec `row` (défaut), vertical avec `column`. `justify-content` agit dessus."
  - terme: "Axe secondaire"
    definition: "L'axe perpendiculaire à l'axe principal. `align-items` agit dessus."
  - terme: "gap"
    definition: "L'espace entre les enfants d'un conteneur flex ou grid, sans espace ajouté sur les bords."
    exemple: "gap: 20px;"
  - terme: "flex (raccourci)"
    definition: "Trois réglages en un : `flex-grow` (grandir), `flex-shrink` (rétrécir), `flex-basis` (taille de départ)."
    exemple: "flex: 1 1 280px;"
  - terme: "fr"
    definition: "Unité de grid : une part de l'espace libre. `1fr 1fr` = deux colonnes égales."
    exemple: "grid-template-columns: repeat(2, 1fr);"
flashcards:
  - q: "Sur qui agit `display: flex` ?"
    r: "Sur les enfants directs du conteneur. Les petits-enfants ne sont pas concernés."
  - q: "Valeur par défaut de `flex-direction` ?"
    r: "`row` : les enfants se suivent à l'horizontale."
  - q: "`justify-content` agit sur quel axe ?"
    r: "L'axe principal : horizontal en `row`, vertical en `column`."
  - q: "`align-items` agit sur quel axe ?"
    r: "L'axe secondaire, perpendiculaire à l'axe principal."
  - q: "Que fait `justify-content: space-between` ?"
    r: "Il colle le premier enfant au début, le dernier à la fin, et répartit l'espace entre eux."
  - q: "Les 3 lignes pour centrer un enfant ?"
    r: "`display: flex; justify-content: center; align-items: center;` sur le parent, qui doit avoir une hauteur."
  - q: "Valeur par défaut de `align-items` ?"
    r: "`stretch` : les enfants s'étirent sur toute la hauteur de la ligne."
  - q: "Que fait `flex-wrap: wrap` ?"
    r: "Il laisse les enfants passer à la ligne au lieu de se tasser sur une seule ligne."
  - q: "Avantage de `gap` sur des marges ?"
    r: "`gap` met de l'espace seulement entre les enfants, jamais sur les bords."
  - q: "Que signifie `flex: 1 1 280px` ?"
    r: "Taille de départ 280 px, l'élément peut grandir (1) et rétrécir (1)."
  - q: "Comment coller le footer en bas d'une page courte ?"
    r: "`body` en flex `column` avec `min-height: 100vh`, et `flex: 1` sur le contenu principal."
  - q: "Flex ou grid : quelle différence ?"
    r: "Flex range sur une seule dimension (ligne ou colonne). Grid range en lignes et en colonnes à la fois."
quiz:
  - question: "Dans `.column h2`, le titre « To Do » est à gauche et le compteur à droite. Quelle valeur de `justify-content` ?"
    choix:
      - "`center`"
      - "`space-between`"
      - "`flex-start`"
      - "`stretch`"
    reponse: "`space-between`"
    explication: "`space-between` colle le premier enfant au début et le dernier à la fin. En flex, `justify-content: stretch` se comporte comme `flex-start` : tout resterait à gauche."
  - question: "Avec `flex-direction: column`, quelle propriété centre les enfants à l'horizontale ?"
    choix:
      - "`justify-content: center`"
      - "`align-items: center`"
      - "`text-align: center`"
    reponse: "`align-items: center`"
    explication: "En `column`, l'axe principal est vertical : l'horizontale devient l'axe secondaire, celui d'`align-items`."
  - question: "`body { display: flex; justify-content: center; align-items: center; }` mais la carte reste collée en haut. Pourquoi ?"
    choix:
      - "Il manque `flex-wrap: wrap`"
      - "Le `body` n'a pas de hauteur, il est aussi haut que la carte"
      - "Il faut `align-items: middle`"
    reponse: "Le `body` n'a pas de hauteur, il est aussi haut que la carte"
    explication: "Sans hauteur, il n'y a pas d'espace vertical à partager. `quiz-dynamique` ajoute `min-height: 100vh`."
  - question: "Trois colonnes de 300 px dans un écran de 700 px, sans `flex-wrap`. Que se passe-t-il ?"
    choix:
      - "La troisième passe à la ligne"
      - "Elles restent sur une ligne et rétrécissent"
      - "La page affiche une erreur"
    reponse: "Elles restent sur une ligne et rétrécissent"
    explication: "Par défaut, flex garde tout sur une ligne et rétrécit les enfants. Avec `flex-wrap: wrap`, comme dans `.kanban`, la troisième passerait à la ligne."
  - question: "Quelle règle pousse le footer en bas quand le contenu est court ?"
    choix:
      - "`.main { flex: 1; }` dans un `body` en flex `column` de `min-height: 100vh`"
      - "`footer { position: absolute; }`"
      - "`footer { margin-top: 100vh; }`"
    reponse: "`.main { flex: 1; }` dans un `body` en flex `column` de `min-height: 100vh`"
    explication: "Le contenu principal prend tout l'espace libre, le footer est donc poussé en bas. C'est la méthode de `sass_exercice_2/environnement_propre`."
  - question: "`.answers { display: grid; gap: 0.75rem; }` sans `grid-template-columns`. Résultat ?"
    choix:
      - "Les réponses sur une seule colonne, espacées de 0.75rem"
      - "Les réponses côte à côte sur une ligne"
      - "Une grille de 2 × 2"
    reponse: "Les réponses sur une seule colonne, espacées de 0.75rem"
    explication: "Sans colonnes définies, la grille n'en a qu'une : les enfants s'empilent. C'est exactement ce que veut `quiz-dynamique`."
  - question: "Quel code donne deux colonnes égales ?"
    choix:
      - "`grid-template-columns: 2;`"
      - "`grid-template-columns: repeat(2, 1fr);`"
      - "`grid-columns: 50% 50%;`"
    reponse: "`grid-template-columns: repeat(2, 1fr);`"
    explication: "`repeat(2, 1fr)` crée deux colonnes qui reçoivent chacune une part égale de l'espace. `grid-columns` n'existe pas."
exercices:
  - titre: "Le titre de colonne"
    niveau: facile
    enonce: "Dans le kanban, chaque `h2` contient le nom de la colonne et un `span.counter`. Mets le nom à gauche, le compteur à droite, les deux centrés en hauteur."
    indices:
      - "Le `h2` devient un conteneur flex."
      - "Un enfant au début, l'autre à la fin : quelle valeur de `justify-content` ?"
      - "Le centrage en hauteur se fait sur l'axe secondaire."
    solution: |
      ```css
      .column h2 {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      ```
  - titre: "La grille d'images en grid"
    niveau: moyen
    enonce: "Dans `quiz-interactif`, les 4 réponses en images forment une grille 2 × 2 faite avec `inline-block` et `width: 44%`. Imagine que `#answers` reçoit la classe `answers-images` pour ces questions : écris une grille de deux colonnes égales, 12 px d'espace, et des images qui remplissent leur bouton."
    indices:
      - "C'est le parent `#answers.answers-images` qui devient `display: grid`."
      - "Deux colonnes égales : `repeat(2, 1fr)`."
      - "Les boutons gardent `width: 44%` et des marges (règle `#answers button.img-answer`) : annule-les avec un sélecteur plus spécifique, le `gap` s'occupe de l'espace."
    solution: |
      ```css
      #answers.answers-images {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      /* (1,2,0) : plus fort que #answers button.img-answer (1,1,1) */
      #answers.answers-images .img-answer {
        width: auto;
        margin: 0;
      }

      #answers.answers-images .img-answer img {
        display: block;
        width: 100%;
        height: 70px;
        object-fit: contain;
      }
      ```
  - titre: "Une page avec footer en bas et cartes souples"
    niveau: difficile
    enonce: "Écris le CSS d'une page `header`, `main`, `footer` : le footer reste en bas même si la page est courte. Dans `main`, `.features-grid` contient 3 `.feature-card` qui partent de 280 px, grandissent pour remplir la ligne et passent à la ligne quand la place manque, avec 24 px d'espace."
    indices:
      - "Le `body` devient une colonne flex d'au moins la hauteur de la fenêtre."
      - "Le `main` prend l'espace libre avec `flex: 1`."
      - "Les cartes : `flex: 1 1 280px` dans un parent en `flex-wrap: wrap`."
    solution: |
      ```css
      body {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      main {
        flex: 1;
      }

      .features-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
      }

      .feature-card {
        flex: 1 1 280px;
      }
      ```
---

## Le conteneur flex et ses deux axes

:::quoi
`display: flex` sur un **conteneur** range ses **enfants directs**. L'**axe principal** suit `flex-direction` (`row` à l'horizontale par défaut, `column` à la verticale) ; l'**axe secondaire** lui est perpendiculaire.
:::

:::exemple
```css title="kanban-board/style.css"
.kanban {
  display: flex;           /* To Do, Doing, Done côte à côte */
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
}
```
:::

:::piege
En `flex-direction: column`, les rôles s'inversent : `justify-content` agit à la verticale et `align-items` à l'horizontale.
:::

:::ou[Dans mes projets]
`.kanban` pour les trois colonnes ; le `body` de `sass_exercice_2/environnement_propre` en `flex-direction: column`.
:::

## justify-content et align-items

:::quoi
**justify-content** répartit sur l'axe principal (`flex-start`, `center`, `space-between`, `space-around`). **align-items** aligne sur l'axe secondaire (`stretch` par défaut, `flex-start`, `center`, `flex-end`).
:::

:::exemple
```css title="kanban-board/style.css"
.column h2 {
  display: flex;
  justify-content: space-between; /* nom à gauche, compteur à droite */
  align-items: center;            /* centrés en hauteur */
}
```
:::

:::piege
`align-items: stretch` est la valeur par défaut : les enfants s'étirent à la hauteur du plus grand. Le kanban met `align-items: flex-start` pour que chaque colonne garde sa hauteur.
:::

:::ou[Dans mes projets]
Les titres de colonnes du kanban, `.quiz-header` de `quiz-dynamique` (progression, difficulté et minuteur en `space-between`).
:::

## Centrer avec flex

:::quoi
Le **centrage parfait** : `justify-content: center` + `align-items: center` sur le parent, à condition qu'il ait une **hauteur**.
:::

:::exemple
```css title="quiz-dynamique/style.css"
body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
```
:::

:::piege
Sans hauteur (`min-height: 100vh`), le parent est aussi haut que son contenu : il n'y a rien à centrer verticalement.
:::

:::ou[Dans mes projets]
Le `body` de `quiz-dynamique` et de l'exercice 3 de position, le fond de la modale du kanban, le mixin `flex-center` du `tp_scss`.
:::

## flex-wrap et gap

:::quoi
Par défaut, flex garde tout **sur une seule ligne** et tasse les enfants. **flex-wrap: wrap** les laisse passer à la ligne, et **gap** met un espace régulier entre eux.
:::

:::exemple
```css title="quiz-dynamique/style.css"
.theme-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}
```
:::

:::piege
Avec des marges (`margin: 0 15px` sur chaque `li`), le premier et le dernier ont aussi une marge au bord. `gap` ne met de l'espace **qu'entre** les enfants.
:::

:::ou[Dans mes projets]
Le choix du thème des deux quiz, la `.toolbar` du kanban, et `.kanban` qui passe ses colonnes à la ligne sur un écran étroit.
:::

## flex: 1 et la taille des enfants

:::quoi
Sur un **enfant**, `flex` règle sa taille : `flex: grandir rétrécir base`. **flex: 1** lui donne sa part de l'espace libre ; `flex: 1 1 280px` part de 280 px puis grandit ou rétrécit.
:::

:::exemple
```css
/* projet-scss : chaque carte part de 280 px et s'étire */
.feature-card { flex: 1 1 280px; }

/* sass_exercice_2 : le contenu pousse le footer en bas */
body  { min-height: 100vh; display: flex; flex-direction: column; }
.main { flex: 1; }
```
:::

:::piege
`flex` se met sur l'**enfant**, pas sur le conteneur. Et `flex: 1` met la base à 0 : les enfants se partagent l'espace à parts égales, quel que soit leur contenu.
:::

:::ou[Dans mes projets]
Les cartes de `projet-scss`, le footer de `sass_exercice_2/environnement_propre`, le champ de recherche du kanban (`flex: 1 1 220px`).
:::

## Grid : lignes et colonnes

:::quoi
`display: grid` range les enfants en **lignes et colonnes** : `grid-template-columns` définit les colonnes, `gap` l'espace. Flex range sur une dimension, grid sur deux.
:::

:::exemple
```css
/* quiz-dynamique : les réponses empilées, bien espacées */
.answers { display: grid; gap: 0.75rem; }

/* Variante : deux colonnes égales pour 4 réponses */
.answers { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
```
:::

:::piege
Sans `grid-template-columns`, la grille n'a **qu'une colonne** : les enfants s'empilent. `1fr` = une part de l'espace libre.
:::

:::ou[Dans mes projets]
`.answers` de `quiz-dynamique`. Dans `quiz-interactif`, la grille 2 × 2 des réponses en images est faite à la main (`inline-block` + `width: 44%`) : grid ferait mieux en trois lignes.
:::
