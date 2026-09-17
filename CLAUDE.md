# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Portal del Club Social y Deportivo Alianza (Cutral Có, Neuquén): sitio público + portal
del socio + panel de gestión + escáner de puerta, en un solo SPA. React 19 · TypeScript
strict · Vite · Tailwind v4 · TanStack Query · Zustand · react-hook-form + Zod.

## Comandos

```bash
pnpm dev                 # http://localhost:3001 (puerto fijo, lo exige el CORS del backend)
pnpm dev:https           # solo para probar la cámara del escáner desde el celular por la LAN
pnpm build               # tsc -b && vite build
pnpm lint                # eslint .
pnpm test                # vitest run — 370 tests en 37 archivos
pnpm exec vitest run src/lib/format.spec.ts     # un archivo
pnpm exec vitest run -t "no matchea por prefijo" # un test por nombre
```

`pnpm install` (no npm: hay `packageManager` fijado y `pnpm-lock.yaml`). El backend tiene
que estar corriendo en `localhost:3000`; `.env` no se versiona y necesita
`VITE_API_URL=http://localhost:3000/api` (ver `.env.example`).

**El proxy `/api` de `vite.config.ts` no es una comodidad.** El backend sirve la foto de
perfil, los documentos y los comprobantes por rutas **relativas a la raíz**, que el
navegador resuelve contra `localhost:3001`. Sin el proxy, Vite contesta el `index.html`
del SPA con 200 y aparecen imágenes rotas y errores que no mencionan la URL culpable.

## Arquitectura

### Feature slices con capas fijas

`src/<feature>/` — `landing`, `events`, `gallery`, `institutional`, `contact`, `auth`,
`members`, `payments`, `notifications`, `admin`, más `shared`, `api`, `router`, `lib`,
`components`, `constants`.

Adentro, cada capa tiene un solo trabajo y el flujo va en una dirección:

```
interfaces/  tipos del backend          schemas/  reglas Zod de formularios
actions/     1 endpoint = 1 función, devuelve ya desenvuelto (unwrap)
hooks/       useQuery / useMutation sobre esas actions, invalidaciones incluidas
lib/         lógica pura del dominio + su .spec.ts al lado
components/  presentación                pages/  arma la pantalla desde los hooks
```

Las páginas **nunca** llaman a `clubApi` ni importan una action: piden el hook. Cruzar
features se hace por `@/api/queryKeys`, `@/constants`, `@/shared` o `@/components` —
`members` y `payments` no se importan entre sí. El alias `@/` apunta a `src/`.

### Contrato con el backend (`src/api/`)

Todos los endpoints responden un sobre `{ success, statusCode, message, data, meta }`. En
los listados paginados `meta` va **hermano** de `data`, no adentro.

- `unwrap(response)` / `unwrapPaginated(response)` — únicos accesos a `data`. Tiran error
  con explicación si el sobre no está (hay endpoints con `@IgnoreResponseInterceptor` que
  responden crudo: ahí no se usa `unwrap`).
- `getApiErrorMessage(error, fallback)` — el mensaje para el usuario. El backend ya manda
  todo en español; en los 400 de validación junta los `errors[]` con ` · `.
- `queryClient` vive en módulo aparte para que el auth store pueda vaciarlo sin React. No
  reintenta 4xx.

### Sesión

Cookies httpOnly (`accessToken` 15 min / `refreshToken`), nada en localStorage y ningún
header `Authorization` que armar — lo único que importa es `withCredentials`. El
interceptor de `clubApi` refresca **single-flight** ante un 401 y reintenta la request una
sola vez; si el refresh también falla emite `SESSION_EXPIRED_EVENT` por `window` (no llama
al store: `auth.store → actions → clubApi` sería un ciclo) y el store lo escucha.

`useAuthStore` (Zustand) tiene `status: 'checking' | 'authenticated' | 'not-authenticated'`.
Leerlo **siempre con selector** (`useAuthStore((s) => s.user)`), nunca entero.

### Rutas y permisos

`src/router/router.app.tsx` es la fuente única. URLs en español (`/mi-cuenta/credencial`,
`/admin/socios`, `/puerta`, `/recibos/:paymentId`).

- **Guards** en `router/routes/ProtectedRoutes.tsx`: `AuthenticatedRoutes` (hay sesión),
  `NotAuthenticatedRoutes` (login/registro), `MemberRoutes` (**es socio**, no solo tiene
  cuenta — el personal invitado recibe 403 en credencial y pagos), `RoleRoutes allowed={}`.
- **Roles** en `src/constants/roles.ts`. `user.roles` es un array. Cuidado con las tres
  listas, que son distintas a propósito: `STAFF_ROLES` (entran al panel), `DOOR_ROLES`
  (validan en la puerta), `ASSIGNABLE_ROLES` (se pueden otorgar desde Staff). `reception`
  solo escanea: no ve el panel.
