import { useState } from 'react'
import { KeyRound, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { getApiErrorMessage } from '@/api/clubApi'
import { notify } from '@/lib/notify'
import { useAttachWardAccount } from '../hooks/useWards'

interface Props {
    profileId: string
    wardName: string
}

/**
 * Habilitarle la cuenta propia al chico (§2.6).
 *
 * **No crea un socio nuevo ni le pasa el historial**, y conviene decirlo en
 * pantalla porque es lo que la gente espera que pase: el chico ya es socio desde
 * el día uno —tiene su perfil, su número, su antigüedad, su credencial y todos
 * sus pagos— y lo único que nunca tuvo es una cuenta para entrar. Esto se la
 * engancha al perfil que ya existe.
 *
 * El 409 se muestra completo, y el caso que más importa es el de los 18: ahí no
 * significa "algo salió mal" sino que la persona ya es adulta y la cuenta se la
 * engancha el club. Un toast genérico dejaría al tutor sin saber que la salida
 * es pedírselo.
 */
export const AttachWardAccountDialog = ({ profileId, wardName }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [email, setEmail] = useState('')

    const { mutate, isPending } = useAttachWardAccount(profileId)

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                if (open) setEmail('')
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline">
                    <KeyRound /> Darle su cuenta
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogTitle className="font-display text-xl font-bold">
                    Darle su cuenta a {wardName}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Le mandamos un correo para que configure su contraseña y entre. No se crea
                    un socio nuevo: sigue siendo el mismo, con su número, su antigüedad y todos
                    sus pagos.
                </DialogDescription>

                <div className="mt-5 grid gap-2">
                    <Label htmlFor="ward-email">Su correo</Label>
                    <Input
                        id="ward-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="tomas@email.com"
                    />
                    {/* El correo es único en el sistema, así que la cuenta no puede
                        nacer con el del tutor — y ese es justamente el error que
                        alguien va a intentar cometer acá. */}
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Tiene que ser una casilla suya, no la tuya.
                    </p>
                </div>

                <p className="mt-4 rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                    Que tenga cuenta no lo vuelve el deudor: hasta los 18 el club te sigue
                    reclamando a vos la cuota. Él va a poder entrar, ver su situación y pagar.
                </p>

                <DialogFooter className="mt-6 gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button
                        variant="hero"
                        disabled={isPending || email.trim().length === 0}
                        onClick={() =>
                            mutate(email.trim(), {
                                onSuccess: () => setIsOpen(false),
                                onError: (error) =>
                                    notify.error(
                                        getApiErrorMessage(
                                            error,
                                            'No pudimos habilitarle la cuenta',
                                        ),
                                    ),
                            })
                        }
                    >
                        {isPending && <Loader2 className="animate-spin" />}
                        Enviar invitación
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
