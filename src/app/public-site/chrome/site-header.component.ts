import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject, input,
  output, signal, viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';

import { LangService } from '../../services/lang.service';
import { LangToggleComponent } from '../../components/lang-toggle/lang-toggle.component';
import { BrandMarkComponent } from '../../shared/ui/brand-mark/brand-mark.component';

/** Página pública en la que está la cabecera (marca el enlace con aria-current). */
export type PaginaPublica = 'inicio' | 'journal' | 'entrepreneurs';

/**
 * Cabecera de las páginas públicas, con su menú móvil (`<dialog>` nativo: foco
 * atrapado, Escape y fondo inerte). Es la de la landing; Le Journal y
 * Entrepreneurs la comparten para que el sitio tenga una sola cabecera.
 *
 * - En la landing (`pagina="inicio"`) los enlaces a sus secciones no navegan:
 *   emiten `irA` con el id y la landing hace el desplazamiento suave y deja el
 *   foco en la sección. La marca emite `arriba`.
 * - En las demás páginas esos enlaces van a `/#seccion` (el router tiene
 *   `anchorScrolling` activado).
 *
 * `ctaRelleno`: el botón «Créer mon dossier» va relleno (espresso) solo cuando no
 * hay otro botón principal a la vista; si no, de contorno (la landing lo pasa a
 * contorno mientras se ve el del hero; en Entrepreneurs, donde lo principal es
 * postular, va siempre de contorno).
 */
@Component({
  selector: 'app-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet, RouterLink, MatButtonModule, MatIconModule, MatMenuModule, TranslatePipe,
    LangToggleComponent, BrandMarkComponent,
  ],
  templateUrl: './site-header.component.html',
  styleUrls: ['../styles/site-base.css', './site-header.component.css'],
})
export class SiteHeaderComponent {
  private zone = inject(NgZone);

  readonly lang = inject(LangService);

  readonly pagina = input<PaginaPublica>('inicio');
  readonly ctaRelleno = input(true);

  /** Solo en la landing: sección de la propia página a la que ir. */
  readonly irA = output<string>();
  /** Solo en la landing: volver al principio. */
  readonly arriba = output<void>();

  readonly scrolled = signal(false);

  private menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');
  private menuButton = viewChild.required('menuButton', { read: ElementRef<HTMLButtonElement> });
  private returnFocus = true;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => this.zone.runOutsideAngular(() => {
      // Filete de la cabecera. Fuera de la zona: solo se entra al cambiar de estado.
      const onScroll = () => {
        const isScrolled = window.scrollY > 8;
        if (isScrolled !== this.scrolled()) this.zone.run(() => this.scrolled.set(isScrolled));
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
      onScroll();
    }));
  }

  get enInicio(): boolean { return this.pagina() === 'inicio'; }

  /**
   * Enlace a una sección de la landing: en ella, desplazamiento propio; fuera,
   * el router. El menú se cierra antes de avisar: con el `<dialog>` modal
   * abierto la página es inerte y la landing no podría dejar el foco en la sección.
   */
  ir(id: string, event: Event): void {
    this.closeMenu(false);
    if (this.enInicio) {
      event.preventDefault();
      this.irA.emit(id);
    }
  }

  /** La marca: en la landing sube al principio (el router ignora ir a la misma URL). */
  inicio(event: Event): void {
    this.closeMenu(false);
    if (this.enInicio) {
      event.preventDefault();
      this.arriba.emit();
    }
  }

  openMenu(): void {
    this.menu().nativeElement.showModal();
  }

  /**
   * `returnFocus = false` cuando se cierra para navegar: el evento `close` llega
   * después y, si no, devolvería el foco al botón en vez de dejarlo en el destino.
   */
  closeMenu(returnFocus = true): void {
    const dialog = this.menu().nativeElement;
    if (!dialog.open) return;
    this.returnFocus = returnFocus;
    dialog.close();
  }

  /** Un clic en el telón (fuera de la hoja) cierra el menú. */
  onMenuClick(event: MouseEvent): void {
    if (event.target === this.menu().nativeElement) this.closeMenu();
  }

  /** Al cerrarse, el foco vuelve al botón que lo abrió (salvo al navegar). */
  onMenuClosed(): void {
    if (this.returnFocus) this.menuButton().nativeElement.focus({ preventScroll: true });
    this.returnFocus = true;
  }
}
