---
titre: "JSX : du HTML dans le JavaScript"
matiere: react
type: cours
chapitre: 2
niveau: debutant
duree: 9
date: 2026-09-22
source: "Cours live React (Discord)"
tags: [react, jsx, bases]
essentiel: "Le JSX, c'est du HTML écrit dans le JavaScript, avec quelques règles. Un seul parent, toutes les balises fermées, className au lieu de class et style en objet. Les accolades insèrent du JavaScript."
retenir:
  - "Un composant renvoie un seul parent : une div ou un fragment vide."
  - "Toute balise est fermée, même img, br et input."
  - "Les accolades insèrent une expression JavaScript : une variable, un calcul, un appel de fonction."
  - "Les attributs passent en camelCase : class devient className, for devient htmlFor."
  - "style prend un objet JavaScript, d'où les doubles accolades."
definitions:
  - terme: "JSX"
    definition: "Syntaxe qui permet d'écrire du HTML dans le JavaScript. Vite la transforme en vrai JavaScript avant que le navigateur la lise."
    exemple: "const titre = <h1 className=\"titre\">Bonjour</h1>"
  - terme: "Expression"
    definition: "Un morceau de code qui produit une valeur : une variable, un calcul, un appel de fonction, un ternaire. C'est ce qu'on met entre accolades dans le JSX."
    exemple: "{articles.length * 2}"
  - terme: "Fragment"
    definition: "Une balise vide qui sert de parent unique sans ajouter de balise dans la page."
    exemple: "`<><h1>Titre</h1><p>Texte</p></>`"
  - terme: "camelCase"
    definition: "Écriture où chaque mot après le premier commence par une majuscule. Les attributs JSX et les propriétés de style s'écrivent ainsi."
    exemple: "`onClick`, `htmlFor`, `fontSize`, `backgroundColor`"
  - terme: "Balise vide (void element)"
    definition: "Une balise HTML sans contenu, comme img, br, hr ou input. En JSX, elle se ferme avec />."
    exemple: "<img src={url} alt=\"\" />"
  - terme: "Attribut booléen"
    definition: "Un attribut qui vaut vrai ou faux, comme disabled ou checked. En JSX, il reçoit true ou false entre accolades."
    exemple: "<button disabled={recherche === ''}>Chercher</button>"
flashcards:
  - q: "C'est quoi le JSX ?"
    r: "Du HTML écrit dans le JavaScript, que Vite transforme en vrai JavaScript."
  - q: "Combien d'éléments racine un composant peut-il renvoyer ?"
    r: "Un seul. Pour en grouper plusieurs : une `<div>` ou un fragment `<>…</>`."
  - q: "Comment s'écrit une balise img en JSX ?"
    r: "Fermée avec ` />` : `<img src={url} alt=\"…\" />`."
  - q: "Que signifient les accolades dans le JSX ?"
    r: "« Ici, du JavaScript » : on y met une expression, comme une variable ou un calcul."
  - q: "Peut-on écrire un if entre accolades dans le JSX ?"
    r: "Non : if est une instruction, pas une expression. On utilise un ternaire ou &&, ou un if avant le return."
  - q: "Que deviennent class et for en JSX ?"
    r: "`className` et `htmlFor`."
  - q: "Pourquoi style={{ }} a deux paires d'accolades ?"
    r: "Les extérieures disent « du JavaScript », les intérieures sont l'objet de style."
  - q: "Comment s'écrit font-size dans un objet style ?"
    r: "`fontSize`, en camelCase, avec une valeur en texte : `fontSize: '20px'`."
  - q: "Comment écrire un commentaire dans le JSX ?"
    r: "`{/* mon commentaire */}`"
  - q: "Que fait `<input disabled />` ?"
    r: "La même chose que `disabled={true}` : le champ est désactivé."
  - q: "« Adjacent JSX elements must be wrapped » : que faire ?"
    r: "Envelopper les balises côte à côte dans un seul parent, par exemple un fragment `<>…</>`."
