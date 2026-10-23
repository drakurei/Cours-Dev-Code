---
titre: "QuickList : mon projet fil rouge, la maquette avant le code"
matiere: "projets"
type: "projet"
chapitre: 3
niveau: "debutant"
duree: 12
date: 2026-07-31
source: "Projet fil rouge, dossier Projets/Shopping_App (design doc, plan, maquette, branche feat/phase-1-front)"
tags: ["javascript", "accessibilite", "tdd", "maquette", "localstorage"]
essentiel: "QuickList est une appli de liste de courses : ajouter, cocher, supprimer un produit. La phase 1 est un front en HTML, CSS et JavaScript natif avec le localStorage ; la phase 2 mettra une API et une base de données à la place. Règle du projet : chaque écran est maquetté et validé avant d'être codé."
retenir:
  - "La maquette est validée d'abord, le code vient ensuite : on ne refait pas le travail."
  - "L'accessibilité commence dans le HTML : un label (même caché), un aria-label sur chaque bouton icône, aria-expanded."
  - "TDD : un test qui échoue, puis le code qui le fait passer."
  - "Le texte saisi passe par textContent, jamais par innerHTML."
  - "Trois modules : données (storage), affichage (ui), orchestration (app) ; la phase 2 ne changera que les données."
definitions:
  - terme: "Projet fil rouge"
    definition: "Projet individuel mené tout au long de la formation et présenté au jury."
  - terme: "Mobile-first"
    definition: "On écrit d'abord le CSS du petit écran, puis on ajoute des media queries min-width pour les écrans plus grands."
    exemple: "@media (min-width: 1024px) { .side { display: flex; } }"
  - terme: "TDD (Test-Driven Development)"
    definition: "Développement piloté par les tests : un test qui échoue d'abord, puis le code minimal qui le fait passer, puis on nettoie."
  - terme: "aria-expanded"
    definition: "Attribut qui indique aux lecteurs d'écran si l'élément contrôlé (menu, formulaire) est ouvert (true) ou fermé (false)."
  - terme: "Classe visually-hidden"
    definition: "Classe CSS qui cache un élément à l'œil mais le laisse lisible par les lecteurs d'écran."
  - terme: "Maquette cliquable"
    definition: "Prototype HTML / CSS qui montre les écrans et la navigation, sans la vraie logique."
  - terme: "Freemium"
    definition: "Modèle où la base est gratuite (par exemple quelques listes) et où les fonctions en plus sont payantes (Premium)."
flashcards:
  - q: "QuickList en une phrase ?"
    r: "Une appli de liste de courses en JS natif : ajouter, cocher et supprimer des produits gardés dans le localStorage ; une API les remplacera en phase 2."
  - q: "Pourquoi les maquettes avant le code ?"
    r: "Pour valider chaque écran avant de le coder et ne pas refaire le travail. Le code de la phase 1 attend sur la branche feat/phase-1-front."
  - q: "Quelles règles « utilisable par tous » tu t'es fixées ?"
    r: "Cibles d'au moins 48 px, texte d'au moins 17 px, contrastes AA, une action principale par écran, 2 clics maximum pour ajouter un produit."
  - q: "Quels sont les 3 modules JS prévus ?"
    r: "storage.js (les données), ui.js (l'affichage du DOM) et app.js (les événements et la logique)."
  - q: "Comment tu testes sans bibliothèque ?"
    r: "Un mini harnais maison (tests/helpers.js : test, assertEqual, assertTrue) et une page tests.html qui affiche chaque résultat."
  - q: "Comment tu évites la faille XSS sur le nom d'un produit ?"
    r: "Le nom est inséré avec textContent, jamais innerHTML ; un test vérifie qu'une balise img tapée dans le nom ne crée aucune image."
  - q: "Que se passe-t-il si le localStorage est bloqué ?"
    r: "storage.js le détecte au démarrage et garde la liste en mémoire, avec un bandeau qui prévient que rien ne sera conservé."
  - q: "Quelle est la suite prévue ?"
    r: "Une API et une base de données, puis comptes, tableau de bord, listes multiples en freemium, Premium en paiement test, catalogue de vrais produits et favoris."
  - q: "Pourquoi un serveur local pour tester ?"
    r: "Les modules ES (type=\"module\") ne se chargent pas en file:// ; python -m http.server suffit."
  - q: "Que dit le design doc sur le champ produit ?"
    r: "Un champ vide ou fait d'espaces est refusé avec un message, et un nom fait au maximum 80 caractères."
  - q: "Et l'ancien projet de liste de courses en PHP fait en binôme ?"
    r: "Il sert seulement de référence fonctionnelle : son code n'est pas réutilisé, QuickList repart de zéro."
