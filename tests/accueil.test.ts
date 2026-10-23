import { describe, expect, it } from 'vitest';
import { ETAT_INITIAL, normaliser, type CarteSRS, type Etat } from '../src/lib/store.ts';
import {
  aReprendre,
  avancement,
  choisirMission,
  coursDeCarte,
  estPremiereVisite,
  listeMatieres,
  minutesRestantes,
  pourcent,
  resumeRevisions,
  texteNotions,
  type Episode,
  type EntreesMission,
} from '../src/islands/accueil/logique.ts';
import { validerCartes, validerEpisodes } from '../src/islands/accueil/donnees.ts';

// ─── Données de test ─────────────────────────────────────────────────────────

const ep = (id: string, matiere: string, chapitre: number, notions: string[], duree = 10): Episode => ({
  id,
  url: `/Cours-Dev-Code/cours/${id}/`,
  titre: `Titre ${id}`,
  chapitre,
  matiere,
  duree,
  essentiel: `Essentiel ${id}`,
  kanji: '学',
  couleur: 'sakura',
  notions,
});

const EPISODES: Episode[] = [
  ep('manabi/01-bienvenue', 'Manabi', 1, ['a', 'b', 'c', 'd']),
  ep('react/01-intro', 'React', 1, ['x', 'y']),
  ep('react/06-usestate', 'React', 6, ['n1', 'n2', 'n3', 'n4', 'n5']),
  ep('css/03-position', 'HTML & CSS', 3, ['p1', 'p2', 'p3', 'p4', 'p5']),
];

const ISO = (jour: string, heure = '10:00') => new Date(`${jour}T${heure}:00`).toISOString();

/** État construit à partir d'un brouillon partiel (normalisé comme par le store). */
function etat(partiel: Partial<Etat> = {}): Etat {
  return normaliser({ ...structuredClone(ETAT_INITIAL), ...partiel });
}

function carte(due: string, extra: Partial<CarteSRS> = {}): CarteSRS {
  return {
    coursId: 'react/06-usestate',
    due,
    stability: 3,
    difficulty: 5,
    elapsed_days: 1,
    scheduled_days: 3,
    learning_steps: 0,
    reps: 2,
    lapses: 0,
    state: 2,
    ...extra,
  };
}

const minutes = (n: number) => Math.max(1, Math.round((n * 25) / 60));

function entrees(e: Etat, dues: string[] = [], nouvelles: string[] = [], plafond?: number): EntreesMission {
  return { etat: e, episodes: EPISODES, dues, nouvelles, minutes, ...(plafond ? { plafond } : {}) };
}

// ─── Avancement ──────────────────────────────────────────────────────────────

describe('avancement', () => {
  it('compte seulement les notions qui existent encore', () => {
    const e = etat({
      progression: { 'react/06-usestate': { sectionsVues: ['n1', 'n2', 'ancienne'], termine: false, derniereVisite: ISO('2026-10-07') } },
    });
    const a = avancement(e, EPISODES[2]!);
    expect(a).toEqual({ vues: 2, total: 5, part: 0.4, termine: false, commence: true });
  });

  it('vaut 1 quand le cours est terminé', () => {
    const e = etat({ progression: { 'react/01-intro': { sectionsVues: [], termine: true, derniereVisite: ISO('2026-10-07') } } });
    expect(avancement(e, EPISODES[1]!)).toMatchObject({ part: 1, termine: true, commence: true });
  });

  it("un cours ouvert sans notion vue n'est pas commencé", () => {
    const e = etat({ progression: { 'react/01-intro': { sectionsVues: [], termine: false, derniereVisite: ISO('2026-10-07') } } });
    expect(avancement(e, EPISODES[1]!).commence).toBe(false);
  });

  it('minutes restantes au prorata, jamais moins de 1', () => {
    expect(minutesRestantes(EPISODES[2]!, { vues: 2, total: 5, part: 0.4, termine: false, commence: true })).toBe(6);
    expect(minutesRestantes(EPISODES[2]!, { vues: 5, total: 5, part: 0.99, termine: false, commence: true })).toBe(1);
  });
});

// ─── Mission du jour ─────────────────────────────────────────────────────────

