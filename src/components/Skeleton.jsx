import React from 'react';
import { cn } from '../lib/utils';

/**
 * Skeleton - Base skeleton block yang bisa dikombinasikan.
 *
 * @param {string} className - Class tambahan untuk kustomisasi ukuran/bentuk
 */
export function Skeleton({ className }) {
    return (
        <div
            className={cn(
                'animate-pulse bg-gray-200 rounded',
                className
            )}
            aria-hidden="true"
        />
    );
}

/**
 * ProductCardSkeleton - Skeleton placeholder untuk ProductCard.
 * Digunakan di Catalog dan halaman Home saat data belum tersedia.
 */
export function ProductCardSkeleton() {
    return (
        <div aria-hidden="true">
            {/* Gambar */}
            <div className="aspect-[3/4] bg-gray-200 animate-pulse rounded mb-4" />
            {/* Category */}
            <Skeleton className="h-3 w-16 mb-2" />
            {/* Title */}
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-3" />
            {/* Price */}
            <Skeleton className="h-5 w-32" />
        </div>
    );
}

/**
 * ProductCardSkeletonGrid - Grid dari beberapa ProductCardSkeleton.
 *
 * @param {number} count - Jumlah skeleton yang ditampilkan (default 8)
 */
export function ProductCardSkeletonGrid({ count = 8 }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * OrderRowSkeleton - Skeleton untuk satu baris di tabel riwayat pesanan.
 */
export function OrderRowSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0" aria-hidden="true">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
        </div>
    );
}

/**
 * OrderRowSkeletonList - Beberapa baris OrderRowSkeleton.
 *
 * @param {number} count - Jumlah skeleton (default 5)
 */
export function OrderRowSkeletonList({ count = 5 }) {
    return (
        <div>
            {Array.from({ length: count }).map((_, i) => (
                <OrderRowSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * CommissionRowSkeleton - Skeleton untuk satu baris di tabel komisi.
 */
export function CommissionRowSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0" aria-hidden="true">
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
        </div>
    );
}

/**
 * CommissionRowSkeletonList - Beberapa baris CommissionRowSkeleton.
 *
 * @param {number} count - Jumlah skeleton (default 5)
 */
export function CommissionRowSkeletonList({ count = 5 }) {
    return (
        <div>
            {Array.from({ length: count }).map((_, i) => (
                <CommissionRowSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * TableRowSkeleton - Skeleton generik untuk satu baris tabel admin.
 *
 * @param {number} cols - Jumlah kolom (default 5)
 */
export function TableRowSkeleton({ cols = 5 }) {
    return (
        <tr aria-hidden="true">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="p-4">
                    <Skeleton className={`h-4 ${i === 0 ? 'w-40' : 'w-24'}`} />
                </td>
            ))}
        </tr>
    );
}

/**
 * TableSkeletonRows - Beberapa baris TableRowSkeleton untuk tabel admin.
 *
 * @param {number} rows - Jumlah baris (default 5)
 * @param {number} cols - Jumlah kolom (default 5)
 */
export function TableSkeletonRows({ rows = 5, cols = 5 }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRowSkeleton key={i} cols={cols} />
            ))}
        </>
    );
}

export default Skeleton;
