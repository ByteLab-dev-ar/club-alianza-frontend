import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'
import { Loader2, Mail, MapPin, Phone } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { getApiErrorMessage } from '@/api/clubApi'
import { CLUB_CONTACT } from '@/constants/club'
import { sendContactAction } from '../actions/send-contact.action'
import { contactSchema, type ContactSchema } from '../schemas/contact.schema'

const CONTACT_DETAILS = [
    { icon: MapPin, label: 'Dirección', value: CLUB_CONTACT.address, href: undefined },
    {
        icon: Phone,
        label: 'Teléfono',
        value: CLUB_CONTACT.phone,
        href: `tel:${CLUB_CONTACT.phoneHref}`,
    },
    {
        icon: Mail,
        label: 'Email',
        value: CLUB_CONTACT.email,
        href: `mailto:${CLUB_CONTACT.email}`,
    },
]

/**
 * Mapa embebido, sin API key. Qué punto muestra se controla desde
 * `CLUB_CONTACT.mapQuery` (ver ahí cómo fijarlo con coordenadas exactas).
 */
const MAP_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(
    CLUB_CONTACT.mapQuery,
)}&z=17&output=embed`

export const ContactPage = () => {
    const form = useForm<ContactSchema>({
        resolver: zodResolver(contactSchema),
        defaultValues: { name: '', email: '', subject: '', message: '' },
    })

    const { mutate, isPending } = useMutation({
        mutationFn: sendContactAction,
        onSuccess: () => {
            toast.success('Mensaje enviado. Te vamos a responder por email.')
            form.reset()
        },
        onError: (error) => {
            // El endpoint tiene throttling (3 por minuto por IP): sin este caso,
            // el 429 saldría como un error genérico y el usuario reintentaría en loop.
            if (error instanceof AxiosError && error.response?.status === 429) {
                toast.error('Enviaste demasiados mensajes seguidos. Esperá un minuto.')
                return
            }
            toast.error(getApiErrorMessage(error, 'No pudimos enviar tu mensaje'))
        },
    })

    return (
        <section className="mx-auto grid max-w-6xl items-start gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-14">
            {/* ------------------------------------------------- Datos del club */}
            <div>
                <p className="kicker text-brand">Contacto</p>
                <h1 className="text-display mt-3 text-4xl text-ink lg:text-5xl">Hablemos</h1>
                <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
                    ¿Consultas sobre la cuota, eventos o cómo asociarte? Escribinos y te
                    respondemos.
                </p>

                <ul className="mt-8 flex flex-col gap-3">
                    {CONTACT_DETAILS.map(({ icon: Icon, label, value, href }) => (
                        <li
                            key={label}
                            className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-soft"
                        >
                            <span
                                aria-hidden
                                className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground"
                            >
                                <Icon className="size-5" />
                            </span>
                            <div className="min-w-0">
                                <p className="kicker text-muted-foreground">{label}</p>
                                {href ? (
                                    <a
                                        href={href}
                                        className="font-semibold break-all text-ink transition-colors hover:text-brand"
                                    >
                                        {value}
                                    </a>
                                ) : (
                                    <p className="font-semibold text-ink">{value}</p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="mt-6 overflow-hidden rounded-xl border shadow-soft">
                    <iframe
                        src={MAP_SRC}
                        title={`Ubicación del club: ${CLUB_CONTACT.address}`}
                        className="h-64 w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </div>

            {/* ------------------------------------------------------ Formulario */}
            <div className="rounded-2xl border bg-card p-6 shadow-soft sm:p-8">
                <h2 className="font-display text-2xl font-bold text-ink">Envianos un mensaje</h2>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((values) => mutate(values))}
                        className="mt-6 flex flex-col gap-5"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Tu nombre" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="tu@email.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Asunto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="¿Sobre qué nos escribís?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mensaje</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows={6}
                                            placeholder="Contanos en qué podemos ayudarte…"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            variant="hero"
                            size="lg"
                            className="w-full"
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="animate-spin" />}
                            {isPending ? 'Enviando…' : 'Enviar mensaje'}
                        </Button>
                    </form>
                </Form>
            </div>
        </section>
    )
}
