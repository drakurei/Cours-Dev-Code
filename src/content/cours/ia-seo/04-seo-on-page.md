---
titre: "SEO on-page : la checklist d'audit"
matiere: ia-seo
type: cours
chapitre: 4
niveau: intermediaire
duree: 12
date: 2026-08-24
source: "Atelier SEO — audit on-page d'un site e-commerce de mode (TP) et TP dépôt-vente (étape 4)"
tags: [seo, audit, html, performance, json-ld]
essentiel: "Le SEO on-page, c'est tout ce qui se règle sur le site lui-même : title, meta description, titres Hn, contenu, liens internes, images, vitesse et données structurées. Un audit contrôle chaque point, avec une preuve, une gravité et une correction, puis classe les actions par rapport effort / gain."
retenir:
  - "Un audit = pour chaque problème : la preuve, la gravité, la correction, puis une priorité effort / gain."
  - "Title unique (50 à 60 caractères) et meta description unique (140 à 155) sur chaque page."
  - "Un seul H1 textuel qui annonce le sujet, puis des H2 et H3 sans sauter de niveau."
  - "Images : alt descriptif, WebP, width et height, loading=\"lazy\" sauf sur la première image visible."
  - "Les données structurées JSON-LD rendent une page éligible aux résultats enrichis (prix, disponibilité)."
definitions:
  - terme: "SEO on-page"
    definition: "Tout ce qui se règle sur le site lui-même : technique (vitesse, mobile), structure du code (balises, images) et contenu."
  - terme: "SEO off-page"
    definition: "Ce qui se passe en dehors du site, surtout les liens venant d'autres sites (backlinks)."
  - terme: "Balise title"
    definition: "Le titre de la page, placé dans le head : c'est le lien cliquable affiché dans Google et un critère de pertinence fort."
    exemple: "Réparation de vélos à Lille : révision et entretien en 24 h"
  - terme: "Meta description"
    definition: "Le résumé de la page affiché sous le titre dans les résultats. Elle ne classe pas la page mais influence le taux de clic."
  - terme: "Maillage interne"
    definition: "L'ensemble des liens entre les pages d'un même site. Il aide Google à découvrir les pages et à comprendre leur sujet."
  - terme: "Core Web Vitals"
    definition: "Trois mesures d'expérience réelle utilisées par Google : LCP (affichage), INP (réactivité) et CLS (stabilité visuelle)."
  - terme: "JSON-LD"
    definition: "Format de données structurées, dans une balise script de type application/ld+json, qui décrit la page avec le vocabulaire schema.org."
  - terme: "Balise canonical"
    definition: "Un lien rel=\"canonical\" dans le head qui indique l'URL de référence d'une page, pour éviter le contenu dupliqué."
flashcards:
  - q: "Quelle différence entre SEO on-page et off-page ?"
    r: "L'on-page se règle sur le site (code, contenu, vitesse). L'off-page vient de l'extérieur, surtout des liens d'autres sites."
  - q: "Quels sont les quatre éléments d'un constat d'audit ?"
    r: "Le problème, sa gravité, la preuve relevée et la correction à apporter."
  - q: "Quelle longueur viser pour une balise title ?"
    r: "Environ 50 à 60 caractères, mot-clé principal au début, marque à la fin."
  - q: "La meta description fait-elle monter une page dans Google ?"
    r: "Non, ce n'est pas un critère de classement, mais un bon texte augmente le taux de clic."
  - q: "Combien de H1 par page ?"
    r: "Un seul, en texte, qui annonce le sujet. Google en tolère plusieurs, mais c'est la bonne pratique."
  - q: "Quel alt pour une image purement décorative ?"
    r: "alt=\"\" : un attribut vide mais présent, pour que les lecteurs d'écran l'ignorent."
  - q: "Pourquoi déclarer width et height sur une image ?"
    r: "Le navigateur réserve la place avant le chargement : la page ne saute pas (CLS)."
  - q: "Quelle image ne doit pas être en loading=\"lazy\" ?"
    r: "La première image visible à l'écran, souvent l'élément LCP de la page."
  - q: "Quels sont les seuils « bon » des Core Web Vitals ?"
    r: "LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1."
  - q: "Qu'est-ce qu'une ancre descriptive ?"
    r: "Un texte de lien qui dit où il mène, comme « nos guides d'entretien du cuir », au lieu de « cliquez ici »."
  - q: "Que permet un JSON-LD de type Product ?"
    r: "Il rend la fiche éligible aux résultats enrichis : prix, disponibilité, avis affichés dans Google."
