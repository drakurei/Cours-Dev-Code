---
titre: "Identité Git : perso et pro, deux PC"
matiere: gestion-projet
type: cours
chapitre: 6
niveau: intermediaire
duree: 10
date: 2026-10-08
source: "Règle drakurei de tes projets perso + mise en place de Manabi (PC perso et PC pro)"
tags: [git, config, identite, includeif, codespaces]
essentiel: "Chaque commit porte un nom et un email (user.name, user.email), et le réglage local d'un dépôt passe avant le global. Avec includeIf, Git choisit tout seul l'identité selon le dossier : drakurei pour le perso, l'identité pro pour le travail. Sur deux PC : git pull en arrivant, git push avant de partir."
retenir:
  - "Un mauvais email = un commit attribué au mauvais compte GitHub."
  - "Ordre de priorité : local > global > system."
  - "L'email no-reply de GitHub attribue tes commits sans exposer ton adresse."
  - "includeIf se place après [user], avec un / à la fin du dossier."
  - "GitHub est la seule source de vérité : pull en arrivant, push en partant."
definitions:
  - terme: "user.name / user.email"
    definition: "Nom et email écrits dans chaque commit ; GitHub s'en sert pour attribuer le commit à un compte."
  - terme: "Config globale"
    definition: "Réglages Git de ton compte utilisateur (~/.gitconfig), valables pour tous tes dépôts."
  - terme: "Config locale"
    definition: "Réglages d'un seul dépôt (.git/config) ; ils passent avant la config globale."
  - terme: "includeIf"
    definition: "Section de config qui inclut un autre fichier seulement si une condition est vraie, par exemple si le dépôt est dans un certain dossier."
    exemple: "[includeIf \"gitdir/i:~/Projets-perso/\"]"
  - terme: "Email no-reply GitHub"
    definition: "Adresse fournie par GitHub (ID+pseudo@users.noreply.github.com) qui attribue les commits à ton compte sans exposer ton email."
  - terme: "GitHub Codespaces"
    definition: "VS Code dans le navigateur, relié à un dépôt GitHub : rien à installer sur le PC."
flashcards:
  - q: "Quelle identité Git écrit-il dans chaque commit ?"
    r: "Le nom (user.name) et l'email (user.email) de l'auteur."
  - q: "Local ou global : lequel gagne ?"
    r: "Le local (le dépôt) passe avant le global (ton compte), qui passe avant le system (la machine)."
  - q: "Où se trouve la config globale ? Et la locale ?"
    r: "Globale : ~/.gitconfig. Locale : .git/config, dans le dépôt."
  - q: "Ton email no-reply GitHub ?"
    r: "229352063+drakurei@users.noreply.github.com"
  - q: "Quelle commande montre quel fichier fixe ton email ?"
    r: "git config --show-origin user.email"
  - q: "À quoi sert includeIf ?"
    r: "À charger une config (ton identité perso) seulement pour les dépôts d'un dossier donné."
  - q: "Pourquoi le / final dans gitdir/i:~/Projets-perso/ ?"
    r: "Il veut dire « ce dossier et tous ses sous-dossiers »."
  - q: "Comment corriger l'auteur du dernier commit ?"
    r: "Régler user.email, puis git commit --amend --reset-author --no-edit."
  - q: "Changer user.email modifie-t-il les anciens commits ?"
    r: "Non, seulement les prochains. Les anciens gardent leur auteur."
  - q: "La règle d'or pour coder sur 2 PC ?"
    r: "git pull en arrivant, commit et git push avant de partir : GitHub est la source de vérité."
  - q: "Pourquoi Codespaces sur le PC pro ?"
    r: "Rien à installer et rien de perso sur le PC du boulot : tu codes dans le navigateur, sous ton compte GitHub."
