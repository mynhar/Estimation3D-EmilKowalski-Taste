import {
  ChangeDetectionStrategy, Component, computed, HostListener, inject, signal, TemplateRef, viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { MatBottomSheet, MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { AuthSupabaseService } from './services/auth-supabase.service';
import { RealtimeNotificationsService } from './services/realtime-notifications.service';
import { LangService } from './services/lang.service';
import { ToastComponent } from './components/toast/toast.component';
import { LangToggleComponent } from './components/lang-toggle/lang-toggle.component';
import { AppFooterComponent } from './components/app-footer/app-footer.component';
import { ClaudeIconComponent } from './shared/ui/claude-icon/claude-icon.component';

/** Entrada de navegación. `ia` pinta el icono propio del asistente en vez de un Material Symbol. */
interface NavItem {
  ruta: string;
  etiqueta: string;
  matIcon?: string;
  ia?: boolean;
  exacto?: boolean;
}

interface NavSeccion {
  titulo: string;
  items: NavItem[];
}

// ── Navegación por rol ──────────────────────────────────────────────────────

const NAV_CLIENTE: NavSeccion[] = [
  { titulo: 'nav.section_principal', items: [
    { ruta: '/client/dashboard', etiqueta: 'nav.dashboard', matIcon: 'home', exacto: true },
  ] },
  { titulo: 'nav.section_dossiers', items: [
    { ruta: '/client/file/create', etiqueta: 'nav.nouveau_dossier', matIcon: 'create_new_folder' },
    { ruta: '/client/file/my-files', etiqueta: 'nav.mes_dossiers', matIcon: 'folder' },
    { ruta: '/client/offers-received', etiqueta: 'nav.offres_recues', matIcon: 'request_quote' },
    { ruta: '/client/contracts', etiqueta: 'nav.contrats', matIcon: 'contract' },
    { ruta: '/client/construction-monitoring/list', etiqueta: 'nav.suivi_chantier', matIcon: 'construction' },
    { ruta: '/client/my-documents/list', etiqueta: 'nav.mes_documents', matIcon: 'description' },
    { ruta: '/client/history', etiqueta: 'nav.historique', matIcon: 'history' },
  ] },
  { titulo: 'nav.section_assistant', items: [
    { ruta: '/client/ai-assistant', etiqueta: 'nav.assistant_ia', ia: true },
  ] },
];

const NAV_CONSTRUCTOR: NavSeccion[] = [
  { titulo: 'nav.section_principal', items: [
    { ruta: '/builder/dashboard', etiqueta: 'nav.dashboard', matIcon: 'home', exacto: true },
  ] },
  { titulo: 'nav.section_travaux', items: [
    { ruta: '/builder/available-files', etiqueta: 'nav.dossiers_disponibles', matIcon: 'search' },
    { ruta: '/builder/my-offers', etiqueta: 'nav.mes_offres', matIcon: 'request_quote' },
    { ruta: '/builder/construction-monitoring/list', etiqueta: 'nav.suivi_chantier', matIcon: 'construction' },
  ] },
  { titulo: 'nav.section_assistant', items: [
    { ruta: '/builder/ai-assistant', etiqueta: 'nav.assistant_ia', ia: true },
  ] },
];

const NAV_ESTIMADOR: NavSeccion[] = [
  { titulo: 'nav.section_principal', items: [
    { ruta: '/estimator/dashboard', etiqueta: 'nav.dashboard', matIcon: 'home', exacto: true },
  ] },
  { titulo: 'nav.section_dossiers', items: [
    { ruta: '/estimator/client/list', etiqueta: 'nav.clientes_constructores', matIcon: 'group' },
    { ruta: '/estimator/file/list', etiqueta: 'nav.dossiers', matIcon: 'folder_open' },
    { ruta: '/estimator/files-to-be-estimated', etiqueta: 'nav.a_estimer', matIcon: 'inbox' },
    { ruta: '/estimator/files-under-estimation', etiqueta: 'nav.en_estimation', matIcon: 'edit_note' },
    { ruta: '/estimator/estimated-files', etiqueta: 'nav.completes', matIcon: 'task_alt' },
    { ruta: '/estimator/construction-monitoring/list', etiqueta: 'nav.suivi_chantier', matIcon: 'construction' },
  ] },
  { titulo: 'nav.section_assistant', items: [
    { ruta: '/estimator/ai-assistant', etiqueta: 'nav.assistant_ia', ia: true },
  ] },
];

const NAV_ADMIN: NavSeccion[] = [
  { titulo: 'nav.section_principal', items: [
    { ruta: '/admin/dashboard', etiqueta: 'nav.dashboard', matIcon: 'home', exacto: true },
  ] },
  { titulo: 'nav.section_gestion', items: [
    { ruta: '/admin/file', etiqueta: 'nav.dossiers', matIcon: 'folder_open' },
    { ruta: '/admin/to-estimate', etiqueta: 'nav.estimaciones', matIcon: 'fact_check' },
    { ruta: '/admin/offer', etiqueta: 'nav.offres', matIcon: 'request_quote' },
    { ruta: '/admin/contract', etiqueta: 'nav.contrats', matIcon: 'contract' },
    { ruta: '/admin/construction-monitoring/list', etiqueta: 'nav.suivi_chantier', matIcon: 'construction' },
    { ruta: '/admin/archived', etiqueta: 'nav.archivados', matIcon: 'archive' },
  ] },
  { titulo: 'nav.section_config', items: [
    { ruta: '/admin/service-type', etiqueta: 'nav.types_service', matIcon: 'category' },
    { ruta: '/admin/user', etiqueta: 'nav.utilisateurs', matIcon: 'group' },
    { ruta: '/admin/imprevisto', etiqueta: 'nav.imprevistos', matIcon: 'report' },
    { ruta: '/admin/ficha', etiqueta: 'nav.fiches_normatives', matIcon: 'menu_book' },
  ] },
  { titulo: 'nav.section_assistant', items: [
    { ruta: '/admin/ai-assistant', etiqueta: 'nav.assistant_ia', ia: true },
    { ruta: '/admin/ai-events', etiqueta: 'nav.evenements_ia', matIcon: 'flag' },
  ] },
];

/**
 * Pestañas inferiores del cliente en móvil: las tres tareas frecuentes y «Plus».
 * «Plus» abre una hoja con el resto de la navegación del cliente.
 */
const TABS_CLIENTE: NavItem[] = [
  { ruta: '/client/dashboard', etiqueta: 'nav.inicio', matIcon: 'home', exacto: true },
  { ruta: '/client/file/my-files', etiqueta: 'nav.mes_dossiers', matIcon: 'folder' },
  { ruta: '/client/offers-received', etiqueta: 'nav.offres_recues', matIcon: 'request_quote' },
];

/** Lo que va en la hoja «Plus»: la navegación del cliente que no está en las pestañas. */
const PLUS_CLIENTE: NavItem[] = [
  { ruta: '/client/file/create', etiqueta: 'nav.nouveau_dossier', matIcon: 'create_new_folder' },
  { ruta: '/client/contracts', etiqueta: 'nav.contrats', matIcon: 'contract' },
  { ruta: '/client/construction-monitoring/list', etiqueta: 'nav.suivi_chantier', matIcon: 'construction' },
  { ruta: '/client/my-documents/list', etiqueta: 'nav.mes_documents', matIcon: 'description' },
  { ruta: '/client/history', etiqueta: 'nav.historique', matIcon: 'history' },
  { ruta: '/client/ai-assistant', etiqueta: 'nav.assistant_ia', ia: true },
  { ruta: '/client/perfil', etiqueta: 'nav.mon_profil', matIcon: 'account_circle' },
];

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe,
    MatBottomSheetModule, MatButtonModule, MatIconModule, MatListModule, MatMenuModule,
    ToastComponent, LangToggleComponent, AppFooterComponent, ClaudeIconComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private authService            = inject(AuthSupabaseService);
  private realtimeNotifications  = inject(RealtimeNotificationsService);
  private router                 = inject(Router);
  private bottomSheet            = inject(MatBottomSheet);
  protected langSvc              = inject(LangService);

  user      = toSignal(this.authService.user$);
  rolPerfil = toSignal(this.authService.rol$);

  // true mientras el usuario existe pero el rol aún no llegó del servidor
  cargandoPerfil = computed(() => !!this.user() && this.rolPerfil() === undefined);

  nombrePerfil = signal<string | null>(null);
  avatarPerfil = signal<string | null>(null);

  esCliente       = computed(() => !this.cargandoPerfil() && this.rolPerfil() === 'cliente');
  esEstimador     = computed(() => !this.cargandoPerfil() && this.rolPerfil() === 'estimador');
  esConstructor   = computed(() => !this.cargandoPerfil() && this.rolPerfil() === 'constructor');
  esAdministrador = computed(() => !this.cargandoPerfil() && this.rolPerfil() === 'administrador');

  rolLabel = computed(() => 'role.' + (this.rolPerfil() ?? 'cliente'));

  /** Navegación lateral del rol actual. */
  secciones = computed((): NavSeccion[] => {
    if (this.esCliente()) return NAV_CLIENTE;
    if (this.esConstructor()) return NAV_CONSTRUCTOR;
    if (this.esEstimador()) return NAV_ESTIMADOR;
    if (this.esAdministrador()) return NAV_ADMIN;
    return [];
  });

  readonly tabsCliente = TABS_CLIENTE;
  readonly plusCliente = PLUS_CLIENTE;

  /** Iniciales para el avatar cuando no hay foto. */
  iniciales = computed(() => {
    const base = this.nombrePerfil() || this.user()?.email || '';
    const partes = base.split(/[\s@._-]+/).filter(Boolean);
    return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase() || '·';
  });

  // ── Sitio público ─────────────────────────────────────────────────────────
  /**
   * true en las rutas marcadas con `data: { publicSite: true }` (Le Journal,
   * Entrepreneurs). Esas páginas traen su propia cabecera y su propio pie, y
   * deben verse igual con sesión o sin ella.
   */
  private sitioPublico = signal(false);

  /** El armazón de la app sólo se monta con sesión y fuera del sitio público. */
  mostrarArmazon = computed(() => !!this.user() && !this.sitioPublico());

  /** URL actual, para marcar «Plus» cuando la pantalla vive dentro de la hoja. */
  private url = signal(this.router.url);
  plusActivo = computed(() => {
    const url = this.url();
    return this.plusCliente.some(i => url.startsWith(i.ruta));
  });

  // ── Estado de la navegación ───────────────────────────────────────────────
  collapsed  = signal(leerColapsado());
  mobileOpen = signal(false);

  private plusSheet = viewChild<TemplateRef<unknown>>('plusSheet');
  private plusRef: MatBottomSheetRef<unknown> | null = null;
  plusAbierto = signal(false);

  constructor() {
    // El flag viaja en la ruta hoja: se baja hasta la más profunda porque las
    // rutas con hijos dejan `data` vacío en los niveles superiores.
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(e => {
        let ruta = this.router.routerState.root;
        while (ruta.firstChild) ruta = ruta.firstChild;
        this.sitioPublico.set(ruta.snapshot.data['publicSite'] === true);
        this.url.set(e.urlAfterRedirects);
        this.mobileOpen.set(false);
        this.cerrarPlus();
      });

    // Iniciar/detener notificaciones según rol resuelto
    this.authService.rol$.pipe(takeUntilDestroyed()).subscribe(rol => {
      if (rol) {
        const userId = this.user()?.id;
        if (userId) this.realtimeNotifications.iniciar(userId, rol);
      } else if (rol === null) {
        this.realtimeNotifications.detener();
        this.mobileOpen.set(false);
        this.cerrarPlus();
      }
    });

    // Actualizar display de nombre y avatar desde el caché de perfil
    this.authService.perfilCache$.pipe(takeUntilDestroyed()).subscribe(perfil => {
      if (perfil) {
        const completo = [perfil.nombre.trim(), perfil.apellido.trim()].filter(Boolean).join(' ');
        this.nombrePerfil.set(completo || null);
        this.avatarPerfil.set(perfil.avatar_url);
      } else {
        this.nombrePerfil.set(null);
        this.avatarPerfil.set(null);
      }
    });
  }

  // ── Barra lateral ─────────────────────────────────────────────────────────

  toggleCollapse(): void {
    const next = !this.collapsed();
    this.collapsed.set(next);
    try { localStorage.setItem('sidebar-collapsed', String(next)); } catch { /* sin almacenamiento */ }
  }

  toggleMobile(): void { this.mobileOpen.update(v => !v); }
  closeMobile():  void { this.mobileOpen.set(false); }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.mobileOpen.set(false); }

  // ── Hoja «Plus» (cliente, móvil) ──────────────────────────────────────────

  abrirPlus(): void {
    const tpl = this.plusSheet();
    if (!tpl || this.plusRef) return;
    this.plusRef = this.bottomSheet.open(tpl, { ariaLabel: 'Plus', restoreFocus: true });
    this.plusAbierto.set(true);
    this.plusRef.afterDismissed().subscribe(() => {
      this.plusRef = null;
      this.plusAbierto.set(false);
    });
  }

  cerrarPlus(): void { this.plusRef?.dismiss(); }

  // ── Navegación home según rol ─────────────────────────────────────────────

  rutaHome = computed(() => {
    const rol = this.rolPerfil();
    if (rol === 'administrador') return '/admin/dashboard';
    if (rol === 'constructor') return '/builder/dashboard';
    if (rol === 'estimador') return '/estimator/dashboard';
    return '/client/dashboard';
  });

  async logout(): Promise<void> {
    this.cerrarPlus();
    try {
      await this.authService.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}

function leerColapsado(): boolean {
  try { return localStorage.getItem('sidebar-collapsed') === 'true'; } catch { return false; }
}
