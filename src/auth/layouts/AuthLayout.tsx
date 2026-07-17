import { Link, Outlet } from 'react-router'
import { ArrowLeft } from 'lucide-react'

import heroImage from '@/assets/hero.png'
import { ClubLogo } from '@/components/custom/ClubLogo'

/** Pantalla partida: panel de marca a la izquierda, formulario a la derecha. */
export const AuthLayout = () => {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <aside className="relative isolate hidden flex-col justify-between overflow-hidden bg-ink p-12 lg:flex">
                <img
                    src={heroImage}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 -z-10 size-full object-cover opacity-30"
                />
                <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-dark opacity-80" />

                <Link to="/">
                    <ClubLogo inverted />
                </Link>

                <div>
                    <p className="kicker text-secondary">Portal del socio</p>
                    <p className="text-display mt-4 max-w-md text-4xl leading-tight text-white">
                        Tu credencial, tus pagos y la vida del club, en un solo lugar.
                    </p>
                </div>

                <p className="text-xs text-white/40">
                    © {new Date().getFullYear()} Club Alianza · Fundado en 1944
                </p>
            </aside>

            <main className="flex flex-col justify-center bg-background px-6 py-12 sm:px-12">
                <div className="mx-auto w-full max-w-sm">
                    <Link
                        to="/"
                        className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Volver al sitio
                    </Link>

                    <div className="mb-8 lg:hidden">
                        <ClubLogo />
                    </div>

                    <Outlet />
                </div>
            </main>
        </div>
    )
}
