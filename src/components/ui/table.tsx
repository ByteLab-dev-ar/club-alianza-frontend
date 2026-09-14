import { cn } from '@/lib/utils'

function Table({ className, ...props }: React.ComponentProps<'table'>) {
    return (
        <div data-slot="table-container" className="relative w-full overflow-x-auto">
            <table data-slot="table" className={cn('w-full caption-bottom text-sm', className)} {...props} />
        </div>
    )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
    return <thead data-slot="table-header" className={cn('[&_tr]:border-b', className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
    return (
        <tbody
            data-slot="table-body"
            className={cn('[&_tr:last-child]:border-0', className)}
            {...props}
        />
    )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
    return (
        <tr
            data-slot="table-row"
            className={cn('border-b transition-colors hover:bg-muted/40', className)}
            {...props}
        />
    )
}

/**
 * La cabecera va sobre una BANDA oscura (rediseño 09/2026, dirección "Banda"):
 * el rótulo dejó de ser gris sobre blanco y cada tabla ganó un ancla visual.
 *
 * ⚠️ La banda pinta hasta los bordes, así que el contenedor que envuelva la
 * tabla en un card redondeado necesita `overflow-hidden` — sin eso las esquinas
 * de la banda se salen de la curva del borde.
 */
function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
    return (
        <th
            data-slot="table-head"
            className={cn(
                'h-11 bg-table-band px-4 text-left align-middle text-xs font-bold tracking-wide text-table-band-foreground uppercase whitespace-nowrap',
                className,
            )}
            {...props}
        />
    )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
    return (
        <td
            data-slot="table-cell"
            className={cn('p-4 align-middle whitespace-nowrap', className)}
            {...props}
        />
    )
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
