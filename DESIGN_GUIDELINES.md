# DESIGN_GUIDELINES.md

Guía de diseño y código para este proyecto. Aplica también si usas Claude Code, Copilot u otra IA para generar componentes.

> **Dirección aprobada: Trait rouge** (20-nov-2026; sustituye a Clarté). El rediseño completo se hizo por fases, de la 0 a la 4 (ver `design.md`), y quedó cerrado el 23-nov-2026: todas las pantallas están en Trait rouge, sin capa de transición ni tokens legados. Siguen vigentes las convenciones técnicas (secciones 3–6, 9–11), el uso de tokens `var(--ds-...)` y el contraste WCAG AA.

---

## 1. Stack del proyecto

- **Framework**: Angular 22 (standalone components, signals, nuevo control flow), TypeScript 6.0
- **Estilos**: CSS plano (NO SCSS, NO Tailwind). Única excepción: `src/styles/material-theme.scss`, el tema de Material. Bootstrap desinstalado y sin capa de transición: ver sección 4
- **Componentes**: Angular Material 22 (M3), con su tema enlazado a los tokens `--ds-*`: ver sección 4
- **Sistema de diseño**: tokens CSS en `src/styles/tokens.css`
- **Tipografía**: Archivo, una sola familia variable; el ancho (75–125 %) distingue display, títulos, cuerpo y cifras
- **Iconos**: Material Symbols Outlined vía `mat-icon` (subconjunto en `index.html`, mantenido por `scripts/icons.mjs`) en todas las pantallas; `bootstrap-icons` desinstalado. Nunca filled

---

## 2. Identidad visual — Trait rouge

Calma analógica con un acento que despierta la interacción. Papel crema, estructura en verde abeto y un trazo rojo tomate que marca **lo que toca hacer ahora** y las **medidas reales** del escaneo. El público son propietarios con un problema en casa (moho, agua, amianto, aislamiento, cimientos): la interfaz transmite calma y precisión, no alarma.

Reparto 60 / 30 / 10:

- **60 % crema**: fondo de página, bandas y superficies (`--ds-bg`, `--ds-band`, `--ds-surface`).
- **30 % abeto**: tinta, acción por defecto, bandas oscuras (`--ds-ink`, `--ds-action`, `--ds-dark-surface`).
- **10 % tomate**: un botón por vista (la siguiente etapa) y los trazos de medida (`--ds-cta`, `--ds-mark`).

### Paleta completa

La fuente de verdad es `src/styles/tokens.css`. Usa siempre el token, nunca el hex suelto. Contrastes WCAG 2.x calculados.

**Superficies**

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-bg` | `#EEE2CB` | Crema clásica: fondo de página |
| `--ds-bg-alt` | `#F1E8D6` | Rellenos sutiles dentro de superficies: hover de filas, cabeceras de tabla, detalle desplegado |
| `--ds-band` | `#E4D5B9` | Kraft: bandas de sección alternas |
| `--ds-surface` | `#F8F2E6` | Vélin: tarjetas, paneles, campos, hojas |
| `--ds-surface-elevated` | `#FBF7EF` | Modales, overlays (se distinguen también por sombra) |
| `--ds-surface-overlay` | `rgba(248,242,230,0.92)` | Vélin translúcido sobre imágenes |
| `--ds-overlay` | `rgba(20,42,32,0.45)` | Backdrops detrás de modales |

**Tinta / Texto**

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-ink` | `#142A20` | Abeto noche: texto principal (11.9:1 sobre `--ds-bg`, 13.6:1 sobre `--ds-surface`) |
| `--ds-ink-secondary` | `#2E3F35` | Texto secundario (8.7:1 sobre `--ds-bg`, 7.7:1 sobre `--ds-band`) |
| `--ds-ink-muted` | `#4A5547` | Texto terciario, ayudas, placeholders (6.1:1 sobre `--ds-bg`, 5.4:1 sobre `--ds-band`) |
| `--ds-ink-faint` | `#6F7A68` | Liquen: **solo gráficos** y contorno de campos (4.0:1 sobre `--ds-surface`). Nunca texto |
| `--ds-ink-inverse` | `#F8F2E6` | Texto sobre superficies oscuras (9.7:1 sobre abeto, 13.6:1 sobre abeto noche) |

