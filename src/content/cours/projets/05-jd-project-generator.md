---
titre: "JD Project Generator : une CLI Node et son extension VS Code"
matiere: "projets"
type: "projet"
chapitre: 5
niveau: "intermediaire"
duree: 14
date: 2026-09-22
source: "Projet perso JD Studio, dossier Projets/code_vsc/jd-project-generator (docs/ARCHITECTURE.md)"
tags: ["node", "cli", "architecture", "securite", "vscode"]
essentiel: "jd-create génère un projet propre en une commande : HTML / CSS / JS, React + Vite, Next.js, Node + Express, PHP MVC ou Python, avec README, .gitignore, réglages VS Code et git init. Zéro dépendance. Le cœur est un moteur pur, generate(spec, io), que la CLI et l'extension VS Code réutilisent tel quel."
retenir:
  - "Un moteur pur et des adaptateurs : la CLI, l'extension et les tests appellent le même generate(spec, io)."
  - "Le cœur lève des erreurs avec un code ; seul le lanceur bin/ appelle process.exit."
  - "Ajouter une stack = une entrée dans le registre + un dossier de templates, sans toucher au cœur."
  - "Jamais de chemin collé dans une commande : une commande constante, et le chemin dans l'option cwd."
  - "Un fichier existant n'est jamais écrasé."
definitions:
  - terme: "CLI"
    definition: "Command Line Interface : un programme qu'on utilise en tapant des commandes dans le terminal."
    exemple: "jd-create --type vanilla --name mon-site --git"
  - terme: "Scaffolding"
    definition: "Générer automatiquement le squelette d'un projet : dossiers, fichiers de base, configuration."
  - terme: "Fonction pure"
    definition: "Fonction qui renvoie toujours le même résultat pour les mêmes entrées, sans effet de bord (ni disque, ni réseau, ni affichage)."
  - terme: "Injection de dépendances"
    definition: "Donner à une fonction les outils dont elle a besoin (ici io) au lieu qu'elle les crée : on peut alors les remplacer (CLI, VS Code, tests)."
  - terme: "Slug"
    definition: "Version d'un nom sûre pour un dossier ou une URL : minuscules, chiffres et tirets."
    exemple: "\"Mon projet !!!\" → \"mon-projet\""
  - terme: "Path traversal"
    definition: "Attaque qui utilise ../ dans un chemin pour sortir du dossier autorisé."
  - terme: "Bundle"
    definition: "Un seul fichier qui regroupe un programme et tous ses imports, produit par un outil comme esbuild."
  - terme: "Fichier .vsix"
    definition: "Le paquet d'installation d'une extension VS Code."
flashcards:
  - q: "jd-create en une phrase ?"
    r: "Une CLI Node sans dépendance qui génère un projet propre (7 stacks), avec une extension VS Code qui réutilise le même moteur."
  - q: "Pourquoi séparer le cœur et la CLI ?"
    r: "Le cœur ne connaît ni le terminal ni VS Code : n'importe quel adaptateur (CLI, extension, tests) l'appelle avec generate(spec, io)."
  - q: "Les 4 étapes de generate() ?"
    r: "validateSpec, assertSafeTarget, buildPlan (pure), puis executePlan qui écrit les fichiers et lance les actions de fin."
  - q: "Que contient un GenerationPlan ?"
    r: "Les dossiers à créer, les dossiers de templates à copier, les fichiers à écrire et les actions de fin (git init, installation, ouverture de VS Code)."
  - q: "Comment ajouter une nouvelle stack ?"
    r: "Une entrée dans src/config/projectTypes.js, un dossier dans src/templates, et un générateur si la logique diffère. Le cœur ne change pas."
  - q: "Que devient une variable inconnue comme {{AUTRE}} au rendu ?"
    r: "Elle reste telle quelle : on voit tout de suite qu'un template est incomplet."
  - q: "Pourquoi un template s'appelle dot-gitignore ?"
    r: "Un vrai .gitignore peut disparaître au packaging ; dot-gitignore est renommé en .gitignore au moment de la génération."
  - q: "Que se passe-t-il si le dossier existe déjà ?"
    r: "Par défaut, refus avec le code 3 ; en mode merge, seuls les fichiers absents sont écrits, rien n'est écrasé."
  - q: "Comment tu évites l'injection de commande ?"
    r: "Les commandes sont constantes (git init, npm install), le gestionnaire de paquets est vérifié dans une liste autorisée, et le chemin passe par l'option cwd."
  - q: "Comment c'est possible, zéro dépendance ?"
    r: "Les questions utilisent node:readline, les couleurs des codes ANSI, et les tests node:test : tout est déjà dans Node."
  - q: "Comment l'extension trouve les templates une fois bundlée ?"
    r: "build.js les copie dans extension/templates, et activate() donne leur chemin au moteur avec la variable JD_TEMPLATES_DIR."
  - q: "Combien de tests, avec quoi ?"
    r: "37 tests pour la CLI et 14 pour l'extension, avec node:test, le lanceur de tests intégré à Node."
