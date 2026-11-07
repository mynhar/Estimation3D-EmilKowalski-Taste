# DESIGN_GUIDELINES.md

Guía de diseño y código para este proyecto. Aplica también si usas Claude Code, Copilot u otra IA para generar componentes.

> **Dirección aprobada: Clarté** (6-nov-2026). El rediseño completo avanza por fases: la fase 0 (tokens, fuentes, tema de Material y docs) está hecha; las pantallas se rediseñan una a una en las fases 1–4 (ver `design.md`). Mientras tanto, las pantallas antiguas ya se ven con los colores y fuentes Clarté porque los tokens dorados son alias de los nuevos. Siguen vigentes las convenciones técnicas (secciones 3–6, 9–11), el uso de tokens `var(--ds-...)` y el contraste WCAG AA.

---

## 1. Stack del proyecto

- **Framework**: Angular 22 (standalone components, signals, nuevo control flow), TypeScript 6.0
- **Estilos**: CSS plano (NO SCSS, NO Tailwind). Única excepción: `src/styles/material-theme.scss`, el tema de Material. Bootstrap desinstalado: ver sección 4
- **Componentes**: Angular Material 22 (M3), con su tema enlazado a los tokens `--ds-*`: ver sección 4
- **Sistema de diseño**: tokens CSS en `src/styles/tokens.css`
- **Tipografías**: Sofia Sans Semi Condensed para títulos y cifras, Atkinson Hyperlegible Next para cuerpo e interfaz
- **Iconos**: Material Symbols Outlined vía `mat-icon` (subconjunto en `index.html`, mantenido por `scripts/icons.mjs`); bootstrap-icons line en el contenido de las pantallas aún no rediseñadas. Nunca filled

---

## 2. Identidad visual — Clarté

Claro y medido: superficies de cal y blanco, tinta pizarra, **un único color de acción** (sapin) y una firma, la **cota arquitectónica** en menthe. El público son propietarios con un problema en casa (moho, agua, amianto, aislamiento, cimientos): la interfaz transmite calma y precisión, no alarma.

### Paleta completa

La fuente de verdad es `src/styles/tokens.css`. Usa siempre el token, nunca el hex suelto. Contrastes WCAG 2.x calculados.

**Superficies**

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-bg` | `#FAFAF7` | Chaux: fondo de página |
| `--ds-bg-alt` | `#F0F2EE` | Secciones alternas, hover de filas, rellenos sutiles |
| `--ds-stone` | `#E4E6E1` | Pierre grise: bandas de sección |
| `--ds-surface` | `#FFFFFF` | Blanc: tarjetas, paneles, campos |
| `--ds-surface-elevated` | `#FFFFFF` | Modales, overlays (se distinguen por sombra) |
| `--ds-overlay` | `rgba(29,43,48,0.45)` | Backdrops detrás de modales |

**Tinta / Texto**

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-ink` | `#1D2B30` | Ardoise: texto principal (13.9:1 sobre `--ds-bg`) |
| `--ds-ink-secondary` | `#34444A` | Texto secundario (9.0:1 sobre `--ds-bg-alt`) |
| `--ds-ink-muted` | `#56646A` | Texto terciario, captions, placeholders (6.1:1 sobre blanco, 4.9:1 sobre `--ds-stone`) |
| `--ds-ink-faint` | `#7C8A8D` | **Solo gráficos** y contorno de campos (3.6:1). Nunca texto |
| `--ds-ink-inverse` | `#FFFFFF` | Texto sobre superficies oscuras (14.6:1 sobre ardoise) |

**Acción (sapin)** — el único color de acción: botones principales, enlaces, foco, selección

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-action` | `#1E6A55` | Relleno del CTA, enlaces, foco (6.5:1 sobre blanco) |
| `--ds-action-hover` | `#185846` | Hover |
| `--ds-action-pressed` | `#134A3B` | Active / pressed |
| `--ds-on-action` | `#FFFFFF` | Texto sobre `--ds-action` (6.5:1) |
| `--ds-action-soft` | `#CFE8DF` | Bordes de selección, realces |
| `--ds-action-ink` | `#17523F` | Texto sobre `--ds-action-soft` (7.0:1) y `--ds-scan-soft` (8.1:1) |

**Escaneo (menthe)** — la firma: cotas, línea de progreso, medidas reales

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-scan` | `#9BE3CF` | Cotas y progreso; acento sobre ardoise (9.9:1); relleno con tinta encima (9.9:1). **Nunca texto sobre claro** (1.4:1) |
| `--ds-scan-hover` | `#B7ECDD` | Hover de rellenos menthe (superficies oscuras) |
| `--ds-scan-soft` | `#E3F6F0` | Fondos de selección y estados suaves |

