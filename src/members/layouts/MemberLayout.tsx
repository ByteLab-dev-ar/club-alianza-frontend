import { PanelShell } from '@/components/custom/PanelShell'
import { cn } from '@/lib/utils'
import { MemberSidebar } from '../components/MemberSidebar'
import { useProfile } from '../hooks/useProfile'

export const MemberLayout = () => {
    const { data: profile } = useProfile()

    return (
        <PanelShell
            sidebar={(props) => <MemberSidebar {...props} />}
            contentClassName="max-w-5xl"
            banner={
                /* Identidad + estado de la membresía. Va en el layout y no en una
                   página porque es lo que el socio viene a mirar, esté donde esté. */
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
            }
        />
    )
}
