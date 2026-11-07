# Design — Proyecto Angular 22 (Clarté)

> **Dirección aprobada: Clarté** (6-nov-2026). El rediseño completo avanza por
> fases (ver abajo). Este archivo resume el sistema; el detalle está en
> `DESIGN_GUIDELINES.md` y los valores reales en `src/styles/tokens.css`.
> Siguen vigentes: el contrato de stack, el uso de tokens `--ds-*` (sin hex
> sueltos ni nombres `--color-*`) y el contraste AA.

## System
- Genre · marketplace de remediación residencial con escaneo 3D (Montréal)
- Público · propietarios con un problema (moho, daños por agua, amianto,
  aislamiento, cimientos) y contratistas certificados
- Vibe · "claro y medido": cal, pizarra y un verde sapin; tranquilo, no alarmista
- Axes · superficies claras / sans semicondensada para títulos / un solo color de acción
- Firma · la **cota arquitectónica** (línea de medida). Solo para medidas reales
  y para la línea de progreso de 6 etapas del dossier

## Tokens (canonical — `src/styles/tokens.css` is the SOURCE OF TRUTH)
> Real token names are `var(--ds-*)`. Generated code MUST use these exact
> names. Do NOT invent `--color-*` names.

```css
:root {
  /* Superficies */
  --ds-bg:            #FAFAF7;  /* Chaux: página                          */
  --ds-bg-alt:        #F0F2EE;  /* secciones alternas, hover de filas      */
  --ds-stone:         #E4E6E1;  /* Pierre grise: bandas                    */
  --ds-surface:       #FFFFFF;  /* Blanc: tarjetas, paneles, campos        */

  /* Tinta */
  --ds-ink:           #1D2B30;  /* Ardoise — 13.9:1 sobre bg               */
  --ds-ink-secondary: #34444A;
  --ds-ink-muted:     #56646A;  /* 6.1:1 sobre blanco, 4.9 sobre stone     */
  --ds-ink-faint:     #7C8A8D;  /* solo gráficos y contorno de campos, nunca texto */

  /* Acción (sapin): el ÚNICO color de acción */
  --ds-action:        #1E6A55;  /* 6.5:1 sobre blanco · blanco encima      */
  --ds-action-hover:  #185846;
  --ds-action-pressed:#134A3B;
  --ds-on-action:     #FFFFFF;
  --ds-action-soft:   #CFE8DF;  /* bordes de selección, realces            */
  --ds-action-ink:    #17523F;  /* texto sobre action-soft / scan-soft     */

  /* Escaneo (menthe): la firma */
  --ds-scan:          #9BE3CF;  /* cotas, progreso; nunca texto sobre claro */
  --ds-scan-soft:     #E3F6F0;  /* fondos de selección                     */

  /* Semánticos (base = texto AA; -soft = fondo) */
  --ds-success: #17623F;  --ds-success-soft: #E2F1E8;
  --ds-warning: #8A5200;  --ds-warning-soft: #FFF0D9;
  --ds-danger:  #B3261E;  --ds-danger-soft:  #FBE6E4;  --ds-danger-ink: #A3231C;
  --ds-info:    #245B78;  --ds-info-soft:    #E2EEF4;

  --ds-font-display: "Sofia Sans Semi Condensed", "Arial Narrow", system-ui, sans-serif; /* 600/700/800 */
  --ds-font-body:    "Atkinson Hyperlegible Next", system-ui, sans-serif;             /* 400/500/700 + it. 400 */

  /* Radios: 6px botones/campos/menús · 12px tarjetas · 20px hojas/diálogos.
     Spacing: escala --ds-space-* (4px–128px). Type: --ds-text-*.          */
  /* Foco: --ds-focus-ring (box-shadow, doble anillo superficie + acción)
     y --ds-focus-outline (outline 2px acción).                            */
  /* Sombras: --ds-shadow-* teñidas de ardoise, nunca negro puro.          */
}
```

### Legado dorado (alias temporales)
`--ds-gold*` y `--ds-shadow-gold` son **alias** de `--ds-action*` / `--ds-scan-soft`
para que las 86 pantallas cambien de identidad sin romperse. No los uses en código
nuevo. Igual con las variables sin prefijo de `src/styles.css` (`--gold`, `--ink-900`,
`--warm-*`…) y las `--bs-*` de `bootstrap-overrides.css`: todas apuntan a `--ds-*`.
Se borran en la fase 4.

