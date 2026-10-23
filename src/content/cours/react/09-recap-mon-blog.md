---
titre: "TP mon-blog : le récap pour l'oral"
matiere: react
type: tp
chapitre: 9
niveau: intermediaire
duree: 12
date: 2026-09-23
source: "Cours live React (Discord)"
tags: [react, projet, mon-blog, oral, github-pages]
essentiel: "mon-blog est un blog React 19 + Vite + Bootstrap. 13 articles, une recherche et un filtre par catégorie combinés, des mots-clés cliquables et un bouton J'aime. App garde l'état partagé, chaque carte garde le sien, et le site est en ligne sur GitHub Pages."
retenir:
  - "App garde recherche et categorie, filtre les articles et passe valeurs et fonctions à ses enfants."
  - "Chaque carte Article garde ses propres états ouvert et aime."
  - "Le fil de la recherche : on tape, setRecherche, App se redessine, filter recalcule, map affiche."
  - "Les mots-clés sans doublons sont calculés une seule fois, hors du composant, avec forEach et includes."
  - "npm run deploy construit le site et le publie sur la branche gh-pages."
definitions:
  - terme: "Build"
    definition: "La version de production du site, optimisée et prête à être mise en ligne. Vite la fabrique dans le dossier dist/."
    exemple: "npm run build"
  - terme: "Déployer"
    definition: "Mettre le site en ligne pour que tout le monde puisse l'ouvrir avec une adresse."
  - terme: "GitHub Pages"
    definition: "Le service gratuit de GitHub qui héberge un site statique à partir d'une branche du repo."
    exemple: "https://drakurei.github.io/tp-react-blog/"
  - terme: "gh-pages (paquet npm)"
    definition: "Le paquet qui publie un dossier (ici dist) sur la branche gh-pages du repo."
    exemple: "`gh-pages -d dist`"
  - terme: "Script predeploy"
    definition: "Un script npm lancé automatiquement juste avant deploy, grâce au préfixe pre."
    exemple: "\"predeploy\": \"vite build --base=./\""
  - terme: "CDN"
    definition: "Un serveur externe qui fournit des fichiers (images, bibliothèques) par une adresse web."
    exemple: "Les photos de mon-blog viennent du CDN de Pixabay : cdn.pixabay.com"
  - terme: "Dédoublonner"
    definition: "Construire une liste où chaque valeur n'apparaît qu'une fois."
    exemple: "if (!motsCles.includes(mot)) motsCles.push(mot)"