quiz:
  - question: "Tu veux cacher le label « Nom du produit » à l'œil, mais pas aux lecteurs d'écran. Que fais-tu ?"
    choix:
      - "display: none sur le label"
      - "La classe visually-hidden sur le label"
      - "Supprimer le label et garder le placeholder"
      - "visibility: hidden sur le label"
    reponse: "La classe visually-hidden sur le label"
    explication: "display: none et visibility: hidden cachent aussi le label aux lecteurs d'écran, et un placeholder ne remplace pas un label."
  - question: "En TDD, quelle est la première étape ?"
    choix:
      - "Écrire le code de la fonctionnalité"
      - "Écrire un test qui échoue"
      - "Déployer une première version"
      - "Rédiger la documentation"
    reponse: "Écrire un test qui échoue"
    explication: "On vérifie d'abord que le test échoue (ici : storage.js n'existe pas encore), puis on écrit le code qui le fait passer."
  - question: "À quoi sert aria-expanded=\"false\" sur le bouton + ?"
    choix:
      - "À désactiver le bouton"
      - "À dire que le formulaire qu'il ouvre est fermé"
      - "À agrandir la zone de clic"
      - "À cacher le bouton sur mobile"
    reponse: "À dire que le formulaire qu'il ouvre est fermé"
    explication: "Le lecteur d'écran annonce « réduit » ; app.js passera la valeur à true quand le formulaire s'ouvre."
  - question: "Pourquoi le nom d'un produit doit passer par textContent ?"
    choix:
      - "C'est plus rapide qu'innerHTML"
      - "Le texte n'est jamais interprété comme du HTML : pas de faille XSS"
      - "innerHTML ne marche pas dans un li"
      - "textContent garde la mise en forme"
    reponse: "Le texte n'est jamais interprété comme du HTML : pas de faille XSS"
    explication: "Avec innerHTML, un nom comme `<img src=x onerror=alert(1)>` exécuterait du JavaScript."
  - question: "Où se trouve le code de la phase 1 ?"
    choix:
      - "Sur la branche master"
      - "Sur la branche feat/phase-1-front"
      - "Dans le dossier maquettes/"
      - "Sur GitHub Pages"
    reponse: "Sur la branche feat/phase-1-front"
    explication: "master contient la doc et la maquette ; le code est en pause sur feat/phase-1-front, en attendant la validation des écrans."
  - question: "En mobile-first, la règle pour les grands écrans s'écrit…"
    choix:
      - "@media (max-width: 1024px)"
      - "@media (min-width: 1024px)"
      - "@media (orientation: portrait)"
    reponse: "@media (min-width: 1024px)"
    explication: "Le CSS de base vise le mobile ; min-width ajoute des règles à partir d'une certaine largeur, comme la barre latérale de la maquette."