**Acción por defecto (abeto)**: enlaces, botón relleno normal, foco, selección, checkbox, pestañas. Es el rol `primary` de Material.

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-action` | `#1B4532` | Relleno, enlaces, foco (8.4:1 sobre `--ds-bg`, 9.7:1 sobre `--ds-surface`) |
| `--ds-action-hover` | `#163A2A` | Hover |
| `--ds-action-pressed` | `#112E21` | Active / pressed |
| `--ds-on-action` | `#F8F2E6` | Texto sobre `--ds-action` (9.7:1) |
| `--ds-action-soft` | `#C5D3C0` | Bordes de selección, realces (abeto encima 6.9:1) |
| `--ds-action-faint` | `#DDE5D6` | Fondos de selección y de «hecho»: elemento activo de la navegación, chip seleccionado (abeto encima 8.4:1) |
| `--ds-action-ink` | = `--ds-action` | Texto sobre `--ds-action-soft` / `--ds-action-faint` |

**Siguiente etapa (tomate)**: un solo botón por vista, el que hace avanzar el dossier. Nunca texto.

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-cta` | `#D23A22` | Tomate profundo: relleno del botón de la siguiente etapa (blanco encima 4.8:1) |
| `--ds-cta-hover` | `#B5301B` | Hover (6.2:1) |
| `--ds-cta-pressed` | `#9C2815` | Active / pressed (7.7:1) |
| `--ds-on-cta` | `#FFFFFF` | Texto sobre `--ds-cta` |
| `--ds-mark` | `#EE4129` | Tomate de marca, **solo gráfico**: cotas, línea de barrido, punto de aviso. 3.0:1 sobre `--ds-bg`, 3.5:1 sobre `--ds-surface`, 4.7:1 sobre `--ds-scan-bg`. Nunca sobre `--ds-band` (2.7:1) ni sobre abeto (2.8:1) |

**Bordes y separadores (filetes)**

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-border` | `#D9CBAE` | Filete estándar |
| `--ds-border-strong` | `#BBA886` | Bordes de énfasis, botón de contorno |
| `--ds-border-subtle` | `#E8DDC7` | Separadores muy sutiles |

**Estados semánticos**. Cada base pasa AA como texto sobre crema, vélin y su `-soft`; `-ink` coincide con la base.

| Token CSS | Hex | `-soft` | Texto sobre `-soft` | Significado |
|-----------|-----|---------|---------------------|-------------|
| `--ds-success` / `-ink` | `#1B4532` | `#DDE5D6` | 8.4:1 | Lo que avanza (familia del abeto) |
| `--ds-warning` / `-ink` | `#7A4F00` | `#F5E6C4` | 5.8:1 | Lo que pide una acción tuya |
| `--ds-danger` / `-ink` | `#A1251B` | `#F6DDD3` | 5.8:1 | Errores: ladrillo, siempre con icono y texto |
| `--ds-info` / `-ink` | `#245B78` | `#DCE6E6` | 5.8:1 | Información neutra |

Con vélin o blanco encima, las cuatro bases pasan AA, así que sirven de relleno.

```css
/* Insignia de estado */
.badge--ok     { background: var(--ds-success-soft); color: var(--ds-success-ink); }
.badge--select { background: var(--ds-action-faint); color: var(--ds-action-ink); border-color: var(--ds-action-soft); }
```

**Superficies oscuras** (bandas abeto, panel del login, grabador de vídeo, visor 3D)

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--ds-dark-surface` | `#1B4532` | Abeto |
| `--ds-dark-surface-deep` | `#142A20` | Abeto noche |
| `--ds-ink-inverse-muted` | `#C9CDB9` | Texto secundario sobre oscuro (6.6:1 sobre abeto) |
| `--ds-danger-on-dark` · `-hover` | `#F6B3A5` · `#F9CBC0` | Error o acción de peligro sobre oscuro (6.1:1 sobre abeto) |
| `--ds-scan-bg` | `#0E1712` | Fondo del visor 3D y de las imágenes de escaneo |

Sobre abeto, texto y botones van en vélin (`--ds-ink-inverse`): botón relleno vélin con texto abeto, foco con `--ds-focus-ring-dark`. El tomate no se usa sobre superficies oscuras de abeto. Ejemplo completo: la barra, la burbuja y la ventana flotante de `grabador-video.component.css` (vélin sobre abeto, foco con `--ds-focus-ring-dark`; el aviso de últimos segundos en `--ds-danger-on-dark`, el color del punto de grabación).

