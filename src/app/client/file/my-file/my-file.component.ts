import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ExpedienteService } from '../../../services/expediente.service';
import { OfertaService } from '../../../services/oferta.service';
import { ArchivoService, TipoArchivo } from '../../../services/archivo.service';
import { DocumentosClienteService, ArchivoVM } from '../../../services/documentos-cliente.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ExpedienteVistaCliente, OfertaConConstructor, ArchivoRow, ContratoPanelCliente } from '../../../models';
import { ContratoService } from '../../../services/contrato.service';
import { AuthSupabaseService } from '../../../services/auth-supabase.service';
import { MatterportService } from '../../../services/matterport.service';
import { MatterportModelo } from '../../../models/matterport.model';
import { MatterportInfoComponent } from '../../../shared/ui/matterport-info/matterport-info.component';
import { ContratosExpedienteComponent } from '../../../shared/ui/contratos-expediente/contratos-expediente.component';
import { AvisoArchivadoComponent } from '../../../shared/ui/aviso-archivado/aviso-archivado.component';
import { VideoFichaComponent } from '../../../shared/ui/presentacion-videos/video-ficha.component';
import { DbPerfilVideo } from '../../../types/supabase';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { StatusChipComponent } from '../../../shared/ui/status-chip/status-chip.component';
import { StageLineComponent } from '../../../shared/ui/stage-line/stage-line.component';
import { TourPosterComponent } from '../../../shared/ui/tour-poster/tour-poster.component';
import { abrirVisor } from '../../../shared/ui/media-viewer/media-viewer.component';
import { etapaDossier } from '../../../shared/util/etapas';


@Component({
  selector: 'app-my-file',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, TranslatePipe, NgTemplateOutlet, MatButtonModule, MatIconModule,
    PageHeaderComponent, EmptyStateComponent, StatusChipComponent, StageLineComponent, TourPosterComponent,
    MatterportInfoComponent, ContratosExpedienteComponent, AvisoArchivadoComponent, VideoFichaComponent,
  ],
  templateUrl: './my-file.component.html',
  styleUrl:    './my-file.component.css',
})
export class MyFileComponent implements OnInit {
  private dialog            = inject(MatDialog);
  private translate         = inject(TranslateService);
  private expedienteService = inject(ExpedienteService);
  private ofertaService     = inject(OfertaService);
  private archivoService    = inject(ArchivoService);
  private documentosService = inject(DocumentosClienteService);
  private auth              = inject(AuthSupabaseService);
  private contratoService   = inject(ContratoService);
  private matterportService = inject(MatterportService);
  private route             = inject(ActivatedRoute);

  private expedienteId = '';

  detalle        = signal<ExpedienteVistaCliente | null>(null);
  /** Fuera del flujo (cancelado o archivado): sin porcentaje ni pasos activos. */
  cerrado        = computed(() => ['cancelado', 'archivado'].includes(this.detalle()?.estado ?? ''));
  /** Archivado: solo un administrador puede modificarlo (la base rechaza el resto). */
  archivado      = computed(() => this.detalle()?.estado === 'archivado');
  // Ficha de la propiedad escaneada (Matterport), solo lectura.
  matterportModelos = signal<MatterportModelo[]>([]);
  // Ofertas aceptadas: una por constructor seleccionado. Administración puede
  // adjudicar varias a la vez (un contrato por oferta), así que no hay "la"
  // oferta aceptada sino una lista.
  ofertasSeleccionadas = signal<OfertaConConstructor[]>([]);
  fotos          = signal<ArchivoRow[]>([]);
  // "Fotos del sitio" / "Documentos técnicos": archivos del expediente de TODAS
  // las fuentes (expediente, oferta, contrato, obra) y roles — paridad con
  // my-documents/list.
  fotosVM        = signal<ArchivoVM[]>([]);
  documentosVM   = signal<ArchivoVM[]>([]);
  videos         = signal<ArchivoRow[]>([]);
  documentos     = signal<ArchivoRow[]>([]);
  // Videos de presentación (sólo para ver): el del estimador va en su informe;
  // el de cada constructor seleccionado, junto a su nombre.
  presentaciones = signal<ArchivoVM[]>([]);
  private presentacionesPorRol = computed(() => this.presentaciones()
    .filter((p): p is ArchivoVM & { presentacion: DbPerfilVideo } => !!p.presentacion && !!p.subidoPor)
    .map(p => ({ rol: p.subidoPorRol, perfilId: p.subidoPor!, video: p.presentacion, miniatura: p.miniatura ?? null })));
  videoEstimador = computed(() => this.presentacionesPorRol().find(p => p.rol === 'estimador') ?? null);
  videoDeConstructor = computed(() => new Map(this.presentacionesPorRol()
    .filter(p => p.rol === 'constructor')
    .map(p => [p.perfilId, p])));
  // Todos los contratos del expediente, cancelados incluidos.
  contratos      = signal<ContratoPanelCliente[]>([]);
  cargando       = signal(true);
  errorMsg       = signal('');
  subiendo        = signal<TipoArchivo | null>(null);
  errorSubida     = signal('');
  currentUserId   = signal<string | null>(null);
  eliminando      = signal<string | null>(null);

