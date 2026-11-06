# Design — Proyecto Angular 18 (warm editorial)

> **UNLOCKED — rediseño completo en curso.** Este archivo describe el sistema
> **actual**, que es el punto de partida del rediseño, no una restricción.
> Paleta, tipografías, radios, sombras, iconografía, motion y los bans de
> identidad pueden cambiar. Siguen vigentes: el contrato de stack, el uso de
> tokens `--ds-*` (sin hex sueltos ni nombres `--color-*`) y el contraste AA.
> Cuando el rediseño fije la nueva dirección, actualiza este archivo,
> `DESIGN_GUIDELINES.md` y `src/styles/tokens.css`.

## System (actual)
- Genre · editorial (warm-paper)
- Macrostructure · pick per brief
- Theme · custom (vibe: "warm editorial · beige paper · gold premium accent")
- Axes · light paper-band / serif display / warm gold accent-hue

## Tokens (canonical — `src/styles/tokens.css` is the SOURCE OF TRUTH)
> Real token names are `var(--ds-*)`. Generated code MUST use these exact
> names. Do NOT invent `--color-*` names. OKLCH below = reference value held
> by each `--ds-*` token (hex original en comentario).

```css
:root {
  --ds-bg:            oklch(96.4% 0.007 89);  /* #F5F3EE fondo principal     */
  --ds-bg-alt:        oklch(94.6% 0.010 94);  /* #EFEDE6 secciones alternas  */
  --ds-surface:       oklch(98.5% 0.005 95);  /* #FBFAF6 tarjetas, paneles   */
  --ds-ink:           oklch(21.8% 0.000 90);  /* #1A1A1A texto principal     */
  --ds-ink-secondary: oklch(40.9% 0.000 90);  /* #4A4A4A texto secundario    */
  --ds-ink-muted:     oklch(48.3% 0.010 85);  /* #615E58 captions, hints (AA) */
  --ds-ink-faint:     oklch(57.0% 0.011 88);  /* #7A7770 solo adornos ≥3:1, nunca texto */
  --ds-gold:          oklch(79.3% 0.100 90);  /* #D4B96E acento dorado       */
  --ds-gold-hover:    oklch(73.8% 0.101 91);  /* #C2A85C hover botones       */
  --ds-gold-active:   oklch(68.1% 0.101 91);  /* #B0964A rellenos activos — no texto */
  --ds-border:        oklch(92.2% 0.012 92);  /* #E8E5DC bordes estándar     */

  /* Texto sobre fondos suaves (insignias, chips, alertas): ≥ 5:1 AA.
     Regla: texto sobre -soft / -faint → -ink. El color base queda para
     rellenos, barras, bordes e iconos.                                   */
  --ds-success-ink:   oklch(48.9% 0.073 137); /* #4C6A40 sobre success-soft */
  --ds-warning-ink:   oklch(50.2% 0.108 71);  /* #8A5700 sobre warning-soft */
  --ds-danger-ink:    oklch(48.7% 0.123 23);  /* #993E3E sobre danger-soft  */
  --ds-info-ink:      oklch(48.0% 0.045 228); /* #426372 sobre info-soft    */
  --ds-gold-ink:      oklch(46.3% 0.090 85);  /* #70540C sobre gold-faint/-soft */

  --ds-font-display: "Fraunces", ui-serif, Georgia, serif;
  --ds-font-body:    "DM Sans", ui-sans-serif, system-ui, sans-serif;

  /* Radios: botones/inputs 4–6px · cards 8px · modales 12px · chips pill.
     Nunca > 12px. Spacing: escala --ds-space-* (4px–128px), generoso.
     Type scale: --ds-text-*. Pesos: --ds-weight-*.                         */

  --ds-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  /* Sombras: --ds-shadow-* basadas en rgba(26,26,26,..), NUNCA negro puro.  */
}
```

