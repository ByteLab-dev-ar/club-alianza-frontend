import { useEffect, useRef } from 'react'

import { useAuthStore } from '@/auth/store/auth.store'
import { MembershipStatuses, type MembershipStatus } from '../interfaces/MemberProfile'

/**
 * Vuelve a preguntar quién es la persona cuando el club la aprueba con la
 * pantalla abierta.
 *
 * `isMember` no vive en el perfil sino en el usuario de la SESIÓN, y esa foto se
 * saca dos veces nada más: al arrancar la app y al volver del link de acceso. El
 * perfil, en cambio, se refresca con cualquier mutación. Así que en el momento
 * exacto en que el club aprueba —que es cuando la persona está mirando "Mi
 * afiliación" esperando justamente eso— la pantalla pasa a decirle "Sos socio
 * del club" mientras la sesión sigue creyendo que no: el menú no le ofrece la
 * credencial ni los pagos, y entrar por URL la rebota de vuelta a la afiliación.
 * Hasta que recargue el navegador.
 *
 * **No son dos criterios distintos.** El backend calcula `isMember` como
 * `membershipStatus === MEMBER`, la misma regla; lo que hay es una foto vieja de
 * la única que existe. Por eso el arreglo es sacar la foto de nuevo y no hacer
 * que el guard del router derive del perfil: `useProfile` arranca en `undefined`,
 * así que ese guard tendría que distinguir "todavía no llegó" de "no es socio", y
 * si se lo escribe sin esa rama un socio legítimo se come un `<Navigate replace>`
 * en el primer render — y el `replace` le borra la vuelta atrás.
 *
 * Una sola vez por montaje: si la consulta falla no se reintenta en loop, y el
 * caso queda como está hoy, esperando la recarga.
 */
export const useSyncMemberSession = (membershipStatus: MembershipStatus | undefined) => {
    const isMember = useAuthStore((state) => state.user?.isMember ?? false)
    const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus)
    const alreadySynced = useRef(false)

    useEffect(() => {
        if (alreadySynced.current) return
        // La sesión ya sabe que es socio: no hay nada que corregir.
        if (isMember) return
        if (membershipStatus !== MembershipStatuses.MEMBER) return

        // Se marca ANTES de la consulta, no en el `then`: mientras está en vuelo
        // el efecto puede volver a correr —el perfil llega en un objeto nuevo— y
        // sin esto saldrían varias seguidas.
        alreadySynced.current = true
        void checkAuthStatus()
    }, [membershipStatus, isMember, checkAuthStatus])
}
