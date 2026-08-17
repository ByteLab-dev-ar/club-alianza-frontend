import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { AdminMember } from '../interfaces/AdminMember'

/** Un grupo familiar con quiénes lo integran ESTE mes. */
export interface FamilyGroup {
    id: string
    name: string
    /**
     * Los de este mes. Alguien recién agregado todavía no aparece, y del lado
     * del negocio es correcto: los cambios rigen desde el mes siguiente, y esta
     * es la lista con la que se cobra hoy.
     *
     * ⚠️ **Del lado de la pantalla eso deja un agujero**, porque el 409 de
     * `addMember` SÍ cuenta las pertenencias que todavía no rigen: al socio
     * sumado hoy el panel lo sigue viendo como "no está en el grupo" y le
     * ofrece sumarlo otra vez, para que el backend conteste "ese socio ya está
     * en este grupo". El diálogo lo tapa recordando a quién sumó en esta
     * sesión, pero se pierde al recargar.
     *
     * Se arregla de verdad cuando la respuesta traiga también las pertenencias
     * abiertas que arrancan el mes que viene —o al menos sus `profileId`—.
     */
    members: AdminMember[]
}

/**
 * El mes que viene, en `YYYY-MM`. Es cuando empieza a contar una pertenencia
 * nueva (§5.4), y se calcula acá SOLO para poder decirlo en pantalla: quien
 * decide es el servidor, que ya guarda ese mismo mes en `effectiveFrom`.
 */
export const nextMonthKey = (): string => {
    const today = new Date()
    const next = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
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
