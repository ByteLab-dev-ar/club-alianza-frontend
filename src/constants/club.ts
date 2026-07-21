/**
 * Datos de contacto del club. Fuente única: los usan el footer y la página de
 * Contacto, así que cambiándolos acá se actualizan los dos lugares.
 */
export const CLUB_CONTACT = {
    address: 'C. H. Rodríguez 26, Cutral Có',
    phone: '+54 9 299 415 2012',
    /** Sin espacios ni guiones: formato que espera el enlace `tel:`. */
    phoneHref: '+5492994152012',
    email: 'csdalianzacco@gmail.com',

    /**
     * Qué busca el mapa de la página de Contacto.
     *
     * Buscar solo la calle hace que Google caiga en cualquier punto de la cuadra,
     * por eso se busca el club por nombre. Si aun así el pin no queda sobre el
     * predio, lo más exacto es reemplazar esto por las coordenadas: abrir el lugar
     * en Google Maps, botón derecho sobre el punto exacto → copiar las coordenadas,
     * y pegarlas acá como 'lat,lng' (ej. '-38.9345,-69.2301').
     */
    mapQuery: 'Club Social y Deportivo Alianza, Cutral Có, Neuquén',
} as const

/**
 * Redes del club. Las que estén vacías no se muestran, así que se pueden ir
 * completando de a una sin tocar el footer.
 */
export const CLUB_SOCIAL = {
    instagram: '',
    facebook: 'https://www.facebook.com/csd.alianza.cco',
    youtube: '',
} as const
