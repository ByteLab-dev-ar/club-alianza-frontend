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

export const PublicFooter = () => {
    return (
        <footer className="bg-gradient-night text-white/70">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-4">
                    <ClubLogo inverted />
                    <p className="max-w-xs text-sm leading-relaxed">
                        Deporte, comunidad y pasión celeste en Cutral Có.
                    </p>
                </div>

                <div>
                    <p className="kicker mb-4 text-white/40">Navegación</p>
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

                <div>
                    <p className="kicker mb-4 text-white/40">Socios</p>
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

                <div>
                    <p className="kicker mb-4 text-white/40">Contacto</p>
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
        </footer>
    )
}
