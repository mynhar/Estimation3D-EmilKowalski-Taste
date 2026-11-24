/* Datos estructurales de la landing: rutas de imagen, cotas y claves i18n.
   El texto vive en src/assets/i18n/{fr,en,es}.json bajo el espacio `landing`. */

const IMG = 'assets/landing/';

export interface Specialty {
  /** sufijo de clave i18n: landing.services.<key>_t / _d */
  key: string;
  img: string;
}

/** Copias web de 800 px de las fotos originales (que siguen en la carpeta como fuente). */
export const SPECIALTIES: readonly Specialty[] = [
  { key: 'mold', img: IMG + 'mold-wall-800.jpg' },
  { key: 'water', img: IMG + 'mold-ceiling-800.jpg' },
  { key: 'asbestos', img: IMG + 'worker-profile-800.jpg' },
  { key: 'demolition', img: IMG + 'workers-outside-800.jpg' },
  { key: 'insulation', img: IMG + 'dryice-800.jpg' },
  { key: 'foundations', img: IMG + 'thermal-800.jpg' },
] as const;

/** Pasos del proceso, en orden: sufijo de clave landing.process.<key>_t / _d. */
export const PROCESS_STEPS = ['s1', 's2', 's3'] as const;

/** Sufijos de clave de las cuatro filas de cada columna de la comparación. */
export const COMPARE_ROWS = ['1', '2', '3', '4'] as const;

/** Los cuatro verbos del tour 3D. */
export const IMMERSION_WORDS = ['1', '2', '3', '4'] as const;

/** Opciones del selector "type de propriété". */
export const PROPERTY_TYPES = ['house', 'apartment', 'building', 'commercial', 'other'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const MEDIA = {
  /** Escaneo del hero: proporción 900 × 920. */
  scan: IMG + 'scan-dollhouse-jolicoeur.jpg',
  /** Plano del proceso: proporción 1600 × 904. */
  plan: IMG + 'scan-plan-outremont.jpg',
  /** Render dollhouse del tour (copia web de 1400 px de scan-render-1): proporción 1400 × 1132. */
  render: IMG + 'scan-render-1-1400.jpg',
} as const;
