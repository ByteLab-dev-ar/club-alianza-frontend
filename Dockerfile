# Etapa de build: compila los estáticos con Vite. node:24-alpine para
# alinear la versión de Node con la del backend.
FROM node:24-alpine AS builder
WORKDIR /app

# pnpm-workspace.yaml tiene que estar ANTES de "pnpm install": trae el
# allowBuilds de @swc/core y esbuild — sin él, pnpm bloquea esos binarios
# nativos y el build falla con ERR_PNPM_IGNORED_BUILDS.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Sin versión explícita, corepack activaría "latest": con el tiempo eso
# termina siendo un pnpm más nuevo que el que generó el lockfile, y una
# versión más nueva puede validarlo con reglas más estrictas y romper el
# build. El campo "packageManager" de package.json fija la versión exacta.
RUN corepack enable && corepack prepare --activate

RUN pnpm install --frozen-lockfile

COPY . .

# Las variables VITE_ se incrustan en el JS al compilar (import.meta.env), no
# se leen en runtime — por eso van como ARG/ENV de esta etapa de build, y no
# como env vars del contenedor final (que ni siquiera corre Node). Default a
# ruta relativa: el Nginx del sistema en el VPS redirige /api al backend, así
# que el navegador pide todo por el mismo origen — sin CORS, sin problemas de
# cookies entre dominios. Ninguna de las dos es secreta: quedan visibles en
# el JS que descarga cualquiera, así que nunca va acá una API key ni nada
# parecido.
ARG VITE_API_URL=/api
ARG VITE_SENTRY_DSN=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

RUN pnpm run build

# Etapa final: sirve los estáticos con Nginx. Solo pasa el dist/ — nada de
# node_modules, código fuente ni el toolchain de Node quedan en la imagen
# que corre en el VPS.
FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
