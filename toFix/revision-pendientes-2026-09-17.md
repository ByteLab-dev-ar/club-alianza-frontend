# Revisión de pendientes · 2026-09-17

Lista de trabajo que sale de revisar `PENDIENTES.md` contra el código real del frontend y del backend. Seis agentes, uno por bloque, compararon cada punto con el código; un séptimo intentó refutar 23 de sus afirmaciones: 20 se sostuvieron y 3 estaban mal (están corregidas acá, ver [Correcciones del verificador](#correcciones-del-verificador)). Lo más importante se volvió a comprobar a mano.

- **Código revisado:** frontend `00ea958` (ya pusheado), backend `8e069cf`. Si una línea citada ya no coincide, el código cambió después: verificá antes de arreglar.
- **Qué hay:** 8 arreglos sin decisión · 13 decisiones · 4 pedidos al backend · 5 pruebas a mano · 9 temas menores.
- **Anexo:** al final está el detalle completo de cada punto como lo dejaron los agentes (estado, evidencia con `ruta:línea`, opciones con pros y contras).

## Cómo se usa

1. Se trabaja **en el orden de abajo**: primero los arreglos sin decisión, después las decisiones, después el backend.
2. Las decisiones traen una **recomendación**. Se puede contestar "dale con las recomendadas" o cambiar las que haga falta.
3. Al cerrar un punto se marca su casilla y se anota el commit al lado: `- [x] ARR-1 · … (a1b2c3d)`.
4. Si un punto resulta no ser un problema al tocarlo, se marca con `[~]` y una línea que diga por qué.

## Progreso

- [ ] [Paso 1 · Arreglos sin decisión](#paso-1--arreglos-sin-decisión) · 8 · más o menos medio día
- [ ] [Paso 2 · Decisiones](#paso-2--decisiones) · 11 para ahora + 2 para después
- [ ] [Paso 3 · Pedidos al backend](#paso-3--pedidos-al-backend) · 4 (y 4 para tachar)
- [ ] [Paso 4 · Pruebas a mano](#paso-4--pruebas-a-mano) · 5
- [ ] [Temas menores](#temas-menores) · 9

## Decisiones tomadas · 2026-09-17

Contestadas por Nicolás. Mandan sobre las recomendaciones de abajo cuando difieren.

- **Commits:** uno por arreglo, en español como los del repo; push al final de cada paso verificado.
- **ARR-3 · Botón hero:** en hover el Resplandor **se suma** a la sombra Club (las dos juntas), como dice `DESIGN.md`.
- **DEC-1 · Resumen:** **cuatro gráficos** (Ingresos, Altas y bajas, Deuda y Plantel). Salen Medios de pago y la Pirámide de edades.
- **DEC-2 · Sugerencias de grupo:** **las dos cosas**, tarjeta en el Resumen (solo admin) y número en el menú. Queda anotado que el número necesita cambios en el backend para ser útil (contador, una sugerencia por familia, poder descartarlas).
- **DEC-3 · Historia:** que las tarjetas **terminen de entrar antes** (sin escalonado, tramo corto y fijo). **Primero maqueta y capturas**, después código.
- **DEC-4 · Año que avanza:** **no**. Tachado.
- **DEC-5 · Títulos de la portada:** **se quedan en 3 renglones**. Tachado.
- **DEC-6 · `DESIGN.md`:** se anotan el texto sobre la foto de la portada y los círculos. **El punto y la punta de Historia pierden el Resplandor** (queda reservado para el hover).
- **DEC-7 · Navegación:** **`ScrollRestoration`** del router.
- **DEC-8 · Textos en ámbar:** **el ámbar queda en el ícono o el punto y el texto va en el color normal**; "(anulado)" en gris.
- **DEC-9 · Zip de maquetas:** se rescatan las 3 maquetas a `maquetas/` y el zip va a la Papelera de reciclaje.
- **DEC-10 · Listas:** **una sola, `toFix/`, versionada**. Se borran `ESTADO.md` y `PENDIENTES.md`.
- **DEC-11 · Límites del toaster:** se aceptan (no se preguntó: se aplicó la recomendación).
- **DEC-13 · Propuestas de grupo de los socios:** se diseñan **con `/spec` más adelante**.
- **Pedidos al backend (BACK-1 a 4, contador de sugerencias, rótulos de stats):** se anotan en **`backend/toFix/`** para trabajarlos allá.
- **MEN-2 · Tarjetas del Resumen:** **se saca el número repetido** y los textos usan la palabra de `PRODUCT.md`.
- **MEN-5 · Regla de redondos:** **se reescribe la regla** de `DESIGN.md` según lo que el código ya usa; el código no cambia.
Decisiones nuevas, sobre preguntas que aparecieron al arreglar (misma fecha):

- **DEC-3 aprobada con la maqueta** (`maquetas/historia-entrada/`, capturas en `capturas/`): las tarjetas y los puntos terminan de entrar en un tramo corto y fijo (25vh), sin escalonado. El punto también deja de depender del alto del hito.
- **Hora de los eventos en el panel:** el formulario **acepta texto libre** (hasta 20 caracteres, como el backend), no solo `16:00`.
- **Aviso al confirmar una sugerencia:** la frase final se suaviza a "Si hace falta, se completa desde «Sumar socio»".
- **Baja que deja al grupo sin descuento:** se avisa **solo en ese caso** que el otro jugador pasa a pagar la actividad completa desde el próximo pago.
- **Grupo duplicado por fallas de conexión:** se **espera el endpoint del backend** que crea el grupo con todos sus integrantes de una vez (ya anotado en `backend/toFix/`).
- **Texto de la portada sobre el descuento familiar:** se corrige en la forma **general**, sin números ("Las familias con varios jugadores tienen descuento en la actividad").
- **`EventCard`:** se **borra** (no se usa desde el rediseño de la portada) y se corrigen los dos comentarios que la nombran.
- **Rótulos de las pantallas del panel:** todas muestran arriba **el grupo del menú** (Padrón, Cobros, Contenido, Sistema).
- **Siguen abiertos:** DEC-12 (números del menú con `/admin/pending-work` para solicitudes, pagos y precios), MEN-1 (verde de éxito en texto), MEN-6 (marca de categoría redonda en el panel) y MEN-7 (portada entre 768 y 1023 px con poca altura).

## Hecho el 2026-09-17

Veinticuatro commits en `main`. Cada arreglo tiene el suyo.

| Punto | Commit | Qué quedó |
| --- | --- | --- |
| ARR-1, ARR-6, ARR-7 | `1b1a5a6` | Grupos familiares dice «desde el próximo pago»; confirmar una sugerencia da un solo aviso y no duplica el grupo; el encabezado dice Padrón. |
| ARR-2 | `a1e9397` | La hora en texto libre ya no sale con «hs hs», en las cuatro pantallas. Rescatado del worktree viejo, que después se borró con su rama. |
| ARR-8 | `f32d82d` | Tres comentarios que ya no decían la verdad. |
| ARR-5 | `454eb12` | Las siete listas del panel vuelven solas a la última página con contenido (`src/lib/pagination.ts` + `usePageInRange`). |
| DEC-10 | `7b2140e` | `toFix/` versionado, `ESTADO.md` borrado, `PENDIENTES.md` a la papelera. |
| Portada | `13371d5` | La portada ya no promete descuento «sobre las cuotas». |
| EventCard | `1aa692e` | Borrada la tarjeta sin uso y corregidos los comentarios que la nombraban. |
| ARR-3, DEC-6 | `2055190` | Las sombras al pasar el mouse funcionan; el Resplandor se suma a la Club en el hero y se fue del punto y la punta de Historia. |
| DEC-6, MEN-4, MEN-5 | `8ed3506` | `DESIGN.md`: excepción de la portada, regla «Lo redondo», tokens de paneles y gráficos, escala de radios contra el código. |
| DEC-3 | `5762864` | Historia entra por distancia de scroll (25vh) y el punto se enciende con su tarjeta. Maqueta en `maquetas/historia-entrada/`. |
| Hora libre | `f464c53` | El campo Hora acepta texto libre de hasta 20 caracteres; tres mensajes de validación pasaron a español. |
| Avisos de grupo | `76beaec` | Aviso cuando la baja deja al último jugador pagando la actividad completa; la frase de la sugerencia a medias ya no manda siempre a «Sumar socio». |
| ARR-4, DEC-8 | `cb10dd8` | Los íconos ámbar pasan al ámbar oscuro (18 en 13 archivos) y los seis textos al color de siempre; «(anulado)» en gris. |
| DEC-7 | `fc228b5` + `e274942` | `ScrollRestoration`: cada página abre arriba, el atrás vuelve a la altura exacta, y una carga nueva ya no hereda la altura de otra ruta. |
| DEC-1, DEC-2, MEN-2, MEN-8 | `6279dd3` | El Resumen en cuatro gráficos, los números sin repetirse, la tarjeta de sugerencias y el contador del menú. |
| Rótulos | `afcc5a7` | Cada pantalla del panel dice el grupo del menú en el que está. |
| DESIGN.md | `3efc5e1` | El contador del menú entre las píldoras y el corte propio de 81rem del Resumen. |
| MEN-3 | `413a9e2` | Sidecar `.impeccable/design.json` regenerado contra el DESIGN.md nuevo y el código. |
| Deriva doc/código | `6f31ab7` | El anillo de foco de los campos al 50% como el de los botones; tarjetas 16/24, barra al 85% y fuera la columna de ficha. |
| MEN-2 (palabra) | `e5e0806` | «Membresía vigente» en todo el panel, con la forma corta solo donde el rótulo de al lado da el contexto. |
| Portal | `b5f4f54` | El Resumen muestra qué parte de los pagos entra por el portal, la vara de PRODUCT.md. |
| MEN-1 | `26541a1` | El verde de «listo» pasa al ícono y el texto vuelve a leerse, en 16 lugares. |

Verificado además de los 398 tests, `tsc` y `eslint`: en el sitio público, que cada link abre arriba y el atrás vuelve a la altura exacta, Historia legible después de un PageDown (capturas en `maquetas/historia-entrada/capturas/`) y el brillo del botón hero; en el panel, con sesión de admin, el contador del menú, las siete tarjetas del Resumen, los cuatro gráficos sin corte a 1920/1600/1536/1280, `?pagina=99` corrigiéndose sola, «(anulado)» en gris, los rótulos nuevos y que en modo oscuro el ámbar fuerte no cambia nada.

Sin commit, porque no van al repo: el zip de maquetas y `PENDIENTES.md` a la Papelera de reciclaje, las 3 maquetas rescatadas en `maquetas/` (ignorada por git), el worktree viejo y su rama borrados, y el permiso del chequeo de diseño en `.impeccable/config.json` (ignorado; los dos círculos de la línea de tiempo llevan además un `impeccable-disable-line` versionado).

Los pedidos al backend quedaron en `backend/toFix/pedidos-del-frontend-2026-09-17.md`, con ocho puntos.

### Lo que sigue abierto

- **En curso:** la banda del veredicto de la puerta a 20 px y los cartelitos verdes sólidos (decidido, sin commitear todavía).
- **Pruebas a mano que necesitan datos o manos:** un monto sin cargar («Sin cargar» en ámbar), una alta masiva con errores y avisos mezclados, un momento de galería sin fotos (PROB-1) y la pasada con NVDA (PROB-2).
- **DEC-12:** los números del menú para Solicitudes, Pagos y precios, con `/admin/pending-work`, que el backend ya tiene y el frontend no usa.
- **DEC-13:** las propuestas de grupo familiar de los socios, que no tienen pantalla. Primera candidata para `/spec`.
- **MEN-6:** la marca de color de categoría es un círculo de 16 px en el panel y un cuadradito de 8 px con 2 px de radio en el sitio.
- **MEN-7:** la portada de la galería entre 768 y 1023 px con poca altura deja 28 px de foto limpia.
- **Menores anotados al pasar:** la solapa «Vigentes» del padrón convive con «Dados de baja», donde «vigente» significa otra cosa; `useMembers.ts:82` todavía llama «activos» a ese número; la tarjeta del portal desaparece sin avisar si su endpoint falla; y la rama `NO_RECIPIENT` de Sin contacto no se muestra en ninguna pantalla.

---

## Lo más urgente no estaba en la lista

La revisión encontró errores que se ven hoy y pesan más que casi todo lo anotado en `PENDIENTES.md`. Están todos en el Paso 1, salvo el de la navegación, que se arregla con una decisión (DEC-7):

1. **Grupos familiares dice "desde el mes que viene", pero el backend aplica el descuento desde ya** → ARR-1. El admin lee un dato falso sobre plata.
2. **"De 10 a 18 hs hs" en los eventos públicos** → ARR-2. El arreglo existe, pero solo en el worktree viejo.
3. **El brillo del botón `hero` y la sombra de las tarjetas de eventos al pasar el mouse no andan** → ARR-3.
4. **En el sitio público los links abren la página nueva a mitad de altura** → DEC-7.
5. **El panel de galería puede quedar varado en una página vacía** → ARR-5.
6. **Confirmar una sugerencia de grupo tira un aviso por integrante y puede dejar el grupo a medio armar** → ARR-6.

---

## Paso 1 · Arreglos sin decisión

No hay nada que elegir: hay que hacerlos.

- [ ] **ARR-1 · Grupos familiares: "desde el mes que viene" es falso**
  - **Qué pasa.** El panel dice que agregar o sacar a alguien de un grupo cuenta para el descuento "desde el mes que viene". El backend lo aplica desde ya: la regla por mes se retiró el 2026-08-19/21, y el propio controller dice "El descuento se aplica en el próximo pago que se arme".
  - **Dónde (frontend).** `src/admin/hooks/useFamilyGroups.ts:83` (el aviso "Listo. Cuenta para el descuento desde el mes que viene.") y `:99` · `src/admin/components/AddGroupMemberDialog.tsx:29`, `:96`, `:141` · `src/admin/pages/FamilyGroupsPage.tsx:102`, `:223`, `:242`, `:255`, `:285` · `src/admin/actions/family-groups.actions.ts:17-43` y `:106-119` (comentarios y `nextMonthKey`, que quedaron del modelo viejo).
  - **Dónde (backend, la verdad).** `backend/src/members/services/family-groups.service.ts:29-32` y `:140-145` · `backend/src/members/controllers/admin-family-groups.controller.ts:241-246` · `backend/nucleo-sistema.md:1662`.
  - **Ojo.** `ESTADO.md:60-64` todavía describe el problema viejo del backend (ver DEC-10).

- [ ] **ARR-2 · "hs hs" en la hora de los eventos: rescatar el arreglo y borrar el worktree**
  - **Qué pasa.** La hora se muestra con " hs" pegado al valor crudo, y el seed trae `'De 10 a 18 hs'` (`backend/src/cli/seed-demo-content.ts:438`), así que sale "De 10 a 18 hs hs".
  - **El arreglo ya existe** en el commit `3546afe` ("la hora en texto libre ya no se muestra como 'De 10 a 18 hs hs'"), que agrega `src/events/lib/event-time.ts` con tests. Vive solo en la rama `claude/nervous-goldstine-c48acd` del worktree `.claude/worktrees/nervous-goldstine-c48acd`: **no está en `main`**. `git merge-tree` confirma que entra sin conflictos. El worktree no tiene cambios sin commitear.
  - **Pero cubre 3 de 5 lugares.** Desde entonces aparecieron dos pantallas más que pegan " hs".
  - **Cómo.** (1) `git cherry-pick 3546afe` en `main`. (2) Usar `formatEventTime` también en `src/events/components/EventRow.tsx:48` y `src/events/components/NextEventBand.tsx:34`. Los otros tres son `EventCard.tsx:72`, `EventPosterCard.tsx:35` y `src/admin/pages/AdminEventsPage.tsx:84`. (3) Recién ahí `git worktree remove` y borrar la rama.
  - **Dato.** Ese worktree ya no hace fallar `pnpm lint`: `eslint.config.js:10-12` ignora `.claude/**`.

- [ ] **ARR-3 · Las sombras al pasar el mouse no andan (botón `hero` y tarjetas de eventos)**
  - **La causa no es el orden**, como decía `PENDIENTES.md`. `.shadow-club`, `.shadow-glow` y `.shadow-soft` están escritas como clases sueltas dentro de `@layer utilities` (`src/index.css:717-727`), y Tailwind v4 no les genera variantes: `hover:shadow-glow` y `hover:shadow-club` directamente no existen en el CSS compilado. Se comprobó compilando en memoria con el `@tailwindcss/node` del proyecto.
  - **A quién afecta.** `src/components/ui/button.tsx:13` (variante `hero`, unos 40 botones) y `src/events/components/EventCard.tsx:15` y `EventPosterCard.tsx:40` (su `transition-shadow` hoy no hace nada). Viene del commit inicial.
  - **Cómo.** Pasar las tres clases a `@utility shadow-club { … }`, etc., fuera de la capa, como ya se hizo con `bg-scrim-portada` (el propio `index.css:827` explica por qué). Actualizar ese comentario.
  - **Cambia algo visible:** los botones `hero` van a brillar en hover y las tarjetas de eventos se van a elevar. Mirarlo en el navegador.
  - **Mini-decisión.** Con `@utility`, el resplandor **reemplaza** a la sombra Club en hover. `DESIGN.md:361-362` dice "en hover suma el Resplandor". Si "suma" quiere decir las dos juntas, usar `hover:shadow-[var(--shadow-club),var(--shadow-glow)]`.

- [ ] **ARR-4 · Íconos en ámbar sobre fondo claro → `text-warning-strong`**
  - **Qué pasa.** Dan entre 2.4:1 y 2.75:1 (un ícono necesita 3:1). Con `text-warning-strong` quedan entre 3.2:1 y 3.74:1. Es seguro en los dos modos: en `.dark` el token vale lo mismo que `--warning` (`src/index.css:353`), y el público, el login, `/pagos` y `/validar` son siempre claros.
  - **Son 18 íconos en 13 archivos** (no 14 en 12, ni los 4 archivos que nombraba `PENDIENTES.md`):
    - `src/auth/pages/reset-password/ResetPasswordPage.tsx:59`
    - `src/auth/pages/login/LoginPage.tsx:57`
    - `src/payments/pages/PaymentReturnPage.tsx:88` y `:177`
    - `src/payments/pages/MyPaymentsPage.tsx:87`, `:129` y `:154`
    - `src/admin/pages/CounterPage.tsx:125` y `:252`
    - `src/admin/pages/VerifyReceiptPage.tsx:144`
    - `src/members/pages/AcceptGuardianInvitationPage.tsx:64` y `:107`
    - `src/members/pages/ProfilePage.tsx:83`
    - `src/members/pages/WardDetailPage.tsx:242`
    - `src/admin/components/MemberAffiliationForm.tsx:32`
    - `src/admin/components/BulkImportDialog.tsx:416`
    - `src/admin/components/StatCard.tsx:24`
    - `src/members/pages/ValidateCredentialPage.tsx:49`
  - **No tocar:** los rellenos y bordes (`bg-warning/5·10·15`, `border-warning/40`), el Badge (`bg-warning` con texto en tinta) ni `CredentialCard.tsx:36`, que ya está resuelto a propósito.
  - **Los textos en ámbar son otra cosa** (FeesPage "Sin cargar", PaymentsPage "(anulado)", etc.): ver DEC-8. Conviene hacer los dos en el mismo commit.

- [ ] **ARR-5 · El panel de galería queda varado en una página vacía**
  - **Qué pasa.** Si se borra el único momento de la última página, el panel muestra "Todavía no hay momentos cargados." y no hay paginación para volver. La página vive en `useState(1)`, el borrado refresca esa misma página, el backend responde `items: []` y la paginación se oculta con `totalPages <= 1`. Pasa con más de 24 momentos.
  - **Dónde.** `src/admin/pages/AdminGalleryPage.tsx:23`, `:26`, `:63-66`, `:157` · `src/admin/hooks/useAdminGallery.ts:22` · `src/components/custom/Pagination.tsx:21`.
  - **Probablemente pasa igual** en las otras 6 pantallas del panel que usan `<Pagination>` con página local: AdminEventsPage, ApplicationsPage, AuditPage, MembersListPage, PaymentsPage y StaffPage. No se verificó una por una.
  - **Cómo.** Si la respuesta viene vacía y la página pedida es mayor que 1, volver a la última página real (como hace `clampPage` en el sitio público). Lo ideal es resolverlo una sola vez, para las siete pantallas. Relacionado con BACK-3.

- [ ] **ARR-6 · Confirmar una sugerencia de grupo: avisos repetidos y grupo a medio armar**
  - **Qué pasa.** `FamilyGroupsPage.tsx:35-42` crea el grupo y después suma a los integrantes de a uno con `mutateAsync`, y el `onSuccess` de `useAddFamilyGroupMember` (`useFamilyGroups.ts:81-84`) tira un aviso por integrante: 3 integrantes, 3 avisos "Listo…". Si uno rebota, el grupo queda creado con algunos integrantes, `confirm()` tira un error que nadie atrapa (el `void confirm()` de la línea 68) y la sugerencia puede seguir apareciendo: un segundo clic crea otro grupo con el mismo nombre.
  - **Cómo.** Un solo aviso al final, atrapar el error y decir qué quedó hecho. Lo más sólido sería un endpoint que cree el grupo con todos sus integrantes de una vez (pedido al backend, opcional).

- [ ] **ARR-7 · Encabezado "Cobros" en Grupos familiares**
  - `src/admin/pages/FamilyGroupsPage.tsx:100` dice "Cobros", pero en el menú la sección está en "Padrón", y el comentario de `src/admin/config/nav.ts:79-87` explica por qué no va en Cobros.

- [ ] **ARR-8 · Comentarios desactualizados**
  - `src/gallery/lib/carousel.ts:86-89`: dice que `imageLoading` evita "bajar las cinco de entrada", pero en escritorio la tira de miniaturas (`AlbumStage.tsx:183-188`) baja las 5 fotos grandes igual. Se resuelve de verdad con BACK-1; mientras tanto, corregir el comentario.
  - `src/landing/layouts/PublicLayout.tsx:14-15`: dice que "hoy solo Contacto" es lazy, pero `GalleryAlbumPage` también lo es (`router.app.tsx:42-48`).
  - `src/admin/components/DebtCard.tsx:28`: comentario huérfano (`/** "5 ya pasaron", "1 ya pasó". */`) de la función `pastThresholdText`, que se borró en `e96b654`.
  - `src/index.css:206-207`: dice que `--warning-strong` es "para íconos y texto sobre claro". Para texto chico no alcanza (ver DEC-8): tiene que decir "íconos y marcas".
  - `src/index.css:811`: llama "EXCEPCIÓN documentada" al texto sobre la foto de la portada, pero `DESIGN.md` no la documenta (ver DEC-6).

---

## Paso 2 · Decisiones

Cada una con las opciones y la recomendación. Con la recomendación se puede avanzar directo.

- [ ] **DEC-1 · Resumen: ¿seis gráficos o cuatro?**
  - **Hoy hay seis:** Ingresos, Altas y bajas, Deuda, Plantel por categoría, Medios de pago (dona) y Pirámide de edades.
  - **Problemas.** Ingresos y Medios de pago usan los mismos tres colores (`chart-ramp-1/2/3`) con significados distintos. La Pirámide cambia una vez por año y con datos incompletos. Y entre 1536 y unos 1770 px de ancho (por ejemplo, 1920×1080 con la escala de Windows al 125%) cinco gráficos no entran de a tres y scrollean de costado, lo que esconde el mes en curso. La causa es el mínimo de 26rem del SVG (`IncomeCard.tsx:72` y sus gemelos) contra la grilla de `DashboardPage.tsx:108`. Hay que confirmarlo en el navegador (PROB-4).
  - **Opciones.** (a) Dejar los seis. (b) **Bajar a cuatro:** Ingresos, Altas y bajas, Deuda y Plantel. (c) Bajar a tres: Ingresos, Deuda y Plantel, como la maqueta original.
  - **Recomendación: (b).** Son los cuatro que cambian mes a mes y llevan a una acción. Quedan en 2×2 desde 1280 px y uno por fila más abajo, sin cortes en notebooks. Se cae también la decisión pendiente de "dona contra barras" (`PaymentMethodsCard.tsx:42-45`). **Antes de sacar nada, consultar con quien pidió Medios de pago y la Pirámide.** Si importa el porcentaje que entra por el portal (la vara de `PRODUCT.md`), mostrarlo como número en la fila de tarjetas de arriba, que hoy tiene cinco y deja un hueco.

- [ ] **DEC-2 · Aviso de sugerencias pendientes en Grupos familiares**
  - **Hoy.** Nada avisa que hay grupos sugeridos esperando "Confirmar grupo". El backend no tiene un conteo aparte: las sugerencias son solo para ADMIN, no se paginan, se agrupan por tutor (dos tutores socios de la misma familia dan dos sugerencias) y **no se pueden descartar**.
  - **Opciones.** (a) Número en "Grupos familiares" del menú lateral. (b) **Tarjeta en el Resumen, solo para admin**, con el número y un link a Grupos familiares. (c) Las dos.
  - **Recomendación: (b).** Repite lo que ya existe ("Pagos pendientes"), se hace en una hora sin tocar el backend (alcanza con contar la lista que ya se baja) y no usa el ámbar de los pagos. Un número fijo en el menú hoy sería ruido: sale inflado y no baja nunca, porque no se puede descartar. De paso, agregar en Grupos familiares un aviso para cuando falla la carga de sugerencias.
  - **Ojo.** `StatCard` hoy no es clickeable (hay que hacerla link o poner un link aparte).

- [ ] **DEC-3 · Historia: el texto que podía quedar borroso o más claro**
  - **Causa principal medida.** Las animaciones van atadas al scroll y terminan tarde: la tarjeta recién queda opaca en `cover 40%` (`src/index.css:651-655`) y la descripción en `cover 42%` (bloque ESCALONADO, `:667-685`). Cuando uno frena, con PageDown o con un golpe de rueda, todo lo de la mitad de abajo queda a medio aparecer, y las transparencias se multiplican. A 1024×768, después de un PageDown, una descripción queda al 38%: el gris del texto baja de 6,8:1 a 1,8:1. Al abrir la página, el primer hito ya se ve con la descripción al 56%. En la tarjeta de 2000 caracteres del seed es peor, porque los porcentajes crecen con el alto.
  - **Causa posible, sin medir.** Chrome dibuja el texto sin ClearType en capas transparentes animadas; en Windows eso se ve más finito. En Chrome headless no se reproduce.
  - **Opciones.** (a) Dejarlo y seguir vigilando. (b) Sacar solo el bloque ESCALONADO, como decía `PENDIENTES.md`. (c) **Sacar el ESCALONADO y hacer que la tarjeta termine de entrar a una distancia fija y corta**, por ejemplo `animation-range: cover 0% cover 25vh` en `.timeline-item .reveal-up`.
  - **Recomendación: (c).** Conserva la vida de la página y es lo único que arregla las tarjetas largas: la (b) resuelve la mitad. Si se siente demasiado rápido, estirar hasta unos 35vh antes que volver a los porcentajes. Después, PROB-3.

- [ ] **DEC-4 · Historia: ¿el año que avanza?**
  - **Opciones.** (a) **No hacerlo y tacharlo.** (b) Contador por tiempo, una sola vez, cuando la tarjeta entra (JS, medio día). (c) Contador atado al scroll, solo con CSS.
  - **Recomendación: (a).** El año es el dato de la tarjeta, no un adorno: un año que se ve mal aunque sea un instante es información equivocada, y DEC-3 muestra que las animaciones atadas al scroll dejan estados a medias. Si igual se quiere, que sea (b), nunca (c).
  - **Dato.** La maqueta de las animaciones ya no se puede recuperar: no está en `maquetas/` ni en el zip (el zip es del 14/09 y las animaciones del 16/09).

- [ ] **DEC-5 · Galería: títulos largos en la portada, ¿3 renglones o 2?**
  - **Hoy.** Se cortan en 2 renglones entre md y lg y en 3 desde lg (`src/gallery/components/GalleryFeatured.tsx:89`). Un título largo deja poca foto a la vista: 45 px de foto limpia a 1280×720.
  - **Opciones.** (a) Dejar 3 renglones. (b) **Cortar en 2 siempre.** (c) Dejar 3 y frenar el largo desde el panel (contador o bajar el máximo de 120 caracteres).
  - **Recomendación: (b).** Sacar `lg:line-clamp-3` y actualizar las medidas en `src/index.css:817-821` y en el comentario de `GalleryFeatured`. Es el cambio más chico y protege la foto; un título largo se lee entero con un clic.

- [ ] **DEC-6 · Anotar dos excepciones en `DESIGN.md`**
  - **Texto sobre la foto en la portada.** `DESIGN.md` lo desaconseja y la excepción solo está explicada en `index.css` (`bg-scrim-portada`). **Recomendación:** un párrafo corto en Components, después de "Bloque partido", más un "(salvo la portada de la galería)" en el Don't. Texto sugerido: *"La excepción es la portada de la galería ('Lo más reciente'): desde md el título va encima de la foto, abajo, sobre un fondo de Negro Escudo al 80% que mide lo que mide el texto y solo se desvanece en sus 8rem de arriba. El título tiene tope de renglones y en el celular el texto va debajo, en panel sólido. No se usa en ningún otro lugar."*
  - **Círculos del punto y la punta de Historia.** `DESIGN.md:336` dice "nada es circular salvo los avatares", y hay dos `border-radius: 9999px` en `src/index.css:632` y `:709`. **Recomendación:** una excepción acotada con la misma forma que la de los 2px (valor, para qué, ejemplos, por qué y límite), más un permiso del chequeo de diseño **solo para `src/index.css`**, para que no se vuelva ciego a las píldoras del resto.
  - **Anotar en el mismo párrafo el resplandor.** El punto de cada hito (`src/institutional/components/MilestoneItem.tsx:32`) y la punta de la barra (`src/index.css:712`) llevan `--shadow-glow` siempre, y `DESIGN.md:316-317` lo define como exclusivo del hover de las acciones primarias. Anotarlo como excepción o sacárselo.
  - **Después:** correr `/impeccable document` en modo "solo el sidecar, sin tocar `DESIGN.md`" (ver MEN-3).

- [ ] **DEC-7 · Volver a la posición correcta al navegar (`ScrollRestoration`)**
  - **Qué pasa.** No hay `<ScrollRestoration />` en ningún lado. En todo el sitio público los links no llevan al principio de la página nueva: desde abajo de la home, "Historia" del pie abre `/historia` en `scrollY` 4836, en medio de la línea de tiempo. Solo la galería lo corrige a mano (`src/gallery/pages/GalleryPage.tsx:74-77`, `GalleryAlbumPage.tsx:53-58`). Probablemente pasa lo mismo en los paneles (no se probó). Y volver del momento al listado depende del navegador.
  - **Opciones.** (a) Dejarlo, probar el atrás en Safari y Firefox y subir el `gcTime` del listado si hace falta. (b) **`<ScrollRestoration />` de react-router** en una ruta raíz sin path que envuelva todo, sacar los dos `window.scrollTo(0,0)` manuales y agregar `preventScrollReset` donde solo cambia la dirección: paginación, categorías, visor, corrección de página y la solapa de Pagos. (c) Un componente propio que suba al principio solo en navegaciones nuevas.
  - **Recomendación: (b), más un `gcTime` de 30 min en el listado de la galería.** Es la herramienta estándar del router que ya se usa, y arregla las dos cosas. Medio día, con prueba a mano de visor, paginación, categorías y el atrás en el celular.

- [ ] **DEC-8 · Textos en ámbar sobre fondo claro**
  - **Qué pasa.** Un texto chico necesita 4.5:1 y `--warning-strong` da 3.74:1: pasar los textos al token nuevo mejora pero no cumple.
  - **Los 6 textos.** `src/admin/pages/FeesPage.tsx:32` ("Sin cargar", 18px negrita, no llega a "texto grande") · `src/admin/pages/PaymentsPage.tsx:299` ("(anulado)") · `src/admin/components/MemberPayments.tsx:120` ("(anulado)") · `src/admin/pages/UndeliverablePage.tsx:31` ("Sin destinatario", 12px) · `src/admin/components/BulkImportDialog.tsx:119` (número de línea "L12"; el color es lo único que distingue un aviso de un error) · `src/members/pages/ValidateCredentialPage.tsx:250` ("vence en N días", 2.39:1 hoy).
  - **Opciones.** (a) Pasarlos también a `text-warning-strong`. (b) **El ámbar marca y la tinta dice:** ícono o punto en `text-warning-strong`, texto en `text-ink` o `text-foreground`. (c) Un tercer ámbar solo para texto (alrededor de `oklch(55% 0.11 70)`, 4.97:1).
  - **Recomendación: (b).** Es la más convencional, no suma tokens y ya tiene antecedente: la credencial deja el ámbar en el punto y el texto en tinta (`CredentialCard.tsx:26-36`). En los dos "(anulado)" alcanza con `text-muted-foreground`. En BulkImportDialog, si el color es lo único que separa aviso de error, sumar un ícono.

- [ ] **DEC-9 · El zip de maquetas (`../maquetas-respaldo-2026-09-14.zip`, 59,7 MB)**
  - **Hoy.** `maquetas/` no existe, y dos lugares apuntan al zip: el comentario de `src/index.css:46-47` (la maqueta del toaster) y `PENDIENTES.md:7-8`. Adentro todavía hay tres cosas que respaldan decisiones abiertas: `resumen-graficos.html` (DEC-1), las capturas de la galería vacía (PROB-1) y `sonner-adaptado.html`.
  - **Opciones.** (a) Borrarlo ya y reescribir los comentarios. (b) **Sacar esas tres cosas a `maquetas/`** (que está en `.gitignore`), borrar el zip y corregir los comentarios. (c) No tocarlo hasta cerrar DEC-1 y PROB-1.
  - **Recomendación: (b).** En cualquier caso, que el comentario de `index.css` diga la conclusión y no la ruta a un archivo local, que en otra PC no existe.

- [ ] **DEC-10 · `PENDIENTES.md`, `ESTADO.md` y esta carpeta `toFix/`**
  - **Hoy.** `PENDIENTES.md` no está en git. `ESTADO.md` sí, pero da instrucciones falsas: dice que el trabajo vive en la rama `nucleo-frontend`, que ya no existe en origin, que "un git pull a secas no la trae" y que hay 132 tests (hoy son 343) (`ESTADO.md:1-3`, `:28`, `:52`, `:60-64`). `toFix/` es nueva y tampoco está en git; en el backend, `toFix/` y `specs/` están en `.gitignore`.
  - **Opciones para `PENDIENTES.md`.** (a) **Versionarlo y borrar `ESTADO.md` en el mismo commit.** (b) Dejarlo local. (c) Pasar los puntos a Issues de GitHub.
  - **Recomendación: (a).** El antecedente de `ESTADO.md` muestra que hace falta tener el estado en otra máquina. Para que no le pase lo mismo, borrar los puntos cerrados en vez de tacharlos y sacar las rutas al zip. Para `toFix/`: decidir si se versiona (sirve en otra PC) o si se ignora como en el backend.

- [ ] **DEC-11 · Los límites que quedaron del toaster**
  - Con un modal abierto, alt+T no llega al toaster (pasaba igual antes). Un clic en un toast con un menú o select de Radix abierto probablemente lo cierra (no se midió). El texto del toast no se puede seleccionar con el mouse.
  - **Recomendación: aceptar los tres y sacarlos de la lista.** Si alguna vez se prueba el del select (dos minutos) y molesta, recién ahí copiar la guarda de `dialog.tsx` en `select.tsx` y `dropdown-menu.tsx`. No vale la pena tocar shadcn por adelantado.

### Decisiones más grandes, para después

- [ ] **DEC-12 · Números en el menú del panel con `/admin/pending-work`**
  - El backend ya tiene armado y probado el endpoint para los números del menú: solicitudes, comprobantes por revisar, propuestas de grupo y precios sin cargar, filtrado por rol (`backend/src/dashboard/admin-pending-work.controller.ts:10-35`, marcado como hecho en `backend/nucleo-sistema.md:1050`). **El frontend nunca lo usa.**
  - Decidir si el menú muestra esos números. Si sí, es el momento de sumar las sugerencias de grupo (DEC-2), pidiendo al backend el contador, una sugerencia por familia y poder descartarlas.

- [ ] **DEC-13 · Propuestas de grupo familiar de los socios: no tienen pantalla**
  - El backend permite que el socio proponga y cancele un grupo (`GET members/family-group`, `POST family-group/proposals`, `DELETE family-group/proposals/:id`, en `backend/src/members/controllers/members.controller.ts:189-235`) y que el admin las revise, apruebe y rechace (`backend/src/members/controllers/admin-family-groups.controller.ts:81-131`). En el frontend no existe ninguna de las dos pantallas; solo el ícono del aviso `FAMILY_PROPOSAL_RESOLVED` (`src/notifications/lib/notification-meta.ts:68`).
  - Decidir si se construye (es una feature entera: buen candidato para `/spec`) o si se da de baja en el backend.

---

## Paso 3 · Pedidos al backend

En este orden. Ninguno bloquea: la galería funciona con lo que hay.

- [ ] **BACK-1 · Miniaturas de unos 800 px, con ancho y alto en la misma migración** · un día o más · impacto alto
  - **Por qué primero.** Es lo único de la lista que el socio nota: el peso de la página con datos móviles. El backend guarda una sola versión de cada foto, de 1920 px en WebP (`backend/src/storage/storage.service.ts:36` y `:190-208`), y todo lo que se ve chico baja esa: las 12 tarjetas del listado (`AlbumCard.tsx:44`), la tira de 88 px del momento, que en escritorio baja las 5 grandes de entrada (`AlbumStage.tsx:183-188`), "Más momentos de…" (`RelatedAlbums.tsx:41`) y el panel (`AdminGalleryPage.tsx:76`, `AlbumImagesDialog.tsx:156`). Estimación sin medir (el seed usa SVG): de 200–500 KB a 40–90 KB por foto.
  - **Qué toca en el backend.** (1) Un método nuevo en `StorageService` que, solo para la galería, suba además una versión de 800 px (`processAndUpload` también procesa fotos de perfil y DNI). (2) Columnas `thumbnailUrl`, `width` y `height` que acepten vacío en `gallery_images`, con migración (`synchronize` está apagado). (3) Sumarlas a `GalleryImageResponseDto`, `coverThumbnailUrl` a `GalleryAlbumResponseDto` y al mapper. (4) En `addImages`, sumar las miniaturas a la compensación si falla la subida; en `deleteAlbum` y `deleteImage`, borrar las dos versiones o quedan huérfanas en R2. (5) Un script en `src/cli` que genere las miniaturas de las fotos ya subidas. (6) Que el seed complete el campo.
  - **Qué toca en el frontend.** Sumar los campos a `interfaces/Gallery.ts` y usar `thumbnailUrl ?? imageUrl` en los 5 `<img>` chicos. Portada, escenario y visor siguen con la grande. No hay que coordinar el despliegue.
  - **Descartado.** Cloudflare Image Transformations (exige dominio propio en Cloudflare y no se puede probar local) y varias medidas con `srcset` (duplica el trabajo para una ganancia marginal).
  - **Ancho y alto** ya no evitan saltos (todas las cajas tienen medida fija), pero cuestan casi nada en la misma migración y dejan el dato listo.

- [ ] **BACK-2 · Filtro `hasImages=true` en `GET /gallery`** · medio día · impacto medio
  - Que el sitio público lo use para todo el listado: la portada nunca es un momento sin fotos y el público no ve momentos a medio cargar (los vacíos solo se ven en el panel). Hoy `GET /gallery` solo acepta `page`, `limit` y `categoryId`, y **un parámetro desconocido da 400**: publicar primero el backend y después el front.
  - Descartados: `hasImages` solo para la portada y un `GET /gallery/featured` aparte.

- [ ] **BACK-3 · Un solo cálculo de paginación** · una hora
  - Un `buildPaginationMeta` común para los 7 listados, con `totalPages` mínimo 1. Hoy, sin resultados, `totalPages` viene en 0, y una página fuera de rango devuelve la pedida con `items: []`. No corregir la página pedida en el backend: mezcla datos de una página bajo la clave de otra. Junto con ARR-5.

- [ ] **BACK-4 · Cantidad de momentos por categoría** · medio día · impacto bajo
  - Solo para ocultar de la barra pública las categorías sin momentos (no para mostrar el número). Pedirlo después de BACK-2, para que el conteo use el mismo criterio.

**Para tachar de `PENDIENTES.md`:**

- [~] **Desempate del orden:** ya está hecho. `backend/src/gallery/services/gallery.service.ts:58-60` ordena por `date DESC NULLS LAST`, `createdAt DESC` e `id DESC`.
- [~] **`excludeId`:** descartado. El ahorro es de pocos KB y se pierde una caché que hoy evita peticiones.
- [~] **Epígrafe por foto:** descartado por ahora. La descripción del momento da el contexto. Reconsiderar solo si el club pide nombrar a las personas de las fotos.
- [~] **Slug de categoría en la API:** por ahora no. La lógica actual (`categorySlug`) está probada. Si se toca el módulo de categorías por BACK-4, sumarlo ahí, regenerándolo al renombrar.

**Otro pedido que no estaba anotado:** `/admin/stats/roster-by-category` y `/admin/stats/payment-methods` devuelven solo el enum, así que el front copia a mano los rótulos del backend (`src/admin/lib/dashboard-stats.ts:28-60`). El comentario dice que es una excepción a retirar cuando el endpoint traiga el rótulo. Si DEC-1 saca Medios de pago, queda solo el de Plantel.

---

## Paso 4 · Pruebas a mano

- [ ] **PROB-1 · Momento sin fotos** · 5 minutos. Crear un momento sin fotos desde `/admin/galeria` con la fecha de hoy (así queda primero), mirar `/galeria` y la página del momento en el celular y en la compu, y después subirle fotos o borrarlo. Falta confirmar que el backend real responda `coverUrl: null` e `images: []`. Con BACK-2, ese estado solo se ve entrando por link directo.
- [ ] **PROB-2 · Lectores de pantalla** · una hora. NVDA (gratis) con Chrome por cuatro recorridos: entrar a `/galeria`, cambiar de categoría y de página, entrar a un momento y pasar fotos con las flechas, y abrir y cerrar la pantalla completa. Si hay un iPhone, repetir el del momento con VoiceOver. Anotar solo lo que confunda; lo más probable es el cambio de página sin aviso.
- [ ] **PROB-3 · Historia con el backend andando** · una hora, **después de DEC-3**. Capturas a 1440×900 y 390×844, frenando varias veces con PageDown, y mirar sí o sí la tarjeta de 2000 caracteres en el celular.
- [ ] **PROB-4 · Resumen a 1280, 1536, 1600 y 1920 px**, con el panel claro y oscuro. Confirmar si los gráficos scrollean de costado. Entre 1024 y 1279 px también: cinco de las seis tarjetas llevan `min-w-[26rem]` (Ingresos, Altas y bajas, Deuda, Plantel y Pirámide; Medios de pago es una dona y no scrollea). Resolverlo junto con DEC-1: con cuatro gráficos, 2×2 desde 1280 px; con seis, de a tres recién desde unos 1800 px.
- [ ] **PROB-5 · Paginación larga.** Se dio por probada desde 360 px con muchas páginas. A 320 px queda justa: anotarlo como conocido y arreglarlo solo si el club pasa de 60 momentos y alguien lo reporta.

---

## Temas menores

- [ ] **MEN-1 · El verde de éxito tampoco llega para texto chico.** `text-success` (`oklch(58% 0.14 155)`) da 4.01:1 sobre blanco, debajo del 4.5:1. Se usa como texto en `AddGroupMemberDialog.tsx:143`, `AffiliationFormCard.tsx:136` y `:164`, `DocumentUpload.tsx:114`, `MemberLayout.tsx:50` y `AffiliationPage.tsx:54`. Es el mismo problema que el ámbar, más leve: resolverlo con el mismo criterio que DEC-8.
- [ ] **MEN-2 · Tarjetas "Socios totales" y "Socios activos" del Resumen.** Muestran el mismo número en dos tarjetas pegadas, y dicen "N con la cuota al día" y "Cuota vigente" (`DashboardPage.tsx:72` y `:78`), cuando el número cuenta solo la membresía vigente (`backend/src/dashboard/admin-dashboard.service.ts:72-74`). `PRODUCT.md:77-92` y `:125-128` piden no usar "cuota" ni "al día" para una sola de las tres coberturas.
- [ ] **MEN-3 · `/impeccable document`.** `.impeccable/design.json` es del 13/08 y `DESIGN.md` del 14/09. Correrlo **una sola vez, después de DEC-6**, en modo "solo el sidecar, sin tocar `DESIGN.md`".
- [ ] **MEN-4 · `DESIGN.md` no documenta tokens que ya están en `src/index.css`:** `--warning-strong` (entró en `00ea958`), el modo oscuro de los paneles (`.dark`), `.force-light`, los colores de datos de los gráficos ni la banda de tablas. Su frontmatter solo tiene "alerta" (`DESIGN.md:20`). Hacerlo antes de MEN-3.
- [ ] **MEN-5 · La regla "nada es circular salvo los avatares" no se cumple en unos 20 lugares.** Badge de shadcn (`badge.tsx:8`), filtros y chips de categoría (`CategoryFilter.tsx:22`, `EventCard.tsx:50`, `EventPosterCard.tsx:76`, `AdminEventsPage.tsx:100`, `AdminGalleryPage.tsx:102`), píldoras de estado (`MemberLayout.tsx:48`, `AffiliationPage.tsx:52`, `AffiliationFormCard.tsx:164`, `ValidateCredentialPage.tsx:214`, `:224`, `:234`, `DoorScannerPage.tsx:149`), puntitos de estado (`MemberLayout.tsx:57`, `CredentialCard.tsx:203`, `NotificationBell.tsx:61`), el contador de avisos (`NotificationBell.tsx:130`), el interruptor (`CoverageEmailsCard.tsx:66-68`), íconos en círculo (`PublicFooter.tsx:130`, `ContactPage.tsx:64`) y la barra de progreso (`progress.tsx:13`). Los chips también contradicen "8 px para lo chico (chips)" (`DESIGN.md:334-335`). El chequeo de diseño no los ve porque solo lee `border-radius` en CSS, no `rounded-full`. Es otra decisión: reescribir la regla según lo que el código ya usa, o corregir el código.
- [ ] **MEN-6 · El color de categoría se dibuja distinto en el sitio y en el panel.** En el sitio es un cuadradito de 8 px con 2 px de radio, como pide `DESIGN.md:338-340` (`src/gallery/components/CategoryMark.tsx:23`). En el panel es un círculo de 16 px (`src/admin/components/CategoryManagerDialog.tsx:136`).
- [ ] **MEN-7 · Portada de la galería entre 768 y 1023 px con poca altura** (por ejemplo, 800×600). Como el botón va debajo del texto, el bloque oscuro deja 28 px de foto limpia con un título largo (ya cortado en 2) y 66 px con uno corto (`GalleryFeatured.tsx:67` y `:122`). Las medidas de `index.css:819-821` cubren solo escritorio.
- [ ] **MEN-8 · `emptyCategories` no se usa.** Se calcula para "Plantel por categoría" pero solo lo usa su test. Las categorías vacías se siguen viendo en el gráfico como filas "sin jugadores", que está bien. Borrar `emptyCategories` con su línea de test, salvo que DEC-1 saque Plantel.
- [ ] **MEN-9 · Columnas de los meses a 460 px.** Con doce meses quedan unos 32 px por mes y los rótulos no se pisan: no hace falta tocarlos. Lo que sí importa es el scroll lateral de PROB-4.

---

## Correcciones del verificador

Tres afirmaciones de los agentes estaban mal. En este documento ya están corregidas; en el anexo también.

1. **Íconos en ámbar:** un agente contó "14 íconos en 12 archivos". Son **18 en 13 archivos** (su propia lista sumaba eso, y `grep` lo confirma).
2. **Gráficos que scrollean entre 1024 y 1279 px:** se dijo "las cuatro tarjetas de barras (Deuda, Plantel, Medios, Pirámide)". Medios de pago es una dona sin ancho mínimo y **no scrollea**; las que llevan `min-w-[26rem]` son **cinco**: Ingresos, Altas y bajas, Deuda, Plantel y Pirámide.
3. **"`00ea958` no está pusheado":** falso. Ya está en `origin/main`.

Faltantes que marcó el verificador y ya están incluidos arriba: la nota de `PENDIENTES.md:7-8` sobre el zip (DEC-9), que en PaymentsPage y FeesPage lo ámbar son textos y no íconos (DEC-8), y que el bug de "mes que viene" y el de "hs hs" pesan más que casi todo lo anotado (Paso 1).

---

# Anexo · Detalle completo por bloque

Lo que devolvió cada agente, con las correcciones del verificador aplicadas. Sirve para quien arregle: tiene el estado medido, la evidencia con `ruta:línea` y los pros y contras de cada opción.

## Anexo 1 · 2. Galería: pedidos al backend

### Miniaturas: una versión chica de cada foto

*Pedido al backend · sigue vigente · esfuerzo: un día o más · impacto para el usuario: alto*

**Estado actual.** Sigue pendiente. El backend guarda UNA sola versión de cada foto: la achica a 1920 px de lado mayor y la pasa a WebP al 80%. La tabla de fotos tiene solo `imageUrl` y no hay ninguna variante chica. En el front, todos los lugares donde la foto se ve chica bajan esa versión grande: las tarjetas del listado (12 por página), la tira de miniaturas de 88 px en la página del momento, la lista de 'Más momentos de…' y el panel. Una aclaración sobre PENDIENTES.md: las miniaturas que bajan la foto entera no son las del visor de pantalla completa (ese no tiene tira), son las de la tira del escenario (AlbumStage). Y como esa tira se ve desde el primer momento en escritorio, al entrar a un momento se bajan las 5 fotos grandes de una. En el celular no pasa, porque ahí la tira se reemplaza por puntitos. Qué habría que tocar en el backend: (1) un método nuevo en StorageService que suba, además de la grande, una versión de unos 800 px. Tiene que ser solo para la galería: `processAndUpload` también procesa fotos de perfil y DNI. (2) Una columna `thumbnailUrl` que acepte vacío en `gallery_images`, con su migración: en producción `synchronize` está apagado. (3) Sumar `thumbnailUrl` a GalleryImageResponseDto y `coverThumbnailUrl` a GalleryAlbumResponseDto y al mapper. (4) En `addImages`, sumar las miniaturas a la lista `uploaded` para que se borren si falla la subida. En `deleteAlbum` y `deleteImage`, borrar las dos versiones, o las chicas quedan huérfanas en R2. (5) Un script en `src/cli` que genere las miniaturas de las fotos que ya están subidas. (6) Que el seed de demo complete el campo; puede repetir el mismo data URI. En el front: sumar los campos a `interfaces/Gallery.ts` y usar `thumbnailUrl ?? imageUrl` en los 5 `<img>` de tamaño chico. Los que van grandes (portada, escenario, visor) quedan como están.

**Evidencia:**

- backend/src/storage/storage.service.ts:36 (MAX_IMAGE_DIMENSION = 1920, única versión)
- backend/src/storage/storage.service.ts:190-208 (sharp resize + webp 80, sin variante)
- backend/src/storage/storage.service.ts:28-29 (el procesado es compartido con perfil y documentos)
- backend/src/gallery/entities/gallery-image.entity.ts:13-15 (solo imageUrl)
- backend/src/gallery/dto/gallery-image-response.dto.ts:3-7
- backend/src/gallery/mappers/gallery-response.mapper.ts:55 (coverUrl = imageUrl de la primera)
- backend/src/gallery/services/admin-gallery.service.ts:163-195 (subida y compensación), :128 y :264-266 (borrado de keys)
- backend/src/config/data-source.ts:54 (synchronize: false, hace falta migración)
- frontend/src/gallery/components/AlbumCard.tsx:44 (tarjeta del listado con coverUrl completa)
- frontend/src/gallery/components/AlbumStage.tsx:183-188 (tira de 88px con image.imageUrl, visible desde lg)
- frontend/src/gallery/components/RelatedAlbums.tsx:41 (miniatura de 88px con coverUrl)
- frontend/src/admin/pages/AdminGalleryPage.tsx:76 y frontend/src/admin/components/AlbumImagesDialog.tsx:156
- frontend/src/gallery/lib/carousel.ts:86-92 (imageLoading promete no bajar las cinco, la tira de escritorio sí las baja)

**Opciones:**

1. **A. El backend genera una miniatura de unos 800 px al subir y la guarda en una columna nueva, con un script que la genere para las fotos existentes**
   - A favor: No depende de ningún servicio extra ni del tipo de dominio del bucket. Funciona igual en desarrollo y en producción, y reutiliza sharp, que ya está instalado. Una sola medida sirve para las tarjetas (unos 360 px en pantalla, 720 en pantallas retina) y para las tiras de 88 px. Se puede aprovechar para guardar ancho y alto en la misma migración.
   - En contra: Es el cambio más largo de la lista: método nuevo, migración, script para las fotos viejas y borrado doble. Además, cada foto ocupa dos objetos en R2 (la chica pesa poco).
2. **B. Cloudflare Image Transformations: pedir cada foto achicada por URL (`/cdn-cgi/image/width=800/...`), sin tocar la base**
   - A favor: Ni migración ni script. Permite cualquier medida (hasta `srcset` con varias) y serviría también para las fotos de eventos.
   - En contra: Exige que el dominio público del bucket sea propio y esté en Cloudflare (con un r2.dev no funciona) y activar un servicio que tiene cupo gratuito limitado. Suma una dependencia del proveedor, y en desarrollo el seed usa data URIs, así que no se puede probar local.
3. **C. Dos o tres medidas (400, 800 y 1920) con `srcset` y `sizes`**
   - A favor: Es lo más fino: el navegador elige la justa según la pantalla. En el celular, hasta el escenario bajaría una más chica.
   - En contra: Duplica el trabajo de A (más columnas o un JSON de variantes) para una ganancia marginal con 5 fotos por momento. Complica sin necesidad.

**Recomendación.** Prioridad 1 de 9: es lo primero que conviene pedir, y la opción A con una sola medida de 800 px. Es el único pedido que cambia algo que el socio siente, el peso de la página con datos móviles. Mi estimación, sin haberlo medido porque el seed local usa SVG: una foto a 1920 px en WebP suele pesar entre 200 y 500 KB y a 800 px entre 40 y 90 KB. El listado de 12 tarjetas bajaría varias veces de peso, y la página de un momento en escritorio dejaría de bajar las 5 fotos grandes de entrada. Conviene hacerlo junto con 'ancho y alto': es la misma migración y el mismo script. Mientras corre el script, el front usa `thumbnailUrl ?? imageUrl`, así que no hay que coordinar nada. Orden de todo el bloque: 1) miniaturas, 2) ancho y alto en el mismo cambio, 3) filtro `hasImages` para la portada, 4) paginación con un cálculo común, 5) cantidad por categoría (solo para ocultar las vacías), 6) slug de categoría, 7) epígrafe (probablemente no), 8) excludeId (descartar), 9) desempate (ya está hecho, tacharlo).

