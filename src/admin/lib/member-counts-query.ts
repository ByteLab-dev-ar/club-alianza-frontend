import type { AdminMemberCountsQuery, AdminMembersQuery } from '../interfaces/AdminMember'

/**
 * Qué le queda al conteo del estado de filtros del padrón.
 *
 * **Es lo que hace que cambiar de solapa no dispare una request.**
 * `GET /admin/members/counts` ignora `isActive`, `delinquent` y `deactivated`
 * —no son filtros suyos: son los cortes que devuelve— y también `page` y
 * `limit`, porque cuenta el conjunto entero. Pasarle el query del listado tal
 * cual anda igual, pero la queryKey cambiaría con cada click y el panel pediría
 * cinco veces la MISMA respuesta mientras alguien pasea por las solapas.
 *
 * Al revés importa todavía más: lo que sí sobrevive tiene que sobrevivir
 * completo. Si el conteo se quedara sin `search`, el badge diría "Vencidos 52"
 * arriba de una tabla de tres filas, y la pantalla se contradiría sola.
 *
 * Devuelve un objeto nuevo en cada llamada y está bien: TanStack hashea la key
 * por estructura, así que dos objetos con los mismos tres campos son la misma
 * entrada del cache.
 */
export const toMemberCountsQuery = (query: AdminMembersQuery): AdminMemberCountsQuery => ({
    search: query.search,
    isPlayer: query.isPlayer,
})
