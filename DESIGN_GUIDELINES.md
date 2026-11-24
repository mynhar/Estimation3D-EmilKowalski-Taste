# DESIGN_GUIDELINES.md

Guía de diseño y código para este proyecto. Aplica también si usas Claude Code, Copilot u otra IA para generar componentes.

> **Dirección aprobada: Lin et bronze** (23-nov-2026; sustituye a Trait rouge). Toma el diseño, la paleta y la tipografía de `agencia-inmobiliaria`. La fase 0 (base) está hecha y toda la app lleva ya la piel nueva; las fases 1–4 recomponen pantalla a pantalla (ver `design.md`). Siguen vigentes las convenciones técnicas (secciones 3–6, 9–11), el uso de tokens `var(--ds-...)` y el contraste WCAG AA.

---

## 1. Stack del proyecto

- **Framework**: Angular 22 (standalone components, signals, nuevo control flow), TypeScript 6.0
- **Estilos**: CSS plano (NO SCSS, NO Tailwind). Única excepción: `src/styles/material-theme.scss`, el tema de Material. Bootstrap desinstalado y sin capa de transición: ver sección 4
- **Componentes**: Angular Material 22 (M3) en la app y el login, con su tema enlazado a los tokens `--ds-*`: ver sección 4. Las páginas públicas usan CSS propio (CSS grid)
- **Sistema de diseño**: tokens CSS en `src/styles/tokens.css`
- **Tipografía**: Cormorant Garamond (títulos, precios, cifras) + Manrope (interfaz)
- **Iconos**: Material Symbols Outlined a peso 300 vía `mat-icon` (subconjunto en `index.html`, mantenido por `scripts/icons.mjs`) en todas las pantallas; `bootstrap-icons` desinstalado. Nunca filled
- **Visor 3D**: Matterport (iframe), con los controles de alrededor en Material

---

## 2. Identidad visual — Lin et bronze

Un despacho de arquitectura en lino y madera. Superficies de lino, una tinta espresso que escribe y actúa, y un bronce que marca lo importante sin ser botón. El público son propietarios con un problema en casa (moho, agua, amianto, aislamiento, cimientos), muchos desde el teléfono: la interfaz transmite calma y oficio, no alarma.

Reparto 60 / 30 / 10:

- **60 % lino**: fondo de página, bandas y superficies (`--ds-bg`, `--ds-bg-alt`, `--ds-band`, `--ds-surface`, `--ds-surface-bar`).
- **30 % espresso**: tinta y acción por defecto, tarjetas oscuras (`--ds-ink`, `--ds-action`, `--ds-dark-surface`).
- **10 % bronce**: acento. Progreso, entrada activa, etiquetas sobre un título, cifras grandes, la palabra en cursiva (`--ds-accent*`). Nunca el relleno de un botón.

### Paleta completa

La fuente de verdad es `src/styles/tokens.css`. Usa siempre el token, nunca el hex suelto. Contrastes WCAG 2.x calculados.

**Superficies**

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-bg` | `#F8F4ED` | Lino: fondo de página |
| `--ds-bg-alt` | `#F4EEE4` | Lino claro: hover de filas, rellenos suaves, segmentados sin elegir |
| `--ds-band` | `#ECE4D6` | Lino oscuro: bandas de sección, pistas de progreso vacías |
| `--ds-surface` | `#FFFDF9` | Vélin: tarjetas, paneles, campos, menús |
| `--ds-surface-elevated` | `#FFFDF9` | Diálogos y overlays (el mismo vélin; se distinguen por la sombra) |
| `--ds-surface-bar` | `#FBF8F2` | Crema: barra superior y lateral del armazón |
| `--ds-surface-overlay` | `rgba(251,248,242,0.92)` | Crema translúcida sobre imágenes y el visor 3D |
| `--ds-overlay` | `rgba(43,33,25,0.34)` | Backdrops (espresso) |

**Tinta / Texto**

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-ink` | `#2B2119` | Espresso: texto principal (14.4:1 sobre `--ds-bg`, 15.5:1 sobre `--ds-surface`, 12.5:1 sobre `--ds-band`) |
| `--ds-ink-secondary` | `#5C4F43` | Texto secundario (7.2:1 sobre `--ds-bg`, 6.3:1 sobre `--ds-band`) |
| `--ds-ink-muted` | `#6E6156` | Metadatos, ayudas, etiquetas en mayúsculas de grupo (5.5:1 sobre `--ds-bg`, 4.7:1 sobre `--ds-band`) |
| `--ds-ink-faint` | `#988670` | **Solo gráficos** y contorno de campos (3.2:1 sobre `--ds-bg`, 3.5:1 sobre `--ds-surface`). Nunca texto |
| `--ds-ink-inverse` | `#FBF8F2` | Texto sobre espresso (14.9:1) |

**Acción por defecto (espresso)**: botón relleno, segmento elegido, foco, checkbox, pestañas. Es el rol `primary` de Material.

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-action` | `#2B2119` | Relleno, foco (14.4:1 sobre `--ds-bg`) |
| `--ds-action-hover` | `#3D2F24` | Hover |
| `--ds-action-pressed` | `#1E1712` | Active / pressed |
| `--ds-on-action` | `#FBF8F2` | Texto sobre `--ds-action` (14.9:1) |
| `--ds-action-soft` | `#DCCBB0` | Arena: bordes de selección |
| `--ds-action-faint` | `#F3E7D8` | Bronce suave: elemento activo, chip seleccionado, lo «hecho» (espresso encima 12.9:1) |
| `--ds-action-ink` | `#7A5228` | Bronce oscuro: enlaces y texto sobre `--ds-action-faint` (6.3:1 sobre `--ds-bg`, 5.6:1 sobre `--ds-action-faint`) |

**Acento (bronce)**: marca lo importante sin ser botón.

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-accent` | `#9A6B3A` | Marcadores, barras de progreso, iconos, la palabra en cursiva. Como texto solo a 24px o más (4.2:1 sobre `--ds-bg`, 4.6:1 sobre `--ds-surface`) |
| `--ds-accent-ink` | `#7A5228` | Texto pequeño en bronce: la etiqueta sobre un título (6.3:1 sobre `--ds-bg`, 5.4:1 sobre `--ds-band`) |
| `--ds-accent-soft` | `#F3E7D8` | Fondo bronce suave, halo de la etapa actual, `::selection` |
| `--ds-accent-on-dark` | `#C79A68` | Bronce sobre espresso (6.2:1) |

**Bordes y separadores**

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-border` | `#DDD1BF` | Borde estándar de tarjetas y divisores de segmentados |
| `--ds-border-strong` | `#CBB595` | Bordes de énfasis, separadores de banda, pista del slider |
| `--ds-border-subtle` | `#EBE2D4` | Separadores muy sutiles, filas de tabla |

