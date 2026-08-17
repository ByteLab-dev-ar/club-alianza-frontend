/**
 * Las divisiones del club.
 *
 * Se declara el tipo pero NO una tabla de etiquetas: para mostrarla va siempre
 * `playerCategoryLabel`, que viaja calculada desde el servidor. Es la
 * nomenclatura del club, y con la tabla duplicada acá alcanza con que una
 * pantalla escriba "Predecima" sin acento para que el mismo chico salga con dos
 * nombres entre la ficha, el padrón y la credencial.
 */
export type PlayerCategory =
    | 'QUINTA'
    | 'SEXTA'
    | 'SEPTIMA'
    | 'OCTAVA'
    | 'NOVENA'
    | 'DECIMA'
    | 'PREDECIMA'
    | 'ESCUELITA'

/**
 * Lo que hace falta para decidir en la puerta, y son DOS decisiones distintas:
 * si entra (la membresía) y si entrena (la actividad). El seguro no decide nada,
 * se informa.
 */
interface CoverageSummary {
    isPlayer: boolean
    /** `null` cuando no es jugador — no le falta el dato, no le corresponde. */
    playerCategory: PlayerCategory | null
    /** Cómo lo escribe el club, ej. "7ma". Es lo que se muestra. */
    playerCategoryLabel: string | null
    /** Si ENTRENA. Vencida no bloquea la entrada. */
    isActivityUpToDate: boolean
    /** Si tiene cobertura médica. No bloquea nada. */
    isInsuranceUpToDate: boolean
}

/** `CredentialResponseDto`: la tarjeta del socio autenticado (GET /members/credential). */
export interface Credential extends CoverageSummary {
    memberNumber: number | null
    name: string | null
    surname: string | null
    dni: string | null
    urlPhoto: string | null
    memberSince: string | null
    expirationDate: string | null
    /** La MEMBRESÍA: si entra al club. Es la única que bloquea. */
    isActive: boolean
    activityUntil: string | null
    insuranceUntil: string | null
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
export interface CredentialValidation extends CoverageSummary {
    name: string | null
    surname: string | null
    memberNumber: number | null
    urlPhoto: string | null
    /** La MEMBRESÍA (se calcula en vivo, no viene congelada en el QR). */
    isActive: boolean
    /** Hasta cuándo está paga la membresía: permite avisar "vence en 3 días". */
    expirationDate: string | null
    /*
     * OJO: este DTO NO trae `activityUntil` ni `insuranceUntil`, aunque el de la
     * credencial del socio sí. O sea que en la puerta se puede decir "entrena /
     * no entrena", pero no "la actividad le vence en 3 días" como sí se hace con
     * la membresía. Si eso hiciera falta, hay que pedirle los dos campos al
     * backend: no es que se estén ignorando acá.
     */
}
