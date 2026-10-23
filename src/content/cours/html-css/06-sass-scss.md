---
titre: "Sass / SCSS : variables, imbrication, mixins et partials"
matiere: html-css
type: cours
chapitre: 6
niveau: intermediaire
duree: 12
date: 2026-04-24
source: "Exercices Sass du Bachelor : sass_exercice_1 à 5, tp_scss, projet-scss"
tags: [css, sass, scss, preprocesseur, mixins]
essentiel: "Sass est un préprocesseur : tu écris du SCSS (variables, imbrication, mixins, fichiers partiels), la commande `sass` le compile en CSS normal, et c'est ce CSS que lit le navigateur. On ne modifie jamais le CSS compilé à la main."
retenir:
  - "Compiler : `sass scss/style.scss css/style.css` ; en continu : `sass --watch scss/style.scss:css/style.css`."
  - "Une variable Sass commence par `$` et disparaît à la compilation."
  - "`&` remplace le sélecteur parent : `&:hover`, `&::after`, `&--primary`."
  - "`@mixin` déclare un bloc réutilisable, `@include` l'insère."
  - "Un partial `_nom.scss` ne se compile pas seul : chaque fichier qui en a besoin le charge avec `@use 'nom'`."
definitions:
  - terme: "Préprocesseur CSS"
    definition: "Un outil qui transforme un langage plus riche (SCSS) en CSS normal, le seul que le navigateur comprend."
  - terme: "Compilation"
    definition: "La transformation du fichier `.scss` en fichier `.css` par la commande `sass`."
    exemple: "sass scss/style.scss css/style.css"
  - terme: "Variable Sass"
    definition: "Un nom qui commence par `$` et stocke une valeur (couleur, taille…). Elle est remplacée par sa valeur à la compilation."
    exemple: "$couleur-principale: #3a86ff;"
  - terme: "Imbrication"
    definition: "Écrire un sélecteur à l'intérieur d'un autre. Sass les recolle pour produire le sélecteur complet."
    exemple: ".nav { ul { … } } → .nav ul"
  - terme: "Sélecteur parent (&)"
    definition: "Le symbole `&` est remplacé par le sélecteur du bloc parent, sans espace."
    exemple: "&:hover → .button:hover"
  - terme: "Mixin"
    definition: "Un bloc de déclarations réutilisable, avec des paramètres possibles. On le déclare avec `@mixin`, on l'insère avec `@include`."
    exemple: "@include flex-container(column, center, center);"
  - terme: "Partial"
    definition: "Un fichier SCSS dont le nom commence par `_`. Sass ne le compile pas seul : un autre fichier le charge."
    exemple: "_variables.scss"
  - terme: "@use"
    definition: "La règle qui charge un autre fichier SCSS (ou un module comme `sass:color`). Elle remplace l'ancien `@import`, déprécié."
    exemple: "@use 'variables' as *;"
