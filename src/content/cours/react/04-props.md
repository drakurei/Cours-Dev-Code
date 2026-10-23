---
titre: "Les props : passer des données à un composant"
matiere: react
type: cours
chapitre: 4
niveau: debutant
duree: 9
date: 2026-09-22
source: "Cours live React (Discord)"
tags: [react, props, composants]
essentiel: "Les props sont les informations qu'un parent donne à un composant, écrites comme des attributs : même composant, contenus différents. Le composant les reçoit dans un objet, qu'on déstructure : function Article({ titre }). Une prop se lit, elle ne se modifie pas."
retenir:
  - "Une prop s'écrit comme un attribut quand on utilise le composant, par exemple titre=\"Bonjour\"."
  - "Le composant reçoit toutes ses props dans un objet ; la déstructuration sort directement les noms."
  - "Du texte entre guillemets, tout le reste entre accolades : nombre, variable, objet, tableau, fonction."
  - "Une prop se lit, elle ne se modifie jamais dans l'enfant."
  - "Ce qu'on écrit entre les balises d'un composant arrive dans la prop children."
definitions:
  - terme: "Prop"
    definition: "Une donnée passée à un composant par son parent, comme un attribut. Elle se lit, elle ne se modifie pas."
    exemple: "<Article titre=\"Nuit du jazz\" />"
  - terme: "Objet props"
    definition: "L'objet qui regroupe toutes les props reçues par un composant : props.titre, props.date…"
    exemple: "function Article(props) { return <h2>{props.titre}</h2> }"
  - terme: "Déstructuration"
    definition: "Écriture qui sort directement des propriétés d'un objet dans des variables du même nom."
    exemple: "function Article({ titre, date }) { … }"
  - terme: "children"
    definition: "La prop spéciale qui contient ce qu'on écrit entre la balise ouvrante et la balise fermante d'un composant."
    exemple: "<Button>Commander</Button>  // children = 'Commander'"
  - terme: "Valeur par défaut"
    definition: "La valeur qu'une prop prend quand le parent ne la passe pas. Elle s'écrit avec = dans la déstructuration."
    exemple: "function Button({ variant = 'primary' }) { … }"
flashcards:
  - q: "C'est quoi une prop ?"
    r: "Une donnée qu'un parent passe à un composant, écrite comme un attribut. Comme l'argument d'une fonction."
  - q: "Comment le composant lit-il la prop titre sans déstructuration ?"
    r: "`props.titre`, avec `function Article(props)`."
  - q: "Même chose avec la déstructuration ?"
    r: "`function Article({ titre })`, puis `{titre}` dans le JSX."
  - q: "Quand faut-il des accolades pour passer une prop ?"
    r: "Pour tout ce qui n'est pas du texte : nombre, variable, objet, tableau, fonction. `note={4}`, `article={article}`."
  - q: "Un enfant peut-il modifier une prop ?"
    r: "Non, il la lit seulement. Pour une valeur qui change, il faut un état (useState)."
  - q: "Je passe titre mais je lis props.title : que se passe-t-il ?"
    r: "`props.title` vaut `undefined` : rien ne s'affiche, sans erreur. Le nom doit être identique des deux côtés."
  - q: "Que contient la prop children ?"
    r: "Ce qui est écrit entre les balises du composant, par exemple le texte de `<Button>Commander</Button>`."
  - q: "Comment donner une valeur par défaut à une prop ?"
    r: "Avec = dans la déstructuration : `function Button({ variant = 'primary' })`."
  - q: "Comment mon-blog passe un article à la carte ?"
    r: "Tout l'objet en une seule prop : `<Article article={article} />`, puis `article.titre` dans la carte."
  - q: "L'analogie du moule à gâteau ?"
    r: "Le composant est le moule, les props sont le parfum : même moule, gâteaux différents."
