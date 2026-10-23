/**
 * Aperçu du cours avec le MÊME pipeline Markdown que le site (import dynamique) et les styles
 * du lecteur (.prose, .bloc). Le texte de l'IA n'est jamais injecté tel quel : seul le HTML
 * assaini par le pipeline (rehype-sanitize) l'est.
 */
import { useEffect, useRef, useState } from 'react';
import type { Diagnostic } from '../../lib/atelier/analyse.ts';
import { KANJI_BLOCS, KANJI_SECTIONS } from '../../lib/kanji.ts';
import { NIVEAUX_LIBELLES, TYPES_LIBELLES } from '../../lib/libelles.ts';
import { dureeLecture } from '../../lib/texte.ts';
import { useAtelier } from './contexte.ts';

interface Rendu {
  corps: string;
  essentiel: string;
  retenir: string[];
}

export default function Apercu({ diagnostic }: { diagnostic: Diagnostic }) {
  const { matieres } = useAtelier();
  const [rendu, setRendu] = useState<Rendu | null>(null);
  const [echec, setEchec] = useState(false);
  const racine = useRef<HTMLDivElement>(null);
  const { data, corps, resume } = diagnostic;

  useEffect(() => {
    let actif = true;
    const minuterie = window.setTimeout(async () => {
      try {
        const { rendreMarkdown } = await import('../../lib/markdown/pipeline.ts');
        const [html, essentiel, ...retenir] = await Promise.all([
          rendreMarkdown(corps),
          rendreMarkdown(data?.essentiel ?? ''),
          ...(data?.retenir ?? []).map((r) => rendreMarkdown(r)),
        ]);
        if (actif) {
          setRendu({ corps: html ?? '', essentiel: essentiel ?? '', retenir });
          setEchec(false);
        }
      } catch {
        if (actif) setEchec(true);
      }
    }, 150);
    return () => {
      actif = false;
      window.clearTimeout(minuterie);
    };
  }, [corps, data?.essentiel, data?.retenir]);

  // Boutons « Copier » sur les blocs de code de l'aperçu (comme sur le site).
  useEffect(() => {
    if (!rendu || !racine.current) return;
    const el = racine.current;
    void import('../../scripts/code.ts').then(({ ajouterBoutonsCopier }) => ajouterBoutonsCopier(el));
  }, [rendu]);

  if (echec) return <p className="at-message at-message--erreur">L’aperçu n’a pas pu être préparé.</p>;
  if (!rendu) {
    return (
      <p className="at-ligne-etat">
        <span className="at-roue" aria-hidden="true" />
        Préparation de l’aperçu…
      </p>
    );
  }

  const matiere = data ? matieres.find((m) => m.slug === data.matiere) : undefined;
  const ess = KANJI_BLOCS.essentiel;
  const ret = KANJI_SECTIONS.retenir;

  return (
    <div ref={racine} className="at-apercu">
      {data && resume && (
        <header className="at-apercu__tete">
          <p className="at-apercu__fil">
            <span className="badge-kanji badge-kanji--xs" data-couleur={matiere?.couleur ?? 'sumi'} lang="ja" aria-hidden="true">
              {matiere?.kanji ?? (data.matiere.charAt(0).toUpperCase() || '?')}
            </span>
            {matiere?.nom ?? `${data.matiere} (nouvelle matière)`}
          </p>
          <h3 className="at-apercu__titre">{data.titre}</h3>
          <ul className="rangee" role="list" aria-label="Informations">
            <li className="puce">{TYPES_LIBELLES[data.type]}</li>
            <li className="puce">{NIVEAUX_LIBELLES[data.niveau]}</li>
            <li className="puce">{data.duree ?? dureeLecture(corps)} min</li>
          </ul>
        </header>
      )}

      {data && (
        <aside className="bloc bloc--essentiel bloc--grand" aria-label={ess.libelle}>
          <p className="bloc__tete">
            <span className="kanji" lang="ja" aria-hidden="true">
              {ess.kanji}
            </span>
            <span className="bloc__titre">{ess.libelle}</span>
          </p>
          <div className="bloc__corps" dangerouslySetInnerHTML={{ __html: rendu.essentiel }} />
        </aside>
      )}

      {rendu.retenir.length > 0 && (
        <aside className="bloc bloc--retenir" aria-label={ret.libelle}>
          <p className="bloc__tete">
            <span className="kanji" lang="ja" aria-hidden="true">
              {ret.kanji}
            </span>
            <span className="bloc__titre">{ret.libelle}</span>
          </p>
          <ul className="bloc__corps">
            {rendu.retenir.map((html, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: html }} />
            ))}
          </ul>
        </aside>
      )}

      {/* HTML produit par rendreMarkdown : assaini (pas de script, pas d'attribut on*, pas de javascript:). */}
      <div className="prose at-apercu__corps" dangerouslySetInnerHTML={{ __html: rendu.corps }} />
    </div>
  );
}
