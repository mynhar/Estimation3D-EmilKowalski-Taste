import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthSupabaseService } from '../../../services/auth-supabase.service';
import { ArchivoService } from '../../../services/archivo.service';
import { ToastService } from '../../../services/toast.service';
import {
  DocumentosClienteService,
  ExpedienteArchivosVM,
  GrupoRolVM,
  ArchivoVM,
  RolSubida,
  TipoArchivo,
} from '../../../services/documentos-cliente.service';
import { DbPerfilVideo } from '../../../types/supabase';
import { ReproductorVideoComponent } from '../../../shared/ui/presentacion-videos/reproductor-video.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ExpedientePanelComponent } from '../../../shared/ui/expediente-panel/expediente-panel.component';
import { abrirVisor } from '../../../shared/ui/media-viewer/media-viewer.component';

type FiltroTipo = 'todos' | TipoArchivo;

/** Icono de cada tipo de archivo; el tour 3D del estimador lleva el suyo. */
const ICONO_TIPO: Record<TipoArchivo | 'tour', { matIcon: string }> = {
  foto:      { matIcon: 'image' },
  video:     { matIcon: 'videocam' },
  documento: { matIcon: 'description' },
  tour:      { matIcon: 'view_in_ar' },
};

/** Icono de quien subió el archivo (cabecera de cada grupo). */
const ICONO_ROL: Record<RolSubida, { matIcon: string }> = {
  cliente:       { matIcon: 'person' },
  estimador:     { matIcon: 'assignment_turned_in' },
  constructor:   { matIcon: 'construction' },
  administrador: { matIcon: 'shield_person' },
  desconocido:   { matIcon: 'help' },
};

