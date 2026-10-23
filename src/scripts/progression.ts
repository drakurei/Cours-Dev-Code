/**
 * Progression côté navigateur, sans React : relit le store et met à jour la page.
 * Rejoué à chaque « manabi:change » (cet onglet ou un autre).
 *
 * Attributs reconnus (posés au build par les composants) :
 *   [data-enso-cours="react/06-usestate"][data-enso-sections="5"]  ensō d'UN cours (notions vues / total ; 1 si terminé)
 *   [data-enso-ids="id1 id2 …"]                                     ensō d'un ensemble (part des cours terminés)
 *   [data-tome="react"][data-tome-ids="id1 id2 …"]                  couverture de tome : --progression (0..1) + data-progression-texte
 *   [data-chapitre="id"]                                            reçoit data-statut="a-lire|en-cours|termine"
 *   [data-hanko-cours="id"]                                         visible (hidden retiré) si le cours est terminé
 *   [data-badge="a-reviser"]                                        nombre de cartes dues (caché si 0)
 *   [data-compteur="petales|serie|record"]                          texte = valeur
 *   [data-libelle-compteur="serie"][data-singulier][data-pluriel]   libellé accordé au nombre
 *   [data-statut-cours="id"]                                        reçoit data-statut (comme un chapitre)
 * Actions :
 *   [data-cours-visite="id"]                       la page enregistre la visite au chargement
 *   [data-notions-cours="id"] section.notion[data-notion]   notions marquées « vues » en lisant
 *   button[data-action="terminer"][data-cours-id]  « J'ai compris ce cours » → terminé + hanko animé
 * Un ensō est mis à jour via la variable CSS --valeur (0..1) et data-valeur (0..100).
 */
import {
  abonner,
  compterCartesDues,
  enregistrerVisite,
  lire,
  marquerSectionVue,
  marquerTermine,
  serieDuJour,
  type Etat,
} from '../lib/store.ts';

type Statut = 'a-lire' | 'en-cours' | 'termine';

const ids = (valeur: string | undefined): string[] => (valeur ?? '').split(/\s+/).filter(Boolean);

function statutDe(etat: Etat, id: string): Statut {
  const p = etat.progression[id];
  if (!p) return 'a-lire';
  if (p.termine) return 'termine';
  return p.sectionsVues.length > 0 ? 'en-cours' : 'a-lire';
}

function valeurCours(etat: Etat, id: string, total: number): number {
  const p = etat.progression[id];
  if (!p) return 0;
  if (p.termine) return 1;
  if (total <= 0) return 0;
  return Math.min(1, p.sectionsVues.length / total);
}

function partTermines(etat: Etat, liste: string[]): number {
  if (!liste.length) return 0;
  return liste.filter((id) => etat.progression[id]?.termine).length / liste.length;
}

function poserEnso(el: HTMLElement | SVGElement, valeur: number): void {
  const pourcent = Math.round(valeur * 100);
  el.style.setProperty('--valeur', String(valeur));
  el.dataset.valeur = String(pourcent);
  const etiquette = el.querySelector('[data-enso-texte]');
  if (etiquette) etiquette.textContent = `${pourcent}\u202f%`; // espace fine insécable
  const libelle = el.getAttribute('data-enso-libelle');
  if (libelle) el.setAttribute('aria-label', `${libelle} : ${pourcent} %`);
}