flashcards:
  - q: "Pourquoi faut-il compiler le SCSS ?"
    r: "Le navigateur ne lit que du CSS. La commande `sass` transforme le `.scss` en `.css`."
  - q: "Quel fichier la page HTML doit-elle lier ?"
    r: "Le CSS compilé (`css/style.css`), jamais le `.scss`."
  - q: "Que fait `--watch` ?"
    r: "Il surveille le fichier SCSS et recompile le CSS à chaque sauvegarde."
  - q: "Que fait `--style=compressed` ?"
    r: "Il produit un CSS minifié, sur une seule ligne, sans espaces : plus léger pour la mise en ligne."
  - q: "Que se passe-t-il si tu modifies `css/style.css` à la main ?"
    r: "La prochaine compilation l'écrase : tes changements sont perdus."
  - q: "Différence entre `$couleur` et `--couleur` ?"
    r: "`$couleur` (Sass) est remplacée à la compilation. `--couleur` (CSS) existe dans le navigateur et peut changer en direct, par exemple pour un mode sombre."
  - q: "Que donne `.button { &:hover { … } }` à la compilation ?"
    r: "`.button:hover { … }` : le `&` est remplacé par `.button`, sans espace."
  - q: "Que donne `.btn { &--primary { … } }` ?"
    r: "`.btn--primary { … }`, une classe de style BEM."
  - q: "Comment donner une valeur par défaut à un paramètre de mixin ?"
    r: "Avec deux-points dans la déclaration : `@mixin flex-container($direction: row) { … }`."
  - q: "À quoi sert `@content` dans un mixin ?"
    r: "Il laisse la place au bloc de règles écrit entre accolades après le `@include`, comme dans le mixin `responsive`."
  - q: "Pourquoi un nom de fichier commence-t-il par `_` ?"
    r: "C'est un partial : Sass ne le compile pas en fichier CSS séparé, il est chargé par un autre fichier."
  - q: "Que veut dire `as *` dans `@use 'variables' as *;` ?"
    r: "On utilise les variables sans préfixe : `$couleur-principale` au lieu de `variables.$couleur-principale`."
  - q: "Remplaçant moderne de `darken($c, 10%)` ?"
    r: "`color.adjust($c, $lightness: -10%)`, avec `@use 'sass:color';` en haut du fichier."
quiz:
  - question: "Quel fichier la balise `link` de `index.html` doit-elle charger ?"
    choix:
      - "`scss/style.scss`"
      - "`css/style.css`"
      - "`scss/_variables.scss`"
    reponse: "`css/style.css`"
    explication: "Le navigateur ne comprend pas le SCSS : on lie toujours le fichier compilé."
  - question: "Quelle commande recompile le CSS à chaque sauvegarde ?"
    choix:
      - "`sass scss/style.scss css/style.css`"
      - "`sass --watch scss/style.scss:css/style.css`"
      - "`sass scss/style.scss css/style.min.css --style=compressed`"
    reponse: "`sass --watch scss/style.scss:css/style.css`"
    explication: "`--watch` surveille le fichier. Les deux autres compilent une seule fois, la dernière en version minifiée."
  - question: "Que donne `.button { :hover { color: red; } }`, sans `&` ?"
    choix:
      - "`.button:hover`"
      - "`.button :hover`, le survol d'un enfant du bouton"
      - "Une erreur de compilation"
    reponse: "`.button :hover`, le survol d'un enfant du bouton"
    explication: "Sans `&`, Sass ajoute un espace : c'est un sélecteur descendant. Il faut `&:hover` pour viser le bouton lui-même."
  - question: "Dans `tp_scss`, `@includ flex-center;` contient une faute de frappe. Que se passe-t-il ?"
    choix:
      - "Sass s'arrête avec une erreur"
      - "Sass recopie la ligne telle quelle dans le CSS, le navigateur l'ignore : le header n'est pas centré"
      - "Sass corrige la faute tout seul"
    reponse: "Sass recopie la ligne telle quelle dans le CSS, le navigateur l'ignore : le header n'est pas centré"
    explication: "Sass prend `@includ` pour une règle CSS inconnue et la laisse passer. Aucune erreur : il faut relire le CSS compilé."
  - question: "Le partial `_header.scss` utilise `$couleur-principale` sans `@use 'variables'`. Résultat ?"
    choix:
      - "Ça marche, car `style.scss` a déjà chargé les variables"
      - "Erreur « Undefined variable »"
      - "La couleur devient noire"
    reponse: "Erreur « Undefined variable »"
    explication: "Avec `@use`, rien n'est global : chaque fichier charge ce dont il a besoin, comme le font tous les partials de `projet-scss`."
  - question: "Quel est le remplaçant moderne de `darken($secondary-color, 10%)` ?"
    choix:
      - "`color.adjust($secondary-color, $lightness: -10%)`"
      - "`color.adjust($secondary-color, $lightness: 10%)`"
      - "`lighten($secondary-color, 10%)`"
    reponse: "`color.adjust($secondary-color, $lightness: -10%)`"
    explication: "Foncer = baisser la luminosité, donc une valeur négative. Il faut aussi `@use 'sass:color';` en haut du fichier."
  - question: "`$border-radius / 2` affiche un avertissement de dépréciation. Quelle correction ?"
    choix:
      - "`math.div($border-radius, 2)` avec `@use 'sass:math';`"
      - "`$border-radius // 2`"
      - "`div($border-radius, 2)` sans rien charger"
    reponse: "`math.div($border-radius, 2)` avec `@use 'sass:math';`"
    explication: "La division avec `/` est dépréciée. `//` commence un commentaire en SCSS, et `div()` n'existe pas sans le module `sass:math`."
  - question: "Laquelle de ces variables peut changer en direct dans le navigateur, pour un mode sombre ?"
    choix:
      - "`$ink`"
      - "`--ink`"
      - "Les deux"
    reponse: "`--ink`"
    explication: "Une variable CSS vit dans le navigateur : le kanban change `--ink` dans `body.dark-mode`. Une variable Sass n'existe plus après la compilation."