**Bordes y separadores (filets)**

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-border` | `#D3D7D2` | Filet estándar |
| `--ds-border-strong` | `#B6BEB9` | Bordes de énfasis, botón secundario |
| `--ds-border-subtle` | `#E8EBE6` | Separadores muy sutiles |

**Estados semánticos**. Las bases ya pasan AA como texto sobre blanco y sobre su `-soft`; `-ink` coincide con la base salvo en danger.

| Token CSS | Hex | `-soft` | Texto sobre `-soft` |
|-----------|-----|---------|---------------------|
| `--ds-success` / `-ink` | `#17623F` | `#E2F1E8` | 6.3:1 |
| `--ds-warning` / `-ink` | `#8A5200` | `#FFF0D9` | 5.7:1 |
| `--ds-danger` · `--ds-danger-ink` | `#B3261E` · `#A3231C` | `#FBE6E4` | 6.2:1 (`-ink`) |
| `--ds-info` / `-ink` | `#245B78` | `#E2EEF4` | 6.3:1 |

Con blanco encima, las cuatro bases pasan AA (6.4–7.4:1), así que sirven de relleno de botón.

```css
/* Insignia de estado */
.badge--ok     { background: var(--ds-success-soft); color: var(--ds-success-ink); }
.badge--select { background: var(--ds-scan-soft);    color: var(--ds-action-ink); border-color: var(--ds-action-soft); }
```

Con las utilidades heredadas de `ui-base.css`: `bg-success-subtle text-success-emphasis`; las variables `--bs-*-text-emphasis` ya apuntan a los tokens `-ink`.

**Superficies oscuras** (panel del login, grabador de vídeo, visor 3D)

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-dark-surface` | `#1D2B30` | Ardoise |
| `--ds-dark-surface-deep` | `#152024` | Variante profunda |
| `--ds-danger-on-dark` · `-hover` | `#F4A39D` · `#F9C6C2` | Acción peligro sobre oscuro (7.3 / 9.6:1) |

Sobre ardoise el acento es **menthe** (`--ds-scan`): sapin solo da 2.3:1. Las pantallas aún no rediseñadas con islas oscuras redirigen localmente `--ds-gold*` → `--ds-scan*` y `--ds-ink-on-accent` → `--ds-ink` (ver `login.component.css` y `grabador-video.component.css`).

**Legado dorado (alias temporales, no usar en código nuevo)**

| Alias | Apunta a |
|-------|----------|
| `--ds-gold` · `-hover` · `-active` | `--ds-action` · `-hover` · `-pressed` |
| `--ds-gold-soft` · `--ds-gold-faint` · `--ds-gold-ink` | `--ds-action-soft` · `--ds-scan-soft` · `--ds-action-ink` |
| `--ds-ink-on-accent` | `#FFFFFF` (texto sobre el antiguo dorado, hoy sapin) |
| `--ds-shadow-gold` | `--ds-shadow-action` |

Igual con las variables sin prefijo de `src/styles.css` (`--gold`, `--ink-900`, `--warm-*`, `--purple`…) y las `--bs-*` de `bootstrap-overrides.css`: todas apuntan a `--ds-*`. Se borran en la fase 4.

### Reglas de color

- **Un solo color de acción**: CTA, enlaces, foco y selección van en sapin. Nada de CTAs en menthe, ámbar ni ardoise
- **Menthe solo para la firma**: cotas, progreso, medidas reales y acento sobre ardoise. Nunca como texto ni como única señal sobre fondo claro
- Texto sobre fondo `-soft` → su `-ink` (`--ds-success-ink`, `--ds-action-ink`…)
- **PROHIBIDO** usar tokens de borde (`--ds-border*`, `--ds-action-soft`) como color de texto o icono: texto → `--ds-ink-muted`, adorno → `--ds-ink-faint`
- **PROHIBIDO** fondos negros (`#000`), sombras `rgba(0,0,0,…)`, gradientes decorativos (en especial morado-rosa) y la combinación amarillo/negro de señal de peligro
- **PROHIBIDO** Bootstrap defaults sin override (azul `#0d6efd`, gris `#6c757d`)

### Tipografía