**Estados semánticos**. Cada base pasa AA como texto sobre lino y vélin; sobre su `-soft`, el texto va en `-ink`.

| Token CSS | Hex | `-soft` | `-ink` (texto sobre `-soft`) | Significado |
|-----------|-----|---------|------------------------------|-------------|
| `--ds-success` | `#4E7449` | `#E5ECDF` | `#3F6A3A` (5.2:1) | Salvia: lo que avanza, aceptado, firmado |
| `--ds-warning` | `#8A5E0E` | `#F7ECD5` | `#8A5E0E` (4.9:1) | Ocre: lo que pide una acción tuya |
| `--ds-danger` | `#A3442A` | `#F6E3DB` | `#A3442A` (5.0:1) | Terracota: errores, siempre con icono y texto |
| `--ds-info` | `#4F6B85` | `#E3EAF0` | `#3C5872` (6.1:1) | Pizarra: información neutra |

```css
/* Insignia de estado */
.badge--ok     { background: var(--ds-success-soft); color: var(--ds-success-ink); }
.badge--select { background: var(--ds-action-faint); color: var(--ds-action-ink); border-color: var(--ds-action-soft); }
```

**Superficies oscuras** (tarjeta de la siguiente etapa, panel del login, grabador de vídeo, visor 3D)

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-dark-surface` | `#2B2119` | Espresso |
| `--ds-dark-surface-deep` | `#1E1712` | Espresso profundo: fondo del visor 3D |
| `--ds-ink-inverse-muted` | `#CFC4B4` | Texto secundario sobre oscuro (9.2:1 sobre espresso) |
| `--ds-danger-on-dark` · `-hover` | `#F6B3A5` · `#F9CBC0` | Error o acción de peligro sobre oscuro (8.9:1) |
| `--ds-scan-bg` | `#16110D` | Fondo de las imágenes de escaneo (vienen sobre negro) |

Sobre espresso: texto `--ds-ink-inverse`, acento `--ds-accent-on-dark`, botón relleno crema con texto espresso, foco `--ds-focus-ring-dark`. Ejemplo completo: la barra, la burbuja y la ventana flotante de `grabador-video.component.css`.

**Ajustes frente a la referencia** (para pasar AA): texto apagado `#968878` → `#6E6156`; bronce en texto pequeño `#9A6B3A` → `#7A5228`; error `#B4553A` → `#A3442A`; borde de campo `#DDD1BF` → `#988670`; aviso `#93650F` → `#8A5E0E`.

**Tokens retirados**

| Ya no existe | Usa |
|--------------|-----|
| `--ds-cta` · `-hover` · `-pressed` · `--ds-on-cta` | `--ds-action` · `-hover` · `-pressed` · `--ds-on-action` |
| `--ds-mark` | `--ds-accent` (marcadores) |
| `--ds-stretch-*` (anchos de Archivo) | nada: dos familias, Cormorant y Manrope |
| clase `.ds-cta` | `mat-flat-button` sin clase |
| `--ds-gold*`, `--gold`, `--bs-*`, `--ds-text-xs`… (legado anterior) | sus equivalentes `--ds-action*`, `--ds-text-sm`… |

`node scripts/validate-ds-tokens.mjs` señala cualquier `var(--ds-*)` que no esté definido.

### Reglas de color

- **Espresso es la acción por defecto**: botón relleno, segmento elegido, foco, selección. Los enlaces van en bronce oscuro (`--ds-action-ink`) con subrayado y pasan a espresso al pasar.
- **El bronce marca, no actúa**: nunca relleno de botón. Como texto, `--ds-accent` solo a 24px o más; en pequeño, `--ds-accent-ink`.
- **El error es terracota**: `--ds-danger`, siempre con icono y texto.
- Texto sobre fondo `-soft` / `-faint` → su `-ink` (`--ds-success-ink`, `--ds-action-ink`…).
- **PROHIBIDO** usar tokens de borde (`--ds-border*`, `--ds-action-soft`) como color de texto o icono: texto → `--ds-ink-muted`, adorno → `--ds-ink-faint`.
- **PROHIBIDO** fondos negros (`#000`), sombras `rgba(0,0,0,…)`, gradientes decorativos (en especial morado-rosa) y la combinación amarillo/negro de señal de peligro.
- **PROHIBIDO** los colores por defecto de Bootstrap (azul `#0d6efd`, gris `#6c757d`) o de cualquier librería: todo color sale de un token.

### Tipografía

Dos familias, bien distintas:

| Rol | Familia | Peso | Dónde |
|-----|---------|------|-------|
| Título | Cormorant Garamond (`--ds-font-display`) | `--ds-weight-semibold` (600) | `h1`–`h6`, títulos de pantalla, sección, tarjeta y diálogo |
| Cifra | Cormorant Garamond | 500–600 | Precios, horas, porcentajes, KPI; siempre con `font-variant-numeric: lining-nums tabular-nums` |
| Palabra en cursiva | Cormorant Garamond itálica | 500–600, `--ds-accent` | **Solo** el saludo del dashboard y los títulos de la landing; una palabra, ≥ 24px |
| Interfaz | Manrope (`--ds-font-body`) | 400 / 500 / 600 / 700 / 800 | Texto, botones, formularios, navegación |
| Etiqueta en mayúsculas | Manrope | 700, `--ds-text-label` (12px), `--ds-tracking-label` (0.2em) | Grupos de navegación, cabeceras de tabla, etiquetas de KPI (`--ds-ink-muted`); etiqueta sobre un título (`--ds-accent-ink`) |

- Cormorant trae **cifras de estilo antiguo** por defecto: toda cifra lleva `lining-nums tabular-nums`. En Manrope no cambia nada.
- `h1`–`h6` globales (`src/styles/base.css`) van en Cormorant 600, espresso, `--ds-leading-tight`, `--ds-tracking-tight` y `lining-nums` («3D» o «2026» en un título no bailan). Cada pantalla fija el tamaño de sus títulos en el CSS del componente. Un texto en Cormorant que no es título (marca, cifra, `<p>` grande) pone `lining-nums` en su componente.
- `body` lleva `font-feature-settings: "ss01", "cv11"` (las variantes de Manrope de la referencia).
- **Sentence case** en títulos, botones y texto corrido. Las mayúsculas son solo de las etiquetas, y por CSS (`text-transform: uppercase`), nunca escritas así en i18n.
- «·» permitido en líneas de metadatos (`Dossier E3D-014 · étape 4 sur 6`).
- **Monoespaciada**: no hay de marca. `--ds-font-mono` es la del sistema, solo para código o identificadores técnicos.

