import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

/**
 * Instancia única del cache, en módulo propio (y no adentro de ClubAlianzaApp)
 * para que capas sin React —como el auth store— puedan vaciarlo al cerrar sesión.
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Un 4xx no se arregla repitiendo: el 404 de un id inexistente o el
            // 403 de un rol que no alcanza son respuestas definitivas. Reintentar
            // solo demora el estado de error (y con un 401 dispara un refresh de más).
            retry: (failureCount, error) => {
                const status = axios.isAxiosError(error) ? error.response?.status : undefined
                if (status && status < 500) return false
                return failureCount < 1
            },
            refetchOnWindowFocus: false,
        },
    },
})