flashcards:
  - q: "« C'est quoi un composant ? »"
    r: "Une fonction qui retourne du JSX, nommée en PascalCase, utilisée comme une balise : `<Article />`."
  - q: "« Comment les articles s'affichent ? »"
    r: "Ils sont dans `src/data/articles.js` ; App fait `articlesFiltres.map((article) => <Article key={article.id} article={article} />)`."
  - q: "« Pourquoi key ? »"
    r: "Pour que React identifie chaque élément de la liste et mette le DOM à jour correctement. J'utilise l'id de l'article."
  - q: "« Comment marche la recherche ? »"
    r: "L'input est contrôlé : `value={recherche}`, et onChange appelle setRecherche. Puis articles.filter garde ceux dont le titre, la catégorie, le texte ou les mots-clés contiennent le texte, en minuscules."
  - q: "« Pourquoi useState et pas une variable ? »"
    r: "React ne redessine le composant que quand un état change via setX. Une variable changerait en mémoire, pas à l'écran."
  - q: "« Pourquoi recherche est dans App et pas dans SearchBar ? »"
    r: "La liste et la barre des mots-clés en ont aussi besoin. L'état vit dans le parent commun ; SearchBar reçoit la valeur et la fonction en props."
  - q: "« Comment un badge dans une carte filtre la liste ? »"
    r: "Article reçoit `onMotCle={setRecherche}` ; au clic, il appelle `onMotCle(mot)`, l'état de App change et tout se met à jour."
  - q: "« Comment tu combines recherche et catégorie ? »"
    r: "Dans le même filter : `return bonneCategorie && correspond`. La catégorie 'Toutes' laisse tout passer."
  - q: "« Comment tu enlèves les doublons des mots-clés ? »"
    r: "Je parcours tous les mots-clés et je n'ajoute un mot que s'il n'y est pas déjà : `if (!motsCles.includes(mot)) motsCles.push(mot)`."
  - q: "« Le bouton J'aime ? »"
    r: "Un `useState(false)` dans chaque carte ; au clic `setAime(!aime)` ; la classe passe de btn-outline-danger à btn-danger et IconHeart reçoit `plein={aime}`."
  - q: "« Pourquoi className et pas class ? »"
    r: "class est un mot réservé du JavaScript."
  - q: "« Pourquoi style={{ top: '1rem' }} avec deux accolades ? »"
    r: "Les accolades extérieures disent « du JavaScript », les intérieures sont l'objet de style."
  - q: "« Comment tu mets le site en ligne ? »"
    r: "`npm run deploy` : predeploy lance `vite build --base=./`, puis gh-pages publie dist sur la branche gh-pages."
  - q: "« D'où viennent les images ? »"
    r: "D'un CDN : des photos Pixabay. Le premier service d'images (LoremFlickr) renvoyait des erreurs 401, je l'ai remplacé."
  - q: "« Quels hooks utilises-tu ? »"
    r: "Seulement useState : recherche et categorie dans App, ouvert et aime dans Article."
quiz:
  - question: "Dans mon-blog, où vit l'état recherche ?"
    choix:
      - "Dans SearchBar"
      - "Dans App"
      - "Dans Article"
      - "Dans articles.js"
    reponse: "Dans App"
    explication: "SearchBar, la liste filtrée et MotsCles en ont besoin : il vit dans leur parent commun, App."
  - question: "Pastille « Concert » active, et tu tapes « paris ». Combien d'articles restent ?"
    choix:
      - "2"
      - "3"
      - "13"
      - "0"
    reponse: "2"
    explication: "« Nuit du jazz à Paris » et « Top 5 des salles de concert à Paris ». « Rock en Seine » a le mot-clé Paris mais c'est un Festival : bonneCategorie && correspond l'écarte."
  - question: "Combien de fois le code qui dédoublonne les mots-clés s'exécute-t-il ?"
    choix:
      - "Une fois, au chargement de App.jsx"
      - "À chaque frappe dans la recherche"
      - "À chaque clic sur J'aime"
    reponse: "Une fois, au chargement de App.jsx"
    explication: "Il est écrit en haut du fichier, hors de la fonction App : il ne fait pas partie du rendu. Les articles ne changent jamais, donc c'est suffisant."
  - question: "Pourquoi chaque carte a-t-elle un bouton J'aime indépendant ?"
    choix:
      - "Parce que useState(false) est appelé dans Article, une fois par carte"
      - "Parce que App garde un tableau des J'aime"
      - "Parce que IconHeart garde l'état"
    reponse: "Parce que useState(false) est appelé dans Article, une fois par carte"
    explication: "Chaque carte affichée a son propre état. IconHeart ne fait que lire la prop plein."
  - question: "Que fait `npm run deploy` dans mon-blog ?"
    choix:
      - "Il lance le serveur local"
      - "Il construit le site puis publie dist sur la branche gh-pages"
      - "Il pousse le code source sur la branche main"
    reponse: "Il construit le site puis publie dist sur la branche gh-pages"
    explication: "npm lance predeploy (vite build --base=./) puis deploy (gh-pages -d dist). Le code source, lui, part sur main avec git push."
  - question: "Après un deploy avec `--base=/tp-react-blog/`, le site en ligne est blanc. Pourquoi ?"
    choix:
      - "Git Bash a transformé ce chemin qui commence par / en chemin Windows"
      - "GitHub Pages ne sait pas afficher React"
      - "Il faut lancer npm install sur GitHub"
    reponse: "Git Bash a transformé ce chemin qui commence par / en chemin Windows"
    explication: "Sur ton PC, npm passe par Git Bash, qui convertit /… en C:/Program Files/Git/… : les fichiers JS et CSS sont introuvables. Avec --base=./, les chemins sont relatifs."