quiz:
  - question: "Que renvoie render(\"Bonjour {{PROJECT_TITLE}} {{AUTRE}}\", { PROJECT_TITLE: \"Manabi\" }) ?"
    choix:
      - "Bonjour Manabi {{AUTRE}}"
      - "Bonjour Manabi"
      - "Bonjour Manabi undefined"
      - "Une erreur"
    reponse: "Bonjour Manabi {{AUTRE}}"
    explication: "Une variable inconnue est laissée intacte, exprès : un template incomplet se voit tout de suite."
  - question: "Quel slug donne normalizeName(\"Été 2026 : mon site !\") ?"
    choix:
      - "ete-2026-mon-site"
      - "été-2026-mon-site"
      - "ete-2026--mon-site-"
      - "ete2026monsite"
    reponse: "ete-2026-mon-site"
    explication: "Accents retirés (NFD), minuscules, chaque groupe de caractères spéciaux devient un tiret, puis les tirets du début et de la fin sont enlevés."
  - question: "Où a-t-on le droit d'appeler process.exit ?"
    choix:
      - "Dans src/core, dès qu'une erreur arrive"
      - "Seulement dans le lanceur bin/ et la CLI"
      - "Dans chaque générateur"
      - "Nulle part, Node l'interdit"
    reponse: "Seulement dans le lanceur bin/ et la CLI"
    explication: "Le cœur lève une GeneratorError avec un code ; un process.exit dans le moteur couperait aussi l'extension VS Code."
  - question: "Pourquoi buildPlan est facile à tester ?"
    choix:
      - "Parce qu'elle est pure : pas de disque, pas d'affichage"
      - "Parce qu'elle est asynchrone"
      - "Parce qu'elle utilise esbuild"
      - "Parce qu'elle lance npm install"
    reponse: "Parce qu'elle est pure : pas de disque, pas d'affichage"
    explication: "On lui donne un spec, on compare le plan obtenu : aucun fichier n'est écrit pendant le test."
  - question: "Que fait le mode merge sur un dossier qui existe déjà ?"
    choix:
      - "Il vide le dossier puis génère"
      - "Il écrit seulement les fichiers absents, sans rien écraser"
      - "Il écrase tous les fichiers"
      - "Il renomme le dossier existant"
    reponse: "Il écrit seulement les fichiers absents, sans rien écraser"
    explication: "Les fichiers déjà présents sont notés dans result.skipped : la V1 n'écrase jamais rien."
  - question: "Pourquoi la regex des variables n'abîme pas le JSX style={{ color: 'red' }} ?"
    choix:
      - "Parce qu'elle n'accepte que des noms en MAJUSCULES, chiffres et _"
      - "Parce que les fichiers .jsx ne sont jamais rendus"
      - "Parce qu'esbuild protège le JSX"
      - "Parce que le JSX n'utilise jamais d'accolades doubles"
    reponse: "Parce qu'elle n'accepte que des noms en MAJUSCULES, chiffres et _"
    explication: "Le motif est [A-Z0-9_]+ entre les accolades : color: 'red' ne correspond pas, et un test le vérifie."
