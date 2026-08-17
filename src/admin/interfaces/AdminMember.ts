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

/** `AdminMemberDocumentResponseDto` — documento con URL firmada de corta duración. */
export interface AdminMemberDocument {
    id: string
    type: DocumentType
    /** URL firmada temporal (5 min), nunca la URL pública permanente. */
    url: string
    createdAt: string
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
