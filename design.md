# Design — Proyecto Angular 22 (Trait rouge)

> **Dirección aprobada: Trait rouge** (20-nov-2026; sustituye a Clarté, del
> 6-nov-2026). El rediseño completo se hizo por fases, de la 0 a la 4, todas cerradas el
> 23-nov-2026 (ver abajo). Este archivo
> resume el sistema; el detalle está en `DESIGN_GUIDELINES.md` y los valores
> reales en `src/styles/tokens.css`. Siguen vigentes: el contrato de stack, el
> uso de tokens `--ds-*` (sin hex sueltos ni nombres `--color-*`) y el contraste AA.

## System
- Genre: marketplace de remediación residencial con escaneo 3D (Montréal)
- Público: propietarios con un problema (moho, daños por agua, amianto,
  aislamiento, cimientos) y contratistas certificados
- Vibe: "calma analógica con un acento que despierta la interacción". Papel
  crema, estructura en abeto, un trazo rojo tomate para lo que toca hacer ahora
- Reparto: 60 % crema clásica, 30 % verde abeto, 10 % rojo tomate
- Axes: superficies crema / una sola familia (Archivo) cuyo ancho hace de voz /
  abeto como acción por defecto y tomate solo para la siguiente etapa
- Firma: la **cota arquitectónica** (línea de medida), con trazo tomate sobre el
  escaneo. Solo para medidas reales; la línea de 6 etapas del dossier va en abeto

## Tokens (canonical — `src/styles/tokens.css` is the SOURCE OF TRUTH)
> Real token names are `var(--ds-*)`. Generated code MUST use these exact
> names. Do NOT invent `--color-*` names.

```css
:root {
  /* Superficies (60 %) */
  --ds-bg:            #EEE2CB;  /* Crema clásica: página                       */
  --ds-bg-alt:        #F1E8D6;  /* rellenos sutiles: hover de filas, cabeceras  */
  --ds-band:          #E4D5B9;  /* Kraft: bandas de sección                     */
  --ds-surface:       #F8F2E6;  /* Vélin: tarjetas, paneles, campos, hojas      */
  --ds-surface-elevated: #FBF7EF; /* modales y overlays                         */

  /* Tinta (abeto noche) */
  --ds-ink:           #142A20;  /* 11.9:1 sobre bg, 13.6 sobre surface          */
  --ds-ink-secondary: #2E3F35;  /* 8.7:1 sobre bg                               */
  --ds-ink-muted:     #4A5547;  /* 6.1:1 sobre bg, 5.4 sobre band               */
  --ds-ink-faint:     #6F7A68;  /* liquen: solo gráficos y contorno de campos   */
  --ds-ink-inverse:   #F8F2E6;  /* texto sobre abeto (9.7:1)                    */

  /* Acción por defecto (abeto, 30 %): enlaces, botón relleno, foco, selección */
  --ds-action:        #1B4532;  /* 8.4:1 sobre bg · vélin encima 9.7:1          */
  --ds-action-hover:  #163A2A;
  --ds-action-pressed:#112E21;
  --ds-on-action:     #F8F2E6;
  --ds-action-soft:   #C5D3C0;  /* bordes de selección                          */
  --ds-action-faint:  #DDE5D6;  /* fondos de selección, elemento activo         */
  --ds-action-ink:    var(--ds-action);

  /* Siguiente etapa (tomate, 10 %): un botón por vista, nunca texto */
  --ds-cta:           #D23A22;  /* blanco encima 4.8:1                          */
  --ds-cta-hover:     #B5301B;
  --ds-cta-pressed:   #9C2815;
  --ds-on-cta:        #FFFFFF;
  --ds-mark:          #EE4129;  /* solo gráfico: cotas, barrido, punto de aviso */

  /* Semánticos (base = texto AA; -soft = fondo; -ink = base) */
  --ds-success: #1B4532;  --ds-success-soft: #DDE5D6;  /* lo que avanza        */
  --ds-warning: #7A4F00;  --ds-warning-soft: #F5E6C4;  /* lo que pide tu acción */
  --ds-danger:  #A1251B;  --ds-danger-soft:  #F6DDD3;  /* errores: ladrillo     */
  --ds-info:    #245B78;  --ds-info-soft:    #DCE6E6;

  --ds-font-display: 'Archivo', 'Helvetica Neue', Arial, system-ui, sans-serif;
  --ds-font-body:    'Archivo', 'Helvetica Neue', Arial, system-ui, sans-serif;
  /* Ancho: --ds-stretch-display 125 % · -heading 112 % · -body 100 % ·
     -figure 75 % (cifras, con tabular-nums). Pesos 400–800.               */

  /* Radios: 6px botones/campos/menús · 12px tarjetas · 20px hojas/diálogos.
     Spacing: escala --ds-space-* (4px–128px). Type: --ds-text-*, mínimo 14px. */
  /* Foco: --ds-focus-ring (box-shadow, doble anillo superficie + abeto),
     --ds-focus-ring-dark (sobre abeto, anillo vélin) y --ds-focus-outline. */
  /* Sombras: --ds-shadow-* teñidas de abeto noche, nunca negro puro.      */
}
```

