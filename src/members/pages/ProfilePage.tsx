import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfile } from '../hooks/useProfile'
import { MembershipStatuses } from '../interfaces/MemberProfile'
import { ProfileForm } from '../components/ProfileForm'
import { ProfilePhotoUpload } from '../components/ProfilePhotoUpload'
import { DocumentUpload } from '../components/DocumentUpload'
import { EmailChangeCard } from '../components/EmailChangeCard'

/** A qué bloque de la página lleva cada requisito que no es un campo del form. */
const SECTION_FOR_FIELD: Record<string, string> = {
    photoKey: 'perfil-foto',
    DNI_FRONT: 'perfil-documentos',
    DNI_BACK: 'perfil-documentos',
}

export const ProfilePage = () => {
    const { data: profile, isLoading, isError } = useProfile()
    // El checklist de afiliación linkea acá con `?campo=<field>`: sin eso, "te
    // falta el DNI (dorso)" deja a la persona buscando dónde se sube.
    const [searchParams] = useSearchParams()
    const focusField = searchParams.get('campo')

    const photoRef = useRef<HTMLDivElement>(null)
    const documentsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!focusField) return

        const section = SECTION_FOR_FIELD[focusField]
        const target = section === 'perfil-foto' ? photoRef.current : section === 'perfil-documentos' ? documentsRef.current : null

        // El foco de los campos del formulario lo pone ProfileForm; acá solo se
        // resuelven los dos que no son inputs.
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, [focusField])

    if (isLoading) return <Skeleton className="h-96 rounded-xl" />

    if (isError || !profile) {
        return (
            <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                No pudimos cargar tu perfil. Probá recargar en unos minutos.
            </p>
        )
    }

    /*
     * Mientras la solicitud está en revisión la ficha queda congelada (§1.8): si
     * se pudiera editar, el domicilio cambiaría después de haber firmado y el
     * papel dejaría de coincidir con el sistema. El PATCH del perfil, la foto y
     * los documentos responden 409, así que se deshabilita todo y se explica el
     * camino en vez de dejar a la persona chocar contra el error.
     */
    const frozen = profile.membershipStatus === MembershipStatuses.PENDING

    return (
        <div className="flex flex-col gap-8">
            <div>
                <p className="kicker text-brand">Mi perfil</p>
                <h1 className="text-display mt-2 text-3xl text-ink">Tus datos</h1>
            </div>

            {frozen && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-warning/40 bg-warning/10 p-6">
                    <div className="flex items-start gap-3">
                        <Lock className="mt-0.5 size-4.5 shrink-0 text-warning" />
                        <div>
                            <p className="font-display font-bold text-ink">
                                Tus datos están congelados
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                Presentaste la solicitud de afiliación y el club la está
                                revisando. Para corregir algo, cancelala primero: después
                                editás y la volvés a presentar.
                            </p>
                        </div>
                    </div>
                    <Button asChild variant="dark">
                        <Link to="/mi-cuenta/afiliacion">Ir a mi afiliación</Link>
                    </Button>
                </div>
            )}

            <div ref={photoRef} className="rounded-xl border bg-card p-6 shadow-soft">
                <ProfilePhotoUpload urlPhoto={profile.urlPhoto} frozen={frozen} />
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold text-ink">Datos personales</h2>
                <div className="mt-6">
                    <ProfileForm profile={profile} frozen={frozen} focusField={focusField} />
                </div>
            </div>

            <div ref={documentsRef} className="rounded-xl border bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold text-ink">Documentación</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Subí una foto de tu DNI para completar tu ficha.
                </p>
                <div className="mt-6">
                    <DocumentUpload frozen={frozen} />
                </div>
            </div>

            {/* Un perfil sin cuenta no tiene correo que cambiar (§2.2: al menor
                no se le pide). Quien está mirando esta pantalla siempre tiene
                una, pero el tipo obliga a decirlo y así queda dicho. */}
            {profile.email !== null && <EmailChangeCard currentEmail={profile.email} />}
        </div>
    )
}
