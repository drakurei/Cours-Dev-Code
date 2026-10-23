/**
 * Surlignage des termes trouvés et extraits autour de la première correspondance.
 * Les positions sont calculées sur le texte normalisé (sans accents) puis rapportées
 * au texte d'origine : « etat » surligne bien « État ».
 */

export interface Segment {
  texte: string;
  marque: boolean;
}

interface Carte {
  /** Texte normalisé (minuscules, sans accents). */
  norme: string;
  /** Pour chaque caractère de `norme`, l'index du caractère d'origine. */
  origine: number[];
}

const MARQUES = /[̀-ͯ]/g;
const LETTRE = /[\p{L}\p{N}]/u;

function cartographier(texte: string): Carte {
  let norme = '';
  const origine: number[] = [];
  for (let i = 0; i < texte.length; i++) {
    const n = (texte[i] ?? '').normalize('NFD').replace(MARQUES, '').toLowerCase();
    for (const c of n) {
      norme += c;
      origine.push(i);
    }
  }
  return { norme, origine };
}

/** Début de mot : rien de lettre avant, ou frontière camelCase (« use|State »). */
function debutDeMot(texte: string, carte: Carte, p: number): boolean {
  if (p === 0) return true;
  const avant = carte.norme[p - 1] ?? '';
  if (!LETTRE.test(avant)) return true;
  const i = carte.origine[p] ?? 0;
  const c = texte[i] ?? '';
  const prec = texte[i - 1] ?? '';
  return c !== c.toLowerCase() && prec === prec.toLowerCase() && prec !== prec.toUpperCase();
}

/**
 * Plages [début, fin[ à surligner dans `texte`.
 * `termes` = termes du document trouvés ; `requete` = mots tapés : un préfixe tapé
 * (« uses » pour « usestate ») n'est surligné que sur sa longueur.
 */
export function plages(texte: string, termes: ReadonlyArray<string>, requete: ReadonlyArray<string> = []): [number, number][] {
  if (!texte || !termes.length) return [];
  const carte = cartographier(texte);
  const trouvees: [number, number][] = [];

  for (const terme of new Set(termes)) {
    if (!terme) continue;
    const prefixe = requete.filter((q) => q && terme.startsWith(q)).sort((a, b) => b.length - a.length)[0];
    const longueur = prefixe?.length ?? terme.length;
    for (let p = carte.norme.indexOf(terme); p !== -1; p = carte.norme.indexOf(terme, p + 1)) {
      if (!debutDeMot(texte, carte, p)) continue;
      const debut = carte.origine[p] ?? 0;
      const fin = (carte.origine[p + longueur - 1] ?? debut) + 1;
      trouvees.push([debut, fin]);
    }
  }

  // Fusion des plages qui se chevauchent.
  trouvees.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const fusion: [number, number][] = [];
  for (const [d, f] of trouvees) {
    const der = fusion[fusion.length - 1];
    if (der && d <= der[1]) der[1] = Math.max(der[1], f);
    else fusion.push([d, f]);
  }
  return fusion;
}

/** Découpe un texte en segments normaux / surlignés. */
export function surligner(texte: string, termes: ReadonlyArray<string>, requete: ReadonlyArray<string> = []): Segment[] {
  const p = plages(texte, termes, requete);
  if (!p.length) return texte ? [{ texte, marque: false }] : [];
  const segments: Segment[] = [];
  let curseur = 0;
  for (const [d, f] of p) {
    if (d > curseur) segments.push({ texte: texte.slice(curseur, d), marque: false });
    segments.push({ texte: texte.slice(d, f), marque: true });
    curseur = f;
  }
  if (curseur < texte.length) segments.push({ texte: texte.slice(curseur), marque: false });
  return segments;
}

/**
 * Extrait d'au plus `longueur` caractères centré sur la première correspondance,
 * coupé sur des mots, avec « … » aux bords coupés.
 */
export function extrait(texte: string, termes: ReadonlyArray<string>, longueur = 110, requete: ReadonlyArray<string> = []): string {
  if (texte.length <= longueur) return texte;
  const premiere = plages(texte, termes, requete)[0];
  if (!premiere || premiere[0] < longueur * 0.5) {
    const coupe = texte.slice(0, longueur);
    const espace = coupe.lastIndexOf(' ');
    return `${(espace > longueur * 0.6 ? coupe.slice(0, espace) : coupe).trimEnd()}…`;
  }
  let debut = Math.max(0, premiere[0] - Math.round(longueur * 0.3));
  const espaceAvant = texte.lastIndexOf(' ', debut);
  if (espaceAvant > 0 && debut - espaceAvant < 20) debut = espaceAvant + 1;
  let fin = Math.min(texte.length, debut + longueur);
  // Coupe sur le dernier espace (sans jamais dépasser la longueur demandée).
  const espaceAvantFin = texte.lastIndexOf(' ', fin);
  if (fin < texte.length && espaceAvantFin > premiere[1] && fin - espaceAvantFin < 20) fin = espaceAvantFin;
  return `${debut > 0 ? '…' : ''}${texte.slice(debut, fin).trim()}${fin < texte.length ? '…' : ''}`;
}
