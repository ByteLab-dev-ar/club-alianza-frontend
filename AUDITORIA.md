# Auditoría técnica — Club Alianza Frontend

> **Fecha:** 26/07/2026 · **Commit auditado:** `6ff7be7` · **Alcance:** 160 archivos, 10.303 líneas de `src/` + configs raíz
> **Metodología:** 7 revisores especializados (arquitectura, datos, seguridad, tipos, formularios, performance, calidad) + verificación adversarial: cada hallazgo fue contrastado contra el código real por un segundo revisor escéptico. Varios se refutaron o bajaron de severidad en esa pasada; lo que quedó es confiable.
>
> **Cómo usar este archivo:** cada hallazgo tiene una casilla `[ ]` en su título. Al resolverlo, se marca `[x]` en el mismo commit del fix. Los hallazgos están ordenados por prioridad dentro de cada sección.

## Estado: Ronda 1 cerrada (55/55) · Ronda 2: 11/15 (quedan R11–R14, todas oportunidades) · Ronda 3: 1/1

Los dos últimos de la ronda 1 (#4 y #44) dependían del backend y se cerraron
cuando aplicó los cambios pedidos. Ver la tanda 5 abajo. El lockfile ya quedó
sincronizado con pnpm al instalar `qr-scanner`.

La **Ronda 2** (al final del archivo) es una re-auditoría posterior a todo el
trabajo: el código cambió mucho —refactor completo + rediseño de credenciales—
y buena parte de lo nuevo no había pasado por revisión adversarial.

---

## Veredicto general

El proyecto está **mejor que el promedio de un MVP, por bastante**. La arquitectura por features con el patrón actions → hooks → pages se respeta en todo el código, la sesión con cookies httpOnly y refresh single-flight está bien resuelta, TypeScript strict sin ningún `any`, todos los forms con RHF + Zod, y comentarios en español genuinamente útiles. La deuda real se concentra en tres lugares: **el arranque** (bundle único, first paint bloqueado por auth), **el ciclo de vida de la sesión** (cache sin limpiar al logout, refresh muerto que no desloguea) y **detalles de formularios/cache**.

### Estado por dimensión

| Dimensión | Estado | Resumen |
| --- | --- | --- |
| Arquitectura | 🟢 Sólida | Patrón actions → hooks → pages consistente; los problemas reales están en el arranque y la sesión, no en la estructura. |
| Capa de datos | 🟡 Buena, con huecos | TanStack Query bien usado; falta higiene de cache: nada se limpia al cerrar sesión y hay invalidaciones cruzadas ausentes. |
| Seguridad | 🟢 Sólida | Cookies httpOnly, cero `dangerouslySetInnerHTML`, sin open redirect. Pendiente: tokens en URL/historial y hardening (CSP, .env). |
| TypeScript | 🟢 Muy sana | Strict activado, cero `any` explícitos, `z.infer` en schemas. Un bug funcional serio (staff) y frontera backend sin validación runtime. |
| Formularios | 🟡 Base sólida | RHF + Zod en todos, a11y del wrapper correcta. Fallan el reset de dialogs de edición y el manejo de archivos fuera de RHF. |
| Performance | 🔴 El punto débil | Render eficiente, pero bundle único de 872 kB, primer paint bloqueado por auth y ~480 kB de PNG del escudo. |
| Calidad / DRY | 🟢 Muy buena | Sin `console.log`, formato centralizado, comentarios excelentes. Deuda: form-dialog copiado 6 veces y query keys mágicas. |

### Lo que ya está bien (protegerlo en los refactors)

- Sesión en cookies httpOnly, sin tokens en localStorage, con refresh single-flight en el interceptor.
- Cero `dangerouslySetInnerHTML`; todo el contenido del backend se renderiza como texto JSX.
- Patrón actions → hooks → pages consistente en las lecturas de todo el proyecto.
- Guards de rol en dos niveles (portón staff + rol puntual por sección), con enforcement real en el backend.
- TypeScript strict sin un solo `: any` explícito; `z.infer` en todos los schemas.
- Todos los forms con RHF + Zod, submit deshabilitado durante `isPending`, a11y del wrapper shadcn correcta.
- Keys estables por id en listas, búsqueda debounced, `keepPreviousData` en paginación.
- Comentarios en español excelentes y consistentes; formato de fechas/moneda centralizado en `lib/format.ts`.

### Plan de acción sugerido

1. ~~**Bugs y privacidad de datos**~~ ✅ **hecha**: invitación de staff (#2), limpiar cache al logout (#1), invalidaciones faltantes (#8, #15, #29), polling del bulk import (#14).
2. ~~**Carga y ciclo de vida de la sesión**~~ ✅ **hecha**: code splitting por ruta (#3), sacar el gate global de auth (#6), puente refresh→store (#7), escudo reexportado (#11), retry sin 4xx (#30), html-to-image dinámico (#22), dependencias muertas (#23).

   Medido con `npm run build` antes y después — lo que baja un visitante anónimo en su primera visita:

   | | Antes | Después |
   | --- | --- | --- |
   | JS inicial | 872 kB (272 kB gzip) | 553 kB (176 kB gzip), en 2 chunks cacheables |
   | Escudo + favicon | 494 kB | 13 kB |
   | **Total transferido** | **~941 kB** | **~364 kB** |

   Una revisión posterior de los propios cambios encontró y corrigió cuatro regresiones introducidas por esta tanda:

   - `queryClient.clear()` se ejecutaba en **todo** arranque anónimo (el guard miraba `'not-authenticated'`, pero al arrancar el status es `'checking'`), tirando las queries públicas en vuelo. Ahora solo limpia si venía de una sesión viva.
   - `PageLoader` es `min-h-screen` y se había usado como fallback *dentro* del contenedor de los layouts, sumando una pantalla entera al documento en cada navegación lazy. Se separó en `SectionLoader`, de alto acotado.
   - El code splitting agrega un modo de falla nuevo (chunk que no baja tras un deploy con la pestaña abierta) que caía en la pantalla de error cruda de react-router. Se agregó `RouteErrorPage` como `errorElement`, que detecta ese caso y ofrece recargar.
   - El `apple-touch-icon` había quedado transparente: iOS lo aplana sobre negro y borraba el nombre del club. Se regeneró sobre blanco. De paso el escudo pasó de 96 a 132 px (44 × 3) para pantallas de DPR 3.

   Pendiente de la tanda: correr `pnpm install` para sincronizar el lockfile con las dos dependencias quitadas de `package.json`.
3. ~~**Formularios y paginación admin**~~ ✅ **hecha**: reset de dialogs de edición (#9), archivos dentro de RHF (#10), schema único de password y campos (#17, #19), paginar eventos/galería (#5). De paso, el campo Hora del formulario de eventos (#21), que estaba en el mismo archivo.

   Las reglas de campo compartidas viven ahora en `src/shared/schemas/fields.ts` y las componen los schemas de auth, admin y el perfil del socio.

   **Queda pendiente #4 (paginar pagos): necesita que el backend acepte `page`/`limit` en `GET /admin/payments`.** Es lo único de las tandas 1-3 que no se puede cerrar desde el frontend.

   ⚠️ **A confirmar contra el backend:** la contraseña tenía dos definiciones distintas de "símbolo" en el front (registro aceptaba cualquiera, alta de staff solo `@$!%*?&#`), así que una de las dos no coincidía con el backend. Se unificó en la lista cerrada, que es la más probable —es la forma que suele tener el `@Matches` del DTO— y además el mensaje ahora enumera los símbolos válidos. Si el backend resulta ser más permisivo, se relaja en un solo lugar (`passwordField`).
4. ~~**Deuda estructural y el resto de los hallazgos**~~ ✅ **hecha** (33 hallazgos). Se cerró todo lo que quedaba salvo dos que dependen del backend.

   **Piezas compartidas que aparecieron:**

   | Archivo nuevo | Reemplaza a | Hallazgo |
   | --- | --- | --- |
   | `src/api/queryKeys.ts` | keys sueltas repetidas en 12 archivos | #12, #28 |
   | `src/components/custom/FormDialog.tsx` | el esqueleto copiado en 6 diálogos | #25, #26 |
   | `src/components/custom/TextField.tsx` | ~30 bloques `FormField` idénticos | #25 |
   | `src/components/custom/PanelShell.tsx` | shell duplicado admin/socio | #37 |
   | `src/components/custom/FilterPills.tsx` | píldoras duplicadas en 2 listados | #54 |
   | `src/shared/lib/file-validation.ts` | 4 validaciones de archivo distintas | #41, #48 |
   | `src/auth/hooks/useOneTimeToken.ts` | token en la URL en 3 páginas | #16 |
   | `src/lib/safe-url.ts` | `href` sin validar en 3 lugares | #42 |

   **Además:** las mutations del portal del socio se movieron a hooks (#13), el feedback de los borrados vive en el hook y `ConfirmDialog` ya no se traga los rechazos (#26), `noUncheckedIndexedAccess` quedó activado **sin un solo error** (#36), y los errores 409 se marcan en el campo en vez de un toast genérico (#20).

   **Lo que quedó fuera y por qué:** la CSP va como header del servidor, no en un meta tag (#43); `exactOptionalPropertyTypes` enciende 24 errores y es una migración aparte (#36).
5. ~~**Integración con los cambios del backend**~~ ✅ **hecha**: cierra los dos hallazgos que dependían de la API.

   - **#4 — Pagos paginados.** `GET /admin/payments` ahora acepta `page`/`limit` y devuelve el sobre paginado. `PaymentsPage` usa el mismo componente `Pagination` que socios y auditoría, y al cambiar de pestaña vuelve a la página 1. Aprobar o rechazar refresca solo la página montada: es el default de `refetchType: 'active'`, no hizo falta tocarlo.
   - **#44 — La validación dejó de ser pública.** El backend rediseñó el sistema: el club reparte credenciales físicas con QR impreso permanente, y validar ahora **exige sesión** de `admin` o del rol nuevo `reception`. Tener el link ya no alcanza para consultar nada, que era el problema de fondo. Del lado del front: `/validar/:token` pasó detrás del guard, se sumó `/puerta` con escáner de cámara, un botón de "Anular credencial" en la ficha del socio, y el validador distingue **410 (anulada, en ámbar)** de **400 (inválida, en rojo)** por status code.

     > Hubo una iteración intermedia en la que el QR vencía a 30 días con un campo `qrExpiresAt`. Ese diseño quedó descartado —las tarjetas físicas no se renuevan— y el campo ya no existe en la API. Si aparece una referencia a `qrExpiresAt` en algún lado, es código muerto de esa vuelta.
   - **Contraseña unificada con el backend.** La regla real resultó ser *más restrictiva* de lo que suponíamos: una lista blanca que rechazaba tildes, espacios y guiones. El backend la relajó; `passwordField` es ahora copia literal de su `PASSWORD_REGEX` (con el flag `u`), con largo 6–64. Verificado contra los 11 casos que enumeró el backend.
   - **El sobre de error tiene `errors[]`.** No lo contemplábamos: `message` es siempre un string con el primer error, y `errors[]` trae el detalle campo por campo. `getApiErrorMessage` ahora los junta cuando hay más de uno, en vez de mostrar solo el primero. Los 409 (email duplicado, DNI) muestran el texto del backend en vez de uno inventado acá.
6. ~~**Rediseño del flujo de pago**~~ ✅ **hecha** (03/08): el socio ya no elige qué mes paga.

   - `GET /payments/next-due` es la única fuente del período: la pantalla de pagos lo muestra como aviso ("Estás pagando: **septiembre 2026**") y el diálogo lo repite en modo lectura. El `<input type="month">` desapareció.
   - Con `canPay: false` (hay un comprobante esperando revisión), el botón de subir queda deshabilitado y el aviso ámbar explica el motivo, citando el mes bloqueado.
   - El submit manda `monthlyDueMonth` **solo como verificación**: ante un 409 (cambió el mes con la pantalla abierta, o entró otro comprobante), el hook muestra el `message` del backend y re-consulta `next-due` para que el socio confirme contra la realidad. Subir un pago con éxito también invalida `next-due` (pasa a bloqueado).
   - El monto quedó libre a propósito: el caso "debo tres meses" se paga con un solo comprobante por el total, y el sistema lo imputa al mes corriente.
   - `formatMonth` (period `YYYY-MM` → "septiembre 2026") vive en `lib/format.ts`, con test.
4. **Deuda estructural** (continuo): query keys centralizadas (#12), FormDialog genérico (#25), mutations del portal a hooks (#13), y los hallazgos bajos al tocar cada archivo.

---

## 🔴 Prioridad alta (5)

Bugs funcionales activos, privacidad de datos y el problema de performance que afecta al 100% de las visitas.

### [x] 1. El cache de React Query no se limpia al cerrar sesión: datos de un usuario quedan visibles para el siguiente

**Severidad:** Alta · **Área:** Datos · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/auth/store/auth.store.ts:51`

**Qué pasa:** No existe ninguna llamada a queryClient.clear()/removeQueries en todo src/ (verificado con búsqueda global). logoutUser solo resetea el estado de Zustand, pero las queries ['member-profile'], ['my-payments'], ['member-credential'] y todas las de admin quedan en el cache con sus datos. Las keys no incluyen el id del usuario. Escenario concreto: en una PC compartida (mesa de entrada del club), el usuario A cierra sesión y el usuario B se loguea dentro de los 5 minutos de gcTime por defecto; useProfile y useCredential tienen staleTime de 5 minutos (src/members/hooks/useProfile.ts líneas 11 y 19), así que React Query considera los datos de A todavía frescos y NI SIQUIERA refetchea: B ve el DNI, domicilio, teléfono, historial de pagos y el token QR de la credencial de A.

**Evidencia:**

```
logoutUser: async () => {
    try {
        await logoutAction()
    } finally {
        // Aunque el backend falle, localmente cerramos la sesión igual.
        set({ status: 'not-authenticated', user: null })
    }
},
```

**Fix propuesto:** Extraer el queryClient de ClubAlianzaApp.tsx a un módulo propio (p.ej. src/api/queryClient.ts), importarlo en auth.store.ts y llamar queryClient.clear() en el finally de logoutUser (y también en el catch de checkAuthStatus cuando pasa a 'not-authenticated'):

```
// src/api/queryClient.ts
export const queryClient = new QueryClient({ ... })

// auth.store.ts
logoutUser: async () => {
    try { await logoutAction() }
    finally {
        queryClient.clear()
        set({ status: 'not-authenticated', user: null })
    }
}
```

> **Verificación cruzada:** Verificado: no hay queryClient.clear()/removeQueries en todo src/ (solo invalidaciones puntuales en hooks), logoutUser (auth.store.ts:51) solo resetea Zustand, se invoca por onClick SPA sin reload, las keys no incluyen el id de usuario y useProfile/useCredential tienen staleTime de 5 min sin gcTime custom. El escenario del siguiente usuario viendo datos frescos del anterior es reproducible. Ajusto a high: exige PC/browser compartido sin recarga y una ventana de ~5 min (gcTime default); es una fuga de PII entre usuarios en dispositivo compartido, grave pero no un compromiso general de la app.

---

### [x] 2. Invitar staff está roto: el schema de alta (con password obligatoria) valida también el modo invitación

**Severidad:** Alta · **Área:** Tipos · Formularios · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/admin/components/StaffFormDialog.tsx:37`

**Qué pasa:** El form usa siempre zodResolver(createStaffSchema), que exige password con min(6) + regex, pero en modo 'invite' el campo password no se renderiza y queda en '' (defaultValues). react-hook-form valida TODO el objeto de valores contra el schema aunque el campo no esté montado (shouldUnregister es false por defecto): la validación de password falla, handleSubmit nunca llama a onSubmit, y como el FormMessage de password no está en pantalla, el usuario aprieta 'Enviar invitación' y no pasa absolutamente nada, sin ningún feedback. El comentario del código ('si es invitación, se descarta el campo password') descarta el campo DESPUÉS de validar, que es tarde.

**Evidencia:**

```
const form = useForm<CreateStaffSchema>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: { name: '', surname: '', email: '', password: '', roles: [] },
})
// ...
} else {
    const { password: _password, ...invite } = values  // nunca se llega acá con password ''
```

**Fix propuesto:** Usar un schema por modo: `const schema = mode === 'create' ? createStaffSchema : inviteStaffSchema` y pasarlo al resolver (zodResolver acepta el schema dinámico si se recrea el resolver al cambiar mode, p.ej. con `useForm({ resolver: (values, ctx, opts) => zodResolver(mode === 'create' ? createStaffSchema : inviteStaffSchema)(values, ctx, opts) })`), o extender inviteStaffSchema con `password: z.string().optional()` y validar la regla fuerte solo en modo create vía superRefine.

> **Verificación cruzada:** Verificado: StaffFormDialog.tsx:37 usa siempre zodResolver(createStaffSchema) (password min 6 + regex en staff.schema.ts:14-23), defaultValues.password es '', y en modo 'invite' el campo no se renderiza: RHF valida _formValues completos contra el schema, el submit falla silenciosamente, no hay FormMessage visible ni input que enfocar, y el destructuring de la línea 49 nunca se ejecuta. inviteStaffSchema existe pero jamás se usa en el resolver. Ajusto a high: rompe por completo el tab por defecto del diálogo sin feedback, pero hay workaround funcional (crear con contraseña) y no hay impacto de seguridad ni pérdida de datos.

---

### [x] 3. Sin code splitting por rutas: un único bundle de 872 kB lleva todo el admin y el portal a la home pública

**Severidad:** Alta · **Área:** Arquitectura · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/router/router.app.tsx:39`

> Señalado de forma independiente por 2 revisores — fusionado acá.

**Qué pasa:** router.app.tsx importa estáticamente las 9 páginas de admin, el portal de socio, auth y todas las públicas (líneas 3-34), así que Vite genera un solo chunk. Lo medí con `npm run build`: dist/assets/index-4jJ__432.js pesa 872.50 kB (272.25 kB gzip) y Vite emite el warning de chunks >500 kB. El costo es real y asimétrico: src/admin son 4.337 LOC y src/members+payments otras ~1.760 LOC (~60% del código de src/), más `qrcode` y `html-to-image` (solo usados en CredentialPage/CredentialCard), y todo eso lo descarga y parsea un visitante anónimo que entra a ver la agenda de eventos. El propio TODO en la línea 39 reconoce el problema; hoy es el hallazgo de mayor impacto en performance del proyecto.

**Evidencia:**

```
// TODO(optimización): importar las páginas del portal de socio y del admin con
// React.lazy + <Suspense> para que quien solo visita el sitio institucional no se
// baje el código de los paneles.
export const appRouter = createBrowserRouter([

// build real:
// dist/assets/index-4jJ__432.js   872.50 kB │ gzip: 272.25 kB
// (!) Some chunks are larger than 500 kB after minification.
```

**Fix propuesto:** Cortar en 3 fronteras que coinciden con los guards: admin, portal de socio y auth. Con React.lazy alcanza y no toca el patrón existente:

```
const AdminLayout = lazy(() => import('@/admin/layouts/AdminLayout').then(m => ({ default: m.AdminLayout })))
const MemberLayout = lazy(() => import('@/members/layouts/MemberLayout').then(m => ({ default: m.MemberLayout })))
// ...ídem cada página de admin

y envolver el elemento del guard: <RoleRoutes allowed={STAFF_ROLES}><Suspense fallback={<PageLoader />}><AdminLayout /></Suspense></RoleRoutes>. Alternativa más limpia en react-router 7: usar `lazy:` por ruta. Con eso `qrcode` y `html-to-image` (CredentialPage) y los 4.3k LOC de admin salen del chunk inicial; la home pública debería quedar cerca de un tercio del peso actual.
```

> **Verificación cruzada:** Verificado: router.app.tsx importa estáticamente las ~30 páginas (líneas 3-34), el TODO de las líneas 39-41 lo reconoce, y el bundle citado existe en disco: dist/assets/index-4jJ__432.js pesa exactamente 872.500 bytes. La severidad high es correcta para un sitio institucional cuyo visitante anónimo descarga todo el admin y el portal.

---

### [x] 4. PaymentsPage renderiza el historial completo de pagos sin paginar

**Severidad:** Alta · **Área:** Performance · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/admin/pages/PaymentsPage.tsx:99`

**Qué pasa:** El endpoint GET /admin/payments devuelve un array plano — el propio action lo documenta como 'NO paginado' — y la página mapea todo a filas de tabla sin límite, paginación ni virtualización. El comentario de useBulkImport.ts habla de importar ~3500 socios: a una cuota mensual por socio, la pestaña 'Todos' (y 'Aprobados') acumula decenas de miles de filas por año, cada una con Badge, botones y links. React tarda segundos en montar eso y la interacción (cambiar de tab, aprobar un pago que invalida y re-renderiza) se congela. Contrasta con MembersListPage y AuditPage, que sí usan limit: 20 + Pagination.

**Evidencia:**

```
/** GET /admin/payments — array plano (NO paginado), con filtros opcionales. */
// PaymentsPage.tsx:
const { data: payments = [], isLoading, isError } = useAdminPayments({...})
...
{payments.map((payment) => (
    <TableRow key={payment.id}>
```

**Fix propuesto:** Paginar igual que socios: agregar page/limit a AdminPaymentsQuery (el backend ya filtra por status y fechas) y reutilizar el componente Pagination con keepPreviousData, que el hook ya configura. Si tocar el backend no es opción inmediata, al menos limitar el render (slice + 'mostrar más') o virtualizar la tabla.

> **Verificación cruzada:** Todo verificado: el action documenta 'array plano (NO paginado)', AdminPaymentsQuery no tiene page/limit, PaymentsPage.tsx:99 mapea todo sin límite, el comentario de ~3500 socios existe en useBulkImport.ts:12, y MembersListPage/AuditPage sí paginan con limit 20 + Pagination. Agravante no citado: useInvalidatePayments refetchea el set completo tras cada aprobación. A la escala documentada del club (~3500 socios, cuota mensual), las pestañas Aprobados/Todos crecen sin techo en payload y en filas renderizadas.

> **BLOQUEADO — requiere backend.** Es el único hallazgo de las tandas 1-3 que no se puede resolver desde el frontend: `GET /admin/payments` devuelve un array plano, sin `page`/`limit`. Cuando el endpoint acepte paginación, el trabajo del lado del front es chico: agregar `page`/`limit` a `AdminPaymentsQuery`, y en `PaymentsPage` copiar el patrón ya usado en eventos y galería (`useState` de página + `<Pagination meta={data.meta} disabled={isPlaceholderData} />`); el hook ya tiene `keepPreviousData`.

---

### [x] 5. Listados admin de eventos y galería cortan en 50 ítems sin paginación

**Severidad:** Alta · **Área:** Calidad · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/admin/pages/AdminGalleryPage.tsx:19`

**Qué pasa:** AdminGalleryPage y AdminEventsPage (línea 18) piden una sola página con limit: 50 contra endpoints paginados, ignoran data.meta y no renderizan ningún control de paginación — a pesar de que el componente compartido Pagination ya existe y se usa en MembersListPage y AuditPage. Una galería crece indefinidamente: pasadas las 50 imágenes (o 50 eventos), los ítems más viejos se vuelven invisibles e imposibles de editar o borrar desde el panel.

**Evidencia:**

```
const { data, isLoading, isError } = useGallery({ limit: 50 })
...
const images = data?.items ?? []  // data.meta nunca se usa; no hay <Pagination />
```

**Fix propuesto:** Agregar estado de página y reutilizar el componente existente, igual que MembersListPage: const [page, setPage] = useState(1); useGallery({ page, limit: 50 }); y al pie: {data && <Pagination meta={data.meta} onPageChange={setPage} disabled={isPlaceholderData} />}. Ídem en AdminEventsPage.tsx.

> **Verificación cruzada:** Exacto: AdminGalleryPage.tsx:19 y AdminEventsPage.tsx:18 piden una sola página de 50 contra endpoints paginados (unwrapPaginated), ignoran data.meta y no renderizan Pagination, que existe y se usa en MembersListPage/AuditPage. Peor de lo descrito para eventos: /events viene ordenado por fecha ascendente, así que pasados 50 eventos los recién creados ni aparecen en el panel. En galería (más recientes primero) los viejos quedan ineditables; la página pública sí pagina, o sea el contenido sigue visible al público pero inmanejable desde admin.

---

## 🟡 Prioridad media (22)

Impacto real en usuarios o mantenibilidad, sin ser fuego.

### [x] 6. CheckAuthProvider bloquea el primer render del sitio público detrás de DOS requests fallidas para visitantes anónimos

**Severidad:** Media · **Área:** Arquitectura · Performance · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/ClubAlianzaApp.tsx:35`

**Qué pasa:** El router entero (incluidas las páginas públicas: home, eventos, historia, galería, contacto, /validar/:token) no se monta hasta que checkAuthStatus resuelva. Para un visitante sin sesión la secuencia es: GET /users/me → 401 → como '/users/me' no está en NO_REFRESH_PATHS (clubApi.ts:15), el interceptor dispara POST /auth/refresh → 401 → recién ahí se rechaza y se renderiza. Son dos round-trips secuenciales al backend gateando el first paint de un sitio institucional, sumados al bundle de 872 kB. Además el bloqueo global es redundante: los tres guards de ProtectedRoutes.tsx ya muestran <PageLoader /> cuando status === 'checking' (líneas 14, 26 y 44), y las rutas públicas no dependen del estado de auth (solo PublicHeader cambia el CTA).

**Evidencia:**

```
const CheckAuthProvider = ({ children }: PropsWithChildren) => {
    ...
    if (status === 'checking') return <PageLoader />
    return children
}
// clubApi.ts:15 — '/users/me' no figura acá, entonces el 401 anónimo dispara un refresh inútil:
const NO_REFRESH_PATHS = ['/auth/login', '/auth/refresh', '/auth/register']
```

**Fix propuesto:** Sacar el gate global: montar <RouterProvider> siempre y dejar que los guards (que ya manejan 'checking') bloqueen solo las rutas privadas. PublicHeader puede renderizar el estado anónimo de forma optimista mientras status === 'checking'. Complemento: evitar el segundo round-trip marcando la request de check-auth para que el interceptor no intente refresh (p. ej. un flag en config: `clubApi.get('/users/me', { _skipRefresh: true })` chequeado en el interceptor), o agregando '/users/me' del arranque a una lista de exclusión específica del bootstrap.

> **Verificación cruzada:** Verificado: ClubAlianzaApp.tsx:35 devuelve PageLoader hasta que resuelva checkAuthStatus, gateando también las rutas públicas; '/users/me' no está en NO_REFRESH_PATHS (clubApi.ts:15) así que el 401 anónimo dispara un POST /auth/refresh inútil antes de rechazar (dos round-trips secuenciales); y los tres guards de ProtectedRoutes.tsx (líneas 14, 26, 44) ya manejan 'checking', el gate global es redundante. Ajusto a medium: el efecto es latencia extra con un loader visible en un sitio que igual funciona, no rompe funcionalidad.

> **Resuelto (parcial, a propósito):** Se sacó el gate global — el sitio público ahora renderiza sin esperar al backend y los guards siguen bloqueando solo las rutas privadas. **NO se implementó** el `_skipRefresh` que sugería la recomendación: saltear el refresh en `/users/me` rompería el caso legítimo de alguien que vuelve con el accessToken vencido (15 min) pero el refreshToken vivo — se lo desloguearía en vez de renovarle la sesión. El segundo round-trip es el precio de restaurar sesiones y se paga en segundo plano, sin bloquear a nadie.

---

### [x] 7. El fracaso del refresh nunca llega al auth store: sesión muerta deja la app clavada en 'authenticated'

**Severidad:** Media · **Área:** Arquitectura · Seguridad · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/api/clubApi.ts:44`

**Qué pasa:** Cuando el refreshToken vence o es revocado con la app abierta, el interceptor rechaza el error (catch de la línea 44-46) pero nadie actualiza el estado: auth.store.ts solo cambia `status` desde sus propias acciones (loginUser/checkAuthStatus/logoutUser) y no hay ningún puente desde la capa API. Escenario concreto: usuario deja la pestaña del portal abierta hasta que expira el refresh → todas las queries devuelven 401, TanStack reintenta (retry: 1) y falla, los guards no redirigen porque el store sigue en 'authenticated', y el usuario queda mirando toasts de error y skeletons rotos hasta que recarga a mano. checkAuthStatus solo corre una vez en el mount de CheckAuthProvider, así que nada re-verifica la sesión.

**Evidencia:**

```
        try {
            refreshPromise ??= clubApi.post('/auth/refresh').finally(() => {
                refreshPromise = null
            })
            await refreshPromise
            return clubApi(request)
        } catch {
            return Promise.reject(error)
        }
// auth.store.ts: status solo muta dentro de loginUser/checkAuthStatus/logoutUser; grep de useAuthStore en src/api => sin resultados
```

**Fix propuesto:** Notificar el logout desde el interceptor sin crear el ciclo clubApi → auth.store → actions → clubApi: en el catch del refresh, disparar un callback inyectable o un CustomEvent (`window.dispatchEvent(new Event('auth:session-expired'))`) y suscribirse en auth.store (o en ClubAlianzaApp) para hacer `useAuthStore.setState({ status: 'not-authenticated', user: null })`. Con eso los guards redirigen a /ingresar con `state.from` y el usuario retoma donde estaba tras loguearse.

> **Verificación cruzada:** Verificado: el catch del interceptor (clubApi.ts:44-46) solo rechaza; no hay useAuthStore en src/api, ni evento de sesión expirada, ni onError global en el QueryClient (solo retry:1 y refetchOnWindowFocus:false); status solo muta en las tres acciones del store y checkAuthStatus corre una única vez en el mount. La app queda en 'authenticated' con todo fallando en 401. Ajusto a medium: es un bug de robustez/UX recuperable con F5 (la recarga re-verifica y redirige al login), sin pérdida de datos ni impacto de seguridad.

---

### [x] 8. Aprobar/rechazar un pago no invalida 'admin-members': listado y detalle del socio muestran vencimiento y estado viejos

**Severidad:** Media · **Área:** Datos · **Estado:** Confirmado con matices
**Archivo:** `src/admin/hooks/useAdminPayments.ts:21`

**Qué pasa:** El propio código documenta que aprobar un pago 'actualiza el vencimiento del socio' (src/admin/actions/payments.actions.ts línea 13) y el toast de PaymentsPage.tsx línea 41 dice 'Se actualizó el vencimiento del socio', pero useInvalidatePayments solo invalida ['admin-payments'] y ['admin-dashboard']. MembersListPage muestra expirationDate e isActive (columnas 'Vencimiento' y 'Estado', líneas 136-143) con staleTime de 30s, y MemberDetailPage usa [MEMBERS_KEY, 'detail', id]. Flujo real de tesorería: aprueba el pago de un socio moroso, va a Socios para verificar, y el socio sigue figurando 'Vencido' con la fecha vieja.

**Evidencia:**

```
const useInvalidatePayments = () => {
    const queryClient = useQueryClient()
    return () => {
        void queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] })
        // Aprobar/rechazar cambia los números del dashboard (pendientes, ingresos).
        void queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    }
}
```

**Fix propuesto:** Agregar la invalidación del listado/detalle de socios en useInvalidatePayments:

```
void queryClient.invalidateQueries({ queryKey: ['admin-members'] })

Como la key de detalle es ['admin-members', 'detail', id], la invalidación por prefijo cubre lista y detalle a la vez.
```

> **Verificación cruzada:** La invalidación faltante es real (useAdminPayments.ts:21-28 solo invalida 'admin-payments' y 'admin-dashboard', y el backend sí actualiza el vencimiento según payments.actions.ts:13 y el toast de PaymentsPage:41). Pero el impacto está sobredimensionado: useMember (detalle) no define staleTime, por lo que MemberDetailPage refetchea en cada mount y muestra datos frescos; y el listado solo muestra datos viejos si fue fetcheado hace menos de 30s (staleTime). El flujo descripto (aprobar y navegar a Socios) normalmente dispara un fetch fresco al montar; el bug solo aparece alternando Pagos/Socios dentro de la ventana de 30s. Gap de coherencia de caché real pero acotado y auto-corregible.

---

### [x] 9. Los dialogs de edición no resetean el form al cerrar: reabrir muestra datos sucios del intento anterior

**Severidad:** Media · **Área:** Formularios · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/admin/components/MemberFormDialog.tsx:82`

**Qué pasa:** MemberFormDialog, EventFormDialog, MilestoneFormDialog y BoardMemberFormDialog viven montados permanentemente (por fila en AdminEventsPage/AdminInstitutionalPage, y en MemberDetailPage:89). useForm captura defaultValues del registro una sola vez al montar y onOpenChange={setIsOpen} no hace reset. Consecuencias concretas: (a) el admin abre 'Editar socio', modifica el DNI, cierra sin guardar, reabre: ve el DNI modificado como si fuera el real; (b) tras guardar, si el backend normaliza datos (trim, formato de fecha), el form queda con lo tipeado, no con lo persistido, porque defaultValues nunca se sincroniza con el prop `member` actualizado por el refetch. form.reset() solo se llama en la rama de alta (línea 73).

**Evidencia:**

```
const [isOpen, setIsOpen] = useState(false)
// ...
const form = useForm<CreateMemberSchema>({
    resolver: zodResolver(createMemberSchema) as Resolver<CreateMemberSchema>,
    defaultValues: { email: member?.email ?? '', ... },
})
// ...
<Dialog open={isOpen} onOpenChange={setIsOpen}>
```

**Fix propuesto:** Dos cambios: (1) usar la opción `values` de useForm (en vez de `defaultValues`) para que el form siga al prop: `values: { email: member?.email ?? '', name: member?.name ?? '', ... }`; (2) resetear al cerrar: `onOpenChange={(open) => { setIsOpen(open); if (!open) form.reset() }}`. Aplicar el mismo patrón en EventFormDialog.tsx:92, MilestoneFormDialog.tsx:74 y BoardMemberFormDialog.tsx:71.

> **Verificación cruzada:** Verificado en los cuatro dialogs (MemberFormDialog:36/43-58/73/82, EventFormDialog:52/61-71/82/92, MilestoneFormDialog:41/48-55/65/74, BoardMemberFormDialog:38/45-52/62/71): el componente dueño del useForm queda montado permanentemente (por fila en AdminEventsPage:111 y AdminInstitutionalPage:63/138, y en MemberDetailPage:89), defaultValues se captura una sola vez, onOpenChange={setIsOpen} no resetea y form.reset() solo existe en la rama de alta. RHF retiene los valores al desmontar el DialogContent (shouldUnregister false por defecto), así que reabrir muestra lo tipeado como si fuera real. Bajo la severidad a medium: el daño requiere que el admin reabra y confíe/guarde; no hay corrupción automática de datos.

---

### [x] 10. EventFormDialog/UploadImageDialog: un archivo rechazado por tamaño queda visible en el input y puede subirse un archivo viejo equivocado

**Severidad:** Media · **Área:** Formularios · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/admin/components/EventFormDialog.tsx:220`

**Qué pasa:** Cuando el archivo supera 5MB se muestra un toast y se hace `return` sin limpiar `fileEvent.target.value`: el input nativo sigue mostrando el nombre del archivo rechazado mientras el estado `file` quedó en null (o peor: en el archivo VÁLIDO elegido antes). Escenario concreto: el admin elige foto-A válida, se arrepiente y elige foto-B de 8MB → el input muestra 'foto-B', pero el submit sube foto-A. En UploadImageDialog (líneas 100-107, mismo código) además la imagen obligatoria se valida con un toast dentro de onSubmit (líneas 56-59) en vez de estar en el schema, así que no hay error de campo ni aria-invalid. En ambos, el FormLabel del archivo está fuera de FormField/FormItem (EventFormDialog:213, UploadImageDialog:95), por lo que useFormField genera htmlFor='undefined-form-item': el label no queda asociado al input.

**Evidencia:**

```
onChange={(fileEvent) => {
    const selected = fileEvent.target.files?.[0] ?? null
    if (selected && selected.size > MAX_IMAGE_SIZE) {
        toast.error('La imagen no puede superar los 5MB')
        return
    }
    setFile(selected)
}}
```

**Fix propuesto:** Replicar el patrón correcto que ya existe en UploadPaymentDialog.tsx:26-32: meter el archivo en el schema con `z.instanceof(File).refine(f => f.size <= MAX, ...).refine(f => TYPES.includes(f.type), ...)` (con `.optional()` en EventFormDialog) y renderizarlo como FormField con FormControl + FormMessage, lo que arregla a la vez el estado inconsistente, el error visible en el campo y la asociación label/input. Como mínimo, agregar `fileEvent.target.value = ''` antes del return y `setFile(null)` al rechazar.

> **Verificación cruzada:** Todo verificado: en EventFormDialog:218-225 y UploadImageDialog:100-107 el rechazo por tamaño hace return sin limpiar target.value ni el estado, dejando el input mostrando el archivo rechazado mientras `file` conserva la selección anterior (escenario foto-A/foto-B real). La validación por toast en onSubmit de UploadImageDialog:56-59 y el FormLabel fuera de FormField (EventFormDialog:213, UploadImageDialog:95) también se confirman: en form.tsx los contextos default son objetos vacíos truthy, no lanza error, y htmlFor queda 'undefined-form-item'. Bajo a medium: el escenario de subir el archivo equivocado exige una secuencia puntual (elegir válido y después uno oversize) y es tooling admin; el resto es confusión de UI y a11y menor.

---

### [x] 11. Logo PNG de 247 kB renderizado a 44px en el header de todas las páginas

**Severidad:** Media · **Área:** Performance · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/components/custom/ClubLogo.tsx:1`

**Qué pasa:** ClubLogo importa logo-no-bg-alianza.png (247.088 bytes, ~500px) y lo muestra en un contenedor size-11 (44px). Es el asset individual más pesado del build (más que el JS gzip del hero) y se descarga en header, footer, sidebars y credencial — o sea, en el primer paint de cualquier página. Además public/logo-alianza.png (otros 247 kB, mismo archivo) es el favicon declarado en index.html línea 5: los navegadores lo bajan entero en la primera visita.

**Evidencia:**

```
import crest from '@/assets/logo-no-bg-alianza.png'
// build: dist/assets/logo-no-bg-alianza-7l7eSOQq.png  247.09 kB
// index.html: <link rel="icon" type="image/png" href="/logo-alianza.png" /> (247 kB)
```

**Fix propuesto:** Reexportar el escudo a ~96px (2x del tamaño de render) en WebP o, mejor, como SVG: debería quedar en menos de 10 kB. Para el favicon, generar un PNG de 32-48px (más un apple-touch-icon de 180px), no reutilizar el archivo de 500px. Ahorro directo: ~480 kB en la primera visita.

> **Verificación cruzada:** Hechos exactos: logo-no-bg-alianza.png pesa 247.088 bytes y mide 500x500, se renderiza en un contenedor size-11 (44px) y se usa en header, footer, ambos sidebars, AuthLayout y la credencial; public/logo-alianza.png (mismos 247.088 bytes) es el favicon en index.html:5. Ahorro potencial ~480 kB real. Ajusto a medium: a diferencia del bundle JS, las imágenes no bloquean la interactividad (carga async, favicon diferido), el navegador las cachea tras la primera visita, y el costo es ancho de banda más que tiempo de bloqueo.

---

### [x] 12. Query keys duplicadas como strings mágicos entre features: la invalidación admin→público es frágil y sin chequeo de tipos

**Severidad:** Media · **Área:** Arquitectura · Datos · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/admin/hooks/useAdminEvents.ts:16`

> Señalado de forma independiente por 2 revisores — fusionado acá.

**Qué pasa:** Las mutaciones de admin invalidan las caches públicas re-tipeando los literales: useAdminEvents.ts invalida ['events'], ['event-categories'] y ['admin-dashboard'], y useAdminGallery.ts:13-14 invalida ['gallery'] y ['gallery-categories']; pero esas keys se definen en otros archivos de otras features (events/hooks/useEvents.ts:7, events/hooks/useEventCategories.ts, gallery/hooks/useGallery.ts:7 y 16, admin/hooks/useDashboard.ts:6). Lo mismo pasa con 'admin-dashboard' re-tipeado en useAdminPayments.ts:26. Si alguien renombra la key en el hook público, la invalidación de admin deja de funcionar en silencio: no hay error de compilación, solo datos stale. La convención además es inconsistente: members y payments SÍ exportan constantes (PROFILE_QUERY_KEY en useProfile.ts:5, MY_PAYMENTS_QUERY_KEY en useMyPayments.ts) mientras el resto usa literales inline.

**Evidencia:**

```
const useInvalidateEvents = () => {
    const queryClient = useQueryClient()
    return () => {
        void queryClient.invalidateQueries({ queryKey: ['events'] })
        void queryClient.invalidateQueries({ queryKey: ['event-categories'] })
        void queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    }
}
// vs events/hooks/useEvents.ts:7 → queryKey: ['events', query]
```

**Fix propuesto:** Unificar en constantes exportadas por la feature dueña de la key (el patrón que ya existe con PROFILE_QUERY_KEY) o, mejor, un módulo `src/api/queryKeys.ts` con factories: `export const eventKeys = { all: ['events'] as const, list: (q: EventsQuery) => ['events', q] as const }`. Los hooks públicos y las invalidaciones de admin consumen la misma referencia y el rename pasa a ser un error de compilación.

> **Verificación cruzada:** Todas las referencias verificadas línea por línea: useAdminEvents.ts:16-18 y useAdminGallery.ts:13-14 re-tipean literales cuyas keys dueñas viven en useEvents.ts:7, useEventCategories.ts:6, useGallery.ts:7/16 y useDashboard.ts:6; useAdminPayments.ts:26 re-tipea 'admin-dashboard'. La inconsistencia con las constantes exportadas PROFILE_QUERY_KEY y MY_PAYMENTS_QUERY_KEY también es real. El modo de falla (rename silencioso → datos stale sin error de compilación) es correcto. Medium es apropiado.

---

### [x] 13. El patrón actions→hooks→pages se rompe en el lado de escritura: componentes de members/payments/contact llaman actions con useMutation inline

**Severidad:** Media · **Área:** Arquitectura · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/payments/components/UploadPaymentDialog.tsx:50`

**Qué pasa:** Admin sigue el patrón declarado de forma consistente (useMembers, useAdminPayments, useAdminEvents, useAdminGallery encapsulan mutación + invalidación). Pero en las features del socio la capa de hooks solo existe para lecturas: ProfileForm.tsx:62-69, UploadPaymentDialog.tsx:50-63, DocumentUpload.tsx:28, EmailChangeCard.tsx:30, ProfilePhotoUpload.tsx:21 y ContactPage.tsx:47 arman useMutation directamente en el componente, importando la action y las query keys que hay que invalidar. La consecuencia concreta es que la política de cache queda desparramada en la UI: UploadPaymentDialog tiene que saber que un pago afecta MY_PAYMENTS_QUERY_KEY y además PROFILE_QUERY_KEY de otra feature; si mañana un pago aprobado también afecta la credencial, hay que cazar componentes en vez de tocar un hook.

**Evidencia:**

```
// UploadPaymentDialog.tsx (componente de UI decidiendo invalidación cross-feature)
const { mutate, isPending } = useMutation({
    mutationFn: createPaymentAction,
    onSuccess: () => {
        toast.success('Comprobante enviado. Queda pendiente de aprobación.')
        void queryClient.invalidateQueries({ queryKey: MY_PAYMENTS_QUERY_KEY })
        void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
        ...
```

**Fix propuesto:** Espejar el patrón de admin en las features del socio: `useCreatePayment()` en payments/hooks/useMyPayments.ts y `useUpdateProfile()`, `useUploadProfilePicture()`, `useUploadDocument()` en members/hooks/useProfile.ts, cada uno con su invalidación adentro. Los componentes quedan con `const { mutate, isPending } = useCreatePayment()` y los toasts/reset de formulario como callbacks locales. Esto además resuelve la mitad del acoplamiento payments→members del hallazgo siguiente.

> **Verificación cruzada:** Las seis ubicaciones citadas verificadas por grep (ProfileForm.tsx:62, UploadPaymentDialog.tsx:50, DocumentUpload.tsx:28, EmailChangeCard.tsx:30, ProfilePhotoUpload.tsx:21, ContactPage.tsx:47) y los seis hooks de admin sí encapsulan mutación+invalidación de forma uniforme. La consecuencia concreta (UploadPaymentDialog decidiendo invalidación cross-feature) es real. Única salvedad trivial: el patrón no está 'declarado' en ningún doc (no hay CLAUDE.md y el README no lo menciona); es convención de facto por estructura, lo cual no cambia la sustancia.

---

### [x] 14. El polling del bulk import silencia sus errores y nunca corta: si falla, la UI queda en 'Procesando…' para siempre

**Severidad:** Media · **Área:** Datos · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/admin/hooks/useBulkImport.ts:29`

**Qué pasa:** El hook expone solo error: startMutation.error (línea 65); statusQuery.error se descarta. El refetchInterval devuelve 1500 siempre que data?.status !== 'done', incluyendo cuando la query está en estado de error (data queda undefined o congelada en el último valor). Si el polling falla de forma persistente (500 del backend, sesión vencida con refresh muerto, red caída), el diálogo muestra 'Procesando…' con la barra congelada sin ningún mensaje (BulkImportDialog.tsx línea 120), isProcessing queda true para siempre, y el polling sigue pegándole al backend cada 1.5s indefinidamente —incluso con la pestaña en background, porque refetchIntervalInBackground: true— mientras MembersListPage esté montada.

**Evidencia:**

```
refetchInterval: (query) => {
    const data = query.state.data as MemberImportJob | undefined
    return data?.status === 'done' ? false : 1500
},
...
return {
    ...
    error: startMutation.error,
}
```

**Fix propuesto:** Cortar el intervalo cuando la query acumula errores y exponer el error del polling:

```
refetchInterval: (query) => {
    if (query.state.status === 'error') return false
    const data = query.state.data as MemberImportJob | undefined
    return data?.status === 'done' ? false : 1500
},

y en el return del hook: error: startMutation.error ?? statusQuery.error, para que BulkImportDialog pueda mostrarlo.
```

> **Verificación cruzada:** Verificado en useBulkImport.ts: refetchInterval (líneas 29-32) devuelve 1500 salvo status==='done' — React Query sigue el intervalo aunque la query esté en error, y con data congelada/undefined nunca corta. El hook solo expone startMutation.error (línea 65) y BulkImportDialog.tsx fase 2 (línea 120) no tiene ningún render de error: muestra 'Procesando…' indefinidamente con isProcessing=true. refetchIntervalInBackground:true (línea 36) confirma el polling en background. Requiere fallo persistente del backend/red para manifestarse, pero cuando ocurre el cuadro es exactamente el descrito. Media es correcta.

---

### [x] 15. Editar el perfil no invalida 'member-credential': la credencial muestra nombre/apellido/DNI viejos

**Severidad:** Media · **Área:** Datos · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/members/components/ProfileForm.tsx:62`

**Qué pasa:** La interfaz Credential incluye name, surname y dni (src/members/interfaces/Credential.ts líneas 4-6) y useCredential tiene staleTime de 5 minutos. ProfileForm actualiza name/surname/dni pero su onSuccess solo hace setQueryData del perfil, sin tocar ['member-credential']. El socio corrige su nombre, va a 'Tu credencial' y ve —y descarga como PNG— la credencial con los datos anteriores. ProfilePhotoUpload.tsx línea 26 sí invalida la credencial al cambiar la foto por exactamente este motivo ('La credencial muestra la misma foto: si no se invalida, queda la vieja'), así que la omisión en ProfileForm es una inconsistencia clara.

**Evidencia:**

```
const { mutate, isPending } = useMutation({
    mutationFn: updateProfileAction,
    onSuccess: (updated) => {
        queryClient.setQueryData(PROFILE_QUERY_KEY, updated)
        toast.success('Perfil actualizado')
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos guardar los cambios')),
})
```

**Fix propuesto:** En el onSuccess de ProfileForm, replicar lo que ya hace ProfilePhotoUpload:

```
onSuccess: (updated) => {
    queryClient.setQueryData(PROFILE_QUERY_KEY, updated)
    void queryClient.invalidateQueries({ queryKey: ['member-credential'] })
    toast.success('Perfil actualizado')
},
```

> **Verificación cruzada:** Verificado: el onSuccess de ProfileForm (líneas 62-69) solo hace setQueryData del perfil; Credential incluye name/surname/dni (Credential.ts:4-6); useCredential tiene staleTime de 5 min (useProfile.ts:19); y ProfilePhotoUpload.tsx:26 sí invalida ['member-credential'] con un comentario que documenta exactamente este motivo. Durante hasta 5 minutos el socio ve —y puede descargar como PNG— la credencial con datos de identidad viejos. Inconsistencia clara con el patrón ya establecido en el propio código. Media es correcta.

---

### [x] 16. Tokens de reset-password / verify-email / email-change quedan en la URL y el historial del navegador

**Severidad:** Media · **Área:** Seguridad · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/auth/pages/reset-password/ResetPasswordPage.tsx:26`

**Qué pasa:** Las tres páginas de aterrizaje de mails leen `?token=` de la URL y nunca lo remueven con history.replaceState. El caso más sensible es ResetPasswordPage: el token permite tomar la cuenta (setear contraseña nueva) y puede quedar sin consumir si el usuario abre el link y no completa el formulario — queda vigente en el historial local, en el historial sincronizado del navegador (Chrome/Firefox sync) y visible para cualquiera en una máquina compartida. Lo mismo aplica a VerifyEmailPage.tsx:17 y ConfirmEmailChangePage.tsx:15 (menos graves porque el token se consume al montar). El token también queda copiado en el queryKey del cache de React Query, aunque eso es solo en memoria.

**Evidencia:**

```
const [searchParams] = useSearchParams()
const navigate = useNavigate()
const token = searchParams.get('token') ?? ''
```

**Fix propuesto:** Capturar el token una sola vez al montar y limpiarlo de la barra de direcciones: `const [token] = useState(() => new URLSearchParams(window.location.search).get('token') ?? ''); useEffect(() => { if (token) window.history.replaceState(null, '', window.location.pathname) }, [token])`. Aplicar el mismo patrón en VerifyEmailPage y ConfirmEmailChangePage. Complementariamente, agregar `<meta name="referrer" content="same-origin">` en index.html para que el token jamás viaje en el Referer hacia fonts.googleapis.com u otro recurso externo.

> **Verificación cruzada:** Verificado: las tres páginas (ResetPasswordPage.tsx:26, VerifyEmailPage.tsx:17, ConfirmEmailChangePage.tsx:15) leen ?token= y ninguna hace history.replaceState. El caso de reset es el más serio: si el usuario no completa el formulario, el token queda vigente en historial local/sincronizado. La descripción es precisa y ya matiza correctamente que verify/confirm consumen el token al montar. Único matiz menor: el riesgo de fuga vía Referer hacia fonts.googleapis.com (mencionado solo en la recomendación) está mitigado por la política default strict-origin-when-cross-origin de los browsers modernos — el meta referrer es defensa en profundidad, no una fuga activa. Media es correcta.

---

### [x] 17. Reglas de validación duplicadas a mano en 4 lugares, y la copia del socio es más débil que la del admin

**Severidad:** Media · **Área:** Tipos · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/members/components/ProfileForm.tsx:24`

> Señalado de forma independiente por 2 revisores — fusionado acá.

**Qué pasa:** El profileSchema inline de ProfileForm duplica name/surname (min 2/max 25) y el regex de DNI de src/admin/schemas/member.schema.ts:5-17, pero con reglas más flojas: phone y address son `z.string().optional()` sin max, mientras el schema admin (que espeja el DTO del backend) limita phone a 30 y address a 120 — un socio que escriba un teléfono de 40 caracteres recibe un 400 crudo del backend en vez del mensaje inline. La regla de password también está duplicada con dos implementaciones distintas: register.schema.ts:19-26 (4 regex separados) vs staff.schema.ts:14-23 (1 regex combinado con lista de símbolos distinta: `[@$!%*?&#]` vs `[\W_]` — '(' o '-' pasan en registro pero fallan en alta de staff).

**Evidencia:**

```
// ProfileForm.tsx (inline, sin max):
phone: z.string().optional(),
address: z.string().optional(),
// member.schema.ts (admin, mismo backend):
phone: z.string().max(30).or(z.literal('')),
address: z.string().max(120).or(z.literal('')),
```

**Fix propuesto:** Extraer las reglas compartidas a un módulo único (p.ej. src/shared/schemas/fields.ts): `personNameField`, `dniField`, `phoneField`, `addressField`, `passwordField`, y componer los schemas de auth/admin/members desde ahí. Elegir UNA definición de password (la del backend) y borrar la otra.

> **Verificación cruzada:** Todo verificado: ProfileForm.tsx:24-35 duplica name/surname/dni de member.schema.ts con phone/address sin max (vs max 30/120 del admin), y la password tiene dos implementaciones divergentes — register.schema.ts:26/:51 acepta cualquier [\W_] mientras staff.schema.ts:20 exige la lista cerrada [@$!%*?&#] ('(' o '-' pasan en registro y fallan en staff). La divergencia ya ocurrió en dos frentes, lo que valida el riesgo de la duplicación. Medium es adecuado como hallazgo de mantenibilidad con consecuencia visible al usuario.

---

### [x] 18. Doble cast en MemberFormDialog: `as Resolver<...>` y un payload casteado al tipo equivocado

**Severidad:** Media · **Área:** Tipos · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/admin/components/MemberFormDialog.tsx:71`

**Qué pasa:** Dos aserciones encadenadas tapan el tipado real del submit. (1) Línea 46: `zodResolver(createMemberSchema) as Resolver<CreateMemberSchema>` suprime el chequeo del resolver en lugar de dejar que useForm infiera. (2) Línea 71: el objeto `{ email: values.email, ...cleanPayload(values) }` se castea `as CreateMemberSchema` — el tipo del SCHEMA del form, no del payload de la API — porque el spread de `email?: string` de cleanPayload ensucia el tipo. El cast fabrica campos requeridos que cleanPayload puede haber filtrado y solo compila porque CreateMemberSchema es casualmente asignable a CreateMemberPayload; si mañana el schema y el payload divergen, el cast lo oculta.

**Evidencia:**

```
await createMutation.mutateAsync({
    email: values.email,
    ...cleanPayload(values),
} as CreateMemberSchema)
```

**Fix propuesto:** Tipar cleanPayload para que el problema no exista: `const cleanPayload = (values: CreateMemberSchema): CreateMemberPayload => { const { email, ...rest } = values; return { email, ...Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== '')) } }` y llamar `mutateAsync(cleanPayload(values))` sin cast. Para el resolver, quitar el `as Resolver<...>` y dejar `useForm({ resolver: zodResolver(createMemberSchema) })` con inferencia (o `useForm<z.input<typeof createMemberSchema>>`).

> **Verificación cruzada:** Ambos casts existen tal cual: línea 46 `as Resolver<CreateMemberSchema>` y líneas 68-71 el objeto casteado `as CreateMemberSchema` (tipo del schema, todos los campos required) cuando createMemberAction espera CreateMemberPayload (opcionales). cleanPayload filtra los '' así que el cast efectivamente fabrica campos que pueden no estar, y solo compila porque required-string es asignable a optional-string. No hay bug en runtime hoy, pero la descripción lo presenta explícitamente como riesgo latente, sin exagerar.

---

### [x] 19. Regla de contraseña inconsistente: register/reset aceptan cualquier símbolo, staff solo [@$!%*?&#]

**Severidad:** Media · **Área:** Formularios · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/admin/schemas/staff.schema.ts:20`

**Qué pasa:** Ambos schemas dicen en comentarios replicar 'las mismas reglas que el backend', pero validan distinto el mismo requisito: register.schema.ts:26 y :51 usan `/(?=.*[\W_])/` (cualquier no-alfanumérico) mientras staff.schema.ts usa `[@$!%*?&#]` (lista cerrada). Una contraseña como 'Abc123.' o 'Abc123+' pasa el form de registro/reset pero no el de staff. Uno de los dos no coincide con el backend: si el backend usa la lista cerrada, el registro público acepta contraseñas que devuelven 400 con toast genérico después de enviar (exactamente lo que el comentario del schema dice querer evitar); si usa `\W_`, el alta de staff rechaza contraseñas válidas. El mensaje de staff tampoco dice qué símbolos se aceptan.

**Evidencia:**

```
// staff.schema.ts
.regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).+$/,
    'Debe tener mayúscula, minúscula, número y símbolo',
)
// register.schema.ts:26
.regex(/(?=.*[\W_])/, 'Debe tener al menos un carácter especial')
```

**Fix propuesto:** Extraer una única `passwordSchema` compartida (p.ej. src/auth/schemas/password.schema.ts) que copie exactamente la regex del DTO del backend, y reutilizarla en registerSchema, resetPasswordSchema y createStaffSchema. Si la lista de símbolos es cerrada, incluirla en el mensaje: 'Debe tener al menos un símbolo (@$!%*?&#)'.

> **Verificación cruzada:** Las dos regex son exactamente las citadas y ambos archivos dicen en comentarios espejar al backend, así que al menos uno miente si el backend tiene una sola política ('Abc123.' pasa registro/reset y falla staff). El impacto concreto (400 post-submit en registro público, o rechazo de contraseñas válidas en staff) es condicional al backend —no verificable desde este repo— pero el hallazgo presenta ambas ramas honestamente y la inconsistencia frontend es un hecho.

---

### [x] 20. Los errores del servidor nunca se mapean al campo con setError: siempre toast genérico, y los mensajes del backend se muestran en crudo

**Severidad:** Media · **Área:** Formularios · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/auth/pages/register/RegisterPage.tsx:28`

**Qué pasa:** En todos los forms el error de servidor termina en `toast.error(getApiErrorMessage(...))`; ningún form usa `form.setError`. Casos concretos donde el error es de un campo identificable: email ya registrado en RegisterPage (409/400), DNI duplicado en ProfileForm (el propio comentario en ProfileForm.tsx:46 documenta que el backend devuelve 409), email duplicado en MemberFormDialog/StaffFormDialog. El usuario ve un toast que desaparece y el campo culpable queda sin marcar (sin aria-invalid ni FormMessage). Agravante: getApiErrorMessage (clubApi.ts:63-71) pasa el `message` del backend tal cual y une arrays con join(', '); los mensajes por defecto de class-validator de NestJS están en inglés, así que un 400 no anticipado rompe la UX 100% en español del resto de la app.

**Evidencia:**

```
onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos crear tu cuenta')),
```

**Fix propuesto:** En los forms con campos con unicidad, mapear el status al campo: `onError: (error) => { if (axios.isAxiosError(error) && error.response?.status === 409) { form.setError('email', { message: 'Ese email ya está registrado' }); return } toast.error(...) }`. Para ProfileForm, mapear el 409 de DNI a `form.setError('dni', ...)`. Mantener el toast solo para errores no atribuibles a un campo.

---

### [x] 21. El campo 'Hora' de EventFormDialog es texto libre con min(1): acepta cualquier string como hora

**Severidad:** Media · **Área:** Formularios · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/admin/components/EventFormDialog.tsx:39`

**Qué pasa:** El schema valida `time: z.string().min(1, 'Ingresá la hora')` y el input es un `<Input placeholder="16:00" />` de texto libre (línea 163). 'a las 4', '25:99' o 'tarde' pasan la validación y llegan al backend/al listado público de eventos tal cual. Todos los demás campos temporales del proyecto usan inputs nativos tipados (type=date en fecha del mismo form, type=month en UploadPaymentDialog), este es el único que quedó sin formato garantizado.

**Evidencia:**

```
time: z.string().min(1, 'Ingresá la hora'),
// ...
<Input placeholder="16:00" {...field} />
```

**Fix propuesto:** Usar `<Input type="time" {...field} />` (devuelve HH:mm nativo) y reforzar el schema: `time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM')`.

---

### [x] 22. html-to-image importado estáticamente cuando solo se usa al hacer clic en Descargar

**Severidad:** Media · **Área:** Performance · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/members/pages/CredentialPage.tsx:3`

**Qué pasa:** toPng solo se ejecuta dentro del handler downloadPng (línea 22), un evento que muchos socios nunca disparan, pero el import estático mete html-to-image en el bundle que carga con la página (hoy, en el bundle global de 872 kB; incluso con code splitting por ruta quedaría en el chunk del portal de socio). qrcode en CredentialCard.tsx línea 2 sí se necesita en el render, así que con el split por ruta alcanza para ese.

**Evidencia:**

```
import { toPng } from 'html-to-image'
...
    const downloadPng = async () => {
        if (!cardRef.current) return
        ...
        const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 })
```

**Fix propuesto:** Importarlo en el momento del clic: dentro de downloadPng, `const { toPng } = await import('html-to-image')`. Vite genera un chunk aparte que solo baja quien realmente descarga la credencial; el estado isDownloading ya cubre el delay de red.

---

### [x] 23. Dependencias muertas: react-helmet-async se bundlea sin usarse y react-table está declarada pero jamás importada

**Severidad:** Media · **Área:** Performance · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/ClubAlianzaApp.tsx:3`

**Qué pasa:** HelmetProvider envuelve toda la app pero no existe un solo <Helmet> en src/ (grep de 'Helmet' solo devuelve estas líneas): react-helmet-async y su runtime entran al bundle inicial sin aportar nada — ni siquiera se está haciendo el SEO por página que justificaría la lib. Aparte, @tanstack/react-table figura en package.json pero no hay ningún import en src/ (las tablas usan el componente Table de shadcn): no pesa en el bundle, pero es una dependencia que se instala, se audita y confunde (esta auditoría la buscó porque el stack la anuncia).

**Evidencia:**

```
import { HelmetProvider } from 'react-helmet-async'
...
        <HelmetProvider>
// grep 'Helmet' en src/ → solo ClubAlianzaApp.tsx; grep 'react-table|useReactTable' → 0 resultados
```

**Fix propuesto:** Sacar HelmetProvider y desinstalar react-helmet-async (si más adelante se quiere title/meta por ruta, en React 19 alcanza con renderizar <title> nativo en cada página). `npm uninstall @tanstack/react-table` y de paso quitar @types/qrcode si se dinamiza qrcode.

---

### [x] 24. Google Fonts bloqueante con 9 pesos de fuente entre dos familias

**Severidad:** Media · **Área:** Performance · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `index.html:9`

**Qué pasa:** El stylesheet de Google Fonts es CSS render-blocking servido desde un tercer origen (DNS + TLS extra pese a los preconnect) y pide 9 variantes: Hanken Grotesk 400/600/700/800/900 + Inter 400/500/600/700, del orden de 150-200 kB de woff2 en la primera visita. Difícil que la UI use de verdad 5 pesos de la display y 4 de la de texto; cada peso es un archivo y un request más antes de estabilizar el texto (display=swap está, pero el FOUT/reflow crece con cada variante).

**Evidencia:**

```
<link
  href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

**Fix propuesto:** Auditar qué pesos se usan (la UI aparenta usar font-bold/extrabold de Hanken y 400/600 de Inter) y recortar a 4-5 variantes. Mejor aún: self-hostear con @fontsource-variable/hanken-grotesk e importarlas desde index.css — elimina el tercer origen, y Vite las sirve con hash cacheable del mismo dominio.

---

### [x] 25. Esqueleto de form-dialog copiado en 6 componentes de admin

**Severidad:** Media · **Área:** Calidad · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/admin/components/MilestoneFormDialog.tsx:57`

**Qué pasa:** MilestoneFormDialog (57-71), BoardMemberFormDialog (54-68), EventFormDialog (73-89), MemberFormDialog (60-79), StaffFormDialog (43-59) y UploadImageDialog (55-75) repiten literalmente la misma estructura: useState(isOpen), isEdit = !!entity, par createMutation/updateMutation, onSubmit con try { mutateAsync → toast.success → form.reset() → setIsOpen(false) } catch { toast.error(getApiErrorMessage(...)) }, DialogTrigger con fallback <Button variant="hero"><Plus />, y submit con Loader2 + isPending. Además, el bloque FormField→FormItem→FormLabel→FormControl→Input→FormMessage aparece ~30 veces casi idéntico. Cualquier cambio al patrón (p. ej. resetear el form al cerrar en edición, accesibilidad del dialog) obliga a tocar 6 archivos.

**Evidencia:**

```
try {
    if (isEdit) {
        await updateMutation.mutateAsync(values)
        toast.success('Hito actualizado')
    } else {
        await createMutation.mutateAsync(values)
        toast.success('Hito creado')
        form.reset()
    }
    setIsOpen(false)
} catch (error) {
    toast.error(getApiErrorMessage(error, 'No pudimos guardar el hito'))
}
```

**Fix propuesto:** Extraer dos piezas: (1) un <FormDialog title description trigger form onSubmit isPending submitLabel> que encapsule Dialog + estado open + botón submit con spinner + try/catch con toasts (recibiendo successMessage/errorFallback), y (2) un <TextField control name label type placeholder /> que envuelva el bloque FormField repetido. Los 6 dialogs quedan reducidos a su schema + campos. CategoryManagerDialog ya demuestra que este tipo de extracción funciona en el proyecto.

---

### [x] 26. Manejo de errores de mutations duplicado en cada call-site en vez de vivir en los hooks

**Severidad:** Media · **Área:** Calidad · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/admin/pages/AdminEventsPage.tsx:26`

**Qué pasa:** El bloque handleDelete = try { mutateAsync → toast.success } catch { toast.error(getApiErrorMessage(...)) } está copiado carácter por carácter en AdminEventsPage:26-33, AdminGalleryPage:27-34, AdminInstitutionalPage:21-28 y 100-107, y MemberDetailPage:42-50. Como los hooks de mutación (useDeleteEvent, useDeleteImage, etc.) no manejan errores, cada caller nuevo debe acordarse del try/catch; si alguno lo omite, ConfirmDialog no captura el rechazo (su handleConfirm es try/finally sin catch) y el fallo es silencioso + unhandled rejection. Además conviven dos convenciones: mutateAsync + try/catch en el componente (admin) vs. mutate + onSuccess/onError en el hook u objeto de mutación (UploadPaymentDialog:50-63, ProfileForm:62-69, DocumentUpload:28-37), y UploadPaymentDialog directamente define useMutation inline en el componente, salteando la capa hooks/ que el resto del proyecto respeta.

**Evidencia:**

```
const handleDelete = async (id: string) => {
    try {
        await deleteMutation.mutateAsync(id)
        toast.success('Evento eliminado')
    } catch (error) {
        toast.error(getApiErrorMessage(error, 'No pudimos eliminar el evento'))
    }
}
```

**Fix propuesto:** Mover los toasts al hook, que ya es el dueño de la invalidación: export const useDeleteEvent = () => useMutation({ mutationFn: deleteEventAction, onSuccess: () => { invalidate(); toast.success('Evento eliminado') }, onError: (e) => toast.error(getApiErrorMessage(e, 'No pudimos eliminar el evento')) }). Los pages quedan en onConfirm={() => deleteMutation.mutateAsync(id)}. Alternativa global: MutationCache con onError por defecto en ClubAlianzaApp. Y mover la mutation inline de UploadPaymentDialog a payments/hooks (useCreatePayment) para respetar el patrón actions → hooks → components.

---

### [x] 27. Paginación pública re-implementada a mano, duplicando el componente Pagination existente

**Severidad:** Media · **Área:** Calidad · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/gallery/pages/GalleryPage.tsx:102`

**Qué pasa:** EventsPage.tsx:74-94 y GalleryPage.tsx:102-122 arman a mano el mismo bloque Anterior / "Página X de Y" / Siguiente en lugar de usar components/custom/Pagination.tsx (que sí usan MembersListPage y AuditPage). La duplicación ya produjo divergencia de comportamiento: EventsPage deshabilita los botones con isPlaceholderData durante el fetch, pero GalleryPage ni siquiera destructura isPlaceholderData — sus botones quedan habilitados mientras carga la página siguiente, permitiendo dobles clics y saltos de página.

**Evidencia:**

```
// GalleryPage.tsx:106 — sin isPlaceholderData:
<Button variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
// EventsPage.tsx:78 — sí lo contempla:
<Button variant="outline" disabled={page <= 1 || isPlaceholderData} ...
```

**Fix propuesto:** Reemplazar ambos bloques por <Pagination meta={meta} onPageChange={setPage} disabled={isPlaceholderData} />. Si el layout centrado es deliberado para el sitio público, agregar una prop align='center' al componente en vez de duplicar el markup.

---

## ⚪ Prioridad baja (28)

Pulido, hardening e inconsistencias menores. Para resolver oportunísticamente al tocar cada archivo.

### [x] 28. Dependencia circular entre features members ⇄ payments

**Severidad:** Baja · **Área:** Arquitectura · Calidad · **Estado:** Confirmado con matices
**Archivo:** `src/payments/components/UploadPaymentDialog.tsx:16`

**Qué pasa:** payments importa de members (UploadPaymentDialog.tsx:16 trae PROFILE_QUERY_KEY de @/members/hooks/useProfile) y members importa de payments (AccountPage.tsx importa useMyPayments y PaymentStatusBadge de @/payments). Es el único ciclo entre features del proyecto — los imports de admin hacia events/gallery/institutional/payments son unidireccionales y deliberados (admin extiende los tipos públicos, p. ej. AdminPayment extends Payment, lo cual está bien). El ciclo hoy no rompe el build, pero significa que ninguna de las dos features se puede entender, testear ni mover sin la otra, y es exactamente el tipo de acoplamiento que crece silenciosamente: el próximo dev ve el precedente y agrega otro import cruzado.

**Evidencia:**

```
// payments/components/UploadPaymentDialog.tsx:16
import { PROFILE_QUERY_KEY } from '@/members/hooks/useProfile'
// members/pages/AccountPage.tsx
import { PaymentStatusBadge } from '@/payments/components/PaymentStatusBadge'
import { useMyPayments } from '@/payments/hooks/useMyPayments'
```

**Fix propuesto:** Romper la dirección payments→members, que es la débil: si las query keys se centralizan (hallazgo de queryKeys) o la mutación se mueve a un hook `useCreatePayment` que invalide por prefijo compartido, UploadPaymentDialog deja de conocer a members. La dirección members→payments (AccountPage compone la UI de pagos en el portal) es composición legítima de páginas y puede quedarse. Regla a futuro verificable con eslint (import/no-restricted-paths o boundaries): las features solo importan de sí mismas y de shared/components/lib/constants/api.

> **Verificación cruzada:** Los imports existen tal cual (UploadPaymentDialog.tsx:16 trae PROFILE_QUERY_KEY de members; AccountPage.tsx:17-18 trae useMyPayments y PaymentStatusBadge de payments) y, revisado todo el árbol de imports cross-feature, es efectivamente el único par bidireccional. Pero la dirección payments→members es una sola constante de query key, no hay ciclo a nivel archivo ni riesgo de build, y la afirmación de que 'ninguna de las dos features se puede entender, testear ni mover sin la otra' exagera un acoplamiento de esa magnitud. Válido como observación de arquitectura con fix barato, pero a severidad low.

---

### [x] 29. Alta/edición/baja de socios y bulk import no invalidan 'admin-dashboard'

**Severidad:** Baja · **Área:** Datos · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/admin/hooks/useMembers.ts:32`

**Qué pasa:** El dashboard muestra totalMembers y activeMembers (DashboardPage.tsx líneas 32-43) con staleTime de 60s. useInvalidateMembers solo invalida ['admin-members'], y useBulkImport (src/admin/hooks/useBulkImport.ts líneas 52-56) también invalida solo ['admin-members'] al terminar un import de ~3500 filas. Tras crear/eliminar un socio (que cambia totalMembers) o importar el padrón completo, el admin que vuelve al dashboard ve los contadores viejos. Es inconsistente con el resto del código: useAdminEvents.ts línea 18 y useAdminPayments.ts línea 26 sí invalidan ['admin-dashboard'] por el mismo motivo.

**Evidencia:**

```
/** Invalida todos los listados de socios tras una alta/edición/baja. */
const useInvalidateMembers = () => {
    const queryClient = useQueryClient()
    return () => queryClient.invalidateQueries({ queryKey: [MEMBERS_KEY] })
}
```

**Fix propuesto:** En useInvalidateMembers y en el useEffect de useBulkImport (línea 52), invalidar también el dashboard:

```
return () => {
    void queryClient.invalidateQueries({ queryKey: [MEMBERS_KEY] })
    void queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
}
```

> **Verificación cruzada:** Verificado: useInvalidateMembers (useMembers.ts:32-35) y el useEffect de useBulkImport (línea 54) solo invalidan ['admin-members'], mientras useAdminEvents.ts:18 y useAdminPayments.ts:26 sí invalidan ['admin-dashboard'] (key confirmada en useDashboard.ts:6, staleTime 60s). La inconsistencia es real, pero el impacto está acotado: con refetchOnMount por defecto y staleTime de 60s, el dashboard se refresca solo al remontarse pasado ese minuto — los contadores viejos duran como máximo ~60s y se autocorrigen. Severidad baja, no media. (Nota: el path real del dashboard es src/admin/pages/DashboardPage.tsx, no pages/dashboard/.)

---

### [x] 30. retry global reintenta errores 4xx: un 401 con sesión muerta genera hasta 4 requests y los 404 demoran el estado de error

**Severidad:** Baja · **Área:** Datos · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/ClubAlianzaApp.tsx:15`

**Qué pasa:** retry: 1 se aplica a cualquier error, sin discriminar status. Combinado con el interceptor de refresh de clubApi.ts: una query que da 401 con refresh token vencido dispara request → POST /auth/refresh (falla) → React Query reintenta → request de nuevo (el config nuevo no tiene _retry) → otro POST /auth/refresh. Son 4 llamadas HTTP por query fallida, multiplicado por cada query montada. Además, un 404 legítimo (p.ej. getMemberAction con id inexistente en MemberDetailPage) o un 403 se reintentan una vez con retryDelay (~1s), demorando sin sentido el render de 'No encontramos a este socio'.

**Evidencia:**

```
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})
```

**Fix propuesto:** Usar una función de retry que corte en errores 4xx:

```
import axios from 'axios'

retry: (failureCount, error) => {
    if (axios.isAxiosError(error) && error.response && error.response.status < 500) {
        return false
    }
    return failureCount < 1
},
```

> **Verificación cruzada:** Mecanismo verificado línea por línea: retry:1 sin discriminar status (ClubAlianzaApp.tsx:15), el retry de React Query re-ejecuta queryFn con un config axios nuevo sin _retry, así que el interceptor de clubApi.ts vuelve a disparar POST /auth/refresh (sin recursión gracias a NO_REFRESH_PATHS): 4 llamadas HTTP por query con sesión muerta. El 404 de MemberDetailPage (líneas 26-34) se reintenta con retryDelay default (~1s). Todo exacto, pero la consecuencia es ruido de red y ~1s de demora en estados de error — sin corrupción de datos ni loop infinito, y con sesión muerta el usuario termina redirigido al login igual. Severidad baja.

---

### [x] 31. .env commiteado al repositorio y ausente del .gitignore

**Severidad:** Baja · **Área:** Seguridad · **Estado:** Confirmado por verificación cruzada
**Archivo:** `.gitignore:1`

**Qué pasa:** `git ls-files` muestra que `.env` está trackeado (entró en el commit f3c810a 'basic mvp') y el .gitignore no lo excluye (solo tiene `*.local`). Hoy contiene únicamente `VITE_API_URL=http://localhost:3000/api`, que no es secreto, pero es el archivo designado para configuración de entorno: el día que alguien agregue ahí una key (analytics, Sentry DSN privado, etc.) quedará publicada en el historial de git para siempre. Además convive con un `.env.example`, lo que indica que la intención era NO versionarlo.

**Evidencia:**

```
$ git ls-files | grep -iE '\.env'
.env
.env.example

# .gitignore no contiene ninguna entrada .env (solo *.local)
```

**Fix propuesto:** Agregar `.env` (y `.env.*` salvo `.env.example`) al .gitignore y sacarlo del índice: `git rm --cached .env`. Mantener `.env.example` como plantilla. Recordar además que TODA variable `VITE_*` termina en el bundle público del cliente: nunca poner ahí un secreto real, aunque el archivo esté ignorado.

> **Verificación cruzada:** Verificado: `git ls-files` muestra .env trackeado (entró en f3c810a), el .gitignore solo tiene `*.local` y convive con .env.example. Los hechos son exactos. Pero el contenido actual es solo VITE_API_URL (no secreto) y toda variable VITE_* termina en el bundle público de todos modos, así que incluso el riesgo futuro descrito (una key filtrada vía git) se filtraría igual vía bundle. Es higiene/deuda latente, no exposición real: severidad baja, no media.

---

### [x] 32. NO_REFRESH_PATHS compara con startsWith sobre la URL cruda: matching frágil ante URLs absolutas o prefijos

**Severidad:** Baja · **Área:** Seguridad · **Estado:** Confirmado con matices
**Archivo:** `src/api/clubApi.ts:31`

**Qué pasa:** La exclusión de rutas de auth se hace con `request.url?.startsWith(path)`, que solo funciona mientras todas las llamadas usen paths relativos que empiecen exactamente con '/auth/...'. Si mañana una action llama con URL absoluta (`clubApi.post(import.meta.env.VITE_API_URL + '/auth/login', ...)` o un endpoint en otro host), el startsWith no matchea y un 401 de credenciales inválidas dispararía un refresh y —peor— un re-POST automático de la request original con las credenciales (`return clubApi(request)`), duplicando el intento de login. También matchea por prefijo: una futura ruta `/auth/registrations` quedaría excluida del refresh sin querer. Hoy no hay llamadas absolutas en el código, así que es deuda latente, no bug activo.

**Evidencia:**

```
const NO_REFRESH_PATHS = ['/auth/login', '/auth/refresh', '/auth/register']
...
!NO_REFRESH_PATHS.some((path) => request.url?.startsWith(path))
```

**Fix propuesto:** Normalizar antes de comparar y comparar el pathname completo: `const pathname = new URL(request.url ?? '', clubApi.defaults.baseURL ?? window.location.origin).pathname` y luego `NO_REFRESH_PATHS.some((p) => pathname === p || pathname.endsWith(p))` (o comparar contra el path con el prefijo /api resuelto). Así el comportamiento no depende de cómo se escribió la URL en cada action.

> **Verificación cruzada:** El código en clubApi.ts:31 es exactamente el citado y verifiqué por grep que TODAS las llamadas actuales usan paths relativos: no hay bug activo, como el propio hallazgo admite. Además el escenario 'peor' (re-POST del login) está sobredimensionado: si el refresh falla, el catch rechaza el error original sin reintentar; el re-POST solo ocurre si hay un refreshToken válido en cookie Y alguien escribió una URL absoluta (hoy inexistente). Sobrevive: el matching por prefijo de startsWith es real (/auth/register matchearía /auth/registrations). Deuda latente autoadmitida = severidad baja.

---

### [x] 33. unwrap<T> confía a ciegas en el sobre de la respuesta: cero validación runtime pese a tener Zod en el proyecto

**Severidad:** Baja · **Área:** Tipos · **Estado:** Confirmado con matices
**Archivo:** `src/api/clubApi.ts:51`

**Qué pasa:** Todas las actions tipan la respuesta solo con el genérico de axios (`clubApi.get<ApiResponse<T>>`), que es una aserción sin ningún chequeo: unwrap devuelve `response.data.data` sin verificar siquiera que `success === true` ni que `data` exista. Si el backend cambia el sobre, devuelve 200 con success:false, o un proxy responde otra cosa, `undefined` viaja tipado como T hasta la caché de TanStack Query y revienta lejos del origen (p.ej. `user.roles.some(...)` en hasRole, `payments.map(...)`). El proyecto ya tiene Zod 4 pero solo lo usa para forms, nunca para validar lo que llega.

**Evidencia:**

```
export const unwrap = <T>(response: { data: ApiResponse<T> }): T => response.data.data
```

**Fix propuesto:** Como mínimo, chequear el sobre en unwrap: `if (!response.data || response.data.success !== true) throw new Error(...)`. Ideal: definir schemas Zod para los payloads críticos (SessionUser en checkAuthAction, MemberProfile, Payment) y hacer `sessionUserSchema.parse(response.data.data)` — los roles de SessionUser deciden el ruteo del panel, es el primer candidato.

> **Verificación cruzada:** El hecho central es cierto: unwrap (clubApi.ts:51) devuelve response.data.data sin chequear success ni existencia, y Zod solo se usa en schemas de forms. Pero los ejemplos de explosión están mal: hasRole es null-safe (`roles?.some` + `get().user?.roles`, devuelve false sin crashear) y MyPaymentsPage usa `data: payments = []` con estado de error renderizado. Además TanStack Query v5 rechaza queryFn que resuelva undefined ('Query data cannot be undefined'), así que undefined NO viaja a la caché: se convierte en isError cerca del origen. Sobrevive el patrón de confianza ciega (p.ej. 200 con success:false y data presente), pero el impacto descrito requiere que el backend propio rompa su contrato: severidad baja.

---

### [x] 34. ApiResponse.message tipado como string, pero el propio código admite que el backend manda string[]

**Severidad:** Baja · **Área:** Tipos · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/api/types.ts:12`

**Qué pasa:** La interfaz declara `message: string`, pero getApiErrorMessage hace `Array.isArray(message)` — prueba de que el backend (NestJS ValidationPipe) devuelve `message: string[]` en los 400. Con el tipo declarado, TS narrowea ese branch a `string & any[]` (efectivamente inalcanzable según los tipos): el chequeo runtime funciona de casualidad y cualquier otro consumidor de `message` que confíe en la interfaz va a asumir string y romperse con los arrays reales.

**Evidencia:**

```
// types.ts:12
message: string
// clubApi.ts:66 — contradice el tipo declarado:
if (Array.isArray(message)) return message.join(', ')
```

**Fix propuesto:** Alinear la interfaz con la realidad del backend: `message: string | string[]` en ApiResponse. Así el branch de Array.isArray queda tipado correctamente y nadie puede tratar message como string a secas sin narrowing.

> **Verificación cruzada:** Verificado exacto: types.ts:12 declara `message: string` y clubApi.ts:66 hace `Array.isArray(message)` (branch tipado `string & any[]`, funciona solo porque es chequeo runtime). La contradicción es real y el fix propuesto correcto. Ahora: grep muestra que getApiErrorMessage es el ÚNICO consumidor de ApiResponse.message en todo src/, y ese único consumidor ya maneja ambas formas — no hay bug runtime actual, solo riesgo para consumidores futuros hipotéticos. Corrección de tipo sin impacto presente: severidad baja.

---

### [x] 35. Falta vite-env.d.ts: import.meta.env.VITE_API_URL es `any` (el único any del proyecto, y en la baseURL)

**Severidad:** Baja · **Área:** Tipos · **Estado:** Confirmado por verificación cruzada
**Archivo:** `src/api/clubApi.ts:10`

**Qué pasa:** No existe ningún .d.ts en src/ (se borró el vite-env.d.ts del scaffold). Con solo `types: ["vite/client"]`, ImportMetaEnv resuelve VITE_API_URL por su index signature `[key: string]: any`: la baseURL de TODA la API queda tipada any, un typo en el nombre de la variable compila sin error, y si la env no está definida baseURL es undefined y axios pega contra el origin actual en silencio.

**Evidencia:**

```
export const clubApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,  // tipo: any
    withCredentials: true,
})
```

**Fix propuesto:** Crear src/vite-env.d.ts:
/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_API_URL: string
}
interface ImportMeta {
    readonly env: ImportMetaEnv
}
Opcional: fallar rápido en clubApi.ts si `!import.meta.env.VITE_API_URL` en dev.

> **Verificación cruzada:** Verificado: no existe ningún .d.ts en src/, tsconfig.app.json solo tiene types:["vite/client"], y en Vite 7.2.4 ImportMetaEnv extiende Record<string, any> sin el opt-in strictImportMetaEnv — VITE_API_URL es efectivamente `any`, un typo compila, y con la env ausente axios usa el origin actual. Todo cierto. Pero el impacto práctico es acotado: el .env está commiteado (todo clone dev funciona) y un deploy sin la variable rompe la API entera de forma ruidosa e inmediata, no silenciosa a largo plazo. Es hardening de DX/tipos: severidad baja.

---

### [x] 36. tsconfig.app.json sin noUncheckedIndexedAccess ni exactOptionalPropertyTypes

**Severidad:** Baja · **Área:** Tipos · **Estado:** Confirmado con matices
**Archivo:** `tsconfig.app.json:20`

**Qué pasa:** El bloque strict está bien encaminado, pero faltan los dos flags que más mentiras de tipos destapan en este código. Sin noUncheckedIndexedAccess, `AUDIT_ACTION_LABELS[log.action]` (Record<string, string> indexado con un string arbitrario del backend, AuditPage.tsx:113) tipa `string` cuando en runtime puede ser undefined — el `?? log.action` que hay al lado es código muerto según los tipos, o sea que los tipos y el runtime ya no cuentan la misma historia. Lo mismo con accesos `files[0]` y arrays indexados. exactOptionalPropertyTypes además distinguiría `{ status: undefined }` de omitir la key en los objetos de query params que van directo a axios (AdminPaymentsQuery, EventsQuery).

**Evidencia:**

```
"strict": true,
"noUnusedLocals": true,
"noUnusedParameters": true,
// faltan: "noUncheckedIndexedAccess": true, "exactOptionalPropertyTypes": true
```

**Fix propuesto:** Agregar `"noUncheckedIndexedAccess": true` (el fix inmediato es chico: el codebase ya usa `?? fallback` en casi todos los accesos indexados) y evaluar `"exactOptionalPropertyTypes": true` en una segunda pasada. Ambos flags son mucho más baratos de adoptar ahora, con 160 archivos, que en un año.

> **Verificación cruzada:** Los hechos son correctos: los flags no están y AUDIT_ACTION_LABELS[log.action] (Record<string,string>, AuditPage.tsx:113) tipa string con el `?? log.action` muerto según los tipos. Pero no hay bug en runtime (el fallback ya cubre el caso) y el argumento de exactOptionalPropertyTypes para los query params es moot: axios omite params undefined al serializar, así que { status: undefined } y omitir la key generan el mismo request. Es una recomendación de hardening de config, no un defecto.

> **Resuelto a medias, a propósito.** `noUncheckedIndexedAccess` quedó activado y el proyecto compila **sin un solo error**: el código ya era null-safe en los accesos indexados. `exactOptionalPropertyTypes` quedó afuera: enciende 24 errores que son una migración en sí misma, y su caso más citado (los query params) es justamente el que la verificación cruzada descartó. Está anotado en `tsconfig.app.json` con el motivo.

---

### [x] 37. AdminLayout y MemberLayout duplican línea por línea el shell responsive (grid + topbar mobile + drawer)

**Severidad:** Baja · **Área:** Arquitectura · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/admin/layouts/AdminLayout.tsx:13`

**Qué pasa:** AdminLayout.tsx:13-51 y MemberLayout.tsx:15-51 son estructuralmente idénticos: mismo grid `lg:grid-cols-[16rem_1fr]`, mismo aside sticky, mismo header mobile con ClubLogo + botón Menu, mismo drawer con backdrop, botón X y `onNavigate={() => setIsDrawerOpen(false)}`; solo cambia qué sidebar renderizan y el ancho del contenido (max-w-6xl vs max-w-5xl). Ya divergieron en un detalle (MemberLayout agrega la franja de identidad del socio), y cualquier fix del drawer (por ejemplo, cerrar con Escape, bloquear scroll del body, focus trap — hoy no hace ninguna de las tres) hay que aplicarlo dos veces o queda inconsistente.

**Evidencia:**

```
// AdminLayout.tsx:33-51 y MemberLayout.tsx:33-51 — bloque idéntico:
{isDrawerOpen && (
    <div className="fixed inset-0 z-50 lg:hidden">
        <div
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
        />
        <div className={cn('absolute inset-y-0 left-0 w-72 shadow-club')}>
```

**Fix propuesto:** Extraer un `PanelShell` en src/components/custom con props `sidebar: (props: { onNavigate?: () => void }) => ReactNode`, `header?: ReactNode` y `contentClassName`. AdminLayout y MemberLayout quedan en ~15 líneas cada uno y las mejoras de accesibilidad del drawer (Escape, scroll-lock) se hacen una sola vez.

---

### [x] 38. @tanstack/eslint-plugin-query instalado pero no cableado en eslint.config.js

**Severidad:** Baja · **Área:** Arquitectura · Calidad · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `eslint.config.js:12`

**Qué pasa:** El plugin está en devDependencies (package.json:47, "@tanstack/eslint-plugin-query": "^5.91.4") pero el flat config solo extiende js, typescript-eslint, react-hooks y react-refresh: ninguna de sus reglas corre. Es justo el linter que detecta los problemas que este codebase tiene en su capa de datos (keys inestables, exhaustive-deps de queryKey — p. ej. habría marcado patrones frágiles alrededor de las invalidaciones por string del hallazgo de query keys). Instalarlo y no activarlo es costo de node_modules sin ningún beneficio.

**Evidencia:**

```
extends: [
    js.configs.recommended,
    tseslint.configs.recommended,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite,
],
// package.json:47: "@tanstack/eslint-plugin-query": "^5.91.4" — sin referencia en eslint.config.js
```

**Fix propuesto:** Una línea: `import pluginQuery from '@tanstack/eslint-plugin-query'` y agregar `...pluginQuery.configs['flat/recommended']` al array de defineConfig (o a extends). Correr `npm run lint` después y resolver lo que aparezca.

---

### [x] 39. Organización engañosa del módulo auth: verifyEmail vive en password.actions.ts y los schemas de recuperación en register.schema.ts

**Severidad:** Baja · **Área:** Arquitectura · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/auth/actions/password.actions.ts:18`

**Qué pasa:** verifyEmailAction (activación de cuenta, nada que ver con contraseñas) está en password.actions.ts:18-20, y forgotPasswordSchema + resetPasswordSchema están en register.schema.ts:36-59, de donde ForgotPasswordPage y ResetPasswordPage los importan (`import { forgotPasswordSchema } from '@/auth/schemas/register.schema'`). El resto del proyecto nombra los archivos por lo que contienen (login.action.ts, register.action.ts, member.schema.ts), así que estos dos rompen la expectativa: quien busca el schema de reset de contraseña no lo va a encontrar por nombre de archivo. Es costo de descubrimiento puro, barato de arreglar hoy y más caro a medida que auth crezca.

**Evidencia:**

```
// password.actions.ts:17-20
/** GET /auth/verify-email?token=... — activa la cuenta. */
export const verifyEmailAction = async (token: string) => {
    await clubApi.get('/auth/verify-email', { params: { token } })
}
// ForgotPasswordPage.tsx:13
import { forgotPasswordSchema, type ForgotPasswordSchema } from '@/auth/schemas/register.schema'
```

**Fix propuesto:** Mover verifyEmailAction a un verify-email.action.ts (o renombrar el archivo a account.actions.ts si se quiere agrupar verify + confirm-email-change), y partir register.schema.ts: los schemas de forgot/reset a un password.schema.ts junto a sus actions homónimas. Solo cambian imports; TypeScript garantiza que no se rompe nada.

---

### [x] 40. GalleryPage no usa isPlaceholderData: se puede paginar más allá de la última página durante el fetch

**Severidad:** Baja · **Área:** Datos · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/gallery/pages/GalleryPage.tsx:114`

**Qué pasa:** useGallery usa placeholderData: keepPreviousData, pero a diferencia de EventsPage.tsx (líneas 78 y 88, que deshabilitan los botones con isPlaceholderData) los botones de paginación de la galería solo chequean page contra meta.totalPages del dato anterior. Con red lenta, clicks rápidos en 'Siguiente' incrementan page varias veces contra un meta congelado, disparando requests a páginas potencialmente inexistentes y mostrando 'Página X de Y' inconsistente hasta que llega la respuesta.

**Evidencia:**

```
<Button
    variant="outline"
    disabled={page >= meta.totalPages}
    onClick={() => setPage((current) => current + 1)}
>
    Siguiente
</Button>
```

**Fix propuesto:** Desestructurar isPlaceholderData de useGallery (línea 20) y sumarlo a los disabled, igual que en EventsPage:

```
const { data, isLoading, isError, isPlaceholderData } = useGallery({ page, limit: PAGE_SIZE, categoryId })
...
disabled={page <= 1 || isPlaceholderData}
...
disabled={page >= meta.totalPages || isPlaceholderData}
```

---

### [x] 41. Validación de archivos en cliente inconsistente: DocumentUpload y ProfilePhotoUpload no validan tipo, BulkImportDialog no valida nada

**Severidad:** Baja · **Área:** Seguridad · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/admin/components/BulkImportDialog.tsx:93`

**Qué pasa:** UploadPaymentDialog valida tipo y tamaño con Zod, pero los otros tres uploads no siguen el mismo estándar: DocumentUpload.tsx:42 y ProfilePhotoUpload.tsx:35 chequean solo tamaño (el atributo `accept` del input se bypassea trivialmente eligiendo 'Todos los archivos' en el picker), y BulkImportDialog no valida ni tipo ni tamaño — un admin puede seleccionar un archivo de cientos de MB que se sube entero antes de que el backend lo rechace. La validación cliente es solo UX (el backend debe ser la barrera real), pero la inconsistencia tiene costo concreto: subidas largas destinadas a fallar y mensajes de error del servidor en vez de feedback inmediato.

**Evidencia:**

```
<input
    ref={inputRef}
    type="file"
    accept=".csv,text/csv"
    className="hidden"
    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
/>
```

**Fix propuesto:** Unificar con el patrón de UploadPaymentDialog: en BulkImportDialog rechazar en onChange archivos que superen un tope razonable (p.ej. 10MB) y cuyo `file.type`/extensión no sea CSV; en DocumentUpload y ProfilePhotoUpload agregar el chequeo de MIME (`['image/jpeg','image/png','image/webp'].includes(file.type)`) junto al de tamaño ya existente.

---

### [x] 42. URLs del backend (receiptUrl, document.url) renderizadas como href sin validar esquema

**Severidad:** Baja · **Área:** Seguridad · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/admin/pages/PaymentsPage.tsx:124`

**Qué pasa:** Los comprobantes y documentos se abren con `href={payment.receiptUrl}` / `href={document.url}` (también MyPaymentsPage.tsx:79 y MemberDocuments.tsx:51) confiando ciegamente en el valor que devuelve la API. Hoy esas URLs las genera el storage del backend, así que no hay vector activo; pero receiptUrl corresponde a un archivo subido por el socio, y si en algún refactor el backend pasara a reflejar metadata influenciable por el usuario, un valor `javascript:...` se ejecutaría al clic en la sesión del admin (los `img src` como urlPhoto son inertes ante javascript:, los `<a href>` no). Es el único punto donde contenido de origen usuario termina en un atributo ejecutable.

**Evidencia:**

```
<a
    href={payment.receiptUrl}
    target="_blank"
    rel="noreferrer"
```

**Fix propuesto:** Agregar un helper en src/lib (p.ej. `safeHttpUrl(url: string): string | undefined` que haga `new URL(url)` y devuelva la URL solo si `protocol` es 'http:' o 'https:') y usarlo en los tres lugares: `href={safeHttpUrl(payment.receiptUrl)}`. Costo mínimo, elimina la clase de bug entera.

---

### [x] 43. Sin Content-Security-Policy ni meta referrer en index.html

**Severidad:** Baja · **Área:** Seguridad · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `index.html:3`

**Qué pasa:** La app maneja sesión por cookies y renderiza URLs provistas por el backend (imageUrl de galería, urlPhoto, receiptUrl) pero no declara ninguna CSP ni política de referrer. Hoy no hay XSS conocido (no se usa dangerouslySetInnerHTML en ningún archivo de src/), pero sin CSP cualquier XSS futuro tiene impacto total, y sin referrer policy explícita las páginas con `?token=` dependen del default del navegador para no filtrar la URL completa a fonts.googleapis.com/gstatic.

**Evidencia:**

```
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/logo-alianza.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

**Fix propuesto:** Idealmente configurar los headers en el servidor que sirva el build (CSP con `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; frame-src https://maps.google.com; frame-ancestors 'none'`, más `X-Content-Type-Options: nosniff`). Como mínimo dentro de este repo, agregar en index.html `<meta name="referrer" content="same-origin" />` y una CSP vía meta tag (sin frame-ancestors, que no aplica en meta).

> **Resuelto la parte que corresponde al repo.** Se agregó `<meta name="referrer" content="same-origin">`, que es lo que protege los tokens de los links de mail (ver #16). La **CSP quedó pendiente a propósito**: va como header del servidor que sirve el build (Nginx, Vercel, Netlify), no en un meta tag. Ponerla acá daría una falsa sensación de cobertura —el meta no soporta `frame-ancestors`, que es justamente la directiva anti-clickjacking— y una CSP mal armada rompe la app en producción sin avisar en desarrollo. La policy sugerida de arriba está lista para pegar donde se hostee, junto con `X-Content-Type-Options: nosniff`.

---

### [x] 44. El validador público de credencial expone nombre completo, foto y N° de socio con un token que la UI trata como permanente

**Severidad:** Baja · **Área:** Seguridad · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/members/pages/ValidateCredentialPage.tsx:84`

**Qué pasa:** La ruta pública /validar/:token muestra a cualquier visitante no autenticado nombre, apellido, N° de socio, foto y estado de cuota. Es una decisión de diseño razonable para control de puerta (y maneja bien el 429 de throttling y el caso inválido con mensaje genérico, sin enumeración de detalle), pero la UI del socio agrava la exposición: CredentialPage.tsx:78-80 ofrece 'Copiar link' y descarga en PNG del QR, incentivando compartirlo por chat. Si el qrPayload no expira ni rota (el frontend no tiene ningún flujo de renovación), cualquier persona que alguna vez recibió el link puede monitorear a perpetuidad el estado de pago y la foto actual del socio.

**Evidencia:**

```
<p className="font-display text-2xl font-extrabold text-ink">
    {data.name} {data.surname}
</p>
{data.memberNumber && (
    <p className="kicker mt-2 text-muted-foreground">
        Socio N° {data.memberNumber}
    </p>
)}
```

**Fix propuesto:** Confirmar con el backend que el qrPayload tiene expiración o rota ante eventos (cambio de foto, renovación de credencial); si es permanente, pedir tokens de vida acotada y regenerar el QR en cada visita a CredentialPage. Alternativa de bajo costo en frontend: reducir lo que muestra la pantalla pública (nombre + inicial del apellido + foto alcanza para validar en puerta) y quitar el N° de socio.

> **SIN RESOLVER — necesita una decisión de producto, no de código.** Recortar lo que muestra la pantalla de validación cambia para qué sirve la pantalla: quien controla la puerta puede necesitar el nombre completo y el N° de socio para verificar contra otra lista. No es una decisión que corresponda tomar sin el club. Los dos caminos, en orden de preferencia:
>
> 1. **Backend:** que el `qrPayload` expire o rote (al cambiar la foto, al renovar la credencial). Resuelve el problema de raíz y no toca la UI.
> 2. **Frontend:** mostrar nombre + inicial del apellido y quitar el N° de socio. Solo tiene sentido si en la puerta alcanza con eso.
>
> Mientras tanto, `meta name="referrer" same-origin` (hallazgo #43) ya evita que el token de la URL se filtre por Referer.

---

### [x] 45. StaffUser y SessionUser son la misma interfaz copiada campo por campo

**Severidad:** Baja · **Área:** Tipos · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/admin/interfaces/StaffUser.ts:4`

**Qué pasa:** StaffUser (src/admin/interfaces/StaffUser.ts:4-11) y SessionUser (src/auth/interfaces/User.ts:7-14) declaran exactamente los mismos 6 campos y ambas dicen espejar el mismo `UserResponseDto` del backend. Si el DTO cambia (p.ej. se agrega name/surname), hay que acordarse de tocar dos archivos; el drift entre ambas copias no lo detecta nadie. Contrasta con AdminMember, que sí se resolvió bien como alias de MemberProfile.

**Evidencia:**

```
// StaffUser.ts
export interface StaffUser {
    id: string
    email: string
    roles: Role[]
    isActive: boolean
    isEmailVerified: boolean
    createdAt: string
}
// User.ts — idéntico campo por campo
export interface SessionUser { id: string; email: string; roles: Role[]; isActive: boolean; isEmailVerified: boolean; createdAt: string }
```

**Fix propuesto:** Definir la shape una sola vez (p.ej. `ApiUser` en un módulo compartido o en auth) y derivar: `export type StaffUser = ApiUser` y `export type SessionUser = ApiUser`, igual que se hizo con `AdminMember = MemberProfile`.

---

### [x] 46. STAFF_ROLES tipado demasiado ancho (Role[]) obliga a casts aguas abajo, y hasRole acepta string[] con `as Role`

**Severidad:** Baja · **Área:** Tipos · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/constants/roles.ts:19`

**Qué pasa:** `STAFF_ROLES: Role[]` borra la información de qué roles contiene: no existe un tipo 'StaffRole', así que RoleCheckboxes emite Role[] genérico y StaffFormDialog.tsx:160 necesita `roles as CreateStaffSchema['roles']` para cerrar el círculo (el propio comentario del código lo admite). Además hasRole toma `roles: string[] | undefined` y castea `role as Role` para poder usar includes — el parámetro ancho permite pasarle cualquier string[] sin queja del compilador.

**Evidencia:**

```
export const STAFF_ROLES: Role[] = [Roles.ADMIN, Roles.ACCOUNTANT, Roles.WEB_ADMIN]

export const hasRole = (roles: string[] | undefined, ...allowed: Role[]): boolean =>
    !!roles?.some((role) => allowed.includes(role as Role))
```

**Fix propuesto:** `export const STAFF_ROLES = [Roles.ADMIN, Roles.ACCOUNTANT, Roles.WEB_ADMIN] as const` + `export type StaffRole = (typeof STAFF_ROLES)[number]`; tipar RoleCheckboxes con StaffRole[] (desaparece el cast de StaffFormDialog). En hasRole, invertir la lógica para eliminar el cast: `allowed.some((role) => roles?.includes(role))` con `roles: readonly string[] | undefined`.

---

### [x] 47. StatusTab re-declara a mano los literales de PaymentStatus

**Severidad:** Baja · **Área:** Tipos · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/admin/pages/PaymentsPage.tsx:16`

**Qué pasa:** `type StatusTab = 'PENDING' | 'APPROVED' | 'REJECTED' | 'all'` copia los literales del union PaymentStatus en vez de derivarlos, y por eso hace falta el `(tab as PaymentStatus)` de la línea 33. Si mañana se renombra un estado en PaymentStatuses, este union no se entera: el cast sigue compilando y el filtro manda un status inexistente al backend. Además REFUNDED quedó sin pestaña propia sin que nada en los tipos documente si es a propósito.

**Evidencia:**

```
type StatusTab = 'PENDING' | 'APPROVED' | 'REJECTED' | 'all'
// ...
status: tab === 'all' ? undefined : (tab as PaymentStatus),
```

**Fix propuesto:** Derivar del union real: `type StatusTab = Exclude<PaymentStatus, 'REFUNDED'> | 'all'` (el Exclude deja explícito que REFUNDED se ve solo en 'Todos'). Con eso el `as PaymentStatus` se puede borrar: el narrowing de `tab !== 'all'` ya deja el tipo correcto.

---

### [x] 48. DocumentUpload y ProfilePhotoUpload validan solo tamaño, no tipo MIME: el atributo accept es evadible

**Severidad:** Baja · **Área:** Formularios · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/members/components/DocumentUpload.tsx:42`

**Qué pasa:** onFileSelected chequea `file.size > MAX_FILE_SIZE` pero no `file.type`; la restricción a JPG/PNG/WebP vive solo en el atributo `accept` del input, que el usuario puede saltear eligiendo 'Todos los archivos' en el diálogo del SO (o arrastrando). Un PDF o un .exe de 4MB se sube igual y el error recién aparece como respuesta del backend. ProfilePhotoUpload.tsx:32-41 tiene exactamente el mismo hueco. El proyecto ya tiene el patrón correcto en UploadPaymentDialog.tsx:29-32, que valida `ACCEPTED_TYPES.includes(file.type)` en el schema.

**Evidencia:**

```
const onFileSelected = (type: DocumentType, file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
        toast.error('El archivo no puede superar los 5MB')
        return
    }
    setPendingType(type)
    mutate({ type, file })
}
```

**Fix propuesto:** Agregar el chequeo de tipo antes de mutar, reusando la constante: `const ACCEPTED = ['image/jpeg','image/png','image/webp']; if (!ACCEPTED.includes(file.type)) { toast.error('Solo se aceptan imágenes JPG, PNG o WebP'); return }` en DocumentUpload.onFileSelected y en ProfilePhotoUpload.onFileSelected.

---

### [x] 49. BulkImportDialog: el bloqueo de cierre durante el procesamiento está comentado pero no implementado

**Severidad:** Baja · **Área:** Formularios · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/admin/components/BulkImportDialog.tsx:51`

**Qué pasa:** El comentario dice 'No permitir cerrar mientras procesa', pero `setIsOpen(open)` se ejecuta incondicionalmente: con Escape o clic afuera durante una importación el dialog SÍ se cierra; lo único que se saltea es closeAndReset. El admin pierde de vista el progreso de un proceso en curso (puede reabrirlo y el job sigue, pero nada se lo indica) y puede navegar a otra página creyendo que canceló. Además el CSV no tiene límite de tamaño ni chequeo de tipo en JS (solo accept=".csv,text/csv").

**Evidencia:**

```
onOpenChange={(open) => {
    setIsOpen(open)
    // No permitir cerrar mientras procesa; al cerrar en cualquier otro
    // caso, limpiar para arrancar de cero la próxima vez.
    if (!open && !isProcessing) closeAndReset()
}}
```

**Fix propuesto:** Hacer condicional también el cambio de open: `onOpenChange={(open) => { if (!open && isProcessing) return; setIsOpen(open); if (!open) closeAndReset() }}`. Opcionalmente agregar `onInteractOutside={(e) => isProcessing && e.preventDefault()}` en DialogContent y un tope de tamaño para el CSV en onChange.

---

### [x] 50. CategoryManagerDialog: borrar sin disabled durante la mutación, label sin asociar y alta sin submit con Enter

**Severidad:** Baja · **Área:** Formularios · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/admin/components/CategoryManagerDialog.tsx:121`

**Qué pasa:** Tres detalles en el mismo componente: (1) los botones de borrar (Trash2) no se deshabilitan con `isMutating`, a diferencia del botón de crear; un doble clic dispara dos DELETE y el segundo termina en toast de error por 404; (2) el `<label>Nombre</label>` de la línea 84 no tiene htmlFor ni el Input id, así que no hay asociación accesible (todo el resto del proyecto usa FormLabel correctamente); (3) al no haber `<form>`, presionar Enter en el input de nombre no crea la categoría, inconsistente con todos los demás forms. El nombre tampoco tiene tope de longitud (solo trim + no vacío vía toast).

**Evidencia:**

```
<button
    type="button"
    onClick={() => void handleDelete(category.id)}
    className="text-muted-foreground transition-colors hover:text-destructive"
    aria-label={`Eliminar ${category.name}`}
>
```

**Fix propuesto:** Agregar `disabled={isMutating}` al botón de borrar (y atenuar con clases disabled:); asociar el label (`<label htmlFor="category-name">` + `<Input id="category-name">`); envolver nombre+color+botón en un `<form onSubmit={...}>` con el botón type=submit; y validar longitud máxima del nombre acorde al DTO del backend.

---

### [x] 51. Imagen hero (LCP, 165 kB) sin fetchpriority ni preload

**Severidad:** Baja · **Área:** Performance · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/landing/pages/HomePage.tsx:45`

**Qué pasa:** hero.webp (165 kB) es el elemento LCP de la home y recién se descubre cuando React monta la página — después de bajar y ejecutar los 872 kB de JS. Sin fetchpriority, el navegador además la encola con prioridad de imagen normal compitiendo con las fotos de eventos. Lo mismo aplica a cancha.webp (143 kB) en la página que la use como hero.

**Evidencia:**

```
<img
    src={heroImage}
    alt=""
    aria-hidden
    className="absolute inset-0 -z-10 size-full object-cover opacity-90"
/>
```

**Fix propuesto:** Agregar `fetchPriority="high"` y `decoding="async"` al <img> del hero. Para ganar el roundtrip completo, un `<link rel="preload" as="image">` en index.html requiere URL estable: mover hero.webp a public/ con nombre fijo, o inyectar el preload vía el import del asset. También conviene generar una variante ~800px para mobile con srcset/sizes: hoy el celular baja los 1600-2000px completos.

---

### [x] 52. useAuthStore() sin selector en header, sidebars y guards

**Severidad:** Baja · **Área:** Performance · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/landing/components/PublicHeader.tsx:22`

**Qué pasa:** Siete componentes (PublicHeader, AdminSidebar, MemberSidebar, los tres guards de ProtectedRoutes, AdminIndex) llaman useAuthStore() sin selector, suscribiéndose al store entero: cualquier set() re-renderiza todos. Hoy el impacto real es chico — el store solo cambia en login/logout/check — por eso es low, pero es inconsistente con CheckAuthProvider (ClubAlianzaApp.tsx líneas 28-29), que sí usa selectores, y es una trampa latente: el día que alguien agregue al store un campo que cambie seguido, el header sticky y ambos sidebars empiezan a re-renderizarse gratis.

**Evidencia:**

```
const { status, user, logoutUser, is } = useAuthStore()
```

**Fix propuesto:** Estandarizar el patrón con selectores atómicos como ya hace CheckAuthProvider: `const status = useAuthStore((s) => s.status)`, `const logoutUser = useAuthStore((s) => s.logoutUser)`. Las funciones (logoutUser, is) tienen identidad estable en Zustand, así que seleccionarlas por separado no genera re-renders.

---

### [x] 53. MyPaymentsPage usa <table> crudo y el string mágico 'REJECTED'

**Severidad:** Baja · **Área:** Calidad · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/payments/pages/MyPaymentsPage.tsx:68`

**Qué pasa:** Doble inconsistencia con el resto del proyecto: (1) la tabla se arma con <table>/<thead>/<td> a mano (líneas 42-93) mientras todas las demás tablas (MembersListPage, PaymentsPage, AuditPage, StaffPage, AdminEventsPage) usan los componentes Table de components/ui/table.tsx — cualquier ajuste de estilo de tablas no la va a alcanzar; (2) compara el estado con el literal 'REJECTED' cuando la constante PaymentStatuses.REJECTED existe en la misma feature (interfaces/Payment.ts) y PaymentsPage.tsx:136 sí la usa (PaymentStatuses.PENDING).

**Evidencia:**

```
{payment.status === 'REJECTED' &&
    payment.rejectionReason && (
        <p className="mt-1 text-xs text-destructive">
```

**Fix propuesto:** Importar PaymentStatuses y usar payment.status === PaymentStatuses.REJECTED; migrar el markup a los componentes Table/TableHeader/TableRow/TableCell compartidos como en PaymentsPage.

---

### [x] 54. Tabs de filtro tipo 'pill' duplicados entre MembersListPage y PaymentsPage

**Severidad:** Baja · **Área:** Calidad · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/admin/pages/PaymentsPage.tsx:51`

**Qué pasa:** PaymentsPage:51-66 y MembersListPage:65-89 repiten el mismo grupo de botones-píldora con classNames idénticos ('rounded-md bg-ink px-… text-background' para el activo, la variante muted para el resto) y la misma lógica de selección. Además el tipo StatusTab de PaymentsPage (línea 16) redefine los literales 'PENDING' | 'APPROVED' | 'REJECTED' que ya existen como PaymentStatus, obligando al cast 'tab as PaymentStatus' en la línea 33.

**Evidencia:**

```
className={
    tab === option.value
        ? 'rounded-md bg-ink px-4 py-2 text-xs font-bold text-background'
        : 'rounded-md px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground'
}
```

**Fix propuesto:** Extraer un <FilterPills options value onChange /> genérico en components/custom (options: { value, label }[]) y usarlo en ambas páginas. Tipar StatusTab como PaymentStatus | 'all' (excluyendo REFUNDED con Exclude si hace falta) para eliminar el cast.

---

### [x] 55. ComingSoonPage es código muerto

**Severidad:** Baja · **Área:** Calidad · **Estado:** Un solo revisor (sin doble verificación)
**Archivo:** `src/shared/pages/ComingSoonPage.tsx:14`

**Qué pasa:** ComingSoonPage se exporta pero no se importa en ningún lado: grep sobre todo src/ solo encuentra su propia definición, y router.app.tsx no la referencia en ninguna ruta. Es un resto del andamiaje inicial del MVP que suma ruido al feature 'shared' y aparece en las búsquedas sin aportar nada.

**Evidencia:**

```
export const ComingSoonPage = ({ title }: Props) => {  // única aparición en todo src/
```

**Fix propuesto:** Eliminar el archivo src/shared/pages/ComingSoonPage.tsx. Si se prevé volver a necesitarlo para secciones futuras, recuperarlo del historial de git cuando llegue el momento.

---

*Informe generado con revisión multi-agente + verificación adversarial (13 agentes, 490 lecturas de código). Versión navegable: artifact "Auditoría frontend — Club Alianza".*

---

# Ronda 2 — Re-auditoría (02/08/2026)

> **Alcance:** todo el código posterior a la ronda 1 — el refactor de las 5 tandas
> y el rediseño de credenciales (escáner, rol recepción, anulación) — más los ~12
> archivos que la primera pasada nunca leyó completos (páginas del portal, dialogs
> sueltos, componentes menores). Revisión manual, archivo por archivo.
>
> **Veredicto:** la base sigue sana y las convenciones nuevas (queryKeys, FormDialog,
> fields.ts) se respetan. Se encontraron **2 bugs reales en el código nuevo de
> credenciales**, 4 detalles menores, y 9 oportunidades de mejora — de las cuales
> las dos con más retorno son **tests** (hoy: cero) y **lint a cero**.

## Bugs y detalles (R1–R6)

### [x] R1. DoorScannerPage: la cámara puede quedar encendida si el componente se desmonta durante el arranque

**Severidad:** Media · **Área:** Puerta
**Archivo:** `src/members/pages/DoorScannerPage.tsx:88`

**Qué pasa:** `start()` es async. Si el cleanup del efecto corre mientras todavía se espera `QrScanner.hasCamera()` (navegación rápida, o el doble-mount de StrictMode en dev), `scanner` aún es `null` cuando el cleanup llama `scanner?.destroy()`. Después `start()` continúa: construye el scanner, ejecuta `await scanner.start()` —la cámara se enciende— y recién ahí ve `cancelled === true`… y hace `return` **sin destruir**. La luz de la cámara queda prendida sin ninguna pantalla usándola.

**Fix propuesto:** en el camino cancelado, destruir antes de salir: `if (cancelled) { scanner.destroy(); return }` (y chequear `cancelled` también antes de construir, tras el `await` de `hasCamera`).

---

### [x] R2. ValidateCredentialPage: sin conexión o con error del servidor muestra "Credencial inválida"

**Severidad:** Alta · **Área:** Puerta
**Archivo:** `src/members/pages/ValidateCredentialPage.tsx:110`

**Qué pasa:** la rama final es `!!error && status !== 429/410/403` → "Credencial inválida. Verificá la identidad por otro medio". Pero ahí caen también el **error de red** (`error.response` undefined) y los 5xx. La puerta se atiende con un celular con datos móviles: quedarse sin señal es el caso frecuente, y el mensaje actual le dice al personal que la tarjeta es **fraudulenta** cuando el problema es la conexión. Es exactamente la distinción 400-vs-410 que pedimos al backend, incumplida del lado nuestro para el caso red/5xx.

**Fix propuesto:** rama propia para `status === undefined` (red) y `status >= 500`, en ámbar: "No pudimos consultar el sistema. Revisá la conexión y reintentá" + botón de reintento (`refetch`). Dejar "inválida" solo para el 400 real.

---

### [x] R3. AccountPage: literal `'APPROVED'` en vez de `PaymentStatuses.APPROVED`

**Severidad:** Baja · **Área:** Calidad
**Archivo:** `src/members/pages/AccountPage.tsx:52`

**Qué pasa:** la misma inconsistencia del hallazgo #55 (arreglada en MyPaymentsPage) quedó viva acá: `.filter((payment) => payment.status === 'APPROVED')`. La constante existe en la misma feature.

**Fix propuesto:** importar `PaymentStatuses` y comparar contra la constante.

---

### [x] R4. StaffPage: la descripción quedó desactualizada tras sumar Recepción

**Severidad:** Baja · **Área:** Contenido
**Archivo:** `src/admin/pages/StaffPage.tsx:22`

**Qué pasa:** dice "Personal con acceso al panel: administradores, tesorería y admins web", pero el listado ahora incluye cuentas de **Recepción**, que justamente no acceden al panel. El texto contradice lo que la tabla muestra.

**Fix propuesto:** algo como "Personal del club: administradores, tesorería, admins web y recepción."

---

### [x] R5. BoardPeriodEditor: al entrar a editar muestra el valor capturado en el mount, no el actual

**Severidad:** Baja · **Área:** Formularios
**Archivo:** `src/admin/components/BoardPeriodEditor.tsx:16`

**Qué pasa:** `useState(period ?? '')` se captura una sola vez. Si el período cambió por un refetch (u otro admin lo editó), apretar "Editar" abre el input con el valor viejo. Es la misma familia del hallazgo #9 (reset de dialogs), que este componente no recibió porque no es un dialog.

**Fix propuesto:** al entrar en modo edición, sincronizar: `onClick={() => { setValue(period ?? ''); setIsEditing(true) }}`. De paso, envolver input+botón en un `<form>` para que Enter guarde (misma observación que CategoryManagerDialog en #52).

---

### [x] R6. RejectPaymentDialog: el motivo tipeado sobrevive al cerrar y reabrir

**Severidad:** Baja · **Área:** Formularios
**Archivo:** `src/admin/components/RejectPaymentDialog.tsx:42`

**Qué pasa:** `onOpenChange={setIsOpen}` no resetea `reason`: si el admin escribe un motivo, cancela, y reabre el rechazo del mismo pago, el texto viejo sigue ahí. Mismo patrón #9; quedó fuera del refactor de FormDialog por tener footer propio (dos botones), lo cual está bien — solo falta el reset.

**Fix propuesto:** `onOpenChange={(open) => { setIsOpen(open); if (open) setReason('') }}`.

---

## Oportunidades (R7–R15)

### [x] R7. Cero tests — y ahora hay lógica pura que los pide a gritos

**Severidad:** Alta (oportunidad) · **Área:** Calidad

**Qué pasa:** no hay un solo archivo de test ni script `test` en package.json, mientras el backend ya tiene specs (`password.constant.spec.ts`, `credential.service.spec.ts`). La ronda 1 evitó el consejo genérico "agregá tests", pero el refactor cambió el panorama: ahora existe lógica pura extraída, exactamente el tipo de código barato de testear y caro de romper en silencio: `extractToken` (formato del QR), `validateUpload`, `safeHttpUrl`, `passwordField` (contra los 11 casos que enumeró el backend), `hasRole`/`homeRouteForRoles` (a dónde cae cada rol), `getApiErrorMessage` (message vs errors[]), `formatCalendarDate` (el corrimiento de huso documentado).

**Fix propuesto:** vitest (corre sobre la config de Vite existente) + ~7 archivos `.spec.ts` colocalizados + script `"test": "vitest run"`. Medio día, y queda el andamiaje para probar hooks/componentes después.

---

### [x] R8. Lint a cero: los 4 problemas restantes tienen arreglo real

**Severidad:** Media (oportunidad) · **Área:** Tooling

**Qué pasa:** los 3 errores de `react-refresh/only-export-components` están en `src/components/ui/` (badge, button, form): es boilerplate de shadcn que exporta variantes CVA junto al componente — la regla es ruido ahí, no un problema a arreglar. La advertencia de `react-hooks/incompatible-library` en StaffFormDialog:47 sí es señal: `form.watch()` no es memoizable por el compilador de React.

**Fix propuesto:** (a) override en eslint.config.js desactivando `react-refresh/only-export-components` solo para `src/components/ui/**`; (b) reemplazar `form.watch('roles')` por `useWatch({ control: form.control, name: 'roles' })`, que es la API recomendada y compiler-safe. Con eso `npm run lint` queda en cero y cualquier error nuevo vuelve a ser señal.

---

### [x] R9. /puerta no es descubrible para admins ni cuentas híbridas

**Severidad:** Media (oportunidad) · **Área:** Navegación

**Qué pasa:** solo una cuenta *exclusivamente* de recepción ve el botón "Escanear" (PublicHeader). Un **admin** —que puede escanear— no tiene ningún link a /puerta en su panel, y un socio que además es recepción tampoco tiene acceso visible: tienen que tipear la URL a mano.

**Fix propuesto:** (a) entrada en `ADMIN_NAV` → `{ to: '/puerta', label: 'Escanear credencial', icon: ScanLine, allowed: [Roles.ADMIN] }`; (b) en MemberSidebar, link a /puerta cuando `is(Roles.RECEPTION)`, junto al de "Panel admin".

---

### [x] R10. DoorScannerPage: el estado "sin permiso de cámara" no ofrece reintentar

**Severidad:** Media (oportunidad) · **Área:** Puerta

**Qué pasa:** si la persona negó el permiso y después lo habilita en el navegador, la pantalla queda clavada en el estado de error: hay que recargar a mano. En un celular en la puerta, "recargá la página" es fricción real.

**Fix propuesto:** botón "Reintentar" que vuelva a ejecutar el arranque del scanner (alcanza con un `key` de remount o extraer `start()` y re-llamarla).

---

### [ ] R11. PanelShell: el drawer mobile no atrapa el foco

**Severidad:** Media (oportunidad) · **Área:** Accesibilidad

**Qué pasa:** el drawer ya cierra con Escape y bloquea el scroll (mejoras del #37), pero el foco puede irse por detrás del overlay con Tab: los links del contenido tapado siguen siendo tabulables. Los Dialog de Radix que usa el resto de la app sí atrapan el foco.

**Fix propuesto:** montar el drawer sobre `Dialog` de Radix (focus trap, Escape y aria gratis, se puede estilar igual) o agregar un focus trap mínimo al contenedor.

---

### [ ] R12. No es instalable: falta manifest de PWA

**Severidad:** Baja (oportunidad) · **Área:** Plataforma

**Qué pasa:** los dos usos más frecuentes son desde el celular (el socio con su credencial, la puerta con el escáner) y el propio backend habla de "la PWA", pero no hay `manifest.webmanifest`: no se puede instalar, y el escáner se abre siempre con la fricción del navegador.

**Fix propuesto:** manifest con nombre, colores del club e iconos (los de 48/180px ya existen; falta uno de 512). Service worker/offline puede esperar; la instalabilidad sola ya mejora el caso puerta.

---

### [ ] R13. El README sigue siendo el del scaffold de Vite y las convenciones viven solo en comentarios

**Severidad:** Baja (oportunidad) · **Área:** Documentación

**Qué pasa:** README.md es la plantilla "React + TypeScript + Vite" intacta. Las convenciones que sostienen el orden del código (actions → hooks → pages, registro `QK` de query keys, `FormDialog`/`TextField`, `fields.ts`, roles y sus fronteras) no están escritas en ningún lado navegable: el próximo dev las rompe sin enterarse.

**Fix propuesto:** README propio de ~80 líneas: cómo correr, mapa de features, las 5 convenciones con una línea cada una, y el detalle de roles (quién escanea, quién anula). Opcional: CLAUDE.md con lo mismo condensado.

---

### [ ] R14. Sin formateador automatizado

**Severidad:** Baja (oportunidad) · **Área:** Tooling

**Qué pasa:** no hay Prettier ni regla de formato en ESLint: la consistencia actual (que es buena) depende de disciplina manual, y se va a degradar con más manos.

**Fix propuesto:** Prettier con config mínima (4 espacios, comillas simples, sin punto y coma — lo que ya es el estilo de facto) + script `format`.

---

### [x] R15. Sin registro de errores en producción

**Severidad:** Baja (oportunidad) · **Área:** Observabilidad

**Qué pasa:** un error de runtime en producción (el escáner que falla un sábado a la noche, un chunk que no baja) hoy es invisible: nadie se entera salvo que el usuario avise. RouteErrorPage muestra el error, pero no lo reporta a ningún lado.

**Fix propuesto:** Sentry (o similar) con el plugin de Vite: captura errores + sourcemaps. Gratis en el tier chico, ~20 líneas de setup. Engancharlo también al `errorElement` del router.

---

### Ya diferidos con motivo (no re-abrir salvo decisión)

- **CSP**: va como header del servidor que hostee el build (ronda 1, #43).
- **`exactOptionalPropertyTypes`**: migración aparte, 24 errores (ronda 1, #36).

## Ronda 3 — Revisión externa (03/08/2026)

Pasada independiente enfocada en lo que una auditoría de un solo repo no ve:
contratos frontend↔backend y condiciones de carrera. Los contratos (política de
contraseñas, rol reception, next-due, shape de errores, cierre del validador)
se verificaron leyendo ambos repos: todos en sincronía. Un solo hallazgo de código:

### [x] 56. checkAuthStatus: un fracaso stale del chequeo de arranque podía pisar un login recién completado

**Severidad:** Baja (carrera improbable) · **Área:** Auth

**Qué pasaba:** el `catch` de `checkAuthStatus` seteaba `not-authenticated`
incondicionalmente. Si el chequeo anónimo del arranque fallaba DESPUÉS de que
un login rápido ya había puesto `authenticated` (red lenta + autofill, o un
error transitorio de red en la carrera del callback de Google), la sesión nueva
se pisaba y la persona era expulsada al login.

**Fix aplicado:** el catch ignora el resultado si el estado ya es
`authenticated` — ese caso lo cubre el evento `SESSION_EXPIRED` del interceptor,
que es quien detecta una sesión muerta de verdad. Cubierto por
`auth.store.spec.ts` (el test simula la carrera con un promise diferido y
verifica que la sesión sobrevive). De paso, el listener del evento quedó detrás
de `typeof window` para que el store sea importable en Node (tests).
