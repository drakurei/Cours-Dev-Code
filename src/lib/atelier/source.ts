/**
 * De la source saisie (étape 1) au prompt (étape 2). Pur : testable.
 *
 * Deux façons de générer, deux façons d'envoyer les fichiers :
 * - « universel » (n'importe quelle IA) : le texte des PDF va dans le prompt (sauf choix contraire
 *   ou PDF scanné) ; images et PDF sans texte sont à joindre à la main dans l'IA ;
 * - « claude » (API) : les PDF partent en blocs document et les images en blocs image ;
 *   le prompt ne contient alors que les textes (pas de doublon).
 */
import { construirePrompt, type MatierePrompt } from '../prompt.ts';
import { texteDuRepo } from './github.ts';
import { NOUVELLE_MATIERE, type Brouillon, type OngletGenerer } from './brouillon.ts';
import { slugifier } from '../texte.ts';

/** Seuil sous lequel un PDF est considéré comme scanné (caractères par page en moyenne). */
export const CARACTERES_PAR_PAGE_MIN = 40;

export function estScanne(textes: string[]): boolean {
  if (textes.length === 0) return true;
  const total = textes.reduce((n, t) => n + t.replace(/\s+/g, '').length, 0);
  return total / textes.length < CARACTERES_PAR_PAGE_MIN;
}

/** Texte d'un PDF, page par page. */
export function texteDuPdf(nom: string, textes: string[]): string {
  const pages = textes.map((t, i) => `[page ${i + 1}]\n${t.trim()}`).filter((p) => p.replace(/^\[page \d+\]\n/, '').trim());
  return `--- PDF : ${nom} (${textes.length} page${textes.length > 1 ? 's' : ''}) ---\n${pages.join('\n\n')}`;
}

/** Slug de la matière choisie (nouvelle matière : slug du nom tapé). */
export function slugMatiere(b: Pick<Brouillon, 'matiere' | 'nomNouvelleMatiere'>): string {
  if (b.matiere === NOUVELLE_MATIERE) return slugifier(b.nomNouvelleMatiere);
  return b.matiere;
}

export interface Envoi {
  /** Texte de la source, pour le prompt. */
  source: string;
  /** Fichiers à joindre (universel) ou envoyés avec la requête (claude). */
  joints: string[];
  /** Ids des PDF à envoyer en bloc document (claude). */
  pdfs: string[];
  /** Ids des images à envoyer en bloc image (claude). */
  images: string[];
}

/**
 * Ce qui part dans le prompt et ce qui est joint, selon le mode.
 * `disponibles` : ids des fichiers dont on a encore les octets (après un rechargement, ils manquent).
 */
export function preparerEnvoi(b: Brouillon, mode: OngletGenerer, disponibles: ReadonlySet<string>): Envoi {
  const textes: string[] = [];
  const joints: string[] = [];
  const pdfs: string[] = [];
  const images: string[] = [];

  if (b.texte.trim()) textes.push(b.texte.trim());
  for (const t of b.textesFichiers) if (t.contenu.trim()) textes.push(`--- Fichier : ${t.nom} ---\n${t.contenu.trim()}`);

  for (const p of b.pdfs) {
    const aLeTexte = !p.scanne && p.textes.some((t) => t.trim());
    if (mode === 'claude') {
      if (p.enImages) continue; // ses pages partent en images
      if (disponibles.has(p.id)) {
        pdfs.push(p.id);
        joints.push(p.nom);
      } else if (aLeTexte) textes.push(texteDuPdf(p.nom, p.textes)); // fichier perdu : au moins le texte
    } else if (aLeTexte && p.inclureTexte) {
      textes.push(texteDuPdf(p.nom, p.textes));
    } else {
      joints.push(p.nom);
    }
  }

  for (const im of b.images) {
    if (mode === 'claude') {
      if (!disponibles.has(im.id)) continue;
      const pdf = im.depuisPdf ? b.pdfs.find((p) => p.id === im.depuisPdf) : undefined;
      if (im.depuisPdf && !pdf?.enImages) continue;
      images.push(im.id);
      joints.push(im.nom);
    } else if (!im.depuisPdf) {
      joints.push(im.nom); // les pages rendues ne servent qu'à Claude : dans une IA, on joint le PDF
    }
  }

  if (b.repo) textes.push(texteDuRepo(b.repo));
  return { source: textes.join('\n\n'), joints, pdfs, images };
}

/** Le prompt complet, rempli avec les choix de l'étape 1. */
export function promptPour(gabarit: string, b: Brouillon, matieres: MatierePrompt[], envoi: Envoi, date?: string): string {
  const slug = slugMatiere(b);
  const consigne = [
    b.consigne.trim(),
    b.matiere === NOUVELLE_MATIERE && b.nomNouvelleMatiere.trim()
      ? `Nouvelle matière : « ${b.nomNouvelleMatiere.trim()} » (slug ${slug}) ; remplis le champ nouvelleMatiere.`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
  return construirePrompt(gabarit, {
    matieres,
    matiere: slug,
    type: b.type,
    niveau: b.niveau,
    consigne,
    ...(date ? { date } : {}),
    source: envoi.source,
    nomsFichiersJoints: envoi.joints,
  });
}
