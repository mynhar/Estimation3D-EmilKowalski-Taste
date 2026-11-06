import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Estado vacío: qué falta y qué hacer. Alineado a la izquierda, con un icono,
 * un título, un texto y, proyectados, los pasos (`[steps]`) y la acción
 * (`[actions]`). El texto da dirección, no ambiente: nada de anillos ni ilustraciones.
 *
 * <app-empty-state matIcon="folder_open" [titulo]="…" [texto]="…">
 *   <ol steps>…</ol>
 *   <a actions mat-flat-button>…</a>
 * </app-empty-state>
 */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <span class="es__icon" aria-hidden="true"><mat-icon>{{ matIcon() }}</mat-icon></span>
    <h2 class="es__title">{{ titulo() }}</h2>
    @if (texto()) { <p class="es__text">{{ texto() }}</p> }
    <ng-content select="[steps]" />
    <div class="es__actions"><ng-content select="[actions]" /></div>
  `,
  styleUrl: './empty-state.component.css',
})
export class EmptyStateComponent {
  /** Nombre del icono de Material Symbols. */
  matIcon = input('inbox');
  titulo = input.required<string>();
  texto = input<string>();
}
