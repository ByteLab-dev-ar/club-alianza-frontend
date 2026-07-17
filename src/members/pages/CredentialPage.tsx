import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { toPng } from 'html-to-image'
import { Copy, Download, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCredential } from '../hooks/useProfile'
import { buildValidationUrl, CredentialCard } from '../components/CredentialCard'

export const CredentialPage = () => {
    const { data: credential, isLoading, isError } = useCredential()
    const cardRef = useRef<HTMLDivElement>(null)
    const [isDownloading, setIsDownloading] = useState(false)

    const downloadPng = async () => {
        if (!cardRef.current) return

        setIsDownloading(true)
        try {
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

    const copyValidationLink = async () => {
        if (!credential) return

        await navigator.clipboard.writeText(buildValidationUrl(credential.qrPayload))
        toast.success('Link de validación copiado')
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
                <p className="kicker text-secondary">Credencial digital</p>
                <h1 className="text-display mt-2 text-3xl text-ink">Tu credencial</h1>
            </div>

            <CredentialCard credential={credential} cardRef={cardRef} />

            <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-xl border bg-card p-6 shadow-soft">
                    <h2 className="font-display text-lg font-bold text-ink">
                        Cómo funciona el QR
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        Al escanearlo, cualquiera puede verificar tu identidad y si tu cuota está al
                        día, en tiempo real. No expone tu DNI, ni tu domicilio, ni tu teléfono.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <Button variant="dark" onClick={() => void downloadPng()} disabled={isDownloading}>
                            {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
                            Descargar PNG
                        </Button>
                        <Button variant="outline" onClick={() => void copyValidationLink()}>
                            <Copy /> Copiar link
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-soft">
                    <h2 className="font-display text-lg font-bold text-ink">Probá la validación</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        Abrí la misma pantalla pública que ve quien escanea tu código.
                    </p>

                    <code className="mt-4 block truncate rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                        /validar/{credential.qrPayload.slice(0, 28)}…
                    </code>

                    <Button asChild variant="outline" className="mt-6">
                        <Link to={`/validar/${credential.qrPayload}`} target="_blank">
                            <ExternalLink /> Abrir validador
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
