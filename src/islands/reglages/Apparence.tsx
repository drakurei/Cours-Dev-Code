/**
 * Apparence : thème, police de lecture (avec aperçu), taille du texte, animations, pétales.
 * Chaque changement passe par le store : prefs.ts réapplique tout de suite les attributs de <html>.
 */
import type { Prefs } from '../../lib/store.ts';
import { Curseur, Interrupteur, Ligne, Liste, Section, Segmente } from './controles.tsx';
import { changerPref } from './etat.ts';
import { pourcent } from './format.ts';

const THEMES = [
  { valeur: 'auto', libelle: 'Auto' },
  { valeur: 'clair', libelle: 'Clair' },
  { valeur: 'sombre', libelle: 'Sombre' },
] as const;

const POLICES = [
  { valeur: 'atkinson', libelle: 'Atkinson' },
  { valeur: 'systeme', libelle: 'Système' },
] as const;

const ANIMATIONS = [
  { valeur: 'auto', libelle: 'Auto' },
  { valeur: 'reduites', libelle: 'Réduites' },
] as const;

export default function Apparence({ prefs }: { prefs: Prefs }) {
  return (
    <Section id="apparence" titre="Apparence">
      <Liste note="Tout s’applique tout de suite, sur tout le site. « Auto » suit les réglages de ton appareil.">
        <Ligne libelle="Thème">
          {(ids) => <Segmente ids={ids} valeur={prefs.theme} options={THEMES} onChange={(v) => changerPref('theme', v)} />}
        </Ligne>
        <Ligne libelle="Police de lecture" detail="Pour le texte des cours.">
          {(ids) => <Segmente ids={ids} valeur={prefs.police} options={POLICES} onChange={(v) => changerPref('police', v)} />}
        </Ligne>
        <Ligne libelle="Taille du texte" pile etiquette valeur={pourcent(prefs.taille)}>
          {(ids) => (
            <Curseur
              ids={ids}
              valeur={prefs.taille}
              min={0.9}
              max={1.4}
              pas={0.05}
              texte={pourcent(prefs.taille)}
              onChange={(v) => changerPref('taille', Math.round(v * 100) / 100)}
              avant={<span className="r-a r-a--petit">A</span>}
              apres={<span className="r-a r-a--grand">A</span>}
            />
          )}
        </Ligne>
        <div className="r-apercu" aria-label="Aperçu du texte des cours" role="group">
          <p className="r-apercu__titre">useState : l’état d’un composant</p>
          <p className="r-apercu__texte">
            <strong>useState</strong> crée une valeur que React surveille. On la change avec <strong>setX</strong>, et
            l’écran se met à jour.
          </p>
        </div>
        <Ligne libelle="Animations" detail={prefs.animations === 'reduites' ? 'Rien ne bouge, pétales coupés.' : undefined}>
          {(ids) => <Segmente ids={ids} valeur={prefs.animations} options={ANIMATIONS} onChange={(v) => changerPref('animations', v)} />}
        </Ligne>
        <Ligne libelle="Pétales" detail="Ils tombent sur l’accueil. Jamais en Mode Focus." etiquette className="r-ligne--interrupteur">
          {(ids) => <Interrupteur ids={ids} actif={prefs.petales} onChange={(v) => changerPref('petales', v)} />}
        </Ligne>
      </Liste>
    </Section>
  );
}
