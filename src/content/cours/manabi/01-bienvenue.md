---
titre: "Bienvenue dans Manabi"
matiere: manabi
type: memo
chapitre: 1
niveau: debutant
duree: 7
date: 2026-10-08
source: "Conception et code du site"
tags: ["manabi", "revision", "guide"]
essentiel: "Manabi range tes cours en notions courtes, toujours dans le même ordre : Quoi, Exemple, Piège, Où ça sert. Chaque jour, un seul bouton te dit quoi faire : la mission du jour. Tes flashcards reviennent juste avant que tu les oublies."
retenir:
  - "Un seul geste par jour suffit : le gros bouton de la mission du jour."
  - "Chaque notion suit le même ordre : Quoi, Exemple, Piège, Où ça sert."
  - "F ouvre le Mode Focus : une seule notion à l'écran, Échap pour sortir."
  - "Note chaque carte honnêtement (Raté, Dur, Bien, Facile) : elle revient juste avant que tu l'oublies."
  - "Ctrl K (⌘ K sur Mac) ou / retrouve n'importe quel cours en 3 secondes."
definitions:
  - terme: "Notion"
    definition: "Une partie d'un cours, sous un titre ##. Elle contient toujours Quoi, Exemple, Piège et Où ça sert."
  - terme: "Mode Focus"
    definition: "Affichage d'une seule notion en plein écran, sans la navigation du site. F pour l'ouvrir, Échap pour en sortir."
    exemple: "F, puis → pour passer à la notion suivante"
  - terme: "Répétition espacée"
    definition: "Revoir une information à des intervalles de plus en plus longs, juste avant de l'oublier, pour la garder longtemps."
  - terme: "FSRS"
    definition: "Free Spaced Repetition Scheduler : l'algorithme qui calcule, pour chaque carte et selon ta note, la date de sa prochaine révision."
    exemple: "Manabi l'utilise avec la bibliothèque ts-fsrs."
  - terme: "Pétales (花びら)"
    definition: "Les points gagnés en apprenant : +1 par notion vue ou carte révisée, jusqu'à +10 par cours terminé."
  - terme: "Série (連)"
    definition: "Le nombre de jours d'affilée où tu as gagné au moins un pétale sur le site."
  - terme: "Hanko (済)"
    definition: "Le tampon vermillon posé sur un cours quand tu cliques « J'ai compris ce cours ». 済 se lit sumi : terminé."
  - terme: "Ensō (円相)"
    definition: "Le cercle tracé au pinceau qui se remplit au fil de ta lecture : il montre ta progression dans un cours ou un tome."
flashcards:
  - q: "Quelles sont les 4 parties d'une notion, dans l'ordre ?"
    r: "Quoi, Exemple, Piège, Où ça sert."
  - q: "Que dit le bloc 要 en haut de chaque cours ?"
    r: "L'essentiel en 30 secondes : 1 à 3 phrases à lire avant tout le reste."
  - q: "Que propose le gros bouton de l'accueil ?"
    r: "La mission du jour : réviser tes cartes, continuer ton cours ou commencer l'épisode suivant."
  - q: "Quelle touche ouvre le Mode Focus ?"
    r: "F. Échap pour en sortir."
  - q: "À quoi servent J et K ?"
    r: "J passe à la notion suivante, K revient à la précédente."
  - q: "Comment ouvrir la recherche ?"
    r: "Ctrl K (⌘ K sur Mac) ou la touche /."
  - q: "Quelle touche affiche tous les raccourcis ?"
    r: "Le point d'interrogation : ?"
  - q: "Quelles touches servent pendant une révision de cartes ?"
    r: "Espace retourne la carte, puis 1 Raté, 2 Dur, 3 Bien ou 4 Facile."
  - q: "Pourquoi une carte revient-elle juste avant que tu l'oublies ?"
    r: "Se rappeler une chose qui s'efface demande un effort, et cet effort la grave pour plus longtemps."
  - q: "Que se passe-t-il quand tu rates une carte ?"
    r: "Elle revient quelques minutes plus tard, puis ses intervalles regrandissent à chaque réussite."
  - q: "Que veut dire le tampon 済 sur un épisode ?"
    r: "Sumi, « terminé » : tu as cliqué « J'ai compris ce cours »."
  - q: "Combien de pétales rapporte un exercice fait ?"
    r: "5 pétales. Un cours terminé en rapporte 10."
  - q: "Qu'est-ce qui garde ta série 連 en vie ?"
    r: "Au moins une action par jour, même une seule carte révisée."
