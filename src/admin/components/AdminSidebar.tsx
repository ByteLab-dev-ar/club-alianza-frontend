import { Link, NavLink } from 'react-router'
import { ArrowLeft, LogOut, User } from 'lucide-react'

import { ClubLogo } from '@/components/custom/ClubLogo'
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

            <nav className="flex flex-1 flex-col overflow-y-auto p-4">
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
                                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
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

            <div className="border-t border-sidebar-border p-4">
                <p className="truncate px-3 text-xs text-sidebar-foreground/50">{user?.email}</p>

                {/* Contraparte del link "Panel admin" del portal del socio. Va sin
                    chequeo: /mi-cuenta solo pide sesión, y su índice ya redirige
                    a "Mi perfil" a quien no es socio del club (ver MemberRoutes).
                    O sea que este link siempre lleva a algo que la persona puede
                    usar, sea socia o no. */}
                <Link
                    to="/mi-cuenta"
                    onClick={onNavigate}
                    className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                    <User className="size-4.5" />
                    Mi cuenta
                </Link>
                <Link
                    to="/"
                    onClick={onNavigate}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                    <ArrowLeft className="size-4.5" />
                    Volver al sitio
                </Link>
                <button
                    type="button"
                    onClick={() => void logoutUser()}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                    <LogOut className="size-4.5" />
                    Cerrar sesión
                </button>
            </div>
        </div>
    )
}
