import { useState } from 'react'
import { Loader2 } from 'lucide-react'

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
import { isAssignableRole, type AssignableRole, type Role } from '@/constants/roles'
import { useUpdateUserRoles } from '../hooks/useStaff'
import { RoleCheckboxes } from './RoleCheckboxes'
import type { StaffUser } from '../interfaces/StaffUser'

interface Props {
    user: StaffUser
    trigger: React.ReactNode
}

export const EditRolesDialog = ({ user, trigger }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    // Se editan solo los roles de staff; si el usuario además es socio ('user'),
    // ese rol se preserva al guardar para no quitarle el acceso al portal.
    const keepsUserRole = user.roles.includes('user')
    const [roles, setRoles] = useState<AssignableRole[]>(user.roles.filter(isAssignableRole))

    const { mutate, isPending } = useUpdateUserRoles()

    const handleSave = () => {
        const finalRoles: Role[] = keepsUserRole ? [...new Set<Role>(['user', ...roles])] : roles
        // El toast lo muestra el hook; acá solo queda cerrar si salió bien.
        mutate({ id: user.id, roles: finalRoles }, { onSuccess: () => setIsOpen(false) })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-lg font-bold">Editar roles</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {user.email}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    <RoleCheckboxes value={roles} onChange={setRoles} />
                    {keepsUserRole && (
                        <p className="mt-3 text-xs text-muted-foreground">
                            Este usuario también es socio; conserva el acceso al portal.
                        </p>
                    )}
                </div>

                <DialogFooter className="mt-6 gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button
                        variant="hero"
                        onClick={handleSave}
                        disabled={isPending || roles.length === 0}
                    >
                        {isPending && <Loader2 className="animate-spin" />}
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
