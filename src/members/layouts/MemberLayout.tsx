import { PanelShell } from '@/components/custom/PanelShell'
import { useAuthStore } from '@/auth/store/auth.store'
import { cn } from '@/lib/utils'
import { MemberSidebar } from '../components/MemberSidebar'
import { useProfile } from '../hooks/useProfile'

export const MemberLayout = () => {
    const { data: profile } = useProfile()
    const isMember = useAuthStore((state) => state.user?.isMember ?? false)

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
                                : isMember
                                  ? 'Portal del socio'
                                  : 'Personal del club'}
                        </p>
                        <p className="text-display mt-1 text-2xl text-ink">
                            Hola{profile?.name ? `, ${profile.name}` : ''}
                        </p>
                    </div>

                    {/* Solo para socios: quien no lo es no tiene cuota, así que
                        su membershipUntil es NULL y el badge le gritaba "Cuota
                        vencida" en rojo por algo que no le corresponde.

                        Es `isActive` y no las tres coberturas a propósito: este
                        badge responde "¿entrás al club?", y esa sigue siendo la
                        membresía. La actividad y el seguro se ven en la cuenta,
                        donde hay lugar para decir qué implica cada una. */}
                    {profile && isMember && (
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
