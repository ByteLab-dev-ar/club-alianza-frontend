import { type ReactNode, Suspense, useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { Menu, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ClubLogo } from '@/components/custom/ClubLogo'
import { SectionLoader } from '@/components/custom/PageLoader'

interface Props {
    /** Recibe `onNavigate` para que el drawer se cierre al tocar un link. */
    sidebar: (props: { onNavigate?: () => void }) => ReactNode
    /** Franja fija sobre el contenido (la usa el portal del socio). */
    banner?: ReactNode
    /** Ancho del contenido: el panel admin usa tablas más anchas. */
    contentClassName?: string
}

/**
 * Marco de los dos paneles privados: sidebar fijo en desktop, topbar con drawer
 * en mobile y el área de contenido.
 *
 * Estaba duplicado línea por línea entre AdminLayout y MemberLayout, y ya había
 * empezado a divergir. Con una sola copia, las mejoras del drawer —como cerrar
 * con Escape o bloquear el scroll de fondo, que antes no hacía ninguno de los
 * dos— valen para los dos paneles.
 */
export const PanelShell = ({ sidebar, banner, contentClassName = 'max-w-6xl' }: Props) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const closeDrawer = () => setIsDrawerOpen(false)

    useEffect(() => {
        if (!isDrawerOpen) return

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsDrawerOpen(false)
        }

        // Bloquea el scroll del fondo mientras el drawer está abierto.
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', onKeyDown)

        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [isDrawerOpen])

    return (
        <div className="min-h-screen bg-tertiary lg:grid lg:grid-cols-[16rem_1fr]">
            {/* Sidebar fijo en desktop */}
            <aside className="sticky top-0 hidden h-screen lg:block">{sidebar({})}</aside>

            {/* Topbar solo en mobile */}
            <header className="flex h-16 items-center justify-between border-b bg-sidebar px-4 text-sidebar-foreground lg:hidden">
                <ClubLogo inverted />
                <button
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    className="grid size-10 place-items-center rounded-lg border border-sidebar-border"
                    aria-label="Abrir menú"
                >
                    <Menu className="size-5" />
                </button>
            </header>

            {/* Drawer mobile */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
                        onClick={closeDrawer}
                    />
                    <div className="absolute inset-y-0 left-0 w-72 shadow-club">
                        <button
                            type="button"
                            onClick={closeDrawer}
                            className="absolute top-5 right-4 z-10 grid size-8 place-items-center rounded-md text-sidebar-foreground/70"
                            aria-label="Cerrar menú"
                        >
                            <X className="size-5" />
                        </button>
                        {sidebar({ onNavigate: closeDrawer })}
                    </div>
                </div>
            )}

            <div className="min-w-0">
                {banner}

                <main className="px-5 py-8 sm:px-8">
                    <div className={cn('mx-auto', contentClassName)}>
                        {/* Cada página es un chunk aparte: el marco no se desmonta
                            mientras la sección carga su código. */}
                        <Suspense fallback={<SectionLoader />}>
                            <Outlet />
                        </Suspense>
                    </div>
                </main>
            </div>
        </div>
    )
}
