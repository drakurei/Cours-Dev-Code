---
titre: "Coder et réviser depuis n'importe quel PC"
matiere: manabi
type: memo
chapitre: 3
niveau: debutant
duree: 8
date: 2026-10-08
source: "docs/TRAVAILLER-PARTOUT.md"
tags: ["manabi", "git", "github", "codespaces"]
essentiel: "GitHub est la seule source de vérité : en arrivant, git pull ; en partant, commit puis git push. Au travail, ouvre le repo dans Codespaces : rien à installer, rien de perso sur le PC. Ta progression vit dans le navigateur : synchronise-la avec un Gist."
retenir:
  - "Arriver : git pull. Partir : commit puis git push."
  - "Au travail, Codespaces : VS Code dans le navigateur, sans rien installer."
  - "Sur un clone, l'identité Git se règle dans le repo seulement : drakurei et l'adresse no-reply, jamais `--global`."
  - "La progression passe par la synchro Gist ou un export JSON, pas par le repo."
  - "Le repo est public : rien du travail, aucun secret, aucune donnée perso."
definitions:
  - terme: "Source de vérité"
    definition: "L'endroit qui fait foi. Ici, le repo GitHub : chaque PC n'en a qu'une copie."
  - terme: "git pull"
    definition: "Télécharge les nouveaux commits du repo GitHub et les fusionne dans ta copie locale (fetch + merge)."
    exemple: "git pull"
  - terme: "git push"
    definition: "Envoie tes commits locaux vers le repo GitHub. Sur main, il déclenche aussi la mise en ligne du site."
    exemple: "git push"
  - terme: "Codespace"
    definition: "Un environnement de développement dans le cloud de GitHub, ouvert dans VS Code depuis le navigateur : rien à installer sur le PC."
  - terme: "Dev container"
    definition: "La recette d'un environnement (Node, extensions, ports) écrite dans .devcontainer/devcontainer.json. Codespaces la suit à la création."
  - terme: "Identité Git locale"
    definition: "Le nom et l'email réglés pour un seul repo (`git config` sans `--global`). Ils passent avant l'identité globale du PC."
  - terme: "Adresse no-reply"
    definition: "L'email fourni par GitHub pour signer tes commits sans montrer ta vraie adresse."
    exemple: "229352063+drakurei@users.noreply.github.com"
  - terme: "Gist"
    definition: "Un mini-dépôt GitHub pour un ou quelques fichiers. Manabi s'en sert pour synchroniser ta progression entre tes appareils."
flashcards:
  - q: "Que fais-tu en arrivant sur un PC ?"
    r: "git pull, pour récupérer le travail poussé depuis l'autre PC."
  - q: "Que fais-tu avant de partir ?"
    r: "git add, git commit, puis git push. Sans push, l'autre PC ne voit rien."
  - q: "Pourquoi utiliser Codespaces au travail ?"
    r: "C'est VS Code dans le navigateur : rien à installer, et rien de perso sur le PC du travail."
  - q: "Quel fichier prépare le Codespace ?"
    r: "`.devcontainer/devcontainer.json` : Node 24, les dépendances (npm ci), les extensions, Claude Code et le port 4321."
  - q: "Que se passe-t-il après 30 minutes sans rien faire dans un Codespace ?"
    r: "Il s'arrête tout seul (réglage par défaut). Ton travail reste dedans, mais il n'est pas sur GitHub tant que tu n'as pas poussé."
  - q: "L'aperçu du codespace affiche « Blocked request ». Que fais-tu ?"
    r: "Tu arrêtes le serveur (Ctrl + C) et tu relances `npm run dev -- --allowed-hosts .app.github.dev`."
  - q: "Comment régler l'identité Git pour ce repo seulement ?"
    r: "`git config user.name` et `git config user.email`, tapés dans le repo, sans `--global`."
  - q: "Quel email signe tes commits perso ?"
    r: "L'adresse no-reply de GitHub : 229352063+drakurei@users.noreply.github.com. Jamais l'email pro."
  - q: "Où vit ta progression (pétales, cartes) ?"
    r: "Dans le localStorage du navigateur, sous la clé `manabi:v1`. Pas dans le repo."
  - q: "Comment retrouver ta progression sur un autre PC ?"
    r: "Réglages → Synchronisation : « Synchroniser maintenant » avec ton jeton GitHub. Ou Exporter le fichier JSON, puis l'Importer sur l'autre PC."
  - q: "Dans Réglages → Synchronisation, que fait « Récupérer » ?"
    r: "Il remplace la progression de ce navigateur par la sauvegarde en ligne. Pour garder les deux côtés : « Synchroniser maintenant »."
  - q: "Que fait Claude Code sur le web ?"
    r: "Il code dans le cloud sur ton repo et pousse son travail sur une branche, que tu relis avant de la fusionner."
  - q: "Un jeton a été poussé par erreur. Que fais-tu d'abord ?"
    r: "Tu le révoques tout de suite : il reste lisible dans l'historique, même si tu supprimes le fichier."
  - q: "Que ne met-on jamais dans ce repo public ?"
    r: "Le code ou les documents du travail, les noms de clients, les secrets et les données perso."
