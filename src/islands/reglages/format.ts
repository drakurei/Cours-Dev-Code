/**
 * Petits formats des Réglages (purs, testés dans tests/reglages.test.ts).
 */
import { formaterDate } from '../../lib/libelles.ts';
import { jourLocal, normaliser, type Etat } from '../../lib/store.ts';
import { pluriel } from '../../lib/texte.ts';

const deuxChiffres = (n: number) => String(n).padStart(2, '0');

/** « 14:32 » (heure locale). */
export function heure(d: Date): string {
  return `${deuxChiffres(d.getHours())}:${deuxChiffres(d.getMinutes())}`;
}

/**
 * Moment d'une synchro, en clair : « à l'instant », « il y a 3 min »,
 * « aujourd'hui à 14:32 », « hier à 09:05 », « le 8 oct. 2026 à 14:32 ».
 */
export function momentRelatif(iso: string | null, maintenant: Date = new Date()): string {
  if (!iso) return 'jamais';
  const d = new Date(iso);
  const t = d.getTime();
  if (Number.isNaN(t)) return 'jamais';
  const ecart = maintenant.getTime() - t;
  if (ecart < 60_000 && ecart > -60_000) return 'à l’instant';
  if (ecart > 0 && ecart < 60 * 60_000) return `il y a ${Math.floor(ecart / 60_000)} min`;
  const jour = jourLocal(d);
  if (jour === jourLocal(maintenant)) return `aujourd’hui à ${heure(d)}`;
  const hier = new Date(maintenant);
  hier.setDate(hier.getDate() - 1);
  if (jour === jourLocal(hier)) return `hier à ${heure(d)}`;
  return `le ${formaterDate(jour)} à ${heure(d)}`;
}

/** 1.15 → « 115 % » (espace insécable fine avant %). */
export function pourcent(taille: number): string {
  return `${Math.round(taille * 100)} %`;
}

/** 1 → « 1,0× » ; 1.25 → « 1,3× ». */
export function vitesse(v: number): string {
  return `${v.toFixed(1).replace('.', ',')}×`;
}

/** Nom lisible d'une voix : « Denise (fr-FR) » plutôt que « Microsoft Denise Online (Natural) - French (France) ». */
export function nomVoix(nom: string, langue: string): string {
  const court = nom
    .replace(/^(Microsoft|Google|Apple)\s+/i, '')
    .replace(/\s+-\s+.*$/, '')
    .replace(/\s+Online\s*\(Natural\)/i, ' (naturelle)')
    .trim();
  return `${court || nom} · ${langue}`;
}

/** Nom de fichier de l'export : « manabi-sauvegarde-2026-10-08.json ». */
export function nomExport(d: Date = new Date()): string {
  return `manabi-sauvegarde-${jourLocal(d)}.json`;
}

/** « 12 cours · 40 cartes · 230 pétales » : ce que contient une progression. */
export function resumeEtat(e: Etat): string {
  const cours = Object.keys(e.progression).length;
  const cartes = Object.keys(e.srs).length;
  return `${pluriel(cours, 'cours', 'cours')} · ${pluriel(cartes, 'carte')} · ${pluriel(e.stats.petales, 'pétale')}`;
}

export type FichierAnalyse = { ok: true; etat: Etat; resume: string } | { ok: false; message: string };

/** Vérifie un fichier choisi pour l'import, AVANT de demander confirmation. */
export function analyserFichier(texte: string): FichierAnalyse {
  let brut: unknown;
  try {
    brut = JSON.parse(texte);
  } catch {
    return { ok: false, message: 'Ce fichier n’est pas un JSON valide.' };
  }
  const objet = brut && typeof brut === 'object' && !Array.isArray(brut) ? (brut as Record<string, unknown>) : null;
  if (!objet || objet.version === undefined || !objet.prefs || typeof objet.prefs !== 'object') {
    return { ok: false, message: 'Ce fichier n’est pas une sauvegarde Manabi.' };
  }
  const etat = normaliser(objet);
  const date = /^\d{4}-\d{2}-\d{2}/.test(etat.maj) && !etat.maj.startsWith('1970') ? `Sauvegarde du ${formaterDate(jourLocal(new Date(etat.maj)))} : ` : '';
  return { ok: true, etat, resume: `${date}${resumeEtat(etat)}.` };
}

/** « il y a 3 min » → « Il y a 3 min » (valeur seule dans une ligne). */
export function majuscule(texte: string): string {
  return texte.charAt(0).toLocaleUpperCase('fr') + texte.slice(1);
}
