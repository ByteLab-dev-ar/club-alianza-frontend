import { Link } from 'react-router'
import { ArrowRight, Images } from 'lucide-react'

import { buildGallerySearch, categorySlug } from '../lib/gallery-url'
import { formatMomentDate } from '../lib/moment-labels'
import type { GalleryAlbumListItem, GalleryCategory } from '../interfaces/Gallery'

interface Props {
    category: GalleryCategory
    /** Todas las categorías, para que el link a la categoría no choque con otra (ver categorySlug). */
    categories: GalleryCategory[]
    albums: GalleryAlbumListItem[]
    /** El `search` del listado del que se vino: saltar de un momento a otro no pierde la vuelta. */
    from: string
}

/**
 * "Más momentos de <categoría>", al pie de la ficha. Son los más recientes de
 * la categoría y no los vecinos por fecha del momento: la API no los da (ver
 * `pickRelated`). Si no hay otros, la sección no se dibuja.
 */
export const RelatedAlbums = ({ category, categories, albums, from }: Props) => {
    if (albums.length === 0) return null

    return (
        <section aria-labelledby="relacionados-titulo" className="mt-10 border-t pt-7">
            <h2 id="relacionados-titulo" className="kicker text-muted-foreground">
                Más momentos de {category.name}
            </h2>
            <ul className="mt-4 grid gap-1">
                {albums.map((album) => (
                    <li key={album.id}>
                        <Link
                            to={`/galeria/${album.id}`}
                            state={{ from }}
                            className="group -mx-2 flex items-center gap-4 rounded-md p-2 transition-colors hover:bg-muted"
                        >
                            <span className="grid aspect-4/3 w-22 flex-none place-items-center overflow-hidden rounded-sm border bg-muted text-muted-foreground">
                                {album.coverUrl ? (
                                    <img
                                        src={album.coverUrl}
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <Images aria-hidden className="size-5" />
                                )}
                            </span>
                            <span className="grid min-w-0 gap-0.5">
                                <span className="text-sm leading-snug font-semibold text-foreground transition-colors group-hover:text-brand">
                                    {album.title}
                                </span>
                                {album.date && (
                                    <span className="text-sm leading-relaxed text-muted-foreground">
                                        {formatMomentDate(album.date)}
                                    </span>
                                )}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
            <Link
                to={`/galeria${buildGallerySearch({ categorySlug: categorySlug(category, categories) })}`}
                className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand hover:underline hover:underline-offset-3"
            >
                Ver todos los de {category.name}
                <ArrowRight aria-hidden className="size-4" />
            </Link>
        </section>
    )
}
