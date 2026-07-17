/** `MemberResponseDto`: lo que devuelven GET/PATCH /members/profile y la subida de foto. */
export interface MemberProfile {
    /** profileId — ojo, NO es el userId. */
    id: string
    userId: string
    email: string
    name: string | null
    surname: string | null
    dni: string | null
    phone: string | null
    address: string | null
    bornDate: string | null
    memberNumber: string | null
    urlPhoto: string | null
    expirationDate: string | null
    memberSince: string | null
    /** Cuota al día: se calcula en el backend (expirationDate >= hoy). */
    isActive: boolean
    createdAt: string
}

/** Tipos de documento que el socio puede subir (bucket privado). */
export const DocumentTypes = {
    DNI_FRONT: 'DNI_FRONT',
    DNI_BACK: 'DNI_BACK',
} as const

export type DocumentType = (typeof DocumentTypes)[keyof typeof DocumentTypes]
