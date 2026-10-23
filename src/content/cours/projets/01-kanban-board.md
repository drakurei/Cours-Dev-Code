---
titre: "Kanban board : glisser-déposer et localStorage en JS natif"
matiere: "projets"
type: "projet"
chapitre: 1
niveau: "debutant"
duree: 10
date: 2026-07-28
source: "Projet d'école en Gitflow, à partir du dépôt de départ du formateur"
tags: ["javascript", "dom", "drag-and-drop", "localstorage", "gitflow"]
essentiel: "Un tableau Kanban en HTML, CSS et JavaScript natif : trois colonnes (To Do, Doing, Done) et des cartes qu'on crée, modifie, supprime et glisse d'une colonne à l'autre. Tout est sauvegardé dans le localStorage, et chaque fonctionnalité a eu sa propre branche feature/."
retenir:
  - "Le glisser-déposer natif : dragstart sur la carte, dragover (avec preventDefault) et drop sur la colonne."
  - "localStorage ne garde que du texte : JSON.stringify pour écrire, JSON.parse dans un try/catch pour relire."
  - "Pour du texte tapé par l'utilisateur : textContent, jamais innerHTML."
  - "Chaque modification du tableau doit finir par saveState(), sinon elle est perdue au rechargement."
  - "Gitflow : une branche feature/ par fonctionnalité depuis develop, puis une release et un tag sur main."
definitions:
  - terme: "Kanban"
    definition: "Méthode d'organisation visuelle : des colonnes (à faire, en cours, fait) et des cartes qui avancent de gauche à droite."
  - terme: "Drag and Drop API"
    definition: "API du navigateur pour le glisser-déposer : événements dragstart, dragover, drop et dragend."
  - terme: "localStorage"
    definition: "Petit stockage clé / texte du navigateur, propre à chaque origine, qui survit au rechargement de la page."
    exemple: "localStorage.setItem(\"kanban-state\", JSON.stringify(cards))"
  - terme: "Attribut data-*"
    definition: "Attribut HTML personnalisé (data-priority, data-status…), lu en JavaScript avec element.dataset."
    exemple: "card.dataset.priority // \"high\""
  - terme: "XSS (Cross-Site Scripting)"
    definition: "Faille où du texte saisi est interprété comme du HTML ou du JavaScript dans la page."
  - terme: "MutationObserver"
    definition: "Objet qui surveille les changements du DOM (ajout ou retrait d'éléments) et appelle une fonction à chaque fois."
  - terme: "Tag Git"
    definition: "Étiquette fixe posée sur un commit pour marquer une version publiée."
    exemple: "git tag v1.0.0"
flashcards:
  - q: "Ton Kanban en une phrase ?"
    r: "Un tableau à trois colonnes en JS natif : on crée, modifie, supprime et glisse des cartes, et tout est sauvegardé dans le localStorage."
  - q: "Quels événements pour le glisser-déposer ?"
    r: "dragstart et dragend sur la carte, dragover et drop sur la colonne."
  - q: "Pourquoi e.preventDefault() dans dragover ?"
    r: "Par défaut, le navigateur refuse le dépôt. preventDefault() l'autorise, sinon drop ne se déclenche jamais."
  - q: "Que fait column.appendChild(carte) si la carte est déjà dans une autre colonne ?"
    r: "Elle la déplace : un élément du DOM ne peut être qu'à un seul endroit."
  - q: "Comment le tableau survit au rechargement ?"
    r: "saveState() écrit la liste des cartes en JSON dans le localStorage ; loadState() la relit et recrée les cartes au démarrage."
  - q: "Pourquoi nextId = maxId + 1 au chargement ?"
    r: "Pour qu'une nouvelle carte n'ait jamais le même id qu'une carte déjà sauvegardée."
  - q: "innerHTML ou textContent pour un titre saisi ?"
    r: "textContent : le texte reste du texte, aucune balise n'est interprétée."
  - q: "Comment marche le tri par priorité ?"
    r: "Une table PRIORITY_ORDER (high 3, medium 2, low 1), un sort décroissant, puis appendChild de chaque carte dans le nouvel ordre."
  - q: "Comment le total du titre se met à jour tout seul ?"
    r: "Un MutationObserver surveille chaque colonne et recompte les cartes à chaque ajout ou retrait."
  - q: "Ton workflow Git sur ce projet ?"
    r: "Gitflow : une branche feature/ par fonctionnalité depuis develop, puis release/1.0.0 et le tag v1.0.0 sur main."
