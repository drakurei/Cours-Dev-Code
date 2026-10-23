---
titre: "Git au quotidien : commit, push, pull, branches"
matiere: gestion-projet
type: cours
chapitre: 4
niveau: debutant
duree: 12
date: 2026-07-27
source: "Workshop Git (binôme et conflit) + Quiz Dynamique + TP reco films"
tags: [git, commit, branche, conflit, gitignore]
essentiel: "Git enregistre ton code en commits : tu modifies, puis git add, git commit et git push (et git pull en arrivant). Une branche isole une fonctionnalité, et git merge la ramène. En cas de conflit, tu gardes le bon code, puis git add et git commit."
retenir:
  - "Sans git add, rien ne part dans le commit."
  - "git pull = fetch (télécharger) + merge (fusionner)."
  - "git merge X fusionne X dans la branche où tu te trouves."
  - "Un conflit se règle à la main : garder le bon code, effacer les marqueurs, git add, git commit."
  - "Les secrets vont dans .gitignore avant le premier commit, jamais après."
definitions:
  - terme: "Commit"
    definition: "Photo enregistrée du projet, avec un message et un identifiant unique (le hash)."
    exemple: "git commit -m \"feat(dark-mode): option de mode sombre\""
  - terme: "Index (staging area)"
    definition: "Zone où tu prépares, avec git add, ce qui partira dans le prochain commit."
  - terme: "Remote"
    definition: "Copie du dépôt sur un serveur comme GitHub ; par convention, la principale s'appelle origin."
  - terme: "Branche"
    definition: "Ligne de travail séparée, pour coder une fonctionnalité sans toucher au travail des autres."
  - terme: "Merge"
    definition: "Fusion d'une branche dans la branche courante."
  - terme: "Conflit"
    definition: "Deux modifications touchent les mêmes lignes : Git ne sait pas laquelle garder et te demande de choisir."
  - terme: ".gitignore"
    definition: "Fichier qui liste ce que Git ne doit pas suivre : secrets, dépendances, fichiers générés."
flashcards:
  - q: "Les 3 commandes pour enregistrer et envoyer ton travail ?"
    r: "git add, git commit -m \"…\", puis git push."
  - q: "Que fait git pull ?"
    r: "Il récupère les commits du remote : un fetch (téléchargement) puis un merge (fusion)."
  - q: "À quoi sert le -u de git push -u origin main ?"
    r: "Il relie ta branche locale à origin/main : ensuite, git push et git pull suffisent."
  - q: "Créer une branche et y aller, en une commande ?"
    r: "git switch -c feature/nom (ancienne écriture : git checkout -b feature/nom)."
  - q: "git merge feature/x fusionne dans quelle branche ?"
    r: "Dans la branche où tu te trouves au moment de la commande."
  - q: "Que signifient `<<<<<<<`, `=======` et `>>>>>>>` ?"
    r: "Les marqueurs de conflit : ta version (HEAD) au-dessus de `=======`, la version qui arrive en dessous."
  - q: "Après avoir corrigé un conflit, quelles commandes ?"
    r: "git add du fichier corrigé, puis git commit."
  - q: "Comment annuler un merge qui part en conflit ?"
    r: "git merge --abort : tout revient comme avant le merge."
  - q: "Pourquoi un push est-il refusé (rejected) ?"
    r: "Le remote a des commits que tu n'as pas. Fais git pull, règle les conflits éventuels, puis repousse."
  - q: "Un fichier déjà suivi est ajouté au .gitignore. Que se passe-t-il ?"
    r: "Rien : Git continue de le suivre. Il faut d'abord git rm --cached fichier."
  - q: "Le format Conventional Commits ?"
    r: "type(portée): description. Exemple : feat(shuffle): melange aleatoire des questions et des reponses."
  - q: "Que mettre toujours dans .gitignore ?"
    r: "Les secrets (clés d'API), node_modules/ et les fichiers générés (CSS compilé, build)."
