import { beforeEach, describe, expect, it, vi } from 'vitest'

// Se mockean las actions (la capa HTTP): lo que se prueba acá son las
// transiciones de estado del store, no axios.
vi.mock('../actions/login.action', () => ({ loginAction: vi.fn() }))
vi.mock('../actions/check-auth.action', () => ({ checkAuthAction: vi.fn() }))
vi.mock('../actions/logout.action', () => ({ logoutAction: vi.fn() }))

import { checkAuthAction } from '../actions/check-auth.action'
import { loginAction } from '../actions/login.action'
import { logoutAction } from '../actions/logout.action'
import type { SessionUser } from '../interfaces/User'
import { useAuthStore } from './auth.store'

const mockedCheck = vi.mocked(checkAuthAction)
const mockedLogin = vi.mocked(loginAction)
const mockedLogout = vi.mocked(logoutAction)

const sessionUser: SessionUser = {
    id: 'user-1',
    email: 'socio@club.com',
    roles: ['user'],
    isActive: true,
    isEmailVerified: true,
    deactivatedAt: null,
    isMember: true,
    createdAt: '2026-01-01T00:00:00.000Z',
}

/** Promise controlable a mano, para simular requests que resuelven fuera de orden. */
const deferred = <T,>() => {
    let reject!: (reason?: unknown) => void
    let resolve!: (value: T) => void
    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })
    return { promise, resolve, reject }
}

beforeEach(() => {
    vi.clearAllMocks()
    // El store es un singleton de módulo: cada test arranca del estado inicial.
    useAuthStore.setState({ status: 'checking', user: null })
})

describe('checkAuthStatus', () => {
    it('con sesión válida queda authenticated y devuelve el usuario', async () => {
        mockedCheck.mockResolvedValueOnce(sessionUser)

        const ok = await useAuthStore.getState().checkAuthStatus()

        expect(ok).toBe(true)
        expect(useAuthStore.getState().status).toBe('authenticated')
        expect(useAuthStore.getState().user).toEqual(sessionUser)
    })

    it('sin sesión (arranque anónimo) queda not-authenticated', async () => {
        mockedCheck.mockRejectedValueOnce(new Error('401'))

        const ok = await useAuthStore.getState().checkAuthStatus()

        expect(ok).toBe(false)
        expect(useAuthStore.getState().status).toBe('not-authenticated')
    })

    it('un fracaso VIEJO no pisa un login que terminó mientras tanto', async () => {
        // La carrera real: el chequeo del arranque (anónimo) sale primero pero
        // su 401 llega DESPUÉS de que el usuario completó el login.
        const slowStartupCheck = deferred<SessionUser>()
        mockedCheck.mockReturnValueOnce(slowStartupCheck.promise)

        const startupCheck = useAuthStore.getState().checkAuthStatus()

        // Mientras el chequeo está en vuelo, un login entero se completa.
        mockedLogin.mockResolvedValueOnce({ id: 'user-1', email: sessionUser.email, name: 'Nico' })
        mockedCheck.mockResolvedValueOnce(sessionUser)
        await useAuthStore.getState().loginUser(sessionUser.email, 'Password1!')
        expect(useAuthStore.getState().status).toBe('authenticated')

        // Recién ahora aterriza el 401 viejo del arranque.
        slowStartupCheck.reject(new Error('401'))
        await startupCheck

        // La sesión nueva sobrevive: el fracaso stale no expulsa a nadie.
        expect(useAuthStore.getState().status).toBe('authenticated')
        expect(useAuthStore.getState().user).toEqual(sessionUser)
    })
})

describe('logoutUser', () => {
    it('cierra la sesión localmente aunque el backend falle', async () => {
        useAuthStore.setState({ status: 'authenticated', user: sessionUser })
        mockedLogout.mockRejectedValueOnce(new Error('500'))

        await useAuthStore.getState().logoutUser().catch(() => undefined)

        expect(useAuthStore.getState().status).toBe('not-authenticated')
        expect(useAuthStore.getState().user).toBeNull()
    })
})
