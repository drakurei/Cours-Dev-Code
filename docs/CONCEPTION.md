# Manabi 学び — Dossier de conception (V1)

> Site de révision personnel de Jonathan : tous ses cours et projets, transformés en fiches courtes,
> exercices, quiz et flashcards. Pensé pour un cerveau TDA : **l'essentiel d'abord, une chose à la fois,
> toujours la même structure.**
>
> Ce document est le **contrat** du projet : design, format des cours, stockage, découpage du code.
> Toute personne (ou IA) qui code dans le repo le suit.

---

## 0. Décisions clés (TL;DR)

| Sujet | Décision | Pourquoi |
|---|---|---|
| Nom | **Manabi 学び** (« apprendre ») | court, japonais, sens exact |
| Stack | **Astro 7** (site statique) + **îlots React 19** + TypeScript | contenu = Markdown validé au build ; React seulement là où il faut de l'interactivité |
| Contenu | **Markdown + frontmatter YAML** dans `src/content/cours/<matiere>/` | n'importe quelle IA sait écrire ça ; validé par un schéma Zod |
| Hébergement | **GitHub Pages** (`https://drakurei.github.io/Cours-Dev-Code/`) | gratuit, déjà utilisé, mis à jour à chaque push |
| Mise à jour auto | GitHub Actions : push → build → déploiement (≈ 2 min) | aucune commande à retenir |
| Créer un cours | 3 chemins : **(1)** prompt universel copié dans n'importe quelle IA, **(2)** page **Atelier** du site (PDF / images / texte / repo GitHub → cours, publication directe sur GitHub), **(3)** dossier `inbox/` + Action (Claude API) | marche partout, même sur téléphone |
| Progression | `localStorage` + export/import + **synchro Gist GitHub** optionnelle | pas de serveur, pas de compte, suit sur tous les appareils |
| Révision | Flashcards à **répétition espacée FSRS** (`ts-fsrs`), quiz QCM, exercices à indices progressifs | la science de la mémoire, en sessions courtes |
| Hors-ligne | **PWA** maison (service worker généré au build) | installable sur le téléphone, marche dans le RER |
| Design | **Apple HIG** (clarté, déférence, profondeur, matériaux translucides) × **Japon floral** (washi, sumi, sakura, kanji, tomes manga, hanko) | neutre et calme, avec une vraie identité |
| PC perso ↔ PC pro | GitHub = source unique ; **Codespaces** (zéro install) ou clone avec identité locale drakurei ; Atelier pour le contenu | voir `docs/TRAVAILLER-PARTOUT.md` |

---

## 1. Principes TDA (non négociables)

1. **L'essentiel d'abord** : chaque cours commence par « L'essentiel en 30 s » (要) — 1 à 3 phrases.
2. **Structure fixe** pour chaque notion (chaque `##`) : **Quoi** (1 phrase) → **Exemple** (3-8 lignes) → **Piège** (1 ligne) → **Où ça sert**.
3. **Une chose à la fois** : le *Mode Focus* affiche une seule notion plein écran (← →).
4. **Une seule action principale par écran** : l'accueil propose UNE mission du jour (gros bouton), pas 12 choix.
5. **Sessions courtes** : révision par paquets de 5 à 20 cartes, minuteur 10/15/25 min.
6. **Feedback immédiat** : quiz corrigé tout de suite avec l'explication, flashcards notées en 1 touche.
7. **Mots-clés en gras**, listes plutôt que paragraphes, **toujours le même mot pour la même notion**.
8. **Zéro distraction** : animations douces et désactivables, pétales coupés en Mode Focus, pas de son sans action.
9. **Retrouver en 3 secondes** : recherche globale `Ctrl/⌘ K` ou `/`, glossaire A-Z.
10. **Récompenser sans stresser** : pétales 花びら (points), série de jours 連, tampon hanko 済 quand un cours est terminé. Pas de classement, pas de punition.

---

## 2. Design system « Wabi-Apple »

