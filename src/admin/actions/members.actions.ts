import { clubApi, unwrap, unwrapPaginated } from '@/api/clubApi'
import type { ApiResponse, PaginatedResponse, Paginated } from '@/api/types'
import type {
    AdminMember,
    AdminMemberCountsQuery,
    AdminMemberDocument,
    AdminMembersQuery,
    CreateMemberPayload,
    MemberCounts,
    MemberImportJob,
    MemberImportValidationReport,
    UpdateMemberPayload,
} from '../interfaces/AdminMember'

/** GET /admin/members — paginado, con búsqueda y filtro por estado. */
export const getMembersAction = async (
    query: AdminMembersQuery = {},
): Promise<Paginated<AdminMember>> => {
    const response = await clubApi.get<PaginatedResponse<AdminMember>>('/admin/members', {
        params: query,
    })
    return unwrapPaginated(response)
}

/**
 * GET /admin/members/counts — los cinco números de las solapas del padrón.
 *
 * Sale de los MISMOS criterios que el listado —del otro lado los filtros
 * transversales los arma una sola función—, que es lo que hace que el badge y la
 * tabla hablen del mismo conjunto. Por eso lo que se le manda es
 * `toMemberCountsQuery(...)` y no el query del listado: ver ahí.
 *
 * Toma el `signal` de TanStack y se lo pasa a axios. Con alguien tipeando en la
 * búsqueda hay varias de estas en el aire a la vez, y sin cancelar, la respuesta
 * de un término viejo que llega tarde le pisa el número al que sí corresponde.
 */
export const getMemberCountsAction = async (
    query: AdminMemberCountsQuery = {},
    signal?: AbortSignal,
): Promise<MemberCounts> => {
    const response = await clubApi.get<ApiResponse<MemberCounts>>('/admin/members/counts', {
        params: query,
        signal,
    })
    return unwrap(response)
}

/** GET /admin/members/:id — detalle por profileId. */
export const getMemberAction = async (id: string) => {
    const response = await clubApi.get<ApiResponse<AdminMember>>(`/admin/members/${id}`)
    return unwrap(response)
}

/** POST /admin/members — crea User + MemberProfile; el socio recibe mail de bienvenida. */
export const createMemberAction = async (payload: CreateMemberPayload) => {
    const response = await clubApi.post<ApiResponse<AdminMember>>('/admin/members', payload)
    return unwrap(response)
}

/** PATCH /admin/members/:id — incluye campos de gestión (nº socio, vencimiento, dni). */
export const updateMemberAction = async (id: string, payload: UpdateMemberPayload) => {
    const response = await clubApi.patch<ApiResponse<AdminMember>>(`/admin/members/${id}`, payload)
    return unwrap(response)
}

/** DELETE /admin/members/:id — soft delete + revoca el acceso al portal. */
export const deleteMemberAction = async (id: string) => {
    await clubApi.delete(`/admin/members/${id}`)
}

/**
 * POST /admin/members/:id/revoke-credential — el caso "perdí la tarjeta".
 *
 * Sube la versión de la credencial: el QR impreso (y cualquier captura) deja de
 * validar en la puerta al instante, sin dar de baja al socio. La próxima vez
 * que abra la app se le firma uno nuevo.
 *
 * Devuelve también el `message` del sobre porque es el texto que se le muestra
 * al admin — lo redacta el backend y explica qué pasa ahora.
 */
export const revokeCredentialAction = async (id: string) => {
    const response = await clubApi.post<ApiResponse<{ credentialVersion: number }>>(
        `/admin/members/${id}/revoke-credential`,
    )

    return {
        credentialVersion: unwrap(response).credentialVersion,
        message: response.data.message,
    }
}

/**
 * GET /admin/members/:id/documents — documentos privados del socio.
 *
 * Los ven ADMIN y TESORERÍA: quien cobra en el mostrador necesita poder
 * confirmar que la persona parada enfrente es quien dice ser.
 */
export const getMemberDocumentsAction = async (id: string) => {
    const response = await clubApi.get<ApiResponse<AdminMemberDocument[]>>(
        `/admin/members/${id}/documents`,
    )
    return unwrap(response)
}

/**
 * POST /admin/members/:id/affiliation-form — la ficha firmada A MANO (§1.4).
 *
 * **Es el único camino que le queda al papel**: desde la app el socio solo firma
 * en pantalla, así que la ficha que alguien lleva firmada a la sede la carga el
 * club desde acá. Solo ADMIN, imagen o PDF, hasta 5 MB.
 *
 * Endpoint propio y NO el alta genérica de documentos con
 * `type=AFFILIATION_FORM`, por dos motivos que se acumulan: aquella acepta solo
 * imágenes —un DNI es una foto, pero el escáner de la sede saca PDF— y no sabe
 * limpiar los metadatos de la firma anterior. Mientras aceptó este tipo, dejaba
 * la fila afirmando que lo que hay ahora se firmó tal día con tal hash. Su DTO
 * ya no lo admite.
 *
 * No guarda fecha de firma, y es correcto: acá el club se queda con el papel,
 * que es el documento que vale. Lo que se archiva es una copia.
 */
export const uploadSignedAffiliationFormAction = async (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    await clubApi.post(`/admin/members/${id}/affiliation-form`, formData)
}

