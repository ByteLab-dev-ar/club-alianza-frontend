import type { DocumentType, MemberProfile } from '@/members/interfaces/MemberProfile'

/**
 * El listado y el detalle de admin devuelven la misma shape que el perfil propio
 * (`MemberResponseDto`): profileId, userId, datos, `isActive` calculado, etc.
 */
export type AdminMember = MemberProfile

/** `MemberImportJob` — estado de una alta masiva por CSV. */
export interface MemberImportJob {
    id: string
    status: 'pending' | 'processing' | 'done'
    totalRows: number
    importedCount: number
    failedCount: number
    errors: { row: number; email: string; reason: string }[]
    /** Socios creados OK pero cuyo mail de bienvenida falló. */
    emailFailures: string[]
    startedAt: string | null
    finishedAt: string | null
    createdAt: string
}

/** Un problema encontrado al revisar la planilla del alta masiva. */
export interface ImportValidationIssue {
    /** Del archivo entero, del encabezado, o de una fila concreta. */
    scope: 'file' | 'header' | 'row'
    /** Un solo `error` impide la carga. Los `warning` no bloquean. */
    severity: 'error' | 'warning'
    /**
     * Línea REAL del archivo, con el encabezado como 1. Es la línea y no el
     * índice de la fila: con una línea en blanco en el medio las dos se
     * desfasan, y el admin va a la que dice el error y encuentra otra.
     */
    row: number | null
    column: string | null
    /** Lo que traía la celda, para poder encontrarla en el Excel. */
    value: string | null
    email: string | null
    reason: string
    /** "¿quisiste decir expirationDate?" */
    suggestion?: string
}

/**
 * El informe de la revisión previa. Llega con 200 tenga o no problemas la
 * planilla: revisar no es fallar.
 */
export interface MemberImportValidationReport {
    /** `false` con al menos un issue de severidad `error`. */
    valid: boolean
    totalRows: number
    validRows: number
    issues: ImportValidationIssue[]
    headers: {
        recognized: string[]
        unknown: string[]
        missingRequired: string[]
        missingOptional: string[]
    }
}

/**
 * Por dónde entró la firma de la ficha de afiliación.
 *
 * **En pantalla** es la que se dibujó con el dedo o el mouse: el trazo pasó por
 * el sistema y quedó su fecha. **En papel** es la que el club archivó desde la
 * sede — ahí el documento que vale es el papel, y lo que se guarda es una copia.
 *
 * Nunca se le dice "firma digital" a ninguna de las dos (§1.4): la ley 25.506
 * reserva ese término para el certificado de un certificador licenciado.
 */
export type AffiliationSignedVia = 'screen' | 'paper'

/** `AdminMemberDocumentResponseDto` — un documento privado del socio. */
export interface AdminMemberDocument {
    id: string
    type: DocumentType
    /**
     * Ruta del endpoint del backend que sirve el archivo, no una URL del
     * storage: exige sesión, así que pasársela a otra persona no le sirve.
     *
     * (Acá decía "URL firmada temporal (5 min)". Dejó de serlo cuando los
     * archivos pasaron a servirse por endpoint propio; el `staleTime` corto que
     * existía para acompañar ese vencimiento ya se sacó del hook.)
     */
    url: string
    createdAt: string
    /**
     * Cuándo se firmó EN PANTALLA. Solo en el documento `AFFILIATION_FORM`; en
     * el DNI viene siempre `null`.
     *
     * ⚠️ **`null` NO significa "sin firmar".** La ficha firmada en papel se
     * archiva sin esta marca porque el trazo nunca pasó por el sistema, así que
     * leyendo solo este campo una ficha traída de la sede se ve igual que un
     * socio que todavía no firmó nada. La distinción la da `signedVia`.
     */
    signedAt: string | null
    /** `null` cuando el documento no es una ficha de afiliación. */
    signedVia: AffiliationSignedVia | null
}

