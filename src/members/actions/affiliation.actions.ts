import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { MyDocument, SignedAffiliationForm } from '../interfaces/Affiliation'
import type { MyMemberProfile } from '../interfaces/MemberProfile'

/**
 * POST /members/membership-application — presentar la solicitud.
 *
 * Registrarse no hace socio a nadie: crear la cuenta y completar los datos no
 * presenta nada por sí solo. Hace falta este POST, y después que un admin la
 * apruebe — recién ahí se asigna el número de socio.
 *
 * Exige tener todo lo de `missingRequirements` cargado, con el mismo cálculo
 * que devuelve el GET del perfil: si ahí viene `canSubmitApplication: true`,
 * esto no puede fallar por datos.
 *
 * Volver a presentar después de un rechazo borra la revisión anterior —motivo y
 * fecha—: es un trámite nuevo, no la continuación del que se rechazó.
 */
export const submitMembershipApplicationAction = async () => {
    const response = await clubApi.post<ApiResponse<MyMemberProfile>>(
        '/members/membership-application',
    )
    return unwrap(response)
}

/**
 * DELETE /members/membership-application — cancelar la solicitud.
 *
 * No es un extra: mientras está en revisión la ficha queda congelada (§1.8), y
 * el PATCH del perfil, la foto y los documentos responden 409. Cancelar es la
 * ÚNICA forma de corregir un dato, y el camino completo es cancelar, editar y
 * volver a presentar.
 */
export const cancelMembershipApplicationAction = async () => {
    const response = await clubApi.delete<ApiResponse<MyMemberProfile>>(
        '/members/membership-application',
    )
    return unwrap(response)
}

/** GET /members/documents — qué documentos tiene subidos, sin bytes ni URL. */
export const getMyDocumentsAction = async () => {
    const response = await clubApi.get<ApiResponse<MyDocument[]>>('/members/documents')
    return unwrap(response)
}

/**
 * La ruta del PDF de la ficha, para abrirla con `openPrivateFile`.
 *
 * Devuelve **bytes, no JSON**, así que no pasa por `unwrap`. La genera el
 * servidor con los datos ya cargados: si la persona la completara a mano, el
 * domicilio del papel y el del padrón podrían no coincidir.
 *
 * `profileId` puede ser el propio o el de un tutelado vigente.
 */
export const affiliationFormPath = (profileId: string) =>
    `/members/${profileId}/affiliation-form`

/*
 * Acá vivía `uploadSignedAffiliationFormAction`, que subía la ficha firmada a
 * mano contra `POST /members/{profileId}/affiliation-form`.
 *
 * §1.4 retiró ese camino del lado del socio el 2026-08-19: le hacía llenar la
 * ficha online, imprimirla y volver a subirla a la misma persona que ya tenía
 * la pantalla para firmar. **El papel entra por la sede.**
 *
 * Y el 2026-08-21 el endpoint se mudó al panel —`POST
 * /admin/members/{id}/affiliation-form`, solo ADMIN—, así que esta acción ya no
 * apuntaba a ninguna ruta existente: el socio elegía el archivo, subía, y se
 * comía un error. Cuando el panel tenga su pantalla para cargarla, la acción va
 * a vivir del lado de admin, que es de quien es la operación.
 */

/**
 * POST /members/{profileId}/affiliation-form/signature — firmar en pantalla.
 *
 * Viaja el TRAZO como PNG (máx. 2 MB); el PDF lo arma el servidor con esa firma
 * adentro, y guarda con qué se firmó: fecha y hora, IP, dispositivo, versión del
 * texto y la huella SHA-256 del documento. Sin eso, el dibujo es un PNG.
 *
 * ⚠️ No se le dice "firma digital" en ninguna pantalla — ver `SignedAffiliationForm`.
 */
export const signAffiliationFormAction = async (profileId: string, signature: Blob) => {
    const formData = new FormData()
    // El nombre importa: el backend lee el campo `signature`, no `file`.
    formData.append('signature', signature, 'firma.png')

    const response = await clubApi.post<ApiResponse<SignedAffiliationForm>>(
        `/members/${profileId}/affiliation-form/signature`,
        formData,
    )
    return unwrap(response)
}
