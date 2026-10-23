/**
 * API Claude (Messages, streaming SSE) appelée directement depuis le navigateur.
 * Requête HTTP brute (fetch) : le projet n'embarque pas le SDK, comme scripts/generer-cours.mjs.
 *
 * Sécurité : la clé ne part QUE vers https://api.anthropic.com, dans l'en-tête x-api-key,
 * jamais dans une URL ni dans la console. `fetch` est injectable (tests).
 */

export const URL_ANTHROPIC = 'https://api.anthropic.com/v1/messages';
export const VERSION_API = '2023-06-01';
export const MODELE_DEFAUT = 'claude-sonnet-5-5';
/** Réponse en streaming : de la place pour la réflexion + le cours (comme le script). */
export const MAX_TOKENS = 64000;
/** Repli serveur en cas de refus de sécurité (« fallbacks: "default" »), modèles qui l'acceptent. */
export const MODELES_AVEC_REPLI = new Set(['claude-sonnet-5-5', 'claude-opus-5-5', 'claude-opus-5', 'claude-fable-5-1']);
export const BETA_REPLI = 'server-side-fallback-2026-07-01';
/** Limites de l'API : 32 Mo par requête (on garde de la marge), 5 Mo par image côté navigateur. */
export const LIMITE_REQUETE = 30 * 1024 * 1024;

