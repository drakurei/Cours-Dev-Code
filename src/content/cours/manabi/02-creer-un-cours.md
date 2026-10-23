---
titre: "Créer un cours avec une IA"
matiere: manabi
type: memo
chapitre: 2
niveau: debutant
duree: 9
date: 2026-10-08
source: "PROMPT-COURS.md et l'Atelier"
tags: ["manabi", "ia", "markdown", "atelier"]
essentiel: "Pour créer un cours, tu donnes ta source (PDF, images, notes ou repo) à une IA avec le prompt universel : elle te rend un fichier .md au format Manabi. Tu le vérifies, tu le publies sur GitHub, et le site se met à jour tout seul en 2 minutes environ."
retenir:
  - "3 chemins : le prompt universel dans n'importe quelle IA, l'Atelier du site, ou le dossier inbox/."
  - "Un cours = un fichier `src/content/cours/<matiere>/NN-slug.md` : un frontmatter YAML, puis des notions ##."
  - "Seuls titre, matiere et essentiel sont obligatoires."
  - "Images et PDF vont dans `public/media/<matiere>/` et s'écrivent `/media/<matiere>/fichier` dans le cours."
  - "La reponse d'un quiz est le texte exact d'un des choix ; `npm run verifier` contrôle tout avant de publier."
definitions:
  - terme: "Prompt universel"
    definition: "Le texte de PROMPT-COURS.md qui explique le format Manabi à n'importe quelle IA. Tu le colles avec ta source, l'IA rend un cours .md."
  - terme: "Atelier (工)"
    definition: "La page du site qui transforme une source (PDF, images, texte, repo GitHub) en cours, en 4 étapes : Source, Générer, Vérifier, Publier."
  - terme: "Frontmatter"
    definition: "Le bloc YAML placé entre deux lignes --- en haut d'un fichier .md : titre, matière, essentiel, quiz, flashcards…"
  - terme: "Directive (bloc :::)"
    definition: "La syntaxe qui crée un bloc coloré : `:::quoi` sur une ligne, le contenu, puis `:::` seul sur sa ligne. Elle vient du plugin remark-directive."
  - terme: "Slug"
    definition: "Un identifiant en minuscules, chiffres et tirets, utilisé dans les noms de fichiers et les adresses du site."
    exemple: "06-usestate, html-css, gestion-projet"
  - terme: "Jeton fine-grained"
    definition: "Un jeton GitHub limité à certains repos et à certains droits. Pour l'Atelier : ce repo seulement, Contents en lecture et écriture."
  - terme: "GitHub Actions"
    definition: "Les automatisations de GitHub : un workflow lancé par un événement. Ici, chaque push sur main vérifie, reconstruit et met en ligne le site en 2 minutes environ."
  - terme: "Schéma de validation"
    definition: "Les règles (écrites avec Zod) que chaque cours doit respecter. Un champ faux bloque le build avec un message en français : fichier et champ."
flashcards:
  - q: "Quels sont les 3 chemins pour créer un cours ?"
    r: "Le prompt universel dans n'importe quelle IA, l'Atelier du site, ou le dossier inbox/ avec son Action."
  - q: "Où se trouve le prompt universel ?"
    r: "Dans `PROMPT-COURS.md`, à la racine du repo. L'Atelier le remplit et le copie pour toi."
  - q: "Quels champs du frontmatter sont obligatoires ?"
    r: "titre, matiere et essentiel."
  - q: "Où ranger le cours React n°7 sur useEffect ?"
    r: "Dans `src/content/cours/react/07-useeffect.md`."
  - q: "Où mettre une image du tome React ?"
    r: "Dans `public/media/react/`, puis l'écrire `/media/react/image.png` dans le cours."
  - q: "Comment afficher un PDF dans le corps d'un cours ?"
    r: "Avec la ligne `::pdf{src=\"/media/react/slides.pdf\" titre=\"Slides\"}` : la visionneuse est intégrée."
  - q: "Que doit valoir reponse dans une question de quiz ?"
    r: "Le texte exact d'un des choix, majuscules comprises. Copie-colle-le."
  - q: "Comment ouvre-t-on et ferme-t-on un bloc Quoi ?"
    r: "`:::quoi` sur une ligne, le texte, puis `:::` seul sur sa ligne."
  - q: "Quelle commande vérifie tous les cours avant de publier ?"
    r: "`npm run verifier` : il doit afficher 0 erreur."
  - q: "Combien de temps après un push le site est-il à jour ?"
    r: "Environ 2 minutes : une Action GitHub vérifie, reconstruit et publie le site."
  - q: "Quel jeton GitHub donner à l'Atelier ?"
    r: "Un jeton fine-grained limité au repo Cours-Dev-Code, avec Contents en lecture et écriture (et Gists pour la synchro)."
  - q: "Que fait l'Action inbox.yml ?"
    r: "Elle transforme les fichiers déposés dans inbox/ en cours avec Claude, fait le commit, puis lance la mise en ligne."
