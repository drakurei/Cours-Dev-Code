---
titre: "Stratégie de mots-clés : de la recherche aux pages"
matiere: ia-seo
type: cours
chapitre: 5
niveau: intermediaire
duree: 12
date: 2026-08-24
source: "Atelier SEO — stratégie de mots-clés d'un site de services informatiques (TP) et TP dépôt-vente (étape 4)"
tags: [seo, mots-cles, intention, longue-traine, contenu]
essentiel: "Une stratégie de mots-clés part de ce que les gens tapent vraiment. Pour chaque requête : son intention, sa traîne, son volume et sa difficulté, puis une priorité. Enfin, chaque mot-clé principal reçoit une seule page, rangée dans un cocon de pages liées entre elles."
retenir:
  - "Quatre intentions : informationnelle, navigationnelle, commerciale, transactionnelle."
  - "La longue traîne a moins de volume mais une intention précise : c'est là qu'un site jeune gagne en premier."
  - "Les volumes et difficultés sans outil payant sont des estimations, à vérifier dans Keyword Planner et la Search Console."
  - "Un score de priorité combine volume (en logarithme), accessibilité et pertinence business."
  - "Un mot-clé principal = une seule page ; deux pages sur le même mot-clé se cannibalisent."
definitions:
  - terme: "Mot-clé (requête)"
    definition: "Les mots qu'un internaute tape dans un moteur de recherche."
  - terme: "Intention de recherche"
    definition: "Ce que l'internaute veut vraiment : comprendre (informationnelle), aller sur un site (navigationnelle), comparer (commerciale) ou agir (transactionnelle)."
  - terme: "Courte traîne"
    definition: "Requête courte et générale (1 ou 2 mots) : beaucoup de volume, beaucoup de concurrence, intention floue."
    exemple: "numérique responsable"
  - terme: "Longue traîne"
    definition: "Requête précise, souvent de 3 mots ou plus : peu de volume chacune, mais moins de concurrence et une meilleure conversion."
    exemple: "audit écoconception site web"
  - terme: "Volume de recherche"
    definition: "Le nombre moyen de recherches mensuelles d'une requête, dans un pays donné."
  - terme: "Difficulté SEO"
    definition: "Un score de 0 à 100, estimé par les outils, de l'effort nécessaire pour se classer en première page sur une requête."
  - terme: "Cocon sémantique"
    definition: "Un groupe de pages sur un même thème : une page pilier et des pages satellites, reliées entre elles par des liens internes."
  - terme: "Cannibalisation"
    definition: "Quand deux pages d'un même site visent le même mot-clé et se font concurrence dans les résultats."
flashcards:
  - q: "Quelles sont les quatre intentions de recherche ?"
    r: "Informationnelle (comprendre), navigationnelle (aller sur un site), commerciale (comparer) et transactionnelle (agir)."
  - q: "Quelle intention derrière « formation écoconception web » ?"
    r: "Transactionnelle : la personne cherche une formation à suivre, donc une offre."
  - q: "Courte traîne ou longue traîne pour un site jeune ?"
    r: "La longue traîne d'abord : moins de concurrence et une intention précise. La courte traîne viendra avec l'autorité."
  - q: "Le nombre de mots suffit-il à définir la longue traîne ?"
    r: "Non, c'est un repère. Ce qui compte : une requête précise, à faible volume, avec une intention claire."
  - q: "Où trouver de nouvelles idées de mots-clés ?"
    r: "Les mots du site, les synonymes et variantes, l'autocomplétion de Google, « Autres questions posées » et le vocabulaire du secteur."
  - q: "Quel outil gratuit donne des volumes de recherche ?"
    r: "Google Keyword Planner, avec un compte Google Ads."
  - q: "Que donne la Search Console que les autres outils ne donnent pas ?"
    r: "Les données réelles du site : impressions, clics, taux de clic et position moyenne par requête."
  - q: "Comment se calcule le score de priorité du TP ?"
    r: "50 % volume (en logarithme) + 25 % accessibilité (100 − difficulté) + 25 % pertinence business, sur 100."
  - q: "Pourquoi un logarithme sur le volume ?"
    r: "Pour que le plus gros mot-clé n'écrase pas tous les autres : passer de 10 à 100 recherches compte autant que de 1 000 à 10 000."
  - q: "Qu'est-ce que la cannibalisation ?"
    r: "Deux pages du même site qui visent le même mot-clé et se font concurrence. On garde une seule page cible."
