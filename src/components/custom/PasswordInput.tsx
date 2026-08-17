import { useState, type ComponentProps } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/**
 * Un campo de contraseña con el ojito para verla.
 *
 * Estaba escrito a mano dentro del login y en ningún otro lado, así que las dos
 * pantallas donde más falta hacía —registro y contraseña nueva— se cargaban a
 * ciegas: ahí la persona escribe una clave que **no puede comparar contra
 * nada**, la repite en un segundo campo igual de tapado, y si no coinciden se
 * entera recién al enviar. En el login al menos hay una contraseña que ya sabe.
 *
 * Es un `<input>` como cualquier otro —acepta `autoComplete`, `placeholder` y el
 * `field` de react-hook-form tal cual—; lo único que agrega es el botón y el
 * `pr-11` que le hace lugar.
 */
export const PasswordInput = ({ className, ...props }: ComponentProps<'input'>) => {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <div className="relative">
            <Input
                type={isVisible ? 'text' : 'password'}
                className={cn('pr-11', className)}
                {...props}
            />
            {/*
             * `type="button"` no es opcional: dentro de un <form>, un botón sin
             * tipo envía el formulario, así que mirar la contraseña dispararía el
             * submit.
             */}
            <button
                type="button"
                onClick={() => setIsVisible((visible) => !visible)}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground"
                aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
                {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
        </div>
    )
}
