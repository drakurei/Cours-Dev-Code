/**
 * Génère les icônes PNG de la PWA depuis la fleur de sakura (même tracé que public/favicon.svg).
 * À relancer seulement si le logo change :  node integrations/generer-icones.mjs
 * (sharp est fourni par Astro ; les PNG sont versionnés dans public/icons/.)
 */
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const DOSSIER = fileURLToPath(new URL('../public/icons/', import.meta.url));
const WASHI = '#f6f5f2';
const SAKURA = '#b4405f';
const SAKURA_ENCRE = '#8e2f49';
const PETALE =
  'M50 46C45 42 37 33 37.5 23C38 15 44 11.5 47.6 15.5L50 19.5L52.4 15.5C56 11.5 62 15 62.5 23C63 33 55 42 50 46Z';

/** Fleur centrée, `echelle` = part de l'icône occupée (0..1). */
function fleur(echelle) {
  const decalage = (100 - 100 * echelle) / 2;
  const petales = [0, 72, 144, 216, 288]
    .map((a) => `<path d="${PETALE}" transform="rotate(${a} 50 50)"/>`)
    .join('');
  return `<g transform="translate(${decalage} ${decalage}) scale(${echelle})">
    <g fill="${SAKURA}">${petales}</g>
    <circle cx="50" cy="50" r="7.5" fill="${WASHI}"/>
    <circle cx="50" cy="50" r="3" fill="${SAKURA_ENCRE}"/>
  </g>`;
}

/** Tuile : fond washi (arrondi ou plein bord) + fleur. */
function svg({ arrondi, echelle }) {
  const fond = arrondi
    ? `<rect width="100" height="100" rx="22" fill="${WASHI}"/>`
    : `<rect width="100" height="100" fill="${WASHI}"/>`;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${fond}${fleur(echelle)}</svg>`);
}

const ICONES = [
  { nom: 'icon-192.png', taille: 192, arrondi: true, echelle: 0.8 },
  { nom: 'icon-512.png', taille: 512, arrondi: true, echelle: 0.8 },
  // Maskable : plein bord, fleur dans la zone sûre (cercle de 80 %).
  { nom: 'maskable-512.png', taille: 512, arrondi: false, echelle: 0.64 },
  // iOS arrondit lui-même les coins : plein bord.
  { nom: 'apple-touch-icon.png', taille: 180, arrondi: false, echelle: 0.74 },
];

await mkdir(DOSSIER, { recursive: true });
for (const i of ICONES) {
  await sharp(svg(i), { density: 384 }).resize(i.taille, i.taille).png({ compressionLevel: 9 }).toFile(`${DOSSIER}${i.nom}`);
  console.log(`✓ public/icons/${i.nom} (${i.taille}×${i.taille})`);
}
