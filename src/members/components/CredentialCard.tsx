import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { User } from 'lucide-react'

import { ClubLogo } from '@/components/custom/ClubLogo'
import { formatCalendarDate } from '@/lib/format'
import type { Credential } from '../interfaces/Credential'

interface Props {
    credential: Credential
    /** Ref para exportar la tarjeta como PNG. */
    cardRef?: React.Ref<HTMLDivElement>
}

/** URL que se escanea desde el QR. La arma el frontend, no el backend. */
export const buildValidationUrl = (qrPayload: string) =>
    `${window.location.origin}/validar/${qrPayload}`

export const CredentialCard = ({ credential, cardRef }: Props) => {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

    useEffect(() => {
        // Se genera en el cliente: el backend solo firma el token, nunca manda la imagen.
        void QRCode.toDataURL(buildValidationUrl(credential.qrPayload), {
            margin: 1,
            width: 320,
            color: { dark: '#0b1220', light: '#ffffff' },
        }).then(setQrDataUrl)
    }, [credential.qrPayload])

    return (
        <div
            ref={cardRef}
            className="overflow-hidden rounded-2xl bg-gradient-dark shadow-club"
            // Fondo explícito: html-to-image no hereda el gradiente de las clases
            // utilitarias al serializar el nodo.
            style={{ backgroundColor: '#0b1220' }}
        >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <ClubLogo inverted />
                <span className="kicker text-secondary">Credencial digital</span>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto]">
                <div className="flex gap-4">
                    {credential.urlPhoto ? (
                        <img
                            src={credential.urlPhoto}
                            alt=""
                            className="size-20 shrink-0 rounded-xl border-2 border-white/15 object-cover"
                        />
                    ) : (
                        <span className="grid size-20 shrink-0 place-items-center rounded-xl border-2 border-white/15 bg-white/5 text-white/40">
                            <User className="size-9" />
                        </span>
                    )}

                    <div className="min-w-0">
                        <p className="kicker text-white/40">
                            Socio N° {credential.memberNumber ?? '—'}
                        </p>
                        <p className="mt-1 font-display text-xl font-extrabold text-white">
                            {credential.name} {credential.surname}
                        </p>
                        <p className="mt-1 text-sm text-white/60">
                            DNI {credential.dni ?? 'no cargado'}
                        </p>

                        <div className="mt-4 flex gap-6">
                            <div>
                                <p className="kicker text-white/40">Estado</p>
                                <p
                                    className={`mt-1 text-sm font-bold ${
                                        credential.isActive ? 'text-success' : 'text-destructive'
                                    }`}
                                >
                                    {credential.isActive ? 'Activo' : 'Cuota vencida'}
                                </p>
                            </div>
                            <div>
                                <p className="kicker text-white/40">Socio desde</p>
                                <p className="mt-1 text-sm font-bold text-white">
                                    {credential.memberSince
                                        ? formatCalendarDate(credential.memberSince)
                                        : '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 justify-self-center rounded-xl bg-white p-3">
                    {qrDataUrl ? (
                        <img src={qrDataUrl} alt="Código QR de la credencial" className="size-32" />
                    ) : (
                        <span className="size-32 animate-pulse rounded bg-muted" />
                    )}
                </div>
            </div>
        </div>
    )
}
