import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BrandMarkComponent } from '../../shared/ui/brand-mark/brand-mark.component';

/**
 * Pie de las páginas públicas (el de la landing). Con `enInicio` los enlaces a
 * secciones de la landing emiten `irA` y la marca `arriba`, igual que la
 * cabecera; fuera de ella van a `/#seccion`.
 */
@Component({
  selector: 'app-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink, TranslatePipe, BrandMarkComponent],
  templateUrl: './site-footer.component.html',
  styleUrls: ['../styles/site-base.css', './site-footer.component.css'],
})
export class SiteFooterComponent {
  readonly enInicio = input(false);

  readonly irA = output<string>();
  readonly arriba = output<void>();

  readonly year = new Date().getFullYear();

  ir(id: string, event: Event): void {
    event.preventDefault();
    this.irA.emit(id);
  }

  inicio(event: Event): void {
    if (!this.enInicio()) return;
    event.preventDefault();
    this.arriba.emit();
  }
}
