---
titre: "Sprint planning et rétrospective"
matiere: gestion-projet
type: cours
chapitre: 3
niveau: debutant
duree: 10
date: 2026-07-29
source: "Projet Quiz Dynamique : docs/02-sprint-planning.md et docs/04-sprint-retrospective.md"
tags: [scrum, sprint-planning, retrospective, definition-of-done]
essentiel: "Le Sprint Planning ouvre le sprint : on fixe un objectif, on choisit les stories qui tiennent dans la capacité de l'équipe et on rappelle la Definition of Done. La rétrospective le ferme : l'équipe regarde sa façon de travailler et repart avec 2 ou 3 actions concrètes."
retenir:
  - "Le Sprint Goal dit pourquoi le sprint a de la valeur ; ce n'est pas une liste de tâches."
  - "On prend ce que l'équipe peut vraiment finir, en commençant par ce dont les autres stories dépendent."
  - "Écarter (YAGNI) n'est pas jeter : l'idée retourne dans le backlog."
  - "Une story est Done seulement si toute la Definition of Done est cochée."
  - "Une rétro finit par des actions concrètes, chacune avec un responsable."
definitions:
  - terme: "Sprint Planning"
    definition: "Événement qui ouvre le sprint : on fixe l'objectif, on choisit les stories et on prévoit comment les réaliser."
  - terme: "Sprint Goal"
    definition: "Objectif unique du sprint : la raison pour laquelle ce sprint a de la valeur."
  - terme: "Vélocité"
    definition: "Nombre de points qu'une équipe livre en moyenne par sprint ; elle aide à estimer sa capacité."
  - terme: "Definition of Done (DoD)"
    definition: "Checklist commune qu'une story doit remplir pour être considérée comme terminée."
  - terme: "YAGNI"
    definition: "You Aren't Gonna Need It : ne pas développer ce qui n'est pas nécessaire maintenant."
  - terme: "Rétrospective"
    definition: "Événement de fin de sprint où l'équipe inspecte et améliore sa façon de travailler."
  - terme: "Start / Stop / Continue"
    definition: "Format de rétrospective en 3 colonnes : ce qu'on commence, ce qu'on arrête, ce qu'on garde."
flashcards:
  - q: "Que décide-t-on au Sprint Planning ?"
    r: "L'objectif du sprint, les stories choisies et un premier plan pour les réaliser."
  - q: "Quel était le Sprint Goal du Sprint 2 du Quiz ?"
    r: "Enrichir la rejouabilité du quiz : variété (thèmes et mélange) et difficulté progressive."
  - q: "Pourquoi le multi-thème en premier ?"
    r: "Il créait les banques de questions par thème (data.js), dont dépendaient les autres stories."
  - q: "Que veut dire YAGNI ?"
    r: "You Aren't Gonna Need It : on ne code pas ce qui n'est pas utile maintenant."
  - q: "DoD ou critères d'acceptation : lequel vaut pour toutes les stories ?"
    r: "La Definition of Done. Les critères d'acceptation sont propres à chaque story."
  - q: "Une story à moitié faite en fin de sprint rapporte combien de points ?"
    r: "Zéro : elle n'est pas Done, elle retourne dans le Product Backlog."
  - q: "Qu'est-ce que la vélocité ?"
    r: "Les points livrés en moyenne par sprint. Elle aide à choisir combien de points prendre."
  - q: "Que regarde-t-on en rétrospective ?"
    r: "La façon de travailler de l'équipe, pas le produit."
  - q: "Les 3 colonnes Start / Stop / Continue ?"
    r: "Start = ce qu'on commence, Stop = ce qu'on arrête, Continue = ce qu'on garde."
  - q: "À quoi ressemble une bonne action de rétro ?"
    r: "Concrète, vérifiable, avec un responsable. Exemple : créer un modèle de PR avec la checklist DoD (Scrum Master)."
  - q: "Un « Stop » de ta rétro du Sprint 2 ?"
    r: "Travailler directement sur develop, et écrire des messages de commit vagues comme « fix » ou « update »."
