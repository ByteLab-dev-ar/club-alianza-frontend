import { type PropsWithChildren, useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { appRouter } from './router/router.app'
import { Toaster } from './components/ui/sonner'
import { PageLoader } from './components/custom/PageLoader'
import { useAuthStore } from './auth/store/auth.store'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})

/**
 * Las cookies de sesión son httpOnly: el JS no puede leerlas, así que la única
 * manera de saber si hay sesión al abrir la app es preguntárselo al backend.
 * Hasta que responda, el router no se monta (si no, los guards verían
 * "not-authenticated" y patearían al login a alguien que sí tiene sesión).
 */
const CheckAuthProvider = ({ children }: PropsWithChildren) => {
    const status = useAuthStore((state) => state.status)
    const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus)

    useEffect(() => {
        void checkAuthStatus()
    }, [checkAuthStatus])

    if (status === 'checking') return <PageLoader />

    return children
}

export const ClubAlianzaApp = () => {
    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <Toaster />
                <CheckAuthProvider>
                    <RouterProvider router={appRouter} />
                </CheckAuthProvider>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </HelmetProvider>
    )
}
