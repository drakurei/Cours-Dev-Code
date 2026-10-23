/**
 * PDF dans le navigateur (pdf.js, chargé à la demande : seulement dans l'Atelier).
 * - lirePdf : texte de chaque page + nombre de pages ;
 * - vignettesPdf : petites images des premières pages ;
 * - pagesEnImages : pages rendues en PNG (PDF scanné → images pour Claude), 20 au plus.
 */
import { estScanne } from './source.ts';

type PdfJs = typeof import('pdfjs-dist');

let chargement: Promise<PdfJs> | null = null;

/** pdf.js + son worker (fichier séparé servi par Vite, import ?url). */
function pdfjs(): Promise<PdfJs> {
  chargement ??= Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(([lib, worker]) => {
    lib.GlobalWorkerOptions.workerSrc = worker.default;
    return lib;
  });
  // Un échec (réseau) ne doit pas bloquer les essais suivants.
  chargement.catch(() => {
    chargement = null;
  });
  return chargement;
}

export const MAX_PAGES_IMAGES = 20;

/**
 * Ouvre un PDF. pdf.js transfère les octets au worker : on lui donne toujours une copie.
 * `fermer` libère le worker et la mémoire (destroy de la tâche de chargement).
 */
async function ouvrir(octets: Uint8Array) {
  const lib = await pdfjs();
  const tache = lib.getDocument({ data: octets.slice() });
  try {
    const doc = await tache.promise;
    return Object.assign(doc, { fermer: () => void tache.destroy() });
  } catch (e) {
    void tache.destroy();
    throw e;
  }
}

export interface PdfLu {
  pages: number;
  textes: string[];
  scanne: boolean;
}

/** Texte de chaque page (les lignes sont gardées). */
export async function lirePdf(octets: Uint8Array): Promise<PdfLu> {
  const doc = await ouvrir(octets);
  try {
    const textes: string[] = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const contenu = await page.getTextContent();
      let t = '';
      for (const item of contenu.items) {
        if (!('str' in item)) continue;
        t += item.str;
        t += item.hasEOL ? '\n' : item.str && !item.str.endsWith(' ') ? ' ' : '';
      }
      textes.push(t.replace(/[ \t]+\n/g, '\n').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim());
      page.cleanup();
    }
    return { pages: doc.numPages, textes, scanne: estScanne(textes) };
  } finally {
    doc.fermer();
  }
}

async function rendrePage(doc: Awaited<ReturnType<typeof ouvrir>>, n: number, cote: number): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(n);
  const base = page.getViewport({ scale: 1 });
  const echelle = cote / Math.max(base.width, base.height);
  const vue = page.getViewport({ scale: echelle });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(vue.width);
  canvas.height = Math.round(vue.height);
  await page.render({ canvas, viewport: vue }).promise;
  page.cleanup();
  return canvas;
}

/** Vignettes (data: URL) des `n` premières pages. */
export async function vignettesPdf(octets: Uint8Array, n = 3, cote = 160): Promise<string[]> {
  const doc = await ouvrir(octets);
  try {
    const sorties: string[] = [];
    for (let i = 1; i <= Math.min(n, doc.numPages); i++) {
      const canvas = await rendrePage(doc, i, cote);
      sorties.push(canvas.toDataURL('image/jpeg', 0.82));
    }
    return sorties;
  } finally {
    doc.fermer();
  }
}

export interface PageImage {
  page: number;
  blob: Blob;
  largeur: number;
  hauteur: number;
}

/** Pages en PNG (côté le plus long : `cote` px, 2000 au plus pour l'API). */
export async function pagesEnImages(octets: Uint8Array, cote = 1600, max = MAX_PAGES_IMAGES, surPage: (n: number, total: number) => void = () => {}): Promise<PageImage[]> {
  const doc = await ouvrir(octets);
  try {
    const total = Math.min(max, doc.numPages);
    const sorties: PageImage[] = [];
    for (let n = 1; n <= total; n++) {
      surPage(n, total);
      const canvas = await rendrePage(doc, n, Math.min(cote, 2000));
      const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/png'));
      if (blob) sorties.push({ page: n, blob, largeur: canvas.width, hauteur: canvas.height });
    }
    return sorties;
  } finally {
    doc.fermer();
  }
}
