import { describe, expect, it } from 'vitest'
import { extractToken } from './qr-token'

describe('extractToken', () => {
    it('extrae el token de la URL completa que llevan los QR impresos', () => {
        expect(extractToken('https://clubalianza.com.ar/validar/abc123')).toBe('abc123')
    })

    it('ignora query params que algún lector de QR pueda agregar', () => {
        expect(extractToken('https://clubalianza.com.ar/validar/abc123?utm=x')).toBe('abc123')
    })

    it('acepta un token pelado (tarjeta impresa sin la URL)', () => {
        expect(extractToken('abc123')).toBe('abc123')
    })

    it('tolera espacios alrededor', () => {
        expect(extractToken('  abc123  ')).toBe('abc123')
    })

    it('rechaza URLs que no son del validador', () => {
        expect(extractToken('https://clubalianza.com.ar/eventos')).toBeNull()
        expect(extractToken('https://otro-sitio.com/phishing')).toBeNull()
    })

    it('rechaza texto con barras que no parsea como URL', () => {
        expect(extractToken('texto/con/barras')).toBeNull()
    })

    it('rechaza vacío y solo espacios', () => {
        expect(extractToken('')).toBeNull()
        expect(extractToken('   ')).toBeNull()
    })

    it('rechaza la URL del validador sin token', () => {
        expect(extractToken('https://clubalianza.com.ar/validar/')).toBeNull()
    })
})
