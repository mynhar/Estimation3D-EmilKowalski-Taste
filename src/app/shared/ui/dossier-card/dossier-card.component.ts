import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StatusChipComponent } from '../status-chip/status-chip.component';
import { StageLineComponent } from '../stage-line/stage-line.component';

/**
 * Resumen de un dossier: servicio, número, estado y la cota compacta de etapas.
 * Es solo contenido: el padre lo envuelve en el botón o enlace que toque y
 * marca la selección con `seleccionado`.
 */
@Component({
  selector: 'app-dossier-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusChipComponent, StageLineComponent],
  template: `
    <span class="dc__svc">{{ servicio() || numero() }}</span>
    @if (servicio()) { <span class="dc__num">{{ numero() }}</span> }
    <span class="dc__foot">
      <app-status-chip [estado]="estado()" />
    </span>
    @if (etapa() > 0) {
      <app-stage-line class="dc__line" [actual]="etapa()" [compact]="true" />
    }
  `,
  styleUrl: './dossier-card.component.css',
  host: { '[class.is-selected]': 'seleccionado()' },
})
export class DossierCardComponent {
  numero = input.required<string>();
  servicio = input<string>('');
  estado = input.required<string>();
  /** Etapa 1–6; 0 si el dossier está fuera del flujo (cancelado, archivado). */
  etapa = input(0);
  seleccionado = input(false);
}