quiz:
  - question: "Tu as modifié index.html et tapé `git commit -m \"maj\"` sans rien d'autre. Que se passe-t-il ?"
    choix:
      - "Le commit contient index.html."
      - "Rien n'est enregistré : il fallait d'abord git add index.html."
      - "Git pousse directement sur GitHub."
      - "Le fichier est supprimé."
    reponse: "Rien n'est enregistré : il fallait d'abord git add index.html."
    explication: "Git répond « no changes added to commit » : seul ce qui est dans l'index (git add) part dans le commit."
  - question: "Ton `git push` est refusé avec « rejected ». La bonne réaction ?"
    choix:
      - "git push --force tout de suite."
      - "git pull, régler les conflits éventuels, puis git push."
      - "Supprimer le dossier et recloner."
      - "Changer de branche et réessayer."
    reponse: "git pull, régler les conflits éventuels, puis git push."
    explication: "Quelqu'un a poussé avant toi. --force écraserait son travail : on récupère d'abord, on fusionne, puis on pousse."
  - question: "Tu es sur develop et tu tapes `git merge feature/mode-sombre`. Que se passe-t-il ?"
    choix:
      - "develop est fusionnée dans feature/mode-sombre."
      - "feature/mode-sombre est fusionnée dans develop."
      - "Les deux branches sont supprimées."
      - "Une nouvelle branche est créée."
    reponse: "feature/mode-sombre est fusionnée dans develop."
    explication: "git merge X ramène X dans la branche courante. Vérifie toujours où tu es avec git status avant."
  - question: "Pendant un merge en conflit, qu'y a-t-il entre `<<<<<<< HEAD` et `=======` ?"
    choix:
      - "La version qui arrive de l'autre branche"
      - "Ta version actuelle, celle de ta branche"
      - "L'ancienne version commune"
      - "Un message d'erreur de Git"
    reponse: "Ta version actuelle, celle de ta branche"
    explication: "HEAD = là où tu es. Au-dessus de `=======` : ta version ; en dessous, jusqu'à `>>>>>>>` : la version qui arrive."
  - question: "Quel message de commit est le plus utile ?"
    choix:
      - "update"
      - "fix"
      - "feat(i18n): changement de langue (FR/EN)"
      - "modifs diverses"
    reponse: "feat(i18n): changement de langue (FR/EN)"
    explication: "Il dit le type (feat), la zone (i18n) et ce que fait le commit. « fix » et « update » étaient justement dans le Stop de ta rétro."
  - question: "js/config.js (ta clé API) est déjà commité. Tu l'ajoutes au .gitignore. Résultat ?"
    choix:
      - "Git l'ignore aussitôt."
      - "Git continue de le suivre tant que tu n'as pas fait git rm --cached js/config.js."
      - "Le fichier est supprimé de ton disque."
      - "La clé est effacée de l'historique."
    reponse: "Git continue de le suivre tant que tu n'as pas fait git rm --cached js/config.js."
    explication: ".gitignore ne concerne que les fichiers non suivis. git rm --cached retire le fichier de l'index sans le supprimer du disque ; la clé reste dans les anciens commits."
  - question: "Que fait `git switch -c feature/stat` ?"
    choix:
      - "Supprime la branche feature/stat."
      - "Crée la branche feature/stat et bascule dessus."
      - "Fusionne feature/stat dans main."
      - "Pousse feature/stat sur GitHub."
    reponse: "Crée la branche feature/stat et bascule dessus."
    explication: "-c = create. C'est l'équivalent moderne de git checkout -b feature/stat."
