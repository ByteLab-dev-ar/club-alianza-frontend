import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { clubApi } from '@/api/clubApi'
import { openPrivateFile } from './open-private-file'

/**
 * Estos tests levantan un servidor de verdad y hacen pasar a `openPrivateFile`
 * por el cliente axios real, con su interceptor.
 *
 * El motivo de existir de todo el helper es que la request pase por ese
 * interceptor para que el token se refresque solo. Eso no se puede verificar
 * mirando el código: hay que ver el 401, el refresh y el reintento ocurrir.
 */

/** Rutas que pidió el navegador, en orden. Cada test la vacía. */
let requests: string[] = []
/** Cuántos 401 le quedan por devolver al endpoint del archivo. */
let pending401 = 0

let baseUrl = ''
let server: http.Server

beforeAll(async () => {
    server = http.createServer((req, res) => {
        requests.push(`${req.method} ${req.url}`)

        if (req.url === '/api/auth/refresh') {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, data: null }))
            return
        }

        if (pending401 > 0) {
            pending401--
            res.writeHead(401, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, message: 'Unauthorized' }))
            return
        }

        res.writeHead(200, { 'Content-Type': 'application/pdf' })
        res.end('%PDF-1.4 contenido')
    })

    await new Promise<void>((resolve) => server.listen(0, resolve))
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    clubApi.defaults.baseURL = `${baseUrl}/api`

    // El helper abre una pestaña y arma un object URL; en Node no hay ninguna de
    // las dos cosas. Se stubbea lo mínimo para que el flujo corra: `window.open`
    // devuelve null a propósito, que es la rama de "el navegador bloqueó el
    // popup" y cae a la descarga con un <a>.
    vi.stubGlobal('window', { open: () => null })
    vi.stubGlobal('document', { createElement: () => ({ click: () => undefined }) })

    // En Node el adaptador HTTP de axios ignora `responseType: 'blob'` y entrega
    // un string, así que el `createObjectURL` real explota. Se mockean SOLO los
    // dos métodos —no el global `URL`— porque el constructor lo usan tanto axios
    // como el interceptor de refresh para resolver rutas.
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
})

afterEach(() => {
    requests = []
    pending401 = 0
})

afterAll(async () => {
    vi.unstubAllGlobals()
    await new Promise<void>((resolve) => server.close(() => resolve()))
})

describe('openPrivateFile', () => {
    it('pide el archivo por la ruta que manda el backend, sin duplicar /api', async () => {
        // Es el error que el `baseURL: ''` evita: el cliente tiene baseURL
        // terminado en /api y la ruta del backend YA lo incluye. Sin el override
        // la request sale a /api/api/... y da 404.
        await openPrivateFile(`${baseUrl}/api/payments/42/receipt`)

        expect(requests).toEqual(['GET /api/payments/42/receipt'])
    })

    it('ante un 401 refresca el token y reintenta solo: el archivo llega igual', async () => {
        // ESTA es la razón de ser del helper. Con un <a href> el navegador
        // mostraba el 401 crudo en una pestaña nueva, porque una navegación no
        // pasa por el interceptor.
        pending401 = 1

        await expect(
            openPrivateFile(`${baseUrl}/api/admin/payments/7/receipt`),
        ).resolves.toBeUndefined()

        expect(requests).toEqual([
            'GET /api/admin/payments/7/receipt',
            'POST /api/auth/refresh',
            'GET /api/admin/payments/7/receipt',
        ])
    })

    it('si el refresh tampoco alcanza, propaga el error en vez de abrir nada', async () => {
        // El interceptor reintenta UNA sola vez: si el segundo intento vuelve a
        // dar 401, el error tiene que llegar al llamador para que muestre su
        // propio aviso.
        pending401 = 2

        await expect(
            openPrivateFile(`${baseUrl}/api/payments/9/receipt`),
        ).rejects.toThrow()
    })
})
