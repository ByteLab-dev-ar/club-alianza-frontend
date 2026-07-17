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
    isActive?: boolean
}

/** Alta de socio: no lleva contraseña (se genera y se manda por mail). */
export interface CreateMemberPayload {
    email: string
    name: string
    surname: string
    dni?: string
    phone?: string
    address?: string
    bornDate?: string
    memberNumber?: string
    expirationDate?: string
}

/** Campos que un admin puede editar (incluye los de gestión: nº socio, vencimiento). */
export interface UpdateMemberPayload {
    name?: string
    surname?: string
    dni?: string
    phone?: string
    address?: string
    bornDate?: string
    memberNumber?: string
    expirationDate?: string
}
