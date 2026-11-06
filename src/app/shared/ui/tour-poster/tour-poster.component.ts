import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { matterportThumb } from '../../util/matterport';
import { abrirVisor } from '../media-viewer/media-viewer.component';

/**
 * Póster de un tour 3D: la miniatura pública de Matterport y un botón que abre
 * el tour a pantalla completa. En la página no se carga el visor (pesado y que
 * atrapa el gesto de scroll en el móvil); solo una imagen.
 */
@Component({
  selector: 'app-tour-poster',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './tour-poster.component.html',
  styleUrl: './tour-poster.component.css',
})
export class TourPosterComponent {
  private dialog = inject(MatDialog);

  /** URL del tour Matterport (`…?m=<modelo>`). */
  url = input.required<string>();
  /** Título ya traducido: etiqueta del póster y del visor. */
  titulo = input.required<string>();

  protected falloMiniatura = signal(false);
  protected miniatura = computed(() => this.falloMiniatura() ? null : matterportThumb(this.url()));

  abrir(): void {
    abrirVisor(this.dialog, { tipo: 'tour', url: this.url(), titulo: this.titulo() });
  }
}
