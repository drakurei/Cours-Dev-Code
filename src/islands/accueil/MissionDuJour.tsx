/**
 * Mission du jour (#mission-du-jour) : UNE action principale (gros bouton) + un lien discret.
 * Monté en client:only (l'état vit dans localStorage) ; le squelette de même hauteur est
 * rendu par src/pages/index.astro. Styles : accueil.css (chargé par la page).
 */
import { useMemo, type ReactNode } from 'react';
import IconeSvg from '../IconeSvg.tsx';
import Enso from './Enso.tsx';
import { BadgeTome, Episode, HankoTermine, PileCartes } from './Visuels.tsx';
import { LIENS } from './liens.ts';
import {
  choisirMission,
  listeMatieres,
  pourcent,
  texteNotions,
  type Episode as EpisodeLecture,
  type Mission,
  type Suggestion,
} from './logique.ts';
import { minutesEstimees } from './revision.ts';
import { useAujourdhui } from './useAujourdhui.ts';

/** « useState : l'état d'un composant » → « useState » (pour le lien secondaire). */
export function titreCourt(titre: string): string {
  const avant = titre.split(/\s:\s/)[0]?.trim() ?? titre;
  return avant.length >= 3 && avant.length < titre.length ? avant : titre;
}

interface Vue {
  couleur?: string | undefined;
  verbe?: string;
  titre: ReactNode;
  meta?: ReactNode;
  texte?: string;
  action: { libelle: string; precision: string; href: string };
  secondaire?: { prefixe: string; libelle: string; href: string } | undefined;
  visuel: ReactNode;
}

function lienSecondaire(s: Suggestion | null): Vue['secondaire'] {
  if (!s) return undefined;
  const titre = titreCourt(s.episode.titre);
  if (s.type === 'continuer') {
    return { prefixe: 'ou continuer :', libelle: `${titre} (${s.avancement.vues}/${s.avancement.total} notions)`, href: s.episode.url };
  }
  return { prefixe: 'ou commencer :', libelle: titre, href: s.episode.url };
}

function FaceEpisode({ ep, pied }: { ep: EpisodeLecture; pied: ReactNode }) {
  return (
    <>
      <span className="mission-pile__tete">
        <BadgeTome kanji={ep.kanji} couleur={ep.couleur} />
        <span>
          <Episode matiere={ep.matiere} chapitre={ep.chapitre} />
        </span>
      </span>
      <span className="mission-pile__kanji" lang="ja">
        {ep.kanji ?? '学'}
      </span>
      <span className="mission-pile__pied">{pied}</span>
    </>
  );
}

function vueDe(m: Exclude<Mission, { type: 'vide' }>): Vue {
  switch (m.type) {
    case 'bienvenue':
    case 'commencer': {
      const ep = m.episode;
      const total = ep.notions?.length ?? 0;
      return {
        couleur: ep.couleur,
        verbe: 'Commencer :',
        titre: ep.titre,
        meta: (
          <>
            <Episode matiere={ep.matiere} chapitre={ep.chapitre} /> · {ep.duree} min
          </>
        ),
        texte: ep.essentiel,
        action: { libelle: 'Commencer', precision: ep.titre, href: ep.url },
        secondaire: m.type === 'commencer' ? { prefixe: 'ou', libelle: 'choisir un autre cours', href: LIENS.tomes } : undefined,
        visuel: (
          <PileCartes couleur={ep.couleur}>
            <FaceEpisode
              ep={ep}
              pied={
                <>
                  <span>{ep.duree} min</span>
                  {total > 0 && <span>{total} notions</span>}
                </>
              }
            />
          </PileCartes>
        ),
      };
    }
    case 'reviser': {
      const matieres = listeMatieres(m.matieres);
      const plafonnee = m.total > m.cartes;
      const ep = m.premier;
      return {
        couleur: ep?.couleur,
        titre: (
          <>
            Réviser {m.cartes} carte{m.cartes > 1 ? 's' : ''}{' '}
            <span className="mission-carte__leger mission-carte__duree">
              <span className="mission-carte__point" aria-hidden="true">
                ·{' '}
              </span>
              environ {m.minutes} min
            </span>
          </>
        ),
        texte: `${matieres ? `${matieres}. ` : ''}${
          plafonnee ? `Une session courte : ${m.total - m.cartes} autres attendront.` : 'Une carte à la fois, une touche pour noter.'
        }`,
        action: { libelle: 'Commencer', precision: 'la révision', href: LIENS.reviser },
        secondaire: lienSecondaire(m.secondaire),
        visuel: (
          <PileCartes couleur={ep?.couleur}>
            {ep ? (
              <>
                <span className="mission-pile__tete">
                  <BadgeTome kanji={ep.kanji} couleur={ep.couleur} />
                  <span>
                    <Episode matiere={ep.matiere} chapitre={ep.chapitre} />
                  </span>
                </span>
                <span className="mission-pile__question">{ep.titre}</span>
              </>
            ) : (
              <span className="mission-pile__kanji" lang="ja">
                復
              </span>
            )}
            <span className="mission-pile__pied">
              <span>Une touche pour noter</span>
              <span className="mission-pile__compte">1 / {m.cartes}</span>
            </span>
          </PileCartes>
        ),
      };
    }
    case 'continuer': {
      const ep = m.episode;
      return {
        couleur: ep.couleur,
        verbe: 'Continuer :',
        titre: ep.titre,
        meta: (
          <>
            <Episode matiere={ep.matiere} chapitre={ep.chapitre} /> · {texteNotions(m.avancement)} · environ {m.minutes} min
          </>
        ),
        texte: ep.essentiel,
        action: { libelle: 'Continuer', precision: ep.titre, href: ep.url },
        secondaire: lienSecondaire(m.secondaire),
        visuel: (
          <div className="mission-carte__enso" data-couleur={ep.couleur} aria-hidden="true">
            <Enso valeur={m.avancement.part} taille={144}>
              <span className="mission-carte__enso-valeur">{pourcent(m.avancement.part)}</span>
            </Enso>
          </div>
        ),
      };
    }
    case 'termine':
      return {
        titre: 'Tout est lu, bravo\u202f!',
        texte: `Tu as terminé les ${m.cours} cours. Garde-les en tête avec un quiz éclair : 10 questions au hasard.`,
        action: { libelle: 'Lancer un quiz éclair', precision: '', href: LIENS.quizEclair },
        secondaire: { prefixe: 'ou', libelle: 'relire un tome', href: LIENS.tomes },
        visuel: (
          <div className="mission-carte__hanko">
            <HankoTermine />
          </div>
        ),
      };
  }
}