quiz:
  - question: "Tu as 10 minutes et peu d'énergie. Que fais-tu en premier ?"
    choix:
      - "Tu ouvres tous les tomes pour choisir"
      - "Tu cliques sur la mission du jour"
      - "Tu relis un cours entier depuis le début"
      - "Tu crées un nouveau cours dans l'Atelier"
    reponse: "Tu cliques sur la mission du jour"
    explication: "L'accueil ne propose qu'une action principale : le gros bouton choisit pour toi la chose la plus utile maintenant."
  - question: "Pourquoi Manabi te remontre-t-il une carte juste avant que tu l'oublies ?"
    choix:
      - "Parce que les cartes reviennent au hasard"
      - "Pour que l'effort de rappel la grave plus longtemps"
      - "Parce que toutes les cartes reviennent chaque jour"
      - "Pour que tu la relises sans aucun effort"
    reponse: "Pour que l'effort de rappel la grave plus longtemps"
    explication: "C'est la répétition espacée : FSRS calcule ce moment pour chaque carte, et l'intervalle grandit à chaque réussite."
  - question: "Tu trouves la réponse d'une flashcard, mais après une longue hésitation. Quelle note choisis-tu ?"
    choix:
      - "Raté"
      - "Dur"
      - "Bien"
      - "Facile"
    reponse: "Dur"
    explication: "Dur = trouvé, mais avec peine. Une note trop haute la ferait revenir trop tard, quand tu l'auras oubliée."
  - question: "Quelle touche te fait passer à la notion suivante ?"
    choix:
      - "K"
      - "J"
      - "F"
      - "Échap"
    reponse: "J"
    explication: "J avance, K recule, F ouvre le Mode Focus et Échap en sort."
  - question: "Que veut dire le tampon vermillon 済 sur un épisode ?"
    choix:
      - "Le cours est en cours de lecture"
      - "Le cours est terminé"
      - "Le cours contient une erreur"
      - "Le cours est un brouillon"
    reponse: "Le cours est terminé"
    explication: "済 (sumi) = terminé. Il apparaît quand tu cliques « J'ai compris ce cours ». Un cours en cours montre l'ensō qui se remplit."
  - question: "Tu ouvres Manabi en navigation privée : tes pétales ont disparu. Où sont-ils ?"
    choix:
      - "Sur un serveur de Manabi"
      - "Dans ton navigateur habituel"
      - "Dans le repo GitHub"
      - "Ils sont perdus pour toujours"
    reponse: "Dans ton navigateur habituel"
    explication: "Il n'y a pas de serveur : la progression est enregistrée dans le navigateur. Pour la retrouver ailleurs, utilise la synchro Gist ou l'export (chapitre 3)."
  - question: "Comment retrouver une définition en 3 secondes ?"
    choix:
      - "Ctrl K (ou /), puis tu tapes le mot"
      - "Tu fais défiler tous les tomes"
      - "Tu appuies sur F puis Échap"
    reponse: "Ctrl K (ou /), puis tu tapes le mot"
    explication: "La recherche fouille les cours, les définitions et les actions. Le Glossaire 辞 les range aussi de A à Z."
