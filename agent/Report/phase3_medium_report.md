# Phase 3 — Medium Priority Report

> Tanggal: 2026-04-16
> Tim: Frontend + UI/UX
> Status: SELESAI

---

## Ringkasan

Phase 3 menyelesaikan semua medium priority task yang tidak bergantung pada backend Phase 3 (Wallet). Total **11 task** diselesaikan.

---

## Task Selesai

### Frontend

#### C4 — `src/hooks/useApi.js` (baru)
Custom hook standar untuk semua API calls:
```js
const { data, loading, error, execute, reset, setData } = useApi(apiFn, { onSuccess, onError, initialData });
```
- Auto extract error message via `getErrorMessage()`
- Callback `onSuccess` / `onError` opsional
- Method `reset()` dan `setData()` tersedia

#### G1 — Inline validation Login/Register (`src/pages/Login.jsx`)
- **Email**: ikon ✓/✗ setelah blur, pesan error "Format email tidak valid"
- **Password strength bar**: 4 level (Lemah/Sedang/Kuat/Sangat Kuat) hanya di mode register
- **Show/Hide password toggle**: eye icon di semua mode

#### F2 — Bundle size audit
- Bundle saat ini: **985 KB** (gzip 284 KB)
- Kontributor terbesar: recharts, sweetalert2, lucide-react
- Rekomendasi: kerjakan task F1 (Vite manual chunks) + D3 (React.lazy)

#### F3 — Unused dependency audit
- Semua 8 dependencies aktif digunakan
- Firebase sudah dihapus di Phase 0
- Tidak perlu aksi tambahan

#### E4 — Toast notifikasi order status (`src/components/profile/ProfileOrders.jsx`)
- Polling setiap **30 detik** (silent, tidak trigger re-render loading)
- Diff status via `prevStatusesRef` (React.useRef)
- Toast Swal muncul dengan detail: `#ORDER_NUMBER → status baru`
- Tidak mengganggu interaksi user saat sedang di halaman

---

### UI/UX

#### A3 — Skeleton loading pattern
- Sudah diimplementasi di Phase 2: `src/components/Skeleton.jsx`
- Komponen tersedia: `ProductCardSkeleton`, `OrderRowSkeleton`, `CommissionRowSkeleton`, `TableRowSkeleton`, `ProductCardSkeletonGrid`

#### A4 — Empty state component (`src/components/ui/EmptyState.jsx`) (baru)
Reusable empty state dengan:
- Preset icons: `cart`, `orders`, `commissions`, `network`, `default`
- Props: `icon`, `title`, `description`, `action` (slot React node), `className`

#### B5 — Order status timeline (`src/pages/TrackOrders.jsx`)
Komponen `OrderTimeline` — stepper horizontal:
- 4 langkah: Menunggu Bayar → Konfirmasi → Diproses → Selesai
- State cancelled: langkah merah khusus
- Mapping status API dan status label display
- Connector bar berwarna hijau untuk langkah yang sudah lewat

#### C3 — Referral link sharing (`src/components/profile/ProfileNetwork.jsx`)
- Tombol **WhatsApp** (`wa.me/?text=...`) dengan pesan pre-filled
- Tombol **Bagikan Link** — Web Share API native, fallback ke copy clipboard
- Ditambahkan di bawah referral link card yang sudah ada

#### C4 — Dashboard Starcenter (`src/pages/CenterShop.jsx`)
Halaman dirombak total dari placeholder menjadi dashboard:
- **Header hero** dengan gradient dan nama user
- **4 stat cards**: Komisi Bulan Ini, Komisi Pending, Total Dibayar, Total Downline
- **Tier progress bar** dengan target tier berikutnya
- **3 quick action links**: Riwayat Komisi, Jaringan, Belanja
- Loading skeleton saat fetch stats
- Fix role check: support `starcenter` dan `center`

#### D3 — Bulk action commissions
- Sudah diimplementasi di `Commissions.jsx` (Phase 2): checkbox, select all, bulk pay, export CSV
- Ditandai DONE

#### D5 — Admin Appearance CMS
- Sudah fully implemented di `Appearance.jsx` (Phase 0): hero, branding, color picker, 2 video sections dengan upload + progress bar
- Ditandai DONE

---

## Status Build & Quality

| Check | Status |
|-------|--------|
| `npm run lint` | ✅ 0 error, 0 warning |
| `npm run build` | ✅ sukses |
| Bundle size | 985 KB (perlu code splitting — task F1) |

---

## Task Tersisa (Medium — Blocked)

| Task | Alasan Pending |
|------|---------------|
| B4 (WalletContext) | Backend wallet endpoint belum ada (Phase 3) |
| C2 (walletApi.js) | Backend wallet endpoint belum ada (Phase 3) |
| E3 (Halaman Wallet) | Backend wallet endpoint belum ada (Phase 3) |
| H2 (Vitest setup) | Pilihan: kerjakan jika ada waktu atau Phase 4 |
| UI/UX B3, B4 | Cart UX review, Invoice print — sudah cukup baik |
| UI/UX C5 (Wallet design) | Depend on backend Phase 3 |
| UI/UX E3/E4/E5 | WCAG accessibility audit — Phase 4 |
| UI/UX F1 (Login redesign) | Validation sudah ditambah, redesign full — Phase 4 |
