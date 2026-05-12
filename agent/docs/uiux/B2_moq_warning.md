# B2 — Desain Tampilan MOQ Warning (Starcenter)

> Tanggal: 2026-04-16
> Status: DONE

---

## Konteks

- Role `starcenter` memiliki Minimum Order Quantity (MOQ) sebesar Rp 5.000.000 per transaksi
- Validasi saat ini hanya terjadi saat klik "Place Order" di Checkout — terlalu terlambat
- User perlu diberitahu lebih awal: di CartDrawer saat mereka masih belum memenuhi MOQ

---

## Lokasi Warning: CartDrawer

### Kondisi Tampil

Warning MOQ hanya muncul jika:
1. User login dengan role `starcenter`
2. Total cart KURANG dari Rp 5.000.000

Warning TIDAK muncul (atau tampil sebagai success) jika total sudah memenuhi MOQ.

---

## Desain Warning Panel di CartDrawer

### State: Belum Memenuhi MOQ

```
Posisi: Di bawah Free Shipping Progress bar, di atas Hot Choice Timer
Background: Amber/Gold muda untuk menarik perhatian tanpa menakuti

Visual:
┌─────────────────────────────────────────────────────┐
│  ⚠  Minimum Belanja Starcenter                      │
│     Tambah Rp 3.200.000 lagi untuk memenuhi MOQ     │
│                                                      │
│  [Progress bar: 36% penuh — gold/amber]             │
│     Rp 1.800.000 / Rp 5.000.000                     │
└─────────────────────────────────────────────────────┘
```

**Tailwind spec:**
```jsx
<div className="px-5 py-3 bg-amber-50 border-b border-amber-100">
  <div className="flex items-start gap-2 mb-2">
    <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-semibold text-amber-900">Minimum Belanja Starcenter</p>
      <p className="text-xs text-amber-700 mt-0.5">
        Tambah <span className="font-bold">Rp {shortfall.toLocaleString('id-ID')}</span> lagi 
        untuk memenuhi minimum transaksi Rp 5.000.000
      </p>
    </div>
  </div>
  {/* Progress bar */}
  <div className="h-1.5 w-full bg-amber-200 rounded-full overflow-hidden">
    <div 
      className="h-full bg-amber-500 transition-all duration-500"
      style={{ width: `${Math.min((cartTotal / 5000000) * 100, 100)}%` }}
    />
  </div>
  <div className="flex justify-between text-xs text-amber-600 mt-1">
    <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
    <span>Rp 5.000.000</span>
  </div>
</div>
```

### State: MOQ Terpenuhi

```
Visual:
┌─────────────────────────────────────────────────────┐
│  ✓  Minimum Belanja Terpenuhi!                      │
│     Transaksi Anda sudah memenuhi syarat Starcenter  │
└─────────────────────────────────────────────────────┘

Background: green-50, text: green-700, icon: CheckCircle
```

---

## Desain Warning di Checkout (Order Summary)

### Persistent Banner di Atas Total

```
Posisi: Di bagian bawah order summary, di atas tombol Place Order
Hanya tampil untuk starcenter yang belum memenuhi MOQ
```

**Visual:**
```
┌─────────────────────────────────────────────────────┐
│  ⚠  MOQ belum terpenuhi                             │
│     Total Anda Rp 1.800.000 — minimum Rp 5.000.000  │
│     Kembali ke keranjang untuk menambah item.        │
└─────────────────────────────────────────────────────┘
```

Tombol "Konfirmasi Pesanan" tetap aktif (karena validasi ada di backend juga), tapi tampilkan warning dengan jelas.

Alternatif: Disable tombol jika MOQ tidak terpenuhi (lebih safe dari sisi UX), dengan teks tooltip "Lengkapi minimum belanja Starcenter terlebih dahulu."

**Rekomendasi: Disable + tooltip** — lebih aman dan mencegah confusion.

---

## Logic Penentuan Shortfall

```js
const MOQ_STARCENTER = 5000000;
const isStarcenter = userData?.role === 'starcenter';
const moqShortfall = Math.max(MOQ_STARCENTER - cartTotal, 0);
const moqFulfilled = isStarcenter ? cartTotal >= MOQ_STARCENTER : true;
```

---

## Dependency

- Perlu `useAuth()` untuk mendapatkan `userData.role`
- CartDrawer sudah punya akses ke `getCartTotal()` dari `useCart()`
- Warning ini bersifat frontend-only (backend tetap memvalidasi ulang di `OrderService`)
