import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { User } from 'lucide-react'

// El master de 500px, no el recorte de 132: acá se dibuja grande y se nota.
import crestMaster from '@/assets/logo-no-bg-alianza.png'
import { cn } from '@/lib/utils'
import { formatCalendarDate, formatDni } from '@/lib/format'
import { credentialStatus, type CredentialTone } from '../lib/credential-status'
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
 * La pastilla de estado, en los tres tonos de `credentialStatus`.
 *
 * El ámbar lleva el texto en tinta y no en ámbar: a 70% de luminosidad —que es
 * el `--warning` del sistema— el texto sobre su propio fondo no llega al
 * contraste. El color queda en el punto y en el fondo, que es donde se lee de
 * lejos.
 *
 * El verde de `--success` va por el mismo camino, y es la regla de todo el
 * repo: da 4.01:1 sobre blanco, que alcanza para un ícono o un punto (piden
 * 3:1) pero no para un texto chico (pide 4.5:1), y acá la tarjeta se exporta
 * como PNG, así que siempre se mide contra el blanco de `force-light`. El texto
 * en tinta da 15.6:1 y el verde sigue estando, en el punto y en el fondo.
 */
const TONE_CLASS: Record<CredentialTone, { chip: string; dot: string }> = {
    ok: { chip: 'bg-success/12 text-foreground', dot: 'bg-success' },
    falta: { chip: 'bg-warning/22 text-foreground', dot: 'bg-warning' },
    bloquea: { chip: 'bg-destructive/12 text-destructive', dot: 'bg-destructive' },
}

