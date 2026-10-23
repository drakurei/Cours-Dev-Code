---
titre: "Scrum : rôles, artefacts et événements"
matiere: gestion-projet
type: cours
chapitre: 1
niveau: debutant
duree: 10
date: 2026-07-28
source: "TP Agile Scrum (sujets 3 et 5) + projet Quiz Dynamique (Sprint 2)"
tags: [scrum, agile, roles, ceremonies]
essentiel: "Scrum est un cadre agile : l'équipe livre le produit par petits morceaux, pendant des sprints courts (un mois maximum). Il y a 3 rôles (Product Owner, Scrum Master, Développeurs), 3 artefacts (Product Backlog, Sprint Backlog, Incrément) et 5 événements (le Sprint, le Planning, le Daily, la Review, la Rétrospective)."
retenir:
  - "Scrum = avancer par sprints de durée fixe et livrer à chaque fois un incrément qui marche."
  - "Le Product Owner décide du QUOI et de l'ordre ; les Développeurs décident du COMMENT."
  - "Le Scrum Master n'est pas un chef : il facilite, lève les obstacles et protège l'équipe."
  - "Chaque artefact a son engagement : Product Goal, Sprint Goal, Definition of Done."
  - "Review = on inspecte le produit. Rétrospective = on inspecte notre façon de travailler."
definitions:
  - terme: "Scrum"
    definition: "Cadre agile où une équipe livre un produit par sprints courts, avec 3 rôles, 3 artefacts et 5 événements."
  - terme: "Sprint"
    definition: "Cycle de durée fixe (un mois maximum) pendant lequel l'équipe crée un incrément utilisable."
  - terme: "Product Owner (PO)"
    definition: "Personne responsable de la valeur du produit : elle ordonne le Product Backlog."
    exemple: "Martin, dans le Quiz Dynamique."
  - terme: "Scrum Master (SM)"
    definition: "Garant du cadre Scrum : un facilitateur sans pouvoir hiérarchique qui lève les obstacles de l'équipe."
    exemple: "Toi, dans le Quiz Dynamique."
  - terme: "Incrément"
    definition: "Morceau de produit terminé et utilisable, qui respecte la Definition of Done."
  - terme: "Obstacle (impediment)"
    definition: "Tout ce qui empêche l'équipe d'avancer ; le Scrum Master aide à le lever."
    exemple: "Un accès au dépôt qui manque, une validation qui traîne."
  - terme: "Daily Scrum"
    definition: "Point quotidien de 15 minutes maximum où les Développeurs font le point sur l'objectif du sprint."
flashcards:
  - q: "Quels sont les 3 rôles de Scrum ?"
    r: "Product Owner, Scrum Master et Développeurs."
  - q: "Combien de temps dure un sprint au maximum ?"
    r: "Un mois. Souvent 1 à 2 semaines, et la durée reste fixe."
  - q: "Qui ordonne le Product Backlog ?"
    r: "Le Product Owner, selon la valeur de chaque élément."
  - q: "Le Scrum Master est-il le chef de l'équipe ?"
    r: "Non. Il n'a aucune autorité hiérarchique : il facilite et lève les obstacles."
  - q: "Quelles sont les 4 missions du Scrum Master ?"
    r: "Faciliter les événements, éliminer les obstacles, coacher l'équipe, la protéger des perturbations."
  - q: "Quels sont les 3 artefacts de Scrum ?"
    r: "Le Product Backlog, le Sprint Backlog et l'Incrément."
  - q: "Quel engagement va avec l'Incrément ?"
    r: "La Definition of Done."
  - q: "Combien dure le Daily Scrum ?"
    r: "15 minutes maximum, chaque jour, à la même heure."
  - q: "Différence entre Sprint Review et Rétrospective ?"
    r: "La Review inspecte le produit avec les parties prenantes. La Rétro inspecte la façon de travailler de l'équipe."
  - q: "Quel était ton rôle dans le Quiz Dynamique ?"
    r: "Scrum Master et développeur. Martin était Product Owner et développeur."
  - q: "Qui peut annuler un sprint ?"
    r: "Seul le Product Owner, si l'objectif du sprint n'a plus de sens."