quiz:
  - question: "Ton fichier s'appelle 7-UseEffect.md. Quel est le bon nom ?"
    choix:
      - "07-useeffect.md"
      - "7-useeffect.md"
      - "07-UseEffect.md"
      - "07_useeffect.md"
    reponse: "07-useeffect.md"
    explication: "Le numéro s'écrit sur 2 chiffres, puis le slug : minuscules, chiffres et tirets seulement."
  - question: "Dans le cours, comment écris-tu le chemin de l'image public/media/react/schema.png ?"
    choix:
      - "public/media/react/schema.png"
      - "/media/react/schema.png"
      - "/Cours-Dev-Code/public/media/react/schema.png"
      - "../media/react/schema.png"
    reponse: "/media/react/schema.png"
    explication: "On part de /media/ : public/ n'apparaît jamais, et le site ajoute tout seul /Cours-Dev-Code devant."
  - question: "Les choix sont \"Un tableau\" et \"Un objet\", et ta reponse vaut \"un tableau\". Que se passe-t-il ?"
    choix:
      - "Ça passe, les majuscules sont ignorées"
      - "La validation refuse : reponse doit être le texte exact d'un choix"
      - "Le site prend le choix le plus proche"
      - "La question est ignorée sans message"
    reponse: "La validation refuse : reponse doit être le texte exact d'un choix"
    explication: "La comparaison est exacte, lettre par lettre, majuscules comprises. Copie-colle toujours le choix dans reponse."
  - question: "Tu es sur ton téléphone. Tu n'as aucune clé API Anthropic, ni dans le site, ni dans le repo. Quel chemin marche ?"
    choix:
      - "Le prompt universel dans une IA gratuite"
      - "L'onglet « Automatique (Claude) » de l'Atelier"
      - "Le dossier inbox/ et son Action"
      - "Aucun, il faut attendre d'être sur un PC"
    reponse: "Le prompt universel dans une IA gratuite"
    explication: "Le prompt marche dans n'importe quelle IA. L'onglet « Automatique (Claude) » et inbox/ ont besoin d'une clé Anthropic."
  - question: "Quel titre Markdown ne doit jamais apparaître dans le corps d'un cours ?"
    choix:
      - "# Titre"
      - "## Titre"
      - "### Titre"
    reponse: "# Titre"
    explication: "Le titre du cours vient du frontmatter. Chaque ## est une notion, donc une étape du Mode Focus."
  - question: "L'IA a écrit essentiel: useState : l'état local, sans guillemets. Que se passe-t-il ?"
    choix:
      - "Le YAML casse : mets le texte entre guillemets doubles"
      - "Rien, le YAML accepte tout"
      - "Le texte est coupé après useState, sans erreur"
      - "Le site remplace le « : » par un tiret"
    reponse: "Le YAML casse : mets le texte entre guillemets doubles"
    explication: "Un « : » suivi d'un espace fait croire au YAML qu'une nouvelle clé commence. Entre guillemets doubles, c'est du simple texte."
  - question: "Ton site n'a pas changé 10 minutes après ton push. Où regardes-tu d'abord ?"
    choix:
      - "L'onglet Actions du repo GitHub"
      - "Le localStorage du navigateur"
      - "Le dossier inbox/"
      - "Les Réglages du site"
    reponse: "L'onglet Actions du repo GitHub"
    explication: "Une croix rouge = build en échec, souvent une erreur de contenu. Le journal donne le fichier et le champ ; l'ancienne version du site reste en ligne."