quiz:
  - question: "Que se passe-t-il si tu oublies e.preventDefault() dans l'écouteur dragover ?"
    choix:
      - "La carte est copiée au lieu d'être déplacée"
      - "L'événement drop ne se déclenche pas"
      - "La carte disparaît du DOM"
      - "Le localStorage est vidé"
    reponse: "L'événement drop ne se déclenche pas"
    explication: "Une zone refuse le dépôt par défaut. preventDefault() dans dragover dit au navigateur : ici, on accepte la carte."
  - question: "Que renvoie localStorage.getItem(\"kanban-state\") ?"
    choix:
      - "Un tableau d'objets"
      - "Une chaîne de caractères, ou null si la clé n'existe pas"
      - "Un objet déjà converti depuis le JSON"
      - "Un nombre"
    reponse: "Une chaîne de caractères, ou null si la clé n'existe pas"
    explication: "localStorage ne stocke que du texte. C'est JSON.parse qui retransforme ce texte en tableau."
  - question: "Pourquoi construire la carte avec innerHTML et ${data.title} est risqué ?"
    choix:
      - "C'est plus lent que createElement"
      - "Le titre peut contenir du HTML qui sera interprété (faille XSS)"
      - "innerHTML n'accepte pas les template literals"
      - "Une balise h3 est interdite dans une carte"
    reponse: "Le titre peut contenir du HTML qui sera interprété (faille XSS)"
    explication: "Un titre comme `<img src=x onerror=alert(1)>` exécuterait du JavaScript. textContent affiche le texte tel quel."
  - question: "Le comparateur (a, b) => PRIORITY_ORDER[b.dataset.priority] - PRIORITY_ORDER[a.dataset.priority] trie les cartes…"
    choix:
      - "De la priorité faible à la priorité haute"
      - "De la priorité haute à la priorité faible"
      - "Par ordre alphabétique du titre"
      - "Au hasard"
    reponse: "De la priorité haute à la priorité faible"
    explication: "b - a donne un ordre décroissant : la carte qui vaut 3 (high) passe devant celle qui vaut 1 (low)."
  - question: "Tu cliques sur « Vider Done », tu recharges la page… et les cartes terminées reviennent. Pourquoi ?"
    choix:
      - "Le bouton enlève les cartes du DOM sans appeler saveState()"
      - "Le localStorage ne marche pas en local"
      - "Le MutationObserver recrée les cartes"
      - "confirm() annule toujours la suppression"
    reponse: "Le bouton enlève les cartes du DOM sans appeler saveState()"
    explication: "La sauvegarde n'est pas mise à jour : au rechargement, loadState() relit l'ancien état, cartes terminées comprises."
  - question: "Quelle branche Gitflow sert à préparer une version avant de la fusionner dans main ?"
    choix:
      - "feature/1.0.0"
      - "develop"
      - "release/1.0.0"
      - "gh-pages"
    reponse: "release/1.0.0"
    explication: "La branche release/ part de develop, reçoit les derniers réglages, puis est fusionnée dans main avec un tag."
