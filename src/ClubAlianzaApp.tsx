import { type PropsWithChildren, useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { queryClient } from './api/queryClient'
import { appRouter } from './router/router.app'
import { AppToaster } from './components/custom/AppToaster'
import { useAuthStore } from './auth/store/auth.store'

/**
 * Las cookies de sesión son httpOnly: el JS no puede leerlas, así que la única
 * manera de saber si hay sesión al abrir la app es preguntárselo al backend.
 *
 * La consulta arranca al montar pero NO bloquea el render: el sitio público no
 * depende de la sesión, y las rutas privadas ya esperan solas (los tres guards
 * de ProtectedRoutes muestran el loader mientras status === 'checking'). Antes
 * esto sí bloqueaba, y un visitante anónimo se comía dos requests fallidas
 * —GET /users/me y el refresh que dispara su 401— antes de ver la home.
 */
const CheckAuthProvider = ({ children }: PropsWithChildren) => {
    const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus)

    useEffect(() => {
        void checkAuthStatus()
    }, [checkAuthStatus])

    return children
}

export const ClubAlianzaApp = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AppToaster />
            <CheckAuthProvider>
                <RouterProvider router={appRouter} />
            </CheckAuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}
