import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Cabecera de pantalla: una etiqueta en mayúsculas opcional, el título (h1) y,
 * si aporta, una línea de contexto debajo. Las acciones se proyectan con el
 * atributo `actions`. En móvil las acciones pasan bajo el título a ancho completo.
 *
 * - `etiqueta`: dónde estás («Tableau de bord»), en bronce oscuro sobre el título.
 * - `enfasis`: palabra final del título en cursiva bronce. **Solo** en el saludo
 *   del tablero («Bonjour, *Marie*»); en el resto de pantallas no se usa.
 *
 * <app-page-header [etiqueta]="…" [titulo]="…" [contexto]="…">
 *   <a actions mat-flat-button routerLink="…">…</a>
 * </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ph__text">
      @if (etiqueta()) { <p class="ph__label">{{ etiqueta() }}</p> }
      <h1 class="ph__title">{{ titulo() }}@if (enfasis()) {<em class="ph__em">{{ enfasis() }}</em>}</h1>
      @if (contexto()) { <p class="ph__context">{{ contexto() }}</p> }
    </div>
    <div class="ph__actions"><ng-content select="[actions]" /></div>
  `,
  styleUrl: './page-header.component.css',
})
export class PageHeaderComponent {
  titulo = input.required<string>();
  etiqueta = input<string | null>();
  enfasis = input<string | null>();
  contexto = input<string | null>();
}
