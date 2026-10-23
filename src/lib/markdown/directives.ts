/**
 * Plugin remark : directives Manabi (à placer APRÈS remark-directive).
 *
 *   :::quoi … :::            → <aside class="bloc bloc--quoi" data-bloc="quoi">
 *   :::ou[Dans mon-blog] …   → même chose avec un titre personnalisé
 *   :::inconnu …             → rendu comme « info » (jamais d'erreur)
 *   ::pdf{src="/media/x.pdf" titre="Slides"}  → <figure class="doc-pdf"> (visionneuse + lien)
 *
 * Piège : remark-directive lit aussi « :mot » dans le texte (a:hover, localhost:abc…).
 * Toute directive texte ou feuille non gérée est remise en texte brut, à l'identique.
 */
import type { Paragraph, PhrasingContent, Root, Text } from 'mdast';
import type { ContainerDirective, LeafDirective, TextDirective } from 'mdast-util-directive';
import type { VFile } from 'vfile';
import type { Element } from 'hast';
import { h } from 'hastscript';
import { SKIP, visit } from 'unist-util-visit';
import { KANJI_BLOCS, KANJI_SECTIONS, type NomBloc } from '../kanji.ts';

type Directive = ContainerDirective | LeafDirective | TextDirective;

/** Le nom de bloc s'il est connu, sinon « info ». */
export function nomBlocValide(nom: string): NomBloc {
  return Object.hasOwn(KANJI_BLOCS, nom) ? (nom as NomBloc) : 'info';
}

/** En-tête de bloc en hast (réutilisé par les composants qui imitent un bloc). */
export function kanjiHast(kanji: string): Element {
  return h('span', { className: ['kanji'], lang: 'ja', ariaHidden: 'true' }, kanji);
}

/** Texte brut d'un nœud mdast (sans dépendance). */
function texteDe(n: { value?: unknown; children?: unknown }): string {
  if (typeof n.value === 'string') return n.value;
  if (Array.isArray(n.children)) return n.children.map((c) => texteDe(c as typeof n)).join('');
  return '';
}

/** Reconstitue la source d'une directive : idéalement le texte original, à l'octet près. */
function sourceDe(node: Directive, file: VFile | undefined): string {
  const debut = node.position?.start.offset;
  const fin = node.position?.end.offset;
  const valeur = file?.value;
  if (typeof valeur === 'string' && typeof debut === 'number' && typeof fin === 'number') {
    return valeur.slice(debut, fin);
  }
  // Repli : reconstruction approximative.
  const marque = node.type === 'textDirective' ? ':' : node.type === 'leafDirective' ? '::' : ':::';
  const label = node.children.length ? `[${texteDe(node)}]` : '';
  const attrs = Object.entries(node.attributes ?? {})
    .map(([k, v]) => (v ? `${k}="${v}"` : k))
    .join(' ');
  return `${marque}${node.name}${label}${attrs ? `{${attrs}}` : ''}`;
}

function enTexte(valeur: string): Text {
  return { type: 'text', value: valeur };
}

/** Transforme un conteneur :::nom en bloc coloré. */
function transformerBloc(node: ContainerDirective): void {
  const nom = nomBlocValide(node.name);
  const info = KANJI_BLOCS[nom];

  // Le [label] éventuel est le premier paragraphe marqué directiveLabel.
  const premier = node.children[0];
  let titre: PhrasingContent[] = [];
  let corps = node.children;
  if (premier?.type === 'paragraph' && premier.data?.directiveLabel) {
    titre = premier.children;
    corps = node.children.slice(1);
  }
  const titreAttr = node.attributes?.titre ?? node.attributes?.title;
  if (!titre.length && titreAttr) titre = [enTexte(titreAttr)];
  if (!titre.length) titre = [enTexte(info.libelle)];

  const tete: Paragraph = {
    type: 'paragraph',
    data: { hProperties: { className: ['bloc__tete'] } },
    children: [
      { type: 'text', value: info.kanji, data: { hName: 'span', hProperties: { className: ['kanji'], lang: 'ja', ariaHidden: 'true', title: info.lecture } } },
      { type: 'emphasis', data: { hName: 'span', hProperties: { className: ['bloc__titre'] } }, children: titre },
    ],
  };

  node.data = {
    ...node.data,
    hName: 'aside',
    hProperties: { className: ['bloc', `bloc--${nom}`], dataBloc: nom },
  };
  node.children = [
    tete,
    { type: 'blockquote', data: { hName: 'div', hProperties: { className: ['bloc__corps'] } }, children: corps },
  ];
}

/** ::pdf{src titre} → visionneuse intégrée + repli + lien « Ouvrir le PDF ». */
function figurePdf(src: string, titre: string): Element {
  return h('figure', { className: ['doc-pdf'], dataPdf: src }, [
    h('object', { className: ['doc-pdf__vue'], data: src, type: 'application/pdf', ariaLabel: titre }, [
      h('p', { className: ['doc-pdf__repli'] }, [
        'Ce navigateur ne peut pas afficher le PDF ici. ',
        h('a', { href: src }, 'Ouvrir le PDF'),
      ]),
    ]),
    h('figcaption', { className: ['doc-pdf__legende'] }, [
      h('span', { className: ['doc-pdf__titre'] }, [kanjiHast(KANJI_SECTIONS.documents.kanji), h('span', titre)]),
      h('a', { className: ['doc-pdf__ouvrir'], href: src, target: '_blank', rel: ['noopener'] }, 'Ouvrir le PDF'),
    ]),
  ]);
}

export function remarkBlocs() {
  return (tree: Root, file?: VFile) => {
    visit(tree, (node, index, parent) => {
      if (node.type !== 'containerDirective' && node.type !== 'leafDirective' && node.type !== 'textDirective') return;
      if (!parent || index === undefined) return;

      if (node.type === 'containerDirective') {
        transformerBloc(node);
        return; // on continue dans les enfants (directives imbriquées)
      }

      if (node.type === 'leafDirective' && node.name === 'pdf') {
        const src = (node.attributes?.src ?? '').trim();
        if (src) {
          const titre = (node.attributes?.titre ?? node.attributes?.title ?? (texteDe(node) || 'Document PDF')).trim();
          const figure = figurePdf(src, titre);
          node.data = { ...node.data, hName: 'figure', hProperties: figure.properties, hChildren: figure.children };
          return SKIP;
        }
        file?.message('::pdf sans attribut src : laissé en texte', { place: node.position, ruleId: 'pdf-src', source: 'manabi' });
      }

      // Directive non gérée → texte brut identique à la source.
      const brut = enTexte(sourceDe(node, file));
      if (node.type === 'leafDirective') {
        parent.children.splice(index, 1, { type: 'paragraph', children: [brut] } as never);
      } else {
        parent.children.splice(index, 1, brut as never);
      }
      return [SKIP, index];
    });
  };
}