quiz:
  - question: "Quelle écriture affiche l'image dont l'adresse est dans la variable url ?"
    choix:
      - "`<img src={url}>`"
      - "`<img src={url} />`"
      - "`<img src=\"{url}\" />`"
      - "`<img src=url />`"
    reponse: "`<img src={url} />`"
    explication: "La balise doit être fermée avec />, et la variable s'écrit entre accolades sans guillemets. Avec des guillemets, src vaudrait le texte {url}."
  - question: "Comment écrire font-size: 20px dans l'attribut style ?"
    choix:
      - "`style=\"font-size: 20px\"`"
      - "`style={{ fontSize: '20px' }}`"
      - "`style={{ font-size: '20px' }}`"
      - "`style=\"{{ fontSize: '20px' }}\"`"
    reponse: "`style={{ fontSize: '20px' }}`"
    explication: "style prend un objet JavaScript : doubles accolades, pas de guillemets autour, propriété en camelCase."
  - question: "Pourquoi écrit-on className au lieu de class ?"
    choix:
      - "Parce que class est un mot réservé du JavaScript"
      - "Parce que Bootstrap l'exige"
      - "Parce que class ne marche qu'avec Tailwind"
    reponse: "Parce que class est un mot réservé du JavaScript"
    explication: "Le JSX devient du JavaScript, où class sert à déclarer des classes. React utilise donc className."
  - question: "Tu écris deux balises côte à côte dans un return, sans parent. Que se passe-t-il ?"
    choix:
      - "Une erreur : il faut un seul élément parent"
      - "React les affiche l'une sous l'autre"
      - "Seule la première s'affiche"
    reponse: "Une erreur : il faut un seul élément parent"
    explication: "Un return renvoie une seule valeur. On enveloppe les balises dans une div ou un fragment `<>…</>`."
  - question: "Que peut-on mettre entre accolades dans le JSX ?"
    choix:
      - "Une instruction if"
      - "Une boucle for"
      - "Une expression, comme une variable ou un calcul"
    reponse: "Une expression, comme une variable ou un calcul"
    explication: "Les accolades attendent une valeur. Pour une condition : ternaire ou && ; pour une boucle : .map()."
  - question: "Comment écrire un commentaire au milieu du JSX ?"
    choix:
      - "`// commentaire`"
      - "`<!-- commentaire -->`"
      - "`{/* commentaire */}`"
    reponse: "`{/* commentaire */}`"
    explication: "Le commentaire HTML provoque une erreur et // s'afficherait comme du texte. On ouvre des accolades et on met un commentaire JS /* */."
  - question: "`<button disabled=\"false\">` : le bouton est-il cliquable ?"
    choix:
      - "Oui, disabled vaut false"
      - "Non, \"false\" entre guillemets est un texte, donc considéré comme vrai"
      - "Ça provoque une erreur de compilation"
    reponse: "Non, \"false\" entre guillemets est un texte, donc considéré comme vrai"
    explication: "Entre guillemets, c'est la chaîne \"false\", qui n'est pas vide. Pour un vrai booléen : disabled={false}."
exercices:
  - titre: "Du HTML au JSX"
    niveau: facile
    enonce: "Transforme ce HTML en JSX valide : `<label for=\"nom\" class=\"form-label\">Nom</label><br><input id=\"nom\" style=\"color: red\">`"
    indices:
      - "Il faut un seul parent : enveloppe le tout dans un fragment."
      - "for et class changent de nom, br et input doivent être fermés."
      - "style devient un objet : style={{ color: 'red' }}."
    solution: |
      ```jsx
      <>
        <label htmlFor="nom" className="form-label">Nom</label>
        <br />
        <input id="nom" style={{ color: 'red' }} />
      </>
      ```
  - titre: "Afficher des variables"
    niveau: moyen
    enonce: "Crée un composant Profil avec deux variables, prenom ('Jonathan') et age (21). Il affiche un titre « Bonjour Jonathan » et un paragraphe « L'an prochain, tu auras 22 ans », calculé à partir de age."
    indices:
      - "Déclare les variables dans la fonction, avant le return."
      - "Le calcul se fait directement dans les accolades : {age + 1}."
      - "Deux balises : il faut un parent."
    solution: |
      ```jsx
      function Profil() {
        const prenom = 'Jonathan'
        const age = 21

        return (
          <>
            <h1>Bonjour {prenom}</h1>
            <p>L'an prochain, tu auras {age + 1} ans</p>
          </>
        )
      }
      ```
  - titre: "Le Footer de mon-blog de mémoire"
    niveau: difficile
    enonce: "Réécris le composant Footer de mon-blog : un footer sombre (classes Bootstrap bg-dark text-white mt-5 py-4) avec un paragraphe centré « Copyright © 2026 - Mon Blog », où l'année se met à jour toute seule."
    indices:
      - "new Date().getFullYear() donne l'année en cours."
      - "Le symbole © peut s'écrire &copy; dans le JSX."
      - "N'oublie pas export default à la fin."
    solution: |
      ```jsx
      function Footer() {
        const annee = new Date().getFullYear()

        return (
          <footer className="bg-dark text-white mt-5 py-4">
            <p className="text-center mb-0">Copyright &copy; {annee} - Mon Blog</p>
          </footer>
        )
      }

      export default Footer
      ```
---

## Un seul élément parent

:::quoi
Un composant renvoie **un seul** élément racine. S'il y en a plusieurs, enveloppe-les dans une `<div>` ou dans un **fragment** `<>…</>`.
:::

:::exemple
```jsx
// Faux : deux balises côte à côte
return <h1>Bonjour</h1><p>Lorem ipsum</p>

// Juste : un fragment les enveloppe
return (
  <>
    <h1>Bonjour</h1>
    <p>Lorem ipsum</p>
  </>
)
```
:::

