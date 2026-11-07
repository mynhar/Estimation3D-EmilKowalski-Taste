# CLAUDE.md

Este archivo se carga automáticamente al abrir el proyecto en Claude Code. Define las reglas que Claude debe seguir en cada sesión de trabajo.

---

## Regla principal

Se está haciendo un **rediseño completo de la aplicación** con la dirección aprobada **Clarté** (6-nov-2026): superficies claras, tinta ardoise, **sapin como único color de acción** y menthe como firma del escaneo (cotas, progreso). Avanza por fases (0 base → 1 cara al cliente → 2 resto del cliente y páginas públicas → 3 contratista → 4 estimador/admin; ver `design.md`). Para el trabajo de UI usa la skill **`frontend-design`**. **No uses la skill `hallmark` en este proyecto.**

Siguen vigentes las reglas técnicas: Angular 22, Angular Material 22 como librería de componentes, CSS plano, tokens `var(--ds-...)` y contraste WCAG AA.

Referencias del sistema (ya describen Clarté):

1. **[`./DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md)** — guía detallada: tokens, paleta, utilidades, patrones, convenciones.
2. **[`./design.md`](./design.md)** — resumen del sistema y fases del rediseño.
3. `src/styles/tokens.css` — los tokens reales viven aquí con nombres `var(--ds-...)`. Código nuevo: `--ds-action*`, `--ds-scan*`, `--ds-stone`… Los `--ds-gold*` son alias legados (no usar en código nuevo). Nunca inventes nombres `--color-*` ni pongas hex sueltos en los componentes.

---

## Stack del proyecto

- **Framework**: Angular 22 (standalone components, signals, nuevo control flow), TypeScript 6.0, Node `^22.22.3 || ^24.15.0 || >=26`
- **Build**: `@angular/build` (esbuild + Vite). Tests con Karma + Jasmine (builder `@angular/build:karma`)
- **Estilos**: CSS plano por componente (NO SCSS, NO Tailwind). Única excepción: `src/styles/material-theme.scss`. **Bootstrap desinstalado.**
- **Componentes**: **Angular Material 22 (M3)**. Su tema (`src/styles/material-theme.scss`) enlaza los roles `--mat-sys-*` a los tokens `--ds-*`
- **Capa de transición**: `src/styles/ui-base.css` sirve las clases heredadas de Bootstrap (`.btn`, `.row`, `.col-*`, `.form-control`…) que las plantillas aún usan
- **Menús / overlays / diálogos**: Angular Material (`mat-menu`, `mat-dialog`, `mat-snack-bar`…), construido sobre `@angular/cdk`
- **Sistema de diseño**: tokens CSS en `src/styles/tokens.css`
- **Tipografías**: Sofia Sans Semi Condensed (títulos, cifras) + Atkinson Hyperlegible Next (cuerpo, UI)
- **Iconos**: Material Symbols Outlined vía `mat-icon` desde la fase 1; bootstrap-icons line en el contenido de las pantallas aún no rediseñadas (un solo set por contenido; excepción aceptada: la navegación de la app ya usa Material Symbols en todas). Tras añadir o quitar un icono: `node scripts/icons.mjs --write`
- **Sistema de diseño**: Clarté (rediseño en curso por fases)
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
- El color y la tipografía salen del tema: `primary` = `--ds-action` (sapin, 6.5:1, sirve también como texto), `primary-container` = `--ds-scan` (menthe con tinta encima), `mat-flat-button` = CTA sapin con texto blanco. Tabla completa en `DESIGN_GUIDELINES.md` §4.
- Para ajustar un componente, sobrescribe sus variables `--mat-*` en el CSS del componente con `var(--ds-...)` (p. ej. `--mat-button-filled-container-color`). Las `--mdc-*` ya no existen desde Material 20. Nunca `::ng-deep`, selectores a clases internas (`.mdc-*`, `.mat-mdc-*`) ni `color="primary|accent|warn"` (sin efecto en M3).
- Formas fijadas en el tema: 6px botones/campos/menús, 12px tarjetas, 20px diálogos y hojas. Elevaciones: las de Material.
- No ejecutes `ng add @angular/material`: ya está instalado, y añadiría Roboto, Material Icons y un tema precompilado.

---

## Trabajo de UI

- Entrega SIEMPRE **componentes Angular 22 standalone**, no markup suelto ni JSX.
- Rediseñar: aplica Clarté pantalla a pantalla (layout, iconos, escala tipográfica, sustituir clases heredadas). Conserva rutas, copy y comportamiento salvo que se pida lo contrario. Excepción acordada: en la landing se puede fusionar, reordenar y recortar el copy (9 → 6 secciones) y proponer textos nuevos, marcándolos siempre para revisión.
- Si cambias o añades tokens, actualiza `src/styles/tokens.css`, `design.md` y `DESIGN_GUIDELINES.md`.

---

## Antes de generar código

1. Lee `DESIGN_GUIDELINES.md` y `design.md` para conocer el sistema si vas a tocar UI.
2. La dirección es Clarté. Antes de desviarte de ella (paleta, tipografía, etc.), acuérdalo con el usuario.
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
- Bootstrap está desinstalado. No uses las clases heredadas de `ui-base.css` en código nuevo ni añadas reglas a ese archivo
- Al rediseñar una pantalla, sustituye sus clases heredadas por CSS del componente; cuando ninguna plantilla use una clase, borra sus reglas de `ui-base.css`

### Identidad visual: Clarté
- Página chaux `#FAFAF7`, superficies blancas `#FFFFFF`, bandas pierre grise `#E4E6E1`, tinta ardoise `#1D2B30`
- **Un único color de acción**: sapin `#1E6A55` con texto blanco. Menthe `#9BE3CF` solo para la firma (cotas, progreso, medidas reales) y como acento sobre ardoise; nunca texto sobre claro
- Tipografía: Sofia Sans Semi Condensed (títulos, cifras) + Atkinson Hyperlegible Next (cuerpo). Mínimo 14px. Sentence case: sin etiquetas en mayúsculas espaciadas, sin etiquetas mono, sin «A · B · C», sin resaltar una sola palabra de un título
- Radios: 6 controles · 12 tarjetas · 20 hojas y diálogos
- Foco: `--ds-focus-ring` (box-shadow) o `--ds-focus-outline` (outline), nunca `outline: var(--ds-focus-ring)`
- Espaciado generoso, contenido alineado a la izquierda

### Prohibiciones
- Reinstalar Bootstrap o `@ng-bootstrap` (para menús, overlays y diálogos usa Angular Material)
- Crear otros archivos `.scss` aparte de `material-theme.scss`
- Gradientes decorativos (en especial morado-rosa) y amarillo/negro de señal de peligro
- Más de un color de acción; tokens legados (`--ds-gold*`, `--gold`, `--bs-*`…) en código nuevo
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
│   ├── ui-base.css             ← capa de transición: clases heredadas de Bootstrap aún en uso
│   ├── bootstrap-overrides.css ← mapea las variables --bs-* de ui-base.css a los tokens
│   └── components.css          ← utilidades propias del sistema
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
- [ ] Contraste WCAG AA (4.5:1)
- [ ] Iconos de un solo estilo, coherentes en toda la app
- [ ] Sin emojis decorativos
- [ ] Conforme a Clarté (un solo color de acción, sentence case, radios 6/12/20); si cambiaron tokens, `tokens.css`, `design.md` y `DESIGN_GUIDELINES.md` actualizados
- [ ] Dirección estética intencional, no genérica
