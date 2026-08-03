// Versión de 132px derivada del master de 500px (logo-no-bg-alianza.png, que se
// conserva como fuente para regenerar tamaños). Se muestra a 44px, y 132 = 44 × 3
// cubre hasta los celulares de DPR 3: 21 kB en vez de 247 kB en la primera visita.
import crest from '@/assets/logo-crest-132.png'
import { cn } from '@/lib/utils'

interface Props {
    className?: string
    /** En superficies oscuras (footer, sidebar admin, login, credencial). */
    inverted?: boolean
    /** Oculta el texto y deja solo el escudo (útil donde el espacio es justo). */
    crestOnly?: boolean
}

/** Escudo + wordmark. Es el bloque de marca que abre el header, el footer y los paneles. */
export const ClubLogo = ({ className, inverted = false, crestOnly = false }: Props) => {
    return (
        <span className={cn('flex items-center gap-3', className)}>
            <span
                className={cn(
                    'grid size-11 shrink-0 place-items-center',
                    // El escudo tiene el nombre del club en negro sobre transparente:
                    // sobre fondo oscuro esa parte desaparece. Una placa clara detrás lo
                    // mantiene legible sin necesitar una segunda versión del archivo.
                    // Va redondeada-cuadrada (no circular) porque el escudo es cuadrado:
                    // en un círculo las esquinas con el texto en arco quedarían afuera.
                    inverted && 'rounded-lg bg-white/95 p-1 shadow-soft',
                )}
            >
                <img
                    src={crest}
                    alt=""
                    aria-hidden
                    className="size-full object-contain"
                    // Reserva el espacio antes de que cargue la imagen: evita CLS.
                    width={44}
                    height={44}
                />
            </span>

            {!crestOnly && (
                <span className="flex flex-col leading-none">
                    <span
                        className={cn(
                            'font-display text-lg font-extrabold tracking-tight',
                            inverted ? 'text-white' : 'text-ink',
                        )}
                    >
                        Club Alianza
                    </span>
                    <span
                        className={cn(
                            'mt-1 text-[10px] font-semibold tracking-[0.2em]',
                            inverted ? 'text-white/60' : 'text-muted-foreground',
                        )}
                    >
                        CUTRAL CÓ
                    </span>
                </span>
            )}
        </span>
    )
}