- **Títulos y cifras** (`h1`–`h6`, `.display-*`, importes, medidas): Sofia Sans Semi Condensed, 600/700/800
- **Cuerpo e interfaz** (texto, botones, formularios, etiquetas): Atkinson Hyperlegible Next, 400/500/700 + itálica 400
- **Monoespaciada**: no hay de marca. `--ds-font-mono` es la del sistema, solo para código o identificadores técnicos
- **Sentence case siempre**. Sin etiquetas en mayúsculas espaciadas, sin etiquetas monoespaciadas, sin cadenas «A · B · C», sin numeración entre corchetes, sin resaltar una sola palabra de un título (cursiva, negrita o color)
- **Eyebrow**: solo si aporta contexto real (p. ej. el nombre del dossier sobre el título de una subpágina), en `--ds-text-sm`, peso 500, `--ds-ink-muted`

**Familias**

| Token CSS | Valor | Uso |
|-----------|-------|-----|
| `--ds-font-display` | `'Sofia Sans Semi Condensed', ...sans-serif` | Títulos, cifras |
| `--ds-font-body` | `'Atkinson Hyperlegible Next', ...sans-serif` | Cuerpo, UI |
| `--ds-font-mono` | `ui-monospace, ...monospace` | Código |

**Escala tipográfica**. Objetivo Clarté: ratio 1.25 sobre 17px en móvil y 1.333 sobre 18px en escritorio, **mínimo 14px**. La fase 0 conserva los tamaños de los tokens para no romper pantallas; cada pantalla adopta la escala al rediseñarse.

| Token CSS | Tamaño | px | Uso típico |
|-----------|--------|----|----|
| `--ds-text-2xs` | `0.6875rem` | 11px | Legado: no usar en código nuevo |
| `--ds-text-xs` | `0.75rem` | 12px | Legado: no usar en código nuevo |
| `--ds-text-sm` | `0.875rem` | 14px | Mínimo: captions, texto auxiliar |
| `--ds-text-base` | `1rem` | 16px | Cuerpo |
| `--ds-text-lg` | `1.125rem` | 18px | Lead, cuerpo en escritorio |
| `--ds-text-xl` | `1.375rem` | 22px | h5 |
| `--ds-text-2xl` | `1.75rem` | 28px | h4, card-title |
| `--ds-text-3xl` | `2.25rem` | 36px | h3 |
| `--ds-text-4xl` | `3rem` | 48px | h2 |
| `--ds-text-5xl` | `4rem` | 64px | h1 |
| `--ds-text-display` | `5.5rem` | 88px | Hero |

**Pesos**: `--ds-weight-regular` (400) · `--ds-weight-medium` (500) · `--ds-weight-semibold` (600) · `--ds-weight-bold` (700) · `--ds-weight-black` (800, solo títulos). Sofia Sans solo se carga en 600/700/800: un título en 400 se pinta en 600.

**Interlineado**: `--ds-leading-tight` (1.1, títulos) · `--ds-leading-snug` (1.25) · `--ds-leading-normal` (1.5, cuerpo) · `--ds-leading-relaxed` (1.65)

**Tracking**: `--ds-tracking-tight` (-0.02em) · `--ds-tracking-normal` (0) · `--ds-tracking-wide` (0.04em) · `--ds-tracking-widest` (0.18em, legado de las mayúsculas espaciadas)

### Bordes y radios

Tres radios con jerarquía, no uno para todo:

- **Botones, campos, menús**: `6px` (`var(--ds-radius-md)`)
- **Tarjetas**: `12px` (`var(--ds-radius-lg)`)
- **Hojas y diálogos**: `20px` (`var(--ds-radius-xl)`)
- **Insignias pequeñas**: `4px` · **Chips y tags**: pill
- **PROHIBIDO**: radios fuera de esta escala

| Token CSS | Valor | Uso |
|-----------|-------|-----|
| `--ds-radius-none` | `0` | Sin redondeo |
| `--ds-radius-sm` | `4px` | Insignias, elementos compactos |
| `--ds-radius-md` | `6px` | Botones, campos, menús |
| `--ds-radius-lg` | `12px` | Tarjetas |
| `--ds-radius-xl` | `20px` | Hojas, diálogos |
| `--ds-radius-pill` | `999px` | Tags, chips |
| `--ds-radius-circle` | `50%` | Avatares |

### Espaciado

- Generoso, no aglomerar.
- Secciones: `padding-block: 4rem` mínimo, `6-8rem` en hero o secciones destacadas.
- Cards: `padding: 2rem` mínimo en body.
- Usa los tokens `--ds-space-*` (escala de 4px hasta 128px).