**Familias**

| Token CSS | Valor |
|-----------|-------|
| `--ds-font-display` | `'Cormorant Garamond', 'Cormorant', Georgia, 'Times New Roman', serif` |
| `--ds-font-body` | `'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif` |
| `--ds-font-mono` | `ui-monospace, 'SF Mono', Menlo, Consolas, monospace` |

`index.html` carga Cormorant Garamond 500/600/700 e itálica 500/600, y Manrope 400–800.

**Escala tipográfica** (base 16px). **Mínimo 14px para leer**; `--ds-text-label` (12px) solo en etiquetas en mayúsculas, nunca en texto corrido.

| Token CSS | Tamaño | px | Uso típico |
|-----------|--------|----|----|
| `--ds-text-label` | `0.75rem` | 12px | Etiquetas en mayúsculas |
| `--ds-text-sm` | `0.875rem` | 14px | Mínimo: captions, texto auxiliar |
| `--ds-text-base` | `1rem` | 16px | Cuerpo |
| `--ds-text-lg` | `1.125rem` | 18px | Lead, cuerpo en escritorio |
| `--ds-text-xl` | `1.375rem` | 22px | h5 |
| `--ds-text-2xl` | `1.75rem` | 28px | h4, título de tarjeta y de diálogo |
| `--ds-text-3xl` | `2.25rem` | 36px | h3 |
| `--ds-text-4xl` | `3rem` | 48px | h2 |
| `--ds-text-5xl` | `4rem` | 64px | h1 |
| `--ds-text-display` | `5.5rem` | 88px | Hero |

Excepción conocida: la etiqueta flotante de los campos de Material se escala al 75 % (12px) y Material no ofrece token oficial para cambiarlo. Las ayudas y errores de los campos sí van a 14px (tema).

**Pesos**: `--ds-weight-regular` (400) · `--ds-weight-medium` (500) · `--ds-weight-semibold` (600, títulos en Cormorant) · `--ds-weight-bold` (700) · `--ds-weight-black` (800, solo Manrope: Cormorant llega a 700).

**Interlineado**: `--ds-leading-tight` (1.1, títulos) · `--ds-leading-snug` (1.25) · `--ds-leading-normal` (1.5, cuerpo) · `--ds-leading-relaxed` (1.65)

**Tracking**: `--ds-tracking-tight` (-0.005em, títulos en Cormorant) · `--ds-tracking-normal` (0) · `--ds-tracking-wide` (0.04em) · `--ds-tracking-label` (0.2em, etiquetas en mayúsculas)

### Bordes y radios

Jerarquía, no un radio para todo:

- **Botones, segmentados, chips, búsqueda**: píldora (`var(--ds-radius-pill)`)
- **Campos, elementos de lista, avisos en línea**: `10px` (`var(--ds-radius-md)`)
- **Tarjetas, menús, snack-bar**: `14px` (`var(--ds-radius-lg)`)
- **Hojas y diálogos**: `20px` (`var(--ds-radius-xl)`)
- **Insignias pequeñas**: `6px` (`var(--ds-radius-sm)`)
- **PROHIBIDO**: radios fuera de esta escala

| Token CSS | Valor | Uso |
|-----------|-------|-----|
| `--ds-radius-none` | `0` | Sin redondeo |
| `--ds-radius-sm` | `6px` | Insignias, elementos compactos |
| `--ds-radius-md` | `10px` | Campos, elementos de lista |
| `--ds-radius-lg` | `14px` | Tarjetas, menús |
| `--ds-radius-xl` | `20px` | Hojas, diálogos |
| `--ds-radius-pill` | `999px` | Botones, segmentados, chips |
| `--ds-radius-circle` | `50%` | Avatares, puntos |

### Espaciado

- Generoso, no aglomerar.
- Secciones: `padding-block: 4rem` mínimo, `6-8rem` en hero o secciones destacadas.
- Cards: `padding: 2rem` mínimo en body (1.5rem en móvil).
- Usa los tokens `--ds-space-*` (escala de 4px hasta 128px).

| Token | px | Token | px |
|-------|----|-------|----|
| `--ds-space-0` | 0 | `--ds-space-7` | 40px |
| `--ds-space-1` | 4px | `--ds-space-8` | 48px |
| `--ds-space-2` | 8px | `--ds-space-9` | 64px |
| `--ds-space-3` | 12px | `--ds-space-10` | 80px |
| `--ds-space-4` | 16px | `--ds-space-11` | 96px |
| `--ds-space-5` | 24px | `--ds-space-12` | 128px |
| `--ds-space-6` | 32px | | |

### Iconos

- **Material Symbols Outlined** a peso 300 (`opsz,wght,FILL,GRAD@24,300,0,0` en `index.html`) vía `mat-icon`. `MatIconRegistry.setDefaultFontSetClass('material-symbols-outlined')` en `app.config.ts`
- `index.html` pide a Google Fonts solo los iconos usados (`icon_names=`, en orden alfabético). Tras añadir o quitar un icono: `node scripts/icons.mjs --write`. `npm run lint:css` (o `npm run lint:icons`) falla si la lista no coincide
- El script detecta `<mat-icon>nombre</mat-icon>`, `fontIcon="nombre"`, `matIcon="nombre"` y, en TypeScript, `matIcon: 'nombre'` / `matIcon = 'nombre'`. Un icono dinámico (`<mat-icon>{{ item.matIcon }}</mat-icon>`) debe leer de una propiedad `matIcon`
- Un icono que cambia con el estado (pausa / reanudar, ampliar / reducir) se escribe en dos ramas `@if` estáticas, cada una con su `<mat-icon>`: el script las ve y, dentro de un `mat-button`, cada rama tiene un solo nodo raíz (sin el error NG8011). El texto del botón va fuera del `@if`
- Icono que depende de un dato (tipo de evento, estado, tono de un aviso): un mapa en el componente, `{ clave: { matIcon: 'nombre' } }`, y en la plantilla `<mat-icon>{{ MAPA[clave].matIcon }}</mat-icon>`. Nunca un ternario con nombres de icono (`cond ? 'check' : 'close'`): el script no lo ve y el icono sale como texto
- Tamaños: 20 y 24 px; 16 px solo dentro de texto
- **PROHIBIDO**: iconos rellenos (filled), emojis decorativos en UI

### Sombras

- Suaves, teñidas de madera (`rgba(60, 40, 20, …)`), nunca negro puro.
- En cards: shadow-xs por defecto, shadow-md en hover.

