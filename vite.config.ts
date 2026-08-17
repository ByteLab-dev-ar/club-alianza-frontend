/// <reference types="vitest/config" />
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ mode }) => {
    /**
     * HTTPS es opt-in (`pnpm dev:https`), solo para probar getUserMedia (la
     * cámara del escáner de puerta) desde el celular por la IP de la LAN:
     * los navegadores exigen "contexto seguro" —HTTPS o localhost— para dar
     * acceso a la cámara, y una IP de LAN por HTTP no cuenta como ninguno de
     * los dos. `pnpm dev` normal sigue en HTTP, sin nada de esto.
     *
     * El backend NO necesita certificado: el navegador solo ve el origen HTTPS
     * de Vite. Lo que en https va distinto es la URL de la API (ver `define` y
     * `server.proxy` más abajo) — el resto de la config es igual en los dos modos.
     */
    const isHttps = mode === 'https'

    return {
        plugins: [react(), tailwindcss(), ...(isHttps ? [basicSsl()] : [])],
        test: {
            // Los specs actuales prueban lógica pura (schemas, parsers, helpers):
            // no necesitan DOM. Si algún día se testean componentes, cambiar a
            // jsdom o happy-dom en ese momento.
            environment: 'node',
            include: ['src/**/*.spec.ts'],
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        build: {
            rollupOptions: {
                output: {
                    // React y el router casi no cambian entre deploys; separarlos del
                    // código de la app hace que un deploy nuevo no obligue a rebajar
                    // ~180 kB de librería que el browser ya tenía cacheada.
                    manualChunks: {
                        'react-vendor': ['react', 'react-dom', 'react-router'],
                    },
                },
            },
        },
        define: isHttps
            ? {
                  // Con HTTPS, la API tiene que pedirse por el MISMO origen que la
                  // página (ver el proxy abajo): si el front habla HTTPS y pega
                  // directo al backend HTTP, el navegador lo bloquea como
                  // "contenido mixto". Esto pisa en build-time lo que traiga
                  // VITE_API_URL de los .env — confirmado con un build de prueba
                  // que `define` gana esa carrera, no hace falta un .env.https
                  // aparte (que además quedaría fuera de git, como el resto de
                  // los .env).
                  'import.meta.env.VITE_API_URL': JSON.stringify('/api'),
              }
            : undefined,
        server: {
            // El backend fija FRONTEND_URL=http://localhost:3001 — de ahí salen el origin
            // permitido por CORS y el destino del redirect de Google OAuth.
            port: 3001,
            strictPort: true,
            /**
             * El proxy de `/api` va SIEMPRE, no solo en modo https, y no es una
             * comodidad: sin él, en desarrollo se rompe todo lo que el backend
             * sirve por una ruta **relativa a la raíz**.
             *
             * `buildProfilePhotoUrl` y sus hermanas arman las rutas con
             * `API_PUBLIC_BASE_URL ?? '/api'`, así que sin esa variable seteada
             * devuelven `/api/members/<id>/photo?v=…`. El navegador resuelve eso
             * contra el origen de la PÁGINA —`localhost:3001`—, donde Vite no
             * tiene esa ruta y contesta el `index.html` del SPA: un `<img>` que
             * recibe HTML es una imagen rota, y eso es exactamente lo que se veía
             * en el perfil. Lo mismo les pasaba a los documentos del panel y a
             * los comprobantes, que `openPrivateFile` pide con `baseURL: ''`.
             *
             * Con el proxy, el mismo origen sirve la app y la API, que es como se
             * comporta producción. `VITE_API_URL` sigue apuntando a
             * `localhost:3000` y las llamadas de axios no cambian: esto solo
             * agrega el camino que faltaba para las rutas relativas.
             *
             * En https además resuelve otra cosa: el navegador solo ve el origen
             * HTTPS de Vite, y el salto al backend HTTP corre DENTRO del proceso
             * de Vite, así que no hay contenido mixto ni CORS.
             */
            proxy: {
                '/api': {
                    target: 'http://localhost:3000',
                    changeOrigin: true,
                },
            },
        },
    }
})
