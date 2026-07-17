import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { Credential } from '../interfaces/Credential'

/** GET /members/credential — tarjeta del socio + el token firmado del QR. */
export const getCredentialAction = async () => {
    const response = await clubApi.get<ApiResponse<Credential>>('/members/credential')
    return unwrap(response)
}
