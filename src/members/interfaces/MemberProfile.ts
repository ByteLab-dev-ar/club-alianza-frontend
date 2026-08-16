import type { PlayerCategory } from './Credential'

/**
 * Los tres estados de afiliación (§1.2).
 *
 * Reemplazan al booleano de socio que había antes, y la diferencia no es
 * cosmética: los dos primeros son, para todo efecto práctico, **no socio** —lo
 * que cambia entre ellos es qué ve la persona en pantalla y qué tiene el club
 * en la bandeja para revisar—.
 *
 * No es un rol y no se deduce de los otros campos: tener número de socio
 * implica MEMBER, pero al revés no, porque el número se asigna recién al
 * aprobar.
 */
export const MembershipStatuses = {
    /** Tiene cuenta y no es socio. Es también donde queda el personal invitado. */
    REGISTERED: 'REGISTERED',
    /** Presentó la solicitud y el club todavía no la revisó. La ficha está congelada. */
    PENDING: 'PENDING',
    /** El club lo aprobó. El único estado con número de socio, cuota y credencial. */
    MEMBER: 'MEMBER',
} as const

export type MembershipStatus = (typeof MembershipStatuses)[keyof typeof MembershipStatuses]

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
    REGISTERED: 'Registrado',
    PENDING: 'Solicitud pendiente',
    MEMBER: 'Socio',
}

/**
 * Sexo del padrón: las tres opciones del DNI (Decreto 476/2021) y no otras.
 *
 * No se agrega "otro" ni "prefiero no decir": son parte de lo que la X cubre, y
 * lo que el documento imprime es una X. El padrón tiene que decir lo mismo que
 * el papel que lo respalda.
 *
 * Es un dato del padrón y nada más: no toca la cuota, ni las categorías, ni
 * ningún permiso.
 */
export const MemberSexes = {
    F: 'F',
    M: 'M',
    X: 'X',
} as const

export type MemberSex = (typeof MemberSexes)[keyof typeof MemberSexes]

export const MEMBER_SEX_LABELS: Record<MemberSex, string> = {
    F: 'Femenino',
    M: 'Masculino',
    X: 'X',
}

