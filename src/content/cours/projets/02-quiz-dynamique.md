---
titre: "Quiz Dynamique : JS natif en modules, Scrum et Gitflow en équipe"
matiere: "projets"
type: "projet"
chapitre: 2
niveau: "debutant"
duree: 12
date: 2026-07-30
source: "Projet d'école en équipe (Sprint 2), repo Martin31300/quiz-interactif"
tags: ["javascript", "modules-es", "localstorage", "scrum", "gitflow"]
essentiel: "Un quiz chronométré en HTML, CSS et JavaScript natif, découpé en modules ES. Au Sprint 2, en binôme avec Martin, vous l'avez enrichi : thèmes, quatre modes de jeu, questions mélangées et de plus en plus dures, FR / EN, mode sombre, badges. Le tout livré en Scrum, avec Gitflow et des releases taguées."
retenir:
  - "Un module ES = un fichier qui exporte et importe ; il lui faut un serveur http, pas file://."
  - "Fisher-Yates mélange équitablement, sur une copie du tableau."
  - "Après avoir mélangé les réponses, on recalcule l'index de la bonne avec indexOf."
  - "Toute lecture du localStorage passe par un try/catch avec une valeur par défaut."
  - "Scrum donne les rôles (Product Owner, Scrum Master), Gitflow donne les branches (feature, develop, release, main)."
definitions:
  - terme: "Module ES"
    definition: "Fichier JavaScript chargé avec type=\"module\" : il a sa propre portée et partage ses fonctions avec export / import."
    exemple: "import { shuffle } from \"./utils.js\";"
  - terme: "Fisher-Yates"
    definition: "Algorithme de mélange équitable : de la fin vers le début, chaque case est échangée avec une case tirée au hasard avant elle (ou elle-même)."
  - terme: "Scrum"
    definition: "Méthode agile : le travail avance par sprints courts, avec un backlog priorisé, un Product Owner et un Scrum Master."
  - terme: "Product Owner"
    definition: "Rôle Scrum qui décide quoi faire et dans quel ordre : il priorise le backlog."
  - terme: "Scrum Master"
    definition: "Rôle Scrum qui fait vivre la méthode (rituels, rythme) et aide l'équipe à lever ses obstacles."
  - terme: "Sprint"
    definition: "Période courte et fixe (souvent 1 à 4 semaines) qui se termine par un incrément utilisable."
  - terme: "i18n"
    definition: "Internationalisation : préparer l'interface pour plusieurs langues. Ici, des clés traduites en FR et EN et des attributs data-i18n."
flashcards:
  - q: "Présente le Quiz Dynamique en une phrase."
    r: "Un quiz chronométré en JS natif et en modules ES, enrichi au Sprint 2 en équipe : thèmes, 4 modes de jeu, FR / EN, mode sombre et badges."
  - q: "Quel était ton rôle Scrum ?"
    r: "Scrum Master, et développeur. Martin était Product Owner, et développeur aussi."
  - q: "Pourquoi un serveur local pour ce projet ?"
    r: "Les modules ES ne se chargent pas en file:// : le navigateur bloque la requête. Il faut une page servie en http (Live Server, python -m http.server)."
  - q: "Comment tu mélanges les questions ?"
    r: "Avec Fisher-Yates : la fonction shuffle de utils.js, qui travaille sur une copie du tableau."
  - q: "Une fois les réponses mélangées, comment retrouver la bonne ?"
    r: "On garde l'ordre tiré (order) et on recalcule l'index : order.indexOf(q.correct)."
  - q: "Comment marche la difficulté progressive ?"
    r: "Les questions sont groupées par niveau, les niveaux triés du plus facile au plus dur, et l'ordre est mélangé à l'intérieur de chaque niveau."
  - q: "Comment le meilleur score est sauvegardé ?"
    r: "Une clé par thème, bestScore_ suivi du thème, écrite seulement quand le score bat le record."
  - q: "Pourquoi un try/catch autour de JSON.parse ?"
    r: "Une valeur abîmée dans le localStorage ferait planter toute l'application : on revient à la valeur par défaut."
  - q: "Quels sont les 4 modes de jeu ?"
    r: "Normal (minuteur par question), contre-la-montre (30 s pour tout le quiz), flashcard (sans score ni minuteur) et infini (questions au hasard jusqu'à l'arrêt)."
  - q: "Comment la langue change en pleine partie ?"
    r: "Les questions restent bilingues ({ fr, en }) ; la langue est choisie à l'affichage, donc la question en cours se retraduit."
  - q: "À quoi sert l'index.html à la racine ?"
    r: "Il redirige vers pages/index.html, parce que GitHub Pages sert la racine du dépôt."
  - q: "Ton Gitflow sur ce projet ?"
    r: "Une branche feature/ par fonctionnalité depuis develop, puis une release fusionnée dans main avec un tag (1.1.0)."