### Ancho y alto de cada foto

*Pedido al backend · sigue vigente · esfuerzo: una hora · impacto para el usuario: bajo*

**Estado actual.** Sigue pendiente: ni la entidad ni los DTOs tienen ancho ni alto. El motivo que da PENDIENTES.md ('reservar el espacio antes de que cargue') ya está resuelto en el front de otra manera. Todas las cajas de fotos tienen medida fija: las tarjetas y 'Más momentos' en 4:3, el escenario en 4:3 en el celular y 3:2 en escritorio con la foto en `contain`, y la portada en 4:3 o con alto fijo. O sea que hoy la página no salta cuando cargan las fotos, y el componente del escenario lo explica en un comentario. Tenerlos serviría para cosas cosméticas: no recortarle la cabeza a una foto vertical en la tarjeta, o una grilla tipo mosaico en el futuro. Lo que habría que tocar: dos columnas `width` y `height` que acepten vacío en `gallery_images`, leerlas con `sharp(...).toBuffer({ resolveWithObject: true })`, que ya devuelve la medida final, sumarlas al DTO y al mapper, y completarlas con el mismo script de las miniaturas.

**Evidencia:**

- backend/src/gallery/entities/gallery-image.entity.ts:11-31 (sin width/height)
- backend/src/storage/storage.service.ts:190-208 (sharp ya procesa la imagen; se puede pedir el info)
- frontend/src/gallery/components/AlbumStage.tsx:34-36 (caja fija a propósito porque las fotos no traen medidas)
- frontend/src/gallery/components/AlbumStage.tsx:99 (aspect-4/3 y lg:aspect-3/2)
- frontend/src/gallery/components/AlbumCard.tsx:37 (aspect-4/3)
- frontend/src/gallery/components/GalleryFeatured.tsx:13 y :51 (alto fijo / aspect-4/3)
- frontend/src/gallery/components/RelatedAlbums.tsx:38 (aspect-4/3)

