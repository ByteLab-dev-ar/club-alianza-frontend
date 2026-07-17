import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export const NotFoundPage = () => {
    return (
        <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
            <div className="flex flex-col items-center gap-4">
                <p className="text-display text-7xl text-secondary">404</p>
                <h1 className="font-display text-2xl font-extrabold">Página no encontrada</h1>
                <p className="max-w-sm text-muted-foreground">
                    La página que buscás no existe o fue movida.
                </p>
                <Button asChild variant="dark" className="mt-2">
                    <Link to="/">Ir al inicio</Link>
                </Button>
            </div>
        </div>
    )
}