export function appliquer(etat: Etat = lire()): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-enso-cours]')) {
    poserEnso(el, valeurCours(etat, el.dataset.ensoCours ?? '', Number(el.dataset.ensoSections ?? 0)));
  }
  for (const el of document.querySelectorAll<HTMLElement>('[data-enso-ids]')) {
    poserEnso(el, partTermines(etat, ids(el.dataset.ensoIds)));
  }
  for (const el of document.querySelectorAll<HTMLElement>('[data-tome-ids]')) {
    const liste = ids(el.dataset.tomeIds);
    const faits = liste.filter((id) => etat.progression[id]?.termine).length;
    el.style.setProperty('--progression', String(liste.length ? faits / liste.length : 0));
    const texte = el.querySelector('[data-progression-texte]');
    if (texte) texte.textContent = liste.length ? `${faits}/${liste.length}` : '';
  }
  for (const el of document.querySelectorAll<HTMLElement>('[data-chapitre], [data-statut-cours]')) {
    el.dataset.statut = statutDe(etat, el.dataset.chapitre ?? el.dataset.statutCours ?? '');
  }
  for (const el of document.querySelectorAll<HTMLElement>('[data-hanko-cours]')) {
    el.hidden = !etat.progression[el.dataset.hankoCours ?? '']?.termine;
  }
  const dues = compterCartesDues(etat);
  for (const el of document.querySelectorAll<HTMLElement>('[data-badge="a-reviser"]')) {
    el.textContent = dues > 99 ? '99+' : String(dues);
    el.hidden = dues === 0;
    el.setAttribute('aria-label', `${dues} carte${dues > 1 ? 's' : ''} à réviser`);
  }
  const compteurs: Record<string, number> = {
    petales: etat.stats.petales,
    serie: serieDuJour(etat),
    record: etat.stats.serie.record,
  };
  for (const el of document.querySelectorAll<HTMLElement>('[data-compteur]')) {
    const v = compteurs[el.dataset.compteur ?? ''];
    if (v !== undefined) el.textContent = String(v);
  }
  // Libellés accordés au nombre : « 1 jour de suite », « 3 jours de suite ».
  for (const el of document.querySelectorAll<HTMLElement>('[data-libelle-compteur]')) {
    const v = compteurs[el.dataset.libelleCompteur ?? ''] ?? 0;
    const texte = v > 1 ? el.dataset.pluriel : el.dataset.singulier;
    if (texte) el.textContent = texte;
  }
  for (const btn of document.querySelectorAll<HTMLButtonElement>('button[data-action="terminer"]')) {
    const fait = !!etat.progression[btn.dataset.coursId ?? '']?.termine;
    btn.dataset.termine = String(fait);
    btn.setAttribute('aria-pressed', String(fait));
    const libelle = btn.querySelector('[data-libelle]');
    if (libelle) libelle.textContent = fait ? 'Cours terminé' : 'J’ai compris ce cours';
  }
}

/** Notions vues : une notion compte quand son titre a été lu et qu'on a avancé dedans. */
function suivreNotions(): void {
  const conteneur = document.querySelector<HTMLElement>('[data-notions-cours]');
  const coursId = conteneur?.dataset.notionsCours;
  if (!conteneur || !coursId || !('IntersectionObserver' in window)) return;
  const notions = conteneur.querySelectorAll<HTMLElement>('section.notion[data-notion]');
  const croisees = new WeakSet<Element>(); // notions déjà apparues à l'écran
  const observateur = new IntersectionObserver(
    (entrees) => {
      for (const e of entrees) {
        // Vue si elle occupe une bonne part de l'écran, ou si on l'a lue puis dépassée vers le haut.
        const grande = e.isIntersecting && e.intersectionRect.height > window.innerHeight * 0.6;
        const depassee = croisees.has(e.target) && !e.isIntersecting && e.boundingClientRect.top < 0;
        if (e.isIntersecting) croisees.add(e.target);
        if (e.intersectionRatio >= 0.5 || grande || depassee) {
          const id = (e.target as HTMLElement).dataset.notion;
          if (id) marquerSectionVue(coursId, id);
          observateur.unobserve(e.target);
        }
      }
    },
    { threshold: [0, 0.25, 0.5, 0.75, 1] },
  );
  for (const n of notions) {
    if (!lire().progression[coursId]?.sectionsVues.includes(n.dataset.notion ?? '')) observateur.observe(n);
  }
}

function brancherActions(): void {
  const visite = document.querySelector<HTMLElement>('[data-cours-visite]')?.dataset.coursVisite;
  if (visite) enregistrerVisite(visite);

  document.addEventListener('click', (ev) => {
    const btn = (ev.target as Element | null)?.closest<HTMLButtonElement>('button[data-action="terminer"]');
    const id = btn?.dataset.coursId;
    if (!btn || !id) return;
    if (!marquerTermine(id)) return;
    for (const hanko of document.querySelectorAll<HTMLElement>(`[data-hanko-cours="${CSS.escape(id)}"]`)) {
      hanko.hidden = false;
      hanko.dataset.anime = 'true'; // déclenche l'animation « tamponnée »
    }
    const annonce = document.querySelector('[data-annonce]');
    if (annonce) annonce.textContent = 'Cours terminé : tampon 済 posé, 10 pétales gagnés.';
  });
}

appliquer();
abonner(appliquer);
brancherActions();
suivreNotions();
