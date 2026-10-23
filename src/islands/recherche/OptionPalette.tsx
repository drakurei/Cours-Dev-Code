/**
 * Une option de la palette (role="option") : badge (kanji du tome, kanji de page ou icône),
 * titre surligné, extrait, ligne méta. Le nom accessible = le texte visible (kanji masqués).
 */
import { Fragment, type ReactNode } from 'react';
import { plages, surligner, extrait } from '../../lib/recherche/surligner.ts';
import type { DocRecherche, MatiereIndex, TypeDoc } from '../../lib/recherche/types.ts';
import { idAction, vueAction, type ContexteActions } from './actions.ts';
import { IconePalette } from './icones.tsx';
import type { OptionVue } from './vue.ts';

const LIBELLES_TYPES: Record<TypeDoc, string> = {
  cours: 'Cours',
  notion: 'Notion',
  definition: 'Définition',
  page: 'Page',
  action: 'Action',
};

interface Props {
  option: OptionVue;
  id: string;
  actif: boolean;
  matieres: Record<string, MatiereIndex>;
  contexte: ContexteActions;
  onChoisir: (nouvelOnglet: boolean) => void;
  onSurvol: () => void;
}

/** Texte avec les termes trouvés dans des <mark>. */
function Surligne({ texte, termes, requete }: { texte: string; termes: string[]; requete: string[] }) {
  return (
    <>
      {surligner(texte, termes, requete).map((s, i) =>
        s.marque ? <mark key={i}>{s.texte}</mark> : <Fragment key={i}>{s.texte}</Fragment>,
      )}
    </>
  );
}

/** « 第6話 » visible, « épisode 6 » pour les lecteurs d'écran. */
function Episode({ n }: { n: number }) {
  return (
    <>
      <span lang="ja" aria-hidden="true">
        第{n}話
      </span>
      <span className="sr-only">épisode {n}</span>
    </>
  );
}

function meta(doc: DocRecherche, m: MatiereIndex | undefined): ReactNode {
  const nom = m?.nom ?? doc.matiere ?? '';
  if (doc.type === 'cours') {
    return (
      <>
        {nom} · <Episode n={doc.chapitre ?? 0} />
        {doc.duree ? ` · ${doc.duree} min` : ''}
      </>
    );
  }
  if (doc.type === 'notion' || doc.type === 'definition') {
    return (
      <>
        {nom} · <Episode n={doc.chapitre ?? 0} /> {doc.coursTitre}
      </>
    );
  }
  return doc.detail ?? doc.texte;
}

function OptionPalette({ option, id, actif, matieres, contexte, onChoisir, onSurvol }: Props) {
  const { doc, resultat, meilleur } = option;
  const termes = resultat?.termes ?? [];
  const requete = resultat?.requete ?? [];

  let badge: ReactNode = null;
  let couleur: string | undefined;
  let titre: ReactNode = null;
  let ligne: ReactNode = null;
  let extraitTexte: ReactNode = null;
  let suffixe: ReactNode = null;

  if (option.genre === 'recente') {
    badge = <IconePalette nom="historique" taille={18} />;
    titre = option.recente;
    ligne = 'Recherche récente';
  } else if (option.genre === 'effacer') {
    badge = <IconePalette nom="effacer" taille={16} />;
    titre = 'Effacer les recherches récentes';
  } else if (doc) {
    const ida = idAction(doc.id);
    if (ida) {
      const vue = vueAction(ida, contexte);
      badge = vue.icone ? <IconePalette nom={vue.icone} taille={18} /> : <span lang="ja" aria-hidden="true">{vue.kanji}</span>;
      titre = <Surligne texte={vue.titre} termes={termes} requete={requete} />;
      ligne = vue.detail;
      if (vue.touche) {
        suffixe = (
          <>
            <kbd className="palette__touche" aria-hidden="true">
              {vue.touche}
            </kbd>
            <span className="sr-only">, raccourci {vue.touche}</span>
          </>
        );
      }
      if (vue.actuel) suffixe = <IconePalette nom="coche" taille={18} className="palette__coche" />;
    } else {
      const m = doc.matiere ? matieres[doc.matiere] : undefined;
      couleur = m?.couleur;
      badge = (
        <span lang="ja" aria-hidden="true">
          {doc.kanji ?? m?.kanji ?? ''}
        </span>
      );
      titre = <Surligne texte={doc.titre} termes={termes} requete={requete} />;
      ligne = meta(doc, m);

      // Extrait : toujours pour une définition ; sinon si le texte (et pas le titre) correspond.
      const titreTrouve = plages(doc.titre, termes, requete).length > 0;
      const texteTrouve = termes.length > 0 && plages(doc.texte, termes, requete).length > 0;
      if (doc.texte && (doc.type === 'definition' || (doc.type !== 'page' && (meilleur || (texteTrouve && !titreTrouve))))) {
        const court = extrait(doc.texte, termes, meilleur ? 160 : 110, requete);
        extraitTexte = <Surligne texte={court} termes={termes} requete={requete} />;
      }
      if (meilleur) suffixe = <span className="puce palette__type">{LIBELLES_TYPES[doc.type]}</span>;
    }
  }

  return (
    <li
      id={id}
      role="option"
      aria-selected={actif}
      className="palette__option"
      data-genre={option.genre}
      data-type={doc?.type}
      data-meilleur={meilleur ? '' : undefined}
      onMouseMove={actif ? undefined : onSurvol}
      onClick={(ev) => onChoisir(ev.metaKey || ev.ctrlKey)}
    >
      <span className="palette__badge" data-couleur={couleur} aria-hidden="true">
        {badge}
      </span>
      <span className="palette__texte">
        <span className="palette__titre">{titre}</span>
        {extraitTexte && <span className="palette__extrait">{extraitTexte}</span>}
        {ligne && <span className="palette__meta">{ligne}</span>}
      </span>
      {suffixe && <span className="palette__suffixe">{suffixe}</span>}
      <IconePalette nom="entree" taille={16} className="palette__entree" />
    </li>
  );
}

export default OptionPalette;