exercices:
  - titre: "Valider le nom d'un produit"
    niveau: "facile"
    enonce: "Écris validerNom(texte) qui renvoie un message d'erreur si le nom est vide, fait d'espaces ou plus long que 80 caractères, et null si le nom est correct."
    indices:
      - "trim() enlève les espaces au début et à la fin."
      - "Teste d'abord le cas vide, puis la longueur."
    solution: |
      ```js
      function validerNom(texte) {
        const nom = texte.trim();
        if (nom === "") return "Le nom du produit ne peut pas être vide.";
        if (nom.length > 80) return "80 caractères maximum.";
        return null;
      }

      console.log(validerNom("   "));    // "Le nom du produit ne peut pas être vide."
      console.log(validerNom("Pommes")); // null
      ```
  - titre: "Le module storage.js"
    niveau: "moyen"
    enonce: "Écris les quatre fonctions de storage.js pour faire passer les tests de tests/storage.test.js : getItems(), addItem(name), toggleItem(id), removeItem(id). Les produits sont rangés sous la clé quicklist.items, au format { id, name, checked, createdAt }."
    indices:
      - "Deux petites fonctions internes aident : load() (lire + JSON.parse dans un try/catch) et save(items)."
      - "crypto.randomUUID() fabrique un id unique."
      - "removeItem garde tous les produits sauf celui qui a cet id : filter."
    solution: |
      ```js
      const STORAGE_KEY = "quicklist.items";

      function load() {
        try {
          return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
        } catch {
          return []; // données corrompues : liste vide
        }
      }

      function save(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }

      export function getItems() {
        return load();
      }

      export function addItem(name) {
        const items = load();
        const item = { id: crypto.randomUUID(), name, checked: false, createdAt: new Date().toISOString() };
        items.push(item);
        save(items);
        return item;
      }

      export function toggleItem(id) {
        const items = load();
        const item = items.find((i) => i.id === id);
        if (item) {
          item.checked = !item.checked;
          save(items);
        }
      }

      export function removeItem(id) {
        save(load().filter((i) => i.id !== id));
      }
      ```
  - titre: "Afficher un produit sans faille XSS"
    niveau: "difficile"
    enonce: "Écris createItemElement(item, { onToggle, onRemove }) pour ui.js : elle renvoie un li avec une case à cocher et le nom dans un label, et un bouton « Supprimer » avec un aria-label. Le li a la classe checked si le produit est coché. Aucun innerHTML."
    indices:
      - "Fabrique chaque élément avec document.createElement, puis assemble-les avec append."
      - "Le nom va dans un span avec textContent."
      - "Branche les événements : change sur la case appelle onToggle(item.id), click sur le bouton appelle onRemove(item.id)."
    solution: |
      ```js
      export function createItemElement(item, { onToggle, onRemove }) {
        const li = document.createElement("li");
        li.className = "shopping-item" + (item.checked ? " checked" : "");

        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.checked;
        checkbox.addEventListener("change", () => onToggle(item.id));

        const name = document.createElement("span");
        name.textContent = item.name; // jamais innerHTML
        label.append(checkbox, name);

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "btn-remove";
        removeBtn.setAttribute("aria-label", `Supprimer ${item.name}`);
        removeBtn.textContent = "Supprimer";
        removeBtn.addEventListener("click", () => onRemove(item.id));

        li.append(label, removeBtn);
        return li;
      }
      ```
projet:
  stack: ["HTML", "CSS", "JavaScript", "Modules ES", "localStorage"]
  statut: "en-cours"
  role: "Seul, projet fil rouge de la formation"
---

## Le projet en un coup d'œil

:::quoi
QuickList est une appli de **liste de courses** : ajouter, cocher, supprimer un produit, et une page contact. **Phase 1** : front en JS natif + localStorage. **Phase 2** : une API et une base de données à la place du localStorage.
:::

:::exemple
```text
maquettes/index.html   maquette cliquable des 7 écrans          (faite)
index.html             page liste : en-tête, liste, formulaire  (faite)
css/style.css          styles mobile-first                      (fait)
tests/                 mini harnais de tests dans le navigateur (fait)
js/storage.js          données : lire / écrire le localStorage  (prévu)
js/ui.js               affichage : créer les éléments du DOM    (prévu)
js/app.js              chef d'orchestre : les événements        (prévu)
contact.html           page contact : e-mail, téléphone         (prévue)
```
:::

:::piege
Coder un écran avant d'avoir validé sa maquette, c'est risquer de tout refaire. Le code de la phase 1 est donc **en pause** sur la branche `feat/phase-1-front`.
:::

:::ou[Réutilisé ensuite]
Le découpage données / affichage / orchestration permettra de brancher l'API en phase 2 **sans toucher** à l'interface : seul `storage.js` changera.
:::

:::info[Ce que tu as fait]
Le design doc et le plan d'implémentation, la maquette cliquable responsive des 7 écrans (liste, contact, connexion, tableau de bord, catalogue, favoris, premium) en trois versions, la page liste en HTML et CSS, et les tests de `storage.js` écrits **avant** le code.
:::

## La maquette avant le code

:::quoi
Chaque écran est **maquetté puis validé** avant d'être codé. La maquette `maquettes/index.html` montre les 7 écrans, avec une **barre latérale** sur ordinateur et un **dock** en bas sur mobile.
:::

:::exemple
```css title="maquettes/index.html"
.shell{display:grid;min-height:100vh}
@media(min-width:1024px){.shell{grid-template-columns:264px 1fr}}

/* --- Sidebar desktop --- */
.side{display:none}
@media(min-width:1024px){
  .side{display:flex;flex-direction:column;gap:8px;padding:24px 18px}
}
```
:::

