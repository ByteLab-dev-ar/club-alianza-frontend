import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'

import { getApiErrorMessage } from '@/api/clubApi'
import { normalizeBlobError } from './open-private-file'

/**
 * Arma un error de axios con el cuerpo que corresponda, imitando lo que llega
 * al pedir un archivo con `responseType: 'blob'`: ahí axios envuelve TAMBIÉN
 * las respuestas de error, así que el JSON del backend viaja dentro de un Blob.
 */
const axiosErrorWith = (data: unknown, status = 403): AxiosError => {
    const config = { headers: new AxiosHeaders() }
    return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
        data,
        status,
        statusText: '',
        headers: {},
        config,
    })
}

describe('normalizeBlobError', () => {
    it('saca el mensaje del backend de adentro del Blob', async () => {
        // Sin esto el mensaje se pierde en silencio: getApiErrorMessage lo busca
        // en response.data.message, que sobre un Blob es undefined, y el usuario
        // ve siempre el texto de fallback en vez del motivo real.
        const error = axiosErrorWith(
            new Blob([JSON.stringify({ message: 'No tenés permiso para ver este archivo' })]),
        )

        await normalizeBlobError(error)

        expect(getApiErrorMessage(error, 'fallback')).toBe(
            'No tenés permiso para ver este archivo',
        )
    })

    it('deja el error intacto si el cuerpo no es JSON', async () => {
        // Un 502 del proxy devuelve HTML, no el sobre de la API.
        const error = axiosErrorWith(new Blob(['<html>502 Bad Gateway</html>']))

        await normalizeBlobError(error)

        expect(getApiErrorMessage(error, 'fallback')).toBe('fallback')
    })

    it('no rompe con un cuerpo vacío', async () => {
        const error = axiosErrorWith(new Blob([]))

        await expect(normalizeBlobError(error)).resolves.toBeUndefined()
        expect(getApiErrorMessage(error, 'fallback')).toBe('fallback')
    })

    it('no toca un error que ya viene con JSON parseado', async () => {
        // Las demás requests de la app no usan responseType blob: ahí el cuerpo
        // ya viene como objeto y esta función tiene que ser un no-op.
        const error = axiosErrorWith({ message: 'Ya viene parseado' })

        await normalizeBlobError(error)

        expect(getApiErrorMessage(error, 'fallback')).toBe('Ya viene parseado')
    })

    it('ignora lo que no sea un error de axios', async () => {
        await expect(normalizeBlobError(new Error('cualquier cosa'))).resolves.toBeUndefined()
        await expect(normalizeBlobError(null)).resolves.toBeUndefined()
    })
})
