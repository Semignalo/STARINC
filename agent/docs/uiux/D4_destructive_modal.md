# D4 — Modal Konfirmasi Destruktif

> Tanggal: 2026-04-16
> Status: DONE

---

## Evaluasi Kondisi Saat Ini

### Aksi Destruktif yang Ada di Codebase

| Aksi | Halaman | Konfirmasi Sekarang |
|------|---------|---------------------|
| Hapus produk | Products.jsx | SweetAlert2 confirm (1 step) |
| Cancel order | Orders.jsx | Langsung update status (tidak ada konfirmasi) |
| Update status order | Orders.jsx | Langsung update (tidak ada konfirmasi) |
| Delete user | Users (admin) | Belum dicek |
| Pay commission | Commissions | Tidak diketahui |
| Downgrade/upgrade role user | Users | Tidak diketahui |

**Masalah Utama:**
- Menggunakan SweetAlert2 yang gaya visualnya tidak selaras dengan design system
- Beberapa aksi destruktif tidak memiliki konfirmasi sama sekali (cancel order)
- Tidak ada perbedaan visual antara konfirmasi normal vs destruktif

---

## Prinsip Konfirmasi Destruktif

### Tier Risiko

| Tier | Contoh Aksi | Konfirmasi |
|------|-------------|------------|
| Low | Update status pesanan | Tidak perlu modal (langsung) |
| Medium | Hapus produk, cancel order | Modal konfirmasi 1 langkah |
| High | Hapus user, pay commission bulk | Modal konfirmasi 2 langkah |
| Critical | Hapus data finansial/komisi | Modal konfirmasi + ketik ulang |

---

## Desain Modal Konfirmasi Standard

### Varian: Medium Risk (Hapus Produk, Cancel Order)

```
┌────────────────────────────────────────────┐
│  [X]                                        │
│                                             │
│  [Icon: AlertTriangle — merah, 48px]        │
│                                             │
│  Hapus Produk Ini?                          │
│  (text-lg font-bold text-gray-900)         │
│                                             │
│  Produk "Serum Vitamin C" akan dihapus      │
│  secara permanen. Tindakan ini tidak dapat  │
│  diurungkan.                                │
│  (text-sm text-gray-500, max-w text-center) │
│                                             │
│  [Batal]         [Ya, Hapus]               │
│  (secondary)     (destructive bg-red-600)   │
└────────────────────────────────────────────┘
```

**Spec:**
- `max-w-sm` (lebih kecil dari modal normal)
- Icon: `<AlertTriangle className="text-red-500" size={48} />`
- Backdrop: `bg-black/50 backdrop-blur-sm`
- Tombol destructive: `bg-red-600 hover:bg-red-700 text-white`

---

### Varian: High Risk (Pay Commission Bulk, Update Role)

```
┌────────────────────────────────────────────┐
│  Bayar 12 Komisi Sekaligus?                │
│                                             │
│  Total yang akan dibayarkan:               │
│  Rp 4.200.000 kepada 8 member              │
│                                             │
│  Tindakan ini tidak dapat dibatalkan.      │
│  Pastikan dana sudah disiapkan.            │
│                                             │
│  [Checklist] Saya memahami risiko ini      │
│                                             │
│  [Batal]      [Konfirmasi Pembayaran]      │
│                (disabled sampai checkbox)   │
└────────────────────────────────────────────┘
```

**Tambahan:** Checkbox wajib dicentang sebelum tombol konfirmasi aktif.

---

### Implementasi Komponen

```jsx
// src/components/admin/ConfirmDialog.jsx
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "default", // "default" | "destructive" | "high-risk"
  requireCheckbox = false,
  checkboxLabel = "Saya memahami risiko ini",
  loading = false
}) {
  const [checked, setChecked] = useState(false);
  
  if (!open) return null;
  
  const isDestructive = variant === "destructive" || variant === "high-risk";
  const isDisabled = loading || (requireCheckbox && !checked);
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {isDestructive 
            ? <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={32}/>
              </div>
            : <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="text-amber-500" size={32}/>
              </div>
          }
        </div>
        
        {/* Content */}
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{description}</p>
        
        {/* Checkbox (high-risk) */}
        {requireCheckbox && (
          <label className="flex items-start gap-3 mb-6 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={checked} 
              onChange={e => setChecked(e.target.checked)}
              className="mt-0.5 accent-[var(--color-accent)]"
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
              {checkboxLabel}
            </span>
          </label>
        )}
        
        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium 
                       text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDisabled}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${isDestructive 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-[var(--color-primary)] hover:bg-gray-800'
                        }`}
          >
            {loading ? <RefreshCw size={16} className="animate-spin mx-auto"/> : confirmLabel}
          </button>
        </div>
        
      </div>
    </div>
  );
}
```

---

## Penggunaan di Halaman Admin

### Hapus Produk (Medium Risk)

```jsx
<ConfirmDialog
  open={showDeleteConfirm}
  onClose={() => setShowDeleteConfirm(false)}
  onConfirm={handleDeleteProduct}
  variant="destructive"
  title="Hapus Produk Ini?"
  description={`Produk "${productToDelete?.title}" akan dihapus permanen.`}
  confirmLabel="Ya, Hapus"
  loading={deleting}
/>
```

### Cancel Order (Medium Risk)

```jsx
<ConfirmDialog
  open={showCancelConfirm}
  onClose={() => setShowCancelConfirm(false)}
  onConfirm={handleCancelOrder}
  variant="destructive"
  title="Batalkan Pesanan?"
  description={`Pesanan #${order.order_number} akan dibatalkan. Komisi terkait akan dibatalkan otomatis.`}
  confirmLabel="Ya, Batalkan"
/>
```

### Bulk Pay Commission (High Risk)

```jsx
<ConfirmDialog
  open={showBulkPayConfirm}
  onClose={() => setShowBulkPayConfirm(false)}
  onConfirm={handleBulkPay}
  variant="high-risk"
  title={`Bayar ${selectedCount} Komisi?`}
  description={`Total: ${formatCurrency(totalAmount)} kepada ${uniqueRecipients} member. Tindakan ini tidak dapat dibatalkan.`}
  confirmLabel="Konfirmasi Pembayaran"
  requireCheckbox={true}
  checkboxLabel="Saya sudah memverifikasi data dan menyiapkan dana"
/>
```

---

## Migrasi dari SweetAlert2

SweetAlert2 boleh tetap digunakan untuk:
- Notifikasi success/error (toast-style)
- Informational alert

SweetAlert2 sebaiknya DIGANTI dengan `ConfirmDialog` untuk:
- Semua aksi yang bersifat destruktif atau permanen
- Tujuan: konsistensi visual dengan design system brand