**Tokens retirados (fase 4)**

| Ya no existe | Usa |
|--------------|-----|
| `--ds-gold` · `-hover` · `-active` | `--ds-action` · `-hover` · `-pressed` |
| `--ds-gold-soft` · `--ds-gold-faint` · `--ds-gold-ink` | `--ds-action-soft` · `--ds-action-faint` · `--ds-action-ink` |
| `--ds-ink-on-accent` | `--ds-on-action` |
| `--ds-shadow-gold` | `--ds-shadow-action` |
| `--ds-text-2xs` · `--ds-text-xs` | `--ds-text-sm` (14px, el mínimo) |
| `--ds-tracking-widest` | nada: no hay mayúsculas espaciadas |

Tampoco quedan las variables sin prefijo de `src/styles.css` (`--gold`, `--ink-900`, `--warm-*`, `--purple`…) ni las `--bs-*`. `node scripts/validate-ds-tokens.mjs` señala cualquier `var(--ds-*)` que no esté definido.

### Reglas de color

- **Abeto es la acción por defecto**: enlaces, botones rellenos normales, foco, selección.
- **Tomate es la siguiente etapa**: como mucho un botón tomate por vista (`.ds-cta`, ver §4), el que hace avanzar el dossier (crear el dossier, aceptar la oferta, firmar). Si una vista no tiene siguiente etapa clara, no lleva tomate.
- **El tomate nunca es texto** ni icono suelto, y **nunca toca el abeto**: ni sobre una superficie abeto, ni pegado a un botón abeto relleno (2.3–2.8:1 entre ellos, vibran). Al lado de un CTA tomate, la acción secundaria va de contorno o de texto.
- **`--ds-mark` solo dibuja**: cotas, barrido del escaneo, punto de aviso. Sobre crema, vélin o el negro del escaneo; nunca sobre kraft ni abeto.
- **El error es ladrillo, no tomate**: `--ds-danger` como texto, siempre con icono y texto. El tomate es un relleno de acción; el error, un texto. No se confunden.
- Texto sobre fondo `-soft` / `-faint` → su `-ink` (`--ds-success-ink`, `--ds-action-ink`…).
- **PROHIBIDO** usar tokens de borde (`--ds-border*`, `--ds-action-soft`) como color de texto o icono: texto → `--ds-ink-muted`, adorno → `--ds-ink-faint`.
- **PROHIBIDO** fondos negros (`#000`), sombras `rgba(0,0,0,…)`, gradientes decorativos (en especial morado-rosa) y la combinación amarillo/negro de señal de peligro.
- **PROHIBIDO** los colores por defecto de Bootstrap (azul `#0d6efd`, gris `#6c757d`) o de cualquier librería: todo color sale de un token.

### Tipografía

Una sola familia: **Archivo**, variable (peso 400–800, ancho 75–125 %, itálica 400 a ancho normal). El ancho hace de voz de marca:

| Rol | Ancho (`font-stretch`) | Peso | Dónde |
|-----|------------------------|------|-------|
| Display | `--ds-stretch-display` (125 %) | `--ds-weight-black` (800) | Hero, título de pantalla |
| Título | `--ds-stretch-heading` (112 %) | `--ds-weight-bold` (700) | Títulos de sección y de tarjeta |
| Cuerpo | `--ds-stretch-body` (100 %) | 400 / 500 / 700 | Texto, botones, formularios |
| Cifra | `--ds-stretch-figure` (75 %) | 700 | Precios, medidas, contadores; siempre con `font-variant-numeric: tabular-nums` |

- `h1`–`h6` globales (`src/styles/base.css`) van en Archivo 700 al 100 % de ancho, tinta abeto noche e interlineado `--ds-leading-tight`. Cada pantalla fija el tamaño y el ancho de sus títulos en el CSS del componente.
- **Monoespaciada**: no hay de marca. `--ds-font-mono` es la del sistema, solo para código o identificadores técnicos.
- **Sentence case siempre**. Sin etiquetas en mayúsculas espaciadas, sin etiquetas monoespaciadas, sin cadenas «A · B · C», sin numeración entre corchetes, sin resaltar una sola palabra de un título (cursiva, negrita o color).
- **Eyebrow**: solo si aporta contexto real (p. ej. el nombre del dossier sobre el título de una subpágina), en `--ds-text-sm`, peso 500, `--ds-ink-muted`.