**Opciones:**

1. **A. Pedirlo junto con las miniaturas, en la misma migración y el mismo script**
   - A favor: Cuesta casi nada extra: sharp ya calcula la medida al procesar. Deja el dato listo para cualquier mejora futura.
   - En contra: Hoy no cambia nada visible: el front no lo usaría hasta que alguien decida para qué.
2. **B. No pedirlo**
   - A favor: Un cambio menos. La página ya no salta.
   - En contra: Si más adelante se quiere, hay que volver a recorrer todas las fotos con otro script.

**Recomendación.** Prioridad 2 de 9, pero solo como parte del cambio de miniaturas (opción A). Pedido por separado no se justifica: los saltos de la página que pretendía evitar ya no existen, porque las cajas tienen medida fija. Hay que corregir el texto de PENDIENTES.md para que no parezca un arreglo de saltos.

### Epígrafe por foto

*Decisión · sigue vigente · esfuerzo: un día o más · impacto para el usuario: bajo*

**Estado actual.** No existe, y eso fue una decisión que dejaron escrita. La entidad de la foto aclara que no tiene título ni metadatos propios porque 'nadie le pone nombre a la foto 4 de un asado'. El texto alternativo se arma con el título del momento y la posición ('Título — foto 3 de 5'). Para agregarlo haría falta: una columna `caption` corta (unos 200 caracteres) que acepte vacío, un endpoint nuevo para editarla (`PATCH /admin/gallery/:id/images/:imageId`, porque hoy no hay forma de editar una foto suelta), su DTO con mensajes en castellano, un campo por foto en el diálogo de fotos del panel, y mostrarlo en el escenario y el visor (y usarlo como texto alternativo).

**Evidencia:**

- backend/src/gallery/entities/gallery-image.entity.ts:5-10 (decisión documentada: la foto no lleva metadatos)
- backend/src/gallery/controllers/admin-gallery.controller.ts:186-283 (no hay endpoint para editar una foto)
- frontend/src/gallery/interfaces/Gallery.ts:20-25
- frontend/src/gallery/lib/moment-labels.ts:38-44 (photoAlt por título y posición)
- frontend/src/admin/components/AlbumImagesDialog.tsx:148-162 (grilla de fotos del panel, sin campos)

**Opciones:**

1. **A. No hacerlo: la descripción del momento da el contexto**
   - A favor: Respeta la decisión que ya está escrita. No le suma trabajo a quien carga fotos, que con 5 fotos por momento casi nunca va a escribir epígrafes, y no hay nada que mantener.
   - En contra: Para un lector de pantalla todas las fotos de un momento se describen igual ('foto 2 de 5').
2. **B. Epígrafe optativo, visible abajo de la foto en el escenario y el visor, y usado como texto alternativo**
   - A favor: Permite nombrar a quién o qué se ve ('Entrega de camisetas a la Sub-13'). Mejora la accesibilidad cuando se completa.
   - En contra: Es el cambio más grande del bloque después de las miniaturas: endpoint, panel y público. Si casi nadie lo completa, queda una función vacía, y hay que diseñar dónde va el texto sin taparle la foto.
3. **C. Solo texto alternativo, que se carga en el panel y no se muestra**
   - A favor: Suma accesibilidad sin tocar el diseño público.
   - En contra: El mismo trabajo en el backend y el panel que B, por un campo que casi nadie va a completar si no lo ve publicado.

**Recomendación.** Prioridad 7 de 9: opción A por ahora. Es cosmético, va contra una decisión que tiene su motivo escrito y le suma trabajo a quien administra la web. Volvería a considerarlo solo si el club pide nombrar a las personas de las fotos.

### Portada: GET /gallery/featured o filtro hasImages

*Decisión · sigue vigente · esfuerzo: medio día · impacto para el usuario: medio*

**Estado actual.** Sigue pendiente. `GET /gallery` solo acepta `page`, `limit` y `categoryId`, y como el backend rechaza cualquier parámetro desconocido con un 400, el front no puede mandarlo antes de que exista. Hoy el front elige la portada buscando el primer momento con foto dentro de los 12 de la primera página. Si ninguno tiene, cae al encabezado de siempre. Además, el listado público muestra los momentos sin fotos con el cartel 'Todavía sin fotos', que es un estado normal porque el panel los crea vacíos. Ojo: el panel usa ESTE MISMO endpoint público para listar, así que cualquier filtro tiene que ser optativo y no venir activado de fábrica. Lo que habría que tocar para `hasImages`: un campo optativo en GalleryQueryDto con conversión explícita de texto a booleano (con `@Type(() => Boolean)`, el texto 'false' se convierte en true) y un `andWhere('EXISTS (SELECT 1 FROM gallery_images gi WHERE gi.album_id = album.id)')` en `getAll`. Esa condición filtra por el momento, así que no cae en el problema de ordenar por columnas de la tabla unida que advierte el servicio.

**Evidencia:**

- backend/src/gallery/dto/gallery-query.dto.ts:4-8 (solo categoryId)
- backend/src/configure-app.ts:75-76 (forbidNonWhitelisted: un parámetro nuevo da 400 hasta que el backend lo acepte)
- backend/src/gallery/services/gallery.service.ts:51-57 (advertencia sobre el ORDER BY con joins; un EXISTS no la toca)
- backend/src/gallery/controllers/public-gallery.controller.ts:12-18 (un /featured tendría que ir antes que :id)
- frontend/src/gallery/lib/featured.ts:3-17 (pickFeatured y su 'límite conocido')
- frontend/src/gallery/hooks/useGallery.ts:26-57 (portada y grilla comparten la misma entrada de cache)
- frontend/src/gallery/pages/GalleryPage.tsx:171-187 (fallback a PageHero)
- frontend/src/gallery/components/AlbumCard.tsx:50-56 (tarjeta 'Todavía sin fotos' en el sitio público)
- frontend/src/admin/pages/AdminGalleryPage.tsx:26 (el panel usa el mismo GET /gallery)

**Opciones:**

1. **A. Filtro optativo `hasImages=true` que el sitio público usa para todo el listado (los momentos vacíos solo se ven en el panel)**
   - A favor: La portada queda asegurada con la misma petición de hoy: pasa a ser el primero de la lista y se sigue compartiendo la cache. El sitio público deja de mostrar momentos a medio cargar, y `pickFeatured` y su 'límite conocido' se simplifican.
   - En contra: Cambia lo que ve el público: un momento recién creado no aparece hasta que tenga fotos (probablemente es lo deseable). Un link directo a un momento vacío sigue abriendo su página sin fotos.
2. **B. `hasImages` solo para la portada (una petición aparte de 1 momento) y la grilla igual que hoy**
   - A favor: No cambia qué momentos se listan.
   - En contra: Siempre una petición más, incluso en 'Todas, página 1', y la grilla sigue mostrando tarjetas 'Todavía sin fotos'.
3. **C. Endpoint dedicado `GET /gallery/featured`**
   - A favor: Es explícito, y el backend decide qué es 'portada' (mañana podría ser un momento destacado a mano).
   - En contra: Un endpoint más, que además tiene que declararse antes de `:id` o desaparece detrás de un 400, y tampoco resuelve las tarjetas vacías de la grilla.

**Recomendación.** Prioridad 3 de 9: opción A. Es barata (una hora en el backend y otra en el front) y resuelve dos cosas a la vez: la portada y que el público no vea momentos a medio cargar. Es lo que haría cualquier galería convencional. Hay que publicar primero el backend y después el front, por el 400 ante parámetros desconocidos. Esto se cruza con el punto 'Momento sin fotos' de la sección 3: con A, ese estado solo se ve entrando por un link directo.

### excludeId en GET /gallery

*Decisión · sigue vigente · esfuerzo: minutos · impacto para el usuario: bajo*

**Estado actual.** No existe en el backend, pero hoy casi no hace falta. 'Más momentos de…' pide los primeros 12 momentos de la categoría con la misma clave de cache que el listado filtrado: si se viene de `/galeria?categoria=partidos`, no sale ninguna petición. Después descarta el momento actual y se queda con 3. El costo es traer unos 9 momentos de más en JSON, que sin fotos son unos pocos KB, y las imágenes que se bajan son solo las 3 que se muestran. Con `excludeId`, la consulta tendría otra clave y perdería esa cache compartida, así que siempre saldría una petición nueva. En el backend sería un `@IsUUID` optativo en el DTO y un `andWhere('album.id != :excludeId')`.

**Evidencia:**

- backend/src/gallery/dto/gallery-query.dto.ts:4-8
- frontend/src/gallery/hooks/useGallery.ts:59-79 (useRelatedAlbums reutiliza la key del listado filtrado)
- frontend/src/gallery/lib/featured.ts:56-66 (pickRelated descarta el actual y corta en 3)

**Opciones:**

1. **A. Descartarlo**
   - A favor: Mantiene la cache compartida con el listado (cero peticiones al venir de la categoría). No hay nada roto que arreglar.
   - En contra: Se traen unos pocos KB de JSON de más cuando se entra directo por un link.
2. **B. Pedir `excludeId` y bajar a `limit: 3`**
   - A favor: La respuesta viene exacta y `pickRelated` desaparece.
   - En contra: Siempre una petición extra, incluso viniendo del listado, por un ahorro de KB que nadie nota.
