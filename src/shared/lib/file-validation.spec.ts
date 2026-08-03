import { describe, expect, it } from 'vitest'
import { CSV_TYPES, IMAGE_OR_PDF_TYPES, validateUpload } from './file-validation'

const makeFile = (name: string, type: string, sizeBytes = 10) =>
    new File([new Uint8Array(sizeBytes)], name, { type })

describe('validateUpload', () => {
    it('acepta una imagen válida con las reglas por defecto', () => {
        expect(validateUpload(makeFile('foto.png', 'image/png'))).toBeNull()
        expect(validateUpload(makeFile('foto.jpg', 'image/jpeg'))).toBeNull()
    })

    it('rechaza por tamaño, nombrando el tope', () => {
        const grande = makeFile('grande.jpg', 'image/jpeg', 6 * 1024 * 1024)
        expect(validateUpload(grande)).toContain('5MB')
    })

    it('rechaza por tipo aunque el tamaño esté bien', () => {
        expect(validateUpload(makeFile('anim.gif', 'image/gif'))).toContain('Solo se aceptan')
    })

    it('acepta PDF cuando la lista lo incluye', () => {
        const pdf = makeFile('comprobante.pdf', 'application/pdf')
        expect(validateUpload(pdf, { types: IMAGE_OR_PDF_TYPES })).toBeNull()
    })

    it('deja pasar archivos SIN type conocido (los .csv de Windows suelen venir vacíos)', () => {
        const sinTipo = makeFile('padron.csv', '')
        expect(validateUpload(sinTipo, { types: CSV_TYPES, typesLabel: 'archivos CSV' })).toBeNull()
    })

    it('respeta un tope de tamaño custom', () => {
        const archivo = makeFile('a.png', 'image/png', 2 * 1024 * 1024)
        expect(validateUpload(archivo, { maxSize: 1024 * 1024 })).toContain('1MB')
    })
})