**Familias**

| Token CSS | Valor | Uso |
|-----------|-------|-----|
| `--ds-font-display` | `'Archivo', 'Helvetica Neue', Arial, system-ui, sans-serif` | Títulos, cifras (con su ancho) |
| `--ds-font-body` | `'Archivo', 'Helvetica Neue', Arial, system-ui, sans-serif` | Cuerpo, UI |
| `--ds-font-mono` | `ui-monospace, ...monospace` | Código |

Los dos tokens de familia se mantienen separados aunque hoy valgan lo mismo: así un título y un párrafo siguen distinguiéndose en el código.

**Escala tipográfica** (base 16px). **Mínimo 14px** en toda la app: no hay tokens por debajo de `--ds-text-sm`.

| Token CSS | Tamaño | px | Uso típico |
|-----------|--------|----|----|
| `--ds-text-sm` | `0.875rem` | 14px | Mínimo: captions, texto auxiliar |
| `--ds-text-base` | `1rem` | 16px | Cuerpo |
| `--ds-text-lg` | `1.125rem` | 18px | Lead, cuerpo en escritorio |
| `--ds-text-xl` | `1.375rem` | 22px | h5 |
| `--ds-text-2xl` | `1.75rem` | 28px | h4, card-title |
| `--ds-text-3xl` | `2.25rem` | 36px | h3 |
| `--ds-text-4xl` | `3rem` | 48px | h2 |
| `--ds-text-5xl` | `4rem` | 64px | h1 |
| `--ds-text-display` | `5.5rem` | 88px | Hero |

Excepción conocida: la etiqueta flotante de los campos de Material se escala al 75 % (12px) y Material no ofrece token oficial para cambiarlo. Las ayudas y errores de los campos sí van a 14px (tema).

**Pesos**: `--ds-weight-regular` (400) · `--ds-weight-medium` (500) · `--ds-weight-semibold` (600) · `--ds-weight-bold` (700) · `--ds-weight-black` (800, títulos expandidos). `index.html` carga el rango 400–800 completo.

**Interlineado**: `--ds-leading-tight` (1.1, títulos) · `--ds-leading-snug` (1.25) · `--ds-leading-normal` (1.5, cuerpo) · `--ds-leading-relaxed` (1.65)

**Tracking**: `--ds-tracking-tight` (-0.015em) · `--ds-tracking-normal` (0) · `--ds-tracking-wide` (0.04em)

### Firma: la cota

La firma es la **cota arquitectónica** (línea de medida con sus marcas). Solo se dibuja con medidas reales del plano o del escaneo, nunca de adorno.

- Sobre el escaneo: líneas en `--ds-mark` (SVG), etiquetas en HTML sobre vélin con tinta (13.6:1).
- Línea de etapas del dossier (`stage-line`): tramo recorrido y marca actual en abeto, pendientes en `--ds-ink-faint`. La etapa la dice el texto, no el color.
- Logotipo: cuadro abeto con una cota vélin en la esquina; sobre abeto se invierte (cuadro vélin, cota abeto). Sin punto tomate: el tomate no toca el abeto.

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

- **Material Symbols Outlined** vía `mat-icon`. `MatIconRegistry.setDefaultFontSetClass('material-symbols-outlined')` en `app.config.ts`
- `index.html` pide a Google Fonts solo los iconos usados (`icon_names=`, en orden alfabético). Tras añadir o quitar un icono: `node scripts/icons.mjs --write`. `npm run lint:css` (o `npm run lint:icons`) falla si la lista no coincide
- El script detecta `<mat-icon>nombre</mat-icon>`, `fontIcon="nombre"`, `matIcon="nombre"` y, en TypeScript, `matIcon: 'nombre'` / `matIcon = 'nombre'`. Un icono dinámico (`<mat-icon>{{ item.matIcon }}</mat-icon>`) debe leer de una propiedad `matIcon`
- Un icono que cambia con el estado (pausa / reanudar, ampliar / reducir) se escribe en dos ramas `@if` estáticas, cada una con su `<mat-icon>`: el script las ve y, dentro de un `mat-button`, cada rama tiene un solo nodo raíz (sin el error NG8011). El texto del botón va fuera del `@if`
- Icono que depende de un dato (tipo de evento, estado, tono de un aviso): un mapa en el componente, `{ clave: { matIcon: 'nombre' } }`, y en la plantilla `<mat-icon>{{ MAPA[clave].matIcon }}</mat-icon>`. Nunca un ternario con nombres de icono (`cond ? 'check' : 'close'`): el script no lo ve y el icono sale como texto
- Tamaños: 20 y 24 px; 16 px solo dentro de texto
- **PROHIBIDO**: iconos rellenos (filled), emojis decorativos en UI