quiz:
  - question: "Une page n'a aucune balise title. Que fait Google ?"
    choix:
      - "Il refuse d'indexer la page"
      - "Il fabrique un titre à partir du contenu, souvent le nom de domaine ou un bout de menu"
      - "Il affiche « Sans titre »"
      - "Il pénalise tout le site"
    reponse: "Il fabrique un titre à partir du contenu, souvent le nom de domaine ou un bout de menu"
    explication: "La page reste indexée, mais tu perds le contrôle du texte le plus visible dans les résultats, et un critère de pertinence fort."
  - question: "La meta description est-elle un critère de classement ?"
    choix:
      - "Oui, c'est le plus important"
      - "Non, mais elle influence le taux de clic"
      - "Seulement si le mot-clé y apparaît trois fois"
      - "Elle n'est plus lue par Google"
    reponse: "Non, mais elle influence le taux de clic"
    explication: "Google l'affiche souvent sous le titre. Un texte clair et unique donne envie de cliquer ; sans elle, Google prend un extrait au hasard."
  - question: "Quel attribut alt convient à une photo produit ?"
    choix:
      - "alt=\"image1\""
      - "alt=\"veste veste laine veste pas cher\""
      - "alt=\"Veste en laine bleu marine portée de face\""
      - "Pas d'attribut alt du tout"
    reponse: "alt=\"Veste en laine bleu marine portée de face\""
    explication: "L'alt décrit l'image pour les lecteurs d'écran et pour Google Images. Le bourrage de mots-clés et les noms génériques n'apportent rien."
  - question: "Quelle image ne doit pas avoir loading=\"lazy\" ?"
    choix:
      - "Les images du pied de page"
      - "La première image visible à l'écran"
      - "Les images d'une galerie en bas de page"
      - "Les logos des partenaires"
    reponse: "La première image visible à l'écran"
    explication: "Le chargement différé retarde l'image principale, souvent l'élément LCP. On la charge tout de suite ; le reste peut attendre."
  - question: "La page « saute » pendant le chargement. Quel indicateur se dégrade, et comment le corriger ?"
    choix:
      - "LCP : il faut changer d'hébergeur"
      - "CLS : il faut déclarer width et height sur les images"
      - "INP : il faut supprimer les liens"
      - "Aucun : ce n'est pas mesuré"
    reponse: "CLS : il faut déclarer width et height sur les images"
    explication: "Le CLS mesure la stabilité visuelle. Avec les dimensions (ou aspect-ratio en CSS), le navigateur réserve la place avant le chargement."
  - question: "Ton audit liste deux problèmes : aucune balise title (une seule modification du thème corrige toutes les pages) et des dizaines de catégories vides à nettoyer à la main. Par quoi commencer ?"
    choix:
      - "Les catégories, parce que c'est plus long"
      - "Les balises title : un gain énorme pour un effort minime"
      - "Les deux en même temps"
      - "Ni l'un ni l'autre avant d'avoir refait le design"
    reponse: "Les balises title : un gain énorme pour un effort minime"
    explication: "On priorise par rapport effort / gain. Une correction de modèle qui règle tout le site d'un coup passe toujours en premier."
  - question: "Que permet un JSON-LD de type Product sur une fiche produit ?"
    choix:
      - "D'accélérer le chargement de la page"
      - "De rendre la fiche éligible à l'affichage du prix et de la disponibilité dans Google"
      - "De remplacer la balise title"
      - "D'empêcher la copie des images"
    reponse: "De rendre la fiche éligible à l'affichage du prix et de la disponibilité dans Google"
    explication: "Les données structurées décrivent la page ; Google peut alors afficher un résultat enrichi. Ce n'est pas garanti, mais sans elles c'est impossible."
