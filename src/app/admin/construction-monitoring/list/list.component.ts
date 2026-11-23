import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ContratoService } from '../../../services/contrato.service';
import { ContratoConstructorListItem, nombreServicio } from '../../../models';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { StatusChipComponent } from '../../../shared/ui/status-chip/status-chip.component';
import {
  coincideBusqueda, direccionLinea1, direccionLinea2, direccionCompleta,
} from '../../../shared/util/busqueda';

type VistaContratos = 'tabla' | 'tarjetas';

const SIN_DATO = '—';

@Component({
  selector: 'app-admin-construction-monitoring-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, TranslatePipe, PaginationComponent,
    PageHeaderComponent, EmptyStateComponent, StatusChipComponent,
    MatButtonModule, MatButtonToggleModule, MatFormFieldModule, MatIconModule, MatInputModule, MatTooltipModule,
  ],
  templateUrl: './list.component.html',
  styleUrls: ['../../../shared/construction-monitoring/obras-lista.css', './list.component.css'],
})
export class AdminConstructionMonitoringListComponent implements OnInit {
  private contratoService = inject(ContratoService);
  private translate       = inject(TranslateService);
  private router          = inject(Router);
  private route           = inject(ActivatedRoute);

  private _contratos = signal<ContratoConstructorListItem[]>([]);
  cargando  = signal(true);
  error     = signal<string | null>(null);

  busqueda     = signal('');
  filtroEstado = signal('todos');
  vista        = signal<VistaContratos>('tarjetas');   // por defecto: tarjetas

  /** Ids cuya miniatura 3D falló al cargar → se muestra el marcador de posición. */
  private fotosFallidas = signal<Set<string>>(new Set<string>());

  readonly estados    = ['todos', 'firmado', 'en_ejecucion', 'completado', 'cancelado'];
  readonly POR_PAGINA = 15;
  paginaActual = signal(1);

  contratosFiltrados = computed(() => {
    const q      = this.busqueda().trim();
    const estado = this.filtroEstado();

    return this._contratos().filter(c => {
      if (estado !== 'todos' && c.estado !== estado) return false;
      if (q) {
        const haystack = [
          c.expediente_numero,
          c.cliente_nombre,
          this.serviciosTexto(c),
          c.constructor_nombre,
          c.constructor_email,
          c.constructor_telefono,
          c.estado,
          // Dirección: en Canadá `direccion` lleva unidad + nº y calle,
          // `canton` la ciudad y `distrito` el código postal.
          c.direccion,
          c.canton,
          c.provincia,
          c.distrito,
        ].join(' ');
        if (!coincideBusqueda(haystack, q)) return false;
      }
      return true;
    });
  });

  hayFiltros = computed(() =>
    this.busqueda() !== '' || this.filtroEstado() !== 'todos'
  );

  // ── Dirección (formato postal en dos líneas) ─────────────────────────────
  direccionLinea1   = direccionLinea1;
  direccionLinea2   = direccionLinea2;
  direccionCompleta = direccionCompleta;

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
      this.busqueda();
      this.filtroEstado();
      this.paginaActual.set(1);
    });
  }

  setBusqueda(e: Event) {
    this.busqueda.set((e.target as HTMLInputElement).value);
  }

  limpiarFiltros() {
    this.busqueda.set('');
    this.filtroEstado.set('todos');
  }

  async ngOnInit() {
    const estadoParam = this.route.snapshot.queryParamMap.get('estado');
    if (estadoParam && this.estados.includes(estadoParam)) {
      this.filtroEstado.set(estadoParam);
    }
    try {
      const data = await this.contratoService.getContratosMonitoringAdmin();
      // actualizado_en DESC, y a igualdad, firmado_en DESC.
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

  /**
   * Todos los servicios del contrato (los de su oferta) en el idioma activo.
   * Si no se pudieron leer, el principal del expediente, como antes.
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

  /** El dato existe y no es el «—» de relleno de la vista. */
  hay(valor: string | null | undefined): boolean {
    return !!valor && valor.trim() !== '' && valor !== SIN_DATO;
  }

  formatFecha(valor: string | null): string {
    if (!valor) return '—';
    const raw = valor.includes('T') ? valor.split('T')[0] : valor;
    const d   = new Date(`${raw}T00:00:00`);
    if (isNaN(d.getTime())) return '—';
    const localeMap: Record<string, string> = { es: 'es-CA', en: 'en-US', fr: 'fr-CA' };
    const locale = localeMap[this.translate.currentLang] ?? 'fr-CA';
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  }

  formatPrecio(precio: number | null): string {
    if (precio == null) return '—';
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

  // Abre el seguimiento del contrato seleccionado.
  irAMonitoreo(id: string): void {
    this.router.navigate(['/admin/construction-monitoring/monitoring', id]);
  }

  /** Plazo en semanas («4» o «4–6»); vacío si no se fijó. La unidad la pone la plantilla. */
  plazo(c: ContratoConstructorListItem): string {
    if (c.plazo_semanas_min == null && c.plazo_semanas_max == null) return '';
    if (c.plazo_semanas_min === c.plazo_semanas_max) return `${c.plazo_semanas_min}`;
    return `${c.plazo_semanas_min ?? '?'}–${c.plazo_semanas_max ?? '?'}`;
  }
}