| Token CSS | Uso |
|-----------|-----|
| `--ds-shadow-xs` | Elevación mínima (cards en reposo) |
| `--ds-shadow-sm` | Elementos ligeramente elevados |
| `--ds-shadow-md` | Hover de cards, dropdowns |
| `--ds-shadow-lg` | Popovers, paneles flotantes |
| `--ds-shadow-xl` | Modales |
| `--ds-shadow-action` | Hover del botón relleno |
| `--ds-focus-ring` | Foco para `box-shadow`: doble anillo superficie 2px + espresso 2px |
| `--ds-focus-ring-dark` | Foco sobre espresso: anillo espresso 2px + crema 2px |
| `--ds-focus-outline` | Foco para `outline`: `2px solid` espresso. **Nunca** `outline: var(--ds-focus-ring)` (es sintaxis de sombra y anula el foco) |

### Motion y transiciones

- Sobrio. El movimiento que responde a una acción (abrir, expandir, confirmar, cambiar de paso) sí; entradas en cascada por reflejo, no. La landing puede tener un único momento orquestado.
- Usa siempre los tokens, nunca `300ms ease` por reflejo.
- Curvas: `--ds-ease-out` (`cubic-bezier(0.2, 1, 0.3, 1)`, entradas, la mayoría) · `--ds-ease-in-out` (bucles, ida y vuelta).
- Duraciones: `--ds-duration-fast` (150ms) · `--ds-duration-base` (250ms) · `--ds-duration-slow` (400ms).
- Atajo: `--ds-transition-color` para hovers de color/fondo/borde.
- `prefers-reduced-motion` ya está cubierto globalmente en `tokens.css`.

### Elevación y layout (z-index, containers)

- **z-index** — usa la escala, nunca números mágicos: `--ds-z-base` (1) · `--ds-z-dropdown` (100) · `--ds-z-sticky` (200) · `--ds-z-overlay` (900) · `--ds-z-modal` (1000) · `--ds-z-toast` (1100).
- **Anchos de container**: `--ds-container-sm` (640px) · `--ds-container-md` (768px) · `--ds-container-lg` (1024px) · `--ds-container-xl` (1280px) · `--ds-container-2xl` (1440px).

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

## 4. Componentes: Angular Material y estilos globales

### Angular Material 22 (librería de componentes)

Angular Material 22 (M3) es la librería de componentes del rediseño. Botones, campos, selects, checkboxes, menús, diálogos, snackbars, tabs y tooltips salen de Material antes que de marcado propio o de las clases heredadas.

- **Tema**: `src/styles/material-theme.scss`, el único `.scss` del proyecto. Con `use-system-variables`, los componentes leen color y tipografía de variables `--mat-sys-*`, y el tema enlaza cada rol a un token `--ds-*` (fuentes: `--ds-font-body` y `--ds-font-display`). Al cambiar los tokens, Material cambia solo: no hace falta tocar el tema.
- **Roles de color**:

| Rol M3 | Token | Dónde se ve |
|---|---|---|
| `primary` | `--ds-action` | Botón relleno, botón de texto y de contorno, foco de campos, checkbox, switch, tabs, progreso |
| `on-primary` | `--ds-on-action` | Texto e iconos sobre `primary` (14.9:1) |
| `primary-container` · `on-primary-container` | `--ds-action-faint` · `--ds-action-ink` | FAB, rango del datepicker (5.6:1) |
| `secondary-container` · `on-secondary-container` | `--ds-action-faint` · `--ds-action-ink` | Botón tonal, chips seleccionados, elemento activo de listas y navegación (5.6:1) |
| `primary-fixed-dim` · `secondary-fixed-dim` | `--ds-action-soft` | Variantes fijas |
| `tertiary` · `tertiary-container` | `--ds-info` · `--ds-info-soft` | Acentos informativos |
| `background` | `--ds-bg` | Fondo de la app (`.mat-app-background`) |
| `surface` · `surface-container` · `-low` | `--ds-surface` | Menús, diálogos, cards |
| `surface-container-high` · `-lowest` · `surface-bright` | `--ds-surface-elevated` | Datepicker, capas elevadas |
| `surface-container-highest` · `surface-variant` | `--ds-bg-alt` | Fondo del campo `fill` |
| `surface-dim` | `--ds-band` | Bandas |
| `on-surface` · `on-surface-variant` | `--ds-ink` · `--ds-ink-muted` | Texto · etiquetas, ayudas, iconos |
| `outline` · `outline-variant` | `--ds-ink-faint` · `--ds-border` | Borde de campos y botón de contorno (3.5:1 sobre vélin) · divisores |
| `error` · `error-container` | `--ds-danger` · `--ds-danger-soft` | Errores de campos |
| `inverse-surface` · `inverse-on-surface` · `inverse-primary` | `--ds-dark-surface` · `--ds-ink-inverse` · `--ds-action-faint` | Snackbar, tooltip; acción del snackbar en bronce suave sobre espresso |

  En M3 `primary` también es color de **texto**: el espresso da 14.4:1 sobre lino y 15.5:1 sobre vélin, así que sirve para las dos cosas. **El bronce no es un rol de acción**: es acento y sale de `--ds-accent*` en el CSS del componente.
- **Botones**:

| Botón | Marcado | Cuándo |
|---|---|---|
| Relleno (espresso) | `<button mat-flat-button>` | Acción principal de la vista o de un grupo, confirmar en un diálogo |
| Secundario | `<button mat-stroked-button>` | Alternativas, el que acompaña al relleno |
| Texto | `<button mat-button>` | Acciones terciarias, cancelar, volver |

  Los tres son píldora y sus colores están fijados en `:root` del tema (`--mat-button-filled-container-color: var(--ds-action)`, `--mat-button-outlined-outline-color: var(--ds-ink-faint)`, texto espresso en contorno y texto). No repliques esos colores en el CSS de los componentes. El bronce nunca rellena un botón.
