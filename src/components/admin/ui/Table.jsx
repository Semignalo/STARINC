import React from 'react';
import { cn } from '../../../lib/utils';

/**
 * Table — Linear-style table dengan rows tipis, header subtle, hover row.
 * Drop-in pengganti <table>. Pakai <DataTable.Row> + <DataTable.Cell> di body.
 */
export default function DataTable({ children, className }) {
    return (
        <div className={cn('overflow-x-auto bg-white border border-gray-200 rounded-[8px]', className)}>
            <table className="w-full text-sm">
                {children}
            </table>
        </div>
    );
}

DataTable.Head = function THead({ children }) {
    return (
        <thead className="bg-gray-50/60 border-b border-gray-200">
            <tr>{children}</tr>
        </thead>
    );
};

DataTable.HeadCell = function THeadCell({ children, className, align = 'left' }) {
    return (
        <th className={cn(
            'px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500',
            align === 'right' && 'text-right',
            align === 'center' && 'text-center',
            className,
        )}>
            {children}
        </th>
    );
};

DataTable.Body = function TBody({ children }) {
    return <tbody className="divide-y divide-gray-100">{children}</tbody>;
};

DataTable.Row = function TRow({ children, className, onClick }) {
    return (
        <tr
            onClick={onClick}
            className={cn(
                'transition-colors',
                onClick && 'cursor-pointer hover:bg-gray-50',
                className,
            )}
        >
            {children}
        </tr>
    );
};

DataTable.Cell = function TCell({ children, className, align = 'left' }) {
    return (
        <td className={cn(
            'px-4 py-3 text-gray-700',
            align === 'right' && 'text-right',
            align === 'center' && 'text-center',
            className,
        )}>
            {children}
        </td>
    );
};

DataTable.Empty = function TEmpty({ children = 'Tidak ada data.', colSpan = 99 }) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-gray-400">
                {children}
            </td>
        </tr>
    );
};