3. **C. Pedir en cambio los 'vecinos por fecha' (momento anterior y siguiente)**
   - A favor: Permitiría un 'anterior / siguiente' real entre momentos, que la API hoy no da.
   - En contra: Es otra función, no una optimización. Suma diseño y consultas nuevas sin que nadie lo haya pedido.

**Recomendación.** Prioridad 8 de 9: descartarlo (opción A) y sacarlo de PENDIENTES.md. El ahorro es de unos pocos KB y el costo es perder una cache que hoy evita peticiones. No simplifica nada que valga la pena.

### Slug de categoría en la API

*Decisión · sigue vigente · esfuerzo: medio día · impacto para el usuario: bajo*

**Estado actual.** Sigue pendiente. La categoría solo tiene `name` (único), `color` y las fechas: no tiene slug. El front arma el slug a partir del nombre (`slugify`) y resuelve dos casos raros: dos nombres que solo difieren en tildes ('Fútbol' y 'Futbol') y un nombre sin letras ('⚽'). En esos casos cae al UUID, y está cubierto por unos 12 tests. La página del momento además pide la lista de categorías solo para armar bien el link 'Ver todos los de X'. Casi siempre ya está en la cache del listado (media hora); solo sale una petición al entrar directo por un link. Qué habría que tocar en el backend: una columna `slug` única, generarla al crear y al renombrar con manejo de choques ('futbol-2'), una migración que complete las categorías existentes (sin depender de la extensión `unaccent` de Postgres), sumarla a GalleryCategoryResponseDto, y opcionalmente aceptar `categorySlug` en el listado. Lo que se simplificaría en el front: `slugify`, `categorySlug` y `resolveCategory` pasan a ser una comparación directa, RelatedAlbums deja de necesitar la lista de categorías y GalleryAlbumPage deja de pedirla. Sigue haciendo falta la lista para la barra lateral.

**Evidencia:**

- backend/src/gallery/entities/gallery-category.entity.ts:5-19 (sin slug)
- backend/src/gallery/mappers/gallery-response.mapper.ts:8-17
- frontend/src/gallery/lib/gallery-url.ts:18-59 (slugify, categorySlug con choques y UUID, resolveCategory)
- frontend/src/gallery/lib/gallery-url.spec.ts:29-96 (tests de esa lógica)
- frontend/src/gallery/components/CategoryNav.tsx:95
- frontend/src/gallery/components/RelatedAlbums.tsx:10-11 y :66
- frontend/src/gallery/pages/GalleryAlbumPage.tsx:146-149 (pide categorías solo para el link)

**Opciones:**

1. **A. Dejarlo como está**
   - A favor: Funciona, tiene los casos raros cubiertos con tests y con 3 o 4 categorías los choques son casi imposibles. Cero trabajo.
   - En contra: Queda lógica de dominio en el front que en rigor le corresponde al backend, y una petición de más al entrar directo a un momento.
2. **B. Slug en el backend que se regenera al renombrar**
   - A favor: El front se simplifica y el link sale directo del momento. Mismo comportamiento que hoy ante un cambio de nombre.
   - En contra: Medio día de backend con migración y manejo de choques, para un beneficio que el socio no percibe. Renombrar sigue rompiendo los links compartidos, igual que hoy.
3. **C. Slug fijo desde que se crea (no cambia al renombrar)**
   - A favor: Los links compartidos nunca se rompen.
   - En contra: Si 'Futbol' pasa a llamarse 'Deportes', la dirección sigue diciendo `futbol`, y habría que decidir si el panel permite editarlo. Más complejidad.

**Recomendación.** Prioridad 6 de 9: opción A por ahora. Es mantenimiento, no algo que mejore la experiencia, y la lógica actual está probada. Si se toca el módulo de categorías por otro motivo (por ejemplo, la cantidad de momentos), recién ahí conviene sumarlo en la forma B.

### Cantidad de momentos por categoría

*Decisión · sigue vigente · esfuerzo: medio día · impacto para el usuario: bajo*

**Estado actual.** Sigue pendiente. `GET /gallery/categories` devuelve id, nombre, color y fecha, sin conteo. La barra lateral muestra solo nombres. El número ya aparece arriba de la grilla ('5 momentos') al elegir una categoría. El problema real que taparía: una categoría recién creada en el panel y todavía sin momentos aparece igual en la barra pública, y al tocarla muestra 'No hay momentos en esta categoría.'. Qué habría que tocar: en `getCategories`, un `loadRelationCountAndMap` o un GROUP BY, y el campo `albumCount` en un DTO aparte o como campo optativo. El DTO de categoría también viaja adentro de cada momento y en las respuestas del panel, y ahí no hace falta. Si se adopta `hasImages` para el público, el conteo tiene que contar con el mismo criterio o la barra y la grilla no van a coincidir.

**Evidencia:**

- backend/src/gallery/services/gallery.service.ts:98-103 (getCategories sin conteo)
- backend/src/gallery/dto/gallery-category-response.dto.ts:1-6
- backend/src/gallery/mappers/gallery-response.mapper.ts:52-54 (el mismo DTO va embebido en cada momento)
- frontend/src/gallery/components/CategoryNav.tsx:93-97 (solo nombres)
- frontend/src/gallery/pages/GalleryPage.tsx:217-224 (el conteo ya se muestra arriba de la grilla)
- frontend/src/gallery/lib/listing-view.ts:68-76 (estado 'empty-category')

**Opciones:**

1. **A. No pedirlo**
   - A favor: Cero trabajo. El conteo ya se ve al elegir la categoría.
   - En contra: Las categorías vacías siguen apareciendo en la barra y llevan a un cartel vacío.
2. **B. Pedirlo y usarlo solo para ocultar de la barra pública las categorías sin momentos**
   - A favor: Resuelve el único problema real (tocar una categoría y encontrarla vacía) sin sumar nada visual. La barra queda igual de limpia.
   - En contra: Una hora de backend. Hay que alinear el criterio con `hasImages` si se adopta.
3. **C. Pedirlo y mostrar el número al lado de cada nombre ('Partidos 12')**
   - A favor: Es un patrón conocido en filtros y da una idea del tamaño de cada categoría antes de tocarla.
   - En contra: Suma ruido visual a una barra que hoy está limpia y repite el número que ya aparece arriba de la grilla.

**Recomendación.** Prioridad 5 de 9: opción B. El número en sí es cosmético y ya está en pantalla. Lo que sí vale es no ofrecer una categoría que lleva a un vacío. Conviene pedirlo después de decidir lo de `hasImages`, para que el conteo use el mismo criterio.

### Desempate del orden del listado

*Tarea · ya no está vigente · esfuerzo: minutos · impacto para el usuario: bajo*

**Estado actual.** Ya está resuelto en el backend, y desde antes de que se escribiera PENDIENTES.md. `getAll` ordena por `date DESC NULLS LAST`, después por `createdAt DESC` y por último por `id DESC`, con un comentario que explica que es para que la paginación sea estable. Entró en el commit 0a0c6b6 del backend (14/08/2026). El propio front ya lo asume: el comentario de `pickFeatured` dice 'con desempate'. Lo único que queda es tacharlo en PENDIENTES.md.

**Evidencia:**

- backend/src/gallery/services/gallery.service.ts:47-49 (comentario: 'Los dos desempates hacen estable la paginación')
- backend/src/gallery/services/gallery.service.ts:58-60 (orderBy date NULLS LAST + createdAt DESC + id DESC)
- backend: git log -S "addOrderBy('album.id'" -> 0a0c6b6 2026-08-14 'core fixed'
- frontend/src/gallery/lib/featured.ts:6-7 ('en el orden del backend (fecha descendente, sin fecha al final, con desempate)')

**Recomendación.** Prioridad 9 de 9: no hay nada que pedir. Marcarlo como hecho en PENDIENTES.md, con la referencia a gallery.service.ts:58-60, para que nadie lo vuelva a pedir.

### Paginación sin resultados o fuera de rango

*Decisión · sigue vigente · esfuerzo: una hora · impacto para el usuario: bajo*

**Estado actual.** Sigue igual. El backend calcula `totalPages: Math.ceil(totalItems / limit)`, que da 0 cuando no hay resultados, y devuelve `currentPage: page` tal cual se pidió, aunque esa página no exista (con `items: []`). En la galería pública el front ya lo corrige: `clampPage` usa `Math.max(1, totalPages)` y lleva a la última página real, y `rangeLabel` dice 'Mostrando 0 de N'. No es un tema solo de la galería: la misma cuenta está copiada en otros 5 servicios, y en pagos está escrita a mano en 0. En el panel nadie lo corrige (ver hallazgos). Lo que se simplificaría en el front es poco: el `Math.max(1, …)` de `clampPage`, un test y un comentario. Aunque el backend corrigiera la página, `clampPage` seguiría haciendo falta para arreglar el `?pagina=` de la dirección.

**Evidencia:**

- backend/src/gallery/services/gallery.service.ts:72-80 (totalPages sin mínimo, currentPage = page pedida)
- backend/src/audit/services/audit.service.ts:117, backend/src/events/services/events.service.ts:89, backend/src/members/services/admin-members.service.ts:1436 y :1973, backend/src/users/services/users.service.ts:142, backend/src/payments/payments-admin.service.ts:167 (totalPages: 0 fijo) y :220
- backend/src/common/interfaces/paginated-result.interface.ts:1-14 (contrato común, sin helper)
- frontend/src/gallery/lib/gallery-url.ts:99-120 (clampPage)
- frontend/src/gallery/lib/gallery-url.spec.ts:150 (test de totalPages 0)
- frontend/src/gallery/components/GalleryPagination.tsx:32 ('Con 0 resultados el backend manda totalPages 0')
- frontend/src/gallery/lib/page-window.ts:37-41 (rangeLabel ante página vacía)
- frontend/src/components/custom/Pagination.tsx:21 (se oculta con totalPages <= 1)

**Opciones:**

1. **A. Un solo cálculo común en el backend (`buildPaginationMeta`) con `totalPages` mínimo 1, usado por los 7 listados, sin corregir la página pedida**
   - A favor: Arregla el 0 en todos los listados a la vez y saca la cuenta duplicada. Una página fuera de rango sigue avisando con `items: []` y la decisión de adónde llevar queda en el front, que es donde está la dirección. No rompe nada: el front ya trata 0 y 1 igual.
   - En contra: No arregla por sí solo el panel, que sigue sin corregir la página (hay que tocar el front).
2. **B. A más corregir en el backend: si la página pedida no existe, devolver la última real con `currentPage` corregido**
   - A favor: El panel se arreglaría solo, sin tocar el front, porque su paginación lee `currentPage` del meta.
   - En contra: Hace falta una segunda consulta en ese caso. La cache del front guardaría bajo 'página 5' los datos de la página 2, y la dirección del sitio público seguiría diciendo `?pagina=5`, así que `clampPage` no se va. Es un comportamiento menos predecible que una página vacía.
3. **C. Dejar el backend como está y corregir solo en el front (llevar `clampPage` o algo parecido a los listados del panel)**
   - A favor: Cero cambios en el backend.
   - En contra: Deja el 0 inconsistente en la API y la cuenta repetida en 7 servicios, y cada pantalla nueva tiene que acordarse de corregirlo.

**Recomendación.** Prioridad 4 de 9: opción A en el backend, sumada a un arreglo chico en el front para el panel (ver hallazgos). Es barato, deja un solo lugar donde se calcula la paginación y no esconde nada. La B parece más cómoda, pero mezcla datos de una página bajo la clave de otra y no ahorra la corrección de la dirección en el sitio público.

### Hallazgos nuevos de este bloque

- Panel de galería: si se borra el único momento de la última página, el panel queda en una página vacía que dice 'Todavía no hay momentos cargados.', y sin paginación para volver. La página vive en un estado local (`useState(1)`), el borrado refresca esa misma página, el backend responde `items: []` con `totalPages` menor a la página pedida, y la paginación compartida se oculta con `totalPages <= 1`. Pasa con más de 24 momentos. Evidencia: frontend/src/admin/pages/AdminGalleryPage.tsx:23, :26, :63-66, :157; frontend/src/admin/hooks/useAdminGallery.ts:22; frontend/src/components/custom/Pagination.tsx:21. Las otras 6 pantallas del panel que usan `<Pagination>` con página local (AdminEventsPage, ApplicationsPage, AuditPage, MembersListPage, PaymentsPage, StaffPage) probablemente tienen el mismo problema al borrar o filtrar; no lo verifiqué pantalla por pantalla.
- Comentario desactualizado en frontend/src/gallery/lib/carousel.ts:86-89: `imageLoading` dice que carga la foto actual y sus vecinas 'sin bajar las cinco de entrada', pero en escritorio la tira de miniaturas (frontend/src/gallery/components/AlbumStage.tsx:183-188) muestra las 5 con la URL grande desde el principio, así que igual se bajan todas al entrar al momento. Se resuelve con las miniaturas; mientras tanto, el comentario promete algo que no pasa en escritorio.

## Anexo 2 · 3. Galería: sin probar o sin decidir

### Momento sin fotos: estado vacío en la app

*Prueba a mano · sigue vigente · esfuerzo: minutos · impacto para el usuario: bajo*

**Estado actual.** El código cubre el caso en los cuatro lugares donde aparece un momento. Como no hay ninguno vacío en la base (los 10 tienen entre 1 y 5 fotos), lo probé en la app real simulando la respuesta del backend: le vacié las fotos a "Victoria en el clásico" desde el navegador, sin tocar datos. Resultado en Chromium: 1) la portada saltea ese momento y muestra el siguiente con foto ("La hinchada celeste"); 2) en la grilla, la tarjeta aparece primera con una caja gris, el ícono y "Todavía sin fotos", sin contador de fotos; 3) en la página del momento en escritorio (1280x800) hay una caja punteada de 779x584 a la izquierda con "Este momento todavía no tiene fotos cargadas." y "Ver otros momentos", y la ficha a la derecha; 4) en celular (375x812) va "← Galería", el chip, el título, "3 de septiembre de 2026 · Sin fotos todavía", la caja (327x262) y "Más momentos de Partidos". Todo se ve bien y coherente. Detalle menor: sin fotos hay dos salidas al mismo lugar ("← Galería" y "Ver otros momentos"), cosa aceptable. Queda probarlo con un momento de verdad creado vacío desde el panel.

**Evidencia:**

- frontend/src/gallery/pages/GalleryAlbumPage.tsx:210-222 (GalleryNotice "Este momento todavía no tiene fotos cargadas." + "Ver otros momentos")
- frontend/src/gallery/pages/GalleryAlbumPage.tsx:160-165,182,198 (sin fotos la ficha sube y la caja queda debajo del título)
- frontend/src/gallery/components/AlbumCard.tsx:50-57 ("Todavía sin fotos")
- frontend/src/gallery/lib/moment-labels.ts:33-36 ("Sin fotos todavía" en la línea de datos)
- frontend/src/gallery/lib/featured.ts:16-17 (la portada toma el primero CON foto)
- frontend/src/gallery/components/RelatedAlbums.tsx:47-49 (ícono en vez de miniatura)
- backend/src/gallery/dto/create-gallery-album.dto.ts (se crea sin fotos) y backend/src/gallery/mappers/gallery-response.mapper.ts:55-56 (coverUrl null, imageCount 0)
- GET localhost:3000/api/gallery: 10 momentos, todos con 1 a 5 fotos

**Recomendación.** Hacer la prueba real, que lleva cinco minutos: crear un momento sin fotos desde /admin/galeria con la fecha de hoy (así queda primero), mirar /galeria y la página del momento en el celular y en la compu, y después subirle fotos o borrarlo. La simulación ya mostró que la pantalla está bien. Lo único que falta confirmar es que el backend real responda igual (coverUrl null e images vacío).

### Paginación larga (10 o más páginas)

*Prueba a mano · sigue vigente · esfuerzo: minutos · impacto para el usuario: bajo*

**Estado actual.** La lógica de qué números mostrar tiene tests hasta 12 páginas. La probé en el navegador inventando la cantidad de páginas (15 y 115). Con 360, 375, 640 y 1024 px de ancho entra en una sola fila ("Anterior 1 … 108 … 115 Siguiente" en el celular, "1 … 107 108 109 … 115" desde 640). A 1024 el "Mostrando…" pasa arriba de los botones, algo que el diseño ya prevé. Hay un solo problema, y es en pantallas de 320 px: con 6 páginas o más la fila mide 312 px en un espacio de 272 y toda la página se puede correr para el costado (ancho del documento: 336). Con 15 páginas se come el margen lateral sin llegar a desbordar. Los celulares de 320 px son muy pocos hoy.

**Evidencia:**

- frontend/src/gallery/lib/page-window.ts:18-28
- frontend/src/gallery/lib/page-window.spec.ts:36-52 (probado solo hasta 12 páginas)
- frontend/src/gallery/components/GalleryPagination.tsx:98-106 (5 lugares en celular, 7 desde sm)
- Medición en navegador: 360px → fila de 312 en 312 disponibles (justo); 320px con 9 páginas → fila 312 en 272, scrollWidth del documento 336

**Opciones:**

1. **Darlo por probado desde 360 px y no hacer nada para 320**
   - A favor: Cero trabajo. 360 px es el ancho mínimo habitual de los Android actuales.
   - En contra: En un celular muy chico (iPhone SE de primera generación) la página se corre de costado, pero solo si el club llega a 6 páginas o más, o sea más de 60 momentos.
2. **Ajustarlo para 320 (por ejemplo, botones de 40 px o sin los "…" debajo de 360 px)**
   - A favor: No se desborda en ningún celular.
   - En contra: Hay que tocar el componente y volver a medir, todo por un caso rarísimo.

**Recomendación.** Darlo por probado desde 360 px y tachar el punto. Lo de 320 px conviene anotarlo como algo conocido y arreglarlo solo si el club alguna vez pasa de 60 momentos y alguien lo reporta.

### Lectores de pantalla (NVDA / VoiceOver)

*Prueba a mano · sigue vigente · esfuerzo: una hora · impacto para el usuario: medio*

**Estado actual.** Sigue sin probarse. El código tiene la base puesta: el carrusel está marcado como tal, cada foto se anuncia como "N de M", el contador del visor se lee solo al cambiar, las flechas de los extremos quedan deshabilitadas sin perder el foco, la categoría y la página actuales están marcadas y hay un h1 oculto en el listado. Hay que escuchar sobre todo una cosa: al tocar otra página o categoría, el foco se queda en el link y no se anuncia que cambió la grilla (no hay región que avise). Puede estar bien o no; eso se decide escuchándolo.

**Evidencia:**

- frontend/src/gallery/components/AlbumStage.tsx:96-110 (region + aria-roledescription carrusel/foto)
- frontend/src/gallery/components/AlbumStage.tsx:148-158,218 (aria-disabled, aria-live)
- frontend/src/gallery/components/AlbumViewer.tsx:146,155-161 (contador aria-live, DialogTitle, Cerrar)
- frontend/src/gallery/components/GalleryFeatured.tsx:47-51 (link de la foto oculto al lector)
- frontend/src/gallery/pages/GalleryPage.tsx:148,175 (aria-busy en la grilla, h1 sr-only; sin aria-live en resultados)
- frontend/src/gallery/components/CategoryNav.tsx:75 y GalleryPagination.tsx:48-50 (aria-current)

**Recomendación.** Hacer una pasada con NVDA (gratis, en Windows) y Chrome por cuatro recorridos: entrar a /galeria, cambiar de categoría y de página, entrar a un momento y pasar fotos con las flechas, y abrir y cerrar la pantalla completa. Si hay un iPhone a mano, repetir el recorrido del momento con VoiceOver. Anotar solo lo que confunda. El punto más probable es el cambio de página sin aviso.

### Títulos largos en la portada: ¿3 renglones o 2?

*Decisión · sigue vigente · esfuerzo: minutos · impacto para el usuario: medio*

**Estado actual.** Sigue igual: el título se corta en 2 renglones entre 768 y 1023 px y en 3 desde 1024 (en el celular no se corta, porque va debajo de la foto). Medí con un título de 120 caracteres (el máximo que acepta el panel) cuánta foto queda limpia arriba del bloque de texto, sin contar el desvanecido de 128 px. Con 3 renglones: 45 px a 1280x720, 64 px a 1366x768, 93 px a 1280x800, 104 px a 1024x768 y 134 px a 1440x900. Con 2 renglones: 94, 116, 142, 143 y 189 px. Qué entra entero a 1366 px: hasta unos 50 caracteres en 2 renglones (39 y 52 caracteres → 2; 59 → 3; 84 → 4, cortado en 3). Los títulos del seed tienen entre 15 y 27 caracteres y ocupan 1 renglón, así que el cambio solo afecta a títulos largos. Aparte: entre 768 y 1023 px con poca altura (800x600) el botón va debajo del texto y quedan 28 px de foto con un título largo y 66 px con uno corto. Eso no depende de esta decisión.

**Evidencia:**

- frontend/src/gallery/components/GalleryFeatured.tsx:89 (md:line-clamp-2 lg:line-clamp-3)
- frontend/src/gallery/components/GalleryFeatured.tsx:73 (max-w-[22ch], tamaño clamp(2.25rem,3.6vw,3.25rem))
- frontend/src/gallery/components/GalleryFeatured.tsx:75-86 (por qué hay tope)
- frontend/src/index.css:817-821 (los números medidos que justifican la excepción; coinciden con mi medición: 134 px a 1440x900, 45 px a 1280x720)
- frontend/src/admin/components/AlbumFormDialog.tsx:29 y backend/src/gallery/gallery.constants.ts (MAX_ALBUM_TITLE_LENGTH = 120)

**Opciones:**

1. **Dejar 3 renglones desde 1024 px (como está)**
   - A favor: Títulos de hasta unos 75 caracteres se leen enteros en la portada. No hay nada que tocar.
   - En contra: En las notebooks más comunes (1280x720, 1366x768), un título largo deja solo 45-64 px de foto limpia: la portada pasa a ser casi un cartel oscuro, justo lo que DESIGN.md y el Principio 4 piden evitar.
