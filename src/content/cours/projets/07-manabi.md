---
titre: "Manabi : mon site de révision (Astro, Markdown validé, GitHub Pages)"
matiere: "projets"
type: "projet"
chapitre: 7
niveau: "intermediaire"
duree: 14
date: 2026-10-08
source: "Projet perso, repo drakurei/Cours-Dev-Code (docs/CONCEPTION.md et le code de la V1)"
tags: ["astro", "react", "zod", "github-actions", "localstorage"]
essentiel: "Manabi est le site où tu révises tous tes cours et projets : des fiches courtes (Quoi, Exemple, Piège, Où), des flashcards à répétition espacée, des quiz et des exercices. C'est un site statique Astro avec quelques îlots React ; chaque cours est un fichier Markdown validé au build, et chaque push sur main le remet en ligne."
retenir:
  - "Astro produit du HTML statique ; React n'est chargé que dans les îlots interactifs."
  - "Un cours = Markdown + frontmatter YAML validé par Zod : reponse = le texte exact d'un des choix."
  - "Tous les liens internes passent par url() : le site vit dans /Cours-Dev-Code/."
  - "Un push sur main suffit : l'Action vérifie, teste, construit et publie."
  - "Repo public : jamais de secret ni de contenu du travail ; l'identité Git drakurei se règle dans le repo, pas en global."
definitions:
  - terme: "Astro"
    definition: "Framework qui génère un site statique (HTML) au build, avec des îlots interactifs écrits en React, Vue…"
  - terme: "Îlot (island)"
    definition: "Composant interactif isolé dans une page statique, chargé seulement quand il le faut grâce à une directive client."
  - terme: "Frontmatter"
    definition: "Le bloc YAML placé entre deux lignes --- en haut d'un fichier Markdown : les métadonnées du cours."
  - terme: "Zod"
    definition: "Bibliothèque TypeScript qui décrit un schéma et valide des données, ici le frontmatter de chaque cours."
  - terme: "FSRS"
    definition: "Algorithme de répétition espacée (bibliothèque ts-fsrs) : il calcule quand revoir chaque flashcard selon ta note."
  - terme: "GitHub Actions"
    definition: "Les automatisations de GitHub : un workflow écrit en YAML, lancé par un événement (push, bouton, appel)."
  - terme: "Base (base path)"
    definition: "Le sous-dossier où le site est servi, ici /Cours-Dev-Code/ ; chaque lien interne doit le contenir."
    exemple: "url('/tomes/') → \"/Cours-Dev-Code/tomes/\""
  - terme: "PWA"
    definition: "Site installable qui marche hors ligne grâce à un service worker qui garde les fichiers en cache."