/** `MemberResponseDto`: lo que devuelven PATCH /members/profile y la subida de foto. */
export interface MemberProfile {
    /** profileId — ojo, NO es el userId. */
    id: string
    /**
     * `null` en un socio SIN cuenta: el menor de §2.1, que es socio completo
     * —con su número, su credencial y su cuota— y hasta los 16 no tiene con qué
     * entrar. Quien identifica a la persona en todo el sistema es `id`, el del
     * perfil; `userId` es solo su forma de loguearse.
     */
    userId: string | null
    /** `null` si no tiene cuenta: al menor no se le pide correo (§2.2). */
    email: string | null
    /**
     * Si tiene con qué entrar al sistema. **Mirarlo ANTES de ofrecer acciones de
     * cuenta**: a un socio sin cuenta no se le puede reenviar el acceso ni
     * pedirle que verifique su correo, y esos endpoints responden 409.
     *
     * Viene explícito y no derivado de `email !== null` a propósito: es la
     * pregunta que la pantalla necesita responder, y derivarla obliga a cada
     * lugar a redescubrir la regla.
     */
    hasAccount: boolean
    /** Registrado / Solicitud pendiente / Socio (§1.2). */
    membershipStatus: MembershipStatus
    /** Cuándo presentó la solicitud. `null` si nunca presentó, o si canceló. */
    applicationSubmittedAt: string | null
    /** Cuándo el club la aprobó o la rechazó. `null` si todavía no la miraron. */
    applicationReviewedAt: string | null
    /**
     * Por qué se rechazó, escrito por el admin (§1.7). Se limpia recién en la
     * nueva presentación, así que **sigue visible mientras la persona corrige**:
     * es la única pista que tiene de qué arreglar.
     */
    applicationRejectionReason: string | null
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
    /** `null` en los socios que vinieron de la importación del padrón histórico. */
    sex: MemberSex | null
    /**
     * Si además de socio practica la actividad (§3.1).
     *
     * Es la MARCA, no la cobertura: gobierna si de acá en adelante se le sigue
     * ofreciendo y cobrando la actividad, no qué puede hacer hoy — eso es
     * `isActivityUpToDate`, que corre hasta su vencimiento aunque se lo
     * desmarque (§5.7).
     */
    isPlayer: boolean
    /**
     * En qué división juega. Se calcula en cada respuesta de la fecha de
     * nacimiento y el año en curso; no hay ninguna columna detrás.
     *
     * `null` en dos casos que NO significan lo mismo, y se separan mirando
     * `isPlayer`: el socio que no juega no tiene categoría (la categoría existe
     * solo para los jugadores), y el jugador sin fecha de nacimiento tiene el
     * dato faltante.
     */
    playerCategory: PlayerCategory | null
    /** La misma categoría como la escribe el club ("7ma"). **Es lo que se muestra.** */
    playerCategoryLabel: string | null
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
     *
     * En un socio SIN cuenta también es false, y ahí no significa "pendiente de
     * activar": no hay nada que activar. Mirar `hasAccount` primero.
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

/** Un requisito de §1.5 que todavía no está cargado. */
export interface AffiliationRequirement {
    /**
     * Clave estable del campo, para resaltarlo en el formulario. Los documentos
     * usan su tipo (`DNI_FRONT`, `DNI_BACK`, `AFFILIATION_FORM`); la foto de
     * perfil viaja como `photoKey`.
     */
    field: string
    /** Ya viene en castellano: no se traduce ni se reescribe acá. */
    label: string
}

/**
 * `MyMemberProfileResponseDto`: la ficha propia, con el trámite resuelto.
 *
 * Es lo que devuelve GET /members/profile, y también el POST y el DELETE de la
 * solicitud. Va aparte del `MemberProfile` que devuelven el PATCH y el padrón
 * porque `missingRequirements` exige tener los documentos cargados y esos
 * caminos no los traen: un campo que a veces viene calculado y a veces no sería
 * peor que uno que no está — no habría cómo distinguir "no le falta nada" de
 * "no se calculó".
 */
export interface MyMemberProfile extends MemberProfile {
    /**
     * Qué le falta cargar para poder presentar la solicitud. Vacío = tiene todo.
     *
     * Se sigue devolviendo después de aprobado: si el socio borra un dato
     * obligatorio el club quiere verlo, pero ahí ya no bloquea nada.
     */
    missingRequirements: AffiliationRequirement[]
    /**
     * Si el botón "presentar solicitud" tiene que estar habilitado. Exige las
     * DOS condiciones: nada pendiente de cargar **y** estar en `REGISTERED`.
     *
     * Lo calcula el servidor con la misma función que aplica el gate del POST,
     * así que lo que se ve y lo que se acepta no pueden diferir. No hay que
     * recalcularlo acá.
     */
    canSubmitApplication: boolean
}

/**
 * Los tipos de documento del socio (bucket privado).
 *
 * `AFFILIATION_FORM` está en la lista porque el panel lo lista y porque aparece
 * como `field` en `missingRequirements`, pero **no se sube por
 * `POST /members/documents`**: tiene sus dos endpoints propios (§1.4), uno por
 * cada camino de firma. Para eso está `UPLOADABLE_DOCUMENT_TYPES`.
 */
export const DocumentTypes = {
    DNI_FRONT: 'DNI_FRONT',
    DNI_BACK: 'DNI_BACK',
    /** La ficha de afiliación FIRMADA. Nunca "firma digital" (§1.4). */
    AFFILIATION_FORM: 'AFFILIATION_FORM',
} as const

export type DocumentType = (typeof DocumentTypes)[keyof typeof DocumentTypes]

/** Los que aceptan `POST /members/documents` y su gemelo del panel. */
export const UPLOADABLE_DOCUMENT_TYPES = [
    DocumentTypes.DNI_FRONT,
    DocumentTypes.DNI_BACK,
] as const

export type UploadableDocumentType = (typeof UPLOADABLE_DOCUMENT_TYPES)[number]

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
    DNI_FRONT: 'DNI — frente',
    DNI_BACK: 'DNI — dorso',
    AFFILIATION_FORM: 'Ficha de afiliación firmada',
}
