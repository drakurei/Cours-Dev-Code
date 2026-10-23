/**
 * Îlot des Réglages (client:only="react", monté dans #reglages-app) : listes groupées façon iOS.
 * Ancres stables pour les liens d'autres pages : #apparence, #revision, #minuteur, #voix,
 * #synchronisation, #ia, #donnees, #a-propos (ex. url('/reglages/#ia') depuis l'Atelier).
 */
import { useEffect, useState } from 'react';
import { demarrerSynchroAuto } from '../../lib/sync.ts';
import { useManabi } from '../useManabi.ts';
import Apparence from './Apparence.tsx';
import APropos from './APropos.tsx';
import Donnees from './Donnees.tsx';
import { useSecrets } from './etat.ts';
import IA from './IA.tsx';
import { Minuteur, Revision } from './Revision.tsx';
import Synchro from './Synchro.tsx';
import Voix from './Voix.tsx';
import './reglages.css';

const SECTIONS = [
  { id: 'apparence', titre: 'Apparence' },
  { id: 'revision', titre: 'Révision' },
  { id: 'minuteur', titre: 'Minuteur' },
  { id: 'voix', titre: 'Voix' },
  { id: 'synchronisation', titre: 'Synchronisation' },
  { id: 'ia', titre: 'IA' },
  { id: 'donnees', titre: 'Données' },
  { id: 'a-propos', titre: 'À propos' },
] as const;

/** Sommaire collant (grand écran) avec la section visible en surbrillance. */
function Sommaire() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    let image = 0;
    // Section active = la dernière dont le haut a passé 30 % de l'écran ; tout en bas, la dernière.
    const choisir = () => {
      image = 0;
      const enBas = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let id: string = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.3) id = s.id;
      }
      setActive(enBas ? (SECTIONS[SECTIONS.length - 1]?.id ?? id) : id);
    };
    const surDefilement = () => {
      if (!image) image = window.requestAnimationFrame(choisir);
    };
    choisir();
    window.addEventListener('scroll', surDefilement, { passive: true });
    window.addEventListener('resize', surDefilement);
    return () => {
      window.cancelAnimationFrame(image);
      window.removeEventListener('scroll', surDefilement);
      window.removeEventListener('resize', surDefilement);
    };
  }, []);

  return (
    <nav className="r-sommaire" aria-label="Sections des réglages">
      <p className="r-sommaire__titre" aria-hidden="true">
        Sur cette page
      </p>
      <ul role="list">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-current={active === s.id ? 'true' : undefined}>
              {s.titre}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Reglages({ version }: { version: string }) {
  const prefs = useManabi((e) => e.prefs);
  const [secrets, ecrireSecrets] = useSecrets();

  // Synchro auto (si activée) : au chargement et quand l'onglet se cache.
  useEffect(() => demarrerSynchroAuto(), []);

  // Îlot monté après le chargement : on rejoint l'ancre demandée (#ia, #synchronisation…).
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }, []);

  return (
    <div className="r-app">
      <div className="r-colonne">
        <Apparence prefs={prefs} />
        <Revision prefs={prefs} />
        <Minuteur prefs={prefs} />
        <Voix prefs={prefs} />
        <Synchro prefs={prefs} secrets={secrets} ecrireSecrets={ecrireSecrets} />
        <IA prefs={prefs} secrets={secrets} ecrireSecrets={ecrireSecrets} />
        <Donnees secrets={secrets} ecrireSecrets={ecrireSecrets} />
        <APropos version={version} />
      </div>
      <Sommaire />
    </div>
  );
}