| Token | px | · | Token | px |
|-------|----|----|-------|----|
| `--ds-space-0` | 0 | · | `--ds-space-7` | 40px |
| `--ds-space-1` | 4px | · | `--ds-space-8` | 48px |
| `--ds-space-2` | 8px | · | `--ds-space-9` | 64px |
| `--ds-space-3` | 12px | · | `--ds-space-10` | 80px |
| `--ds-space-4` | 16px | · | `--ds-space-11` | 96px |
| `--ds-space-5` | 24px | · | `--ds-space-12` | 128px |
| `--ds-space-6` | 32px | · | | |

### Iconos

- **Material Symbols Outlined** vía `mat-icon`. `MatIconRegistry.setDefaultFontSetClass('material-symbols-outlined')` en `app.config.ts`
- `index.html` pide a Google Fonts solo los iconos usados (`icon_names=`, en orden alfabético). Tras añadir o quitar un icono: `node scripts/icons.mjs --write`. `npm run lint:css` (o `npm run lint:icons`) falla si la lista no coincide
- El script detecta `<mat-icon>nombre</mat-icon>`, `fontIcon="nombre"`, `matIcon="nombre"` y, en TypeScript, `matIcon: 'nombre'` / `matIcon = 'nombre'`. Un icono dinámico (`<mat-icon>{{ item.matIcon }}</mat-icon>`) debe leer de una propiedad `matIcon`
- Hasta que una pantalla se rediseñe, su contenido sigue con bootstrap-icons line: un solo set en el contenido de cada pantalla. Excepción de transición: el armazón (navegación lateral, barra superior, pestañas) ya usa Material Symbols en todas las pantallas
- Tamaños: 20 y 24 px; 16 px solo dentro de texto
- **PROHIBIDO**: iconos rellenos (filled), emojis decorativos en UI

### Sombras

- Suaves, teñidas de ardoise (`rgba(29, 43, 48, …)`), nunca negro puro.
- En cards: shadow-xs por defecto, shadow-md en hover.

| Token CSS | Uso |
|-----------|-----|
| `--ds-shadow-xs` | Elevación mínima (cards en reposo) |
| `--ds-shadow-sm` | Elementos ligeramente elevados |
| `--ds-shadow-md` | Hover de cards, dropdowns |
| `--ds-shadow-lg` | Popovers, paneles flotantes |
| `--ds-shadow-xl` | Modales |
| `--ds-shadow-action` | Hover del botón primario (alias legado: `--ds-shadow-gold`) |
| `--ds-focus-ring` | Foco para `box-shadow`: doble anillo superficie 2px + sapin 2px, visible sobre claro y sobre ardoise |
| `--ds-focus-outline` | Foco para `outline`: `2px solid` sapin. **Nunca** `outline: var(--ds-focus-ring)` (es sintaxis de sombra y anula el foco) |

### Motion y transiciones

- Sobrio. Un solo momento orquestado por pantalla (en la landing: el barrido del escaneo). El movimiento que responde a una acción (abrir, expandir, confirmar) sí; entradas en cascada por reflejo, no.
- Usa siempre los tokens, nunca `300ms ease` por reflejo.
- Curvas: `--ds-ease-out` (entradas, la mayoría) · `--ds-ease-in-out` (bucles, ida y vuelta).
- Duraciones: `--ds-duration-fast` (150ms) · `--ds-duration-base` (250ms) · `--ds-duration-slow` (400ms).
- Atajo: `--ds-transition-color` para hovers de color/fondo/borde.
- `prefers-reduced-motion` ya está cubierto globalmente en `tokens.css`.

### Elevación y layout (z-index, containers)

- **z-index** — usa la escala, nunca números mágicos: `--ds-z-base` (1) · `--ds-z-dropdown` (100) · `--ds-z-sticky` (200) · `--ds-z-overlay` (900) · `--ds-z-modal` (1000) · `--ds-z-toast` (1100).
- **Anchos de container**: `--ds-container-sm` (640px) · `--ds-container-md` (768px) · `--ds-container-lg` (1024px) · `--ds-container-xl` (1280px) · `--ds-container-2xl` (1440px). El `.container` heredado limita a 1200px para el contenido general.

---

## 3. Convenciones de Angular 22

### Componentes

- **SIEMPRE standalone** (sin NgModules nuevos). No escribas `standalone: true`: es el valor por defecto desde v19
- **SIEMPRE** `ChangeDetectionStrategy.OnPush`
- Usa la nueva API de signals: `input()`, `output()`, `signal()`, `computed()`, `effect()`
- **NO uses** los decoradores `@Input()` / `@Output()` para código nuevo
- Naming: `kebab-case.component.ts`

