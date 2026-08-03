import { Loader2 } from 'lucide-react'

const Spinner = () => (
    <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-8 animate-spin text-brand" />
        <p className="kicker text-muted-foreground">Cargando</p>
    </div>
)

/** Pantalla completa: arranque de la app y rutas que no cuelgan de un layout. */
export const PageLoader = () => {
    return (
        <div className="grid min-h-screen place-items-center bg-background">
            <Spinner />
        </div>
    )
}

/**
 * Para el área de contenido de un layout que YA está en pantalla (el fallback
 * de las rutas lazy). Va con alto acotado a propósito: con `min-h-screen` se
 * sumaba una pantalla entera adentro del contenedor y el documento crecía
 * 100vh en cada navegación.
 */
export const SectionLoader = () => {
    return (
        <div className="grid min-h-64 place-items-center py-16">
            <Spinner />
        </div>
    )
}
