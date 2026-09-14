import { cn } from '@/lib/utils'

interface Option<T extends string> {
    value: T
    label: string
    /** Cuántos hay en esta solapa. Sin él, el rótulo queda como estaba siempre. */
    count?: number
}

interface Props<T extends string> {
    options: readonly Option<T>[]
    value: T
    onChange: (value: T) => void
    /**
     * Los conteos vienen en camino y todavía no llegó ninguno. Dibuja el hueco
     * del número en vez de nada, para que los rótulos no se corran cuando
     * aparezca. En los refrescos siguientes no hace falta: ahí la solapa sigue
     * mostrando el número anterior (ver `useMemberCounts`).
     */
    pendingCounts?: boolean
}

/**
 * El conteo de una solapa.
 *
 * **No se pinta un color propio: hereda el del botón.** Así el número se apaga y
 * se enciende junto con su rótulo —también el peso— y el estado activo se sigue
 * decidiendo en un solo lugar. El fondo es el mismo blanco del texto al 10%, que
 * sobre la banda da el escalón de `sidebar-accent`: neutro, sin croma, apenas un
 * peldaño. Rellenarlo de celeste sería volver al problema que la solapa cosida
 * vino a resolver, con el agravante de repetirlo cinco veces.
 *
 * **El ancho es siempre el de tres dígitos** (`min-w-9`, que es lo que ocupan
 * 248 más el padding) y por eso `tabular-nums` no alcanzaba solo: sin el mínimo,
 * el hueco reservado mientras carga entra en dos cifras y las solapas se corren
 * ~8px cada una cuando llegan los números de verdad. Tres dígitos es el techo
 * real de un padrón de club; con cuatro la píldora crece y la fila se acomoda
 * una vez, que es mejor que recortar el número.
 *
 * Sin número y sin conteo en camino devuelve `null`, y el rótulo queda tal cual:
 * es el caso de la pantalla que no cuenta, y también el del conteo que falló
 * —los badges se vacían y la tabla no se entera—.
 */
const TabCount = ({ count, pending }: { count?: number; pending?: boolean }) => {
    if (count === undefined && !pending) return null

    return (
        <span
            className={cn(
                'min-w-9 rounded-sm bg-sidebar-foreground/10 px-1.5 text-center tabular-nums',
                count === undefined && 'animate-pulse',
            )}
        >
            {/* El ancho lo pone `min-w-9`; estos dos dígitos ocultos son los
                que le dan ALTO a la píldora vacía —un span sin contenido mide
                cero— y la dejan idéntica a una con número. `invisible` y no
                `opacity-0`: así el lector de pantalla no anuncia un "00" que no
                existe. */}
            {count ?? <span className="invisible">00</span>}
        </span>
    )
}

/**
 * Los filtros de una pantalla del panel, dentro de la banda superior.
 *
 * **Por qué no son píldoras.** Antes lo eran, rellenas de celeste
 * (`FilterPills tone="band"`, ya retirado). El problema no era el color en sí:
 * el celeste relleno es el lenguaje de la SECCIÓN ACTIVA del menú lateral, y
 * usarlo también para el filtro activo ponía dos cosas distintas gritando igual
 * a veinte centímetros de distancia. La banda dejaba de leerse como chrome y
 * pasaba a parecer una segunda navegación.
 *
 * Acá el estado activo lo marca un filete de 2px apoyado en el BORDE INFERIOR de
 * la banda. Es el mismo recurso que las solapas del navegador: la que está
 * activa se cose al contenido que hay debajo. Gasta menos tinta, le devuelve el
 * celeste relleno al menú, y sigue siendo inequívoco.
 *
 * **Cómo se apoya en el borde.** `self-stretch` estira el grupo a todo el alto
 * de la franja (que la alinea al centro, como al resto de sus hijos) y `-mb-px`
 * lo baja un pixel más, justo encima del `border-b` que dibuja la banda. Sin ese
 * pixel el filete flota adentro de la franja y el efecto de "solapa cosida" no
 * ocurre: se lee como un subrayado suelto.
 *
 * **Sin padding horizontal, separadas por `gap`.** Es lo que alinea la primera
 * etiqueta con el título del piso de arriba, que empieza en el mismo borde de
 * 32px. Con `px-3` en el botón, su CAJA arrancaba alineada pero el TEXTO caía 12px
 * más a la derecha — y lo que el ojo sigue es el texto, así que la fila se leía
 * corrida. Antes no se veía porque el relleno de la píldora se adueñaba de ese
 * espacio; una etiqueta desnuda no tiene con qué justificarlo. De paso, cada
 * filete abraza su propia etiqueta en vez de sobresalirle por los costados.
 *
 * **El conteo al lado del rótulo es opcional.** Durante mucho tiempo no lo llevó
 * ninguna, y no por gusto: el dashboard traía el total y los activos nada más, y
 * el listado devuelve el `meta.totalItems` de la solapa que se está mirando, así
 * que armar los cinco números en el front eran cinco requests por pantalla. Con
 * `GET /admin/members/counts` vienen los cinco en una sola. La pantalla que no
 * tenga de dónde sacarlos —pagos— sigue dibujando exactamente lo de antes.
 */
export const FilterTabs = <T extends string>({
    options,
    value,
    onChange,
    pendingCounts,
}: Props<T>) => (
    <div className="-mb-px flex items-stretch gap-5 self-stretch">
        {options.map((option) => {
            const isActive = option.value === value

            return (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    // `aria-pressed` y no `role="tab"`: no hay tabpanel del otro
                    // lado. Son botones que filtran una tabla, y anunciarlos como
                    // solapas le promete al lector de pantalla una estructura que
                    // no va a encontrar.
                    aria-pressed={isActive}
                    className={cn(
                        'flex items-center gap-1.5 border-b-2 text-xs transition-colors',
                        isActive
                            ? 'border-sidebar-primary font-bold text-sidebar-foreground'
                            : 'border-transparent font-semibold text-sidebar-foreground/55 hover:text-sidebar-foreground',
                    )}
                >
                    {option.label}
                    <TabCount count={option.count} pending={pendingCounts} />
                </button>
            )
        })}
    </div>
)

interface ToggleProps {
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
}

/**
 * Un filtro de sí/no al lado de las solapas ("Solo jugadores").
 *
 * No puede ser una solapa más: las solapas son excluyentes entre sí —se elige
 * UNA— y esto se combina con la que esté elegida. Por eso conserva forma de
 * control, con su contorno y su casilla, en vez de disolverse en la hilera.
 *
 * El filete vertical de la izquierda es lo que dice eso sin escribirlo: cierra
 * el grupo de solapas y abre otra cosa. Va acá adentro y no en cada pantalla
 * porque este control solo existe a continuación de una hilera de solapas; si
 * algún día se usa suelto, el filete se saca de este archivo y no de catorce.
 */
export const FilterToggle = ({ label, checked, onChange }: ToggleProps) => (
    <>
        <span aria-hidden className="mx-1 h-4 w-px shrink-0 bg-sidebar-border" />

        <label
            className={cn(
                'flex h-7 cursor-pointer items-center gap-2 rounded-lg border border-sidebar-border px-3 text-xs font-semibold transition-colors',
                checked
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground',
            )}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="size-3.5 accent-[var(--sidebar-primary)]"
            />
            {label}
        </label>
    </>
)
