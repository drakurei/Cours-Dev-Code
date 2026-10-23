---
titre: "PokéBistro : du TP React (Context, Reducer) au site pro (URL, pré-rendu)"
matiere: "projets"
type: "projet"
chapitre: 6
niveau: "intermediaire"
duree: 15
date: 2026-09-24
source: "TP du cours React (repo drakurei/tp-react-resto), puis refonte pour le portfolio (repo drakurei/PokeBistro)"
tags: ["react", "usecontext", "usereducer", "tailwind", "pre-rendu"]
essentiel: "PokéBistro est un restaurant Pokémon fictif. Le TP : une page, 28 plats filtrables grâce à un Context, un panier géré par un useReducer, Bootstrap et Tailwind ensemble. La version pro : 59 plats, plusieurs pages, filtres rangés dans l'URL, HTML pré-rendu puis hydraté par React, en ligne sur GitHub Pages."
retenir:
  - "Un Context partage un état avec tout ce qui est dans son Provider ; hors du Provider, on lit la valeur par défaut (null)."
  - "Un reducer est une fonction pure : il renvoie toujours un nouvel état, sans modifier l'ancien."
  - "Une règle CSS hors layer bat toujours une règle dans un layer : range Bootstrap dans son propre layer."
  - "Un fichier importé suit la base du site ; un chemin écrit en dur, non."
  - "Version pro : des filtres validés dans l'URL, un HTML pré-rendu puis hydraté."
definitions:
  - terme: "Context (React)"
    definition: "Un canal qui partage une valeur avec tous les composants placés dans son Provider, sans props intermédiaires."
    exemple: "const { tag, toggleTag } = useContext(FilterContext)"
  - terme: "Provider"
    definition: "Le composant qui fournit la valeur d'un Context à tous ses descendants."
    exemple: "FilterContext.Provider value={value} autour de {children}"
  - terme: "Reducer"
    definition: "Fonction pure (état, action) => nouvel état, utilisée avec useReducer."
  - terme: "dispatch"
    definition: "Fonction donnée par useReducer : elle envoie une action au reducer, qui calcule le nouvel état."
    exemple: "dispatch({ type: 'ADD_TO_CART', product })"
  - terme: "Cascade layer"
    definition: "Couche CSS déclarée avec @layer ; l'ordre des couches décide qui gagne, avant même la spécificité."
  - terme: "Query string"
    definition: "La partie ?cle=valeur d'une URL, lue avec URLSearchParams ou useSearchParams."
    exemple: "/menu?type=feu,eau&price=10-15"
  - terme: "Pré-rendu"
    definition: "Générer au build le HTML de chaque page, pour servir de vraies pages statiques."
  - terme: "Hydratation"
    definition: "React s'attache à un HTML déjà présent (hydrateRoot) pour le rendre interactif, sans le recréer."
flashcards:
  - q: "PokéBistro en une phrase ?"
    r: "Un restaurant Pokémon fictif en React : un TP avec filtres en Context et panier en useReducer, puis une version pro multipage avec filtres dans l'URL et HTML pré-rendu."
  - q: "Pourquoi un Context pour les filtres du TP ?"
    r: "La sidebar, les tags des cartes et la grille partagent les mêmes filtres : le Context évite de passer des props à chaque étage."
  - q: "Pourquoi useReducer pour le panier ?"
    r: "Toute la logique (ajouter, +1, −1, supprimer, vider) tient dans une seule fonction pure, facile à lire et à tester."
  - q: "Que fait DECREMENT_QUANTITY quand la quantité vaut 1 ?"
    r: "Il supprime la ligne : la quantité ne peut jamais valoir 0 ni devenir négative."
  - q: "Comment tu évites les doublons dans le panier ?"
    r: "ADD_TO_CART cherche le produit : s'il est déjà là, seule sa quantité augmente."
  - q: "Pourquoi Bootstrap écrasait Tailwind ?"
    r: "Tailwind 4 range son CSS dans des layers, et une règle hors layer gagne toujours. Bootstrap est donc importé dans son propre layer, avant utilities."
  - q: "Pourquoi le logo disparaissait une fois en ligne ?"
    r: "Un chemin /pokeball.svg écrit en dur n'est pas réécrit par Vite ; en important le fichier, Vite donne la bonne URL dans le sous-dossier."
  - q: "Comment la recherche ignore les accents ?"
    r: "normalize('NFD') sépare les accents des lettres, puis une regex les retire : « epice » trouve « épicé »."
  - q: "Pourquoi les filtres dans l'URL en version pro ?"
    r: "L'URL se partage, le bouton Retour marche, et l'accueil peut ouvrir la carte déjà filtrée."
  - q: "C'est quoi le pré-rendu de la version pro ?"
    r: "Au build, chaque route devient un vrai fichier HTML (74 pages) avec son titre et sa description ; React hydrate ensuite la page."
  - q: "Pourquoi le panier sauvegardé se charge après le montage ?"
    r: "Le premier rendu doit être identique au HTML pré-rendu (panier vide) : le localStorage est lu ensuite, dans un useEffect."
  - q: "Comment tu as obtenu les 28 images du TP ?"
    r: "Une planche unique de 7 × 4 plats, découpée en 28 PNG avec un petit script Python (Pillow), avec une coupe fixe vérifiée à l'œil."
