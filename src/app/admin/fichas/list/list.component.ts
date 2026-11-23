import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FichaNormativaRepository, FichaNormativa } from '../../../data';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

type FiltroActivo = 'todos' | 'activo' | 'inactivo';

@Component({
  selector: 'app-admin-fichas-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet, RouterLink, TranslatePipe,
    MatButtonModule, MatButtonToggleModule, MatFormFieldModule, MatIconModule, MatInputModule, MatTooltipModule,
    PageHeaderComponent, EmptyStateComponent, PaginationComponent,
  ],
  templateUrl: './list.component.html',
  styleUrls: ['../../../shared/ui/lista/lista.css', '../../_shared/catalogo-lista.css'],
})
export class AdminFichasListComponent implements OnInit {
  private repo      = inject(FichaNormativaRepository);
  private translate = inject(TranslateService);
  private router    = inject(Router);

  private _fichas = signal<FichaNormativa[]>([]);
  cargando = signal(true);
  error    = signal<string | null>(null);

  busqueda     = signal('');
  filtroActivo = signal<FiltroActivo>('todos');
  readonly estadosActivo: FiltroActivo[] = ['todos', 'activo', 'inactivo'];

  readonly POR_PAGINA = 10;
  paginaActual = signal(1);

  fichasFiltradas = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const a = this.filtroActivo();
    return this._fichas().filter(f => {
      if (a === 'activo'   && !f.activo) return false;
      if (a === 'inactivo' &&  f.activo) return false;
      if (q) {
        const t = this.titulo(f).toLowerCase();
        const r = this.resumen(f).toLowerCase();
        if (!t.includes(q) && !r.includes(q) && !f.codigo.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  });

  fichasPaginadas = computed(() => {
    const desde = (this.paginaActual() - 1) * this.POR_PAGINA;
    return this.fichasFiltradas().slice(desde, desde + this.POR_PAGINA);
  });

  hayFiltros = computed(() => this.busqueda() !== '' || this.filtroActivo() !== 'todos');
  get total(): number { return this._fichas().length; }

  constructor() {
    effect(() => {
      this.busqueda();
      this.filtroActivo();
      this.paginaActual.set(1);
    });
  }

  async ngOnInit() {
    try {
      this._fichas.set(await this.repo.findAll());
    } catch (e: any) {
      this.error.set(e?.message ?? this.translate.instant('admin_fichas.err_load'));
    } finally {
      this.cargando.set(false);
    }
  }

  limpiarFiltros() { this.busqueda.set(''); this.filtroActivo.set('todos'); }
  setBusqueda(e: Event) { this.busqueda.set((e.target as HTMLInputElement).value); }

  private lang(): string { return (this.translate.currentLang || 'fr').slice(0, 2); }
  titulo(f: FichaNormativa): string {
    const l = this.lang();
    return l === 'en' ? f.titulo_en : l === 'es' ? f.titulo_es : f.titulo_fr;
  }
  resumen(f: FichaNormativa): string {
    const l = this.lang();
    return l === 'en' ? f.resumen_en : l === 'es' ? f.resumen_es : f.resumen_fr;
  }

  irAEditar(id: number) { this.router.navigate(['/admin/ficha/edit', id]); }
}