quiz:
  - question: "Hier soir, tu as poussé ton travail depuis le PC perso. Ce matin au travail, ta copie existe déjà. Première commande ?"
    choix:
      - "git push"
      - "git pull"
      - "git init"
      - "git clone"
    reponse: "git pull"
    explication: "pull récupère ce que tu as poussé hier. clone ne sert qu'une fois, quand tu n'as encore aucune copie."
  - question: "Sur le PC pro, tu tapes `git config --global user.email` avec ton adresse no-reply. Quel est le problème ?"
    choix:
      - "Aucun problème"
      - "Tes commits du travail porteront eux aussi l'adresse de drakurei"
      - "Git refuse les adresses no-reply"
      - "Le repo devient privé"
    reponse: "Tes commits du travail porteront eux aussi l'adresse de drakurei"
    explication: "`--global` change l'identité de tout le PC. Sans `--global`, le réglage reste dans ce repo seulement."
  - question: "Ta série affiche 0 sur le PC pro alors que tu as révisé hier sur le PC perso. Pourquoi ?"
    choix:
      - "Un bug du site"
      - "La progression est enregistrée dans le navigateur de chaque PC"
      - "Le repo a été effacé"
      - "La série se remet à zéro chaque matin"
    reponse: "La progression est enregistrée dans le navigateur de chaque PC"
    explication: "Le localStorage est propre à chaque navigateur. Active la synchro Gist ou importe ton export JSON."
  - question: "Quelle option ne demande rien d'installer sur le PC du travail ?"
    choix:
      - "Un clone local avec Git et npm ci"
      - "GitHub Codespaces"
      - "GitHub Desktop"
      - "Node et VS Code installés sur le PC"
    reponse: "GitHub Codespaces"
    explication: "Codespaces tourne sur une machine de GitHub : le PC du travail n'affiche qu'un onglet de navigateur."
  - question: "Claude Code sur le web a fini sa tâche, mais le site n'a pas changé. Pourquoi ?"
    choix:
      - "Son travail est sur une branche, pas encore fusionnée dans main"
      - "Claude Code ne peut pas modifier un repo"
      - "Il faut attendre 24 heures"
      - "Le site ne se met à jour qu'à la main"
    reponse: "Son travail est sur une branche, pas encore fusionnée dans main"
    explication: "Seul un push sur main déclenche la mise en ligne. Relis la branche, puis fusionne-la avec une pull request."
  - question: "Tu as appris quelque chose d'utile sur un projet du travail. Que mets-tu dans Manabi ?"
    choix:
      - "Le code du projet, copié tel quel"
      - "La notion générale, avec un exemple écrit par toi"
      - "Une capture d'écran du projet"
      - "Le nom du client, pour t'en souvenir"
    reponse: "La notion générale, avec un exemple écrit par toi"
    explication: "Le repo est public : garde la leçon, jamais le code, les noms ou les captures du travail."
  - question: "Tu as supprimé, dans un nouveau commit, un fichier qui contenait ta clé API. Est-ce suffisant ?"
    choix:
      - "Oui, la clé a disparu du repo"
      - "Non : elle reste dans l'historique, il faut la révoquer"
      - "Oui, si ce commit est poussé sur main"
    reponse: "Non : elle reste dans l'historique, il faut la révoquer"
    explication: "Chaque ancien commit reste lisible par tout le monde. Révoque la clé, crée-en une nouvelle et range-la au bon endroit."
