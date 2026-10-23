---
titre: "Les tokens : comment une IA compte ton texte"
matiere: ia-seo
type: cours
chapitre: 2
niveau: debutant
duree: 9
date: 2026-08-28
source: "Cours IA & SEO — atelier prompt engineering (notion de token)"
tags: [ia, tokens, api, cout]
essentiel: "Une IA ne lit pas des mots mais des tokens, de petits morceaux de texte. Tout se compte en tokens : ce que tu envoies (l'entrée), ce qu'elle répond (la sortie), sa limite de mémoire (la fenêtre de contexte) et le prix."
retenir:
  - "Un token est un morceau de texte : une partie de mot, un mot court ou un signe."
  - "Repère pour l'anglais : 1 token fait environ 4 caractères ; le français et le code en consomment plus."
  - "On paie l'entrée et la sortie, et la sortie coûte plus cher par token."
  - "La fenêtre de contexte limite l'entrée et la sortie réunies."
  - "À chaque message, le modèle relit tout l'historique : une longue conversation coûte de plus en plus cher."
definitions:
  - terme: "Token"
    definition: "Petit morceau de texte (partie de mot, mot court, espace ou signe) que le modèle lit et écrit. C'est l'unité de calcul et de facturation des IA."
  - terme: "Tokenizer"
    definition: "L'outil qui découpe un texte en tokens. Chaque famille de modèles a le sien : le même texte ne donne pas le même nombre de tokens partout."
  - terme: "Tokens d'entrée"
    definition: "Tout ce que le modèle reçoit : instructions, historique de la conversation, fichiers joints et ta question."
  - terme: "Tokens de sortie"
    definition: "Les tokens que le modèle génère pour répondre."
  - terme: "Fenêtre de contexte"
    definition: "Le nombre maximal de tokens que le modèle peut traiter en une fois, entrée et sortie comprises."
  - terme: "max_tokens"
    definition: "Paramètre d'API qui fixe la longueur maximale de la réponse, en tokens. S'il est atteint, la réponse est coupée."
    exemple: "max_tokens: 16000"
  - terme: "MTok"
    definition: "Un million de tokens : l'unité des grilles de prix des API."
flashcards:
  - q: "Qu'est-ce qu'un token ?"
    r: "Un petit morceau de texte (partie de mot, mot court, signe) : l'unité que le modèle lit, écrit et facture."
  - q: "Combien de caractères fait un token, en moyenne ?"
    r: "Environ 4 caractères en anglais. Le français et le code en demandent souvent plus pour le même contenu."
  - q: "Que contiennent les tokens d'entrée ?"
    r: "Les instructions, tout l'historique de la conversation, les fichiers joints et ta question."
  - q: "Pourquoi une longue conversation coûte-t-elle de plus en plus cher ?"
    r: "Parce que tout l'historique est renvoyé au modèle à chaque nouveau message."
  - q: "Qu'est-ce que la fenêtre de contexte ?"
    r: "La limite de tokens que le modèle peut traiter en une fois, entrée et sortie comprises."
  - q: "Que se passe-t-il quand la réponse atteint max_tokens ?"
    r: "Elle est coupée, et l'API renvoie stop_reason égal à max_tokens."
  - q: "Entrée ou sortie : laquelle coûte le plus cher par token ?"
    r: "La sortie, chez la plupart des fournisseurs."
  - q: "Comment calcule-t-on le coût d'un appel d'API ?"
    r: "(tokens d'entrée × prix d'entrée + tokens de sortie × prix de sortie) ÷ 1 000 000, avec des prix au million de tokens."
  - q: "Comment connaître le nombre exact de tokens pour Claude ?"
    r: "Avec l'endpoint de comptage de l'API (client.messages.countTokens dans le SDK JS), pas avec une règle de calcul."
  - q: "Cite trois façons d'économiser des tokens."
    r: "Ne coller que le code utile, demander une réponse courte, ouvrir une nouvelle conversation par tâche."
