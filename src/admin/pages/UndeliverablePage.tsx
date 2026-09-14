import { MailWarning, MailX, UserRoundX } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCalendarDate } from '@/lib/format'
import { useUndeliverable } from '../hooks/useUndeliverable'
import { DeliveryFailures, SuppressionReasons } from '@/notifications/interfaces/Notification'
import type { UndeliverableNotice } from '@/notifications/interfaces/Notification'
import { AdminPageHeader } from '../components/AdminPageHeader'

/**
 * Con quién no se puede comunicar el club (§7.4).
 *
 * La pantalla está partida en dos listas y **no es una decisión de maquetado**:
 * los dos motivos por los que un aviso no llega no se arreglan igual.
 *
 * - Un correo que se intentó y falló (`FAILED`) o una casilla que rebotó puede
 *   tener sentido reintentarlo, o corregir la dirección.
 * - **No haber tenido a quién escribirle (`NO_RECIPIENT`) no se arregla
 *   reintentando.** Es un socio sin cuenta, o un menor sin ningún tutor con
 *   correo usable: se arregla cargando un correo o un tutor. Con el padrón
 *   importado va a ser el caso más común, y es la lista con la que el club sale
 *   a buscar teléfonos.
 *
 * Mezclarlas en una sola tabla con una columna "estado" deja al club mirando
 * una lista de fracasos sin saber cuál de los dos trabajos tiene por delante.
 */

const StatusPill = ({ status }: { status: UndeliverableNotice['status'] }) =>
    status === DeliveryFailures.NO_RECIPIENT ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning">
            <UserRoundX className="size-3.5" />
            Sin destinatario
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
            <MailX className="size-3.5" />
            No salió
        </span>
    )

const EmptyCard = ({ children }: { children: React.ReactNode }) => (
    <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
        {children}
    </p>
)

const Person = ({ notice }: { notice: UndeliverableNotice }) => {
    if (!notice.memberName) return <span className="text-muted-foreground">—</span>

    return (
        <>
            <p className="font-semibold text-ink">{notice.memberName}</p>
            {notice.memberNumber !== null && (
                <p className="text-xs text-muted-foreground">N° {notice.memberNumber}</p>
            )}
        </>
    )
}

export const UndeliverablePage = () => {
    const { data, isLoading, isError } = useUndeliverable()

    const suppressed = data?.suppressed ?? []
    const notices = data?.notices ?? []

    // Las dos listas salen del mismo endpoint pero se muestran aparte: son dos
    // trabajos distintos, no un filtro de una misma tabla.
    const sinDestinatario = notices.filter(
        (notice) => notice.status === DeliveryFailures.NO_RECIPIENT,
    )
    const fallaron = notices.filter((notice) => notice.status === DeliveryFailures.FAILED)

    if (isLoading) {
        return (
            <>
                <AdminPageHeader kicker="Sistema" title="Sin contacto" />
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-14 rounded-lg" />
                    ))}
                </div>
            </>
        )
    }

    if (isError) {
        return (
            <>
                <AdminPageHeader kicker="Sistema" title="Sin contacto" />
                <EmptyCard>
                    No pudimos cargar la lista. Probá recargar en unos minutos.
                </EmptyCard>
            </>
        )
    }

    return (
        <>
            <AdminPageHeader kicker="Sistema" title="Sin contacto" />

            <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Las personas a las que el club intentó avisarle algo y no pudo. No están los
                avisos que sí salieron: una lista de miles de entregas correctas esconde las
                pocas que importan.
            </p>

            {/* Primero la lista accionable a mano, que además va a ser la larga. */}
            <section className="mb-10">
                <div className="mb-3 flex items-baseline gap-3">
                    <h2 className="font-display text-lg font-bold text-ink">
                        No había a quién escribirle
                    </h2>
                    <span className="text-sm text-muted-foreground">
                        {sinDestinatario.length}
                    </span>
                </div>
                <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    El hecho quedó registrado y no había ninguna dirección de correo. Un socio
                    sin cuenta, o un menor sin ningún tutor con correo usable.{' '}
                    <strong className="text-foreground">Reintentar no arregla nada</strong>: hay
                    que cargarle un correo o un tutor. Es la lista para salir a buscar
                    teléfonos.
                </p>

                {sinDestinatario.length === 0 ? (
                    <EmptyCard>
                        A todos los avisos les correspondió alguien a quien escribirle.
                    </EmptyCard>
                ) : (
                    <div className="overflow-hidden rounded-xl border bg-card shadow-soft">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Socio</TableHead>
                                    <TableHead>Aviso</TableHead>
                                    <TableHead>Cuándo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sinDestinatario.map((notice) => (
                                    <TableRow key={notice.id}>
                                        <TableCell>
                                            <Person notice={notice} />
                                        </TableCell>
                                        {/* El tipo crudo: es un dato para el club,
                                            no un texto para el socio, y el
                                            catálogo crece sin avisar. */}
                                        <TableCell className="text-xs text-muted-foreground">
                                            {notice.type ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatCalendarDate(notice.at)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </section>

            <section className="mb-10">
                <div className="mb-3 flex items-baseline gap-3">
                    <h2 className="font-display text-lg font-bold text-ink">
                        El correo no salió
                    </h2>
                    <span className="text-sm text-muted-foreground">{fallaron.length}</span>
                </div>
                <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Había una dirección y el envío falló igual. Acá sí puede tener sentido
                    revisar la dirección o volver a intentar.
                </p>

                {fallaron.length === 0 ? (
                    <EmptyCard>Todos los correos con destinatario salieron.</EmptyCard>
                ) : (
                    <div className="overflow-hidden rounded-xl border bg-card shadow-soft">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Socio</TableHead>
                                    <TableHead>Correo</TableHead>
                                    <TableHead>Motivo</TableHead>
                                    <TableHead>Intentos</TableHead>
                                    <TableHead>Cuándo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fallaron.map((notice) => (
                                    <TableRow key={notice.id}>
                                        <TableCell>
                                            <Person notice={notice} />
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {notice.email ?? '—'}
                                        </TableCell>
                                        <TableCell className="max-w-72 whitespace-normal text-xs text-muted-foreground">
                                            {notice.reason ?? <StatusPill status={notice.status} />}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {notice.attempts}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatCalendarDate(notice.at)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </section>

            <section>
                <div className="mb-3 flex items-baseline gap-3">
                    <h2 className="font-display text-lg font-bold text-ink">
                        Casillas dadas de baja
                    </h2>
                    <span className="text-sm text-muted-foreground">{suppressed.length}</span>
                </div>
                <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Direcciones a las que el sistema dejó de escribirle: o no existen, o desde
                    ahí marcaron los correos del club como spam. Mientras estén acá, no les
                    sale nada.
                </p>

                {suppressed.length === 0 ? (
                    <EmptyCard>Ninguna casilla rebotó ni se quejó.</EmptyCard>
                ) : (
                    <div className="overflow-hidden rounded-xl border bg-card shadow-soft">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Correo</TableHead>
                                    <TableHead>Motivo</TableHead>
                                    <TableHead>Detalle</TableHead>
                                    <TableHead>Desde</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {suppressed.map((box) => (
                                    <TableRow key={box.email}>
                                        <TableCell className="font-semibold text-ink">
                                            {box.email}
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
                                                <MailWarning className="size-3.5" />
                                                {box.reason === SuppressionReasons.BOUNCED
                                                    ? 'La dirección no existe'
                                                    : 'La marcaron como spam'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-72 whitespace-normal text-xs text-muted-foreground">
                                            {box.detail ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatCalendarDate(box.since)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </section>
        </>
    )
}
