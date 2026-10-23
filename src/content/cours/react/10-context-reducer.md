---
titre: "useContext et useReducer : l'état global de PokéBistro"
matiere: react
type: cours
chapitre: 10
niveau: intermediaire
duree: 12
date: 2026-09-24
source: "PokéBistro (TP React n°2)"
tags: [react, usecontext, usereducer, context, reducer]
essentiel: "Un Context partage une valeur avec tous les composants placés dans son Provider, sans props à chaque étage. Avec useReducer, un reducer reçoit l'état et une action, et renvoie le nouvel état. Dans PokéBistro, CartContext combine les deux pour gérer le panier."
retenir:
  - "Un Context se crée avec createContext, se fournit avec un Provider et se lit avec useContext."
  - "Hors de son Provider, useContext renvoie la valeur par défaut de createContext : ici null."
  - "Un reducer est une fonction pure : il renvoie un nouvel état, sans jamais modifier l'ancien."
  - "Les composants ne changent pas le panier eux-mêmes : ils envoient une action avec dispatch."
  - "Ce qui se calcule (totalItems, totalPrice) ne va pas dans l'état : on le recalcule à chaque rendu."
definitions:
  - terme: "Prop drilling"
    definition: "Passer une prop d'étage en étage, à travers des composants qui ne s'en servent pas."
    exemple: "Sans Context : App → Home → ProductGrid → ProductCard, juste pour donner addToCart à la carte"
  - terme: "Context"
    definition: "Un canal qui partage une valeur avec tous les composants placés dans son Provider, sans props intermédiaires."
    exemple: "const CartContext = createContext(null)"
  - terme: "Provider"
    definition: "Le composant qui fournit la valeur d'un Context à tous ses descendants, avec sa prop value."
    exemple: "<CartContext.Provider value={value}>{children}</CartContext.Provider>"
  - terme: "useContext"
    definition: "Le hook qui lit la valeur d'un Context, fournie par le Provider le plus proche au-dessus du composant."
    exemple: "const { totalItems } = useContext(CartContext)"
  - terme: "useReducer"
    definition: "Le hook qui gère un état avec un reducer. Il renvoie l'état actuel et la fonction dispatch."
    exemple: "const [state, dispatch] = useReducer(cartReducer, initialState)"
  - terme: "Reducer"
    definition: "Une fonction pure (état, action) => nouvel état, utilisée avec useReducer."
    exemple: "function cartReducer(state, action) { … }"
  - terme: "Action"
    definition: "Un objet qui décrit ce qui s'est passé : son type, écrit en majuscules par convention, et les données utiles."
    exemple: "{ type: 'REMOVE_FROM_CART', id: 3 }"
  - terme: "dispatch"
    definition: "La fonction donnée par useReducer : elle envoie une action au reducer, qui calcule le nouvel état."
    exemple: "dispatch({ type: 'CLEAR_CART' })"
flashcards:
  - q: "À quoi sert un Context ?"
    r: "À partager une valeur avec tous les composants placés dans son Provider, sans la passer en prop à chaque étage."
  - q: "C'est quoi le prop drilling ?"
    r: "Passer une prop d'étage en étage, à travers des composants qui ne s'en servent pas."
  - q: "Les 3 étapes d'un Context ?"
    r: "`createContext` pour le créer, un **Provider** pour le fournir, `useContext` pour le lire."
  - q: "Que renvoie useContext hors de son Provider ?"
    r: "La valeur par défaut donnée à `createContext`. Dans PokéBistro c'est `null`, d'où l'erreur « Cannot destructure property … as it is null »."
  - q: "Où sont placés les Providers de PokéBistro ?"
    r: "Dans `App.jsx` : `FilterProvider`, puis `CartProvider`, autour du Header, de la page, du Footer et du panier."
  - q: "Que renvoie `useReducer(cartReducer, initialState)` ?"
    r: "Un tableau de deux éléments : l'état actuel et la fonction `dispatch`."
  - q: "Que reçoit et que renvoie un reducer ?"
    r: "Il reçoit l'état actuel et une action. Il renvoie le nouvel état."
  - q: "Pourquoi un reducer ne doit-il jamais modifier state ?"
    r: "S'il renvoie le même objet, React ne voit aucun changement et l'écran ne bouge pas. Il renvoie toujours un nouvel objet."
  - q: "À quoi sert le default du switch dans cartReducer ?"
    r: "À renvoyer l'état tel quel : une action inconnue ne change rien."
  - q: "Tu envoies `{ type: 'ADD_TO_CARD' }` avec une faute de frappe. Que se passe-t-il ?"
    r: "Rien, et sans erreur : le type ne correspond à aucun `case`, donc le `default` renvoie l'état tel quel."
  - q: "Pourquoi la quantité d'un plat ne vaut jamais 0 dans PokéBistro ?"
    r: "Quand la quantité vaut 1, `DECREMENT_QUANTITY` supprime la ligne au lieu de passer à 0."
  - q: "Pourquoi totalItems n'est pas rangé dans l'état du panier ?"
    r: "Il se calcule à partir de `items` à chaque rendu. Il est donc toujours juste, sans risque d'oubli."
  - q: "Comment ProductCard ajoute un plat au panier ?"
    r: "Il lit `addToCart` avec `useContext(CartContext)`, puis appelle `addToCart(product)` au clic. C'est `addToCart` qui fait le `dispatch`."
  - q: "useState ou useReducer ?"
    r: "useState pour une valeur simple. useReducer quand plusieurs actions changent le même état avec des règles, comme le panier."