quiz:
  - question: "Qui décide de l'ordre des éléments du Product Backlog ?"
    choix:
      - "Le Scrum Master"
      - "Le Product Owner"
      - "Les Développeurs, par un vote"
      - "Le client, directement"
    reponse: "Le Product Owner"
    explication: "Le PO est responsable du Product Backlog : il l'ordonne selon la valeur. Les autres peuvent proposer, c'est lui qui tranche."
  - question: "Quelle phrase décrit le mieux le Scrum Master ?"
    choix:
      - "Le chef qui assigne les tâches"
      - "Un facilitateur sans pouvoir hiérarchique"
      - "Le développeur le plus expérimenté"
      - "Le représentant du client"
    reponse: "Un facilitateur sans pouvoir hiérarchique"
    explication: "Le Scrum Master sert l'équipe (servant leadership) : il anime, lève les obstacles et protège, mais ne décide pas à la place de l'équipe."
  - question: "Quelle est la durée maximale d'un Daily Scrum ?"
    choix:
      - "5 minutes"
      - "15 minutes"
      - "30 minutes"
      - "1 heure"
    reponse: "15 minutes"
    explication: "Le Daily est un point court : 15 minutes maximum. Les sujets longs se traitent après, avec les personnes concernées."
  - question: "Pendant quel événement l'équipe montre-t-elle le produit terminé aux parties prenantes ?"
    choix:
      - "Le Sprint Planning"
      - "Le Daily Scrum"
      - "La Sprint Review"
      - "La Rétrospective"
    reponse: "La Sprint Review"
    explication: "La Review inspecte l'incrément avec les parties prenantes et ajuste le backlog. La Rétrospective, elle, porte sur la façon de travailler."
  - question: "Quel artefact contient les stories choisies pour le sprint en cours ?"
    choix:
      - "Le Product Backlog"
      - "Le Sprint Backlog"
      - "L'Incrément"
      - "La Definition of Done"
    reponse: "Le Sprint Backlog"
    explication: "Le Sprint Backlog = l'objectif du sprint + les stories choisies + le plan pour les réaliser. Le Product Backlog contient tout le reste."
  - question: "Le sprint prend du retard. Que fait une équipe Scrum ?"
    choix:
      - "Elle rallonge le sprint d'une semaine"
      - "Elle garde la durée et renégocie le périmètre avec le PO"
      - "Elle supprime la rétrospective pour gagner du temps"
      - "Elle arrête les Daily jusqu'à la fin"
    reponse: "Elle garde la durée et renégocie le périmètre avec le PO"
    explication: "La durée d'un sprint est fixe. Ce qui peut bouger, c'est le travail prévu : on le renégocie avec le Product Owner, sans mettre en danger l'objectif du sprint."