exercices:
  - titre: "Ajouter un 14e article"
    niveau: facile
    enonce: "Ajoute un article dans src/data/articles.js : id 14, catégorie Concert, au moins deux mots-clés. Vérifie qu'il s'affiche, que la recherche le trouve et que ses mots-clés apparaissent dans la barre latérale."
    indices:
      - "Copie un objet existant et change toutes les valeurs, en premier l'id."
      - "N'oublie pas la virgule entre l'objet précédent et le tien."
      - "Rien d'autre à modifier : map, filter et le dédoublonnage s'en chargent."
    solution: |
      ```js
      // à la fin du tableau, dans src/data/articles.js
      {
        id: 14,
        titre: "Soirée électro au bord de l'eau",
        categorie: "Concert",
        motsCles: ["électro", "plein air", "DJ"],
        image: "https://cdn.pixabay.com/photo/2018/05/10/11/34/concert-3387324_1280.jpg",
        date: "5 août 2026",
        texte: "Un DJ set au coucher du soleil, au bord de la Seine.",
      },
      ```
  - titre: "Une nouvelle catégorie"
    niveau: moyen
    enonce: "Ajoute la catégorie Théâtre : une pastille de plus dans les filtres, et un article de cette catégorie. Le filtre doit marcher sans autre changement."
    indices:
      - "Les pastilles viennent du tableau categories, en haut de App.jsx."
      - "Le nom doit être écrit exactement pareil dans categories et dans l'article (accent compris)."
      - "Le filtre compare article.categorie === categorie : il n'y a rien à toucher."
    solution: |
      ```js
      // src/App.jsx
      const categories = ['Toutes', 'Festival', 'Concert', 'Musique', 'Cinéma', 'Culture', 'Théâtre']

      // src/data/articles.js : un article de plus
      {
        id: 15,
        titre: "Molière en plein air",
        categorie: "Théâtre",
        motsCles: ["théâtre", "plein air"],
        image: "…",
        date: "9 août 2026",
        texte: "…",
      },
      ```
  - titre: "Compter les articles aimés"
    niveau: difficile
    enonce: "Affiche au-dessus des cartes « N article(s) aimé(s) ». Il faut remonter l'état aime d'Article vers App : App garde un tableau des id aimés et le passe aux cartes."
    indices:
      - "Dans App : const [aimes, setAimes] = useState([]), un tableau d'id."
      - "Pour ajouter sans modifier l'état : setAimes([...aimes, id]). Pour enlever : setAimes(aimes.filter((x) => x !== id))."
      - "Article ne garde plus d'état aime : il reçoit aime (un booléen) et onAime (une fonction)."
    solution: |
      ```jsx
      // src/App.jsx (extrait)
      const [aimes, setAimes] = useState([]) // les id des articles aimés

      function basculerAime(id) {
        if (aimes.includes(id)) {
          setAimes(aimes.filter((x) => x !== id)) // on l'enlève
        } else {
          setAimes([...aimes, id]) // on l'ajoute, sans modifier l'ancien tableau
        }
      }

      // dans le return
      <p>{aimes.length} article(s) aimé(s)</p>
      {articlesFiltres.map((article) => (
        <Article
          key={article.id}
          article={article}
          aime={aimes.includes(article.id)}
          onAime={() => basculerAime(article.id)}
          onCategorie={setCategorie}
          onMotCle={setRecherche}
        />
      ))}

      // src/components/Article.jsx : plus de useState pour aime
      function Article({ article, aime, onAime, onCategorie, onMotCle }) {
        // … le reste ne change pas, sauf le bouton, qui appelle onAime :
        // <button className={…} onClick={onAime}>
      }
      ```
