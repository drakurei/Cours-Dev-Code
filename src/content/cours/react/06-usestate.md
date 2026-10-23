---
titre: "Événements et useState : l'état d'un composant"
matiere: react
type: cours
chapitre: 6
niveau: debutant
duree: 11
date: 2026-09-23
source: "Cours live React (Discord)"
tags: [react, evenements, hooks, state, usestate]
essentiel: "Un événement s'écrit onClick={fonction} : on passe la fonction, on ne l'appelle pas. Une valeur qui change à l'écran doit être un état créé avec useState. On la change avec setX, jamais directement, et React redessine le composant."
retenir:
  - "Événement : onClick={fonction}, ou onClick={() => fonction(argument)} quand il y a un argument."
  - "Une valeur qui change à l'écran doit être un état : const [valeur, setValeur] = useState(depart)."
  - "On ne modifie jamais l'état directement : on appelle setX, et React redessine le composant."
  - "useState s'écrit en haut du composant, jamais dans un if ou une boucle."
  - "Input contrôlé : value={etat} et onChange={(e) => setEtat(e.target.value)}."
definitions:
  - terme: "Événement"
    definition: "Une action de l'utilisateur (clic, frappe au clavier, envoi de formulaire). En JSX, on y réagit avec onClick, onChange, onSubmit…"
    exemple: "<button onClick={direBonjour}>Clique</button>"
  - terme: "Objet événement"
    definition: "Le paramètre e reçu par la fonction d'un événement. e.target est l'élément concerné, e.target.value le texte d'un input."
    exemple: "onChange={(e) => console.log(e.target.value)}"
  - terme: "État (state)"
    definition: "Une valeur que React surveille. Quand elle change avec setX, React redessine le composant."
    exemple: "const [compte, setCompte] = useState(0)"
  - terme: "useState"
    definition: "Le hook qui crée un état. Il renvoie la valeur actuelle et la fonction pour la changer."
    exemple: "const [recherche, setRecherche] = useState('')"
  - terme: "Hook"
    definition: "Une fonction React dont le nom commence par use (useState, useContext…). Toujours appelée en haut d'un composant, ou d'un autre hook."
  - terme: "Rendu"
    definition: "L'exécution de la fonction du composant pour produire l'affichage. Elle est relancée à chaque changement d'état."
  - terme: "Input contrôlé"
    definition: "Un champ dont la valeur vient d'un état (value) et qui met cet état à jour quand on tape (onChange)."
    exemple: "<input value={recherche} onChange={(e) => setRecherche(e.target.value)} />"
flashcards:
  - q: "Comment réagir à un clic ?"
    r: "`onClick={maFonction}` : on passe la fonction, sans parenthèses."
  - q: "Comment passer un argument à la fonction du clic ?"
    r: "On l'enveloppe dans une flèche : `onClick={() => direBonjour('Jonathan')}`."
  - q: "Le clic se déclenche au chargement de la page : pourquoi ?"
    r: "`onClick={f()}` exécute f tout de suite. Écris `onClick={f}` ou `onClick={() => f(x)}`."
  - q: "Pourquoi une variable normale ne met pas l'écran à jour ?"
    r: "React ne la surveille pas : la changer ne redessine pas le composant. Il faut un état."
  - q: "Que renvoie useState(0) ?"
    r: "Un tableau de deux éléments : la valeur actuelle (0 au départ) et la fonction pour la changer."
  - q: "Comment changer l'état compte ?"
    r: "Avec `setCompte(nouvelleValeur)`, jamais avec `compte = …`."
  - q: "Où écrire useState ?"
    r: "En haut du composant. Jamais dans un if, une boucle ou une fonction imbriquée."
  - q: "Que fait React après un setX ?"
    r: "Il relance la fonction du composant (un nouveau rendu) avec la nouvelle valeur."
  - q: "Juste après setCompte(compte + 1), que contient compte ?"
    r: "Encore l'ancienne valeur. La nouvelle arrive au rendu suivant."
  - q: "Que contient e.target.value dans un onChange ?"
    r: "Le texte actuellement écrit dans le champ."
  - q: "Les deux attributs d'un input contrôlé ?"
    r: "`value={etat}` pour afficher l'état, `onChange={(e) => setEtat(e.target.value)}` pour le mettre à jour."
  - q: "Impossible de taper dans un input : pourquoi ?"
    r: "Il a un `value` mais pas de `onChange` : React le garde figé sur la valeur de l'état."
  - q: "Comment inverser un état booléen ?"
    r: "`setOuvert(!ouvert)` : le ! donne le contraire."
  - q: "Pourquoi chaque carte de mon-blog a son propre J'aime ?"
    r: "Le useState de aime est dans Article : chaque carte affichée a son propre état."
