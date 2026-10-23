---
titre: "Mon Blog : mon premier projet React (recherche et filtres)"
matiere: "projets"
type: "projet"
chapitre: 4
niveau: "debutant"
duree: 12
date: 2026-09-22
source: "Cours React en live, exercice du formateur (repo drakurei/tp-react-blog)"
tags: ["react", "usestate", "props", "filter", "github-pages"]
essentiel: "Un blog en React et Vite, mis en forme avec Bootstrap : 13 articles lus dans un fichier de données, une recherche en direct, des filtres par catégorie et par mot-clé, un bouton J'aime. Tout tient sur deux états dans App, partagés avec les composants par des props. En ligne sur GitHub Pages."
retenir:
  - "Un état partagé vit dans le parent commun ; les enfants le reçoivent en props, avec sa fonction setX."
  - "Champ contrôlé = value + onChange."
  - "Ce qui se calcule (la liste filtrée) ne va pas dans un useState."
  - "Pour comparer du texte : toLowerCase des deux côtés ; pour trier en français : localeCompare."
  - "Site dans un sous-dossier de GitHub Pages : base relative ./ au build, jamais un argument qui commence par / avec Git Bash."
definitions:
  - terme: "Composant"
    definition: "Fonction qui renvoie du JSX ; son nom commence par une majuscule."
    exemple: "function SearchBar({ valeur, onChange }) { ... }"
  - terme: "Props"
    definition: "Les paramètres d'un composant, passés comme des attributs JSX."
    exemple: "SearchBar reçoit valeur={recherche} et onChange={setRecherche}"
  - terme: "État (state)"
    definition: "Valeur que React surveille, créée avec useState ; la changer redessine le composant."
  - terme: "Champ contrôlé"
    definition: "Champ dont la valeur vient de l'état React (value) et qui le met à jour à chaque frappe (onChange)."
  - terme: "Remonter l'état (lifting state up)"
    definition: "Placer un état dans le parent commun pour que plusieurs enfants le partagent."
  - terme: "Vite"
    definition: "Outil qui lance le serveur de développement (rechargement à chaud) et construit le site final dans dist/."
  - terme: "gh-pages (paquet npm)"
    definition: "Publie un dossier (ici dist/) sur la branche gh-pages du dépôt, servie par GitHub Pages."
flashcards:
  - q: "Présente mon-blog en une phrase."
    r: "Un blog React (Vite + Bootstrap) : 13 articles lus dans un fichier JS, recherche en direct, filtres par catégorie et mot-clé, bouton J'aime, en ligne sur GitHub Pages."
  - q: "Où vivent les états recherche et categorie ? Pourquoi ?"
    r: "Dans App, le parent commun : SearchBar, CategoryFilter, MotsCles et Article les lisent ou les changent par des props."
  - q: "C'est quoi un champ contrôlé ?"
    r: "Un input dont la value vient de l'état React et qui appelle onChange à chaque frappe."
  - q: "Pourquoi pas de useState pour la liste filtrée ?"
    r: "Elle se calcule à chaque rendu à partir des articles et des deux états : un état de plus serait en double."
  - q: "Comment la recherche ignore les majuscules ?"
    r: "Le texte cherché et chaque champ passent en toLowerCase() avant le includes()."
  - q: "Comment tu as dédoublonné les mots-clés ?"
    r: "Une boucle forEach qui n'ajoute un mot que s'il n'est pas déjà dans le tableau (includes), puis un tri avec localeCompare."
  - q: "Que se passe-t-il au clic sur un mot-clé ?"
    r: "setRecherche(mot) : le mot s'écrit dans la barre de recherche et la liste se filtre."
  - q: "Pourquoi J'aime est un état local d'Article ?"
    r: "Chaque carte a son propre cœur et personne d'autre n'a besoin de cette valeur : elle reste dans le composant."
  - q: "Comment tu déploies ?"
    r: "npm run deploy : predeploy construit avec --base=./, puis gh-pages publie dist/ sur la branche gh-pages."
  - q: "Pourquoi --base=./ et pas --base=/tp-react-blog/ ?"
    r: "Git Bash convertit un argument qui commence par / en chemin Windows ; la base relative évite le piège et marche dans n'importe quel sous-dossier."
  - q: "Pourquoi les images ont changé en cours de route ?"
    r: "LoremFlickr s'est mis à répondre 401 à toutes les images ; tu les as remplacées par des photos Pixabay (CDN), vérifiées une par une."
  - q: "Comment sont faites les icônes ?"
    r: "Des SVG de Bootstrap Icons dans de petits composants (IconSearch, IconFrown, IconHeart avec sa prop plein), pas d'emoji."
