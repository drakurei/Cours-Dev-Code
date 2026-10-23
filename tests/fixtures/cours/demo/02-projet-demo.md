---
titre: "Mon blog React"
matiere: demo
type: projet
niveau: intermediaire
duree: 6
date: 2026-10-01
source: "Exercice du cours React"
tags: [react, vite, projet]
essentiel: "Un blog en React avec Vite : liste d'articles, page de détail et bouton « J'aime ». Déployé sur GitHub Pages."
retenir:
  - "Un composant par fichier."
  - "Les données passent du parent vers l'enfant par les props."
projet:
  repo: "https://github.com/drakurei/tp-react-blog"
  demo: "https://drakurei.github.io/tp-react-blog/"
  stack: [React, Vite, Bootstrap]
  statut: Terminé
  role: "Seul, exercice du cours React"
definitions:
  - terme: "Props"
    definition: "Les paramètres qu'un composant parent donne à son enfant."
---

## Ce que j'ai construit

:::quoi
Un blog : une **liste d'articles**, une **page de détail**, un bouton **J'aime**.
:::

:::exemple
```bash
npm create vite@latest mon-blog -- --template react
npm run deploy
```
:::

## Ce que j'ai appris

:::retenir
Découper l'interface en petits composants rend le code lisible.
:::