quiz:
  - question: "Quel est le meilleur Sprint Goal ?"
    choix:
      - "Faire US-05, US-06 et US-07."
      - "Enrichir la rejouabilité du quiz avec des thèmes, du mélange et une difficulté progressive."
      - "Coder le plus vite possible."
      - "Finir tout le backlog."
    reponse: "Enrichir la rejouabilité du quiz avec des thèmes, du mélange et une difficulté progressive."
    explication: "Un Sprint Goal donne le but commun et la valeur. Une liste de stories, c'est le Sprint Backlog."
  - question: "L'équipe livre en moyenne 8 points par sprint. Le PO en propose 13. Que fais-tu ?"
    choix:
      - "On accepte et on fera des heures en plus."
      - "On prend environ 8 points en haut du backlog et on garde le reste pour plus tard."
      - "On prend 13 points et on raccourcit la rétro."
      - "On réestime tout à 1 point pour que ça rentre."
    reponse: "On prend environ 8 points en haut du backlog et on garde le reste pour plus tard."
    explication: "La vélocité passée donne la capacité réaliste. Surcharger le sprint donne des stories à moitié faites, qui valent zéro."
  - question: "Fin du sprint : US-07 marche, mais n'est pas encore mergée dans develop. D'après ta DoD, elle est…"
    choix:
      - "Done"
      - "Pas Done : elle reste en Review"
      - "À moitié Done : 1,5 point sur 3"
      - "Annulée"
    reponse: "Pas Done : elle reste en Review"
    explication: "Le point 5 de ta DoD exige le merge dans develop (`--no-ff`). Tant qu'il manque, la story n'est pas Done."
  - question: "Laquelle est une vraie action de rétrospective ?"
    choix:
      - "Mieux communiquer"
      - "Être plus motivés"
      - "Créer un modèle de Pull Request avec la checklist DoD (responsable : Scrum Master)"
      - "Faire moins d'erreurs"
    reponse: "Créer un modèle de Pull Request avec la checklist DoD (responsable : Scrum Master)"
    explication: "Elle est concrète, a un responsable, et on pourra vérifier au sprint suivant si elle est faite. Les autres sont des souhaits."
  - question: "Au planning, « classement en ligne » est marqué YAGNI. Ça veut dire…"
    choix:
      - "La fonctionnalité est supprimée pour toujours."
      - "Elle n'est pas utile pour ce sprint : elle reste dans le backlog."
      - "Elle doit être faite en urgence."
      - "Elle est confiée au Scrum Master."
    reponse: "Elle n'est pas utile pour ce sprint : elle reste dans le backlog."
    explication: "Écarter n'est pas jeter : le PO pourra la reprioriser plus tard. Ici, elle demandait un backend, hors périmètre."
  - question: "En rétro, Martin dit que les revues arrivent trop tard. Quelle réponse respecte l'esprit de la rétro ?"
    choix:
      - "Chercher qui est en retard et le noter."
      - "Ouvrir la Pull Request dès qu'une feature est prête, pour que la revue commence plus tôt."
      - "Supprimer les revues."
      - "Ignorer la remarque, le sprint est fini."
    reponse: "Ouvrir la Pull Request dès qu'une feature est prête, pour que la revue commence plus tôt."
    explication: "La rétro améliore les pratiques, sans chercher de coupable. C'est d'ailleurs un vrai point Start de ta rétro du Sprint 2."
