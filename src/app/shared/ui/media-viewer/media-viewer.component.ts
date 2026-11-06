import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

export interface MediaViewerData {
  tipo: 'tour' | 'video';
  url: string;
  /** Título ya traducido (barra superior y nombre accesible del diálogo). */
  titulo: string;
}

const TIP_KEY = 'matterport_tip_shown';

/**
 * Visor a pantalla completa para un tour 3D (Matterport) o un vídeo.
 *
 * El iframe solo existe mientras el diálogo está abierto: el tour no se descarga
 * hasta que el cliente lo pide, y el dedo nunca queda atrapado en el modelo
 * dentro del scroll de la página. Ábrelo con `abrirVisor()`.
 */
@Component({
  selector: 'app-media-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './media-viewer.component.html',
  styleUrl: './media-viewer.component.css',
})
export class MediaViewerComponent {
  protected data = inject<MediaViewerData>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<MediaViewerComponent>);
  private sanitizer = inject(DomSanitizer);

  protected urlTour = computed(() =>
    this.data.tipo === 'tour' ? this.sanitizer.bypassSecurityTrustResourceUrl(this.data.url) : null);

  /** Consejo de navegación: solo la primera vez que se abre un tour. */
  protected consejo = signal(this.data.tipo === 'tour' && !leer(TIP_KEY));

  ocultarConsejo(): void {
    this.consejo.set(false);
    try { localStorage.setItem(TIP_KEY, '1'); } catch { /* sin almacenamiento: se vuelve a mostrar */ }
  }

  cerrar(): void { this.ref.close(); }
}

function leer(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

/** Abre el visor a pantalla completa. */
export function abrirVisor(dialog: MatDialog, data: MediaViewerData): MatDialogRef<MediaViewerComponent> {
  return dialog.open(MediaViewerComponent, {
    data,
    width: '100vw',
    height: '100dvh',
    maxWidth: '100vw',
    maxHeight: '100dvh',
    panelClass: 'e3d-viewer-pane',
    ariaLabel: data.titulo,
    autoFocus: 'first-tabbable',
    restoreFocus: true,
  });
}
