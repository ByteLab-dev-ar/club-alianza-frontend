import { Link } from 'react-router'
import { Images } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { CategoryChip } from './CategoryMark'
import { formatMomentDate, photoCountLabel } from '../lib/moment-labels'
import type { GalleryAlbumListItem } from '../interfaces/Gallery'

interface Props {
    album: GalleryAlbumListItem
    /** El `search` del listado, para que "← Galería" vuelva al mismo filtro y página. */
    from: string
    /** Las de la primera fila se piden ya; el resto, al acercarse. */
    eager: boolean
}

/**
 * Un momento en la grilla, con el texto DEBAJO de la foto.
 *
 * La tarjeta anterior tapaba la portada con un velo y escribía a 11px en
 * blanco al 60%, y eso hacía que diez tarjetas se vieran iguales. Sobre blanco,
 * fecha y título se leen igual con cualquier foto, y la foto queda entera.
 *
 * El `alt` va vacío porque el título ya nombra el link: leer "Victoria en el
 * clásico, imagen, Victoria en el clásico" es ruido.
 */
export const AlbumCard = ({ album, from, eager }: Props) => {
    const date = formatMomentDate(album.date)

    return (
        <li>
            <Link
                to={`/galeria/${album.id}`}
                state={{ from }}
                className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-soft transition-colors hover:border-input"
            >
                <span className="block aspect-4/3 overflow-hidden border-b bg-muted">
                    {album.coverUrl ? (
                        <img
                            // En desarrollo el seed sirve `data:image/svg+xml` en vez
                            // de una URL: un <img src> común traga las dos, cualquier
                            // cosa que arme la URL a mano (new URL, un prefijo de la
                            // API, un background-image sin comillas) no.
                            src={album.coverUrl}
                            alt=""
                            loading={eager ? undefined : 'lazy'}
                            decoding="async"
                            className="size-full object-cover"
                        />
                    ) : (
                        /* Un momento puede existir sin fotos: el panel los crea
                           vacíos y las fotos se suben después. */
                        <span className="grid h-full place-content-center justify-items-center gap-2 text-sm text-muted-foreground">
                            <Images className="size-6" />
                            Todavía sin fotos
                        </span>
                    )}
                </span>

                <span className="flex flex-1 flex-col gap-2.5 px-5 pt-4 pb-4.5">
                    {album.category && <CategoryChip category={album.category} />}
                    <h3 className="line-clamp-2 font-display text-lg leading-snug font-extrabold tracking-[-0.01em] text-ink transition-colors group-hover:text-brand">
                        {album.title}
                    </h3>
                    {/* mt-auto: con títulos de uno y dos renglones en la misma
                        fila, las fechas quedan todas a la misma altura. */}
                    <span className="mt-auto flex items-center justify-between gap-3 text-sm leading-relaxed text-muted-foreground">
                        <span>{album.date && date && <time dateTime={album.date}>{date}</time>}</span>
                        {album.imageCount > 0 && (
                            <span className="inline-flex flex-none items-center gap-1.5">
                                <Images aria-hidden className="size-4" />
                                {photoCountLabel(album.imageCount)}
                            </span>
                        )}
                    </span>
                </span>
            </Link>
        </li>
    )
}

export const AlbumCardSkeleton = () => (
    <li className="overflow-hidden rounded-lg border bg-card">
        <Skeleton className="aspect-4/3 rounded-none" />
        <div className="grid gap-2.5 px-5 pt-4 pb-4.5">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    </li>
)