quiz:
  - question: "Quelle est l'intention de la requête « comment réduire l'empreinte carbone de son site web » ?"
    choix:
      - "Informationnelle"
      - "Navigationnelle"
      - "Transactionnelle"
      - "De marque"
    reponse: "Informationnelle"
    explication: "« Comment » signale que la personne veut comprendre. On y répond avec un guide, qui peut ensuite mener vers une offre d'audit."
  - question: "Pourquoi viser d'abord la longue traîne sur un site récent ?"
    choix:
      - "Parce qu'elle a plus de volume"
      - "Parce qu'elle est moins concurrencée et que l'intention est précise"
      - "Parce que Google ne classe pas les requêtes courtes"
      - "Parce qu'elle ne demande aucun contenu"
    reponse: "Parce qu'elle est moins concurrencée et que l'intention est précise"
    explication: "Sans autorité, un site jeune ne passe pas devant les grands sites sur les requêtes courtes. La longue traîne est accessible et convertit mieux."
  - question: "Tu n'as pas d'outil payant. Que faire des volumes de recherche de ton tableau ?"
    choix:
      - "Les inventer et les présenter comme exacts"
      - "Les indiquer comme estimations et les vérifier dans Google Keyword Planner"
      - "Ne pas mettre de volume du tout"
      - "Prendre le nombre de résultats affichés par Google"
    reponse: "Les indiquer comme estimations et les vérifier dans Google Keyword Planner"
    explication: "Un livrable honnête dit d'où viennent ses chiffres. Le nombre de résultats Google n'est pas un volume de recherche."
  - question: "Deux pages de ton site visent « écoconception web ». Quel est le risque ?"
    choix:
      - "Aucun : deux pages, c'est deux fois plus de chances"
      - "La cannibalisation : les deux pages se font concurrence"
      - "Une pénalité manuelle de Google"
      - "Le site devient plus lent"
    reponse: "La cannibalisation : les deux pages se font concurrence"
    explication: "Google hésite entre les deux et aucune ne se classe bien. On choisit une page cible et on fait pointer l'autre vers elle."
  - question: "Dans le score de priorité, à quoi sert le logarithme sur le volume ?"
    choix:
      - "À arrondir le score"
      - "À éviter que le mot-clé au plus gros volume écrase tous les autres"
      - "À convertir le volume en euros"
      - "À rien, c'est décoratif"
    reponse: "À éviter que le mot-clé au plus gros volume écrase tous les autres"
    explication: "En SEO, passer de 10 à 100 recherches vaut autant que passer de 1 000 à 10 000. Le logarithme reflète ces ordres de grandeur."
  - question: "Les outils comptent « écoconception » et « éco-conception » comme deux requêtes. Que fais-tu ?"
    choix:
      - "Une page pour chaque graphie"
      - "Une seule page qui couvre naturellement les deux graphies"
      - "Tu ignores la variante avec tiret"
      - "Tu écris les deux mots vingt fois dans la page"
    reponse: "Une seule page qui couvre naturellement les deux graphies"
    explication: "Même intention, donc même page. Deux pages créeraient de la cannibalisation, et le bourrage de mots-clés n'aide pas."
