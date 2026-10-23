---
titre: "Prompt engineering : bien parler à une IA"
matiere: ia-seo
type: cours
chapitre: 1
niveau: debutant
duree: 10
date: 2026-08-28
source: "Cours IA & SEO — atelier prompt engineering (todo list avec validation d'email)"
tags: [ia, prompt, chatgpt, claude]
essentiel: "Un bon prompt est un brief clair : un rôle, du contexte, une consigne précise et un format de sortie, plus un ou deux exemples si besoin. Ensuite, tu itères : un seul changement par message, jusqu'au bon résultat."
retenir:
  - "Rôle, contexte, consigne, format : les quatre blocs de base d'un prompt."
  - "Des critères de réussite vérifiables : l'IA devine moins, et tu sais quand c'est réussi."
  - "Un ou deux exemples valent mieux qu'une longue explication."
  - "On itère avec un seul changement par message, en repartant du dernier résultat."
  - "Le code d'une IA se relit et se teste : elle peut se tromper avec assurance."
definitions:
  - terme: "Prompt"
    definition: "Le message (consigne et informations) que tu envoies à une IA pour obtenir une réponse."
  - terme: "Prompt engineering"
    definition: "L'art de rédiger et d'améliorer ses prompts pour obtenir des réponses fiables et directement utilisables."
  - terme: "Rôle (persona)"
    definition: "Le métier ou le point de vue que tu demandes à l'IA d'adopter, par exemple « développeur front-end senior »."
  - terme: "Contexte (prompt)"
    definition: "Les informations que l'IA ne peut pas deviner : le projet, la stack, les contraintes, le code existant."
  - terme: "Critère de réussite"
    definition: "Une condition vérifiable qui dit quand la tâche est réussie."
    exemple: "Le message d'erreur disparaît dès que l'utilisateur retape dans le champ."
  - terme: "Few-shot"
    definition: "Technique qui consiste à donner quelques exemples d'entrée et de sortie attendue dans le prompt, pour que l'IA imite le modèle."
  - terme: "Itération (prompt)"
    definition: "Améliorer la réponse d'une IA par messages successifs, en corrigeant un seul point à la fois."
  - terme: "Hallucination"
    definition: "Une réponse fausse donnée avec assurance par une IA : fonction qui n'existe pas, chiffre inventé, source imaginaire."
flashcards:
  - q: "Quels sont les quatre blocs de base d'un prompt ?"
    r: "Le rôle, le contexte, la consigne et le format de sortie."
  - q: "À quoi sert le rôle dans un prompt ?"
    r: "À fixer le niveau et le point de vue de la réponse, par exemple « développeur front-end senior »."
  - q: "Que mettre dans le contexte d'un prompt de code ?"
    r: "Le projet, la stack, les contraintes (par exemple JS natif, sans framework) et seulement le code utile."
  - q: "À quoi reconnaît-on une bonne consigne ?"
    r: "Un verbe d'action, une seule tâche et des critères de réussite vérifiables."
  - q: "Pourquoi préciser le format de sortie ?"
    r: "Pour recevoir une réponse directement utilisable : quels fichiers, dans quel ordre, avec ou sans explication."
  - q: "Qu'est-ce que le few-shot ?"
    r: "Donner un ou deux exemples d'entrée et de sortie attendue pour que l'IA reproduise le même format."
  - q: "Quelle est la règle d'or de l'itération ?"
    r: "Un seul changement par message, en repartant du dernier résultat obtenu."
  - q: "Que donner à l'IA quand le code généré plante ?"
    r: "Le message d'erreur exact, le code concerné et le comportement que tu attendais."
  - q: "Qu'est-ce qu'une hallucination ?"
    r: "Une réponse fausse donnée avec assurance, comme une méthode JavaScript qui n'existe pas."
  - q: "Pourquoi tester le code proposé par une IA ?"
    r: "Parce qu'il peut sembler juste et rater des cas limites, comme une regex d'email trop permissive."