quiz:
  - question: "Dans un dépôt, le global = email pro et le local = email drakurei. Quel email aura ton prochain commit ?"
    choix:
      - "L'email pro"
      - "L'email drakurei"
      - "Les deux"
      - "Aucun : Git refuse"
    reponse: "L'email drakurei"
    explication: "Le réglage local (le dépôt) passe avant le global. C'est ce qui permet d'avoir une identité par projet."
  - question: "Que fait `git config user.email \"x\"`, sans option, dans un dépôt ?"
    choix:
      - "Il change l'email pour tout le PC."
      - "Il change l'email pour ce dépôt seulement."
      - "Il change l'email de ton compte GitHub."
      - "Il réécrit les anciens commits."
    reponse: "Il change l'email pour ce dépôt seulement."
    explication: "Sans option, git config écrit en local (.git/config). Hors d'un dépôt, il répond « fatal: not in a git directory »."
  - question: "Pourquoi utiliser l'email no-reply de GitHub ?"
    choix:
      - "Pour que les commits ne soient attribués à personne"
      - "Pour attribuer les commits à ton compte sans exposer ton email"
      - "Parce que Git refuse les autres emails"
      - "Pour pousser plus vite"
    reponse: "Pour attribuer les commits à ton compte sans exposer ton email"
    explication: "Dans un dépôt public, l'email de chaque commit est visible. Le no-reply relie le commit à drakurei sans montrer de vraie adresse."
  - question: "Ton ~/.gitconfig contient d'abord [includeIf …] (identité perso), puis [user] avec l'email pro. Dans ton dossier perso, quel email ?"
    choix:
      - "L'email perso : includeIf gagne toujours"
      - "L'email pro : le [user] placé après écrase l'inclusion"
      - "Aucun email"
      - "Git affiche une erreur"
    reponse: "L'email pro : le [user] placé après écrase l'inclusion"
    explication: "Git lit le fichier de haut en bas : la dernière valeur lue gagne. Place toujours includeIf après [user]."
  - question: "Ton dernier commit (pas encore poussé) porte ton email pro. Après avoir corrigé user.email, quelle commande ?"
    choix:
      - "git commit --amend --reset-author --no-edit"
      - "git push --force"
      - "git config --global --unset user.email"
      - "git reset --hard"
    reponse: "git commit --amend --reset-author --no-edit"
    explication: "--amend réécrit le dernier commit, --reset-author reprend ton identité actuelle, --no-edit garde le message."
  - question: "Tu arrives au boulot pour coder Manabi. Ta première commande Git ?"
    choix:
      - "git push"
      - "git pull"
      - "git init"
      - "git commit"
    reponse: "git pull"
    explication: "Tu récupères d'abord ce que tu as poussé depuis l'autre PC. Sinon, tu codes sur une vieille version."
exercices:
  - titre: "L'identité d'un dépôt perso"
    niveau: facile
    enonce: "Dans le dépôt Cours-Dev-Code, règle l'identité drakurei pour ce dépôt seulement, puis vérifie quel fichier fixe l'email."
    indices:
      - "Sans option, git config écrit en local."
      - "--show-origin affiche le fichier d'où vient la valeur."
    solution: |
      ```bash
      cd Cours-Dev-Code
      git config user.name "drakurei"
      git config user.email "229352063+drakurei@users.noreply.github.com"
      git config --show-origin user.email
      # file:.git/config    229352063+drakurei@users.noreply.github.com
      ```
  - titre: "Une config pour le PC pro"
    niveau: moyen
    enonce: "Sur le PC pro : identité du travail par défaut, identité drakurei pour tout ce qui est dans ~/Projets-perso/. Écris les deux fichiers de config."
    indices:
      - "Le fichier principal est ~/.gitconfig."
      - "L'identité perso va dans un fichier à part, inclus par includeIf."
      - "includeIf après [user], et un / à la fin du dossier."
    solution: |
      ```ini
      # ~/.gitconfig
      [user]
          name = Prénom Nom
          email = prenom@entreprise.fr
      [includeIf "gitdir/i:~/Projets-perso/"]
          path = ~/.gitconfig-perso

      # ~/.gitconfig-perso
      [user]
          name = drakurei
          email = 229352063+drakurei@users.noreply.github.com
      ```
  - titre: "Diagnostiquer un mauvais auteur"
    niveau: difficile
    enonce: "Dans un dépôt perso, le dernier commit (pas encore poussé) porte ton email pro. Écris la démarche complète : constater, trouver d'où vient l'email, corriger le dépôt, réparer le commit, vérifier."
    indices:
      - "git log --format permet d'afficher l'auteur."
      - "--show-origin dit quel fichier gagne."
      - "--amend --reset-author réécrit le dernier commit."
    solution: |
      ```bash
      git log -3 --format="%h %an <%ae>"     # 1. constater
      git config --show-origin user.email    # 2. d'où vient l'email ?
      git config user.name "drakurei"        # 3. corriger ce dépôt
      git config user.email "229352063+drakurei@users.noreply.github.com"
      git commit --amend --reset-author --no-edit   # 4. réparer le commit
      git log -1 --format="%an <%ae>"        # 5. vérifier
      ```
---

## user.name et user.email

:::quoi
Git écrit dans **chaque commit** un nom et un email. GitHub s'en sert pour **attribuer** le commit à un compte : un mauvais email, et le commit part sur le mauvais compte.
:::

:::exemple
```bash
git config user.name                  # qui suis-je dans ce dépôt ?
git config user.email
git log -3 --format="%h %an <%ae>"    # qui a signé les 3 derniers commits ?
```
:::

:::piege
Un commit garde son auteur pour toujours : changer la config **après** ne modifie pas les commits déjà faits.
:::