- **Formas** (en el tema): botones y segmentados `--ds-radius-pill` · campos `--ds-radius-md` (10px) · tarjetas, expansion, menús, autocomplete, snack-bar y datepicker `--ds-radius-lg` (14px) · diálogos y bottom sheet `--ds-radius-xl` (20px). Elevaciones: las de Material.
- **Tipografía** (en el tema): Manrope en todos los componentes; el título de los diálogos en Cormorant 600 a `--ds-text-2xl` (`--mat-dialog-subhead-*`).
- **Campos**: ayudas y errores a 14px (`--mat-form-field-subscript-text-size` en el tema). Excepción conocida: la etiqueta flotante se queda en 12px (Material la escala al 75 % y no ofrece token oficial).
- **Imports**: cada componente standalone importa solo los módulos de Material que usa (`MatButtonModule`, `MatFormFieldModule`, `MatInputModule`…).
- **Ajustes por componente**: sobrescribe las variables `--mat-*` del componente de Material (p. ej. `--mat-button-filled-container-color`) en el CSS del componente, siempre con `var(--ds-...)`. Las variables `--mdc-*` ya no existen desde Material 20. Nunca `::ng-deep` ni selectores contra clases internas (`.mdc-*`, `.mat-mdc-*`).
- **Sin `color="primary|accent|warn"`**: en M3 ese input no cambia el color (necesitaría el mixin de compatibilidad M2). El color sale del tema.
- **`mat-button-toggle` con solo icono**: el nombre accesible va con el input `[aria-label]`. Con `[attr.aria-label]` el atributo se queda en el host y el botón interno se anuncia por la ligadura del icono («grid_view»).
- **Etiquetas solo para lector de pantalla**: clase `cdk-visually-hidden` (estilos del CDK, ya cargados por Material).
- **No ejecutes `ng add @angular/material`**: Material ya está instalado, y el schematic añadiría Roboto, Material Icons y un tema precompilado. Los iconos Material Symbols Outlined se cargan a mano en `index.html` (ver §Iconos).
- **Animaciones**: `provideAnimations()` ya no está en `app.config.ts` (Material 22 no lo necesita) y `@angular/animations` está deprecado desde v20.2; se eliminará en v23. En código nuevo, usa CSS, WAAPI o `animate.enter` / `animate.leave`.
- **CDK directo**: solo para comportamiento sin estilo que Material no cubre (drag & drop, virtual scroll…). Los menús son `mat-menu` (el ⋮ de `presentacion-videos` ya lo es; un ítem destructivo ajusta `--mat-menu-item-label-text-color` y `--mat-menu-item-icon-color` a `--ds-danger-ink`).
- **Dentro de un `<dialog>` nativo modal** (grabador, biblioteca de vídeos): nada que abra un overlay del CDK (`mat-select`, `mat-menu`, `matTooltip`), porque el overlay queda debajo del top layer del diálogo. Para elegir de una lista, `<select matNativeControl>` dentro de `mat-form-field`; para ayudas, `title`. `matInput`, `mat-slide-toggle` y `mat-button-toggle` sí funcionan.
- **Destructivo irreversible** (eliminar un vídeo, descartar una grabación, borrar un contrato): `mat-flat-button` con `--mat-button-filled-container-color: var(--ds-danger)`, texto y capa de estado `--ds-surface`, siempre con icono y texto.
- **Campos**: `appearance="outline"` y `subscriptSizing="dynamic"` cuando el campo no tiene ayuda fija (el hueco del error solo aparece con el error). Fecha y hora llevan siempre la etiqueta flotada (el control nativo muestra su formato).
- **Slider**: la pista inactiva por defecto no se ve sobre vélin; ajústala con `--mat-slider-inactive-track-color: var(--ds-border-strong)` y alturas de 6px (`--mat-slider-active-track-height`, `--mat-slider-inactive-track-height`).
- **`mat-button-toggle-group` como filtro**: segmentado píldora, `hideSingleSelectionIndicator`, el recuento dentro de la opción (con `lining-nums tabular-nums`, hereda el color), seleccionado en espresso con texto crema (global, en el tema; no lo sobrescribas). En móvil, si no caben, rejilla con `--mat-button-toggle-divider-color: transparent`, `border: 0` en el grupo y borde y radio píldora en cada `mat-button-toggle`.

### Estilos globales: `base.css` y nada más

Bootstrap, `@ng-bootstrap`, Popper y `bootstrap-icons` ya no están instalados, y la capa de transición (`ui-base.css`, `bootstrap-overrides.css`) se borró al cerrar la fase 4. Los estilos globales, en este orden (`angular.json`, build y test):

1. `src/styles/material-theme.scss`: el tema de Material (roles `--mat-sys-*` → `--ds-*`, formas, colores de botones y segmentados).
2. `src/styles/base.css`: reboot de **elementos** (box-sizing, márgenes de `p`, títulos y listas, `h1`–`h6` en Cormorant 600 con `lining-nums`, enlaces en bronce oscuro, controles que heredan la fuente, `[hidden]`…). Solo selectores de elemento, sin clases.
3. `src/styles/tokens.css`: los tokens `--ds-*`, la base de `html` / `body`, `::selection` y el corte global de animaciones con reduced motion.
4. `src/styles/components.css`: solo `.page-wrapper`, el margen de las pantallas de la app.
5. `src/styles.css`: solo lo que vive fuera de cualquier componente (`.e3d-viewer-pane`, el panel del visor en el overlay del CDK).

- **No** añadas clases a estos archivos: el CSS de cada pantalla va en su componente, con tokens. Lo que comparten varias pantallas va en una hoja compartida (ver §5).
- Menús, overlays, diálogos y tooltips: Angular Material (ver arriba). Nunca de vuelta a ng-bootstrap.
- Una clase compuesta en ejecución (`'is-' + tipo`) se define en el CSS del mismo componente, como en `components/toast`.

---

## 5. Hojas compartidas de pantalla

No hay utilidades globales (`.eyebrow`, `.tag`, `.stat`, `.section`… ya no existen). Cuando varias pantallas comparten estructura, la comparten con una hoja CSS que cada componente incluye antes de la suya:

```ts
styleUrls: ['../../../shared/ui/lista/lista.css', './list.component.css'],
```

Cada hoja lleva un prefijo propio y documenta en su cabecera los estados, el contraste y la escala que cubre. El componente añade solo lo suyo, con su propio prefijo.

| Hoja | Prefijo | Para |
|------|---------|------|
| `shared/ui/lista/lista.css` | `ls-` | Listas de los roles internos: búsqueda, filtros en `mat-button-toggle` con su recuento (`ls-filter`, `.is-grid` y `.is-wide` en móvil), conmutador tarjetas / tabla, tarjetas con el título como enlace estirado, tabla con fila pulsable, esqueleto, vacío, error |
| `shared/ui/alta/alta.css` | `fc-` | Alta y edición de dossier (cliente, estimador, admin): secciones numeradas, rejilla de campos, tipo de bien en radios-tarjeta, raíl con resumen, envío y qué falta. Base de los formularios de catálogo |
| `shared/ui/ficha/ficha.css` | `fi-` | Ficha de dossier del estimador y del admin: volver + título + meta, dos columnas desde 1100px, datos en `<dl>`, fotos, archivos en filas, tours, zona de subida `fi-drop`, pestañas `fi-tabs` (`mat-tab-nav-bar`), confirmación en línea |
| `shared/construction-monitoring/obras-lista.css` | `cml-` | Listas de obras del contratista, del estimador y del admin |
| `public-site/styles/site-base.css` · `site-blocks.css` | sin prefijo (`.wrap`, `.button`, `.sec`…) | Páginas públicas (ver §7) |
| `admin/_shared/catalogo-lista.css` | `cl-` | Complemento de `lista.css` para tipos de servicio, fichas normativas e imprevistos |
| `admin/_shared/catalogo-form.css` | `cf-` | Complemento de `alta.css` para sus altas y ediciones: `cf-config` (campo + orden), `cf-toggles`, `cf-del` y la confirmación `cf-danger` |

