# D1 — Dashboard Admin: KPI Hierarchy & Chart Clarity

> Tanggal: 2026-04-16
> Status: DONE

---

## Evaluasi `admin/Dashboard.jsx` Saat Ini

### Yang Sudah Bagus

- 4 StatCard di atas: Revenue, Active Orders, Total Customer, Pending Payment
- Chart menggunakan Recharts: Line chart revenue bulanan + Bar chart top produk
- Tabel recent orders 10 terakhir
- Commission summary (pending vs paid)
- Komponen `StatCard` terpisah dan reusable

### Gap yang Ditemukan

1. **Hierarchy KPI kurang jelas** — semua 4 stat card terlihat sama besar, padahal "Total Pendapatan" adalah KPI paling penting dan harus paling menonjol
2. **Tidak ada periode filter** — chart tidak bisa difilter per bulan/tahun
3. **Bar chart top produk: YAxis label terpotong** — `width={150}` mungkin kurang untuk nama produk panjang
4. **Stat card "Pending Payment"** — menandakan ada yang perlu tindakan, tapi tidak ada tombol shortcut ke halaman Orders
5. **Commission summary** — bar indicator tidak bermakna (selalu "100%") karena tidak ada pembanding
6. **Tidak ada link dari recent orders table** ke halaman detail order

---

## Rekomendasi Hierarchy KPI

### Tier 1 — Paling Menonjol (Bisnis Utama)

```
[Total Pendapatan — Besar, prominent, dengan delta vs bulan lalu]
```

- Full width atau half-width pada row pertama
- Font heading lebih besar dari card lain
- Subtext: delta (+12% vs bulan lalu) jika data tersedia

### Tier 2 — Penting, Perlu Tindakan

```
[Pending Payment — dengan badge merah jika > 0]
[Active Orders — dengan shortcut ke Orders page]
```

### Tier 3 — Informatif

```
[Total Customer]
[Paid Commission]
```

---

## Layout Grid yang Direkomendasikan

```
Row 1 — Full width atau 2/3:
┌───────────────────────────────────────┬──────────────┐
│  Total Pendapatan (BESAR)             │ Pending Pay  │
│  Rp 124.500.000                       │   [badge 3]  │
│  +12% dari bulan lalu                 │              │
└───────────────────────────────────────┴──────────────┘

Row 2 — 3 kolom seimbang:
┌──────────────┬──────────────┬──────────────────────┐
│ Active Orders│Total Customer│ Pending Commissions  │
│     [12]     │    [284]     │ Rp 4.200.000         │
└──────────────┴──────────────┴──────────────────────┘
```

---

## Perbaikan StatCard

### Revenue Card (Hero)

```jsx
// StatCard versi hero — lebih besar
<div className="bg-white p-8 rounded-xl shadow-sm col-span-full md:col-span-2 border-l-4 border-[var(--color-accent)]">
  <p className="text-gray-500 text-sm font-medium mb-1">Total Pendapatan</p>
  <h2 className="text-4xl font-bold text-gray-900 mb-2">{formatCurrency(total_revenue)}</h2>
  <p className="text-sm text-green-600 flex items-center gap-1">
    <TrendingUp size={14}/> +12% dari bulan lalu
  </p>
</div>
```

### Pending Payment Card — Action Shortcut

```jsx
// Tambahkan link ke Orders page
<div className="bg-white p-6 rounded-xl shadow-sm">
  {/* ... existing content ... */}
  {pending_payments > 0 && (
    <Link to="/admin/orders?status=pending_payment" 
      className="mt-4 text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1">
      Lihat pesanan pending <ChevronRight size={12}/>
    </Link>
  )}
</div>
```

---

## Commission Summary — Perbaikan Bar

Ganti bar statis yang selalu 100% dengan bar yang bermakna:

```jsx
// Persentase pending vs total (pending + paid)
const totalCommission = pending_commissions + paid_commissions;
const pendingPercent = totalCommission > 0 ? (pending_commissions / totalCommission) * 100 : 0;

<div className="w-full bg-gray-100 h-2 rounded-full mt-2">
  <div className="bg-yellow-400 h-2 rounded-full transition-all" 
       style={{width: `${pendingPercent}%`}} />
</div>
<div className="flex justify-between text-xs text-gray-400 mt-1">
  <span>Pending {pendingPercent.toFixed(0)}%</span>
  <span>Paid {(100 - pendingPercent).toFixed(0)}%</span>
</div>
```

---

## Recent Orders Table — Klikable Row

```jsx
// Tambahkan klikable ke halaman Orders
<tr key={idx} 
    className="hover:bg-gray-50 transition-colors cursor-pointer"
    onClick={() => navigate(`/admin/orders?id=${order.order_number}`)}>
```

---

## Catatan Aksesibilitas

- Semua warna chart (biru, ungu) harus dipertimbangkan kontrasnya dengan background putih
- Tooltip Recharts sudah cukup accessible secara default
- Tambahkan `aria-label` pada tombol Refresh
