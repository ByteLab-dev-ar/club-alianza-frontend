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
import { PageHero } from '@/components/custom/PageHero'
import { getApiErrorMessage } from '@/api/clubApi'
import { sendContactAction } from '../actions/send-contact.action'
import { contactSchema, type ContactSchema } from '../schemas/contact.schema'

const CONTACT_DETAILS = [
    { icon: MapPin, label: 'Av. de los Deportes 1944, Buenos Aires' },
    { icon: Phone, label: '+54 11 4444-1944' },
    { icon: Mail, label: 'hola@clubalianza.com.ar' },
]

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
        <>
            <PageHero
                kicker="Contacto"
                title="Hablemos"
                description="¿Consultas sobre la cuota, eventos o cómo asociarte? Escribinos y te respondemos."
            />

            <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.4fr_1fr]">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((values) => mutate(values))}
                        className="flex flex-col gap-5"
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
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
                                            <Input
                                                type="email"
                                                placeholder="tu@email.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                            className="w-fit"
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="animate-spin" />}
                            {isPending ? 'Enviando…' : 'Enviar mensaje'}
                        </Button>
                    </form>
                </Form>

                <aside className="h-fit rounded-xl bg-gradient-dark p-8 shadow-club">
                    <p className="kicker text-secondary">Dónde encontrarnos</p>
                    <ul className="mt-6 flex flex-col gap-5">
                        {CONTACT_DETAILS.map(({ icon: Icon, label }) => (
                            <li key={label} className="flex items-start gap-3 text-sm text-white/80">
                                <Icon className="mt-0.5 size-4 shrink-0 text-secondary" />
                                {label}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-8 border-t border-white/10 pt-6 text-xs leading-relaxed text-white/50">
                        La sede social atiende de lunes a viernes de 9 a 18 hs y los sábados de
                        partido desde dos horas antes del encuentro.
                    </p>
                </aside>
            </section>
        </>
    )
}