exercices:
  - titre: "Qui fait quoi ?"
    niveau: facile
    enonce: "Associe chaque action à un rôle (PO, SM ou Développeurs) : a) passer une story de Review à Done après vérification (dans ton TP) ; b) animer la rétrospective ; c) coder US-06 sur sa branche ; d) placer US-08 avant US-09 dans le backlog ; e) débloquer un accès au dépôt qui manque."
    indices:
      - "Le PO s'occupe du QUOI et de la valeur."
      - "Le SM s'occupe du cadre et de ce qui bloque."
    solution: |
      ```text
      a) PO           (Martin vérifiait les critères d'acceptation)
      b) SM           (toi, au Sprint 2)
      c) Développeurs (toi, feature/melange-questions)
      d) PO           (il ordonne le Product Backlog)
      e) SM           (lever un obstacle)
      ```
  - titre: "Ranger les mots de Scrum"
    niveau: moyen
    enonce: "Classe ces 8 éléments en rôle, artefact ou événement : Sprint Review, Incrément, Product Owner, Daily Scrum, Sprint Backlog, Scrum Master, Rétrospective, Product Backlog."
    indices:
      - "Un artefact est un support de travail visible par tous."
      - "Il y a 3 rôles, 3 artefacts et 5 événements (dont le Sprint lui-même)."
    solution: |
      ```text
      Rôles      : Product Owner, Scrum Master
      Artefacts  : Incrément, Sprint Backlog, Product Backlog
      Événements : Sprint Review, Daily Scrum, Rétrospective
      (manquent ici : le rôle Développeurs, et les événements Sprint et Sprint Planning)
      ```
  - titre: "Une demande en plein sprint"
    niveau: difficile
    enonce: "En plein Sprint 2, Martin (PO) veut ajouter « classement en ligne avec un serveur ». Tu es Scrum Master. Que réponds-tu, en 3 points ?"
    indices:
      - "Relis l'objectif du sprint : rejouabilité (thèmes, mélange, difficulté)."
      - "Où vont les nouvelles idées en Scrum ?"
      - "Pense à ce qui avait été écarté (YAGNI) au planning."
    solution: |
      ```text
      1. L'objectif du sprint est protégé : on n'ajoute pas une grosse story
         en cours de route (et le backend avait été écarté au planning, YAGNI).
      2. L'idée va dans le Product Backlog : Martin, en PO, pourra la
         prioriser pour un prochain sprint, après estimation par l'équipe.
      3. Si l'objectif du sprint n'avait plus aucun sens, seul le PO pourrait
         annuler le sprint ; ici ce n'est pas le cas, on continue.
      ```
---

## Scrum en une phrase

:::quoi
**Scrum** est un **cadre agile** : au lieu de tout livrer à la fin, l'équipe avance par **sprints** (cycles de durée fixe, un mois maximum, souvent 1 à 2 semaines) et livre à chaque fois un morceau qui marche.
:::

:::exemple
```text
Sprint Planning  → on fixe l'objectif et on choisit les stories
Sprint           → on code, avec un Daily de 15 min chaque jour
Sprint Review    → on montre ce qui marche
Rétrospective    → on améliore notre façon de travailler
Puis on recommence avec le sprint suivant.
```
:::

:::piege
Agile ne veut pas dire « sans plan » : chaque sprint a un **objectif** et une durée **fixe**, qu'on ne rallonge pas.
:::

:::ou[Dans le Quiz Dynamique]
Le Sprint 1 avait été livré par l'équipe précédente ; toi et Martin avez fait le **Sprint 2**, un sprint très court.
:::

## Les 3 rôles

:::quoi
Une **équipe Scrum** (souvent 10 personnes ou moins) a 3 rôles : le **Product Owner** porte la valeur et **ordonne** le backlog, le **Scrum Master** fait vivre le cadre, les **Développeurs** réalisent le travail.
:::

:::exemple
```md title="docs/01-roles.md"
| Membre       | Rôle Scrum         | Aussi développeur ? |
| ------------ | ------------------ | ------------------- |
| **Jonathan** | Scrum Master       | Oui                 |
| **Martin**   | Product Owner (PO) | Oui                 |
```
:::

:::piege
Le PO ne dit pas **comment** coder : il dit **quoi** faire et dans quel ordre. Le comment appartient aux Développeurs.
:::

:::ou[Dans le Quiz Dynamique]
Toi = **Scrum Master** et dev ; Martin = **Product Owner** et dev. Dans une petite équipe, cumuler un rôle et le développement est normal.
:::

## Le Scrum Master n'est pas un chef

:::quoi
Le **Scrum Master** n'a **aucune autorité hiérarchique**. C'est un **facilitateur** (on parle de *servant leadership*) : il anime les événements, **lève les obstacles**, coache l'équipe et la **protège** des perturbations.
:::

