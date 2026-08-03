import { UserMinus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { useAuthStore } from '@/auth/store/auth.store'
import { useRemoveFromStaff } from '../hooks/useStaff'
import type { StaffUser } from '../interfaces/StaffUser'

interface Props {
    user: StaffUser
}

/**
 * Quitar del personal — NO es dar de baja del club.
 *
 * Le saca los roles del panel. Qué pasa con la cuenta depende de si además es
 * socio, y el copy tiene que decirlo bien: para el socio esto es dejar la
 * comisión (conserva cuota y credencial), para el que no lo es es perder el
 * único motivo por el que tenía cuenta. La baja del club de verdad vive en la
 * pantalla de Socios.
 *
 * Estilo destructivo pero no rojo pleno: no se borra nada y un admin puede
 * volver a asignarle roles.
 */
export const RemoveFromStaffButton = ({ user }: Props) => {
    const currentUserId = useAuthStore((state) => state.user?.id)
    const { mutateAsync } = useRemoveFromStaff()

    // El backend rechaza con 409 que uno se quite a sí mismo. Se deshabilita en
    // vez de dejar que falle: ofrecer una acción que se sabe que no va a andar
    // es peor que explicar por qué no está disponible.
    if (user.id === currentUserId) {
        return (
            <Button
                variant="ghost"
                size="sm"
                disabled
                title="No podés quitarte a vos mismo del personal. Pedíselo a otro administrador."
            >
                <UserMinus /> Quitar
            </Button>
        )
    }

    return (
        <ConfirmDialog
            trigger={
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                >
                    <UserMinus /> Quitar
                </Button>
            }
            title="Quitar del personal"
            description={
                user.isMember ? (
                    <>
                        ¿Quitar a <strong className="text-ink">{user.email}</strong> del personal?
                        Deja de tener acceso al panel, pero sigue siendo socio del club: conserva
                        su cuenta y su credencial.
                    </>
                ) : (
                    <>
                        ¿Quitar a <strong className="text-ink">{user.email}</strong> del personal?
                        No es socio del club, así que su cuenta queda dada de baja y pierde el
                        acceso al sistema.
                    </>
                )
            }
            confirmLabel="Quitar del personal"
            // Se descarta el usuario que devuelve el endpoint: la fila no se
            // actualiza, desaparece del listado al invalidar (ya no es personal).
            onConfirm={async () => {
                await mutateAsync(user.id)
            }}
        />
    )
}
