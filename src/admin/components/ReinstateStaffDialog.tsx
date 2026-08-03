import { useState } from 'react'
import { Loader2, Undo2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import type { AssignableRole } from '@/constants/roles'
import { useReinstateStaff } from '../hooks/useStaff'
import { RoleCheckboxes } from './RoleCheckboxes'
import type { StaffUser } from '../interfaces/StaffUser'

interface Props {
    user: StaffUser
}

/**
 * Reincorporar una cuenta dada de baja.
 *
 * Pide roles sí o sí porque la baja se los llevó: la cuenta quedó en `["user"]`
 * y volver sin cargo la dejaría fuera del panel otra vez. Es también el motivo
 * por el que esto no se puede hacer desde el diálogo de Roles — el backend
 * rechaza cambiar roles mientras la cuenta siga dada de baja.
 */
export const ReinstateStaffDialog = ({ user }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [roles, setRoles] = useState<AssignableRole[]>([])
    const { mutate, isPending } = useReinstateStaff()

    const handleConfirm = () => {
        mutate({ id: user.id, roles }, { onSuccess: () => setIsOpen(false) })
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                // Al reabrir, arrancar limpio: los roles de la vez anterior no
                // tienen por qué ser los de esta.
                if (open) setRoles([])
            }}
        >
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Undo2 /> Reincorporar
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-lg font-bold">
                        Reincorporar al personal
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Se reactiva la cuenta de{' '}
                        <strong className="text-ink">{user.email}</strong> con los roles que
                        elijas. La baja le quitó los que tenía.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    <RoleCheckboxes value={roles} onChange={setRoles} />
                </div>

                <DialogFooter className="mt-6 gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button
                        variant="hero"
                        onClick={handleConfirm}
                        disabled={isPending || roles.length === 0}
                    >
                        {isPending && <Loader2 className="animate-spin" />}
                        Reincorporar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