:::exemple
```md
| Chef de projet classique   | Scrum Master                 |
| -------------------------- | ---------------------------- |
| assigne les tâches         | l'équipe s'organise seule    |
| décide du quoi et du quand | facilite, ne décide pas      |
| contrôle l'avancement      | enlève ce qui bloque         |
```
:::

:::piege
« Le Scrum Master distribue les tâches » : **faux**. Les Développeurs choisissent eux-mêmes comment se répartir le travail.
:::

:::ou[Dans ton TP Scrum Master]
Ta présentation orale (sujet 5) : les **4 missions** — faciliter, éliminer les obstacles, coacher, protéger. Dans le Quiz, tu animais le daily et la rétro.
:::

## Les 3 artefacts et leurs engagements

:::quoi
Un **artefact** est un support de travail visible par tous. Scrum en a 3, chacun avec un **engagement** : le **Product Backlog** (le Product Goal), le **Sprint Backlog** (le Sprint Goal) et l'**Incrément** (la Definition of Done).
:::

:::exemple
```text
Product Backlog → tout ce qu'il reste à faire, dans l'ordre
                  (US-08 récap des erreurs, US-09, US-10, US-11…)
Sprint Backlog  → les stories choisies pour CE sprint + le plan
                  (US-05, US-06, US-07 = 8 points)
Incrément       → le produit qui marche à la fin, conforme à la DoD
                  (le quiz avec thèmes, mélange et difficulté)
```
:::

:::piege
La **Definition of Done** n'est pas la même chose que les **critères d'acceptation** : la DoD vaut pour **toutes** les stories, les critères pour **une seule**.
:::

:::ou[Dans le Quiz Dynamique]
`docs/03-backlog-user-stories.md` = le Product Backlog ; le tableau de `docs/02-sprint-planning.md` = le Sprint Backlog.
:::

## Les 5 événements

:::quoi
Le **Sprint** contient les 4 autres : le **Sprint Planning** (au début), le **Daily Scrum** (chaque jour), la **Sprint Review** (montrer l'incrément aux parties prenantes) et la **Rétrospective** (améliorer la façon de travailler).
:::

:::exemple
```md title="docs/01-roles.md"
| Cérémonie              | Durée   | Quand          |
| ---------------------- | ------- | -------------- |
| Sprint planning        | 30 min  | Début          |
| Sprint (développement) | —       | Cœur du sprint |
| Daily meeting (mêlée)  | ~15 min | Chaque matin   |
| Sprint retrospective   | 30 min  | Fin            |
```
:::

:::piege
**Review** (on regarde le **produit**) ≠ **Rétrospective** (on regarde **notre façon de travailler**). Le tableau du TP oubliait la Review : dans Scrum, elle fait partie des 5 événements.
:::

:::ou[Dans le Quiz Dynamique]
En Scrum Master, tu animais la **mêlée quotidienne** et la **rétrospective** du Sprint 2.
:::

## Le Daily Scrum

:::quoi
Le **Daily Scrum** (la mêlée) dure **15 minutes maximum**, chaque jour, à la même heure. Les Développeurs y vérifient leur avancée vers l'**objectif du sprint** et signalent ce qui bloque.
:::

:::exemple
```text
Format classique, chacun son tour :
1. Qu'est-ce que j'ai fait hier pour l'objectif du sprint ?
2. Qu'est-ce que je vais faire aujourd'hui ?
3. Est-ce que quelque chose me bloque ?
```
:::

:::piege
Le Daily n'est **pas** la réunion pour résoudre les problèmes : si un sujet s'éternise, on en parle **juste après**, avec les personnes concernées.
:::

:::ou[En TP et en alternance]
Partout où tu travailles en équipe. « Des dailies courtes et régulières » était un point **Continue** de ta rétro du Sprint 2.
:::
