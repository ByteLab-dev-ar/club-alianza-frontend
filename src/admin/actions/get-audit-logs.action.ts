import { clubApi, unwrapPaginated } from '@/api/clubApi'
import type { PaginatedResponse, Paginated } from '@/api/types'
import type { AuditLog, AuditLogsQuery } from '../interfaces/AuditLog'

/** GET /admin/audit-logs — log inmutable paginado, con filtros. */
export const getAuditLogsAction = async (
    query: AuditLogsQuery = {},
): Promise<Paginated<AuditLog>> => {
    const response = await clubApi.get<PaginatedResponse<AuditLog>>('/admin/audit-logs', {
        params: query,
    })
    return unwrapPaginated(response)
}
