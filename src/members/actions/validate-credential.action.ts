import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { CredentialValidation } from '../interfaces/Credential'

/** GET /credential/validate/{token} — público (endpoint de puerta), con throttling. */
export const validateCredentialAction = async (token: string) => {
    const response = await clubApi.get<ApiResponse<CredentialValidation>>(
        `/credential/validate/${token}`,
    )
    return unwrap(response)
}