### Sombras

- Suaves, teñidas de abeto noche (`rgba(20, 42, 32, …)`), nunca negro puro.
- En cards: shadow-xs por defecto, shadow-md en hover.

| Token CSS | Uso |
|-----------|-----|
| `--ds-shadow-xs` | Elevación mínima (cards en reposo) |
| `--ds-shadow-sm` | Elementos ligeramente elevados |
| `--ds-shadow-md` | Hover de cards, dropdowns |
| `--ds-shadow-lg` | Popovers, paneles flotantes |
| `--ds-shadow-xl` | Modales |
| `--ds-shadow-action` | Hover del botón relleno |
| `--ds-focus-ring` | Foco para `box-shadow`: doble anillo superficie 2px + abeto 2px |
| `--ds-focus-ring-dark` | Foco sobre superficies abeto: anillo abeto 2px + vélin 2px |
| `--ds-focus-outline` | Foco para `outline`: `2px solid` abeto. **Nunca** `outline: var(--ds-focus-ring)` (es sintaxis de sombra y anula el foco) |

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

## 4. Componentes: Angular Material y estilos globales

### Angular Material 22 (librería de componentes)

Angular Material 22 (M3) es la librería de componentes del rediseño. Botones, campos, selects, checkboxes, menús, diálogos, snackbars, tabs y tooltips salen de Material antes que de marcado propio o de las clases heredadas.

- **Tema**: `src/styles/material-theme.scss`, el único `.scss` del proyecto. Con `use-system-variables`, los componentes leen color y tipografía de variables `--mat-sys-*`, y el tema enlaza cada rol a un token `--ds-*` (fuentes: `--ds-font-body` y `--ds-font-display`). Al cambiar los tokens, Material cambia solo: no hace falta tocar el tema.
- **Roles de color**:

| Rol M3 | Token | Dónde se ve |
|---|---|---|
| `primary` | `--ds-action` | Botón relleno, botón de texto y de contorno, foco de campos, checkbox, switch, tabs, progreso |
| `on-primary` | `--ds-on-action` | Texto e iconos sobre `primary` (9.7:1) |
| `primary-container` · `on-primary-container` | `--ds-action-faint` · `--ds-action-ink` | FAB, rango del datepicker (8.4:1) |
| `secondary-container` · `on-secondary-container` | `--ds-action-faint` · `--ds-action-ink` | Botón tonal, chips seleccionados, elemento activo de listas y navegación (8.4:1) |
| `primary-fixed-dim` · `secondary-fixed-dim` | `--ds-action-soft` | Variantes fijas |
| `tertiary` · `tertiary-container` | `--ds-info` · `--ds-info-soft` | Acentos informativos |
| `background` | `--ds-bg` | Fondo de la app (`.mat-app-background`) |
| `surface` · `surface-container` · `-low` | `--ds-surface` | Menús, diálogos, cards |
| `surface-container-high` · `-lowest` · `surface-bright` | `--ds-surface-elevated` | Datepicker, capas elevadas |
| `surface-container-highest` · `surface-variant` | `--ds-bg-alt` | Fondo del campo `fill` |
| `surface-dim` | `--ds-band` | Bandas |
| `on-surface` · `on-surface-variant` | `--ds-ink` · `--ds-ink-muted` | Texto · etiquetas, ayudas, iconos |
| `outline` · `outline-variant` | `--ds-ink-faint` · `--ds-border` | Borde de campos y botón de contorno (4.0:1 sobre vélin) · divisores |
| `error` · `error-container` | `--ds-danger` · `--ds-danger-soft` | Errores de campos |
| `inverse-surface` · `inverse-on-surface` · `inverse-primary` | `--ds-dark-surface` · `--ds-ink-inverse` · `--ds-action-faint` | Snackbar, tooltip; acción del snackbar 8.4:1 sobre abeto |

  En M3 `primary` también es color de **texto**: el abeto da 8.4:1 sobre crema y 9.7:1 sobre vélin, así que sirve para las dos cosas. **El tomate no es un rol de Material**: solo existe en la clase `.ds-cta`.
