import { Badge } from '@/components/ui/badge'
import { PAYMENT_STATUS_LABELS, type PaymentStatus } from '../interfaces/Payment'

const VARIANT_BY_STATUS: Record<PaymentStatus, 'success' | 'warning' | 'destructive'> = {
    APPROVED: 'success',
    PENDING: 'warning',
    REJECTED: 'destructive',
    /*
     * Rojo igual que el rechazo, aunque no sean lo mismo: los dos terminan en
     * "esto no te acredita nada", y en una tabla el color es lo que se lee
     * primero. La diferencia —uno nunca se acreditó, el otro se dio de baja— la
     * hace la palabra, que es donde tiene que estar.
     */
    REVERTED: 'destructive',
}

interface Props {
    status: PaymentStatus
}

export const PaymentStatusBadge = ({ status }: Props) => {
    return <Badge variant={VARIANT_BY_STATUS[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>
}
