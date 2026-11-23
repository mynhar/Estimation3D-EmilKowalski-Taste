import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ContratoService } from '../../../services/contrato.service';
import { AuthSupabaseService } from '../../../services/auth-supabase.service';
import { ContratoConstructorListItem, nombreServicio } from '../../../models';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { StatusChipComponent } from '../../../shared/ui/status-chip/status-chip.component';
import {
  direccionLinea1, direccionLinea2, direccionCompleta,
} from '../../../shared/util/busqueda';

type VistaContratos = 'tabla' | 'tarjetas';

/** Lo que el servicio devuelve cuando falta un dato. */
const SIN_DATO = '—';

@Component({
  selector: 'app-construction-monitoring-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, TranslatePipe, PaginationComponent,
    PageHeaderComponent, EmptyStateComponent, StatusChipComponent,
    MatButtonModule, MatButtonToggleModule, MatIconModule, MatTooltipModule,
  ],
  templateUrl: './list.component.html',
  styleUrls: ['../../../shared/construction-monitoring/obras-lista.css', './list.component.css'],
})
export class ConstructionMonitoringListComponent implements OnInit {
  private contratoService = inject(ContratoService);
  private auth            = inject(AuthSupabaseService);
  private translate       = inject(TranslateService);
  private router          = inject(Router);

  private user = toSignal(this.auth.user$);

  private _contratos = signal<ContratoConstructorListItem[]>([]);
  cargando  = signal(true);
  error     = signal<string | null>(null);

  filtroEstado = signal('todos');
  vista        = signal<VistaContratos>('tarjetas');

  /** Ids cuya miniatura 3D falló al cargar → se muestra el marcador de posición. */
  private fotosFallidas = signal<Set<string>>(new Set<string>());

  readonly estados    = ['todos', 'firmado', 'en_ejecucion', 'completado', 'cancelado', 'archivado'];
  readonly POR_PAGINA = 15;
  paginaActual = signal(1);

  contratosFiltrados = computed(() => {
    const estado = this.filtroEstado();
    if (estado === 'todos') return this._contratos();
    return this._contratos().filter(c => c.estado === estado);
  });

  contratosPaginados = computed(() => {
    const desde = (this.paginaActual() - 1) * this.POR_PAGINA;
    return this.contratosFiltrados().slice(desde, desde + this.POR_PAGINA);
  });

  estadoCounts = computed(() => {
    const counts: Record<string, number> = {};
    for (const c of this._contratos()) {
      counts[c.estado] = (counts[c.estado] ?? 0) + 1;
    }
    return counts;
  });

  get total(): number { return this._contratos().length; }

  constructor() {
    effect(() => {
      this.filtroEstado();
      this.paginaActual.set(1);
    });
  }

  async ngOnInit() {
    const userId = this.user()?.id;
    if (!userId) { this.cargando.set(false); return; }
    try {
      const data = await this.contratoService.getContratosConstructor(userId);
      data.sort((a, b) => {
        const da = new Date(a.actualizado_en).getTime();
        const db = new Date(b.actualizado_en).getTime();
        if (da !== db) return db - da;
        const fa = a.firmado_en ? new Date(a.firmado_en).getTime() : 0;
        const fb = b.firmado_en ? new Date(b.firmado_en).getTime() : 0;
        return fb - fa;
      });
      this._contratos.set(data);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.cargando.set(false);
    }
  }

  // ── Dirección (formato postal en dos líneas) ─────────────────────────────
  direccionLinea1   = direccionLinea1;
  direccionLinea2   = direccionLinea2;
  direccionCompleta = direccionCompleta;

  /** Un dato que el servicio no pudo dar llega como «—». */
  hay(valor: string | null | undefined): boolean {
    return !!valor && valor.trim() !== '' && valor !== SIN_DATO;
  }

  /**
   * Todos los servicios del contrato en el idioma activo. Si no se pudieron
   * leer, el principal del expediente, como antes.
   */
  serviciosTexto(c: ContratoConstructorListItem): string {
    const lang = this.translate.currentLang;
    if (c.servicios?.length) {
      return c.servicios.map(s => nombreServicio(s, lang)).join(', ');
    }
    if (lang === 'en') return c.servicio_nombre_en || c.servicio_nombre;
    if (lang === 'fr') return c.servicio_nombre_fr || c.servicio_nombre;
    return c.servicio_nombre;
  }

  formatFecha(valor: string | null): string {
    if (!valor) return SIN_DATO;
    const raw = valor.includes('T') ? valor.split('T')[0] : valor;
    const d   = new Date(`${raw}T00:00:00`);
    if (isNaN(d.getTime())) return SIN_DATO;
    const localeMap: Record<string, string> = { es: 'es-CA', en: 'en-US', fr: 'fr-CA' };
    const locale = localeMap[this.translate.currentLang] ?? 'fr-CA';
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  }

  formatPrecio(precio: number | null): string {
    if (precio == null) return SIN_DATO;
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency', currency: 'CAD', maximumFractionDigits: 0,
    }).format(precio);
  }

  setVista(v: VistaContratos): void {
    this.vista.set(v);
  }

  /**
   * Miniatura del expediente extraída del tour 3D Matterport.
   * Null si el expediente no tiene tour o si la imagen ya falló al cargar.
   */
  fotoContrato(c: ContratoConstructorListItem): string | null {
    return this.fotosFallidas().has(c.id) ? null : c.foto;
  }

  onFotoError(id: string): void {
    this.fotosFallidas.update(set => new Set(set).add(id));
  }

  irAMonitoreo(id: string): void {
    this.router.navigate(['/builder/construction-monitoring/monitoring', id]);
  }

  /** «1–5» semanas; la unidad la pone la plantilla con `offer.weeks`. */
  plazo(c: ContratoConstructorListItem): string {
    if (c.plazo_semanas_min == null && c.plazo_semanas_max == null) return '';
    if (c.plazo_semanas_min === c.plazo_semanas_max) return `${c.plazo_semanas_min}`;
    return `${c.plazo_semanas_min ?? '?'}–${c.plazo_semanas_max ?? '?'}`;
  }
}
