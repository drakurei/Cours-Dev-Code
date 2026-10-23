# Manabi 学び

Mon site de révision : tous mes cours et mes projets, transformés en fiches courtes, exercices, quiz et flashcards.
Pensé pour réviser vite et souvent : l'essentiel d'abord, une notion à la fois, toujours la même structure.

**Le site : https://drakurei.github.io/Cours-Dev-Code/** (installable sur le téléphone, marche hors ligne)

## Ajouter un cours

Trois chemins, du plus simple au plus automatique :

1. **Le prompt universel** — copie [`PROMPT-COURS.md`](PROMPT-COURS.md) dans n'importe quelle IA (ChatGPT, Claude, Gemini, Mistral…), colle ta source ou joins tes fichiers, puis range la réponse dans `src/content/cours/<matiere>/NN-slug.md`.
2. **L'Atelier du site** (`/atelier/`) — PDF, images, texte ou repo GitHub → cours, avec vérification et aperçu, puis publication directe sur GitHub. Marche aussi sur téléphone.
3. **Le dossier [`inbox/`](inbox/README.md)** — dépose un PDF, des captures ou des notes (même depuis github.com) : une GitHub Action fabrique le cours avec l'API Claude et remet le site à jour.

Chaque push sur `main` redéploie le site en 2 minutes environ.

## Commandes

| Commande | Ce qu'elle fait |
|---|---|
| `npm run dev` | site en local sur http://localhost:4321/Cours-Dev-Code/ |
| `npm run build` | construit le site dans `dist/` |
| `npm run preview` | sert le build en local |
| `npm test` | tests (Vitest) |
| `npm run verifier` | vérifie tous les cours et matières (erreurs en français, `-- --json` pour une sortie machine) |
| `npm run nouveau -- react "useEffect"` | crée un cours vide à remplir (et la matière si besoin) |
| `npm run generer` | transforme `inbox/` en cours (clé `ANTHROPIC_API_KEY`), `-- --essai` pour voir sans appeler l'API |

Avant de pousser : `npm run verifier && npm test && npm run build`.

## Structure

```
.github/workflows/    deploy.yml (tests + build → gh-pages), inbox.yml (inbox/ → cours)
.devcontainer/        GitHub Codespaces : Node 24, extensions, Claude Code
docs/                 CONCEPTION.md (le contrat du projet), TRAVAILLER-PARTOUT.md
inbox/                sources à transformer en cours
scripts/              verifier-contenu, nouveau-cours, generer-cours, installer-pc
public/media/         PDF et images des cours
src/content/cours/    les cours, un dossier par matière : <matiere>/NN-slug.md
src/content/matieres/ les matières (les « tomes »), un .yaml chacune
src/lib/              logique en TypeScript pur (schéma, révision espacée, Markdown, prompt…)
src/components/       composants Astro
src/islands/          composants React interactifs (quiz, flashcards, atelier…)
src/pages/            les pages du site
PROMPT-COURS.md       le prompt universel (une seule source, lue par l'Atelier et par inbox/)
AGENTS.md, CLAUDE.md  règles pour les IA qui codent dans ce repo
```

## Travailler depuis plusieurs PC

GitHub est la seule source de vérité : `git pull` en arrivant, commit + `git push` en partant.
Au travail : GitHub Codespaces, rien à installer. Tout est expliqué dans [`docs/TRAVAILLER-PARTOUT.md`](docs/TRAVAILLER-PARTOUT.md).

Le repo est public : rien de confidentiel du travail ici, aucun secret.

## Pour aller plus loin

- [`docs/CONCEPTION.md`](docs/CONCEPTION.md) : design, format des cours, stockage, architecture.
- [`AGENTS.md`](AGENTS.md) : conventions du code.

## Stack

Astro 7 (site statique) · îlots React 19 · TypeScript · Zod · Markdown + `remark-directive` · Shiki · FSRS (`ts-fsrs`) pour la répétition espacée · PWA · GitHub Actions + GitHub Pages · API Claude pour l'automatisation.
