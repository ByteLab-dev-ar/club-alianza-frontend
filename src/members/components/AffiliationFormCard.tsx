import { useRef, useState } from 'react'
import { Check, Download, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useOpenPrivateFile } from '@/lib/open-private-file'
import { formatCalendarDate } from '@/lib/format'
import { notify } from '@/lib/notify'
import { affiliationFormPath } from '../actions/affiliation.actions'
import { useSignAffiliationForm } from '../hooks/useAffiliation'
import { MembershipStatuses, type MembershipStatus } from '../interfaces/MemberProfile'
import { SignaturePad, type SignaturePadHandle } from './SignaturePad'

/**
 * Bajar el PDF de la ficha.
 *
 * Va por `openPrivateFile` y no por un `<a href>`: el endpoint exige la cookie
 * de sesión y una navegación del navegador no pasa por el refresh de token, así
 * que con el accessToken vencido la pestaña nueva mostraría un 401 crudo.
 */
export const AffiliationFormDownloadButton = ({ profileId }: { profileId: string }) => {
    const { open: openForm, openingId } = useOpenPrivateFile()
    const isDownloading = openingId === profileId

    return (
        <Button
            variant="outline"
            className="w-full sm:w-fit"
            disabled={isDownloading}
            onClick={() =>
                void openForm(profileId, affiliationFormPath(profileId), { fromApiBase: true })
            }
        >
            {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
            Ver la ficha
        </Button>
    )
}

interface Props {
    /** El propio o el de un tutelado vigente: la ficha es la misma para los dos. */
    profileId: string
    /**
     * Cuándo QUEDÓ EN EL SISTEMA la ficha que ya está, o `null` si todavía no hay
     * ninguna. Que exista significa que está firmada — por eso `null` gobierna
     * `isSettled`.
     *
     * ⚠️ **No es la fecha de la firma, y el nombre lo dice para que no vuelva a
     * confundirse.** Acá llega el `updatedAt` del documento, que es lo único que
     * `GET /members/documents` devuelve. Cuando la firma se hizo en pantalla las
     * dos fechas coinciden —el backend las escribe en el mismo `save`—, pero
     * cuando el club archivó el papel que la persona llevó a la sede, esto es
     * cuándo lo cargaron ellos, no cuándo firmó ella.
     *
     * El panel sí sabe distinguirlas, porque su listado trae `signedVia` y
     * `signedAt` de verdad (ver `admin/lib/affiliation-form-status.ts`). El
     * endpoint del socio todavía no los expone; el día que lo haga, esa función
     * ya está escrita para reusar acá.
     */
    filedAt: string | null
    /**
     * En qué estado está el trámite. Decide si esta tarjeta es algo por hacer o
     * un comprobante de algo hecho — ver `isSettled` más abajo.
     */
    membershipStatus: MembershipStatus
    /**
     * La solicitud está presentada y la ficha quedó congelada (§1.8). Los dos
     * endpoints responden 409, así que en vez de dejar chocar contra el error se
     * explica por qué y cuál es el camino.
     */
    frozen?: boolean
}

/**
 * La ficha de afiliación (§1.4): bajarla, y los dos caminos para firmarla.
 *
 * **Cuando el trámite ya terminó, la tarjeta deja de ofrecer firmar.** Esa regla
 * vive acá adentro y no en cada pantalla a propósito: estaba escrita a mano en
 * el portal del socio y la ficha del tutelado se la olvidó, así que a un chico
 * ya aprobado y con la ficha firmada se le seguía mostrando el recuadro para
 * firmar de nuevo — la app le ofrecía afiliarse a alguien que ya era socio.
 *
 * ⚠️ **Acá no se dice "firma digital" ni "firmado digitalmente" en ningún
 * lado.** La ley 25.506 reserva ese término para el certificado de un
 * certificador licenciado; lo que se dibuja en pantalla es firma electrónica.
 * Se le dice *ficha firmada*, que es lo que es, y el texto del camino de papel
 * aclara que **el club se queda con el papel** — lo que se sube es una copia.
 */
export const AffiliationFormCard = ({
    profileId,
    filedAt,
    membershipStatus,
    frozen = false,
}: Props) => {
    const padRef = useRef<SignaturePadHandle>(null)
    const [hasStroke, setHasStroke] = useState(false)

    const { mutate: signForm, isPending: isSigning } = useSignAffiliationForm()

    const onSign = async () => {
        const signature = await padRef.current?.toBlob()
        if (!signature) {
            notify.error('Dibujá tu firma antes de confirmar')
            return
        }

        signForm(
            { profileId, signature },
            { onSuccess: () => padRef.current?.clear() },
        )
    }

    /*
     * El trámite terminó: el club aprobó y la ficha está firmada. No hay nada
     * que hacer acá, así que la tarjeta pasa a ser lo único que sigue sirviendo
     * —poder verla— en vez de un formulario que invita a rehacer algo hecho.
     *
     * El socio SIN ficha no entra en este caso a propósito: viene del padrón
     * histórico o de un alta del club, y sí le falta firmarla.
     */
    const isSettled = membershipStatus === MembershipStatuses.MEMBER && filedAt !== null

    if (isSettled) {
        return (
            <section className="rounded-xl border bg-card p-6 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-display text-lg font-bold text-ink">
                            Ficha de afiliación
                        </h2>
                        {/* El hecho y la fecha, separados, porque son dos cosas
                            distintas: que la ficha EXISTA es lo que prueba que
                            está firmada, y la fecha que tenemos es la de su
                            archivado. Decir "Firmada el X" fechaba la firma de
                            alguien que capaz firmó en papel una semana antes de
                            que el club lo cargara.

                            El verde va en el tilde y la frase en tinta: como
                            texto de 14px daba 4.01:1 sobre la tarjeta blanca y
                            hacen falta 4.5:1. Como ícono alcanza (pide 3:1). */}
                        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
                            <Check className="size-4 shrink-0 text-success" />
                            Ficha firmada
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            En el sistema desde el {formatCalendarDate(filedAt)}
                        </p>
                    </div>
                    <AffiliationFormDownloadButton profileId={profileId} />
                </div>
            </section>
        )
    }

    return (
        <section className="rounded-xl border bg-card p-6 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="font-display text-lg font-bold text-ink">
                        Ficha de afiliación
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        La solicitud de socio del club, ya completa con tus datos. Firmala
                        acá mismo y el trámite sigue sin que imprimas nada.
                    </p>
                </div>

                {filedAt && (
                    /* Misma regla que arriba, y acá aprieta más: 12px en verde
                       sobre `bg-success/10` daban 3.55:1. El color queda en el
                       tilde y en el relleno. */
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-foreground">
                        <Check className="size-3.5 text-success" />
                        Firmada
                    </span>
                )}
            </div>

            {frozen && (
                <p className="mt-4 rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                    Tu solicitud está en revisión, así que la ficha quedó congelada. Para
                    cambiarla tenés que cancelar la solicitud primero.
                </p>
            )}

            <div className="mt-5">
                <AffiliationFormDownloadButton profileId={profileId} />
            </div>

            {/*
             * Un solo camino, y por eso ya no hay pestañas.
             *
             * Acá había un segundo camino, "Firmar en papel": imprimir la ficha,
             * firmarla a mano y subir la foto. §1.4 lo retiró el 2026-08-19 —"el
             * papel entra por la sede"— porque le hacía llenar la ficha online,
             * imprimirla y volver a subirla a la misma persona que ya tenía la
             * pantalla para firmar.
             *
             * Y desde el 2026-08-21 no era solo de más: el `POST
             * /members/:id/affiliation-form` que llamaba se mudó al panel
             * (`admin-members.controller.ts`). O sea que el socio elegía el
             * archivo, subía, y se comía un error. Ahora la ficha en papel la
             * carga el club desde la ficha del socio.
             */}
            <div className="mt-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Firmá con el dedo o el mouse y listo: el club recibe la ficha firmada,
                    sin que tengas que imprimir nada.
                </p>

                <div className="mt-4">
                    <SignaturePad
                        ref={padRef}
                        disabled={frozen || isSigning}
                        onDrawnChange={setHasStroke}
                    />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                        variant="hero"
                        disabled={frozen || isSigning || !hasStroke}
                        onClick={() => void onSign()}
                    >
                        {isSigning && <Loader2 className="animate-spin" />}
                        {isSigning ? 'Enviando…' : 'Confirmar firma'}
                    </Button>
                    <Button
                        variant="ghost"
                        disabled={frozen || isSigning || !hasStroke}
                        onClick={() => padRef.current?.clear()}
                    >
                        Borrar y firmar de nuevo
                    </Button>
                </div>

                {/* Si prefiere el papel, que sepa qué hacer: el camino existe,
                    pero pasa por la sede y no por acá. */}
                <p className="mt-4 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
                    ¿Preferís firmarla en papel? Bajala, imprimila y llevala firmada a la
                    sede. El club se queda con el papel y la carga por vos.
                </p>
            </div>
        </section>
    )
}
