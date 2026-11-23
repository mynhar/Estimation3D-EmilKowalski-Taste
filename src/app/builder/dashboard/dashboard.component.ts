import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthSupabaseService } from '../../services/auth-supabase.service';
import { OfertaService } from '../../services/oferta.service';
import { ContratoService } from '../../services/contrato.service';
import { SeguimientoService } from '../../services/seguimiento.service';
import { OfertaDashboard } from '../../models';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip.component';

/** Ofertas que se muestran en el tablero; el resto, en «Mes offres». */
const OFERTAS_EN_TABLERO = 5;

/** El servicio rellena con «—» lo que el constructor ya no puede ver (dossier archivado). */
const SIN_DATO = '—';

// Resumen de una obra (contrato activo) para el seguimiento del dashboard.
interface ObraResumen {
  contratoId:       string;
  expedienteNumero: string;
  servicioNombre:   string;
  servicioNombreEn: string;
  servicioNombreFr: string;
  estado:           string;
  avance:           number;
  actualizadoEn:    string;
}

@Component({
  selector: 'app-builder-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, TranslatePipe, MatButtonModule, MatIconModule,
    PageHeaderComponent, EmptyStateComponent, StatusChipComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class BuilderDashboardComponent implements OnInit {
  private auth               = inject(AuthSupabaseService);
  private ofertaService      = inject(OfertaService);
  private contratoService    = inject(ContratoService);
  private seguimientoService = inject(SeguimientoService);
  private translate          = inject(TranslateService);

  user     = toSignal(this.auth.user$);
  perfil   = signal<{ nombre: string | null; apellido: string | null } | null>(null);
  ofertas  = signal<OfertaDashboard[]>([]);
  obras    = signal<ObraResumen[]>([]);
  cargando = signal(true);

  readonly SIN_DATO = SIN_DATO;

  // ── Ofertas ────────────────────────────────────────────────────────────────
  total      = computed(() => this.ofertas().length);
  pendientes = computed(() => this.ofertas().filter(o => o.estado === 'pendiente').length);
  aceptadas  = computed(() => this.ofertas().filter(o => o.estado === 'aceptada').length);
  rechazadas = computed(() => this.ofertas().filter(o => o.estado === 'rechazada').length);

  /** Las más recientes (el servicio ya las ordena por fecha de creación). */
  ofertasRecientes = computed(() => this.ofertas().slice(0, OFERTAS_EN_TABLERO));

  montoAdjudicado = computed(() =>
    this.ofertas().filter(o => o.estado === 'aceptada').reduce((s, o) => s + o.precio, 0)
  );

  tasaExito = computed(() => {
    const t = this.total();
    return t === 0 ? 0 : Math.round((this.aceptadas() / t) * 100);
  });

  // ── Obras ──────────────────────────────────────────────────────────────────
  obrasActivas = computed(() => this.obras().filter(o => o.estado === 'en_ejecucion').length);
  avanceMedio  = computed(() => {
    const o = this.obras();
    return o.length === 0 ? 0 : Math.round(o.reduce((s, x) => s + x.avance, 0) / o.length);
  });

  nombre = computed(() => {
    const p = this.perfil();
    if (p?.nombre) return [p.nombre, p.apellido].filter(Boolean).join(' ');
    const u = this.user();
    return u?.user_metadata?.['full_name'] ?? u?.email?.split('@')[0] ?? '';
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  servicioNombre(oferta: OfertaDashboard): string {
    const lang = this.translate.currentLang;
    if (lang === 'en') return oferta.servicio_nombre_en || oferta.servicio_nombre;
    if (lang === 'fr') return oferta.servicio_nombre_fr || oferta.servicio_nombre;
    return oferta.servicio_nombre;
  }

  servicioObra(o: ObraResumen): string {
    const lang = this.translate.currentLang;
    if (lang === 'en') return o.servicioNombreEn || o.servicioNombre;
    if (lang === 'fr') return o.servicioNombreFr || o.servicioNombre;
    return o.servicioNombre;
  }

  /** Dossier oculto para el constructor (archivado): sin número ni servicio. */
  sinDossier(oferta: OfertaDashboard): boolean {
    return oferta.expediente_numero === SIN_DATO && oferta.servicio_nombre === SIN_DATO;
  }

  plazo(oferta: OfertaDashboard): string {
    const { plazo_semanas_min: min, plazo_semanas_max: max } = oferta;
    if (min && max && min !== max) return `${min}–${max}`;
    return String(min || max || '');
  }

  formatPrecio(v: number): string {
    return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v);
  }

  private get locale(): string {
    const localeMap: Record<string, string> = { es: 'es-CA', en: 'en-US', fr: 'fr-CA' };
    return localeMap[this.translate.currentLang] ?? 'fr-CA';
  }

  formatFecha(valor: string): string {
    if (!valor) return SIN_DATO;
    const d = new Date(valor.includes('T') ? valor : `${valor}T00:00:00`);
    if (isNaN(d.getTime())) return SIN_DATO;
    return new Intl.DateTimeFormat(this.locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  }

  /** Fecha y hora de la última actualización de una obra: «11 nov., 17 h 06». */
  formatActualizacion(valor: string): string {
    const d = new Date(valor);
    if (!valor || isNaN(d.getTime())) return SIN_DATO;
    return new Intl.DateTimeFormat(this.locale, {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    }).format(d);
  }

  // ── Ciclo de vida ──────────────────────────────────────────────────────────
  async ngOnInit() {
    const userId = this.user()?.id;
    if (!userId) { this.cargando.set(false); return; }
    try {
      const [perfilRes, ofertas, contratos] = await Promise.all([
        this.auth.client.from('perfil').select('nombre, apellido').eq('id', userId).single(),
        this.ofertaService.getMisOfertasDashboard(userId),
        this.contratoService.getContratosConstructor(userId),
      ]);

      if (perfilRes.data) this.perfil.set(perfilRes.data);
      this.ofertas.set(ofertas);

      // Obras en curso (contratos firmados / en ejecución) con su avance.
      const activos = contratos.filter(c => c.estado === 'firmado' || c.estado === 'en_ejecucion');
      const obras = await Promise.all(activos.map(async c => {
        const seg = await this.seguimientoService.getSeguimientoByContratoId(c.id);
        return {
          contratoId:       c.id,
          expedienteNumero: c.expediente_numero,
          servicioNombre:   c.servicio_nombre,
          servicioNombreEn: c.servicio_nombre_en,
          servicioNombreFr: c.servicio_nombre_fr,
          estado:           c.estado,
          avance:           Math.round(seg?.porcentaje_avance ?? 0),
          actualizadoEn:    seg?.actualizado_en ?? c.actualizado_en,
        } as ObraResumen;
      }));
      obras.sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn));
      this.obras.set(obras);
    } catch (e: unknown) {
      console.error('[BuilderDashboard]', e instanceof Error ? e.message : String(e));
    } finally {
      this.cargando.set(false);
    }
  }
}
