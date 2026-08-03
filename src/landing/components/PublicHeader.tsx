import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { LogOut, Menu, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ClubLogo } from '@/components/custom/ClubLogo'
import { useAuthStore } from '@/auth/store/auth.store'
import { Roles, STAFF_ROLES } from '@/constants/roles'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
    { to: '/', label: 'Inicio', end: true },
    { to: '/eventos', label: 'Eventos' },
    { to: '/historia', label: 'Historia' },
    { to: '/institucional', label: 'Institucional' },
    { to: '/galeria', label: 'Galería' },
    { to: '/contacto', label: 'Contacto' },
]

export const PublicHeader = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    // Selectores atómicos: las funciones del store tienen identidad estable en
    // Zustand, así que seleccionarlas por separado no agrega re-renders.
    const status = useAuthStore((state) => state.status)
    const user = useAuthStore((state) => state.user)
    const logoutUser = useAuthStore((state) => state.logoutUser)
    const is = useAuthStore((state) => state.is)

    // Mientras se verifica la sesión mostramos el estado anónimo, que es el de la
    // enorme mayoría de las visitas: el sitio público no espera al backend para
    // renderizar. Para quien sí tiene sesión, los botones cambian a "Mi cuenta"
    // en cuanto responde /users/me.
    const isAuthenticated = status === 'authenticated'
    const isStaff = is(...STAFF_ROLES)

    /**
     * Recepción no tiene portal de socio ni panel: lo único suyo es el escáner.
     * Se chequea que sea su ÚNICO rol en vez de preguntar `is(RECEPTION)`,
     * porque alguien puede ser socio del club y además atender la puerta —a esa
     * persona hay que seguirle mostrando "Mi cuenta".
     */
    const isReceptionOnly = user?.roles.length === 1 && user.roles[0] === Roles.RECEPTION

    const closeMenu = () => setIsMenuOpen(false)

    return (
        <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
            <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-6">
                <Link to="/" onClick={closeMenu} aria-label="Club Alianza — Inicio">
                    <ClubLogo />
                </Link>

                <nav className="hidden items-center gap-1 lg:flex">
                    {NAV_LINKS.map(({ to, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                cn(
                                    'rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                                    isActive
                                        ? 'text-brand'
                                        : 'text-muted-foreground hover:text-foreground',
                                )
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 lg:flex">
                    {isAuthenticated ? (
                        <>
                            {isStaff && (
                                <Button asChild variant="ghost" size="sm">
                                    <Link to="/admin">Admin</Link>
                                </Button>
                            )}
                            <Button asChild variant="dark" size="sm">
                                {isReceptionOnly ? (
                                    <Link to="/puerta">Escanear</Link>
                                ) : (
                                    <Link to="/mi-cuenta">Mi cuenta</Link>
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => void logoutUser()}
                                // /users/me no expone name/surname: lo más identificable
                                // que tenemos de la sesión es el email.
                                aria-label={`Cerrar sesión de ${user?.email ?? ''}`}
                                title="Cerrar sesión"
                            >
                                <LogOut />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button asChild variant="ghost" size="sm">
                                <Link to="/ingresar">Ingresar</Link>
                            </Button>
                            <Button asChild variant="hero" size="sm">
                                <Link to="/asociarse">Asociarse</Link>
                            </Button>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    className="grid size-10 place-items-center rounded-lg border lg:hidden"
                    onClick={() => setIsMenuOpen((open) => !open)}
                    aria-expanded={isMenuOpen}
                    aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                >
                    {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </button>
            </div>

            {isMenuOpen && (
                <div className="border-t bg-background lg:hidden">
                    <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
                        {NAV_LINKS.map(({ to, label, end }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={end}
                                onClick={closeMenu}
                                className={({ isActive }) =>
                                    cn(
                                        'rounded-md px-3 py-2.5 text-sm font-semibold',
                                        isActive
                                            ? 'bg-accent text-brand'
                                            : 'text-muted-foreground',
                                    )
                                }
                            >
                                {label}
                            </NavLink>
                        ))}

                        <div className="mt-3 flex flex-col gap-2 border-t pt-4">
                            {isAuthenticated ? (
                                <>
                                    {isStaff && (
                                        <Button asChild variant="outline">
                                            <Link to="/admin" onClick={closeMenu}>
                                                Panel admin
                                            </Link>
                                        </Button>
                                    )}
                                    <Button asChild variant="dark">
                                        {isReceptionOnly ? (
                                            <Link to="/puerta" onClick={closeMenu}>
                                                Escanear credencial
                                            </Link>
                                        ) : (
                                            <Link to="/mi-cuenta" onClick={closeMenu}>
                                                Mi cuenta
                                            </Link>
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            closeMenu()
                                            void logoutUser()
                                        }}
                                    >
                                        <LogOut /> Cerrar sesión
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button asChild variant="outline">
                                        <Link to="/ingresar" onClick={closeMenu}>
                                            Ingresar
                                        </Link>
                                    </Button>
                                    <Button asChild variant="hero">
                                        <Link to="/asociarse" onClick={closeMenu}>
                                            Asociarse
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
