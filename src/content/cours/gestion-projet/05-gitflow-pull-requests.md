---
titre: "Gitflow et pull requests"
matiere: gestion-projet
type: cours
chapitre: 5
niveau: intermediaire
duree: 12
date: 2026-07-30
source: "Quiz Dynamique (releases 1.0.0 et 1.1.0, hotfix 1.1.1) + TP reco films (PR #1 à #6)"
tags: [git, gitflow, pull-request, revue-de-code, release]
essentiel: "Gitflow range les branches : main = la production, develop = l'intégration, feature/ = une fonctionnalité, release/ = préparer une version, hotfix/ = corriger la production en urgence. Sur GitHub, on fusionne par pull request, après une revue de code."
retenir:
  - "On ne code jamais directement sur main ni sur develop."
  - "feature part de develop et y revient ; hotfix part de main."
  - "release et hotfix reviennent dans main (avec un tag) ET dans develop."
  - "--no-ff garde un commit de merge : on voit la feature dans l'historique."
  - "Petite PR, base develop, revue avant le merge."
definitions:
  - terme: "Gitflow"
    definition: "Organisation des branches en main, develop, feature, release et hotfix."
  - terme: "Pull request (PR)"
    definition: "Demande, sur GitHub, de fusionner une branche dans une autre, avec une revue de code."
  - terme: "Revue de code"
    definition: "Relecture du code d'un collègue avant le merge : on vérifie, on commente, puis on approuve."
  - terme: "Tag"
    definition: "Étiquette fixe posée sur un commit pour marquer une version."
    exemple: "git tag -a 1.1.0 -m \"1.1.0\""
  - terme: "Fast-forward"
    definition: "Merge sans commit de fusion : Git avance simplement le pointeur de la branche."
  - terme: "Release"
    definition: "Branche qui prépare une version (numéro, derniers réglages) avant sa mise en production."
  - terme: "Hotfix"
    definition: "Branche créée depuis main pour corriger un bug en production."
  - terme: "Versionnage sémantique (SemVer)"
    definition: "Numéro MAJEUR.MINEUR.CORRECTIF : on augmente le chiffre qui correspond au type de changement."
    exemple: "1.1.0 → 1.1.1 pour un correctif, 1.2.0 pour une nouveauté compatible."
flashcards:
  - q: "Rôle de main en Gitflow ?"
    r: "Les versions stables, en production, avec un tag par version."
  - q: "Rôle de develop ?"
    r: "La branche d'intégration : elle reçoit les features terminées."
  - q: "D'où part une feature, et où revient-elle ?"
    r: "Elle part de develop et revient dans develop."
  - q: "D'où part un hotfix, et où revient-il ?"
    r: "Il part de main et revient dans main (avec un tag) et dans develop."
  - q: "Où merge-t-on une release terminée ?"
    r: "Dans main (avec un tag) et dans develop."
  - q: "À quoi sert --no-ff ?"
    r: "À créer toujours un commit de merge, pour garder la trace de la branche dans l'historique."
  - q: "git push envoie-t-il les tags ?"
    r: "Non. Il faut git push --tags, ou git push origin 1.1.0."
  - q: "Base et compare, dans une pull request ?"
    r: "Base : la branche qui reçoit (develop). Compare : ta branche (feature/…)."
  - q: "Que fait le relecteur d'une PR ?"
    r: "Il lit le code, le teste, commente, demande des corrections si besoin, puis approuve."
  - q: "1.1.0 → 1.1.1, ça veut dire quoi ?"
    r: "Un correctif, sans nouvelle fonctionnalité : c'était le hotfix du Quiz."
  - q: "Quel était le hotfix 1.1.1 du Quiz ?"
    r: "Un index.html à la racine qui redirige vers pages/index.html, car GitHub Pages servait la racine du dépôt."
  - q: "Pourquoi faire des PR petites ?"
    r: "Une petite PR se relit vite et sérieusement ; une énorme est survolée."