exercices:
  - titre: "Title et meta description"
    niveau: facile
    enonce: "Écris la balise title (50 à 60 caractères) et la meta description (140 à 155 caractères) de la page d'accueil d'un atelier de réparation de vélos situé dans le centre de Lille."
    indices:
      - "Mets le mot-clé principal (réparation de vélos à Lille) au début du title."
      - "Dans la meta description, réponds aux questions du client : quoi, où, en combien de temps, à quel prix."
      - "Vérifie les longueurs avec .length dans la console."
    solution: |
      ```html
      <title>Réparation de vélos à Lille : révision et entretien en 24 h</title>
      <meta name="description" content="Crevaison, freins, dérailleur : on répare votre vélo en 24 h dans notre atelier du centre de Lille. Devis gratuit, sans rendez-vous du mardi au samedi.">
      ```
      Title : 59 caractères. Meta description : 151 caractères.
  - titre: "Corriger la structure d'une page"
    niveau: moyen
    enonce: "Corrige cet extrait de page d'accueil : `<h1><img src=\"logo.png\"></h1>`, puis `<h1>Panier</h1>`, puis `<h3>Nos vestes</h3>`, puis `<img src=\"IMG_4821.jpg\">` (une photo de veste en laine, sous la ligne de flottaison)."
    indices:
      - "Le H1 doit être un texte qui décrit l'activité ; le logo sort du H1 et reçoit un alt."
      - "« Panier » n'est pas le sujet de la page, et on ne saute pas du H1 au H3."
      - "L'image a besoin d'un nom de fichier parlant, d'un alt, de dimensions et du chargement différé."
    solution: |
      ```html
      <a href="/"><img src="logo.png" alt="Accueil" width="160" height="48"></a>
      <h1>Vêtements pour homme fabriqués en France</h1>
      <h2 class="cart__title">Panier</h2>
      <h2>Nos vestes</h2>
      <img src="veste-laine-bleu-marine.webp"
           alt="Veste en laine bleu marine portée de face"
           width="800" height="1000" loading="lazy">
      ```
  - titre: "Un mini-audit dans la console"
    niveau: difficile
    enonce: "Écris un script à coller dans la console du navigateur qui affiche, pour la page ouverte : la longueur du title, la longueur de la meta description, le nombre de H1, le nombre de H1 sans texte, le nombre d'images sans attribut alt, le nombre d'images sans width ou height et le nombre de blocs JSON-LD."
    indices:
      - "document.title, document.querySelector('meta[name=\"description\"]') et document.querySelectorAll('h1')."
      - "[...document.images] transforme la liste d'images en tableau pour utiliser filter."
      - "hasAttribute('alt') est faux seulement si l'attribut est absent : alt=\"\" est volontaire."
    solution: |
      ```js
      const images = [...document.images]
      const rapport = {
        title: document.title.length,
        metaDescription: document.querySelector('meta[name="description"]')?.content.length ?? 0,
        h1: document.querySelectorAll('h1').length,
        h1Vides: [...document.querySelectorAll('h1')].filter((h) => h.textContent.trim() === '').length,
        imagesSansAlt: images.filter((img) => !img.hasAttribute('alt')).length,
        imagesSansDimensions: images.filter((img) => !img.hasAttribute('width') || !img.hasAttribute('height')).length,
        jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
      }
      console.table(rapport)
      ```
      Un title à 0, un H1 vide ou des images sans alt deviennent des lignes de ton tableau d'audit, avec la preuve.
---

## La méthode d'audit

:::quoi
Un **audit on-page** contrôle le site lui-même. Pour chaque problème : la **preuve**, la **gravité**, la **correction**, puis une priorité selon le rapport **effort / gain**.
:::

:::exemple
```md
| Problème              | Gravité  | Preuve relevée                  | Correction                       |
| --------------------- | -------- | ------------------------------- | -------------------------------- |
| Aucune balise <title> | Critique | 0 <title> dans le code source   | title dynamique dans le thème    |
| H1 = logo en image    | Critique | <h1><a><img src="logo.png">     | H1 textuel qui décrit l'activité |
| Images sans alt       | Élevée   | la plupart des <img> sans alt   | alt descriptif, alt="" si déco   |
```
:::

:::piege
Un audit qui ne liste que des défauts n'est pas impartial : note aussi ce qui fonctionne déjà (HTTPS, canonical, sitemap).
:::

