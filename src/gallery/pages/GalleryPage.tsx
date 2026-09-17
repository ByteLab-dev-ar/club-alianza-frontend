import { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigationType } from 'react-router'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHero } from '@/components/custom/PageHero'
import { clampPage } from '@/lib/pagination'
import { cn } from '@/lib/utils'
import { AlbumCard, AlbumCardSkeleton } from '../components/AlbumCard'
import { CategoryNav, CategoryNavSkeleton } from '../components/CategoryNav'
import { GalleryFeatured, GalleryFeaturedSkeleton } from '../components/GalleryFeatured'
import { GalleryNotice } from '../components/GalleryNotice'
import { GalleryPagination } from '../components/GalleryPagination'
import { useGalleryCategories, useGalleryListing } from '../hooks/useGallery'
import { useGallerySearch } from '../hooks/useGalleryUrl'
import { buildGallerySearch, resolveCategory } from '../lib/gallery-url'
import { listingView } from '../lib/listing-view'
import { momentCountLabel } from '../lib/moment-labels'

/**
 * La galería: la portada "Lo más reciente" arriba y el catálogo abajo, con la
 * barra de categorías al costado y una tarjeta por momento. Nunca una grilla
 * de fotos sueltas — las fotos viven en la página del momento, que es la única
 * que las pide.
 *
 * Categoría y página viven en la URL (`?categoria=partidos&pagina=2`), así
 * entrar a un momento y volver no los pierde.
 */
