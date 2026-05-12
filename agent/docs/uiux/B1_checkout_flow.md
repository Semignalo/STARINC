# B1 — Review Alur Checkout + Progress Stepper

> Tanggal: 2026-04-16
> Status: DONE

---

## Evaluasi `Checkout.jsx` Saat Ini

### Kondisi Sekarang

**Yang sudah bagus:**
- Layout dua kolom: form kiri, order summary kanan — sudah sesuai prinsip split layout
- Form pre-filled dari userData — UX yang baik
- Kalkulasi diskon tier sudah ditampilkan
- Validasi MOQ Starcenter ada (frontend)

**Gap yang Ditemukan:**

1. **Tidak ada progress stepper** — user tidak tahu mereka di step mana
2. **Tidak ada step "Pilih Metode Pembayaran"** — langsung Place Order, lalu redirect ke Invoice. User tidak tahu harus transfer ke mana sebelum order dibuat.
3. **Tombol "Place Order" berwarna hijau** (`#047857`) — tidak konsisten dengan brand color primary (`#1A1A1A`)
4. **Tidak ada konfirmasi sebelum submit** — user bisa tidak sengaja klik Place Order
5. **Empty cart state** — sudah ada, tapi perlu tampilan yang lebih baik (task A4)
6. **Upload bukti bayar tidak ada di halaman Checkout** — ada di halaman Invoice terpisah (ini bisa diterima, tapi perlu progress stepper agar user paham flow-nya)

---

## Redesign: Alur Checkout Baru

### Flow 3 Step

```
[Step 1: Shipping Details] → [Step 2: Review Order] → [Step 3: Payment Info]
```

Step 3 hanya menampilkan instruksi pembayaran dan nomor rekening sebelum order dibuat, lalu redirect ke Invoice untuk upload bukti.

Namun mengingat kompleksitas, **rekomendasi pragmatis** untuk saat ini adalah:

**Tetap 1 halaman dengan progress indicator yang jelas:**

```
Cart → [Checkout] → Invoice (upload bukti bayar)
```

Tambahkan mini breadcrumb/stepper di atas halaman Checkout:

---

## Desain Progress Stepper

### Spesifikasi Komponen

```
Struktur:
[Step 1: Keranjang ✓] → [Step 2: Pengiriman •] → [Step 3: Pembayaran ○]

Visual:
- Setiap step: lingkaran kecil + label
- Completed: bg primary (hitam), centang putih
- Current: bg accent (gold), nomor putih, ring outline
- Future: bg gray-200, nomor gray-500
- Connector garis: bg-gray-200, completed connector: bg primary

Posisi: di atas form, sebelum h2 "Shipping Details"
```

**Tailwind Reference:**
```jsx
// Step indicator item
<div className="flex items-center">
  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
    ${isCompleted ? 'bg-[var(--color-primary)] text-white' :
      isCurrent ? 'bg-[var(--color-accent)] text-white ring-2 ring-[var(--color-accent-light)]' :
      'bg-gray-200 text-gray-500'
    }`}>
    {isCompleted ? <Check size={14}/> : stepNumber}
  </div>
  <span className="ml-2 text-sm font-medium text-gray-600">{label}</span>
</div>
// Connector
<div className={`flex-1 h-0.5 mx-3 ${isCompleted ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`}/>
```

---

## Layout Checkout yang Direkomendasikan

```
[Breadcrumb: Home / Products / Cart / Checkout]

[Progress Stepper: 3 steps]

[Grid 2 kolom (md:)]
  [Kiri - Shipping Details form]
    Label: "Step 2 of 3 — Shipping Details"
    [Form fields: existing]
    [Payment Method info (static, saat ini hanya transfer manual)]
    [Button: "Lanjut ke Pembayaran" — bukan "Place Order"]
    → Klik button = buat order → redirect ke Invoice

  [Kanan - Order Summary]
    [Item list with images]
    [Subtotal]
    [Tier Discount (jika ada)]
    [Shipping]
    [MOQ Warning (jika starcenter dan belum memenuhi)]
    [Total BESAR]
```

---

## Perubahan Spesifik untuk Frontend

| Item | Perubahan |
|------|-----------|
| Tombol CTA | Ganti `bg-[#047857]` ke `bg-[var(--color-primary)]` |
| Teks tombol | Ganti "Place Order" ke "Konfirmasi Pesanan" |
| Progress stepper | Tambahkan komponen baru `<CheckoutStepper step={2} />` |
| MOQ Warning | Tampilkan di order summary (bukan hanya saat submit), lihat B2 |
| Breadcrumb | Tambahkan breadcrumb sederhana di atas halaman |

---

## Catatan untuk B2 (MOQ Warning)

MOQ warning harus muncul di dua tempat:
1. Di CartDrawer saat total belum memenuhi MOQ (B2)
2. Di Order Summary checkout — persistent, tidak menunggu submit

Lihat dokumen B2 untuk spesifikasi detail.