exercices:
  - titre: "Start, Stop ou Continue ?"
    niveau: facile
    enonce: "Classe ces remarques : a) des messages de commit « update » ; b) une branche feature/… par story ; c) écrire les critères d'acceptation dès le planning ; d) des dailies courtes et régulières."
    indices:
      - "Stop = une mauvaise habitude à arrêter."
      - "Continue = ce qui marche déjà ; Start = ce qu'on ne fait pas encore."
    solution: |
      ```text
      Stop     : a) les messages de commit vagues (« update »)
      Continue : b) une branche feature/… par story
      Start    : c) les critères d'acceptation dès le planning
      Continue : d) les dailies courtes et régulières
      ```
  - titre: "Préparer un sprint"
    niveau: moyen
    enonce: "Capacité : 8 points. Backlog dans l'ordre du PO : US-08 récap des erreurs (3 pts), US-09 nombre de questions (2 pts), US-10 bonus de rapidité (5 pts), US-11 thème clair / sombre (3 pts). Choisis les stories et écris un Sprint Goal."
    indices:
      - "Additionne en partant du haut : où dépasses-tu 8 ?"
      - "Une story qui ne rentre pas peut laisser la place à une plus petite, avec l'accord du PO."
      - "Le Sprint Goal relie les stories choisies par une valeur commune."
    solution: |
      ```md
      Sprint Backlog : US-08 (3) + US-09 (2) + US-11 (3) = 8 points
      US-10 (5) ne rentre pas : elle reste en haut du backlog pour le
      prochain sprint (choix validé avec le PO).

      Sprint Goal : « Rendre le quiz plus utile et plus confortable :
      comprendre ses erreurs, choisir la longueur de la partie et le thème visuel. »
      ```
  - titre: "Animer une rétro difficile"
    niveau: difficile
    enonce: "Sprint raté : 5 points livrés sur 8, deux personnes ont codé directement sur develop (conflits), la revue a eu lieu le dernier jour. Rédige la rétro : bilan, 1 Start, 1 Stop, 1 Continue, 2 actions avec responsable."
    indices:
      - "Le bilan reprend l'objectif et les points livrés."
      - "Parle des pratiques, pas des personnes."
      - "Une action se vérifie au sprint suivant."
    solution: |
      ```md
      Bilan : Sprint Goal non atteint, 5 / 8 points.
      Start    : ouvrir la PR dès qu'une feature est prête.
      Stop     : coder directement sur develop (toujours une branche feature/…).
      Continue : les dailies courtes.
      | Action                                         | Responsable  |
      | ---------------------------------------------- | ------------ |
      | Protéger develop sur GitHub (merge par PR)     | Scrum Master |
      | Revue de chaque PR sous 24 h                   | PO           |
      ```
---

## L'objectif du sprint (Sprint Goal)

:::quoi
Le **Sprint Goal** est une phrase qui dit **pourquoi** ce sprint a de la valeur. Il guide tous les choix pendant le sprint.
:::

:::exemple
```md title="docs/02-sprint-planning.md"
## Objectif du sprint (Sprint Goal)

> Enrichir la rejouabilité et l'engagement du quiz : variété (thèmes +
> mélange) et courbe de progression (difficulté).
```
:::

:::piege
Un objectif n'est pas une liste de tâches (« faire US-05, US-06, US-07 ») : c'est le **but commun** qui relie ces stories.
:::

:::ou[Dans le Quiz Dynamique]
Sprint 2 : la rejouabilité, grâce aux thèmes, au mélange et à la difficulté progressive.
:::

## Choisir les stories : capacité et dépendances

:::quoi
L'équipe prend, en haut du backlog, **ce qu'elle peut vraiment finir** : sa **capacité**, souvent estimée avec la **vélocité** (les points livrés aux sprints précédents). On commence par les stories dont **les autres dépendent**.
:::

:::exemple
```md title="docs/02-sprint-planning.md"
### Justification des choix
- **Multi-thème d'abord** : restructure les données en banques par thème,
  fondation dont dépendent les autres stories.
- **Mélange** : petit effort, gros impact sur la rejouabilité (Fisher-Yates).
```
:::

:::piege
Prendre trop de points « pour faire plaisir » : une story à moitié faite ne compte pas, elle vaut **zéro**.
:::