quiz:
  - question: "Pourquoi le quiz ne démarre pas quand tu ouvres pages/index.html en double-clic ?"
    choix:
      - "Parce que le CSS est mal lié"
      - "Parce que les modules ES sont bloqués en file://"
      - "Parce que le localStorage est désactivé"
      - "Parce qu'il manque un npm install"
    reponse: "Parce que les modules ES sont bloqués en file://"
    explication: "Un script type=\"module\" est chargé comme une requête réseau ; en file://, le navigateur la bloque. Il faut un serveur local."
  - question: "Que renvoie shuffle([1, 2, 3]) ?"
    choix:
      - "Le même tableau, mélangé sur place"
      - "Une copie mélangée ; le tableau d'origine ne change pas"
      - "Un seul élément tiré au hasard"
      - "undefined"
    reponse: "Une copie mélangée ; le tableau d'origine ne change pas"
    explication: "shuffle commence par const copy = [...array] et ne touche qu'à cette copie."
  - question: "Réponses [\"A\", \"B\", \"C\"], la bonne est à l'index 0. Après mélange, order = [2, 0, 1]. Quel est le nouvel index de la bonne réponse ?"
    choix:
      - "0"
      - "1"
      - "2"
    reponse: "1"
    explication: "L'affichage devient [C, A, B] : A est à l'index 1, c'est bien order.indexOf(0)."
  - question: "Pourquoi [...tableau].sort(() => Math.random() - 0.5) n'est pas un bon mélange ?"
    choix:
      - "Il modifie le tableau d'origine"
      - "Il est biaisé : tous les ordres n'ont pas la même chance de sortir"
      - "Il ne marche qu'avec des nombres"
      - "Il renvoie toujours le même ordre"
    reponse: "Il est biaisé : tous les ordres n'ont pas la même chance de sortir"
    explication: "sort attend un comparateur cohérent ; avec du hasard, le résultat dépend de l'algorithme de tri et certains ordres sortent plus souvent. Fisher-Yates est équitable."
  - question: "Dans Scrum, qui priorise le backlog ?"
    choix:
      - "Le Scrum Master"
      - "Le Product Owner"
      - "Toute l'équipe, par vote"
      - "Le client final, directement"
    reponse: "Le Product Owner"
    explication: "Le Product Owner décide quoi faire et dans quel ordre ; le Scrum Master, lui, fait vivre la méthode."
  - question: "Dans Gitflow, quelle branche reçoit directement les branches feature/ ?"
    choix:
      - "main"
      - "develop"
      - "release/1.1.0"
      - "gh-pages"
    reponse: "develop"
    explication: "Une feature part de develop et y revient. main ne reçoit que des releases (ou des hotfix)."