flashcards:
  - q: "Manabi en une phrase ?"
    r: "Ton site de révision : tous tes cours et projets en fiches courtes, flashcards à répétition espacée, quiz et exercices, en ligne sur GitHub Pages."
  - q: "Pourquoi Astro plutôt qu'une appli React classique ?"
    r: "Le contenu est statique : Astro sort du HTML, et React n'est chargé que dans les îlots interactifs (quiz, flashcards, recherche)."
  - q: "Comment un cours est validé ?"
    r: "Son frontmatter passe dans un schéma Zod au build ; une erreur donne le fichier et le champ, en français, et le build s'arrête."
  - q: "La règle d'or d'une question de quiz ?"
    r: "reponse doit être exactement le texte d'un des choix (mêmes majuscules), avec 2 à 6 choix, tous différents."
  - q: "Comment le site se met à jour ?"
    r: "Chaque push sur main lance deploy.yml : vérification du contenu, tests, build, puis publication de dist/ sur la branche gh-pages."
  - q: "Pourquoi inbox.yml appelle deploy.yml lui-même ?"
    r: "Un push fait par une Action avec le GITHUB_TOKEN ne déclenche pas les autres workflows : il faut appeler le déploiement (workflow_call)."
  - q: "Où est stockée ta progression ?"
    r: "Dans le localStorage du navigateur, sous une seule clé ; export / import JSON et synchro facultative par un Gist GitHub."
  - q: "Que se passe-t-il si le localStorage est bloqué ou abîmé ?"
    r: "Chaque accès est dans un try/catch : le site repart d'un état propre et continue de marcher."
  - q: "Comment tu révises les flashcards ?"
    r: "Avec FSRS (ts-fsrs) : chaque carte revient au bon moment selon ta note, en sessions courtes de 5 à 20 cartes."
  - q: "Trois façons de créer un cours ?"
    r: "Le prompt universel PROMPT-COURS.md dans n'importe quelle IA, l'Atelier du site (PDF, images, texte, repo GitHub), ou le dossier inbox/ du repo."
  - q: "Comment coder depuis le PC pro ?"
    r: "GitHub Codespaces dans le navigateur (rien à installer), ou un clone avec l'identité Git drakurei réglée dans le repo, jamais en global."
  - q: "Pourquoi tous les liens passent par url() ?"
    r: "Le site vit dans /Cours-Dev-Code/ : url() ajoute la base ; un lien écrit à la main finirait en 404."
  - q: "Quels principes TDA guident le design ?"
    r: "L'essentiel d'abord, toujours la même structure, une seule chose à la fois (Mode Focus), sessions courtes, correction immédiate."
quiz:
  - question: "Avec quelle directive client un îlot Astro n'est-il chargé qu'au moment où il arrive à l'écran ?"
    choix:
      - "load"
      - "visible"
      - "only"
      - "idle"
    reponse: "visible"
    explication: "client:visible attend que l'îlot entre dans l'écran ; client:idle attend que le navigateur soit libre ; client:load charge tout de suite."
  - question: "Une question a choix [\"A\", \"b\", \"C\"] et reponse \"B\". Que dit la validation ?"
    choix:
      - "OK : les majuscules ne comptent pas"
      - "Erreur : reponse doit être exactement l'un des choix"
      - "OK, si B est en deuxième position"
      - "Le quiz est ignoré sans message"
    reponse: "Erreur : reponse doit être exactement l'un des choix"
    explication: "Le schéma compare le texte exact : \"B\" n'est pas \"b\". Le message dit le fichier et le champ fautif."
  - question: "Le site est servi sur drakurei.github.io/Cours-Dev-Code/. Où mène un lien écrit à la main href=\"/glossaire/\" ?"
    choix:
      - "drakurei.github.io/Cours-Dev-Code/glossaire/"
      - "drakurei.github.io/glossaire/"
      - "Au glossaire : Astro corrige tout seul"
    reponse: "drakurei.github.io/glossaire/"
    explication: "Un chemin qui commence par / part de la racine du domaine. url('/glossaire/') ajoute la base /Cours-Dev-Code."
  - question: "Une Action pousse un commit avec le GITHUB_TOKEN. Que fait deploy.yml, déclenché « on: push » ?"
    choix:
      - "Il se lance comme d'habitude"
      - "Il ne se lance pas : il faut l'appeler (workflow_call)"
      - "Il se lance deux fois"
      - "Il échoue avec une erreur de droits"
    reponse: "Il ne se lance pas : il faut l'appeler (workflow_call)"
    explication: "GitHub bloque ces déclenchements pour éviter les boucles infinies : inbox.yml appelle donc deploy.yml après son commit."
  - question: "Sur le PC pro, comment régler ton identité Git pour ce repo seulement ?"
    choix:
      - "git config --global user.name drakurei"
      - "git config user.name drakurei, lancé dans le dossier du repo"
      - "git init --user drakurei"
      - "git remote add drakurei"
    reponse: "git config user.name drakurei, lancé dans le dossier du repo"
    explication: "Sans --global, le réglage est écrit dans .git/config du repo : ton identité de travail reste intacte ailleurs."
  - question: "Où vit ta progression (cours lus, cartes, pétales) ?"
    choix:
      - "Dans une base de données sur un serveur"
      - "Dans le localStorage du navigateur"
      - "Dans les fichiers du repo GitHub"
      - "Dans un cookie envoyé au serveur"
    reponse: "Dans le localStorage du navigateur"
    explication: "Pas de serveur ni de compte : tout est dans le navigateur, avec export / import et une synchro Gist facultative."