exercices:
  - titre: "Range les fichiers"
    niveau: facile
    enonce: "Tu as un cours sur les props (chapitre 4 du tome React) et une image props.png. Donne le chemin du cours, le chemin de l'image dans le repo, et la ligne Markdown qui affiche l'image."
    indices:
      - "Les cours sont dans src/content/cours/, un dossier par matière."
      - "Le numéro du chapitre s'écrit sur 2 chiffres."
      - "Dans le cours, le chemin de l'image commence par /media/."
    solution: |
      ```text
      src/content/cours/react/04-props.md
      public/media/react/props.png
      ![Schéma des props](/media/react/props.png)
      ```
  - titre: "Répare ce frontmatter"
    niveau: moyen
    enonce: |
      Ce frontmatter contient 3 erreurs. Trouve-les et corrige-les.

      ```yaml
      titre: useState : l'état d'un composant
      matiere: React
      essentiel: "useState crée une valeur que React surveille."
      quiz:
        - question: "Que renvoie useState ?"
          choix: ["Un tableau", "Un objet", "Un nombre"]
          reponse: "un tableau"
      ```
    indices:
      - "Un « : » suivi d'un espace, hors guillemets, casse le YAML."
      - "matiere est un slug : minuscules, chiffres et tirets."
      - "Compare reponse et les choix lettre par lettre, majuscules comprises."
    solution: |
      ```yaml
      titre: "useState : l'état d'un composant"  # 1. guillemets à cause du « : »
      matiere: react                             # 2. le slug, en minuscules
      essentiel: "useState crée une valeur que React surveille."
      quiz:
        - question: "Que renvoie useState ?"
          choix: ["Un tableau", "Un objet", "Un nombre"]
          reponse: "Un tableau"                  # 3. le texte exact du choix
      ```
  - titre: "Écris une notion complète"
    niveau: difficile
    enonce: "Écris en Markdown une notion « Afficher une liste » (React) avec les 4 blocs : quoi, exemple (avec un bloc de code jsx), piege et ou."
    indices:
      - "Commence par un titre ## : c'est la notion."
      - "Chaque bloc s'ouvre avec `:::nom` et se ferme avec `:::` seul sur sa ligne."
      - "Dans l'exemple, le bloc de code jsx se place entre les deux lignes du bloc."
    solution: |
      ````md
      ## Afficher une liste

      :::quoi
      On transforme un **tableau** en éléments avec **map**, et chaque élément reçoit une **key** unique.
      :::

      :::exemple
      ```jsx
      <ul>
        {articles.map((a) => <li key={a.id}>{a.titre}</li>)}
      </ul>
      ```
      :::

      :::piege
      Oublier la `key` : React affiche un avertissement et peut mal mettre la liste à jour.
      :::

      :::ou[Dans un blog React]
      La liste des articles de la page d'accueil.
      :::
      ````
---

## Chemin 1 : le prompt universel

:::quoi
Le **prompt universel** (fichier **PROMPT-COURS.md**) apprend le format Manabi à n'importe quelle IA : tu ajoutes ta source, elle te rend un fichier **.md**.
:::

:::exemple
```text
[le prompt copié depuis PROMPT-COURS.md]

SOURCE À TRANSFORMER
Cours React n°7 : useEffect lance du code après l'affichage.
Le tableau de dépendances décide quand il se relance…
[ou joins le PDF et les photos du tableau au message]
```
:::

