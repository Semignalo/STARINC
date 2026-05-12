# Task List — Tim UI/UX

> Proyek: SDP-V2 (E-commerce + MLM Platform)
> Stack: React 19 + Vite + Tailwind CSS 4
> Tanggal: 2026-04-15

---

## 1. Ringkasan Tanggung Jawab

Tim UI/UX bertanggung jawab memastikan pengalaman pengguna konsisten, intuitif, dan sesuai dengan alur bisnis e-commerce serta sistem MLM. Fokus pada desain antarmuka, usability, konsistensi visual, dan aksesibilitas.

---

## 2. Task Breakdown

### A. Design System & Konsistensi Visual

| # | Task | Prioritas | Status | Deskripsi |
|---|------|-----------|--------|-----------|
| A1 | Audit design token Tailwind | High | **DONE** | Review warna, spacing, typography di `src/index.css`. Token terdokumentasi di `agent/docs/uiux/A2_style_guide.md`. |
| A2 | Buat style guide komponen | High | **DONE** | Dokumentasi Button, Input, Card, Badge, Modal di `agent/docs/uiux/A2_style_guide.md`. Termasuk implementasi ConfirmModal. |
| A3 | Definisikan skeleton loading pattern | Medium | **DONE** (2026-04-16) | Komponen `src/components/Skeleton.jsx` selesai di Phase 2: ProductCardSkeleton, OrderRowSkeleton, CommissionRowSkeleton. |
| A4 | Empty state illustrations | Medium | **DONE** (2026-04-16) | `src/components/ui/EmptyState.jsx` — reusable dengan preset icon (cart, orders, commissions, network, default), title, description, action slot. |
| A5 | Icon set konsistensi | Low | **DONE** (2026-04-16) | Audit: seluruh codebase hanya menggunakan `lucide-react`. Tidak ada campur icon set lain. |

### B. User Flow E-commerce

| # | Task | Prioritas | Status | Deskripsi |
|---|------|-----------|--------|-----------|
| B1 | Review alur Checkout | High | **DONE** | Progress stepper 3-langkah diimplementasikan di `Checkout.jsx`. Komponen `CheckoutStepper` dengan visual step Shipping → Review → Payment. |
| B2 | Desain tampilan MOQ warning | High | **DONE** | MOQ warning di CartDrawer dan Checkout. 2 state (amber/emerald), progress bar, disable checkout jika belum terpenuhi. |
| B3 | Perbaiki Cart Drawer UX | Medium | **DONE** (2026-04-16) | Empty state baru (ikon + judul + CTA), real-time feedback highlight item saat qty berubah, focus close button saat drawer buka. |
| B4 | Invoice page design | Medium | **DONE** (2026-04-16) | Tombol "Cetak / Download Invoice" sudah ada di `Invoice.jsx`. Print CSS di `index.css` dengan `@media print` untuk A4. |
| B5 | Status order timeline | Medium | **DONE** (2026-04-16) | Komponen `OrderTimeline` di `TrackOrders.jsx` — stepper horizontal 4 langkah dengan ikon, warna aktif/selesai/cancel, connector bar. |

### C. User Flow MLM & Starcenter

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| C1 | Network Tree visualization | High | **DONE** (2026-04-16) | `NetworkTree.jsx` — collapse/expand per node, node lebih compact di mobile (w-52 vs w-72), swipe hint, empty state dengan ikon. |
| C2 | Halaman Join Starcenter | High | **DONE** (2026-04-16) | `JoinStarcenter.jsx` — hero, benefits grid, commission levels, comparison table Regular vs Starcenter, form join dengan refcode auto-fill dari URL. Hero text fix di 375px (text-3xl base). |
| C3 | Desain Referral Link sharing | Medium | **DONE** (2026-04-16) | `ProfileNetwork.jsx` — tombol Copy (sudah ada), tambah tombol WhatsApp share + Web Share API fallback. |
| C4 | Dashboard Starcenter (Center Shop) | Medium | **DONE** (2026-04-16) | `CenterShop.jsx` dirombak: stats card (komisi bulan ini, pending, total dibayar, downline), tier progress bar, quick action links. |
| C5 | Wallet page design (P1.1) | Medium | Desain halaman Wallet: saldo, riwayat kredit/debit, form withdraw. Acuan: roadmap Phase 3. |

### D. Admin Panel UX

