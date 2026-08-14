import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
    CalendarClock,
    CheckCircle2,
    RefreshCw,
    ScanLine,
    ShieldAlert,
    ShieldX,
    User,
    WifiOff,
    XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { QK } from '@/api/queryKeys'
import { cn } from '@/lib/utils'
import { formatCalendarDate } from '@/lib/format'
import { validateCredentialAction } from '../actions/validate-credential.action'

const MS_PER_DAY = 1000 * 60 * 60 * 24
/** Con menos de esto, la puerta avisa "está por vencer" en vez de solo verde. */
const EXPIRY_WARNING_DAYS = 7

/** Cartel de estado, a pantalla ancha para que se lea de un vistazo. */
const StatusPanel = ({
    tone,
    icon,
    title,
    detail,
    action,
}: {
    tone: 'warning' | 'danger'
    icon: React.ReactNode
    title: string
    detail: string
    action?: React.ReactNode
}) => (
    <div
        className={
            tone === 'warning'
                ? 'rounded-2xl border border-warning/40 bg-warning/5 p-10 text-center shadow-soft'
                : 'rounded-2xl border border-destructive/40 bg-destructive/5 p-10 text-center shadow-soft'
        }
    >
        <div className={tone === 'warning' ? 'text-warning' : 'text-destructive'}>{icon}</div>
        <h1 className="mt-4 font-display text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{detail}</p>
        {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
)

export const ValidateCredentialPage = () => {
    const { token = '' } = useParams()

    // `Date.now()` en el cuerpo del render es impuro. Se toma al montar, que
    // para un umbral de días alcanza de sobra.
    const [openedAt] = useState(() => Date.now())

    const { data, isLoading, error, refetch, isRefetching } = useQuery({
        queryKey: [QK.credentialValidation, token],
        queryFn: () => validateCredentialAction(token),
        enabled: !!token,
        retry: false,
        // Cada escaneo tiene que consultar el estado real: si el socio pagó hace
        // cinco minutos, la puerta lo tiene que ver.
        staleTime: 0,
    })

    /**
     * Se ramifica por código de estado, nunca por el texto del mensaje. La
     * diferencia entre 400 y 410 le importa a quien está en la puerta: 410 es un
     * socio legítimo con una tarjeta vieja o anulada; 400 es sospecha de fraude.
     *
     * El 401 y el 403 normalmente los ataja el guard de la ruta antes de llegar
     * acá; se contemplan igual por si el backend y el frontend no coinciden
     * sobre quién puede validar.
     */
    const status = error instanceof AxiosError ? error.response?.status : undefined

    /**
     * Sin respuesta (se cayeron los datos móviles, el caso frecuente en la
     * puerta) o con un 5xx, el problema es NUESTRO, no de la tarjeta: acá no
     * se puede decir "credencial inválida", que suena a fraude. También caen
     * acá los errores que no vienen de axios (p. ej. una respuesta sin el
     * sobre esperado).
     */
    const isUnreachable = !!error && (status === undefined || status >= 500)

    const daysToExpiry =
        data?.expirationDate !== null && data?.expirationDate !== undefined
            ? (new Date(data.expirationDate).getTime() - openedAt) / MS_PER_DAY
            : null
    const isExpiringSoon =
        data?.isActive === true && daysToExpiry !== null && daysToExpiry <= EXPIRY_WARNING_DAYS

    return (
        <div className="mx-auto max-w-lg px-5 py-8">
            {isLoading && <Skeleton className="h-96 rounded-2xl" />}

            {status === 429 && (
                <StatusPanel
                    tone="warning"
                    icon={<ShieldAlert className="mx-auto size-14" />}
                    title="Demasiados escaneos"
                    detail="Esperá unos segundos y volvé a intentar."
                />
            )}

            {status === 410 && (
                <StatusPanel
                    tone="warning"
                    icon={<CalendarClock className="mx-auto size-14" />}
                    title="Credencial anulada"
                    detail="Esta tarjeta ya no sirve. El socio tiene que solicitar una nueva; puede generarla desde la app."
                />
            )}

            {status === 403 && (
                <StatusPanel
                    tone="danger"
                    icon={<ShieldX className="mx-auto size-14" />}
                    title="No tenés permisos"
                    detail="Solo el personal de puerta y los administradores pueden validar credenciales."
                />
            )}

            {isUnreachable && (
                <StatusPanel
                    tone="warning"
                    icon={<WifiOff className="mx-auto size-14" />}
                    title="Sin conexión con el sistema"
                    detail="No pudimos consultar la credencial. No dice nada sobre la tarjeta: revisá la señal y reintentá."
                    action={
                        <Button variant="dark" onClick={() => void refetch()} disabled={isRefetching}>
                            <RefreshCw className={isRefetching ? 'animate-spin' : undefined} />
                            Reintentar
                        </Button>
                    }
                />
            )}

            {!!error && status !== 429 && status !== 410 && status !== 403 && !isUnreachable && (
                <StatusPanel
                    tone="danger"
                    icon={<XCircle className="mx-auto size-14" />}
                    title="Credencial inválida"
                    detail="Este código no corresponde a una credencial del club. Verificá la identidad por otro medio."
                />
            )}

            {data && (
                <div className="overflow-hidden rounded-2xl border bg-card shadow-club">
                    <div
                        className={`flex items-center justify-center gap-2 py-5 text-white ${
                            data.isActive ? 'bg-success' : 'bg-destructive'
                        }`}
                    >
                        {data.isActive ? (
                            <CheckCircle2 className="size-6" />
                        ) : (
                            <XCircle className="size-6" />
                        )}
                        {/* La banda responde UNA sola pregunta: ¿pasa o no pasa?
                            Decía "SOCIO AL DÍA", que con tres coberturas se lee
                            como "está todo bien" — y puede tener la actividad
                            vencida. Acá se nombra la decisión, y las otras dos
                            coberturas se informan abajo sin teñir esta. */}
                        <span className="font-display text-lg font-extrabold tracking-wide">
                            {data.isActive ? 'PUEDE ENTRAR' : 'NO PUEDE ENTRAR'}
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-4 px-6 py-8">
                        {data.urlPhoto ? (
                            <img
                                src={data.urlPhoto}
                                alt={`Foto de ${data.name ?? 'socio'}`}
                                className="size-40 rounded-full border-4 border-accent object-cover"
                            />
                        ) : (
                            // La foto es opcional: muchos socios no la cargan. Lo que
                            // valida la puerta es el QR y el estado de cuota, así que
                            // su ausencia es un caso normal y no se señala.
                            <span className="grid size-40 place-items-center rounded-full bg-accent text-brand">
                                <User className="size-16" />
                            </span>
                        )}

                        <div className="text-center">
                            <p className="font-display text-3xl font-extrabold text-ink">
                                {data.name} {data.surname}
                            </p>
                            {data.memberNumber && (
                                <p className="kicker mt-2 text-muted-foreground">
                                    Socio N° {data.memberNumber}
                                </p>
                            )}
                        </div>

                        {/*
                         * La SEGUNDA decisión de la puerta: si además entrena.
                         * Es un dato aparte del de arriba y no una gradación del
                         * mismo — el caso típico es un jugador con la membresía
                         * paga y la actividad vencida, que entra a ver el partido
                         * y no puede entrenar. Por eso "No entrena" va en gris y
                         * nunca en rojo: el rojo ya dijo lo suyo en la banda, y
                         * repetirlo acá haría dudar de si lo dejan pasar.
                         */}
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-wide text-accent-foreground uppercase">
                                {data.isPlayer
                                    ? `Jugador${data.playerCategoryLabel ? ` · ${data.playerCategoryLabel}` : ''}`
                                    : 'Socio'}
                            </span>

                            {data.isPlayer && (
                                <>
                                    <span
                                        className={cn(
                                            'rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase',
                                            data.isActivityUpToDate
                                                ? 'bg-success/15 text-success'
                                                : 'border border-muted-foreground/30 text-muted-foreground',
                                        )}
                                    >
                                        {data.isActivityUpToDate ? 'Entrena' : 'No entrena'}
                                    </span>
                                    <span
                                        className={cn(
                                            'rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase',
                                            data.isInsuranceUpToDate
                                                ? 'bg-success/15 text-success'
                                                : 'border border-muted-foreground/30 text-muted-foreground',
                                        )}
                                    >
                                        {data.isInsuranceUpToDate ? 'Con seguro' : 'Sin seguro'}
                                    </span>
                                </>
                            )}
                        </div>

                        {data.expirationDate && (
                            <p
                                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                                    isExpiringSoon
                                        ? 'bg-warning/15 text-warning'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                {data.isActive ? 'Membresía paga hasta' : 'Venció el'}{' '}
                                {formatCalendarDate(data.expirationDate)}
                                {isExpiringSoon && daysToExpiry !== null && (
                                    <> · vence en {Math.max(0, Math.ceil(daysToExpiry))} día(s)</>
                                )}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {!isLoading && (
                <Button asChild variant="dark" className="mt-6 w-full">
                    <Link to="/puerta">
                        <ScanLine /> Escanear otra credencial
                    </Link>
                </Button>
            )}
        </div>
    )
}