:::ou[Dans tes projets perso]
Quiz, TP, Cours-Dev-Code : tout est signé **drakurei**, jamais avec ton email pro (qui pointe vers ton compte GitHub du travail).
:::

## Les niveaux : global et local

:::quoi
Trois niveaux : **system** (toute la machine), **global** (ton compte, fichier `~/.gitconfig`) et **local** (un seul dépôt, `.git/config`). Le plus précis gagne : **local > global > system**.
:::

:::exemple
```bash
git config --global user.email "prenom@entreprise.fr"    # tout le PC
cd Cours-Dev-Code
git config user.name "drakurei"                           # ce dépôt seulement
git config user.email "229352063+drakurei@users.noreply.github.com"
git config --show-origin user.email                       # quel fichier gagne ?
```
:::

:::piege
Sans option, `git config` écrit en **local** : il faut être **dans** le dépôt, sinon Git répond « not in a git directory ».
:::

:::ou[Sur le PC pro]
Le global porte l'identité du travail ; dans tes dépôts perso, le local (ou includeIf) met drakurei.
:::

## L'email no-reply de GitHub

:::quoi
GitHub fournit une adresse **no-reply** (`ID+pseudo@users.noreply.github.com`) : tes commits sont attribués à ton compte **sans exposer** ton vrai email dans un dépôt public.
:::

:::exemple
```ini title=".git/config"
[user]
    name = drakurei
    email = 229352063+drakurei@users.noreply.github.com
```
:::

:::piege
Dans un dépôt **public**, l'email de chaque commit est visible par tous : n'y mets ni ton email pro, ni ton email perso.
:::

:::astuce
Sur GitHub, Settings > Emails : coche « Keep my email addresses private » et « Block command line pushes that expose my email ».
:::

:::ou[Pour drakurei]
Ton adresse est `229352063+drakurei@users.noreply.github.com` (229352063 = l'identifiant de ton compte). C'est elle qui signe Manabi.
:::

## includeIf : l'identité selon le dossier

:::quoi
**includeIf** charge un fichier de config **seulement** si le dépôt se trouve dans un certain dossier. Tu règles une fois, et chaque dépôt prend la bonne identité tout seul.
:::

:::exemple
```ini title="~/.gitconfig"
[user]
    name = Prénom Nom
    email = prenom@entreprise.fr
[includeIf "gitdir/i:~/Projets-perso/"]
    path = ~/.gitconfig-perso
```

```ini title="~/.gitconfig-perso"
[user]
    name = drakurei
    email = 229352063+drakurei@users.noreply.github.com
```
:::

:::piege
Place **includeIf après** `[user]` : Git lit de haut en bas, la dernière valeur gagne. Et garde le `/` final (= ce dossier et tous ses sous-dossiers).
:::

:::info
`gitdir/i:` ignore les majuscules et minuscules, pratique sous Windows. Vérifie le résultat avec `git config --show-origin user.email` dans un dépôt du dossier.
:::

:::ou[Sur le PC pro]
Range tes clones perso dans un seul dossier (ici `~/Projets-perso/`) : drakurei s'applique tout seul, l'identité pro partout ailleurs.
:::

## Corriger un commit mal signé

:::quoi
Si ton **dernier** commit, pas encore poussé, porte le mauvais email : corrige la config, puis **réécris l'auteur** avec `--amend --reset-author`.
:::

:::exemple
```bash
git config user.email "229352063+drakurei@users.noreply.github.com"
git commit --amend --reset-author --no-edit
git log -1 --format="%an <%ae>"
# drakurei <229352063+drakurei@users.noreply.github.com>
```
:::

:::piege
`--amend` **réécrit** le commit. S'il est déjà poussé, il faudrait un `git push --force` : à éviter sur une branche partagée.
:::

:::ou[Dans tes projets perso]
À faire dès que `git log` montre ton email pro sur un projet drakurei.
:::

## Deux PC, un seul dépôt

:::quoi
**GitHub est la seule source de vérité** : `git pull` en arrivant sur un PC, commit puis `git push` avant de partir. Sur le PC pro, **Codespaces** évite d'installer quoi que ce soit.
:::

:::exemple
```bash
git pull                     # en arrivant, sur n'importe quel PC
# … je code …
git add .
git commit -m "feat(cours): ajoute le tome Gestion de projet"
git push                     # avant de partir, sinon l'autre PC ne verra rien
```
:::

:::piege
Oublier le `push` le soir : le lendemain, l'autre PC part d'une vieille version et les deux historiques divergent (conflits assurés).
:::

:::attention
Le dépôt Manabi est **public** : jamais de code, de clients ni de documents du travail dedans.
:::

:::ou[Pour Manabi]
Tu codes ce site chez toi et au travail : le détail est dans `docs/TRAVAILLER-PARTOUT.md`.
:::
