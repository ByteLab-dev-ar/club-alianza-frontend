import { useRef } from 'react'
import { Camera, Loader2, User } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { validateUpload } from '@/shared/lib/file-validation'
import { useUploadProfilePicture } from '../hooks/useProfile'
import { useUploadWardPhoto } from '../hooks/useWards'

interface Props {
    urlPhoto: string | null
    /** La solicitud está en revisión: el endpoint responde 409 (§1.8). */
    frozen?: boolean
    /** Presente = es la foto de un TUTELADO, que va por otro endpoint. */
    wardId?: string
}

export const ProfilePhotoUpload = ({ urlPhoto, frozen = false, wardId }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null)

    // Ver la nota de ProfileForm: los dos hooks se llaman siempre y se elige uno.
    const selfUpload = useUploadProfilePicture()
    const wardUpload = useUploadWardPhoto(wardId ?? '')
    const { mutate, isPending } = wardId ? wardUpload : selfUpload

    const onFileSelected = (file: File | undefined) => {
        if (!file) return

        const error = validateUpload(file)
        if (error) {
            toast.error(error)
            return
        }

        mutate(file)
    }

    return (
        <div className="flex items-center gap-5">
            {urlPhoto ? (
                <img
                    src={urlPhoto}
                    alt="Tu foto de perfil"
                    className="size-20 rounded-full border-2 border-accent object-cover"
                />
            ) : (
                <span className="grid size-20 place-items-center rounded-full bg-accent text-brand">
                    <User className="size-9" />
                </span>
            )}

            <div>
                <Button
                    variant="outline"
                    onClick={() => inputRef.current?.click()}
                    disabled={frozen || isPending}
                >
                    {isPending ? <Loader2 className="animate-spin" /> : <Camera />}
                    {urlPhoto ? 'Cambiar foto' : 'Subir foto'}
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                    JPG, PNG o WebP. Máximo 5MB. Va en tu credencial, así que tiene que
                    identificarte.
                </p>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => {
                        onFileSelected(event.target.files?.[0])
                        // Permite volver a elegir el MISMO archivo (si no, el input
                        // no dispara change al repetir la selección).
                        event.target.value = ''
                    }}
                />
            </div>
        </div>
    )
}