### Superficies oscuras (panel de login, grabador de vídeo, visor 3D)
- `--ds-dark-surface` (#1D2B30, ardoise) · `--ds-dark-surface-deep` (#152024)
- Sobre ardoise el acento es **menthe** (`--ds-scan`, 9.9:1); sapin solo da 2.3:1.
  Mientras esas pantallas no se rediseñen, sus islas oscuras redirigen localmente
  `--ds-gold*` → `--ds-scan*` y `--ds-ink-on-accent` → `--ds-ink`.
- `--ds-danger-on-dark` (#F4A39D) + `--ds-danger-on-dark-hover` (#F9C6C2)

## CTA voice
- Primary · relleno `--ds-action` · texto `--ds-on-action` · radius 6px
- Secondary · borde `--ds-border-strong`, fondo blanco, texto tinta
- Un solo color de acción por pantalla: nada de CTA en menthe, ámbar ni ardoise
- En Angular Material: Primary = `mat-flat-button` · Secondary = `mat-stroked-button` · texto = `mat-button`

## Typography
- Sofia Sans Semi Condensed para títulos y cifras; Atkinson Hyperlegible Next para todo lo demás
- Escala objetivo: ratio 1.25 sobre 17px (móvil), 1.333 sobre 18px (escritorio), **mínimo 14px**.
  Los tokens `--ds-text-2xs`/`-xs` (11–12px) son legado y desaparecen pantalla a pantalla
- Sentence case siempre. Sin etiquetas en mayúsculas espaciadas, sin etiquetas monoespaciadas,
  sin cadenas "A · B · C", sin numeración entre corchetes, sin resaltar una sola palabra del título

## Iconography
- **Material Symbols Outlined** vía `mat-icon` (fuente por defecto fijada en `app.config.ts`).
  `index.html` carga solo el subconjunto usado (`icon_names=`, orden alfabético);
  `node scripts/icons.mjs --write` lo regenera y `npm run lint:css` falla si se desfasa.
  Un icono dinámico (`<mat-icon>{{ x.matIcon }}</mat-icon>`) lee de una propiedad
  `matIcon: 'nombre'` para que el script lo detecte.
- Hasta que cada pantalla se rediseñe, su contenido sigue con bootstrap-icons line, un
  solo set por pantalla. Transición: el armazón (navegación) ya usa Material Symbols en todas.

## Armazón de la app
- Escritorio (≥ 992px): barra lateral blanca con filete, 264px (72px plegada), navegación
  por rol definida en `app.component.ts`; activo = fondo `--ds-scan-soft`, texto
  `--ds-action-ink` y barra sapin de 3px.
- Móvil: barra superior blanca (marca, idioma en `mat-menu`, avatar → perfil).
  Cliente: pestañas inferiores Accueil · Mes dossiers · Offres reçues · Plus; «Plus» abre
  un `mat-bottom-sheet` con el resto. Roles internos: cajón lateral con fondo ardoise translúcido.
- Objetivos táctiles ≥ 44px, `safe-area-inset-*`, enlace «Aller au contenu».
- `.page-wrapper`: 16px de margen lateral en móvil, 24px desde 768px, 32px desde 1200px.

## Landing y páginas públicas
- Solo tema claro. Sin selector Sombre/Clair ni controles flotantes: el idioma va en la cabecera
  (segmentado desde 1200px, `mat-menu` por debajo, como la barra de la app). Le Journal y
  Entrepreneurs conservan su piel antigua y `SiteThemeService` hasta la fase 2.
- Seis secciones: escaneo (hero) · problema frente a solución (banda stone) · tres pasos ·
  especialidades (filas en móvil, 2 × 3 desde 640px, 3 × 2 desde 1024px) · tour 3D (isla ardoise)
  · formulario. Móvil: botón fijo «Créer mon dossier» entre el final del hero y el formulario.
- Firma: cotas menthe sobre el escaneo, solo con medidas reales del plano. Etiquetas en HTML
  (≥ 14px con `cqi`), líneas en SVG. Barrido único de 1.6s con `--ds-ease-in-out`: línea, velo y
  cotas comparten curva; arranca al cargar la imagen. Con reduced motion, cotas visibles sin barrido.
- CSS propio del componente; de Material solo `mat-icon`, `mat-icon-button` y `mat-menu` (ya
  cargados por el armazón). Botón `.button` (nunca `.btn`: colisiona con `ui-base.css`), campos
  de 48px a 16px con borde `--ds-ink-faint`; menú móvil en `<dialog>` nativo.
- Imágenes con `NgOptimizedImage` y copias web (`*-800.jpg`, `scan-render-1-1400.jpg`).

## Motion stance
- Sobria. Un solo momento orquestado por pantalla (en la landing: el barrido del escaneo).
- Movimiento que responde a una acción (abrir, expandir, confirmar) sí; entradas en cascada por reflejo, no.
- Curvas y duraciones con `--ds-ease-*` / `--ds-duration-*`. Reduced-motion cubierto globalmente.
- Sin `@angular/animations`: CSS, WAAPI o `animate.enter` / `animate.leave`.

## Reglas de contraste
- Texto sobre `-soft` → su `-ink` (o la base, que ya pasa AA salvo en danger)
- Menthe nunca como texto ni como única señal sobre fondo claro (1.4:1): úsalo con tinta encima
  o acompañado de texto/forma
- `--ds-ink-faint` solo gráficos (3.6:1); el texto terciario es `--ds-ink-muted`
- En Material, el rol `primary` también es color de texto: sapin (6.5:1) lo cumple

## Bans
- Gradientes decorativos (en especial morado-rosa) · reinstalar Bootstrap / ng-bootstrap
- Emojis decorativos · UI genérica sin postura estética
- Fondos negros (#000) · sombras rgba(0,0,0,..) · iconos filled
- Amarillo/negro de señal de peligro (la alternativa "Ruban" se descartó por eso)
- Radios fuera de la escala 4 / 6 / 12 / 20 / pill

## Angular Material (M3)
Tema en `src/styles/material-theme.scss` (único `.scss`), con `use-system-variables`:
cada rol `--mat-sys-*` apunta a un token `--ds-*`.
- `primary` → `--ds-action` · `on-primary` → `--ds-on-action`
- `primary-container` / `inverse-primary` → `--ds-scan` · `secondary-container` → `--ds-action-soft`
- `surface` / `surface-container` → `--ds-surface` · `surface-container-highest` → `--ds-bg-alt`
- `on-surface-variant` → `--ds-ink-muted` · `outline` → `--ds-ink-faint` · `error` → `--ds-danger`
- Formas: botones, campos, menús, snack-bar 6px · tarjetas, expansion 12px · diálogos, bottom sheet 20px
- Tabla completa y reglas de uso: `DESIGN_GUIDELINES.md` §4.

## Fases del rediseño
0. Limpieza y base: tokens, fuentes, tema de Material, docs (hecho)
1. Cara al cliente: landing (CSS propio + motion), login con Material, shell móvil con pestañas
   inferiores, dashboard del cliente, estados vacíos, visor 3D (póster + diálogo a pantalla completa).
   Hecho: armazón, dashboard del cliente, visor 3D y componentes compartidos
   (`shared/ui`: page-header, empty-state, status-chip, stage-line, dossier-card, tour-poster,
   media-viewer), login y registro, landing.
2. Resto de pantallas del cliente + journal y entrepreneurs
3. Contratista · 4. Estimador y admin; después se borran `ui-base.css` y `bootstrap-overrides.css`

## Stack output contract
- Componentes **Angular 22 standalone**, `OnPush`, signals (`input()`/`signal()`),
  nuevo control flow (`@if`/`@for` con `track`). NUNCA `*ngIf`/`*ngFor`, NgModules,
  ni `@Input()`/`@Output()`.
- CSS plano por componente con `:host` (no SCSS salvo el tema `material-theme.scss`, no Tailwind).
- Bootstrap desinstalado. Las clases heredadas (`.btn`, `.card`, `.row`...) las sirve
  `src/styles/ui-base.css` solo durante la transición; el CSS nuevo va en cada
  componente con tokens. Controles, menús, overlays y diálogos con **Angular Material 22**.
  **NO** HTML suelto ni JSX.

## Exports
`tokens.css` (`--ds-*`) es la fuente de verdad. El detalle completo (tabla de
paleta, utilidades `.eyebrow`/`.tag`/`.stat`, patrones de hero/grid) está en
`DESIGN_GUIDELINES.md`. Para Tailwind/DTCG/shadcn: este proyecto NO los usa.
