/**
 * Briques des Réglages façon iOS : section, liste groupée, ligne (libellé à gauche,
 * contrôle à droite), contrôle segmenté, interrupteur, curseur, compteur, champ secret,
 * liste de choix, dialogue de confirmation, résultats de test.
 * Tout repose sur des éléments natifs (radio, checkbox, range, dialog) : clavier complet.
 */
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import IconeSvg from '../IconeSvg.tsx';
import type { Verification } from '../../lib/sync.ts';

// ─── Section, liste, ligne ──────────────────────────────────────────────────

export function Section({ id, titre, children }: { id: string; titre: string; children: ReactNode }) {
  return (
    <section className="r-section" id={id} aria-labelledby={`${id}-titre`}>
      <h2 className="r-section__titre" id={`${id}-titre`}>
        {titre}
      </h2>
      {children}
    </section>
  );
}

/** Liste groupée (carte blanche) avec un sous-titre et une note de bas de groupe facultatifs. */
export function Liste({ titre, note, children }: { titre?: string; note?: ReactNode; children: ReactNode }) {
  const id = useId();
  return (
    <div className="r-groupe">
      {titre && (
        <h3 className="r-groupe__titre" id={`${id}-titre`}>
          {titre}
        </h3>
      )}
      <div className="r-liste" role={titre ? 'group' : undefined} aria-labelledby={titre ? `${id}-titre` : undefined}>
        {children}
      </div>
      {note && <p className="r-groupe__note">{note}</p>}
    </div>
  );
}

export interface IdsLigne {
  /** id du libellé (pour aria-labelledby). */
  libelle: string;
  /** id du texte d'aide (pour aria-describedby), ou undefined. */
  detail: string | undefined;
  /** id à donner au contrôle principal (pour <label htmlFor>). */
  controle: string;
}

interface PropsLigne {
  libelle: ReactNode;
  detail?: ReactNode;
  /** Contrôle sous le libellé (curseur, champ, aperçu) plutôt qu'à droite. */
  pile?: boolean;
  /** Le libellé est un <label for> (champ, select, interrupteur). */
  etiquette?: boolean;
  /** Valeur affichée à droite du libellé (ligne en pile). */
  valeur?: ReactNode;
  className?: string;
  children?: ReactNode | ((ids: IdsLigne) => ReactNode);
}

export function Ligne({ libelle, detail, pile = false, etiquette = false, valeur, className, children }: PropsLigne) {
  const base = useId();
  const ids: IdsLigne = { libelle: `${base}-l`, detail: detail ? `${base}-d` : undefined, controle: `${base}-c` };
  const Libelle = etiquette ? 'label' : 'span';
  const contenu = typeof children === 'function' ? children(ids) : children;
  return (
    <div className={['r-ligne', pile && 'r-ligne--pile', className].filter(Boolean).join(' ')}>
      <div className="r-ligne__texte">
        <div className="r-ligne__entete">
          <Libelle className="r-ligne__libelle" id={ids.libelle} {...(etiquette ? { htmlFor: ids.controle } : {})}>
            {libelle}
          </Libelle>
          {valeur !== undefined && <span className="r-ligne__valeur">{valeur}</span>}
        </div>
        {detail && (
          <p className="r-ligne__detail" id={ids.detail}>
            {detail}
          </p>
        )}
      </div>
      {contenu !== undefined && contenu !== null && <div className="r-ligne__controle">{contenu}</div>}
    </div>
  );
}

// ─── Contrôle segmenté (radios natives) ─────────────────────────────────────

export interface OptionSegment<T extends string | number> {
  valeur: T;
  libelle: string;
}

