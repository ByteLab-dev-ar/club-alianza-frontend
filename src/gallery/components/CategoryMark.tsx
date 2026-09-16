import { cn } from '@/lib/utils'
import { safeCategoryColor } from '../lib/moment-labels'
import type { GalleryCategory } from '../interfaces/Gallery'

/**
 * El color de la categoría es solo este cuadradito de 8px pegado al nombre.
 *
 * Lo elige el admin y puede ser cualquier hex: Partidos es #00CCFF, que sobre
 * papel da 1.79:1. Por eso el hex nunca es texto ni fondo de texto (y con él
 * de fondo, Partidos pintaba media pantalla de celeste). Radio de 2px y no
 * círculo porque lo circular es de los avatares; el filete interior al 15%
 * hace que un color casi blanco no desaparezca.
 */
export const CategoryMark = ({
    category,
    className,
}: {
    category: Pick<GalleryCategory, 'color'>
    className?: string
}) => (
    <span
        aria-hidden
        className={cn('size-2 flex-none rounded-xs ring-1 ring-ink/15 ring-inset', className)}
        style={{ backgroundColor: safeCategoryColor(category.color) }}
    />
)

/**
 * El chip de categoría de la tarjeta y de la ficha: neutro, con el nombre en
 * Tinta sobre Gris Fondo y la marca de color al lado.
 *
 * `flex w-fit` y no `inline-flex`: en la ficha el padre es un bloque, y un
 * inline-flex se asentaba sobre la línea base de un renglón de 24px, 3px más
 * abajo que en la maqueta. En la tarjeta (padre flex-col) es igual.
 */
export const CategoryChip = ({ category }: { category: GalleryCategory }) => (
    <span className="kicker flex w-fit items-center gap-2 rounded-sm bg-muted px-2 py-1.25 leading-none text-foreground">
        <CategoryMark category={category} />
        {/* El tracking de 0.2em deja un espacio de más después de la última
            letra; sin este margen el chip se ve corrido a la izquierda. */}
        <span className="-mr-[0.2em]">{category.name}</span>
    </span>
)
