@AGENTS.md

## Notes pour Claude Code

### Sous Windows (PC perso)

- Sur le PC perso, le chemin du projet contient un emoji et un `&` (dossier `💻 Dev & Projets`) : mets-le **toujours entre guillemets**, dans Bash comme dans PowerShell.
- npm passe par **Git Bash** (`npm config get script-shell`), parce que cmd.exe casse sur le `&` et l'emoji du chemin. Conséquence : dans les scripts npm, aucun argument ne doit commencer par `/` (Git Bash le convertirait en chemin Windows).
- **Serveur de preview** : ne lance pas `npm run dev` depuis l'outil de preview. Lance Node directement :
  `node node_modules/astro/bin/astro.mjs dev` (port 4321, site sur `/Cours-Dev-Code/`).
  Dans `.claude/launch.json` : `"runtimeExecutable": "node"`, `"runtimeArgs": ["node_modules/astro/bin/astro.mjs", "dev"]`, `"port": 4321`.
- Les scripts de `scripts/` sont en ESM et importent directement `src/lib/*.ts` (Node 24 retire les types tout seul) : `node scripts/verifier-contenu.mjs` marche sans étape de build.

### Partout (Codespaces, claude.ai/code)

- Environnement Linux : `npm run dev` marche tel quel. Si l'aperçu d'un codespace affiche « Blocked request » : `npm run dev -- --allowed-hosts .app.github.dev`.
- Sur claude.ai/code, travaille sur une branche et laisse la fusion dans `main` à Jonathan (`main` = mise en ligne).

### Habitudes

- Pour un nouveau cours : `npm run nouveau -- <matiere> "<Titre>"`, ou suis `PROMPT-COURS.md` à la lettre.
- Après un changement de contenu : `npm run verifier` (sortie JSON avec `-- --json` si tu dois l'analyser).
- Avant de conclure : `npm run verifier`, `npm test`, `npm run build`, et dis ce que tu as réellement vérifié.