:::ou[Audit d'un site e-commerce de mode (TP)]
Gravité Critique, Élevée ou Moyenne, un onglet « Points positifs » et un plan d'action classé par effort et gain.
:::

:::info
Écris aussi les **limites** de ton audit : lire le code source ne mesure ni le trafic perdu, ni les vraies Core Web Vitals.
:::

## Title et meta description

:::quoi
Le **title** est le lien cliquable dans Google et un critère de pertinence fort. La **meta description** est le texte dessous : elle ne classe pas la page, mais donne envie de cliquer.
:::

:::exemple
```html
<head>
  <title>Veste en laine bleu marine – Fabrication française | Marque</title>
  <meta name="description" content="Veste en laine bleu marine, coupée et cousue en atelier en France. Coupe ajustée, doublure en coton. Livraison offerte et retours gratuits sous 30 jours.">
</head>
```
:::

:::piege
Sans title, Google en fabrique un, souvent avec le nom de domaine ou un bout de menu. Sans meta description, il prend un extrait au hasard.
:::

:::ou[Audit d'un site e-commerce de mode (TP)]
Aucun title ni meta description sur le site : une seule modification du thème corrige toutes les pages d'un coup.
:::

:::astuce
Repères : title de **50 à 60 caractères**, mot-clé au début et marque à la fin ; meta description **unique**, de **140 à 155 caractères**.
:::

## Les titres Hn

:::quoi
Le **H1** annonce le sujet de la page, en texte. Les **H2** et **H3** découpent le contenu, sans sauter de niveau.
:::

:::exemple
```html
<!-- Avant : le H1 ne contient qu'une image, et « Panier » est aussi un H1 -->
<h1><a href="/"><img src="logo.png"></a></h1>
<h1 class="cart__title">Panier</h1>

<!-- Après -->
<a href="/"><img src="logo.png" alt="Accueil"></a>
<h1>Vêtements pour homme fabriqués en France</h1>
<h2 class="cart__title">Panier</h2>
```
:::

:::piege
Google tolère plusieurs H1, mais un H1 « Panier » répété sur toutes les pages annonce le mauvais sujet partout.
:::

:::ou[Audit d'un site e-commerce de mode (TP)]
Le H1 de l'accueil ne contenait que le logo, et « Panier » était balisé en H1 sur chaque page, avant le nom du produit.
:::

## Contenu et maillage interne

:::quoi
Chaque page vise **un mot-clé principal** avec un texte unique. Le **maillage interne** relie les pages entre elles avec des **ancres descriptives**.
:::

:::exemple
```html
<!-- Ancre vague : Google ne sait pas de quoi parle la page cible -->
<a href="/guides/entretenir-sac-cuir/">Cliquez ici</a>

<!-- Ancre descriptive -->
<a href="/guides/entretenir-sac-cuir/">notre guide pour entretenir un sac en cuir</a>
```
:::

:::piege
Un même bloc de texte répété sur toutes les pages (guide des tailles, longues mentions) dilue le contenu propre à chacune : c'est du contenu dupliqué.
:::

:::ou[TP dépôt-vente (étape 4)]
Fil d'Ariane sur toutes les pages, liens entre catégories et marques, au moins trois liens internes par page, et jamais « cliquez ici ».
:::

## Les images

:::quoi
Une image optimisée a un **alt** descriptif, un format léger (**WebP**), des **dimensions** déclarées, et se charge en **différé** si elle est hors de l'écran.
:::

:::exemple
```html
<img
  src="/img/veste-laine-bleu-marine.webp"
  alt="Veste en laine bleu marine portée de face"
  width="800" height="1000"
  loading="lazy"
>
```
:::

:::piege
Pas de `loading="lazy"` sur la première image visible : son affichage est retardé et le **LCP** se dégrade.
:::

:::ou[Audit d'un site e-commerce de mode (TP)]
La plupart des images sans alt, aucune avec width et height ni en lazy, et de gros visuels JPEG là où un WebP aurait suffi.
:::

:::astuce
Image purement décorative : `alt=""`, vide mais présent. Les lecteurs d'écran la sautent, sans signaler d'oubli.
:::

## La performance : Core Web Vitals

:::quoi
Google mesure l'expérience réelle avec trois **Core Web Vitals** : **LCP** (affichage du contenu principal), **INP** (réactivité) et **CLS** (stabilité visuelle).
:::

:::exemple
```text
Seuils « bon », mesurés sur 75 % des visites :
LCP ≤ 2,5 s    le plus gros élément visible s'affiche vite
INP ≤ 200 ms   la page réagit vite aux clics et aux touches
CLS ≤ 0,1      rien ne saute pendant le chargement
```
:::

:::piege
Lire le code source ne mesure pas ces valeurs : il faut **PageSpeed Insights** ou le rapport Core Web Vitals de la **Search Console**.
:::

:::ou[Audit d'un site e-commerce de mode (TP)]
Poids des images et dimensions manquantes relevés dans le code, Core Web Vitals non mesurés : c'est écrit dans les limites de l'audit.
:::

## Les données structurées

:::quoi
Les **données structurées** en **JSON-LD** (vocabulaire schema.org) décrivent la page à Google : produit, prix, disponibilité. Elles la rendent éligible aux **résultats enrichis**.
:::

:::exemple
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Veste en laine bleu marine",
  "image": "https://example.com/img/veste-laine-bleu-marine.webp",
  "offers": { "@type": "Offer", "price": "189.00", "priceCurrency": "EUR", "availability": "https://schema.org/InStock" }
}
</script>
```
:::

:::piege
Ne balise jamais une information absente de la page visible (faux avis, autre prix) : c'est contraire aux règles de Google.
:::

:::ou[Audit d'un site e-commerce de mode (TP)]
Aucun JSON-LD sur les fiches produit. À ajouter : `Product` sur les fiches, `BreadcrumbList` partout, `Organization` sur l'accueil.
:::
