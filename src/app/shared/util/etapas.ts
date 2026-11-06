/**
 * Las 6 etapas reales de un dossier, tal como las ve el cliente. Se dibujan como
 * una cota (línea de medida) en `app-stage-line`.
 *
 * Los textos son los del historial (`timeline.*`), así que la línea de etapas y
 * el historial hablan el mismo idioma.
 */
export const ETAPAS = [
  'timeline.created',           // 1 · Dossier créé
  'timeline.visit_done',        // 2 · Visite effectuée
  'timeline.estimated',         // 3 · Estimation complétée
  'timeline.offer_received',    // 4 · Offre reçue
  'timeline.contract_signed',   // 5 · Contrat signé
  'timeline.execution_started', // 6 · Travaux commencés
] as const;

/** Estados que sacan al dossier del flujo: no tienen etapa. */
export const ESTADOS_FUERA_DE_FLUJO = ['cancelado', 'archivado'] as const;

const ETAPA_POR_ESTADO: Record<string, number> = {
  nuevo:         1,
  en_estimacion: 2,
  estimado:      3,
  en_oferta:     4,
  adjudicado:    4, // constructor elegido, contrato aún por firmar
  contratado:    5,
};

/** Lo mínimo de un contrato que hace falta para saber la etapa. */
export interface ContratoEtapa {
  estado:       string;
  firmado_en:   string | null;
  obra_estado?: string | null;
}

/**
 * Etapa del dossier, 1–6. Devuelve 0 si está cancelado o archivado.
 *
 * Parte del estado del dossier y la adelanta con lo que digan sus contratos:
 * un contrato firmado lleva a la 5 y una obra empezada a la 6. Los contratos
 * cancelados no cuentan.
 */
export function etapaDossier(estado: string, contratos: readonly ContratoEtapa[] = []): number {
  if ((ESTADOS_FUERA_DE_FLUJO as readonly string[]).includes(estado)) return 0;
  let etapa = ETAPA_POR_ESTADO[estado] ?? 1;

  const vigentes = contratos.filter(c => c.estado !== 'cancelado');
  if (vigentes.some(c => c.firmado_en || ['firmado', 'en_ejecucion', 'completado'].includes(c.estado))) {
    etapa = Math.max(etapa, 5);
  }
  if (vigentes.some(c => ['en_ejecucion', 'completado'].includes(c.estado)
      || ['en_curso', 'pausada', 'completada'].includes(c.obra_estado ?? ''))) {
    etapa = 6;
  }
  return etapa;
}
