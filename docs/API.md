# API interne de Manabi (fondation V1)

> Référence pour coder dans le repo : ce que la fondation expose (modules, attributs data-*, ids, slots, événements). Le contrat général reste [CONCEPTION.md](CONCEPTION.md).

SCHEMA (src/lib/schema.ts, n'importe que zod)
- Constantes : COULEURS, TYPES, NIVEAUX, NIVEAUX_EXERCICE, STATUTS_PROJET, SLUG_RE, DATE_RE, LIMITES {titre:90, essentiel:400, choixMin:2, choixMax:6}.
- Schémas : coursSchema, matiereSchema, definitionSchema, flashcardSchema, questionQuizSchema, exerciceSchema, projetSchema, fichierSchema.
- Types : Cours, CoursEntree, Matiere, Definition, Flashcard, QuestionQuiz, Exercice, Projet, Fichier, Couleur, TypeCours, Niveau, NiveauExercice, StatutProjet, Resultat<T>.
- validerCours(data): Resultat<Cours> ; validerMatiere(data): Resultat<Matiere>. Résultat = { ok:true, data } | { ok:false, erreurs:string[] }, chaque erreur au format « quiz[2].reponse : doit être exactement l'un des choix… ».
- formaterChemin(path), formaterErreurs(issues).
- Comportement : date renvoyée en chaîne « AAAA-MM-JJ » ; listes fermées tolérantes (« Débutant » → debutant) ; chapitre/duree acceptés en chaîne ; champs inconnus ignorés.

FRONTMATTER (src/lib/frontmatter.ts)
- separerFrontmatter(texte): {yaml, corps} | null
- parserCours(texte): {ok, data?, corps, erreurs}
- numeroDepuisNom('06-usestate') → 6 (null si pas de numéro)

URL (src/lib/url.ts)
- url(chemin), urlMedia(chemin), urlCours(id), urlTome(slug), prefixerBase(chemin, base).

TEXTE (src/lib/texte.ts)
- normaliser, compterMots, dureeLecture(texte, mpm=200), slugifier, hashCourt (djb2 → base36), idCarte(coursId, q) = `${coursId}::${hashCourt(normaliser(q))}`, tronquer, pluriel.

KANJI (src/lib/kanji.ts)
- Tables : KANJI_BLOCS (essentiel, quoi, exemple, piege, ou, astuce, info, attention, retenir), KANJI_SECTIONS (+ definition, exercice, quiz, flashcard, documents, termine, projet), KANJI_NAVIGATION (aujourdhui…reglages, avec chemin) ; chaque entrée = {kanji, lecture, libelle}.
- MOTS_JAPONAIS, NOMS_BLOCS, PAGES_NAV, TOUS_LES_KANJI, caracteresKanji(supp), urlPoliceKanji(supp).

MATIÈRES (src/lib/matieres.ts)
- MatiereVue (+slug, parDefaut), matiereOuDefaut(slug, liste), trierMatieres, varCouleur, toutesLesMatieres() (build).

COURS (src/lib/cours.ts)
- Fonctions pures sur des entrées {id, data, body} : chapitreDe, dureeDe, estProjet, estPublie, versVue, trierCours, preparerCours(entrees, matieres), coursDeMatiere, precedentSuivant(id, liste) → {precedent, suivant}, lettreIndex, definitionsGlobales, sectionsDuCours(headings) → [{id, titre}], regrouperEnTomes, coursRecents.
- Build (import dynamique de astro:content) : coursPublies(), tomesPublies().
- Types : CoursVue<E> {id, slug, data, matiere, chapitre, duree, url, estProjet, entree}, Tome, Section, DefinitionGlobale, Voisins.

STORE (src/lib/store.ts, contrat §6)
- Types : Etat, Prefs, Progression, ProgressionCours, CarteSRS (compatible ts-fsrs, dates en ISO : due, stability, difficulty, elapsed_days, scheduled_days, learning_steps, reps, lapses, state 0-3, last_review?, coursId), ResultatQuiz, ExerciceFait, Stats, Serie, Secrets, GainPetales, CoursId, CarteId.
- Constantes : CLE='manabi:v1', CLE_SECRETS='manabi:v1:secrets', EVENEMENT='manabi:change', EVENEMENT_PETALES='manabi:petales', BAREME, PREFS_DEFAUT, ETAT_INITIAL (gelé).
- Fonctions : lire(), modifier(fn), abonner(cb) → désabonnement, exporter(), importer(json, mode='remplacer'|'fusionner'), fusionner(a, b) (pure), gagnerPetales(n, raison), lireSecrets(), ecrireSecrets(partiel ; null ou '' efface).
- Actions : enregistrerVisite(id), marquerSectionVue(id, sectionId) → boolean (+1 la 1re fois), marquerTermine(id) → boolean (+10), estTermine(id), compterCartesDues(etat, date?), serieDuJour(etat, jour?), compterActivite(brouillon, jour?), jourLocal(), ecartJours(), normaliser(brut), reinitialiser(), _viderCache().

HOOK REACT (src/islands/useManabi.ts)
- useManabi<T>(selecteur, egal=Object.is) via useSyncExternalStore (valeur serveur = ETAT_INITIAL, instantané mémorisé) ; egalSuperficiel.

## MARKDOWN
- plugins.ts : pluginsRemark, pluginsRehypeAvant(base), pluginsRehypeApres, optionsRemarkRehype, type Branchement.
- directives.ts : remarkBlocs, nomBlocValide, kanjiHast.
- base-url.ts : rehypeBaseUrl({base}), prefixerChemin.
- sanitize.ts : schemaSanitize.
- pipeline.ts : rendreMarkdown(corps, base?) → Promise<string> (import dynamique côté navigateur).
- rendu-serveur.ts (build seulement) : rendreTexte, rendreEnLigne.
- shiki.ts : configShiki, transformerTitre.
- code.ts : extraireTitre, figureCode, remarkMetaCode, rehypeFigureCode.
- titres.ts : IDS_RESERVES, rehypeTitres, rehypeNotions, creerSlugger, texteHast, ID_TITRE_NOTES.
- tableaux.ts : rehypeNettoyerTableaux, rehypeTableaux.

## HTML PRODUIT PAR LE PIPELINE
- <aside class="bloc bloc--NOM" data-bloc="NOM"> > p.bloc__tete (span.kanji[lang=ja][aria-hidden] + span.bloc__titre) + div.bloc__corps
- <figure class="doc-pdf" data-pdf> (object.doc-pdf__vue + p.doc-pdf__repli + figcaption .doc-pdf__ouvrir)
- <figure class="code" data-lang> (figcaption.code__titre si title="…") > pre.astro-code ; dans l'aperçu : pre.code-brut
- chaque ## → <section class="notion" data-notion="id"><h2 id="id"> (ids sans accents ; un id réservé reçoit un suffixe : « ## Quiz » → quiz-2)
- div.tableau[tabindex=0][role=region] autour de chaque table

DONNÉES DU COURS (src/lib/donnees-cours.ts)
- preparerDonneesCours(coursId, data) → DonneesCours {coursId, titre, quiz[{index, question, questionHtml, choix[{texte, html}], reponse, reponseIndex, explicationHtml}], flashcards[{id (CarteId), q, r, qHtml, rHtml}], exercices[{index, cle `${coursId}::${index}`, titre, titreHtml, niveau, enonceHtml, indicesHtml[], solutionHtml}], definitions[…], retenirHtml[], essentielHtml}.

## ÉVÉNEMENTS WINDOW
- 'manabi:change' (detail = Etat), 'manabi:petales' (detail = {n, raison, total}), 'manabi:recherche' (ouvre la palette), 'storage' (autres onglets).

ATTRIBUTS DE <html>
- data-theme="light|dark" (résolu), data-theme-choix="auto|clair|sombre", data-font="atkinson|systeme", data-motion="auto|reduit", data-petales="oui|non", style --user-scale.
- data-focus : à poser par le Mode Focus ; coupe les pétales.

ATTRIBUTS LUS PAR src/scripts/progression.ts
- [data-enso-cours=id][data-enso-sections=N], [data-enso-ids="a b"] → --valeur (0..1) + data-valeur (0..100) + [data-enso-texte]
- [data-tome][data-tome-ids] → --progression + [data-progression-texte]
- [data-chapitre=id] et [data-statut-cours=id] → data-statut="a-lire|en-cours|termine"
- [data-hanko-cours=id] (hidden retiré ; data-anime="true" au clic)
- [data-badge="a-reviser"]
- [data-compteur="petales|serie|record"] et [data-libelle-compteur][data-singulier][data-pluriel]
- [data-cours-visite=id] (visite enregistrée), [data-notions-cours=id] (notions vues via IntersectionObserver)
- button[data-action="terminer"][data-cours-id] ; [data-annonce] (aria-live)

## AUTRES BRANCHEMENTS
- [data-action="recherche"] : clic = ouvre la palette.
- button[data-ecouter="#id"] : synthèse vocale fr-FR (src/scripts/ecouter.ts).
- [data-ouvrir-feuille] et [data-fermer-feuille] : feuille « Plus » (TabBar).
- [data-grand-titre] : titre compact dans la TopBar.
- Copier le code : ajouterBoutonsCopier(racine) exporté par src/scripts/code.ts (à rappeler après une injection d'aperçu).

## IDS ET SLOTS DES PAGES
- Lecteur : #contenu (main), #titre-cours, #essentiel, #essentiel-texte, #fiche-projet, #retenir, #contenu-cours[data-notions-cours], #documents, #definitions, #exercices / #quiz / #flashcards [data-cours-id], #fin-du-cours, nav.voisins, aside.sommaire a[data-sommaire=id].
- Slots nommés du CoursLayout (contenu statique de repli si vides) : outils, exercices, quiz, flashcards. Exemple : <Quiz slot="quiz" client:visible questions={donnees.quiz} /> dans src/pages/cours/[...id].astro (la prop donnees est déjà calculée).
- Accueil : #salutation, #stats-jour, #mission-du-jour [data-mission…], #reprendre / #revisions-dues / #minuteur-rapide (vides, hidden), #tomes, #recents, script#ordre-de-lecture (JSON).
- Squelettes : #reviser-app, #atelier-app, #reglages-app.

ÎLOTS GLOBAUX (garder nom de fichier et export par défaut)
- src/islands/CommandPalette.tsx (props {pages: EntreePalette[]}).
- src/islands/Minuteur.tsx (sessionStorage 'manabi:minuteur').
- src/components/Petales.astro.

## DESIGN
- Classes CSS globales : .btn(--primaire/--secondaire/--discret/--grand/--icone/--bloc), .puce(--accent/--couleur/--contour), .carte(--interactive) + .carte__lien, .verre, .badge-kanji(--xs…xl, --plein, --nu), .t-* (styles de texte), .sr-only, .lien-evitement, .grille-cartes, .pile, .rangee, .aide/.aide__corps (dépliants).
- [data-couleur=<couleur>] fournit --couleur, --couleur-soft, --couleur-ink. Tokens --m-<couleur>, --b-<bloc>-bg|ink|accent, --code-*.

## SERVICE WORKER
- integrations/service-worker.ts : compléter genererServiceWorker(contexte {dossier, base, pages}).

## ICÔNES
- Nouveau logo : modifier le tracé dans integrations/generer-icones.mjs, puis lancer node integrations/generer-icones.mjs.

## Écarts au contrat (décisions de la fondation)

1. Astro 7 rend le Markdown avec Sätteri par défaut. Pour garder remark/rehype, j'ai installé @astrojs/markdown-remark 7.3.2 (peer d'astro). La config passe par markdown.processor: unified({…}) et non par les options dépréciées markdown.remarkPlugins/rehypePlugins.
2. Assainissement AVANT la coloration (option prévue dans la tâche). syntaxHighlight:false, puis rehypeShiki d'@astrojs/markdown-remark appelé à la main après rehype-sanitize. Le schéma n'autorise donc aucun attribut style. configShiki reste aussi dans markdown.shikiConfig.
3. Ordre rehype réel : nettoyage des tableaux → rehype-raw → sanitize → baseUrl → Shiki → ids des titres → tableaux défilants → notions.
- J'ai ajouté rehype-raw : Astro ne parse le HTML brut qu'à la toute fin, après les plugins utilisateur. Sans lui, sanitize jetterait tout le HTML brut (<details>, <kbd>…) au lieu de l'assainir.
- baseUrl passe après sanitize (la tâche le plaçait avant) : une transformation sûre doit venir après l'entrée non fiable.
4. gfm:false côté Astro, et remark-gfm dans la liste partagée (même ordre que l'aperçu). smartypants:false, sinon « --force » deviendrait « –force » dans le texte.
5. Plugin remarkMetaCode ajouté : sanitize efface node.data.meta. La meta (title="…", {2,4}) passe donc par l'attribut autorisé « metastring », qu'Astro lit pour Shiki.
6. Schéma sanitize : clobber désactivé (pas de préfixe « user-content- » sur les ids). Sinon les ancres et le Mode Focus cassent, et le préfixe se doublait sur les notes GFM. Aucun script du site ne lit de variable globale créée par un id.
7. compressHTML: true. Le mode « jsx » par défaut d'Astro 7 supprime les espaces entre éléments en ligne écrits sur plusieurs lignes : un piège pour tous les agents.
8. Conflit de peer deps : overrides « @vitejs/plugin-react »: « 6.1.1 ». La 6.1.2 exige oxc-transform-react ^0.152, alors que @astrojs/react 7.0.1 exige ^0.145. Les deux peers sont optionnels et ne servent qu'au React Compiler, désactivé ici.
9. Dépendances en plus de la liste : rehype-raw, @astrojs/markdown-remark, @types/hast, @types/mdast, @types/node. TypeScript résolu en 6.0.3.
10. Ids des ## faits par slugifier (sans accents : « reagir-a-un-clic ») et non par github-slugger. Les ids réservés par la page (quiz, exercices, definitions…) reçoivent un suffixe -2. Chaque ## et son contenu vont dans <section class="notion" data-notion>, ce qui sert au Mode Focus et aux notions vues.
11. Thème : data-theme vaut toujours la valeur résolue « light|dark ». En auto, c'est le JS (anti-flash + prefs.ts) qui suit prefers-color-scheme ; le choix est gardé dans data-theme-choix. Sans JavaScript, le site reste en clair.
12. chapitre et duree par défaut sont calculés dans cours.ts (chapitreDe/dureeDe) : le schéma ne voit ni le nom du fichier ni le corps.
13. Schéma un peu plus tolérant que le contrat, sans le contredire :
- accents et majuscules acceptés dans les listes fermées ; nombres acceptés en chaîne ;
- date toujours ressortie en chaîne AAAA-MM-JJ ;
- refusés : deux choix de quiz identiques, une matière qui n'est pas un slug, un kanji de plus d'un caractère, un repo/démo sans https://.
14. Le loader glob utilise un generateId propre : un champ « slug: » ajouté par une IA ne change plus l'id du cours. Les .yml sont acceptés en plus des .yaml.
15. importer(json, mode) prend un 2e paramètre facultatif (« remplacer » par défaut). Le store expose aussi : reinitialiser, compterCartesDues, serieDuJour, BAREME, PREFS_DEFAUT, constantes et événement 'manabi:petales'.
16. Fait en plus, pour que la fondation marche seule (remplaçable) :
- notions vues + enregistrement des visites dans progression.ts, sinon l'ensō resterait à 0 ;
- bouton « Écouter » (ecouter.ts) ;
- sommaire statique, sans scrollspy (laissé à l'agent du lecteur).
17. Shippori Mincho chargée sans bloquer le rendu (media="print" onload), avec repli <noscript>. Ajouté aussi : italiques d'Atkinson et de JetBrains Mono (le code italique de Rosé Pine).
18. Pas de pages/search-index.json.ts (hors de ma liste d'étapes) : la palette minimale ne liste que les 7 pages.

## Prompt universel (src/lib/prompt.ts) et scripts

src/lib/prompt.ts (aucune dépendance, importable par Node 24 et par Vite) :
- Constantes MARQUEUR_DEBUT = '<!-- PROMPT:DEBUT -->', MARQUEUR_FIN = '<!-- PROMPT:FIN -->', ESPACES_RESERVES = ['MATIERES','MATIERE','TYPE','NIVEAU','CONSIGNE','DATE'] as const, MATIERES_PAR_DEFAUT (react, javascript, html-css, gestion-projet, ia-seo, projets).
- Types EspaceReserve, MatierePrompt = { slug, nom }, OptionsPrompt = { matieres?, matiere?, type?, niveau?, consigne?, date?, source?, nomsFichiersJoints? }.
- dateDuJour(d?: Date): string renvoie AAAA-MM-JJ en heure locale.
- extrairePrompt(markdownComplet: string): string renvoie le texte entre les marqueurs. Il retire le bloc ~~~ (ou ```) qui l'entoure et normalise BOM et CRLF. Sans marqueurs, il renvoie le texte entier nettoyé.
- construirePrompt(gabarit: string, options?: OptionsPrompt): string accepte le prompt seul ou PROMPT-COURS.md en entier. Les remplacements se font en un seul passage, par fonction (une consigne qui contient « $1 » ou « {{DATE}} » reste intacte). Valeurs par défaut : « à choisir (…) » pour matière, type et niveau ; « aucune consigne particulière » ; date du jour ; MATIERES_PAR_DEFAUT pour la liste. Une section « SOURCE À TRANSFORMER » est ajoutée à la fin : avertissement anti-injection, liste « Fichiers joints » si nomsFichiersJoints, texte entre <source></source>, puis « FIN DE LA SOURCE ». Sans source ni fichier, le prompt finit par « La source est collée juste en dessous… ».

À savoir pour l'Atelier :
- Il doit passer par extrairePrompt/construirePrompt, pas par une découpe brute du fichier (sinon les lignes ~~~ restent dans le prompt).
- L'IA écrit en 1re ligne du frontmatter le commentaire YAML « # fichier : NN-slug.md ».
- Champ facultatif nouvelleMatiere { nom, kanji, lecture, couleur, description } : retiré par Zod comme tout champ inconnu, donc à lire dans le YAML brut.

Scripts (appelés par les scripts npm déjà présents) :
- node scripts/verifier-contenu.mjs [--json] : code 1 s'il y a des erreurs. En JSON : { ok, cours, matieres, erreurs, avertissements, fichiers: [{ fichier, erreurs[], avertissements[] }] }.
- node scripts/nouveau-cours.mjs <matiere> "<Titre>" [--type t] [--niveau n].
- node scripts/generer-cours.mjs [--essai] [--dossier d] [--modele id]. Variables : ANTHROPIC_API_KEY, MANABI_MODELE (défaut claude-sonnet-5-5), MANABI_EFFORT (défaut medium), MANABI_REPLI=non, ANTHROPIC_BASE_URL.
- Une source = un fichier de inbox/ ou un sous-dossier (= un seul cours). Consigne : <nom>.consigne.txt, ou *.consigne.txt / consigne.txt dans le sous-dossier ; premières lignes facultatives « matiere: / type: / niveau: ».
- Les noms commençant par . ou _ sont ignorés, ainsi que inbox/README.md.

Outils partagés (scripts/outils.mjs) : analyserCorps(texte) renvoie { erreurs, avertissements, notions } (blocs ::: équilibrés, blocs de code fermés, numéros de ligne du fichier). Autres fonctions : chargerValidation, analyserCours, lireMatieres, prochainNumero, slugifier, yamlMatiere.

Workflows :
- deploy.yml accepte on.workflow_call.inputs.ref (string, facultatif) ; le checkout prend inputs.ref || github.sha.
- inbox.yml : sorties du job generer « commit » et « sha » ; variable de repo facultative vars.MANABI_MODELE.
