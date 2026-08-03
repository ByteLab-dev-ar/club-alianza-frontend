import { useRef, useState } from 'react'
import { Download, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCredential } from '../hooks/useProfile'
import { CredentialCard } from '../components/CredentialCard'

export const CredentialPage = () => {
    const { data: credential, isLoading, isError } = useCredential()
    const cardRef = useRef<HTMLDivElement>(null)
    const [isDownloading, setIsDownloading] = useState(false)

    const downloadPng = async () => {
        if (!cardRef.current) return

        setIsDownloading(true)
        try {
            // html-to-image solo hace falta si alguien aprieta Descargar, así que
            // se baja recién acá en vez de viajar con la página. El estado
            // isDownloading ya cubre la espera.
            const { toPng } = await import('html-to-image')
            const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 })
            const link = document.createElement('a')
            link.download = `credencial-club-alianza-${credential?.memberNumber ?? 'socio'}.png`
            link.href = dataUrl
            link.click()
        } catch {
            toast.error('No pudimos generar la imagen de la credencial')
        } finally {
            setIsDownloading(false)
        }
    }

    if (isLoading) return <Skeleton className="h-64 rounded-2xl" />

    if (isError || !credential) {
        return (
            <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                No pudimos cargar tu credencial. Probá recargar en unos minutos.
            </p>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <p className="kicker text-brand">Credencial digital</p>
                <h1 className="text-display mt-2 text-3xl text-ink">Tu credencial</h1>
            </div>

            {/* La tarjeta tiene ancho fijo de credencial, así que los paneles de
                ayuda se acomodan al lado en vez de dejar un hueco. */}
            <div className="grid items-start gap-6 lg:grid-cols-[28rem_1fr]">
                <CredentialCard credential={credential} cardRef={cardRef} />

                <div className="flex flex-col gap-5">
                    <div className="rounded-xl border bg-card p-6 shadow-soft">
                        <h2 className="font-display text-lg font-bold text-ink">
                            Cómo funciona el QR
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            En la puerta lo escanea alguien del club desde su propia cuenta, y ve
                            tu foto, tu número de socio y si tu cuota está al día. No expone tu
                            DNI, ni tu domicilio, ni tu teléfono.
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            El código no vence. Si perdés la tarjeta, avisá al club: la anulan y
                            desde acá obtenés una nueva.
                        </p>

                        <div className="mt-6">
                            <Button
                                variant="dark"
                                onClick={() => void downloadPng()}
                                disabled={isDownloading}
                            >
                                {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
                                Descargar PNG
                            </Button>
                        </div>
                    </div>

                    {/* Antes había acá un "Copiar link" y un botón para abrir el
                        validador. Los dos sobran: el validador dejó de ser público
                        —ahora exige sesión de staff— así que ese link no le sirve
                        a nadie más que al club, y a un socio le responde 403. */}
                    <div className="flex items-start gap-3 rounded-xl border bg-muted/40 p-5">
                        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" />
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Solo el personal del club puede leer este código. Aunque alguien te
                            saque una foto de la pantalla, sin una cuenta habilitada no puede
                            consultar tus datos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