exercices:
  - titre: "Réparer une question de quiz"
    niveau: "facile"
    enonce: "Cette question casse le build : reponse: 2, choix: [\"Vrai\", \"Faux\"]. Réécris-la pour qu'elle passe la validation, avec une explication."
    indices:
      - "reponse est un texte, pas un numéro."
      - "Recopie exactement l'un des choix, majuscule comprise."
    solution: |
      ```yaml
      quiz:
        - question: "Un cours Manabi est validé au build ?"
          choix:
            - "Vrai"
            - "Faux"
          reponse: "Vrai"
          explication: "Le frontmatter passe dans le schéma Zod de src/lib/schema.ts."
      ```
  - titre: "Vérifier un quiz en JavaScript"
    niveau: "moyen"
    enonce: "Écris verifierQuestion(q) qui renvoie la liste des erreurs d'une question { question, choix, reponse } : moins de 2 ou plus de 6 choix, deux choix identiques, ou une reponse qui n'est pas exactement l'un des choix. Une question correcte renvoie []."
    indices:
      - "Commence par const erreurs = [] et ajoute un message par problème."
      - "choix.includes(reponse) teste le texte exact."
      - "new Set(choix).size !== choix.length repère les doublons."
    solution: |
      ```js
      function verifierQuestion(q) {
        const erreurs = [];
        if (q.choix.length < 2 || q.choix.length > 6) erreurs.push("il faut de 2 à 6 choix");
        if (new Set(q.choix).size !== q.choix.length) erreurs.push("deux choix sont identiques");
        if (!q.choix.includes(q.reponse)) erreurs.push("reponse doit être exactement l'un des choix");
        return erreurs;
      }

      console.log(verifierQuestion({ question: "?", choix: ["A", "b"], reponse: "B" }));
      // [ "reponse doit être exactement l'un des choix" ]
      ```
  - titre: "Ta propre fonction url()"
    niveau: "difficile"
    enonce: "Écris ajouterBase(chemin, base) qui préfixe un chemin interne avec la base du site, sans double slash : ajouterBase(\"/tomes/\", \"/Cours-Dev-Code/\") donne \"/Cours-Dev-Code/tomes/\", et ajouterBase(\"/tomes/\", \"/\") donne \"/tomes/\". Un lien externe (https://…) est renvoyé tel quel."
    indices:
      - "Un lien externe commence par un protocole : `/^[a-z]+:/i` le repère."
      - "Enlève les / de fin de la base avec `replace(/\\/+$/, \"\")`."
      - "Assure-toi que le chemin commence par un seul / avant de coller les deux."
    solution: |
      ```js
      function ajouterBase(chemin, base) {
        if (/^[a-z][a-z0-9+.-]*:/i.test(chemin)) return chemin; // lien externe
        const b = base.replace(/\/+$/, "");
        const p = "/" + chemin.replace(/^\/+/, "");
        return b + p;
      }

      console.log(ajouterBase("/tomes/", "/Cours-Dev-Code/")); // /Cours-Dev-Code/tomes/
      console.log(ajouterBase("/tomes/", "/"));                // /tomes/
      console.log(ajouterBase("https://github.com", "/x/"));   // https://github.com
      ```
projet:
  repo: "https://github.com/drakurei/Cours-Dev-Code"
  demo: "https://drakurei.github.io/Cours-Dev-Code/"
  stack: ["Astro", "React", "TypeScript", "Zod", "ts-fsrs", "GitHub Actions"]
  statut: "en-cours"
  role: "Seul, projet perso : le site où je révise tout"
