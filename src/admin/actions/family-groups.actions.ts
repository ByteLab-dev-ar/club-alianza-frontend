import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { AdminMember } from '../interfaces/AdminMember'

/** Un grupo familiar con quiénes lo integran hoy. */
export interface FamilyGroup {
    id: string
    name: string
    /**
     * Quién tiene a cargo a quién, adentro de este grupo: "A cargo de Lucía
     * Fernández". Va de subtítulo, debajo del nombre.
     *
     * `null` en un grupo sin tutela adentro —hermanos adultos, por ejemplo—. Ahí
     * no hay a quién señalar y la tarjeta se queda solo con el nombre.
     */
    anchorLabel: string | null
    /**
     * Quiénes lo integran, **desde ya**: la pertenencia no tiene fechas (la
     * regla del mes siguiente se retiró del backend el 2026-08-21), así que el
     * recién sumado aparece acá en el próximo refresco y el próximo pago que se
     * arme ya lo cuenta para el descuento.
     *
     * Es también la condición para borrar el grupo: el `DELETE` cuenta con el
     * mismo criterio con el que se lista —sin los socios archivados—, así que
     * `members.length === 0` es un "se puede" seguro y no una aproximación.
     */
    members: AdminMember[]
}

/** "Estos comparten tutor, ¿mismo grupo?" — sugerir no es deducir. */
export interface FamilyGroupSuggestion {
    /**
     * El nombre que se GUARDA al confirmar, no el título de la tarjeta.
     *
     * Es el apellido, y el apellido no distingue: en un club de barrio hay dos
     * familias Fernández que no se conocen. Para el título va `anchorLabel`.
     */
    suggestedName: string
    /**
     * Quién de adentro del grupo es tutor de otro integrante, ya redactado:
     * "A cargo de Lucía Fernández". **Es el título de la tarjeta.**
     *
     * El nombre del grupo no es único y no tiene por qué serlo —bloquearlo sería
     * impedir registrar lo que pasa—, así que lo que las distingue sale del dato:
     * de quién tiene a cargo a quién.
     */
    anchorLabel: string
    sharedGuardianName: string
    members: AdminMember[]
}

export const getFamilyGroupsAction = async () => {
    const response = await clubApi.get<ApiResponse<FamilyGroup[]>>('/admin/family-groups')
    return unwrap(response)
}

/**
 * GET /admin/family-groups/suggestions.
 *
 * Propone familias mirando los vínculos tutor–tutelado para que confirmar un
 * grupo sea un click en vez de una búsqueda. **Sugerir no es deducir**: lo que
 * queda guardado es la confirmación del club — si el grupo saliera de "los
 * chicos que comparten estos tutores", agregarle un segundo tutor a un chico lo
 * sacaría del conjunto y la familia perdería el descuento sin que nadie lo
 * pidiera ni se enterara.
 */
export const getFamilyGroupSuggestionsAction = async () => {
    const response = await clubApi.get<ApiResponse<FamilyGroupSuggestion[]>>(
        '/admin/family-groups/suggestions',
    )
    return unwrap(response)
}

export const createFamilyGroupAction = async (name: string) => {
    const response = await clubApi.post<ApiResponse<FamilyGroup>>('/admin/family-groups', { name })
    return unwrap(response)
}

export const renameFamilyGroupAction = async (id: string, name: string) => {
    await clubApi.patch(`/admin/family-groups/${id}`, { name })
}

/**
 * DELETE — solo un grupo sin integrantes.
 *
 * El 409 es "tiene socios adentro": el backend obliga a sacarlos de a uno para
 * que el club vea a quiénes les cambia el descuento, en vez de que el borrado
 * se lleve puestas sus pertenencias en silencio. No es por guardar historia:
 * con qué descuento se cobró cada pago queda en las líneas de ese pago.
 */
export const deleteFamilyGroupAction = async (id: string) => {
    await clubApi.delete(`/admin/family-groups/${id}`)
}

/**
 * POST /admin/family-groups/{id}/members — **cuenta desde ya**.
 *
 * El próximo pago que se arme sale con el descuento resuelto sobre el grupo de
 * ahora; lo ya cobrado no se toca, porque su importe quedó congelado en la
 * línea del pago. Solo socios: el tutor no socio no entra al grupo, porque sin
 * membresía no puede hacer actividad y no es uno de los que cuentan para el
 * descuento.
 */
export const addFamilyGroupMemberAction = async (id: string, profileId: string) => {
    await clubApi.post(`/admin/family-groups/${id}/members`, { profileId })
}

/**
 * DELETE — **deja de contar desde el próximo pago que se arme.** Misma regla con
 * la que entró: lo ya cobrado no se recalcula.
 */
export const removeFamilyGroupMemberAction = async (id: string, profileId: string) => {
    await clubApi.delete(`/admin/family-groups/${id}/members/${profileId}`)
}
