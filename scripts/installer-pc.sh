#!/usr/bin/env bash
# Prépare un PC (macOS, Linux, Git Bash sous Windows) pour coder Manabi (drakurei/Cours-Dev-Code).
#
#   bash scripts/installer-pc.sh                      # depuis le repo déjà cloné
#   bash installer-pc.sh ~/Projets/Cours-Dev-Code     # clone le repo à cet endroit s'il n'existe pas
#   bash scripts/installer-pc.sh --sans-dependances   # identité Git seulement, sans npm ci
#
# 1. Vérifie git et Node.js (22 ou plus, 24 conseillé).
# 2. Clone le repo s'il n'est pas déjà là.
# 3. Règle l'identité Git LOCALE au repo (drakurei + e-mail no-reply GitHub) ;
#    l'identité globale du PC n'est jamais modifiée.
# 4. Installe les dépendances (npm ci).
# Rien de destructif : relançable autant de fois que nécessaire.

set -euo pipefail

URL_DEPOT="https://github.com/drakurei/Cours-Dev-Code.git"
NOM_GIT="drakurei"
EMAIL_GIT="229352063+drakurei@users.noreply.github.com"
NODE_MINIMUM=22

if [ -t 1 ]; then BLEU=$'\e[36m'; VERT=$'\e[32m'; JAUNE=$'\e[33m'; ROUGE=$'\e[31m'; FIN=$'\e[0m'; else BLEU=; VERT=; JAUNE=; ROUGE=; FIN=; fi
etape()     { printf '\n%s== %s%s\n' "$BLEU" "$1" "$FIN"; }
ok()        { printf '  %sok%s   %s\n' "$VERT" "$FIN" "$1"; }
info()      { printf '       %s\n' "$1"; }
attention() { printf '  %s!%s    %s\n' "$JAUNE" "$FIN" "$1"; }
arreter()   { printf '\n  %sArrêt :%s %s\n  Corrige, puis relance le script.\n' "$ROUGE" "$FIN" "$1"; exit 1; }

DOSSIER=""
SANS_DEPENDANCES=0
for argument in "$@"; do
  case "$argument" in
    --sans-dependances) SANS_DEPENDANCES=1 ;;
    -h|--aide) sed -n '2,14p' "$0"; exit 0 ;;
    *) DOSSIER="$argument" ;;
  esac
done

est_le_depot() {
  [ -n "${1:-}" ] && [ -d "$1/.git" ] && [ -f "$1/package.json" ] &&
    git -C "$1" remote get-url origin 2>/dev/null | grep -q "drakurei/Cours-Dev-Code"
}

echo "Manabi : préparation du PC"

# --- 1. Outils ----------------------------------------------------------------
etape "Outils"
command -v git >/dev/null 2>&1 || arreter "git est introuvable. Installe-le : https://git-scm.com/downloads (macOS : xcode-select --install ; Debian/Ubuntu : sudo apt install git). Sur un PC pro, demande d'abord à la DSI, ou utilise GitHub Codespaces (docs/TRAVAILLER-PARTOUT.md)."
ok "$(git --version | sed 's/^git version /git /')"

command -v node >/dev/null 2>&1 || arreter "Node.js est introuvable. Installe Node 24 LTS : https://nodejs.org (ou avec nvm : nvm install 24). Sans droits d'installation : GitHub Codespaces."
VERSION_NODE="$(node --version | sed 's/^v//')"
MAJEURE="${VERSION_NODE%%.*}"
[ "$MAJEURE" -ge "$NODE_MINIMUM" ] 2>/dev/null || arreter "Node $VERSION_NODE est trop ancien : il faut Node $NODE_MINIMUM ou plus (24 conseillé)."
ok "node $VERSION_NODE"

# --- 2. Le repo ----------------------------------------------------------------
etape "Repo"
RACINE_SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." 2>/dev/null && pwd || true)"

if est_le_depot "$RACINE_SCRIPT"; then
  DEPOT="$RACINE_SCRIPT"
  ok "repo trouvé : $DEPOT"
else
  [ -n "$DOSSIER" ] || DOSSIER="$(pwd)/Cours-Dev-Code"
  if est_le_depot "$DOSSIER"; then
    DEPOT="$(cd "$DOSSIER" && pwd)"
    ok "repo déjà cloné : $DEPOT"
  elif [ -e "$DOSSIER" ]; then
    arreter "le dossier $DOSSIER existe déjà mais ce n'est pas le repo Manabi. Donne un autre dossier en argument."
  else
    info "clonage de $URL_DEPOT"
    info "dans $DOSSIER"
    git clone "$URL_DEPOT" "$DOSSIER" || arreter "le clonage a échoué (connexion, proxy du réseau pro ?)."
    DEPOT="$(cd "$DOSSIER" && pwd)"
    ok "repo cloné : $DEPOT"
  fi
  # Récupérer les nouveautés seulement si rien n'est en cours (jamais de perte).
  if [ -z "$(git -C "$DEPOT" status --porcelain)" ]; then
    if git -C "$DEPOT" pull --ff-only --quiet; then ok "à jour avec GitHub (git pull)"; else attention "git pull impossible pour le moment : fais-le à la main plus tard."; fi
  else
    attention "des modifications locales sont en cours : pas de git pull automatique."
  fi
fi

# --- 3. Identité Git locale ------------------------------------------------------------
etape "Identité Git (seulement pour ce repo)"
git -C "$DEPOT" config user.name "$NOM_GIT"
git -C "$DEPOT" config user.email "$EMAIL_GIT"
git -C "$DEPOT" config core.autocrlf false
# Git Credential Manager : utiliser le compte GitHub drakurei pour ce repo.
git -C "$DEPOT" config "credential.https://github.com.username" "$NOM_GIT"
ok "user.name  = $(git -C "$DEPOT" config user.name)"
ok "user.email = $(git -C "$DEPOT" config user.email)"
EMAIL_GLOBAL="$(git config --global user.email 2>/dev/null || true)"
if [ -n "$EMAIL_GLOBAL" ] && [ "$EMAIL_GLOBAL" != "$EMAIL_GIT" ]; then
  info "Ton identité globale ($EMAIL_GLOBAL) n'est pas modifiée : elle reste celle de tes autres repos."
fi

# --- 4. Dépendances ----------------------------------------------------------------------
if [ "$SANS_DEPENDANCES" -eq 1 ]; then
  etape "Dépendances (ignorées : --sans-dependances)"
else
  etape "Dépendances"
  if [ -f "$DEPOT/package-lock.json" ]; then
    (cd "$DEPOT" && npm ci) || arreter "npm ci a échoué (connexion ? proxy ?). Relis le message ci-dessus."
  else
    (cd "$DEPOT" && npm install) || arreter "npm install a échoué. Relis le message ci-dessus."
  fi
  ok "dépendances installées"
fi

# --- 5. La suite -------------------------------------------------------------------------
etape "Prêt. La suite :"
info "cd \"$DEPOT\""
info "npm run dev          puis ouvre http://localhost:4321/Cours-Dev-Code/"
info "En arrivant : git pull"
info "En partant  : git add -A && git commit -m \"ce que j'ai fait\" && git push"
info "Premier push : connecte-toi avec le compte GitHub drakurei (Git Credential Manager ou gh auth login)."
info "Guide complet : docs/TRAVAILLER-PARTOUT.md"
echo
