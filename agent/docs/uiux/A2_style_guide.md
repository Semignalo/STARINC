# A2 — Style Guide Komponen UI

> Tanggal: 2026-04-16
> Status: DONE (Updated 2026-04-16)

---

## Design Tokens (dari src/index.css @theme)

### Colors
| Token | Value | Penggunaan |
|-------|-------|-----------|
| `--color-primary` | `#1A1A1A` | Text utama, background CTA utama |
| `--color-accent` | `#C5A059` | Soft Gold — accent, highlight, badge promo |
| `--color-accent-light` | `#E5D1A3` | Background hover nav links |
| `--color-accent-dark` | `#997B3D` | Hover state accent CTA |
| `--color-sale` | `#E53E3E` | Badge diskon, alert danger |
| `--color-muted` | `#F9FAFB` | Background section netral |
| `--color-muted-foreground` | `#6B7280` | Label sekunder, placeholder |

### Typography
| Token | Font | Penggunaan |
|-------|------|-----------|
| `--font-sans` | Outfit | Body text, labels, UI |
| `--font-serif` | Playfair Display | Headings, brand voice |

---

## Button Variants

### Primary (dark)
```
bg-[var(--color-primary)] text-white font-bold py-3 px-6 rounded-sm
hover:bg-gray-800 transition-colors uppercase tracking-widest text-sm min-h-[44px]
```

### CTA Green (Checkout)
```
bg-[#047857] hover:bg-[#065F46] text-white font-bold py-3.5 rounded-sm
shadow-md transition-colors uppercase tracking-widest text-sm min-h-[44px]
```

### Accent (gold)
```
bg-[var(--color-accent)] text-white font-bold px-4 py-2 rounded-lg
hover:bg-[var(--color-accent-dark)] transition-colors
```

### Secondary
```
bg-white border border-gray-300 hover:bg-gray-50 text-gray-900
font-bold py-3 rounded-sm transition-colors uppercase tracking-widest text-sm
```

### Danger
```
bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg
transition-colors min-h-[44px]
```

### Disabled (semua variant)
```
bg-gray-300 text-gray-500 cursor-not-allowed
```

---

## Input Field Standard

### Public pages
```
w-full px-4 py-2 border border-gray-200 rounded-sm
focus:outline-none focus:ring-1 focus:ring-black focus:border-black
```

### Admin panel
```
w-full px-4 py-2 border border-gray-200 rounded-lg
focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20
focus:border-[var(--color-accent)] transition-all
```

### Label
```
block text-sm font-medium text-gray-700 mb-1
```

---

## Card Variants

| Tipe | Classes |
|------|---------|
| Product Card | `border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow` |
| Admin Stat Card | `bg-white p-6 rounded-xl shadow-sm` |
| Content Card | `bg-white p-6 md:p-8 rounded-lg border border-gray-100 shadow-sm` |
| Dark Hero Card | `bg-[#111827] text-white rounded-2xl p-8` |

---

## Badge: Order Status

| Status | Classes |
|--------|---------|
| Selesai | `bg-green-100 text-green-700 border-green-200` |
| Pending Payment | `bg-yellow-100 text-yellow-800 border-yellow-200` |
| Diproses | `bg-blue-100 text-blue-800 border-blue-200` |
| Dikirim | `bg-purple-100 text-purple-800 border-purple-200` |
| Ditolak | `bg-red-100 text-red-800 border-red-200` |

Base: `px-2.5 py-1 rounded-full text-xs font-medium border`

---

## Modal Standard

