import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { AdminMember } from '../interfaces/AdminMember'

/** Un grupo familiar con quiénes lo integran ESTE mes. */
export interface FamilyGroup {
    id: string
    name: string
    /**
     * Los de este mes. Alguien recién agregado todavía no aparece, y es
     * correcto: los cambios rigen desde el mes siguiente, y esta es la lista con
     * la que se cobra hoy.
     */
    members: AdminMember[]
}

/** "Estos comparten tutor, ¿mismo grupo?" — sugerir no es deducir. */
export interface FamilyGroupSuggestion {
    suggestedName: string
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
 * DELETE — solo un grupo VACÍO.
 *
 * El 409 es "tiene socios adentro": las pertenencias son el registro de con qué
 * descuento se les cobró, y borrar el grupo se lo llevaría puesto.
 */
export const deleteFamilyGroupAction = async (id: string) => {
    await clubApi.delete(`/admin/family-groups/${id}`)
}

/**
 * POST /admin/family-groups/{id}/members — **cuenta desde el MES SIGUIENTE**.
 *
 * Si entra un hermano en junio, el 50% empieza en julio y junio queda como se
 * generó. Solo socios: el tutor no socio no entra al grupo, porque sin membresía
 * no puede hacer actividad y no es uno de los que cuentan para el descuento.
 */
export const addFamilyGroupMemberAction = async (id: string, profileId: string) => {
    await clubApi.post(`/admin/family-groups/${id}/members`, { profileId })
}

/**
 * DELETE — **este mes todavía cuenta; deja de contar el que viene.** Misma regla
 * con la que entró: lo que se cobró de un mes no se recalcula.
 */
export const removeFamilyGroupMemberAction = async (id: string, profileId: string) => {
    await clubApi.delete(`/admin/family-groups/${id}/members/${profileId}`)
}
