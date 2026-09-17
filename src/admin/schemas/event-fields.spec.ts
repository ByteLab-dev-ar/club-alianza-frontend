import { describe, expect, it } from 'vitest'
import { eventTimeField } from './event-fields'

/**
 * El caso que dio origen a la regla: el formulario exigía HH:MM y un evento
 * guardado como "De 10 a 18 hs" no se podía ni editar ni borrar. Si alguno de
 * estos tests se pone en rojo, el panel volvió a pedir un formato que el
 * backend no pide (`varchar(20)`, `@IsOptional @IsString @MaxLength(20)`).
 */
describe('eventTimeField', () => {
    const parse = (value: string) => eventTimeField.safeParse(value)

    it('acepta la hora exacta, el caso más común', () => {
        expect(parse('16:00')).toMatchObject({ success: true, data: '16:00' })
    })

    it('acepta el texto libre que el club escribe mirando el flyer', () => {
        // Los tres los nombra el backend: el seed carga "De 10 a 18 hs" y el
        // orden de la agenda menciona "A confirmar".
        expect(parse('De 10 a 18 hs')).toMatchObject({ success: true, data: 'De 10 a 18 hs' })
        expect(parse('A confirmar')).toMatchObject({ success: true, data: 'A confirmar' })
        expect(parse('Todo el día')).toMatchObject({ success: true, data: 'Todo el día' })
    })

    it('acepta la hora sin cero adelante y NO la normaliza', () => {
        // A propósito: el backend ordena con `lpad(substring(...), 5, '0')`, que
        // le rellena el cero solo. Normalizar sería reescribirle el texto a
        // quien lo cargó sin que el orden gane nada.
        expect(parse('9:00')).toMatchObject({ success: true, data: '9:00' })
    })

    it('deja pasar el campo vacío: si hay flyer, la hora ya está impresa ahí', () => {
        expect(parse('')).toMatchObject({ success: true, data: '' })
    })

    it('convierte los puros espacios en vacío, que es cómo se borra la hora', () => {
        // Sin esto se guardaba una hora en blanco: el alta la manda porque '   '
        // es truthy y el backend la acepta (su @IsOptional solo saltea
        // null/undefined, no el string con espacios).
        expect(parse('   ')).toMatchObject({ success: true, data: '' })
    })

    it('recorta los espacios de alrededor', () => {
        expect(parse('  De 10 a 18 hs  ')).toMatchObject({
            success: true,
            data: 'De 10 a 18 hs',
        })
    })

    it('respeta el tope de 20 de la columna del backend', () => {
        expect(parse('x'.repeat(20)).success).toBe(true)
        const tooLong = parse('x'.repeat(21))
        expect(tooLong.success).toBe(false)
        expect(tooLong.error?.issues[0]?.message).toBe('Máximo 20 caracteres')
    })

    it('recorta ANTES de medir: los 20 no se gastan en espacios', () => {
        // El orden de los checks de Zod es el orden en que se escriben. Con
        // `.max(20).trim()` esto se rechazaría, y un valor de 20 caracteres
        // pegado con espacios alrededor no se podría guardar.
        expect(parse(`  ${'x'.repeat(20)}  `)).toMatchObject({
            success: true,
            data: 'x'.repeat(20),
        })
    })
})