export function Segmente<T extends string | number>({
  valeur,
  options,
  onChange,
  ids,
}: {
  valeur: T;
  options: readonly OptionSegment<T>[];
  onChange: (v: T) => void;
  ids: IdsLigne;
}) {
  const nom = useId();
  const index = Math.max(0, options.findIndex((o) => o.valeur === valeur));
  return (
    <div
      className="r-segmente"
      role="radiogroup"
      aria-labelledby={ids.libelle}
      aria-describedby={ids.detail}
      style={{ '--n': options.length, '--i': index } as CSSProperties}
    >
      {options.map((o) => (
        <label key={String(o.valeur)} className="r-segmente__option">
          <input
            type="radio"
            className="r-cache"
            name={nom}
            value={String(o.valeur)}
            checked={o.valeur === valeur}
            onChange={() => onChange(o.valeur)}
          />
          <span>{o.libelle}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Interrupteur ────────────────────────────────────────────────────────────

export function Interrupteur({ actif, onChange, ids }: { actif: boolean; onChange: (v: boolean) => void; ids: IdsLigne }) {
  return (
    <input
      type="checkbox"
      role="switch"
      className="r-interrupteur"
      id={ids.controle}
      checked={actif}
      aria-checked={actif}
      aria-describedby={ids.detail}
      onChange={(ev) => onChange(ev.target.checked)}
    />
  );
}

// ─── Curseur ─────────────────────────────────────────────────────────────────

export function Curseur({
  valeur,
  min,
  max,
  pas,
  onChange,
  texte,
  ids,
  avant,
  apres,
}: {
  valeur: number;
  min: number;
  max: number;
  pas: number;
  onChange: (v: number) => void;
  /** Valeur lue par les lecteurs d'écran (« 115 % »). */
  texte: string;
  ids: IdsLigne;
  avant?: ReactNode;
  apres?: ReactNode;
}) {
  const part = (valeur - min) / (max - min);
  return (
    <div className="r-curseur">
      {avant && (
        <span className="r-curseur__borne" aria-hidden="true">
          {avant}
        </span>
      )}
      <input
        type="range"
        id={ids.controle}
        min={min}
        max={max}
        step={pas}
        value={valeur}
        aria-valuetext={texte}
        aria-describedby={ids.detail}
        style={{ '--part': Math.min(1, Math.max(0, part)) } as CSSProperties}
        onChange={(ev) => onChange(Number(ev.target.value))}
      />
      {apres && (
        <span className="r-curseur__borne" aria-hidden="true">
          {apres}
        </span>
      )}
    </div>
  );
}

// ─── Compteur (− valeur +) ───────────────────────────────────────────────────

export function Compteur({
  valeur,
  min,
  max,
  pas,
  onChange,
  unite,
  ids,
}: {
  valeur: number;
  min: number;
  max: number;
  pas: number;
  onChange: (v: number) => void;
  /** Pour les lecteurs d'écran : « cartes ». */
  unite: string;
  ids: IdsLigne;
}) {
  const borne = (v: number) => Math.min(max, Math.max(min, v));
  // Revient sur la grille du pas (une valeur importée peut valoir 12).
  const moins = () => onChange(borne(Math.ceil(valeur / pas) * pas - pas));
  const plus = () => onChange(borne(Math.floor(valeur / pas) * pas + pas));
  return (
    <div className="r-compteur" role="group" aria-labelledby={ids.libelle} aria-describedby={ids.detail}>
      <button type="button" className="r-compteur__bouton" onClick={moins} disabled={valeur <= min} aria-label={`Moins de ${unite}`}>
        <span aria-hidden="true">−</span>
      </button>
      <output className="r-compteur__valeur" aria-live="polite" aria-label={`${valeur} ${unite}`}>
        {valeur}
      </output>
      <button type="button" className="r-compteur__bouton" onClick={plus} disabled={valeur >= max} aria-label={`Plus de ${unite}`}>
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}

// ─── Champ secret (mot de passe + afficher / masquer) ───────────────────────

export function ChampSecret({
  valeur,
  onChange,
  nom,
  placeholder,
  ids,
}: {
  valeur: string;
  onChange: (v: string) => void;
  /** « le jeton GitHub » : complète les libellés des boutons. */
  nom: string;
  placeholder: string;
  ids: IdsLigne;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="r-secret">
      <input
        id={ids.controle}
        className="r-champ r-champ--secret"
        type={visible ? 'text' : 'password'}
        value={valeur}
        placeholder={placeholder}
        aria-describedby={ids.detail}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        data-1p-ignore=""
        data-lpignore="true"
        onChange={(ev) => onChange(ev.target.value)}
      />
      <button
        type="button"
        className="btn btn--discret r-secret__voir"
        aria-pressed={visible}
        aria-controls={ids.controle}
        aria-label={`${visible ? 'Masquer' : 'Afficher'} ${nom}`}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? 'Masquer' : 'Afficher'}
      </button>
    </div>
  );
}

// ─── Liste de choix (une coche, façon iOS) ───────────────────────────────────

export function ListeChoix<T extends string>({
  valeur,
  options,
  onChange,
  libelle,
}: {
  valeur: T;
  options: readonly { valeur: T; libelle: string; detail?: string }[];
  onChange: (v: T) => void;
  /** Nom accessible du groupe. */
  libelle: string;
}) {
  const nom = useId();
  return (
    <div role="radiogroup" aria-label={libelle} className="r-choix">
      {options.map((o) => (
        <label key={o.valeur} className="r-ligne r-choix__option">
          <input type="radio" className="r-cache" name={nom} value={o.valeur} checked={o.valeur === valeur} onChange={() => onChange(o.valeur)} />
          <span className="r-ligne__texte">
            <span className="r-ligne__libelle">{o.libelle}</span>
            {o.detail && <span className="r-ligne__detail">{o.detail}</span>}
          </span>
          <span className="r-choix__coche" aria-hidden="true">
            <IconeSvg nom="coche" taille={20} />
          </span>
        </label>
      ))}
    </div>
  );
}

// ─── Résultats d'un test (jeton, clé) ────────────────────────────────────────

const LIBELLE_ETAT = { ok: 'Réussi', erreur: 'Problème', info: 'À savoir' } as const;

function IconeEtat({ etat }: { etat: Verification['etat'] }) {
  if (etat === 'ok') return <IconeSvg nom="coche" taille={16} />;
  if (etat === 'erreur') return <IconeSvg nom="fermer" taille={16} />;
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="M12 11v6M12 7.5v.01" />
    </svg>
  );
}

export function Verifications({ liste }: { liste: Verification[] }) {
  return (
    <ul className="r-verifs" role="list">
      {liste.map((v) => (
        <li key={v.titre} className={`r-verif r-verif--${v.etat}`}>
          <span className="r-verif__icone">
            <IconeEtat etat={v.etat} />
          </span>
          <span className="r-verif__texte">
            <span className="sr-only">{LIBELLE_ETAT[v.etat]} : </span>
            <strong>{v.titre}</strong>
            {' '}
            <span className="r-verif__detail">{v.detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Message d'état sous une action (toujours présent dans le DOM : annonces polies). */
export function Statut({ message, ton = 'neutre' }: { message: string; ton?: 'neutre' | 'ok' | 'erreur' }) {
  return (
    <p className={`r-statut r-statut--${ton}`} aria-live="polite">
      {message}
    </p>
  );
}

// ─── Dialogue de confirmation (dialog natif : focus piégé, Échap) ───────────

export function Dialogue({
  ouvert,
  titre,
  children,
  onFermer,
  actions,
}: {
  ouvert: boolean;
  titre: string;
  children: ReactNode;
  onFermer: () => void;
  /** Boutons ; celui qui porte data-focus-initial reçoit le focus à l'ouverture. */
  actions: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const base = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (ouvert && !d.open) {
      d.showModal();
      d.querySelector<HTMLElement>('[data-focus-initial]')?.focus();
    } else if (!ouvert && d.open) {
      d.close();
    }
  }, [ouvert]);

  return (
    <dialog
      ref={ref}
      className="r-dialogue"
      aria-labelledby={`${base}-titre`}
      aria-describedby={`${base}-texte`}
      onClose={onFermer}
      onClick={(ev) => {
        if (ev.target === ref.current) onFermer(); // clic sur le voile
      }}
    >
      <h2 className="r-dialogue__titre" id={`${base}-titre`}>
        {titre}
      </h2>
      <div className="r-dialogue__texte" id={`${base}-texte`}>
        {children}
      </div>
      <div className="r-dialogue__actions">{actions}</div>
    </dialog>
  );
}

/** Lien externe (nouvel onglet) annoncé comme tel. */
export function LienExterne({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (nouvel onglet)</span>
      <IconeSvg nom="externe" taille={14} className="r-externe" />
    </a>
  );
}