### Dark chrome (sidebar / panel de login)
El shell usa una inversión oscura cálida intencional (espresso) contra el área
clara. Los valores viven una sola vez en `tokens.css`; los componentes los
referencian vía su capa local `--sb-*` / `--lg-*` (nunca hex crudo):
- `--ds-dark-surface` (#2A2420) · superficie oscura · `--ds-dark-surface-deep` (#221E1A)
- `--ds-danger-on-dark` (#D47A76) + `--ds-danger-on-dark-hover` (#EDAAA7) · acción peligro sobre oscuro
- Texto sobre oscuro: variaciones de opacidad de `--ds-ink-inverse` (decisión local del componente).

## CTA voice
- Primary · fill `--ds-gold` · texto `--ds-ink` · radius 4–6px · hover translateY(-1px) + shadow-gold
- Secondary · borde tinta, fondo transparente · mismo radius
- Outline-primary · borde dorado, fondo transparente
- En Angular Material: Primary = `mat-flat-button` · Secondary = `mat-stroked-button` · texto = `mat-button`
  (radios de Material por defecto hasta que el rediseño los fije)

## Iconography
- **bootstrap-icons** (`bi-*`), variantes line/stroke únicamente. Nunca filled.
  (El sistema admite Lucide/Phosphor como equivalentes line, pero el stack real
  usa bootstrap-icons — mantener coherencia con `bi-*`.)

## Motion stance
- Sobria: `.fade-up` escalonado (máx 4–6 elementos por vista), `--ds-ease-out`.
- Hover botón: translateY(-1px) + shadow-gold. Hover card: shadow-md.
- Reduced-motion · ya cubierto globalmente; crossfade ≤150ms.
- PROHIBIDO: `300ms ease` por reflejo — usar tokens de duración.

## Reglas de contraste (vigentes; se adaptan si cambia la paleta)
- Texto en color semántico base sobre su propio fondo suave (`--ds-success` sobre
  `--ds-success-soft`, `--ds-gold-active` sobre `--ds-gold-faint`…): usar `-ink`
- Tokens de borde (`--ds-border*`, `--ds-gold-soft`) como color de texto/icono:
  texto → `--ds-ink-muted`, adorno → `--ds-ink-faint`
- Dorado claro o mostaza como texto/icono sobre fondo claro (1.6–3.1:1): usar
  `--ds-gold-ink` / `--ds-warning-ink`. Solo sobre superficies oscuras va el dorado claro
- En Material, el rol `primary` también es color de texto: por eso es `--ds-gold-ink`, nunca `--ds-gold`

## Bans vigentes
- Gradientes morado-rosa · reinstalar Bootstrap / ng-bootstrap
- Emojis decorativos · UI genérica sin postura estética

## Bans de identidad del sistema actual (desbloqueados para el rediseño)
- Fondos negros (#000) · Inter/Roboto/Arial como principal · iconos filled
- Sombras rgba(0,0,0,..) · border-radius > 12px en UI

## Angular Material (M3)
Librería de componentes. Tema en `src/styles/material-theme.scss` (único `.scss`), con
`use-system-variables`: cada rol `--mat-sys-*` apunta a un token `--ds-*`, así que Material
sigue a los tokens sin tocar el tema.
- `primary` → `--ds-gold-ink` · `primary-container` → `--ds-gold` · `secondary-container` → `--ds-gold-soft`
- `surface` / `surface-container` → `--ds-surface` · `surface-container-highest` → `--ds-bg-alt`
- `on-surface` → `--ds-ink` · `on-surface-variant` → `--ds-ink-muted` · `outline` → `--ds-ink-faint`
- `error` → `--ds-danger` · `inverse-surface` → `--ds-dark-surface` · fuentes → `--ds-font-body` / `--ds-font-display`
- Tabla completa y reglas de uso: `DESIGN_GUIDELINES.md` §4.

## Stack output contract
- Componentes **Angular 18 standalone**, `OnPush`, signals (`input()`/`signal()`),
  nuevo control flow (`@if`/`@for` con `track`). NUNCA `*ngIf`/`*ngFor`, NgModules,
  ni `@Input()`/`@Output()`.
- CSS plano por componente con `:host` (no SCSS salvo el tema `material-theme.scss`, no Tailwind).
- Bootstrap desinstalado. Las clases heredadas (`.btn`, `.card`, `.row`...) las sirve
  `src/styles/ui-base.css` solo durante la transición; el CSS nuevo va en cada
  componente con tokens. Controles, menús, overlays y diálogos con **Angular Material 18**.
  **NO** HTML suelto ni JSX.

## Exports
`tokens.css` (`--ds-*`) es la fuente de verdad. El detalle completo (tabla de
paleta, utilidades `.eyebrow`/`.tag`/`.stat`, patrones de hero/grid) está en
`DESIGN_GUIDELINES.md`. Para Tailwind/DTCG/shadcn: este proyecto NO los usa.