quiz:
  - question: "Comment passer le nombre 4 dans la prop note ?"
    choix:
      - "`note=\"4\"`"
      - "`note={4}`"
      - "`note=4`"
    reponse: "`note={4}`"
    explication: "Entre guillemets, c'est le texte \"4\" ; sans rien, c'est une erreur. Un nombre se passe entre accolades."
  - question: "`function Article(titre) { return <h2>{titre}</h2> }` : que contient titre ?"
    choix:
      - "Le texte du titre"
      - "Tout l'objet props"
      - "undefined"
    reponse: "Tout l'objet props"
    explication: "Sans accolades, le premier paramètre reçoit l'objet props entier. Il faut écrire function Article({ titre })."
  - question: "Dans une carte, tu écris `article.titre = 'Autre titre'`. C'est…"
    choix:
      - "Une bonne façon de changer le titre"
      - "Interdit : une prop se lit, elle ne se modifie pas"
      - "Obligatoire pour mettre l'écran à jour"
    reponse: "Interdit : une prop se lit, elle ne se modifie pas"
    explication: "Les props appartiennent au parent. Une valeur qui doit changer à l'écran passe par un état (chapitre 6)."
  - question: "`<FilterBlock title=\"Tags\"><p>Les pastilles</p></FilterBlock>` : comment FilterBlock affiche-t-il le paragraphe ?"
    choix:
      - "Avec {title}"
      - "Avec {children}"
      - "Avec {props.p}"
      - "Il s'affiche tout seul"
    reponse: "Avec {children}"
    explication: "Ce qui est entre les balises arrive dans la prop children. Si le composant n'écrit pas {children}, le paragraphe n'apparaît pas."
  - question: "`function Button({ variant = 'primary' })` et on écrit `<Button>OK</Button>`. Que vaut variant ?"
    choix:
      - "undefined"
      - "'primary'"
      - "'OK'"
    reponse: "'primary'"
    explication: "variant n'est pas passé, donc il prend sa valeur par défaut. 'OK' est dans children."
  - question: "`<Article note=\"4\" />` puis `{note + 1}` dans la carte. Qu'est-ce qui s'affiche ?"
    choix:
      - "5"
      - "41"
      - "Une erreur"
    reponse: "41"
    explication: "\"4\" est un texte : + colle les deux, ce qui donne \"41\". Avec note={4}, on obtiendrait 5."
exercices:
  - titre: "Bonjour avec une prop"
    niveau: facile
    enonce: "Crée un composant Bonjour qui reçoit une prop prenom et affiche « Bonjour, prenom ! ». Utilise-le deux fois avec deux prénoms différents."
    indices:
      - "Déstructure la prop dans les paramètres : function Bonjour({ prenom })."
      - "Affiche-la avec {prenom}."
      - "Pour l'utiliser deux fois, il faut un parent : un fragment."
    solution: |
      ```jsx
      function Bonjour({ prenom }) {
        return <p>Bonjour, {prenom} !</p>
      }

      function App() {
        return (
          <>
            <Bonjour prenom="Jonathan" />
            <Bonjour prenom="Lina" />
          </>
        )
      }
      ```
  - titre: "Une carte d'article"
    niveau: moyen
    enonce: "Crée un composant Carte qui reçoit titre, date et image, et affiche l'image, le titre en h2 et la date. Utilise-le pour deux articles de mon-blog."
    indices:
      - "Trois props à déstructurer : { titre, date, image }."
      - "L'image : `<img src={image} alt={titre} />`, bien fermée."
      - "Le texte se passe entre guillemets, une variable entre accolades."
    solution: |
      ```jsx
      function Carte({ titre, date, image }) {
        return (
          <div className="col">
            <img className="img-fluid" src={image} alt={titre} />
            <h2 className="my-3">{titre}</h2>
            <p className="text-muted">{date}</p>
          </div>
        )
      }

      function App() {
        return (
          <div className="row">
            <Carte titre="Festival de l'été" date="12 juillet 2026" image="festival.jpg" />
            <Carte titre="Nuit du jazz à Paris" date="3 juillet 2026" image="jazz.jpg" />
          </div>
        )
      }
      ```
  - titre: "Un bouton réutilisable"
    niveau: difficile
    enonce: "Crée un composant Bouton qui affiche son children dans un button Bootstrap. Il reçoit une prop couleur ('primary' par défaut) qui donne la classe btn-couleur. Exemples : `<Bouton>Valider</Bouton>` est bleu, `<Bouton couleur=\"danger\">Supprimer</Bouton>` est rouge."
    indices:
      - "Déstructure children et couleur, avec une valeur par défaut pour couleur."
      - "La classe se construit en collant deux textes : 'btn btn-' + couleur."
      - "Le texte du bouton, c'est {children}."
    solution: |
      ```jsx
      function Bouton({ children, couleur = 'primary' }) {
        return (
          <button type="button" className={'btn btn-' + couleur}>
            {children}
          </button>
        )
      }

      function App() {
        return (
          <>
            <Bouton>Valider</Bouton>
            <Bouton couleur="danger">Supprimer</Bouton>
          </>
        )
      }
      ```
---

## Passer une prop

:::quoi
Une **prop** est une information qu'on **passe** à un composant, écrite **comme un attribut HTML**. Même composant, contenus différents.
:::

:::exemple
```jsx
// même composant, deux contenus différents
<Article titre="Festival de l'été" date="12 juillet 2026" />
<Article titre="Nuit du jazz à Paris" date="3 juillet 2026" />
```
:::

