---
titre: "Coder avec une IA : méthode et garde-fous"
matiere: ia-seo
type: cours
chapitre: 3
niveau: intermediaire
duree: 10
date: 2026-08-26
source: "TP Découverte IA — mini moteur de recommandation de films (API TMDB), en binôme"
tags: [ia, copilot, cursor, claude-code, git, securite]
essentiel: "Une IA de code est un assistant, pas un pilote. Choisis l'outil selon la tâche, donne-lui les règles du projet, isole chaque fonctionnalité dans sa branche, puis relis et teste tout ce qu'elle écrit. Et ne lui confie jamais un secret."
retenir:
  - "Trois familles d'outils : le chat, l'autocomplétion dans l'éditeur et l'agent qui modifie le projet."
  - "Un fichier de règles (AGENTS.md, CLAUDE.md) donne le contexte du projet à chaque session."
  - "Une fonctionnalité, une branche, une Pull Request : c'est ce qui permet de relire et d'annuler."
  - "Le code généré se relit et se teste comme celui d'un inconnu."
  - "Une clé API ne va ni dans un commit, ni dans un chat : une clé exposée se régénère."
definitions:
  - terme: "Assistant conversationnel"
    definition: "Une IA avec qui tu discutes dans une fenêtre de chat (ChatGPT, Claude) : tu colles le code, tu recopies la réponse."
  - terme: "Autocomplétion IA"
    definition: "Une IA intégrée à l'éditeur qui propose la suite du code pendant que tu tapes, comme GitHub Copilot."
  - terme: "Agent de code"
    definition: "Une IA qui lit le projet, modifie plusieurs fichiers et lance des commandes, avec ton accord (Claude Code, mode agent de Cursor)."
  - terme: "Fichier de règles"
    definition: "Un fichier Markdown à la racine du repo (AGENTS.md, CLAUDE.md) qui décrit la stack et les conventions à toute IA qui code dedans."
  - terme: "Pull Request (PR)"
    definition: "Une demande de fusion d'une branche dans une autre, sur GitHub : on y relit les changements avant de les accepter."
  - terme: "Secret"
    definition: "Une donnée qui donne un accès : clé API, mot de passe, jeton. Elle ne doit jamais être versionnée ni partagée."
    exemple: "TMDB_API_KEY dans js/config.js"
flashcards:
  - q: "Quelles sont les trois familles d'outils IA pour coder ?"
    r: "Le chat (ChatGPT, Claude), l'autocomplétion dans l'éditeur (Copilot) et l'agent qui modifie le projet (Cursor, Claude Code)."
  - q: "Comment guider l'autocomplétion de Copilot ?"
    r: "En écrivant d'abord un commentaire JSDoc clair et la signature de la fonction : il propose le corps."
  - q: "À quoi sert un fichier AGENTS.md ou CLAUDE.md ?"
    r: "À donner à toute IA les règles du projet : stack, architecture, conventions, ce qu'il ne faut pas faire."
  - q: "Pourquoi une branche par fonctionnalité quand on code avec une IA ?"
    r: "Pour relire les changements dans une Pull Request et pouvoir les annuler sans toucher au reste."
  - q: "Que fait localStorage.getJSON() ?"
    r: "Rien : cette méthode n'existe pas. C'est une hallucination ; on utilise JSON.parse(localStorage.getItem(cle))."
  - q: "Que renvoie localStorage.getItem pour une clé absente ?"
    r: "null, et JSON.parse(null) renvoie aussi null : le `?? []` donne alors un tableau vide."
  - q: "Une clé API a été commitée. Suffit-il de supprimer le fichier ?"
    r: "Non : elle reste dans l'historique Git. Il faut la régénérer chez le fournisseur."
  - q: "Comment partager la configuration sans partager la clé ?"
    r: "Versionner un config.example.js avec une fausse valeur, et mettre le vrai config.js dans .gitignore."
  - q: "Pourquoi une clé API reste exposée dans un site 100 % front-end ?"
    r: "Elle part dans les requêtes du navigateur, visibles par tous. En production, un serveur intermédiaire la garde."
