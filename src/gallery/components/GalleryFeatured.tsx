import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CategoryMark } from './CategoryMark'
import { formatMomentDate, viewPhotosLabel } from '../lib/moment-labels'
import type { GalleryAlbumListItem } from '../interfaces/Gallery'

/*
 * El alto desde md: 60vh con tope. En un monitor de 1080 la foto no pasa de
 * 640px y en una notebook de 768 no baja de 416.
 */
const FEATURED_HEIGHT = 'md:h-[clamp(26rem,60vh,40rem)]'

/**
 * La portada de la galería: el momento más reciente con foto, a sangre.
 *
 * Reemplaza al encabezado celeste de las otras páginas: la galería abre con
 * una foto y no con una banda que describe fotos que todavía no se ven. Es
 * fija en todos los estados del listado (con filtro, en la página 2): si solo
 * estuviera en "Todas", al tocar una categoría en la barra lateral todo el
 * layout subiría 40rem abajo del cursor.
 *
 * - Celular: la foto 4:3 arriba y el texto abajo, en un panel Negro Escudo
 *   sólido. Un título de tres renglones a 36px encima de la foto la taparía
 *   entera.
 * - Desde md: el texto va encima de la foto, abajo, sobre `bg-scrim-portada`
 *   (ver en index.css por qué eso no es un velo).
 * - Desde lg: el botón pasa a la derecha, sobre la base de la fecha: la zona
 *   oscura mide un renglón menos y se ve más foto.
 *
 * La foto es el LCP del listado (prioridad alta, sin lazy). Su link está
 * oculto al teclado y al lector de pantalla porque el título ya es el link al
 * mismo momento: dos links iguales seguidos son ruido.
 */
export const GalleryFeatured = ({ album }: { album: GalleryAlbumListItem }) => {
    const href = `/galeria/${album.id}`
    const date = formatMomentDate(album.date)

    return (
        // md:overflow-hidden: si el bloque de texto llegara a medir más que la
        // foto, el oscurecido no se mete debajo del header translúcido.
        <section
            aria-labelledby="portada-titulo"
            className={`relative bg-ink text-white md:overflow-hidden ${FEATURED_HEIGHT}`}
        >
            <Link
                to={href}
                tabIndex={-1}
                aria-hidden
                className="block aspect-4/3 overflow-hidden md:absolute md:inset-0 md:aspect-auto"
            >
                {album.coverUrl && (
                    <img
                        src={album.coverUrl}
                        alt=""
                        fetchPriority="high"
                        decoding="async"
                        className="size-full object-cover"
                    />
                )}
            </Link>

            {/* pointer-events-none desde md: el bloque tapa la mitad de abajo de
                la foto, y sin esto un click ahí no llegaba al link de la foto. */}
            <div className="pt-6 pb-8 md:pointer-events-none md:absolute md:inset-x-0 md:bottom-0 md:bg-scrim-portada md:pt-32 md:pb-12">
                <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
                    <div>
                        {/* Celeste Escudo: va sobre oscuro (Regla de los Dos Celestes). */}
                        <p className="kicker text-secondary">Lo más reciente</p>
                        <h2
                            id="portada-titulo"
                            className="text-display mt-3 max-w-[22ch] text-[clamp(2.25rem,3.6vw,3.25rem)] leading-[1.06] text-balance"
                        >
                            {/*
                              Tope de renglones desde md, donde el texto va encima
                              de la foto: el backend acepta títulos de 120
                              caracteres, y con uno así el oscurecido tapaba la foto
                              entera. En el celular no hace falta (panel sólido,
                              debajo de la foto). El clamp va en el link y no en el
                              h2: el overflow del h2 recortaba el anillo de foco.
                              El pb de 0.1em es para que el overflow no muerda las
                              descendentes ni el subrayado del último renglón. Sin
                              `title`: el nombre accesible es el título completo y
                              el link lleva a la página que lo muestra entero.
                            */}
                            <Link
                                to={href}
                                className="underline decoration-transparent decoration-2 underline-offset-[0.12em] transition-[text-decoration-color] hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary md:pointer-events-auto md:line-clamp-2 md:pb-[0.1em] lg:line-clamp-3"
                            >
                                {album.title}
                            </Link>
                        </h2>
                        {(album.category || date) && (
                            <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-white/70">
                                {album.category && (
                                    <>
                                        <span className="inline-flex items-center gap-2 font-semibold text-white">
                                            <CategoryMark category={album.category} />
                                            {album.category.name}
                                        </span>
                                        {date && <span aria-hidden>·</span>}
                                    </>
                                )}
                                {album.date && date && <time dateTime={album.date}>{date}</time>}
                            </p>
                        )}
                    </div>

                    {/*
                      Sin sombra, ni en reposo ni con hover, como en la maqueta:
                      sobre oscuro no aporta nada. Con `!` porque `.shadow-soft`
                      del botón es una clase de `@layer utilities` que sale
                      después de `shadow-none` en el CSS y le ganaba.

                      El foco con separación de Negro Escudo: pegado al relleno
                      celeste, el anillo se leía como un borde del mismo botón.
                    */}
                    <Button
                        asChild
                        size="lg"
                        className="w-full shadow-none! focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-ink md:pointer-events-auto md:w-auto md:self-start lg:self-end"
                    >
                        <Link to={href}>
                            {viewPhotosLabel(album.imageCount)}
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}

/**
 * La misma caja mientras llega la portada, para que el listado no salte al
 * aparecer la foto. El único salto posible es el caso raro sin portada, que
 * cae al encabezado de siempre.
 */
export const GalleryFeaturedSkeleton = () => (
    <div aria-hidden className={`relative bg-ink ${FEATURED_HEIGHT}`}>
        <div className="aspect-4/3 md:hidden" />
        <div className="pt-6 pb-8 md:absolute md:inset-x-0 md:bottom-0 md:pb-12">
            <div className="mx-auto grid max-w-7xl gap-3 px-6">
                <div className="h-3 w-28 animate-pulse rounded-sm bg-white/10" />
                <div className="h-10 w-full max-w-md animate-pulse rounded-sm bg-white/10" />
                <div className="h-4 w-56 animate-pulse rounded-sm bg-white/10" />
            </div>
        </div>
    </div>
)