exercices:
  - titre: "Classer par intention"
    niveau: facile
    enonce: "Donne l'intention (informationnelle, navigationnelle, commerciale ou transactionnelle) de ces six requêtes : « comment réparer une crevaison », « meilleur antivol vélo », « facebook connexion », « acheter chambre à air 700x25 », « qu'est-ce qu'un dérailleur », « comparatif vélo électrique ville »."
    indices:
      - "« Comment » et « qu'est-ce que » : la personne veut comprendre."
      - "« Meilleur » et « comparatif » : elle compare avant d'acheter."
      - "Un nom de site + « connexion » : elle veut aller sur ce site."
    solution: |
      ```text
      comment réparer une crevaison     → informationnelle
      meilleur antivol vélo             → commerciale
      facebook connexion                → navigationnelle
      acheter chambre à air 700x25      → transactionnelle
      qu'est-ce qu'un dérailleur        → informationnelle
      comparatif vélo électrique ville  → commerciale
      ```
  - titre: "Calculer le score de priorité"
    niveau: moyen
    enonce: "Avec la formule du TP (50 % volume en logarithme, 25 % accessibilité, 25 % pertinence), calcule le score de ces trois mots-clés (valeurs d'exemple, volume maximal du tableau : 5 000) et classe-les : « écoconception web » (volume 1 000, difficulté 50, pertinence 5), « audit écoconception site web » (100, 35, 5), « data center consommation énergie » (500, 50, 2)."
    indices:
      - "Part volume = 50 × log10(volume + 1) ÷ log10(volumeMax + 1)."
      - "Part accessibilité = 25 × (100 − difficulté) ÷ 100 ; part pertinence = 25 × pertinence ÷ 5."
      - "Trie avec sort((a, b) => b.score - a.score)."
    solution: |
      ```js
      function scorePriorite({ volume, difficulte, pertinence }, volumeMax) {
        const partVolume = (50 * Math.log10(volume + 1)) / Math.log10(volumeMax + 1)
        const partAcces = (25 * (100 - difficulte)) / 100
        const partBusiness = (25 * pertinence) / 5
        return Math.round((partVolume + partAcces + partBusiness) * 10) / 10
      }

      const motsCles = [
        { motCle: 'écoconception web', volume: 1000, difficulte: 50, pertinence: 5 },
        { motCle: 'audit écoconception site web', volume: 100, difficulte: 35, pertinence: 5 },
        { motCle: 'data center consommation énergie', volume: 500, difficulte: 50, pertinence: 2 },
      ]

      const classement = motsCles
        .map((m) => ({ ...m, score: scorePriorite(m, 5000) }))
        .sort((a, b) => b.score - a.score)

      console.log(classement.map((m) => `${m.score} ${m.motCle}`))
      // [ '78.1 écoconception web', '68.3 audit écoconception site web', '59 data center consommation énergie' ]
      ```
      Le troisième a plus de volume que le deuxième, mais sa faible pertinence business le fait passer dernier.
  - titre: "Détecter la cannibalisation"
    niveau: difficile
    enonce: "Ta cartographie est un tableau d'objets { motCle, page }. Écris trouverCannibalisation(cartographie) qui renvoie chaque mot-clé visé par plus d'une page, avec la liste de ces pages."
    indices:
      - "Une Map dont la clé est le mot-clé et la valeur un Set de pages."
      - "Un Set ignore les doublons : la même page comptée deux fois n'est pas un problème."
      - "Garde seulement les entrées dont le Set a une taille supérieure à 1."
    solution: |
      ```js
      function trouverCannibalisation(cartographie) {
        const pagesParMotCle = new Map()
        for (const { motCle, page } of cartographie) {
          const pages = pagesParMotCle.get(motCle) ?? new Set()
          pages.add(page)
          pagesParMotCle.set(motCle, pages)
        }
        return [...pagesParMotCle]
          .filter(([, pages]) => pages.size > 1)
          .map(([motCle, pages]) => ({ motCle, pages: [...pages] }))
      }

      trouverCannibalisation([
        { motCle: 'écoconception web', page: '/services/assistance/' },
        { motCle: 'audit écoconception site web', page: '/services/audit/' },
        { motCle: 'écoconception web', page: '/blog/ecoconception-web/' },
      ])
      // [{ motCle: 'écoconception web', pages: ['/services/assistance/', '/blog/ecoconception-web/'] }]
      ```
---

## L'intention de recherche

:::quoi
Derrière chaque requête, une **intention** : comprendre (**informationnelle**), aller sur un site (**navigationnelle**), comparer (**commerciale**) ou agir (**transactionnelle**).
:::

:::exemple
```text
qu'est-ce que l'écoconception web    → informationnelle
nom-de-la-marque contact             → navigationnelle
comparatif hébergeur web écologique  → commerciale
formation écoconception web          → transactionnelle
```
:::

:::piege
Une page service qui vise une requête informationnelle ne se classe pas : Google y montre des articles qui expliquent. Regarde d'abord les résultats.
:::

:::ou[Site de services informatiques (TP)]
Une colonne « Intention de recherche » pour chaque mot-clé, et la page cible choisie en fonction d'elle.
:::

## Courte traîne et longue traîne

:::quoi
La **courte traîne** (1 ou 2 mots) a beaucoup de volume et de concurrence. La **longue traîne** a peu de volume par requête, mais une intention précise et une meilleure conversion.
:::

:::exemple
```text
Courte traîne : numérique responsable
  → gros volume, sites institutionnels en tête, intention floue
Longue traîne : audit écoconception site web
  → petit volume, peu de concurrence, la personne cherche un prestataire
```
:::