### Tokens retirados
Con la fase 4 desapareció todo el legado: los alias `--ds-gold*` y `--ds-shadow-gold`, las
variables sin prefijo de `src/styles.css` (`--gold`, `--ink-900`, `--warm-*`…), las `--bs-*`,
`--ds-ink-on-accent` (usa `--ds-on-action`), `--ds-tracking-widest` y `--ds-text-2xs` / `-xs`
(el mínimo es `--ds-text-sm`, 14px). De Clarté tampoco quedan `--ds-stone` (ahora `--ds-band`)
ni los tokens menthe `--ds-scan*` (ahora `--ds-action-faint`). Si un código viejo los nombra,
`node scripts/validate-ds-tokens.mjs` lo señala.

### Superficies oscuras (bandas abeto, panel de login, grabador de vídeo, visor 3D)
- `--ds-dark-surface` (#1B4532, abeto) · `--ds-dark-surface-deep` (#142A20, abeto noche)
- `--ds-scan-bg` (#0E1712): fondo del visor 3D y de las imágenes de escaneo
- Encima: texto `--ds-ink-inverse`, secundario `--ds-ink-inverse-muted` (6.6:1),
  botones vélin con texto abeto, foco `--ds-focus-ring-dark`. **Sin tomate** sobre abeto
  (2.3–2.8:1). El grabador de vídeo (burbuja, barra, ventana flotante) usa estos tokens.
- `--ds-danger-on-dark` (#F6B3A5) + `--ds-danger-on-dark-hover` (#F9CBC0)

## CTA voice
- Siguiente etapa: `mat-flat-button` + clase `.ds-cta` (tomate, texto blanco, radio 6px).
  **Como mucho uno por vista**: crear el dossier, aceptar la oferta, firmar
- Relleno normal: `mat-flat-button` (abeto, texto vélin): la acción principal cuando
  no hay siguiente etapa, o confirmar en un diálogo
- Secundario: `mat-stroked-button` (borde `--ds-ink-faint`, texto abeto). Es el que
  acompaña a un `.ds-cta`: el tomate nunca toca un botón abeto relleno
- Texto: `mat-button`

## Typography
- **Archivo**, una sola familia variable. El ancho es la voz: 125 % en el hero y el
  título de pantalla (peso 800), 112 % en títulos de sección (700), 100 % para leer,
  75 % con `tabular-nums` para precios, medidas y contadores
- Escala de tokens sobre 16px, **mínimo 14px** (`--ds-text-sm`; ya no hay tokens menores).
  Excepción: la etiqueta flotante de los campos de Material, 12px, sin token oficial
  para cambiarla
- Los `h1`–`h6` globales (`src/styles/base.css`) van en Archivo 700 al 100 %; cada pantalla
  fija su tamaño y su ancho en el CSS del componente
- Sentence case siempre. Sin etiquetas en mayúsculas espaciadas, sin etiquetas monoespaciadas,
  sin cadenas "A · B · C", sin numeración entre corchetes, sin resaltar una sola palabra del título

## Iconography
- **Material Symbols Outlined** vía `mat-icon` (fuente por defecto fijada en `app.config.ts`).
  `index.html` carga solo el subconjunto usado (`icon_names=`, orden alfabético);
  `node scripts/icons.mjs --write` lo regenera y `npm run lint:css` falla si se desfasa.
  Un icono dinámico (`<mat-icon>{{ x.matIcon }}</mat-icon>`) lee de una propiedad
  `matIcon: 'nombre'` para que el script lo detecte.
- Todas las pantallas usan solo Material Symbols; `bootstrap-icons` está desinstalado.
- Icono que depende de un dato (tipo de evento, estado, aviso): un mapa
  `{ clave: { matIcon: 'nombre' } }` en el componente, nunca un ternario con nombres de icono
  (`cond ? 'a' : 'b'`), que el script no ve.
- Un icono que cambia con el estado dentro de un `mat-button` (pausa/reanudar, ampliar/reducir)
  va en dos ramas `@if` estáticas, cada una con su `<mat-icon>`: así el script lo incluye en el
  subconjunto y el botón conserva un solo nodo raíz por rama (NG8011).

## Pantallas de la app (cliente)
- Título de pantalla (`app-page-header`) en display 125 %; títulos de sección 112 %; importes,
  porcentajes, contadores y «Étape n sur 6» al 75 % con `tabular-nums`.
- Dashboard: el único tomate es el botón de «Prochaine étape» (ver ofertas, ver el contrato,
  seguir la obra) o, sin dossiers, «Créer mon premier dossier». «Nouveau dossier» en la
  cabecera es de contorno. Abrir el tour 3D no hace avanzar el dossier: su botón va en abeto.
- Chips de estado: nunca tomate; el neutro va sobre kraft. `app-status-chip` lee `state.<estado>`;
  con `prefijo` usa otro espacio de claves (`contract_list.status_` en contratos).
- Acción de siguiente etapa repetida en una lista (varias firmas pendientes, varias ofertas): solo
  la primera pendiente —o la que se está confirmando— es tomate; las demás, abeto relleno.
- Etiquetas que solo necesita el lector de pantalla: clase `cdk-visually-hidden` (o el patrón
  visually-hidden en el CSS del componente cuando la etiqueta solo se oculta en móvil).
- Rejillas: columnas `minmax(0, 1fr)`, nunca `1fr` a secas ni pistas implícitas (crecen hasta el
  min-content y desbordan en móvil). En una fila con un campo con ayuda, `align-items: start`.
- `mat-button-toggle`: su nombre accesible va con el input `[aria-label]`; `[attr.aria-label]` se
  queda en el host y el botón interno se anuncia por la ligadura del icono.

## Pantallas de la app (contratista)
- Listas (dossiers disponibles, mis ofertas, seguimiento de obra): filtro de estado con
  `mat-button-toggle-group` y el recuento dentro de cada opción (sin píldoras KPI aparte);
  conmutador tarjetas/tabla con la tabla solo desde 768px. Por debajo de 800px los toggles
  pasan a rejilla: «Tous» a lo ancho y el resto 2 × 2, divisor transparente y borde en cada uno.
- Tarjeta enlazada: el título es el enlace y su `::after` cubre la tarjeta; el anillo de foco
  sale de `:has(a:focus-visible)`.
- Foto en una caja con `aspect-ratio`: la imagen va `position: absolute; inset: 0`, o estira la caja.
- Los servicios devuelven `'—'` para un dato oculto o archivado: la plantilla lo filtra con
  `hay()` en lugar de pintar una fila vacía.
- Fotos, vídeos y tours se abren con `abrirVisor()` (`shared/ui/media-viewer`); nada de
  lightboxes propios ni iframes en la página (el tour se muestra con `app-tour-poster`).
- Tomate: dashboard «Voir les dossiers disponibles»; dossiers disponibles, solo la primera
  tarjeta que admite oferta; hacer oferta «Envoyer l'offre»; mis ofertas y mi oferta, ninguno.
  Seguimiento de obra: «Enregistrer le rapport», salvo cuando el admin ve «Compléter le
  contrat»: entonces ese es el único tomate y guardar pasa a abeto.
- Seguimiento: `mat-slider` con la pista inactiva visible (`--mat-slider-inactive-track-*`),
  fases y actividades como botones con `aria-pressed`, pasos con `aria-current="step"`.
- Vídeos de presentación (`shared/ui/presentacion-videos`): opciones en `mat-menu`; dentro de
  un `<dialog>` nativo, los selects son `select matNativeControl` (la lista de `mat-select` se
  abre en el overlay del CDK, que queda debajo del top layer de un diálogo modal); el icono
  de grabar va en ladrillo y eliminar o descartar, en ladrillo relleno con icono y texto.

## Pantallas de la app (estimador y admin)
- Hojas compartidas, incluidas con `styleUrls: ['…/hoja.css', './x.component.css']`; cada
  componente añade solo lo suyo:
  - `shared/ui/lista/lista.css` (`ls-`): búsqueda, filtros en `mat-button-toggle` con su
    recuento, tarjetas con el título como enlace estirado, tabla con fila pulsable, esqueleto,
    vacío y error.
  - `shared/ui/alta/alta.css` (`fc-`): alta y edición de dossier (secciones numeradas, raíl con
    resumen y envío, qué falta). También la base de los formularios de catálogo.
  - `shared/ui/ficha/ficha.css` (`fi-`): ficha de dossier (volver + título + meta, dos columnas
    desde 1100px, datos en `<dl>`, fotos, archivos en filas, tours, `fi-drop` para subir,
    `fi-tabs` para `mat-tab-nav-bar`).
  - `shared/construction-monitoring/obras-lista.css` (`cml-`): listas de obras de los tres roles.
  - `admin/_shared/catalogo-lista.css` (`cl-`) y `catalogo-form.css` (`cf-`): tipos de servicio,
    fichas normativas e imprevistos (código al 75 %, textos en tres idiomas, interruptores).
- Tablas anchas: la tabla de `lista.css` aparece desde 768px; una lista con muchas columnas la
  retrasa en su CSS (1200px: ofertas, contratos, obras, archivados; 1400px: eventos IA) y
  muestra tarjetas por debajo. Un texto largo en una celda se recorta en un `<span>` con
  `line-clamp`, nunca en el `<td>` (rompe la tabla).
- Borrar o archivar: botón de texto ladrillo (`cf-del`) que abre un recuadro de confirmación en
  línea (`cf-danger`, `role="alertdialog"`, botón ladrillo relleno); mientras se borra, guardar
  queda desactivado. Sin `confirm()` ni diálogos para esto.
- Campo con `[formControlName]` dinámico (un idioma, una fila de tabla): añade también
  `[attr.name]` para que `app-campos-faltantes` encuentre su etiqueta.
- Tarjetas que cambian de forma según su contenedor, no según la ventana (ofertas en la
  edición de oferta, contratos del dossier, obra): `container-type: inline-size` + `@container`.
- Tomate: dashboard del estimador «Voir les dossiers» (sin estimación en curso) o «Continuer»
  de la primera en curso; en las listas a estimar, solo la primera tarjeta; en la ficha,
  «Envoyer l'estimation»; crear dossier en listas y altas; en el contrato, «Marquer comme
  signé» o «Marquer comme terminé», nunca los dos. Los catálogos (tipos de servicio, fichas, imprevistos, usuarios)
  son configuración: botón relleno abeto, sin tomate.
- Avisos efímeros (`components/toast`): pila abajo a la derecha (a lo ancho en móvil), tono
  `-soft` con su `-ink`, borde, icono y texto; `role="alert"` para error y aviso, `status` para
  el resto; entrada con `animate.enter` (8px + opacidad), salida solo opacidad.

## Armazón de la app
- Escritorio (≥ 992px): barra lateral vélin con filete, 264px (72px plegada), navegación
  por rol definida en `app.component.ts`; activo = fondo `--ds-action-faint`, texto
  `--ds-action-ink` y barra abeto de 3px.
- Móvil: barra superior vélin (marca, idioma en `mat-menu`, avatar → perfil).
  Cliente: pestañas inferiores Accueil · Mes dossiers · Offres reçues · Plus; «Plus» abre
  un `mat-bottom-sheet` con el resto. Roles internos: cajón lateral con backdrop `--ds-overlay`.
- Marca: cuadro abeto con una cota vélin en la esquina; sobre abeto, invertida.
- Objetivos táctiles ≥ 44px, `safe-area-inset-*`, enlace «Aller au contenu».
- `.page-wrapper`: 16px de margen lateral en móvil, 24px desde 768px, 32px desde 1200px.

## Landing y páginas públicas
- Solo tema claro. Sin selector Sombre/Clair ni controles flotantes: el idioma va en la cabecera
  (segmentado desde 1200px, `mat-menu` por debajo, como la barra de la app).
- Una sola cabecera y un solo pie para las tres páginas: `app-site-header` (`pagina` marca el
  enlace con `aria-current`; en la landing los enlaces a sus secciones emiten `irA`, fuera van a
  `/#seccion`; `ctaTomate` decide si «Créer mon dossier» es tomate) y `app-site-footer`.
  CSS común en `public-site/styles/`: `site-base.css` (contenedor, botones, enlace, marca,
  secciones, `.sec--dark`, miga de pan) y `site-blocks.css` (paso numerado, tarjeta de
  especialidad, piezas del formulario), que comparten la landing y Entrepreneurs.
- Seis secciones: escaneo (hero) · problema frente a solución (banda kraft) · tres pasos ·
  especialidades (filas en móvil, 2 × 3 desde 640px, 3 × 2 desde 1024px) · tour 3D (isla abeto
  noche) · formulario. Móvil: botón fijo «Créer mon dossier» entre el final del hero y el formulario.
- Firma: cotas sobre el escaneo, solo con medidas reales del plano. Líneas en SVG con `--ds-mark`,
  etiquetas en HTML sobre vélin (≥ 14px con `cqi`). Barrido único de 1.6s con `--ds-ease-in-out`:
  línea tomate, velo y cotas comparten curva; arranca al cargar la imagen. Con reduced motion,
  cotas visibles sin barrido.
- CSS propio del componente; de Material solo `mat-icon`, `mat-icon-button` y `mat-menu` (ya
  cargados por el armazón). Botón `.button` de `site-base.css`, campos de 48px a 16px con borde
  `--ds-ink-faint`; menú móvil en `<dialog>` nativo.
- Imágenes con `NgOptimizedImage` y copias web (`*-800.jpg`, `scan-render-1-1400.jpg`).
- «Créer mon dossier» es la siguiente etapa y va en tomate, **un solo botón tomate a la vista**:
  el del hero; al salir el hero, el de la barra fija (móvil) o el de la cabecera (escritorio, de
  contorno mientras el hero se ve); al llegar al formulario, el de enviar.
- Formulario: por debajo de 768px, tres pasos (Vos coordonnées · La propriété · Votre demande)
  con «Étape n sur 3», barra de tres tramos en abeto, «Continuer» tomate y «Retour» de texto.
  Cada paso valida lo suyo y lleva el foco al primer error; al cambiar de paso, el foco va al
  título y el formulario sube bajo la cabecera. Desde 768px, los tres grupos a la vez con su
  título. Los tres bloques siempre están en el DOM (`[hidden]`): el resumen de campos faltantes
  lee sus etiquetas.
- Placeholders: nunca un valor de ejemplo (nombres, teléfonos, direcciones), que se lee como ya
  escrito. Un formato va en una ayuda bajo el campo, enlazada con `aria-describedby` y sustituida
  por el error cuando lo hay. Solo quedan los placeholders que son instrucción (descripción, mensaje).
- Le Journal: miga de pan, título display, filtro de categorías (botones con `aria-pressed`,
  el elegido relleno abeto), fichas de igual alto y «En vedette» sobre kraft. Sin barrido ni
  entradas animadas.
- Entrepreneurs: la siguiente etapa es postular, así que el tomate es «Postuler comme partenaire»
  (hero) y «Soumettre ma candidature» (envío), nunca a la vez en pantalla; «Créer mon dossier» de
  la cabecera va de contorno. Hero con la ficha del dossier (plano real + lo que trae), problema
  sobre kraft, cuatro pasos, ventajas en tarjetas vélin,
  exigencias y FAQ con la cabecera fija a la izquierda, dominios con las mismas fotos que las
  especialidades de la landing, y cierre en la isla abeto noche con un botón vélin. FAQ en
  acordeón propio (`aria-expanded`, `grid-template-rows` 0fr → 1fr, respuesta cerrada `inert`).
- Francés: espacio fino de no separación antes de `? ! : ;` en los textos (`\u00a0`): si no, el
  signo puede quedar solo al principio de línea.

## Motion stance
- Sobria. Un solo momento orquestado por pantalla (en la landing: el barrido del escaneo).
- Movimiento que responde a una acción (abrir, expandir, confirmar) sí; entradas en cascada por reflejo, no.
- Curvas y duraciones con `--ds-ease-*` / `--ds-duration-*`. Reduced-motion cubierto globalmente.
- Sin `@angular/animations` (y sin `provideAnimations()`): CSS, WAAPI o `animate.enter` / `animate.leave`.

## Reglas de contraste
- Texto sobre `-soft` / `-faint` → su `-ink`
- Tomate: nunca texto. `--ds-cta` solo como relleno con blanco encima (4.8:1); `--ds-mark` solo
  como trazo (3.0:1 sobre crema, 3.5 sobre vélin), nunca sobre kraft ni abeto
- Errores en ladrillo `--ds-danger` (5.9:1 sobre crema), siempre con icono y texto
- `--ds-ink-faint` solo gráficos (3.5:1 sobre crema); el texto terciario es `--ds-ink-muted`
- En Material, el rol `primary` también es color de texto: el abeto (8.4:1) lo cumple

## Bans
- Gradientes decorativos (en especial morado-rosa) · reinstalar Bootstrap / ng-bootstrap
- Emojis decorativos · UI genérica sin postura estética
- Fondos negros (#000) · sombras rgba(0,0,0,..) · iconos filled
- Amarillo/negro de señal de peligro
- Más de un botón tomate por vista · tomate como texto, sobre abeto o junto a un botón abeto relleno
- Radios fuera de la escala 4 / 6 / 12 / 20 / pill

## Angular Material (M3)
Tema en `src/styles/material-theme.scss` (único `.scss`), con `use-system-variables`:
cada rol `--mat-sys-*` apunta a un token `--ds-*`.
- `primary` → `--ds-action` · `on-primary` → `--ds-on-action`
- `primary-container` / `secondary-container` / `inverse-primary` → `--ds-action-faint`
- `surface` / `surface-container` → `--ds-surface` · `surface-container-highest` → `--ds-bg-alt`
  · `surface-dim` → `--ds-band` · `inverse-surface` → `--ds-dark-surface`
- `on-surface-variant` → `--ds-ink-muted` · `outline` → `--ds-ink-faint` · `error` → `--ds-danger`
- El tomate no es un rol: vive en la clase `.ds-cta` (`mat.button-overrides`, al final del tema)
- Formas: botones, campos, menús, snack-bar 6px · tarjetas, expansion 12px · diálogos, bottom sheet 20px
- Tabla completa y reglas de uso: `DESIGN_GUIDELINES.md` §4.

## Fases del rediseño
0. Base Trait rouge: limpieza de restos, tokens, Archivo, tema de Material con `.ds-cta`,
   docs (hecho, 20-nov-2026). Las pantallas antiguas ya cambian de piel por los alias.
1. Cara al cliente (hecho, 20-nov-2026): armazón, dashboard del cliente, visor 3D, componentes
   compartidos (`shared/ui`: page-header, empty-state, status-chip, stage-line, dossier-card,
   tour-poster, media-viewer, contratos-expediente, video-ficha), login y registro, landing.
   Anchos tipográficos aplicados, tomate solo en la siguiente etapa, formulario de la landing
   en 3 pasos en móvil.
2. Resto del cliente y páginas públicas (hecho, 20-nov-2026): mis dossiers y su detalle, crear
   dossier, ofertas recibidas y oferta del contratista, contratos, seguimiento de obra,
   documentos, historial, perfil (compartido por los cuatro roles), asistente IA (compartido),
   reproductor de vídeo; Le Journal y Entrepreneurs sobre la cabecera y el pie de la landing.
   Fuera: `SitePageBase`, `SiteThemeService`, `site-chrome.css` y las directivas reveal/sweep.
3. Contratista (hecho, 21-nov-2026): dashboard, dossiers disponibles, hacer oferta, mis ofertas
   y su detalle, lista y seguimiento de obra, y la familia de vídeos de presentación (ranura del
   dossier, biblioteca del perfil, grabador). `ui-base.css` podado de las clases que ya no usa
   ninguna plantilla.
4. Estimador y admin (hecho, 23-nov-2026): dashboards, listas y fichas de dossiers (a estimar,
   en estimación, estimados, archivados), altas y ediciones, clientes, usuarios, ofertas y su
   reparto, contratos, seguimiento de obra, catálogos (tipos de servicio, fichas normativas,
   imprevistos), eventos IA y avisos efímeros, sobre las hojas compartidas `lista`, `alta`,
   `ficha`, `obras-lista`, `catalogo-lista` y `catalogo-form`. Al cerrar: fuera `ui-base.css`,
   `bootstrap-overrides.css`, `bootstrap-icons`, los alias y tokens legados y las utilidades
   sin uso de `styles.css` y `components.css`; el reboot de elementos pasa a `base.css`
   (comparado captura a captura antes y después, sin cambios).

## Stack output contract
- Componentes **Angular 22 standalone**, `OnPush`, signals (`input()`/`signal()`),
  nuevo control flow (`@if`/`@for` con `track`). NUNCA `*ngIf`/`*ngFor`, NgModules,
  ni `@Input()`/`@Output()`.
- CSS plano por componente con `:host` (no SCSS salvo el tema `material-theme.scss`, no Tailwind).
- Bootstrap desinstalado y sin capa de transición: no quedan clases globales salvo
  `.page-wrapper` (`components.css`) y `.e3d-viewer-pane` (`styles.css`). Estilos globales, en
  este orden (`angular.json`): `material-theme.scss` → `base.css` (reboot de elementos, sin
  clases) → `tokens.css` → `components.css` → `styles.css`. El CSS de cada pantalla va en su
  componente con tokens. Controles, menús, overlays y diálogos con **Angular Material 22**.
  **NO** HTML suelto ni JSX.

## Exports
`tokens.css` (`--ds-*`) es la fuente de verdad. El detalle completo (tabla de
paleta, tema de Material, hojas compartidas y patrones) está en `DESIGN_GUIDELINES.md`. Para Tailwind/DTCG/shadcn: este proyecto NO los usa.