describe('choisirMission', () => {
  it('première visite : Bienvenue dans Manabi, même s’il y a des nouvelles cartes', () => {
    const e = etat();
    expect(estPremiereVisite(e)).toBe(true);
    const m = choisirMission(entrees(e, [], ['react/01-intro::abc']));
    expect(m).toEqual({ type: 'bienvenue', episode: EPISODES[0] });
  });

  it('aucun cours sur le site : mission vide', () => {
    expect(choisirMission({ ...entrees(etat()), episodes: [] })).toEqual({ type: 'vide' });
  });

  it('des cartes : réviser N cartes, durée estimée, matières et lien vers le cours en cours', () => {
    const e = etat({
      progression: { 'react/06-usestate': { sectionsVues: ['n1', 'n2', 'n3'], termine: false, derniereVisite: ISO('2026-10-07') } },
    });
    const m = choisirMission(entrees(e, ['react/06-usestate::a', 'css/03-position::b'], ['react/06-usestate::c']));
    expect(m.type).toBe('reviser');
    if (m.type !== 'reviser') return;
    expect(m.cartes).toBe(3);
    expect(m.total).toBe(3);
    expect(m.minutes).toBe(1);
    expect(m.matieres).toEqual(['React', 'HTML & CSS']);
    expect(m.premier?.id).toBe('react/06-usestate');
    expect(m.secondaire).toMatchObject({ type: 'continuer', episode: { id: 'react/06-usestate' }, avancement: { vues: 3, total: 5 } });
  });

  it('réviser : session plafonnée à tailleSession, sans doublon dues/nouvelles', () => {
    const e = etat({ progression: { 'manabi/01-bienvenue': { sectionsVues: ['a'], termine: false, derniereVisite: ISO('2026-10-07') } } });
    const dues = Array.from({ length: 30 }, (_, i) => `react/01-intro::d${i}`);
    const m = choisirMission(entrees(e, dues, ['react/01-intro::d0', 'react/01-intro::n1'], 15));
    expect(m).toMatchObject({ type: 'reviser', cartes: 15, total: 31, minutes: 6 });
  });

  it('réviser sans cours commencé : le lien secondaire propose le prochain cours non lu', () => {
    const e = etat({ srs: { 'react/01-intro::a': carte(ISO('2026-10-01')) } });
    const m = choisirMission(entrees(e, ['react/01-intro::a']));
    expect(m).toMatchObject({ type: 'reviser', secondaire: { type: 'commencer', episode: { id: 'manabi/01-bienvenue' } } });
  });

  it('pas de carte : continuer le cours commencé le plus récent', () => {
    const e = etat({
      progression: {
        'manabi/01-bienvenue': { sectionsVues: ['a'], termine: false, derniereVisite: ISO('2026-10-01') },
        'css/03-position': { sectionsVues: ['p1'], termine: false, derniereVisite: ISO('2026-10-06') },
      },
    });
    const m = choisirMission(entrees(e));
    expect(m).toMatchObject({
      type: 'continuer',
      episode: { id: 'css/03-position' },
      avancement: { vues: 1, total: 5 },
      minutes: 8,
      secondaire: { type: 'commencer', episode: { id: 'react/01-intro' } },
    });
  });

  it('rien en cours : commencer le prochain cours non lu, dans l’ordre de lecture', () => {
    const e = etat({
      progression: {
        'manabi/01-bienvenue': { sectionsVues: ['a', 'b', 'c', 'd'], termine: true, derniereVisite: ISO('2026-10-01') },
        // ouvert, mais aucune notion vue : il compte comme « non lu »
        'react/01-intro': { sectionsVues: [], termine: false, derniereVisite: ISO('2026-10-02') },
      },
    });
    expect(choisirMission(entrees(e))).toEqual({ type: 'commencer', episode: EPISODES[1] });
  });

  it('tout est terminé : félicitations', () => {
    const progression = Object.fromEntries(
      EPISODES.map((x) => [x.id, { sectionsVues: x.notions ?? [], termine: true, derniereVisite: ISO('2026-10-01') }]),
    );
    expect(choisirMission(entrees(etat({ progression })))).toEqual({ type: 'termine', cours: 4 });
  });
});

// ─── Reprendre ───────────────────────────────────────────────────────────────

describe('aReprendre', () => {
  it('3 derniers cours ouverts non terminés, du plus récent au plus ancien', () => {
    const e = etat({
      progression: {
        'manabi/01-bienvenue': { sectionsVues: ['a'], termine: false, derniereVisite: ISO('2026-10-01') },
        'react/01-intro': { sectionsVues: ['x', 'y'], termine: true, derniereVisite: ISO('2026-10-08') },
        'react/06-usestate': { sectionsVues: [], termine: false, derniereVisite: ISO('2026-10-05') },
        'css/03-position': { sectionsVues: ['p1', 'p2'], termine: false, derniereVisite: ISO('2026-10-07') },
        'cours/supprime': { sectionsVues: ['z'], termine: false, derniereVisite: ISO('2026-10-08') },
      },
    });
    const liste = aReprendre(e, EPISODES, 3);
    expect(liste.map((r) => r.episode.id)).toEqual(['css/03-position', 'react/06-usestate', 'manabi/01-bienvenue']);
    expect(liste[0]?.avancement).toMatchObject({ vues: 2, total: 5 });
    expect(aReprendre(e, EPISODES, 1)).toHaveLength(1);
  });

  it('ignore une entrée sans vraie date de visite', () => {
    const e = etat({ progression: { 'react/01-intro': { sectionsVues: ['x'], termine: false, derniereVisite: '' } } });
    expect(aReprendre(e, EPISODES)).toEqual([]);
  });
});

