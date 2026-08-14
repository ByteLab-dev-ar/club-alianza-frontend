import { Link } from 'react-router'
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react'

import { ClubLogo } from '@/components/custom/ClubLogo'
import { CLUB_CONTACT, CLUB_SOCIAL } from '@/constants/club'

// Solo se renderizan las redes que tengan URL cargada.
const SOCIAL_LINKS = [
    { icon: Instagram, label: 'Instagram', href: CLUB_SOCIAL.instagram },
    { icon: Facebook, label: 'Facebook', href: CLUB_SOCIAL.facebook },
    { icon: Youtube, label: 'YouTube', href: CLUB_SOCIAL.youtube },
].filter((social) => social.href.length > 0)

const NAVIGATION = [
    { to: '/', label: 'Inicio' },
    { to: '/eventos', label: 'Eventos' },
    { to: '/historia', label: 'Historia' },
    { to: '/galeria', label: 'Galería' },
    { to: '/contacto', label: 'Contacto' },
]

const MEMBERS = [
    { to: '/asociarse', label: 'Asociarse' },
    { to: '/mi-cuenta', label: 'Mi cuenta' },
    { to: '/mi-cuenta/credencial', label: 'Credencial digital' },
    { to: '/mi-cuenta/pagos', label: 'Pagos' },
]

/**
 * Fondo `ink` plano, no `bg-gradient-night`. El degradé navy→petróleo con
 * resplandor cyan tenía sentido cuando el CTA de la portada también lo usaba;
 * hoy el hero y el bloque de asociarse son negro plano, y el footer era lo único
 * que quedaba hablando el idioma anterior.
 *
 * Cada columna se ancla con la regla de marca, igual que las fichas de la
 * portada, y los rótulos van en celeste: eso es lo que alinea el pie con el
 * resto de la interfaz.
 *
 * El degradé no es decorativo y no se puede reemplazar por un color plano sin
 * traer de vuelta un problema. El bloque de asociarse termina en un panel `ink`
 * que ocupa media pantalla, así que un footer `ink` a sangre se le pegaba
 * encima: la mitad derecha de la página quedaba como una columna negra continua
 * y la foto de la cancha cortada contra ella.
 *
 * Por eso `--gradient-footer` arranca en el MISMO `ink` y recién deriva al
 * petróleo más abajo. El fondo no genera costura porque los dos negros
 * coinciden, y la separación la hace la transición. Cambiarlo por un plano, o
 * moverle el primer punto de parada, devuelve la costura.
 *
 * El filete de arriba va ENCIMA de eso y es deliberado: marca dónde empieza el
 * pie, que el degradé solo no alcanzaba a comunicar. Las dos cosas no se pisan
 * —una evita el corte accidental, la otra dibuja el intencional—, así que no
 * hay que sacar ninguna "porque ya está la otra".
 */
export const PublicFooter = () => {
    return (

        <footer className="border-t border-white/15 bg-gradient-footer text-white/70">
            <div>
                <div className="mx-auto grid max-w-7xl gap-10 px-6 py-18 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col gap-4 border-t-2 border-secondary pt-6">
                        <ClubLogo inverted />
                        <p className="max-w-xs text-sm leading-relaxed">
                            Deporte, comunidad y pasión celeste en Cutral Có.
                        </p>
                    </div>

                    <div className="border-t-2 border-secondary pt-6">
                        <p className="kicker mb-4 text-secondary">Navegación</p>
                        <ul className="flex flex-col gap-2.5 text-sm">
                            {NAVIGATION.map(({ to, label }) => (
                                <li key={to}>
                                    <Link to={to} className="transition-colors hover:text-secondary">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="border-t-2 border-secondary pt-6">
                        <p className="kicker mb-4 text-secondary">Socios</p>
                        <ul className="flex flex-col gap-2.5 text-sm">
                            {MEMBERS.map(({ to, label }) => (
                                <li key={to}>
                                    <Link to={to} className="transition-colors hover:text-secondary">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="border-t-2 border-secondary pt-6">
                        <p className="kicker mb-4 text-secondary">Contacto</p>
                        <ul className="flex flex-col gap-3 text-sm">
                            <li className="flex items-start gap-2.5">
                                <MapPin className="mt-0.5 size-4 shrink-0 text-secondary" />
                                {CLUB_CONTACT.address}
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Phone className="size-4 shrink-0 text-secondary" />
                                <a
                                    href={`tel:${CLUB_CONTACT.phoneHref}`}
                                    className="transition-colors hover:text-secondary"
                                >
                                    {CLUB_CONTACT.phone}
                                </a>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Mail className="size-4 shrink-0 text-secondary" />
                                <a
                                    href={`mailto:${CLUB_CONTACT.email}`}
                                    className="break-all transition-colors hover:text-secondary"
                                >
                                    {CLUB_CONTACT.email}
                                </a>
                            </li>
                        </ul>

                        {SOCIAL_LINKS.length > 0 && (
                            <div className="mt-6 flex gap-2.5">
                                {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={label}
                                        className="grid size-10 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-secondary hover:text-secondary"
                                    >
                                        <Icon className="size-4" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-white/10">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs sm:flex-row">
                        <p>© {new Date().getFullYear()} Club Alianza · Todos los derechos reservados</p>
                        {/* rel sin `noreferrer` a propósito: así ByteLabs ve en sus
                            analytics que la visita llegó desde este sitio. */}
                        <a
                            href="https://bytelabs.com.ar/"
                            target="_blank"
                            rel="noopener"
                            className="kicker text-white/40 transition-colors hover:text-secondary"
                        >
                            Desarrollado por ByteLabs
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}