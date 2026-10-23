# AGENTS.md — règles pour toute IA qui code dans ce repo

Claude Code, Codex, Cursor, Copilot, Gemini… : lis ce fichier en entier avant de toucher au code.

## Le projet

**Manabi 学び** est le site de révision personnel d'un étudiant développeur : ses cours et ses projets, transformés en fiches courtes, exercices, quiz et flashcards à répétition espacée. Il est publié sur https://drakurei.github.io/Cours-Dev-Code/.

Le lecteur a un TDA : **l'essentiel d'abord, une chose à la fois, toujours la même structure**. Chaque choix (texte, interface, animation) respecte les principes de `docs/CONCEPTION.md` § 1.

**`docs/CONCEPTION.md` est le contrat du projet** (design, format des cours, stockage, architecture). Lis la partie qui concerne ta tâche avant de commencer. Si tu dois t'en écarter, dis-le et explique pourquoi.

## Structure

| Dossier / fichier | Rôle |
|---|---|
| `src/content/cours/<matiere>/NN-slug.md` | les cours (Markdown + frontmatter YAML) |
| `src/content/matieres/<slug>.yaml` | les matières, affichées comme des tomes de manga |
| `src/lib/` | TypeScript pur et testable : schéma Zod, store, révision espacée, Markdown, prompt… |
| `src/components/`, `src/layouts/`, `src/pages/` | Astro (statique) |
| `src/islands/` | composants React, seulement pour l'interactif |
| `src/styles/` | `tokens.css` (couleurs, typo, espaces), `base.css`, `prose.css`, `blocs.css` |
| `public/media/<matiere>/` | PDF et images des cours |
| `inbox/` | sources que l'Action `inbox.yml` transforme en cours |
| `scripts/` | `verifier-contenu`, `nouveau-cours`, `generer-cours`, `installer-pc` (Node 24, sans dépendance externe) |
| `tests/` | Vitest |
| `PROMPT-COURS.md` | le prompt universel : la **seule** source du format pour les IA (lu par l'Atelier et par `generer-cours`) |

## Commandes

```bash
npm run dev        # http://localhost:4321/Cours-Dev-Code/
npm run build      # site statique dans dist/
npm test           # Vitest
npm run verifier   # valide tous les cours et matières (-- --json pour une sortie machine)
npm run nouveau -- <matiere> "<Titre>"   # crée un cours modèle (et la matière si besoin)
npm run generer    # inbox/ → cours avec l'API Claude (-- --essai : sans appel)
```

## Ajouter ou modifier un cours

Format complet : `docs/CONCEPTION.md` § 4 et `PROMPT-COURS.md`. L'essentiel :

- Fichier `src/content/cours/<matiere>/NN-slug.md`. `matiere` et `slug` : minuscules, chiffres, tirets. `NN` : deux chiffres. Le champ `matiere` = le nom du dossier.
- Frontmatter obligatoire : `titre` (90 caractères max), `matiere`, `essentiel` (1 à 3 phrases, 400 caractères max). Le reste : `type`, `niveau`, `duree`, `date`, `source`, `tags`, `retenir`, `definitions`, `flashcards`, `quiz`, `exercices`, `projet`, `fichiers`, `brouillon`.
- Dans un quiz, `reponse` est le **texte exact** d'un des `choix` (2 à 6 choix).
- YAML : textes entre guillemets doubles, deux espaces d'indentation, jamais de tabulation, `|` pour le multi-lignes.
- Corps : pas de titre `#`. Chaque `##` est une notion, avec dans l'ordre les blocs `:::quoi`, `:::exemple`, `:::piege`, `:::ou[…]`. Blocs facultatifs : `astuce`, `info`, `attention`, `retenir`. Chaque `:::` ouvert est fermé ; chaque bloc de code a son langage.
- PDF et images : dans `public/media/<matiere>/`, référencés par `/media/<matiere>/fichier.pdf` (la base du site est ajoutée toute seule).
- Français correct avec accents, tutoiement, pas d'emoji (les kanji servent d'icônes).
- Ne renomme pas un cours existant sans raison : son nom fait son URL et l'identifiant de la progression enregistrée.
- Après chaque changement de contenu : `npm run verifier` doit afficher 0 erreur.

Si tu modifies le format (schéma), mets à jour **ensemble** `src/lib/schema.ts`, `docs/CONCEPTION.md` § 4, `PROMPT-COURS.md` et les tests.

## Conventions de code

- **TypeScript** partout. Les fichiers de `src/lib/` importés par les scripts Node restent en TypeScript **effaçable** (`erasableSyntaxOnly` : pas d'`enum`, pas de `namespace`, pas de propriétés de paramètres) et importent avec l'extension `.ts`.
- **Commentaires en français**, courts : le pourquoi, pas le quoi.
- **Liens internes : toujours `url('/chemin/')`** (`src/lib/url.ts`). Le site vit sous `/Cours-Dev-Code/` avec `trailingSlash: 'always'` : n'écris jamais `href="/…"` en dur.
- **Îlots React seulement pour l'interactif** (quiz, flashcards, palette, atelier, réglages). Le reste est en Astro statique. Directives : `client:visible`, `client:idle` ou `client:only="react"` (voir CONCEPTION § 9).
- Bibliothèques lourdes (pdf.js, unified) : **uniquement** dans l'Atelier, en import dynamique.
- Couleurs, typo, espaces, rayons, ombres : **les tokens** de `src/styles/tokens.css`, jamais de valeur en dur. Thème clair et sombre, cibles tactiles de 44 px, `prefers-reduced-motion` respecté, focus clavier visible.
- Stockage navigateur : **uniquement** via `src/lib/store.ts` (clé `manabi:v1`), toujours dans un `try/catch`.
- Scripts npm : aucun argument ne commence par `/` (sous Windows, npm passe par Git Bash, qui le transformerait en chemin).
- Pas de nouvelle dépendance sans vrai besoin : la plateforme et ce qui est déjà installé d'abord.
- Ne modifie pas les tomes (`src/content/matieres/*.yaml`) ni les cours existants sans raison liée à ta tâche.

## Git

- Identité **locale au repo** : `drakurei` / `229352063+drakurei@users.noreply.github.com`. **Jamais un e-mail professionnel.** Vérifie avec `git config user.email` avant ton premier commit.
- Commits petits, message en français qui dit ce qui change (ex. « Cours React : ajoute useEffect »).
- Chaque push sur `main` déploie le site. Pour un gros changement : une branche et une pull request.
- Jamais de `dist/`, `node_modules/`, `.env` dans un commit.

## Sécurité et confidentialité

Le repo est **public**.

- **Aucun secret** : ni clé d'API, ni jeton, ni mot de passe. Les clés vivent dans les Secrets GitHub (`ANTHROPIC_API_KEY`) ou dans le navigateur (Réglages du site).
- **Rien de confidentiel du travail** : pas de code interne, pas de clients, pas de documents de l'entreprise, pas de captures d'outils internes. Pour une notion vue au travail, un exemple neutre.
- **Aucune donnée personnelle** : pas de CV, d'adresse, de téléphone.
- Le HTML des cours est assaini : n'ouvre pas de brèche (`<script>`, attributs `on*`, `javascript:`).

## Avant de dire « fini »

1. `npm run verifier` → 0 erreur.
2. `npm test` → tout passe.
3. `npm run build` → le build réussit.
4. Si l'interface a changé : vérifie à 375 px de large, en thème sombre et au clavier.
5. Dans ton compte rendu, dis ce que tu as **réellement** lancé et vu, y compris ce qui ne marche pas encore.