exercices:
  - titre: "Remplacer les variables d'un template"
    niveau: "facile"
    enonce: "Écris render(contenu, vars) qui remplace chaque {{NOM}} par vars.NOM. Un nom absent de vars reste tel quel."
    indices:
      - "Une regex avec un groupe : `/\\{\\{\\s*([A-Z0-9_]+)\\s*\\}\\}/g`."
      - "replace accepte une fonction (match, key) qui renvoie le texte de remplacement."
      - "Object.prototype.hasOwnProperty.call(vars, key) dit si la variable existe."
    solution: |
      ```js
      const VAR_PATTERN = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;

      function render(content, vars = {}) {
        return content.replace(VAR_PATTERN, (match, key) =>
          Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match,
        );
      }

      console.log(render("© {{YEAR}} {{PROJECT_TITLE}} {{X}}", { YEAR: 2026, PROJECT_TITLE: "Mon App" }));
      // © 2026 Mon App {{X}}
      ```
  - titre: "Fabriquer un slug"
    niveau: "moyen"
    enonce: "Écris slugifier(nom) : sans accents, en minuscules, chaque groupe de caractères qui ne sont ni lettres ni chiffres devient un seul tiret, sans tiret au début ni à la fin. Si rien ne reste, lève une erreur."
    indices:
      - "`normalize(\"NFD\")` sépare les lettres de leurs accents ; la regex `/[\\u0300-\\u036f]/g` retire les accents."
      - "`/[^a-z0-9]+/g` remplace d'un coup tout un groupe de caractères spéciaux."
      - "`/^-+|-+$/g` enlève les tirets au début et à la fin."
    solution: |
      ```js
      function slugifier(nom) {
        const slug = String(nom ?? "")
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // retire les accents
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        if (!slug) throw new Error(`Impossible de faire un nom de dossier avec "${nom}".`);
        return slug;
      }

      console.log(slugifier("Mon projet !!!"));        // mon-projet
      console.log(slugifier("Été 2026 : mon site !")); // ete-2026-mon-site
      ```
  - titre: "Bloquer la sortie du dossier"
    niveau: "difficile"
    enonce: "Écris estDedans(parent, enfant) qui renvoie true si le chemin enfant est dans parent (ou est parent), et false s'il en sort, par exemple avec ../."
    indices:
      - "path.relative(parent, enfant) donne le chemin pour aller de l'un à l'autre."
      - "Si ce chemin relatif commence par .. ou est absolu (autre disque sous Windows), l'enfant est dehors."
      - "Un chemin relatif vide veut dire : c'est le même dossier."
    solution: |
      ```js
      import path from "node:path";

      function estDedans(parent, enfant) {
        const rel = path.relative(parent, enfant);
        return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
      }

      console.log(estDedans("/projets", "/projets/mon-app"));       // true
      console.log(estDedans("/projets", "/projets/../etc/passwd")); // false
      ```
projet:
  stack: ["Node.js", "JavaScript (ESM)", "node:test", "esbuild", "API VS Code"]
  statut: "termine"
  role: "Seul, outil perso de la marque JD Studio"
---

## Le projet en un coup d'œil

:::quoi
`jd-create` crée un projet propre en une commande : fichiers de départ, README, `.gitignore`, réglages VS Code, `git init`. **Zéro dépendance** à l'exécution : tout vient de Node.
:::

:::exemple
```text
bin/jd-create.js            lanceur : appelle la CLI, gère le code de sortie
src/cli/                    adaptateur terminal : flags, questions, couleurs
src/core/                   moteur pur : spec, puis plan, puis exécution
src/generators/             un générateur déclaratif par stack
src/templates/              fichiers modèles (.tpl = avec variables)
src/config/projectTypes.js  le registre : la liste des types de projet
extension/                  extension VS Code (même moteur, bundlé)
test/                       tests node:test
```
:::

:::piege
Le moteur ne doit **rien** savoir du terminal : aucun `console.log`, aucun `process.exit` dans `src/core`. Sinon, impossible de le réutiliser dans VS Code.
:::

:::ou[Réutilisé ensuite]
L'extension VS Code « JD Studio » appelle exactement le même `generate(spec, io)` que la CLI : seul l'adaptateur change.
:::

:::info[Ce que tu as fait]
Le cahier des charges (`docs/ARCHITECTURE.md`), la V1 de la CLI (7 stacks, options React et Node, mode interactif et mode flags), 37 tests, puis l'extension VS Code : un panneau dans la barre latérale, un bouton dans la barre d'état et un clic droit « Créer un projet » sur un dossier.
:::

## Un moteur pur, des adaptateurs

:::quoi
Le cœur expose une seule fonction, `generate(spec, io)`. `spec` décrit le projet ; `io` est l'**affichage injecté** : couleurs pour la CLI, panneau pour l'extension, version muette pour les tests.
:::

:::exemple
```js title="src/core/index.js"
export async function generate(spec, io) {
  validateSpec(spec);
  assertSafeTarget(spec);
  const plan = buildPlan(spec);
  return executePlan(plan, spec, io);
}
```
:::

:::piege
Le cœur **lève** une `GeneratorError` avec un code de sortie (2 = entrée invalide, 3 = dossier existant…). Seul le lanceur `bin/` appelle `process.exit` : dans l'extension, il arrêterait tout l'hôte des extensions de VS Code.
:::

