# UI/UX Audit & Implementation Report

> Proyek: SDP-V2 (E-commerce + MLM Platform)
> Tanggal: 2026-04-16
> Agent: UI/UX Designer

---

## 1. Hasil Audit

### A. Design Tokens (A1)

**Status: SELESAI — dokumentasi**

File `src/index.css` menggunakan Tailwind CSS 4 dengan `@theme` directive. Token sudah terdefinisi dengan baik:

- Primary: `#1A1A1A` (near-black)
- Accent: `#C5A059` (Soft Gold/Champagne)
- Typography: Outfit (sans) + Playfair Display (serif)
- Warna sale, muted, foreground sudah ada

**Temuan:** Tidak ada token spacing custom — mengandalkan Tailwind defaults. Ini cukup baik untuk konsistensi.

**Masalah:** Beberapa halaman (Checkout, CartDrawer CTA button) menggunakan hardcoded `#047857` (emerald green) untuk tombol checkout yang tidak masuk dalam token sistem. Rekomendasi: tambahkan `--color-cta` token.

---

### B. Checkout Flow (B1)

**Status: DIIMPLEMENTASIKAN**

**Temuan sebelum:**
- Tidak ada progress indicator — user tidak tahu sedang di tahap mana
- Layout sudah 2-kolom di tablet/desktop (cukup baik)
- Form langsung muncul tanpa context visual

**Perubahan yang dilakukan:**
- Menambahkan `CheckoutStepper` component di atas form
- 3 steps: Shipping → Review → Payment dengan ikon MapPin, ShoppingBag, CreditCard
- Step aktif diberi dark ring, step selesai diberi warna hijau dengan CheckCircle2
- Connector line berubah hijau saat step terkait selesai

**Catatan:** Stepper saat ini static di step 1 karena checkout flow single-page. Untuk multi-step checkout di masa depan, bisa diextend dengan state management.

---

### C. MOQ Warning Starcenter (B2)

**Status: DIIMPLEMENTASIKAN**

**Temuan sebelum:**
- CartDrawer tidak ada warning MOQ sama sekali
- User starcenter baru tahu MOQ saat klik checkout, dapat SweetAlert warning
- UX yang buruk: user sudah punya intent checkout tapi baru tahu ada masalah

**Perubahan yang dilakukan:**

**CartDrawer:**
- Menambahkan konstanta `MOQ_THRESHOLD = 5000000`
- Import `useAuth` untuk deteksi role starcenter
- MOQ warning banner muncul di antara free shipping progress dan hot timer
- 2 state visual: amber (belum terpenuhi) dan emerald (terpenuhi)
- Progress bar menunjukkan persentase pencapaian MOQ
- Counter "Rp X / Rp 5.000.000" untuk transparansi
- Tombol Checkout di-disable + label berubah jika MOQ belum terpenuhi

**Checkout.jsx:**
- Warning banner di atas form shipping jika user starcenter dengan subtotal kurang
- Tombol "Place Order" di-disable + label "MOQ Belum Terpenuhi"
- Validasi redundan — backend juga validasi

---

### D. Admin Dashboard (D1)

**Status: DIIMPLEMENTASIKAN**

**Temuan sebelum:**
- Tidak ada alert visual untuk pending payments yang mendesak
- Commission summary bar selalu 100% width (tidak proporsional — menyesatkan)
- Dashboard title tanpa subtitle

**Perubahan yang dilakukan:**
- Alert banner kuning muncul di atas stats ketika `pending_payments > 0`
- Alert berisi jumlah pembayaran pending + CTA link ke Orders
- Commission bar menggunakan ratio proporsional terhadap total komisi
- Persentase ditampilkan di samping label
- Baris total komisi ditambahkan di bawah summary
- Subtitle "Ringkasan performa bisnis hari ini" ditambahkan

---

### E. Orders Admin — Filter Tabs (D2)

**Status: DIIMPLEMENTASIKAN**

**Temuan sebelum:**
- Hanya ada search bar, tidak ada filter status
- Tidak ada indikasi jumlah order per status

**Perubahan yang dilakukan:**
- Menambahkan `statusFilter` state
- Filter tabs: "Semua" + 5 status (Menunggu Pembayaran, Pesanan Diproses, Dikirim, Selesai, Ditolak)
- Count pill di setiap tab
- Filter bekerja bersama search (AND logic)
- Tabs bisa di-scroll horizontal di mobile (overflow-x-auto)

---

### F. Destructive Confirm Modal (D4)

**Status: DIIMPLEMENTASIKAN — komponen baru**

**Temuan sebelum:**
- Hapus produk menggunakan SweetAlert2 langsung (tidak konsisten, tidak dapat dikontrol tampilannya)
- Tidak ada komponen reusable untuk konfirmasi destruktif

