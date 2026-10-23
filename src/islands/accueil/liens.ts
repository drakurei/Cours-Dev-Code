/** Liens de l'accueil (toujours via url() : le site vit sous /Cours-Dev-Code/). */
import { url } from '../../lib/url.ts';

export const LIENS = {
  reviser: url('/reviser/'),
  // Onglet « Quiz éclair » de /reviser/ (l'onglet suit l'ancre : #cartes, #eclair, #tome).
  quizEclair: url('/reviser/#eclair'),
  tomes: url('/tomes/'),
  atelier: url('/atelier/'),
} as const;
