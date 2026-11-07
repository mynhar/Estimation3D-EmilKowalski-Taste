import {
  ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, OnInit,
  afterNextRender, computed, inject, signal, viewChild,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { LangToggleComponent } from '../components/lang-toggle/lang-toggle.component';
import { PROVINCIAS_CANADA, SERVICIOS_FALLBACK, Servicio } from '../models';
import { AuthSupabaseService } from '../services/auth-supabase.service';
import { EdgeErrorService } from '../services/edge-error.service';
import { LangService } from '../services/lang.service';
import { SolicitudLandingService } from '../services/solicitud-landing.service';
import { CAMPOS_FALTANTES } from '../shared/ui/campos-faltantes/campos-faltantes.component';
import {
  COMPARE_ROWS, HERO_AREAS, HERO_COTES, IMMERSION_WORDS, MEDIA, PROCESS_STEPS,
  PROPERTY_TYPES, SPECIALTIES,
} from './landing.data';

/** Código postal canadiense: A1A 1A1 (con espacio, guion o nada). */
const CA_POSTAL_RE = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

/**
 * Landing pública, dirección Clarté: una sola superficie clara, seis secciones
 * (escaneo, problema frente a solución, pasos, especialidades, tour 3D y
 * formulario) y un único momento de movimiento, el barrido del escáner del hero.
 *
 * Sin Material salvo botón de icono, iconos y el menú de idioma, que el armazón
 * de la aplicación ya carga: los campos y botones son CSS propio para que la
 * primera visita en 4G no cargue el resto de la librería.
 */
@Component({
  selector: 'app-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, TranslatePipe, ReactiveFormsModule, NgOptimizedImage,
    MatButtonModule, MatIconModule, MatMenuModule,
    LangToggleComponent, ...CAMPOS_FALTANTES,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent implements OnInit, OnDestroy {
  private zone = inject(NgZone);
  private host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private fb = inject(FormBuilder);
  private auth = inject(AuthSupabaseService);
  private solicitudes = inject(SolicitudLandingService);
  private edgeErrors = inject(EdgeErrorService);

  readonly lang = inject(LangService);
  readonly year = new Date().getFullYear();

  // ── Datos estructurales ───────────────────────────────────────────────────
  readonly specialties = SPECIALTIES;
  readonly steps = PROCESS_STEPS;
  readonly compareRows = COMPARE_ROWS;
  readonly immersionWords = IMMERSION_WORDS;
  readonly cotes = HERO_COTES;
  readonly areas = HERO_AREAS;
  readonly propertyTypes = PROPERTY_TYPES;
  readonly provincesCanada = PROVINCIAS_CANADA;
  readonly media = MEDIA;

  // ── Estado de interfaz ────────────────────────────────────────────────────
  /** La página bajó lo bastante como para que la cabecera lleve filete. */
  readonly scrolled = signal(false);
  /** El escaneo del hero cargó: arranca el barrido (antes pasaría sobre una caja vacía). */
  readonly scanReady = signal(false);
  /** Botón fijo de móvil: entre el final del hero y el principio del formulario. */
  readonly ctaBar = signal(false);
  /** Envíos con campos sin completar: cada uno trae el resumen de lo que falta. */
  readonly intentos = signal(0);
  readonly sent = signal(false);
  readonly sending = signal(false);
  /** Clave i18n del último fallo del envío; vacía mientras no haya error. */
  readonly sendError = signal('');

  private menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');
  // En un `mat-icon-button` la referencia apunta al componente: se pide el elemento.
  private menuButton = viewChild.required('menuButton', { read: ElementRef<HTMLButtonElement> });

  // ── Servicios activos (bloque "type de service") ──────────────────────────
  // La lista sale de la tabla `servicio`, no de una constante: lo que la landing
  // ofrece tiene que ser exactamente lo que la aplicación sabe estimar.
  private serviciosRaw = signal<Servicio[]>([]);
  readonly loadingServices = signal(true);

  /** Servicios activos con el nombre ya resuelto al idioma en curso. */
  readonly services = computed(() => {
    const l = this.lang.current();
    return this.serviciosRaw().map(s => ({
      id: s.id,
      nombre:
        l === 'en' ? (s.nombre_en || s.nombre_fr || s.nombre_es)
      : l === 'es' ? (s.nombre_es || s.nombre_fr)
      :              (s.nombre_fr || s.nombre_es),
    }));
  });

  // ── Formulario "Créer mon dossier" ────────────────────────────────────────
  readonly form = this.fb.nonNullable.group({
    prenom: ['', Validators.required],
    nom: ['', Validators.required],
    telephone: ['', Validators.required],
    courriel: ['', [Validators.required, Validators.email]],
    typePropriete: ['', Validators.required],
    // Dirección canadiense, mismo desglose que "Localisation" de client/file/create.
    // Sólo el número de unidad es opcional: no todas las propiedades tienen uno.
    adresse: this.fb.nonNullable.group({
      numero_unidad: [''],
      calle: ['', Validators.required],
      ciudad: ['', Validators.required],
      provincia_ca: ['QC', Validators.required],
      codigo_postal: ['', [Validators.required, Validators.pattern(CA_POSTAL_RE)]],
    }),
    // Un solo servicio por dossier. Las altas internas admiten varios
    // (expediente_servicio); este formulario público sigue con uno.
    servicioId: this.fb.control<number | null>(null, Validators.required),
    description: [''],
  });

  /** Marca los campos con error sólo después del primer intento de envío. */
  readonly submitted = signal(false);

  private teardown: (() => void)[] = [];

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => {
      this.bindScroll();
      this.bindCtaBar();
    }));
  }

  ngOnInit(): void {
    void this.cargarServicios();
  }

  /**
   * Servicios activos ordenados por código. La tabla `servicio` es de lectura
   * abierta, así que la landing puede consultarla sin sesión; si la consulta
   * falla o vuelve vacía se cae al catálogo local para no dejar el bloque mudo.
   */
  private async cargarServicios(): Promise<void> {
    const { data, error } = await this.auth.client
      .from('servicio')
      .select('id, codigo, nombre_fr, nombre_en, nombre_es')
      .eq('activo', true)
      .order('codigo');

    if (error) console.error('servicio table error:', error.message);
    this.serviciosRaw.set(data?.length ? (data as unknown as Servicio[]) : SERVICIOS_FALLBACK);
    this.loadingServices.set(false);
  }

  // ── Cabecera y botón fijo ─────────────────────────────────────────────────
  /** Filete de la cabecera. Fuera de la zona: sólo se entra al cambiar de estado. */
  private bindScroll(): void {
    const onScroll = () => {
      const isScrolled = window.scrollY > 8;
      if (isScrolled !== this.scrolled()) this.zone.run(() => this.scrolled.set(isScrolled));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    this.teardown.push(() => window.removeEventListener('scroll', onScroll));
    onScroll();
  }

  /**
   * El botón fijo aparece cuando el CTA del hero ya no se ve y desaparece al
   * llegar al formulario (allí sobra) y en adelante (taparía el pie).
   */
  private bindCtaBar(): void {
    const hero = this.host.querySelector<HTMLElement>('#hero');
    const dossier = this.host.querySelector<HTMLElement>('#dossier');
    if (!hero || !dossier || typeof IntersectionObserver === 'undefined') return;

    let heroVisible = true;
    let dossierReached = false;
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.target === hero) heroVisible = e.isIntersecting;
        else dossierReached = e.isIntersecting || e.boundingClientRect.top < 0;
      }
      const show = !heroVisible && !dossierReached;
      if (show !== this.ctaBar()) this.zone.run(() => this.ctaBar.set(show));
    });
    io.observe(hero);
    io.observe(dossier);
    this.teardown.push(() => io.disconnect());
  }

  // ── Menú móvil (<dialog> nativo: foco atrapado, Escape y fondo inerte) ────
  openMenu(): void {
    this.menu().nativeElement.showModal();
  }

  /**
   * `returnFocus = false` cuando se cierra para navegar: el evento `close` llega
   * después y, si no, devolvería el foco al botón en vez de dejarlo en el destino.
   */
  closeMenu(returnFocus = true): void {
    const dialog = this.menu().nativeElement;
    if (!dialog.open) return;
    this.returnFocus = returnFocus;
    dialog.close();
  }
  private returnFocus = true;

  /** Un clic en el telón (fuera de la hoja) cierra el menú. */
  onMenuClick(event: MouseEvent): void {
    if (event.target === this.menu().nativeElement) this.closeMenu();
  }

  /** Al cerrarse, el foco vuelve al botón que lo abrió (salvo al navegar). */
  onMenuClosed(): void {
    if (this.returnFocus) this.menuButton().nativeElement.focus({ preventScroll: true });
    this.returnFocus = true;
  }

  // ── Navegación interna ────────────────────────────────────────────────────
  /** Desplazamiento a una sección de la propia landing; deja el foco en ella. */
  goTo(id: string, event?: Event): void {
    event?.preventDefault();
    this.closeMenu(false);
    const el = this.host.querySelector<HTMLElement>('#' + id);
    if (!el) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  }

  /**
   * Vuelve al principio de la landing. Hace falta además del `routerLink="/"`:
   * al estar ya en `/` el router ignora la navegación y el scroll no se movería.
   */
  goTop(event?: Event): void {
    event?.preventDefault();
    this.closeMenu(false);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  // ── Formulario ────────────────────────────────────────────────────────────
  /** Igual que `invalid()` pero para los campos del subgrupo de dirección. */
  invalidAddr(name: keyof typeof this.form.controls.adresse.controls): boolean {
    const c = this.form.controls.adresse.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  /** true cuando hay que pintar el campo en rojo. */
  invalid(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  /**
   * Manda la solicitud a `crear-dossier-landing`: esa función da de alta al
   * cliente (o actualiza sus datos si el correo ya existe), abre el expediente
   * y escribe al cliente y al buzón interno. Aquí sólo se transporta el
   * formulario y se refleja el resultado.
   */
  async submit(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // El resumen junto al botón dice qué falta y lleva a cada campo.
      this.intentos.update(n => n + 1);
      return;
    }
    if (this.sending()) return;

    this.sending.set(true);
    this.sendError.set('');

    const v = this.form.getRawValue();
    try {
      await this.solicitudes.crear({
        prenom:        v.prenom,
        nom:           v.nom,
        telephone:     v.telephone,
        courriel:      v.courriel,
        typePropriete: v.typePropriete,
        servicioId:    v.servicioId!,
        adresse:       v.adresse,
        description:   v.description ?? '',
        idioma:        this.lang.current(),
      });
      this.sent.set(true);
    } catch (e) {
      console.error('[landing] crear-dossier-landing:', e);
      this.sendError.set(this.edgeErrors.clave(e, 'landing.form.send_error'));
    } finally {
      this.sending.set(false);
    }
  }

  ngOnDestroy(): void {
    this.closeMenu(false);
    for (const fn of this.teardown) fn();
  }
}
