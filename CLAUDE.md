# CLAUDE.md

Este archivo se carga automáticamente al abrir el proyecto en Claude Code. Define las reglas que Claude debe seguir en cada sesión de trabajo.

---

## Regla principal

Se está haciendo un **rediseño completo de la aplicación** con la dirección aprobada **Lin et bronze** (23-nov-2026; sustituye a Trait rouge): el diseño, la paleta y la tipografía de `/home/harold/proyectos/agencia-inmobiliaria`. 60 % lino (superficies), 30 % espresso (tinta y **acción por defecto**), 10 % bronce (**acento: marca, no actúa**). Cormorant Garamond para títulos y cifras, Manrope para la interfaz. **Móvil primero**, también el visor 3D. Se hace por fases (0 base → 1 cara al cliente → 2 resto del cliente y páginas públicas → 3 contratista → 4 estimador/admin); la 0 está hecha, ver `design.md`. Rama: `redesign/lin-bronze`. Para el trabajo de UI usa la skill **`frontend-design`**. **No uses la skill `hallmark` en este proyecto.**

Siguen vigentes las reglas técnicas: Angular 22, Angular Material 22 como librería de componentes, CSS plano, tokens `var(--ds-...)` y contraste WCAG AA.

Referencias del sistema (ya describen Lin et bronze):

