/**
 * Construction de l'index de recherche (pur, testable) : cours, notions, définitions, pages.
 * Appelé au build par src/pages/search-index.json.ts.
 */
import type { Couleur } from '../schema.ts';
import { KANJI_NAVIGATION, PAGES_NAV, type PageNav } from '../kanji.ts';
import { tronquer } from '../texte.ts';
import type { DocRecherche, IndexRecherche, MatiereIndex, NotionIndex } from './types.ts';

/** Longueurs maximales du texte brut gardé (poids de l'index). */
export const LIMITES_TEXTE = { cours: 700, notion: 520, definition: 360, page: 200 } as const;

// ─── Texte brut ──────────────────────────────────────────────────────────────

const ENTITES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', rsquo: '’', lsquo: '‘', laquo: '«', raquo: '»', ndash: '–', mdash: '—' };

/** Décode les entités HTML courantes (&amp; &#39; &#x2019; &nbsp;…). */
export function decoderEntites(texte: string): string {
  return texte.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (tout, code: string) => {
    if (code[0] === '#') {
      const n = code[1] === 'x' || code[1] === 'X' ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : tout;
    }
    return ENTITES[code.toLowerCase()] ?? tout;
  });
}

/** Espaces propres : une seule espace, pas d'espace avant une ponctuation fermante. */
function espacer(texte: string): string {
  return texte
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;!?)…])/g, (_t, p: string) => (p === '!' || p === '?' || p === ';' ? ` ${p}` : p))
    .replace(/\(\s+/g, '(')
    .trim();
}

/**
 * HTML rendu → texte brut lisible : sans en-têtes de blocs (kanji + « Quoi »), sans blocs de code,
 * sans titres ##, sans boutons ni SVG.
 */
export function texteBrutHtml(html: string): string {
  const sansBruit = html
    .replace(/<figure\b[^>]*\bdata-pdf\b[\s\S]*?<\/figure>/gi, ' ')
    .replace(/<(script|style|svg|button|pre|figcaption|object|h2)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<a\b[^>]*\bdata-footnote-backref\b[\s\S]*?<\/a>/gi, '')
    .replace(/<p class="bloc__tete"[\s\S]*?<\/p>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|li|dd|dt|h\d|div|aside|section|tr|td|th|blockquote|figure)>/gi, ' ')
    .replace(/<[^>]+>/g, '');
  return espacer(decoderEntites(sansBruit));
}

