import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { User } from 'lucide-react'

import { ClubLogo } from '@/components/custom/ClubLogo'
import { cn } from '@/lib/utils'
import { formatCalendarDate } from '@/lib/format'
import type { Credential } from '../interfaces/Credential'

interface Props {
    credential: Credential
    /** Ref para exportar la tarjeta como PNG. */
    cardRef?: React.Ref<HTMLDivElement>
}

/**
 * URL que se escanea desde el QR. La arma el frontend, no el backend.
 * Ya no se exporta: la usaba el botón "Copiar link" de la pantalla del socio,
 * que se sacó cuando la validación pasó a ser solo para staff.
 */
const buildValidationUrl = (qrPayload: string) =>
    `${window.location.origin}/validar/${qrPayload}`

/**
 * Una línea de cobertura de la tarjeta.
 *
 * El punto de color es lo que se lee de lejos y el texto lo confirma. `blocking`
 * distingue a la membresía: es la única que se pinta en rojo, porque es la única
 * que deja a alguien afuera. Las otras dos, vencidas, van en gris — informan,
 * no rechazan.
 */
const CoverageLine = ({
    label,
    ok,
    okText,
    failText,
    blocking = false,
}: {
    label: string
    ok: boolean
    okText: string
    failText: string
    blocking?: boolean
}) => (
    <div className="flex items-center gap-2">
        <span
            aria-hidden
            className={cn(
                'size-2 shrink-0 rounded-full',
                ok ? 'bg-success' : blocking ? 'bg-destructive' : 'bg-white/30',
            )}
        />
        <span
            className={cn(
                'text-sm font-bold',
                ok ? 'text-white' : blocking ? 'text-destructive' : 'text-white/50',
            )}
        >
            {label}
        </span>
        <span className="truncate text-xs text-white/40">{ok ? okText : failText}</span>
    </div>
)

export const CredentialCard = ({ credential, cardRef }: Props) => {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

    useEffect(() => {
        // Se genera en el cliente: el backend solo firma el token, nunca manda la imagen.
        void QRCode.toDataURL(buildValidationUrl(credential.qrPayload), {
            margin: 1,
            width: 240,
            color: { dark: '#0b1220', light: '#ffffff' },
        }).then(setQrDataUrl)
    }, [credential.qrPayload])

    return (
        <div
            ref={cardRef}
            // Ancho de tarjeta real: sin el tope se estiraba a todo el ancho de la
            // página y dejaba de parecer una credencial.
            className="bg-gradient-night w-full max-w-md overflow-hidden rounded-2xl shadow-club"
            // Fondo explícito: html-to-image no hereda el degradé de las clases
            // utilitarias al serializar el nodo para el PNG.
            style={{ backgroundColor: '#0b1220' }}
        >
            {/* Arriba, quién es: "Jugador · 7ma" o "Socio". Reemplaza al rótulo
                "Credencial", que no le decía nada a nadie —ya se ve que es una
                credencial—, y es el dato con el que arranca quien escanea. */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                <ClubLogo inverted />
                <span className="kicker text-secondary">
                    {credential.isPlayer
                        ? `Jugador${credential.playerCategoryLabel ? ` · ${credential.playerCategoryLabel}` : ''}`
                        : 'Socio'}
                </span>
            </div>

            <div className="flex items-start gap-4 px-5 py-5">
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

                <div className="min-w-0 flex-1">
                    <p className="kicker text-white/40">
                        Socio N° {credential.memberNumber ?? '—'}
                    </p>
                    <p className="mt-1 truncate font-display text-lg font-extrabold text-white">
                        {credential.name} {credential.surname}
                    </p>
                    <p className="mt-0.5 text-sm text-white/60">
                        DNI {credential.dni ?? 'no cargado'}
                    </p>
                </div>
            </div>

            {/*
             * En la puerta se deciden DOS cosas, y hasta acá la tarjeta contestaba
             * una sola. Por eso las coberturas se escriben por lo que HABILITAN
             * ("Entra", "Entrena") y no por su estado administrativo: quien
             * escanea no tiene que traducir "actividad vencida" a "este chico ve
             * el partido pero no entrena".
             *
             * Y solo la membresía se pone en rojo. Tres rojos iguales harían que
             * un jugador al día con el club parezca rechazado en la puerta, que
             * es justo el error que la tarjeta tiene que evitar.
             */}
            <div className="flex items-end justify-between gap-4 border-t border-white/10 px-5 py-4">
                <div className="flex flex-col gap-1.5">
                    <CoverageLine
                        label="Entra"
                        ok={credential.isActive}
                        okText="Membresía al día"
                        failText="Membresía vencida"
                        blocking
                    />

                    {/* Solo al jugador: al socio que no juega, "No entrena" le
                        marcaría como faltante algo que no le corresponde. */}
                    {credential.isPlayer && (
                        <>
                            <CoverageLine
                                label="Entrena"
                                ok={credential.isActivityUpToDate}
                                okText="Actividad al día"
                                failText="Actividad vencida"
                            />
                            <CoverageLine
                                label="Seguro"
                                ok={credential.isInsuranceUpToDate}
                                okText="Con cobertura"
                                failText="Sin cobertura"
                            />
                        </>
                    )}

                    {!credential.isPlayer && credential.memberSince && (
                        <p className="mt-0.5 text-xs text-white/40">
                            Socio desde {formatCalendarDate(credential.memberSince)}
                        </p>
                    )}
                </div>

                <div className="shrink-0 rounded-lg bg-white p-1.5">
                    {qrDataUrl ? (
                        <img
                            src={qrDataUrl}
                            alt="Código QR de la credencial"
                            className="size-20"
                        />
                    ) : (
                        <span className="block size-20 animate-pulse rounded bg-muted" />
                    )}
                </div>
            </div>
        </div>
    )
}
