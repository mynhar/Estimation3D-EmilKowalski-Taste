import {
  ChangeDetectionStrategy, Component, ElementRef, Injector, NgZone, OnDestroy, OnInit,
  afterNextRender, computed, inject, signal, viewChild,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

import { SiteFooterComponent } from '../public-site/chrome/site-footer.component';
import { SiteHeaderComponent } from '../public-site/chrome/site-header.component';
import { PROVINCIAS_CANADA, SERVICIOS_FALLBACK, Servicio } from '../models';
import { AuthSupabaseService } from '../services/auth-supabase.service';
import { EdgeErrorService } from '../services/edge-error.service';
import { LangService } from '../services/lang.service';
import { SolicitudLandingService } from '../services/solicitud-landing.service';
import { CAMPOS_FALTANTES } from '../shared/ui/campos-faltantes/campos-faltantes.component';
import {
  COMPARE_ROWS, IMMERSION_WORDS, MEDIA, PROCESS_STEPS,
  PROPERTY_TYPES, SPECIALTIES,
} from './landing.data';

/** Código postal canadiense: A1A 1A1 (con espacio, guion o nada). */
const CA_POSTAL_RE = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

/** Anchos de teléfono: el formulario va en tres pasos. */
const PASOS_MQ = '(max-width: 767.98px)';

type Paso = 1 | 2 | 3;

/** Controles de cada paso del formulario, en el orden en que se ven. */
const CONTROLES_PASO = {
  1: ['prenom', 'nom', 'telephone', 'courriel'],
  2: ['typePropriete', 'adresse'],
  3: ['servicioId', 'description'],
} as const;

/**
 * Landing pública (Lin et bronze; se rediseña en la fase 1): seis secciones
 * (escaneo, problema frente a solución, pasos, especialidades, tour 3D y
 * formulario).
 *
 * Sin Material salvo botón de icono, iconos y el menú de idioma, que el armazón
 * de la aplicación ya carga: los campos y botones son CSS propio para que la
 * primera visita en 4G no cargue el resto de la librería.
 *
 * «Créer mon dossier» va relleno (espresso) solo en un sitio a la vez: el del
 * hero; mientras se ve, el de la cabecera va de contorno.
 */
@Component({
  selector: 'app-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe, ReactiveFormsModule, NgOptimizedImage,
    MatIconModule,
    SiteHeaderComponent, SiteFooterComponent, ...CAMPOS_FALTANTES,
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: [
    '../public-site/styles/site-base.css', '../public-site/styles/site-blocks.css',
    './landing-page.component.css',
  ],
})
export class LandingPageComponent implements OnInit, OnDestroy {
  private zone = inject(NgZone);
  private host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private fb = inject(FormBuilder);
  private auth = inject(AuthSupabaseService);
  private solicitudes = inject(SolicitudLandingService);
  private edgeErrors = inject(EdgeErrorService);
  private injector = inject(Injector);

  readonly lang = inject(LangService);
  readonly year = new Date().getFullYear();

  // ── Datos estructurales ───────────────────────────────────────────────────
  readonly specialties = SPECIALTIES;
  readonly steps = PROCESS_STEPS;
  readonly compareRows = COMPARE_ROWS;
  readonly immersionWords = IMMERSION_WORDS;
  readonly propertyTypes = PROPERTY_TYPES;
  readonly provincesCanada = PROVINCIAS_CANADA;
  readonly media = MEDIA;

  // ── Estado de interfaz ────────────────────────────────────────────────────
  /** Botón fijo de móvil: entre el final del hero y el principio del formulario. */
  readonly ctaBar = signal(false);
  /** Envíos con campos sin completar: cada uno trae el resumen de lo que falta. */
  readonly intentos = signal(0);
  readonly sent = signal(false);
  readonly sending = signal(false);
  /** Clave i18n del último fallo del envío; vacía mientras no haya error. */
  readonly sendError = signal('');

  // ── Formulario en tres pasos (solo en anchos de teléfono) ─────────────────
  private readonly pasosMq = typeof matchMedia === 'function' ? matchMedia(PASOS_MQ) : null;
  /** true en teléfono: un paso cada vez. En tableta y escritorio, todo a la vez. */
  readonly pasos = signal(this.pasosMq?.matches ?? false);
  readonly paso = signal<Paso>(1);
  readonly pasoLista: readonly Paso[] = [1, 2, 3];
  /** Sentido del último cambio de paso: el contenido nuevo entra desde ese lado. */
  readonly sentido = signal<'next' | 'back' | null>(null);
  private fm = viewChild.required<ElementRef<HTMLFormElement>>('fm');

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
      this.bindCtaBar();
      this.bindPasos();
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

  // ── Botón fijo ────────────────────────────────────────────────────────────
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

  /** Al girar el teléfono o redimensionar, el formulario cambia de modo sin perder lo escrito. */
  private bindPasos(): void {
    const mq = this.pasosMq;
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => this.zone.run(() => this.pasos.set(e.matches));
    mq.addEventListener('change', onChange);
    this.teardown.push(() => mq.removeEventListener('change', onChange));
  }

  // ── Navegación interna ────────────────────────────────────────────────────
  /** Desplazamiento a una sección de la propia landing; deja el foco en ella. */
  goTo(id: string, event?: Event): void {
    event?.preventDefault();
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
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  // ── Pasos del formulario ──────────────────────────────────────────────────
  private pasoValido(n: Paso): boolean {
    return CONTROLES_PASO[n].every(k => this.form.controls[k].valid);
  }

  /** «Continuer»: si el paso está completo, al siguiente; si no, sus errores y el foco en el primero. */
  avanzar(): void {
    const n = this.paso();
    if (!this.pasoValido(n)) {
      for (const k of CONTROLES_PASO[n]) this.form.controls[k].markAllAsTouched();
      this.enfocarError(n);
      return;
    }
    if (n < 3) this.irAPaso((n + 1) as Paso, 'next');
  }

  retroceder(): void {
    const n = this.paso();
    if (n > 1) this.irAPaso((n - 1) as Paso, 'back');
  }

  /**
   * Cambia de paso y lleva el foco a su título (el lector de pantalla anuncia
   * «Étape n sur 3» y el nombre). Si el formulario quedó por encima de la
   * pantalla, sube de golpe hasta su borde: el movimiento lo pone la entrada
   * del paso, no el scroll. Con `conError`, el foco va al primer campo mal.
   */
  private irAPaso(n: Paso, sentido: 'next' | 'back', conError = false): void {
    this.sentido.set(sentido);
    this.paso.set(n);
    if (conError) {
      this.enfocarError(n);
      return;
    }
    afterNextRender(() => {
      const form = this.fm().nativeElement;
      form.querySelector<HTMLElement>(`#fm-s${n}`)?.focus({ preventScroll: true });
      const top = form.getBoundingClientRect().top;
      const hd = this.host.querySelector<HTMLElement>('.hd')?.offsetHeight ?? 0;
      if (top < hd) form.scrollIntoView({ block: 'start' });
    }, { injector: this.injector });
  }

  /** Foco en el primer campo con error del paso, centrado en pantalla. */
  private enfocarError(n: Paso): void {
    afterNextRender(() => {
      const paso = this.fm().nativeElement.querySelector<HTMLElement>(`[data-paso="${n}"]`);
      const campo = paso?.querySelector<HTMLElement>(
        '[aria-invalid="true"], .chips.is-invalid input:not([disabled])');
      if (!campo) return;
      campo.focus({ preventScroll: true });
      campo.scrollIntoView({ block: 'center', behavior: movimiento() });
    }, { injector: this.injector });
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
    // En pasos, Intro o «Continuer» antes del último paso solo avanzan.
    if (this.pasos() && this.paso() < 3) {
      this.avanzar();
      return;
    }
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // En pasos, si lo que falta está en un paso anterior (se borró al volver), se vuelve a él.
      const primero = this.pasoLista.find(n => !this.pasoValido(n));
      if (this.pasos() && primero && primero !== this.paso()) {
        this.irAPaso(primero, 'back', true);
        return;
      }
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
    for (const fn of this.teardown) fn();
  }
}

function movimiento(): ScrollBehavior {
  return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}