exercices:
  - titre: "Trier des cartes par priorité"
    niveau: "facile"
    enonce: "Écris une fonction trierParPriorite(cartes) qui renvoie une copie du tableau, triée de la priorité haute à la faible. Chaque carte est un objet { titre, priorite } avec priorite = \"high\", \"medium\" ou \"low\"."
    indices:
      - "Reprends la table PRIORITY_ORDER du projet : high vaut 3, medium 2, low 1."
      - "sort() modifie le tableau d'origine : copie-le d'abord avec [...cartes]."
      - "Pour un ordre décroissant, le comparateur renvoie ordre[b] - ordre[a]."
    solution: |
      ```js
      const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };

      function trierParPriorite(cartes) {
        return [...cartes].sort((a, b) => PRIORITY_ORDER[b.priorite] - PRIORITY_ORDER[a.priorite]);
      }

      console.log(trierParPriorite([
        { titre: "A", priorite: "low" },
        { titre: "B", priorite: "high" },
        { titre: "C", priorite: "medium" },
      ]).map((c) => c.titre)); // [ 'B', 'C', 'A' ]
      ```
  - titre: "Réparer le bouton « Vider Done »"
    niveau: "moyen"
    enonce: "« Vider Done » enlève les cartes terminées de l'écran, mais elles reviennent au rechargement et les compteurs des colonnes ne bougent pas. Corrige-le."
    indices:
      - "Compare avec la suppression d'une seule carte : que fait-elle juste après card.remove() ?"
      - "updateCounters() et saveState() sont déclarées dans le premier bloc DOMContentLoaded : le second bloc ne les voit pas (portée des fonctions)."
      - "Crée le bouton dans le premier bloc, là où ces deux fonctions existent, et supprime l'ancien."
    solution: |
      ```js
      // Dans le PREMIER bloc DOMContentLoaded, où saveState() existe :
      const clearDoneBtn = document.createElement("button");
      clearDoneBtn.type = "button";
      clearDoneBtn.className = "btn-danger";
      clearDoneBtn.textContent = "Vider Done";
      clearDoneBtn.addEventListener("click", () => {
        if (!confirm("Supprimer toutes les cartes terminées ?")) return;
        document.querySelectorAll('.column[data-status="done"] .card').forEach((c) => c.remove());
        updateCounters();
        saveState();
      });
      document.querySelector(".toolbar").appendChild(clearDoneBtn);
      // Et on retire l'ancien bouton du second bloc.
      ```
  - titre: "Un chargement qui ne plante plus"
    niveau: "difficile"
    enonce: "Si le localStorage contient une valeur abîmée (pas du JSON, ou pas un tableau), loadState() plante et tout le tableau est cassé. Écris une fonction lireEtat() qui renvoie le tableau sauvegardé, ou null s'il est absent ou invalide, sans jamais lever d'erreur."
    indices:
      - "JSON.parse lève une SyntaxError sur un texte invalide : entoure-le d'un try/catch."
      - "JSON.parse(null) renvoie null : la clé absente est déjà gérée."
      - "Vérifie le type avec Array.isArray avant de renvoyer la valeur."
    solution: |
      ```js
      const STORAGE_KEY = "kanban-state";

      function lireEtat() {
        try {
          const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
          return Array.isArray(data) ? data : null;
        } catch {
          return null; // JSON abîmé : on ignore la sauvegarde
        }
      }

      // Dans loadState() :
      // const data = lireEtat();
      // if (!data) return false; // on garde les cartes du HTML
      ```
projet:
  repo: "https://github.com/drakurei/kanban-board"
  stack: ["HTML", "CSS", "JavaScript", "localStorage"]
  statut: "termine"
  role: "Seul, exercice d'école en Gitflow"
---

## Le projet en un coup d'œil

:::quoi
Un **tableau Kanban** à trois colonnes. Chaque **carte** a un titre, une description et une **priorité** (haute, moyenne, faible) ; on la crée et on la modifie dans une **modale**.
:::

:::exemple
```text
kanban-board/
├── index.html   les 3 colonnes, la barre d'outils, la modale
├── script.js    toute la logique : cartes, glisser-déposer, tri, sauvegarde
└── style.css    la mise en page et le mode sombre
```
:::

:::piege
L'état du tableau vit **dans le DOM** : `data-status` sur la colonne, `data-priority` sur la carte. Si tu modifies le DOM sans appeler `saveState()`, la sauvegarde ne suit pas.
:::

:::ou[Réutilisé ensuite]
La création d'éléments du DOM et le **localStorage** reviennent dans le Quiz Dynamique et dans QuickList.
:::

:::info[Ce que tu as fait]
Une branche par fonctionnalité : ajout de carte, modification dans la modale, suppression, glisser-déposer, recherche, tri et filtre par priorité, sauvegarde **localStorage**, mode sombre, export JSON, « Vider Done », total dans le titre. Puis `release/1.0.0` et le tag `v1.0.0`.
:::

## Glisser-déposer une carte

:::quoi
Le navigateur gère le glisser-déposer avec des **événements** : `dragstart` sur la carte (qui a `draggable="true"`), puis `dragover` et `drop` sur la colonne qui la reçoit.
:::

