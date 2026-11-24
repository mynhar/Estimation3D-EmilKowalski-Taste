import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastService } from '../../services/toast.service';

/**
 * Avisos efímeros (Lin et bronze): pila abajo a la derecha (abajo a lo ancho en móvil), cada aviso
 * con su tono suave, borde, icono y texto, como los avisos en línea de las pantallas. Se cierran
 * solos (ToastService, 6 s) o con la cruz. Errores en terracota, con icono y texto.
 */
@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  toast = inject(ToastService);

  /** Icono por tipo de aviso. */
  readonly ICONO = {
    success: { matIcon: 'check_circle' },
    danger:  { matIcon: 'error' },
    warning: { matIcon: 'warning' },
    info:    { matIcon: 'info' },
  } as const;
}
