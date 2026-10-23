/**
 * Texte à lire à voix haute (bouton « Écouter ») : logique pure, testée dans tests/lecteur-ecoute.test.ts.
 *
 * On lit le texte utile, comme une personne le lirait :
 *   - le code brut est remplacé par « Exemple de code. » ;
 *   - on saute les libellés techniques : kanji décoratifs (aria-hidden), boutons, textes .sr-only,
 *     titres de fichiers de code, renvois de notes, et les titres des blocs « Quoi » et « Exemple » ;
 *   - les autres titres de blocs (« Piège », « Dans mon-blog »…) sont gardés : ils donnent le sens ;
 *   - chaque paragraphe, élément de liste ou titre devient une phrase (point ajouté si besoin).
 */

/** Ce que l'on utilise d'un nœud DOM (un Node du navigateur convient tel quel). */
export interface NoeudLecture {
  readonly nodeType: number;
  readonly nodeName: string;
  readonly nodeValue: string | null;
  readonly childNodes: ArrayLike<NoeudLecture>;
  getAttribute?(nom: string): string | null;
  hasAttribute?(nom: string): boolean;
}

export const PHRASE_CODE = 'Exemple de code.';

const NOEUD_ELEMENT = 1;
const NOEUD_TEXTE = 3;

/** Éléments qui forment une phrase à part. */
const BLOCS = new Set([
  'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'DD', 'DETAILS', 'DIV', 'DL', 'DT', 'FIGCAPTION', 'FIGURE',
  'FOOTER', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HR', 'LI', 'MAIN', 'NAV', 'OL', 'P', 'SECTION',
  'SUMMARY', 'TABLE', 'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'UL',
]);

/** Éléments jamais lus. */
const IGNORES = new Set(['BUTTON', 'SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'SVG', 'INPUT', 'SELECT', 'TEXTAREA', 'OBJECT', 'IFRAME', 'CANVAS']);

/** Classes des libellés techniques. */
const CLASSES_IGNOREES = ['sr-only', 'code__titre', 'code__copier', 'kanji'];

/** Blocs dont le titre n'apporte rien à l'oral. */
const BLOCS_SANS_TITRE = new Set(['quoi', 'exemple']);

function attr(n: NoeudLecture, nom: string): string | null {
  return n.getAttribute ? n.getAttribute(nom) : null;
}

function classes(n: NoeudLecture): string[] {
  return (attr(n, 'class') ?? '').split(/\s+/).filter(Boolean);
}

function estIgnore(n: NoeudLecture, nom: string): boolean {
  if (IGNORES.has(nom)) return true;
  if (attr(n, 'aria-hidden') === 'true' || attr(n, 'data-ecoute') === 'non') return true;
  if (n.hasAttribute ? n.hasAttribute('hidden') : attr(n, 'hidden') !== null) return true;
  if (attr(n, 'data-footnote-ref') !== null || attr(n, 'data-footnotes') !== null) return true;
  const c = classes(n);
  return CLASSES_IGNOREES.some((x) => c.includes(x));
}

function estCode(n: NoeudLecture, nom: string): boolean {
  return nom === 'PRE' || (nom === 'FIGURE' && classes(n).includes('code'));
}

/** Ajoute un point final si la phrase n'a pas de ponctuation forte. */
export function ponctuer(phrase: string): string {
  const t = phrase.trim();
  if (!t) return '';
  return /[.!?…:;]$/.test(t) ? t : `${t}.`;
}

/**
 * Texte à lire pour un élément (une notion, l'essentiel, une étape du Mode Focus).
 * `visible` (facultatif) écarte ce qui n'est pas affiché (dans le navigateur : element.checkVisibility()).
 */
export function texteAEcouter(racine: NoeudLecture, visible?: (n: NoeudLecture) => boolean): string {
  const phrases: string[] = [];
  let courant = '';

  const couper = (): void => {
    const t = courant.replace(/\s+/g, ' ').trim();
    if (t) phrases.push(t);
    courant = '';
  };
  const ajouter = (phrase: string): void => {
    couper();
    if (phrases[phrases.length - 1] !== phrase) phrases.push(phrase); // pas deux « Exemple de code » de suite
  };

  const visiter = (n: NoeudLecture, bloc: string | null): void => {
    if (n.nodeType === NOEUD_TEXTE) {
      courant += n.nodeValue ?? '';
      return;
    }
    if (n.nodeType !== NOEUD_ELEMENT) return;
    const nom = n.nodeName.toUpperCase();
    if (estIgnore(n, nom) || (visible && n !== racine && !visible(n))) return;
    if (estCode(n, nom)) return ajouter(PHRASE_CODE);
    if (nom === 'IMG') {
      const alt = attr(n, 'alt')?.trim();
      if (alt) ajouter(ponctuer(`Image : ${alt}`));
      return;
    }
    if (nom === 'BR') return couper();

    const typeBloc = attr(n, 'data-bloc') ?? bloc;
    if (classes(n).includes('bloc__tete') && typeBloc && BLOCS_SANS_TITRE.has(typeBloc)) return;

    const estBloc = BLOCS.has(nom);
    if (estBloc) couper();
    const enfants = n.childNodes;
    for (let i = 0; i < enfants.length; i++) {
      const enfant = enfants[i];
      if (enfant) visiter(enfant, typeBloc);
    }
    if (estBloc) couper();
  };

  visiter(racine, null);
  couper();
  return phrases.map(ponctuer).filter(Boolean).join(' ');
}

/** Coupe une phrase trop longue sur une virgule, sinon sur un espace. */
function couperLongue(phrase: string, max: number): string[] {
  const sortie: string[] = [];
  let reste = phrase.trim();
  while (reste.length > max) {
    const zone = reste.slice(0, max);
    let coupe = Math.max(zone.lastIndexOf(', '), zone.lastIndexOf('; '));
    if (coupe < max * 0.4) coupe = zone.lastIndexOf(' ');
    if (coupe <= 0) coupe = max;
    sortie.push(reste.slice(0, coupe + 1).trim());
    reste = reste.slice(coupe + 1).trim();
  }
  if (reste) sortie.push(reste);
  return sortie;
}

/**
 * Découpe un texte en morceaux d'au plus `max` caractères, sur les fins de phrase.
 * (Chrome coupe parfois les longues lectures : plusieurs petites phrases à la suite sont plus sûres.)
 */
export function decouperPhrases(texte: string, max = 200): string[] {
  const propre = texte.replace(/\s+/g, ' ').trim();
  if (!propre) return [];
  const morceaux: string[] = [];
  let tampon = '';
  for (const phrase of propre.split(/(?<=[.!?…])\s+/)) {
    for (const bout of couperLongue(phrase, max)) {
      if (!tampon) tampon = bout;
      else if (tampon.length + 1 + bout.length <= max) tampon = `${tampon} ${bout}`;
      else {
        morceaux.push(tampon);
        tampon = bout;
      }
    }
  }
  if (tampon) morceaux.push(tampon);
  return morceaux;
}