quiz:
  - question: "Erreur : « Cannot destructure property 'search' of 'useContext(...)' as it is null ». Cause la plus probable ?"
    choix:
      - "Le Context n'est pas exporté"
      - "Le composant est rendu en dehors du FilterProvider"
      - "useState est mal importé"
      - "Le fichier products.js est vide"
    reponse: "Le composant est rendu en dehors du FilterProvider"
    explication: "Hors de son Provider, useContext renvoie la valeur par défaut, ici null : impossible d'y lire search."
  - question: "Panier : { items: [{ id: 1, quantity: 1 }] }. Que renvoie le reducer pour { type: 'DECREMENT_QUANTITY', id: 1 } ?"
    choix:
      - "{ items: [{ id: 1, quantity: 0 }] }"
      - "{ items: [] }"
      - "Une erreur"
      - "L'état sans changement"
    reponse: "{ items: [] }"
    explication: "Quand la quantité vaut 1, la ligne est retirée avec filter : la quantité ne passe jamais à 0."
  - question: "Bootstrap est importé hors layer, Tailwind dans le layer utilities. Qui gagne sur un même élément ?"
    choix:
      - "Tailwind, parce qu'il est chargé après"
      - "Bootstrap, parce qu'une règle hors layer passe devant les layers"
      - "Celui qui a la plus forte spécificité"
      - "Aucun des deux"
    reponse: "Bootstrap, parce qu'une règle hors layer passe devant les layers"
    explication: "Pour les déclarations normales, les styles sans layer l'emportent sur tous les layers, quelle que soit la spécificité."
  - question: "Le TP est servi sur drakurei.github.io/tp-react-resto/. Pourquoi src=\"/pokeball.svg\" y casse ?"
    choix:
      - "Le SVG est trop lourd"
      - "Le chemin pointe vers la racine du domaine, hors du dossier du site"
      - "GitHub Pages refuse les SVG"
      - "Il faudrait un PNG"
    reponse: "Le chemin pointe vers la racine du domaine, hors du dossier du site"
    explication: "/pokeball.svg devient drakurei.github.io/pokeball.svg, qui n'existe pas. Un import Vite donne la bonne URL."
  - question: "Version pro : que donne /menu?type=dragon, alors que « dragon » n'est pas un type connu ?"
    choix:
      - "La page plante"
      - "La valeur est ignorée : aucun filtre de type"
      - "Tous les plats s'affichent en type Dragon"
      - "Une redirection vers l'accueil"
    reponse: "La valeur est ignorée : aucun filtre de type"
    explication: "parseList ne garde que les valeurs présentes dans typesById : tout le reste est écarté sans bruit."
  - question: "À quoi sert hydrateRoot ?"
    choix:
      - "À vider la page avant de tout redessiner"
      - "À attacher React à un HTML déjà présent, sans le recréer"
      - "À précharger les images"
      - "À sauvegarder le panier"
    reponse: "À attacher React à un HTML déjà présent, sans le recréer"
    explication: "La page pré-rendue s'affiche tout de suite ; hydrateRoot branche ensuite les événements et l'état sur ce HTML."
  - question: "Quelle commande met en ligne la version pro sur GitHub Pages ?"
    choix:
      - "npm run dev"
      - "npm run deploy"
      - "npm run preview"
      - "git push origin gh-pages"
    reponse: "npm run deploy"
    explication: "predeploy lance build:pages (base /PokeBistro/), puis gh-pages publie dist/ sur la branche gh-pages."