exercices:
  - titre: "La routine des deux PC"
    niveau: facile
    enonce: "Écris les commandes à taper en arrivant au travail, puis en partant le soir, pour que ton PC perso retrouve ton travail."
    indices:
      - "En arrivant, tu récupères."
      - "En partant, il faut 3 commandes : préparer, enregistrer, envoyer."
      - "Un commit a toujours un message avec -m."
    solution: |
      ```bash
      # En arrivant
      git pull

      # En partant
      git add -A
      git commit -m "Cours useEffect : quiz et exercices"
      git push
      ```
  - titre: "Un clone propre sur le PC pro"
    niveau: moyen
    enonce: "Le PC du travail a déjà une identité Git globale : celle du travail. Clone Cours-Dev-Code, règle l'identité drakurei pour ce repo seulement, puis vérifie d'où vient le réglage."
    indices:
      - "Sans `--global`, `git config` écrit dans le repo où tu te trouves."
      - "Il faut régler user.name et user.email."
      - "`git config --show-origin` affiche le fichier d'où vient une valeur."
    solution: |
      ```bash
      git clone https://github.com/drakurei/Cours-Dev-Code.git
      cd Cours-Dev-Code
      git config user.name "drakurei"
      git config user.email "229352063+drakurei@users.noreply.github.com"
      git config --show-origin user.email
      # file:.git/config   229352063+drakurei@users.noreply.github.com
      ```
  - titre: "Le bon outil au bon endroit"
    niveau: difficile
    enonce: |
      Pour chaque situation, choisis l'outil et dis en une ligne comment faire.

      a. Pause déjeuner au travail : tu veux coder une page du site.
      b. Sur ton téléphone : tu veux un cours à partir d'une photo du tableau.
      c. Sur un nouveau PC, ta série affiche 0.
      d. Tu veux que Claude ajoute les quiz manquants pendant que tu travailles.
    indices:
      - "Au travail, rien ne doit s'installer sur le PC."
      - "Sur téléphone, il y a une page du site faite pour ça."
      - "La progression ne passe jamais par le repo."
    solution: |
      ```text
      a. Codespaces : VS Code dans le navigateur, puis commit + push
      b. L'Atelier : image → IA → « Publier sur GitHub » (ou inbox/ sur github.com)
      c. Réglages → Synchronisation : jeton, puis « Synchroniser maintenant » (ou Importer l'export JSON)
      d. Claude Code sur le web : il pousse sur une branche, tu relis puis tu fusionnes
      ```
---

## GitHub, la seule source de vérité

:::quoi
Le repo **drakurei/Cours-Dev-Code** est la **version de référence** : chaque PC n'en a qu'une copie, que tu récupères (pull) en arrivant et envoies (push) en partant.
:::

:::exemple
```bash
# En arrivant : récupérer le travail de l'autre PC
git pull

# En partant : vérifier, enregistrer, envoyer
git status
git add -A
git commit -m "Cours useEffect : notions et quiz"
git push
```
:::

:::piege
Partir sans **git push** : l'autre PC ne verra rien.
:::

:::ou[Sur tous tes PC]
Partout où tu codes Manabi. Chaque push sur **main** déclenche aussi la mise en ligne du site, en 2 minutes environ.
:::

:::astuce
Dans VS Code, le bouton **Synchroniser** (les deux flèches, en bas à gauche) fait le pull puis le push. Même fichier modifié sur deux PC ? C'est un **conflit** : voir [Résoudre un conflit simple](/cours/gestion-projet/04-git-au-quotidien/#resoudre-un-conflit-simple).
:::

## Au travail : GitHub Codespaces

:::quoi
**Codespaces** ouvre le repo dans **VS Code, dans le navigateur**, sur une machine de GitHub : rien à installer, rien de perso sur le PC du travail.
:::

:::exemple
```text
1. Page du repo → bouton vert « Code » → « Codespaces »
2. « Create codespace on main » (1re fois : 2 à 3 min)
3. Les fois suivantes : rouvre le même codespace
4. Dans le terminal : npm run dev
5. Ouvre le port 4321 (onglet « Ports »)
   et ajoute /Cours-Dev-Code/ à l'adresse
« Blocked request » ? Ctrl + C, puis :
   npm run dev -- --allowed-hosts .app.github.dev
```
:::

:::piege
Un codespace **s'arrête tout seul** après 30 minutes sans activité, et ton travail reste coincé dedans tant que tu n'as pas fait **commit + push**.
:::

:::ou[Sur le PC pro]
Au travail, ou sur n'importe quel PC prêté. `.devcontainer/devcontainer.json` prépare tout : Node 24, `npm ci`, les extensions, Claude Code et l'identité Git drakurei.
:::

:::astuce
Pour corriger juste une faute, appuie sur la touche **.** sur la page du repo : ça ouvre **github.dev**, un éditeur léger sans terminal (donc sans npm), parfait pour un petit commit.
:::

:::info
Compte gratuit : environ **60 heures par mois** sur la machine de base à 2 cœurs (120 heures-cœur), et 15 Go de stockage. En partant, arrête le codespace (github.com/codespaces → … → Stop codespace) et supprime ceux qui ne servent plus.
:::

## Claude Code sur le web