quiz:
  - question: "Quelle écriture exécute direBonjour au clic, et pas au chargement ?"
    choix:
      - "`onClick={direBonjour()}`"
      - "`onClick={direBonjour}`"
      - "`onClick=\"direBonjour()\"`"
    reponse: "`onClick={direBonjour}`"
    explication: "Avec les parenthèses, la fonction s'exécute pendant l'affichage. Une chaîne entre guillemets n'est pas une fonction : React ne peut pas l'exécuter."
  - question: "`const [compte, setCompte] = useState(0)` : que contient setCompte ?"
    choix:
      - "La valeur de départ"
      - "La fonction qui change compte et fait redessiner le composant"
      - "Une copie de compte"
    reponse: "La fonction qui change compte et fait redessiner le composant"
    explication: "useState renvoie [valeur, fonction]. Par convention, la fonction s'appelle set suivi du nom de la valeur."
  - question: "Pourquoi `let compte = 0` puis `compte++` au clic ne met pas l'écran à jour ?"
    choix:
      - "Parce que let est interdit en React"
      - "Parce que React ne surveille pas les variables normales"
      - "Parce qu'il faut écrire var"
    reponse: "Parce que React ne surveille pas les variables normales"
    explication: "Seul un état créé avec useState déclenche un nouveau rendu. Et même redessiné, let compte = 0 repartirait à 0."
  - question: "Un input a `value={recherche}` mais pas de onChange. Que se passe-t-il ?"
    choix:
      - "On peut taper normalement"
      - "Le champ est figé : impossible de taper"
      - "Le champ se vide à chaque frappe"
    reponse: "Le champ est figé : impossible de taper"
    explication: "L'input affiche toujours l'état, et rien ne met cet état à jour. Il faut onChange={(e) => setRecherche(e.target.value)}."
  - question: "`ouvert` vaut false. Que vaut-il après un clic sur `onClick={() => setOuvert(!ouvert)}` ?"
    choix:
      - "false"
      - "true"
      - "undefined"
    reponse: "true"
    explication: "!false donne true. Un deuxième clic redonnera false : c'est le bouton qui bascule."
  - question: "Où a-t-on le droit d'appeler useState ?"
    choix:
      - "En haut du composant"
      - "Dans un if, quand on en a besoin"
      - "Dans une boucle for"
      - "Dans la fonction appelée au clic"
    reponse: "En haut du composant"
    explication: "React retrouve chaque état grâce à l'ordre des appels : cet ordre doit être le même à chaque rendu. Donc jamais dans un if, une boucle ou une fonction appelée au clic."
  - question: "Dans `onChange={(e) => setRecherche(e.target.value)}`, qu'est-ce que e.target ?"
    choix:
      - "L'input qui a déclenché l'événement"
      - "Le composant App"
      - "La valeur de l'état recherche"
    reponse: "L'input qui a déclenché l'événement"
    explication: "e est l'objet événement, e.target l'élément concerné, et e.target.value son texte actuel."