exercices:
  - titre: "Les totaux du panier"
    niveau: "facile"
    enonce: "Écris totaux(items) qui renvoie { totalItems, totalPrice } pour une liste de lignes { price, quantity }."
    indices:
      - "reduce additionne en partant de 0 : reduce((somme, item) => somme + …, 0)."
      - "Le prix d'une ligne = price × quantity."
    solution: |
      ```js
      function totaux(items) {
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return { totalItems, totalPrice };
      }

      console.log(totaux([{ price: 12.9, quantity: 2 }, { price: 4.5, quantity: 1 }]));
      // { totalItems: 3, totalPrice: 30.3 }
      ```
  - titre: "INCREMENT et REMOVE"
    niveau: "moyen"
    enonce: "Écris un petit reducer cartReducer(state, action) qui gère INCREMENT_QUANTITY (+1 sur la ligne action.id) et REMOVE_FROM_CART (retire la ligne action.id), sans jamais modifier l'état reçu. Toute autre action renvoie l'état tel quel."
    indices:
      - "Un switch sur action.type."
      - "+1 : map qui renvoie { ...item, quantity: item.quantity + 1 } pour la bonne ligne, item sinon."
      - "Retirer : filter((item) => item.id !== action.id)."
    solution: |
      ```js
      function cartReducer(state, action) {
        switch (action.type) {
          case "INCREMENT_QUANTITY":
            return {
              ...state,
              items: state.items.map((item) =>
                item.id === action.id ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            };
          case "REMOVE_FROM_CART":
            return { ...state, items: state.items.filter((item) => item.id !== action.id) };
          default:
            return state;
        }
      }

      const avant = Object.freeze({ items: [Object.freeze({ id: 1, quantity: 1 })] });
      console.log(cartReducer(avant, { type: "INCREMENT_QUANTITY", id: 1 }).items[0].quantity); // 2
      console.log(avant.items[0].quantity); // 1 : l'état d'origine n'a pas bougé
      ```
  - titre: "Une recherche qui ignore les accents"
    niveau: "difficile"
    enonce: "Écris normaliser(texte) (minuscules, sans accents) puis correspond(produit, recherche) qui renvoie true si la recherche se trouve dans le nom, la catégorie, les mots-clés ou les tags du produit. Une recherche vide correspond toujours."
    indices:
      - "`normalize(\"NFD\")` puis `replace(/[\\u0300-\\u036f]/g, \"\")` retire les accents."
      - "Colle tous les champs dans une seule chaîne avec join(\" \"), puis normalise-la."
      - "Normalise aussi la recherche, après trim()."
    solution: |
      ```js
      function normaliser(texte) {
        return texte.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }

      function correspond(produit, recherche) {
        const cherche = normaliser(recherche.trim());
        const tout = normaliser([produit.name, produit.category, ...produit.keywords, ...produit.tags].join(" "));
        return cherche === "" || tout.includes(cherche);
      }

      const dracaufeu = { name: "Dracaufeu Spicy Menu", category: "Menu", keywords: ["feu"], tags: ["épicé"] };
      console.log(correspond(dracaufeu, "EPICE")); // true
      console.log(correspond(dracaufeu, "bento")); // false
      ```
projet:
  repo: "https://github.com/drakurei/PokeBistro"
  demo: "https://drakurei.github.io/PokeBistro/"
  stack: ["React", "Vite", "Bootstrap", "Tailwind CSS", "React Router", "GSAP", "Three.js"]
  statut: "termine"
  role: "Seul : le TP du cours React, puis sa refonte pro pour le portfolio"
---

## Le projet en un coup d'œil

:::quoi
Un restaurant **Pokémon** fictif. **Le TP** : une page, 28 plats filtrables et un panier en modal. **La version pro** : 59 plats, plusieurs pages, formules, commande et réservation simulées, HTML pré-rendu.
:::

