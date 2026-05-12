# Task List — Tim Frontend

> Proyek: SDP-V2 (E-commerce + MLM Platform)
> Stack: React 19 + Vite 7 + Tailwind CSS 4 + Axios
> Tanggal: 2026-04-15

---

## 1. Ringkasan Tanggung Jawab

Tim Frontend bertanggung jawab implementasi UI, integrasi dengan API Laravel, state management, dan kualitas kode React. Fokus saat ini: menyelesaikan migrasi Firebase ke Laravel API dan optimasi bundle.

---

## 2. Task Breakdown

### A. CRITICAL — Phase 0 (Cleanup & Stabilisasi)

| # | Task | Prioritas | Status | File | Deskripsi |
|---|------|-----------|--------|------|-----------|
| A1 | Migrasi `PaymentSettings.jsx` dari Firebase ke Laravel API | Critical | **[x] SELESAI** (2026-04-16) | `src/pages/admin/PaymentSettings.jsx` | Ganti `firebase/firestore` dengan `settingsApi`. Endpoint: `/api/admin/settings`. |
| A2 | Migrasi `Appearance.jsx` dari Firebase ke Laravel API | Critical | **[x] SELESAI** (2026-04-16) | `src/pages/admin/Appearance.jsx` | Ganti `getDoc/setDoc` Firestore dengan `settingsApi`. Endpoint: `/api/admin/appearance`. Catatan: Upload file butuh endpoint backend `POST /api/admin/upload`. |
| A3 | Hapus `src/lib/firebase.js` | Critical | **[x] SELESAI** (2026-04-16) | `src/lib/firebase.js`, `package.json` | File firebase.js dihapus, dependency `firebase` dihapus dari package.json. Build berhasil. |
| A4 | Pindahkan Firebase API key ke `.env` sementara | Critical | **[x] SELESAI** (2026-04-16) | `.env` | Semua config dipindah ke `VITE_FIREBASE_*` env vars. Disarankan rotasi key via Firebase Console. |

### B. State Management & Context

| # | Task | Prioritas | File | Status | Deskripsi |
|---|------|-----------|------|--------|-----------|
| B1 | Review AuthContext token persistence | High | `src/contexts/AuthContext.jsx` | [ ] | Pastikan token Sanctum tersimpan aman di localStorage + auto-logout saat expired. |
| B2 | Cart persistence multi-tab sync | Medium | `src/contexts/CartContext.jsx` | **[x] SELESAI** (2026-04-16) | Sync cart antar tab via `storage` event listener — diimplementasi di Phase 2. |
| B3 | AppearanceContext cache | Medium | `src/contexts/AppearanceContext.jsx` | **[x] SELESAI** (2026-04-16) | Cache response API dengan timestamp (TTL 5 menit) agar tidak fetch ulang setiap render. |
| B4 | Buat `WalletContext` (P1.1) | Medium | buat `src/contexts/WalletContext.jsx` | [ ] | Setelah endpoint wallet tersedia. |

### C. API Layer

| # | Task | Prioritas | File | Status | Deskripsi |
|---|------|-----------|------|--------|-----------|
| C1 | Standardisasi error handling `client.js` | High | `src/api/client.js` | [ ] | Pastikan semua error 401, 422, 403, 500 di-handle konsisten. Gunakan Sweetalert2. |
| C2 | Buat `walletApi.js` | Medium | `src/api/walletApi.js` | [ ] | `getWallet()`, `requestWithdraw()`. Mengacu ke Phase 3 roadmap. |
| C3 | Retry logic untuk 5xx errors | Low | `src/api/client.js` | [ ] | Axios retry dengan exponential backoff. |
| C4 | Loading state global | Medium | buat `src/hooks/useApi.js` | **[x] SELESAI** (2026-04-16) | Custom hook `useApi(apiFn, options)` dengan state loading/error/data, callback onSuccess/onError, method reset(). |

### D. Halaman & Komponen — Optimasi