export interface AdminMembersQuery {
    page?: number
    limit?: number
    search?: string
    /**
     * Estado de la CUOTA, no de la cuenta: `false` = vencida o nunca cargada.
     * Es la lista de cobranza — todos los que deben.
     */
    isActive?: boolean
    /**
     * Solo los MARCADOS como morosos: el subconjunto de `isActive: false` que
     * además quedó bloqueado y solo se destraba en la sede.
     *
     * Son dos listas distintas y las dos sirven, así que van como dos filtros y
     * no como uno: la de cobranza es la primera, la de "ir a buscar" es esta.
     */
    delinquent?: boolean
    /**
     * Los que además practican la actividad. Filtra por la MARCA y no por la
     * cobertura: devuelve al jugador tenga o no la actividad paga. El club no
     * modela cupos por categoría —controla el cupo decidiendo a quién marca—,
     * así que esta es la lista con la que lo hace.
     */
    isPlayer?: boolean
    /**
     * SOLO los dados de baja (perfil archivado), y es la única forma de llegar a
     * ellos: el padrón los excluye. Tiene precedencia sobre `isActive` — el
     * estado de la cuota no significa nada sobre alguien que ya no es socio.
     */
    deactivated?: boolean
}

/**
 * `GET /admin/members/counts` — cuántos socios hay en cada solapa del padrón.
 *
 * **Los cinco números no son cinco partes de una torta**, y leerlos así es el
 * error que este comentario existe para evitar:
 *
 * - `all = active + expired`: el padrón excluye a los archivados y, entre los
 *   que quedan, la membresía o está vigente o no.
 * - `deactivated` va POR FUERA de esa suma. Es otro universo.
 * - `delinquent` **no es una cuarta parte: es una marca que se superpone.** Un
 *   moroso ya viene contado en `expired`. Sumar los cuatro da de más, y un
 *   "otros" sacado por diferencia da cualquier cosa.
 */
export interface MemberCounts {
    /** El padrón entero: todos los que no están archivados. */
    all: number
    /**
     * Con la MEMBRESÍA vigente, que es la única cobertura que bloquea. Un
     * jugador con la actividad vencida cuenta acá, como al día.
     */
    active: number
    /** Con la membresía vencida, o sin ninguna cargada (el importado sin fecha). */
    expired: number
    /** Marcados como morosos. Se superponen con los de arriba, no los parten. */
    delinquent: number
    /** Perfiles archivados. Fuera de la suma. */
    deactivated: number
}

/**
 * Lo único que el conteo mira del estado de filtros de la pantalla.
 *
 * El endpoint acepta el query entero del listado, pero solo honra los filtros
 * TRANSVERSALES: `isActive`, `delinquent` y `deactivated` no son filtros suyos
 * —son los cortes que devuelve— y `page` / `limit` tampoco, porque cuenta el
 * conjunto entero. Quién arma este objeto, y por qué importa que sea este y no
 * el del listado: `toMemberCountsQuery`.
 *
 * Le falta `assignedCategory`, que el endpoint también honra: el panel todavía
 * no tiene filtro por categoría. El día que lo tenga entra en este Pick, o el
 * badge va a contar un conjunto más grande que el que muestra la tabla.
 */
export type AdminMemberCountsQuery = Pick<AdminMembersQuery, 'search' | 'isPlayer'>

/** Motivo obligatorio: queda en auditoría (mínimo 10 caracteres). */
export interface ClearDelinquencyPayload {
    reason: string
}

/** Alta de socio: no lleva contraseña (se genera y se manda por mail). */
export interface CreateMemberPayload {
    email: string
    name: string
    surname: string
    /** Normalizado, 11 dígitos sin guiones (ver `normalizeCuil`). */
    cuil?: string
    dni?: string
    phone?: string
    address?: string
    bornDate?: string
    /** Entero. El backend lo coerciona, pero mandarlo ya como número evita que
     *  un "00482" tipeado viaje distinto de como se va a guardar. */
    memberNumber?: number
    expirationDate?: string
}

/** Campos que un admin puede editar (incluye los de gestión: nº socio, vencimiento). */
export interface UpdateMemberPayload {
    name?: string
    surname?: string
    /** Normalizado, 11 dígitos sin guiones (ver `normalizeCuil`). */
    cuil?: string
    dni?: string
    phone?: string
    address?: string
    bornDate?: string
    /** Entero. El backend lo coerciona, pero mandarlo ya como número evita que
     *  un "00482" tipeado viaje distinto de como se va a guardar. */
    memberNumber?: number
    expirationDate?: string
}
