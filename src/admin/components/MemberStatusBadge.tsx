import { Badge } from '@/components/ui/badge'
import { membershipBadgeLabel, membershipStatusLabel } from '@/shared/lib/membership-label'

interface Props {
    isActive: boolean
    /**
     * La píldora va sola, sin un rótulo al lado que diga de qué cobertura se
     * habla: entonces lo dice ella ("Membresía vigente"). Es el caso de la
     * ficha, donde va pegada al nombre.
     *
     * Sin esto se escribe la palabra sola, que es lo que pide la celda del
     * padrón: ahí la columna "Membresía" está pegada a la izquierda y la celda
     * apila abajo "Jugador — Categoría" y "Moroso".
     */
    standalone?: boolean
}

/**
 * El estado de la MEMBRESÍA del socio: la única cobertura que decide si entra al
 * club, y por eso la única que se pinta en rojo.
 *
 * El texto ("Membresía vigente" / "Membresía vencida", que antes era "Al día" a
 * secas) y el porqué de esas palabras viven en `shared/lib/membership-label`,
 * porque "Mis chicos" del portal del socio muestra la misma píldora y no puede
 * importar de `admin`.
 */
export const MemberStatusBadge = ({ isActive, standalone = false }: Props) => {
    return (
        <Badge variant={isActive ? 'success' : 'destructive'}>
            {standalone ? membershipStatusLabel(isActive) : membershipBadgeLabel(isActive)}
        </Badge>
    )
}
