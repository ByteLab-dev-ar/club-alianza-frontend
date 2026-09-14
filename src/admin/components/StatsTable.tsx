import type { ReactNode } from 'react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface Props {
    columns: string[]
    rows: { key: string; cells: ReactNode[] }[]
    footer: ReactNode[]
}

/**
 * La tabla gemela de un gráfico del Resumen: los mismos números, leíbles sin
 * pasar el mouse. La primera columna es el rótulo y las demás son cifras,
 * alineadas a la derecha con dígitos de ancho fijo para que se comparen de un
 * vistazo.
 */
export const StatsTable = ({ columns, rows, footer }: Props) => {
    const align = (index: number) => (index === 0 ? 'text-left' : 'text-right tabular-nums')

    return (
        // `overflow-hidden`: la banda oscura de la cabecera pinta hasta los
        // bordes y sin esto se sale de la curva de la esquina.
        <div className="overflow-hidden rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        {columns.map((column, index) => (
                            <TableHead key={column} className={align(index)}>
                                {column}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.key}>
                            {row.cells.map((cell, index) => (
                                <TableCell key={index} className={cn('py-2.5', align(index))}>
                                    {cell}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
                <tfoot className="border-t font-bold text-ink">
                    <tr>
                        {footer.map((cell, index) => (
                            <TableCell key={index} className={cn('py-2.5', align(index))}>
                                {cell}
                            </TableCell>
                        ))}
                    </tr>
                </tfoot>
            </Table>
        </div>
    )
}
