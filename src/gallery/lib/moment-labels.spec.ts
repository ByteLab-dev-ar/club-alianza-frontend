import { describe, expect, it } from 'vitest'

import {
    formatMomentDate,
    momentCountLabel,
    momentMeta,
    photoAlt,
    photoCounter,
    photoCountLabel,
    safeCategoryColor,
    viewPhotosLabel,
} from './moment-labels'

describe('formatMomentDate', () => {
    it('es el día calendario, sin corrimiento de huso', () => {
        expect(formatMomentDate('2026-09-03')).toBe('3 de septiembre de 2026')
    })

    it('sin fecha no hay texto', () => {
        expect(formatMomentDate(null)).toBeNull()
    })
})

describe('plurales', () => {
    it('fotos', () => {
        expect(photoCountLabel(1)).toBe('1 foto')
        expect(photoCountLabel(5)).toBe('5 fotos')
    })

    it('momentos, cero incluido', () => {
        expect(momentCountLabel(0)).toBe('0 momentos')
        expect(momentCountLabel(1)).toBe('1 momento')
        expect(momentCountLabel(11)).toBe('11 momentos')
    })

    it('el botón de la portada en singular', () => {
        expect(viewPhotosLabel(1)).toBe('Ver la foto')
        expect(viewPhotosLabel(5)).toBe('Ver las 5 fotos')
    })
})

describe('momentMeta', () => {
    it('une fecha y fotos', () => {
        expect(momentMeta('2026-09-03', 5)).toBe('3 de septiembre de 2026 · 5 fotos')
    })

    it('sin fotos lo dice', () => {
        expect(momentMeta('2026-09-03', 0)).toBe('3 de septiembre de 2026 · Sin fotos todavía')
    })

    it('sin fecha no deja un separador colgado', () => {
        expect(momentMeta(null, 1)).toBe('1 foto')
    })
})

describe('foto', () => {
    it('alt y contador cuentan desde 1', () => {
        expect(photoAlt('Victoria en el clásico', 0, 5)).toBe('Victoria en el clásico — foto 1 de 5')
        expect(photoCounter(2, 5)).toBe('3 de 5')
    })
})

describe('safeCategoryColor', () => {
    it('deja pasar #RRGGBB en cualquier caja', () => {
        expect(safeCategoryColor('#00CCFF')).toBe('#00CCFF')
        expect(safeCategoryColor('#22c55e')).toBe('#22c55e')
    })

    it('todo lo demás es una marca vacía', () => {
        for (const color of ['#FFF', 'red', 'rgb(0,0,0)', '#00CCFF;background:url(x)', '']) {
            expect(safeCategoryColor(color)).toBe('transparent')
        }
    })
})
