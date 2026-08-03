import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QK } from '@/api/queryKeys'
import { getAuditLogsAction } from '../actions/get-audit-logs.action'
import type { AuditLogsQuery } from '../interfaces/AuditLog'

export const useAuditLogs = (query: AuditLogsQuery) => {
    return useQuery({
        queryKey: [QK.adminAuditLogs, query],
        queryFn: () => getAuditLogsAction(query),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 30,
    })
}