Los estilos de Angular se encapsulan por componente: una hoja compartida solo alcanza la plantilla de los componentes que la incluyen, nunca la de un hijo (y sin `::ng-deep`).

---

## 6. Patrones obligatorios para cada componente nuevo

Antes de cerrar un componente, verifica que:

- [ ] Es standalone con `ChangeDetectionStrategy.OnPush`
- [ ] Usa `input()` / `output()` / `signal()`, no decoradores antiguos
- [ ] Usa `@if` / `@for`, no `*ngIf` / `*ngFor`
- [ ] Tiene **dirección estética clara** (no es "genérico bonito")
- [ ] Usa tokens CSS (`var(--ds-...)`), no hex sueltos
- [ ] Espresso para la acción; el bronce marca y nunca rellena un botón (como texto pequeño, `--ds-accent-ink`)
- [ ] Cifras (precios, medidas, KPI) en Cormorant con `lining-nums tabular-nums`
- [ ] Texto ≥ 14px (12px solo en etiquetas en mayúsculas)
- [ ] HTML semántico (`<button>`, `<nav>`, `<main>`, no `<div onclick>`)
- [ ] Estados visibles: hover, focus, active, disabled, loading
- [ ] Focus visible con `:focus-visible` y `--ds-focus-ring` / `--ds-focus-outline` (los componentes de Material ya lo traen; lo propio va en el CSS del componente)
- [ ] Contraste WCAG AA (4.5:1 mínimo en texto)
- [ ] Respeta `prefers-reduced-motion` (ya cubierto globalmente)
- [ ] Iconos line/stroke, no filled
- [ ] No usa emojis decorativos
- [ ] No usa fondos negros

---

## 7. Composición y layout

### Secciones

- Cada pantalla define sus secciones en su CSS; en la app, dentro de `.page-wrapper`. En las páginas públicas, `.sec` de `site-base.css` (`--band` para lino oscuro, `--dark` para la isla espresso).
- Alterna la banda de lino oscuro con el lino para dar ritmo.
- Limita el ancho con los tokens `--ds-container-*`.

### Hero

- Alineado a la izquierda; asimetría preferida sobre composición centrada perfecta.
- Abre con lo más característico del dominio: el escaneo de una vivienda real.
- Título grande en Cormorant (en la landing puede llevar una palabra en cursiva bronce) + lead + el botón relleno de la acción principal y, si hace falta, uno secundario de contorno o un enlace.
- Como mucho un momento orquestado; nada de entradas en cascada por reflejo.
- **Hero de la landing** (`landing-page.component.*`): etiqueta en mayúsculas (`landing.hero.eyebrow`), el `h1` en tres `.hero__line` (una por parte de i18n) con la última en `.acc` (cursiva bronce), lead, «Créer mon dossier» (`.button`) y «Voir le processus» (`.button--outline`); a la derecha, el escaneo en una isla `--ds-scan-bg` de 20px. El momento al cargar: cada línea sube dentro de su máscara (`overflow: clip` con holgura para acentos, descendentes y la cursiva; 900ms, 90ms entre líneas) y el escaneo aparece y se mece ±5° (28s por vaivén, `--ds-ease-in-out`, a sangre con `scale(1.1)` para que no asomen las esquinas).

### Páginas públicas (landing, Le Journal, Entrepreneurs)

- Solo tema claro, sin conmutador de tema ni controles flotantes. Idioma en la cabecera.
- Una cabecera y un pie para las tres: `app-site-header` (`pagina="inicio|journal|entrepreneurs"`, `[ctaRelleno]`) y `app-site-footer` (`[enInicio]`), en `public-site/chrome/`. CSS común en `public-site/styles/`: `site-base.css` (contenedor `.wrap`, `.button`, `.link`, marca, `.sec` / `--band` / `--rule` / `--dark`, `.crumbs`) y `site-blocks.css` (`.step`, `.svc`, `.fm` / `.fld` / `.chip`). Cada página pone su `:host` (fondo, tipografía y `--hd-h`).
- Una sección por pantalla, como mucho seis. Copy recortado y fusionado (acordado), textos nuevos marcados para revisión.
- CSS propio del componente con tokens y CSS grid; pulido de interacción y motion con las skills de Emil Kowalski. De Material, solo iconos, botones de icono y `mat-menu`. Los botones propios son `.button` (píldora espresso) y `.button--outline` de `site-base.css`.
- `h1`–`h3` y `legend` heredan el reboot de `base.css` (color, flotado y tamaño de `legend`): en estas páginas, `color: inherit` y `legend { float: none; font-size: inherit }`.
- Fotos reales sin pie, con `NgOptimizedImage` y copias web de ≤ 800px (las originales quedan como fuente).
- En móvil, CTA fijo abajo entre el final del hero y el formulario; oculto en escritorio.
- Un solo botón relleno a la vista con la misma acción. Si aparece en la cabecera y en el hero, la de la cabecera va de contorno mientras el hero se ve y pasa a relleno cuando queda sola. En Entrepreneurs lo principal es postular: «Créer mon dossier» de la cabecera va siempre de contorno (`[ctaRelleno]="false"`).
- Sobre la isla espresso (`.sec--dark`) el botón es crema (`.button--light`, definido en `entrepreneurs.component.css`).
- Acordeón de preguntas (FAQ): `h3` > `button` con `aria-expanded` / `aria-controls`; respuesta `role="region"` con `aria-labelledby`, `inert` mientras está cerrada y altura animada con `grid-template-rows: 0fr → 1fr` (sin medir el DOM).
- Francés: espacio de no separación (`\u00a0`) antes de `? ! : ;` en los textos de i18n.
- Marca: `<app-brand-mark class="brand__mark" />` + `.brand__name` (Cormorant 600, 28px). `site-base.css` solo fija su tamaño (`--bm-size: 36px`). La página actual de la cabecera va subrayada en bronce (`--ds-accent`).
- Cursiva bronce: el hero y «tout» del título del proceso. No la pongas en más títulos.

### Armazón de la app (`app.component.*`)