export const GalleryPage = () => {
    const location = useLocation()
    const navigationType = useNavigationType()
    const { categorySlug, page, replacePage } = useGallerySearch()

    const categoriesQuery = useGalleryCategories()
    const categories = categoriesQuery.data ?? []
    const category = categorySlug ? resolveCategory(categorySlug, categories) : undefined

    const { listing, cover, featured, albums } = useGalleryListing({
        categoryId: category?.id,
        page,
        enabled: categorySlug === null || category !== undefined,
    })
    const meta = listing.data?.meta

    // Una `?pagina=` que ya no existe va a la última que sí (ver clampPage).
    const pageFix = clampPage(page, meta, listing.isPlaceholderData)
    useEffect(() => {
        if (pageFix !== null) replacePage(pageFix)
    }, [pageFix, replacePage])

    const view = listingView({
        categorySlug,
        categoryName: category?.name,
        categoriesStatus: categoriesQuery.status,
        listing: {
            isPending: listing.isPending,
            isError: listing.isError,
            isPlaceholderData: listing.isPlaceholderData,
            itemCount: listing.data?.items.length,
            totalItems: meta?.totalItems,
        },
        isFixingPage: pageFix !== null,
        gridCount: albums.length,
    })

    /*
     * La app no tiene <ScrollRestoration/>. Llegar por un link desde abajo de
     * otra página ("Ver todos los de Partidos", al pie de un momento) abría el
     * listado a media altura, en el medio de la grilla. Se sube al montar si
     * se llegó con un link; con el atrás no, ahí el navegador intenta devolver
     * la posición. Mismo criterio que la página del momento. Solo al montar
     * (por eso el ref): cambiar de filtro o de página no remonta la página y
     * tiene su propio manejo, abajo.
     */
    const arrival = useRef(navigationType)
    useEffect(() => {
        if (arrival.current !== 'POP') window.scrollTo(0, 0)
    }, [])

    /*
     * La portada es fija y mide hasta 40rem. Al cambiar de categoría o de
     * página desde abajo (la barra lateral es sticky, la paginación está al
     * pie), el catálogo quedaba arriba de la ventana y se veía el medio de una
     * grilla nueva. Si su borde de arriba se fue de la pantalla, se lo trae;
     * si está a la vista (tocando un chip arriba en el celular) no se mueve
     * nada. Es un corte, sin scroll suave.
     */
    const catalogRef = useRef<HTMLElement>(null)
    const previousSearch = useRef(location.search)
    useEffect(() => {
        if (previousSearch.current === location.search) return
        previousSearch.current = location.search
        const catalog = catalogRef.current
        if (catalog && catalog.getBoundingClientRect().top < 0) {
            catalog.scrollIntoView({ block: 'start' })
        }
    }, [location.search])

    const hasNav = categoriesQuery.isPending || categoriesQuery.isError || categories.length > 0

    const retry = () => {
        if (categorySlug !== null && categoriesQuery.isError) void categoriesQuery.refetch()
        else void listing.refetch()
    }

    const renderResults = () => {
        switch (view.results) {
            case 'error':
                return (
                    <GalleryNotice
                        role="alert"
                        title="No pudimos cargar la galería"
                        description="Probá recargar en unos minutos."
                        action={
                            <Button variant="outline" onClick={retry}>
                                Reintentar
                            </Button>
                        }
                    />
                )
            case 'empty-category':
                return (
                    <GalleryNotice
                        title="No hay momentos en esta categoría."
                        action={
                            <Button asChild variant="outline">
                                <Link to="/galeria" replace>
                                    Ver todos los momentos
                                </Link>
                            </Button>
                        }
                    />
                )
            case 'empty':
                return <GalleryNotice title="Todavía no hay momentos cargados." />
            case 'loading':
                return (
                    <ul aria-busy className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <AlbumCardSkeleton key={index} />
                        ))}
                    </ul>
                )
        }

        const isStale = view.results === 'stale'
        return (
            // Atenuada mientras llega otra categoría o página (ver ListingResults).
            <div aria-busy={isStale || undefined} className={cn('transition-opacity duration-150', isStale && 'opacity-60')}>
                {/* Tres columnas recién desde 80rem: con la barra lateral, a
                    64rem la tarjeta quedaba de 226px y el título partía en tres
                    renglones. */}
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {albums.map((album, index) => (
                        <AlbumCard key={album.id} album={album} from={location.search} eager={index < 3} />
                    ))}
                </ul>

                {meta && (
                    <GalleryPagination
                        meta={meta}
                        searchFor={(nextPage) => buildGallerySearch({ categorySlug, page: nextPage })}
                        disabled={isStale}
                    />
                )}
            </div>
        )
    }

    return (
        <>
            {featured || cover.isPending ? (
                <>
                    {/* También mientras carga la portada: sin esto la página
                        no tenía ningún h1 hasta que llegaba la foto. */}
                    <h1 className="sr-only">Galería</h1>
                    {featured ? <GalleryFeatured album={featured} /> : <GalleryFeaturedSkeleton />}
                </>
            ) : (
                // Sin momento con foto en la primera página, galería vacía o la
                // portada caída: el encabezado de siempre, que trae su h1. No
                // vale una variante nueva para un caso raro.
                <PageHero
                    kicker="Galería"
                    title="Momentos celestes"
                    description="Partidos, festejos y vida social del club, contados en imágenes."
                />
            )}

            {/* scroll-mt de 73px: el header mide h-18 más su borde de 1px. */}
            <section
                ref={catalogRef}
                className="mx-auto max-w-7xl scroll-mt-[calc(4.5rem+1px)] px-6 pt-6 pb-16 lg:pt-12 lg:pb-20"
            >
                {/* Sin categorías cargadas en el club no hay barra, y la grilla
                    toma el ancho entero en vez de dejar la columna vacía. */}
                <div
                    className={
                        hasNav ? 'lg:grid lg:grid-cols-[12.5rem_minmax(0,1fr)] lg:items-start lg:gap-12' : undefined
                    }
                >
                    {categoriesQuery.isPending ? (
                        <CategoryNavSkeleton activeSlug={categorySlug} />
                    ) : (
                        // Si fallan las categorías queda "Todas" sola, que sigue sirviendo.
                        hasNav && <CategoryNav categories={categories} activeSlug={categorySlug} />
                    )}

                    <div>
                        <div className="mb-5 flex items-baseline justify-between gap-4 lg:mb-4 lg:h-8 lg:items-center">
                            {view.heading ? (
                                <h2 className="font-display text-lg leading-snug font-extrabold tracking-[-0.01em] text-ink">
                                    {view.heading}
                                </h2>
                            ) : (
                                <Skeleton className="h-6 w-32" />
                            )}
                            {view.count === 'loading' ? (
                                <Skeleton className="h-4 w-20 flex-none self-center" />
                            ) : (
                                view.count !== null && (
                                    <p className="flex-none text-sm text-muted-foreground">
                                        {momentCountLabel(view.count)}
                                    </p>
                                )
                            )}
                        </div>

                        {renderResults()}
                    </div>
                </div>
            </section>
        </>
    )
}
