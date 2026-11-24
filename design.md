# Design — Proyecto Angular 22 (Lin et bronze)

> **Dirección aprobada: Lin et bronze** (23-nov-2026; sustituye a Trait rouge). Toma el
> diseño, la paleta y la tipografía de `agencia-inmobiliaria` y los lleva a Estimation3D.
> Se hace por fases (ver abajo): la 0 está hecha y la app entera ya lleva la piel nueva;
> las fases 1–4 recomponen pantalla a pantalla. Este archivo resume el sistema: el
> detalle está en `DESIGN_GUIDELINES.md` y los valores reales en `src/styles/tokens.css`.
> Siguen vigentes el contrato de stack, el uso de tokens `--ds-*` (sin hex sueltos ni
> nombres `--color-*`) y el contraste AA.

## System
- Genre: marketplace de remediación residencial con escaneo 3D (Montréal)
- Público: propietarios con un problema (moho, daños por agua, amianto, aislamiento,
  cimientos) y contratistas certificados. Muchos clientes entran desde el teléfono:
  **móvil primero**, también el visor 3D
- Vibe: despacho de arquitectura en lino y madera. Superficies de lino, tinta espresso
  que escribe y actúa, un bronce que marca lo importante sin ser botón
- Reparto: 60 % lino (superficies), 30 % espresso (tinta y acción), 10 % bronce (acento)
- Axes: títulos en Cormorant Garamond, interfaz en Manrope / espresso como acción por
  defecto / bronce solo como marca (progreso, etiquetas, entrada activa, cifras grandes)
- Firma: la voz editorial. Títulos serif con, en el saludo y en la landing, una palabra
  en cursiva bronce; etiquetas pequeñas en mayúsculas espaciadas; banda de cifras con la
  primera tarjeta en espresso

## Tokens (canonical — `src/styles/tokens.css` is the SOURCE OF TRUTH)
> Real token names are `var(--ds-*)`. Generated code MUST use these exact
> names. Do NOT invent `--color-*` names.

```css
:root {
  /* Superficies (60 %) */
  --ds-bg:            #F8F4ED;  /* Lino: página                                  */
  --ds-bg-alt:        #F4EEE4;  /* Lino claro: hover de filas, segmentados        */
  --ds-band:          #ECE4D6;  /* Lino oscuro: bandas, pistas de progreso vacías */
  --ds-surface:       #FFFDF9;  /* Vélin: tarjetas, paneles, campos, menús        */
  --ds-surface-elevated: #FFFDF9; /* diálogos y overlays (se distinguen por sombra) */
  --ds-surface-bar:   #FBF8F2;  /* Crema: barra superior y lateral del armazón    */

  /* Tinta */
  --ds-ink:           #2B2119;  /* Espresso: 14.4:1 sobre bg, 15.5 sobre surface  */
  --ds-ink-secondary: #5C4F43;  /* 7.2:1 sobre bg, 6.3 sobre band                 */
  --ds-ink-muted:     #6E6156;  /* 5.5:1 sobre bg, 4.7 sobre band                 */
  --ds-ink-faint:     #988670;  /* solo gráficos y contorno de campos (3.5:1)     */
  --ds-ink-inverse:   #FBF8F2;  /* texto sobre espresso (14.9:1)                  */

  /* Acción por defecto (espresso, 30 %): botón relleno, segmento elegido, foco */
  --ds-action:        #2B2119;
  --ds-action-hover:  #3D2F24;
  --ds-action-pressed:#1E1712;
  --ds-on-action:     #FBF8F2;  /* 14.9:1                                        */
  --ds-action-soft:   #DCCBB0;  /* arena: bordes de selección                    */
  --ds-action-faint:  #F3E7D8;  /* bronce suave: elemento activo, lo «hecho»     */
  --ds-action-ink:    #7A5228;  /* bronce oscuro: enlaces y texto sobre faint    */

  /* Acento (bronce, 10 %): marca, nunca relleno de botón */
  --ds-accent:        #9A6B3A;  /* marcadores, barras, iconos; texto solo ≥ 24px  */
  --ds-accent-ink:    #7A5228;  /* texto pequeño en bronce: etiquetas (6.3:1)    */
  --ds-accent-soft:   #F3E7D8;  /* fondo bronce suave, ::selection               */
  --ds-accent-on-dark:#C79A68;  /* bronce sobre espresso (6.2:1)                 */

  /* Semánticos (base = texto AA; -soft = fondo; -ink = texto sobre -soft) */
  --ds-success: #4E7449; --ds-success-soft: #E5ECDF; --ds-success-ink: #3F6A3A; /* salvia    */
  --ds-warning: #8A5E0E; --ds-warning-soft: #F7ECD5; --ds-warning-ink: #8A5E0E; /* ocre      */
  --ds-danger:  #A3442A; --ds-danger-soft:  #F6E3DB; --ds-danger-ink:  #A3442A; /* terracota */
  --ds-info:    #4F6B85; --ds-info-soft:    #E3EAF0; --ds-info-ink:    #3C5872; /* pizarra   */

  --ds-font-display: 'Cormorant Garamond', 'Cormorant', Georgia, serif;  /* 500–700 + itálica */
  --ds-font-body:    'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif; /* 400–800 */

  /* Radios: píldora botones y segmentados · 10px campos · 14px tarjetas, menús
     y snack-bar · 20px diálogos y hojas · 6px insignias.
     Spacing: escala --ds-space-* (4px–128px). Type: --ds-text-*, mínimo 14px para
     leer; --ds-text-label (12px) solo para etiquetas en mayúsculas. */
  /* Foco: --ds-focus-ring (box-shadow, doble anillo superficie + espresso),
     --ds-focus-ring-dark (sobre espresso, anillo crema) y --ds-focus-outline. */
  /* Sombras: --ds-shadow-* teñidas de madera rgba(60,40,20,…), nunca negro puro. */
}
```