exercices:
  - titre: "Premier envoi sur GitHub"
    niveau: facile
    enonce: "Tu viens d'écrire README.md dans un dossier vide. Écris les commandes pour créer le dépôt, faire le premier commit sur la branche main et l'envoyer sur https://github.com/drakurei/Cours-Dev-Code.git."
    indices:
      - "Commence par git init, puis le cycle add et commit."
      - "git branch -M main renomme la branche courante en main."
      - "Le premier push utilise -u pour relier main à origin/main."
    solution: |
      ```bash
      git init
      git add README.md
      git commit -m "first commit"
      git branch -M main
      git remote add origin https://github.com/drakurei/Cours-Dev-Code.git
      git push -u origin main
      ```
  - titre: "Une fonctionnalité sur sa branche"
    niveau: moyen
    enonce: "Depuis develop à jour, crée la branche feature/recap-erreurs, commite le fichier assets/js/recap.js avec un bon message, puis envoie la branche sur GitHub."
    indices:
      - "Mets develop à jour avant de créer ta branche."
      - "Message au format type(portée): description."
      - "Première fois qu'on pousse cette branche : -u."
    solution: |
      ```bash
      git switch develop
      git pull
      git switch -c feature/recap-erreurs
      git add assets/js/recap.js
      git commit -m "feat(recap): recapitulatif des erreurs en fin de partie"
      git push -u origin feature/recap-erreurs
      ```
  - titre: "Résoudre un conflit"
    niveau: moyen
    enonce: "Sur develop, `git merge feature/titre` s'arrête : pages/index.html contient `<<<<<<< HEAD`, puis `<h1>Quiz Dynamique</h1>`, puis `=======`, puis `<h1>Quiz Dynamique — Sprint 2</h1>`, puis `>>>>>>> feature/titre`. Garde le titre de la branche feature et termine le merge."
    indices:
      - "La version qui arrive (feature/titre) est sous =======."
      - "Efface les 3 lignes de marqueurs."
      - "Termine avec git add puis git commit."
    solution: |
      ```bash
      # Dans pages/index.html, il ne reste que cette ligne :
      #   <h1>Quiz Dynamique — Sprint 2</h1>
      git add pages/index.html
      git commit -m "merge: feature/titre dans develop"
      # (pour tout annuler à la place : git merge --abort)
      ```
  - titre: "Le secret commité par erreur"
    niveau: difficile
    enonce: "js/config.js (ta clé TMDB) est suivi par Git. Fais en sorte qu'il ne soit plus suivi, sans le supprimer de ton disque, et que l'erreur ne se reproduise pas. Que dois-tu faire en plus si le commit était déjà poussé ?"
    indices:
      - "Ajoute d'abord la ligne js/config.js dans .gitignore."
      - "git rm --cached retire de l'index sans toucher au disque."
      - "L'historique garde les anciens commits."
    solution: |
      ```bash
      echo "js/config.js" >> .gitignore
      git rm --cached js/config.js
      git add .gitignore
      git commit -m "chore: ne plus suivre js/config.js (cle API)"
      git push
      # Déjà poussé ? La clé reste dans l'historique : régénère-la sur TMDB.
      ```
---

## Le cycle add → commit

:::quoi
Git a 3 zones : le **dossier de travail** (tes fichiers), l'**index** (ce que tu prépares avec **git add**) et l'**historique** (les **commits**). Un commit est une photo de l'index, avec un message.
:::

:::exemple
```bash
git status                  # qu'est-ce qui a changé ?
git add index.html          # je prépare ce fichier
git commit -m "feat: ajoute le récapitulatif des erreurs en fin de quiz"
git log --oneline           # l'historique, un commit par ligne
```
:::

:::piege
Sans `git add`, tes modifications ne partent **pas** dans le commit. Et `git add .` ajoute **tout** : relis `git status` avant.
:::

:::ou[Dans le Quiz Dynamique]
Chaque fonctionnalité (mode sombre, langue FR/EN, modes de jeu, partage du score…) = un ou plusieurs commits.
:::

## Envoyer et récupérer : push et pull

:::quoi
**git push** envoie tes commits sur GitHub (le **remote** `origin`). **git pull** récupère ceux des autres : c'est un **fetch** (télécharger) suivi d'un **merge** (fusionner).
:::

:::exemple
```bash
git push -u origin main     # 1re fois : relie ta branche à origin/main
git push                    # les fois suivantes
git pull                    # récupère le travail des autres
```
:::

:::piege
Si quelqu'un a poussé avant toi, ton push est **refusé** (« rejected ») : fais d'abord `git pull`, règle les conflits éventuels, puis repousse. Jamais de `--force` sur une branche partagée.
:::