:::ou[Dans jd-project-generator]
`buildPlan(spec)` est **pure** (aucun accès disque) : `test/plan.test.js` vérifie le plan sans rien écrire. Ajouter une stack = une entrée dans `src/config/projectTypes.js` et un dossier de templates.
:::

## Des templates avec variables

:::quoi
Les fichiers modèles contiennent des **variables** comme `{{PROJECT_NAME}}`. Une regex les remplace ; une variable **inconnue** est laissée telle quelle, pour repérer un template incomplet.
:::

:::exemple
```js title="src/core/renderer.js"
const VAR_PATTERN = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;

export function render(content, vars = {}) {
  return content.replace(VAR_PATTERN, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match,
  );
}
```
:::

:::piege
Le JSX utilise aussi des doubles accolades : `style={{ color: 'red' }}`. La regex n'accepte que des **MAJUSCULES**, chiffres et `_`, donc le JSX n'est pas touché (un test le vérifie).
:::

:::ou[Dans jd-project-generator]
Conventions de noms : `App.jsx.tpl` devient `App.jsx` (rendu avec les variables), `dot-gitignore` devient `.gitignore`, pour qu'il ne disparaisse pas au packaging.
:::

## Chemins et commandes sûrs

:::quoi
Le nom du projet devient un **slug** sûr, le dossier cible doit rester **dans** la destination, et les commandes lancées sont **constantes** : le chemin passe par l'option `cwd`.
:::

:::exemple
```js title="src/core/spec.js"
const slug = title
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '') // retire les accents
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')      // tout le reste devient un tiret
  .replace(/-{2,}/g, '-')
  .replace(/^-+|-+$/g, '');
```
:::

:::piege
Coller un chemin dans une commande (`'cd ' + dossier + ' && npm install'`) casse avec les espaces et les `&` (comme dans ton dossier « Dev & Projets ») et ouvre la porte à l'**injection** de commande.
:::

:::ou[Dans jd-project-generator]
`src/utils/process.js` : `run('git init', { cwd })`. Le gestionnaire de paquets doit être dans la liste autorisée (npm, pnpm, yarn), et `assertSafeTarget()` refuse une cible hors de la destination.
:::

## Une extension VS Code sur le même moteur

:::quoi
L'extension déclare ses **commandes** et sa **vue** dans son `package.json` (section `contributes`), puis `activate()` les branche. **esbuild** regroupe l'extension et le moteur dans un seul fichier, `out/extension.cjs`.
:::

:::exemple
```js title="extension/src/extension.js"
export function activate(context) {
  process.env.JD_TEMPLATES_DIR = path.join(context.extensionPath, 'templates');
  const output = vscode.window.createOutputChannel('JD Studio');
  const provider = createWebviewViewProvider(vscode, { output });
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('jdStudio.home', provider),
    vscode.commands.registerCommand('jdStudio.createProject', (arg) =>
      runCreateProject(vscode, { output, formOverride: arg && arg.__jdForm })),
  );
}
```
:::

:::piege
Une fois bundlé, le moteur ne trouve plus ses templates par chemin relatif. `build.js` les copie dans `extension/templates/`, et `JD_TEMPLATES_DIR` donne leur chemin au moteur, sans le modifier.
:::

:::ou[Dans VS Code]
Clic droit sur un dossier de l'Explorateur, puis « Créer un projet » ; ou l'icône JD Studio de la barre d'activité ; ou le bouton « JD Studio » de la barre d'état.
:::

## Lancer, tester, installer

:::quoi
La CLI se lance avec Node ; `npm install -g .` la rend disponible partout. L'extension se construit avec `build.js`, puis s'emballe en fichier `.vsix`.
:::

:::exemple
```bash
npm test                         # node --test "test/*.test.js"
npm install -g .                 # jd-create disponible partout
jd-create --type react-vite --name mon-app --language ts --tailwind
cd extension && node build.js    # bundle esbuild + copie des templates
node node_modules/@vscode/vsce/vsce package --allow-missing-repository
code --install-extension jd-studio-project-generator-1.0.0.vsix
```
:::

:::piege
Dans un dossier avec un emoji et un `&`, `npm run package` (qui passe par le raccourci `.bin` de vsce) échoue : lance `vsce` directement avec `node`. Pour les tests, passe un **glob** entre guillemets plutôt qu'un dossier.
:::

:::ou[Dans VS Code]
Après une réinstallation, recharge la fenêtre. Pour voir une **nouvelle** icône dans la barre d'activité, ferme et rouvre VS Code complètement.
:::
