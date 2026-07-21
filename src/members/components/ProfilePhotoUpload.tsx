import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, Loader2, User } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/api/clubApi'
import { uploadProfilePictureAction } from '../actions/profile.actions'
import { PROFILE_QUERY_KEY } from '../hooks/useProfile'

const MAX_FILE_SIZE = 5 * 1024 * 1024

interface Props {
    urlPhoto: string | null
}

export const ProfilePhotoUpload = ({ urlPhoto }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        mutationFn: uploadProfilePictureAction,
        onSuccess: (updated) => {
            queryClient.setQueryData(PROFILE_QUERY_KEY, updated)
            // La credencial muestra la misma foto: si no se invalida, queda la vieja.
            void queryClient.invalidateQueries({ queryKey: ['member-credential'] })
            toast.success('Foto actualizada')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos subir la foto')),
    })

    const onFileSelected = (file: File | undefined) => {
        if (!file) return

        if (file.size > MAX_FILE_SIZE) {
            toast.error('La imagen no puede superar los 5MB')
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
                    disabled={isPending}
                >
                    {isPending ? <Loader2 className="animate-spin" /> : <Camera />}
                    {urlPhoto ? 'Cambiar foto' : 'Subir foto'}
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">JPG, PNG o WebP. Máximo 5MB.</p>

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
