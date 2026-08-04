/** `MemberResponseDto`: lo que devuelven GET/PATCH /members/profile y la subida de foto. */
export interface MemberProfile {
    /** profileId — ojo, NO es el userId. */
    id: string
    userId: string
    email: string
    name: string | null
    surname: string | null
    /**
     * Identifica al socio: es único entre los vigentes. Llega NORMALIZADO, en 11
     * dígitos sin guiones — para mostrarlo usar `formatCuil`.
     */
    cuil: string | null
    /** Dato de contacto, NO identificador: dos socios pueden tener el mismo. */
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
    /**
     * Estado de la CUENTA, no de la cuota: false = todavía no completó el link
     * de bienvenida, así que nunca entró al portal. Es lo que permite ver a
     * quién hay que reenviarle el acceso después de un alta masiva.
     */
    isEmailVerified: boolean
    /** Null = vigente. Con fecha = dado de baja (perfil archivado). */
    deletedAt: string | null
    createdAt: string
}

/** Tipos de documento que el socio puede subir (bucket privado). */
export const DocumentTypes = {
    DNI_FRONT: 'DNI_FRONT',
    DNI_BACK: 'DNI_BACK',
} as const

export type DocumentType = (typeof DocumentTypes)[keyof typeof DocumentTypes]