| # | Task | Prioritas | File | Status | Deskripsi |
|---|------|-----------|------|--------|-----------|
| D1 | Pecah `Catalog.jsx` (277 baris) | Medium | `src/pages/Catalog.jsx` | **[x] SELESAI** (2026-04-16) | Ekstrak: `ProductGrid`, `ProductFilters`, `SearchBar` ke `src/components/catalog/`. |
| D2 | Pecah admin `Products.jsx` (815 baris) | High | `src/pages/admin/Products.jsx` | **[x] SELESAI** (2026-04-16) | Ekstrak: `ProductFormModal`, `ProductTable`, `ProductMediaUploader` ke `src/components/admin/`. |
| D3 | React.lazy() untuk semua halaman | High | `src/App.jsx` | [ ] | Gunakan `lazy()` dan `<Suspense>`. Target bundle initial < 300KB. |
| D4 | Error boundary untuk halaman admin | High | buat `src/components/ErrorBoundary.jsx` | [ ] | Tangkap runtime error, tampilkan fallback UI. |
| D5 | Loading skeleton komponen | Medium | buat `src/components/Skeleton.jsx` | **[x] SELESAI** (2026-04-16) | Skeleton untuk product card, order row, commission row — termasuk `ProductCardSkeletonGrid`. |
| D6 | Image lazy load di Catalog | Medium | `src/components/ProductCard.jsx` | **[x] SELESAI** (2026-04-16) | `loading="lazy"` ditambahkan di ProductCard, ProductTable, dan ProductMediaUploader. |

### E. Fitur Baru (Phase 1-3)

| # | Task | Prioritas | File | Status | Deskripsi |
|---|------|-----------|------|--------|-----------|
| E1 | Tampilkan MOQ warning di Cart | High | `src/components/CartDrawer.jsx` | [ ] | Untuk role `starcenter`, cek MOQ dari `systemSettings` dan tampilkan warning. |
| E2 | Status "Habis" di product card | High | `src/components/ProductCard.jsx` | **[x] SELESAI** (2026-04-16) | Overlay "Habis" + grayscale saat `stock <= 0`. Pointer-events disabled. |
| E3 | Halaman Wallet | Medium | buat `src/pages/profile/Wallet.jsx` | [ ] | Saldo + riwayat + form withdraw. Depend on Phase 3 roadmap backend. |
| E4 | Notifikasi toast untuk order status | Medium | `src/pages/profile/Orders.jsx` | **[x] SELESAI** (2026-04-16) | Polling 30s di `ProfileOrders.jsx`. Toast Swal muncul saat status berubah antar poll. |
| E5 | Download invoice sebagai PDF | Low | `src/pages/Invoice.jsx` | [ ] | Gunakan `react-to-print` atau library serupa. |

### F. Build & Bundle Optimization

| # | Task | Prioritas | File | Status | Deskripsi |
|---|------|-----------|------|--------|-----------|
| F1 | Vite manual chunks | High | `vite.config.js` | [ ] | Split: vendor (react, router), charts (recharts), ui (sweetalert2, lucide). |
| F2 | Analyze bundle size | Medium | - | **[x] SELESAI** (2026-04-16) | Bundle 985KB gzip 284KB. Recharts + sweetalert2 adalah kontributor terbesar. F1 (code splitting) perlu dikerjakan untuk atasi ini. |
| F3 | Hapus unused dependencies | Medium | `package.json` | **[x] SELESAI** (2026-04-16) | Audit: semua dependencies aktif digunakan. Firebase sudah dihapus di Phase 0. Tidak ada orphan. |
| F4 | Tree-shaking audit | Low | - | [ ] | Pastikan import spesifik, hindari `import *`. |

### G. Form Handling & Validasi

| # | Task | Prioritas | File | Status | Deskripsi |
|---|------|-----------|------|--------|-----------|
| G1 | Inline validation di Register form | Medium | `src/pages/Register.jsx` | **[x] SELESAI** (2026-04-16) | Diimplementasi di `Login.jsx` (form register gabung). Password strength bar (4 level), email format validation + ikon ✓/✗, show/hide password toggle. |
| G2 | Validasi upload bukti bayar | High | `src/pages/Checkout.jsx` | [ ] | Cek ukuran file (max 2MB), tipe (jpg/png/pdf) sebelum submit. |
| G3 | Form dirty state warning | Low | - | [ ] | Peringatan saat user menutup halaman dengan form belum disimpan. |

### H. Testing & Quality

