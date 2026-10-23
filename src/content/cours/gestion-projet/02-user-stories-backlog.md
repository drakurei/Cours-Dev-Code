---
titre: "User stories et backlog"
matiere: gestion-projet
type: cours
chapitre: 2
niveau: debutant
duree: 10
date: 2026-07-28
source: "TP User Stories (sujet 3) + projet Quiz Dynamique (backlog du Sprint 2)"
tags: [scrum, user-stories, backlog, estimation]
essentiel: "Une user story décrit un besoin du point de vue de l'utilisateur : « En tant que… je veux… afin de… ». Elle a des critères d'acceptation testables, on l'estime en story points, et le Product Owner la range par priorité dans le Product Backlog."
retenir:
  - "Rôle, besoin, valeur : le « afin de » dit pourquoi on développe."
  - "Chaque critère d'acceptation se vérifie par oui ou par non."
  - "Une bonne story est INVEST : Indépendante, Négociable, Valeur, Estimable, Small, Testable."
  - "Un story point est un effort relatif, jamais une heure."
  - "Le Product Backlog est ordonné par le PO et évolue à chaque sprint."
definitions:
  - terme: "User story"
    definition: "Description courte d'un besoin, du point de vue de l'utilisateur : En tant que… je veux… afin de…"
    exemple: "En tant que joueur, je veux choisir un thème afin d'adapter les questions à mes centres d'intérêt."
  - terme: "Critères d'acceptation"
    definition: "Conditions testables qui disent quand une story est réussie."
  - terme: "Product Backlog"
    definition: "Liste ordonnée de tout ce qu'il reste à faire sur le produit, tenue par le Product Owner."
  - terme: "Story point"
    definition: "Unité d'estimation relative de l'effort d'une story : complexité, volume de travail et incertitude."
  - terme: "INVEST"
    definition: "Moyen mnémotechnique d'une bonne story : Indépendante, Négociable, porteuse de Valeur, Estimable, Small (petite), Testable."
  - terme: "Epic"
    definition: "Story trop grosse pour tenir dans un sprint, qu'on découpe en plusieurs stories."
  - terme: "Planning poker"
    definition: "Technique d'estimation : chacun révèle sa carte en même temps, puis on discute les écarts et on revote."
  - terme: "Affinement du backlog (refinement)"
    definition: "Travail continu pour découper, préciser, estimer et réordonner les éléments du backlog."
flashcards:
  - q: "Quel est le modèle d'une user story ?"
    r: "En tant que [rôle], je veux [besoin], afin de [valeur]."
  - q: "Quelle partie de la story est la plus importante ?"
    r: "Le « afin de » : la valeur, la raison pour laquelle on développe."
  - q: "À quoi servent les critères d'acceptation ?"
    r: "À savoir quand la story est réussie. Chaque critère se teste par oui ou non."
  - q: "Que signifient les 3 C ?"
    r: "Card (la fiche courte), Conversation (l'échange qui précise), Confirmation (les critères d'acceptation)."
  - q: "Que veut dire INVEST ?"
    r: "Indépendante, Négociable, porteuse de Valeur, Estimable, Small (petite), Testable."
  - q: "Un story point, c'est une heure ?"
    r: "Non. C'est un effort relatif, comparé aux autres stories de la même équipe."
  - q: "Quelle suite utilise-t-on souvent pour estimer ?"
    r: "Une suite proche de Fibonacci : 1, 2, 3, 5, 8, 13."
  - q: "Qu'est-ce qu'une epic ?"
    r: "Une story trop grosse pour un sprint. On la découpe en plusieurs stories."
  - q: "Combien de points pour le Sprint 2 du Quiz ?"
    r: "8 points : multi-thème 3, mélange 2, difficulté progressive 3."
  - q: "Qu'était US-06 dans le Quiz Dynamique ?"
    r: "Le mélange aléatoire des questions et des réponses (Fisher-Yates), sur feature/melange-questions : ta story."
  - q: "Pourquoi « Ajouter un bouton thème » n'est pas une user story ?"
    r: "Il manque le rôle et la valeur : c'est une tâche, pas un besoin utilisateur."
