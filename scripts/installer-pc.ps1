<#
.SYNOPSIS
  Prépare un PC Windows pour coder Manabi (repo drakurei/Cours-Dev-Code).

.DESCRIPTION
  1. Vérifie git et Node.js (22 ou plus, 24 conseillé) et explique comment les installer s'ils manquent.
  2. Clone le repo s'il n'est pas déjà là.
  3. Règle l'identité Git LOCALE au repo : drakurei + e-mail no-reply GitHub.
     L'identité globale du PC (celle du travail sur un PC pro) n'est jamais modifiée.
  4. Installe les dépendances (npm ci).
  Rien de destructif : le script peut être relancé autant de fois que nécessaire.

.PARAMETER Dossier
  Où cloner le repo s'il n'est pas déjà là. Par défaut : .\Cours-Dev-Code (dans le dossier courant).
  Conseil pour un PC pro : un chemin simple, sans & ni emoji (ex. C:\Users\<toi>\Projets\Cours-Dev-Code).

.PARAMETER SansDependances
  Ne lance pas npm ci (utile pour seulement régler l'identité Git).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\installer-pc.ps1

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File installer-pc.ps1 -Dossier "C:\Users\moi\Projets\Cours-Dev-Code"
#>
[CmdletBinding()]
param(
  [string]$Dossier,
  [switch]$SansDependances
)

# Les commandes externes (git, npm) sont vérifiées une par une avec $LASTEXITCODE.
$ErrorActionPreference = 'Continue'

$UrlDepot = 'https://github.com/drakurei/Cours-Dev-Code.git'
$NomGit = 'drakurei'
$EmailGit = '229352063+drakurei@users.noreply.github.com'
$NodeMinimum = 22

function Write-Etape([string]$Texte) { Write-Host ''; Write-Host "== $Texte" -ForegroundColor Cyan }
function Write-Ok([string]$Texte) { Write-Host "  ok   $Texte" -ForegroundColor Green }
function Write-Info([string]$Texte) { Write-Host "       $Texte" }
function Write-Attention([string]$Texte) { Write-Host "  !    $Texte" -ForegroundColor Yellow }
function Stop-Installation([string]$Texte) {
  Write-Host ''
  Write-Host "  Arrêt : $Texte" -ForegroundColor Red
  Write-Host '  Rien n''a été modifié après cette étape. Corrige, puis relance le script.'
  exit 1
}

function Test-DepotManabi([string]$Chemin) {
  if (-not $Chemin -or -not (Test-Path -LiteralPath (Join-Path $Chemin '.git'))) { return $false }
  if (-not (Test-Path -LiteralPath (Join-Path $Chemin 'package.json'))) { return $false }
  $origine = git -C $Chemin remote get-url origin
  return ($LASTEXITCODE -eq 0) -and ("$origine" -match 'drakurei/Cours-Dev-Code')
}

Write-Host 'Manabi : préparation du PC' -ForegroundColor White

# --- 1. Outils ----------------------------------------------------------------
Write-Etape 'Outils'

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Stop-Installation ("git est introuvable. Installe Git for Windows : https://git-scm.com/download/win " +
    "(ou, dans un terminal : winget install --id Git.Git -e). Sur un PC pro, demande d'abord à la DSI, " +
    "ou travaille dans GitHub Codespaces (docs/TRAVAILLER-PARTOUT.md).")
}
Write-Ok ((git --version) -replace '^git version ', 'git ')

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Stop-Installation ("Node.js est introuvable. Installe Node 24 LTS : https://nodejs.org " +
    "(ou : winget install --id OpenJS.NodeJS.LTS -e), puis ouvre un nouveau terminal. " +
    "Sur un PC pro sans droits d'installation : GitHub Codespaces (docs/TRAVAILLER-PARTOUT.md).")
}
$versionNode = "$(node --version)".TrimStart('v')
$majeure = 0
[void][int]::TryParse($versionNode.Split('.')[0], [ref]$majeure)
if ($majeure -lt $NodeMinimum) {
  Stop-Installation "Node $versionNode est trop ancien : il faut Node $NodeMinimum ou plus (24 conseillé, https://nodejs.org)."
}
Write-Ok "node $versionNode"

# --- 2. Le repo ----------------------------------------------------------------
Write-Etape 'Repo'

$depot = $null
$racineDuScript = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { $null }

