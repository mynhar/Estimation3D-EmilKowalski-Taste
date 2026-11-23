import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthSupabaseService } from '../../services/auth-supabase.service';
import { ExpedienteService } from '../../services/expediente.service';
import { EstimacionService } from '../../services/estimacion.service';
import { SeguimientoService } from '../../services/seguimiento.service';
import { ExpedienteRow, ESTADOS_ESTIMADO } from '../../models';
import { EstadoExpediente } from '../../types/supabase';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip.component';
import { StageLineComponent } from '../../shared/ui/stage-line/stage-line.component';

// Recorrido de un dossier tras la estimación (las etapas de la línea de cota).
const PIPELINE_STEPS: string[] = [
  'en_estimacion', 'estimado', 'en_oferta', 'adjudicado', 'contratado',
];

type VistaPipeline = 'tabla' | 'tarjetas';

// Resumen de una obra (expediente contratado en construcción).
interface ObraResumen {
  expedienteId:     string;
  numero:           string;
  servicioNombre:   string;
  servicioNombreEn: string;
  servicioNombreFr: string;
  clienteNombre:    string;
  estado:           string;   // estado del seguimiento_obra
  avance:           number;
  actualizadoEn:    string;
}

@Component({
  selector: 'app-estimator-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, TranslatePipe, MatButtonModule, MatButtonToggleModule, MatIconModule, MatTooltipModule,
    PageHeaderComponent, EmptyStateComponent, StatusChipComponent, StageLineComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class EstimatorDashboardComponent implements OnInit {
  private auth               = inject(AuthSupabaseService);
  private expedienteService  = inject(ExpedienteService);
  private estimacionService  = inject(EstimacionService);
  private seguimientoService = inject(SeguimientoService);
  private translate          = inject(TranslateService);
  private router             = inject(Router);

  user        = toSignal(this.auth.user$);
  perfil      = signal<{ nombre: string | null; apellido: string | null } | null>(null);
  expedientes = signal<ExpedienteRow[]>([]);
  obras       = signal<ObraResumen[]>([]);
  disponibles = signal(0);
  montoTotal  = signal(0);
  cargando    = signal(true);

  /** Vista del seguimiento post-estimación (tabla por defecto; móvil siempre tarjetas). */
  vista = signal<VistaPipeline>('tabla');

  /** Ids cuya miniatura 3D falló al cargar → se muestra el marcador de posición. */
  private fotosFallidas = signal<Set<string>>(new Set<string>());

  // ── Computed: grupos ──────────────────────────────────────────────────────
  activos = computed(() =>
    this.expedientes().filter(e => e.estado === 'en_estimacion')
  );

  postEstimacion = computed(() =>
    this.expedientes().filter(e => e.estado != null && ESTADOS_ESTIMADO.includes(e.estado as EstadoExpediente))
  );

  enMercado = computed(() =>
    this.expedientes().filter(e =>
      ['en_oferta', 'adjudicado'].includes(e.estado ?? '')
    )
  );

  contratados = computed(() =>
    this.expedientes().filter(e => e.estado === 'contratado')
  );

  totalCompletados = computed(() =>
    this.expedientes().filter(e =>
      e.estado !== 'en_estimacion' && e.estado !== 'cancelado'
    ).length
  );

  tasaExito = computed(() => {
    const base = this.expedientes().filter(e =>
      e.estado !== 'en_estimacion' && e.estado !== 'cancelado'
    ).length;
    if (base === 0) return 0;
    return Math.round(this.contratados().length / base * 100);
  });

  // ── Computed: obra ─────────────────────────────────────────────────────────
  obrasEnCurso = computed(() => this.obras().filter(o => o.estado !== 'completado').length);
  avanceMedio  = computed(() => {
    const o = this.obras();
    return o.length === 0 ? 0 : Math.round(o.reduce((s, x) => s + x.avance, 0) / o.length);
  });

  // ── Línea de etapas ────────────────────────────────────────────────────
  readonly etapas = PIPELINE_STEPS.map(e => 'state.' + e);

  /** Etapa del recorrido (1-based); 0 si el dossier salió de él (cancelado, archivado). */
  paso(estado: string | null | undefined): number {
    return PIPELINE_STEPS.indexOf(estado ?? '') + 1;
  }

  /** La siguiente etapa del estimador es terminar la estimación más antigua en curso. */
  primeraActiva = computed(() => this.activos()[0]?.id ?? null);

  // ── Ciclo de vida ─────────────────────────────────────────────────────────
  async ngOnInit() {
    const userId = this.user()?.id;
    if (!userId) { this.cargando.set(false); return; }

    try {
      const { data: perfilData } = await this.auth.client
        .from('perfil')
        .select('nombre, apellido')
        .eq('id', userId)
        .single();
      if (perfilData) this.perfil.set(perfilData);

      const [allMine, nuevos, montoTotal] = await Promise.all([
        this.expedienteService.getExpedienteRows({
          estados:     (['en_estimacion', ...ESTADOS_ESTIMADO] as EstadoExpediente[]),
          estimadorId: userId,
        }),
        this.expedienteService.getExpedienteRows({ estado: 'nuevo' }),
        this.estimacionService.getMontoTotalPorEstimador(userId),
      ]);

      this.expedientes.set(allMine);
      this.disponibles.set(nuevos.length);
      this.montoTotal.set(montoTotal);

      // Seguimiento de obra: avance de los expedientes contratados en construcción.
      const contratadosIds = allMine.filter(e => e.estado === 'contratado').map(e => e.id);
      if (contratadosIds.length) {
        const resumen = await this.seguimientoService.getResumenByExpedienteIds(contratadosIds);
        const porExp  = new Map(resumen.map(r => [r.expediente_id, r]));
        const obras: ObraResumen[] = [];
        for (const e of allMine) {
          const seg = porExp.get(e.id);
          if (!seg) continue;
          obras.push({
            expedienteId:     e.id,
            numero:           e.numero,
            servicioNombre:   e.servicio_nombre,
            servicioNombreEn: e.servicio_nombre_en,
            servicioNombreFr: e.servicio_nombre_fr,
            clienteNombre:    e.cliente_nombre,
            estado:           seg.estado,
            avance:           seg.estado === 'completado' ? 100 : Math.round(seg.porcentaje_avance),
            actualizadoEn:    seg.actualizado_en,
          });
        }
        obras.sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn));
        this.obras.set(obras);
      }
    } catch (e: unknown) {
      console.error('[EstimatorDashboard]', e instanceof Error ? e.message : String(e));
    } finally {
      this.cargando.set(false);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  setVista(v: VistaPipeline): void {
    this.vista.set(v);
  }

  /**
   * Miniatura del expediente extraída del tour 3D Matterport.
   * Null si el expediente no tiene tour o si la imagen ya falló al cargar.
   */
  fotoExpediente(exp: ExpedienteRow): string | null {
    return this.fotosFallidas().has(exp.id) ? null : exp.foto;
  }

  onFotoError(id: string): void {
    this.fotosFallidas.update(set => new Set(set).add(id));
  }

  urgencia(fechaVisita: string): 'vencida' | 'hoy' | 'proxima' | null {
    if (!fechaVisita) return null;
    const d    = new Date(`${fechaVisita}T00:00:00`);
    const hoy  = new Date(); hoy.setHours(0, 0, 0, 0);
    const diff = d.getTime() - hoy.getTime();
    if (diff < 0)                        return 'vencida';
    if (diff === 0)                      return 'hoy';
    if (diff <= 2 * 24 * 60 * 60 * 1000) return 'proxima';
    return null;
  }

  formatPrecio(v: number): string {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency', currency: 'CAD', maximumFractionDigits: 0,
    }).format(v);
  }

  formatFecha(valor: string): string {
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

  get bienvenida(): string {
    const p = this.perfil();
    if (p?.nombre) {
      return [p.nombre, p.apellido].filter(Boolean).join(' ');
    }
    const u = this.user();
    return u?.user_metadata?.['full_name'] ?? u?.email?.split('@')[0] ?? '';
  }

  servicioNombre(exp: ExpedienteRow): string {
    const lang = this.translate.currentLang;
    if (lang === 'en') return exp.servicio_nombre_en || exp.servicio_nombre;
    if (lang === 'fr') return exp.servicio_nombre_fr || exp.servicio_nombre;
    return exp.servicio_nombre;
  }

  servicioObra(o: ObraResumen): string {
    const lang = this.translate.currentLang;
    if (lang === 'en') return o.servicioNombreEn || o.servicioNombre;
    if (lang === 'fr') return o.servicioNombreFr || o.servicioNombre;
    return o.servicioNombre;
  }

  irAVer(id: string) { this.router.navigate(['/estimator/estimated-file', id]); }
}