### ConfirmModal (Destructive) — IMPLEMENTED
- File: `src/components/ui/ConfirmModal.jsx`
- Props: `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `confirmLabel`, `cancelLabel`, `variant`, `loading`
- Variant: `"danger"` (merah) | `"warning"` (amber)
- Semua tombol min 44x44px

---

## MOQ Warning (Starcenter) — IMPLEMENTED

- Threshold: Rp 5.000.000
- Lokasi: `src/components/CartDrawer.jsx`
- State belum: `bg-amber-50` + icon AlertTriangle + progress bar kuning
- State terpenuhi: `bg-emerald-50` + icon ShieldCheck + progress bar hijau
- Tombol checkout di-disable jika MOQ belum terpenuhi
- Warning banner juga tampil di `src/pages/Checkout.jsx`

---

## Checkout Progress Stepper — IMPLEMENTED

- File: `src/pages/Checkout.jsx` (komponen `CheckoutStepper`)
- 3 steps: Shipping (step 1) → Review (step 2) → Payment (step 3)
- Active: dark circle + ring
- Completed: green circle + CheckCircle2 icon
- Connector line berubah hijau saat step selesai

---

## Touch Target Standard (WCAG AA)

Minimum: **44x44px**

Pattern:
```
min-w-[44px] min-h-[44px] flex items-center justify-center
```

Berlaku di: Navbar buttons, CartDrawer remove/qty, admin icon buttons, mobile nav links

---

## Admin Data Table Filter Tabs — IMPLEMENTED

- File: `src/pages/admin/Orders.jsx`
- "Semua" tab + count pill
- Per-status tabs dengan count pill
- Active: `bg-gray-800 text-white`
- Inactive: `bg-white border border-gray-200 text-gray-600 hover:bg-gray-50`

---

## Admin Dashboard Alert — IMPLEMENTED

- File: `src/pages/admin/Dashboard.jsx`
- Alert pending payments muncul di atas stats ketika ada order pending
- Commission bar menggunakan ratio proporsional (bukan always 100%)

---

## Pending Implementation (Next Sprint)

- A3: Skeleton loading pattern
- A4: Empty state illustrations
- B3: Cart Drawer UX improvements (real-time total)
- B4: Invoice printable page
- B5: Order status timeline
- C3: Referral link sharing UI
- D3: Bulk action pattern (commission pay)
- E3: WCAG AA contrast audit
- E4: Keyboard navigation audit
- F1: Login/Register redesign

---

## Prinsip Dasar

- Stack: React 19 + Tailwind CSS v4
- Icon set: `lucide-react` (jangan campur dengan icon set lain)
- Referensi desain: Aesop (editorial, spacing, typography) + The Act (struktur, usability)
- Tone: Clean, minimal, modern. Whitespace strategis.

---

## 1. Button

### Varian

#### Primary (CTA Utama)
```
bg: #1A1A1A (--color-primary)
text: white
hover: opacity-90 atau bg satu shade lebih terang
padding: px-6 py-3 (desktop), px-4 py-3 (mobile min 44px height)
border-radius: rounded-sm (storefront), rounded-lg (admin)
font: font-bold text-sm uppercase tracking-widest
```

**Contoh Tailwind:**
```
className="bg-[var(--color-primary)] hover:opacity-90 text-white font-bold text-sm uppercase tracking-widest px-6 py-3 rounded-sm transition-opacity"
```

#### Secondary (Aksi Minor)
```
bg: white
border: 1px solid gray-300
text: gray-900
hover: bg-gray-50
padding: sama dengan primary
```

#### Accent (Highlight Action)
```
bg: #C5A059 (--color-accent)
text: white
hover: bg-[var(--color-accent-dark)]
```

#### Destructive (Hapus, Cancel)
```
bg: white
border: 1px solid #EF4444
text: #EF4444
hover: bg-red-50
```
- Selalu diikuti modal konfirmasi berlapis (lihat bagian D4)

#### Ghost (Link-like)
```
bg: transparent
text: gray-600
hover: text-gray-900 bg-gray-100
padding: px-3 py-2
```

### Touch Target
- Minimum height: `min-h-[44px]` untuk semua tombol interaktif
- Mobile: gunakan `py-3` minimal atau `h-11`

---

## 2. Input & Form

### Text Input
```
border: 1px solid gray-200
border-radius: rounded-sm (storefront), rounded-lg (admin)
padding: px-4 py-2 (storefront), px-3 py-2 (admin)
focus: focus:outline-none focus:ring-1 focus:ring-black focus:border-black
placeholder: text-gray-400
```

**Catatan saat ini:** `Checkout.jsx` sudah menggunakan pattern ini dengan benar. Jadikan ini standar.

### Select / Dropdown
```
border: 1px solid gray-200
padding: px-4 py-2
appearance: default browser (atau custom dengan chevron icon)
focus: sama dengan input
```

### Textarea
```
resize: resize-none (hindari layout shift)
rows: minimal 3
```

### Label
```
font: text-sm font-medium text-gray-700
margin: mb-1 (di bawah label, di atas input)
```

### Error State
```
border: border-red-400
text error: text-xs text-red-500 mt-1
```

### Helper Text
```
text-xs text-gray-500 mt-1
```

---

## 3. Card

### Product Card (Storefront)
```
bg: white
border: 1px solid gray-100
shadow: shadow-sm
hover: shadow-md, translate-y-[-2px]
border-radius: rounded-sm atau rounded-md
overflow: hidden (untuk image crop)
```

**Struktur:**
```
[Image Area - aspect-ratio 1:1 atau 4:3]
[Content Area: padding p-4]
  [Category badge - text-xs uppercase tracking]
  [Title - font-serif text-lg]
  [Price - font-bold]
  [CTA Button - full width]
