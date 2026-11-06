import {
  ChangeDetectionStrategy, Component, OnInit, computed, inject, signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthSupabaseService } from '../../services/auth-supabase.service';
import { ExpedienteService } from '../../services/expediente.service';
import { ArchivoService } from '../../services/archivo.service';
import { DocumentosClienteService, ArchivoVM } from '../../services/documentos-cliente.service';
import { EstimacionService } from '../../services/estimacion.service';
import { ContratoService } from '../../services/contrato.service';
import { ArchivoRow, ContratoPanelCliente, ExpedienteCliente, ExpedienteVistaCliente } from '../../models';
import { ContratosExpedienteComponent } from '../../shared/ui/contratos-expediente/contratos-expediente.component';
import { VideoFichaComponent } from '../../shared/ui/presentacion-videos/video-ficha.component';
import { OfertaHistorialItem } from '../../services/expediente.service';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip.component';
import { StageLineComponent } from '../../shared/ui/stage-line/stage-line.component';
import { DossierCardComponent } from '../../shared/ui/dossier-card/dossier-card.component';
import { TourPosterComponent } from '../../shared/ui/tour-poster/tour-poster.component';
import { abrirVisor } from '../../shared/ui/media-viewer/media-viewer.component';
import { etapaDossier } from '../../shared/util/etapas';

// Último hito de un contrato según su estado. Fechado con `actualizado_en`:
// la base no guarda cuándo empezó la ejecución ni cuándo terminó.
const CONTRATO_EVENTO_FIN: Record<string, { tipo: string; matIcon: string; titulo: string }> = {
  en_ejecucion: { tipo: 'ejecucion_iniciada',  matIcon: 'play_circle', titulo: 'timeline.execution_started'  },
  completado:   { tipo: 'contrato_completado', matIcon: 'done_all',    titulo: 'timeline.contract_completed' },
  cancelado:    { tipo: 'contrato_cancelado',  matIcon: 'cancel',      titulo: 'timeline.contract_cancelled' },
  archivado:    { tipo: 'contrato_archivado',  matIcon: 'archive',     titulo: 'timeline.contract_archived' },
};

export interface TimelineEvento {
  fecha:      string;
  matIcon:    string;
  titulo:     string;
  subtitulo?: string;
  tipo:       string;
}

