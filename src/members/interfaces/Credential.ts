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
    /**
     * Token firmado que se embebe en el QR como `${origin}/validar/${qrPayload}`.
     * No vence: las credenciales físicas del club no se renuevan. Se anula desde
     * el panel si el socio pierde la tarjeta, y ahí el validador responde 410.
     */
    qrPayload: string
}

/**
 * `CredentialValidationResponseDto`: lo que ve quien escanea el QR en la puerta.
 * Solo lo recibe personal autenticado. A propósito NO trae dni, email, teléfono
 * ni domicilio.
 */
export interface CredentialValidation {
    name: string | null
    surname: string | null
    memberNumber: string | null
    urlPhoto: string | null
    /** Cuota al día (se calcula en vivo, no viene congelado en el QR). */
    isActive: boolean
    /** Hasta cuándo está paga la cuota: permite avisar "vence en 3 días". */
    expirationDate: string | null
}