---

## Le projet en un coup d'œil

:::quoi
Manabi est ton **site de révision** : chaque cours et chaque projet devient une fiche courte, avec des **flashcards**, un **quiz** et des **exercices**. Pensé TDA : l'essentiel d'abord, toujours la même structure, une chose à la fois.
:::

:::exemple
```text
src/content/cours/<matiere>/NN-slug.md   les cours : Markdown + frontmatter YAML
src/content/matieres/*.yaml              les tomes : nom, kanji, couleur
src/lib/                                 TypeScript pur : schéma, store, url, Markdown…
src/islands/                             composants React interactifs
PROMPT-COURS.md                          le prompt universel pour n'importe quelle IA
scripts/verifier-contenu.mjs             vérifie tous les cours avant un push
.github/workflows/deploy.yml             push sur main : vérifier, tester, construire, publier
```
:::

:::piege
Le repo est **public** : jamais de secret (jeton, clé API), jamais de contenu confidentiel du travail, jamais de donnée perso. Les jetons restent dans **ton navigateur**.
:::

:::ou[Réutilisé ensuite]
Ce cours en est la preuve : il est écrit au format Manabi et vérifié au build, comme tous les autres. Le contrat complet est dans `docs/CONCEPTION.md`.
:::

:::info[Ce que tu as fait]
Le cahier des charges : un site pensé pour ton TDA, un thème Apple × japonais floral, la mise à jour automatique, un prompt universel, l'import de PDF et d'images transformés en cours, et la possibilité de travailler depuis le PC perso comme depuis le PC pro.
:::

## Astro : du HTML statique et des îlots React

:::quoi
**Astro** génère des pages HTML statiques au build. Seuls les morceaux interactifs (quiz, flashcards, recherche, réglages) sont des **îlots** React, chargés avec une directive `client:`.
:::

:::exemple
```astro
---
import Quiz from '../islands/Quiz.tsx'
const { quiz } = Astro.props
---
<article>
  <slot />                                   <!-- le cours : du HTML pur -->
  <Quiz questions={quiz} client:visible />   <!-- îlot chargé à l'écran -->
</article>
```
:::

:::piege
Mettre `client:load` partout ramène tout le JavaScript d'une appli React classique. Un îlot seulement là où il faut de l'interactivité, et `client:visible` s'il est bas dans la page.
:::

:::ou[Dans Manabi]
`client:visible` pour les quiz et les flashcards, `client:idle` pour la palette de recherche et le minuteur, `client:only="react"` pour l'Atelier et les Réglages, rendus seulement dans le navigateur.
:::

## Un cours, un fichier Markdown validé

:::quoi
Chaque cours est un fichier `.md` : un **frontmatter YAML** (titre, essentiel, quiz…) puis le corps. Au build, un schéma **Zod** valide chaque champ ; une erreur donne le fichier et le champ, en français.
:::

:::exemple
```ts title="src/lib/schema.ts"
.superRefine((q, ctx) => {
  if (!q.choix.includes(q.reponse)) {
    ctx.addIssue({
      code: 'custom',
      path: ['reponse'],
      message: "doit être exactement l'un des choix (même texte, mêmes majuscules)",
    });
  }
})
```
:::

:::piege
`reponse` est le **texte exact** d'un des `choix`, pas son numéro : une majuscule ou un accent de différence et la validation échoue.
:::

:::ou[Dans Manabi]
Le même schéma sert au build, à `npm run verifier` et à l'Atelier. Le format complet d'un cours est au chapitre 4 de `docs/CONCEPTION.md`.
:::

## Tous les liens passent par url()

:::quoi
Le site vit dans un **sous-dossier** : `https://drakurei.github.io/Cours-Dev-Code/`. Astro le sait grâce à `base`, et la fonction `url()` ajoute cette base à chaque lien interne.
:::

