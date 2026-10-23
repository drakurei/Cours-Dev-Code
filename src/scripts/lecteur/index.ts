/**
 * Lecteur de cours (§5) : point d'entrée, chargé par src/layouts/CoursLayout.astro.
 * La page marche sans JavaScript ; ce script ajoute :
 *   barre de lecture, scrollspy du sommaire (+ feuille mobile), boutons « Écouter » des notions,
 *   Mode Focus (F), raccourcis J / K.
 * Racine : [data-lecteur="<coursId>"][data-duree="<minutes>"].
 */
import { brancherBarre } from './barre.ts';
import { ajouterBoutonsEcoute } from './ecoute-notions.ts';
import { brancherFocus } from './focus.ts';
import { brancherRaccourcis } from './raccourcis.ts';
import { brancherSommaire } from './sommaire.ts';

const racine = document.querySelector<HTMLElement>('[data-lecteur]');
const coursId = racine?.dataset.lecteur;

if (racine && coursId) {
  ajouterBoutonsEcoute(document.getElementById('contenu-cours'));
  const sommaire = brancherSommaire(coursId, Number(racine.dataset.duree) || 0);
  brancherBarre(racine.querySelector<HTMLElement>('.lecteur__article'));
  const focus = brancherFocus({ coursId, sectionCourante: sommaire.courante });
  const fin = document.getElementById('fin-du-cours');
  brancherRaccourcis(focus, () => [...sommaire.cibles(), ...(fin ? [fin] : [])]);
} else {
  document.documentElement.removeAttribute('data-focus');
}
