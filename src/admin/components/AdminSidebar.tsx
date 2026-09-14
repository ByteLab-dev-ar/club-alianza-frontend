import { Link, NavLink } from 'react-router'

import { ClubLogo } from '@/components/custom/ClubLogo'
import { useAuthStore } from '@/auth/store/auth.store'
import { cn } from '@/lib/utils'
import { AdminAccountMenu } from './AdminAccountMenu'
import { visibleGroups } from '../config/nav'

interface Props {
    /** En mobile el sidebar es un drawer; al navegar se cierra. */
    onNavigate?: () => void
}

export const AdminSidebar = ({ onNavigate }: Props) => {
    const is = useAuthStore((state) => state.is)

    // Solo las secciones para las que el usuario tiene rol, y solo los grupos
    // que sobreviven a ese filtro: un web_admin no ve "Socios" ni "Pagos", así
    // que tampoco tiene por qué ver los rótulos "Padrón" y "Cobros" vacíos.
    const groups = visibleGroups((item) => is(...item.allowed))

    return (
        <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
            {/* La campana se mudó a la banda superior (AdminChrome). En mobile
                no se pierde: PanelShell la monta en su propia topbar.

                `h-18` lo comparte el primer piso de la banda, para que los dos
                bordes formen una sola línea horizontal: si se toca acá, hay que
                tocarlo allá (ver el comentario en AdminChrome).

                **La línea la dibuja el `<nav>` de abajo con `border-t`, no este
                bloque con `border-b`**, y la diferencia se ve. Con `border-b`,
                `box-sizing: border-box` mete el borde ADENTRO de los 72px: el
                bloque mide 71 de contenido y la línea cae en la fila 71. Enfrente,
                el piso 1 de la banda son 72 limpios y su divisor —el `border-t`
                del piso 2— cae en la 72. Las dos cajas terminaban en 72 y por eso
                medían "alineadas", pero las líneas estaban en filas distintas y a
                simple vista quedaba un escalón de un pixel. Poniendo el borde en
                el elemento de abajo, los dos lados dibujan en la 72. */}
            <div className="flex h-18 items-center px-6">
                <Link to="/admin" onClick={onNavigate} className="min-w-0 flex-1">
                    <ClubLogo inverted />
                </Link>
            </div>

            {/* `scroll-slim`: el menú está al límite de lo que entra en 1080p, y
                la barra nativa de Windows sobre este panel oscuro se ve como un
                pegote (ver .scroll-slim en index.css).

                `py-3` y no `p-4`: al sumar "Sin contacto" el menú pasó a
                desbordar por 6px, y esos 8px del padding vertical son el lugar
                más barato de donde sacarlos — no tocan ni la altura de las filas
                ni la separación entre grupos, que es lo que los hace legibles.

                **El menú dejó de estar al límite.** Con catorce secciones le
                quedaban 2px de aire en 1080p y la próxima no entraba. Al mudar
                la campana y el pie de cuenta a la banda superior recuperó ~110px
                —dos secciones y media—, así que la presión que obligaba a
                plegar los grupos en submenús ya no está. Si algún día vuelve,
                degrada bien: reaparece la barra fina de `.scroll-slim` y no la
                de Windows. */}
            <nav className="scroll-slim flex flex-1 flex-col overflow-y-auto border-t border-sidebar-border px-4 py-3">
                {groups.map((group, index) => (
                    <div
                        key={group.label ?? 'index'}
                        // El grupo sin rótulo —el resumen— no lleva el aire de
                        // arriba: es el primero y quedaría despegado del logo.
                        className={cn('flex flex-col gap-1', index > 0 && 'mt-5')}
                    >
                        {group.label && (
                            <p className="kicker px-3 pb-1 text-sidebar-foreground/40">
                                {group.label}
                            </p>
                        )}

                        {group.items.map(({ to, label, icon: Icon, end }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={end}
                                onClick={onNavigate}
                                className={({ isActive }) =>
                                    cn(
                                        // py-2 y no py-2.5: son 4px por fila y con
                                        // catorce filas eso es media sección.
                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                                        isActive
                                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                                    )
                                }
                            >
                                <Icon className="size-4.5" />
                                {label}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* SOLO EN MOBILE. En escritorio la cuenta vive en la banda
                superior, y ese es justamente el alto que el menú recupera: el
                pie se llevaba 69px de un sidebar que ya estaba al límite.

                En mobile la banda no dibuja su primer piso —no hay lugar— así
                que el drawer sigue siendo el único camino a cerrar sesión, y
                por eso acá se queda. */}
            <div className="border-t border-sidebar-border p-3 lg:hidden">
                <AdminAccountMenu onNavigate={onNavigate} />
            </div>
        </div>
    )
}
