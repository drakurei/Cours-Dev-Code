# inbox/ — dépose une source, récupère un cours

Tout ce que tu poses ici devient un cours Manabi, tout seul, en quelques minutes.

## Ce que tu peux déposer

| Tu déposes | Ça donne |
|---|---|
| un fichier `.pdf` (slides, polycopié, énoncé de TP) | un cours, et le PDF rangé dans ses documents |
| une image `.png`, `.jpg`, `.jpeg`, `.webp` (photo du tableau, capture) | un cours, et l'image rangée dans ses documents |
| un `.md` ou un `.txt` (tes notes, un README) | un cours |
| un **sous-dossier** avec plusieurs fichiers | **un seul** cours qui les utilise tous |

Une image fait 7,5 Mo au plus. Une source trop longue : découpe-la en plusieurs dépôts.

## Guider l'IA (facultatif)

Ajoute une consigne à côté du fichier, avec le même nom + `.consigne.txt` :

```text
cours-useeffect.pdf
cours-useeffect.consigne.txt
```

Dans un sous-dossier : n'importe quel fichier `*.consigne.txt` (ou `consigne.txt`).

Les premières lignes peuvent fixer la matière, le type et le niveau. Le reste est libre :

```text
matiere: react
type: cours
niveau: debutant
Insiste sur le tableau de dépendances et les pièges de boucle infinie.
```

Sans consigne, l'IA choisit seule la matière, le type et le niveau.

## Déposer depuis le téléphone (ou n'importe quel navigateur)

1. Ouvre `github.com/drakurei/Cours-Dev-Code`, puis le dossier **inbox**.
2. **Add file** → **Upload files**. (Sur téléphone, si le bouton manque : menu du navigateur → « Version pour ordinateur ».)
3. Choisis tes fichiers, puis **Commit changes** (sur la branche `main`).
4. Onglet **Actions** : « Inbox → cours » tourne, puis « Déploiement ». Le cours est en ligne 2 à 5 minutes plus tard.

Depuis un PC : copie le fichier dans `inbox/`, puis `git add`, `git commit`, `git push`.

## Ce qui se passe

1. L'Action `inbox.yml` lance `scripts/generer-cours.mjs` avec l'API Claude (secret `ANTHROPIC_API_KEY`).
2. Le script envoie la source avec le prompt universel (`PROMPT-COURS.md`), vérifie le cours avec le même schéma que le site, et demande une correction à l'IA si besoin (une fois).
3. Le cours est écrit dans `src/content/cours/<matiere>/NN-slug.md`. Les PDF et images vont dans `public/media/<matiere>/`.
4. La source est retirée de `inbox/`, tout est enregistré (commit), puis le site est redéployé.

## Si ça coince

- **Pas de secret `ANTHROPIC_API_KEY`** : rien n'est généré, rien ne casse. Le résumé de l'Action explique comment l'ajouter. En attendant : le prompt universel dans n'importe quelle IA, ou l'Atelier du site.
- **`inbox/_a-revoir/<nom>/`** : la source n'a pas donné de cours valide (ou l'IA a refusé). Tu y trouves la source, `erreurs.txt` et la réponse de l'IA (`reponse-ia.md`) à corriger dans l'Atelier ou à la main. Pour relancer : remets la source dans `inbox/`.
- **Échec réseau ou API surchargée** : la source reste dans `inbox/`. Relance l'Action (Actions → « Inbox → cours » → **Run workflow**).

## En local

```bash
npm run generer -- --essai   # montre ce qui serait envoyé, sans appeler l'API
npm run generer              # avec ANTHROPIC_API_KEY dans l'environnement
```

Modèle par défaut : `claude-sonnet-5-5`. Pour en changer : variable `MANABI_MODELE` (ex. `claude-opus-5-5`), en local ou dans GitHub (Settings → Secrets and variables → Actions → **Variables**).

Rappel : le repo est **public**. Ne dépose rien de confidentiel (documents du travail, données de clients, mots de passe).
