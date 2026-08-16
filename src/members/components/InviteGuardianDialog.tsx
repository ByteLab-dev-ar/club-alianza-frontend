import { useState } from 'react'
import { Loader2, UserPlus } from 'lucide-react'

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
import { useInviteGuardian } from '../hooks/useGuardianInvitations'
import type { MemberProfile } from '../interfaces/MemberProfile'

interface Props {
    wards: MemberProfile[]
}

/**
 * Invitar a una segunda persona a ser tutor (§2.3).
 *
 * Tres cosas que la pantalla tiene que decir, y que no son adorno:
 *
 * - **De qué chicos sería tutor**, elegidos uno por uno. Una madre con dos
 *   hijos puede querer sumar al padre a uno solo, y sobre todo: sumar a alguien
 *   es hacerlo responsable de una deuda, así que tiene que quedar claro de cuál.
 * - **Que vence a las 72 horas**, para que quien invita sepa que puede quedar
 *   sin efecto y que volver a mandarla es un click.
 * - **Que una vez aceptada no se deshace desde la app.** Sacar a un tutor se le
 *   pide al club: poder deshacerlo con un click sería soltar una obligación de
 *   plata sin que nadie confirme quién queda a cargo.
 *
 * Lo que la pantalla NO hace es confirmar si ese correo tiene cuenta. El mensaje
 * de éxito lo escribe el backend y es deliberadamente neutral — si dijera
 * "encontrado: María González", cualquiera con la app podría probar correos para
 * averiguar quién está en el club.
 */
export const InviteGuardianDialog = ({ wards }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [picked, setPicked] = useState<string[]>([])

    const { mutate, isPending } = useInviteGuardian()

    const toggleWard = (profileId: string) =>
        setPicked((current) =>
            current.includes(profileId)
                ? current.filter((id) => id !== profileId)
                : [...current, profileId],
        )

    const canSend = email.trim().length > 0 && picked.length > 0

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                if (open) {
                    setEmail('')
                    setPicked([])
                }
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline" disabled={wards.length === 0}>
                    <UserPlus /> Sumar otro tutor
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogTitle className="font-display text-xl font-bold">
                    Sumar otro tutor
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Le mandamos una invitación por correo. Nadie queda de tutor sin aceptarla:
                    hacerse tutor es hacerse responsable de la cuota de esos chicos.
                </DialogDescription>

                <div className="mt-5 grid gap-2">
                    <Label htmlFor="guardian-email">Correo de la otra persona</Label>
                    <Input
                        id="guardian-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="persona@email.com"
                    />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Si ya tiene cuenta, le llega la invitación. Si no, le llega una para
                        crearla y después aceptar.
                    </p>
                </div>

                <div className="mt-5">
                    <p className="text-sm font-semibold text-ink">¿De qué chicos sería tutor?</p>
                    <div className="mt-2 flex flex-col gap-2">
                        {wards.map((ward) => (
                            <label
                                key={ward.id}
                                className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/50"
                            >
                                <input
                                    type="checkbox"
                                    checked={picked.includes(ward.id)}
                                    onChange={() => toggleWard(ward.id)}
                                    className="size-4 shrink-0 accent-[var(--brand)]"
                                />
                                <span className="text-sm font-medium text-ink">
                                    {ward.name} {ward.surname}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <p className="mt-5 rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                    La invitación <strong className="text-ink">vence a las 72 horas</strong> —
                    si pasa, la volvés a mandar. Y una vez aceptada,{' '}
                    <strong className="text-ink">no se deshace desde la app</strong>: para sacar
                    a un tutor hay que pedírselo al club.
                </p>

                <DialogFooter className="mt-6 gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button
                        variant="hero"
                        disabled={!canSend || isPending}
                        onClick={() =>
                            mutate(
                                { email: email.trim(), wardProfileIds: picked },
                                { onSuccess: () => setIsOpen(false) },
                            )
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
