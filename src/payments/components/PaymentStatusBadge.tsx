import { Badge } from '@/components/ui/badge'
import { PAYMENT_STATUS_LABELS, type PaymentStatus } from '../interfaces/Payment'

const VARIANT_BY_STATUS: Record<PaymentStatus, 'success' | 'warning' | 'destructive'> = {
    APPROVED: 'success',
    PENDING: 'warning',
    REJECTED: 'destructive',
}

interface Props {
    status: PaymentStatus
}

export const PaymentStatusBadge = ({ status }: Props) => {
    return <Badge variant={VARIANT_BY_STATUS[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>
}