export type BlocContenu =
  | { type: 'text'; text: string }
  | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string }; title?: string }
  | { type: 'image'; source: { type: 'base64'; media_type: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'; data: string } };

export interface PieceJointe {
  nom: string;
  /** application/pdf, image/png, image/jpeg, image/webp. */
  type: string;
  base64: string;
}

/** Blocs du message : chaque fichier (annoncé par son nom), puis le prompt qui contient les textes. */
export function construireContenu(prompt: string, pieces: PieceJointe[] = []): BlocContenu[] {
  const blocs: BlocContenu[] = [];
  pieces.forEach((p, i) => {
    blocs.push({ type: 'text', text: `Fichier joint ${i + 1} : ${p.nom}` });
    if (p.type === 'application/pdf') {
      blocs.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: p.base64 }, title: p.nom });
    } else {
      const media = (['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const).find((t) => t === p.type) ?? 'image/png';
      blocs.push({ type: 'image', source: { type: 'base64', media_type: media, data: p.base64 } });
    }
  });
  blocs.push({ type: 'text', text: prompt });
  return blocs;
}

export interface OptionsRequete {
  cle: string;
  modele?: string | undefined;
  contenu: BlocContenu[];
  /** low | medium | high | xhigh | max ; null = réglage du modèle. */
  effort?: string | null;
  /** Repli serveur (défaut : oui pour les modèles qui l'acceptent). */
  repli?: boolean;
}

/** Construit la requête (URL fixe, en-têtes, corps JSON). Pure : testable. */
export function construireRequete(o: OptionsRequete): { url: string; entetes: Record<string, string>; corps: Record<string, unknown> } {
  const modele = o.modele?.trim() || MODELE_DEFAUT;
  const repli = o.repli ?? MODELES_AVEC_REPLI.has(modele);
  const effort = o.effort === undefined ? 'medium' : o.effort;
  const corps: Record<string, unknown> = {
    model: modele,
    max_tokens: MAX_TOKENS,
    stream: true,
    messages: [{ role: 'user', content: o.contenu }],
  };
  if (effort) corps.output_config = { effort };
  if (repli) corps.fallbacks = 'default';
  const entetes: Record<string, string> = {
    'content-type': 'application/json',
    'x-api-key': o.cle.trim(),
    'anthropic-version': VERSION_API,
    'anthropic-dangerous-direct-browser-access': 'true',
  };
  if (repli) entetes['anthropic-beta'] = BETA_REPLI;
  return { url: URL_ANTHROPIC, entetes, corps };
}

// ─── Erreurs ─────────────────────────────────────────────────────────────────

export type CodeErreurClaude =
  | 'cle'
  | 'droits'
  | 'credit'
  | 'quota'
  | 'modele'
  | 'trop-gros'
  | 'surcharge'
  | 'serveur'
  | 'requete'
  | 'reseau'
  | 'arrete'
  | 'refus'
  | 'coupe'
  | 'interrompu';

export class ErreurClaude extends Error {
  readonly code: CodeErreurClaude;
  readonly statut: number | null;
  /** Texte déjà reçu (réponse coupée, refus en cours de route). */
  readonly partiel: string;
  constructor(message: string, code: CodeErreurClaude, statut: number | null = null, partiel = '') {
    super(message);
    this.name = 'ErreurClaude';
    this.code = code;
    this.statut = statut;
    this.partiel = partiel;
  }
}

/** Statut HTTP + message de l'API → erreur en français. */
export function erreurHttp(statut: number, type: string, detail: string, modele: string): ErreurClaude {
  const d = detail.slice(0, 240);
  if (statut === 401) return new ErreurClaude('Clé API refusée : elle est invalide ou a été révoquée. Colle une nouvelle clé dans les Réglages.', 'cle', 401);
  if (statut === 402 || /credit balance|billing|crédit/i.test(d) || type === 'billing_error') {
    return new ErreurClaude('Crédit épuisé ou plafond de dépenses atteint : vérifie la facturation de ton compte Anthropic.', 'credit', statut);
  }
  if (statut === 403) return new ErreurClaude(`Cette clé n’a pas accès à cette fonction ou à ce modèle${d ? ` (${d})` : ''}.`, 'droits', 403);
  if (statut === 404) return new ErreurClaude(`Modèle « ${modele} » introuvable pour ce compte : choisis-en un autre dans les Réglages.`, 'modele', 404);
  if (statut === 413) return new ErreurClaude('Source trop lourde pour une seule requête (32 Mo maximum) : retire des images ou découpe le PDF.', 'trop-gros', 413);
  if (statut === 429) return new ErreurClaude('Quota atteint (trop de requêtes ou de jetons par minute) : attends une minute, puis réessaie.', 'quota', 429);
  if (statut === 529 || type === 'overloaded_error') return new ErreurClaude('Claude est surchargé en ce moment : réessaie dans quelques minutes.', 'surcharge', statut);
  if (statut >= 500) return new ErreurClaude(`Erreur du service Anthropic (${statut}) : réessaie dans un moment.`, 'serveur', statut);
  return new ErreurClaude(`Requête refusée (${statut})${d ? ` : ${d}` : ''}.`, 'requete', statut);
}

// ─── Lecture du flux SSE ─────────────────────────────────────────────────────

export interface ReponseClaude {
  texte: string;
  stopReason: string | null;
  categorieRefus: string | null;
  modele: string;
  usage: Record<string, unknown>;
}

export type EtatGeneration =
  | { phase: 'connexion' }
  | { phase: 'reflexion' }
  | { phase: 'ecriture'; caracteres: number }
  | { phase: 'repli'; vers: string }
  | { phase: 'nouvel-essai'; raison: string };

interface Evenement {
  type?: string;
  index?: number;
  message?: { model?: string; usage?: Record<string, unknown> };
  content_block?: { type?: string; text?: string; to?: { model?: string } };
  delta?: { type?: string; text?: string; stop_reason?: string; stop_details?: { category?: string | null } | null };
  usage?: Record<string, unknown>;
  error?: { type?: string; message?: string };
}

/**
 * Lit un flux SSE de l'API Messages. `surTexte` reçoit chaque morceau de texte au fil de l'eau.
 * Lève une ErreurClaude si le flux contient une erreur ou se coupe avant message_stop.
 */
export async function lireFlux(
  corps: ReadableStream<Uint8Array>,
  modeleDemande: string,
  surTexte: (morceau: string, total: string) => void = () => {},
  surEtat: (e: EtatGeneration) => void = () => {},
): Promise<ReponseClaude> {
  const decodeur = new TextDecoder();
  const blocs: { type: string; texte: string }[] = [];
  let texte = '';
  let tampon = '';
  let fini = false;
  const etat = { modele: modeleDemande, stopReason: null as string | null, categorie: null as string | null, usage: {} as Record<string, unknown> };

  const traiter = (brut: string) => {
    const donnees = brut
      .split('\n')
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).replace(/^ /, ''))
      .join('\n');
    if (!donnees) return;
    let evt: Evenement;
    try {
      evt = JSON.parse(donnees) as Evenement;
    } catch {
      return;
    }
    switch (evt.type) {
      case 'message_start':
        etat.modele = evt.message?.model ?? etat.modele;
        Object.assign(etat.usage, evt.message?.usage ?? {});
        break;
      case 'content_block_start': {
        const b = evt.content_block ?? {};
        blocs[evt.index ?? blocs.length] = { type: b.type ?? '', texte: typeof b.text === 'string' ? b.text : '' };
        if (b.type === 'thinking') surEtat({ phase: 'reflexion' });
        if (b.type === 'fallback') {
          etat.modele = b.to?.model ?? etat.modele;
          surEtat({ phase: 'repli', vers: etat.modele });
        }
        break;
      }
      case 'content_block_delta': {
        const bloc = blocs[evt.index ?? -1];
        if (evt.delta?.type === 'text_delta' && typeof evt.delta.text === 'string' && bloc) {
          bloc.texte += evt.delta.text;
          if (bloc.type === 'text') {
            texte += evt.delta.text;
            surTexte(evt.delta.text, texte);
            surEtat({ phase: 'ecriture', caracteres: texte.length });
          }
        }
        break;
      }
      case 'message_delta':
        etat.stopReason = evt.delta?.stop_reason ?? etat.stopReason;
        etat.categorie = evt.delta?.stop_details?.category ?? etat.categorie;
        Object.assign(etat.usage, evt.usage ?? {});
        break;
      case 'message_stop':
        fini = true;
        break;
      case 'error': {
        const type = evt.error?.type ?? 'error';
        const message = evt.error?.message ?? '';
        if (type === 'overloaded_error') throw new ErreurClaude('Claude est surchargé en ce moment : réessaie dans quelques minutes.', 'surcharge', 529, texte);
        if (type === 'rate_limit_error') throw new ErreurClaude('Quota atteint pendant la réponse : attends une minute, puis réessaie.', 'quota', 429, texte);
        throw new ErreurClaude(`Erreur pendant la réponse (${type})${message ? ` : ${message.slice(0, 200)}` : ''}.`, 'serveur', null, texte);
      }
      default:
        break; // ping…
    }
  };

  const lecteur = corps.getReader();
  for (;;) {
    const { done, value } = await lecteur.read();
    if (done) break;
    tampon += decodeur.decode(value, { stream: true }).replace(/\r\n?/g, '\n');
    let fin: number;
    while ((fin = tampon.indexOf('\n\n')) !== -1) {
      traiter(tampon.slice(0, fin));
      tampon = tampon.slice(fin + 2);
    }
  }
  tampon += decodeur.decode();
  if (tampon.trim()) traiter(tampon);

  if (!fini) throw new ErreurClaude('La réponse a été coupée avant la fin (connexion interrompue). Le début est gardé.', 'interrompu', null, texte);
  return { texte, stopReason: etat.stopReason, categorieRefus: etat.categorie, modele: etat.modele, usage: etat.usage };
}