```typescript
// CORRECTO
import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  title = input.required<string>();
  price = input<number>(0);
  protected isFavorite = signal(false);
}
```

### Templates

- Usa **nuevo control flow**: `@if`, `@for`, `@switch`, `@defer`
- **NO uses** `*ngIf`, `*ngFor`, `*ngSwitch`
- `track` obligatorio en `@for`
- `@defer` para secciones pesadas o below-the-fold

```html
<!-- CORRECTO -->
@if (products().length > 0) {
  <div class="row g-4">
    @for (product of products(); track product.id) {
      <div class="col-md-4">
        <app-product-card [title]="product.title" [price]="product.price" />
      </div>
    }
  </div>
} @else {
  <p class="text-ink-muted">No hay productos disponibles.</p>
}

@defer (on viewport) {
  <app-reviews-section />
} @placeholder {
  <div class="placeholder-card"></div>
}
```

### Estilos del componente

- Un archivo `.css` por componente (NO SCSS; el único `.scss` del proyecto es el tema de Material).
- Usa siempre tokens CSS (`var(--ds-...)`), no hex sueltos.
- El selector raíz es `:host` (no el nombre del componente).

```css
/* product-card.component.css */
:host {
  display: block;
}

.product-card__title {
  font-family: var(--ds-font-display);
  font-size: var(--ds-text-2xl);
  color: var(--ds-ink);
  margin-bottom: var(--ds-space-3);
}

.product-card__price {
  font-family: var(--ds-font-display);
  color: var(--ds-ink);
  font-weight: var(--ds-weight-semibold);
}
```

---

## 4. Componentes: Angular Material y la capa de transición

### Angular Material 22 (librería de componentes)

Angular Material 22 (M3) es la librería de componentes del rediseño. Botones, campos, selects, checkboxes, menús, diálogos, snackbars, tabs y tooltips salen de Material antes que de marcado propio o de las clases heredadas.

- **Tema**: `src/styles/material-theme.scss`, el único `.scss` del proyecto. Con `use-system-variables`, los componentes leen color y tipografía de variables `--mat-sys-*`, y el tema enlaza cada rol a un token `--ds-*` (fuentes: `--ds-font-body` y `--ds-font-display`). Al cambiar los tokens, Material cambia solo: no hace falta tocar el tema.
- **Roles de color**:

| Rol M3 | Token | Dónde se ve |
|---|---|---|
| `primary` | `--ds-action` | Botón relleno (CTA), botón de texto y de contorno, foco de campos, checkbox, switch, tabs, progreso |
| `on-primary` | `--ds-on-action` | Texto e iconos sobre `primary` (6.5:1) |
| `primary-container` · `on-primary-container` | `--ds-scan` · `--ds-ink` | FAB, rango del datepicker (9.9:1) |
| `secondary-container` · `on-secondary-container` | `--ds-action-soft` · `--ds-action-ink` | Botón tonal, chips seleccionados (7.0:1) |
| `surface` · `surface-container` | `--ds-surface` | Menús, diálogos, cards |
| `surface-container-high` · `-lowest` | `--ds-surface-elevated` | Datepicker, capas elevadas |
| `surface-container-highest` | `--ds-bg-alt` | Fondo del campo `fill` |
| `surface-dim` | `--ds-stone` | Bandas |
| `on-surface` · `on-surface-variant` | `--ds-ink` · `--ds-ink-muted` | Texto · etiquetas, ayudas, iconos |
| `outline` · `outline-variant` | `--ds-ink-faint` · `--ds-border` | Borde de campos y botón de contorno (3.6:1) · divisores |
| `error` · `error-container` | `--ds-danger` · `--ds-danger-soft` | Errores de campos |
| `inverse-surface` · `inverse-primary` | `--ds-dark-surface` · `--ds-scan` | Snackbar, tooltip, acción del snackbar (menthe sobre ardoise, 9.9:1) |

  En M3 `primary` también es color de **texto**: sapin da 6.5:1 sobre blanco y 5.7:1 sobre `--ds-bg-alt`, así que sirve para las dos cosas.