exercices:
  - titre: "Un compteur"
    niveau: facile
    enonce: "Crée un composant Compteur : un bouton qui affiche le nombre de clics, en commençant à 0."
    indices:
      - "Il te faut un état qui commence à 0 : useState(0)."
      - "Dans onClick, appelle setCompte(compte + 1)."
      - "N'oublie pas import { useState } from 'react'."
    solution: |
      ```jsx
      import { useState } from 'react'

      function Compteur() {
        const [compte, setCompte] = useState(0)

        return (
          <button type="button" onClick={() => setCompte(compte + 1)}>
            {compte} clic(s)
          </button>
        )
      }

      export default Compteur
      ```
  - titre: "Lire la suite"
    niveau: moyen
    enonce: "Crée un composant Resume qui reçoit une prop texte. Fermé, le paragraphe a la classe texte-coupe ; ouvert, il ne l'a plus. Un bouton affiche « Lire la suite » ou « Réduire » et bascule entre les deux."
    indices:
      - "Un état booléen ouvert, qui commence à false."
      - "La classe et le texte du bouton se choisissent avec un ternaire : ouvert ? … : …"
      - "Le clic inverse l'état : setOuvert(!ouvert)."
    solution: |
      ```jsx
      import { useState } from 'react'

      function Resume({ texte }) {
        const [ouvert, setOuvert] = useState(false)

        return (
          <div>
            <p className={ouvert ? '' : 'texte-coupe'}>{texte}</p>
            <button type="button" className="btn btn-link p-0" onClick={() => setOuvert(!ouvert)}>
              {ouvert ? 'Réduire' : 'Lire la suite'}
            </button>
          </div>
        )
      }

      export default Resume
      ```
  - titre: "Un champ contrôlé avec compteur"
    niveau: difficile
    enonce: "Crée un composant Salutation : un input contrôlé pour le prénom, un paragraphe « Bonjour, prénom ! » qui se met à jour pendant la frappe, le nombre de caractères tapés (« 8 caractère(s) ») et un bouton Effacer qui vide le champ."
    indices:
      - "Un état prenom qui commence à '' (texte vide)."
      - "value={prenom} et onChange={(e) => setPrenom(e.target.value)} sur l'input."
      - "prenom.length donne le nombre de caractères ; Effacer appelle setPrenom('')."
    solution: |
      ```jsx
      import { useState } from 'react'

      function Salutation() {
        const [prenom, setPrenom] = useState('')

        return (
          <div>
            <input
              type="text"
              className="form-control"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
            <p>Bonjour, {prenom} !</p>
            <p>{prenom.length} caractère(s)</p>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setPrenom('')}>
              Effacer
            </button>
          </div>
        )
      }

      export default Salutation
      ```
---

## Réagir à un événement

:::quoi
Un **événement** s'écrit en camelCase (`onClick`, `onChange`) et reçoit une **fonction**. S'il faut un argument, on enveloppe l'appel dans une fonction fléchée.
:::

:::exemple
```jsx
<button onClick={direBonjour}>Clique</button>                    // la fonction elle-même
<button onClick={() => direBonjour('Jonathan')}>Clique</button>  // avec un argument
<input onChange={(e) => console.log(e.target.value)} />          // e.target = l'input
```
:::

:::piege
`onClick={direBonjour()}` avec les parenthèses **exécute la fonction tout de suite**, au chargement, pas au clic. `f` est la fonction, `f()` est son résultat.
:::

:::ou[Dans mon-blog]
`src/components/Article.jsx` : `onClick={() => onCategorie(article.categorie)}` sur le badge de catégorie, car il faut passer un argument.
:::

## Pourquoi une variable normale ne marche pas

:::quoi
Une variable normale change bien en mémoire, mais **React ne le sait pas** : il ne redessine pas le composant. Il faut un **état**.
:::

:::exemple
```jsx
function Compteur() {
  let compte = 0
  return <button onClick={() => compte++}>{compte}</button> // reste à 0 à l'écran
}
```
:::

:::piege
Même si React redessinait, `let compte = 0` repartirait à **0** : la fonction du composant est relancée en entier à chaque rendu.
:::

:::ou[Dans mon-blog]
Dans `src/App.jsx`, `recherche` est un état et pas un `let` : sinon la barre de recherche ne filtrerait rien. C'est aussi une question d'oral du récap (chapitre 9).
:::

## useState : une valeur que React surveille

:::quoi
`useState(depart)` renvoie **la valeur actuelle** et **la fonction pour la changer**. Quand tu appelles cette fonction, React **redessine** le composant.
:::

