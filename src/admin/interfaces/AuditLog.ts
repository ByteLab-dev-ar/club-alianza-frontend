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

/** Traduce cada acción del backend a una frase legible en español. */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
    CREATE_MEMBER: 'Creó un socio',
    UPDATE_MEMBER: 'Editó un socio',
    DELETE_MEMBER: 'Eliminó un socio',
    BULK_IMPORT_MEMBERS: 'Importó socios (CSV)',
    APPROVE_PAYMENT: 'Aprobó un pago',
    REJECT_PAYMENT: 'Rechazó un pago',
    CREATE_EVENT: 'Creó un evento',
    UPDATE_EVENT: 'Editó un evento',
    DELETE_EVENT: 'Eliminó un evento',
    CREATE_EVENT_CATEGORY: 'Creó una categoría de evento',
    UPDATE_EVENT_CATEGORY: 'Editó una categoría de evento',
    DELETE_EVENT_CATEGORY: 'Eliminó una categoría de evento',
    CREATE_GALLERY_IMAGE: 'Subió una imagen',
    UPDATE_GALLERY_IMAGE: 'Editó una imagen',
    DELETE_GALLERY_IMAGE: 'Eliminó una imagen',
    CREATE_GALLERY_CATEGORY: 'Creó una categoría de galería',
    UPDATE_GALLERY_CATEGORY: 'Editó una categoría de galería',
    DELETE_GALLERY_CATEGORY: 'Eliminó una categoría de galería',
    REVOKE_CREDENTIAL: 'Anuló una credencial',
    CREATE_USER: 'Creó un usuario',
    UPDATE_USER_ROLES: 'Cambió roles de un usuario',
    CREATE_HISTORY_MILESTONE: 'Creó un hito de historia',
    UPDATE_HISTORY_MILESTONE: 'Editó un hito de historia',
    DELETE_HISTORY_MILESTONE: 'Eliminó un hito de historia',
    CREATE_BOARD_MEMBER: 'Agregó un miembro a la comisión',
    UPDATE_BOARD_MEMBER: 'Editó un miembro de la comisión',
    DELETE_BOARD_MEMBER: 'Quitó un miembro de la comisión',
    UPDATE_BOARD_PERIOD: 'Actualizó el período de la comisión',
}

/** Recursos filtrables (coincide con el campo entityName del backend). */
export const AUDIT_ENTITIES = [
    { value: 'members', label: 'Socios' },
    { value: 'payments', label: 'Pagos' },
    { value: 'events', label: 'Eventos' },
    { value: 'gallery', label: 'Galería' },
    { value: 'users', label: 'Usuarios' },
] as const
