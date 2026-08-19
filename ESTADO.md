# Estado del frontend — rama `nucleo-frontend`

> Última actualización: 2026-08-19.

## Qué hay en esta rama

El portal puesto al día con los cinco núcleos del backend. Son 17 commits sobre `main`, en
el orden en que se construyeron:

| Fase | Qué entró |
| --- | --- |
| 0 | Se retiró `POST /payments` y se alinearon los tipos con el backend |
| 1 | El trámite de afiliación del socio (§1) y la ficha firmada |
| 2 | La bandeja de solicitudes en el panel |
| 3 | Menores y tutores (§2), invitaciones de tutor y cierre de cuenta |
| 4 | El carrito con la cadena de §5.3, y el recibo del club |
| 5 | Montos y grupos familiares |
| 6 | Mostrador y verificación de recibos |
| 7 | Filtros del padrón, marca de jugador, cuenta, tutores y revisión del CSV |

Más los arreglos posteriores: el ojito de las contraseñas, la foto de perfil que salía rota,
la confirmación de los documentos subidos, la grilla de los formularios, dejar de ofrecerle
afiliarse a quien ya es socio, `memberNumber` como número, el menú del panel agrupado, el
volver del verificador sin perder el filtro, y los dos diálogos de grupos familiares.

## Cómo traerla en otra PC

**Un `git pull` a secas no la trae**: todo esto vive en `nucleo-frontend`, no en `main`.

```bash
git fetch origin
git checkout nucleo-frontend
pnpm install
```

Si `pnpm install` no corre, el `node_modules` viejo puede tener paquetes que ya no están en
`package.json` y la app arranca con errores raros de import.

## Configuración que hace falta

`.env` no está en git. En cada máquina tiene que existir con:

```
VITE_API_URL=http://localhost:3000/api
```

El backend tiene que estar corriendo en el puerto 3000. El proxy de Vite manda `/api` ahí,
y de eso dependen la foto de perfil, los documentos del panel y los comprobantes: el
backend los sirve por rutas relativas a la raíz.

## Estado de verificación

Al 2026-08-19, sobre el último commit de la rama:

- `npx tsc -b` — sin errores
- `npx eslint .` — sin errores
- `npx vitest run` — 132 tests en 15 suites
- `npx vite build` — OK

## Lo que queda abierto del lado del backend

Uno solo, con dos síntomas: `FamilyGroupResponseDto.members` trae solo a los integrantes de
ESTE mes, así que el panel no puede saber quién suma desde el mes que viene ni si el grupo
alguna vez tuvo a alguien. El detalle está en el prompt que se le pasó al backend.