quiz:
  - question: "Un composant placé **hors** de CartProvider fait `useContext(CartContext)`. Que reçoit-il ?"
    choix:
      - "La valeur de CartProvider, comme les autres composants"
      - "La valeur par défaut de createContext, ici null"
      - "Un objet vide {}"
      - "Une erreur « CartContext is not defined »"
    reponse: "La valeur par défaut de createContext, ici null"
    explication: "Sans Provider au-dessus, React prend la valeur passée à createContext(null). Déstructurer null provoque ensuite l'erreur « Cannot destructure property »."
  - question: "Quel est le rôle de `<CartContext.Provider value={value}>` ?"
    choix:
      - "Il crée le Context"
      - "Il lit la valeur du Context"
      - "Il donne value à tous les composants placés à l'intérieur"
      - "Il envoie une action au reducer"
    reponse: "Il donne value à tous les composants placés à l'intérieur"
    explication: "createContext crée le Context, useContext le lit, dispatch envoie une action. Le Provider, lui, fournit la valeur à ses descendants."
  - question: "Le reducer reçoit `{ type: 'INCREMENT_QUANTITY', id: 2 }`. Quelle façon de faire est juste ?"
    choix:
      - "Trouver la ligne 2, faire quantity++, puis renvoyer state"
      - "Appeler dispatch une deuxième fois, depuis le reducer"
      - "Renvoyer un nouvel objet : items.map(…) avec une copie de la ligne 2"
    reponse: "Renvoyer un nouvel objet : items.map(…) avec une copie de la ligne 2"
    explication: "Un reducer est pur : il construit un nouvel état. Modifier state puis le renvoyer donne le même objet, et React ne redessine rien."
  - question: "Pourquoi le panier de PokéBistro n'a jamais deux lignes pour le même plat ?"
    choix:
      - "ADD_TO_CART cherche le plat : s'il est déjà là, seule sa quantité augmente"
      - "React refuse deux éléments avec la même key"
      - "Le bouton Ajouter se désactive après un clic"
      - "CartItem cache les doublons à l'affichage"
    reponse: "ADD_TO_CART cherche le plat : s'il est déjà là, seule sa quantité augmente"
    explication: "La règle « pas de doublon » vit dans le reducer, au même endroit pour tous les boutons Ajouter. Le bouton reste cliquable : il change seulement de couleur un instant."
  - question: "Le plat 9 n'est pas dans le panier. Que fait `dispatch({ type: 'DECREMENT_QUANTITY', id: 9 })` ?"
    choix:
      - "Il ajoute le plat 9 avec une quantité de -1"
      - "Il vide tout le panier"
      - "Il provoque une erreur"
      - "Rien : le reducer renvoie l'état tel quel"
    reponse: "Rien : le reducer renvoie l'état tel quel"
    explication: "DECREMENT_QUANTITY cherche d'abord la ligne. Si elle n'existe pas, il fait return state : rien ne change."
  - question: "Tu écris `dispatch({ type: 'ADD_TO_CARD', product })` par erreur. Que se passe-t-il ?"
    choix:
      - "Une erreur « Unknown action » dans la console"
      - "Rien : le default du switch renvoie l'état tel quel"
      - "Le plat est quand même ajouté"
    reponse: "Rien : le default du switch renvoie l'état tel quel"
    explication: "Aucun case ne correspond à 'ADD_TO_CARD'. Le default renvoie l'état, sans erreur : vérifie l'orthographe des types."
  - question: "Où calculer totalPrice, le prix total du panier ?"
    choix:
      - "Dans le Provider, avec reduce sur items, à chaque rendu"
      - "Dans un deuxième useState, mis à jour à chaque ajout"
      - "Dans chaque CartItem, puis on additionne à la main"
    reponse: "Dans le Provider, avec reduce sur items, à chaque rendu"
    explication: "Une valeur qui se déduit de l'état ne se stocke pas. Recalculée à chaque rendu, elle est toujours juste."
