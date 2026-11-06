import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ETAPAS } from '../../util/etapas';

/**
 * Línea de etapas del dossier, dibujada como una cota arquitectónica: una línea
 * de medida con una marca por etapa y el tramo recorrido en menthe.
 *
 * - Completa: título, «Étape n sur 6» y el nombre de cada etapa. En anchos
 *   estrechos (contenedor < 30rem) solo se ve el nombre de la etapa actual; las
 *   demás siguen en la lista para los lectores de pantalla.
 * - Compacta (`compact`): solo la línea, para tarjetas. Es decorativa; el texto
 *   accesible es «Étape n sur 6 : nombre».
 */
@Component({
  selector: 'app-stage-line',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './stage-line.component.html',
  styleUrl: './stage-line.component.css',
  host: { '[class.is-compact]': 'compact()' },
})
export class StageLineComponent {
  /** Etapa actual, 1-based. */
  actual = input.required<number>();
  /** Claves de traducción de las etapas (por defecto las 6 del dossier). */
  etapas = input<readonly string[]>(ETAPAS);
  /** Clave del título. */
  titulo = input('dashboard_client.progress_label');
  compact = input(false);

  /** Etapa actual acotada a la lista. */
  protected paso = computed(() => Math.min(Math.max(this.actual(), 1), this.etapas().length));
  protected etiquetaActual = computed(() => this.etapas()[this.paso() - 1]);
}