if (Test-DepotManabi $racineDuScript) {
  $depot = $racineDuScript
  Write-Ok "repo trouvé : $depot"
} else {
  if (-not $Dossier) { $Dossier = Join-Path (Get-Location).Path 'Cours-Dev-Code' }
  if (Test-DepotManabi $Dossier) {
    $depot = (Resolve-Path -LiteralPath $Dossier).Path
    Write-Ok "repo déjà cloné : $depot"
  } elseif (Test-Path -LiteralPath $Dossier) {
    Stop-Installation "le dossier $Dossier existe déjà mais ce n'est pas le repo Manabi. Choisis un autre dossier avec -Dossier."
  } else {
    Write-Info "clonage de $UrlDepot"
    Write-Info "dans $Dossier"
    git clone $UrlDepot $Dossier
    if ($LASTEXITCODE -ne 0) { Stop-Installation 'le clonage a échoué (connexion, proxy du réseau pro ?).' }
    $depot = (Resolve-Path -LiteralPath $Dossier).Path
    Write-Ok "repo cloné : $depot"
  }

  # Déjà là : on récupère les nouveautés seulement si rien n'est en cours (jamais de perte).
  $modifications = git -C $depot status --porcelain
  if ([string]::IsNullOrWhiteSpace("$modifications")) {
    git -C $depot pull --ff-only --quiet
    if ($LASTEXITCODE -eq 0) { Write-Ok 'à jour avec GitHub (git pull)' }
    else { Write-Attention 'git pull impossible pour le moment : fais-le à la main plus tard.' }
  } else {
    Write-Attention 'des modifications locales sont en cours : pas de git pull automatique.'
  }
}

if ($depot.Contains('&') -or $depot -match '[\uD800-\uDBFF]') {
  Write-Attention 'le chemin contient & ou un emoji : « npm run » peut échouer avec cmd.exe.'
  Write-Info 'Solution simple : un dossier sans caractères spéciaux. Sinon, faire passer npm par Git Bash :'
  Write-Info 'npm config set script-shell "C:\Program Files\Git\bin\bash.exe"'
}

# --- 3. Identité Git locale ----------------------------------------------------------
Write-Etape 'Identité Git (seulement pour ce repo)'

git -C $depot config user.name $NomGit
git -C $depot config user.email $EmailGit
git -C $depot config core.autocrlf false
# Git Credential Manager : utiliser le compte GitHub drakurei pour ce repo (même si le PC en connaît un autre).
git -C $depot config 'credential.https://github.com.username' $NomGit
if ($LASTEXITCODE -ne 0) { Stop-Installation "impossible d'écrire la configuration Git du repo." }

Write-Ok "user.name  = $(git -C $depot config user.name)"
Write-Ok "user.email = $(git -C $depot config user.email)"
$emailGlobal = "$(git config --global user.email)"
if ($emailGlobal -and $emailGlobal -ne $EmailGit) {
  Write-Info "Ton identité globale ($emailGlobal) n'est pas modifiée : elle reste celle de tes autres repos."
}

# --- 4. Dépendances ----------------------------------------------------------------------
if ($SansDependances) {
  Write-Etape 'Dépendances (ignorées : -SansDependances)'
} else {
  Write-Etape 'Dépendances'
  Push-Location -LiteralPath $depot
  if (Test-Path -LiteralPath 'package-lock.json') { npm ci } else { npm install }
  $codeNpm = $LASTEXITCODE
  Pop-Location
  if ($codeNpm -ne 0) { Stop-Installation 'npm a échoué (connexion ? proxy ? droits ?). Relis le message ci-dessus.' }
  Write-Ok 'dépendances installées'
}

# --- 5. La suite -------------------------------------------------------------------------
Write-Etape 'Prêt. La suite :'
Write-Info "cd `"$depot`""
Write-Info 'npm run dev          puis ouvre http://localhost:4321/Cours-Dev-Code/'
Write-Info 'En arrivant : git pull'
Write-Info 'En partant  : git add -A ; git commit -m "ce que j''ai fait" ; git push'
Write-Info 'Premier push : une fenêtre GitHub s''ouvre (Git Credential Manager) : connecte-toi avec le compte drakurei.'
Write-Info 'Guide complet : docs/TRAVAILLER-PARTOUT.md'
Write-Host ''
