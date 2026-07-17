import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { bulkImportMembersAction, getBulkImportStatusAction } from '../actions/members.actions'
import type { MemberImportJob } from '../interfaces/AdminMember'

/**
 * Maneja las dos fases del alta masiva:
 *   1. `startImport(file)` sube el CSV y devuelve un jobId al toque.
 *   2. Con ese jobId, hace polling del estado hasta que `status === 'done'`.
 *
 * El backend procesa las ~3500 filas en segundo plano (más de lo que aguanta un
 * request HTTP), por eso el progreso se consulta aparte en vez de esperar la subida.
 */
export const useBulkImport = () => {
    const [jobId, setJobId] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const startMutation = useMutation({
        mutationFn: bulkImportMembersAction,
        onSuccess: (job) => setJobId(job.id),
    })

    const statusQuery = useQuery({
        queryKey: ['admin-bulk-import', jobId],
        queryFn: () => getBulkImportStatusAction(jobId!),
        enabled: !!jobId,
        // Mientras no termine, se vuelve a preguntar cada 1.5s. Al terminar, corta.
        refetchInterval: (query) => {
            const data = query.state.data as MemberImportJob | undefined
            return data?.status === 'done' ? false : 1500
        },
        // Sin esto, React Query pausa el intervalo cuando la pestaña pierde foco y
        // el progreso se congela. Para una barra de progreso queremos que siga
        // corriendo aunque el admin cambie de pestaña.
        refetchIntervalInBackground: true,
    })

    // El job arranca con el conteo del CSV ya hecho, así que preferimos el estado
    // en vivo del polling y caemos al de la subida solo hasta el primer refetch.
    const job = statusQuery.data ?? startMutation.data ?? null
    const isDone = job?.status === 'done'

    const startImport = (file: File) => startMutation.mutate(file)

    const reset = () => {
        setJobId(null)
        startMutation.reset()
    }

    // Cuando el import termina, la lista de socios cambió: refrescarla una vez.
    useEffect(() => {
        if (isDone) {
            void queryClient.invalidateQueries({ queryKey: ['admin-members'] })
        }
    }, [isDone, queryClient])

    return {
        startImport,
        reset,
        job,
        isUploading: startMutation.isPending,
        isProcessing: !!jobId && !isDone,
        isDone,
        error: startMutation.error,
    }
}
