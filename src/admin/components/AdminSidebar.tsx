import { Link, NavLink } from 'react-router'
import { ArrowLeft, ChevronUp, LogOut, User } from 'lucide-react'

import { ClubLogo } from '@/components/custom/ClubLogo'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/auth/store/auth.store'
import { cn } from '@/lib/utils'
import { visibleGroups } from '../config/nav'

interface Props {
    /** En mobile el sidebar es un drawer; al navegar se cierra. */
    onNavigate?: () => void
}

export const AdminSidebar = ({ onNavigate }: Props) => {
    const user = useAuthStore((state) => state.user)
    const logoutUser = useAuthStore((state) => state.logoutUser)
    const is = useAuthStore((state) => state.is)

    // Solo las secciones para las que el usuario tiene rol, y solo los grupos
    // que sobreviven a ese filtro: un web_admin no ve "Socios" ni "Pagos", así
    // que tampoco tiene por qué ver los rótulos "Padrón" y "Cobros" vacíos.
    const groups = visibleGroups((item) => is(...item.allowed))

    return (
        <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
            <div className="flex h-18 items-center border-b border-sidebar-border px-6">
                <Link to="/admin" onClick={onNavigate}>
                    <ClubLogo inverted />
                </Link>
            </div>

            {/* `scroll-slim`: con trece secciones el menú no entra en una pantalla
                de portátil, y la barra nativa de Windows sobre este panel oscuro
                se ve como un pegote (ver .scroll-slim en index.css). */}
            <nav className="scroll-slim flex flex-1 flex-col overflow-y-auto p-4">
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

            {/* El pie, plegado en un botón de cuenta.

                Suelto eran cuatro filas —el correo y tres acciones— y se llevaba
                178px: más que "Padrón" y "Contenido" juntas. Con trece secciones,
                eso era justo lo que hacía que el menú no entrara en 1080p y
                apareciera el scroll. Plegado ocupa 69px y no esconde ninguna
                sección: lo que se guarda son tres acciones de cuenta, que se usan
                una vez por sesión, no navegación del panel.

                Queda con 33px de aire en una ventana maximizada en 1080p con la
                barra de marcadores, 70px sin ella. Es poco: una sección más y el
                menú vuelve a scrollear —aunque ahora con la barra fina de
                `.scroll-slim`, no con la de Windows—. El siguiente lugar de donde
                sacar espacio, si hace falta, es la separación entre grupos
                (mt-5 → mt-4, 16px), pero eso empieza a desarmar los grupos. */}
            <div className="border-t border-sidebar-border p-3">
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors outline-none hover:bg-sidebar-accent focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/40 data-[state=open]:bg-sidebar-accent">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sidebar-accent text-sidebar-foreground">
                            <User className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-sidebar-foreground/70">
                            {user?.email}
                        </span>
                        <ChevronUp className="size-4 shrink-0 text-sidebar-foreground/50" />
                    </DropdownMenuTrigger>

                    {/* `side="top"`: el botón vive abajo de todo, así que el menú
                        tiene que crecer hacia arriba o se sale de la ventana. */}
                    <DropdownMenuContent side="top" align="start" className="w-56">
                        {/* Contraparte del link "Panel admin" del portal del socio.
                            Va sin chequeo: /mi-cuenta solo pide sesión, y su índice
                            ya redirige a "Mi perfil" a quien no es socio del club
                            (ver MemberRoutes). O sea que este link siempre lleva a
                            algo que la persona puede usar, sea socia o no. */}
                        <DropdownMenuItem asChild>
                            <Link to="/mi-cuenta" onClick={onNavigate}>
                                <User />
                                Mi cuenta
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/" onClick={onNavigate}>
                                <ArrowLeft />
                                Volver al sitio
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onSelect={() => void logoutUser()}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                            <LogOut />
                            Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
