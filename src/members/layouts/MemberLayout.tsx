import { useState } from 'react'
import { Outlet } from 'react-router'
import { Menu, X } from 'lucide-react'

import { ClubLogo } from '@/components/custom/ClubLogo'
import { cn } from '@/lib/utils'
import { MemberSidebar } from '../components/MemberSidebar'
import { useProfile } from '../hooks/useProfile'

export const MemberLayout = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const { data: profile } = useProfile()

    return (
        <div className="min-h-screen bg-tertiary lg:grid lg:grid-cols-[16rem_1fr]">
            <aside className="sticky top-0 hidden h-screen lg:block">
                <MemberSidebar />
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
                        <MemberSidebar onNavigate={() => setIsDrawerOpen(false)} />
                    </div>
                </div>
            )}

            <div className="min-w-0">
                {/* Identidad + estado de la membresía. Va en el layout y no en una
                    página porque es lo que el socio viene a mirar, esté donde esté. */}
                <div className="flex min-h-18 flex-wrap items-center justify-between gap-3 border-b bg-background px-5 py-3 sm:px-8">
                    <div>
                        <p className="kicker text-brand">
                            {profile?.memberNumber
                                ? `Socio N° ${profile.memberNumber}`
                                : 'Portal del socio'}
                        </p>
                        <p className="text-display mt-1 text-2xl text-ink">
                            Hola{profile?.name ? `, ${profile.name}` : ''}
                        </p>
                    </div>

                    {profile && (
                        <span
                            className={cn(
                                'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold',
                                profile.isActive
                                    ? 'bg-success/10 text-success'
                                    : 'bg-destructive/10 text-destructive',
                            )}
                        >
                            <span
                                aria-hidden
                                className={cn(
                                    'size-2 rounded-full',
                                    profile.isActive ? 'bg-success' : 'bg-destructive',
                                )}
                            />
                            {profile.isActive ? 'Membresía activa' : 'Cuota vencida'}
                        </span>
                    )}
                </div>

                <main className="px-5 py-8 sm:px-8">
                    <div className="mx-auto max-w-5xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