- **CTA**: `mat-flat-button` es el CTA principal: relleno `primary` (sapin) y texto `on-primary` (blanco), sin ajustes en el tema. `mat-stroked-button` es el secundario y `mat-button` el de texto.
- **Formas** (en el tema): botones, campos, menús, autocomplete y snack-bar `--ds-radius-md` (6px) · tarjetas, expansion y datepicker `--ds-radius-lg` (12px) · diálogos y bottom sheet `--ds-radius-xl` (20px). Elevaciones: las de Material.
- **Imports**: cada componente standalone importa solo los módulos de Material que usa (`MatButtonModule`, `MatFormFieldModule`, `MatInputModule`…).
- **Ajustes por componente**: sobrescribe las variables `--mat-*` del componente de Material (p. ej. `--mat-button-filled-container-color`) en el CSS del componente, siempre con `var(--ds-...)`. Las variables `--mdc-*` ya no existen desde Material 20. Nunca `::ng-deep` ni selectores contra clases internas (`.mdc-*`, `.mat-mdc-*`).
- **Sin `color="primary|accent|warn"`**: en M3 ese input no cambia el color (necesitaría el mixin de compatibilidad M2). El color sale del tema.
- **No ejecutes `ng add @angular/material`**: Material ya está instalado, y el schematic añadiría Roboto, Material Icons y un tema precompilado. Los iconos Material Symbols Outlined se cargan a mano en `index.html` (ver §Iconos).
- **Animaciones**: `provideAnimations()` sigue en `app.config.ts`, pero `@angular/animations` está deprecado desde v20.2 y se eliminará en v23. En código nuevo, usa CSS, WAAPI o `animate.enter` / `animate.leave`.
- **CDK directo**: solo para comportamiento sin estilo que Material no cubre (drag & drop, virtual scroll…). El `CdkMenu` del menú ⋮ de `presentacion-videos` puede pasar a `mat-menu` cuando se rediseñe esa pantalla.

### Bootstrap (desinstalado) y `ui-base.css`

Bootstrap, `@ng-bootstrap` y Popper ya no están instalados. Las clases heredadas que las plantillas todavía usan (`.row`, `.col-*`, `.btn`, `.form-control`, `.d-flex`, `.mb-3`, `.spinner-border`…) las sirve `src/styles/ui-base.css`: solo las reglas de las clases en uso, extraídas de Bootstrap 5.3.8, en el mismo orden de cascada. `src/styles/bootstrap-overrides.css` mapea sus variables `--bs-*` a los tokens.

- **No** uses clases heredadas en código nuevo ni añadas reglas a `ui-base.css`: el CSS nuevo va en cada componente, con tokens.
- Al rediseñar una pantalla, sustituye sus clases heredadas por CSS del componente. Cuando ninguna plantilla use ya una clase, borra sus reglas de `ui-base.css` (y sus ajustes en `bootstrap-overrides.css` / `styles.css`).
- Menús, overlays, diálogos y tooltips: Angular Material (ver arriba). Nunca de vuelta a ng-bootstrap.
- Si una plantilla compone una clase heredada en ejecución (p. ej. `'text-bg-' + tipo` en el toast), esa clase debe figurar en `ui-base.css`.

Los ejemplos siguientes documentan el marcado existente: sirven de referencia durante la transición, no como patrón para código nuevo.

### Botones

```html
<!-- Primario: sapin con texto blanco. Para CTAs principales -->
<button class="btn btn-primary">Reservar</button>

<!-- Secundario: borde tinta, fondo transparente. Para acciones alternas -->
<button class="btn btn-secondary">Ver detalles</button>

<!-- Outline primario: borde sapin, fondo transparente -->
<button class="btn btn-outline-primary">Suscribirme</button>

<!-- Link con underline animado -->
<a href="#" class="btn-link">Saber más</a>
```

### Cards

```html
<div class="card">
  <div class="card-body">
    <h3 class="card-title">Título</h3>
    <p class="card-subtitle">Subtítulo</p>
    <p class="text-ink-secondary">Contenido principal.</p>
  </div>
</div>

<!-- Card premium con barra de acento superior (legado) -->
<div class="card card-premium">
  <div class="card-body">
    <span class="tag tag-gold">Destacado</span>
    <h3 class="card-title">Pieza exclusiva</h3>
  </div>
</div>
```

### Formularios

```html
<div class="mb-3">
  <label class="form-label">Nombre</label>
  <input type="text" class="form-control" placeholder="Tu nombre">
  <small class="form-text">Cómo te gustaría que te llamemos.</small>
</div>
```

---

## 5. Utilidades del sistema (en `components.css`)

Utilidades propias del sistema:

### Texto
- `.eyebrow` / `.page-eyebrow` — contexto sobre un título, en sentence case (14px, peso 500, `--ds-ink-muted`). Solo si aporta información
- `.title-editorial em` — legado: Clarté no resalta palabras sueltas en los títulos. No usar en código nuevo
- `.text-ink`, `.text-ink-secondary`, `.text-ink-muted`, `.text-gold` (legado: color de acción)
- `.font-display`, `.font-body`
- `.tracking-tight`, `.tracking-wide`, `.tracking-widest`