quiz:
  - question: "Un texte anglais de 2 000 caractères fait environ…"
    choix:
      - "50 tokens"
      - "500 tokens"
      - "2 000 tokens"
      - "8 000 tokens"
    reponse: "500 tokens"
    explication: "Repère : 1 token fait environ 4 caractères en anglais, donc 2 000 ÷ 4 = 500. En français, compte un peu plus."
  - question: "Qu'est-ce qui compte dans les tokens d'entrée ?"
    choix:
      - "Seulement ta dernière question"
      - "Ta question et la dernière réponse uniquement"
      - "Tout ce qui est envoyé : instructions, historique, fichiers et question"
      - "Rien : l'entrée est gratuite"
    reponse: "Tout ce qui est envoyé : instructions, historique, fichiers et question"
    explication: "Le modèle ne garde rien entre deux appels : on lui renvoie tout à chaque fois, et tout est compté."
  - question: "La réponse de l'API s'arrête au milieu d'une phrase, avec stop_reason égal à max_tokens. Pourquoi ?"
    choix:
      - "Le modèle a planté"
      - "La limite de tokens de sortie demandée a été atteinte"
      - "La clé API n'est pas valide"
      - "La fenêtre de contexte est vide"
    reponse: "La limite de tokens de sortie demandée a été atteinte"
    explication: "max_tokens plafonne la réponse. Augmente-le, ou demande une réponse plus courte ou en plusieurs parties."
  - question: "Pourquoi le même texte peut-il donner un nombre de tokens différent selon l'IA ?"
    choix:
      - "Parce que chaque famille de modèles a son propre tokenizer"
      - "Parce que le nombre de tokens change selon l'heure"
      - "Parce que certaines IA comptent en phrases"
      - "C'est impossible : c'est toujours le même nombre"
    reponse: "Parce que chaque famille de modèles a son propre tokenizer"
    explication: "Le découpage dépend du tokenizer. C'est pourquoi la règle des 4 caractères n'est qu'une estimation."
  - question: "Ta conversation est très longue et l'IA oublie des consignes du début. Que fais-tu ?"
    choix:
      - "Tu continues en écrivant en majuscules"
      - "Tu ouvres une nouvelle conversation avec un résumé des décisions et le code utile"
      - "Tu recolles tout le projet dans le même fil"
      - "Tu augmentes max_tokens"
    reponse: "Tu ouvres une nouvelle conversation avec un résumé des décisions et le code utile"
    explication: "Un historique trop long noie les consignes et coûte cher. Un résumé court remet l'essentiel en avant."
  - question: "Avec des prix d'exemple de 2 $ par million de tokens en entrée et 10 $ en sortie, combien coûte un appel de 100 000 tokens d'entrée et 10 000 de sortie ?"
    choix:
      - "0,03 $"
      - "0,30 $"
      - "3,00 $"
      - "30 $"
    reponse: "0,30 $"
    explication: "100 000 × 2 ÷ 1 000 000 = 0,20 $ en entrée, 10 000 × 10 ÷ 1 000 000 = 0,10 $ en sortie, soit 0,30 $."
exercices:
  - titre: "Estimer avant d'envoyer"
    niveau: facile
    enonce: "Tu veux coller un fichier script.js de 6 000 caractères dans une IA. Estime son nombre de tokens avec le repère des 4 caractères. Ton estimation est-elle plutôt trop haute ou trop basse pour du code commenté en français ?"
    indices:
      - "Divise le nombre de caractères par 4."
      - "Le repère vaut pour de l'anglais courant."
      - "Le code (symboles, indentation) et le français se découpent en plus de morceaux."
    solution: |
      ```js
      const caracteres = 6000
      console.log(Math.ceil(caracteres / 4)) // 1500
      ```
      Environ **1 500 tokens**. L'estimation est plutôt **trop basse** : le code et le français consomment plus de tokens. Pour le chiffre exact avec Claude, utilise le comptage de l'API.
  - titre: "Une fonction coutAppel"
    niveau: moyen
    enonce: "Écris coutAppel(tokensEntree, tokensSortie, prixEntree, prixSortie), avec des prix en dollars par million de tokens. Calcule le coût de 12 000 tokens d'entrée et 1 500 de sortie, à 2 $ et 10 $ (prix d'exemple)."
    indices:
      - "Multiplie chaque nombre de tokens par son prix."
      - "Divise la somme par 1 000 000, car les prix sont au million."
      - "toFixed(4) affiche 4 chiffres après la virgule."
    solution: |
      ```js
      function coutAppel(tokensEntree, tokensSortie, prixEntree, prixSortie) {
        return (tokensEntree * prixEntree + tokensSortie * prixSortie) / 1_000_000
      }

      console.log(coutAppel(12_000, 1_500, 2, 10).toFixed(4)) // "0.0390"
      ```
      24 000 + 15 000 = 39 000, divisé par 1 000 000 : **0,039 $** par appel.
  - titre: "Le coût caché des longues conversations"
    niveau: difficile
    enonce: "Chaque échange ajoute 500 tokens de question et 500 tokens de réponse, et le modèle relit tout l'historique à chaque message. Écris une boucle qui calcule le total des tokens d'entrée sur 10 échanges dans la même conversation, puis compare avec 10 conversations séparées d'un seul échange."
    indices:
      - "Garde une variable historique qui grossit après chaque échange."
      - "L'entrée d'un échange = l'historique + la nouvelle question."
      - "Après l'échange, l'historique = cette entrée + la réponse."
    solution: |
      ```js
      const parQuestion = 500
      const parReponse = 500
      let historique = 0
      let totalEntree = 0

      for (let echange = 1; echange <= 10; echange++) {
        const entree = historique + parQuestion
        totalEntree += entree
        historique = entree + parReponse
      }

      console.log(totalEntree)      // 50000
      console.log(10 * parQuestion) // 5000 avec 10 conversations séparées
      ```
      Même travail, **10 fois plus de tokens d'entrée** dans une seule longue conversation. D'où la règle : une conversation par tâche.