exercices:
  - titre: "Ta première session"
    niveau: facile
    enonce: "Tu ouvres Manabi. Écris, dans l'ordre, ce que tu fais pour lire un cours notion par notion en Mode Focus, puis pour en sortir."
    indices:
      - "Un cours s'ouvre depuis Tomes 巻, ou depuis la mission du jour quand elle propose un cours."
      - "Une lettre ouvre le Mode Focus ; les flèches avancent et reculent."
      - "Pour sortir, c'est la touche tout en haut à gauche du clavier."
    solution: |
      ```text
      1. Ouvre un cours : Tomes 巻, ou la mission du jour
      2. F      → ouvre le Mode Focus
      3. →      → notion suivante (← pour revenir)
      4. Échap  → sort du Mode Focus
      ```
  - titre: "Compte tes pétales"
    niveau: moyen
    enonce: "Aujourd'hui, tu as vu 5 notions, révisé 12 cartes, bien répondu à 3 questions de quiz, fait 1 exercice et terminé le cours. Combien de pétales as-tu gagnés ? Écris le calcul en JavaScript."
    indices:
      - "Notion vue +1, carte révisée +1, bonne réponse au quiz +2."
      - "Exercice fait +5, cours terminé +10."
      - "Multiplie chaque nombre par son barème, puis additionne tout."
    solution: |
      ```js
      const petales =
        5 * 1 +   // notions vues
        12 * 1 +  // cartes révisées
        3 * 2 +   // bonnes réponses au quiz
        1 * 5 +   // exercice fait
        10        // cours terminé
      console.log(petales) // 38
      ```
  - titre: "Une question de quiz valide"
    niveau: difficile
    enonce: "Écris en YAML une question de quiz sur la touche J, avec 3 choix, la bonne réponse et une explication. Le site doit l'accepter sans erreur."
    indices:
      - "4 champs : question, choix, reponse, explication."
      - "reponse doit être le texte EXACT d'un des choix : copie-colle-le."
      - "Mets chaque texte entre guillemets doubles et indente avec 2 espaces, jamais avec une tabulation."
    solution: |
      ```yaml
      quiz:
        - question: "Que fait la touche J dans un cours ?"
          choix:
            - "Elle passe à la notion suivante"
            - "Elle ouvre le Mode Focus"
            - "Elle revient à la notion précédente"
          reponse: "Elle passe à la notion suivante"
          explication: "J avance, K recule, F ouvre le Mode Focus."
      ```
---

## La mission du jour

:::quoi
L'accueil **Aujourd'hui** (今) ne propose qu'**une action principale** : le gros bouton de la **mission du jour**.
:::

:::exemple
```text
今 Aujourd'hui · こんにちは, Jonathan · série 連 : 4 jours

Mission du jour : un seul bouton, la plus utile de ces 3 missions
  → Réviser 12 cartes · environ 5 min
  → Continuer le cours en cours
  → Commencer le prochain épisode
```
:::

:::piege
Fouiller les tomes avant de commencer : tu te disperses. Clique d'abord sur la **mission du jour**.
:::

:::ou[Dans Manabi]
La page d'accueil. Sur la même page, le **minuteur** rapide (10, 15 ou 25 min) garde ta session courte.
:::

## Une notion, toujours la même structure

:::quoi
Chaque cours s'ouvre sur **L'essentiel en 30 s** (要). Puis chaque **notion** suit le même ordre : Quoi (何), Exemple (例), Piège (罠), Où ça sert (場).
:::

:::exemple
```text
要 L'essentiel en 30 s   useState crée un état.

Réagir à un clic
  何 Quoi         Un événement reçoit une fonction.
  例 Exemple      <button onClick={direBonjour}>Clique</button>
  罠 Piège        onClick={direBonjour()} l'exécute tout de suite.
  場 Où ça sert   Le bouton « J'aime » de chaque article.
```
:::

:::piege
Sauter le **Piège** parce que tu as compris l'exemple : c'est justement l'erreur que tu feras en codant.
:::

:::ou[Dans Manabi]
Tous les cours de tous les tomes. Sur grand écran, le sommaire à droite liste les notions, et celles que tu as vues sont mémorisées.
:::

## Le Mode Focus

:::quoi
Le **Mode Focus** affiche le cours **une notion à la fois**, en plein écran, de L'essentiel jusqu'à la fin du cours.
:::

:::exemple
```text
F             ouvrir le Mode Focus (ou son bouton dans le cours)
→  ou  J      notion suivante
←  ou  K      notion précédente
Échap ou F    sortir du Mode Focus
Sur téléphone : glisse la page vers la gauche ou vers la droite.
```
:::

:::piege
En Mode Focus, la navigation du site **disparaît** : c'est voulu, pas un bug. **Échap** la fait revenir.
:::