:::exemple
```js title="script.js"
column.addEventListener("dragover", (e) => {
    e.preventDefault(); // autorise le dépôt
});
column.addEventListener("drop", (e) => {
    e.preventDefault();
    if (!draggedCard) return;
    column.appendChild(draggedCard); // déplace la carte
    updateCounters();
    saveState();
});
```
:::

:::piege
Sans `e.preventDefault()` dans `dragover`, le navigateur **refuse** le dépôt : `drop` ne se déclenche jamais.
:::

:::ou[Dans kanban-board]
`enableDrag(card)` garde la carte en cours dans `draggedCard` au `dragstart`. Chaque `.column` l'accueille au `drop`, puis met à jour les compteurs et la sauvegarde.
:::

## Sauvegarder le tableau

:::quoi
Le **localStorage** ne stocke que du **texte**. On transforme la liste des cartes en JSON avec `JSON.stringify`, et on la relit avec `JSON.parse`.
:::

:::exemple
```js title="script.js"
function saveState() {
  const cards = [];
  columns.forEach((column) => {
    column.querySelectorAll(".card").forEach((card) => {
      cards.push({ id: card.dataset.id, status: column.dataset.status, priority: card.dataset.priority,
        title: card.querySelector("h3").textContent, content: card.querySelector("p").textContent });
    });
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}
```
:::

:::piege
`loadState()` fait `JSON.parse(...)` **sans** `try/catch` : une valeur abîmée (pas du JSON) fait planter tout le script au démarrage.
:::

:::ou[Dans kanban-board]
`saveState()` est appelée après chaque action (ajout, modification, suppression, dépôt, tri). `loadState()` tourne au chargement et règle `nextId = maxId + 1` pour ne jamais réutiliser un id.
:::

## innerHTML ou textContent

:::quoi
`makeCard()` fabrique la carte avec un **template literal** dans `innerHTML`. C'est court à écrire, mais le texte tapé est lu comme du **HTML**.
:::

:::exemple
```js title="script.js"
// Création (makeCard) : le texte est lu comme du HTML
card.innerHTML = `
    <h3>${data.title}</h3>
    <p>${data.content}</p>
`;

// Modification (bouton Enregistrer) : le texte reste du texte
editedCard.querySelector("h3").textContent = title;
```
:::

:::piege
Un titre comme `<img src=x onerror=alert(1)>` serait **exécuté** : c'est une faille **XSS**. Pour du texte saisi, utilise `textContent`.
:::

:::ou[Dans kanban-board]
`makeCard()` sert à la création et au rechargement depuis le localStorage. La modification d'une carte, elle, passe déjà par `textContent`.
:::

## Une branche par fonctionnalité

:::quoi
**Gitflow** : `main` = version stable, `develop` = intégration, une branche `feature/` par fonctionnalité, puis une branche `release/` et un **tag** pour publier.
:::

:::exemple
```bash
git checkout -b feature/drag-drop develop     # partir de develop
git add . && git commit -m "feat: glisser-déposer des cartes"
git checkout develop
git merge --no-ff feature/drag-drop           # intégrer la fonctionnalité
git checkout -b release/1.0.0 develop          # préparer la version
git checkout main && git merge --no-ff release/1.0.0
git tag v1.0.0                                 # marquer la version
```
:::

:::piege
Fusionner une `feature/` directement dans `main` court-circuite `develop` : `main` ne reçoit que des versions préparées (`release/`).
:::

:::ou[Dans kanban-board]
16 branches `feature/` (add-card, drag-drop, localstorage, dark-mode, export-json…), puis `release/1.0.0` et le tag `v1.0.0`.
:::

## Lancer le projet

:::quoi
Pas de build, pas de npm : on ouvre `index.html` dans le navigateur, en double-clic ou avec **Live Server** dans VS Code.
:::

:::exemple
```bash
git clone https://github.com/drakurei/kanban-board.git
cd kanban-board
# puis ouvrir index.html, ou dans VS Code : clic droit > Open with Live Server
```
:::

:::piege
Live Server sert tous tes projets sur la même adresse (port 5500) : ils partagent le **même localStorage**. Une valeur laissée par un autre projet peut gêner celui-ci.
:::

:::ou[Dans kanban-board]
`index.html` charge `script.js` en script classique (pas en module) : il marche aussi en double-clic, sans serveur.
:::
