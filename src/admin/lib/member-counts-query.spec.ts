import { describe, expect, it } from 'vitest'

import { toMemberCountsQuery } from './member-counts-query'

describe('toMemberCountsQuery', () => {
    it('cambiar de solapa no cambia lo que se le pide al conteo', () => {
        /*
         * El punto entero de esta función. Las cinco solapas mandan al listado
         * `isActive`, `delinquent` o `deactivated`, y el endpoint de conteos
         * ignora los tres —son los cortes que devuelve, no filtros—. Si
         * sobrevivieran, cada click pediría de nuevo una respuesta idéntica.
         */
        const base = { search: 'ana', isPlayer: true }

        expect(toMemberCountsQuery({ ...base, isActive: true })).toEqual(base)
        expect(toMemberCountsQuery({ ...base, isActive: false })).toEqual(base)
        expect(toMemberCountsQuery({ ...base, delinquent: true })).toEqual(base)
        expect(toMemberCountsQuery({ ...base, deactivated: true })).toEqual(base)
    })

    it('pasar de página tampoco', () => {
        // El conteo cuenta el conjunto entero: la paginación no lo mueve.
        expect(toMemberCountsQuery({ page: 4, limit: 20 })).toEqual(toMemberCountsQuery({}))
    })

    it('la búsqueda y la marca de jugador viajan', () => {
        // Los filtros transversales SÍ: son los que hacen que el número y la
        // tabla hablen del mismo conjunto.
        expect(toMemberCountsQuery({ search: 'perez', isPlayer: true })).toEqual({
            search: 'perez',
            isPlayer: true,
        })
    })

    it('no manda nada más que eso', () => {
        // Un filtro nuevo en el listado no se cuela solo: si el endpoint lo
        // honra hay que agregarlo acá a mano, y si no lo honra no tiene por qué
        // ensuciar la queryKey. Este test es el recordatorio de las dos cosas.
        const claves = Object.keys(
            toMemberCountsQuery({
                page: 2,
                limit: 20,
                search: 'ana',
                isActive: false,
                delinquent: true,
                deactivated: true,
                isPlayer: true,
            }),
        )

        expect(claves.sort()).toEqual(['isPlayer', 'search'])
    })
})