2. **Cortar en 2 renglones en todos los tamaños**
   - A favor: La foto gana unos 50 px en cualquier notebook (94 px a 1280x720). El comportamiento es el mismo en tablet y en compu, y la excepción del texto sobre la foto queda mejor defendida. Es cambiar una clase y actualizar los números del comentario.
   - En contra: Un título de más de unos 50 caracteres aparece con "…" en la portada. Entero se lee en la página del momento, y el lector de pantalla lo lee completo.
3. **Dejar 3 renglones y frenar el largo desde el panel (aviso o contador en el formulario, o bajar el máximo de 120)**
   - A favor: Ataca la causa: el título nunca se corta.
   - En contra: Suma trabajo y fricción para quien carga los momentos, bajar el máximo pide un cambio en el backend y los títulos viejos siguen igual.

**Recomendación.** Cortar en 2 renglones siempre: sacar `lg:line-clamp-3` en GalleryFeatured.tsx:89 y actualizar las medidas en index.css:817-821 y en el comentario de GalleryFeatured. Es el cambio más chico y convencional, protege la foto, que según el sistema es lo más valioso, y no toca los títulos cortos que el club usa hoy. Un título largo se lee entero con un clic.

### Texto sobre la foto en la portada: anotar la excepción en DESIGN.md

*Decisión · sigue vigente · esfuerzo: minutos · impacto para el usuario: bajo*

**Estado actual.** Sigue igual. DESIGN.md dice en tres lugares que las fotos van sin velos ni degradados encima: en la presentación general, en el Do y en el Don't "poner texto encima de una foto tapándola con un velo de degradé". PRODUCT.md dice lo mismo en el Principio 4. La excepción se explica solo en el comentario de `bg-scrim-portada` en index.css, que encima dice "Es la EXCEPCIÓN documentada al Don't de DESIGN.md" cuando DESIGN.md no la menciona (buscando "scrim" o "portada de la galería" no aparece nada). DESIGN.md no tiene una sección de excepciones: la de los 2 px se escribió en el mismo lugar que la regla, como un párrafo que empieza "La excepción es…", en el mismo commit de la galería. Hay un antecedente parecido ya aceptado: el Bloque partido lleva un pie de foto sobre una placa oscura al 80%.

**Evidencia:**

- frontend/DESIGN.md:155-158 (fotos "sin velos ni degradados encima")
- frontend/DESIGN.md:419-420 (Do) y :430 (Don't texto sobre foto con velo)
- frontend/DESIGN.md:338-342 (así se anotó la excepción de 2 px, en el lugar de la regla; commit 8372846)
- frontend/DESIGN.md:406-412 (Bloque partido: pie sobre placa oscura al 80%)
- frontend/PRODUCT.md:209-211 (Principio 4)
- frontend/src/index.css:808-834 (la justificación completa; línea 811 dice "documentada" en DESIGN.md) y :835-844 (el degradado)
- frontend/src/gallery/components/GalleryFeatured.tsx:24-30,66

**Opciones:**

1. **Anotarla en DESIGN.md como la del 2 px: un párrafo corto en Components, después de "Bloque partido", más un "(salvo la portada de la galería)" en el Don't**
   - A favor: DESIGN.md sigue siendo la fuente que manda y no se contradice con el código. Nadie la va a "arreglar" leyendo el Don't, y quedan escritas las condiciones para que no se copie en otra página sin ellas. Es el mismo formato que ya se usa.
   - En contra: Son unos diez renglones más de documento. Si la portada cambia, hay que acordarse de actualizar dos lugares (se evita dejando las medidas en index.css y solo las reglas en DESIGN.md).
2. **Dejarla solo en index.css y corregir la palabra "documentada" del comentario**
   - A favor: Casi no hay trabajo.
   - En contra: El documento que manda sigue diciendo lo contrario de lo que hace la página. Quien diseñe algo nuevo o haga una auditoría lee solo DESIGN.md y lo marca como error, o copia el patrón sin las condiciones.
3. **Sacar la excepción: en la compu el texto también va debajo de la foto, en panel sólido, como en el celular**
   - A favor: Coherencia total con el sistema. De paso se resuelven los títulos largos y la tablet con poca altura.
   - En contra: Es un rediseño de algo que el club pidió (lo dice index.css:813), cambia una portada ya aprobada y lleva bastante más trabajo.

**Recomendación.** La opción 1. La excepción ya está decidida y bien medida, solo le falta estar escrita donde corresponde. Texto sugerido para DESIGN.md: "La excepción es la portada de la galería ('Lo más reciente'): desde md el título va encima de la foto, abajo, sobre un fondo de Negro Escudo al 80% que mide lo que mide el texto y solo se desvanece en sus 8rem de arriba. El título tiene tope de renglones y en el celular el texto va debajo, en panel sólido. No se usa en ningún otro lugar." Además, en index.css:811 cambiar "documentada" por una referencia a esa sección. No hace falta tocar PRODUCT.md.

### Volver del momento al listado sin ScrollRestoration

*Decisión · sigue vigente · esfuerzo: medio día · impacto para el usuario: medio*

**Estado actual.** Sigue igual: no hay `<ScrollRestoration />` en ningún lado. La app usa createBrowserRouter (react-router 7.18.1), así que ese componente está disponible, pero la galería lo compensa a mano: sube al entrar con un link y deja el atrás al navegador. Lo probé en Chromium. Con la vuelta normal anda: a 1280x720 el listado estaba en y=1175, entré al momento, volví con el atrás y quedé en y=1175 con la tarjeta en el mismo lugar. A 375x812 pasó lo mismo (3295 → 3295), también abriendo y cerrando la pantalla completa (2508 → 2508). Falla en un caso: si la caché del listado venció (pasan más de 5 minutos en el momento, porque queryClient no cambia el gcTime) y la red es lenta. Lo simulé con 1,5 s de demora: volví a y=4588 en vez de 3688, con la tarjeta 679 px fuera de pantalla. Safari y Firefox no están probados. Hay además un problema más grande en todo el sitio: los links no suben al principio. Desde abajo de la home, el link "Historia" del pie abrió Historia en y=4836, en medio de la línea de tiempo.

**Evidencia:**

- frontend/src/landing/layouts/PublicLayout.tsx:9-23 (sin ScrollRestoration)
- frontend/src/router/router.app.tsx (createBrowserRouter, un layout por árbol, sin ruta raíz común)
- frontend/src/gallery/pages/GalleryPage.tsx:65-77 y GalleryAlbumPage.tsx:46-58 (subida manual, solo si no es POP)
- frontend/src/gallery/pages/GalleryPage.tsx:87-96 (acerca el catálogo al cambiar filtro/página)
- frontend/src/api/queryClient.ts:8-22 y src/gallery/hooks/useGallery.ts:16-23 (sin gcTime: 5 min por defecto)
- Navegaciones que con ScrollRestoration saltarían arriba si no llevan preventScrollReset: GalleryPagination.tsx:44-47 y 67-69 (Link replace), CategoryNav.tsx:69-74, useGalleryUrl.ts:29-37 (replacePage), :83 (openViewer), :87 (showPhoto), :94 (closeViewer); en el panel, admin/pages/PaymentsPage.tsx:91
- Medición: home abajo → pie 'Historia' → /historia en scrollY 4836

**Opciones:**

1. **Dejarlo así, probar el atrás en iPhone/Safari y Firefox y, si hace falta, subir el gcTime del listado a 30 min**
   - A favor: Casi sin riesgo, y en Chrome ya anda. Con el gcTime más largo el caso de caché vencida se vuelve raro.
   - En contra: No arregla el problema de todo el sitio (los links del pie abren las páginas a mitad de camino) y la vuelta depende de cada navegador.
2. **Poner el <ScrollRestoration /> de react-router en una ruta raíz sin path que envuelva todo (o al menos en PublicLayout), sacar los dos window.scrollTo(0,0) manuales y agregar preventScrollReset donde solo cambia la dirección (paginación, categorías, visor, corrección de página y la solapa de Pagos)**
   - A favor: Arregla de una vez los links que abren a mitad de página y la vuelta con el atrás, igual en todos los navegadores (react-router guarda la posición de cada entrada del historial). Es la pieza oficial, con poco código, y la galería ya tiene identificados los lugares a ajustar.
   - En contra: Si se olvida un preventScrollReset, abrir la pantalla completa o cambiar de página salta arriba de todo, así que hay que probar visor, paginación y categorías. Tampoco resuelve la caché vencida con red lenta (conviene sumar el gcTime).
3. **Un componente chico propio que suba al principio solo en navegaciones nuevas y deje el atrás al navegador**
   - A favor: Arregla los links del pie sin cambiar cómo funciona hoy el atrás.
   - En contra: Reinventa lo que ya trae react-router, necesita las mismas excepciones para los cambios de solo dirección (?pagina, ?visor) y la vuelta sigue dependiendo del navegador.

**Recomendación.** La opción 2, más el gcTime de 30 min en el listado de la galería. El problema que más se nota no es la vuelta de la galería (en Chrome anda) sino que en todo el sitio público las páginas abren scrolleadas cuando se llega desde el pie. ScrollRestoration resuelve las dos cosas con la herramienta estándar del router que ya se usa. Hay que hacerlo con la lista de preventScrollReset de la evidencia a mano y probar a mano visor, paginación, categorías y el atrás en celular.

### Hallazgos nuevos de este bloque

- En todo el sitio los links no llevan al principio de la página nueva. Probado: desde abajo de la home, el link "Historia" del pie abre /historia en scrollY 4836, en medio de la línea de tiempo. Solo la galería lo resuelve a mano (frontend/src/gallery/pages/GalleryPage.tsx:74-77, GalleryAlbumPage.tsx:53-58). Probablemente pasa lo mismo en los paneles (no lo probé porque requiere sesión).
- Portada de la galería entre 768 y 1023 px con poca altura (por ejemplo 800x600): como el botón va debajo del texto, el bloque oscuro deja 28 px de foto limpia con un título largo (ya cortado en 2) y 66 px con uno corto de 22 caracteres (frontend/src/gallery/components/GalleryFeatured.tsx:67 y 122). Las medidas de index.css:819-821 cubren solo escritorio.
- PENDIENTES §2 "Desempate del orden" ya está resuelto en el backend: backend/src/gallery/services/gallery.service.ts:58-60 ordena por date DESC NULLS LAST, createdAt DESC e id DESC, sin cambios pendientes de commit. Se puede tachar.
- Comentario desactualizado en frontend/src/landing/layouts/PublicLayout.tsx:14-15 ("hoy solo Contacto" es lazy): GalleryAlbumPage también es lazy desde router.app.tsx:42-48.

## Anexo 3 · 4. Historia: animaciones

### Ver las animaciones en /historia con el backend andando

*Prueba a mano · sigue vigente · esfuerzo: una hora · impacto para el usuario: medio*

**Estado actual.** Sigue vigente a medias. Hoy el backend y el front están levantados y /historia carga los 15 hitos del seed, casos de borde incluidos. Lo revisé en el Chrome 152 del panel de navegador: soporta animaciones por scroll (CSS.supports da true), hay 92 animaciones activas y el avance que Chrome informa en una tarjeta (0,3714) coincide exacto con lo que dan los rangos del CSS. O sea, en la app corre el mismo CSS y hace lo mismo que en la maqueta. Lo que todavía falta es mirarlo con capturas, porque PRODUCT.md exige captura y ya pasó que los estilos computados dieran todo bien sobre una página rota. Hay que revisar: el celular (el overflow-x-clip que evita el scroll horizontal), los casos de borde del seed (la tarjeta de 2000 caracteres, los años 1800 y 2100, los dos hitos de 1995), la impresión y el modo 'reducir movimiento'.

**Evidencia:**

- localhost:3000/api/history responde 200 y /historia dibuja 15 .timeline-card (medido en el navegador)
- src/institutional/pages/HistoryPage.tsx:21-75 (overflow-x-clip, riel, punta y barra)
- src/institutional/components/MilestoneItem.tsx:28-41 (punto y tarjeta)
- backend/src/cli/seed-demo-content.ts:124-250 (hitos del seed con casos de borde)
- src/index.css:573-583 y 621 (impresión y reducir movimiento)
- PRODUCT.md:176 (nada se muestra sin captura de pantalla)

**Recomendación.** Hacer la revisión visual después de decidir el punto del escalonado (el que sigue), porque cualquier arreglo ahí cambia los rangos y habría que mirar todo de nuevo. Sacar capturas a 1440x900 y a 390x844, frenando varias veces con PageDown, y mirar sí o sí la tarjeta de 2000 caracteres en el celular.

### Texto más claro o borroso en las tarjetas (bloque ESCALONADO)

*Decisión · sigue vigente · esfuerzo: una hora · impacto para el usuario: alto*

**Estado actual.** Sigue vigente, pero la causa principal no es un bug raro de Chrome: es cómo están armados los rangos. Estas animaciones no avanzan con el tiempo sino con la posición del scroll, y terminan tarde. La tarjeta recién queda opaca en 'cover 40%' (bloque LADO) y la descripción en 'cover 42%' (bloque ESCALONADO). En una tarjeta común, eso pasa cuando su borde de arriba ya llegó a la mitad de la pantalla (47-49% a 1024x768). Resultado: cuando uno deja de scrollear, y un PageDown o un golpe de rueda justamente te dejan quieto, todo lo que está en la mitad de abajo queda a medio aparecer, transparente y todavía corrido. Encima las transparencias se multiplican: la de la tarjeta por la de cada renglón. Lo calculé sobre el layout real de /historia con las fórmulas de los rangos, y lo comparé con lo que reporta Chrome en una tarjeta: coincide exacto. A 1024x768, después de un PageDown, una tarjeta con el borde al 62% de la pantalla tiene la descripción al 38%. Y sin scrollear nada, al abrir la página, el primer hito ya se ve con la descripción al 56% (al 50% en un celular de 390x844). En las tarjetas largas es peor, porque los porcentajes crecen con el alto. La tarjeta de 2000 caracteres del seed mide 1952px en el celular y recién queda opaca cuando su borde de arriba ya se fue unos 330px por encima de la pantalla: mientras uno lee el principio, la tarjeta está al 77% y el texto al 38%. El gris del texto (--muted-foreground) da 6,8:1 opaco, 3,15:1 al 67%, 2,25:1 al 50% y 1,8:1 al 38%, todo por debajo del 4,5:1 que el proyecto sostiene. Hay una segunda causa posible que no medí: mientras un elemento tiene una animación de transform u opacity, Chrome lo dibuja en una capa aparte y, si esa capa no tiene fondo opaco, dibuja el texto en gris, sin ClearType. En Windows eso se ve más finito y más claro. Con 'fill: both' estas animaciones nunca terminan del todo, y el ESCALONADO le da a año, título y descripción una capa transparente a cada uno. Chrome headless normalmente no usa ClearType, lo que explicaría que ahí no se reprodujera. En Historia no hay will-change ni filter: el único filtro cerca es el desenfoque del header, que solo afecta lo que pasa por debajo de sus 73px.

**Evidencia:**

- src/index.css:651-655 (LADO: la tarjeta termina en 'entry 0% cover 40%')
- src/index.css:667-685 (ESCALONADO: año, título y descripción terminan en cover 30%, 36% y 42%)
- src/index.css:896-916 (reveal-side y reveal-step animan opacity y transform)
- src/index.css:599-603 (comentario: solo transform y opacity; recorridos generosos a propósito)
- src/institutional/components/MilestoneItem.tsx:37-40 (la tarjeta y sus tres hijos)
- src/landing/components/PublicHeader.tsx:47 (único backdrop-blur en la página pública)
- src/index.css:188 (--muted-foreground oklch(47% 0.006 250): 6,8:1 opaco, 1,8:1 al 38%)
- backend/src/cli/seed-demo-content.ts:196-201 (hito de 2000 caracteres, 1952px de alto a 390px de ancho)
- PRODUCT.md:218-221 (el piso de contraste se sostiene)

**Opciones:**

1. **A. Dejarlo como está y seguir vigilando**
   - A favor: Cero trabajo. Se mantiene todo el efecto tal como se aprobó.
   - En contra: No es algo que 'a veces pasa': pasa siempre que uno frena con tarjetas en la mitad de abajo. La página arranca con el primer hito desvaído y las descripciones largas se leen con contraste de entre 1,8:1 y 3:1.
2. **B. Sacar solo el bloque ESCALONADO (index.css:667-685), como dice PENDIENTES**
   - A favor: Son 19 líneas menos. El texto deja de multiplicar dos transparencias: la descripción de la tarjeta al 62% pasa del 38% al 77%. Salen tres capas por tarjeta, así que si lo del texto finito en Windows viene de ClearType, lo más probable es que se vaya.
   - En contra: No arregla la raíz: la tarjeta sigue terminando en 'cover 40%', la mitad de abajo sigue semitransparente cuando uno frena y la tarjeta larga en el celular sigue al 77% mientras se lee su principio.
3. **C. Sacar el ESCALONADO y hacer que la tarjeta termine de entrar a una distancia fija y más corta, por ejemplo 'animation-range: cover 0% cover 25vh' en '.timeline-item .reveal-up'**
   - A favor: Todo el texto queda opaco apenas la tarjeta sube un cuarto de pantalla (con su borde de arriba al 75%), sea corta o de 2000 caracteres. Se queda lo que más se nota: la entrada desde el costado, el punto que se enciende y la punta de la barra. Son pocas líneas.
   - En contra: La entrada es más rápida y un poco menos vistosa (el comentario de index.css:602-603 cuenta que con rangos cortos casi no se notaba). Hay que actualizar ese comentario y el de MilestoneItem.tsx:35-36, confirmar que Chrome acepta el largo fijo en el rango y mirarlo con captura en Windows y en el celular. El número exacto, entre 20 y 30vh, se ajusta a ojo.

**Recomendación.** C. En una página de historia lo principal es poder leer, y el dueño prefiere lo convencional. Una animación de entrada está bien siempre que no deje texto a medio aparecer justo donde uno frena. C conserva la vida de la página y saca lo único que multiplica transparencias. Además, la distancia fija es lo único que arregla las tarjetas largas: B resuelve solo la mitad. Si después de verlo se siente demasiado rápido, conviene estirar el número (hasta unos 35vh) antes que volver a los porcentajes.

### Anotar en DESIGN.md la excepción de los círculos (punto y punta)

*Decisión · sigue vigente · esfuerzo: minutos · impacto para el usuario: bajo*

**Estado actual.** Sigue vigente: DESIGN.md no dice nada de estos círculos. Hay dos nuevos con 'border-radius: 9999px': el anillo gris del punto (index.css:632) y la punta de la barra (index.css:709). El punto en sí ya era circular desde antes, con rounded-full (MilestoneItem.tsx:30 y 32). DESIGN.md:336 dice 'Nada es circular salvo los avatares.' La excepción de los 2px está en DESIGN.md:338-342 y tiene cinco partes: nombra el valor y el token (rounded-xs), dice para qué se reserva ('marcas chicas de 8 px o menos'), da los ejemplos concretos (el cuadradito de color de categoría y los puntos del carrusel), explica por qué la regla general falla a ese tamaño y pone el límite ('No se usa en nada que tenga texto adentro ni que mida más de 8 px'). Además el 2px figura en la escala del encabezado (DESIGN.md:84, xs: '2px'), y por eso el chequeo no lo marca. El chequeo después de cada edición solo lee 'border-radius:' escrito en CSS (design-system.mjs:25): por eso marca estos dos de index.css y no los rounded-full de Tailwind. Ojo con dos atajos. Si se agrega a la escala un token llamado 'full', el chequeo pasa a aceptar cualquier radio de 99px o más en todo el proyecto, botones píldora incluidos (design-system.mjs:446 y 624). Y cualquier valor en % pasa siempre (design-system.mjs:621), así que cambiar a 50% lo silencia sin documentar nada. El chequeo permite perdonar un valor solo en ciertos archivos, anotando el porqué, como ya se hizo con Inter en .impeccable/config.json.

**Evidencia:**

- src/index.css:627-637 (anillo del punto, border-radius: 9999px en 632)
- src/index.css:701-713 (punta de la barra, border-radius: 9999px en 709)
- src/institutional/components/MilestoneItem.tsx:30 y 32 (el punto ya era rounded-full)
- DESIGN.md:334-336 (escala de radios y 'Nada es circular salvo los avatares')
- DESIGN.md:338-342 (excepción de los 2px)
- DESIGN.md:83-88 (escala 'rounded' del encabezado, con xs: '2px')
- .claude/skills/impeccable/scripts/detector/design-system.mjs:25, 446, 617-626 (qué acepta el chequeo)
- .claude/skills/impeccable/scripts/hook-admin.mjs:694-740 (ignore-value con alcance por archivo)
- .impeccable/config.json (ignoreValues con motivo, como Inter)

**Opciones:**

1. **1. Excepción acotada, con la misma forma que la de los 2px, más un permiso del chequeo solo para src/index.css**
   - A favor: Sigue un modelo que ya funcionó y deja el límite claro. Texto propuesto, abajo del párrafo de los 2px: 'La otra excepción es el círculo (rounded-full), reservado para marcas de posición o de estado, sin texto, de 20 px o menos: el punto de cada hito y la punta de la barra en la línea de tiempo de Historia, y los puntitos de estado. Un punto que marca un lugar sobre una línea solo se lee como punto si es redondo; con cualquier escalón de la escala queda un cuadradito que parece un error. No se usa en nada que tenga texto adentro, ni en botones, chips, tarjetas o campos.' Y el permiso: hooks ignore-value design-system-radius 9999px --file src/index.css, con ese motivo. El chequeo sigue vigilando las píldoras en todo lo demás.
   - En contra: Hay que mantener dos lugares. Y no resuelve que en el código ya hay otros ~20 círculos y píldoras que contradicen la regla (ver hallazgos).
2. **2. El mismo párrafo, pero agregando 'full: 9999px' a la escala del encabezado de DESIGN.md**
   - A favor: Todo queda en un solo lugar y el chequeo lo toma solo.
   - En contra: El chequeo deja de avisar cualquier radio de 99px o más en todo el proyecto, o sea justo las píldoras que la regla quiere frenar.
3. **3. Reescribir la regla general de formas según lo que el código ya usa (avatares, puntos, interruptores y píldoras de estado)**
   - A favor: La regla deja de estar desmentida en unos veinte lugares.
   - En contra: Es una decisión de diseño más grande: las píldoras de badges y filtros también contradicen '8 px para lo chico (chips)'. Pide revisar pantallas y no hace falta para cerrar este punto.

**Recomendación.** La 1. Es el mismo tipo de caso que los 2px (una marca chica donde la regla general da un resultado que parece error) y conviene escribirla igual: valor, para qué, ejemplos, por qué y límite. El permiso acotado a index.css evita que el chequeo se vuelva ciego a las píldoras en el resto. De paso, conviene anotar en el mismo párrafo el resplandor que llevan el punto y la punta (ver hallazgos). Después de tocar DESIGN.md hay que correr /impeccable document, que ya figura como pendiente en la sección 7. La 3 queda como tema aparte.

### Año que avanza en cada tarjeta

*Decisión · sigue vigente · esfuerzo: medio día · impacto para el usuario: bajo*

**Estado actual.** Sigue sin implementar, y no hay de dónde retomarlo. La maqueta de Historia no está en maquetas/ (la carpeta no existe) ni en el zip de respaldo: el zip es del 14/09 y el commit de las animaciones es del 16/09. Hoy el año es texto fijo (MilestoneItem.tsx:38). Del backend: year es un entero entre 1800 y 2100 y la lista viene ordenada por año de menor a mayor, así que siempre contaría para arriba. Hay dos formas de hacerlo. Una es solo con CSS y atada al scroll: registrar una variable entera con @property, animarla desde el año anterior hasta el propio y mostrarla con counter() en un ::after, dejando el año real oculto en la página para lectores de pantalla. La otra es con JS: cuando la tarjeta entra, contar de un año al otro en menos de un segundo, una sola vez. Problemas concretos: el primer hito no tiene año anterior. Dos hitos del mismo año (1995 en el seed) no se mueven. Un salto grande (1800 a 1944 en el seed) pasa 144 números en un tramo corto y parece una tragamonedas. Con la versión atada al scroll aparece lo mismo del punto anterior, pero peor: si uno frena con la tarjeta en la mitad de abajo, en vez de texto desvaído queda un año equivocado en pantalla. Una variable registrada no se anima en la capa del compositor: recalcula y repinta en cada cuadro del scroll, en una página que ya tiene cinco animaciones. Y la fuente del año tendría que tener cifras de ancho fijo para que el número no baile.

**Evidencia:**

- src/institutional/components/MilestoneItem.tsx:38 (el año es texto fijo)
- src/institutional/interfaces/Institutional.ts:1-4 (year: number, ordenado por año ascendente)
- backend/src/institutional/services/history.service.ts:17-23 (order: year ASC)
- backend/src/institutional/dto/create-history-milestone.dto.ts (año entero entre 1800 y 2100)
- backend/src/cli/seed-demo-content.ts:207-238 (dos hitos de 1995, años 1800 y 2100)
- src/index.css:519-526 (por qué se evita IntersectionObserver)
- PRODUCT.md:169-171 y 212-214 (convencional, nunca experimental; el peso es parte del diseño)
- maquetas-respaldo-2026-09-14.zip (no tiene ninguna maqueta de Historia)

**Opciones:**

1. **1. No implementarlo y tacharlo de la lista**
   - A favor: Cero trabajo y cero riesgo. El año, que es el dato central de la tarjeta, siempre se ve bien. La página ya tiene bastante movimiento y queda en línea con 'convencional, nunca experimental'.
   - En contra: Se pierde un detalle simpático que estaba en la maqueta como opcional.
2. **2. Contador por tiempo, una sola vez, cuando la tarjeta entra (con JS)**
   - A favor: Nunca queda un año equivocado más de un instante. Funciona aunque el navegador no soporte animaciones por scroll.
   - En contra: Suma lógica a un componente que hoy solo presenta datos. Usa un IntersectionObserver, justo lo que index.css evita: habría que arrancar mostrando el año final para que lo peor que pase sea 'sin animación'. Hay que resolver reducir movimiento, lectores de pantalla y saltos grandes (con una duración tope). Lleva medio día con pruebas.
3. **3. Contador atado al scroll, solo con CSS (@property + counter)**
   - A favor: Es coherente con el resto de las animaciones de la página y no suma JS.
   - En contra: Si uno frena, puede quedar un año falso en pantalla. Se recalcula en cada cuadro del scroll. El número del ::after no se puede seleccionar y los lectores de pantalla lo leen mal. Es la opción más experimental.

**Recomendación.** La 1. El año es el dato de la tarjeta, no un adorno, y cualquier versión que lo muestre mal aunque sea un momento va en contra de lo que la página tiene que contar. Además, el punto del escalonado demostró que las animaciones atadas al scroll dejan estados a medias justo donde uno frena, y con un número eso es información equivocada. Si igual lo quieren, que sea la 2, nunca la 3. Tacharlo lleva minutos; hacerlo bien, medio día.

### Hallazgos nuevos de este bloque

- DESIGN.md:336 dice 'Nada es circular salvo los avatares', pero en el código hay unos veinte círculos y píldoras que no son avatares: el Badge de shadcn (src/components/ui/badge.tsx:8); los filtros de categoría (src/components/custom/CategoryFilter.tsx:22); los chips de categoría (src/events/components/EventCard.tsx:50, src/events/components/EventPosterCard.tsx:76, src/admin/pages/AdminEventsPage.tsx:100, src/admin/pages/AdminGalleryPage.tsx:102); las píldoras de estado (src/members/layouts/MemberLayout.tsx:48, src/members/pages/AffiliationPage.tsx:52, src/members/components/AffiliationFormCard.tsx:164, src/members/pages/ValidateCredentialPage.tsx:214, 224 y 234, src/members/pages/DoorScannerPage.tsx:149); los puntitos de estado (MemberLayout.tsx:57, src/members/components/CredentialCard.tsx:203, src/notifications/components/NotificationBell.tsx:61); el contador de avisos (NotificationBell.tsx:130); el interruptor (src/notifications/components/CoverageEmailsCard.tsx:66-68); los íconos en círculo (src/landing/components/PublicFooter.tsx:130, src/contact/pages/ContactPage.tsx:64) y la barra de progreso (src/components/ui/progress.tsx:13). Las píldoras de chips y filtros también contradicen '8 px para lo chico (chips)' (DESIGN.md:334-335). El chequeo de diseño no las ve porque solo lee border-radius escrito en CSS, no las clases rounded-full.
- El color de categoría se dibuja distinto en el sitio y en el panel. En el sitio es un cuadradito de 8px con 2px de radio, como pide DESIGN.md:338-340 (src/gallery/components/CategoryMark.tsx:23). En el panel es un círculo de 16px (src/admin/components/CategoryManagerDialog.tsx:136).
- El Resplandor (--shadow-glow) está definido como 'exclusivo de estados hover sobre acciones primarias' (DESIGN.md:316-317). Sin embargo, el punto de cada hito lo lleva siempre, desde antes de esta tanda (src/institutional/components/MilestoneItem.tsx:32), y la punta nueva de la barra también (src/index.css:712). Conviene anotarlo junto con la excepción de los círculos, o sacárselo.
- PENDIENTES.md:7-8 dice que las maquetas nombradas tienen copia en ../maquetas-respaldo-2026-09-14.zip, pero la de las animaciones de Historia, que tenía el 'año que avanza' opcional, no está en el zip (es del 14/09 y el commit de las animaciones es del 16/09) ni en maquetas/. Esa maqueta ya no se puede recuperar para comparar.

## Anexo 4 · 5. Grupos familiares: aviso de sugerencias pendientes

### ¿El backend dice cuántas sugerencias hay sin mandar la lista entera?

*Pedido al backend · sigue vigente · esfuerzo: depende del backend · impacto para el usuario: medio*

**Estado actual.** Lo revisé y no: no hay forma de pedir solo el número. GET /admin/family-groups/suggestions es solo para ADMIN y devuelve la lista completa, sin paginar y sin meta (el backend solo agrega meta cuando la respuesta viene paginada). Para armarla hace dos consultas: trae todos los vínculos entre tutor y chico con los dos perfiles completos, y aparte los ids de todos los que ya están en algún grupo. Después agrupa por tutor en memoria, descarta a los que no son socios o ya tienen grupo y se queda con las sugerencias de 2 personas o más. Para un club de este tamaño es barato (dos consultas y un recorrido), pero lo que viaja es pesado: cada integrante va con su ficha entera. Hay un detalle importante: el backend ya tiene un endpoint pensado justo para los números del menú, GET /admin/pending-work. Cuenta cuatro cosas: solicitudes de afiliación, comprobantes por revisar, propuestas de grupo que mandan los socios y precios sin cargar. Las sugerencias no están, y es a propósito: la especificación enumera esas cuatro y ninguna más. El frontend todavía no usa ese endpoint en ningún lado. Además, contar las sugerencias tal como están hoy da un número inflado. Si un chico tiene a la mamá y al papá como tutores y los dos son socios, salen dos sugerencias para la misma familia. También se sugieren familias sin ningún jugador, que no tienen descuento. Y no hay forma de descartar una sugerencia: solo desaparece cuando se confirma.

**Evidencia:**

- backend/src/members/controllers/admin-family-groups.controller.ts:66-67 (@Auth(UserRoles.ADMIN) en todo el controlador)
- backend/src/members/controllers/admin-family-groups.controller.ts:154-174 (GET suggestions devuelve un arreglo, sin paginar)
- backend/src/common/interceptors/response.interceptor.ts:37-44 y 90-96 (meta solo si la respuesta es PaginatedResult)
- backend/src/members/services/family-groups.service.ts:560-564 (trae TODOS los vínculos con los dos perfiles, sin filtro)
- backend/src/members/services/family-groups.service.ts:573-581 (ids de todos los que ya tienen grupo)
- backend/src/members/services/family-groups.service.ts:583-594 (una sugerencia por tutor: dos tutores socios del mismo chico dan dos sugerencias)
- backend/src/members/services/family-groups.service.ts:613 y 629-632 (filtra por cantidad de integrantes, no por jugadores)
- backend/src/dashboard/admin-pending-work.controller.ts:10-35 (endpoint de los números del menú, ADMIN y tesorería)
- backend/src/dashboard/pending-work.service.ts:58-84 y 140-144 (cuenta las propuestas PENDING, no las sugerencias)
- backend/src/dashboard/dto/pending-work-response.dto.ts:13-39 (cuatro contadores, ninguno de sugerencias)
- backend/nucleo-sistema.md:1003-1010 (tabla de trabajo pendiente: sin sugerencias)
- frontend: buscar pending-work / pendingWork en src da cero resultados

**Opciones:**

1. **No pedir nada al backend y contar la lista que ya se descarga (suggestions.length)**
   - A favor: Cero trabajo en el backend. Si el Resumen y la pantalla de Grupos familiares usan el mismo hook, comparten la caché: el número y la lista nunca se contradicen.
   - En contra: Baja la lista entera para mostrar un número. Para un número que se consulta una vez al entrar al Resumen alcanza; para un número en el menú que se actualiza cada minuto en todas las pantallas, no conviene. Y el número sale inflado por lo de los dos tutores.
2. **Pedir que GET /admin/pending-work agregue un contador de sugerencias (solo para ADMIN), calculado con la misma función suggestions() y su .length**
   - A favor: Sigue el patrón que el backend ya armó para los números del menú: un solo pedido liviano para todos los contadores, que desaparecen solos cuando alguien hace el trabajo y respetan el rol.
   - En contra: Cambia la especificación (la tabla de trabajo pendiente la lista a propósito sin sugerencias). Sin una forma de descartar sugerencias, el número puede no bajar nunca.
3. **Pedir antes que se corrija la cuenta: una sugerencia por familia y no por tutor, que solo sugiera cuando hay al menos dos jugadores (o que se marque aparte) y un botón para descartar**
   - A favor: Un número confiable, que baja cuando el club decide algo. Sirve para cualquier lugar donde se muestre.
   - En contra: Es el pedido más grande, y descartar necesita guardar esa decisión en la base. Es cambiar reglas de negocio, no solo contar.

**Recomendación.** Por ahora no pedir nada: si el aviso va en el Resumen (ver el punto siguiente), alcanza con contar la lista que ya existe, que a esta escala es barata y queda igual a lo que muestra la pantalla. Recién si el dueño quiere el número en el menú conviene pedir el contador en /admin/pending-work, y en ese caso pedir junto la opción 3 (una sugerencia por familia y poder descartar). Si no, el menú va a mostrar un número que no baja y a la semana nadie lo mira.

### Decidir dónde se avisa que hay sugerencias: número en el menú, tarjeta en el Resumen o las dos

*Decisión · sigue vigente · esfuerzo: una hora · impacto para el usuario: medio*

**Estado actual.** Sigue igual: nada avisa. Hoy el menú no puede mostrar números: los ítems solo tienen ruta, texto, ícono y roles, y el sidebar dibuja ícono y texto, nada más. Ningún ítem del menú muestra contadores, ni Solicitudes ni Pagos. Hoy se ven números de pendientes en dos lugares: 1) la tarjeta "Pagos pendientes" del Resumen, que se pinta de ámbar cuando hay más de cero, y 2) el numerito rojo de la campana, que se actualiza cada minuto (es circular, y DESIGN.md dice "nada es circular salvo los avatares"). El Resumen lo ven admin y tesorería, pero las sugerencias son solo de admin: una tarjeta que pida sugerencias a nombre de tesorería recibiría un 403. Hoy el Resumen tiene 5 tarjetas de números en una grilla de 3 columnas, así que la segunda fila queda con un hueco: una sexta tarjeta solo para admin la completa. Aparte, la pantalla de Grupos familiares se traga el error de las sugerencias: si el endpoint falla, la sección no aparece y no avisa nada.

