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
    /**
     * Por qué se cerró la sesión, cuando hay algo que explicar. Lo consume el
     * login para mostrarlo: es el caso del refreshToken reusado, donde el
     * backend cierra todas las sesiones y ese texto es la única explicación que
     * la persona va a recibir.
     */
    sessionEndedMessage: string | null

    loginUser: (email: string, password: string) => Promise<SessionUser>
    checkAuthStatus: () => Promise<boolean>
    logoutUser: () => Promise<void>
    clearSession: (reason?: string) => void
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
    sessionEndedMessage: null,

    loginUser: async (email, password) => {
        // Dos pasos a propósito: /auth/login setea las cookies pero devuelve un
        // usuario recortado, SIN roles. Los roles solo salen de /users/me, y sin
        // ellos no se puede decidir a qué panel mandar a la persona.
        await loginAction(email, password)
        const user = await checkAuthAction()

        // Entrar bien es lo que da por leído el aviso de la sesión anterior. No
        // se limpia en un efecto de montaje del login: con <StrictMode> el ciclo
        // mount→unmount→mount se lo comería antes de que llegue a verse.
        set({ status: 'authenticated', user, sessionEndedMessage: null })
        return user
    },

    checkAuthStatus: async () => {
        try {
            const user = await checkAuthAction()
            set({ status: 'authenticated', user })
            return true
        } catch {
            // Si mientras esta consulta estaba en vuelo alguien completó un login
            // (loginUser ya puso 'authenticated'), este fracaso es VIEJO: venía
            // del arranque anónimo, no de la sesión nueva. Pisarla acá echaba al
            // usuario recién logueado. El caso "la sesión murió de verdad" no se
            // pierde: lo cubre el evento SESSION_EXPIRED del interceptor, que es
            // quien detecta un refresh fallido con la app abierta.
            if (get().status === 'authenticated') return false

            set({ status: 'not-authenticated', user: null })
            return false
        }
    },

    logoutUser: async () => {
        try {
            await logoutAction()
        } finally {
            // Aunque el backend falle, localmente cerramos la sesión igual.
            get().clearSession()
        }
    },

    /**
     * Cierra la sesión localmente, SIN pegarle al backend. Para cuando las
     * cookies ya están muertas del otro lado: un reset de contraseña (que revoca
     * todas las sesiones, incluida la de este dispositivo) o un refresh
     * rechazado. Llamar a `/auth/logout` ahí solo suma dos requests fallidas
     * —ese path ni siquiera está en NO_REFRESH_PATHS, así que dispararía un
     * refresh que también falla— para hacer algo que ya es puramente local.
     *
     * El cache de React Query se vacía porque guarda datos personales (perfil,
     * pagos, credencial): no le tienen que quedar visibles a quien se loguee
     * después en esa misma máquina.
     */
    clearSession: (reason) => {
        queryClient.clear()
        set({ status: 'not-authenticated', user: null, sessionEndedMessage: reason ?? null })
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
// El typeof permite importar el store fuera del navegador (los specs corren en
// Node): ahí no hay interceptor que emita el evento, así que no se pierde nada.
if (typeof window !== 'undefined') {
    window.addEventListener(SESSION_EXPIRED_EVENT, (event) => {
        // Solo aplica si había sesión. Durante el arranque (status 'checking') el
        // 401 de /users/me es el caso normal de un visitante anónimo: ahí no hay
        // nada que cerrar, y limpiar el cache le cortaría las queries públicas.
        //
        // Este filtro es también el motivo por el que el mensaje se guarda acá y
        // no se muestra desde un componente: para cuando cualquier componente
        // recibiera el evento, el status ya sería 'not-authenticated' y no habría
        // forma de distinguir una sesión que murió de un visitante anónimo.
        if (useAuthStore.getState().status !== 'authenticated') return

        useAuthStore.getState().clearSession(event.detail?.message)
    })
}
