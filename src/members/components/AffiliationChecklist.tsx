import { Link } from 'react-router'
import { ArrowRight, Check, Circle } from 'lucide-react'

import { DocumentTypes, type AffiliationRequirement } from '../interfaces/MemberProfile'
import { isLockedIdentityField } from '../lib/identity-lock'

/**
 * Dónde se resuelve cada requisito.
 *
 * La ficha firmada es el único que se completa en esta misma pantalla; el resto
 * vive en "Mi perfil". El `field` viaja en la query para que esa pantalla pueda
 * llevar el foco al campo exacto en vez de dejar a la persona buscándolo entre
 * ocho — con "te falta el domicilio" y nada más, el checklist informa pero no
 * resuelve.
 */
const destinationFor = (field: string, basePath: string | null): { to: string } | null => {
    if (field === DocumentTypes.AFFILIATION_FORM || basePath === null) return null
    return { to: `${basePath}?campo=${field}` }
}

interface Props {
    missing: AffiliationRequirement[]
    /**
     * El trámite ya está aprobado, así que el DNI no se reemplaza desde el
     * portal (§1.6): esos dos ítems pierden el link y dicen dónde se resuelven.
     *
     * Sin esto, el socio que vino del padrón histórico —que es TODO el padrón
     * histórico: entró sin documentos, a propósito— veía "Foto del DNI (frente)"
     * con un "Completar" que lo llevaba a un botón habilitado, y el POST le
     * contestaba 409. La lista decía la verdad; lo que mentía era la invitación.
     */
    identityLocked?: boolean
    /**
     * A qué pantalla mandar a completar cada requisito. `null` cuando ya se está
     * ahí —la ficha del tutelado tiene todo en la misma página—, y ahí el ítem
     * queda como una línea de la lista sin link a ningún lado.
     */
    basePath?: string | null
    /**
     * Ya está todo cargado, así que el checklist deja de ser una lista de
     * pendientes y pasa a ser la confirmación de que no falta nada.
     */
    isComplete: boolean
}

/**
 * Qué falta para poder presentar la solicitud (§1.3 paso 2).
 *
 * La lista la calcula el servidor con la misma función que aplica el gate del
 * POST, y los `label` vienen ya en castellano: acá no se traduce ni se
 * reescribe nada. Si esta pantalla armara su propia lista, un día diría "ya
 * está" y el servidor contestaría que no.
 */
export const AffiliationChecklist = ({
    missing,
    isComplete,
    identityLocked = false,
    basePath = '/mi-cuenta/perfil',
}: Props) => {
    if (isComplete) {
        return (
            <p className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm font-semibold text-success">
                <Check className="size-4 shrink-0" />
                Tenés todo cargado.
            </p>
        )
    }

    return (
        <ul className="flex flex-col divide-y">
            {missing.map((requirement) => {
                const isLockedIdentity =
                    identityLocked && isLockedIdentityField(requirement.field)
                const destination = isLockedIdentity
                    ? null
                    : destinationFor(requirement.field, basePath)

                return (
                    <li
                        key={requirement.field}
                        className="flex items-center justify-between gap-3 py-3"
                    >
                        <span className="flex items-center gap-2.5 text-sm text-ink">
                            <Circle className="size-4 shrink-0 text-muted-foreground" />
                            {requirement.label}
                        </span>

                        {destination ? (
                            <Link
                                to={destination.to}
                                className="flex shrink-0 items-center gap-1 text-sm font-semibold text-secondary hover:underline"
                            >
                                Completar
                                <ArrowRight className="size-3.5" />
                            </Link>
                        ) : (
                            <span className="shrink-0 text-xs text-muted-foreground">
                                {isLockedIdentity
                                    ? 'Acercate a la sede'
                                    : 'Más abajo en esta página'}
                            </span>
                        )}
                    </li>
                )
            })}
        </ul>
    )
}