:::quoi
Sur **claude.ai/code**, tu choisis le repo et tu décris la tâche : Claude code dans le cloud, puis pousse son travail sur une **branche** que tu relis.
:::

:::exemple
```text
Repo : drakurei/Cours-Dev-Code
Tâche : ajoute un cours React sur useEffect à partir de mes notes
ci-dessous. Suis PROMPT-COURS.md, puis lance npm run verifier
jusqu'à 0 erreur.

[tes notes du cours]
```
:::

:::piege
Son travail arrive sur une **branche** : tant que tu ne l'as pas **fusionnée** dans main (avec une pull request), le site ne change pas.
:::

:::ou[Partout]
Depuis n'importe quel navigateur, téléphone compris. Claude lit d'abord les règles du repo : `CLAUDE.md` et `AGENTS.md`.
:::

:::astuce
Claude Code est aussi installé dans le codespace : tape `claude` dans son terminal (connexion une seule fois par codespace) pour coder avec lui.
:::

## Un clone avec l'identité drakurei

:::quoi
Si la **DSI** l'autorise, clone le repo et règle l'**identité Git dans ce repo seulement** : tes commits seront signés drakurei, quelle que soit l'identité globale du PC.
:::

:::exemple
```bash
git clone https://github.com/drakurei/Cours-Dev-Code.git
cd Cours-Dev-Code
git config user.name "drakurei"
git config user.email "229352063+drakurei@users.noreply.github.com"
git config user.email            # ce repo : l'adresse no-reply
git config --global user.email   # le reste du PC : inchangé
npm ci
```
:::

:::piege
Avec `--global`, tu changes l'identité de **tout le PC**, repos du travail compris : ici, jamais de `--global` ni d'email pro.
:::

:::ou[Dans le repo]
`scripts/installer-pc.ps1` (ou `installer-pc.sh` sur macOS et Linux) fait tout : il vérifie Git et Node 22 ou plus, clone, règle l'identité locale et lance `npm ci`. Plusieurs repos perso sur le PC pro ? Lis la notion [includeIf : l'identité selon le dossier](/cours/gestion-projet/06-identite-git-perso-pro/#includeif-l-identite-selon-le-dossier).
:::

:::astuce
Pas encore de clone ? Télécharge le script (lien dans `docs/TRAVAILLER-PARTOUT.md`) dans un dossier **sans & ni emoji**, puis lance `powershell -ExecutionPolicy Bypass -File .\installer-pc.ps1`. Au premier push, connecte-toi avec le compte **drakurei**.
:::

## Synchroniser ta progression

:::quoi
Tes pétales, cartes et cours terminés vivent dans le **localStorage** de chaque navigateur (clé `manabi:v1`), pas dans le repo. Pour les retrouver ailleurs : **synchro Gist** ou **export / import** JSON.
:::

:::exemple
```json title="manabi-sauvegarde-2026-10-08.json (extrait)"
{
  "version": 1,
  "maj": "2026-10-08T18:42:00.000Z",
  "stats": {
    "petales": 128,
    "serie": { "actuelle": 4, "record": 9, "dernierJour": "2026-10-08" }
  }
}
```
:::

:::piege
**Récupérer** remplace la progression de ce navigateur, et **Envoyer** remplace celle en ligne : pour tout garder des deux côtés, choisis **Synchroniser maintenant**.
:::

:::ou[Dans Manabi]
**Réglages** (設) → **Synchronisation** : colle ton jeton GitHub, puis **Synchroniser maintenant** (le plus récent gagne, entrée par entrée). Active la **Synchro automatique** pour ne plus y penser.
:::

:::info
Le jeton : un jeton **fine-grained** avec **Contents** et **Gists** en lecture et écriture. Il ne part jamais dans l'export ni dans le Gist : il est rangé à part, sous la clé `manabi:v1:secrets`.
:::

## Le repo est public : ce qui n'y entre jamais

:::quoi
Tout le monde peut lire le repo **et son historique** : donc aucun contenu du travail, aucun **secret** (jeton, clé API), aucune donnée perso.
:::

:::exemple
```text
Jeton GitHub, clé Anthropic       → Réglages du site (restent dans ce navigateur)
Clé de l'Action inbox             → GitHub › Settings › Secrets and variables › Actions
Ce que tu as appris au travail    → une notion générale, avec ton propre exemple
Code, clients, captures du boulot → nulle part dans ce repo
```
:::

:::piege
Supprimer un secret dans un nouveau commit **ne l'efface pas** de l'historique : **révoque-le** tout de suite et crée-en un autre.
:::

:::ou[Avant chaque commit]
Partout : `git status` et `git diff --staged` te montrent exactement ce qui va partir en ligne.
:::
