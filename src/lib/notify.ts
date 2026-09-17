import { toast, type ExternalToast } from 'sonner'

import { resolveToastDuration } from './toast-duration'

/*
 * `description` como string y no ReactNode: hace falta contarle los
 * caracteres, y hoy ninguna llamada de la app pasa JSX. El `| undefined` es por
 * exactOptionalPropertyTypes, que está pendiente: sin él,
 * `{ description: notice.description }` (un `description?: string`) deja de
 * compilar el día que se prenda, cosa que con `toast` directo no pasa.
 */
type NotifyOptions = Omit<ExternalToast, 'description'> & { description?: string | undefined }

const withDuration = (title: string, options: NotifyOptions = {}): ExternalToast => ({
    ...options,
    duration: resolveToastDuration(title, options),
})

/**
 * Los toasts de la app, con la duración según el largo (ver toast-duration.ts).
 *
 * Es el único archivo que importa `toast` de sonner. La regla
 * `no-restricted-imports` de eslint.config.js lo marca en cualquier otro, así
 * una llamada nueva no se saltea la duración sin que nadie se entere.
 */
export const notify = {
    success: (title: string, options?: NotifyOptions) => toast.success(title, withDuration(title, options)),
    error: (title: string, options?: NotifyOptions) => toast.error(title, withDuration(title, options)),
    warning: (title: string, options?: NotifyOptions) => toast.warning(title, withDuration(title, options)),
    dismiss: toast.dismiss,
}
