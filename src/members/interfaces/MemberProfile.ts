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

    /* ---- Las tres coberturas ----
     *
     * La cuota dejó de ser una sola cosa: son tres coberturas independientes,
     * cada una con su propio vencimiento, y solo la primera bloquea algo.
     * Mostrarlas como tres semáforos iguales sería mentir sobre dos.
     *
     * `null` = ese concepto nunca se pagó (o el socio viene del padrón viejo,
     * que traía una sola cobertura). Siempre caen el último día de un mes.
     *
     * El backend todavía devuelve `expirationDate` como alias de
     * `membershipUntil`, pero acá no se declara a propósito: es la forma de que
     * TypeScript marque cualquier lectura que haya quedado sin migrar.
     */
    membershipUntil: string | null
    activityUntil: string | null
    insuranceUntil: string | null

    memberSince: string | null
    /**
     * ¿La MEMBRESÍA llega a hoy? Es la única que decide si entra al club.
     *
     * Se sigue llamando `isActive` a secas a propósito: con tres coberturas, la
     * respuesta a "¿está activo?" sigue siendo la membresía.
     */
    isActive: boolean
    /**
     * ¿Puede entrenar hoy? Es la actividad, y no bloquea nada más que eso: en
     * false el socio entra igual al club y usa el portal con normalidad. NO es
     * un moroso ni está bloqueado.
     */
    isActivityUpToDate: boolean
    /**
     * ¿Tiene la cobertura médica vigente? Opcional de verdad: en false no debe
     * nada, solo que si se lesiona jugando los gastos corren por su cuenta.
     */
    isInsuranceUpToDate: boolean
    /**
     * Estado de la CUENTA, no de la cuota: false = todavía no completó el link
     * de bienvenida, así que nunca entró al portal. Es lo que permite ver a
     * quién hay que reenviarle el acceso después de un alta masiva.
     */
    isEmailVerified: boolean
    /** Null = vigente. Con fecha = dado de baja (perfil archivado). */
    deletedAt: string | null
    /**
     * Null = al día con el club. Con fecha = MOROSO: hace más de tres meses que
     * se le venció la membresía.
     *
     * Es un estado DISTINTO de `isActive`: ese se calcula al vuelo y se pone en
     * false el primer día de atraso; este es una marca que el club aplica recién
     * a los tres meses. El socio moroso entra al portal y ve todo con
     * normalidad; lo único que el backend le bloquea es subir un comprobante
     * nuevo, que es lo que lo obliga a pasar por la sede.
     */
    delinquentSince: string | null
    createdAt: string
}

/** Tipos de documento que el socio puede subir (bucket privado). */
export const DocumentTypes = {
    DNI_FRONT: 'DNI_FRONT',
    DNI_BACK: 'DNI_BACK',
} as const

export type DocumentType = (typeof DocumentTypes)[keyof typeof DocumentTypes]
