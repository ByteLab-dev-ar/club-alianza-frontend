import { Link } from 'react-router'
import { Construction } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Props {
    title: string
}

/**
 * Andamio temporal: deja la ruta registrada y navegable mientras se construye
 * la página real. Se va borrando a medida que cada sección se implementa.
 */
export const ComingSoonPage = ({ title }: Props) => {
    return (
        <div className="mx-auto grid max-w-7xl place-items-center px-6 py-32 text-center">
            <span className="grid size-14 place-items-center rounded-xl bg-accent text-secondary">
                <Construction className="size-7" />
            </span>
            <h1 className="text-display mt-6 text-3xl text-ink">{title}</h1>
            <p className="mt-3 max-w-sm text-muted-foreground">
                Esta sección está en construcción. Va a estar disponible en la próxima entrega.
            </p>
            <Button asChild variant="outline" className="mt-8">
                <Link to="/">Volver al inicio</Link>
            </Button>
        </div>
    )
}