- **Botones**:

| Botón | Marcado | Cuándo |
|---|---|---|
| Siguiente etapa (tomate) | `<button mat-flat-button class="ds-cta">` | Como mucho uno por vista: lo que hace avanzar el dossier |
| Relleno (abeto) | `<button mat-flat-button>` | Acción principal de una vista sin siguiente etapa, o confirmar en un diálogo |
| Secundario | `<button mat-stroked-button>` | Alternativas; el que acompaña a un `.ds-cta` |
| Texto | `<button mat-button>` | Acciones terciarias, cancelar |

  `.ds-cta` está definida al final de `material-theme.scss` con `mat.button-overrides`: relleno `--ds-cta`, texto `--ds-on-cta` (4.8:1) y capa de estado en abeto noche, de modo que hover y pressed oscurecen y el contraste solo sube. No repliques sus colores en el CSS de los componentes. Junto a un `.ds-cta` no pongas un `mat-flat-button` abeto: el tomate nunca toca el abeto.

  Si la siguiente etapa se repite en una lista (varios contratos por firmar, varias ofertas), solo la primera pendiente —o la que se está confirmando— lleva `.ds-cta` (`[class.ds-cta]="ctaId() === item.id"`); las demás van en abeto relleno.
- **Formas** (en el tema): botones, campos, menús, autocomplete y snack-bar `--ds-radius-md` (6px) · tarjetas, expansion y datepicker `--ds-radius-lg` (12px) · diálogos y bottom sheet `--ds-radius-xl` (20px). Elevaciones: las de Material.
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
- **Destructivo irreversible** (eliminar un vídeo, descartar una grabación, borrar un contrato): `mat-flat-button` con `--mat-button-filled-container-color: var(--ds-danger)`, texto y capa de estado `--ds-surface`, siempre con icono y texto. Nunca en tomate.
- **Campos**: `appearance="outline"` y `subscriptSizing="dynamic"` cuando el campo no tiene ayuda fija (el hueco del error solo aparece con el error). Fecha y hora llevan siempre la etiqueta flotada (el control nativo muestra su formato).
- **Slider**: la pista inactiva por defecto no se ve sobre vélin; ajústala con `--mat-slider-inactive-track-color: var(--ds-border-strong)` y alturas de 6px (`--mat-slider-active-track-height`, `--mat-slider-inactive-track-height`).
- **`mat-button-toggle-group` como filtro**: `hideSingleSelectionIndicator`, el recuento dentro de la opción (cifra al 75 %), seleccionado en `--ds-action-faint` / `--ds-action-ink`. En móvil, si no caben, rejilla con `--mat-button-toggle-divider-color: transparent`, `border: 0` en el grupo y borde y radio 6px en cada `mat-button-toggle`.

### Estilos globales: `base.css` y nada más

Bootstrap, `@ng-bootstrap`, Popper y `bootstrap-icons` ya no están instalados, y la capa de transición (`ui-base.css`, `bootstrap-overrides.css`) se borró al cerrar la fase 4. Los estilos globales, en este orden (`angular.json`, build y test):

1. `src/styles/material-theme.scss`: el tema de Material (roles `--mat-sys-*` → `--ds-*`, `.ds-cta`).
2. `src/styles/base.css`: reboot de **elementos** (box-sizing, márgenes de `p`, títulos y listas, `h1`–`h6` en Archivo 700, enlaces en abeto, controles que heredan la fuente, `[hidden]`…). Solo selectores de elemento, sin clases.
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
- [ ] Como mucho un botón tomate (`.ds-cta`) por vista; el tomate nunca es texto ni toca el abeto
- [ ] Cifras (precios, medidas) en ancho `--ds-stretch-figure` con `tabular-nums`
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

