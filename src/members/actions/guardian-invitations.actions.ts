import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type {
    GuardianInvitation,
    GuardianInvitationPreview,
    InviteGuardianPayload,
} from '../interfaces/Ward'

/** GET /members/guardian-invitations — las que mandé y siguen vivas. */
export const getMyGuardianInvitationsAction = async () => {
    const response = await clubApi.get<ApiResponse<GuardianInvitation[]>>(
        '/members/guardian-invitations',
    )
    return unwrap(response)
}

/**
 * POST /members/guardian-invitations — invitar a otra persona a ser tutor.
 *
 * **No crea ningún vínculo.** Nadie queda de tutor sin haberlo aceptado, porque
 * sumar a alguien es hacerlo responsable de una deuda y eso no se le puede hacer
 * a una persona por ponerle el correo en un formulario.
 *
 * **La respuesta es siempre la misma, exista o no esa cuenta**, y la pantalla no
 * puede decir otra cosa: si contestara "encontrado: María González", cualquiera
 * con la app podría probar correos para averiguar quién está en el club y con
 * qué nombre. Es la misma razón por la que recuperar contraseña tampoco dice si
 * el correo existe.
 *
 * Se devuelve el `message` del sobre porque ES el texto neutral que hay que
 * mostrar: lo redacta el backend justamente para no confirmar nada.
 */
export const inviteGuardianAction = async (payload: InviteGuardianPayload) => {
    const response = await clubApi.post<ApiResponse<null>>(
        '/members/guardian-invitations',
        payload,
    )
    return response.data.message
}

/**
 * DELETE /members/guardian-invitations/{id} — cancelar una invitación pendiente.
 *
 * Se puede porque todavía no pasó nada: nadie se hizo cargo de nada. Lo que
 * **no** se deshace desde la app es un vínculo ya aceptado — para sacar a un
 * tutor hay que pedírselo al club (§2.3).
 */
export const cancelGuardianInvitationAction = async (id: string) => {
    await clubApi.delete(`/members/guardian-invitations/${id}`)
}

/**
 * GET /guardian-invitations/{token} — lo que se ve ANTES de aceptar.
 *
 * Público y sin sesión: quien abre el link puede no tener cuenta todavía. No
 * consume la invitación — la persona tiene que poder leer de qué se está
 * haciendo cargo antes de decidir.
 *
 * Los tres motivos por los que puede fallar —no existe, ya se usó, venció—
 * devuelven el MISMO 404: distinguirlos le confirmaría a un tercero que ese
 * token existió.
 */
export const getGuardianInvitationAction = async (token: string) => {
    const response = await clubApi.get<ApiResponse<GuardianInvitationPreview>>(
        `/guardian-invitations/${token}`,
    )
    return unwrap(response)
}

/**
 * POST /guardian-invitations/{token}/accept — recién acá nace el vínculo.
 *
 * **Exige sesión**, y con el mismo correo al que llegó la invitación: hay que
 * probar que se controla esa casilla. Quien no tenía cuenta la crea con esa
 * dirección y vuelve al link.
 *
 * Se piden las mismas condiciones que para afiliar a un menor —ser mayor de
 * edad y tener la identidad acreditada—, porque quien acepta pasa a ser tutor
 * con todo lo que eso implica. El 422 nombra qué datos le faltan.
 */
export const acceptGuardianInvitationAction = async (token: string) => {
    await clubApi.post(`/guardian-invitations/${token}/accept`)
}