// ─── Appel complet ───────────────────────────────────────────────────────────

export interface OptionsGeneration extends OptionsRequete {
  signal?: AbortSignal;
  fetch?: typeof fetch;
  surTexte?: (morceau: string, total: string) => void;
  surEtat?: (e: EtatGeneration) => void;
  /** Attente avant un nouvel essai (surcharge, 5xx) ; 0 dans les tests. */
  delaiNouvelEssai?: number;
}

const estAbandon = (e: unknown): boolean => (e instanceof DOMException || e instanceof Error) && e.name === 'AbortError';

/**
 * Génère le cours en streaming. Réessaie tout seul : sans repli ni effort si le modèle les refuse (400),
 * une fois après une surcharge ou une erreur 5xx. Lève une ErreurClaude en français.
 */
export async function genererAvecClaude(o: OptionsGeneration): Promise<ReponseClaude> {
  const f = o.fetch ?? ((...a: Parameters<typeof fetch>) => globalThis.fetch(...a));
  const modele = o.modele?.trim() || MODELE_DEFAUT;
  let repli = o.repli ?? MODELES_AVEC_REPLI.has(modele);
  let effort = o.effort === undefined ? 'medium' : o.effort;
  let essaisServeur = 0;
  const surEtat = o.surEtat ?? (() => {});

  for (let tentative = 1; tentative <= 5; tentative++) {
    const { url, entetes, corps } = construireRequete({ ...o, modele, repli, effort });
    surEtat({ phase: 'connexion' });
    let r: Response;
    try {
      r = await f(url, { method: 'POST', headers: entetes, body: JSON.stringify(corps), signal: o.signal ?? null, credentials: 'omit', referrerPolicy: 'no-referrer' });
    } catch (e) {
      if (estAbandon(e)) throw new ErreurClaude('Génération arrêtée.', 'arrete');
      throw new ErreurClaude('Connexion à Claude impossible : vérifie ta connexion internet (ou un bloqueur de requêtes).', 'reseau');
    }

    if (!r.ok) {
      const brut = await r.text().catch(() => '');
      let type = '';
      let detail = brut.slice(0, 300);
      try {
        const j = JSON.parse(brut) as { error?: { type?: string; message?: string } };
        type = j.error?.type ?? '';
        detail = j.error?.message ?? detail;
      } catch {
        /* réponse non JSON */
      }
      // Fonction facultative refusée par ce modèle ou ce compte : on l'enlève et on recommence.
      if (r.status === 400 && repli && /fallback|anthropic-beta/i.test(detail)) {
        repli = false;
        surEtat({ phase: 'nouvel-essai', raison: 'sans repli' });
        continue;
      }
      if (r.status === 400 && effort && /effort|output_config/i.test(detail)) {
        effort = null;
        surEtat({ phase: 'nouvel-essai', raison: 'sans réglage d’effort' });
        continue;
      }
      if ((r.status === 529 || r.status >= 500) && essaisServeur < 1) {
        essaisServeur++;
        surEtat({ phase: 'nouvel-essai', raison: 'service surchargé' });
        await new Promise((res) => setTimeout(res, o.delaiNouvelEssai ?? 3000));
        if (o.signal?.aborted) throw new ErreurClaude('Génération arrêtée.', 'arrete');
        continue;
      }
      throw erreurHttp(r.status, type, detail, modele);
    }
    if (!r.body) throw new ErreurClaude('Réponse vide de l’API.', 'serveur', r.status);

    let reponse: ReponseClaude;
    try {
      reponse = await lireFlux(r.body, modele, o.surTexte, surEtat);
    } catch (e) {
      if (estAbandon(e) || o.signal?.aborted) throw new ErreurClaude('Génération arrêtée.', 'arrete');
      throw e;
    }
    if (reponse.stopReason === 'refusal') {
      const cat = reponse.categorieRefus ? ` (catégorie : ${reponse.categorieRefus})` : '';
      throw new ErreurClaude(`Claude a refusé de traiter cette source${cat}. Essaie l’onglet « N’importe quelle IA », ou reformule la consigne.`, 'refus', 200, reponse.texte);
    }
    if (reponse.stopReason === 'max_tokens') {
      throw new ErreurClaude('Réponse coupée : le cours est trop long pour une seule réponse. Le début est gardé ; découpe la source.', 'coupe', 200, reponse.texte);
    }
    return reponse;
  }
  throw new ErreurClaude('Trop de nouveaux essais : réessaie plus tard.', 'serveur');
}
