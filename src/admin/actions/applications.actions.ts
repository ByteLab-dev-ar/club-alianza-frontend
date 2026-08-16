import { clubApi, unwrap, unwrapPaginated } from '@/api/clubApi'
import type { ApiResponse, Paginated, PaginatedResponse } from '@/api/types'
import type { AdminMember } from '../interfaces/AdminMember'

export interface ApplicationsQuery {
    page?: number
    limit?: number
}

/**
 * GET /admin/members/applications — la bandeja de solicitudes.
 *
 * Vienen de la más vieja a la más nueva: es una cola, y quien presentó hace una
 * semana no puede quedar debajo del que presentó hoy.
 *
 * Es una lista APARTE del padrón, no un filtro de `GET /admin/members`: el
 * padrón son los socios y esto son los que todavía no lo son. Solo ADMIN —
 * aprobar es decidir quién entra al padrón, y eso no es tesorería.
 */
export const getApplicationsAction = async (
    query: ApplicationsQuery = {},
): Promise<Paginated<AdminMember>> => {
    const response = await clubApi.get<PaginatedResponse<AdminMember>>(
        '/admin/members/applications',
        { params: query },
    )
    return unwrapPaginated(response)
}

/**
 * POST /admin/members/applications/{profileId}/approve.
 *
 * La persona pasa a MEMBER y **recién ahí se le asigna el número de socio**: las
 * dos cosas van en la misma transacción, porque un número entregado a alguien
 * que quedó en REGISTERED se pierde para siempre —los números no se reusan—.
 *
 * Lo revisa una persona y no el sistema: se puede verificar que los archivos
 * estén, no que la foto del DNI sea de quien dice ser.
 */
export const approveApplicationAction = async (profileId: string) => {
    const response = await clubApi.post<ApiResponse<AdminMember>>(
        `/admin/members/applications/${profileId}/approve`,
    )
    return unwrap(response)
}

/**
 * POST /admin/members/applications/{profileId}/reject — con motivo OBLIGATORIO.
 *
 * El mínimo de 10 caracteres lo impone el backend y corta el "no" y el "mal",
 * que dejan al socio igual de perdido que sin mensaje: vuelve a REGISTERED, ve
 * el motivo, corrige y vuelve a presentar. No se le toca nada más — lo que ya
 * subió sigue ahí.
 */
export const rejectApplicationAction = async (profileId: string, reason: string) => {
    const response = await clubApi.post<ApiResponse<AdminMember>>(
        `/admin/members/applications/${profileId}/reject`,
        { reason },
    )
    return unwrap(response)
}