/** Markdown d'une ligne ou d'un paragraphe → texte brut (code, gras, liens, HTML retirés). */
export function markdownVersTexte(md: string | undefined | null): string {
  if (!md) return '';
  return espacer(
    md
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/`+([^`]+?)`+/g, '$1')
      .replace(/(\*\*|__)(.+?)\1/g, '$2')
      .replace(/(^|[\s(])[*_]([^*_\s][^*_]*?)[*_](?=[\s).,;:!?]|$)/g, '$1$2')
      .replace(/<\/?[a-z][^>]*>/gi, ' ')
      .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, ''),
  );
}

/** Notion extraite du HTML rendu d'un cours. */
export interface NotionExtraite extends NotionIndex {
  texte: string;
}

/**
 * Notions d'un cours depuis son HTML rendu : chaque <section class="notion" data-notion="id">
 * commence par <h2 id="id">. Le découpage suit l'ordre d'apparition des sections.
 */
export function extraireNotions(html: string): NotionExtraite[] {
  const debut = /<section\b[^>]*\bclass="notion"[^>]*>/gi;
  const positions: { index: number; balise: string }[] = [];
  for (let m = debut.exec(html); m; m = debut.exec(html)) positions.push({ index: m.index, balise: m[0] });

  return positions.map((p, i) => {
    const fin = positions[i + 1]?.index ?? html.length;
    const morceau = html.slice(p.index + p.balise.length, fin);
    const h2 = /<h2\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/i.exec(morceau);
    const ancre = h2?.[1] ?? /data-notion="([^"]+)"/.exec(p.balise)?.[1] ?? '';
    return {
      ancre: decoderEntites(ancre),
      titre: h2 ? texteBrutHtml(`<p>${h2[2] ?? ''}</p>`) : ancre,
      texte: texteBrutHtml(morceau),
    };
  }).filter((n) => n.ancre && n.titre);
}

// ─── Index ───────────────────────────────────────────────────────────────────

/** Cours tel que le build le fournit à construireIndex. */
export interface CoursSource {
  id: string;
  url: string;
  titre: string;
  matiere: string;
  chapitre: number;
  duree: number;
  essentiel: string;
  retenir?: ReadonlyArray<string>;
  tags?: ReadonlyArray<string>;
  /** Libellé du type (« projet », « TP »…) indexé en mot-clé. */
  type?: string;
  definitions?: ReadonlyArray<{ terme: string; definition: string; exemple?: string | undefined }>;
  /** HTML rendu du corps (sections notion). */
  html?: string | undefined;
  /** Repli si le HTML manque : titres des ## et leurs ancres. */
  sections?: ReadonlyArray<{ id: string; titre: string }>;
}

export interface MatiereSource extends MatiereIndex {
  slug: string;
  /** URL de la page du tome. */
  url: string;
  ordre: number;
  description?: string;
  nbCours: number;
}

export interface PageSource {
  cle: PageNav;
  url: string;
}

/** Synonymes des pages de navigation (pour « parametres » → Réglages, etc.). */
export const SYNONYMES_PAGES: Record<PageNav, string> = {
  aujourdhui: 'accueil maison mission du jour tableau de bord',
  tomes: 'matieres livres bibliotheque episodes chapitres',
  reviser: 'revision flashcards cartes quiz memoire repetition espacee',
  projets: 'portfolio realisations repos demos',
  glossaire: 'definitions dictionnaire lexique vocabulaire termes mots',
  atelier: 'creer un cours importer pdf images generer ia prompt publier',
  reglages: 'parametres preferences options apparence theme police voix synchronisation gist',
};

/** Descriptions courtes des pages (affichées sous le titre). */
export const DESCRIPTIONS_PAGES: Record<PageNav, string> = {
  aujourdhui: 'La mission du jour et tes cours en cours.',
  tomes: 'Toutes les matières, en tomes.',
  reviser: 'Cartes du jour, quiz éclair, révision par tome.',
  projets: 'Mes projets, avec stack et liens.',
  glossaire: 'Toutes les définitions, de A à Z.',
  atelier: 'Créer un cours depuis un PDF, des images ou un texte.',
  reglages: 'Apparence, révision, voix, synchronisation.',
};

/** Pages de navigation en documents (URL déjà préfixée par l'appelant). */
export function documentsPages(pages: ReadonlyArray<PageSource>): DocRecherche[] {
  return pages.map(({ cle, url }) => {
    const nav = KANJI_NAVIGATION[cle];
    return {
      id: `page:${cle}`,
      type: 'page',
      titre: nav.libelle,
      url,
      kanji: nav.kanji,
      texte: DESCRIPTIONS_PAGES[cle],
      motsCles: SYNONYMES_PAGES[cle],
    };
  });
}

/** Ordre de navigation par défaut (barre latérale). */
export const ORDRE_PAGES: ReadonlyArray<PageNav> = PAGES_NAV;

export interface SourcesIndex {
  cours: ReadonlyArray<CoursSource>;
  matieres: ReadonlyArray<MatiereSource>;
  pages?: ReadonlyArray<PageSource>;
  /** Date du build (ISO) ; injectable pour les tests. */
  genere?: string;
}

/** Construit le contenu de /search-index.json. */
export function construireIndex({ cours, matieres, pages = [], genere = new Date().toISOString() }: SourcesIndex): IndexRecherche {
  const dicoMatieres: Record<string, MatiereIndex> = {};
  for (const m of matieres) dicoMatieres[m.slug] = { nom: m.nom, kanji: m.kanji, couleur: m.couleur as Couleur };

  const documents: DocRecherche[] = [];

  for (const c of cours) {
    const nomMatiere = dicoMatieres[c.matiere]?.nom ?? c.matiere;
    const notionsExtraites = c.html ? extraireNotions(c.html) : [];
    const notions: NotionExtraite[] = notionsExtraites.length
      ? notionsExtraites
      : (c.sections ?? []).map((s) => ({ ancre: s.id, titre: s.titre, texte: '' }));
    const essentiel = markdownVersTexte(c.essentiel);
    const corps = notions.map((n) => n.texte).join(' ');
    const retenir = (c.retenir ?? []).map(markdownVersTexte).join(' ');

    documents.push({
      id: `cours:${c.id}`,
      type: 'cours',
      titre: c.titre,
      url: c.url,
      matiere: c.matiere,
      chapitre: c.chapitre,
      duree: c.duree,
      texte: tronquer(espacer(`${essentiel} ${retenir} ${corps}`), LIMITES_TEXTE.cours),
      motsCles: espacer(
        [
          nomMatiere,
          c.type ?? '',
          ...(c.tags ?? []),
          ...notions.map((n) => n.titre),
          ...(c.definitions ?? []).map((d) => d.terme),
        ].join(' '),
      ),
      notions: notions.map(({ titre, ancre }) => ({ titre, ancre })),
    });

    for (const n of notions) {
      documents.push({
        id: `notion:${c.id}#${n.ancre}`,
        type: 'notion',
        titre: n.titre,
        url: `${c.url}#${n.ancre}`,
        matiere: c.matiere,
        chapitre: c.chapitre,
        coursTitre: c.titre,
        texte: tronquer(n.texte, LIMITES_TEXTE.notion),
        motsCles: nomMatiere,
      });
    }

    (c.definitions ?? []).forEach((d, i) => {
      const exemple = markdownVersTexte(d.exemple);
      documents.push({
        id: `definition:${c.id}:${i}`,
        type: 'definition',
        titre: markdownVersTexte(d.terme),
        url: `${c.url}#definitions`,
        matiere: c.matiere,
        chapitre: c.chapitre,
        coursTitre: c.titre,
        texte: tronquer(markdownVersTexte(d.definition), LIMITES_TEXTE.definition),
        ...(exemple ? { exemple: tronquer(exemple, 160) } : {}),
        motsCles: espacer(`${nomMatiere} ${exemple}`),
      });
    });
  }

  documents.push(...documentsPages(pages));

  for (const m of matieres) {
    documents.push({
      id: `tome:${m.slug}`,
      type: 'page',
      titre: m.nom,
      url: m.url,
      matiere: m.slug,
      kanji: m.kanji,
      texte: tronquer(markdownVersTexte(m.description ?? ''), LIMITES_TEXTE.page),
      detail: `Tome ${m.ordre} · ${m.nbCours} épisode${m.nbCours > 1 ? 's' : ''}`,
      motsCles: `tome ${m.ordre} matiere`,
    });
  }

  return { version: 1, genere, matieres: dicoMatieres, documents };
}