- `homeRouteForRoles()` decide a dónde va cada quien tras el login, y lo usan los guards
  para no rebotar a nadie en loop.
- **Lazy loading con criterio**: el sitio público y los layouts privados van eager (el
  marco aparece al instante); todo lo demás es `lazy()`, sobre todo lo que arrastra una
  librería propia (`qr-scanner` en la puerta, `qrcode` en credencial y recibo, el canvas
  de la firma). Al agregar una página con dependencia pesada, seguir el patrón.
- `src/admin/config/nav.ts` es la fuente única del menú del panel: lo consumen el sidebar
  y `AdminIndex`. Las secciones se agrupan por **la tarea** (Padrón, Cobros, Contenido,
  Sistema), no por endpoint.

### Cache

Las raíces de las query keys viven **todas** en `src/api/queryKeys.ts` (`QK`). Nunca
escribir un string de key a mano: el registro existe justamente para que renombrar una sea
un error de TypeScript y no datos viejos en pantalla. Cada hook compone desde la raíz:
`[QK.events, query]`. Las mutaciones invalidan agrupando en un `useInvalidateX()` local.

## Diseño

`DESIGN.md` es el sistema (paleta OKLCH, tipografía, reglas nombradas, do's & don'ts) y
`PRODUCT.md` el producto (usuarios, escenarios, terminología). Los dos son normativos para
cualquier trabajo visual: leerlos antes de tocar UI. Tres reglas que se rompen seguido:

- **Los dos celestes**: el brillante va sobre oscuro, el profundo sobre claro. Ningún
  escalón de la rampa oficial sirve para texto sobre fondo claro (el mejor da 1.78:1).
- **Neutro sin croma**: fondos, bordes y chips en gris real, sin teñir de celeste.
- **El celeste no pinta más de una décima parte de la pantalla.**

Los tokens viven en `src/index.css` como variables CSS y **no se repiten en los
componentes**; hay tres capas que reapuntan tokens y conviene conocerlas antes de escribir
un color a mano: `.dark` (modo oscuro, lo aplica `PanelShell`, así que solo existe en los
paneles), `.force-light` (lo que representa un objeto físico —el recibo es papel, la
credencial se exporta como PNG— y no puede oscurecerse nunca) y `.chrome-band` (la banda
superior del panel, que hace que un `variant="outline"` siga significando lo mismo sobre
otro fondo).

`src/components/ui/` es shadcn (tocar solo para adaptar); lo propio va en
`src/components/custom/`. `maquetas/` es HTML suelto, fuera de git y del build, para probar
composiciones sin tocar `src/` — es el lugar donde maquetar antes de escribir componentes.

La skill `impeccable` está instalada con hooks en `.claude/settings.local.json` que corren
un chequeo de diseño después de cada Edit/Write sobre archivos de UI y una pasada completa
al terminar. Su salida es señal, no ruido.

## Convenciones

- **El código habla español**: comentarios, mensajes al usuario, nombres de rutas, commits.
  Los identificadores siguen en inglés.
- **Los comentarios explican el porqué, no el qué.** Es la convención más fuerte del repo:
  cada decisión no obvia lleva arriba el caso real que la motivó y qué se rompía sin ella.
  Al modificar código comentado así, actualizar el comentario o el próximo lector va a
  restaurar el bug que ese párrafo evitaba.
- Sin punto y coma, comillas simples, indentación de 4 espacios en todo `src/` (incluido
  lo que vino de shadcn, ya reformateado). No hay Prettier: se copia el estilo del archivo.
- TS strict con `noUnusedLocals`, `noUnusedParameters` y `noUncheckedIndexedAccess`
  (indexar devuelve `T | undefined`, hay que manejarlo). Cero `any`.
  `exactOptionalPropertyTypes` está pendiente a propósito — ver la nota en `tsconfig.app.json`.
- Formularios: react-hook-form + Zod, componiendo las reglas de `src/shared/schemas/fields.ts`
  (que ya se duplicaron y divergieron una vez). El CUIL identifica al socio, el DNI no.
- Feedback al usuario con `notify` de `@/lib/notify` (envuelve el `toast` de sonner y le
  calcula la duración según el largo; ESLint no deja importar `toast` directo),
  diálogos con `ConfirmDialog` / `FormDialog`.
- **Tests**: solo `src/**/*.spec.ts`, entorno `node`, sin DOM. Se prueba lógica pura —
  por eso las decisiones del dominio se extraen a `lib/` en vez de quedar en el componente.
  Al agregar reglas de negocio, sacarlas a un `lib/x.ts` con su `x.spec.ts` al lado.
- **Commits en español, en minúscula, contando qué cambió para quien usa la app**
  ("el ojito para ver la contraseña, en las tres pantallas que la piden"). Sin prefijos
  tipo `feat:`.
