import { create } from 'zustand'
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
            set({ status: 'not-authenticated', user: null })
            return false
        }
    },

    logoutUser: async () => {
        try {
            await logoutAction()
        } finally {
            // Aunque el backend falle, localmente cerramos la sesión igual.
            set({ status: 'not-authenticated', user: null })
        }
    },

    is: (...roles) => hasRole(get().user?.roles, ...roles),
}))
