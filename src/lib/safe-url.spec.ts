import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { safeHttpUrl } from './safe-url'

// safeHttpUrl resuelve URLs relativas contra window.location.origin; los specs
// corren en Node, así que se stubbea lo mínimo que usa.
beforeAll(() => {
    vi.stubGlobal('window', { location: { origin: 'https://clubalianza.com.ar' } })
})

afterAll(() => {
    vi.unstubAllGlobals()
})

describe('safeHttpUrl', () => {
    it('deja pasar http y https tal cual', () => {
        expect(safeHttpUrl('https://storage.club/recibo.pdf')).toBe('https://storage.club/recibo.pdf')
        expect(safeHttpUrl('http://storage.club/recibo.pdf')).toBe('http://storage.club/recibo.pdf')
    })

    it('deja pasar rutas relativas (resuelven contra el propio origin)', () => {
        expect(safeHttpUrl('/archivos/recibo.pdf')).toBe('/archivos/recibo.pdf')
    })

    it('bloquea esquemas ejecutables o raros', () => {
        expect(safeHttpUrl('javascript:alert(1)')).toBeUndefined()
        expect(safeHttpUrl('data:text/html,<script>1</script>')).toBeUndefined()
        expect(safeHttpUrl('file:///etc/passwd')).toBeUndefined()
    })

    it('devuelve undefined para vacío, null y undefined', () => {
        expect(safeHttpUrl('')).toBeUndefined()
        expect(safeHttpUrl(null)).toBeUndefined()
        expect(safeHttpUrl(undefined)).toBeUndefined()
    })
})
