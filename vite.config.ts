/// <reference types="vitest/config" />
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
    plugins: [react(), tailwindcss()],
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
    server: {
        // El backend fija FRONTEND_URL=http://localhost:3001 — de ahí salen el origin
        // permitido por CORS y el destino del redirect de Google OAuth.
        port: 3001,
        strictPort: true,
    },
})
