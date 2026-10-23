/**
 * Glossaire : filtre instantané (accents ignorés) + filtre par tome + index A-Z vivant.
 * Amélioration seulement : la page est complète sans JavaScript.
 *
 * Lit : [data-glossaire] > [data-filtre-glossaire], [data-effacer-filtre], [data-filtre-tomes] [data-tome],
 * [data-terme][data-recherche][data-tomes], section[data-lettre], [data-lettre-lien], [data-compteur-glossaire],
 * [data-filtre-statut], [data-filtre-vide], [data-reinitialiser], [data-barre-glossaire].
 * URL : ?q=…&tome=… (lue à l'arrivée, tenue à jour sans ajouter d'entrée d'historique).
 */
import { correspond, motsRequete } from '../../lib/recherche/normaliser.ts';
import { pluriel } from '../../lib/texte.ts';

interface Terme {
  el: HTMLElement;
  texte: string;
  tomes: string[];
}

/** Filtre pur : indices des termes visibles (testable). */
export function filtrerTermes(
  termes: ReadonlyArray<Pick<Terme, 'texte' | 'tomes'>>,
  requete: string,
  tome = '',
): number[] {
  const mots = motsRequete(requete);
  const visibles: number[] = [];
  termes.forEach((t, i) => {
    if ((!tome || t.tomes.includes(tome)) && correspond(t.texte, mots)) visibles.push(i);
  });
  return visibles;
}

