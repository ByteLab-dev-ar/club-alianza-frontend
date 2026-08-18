/** `AuditLogResponseDto` — un registro del log inmutable de acciones admin. */
export interface AuditLog {
    id: string
    action: string
    entityName: string
    entityId: string | null
    description: string | null
    adminUserId: string | null
    adminName: string | null
    adminSurname: string | null
    adminEmail: string | null
    metadata: Record<string, unknown> | null
    createdAt: string
}

export interface AuditLogsQuery {
    page?: number
    limit?: number
    entityName?: string
    action?: string
    startDate?: string
    endDate?: string
}

/**
 * Traduce cada acción del backend a una frase legible.
 *
 * **Tiene que cubrir el catálogo entero** (`AuditAction` en el backend). Lo que
 * falta se muestra crudo, y el log es una pantalla que alguien lee para
 * entender qué pasó: `SET_CONCEPT_PRICE` no es una respuesta.
 *
 * Las frases están en pasado y con sujeto implícito —la fila ya dice quién—, y
 * dicen QUÉ cambió en las palabras del club, no el nombre de la tabla.
 */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
    // Socios
    CREATE_MEMBER: 'Dio de alta un socio',
    UPDATE_MEMBER: 'Editó un socio',
    DELETE_MEMBER: 'Dio de baja un socio',
    REINSTATE_MEMBER: 'Recuperó un socio dado de baja',
    BULK_IMPORT_MEMBERS: 'Importó el padrón desde una planilla',
    RESEND_WELCOME_EMAIL: 'Reenvió el correo de bienvenida',
    ATTACH_MEMBER_ACCOUNT: 'Le habilitó la cuenta a un socio',
    REVOKE_CREDENTIAL: 'Anuló una credencial',
    CLEAR_DELINQUENCY: 'Destrabó a un socio moroso',
    UPLOAD_MEMBER_DOCUMENT: 'Subió documentación de un socio',
    REMOVE_GUARDIAN: 'Sacó a un tutor',

    // El trámite de afiliación
    APPROVE_MEMBERSHIP_APPLICATION: 'Aprobó una solicitud de socio',
    REJECT_MEMBERSHIP_APPLICATION: 'Rechazó una solicitud de socio',

    // Jugadores
    MARK_PLAYER: 'Marcó a un socio como jugador',
    UNMARK_PLAYER: 'Sacó a un socio de la actividad',

    // Plata
    APPROVE_PAYMENT: 'Aprobó un pago',
    REJECT_PAYMENT: 'Rechazó un pago',
    COUNTER_PAYMENT: 'Cobró en la sede',
    VOID_RECEIPT: 'Anuló un recibo',
    REISSUE_RECEIPT: 'Corrigió un recibo',
    SET_CONCEPT_PRICE: 'Cargó un monto de cuota',
    UPDATE_CONCEPT_PRICE: 'Corrigió un monto de cuota',
    DELETE_CONCEPT_PRICE: 'Borró un monto de cuota',

    // Grupos familiares
    CREATE_FAMILY_GROUP: 'Creó un grupo familiar',
    UPDATE_FAMILY_GROUP: 'Renombró un grupo familiar',
    DELETE_FAMILY_GROUP: 'Eliminó un grupo familiar',
    ADD_FAMILY_GROUP_MEMBER: 'Sumó un socio a un grupo familiar',
    REMOVE_FAMILY_GROUP_MEMBER: 'Sacó un socio de un grupo familiar',

    // Eventos
    CREATE_EVENT: 'Creó un evento',
    UPDATE_EVENT: 'Editó un evento',
    DELETE_EVENT: 'Eliminó un evento',
    CREATE_EVENT_CATEGORY: 'Creó una categoría de evento',
    UPDATE_EVENT_CATEGORY: 'Editó una categoría de evento',
    DELETE_EVENT_CATEGORY: 'Eliminó una categoría de evento',

    // Galería. Son "momentos" con varias fotos: las tres claves de la foto
    // suelta (`CREATE_GALLERY_IMAGE`, `UPDATE_GALLERY_IMAGE`) ya no existen en
    // el backend y se sacaron de acá — traducían acciones que no se emiten.
    CREATE_GALLERY_ALBUM: 'Creó un momento en la galería',
    UPDATE_GALLERY_ALBUM: 'Editó un momento de la galería',
    DELETE_GALLERY_ALBUM: 'Eliminó un momento de la galería',
    ADD_GALLERY_IMAGES: 'Agregó fotos a un momento',
    REORDER_GALLERY_IMAGES: 'Reordenó las fotos de un momento',
    DELETE_GALLERY_IMAGE: 'Eliminó una foto',
    CREATE_GALLERY_CATEGORY: 'Creó una categoría de galería',
    UPDATE_GALLERY_CATEGORY: 'Editó una categoría de galería',
    DELETE_GALLERY_CATEGORY: 'Eliminó una categoría de galería',

    // Personal
    CREATE_USER: 'Dio de alta a alguien del personal',
    UPDATE_USER_ROLES: 'Cambió los roles de un usuario',
    REVOKE_USER_ACCESS: 'Quitó a alguien del personal',
    REINSTATE_USER_ACCESS: 'Reincorporó a alguien del personal',
    RESEND_STAFF_INVITE: 'Reenvió una invitación al personal',

    // Institucional
    CREATE_HISTORY_MILESTONE: 'Creó un hito de la historia',
    UPDATE_HISTORY_MILESTONE: 'Editó un hito de la historia',
    DELETE_HISTORY_MILESTONE: 'Eliminó un hito de la historia',
    CREATE_BOARD_MEMBER: 'Agregó un miembro a la comisión',
    UPDATE_BOARD_MEMBER: 'Editó un miembro de la comisión',
    DELETE_BOARD_MEMBER: 'Quitó un miembro de la comisión',
    UPDATE_BOARD_PERIOD: 'Actualizó el período de la comisión',
}

/**
 * Cómo se muestra una acción que todavía no está en el mapa.
 *
 * El backend suma acciones sin migración —el catálogo es un varchar— así que
 * este caso va a volver a pasar, y hasta ahora se resolvía escupiendo
 * `SET_CONCEPT_PRICE` en la pantalla. Esto no reemplaza a la traducción: la
 * deja legible mientras alguien la escribe.
 */
export const auditActionLabel = (action: string): string =>
    AUDIT_ACTION_LABELS[action] ??
    action.replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase())

/** Recursos filtrables (coincide con el campo entityName del backend). */
export const AUDIT_ENTITIES = [
    { value: 'members', label: 'Socios' },
    { value: 'payments', label: 'Pagos' },
    { value: 'concept_prices', label: 'Montos de cuota' },
    { value: 'family_groups', label: 'Grupos familiares' },
    { value: 'receipts', label: 'Recibos' },
    { value: 'events', label: 'Eventos' },
    { value: 'gallery', label: 'Galería' },
    { value: 'users', label: 'Personal' },
    { value: 'history', label: 'Historia' },
    { value: 'board', label: 'Comisión directiva' },
] as const