:::ou[Dans le Quiz Dynamique]
8 points sur un sprint très court, et le multi-thème d'abord, car il créait `data.js` (les banques de questions par thème).
:::

## Écarter : YAGNI

:::quoi
**YAGNI** (*You Aren't Gonna Need It*, « tu n'en auras pas besoin ») : on n'ajoute pas ce qui n'est pas nécessaire **maintenant**. Au planning, on écrit noir sur blanc ce qu'on **écarte**.
:::

:::exemple
```md title="docs/02-sprint-planning.md"
### Écarté (YAGNI)
- Classement en ligne / backend (on reste en JS natif + `localStorage`).
- Éditeur de questions dans l'UI.
```
:::

:::piege
Écarter n'est pas jeter : l'idée retourne dans le **Product Backlog** pour un sprint futur.
:::

:::ou[Dans le Quiz Dynamique]
Le classement en ligne demandait un serveur : hors périmètre d'un quiz en JavaScript natif.
:::

## La Definition of Done (DoD)

:::quoi
La **Definition of Done** est la checklist **commune** qu'une story doit cocher pour être **Done**. Elle vaut pour **toutes** les stories, en plus de leurs critères d'acceptation.
:::

:::exemple
```md title="docs/02-sprint-planning.md"
1. Code développé sur une branche `feature/…` issue de `develop`.
2. Critères d'acceptation de la story satisfaits.
3. Story validée par le PO en **Review** (revue de branche).
4. Aucune erreur console ; navigation fluide intro → question → résultat.
5. Branche **mergée dans `develop`** (`--no-ff`) avec un message clair.
```
:::

:::piege
« Ça marche sur mon PC » ne suffit pas. S'il manque **un seul** point de la DoD, la story reste en **Review**.
:::

:::ou[Dans le Quiz Dynamique]
La DoD du Sprint 2 : branche feature, critères remplis, revue du PO, zéro erreur console, merge `--no-ff` dans develop.
:::

## La rétrospective : Start / Stop / Continue

:::quoi
La **rétrospective** clôt le sprint : l'équipe regarde **sa façon de travailler** (pas le produit). Format simple : **Start** (à commencer), **Stop** (à arrêter), **Continue** (à garder).
:::

:::exemple
```md title="docs/04-sprint-retrospective.md"
### Start (à commencer)
- Rédiger des critères d'acceptation testables dès le planning.

### Stop (à arrêter)
- Travailler directement sur `develop` (toujours passer par `feature/…`).
- Messages de commit vagues (« fix », « update »).

### Continue (à poursuivre)
- Le workflow Gitflow (branche par feature + merge `--no-ff`).
```
:::

:::piege
La rétro n'est pas un tribunal : on parle des **pratiques**, pas des personnes. Le but est de s'améliorer, pas de trouver un coupable.
:::

:::ou[Dans le Quiz Dynamique]
C'est toi, en Scrum Master, qui as animé la rétro du Sprint 2.
:::

## Les actions de la rétro et la météo

:::quoi
Une rétro utile finit par **2 ou 3 actions concrètes**, chacune avec un **responsable**. La **météo** (soleil, nuages, pluie) permet à chacun de donner son ressenti en un mot.
:::

:::exemple
```md title="docs/04-sprint-retrospective.md"
| Action                                       | Responsable  |
| -------------------------------------------- | ------------ |
| Modèle de Pull Request avec checklist DoD    | Scrum Master |
| Ajouter le récapitulatif des erreurs (US-08) | Équipe       |
| Déployer une release sur GitHub Pages        | PO           |
```
:::

:::piege
« Mieux communiquer » n'est pas une action : c'est trop vague. Une vraie action se vérifie au sprint suivant (« modèle de PR créé : oui ou non »).
:::

:::ou[Dans le Quiz Dynamique]
Ta météo : soleil (« Gitflow bien maîtrisé »). Celle de Martin : nuageux (« reviews à anticiper »).
:::