**Evidencia:**

- frontend/src/admin/config/nav.ts:22-30 (AdminNavItem: to, label, icon, allowed, end; ningún campo para un número)
- frontend/src/admin/config/nav.ts:82-87 (Grupos familiares, solo ADMIN)
- frontend/src/admin/config/nav.ts:64-68 (Resumen: ADMIN y ACCOUNTANT)
- frontend/src/admin/components/AdminSidebar.tsx:76-95 (el NavLink dibuja ícono y texto, nada más)
- frontend/src/admin/pages/DashboardPage.tsx:67 (grid sm:grid-cols-2 lg:grid-cols-3 con 5 tarjetas)
- frontend/src/admin/pages/DashboardPage.tsx:80-86 (StatCard "Pagos pendientes" con highlight si hay más de cero: el patrón que ya existe)
- frontend/src/admin/components/StatCard.tsx:5-29 (sin link; highlight pinta borde, fondo e ícono en ámbar)
- frontend/src/notifications/components/NotificationBell.tsx:129-133 (numerito rounded-full bg-destructive, tope 99+)
- frontend/src/notifications/hooks/useNotifications.ts:22 y 33-41 (se actualiza cada 60 s, también con la pestaña en segundo plano)
- frontend/src/admin/hooks/useFamilyGroups.ts:24-30 (useFamilyGroupSuggestions sin parámetro enabled, staleTime 60 s)
- frontend/src/admin/pages/FamilyGroupsPage.tsx:92 y 126 (sin isError: si falla, la sección no aparece)
- frontend/DESIGN.md:334-336 (radio de 8 px para chips; nada circular salvo avatares)
- backend/nucleo-sistema.md:878 y 891 (los estados no se avisan por la campana: viven en el panel, que se mira al entrar)

**Opciones:**

1. **A. Número en "Grupos familiares" del menú lateral**
   - A favor: Se ve desde cualquier pantalla del panel, y es el aviso más convencional. Si se hace bien, sirve de base para poner números también en Solicitudes y Pagos con /admin/pending-work, que el backend ya ofrece.
   - En contra: Hoy el menú no puede mostrar números: hay que agregar un campo en nav.ts, dibujarlo en el sidebar (en escritorio y en el menú del celular) y diseñar un chip de 8 px sobre el panel oscuro. Para no bajar la lista entera cada minuto necesita un contador del backend. Y como las sugerencias no se pueden descartar y el número sale inflado (dos tutores = dos sugerencias), el número puede quedar fijo para siempre y terminar siendo ruido.
2. **B. Tarjeta en el Resumen, solo para admin, que lleve a Grupos familiares**
   - A favor: Copia un patrón que ya existe ("Pagos pendientes"). No necesita nada del backend: cuenta la lista con el mismo hook de la pantalla y comparten la caché. Completa la grilla (6 tarjetas, 3 y 3). Se mira al entrar y no insiste, que es lo que la especificación pide para cosas de este tipo.
   - En contra: Solo la ve quien pasa por el Resumen. Hay que darle al hook un enabled (para que tesorería no pida y reciba un 403) y hacer que la tarjeta sea clickeable, porque StatCard hoy no lo es. No conviene pintarla de ámbar como a los pagos: una sugerencia no es urgente.
3. **C. Las dos: número en el menú y tarjeta en el Resumen**
   - A favor: Máxima visibilidad, y deja listo el menú con números para los otros pendientes.
   - En contra: Suma el esfuerzo y los problemas de A. Dos avisos para algo opcional es mucho, y si el número del menú nunca baja, se aprende a ignorar.

**Recomendación.** B, la tarjeta en el Resumen, solo para admin, con el número y un link a Grupos familiares, sin el ámbar de los pagos. Primero, porque repite lo que ya existe ("Pagos pendientes") y el dueño prefiere lo convencional. Segundo, porque se hace en una hora sin tocar el backend. Tercero, porque las sugerencias no son una tarea obligatoria: no se pueden descartar y hoy el número sale inflado, y un número fijo en el menú se vuelve ruido. El número en el menú conviene dejarlo para cuando el frontend use /admin/pending-work para los cuatro pendientes que el backend ya cuenta (Solicitudes, Pagos, propuestas de grupo y precios). Ahí se suman las sugerencias solo si el backend agrega el contador y la forma de descartar. Aprovechando el cambio, agregarle a la pantalla de Grupos familiares un aviso cuando falla la carga de sugerencias.

### Hallazgos nuevos de este bloque

- El frontend nunca usa GET /admin/pending-work. El backend ya tiene armado y probado el endpoint para los números del menú (solicitudes, comprobantes por revisar, propuestas de grupo y precios sin cargar, filtrados por rol), pero el panel no muestra ninguno. Evidencia: backend/src/dashboard/admin-pending-work.controller.ts:10-35, backend/nucleo-sistema.md:1050 (marcado como hecho); en frontend/src no aparece 'pending-work' en ningún archivo.
- Las propuestas de grupo familiar que mandan los socios no tienen pantalla en el frontend. El backend permite que el socio proponga y cancele (GET members/family-group, POST family-group/proposals y DELETE family-group/proposals/:id) y que el admin revise, apruebe y rechace (GET admin/family-groups/proposals y POST proposals/:id/approve y reject), pero en el frontend ni el socio puede proponer ni el admin tiene dónde revisarlas. Solo existe el ícono del aviso FAMILY_PROPOSAL_RESOLVED. Evidencia: backend/src/members/controllers/members.controller.ts:189-235, backend/src/members/controllers/admin-family-groups.controller.ts:81-131, frontend/src/notifications/lib/notification-meta.ts:68 (el único resultado de 'proposal' en src).
- Los textos del panel de grupos familiares dicen que los cambios valen 'desde el mes que viene', pero el backend los aplica desde ya (la regla por mes se retiró el 2026-08-19/21). El admin lee un dato falso sobre plata. Evidencia: frontend/src/admin/pages/FamilyGroupsPage.tsx:102, 242, 255 y 285; frontend/src/admin/hooks/useFamilyGroups.ts:83 y 99; frontend/src/admin/components/AddGroupMemberDialog.tsx:96-97 y 145 ('cuenta desde' el mes siguiente); frontend/src/admin/actions/family-groups.actions.ts:17-31, 34-43, 106-119 (comentarios y nextMonthKey desactualizados). Contra: backend/src/members/services/family-groups.service.ts:29-32 y 140-145, backend/src/members/controllers/admin-family-groups.controller.ts:241-246 ('El descuento se aplica en el próximo pago que se arme'), backend/nucleo-sistema.md:1662. frontend/ESTADO.md:60-64 describe todavía el problema viejo del backend.
- Al confirmar una sugerencia salen N avisos iguales, y si algo falla a mitad de camino queda un grupo a medio armar. FamilyGroupsPage.tsx:35-42 crea el grupo y después suma de a uno con mutateAsync, y el onSuccess de useAddFamilyGroupMember (useFamilyGroups.ts:81-84) dispara un aviso por integrante: 3 integrantes dan 3 avisos 'Listo...'. Si uno rebota, el grupo queda creado con algunos integrantes, confirm() tira un error que nadie atrapa (el void confirm() de la línea 68) y la sugerencia puede seguir ofreciéndose: un segundo click crea otro grupo con el mismo nombre.
- Grupos familiares dice 'Cobros' en el encabezado, pero en el menú está en 'Padrón', y el comentario de nav.ts explica por qué no va en Cobros. Evidencia: frontend/src/admin/pages/FamilyGroupsPage.tsx:100 contra frontend/src/admin/config/nav.ts:73 y 79-87.

## Anexo 5 · 6. Resumen: gráficos

### ¿Seis gráficos o menos?

*Decisión · sigue vigente · esfuerzo: una hora · impacto para el usuario: medio*

**Estado actual.** Sigue vigente: nadie eligió todavía. DashboardPage.tsx lo dice en su comentario y dibuja los seis en el orden de la maqueta. Al Resumen solo entran Administrador y Tesorería (Admin web rebota a su primera sección). PRODUCT.md no nombra a la 'comisión directiva', así que tomo a esos dos roles como los que le rinden cuentas a la comisión.

