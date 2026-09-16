import { describe, expect, it } from 'vitest'

import {
    clampIndex,
    closeFocusTarget,
    imageLoading,
    indexForKey,
    indexFromScroll,
    isEditableTarget,
    swipeStep,
} from './carousel'

describe('clampIndex', () => {
    it('queda dentro de las fotos', () => {
        expect(clampIndex(-1, 5)).toBe(0)
        expect(clampIndex(7, 5)).toBe(4)
        expect(clampIndex(2, 5)).toBe(2)
    })

    it('sin fotos es 0', () => {
        expect(clampIndex(3, 0)).toBe(0)
    })
})

describe('indexFromScroll', () => {
    it('cambia de foto al pasar la mitad', () => {
        expect(indexFromScroll(349, 700, 5)).toBe(0)
        expect(indexFromScroll(351, 700, 5)).toBe(1)
    })

    it('no se pasa de la última', () => {
        expect(indexFromScroll(5000, 700, 5)).toBe(4)
    })

    it('una pista sin ancho está en la primera', () => {
        expect(indexFromScroll(300, 0, 5)).toBe(0)
    })
})

describe('swipeStep', () => {
    it('arrastrar a la izquierda trae la siguiente', () => {
        expect(swipeStep(-80, 10)).toBe(1)
        expect(swipeStep(80, 10)).toBe(-1)
    })

    it('el umbral exacto no alcanza', () => {
        expect(swipeStep(-40, 0)).toBe(0)
        expect(swipeStep(-41, 0)).toBe(1)
    })

    it('un gesto más vertical que horizontal es scroll de página', () => {
        expect(swipeStep(-60, 90)).toBe(0)
    })
})

describe('indexForKey', () => {
    it('las flechas pasan de a una', () => {
        expect(indexForKey('ArrowRight', 1, 5)).toBe(2)
        expect(indexForKey('ArrowLeft', 1, 5)).toBe(0)
    })

    it('en los bordes no hay vuelta ni cambio', () => {
        expect(indexForKey('ArrowLeft', 0, 5)).toBeNull()
        expect(indexForKey('ArrowRight', 4, 5)).toBeNull()
    })

    it('Inicio y Fin solo cuando se piden', () => {
        expect(indexForKey('End', 1, 5)).toBeNull()
        expect(indexForKey('End', 1, 5, { homeEnd: true })).toBe(4)
        expect(indexForKey('Home', 3, 5, { homeEnd: true })).toBe(0)
        expect(indexForKey('Home', 0, 5, { homeEnd: true })).toBeNull()
    })

    it('con una foto o ninguna, nada', () => {
        expect(indexForKey('ArrowRight', 0, 1)).toBeNull()
        expect(indexForKey('ArrowRight', 0, 0)).toBeNull()
    })

    it('otras teclas no hacen nada', () => {
        expect(indexForKey('Enter', 1, 5)).toBeNull()
    })
})

describe('isEditableTarget', () => {
    it('reconoce campos y contenido editable', () => {
        expect(isEditableTarget({ tagName: 'INPUT' })).toBe(true)
        expect(isEditableTarget({ tagName: 'TEXTAREA' })).toBe(true)
        expect(isEditableTarget({ tagName: 'DIV', isContentEditable: true })).toBe(true)
    })

    it('un botón o nada no son editables', () => {
        expect(isEditableTarget({ tagName: 'BUTTON' })).toBe(false)
        expect(isEditableTarget(null)).toBe(false)
    })
})

describe('closeFocusTarget', () => {
    it('abierto con "Pantalla completa", vuelve a ese botón', () => {
        expect(closeFocusTarget('fullscreen', 3)).toBe('fullscreen')
    })

    it('abierto tocando una foto, vuelve a la que quedó a la vista y no a la tocada', () => {
        expect(closeFocusTarget('photo', 3)).toBe(3)
    })

    it('abierto desde la URL, a la foto a la vista', () => {
        expect(closeFocusTarget(null, 0)).toBe(0)
    })
})

describe('imageLoading', () => {
    it('la actual y sus vecinas ya; el resto después', () => {
        expect([0, 1, 2, 3, 4].map((index) => imageLoading(index, 2))).toEqual([
            'lazy',
            'eager',
            'eager',
            'eager',
            'lazy',
        ])
    })
})