exercices:
  - titre: "Une question au hasard"
    niveau: "facile"
    enonce: "Pour le mode infini, écris tirerAuHasard(tableau) qui renvoie un élément pris au hasard dans le tableau."
    indices:
      - "Math.random() renvoie un nombre entre 0 (inclus) et 1 (exclu)."
      - "Multiplie par tableau.length, puis arrondis vers le bas avec Math.floor : tu obtiens un index valide."
    solution: |
      ```js
      const tirerAuHasard = (tableau) => tableau[Math.floor(Math.random() * tableau.length)];

      console.log(tirerAuHasard(["culture", "maths", "web"])); // un des trois
      ```
  - titre: "Mélanger les réponses sans perdre la bonne"
    niveau: "moyen"
    enonce: "Écris preparerQuestion(q) qui reçoit { answers, correct } (correct = index de la bonne réponse) et renvoie { answers, correct } avec les réponses mélangées et le bon index recalculé. Utilise la fonction shuffle du projet."
    indices:
      - "Ne mélange pas les réponses elles-mêmes : mélange la liste de leurs index [0, 1, 2, …]."
      - "Les réponses affichées sont order.map((i) => q.answers[i])."
      - "La bonne réponse se trouve à order.indexOf(q.correct)."
    solution: |
      ```js
      const shuffle = (array) => {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
      };

      const preparerQuestion = (q) => {
        const order = shuffle(q.answers.map((_, i) => i));
        return { answers: order.map((i) => q.answers[i]), correct: order.indexOf(q.correct) };
      };

      const q = preparerQuestion({ answers: ["Marseille", "Paris", "Lyon"], correct: 1 });
      console.log(q.answers[q.correct]); // "Paris", à chaque fois
      ```
  - titre: "La difficulté progressive"
    niveau: "difficile"
    enonce: "Écris trierParNiveau(questions) : les questions de niveau 1 d'abord, puis 2, puis 3…, mélangées à l'intérieur de chaque niveau. Une question sans difficulty compte comme niveau 1."
    indices:
      - "Range les questions dans une Map : niveau → tableau de questions."
      - "Trie les clés de la Map dans l'ordre croissant avec sort((a, b) => a - b)."
      - "Pour chaque niveau, ajoute shuffle(questions du niveau) au résultat (flatMap aide)."
    solution: |
      ```js
      // shuffle : la même fonction que dans utils.js
      const trierParNiveau = (questions) => {
        const parNiveau = new Map();
        questions.forEach((q) => {
          const niveau = q.difficulty || 1;
          if (!parNiveau.has(niveau)) parNiveau.set(niveau, []);
          parNiveau.get(niveau).push(q);
        });
        const niveaux = [...parNiveau.keys()].sort((a, b) => a - b);
        return niveaux.flatMap((n) => shuffle(parNiveau.get(n)));
      };

      console.log(trierParNiveau([{ difficulty: 3 }, { difficulty: 1 }, {}, { difficulty: 2 }])
        .map((q) => q.difficulty || 1)); // [ 1, 1, 2, 3 ]
      ```
projet:
  repo: "https://github.com/Martin31300/quiz-interactif"
  stack: ["HTML", "CSS", "JavaScript", "Modules ES", "localStorage"]
  statut: "termine"
  role: "En binôme : toi Scrum Master et développeur, Martin Product Owner et développeur"
---

## Le projet en un coup d'œil

:::quoi
Un **quiz chronométré** repris du Sprint 1 d'une autre équipe. Au **Sprint 2**, vous l'avez enrichi sans repartir de zéro : thèmes, modes de jeu, langues, mode sombre, badges.
:::

:::exemple
```text
pages/index.html     les 3 écrans : intro, question, résultat
assets/js/quiz.js    chef d'orchestre : état de la partie, événements
assets/js/dom.js     petits helpers DOM (getElement, setText, boutons)
assets/js/utils.js   localStorage, minuteur, mélange (shuffle)
assets/js/data.js    banque de questions bilingues, par thème
assets/js/i18n.js    traductions de l'interface (FR / EN)
assets/js/theme.js   mode sombre mémorisé
assets/js/badges.js  badges débloqués
```
:::

:::piege
Sur un projet d'équipe, on **greffe** ses fonctionnalités sur le dépôt existant. Le vieux `script.js` à la racine n'est plus chargé : ne le modifie pas en croyant changer le quiz.
:::

:::ou[Réutilisé ensuite]
Les modules ES et le localStorage protégé par un `try/catch` servent de base au découpage de QuickList.
:::

:::info[Ce que tu as fait]
Tes branches `feature/` : `sprint2-jonathan` (multi-thème, mélange, difficulté progressive), `modes-de-jeu`, `changement-langue`, `mode-sombre`, `reponses-images`, `partage-score`, `nouvelles-questions`. Martin a codé les badges, les statistiques, le récapitulatif et l'audio.
:::

## Découper en modules ES

:::quoi
Avec `<script type="module">`, chaque fichier est un **module** : il **exporte** ses fonctions et **importe** celles des autres. Un fichier = une responsabilité.
:::