exercices:
  - titre: "Des variables pour le bouton"
    niveau: facile
    enonce: "Dans `sass_exercice_5`, déclare dans `_variables.scss` une couleur principale `#3498db`, une couleur de texte `white`, un espacement de `20px` et un rayon de `5px`. Utilise-les dans `style.scss` pour `.button` (fond, texte, padding de 10px et l'espacement, coins arrondis)."
    indices:
      - "Une variable Sass commence par `$` et se termine par `;`."
      - "`style.scss` charge déjà le fichier avec `@use \"variables\" as *;`."
      - "Le padding peut mélanger valeur fixe et variable : `10px $espacement`."
    solution: |
      ```scss
      // _variables.scss
      $couleur-principale: #3498db;
      $couleur-texte-bouton: white;
      $espacement: 20px;
      $rayon: 5px;

      // style.scss
      @use "variables" as *;

      .button {
        background-color: $couleur-principale;
        color: $couleur-texte-bouton;
        padding: 10px $espacement;
        border-radius: $rayon;
        border: none;
        cursor: pointer;
      }
      ```
  - titre: "Imbriquer la navigation"
    niveau: moyen
    enonce: "Dans `sass_exercice_3`, réécris en SCSS imbriqué : `.nav ul` (sans puces, en flex), `.nav ul li a` (blanc, sans soulignement), son `::after` (trait de 2px sous le lien, `scaleX(0)`), le survol du lien (couleur `#3498db`) et le `::after` au survol (`scaleX(1)`)."
    indices:
      - "Imbrique dans l'ordre du HTML : `.nav`, puis `ul`, puis `li`, puis `a`."
      - "Le pseudo-élément du lien : `&::after`. Le survol : `&:hover`."
      - "Le `::after` au survol s'imbrique dans `&:hover`."
    solution: |
      ```scss
      .nav {
        ul {
          list-style: none;
          display: flex;

          li a {
            color: white;
            text-decoration: none;
            position: relative;

            &::after {
              content: "";
              position: absolute;
              left: 0;
              bottom: -5px;
              width: 100%;
              height: 2px;
              background-color: #3498db;
              transform: scaleX(0);
            }

            &:hover {
              color: #3498db;

              &::after {
                transform: scaleX(1);
              }
            }
          }
        }
      }
      ```
  - titre: "Un mixin flex à paramètres"
    niveau: moyen
    enonce: "Dans `sass_exercice_5`, crée dans `_mixins.scss` un mixin `flex` avec trois paramètres : la direction (par défaut `row`), l'alignement (par défaut `center`) et la répartition (par défaut `space-around`). Utilise-le sur `.flex-section` sans repasser les valeurs par défaut."
    indices:
      - "Une valeur par défaut s'écrit `$direction: row` dans la liste des paramètres."
      - "Dans le mixin : `display`, `flex-direction`, `align-items`, `justify-content`."
      - "Si les valeurs par défaut conviennent, `@include flex;` suffit."
    solution: |
      ```scss
      // _mixins.scss
      @mixin flex($direction: row, $alignement: center, $repartition: space-around) {
        display: flex;
        flex-direction: $direction;
        align-items: $alignement;
        justify-content: $repartition;
      }

      // style.scss
      @use "mixins" as *;

      .flex-section {
        @include flex;
        padding: 20px;
      }
      ```
  - titre: "Réparer le tp_scss"
    niveau: difficile
    enonce: "Le fichier `tp_scss/avec_erreurs/scss/style.scss` cache 5 erreurs : une variable sans `$`, un mixin sans `@mixin`, un `@includ`, des accolades fermantes manquantes, et `$dark-color` jamais déclarée. Écris les lignes corrigées. Attention : deux de ces erreurs ne bloquent pas la compilation."
    indices:
      - "Lance la compilation : elle s'arrête sur la première erreur bloquante (`expected \"{\"`)."
      - "`flex-center { … }` sans `@mixin` et `@includ` passent sans erreur, mais ne servent à rien : relis le CSS compilé."
      - "Compte les accolades ouvertes et fermées autour de `.container`, `.card` et `h2`."
    solution: |
      ```scss
      // 1. Le $ manquant + 5. la variable manquante
      $primary-color: #3498db;
      $dark-color: #2c3e50;

      // 2. Le mot-clé @mixin
      @mixin flex-center {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      header {
        @include flex-center; // 3. @includ → @include
      }

      // 4. Les accolades de h2, .card et .container
      .container {
        .card {
          h2 {
            color: $primary-color;
          }
        }
      }
      ```