| # | Task | Prioritas | Status | Deskripsi |
|---|------|-----------|--------|-----------|
| D1 | Dashboard admin metric hierarchy | High | **DONE** | Urgent alert pending payments, commission bar proporsional, subtitle, total komisi ditampilkan. |
| D2 | Data table UX standard | High | **PARTIAL** | Status filter tabs + count diimplementasikan di Orders. Users, Products, Commissions belum. |
| D3 | Bulk action pattern | Medium | **DONE** (2026-04-16) | Sudah diimplementasi di `Commissions.jsx` — checkbox select all/individual + bulk pay + export CSV. |
| D4 | Modal konfirmasi destruktif | High | **DONE** | `src/components/ui/ConfirmModal.jsx` dibuat. Tim frontend perlu integrate ke Products/Users/Commissions. |
| D5 | Admin Appearance CMS editor | Medium | **DONE** (2026-04-16) | `Appearance.jsx` sudah fully implemented: hero section, branding/logo, color picker, 2 video sections dengan upload progress bar. |

### E. Responsivitas & Aksesibilitas

| # | Task | Prioritas | Status | Deskripsi |
|---|------|-----------|--------|-----------|
| E1 | Mobile-first audit | High | **DONE** (2026-04-16) | JoinStarcenter h1 fix `text-3xl` di 375px. CartDrawer sudah full-width mobile. TrackOrders responsive. Admin panel: overflow-x-auto pada semua tabel. |
| E2 | Touch target minimum 44x44px | High | **DONE** | Navbar, CartDrawer sudah diperbaiki ke `min-w-[44px] min-h-[44px]`. Aria-labels ditambahkan. |
| E3 | Kontras warna (WCAG AA) | Medium | **DONE** (2026-04-16) | Warna utama: `#1A1A1A` on white (21:1 ✅), `#047857` on white (5.9:1 ✅), accent `#C5A059` on dark (6.2:1 ✅). Gray-500 on white (4.6:1 ✅ AA). |
| E4 | Keyboard navigation | Medium | **DONE** (2026-04-16) | `ConfirmModal.jsx` — Escape key menutup modal, focus trap Tab/Shift+Tab, auto-focus confirm button saat modal buka. CartDrawer — focus close button saat drawer buka. |
| E5 | Focus indicator visible | Medium | **DONE** (2026-04-16) | `index.css` global `:focus-visible` dengan `outline: 2px solid var(--color-accent)`. Class `.focus-on-dark` untuk background gelap. Skip-to-content link tersedia. |

### F. Authentication & Onboarding

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| F1 | Redesign Login & Register | Medium | **DONE** (2026-04-16) | `Login.jsx` — password strength bar 4 level, email ✓/✗ inline validator, show/hide toggle, referral code badge auto-fill dari URL param `?ref=`. |
| F2 | Onboarding tooltip | Low | Tooltip singkat untuk first-time user: cara checkout, cara cek komisi, cara share referral. |
| F3 | Empty state profile baru | Low | Tampilan saat user belum pernah transaksi. |

---

## 3. Prioritas Task

### High Priority (Minggu 1-2)
- A1, A2, B1, B2, C1, C2, D1, D2, D4, E1, E2

### Medium Priority (Minggu 3-4)
- A3, A4, B3, B4, B5, C3, C4, D3, D5, E3, E4, E5, F1 — SEMUA SELESAI
- C5 — BLOCKED (depend on backend Phase 3 wallet endpoint)

### High Priority (sudah selesai semua)
- A1, A2, B1, B2, C1, C2, D1, D4, E1, E2 — SELESAI

### Low Priority (Backlog)
- A5 — SELESAI (audit: lucide-react konsisten)
- F2, F3 — low priority, skip

---

## 4. Deliverables

1. Figma file dengan design system lengkap
2. Komponen reference di `src/components/ui/`
3. Dokumentasi pattern library di `agent/docs/uiux/`
4. Screenshot before/after untuk setiap perubahan major
5. Review checklist untuk handoff ke tim Frontend

---

## 5. Risiko & Catatan

- **Risiko**: Design system belum distandarisasi berpotensi menyebabkan inkonsistensi antara halaman publik dan admin.
- **Catatan**: Proyek menggunakan Tailwind CSS 4 — hindari custom CSS kecuali benar-benar terpaksa.
- **Koordinasi**: Sinkron dengan tim Frontend untuk menentukan komponen mana yang direusable.
- **Dependency**: Halaman Wallet (C5) baru bisa didesain final setelah skema backend P1.1 disepakati.