  // "Fotos del sitio" / "Documentos técnicos" listan lo de OTROS roles (fotosVM /
  // documentosVM, sin el cliente). "Mis archivos" lista lo que agregó el cliente.
  misFotos    = computed(() => this.fotos().filter(f => f.subido_por === this.currentUserId()));
  misVideos   = computed(() => this.videos().filter(f => f.subido_por === this.currentUserId()));
  misDocs     = computed(() => this.documentos().filter(f => f.subido_por === this.currentUserId()));
  otrosVideos = computed(() => this.videos().filter(f => f.subido_por !== this.currentUserId()));

  /** Etapa 1–6; los contratos pueden adelantarla. 0 = cancelado o archivado. */
  etapa = computed(() => {
    const d = this.detalle();
    return d ? etapaDossier(d.estado, this.contratos()) : 0;
  });

  get urlsTour(): string[] {
    const raw = this.detalle()?.url_tour ?? null;
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((u): u is string => typeof u === 'string' && !!u);
    } catch {}
    return [raw];
  }

  tituloTour(i: number): string {
    const base = this.translate.instant('file.tour_title');
    return this.urlsTour.length > 1 ? `${base} ${i + 1}` : base;
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.cargando.set(false); return; }
    this.expedienteId = id;
    this.cargarMatterport();

    try {
      const [detalle, ofertas, archivos, contratos, { data: { user } }] = await Promise.all([
        this.expedienteService.getVistaParaCliente(id),
        this.ofertaService.getOfertasDeExpediente(id),
        this.archivoService.cargarTodos(id),
        // Un fallo en los contratos no debe tumbar la ficha.
        this.contratoService.getPanelClienteExpediente(id).catch((e: any) => {
          console.error('[MyFile] contratos:', e?.message);
          return [] as ContratoPanelCliente[];
        }),
        this.auth.client.auth.getUser(),
      ]);
      this.currentUserId.set(user?.id ?? null);
      this.detalle.set(detalle);
      this.ofertasSeleccionadas.set(ofertas.filter(o => o.estado === 'aceptada' && !o.eliminada_en));
      this.fotos.set(archivos.fotos);
      this.videos.set(archivos.videos);
      this.documentos.set(archivos.documentos);
      this.contratos.set(contratos);
      await this.cargarArchivosVM(true);
    } catch (e: any) {
      console.error('[MyFile]', e.message);
      this.errorMsg.set(e.message);
    } finally {
      this.cargando.set(false);
    }
  }

  /** Ficha Matterport del expediente. Un fallo aquí no debe tumbar la página. */
  private async cargarMatterport() {
    try {
      this.matterportModelos.set(await this.matterportService.getPorExpediente(this.expedienteId));
    } catch (e: any) {
      console.error('[MyFile] matterport:', e.message);
    }
  }

  async subirArchivo(tipo: TipoArchivo, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    const uid   = this.currentUserId();
    if (!file || !this.expedienteId || !uid || this.archivado()) return;

    this.subiendo.set(tipo);
    this.errorSubida.set('');
    try {
      await this.archivoService.subir(this.expedienteId, tipo, file, uid);
      const archivos = await this.archivoService.cargarTodos(this.expedienteId);
      this.fotos.set(archivos.fotos);
      this.videos.set(archivos.videos);
      this.documentos.set(archivos.documentos);
      if (tipo === 'foto' || tipo === 'documento') await this.cargarArchivosVM();
      input.value = '';
    } catch (e: any) {
      this.errorSubida.set(e.message ?? 'upload_error');
    } finally {
      this.subiendo.set(null);
    }
  }

  async eliminarArchivo(archivo: ArchivoRow): Promise<void> {
    if (this.archivado()) return;
    this.eliminando.set(archivo.id);
    this.errorSubida.set('');
    try {
      await this.archivoService.eliminar(archivo);
      const archivos = await this.archivoService.cargarTodos(this.expedienteId);
      this.fotos.set(archivos.fotos);
      this.videos.set(archivos.videos);
      this.documentos.set(archivos.documentos);
    } catch (e: any) {
      this.errorSubida.set(e.message ?? 'delete_error');
    } finally {
      this.eliminando.set(null);
    }
  }

  /**
   * Carga "Fotos del sitio" y "Documentos técnicos": fotos y documentos del
   * expediente de todas las fuentes (expediente, oferta, contrato, obra) y
   * roles, vía el mismo servicio que client/my-documents/list. Una sola consulta.
   * Con `conPresentaciones` (sólo al abrir la ficha: subir o borrar no las
   * cambia), también los videos de presentación.
   */
  private async cargarArchivosVM(conPresentaciones = false): Promise<void> {
    const clienteId = this.currentUserId() ?? '';
    const numero    = this.detalle()?.numero ?? '';
    try {
      const archivos = await this.documentosService.getArchivosDeExpediente(
        this.expedienteId, numero, clienteId, { presentaciones: conPresentaciones });
      if (conPresentaciones) this.presentaciones.set(archivos.filter(a => a.fuente === 'presentacion'));
      // Excluir explícitamente lo que aportó el cliente: estas secciones muestran
      // solo archivos de estimador / constructor / administrador (todas las fuentes).
      const deOtros = archivos.filter(a => a.subidoPorRol !== 'cliente');
      this.fotosVM.set(deOtros.filter(a => a.tipo === 'foto'));
      this.documentosVM.set(deOtros.filter(a => a.tipo === 'documento'));
    } catch {
      this.fotosVM.set([]);
      this.documentosVM.set([]);
    }
  }

  /** Abre una foto en el visor a pantalla completa. */
  verFoto(url: string, nombre: string): void {
    abrirVisor(this.dialog, { tipo: 'foto', url, titulo: nombre });
  }

  /** Borra un archivo propio desde una fila: los del VM (todas las fuentes) o los del expediente. */
  borrar(item: ArchivoVM | ArchivoRow, vm: boolean): void {
    if (vm) this.eliminarArchivoVM(item as ArchivoVM);
    else    this.eliminarArchivo(item as ArchivoRow);
  }

  /** Borra una foto/documento propio del expediente y recarga las galerías. */
  async eliminarArchivoVM(item: ArchivoVM): Promise<void> {
    if (!item.esPropio || !item.archivoId || this.eliminando() !== null || this.archivado()) return;
    this.eliminando.set(item.id);
    this.errorSubida.set('');
    try {
      await this.archivoService.eliminar({
        id:             item.archivoId,
        nombre_archivo: item.nombre,
        url_storage:    item.urlStorage,
        mime_type:      item.mimeType,
        tamano_bytes:   item.tamanoBytes,
        subido_por:     item.subidoPor ?? undefined,
      });
      const archivos = await this.archivoService.cargarTodos(this.expedienteId);
      this.fotos.set(archivos.fotos);
      this.documentos.set(archivos.documentos);
      await this.cargarArchivosVM();
    } catch (e: any) {
      this.errorSubida.set(e.message ?? 'delete_error');
    } finally {
      this.eliminando.set(null);
    }
  }

  get servicioNombre(): string {
    const d = this.detalle();
    if (!d) return '';
    const lang = this.translate.currentLang;
    if (lang === 'en') return d.servicio_nombre_en || d.servicio_nombre;
    if (lang === 'fr') return d.servicio_nombre_fr || d.servicio_nombre;
    return d.servicio_nombre;
  }

  formatFecha(valor: string | null): string {
    if (!valor) return '—';
    const raw = valor.includes('T') ? valor.split('T')[0] : valor;
    const d   = new Date(`${raw}T00:00:00`);
    if (isNaN(d.getTime())) return '—';
    const localeMap: Record<string, string> = { es: 'es-CA', en: 'en-US', fr: 'fr-CA' };
    const locale = localeMap[this.translate.currentLang] ?? 'fr-CA';
    const parts  = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(d);
    const p: Record<string, string> = {};
    for (const part of parts) p[part.type] = part.value;
    return this.translate.currentLang === 'en'
      ? `${p['month']} ${p['day']}, ${p['year']}`
      : `${p['day']} ${p['month']} ${p['year']}`;
  }

  formatHora(valor: string | null): string {
    if (!valor || !valor.includes('T')) return '—';
    return valor.split('T')[1]?.slice(0, 5) ?? '—';
  }

  formatCosto(valor: number | null): string {
    if (valor === null) return '—';
    return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(valor);
  }

  publicUrl(storagePath: string): string {
    return this.archivoService.publicUrl(storagePath);
  }

  formatTamano(bytes: number): string {
    if (bytes < 1_024)     return `${bytes} B`;
    if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KB`;
    return `${(bytes / 1_048_576).toFixed(1)} MB`;
  }
}