quiz:
  - question: "Tu veux discuter de l'architecture des favoris avant d'écrire une ligne. Quel outil convient le mieux ?"
    choix:
      - "Un assistant conversationnel (chat)"
      - "L'autocomplétion de Copilot"
      - "Un agent qui modifie directement dix fichiers"
      - "Aucun : une IA ne sait pas parler d'architecture"
    reponse: "Un assistant conversationnel (chat)"
    explication: "Pour réfléchir et comparer des options, le chat est idéal. L'autocomplétion sert à écrire, l'agent à exécuter une tâche bien définie."
  - question: "L'IA te propose localStorage.getJSON('favoris'). Que se passe-t-il à l'exécution ?"
    choix:
      - "Ça renvoie le tableau des favoris"
      - "Ça renvoie null"
      - "TypeError : localStorage.getJSON is not a function"
      - "Ça marche seulement dans Chrome"
    reponse: "TypeError : localStorage.getJSON is not a function"
    explication: "Storage n'a que getItem, setItem, removeItem, clear, key et length. L'IA a inventé une méthode : c'est une hallucination."
  - question: "Où mettre la règle « les modules de js/core/ ne touchent jamais au DOM » pour que l'IA la respecte à chaque session ?"
    choix:
      - "Dans un fichier de règles comme AGENTS.md ou CLAUDE.md"
      - "Dans le nom de la branche"
      - "Dans le message de commit"
      - "Nulle part, l'IA le devinera"
    reponse: "Dans un fichier de règles comme AGENTS.md ou CLAUDE.md"
    explication: "Les outils lisent ce fichier au démarrage : la règle fait partie du contexte sans que tu la répètes."
  - question: "Une clé TMDB a été poussée sur GitHub par erreur. Quelle est la bonne réaction ?"
    choix:
      - "Supprimer config.js et faire un nouveau commit"
      - "Régénérer la clé chez TMDB, puis retirer le fichier du suivi Git et l'ajouter au .gitignore"
      - "Passer le repo en privé et ne rien changer"
      - "Renommer la variable"
    reponse: "Régénérer la clé chez TMDB, puis retirer le fichier du suivi Git et l'ajouter au .gitignore"
    explication: "L'ancienne clé reste lisible dans l'historique. Seule une nouvelle clé coupe l'accès à celle qui a fuité."
  - question: "Pourquoi faire chaque fonctionnalité générée par une IA dans sa propre branche ?"
    choix:
      - "Parce que GitHub l'impose"
      - "Pour relire le changement dans une Pull Request et pouvoir l'annuler proprement"
      - "Pour que l'IA aille plus vite"
      - "Pour avoir plus de commits"
    reponse: "Pour relire le changement dans une Pull Request et pouvoir l'annuler proprement"
    explication: "La branche isole le travail ; la Pull Request montre le diff complet à relire avant de fusionner dans develop."
  - question: "Comment guider au mieux l'autocomplétion de Copilot pour une nouvelle fonction ?"
    choix:
      - "Écrire d'abord la JSDoc et la signature de la fonction"
      - "Taper le nom de l'outil en commentaire"
      - "Laisser le fichier vide"
      - "Coller toute la documentation de TMDB dans le fichier"
    reponse: "Écrire d'abord la JSDoc et la signature de la fonction"
    explication: "Le commentaire et la signature décrivent l'intention, les paramètres et le retour : c'est le contexte que Copilot complète."
