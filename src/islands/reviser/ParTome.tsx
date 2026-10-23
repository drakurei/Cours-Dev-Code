/**
 * Par tome : choisir un tome, puis une session de ses cartes (dues + nouvelles).
 * Si rien n'est prévu aujourd'hui dans ce tome : révision libre de ses cartes.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CarteJson } from '../../lib/apprentissage/donnees.ts';
import { composerSession, sessionLibre } from '../../lib/apprentissage/session.ts';
import { cartesDuJour } from '../../lib/srs.ts';
import { lire } from '../../lib/store.ts';
import { useManabi } from '../useManabi.ts';
import IconeSvg from '../IconeSvg.tsx';
import SessionCartes from './SessionCartes.tsx';
import type { TomeResume } from './charger.ts';

interface Props {
  tomes: TomeResume[];
  cartes: CarteJson[];
  parId: ReadonlyMap<string, CarteJson>;
  actif: boolean;
}

interface Ouvert {
  slug: string;
  ids: string[];
  libre: boolean;
  cle: number;
}

function composer(liste: CarteJson[]): { ids: string[]; libre: boolean } {
  const etat = lire();
  const ids = composerSession(cartesDuJour(etat, liste), etat.prefs.tailleSession);
  if (ids.length > 0) return { ids, libre: false };
  return { ids: sessionLibre(etat.srs, liste, etat.prefs.tailleSession), libre: true };
}

export default function ParTome({ tomes, cartes, parId, actif }: Props) {
  const [ouvert, setOuvert] = useState<Ouvert | null>(null);
  const etat = useManabi((e) => e);
  const racine = useRef<HTMLDivElement>(null);
  const dernier = useRef<string | null>(null);
  const aFocaliser = useRef<'session' | 'liste' | null>(null);

  const parTome = useMemo(() => {
    const m = new Map<string, CarteJson[]>();
    for (const c of cartes) m.set(c.matiere, [...(m.get(c.matiere) ?? []), c]);
    return m;
  }, [cartes]);

  useEffect(() => {
    const c = aFocaliser.current;
    if (!c) return;
    aFocaliser.current = null;
    if (c === 'session') {
      racine.current?.querySelector<HTMLElement>('.ap-carte__face:not([inert]) .ap-carte__retourner')?.focus({ preventScroll: true });
    } else {
      racine.current?.querySelector<HTMLElement>(`[data-tome="${dernier.current ?? ''}"]`)?.focus();
    }
  });

  const ouvrir = (slug: string, cle = 0) => {
    const liste = parTome.get(slug) ?? [];
    dernier.current = slug;
    aFocaliser.current = 'session';
    setOuvert({ slug, cle, ...composer(liste) });
  };

  if (ouvert) {
    const tome = tomes.find((t) => t.slug === ouvert.slug);
    const liste = parTome.get(ouvert.slug) ?? [];
    return (
      <div className="rv-tome-session" ref={racine}>
        <div className="rv-eclair-jeu__barre">
          <button
            type="button"
            className="btn btn--discret rv-retour"
            onClick={() => {
              setOuvert(null);
              aFocaliser.current = 'liste';
            }}
          >
            <IconeSvg nom="chevron-gauche" taille={18} />
            Tomes
          </button>
          {ouvert.libre && <span className="rv-note">Rien de prévu aujourd’hui : révision libre.</span>}
        </div>
        <SessionCartes
          key={`${ouvert.slug}-${ouvert.cle}`}
          ids={ouvert.ids}
          cartes={parId}
          toutes={liste}
          actif={actif}
          contexte={tome ? `${tome.nom} · ${ouvert.ids.length} ${ouvert.ids.length > 1 ? 'cartes' : 'carte'}` : undefined}
          onContinuer={() => ouvrir(ouvert.slug, ouvert.cle + 1)}
        />
      </div>
    );
  }

  const lignes = tomes
    .map((t) => ({ tome: t, liste: parTome.get(t.slug) ?? [] }))
    .filter((l) => l.liste.length > 0)
    .map((l) => {
      const r = cartesDuJour(etat, l.liste);
      return { ...l, dues: r.dues.length, nouvelles: r.nouvelles.length };
    });

  return (
    <div ref={racine}>
      <ul className="rv-tomes" role="list">
        {lignes.map(({ tome, liste, dues, nouvelles }) => {
          const n = Math.min(etat.prefs.tailleSession, dues + nouvelles);
          const morceaux = [dues > 0 && `${dues} à revoir`, nouvelles > 0 && `${nouvelles} ${nouvelles > 1 ? 'nouvelles' : 'nouvelle'}`].filter(Boolean);
          const total = `${liste.length} ${liste.length > 1 ? 'cartes' : 'carte'}`;
          const detail = morceaux.length ? `${morceaux.join(' · ')} · ${total}` : `À jour · ${total}`;
          return (
            <li key={tome.slug}>
              <button type="button" className="rv-tome" data-tome={tome.slug} onClick={() => ouvrir(tome.slug)}>
                <span className="badge-kanji badge-kanji--lg" data-couleur={tome.couleur} lang="ja" aria-hidden="true" title={tome.lecture}>
                  {tome.kanji}
                </span>
                <span className="rv-tome__texte">
                  <span className="rv-tome__nom">{tome.nom}</span>
                  <span className="rv-tome__detail">{detail}</span>
                </span>
                {n > 0 ? (
                  <span className="rv-tome__nb" aria-hidden="true">
                    {n}
                  </span>
                ) : (
                  <span className="rv-tome__ok" aria-hidden="true">
                    <IconeSvg nom="coche" taille={18} />
                  </span>
                )}
                <IconeSvg nom="chevron-droite" taille={18} className="rv-tome__chevron" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