:::exemple
```js
// assets/js/utils.js : on exporte
export const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// assets/js/quiz.js : on importe (avec l'extension .js)
import { saveToLocalStorage } from "./utils.js";
```
:::

:::piege
Les modules ne se chargent **pas** en double-clic (`file://`) : il faut un serveur local. Et dans le navigateur, l'extension `.js` est **obligatoire** dans l'import.
:::

:::ou[Dans le Quiz Dynamique]
`pages/index.html` ne charge qu'un seul script, `quiz.js`, qui importe les 6 autres modules.
:::

## Mélanger avec Fisher-Yates

:::quoi
Pour un mélange **équitable**, on part de la fin du tableau et on échange chaque case avec une case **au hasard** avant elle (ou elle-même). On travaille sur une **copie**.
:::

:::exemple
```js title="assets/js/utils.js"
export const shuffle = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
```
:::

:::piege
Le raccourci `sort(() => Math.random() - 0.5)` donne un mélange **biaisé** : certains ordres sortent plus souvent que d'autres.
:::

:::ou[Dans le Quiz Dynamique]
`prepareOne()` (dans `quiz.js`) mélange l'**ordre des réponses**, puis recalcule l'index de la bonne : `correct: order.indexOf(q.correct)`.
:::

## Le meilleur score, par thème

:::quoi
Une clé localStorage **par thème** (`bestScore_culture`, `bestScore_web`…) garde le record. La lecture passe par un `try/catch` pour survivre à une valeur abîmée.
:::

:::exemple
```js title="assets/js/utils.js"
export const loadFromLocalStorage = (key, defaultValue) => {
  const storedValue = localStorage.getItem(key);
  if (storedValue === null) return defaultValue;
  try {
    return JSON.parse(storedValue);
  } catch {
    localStorage.removeItem(key); // valeur corrompue : on repart à zéro
    return defaultValue;
  }
};
```
:::

:::piege
Avec Live Server, tous tes projets partagent la même adresse, donc le **même localStorage**. Une valeur qui n'était pas du JSON a déjà fait planter le quiz : d'où ce `try/catch`.
:::

:::ou[Dans le Quiz Dynamique]
`selectTheme()` lit le record du thème choisi ; `endQuiz()` ne l'écrit que si `score > bestScore`. La langue (`lang`) et le mode sombre (`darkMode`) utilisent les mêmes fonctions.
:::

## Scrum et Gitflow en équipe

:::quoi
**Scrum** découpe le travail en **sprints** : le **Product Owner** priorise le backlog, le **Scrum Master** fait vivre la méthode. **Gitflow** organise les branches pour que chacun code sans casser `main`.
:::

:::exemple
```bash
git checkout -b feature/modes-de-jeu develop
git add . && git commit -m "feat: 4 modes de jeu"
git checkout develop && git merge --no-ff feature/modes-de-jeu
git checkout -b release/1.1.0 develop      # préparer la version
git checkout main && git merge --no-ff release/1.1.0
git tag 1.1.0                              # version en production
```
:::

:::piege
`git push` n'envoie **pas** les tags : pense à `git push origin 1.1.0`, sinon la version n'existe que sur ton PC.
:::

:::ou[Dans le Quiz Dynamique]
Dépôt d'équipe `Martin31300/quiz-interactif` (remote `origin`), dépôt du Sprint 1 en `upstream`. Tags `1.0.0`, `1.1.0` (Sprint 2) et `1.1.1`, le correctif qui ajoute la redirection à la racine.
:::

## Lancer le projet

:::quoi
Pas de build : un **serveur local** suffit, puisque les modules ES refusent `file://`.
:::

:::exemple
```bash
git clone https://github.com/Martin31300/quiz-interactif.git
cd quiz-interactif
python -m http.server 8000
# puis ouvrir http://localhost:8000/pages/index.html
```
:::

:::piege
L'`index.html` de la racine ne contient pas le quiz : il **redirige** vers `pages/index.html` (balise `meta refresh`), pour GitHub Pages qui sert la racine du dépôt.
:::

:::ou[Dans VS Code]
Clic droit sur `pages/index.html`, puis « Open with Live Server » (port 5500).
:::