quiz:
  - question: "Un bug bloque le site en production. Depuis quelle branche crées-tu le correctif ?"
    choix:
      - "develop"
      - "main"
      - "feature/bug"
      - "release/1.2.0"
    reponse: "main"
    explication: "Un hotfix part de main, la version en production, pour corriger sans embarquer le travail pas encore livré de develop."
  - question: "Où merges-tu une branche release/1.1.0 terminée ?"
    choix:
      - "Seulement dans main"
      - "Seulement dans develop"
      - "Dans main (avec un tag) et dans develop"
      - "Nulle part, on la supprime"
    reponse: "Dans main (avec un tag) et dans develop"
    explication: "main reçoit la version (tag 1.1.0) ; develop récupère les derniers changements faits sur la release (ici, le fichier version)."
  - question: "Quel est l'intérêt de `git merge --no-ff` ?"
    choix:
      - "Aller plus vite"
      - "Éviter tous les conflits"
      - "Créer un commit de merge qui garde la trace de la feature"
      - "Supprimer la branche automatiquement"
    reponse: "Créer un commit de merge qui garde la trace de la feature"
    explication: "Sans --no-ff, Git peut faire un fast-forward : les commits de la feature se fondent dans develop et on ne voit plus qu'elle a existé."
  - question: "Tu as fait `git tag -a 1.1.0 -m \"1.1.0\"` puis `git push`. Sur GitHub, le tag…"
    choix:
      - "est bien là"
      - "n'est pas envoyé : il faut git push --tags"
      - "remplace la branche main"
      - "est envoyé, mais vide"
    reponse: "n'est pas envoyé : il faut git push --tags"
    explication: "git push n'envoie que les branches. Les tags partent avec git push --tags ou git push origin 1.1.0."
  - question: "Dans le TP reco films, quelle est la base des pull requests de feature ?"
    choix:
      - "main"
      - "develop"
      - "gh-pages"
      - "la branche du binôme"
    reponse: "develop"
    explication: "Le README le dit : develop est la branche d'intégration, cible de toutes les PR. main ne reçoit que les versions stables."
  - question: "Version 1.1.1 : tu ajoutes une fonctionnalité compatible. Nouveau numéro ?"
    choix:
      - "1.1.2"
      - "1.2.0"
      - "2.0.0"
      - "1.1.1-bis"
    reponse: "1.2.0"
    explication: "Nouveauté compatible : MINEUR + 1, et CORRECTIF repart à 0. 1.1.2 serait un simple correctif, 2.0.0 un changement qui casse la compatibilité."
  - question: "Quel comportement est le meilleur en revue de code ?"
    choix:
      - "Approuver sans lire pour aller vite"
      - "Commenter précisément et proposer une piste (« et si on extrayait cette fonction ? »)"
      - "Pousser ses corrections sur la branche du collègue sans rien dire"
      - "Refuser toute PR de plus de 10 lignes"
    reponse: "Commenter précisément et proposer une piste (« et si on extrayait cette fonction ? »)"
    explication: "Une bonne revue est précise, bienveillante et vérifie les critères d'acceptation. Le but : un meilleur code, pas un jugement."
exercices:
  - titre: "Nommer les branches"
    niveau: facile
    enonce: "Version actuelle : 1.2.0. Donne le nom Gitflow de la branche et sa branche de départ pour : a) la story « bonus de rapidité » ; b) préparer la version 1.3.0 ; c) corriger en urgence un score faux en production."
    indices:
      - "Une story = une feature."
      - "Un bug en production = un hotfix, qui augmente le CORRECTIF."
    solution: |
      ```text
      a) feature/bonus-rapidite  depuis develop
      b) release/1.3.0           depuis develop
      c) hotfix/1.2.1            depuis main
      ```
  - titre: "Une feature jusqu'à la pull request"
    niveau: moyen
    enonce: "Écris les commandes pour coder la story « bonus de rapidité » (fichier assets/js/score.js) jusqu'à l'ouverture de la PR, puis le ménage après le merge."
    indices:
      - "Pars d'un develop à jour."
      - "La PR s'ouvre sur GitHub : base develop, compare ta branche."
      - "Après le merge, mets develop à jour et supprime ta branche locale."
    solution: |
      ```bash
      git switch develop
      git pull
      git switch -c feature/bonus-rapidite
      git add assets/js/score.js
      git commit -m "feat(score): bonus de points selon la rapidite"
      git push -u origin feature/bonus-rapidite
      # Sur GitHub : Pull request, base develop <- compare feature/bonus-rapidite
      # Après le merge :
      git switch develop && git pull && git branch -d feature/bonus-rapidite
      ```
  - titre: "Le hotfix complet"
    niveau: difficile
    enonce: "La version 1.2.0 est en production. Corrige le bug de score (assets/js/score.js), passe le fichier version à 1.2.1, publie la version dans main avec son tag, reporte la correction dans develop et envoie tout sur GitHub."
    indices:
      - "Le hotfix part de main à jour."
      - "Deux merges --no-ff : dans main, puis dans develop."
      - "N'oublie pas d'envoyer le tag."
    solution: |
      ```bash
      git switch main && git pull
      git switch -c hotfix/1.2.1
      # … je corrige assets/js/score.js …
      echo "1.2.1" > version
      git add assets/js/score.js version
      git commit -m "fix(score): le score final compte bien la derniere question"
      git switch main && git merge --no-ff --no-edit hotfix/1.2.1
      git tag -a 1.2.1 -m "1.2.1"
      git switch develop && git merge --no-ff --no-edit hotfix/1.2.1
      git push origin main develop --tags
      git branch -d hotfix/1.2.1
      ```
---

## main et develop

:::quoi
**main** ne contient que les versions **stables** (en production, avec un **tag** par version). **develop** reçoit les fonctionnalités terminées : c'est la branche d'**intégration**.
:::

:::exemple
```md title="README.md"
## Workflow Git (Gitflow)

- `main` — versions stables uniquement (fin de phase 1, rendu final)
- `develop` — branche d'intégration, cible de toutes les Pull Requests
- `feature/<nom>` — une branche par fonctionnalité, créée depuis `develop`
```
:::

:::piege
On ne code **jamais** directement sur main, ni sur develop : toujours sur une branche `feature/…`.
:::