export default function MissionDuJour() {
  const { etat, episodes, jour } = useAujourdhui();
  const mission = useMemo(
    () =>
      choisirMission({
        etat,
        episodes,
        dues: jour.dues,
        nouvelles: jour.nouvelles,
        minutes: minutesEstimees,
        plafond: etat.prefs.tailleSession,
      }),
    [etat, episodes, jour],
  );

  if (mission.type === 'vide') {
    return (
      <div className="mission-carte mission-carte--vide" data-mission="vide">
        <div className="mission-carte__texte">
          <p className="mission-carte__surtitre" id="mission-titre">
            <span className="badge-kanji badge-kanji--xs" lang="ja" aria-hidden="true">
              今
            </span>
            Mission du jour
          </p>
          <h2 className="mission-carte__titre">Créer ton premier cours</h2>
          <p className="mission-carte__texte-court">Colle tes notes dans l’Atelier : il en fait un cours en quelques minutes.</p>
          <div className="mission-carte__actions">
            <a className="btn btn--primaire btn--grand mission-carte__bouton" href={LIENS.atelier}>
              <span>Ouvrir l’Atelier</span>
              <IconeSvg nom="fleche-droite" taille={20} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  const v = vueDe(mission);
  return (
    <div className="mission-carte" data-mission={mission.type} data-couleur={v.couleur}>
      <div className="mission-carte__texte">
        <p className="mission-carte__surtitre" id="mission-titre">
          <span className="badge-kanji badge-kanji--xs" lang="ja" aria-hidden="true">
            今
          </span>
          Mission du jour
        </p>
        <h2 className="mission-carte__titre">
          {v.verbe && (
            <>
              <span className="mission-carte__leger">{v.verbe}</span>{' '}
            </>
          )}
          {v.titre}
        </h2>
        {v.meta && <p className="mission-carte__meta">{v.meta}</p>}
        {v.texte && <p className="mission-carte__texte-court">{v.texte}</p>}
        <div className="mission-carte__actions">
          <a className="btn btn--primaire btn--grand mission-carte__bouton" href={v.action.href}>
            <span>
              {v.action.libelle}
              {v.action.precision && <span className="sr-only"> : {v.action.precision}</span>}
            </span>
            <IconeSvg nom="fleche-droite" taille={20} />
          </a>
          {v.secondaire && (
            <p className="mission-carte__secondaire">
              {v.secondaire.prefixe}{' '}
              <a href={v.secondaire.href}>
                {v.secondaire.libelle}
                <IconeSvg nom="chevron-droite" taille={14} />
              </a>
            </p>
          )}
        </div>
      </div>
      <div className="mission-carte__visuel" aria-hidden="true">
        {v.visuel}
      </div>
    </div>
  );
}