### Layout y secciones
- `.section`, `.section-sm`, `.section-lg` — secciones con padding generoso
- `.section-alt` — fondo `--ds-bg-alt` para secciones alternas

### Componentes
- `.tag`, `.tag-gold` — chips/etiquetas pill (`.tag-gold` es legado: tono de acción)
- `.stat`, `.stat__value`, `.stat__label` — números grandes con etiqueta
- `.divider-dot` — legado: separador con punto central
- `.link-underline` — enlace con animación de subrayado
- `.card-premium` — legado: card con barra de acento superior
- `.icon` — wrapper para SVG line (fuerza stroke, no fill)
- `.fade-up` — animación de entrada con `--delay` configurable

---

## 6. Patrones obligatorios para cada componente nuevo

Antes de cerrar un componente, verifica que:

- [ ] Es standalone con `ChangeDetectionStrategy.OnPush`
- [ ] Usa `input()` / `output()` / `signal()`, no decoradores antiguos
- [ ] Usa `@if` / `@for`, no `*ngIf` / `*ngFor`
- [ ] Tiene **dirección estética clara** (no es "genérico bonito")
- [ ] Usa tokens CSS (`var(--ds-...)`), no hex sueltos
- [ ] HTML semántico (`<button>`, `<nav>`, `<main>`, no `<div onclick>`)
- [ ] Estados visibles: hover, focus, active, disabled, loading
- [ ] Focus visible con `:focus-visible` (ya cubierto por el sistema)
- [ ] Contraste WCAG AA (4.5:1 mínimo en texto)
- [ ] Respeta `prefers-reduced-motion` (ya cubierto globalmente)
- [ ] Iconos line/stroke, no filled
- [ ] No usa emojis decorativos
- [ ] No usa fondos negros

---

## 7. Composición y layout

### Secciones

- Usa `<section class="section">` o `section-lg` para bloques de página.
- Alterna `.section-alt` con `.section` plana para crear ritmo visual.
- Limita el ancho con los tokens `--ds-container-*` (el `.container` heredado de `ui-base.css`, solo en pantallas aún no rediseñadas).

### Hero

- Alineado a la izquierda; asimetría preferida sobre composición centrada perfecta.
- Abre con lo más característico del dominio: el escaneo de una vivienda real, con sus cotas.
- Título grande + lead + un CTA primario (sapin) y, si hace falta, uno secundario. Sin eyebrow decorativo ni palabras resaltadas.
- Un solo momento de motion (el barrido del escaneo); nada de `fade-up` en cascada por reflejo.

### Páginas públicas (landing; Journal y Entrepreneurs en la fase 2)

- Solo tema claro, sin conmutador de tema ni controles flotantes. Idioma en la cabecera.
- Una sección por pantalla, como mucho seis. Copy recortado y fusionado (acordado), textos nuevos marcados para revisión.
- CSS propio del componente con tokens. De Material, solo iconos, botones de icono y `mat-menu`. Los botones propios no se llaman `.btn` (lo sirve `ui-base.css` y su `:hover` los vaciaría en táctil).
- `h1`–`h3` y `legend` heredan estilos de `ui-base.css`: en estas páginas, `color: inherit` y `legend { float: none; font-size: inherit }`.
- Fotos reales sin pie, con `NgOptimizedImage` y copias web de ≤ 800px (las originales quedan como fuente).
- En móvil, CTA fijo abajo entre el final del hero y el formulario; oculto en escritorio.

### Grids

- CSS Grid / Flexbox propios del componente (la rejilla `.row` / `.col-*` heredada, solo en pantallas aún no rediseñadas).
- Rompe la simetría a veces: columnas 5 + 7, no siempre 4-4-4.
- `gap` generoso entre items: `--ds-space-5` mínimo, `--ds-space-6` o más en secciones amplias.

---

## 8. Animación

- **Animaciones de entrada**: un solo momento orquestado por pantalla. `.fade-up` es legado; en código nuevo, CSS del componente o `animate.enter` / `animate.leave`, con los tokens `--ds-ease-*` / `--ds-duration-*`.
- **Hover en botones primarios**: cambio de color a `--ds-action-hover`; `:active` con `--ds-action-pressed` y `scale(0.98)`.
- **Hover en cards**: `box-shadow: var(--ds-shadow-md)`. Ya viene en el sistema.
- **View Transitions** del router: activarlas en `app.config.ts` con `withViewTransitions()`.
- **PROHIBIDO**: animaciones de `300ms ease` por reflejo. Usa `var(--ds-ease-out)` y duraciones de los tokens.

