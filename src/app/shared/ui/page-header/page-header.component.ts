import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Cabecera de pantalla: título (h1) y, si aporta, una línea de contexto debajo.
 * Las acciones se proyectan con el atributo `actions`. En móvil las acciones
 * pasan bajo el título a ancho completo.
 *
 * <app-page-header [titulo]="…" [contexto]="…">
 *   <a actions mat-flat-button routerLink="…">…</a>
 * </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ph__text">
      <h1 class="ph__title">{{ titulo() }}</h1>
      @if (contexto()) { <p class="ph__context">{{ contexto() }}</p> }
    </div>
    <div class="ph__actions"><ng-content select="[actions]" /></div>
  `,
  styleUrl: './page-header.component.css',
})
export class PageHeaderComponent {
  titulo = input.required<string>();
  contexto = input<string | null>();
}