quiz:
  - question: "Que se passe-t-il avec un input qui a value={valeur} mais pas de onChange ?"
    choix:
      - "Le champ marche normalement"
      - "Le champ est bloqué en lecture seule et React affiche un avertissement"
      - "L'application plante"
      - "La valeur est envoyée au serveur"
    reponse: "Le champ est bloqué en lecture seule et React affiche un avertissement"
    explication: "React impose la valeur à chaque rendu ; sans onChange pour la changer, la frappe n'a aucun effet."
  - question: "Que renvoie \"rock en seine\".includes(\"\") ?"
    choix:
      - "true"
      - "false"
      - "Une erreur"
    reponse: "true"
    explication: "Toute chaîne contient la chaîne vide : une recherche vide garde donc tous les articles."
  - question: "Que donne [\"zouk\", \"électro\"].sort() ?"
    choix:
      - "[\"électro\", \"zouk\"]"
      - "[\"zouk\", \"électro\"]"
      - "Une erreur à cause de l'accent"
    reponse: "[\"zouk\", \"électro\"]"
    explication: "Sans fonction, sort compare les codes des caractères : é passe après z. localeCompare range les accents comme en français."
  - question: "Pourquoi les états recherche et categorie sont dans App ?"
    choix:
      - "Parce que useState n'est autorisé que dans App"
      - "Parce que plusieurs composants enfants doivent partager ces valeurs"
      - "Pour que la page charge plus vite"
      - "Parce que Bootstrap l'exige"
    reponse: "Parce que plusieurs composants enfants doivent partager ces valeurs"
    explication: "La barre de recherche, les pastilles, la barre latérale et les cartes lisent ou changent les mêmes valeurs : elles vivent dans leur parent commun."
  - question: "Que fait le script predeploy ?"
    choix:
      - "Il publie le site sur GitHub"
      - "Il se lance tout seul avant deploy et construit le site avec une base relative"
      - "Il installe le paquet gh-pages"
      - "Il crée la branche main"
    reponse: "Il se lance tout seul avant deploy et construit le site avec une base relative"
    explication: "npm lance automatiquement le script preX avant le script X : predeploy (vite build --base=./) puis deploy (gh-pages -d dist)."
  - question: "Tu cliques sur le badge #jazz d'un article. Que se passe-t-il ?"
    choix:
      - "La catégorie passe à Concert"
      - "La recherche devient « jazz » et la liste se filtre"
      - "Seul l'article cliqué reste affiché"
      - "Rien, les badges sont décoratifs"
    reponse: "La recherche devient « jazz » et la liste se filtre"
    explication: "Article reçoit onMotCle = setRecherche : le clic appelle setRecherche(\"jazz\")."