```typescript
// app.config.ts
import { provideRouter, withViewTransitions } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    // ...
  ]
};
```

---

## 9. Performance

- `@defer` para todo lo que no es crítico above-the-fold (modales, gráficos, mapas, secciones de footer).
- `NgOptimizedImage` para todas las imágenes.
- Signals en lugar de RxJS para estado local simple.
- Lazy load de rutas con `loadComponent`.

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'productos',
    loadComponent: () => import('./features/products/products.component')
      .then(m => m.ProductsComponent)
  }
];
```

---

## 10. Estructura de carpetas recomendada

```
src/
├── index.html              ← fuentes de Google aquí
├── styles.css              ← overrides puntuales (mantener mínimo)
├── styles/
│   ├── material-theme.scss ← tema de Angular Material (único .scss): --mat-sys-* → --ds-*
│   ├── tokens.css          ← variables del sistema
│   ├── ui-base.css         ← capa de transición: clases heredadas de Bootstrap aún en uso
│   ├── bootstrap-overrides.css ← mapea las variables --bs-* de ui-base.css a los tokens
│   └── components.css      ← utilidades propias
└── app/
    ├── core/               ← servicios singleton, interceptors, guards
    ├── shared/             ← componentes/directivas/pipes reutilizables
    │   ├── ui/             ← botones, cards, inputs, modales propios
    │   └── layout/         ← navbar, footer, shells
    ├── features/           ← funcionalidad por dominio
    │   ├── products/
    │   ├── checkout/
    │   └── account/
    └── app.config.ts
```

---

## 11. Comandos del proyecto

```bash
# Dev server
ng serve

# Build producción
ng build

# Crear componente con las reglas del proyecto
ng generate component shared/ui/button --change-detection OnPush --style css

# Tests
ng test
```

---

## 12. Lo que NUNCA hacemos en este proyecto

- Gradientes morado-rosa
- Emojis decorativos
- `*ngIf` / `*ngFor` / `*ngSwitch` en código nuevo
- Decoradores `@Input()` / `@Output()` en código nuevo
- NgModules nuevos (todo standalone)
- Componentes sin `OnPush`
- Estilos sin tokens CSS (no `color: #1A1A1A`, sí `color: var(--ds-ink)`)
- UI genérica sin postura estética
- Reinstalar Bootstrap / ng-bootstrap — componentes con Angular Material
- Otros archivos `.scss` aparte de `material-theme.scss`
- Colores fijos en Material: ni hex en las variables `--mat-*`, ni `color="primary|accent|warn"`. El color sale de los roles `--mat-sys-*`
- Clases heredadas de `ui-base.css` (`.btn`, `.row`, `.text-success`, `.bg-danger`…) en código nuevo — CSS del componente con los tokens `--ds-*`
- `z-index` con números mágicos — usa la escala `--ds-z-*`
- Sombras con valores sueltos — usa los tokens `--ds-shadow-*`
- Densidad agresiva (`padding: 0.25rem`) sin justificación

- Fondos negros (`#000`), sombras en negro puro, iconos filled
- Más de un color de acción; menthe como texto sobre fondo claro
- Etiquetas en mayúsculas espaciadas o monoespaciadas, cadenas «A · B · C», palabras resaltadas en títulos
- Radios fuera de la escala 4 / 6 / 12 / 20 / pill
- `outline: var(--ds-focus-ring)` (usa `--ds-focus-outline`)
- Tokens legados (`--ds-gold*`, `--gold`, `--ink-900`, `--bs-*`…) en código nuevo

---

## 13. Cuando pidas ayuda a una IA (Claude, Copilot, etc.)

Si trabajas con asistentes de IA en este proyecto, dales este archivo como contexto. Una buena instrucción inicial sería:

> "Trabajo en un proyecto Angular 22 con Angular Material 22 y CSS plano (Bootstrap desinstalado). Sigue las reglas de `DESIGN_GUIDELINES.md`; la identidad visual es Clarté (sapin como único color de acción, menthe para la firma del escaneo). Antes de generar código, identifica qué tokens CSS y componentes del sistema vas a usar o a cambiar. No uses gradientes morados, no uses `*ngIf`/`*ngFor`, no uses NgModules. Usa standalone components con OnPush, signals, nuevo control flow, y los tokens del sistema."