quiz:
  - question: "Laquelle est une user story bien formée ?"
    choix:
      - "Ajouter un bouton thème sombre."
      - "En tant que joueur, je veux un thème sombre afin de jouer le soir sans être ébloui."
      - "Le développeur code le thème sombre en CSS."
      - "Thème sombre : priorité haute, 3 points."
    reponse: "En tant que joueur, je veux un thème sombre afin de jouer le soir sans être ébloui."
    explication: "Elle a les 3 morceaux : le rôle (joueur), le besoin (thème sombre) et la valeur (jouer le soir sans être ébloui)."
  - question: "Quel critère d'acceptation est testable ?"
    choix:
      - "Le quiz est agréable à utiliser."
      - "Le mélange est de bonne qualité."
      - "Le meilleur score est enregistré séparément pour chaque thème."
      - "Le code est propre."
    reponse: "Le meilleur score est enregistré séparément pour chaque thème."
    explication: "On peut le vérifier par oui ou non (dans le Quiz : la clé `bestScore_<theme>`). Les autres sont des avis, pas des tests."
  - question: "Que représente le S de INVEST ?"
    choix:
      - "Simple"
      - "Small : assez petite pour tenir dans un sprint"
      - "Sécurisée"
      - "Spécifique"
    reponse: "Small : assez petite pour tenir dans un sprint"
    explication: "Une story doit pouvoir être terminée dans un seul sprint. Sinon, c'est une epic à découper."
  - question: "Une story est estimée 8 points, une autre 2 points. Que peux-tu en dire ?"
    choix:
      - "La première prend 8 heures."
      - "La première demande environ 4 fois plus d'effort, pour cette équipe."
      - "Les deux prennent le même temps."
      - "La seconde est forcément plus prioritaire."
    reponse: "La première demande environ 4 fois plus d'effort, pour cette équipe."
    explication: "Les points sont relatifs : ils comparent les stories entre elles. Ils ne disent rien des heures, ni de la priorité (c'est le PO qui la fixe)."
  - question: "Dans les 3 C, que représente la Confirmation ?"
    choix:
      - "La signature du client"
      - "Les critères d'acceptation"
      - "La validation du code par le Scrum Master"
      - "Le merge dans main"
    reponse: "Les critères d'acceptation"
    explication: "Card = la fiche, Conversation = l'échange, Confirmation = les critères qui disent quand la story est réussie."
  - question: "Une story ne tient pas dans un sprint. Que fais-tu ?"
    choix:
      - "On rallonge le sprint."
      - "On la découpe en plusieurs stories plus petites."
      - "On la confie au Scrum Master."
      - "On supprime ses critères d'acceptation."
    reponse: "On la découpe en plusieurs stories plus petites."
    explication: "C'est une epic : on la découpe en stories qui apportent chacune de la valeur et tiennent dans un sprint."
exercices:
  - titre: "Écrire une user story"
    niveau: facile
    enonce: "Écris US-11 du Quiz (thème visuel clair / sombre) au format complet."
    indices:
      - "Qui est l'utilisateur ? Le joueur."
      - "Le « afin de » donne la raison : confort, lisibilité, jouer le soir…"
    solution: |
      ```md
      ### US-11 — Thème clair / sombre · `feature/mode-sombre`
      En tant que joueur, je veux passer du thème clair au thème sombre
      afin de jouer confortablement, même le soir.
      ```
  - titre: "Ajouter des critères d'acceptation"
    niveau: moyen
    enonce: "Ajoute 3 critères d'acceptation testables à US-08 : « En tant que joueur, je veux un récapitulatif de mes erreurs en fin de partie afin de comprendre ce que je dois revoir. »"
    indices:
      - "Qu'est-ce qui doit s'afficher ? Où ? Quand ?"
      - "Chaque critère doit se vérifier par oui ou non."
      - "Pense au cas où il n'y a aucune erreur."
    solution: |
      ```md
      - [ ] L'écran de résultat liste chaque question ratée.
      - [ ] Pour chaque erreur : ma réponse et la bonne réponse.
      - [ ] Si je n'ai fait aucune erreur, un message le dit.
      ```
  - titre: "Découper et estimer une epic"
    niveau: difficile
    enonce: "Epic : « En tant que joueur, je veux un écran de statistiques complet afin de suivre mes progrès. » Découpe-la en 3 stories INVEST et estime-les (suite 1, 2, 3, 5, 8), en justifiant d'une phrase."
    indices:
      - "Chaque story doit apporter de la valeur seule."
      - "Compare les stories entre elles : laquelle est la plus simple ?"
      - "Une seule bonne réponse n'existe pas : c'est la justification qui compte."
    solution: |
      ```md
      Une solution possible :
      - US-A : voir mon nombre de parties et mon score moyen → 2 pts (calculs simples)
      - US-B : voir mon meilleur score par thème → 1 pt (la donnée existe déjà)
      - US-C : voir une courbe de mes 10 dernières parties → 5 pts
        (historique à stocker + graphique : plus de travail et d'incertitude)
      ```
---

## Le format « En tant que… je veux… afin de… »

:::quoi
Une **user story** est une phrase courte : un **rôle** (pour qui ?), un **besoin** (quoi ?) et une **valeur** (pourquoi ?). Le « afin de » est le plus important : il dit **pourquoi** on développe.
:::

:::exemple
```md title="docs/03-backlog-user-stories.md"
### US-06 — Mélange aléatoire · `feature/melange-questions`
En tant que joueur, je veux que l'ordre des questions soit **mélangé**
afin que chaque session soit unique.
```
:::

:::piege
« Ajouter un bouton thème » n'est **pas** une user story : il manque le rôle et la valeur. C'est une **tâche**.
:::

