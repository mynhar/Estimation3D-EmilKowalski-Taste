import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthSupabaseService } from '../../../services/auth-supabase.service';
import { DbPerfil, RolUsuario, ProveedorAuth } from '../../../types/supabase';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

type FiltroActivo = 'todos' | 'activo' | 'inactivo';

@Component({
  selector: 'app-admin-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet, RouterLink, TranslatePipe,
    MatButtonModule, MatButtonToggleModule, MatFormFieldModule, MatIconModule, MatInputModule, MatTooltipModule,
    PageHeaderComponent, EmptyStateComponent, PaginationComponent,
  ],
  templateUrl: './list.component.html',
  styleUrls: ['../../../shared/ui/lista/lista.css', './list.component.css'],
})
export class AdminUserListComponent implements OnInit {
  private auth      = inject(AuthSupabaseService);
  private translate = inject(TranslateService);
  private route     = inject(ActivatedRoute);
  private router    = inject(Router);

  private _usuarios = signal<DbPerfil[]>([]);
  cargando = signal(true);
  error    = signal<string | null>(null);

  busqueda        = signal('');
  filtroRol       = signal<RolUsuario | 'todos'>('todos');
  filtroProveedor = signal<ProveedorAuth | 'todos'>('todos');
  filtroActivo    = signal<FiltroActivo>('todos');

  readonly roles: Array<RolUsuario | 'todos'>          = ['todos', 'cliente', 'estimador', 'constructor', 'administrador'];
  readonly proveedores: Array<ProveedorAuth | 'todos'> = ['todos', 'email', 'google'];
  readonly estadosActivo: FiltroActivo[]               = ['todos', 'activo', 'inactivo'];

  readonly POR_PAGINA = 15;
  paginaActual = signal(1);

  usuariosFiltrados = computed(() => {
    const q         = this.busqueda().toLowerCase().trim();
    const rol       = this.filtroRol();
    const proveedor = this.filtroProveedor();
    const activo    = this.filtroActivo();

    return this._usuarios().filter(u => {
      if (q && !`${u.nombre} ${u.apellido} ${u.email ?? ''}`.toLowerCase().includes(q)) return false;
      if (rol       !== 'todos' && u.rol       !== rol)       return false;
      if (proveedor !== 'todos' && u.proveedor !== proveedor) return false;
      if (activo === 'activo'   && !u.activo) return false;
      if (activo === 'inactivo' &&  u.activo) return false;
      return true;
    });
  });

  usuariosPaginados = computed(() => {
    const desde = (this.paginaActual() - 1) * this.POR_PAGINA;
    return this.usuariosFiltrados().slice(desde, desde + this.POR_PAGINA);
  });

  hayFiltros = computed(() =>
    this.busqueda() !== '' ||
    this.filtroRol()       !== 'todos' ||
    this.filtroProveedor() !== 'todos' ||
    this.filtroActivo()    !== 'todos'
  );

  get totalUsuarios(): number { return this._usuarios().length; }

  constructor() {
    effect(() => {
      this.busqueda();
      this.filtroRol();
      this.filtroProveedor();
      this.filtroActivo();
      this.paginaActual.set(1);
    });
  }

  async ngOnInit(): Promise<void> {
    const rolParam = this.route.snapshot.queryParamMap.get('rol');
    if (rolParam && (this.roles as string[]).includes(rolParam)) {
      this.filtroRol.set(rolParam as RolUsuario);
    }

    const activoParam = this.route.snapshot.queryParamMap.get('activo');
    if (activoParam && (this.estadosActivo as string[]).includes(activoParam)) {
      this.filtroActivo.set(activoParam as FiltroActivo);
    }

    try {
      const { data, error } = await this.auth.client
        .from('perfil')
        .select('*')
        .order('creado_en', { ascending: false });

      if (error) throw error;
      this._usuarios.set(data ?? []);
    } catch (e: any) {
      this.error.set(e.message ?? this.translate.instant('admin_users.err_load_list'));
    } finally {
      this.cargando.set(false);
    }
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroRol.set('todos');
    this.filtroProveedor.set('todos');
    this.filtroActivo.set('todos');
  }

  setBusqueda(e: Event): void {
    this.busqueda.set((e.target as HTMLInputElement).value);
  }

  avatarFallback(u: DbPerfil): string {
    const n = u.nombre?.[0] ?? '';
    const a = u.apellido?.[0] ?? '';
    return (n + a).toUpperCase() || '?';
  }

  /** Navega a la edición del usuario (fila/tarjeta completa clicable). */
  irAEditar(id: string): void {
    this.router.navigate(['/admin/user/edit', id]);
  }
}