:::exemple
```js title="astro.config.mjs"
const BASE = '/Cours-Dev-Code';

export default defineConfig({
  site: 'https://drakurei.github.io',
  base: BASE,
  trailingSlash: 'always',
  // ...
});
```
:::

:::piege
Un lien écrit à la main, `href="/glossaire/"`, part de la **racine du domaine** : 404. C'est le même piège que le logo de PokéBistro. Écris `url('/glossaire/')`.
:::

:::ou[Dans Manabi]
`src/lib/url.ts` : `url('/tomes/')` donne `/Cours-Dev-Code/tomes/`. Les images `/media/…` des cours sont préfixées automatiquement par un plugin Markdown.
:::

## La mise à jour automatique

:::quoi
Une **GitHub Action** fait tout à chaque push sur `main` : vérifier le contenu, lancer les tests, construire, puis publier `dist/` sur la branche **gh-pages**.
:::

:::exemple
```yaml title=".github/workflows/deploy.yml"
on:
  push:
    branches: [main]   # chaque push sur main
  workflow_dispatch:    # bouton « Run workflow » dans l'onglet Actions
  workflow_call:        # appelé par inbox.yml après son commit
```
:::

:::piege
Un commit poussé par une Action avec le `GITHUB_TOKEN` ne relance **pas** les autres workflows (protection contre les boucles) : `inbox.yml` appelle donc `deploy.yml` lui-même.
:::

:::ou[Dans Manabi]
Étapes de `deploy.yml` : `npm ci`, `npm run verifier`, `npm test`, `npm run build`, puis publication. Un seul déploiement à la fois grâce à `concurrency`.
:::

## La progression, dans ton navigateur

:::quoi
Pas de serveur, pas de compte : ta progression (cours lus, cartes, quiz, pétales) est un objet JSON rangé sous **une seule clé** du localStorage, `manabi:v1`. Les secrets sont rangés à part.
:::

:::exemple
```ts title="src/lib/store.ts"
function charger(): Etat {
  const brut = lireBrut(CLE);
  brutCache = brut;
  if (!brut) return cloner(ETAT_INITIAL);
  try {
    return normaliser(JSON.parse(brut));
  } catch {
    return cloner(ETAT_INITIAL); // JSON abîmé : on repart proprement sans planter
  }
}
```
:::

:::piege
En navigation privée ou avec les cookies bloqués, le simple accès à `localStorage` peut **lever une erreur** : chaque lecture et chaque écriture est dans un `try/catch`.
:::

:::ou[Dans Manabi]
`modifier(fn)` travaille sur une copie, la sauvegarde et prévient les îlots ; le hook `useManabi()` (avec `useSyncExternalStore`) redessine ce qui change. Export / import JSON et synchro par Gist dans les Réglages.
:::

## Coder partout : PC perso et PC pro

:::quoi
**GitHub est la seule source de vérité** : en arrivant, `git pull` ; en partant, commit puis `git push`. Sur le PC pro, le plus simple est **GitHub Codespaces** : VS Code dans le navigateur, rien à installer.
:::

:::exemple
```bash
git clone https://github.com/drakurei/Cours-Dev-Code.git
cd Cours-Dev-Code
git config user.name "drakurei"
git config user.email "229352063+drakurei@users.noreply.github.com"
npm ci
npm run dev                                     # http://localhost:4321/Cours-Dev-Code/
npm run verifier && npm test && npm run build   # avant chaque push
```
:::

:::piege
Sur le PC pro, `git config` **sans** `--global` : l'identité drakurei ne vaut que pour ce repo. Jamais ton e-mail pro dans ce dépôt public.
:::

:::ou[Dans Manabi]
`scripts/installer-pc.ps1` (ou `.sh`) règle l'identité locale et installe tout ; dans Codespaces, `.devcontainer/devcontainer.json` le fait tout seul. Pour juste ajouter un cours : l'Atelier du site ou le dossier `inbox/`.
:::
