import { Roles } from '@/constants/roles'
import { useAuthStore } from '@/auth/store/auth.store'
import { useFamilyGroupSuggestions } from './useFamilyGroups'
import type { AdminNavBadge } from '../config/nav'

/**
 * Los números que van al lado de los rótulos del menú (DEC-2).
 *
 * Un solo lugar que traduce la **clave** que declara `config/nav.ts` al número
 * que la resuelve, para que el sidebar solo tenga que dibujar: si cada contador
 * se resolviera donde se dibuja, el menú declarado en un archivo volvería a
 * tener lógica repartida en otro.
 *
 * `undefined` es "todavía no sé" (cargando, o el rol no puede preguntar) y es
 * distinto de 0: el sidebar no dibuja ninguno de los dos casos, así que un
 * número nunca aparece antes de ser cierto.
 *
 * **Cada contador se pide solo si el rol puede verlo.** Las sugerencias son de
 * ADMIN, y el menú lo miran también tesorería y admin web: sin el freno, el
 * endpoint contestaba 403 en cada carga del panel.
 *
 * **Ojo con el número de sugerencias: hoy sale inflado.** El backend las agrupa
 * por tutor y no por familia —un chico con mamá y papá socios da dos
 * sugerencias— y no hay forma de descartar una, así que una familia que el club
 * decidió no agrupar queda contada para siempre. Está pedido en
 * `backend/toFix/pedidos-del-frontend-2026-09-17.md` (BACK-5: contador propio,
 * una sugerencia por familia y poder descartarlas). Hasta entonces el número
 * sirve para enterarse de que hay algo para mirar, no como una cuenta exacta de
 * trabajo pendiente — y por eso no se pinta de ámbar en ningún lado.
 */
export const useAdminNavBadges = (): Partial<Record<AdminNavBadge, number>> => {
    // El booleano y no la función `is`: el selector devuelve un primitivo, así
    // que el sidebar solo se vuelve a renderizar si el rol cambia de verdad.
    const isAdmin = useAuthStore((state) => state.is(Roles.ADMIN))

    const suggestions = useFamilyGroupSuggestions({ enabled: isAdmin })

    return { familyGroupSuggestions: suggestions.data?.length }
}
