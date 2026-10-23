/**
 * Images de la source (PNG, JPG, WEBP) : redimensionnées si un côté dépasse 2000 px
 * (limite conseillée par l'API Claude), vignette pour l'affichage. Navigateur seulement.
 */

export const COTE_MAX = 2000;
export const TYPES_IMAGES = ['image/png', 'image/jpeg', 'image/webp'] as const;

export interface ImagePreparee {
  blob: Blob;
  type: string;
  largeur: number;
  hauteur: number;
  redimensionnee: boolean;
  /** data: URL d'une petite vignette (affichage seulement). */
  vignette: string;
}

/** Dimensions ramenées sous `max` (proportions gardées). Pure. */
export function dimensionsReduites(largeur: number, hauteur: number, max = COTE_MAX): { largeur: number; hauteur: number } {
  const cote = Math.max(largeur, hauteur);
  if (cote <= max) return { largeur, hauteur };
  const r = max / cote;
  return { largeur: Math.round(largeur * r), hauteur: Math.round(hauteur * r) };
}

function dessiner(source: ImageBitmap, largeur: number, hauteur: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = largeur;
  canvas.height = hauteur;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas indisponible');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, largeur, hauteur);
  return canvas;
}

/** Prépare une image déposée. Lève une Error en français si elle ne se lit pas. */
export async function preparerImage(fichier: Blob): Promise<ImagePreparee> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(fichier);
  } catch {
    throw new Error('image illisible (fichier abîmé ou format non pris en charge)');
  }
  try {
    const type = (TYPES_IMAGES as readonly string[]).includes(fichier.type) ? fichier.type : 'image/png';
    const cible = dimensionsReduites(bitmap.width, bitmap.height);
    const redimensionnee = cible.largeur !== bitmap.width || cible.hauteur !== bitmap.height;
    let blob: Blob = fichier;
    if (redimensionnee) {
      const canvas = dessiner(bitmap, cible.largeur, cible.hauteur);
      const sortie = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, type, 0.9));
      if (sortie) blob = sortie;
    }
    const mini = dimensionsReduites(bitmap.width, bitmap.height, 200);
    const vignette = dessiner(bitmap, mini.largeur, mini.hauteur).toDataURL('image/jpeg', 0.8);
    return { blob, type: blob.type || type, largeur: cible.largeur, hauteur: cible.hauteur, redimensionnee, vignette };
  } finally {
    bitmap.close();
  }
}

/** Vignette d'un blob image déjà préparé (après un rendu de page PDF). */
export async function vignetteDe(blob: Blob): Promise<string> {
  const bitmap = await createImageBitmap(blob);
  try {
    const mini = dimensionsReduites(bitmap.width, bitmap.height, 200);
    return dessiner(bitmap, mini.largeur, mini.hauteur).toDataURL('image/jpeg', 0.8);
  } finally {
    bitmap.close();
  }
}