exercices:
  - titre: "Lire le panier avec useContext"
    niveau: facile
    enonce: "Crée `src/components/CartTotal/CartTotal.jsx` : un composant qui lit `totalPrice` dans `CartContext` et affiche « Total : 25,80 € » avec `formatPrice`."
    indices:
      - "Importe useContext depuis 'react' et CartContext depuis '../../contexts/CartContext'."
      - "Déstructure ce dont tu as besoin : const { totalPrice } = useContext(CartContext)."
      - "formatPrice vient de '../../utils/formatPrice' et donne « 25,80 € »."
    solution: |
      ```jsx
      import { useContext } from 'react'
      import CartContext from '../../contexts/CartContext'
      import formatPrice from '../../utils/formatPrice'

      function CartTotal() {
        const { totalPrice } = useContext(CartContext)

        return <p className="fw-bold mb-0">Total : {formatPrice(totalPrice)}</p>
      }

      export default CartTotal
      ```
      Il doit être affiché à l'intérieur de `CartProvider`, sinon `useContext` renvoie `null`.
  - titre: "Un reducer de compteur"
    niveau: moyen
    enonce: "En JavaScript pur, écris `compteurReducer(state, action)` pour l'état `{ valeur: 0 }`. Il gère PLUS (+1), MOINS (-1, jamais en dessous de 0) et RESET (retour à 0). Une action inconnue renvoie l'état tel quel. Teste-le avec node."
    indices:
      - "Un switch sur action.type, un case par action, et un default qui renvoie state."
      - "Chaque case renvoie un nouvel objet : { ...state, valeur: state.valeur + 1 }."
      - "Pour MOINS, si valeur vaut déjà 0, renvoie state sans rien changer."
    solution: |
      ```js
      const etatInitial = { valeur: 0 }

      function compteurReducer(state, action) {
        switch (action.type) {
          case 'PLUS':
            return { ...state, valeur: state.valeur + 1 }
          case 'MOINS':
            // jamais en dessous de 0
            if (state.valeur === 0) {
              return state
            }
            return { ...state, valeur: state.valeur - 1 }
          case 'RESET':
            return etatInitial
          default:
            return state
        }
      }

      let etat = compteurReducer(etatInitial, { type: 'PLUS' })
      etat = compteurReducer(etat, { type: 'PLUS' })
      console.log(etat.valeur) // 2
      console.log(compteurReducer(etatInitial, { type: 'MOINS' }).valeur) // 0
      console.log(compteurReducer(etat, { type: 'RESET' }).valeur) // 0
      ```
  - titre: "Une nouvelle action pour le panier"
    niveau: difficile
    enonce: "Ajoute à `cartReducer` l'action `SET_QUANTITY` (`{ type, id, quantity }`) : elle remplace la quantité d'une ligne, et une quantité de 0 ou moins supprime la ligne. Expose `setQuantity(id, quantity)` dans `CartProvider`, puis vérifie le reducer avec node."
    indices:
      - "Commence par le cas « 0 ou moins » : filter retire la ligne, comme REMOVE_FROM_CART."
      - "Sinon, map et une copie de la ligne : { ...item, quantity: action.quantity }."
      - "Dans le Provider : setQuantity: (id, quantity) => dispatch({ type: 'SET_QUANTITY', id, quantity })."
    solution: |
      ```js
      // src/reducers/cartReducer.js : un case de plus dans le switch
      case 'SET_QUANTITY':
        // 0 ou moins : la ligne disparaît, comme avec DECREMENT_QUANTITY
        if (action.quantity <= 0) {
          return {
            ...state,
            items: state.items.filter((item) => item.id !== action.id),
          }
        }
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.id ? { ...item, quantity: action.quantity } : item,
          ),
        }
      ```

      ```jsx
      // src/contexts/CartContext.jsx : une ligne de plus dans l'objet value
      setQuantity: (id, quantity) => dispatch({ type: 'SET_QUANTITY', id, quantity }),
      ```

      ```js
      // essai.js à la racine de poke-bistro, lancé avec : node essai.js
      import cartReducer from './src/reducers/cartReducer.js'

      const avant = {
        items: [{ id: 1, name: 'Pikachu Bento', price: 12.9, quantity: 2 }],
      }
      const cinq = cartReducer(avant, { type: 'SET_QUANTITY', id: 1, quantity: 5 })
      const zero = cartReducer(avant, { type: 'SET_QUANTITY', id: 1, quantity: 0 })

      console.log(cinq.items[0].quantity) // 5
      console.log(zero.items.length) // 0
      console.log(avant.items[0].quantity) // 2 : l'ancien état n'a pas bougé
      ```