LOS SEIS DE HOY
1. Ingresos por mes: columnas de 12 meses apiladas en Membresía / Actividad / Seguro. Responde a '¿cuánta plata entra por mes, de qué concepto, y viene subiendo o bajando?'. Cambia todos los meses.
2. Altas y bajas por mes: las altas hacia arriba (celeste) y las bajas hacia abajo (rojo), 12 meses. Responde a '¿el club gana o pierde socios?'. Ojo: el alta es la fecha de antigüedad cargada, y si reintegran a alguien su baja desaparece del pasado.
3. La deuda, por antigüedad: 4 barras (hasta 1 mes, de 1 a 3, de 3 a 6, más de 6) en cuatro rojos. Responde a '¿cuántos deben la membresía y hace cuánto? ¿a quién llamo primero?'. Muestra cantidad de socios, no montos.
4. Plantel por categoría: 9 barras de Escuelita a Reserva, partidas en actividad al día (celeste) y sin pagar (gris). Responde a '¿tengo chicos para armar cada categoría y pagan la actividad?'.
5. Por dónde entró la plata: una dona de 12 meses con Efectivo / Transferencia / Mercado Pago. Responde a '¿cuánto entra por el portal y cuánto por ventanilla?'. Es la vara de éxito de PRODUCT.md (trámites evitados), pero cambia despacio, y un solo número ('X% entró por el portal', que ya está al pie) cuenta casi todo.
6. Pirámide de edades: mujeres a la izquierda y varones a la derecha, 6 franjas, todo en un solo celeste. Responde a '¿qué edades tienen los socios?'. Es un dato de estructura, que cambia poco en el año, y está incompleto: el sexo es opcional y el padrón importado vino sin él (la maqueta habla de más de un tercio sin dato).

COLORES REPETIDOS CON DISTINTO SIGNIFICADO (modo claro, index.css)
- Ingresos y Medios de pago usan exactamente los mismos tres celestes: el oscuro es 'Membresía' en uno y 'Efectivo' en el otro, el del medio es 'Actividad' y 'Transferencia', y el claro es 'Seguro' y 'Mercado Pago'. Es el choque que marcó la maqueta, y el más grave: dos gráficos de plata, los dos de 12 meses, con la misma leyenda de colores y otras palabras.
- Ese celeste del medio es también 'Actividad al día' en Plantel, 'Altas' en Altas y bajas y los dos lados de la Pirámide: un mismo color en cinco de los seis gráficos. Confunde menos, porque en todos es 'lo principal'.
- El rojo de 'Bajas' es idéntico al de 'De 3 a 6 meses' en Deuda. Los dos significan algo malo, así que molesta poco.
- En modo oscuro 'Actividad al día' queda casi igual a 'Membresía/Efectivo', y 'Altas' casi igual a 'Actividad/Transferencia'.

**Evidencia:**

- src/admin/pages/DashboardPage.tsx:26-37 (la nota: 'Seis es una decisión pendiente')
- src/admin/pages/DashboardPage.tsx:108-117 (los seis en la grilla)
- src/admin/pages/AdminIndex.tsx:8-18 (solo ADMIN y ACCOUNTANT ven el Resumen)
- PRODUCT.md:15-23 (roles) y PRODUCT.md:32-33 (el éxito se mide en trámites evitados)
- src/admin/components/IncomeCard.tsx:17-22 (Membresía/Actividad/Seguro = chart-ramp-1/2/3)
- src/admin/components/PaymentMethodsCard.tsx:23-31 (Efectivo/Transferencia/MP = los mismos chart-ramp-1/2/3)
- src/admin/components/PaymentMethodsCard.tsx:63 (el pie ya dice el % que entró por el portal)
- src/admin/components/MembershipFlowCard.tsx:36-38 y :48-51 (alta = memberSince, reintegro borra la baja; colores joined/left)
- src/admin/components/DebtCard.tsx:19 y :32-35 (cuatro rojos; sin montos)
- src/admin/components/RosterCard.tsx:40-43 (chart-paid / chart-unpaid)
- src/admin/components/AgePyramidCard.tsx:25-35 y :104-110 (un solo color, chart-single)
- src/index.css:240-242, :245, :247, :252-253, :255 (ramp-2 = paid = joined = single = oklch(49% 0.24 235); left = debt-3 = oklch(58% 0.21 25))
- src/index.css:369-380 (modo oscuro: paid 78% casi igual a ramp-1 82%; joined/single 64% casi igual a ramp-2 68%)
- ../maquetas-respaldo-2026-09-14.zip > maquetas/resumen-graficos.html:586-590 (los tres primeros contestan '¿entra la plata?, ¿a quién llamo?, ¿tengo equipo?'; los otros tres 'se sumaron a pedido') y :753-768 ('elegí tres o cuatro')
- DESIGN.md:235-236 (el celeste no pinta más de una décima parte de la pantalla: hoy cinco de los seis gráficos van en celeste)

**Opciones:**

1. **Dejar los seis como están**
   - A favor: No hay que tocar nada y no se pierde ninguna mirada. Cada gráfico tiene su tabla y su leyenda, así que técnicamente se lee bien. No hay que volver atrás con nadie que haya pedido alguno.
   - En contra: Queda sin resolver el choque de colores entre Ingresos y Medios, que fue justamente la advertencia de la maqueta. Es una pantalla larga donde lo que hay que mirar todos los meses (plata, deuda) compite con cosas que cambian una vez por año (edades). Queda abierta la otra decisión pendiente (dona contra barras). Y de a tres se cortan de costado en notebooks (ver el punto de las columnas).
2. **Bajar a cuatro: Ingresos, Altas y bajas, Deuda y Plantel (salen Medios de pago y Pirámide)**
   - A favor: Desaparece el choque de colores serio: los tres celestes quedan solo en Ingresos. Los cuatro cambian mes a mes y llevan a hacer algo concreto (cobrar, llamar, armar categorías, ver si el club crece). Un 2x2 es el tablero más convencional que hay y entra sin scroll de costado desde unos 1290px, así que también arregla el recorte en notebooks. La decisión dona contra barras se cierra sola. Hay menos celeste en pantalla.
   - En contra: Se pierden la vista por medio de pago y la de edades. Los dos endpoints del backend quedan sin usar (el código queda en git por si algún día se arma una sección de estadísticas). Hay que confirmar con quien pidió esos dos gráficos, porque la maqueta dice que se sumaron a pedido.
3. **Bajar a tres: Ingresos, Deuda y Plantel (los tres de base de la maqueta)**
   - A favor: Es la pantalla más corta. Cada gráfico contesta una pregunta distinta ('¿entra la plata?', '¿a quién llamo?', '¿tengo equipo?'). En pantallas grandes queda una sola fila de tres, alineada con los números de arriba.
   - En contra: Se pierde Altas y bajas, que es el único gráfico que muestra si el club crece o se achica, algo que la comisión seguro pregunta. En fila de tres el corte de costado entre 1536 y 1770px sigue igual y habría que arreglarlo aparte. Se descartan los tres gráficos que se habían pedido.

**Recomendación.** Bajar a cuatro: Ingresos, Altas y bajas, Deuda y Plantel. Son los cuatro que cambian mes a mes y llevan a una acción. Saca justo el gráfico que repite los colores de Ingresos con otro significado y el que cambia una vez por año con datos incompletos. Deja un 2x2 convencional que entra sin cortes en notebooks y, de paso, cierra la decisión de la dona. Antes de sacar nada, confirmar con quien pidió Medios de pago y Pirámide. Si el porcentaje que entra por el portal importa (es la vara de PRODUCT.md), conviene mostrarlo como número en la fila de tarjetas de arriba, que hoy tiene cinco y deja un hueco, y no como gráfico.

### Columnas de los meses (12 meses en 460px)

*Prueba a mano · sigue vigente · esfuerzo: una hora · impacto para el usuario: medio*

**Estado actual.** Sigue vigente, y el problema de fondo es otro. A 460px la cuenta del pendiente es correcta: quedan 388px útiles para 12 meses, o sea unos 32px por mes, con columnas de 24px y 8px de aire. El rótulo 'ene 26' mide unos 34px, pero sus vecinos ('dic', 'feb') son cortos y queda un margen de ~5px, así que no se pisan. Esa parte alcanza con mirarla.

Lo que no está anotado: esos 460px casi nunca se dan. Cada gráfico tiene un ancho mínimo de 416px y, si no entra, la tarjeta lo scrollea de costado. Con el menú lateral de 256px, 32px de margen por lado, 20px entre tarjetas y 24px de relleno, de a tres (desde 1536px de ancho) el espacio adentro de cada tarjeta es de unos 340px a 1536, 360px a 1600 y 385-390px a 1680. Resultado: cinco de los seis gráficos quedan cortados a la derecha, y para ver el mes en curso (el único que tiene el número escrito) hay que scrollear dentro de la tarjeta. Recién cerca de 1770px entra sin scroll, y los 460px completos se ven desde ~1900. 1536px es lo que muestra una notebook de 1920x1080 con la escala de Windows al 125%, un caso muy común.

Entre 1024 y 1279px, donde van de a dos, cinco tarjetas con ancho mínimo (Ingresos, Altas y bajas, Deuda, Plantel y Pirámide; Medios de pago es una dona y no scrollea) también scrollean unos 130px. El comentario de DashboardPage solo contempla las dos de meses. A 1280px (1080p al 150%) faltarían 3-4px si Windows muestra la barra de scroll, y aparecería una barrita igual. Son cuentas sobre el CSS: hay que confirmarlas en el navegador.

**Evidencia:**

- src/admin/components/IncomeCard.tsx:24-27 y :58-60 (W=460, márgenes 56+16: 388px / 12 meses)
- src/admin/components/IncomeCard.tsx:72 (className 'max-w-[460px] min-w-[26rem]'; igual en MembershipFlowCard.tsx:90, DebtCard.tsx:76, RosterCard.tsx:65, AgePyramidCard.tsx:75)
- src/admin/components/StatsCard.tsx:43 (relleno p-5 sm:p-6) y :92 (overflow-x-auto: scrollea en vez de achicar)
- src/admin/pages/DashboardPage.tsx:102-108 (grid lg:grid-cols-2 2xl:grid-cols-3 y el comentario que solo habla de las de meses)
- src/components/custom/PanelShell.tsx:69 (menú de 16rem) y :122 (sm:px-8)
- node_modules/tailwindcss/theme.css:331 (2xl = 96rem = 1536px, sin override en index.css)
- src/admin/lib/dashboard-stats.spec.ts:49 (el rótulo de enero es 'ene 26')

**Opciones:**

1. **Con cuatro gráficos: 2x2 desde 1280px y uno por fila más abajo**
   - A favor: El problema desaparece: sin cortes desde unos 1290px y con el gráfico a su tamaño natural. No hay que inventar un corte especial de pantalla.
   - En contra: Depende de elegir cuatro gráficos. Entre 1280 y 1290px puede quedar la barrita de 3px, que se arregla bajando el mínimo a 25rem.
2. **Con seis gráficos: de a tres recién desde ~1800px y de a dos por debajo**
   - A favor: Ningún gráfico queda cortado en las notebooks comunes (1536, 1600, 1680).
   - En contra: Entre 1536 y 1800px la pantalla queda más larga (tres filas de a dos) y los gráficos ya no se alinean con las tarjetas de números. Hace falta un corte de pantalla propio en vez de los de Tailwind.
3. **Bajar el ancho mínimo del gráfico para que se achique en vez de scrollear**
   - A favor: Siguen de a tres en todas las pantallas grandes y no hay scroll.
   - En contra: A 1536px el gráfico quedaría en ~340px: las letras de 11px se verían de ~8px y cada mes tendría ~24px. Ahí sí queda apretado de verdad, justo lo que el pendiente quería evitar.

**Recomendación.** Primero confirmarlo en el navegador a 1280, 1536, 1600 y 1920px, con el panel claro y oscuro. Después resolverlo junto con la decisión de cuántos gráficos: con cuatro, la primera opción; con seis, la segunda. La tercera no conviene, porque cambia un scroll por un gráfico que no se lee. Los rótulos de los meses a 460px están bien y no hace falta tocarlos.

### Categorías vacías ('sin jugadores') en Plantel por categoría

*Prueba a mano · sigue vigente · esfuerzo: minutos · impacto para el usuario: bajo*

**Estado actual.** Está como dice el pendiente, y está bien así. Desde el commit e96b654 el pie de 'Plantel por categoría' ya no cuenta las categorías vacías: solo dice 'N jugadores, M al día.' y, si hay, 'K sin categoría.'. El gráfico dibuja cada categoría vacía con su nombre y el texto gris 'sin jugadores' donde iría la barra. Mostrar las vacías fue una decisión con motivo, escrita en el código y en la maqueta (punto 4): una categoría sin nadie es el dato, porque no hay plantel para armarla. Con el padrón de ese momento eran tres: novena, sexta y reserva. Lo único que quedó colgado es 'emptyCategories': se sigue calculando pero ninguna pantalla lo usa, solo su test. No hace falta decidir nada. Alcanza con mirarlo con datos reales, para ver si tres o más renglones 'sin jugadores' seguidos se leen como un dato o parecen un error de carga.

**Evidencia:**

- src/admin/components/RosterCard.tsx:22-27 (la decisión: 'una categoría sin nadie ES el dato')
- src/admin/components/RosterCard.tsx:44-51 (el pie actual, sin el conteo de vacías)
- src/admin/components/RosterCard.tsx:86-90 (el texto 'sin jugadores' en gris de 11px)
- src/admin/lib/dashboard-stats.ts:205-211 (ordena sin sacar ninguna categoría)
- src/admin/lib/dashboard-stats.ts:235 (emptyCategories: se calcula y no se usa en pantalla)
- src/admin/lib/dashboard-stats.spec.ts:103 (el único uso de emptyCategories)
- git show e96b654 (se borró 'N categorías sin nadie' del texto)
- ../maquetas-respaldo-2026-09-14.zip > maquetas/resumen-graficos.html:728-733 (punto 4 de la maqueta)

**Opciones:**

1. **Dejarlo así y borrar emptyCategories (con su línea de test)**
   - A favor: El nombre de cada categoría vacía ya se ve en el gráfico, y el conteo del pie lo repetía. Se va código que no usa nadie.
   - En contra: Si muchas categorías quedan vacías, la tarjeta puede verse medio despoblada. Pero eso también es el dato.
2. **Volver a contarlas en el pie ('3 categorías sin nadie')**
   - A favor: El dato queda en palabras para quien lee el texto y no el gráfico.
   - En contra: Repite lo que el gráfico ya nombra y alarga un pie que se acortó a propósito. La tabla gemela ya muestra las filas en cero.
3. **Esconder las categorías vacías**
   - A favor: El gráfico queda más corto.
   - En contra: Esconde justo lo que hay que resolver (categorías sin plantel) y contradice la decisión documentada en el código y en la maqueta.

**Recomendación.** La primera opción: dejarlo como está, mirarlo una vez con el padrón real y borrar 'emptyCategories' si nadie lo va a usar. Esto no necesita una decisión del dueño, porque ya se tomó y con buen motivo. Si al final se sacara Plantel del Resumen, el punto desaparece.

### Hallazgos nuevos de este bloque

- Gráficos cortados de costado en notebooks: entre 1536 y ~1770px de ancho (por ejemplo, 1920x1080 con la escala de Windows al 125%), cinco de los seis gráficos no entran en su tarjeta de a tres y scrollean adentro, lo que esconde el mes en curso. Entre 1024 y 1279px pasa lo mismo con las cinco tarjetas con ancho mínimo (todas menos Medios de pago, que es una dona). La causa es el mínimo de 26rem del SVG (src/admin/components/IncomeCard.tsx:72 y sus gemelos) contra la grilla de src/admin/pages/DashboardPage.tsx:108. El pendiente solo habla de rótulos apretados a 460px. Son cuentas sobre el CSS: falta confirmarlo en el navegador.
- Decisión sin anotar en PENDIENTES.md: dona contra barras con rótulos en 'Por dónde entró la plata' (src/admin/components/PaymentMethodsCard.tsx:42-45, punto 6 de la maqueta). Si el gráfico se queda en el Resumen, falta decidirla; si sale, desaparece.
- Tarjetas de números del Resumen: 'Socios totales' dice 'N con la cuota al día' y 'Socios activos' dice 'Cuota vigente' (src/admin/pages/DashboardPage.tsx:72 y :78), pero el número cuenta solo la membresía vigente (backend/src/dashboard/admin-dashboard.service.ts:72-74). PRODUCT.md:77-92 y :125-128 piden no usar 'cuota' ni 'al día' para una sola de las tres coberturas. Además el mismo número aparece dos veces, en dos tarjetas pegadas.
- Comentario huérfano en src/admin/components/DebtCard.tsx:28 (/** "5 ya pasaron", "1 ya pasó". */): quedó de la función pastThresholdText, que se borró en e96b654, y ahora está pegado arriba del comentario del componente sin explicar nada.
- Pedido al backend sin anotar: /admin/stats/roster-by-category y /admin/stats/payment-methods devuelven solo el enum, así que el front copia a mano los rótulos de categorías y medios de pago del backend (src/admin/lib/dashboard-stats.ts:28-60). El propio comentario dice que es una excepción a retirar cuando el endpoint traiga el rótulo.

## Anexo 6 · Sección 1, "Quedó afuera" (toaster) + Sección 7, "Limpieza y mantenimiento"

### Íconos en ámbar sobre fondo claro: pasarlos a text-warning-strong

*Tarea · sigue vigente · esfuerzo: minutos · impacto para el usuario: medio*

**Estado actual.** Sigue pendiente, y la lista de PENDIENTES.md se queda corta: nombra 4 archivos, pero hay 18 íconos en 13 archivos. Hoy dan entre 2.4:1 y 2.75:1 según el fondo, y con text-warning-strong quedan entre 3.2:1 y 3.74:1. Todos pasan el 3:1 que pide un ícono. Es un cambio seguro en los dos modos: en los paneles oscuros --warning-strong vale lo mismo que --warning (index.css:353), así que ahí no cambia nada. El sitio público, el login, /pagos y /validar son siempre claros (theme.store.ts:11-13). Ningún uso cae sobre una superficie que sea oscura siempre, como el menú lateral o la banda superior. Contrastes calculados con la misma fórmula que da los 2.75/3.74 documentados: sobre blanco 2.75 → 3.74; sobre el fondo de página (98%) 2.60 → 3.53; sobre bg-warning/5 2.63 → 3.57; sobre bg-warning/10 2.37-2.51 → 3.23-3.41.

**Evidencia:**

- src/auth/pages/reset-password/ResetPasswordPage.tsx:59: ícono grande sobre el fondo claro del AuthLayout
- src/auth/pages/login/LoginPage.tsx:57: ícono dentro del aviso bg-warning/10
- src/payments/pages/PaymentReturnPage.tsx:88 y :177: íconos sobre una tarjeta blanca (Shell, líneas 38-39)
- src/payments/pages/MyPaymentsPage.tsx:87, :129 y :154: íconos dentro de avisos bg-warning/10
- src/admin/pages/CounterPage.tsx:125 y :252: íconos dentro de avisos bg-warning/10
- src/admin/pages/VerifyReceiptPage.tsx:144: ícono Ban sobre bg-warning/10
- src/members/pages/AcceptGuardianInvitationPage.tsx:64 y :107: íconos sobre tarjeta blanca
- src/members/pages/ProfilePage.tsx:83 y src/members/pages/WardDetailPage.tsx:242: íconos Lock sobre bg-warning/10
- src/admin/components/MemberAffiliationForm.tsx:32: ícono Clock sobre bg-warning/10
- src/admin/components/BulkImportDialog.tsx:416: ícono X sobre bg-warning/10
- src/admin/components/StatCard.tsx:24: ícono de la tarjeta resaltada (bg-warning/5)
- src/members/pages/ValidateCredentialPage.tsx:49: contenedor del ícono del aviso (pantalla pública, siempre clara)
- NO SON CANDIDATOS (rellenos y bordes): components/ui/badge.tsx:16 (bg-warning con texto en tinta, que usan CounterPage:205, PaymentStatusBadge, RoleBadges y StaffStatusBadge); todos los border-warning/40 y bg-warning/5·10·15 (LoginPage:56, MyPaymentsPage:86/128/153, CounterPage:123/250/394, CloseAccountCard:101, VerifyReceiptPage:143, BulkImportDialog:414, ProfilePage:81, WardDetailPage:241, ValidateCredentialPage:45, MemberAffiliationForm:26, StatCard:19); CredentialCard.tsx:36 (chip con texto en tinta y punto bg-warning, ya resuelto a propósito); index.css:120 (el toaster ya usa --warning-strong)
- src/index.css:209 (--warning-strong claro) y :353 (en .dark es igual a --warning)

**Opciones:**

1. **Cambiar text-warning por text-warning-strong en los 18 íconos**
   - A favor: Es mecánico, pasa el 3:1 en todos los fondos y no cambia nada en modo oscuro.
   - En contra: Ninguno relevante. El ámbar se ve apenas más oscuro sobre claro.
2. **Dejarlos como están**
   - A favor: Cero trabajo.
   - En contra: Quedan 18 íconos debajo del mínimo, justo lo que el token nuevo vino a arreglar.

**Recomendación.** Hacerlo, en el mismo commit que la decisión sobre los textos del ítem siguiente. No hay nada que elegir: el token existe exactamente para esto y es neutro en modo oscuro.

### Textos en ámbar sobre claro: text-warning-strong no alcanza para texto chico

*Decisión · sigue vigente · esfuerzo: una hora · impacto para el usuario: medio*

**Estado actual.** Hay 6 textos (no íconos) pintados en ámbar. Un texto chico necesita 4.5:1, y --warning-strong da 3.74:1 sobre blanco y 3.25:1 sobre bg-warning/15. Pasarlos a strong mejora pero no cumple, aunque el comentario del token (index.css:206-207) dice que es "para íconos y texto sobre claro". Ninguno llega a "texto grande": FeesPage usa 18px en negrita, y el umbral es 18.66px en negrita. El repo ya tiene un antecedente para resolverlo: la credencial deja el ámbar en el punto y el fondo, y el texto en tinta (CredentialCard.tsx:26-36).

**Evidencia:**

