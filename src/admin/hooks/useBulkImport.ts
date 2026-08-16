import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import {
    bulkImportMembersAction,
    getBulkImportStatusAction,
    retryImportEmailsAction,
    validateBulkImportAction,
} from '../actions/members.actions'
import type { MemberImportJob } from '../interfaces/AdminMember'

/**
 * La revisión previa de la planilla.
 *
 * Corre la MISMA validación que la importación pero no escribe nada, así que
 * existe para lo que antes no había forma de hacer: mirar los errores de 3500
 * filas sin haber creado ya la mitad de los socios. Responde 200 tenga o no
 * problemas —revisar no es fallar—, y por eso el resultado se lee de `valid`,
 * no del éxito de la mutación.
 */
export const useValidateBulkImport = () => {
    return useMutation({
        mutationFn: validateBulkImportAction,
        // El 400 es el archivo ilegible o sin filas, y viene redactado.
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos leer la planilla')),
    })
}

/**
 * Cuánto tiempo se sigue consultando el job después de lanzar un reenvío.
 *
 * El backend no expone ninguna señal de "el reenvío terminó": el `status` del
 * job queda en `done` desde antes y lo único que cambia es `emailFailures`, que
 * se persiste cada 25 correos. Si todos salen bien la lista llega a cero y el
 * polling corta solo; pero si alguno falla de forma permanente, se queda en un
 * número fijo y sin este tope estaríamos preguntando para siempre.
 */
const RETRY_POLL_WINDOW_MS = 5 * 60 * 1000

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
    // Ventana abierta mientras se sigue al reenvío de correos. Es un booleano y
    // no un timestamp porque el estado derivado se lee en render, y comparar
    // contra `Date.now()` ahí sería impuro (el resultado cambiaría entre dos
    // renders idénticos). El cierre por tiempo lo hace el efecto de abajo.
    const [isRetryWindowOpen, setIsRetryWindowOpen] = useState(false)
    const queryClient = useQueryClient()

    const startMutation = useMutation({
        mutationFn: bulkImportMembersAction,
        onSuccess: (job) => setJobId(job.id),
    })

    const statusQuery = useQuery({
        queryKey: [QK.adminBulkImport, jobId],
        queryFn: () => getBulkImportStatusAction(jobId!),
        enabled: !!jobId,
        // Mientras no termine, se vuelve a preguntar cada 1.5s. Al terminar, corta.
        // Si el polling entra en error (backend caído, sesión muerta) también
        // corta: reintentar cada 1.5s no se recupera solo y dejaría la UI en
        // "Procesando…" eterno. Al reabrir el dialog, la query reintenta sola.
        refetchInterval: (query) => {
            if (query.state.status === 'error') return false
            const data = query.state.data as MemberImportJob | undefined
            if (data?.status !== 'done') return 1500

            // El import terminó, pero puede haber un reenvío de correos en
            // curso: ese corre en segundo plano SIN mover el `status`, así que
            // cortar acá dejaba la lista de pendientes congelada y parecía que
            // el reenvío no hacía nada.
            return isRetryWindowOpen && data.emailFailures.length > 0 ? 1500 : false
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

    const retryMutation = useMutation({
        mutationFn: () => retryImportEmailsAction(jobId!),
        onSuccess: () => {
            // La respuesta trae el job SIN cambios (el envío recién arranca), así
            // que no sirve para actualizar nada: lo único que hace falta es
            // reabrir la ventana de polling para ver vaciarse los pendientes.
            setIsRetryWindowOpen(true)
            void queryClient.invalidateQueries({ queryKey: [QK.adminBulkImport, jobId] })
        },
        // Los tres rechazos posibles (import en curso, sin pendientes, ya hay un
        // reenvío corriendo) vienen redactados del backend.
        onError: (error) =>
            toast.error(getApiErrorMessage(error, 'No pudimos reenviar los correos')),
    })

    const startImport = (file: File) => startMutation.mutate(file)

    const reset = () => {
        setJobId(null)
        setIsRetryWindowOpen(false)
        startMutation.reset()
        retryMutation.reset()
    }

    // Cierre por tiempo de la ventana de seguimiento. Hace falta porque el
    // backend no avisa cuándo terminó el reenvío: si todos los correos salen
    // bien la lista llega a cero y el polling corta solo, pero si alguno falla
    // siempre, se queda en un número fijo y sin esto preguntaríamos para
    // siempre. El setState va dentro del timeout, no en el cuerpo del efecto.
    useEffect(() => {
        if (!isRetryWindowOpen) return

        const timer = setTimeout(() => setIsRetryWindowOpen(false), RETRY_POLL_WINDOW_MS)
        return () => clearTimeout(timer)
    }, [isRetryWindowOpen])

    // Cuando el import termina, socios y dashboard cambiaron: refrescarlos una vez.
    useEffect(() => {
        if (isDone) {
            void queryClient.invalidateQueries({ queryKey: [QK.adminMembers] })
            void queryClient.invalidateQueries({ queryKey: [QK.adminDashboard] })
        }
    }, [isDone, queryClient])

    return {
        startImport,
        reset,
        job,
        isUploading: startMutation.isPending,
        // Un polling caído no cuenta como "procesando": eso desbloquea el cierre
        // del dialog y deja que la UI muestre el error en la fase de progreso.
        isProcessing: !!jobId && !isDone && !statusQuery.isError,
        isDone,
        error: startMutation.error ?? statusQuery.error,
        retryEmails: () => retryMutation.mutate(),
        /**
         * Si se lanzó un reintento en esta sesión del diálogo. Sirve para no
         * felicitar por "no quedan correos pendientes" a un import que nunca
         * tuvo ninguno.
         */
        hasRetriedEmails: retryMutation.isSuccess,
        /**
         * Cubre las dos etapas: el request (instantáneo) y el envío en segundo
         * plano. Sin la segunda, el botón volvía a habilitarse de inmediato y
         * daba la impresión de que no había pasado nada.
         */
        isRetryingEmails:
            retryMutation.isPending ||
            (isRetryWindowOpen && (job?.emailFailures.length ?? 0) > 0),
    }
}