:::ou[Dans le TP reco films]
C'est le README de `drakurei/tp-ia-reco-films`. Dans le Quiz aussi, main n'était pas touché pendant le sprint.
:::

## Les branches feature

:::quoi
Une **feature** part de **develop**, porte **une** user story, et revient dans **develop** quand elle est finie. Son nom : `feature/<nom-court>`.
:::

:::exemple
```bash
git switch develop
git pull
git switch -c feature/ma-fonctionnalite
# … développement, commits …
git push -u origin feature/ma-fonctionnalite
```
:::

:::piege
Une feature qui dure trop longtemps s'éloigne de develop : gros conflits au merge. Fais des features **petites** et merge souvent.
:::

:::ou[Dans le Quiz Dynamique]
`feature/mode-multi-theme`, `feature/melange-questions` (la tienne), `feature/difficulte-progressive`, `feature/indice-par-question`.
:::

## Merger avec `--no-ff`

:::quoi
Si develop n'a pas bougé, Git fait par défaut un **fast-forward** : il avance le pointeur, sans commit de fusion. Avec **`--no-ff`**, Git crée **toujours** un **commit de merge** : l'historique montre que la feature a existé.
:::

:::exemple
```bash
git switch develop
git merge --no-ff -m "merge: feature/melange-questions dans develop" feature/melange-questions
git branch -d feature/melange-questions    # la branche locale ne sert plus
```
:::

:::piege
`git branch -d` refuse de supprimer une branche **non fusionnée** : c'est une sécurité. `-D` force la suppression, seulement si tu es sûr.
:::

:::ou[Dans le Quiz Dynamique]
Ta rétro du Sprint 2, point **Continue** : « Gitflow, branche par feature + merge `--no-ff` : historique clair ».
:::

## release : préparer une version

:::quoi
Une **release** part de develop pour **figer** une version : on change le numéro, on règle les derniers détails, puis on la merge dans **main** (avec un **tag**) **et** dans **develop**.
:::

:::exemple
```bash
git switch -c release/1.1.0 develop
echo "1.1.0" > version
git commit -am "1.1.0"
git switch main
git merge --no-ff --no-edit release/1.1.0
git tag -a 1.1.0 -m "1.1.0"
git switch develop
git merge --no-ff --no-edit release/1.1.0
```
:::

:::piege
`git push` seul n'envoie **pas** les tags. Ajoute `git push --tags` (ou `git push origin 1.1.0`).
:::

:::ou[Dans le Quiz Dynamique]
Releases 1.0.0 puis 1.1.0 : commit « 1.1.0 » sur le fichier `version`, « Merge branch 'release/1.1.0' » dans main, puis « … into develop ».
:::

## hotfix : corriger la production

:::quoi
Un **hotfix** part de **main** pour corriger un bug **en production**, sans attendre develop. Il revient dans **main** (nouveau tag) **et** dans **develop**, pour ne pas perdre la correction.
:::

:::exemple
```bash
git switch -c hotfix/1.1.1 main
# … je crée index.html et je passe le fichier version à 1.1.1 …
git add index.html version
git commit -m "hotfix: redirection racine vers pages/index.html"
git switch main && git merge --no-ff --no-edit hotfix/1.1.1
git tag -a 1.1.1 -m "1.1.1"
git switch develop && git merge --no-ff --no-edit hotfix/1.1.1
```
:::

:::piege
Oublier le merge dans **develop** : la prochaine release ramènerait le bug en production.
:::

:::info
Numéro **MAJEUR.MINEUR.CORRECTIF** (SemVer) : 1.1.0 → 1.1.1 pour un correctif, 1.2.0 pour une nouveauté compatible, 2.0.0 si la compatibilité casse.
:::

:::ou[Dans le Quiz Dynamique]
Hotfix 1.1.1 : GitHub Pages servait la racine du dépôt, pas `pages/` ; un `index.html` de redirection a réglé le problème.
:::

## Pull request et revue de code

:::quoi
Une **pull request** (PR) demande, sur GitHub, de fusionner ta branche (**compare**) dans une autre (**base**, ici develop). Un collègue fait la **revue de code** : il lit, commente, demande des corrections, puis **approuve**.
:::

:::exemple
```md
## Quoi ?
Filtrage multi-critères (genre, année, note, langue).

## Checklist (Definition of Done)
- [ ] Branche feature/… issue de develop
- [ ] Critères d'acceptation remplis
- [ ] Aucune erreur console
- [ ] Testé sur mobile et sur desktop
```
:::

:::piege
Une PR énorme (30 fichiers) est survolée, pas relue : fais de **petites** PR. Et vérifie la **base** : develop, pas main.
:::

:::astuce
Ce modèle, enregistré dans `.github/pull_request_template.md`, pré-remplit chaque nouvelle PR sur GitHub : c'est l'action « modèle de PR avec checklist DoD » de ta rétro.
:::

:::ou[Dans le TP reco films]
PR #1 à #6, par exemple « Merge pull request #6 from drakurei/feature/filtrage-multi-criteres ». Dans le Quiz, Martin (PO) faisait la revue des branches.
:::