@Component({
  selector: 'app-client-my-documents-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe, NgTemplateOutlet, MatButtonModule, MatButtonToggleModule, MatIconModule,
    MatTooltipModule, ReproductorVideoComponent, PageHeaderComponent, EmptyStateComponent,
    ExpedientePanelComponent,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class MyDocumentsListComponent implements OnInit {
  private auth        = inject(AuthSupabaseService);
  private documentos  = inject(DocumentosClienteService);
  private archivoSvc  = inject(ArchivoService);
  private toast       = inject(ToastService);
  private translate   = inject(TranslateService);
  private dialog      = inject(MatDialog);
  private injector    = inject(Injector);

  private user = toSignal(this.auth.user$);

  expedientes = signal<ExpedienteArchivosVM[]>([]);
  cargando    = signal(true);
  error       = signal<string | null>(null);

  expandidos  = signal<Set<string>>(new Set());
  filtroTipo  = signal<FiltroTipo>('todos');
  vista       = signal<'lista' | 'galeria'>('lista');
  thumbRoto   = signal<Set<string>>(new Set());

  subiendoId        = signal<string | null>(null);   // expediente en subida
  dragId            = signal<string | null>(null);    // expediente con drag encima
  eliminandoId      = signal<string | null>(null);
  confirmEliminarId = signal<string | null>(null);
  /** Video de presentación abierto en el reproductor (sólo para ver). */
  presentacionAbierta = signal<DbPerfilVideo | null>(null);

  private pendingExpId: string | null = null;

  // Conteo global por tipo, para el filtro.
  conteoGlobal = computed(() => {
    const exps = this.expedientes();
    const all  = exps.flatMap(e => e.grupos.flatMap(g => g.archivos));
    return {
      todos:       all.length,
      foto:        all.filter(a => a.tipo === 'foto').length,
      video:       all.filter(a => a.tipo === 'video').length,
      documento:   all.filter(a => a.tipo === 'documento').length,
      expedientes: exps.length,
    };
  });

  // ── Ciclo de vida ───────────────────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    await this.cargar(true);
  }

  private async cargar(mostrarSpinner: boolean): Promise<void> {
    const userId = this.user()?.id;
    if (!userId) { this.cargando.set(false); return; }
    if (mostrarSpinner) this.cargando.set(true);
    try {
      const data = await this.documentos.getExpedientesConArchivos(userId);
      this.expedientes.set(data);
      // Colapsar por defecto; abrir solo el expediente más reciente.
      if (mostrarSpinner) {
        this.expandidos.set(new Set(data.length ? [data[0].expedienteId] : []));
      }
      this.error.set(null);
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      if (mostrarSpinner) this.cargando.set(false);
    }
  }

  // ── Acordeón ──────────────────────────────────────────────────────────────

  toggle(expId: string): void {
    this.expandidos.update(set => {
      const next = new Set(set);
      next.has(expId) ? next.delete(expId) : next.add(expId);
      return next;
    });
  }
  isExpandido(expId: string): boolean { return this.expandidos().has(expId); }

  // ── Filtro por tipo ─────────────────────────────────────────────────────────

  setFiltro(t: FiltroTipo): void { this.filtroTipo.set(t); }
  setVista(v: 'lista' | 'galeria'): void { this.vista.set(v); }

  // Miniatura real, si hay: la propia foto (en storage, no enlaces externos) o
  // la del video de presentación. Nunca una que ya falló al cargar.
  thumbUrl(a: ArchivoVM): string | null {
    if (this.thumbRoto().has(a.id)) return null;
    if (a.fuente === 'presentacion') return a.miniatura ?? null;
    return a.tipo === 'foto' && !a.esExterno ? a.url : null;
  }
  onThumbError(id: string): void {
    this.thumbRoto.update(s => { const n = new Set(s); n.add(id); return n; });
  }

  // Grupos del expediente con sus archivos ya filtrados por tipo (omite vacíos).
  gruposVisibles(exp: ExpedienteArchivosVM): GrupoRolVM[] {
    const f = this.filtroTipo();
    if (f === 'todos') return exp.grupos;
    return exp.grupos
      .map(g => ({ rol: g.rol, archivos: g.archivos.filter(a => a.tipo === f) }))
      .filter(g => g.archivos.length > 0);
  }

  visiblesEn(exp: ExpedienteArchivosVM): number {
    const f = this.filtroTipo();
    if (f === 'todos') return exp.total;
    return exp.grupos.reduce((n, g) => n + g.archivos.filter(a => a.tipo === f).length, 0);
  }

  // ── Subir (zona drag&drop + clic; tipo inferido del MIME) ───────────────────

  pedirArchivos(expId: string, input: HTMLInputElement): void {
    if (this.subiendoId()) return;
    this.pendingExpId = expId;
    input.value = '';
    input.click();
  }

  async onArchivosElegidos(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    const expId = this.pendingExpId;
    this.pendingExpId = null;
    if (expId && files.length) await this.subirVarios(expId, files);
    input.value = '';
  }

  onDragOver(expId: string, e: DragEvent): void {
    e.preventDefault();
    if (!this.subiendoId()) this.dragId.set(expId);
  }
  onDragLeave(expId: string): void { if (this.dragId() === expId) this.dragId.set(null); }
  async onDrop(expId: string, e: DragEvent): Promise<void> {
    e.preventDefault();
    this.dragId.set(null);
    const files = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length) await this.subirVarios(expId, files);
  }

  private async subirVarios(expId: string, files: File[]): Promise<void> {
    const uid = this.user()?.id;
    if (!uid || this.subiendoId()) return;
    this.subiendoId.set(expId);
    try {
      for (const f of files) {
        await this.archivoSvc.subir(expId, this.tipoDeMime(f), f, uid);
      }
      await this.cargar(false);
      this.toast.show(this.translate.instant('my_documents.success_upload'), 'success');
    } catch {
      this.toast.show(this.translate.instant('my_documents.err_upload'), 'danger');
    } finally {
      this.subiendoId.set(null);
    }
  }

  private tipoDeMime(f: File): TipoArchivo {
    if (f.type.startsWith('image/')) return 'foto';
    if (f.type.startsWith('video/')) return 'video';
    return 'documento';
  }

  // ── Eliminar (solo propios; RLS bloquea el resto) ───────────────────────────

  // El foco sigue a la pregunta: «Non» al abrirla, la papelera al cerrarla y,
  // si el archivo ya no está, la zona de subida de su dossier.
  pedirEliminar(id: string): void {
    this.confirmEliminarId.set(id);
    this.enfocar(`md-del-keep-${id}`);
  }
  cancelarEliminar(id: string): void {
    this.confirmEliminarId.set(null);
    this.enfocar(`md-del-open-${id}`);
  }

  private enfocar(id: string): void {
    afterNextRender(() => document.getElementById(id)?.focus(), { injector: this.injector });
  }

  async eliminar(a: ArchivoVM, expId: string): Promise<void> {
    if (this.eliminandoId()) return;
    this.eliminandoId.set(a.id);
    try {
      await this.archivoSvc.eliminar({
        id:             a.id,
        nombre_archivo: a.nombre,
        url_storage:    a.urlStorage,
        mime_type:      a.mimeType,
        tamano_bytes:   a.tamanoBytes,
        subido_por:     a.subidoPor ?? undefined,
      });
      this.confirmEliminarId.set(null);
      await this.cargar(false);
      this.enfocar(`md-up-${expId}`);
      this.toast.show(this.translate.instant('my_documents.success_delete'), 'success');
    } catch {
      this.toast.show(this.translate.instant('my_documents.err_delete'), 'danger');
    } finally {
      this.eliminandoId.set(null);
    }
  }

  // ── Ver / descargar ─────────────────────────────────────────────────────────

  ver(a: ArchivoVM): void {
    if (a.fuente === 'presentacion') {
      if (a.presentacion) this.presentacionAbierta.set(a.presentacion);
      return;
    }
    // Tour 3D, foto y video propios: en el visor a pantalla completa, como en
    // el resto de la app. Documentos y contratos (PDF): en una pestaña nueva.
    if (a.fuente === 'estimacion') {
      abrirVisor(this.dialog, { tipo: 'tour', url: a.url, titulo: a.nombre });
    } else if ((a.tipo === 'foto' || a.tipo === 'video') && !a.esExterno) {
      abrirVisor(this.dialog, { tipo: a.tipo, url: a.url, titulo: a.nombre });
    } else {
      window.open(a.url, '_blank', 'noopener');
    }
  }

  descargar(a: ArchivoVM): void {
    const el = document.createElement('a');
    el.href = a.url;
    el.download = a.nombre;
    el.target = '_blank';
    el.rel = 'noopener';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  }

  // ── Helpers de presentación ─────────────────────────────────────────────────

  iconoArchivo(a: ArchivoVM): { matIcon: string } {
    return ICONO_TIPO[a.fuente === 'estimacion' ? 'tour' : a.tipo];
  }

  labelRol(rol: RolSubida): string { return `my_documents.role_${rol}`; }

  iconoRol(rol: RolSubida): { matIcon: string } {
    return ICONO_ROL[rol] ?? ICONO_ROL.desconocido;
  }

  formatTamano(bytes: number): string {
    if (!bytes || bytes <= 0) return '—';
    if (bytes < 1024)         return `${bytes} o`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} Ko`;
    return `${(kb / 1024).toFixed(1)} Mo`;
  }
}