:::piege
L'IA répond par **un seul bloc de code** : copie **ce qu'il y a dedans**, sans les lignes d'accents graves autour (l'étape Vérifier de l'Atelier les enlève pour toi).
:::

:::ou[Dans le repo]
`PROMPT-COURS.md`, à la racine (bouton « Copier » en haut à droite du bloc, sur GitHub). L'Atelier et l'Action d'inbox/ lisent ce même fichier : une seule source, partout.
:::

:::astuce
Les champs entre doubles accolades (`{{MATIERE}}`, `{{TYPE}}`…) se remplissent tout seuls dans l'Atelier. Si tu copies le prompt à la main, laisse-les tels quels : l'IA choisira.
:::

## Chemin 2 : l'Atelier du site

:::quoi
La page **Atelier** (工) crée un cours en **4 étapes**, une seule à l'écran à la fois : Source, Générer, Vérifier, Publier.
:::

:::exemple
```text
1 Source     PDF, images (photo du tableau, slides), texte ou .md collé,
             ou repo GitHub ; + matière, type, niveau, « Ce que je veux »
2 Générer    « N'importe quelle IA » ou « Automatique (Claude) »
3 Vérifier   « Réparer automatiquement », erreurs, aperçu
4 Publier    « Télécharger le .md » ou « Publier sur GitHub »
```
:::

:::piege
Le **jeton GitHub** et la **clé Anthropic** restent **dans ce navigateur** : ressaisis-les sur un autre appareil, et jamais dans un fichier du repo.
:::

:::ou[Dans Manabi]
La page Atelier, sur n'importe quel appareil, téléphone compris ; ton brouillon est gardé tout seul. Les clés se rangent dans **Réglages** (設), rubriques Synchronisation et IA.
:::

:::info
**Publier sur GitHub** :

- écrit le cours dans `src/content/cours/<matiere>/` et crée la matière si elle est nouvelle ;
- range les fichiers joints dans `public/media/<matiere>/` ;
- demande un jeton **fine-grained** : ce repo seulement, **Contents** en lecture et écriture.
:::

## Chemin 3 : le dossier inbox/

