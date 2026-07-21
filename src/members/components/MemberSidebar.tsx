import { Link, NavLink } from 'react-router'
import { ArrowLeft, CreditCard, LayoutDashboard, LogOut, Receipt, User, UserCog } from 'lucide-react'

import { ClubLogo } from '@/components/custom/ClubLogo'
import { useAuthStore } from '@/auth/store/auth.store'
import { STAFF_ROLES } from '@/constants/roles'
import { cn } from '@/lib/utils'
import { useProfile } from '../hooks/useProfile'

const NAV_LINKS = [
    { to: '/mi-cuenta', label: 'Resumen', icon: LayoutDashboard, end: true },
    { to: '/mi-cuenta/credencial', label: 'Credencial', icon: CreditCard },
    { to: '/mi-cuenta/pagos', label: 'Pagos', icon: Receipt },
    { to: '/mi-cuenta/perfil', label: 'Mi perfil', icon: UserCog },
]

interface Props {
    /** En mobile el sidebar es un drawer: al navegar se cierra. */
    onNavigate?: () => void
}

export const MemberSidebar = ({ onNavigate }: Props) => {
    const { logoutUser, is } = useAuthStore()
    const { data: profile } = useProfile()
    const isStaff = is(...STAFF_ROLES)

    const fullName = [profile?.name, profile?.surname].filter(Boolean).join(' ')

    return (
        <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
            <div className="flex h-18 items-center gap-3 border-b border-sidebar-border px-6">
                <Link to="/" onClick={onNavigate}>
                    <ClubLogo inverted />
                </Link>
                <span className="kicker text-sidebar-primary">Mi cuenta</span>
            </div>

            {/* Identidad del socio */}
            <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
                {profile?.urlPhoto ? (
                    <img
                        src={profile.urlPhoto}
                        alt=""
                        className="size-11 shrink-0 rounded-full border-2 border-sidebar-primary/50 object-cover"
                    />
                ) : (
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sidebar-accent text-sidebar-primary">
                        <User className="size-5" />
                    </span>
                )}
                <div className="min-w-0">
                    <p className="truncate font-display font-bold">{fullName || 'Socio'}</p>
                    <p className="kicker mt-0.5 text-sidebar-primary">
                        {profile?.memberNumber ? `Socio N° ${profile.memberNumber}` : 'Sin N° asignado'}
                    </p>
                </div>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
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
            </nav>

            <div className="border-t border-sidebar-border p-4">
                {isStaff && (
                    <Link
                        to="/admin"
                        onClick={onNavigate}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    >
                        <LayoutDashboard className="size-4.5" />
                        Panel admin
                    </Link>
                )}
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