:::exemple
```text
src/contexts/FilterContext.jsx   état des filtres : recherche, catégorie, tag, prix
src/contexts/CartContext.jsx     panier : useReducer + totaux
src/reducers/cartReducer.js      ADD_TO_CART, DECREMENT_QUANTITY, CLEAR_CART…
src/utils/filterProducts.js      applique les 4 filtres (fonction pure)
src/data/products.js             les 28 plats (image importée + infos)
src/components/                  Header, Sidebar, ProductGrid, ProductCard, Modal, Cart…
src/styles/globals.css           Bootstrap + Tailwind, rangés dans des layers
```
:::

:::piege
Ne modifie **jamais** le TP rendu : la version pro vit dans **un autre dossier et un autre dépôt** (`Projets/PokeBistro`). Le TP reste tel qu'il a été évalué.
:::

:::ou[Réutilisé ensuite]
Les règles du `cartReducer` du TP (pas de doublon, jamais de quantité 0) ont été gardées et enrichies dans la version pro, avec des tests Vitest ; les filtres, eux, sont passés du Context à l'URL.
:::

:::info[Ce que tu as fait]
**TP** : ta maquette, les composants, les deux Context, le reducer du panier, la modal, Bootstrap et Tailwind ensemble, les 28 images découpées dans une seule planche, la mise en ligne et les branches `main` / `develop` / `feature/` (repo `tp-react-resto`, démo https://drakurei.github.io/tp-react-resto/). **Version pro** : la refonte menée à partir de tes briefs (direction artistique, profiteroles Pokémon générées avec Gemini), en ligne sur GitHub Pages.
:::

## useContext : des filtres partagés sans props

:::quoi
Un **Context** partage un état avec tous les composants placés **dans son Provider**, sans passer de props à chaque étage. Les blocs de la sidebar, les tags des cartes et la grille lisent le même `FilterContext`.
:::

:::exemple
```jsx title="src/contexts/FilterContext.jsx"
const FilterContext = createContext(null)

export function FilterProvider({ children }) {
  const [tag, setTag] = useState('')
  // Un 2e clic sur le tag actif enlève le filtre
  const toggleTag = (value) => setTag(tag === value ? '' : value)
  const value = { tag, toggleTag /* + search, category, price, resetFilters… */ }
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}
```
:::

:::piege
`Cannot destructure property 'search' of 'useContext(...)' as it is null` : le composant lit le Context **hors** de son Provider. Entoure l'app avec `<FilterProvider>` dans `App.jsx`, puis recharge la page.
:::

:::ou[Dans le TP]
`const { tag, toggleTag } = useContext(FilterContext)` dans `TagBlock.jsx` et `ProductCard.jsx` ; `ProductGrid.jsx` appelle `filterProducts(products, { search, category, tag, price })`.
:::

## useReducer : la logique du panier au même endroit

:::quoi
Un **reducer** reçoit l'état actuel et une **action**, et renvoie un **nouvel** état. Les composants ne font plus que `dispatch({ type: 'ADD_TO_CART', product })`.
:::

:::exemple
```js title="src/reducers/cartReducer.js"
case 'DECREMENT_QUANTITY': {
  const existingItem = state.items.find((item) => item.id === action.id)
  if (!existingItem) return state
  // Dernière unité : la ligne disparaît (jamais de quantité 0)
  if (existingItem.quantity === 1) {
    return { ...state, items: state.items.filter((item) => item.id !== action.id) }
  }
  return { ...state, items: state.items.map((item) =>
    item.id === action.id ? { ...item, quantity: item.quantity - 1 } : item) }
}
```
:::

:::piege
Ne **modifie** jamais l'état reçu (`item.quantity--`) : React compare les références et ne verrait pas le changement. On renvoie une **copie** avec `...`, `map` et `filter`.
:::

:::ou[Dans le TP]
`CartContext.jsx` fait `useReducer(cartReducer, initialState)` et recalcule `totalItems` et `totalPrice` avec `reduce` à chaque rendu. Le « − Retirer » des cartes et le « − » de la modal envoient `DECREMENT_QUANTITY`.
:::

## Bootstrap et Tailwind ensemble

:::quoi
Tailwind 4 range son CSS dans des **cascade layers**. Une règle **hors** layer gagne toujours contre une règle **dans** un layer : Bootstrap, importé normalement, écrasait donc Tailwind. Solution : Bootstrap dans son propre layer, **avant** `utilities`.
:::

:::exemple
```css title="src/styles/globals.css"
@layer bootstrap, theme, base, components, utilities;

@import 'bootstrap/dist/css/bootstrap.min.css' layer(bootstrap);
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/utilities.css' layer(utilities);
```
:::

:::piege
Les deux partagent des noms de classes (`container`, `p-3`, `collapse`…) : avec cet ordre, Tailwind gagne (`p-3` = 0,75 rem). Et sans le Preflight de Tailwind, les images ne sont plus fluides : ajoute `h-auto`.
:::

:::ou[Dans le TP]
Bootstrap pour la structure (navbar, grille, cartes, modal), Tailwind pour le hero, les sections et les couleurs de la charte (`@theme`). `container-xl` remplace `container`.
:::

## Une image importée suit la base du site

:::quoi
Vite réécrit l'URL des fichiers **importés** selon la base du site. Une simple chaîne `"/pokeball.svg"` écrite dans le JSX, elle, n'est **jamais** réécrite.
:::

:::exemple
```jsx title="src/components/Footer/Footer.jsx"
import pokeball from '../../assets/pokeball.svg'

function Footer() {
  // ...
  return <img src={pokeball} alt="" width="36" height="36" />
}
```
:::

:::piege
Avec `src="/pokeball.svg"` en dur, le site en ligne cherche `drakurei.github.io/pokeball.svg`, hors du dossier `/tp-react-resto/` : 404, logo disparu. `public/` ne sert qu'aux fichiers dont tu écris l'URL toi-même.
:::

:::ou[Dans le TP]
Les 28 images des plats sont importées de la même façon dans `src/data/products.js`. `imageFallback.js` remplace une image cassée par la Poké Ball.
:::

## Version pro : les filtres dans l'URL

:::quoi
Dans la version pro, les filtres quittent le Context et vont dans l'**URL** (`/menu?type=feu&price=10-15`), lue avec `useSearchParams` de React Router. Une recherche devient **partageable**, et le bouton Retour fonctionne.
:::

:::exemple
```js title="src/hooks/useMenuFilters.js"
const [params, setParams] = useSearchParams()
const filters = useMemo(() => ({
  q: (params.get('q') ?? '').slice(0, MAX_QUERY),
  types: parseList(params.get('type'), typesById),
  price: priceRangesById[params.get('price')] ? params.get('price') : 'all',
  // + category, tags, diet, sort
}), [params])
```
:::

:::piege
Une URL peut contenir n'importe quoi (tapée à la main, ancien lien) : chaque valeur est **validée** contre la liste connue (`typesById`…), les inconnues sont ignorées.
:::

:::ou[Dans la version pro]
La page `/menu` et l'accueil, qui ouvre la carte déjà filtrée. `setParams` est appelé avec `replace: true` pour ne pas empiler une page d'historique à chaque frappe.
:::

## Version pro : pré-rendu, hydratation, mise en ligne

:::quoi
Au build, `scripts/prerender.mjs` rend chaque route avec React et écrit un vrai fichier HTML par page (74 pages). Dans le navigateur, React **s'attache** à ce HTML avec `hydrateRoot` au lieu de tout redessiner.
:::

:::exemple
```jsx title="src/main.jsx"
// "/" en local, "/PokeBistro/" sur GitHub Pages (voir .env.pages)
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')
const root = document.getElementById('root')
const app = <BrowserRouter basename={basename}><App /></BrowserRouter>
// Page pré-rendue : React s'attache au HTML. Sinon : rendu complet.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
```
:::

:::piege
Le premier rendu dans le navigateur doit être **identique** au HTML pré-rendu. Le panier sauvegardé n'est donc lu dans le localStorage **qu'après** le montage, dans un `useEffect`.
:::

:::ou[Pour lancer et publier]
`npm run dev` en local ; `npm run check` (lint, tests, build, budget de taille) ; `npm run deploy` lance `build:pages` puis publie `dist/` sur `gh-pages`. La base `/PokeBistro/` vient du fichier `.env.pages`, pas d'un argument de commande : aucun souci avec Git Bash.
:::