// Priority sort: most urgent states first
function estadoPriority(e: ExpedienteCliente): number {
  const p: Record<string, number> = {
    en_oferta: 0, adjudicado: 1, en_estimacion: 2,
    estimado: 3, nuevo: 4, contratado: 5, cancelado: 6,
  };
  return p[e.estado] ?? 7;
}

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, TranslatePipe, MatButtonModule, MatIconModule,
    ContratosExpedienteComponent, VideoFichaComponent,
    PageHeaderComponent, EmptyStateComponent, StatusChipComponent, StageLineComponent,
    DossierCardComponent, TourPosterComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private auth               = inject(AuthSupabaseService);
  private expedienteService  = inject(ExpedienteService);
  private archivoService     = inject(ArchivoService);
  private documentosService  = inject(DocumentosClienteService);
  private contratoService    = inject(ContratoService);
  private translate          = inject(TranslateService);
  private dialog             = inject(MatDialog);

  user        = toSignal(this.auth.user$);
  currentLang = toSignal(
    this.translate.onLangChange.pipe(map(e => e.lang)),
    { initialValue: this.translate.currentLang || 'fr' },
  );

  perfil          = signal<{ nombre: string | null; apellido: string | null } | null>(null);
  expedientes     = signal<ExpedienteCliente[]>([]);
  cargando        = signal(true);
  idSeleccionado  = signal<string | null>(null);
  detalleActivo   = signal<ExpedienteVistaCliente | null>(null);
  cargandoDetalle = signal(false);

  // Medios del expediente activo: tours 3D (Matterport) y videos
  tourUrls    = signal<string[]>([]);
  videos      = signal<ArchivoRow[]>([]);

  // Historia del expediente activo (los contratos salen de `contratos`)
  ofertasHistorial  = signal<OfertaHistorialItem[]>([]);

  fotosExp         = signal<ArchivoRow[]>([]);
  documentosExp    = signal<ArchivoRow[]>([]);
  // "Mis documentos": documentos del expediente de TODAS las fuentes (expediente,
  // estimación, oferta, contrato, obra) y roles — paridad con my-documents/list.
  documentosVM     = signal<ArchivoVM[]>([]);
  // …y, arriba, los videos de presentación del estimador y de los
  // constructores del expediente (sólo para ver).
  presentacionesVM = signal<ArchivoVM[]>([]);
  totalDocumentos  = computed(() => this.documentosVM().length + this.presentacionesVM().length);
  // Contratos del expediente (uno por constructor adjudicado), con el avance
  // de la obra de cada uno (seguimiento_obra).
  contratos        = signal<ContratoPanelCliente[]>([]);
  eliminando       = signal<string | null>(null);

  // ── Expediente activo ─────────────────────────────────────────────────

  expedienteActivo = computed(() =>
    this.expedientes().find(e => this.expId(e) === this.idSeleccionado())
    ?? this.expedientes()[0]
    ?? null
  );

  /** Etapa 1–6 del expediente activo; los contratos pueden adelantarla. 0 = fuera del flujo. */
  etapaActiva = computed(() => {
    const exp = this.expedienteActivo();
    return exp ? etapaDossier(exp.estado, this.contratos()) : 0;
  });

  /** Otros expedientes (no el activo) que tienen ofertas por revisar. */
  ofertasEnOtros = computed(() => {
    const activo = this.expedienteActivo();
    return this.expedientes().filter(e => e.estado === 'en_oferta' && e !== activo).length;
  });

  /** Nombre para el saludo: perfil, metadatos de la cuenta o el correo. */
  nombre = computed(() => {
    const p = this.perfil();
    if (p?.nombre) return [p.nombre, p.apellido].filter(Boolean).join(' ');
    const u = this.user();
    return u?.user_metadata?.['full_name'] ?? u?.email?.split('@')[0] ?? '';
  });

  // ── Medios ────────────────────────────────────────────────────────────────

  tieneTour    = computed(() => this.tourUrls().length > 0);
  tieneVideos  = computed(() => this.videos().length > 0);
  tieneMedia   = computed(() => this.tieneTour() || this.tieneVideos());

  // ── Avance de los contratos ───────────────────────────────────────────────

  /** Los cancelados no cuentan ni en el avance ni en el costo. */
  contratosVigentes = computed(() => this.contratos().filter(c => c.estado !== 'cancelado'));

  /**
   * Avance de todos los contratos: media del avance de obra de los vigentes,
   * todos con el mismo peso — la misma regla que la base aplica a los
   * servicios de un contrato (`recalcular_avance_seguimiento`).
   */
  avanceContratos = computed((): number => {
    const vs = this.contratosVigentes();
    return vs.length ? Math.round(vs.reduce((s, c) => s + c.avance_obra, 0) / vs.length) : 0;
  });

  obrasCompletadas = computed(() =>
    this.contratosVigentes().filter(c => c.obra_estado === 'completada').length);

  // ── Timeline computed ─────────────────────────────────────────────────────

  timelineEventos = computed((): TimelineEvento[] => {
    const d = this.detalleActivo();
    if (!d) return [];

    const events: TimelineEvento[] = [];

    // ── 1. Expediente creado ──────────────────────────────────────────────
    events.push({ fecha: d.creado_en, tipo: 'creacion', matIcon: 'create_new_folder', titulo: 'timeline.created' });

    // ── 2. Estimador asignado ─────────────────────────────────────────────
    if (d.estimador_nombre) {
      events.push({
        fecha: d.fecha_visita, tipo: 'asignacion', matIcon: 'how_to_reg',
        titulo: 'timeline.estimator_assigned', subtitulo: d.estimador_nombre,
      });
    }

    // ── 3. Visita / estimación realizada ──────────────────────────────────
    if (d.fecha_visita_real) {
      events.push({
        fecha: d.fecha_visita_real, tipo: 'visita_real',
        matIcon: 'event_available', titulo: 'timeline.visit_done',
      });
    } else if (d.fecha_visita && d.estimador_nombre) {
      events.push({
        fecha: d.fecha_visita, tipo: 'visita_prog',
        matIcon: 'event', titulo: 'timeline.visit_scheduled',
      });
    }

    // ── 4. Tour / videos disponibles ─────────────────────────────────────
    if (this.tourUrls().length > 0 || this.videos().length > 0) {
      events.push({
        fecha: d.fecha_visita_real ?? d.fecha_visita, tipo: 'tour',
        matIcon: 'view_in_ar', titulo: 'timeline.tour_available',
      });
    }

    // ── 5. Ofertas recibidas (una por oferta) ─────────────────────────────
    const ofertas = this.ofertasHistorial();
    for (let i = 0; i < ofertas.length; i++) {
      events.push({
        fecha: ofertas[i].creado_en,
        tipo:  `oferta_${i}`,
        matIcon: 'request_quote',
        titulo: 'timeline.offer_received',
        subtitulo: `#${i + 1}`,
      });
    }

    // ── 6. Contratos: uno por constructor adjudicado, cada uno con su
    //       aceptación → firma → inicio → ejecución → fin. El nombre del
    //       constructor distingue los eventos y el id los hace únicos (track).
    for (const c of this.contratos()) {
      const quien = c.constructor_nombre;
      events.push({
        fecha: c.generado_en, tipo: `oferta_aceptada_${c.id}`,
        matIcon: 'handshake', titulo: 'timeline.offer_accepted', subtitulo: quien,
      });

      if (c.firmado_en) {
        events.push({
          fecha: c.firmado_en, tipo: `contrato_firmado_${c.id}`,
          matIcon: 'draw', titulo: 'timeline.contract_signed', subtitulo: quien,
        });
      }

      if (c.fecha_inicio) {
        events.push({
          fecha: c.fecha_inicio, tipo: `inicio_obras_${c.id}`,
          matIcon: 'construction', titulo: 'timeline.works_started', subtitulo: quien,
        });
      }

      const fin = CONTRATO_EVENTO_FIN[c.estado];
      if (fin) {
        events.push({
          fecha: c.actualizado_en, tipo: `${fin.tipo}_${c.id}`,
          matIcon: fin.matIcon, titulo: fin.titulo, subtitulo: quien,
        });
      }
    }

    return events.sort((a, b) =>
      new Date(b.fecha ?? '').getTime() - new Date(a.fecha ?? '').getTime()
    );
  });

  // ── Calendar ─────────────────────────────────────────────────────────────

  calAnchor    = signal<Date>(new Date());
  calExpandido = signal(false);
  calMes       = signal<{ year: number; month: number }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });

  calMesLabel = computed((): string => {
    const localeMap: Record<string, string> = { es: 'es-CA', en: 'en-US', fr: 'fr-CA' };
    const locale = localeMap[this.currentLang()] ?? 'fr-CA';
    const ref = this.calExpandido()
      ? new Date(this.calMes().year, this.calMes().month, 1)
      : new Date(this.calAnchor().getFullYear(), this.calAnchor().getMonth(), 1);
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(ref);
  });

  calWeekdays = computed((): string[] => {
    const localeMap: Record<string, string> = { es: 'es-CA', en: 'en-US', fr: 'fr-CA' };
    const locale = localeMap[this.currentLang()] ?? 'fr-CA';
    return Array.from({ length: 7 }, (_, i) =>
      new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2025, 0, 6 + i))
    );
  });

  calDias = computed((): { day: number; inMonth: boolean; isToday: boolean; isAnchor: boolean; eventos: TimelineEvento[] }[] => {
    const anchor  = this.calAnchor();
    const today   = new Date();
    const eventos = this.timelineEventos();

    if (!this.calExpandido()) {
      // Week view: 7 days of the week containing the anchor (Monday-first)
      const dow       = anchor.getDay();
      const mondayOff = (dow + 6) % 7;
      const monday    = new Date(anchor);
      monday.setDate(anchor.getDate() - mondayOff);

      return Array.from({ length: 7 }, (_, i) => {
        const d        = new Date(monday);
        d.setDate(monday.getDate() + i);
        const isToday  = d.toDateString() === today.toDateString();
        const isAnchor = d.toDateString() === anchor.toDateString();
        const dayEvts  = eventos.filter(e => {
          if (!e.fecha) return false;
          const ev = new Date(e.fecha.includes('T') ? e.fecha : `${e.fecha}T00:00:00`);
          return ev.toDateString() === d.toDateString();
        });
        return { day: d.getDate(), inMonth: d.getMonth() === anchor.getMonth(), isToday, isAnchor, eventos: dayEvts };
      });
    }

    // Month view
    const { year, month } = this.calMes();
    const firstWeekday    = new Date(year, month, 1).getDay();
    const offset          = (firstWeekday + 6) % 7;
    const daysInMonth     = new Date(year, month + 1, 0).getDate();
    const daysInPrev      = new Date(year, month, 0).getDate();
    const days: { day: number; inMonth: boolean; isToday: boolean; isAnchor: boolean; eventos: TimelineEvento[] }[] = [];

    for (let i = offset - 1; i >= 0; i--) {
      days.push({ day: daysInPrev - i, inMonth: false, isToday: false, isAnchor: false, eventos: [] });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date     = new Date(year, month, d);
      const isToday  = date.toDateString() === today.toDateString();
      const isAnchor = date.toDateString() === anchor.toDateString();
      const dayEvts  = eventos.filter(e => {
        if (!e.fecha) return false;
        const ev = new Date(e.fecha.includes('T') ? e.fecha : `${e.fecha}T00:00:00`);
        return ev.getFullYear() === year && ev.getMonth() === month && ev.getDate() === d;
      });
      days.push({ day: d, inMonth: true, isToday, isAnchor, eventos: dayEvts });
    }
    const tail = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= tail; d++) {
      days.push({ day: d, inMonth: false, isToday: false, isAnchor: false, eventos: [] });
    }
    return days;
  });

  calPrev(): void {
    if (!this.calExpandido()) {
      const d = new Date(this.calAnchor());
      d.setDate(d.getDate() - 7);
      this.calAnchor.set(d);
    } else {
      const { year, month } = this.calMes();
      this.calMes.set(month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
    }
  }

  calNext(): void {
    if (!this.calExpandido()) {
      const d = new Date(this.calAnchor());
      d.setDate(d.getDate() + 7);
      this.calAnchor.set(d);
    } else {
      const { year, month } = this.calMes();
      this.calMes.set(month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });
    }
  }

  calPrevYear(): void {
    const { year, month } = this.calMes();
    this.calMes.set({ year: year - 1, month });
  }

  calNextYear(): void {
    const { year, month } = this.calMes();
    this.calMes.set({ year: year + 1, month });
  }

  calToggleExpand(): void {
    if (!this.calExpandido()) {
      const a = this.calAnchor();
      this.calMes.set({ year: a.getFullYear(), month: a.getMonth() });
      this.calExpandido.set(true);
    } else {
      this.calExpandido.set(false);
    }
  }

  private calInicializar(): void {
    const eventos = this.timelineEventos();
    if (eventos.length === 0) return;
    const now     = new Date();
    const futuros = eventos
      .filter(e => e.fecha && new Date(e.fecha.includes('T') ? e.fecha : `${e.fecha}T00:00:00`) >= now)
      .sort((a, b) => new Date(a.fecha!).getTime() - new Date(b.fecha!).getTime());
    const target = futuros.length > 0 ? futuros[0] : eventos[0];
    if (target.fecha) {
      const d = new Date(target.fecha.includes('T') ? target.fecha : `${target.fecha}T00:00:00`);
      this.calAnchor.set(d);
      this.calMes.set({ year: d.getFullYear(), month: d.getMonth() });
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  expId(exp: ExpedienteCliente): string { return exp.id; }

  /** Etapa de un expediente de la lista (sin sus contratos: solo se cargan los del activo). */
  etapaLista(exp: ExpedienteCliente): number {
    return exp === this.expedienteActivo() ? this.etapaActiva() : etapaDossier(exp.estado);
  }

  servicioNombre(s: ExpedienteCliente['servicio']): string {
    if (!s) return '';
    const lang = this.currentLang();
    if (lang === 'en') return s.nombre_en || s.nombre_fr || s.nombre_es || '';
    if (lang === 'es') return s.nombre_es || s.nombre_fr || '';
    return s.nombre_fr || s.nombre_es || '';
  }

  servicioNombreVista(d: ExpedienteVistaCliente): string {
    const lang = this.currentLang();
    if (lang === 'en') return d.servicio_nombre_en || d.servicio_nombre;
    if (lang === 'fr') return d.servicio_nombre_fr || d.servicio_nombre;
    return d.servicio_nombre;
  }

  formatFecha(valor: string | null | undefined): string {
    if (!valor) return '—';
    const d = new Date(valor.includes('T') ? valor : `${valor}T00:00:00`);
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

  formatPrecio(precio: number): string {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency', currency: 'CAD', maximumFractionDigits: 0,
    }).format(precio);
  }

  /** Tipo de documento, para elegir su icono en la plantilla. */
  tipoDoc(mime: string): 'imagen' | 'pdf' | 'otro' {
    if (mime.startsWith('image/')) return 'imagen';
    if (mime.includes('pdf'))      return 'pdf';
    return 'otro';
  }

  docUrl(archivo: ArchivoRow): string {
    return this.archivoService.publicUrl(archivo.url_storage);
  }

  /** Título de un tour: «Tour virtuel 3D du site», numerado si hay varios. */
  tituloTour(i: number): string {
    const base = this.translate.instant('file.tour_title');
    return this.tourUrls().length > 1 ? `${base} ${i + 1}` : base;
  }

  /** Abre un video del expediente en el visor a pantalla completa. */
  verVideo(v: ArchivoRow, i: number): void {
    abrirVisor(this.dialog, {
      tipo: 'video',
      url: this.archivoService.publicUrl(v.url_storage),
      titulo: `${this.translate.instant('dashboard_client.video_label')} ${i + 1}`,
    });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  async ngOnInit() {
    const userId = this.user()?.id;
    if (!userId) return;
    try {
      const { data: perfilData } = await this.auth.client
        .from('perfil')
        .select('nombre, apellido')
        .eq('id', userId)
        .single();
      if (perfilData) this.perfil.set(perfilData);

      const exps = await this.expedienteService.getMisExpedientes(userId);
      exps.sort((a, b) => estadoPriority(a) - estadoPriority(b)
        || new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());
      this.expedientes.set(exps);

      if (exps.length > 0) {
        this.idSeleccionado.set(this.expId(exps[0]));
        await this.cargarDetalle(this.expId(exps[0]));
      }
    } catch (e: any) {
      console.error('[Dashboard]', e.message);
    } finally {
      this.cargando.set(false);
    }
  }

  async seleccionarExpediente(id: string) {
    if (id === this.idSeleccionado()) return;
    this.idSeleccionado.set(id);
    this.detalleActivo.set(null);
    this.tourUrls.set([]);
    this.videos.set([]);
    this.fotosExp.set([]);
    this.documentosExp.set([]);
    this.documentosVM.set([]);
    this.presentacionesVM.set([]);
    this.contratos.set([]);
    this.eliminando.set(null);
    this.ofertasHistorial.set([]);
    this.calExpandido.set(false);
    await this.cargarDetalle(id);
  }

  async eliminarArchivo(archivo: ArchivoRow): Promise<void> {
    this.eliminando.set(archivo.id);
    try {
      await this.archivoService.eliminar(archivo);
      const id = this.idSeleccionado() ?? this.expedienteActivo()?.id;
      if (!id) return;
      const archivos = await this.archivoService.cargarTodos(id);
      this.videos.set(archivos.videos);
      this.fotosExp.set(archivos.fotos);
      this.documentosExp.set(archivos.documentos);
    } catch (e: any) {
      console.error('[Dashboard delete]', e.message);
    } finally {
      this.eliminando.set(null);
    }
  }

  /**
   * Carga en "Mis documentos" los documentos del expediente de todas las fuentes
   * (expediente, estimación, oferta, contrato, obra) y roles, vía el mismo
   * servicio que usa client/my-documents/list: los de tipo 'documento' y los
   * videos de presentación. Si entretanto se eligió otro expediente, descarta.
   */
  private async cargarDocumentosVM(id: string): Promise<void> {
    const clienteId = this.user()?.id ?? '';
    const numero = this.expedientes().find(e => this.expId(e) === id)?.numero ?? '';
    try {
      const archivos = await this.documentosService.getArchivosDeExpediente(id, numero, clienteId, { presentaciones: true });
      if (this.idSeleccionado() !== id) return;
      this.documentosVM.set(archivos.filter(a => a.tipo === 'documento'));
      this.presentacionesVM.set(archivos.filter(a => a.fuente === 'presentacion'));
    } catch {
      if (this.idSeleccionado() !== id) return;
      this.documentosVM.set([]);
      this.presentacionesVM.set([]);
    }
  }

  /** Borra un documento propio del expediente y recarga la lista. */
  async eliminarDocumento(doc: ArchivoVM): Promise<void> {
    if (!doc.esPropio || !doc.archivoId || this.eliminando() !== null) return;
    this.eliminando.set(doc.id);
    try {
      await this.archivoService.eliminar({
        id:             doc.archivoId,
        nombre_archivo: doc.nombre,
        url_storage:    doc.urlStorage,
        mime_type:      doc.mimeType,
        tamano_bytes:   doc.tamanoBytes,
        subido_por:     doc.subidoPor ?? undefined,
      });
      const id = this.idSeleccionado() ?? this.expedienteActivo()?.id;
      if (id) await this.cargarDocumentosVM(id);
    } catch (e: any) {
      console.error('[Dashboard delete doc]', e.message);
    } finally {
      this.eliminando.set(null);
    }
  }

  private async cargarDetalle(id: string) {
    this.cargandoDetalle.set(true);

    const [detalleResult, vidsResult, contratoResult] = await Promise.allSettled([
      this.expedienteService.getVistaParaCliente(id),
      this.archivoService.cargarTodos(id),
      this.contratoService.getPanelClienteExpediente(id),
    ]);

    if (detalleResult.status === 'fulfilled') {
      this.detalleActivo.set(detalleResult.value);
      this.tourUrls.set(EstimacionService.parseUrls(detalleResult.value.url_tour));
    } else {
      console.error('[Dashboard detalle]', (detalleResult.reason as any)?.message);
    }
    if (vidsResult.status === 'fulfilled') {
      this.videos.set(vidsResult.value.videos);
      this.fotosExp.set(vidsResult.value.fotos);
      this.documentosExp.set(vidsResult.value.documentos);
    } else {
      console.error('[Dashboard videos]', (vidsResult.reason as any)?.message);
      this.videos.set([]);
      this.fotosExp.set([]);
      this.documentosExp.set([]);
    }

    if (contratoResult.status === 'fulfilled') {
      this.contratos.set(contratoResult.value);
    } else {
      console.error('[Dashboard contratos]', (contratoResult.reason as any)?.message);
      this.contratos.set([]);
    }

    // Historial: ofertas del expediente (los contratos ya están en `contratos`)
    try {
      this.ofertasHistorial.set(await this.expedienteService.getOfertasHistorial(id));
    } catch {
      this.ofertasHistorial.set([]);
    }

    // "Mis documentos": carga los documentos del expediente de todas las fuentes
    // (expediente, estimación, oferta, contrato, obra) — igual que my-documents.
    await this.cargarDocumentosVM(id);

    this.calInicializar();
    this.cargandoDetalle.set(false);
  }
}