quiz:
  - question: "Quel prompt a le plus de chances de donner un bon résultat ?"
    choix:
      - "Fais-moi une todo list."
      - "Fais-moi la meilleure todo list possible, très complète, avec plein de fonctionnalités modernes et un beau design. Sois créatif et surprends-moi."
      - "Tu es développeur front-end. Crée une todo list en HTML, CSS et JS natif, sans framework : ajout, case à cocher, suppression. Réponds avec trois blocs de code : index.html, style.css, script.js."
      - "Todo list, JS, vite."
    reponse: "Tu es développeur front-end. Crée une todo list en HTML, CSS et JS natif, sans framework : ajout, case à cocher, suppression. Réponds avec trois blocs de code : index.html, style.css, script.js."
    explication: "C'est le seul qui contient les quatre blocs : un rôle, un contexte (JS natif, sans framework), une consigne avec des critères (ajout, case à cocher, suppression) et un format de sortie."
  - question: "Tu veux que l'IA écrive des cas de test exactement au même format que les tiens. Quelle technique utilises-tu ?"
    choix:
      - "Le few-shot : tu lui montres deux ou trois exemples"
      - "Le rôle : tu écris « tu es testeur »"
      - "Tu écris le prompt en anglais"
      - "Tu demandes une réponse plus longue"
    reponse: "Le few-shot : tu lui montres deux ou trois exemples"
    explication: "Des exemples concrets montrent le format attendu bien mieux qu'une explication. Le rôle aide, mais ne fixe pas le format."
  - question: "Le résultat est presque bon, mais l'email n'est pas validé et le bouton est mal aligné. Que fais-tu ?"
    choix:
      - "Tu recommences une conversation avec le même prompt"
      - "Tu demandes une seule correction à la fois, en commençant par la validation de l'email"
      - "Tu écris « c'est nul, refais tout »"
      - "Tu acceptes le code tel quel"
    reponse: "Tu demandes une seule correction à la fois, en commençant par la validation de l'email"
    explication: "Un changement par message donne un code plus facile à relire et à tester. On commence par ce qui bloque le fonctionnement, pas par le style."
  - question: "Pourquoi écrire « JavaScript natif, sans framework » dans le contexte ?"
    choix:
      - "Pour que la réponse soit plus courte"
      - "Pour éviter que l'IA propose du React ou une librairie que tu n'utilises pas"
      - "Parce que l'IA ne connaît pas les frameworks"
      - "Ça ne change rien au résultat"
    reponse: "Pour éviter que l'IA propose du React ou une librairie que tu n'utilises pas"
    explication: "Sans cette contrainte, l'IA choisit souvent l'outil le plus répandu. Le contexte lui dit ce qu'elle ne peut pas deviner."
  - question: "L'IA te propose une regex d'email qui accepte « nom@domaine..com ». Quelle est la bonne réaction ?"
    choix:
      - "Rien : une regex écrite par une IA est forcément juste"
      - "Tu ajoutes ce cas à tes tests, puis tu demandes une correction ou tu acceptes la limite en connaissance de cause"
      - "Tu supprimes la validation"
      - "Tu changes d'IA sans rien tester"
    reponse: "Tu ajoutes ce cas à tes tests, puis tu demandes une correction ou tu acceptes la limite en connaissance de cause"
    explication: "Le code d'une IA se teste comme n'importe quel code. Une regex simple suffit souvent dans l'interface, mais il faut savoir ce qu'elle laisse passer."
  - question: "Quelle information aide le plus l'IA à corriger un bug ?"
    choix:
      - "« Ça marche pas »"
      - "Le message d'erreur exact, le code concerné et le comportement attendu"
      - "La liste de tes extensions VS Code"
      - "Une capture de ton bureau"
    reponse: "Le message d'erreur exact, le code concerné et le comportement attendu"
    explication: "L'IA ne voit pas ton écran : l'erreur exacte et le code ciblé lui donnent le vrai contexte du problème."