---

## Le problème : les props à chaque étage

:::quoi
Faire descendre une valeur étage par étage, à travers des composants qui ne s'en servent pas : c'est le **prop drilling**.
:::

:::exemple
```jsx
// Sans Context : addToCart traverse Home et ProductGrid pour rien
// dans App.jsx
<Home addToCart={addToCart} />
// dans Home.jsx
<ProductGrid addToCart={addToCart} />
// dans ProductGrid.jsx
<ProductCard product={product} addToCart={addToCart} />
```
:::

:::piege
Le Context n'est pas un réflexe : entre un parent et son enfant direct, une **prop** suffit (chapitre 8).
:::

:::ou[Dans PokéBistro]
Le panier sert à quatre composants, à des étages différents :

- `Header` : le compteur ;
- `ProductCard` : Ajouter et Retirer ;
- `Cart` : la liste et le total ;
- `CartItem` : +, − et Supprimer.
:::

## createContext et le Provider

:::quoi
`createContext` crée un **Context**. Son **Provider** entoure des composants et leur donne une valeur, avec la prop `value`.
:::

:::exemple
```jsx title="src/contexts/CartContext.jsx"
// null : la valeur lue hors du Provider
const CartContext = createContext(null)

export function CartProvider({ children }) {
  // … le useReducer, les totaux et l'objet value (plus bas)
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export default CartContext
```
:::

:::piege
Sans `{children}` dans le return du Provider, tout ce qu'il entoure **disparaît** de la page.
:::

:::ou[Dans PokéBistro]
`src/App.jsx` : `<FilterProvider>` puis `<CartProvider>` entourent le `Header`, la page `Home`, le `Footer` et le `Cart`. Tout le site a donc accès aux deux Context.
:::

## useContext : lire le Context

:::quoi
**useContext** lit la valeur du Provider le plus proche, au-dessus du composant. On déstructure seulement ce dont on a besoin.
:::

:::exemple
```jsx title="src/components/Header/Header.jsx"
import { useContext, useState } from 'react'
import CartContext from '../../contexts/CartContext'

function Header({ onOpenCart }) {
  const { totalItems } = useContext(CartContext)
  // … puis {totalItems} dans le badge du bouton Panier
}
```
:::

:::piege
« Cannot destructure property 'totalItems' of 'useContext(...)' as it is null » : le composant est **hors** du Provider. Vérifie `App.jsx`.
:::

:::ou[Dans PokéBistro]
`ProductCard.jsx` lit les deux Context : `FilterContext` pour les tags, `CartContext` pour le panier. Quand une valeur change, chaque composant qui la lit se redessine.
:::

:::astuce
Pour aller plus loin : un **hook personnalisé** `useCart()`, qui fait `return useContext(CartContext)`, évite deux imports par fichier. PokéBistro ne l'utilise pas, et ce n'est pas obligatoire.
:::

## useReducer : l'état et dispatch

:::quoi
**useReducer** remplace `useState` quand plusieurs actions changent le même état. Il renvoie l'état et **dispatch**, qui envoie une action.
:::

