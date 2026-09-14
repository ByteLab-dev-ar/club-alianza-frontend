import { type ReactNode, Suspense, useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { Menu, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useThemeStore } from '@/lib/theme.store'
import { ClubLogo } from '@/components/custom/ClubLogo'
import { SectionLoader } from '@/components/custom/PageLoader'
import { NotificationBell } from '@/notifications/components/NotificationBell'

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

    const theme = useThemeStore((state) => state.theme)

    /*
     * El modo oscuro vive en `<html>` mientras un panel está montado, y se va
     * con él. En `<html>` y no en este div: los diálogos y menús de Radix se
     * montan en un portal DIRECTO en `<body>` — con la clase acá, cada popover
     * del panel quedaría claro sobre una pantalla oscura.
     *
     * El cleanup es lo que mantiene el sitio público siempre claro: salir del
     * panel (a la landing, al login) desmonta el shell y limpia la clase. La
     * preferencia no se pierde — queda en el store y en localStorage.
     */
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        return () => document.documentElement.classList.remove('dark')
    }, [theme])

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
            {/* El borde solo existe en oscuro: ahí el sidebar (15%) queda casi
                fundido con el fondo (14%) —que es el efecto buscado— y sin esta
                línea no se sabría dónde termina. En claro el contraste del
                bloque ya lo dice solo. */}
            <aside className="sticky top-0 hidden h-screen lg:block dark:border-r dark:border-sidebar-border">
                {sidebar({})}
            </aside>

            {/* Topbar solo en mobile */}
            <header className="flex h-16 items-center justify-between border-b bg-sidebar px-4 text-sidebar-foreground lg:hidden">
                <ClubLogo inverted />
                <div className="flex items-center gap-1">
                    {/* En mobile la campana va acá y no adentro del sidebar: el
                        sidebar es el drawer, y un badge que hay que abrir un
                        menú para ver no avisa nada. */}
                    <NotificationBell className="hover:bg-sidebar-accent" />
                    <button
                        type="button"
                        onClick={() => setIsDrawerOpen(true)}
                        className="grid size-10 place-items-center rounded-lg border border-sidebar-border"
                        aria-label="Abrir menú"
                    >
                        <Menu className="size-5" />
                    </button>
                </div>
            </header>

            {/* Drawer mobile */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