exercices:
  - titre: "Muscler un prompt vague"
    niveau: facile
    enonce: "Réécris le prompt « fais-moi une todo list » avec les quatre blocs : rôle, contexte, consigne et format."
    indices:
      - "Commence par « Tu es… »."
      - "Précise la stack (HTML, CSS, JS natif) et ce que la liste doit savoir faire."
      - "Termine par la forme exacte de la réponse : quels fichiers, avec ou sans explication."
    solution: |
      ```text
      Tu es un développeur front-end qui écrit du code simple et lisible.
      Contexte : exercice d'école, une seule page, HTML + CSS + JavaScript natif,
      sans framework ni librairie. Les tâches sont gardées dans un tableau todos.
      Consigne : crée une todo list qui permet d'ajouter une tâche, de la cocher
      (texte barré) et de la supprimer. Si la liste est vide, affiche
      « Aucune tâche pour le moment. ».
      Format : trois blocs de code complets, index.html, style.css, script.js,
      puis 3 lignes maximum pour expliquer comment tester.
      ```
  - titre: "Des messages de commit par l'exemple"
    niveau: moyen
    enonce: "Écris un prompt few-shot : deux exemples de messages de commit au format « type: description » (en français, courts), puis la demande pour ton nouveau changement : l'ajout d'un champ email facultatif dans la todo list."
    indices:
      - "Montre deux exemples réels, avec deux types différents (par exemple feat et chore)."
      - "Donne la règle du format en une ligne avant les exemples."
      - "Demande un seul message, sans explication."
    solution: |
      ```text
      Écris un message de commit au format « type: description »,
      en français, en minuscules, 60 caractères maximum.
      Exemples :
      - chore: squelette du module favoris
      - feat: base du moteur de recommandation (phase 1)
      Changement à décrire : ajout d'un champ email facultatif, validé
      par une regex, dans le formulaire de la todo list.
      Réponds uniquement avec le message.
      ```
      Réponse attendue, par exemple : `feat: champ email facultatif avec validation`.
  - titre: "Tester la regex avant d'itérer"
    niveau: difficile
    enonce: "Dans l'atelier, l'IA a produit `EMAIL_REGEX`. Écris un script Node qui teste six adresses (trois valides, trois invalides) et affiche OK ou ÉCHEC. Trouve une adresse invalide que la regex accepte, puis écris le prompt d'itération qui demande la correction."
    indices:
      - "Range les cas dans un tableau d'objets `{ email, attendu }`."
      - "`EMAIL_REGEX.test(email)` renvoie `true` ou `false` : compare-le à `attendu`."
      - "Essaie deux points qui se suivent dans le nom de domaine."
    solution: |
      ```js
      const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      const cas = [
        { email: 'nom@domaine.com', attendu: true },
        { email: 'jean.dupont@ecole.fr', attendu: true },
        { email: 'a@b.io', attendu: true },
        { email: 'nom@', attendu: false },
        { email: 'nom domaine.com', attendu: false },
        { email: 'nom@domaine..com', attendu: false },
      ]

      for (const { email, attendu } of cas) {
        const obtenu = EMAIL_REGEX.test(email)
        console.log(obtenu === attendu ? 'OK   ' : 'ÉCHEC', email)
      }
      // Seul « nom@domaine..com » affiche ÉCHEC : la regex l'accepte.
      ```

      Prompt d'itération :

      ```text
      Ta regex EMAIL_REGEX accepte « nom@domaine..com » (deux points
      qui se suivent). Propose une nouvelle regex qui le refuse et qui
      donne toujours le bon résultat sur les 5 autres cas de mon tableau.
      Réponds seulement avec la nouvelle ligne const EMAIL_REGEX.
      ```

      Une correction possible : `/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/`.
---

## Le rôle

:::quoi
Le **rôle** dit à l'IA quel expert elle doit être. Il fixe le niveau de la réponse et le vocabulaire employé.
:::

:::exemple
```text
Tu es un développeur front-end senior.
Tu écris du JavaScript natif simple et lisible,
pour un étudiant en Bachelor développeur.
```
:::

:::piege
Le rôle seul ne suffit pas : « Tu es un expert » sans contexte ni consigne donne une réponse générique.
:::

:::ou[Dans Manabi]
`PROMPT-COURS.md` commence par un rôle : « Tu es un pédagogue expert en développement ».
:::