:::ou[Dans le Quiz Dynamique]
US-05 (multi-thème), **US-06 (mélange, ta story)**, US-07 (difficulté progressive), US-12 (indice par question).
:::

## Les critères d'acceptation

:::quoi
Les **critères d'acceptation** disent **quand** la story est réussie. Chaque critère est **testable** : on répond par oui ou par non.
:::

:::exemple
```md title="docs/03-backlog-user-stories.md"
- **Critères d'acceptation** :
  - [x] L'ordre des questions change à chaque partie (Fisher-Yates).
  - [x] L'ordre des **réponses** est aussi mélangé.
  - [x] L'index de la bonne réponse reste correct après mélange.
  - [x] Les données sources (`quizData`) ne sont jamais modifiées.
```
:::

:::piege
« Le quiz doit être joli » n'est pas testable. Écris plutôt : « Le badge de niveau s'affiche pendant la question ».
:::

:::astuce
Format pratique : **Étant donné** que le chrono est à 0, **quand** je clique sur une réponse, **alors** rien ne se passe.
:::

:::ou[Dans le Quiz Dynamique]
Martin (PO) cochait ces cases avant de passer une story de **Review** à **Done**. Ta rétro : « Rédiger des critères testables dès le planning ».
:::

## Les 3 C

:::quoi
Une story n'est pas un contrat figé : c'est une **promesse de conversation**. Les **3 C** : **Card** (la fiche courte), **Conversation** (l'échange qui précise), **Confirmation** (les critères d'acceptation).
:::

:::exemple
```text
Card          → « En tant que joueur, je veux un indice… »
Conversation  → PO : « Seulement pour les questions moyennes et difficiles. »
Confirmation  → [x] Le bouton Indice n'apparaît que si la question en a un.
```
:::

:::piege
Ne mets pas tous les détails techniques sur la carte : ils viennent de la **conversation** avec le PO, puis vont dans les critères.
:::

:::ou[Dans ton TP User Stories]
La diapo « 3 C » de ta présentation orale (sujet 3). Exemple réel : US-12, l'indice par question.
:::

## INVEST : reconnaître une bonne story

:::quoi
Une bonne story est **INVEST** : **I**ndépendante, **N**égociable, porteuse de **V**aleur, **E**stimable, **S**mall (petite, elle tient dans un sprint), **T**estable.
:::

:::exemple
```text
Trop grosse : « En tant que joueur, je veux un quiz complet et rejouable. »
Découpée en stories qui tiennent dans le sprint :
  US-05  choisir un thème
  US-06  mélanger les questions et les réponses
  US-07  difficulté progressive
```
:::

:::piege
Une story trop grosse s'appelle une **epic** : elle ne tient pas dans un sprint, il faut la **découper**.
:::

:::ou[Dans le Quiz Dynamique]
Ta rétro du Sprint 2, point **Continue** : « Découper le travail en petites stories réalisables sur un sprint court ».
:::

## Le Product Backlog

:::quoi
Le **Product Backlog** est la liste **ordonnée** de tout ce qu'il reste à faire sur le produit. Le **PO** la tient à jour et met en haut ce qui a le plus de **valeur**.
:::

:::exemple
```md title="docs/03-backlog-user-stories.md"
## Backlog restant (sprints futurs)

- **US-08** — Récapitulatif des erreurs en fin de partie.
- **US-09** — Nombre de questions configurable avant de démarrer.
- **US-10** — Bonus de points selon la rapidité de réponse.
- **US-11** — Thème visuel clair / sombre.
```
:::

:::piege
Le backlog n'est jamais « fini » : il **évolue** à chaque sprint (on ajoute, on découpe, on réordonne). C'est l'**affinement**.
:::

:::ou[Dans le Quiz Dynamique]
Le haut du backlog devient le sprint suivant : le récapitulatif des erreurs (US-08) a bien été livré ensuite.
:::

## Estimer en story points

:::quoi
On estime une story en **story points** : un effort **relatif** (complexité, volume, incertitude), pas des heures. On utilise souvent une suite proche de **Fibonacci** : 1, 2, 3, 5, 8, 13.
:::

:::exemple
```md title="docs/02-sprint-planning.md"
| # | User Story                      | Estimation | Priorité | Assigné  |
| - | ------------------------------- | ---------- | -------- | -------- |
| 1 | Mode multi-thème                | 3 pts      | Haute    | Martin   |
| 2 | Mélange aléatoire des questions | 2 pts      | Haute    | Jonathan |
| 3 | Difficulté progressive          | 3 pts      | Moyenne  | Équipe   |
```
:::

:::piege
3 points ≠ 3 heures. Un point n'a de sens que **comparé** aux autres stories de **la même équipe**.
:::

:::astuce
**Planning poker** : chacun révèle sa carte en même temps. Si les écarts sont grands, le plus haut et le plus bas s'expliquent, puis on revote.
:::

:::ou[Dans le Quiz Dynamique]
Sprint 2 : 3 + 2 + 3 = **8 points**. Le mélange (2 points), c'était toi.
:::