:::ou[Pour ce site]
Les commandes données par GitHub pour Cours-Dev-Code : `git remote add origin …` puis `git push -u origin main`.
:::

## Les branches

:::quoi
Une **branche** est une ligne de travail séparée. Tu crées ta branche, tu codes dessus sans casser le travail des autres, puis tu la **fusionnes** (merge) quand c'est prêt.
:::

:::exemple
```bash
git switch develop                     # je pars de develop
git switch -c feature/partage-score    # je crée ma branche et j'y vais
# … je code, git add, git commit …
git switch develop
git merge feature/partage-score        # je ramène mon travail dans develop
```
:::

:::piege
`git merge X` fusionne X **dans la branche où tu es**. Vérifie toujours ta branche avec `git status` avant.
:::

:::ou[Dans le Quiz Dynamique]
Les vraies branches : `feature/mode-sombre`, `feature/changement-langue`, `feature/modes-de-jeu`, `feature/partage-score`, `feature/reponses-images`…
:::

## Résoudre un conflit simple

:::quoi
Un **conflit** arrive quand deux personnes ont modifié **les mêmes lignes**. Git s'arrête et place des **marqueurs** dans le fichier : à toi de garder le bon code.
:::

:::exemple
```html title="index.html"
<h1>Workshop Git</h1>
<<<<<<< HEAD
<p>Paragraphe ecrit par MOI sur mon PC principal.</p>
=======
<p>Paragraphe ecrit par le BINOME depuis un autre clone.</p>
>>>>>>> origin/develop
```

```bash
# je garde les 2 paragraphes et j'efface les 3 lignes de marqueurs
git add index.html
git commit -m "Resolve conflict in index.html"
```
:::

:::piege
Oublier d'effacer `<<<<<<<`, `=======` ou `>>>>>>>` : les marqueurs partent dans le commit et cassent la page. Pour tout annuler : `git merge --abort`.
:::

:::ou[Dans ton Workshop Git]
Le même paragraphe modifié depuis deux clones (le tien et celui du binôme) : tu as gardé les deux lignes, commit « Resolve conflict in index.html ».
:::

## .gitignore : ce que Git ne doit pas suivre

:::quoi
Le fichier **.gitignore** liste ce que Git doit **ignorer** : les dépendances, les fichiers générés et surtout les **secrets** (clés d'API).
:::

:::exemple
```text title=".gitignore"
# Clé API TMDB - NE JAMAIS COMMITER
js/config.js

# Dépendances
node_modules/

# Build SASS
css/*.css
```
:::

:::piege
`.gitignore` n'agit pas sur un fichier **déjà suivi**. Retire-le d'abord de l'index : `git rm --cached js/config.js` (il reste sur ton disque).
:::

:::attention
Une clé déjà poussée reste dans l'**historique**, même après `git rm --cached` : il faut la **régénérer**.
:::

:::ou[Dans le TP reco films]
`js/config.js` (la clé TMDB) est ignoré ; le dépôt fournit `js/config.example.js` à copier.
:::

## Écrire un bon message de commit

:::quoi
Un message dit **ce que fait** le commit, au présent. Convention courante (**Conventional Commits**) : `type(portée): description`, avec `feat`, `fix`, `docs`, `refactor`, `chore`…
:::

:::exemple
```text
feat(shuffle): melange aleatoire des questions et des reponses
fix(storage): une valeur localStorage corrompue ne plante plus l'app
refactor(css): decoupe style.css en modules
docs: ajout du pack agile (roles, planning, backlog/US, retrospective)
```
:::

:::piege
« fix », « update », « modifs » ne disent rien : dans 3 mois, tu ne sauras plus ce que le commit a changé.
:::

:::ou[Dans le Quiz Dynamique]
Vous ajoutiez un **gitmoji** devant : `:sparkles:` pour une fonctionnalité, `:bug:` pour une correction. Ta rétro : « Stop aux messages vagues ».
:::