// ─── Révisions ───────────────────────────────────────────────────────────────

describe('resumeRevisions', () => {
  const maintenant = new Date('2026-10-08T15:00:00');

  it('à revoir, nouvelles, faites aujourd’hui et demain (jour local)', () => {
    const e = etat({
      srs: {
        'r::fait-auj': carte(ISO('2026-10-11'), { last_review: ISO('2026-10-08', '09:00') }),
        'r::demain-matin': carte(ISO('2026-10-09', '08:00'), { last_review: ISO('2026-10-05') }),
        'r::demain-soir': carte(ISO('2026-10-09', '23:30')),
        'r::apres-demain': carte(ISO('2026-10-10', '00:30')),
        'r::due': carte(ISO('2026-10-08', '14:00')),
        'cours-supprime::x': carte(ISO('2026-10-09', '10:00')),
      },
    });
    const connues = ['r::fait-auj', 'r::demain-matin', 'r::demain-soir', 'r::apres-demain', 'r::due'];
    const r = resumeRevisions(e, { dues: ['r::due'], nouvelles: ['r::n1', 'r::n2'] }, connues, maintenant);
    expect(r).toEqual({ aRevoir: 1, nouvelles: 2, faites: 1, demain: 2, part: 0.25 });
  });

  it('sans liste connue : aucun filtre ; rien à faire : part 0', () => {
    const e = etat({ srs: { 'x::1': carte(ISO('2026-10-09', '12:00')) } });
    expect(resumeRevisions(e, { dues: [], nouvelles: [] }, [], maintenant)).toEqual({ aRevoir: 0, nouvelles: 0, faites: 0, demain: 1, part: 0 });
  });

  it('tout est fait : part 1', () => {
    const e = etat({ srs: { 'x::1': carte(ISO('2026-10-12'), { last_review: ISO('2026-10-08', '08:00') }) } });
    expect(resumeRevisions(e, { dues: [], nouvelles: [] }, [], maintenant).part).toBe(1);
  });
});

// ─── Textes et données ───────────────────────────────────────────────────────

describe('textes', () => {
  it('listeMatieres', () => {
    expect(listeMatieres([])).toBe('');
    expect(listeMatieres(['React'])).toBe('React');
    expect(listeMatieres(['React', 'CSS'])).toBe('React et CSS');
    expect(listeMatieres(['React', 'JavaScript', 'CSS'])).toBe('React, JavaScript et CSS');
    expect(listeMatieres(['A', 'B', 'C', 'D', 'E'])).toBe('A, B et 3 autres');
  });

  it('notions et pourcentage avec espaces fines insécables', () => {
    expect(texteNotions({ vues: 3, total: 5 })).toBe('3 / 5 notions');
    expect(texteNotions({ vues: 0, total: 1 })).toBe('0 / 1 notion');
    expect(pourcent(0.6)).toBe('60 %');
    expect(pourcent(1.4)).toBe('100 %');
  });

  it('coursDeCarte', () => {
    expect(coursDeCarte('react/06-usestate::k3x9')).toBe('react/06-usestate');
    expect(coursDeCarte('sans-separateur')).toBe('sans-separateur');
  });
});

describe('données du DOM', () => {
  it('validerEpisodes garde les épisodes bien formés', () => {
    const brut = [
      { id: 'a/01', url: '/a/', titre: 'A', chapitre: 1, matiere: 'A', duree: 5, essentiel: 'e', notions: ['x', 3] },
      { id: 'b/01', url: '/b/' }, // sans titre : ignoré
      null,
      { id: 'c/01', url: '/c/', titre: 'C', duree: -2 },
    ];
    const liste = validerEpisodes(brut);
    expect(liste.map((e) => e.id)).toEqual(['a/01', 'c/01']);
    expect(liste[0]?.notions).toEqual(['x']);
    expect(liste[1]).toMatchObject({ chapitre: 0, duree: 1, matiere: '', essentiel: '' });
    expect(validerEpisodes('pas un tableau')).toEqual([]);
  });

  it('validerCartes déduit le cours de l’id', () => {
    expect(validerCartes(['react/06-usestate::abc', 'invalide', 42, '::x'])).toEqual([{ id: 'react/06-usestate::abc', coursId: 'react/06-usestate' }]);
  });
});