exercices:
  - titre: "Le texte du compteur"
    niveau: "facile"
    enonce: "Écris messageResultats(nombre, recherche, categorie) qui renvoie par exemple « 3 articles pour « jazz » dans Concert ». Pas de s si nombre vaut 0 ou 1 ; pas de partie « pour » si la recherche est vide ; pas de partie « dans » si la catégorie vaut Toutes."
    indices:
      - "Construis la chaîne morceau par morceau avec +=, comme dans App.jsx."
      - "Le pluriel : n'ajoute le s que si nombre > 1."
    solution: |
      ```js
      function messageResultats(nombre, recherche, categorie) {
        let message = nombre + " article";
        if (nombre > 1) message += "s";
        if (recherche) message += " pour « " + recherche + " »";
        if (categorie !== "Toutes") message += " dans " + categorie;
        return message;
      }

      console.log(messageResultats(3, "jazz", "Concert")); // 3 articles pour « jazz » dans Concert
      console.log(messageResultats(1, "", "Toutes"));      // 1 article
      ```
  - titre: "Filtrer les articles"
    niveau: "moyen"
    enonce: "Écris filtrerArticles(articles, recherche, categorie), une fonction pure qui garde les articles de la bonne catégorie (ou toutes si categorie vaut Toutes) dont le titre, la catégorie, le texte ou un mot-clé contient la recherche, sans tenir compte des majuscules."
    indices:
      - "Prépare une seule fois le texte cherché : recherche.trim().toLowerCase()."
      - "Pour chercher dans les mots-clés, colle-les avec join(' ')."
      - "Un article est gardé si bonneCategorie ET correspond."
    solution: |
      ```js
      function filtrerArticles(articles, recherche, categorie) {
        const texte = recherche.trim().toLowerCase();
        return articles.filter((article) => {
          const bonneCategorie = categorie === "Toutes" || article.categorie === categorie;
          const motsCles = article.motsCles.join(" ").toLowerCase();
          const correspond =
            article.titre.toLowerCase().includes(texte) ||
            article.categorie.toLowerCase().includes(texte) ||
            article.texte.toLowerCase().includes(texte) ||
            motsCles.includes(texte);
          return bonneCategorie && correspond;
        });
      }

      const articles = [
        { titre: "Nuit du jazz à Paris", categorie: "Concert", motsCles: ["jazz", "Paris"], texte: "Un club." },
        { titre: "Rock en Seine", categorie: "Festival", motsCles: ["rock", "Paris"], texte: "Saint-Cloud." },
      ];
      console.log(filtrerArticles(articles, "PARIS", "Festival").length); // 1
      ```
  - titre: "Un compteur de J'aime dans l'en-tête"
    niveau: "difficile"
    enonce: "Affiche dans Header le nombre total d'articles aimés. Aujourd'hui, J'aime est un état local d'Article : remonte-le dans App sous la forme d'une liste d'id aimés."
    indices:
      - "Dans App : const [aimes, setAimes] = useState([])."
      - "Une fonction basculerAime(id) ajoute l'id s'il est absent, l'enlève s'il est présent (filter), sans jamais modifier le tableau directement."
      - "Article reçoit aime (un booléen) et onToggleAime ; Header reçoit aimes.length."
    solution: |
      ```jsx
      // App.jsx
      const [aimes, setAimes] = useState([])

      function basculerAime(id) {
        if (aimes.includes(id)) {
          setAimes(aimes.filter((x) => x !== id))
        } else {
          setAimes([...aimes, id])
        }
      }

      // dans le return d'App :
      <Header nbAimes={aimes.length} />
      // ... et dans le map des articles :
      <Article
        key={article.id}
        article={article}
        aime={aimes.includes(article.id)}
        onToggleAime={() => basculerAime(article.id)}
        onCategorie={setCategorie}
        onMotCle={setRecherche}
      />

      // Header.jsx : on affiche le compteur sous le titre
      function Header({ nbAimes }) {
        return (
          <header className="header-blog text-center py-5 mb-4">
            <h1 className="display-5 fw-bold">Mon Blog</h1>
            <p className="mb-0">{nbAimes} article(s) aimé(s)</p>
          </header>
        )
      }

      // Article.jsx : plus de useState pour aime, on lit la prop
      // function Article({ article, aime, onToggleAime, onCategorie, onMotCle })
      <button
        type="button"
        className={aime ? 'btn btn-sm btn-danger' : 'btn btn-sm btn-outline-danger'}
        onClick={onToggleAime}
      >
        <IconHeart plein={aime} /> {aime ? 'Aimé' : "J'aime"}
      </button>
      ```
projet:
  repo: "https://github.com/drakurei/tp-react-blog"
  demo: "https://drakurei.github.io/tp-react-blog/"
  stack: ["React", "Vite", "Bootstrap"]
  statut: "termine"
  role: "Seul, exercice du cours React"
---

## Le projet en un coup d'œil

:::quoi
Un **blog React** qui affiche 13 articles depuis un fichier de données, avec une **recherche** en direct, des **filtres** par catégorie et par mot-clé, et un bouton « J'aime ».
:::

:::exemple
```text
src/
├── data/articles.js         les articles (id, titre, categorie, motsCles, image, date, texte)
├── App.jsx                  les 2 états, le filtre, assemble la page
├── components/
│   ├── SearchBar.jsx        champ contrôlé (valeur + onChange)
│   ├── CategoryFilter.jsx   pastilles de catégorie
│   ├── MotsCles.jsx         barre latérale des mots-clés
│   └── Article.jsx          carte : Lire la suite, J'aime (états locaux)
└── main.jsx                 point d'entrée + import de Bootstrap
```
:::

:::piege
Un service d'images externe peut tomber du jour au lendemain : **LoremFlickr** s'est mis à répondre **401** à toutes les images. Tu les as remplacées par des photos **Pixabay** (CDN), vérifiées une par une.
:::

:::ou[Réutilisé ensuite]
La recherche sur plusieurs champs et les filtres combinés reviennent dans PokéBistro, avec un **Context** à la place des props.
:::

:::info[Ce que tu as fait]
Les consignes du formateur : articles dans un fichier, recherche sur le titre, les mots-clés, les catégories et le texte, mise en forme Bootstrap. Puis ses bonus : barre latérale des mots-clés sans doublons, filtre au clic, bouton « J'aime » avec retour visuel. Et la mise en ligne sur GitHub Pages.
:::

## Un état dans le parent, des props vers les enfants

:::quoi
`App` garde la **recherche** et la **catégorie** dans deux `useState`. Il passe aux enfants la valeur **et** la fonction qui la change, en **props** : c'est **remonter l'état**.
:::