- Cada pantalla define sus secciones en su CSS; en la app, dentro de `.page-wrapper`. En las páginas públicas, `.sec` de `site-base.css` (`--band` para kraft, `--dark` para la isla abeto noche).
- Alterna la banda kraft con la crema para dar ritmo.
- Limita el ancho con los tokens `--ds-container-*`.

### Hero

- Alineado a la izquierda; asimetría preferida sobre composición centrada perfecta.
- Abre con lo más característico del dominio: el escaneo de una vivienda real, con sus cotas.
- Título grande en ancho display + lead + el CTA tomate de la siguiente etapa y, si hace falta, uno secundario de contorno. Sin eyebrow decorativo ni palabras resaltadas.
- Un solo momento de motion (el barrido del escaneo); nada de entradas en cascada por reflejo.

### Páginas públicas (landing, Le Journal, Entrepreneurs)

- Solo tema claro, sin conmutador de tema ni controles flotantes. Idioma en la cabecera.
- Una cabecera y un pie para las tres: `app-site-header` (`pagina="inicio|journal|entrepreneurs"`, `[ctaTomate]`) y `app-site-footer` (`[enInicio]`), en `public-site/chrome/`. CSS común en `public-site/styles/`: `site-base.css` (contenedor `.wrap`, `.button`, `.link`, marca, `.sec` / `--band` / `--rule` / `--dark`, `.crumbs`) y `site-blocks.css` (`.step`, `.svc`, `.fm` / `.fld` / `.chip`). Cada página pone su `:host` (fondo, tipografía y `--hd-h`).
- Una sección por pantalla, como mucho seis. Copy recortado y fusionado (acordado), textos nuevos marcados para revisión.
- CSS propio del componente con tokens. De Material, solo iconos, botones de icono y `mat-menu`. Los botones propios son `.button` de `site-base.css`.
- `h1`–`h3` y `legend` heredan el reboot de `base.css` (color, flotado y tamaño de `legend`): en estas páginas, `color: inherit` y `legend { float: none; font-size: inherit }`.
- Fotos reales sin pie, con `NgOptimizedImage` y copias web de ≤ 800px (las originales quedan como fuente).
- En móvil, CTA fijo abajo entre el final del hero y el formulario; oculto en escritorio.
- Un solo botón tomate a la vista. Si la misma acción aparece en la cabecera y en el hero, la de la cabecera va de contorno mientras el hero se ve y pasa a tomate cuando queda sola. En Entrepreneurs la siguiente etapa es postular: «Créer mon dossier» de la cabecera va siempre de contorno (`[ctaTomate]="false"`).
- Sobre la isla abeto noche (`.sec--dark`) el botón es vélin (`.button--light`): ni tomate ni abeto sobre abeto.
- Acordeón de preguntas (FAQ): `h3` > `button` con `aria-expanded` / `aria-controls`; respuesta `role="region"` con `aria-labelledby`, `inert` mientras está cerrada y altura animada con `grid-template-rows: 0fr → 1fr` (sin medir el DOM).
- Francés: espacio de no separación (`\u00a0`) antes de `? ! : ;` en los textos de i18n.

### Formularios largos en móvil (pasos)

