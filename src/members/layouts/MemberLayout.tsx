import { Link, NavLink, Outlet } from 'react-router'
import { CreditCard, LayoutDashboard, LogOut, Receipt, UserCog } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ClubLogo } from '@/components/custom/ClubLogo'
import { useAuthStore } from '@/auth/store/auth.store'
import { STAFF_ROLES } from '@/constants/roles'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
    { to: '/mi-cuenta', label: 'Resumen', icon: LayoutDashboard, end: true },
    { to: '/mi-cuenta/credencial', label: 'Credencial', icon: CreditCard },
    { to: '/mi-cuenta/pagos', label: 'Pagos', icon: Receipt },
    { to: '/mi-cuenta/perfil', label: 'Mi perfil', icon: UserCog },
]

export const MemberLayout = () => {
    const { logoutUser, is } = useAuthStore()
    const isStaff = is(...STAFF_ROLES)

    return (
        <div className="min-h-screen bg-tertiary">
            <header className="border-b bg-background">
                <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-6">
                    <Link to="/" aria-label="Club Alianza — Inicio">
                        <ClubLogo />
                    </Link>

                    <div className="flex items-center gap-2">
                        {isStaff && (
                            <Button asChild variant="ghost" size="sm">
                                <Link to="/admin">Panel admin</Link>
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => void logoutUser()}>
                            <LogOut /> Salir
                        </Button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-6 py-10">
                <nav className="mb-8 flex gap-1 overflow-x-auto rounded-xl border bg-card p-1.5 shadow-soft">
                    {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                cn(
                                    'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors',
                                    isActive
                                        ? 'bg-ink text-background'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                )
                            }
                        >
                            <Icon className="size-4" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <Outlet />
            </div>
        </div>
    )
}
