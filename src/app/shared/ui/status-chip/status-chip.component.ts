import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

type Tono = 'info' | 'accion' | 'atencion' | 'ok' | 'neutro' | 'error';

/**
 * Tono de cada estado. La atención (ámbar) se reserva a lo que pide una
 * decisión del cliente; el éxito lleva icono además del color para no
 * confundirse con el verde de acción.
 */
const TONO: Record<string, Tono> = {
  nuevo:         'info',
  en_estimacion: 'info',
  estimado:      'accion',
  en_oferta:     'atencion',
  adjudicado:    'ok',
  contratado:    'ok',
  cancelado:     'neutro',
  archivado:     'neutro',
  pendiente:     'atencion',
  aceptada:      'ok',
  rechazada:     'error',
};

/** Etiqueta de estado de un dossier u oferta: texto `state.<estado>` sobre fondo suave. */
@Component({
  selector: 'app-status-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    @if (tono() === 'ok') {
      <svg class="chip__icon" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" stroke-width="1.75"
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    }
    {{ ('state.' + estado()) | translate }}
  `,
  styleUrl: './status-chip.component.css',
  host: { '[attr.data-tono]': 'tono()' },
})
export class StatusChipComponent {
  estado = input.required<string>();
  protected tono = computed<Tono>(() => TONO[this.estado()] ?? 'neutro');
}