- Por debajo de 768px, un formulario de más de una pantalla se parte en pasos (la landing: 3). Cada paso tiene título (`h3`, `tabindex="-1"`) con «Étape n sur N» (`stage.step_of`) y una barra de N tramos en abeto, decorativa (`aria-hidden`): el paso lo dice el texto.
- «Continuer» es el tomate (`type="submit"`, así Intro también avanza) y valida solo los campos del paso: si falta algo, marca los errores y lleva el foco al primero. «Retour» es un botón de texto, nunca relleno junto al tomate.
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
- **Borrar o archivar** (irreversible): botón de texto ladrillo (`cf-del`, `--mat-button-text-label-text-color: var(--ds-danger-ink)`) que abre, en su sitio, un recuadro `cf-danger` con `role="alertdialog"`, la pregunta con icono y dos botones: cancelar de texto y confirmar ladrillo relleno con icono y texto. Mientras borra, guardar queda desactivado. Sin `confirm()` del navegador.
- **Campo con `[formControlName]` dinámico** (un campo por idioma, una fila de tabla): añade `[attr.name]` con el mismo valor; `app-campos-faltantes` busca el campo por `name` para leer su etiqueta.
- **Textos en tres idiomas**: la etiqueta nombra el idioma («Titre en français»), sin insignias FR / EN / ES.
- **Selects**: `mat-select` dentro de `mat-form-field` (salvo dentro de un `<dialog>` nativo, ver §4). Una opción compuesta se escribe «Nombre (CÓDIGO)», sin «A · B».
- **Tarjetas que dependen de su hueco, no de la ventana** (ofertas en la edición de oferta, contratos del dossier, tarjeta de obra): `container-type: inline-size` en el contenedor y `@container` en las reglas.
- **Recuentos**: dentro de la opción del filtro (`<span class="ls-count">`), no en píldoras KPI aparte.
- **Avisos efímeros** (`components/toast`, servicio `ToastService`): pila fija abajo a la derecha (`--ds-z-toast`, 26rem), a lo ancho con 16px de margen por debajo de 576px. Cada aviso en su tono `-soft` con texto `-ink`, borde de la base, icono y texto, y botón de cerrar con etiqueta traducida. `role="alert"` para error y aviso, `role="status"` para éxito e información. Entra con `animate.enter` (8px y opacidad, `--ds-duration-base`) y sale solo con opacidad (`--ds-duration-fast`); con reduced motion, solo opacidad. Nunca tomate.

### Grids

- CSS Grid / Flexbox propios del componente; no hay rejilla global.
- Pistas con `minmax(0, 1fr)`, nunca `1fr` a secas ni columnas implícitas: crecen hasta el min-content de su contenido (una URL, un nombre largo) y desbordan en móvil. Una rejilla de una columna también: `grid-template-columns: minmax(0, 1fr)`.
- En una fila de campos, `align-items: start`: la ayuda de un campo no debe estirar a su vecino.
- Rompe la simetría a veces: columnas 5 + 7, no siempre 4-4-4.
- `gap` generoso entre items: `--ds-space-5` mínimo, `--ds-space-6` o más en secciones amplias.

---

## 8. Animación

- **Animaciones de entrada**: un solo momento orquestado por pantalla, con CSS del componente o `animate.enter` / `animate.leave` y los tokens `--ds-ease-*` / `--ds-duration-*`. Nada de entradas en cascada por reflejo.
- **Hover en botones rellenos**: cambio de color a `--ds-action-hover` (o `--ds-cta-hover` en el CTA tomate); `:active` con `-pressed` y `scale(0.98)`.
- **Hover en tarjetas enlazadas**: borde o sombra (`--ds-shadow-md`) en el CSS del componente, solo con puntero fino (`@media (hover: hover) and (pointer: fine)`), para que no se quede pegado en táctil.
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
- Más de un botón tomate por vista; tomate como texto, sobre abeto o pegado a un botón abeto relleno
- Errores en tomate (los errores son ladrillo `--ds-danger`, con icono y texto)
- Etiquetas en mayúsculas espaciadas o monoespaciadas, cadenas «A · B · C», palabras resaltadas en títulos
- Radios fuera de la escala 4 / 6 / 12 / 20 / pill
- `outline: var(--ds-focus-ring)` (usa `--ds-focus-outline`)
- Tokens retirados (`--ds-gold*`, `--gold`, `--ink-900`, `--bs-*`, `--ds-text-xs`…): ya no existen

---

## 13. Cuando pidas ayuda a una IA (Claude, Copilot, etc.)

Si trabajas con asistentes de IA en este proyecto, dales este archivo como contexto. Una buena instrucción inicial sería:

> "Trabajo en un proyecto Angular 22 con Angular Material 22 y CSS plano (Bootstrap desinstalado). Sigue las reglas de `DESIGN_GUIDELINES.md`; la identidad visual es Trait rouge (crema 60 %, abeto 30 % como acción por defecto, tomate 10 % solo para el botón de la siguiente etapa y los trazos de medida; Archivo como única fuente). Antes de generar código, identifica qué tokens CSS y componentes del sistema vas a usar o a cambiar. No uses gradientes morados, no uses `*ngIf`/`*ngFor`, no uses NgModules. Usa standalone components con OnPush, signals, nuevo control flow, y los tokens del sistema."