export function initialiserGlossaire(racine: ParentNode = document): void {
  const zone = racine.querySelector<HTMLElement>('[data-glossaire]');
  if (!zone || zone.dataset.pret) return;
  zone.dataset.pret = 'oui';

  const champ = zone.querySelector<HTMLInputElement>('[data-filtre-glossaire]');
  const effacer = zone.querySelector<HTMLButtonElement>('[data-effacer-filtre]');
  const boutons = [...zone.querySelectorAll<HTMLButtonElement>('[data-filtre-tomes] [data-tome]')];
  const termes: Terme[] = [...zone.querySelectorAll<HTMLElement>('[data-terme]')].map((el) => ({
    el,
    texte: el.dataset.recherche ?? '',
    tomes: (el.dataset.tomes ?? '').split(' ').filter(Boolean),
  }));
  const lettres = [...zone.querySelectorAll<HTMLElement>('section[data-lettre]')];
  const liens = new Map<string, HTMLAnchorElement>();
  for (const a of zone.querySelectorAll<HTMLAnchorElement>('[data-lettre-lien]')) liens.set(a.dataset.lettreLien ?? '', a);
  const compteur = zone.querySelector<HTMLElement>('[data-compteur-glossaire]');
  const statut = zone.querySelector<HTMLElement>('[data-filtre-statut]');
  const vide = zone.querySelector<HTMLElement>('[data-filtre-vide]');
  const barre = zone.querySelector<HTMLElement>('[data-barre-glossaire]');
  const total = termes.length;
  const tomesConnus = new Set(boutons.map((b) => b.dataset.tome ?? ''));

  let tome = '';
  let minuterieAnnonce = 0;
  let minuterieUrl = 0;

  // ─── État → URL ────────────────────────────────────────────────────────────
  const majUrl = () => {
    window.clearTimeout(minuterieUrl);
    minuterieUrl = window.setTimeout(() => {
      try {
        const u = new URL(window.location.href);
        const q = champ?.value.trim() ?? '';
        if (q) u.searchParams.set('q', q);
        else u.searchParams.delete('q');
        if (tome) u.searchParams.set('tome', tome);
        else u.searchParams.delete('tome');
        if (u.href !== window.location.href) window.history.replaceState(window.history.state, '', u);
      } catch {
        /* URL non modifiable (aperçu) : sans importance */
      }
    }, 300);
  };

  // ─── Lettre courante (index A-Z) ───────────────────────────────────────────
  let lettreCourante = '';
  const marquerLettre = (l: string) => {
    if (l === lettreCourante) return;
    liens.get(lettreCourante)?.removeAttribute('aria-current');
    lettreCourante = l;
    const lien = liens.get(l);
    if (lien) {
      lien.setAttribute('aria-current', 'true');
      // Garde la lettre visible dans la rangée défilante (téléphone), sans bouger la page.
      const rangee = lien.closest('ul');
      if (rangee && rangee.scrollWidth > rangee.clientWidth) {
        const r = lien.getBoundingClientRect();
        const p = rangee.getBoundingClientRect();
        if (r.left < p.left || r.right > p.right) rangee.scrollLeft += r.left - p.left - p.width / 2 + r.width / 2;
      }
    }
  };

  let enAttente = false;
  // Pendant le défilement doux lancé par un clic sur une lettre, la lettre choisie reste allumée.
  let verrou = 0;
  const suivreDefilement = () => {
    if (enAttente || performance.now() < verrou) return;
    enAttente = true;
    window.requestAnimationFrame(() => {
      enAttente = false;
      const hautBarre = barre ? barre.getBoundingClientRect().bottom : 0;
      let courante = '';
      for (const l of lettres) {
        if (l.hidden) continue;
        if (l.getBoundingClientRect().top - hautBarre <= 40) courante = l.dataset.lettre ?? '';
        else break;
      }
      if (!courante) courante = lettres.find((l) => !l.hidden)?.dataset.lettre ?? '';
      marquerLettre(courante);
      if (barre) {
        const haut = Number.parseFloat(getComputedStyle(barre).top) || 0;
        barre.toggleAttribute('data-colle', window.scrollY > 0 && barre.getBoundingClientRect().top <= haut + 0.5);
      }
    });
  };

  // ─── Filtre ────────────────────────────────────────────────────────────────
  function appliquer(annoncer = true): void {
    const requete = champ?.value ?? '';
    const visibles = new Set(filtrerTermes(termes, requete, tome));
    termes.forEach((t, i) => {
      t.el.hidden = !visibles.has(i);
    });
    for (const l of lettres) {
      const reste = !!l.querySelector('[data-terme]:not([hidden])');
      l.hidden = !reste;
      const lien = liens.get(l.dataset.lettre ?? '');
      if (!lien) continue;
      if (reste) {
        lien.removeAttribute('aria-disabled');
        lien.removeAttribute('tabindex');
      } else {
        lien.setAttribute('aria-disabled', 'true');
        lien.setAttribute('tabindex', '-1');
      }
    }

    const n = visibles.size;
    const filtre = !!requete.trim() || !!tome;
    if (vide) vide.hidden = n > 0;
    if (compteur) compteur.textContent = filtre ? `${n} sur ${total}` : pluriel(total, 'terme');
    if (effacer) effacer.hidden = !requete;
    for (const b of boutons) b.setAttribute('aria-pressed', String((b.dataset.tome ?? '') === tome));

    if (annoncer && statut) {
      window.clearTimeout(minuterieAnnonce);
      minuterieAnnonce = window.setTimeout(() => {
        statut.textContent = !filtre
          ? `Tous les termes : ${total}.`
          : n
            ? `${pluriel(n, 'terme affiché', 'termes affichés')} sur ${total}.`
            : 'Aucun terme ne correspond.';
      }, 450);
    }
    majUrl();
    suivreDefilement();
  }

  /** Après un filtre : si la liste commence au-dessus de la barre, on la ramène juste dessous. */
  const conteneur = zone.querySelector<HTMLElement>('.glossaire__lettres');
  const remonter = () => {
    if (!conteneur || !barre) return;
    const ecart = conteneur.getBoundingClientRect().top - barre.getBoundingClientRect().bottom;
    if (ecart < 0) window.scrollBy({ top: ecart - 12, behavior: 'instant' });
  };

  // ─── Branchements ──────────────────────────────────────────────────────────
  champ?.addEventListener('input', () => {
    appliquer();
    remonter();
  });
  champ?.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && champ.value) {
      ev.preventDefault();
      champ.value = '';
      appliquer();
    }
  });

  effacer?.addEventListener('click', () => {
    if (champ) champ.value = '';
    appliquer();
    champ?.focus();
  });

  for (const b of boutons) {
    b.addEventListener('click', () => {
      const choisi = b.dataset.tome ?? '';
      tome = choisi === tome ? '' : choisi;
      appliquer();
      remonter();
    });
  }

  zone.querySelector('[data-reinitialiser]')?.addEventListener('click', () => {
    tome = '';
    if (champ) champ.value = '';
    appliquer();
    champ?.focus();
  });

  for (const [l, a] of liens) {
    a.addEventListener('click', (ev) => {
      if (a.getAttribute('aria-disabled') === 'true') {
        ev.preventDefault();
        return;
      }
      marquerLettre(l);
      verrou = performance.now() + 1500;
    });
  }
  window.addEventListener('scrollend', () => {
    verrou = 0;
    suivreDefilement();
  });

  // La hauteur de la barre collante règle le décalage des ancres.
  if (barre && 'ResizeObserver' in window) {
    new ResizeObserver(([e]) => {
      const h = e?.borderBoxSize?.[0]?.blockSize ?? barre.offsetHeight;
      zone.style.setProperty('--hauteur-barre', `${Math.round(h)}px`);
    }).observe(barre);
  }

  window.addEventListener('scroll', suivreDefilement, { passive: true });
  window.addEventListener('resize', suivreDefilement, { passive: true });

  // État de départ : ?q= et ?tome= (lien partagé, palette « Chercher dans le glossaire »).
  try {
    const params = new URL(window.location.href).searchParams;
    const q = params.get('q');
    const t = params.get('tome');
    if (q && champ) champ.value = q;
    if (t && tomesConnus.has(t)) tome = t;
  } catch {
    /* rien */
  }
  appliquer(false);
  if (champ?.value) champ.focus({ preventScroll: true });
}
