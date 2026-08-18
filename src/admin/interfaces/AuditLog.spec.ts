import { describe, expect, it } from 'vitest'

import { AUDIT_ACTION_LABELS, auditActionLabel } from './AuditLog'

/**
 * El log de auditoría es una pantalla que alguien LEE para entender qué pasó.
 *
 * Lo que se prueba acá no es la redacción sino las dos formas de fallar que ya
 * ocurrieron: una acción sin traducir saliendo en mayúsculas con guiones bajos,
 * y traducciones sobrevivientes de acciones que el backend dejó de emitir.
 */
describe('las etiquetas del log de auditoría', () => {
    it('traduce las acciones que el club mira todos los días', () => {
        expect(auditActionLabel('APPROVE_MEMBERSHIP_APPLICATION')).toBe(
            'Aprobó una solicitud de socio',
        )
        expect(auditActionLabel('COUNTER_PAYMENT')).toBe('Cobró en la sede')
        expect(auditActionLabel('SET_CONCEPT_PRICE')).toBe('Cargó un monto de cuota')
    })

    /**
     * El backend suma acciones sin migración —el catálogo es un varchar—, así
     * que el mapa se va a quedar corto de nuevo. Que se quede corto es
     * tolerable; que la pantalla muestre `SET_CONCEPT_PRICE` no.
     */
    it('deja legible una acción que todavía no está traducida', () => {
        expect(auditActionLabel('ALGO_QUE_NO_EXISTE_TODAVIA')).toBe(
            'Algo que no existe todavia',
        )
    })

    it('ninguna etiqueta queda gritando en mayúsculas', () => {
        const gritando = Object.values(AUDIT_ACTION_LABELS).filter(
            (label) => label === label.toUpperCase(),
        )

        expect(gritando).toEqual([])
    })

    /**
     * La galería pasó de fotos sueltas a momentos con varias fotos. Las claves
     * de la foto suelta quedaron traducidas mucho después de que el backend
     * dejara de emitirlas: una traducción de algo que no ocurre es peor que
     * ninguna, porque nadie se entera de que sobra.
     */
    it('no traduce acciones que el backend ya no emite', () => {
        expect(AUDIT_ACTION_LABELS.CREATE_GALLERY_IMAGE).toBeUndefined()
        expect(AUDIT_ACTION_LABELS.UPDATE_GALLERY_IMAGE).toBeUndefined()
    })
})
