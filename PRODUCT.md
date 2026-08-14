# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Usuario principal: el socio.** Entra desde el teléfono, casi siempre por dos
motivos concretos: mostrar su credencial para entrar al club, o ver si tiene la
cuota al día y pagarla. No viene a navegar — viene a resolver algo y salir.

Otros roles confirmados en `src/constants/roles.ts`:

- **Recepción** — está físicamente en la puerta y solo escanea credenciales. No
  entra al panel ni ve socios ni pagos. El rol existe para no tener que darle una
  cuenta de tesorería a quien controla la entrada.
- **Tesorería** (`accountant`) — cobros y estado de cuotas.
- **Admin web** (`web_admin`) — contenido: eventos, galería, institucional.
- **Administrador** — todo lo anterior, más padrón, staff y auditoría.
- **Visitante no socio** — llega al sitio público y eventualmente se asocia.

## Product Purpose

Portal del Club Alianza, club de **fútbol** de **Cutral Có, Neuquén**. Le saca
trámites de encima al socio (credencial y cuota sin pasar por la sede) y le da al
club las herramientas para operar: padrón, cobros, control de acceso y contenido
institucional.

El éxito se mide en trámites evitados: menos gente en la sede preguntando si está
al día, menos credenciales físicas, menos fricción en la puerta.

## Positioning

La credencial es digital, personal y **verificable en la puerta**: se genera como
QR en el teléfono del socio (`/mi-cuenta/credencial`) y recepción la valida
escaneándola (`/puerta`, `/validar/:token`). Credencial, estado de cuota y acceso
físico son la misma verdad vista desde tres lados, no tres sistemas que alguien
tiene que mantener sincronizados a mano.

## Operating Context

- **El socio, en el teléfono.** Fuera de la sede o justo llegando a ella.
- **La puerta del club.** Recepción escanea con el celular, a una mano, con gente
  esperando atrás. Es el escenario menos tolerante del producto: el veredicto
  tiene que ser inequívoco y rápido.
- **La gestión.** Panel de escritorio para padrón, cobros y contenido.
- **El sitio público.** Eventos, historia, institucional, galería y contacto.
- **El estadio.** Álvaro Pedro Ducós — el nombre es legible en el cartel de
  `src/assets/hero.webp`.

## Capabilities and Constraints

**Funciones confirmadas** (rutas en `src/router/router.app.tsx`):

- Público: home, eventos, historia, institucional, galería, contacto.
- Cuenta: asociarse, ingresar, verificación de email, recuperación y reset de
  clave, confirmación de cambio de email, callback de auth externo.
- Socio: credencial QR (descargable vía `html-to-image`), pagos, perfil.
- Gestión: socios y detalle, pagos, eventos, galería, institucional, staff,
  auditoría.
- Puerta: escáner QR y validación por token.

**Restricciones técnicas a preservar** (verificadas en `AUDITORIA.md`, 26/07/2026):

- Sesión en cookies httpOnly con refresh single-flight. Sin tokens en
  localStorage. Sin `dangerouslySetInnerHTML`.
- TypeScript strict, cero `any`. Formularios con React Hook Form + Zod.
- Patrón `actions → hooks → pages` consistente en todo el código.
- **Performance es la deuda conocida:** bundle de 872 kB y ~480 kB de PNG del
  escudo. Cualquier trabajo visual tiene que mejorar ese número, no empeorarlo.

**Terminología:** socio, cuota, padrón, credencial, tesorería, recepción, staff.

### La cuota son tres coberturas, no una

Desde §5 del núcleo de negocio, "la cuota" dejó de ser una sola cosa. Son **tres
coberturas independientes**, cada una con su propio vencimiento, y la diferencia
entre ellas es lo que la interfaz tiene que comunicar:

| Cobertura | Campo | Vencida, qué pasa |
| --- | --- | --- |
| Membresía | `membershipUntil` / `isActive` | **No entra al club.** Es la única que bloquea |
| Actividad | `activityUntil` / `isActivityUpToDate` | No puede entrenar. Entra a ver los partidos igual |
| Seguro | `insuranceUntil` / `isInsuranceUpToDate` | Nada. Es opcional de verdad |

**La regla de diseño que sale de acá:** un jugador con la actividad vencida no es
un moroso ni está bloqueado. Tres semáforos rojos iguales serían una mentira
sobre dos de ellos, así que el rojo queda reservado para la membresía y las otras
dos se escriben en tono neutro, diciendo qué es lo que sí puede seguir haciendo.

Dos consecuencias más, ya aplicadas:

- **La actividad y el seguro se muestran solo si alguna vez se pagaron.** Sin la
  marca de jugador (que el panel todavía no consume), una fila en "—" para los
  cientos de socios que no juegan se lee como una deuda inexistente.
- **Moroso ≠ vencido.** `isActive: false` es el primer día de atraso;
  `delinquentSince` es la marca que el club aplica recién a los tres meses, y es
  lo único que bloquea subir comprobantes desde el portal.

### Un pago cubre a varias personas

Desde el carrito, un comprobante puede pagar la membresía del padre y la
actividad de dos hijos en una sola operación. El pago dejó de tener *un*
concepto y *un* mes: tiene **líneas** (`payment.lines[]`), una por persona y
concepto.

Consecuencias para cualquier pantalla que muestre pagos:

- **Nada lee `payment.concept` ni `payment.metadataMonth`** — no existen más.
  Para las celdas de tabla están `summarizeConcepts()` y `summarizeMonths()`, que
  devuelven el valor tal cual cuando hay una sola línea (el caso de siempre, la
  tabla se ve igual que antes) y lo cuentan cuando hay más.
- **El importe nunca sale del navegador.** El total que muestra el carrito es
  informativo; el que vale lo calcula el servidor con los precios vigentes y el
  descuento familiar, y el endpoint rechaza un monto mandado desde el cliente.
- **El estado del que paga no importa.** Un tutor vencido, o incluso moroso, le
  paga igual a sus chicos: la pantalla del carrito no se bloquea por
  `delinquentSince` como sí lo hace el alta de a uno.

### La credencial decide dos cosas, no una

En la puerta se resuelve si **entra** (la membresía) y, aparte, si **entrena**
(la actividad). Por eso la banda de la pantalla de validación dice "PUEDE ENTRAR"
y no "SOCIO AL DÍA": con tres coberturas, "al día" se lee como "está todo bien" y
puede tener la actividad vencida.

Las coberturas se escriben por lo que **habilitan** ("Entra", "Entrena", "Con
seguro") y no por su estado administrativo, para que quien escanea no tenga que
traducir "actividad vencida" a "este chico ve el partido pero no entrena". Solo
la membresía se pinta en rojo.

### Claims bloqueados — no usar

La copy incumbente afirma tres cosas y **el usuario confirmó que al menos una es
falsa**, sin identificar cuál (12/08/2026):

- "Primera división regional y categorías inferiores desde los 6 años."
- "Más de 80 eventos al año entre partidos, torneos y celebraciones."
- "Asados, peñas y actividades sociales todo el año."

Hasta que se resuelva cuál es la falsa, **ninguno de los tres se usa en contenido
nuevo, se amplifica, ni se convierte en métrica destacada.** Los que ya están en
la home siguen ahí porque borrarlos sin saber cuál corregir dejaría huecos, pero
son deuda de contenido, no evidencia.

### Decisiones abiertas — no inventar

- Cuál de los tres claims es falso y con qué se reemplaza.
- El nombre de la liga o federación.
- Año de fundación y cantidad de socios.
- Títulos, logros deportivos y fechas históricas.

## Brand Commitments

- **Nombre:** Club Alianza. **Ciudad:** Cutral Có, Neuquén.
- **El escudo es identidad fija y no se rediseña.**
- **El celeste del escudo (`#00c9ff`) es binding.** Está codificado en
  `src/index.css` con una regla explícita y contraste medido: el celeste es
  acento, nunca superficie; los neutros van sin croma. Hay dos versiones porque
  una sola no alcanza — la brillante para superficies oscuras, la profunda para
  texto sobre claro (la brillante sobre blanco da 1.9:1, ilegible).
- **El near-black del producto está alineado con el negro del escudo.**

### Dirección de diseño — registrada a pedido del usuario (12/08/2026)

- **Convencional y usable, nunca experimental.** Un mundo visual conceptual fue
  probado y rechazado explícitamente. El estándar del rubro bien ejecutado es un
  destino legítimo acá, no una falta de ambición.
- **Se refina lo existente; no se reemplaza.** El sistema de tokens de
  `index.css` es autoridad real, razonada y con contraste medido.
- **Toda propuesta visual pasa primero por maqueta** en HTML suelto, fuera de
  `src/`, y se mira antes de tocar el proyecto.
- **Nada se muestra sin captura de pantalla.** Verificar por texto y estilos
  computados dio verde sobre una página visualmente destruida.

## Evidence on Hand

- `src/assets/hero.webp` — la tribuna con humo celeste, el cartel del estadio
  legible, papelitos en el pasto. Foto real del club.
- `src/assets/cancha.webp` — la cancha vacía desde la tribuna.
- `src/assets/logo-crest-132.png` y `logo-no-bg-alianza.png` — el escudo.
- `src/index.css` — tokens en OKLCH con las decisiones de paleta documentadas.
- `AUDITORIA.md` — auditoría técnica del 26/07/2026 con estado por dimensión.
- Contenido institucional y galería servidos por el backend.

**Ausencias que no se deben rellenar:** no hay testimonios, métricas de socios,
prensa ni logros deportivos disponibles.

## Product Principles

1. **El socio viene a resolver, no a navegar.** Credencial y estado de cuota son
   el centro; todo lo que se interponga es deuda.
2. **La puerta no puede fallar.** Con gente esperando, el veredicto del escaneo
   tiene que leerse de un vistazo y a un brazo de distancia.
3. **Un rol ve solo lo suyo.** Recepción no entra al panel. El privilegio mínimo
   es decisión de producto, no solo de seguridad.
4. **Las fotos del club son el activo, no el relleno.** Son reales y específicas;
   lo que las tapa (velos, gradientes, chrome encima) es lo que hace que el sitio
   se sienta genérico.
5. **El peso es parte del diseño.** El portal se usa desde el teléfono, muchas
   veces en la puerta del club. Un rediseño que se vea mejor y cargue peor es un
   rediseño peor.

## Accessibility & Inclusion

No se estableció un estándar formal. Hay un compromiso demostrado en el código:
la paleta se eligió midiendo contraste y descartando variantes que no llegaban
(`index.css` documenta 1.9:1 rechazado, 4.7:1 y 5:1 aceptados). Ese piso se
sostiene.

El escenario de la puerta agrega un requisito propio: uso a una mano, en el
teléfono, con luz variable.