export const CredentialCard = ({ credential, cardRef }: Props) => {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

    useEffect(() => {
        // Se genera en el cliente: el backend solo firma el token, nunca manda la imagen.
        void QRCode.toDataURL(buildValidationUrl(credential.qrPayload), {
            margin: 1,
            width: 240,
            /*
             * Corrección de errores en L (7%) y no en M (15%), que es el default.
             *
             * No es un capricho de tamaño: el `qrPayload` es un JWT entero y la
             * URL termina en ~253 caracteres, que en M dan un código de 65 × 65
             * módulos. En L baja a 57 × 57 — un 12% menos de lado y bastante
             * menos ruido visual, que es lo que hacía que el QR se viera como
             * una mancha.
             *
             * El precio es la tolerancia a daño, y acá se puede pagar: esto se
             * mira en la pantalla de un teléfono, no es una etiqueta pegada en
             * una caja que se raya. Si algún día la credencial se imprime en
             * plástico para llevar en la billetera, conviene volver a M — y ahí
             * el código tiene que ser más chico, no más tolerante.
             */
            errorCorrectionLevel: 'L',
            color: { dark: '#0b1220', light: '#ffffff' },
        }).then(setQrDataUrl)
    }, [credential.qrPayload])

    const status = credentialStatus(credential)
    const tone = TONE_CLASS[status.tone]
    const fullName = [credential.name, credential.surname].filter(Boolean).join(' ')

    return (
        /*
         * 512 × 310. Antes era un bloque oscuro de alto libre que se estiraba
         * con el contenido y dejaba de parecer una credencial.
         *
         * El ancho no es estético: **es lo que hace legible el QR**. El ancho que
         * le queda al código lo fija la pastilla de estado, y a 448px entraba en
         * 80px — con 65 × 65 módulos, 1,23px por módulo, insuficiente.
         *
         * A 512 entra cómodo. Con la corrección en L (ver arriba) el código bajó
         * a 57 × 57, así que 112px ya dan 1,96px por módulo: la misma legibilidad
         * que tendría a 128 en M, con un QR visiblemente más chico y menos
         * denso. Por debajo de ~112 no se puede bajar sin achicar el payload,
         * que es trabajo del backend.
         *
         * Y va en los colores del CLUB —celeste y blanco del escudo— y no en el
         * navy "premium" de la app, que es la paleta de los bloques de la
         * landing y no la del club.
         */
        <div
            ref={cardRef}
            // `force-light`: la tarjeta se exporta como PNG y ademas es un objeto
            // fisico en pantalla. Con el panel en modo oscuro, sus tokens quedan
            // clavados en claro o el texto saldria blanco sobre blanco en el PNG.
            className="force-light flex h-[310px] w-full max-w-lg overflow-hidden rounded-2xl border bg-card shadow-club"
            // Fondo explícito: html-to-image no hereda los fondos de las clases
            // utilitarias al serializar el nodo para el PNG.
            style={{ backgroundColor: '#ffffff' }}
        >
            {/* El bloque de color con la cara. La foto va acá y grande: es lo
                que mira quien controla antes de escanear. */}
            <div
                className="flex w-42 shrink-0 flex-col items-center justify-center gap-3 bg-secondary"
                // El mismo celeste que `bg-secondary`, escrito otra vez: es el
                // valor literal del token (celeste-escudo). Va explícito por lo
                // mismo que el fondo de la tarjeta — html-to-image serializa el
                // nodo y no siempre arrastra el fondo que pone la clase.
                style={{ backgroundColor: 'oklch(74% 0.23 215)' }}
            >
                {credential.urlPhoto ? (
                    <img
                        src={credential.urlPhoto}
                        alt=""
                        className="size-29 rounded-xl border-2 border-white/85 object-cover"
                    />
                ) : (
                    <span className="grid size-29 place-items-center rounded-xl border-2 border-white/85 bg-white/55 text-ink/45">
                        <User className="size-14" />
                    </span>
                )}

                <span className="kicker px-2 text-center text-ink/70">
                    {credential.isPlayer ? 'Jugador' : 'Socio'}
                    {credential.isPlayer && credential.playerCategoryLabel && (
                        <span className="mt-0.5 block text-ink/55">
                            {credential.playerCategoryLabel}
                        </span>
                    )}
                </span>
            </div>

            <div className="relative min-w-0 flex-1">
                {/*
                 * El escudo detrás, nítido.
                 *
                 * Se veía borroso por el archivo, no por la opacidad: el que usa
                 * el resto de la app (`logo-crest-132.png`) mide 132px, y acá
                 * estaba dibujado a 384 — casi 3× de ampliación, y 6× en una
                 * pantalla retina. Ninguna opacidad arregla eso.
                 *
                 * Por eso va el MASTER de 500px, dibujado a 208: es una
                 * reducción, así que sale limpio incluso en retina, y ahí sí la
                 * opacidad puede subir a 7% sin ensuciarse. Cuesta ~240 kB, pero
                 * los paga solo quien abre su credencial —la pantalla es un
                 * chunk aparte— y no la primera visita al sitio, que es lo que
                 * el recorte de 132px vino a proteger.
                 *
                 * Y va ENTERO adentro de la columna, centrado, en vez de salirse
                 * por la esquina. Recortado se veía justo lo que peor queda —los
                 * aros de texto, cortados por la mitad— y encima chocaba con el
                 * QR. Completo y nítido se lee como un sello, que es lo que es.
                 *
                 * Los dos números para moverlo son `top-1/2` y `left-1/2` con sus
                 * `-translate`: eso lo centra. Para correrlo, cambiar esos.
                 */}
                <img
                    src={crestMaster}
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-1/2 size-52 -translate-x-1/2 -translate-y-1/2 object-contain opacity-7"
                />

                {/* 20px parejos en los cuatro lados: el nombre del club, el del
                    socio y la pastilla arrancan en la misma vertical, y el QR
                    comparte borde inferior con "Socio desde". */}
                <div className="relative flex h-full flex-col p-5">
                    <div className="leading-none">
                        <p className="font-display text-lg font-extrabold tracking-tight text-ink">
                            Club Alianza
                        </p>
                        <p className="kicker mt-1 text-muted-foreground">Cutral Có</p>
                    </div>

                    <div className="mt-3.5 min-w-0">
                        <p className="kicker text-muted-foreground">
                            Socio N° {credential.memberNumber ?? '—'}
                        </p>
                        <p className="mt-1 truncate font-display text-2xl leading-tight font-extrabold tracking-tight text-ink">
                            {fullName || 'Socio del club'}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            DNI {credential.dni ? formatDni(credential.dni) : 'no cargado'}
                        </p>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-3.5">
                        <div className="min-w-0">
                            {/* UNA sola línea, con la regla en `credentialStatus`:
                                la membresía manda porque es la única que deja
                                afuera; lo que no bloquea va en ámbar. */}
                            {/* `whitespace-nowrap`: sin esto "Membresía vencida"
                                se partía en dos renglones adentro de la
                                pastilla, que es lo que la hacía ver rota. Ahora
                                la tarjeta tiene ancho de sobra para la frase más
                                larga —medida: 144px— pero la garantía va igual. */}
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold whitespace-nowrap',
                                    tone.chip,
                                )}
                            >
                                <span className={cn('size-2 shrink-0 rounded-full', tone.dot)} />
                                {status.label}
                            </span>

                            {credential.memberSince && (
                                <p className="mt-1.5 text-xs text-muted-foreground">
                                    Socio desde {formatCalendarDate(credential.memberSince)}
                                </p>
                            )}
                        </div>

                        {/*
                         * Placa blanca: el QR queda sobre el escudo, y sin ella
                         * pierde el contraste del que vive un código.
                         *
                         * ⚠️ 80px es el TECHO de este layout, no una elección: el
                         * elemento más ancho de la izquierda es la pastilla
                         * "Membresía vencida" (144px) y la columna tiene 238
                         * usables, así que con el gap quedan 80.
                         *
                         * Y 80px no alcanza. El `qrPayload` es un JWT completo y
                         * la URL termina en ~253 caracteres, que dan un QR de
                         * **65×65 módulos**: a 80px son 1,23px por módulo, cuando
                         * un código en pantalla quiere 2. Agrandarlo acá no se
                         * puede sin romper la tarjeta; lo que hay que achicar es
                         * el payload.
                         *
                         * El club ya tomó esa decisión dos veces —el recibo
                         * (§5.10) y la ficha (§1.4) llevan adentro del QR un
                         * CÓDIGO corto, no un enlace— y la credencial quedó como
                         * la excepción. Está pedido al backend.
                         */}
                        <div className="shrink-0 rounded-lg bg-white p-1.5">
                            {qrDataUrl ? (
                                <img
                                    src={qrDataUrl}
                                    alt="Código QR de la credencial"
                                    className="block size-28"
                                />
                            ) : (
                                <span className="block size-28 animate-pulse rounded bg-muted" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