/**
 * PATCH /admin/members/{id}/player — marcar o desmarcar jugador.
 *
 * Toma el estado al que se quiere llegar y **no es un toggle**: con "cambialo",
 * dos clicks sobre una pantalla desactualizada dejan al socio en el estado
 * contrario al que el admin veía.
 *
 * **No toca ninguna cobertura, y ese es el punto**: la marca gobierna si de acá
 * en adelante se le sigue cobrando la actividad; lo que puede hacer HOY lo
 * gobierna la cobertura, que corre hasta su vencimiento. Tampoco toca la
 * categoría, porque no hay nada que tocar — se calcula de la fecha de
 * nacimiento en cada respuesta.
 *
 * El 409 es "todavía no es socio": todo jugador es socio, así que primero hay
 * que aprobarle la solicitud.
 */
export const setPlayerMarkAction = async (id: string, isPlayer: boolean) => {
    const response = await clubApi.patch<ApiResponse<AdminMember>>(
        `/admin/members/${id}/player`,
        { isPlayer },
    )
    return unwrap(response)
}

/**
 * POST /admin/members/{id}/account — engancharle una cuenta a un perfil que ya
 * existe.
 *
 * Es el "pedíselo al club" al que manda el 409 del camino del tutor cuando el
 * tutelado cumple 18, y sirve para cualquier socio que nunca tuvo cuenta: sin
 * tope de edad por arriba.
 *
 * **No crea un socio nuevo: ata un login al perfil que ya está.** Esa
 * diferencia es todo el punto — darlo de alta otra vez le rompería el número de
 * socio y la antigüedad.
 */
export const attachAccountAction = async (id: string, email: string) => {
    await clubApi.post(`/admin/members/${id}/account`, { email })
}

/** GET /admin/members/{id}/guardians — quiénes responden por este socio. */
export const getGuardiansAction = async (id: string) => {
    const response = await clubApi.get<ApiResponse<AdminMember[]>>(
        `/admin/members/${id}/guardians`,
    )
    return unwrap(response)
}

/**
 * DELETE /admin/members/{id}/guardians/{guardianProfileId} — sacar a un tutor.
 *
 * No hay auto-baja: lo saca el club, a pedido. Como contrapartida tiene que
 * poder hacerlo rápido — es una gestión de mostrador, no un trámite.
 *
 * El 409 es la guarda que importa: **un chico nunca puede quedar sin ningún
 * tutor**. Si queda uno solo, no se lo puede sacar hasta que haya otro.
 */
export const removeGuardianAction = async (id: string, guardianProfileId: string) => {
    await clubApi.delete(`/admin/members/${id}/guardians/${guardianProfileId}`)
}

/**
 * POST /admin/members/{id}/clear-delinquency — destrabar a un moroso.
 *
 * ⚠️ **No le extiende la cobertura**: es un indulto, no una amnistía. Si el
 * socio efectivamente sigue debiendo, la corrida nocturna lo vuelve a marcar.
 * Para perdonarle la deuda hay que moverle el vencimiento desde la ficha.
 *
 * El motivo es obligatorio y queda en auditoría.
 */
export const clearDelinquencyAction = async (id: string, reason: string) => {
    const response = await clubApi.post<ApiResponse<AdminMember>>(
        `/admin/members/${id}/clear-delinquency`,
        { reason },
    )
    return unwrap(response)
}

/**
 * POST /admin/members/bulk-import/validate — la pantalla previa.
 *
 * Corre la MISMA revisión que la importación pero **no escribe nada**: ni
 * socios, ni job. Responde 200 tenga o no problemas la planilla —revisar no es
 * fallar—, así que se mira `valid` para saber si se puede cargar e `issues`
 * para pintar los errores.
 */
export const validateBulkImportAction = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await clubApi.post<ApiResponse<MemberImportValidationReport>>(
        '/admin/members/bulk-import/validate',
        formData,
    )
    return unwrap(response)
}

/** POST /admin/members/bulk-import — sube el CSV y responde al toque con el jobId. */
export const bulkImportMembersAction = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await clubApi.post<ApiResponse<MemberImportJob>>(
        '/admin/members/bulk-import',
        formData,
    )
    return unwrap(response)
}

/** GET /admin/members/bulk-import/:jobId — estado del import (para hacer polling). */
export const getBulkImportStatusAction = async (jobId: string) => {
    const response = await clubApi.get<ApiResponse<MemberImportJob>>(
        `/admin/members/bulk-import/${jobId}`,
    )
    return unwrap(response)
}

/**
 * POST /admin/members/bulk-import/:jobId/retry-emails — reintenta las
 * bienvenidas que no salieron en una importación.
 *
 * Responde ENSEGUIDA con el job todavía sin cambios: el envío sigue en segundo
 * plano. El avance se ve con el GET de arriba, donde `emailFailures` se va
 * vaciando (el backend lo persiste cada 25 correos). El `status` del job queda
 * en `done` todo el tiempo, así que no sirve para saber si el reenvío terminó.
 */
export const retryImportEmailsAction = async (jobId: string) => {
    const response = await clubApi.post<ApiResponse<MemberImportJob>>(
        `/admin/members/bulk-import/${jobId}/retry-emails`,
    )
    return unwrap(response)
}

/**
 * POST /admin/members/:id/resend-welcome — le manda al socio un link nuevo para
 * configurar su contraseña.
 *
 * A diferencia del reintento masivo, este ESPERA la confirmación del servicio de
 * mail antes de responder: puede tardar un par de segundos y puede fallar con
 * 503, que es transitorio y se reintenta.
 */
export const resendWelcomeAction = async (id: string) => {
    const response = await clubApi.post<ApiResponse<{ email: string }>>(
        `/admin/members/${id}/resend-welcome`,
    )
    return unwrap(response)
}
