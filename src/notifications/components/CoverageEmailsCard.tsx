import { Loader2 } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import {
    useNotificationPreferences,
    useUpdateNotificationPreferences,
} from '../hooks/useNotifications'

/**
 * El único aviso que se puede apagar, y apaga **un correo**.
 *
 * Ojo con el copy de esta tarjeta: no es un interruptor de "notificaciones".
 * Nada de plata se apaga —cuota, morosidad, pago rechazado siguen saliendo— y
 * la campana adentro de la app recibe todo igual, siempre. Lo único que deja de
 * llegar es el mail que avisa cinco días antes del vencimiento.
 *
 * Si alguna vez aparece un switch maestro de "desactivar notificaciones",
 * está mal: del lado del servidor no existe y no va a existir.
 *
 * El interruptor está inline y no en `components/custom` porque es el único de
 * la app. Si aparece un segundo, ahí se muda.
 */
export const CoverageEmailsCard = () => {
    const { data: preferences, isLoading } = useNotificationPreferences()
    const { mutate, isPending } = useUpdateNotificationPreferences()

    // Encendido mientras carga: es el valor por defecto del servidor, así que
    // no hay parpadeo de "apagado" antes de aparecer prendido.
    const isOn = preferences?.coverageEmails ?? true

    return (
        <div className="rounded-xl border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink">Avisos por correo</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                Los avisos del club te llegan siempre a la campana, arriba a la izquierda.
                Esto es solo para el correo.
            </p>

            {isLoading ? (
                <Skeleton className="mt-6 h-14 rounded-lg" />
            ) : (
                <label className="mt-6 flex cursor-pointer items-start justify-between gap-4">
                    <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink">
                            Avisarme antes de que se venza una cuota
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                            Un correo cinco días antes del vencimiento. Si lo apagás, el aviso
                            te sigue llegando a la campana.
                        </span>
                    </span>

                    <input
                        type="checkbox"
                        role="switch"
                        checked={isOn}
                        disabled={isPending}
                        onChange={(event) => mutate(event.target.checked)}
                        className="peer sr-only"
                    />
                    {/* El `[&>span]` es necesario: `peer-checked:` genera un
                        selector de HERMANO, así que no alcanza al círculo de
                        adentro si se le pone directo. */}
                    <span
                        aria-hidden
                        className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-input transition-colors peer-checked:bg-secondary peer-checked:[&>span]:translate-x-5 peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/40 peer-disabled:opacity-50"
                    >
                        <span className="absolute top-0.5 left-0.5 grid size-5 place-items-center rounded-full bg-card shadow-soft transition-transform">
                            {isPending && (
                                <Loader2 className="size-3 animate-spin text-muted-foreground" />
                            )}
                        </span>
                    </span>
                </label>
            )}
        </div>
    )
}
