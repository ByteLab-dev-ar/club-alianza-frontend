import { describe, expect, it } from 'vitest'
import { getApiErrorMessage, unwrap, unwrapPaginated } from './clubApi'
import type { ApiResponse, PaginatedResponse, PaginationMeta } from './types'

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

const meta: PaginationMeta = {
    totalItems: 1,
    itemCount: 1,
    itemsPerPage: 20,
    totalPages: 1,
    currentPage: 1,
}

/** Sobre estándar del backend; cada test pisa lo que necesita. */
const envelope = <T>(overrides: Partial<ApiResponse<T>>): ApiResponse<T> =>
    ({
        success: true,
        statusCode: 200,
        message: 'OK',
        timestamp: '2026-08-04T00:00:00.000Z',
        path: '/algo',
        ...overrides,
    }) as ApiResponse<T>

describe('unwrap', () => {
    it('devuelve el data del sobre', () => {
        expect(unwrap({ data: envelope({ data: { id: 'x' } }) })).toEqual({ id: 'x' })
    })

    it('una respuesta SIN campo success avisa que no usa el sobre, no que falló el server', () => {
        // Los endpoints con @IgnoreResponseInterceptor responden el payload crudo:
        // el problema es la action, no el backend, y el mensaje tiene que decirlo.
        const crudo = { data: { id: 'x' } } as unknown as { data: ApiResponse<unknown> }
        expect(() => unwrap(crudo)).toThrow(/sobre estándar/)
    })

    it('con success: false usa el message que redactó el backend', () => {
        expect(() =>
            unwrap({ data: envelope({ success: false, message: 'No se pudo procesar' }) }),
        ).toThrow('No se pudo procesar')
    })
})

describe('unwrapPaginated', () => {
    it('junta items y meta', () => {
        const response = { data: envelope({ data: [{ id: 'x' }], meta }) as PaginatedResponse<{ id: string }> }
        expect(unwrapPaginated(response)).toEqual({ items: [{ id: 'x' }], meta })
    })

    it('hereda la guarda de success: false en vez de devolver items undefined', () => {
        // Sin esto el fallo salía recién en la tabla, como "items.map is not a function".
        const response = {
            data: envelope({ success: false, message: 'Se cayó el listado' }),
        } as { data: PaginatedResponse<unknown> }
        expect(() => unwrapPaginated(response)).toThrow('Se cayó el listado')
    })

    it('rechaza un sobre válido cuyo data no es un array', () => {
        const response = { data: envelope({ data: { id: 'x' }, meta }) } as unknown as {
            data: PaginatedResponse<unknown>
        }
        expect(() => unwrapPaginated(response)).toThrow(/listado paginado/)
    })

    it('rechaza un listado sin meta: Pagination lo leería como undefined', () => {
        const response = { data: envelope({ data: [] }) } as unknown as {
            data: PaginatedResponse<unknown>
        }
        expect(() => unwrapPaginated(response)).toThrow(/listado paginado/)
    })
})
