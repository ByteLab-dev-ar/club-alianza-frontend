import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { CategoryMark } from './CategoryMark'
import { buildGallerySearch, categorySlug } from '../lib/gallery-url'
import type { GalleryCategory } from '../interfaces/Gallery'

/*
 * Debajo de lg es una fila de chips que se desliza de costado; desde lg, una
 * lista vertical fija mientras se baja (top-24 = header de 4.5rem + 1.5rem de
 * aire). No es un <select>: con tres o cuatro categorías, verlas todas de un
 * vistazo es más rápido que abrir un desplegable.
 *
 * Es propia de la galería y no `CategoryFilter` (que sigue en Eventos): ese
 * pinta el hex de la categoría como texto y como fondo, y Partidos (#00CCFF)
 * da 1.79:1 sobre papel.
 */
const NAV_CLASS = '-mx-6 mb-6 lg:sticky lg:top-24 lg:m-0'

/*
 * Chips con 10px de relleno y no 14: con 14 la fila medía 376px y el cuarto
 * chip quedaba cortado en 390, y con tres categorías un chip cortado se lee
 * como error y no como "hay más a la derecha".
 *
 * Desde lg el margen negativo se come el relleno, para que el texto arranque
 * en la columna del kicker "Categorías".
 */
const ITEM_BASE =
    'flex min-h-11 flex-none items-center gap-1.5 rounded-sm px-2.5 text-sm font-semibold transition-colors lg:-mx-3 lg:min-h-10 lg:gap-2.5 lg:px-3'

/*
 * El activo es Celeste Chip + Celeste Profundo (DESIGN §Chips lo nombra para
 * menús laterales), igual para "Todas" y para cada categoría: el hex no marca
 * el activo, o Partidos pintaría de celeste media barra.
 *
 * Las dos variantes van por separado y no con `aria-[current=page]:bg-accent`
 * junto a `lg:bg-transparent`: en Tailwind v4 la variante responsive se emite
 * después y el activo perdía el fondo en desktop.
 */
const ITEM_IDLE = 'border bg-card text-foreground hover:bg-muted lg:border-0 lg:bg-transparent'
const ITEM_ACTIVE = 'border border-transparent bg-accent text-brand'

const Title = () => (
    // Mide 2rem, lo mismo que la fila de resultados: así la primera categoría
    // y la primera tarjeta arrancan a la misma altura.
    <p aria-hidden className="kicker mb-4 hidden h-8 items-center text-muted-foreground lg:flex">
        Categorías
    </p>
)

const List = ({ children }: { children: ReactNode }) => (
    <ul className="flex gap-1.5 overflow-x-auto px-6 py-1 [scrollbar-width:none] lg:flex-col lg:gap-0.5 lg:overflow-visible lg:p-0 [&::-webkit-scrollbar]:hidden">
        {children}
    </ul>
)

interface Props {
    categories: GalleryCategory[]
    /** El slug de la URL; `null` es "Todas". */
    activeSlug: string | null
}

export const CategoryNav = ({ categories, activeSlug }: Props) => {
    const item = (slug: string | null, label: string, mark: ReactNode) => {
        const isActive = slug === activeSlug
        return (
            <Link
                // `replace`: el atrás vuelve a la pantalla anterior, no recorre
                // las categorías que se fueron probando. Sin página: la 3 de
                // Partidos no es la 3 de Social.
                //
                // `preventScrollReset`: para el <ScrollRestoration /> de la raíz
                // del router esto es una navegación nueva, y sin esto elegir una
                // categoría desde la barra lateral (sticky, se usa con el
                // catálogo a la vista) tiraba la página arriba de la portada.
                replace
                preventScrollReset
                to={{ search: buildGallerySearch({ categorySlug: slug }) }}
                aria-current={isActive ? 'page' : undefined}
                className={cn(ITEM_BASE, isActive ? ITEM_ACTIVE : ITEM_IDLE)}
            >
                {mark}
                {label}
            </Link>
        )
    }

    return (
        <nav aria-label="Categorías" className={NAV_CLASS}>
            <Title />
            <List>
                <li className="lg:mb-1.5 lg:border-b lg:pb-1.5">
                    {/* La marca hueca solo existe en la lista vertical, para
                        que los nombres queden en columna. */}
                    {item(null, 'Todas', <span aria-hidden className="hidden size-2 flex-none lg:block" />)}
                </li>
                {categories.map((category) => (
                    <li key={category.id}>
                        {item(categorySlug(category, categories), category.name, <CategoryMark category={category} />)}
                    </li>
                ))}
            </List>
        </nav>
    )
}

export const CategoryNavSkeleton = ({ activeSlug }: Pick<Props, 'activeSlug'>) => (
    <div aria-hidden className={NAV_CLASS}>
        <Title />
        <List>
            <li className="lg:mb-1.5 lg:border-b lg:pb-1.5">
                <span className={cn(ITEM_BASE, activeSlug === null ? ITEM_ACTIVE : ITEM_IDLE)}>
                    <span className="hidden size-2 flex-none lg:block" />
                    Todas
                </span>
            </li>
            {Array.from({ length: 3 }).map((_, index) => (
                <li key={index} className="flex items-center lg:block">
                    <Skeleton className="h-11 w-24 lg:h-10 lg:w-full" />
                </li>
            ))}
        </List>
    </div>
)
