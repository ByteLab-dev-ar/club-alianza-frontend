import { describe, expect, it } from 'vitest'
import { resolveToastDuration, toastDuration } from './toast-duration'

describe('toastDuration', () => {
    it('un mensaje corto se queda en los 4 s de siempre', () => {
        expect(toastDuration('Perfil actualizado')).toBe(4000)
    })

    it('dos frases ganan tiempo según el largo', () => {
        expect(toastDuration('Recibo anulado. Si hay que corregir, se emite uno nuevo.')).toBe(5400)
    })

    it('cuenta la descripción igual que el título', () => {
        expect(toastDuration('Aprobado', 'x'.repeat(40))).toBe(toastDuration(`Aprobado${'x'.repeat(40)}`))
    })

    it('un 400 con varios errores juntados no pasa del techo', () => {
        const errores =
            'El CUIL tiene que tener 11 dígitos, sin guiones · La fecha de nacimiento no puede ser posterior a hoy · El teléfono tiene que tener entre 8 y 15 dígitos'
        expect(toastDuration(errores)).toBe(10000)
    })
})

describe('resolveToastDuration', () => {
    it('sin duration, usa la fórmula', () => {
        expect(resolveToastDuration('Recibo anulado. Si hay que corregir, se emite uno nuevo.')).toBe(5400)
    })

    it('un duration Infinity explícito se respeta', () => {
        const notice = {
            description:
                'El socio ya estaba cubierto hasta ese mes o más allá, así que este pago no le sumó tiempo.',
            duration: Infinity,
        }
        expect(resolveToastDuration('Aprobado, pero no le movió el vencimiento', notice)).toBe(Infinity)
    })

    it('un duration explícito corto no lo pisa la fórmula', () => {
        expect(resolveToastDuration('Recibo anulado. Si hay que corregir, se emite uno nuevo.', { duration: 2000 })).toBe(2000)
    })
})