- src/admin/pages/FeesPage.tsx:32: "Sin cargar" en text-lg bold sobre tarjeta blanca; el ícono hereda el color. Da 2.75 hoy y 3.74 con strong
- src/admin/pages/PaymentsPage.tsx:299: "(anulado)" en 14px, dentro de un link text-brand
- src/admin/components/MemberPayments.tsx:120: "(anulado)" en 14px
- src/admin/pages/UndeliverablePage.tsx:31: "Sin destinatario" en 12px semibold con ícono; su par "No salió" en text-destructive da 4.76
- src/admin/components/BulkImportDialog.tsx:119: número de línea "L12" en 12px bold; el color es lo único que distingue un aviso de un error
- src/members/pages/ValidateCredentialPage.tsx:250: "vence en N día(s)" en 14px semibold sobre bg-warning/15. Da 2.39 hoy y 3.25 con strong
- src/members/components/CredentialCard.tsx:29-36: antecedente de texto en tinta con el ámbar solo en el punto
- Cálculo propio: un ámbar de oklch(55% 0.11 70) daría 4.97:1 sobre blanco y 4.52:1 sobre bg-warning/10

**Opciones:**

1. **Pasar también los textos a text-warning-strong**
   - A favor: Es el mismo cambio mecánico que en los íconos y ya mejora de 2.75 a 3.74.
   - En contra: Los textos siguen debajo del 4.5:1 de AA, y el comentario del token promete algo que no cumple.
2. **El ámbar marca y la tinta dice: ícono o punto en text-warning-strong, texto en text-ink o text-foreground**
   - A favor: Pasa AA de sobra, no suma tokens, respeta "Neutro sin croma" y copia lo que ya hace la credencial.
   - En contra: En "(anulado)" y "L12" no hay ícono: el color se pierde, salvo que se agregue un puntito. El par de UndeliverablePage queda asimétrico si "No salió" sigue en rojo.
3. **Crear un tercer ámbar solo para texto (alrededor de oklch(55% 0.11 70))**
   - A favor: Conserva el color en la palabra y pasa AA.
   - En contra: Un token más que documentar en DESIGN.md, y a esa luz el ámbar tira a marrón/ocre.

**Recomendación.** La opción 2. Es la más convencional, ya tiene antecedente en el propio código y no suma tokens. En los dos "(anulado)" alcanza con text-muted-foreground, porque la palabra sola ya dice el estado. De paso conviene corregir el comentario de index.css:206-207 para que diga "íconos y marcas" y no "texto".

### Los otros tres límites del toaster (alt+T con modal, click con menú abierto, texto no seleccionable)

*Prueba a mano · sigue vigente · esfuerzo: minutos · impacto para el usuario: bajo*

**Estado actual.** Los tres siguen como los describe PENDIENTES.md. El texto no se puede seleccionar por el onMouseDown que evita mover el foco (AppToaster.tsx:57, explicado en :39-46). La guarda contra "click afuera" existe solo en dialog.tsx; dropdown-menu.tsx y select.tsx no la tienen. Con un menú o un select abierto, un click en el toast cuenta como click afuera y el menú se cierra: molesta, pero no se pierde nada de lo cargado. Lo de alt+T con modal pasa porque el diálogo retiene el foco; igual los avisos se anuncian solos al lector de pantalla.

**Evidencia:**

- src/components/custom/AppToaster.tsx:57: onMouseDown con preventDefault
- src/components/ui/dialog.tsx:47-68: guarda onPointerDownOutside para [data-sonner-toaster]
- src/components/ui/ no tiene la guarda en dropdown-menu.tsx ni en select.tsx (solo dialog.tsx usa PointerDownOutside)
- src/index.css:55-66: pointer-events: auto en el toaster

**Opciones:**

1. **Aceptarlos como están y sacarlos de la lista**
   - A favor: Ya son costos conocidos y chicos; nada se rompe ni se pierde.
   - En contra: El caso del menú abierto sigue sin medirse.
2. **Probar el caso del select abierto y, si molesta, copiar la guarda de dialog.tsx en select.tsx y dropdown-menu.tsx**
   - A favor: Queda cerrado con evidencia.
   - En contra: Toca dos componentes de shadcn por un caso raro.

**Recomendación.** Aceptar los tres. Si alguna vez se prueba el del select (dos minutos en el navegador) y resulta molesto, recién ahí replicar la guarda. No vale la pena tocar shadcn por adelantado.

### Borrar el worktree viejo nervous-goldstine-c48acd: tiene un arreglo que no está en main

*Decisión · sigue vigente · esfuerzo: una hora · impacto para el usuario: medio*

**Estado actual.** No tiene cambios sin commitear: git status sale vacío y lo único ignorado es node_modules. Pero tiene un commit que NO está en main. HEAD está suelto (detached) en 3546afe, que también es la punta de la rama claude/nervous-goldstine-c48acd. El commit es "la hora en texto libre ya no se muestra como 'De 10 a 18 hs hs'" y agrega src/events/lib/event-time.ts con 44 líneas de tests. git cherry lo marca como no aplicado en main, y git merge-tree confirma que entra sin conflictos. El bug sigue vivo en main y ahora en 5 lugares, no en 3: dos pantallas nuevas (EventRow y NextEventBand) también pegan " hs". El seed del backend trae justo ese caso. `git worktree remove` no borra la rama, pero si también se borra la rama (o lo hace la limpieza automática de worktrees), el arreglo queda solo en el reflog, que después se purga. El item dice que "hacía fallar pnpm lint": ya no, eslint.config.js:10-12 ignora .claude/**.

**Evidencia:**

- git -C .claude/worktrees/nervous-goldstine-c48acd status → vacío (solo node_modules ignorado)
- git log main..HEAD → 3546afe la hora en texto libre ya no se muestra como "De 10 a 18 hs hs"
- git branch --contains 3546afe → claude/nervous-goldstine-c48acd (no main)
- git merge-tree --write-tree main claude/nervous-goldstine-c48acd → sale con código 0, sin conflictos
- src/events/components/EventCard.tsx:72, src/events/components/EventPosterCard.tsx:35, src/events/components/EventRow.tsx:48, src/events/components/NextEventBand.tsx:34, src/admin/pages/AdminEventsPage.tsx:84: " hs" pegado a la hora cruda
- backend/src/cli/seed-demo-content.ts:438: time: 'De 10 a 18 hs'
- eslint.config.js:10-12: globalIgnores(['dist', '.claude/**'])

**Opciones:**

1. **Rescatar primero: cherry-pick de 3546afe a main, extender formatEventTime a EventRow.tsx y NextEventBand.tsx, y después borrar el worktree y la rama**
   - A favor: Arregla un bug que hoy se ve en la agenda con los datos de prueba ("De 10 a 18 hs hs") y trae sus tests. El cherry-pick entra limpio.
   - En contra: Alrededor de una hora contando las dos pantallas nuevas y correr los tests.
2. **Borrar el worktree y la rama sin rescatar nada**
   - A favor: Dos comandos y listo.
   - En contra: Se pierde un arreglo ya hecho y testeado, y el bug queda en 5 pantallas.
3. **Borrar solo la carpeta (git worktree remove) y dejar la rama viva para más adelante**
   - A favor: Libera la carpeta sin perder el commit.
   - En contra: Queda una rama suelta que nadie va a recordar, y una limpieza automática se la puede llevar.

**Recomendación.** La opción 1. El arreglo es chico, entra sin conflictos y corrige algo visible para el público. Borrar sin rescatar tira trabajo bueno. Ojo: el cherry-pick solo cubre 3 de los 5 lugares, así que hay que sumar EventRow y NextEventBand en el mismo commit.

### Borrar el zip maquetas-respaldo-2026-09-14: todavía hay cosas que lo citan

*Decisión · sigue vigente · esfuerzo: minutos · impacto para el usuario: bajo*

**Estado actual.** El zip existe (62.587.920 bytes, del 14/09 14:33) y la carpeta maquetas/ ya no. Tres lugares lo nombran: un comentario de código (index.css:46-47) y PENDIENTES.md (:8 y :151). Además hay comentarios que apuntan a maquetas que ahora solo existen dentro del zip. La afirmación "no queda nada ahí que haga falta" no es del todo cierta: las decisiones abiertas de la sección 6 (¿seis gráficos?, ¿dona o barras?) se apoyan en maquetas/resumen-graficos.html, y el estado vacío de la galería (sección 3) solo quedó en las capturas del zip. Lo que sí está cumplido es el pedido al backend que venía en el zip (pedido-backend-estadisticas.md): los seis endpoints de estadísticas y el order=asc|desc de eventos ya existen. Aparte: en el zip no hay ninguna maqueta de las animaciones de Historia (sección 4). El único archivo de institucional es opciones.html, del 14/09 10:25, anterior al commit de las animaciones.

**Evidencia:**

- src/index.css:46-47: "la maqueta está en maquetas-respaldo-2026-09-14.zip, maquetas/toaster/sonner-adaptado.html"
- PENDIENTES.md:8 y :151
- src/components/custom/AppToaster.tsx:17: "medido en maquetas/toaster"
- src/index.css:227-228: "maqueta resumen-graficos.html"
- src/admin/pages/DashboardPage.tsx:33-36 y src/admin/components/PaymentMethodsCard.tsx:42: decisiones pendientes apoyadas en "la maqueta"
- zip: maquetas\resumen-graficos.html, maquetas\galeria\capturas\catalogo-album-vacio-1440.png / -390.png, maquetas\toaster\sonner-adaptado.html
- backend/src/dashboard/admin-stats.controller.ts:34-60 y backend/src/events/dto/events-query.dto.ts (order asc|desc): el pedido del zip ya está implementado

**Opciones:**

1. **Borrarlo ya y reescribir el comentario de index.css:46-47 para que no apunte al zip**
   - A favor: Libera 60 MB y cierra el item.
   - En contra: Se pierde la maqueta de gráficos que fundamenta dos decisiones abiertas y las capturas del estado vacío de la galería.
2. **Sacar primero lo poco que sirve (resumen-graficos.html, las capturas de galería vacía y sonner-adaptado.html) a maquetas/, que está en .gitignore, borrar el zip y corregir el comentario**
   - A favor: Libera casi todo y no pierde nada que las secciones 3 y 6 necesiten.
   - En contra: Unos 15 minutos.
3. **No tocarlo hasta cerrar las secciones 3 y 6**
   - A favor: Nada que hacer hoy.
   - En contra: El item queda abierto y el comentario de index.css sigue apuntando a un archivo que solo existe en esta PC.

**Recomendación.** La opción 2. Cierra la limpieza sin tirar la maqueta que respalda las decisiones de gráficos todavía pendientes. En cualquier caso conviene que el comentario de index.css:46-47 diga la conclusión y no la ruta a un zip local, porque en otra PC o en otro clon ese archivo no existe.

### hover:shadow-glow del botón hero no hace nada: la causa no es el orden

*Tarea · sigue vigente · esfuerzo: minutos · impacto para el usuario: bajo*

**Estado actual.** Confirmado, pero el diagnóstico de PENDIENTES.md está mal. No es que .shadow-club le gane por orden: la regla hover:shadow-glow directamente no se genera. .shadow-club, .shadow-glow y .shadow-soft están escritas como clases sueltas dentro de @layer utilities, y Tailwind v4 no les aplica variantes (hover:, md:, etc.). Además --shadow-glow no está en @theme, así que el shadow-* de Tailwind tampoco la reconoce. Si la regla existiera, ganaría igual por especificidad (:hover suma). Lo verifiqué de dos formas. En el CSS compilado (dist/assets/index-4kMKQ2kP.css) no hay ninguna regla hover:shadow. Y compilando index.css en memoria con el @tailwindcss/node 4.3.2 del proyecto: hover:shadow-glow y hover:shadow-club no generan nada; convirtiendo las tres clases a @utility, las dos pasan a generarse bien. El mismo bug apaga el hover de las tarjetas de eventos (hover:shadow-club), que no figura en PENDIENTES. Viene del commit inicial (f3c810a, 17/07). El propio index.css ya explica la regla en :827 ("@utility y no una clase en @layer utilities porque se aplica con md:").

**Evidencia:**

- src/components/ui/button.tsx:13: hero: 'bg-gradient-cyan text-secondary-foreground hover:shadow-glow shadow-club'
- src/index.css:494: @layer utilities { … } y :717-727: .shadow-club / .shadow-glow / .shadow-soft como clases sueltas
- src/index.css:827-835: comentario y ejemplo de @utility bg-scrim-portada
- src/events/components/EventCard.tsx:15 y src/events/components/EventPosterCard.tsx:40: hover:shadow-club con transition-shadow, que hoy no hace nada
- dist/assets/index-4kMKQ2kP.css: cero reglas hover\:shadow
- Compilación en memoria: 'hover:shadow-glow' → nada; 'hover:shadow-(--shadow-glow)' → genera; con @utility shadow-glow → genera '.hover\:shadow-glow:hover { box-shadow: var(--shadow-glow) }'
- DESIGN.md:361-362: "Hero: … sombra Club; en hover suma el Resplandor"

**Opciones:**

1. **En index.css:717-727, reemplazar las tres clases por @utility shadow-club / shadow-glow / shadow-soft, fuera de la capa, como bg-scrim-portada**
   - A favor: Arregla la causa: vuelven a andar el hero y las dos tarjetas de eventos sin tocar ningún .tsx, y cualquier variante futura (md:shadow-soft, etc.) funciona.
   - En contra: Toca CSS global; conviene mirar un par de pantallas después.
2. **Cambiar solo los tres usos a valor arbitrario: hover:shadow-(--shadow-glow) en button.tsx y hover:shadow-(--shadow-club) en las dos tarjetas**
   - A favor: Tres líneas, sin tocar index.css.
   - En contra: La trampa queda armada: el próximo hover:shadow-soft falla igual, en silencio.
3. **Sacar el hover:shadow-glow de la variante y documentar que el hero no brilla**
   - A favor: Cero riesgo visual.
   - En contra: Contradice DESIGN.md:361, que lo pide explícitamente.

**Recomendación.** La opción 1, es el arreglo mínimo que ataca la causa. Actualizar el comentario de :827 y corregir el item de PENDIENTES (no es "por orden"). Al arreglarlo va a haber un cambio visible: los ~40 botones hero brillan en hover y las tarjetas de eventos se elevan. Conviene mirarlo en el navegador. Detalle: con el arreglo, el resplandor REEMPLAZA a la sombra Club (igual que el snippet de .impeccable/design.json). Si "suma" en DESIGN.md quiere decir las dos juntas, habría que usar hover:shadow-[var(--shadow-club),var(--shadow-glow)].

### Correr /impeccable document: el sidecar design.json quedó atrás de DESIGN.md

*Tarea · sigue vigente · esfuerzo: minutos · impacto para el usuario: bajo*

**Estado actual.** Vigente. DESIGN.md se modificó el 14/09 14:31 y .impeccable/design.json el 13/08 11:34. El chequeo de la skill compara solo las fechas de modificación de los dos archivos: si DESIGN.md es más nuevo, avisa (severidad "mention"). La versión de esquema está al día (2 = 2), así que el único aviso es por fecha. La diferencia real es chica: 20 líneas nuevas y 3 cambiadas en DESIGN.md (la excepción del radio de 2px y la franja partida). Qué hace /impeccable document: lee los tokens y componentes del código y escribe DESIGN.md (tokens arriba y 8 secciones fijas) más el sidecar .impeccable/design.json (rampas de color, sombras, motion, breakpoints, HTML/CSS de los componentes para el panel en vivo y las reglas). Si DESIGN.md ya existe, no lo pisa: pregunta si refrescar, sobrescribir o combinar. También se le puede pedir que regenere SOLO el sidecar, sin tocar DESIGN.md. Ojo: como el chequeo es por fecha, cualquier edición posterior de DESIGN.md vuelve a disparar el aviso, y las secciones 3 y 4 de PENDIENTES proponen editarlo (excepción del scrim, los círculos).

**Evidencia:**

- DESIGN.md mtime 2026-09-14 14:31:08; .impeccable/design.json mtime 2026-08-13 11:34:43 (generatedAt 2026-08-13T14:34:43Z)
- git diff --stat 5fdf331 HEAD -- DESIGN.md → 20 inserciones, 3 borrados
- .claude/skills/impeccable/scripts/lib/staleness.mjs:280-291: designMtime > sidecarMtime → 'design-sidecar-stale', fix: refrescar el sidecar preservando DESIGN.md
- scripts/lib/artifact-schema.mjs:23: DESIGN_SIDECAR_SCHEMA_VERSION = 2; design.json schemaVersion 2
- reference/document.md:255: "If the user only asks to refresh the sidecar… preserve DESIGN.md and write only .impeccable/design.json"
- reference/document.md (sección When to run): no sobrescribir DESIGN.md sin preguntar

**Opciones:**

1. **Correrlo ya, pidiendo explícitamente "solo el sidecar, sin tocar DESIGN.md"**
   - A favor: El aviso se va hoy y no hay riesgo sobre el DESIGN.md curado a mano.
   - En contra: Vuelve a aparecer apenas se edite DESIGN.md por las secciones 3 y 4.
2. **Primero hacer las ediciones pendientes de DESIGN.md (scrim, círculos, --warning-strong) y después regenerar solo el sidecar**
   - A favor: Una sola regeneración y el sidecar sale al día con todo.
   - En contra: El aviso sigue unos días más.
3. **Refresco completo de DESIGN.md y sidecar**
   - A favor: Sumaría lo que DESIGN.md hoy no documenta (modo oscuro, gráficos, banda de tablas, --warning-strong).
   - En contra: Arriesga reescribir un documento normativo curado a mano y exige responder la entrevista de la skill.

**Recomendación.** La opción 2. El aviso es solo informativo y la diferencia de contenido es chica: conviene regenerar una sola vez, después de las ediciones de DESIGN.md que ya están en la lista, y siempre en modo "solo sidecar" para no poner en riesgo DESIGN.md.

### ¿Versionar PENDIENTES.md? Hay antecedente: ESTADO.md está commiteado y quedó viejo

*Decisión · sigue vigente · esfuerzo: minutos · impacto para el usuario: bajo*

**Estado actual.** PENDIENTES.md no está en git ("?? PENDIENTES.md"). El antecedente es ESTADO.md, commiteado el 19/08 (6a4fc05) justamente para ver el estado desde otra PC, y nunca más actualizado. Hoy engaña: dice que el trabajo vive en la rama nucleo-frontend, que en origin ya no existe (solo hay main), que "un git pull a secas no la trae" y que hay 132 tests en 15 suites (CLAUDE.md dice 343 en 34). Lo útil que tenía (.env, backend en el 3000, el proxy) ya está en CLAUDE.md. PENDIENTES.md tiene además referencias a un archivo que solo existe en esta PC (../maquetas-respaldo-2026-09-14.zip).

**Evidencia:**

- git status → ?? PENDIENTES.md
- git log --all --oneline -- ESTADO.md → 6a4fc05 ESTADO.md: qué hay en esta rama y cómo traerla en otra máquina (único commit)
- ESTADO.md:1-3 ("rama nucleo-frontend", "Última actualización: 2026-08-19"), :28 ("Un git pull a secas no la trae"), :52 ("132 tests en 15 suites")
- git ls-remote --heads origin → solo refs/heads/main
- CLAUDE.md (Comandos): .env, proxy y backend en 3000 ya documentados
- PENDIENTES.md:8 y :151: rutas al zip local fuera del repo

**Opciones:**

1. **Versionar PENDIENTES.md y borrar ESTADO.md en el mismo commit**
   - A favor: Se ve desde cualquier PC, que fue el motivo de ESTADO.md; queda historia de qué se cerró; y se saca un documento que hoy da instrucciones falsas.
   - En contra: Hay que mantenerlo al día (el mismo riesgo que tuvo ESTADO.md) y limpiar las referencias al zip local.
2. **Dejarlo local, sin versionar**
   - A favor: Cero ruido en el repo.
   - En contra: No existe en la otra PC y se pierde si se borra la carpeta. ESTADO.md sigue engañando si no se borra aparte.
3. **Pasar los puntos a Issues de GitHub (ByteLab-dev-ar/club-alianza-frontend)**
   - A favor: Cada punto se cierra solo y se enlaza al commit que lo resuelve.
   - En contra: Más ceremonia para un proyecto de una persona; los pedidos al backend quedan en otro repo y se pierde la lectura de corrido.

**Recomendación.** La opción 1: versionar PENDIENTES.md reemplazando a ESTADO.md. El antecedente muestra que el dueño necesita el estado en otra máquina, y dejar ESTADO.md como está es peor que no tener nada. Para que no le pase lo mismo, borrar los puntos cerrados en vez de tacharlos y sacar las rutas al zip local.

### Hallazgos nuevos de este bloque

- ESTADO.md (versionado) da instrucciones falsas: dice que el trabajo vive en la rama nucleo-frontend, que ya no existe en origin (git ls-remote solo muestra main), que "un git pull a secas no la trae" y que hay 132 tests (hoy 343). ESTADO.md:1-3, :28 y :52.
- Bug "hs hs" en main: la hora se muestra con " hs" pegado al valor crudo en 5 lugares (EventCard.tsx:72, EventPosterCard.tsx:35, EventRow.tsx:48, NextEventBand.tsx:34, AdminEventsPage.tsx:84), y el seed del backend trae 'De 10 a 18 hs' (backend/src/cli/seed-demo-content.ts:438). El arreglo existe solo en el commit 3546afe del worktree y cubre 3 de los 5.
- El hover de las tarjetas de eventos tampoco funciona, por la misma causa que el botón hero: hover:shadow-club en src/events/components/EventCard.tsx:15 y EventPosterCard.tsx:40 no genera CSS (las clases de sombra están en @layer utilities, index.css:717-727), así que su transition-shadow no hace nada.
- DESIGN.md, que es normativo, no documenta tokens que ya están en src/index.css: --warning-strong (entró en 00ea958 sin tocar DESIGN.md), el modo oscuro de los paneles (.dark), .force-light, los colores de datos de los gráficos ni la banda de tablas. Su frontmatter solo tiene 'alerta' (DESIGN.md:20).
- text-success (oklch(58% 0.14 155)) da 4.01:1 sobre blanco, debajo del 4.5:1 de AA para texto chico, y se usa como texto en varios lugares, p. ej. AddGroupMemberDialog.tsx:143, AffiliationFormCard.tsx:136 y :164, DocumentUpload.tsx:114, MemberLayout.tsx:50 y AffiliationPage.tsx:54. Es el mismo problema que el ámbar, más leve.
- Hay una decisión pendiente anotada en el código que no está en PENDIENTES.md §6: "dona contra barras rotuladas" para medios de pago (src/admin/components/PaymentMethodsCard.tsx:42-45).
