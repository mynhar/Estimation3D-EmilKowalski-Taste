/**
 * Contenido estructural de la página Entrepreneurs. Igual que en Le Journal,
 * aquí solo viven identificadores, iconos y fotos: el texto está en
 * `assets/i18n/*.json` bajo `entrepreneurs.*`.
 *
 * Solo las etapas llevan número (son una secuencia, y el número sale del
 * índice); los demás bloques no son ordinales y van con icono.
 */

/** Bloque con icono: `id` es el sufijo de sus claves de i18n. */
export interface IconItem {
  readonly id: string;
  /** Material Symbols; con esta forma lo detecta `scripts/icons.mjs`. */
  readonly matIcon: string;
}

/** El problema: cuatro motivos, con iconos en gris (es lo que se deja atrás). */
export const PROBLEM_CELLS: readonly IconItem[] = [
  { id: 'estimer',    matIcon: 'money_off' },
  { id: 'temps',      matIcon: 'directions_car' },
  { id: 'opaque',     matIcon: 'visibility_off' },
  { id: 'visibilite', matIcon: 'help' },
];

/** El proceso: cuatro etapas, en orden. */
export const STEPS: readonly string[] = ['dossier', 'soumission', 'execution', 'paiement'];

/** Lo que obtiene: seis ventajas, con iconos en abeto. */
export const BENEFITS: readonly IconItem[] = [
  { id: 'prequalifies',  matIcon: 'verified' },
  { id: 'sans-visite',   matIcon: 'schedule' },
  { id: 'concurrence',   matIcon: 'balance' },
  { id: 'documentation', matIcon: 'straighten' },
  { id: 'suivi',         matIcon: 'fact_check' },
  { id: 'reputation',    matIcon: 'workspace_premium' },
];

/** Exigencias: seis líneas con marca de verificación. */
export const REQUIREMENTS: readonly string[] = [
  'rbq', 'assurance', 'certifications', 'rapports', 'protocoles', 'disponibilite',
];

export interface SpecialtySlot {
  readonly id: string;
  /** Las mismas fotos que las especialidades de la landing (copias web de 800 px). */
  readonly img: string;
  /**
   * Sufijo de `entrepreneurs.specs.avail.*`. `full` es el único estado sin
   * plaza: se pinta apagado y con otro icono.
   */
  readonly avail: 'p1' | 'p2' | 'p3' | 'full';
}

const IMG = 'assets/landing/';

/** Seis dominios y sus plazas del piloto 2026. */
export const SPECIALTY_SLOTS: readonly SpecialtySlot[] = [
  { id: 'moisissures', img: IMG + 'mold-wall-800.jpg',       avail: 'p2' },
  { id: 'eau',         img: IMG + 'mold-ceiling-800.jpg',    avail: 'p3' },
  { id: 'amiante',     img: IMG + 'worker-profile-800.jpg',  avail: 'p1' },
  { id: 'demolition',  img: IMG + 'workers-outside-800.jpg', avail: 'full' },
  { id: 'isolation',   img: IMG + 'dryice-800.jpg',          avail: 'p2' },
  { id: 'fondations',  img: IMG + 'thermal-800.jpg',         avail: 'p1' },
];

/** Icono de la disponibilidad: con plaza o completo. */
export const AVAIL_ICON = {
  open: { matIcon: 'event_seat' },
  full: { matIcon: 'event_busy' },
} as const;

/** Preguntas frecuentes, en el orden en que se muestran. */
export const FAQ_IDS: readonly string[] = [
  'cout', 'attribution', 'obligation', 'paiement', 'imprevu',
];
