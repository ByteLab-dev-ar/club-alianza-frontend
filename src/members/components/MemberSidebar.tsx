import { Link, NavLink } from 'react-router'
import { ArrowLeft, LayoutDashboard, LogOut, ScanLine, User } from 'lucide-react'

import { ClubLogo } from '@/components/custom/ClubLogo'
import { useAuthStore } from '@/auth/store/auth.store'
import { Roles, STAFF_ROLES } from '@/constants/roles'
import { cn } from '@/lib/utils'
import { MEMBER_NAV } from '../config/nav'
import { useProfile } from '../hooks/useProfile'

interface Props {
    /** En mobile el sidebar es un drawer: al navegar se cierra. */
    onNavigate?: () => void
}

export const MemberSidebar = ({ onNavigate }: Props) => {
    const logoutUser = useAuthStore((state) => state.logoutUser)
    const is = useAuthStore((state) => state.is)
    // Selector sobre el campo y no `is(...)`: ese devuelve una función estable y
    // no re-renderizaría al cambiar el usuario.
    const isMember = useAuthStore((state) => state.user?.isMember ?? false)
    const { data: profile } = useProfile()
    const isStaff = is(...STAFF_ROLES)

    // Mismo criterio que el router (ver members/config/nav.ts): al personal que
    // no es socio no se le ofrecen las secciones que el backend le va a negar.
    const navLinks = MEMBER_NAV.filter((item) => isMember || !item.memberOnly)

    const fullName = [profile?.name, profile?.surname].filter(Boolean).join(' ')

    return (
        <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
            {/* Solo el logo, como en el sidebar del admin: el ancho del panel es
                16rem y el wordmark ya se lleva casi todo. Al lado de una etiqueta
                más, flexbox encogía ambos y "Club Alianza" se partía en dos
                líneas. El rótulo de sección vive abajo, arriba del nav. */}
            <div className="flex h-18 items-center border-b border-sidebar-border px-6">
                <Link to="/" onClick={onNavigate}>
                    <ClubLogo inverted />
                </Link>
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
                    <p className="truncate font-display font-bold">{fullName || 'Mi cuenta'}</p>
                    {/* A quien no es socio no se le anuncia un N° que nunca va a
                        tener: "Sin N° asignado" sonaba a trámite pendiente. */}
                    <p className="kicker mt-0.5 text-sidebar-primary">
                        {profile?.memberNumber
                            ? `Socio N° ${profile.memberNumber}`
                            : isMember
                              ? 'Sin N° asignado'
                              : 'Personal del club'}
                    </p>
                </div>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                <p className="kicker px-3 pb-2 text-sidebar-foreground/40">Mi cuenta</p>
                {navLinks.map(({ to, label, icon: Icon, end }) => (
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
                {/* Cuenta híbrida (socio + recepción): sin este link, su único
                    camino al escáner era tipear la URL a mano. */}
                {is(Roles.RECEPTION) && (
                    <Link
                        to="/puerta"
                        onClick={onNavigate}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    >
                        <ScanLine className="size-4.5" />
                        Escanear credencial
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
