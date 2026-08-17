import { useRef, useState } from 'react'
import { Check, Download, FileSignature, Loader2, PenLine, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IMAGE_OR_PDF_TYPES, validateUpload } from '@/shared/lib/file-validation'
import { useOpenPrivateFile } from '@/lib/open-private-file'
import { formatCalendarDate } from '@/lib/format'
import { affiliationFormPath } from '../actions/affiliation.actions'
import { useSignAffiliationForm, useUploadSignedAffiliationForm } from '../hooks/useAffiliation'
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
    /** Cuándo se subió la ficha que ya está, o `null` si todavía no hay ninguna. */
    signedAt: string | null
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
    signedAt,
    membershipStatus,
    frozen = false,
}: Props) => {
    const padRef = useRef<SignaturePadHandle>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [hasStroke, setHasStroke] = useState(false)

    const { mutate: uploadForm, isPending: isUploading } = useUploadSignedAffiliationForm()
    const { mutate: signForm, isPending: isSigning } = useSignAffiliationForm()

    const onFileSelected = (file: File | undefined) => {
        if (!file) return

        // El escáner hogareño saca PDF: filtrar a solo imágenes dejaba afuera a
        // media parte de la gente que imprimió y firmó lo que el club le pidió.
        const error = validateUpload(file, {
            types: IMAGE_OR_PDF_TYPES,
            typesLabel: 'imágenes (JPG, PNG, WebP) o PDF',
        })
        if (error) {
            toast.error(error)
            return
        }

        uploadForm({ profileId, file })
    }

    const onSign = async () => {
        const signature = await padRef.current?.toBlob()
        if (!signature) {
            toast.error('Dibujá tu firma antes de confirmar')
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
    const isSettled = membershipStatus === MembershipStatuses.MEMBER && signedAt !== null

    if (isSettled) {
        return (
            <section className="rounded-xl border bg-card p-6 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-display text-lg font-bold text-ink">
                            Ficha de afiliación
                        </h2>
                        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-success">
                            <Check className="size-4 shrink-0" />
                            Firmada el {formatCalendarDate(signedAt)}
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
                        La solicitud de socio del club, ya completa con tus datos. Elegí cómo
                        firmarla: en papel o en pantalla. Es la misma ficha en los dos casos.
                    </p>
                </div>

                {signedAt && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success">
                        <Check className="size-3.5" />
                        Firmada el {formatCalendarDate(signedAt)}
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

            <Tabs defaultValue="pantalla" className="mt-6">
                <TabsList className="w-full">
                    <TabsTrigger value="pantalla" className="flex-1">
                        <PenLine className="size-4" /> Firmar en pantalla
                    </TabsTrigger>
                    <TabsTrigger value="papel" className="flex-1">
                        <FileSignature className="size-4" /> Firmar en papel
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pantalla" className="mt-4">
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
                </TabsContent>

                <TabsContent value="papel" className="mt-4">
                    {/* Lo que vale es el papel, y hay que decirlo: si la persona
                        cree que subir la foto es el trámite completo, el club se
                        queda sin el documento que sostiene la afiliación. */}
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Imprimí la ficha, firmala a mano y subí acá la foto o el escaneo.{' '}
                        <strong className="font-semibold text-ink">
                            El club se queda con el papel:
                        </strong>{' '}
                        acercalo a la sede cuando puedas. Lo que subís es una copia.
                    </p>

                    <Button
                        variant="outline"
                        className="mt-4 w-full sm:w-fit"
                        disabled={frozen || isUploading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                        {isUploading ? 'Subiendo…' : 'Subir la ficha firmada'}
                    </Button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        className="hidden"
                        onChange={(event) => {
                            onFileSelected(event.target.files?.[0])
                            // Sin esto, elegir el MISMO archivo dos veces seguidas
                            // no dispara el change y parece que el botón no anda.
                            event.target.value = ''
                        }}
                    />

                    <p className="mt-2 text-xs text-muted-foreground">
                        Se aceptan JPG, PNG, WebP o PDF, hasta 5 MB.
                    </p>
                </TabsContent>
            </Tabs>
        </section>
    )
}