### 2.1 Intention
- **Apple HIG** : clarté (typo nette, hiérarchie forte), déférence (le contenu d'abord, l'UI s'efface), profondeur (matériaux translucides, couches), cibles ≥ 44 px, Dynamic Type (taille de texte réglable).
- **Japon** : *ma* 間 (le vide qui respire), papier washi (fond chaud à peine teinté), encre sumi, accents sakura, kanji comme repères visuels, codes du manga (tomes, épisodes 第N話, trames, tampon hanko).
- **Neutre** : 90 % neutre (blanc cassé / encre), la couleur sert à **signifier** (type de bloc, matière), jamais à décorer.

### 2.2 Couleurs — tokens CSS (`src/styles/tokens.css`)

Thème clair « Washi » (par défaut) :

```css
:root {
  --c-bg: #F6F5F2;          /* kinari 生成り, fond de page */
  --c-bg-grouped: #EFEDE8;  /* zones en creux, listes groupées */
  --c-surface: #FFFFFF;     /* cartes */
  --c-surface-2: #FBFAF8;   /* cartes secondaires */
  --c-glass: rgb(255 255 255 / .72); /* matériau translucide (nav) */
  --c-ink: #1D1B20;         /* sumi 墨 — texte principal (15:1) */
  --c-ink-2: #55505A;       /* texte secondaire (7.5:1) */
  --c-ink-3: #6F6A73;       /* légendes (4.8:1) */
  --c-line: rgb(29 27 32 / .10);
  --c-line-strong: rgb(29 27 32 / .18);
  --c-accent: #B4405F;      /* sakura profond — boutons, liens (5.5:1 avec blanc) */
  --c-accent-ink: #8E2F49;  /* texte sur fond accent doux */
  --c-accent-soft: #F9E6EB; /* fond accent doux */
  --c-on-accent: #FFFFFF;
  --c-petal-1: #F4C2CF; --c-petal-2: #EFA9BB; /* pétales */
  --c-hanko: #C8382A;       /* vermillon du tampon 済 */
  --c-focus: #B4405F;       /* anneau de focus clavier */
}
```

Thème sombre « Yoru 夜 » (`[data-theme="dark"]`) :

```css
[data-theme="dark"] {
  --c-bg: #121114; --c-bg-grouped: #0C0B0E;
  --c-surface: #1C1A1F; --c-surface-2: #242228;
  --c-glass: rgb(28 26 31 / .72);
  --c-ink: #F3F1F4; --c-ink-2: #BDB7C1; --c-ink-3: #948D98;
  --c-line: rgb(255 255 255 / .09); --c-line-strong: rgb(255 255 255 / .16);
  --c-accent: #F08AA6; --c-accent-ink: #F6BACB; --c-accent-soft: #2A1820;
  --c-on-accent: #2A0E17;
  --c-petal-1: #7A3A4E; --c-petal-2: #9A4A62;
  --c-hanko: #E5533F; --c-focus: #F08AA6;
}
```

Couleurs sémantiques des **blocs** (fond / texte / accent+kanji) — clair puis sombre :

| Bloc | Nom japonais | Clair bg / ink / accent | Sombre bg / ink / accent |
|---|---|---|---|
| `essentiel` | 桜 sakura | `#FBEFF2` / `#8E2F49` / `#B4405F` | `#2A1820` / `#F6BACB` / `#F08AA6` |
| `quoi` | 藍 ai (indigo) | `#EAF0F8` / `#23466F` / `#2E5A8F` | `#17222F` / `#A9C6EA` / `#6F9FD8` |
| `exemple` | 抹茶 matcha | `#EEF3E7` / `#3E5A24` / `#5C7F35` | `#1A2216` / `#BFD6A0` / `#8DB560` |
| `piege` | 朱 shu (vermillon) | `#FBEDE9` / `#9A2E1C` / `#C8452F` | `#2A1714` / `#F2B3A6` / `#E8735D` |
| `ou` | 藤 fuji (glycine) | `#F0EEF8` / `#4D3F8A` / `#6A5BB0` | `#1F1C2C` / `#C9C0F0` / `#9C8EE0` |
| `astuce` | 山吹 yamabuki | `#FBF3E2` / `#7A5310` / `#B7791F` | `#282011` / `#EFD08E` / `#E0A63D` |
| `definition` | 紺 kon | `#EEF0F3` / `#2A3340` / `#4A5668` | `#1C2027` / `#C3CCD8` / `#8E9BB0` |
| `info` / `retenir` | 空 sora | `#E8F3F7` / `#1F5566` / `#2F7D95` | `#14242A` / `#A3D6E5` / `#5BB3CC` |
| `attention` | 注 | = `piege` | = `piege` |

Variables : `--b-<nom>-bg`, `--b-<nom>-ink`, `--b-<nom>-accent`.

Couleurs de **matière** (champ `couleur` des matières) : `sakura | ai | matcha | shu | fuji | yamabuki | kon | sora | sumi` → réutilisent les accents ci-dessus (`sumi` = `--c-ink`).

### 2.3 Typographie
- **Interface** : police système Apple → `--font-ui: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif` (SF Pro sur Mac/iPhone, Segoe UI Variable sur Windows 11).
- **Lecture des cours** (comme Apple Books : l'UI en SF, le texte dans la police de lecture) : `--font-read: "Atkinson Hyperlegible Next Variable", var(--font-ui)` — police conçue pour la lisibilité. Réglage possible : `atkinson` (défaut) ou `systeme`.
- **Kanji** : `--font-kanji: "Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "YuMincho", "Noto Serif JP", serif` — Shippori Mincho chargée via Google Fonts avec `&text=` (seulement les ~40 kanji utilisés → quelques Ko).
- **Code** : `--font-mono: "JetBrains Mono Variable", "SF Mono", "Cascadia Code", Consolas, monospace` (ligatures désactivées).
- Échelle (inspirée des text styles Apple, en `rem` → suit la taille choisie par l'utilisateur via `--user-scale` sur `html { font-size: calc(100% * var(--user-scale)) }`) :

| Token | Taille / interligne | Graisse | Approche |
|---|---|---|---|
| `--t-large` | 2.125rem / 1.15 | 700 | -0.022em |
| `--t-title1` | 1.75rem / 1.2 | 700 | -0.02em |
| `--t-title2` | 1.375rem / 1.25 | 650 | -0.017em |
| `--t-title3` | 1.25rem / 1.3 | 600 | -0.012em |
| `--t-headline` | 1.0625rem / 1.35 | 600 | -0.008em |
| `--t-body` | 1.0625rem / 1.55 | 400 | 0 |
| `--t-read` (prose des cours) | 1.125rem / 1.7 | 400 | 0 |
| `--t-callout` | 1rem / 1.5 | 400 | 0 |
| `--t-subhead` | 0.9375rem / 1.45 | 400 | 0 |
| `--t-footnote` | 0.8125rem / 1.4 | 400 | 0 |
| `--t-caption` | 0.75rem / 1.35 | 500 | 0.01em |

Longueur de ligne de lecture : **max 68ch**.

### 2.4 Espace, formes, profondeur, mouvement
- Grille **8 pt** : `--s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 24px; --s-6: 32px; --s-7: 48px; --s-8: 64px; --s-9: 96px`.
- Rayons : `--r-xs: 6px; --r-sm: 10px; --r-md: 14px; --r-lg: 20px; --r-xl: 28px; --r-full: 999px`.
- Ombres (clair) : `--sh-1: 0 1px 2px rgb(20 16 24 / .05), 0 1px 1px rgb(20 16 24 / .03)` ; `--sh-2: 0 2px 4px rgb(20 16 24 / .04), 0 8px 24px rgb(20 16 24 / .07)` ; `--sh-3: 0 4px 8px rgb(20 16 24 / .05), 0 24px 48px rgb(20 16 24 / .12)`. Sombre : ombres noires plus fortes + `inset 0 1px 0 rgb(255 255 255 / .04)`.
- Matériau verre (nav, barre d'onglets, palette) : `background: var(--c-glass); backdrop-filter: blur(20px) saturate(180%);` + repli opaque si non supporté.
- Mouvement : `--ease-out: cubic-bezier(.22,1,.36,1)`, `--ease-spring: cubic-bezier(.34,1.56,.64,1)` ; durées `--d-1: 120ms; --d-2: 200ms; --d-3: 320ms; --d-4: 500ms`. `prefers-reduced-motion` **ou** réglage « Animations réduites » → durées ≈ 0 et pétales coupés.
- Cibles tactiles ≥ **44×44 px**. Anneau de focus : `outline: 2px solid var(--c-focus); outline-offset: 2px` (uniquement `:focus-visible`).

### 2.5 Éléments signature
| Élément | Description | Où |
|---|---|---|
| **Kanji repères** | badge carré arrondi, kanji en Mincho, couleur du bloc ; `lang="ja" aria-hidden="true"` + libellé FR lisible | blocs, nav, sections |
| **Tomes manga** | chaque matière = une couverture de tome (ratio 2:3) : bande de couleur, grand kanji, nom, `巻 N` écrit **verticalement** (`writing-mode: vertical-rl`), trame de points (screentone) très légère, barre de progression | `/tomes/`, accueil |
| **Épisodes** | chaque cours = « 第N話 » (épisode N) à côté de « Chapitre N » | listes de chapitres |
| **Ensō 円相** | cercle au pinceau (SVG, tracé irrégulier) qui se remplit = progression | cours, tomes, révisions |
| **Hanko 済** | tampon vermillon carré arrondi, légère rotation, texture d'encre (filtre SVG `feTurbulence`), animation « tamponnée » (scale 1.4→1 + opacité) | cours terminé |
| **Pétales 花びら** | 10-16 pétales SVG/canvas qui tombent lentement, seulement sur l'accueil ; pause si onglet caché ; coupés en Focus / animations réduites / réglage | accueil |
| **Seigaiha 青海波** | motif de vagues SVG très pâle (opacité ≤ .05) | états vides, pied de page |
| **Lignes de vitesse 集中線** | rayons manga subtils derrière le hanko et le score parfait au quiz | célébrations |
| **Salutation** | おはよう (avant 12h) / こんにちは (12-18h) / こんばんは (après 18h), Jonathan | accueil |

Kanji des blocs et sections :

| Clé | Kanji | Lecture — sens | Libellé FR |
|---|---|---|---|
| essentiel | 要 | yō — l'essentiel | L'essentiel en 30 s |
| quoi | 何 | nani — quoi | Quoi |
| exemple | 例 | rei — exemple | Exemple |
| piege | 罠 | wana — piège | Piège |
| ou | 場 | ba — le lieu | Où ça sert |
| astuce | 技 | waza — technique | Astuce |
| info | 知 | chi — savoir | Info |
| attention | 注 | chū — attention | Attention |
| retenir | 覚 | oboe — retenir | À retenir |
| definition | 辞 | ji — dictionnaire | Définitions |
| exercice | 練 | ren — s'entraîner | Exercices |
| quiz | 問 | mon — question | Quiz |
| flashcard | 札 | fuda — carte | Flashcards |
| documents | 書 | sho — écrit | Documents |
| termine | 済 | sumi — terminé | Terminé |

Kanji de navigation : Aujourd'hui 今 · Tomes 巻 · Réviser 復 · Projets 作 · Glossaire 辞 · Atelier 工 · Réglages 設.

### 2.6 Mise en page
- **≥ 1024 px** : barre latérale gauche 264 px (matériau verre, style app macOS : logo, recherche, 7 entrées avec kanji, badge du nombre de cartes à réviser, minuteur en bas) + contenu (max 1120 px, gouttières 32 px).
- **Cours ≥ 1280 px** : colonne de lecture 68ch + rail de sommaire 220 px à droite (sticky, scrollspy).
- **< 1024 px** : barre d'onglets en bas (verre, 5 onglets : Aujourd'hui, Tomes, Réviser, Glossaire, Plus) + barre du haut avec titre et bouton recherche ; grand titre façon iOS qui se réduit au défilement. Respect de `env(safe-area-inset-*)`.
- Gouttière mobile 16 px, aucun défilement horizontal de la page à 375 px.

---

## 3. Pages (routes, base `/Cours-Dev-Code/`)

| Route | Fichier | Contenu |
|---|---|---|
| `/` | `pages/index.astro` | **Aujourd'hui** : salutation, date, série 連, pétales ; **mission du jour** (1 gros bouton : réviser N cartes ≈ X min / continuer le cours en cours / commencer le prochain chapitre) ; « Reprendre » (3 derniers cours, ensō) ; révisions dues ; minuteur rapide ; tomes (défilement horizontal) ; ajoutés récemment |
| `/tomes/` | `pages/tomes/index.astro` | toutes les matières en couvertures de tomes |
| `/tomes/<matiere>/` | `pages/tomes/[matiere].astro` | couverture + description + progression + liste des épisodes (第N話, durée, statut : à lire / en cours (ensō) / terminé (hanko)) |
| `/cours/<matiere>/<slug>/` | `pages/cours/[...id].astro` | **lecteur** (voir §5) |
| `/projets/` | `pages/projets.astro` | cours de `type: projet` : cartes avec stack, statut, liens repo/démo |
| `/reviser/` | `pages/reviser.astro` | onglets **Cartes** (session FSRS du jour), **Quiz éclair** (10 questions au hasard), **Par tome** |
| `/glossaire/` | `pages/glossaire.astro` | toutes les définitions, index A-Z collant, filtre instantané, lien vers le cours |
| `/atelier/` | `pages/atelier.astro` | créer un cours : Source → Générer → Vérifier → Publier (§7) |
| `/reglages/` | `pages/reglages.astro` | réglages groupés façon iOS (§8) |
| `/search-index.json` | `pages/search-index.json.ts` | index de recherche généré au build |
| 404 | `pages/404.astro` | 迷子 *maigo* — « Perdu ? » + recherche + retour |

Global : palette de commandes `Ctrl/⌘ K` ou `/` (cours, définitions, actions : réviser, changer de thème, lancer le minuteur…), feuille des raccourcis `?`.

---

## 4. Format d'un cours (le contrat avec les IA)

### 4.1 Emplacement et identifiant
- Fichier : `src/content/cours/<matiere>/<NN>-<slug>.md` (ex. `src/content/cours/react/06-usestate.md`).
- `<matiere>` et `<slug>` : minuscules, chiffres, tirets (`^[a-z0-9]+(-[a-z0-9]+)*$`). `NN` = numéro sur 2 chiffres.
- Identifiant = chemin sans extension : `react/06-usestate` → URL `/cours/react/06-usestate/`.
- **Markdown simple** (`.md`), pas de MDX (une IA ne peut pas casser le build avec du JS).

### 4.2 Frontmatter (validé par `src/lib/schema.ts`)

```yaml
---
titre: "useState : l'état d'un composant"   # obligatoire
matiere: react                              # obligatoire, slug d'une matière
type: cours            # cours | projet | tp | memo   (défaut : cours)
chapitre: 6            # ordre dans le tome (défaut : NN du nom de fichier)
niveau: debutant       # debutant | intermediaire | avance   (défaut : debutant)
duree: 8               # minutes (défaut : calculée depuis le texte)
date: 2026-09-23       # date du cours / de création (AAAA-MM-JJ)
source: "Cours live React n°6 (Discord)"   # optionnel
tags: [react, hooks, state]                 # optionnel
essentiel: "useState crée une valeur que React surveille. On la change avec setX et le composant se redessine."   # obligatoire, 1-3 phrases
retenir:               # optionnel, 3-5 phrases « à retenir »
  - "On ne modifie jamais l'état directement : on appelle setX."
definitions:           # optionnel → alimente le glossaire
  - terme: "État (state)"
    definition: "Une valeur que React surveille ; la changer redessine le composant."
    exemple: "const [compte, setCompte] = useState(0)"   # optionnel
flashcards:            # optionnel → révision espacée
  - q: "Que fait setCompte(5) ?"
    r: "Met l'état à 5 et React redessine le composant."
quiz:                  # optionnel → QCM
  - question: "Pourquoi `let compte = 0` ne met pas l'écran à jour ?"
    choix:
      - "Parce que let est interdit en React"
      - "Parce que React ne surveille pas les variables normales"
      - "Parce qu'il faut écrire var"
    reponse: "Parce que React ne surveille pas les variables normales"   # = le TEXTE exact d'un des choix
    explication: "Seul un état créé avec useState déclenche un nouveau rendu."
exercices:             # optionnel
  - titre: "Un compteur"
    niveau: facile     # facile | moyen | difficile
    enonce: "Crée un bouton qui affiche le nombre de clics."
    indices:
      - "Il te faut un état qui commence à 0."
      - "Dans onClick, appelle setCompte(compte + 1)."
    solution: |
      ```jsx
      const [compte, setCompte] = useState(0)
      return <button onClick={() => setCompte(compte + 1)}>{compte}</button>
      ```
projet:                # seulement pour type: projet (optionnel)
  repo: "https://github.com/drakurei/tp-react-blog"
  demo: "https://drakurei.github.io/tp-react-blog/"
  stack: [React, Vite, Bootstrap]
  statut: termine      # en-cours | termine | en-pause
  role: "Seul, exercice du cours React"
fichiers:              # optionnel : PDF / images joints (dans public/media/…)
  - titre: "Slides du cours"
    chemin: "/media/react/06-slides.pdf"
brouillon: false       # true = caché des listes
---
```

Règles de validation (et messages d'erreur en français) :
- `reponse` doit être **exactement** l'un des `choix` (2 à 6 choix).
- `essentiel` ≤ 400 caractères ; `titre` ≤ 90.
- Champs inconnus : **tolérés** (ignorés) pour ne pas casser le build si une IA en ajoute.
- Une matière inconnue n'empêche pas le build : elle reçoit un style par défaut (kanji = première lettre, couleur `sumi`).

### 4.3 Corps du cours (Markdown)
- Chaque **`## Titre`** = une **notion** = une étape du Mode Focus. Pas de `#` (le titre vient du frontmatter).
- Dans chaque notion, les **blocs** (syntaxe `remark-directive`) :

```md
## Réagir à un clic

:::quoi
Un **événement** est écrit en camelCase et reçoit une **fonction**.
:::

:::exemple
```jsx
<button onClick={direBonjour}>Clique</button>
```
:::

:::piege
`onClick={direBonjour()}` exécute la fonction **tout de suite**, pas au clic.
:::

:::ou[Dans mon-blog]
Le bouton « J'aime » de chaque article.
:::
```

- Blocs disponibles : `quoi`, `exemple`, `piege`, `ou`, `astuce`, `info`, `attention`, `retenir`. Titre personnalisé : `:::ou[Dans mon-blog]`.
- Bloc inconnu → affiché comme `info` (jamais d'erreur).
- **Piège technique** : `remark-directive` lit aussi `:mot` dans le texte (ex. `C:\Users`, `10:30`). Le plugin DOIT remettre en texte brut toute directive *texte* ou *feuille* non gérée.
- Documents : `::pdf{src="/media/react/slides.pdf" titre="Slides"}` → visionneuse PDF intégrée + bouton « Ouvrir ».
- Images : `![texte alternatif](/media/react/schema.png)` (fichiers dans `public/media/<matiere>/`). Les chemins absolus `/media/…` sont **préfixés automatiquement** par la base du site (plugin rehype).
- Code : blocs ``` avec langage ; titre optionnel ```` ```jsx title="App.jsx" ```` ; coloration Shiki **Rosé Pine Dawn** (clair) / **Rosé Pine Moon** (sombre) ; bouton « Copier ».
- HTML brut dans le Markdown : **assaini** (pas de `<script>`, pas d'attributs `on*`, pas de `javascript:`).

### 4.4 Matières (`src/content/matieres/<slug>.yaml`)

```yaml
nom: "React"
kanji: "応"            # 1 caractère
lecture: "ō — réagir"  # lecture et sens (infobulle)
couleur: ai            # sakura | ai | matcha | shu | fuji | yamabuki | kon | sora | sumi
description: "Construire des interfaces avec des composants."
ordre: 2               # numéro du tome
```

Matières V1 : `manabi` (学, sakura — le guide du site), `react` (応, ai), `javascript` (動, yamabuki), `html-css` (形, matcha), `gestion-projet` (組, fuji), `ia-seo` (探, sora), `projets` (作, shu).

---

## 5. Le lecteur de cours

Ordre de la page (de haut en bas) :
1. Fil d'Ariane `巻 React › 第6話` + titre + puces méta (durée, niveau, date, source) + ensō de progression.
2. **L'essentiel en 30 s** (要) : grande carte sakura + bouton « Écouter » (synthèse vocale `fr-FR`).
3. **À retenir** (覚) si présent.
4. Corps : notions `##` avec blocs Quoi/Exemple/Piège/Où.
5. **Documents** (書) si `fichiers`.
6. **Définitions** (辞), **Exercices** (練), **Quiz** (問), **Flashcards** (札).
7. Bouton **« J'ai compris ce cours »** → tampon hanko 済 animé + pétales gagnés ; navigation épisode précédent / suivant.

Fonctions :
- Barre de progression de lecture fine en haut ; sommaire à droite (scrollspy) ; notions vues mémorisées (IntersectionObserver).
- **Mode Focus** (touche `F` ou bouton) : une notion plein écran, typo agrandie, ← → / boutons, points de progression, `Échap` pour sortir, pétales et nav cachés.
- **Écouter** chaque bloc ou l'essentiel (Web Speech API, voix et vitesse réglables).
- Raccourcis : `F` focus, `J/K` notion suivante/précédente, `?` aide.

---

## 6. Stockage local (contrat `src/lib/store.ts`)

Une seule clé `localStorage` : `manabi:v1` (JSON). Les secrets sont **à part** : `manabi:v1:secrets`.

```ts
type Etat = {
  version: 1
  maj: string                                  // ISO, dernière modification
  progression: Record<CoursId, {
    sectionsVues: string[]                     // ids des ## vus
    termine: boolean
    termineLe?: string                         // ISO
    derniereVisite: string                     // ISO
  }>
  srs: Record<CarteId, CarteFSRS & { coursId: CoursId }>   // CarteId = `${coursId}::${hash(q)}`
  quiz: Record<CoursId, { meilleur: number; total: number; tentatives: number; dernier: string }>
  exercices: Record<string, { fait: boolean; le: string }> // clé `${coursId}::${index}`
  stats: {
    petales: number
    serie: { actuelle: number; record: number; dernierJour: string }   // AAAA-MM-JJ
    jours: Record<string, number>              // AAAA-MM-JJ → nb d'actions
  }
  prefs: {
    theme: 'auto' | 'clair' | 'sombre'
    police: 'atkinson' | 'systeme'
    taille: number                              // 0.9 à 1.4 (→ --user-scale)
    animations: 'auto' | 'reduites'
    petales: boolean
    nouvellesCartesParJour: number              // défaut 15
    tailleSession: number                       // défaut 15
    minuteur: number                            // minutes, défaut 15
    voix: string | null; vitesseVoix: number    // défaut 1
    gistId: string | null
    modeleIA: string                            // défaut 'claude-sonnet-5-5'
  }
}
// secrets : { githubToken?: string; anthropicKey?: string }
```

API :
```ts
lire(): Etat
modifier(fn: (brouillon: Etat) => void): void      // mute un brouillon, sauvegarde, met maj, émet l'événement
abonner(cb: (e: Etat) => void): () => void          // événement window 'manabi:change' + 'storage' (autres onglets)
exporter(): string ; importer(json: string): void   // sans les secrets
fusionner(a: Etat, b: Etat): Etat                    // pour la synchro (le plus récent gagne, entrée par entrée)
gagnerPetales(n: number, raison: string): void       // + met à jour la série du jour
lireSecrets() / ecrireSecrets(partiel)
```
Hook React : `useManabi(selecteur)` (`useSyncExternalStore`) dans `src/islands/useManabi.ts`.
Tout accès à `localStorage` est dans un `try/catch` (navigation privée) : le site marche sans.

Barème des pétales : notion vue +1 · bonne réponse quiz +2 · carte révisée +1 · exercice fait +5 · cours terminé +10. Un jour compte dans la série dès 1 action.

---

## 7. Atelier (créer un cours partout)

Assistant en 4 étapes, une seule visible à la fois, brouillon sauvegardé automatiquement :

1. **Source** — glisser-déposer : **PDF** (texte extrait dans le navigateur avec pdf.js ; PDF scanné → pages rendues en images), **images** (PNG/JPG/WEBP : photo du tableau, capture de slides), **texte / .md** collé, ou **repo GitHub** (README, package.json, arborescence, fichiers principaux). Choix de la matière (existante ou nouvelle), du type, du niveau, + « Ce que je veux » (consigne libre).
2. **Générer** — deux onglets :
   - **N'importe quelle IA** : le prompt universel (`PROMPT-COURS.md`, importé tel quel) + la source → bouton « Copier » + liens ChatGPT / Claude / Gemini. Pour les images : « joins-les dans ton IA ».
   - **Automatique (Claude API)** : si une clé est enregistrée, appel direct depuis le navigateur (`anthropic-dangerous-direct-browser-access: true`), PDF envoyé en bloc `document`, images en blocs `image`, réponse en streaming.
3. **Vérifier** — coller / éditer la réponse ; **réparation auto** (enlève le bloc ```markdown autour, guillemets typographiques dans le YAML, `---` manquants…) ; validation par le **même schéma Zod que le build** ; erreurs en français ; **aperçu** rendu avec le **même pipeline Markdown** que le site.
4. **Publier** — « Télécharger le .md » (+ chemin où le mettre) **ou** « Publier sur GitHub » (API Contents, jeton fin limité à ce repo) : écrit `src/content/cours/<matiere>/<NN>-<slug>.md`, crée la matière si besoin, ajoute les fichiers joints dans `public/media/<matiere>/`. Lien vers l'Action : le site est à jour en ~2 min.

Sécurité : jetons stockés **uniquement dans ce navigateur** ; recommander un jeton GitHub *fine-grained* (ce repo seulement, Contents R/W, + Gists R/W pour la synchro) et une clé API avec plafond de dépenses.

### 7.1 Automatisation par le repo (`inbox/`)
Déposer un PDF / des images / un .md dans `inbox/` (même depuis l'interface web de GitHub sur téléphone) → l'Action `inbox.yml` lance `scripts/generer-cours.mjs` (Claude API, secret `ANTHROPIC_API_KEY`) → écrit le cours, range la source dans `public/media/`, commit → appelle le déploiement. Sans secret : l'Action explique quoi faire et ne casse rien.

---

## 8. Réglages (groupés façon iOS)
Apparence (thème, police de lecture, taille du texte, animations, pétales) · Révision (nouvelles cartes / jour, taille de session) · Minuteur (durée) · Voix (voix, vitesse, tester) · Synchronisation (jeton GitHub, synchro Gist : envoyer / récupérer / auto, export / import JSON) · IA (clé Anthropic, modèle) · Données (réinitialiser avec confirmation) · À propos (version, liens).

---

## 9. Architecture du code

```
Cours-Dev-Code/
├─ .devcontainer/devcontainer.json     Codespaces (Node 24, extensions, port 4321)
├─ .github/workflows/deploy.yml        push main → test + build → branche gh-pages
├─ .github/workflows/inbox.yml         inbox/ → cours (Claude API) → commit → déploiement
├─ .vscode/                            extensions recommandées, réglages
├─ AGENTS.md / CLAUDE.md               règles pour toute IA qui code dans le repo
├─ PROMPT-COURS.md                     LE prompt universel (source unique, importé par l'Atelier et le script)
├─ docs/                               CONCEPTION.md, TRAVAILLER-PARTOUT.md
├─ inbox/                              dépôt de sources à transformer
├─ scripts/                            generer-cours.mjs, nouveau-cours.mjs, verifier-contenu.mjs, installer-pc.ps1/.sh
├─ public/                             .nojekyll, favicon.svg, icons/, manifest.webmanifest, media/
├─ integrations/service-worker.ts      génère dist/sw.js (précache) au build
├─ src/
│  ├─ content.config.ts                collections `cours` + `matieres`
│  ├─ content/cours/<matiere>/*.md     LES COURS
│  ├─ content/matieres/*.yaml          les tomes
│  ├─ lib/                             TS pur, testable (schema, store, srs, url, texte, markdown/*, github, anthropic, pdf, reparer, sync)
│  ├─ components/                      composants Astro (statiques)
│  ├─ islands/                         composants React (interactifs)
│  ├─ layouts/                         BaseLayout, CoursLayout
│  ├─ pages/                           routes
│  ├─ scripts/                         petits scripts navigateur (lecteur, thème, copier le code)
│  └─ styles/                          tokens.css, base.css, prose.css, blocs.css
└─ tests/                              Vitest (schema, srs, store, réparation, directives)
```

Règles :
- Liens internes **toujours** via `url('/chemin/')` (`src/lib/url.ts`) qui ajoute `import.meta.env.BASE_URL`. `trailingSlash: 'always'`.
- Îlots : `client:visible` (quiz, flashcards), `client:idle` (palette, minuteur), `client:only="react"` (atelier, réglages, tableau de bord).
- Bibliothèques lourdes (pdf.js, unified) **uniquement** chargées dans l'Atelier (import dynamique).
- Le build échoue sur une vraie erreur de contenu → message clair (fichier + champ).
- Commentaires de code en **français**, courts.
- Scripts npm : pas d'argument commençant par `/` (Git Bash convertit les chemins sous Windows).

Scripts npm : `dev`, `build`, `preview`, `test`, `verifier` (contenu), `nouveau` (crée un cours modèle), `generer` (inbox → cours).

---

## 10. Déploiement
- `astro.config.mjs` : `site: 'https://drakurei.github.io'`, `base: '/Cours-Dev-Code'`, `trailingSlash: 'always'`.
- `deploy.yml` : `on: push (main) + workflow_dispatch + workflow_call` → Node 24 → `npm ci` → `npm test` → `npm run build` → publication de `dist/` sur la branche `gh-pages` (`peaceiris/actions-gh-pages@v4`, `.nojekyll`), `concurrency` pour éviter deux déploiements en même temps.
- Les pushs faits par l'Action `inbox.yml` (GITHUB_TOKEN) ne relancent pas les autres workflows → `inbox.yml` appelle `deploy.yml` (`workflow_call`) après son commit.

---

## 11. Travailler partout (résumé — détail dans `docs/TRAVAILLER-PARTOUT.md`)
1. **GitHub = la seule source de vérité.** Arriver : `git pull`. Partir : commit + `git push`.
2. **PC pro → GitHub Codespaces** (recommandé) : VS Code dans le navigateur, rien à installer, rien de perso sur le PC du boulot, identité drakurei automatique.
3. **Claude Code sur le web** (claude.ai/code) relié au repo : coder avec l'IA depuis n'importe quel navigateur.
4. **Clone local** (si le PC pro le permet) : `scripts/installer-pc.ps1` règle l'identité Git **locale au repo** (drakurei, jamais l'email pro).
5. **Juste ajouter un cours** : l'Atelier du site (téléphone compris) ou `inbox/` via github.com.
6. ⚠️ Repo **public** : ne jamais y mettre de contenu confidentiel du boulot (clients, code interne de La Nation du Web).

---

## 12. Hors périmètre V1 (V2+)
Comptes / backend · stats avancées (heatmap annuelle) · mode examen chronométré · génération d'audio · éditeur visuel complet · domaine personnalisé · chiffrement de cours privés.
