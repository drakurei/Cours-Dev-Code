/**
 * À propos : version, liens (site, code source), raccourcis clavier (« ? »).
 * Le bouton « Raccourcis clavier » ouvre la feuille globale de la palette (touche « ? ») ;
 * si elle n'est pas là, la liste s'affiche ici.
 */
import { useId, useState } from 'react';
import IconeSvg from '../IconeSvg.tsx';
import { Ligne, Liste, Section } from './controles.tsx';

const URL_SITE = 'https://drakurei.github.io/Cours-Dev-Code/';
const URL_REPO = 'https://github.com/drakurei/Cours-Dev-Code';

const RACCOURCIS: readonly { touches: string[]; sep?: string; action: string }[] = [
  { touches: ['Ctrl', 'K'], sep: '+', action: 'Rechercher (ou « / »)' },
  { touches: ['?'], action: 'Afficher les raccourcis' },
  { touches: ['F'], action: 'Mode Focus, dans un cours' },
  { touches: ['J', 'K'], sep: '/', action: 'Notion suivante, précédente' },
  { touches: ['←', '→'], sep: '/', action: 'Notion précédente, suivante (Focus)' },
  { touches: ['Échap'], action: 'Fermer, sortir du Focus' },
  { touches: ['Espace'], action: 'Retourner la carte (révision)' },
  { touches: ['1', '4'], sep: 'à', action: 'Noter la carte, de Raté à Facile' },
];

function LigneLien({ href, libelle, valeur }: { href: string; libelle: string; valeur: string }) {
  return (
    <a className="r-ligne r-ligne--lien" href={href} target="_blank" rel="noopener noreferrer">
      <span className="r-ligne__libelle">{libelle}</span>
      <span className="r-ligne__valeur">{valeur}</span>
      <span className="sr-only"> (nouvel onglet)</span>
      <IconeSvg nom="externe" taille={16} className="r-ligne__fleche" />
    </a>
  );
}

export default function APropos({ version }: { version: string }) {
  const [liste, setListe] = useState(false);
  const idListe = useId();
  const mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  const ouvrirRaccourcis = () => {
    if (liste) {
      setListe(false);
      return;
    }
    // Même chemin que la touche « ? » : la palette ouvre sa feuille des raccourcis.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }));
    window.setTimeout(() => {
      if (!document.querySelector('dialog[open]')) setListe(true);
    }, 60);
  };

  return (
    <Section id="a-propos" titre="À propos">
      <Liste note="Manabi 学び : réviser une chose à la fois, toujours dans le même ordre.">
        <Ligne libelle="Version" valeur={version} />
        <LigneLien href={URL_SITE} libelle="Site" valeur="drakurei.github.io" />
        <LigneLien href={URL_REPO} libelle="Code source" valeur="GitHub" />
        <button type="button" className="r-ligne r-ligne--action" onClick={ouvrirRaccourcis} aria-expanded={liste} aria-controls={idListe}>
          <span className="r-ligne__libelle">Raccourcis clavier</span>
          <kbd aria-hidden="true">?</kbd>
          <span className="sr-only"> (touche point d’interrogation)</span>
        </button>
        <div id={idListe} hidden={!liste} className="r-raccourcis">
          <dl>
            {RACCOURCIS.map((r) => (
              <div key={r.action} className="r-raccourci">
                <dt>
                  {r.touches.map((t, i) => (
                    <span key={t}>
                      {i > 0 && <span className="r-raccourci__sep">{r.sep}</span>}
                      <kbd>{t === 'Ctrl' && mac ? '⌘' : t}</kbd>
                    </span>
                  ))}
                </dt>
                <dd>{r.action}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Liste>
    </Section>
  );
}
