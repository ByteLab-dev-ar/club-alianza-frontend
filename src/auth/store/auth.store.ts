import { create } from 'zustand'
import { queryClient } from '@/api/queryClient'
import { SESSION_EXPIRED_EVENT } from '@/api/clubApi'
import { loginAction } from '../actions/login.action'
import { checkAuthAction } from '../actions/check-auth.action'
import { logoutAction } from '../actions/logout.action'
import type { SessionUser } from '../interfaces/User'
import { hasRole, type Role } from '@/constants/roles'

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated'

interface AuthState {
    status: AuthStatus
    user: SessionUser | null

    loginUser: (email: string, password: string) => Promise<SessionUser>
    checkAuthStatus: () => Promise<boolean>
    logoutUser: () => Promise<void>
    is: (...roles: Role[]) => boolean
}

/**
 * A diferencia de un store con Bearer token, acá NO se persiste nada: la sesión
 * vive en cookies httpOnly que el JS no puede leer. El estado se rehidrata en cada
 * arranque preguntando GET /users/me (ver CheckAuthProvider en ClubAlianzaApp).
 */
export const useAuthStore = create<AuthState>()((set, get) => ({
    status: 'checking',
    user: null,

    loginUser: async (email, password) => {
        // Dos pasos a propósito: /auth/login setea las cookies pero devuelve un
        // usuario recortado, SIN roles. Los roles solo salen de /users/me, y sin
        // ellos no se puede decidir a qué panel mandar a la persona.
        await loginAction(email, password)
        const user = await checkAuthAction()

        set({ status: 'authenticated', user })
        return user
    },

    checkAuthStatus: async () => {
        try {
            const user = await checkAuthAction()
            set({ status: 'authenticated', user })
            return true
        } catch {
            // El cache se vacía SOLO si veníamos de una sesión viva (ahí sí hay
            // datos personales que borrar). En el arranque de un visitante
            // anónimo el 401 es lo esperable, y limpiar ahí tiraría las queries
            // públicas —eventos, galería— que ya están cargando en la home.
            if (get().status === 'authenticated') queryClient.clear()
            set({ status: 'not-authenticated', user: null })
            return false
        }
    },

    logoutUser: async () => {
        try {
            await logoutAction()
        } finally {
            // Aunque el backend falle, localmente cerramos la sesión igual.
            // El cache de React Query guarda datos personales (perfil, pagos,
            // credencial): se vacía para que no le queden visibles al próximo
            // usuario que se loguee en la misma máquina.
            queryClient.clear()
            set({ status: 'not-authenticated', user: null })
        }
    },

    is: (...roles) => hasRole(get().user?.roles, ...roles),
}))

/**
 * Puente desde la capa de API: si el refresh falla con la app abierta (el
 * refreshToken venció o se revocó), el interceptor avisa por evento y acá se
 * cierra la sesión de verdad. Los guards ven 'not-authenticated' y redirigen
 * al login, en vez de dejar la pantalla llena de errores.
 *
 * Se suscribe a nivel de módulo, no en un componente: el puente tiene que
 * existir apenas se importa el store, sin depender de qué se haya montado.
 */
window.addEventListener(SESSION_EXPIRED_EVENT, () => {
    // Solo aplica si había sesión. Durante el arranque (status 'checking') el
    // 401 de /users/me es el caso normal de un visitante anónimo: ahí no hay
    // nada que cerrar, y limpiar el cache le cortaría las queries públicas.
    if (useAuthStore.getState().status !== 'authenticated') return

    queryClient.clear()
    useAuthStore.setState({ status: 'not-authenticated', user: null })
})
