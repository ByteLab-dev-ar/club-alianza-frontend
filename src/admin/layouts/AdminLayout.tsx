import { useState } from 'react'
import { Outlet } from 'react-router'
import { Menu, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ClubLogo } from '@/components/custom/ClubLogo'
import { AdminSidebar } from '../components/AdminSidebar'

export const AdminLayout = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    return (
        <div className="min-h-screen bg-tertiary lg:grid lg:grid-cols-[16rem_1fr]">
            {/* Sidebar fijo en desktop */}
            <aside className="sticky top-0 hidden h-screen lg:block">
                <AdminSidebar />
            </aside>

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
                        onClick={() => setIsDrawerOpen(false)}
                    />
                    <div className={cn('absolute inset-y-0 left-0 w-72 shadow-club')}>
                        <button
                            type="button"
                            onClick={() => setIsDrawerOpen(false)}
                            className="absolute top-5 right-4 z-10 grid size-8 place-items-center rounded-md text-sidebar-foreground/70"
                            aria-label="Cerrar menú"
                        >
                            <X className="size-5" />
                        </button>
                        <AdminSidebar onNavigate={() => setIsDrawerOpen(false)} />
                    </div>
                </div>
            )}

            <main className="min-w-0 px-5 py-8 sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