:::quoi
Tu déposes un PDF, des images ou un .md dans **inbox/** : l'Action **inbox.yml** en fait un cours avec Claude, puis met le site à jour.
:::

:::exemple
```bash
# Depuis ton PC (ou sur github.com : « Add file » → « Upload files »)
cp ~/Downloads/cours-useeffect.pdf inbox/
git add inbox/cours-useeffect.pdf
git commit -m "inbox : cours useEffect"
git push
```
:::

:::piege
Sans le secret **ANTHROPIC_API_KEY** dans le repo, rien n'est généré : tes fichiers attendent dans inbox/, et le résumé de l'Action explique quoi faire.
:::

:::ou[Dans le repo]
`inbox/`, avec son mode d'emploi `inbox/README.md`. Le secret se règle sur GitHub : **Settings** → **Secrets and variables** → **Actions**. Une source refusée part dans `inbox/_a-revoir/`, avec la réponse de l'IA à corriger.
:::

:::astuce
Plusieurs photos pour un même cours ? Mets-les dans un **sous-dossier** de inbox/ : un dossier = un cours. Pour guider l'IA, ajoute une consigne dans `cours-useeffect.consigne.txt`, à côté du PDF.
:::

## Le frontmatter en bref

:::quoi
Tout en haut du fichier, le **frontmatter** : du YAML entre deux lignes `---`. Seuls **titre**, **matiere** et **essentiel** sont obligatoires.
:::

:::exemple
```yaml title="src/content/cours/react/06-usestate.md"
---
titre: "useState : l'état d'un composant"
matiere: react
essentiel: "useState crée une valeur que React surveille. On la change avec setX et le composant se redessine."
flashcards:
  - q: "Que fait setCompte(5) ?"
    r: "Met l'état à 5 et React redessine le composant."
---
```
:::

:::piege
Le nom du fichier : **NN sur 2 chiffres**, puis minuscules et tirets (`06-usestate.md`, pas `6-UseState.md`). Et **matiere** = le nom du dossier.
:::

:::ou[Dans le repo]
`src/content/cours/`, un dossier par tome. `npm run nouveau -- react "useEffect : les effets de bord"` crée un modèle à remplir, en **brouillon** (caché tant que `brouillon: true`).
:::

:::astuce
La 1re ligne écrite par l'IA, `# fichier : 06-usestate.md`, est un commentaire YAML : c'est le nom à donner au fichier.
:::

## Le corps : des notions et des blocs

:::quoi
Chaque titre **##** est une **notion**, donc une étape du Mode Focus. Dedans, chaque **bloc** s'ouvre avec `:::nom` et se ferme avec `:::` seul sur sa ligne.
:::

::::exemple
```md
## Réagir à un clic

:::quoi
Un **événement** reçoit une **fonction**.
:::

:::ou[Dans mon-blog]
Le bouton « J'aime » de chaque article.
:::
```
::::

:::piege
Un bloc **sans** son `:::` de fermeture avale la suite du cours. Et jamais de titre **#** : le titre vient du frontmatter.
:::

:::ou[Dans le repo]
Tous les fichiers de `src/content/cours/`. Blocs possibles : quoi, exemple, piege, ou, et au besoin astuce, info, attention, retenir. Un nom inconnu s'affiche comme une info, sans erreur.
:::

:::astuce
Cas rare : si ton exemple de code contient lui-même des lignes `:::`, ouvre le bloc avec **quatre** deux-points (`::::exemple`) et ferme-le avec `::::`. Sinon, le premier `:::` du code ferme ton bloc trop tôt.
:::

## Images et PDF

:::quoi
Les fichiers vont dans `public/media/<matiere>/`. Dans le cours, tu écris le chemin **à partir de /media/**.
:::

:::exemple
```md
Le cycle de vie d'un composant :

![Schéma du cycle de vie d'un composant](/media/react/cycle-de-vie.png)

::pdf{src="/media/react/06-slides.pdf" titre="Slides du cours 6"}
```
:::

:::piege
**public/** n'apparaît jamais dans le chemin : écris `/media/react/schema.png`, et le site ajoute tout seul `/Cours-Dev-Code` devant.
:::

:::ou[Dans le repo]
`public/media/react/`, `public/media/javascript/`… Pour qu'un PDF apparaisse aussi dans la section **Documents** (書), ajoute-le au champ `fichiers` du frontmatter.
:::

## Corriger une erreur de validation

:::quoi
**npm run verifier** contrôle tous les cours avec les règles du build. Corrige chaque erreur (fichier, ligne ou champ), puis relance jusqu'à **0 erreur**.
:::

:::exemple
```text
$ npm run verifier
✗ src/content/cours/react/07-useeffect.md
    erreur  quiz[0].reponse : doit être exactement l'un des choix (même texte, mêmes majuscules)
    erreur  ligne 19 : le bloc :::piege n'est pas fermé avant la notion de la ligne 22 (ajoute « ::: » seul sur une ligne).

45 cours et 7 matières vérifiés : 2 erreurs, 0 avertissement.
```
:::

:::piege
Les guillemets typographiques (“ ”) ne délimitent **pas** un texte YAML : utilise les guillemets droits `"`.
:::

:::ou[Dans le repo]
`scripts/verifier-contenu.mjs`, sur ton PC ou dans Codespaces. Il tourne aussi dans l'onglet **Actions** de GitHub avant chaque mise en ligne, et l'étape **Vérifier** de l'Atelier applique le même schéma.
:::

:::astuce
Les erreurs les plus fréquentes : une **reponse** qui n'est pas le texte exact d'un choix, un « : » dans un texte **sans guillemets**, une **tabulation** au lieu de 2 espaces. Et `npm run verifier -- --json` donne le rapport en JSON, à coller dans une IA pour qu'elle corrige.
:::