| # | Task | Prioritas | File | Status | Deskripsi |
|---|------|-----------|------|--------|-----------|
| H1 | ESLint pass 100% | High | - | **[x] SELESAI** (2026-04-16) | `npm run lint` pada src/ = 0 error. Vendor files di-ignore via eslint.config.js. |
| H2 | Setup Vitest untuk komponen | Medium | `vitest.config.js` | [ ] | Buat test minimal untuk komponen kritis (CartDrawer, Checkout). |
| H3 | Debounce search input 300ms | High | `src/components/catalog/SearchBar.jsx` | **[x] SELESAI** (2026-04-16) | Debounce 300ms diimplementasi di SearchBar component. |

---

## 3. Prioritas Task

### Critical (Selesaikan minggu ini)
- A1, A2, A3, A4 — SEMUA SELESAI

### High (Minggu 1-2)
- B1, C1, D3, D4, E1, F1, G2 — perlu dikerjakan di Phase 1 lanjutan
- D2, E2, H1, H3 — SELESAI di Phase 2

### Medium (Minggu 3-4)
- B2, B3, D1, D5, D6 — SELESAI di Phase 2
- C4, E4, F2, F3, G1 — SELESAI di Phase 3
- B4, C2, E3, H2 — masih pending (B4/C2/E3 depend on backend Phase 3)

### Low (Backlog)
- C3, E5, F4, G3, H2

---

## 4. Deliverables

1. PR untuk setiap task dengan deskripsi jelas (ikuti konvensi commit: `feat:`, `fix:`, `refactor:`)
2. `npm run build` selalu hijau sebelum merge
3. `npm run lint` 0 error, 0 warning
4. Screenshot before/after untuk perubahan UI
5. Dokumentasi API integration di JSDoc komponen

---

## 5. Risiko & Catatan

- **Risiko Kritis**: Firebase API key exposed di git history. Setelah A3 selesai, pertimbangkan rotasi key via Firebase Console.
- **Catatan**: SEMUA API call harus melalui `src/api/`, jangan fetch langsung di komponen (konvensi).
- **Mobile-first**: Mulai kelas Tailwind dari base, tambahkan `md:`, `lg:` untuk breakpoint lebih besar.
- **Dependency**: Task E2, E3, E4 menunggu implementasi backend terlebih dahulu.
- **Coordinate**: Sinkron dengan tim UI/UX untuk design token dan komponen reusable.

---

## 6. Phase 2 — Log Perubahan (2026-04-16)

### Task yang Diselesaikan di Phase 2:

| Task | File yang Dibuat/Diubah |
|------|------------------------|
| D2: Pecah admin/Products.jsx | `src/components/admin/ProductTable.jsx` (baru), `src/components/admin/ProductFormModal.jsx` (baru), `src/components/admin/ProductMediaUploader.jsx` (baru), `src/pages/admin/Products.jsx` (refactor) |
| E2: Status "Habis" di ProductCard | `src/components/ProductCard.jsx` (update: overlay habis, grayscale, loading="lazy") |
| D6: Image lazy load | `src/components/ProductCard.jsx`, `src/components/admin/ProductTable.jsx`, `src/components/admin/ProductMediaUploader.jsx` |
| B2: Cart multi-tab sync | `src/contexts/CartContext.jsx` (tambah `window.addEventListener('storage', ...)`) |
| B3: AppearanceContext cache | `src/contexts/AppearanceContext.jsx` (cache TTL 5 menit + `refreshAppearance()`) |
| D1: Pecah Catalog.jsx | `src/components/catalog/SearchBar.jsx` (baru), `src/components/catalog/ProductFilters.jsx` (baru), `src/components/catalog/ProductGrid.jsx` (baru), `src/pages/Catalog.jsx` (refactor) |
| D5: Loading Skeleton | `src/components/Skeleton.jsx` (baru: ProductCardSkeleton, OrderRowSkeleton, CommissionRowSkeleton, TableRowSkeleton) |
| H3: Debounce search 300ms | `src/components/catalog/SearchBar.jsx` (debounce via useEffect + setTimeout) |
| H1: ESLint pass 100% | `eslint.config.js` (ignore vendor), perbaikan semua error di src/ |
