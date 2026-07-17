import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        // El backend fija FRONTEND_URL=http://localhost:3001 — de ahí salen el origin
        // permitido por CORS y el destino del redirect de Google OAuth.
        port: 3001,
        strictPort: true,
    },
})