## Le contexte

:::quoi
Le **contexte**, c'est tout ce que l'IA ne peut pas deviner : le projet, la stack, les contraintes et ce qui existe déjà.
:::

:::exemple
```text
Contexte : exercice d'école, une page avec index.html, style.css et script.js.
JavaScript natif uniquement : pas de framework, pas de librairie.
Les tâches sont gardées dans un tableau todos, sans localStorage.
Noms de fonctions en anglais, messages affichés en français.
```
:::

:::piege
Coller tout le projet « au cas où » noie l'information et coûte des **tokens** : donne seulement les fichiers utiles.
:::

:::ou[TP films (API TMDB)]
Préciser « HTML + SASS + JS natif en modules ES » évite que l'IA réponde avec du React.
:::

:::astuce
Si tu ne sais pas quoi mettre, termine ton prompt par : « Pose-moi d'abord les questions qui te manquent. »
:::

## La consigne

:::quoi
La **consigne** est la tâche : un verbe d'action, une seule tâche et des **critères de réussite** vérifiables.
:::

:::exemple
```text
Ajoute un champ email facultatif à côté du champ tâche.
- Email rempli mais invalide : message d'erreur sous le formulaire,
  et la tâche n'est pas ajoutée.
- Le message disparaît dès que l'utilisateur retape dans le champ.
- Un email valide s'affiche en petit sous le texte de la tâche.
```
:::

:::piege
« Améliore le formulaire » n'est pas une consigne : l'IA choisit à ta place ce qu'« améliorer » veut dire.
:::

:::ou[Atelier prompt engineering]
C'est exactement ce que fait `script.js` : `validateEmail`, `showEmailError` et `clearEmailError`.
:::

## Le format de sortie

:::quoi
Le **format** décrit la forme de la réponse : quels fichiers, dans quel ordre, quelle longueur, avec ou sans explication.
:::

:::exemple
```text
Réponds uniquement avec le code, en deux blocs :
1. script.js complet ;
2. les lignes à ajouter dans index.html, avec l'endroit où les coller.
Pas d'explication, sauf pour un choix non évident (une phrase maximum).
```
:::

:::piege
Sans format, l'IA renvoie souvent un long texte avec des morceaux de code : tu ne sais plus quoi coller où.
:::

:::ou[Dans Manabi]
Le prompt de l'Atelier impose le format exact d'un cours (frontmatter puis notions) : c'est ce qui permet au site de le valider automatiquement.
:::

## Les exemples (few-shot)

:::quoi
Donner un ou deux **exemples** d'entrée et de sortie attendue : l'IA imite le modèle. C'est le **few-shot**.
:::

:::exemple
```text
Écris des cas de test pour validateEmail, au même format que ces exemples :
validateEmail("nom@domaine.com") → { valid: true, error: null }
validateEmail("")                → { valid: false, error: "L'email est requis." }
Ajoute 5 cas : 3 adresses invalides et 2 valides.
```
:::

:::piege
Des exemples trop semblables enferment l'IA : varie-les, avec au moins un cas normal et un cas limite.
:::

:::ou[Atelier prompt engineering]
Pour faire générer les tests de la fonction `validateEmail` de `script.js`.
:::

## L'itération

:::quoi
Un premier résultat est rarement parfait. Tu **itères** : un seul changement par message, en repartant de ce que l'IA vient de produire.
:::

:::exemple
```text
Message 1 : Crée la todo list (ajout, case à cocher, suppression).
Message 2 : Ajoute le champ email facultatif avec sa validation.
Message 3 : Ajoute une section « Vérifier un email » qui réutilise validateEmail.
Message 4 : « nom@domaine..com » est accepté. Corrige EMAIL_REGEX
            et montre-moi seulement la nouvelle ligne.
```
:::

:::piege
Tout demander d'un coup (email, tri, thème sombre et sauvegarde) produit un gros bloc de code difficile à relire et à tester.
:::

:::ou[Atelier prompt engineering]
La todo list se construit par étapes : la liste, puis l'email, puis le vérificateur d'email.
:::