exercices:
  - titre: "Le bon outil pour la bonne tâche"
    niveau: facile
    enonce: "Associe chaque tâche à une famille d'outil (chat, autocomplétion, agent) : 1) comprendre une erreur CORS ; 2) écrire le corps d'une fonction dont la JSDoc est prête ; 3) renommer une fonction utilisée dans six fichiers et relancer le build ; 4) comparer deux façons de stocker les favoris."
    indices:
      - "Réfléchir ou comprendre : plutôt le chat."
      - "Compléter du code déjà bien décrit : l'autocomplétion."
      - "Modifier plusieurs fichiers et lancer des commandes : l'agent."
    solution: |
      ```text
      1) Comprendre une erreur CORS            → chat
      2) Corps d'une fonction avec sa JSDoc    → autocomplétion (Copilot)
      3) Renommer dans 6 fichiers + build      → agent (Claude Code, Cursor)
      4) Comparer deux stockages des favoris   → chat
      ```
  - titre: "Vérifier une fonction générée"
    niveau: moyen
    enonce: "Écris getFavorites() pour le TP films. Contrat : renvoyer un tableau vide si rien n'est enregistré, si localStorage est indisponible ou si son contenu est corrompu. Aucune exception ne doit sortir de la fonction."
    indices:
      - "localStorage.getItem renvoie null pour une clé absente."
      - "JSON.parse lève une erreur si le texte n'est pas du JSON valide."
      - "Array.isArray vérifie que le résultat est bien un tableau."
    solution: |
      ```js
      const STORAGE_KEY = 'cinescore.favorites'

      export function getFavorites() {
        try {
          const brut = localStorage.getItem(STORAGE_KEY)
          const liste = JSON.parse(brut)
          return Array.isArray(liste) ? liste : []
        } catch {
          return [] // localStorage absent ou contenu corrompu
        }
      }
      ```
      Clé absente : JSON.parse(null) donne null, donc []. Texte corrompu : JSON.parse lève une erreur, attrapée, donc []. Navigation privée sans stockage : l'erreur est aussi attrapée.
  - titre: "Relire une proposition d'IA"
    niveau: difficile
    enonce: "L'IA propose ce code pour `js/core/favorites.js` : une ligne `const API_KEY = 'a1b2c3d4e5'`, puis une fonction `addFavorite(movie)` qui lit `localStorage.getJSON('cinescore.favorites') || []`, fait `liste.push(movie)`, enregistre avec `setItem`, met à jour `document.querySelector('#compteur').textContent` et renvoie la liste. Trouve au moins quatre problèmes au regard du contrat du module, puis réécris la fonction."
    indices:
      - "Relis le contrat du module : pas de doublon, version allégée du film, aucun accès au DOM, aucune exception."
      - "Une des méthodes appelées n'existe pas."
      - "Une ligne n'a rien à faire dans le code, et encore moins dans un commit."
    solution: |
      ```text
      1. API_KEY écrite en dur : un secret dans le code (et inutile ici).
      2. localStorage.getJSON n'existe pas : TypeError à l'exécution.
      3. push sans vérifier : le même film peut être ajouté deux fois.
      4. Le film entier est stocké au lieu de sa version allégée.
      5. document.querySelector : un module de js/core/ touche au DOM.
      6. setItem sans try/catch : exception possible si le stockage est plein ou bloqué.
      ```

      ```js
      export function addFavorite(movie) {
        const liste = getFavorites()
        if (liste.some((film) => film.id === movie.id)) return liste

        const nouvelle = [...liste, toStoredMovie(movie)]
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nouvelle))
        } catch {
          // stockage indisponible : on renvoie quand même la liste
        }
        return nouvelle
      }
      ```
      Le compteur est mis à jour par la vue (js/views/ ou js/ui/), qui appelle addFavorite puis affiche le résultat.
---

## Choisir le bon outil

:::quoi
Trois familles : le **chat** (ChatGPT, Claude) pour réfléchir, l'**autocomplétion** (GitHub Copilot) pour écrire, l'**agent** (Cursor, Claude Code) pour modifier le projet.
:::

:::exemple
```js title="js/core/favorites.js"
/**
 * Indique si un film fait partie des favoris.
 *
 * @param {number|string} movieId
 * @returns {boolean}
 */
export function isFavorite(movieId) {}
```
:::

