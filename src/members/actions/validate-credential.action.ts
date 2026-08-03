import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { CredentialValidation } from '../interfaces/Credential'

/**
 * GET /credential/validate/{token} — endpoint de puerta.
 *
 * Ya NO es público: exige sesión con rol `admin` o `reception`. Antes alcanzaba
 * con tener el link para consultar en vivo la foto y el estado de cuota de un
 * socio, para siempre.
 *
 * Códigos que hay que distinguir aguas arriba: 410 (credencial anulada, socio
 * legítimo con tarjeta vieja) vs 400 (inválida, sospecha de fraude).
 */
export const validateCredentialAction = async (token: string) => {
    const response = await clubApi.get<ApiResponse<CredentialValidation>>(
        `/credential/validate/${token}`,
    )
    return unwrap(response)
}
