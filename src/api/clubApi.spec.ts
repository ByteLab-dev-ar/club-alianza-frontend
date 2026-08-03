import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from './clubApi'

/** Arma un error con la forma que axios marca como propia (isAxiosError). */
const axiosError = (body?: unknown, hasResponse = true) =>
    Object.assign(new Error('Request failed'), {
        isAxiosError: true,
        ...(hasResponse ? { response: { data: body } } : {}),
    })

describe('getApiErrorMessage', () => {
    it('muestra el message del sobre del backend', () => {
        const error = axiosError({ message: 'El DNI ya está cargado' })
        expect(getApiErrorMessage(error)).toBe('El DNI ya está cargado')
    })

    it('con varios errores de validación los muestra TODOS, no solo el primero', () => {
        const error = axiosError({
            message: 'El nombre es muy corto',
            errors: ['El nombre es muy corto', 'El email no es válido'],
        })
        expect(getApiErrorMessage(error)).toBe('El nombre es muy corto · El email no es válido')
    })

    it('con un solo error en errors[] y sin message, usa ese', () => {
        const error = axiosError({ errors: ['Solo este'] })
        expect(getApiErrorMessage(error)).toBe('Solo este')
    })

    it('sin respuesta (red caída) avisa el problema de conexión', () => {
        const error = axiosError(undefined, false)
        expect(getApiErrorMessage(error)).toContain('conexión')
    })

    it('para errores que no son de axios cae al fallback', () => {
        expect(getApiErrorMessage(new Error('boom'), 'No pudimos guardar')).toBe(
            'No pudimos guardar',
        )
    })

    it('con un sobre vacío cae al fallback', () => {
        expect(getApiErrorMessage(axiosError({}), 'Falló')).toBe('Falló')
    })
})