:::piege
Un agent qui modifie dix fichiers d'un coup va vite, mais le résultat est dur à relire : donne-lui des tâches bien délimitées.
:::

:::ou[TP films (API TMDB)]
Une fonctionnalité par outil pour pouvoir les comparer : le scoring avec ChatGPT, les favoris avec Copilot à partir de squelettes JSDoc comme celui-ci.
:::

## Donner les règles du projet

:::quoi
Un **fichier de règles** à la racine du repo (`AGENTS.md`, `CLAUDE.md`) donne à l'IA le contexte du projet à chaque session, sans tout répéter.
:::

:::exemple
```md
Règles du projet :
- Stack : HTML, SASS, JavaScript natif en modules ES. Pas de framework.
- Toutes les requêtes TMDB passent par js/api/tmdb.js.
- Les modules de js/core/ ne touchent jamais au DOM.
- Commentaires et messages en français.
```
:::

:::piege
Un fichier de règles trop long devient du bruit : garde seulement les règles qui évitent de vraies erreurs.
:::

:::ou[Dans Manabi]
`AGENTS.md` et `CLAUDE.md` donnent les règles du repo à toute IA qui code dedans, sur le PC perso comme au travail.
:::

## Une fonctionnalité, une branche, une PR

:::quoi
Chaque fonctionnalité générée avec une IA vit dans sa **branche**, puis passe par une **Pull Request** : tu relis le diff avant de fusionner.
:::

:::exemple
```bash
git switch develop
git pull
git switch -c feature/favoris-localstorage
# ... développement avec l'IA, commits ...
git push -u origin feature/favoris-localstorage
```
:::

:::piege
Laisser l'IA coder directement sur `develop` ou `main` : impossible de relire ou d'annuler proprement.
:::

:::ou[TP films (API TMDB)]
Le Gitflow du README : `main`, `develop`, puis `feature/scoring-personnalise`, `feature/favoris-localstorage`, chacune avec sa PR vers `develop`.
:::

## Relire et tester le code généré

:::quoi
Le code d'une IA « a l'air juste ». Relis-le comme celui d'un inconnu : vérifie que chaque méthode existe et que les cas limites sont gérés.
:::

:::exemple
```js
// Proposé par l'IA : localStorage.getJSON n'existe pas (TypeError)
// const favoris = localStorage.getJSON('cinescore.favorites')

// Version correcte : getItem renvoie une chaîne, ou null si la clé est absente
const favoris = JSON.parse(localStorage.getItem('cinescore.favorites')) ?? []
```
:::

:::piege
Même la version correcte plante si le contenu est corrompu : `JSON.parse` lève une erreur. D'où le `try/catch` du contrat.
:::

:::ou[TP films (API TMDB)]
`js/core/favorites.js` : le localStorage peut être indisponible (navigation privée) ou corrompu, et aucune fonction ne doit lever d'exception.
:::

## Ne jamais confier un secret

:::quoi
Une **clé API** ne va ni dans un commit, ni dans un chat d'IA. On versionne un fichier d'exemple, et le vrai fichier va dans `.gitignore`.
:::

:::exemple
```js title="js/config.example.js"
// Copier ce fichier en `js/config.js` et y renseigner sa propre clé TMDB.
// `js/config.js` est ignoré par Git : la clé ne doit jamais être commitée.
export const TMDB_API_KEY = "VOTRE_CLE_API_ICI";
```
:::

:::piege
Une clé commitée reste dans l'historique Git, même après suppression du fichier : il faut la **régénérer**.
:::

:::ou[TP films (API TMDB)]
`js/config.js` est listé dans `.gitignore` ; seul `js/config.example.js` est versionné.
:::

:::info
Dans un site 100 % front-end, la clé reste visible dans les requêtes du navigateur. En production, un serveur intermédiaire (proxy) la garde côté serveur.
:::