:::exemple
```jsx
import { useState } from 'react'

function Compteur() {
  const [compte, setCompte] = useState(0) // [valeur, fonction] = useState(départ)
  return <button onClick={() => setCompte(compte + 1)}>{compte}</button>
}
```
:::

:::piege
`compte = compte + 1` ou `compte++` ne change rien à l'écran (et `const` l'interdit). Toujours **setCompte(…)**.
:::

:::ou[Dans mes projets]
mon-blog : `recherche` et `categorie` dans `App.jsx`, `ouvert` et `aime` dans `Article.jsx`. PokéBistro : `isCartOpen` dans `App.jsx`, `isMenuOpen` dans `Header.jsx`.
:::

:::astuce
Convention de nom : `truc` et `setTruc`. La valeur de départ dépend du type : `0`, `''`, `false`, `[]`…
:::

## Les règles de l'état

:::quoi
`useState` s'écrit **en haut** du composant, jamais dans un `if` ou une boucle. Chaque changement d'état relance la fonction du composant : c'est un **nouveau rendu**.
:::

:::exemple
```jsx title="src/App.jsx"
function App() {
  // les états : toujours en haut du composant
  const [recherche, setRecherche] = useState('')
  const [categorie, setCategorie] = useState('Toutes')

  // recalculé à chaque rendu, avec les valeurs à jour
  const texteRecherche = recherche.trim().toLowerCase()
  // … puis le filtre, le message et le return
}
```
:::

:::piege
Juste après `setRecherche('jazz')`, `recherche` vaut **encore l'ancienne** valeur : la nouvelle n'arrive qu'au rendu suivant.
:::

:::ou[Dans mon-blog]
`src/App.jsx` : deux états en haut, puis `texteRecherche`, `articlesFiltres` et `message` recalculés à chaque frappe.
:::

:::attention
Un `useState` dans un `if` casse l'ordre des hooks. React s'arrête avec une erreur comme « Rendered more hooks than during the previous render ».
:::

## L'input contrôlé

:::quoi
L'input **affiche l'état** (`value`) et **le met à jour** quand on tape (`onChange`). On dit qu'il est **contrôlé** par React.
:::

:::exemple
```jsx
const [recherche, setRecherche] = useState('')

<input
  type="text"
  value={recherche}                              // ce que l'input affiche
  onChange={(e) => setRecherche(e.target.value)} // e.target.value = ce qu'on a tapé
/>
```
:::

:::piege
`value` sans `onChange` : **impossible de taper** dans le champ, il reste figé sur la valeur de l'état.
:::

:::ou[Dans mes projets]
mon-blog : `src/components/SearchBar.jsx` (l'état est dans `App`, chapitre 8). PokéBistro : `src/components/Sidebar/SearchBlock.jsx`, avec `value={search}` et `onChange={(event) => setSearch(event.target.value)}`.
:::

:::info
La boucle complète : tu tapes → `onChange` → `setRecherche` → React redessine → l'input affiche la nouvelle valeur → la liste filtrée est recalculée.
:::

## Le bouton qui bascule

:::quoi
Un état **booléen** et `!` pour l'inverser. C'est **le** pattern « ouvrir / fermer », « aimer / ne plus aimer ».
:::

:::exemple
```jsx title="src/components/Article.jsx"
const [aime, setAime] = useState(false)

<button
  type="button"
  className={aime ? 'btn btn-sm btn-danger' : 'btn btn-sm btn-outline-danger'}
  onClick={() => setAime(!aime)}
>
  <IconHeart plein={aime} /> {aime ? 'Aimé' : "J'aime"}
</button>
```
:::

:::piege
`setAime(true)` au lieu de `setAime(!aime)` : le bouton s'allume, mais ne s'éteint plus jamais.
:::

:::ou[Dans mes projets]
mon-blog, `Article.jsx` : « Lire la suite / Réduire » (`ouvert`) et le cœur (`aime`), un état **par carte**. PokéBistro, `Header.jsx` : le menu burger avec `setIsMenuOpen(!isMenuOpen)`.
:::
