/** `CredentialResponseDto`: la tarjeta del socio autenticado (GET /members/credential). */
export interface Credential {
    memberNumber: string | null
    name: string | null
    surname: string | null
    dni: string | null
    urlPhoto: string | null
    memberSince: string | null
    expirationDate: string | null
    isActive: boolean
    /** Token firmado que se embebe en el QR como `${origin}/validar/${qrPayload}`. */
    qrPayload: string
}

/**
 * `CredentialValidationResponseDto`: lo que ve quien escanea el QR en la puerta.
 * A propósito NO trae dni, email, teléfono ni domicilio.
 */
export interface CredentialValidation {
    name: string | null
    surname: string | null
    memberNumber: string | null
    urlPhoto: string | null
    /** Cuota al día (se calcula en vivo, no viene congelado en el QR). */
    isActive: boolean
}