- Barra superior `.tb` fija en todos los anchos: `--ds-surface-overlay` + `backdrop-filter: blur(14px) saturate(1.1)`, filete `--ds-border-subtle`, alto `--tb-h` (64px; 56px en móvil). Marca (`app-brand-mark` + «Estimation3D» + espacio del rol en mayúsculas, `nav.espace_<rol>`; el espacio se oculta por debajo de 360px), idiomas (`app-lang-toggle` en escritorio, `mat-menu` en móvil) y la cuenta: un botón con nombre, rol y avatar que abre un `mat-menu` (perfil y salir).
- Barra lateral `.sb` en `--ds-bg-alt` bajo la barra superior: títulos de grupo en mayúsculas; entrada de 40px, 14px, peso 500, `--ds-ink-secondary`; la activa en tarjeta vélin (`--ds-shadow-xs` + filete interior `--ds-border-subtle`), peso 700, icono en bronce y una barra bronce de 2px a la izquierda (`::before`). Plegable (`--sb-w` 248px / 76px).
- Móvil (< 992px): cajón lateral para los roles internos; el cliente tiene `.tabs` abajo (crema translúcida con desenfoque; la elegida con el icono en una píldora `--ds-action-faint` / `--ds-action-ink`) y la hoja «Plus» (`mat-bottom-sheet`). Cada `NavItem` de las pestañas puede llevar `corta` (`nav.tab_*`): cuatro pestañas tienen que caber a 375px en los tres idiomas.
- Un contenido fijo arriba bajo la barra (p. ej. una columna `sticky`) usa `top: calc(var(--tb-h) + …)`.

### Cabecera de pantalla y cifras

- `app-page-header`: `etiqueta` (mayúsculas, `--ds-accent-ink`, sobre el título), `titulo` (h1 Cormorant 600, 28–44px), `contexto` (línea de metadatos `--ds-ink-muted`, con «·» si junta datos) y las acciones proyectadas con `actions`. `enfasis` pinta una palabra final en cursiva bronce y es **solo** para el saludo del dashboard del cliente («Bonjour, *Marie*»).
- Tarjeta de la siguiente etapa (dashboard del cliente): `--ds-dark-surface`, etiqueta en `--ds-accent-on-dark`, título Cormorant 28–36px en crema, texto `--ds-ink-inverse-muted`, `mat-flat-button` crema (`--mat-button-filled-container-color: var(--ds-ink-inverse)`, texto espresso) y `--ds-focus-ring: var(--ds-focus-ring-dark)` en el contenedor.
- Cifras (KPI): rejilla en una tarjeta vélin, celdas separadas por `--ds-border-subtle`; rótulo en mayúsculas `--ds-ink-muted` arriba y la cifra abajo (`align-content: space-between`, para que dos rótulos de distinta altura no desalineen las cifras), Cormorant 600 a 40px con `lining-nums tabular-nums`; la unidad en Manrope 14px `--ds-ink-muted`.

### Visor de medios (`shared/ui/media-viewer`)

- `abrirVisor(dialog, { tipo, url, titulo, medios?, contexto? })`. `medios` (todos los del dossier) añade el segmentado «Tour 3D / Vidéo»; `contexto` (`{ numero, etapa, ruta }`) añade «EXP-… · Étape n sur 6» y «Voir le dossier». `app-tour-poster` acepta los mismos `[medios]` y `[contexto]`.
- Escena a pantalla completa (`100dvh`, panel `.e3d-viewer-pane` sin forma ni sombra) sobre `--ds-dark-surface-deep`; los controles flotan en `.mv-glass` (crema translúcida, `blur(16px)`, `--ds-shadow-lg`) y respetan `safe-area-inset-*`: barra arriba (volver, título, tipo · número, ⓘ y pantalla completa solo si `document.fullscreenEnabled`), segmentado debajo y la hoja del tour abajo, al alcance del pulgar (se abre la primera vez; ⓘ la reabre).

### Formularios largos en móvil (pasos)

- Por debajo de 768px, un formulario de más de una pantalla se parte en pasos (la landing: 3). Cada paso tiene título (`h3`, `tabindex="-1"`) con «Étape n sur N» (`stage.step_of`) y una barra de N tramos en bronce, decorativa (`aria-hidden`): el paso lo dice el texto.
- «Continuer» es el botón relleno (`type="submit"`, así Intro también avanza) y valida solo los campos del paso: si falta algo, marca los errores y lleva el foco al primero. «Retour» es un botón de texto.
- Al cambiar de paso: foco en el título del paso nuevo y, si el formulario quedó por encima, scroll instantáneo bajo la cabecera (`scroll-margin-top`, `overflow-anchor: none`). El movimiento lo pone la entrada del paso (24px y opacidad, 240ms, `--ds-ease-out`, desde el lado hacia el que se avanza).
- Todos los pasos siguen en el DOM con `[hidden]`: lo escrito se conserva, el resumen de campos faltantes lee sus etiquetas y, si al enviar falta algo de un paso anterior, se vuelve a ese paso con el foco en el campo.
- Desde 768px, todos los grupos a la vez, cada uno con su título.

### Placeholders y ayudas

- Nunca un valor de ejemplo como placeholder (nombres, teléfonos, direcciones, «12»): con el campo vacío se lee como ya escrito, sobre todo junto a «Champ requis».
- Un formato (código postal, licencia RBQ) va en una ayuda bajo el campo (`.fld__hint` o `mat-hint`), enlazada con `aria-describedby`; si hay error, el error la sustituye.
- Solo quedan los placeholders que son instrucción («Décrivez la situation», «Quelques mots sur votre approche»).

### Listas del contratista (y de los roles internos)

- Filtro de estado con `mat-button-toggle-group` (ver §4) en lugar de píldoras KPI; conmutador tarjetas / tabla con `[aria-label]` + `matTooltip`. La tabla solo desde 768px; por debajo, siempre tarjetas.
- Tarjeta enlazada: el título es el único enlace y su `::after` (`position: absolute; inset: 0`) hace pulsable toda la tarjeta; el anillo de foco va en la tarjeta con `:has(a:focus-visible)`. Otros botones dentro de la tarjeta, con `position: relative; z-index: 1`.
- Foto en una caja con `aspect-ratio`: la imagen `position: absolute; inset: 0; object-fit: cover`. Si la imagen va en el flujo, estira la caja y rompe el ratio.
- Sin datos tras filtrar: un `app-empty-state` con «Effacer les filtres», distinto del vacío real.
- Dato oculto o archivado: los servicios devuelven `'—'`; la plantilla lo filtra (`hay(valor)`) y no pinta la fila.

### Pantallas del estimador y del admin