**Perubahan yang dilakukan:**
- Membuat `src/components/ui/ConfirmModal.jsx`
- Props: `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `confirmLabel`, `cancelLabel`, `variant`, `loading`
- Variant: `"danger"` (merah) untuk delete, `"warning"` (amber) untuk aksi berisiko
- Tombol minimum 44x44px (WCAG compliant)
- Backdrop + blur overlay
- Close button di pojok kanan atas
- Loading state untuk async operations

**Catatan untuk frontend:** Ganti SweetAlert2 di `handleDelete` Products.jsx dan Cancel Order dengan ConfirmModal ini untuk konsistensi visual.

---

### G. Touch Targets & Mobile (E1, E2)

**Status: DIIMPLEMENTASIKAN**

**Temuan sebelum:**
- Navbar buttons menggunakan `p-2` = ~40px, kurang dari standar 44px
- CartDrawer remove button terlalu kecil (`p-1`)
- CartDrawer quantity buttons tidak jelas area tapnya

**Perubahan yang dilakukan:**

**Navbar:**
- Semua button diubah ke `min-w-[44px] min-h-[44px] flex items-center justify-center`
- Button Menu, Search, User, Cart sudah compliant

**CartDrawer:**
- Remove button: `min-w-[44px] min-h-[44px] flex items-center justify-center` + hover bg-red-50
- Quantity buttons: `min-w-[36px] min-h-[36px]` (reasonable untuk inline controls)
- Tambah aria-label pada semua icon buttons

---

## 2. Audit Temuan — Belum Diimplementasikan

### Mobile Breakpoint (E1)
**375px (iPhone SE):**
- Halaman JoinStarcenter: hero text `text-4xl` mungkin terlalu besar di 375px. Perlu test nyata.
- Checkout 2-kolom: sudah menggunakan `grid-cols-1 md:grid-cols-2`, aman di mobile.
- CartDrawer `w-full sm:w-[400px]` — di 375px full width sudah benar.

**768px (tablet):**
- Admin sidebar belum ada — admin panel di desktop only saat ini.
- Perlu review layout admin di tablet.

**1280px (desktop):**
- Layout umum sudah baik dengan `container mx-auto max-w-4xl/6xl`.

### C1 - NetworkTree
- Komponen NetworkTree perlu zoom, collapse/expand, dan mobile touch scroll
- Belum ada implementasi — perlu review `src/pages/CenterShop.jsx` atau network page

### C2 - JoinStarcenter
- Halaman sudah ada dan cukup baik secara desain
- Perlu: tabel perbandingan Regular vs Starcenter

### D3 - Bulk Action Commission
- Belum ada UI untuk bulk pay commission

### A3, A4 - Skeleton & Empty State
- Belum ada skeleton loading components
- Empty state masih text saja

### B4 - Invoice Printable
- Belum ada print stylesheet

### E3, E4, E5 - WCAG Kontras, Keyboard Nav, Focus Indicator
- Belum diaudit

---

## 3. File yang Diubah

| File | Perubahan |
|------|-----------|
| `src/components/CartDrawer.jsx` | MOQ warning banner, progress bar, disable checkout, touch targets |
| `src/pages/Checkout.jsx` | Progress stepper, MOQ warning banner, disable submit |
| `src/pages/admin/Dashboard.jsx` | Alert pending payments, proporsional commission bar, subtitle |
| `src/pages/admin/Orders.jsx` | Status filter tabs dengan count |
| `src/components/Navbar.jsx` | Touch targets 44x44px semua buttons |
| `src/components/ui/ConfirmModal.jsx` | Komponen BARU — destructive confirm dialog |
| `agent/docs/uiux/A2_style_guide.md` | Update dengan semua temuan dan implementasi |

---

## 4. Rekomendasi untuk Tim Frontend

### Segera (Sprint berikutnya)

1. **Gunakan ConfirmModal** — Ganti semua `Swal.fire` untuk delete/cancel dengan `<ConfirmModal />`. File yang perlu diupdate: `Products.jsx`, `Users.jsx`, `Commissions.jsx`.

2. **Tambahkan `--color-cta`** token di `index.css` untuk menggantikan hardcoded `#047857`. Ini akan memudahkan rebranding.

3. **NetworkTree mobile** — Wrap tree dengan `overflow-auto` dan tambahkan pinch-to-zoom support via CSS `touch-action: manipulation`.

4. **Admin mobile responsif** — Admin layout belum ditest di tablet. Pertimbangkan sidebar collapsible untuk 768px.

### Medium Priority

5. **Skeleton loading** — Implementasikan `animate-pulse` skeleton untuk list produk dan data table saat loading. Saat ini hanya spinner atau teks "Memuat...".

6. **Empty state** — Buat komponen `EmptyState` yang reusable dengan ilustrasi minimal dan CTA.

7. **Invoice print** — Tambahkan `@media print` stylesheet di `Invoice.jsx` untuk hide navbar/footer dan optimize layout.

8. **Order status timeline** — Di halaman `TrackOrders.jsx`, tampilkan timeline visual status dengan tanggal.

### Catatan Teknis

- `ConfirmModal` sudah ada di `src/components/ui/` — folder `ui/` bisa jadi home untuk semua shared components (Button, Input, Badge, dll)
- MOQ threshold `5000000` di-hardcode di CartDrawer dan Checkout — pertimbangkan mengambil dari settings API atau `.env`
- SweetAlert2 (`sweetalert2`) masih digunakan di banyak tempat — boleh dipertahankan untuk success/error toasts, tapi konfirmasi destruktif sebaiknya pakai ConfirmModal untuk konsistensi

---

## 5. Status Task

| Task | Status |
|------|--------|
| A1 Audit design tokens | SELESAI (dokumentasi) |
| A2 Style guide komponen | SELESAI (dokumentasi + implementasi referensi) |
| B1 Progress stepper checkout | SELESAI (implementasi) |
| B2 MOQ warning starcenter | SELESAI (implementasi) |
| D1 Admin dashboard metrics | SELESAI (implementasi) |
| D2 Data table filter | SELESAI (implementasi — Orders) |
| D4 Modal destruktif | SELESAI (komponen baru dibuat) |
| E1 Mobile audit | SEBAGIAN (analisis, beberapa fix) |
| E2 Touch target 44x44 | SELESAI (Navbar, CartDrawer) |
| C1 NetworkTree | PENDING |
| C2 JoinStarcenter | PARTIAL (halaman ada, perlu comparison table) |
