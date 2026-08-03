import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import QrScanner from 'qr-scanner'
import { CameraOff, Flashlight, RotateCcw, ScanLine } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { extractToken } from '../lib/qr-token'

type Status = 'starting' | 'scanning' | 'no-camera' | 'denied'

/**
 * Pantalla de puerta. La usa alguien parado en la entrada, con el celular en la
 * mano y gente esperando: cámara a pantalla completa, y el resultado se muestra
 * en /validar/:token, que es la misma ruta a la que cae quien escanea el QR con
 * la cámara nativa del teléfono.
 */
export const DoorScannerPage = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const navigate = useNavigate()

    const [status, setStatus] = useState<Status>('starting')
    const [flashAvailable, setFlashAvailable] = useState(false)
    // Cada incremento re-ejecuta el arranque completo (está en las deps del
    // efecto). Es el "Reintentar" de los estados de error: si la persona negó
    // el permiso y después lo habilitó, no tiene que recargar la página parada
    // en la puerta.
    const [attempt, setAttempt] = useState(0)
    const scannerRef = useRef<QrScanner | null>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        // En un reintento, volver a "encendiendo" mientras el arranque corre.
        setStatus('starting')

        let cancelled = false
        let scanner: QrScanner | null = null

        const start = async () => {
            const hasCamera = await QrScanner.hasCamera()
            // El arranque es async: el cleanup pudo haber corrido durante el
            // await (navegación rápida, o el doble-mount de StrictMode en dev).
            // Sin este corte, se construía y encendía una cámara que ya nadie
            // iba a apagar.
            if (cancelled) return
            if (!hasCamera) {
                setStatus('no-camera')
                return
            }

            scanner = new QrScanner(
                video,
                (result) => {
                    const token = extractToken(result.data)
                    if (!token) return

                    // Se frena antes de navegar: si no, sigue disparando lecturas
                    // del mismo código mientras se desmonta.
                    scanner?.stop()
                    void navigate(`/validar/${token}`)
                },
                {
                    preferredCamera: 'environment',
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                    // 5 por segundo alcanza de sobra y no calienta el teléfono.
                    maxScansPerSecond: 5,
                    returnDetailedScanResult: true,
                },
            )
            scannerRef.current = scanner

            try {
                await scanner.start()
                if (cancelled) return
                setStatus('scanning')
                setFlashAvailable(await scanner.hasFlash())
            } catch {
                if (!cancelled) setStatus('denied')
            }
        }

        void start()

        return () => {
            cancelled = true
            // Vía el ref y no la variable local: si el cleanup corre mientras
            // `scanner.start()` está en vuelo, el ref ya apunta al scanner y
            // destroy() lo apaga aunque el arranque no haya terminado (la lib
            // aborta el start en curso al verse destruida).
            scannerRef.current?.destroy()
            scannerRef.current = null
        }
    }, [navigate, attempt])

    return (
        <div className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-5 py-8">
            <div>
                <p className="kicker text-brand">Control de acceso</p>
                <h1 className="text-display mt-2 text-3xl text-ink">Escanear credencial</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Apuntá al código QR de la tarjeta del socio.
                </p>
            </div>

            <div className="relative aspect-square overflow-hidden rounded-2xl border bg-ink">
                {/* El video se monta siempre: qr-scanner necesita el elemento en el
                    DOM antes de poder arrancar. Los estados de error se dibujan
                    encima. */}
                <video ref={videoRef} className="size-full object-cover" muted playsInline />

                {status === 'starting' && (
                    <div className="absolute inset-0 grid place-items-center bg-ink/80 text-white/70">
                        <p className="text-sm">Encendiendo la cámara…</p>
                    </div>
                )}

                {(status === 'no-camera' || status === 'denied') && (
                    <div className="absolute inset-0 grid place-items-center bg-ink/90 px-8 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <CameraOff className="size-10 text-white/50" />
                            <p className="font-display text-lg font-bold text-white">
                                {status === 'no-camera'
                                    ? 'No encontramos una cámara'
                                    : 'Sin permiso para la cámara'}
                            </p>
                            <p className="max-w-xs text-sm leading-relaxed text-white/60">
                                {status === 'no-camera'
                                    ? 'Probá desde un celular.'
                                    : 'Habilitá la cámara para este sitio en los permisos del navegador y volvé a entrar.'}
                            </p>
                            <Button
                                variant="hero"
                                className="mt-2"
                                onClick={() => setAttempt((current) => current + 1)}
                            >
                                <RotateCcw /> Reintentar
                            </Button>
                            <p className="max-w-xs text-xs leading-relaxed text-white/40">
                                Mientras tanto podés escanear el QR con la cámara del teléfono: te
                                abre esta misma app con el resultado.
                            </p>
                        </div>
                    </div>
                )}

                {status === 'scanning' && (
                    <span className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-semibold text-white/80">
                        <ScanLine className="size-3.5" /> Buscando código…
                    </span>
                )}
            </div>

            {flashAvailable && (
                <Button
                    variant="outline"
                    onClick={() => void scannerRef.current?.toggleFlash()}
                    className="w-fit"
                >
                    <Flashlight /> Linterna
                </Button>
            )}
        </div>
    )
}