---

## Le projet en un coup d'œil

:::quoi
Un blog musique, festivals et culture : **13 articles**, une recherche, un filtre par catégorie, des mots-clés cliquables et un bouton J'aime. `App` garde l'état partagé, les enfants affichent.
:::

:::exemple
```text
App             garde recherche et categorie, filtre, assemble tout
├── Nav         barre de navigation Bootstrap
├── Header      titre et accroche
├── MotsCles    barre latérale des mots-clés uniques → onClick(mot)
├── SearchBar   input contrôlé → onChange(texte)
├── CategoryFilter   pastilles → onChange(categorie)
├── Article     une carte ; états ouvert et aime → onCategorie, onMotCle
│   └── IconHeart    cœur plein ou vide selon la prop plein
└── Footer      année automatique
```
:::

:::piege
À l'oral, ne confonds pas ton projet avec le code du prof. Ton modèle de données est le tien : `titre`, `categorie`, `motsCles`, `image`, `date`, `texte`.
:::

:::ou[Dans mon-blog]
Le `README.md` du repo résume les fonctionnalités et la structure. Démo : `https://drakurei.github.io/tp-react-blog/`.
:::

:::info[Les consignes du prof]
| Consigne | Réalisation | Chapitre |
|---|---|---|
| Repo GitHub + lien | `drakurei/tp-react-blog`, branche `main` | — |
| Bootstrap ou un autre outil CSS | `npm install bootstrap`, import dans `main.jsx`, `App.css` perso | 1 |
| Un fichier .js d'articles utilisé dans App.jsx | `src/data/articles.js` (13 articles), `import` + `.map()` | 5 |
| Un input qui filtre titre, mots-clés, catégories et texte | `SearchBar` + `useState` + `.filter()` | 6, 7 |
| Filtrer par les catégories | `CategoryFilter` + badge de catégorie cliquable | 7, 8 |
| Images en local ou par CDN | CDN Pixabay | — |
| Bonus : barre des mots-clés sans doublons | `MotsCles` | 9 |
| Bonus : bouton J'aime avec retour visuel | `useState` dans `Article` + `IconHeart` | 6 |
:::

## Les articles : un fichier et un map

:::quoi
Les 13 articles sont un **tableau d'objets** dans `src/data/articles.js`. `App` les filtre, puis affiche une carte par article avec `.map()` et `key={article.id}`.
:::

:::exemple
```jsx title="src/App.jsx"
import articles from './data/articles'

// … dans le return
{articlesFiltres.map((article) => (
  <Article key={article.id} article={article} onCategorie={setCategorie} onMotCle={setRecherche} />
))}
```
:::

:::piege
On affiche `articlesFiltres`, pas `articles` : sinon la recherche et les filtres n'ont **aucun effet** à l'écran.
:::

:::ou[Dans mon-blog]
`src/data/articles.js` (id, titre, categorie, motsCles, image, date, texte) et `src/App.jsx`. Voir le chapitre 5.
:::

## La recherche : le fil complet

:::quoi
L'input de `SearchBar` est **contrôlé** par l'état `recherche` de `App`. Chaque frappe relance `App`, qui refiltre et réaffiche.
:::

:::exemple
```text
tu tapes « jazz » dans SearchBar
  → l'input appelle onChange('jazz'), c'est-à-dire setRecherche('jazz')
  → l'état recherche de App change
  → App se redessine
  → articles.filter(…) recalcule articlesFiltres
  → articlesFiltres.map(…) affiche les cartes qui restent
```
:::

:::piege
L'état et le filtre sont dans **App.jsx**. `SearchBar.jsx` affiche seulement l'input et prévient `App`.
:::