- **Tablas anchas**: `lista.css` muestra la tabla desde 768px. Una lista con muchas columnas la retrasa en su propio CSS y muestra tarjetas por debajo: 1200px en ofertas, contratos, obras y archivados; 1400px en eventos IA. Comprueba a 1280px que la tabla no desborda.
- **Texto largo en una celda**: recorta un `<span>` dentro del `<td>` con `-webkit-line-clamp`, nunca el `<td>` (con `display: -webkit-box` deja de ser celda y rompe la tabla).
- **Borrar o archivar** (irreversible): botón de texto terracota (`cf-del`, `--mat-button-text-label-text-color: var(--ds-danger-ink)`) que abre, en su sitio, un recuadro `cf-danger` con `role="alertdialog"`, la pregunta con icono y dos botones: cancelar de texto y confirmar terracota relleno con icono y texto. Mientras borra, guardar queda desactivado. Sin `confirm()` del navegador.
- **Campo con `[formControlName]` dinámico** (un campo por idioma, una fila de tabla): añade `[attr.name]` con el mismo valor; `app-campos-faltantes` busca el campo por `name` para leer su etiqueta.
- **Textos en tres idiomas**: la etiqueta nombra el idioma («Titre en français»), sin insignias FR / EN / ES.
- **Selects**: `mat-select` dentro de `mat-form-field` (salvo dentro de un `<dialog>` nativo, ver §4). Una opción compuesta se escribe «Nombre (CÓDIGO)», sin «A · B».
- **Tarjetas que dependen de su hueco, no de la ventana** (ofertas en la edición de oferta, contratos del dossier, tarjeta de obra): `container-type: inline-size` en el contenedor y `@container` en las reglas.
- **Recuentos**: dentro de la opción del filtro (`<span class="ls-count">`), no en píldoras KPI aparte.
- **Avisos efímeros** (`components/toast`, servicio `ToastService`): pila fija abajo a la derecha (`--ds-z-toast`, 26rem), a lo ancho con 16px de margen por debajo de 576px. Cada aviso en su tono `-soft` con texto `-ink`, borde de la base, icono y texto, y botón de cerrar con etiqueta traducida. `role="alert"` para error y aviso, `role="status"` para éxito e información. Entra con `animate.enter` (8px y opacidad, `--ds-duration-base`) y sale solo con opacidad (`--ds-duration-fast`); con reduced motion, solo opacidad.

### Grids

- CSS Grid / Flexbox propios del componente; no hay rejilla global.
- Pistas con `minmax(0, 1fr)`, nunca `1fr` a secas ni columnas implícitas: crecen hasta el min-content de su contenido (una URL, un nombre largo) y desbordan en móvil. Una rejilla de una columna también: `grid-template-columns: minmax(0, 1fr)`.
- En una fila de campos, `align-items: start`: la ayuda de un campo no debe estirar a su vecino.
- Rompe la simetría a veces: columnas 5 + 7, no siempre 4-4-4.
- `gap` generoso entre items: `--ds-space-5` mínimo, `--ds-space-6` o más en secciones amplias.

---

## 8. Animación

- **Animaciones de entrada**: un solo momento orquestado por pantalla, con CSS del componente o `animate.enter` / `animate.leave` y los tokens `--ds-ease-*` / `--ds-duration-*`. Nada de entradas en cascada por reflejo.
- **Hover en botones rellenos**: cambio de color a `--ds-action-hover`; `:active` con `-pressed` y `scale(0.98)`.
- **Hover en tarjetas enlazadas**: borde o sombra (`--ds-shadow-md`) en el CSS del componente, solo con puntero fino (`@media (hover: hover) and (pointer: fine)`), para que no se quede pegado en táctil.
- **View Transitions** del router: activarlas en `app.config.ts` con `withViewTransitions()`.
- **Animaciones infinitas** (esqueletos, spinners, el escaneo del hero): el corte global de `tokens.css` solo acorta la duración, así que una infinita seguiría moviéndose a saltos. Cada componente las para con `@media (prefers-reduced-motion: reduce) { … { animation: none; } }`.
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
├── styles.css              ← lo que vive fuera de un componente (.e3d-viewer-pane)
├── styles/
│   ├── material-theme.scss ← tema de Angular Material (único .scss): --mat-sys-* → --ds-*
│   ├── base.css            ← reboot de elementos (sin clases)
│   ├── tokens.css          ← variables del sistema
│   └── components.css      ← solo .page-wrapper
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
- Clases globales nuevas (en `base.css`, `components.css` o `styles.css`) o clases al estilo Bootstrap (`.btn`, `.row`, `.text-success`…) — CSS del componente o una hoja compartida (§5), con los tokens `--ds-*`
- `z-index` con números mágicos — usa la escala `--ds-z-*`
- Sombras con valores sueltos — usa los tokens `--ds-shadow-*`
- Densidad agresiva (`padding: 0.25rem`) sin justificación

- Fondos negros (`#000`), sombras en negro puro, iconos filled
- Bronce como relleno de botón; `--ds-accent` como texto por debajo de 24px
- Errores sin icono y texto (los errores son terracota `--ds-danger`)
- Texto por debajo de 14px fuera de las etiquetas en mayúsculas; etiquetas monoespaciadas
- Cursiva bronce fuera del saludo del dashboard y de los títulos de la landing
- Mayúsculas escritas en i18n (van por CSS, solo en etiquetas)
- Radios fuera de la escala 6 / 10 / 14 / 20 / pill
- `outline: var(--ds-focus-ring)` (usa `--ds-focus-outline`)
- Tokens retirados (`--ds-cta*`, `--ds-mark`, `--ds-stretch-*`, `.ds-cta`, `--ds-gold*`, `--gold`, `--bs-*`, `--ds-text-xs`…): ya no existen

---

## 13. Cuando pidas ayuda a una IA (Claude, Copilot, etc.)

Si trabajas con asistentes de IA en este proyecto, dales este archivo como contexto. Una buena instrucción inicial sería:

> "Trabajo en un proyecto Angular 22 con Angular Material 22 y CSS plano (Bootstrap desinstalado). Sigue las reglas de `DESIGN_GUIDELINES.md`; la identidad visual es Lin et bronze (lino 60 %, espresso 30 % como tinta y acción por defecto, bronce 10 % como acento que nunca rellena un botón; Cormorant Garamond para títulos y cifras, Manrope para la interfaz). Antes de generar código, identifica qué tokens CSS y componentes del sistema vas a usar o a cambiar. No uses gradientes morados, no uses `*ngIf`/`*ngFor`, no uses NgModules. Usa standalone components con OnPush, signals, nuevo control flow, y los tokens del sistema."