:::ou[Dans Manabi]
Dans chaque cours. Idéal quand tu sens que tu décroches : une notion à la fois, et des points qui montrent où tu en es.
:::

## Les flashcards et la répétition espacée

:::quoi
Une **flashcard** pose une question : tu réponds **dans ta tête**, tu la retournes, puis tu te notes en une touche. La **répétition espacée** la remontre juste avant que tu l'oublies.
:::

:::exemple
```text
Espace   retourne la carte
1 Raté · 2 Dur · 3 Bien · 4 Facile
Chaque bouton affiche son délai.

Notée « Bien » à chaque fois,
elle revient dans :
10 min → 2 j → 11 j → 2 mois → 5 mois
Ratée : elle revient dans la session.
```
:::

:::piege
Mettre **Bien** à une carte où tu as hésité : elle reviendra trop tard, quand tu l'auras oubliée. **Sois honnête**.
:::

:::ou[Dans Manabi]
**Réviser** (復), onglet **Cartes** : la session du jour, 15 cartes au plus (réglable dans Réglages). Le badge à côté de Réviser dit combien de cartes t'attendent.
:::

:::info
**Pourquoi juste avant d'oublier ?** Se rappeler une chose qui s'efface demande un effort, et cet effort la grave plus longtemps.

- Trop tôt : du temps perdu.
- Trop tard : tu réapprends de zéro.
- **FSRS** calcule ce moment pour chaque carte, d'après tes notes.
:::

## Le quiz et les exercices

:::quoi
Le **quiz** (問) est un QCM **corrigé tout de suite**. Les **exercices** (練) dévoilent leurs **indices un par un**, puis la solution.
:::

:::exemple
```text
練 Exercice 1 · facile · « Un compteur »
   Énoncé              Crée un bouton qui affiche le nombre de clics.
   Voir l'indice 1/2   Il te faut un état qui commence à 0.
   Voir l'indice 2/2   Dans onClick, appelle setCompte(compte + 1).
   Voir la solution    à ouvrir en dernier
   Je l'ai fait        +5 pétales
```
:::

:::piege
Ouvrir la solution tout de suite : tu la reconnaîtras, mais tu ne sauras pas la refaire. Cherche d'abord.
:::

:::ou[Dans Manabi]
En bas de chaque cours. Dans **Réviser** (復), l'onglet **Quiz éclair** tire 10 questions au hasard. Au clavier : 1 à 4 pour choisir, Entrée pour valider.
:::

## Pétales, série et hanko

:::quoi
Tu gagnes des **pétales** (花びら) en apprenant. La **série** (連) compte tes jours d'affilée, et le **hanko** (済) tamponne un cours terminé.
:::

:::exemple
```text
Notion vue                  +1 pétale
Carte révisée               +1
Bonne réponse au quiz       +2
Exercice fait               +5
Cours terminé (hanko 済)    +10
```
:::

:::piege
Tout est enregistré dans **ce navigateur** : ailleurs, tu repars de zéro, sauf si tu [synchronises ta progression](/cours/manabi/03-travailler-partout/).
:::

:::ou[Dans Manabi]
L'accueil affiche ta série : un jour sans action la remet à zéro, mais ton record et tes pétales restent. Dans un tome, un épisode en cours montre l'**ensō**, un épisode terminé le **hanko**.
:::

## Tout retrouver au clavier

:::quoi
**Ctrl K** (⌘ K sur Mac) ou **/** ouvre la **recherche** : cours, définitions et actions (réviser, changer de thème, lancer le minuteur).
:::

:::exemple
```text
Ctrl K  ou  /    rechercher (⌘ K sur Mac)
?                afficher tous les raccourcis
F                Mode Focus
J                notion suivante
K                notion précédente
Échap            fermer, ou sortir du Mode Focus
```
:::

:::piege
Confondre J et K : **J** avance (notion suivante), **K** recule (notion précédente).
:::

:::ou[Dans Manabi]
Partout sur le site. Le **Glossaire** (辞) range aussi toutes les définitions de A à Z, avec un filtre instantané.
:::

:::astuce
Les raccourcis se taisent pendant que tu écris dans un champ de texte : c'est voulu, pour que tu puisses taper « / » ou « j ».
:::