### Cambios frente a la referencia
Los valores salen de las variables de `agencia-inmobiliaria`, salvo cinco que no pasaban AA:
texto apagado `#968878` → `#6E6156`, bronce en texto pequeño `#9A6B3A` → `#7A5228`, error
`#B4553A` → `#A3442A`, borde de campo `#DDD1BF` → `#988670`, aviso `#93650F` → `#8A5E0E`.

### Tokens retirados
De Trait rouge ya no existen `--ds-cta`, `--ds-cta-hover`, `--ds-cta-pressed`, `--ds-on-cta`,
`--ds-mark` ni `--ds-stretch-*`, ni la clase `.ds-cta`. Tampoco el legado anterior
(`--ds-gold*`, `--gold`, `--bs-*`, `--ds-text-xs`…). `node scripts/validate-ds-tokens.mjs`
señala cualquier `var(--ds-*)` que no esté definido.

### Superficies oscuras (tarjeta de la siguiente etapa, panel de login, grabador de vídeo, visor 3D)
- `--ds-dark-surface` (#2B2119, espresso) · `--ds-dark-surface-deep` (#1E1712)
- `--ds-scan-bg` (#16110D): fondo del visor 3D y de las imágenes de escaneo
- Encima: texto `--ds-ink-inverse`, secundario `--ds-ink-inverse-muted` (9.2:1), acento
  `--ds-accent-on-dark`, botones crema con texto espresso, foco `--ds-focus-ring-dark`
- `--ds-danger-on-dark` (#F6B3A5) + `--ds-danger-on-dark-hover` (#F9CBC0)

## Botones
- Relleno: `mat-flat-button` (píldora espresso, texto crema): la acción principal de la vista
  o de un diálogo
- Secundario: `mat-stroked-button` (píldora, borde `--ds-ink-faint`, texto espresso)
- Texto: `mat-button` (texto espresso)
- Destructivo irreversible: relleno terracota con icono y texto
- El bronce **nunca** es el relleno de un botón: marca, no actúa
- Páginas públicas: `.button` de `site-base.css` (píldora espresso) y `.button--outline`

## Typography
- **Cormorant Garamond** 600 en títulos (`h1`–`h6` globales en `base.css`), precios, horas
  y cifras grandes; 500 para cifras de KPI. Itálica 500–600 solo para la palabra en bronce
- **Manrope** 400–800 para todo lo demás, con `font-feature-settings: "ss01", "cv11"` (en `body`)
- Cifras siempre con `font-variant-numeric: lining-nums tabular-nums`: Cormorant trae cifras
  de estilo antiguo por defecto
- Escala de tokens sobre 16px. **Mínimo 14px** para leer (`--ds-text-sm`). Única excepción:
  `--ds-text-label` (12px) en etiquetas en mayúsculas (`--ds-tracking-label`, 0.2em, peso 700):
  en `--ds-ink-muted` para grupos de navegación, cabeceras de tabla y etiquetas de KPI; en
  `--ds-accent-ink` para la etiqueta sobre un título. Y la etiqueta flotante de los campos
  de Material (12px, sin token oficial)
- Una palabra en cursiva bronce (`--ds-accent`, ≥ 24px) **solo** en el saludo del dashboard
  y en los títulos de la landing
- «·» permitido en líneas de metadatos (`Dossier E3D-014 · étape 4 sur 6`)
- Sentence case en títulos, botones y texto. Sin etiquetas monoespaciadas ni numeración
  entre corchetes

## Iconography
- **Material Symbols Outlined** a peso 300 (`opsz,wght,FILL,GRAD@24,300,0,0`) vía `mat-icon`
  (fuente por defecto fijada en `app.config.ts`). `index.html` carga solo el subconjunto usado
  (`icon_names=`, orden alfabético); `node scripts/icons.mjs --write` lo regenera y
  `npm run lint:css` falla si se desfasa. Un icono dinámico (`<mat-icon>{{ x.matIcon }}</mat-icon>`)
  lee de una propiedad `matIcon: 'nombre'` para que el script lo detecte.
- Icono que depende de un dato (tipo de evento, estado, aviso): un mapa
  `{ clave: { matIcon: 'nombre' } }` en el componente, nunca un ternario con nombres de icono.
- Un icono que cambia con el estado dentro de un `mat-button` va en dos ramas `@if` estáticas,
  cada una con su `<mat-icon>` (el script lo ve y el botón conserva un nodo raíz por rama, NG8011).

## Pantallas de la app (patrones vigentes)
La composición de cada pantalla se rehace en las fases 1–4; estos patrones técnicos siguen.
- Chips de estado: nunca bronce relleno; el neutro va sobre lino oscuro. `app-status-chip` lee
  `state.<estado>`; con `prefijo` usa otro espacio de claves.
- Barra de etapas (`app-stage-line`): pista en `--ds-band`, tramo recorrido y puntos hechos en
  bronce, la etapa actual con halo `--ds-accent-soft`, pendientes huecos con borde
  `--ds-ink-faint`. La etapa la dice el texto «Étape n sur 6», no el color.
- Etiquetas que solo necesita el lector de pantalla: `cdk-visually-hidden`.
- Rejillas: columnas `minmax(0, 1fr)`, nunca `1fr` a secas ni pistas implícitas. En una fila
  con un campo con ayuda, `align-items: start`.
- `mat-button-toggle` como filtro: segmentado píldora, el elegido en espresso con texto crema,
  el recuento dentro de la opción. En móvil, si no caben, rejilla de píldoras sueltas.
  Nombre accesible con el input `[aria-label]` (no `[attr.aria-label]`).
- Tarjeta enlazada: el título es el enlace y su `::after` cubre la tarjeta; el anillo de foco
  sale de `:has(a:focus-visible)`. Foto en caja con `aspect-ratio`: imagen `position: absolute`.
- Fotos, vídeos y tours se abren con `abrirVisor()` (`shared/ui/media-viewer`); el tour en
  la página se muestra con `app-tour-poster`.
- Seguimiento de obra: `mat-slider` con la pista inactiva visible, fases y actividades como
  botones con `aria-pressed`, pasos con `aria-current="step"`.
- Vídeos de presentación: opciones en `mat-menu`; dentro de un `<dialog>` nativo, selects
  `select matNativeControl` (el overlay del CDK queda debajo del top layer).
- Hojas compartidas (`styleUrls: ['…/hoja.css', './x.component.css']`): `lista.css` (`ls-`),
  `alta.css` (`fc-`), `ficha.css` (`fi-`), `obras-lista.css` (`cml-`), `catalogo-lista.css`
  (`cl-`), `catalogo-form.css` (`cf-`). Ver `DESIGN_GUIDELINES.md` §5.
- Tablas anchas: desde 768px (1200px en ofertas, contratos, obras, archivados; 1400px en
  eventos IA); texto largo de celda recortado en un `<span>` con `line-clamp`, nunca el `<td>`.
- Borrar o archivar: botón de texto terracota que abre una confirmación en línea
  (`role="alertdialog"`, confirmar terracota relleno). Sin `confirm()` ni diálogos.
- Campo con `[formControlName]` dinámico: añade `[attr.name]` para `app-campos-faltantes`.
- Tarjetas que dependen de su hueco: `container-type: inline-size` + `@container`.
- Avisos efímeros (`components/toast`): pila abajo a la derecha (a lo ancho en móvil), tono
  `-soft` con su `-ink`, borde, icono y texto; `role="alert"` para error y aviso, `status` para
  el resto; entrada con `animate.enter`, salida solo opacidad.

## Armazón de la app (fase 1)
- Escritorio: barra superior crema (`--ds-surface-bar`) con la marca, el idioma y el avatar;
  barra lateral agrupada con etiquetas en mayúsculas y la entrada activa en una tarjeta vélin
  con su marca de bronce.
- Móvil: barra superior y pestañas inferiores de Material para el cliente (Accueil · Mes
  dossiers · Offres · Plus); roles internos con cajón lateral.
- Cliente: la siguiente etapa en una tarjeta espresso, como la cifra principal de la referencia.
- Objetivos táctiles ≥ 44px, `safe-area-inset-*`, enlace «Aller au contenu».
- `.page-wrapper`: 16px de margen lateral en móvil, 24px desde 768px, 32px desde 1200px.
- Hasta la fase 1, el armazón conserva la composición de Trait rouge con la piel nueva.

## Visor 3D
- **Matterport** se queda (iframe de `url_tour`, en `media-viewer` a pantalla completa).
  Un visor propio con Three.js sería un proyecto aparte: necesita un modelo 3D por dossier.
- Controles alrededor del visor en Angular Material; fondo `--ds-dark-surface-deep`.
- En la fase 1 se revisa en el teléfono: alto con `dvh`, gestos sin secuestrar el scroll,
  controles al alcance del pulgar.

## Landing y páginas públicas
- Solo tema claro; el idioma va en la cabecera. CSS propio con CSS grid y pulido de Emil
  Kowalski; de Material solo `mat-icon`, `mat-icon-button` y `mat-menu` (ya los carga el armazón).
- Una cabecera y un pie para las tres páginas: `app-site-header` (`pagina` marca el enlace con
  `aria-current`; `ctaRelleno` decide si «Créer mon dossier» va relleno o de contorno) y
  `app-site-footer`. CSS común en `public-site/styles/`: `site-base.css` y `site-blocks.css`.
- Un solo botón relleno a la vista con la misma acción: el del hero; mientras se ve, el de la
  cabecera va de contorno. En Entrepreneurs lo principal es postular: «Créer mon dossier» de
  la cabecera va siempre de contorno.
- Imágenes con `NgOptimizedImage` y copias web. El escaneo del hero, sin cotas ni barrido.
- Formulario: por debajo de 768px, tres pasos con «Étape n sur 3»; cada paso valida lo suyo y
  lleva el foco al primer error. Los tres bloques siempre en el DOM (`[hidden]`).
- Placeholders: nunca un valor de ejemplo. Un formato va en una ayuda bajo el campo, con
  `aria-describedby`, sustituida por el error cuando lo hay.
- FAQ en acordeón propio (`aria-expanded`, `grid-template-rows` 0fr → 1fr, respuesta `inert`).
- Francés: espacio de no separación antes de `? ! : ;` en los textos (` `).
- Copy: en la landing se puede fusionar, reordenar y recortar (acordado), marcando los textos
  nuevos para revisión.

## Motion stance
- Sobria. Lo que responde a una acción (abrir, expandir, confirmar, cambiar de paso) sí;
  entradas en cascada por reflejo, no. La landing puede tener un momento orquestado (fase 1).
- Curvas y duraciones con `--ds-ease-*` / `--ds-duration-*` (`--ds-ease-out` =
  `cubic-bezier(0.2, 1, 0.3, 1)`). Reduced-motion cubierto globalmente.
- Sin `@angular/animations` (y sin `provideAnimations()`): CSS, WAAPI o `animate.enter` / `animate.leave`.

## Reglas de contraste
- Texto sobre `-soft` / `-faint` → su `-ink`
- Bronce `--ds-accent` como texto solo a 24px o más (4.2:1); en pequeño, `--ds-accent-ink` (6.3:1)
- Errores en terracota `--ds-danger` (5.6:1 sobre lino), siempre con icono y texto
- `--ds-ink-faint` solo gráficos y bordes (3.2:1 sobre lino, 3.5 sobre vélin); el texto
  terciario es `--ds-ink-muted`
- En Material, `primary` también es color de texto: el espresso (14.4:1) lo cumple

## Bans
- Gradientes decorativos (en especial morado-rosa) · reinstalar Bootstrap / ng-bootstrap
- Emojis decorativos · UI genérica sin postura estética
- Fondos negros (#000) · sombras rgba(0,0,0,..) · iconos filled
- Amarillo/negro de señal de peligro
- Bronce como relleno de botón · bronce `--ds-accent` en texto de menos de 24px
- Texto por debajo de 14px fuera de las etiquetas en mayúsculas
- Cursiva bronce fuera del saludo y de los títulos de la landing
- Radios fuera de la escala 6 / 10 / 14 / 20 / pill

## Angular Material (M3)
Tema en `src/styles/material-theme.scss` (único `.scss`), con `use-system-variables`:
cada rol `--mat-sys-*` apunta a un token `--ds-*`.
- `primary` → `--ds-action` (espresso) · `on-primary` → `--ds-on-action`
- `primary-container` / `secondary-container` / `inverse-primary` → `--ds-action-faint`, con
  `--ds-action-ink` encima
- `surface` / `surface-container` → `--ds-surface` · `surface-container-highest` → `--ds-bg-alt`
  · `surface-dim` → `--ds-band` · `inverse-surface` → `--ds-dark-surface`
- `on-surface-variant` → `--ds-ink-muted` · `outline` → `--ds-ink-faint` · `error` → `--ds-danger`
- Tipografía: Manrope en todos los componentes; título de los diálogos en Cormorant 600
- Formas: botones y segmentados píldora · campos 10px · tarjetas, expansion, menús,
  autocomplete, snack-bar y datepicker 14px · diálogos y bottom sheet 20px
- Segmento elegido de `mat-button-toggle`: espresso con texto crema (global, en el tema)
- Tabla completa y reglas de uso: `DESIGN_GUIDELINES.md` §4.

## Fases del rediseño
0. **Base Lin et bronze (hecho, 23-nov-2026)**: fuera los restos de Trait rouge (tomate,
   `--ds-mark`, `.ds-cta`, Archivo y sus anchos, la cota del hero y de la barra de etapas);
   paleta nueva sobre los mismos nombres semánticos; Cormorant Garamond + Manrope; Material
   Symbols a peso 300; tema de Material (píldora / 10 / 14 / 20, segmento elegido en espresso,
   títulos de diálogo en Cormorant); cifras `lining-nums`; docs. La app entera cambia de piel;
   los comentarios de cabecera de cada pantalla se reescriben en su fase.
1. Cara al cliente: armazón (barra superior + lateral agrupada; pestañas inferiores en móvil),
   dashboard del cliente, visor 3D en el móvil, login y registro, landing (CSS grid + Emil).
   También la marca (hoy, cuadro con escuadra) y la banda de pasos del dashboard sin tour.
2. Resto del cliente y páginas públicas (Le Journal, Entrepreneurs).
3. Contratista.
4. Estimador y admin.

Historial: Clarté (6-nov-2026) → Trait rouge (20 al 23-nov-2026, cerrado en el commit
`38ddb15` de `redesign/clarte`) → Lin et bronze (rama `redesign/lin-bronze`).

## Stack output contract
- Componentes **Angular 22 standalone**, `OnPush`, signals (`input()`/`signal()`),
  nuevo control flow (`@if`/`@for` con `track`). NUNCA `*ngIf`/`*ngFor`, NgModules,
  ni `@Input()`/`@Output()`.
- CSS plano por componente con `:host` (no SCSS salvo el tema `material-theme.scss`, no Tailwind).
- Bootstrap desinstalado: no hay clases globales salvo `.page-wrapper` (`components.css`) y
  `.e3d-viewer-pane` (`styles.css`). Estilos globales, en este orden (`angular.json`):
  `material-theme.scss` → `base.css` (reboot de elementos, sin clases) → `tokens.css` →
  `components.css` → `styles.css`. Controles, menús, overlays y diálogos con
  **Angular Material 22**. **NO** HTML suelto ni JSX.

## Exports
`tokens.css` (`--ds-*`) es la fuente de verdad. El detalle completo (tabla de
paleta, tema de Material, hojas compartidas y patrones) está en `DESIGN_GUIDELINES.md`. Para Tailwind/DTCG/shadcn: este proyecto NO los usa.
