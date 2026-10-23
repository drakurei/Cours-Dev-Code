# Travailler partout : PC perso, PC pro, téléphone

Ce guide explique comment coder et réviser Manabi depuis n'importe où, sans jamais perdre ton travail.
Lis d'abord **Le principe**, puis seulement l'option dont tu as besoin.

---

## 1. Le principe

**GitHub est la seule source de vérité.** Le repo `drakurei/Cours-Dev-Code` sur GitHub est la version de référence. Chaque PC n'en a qu'une copie.

Le rituel, à chaque fois :

| Moment | Commande | Dans VS Code |
|---|---|---|
| En arrivant | `git pull` | bouton **Synchroniser** (les deux flèches, en bas à gauche) |
| En partant | `git add -A`, `git commit -m "ce que j'ai fait"`, `git push` | panneau **Source Control** : message, **Commit**, puis **Synchroniser** |

- Chaque push sur `main` met le site à jour, en 2 minutes environ.
- Partir sans `git push` : l'autre PC ne verra rien.
- Ne modifie pas le même fichier sur deux PC en même temps. Sinon : **conflit**. VS Code te propose alors « Accepter l'actuel », « Accepter l'entrant » ou « Accepter les deux » ; choisis, enregistre, commit, push.

---

## 2. Quelle option choisir ?

| Ta situation | Option |
|---|---|
| Au travail, sur le PC pro | **A. GitHub Codespaces** (recommandé) |
| N'importe où, tu veux que l'IA code pour toi | **B. Claude Code sur le web** |
| Au travail, si la DSI autorise Git et Node | C. Clone local |
| Une petite correction de texte, sans rien lancer | D. github.dev |
| Juste ajouter un cours (téléphone compris) | E. Atelier ou inbox/ |

Sur le **PC perso**, rien ne change : tu travailles dans le dossier habituel, avec le rituel ci-dessus.

---

## 3. Option A (recommandée au travail) : GitHub Codespaces

VS Code dans le navigateur, sur une machine de GitHub.

**Pourquoi c'est le meilleur choix au travail :**
- Rien à installer sur le PC pro. Rien de perso n'y reste.
- Node 24, les dépendances, les extensions et Claude Code sont prêts (fichier `.devcontainer/devcontainer.json`).
- L'identité Git **drakurei** (e-mail no-reply GitHub) est réglée toute seule.