---

## Un token, c'est quoi ?

:::quoi
Un **token** est un petit morceau de texte : une partie de mot, un mot court, un espace ou un signe. Le modèle lit et écrit token par token.
:::

:::exemple
```js
// Estimation rapide : environ 4 caractères par token (repère pour l'anglais)
function estimerTokens(texte) {
  return Math.ceil(texte.length / 4)
}

console.log(estimerTokens('Ajoute un champ email à la todo list')) // 9
```
:::

:::piege
Ce n'est qu'un **repère** : le français, le code et les caractères spéciaux coûtent plus. Seul le **tokenizer** du modèle donne le chiffre exact.
:::

:::ou[Atelier prompt engineering]
Le fichier `token.md` de l'atelier est resté vide : ce cours le complète. C'est la notion qui explique pourquoi un prompt court et ciblé est meilleur.
:::

## Entrée et sortie

:::quoi
Les **tokens d'entrée** sont tout ce que le modèle reçoit ; les **tokens de sortie** sont sa réponse. L'API renvoie les deux compteurs dans `usage`.
:::

:::exemple
```json
{
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 2095,
    "output_tokens": 503
  }
}
```
:::

:::piege
L'entrée ne se limite pas à ta question : les instructions, l'historique et les fichiers joints comptent aussi.
:::

:::ou[Dans Manabi]
Le mode Automatique de l'Atelier appelle l'API Claude : ta source (PDF, images, texte) est l'entrée, le cours généré est la sortie.
:::

## La limite de réponse : max_tokens

:::quoi
**max_tokens** fixe la longueur maximale de la réponse. Si elle est atteinte, la réponse est **coupée** et `stop_reason` vaut `max_tokens`.
:::

:::exemple
```js
const reponse = await client.messages.create({
  model: 'claude-sonnet-5-5',
  max_tokens: 16000,
  messages: [{ role: 'user', content: 'Transforme ce texte en cours…' }],
})
if (reponse.stop_reason === 'max_tokens') {
  console.warn('Réponse coupée : augmente max_tokens ou demande plus court.')
}
```
:::

:::piege
Un cours coupé au milieu du YAML ne passera pas la validation : vérifie toujours `stop_reason` avant d'utiliser la réponse.
:::

:::ou[Dans Manabi]
Le modèle par défaut des réglages IA est `claude-sonnet-5-5` ; un long PDF demande un `max_tokens` assez grand pour tout le cours.
:::

## La fenêtre de contexte

:::quoi
La **fenêtre de contexte** est le nombre maximal de tokens que le modèle peut traiter en une fois. L'entrée **et** la sortie doivent y tenir.
:::

:::exemple
```js
const fenetre = 200_000    // fenêtre du modèle (valeur d'exemple)
const historique = 185_000 // tokens déjà dans la conversation
const maxTokens = 20_000   // réponse demandée

console.log(historique + maxTokens <= fenetre) // false : ça déborde
```
:::

:::piege
Même sans dépasser la limite, un contexte très long dilue l'attention : l'IA peut « oublier » une consigne donnée au début.
:::

:::ou[Avec Claude Code]
`/compact` résume la conversation pour libérer de la place, `/clear` repart de zéro pour une nouvelle tâche.
:::

## Le coût

:::quoi
Les API facturent au **million de tokens** (MTok), avec un prix pour l'entrée et un prix plus élevé pour la sortie.
:::

:::exemple
```js
const prix = { entree: 2, sortie: 10 } // $ par million de tokens (prix d'exemple)
const usage = { input_tokens: 2095, output_tokens: 503 }

const cout = (usage.input_tokens * prix.entree + usage.output_tokens * prix.sortie) / 1_000_000
console.log(cout.toFixed(4)) // "0.0092" dollar
```
:::

:::piege
Les prix changent et dépendent du modèle : vérifie toujours la page des tarifs du fournisseur avant de chiffrer un projet.
:::

:::ou[Dans Manabi]
Pour l'Atelier, une clé API avec un **plafond de dépenses** : tu sais à l'avance combien tu peux dépenser au maximum.
:::

:::info
Les modèles qui « réfléchissent » avant de répondre produisent aussi des tokens de réflexion : ils sont facturés comme de la sortie.
:::

## Économiser des tokens

:::quoi
Moins de tokens inutiles, c'est une réponse moins chère, plus rapide et souvent **plus juste**, car l'IA se concentre sur l'essentiel.
:::

:::exemple
```text
Voici seulement la fonction validateEmail et l'erreur affichée.
Corrige le bug. Réponds uniquement avec la fonction corrigée,
sans réexpliquer le reste du fichier.
```
:::

:::piege
Recoller tout le projet à chaque message multiplie le coût, sans rendre la réponse meilleure.
:::

:::ou[TP films (API TMDB)]
Une nouvelle conversation par fonctionnalité (favoris, scoring, filtres), avec seulement les fichiers concernés.
:::