1. **[`./DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md)** — guía detallada: tokens, paleta, utilidades, patrones, convenciones.
2. **[`./design.md`](./design.md)** — resumen del sistema y fases del rediseño.
3. `src/styles/tokens.css` — los tokens reales viven aquí con nombres `var(--ds-...)`. Código nuevo: `--ds-action*`, `--ds-accent*`, `--ds-band`, `--ds-surface-bar`, `--ds-text-label`… Los tokens de Trait rouge (`--ds-cta*`, `--ds-mark`, `--ds-stretch-*`, la clase `.ds-cta`) y los legados (`--ds-gold*`, `--ds-text-xs`, `--bs-*`…) ya no existen. Nunca inventes nombres `--color-*` ni pongas hex sueltos en los componentes.

---

## Stack del proyecto

- **Framework**: Angular 22 (standalone components, signals, nuevo control flow), TypeScript 6.0, Node `^22.22.3 || ^24.15.0 || >=26`
- **Build**: `@angular/build` (esbuild + Vite). Tests con Karma + Jasmine (builder `@angular/build:karma`)
- **Estilos**: CSS plano por componente (NO SCSS, NO Tailwind). Única excepción: `src/styles/material-theme.scss`. **Bootstrap desinstalado.**
- **Componentes**: **Angular Material 22 (M3)**. Su tema (`src/styles/material-theme.scss`) enlaza los roles `--mat-sys-*` a los tokens `--ds-*`
- **Estilos globales**: sin capa de transición. `src/styles/base.css` es el reboot de elementos (sin clases); `components.css` solo tiene `.page-wrapper` y `styles.css` solo `.e3d-viewer-pane`. Lo que comparten varias pantallas va en hojas compartidas (`shared/ui/lista`, `alta`, `ficha`…; ver `DESIGN_GUIDELINES.md` §5)
- **Menús / overlays / diálogos**: Angular Material (`mat-menu`, `mat-dialog`, `mat-snack-bar`…), construido sobre `@angular/cdk`
- **Sistema de diseño**: tokens CSS en `src/styles/tokens.css`
- **Tipografía**: Cormorant Garamond (títulos 600, precios, horas, cifras con `lining-nums tabular-nums`) + Manrope 400–800 (interfaz)
- **Iconos**: Material Symbols Outlined a peso 300 vía `mat-icon` en todas las pantallas (`bootstrap-icons` desinstalado). Tras añadir o quitar un icono: `node scripts/icons.mjs --write`
- **Sistema de diseño**: Lin et bronze (fase 0 hecha; fases 1–4 pendientes)
- **Visor 3D**: Matterport (iframe) con los controles de alrededor en Material. Un visor Three.js sería un proyecto aparte (necesita un modelo 3D por dossier)
- **Skill de diseño**: `frontend-design` (plugin de Anthropic, instalado solo en este proyecto)
- **Skill de Angular**: `angular-developer` (oficial de Angular, en `.claude/skills/`, instalada solo en este proyecto)
- **Skills de Emil Kowalski**: 13 skills de pulido de UI y motion (en `.claude/skills/`, instaladas solo en este proyecto)
- **Skill Taste**: `design-taste-frontend` v2.5.0 (en `.claude/skills/`, instalada solo en este proyecto; solo para páginas públicas)

---

## Skill de diseño: frontend-design

- Úsala para el rediseño y para cualquier UI nueva o reformada.
- Su plan de diseño (paleta, tipografías, layout, principios) se presenta y se acuerda con el usuario **antes** de escribir código.
- La paleta y la tipografía acordadas se trasladan a `src/styles/tokens.css` como tokens `--ds-*`; los componentes nunca llevan hex sueltos.
- Entrega SIEMPRE componentes Angular 22 standalone (reglas de abajo), nunca HTML suelto ni JSX.

---

## Skill de Angular: angular-developer

- Úsala como guía de Angular (componentes, signals, DI, routing, formularios, testing).
- Está escrita para la última versión de Angular. Este proyecto es **Angular 22**, así que sus APIs están disponibles (`linkedSignal`, `resource` / `rxResource`, `httpResource`, `afterRenderEffect`, `animate.enter` / `animate.leave`, Signal Forms, Angular Aria). Las reglas de este archivo mandan sobre la skill, y se mantienen estas convenciones del proyecto:
  - Nombres de archivo con sufijo: `nombre.component.ts`, `nombre.service.ts`… (no el style guide v20 sin sufijo; `angular.json` ya configura `ng generate` así)
  - Tests con Karma + Jasmine, no Vitest
  - `changeDetection: ChangeDetectionStrategy.OnPush` explícito en cada componente
  - `standalone: true` no se escribe: es el valor por defecto desde v19.
- Formularios: Reactive Forms (`references/reactive-forms.md`) o template-driven, según lo que ya use la pantalla. Signal Forms solo en formularios nuevos y tras acordarlo con el usuario.
- Ignora su guía de Tailwind (prohibido en este proyecto).

---

## Skills de Emil Kowalski (pulido de UI y motion)

- Instaladas desde `emilkowalski/skill`:
  - `emil-design-eng`: filosofía de pulido y detalles;
  - motion: `animate`, `choreograph`, `review-animations`, `improve-animations`, `remove-animations`, `find-animation-opportunities`, `animation-performance`, `animation-vocabulary`;
  - otras: `apple-design`, `mobile-native`, `break-ui`, `prototype`.
- No se instalaron `animate-expo` (React Native), `write-swift` (Swift), `ask-sonner` ni `pick-ui-library` (librerías de React).
- `frontend-design` fija la dirección estética. Estas skills afinan la interacción, el motion y los detalles dentro de esa dirección.
- Sus ejemplos usan React, Motion / Framer Motion, Sonner, Vaul y Tailwind. Aquí se traducen a Angular 22:
  - transiciones y keyframes en el CSS del componente, WAAPI, o `animate.enter` / `animate.leave` para la entrada y salida de elementos;
  - nada de Motion, Framer Motion, Sonner, Vaul ni Tailwind;
  - no uses `@angular/animations` (`trigger`, `state`, `transition`…) en código nuevo: está deprecado desde v20.2 y se eliminará en v23.
- Curvas y duraciones con los tokens `--ds-ease-*` / `--ds-duration-*`. No copies sus `--ease-out` / `--ease-in-out` / `--ease-drawer`. Si hace falta una curva nueva, añádela a `tokens.css` como `--ds-ease-*`.
- Con `prototype` y `break-ui`, las variantes y los datos de prueba también se entregan como componentes Angular standalone.

---

## Skill Taste: design-taste-frontend

- Instalada desde `Leonxlnx/taste-skill` (v2.5.0, commit `9b4bf93`).
- Está pensada para sitios web estáticos de empresa. Aquí solo se aplica a las **páginas públicas** (`/`, `/journal`, `/entrepreneurs`, `/login`), no a las pantallas de la aplicación.
- `frontend-design` sigue fijando la dirección estética. De Taste se toman sus criterios (una sección por pantalla, bordes iguales, fotos reales, sin pies de foto, un solo sistema de botones y cards, contraste) y su verificador.
- Su método se adapta a las reglas de este archivo:
  - No uses `starter.html` ni copies sus `assets/`, `system.css` o `system.js` al proyecto. Todo se entrega como componentes Angular 22 standalone con CSS del componente.
  - Las paletas y tipografías que reparte `start.mjs deal` son propuestas para acordar con el usuario. Si se aceptan, pasan a `tokens.css` como `--ds-*`; nunca uses su bloque `:root` tal cual.
  - No reescribas el copy. El rediseño conserva textos, rutas y comportamiento salvo que el usuario pida otra cosa.
  - Las fotos que descarga `photos.mjs` son provisionales; las reales las aporta el cliente.
- Seguridad: skills.sh la marca «Critical» (Gen) y «Med» (Snyk) por una auditoría del 2-nov-2026 de la versión anterior, que traía `library/sites.json` con 2 URLs en listas negras y scripts que leían texto de webs externas. Esos archivos no existen en la v2.5.0 instalada. Aun así:
  - Pide confirmación al usuario antes de ejecutar sus scripts (`consistency.mjs`, `shoot.mjs`, `perf.mjs`, `photos.mjs`, `icons.mjs`…), y ejecútalos solo contra páginas locales (build de `dist/` o `ng serve`).
  - No la actualices (`npx skills update`) sin revisar de nuevo su contenido y el informe de skills.sh.

---

## Angular Material

- Usa componentes de Material (botones, campos, selects, menús, diálogos, tabs…) antes que marcado propio o las clases heredadas.
- Importa en cada componente standalone solo los módulos de Material que usa (`MatButtonModule`, `MatFormFieldModule`…).
- El color y la tipografía salen del tema: `primary` = `--ds-action` (espresso, 14.4:1, sirve también como texto), `primary-container` / `secondary-container` = `--ds-action-faint` (bronce suave, con `--ds-action-ink` encima), `mat-flat-button` = píldora espresso con texto crema, `mat-stroked-button` = píldora con borde `--ds-ink-faint`, segmento elegido de `mat-button-toggle` = espresso con texto crema. Manrope en todos los componentes; título de diálogo en Cormorant. El bronce no es un rol de acción. Tabla completa en `DESIGN_GUIDELINES.md` §4.
- Para ajustar un componente, sobrescribe sus variables `--mat-*` en el CSS del componente con `var(--ds-...)` (p. ej. `--mat-button-filled-container-color`). Las `--mdc-*` ya no existen desde Material 20. Nunca `::ng-deep`, selectores a clases internas (`.mdc-*`, `.mat-mdc-*`) ni `color="primary|accent|warn"` (sin efecto en M3).
- Formas fijadas en el tema: píldora botones y segmentados, 10px campos, 14px tarjetas/menús/snack-bar, 20px diálogos y hojas. Elevaciones: las de Material.
- No ejecutes `ng add @angular/material`: ya está instalado, y añadiría Roboto, Material Icons y un tema precompilado.

---

## Trabajo de UI

- Entrega SIEMPRE **componentes Angular 22 standalone**, no markup suelto ni JSX.
- Rediseñar: aplica Lin et bronze pantalla a pantalla (composición, etiquetas, cifras, jerarquía de botones), móvil primero. App y login con Angular Material; landing y páginas públicas con CSS propio (CSS grid) y el pulido de las skills de Emil Kowalski. Conserva rutas, copy y comportamiento salvo que se pida lo contrario. Excepción acordada: en la landing se puede fusionar, reordenar y recortar el copy (9 → 6 secciones) y proponer textos nuevos, marcándolos siempre para revisión.
- Si cambias o añades tokens, actualiza `src/styles/tokens.css`, `design.md` y `DESIGN_GUIDELINES.md`.

---

## Antes de generar código

1. Lee `DESIGN_GUIDELINES.md` y `design.md` para conocer el sistema si vas a tocar UI.
2. La dirección es Lin et bronze. Antes de desviarte de ella (paleta, tipografía, etc.), acuérdalo con el usuario.
3. Identifica qué tokens CSS (`var(--ds-...)`) y qué utilidades vas a usar o a cambiar.
4. Si la tarea es ambigua, pregunta antes de asumir una dirección estética.

---

## Reglas obligatorias (resumen)

### Angular 22
- Standalone components, siempre (sin escribir `standalone: true`, es el valor por defecto)
- `ChangeDetectionStrategy.OnPush`, siempre
- Signals (`input()`, `output()`, `signal()`, `computed()`), no decoradores antiguos
- Nuevo control flow (`@if`, `@for`, `@switch`, `@defer`), nunca `*ngIf` / `*ngFor`
- `track` obligatorio en `@for`

### Estilos
- Usa tokens CSS del sistema (`var(--ds-...)`), nunca hex sueltos
- CSS plano por componente (no SCSS; el único `.scss` es `src/styles/material-theme.scss`), selector raíz `:host`
- Bootstrap está desinstalado y no hay capa de transición. No añadas clases a `base.css`, `components.css` ni `styles.css`: el CSS va en el componente o en una hoja compartida

### Identidad visual: Lin et bronze
- Página lino `#F8F4ED` (`--ds-bg`), superficies vélin `#FFFDF9` (`--ds-surface`), barras del armazón crema `#FBF8F2` (`--ds-surface-bar`), bandas lino oscuro `#ECE4D6` (`--ds-band`), tinta espresso `#2B2119` (`--ds-ink`)
- **Espresso es la acción por defecto** (`--ds-action`): botón relleno, segmento elegido, foco, selección; texto crema encima. Enlaces en bronce oscuro `--ds-action-ink` `#7A5228`
- **El bronce marca, no actúa**: `--ds-accent` `#9A6B3A` para progreso, entrada activa, iconos, cifras grandes y la palabra en cursiva; como texto solo a 24px o más (en pequeño, `--ds-accent-ink`). Nunca el relleno de un botón
- Errores en terracota `--ds-danger` `#A3442A`, siempre con icono y texto
- Tipografía: Cormorant Garamond 600 en títulos y cifras (siempre `lining-nums tabular-nums`), Manrope en la interfaz. Mínimo 14px para leer
- Etiquetas en mayúsculas permitidas: 12px (`--ds-text-label`), peso 700, `--ds-tracking-label`, en `--ds-ink-muted` (grupos, cabeceras de tabla, KPI) o `--ds-accent-ink` (sobre un título); mayúsculas por CSS, nunca en i18n
- Una palabra en cursiva bronce, **solo** en el saludo del dashboard y en los títulos de la landing
- «·» permitido en líneas de metadatos. Sentence case en títulos, botones y texto
- Radios: píldora botones y segmentados · 10 campos · 14 tarjetas y menús · 20 hojas y diálogos · 6 insignias
- Foco: `--ds-focus-ring` (box-shadow) o `--ds-focus-outline` (outline), nunca `outline: var(--ds-focus-ring)`
- Espaciado generoso, contenido alineado a la izquierda

### Prohibiciones
- Reinstalar Bootstrap o `@ng-bootstrap` (para menús, overlays y diálogos usa Angular Material)
- Crear otros archivos `.scss` aparte de `material-theme.scss`
- Gradientes decorativos (en especial morado-rosa) y amarillo/negro de señal de peligro
- Bronce como relleno de botón; `--ds-accent` como texto de menos de 24px
- Texto por debajo de 14px fuera de las etiquetas en mayúsculas; cursiva bronce fuera del saludo y de la landing
- Tokens retirados (`--ds-cta*`, `--ds-mark`, `--ds-stretch-*`, `.ds-cta`, `--ds-gold*`, `--gold`, `--bs-*`…), que ya no existen
- Emojis decorativos en UI
- NgModules nuevos
- `*ngIf` / `*ngFor` / `*ngSwitch` en código nuevo
- Decoradores `@Input()` / `@Output()` en código nuevo
- `@angular/animations` en código nuevo (deprecado; se elimina en v23)
- UI genérica sin postura estética
- Usar la skill `hallmark` en este proyecto

---

## Estructura del proyecto

```
src/
├── index.html                  ← fuentes de Google aquí
├── styles.css                  ← overrides puntuales (mantener mínimo)
├── styles/
│   ├── material-theme.scss     ← tema de Angular Material (único .scss): --mat-sys-* → --ds-*
│   ├── tokens.css              ← sistema de tokens
│   ├── base.css                ← reboot de elementos (sin clases)
│   └── components.css          ← solo .page-wrapper
└── app/
    ├── core/                   ← servicios singleton, interceptors, guards
    ├── shared/                 ← componentes reutilizables
    │   ├── ui/
    │   └── layout/
    ├── features/               ← funcionalidad por dominio
    └── app.config.ts
```

---

## Comandos útiles

```bash
ng serve                                              # dev server
ng build                                              # build producción
ng test                                               # tests
ng generate component shared/ui/nombre \
  --change-detection OnPush --style css               # nuevo componente con reglas del proyecto
```

---

## Checklist antes de cerrar un componente

- [ ] Standalone + `OnPush`
- [ ] `input()` / `signal()` (no `@Input()`)
- [ ] `@if` / `@for` con `track` (no `*ngIf` / `*ngFor`)
- [ ] Tokens CSS `var(--ds-...)` (no hex sueltos)
- [ ] Componentes de Angular Material cuando existan para el caso, ajustados solo con sus variables `--mat-*`
- [ ] HTML semántico
- [ ] Estados: hover, focus, active, disabled, loading
- [ ] Contraste WCAG AA (4.5:1); texto ≥ 14px (12px solo en etiquetas en mayúsculas)
- [ ] Iconos de un solo estilo, coherentes en toda la app
- [ ] Sin emojis decorativos
- [ ] Conforme a Lin et bronze (espresso por defecto, bronce solo como acento, cifras en Cormorant con `lining-nums tabular-nums`, radios píldora/10/14/20); si cambiaron tokens, `tokens.css`, `design.md` y `DESIGN_GUIDELINES.md` actualizados
- [ ] Dirección estética intencional, no genérica
