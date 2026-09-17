import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import axios from 'axios'
import { Loader2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { getApiErrorMessage } from '@/api/clubApi'
import { useAuthStore } from '@/auth/store/auth.store'
import { notify } from '@/lib/notify'
import { closeMyAccountAction } from '../actions/profile.actions'

/**
 * Cerrar la propia cuenta (§2.4). La tercera vía de irse.
 *
 * El backend responde **409 por tres motivos distintos** y cada uno necesita una
 * salida distinta, así que el mensaje se muestra completo y encima se ofrece el
 * camino del único que la persona puede resolver sola: si la baja dejaría a un
 * menor sin ningún tutor, hay que invitar a otro y esperar a que acepte.
 *
 * Los otros dos —ser socio del club, o tener un cargo— los resuelve el club a
 * propósito: irse tiene consecuencias que el sistema no decide solo (la cuota
 * del mes, el número que queda reservado, la antigüedad si vuelve).
 */
export const CloseAccountCard = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [blockedReason, setBlockedReason] = useState<string | null>(null)

    const clearSession = useAuthStore((state) => state.clearSession)
    const navigate = useNavigate()

    const closeAccount = async () => {
        setIsPending(true)
        setBlockedReason(null)

        try {
            await closeMyAccountAction()
            // Las sesiones ya quedaron cortadas del lado del servidor: llamar a
            // /auth/logout ahora solo suma una request que va a fallar.
            clearSession()
            notify.success('Tu cuenta quedó cerrada.')
            void navigate('/')
        } catch (error) {
            const message = getApiErrorMessage(error, 'No pudimos cerrar tu cuenta')

            // El 409 no es una falla: es una condición que el backend explica y
            // que se resuelve haciendo algo. Se muestra dentro del diálogo, no
            // como un toast que se va solo.
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                setBlockedReason(message)
            } else {
                notify.error(message)
            }
        } finally {
            setIsPending(false)
        }
    }

    return (
        <section className="rounded-xl border border-destructive/30 bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink">Cerrar mi cuenta</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Si ya no querés tener cuenta en el portal, podés cerrarla. Si sos socio del
                club, la baja la hace el club: escribinos desde Contacto.
            </p>

            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    setIsOpen(open)
                    if (open) setBlockedReason(null)
                }}
            >
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        className="mt-4 text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 /> Cerrar mi cuenta
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-w-md">
                    <DialogTitle className="font-display text-lg font-bold">
                        Cerrar tu cuenta
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Vas a perder el acceso al portal. Tu información queda archivada, no se
                        borra: el club la conserva por obligación contable.
                    </DialogDescription>

                    {blockedReason && (
                        <div className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-4">
                            <p className="text-sm leading-relaxed text-ink">{blockedReason}</p>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Si es porque tenés un chico a cargo, invitá a otro tutor y
                                esperá a que acepte —después sí podés cerrarla—. Si es por tu
                                membresía o por un cargo en el club, escribinos desde{' '}
                                <Link
                                    to="/contacto"
                                    className="font-semibold text-secondary hover:underline"
                                >
                                    Contacto
                                </Link>
                                .
                            </p>
                            <Button asChild variant="outline" size="sm" className="mt-4">
                                <Link to="/mi-cuenta/chicos">Ir a mis chicos</Link>
                            </Button>
                        </div>
                    )}

                    <DialogFooter className="mt-6 gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isPending}
                        >
                            Volver
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={isPending}
                            onClick={() => void closeAccount()}
                        >
                            {isPending && <Loader2 className="animate-spin" />}
                            Cerrar mi cuenta
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    )
}
