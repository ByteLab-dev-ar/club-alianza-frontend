import { Skeleton } from '@/components/ui/skeleton'
import { useProfile } from '../hooks/useProfile'
import { ProfileForm } from '../components/ProfileForm'
import { ProfilePhotoUpload } from '../components/ProfilePhotoUpload'
import { DocumentUpload } from '../components/DocumentUpload'
import { EmailChangeCard } from '../components/EmailChangeCard'

export const ProfilePage = () => {
    const { data: profile, isLoading, isError } = useProfile()

    if (isLoading) return <Skeleton className="h-96 rounded-xl" />

    if (isError || !profile) {
        return (
            <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                No pudimos cargar tu perfil. Probá recargar en unos minutos.
            </p>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <p className="kicker text-brand">Mi perfil</p>
                <h1 className="text-display mt-2 text-3xl text-ink">Tus datos</h1>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-soft">
                <ProfilePhotoUpload urlPhoto={profile.urlPhoto} />
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold text-ink">Datos personales</h2>
                <div className="mt-6">
                    <ProfileForm profile={profile} />
                </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold text-ink">Documentación</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Subí una foto de tu DNI para completar tu ficha.
                </p>
                <div className="mt-6">
                    <DocumentUpload />
                </div>
            </div>

            {/* Un perfil sin cuenta no tiene correo que cambiar (§2.2: al menor
                no se le pide). Quien está mirando esta pantalla siempre tiene
                una, pero el tipo obliga a decirlo y así queda dicho. */}
            {profile.email !== null && <EmailChangeCard currentEmail={profile.email} />}
        </div>
    )
}
