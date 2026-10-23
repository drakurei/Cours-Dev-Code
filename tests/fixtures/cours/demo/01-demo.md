---
titre: "useState : l'état d'un composant"
matiere: demo
type: cours
niveau: Débutant
date: 2026-09-23
source: "Cours live React n°6 (Discord)"
tags: [react, hooks, state]
essentiel: "useState crée une valeur que React surveille. On la change avec setX et le composant se redessine."
retenir:
  - "On ne modifie jamais l'état directement : on appelle setX."
  - "Chaque appel à setX redessine le composant."
  - "L'état est propre à chaque composant."
definitions:
  - terme: "État (state)"
    definition: "Une valeur que React surveille ; la changer redessine le composant."
    exemple: "const [compte, setCompte] = useState(0)"
  - terme: "Hook"
    definition: "Une fonction spéciale de React dont le nom commence par **use**."
  - terme: "3 règles des hooks"
    definition: "Toujours au premier niveau du composant, jamais dans une condition ni une boucle."
flashcards:
  - q: "Que fait setCompte(5) ?"
    r: "Met l'état à **5** et React redessine le composant."
  - q: "Que renvoie `useState(0)` ?"
    r: "Un tableau de deux éléments : la valeur et la fonction pour la changer."
quiz:
  - question: "Pourquoi `let compte = 0` ne met pas l'écran à jour ?"
    choix:
      - "Parce que let est interdit en React"
      - "Parce que React ne surveille pas les variables normales"
      - "Parce qu'il faut écrire var"
    reponse: "Parce que React ne surveille pas les variables normales"
    explication: "Seul un état créé avec `useState` déclenche un nouveau rendu."
  - question: "Où a-t-on le droit d'appeler useState ?"
    choix:
      - "Dans une boucle"
      - "Au premier niveau du composant"
    reponse: "Au premier niveau du composant"
exercices:
  - titre: "Un compteur"
    niveau: facile
    enonce: "Crée un bouton qui affiche le **nombre de clics**."
    indices:
      - "Il te faut un état qui commence à 0."
      - "Dans onClick, appelle `setCompte(compte + 1)`."
    solution: |
      ```jsx title="Compteur.jsx"
      const [compte, setCompte] = useState(0)
      return <button onClick={() => setCompte(compte + 1)}>{compte}</button>
      ```
  - titre: "Remettre à zéro"
    niveau: moyen
    enonce: "Ajoute un second bouton qui remet le compteur à 0."
fichiers:
  - titre: "Slides du cours"
    chemin: "/media/demo/01-slides.pdf"
  - titre: "Icône de Manabi"
    chemin: "/icons/icon-512.png"
champ_invente_par_une_ia: "toléré et ignoré"
---

Ce cours sert de **démonstration** : il utilise tous les blocs du format.
Un chemin Windows reste du texte : C:\Users\jonat, une heure aussi : 10:30, et un sélecteur a:hover.

## Créer un état

:::quoi
`useState` crée une **valeur surveillée** et la **fonction** qui la change.
:::

:::exemple
```jsx title="App.jsx"
import { useState } from 'react'

export default function App() {
  const [compte, setCompte] = useState(0) // [!code highlight]
  return <p>{compte}</p>
}
```
:::

:::piege
`compte = 5` ne fait **rien** à l'écran : il faut `setCompte(5)`.
:::

:::ou[Dans mon-blog]
Le compteur de « J'aime » de chaque article.
:::

## Changer un état

:::quoi
On appelle la fonction **set** avec la nouvelle valeur.
:::

:::exemple
```js
setCompte(compte + 1) // [!code ++]
compte = compte + 1 // [!code --]
```
:::

:::astuce
Quand la nouvelle valeur dépend de l'ancienne, passe une fonction : `setCompte(c => c + 1)`.
:::

:::attention
Le nouvel état n'est visible qu'au **prochain rendu**.
:::

:::retenir
set → nouveau rendu → nouvelle valeur.
:::

:::info[Pour aller plus loin]
La documentation officielle de React explique le « snapshot » de l'état.
:::

:::nuage
Un bloc inconnu s'affiche comme une info.
:::

## Documents et images

![Fleur de sakura, l'icône de Manabi](/icons/icon-192.png)

::pdf{src="/media/demo/01-slides.pdf" titre="Slides du cours"}

| Fonction | Rôle |
| --- | --- |
| `useState` | crée l'état |
| `setX` | change l'état |

- [x] Lire le cours
- [ ] Faire l'exercice

<details><summary>HTML brut autorisé</summary>Les balises sûres passent ; <script>alert(1)</script> est retiré.</details>

## Quiz

Ce titre ne doit pas voler l'id de la section Quiz de la page[^1].

[^1]: Les ids réservés reçoivent un suffixe.