:::piege
Un site jeune qui ne vise que la courte traîne reste invisible : il gagne d'abord sur la longue traîne, l'autorité vient ensuite.
:::

:::ou[Site de services informatiques (TP)]
Une majorité de longue traîne dans le plan, parce que le site était récent et sans notoriété.
:::

:::info
« 3 mots ou plus » n'est qu'un repère. Ce qui fait la longue traîne : une requête **précise**, à **faible volume**.
:::

## Trouver les mots-clés

:::quoi
On part des **mots du site**, on élargit avec les **synonymes** et les **variantes**, puis avec les **suggestions de Google** et le vocabulaire du secteur.
:::

:::exemple
```text
1. Mots du site       : numérique responsable, sobriété, formations, outils
2. Synonymes          : green IT, IT durable, numérique durable
3. Variantes          : écoconception / éco-conception
4. Suggestions Google : combien pollue un email, ecoindex c'est quoi
5. Termes du secteur  : RGESN, loi REEN, EcoIndex
```
:::

:::piege
Les outils comptent « écoconception » et « éco-conception » comme deux requêtes, mais l'intention est la même : **une seule page** pour les deux graphies.
:::

:::ou[Site de services informatiques (TP)]
Les deux premières étapes de la méthode, avant de catégoriser chaque mot-clé et de lui attribuer une page.
:::

## Volume et difficulté

:::quoi
Le **volume** est le nombre moyen de recherches par mois ; la **difficulté** (0 à 100) estime l'effort pour entrer en première page. Sans outil payant, ces deux chiffres sont des **estimations**.
:::

:::exemple
```text
Google Keyword Planner  → volumes, souvent en fourchettes (gratuit, compte Google Ads)
Google Search Console   → données réelles du site : impressions, clics, position
Google Trends           → saisonnalité et tendance, en indice de 0 à 100
Semrush, Ahrefs         → volume et difficulté (outils payants)
```
:::

:::piege
Un volume estimé n'est pas une donnée : écris-le comme estimation dans ton livrable, puis recale-le avec Keyword Planner ou la Search Console.
:::

:::ou[Site de services informatiques (TP)]
Volumes estimés faute d'outil payant, avec une section « Sources et limites » à lire avant d'utiliser le tableau.
:::

## Le score de priorité

:::quoi
Pour classer les mots-clés, on combine **volume**, **accessibilité** (100 − difficulté) et **pertinence business** dans un score sur 100. Le volume passe par un **logarithme**.
:::

:::exemple
```js
// Score sur 100 = 50 % volume (log) + 25 % accessibilité + 25 % pertinence
function scorePriorite({ volume, difficulte, pertinence }, volumeMax) {
  const partVolume = (50 * Math.log10(volume + 1)) / Math.log10(volumeMax + 1)
  const partAcces = (25 * (100 - difficulte)) / 100
  const partBusiness = (25 * pertinence) / 5
  return Math.round((partVolume + partAcces + partBusiness) * 10) / 10
}
```
:::

:::piege
Sans logarithme, le plus gros volume écrase le classement. Or passer de 10 à 100 recherches vaut autant que passer de 1 000 à 10 000.
:::

:::ou[Site de services informatiques (TP)]
La colonne « Score de priorité » calculée dans le tableur, et un top 10 qui se met à jour dès qu'une estimation change.
:::

## Cartographier : un mot-clé, une page

:::quoi
Chaque mot-clé principal reçoit **une seule page** cible. Les pages se regroupent en **cocons sémantiques** : une **page pilier** et ses pages satellites, liées entre elles.
:::

:::exemple
```text
Cocon « Éco-conception web »
├─ Page pilier : guide des bonnes pratiques  → bonnes pratiques écoconception web
├─ Page service : assistance                 → écoconception web
├─ Page service : audit                      → audit écoconception site web
└─ Article : réduire l'empreinte d'un site   → comment réduire l'empreinte carbone de son site web
```
:::

:::piege
Deux pages sur le même mot-clé se font concurrence : c'est la **cannibalisation**. Garde une page cible et fais pointer l'autre vers elle.
:::

:::ou[TP dépôt-vente (étape 4)]
La règle « une intention de recherche = une seule page », avec une URL canonique quand deux pages se recoupent.
:::

:::astuce
Pour une requête de définition, réponds en une cinquantaine de mots dès le premier paragraphe : c'est le format repris par les extraits de Google et les réponses des IA.
:::
