import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, signal,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ETAPAS } from '../../util/etapas';

/** Un medio que el visor sabe mostrar. */
export interface MediaViewerItem {
  tipo: 'tour' | 'video' | 'foto';
  url: string;
  /** Título ya traducido (barra superior y nombre accesible del diálogo). */
  titulo: string;
}

/** El dossier al que pertenece el medio: la línea «EXP-… · Étape 4 sur 6» y «Voir le dossier». */
export interface VisorContexto {
  numero: string;
  /** Etapa 1–6; 0 si el dossier está fuera del flujo. */
  etapa: number;
  /** Ruta de la ficha del dossier; sin ella no hay botón. */
  ruta?: string | readonly unknown[];
}

export interface MediaViewerData extends MediaViewerItem {
  /** Todos los medios del dossier, incluido este. Con más de uno, segmentado arriba. */
  medios?: readonly MediaViewerItem[];
  contexto?: VisorContexto | null;
}

const TIP_KEY = 'matterport_tip_shown';

/**
 * Visor a pantalla completa para un tour 3D (Matterport), un vídeo o una foto.
 *
 * La escena ocupa toda la pantalla sobre espresso profundo; los controles flotan
 * encima en paneles crema con desenfoque: arriba volver, título y pantalla
 * completa; debajo, el segmentado entre medios; abajo, al alcance del pulgar, la
 * hoja del tour con la etapa del dossier, cómo moverse y «Voir le dossier». La
 * hoja se cierra para dejar libres los controles de Matterport y se reabre con ⓘ.
 *
 * El iframe solo existe mientras el diálogo está abierto: el tour no se descarga
 * hasta que el cliente lo pide, y el dedo nunca queda atrapado en el modelo
 * dentro del scroll de la página. Ábrelo con `abrirVisor()`.
 */
@Component({
  selector: 'app-media-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatButtonToggleModule, MatIconModule, TranslatePipe],
  templateUrl: './media-viewer.component.html',
  styleUrl: './media-viewer.component.css',
  host: { '(document:fullscreenchange)': 'sincronizarPantallaCompleta()' },
})
export class MediaViewerComponent {
  protected data = inject<MediaViewerData>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<MediaViewerComponent>);
  private sanitizer = inject(DomSanitizer);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly totalEtapas = ETAPAS.length;
  protected readonly medios: readonly MediaViewerItem[] = this.data.medios?.length ? this.data.medios : [this.data];
  protected indice = signal(Math.max(0, this.medios.findIndex(m => m.url === this.data.url)));
  protected actual = computed(() => this.medios[this.indice()] ?? this.data);

  /** Numera las etiquetas del segmentado solo si hay más de un medio del mismo tipo. */
  protected numerar = computed(() => ({
    tour: this.medios.filter(m => m.tipo === 'tour').length > 1,
    video: this.medios.filter(m => m.tipo === 'video').length > 1,
  }));

  protected urlTour = computed(() => {
    const m = this.actual();
    return m.tipo === 'tour' ? this.sanitizer.bypassSecurityTrustResourceUrl(m.url) : null;
  });

  /** Hoja del tour: abierta la primera vez; luego, solo si se pide con ⓘ. */
  protected hoja = signal(this.data.tipo === 'tour' && !leer(TIP_KEY));

  protected readonly puedePantallaCompleta = typeof document !== 'undefined' && !!document.fullscreenEnabled;
  protected pantallaCompleta = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => { /* ya salió */ });
    });
  }

  /** Posición de un medio entre los de su tipo (1, 2…), para «Vidéo 2». */
  protected numeroDe(i: number): number {
    const tipo = this.medios[i].tipo;
    return this.medios.slice(0, i + 1).filter(m => m.tipo === tipo).length;
  }

  cerrarHoja(): void {
    this.hoja.set(false);
    try { localStorage.setItem(TIP_KEY, '1'); } catch { /* sin almacenamiento: se vuelve a mostrar */ }
  }

  abrirHoja(): void { this.hoja.set(true); }

  alternarPantallaCompleta(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { /* el navegador lo rechazó */ });
    } else {
      this.host.nativeElement.requestFullscreen?.().catch(() => { /* el navegador lo rechazó */ });
    }
  }

  sincronizarPantallaCompleta(): void {
    this.pantallaCompleta.set(!!document.fullscreenElement);
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
