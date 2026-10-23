/**
 * Schéma rehype-sanitize partagé (site + aperçu de l'Atelier).
 * Part du schéma « GitHub » par défaut et autorise ce dont les cours Manabi ont besoin :
 * classes partout, data-*, lang, aria-*, id ; blocs <aside>, <figure>, <object> (PDF).
 * Interdit : <script>, <style>, attributs on*, javascript:, iframes, formulaires.
 */
import { defaultSchema, type Options as Schema } from 'rehype-sanitize';

const ARIA = ['ariaHidden', 'ariaLabel', 'ariaLabelledBy', 'ariaDescribedBy', 'ariaDescription'];

type Attributs = NonNullable<Schema['attributes']>;
type Definition = Attributs[string][number];

/**
 * Le schéma par défaut limite className sur quelques balises (a, code, li…) et la PREMIÈRE
 * règle trouvée gagne : on retire ces limites pour que la règle « className partout » s'applique.
 */
function sansLimiteClasse(liste: ReadonlyArray<Definition> = []): Definition[] {
  return liste.filter((d) => (typeof d === 'string' ? d : d[0]) !== 'className');
}

const defaut: Attributs = Object.fromEntries(
  Object.entries(defaultSchema.attributes ?? {}).map(([balise, liste]) => [balise, sansLimiteClasse(liste)]),
);

export const schemaSanitize: Schema = {
  ...defaultSchema,
  // Pas de préfixe « user-content- » : les ids de titres et les notes de bas de page
  // doivent rester identiques à la source (ancres, Mode Focus). Aucun script du site
  // ne lit de variable globale créée par un id, donc pas de risque de « DOM clobbering ».
  clobber: [],
  clobberPrefix: '',
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    'aside',
    'figure',
    'figcaption',
    'object',
    'mark',
    'abbr',
    'small',
    'u',
    'cite',
    'dfn',
    'time',
    'caption',
    'colgroup',
    'col',
  ],
  // Contenu supprimé avec la balise (au lieu d'être affiché en texte).
  strip: ['script', 'style', 'template', 'noscript', 'iframe', 'title', 'textarea', 'select', 'button'],
  attributes: {
    ...defaut,
    '*': [...(defaut['*'] ?? []), 'className', 'data*', ...ARIA],
    a: [...(defaut.a ?? []), ['target', '_blank'], 'rel'],
    // metastring : la « meta » des blocs de code (title="App.jsx", {1,3}) lue par Shiki.
    code: [...(defaut.code ?? []), 'metastring'],
    img: [...(defaut.img ?? []), 'loading', 'decoding', 'width', 'height'],
    object: ['data', 'type', 'width', 'height'],
    time: ['dateTime'],
    abbr: ['title'],
    col: ['span'],
    colgroup: ['span'],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https'],
    data: ['http', 'https'],
    cite: ['http', 'https'],
    longDesc: ['http', 'https'],
  },
};
