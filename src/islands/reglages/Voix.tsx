/**
 * Voix : voix française (speechSynthesis + voiceschanged), vitesse, bouton « Tester ».
 * Le bouton « Écouter » des cours (src/scripts/ecouter.ts) lit prefs.voix et prefs.vitesseVoix.
 */
import { useEffect, useRef, useState } from 'react';
import type { Prefs } from '../../lib/store.ts';
import IconeSvg from '../IconeSvg.tsx';
import { Curseur, Ligne, Liste, Section } from './controles.tsx';
import { changerPref } from './etat.ts';
import { nomVoix, vitesse } from './format.ts';

const PHRASE_TEST = 'Bonjour Jonathan. Voici la voix qui lira tes cours.';

function synthese(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
}

/** Voix françaises, fr-FR d'abord, puis par nom. */
function voixFrancaises(s: SpeechSynthesis): SpeechSynthesisVoice[] {
  return s
    .getVoices()
    .filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('fr'))
    .sort((a, b) => Number(b.lang === 'fr-FR') - Number(a.lang === 'fr-FR') || a.name.localeCompare(b.name, 'fr'));
}

export default function Voix({ prefs }: { prefs: Prefs }) {
  const s = synthese();
  const [voix, setVoix] = useState<SpeechSynthesisVoice[]>(() => (s ? voixFrancaises(s) : []));
  const [parle, setParle] = useState(false);
  const phrase = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!s) return;
    const charger = () => setVoix(voixFrancaises(s));
    charger();
    s.addEventListener('voiceschanged', charger);
    return () => {
      s.removeEventListener('voiceschanged', charger);
      s.cancel();
    };
  }, [s]);

  const tester = () => {
    if (!s) return;
    if (parle) {
      s.cancel();
      setParle(false);
      return;
    }
    s.cancel();
    const u = new SpeechSynthesisUtterance(PHRASE_TEST);
    u.lang = 'fr-FR';
    u.rate = prefs.vitesseVoix;
    const choisie = voix.find((v) => v.name === prefs.voix) ?? voix[0];
    if (choisie) u.voice = choisie;
    u.onend = u.onerror = () => setParle(false);
    phrase.current = u; // garde une référence (sinon certains navigateurs coupent la lecture)
    setParle(true);
    s.speak(u);
  };

  if (!s) {
    return (
      <Section id="voix" titre="Voix">
        <Liste>
          <Ligne libelle="Lecture à voix haute" detail="Ce navigateur ne sait pas lire à voix haute. Essaie Chrome, Edge ou Safari." />
        </Liste>
      </Section>
    );
  }

  const inconnue = prefs.voix !== null && !voix.some((v) => v.name === prefs.voix);

  return (
    <Section id="voix" titre="Voix">
      <Liste note="Le bouton « Écouter » des cours utilise cette voix et cette vitesse.">
        <Ligne
          libelle="Voix"
          etiquette
          className="r-ligne--select"
          detail={voix.length ? undefined : 'Aucune voix française installée : le navigateur prendra sa voix par défaut.'}
        >
          {(ids) => (
            <span className="r-select">
              <select
                id={ids.controle}
                value={prefs.voix ?? ''}
                aria-describedby={ids.detail}
                onChange={(ev) => changerPref('voix', ev.target.value || null)}
              >
                <option value="">Automatique</option>
                {voix.map((v) => (
                  <option key={v.voiceURI || v.name} value={v.name}>
                    {nomVoix(v.name, v.lang)}
                  </option>
                ))}
                {inconnue && <option value={prefs.voix ?? ''}>Voix indisponible ici</option>}
              </select>
              <IconeSvg nom="chevron-droite" taille={16} className="r-select__chevron" />
            </span>
          )}
        </Ligne>
        <Ligne libelle="Vitesse" pile etiquette valeur={vitesse(prefs.vitesseVoix)}>
          {(ids) => (
            <Curseur
              ids={ids}
              valeur={prefs.vitesseVoix}
              min={0.5}
              max={2}
              pas={0.1}
              texte={`${vitesse(prefs.vitesseVoix)}, ${prefs.vitesseVoix < 1 ? 'plus lent' : prefs.vitesseVoix > 1 ? 'plus rapide' : 'normal'}`}
              onChange={(v) => changerPref('vitesseVoix', Math.round(v * 10) / 10)}
              avant="Lent"
              apres="Rapide"
            />
          )}
        </Ligne>
        <Ligne libelle="Écouter un essai" detail={parle ? 'Lecture en cours…' : undefined}>
          <button type="button" className="btn btn--secondaire" onClick={tester}>
            <IconeSvg nom={parle ? 'pause' : 'haut-parleur'} />
            <span>{parle ? 'Arrêter' : 'Tester'}</span>
          </button>
        </Ligne>
      </Liste>
    </Section>
  );
}