:::piege
Erreur « Adjacent JSX elements must be wrapped in an enclosing tag » : il manque un parent. Le fragment évite d'ajouter une `<div>` inutile dans la page.
:::

:::ou[Dans mon-blog]
`src/App.jsx` renvoie un fragment `<>…</>` qui contient `Nav`, `Header`, `main` et `Footer`.
:::

## Toute balise est fermée

:::quoi
Les balises vides (**void elements**) comme `img`, `br`, `hr` ou `input` se ferment avec ` />`.
:::

:::exemple
```jsx
<br />
<hr />
<input type="text" />
<img src={article.image} alt={article.titre} />
```
:::

:::piege
`<img>` sans `/` : Vite affiche « Expected corresponding JSX closing tag for 'img' ». Un composant sans contenu se ferme de la même façon : `<Footer />`.
:::

:::ou[Dans mon-blog]
`src/components/Article.jsx` : `<img src={article.image} className="card-img-top" alt={article.titre} />`.
:::

## Les accolades : du JavaScript dans le JSX

:::quoi
Entre `{ }`, tu mets une **expression** JavaScript : une variable, un calcul, un appel de fonction. Le résultat s'affiche.
:::

:::exemple
```jsx
const titre = 'Mon Blog'

<h1>{titre}</h1>                   // affiche Mon Blog
<p>{articles.length} articles</p>  // affiche 13 articles
<p>{prix * 2} €</p>                // un calcul
```
:::

:::piege
Pas de `if` ni de `for` entre accolades : ce sont des instructions, pas des expressions. Pour une condition, ternaire ou `&&` (chapitre 7) ; pour une boucle, `.map()` (chapitre 5).
:::

:::ou[Dans mon-blog]
`src/components/Footer.jsx` : `const annee = new Date().getFullYear()` puis `{annee}` dans le JSX, l'année se met à jour toute seule.
:::

## Les attributs en camelCase

:::quoi
Les attributs changent de nom et s'écrivent en **camelCase** : `class` devient `className`, `for` devient `htmlFor`, `onclick` devient `onClick`.
:::

:::exemple
```jsx
<h1 className="titre">Bonjour</h1>
<label htmlFor="search-input">Rechercher</label>
<td colSpan={2}>Total</td>
<button onClick={direBonjour}>Clique</button>
```
:::

:::piege
Avec `class`, React affiche un avertissement dans la console (« Did you mean `className`? ») : prends le réflexe **className**.
:::

:::ou[Dans PokéBistro]
`src/components/Sidebar/SearchBlock.jsx` : `<label htmlFor="search-input">` est relié à `<input id="search-input">`.
:::

## L'attribut style prend un objet

:::quoi
`style` ne prend pas du texte mais un **objet JavaScript**, d'où les doubles accolades. Les propriétés CSS passent en camelCase.
:::

:::exemple
```jsx
// Faux : du texte, comme en HTML
<h1 style="color: red; font-size: 20px">Titre</h1>

// Juste : { } extérieures = du JS, { } intérieures = l'objet
<h1 style={{ color: 'red', fontSize: '20px' }}>Titre</h1>
```
:::

:::piege
Pas de guillemets autour : `style="{{ … }}"` est faux. Et `font-size` devient `fontSize`.
:::

:::ou[Dans mes projets]
mon-blog, `src/components/MotsCles.jsx` : `style={{ top: '1rem' }}` sur la barre latérale. PokéBistro, `ProductCard.jsx` : la couleur du badge vient d'une variable, `style={{ backgroundColor: typeStyle.background, color: typeStyle.color }}`.
:::

## Les commentaires

:::quoi
Au milieu du JSX, un **commentaire** s'écrit entre accolades : `{/* … */}`.
:::

:::exemple
```jsx
<div>
  {/* ceci ne s'affiche pas */}
  <h1>Titre</h1>
</div>
```
:::

:::piege
`// commentaire` au milieu du JSX s'affiche **comme du texte** à l'écran. Au-dessus du `return`, dans le JavaScript normal, `//` marche.
:::

:::ou[Dans mon-blog]
`src/App.jsx` : `{/* la barre latérale passe sous les articles sur mobile (order-2) */}`.
:::

## Les attributs booléens

:::quoi
Un **attribut booléen** (`disabled`, `checked`, `required`) reçoit `true` ou `false` entre accolades. Écrire seulement le nom équivaut à `{true}`.
:::

:::exemple
```jsx
<input disabled={true} />    // désactivé
<input disabled />           // pareil, en raccourci
<input disabled={false} />   // actif
```
:::

:::piege
`disabled="false"` entre guillemets est un **texte** non vide, donc considéré comme vrai : le champ reste désactivé.
:::

:::ou[Dans PokéBistro]
`src/components/Sidebar/Sidebar.jsx` : `disabled={activeFiltersCount === 0}` grise « Réinitialiser les filtres » tant qu'aucun filtre n'est actif. `PriceBlock.jsx` : `checked={isChecked}` sur les boutons radio.
:::
