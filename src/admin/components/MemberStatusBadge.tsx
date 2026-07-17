import { Badge } from '@/components/ui/badge'

interface Props {
    isActive: boolean
}

export const MemberStatusBadge = ({ isActive }: Props) => {
    return (
        <Badge variant={isActive ? 'success' : 'destructive'}>
            {isActive ? 'Al día' : 'Vencida'}
        </Badge>
    )
}