```

### Admin Stat Card
```
bg: white
border-radius: rounded-xl
shadow: shadow-sm
padding: p-6
```

**Struktur:**
```
[Left: label text-sm text-gray-500, value text-2xl font-bold, subtext text-xs]
[Right: icon dengan bg warna rounded-lg p-3]
```

### Info Card / Section Card
```
bg: gray-50 atau white
border: 1px solid gray-100
border-radius: rounded-lg
padding: p-4 atau p-6
```

---

## 4. Badge / Pill

### Status Badge (Order)
```
pending_payment: bg-yellow-100 text-yellow-800 border-yellow-200
awaiting_confirmation: bg-blue-100 text-blue-800 border-blue-200
completed: bg-green-100 text-green-700
cancelled: bg-red-100 text-red-700
```

**Pattern:**
```
className="px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1"
```

### Role Badge
```
admin: bg-red-100 text-red-700
starcenter: bg-yellow-100 text-yellow-800
regular: bg-gray-100 text-gray-600
```

### Discount Badge (Product)
```
bg: #E53E3E (--color-sale)
text: white
font: text-xs font-bold
padding: px-2 py-0.5
border-radius: rounded-sm
position: absolute top-2 left-2 (di atas product image)
```

---

## 5. Modal

### Modal Standar
```
backdrop: fixed inset-0 bg-black/50 backdrop-blur-sm z-50
container: bg-white rounded-xl shadow-2xl w-full max-w-[size] max-h-[90vh]
flex: flex flex-col
```

**Struktur:**
```
[Header: px-6 py-4 border-b] — judul + tombol close
[Body: flex-1 overflow-y-auto px-6 py-4] — konten scrollable
[Footer: px-6 py-4 border-t bg-gray-50] — action buttons
```

**Ukuran standar:**
- Small: `max-w-md` — konfirmasi, alert
- Medium: `max-w-xl` — form isian
- Large: `max-w-3xl` — detail pesanan, detail produk

### Modal Konfirmasi Destruktif (D4)
```
max-w: max-w-md
icon: ikon warning merah di tengah (AlertTriangle)
judul: text merah atau bold
```

**Copy standar:**
- Aksi hapus produk: "Hapus produk ini secara permanen? Tindakan ini tidak dapat diurungkan."
- Cancel order: "Batalkan pesanan #XXX? Komisi yang terkait akan dibatalkan otomatis."
- Downgrade role: "Ubah role user [nama] ke [role]? Ini akan mempengaruhi akses dan sistem komisi."

**Tombol:**
- Cancel: button secondary di kiri
- Confirm: button destructive di kanan, perlu ketik ulang nama/ID untuk aksi paling kritis (opsional untuk fase awal)

---

## 6. Data Table (Admin)

### Struktur Standar

```
[Table Header Area]
  [Left: judul halaman + deskripsi singkat]
  [Right: Search input + Filter dropdown + Action button (Export, Add New)]

[Table Container: bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden]
  [thead: bg-gray-50 text-gray-600 text-sm font-medium]
  [tbody: divide-y divide-gray-100]
    [tr hover: hover:bg-gray-50 transition-colors]
    [td: p-4 text-sm]

[Pagination: flex items-center justify-between px-4 py-3 border-t]
```

### Search Input
```
placeholder: "Cari [konteks]..."
icon: Search di kiri (absolute positioned)
padding: pl-10 pr-4 py-2
width: w-64 (desktop), w-full (mobile)
```

### Sort Header
```
Kolom sortable: kursor pointer, icon ChevronUp/ChevronDown
Active sort: text-gray-900 font-semibold
```

### Pagination
```
[Prev Button] [1] [2] [3] ... [N] [Next Button]
Info: "Menampilkan 1-20 dari 150 hasil"
Per-page selector: 20, 50, 100
```

---

## 7. Loading States

### Spinner (Data Load)
```
<RefreshCw className="animate-spin text-gray-400" size={32} />
Posisi: flex items-center justify-center min-h-[300px]
```

### Skeleton Card (akan dikerjakan di A3)
- Gunakan `animate-pulse` Tailwind
- Placeholder abu-abu `bg-gray-200 rounded`

---

## 8. Empty State

Struktur umum (akan dikerjakan di A4):
```
[Ikon abu-abu besar — ukuran 64px]
[Judul: text-lg font-medium text-gray-500]
[Deskripsi: text-sm text-gray-400 max-w-xs text-center]
[CTA button (opsional)]
```

---

## 9. Toast / Notification

Saat ini menggunakan SweetAlert2 (`Swal`). Pertahankan untuk sekarang, tapi di masa depan pertimbangkan beralih ke toast library yang lebih ringan (react-hot-toast atau sonner).

**Pola standar saat ini:**
- Success: `icon: 'success', timer: 2000, showConfirmButton: false`
- Error: `icon: 'error', confirmButtonColor: '#111827'`
- Warning (MOQ): `icon: 'warning', confirmButtonColor: '#111827'`

---

## 10. Navigation

### Navbar (Public)
- Background: white dengan shadow saat scroll
- Logo: kiri
- Menu: tengah (desktop) / hamburger (mobile)
- Cart icon + User icon: kanan

### Admin Sidebar
- Background: `#111827`
- Active item: `bg-[#1F2937] + border-l-4 border-[var(--color-accent)]`
- Icon + label side-by-side
- Fixed position, lebar w-64
- Main content: `ml-64`

**Catatan:** Admin sidebar belum responsive di mobile — ini termasuk dalam task E1 (mobile-first audit).