:::exemple
```jsx title="src/App.jsx"
const [recherche, setRecherche] = useState('')
const [categorie, setCategorie] = useState('Toutes')
// ...
<SearchBar valeur={recherche} onChange={setRecherche} />
<CategoryFilter categories={categories} active={categorie} onChange={setCategorie} />
<MotsCles motsCles={motsCles} actif={recherche} onClick={setRecherche} />
```
:::

:::piege
Si chaque composant gardait son propre état, la barre de recherche et la barre des mots-clés ne seraient **pas synchronisées**. Un état partagé vit dans le **parent commun**.
:::

:::ou[Dans mon-blog]
Un clic sur un mot-clé (dans une carte ou dans la barre latérale) appelle `setRecherche(mot)` : le champ affiche le mot et la liste se filtre.
:::

## Le champ contrôlé

:::quoi
Un **champ contrôlé** affiche `value={valeur}` et prévient le parent à chaque frappe avec `onChange`. L'état React est la seule source de vérité du texte.
:::

:::exemple
```jsx title="src/components/SearchBar.jsx"
<input
  type="text"
  className="form-control"
  value={valeur}
  onChange={(e) => onChange(e.target.value)}
/>
{valeur && (
  <button type="button" className="btn btn-outline-secondary" onClick={() => onChange("")}>Effacer</button>
)}
```
:::

:::piege
`value` **sans** `onChange` : le champ est bloqué (on ne peut plus taper) et React affiche un avertissement dans la console.
:::

:::ou[Dans mon-blog]
`SearchBar` ne garde **aucun** état : il reçoit `valeur` et `onChange` d'`App`. Le bouton « Effacer » n'apparaît que si la recherche n'est pas vide (`&&`).
:::

## Filtrer sans nouvel état

:::quoi
La liste affichée est **calculée** à chaque rendu, à partir des articles et des deux états, avec `filter` et `includes`. Pas besoin d'un troisième `useState`.
:::

:::exemple
```jsx title="src/App.jsx"
const texteRecherche = recherche.trim().toLowerCase()
const articlesFiltres = articles.filter((article) => {
  const bonneCategorie = categorie === 'Toutes' || article.categorie === categorie
  const motsClesArticle = article.motsCles.join(' ').toLowerCase()
  const correspond =
    article.titre.toLowerCase().includes(texteRecherche) ||
    article.texte.toLowerCase().includes(texteRecherche) ||
    motsClesArticle.includes(texteRecherche)
  return bonneCategorie && correspond
})
```
:::

:::piege
`includes('')` renvoie **toujours** `true` : une recherche vide garde tous les articles. Pratique ici, mais à savoir. Et sans `toLowerCase()` des **deux** côtés, « Jazz » ne trouve pas « jazz ».
:::

:::ou[Dans mon-blog]
Le vrai code cherche aussi dans la catégorie. Le compteur au-dessus des articles et l'état vide (« Réinitialiser les filtres ») lisent `articlesFiltres.length`.
:::

## Une liste sans doublons, bien triée

:::quoi
La barre latérale montre **chaque** mot-clé **une seule fois** : `forEach` + `includes` pour dédoublonner, puis `sort` avec `localeCompare` pour l'ordre alphabétique français.
:::

:::exemple
```js title="src/App.jsx"
const motsCles = []
articles.forEach((article) => {
  article.motsCles.forEach((mot) => {
    if (!motsCles.includes(mot)) {
      motsCles.push(mot)
    }
  })
})
motsCles.sort((a, b) => a.localeCompare(b))
```
:::

:::piege
`sort()` **sans** fonction compare les codes des caractères : « électro » passe **après** « zouk ». `localeCompare` range les accents correctement.
:::

:::ou[Dans mon-blog]
Calculé **une seule fois**, en haut d'`App.jsx`, hors du composant : les articles ne changent jamais, inutile de recalculer à chaque rendu.
:::

## Lancer et mettre en ligne

:::quoi
`npm run dev` lance Vite en local. `npm run deploy` construit le site puis publie `dist/` sur la branche **gh-pages** grâce au paquet `gh-pages`.
:::

:::exemple
```json title="package.json"
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "predeploy": "vite build --base=./",
  "deploy": "gh-pages -d dist"
}
```
:::

:::piege
Avec **Git Bash** comme shell de npm, `--base=/tp-react-blog/` est converti en chemin Windows (`C:\Program Files\Git\tp-react-blog\`) : fichiers en 404, page blanche. D'où la base **relative** `./`.
:::

:::ou[Dans mon-blog]
Le site vit dans un sous-dossier : https://drakurei.github.io/tp-react-blog/. Pour republier après un changement : commit, `npm run deploy`, puis push de `main`.
:::
