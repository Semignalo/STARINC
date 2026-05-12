# D2 — Standarisasi UX Data Table Admin

> Tanggal: 2026-04-16
> Status: DONE

---

## Evaluasi Halaman yang Ada

| Halaman | Search | Filter | Sort | Pagination | Status |
|---------|--------|--------|------|------------|--------|
| Orders.jsx | Ada (search by ID/nama) | Tidak ada | Tidak ada | Tidak ada | Partial |
| Products.jsx | Tidak ada | Tidak ada | Tidak ada | Tidak ada | Minimal |
| Users (admin) | Tidak dievaluasi | Tidak ada | Tidak ada | Tidak ada | Minimal |
| Commissions.jsx | Tidak dievaluasi | Tidak ada | Tidak ada | Tidak ada | Minimal |

**Kesimpulan:** Belum ada standar tabel yang konsisten. Setiap halaman punya implementasi berbeda.

---

## Standar Tabel Admin

### Struktur Lengkap

```
[Page Header: judul + deskripsi singkat]

[Table Toolbar]
  ├── [Search Input — kiri]
  ├── [Filter Dropdown(s) — tengah, opsional per halaman]  
  └── [Action Buttons — kanan: Export, + Tambah Baru]

[Table Container: bg-white rounded-xl shadow-sm border border-gray-100]
  ├── [thead: sticky, bg-gray-50]
  │     [th: sortable dengan ikon]
  ├── [tbody: divide-y divide-gray-100]
  │     [tr: hover:bg-gray-50, min-height 60px]
  │     [td: p-4 text-sm]
  └── [Pagination]
        [Prev] [1] [2] ... [N] [Next]
        "Menampilkan 1-20 dari 150"
```

---

## Komponen Toolbar

### Search Input Standard

```jsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
  <input
    type="text"
    placeholder="Cari..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 
               focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 
               focus:border-[var(--color-accent)] transition-all"
  />
</div>
```

### Filter Dropdown Standard

```jsx
<select
  value={filterValue}
  onChange={(e) => setFilterValue(e.target.value)}
  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600
             focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
>
  <option value="">Semua Status</option>
  {/* ... options */}
</select>
```

---

## Filter per Halaman

### Orders
- Filter Status: Semua | pending_payment | awaiting_confirmation | completed | cancelled
- Filter Tanggal: Semua | Hari ini | 7 hari | 30 hari | Range custom (opsional)

### Products
- Filter Kategori: Semua | [kategori yang ada]
- Filter: Aktif | Promo

### Users
- Filter Role: Semua | regular | starcenter | admin
- Filter Tier: Semua | [tier yang ada]

### Commissions
- Filter Status: Semua | pending | paid | cancelled
- Filter Level: Semua | Level 1 | Level 2 | ... | Level 7

---

## Sortable Columns

### Implementasi Sort Header

```jsx
const SortableHeader = ({ label, field, currentSort, onSort }) => (
  <th 
    className="p-4 text-left font-medium text-gray-600 text-sm cursor-pointer hover:text-gray-900 
               select-none group"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center gap-1">
      {label}
      <span className="text-gray-400 group-hover:text-gray-600">
        {currentSort.field === field ? (
          currentSort.dir === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>
        ) : (
          <ChevronsUpDown size={14} className="opacity-40"/>
        )}
      </span>
    </div>
  </th>
);
```

### Kolom Sortable per Halaman

| Halaman | Kolom Sortable Default |
|---------|----------------------|
| Orders | Tanggal (desc), Total (desc) |
| Products | Nama (asc), Harga, Terjual |
| Users | Nama (asc), Bergabung (desc), Spending (desc) |
| Commissions | Tanggal (desc), Jumlah (desc), Level |

---

## Pagination Standard

```jsx
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, perPage }) => (
  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
    <p className="text-sm text-gray-500">
      Menampilkan {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, totalItems)} dari {totalItems} hasil
    </p>
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-sm rounded-md border border-gray-200 disabled:opacity-40 
                   hover:bg-gray-100 transition-colors"
      >
        Prev
      </button>
      {/* Page numbers — tampilkan max 5 */}
      {pageNumbers.map(n => (
        <button
          key={n}
          onClick={() => onPageChange(n)}
          className={`w-8 h-8 text-sm rounded-md ${n === currentPage 
            ? 'bg-[var(--color-primary)] text-white' 
            : 'hover:bg-gray-100 text-gray-600'}`}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-sm rounded-md border border-gray-200 disabled:opacity-40 
                   hover:bg-gray-100 transition-colors"
      >
        Next
      </button>
    </div>
  </div>
);
```

**Per-page selector:** 20, 50, 100 (default: 20)

---

## Loading State Table

```jsx
// Skeleton rows
{loading && Array(5).fill(0).map((_, i) => (
  <tr key={i} className="animate-pulse">
    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-3/4"/></td>
    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/2"/></td>
    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-2/3"/></td>
    <td className="p-4"><div className="h-6 bg-gray-200 rounded-full w-20"/></td>
  </tr>
))}
```

---

## Empty State Table

```jsx
{!loading && filteredData.length === 0 && (
  <tr>
    <td colSpan={columnCount} className="py-16 text-center">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <InboxIcon size={48} className="text-gray-200"/>
        <p className="text-base font-medium text-gray-500">
          {searchTerm ? 'Tidak ada hasil yang cocok' : 'Belum ada data'}
        </p>
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-sm text-[var(--color-accent)] hover:underline">
            Reset pencarian
          </button>
        )}
      </div>
    </td>
  </tr>
)}
```

---

## Rekomendasi Implementasi Shared Component

Buat `src/components/admin/DataTable.jsx` yang menerima:

```
Props:
- columns: [{key, label, sortable, render}]
- data: array
- loading: boolean
- searchTerm + onSearchChange
- filters: [{key, label, options}] (optional)
- pagination: {currentPage, totalPages, totalItems, perPage, onChange}
- onSort: {field, dir, onChange}
- emptyText: string
```

Ini memungkinkan konsistensi di semua halaman admin tanpa mengulang kode.