:::ou[Dans mon-blog]
`src/components/SearchBar.jsx` (l'input et le bouton Effacer) et `src/App.jsx` (l'état, le filtre et le message « 3 articles pour « paris » »). Voir les chapitres 6, 7 et 8.
:::

## Les catégories et les badges cliquables

:::quoi
`CategoryFilter` affiche les pastilles et appelle `onChange(cat)` ; le badge de catégorie d'une carte appelle `onCategorie(…)`. Les deux arrivent dans **setCategorie**.
:::

:::exemple
```jsx title="src/App.jsx"
const categories = ['Toutes', 'Festival', 'Concert', 'Musique', 'Cinéma', 'Culture']
const [categorie, setCategorie] = useState('Toutes')

<CategoryFilter categories={categories} active={categorie} onChange={setCategorie} />
// et dans chaque carte : onCategorie={setCategorie}
```
:::

:::piege
« Toutes » n'est la catégorie d'aucun article : le filtre la traite à part (`categorie === 'Toutes' || …`), sinon la liste serait vide.
:::

:::ou[Dans mon-blog]
`src/components/CategoryFilter.jsx` (la classe du bouton actif est calculée dans une variable) et le badge en haut de `src/components/Article.jsx`.
:::

## Bonus : les mots-clés sans doublons

:::quoi
On parcourt les mots-clés de tous les articles et on n'ajoute un mot **que s'il n'est pas déjà** dans la liste. Résultat : **37 mots-clés** uniques, triés.
:::

:::exemple
```jsx title="src/App.jsx"
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
`sort()` sans `localeCompare` trie par code de caractère : « Paris » passe avant « jazz », et « électro » après « vinyle ».
:::

:::ou[Dans mon-blog]
Calculé **une seule fois**, en haut de `App.jsx`, hors de la fonction `App` : les articles ne changent jamais. Affiché par `src/components/MotsCles.jsx`, qui reçoit `motsCles`, `actif` et `onClick`.
:::

## Bonus : le bouton J'aime

:::quoi
Un `useState(false)` **dans chaque carte**. Au clic, `setAime(!aime)` : la classe passe de `btn-outline-danger` à `btn-danger`, et l'icône reçoit `plein={aime}`.
:::

:::exemple
```jsx title="src/components/IconHeart.jsx"
// Icône cœur (Bootstrap Icons) : pleine ou vide selon la prop
function IconHeart({ plein }) {
  if (plein) {
    return <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">{/* tracé plein */}</svg>
  }
  return <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">{/* tracé vide */}</svg>
}
```
:::

:::piege
`aime` dans `App` : un seul état pour toutes les cartes, donc un clic aimerait **tous** les articles.
:::

:::ou[Dans mon-blog]
`src/components/Article.jsx` (l'état et le bouton) et `src/components/IconHeart.jsx` (le SVG). `fill="currentColor"` prend la couleur du texte du bouton : rouge sur blanc, puis blanc sur rouge une fois aimé.
:::

## La mise en ligne sur GitHub Pages

:::quoi
`npm run deploy` fabrique le site, puis publie le dossier `dist` sur la branche **gh-pages** grâce au paquet `gh-pages`. npm lance `predeploy` tout seul, juste avant `deploy`.
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
Sous Git Bash, le shell de npm sur ton PC, `--base=/tp-react-blog/` devient un chemin Windows. Le site en ligne reste blanc : d'où `--base=./`.
:::

:::ou[Dans mes projets]
mon-blog : repo `drakurei/tp-react-blog` (branche `main`), démo `https://drakurei.github.io/tp-react-blog/`. PokéBistro : même méthode, démo `https://drakurei.github.io/tp-react-resto/`. La branche `gh-pages` est générée : on n'y touche jamais.
:::

:::astuce[Les commandes du projet]
```bash
npm run dev      # serveur local : http://localhost:5173
npm run build    # version de production dans dist/
npm run deploy   # build + mise en ligne sur GitHub Pages
git add -A && git commit -m "ce que j'ai changé" && git push
```
:::