---

## Compiler le SCSS en CSS

:::quoi
Le navigateur ne lit **que du CSS**. La commande **sass** transforme `style.scss` en `style.css` ; `--watch` recompile à chaque sauvegarde.
:::

:::exemple
```bash
# projet-scss : une compilation
sass scss/style.scss css/style.css --style=expanded

# Recompiler à chaque sauvegarde
sass --watch scss/style.scss:css/style.css

# Version minifiée (sass_exercice_2)
sass scss/style.scss css/style.min.css --style=compressed
```
:::

:::piege
Modifier `css/style.css` à la main : la prochaine compilation **écrase** tout. Et le HTML lie le fichier **compilé**, jamais le `.scss`.
:::

:::info
Deux syntaxes existent : **SCSS** (`.scss`, accolades et points-virgules comme en CSS) et la syntaxe **indentée** (`.sass`, sans accolades). Le `style.sass` de `sass_exercice_2/avec_erreurs` mélange les deux : Sass refuse de le compiler.
:::

:::ou[Dans mes projets]
`projet-scss/README.md` (les deux commandes), `sass_exercice_2/environnement_propre` (`style.css`, `style.min.css` et leurs `.map`).
:::

## Les variables

:::quoi
Une **variable Sass** (`$nom: valeur;`) stocke une couleur, une taille ou un espacement. Tu la changes à un seul endroit, tout le site suit.
:::

:::exemple
```scss title="projet-scss/scss/_variables.scss"
$couleur-principale: #3a86ff;
$taille-titre: 2rem;        // 32px
$espacement-sections: 3rem;
$breakpoint-mobile: 768px;

// Dans _header.scss
header { background-color: $couleur-principale; }
```
:::

:::piege
Oublier le `$` (`primary-color: #3498db;`) : Sass croit lire un sélecteur et s'arrête (`expected "{"`). Une variable jamais déclarée : erreur **Undefined variable**.
:::

:::info
`$couleur` (Sass) disparaît à la compilation. `--brand` (variable CSS, dans `:root`) vit dans le navigateur et peut changer en direct : c'est ce qu'utilise le mode sombre du kanban.
:::

:::ou[Dans mes projets]
`projet-scss/scss/_variables.scss` ; les erreurs 1 et 5 de `tp_scss/avec_erreurs`.
:::

## L'imbrication et le sélecteur parent &

:::quoi
On écrit les sélecteurs **les uns dans les autres**, comme le HTML. **&** remplace le sélecteur parent : `&:hover` devient `.button:hover`.
:::

