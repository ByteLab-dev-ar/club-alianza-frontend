import { Loader2 } from 'lucide-react'

/** Fallback a pantalla completa mientras se resuelve la sesión o carga una ruta lazy. */
export const PageLoader = () => {
    return (
        <div className="grid min-h-screen place-items-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="size-8 animate-spin text-brand" />
                <p className="kicker text-muted-foreground">Cargando</p>
            </div>
        </div>
    )
}