**Ouvrir :**
1. Va sur `github.com/drakurei/Cours-Dev-Code`.
2. Bouton vert **Code** → onglet **Codespaces** → **Create codespace on main**.
3. La première fois, attends 2 à 3 minutes (installation et `npm ci`).
4. Les fois suivantes : même menu, et rouvre **le même** codespace (n'en crée pas un nouveau à chaque fois).

**Lancer le site :**
1. Dans le terminal (en bas) : `npm run dev`.
2. Une notification propose d'ouvrir le port **4321** (« Manabi »). Sinon : onglet **Ports** → icône globe.
3. Ajoute `/Cours-Dev-Code/` à la fin de l'adresse si la page d'accueil ne s'affiche pas.
4. Si la page affiche « Blocked request » : arrête le serveur (Ctrl + C) et relance `npm run dev -- --allowed-hosts .app.github.dev`.

**Coder avec Claude Code dans le codespace :** tape `claude` dans le terminal, puis connecte-toi (une seule fois par codespace).

**Le quota gratuit :**
- Environ **60 heures par mois** sur la machine de base à 2 cœurs (120 heures-cœur), plus 15 Go de stockage.
- Ton reste : github.com → Settings → **Billing** (rubrique Codespaces).

**Ne pas gaspiller :**
- Un codespace s'arrête seul après 30 minutes sans activité.
- En partant : **commit + push**, puis arrête-le : `github.com/codespaces` → **…** à côté du codespace → **Stop codespace**.
- Supprime ceux dont tu ne te sers plus (**Delete**) : ils occupent du stockage.
- Tant que tu n'as pas poussé, ton travail reste **dans** le codespace. Pousse toujours avant de partir.

---

## 4. Option B : Claude Code sur le web

Tu décris la tâche, Claude code dans le cloud, sur le repo.

1. Va sur **claude.ai/code** et connecte ton compte GitHub (la première fois, autorise l'accès au repo `drakurei/Cours-Dev-Code`).
2. Choisis le repo, puis décris la tâche. Exemple :

   ```text
   Ajoute un cours React sur useEffect à partir de mes notes ci-dessous.
   Suis PROMPT-COURS.md, puis lance npm run verifier jusqu'à 0 erreur.

   [tes notes]
   ```

3. Claude lit les règles du repo (`CLAUDE.md` et `AGENTS.md`), travaille, puis pousse sur une **branche**.
4. Relis, puis fusionne la pull request dans `main`. C'est seulement là que le site change.

Ça marche aussi depuis le téléphone.

---

## 5. Option C : clone local sur le PC pro (seulement si c'est autorisé)

**Demande d'abord à la DSI** si tu as le droit d'installer Git et Node et de cloner un repo perso. Sinon, reste sur l'option A.

**Installer :**
1. Choisis un dossier **simple**, sans `&` ni emoji. Exemple : `C:\Users\<toi>\Projets`.
2. Télécharge le script : `https://raw.githubusercontent.com/drakurei/Cours-Dev-Code/main/scripts/installer-pc.ps1`.
3. Dans PowerShell, depuis ce dossier :

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\installer-pc.ps1
   ```

   (Sur macOS ou Linux : `bash installer-pc.sh`.)

**Ce que fait le script :** il vérifie Git et Node (22 ou plus), clone le repo, règle l'identité Git **locale au repo** (drakurei + e-mail no-reply), puis lance `npm ci`. Il ne supprime rien et peut être relancé.

**Pourquoi « locale » :** le PC pro a sûrement l'identité Git du travail en **global**. Le script ne la touche pas. Seul ce repo signe en drakurei. Vérifie :

```bash
git config user.email          # dans le repo → 229352063+drakurei@users.noreply.github.com
git config --global user.email # le reste du PC → ton e-mail du travail, inchangé
```

**Astuce si tu as plusieurs repos perso sur le PC pro :** range-les dans un même dossier et utilise `includeIf` dans ton `~/.gitconfig` :

```ini
[includeIf "gitdir/i:C:/Users/<toi>/Perso/"]
    path = ~/.gitconfig-perso
```

et dans `~/.gitconfig-perso` :

```ini
[user]
    name = drakurei
    email = 229352063+drakurei@users.noreply.github.com
```

**Se connecter à GitHub :** au premier `git push`, **Git Credential Manager** (fourni avec Git for Windows) ouvre une fenêtre GitHub. Connecte-toi avec le compte **drakurei**, pas avec un compte du travail. Le script règle déjà `credential.https://github.com.username = drakurei` pour ce repo, pour que le bon compte soit proposé.

---

## 6. Option D : github.dev (petite modification)

1. Sur la page du repo, appuie sur la touche **.** (point).
2. Un VS Code léger s'ouvre dans le navigateur. Pas de terminal, donc pas de `npm`.
3. Modifie le fichier, puis **Source Control** → message → **Commit & Push**.

Parfait pour corriger une faute dans un cours. Le site se met à jour tout seul.

---

## 7. Option E : juste ajouter un cours, depuis n'importe où

- **L'Atelier du site** (`/atelier/`) : source → générer → vérifier → publier. Marche sur téléphone. Pour publier sur GitHub depuis l'Atelier, il faut un jeton (voir la section 8).
- **Le dossier inbox/** : sur github.com, ouvre `inbox/` → **Add file** → **Upload files** → **Commit changes**. Le cours se fabrique tout seul (détails : `inbox/README.md`).
- **Le prompt universel** : copie `PROMPT-COURS.md` dans n'importe quelle IA, ajoute ta source, et dépose le résultat dans l'Atelier.

---

## 8. Synchroniser ta progression de révision

Ta progression (cartes, quiz, pétales, série) est gardée **dans le navigateur**. Pour la retrouver sur tous tes appareils :

**1. Crée un jeton GitHub (une seule fois) :**
1. github.com → photo de profil → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. Nom : `Manabi`. Expiration : 90 jours (tu le recréeras ensuite).
3. **Repository access** → **Only select repositories** → `drakurei/Cours-Dev-Code`.
4. **Permissions** :
   - Repository permissions → **Contents** : *Read and write* (pour publier depuis l'Atelier).
   - Account permissions → **Gists** : *Read and write* (pour la synchro de la progression).
5. **Generate token**, puis copie-le (il ne s'affiche qu'une fois).

**2. Sur chaque appareil :** site → **Réglages** → **Synchronisation** → colle le jeton → **Envoyer** (depuis l'appareil le plus à jour), puis **Récupérer** sur les autres. Tu peux activer la synchro automatique.

Le jeton reste **dans ce navigateur seulement**. Ne le colle jamais dans un fichier du repo.

**Tes réglages VS Code :** sur ton VS Code perso, Settings Sync (icône compte → **Turn on Settings Sync**, compte GitHub drakurei). Dans Codespaces, active-le dans github.com → Settings → **Codespaces** → Settings Sync. N'active pas ta synchro perso dans le VS Code du travail.

---

## 9. Confidentialité (à lire une fois)

**Attention : le repo est public.** Tout ce qui y est poussé est visible par tout le monde, pour toujours (l'historique Git garde tout).

- Ne mets **jamais** de code, de documents ou de données du travail : ni code interne, ni clients, ni captures d'écran d'outils internes.
- Ne mets aucun mot de passe, aucune clé d'API, aucun jeton (ils se rangent dans les Réglages du site ou dans les **Secrets** GitHub).
- Pour réviser une notion vue au travail, écris un exemple **neutre**, à ta façon.
- Avant d'installer quoi que ce soit sur le PC pro, **demande à la DSI**. Sans accord : Codespaces ou github.dev, dans le navigateur.

---

## 10. Dépannage rapide

| Problème | Solution |
|---|---|
| `git push` refusé (« rejected ») | Quelqu'un (ou l'autre PC) a poussé avant toi : `git pull`, puis `git push`. |
| `npm run …` échoue sur le PC perso (chemin avec `&` ou emoji) | npm doit passer par Git Bash : `npm config set script-shell "C:\Program Files\Git\bin\bash.exe"` (déjà fait sur le PC perso). |
| Le push demande un compte, ou répond 403 | Mauvais compte GitHub : connecte-toi avec **drakurei** (Git Credential Manager, ou `gh auth login`). |
| Le codespace est arrêté | Rouvre-le depuis `github.com/codespaces` : ton travail est encore là. Pousse-le. |
| « Blocked request » dans l'aperçu du codespace | `npm run dev -- --allowed-hosts .app.github.dev` |
| Le site n'a pas changé après un push | Onglet **Actions** du repo : une croix rouge = erreur (l'ancienne version reste en ligne). Lance `npm run verifier` pour voir laquelle. |