:::piege
Un composant qui affiche toujours le même texte en dur n'est pas réutilisable. Dès qu'un contenu change d'une fois à l'autre, c'est une **prop**.
:::

:::ou[Dans mon-blog]
`<Article />` est affiché 13 fois, une par article, avec un contenu différent à chaque fois.
:::

## Recevoir les props

:::quoi
Le composant reçoit toutes ses props dans **un objet**, appelé `props`. `props.titre` lit la valeur passée.
:::

:::exemple
```jsx
function Article(props) {
  return (
    <div className="col">
      <h2>{props.titre}</h2>
      <p>{props.date}</p>
    </div>
  )
}
```
:::

:::piege
Le nom doit être **identique** des deux côtés : passer `titre` et lire `props.title` donne `undefined`. Rien ne s'affiche, et il n'y a pas d'erreur.
:::

:::ou[Dans mon-blog]
Aucun composant n'écrit `props.` : tous utilisent la version courte de la notion suivante. Mais c'est bien cet objet que reçoit `Article` dans `src/components/Article.jsx`.
:::

## La déstructuration

:::quoi
Au lieu d'écrire `props.titre`, on **sort directement** les noms entre accolades dans les paramètres. Les deux écritures font exactement la même chose.
:::

:::exemple
```jsx
// avant
function Article(props) { return <h2>{props.titre}</h2> }

// après : on sort titre de l'objet props
function Article({ titre }) { return <h2>{titre}</h2> }
```
:::

:::piege
`function Article(titre)` sans accolades : `titre` contient **tout l'objet** props. L'afficher provoque l'erreur « Objects are not valid as a React child ».
:::

:::ou[Dans mon-blog]
Tous les composants qui reçoivent des props les déstructurent : `function MotsCles({ motsCles, actif, onClick })` dans `src/components/MotsCles.jsx`.
:::

## Texte ou accolades

:::quoi
Du **texte** se passe entre guillemets. Tout le reste (nombre, variable, objet, tableau, fonction) se passe **entre accolades**.
:::

:::exemple
```jsx
<Article titre="Bonjour" />            // du texte
<Article note={4} />                   // un nombre
<Article article={article} />          // une variable (ici tout un objet)
<MotsCles motsCles={motsCles} />       // un tableau
<SearchBar onChange={setRecherche} />  // une fonction (chapitre 8)
```
:::

:::piege
`note="4"` passe le **texte** "4", pas le nombre 4 : `note + 1` donnera "41".
:::

:::ou[Dans mes projets]
mon-blog, `src/App.jsx` : `<Article key={article.id} article={article} … />` passe tout l'objet en une seule prop. PokéBistro fait pareil : `<ProductCard product={product} />`.
:::

## Une prop se lit, elle ne se modifie pas

:::quoi
Les props appartiennent au **parent** : l'enfant les **lit** et les affiche, il ne les change jamais. Une valeur qui doit changer passe par un **état** (chapitre 6).
:::

:::exemple
```jsx
function Article({ article }) {
  // Faux : modifier une prop
  // article.titre = 'Nouveau titre'

  // Juste : la lire et l'afficher
  return <h2>{article.titre}</h2>
}
```
:::

:::piege
Envie de modifier une prop ? C'est le signe qu'il te faut un `useState`, dans l'enfant ou chez le parent.
:::

:::ou[Dans mon-blog]
Dans `src/components/Article.jsx`, `article` est seulement lu. Ce qui change (texte ouvert, J'aime) vit dans les états `ouvert` et `aime`.
:::

## La prop children

:::quoi
Ce que tu écris **entre** la balise ouvrante et la balise fermante d'un composant arrive dans une prop spéciale : **children**.
:::

:::exemple
```jsx title="src/components/FilterBlock/FilterBlock.jsx"
function FilterBlock({ title, children }) {
  return (
    <section className="filter-block">
      <h3>{title}</h3>
      {children}
    </section>
  )
}
// utilisation : <FilterBlock title="Tags">…les pastilles…</FilterBlock>
```
:::

:::piege
Si le composant n'écrit pas `{children}` dans son JSX, ce que tu mets entre ses balises **disparaît**, sans erreur.
:::

:::ou[Dans PokéBistro]
`FilterBlock.jsx` (la coque de chaque bloc de la sidebar) et `Button.jsx` (`<Button>Commander</Button>`) utilisent `children`.
:::

:::astuce
**Valeur par défaut** : `function Button({ variant = 'primary' })`. Si le parent ne passe pas `variant`, il vaut `'primary'`. C'est ce que fait `Button.jsx` dans PokéBistro.
:::