:::piege
Une maquette jolie mais difficile à utiliser rate sa cible. Tu as fixé les règles **avant** le design : cibles d'au moins 48 px, texte d'au moins 17 px, une action principale par écran.
:::

:::ou[Dans QuickList]
Le principe « utilisable par tous, vite » du design doc : l'appli doit marcher aussi pour des personnes âgées ou peu à l'aise avec le numérique.
:::

## Un HTML accessible dès le départ

:::quoi
Un champ a toujours un **label**, même caché à l'œil. Un bouton icône a un `aria-label`. Le bouton qui ouvre le formulaire dit s'il est ouvert avec `aria-expanded`.
:::

:::exemple
```html title="index.html"
<form id="add-form" class="add-form" hidden>
  <label for="product-name" class="visually-hidden">Nom du produit</label>
  <input type="text" id="product-name" maxlength="80" autocomplete="off">
  <button type="submit" class="btn-add">Ajouter</button>
</form>
<button type="button" id="toggle-form-btn" class="nav-add-btn"
        aria-label="Ajouter un produit" aria-expanded="false">+</button>
```
:::

:::piege
`display: none` cache **aussi** le label aux lecteurs d'écran. Pour le cacher seulement à l'œil, utilise la classe `.visually-hidden`.
:::

:::ou[Dans QuickList]
La barre basse de `index.html` : lien vers la liste (`aria-current="page"`), bouton +, lien contact. L'anneau de focus utilise `:focus-visible` dans `css/style.css`.
:::

## Les tests avant le code

:::quoi
En **TDD**, on écrit d'abord un test qui **échoue**, puis le code qui le fait **passer**. Ici, un mini harnais maison affiche chaque résultat dans une page, sans aucune bibliothèque.
:::

:::exemple
```js title="tests/storage.test.js"
import { test, assertEqual } from './helpers.js';
import { getItems, addItem, toggleItem } from '../js/storage.js';

test('storage : toggleItem coche puis décoche', () => {
  localStorage.removeItem('quicklist.items');
  const it = addItem('Pain');
  toggleItem(it.id);
  assertEqual(getItems()[0].checked, true);
});
```
:::

:::piege
Un test qui passe du premier coup ne prouve rien. Vérifie d'abord qu'il **échoue** : ici, `js/storage.js` n'existe pas encore, la console affiche une erreur 404.
:::

:::ou[Dans QuickList]
`tests/tests.html` charge `storage.test.js` (6 tests : liste vide, ajout, relecture, cocher, supprimer, données corrompues). Écrire `js/storage.js` est la prochaine étape du plan.
:::

## Un stockage qui ne casse jamais (prévu)

:::quoi
Le plan prévoit un `storage.js` qui **teste** le localStorage au démarrage et travaille **en mémoire** s'il est bloqué (navigation privée stricte, quota plein).
:::

:::exemple
```js
function storageAvailable() {
  try {
    localStorage.setItem('__quicklist_test__', '1');
    localStorage.removeItem('__quicklist_test__');
    return true;
  } catch {
    return false;
  }
}
export const isPersistent = storageAvailable();
```
:::

:::piege
Si `isPersistent` vaut `false`, l'utilisateur doit le **savoir** : un bandeau prévient que les produits ne seront pas conservés.
:::

:::ou[Dans QuickList]
Plan `docs/superpowers/plans/2026-07-31-quicklist-front.md`, tâche 3. Le bandeau `#storage-warning` existe déjà dans `index.html`, caché avec `hidden`.
:::

## Lancer le projet

:::quoi
Pas de build : un petit **serveur local** suffit, car les modules ES ne se chargent pas en `file://`.
:::

:::exemple
```bash
cd Shopping_App
git checkout feat/phase-1-front   # le code de la phase 1
python -m http.server 8123
# liste : http://localhost:8123/index.html
# tests : http://localhost:8123/tests/tests.html
```
:::

:::piege
Sur `master`, il n'y a que la doc et la maquette. Vérifie ta branche avec `git branch` avant de chercher un fichier qui « a disparu ».
:::

:::ou[Dans QuickList]
La maquette, elle, s'ouvre directement : `maquettes/index.html` est une seule page, sans script.
:::
