import { describe, expect, it } from 'vitest'

import {
    backToGalleryHref,
    buildGallerySearch,
    gallerySearchFromState,
    parseGallerySearch,
    parsePage,
    categorySlug,
    parseViewerParam,
    resolveCategory,
    slugify,
    viewerCloseMode,
    viewerOpenState,
    viewerParamValue,
} from './gallery-url'

describe('slugify', () => {
    it('saca tildes, pasa a minúsculas y une con guiones', () => {
        expect(slugify('Día del Niño')).toBe('dia-del-nino')
        expect(slugify('Inferiores')).toBe('inferiores')
    })

    it('no deja guiones al principio, al final ni repetidos', () => {
        expect(slugify('  ¡Fútbol 5!  ')).toBe('futbol-5')
        expect(slugify('Social / Peñas')).toBe('social-penas')
    })
})

describe('resolveCategory', () => {
    const categories = [
        { id: 'a', name: 'Partidos' },
        { id: 'b', name: 'Día del Niño' },
    ]

    it('encuentra la categoría por el slug de su nombre', () => {
        expect(resolveCategory('dia-del-nino', categories)?.id).toBe('b')
    })

    it('un slug desconocido no resuelve a nada', () => {
        expect(resolveCategory('social', categories)).toBeUndefined()
    })

    it('no matchea por prefijo', () => {
        expect(resolveCategory('part', categories)).toBeUndefined()
    })

    it('con slugs que chocan, cada una resuelve a sí misma', () => {
        const withClash = [...categories, { id: 'c', name: 'Partídos' }]
        expect(resolveCategory('partidos', withClash)?.id).toBe('a')
        expect(resolveCategory('c', withClash)?.id).toBe('c')
    })
})

describe('categorySlug', () => {
    const categories = [
        { id: 'a', name: 'Fútbol' },
        { id: 'b', name: 'Futbol' },
        { id: 'c', name: '⚽' },
        { id: 'd', name: 'Social' },
    ]

    it('lo normal es el slug del nombre', () => {
        expect(categorySlug(categories[3]!, categories)).toBe('social')
    })

    it('si dos chocan, la primera se queda el slug y la otra va por UUID', () => {
        expect(categorySlug(categories[0]!, categories)).toBe('futbol')
        expect(categorySlug(categories[1]!, categories)).toBe('b')
    })

    it('un nombre sin letras ni números no da un slug vacío (sería "Todas")', () => {
        expect(categorySlug(categories[2]!, categories)).toBe('c')
        expect(categorySlug(categories[2]!, [])).toBe('c')
    })

    it('sin la lista todavía, el slug a secas', () => {
        expect(categorySlug(categories[1]!, [])).toBe('futbol')
    })

    it('ningún par de categorías comparte dirección', () => {
        const slugs = categories.map((category) => categorySlug(category, categories))
        expect(new Set(slugs).size).toBe(categories.length)
    })
})

describe('parsePage', () => {
    it('lee enteros positivos', () => {
        expect(parsePage('3')).toBe(3)
    })

    it('todo lo demás es la página 1', () => {
        for (const value of [null, '', '0', '-2', '2.5', 'abc']) {
            expect(parsePage(value)).toBe(1)
        }
    })
})

describe('parseGallerySearch', () => {
    it('sin nada es "Todas", página 1', () => {
        expect(parseGallerySearch(new URLSearchParams())).toEqual({ categorySlug: null, page: 1 })
    })

    it('una categoría vacía cuenta como "Todas"', () => {
        expect(parseGallerySearch(new URLSearchParams('categoria=&pagina=2'))).toEqual({
            categorySlug: null,
            page: 2,
        })
    })
})

describe('buildGallerySearch', () => {
    it('los valores por defecto no se escriben', () => {
        expect(buildGallerySearch({})).toBe('')
        expect(buildGallerySearch({ categorySlug: null, page: 1 })).toBe('')
    })

    it('arma categoría y página', () => {
        expect(buildGallerySearch({ categorySlug: 'partidos', page: 2 })).toBe(
            '?categoria=partidos&pagina=2',
        )
    })

    it('sin página no arrastra ninguna', () => {
        expect(buildGallerySearch({ categorySlug: 'social' })).toBe('?categoria=social')
    })
})

describe('parseViewerParam', () => {
    it('va contado desde 1', () => {
        expect(parseViewerParam('1', 5)).toBe(0)
        expect(parseViewerParam('5', 5)).toBe(4)
        expect(viewerParamValue(2)).toBe('3')
    })

    it('fuera de rango se ignora, no se corrige', () => {
        expect(parseViewerParam('6', 5)).toBeNull()
    })

    it('sin param o con basura no abre', () => {
        for (const value of [null, '0', '-1', '2.5', 'x', '']) {
            expect(parseViewerParam(value, 5)).toBeNull()
        }
    })

    it('un momento sin fotos nunca abre el visor', () => {
        expect(parseViewerParam('1', 0)).toBeNull()
    })
})

describe('viewerOpenState / viewerCloseMode', () => {
    it('abrir conserva la vuelta al filtro y marca la entrada', () => {
        expect(viewerOpenState({ from: '?categoria=social' })).toEqual({
            from: '?categoria=social',
            viewerPushed: true,
        })
        expect(viewerOpenState(null)).toEqual({ viewerPushed: true })
    })

    it('abierto por la app, cerrar vuelve atrás', () => {
        expect(viewerCloseMode(viewerOpenState({ from: '?pagina=2' }))).toBe('back')
    })

    it('entrado por un enlace (sin marca), cerrar reemplaza y no saca del sitio', () => {
        expect(viewerCloseMode(null)).toBe('replace')
        expect(viewerCloseMode(undefined)).toBe('replace')
        expect(viewerCloseMode({ from: '?categoria=social' })).toBe('replace')
    })

    it('una marca que no es `true` de verdad no cuenta', () => {
        expect(viewerCloseMode({ viewerPushed: 'true' })).toBe('replace')
        expect(viewerCloseMode({ viewerPushed: 1 })).toBe('replace')
        expect(viewerCloseMode('viewerPushed')).toBe('replace')
    })
})

describe('backToGalleryHref', () => {
    it('sin state vuelve a la galería a secas', () => {
        expect(backToGalleryHref(null)).toBe('/galeria')
        expect(backToGalleryHref(undefined)).toBe('/galeria')
        expect(backToGalleryHref({ otra: 'cosa' })).toBe('/galeria')
    })

    it('conserva filtro y página', () => {
        expect(backToGalleryHref({ from: '?categoria=partidos&pagina=2' })).toBe(
            '/galeria?categoria=partidos&pagina=2',
        )
    })

    it('descarta lo que no es un search', () => {
        expect(backToGalleryHref({ from: 'https://otro.sitio' })).toBe('/galeria')
        expect(backToGalleryHref({ from: 3 })).toBe('/galeria')
    })

    it('re-normaliza: la basura y los valores por defecto no vuelven', () => {
        expect(backToGalleryHref({ from: '?pagina=1&visor=3&utm=x' })).toBe('/galeria')
        expect(backToGalleryHref({ from: '?pagina=abc&categoria=social' })).toBe(
            '/galeria?categoria=social',
        )
    })

    it('el search solo, para pasarlo de un momento a otro', () => {
        expect(gallerySearchFromState({ from: '?categoria=social&pagina=2' })).toBe(
            '?categoria=social&pagina=2',
        )
        expect(gallerySearchFromState(null)).toBe('')
    })
})