:::exemple
```scss title="sass_exercice_4/scss/_button.scss"
.button {
  background-color: white;
  color: #3498db;

  &:hover { background-color: #217dbb; }                   // .button:hover
  &:focus { box-shadow: 0 0 8px rgba(52, 152, 219, 0.5); } // .button:focus
}
```
:::

:::piege
Sans `&`, un `:hover` imbriqué donne `.button :hover` (avec un espace) : le survol d'un **enfant**. Et ne dépasse pas **3 niveaux** : `.nav ul li a` devient trop spécifique.
:::

:::ou[Dans mes projets]
Tous les partials de `sass_exercice_4` (`_nav.scss` descend jusqu'à `.nav ul li a:hover::after`), `.btn--primary` écrit `&--primary` dans `tp_scss`.
:::

## Les mixins

:::quoi
Un **mixin** est un bloc de déclarations réutilisable, avec des **paramètres** et des valeurs par défaut. `@mixin` le déclare, `@include` l'insère, `@content` laisse passer un bloc de règles.
:::

:::exemple
```scss title="projet-scss/scss/_mixins.scss"
@mixin flex-container($direction: row, $alignement: center, $espacement: space-between) {
  display: flex;
  flex-direction: $direction;
  align-items: $alignement;
  justify-content: $espacement;
  flex-wrap: wrap;
}
.hero { @include flex-container(column, center, center); } // dans _hero.scss
```
:::

:::piege
Un mixin sans `@mixin`, ou un `@includ` mal écrit, **ne fait pas d'erreur** : Sass les laisse passer tels quels dans le CSS, et rien ne s'applique. Relis le CSS compilé.
:::

:::ou[Dans mes projets]
`flex-container`, `responsive` (avec `@content`) et `carte` dans `projet-scss` ; `flex-center` et `respond-to` dans `tp_scss` ; les erreurs 2 et 3 de `tp_scss/avec_erreurs`.
:::

## Les partials et @use

:::quoi
Un **partial** est un fichier qui commence par `_` (`_header.scss`) : Sass ne le compile pas seul. Le fichier principal les charge avec **@use** et produit un seul CSS.
:::

:::exemple
```scss
// projet-scss/scss/style.scss : le point d'entrée
@use 'variables' as *;
@use 'mixins' as *;
@use 'base';
@use 'header';
@use 'footer';
// projet-scss/scss/_header.scss : chaque partial charge ce qu'il utilise
@use 'variables' as *;
```
:::

:::piege
Avec `@use`, rien n'est global : **chaque** partial qui utilise `$couleur-principale` fait son propre `@use 'variables'`, sinon : Undefined variable. Les `@use` se placent tout en haut du fichier.
:::

:::info
`@import` est l'ancienne méthode : il est **déprécié** et sera supprimé de Dart Sass. Utilise `@use`.
:::

:::ou[Dans mes projets]
`projet-scss` (8 partials) et `sass_exercice_4` (7 partials : base, nav, header, button, content, card, footer).
:::

## Les fonctions modernes : color et math

:::quoi
Sass calcule pendant la compilation : `color.adjust()` éclaircit ou fonce une couleur, `math.div()` divise. On charge ces **modules** avec `@use 'sass:color'` et `@use 'sass:math'`.
:::

:::exemple
```scss
@use 'sass:color';
@use 'sass:math';

.btn:hover {
  background-color: color.adjust($couleur-principale, $lightness: -10%);
}
.btn { border-radius: math.div($border-radius, 2); } // et non $border-radius / 2
```
:::

:::piege
`darken()`, `lighten()` et la division avec `/` (vus dans `tp_scss`) sont **dépréciés** : la compilation affiche des avertissements. `darken($c, 10%)` = `color.adjust($c, $lightness: -10%)`.
:::

:::ou[Dans mes projets]
`_hero.scss`, `_features.scss` et `_team.scss` de `projet-scss` (déjà modernes) ; `tp_scss/environnement_propre` reste à moderniser.
:::