:::exemple
```jsx title="src/contexts/CartContext.jsx"
const [state, dispatch] = useReducer(cartReducer, initialState)
// state vaut { items: [] } au départ

const value = {
  items: state.items,
  clearCart: () => dispatch({ type: 'CLEAR_CART' }), // envoie une action
}
```
:::

:::piege
Comme `setX`, **dispatch** ne change pas `state` tout de suite : le nouvel état arrive au rendu suivant.
:::

:::ou[Dans PokéBistro]
`CartContext.jsx` fait le `useReducer` du panier. Les filtres, eux, restent en `useState` dans `FilterContext.jsx` : quatre valeurs simples.
:::

:::info
C'était le défi du TP : remplacer le `useState` du panier par un `useReducer`, sans quantité négative.
:::

## Le reducer renvoie un nouvel état

:::quoi
Le **reducer** reçoit l'état actuel et une action, puis **renvoie le nouvel état**. C'est une fonction pure : il ne modifie jamais l'ancien.
:::

:::exemple
```js title="src/reducers/cartReducer.js"
function cartReducer(state, action) {
  switch (action.type) {
    case 'REMOVE_FROM_CART': // un nouvel objet, un nouveau tableau
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
      }
    case 'CLEAR_CART':
      return initialState
    default: // action inconnue : rien ne change
      return state
  }
}
```
:::

:::piege
`state.items.push(item)` puis `return state` : c'est le **même objet**, React ne voit aucun changement et l'écran ne bouge pas.
:::

:::ou[Dans PokéBistro]
`src/reducers/cartReducer.js` gère cinq actions : `ADD_TO_CART`, `INCREMENT_QUANTITY`, `DECREMENT_QUANTITY`, `REMOVE_FROM_CART` et `CLEAR_CART`. Chaque changement crée une copie avec `...state` et `map`, `filter` ou `[...state.items, newItem]`.
:::

:::info
En développement, **StrictMode** appelle le reducer **deux fois** pour repérer un reducer qui n'est pas pur. Les deux appels doivent donner le même résultat.
:::

## Une action par geste

:::quoi
Chaque geste de l'utilisateur devient une **action** : un objet avec un `type` et les données utiles. Le Provider cache les `dispatch` derrière des fonctions simples.
:::

:::exemple
```jsx title="src/contexts/CartContext.jsx"
const value = {
  // …
  addToCart: (product) => dispatch({ type: 'ADD_TO_CART', product }),
  decrementQuantity: (id) => dispatch({ type: 'DECREMENT_QUANTITY', id }),
  removeFromCart: (id) => dispatch({ type: 'REMOVE_FROM_CART', id }),
}
// dans ProductCard.jsx : addToCart(product), sans connaître le reducer
```
:::

:::piege
Une faute dans le type (`'ADD_TO_CARD'`) ne lève **aucune erreur** : l'action tombe dans le `default` et rien ne se passe.
:::

:::ou[Dans PokéBistro]
Le « − » de `CartItem` et le bouton « Retirer » de `ProductCard` envoient `DECREMENT_QUANTITY` ; la corbeille envoie `REMOVE_FROM_CART`. À 1, `DECREMENT_QUANTITY` supprime la ligne : la quantité ne vaut jamais 0.
:::

:::astuce
Les règles du panier vivent dans le reducer, pas dans les composants. « Pas de doublon » est écrit une seule fois, dans `ADD_TO_CART`.
:::

## Calculer au lieu de stocker

:::quoi
Une valeur qui se **déduit de l'état** ne va pas dans l'état : on la recalcule à chaque rendu. Elle est donc toujours juste.
:::

:::exemple
```jsx title="src/contexts/CartContext.jsx"
const totalItems = state.items.reduce(
  (sum, item) => sum + item.quantity,
  0,
)
const totalPrice = state.items.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0,
)
```
:::

:::piege
Un `totalItems` rangé dans l'état devrait changer dans **chaque** action : un oubli, et le compteur du header ment.
:::

:::ou[Dans PokéBistro]
`Header.jsx` affiche `totalItems` sur le bouton Panier et `Cart.jsx` affiche `totalPrice`. Même idée pour `getQuantity(id)` : `ProductCard.jsx` l'appelle pour afficher « 2 dans le panier ».
:::
