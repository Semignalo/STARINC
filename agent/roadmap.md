# ROADMAP LENGKAP SDP-V2
**Tanggal Dibuat:** 2026-04-16
**Dibuat oleh:** Supervisor Agent

---

## RINGKASAN STATUS PROJECT SAAT INI

**Yang sudah selesai (Phase 0 Backend — CONFIRMED):**
- A1: Scheduler `tier:check-downgrades` sudah aktif di `console.php`
- A2: Rate limiting `throttle:5,1` di `/register` dan `/login`
- A3: `NetworkController.php` dan `CommissionController.php` sudah dibuat, logic dipindah dari `api.php`
- A4: `CheckoutRequest.php` dengan validasi `variant_id` milik `product_id` sudah ada

**Yang masih pending / belum dikerjakan:**
- Firebase masih ada di `Appearance.jsx` dan `PaymentSettings.jsx` (blocker production)
- Test suite hampir kosong (hanya `ExampleTest.php`)
- MySQL migration belum dilakukan (masih SQLite)
- Stok tidak pernah berkurang saat order
- Wallet/Komisi payout belum ada
- Bundle optimization belum dilakukan
- Tidak ada CI/CD pipeline

---

## ROADMAP TIM BACKEND

### PHASE 0 — Cleanup & Stabilisasi (SELESAI)
**Target:** Minggu 1 | **Status: DONE**

| Task | Prioritas | Complexity | Status |
|------|-----------|------------|--------|
| A1: Scheduler tier downgrade aktif | Critical | S | SELESAI |
| A2: Rate limiting endpoint auth | Critical | S | SELESAI |
| A3: Pindah inline logic ke Controller | High | M | SELESAI |
| A4: Validasi variant_id di checkout | High | M | SELESAI |

---

### PHASE 1 — Production Readiness (SEKARANG — Minggu 2)
**Target:** Minggu 2 | **Prioritas: TINGGI**

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| B1: Migrasi SQLite ke MySQL | High | M | Infrastruktur server |
| B2: Tambahkan database indexes | High | M | B1 (MySQL dulu) |
| B3: Cache `SystemSetting::getValue()` | High | S | - |
| B4: Validasi & kurangi stok di `OrderService` | High | M | - |
| B5: Validasi upload bukti bayar (MIME, size, private storage) | Medium | S | - |
| B6: Fix bug `TierService::checkDowngrades()` reset `last_transaction_at` | Medium | S | - |

**Catatan Kritis:** B4 harus segera dikerjakan — saat ini stok tidak pernah berkurang walau order berhasil. Race condition saat concurrent order bisa terjadi kapan saja.

---

### PHASE 2 — Optimasi Backend (Minggu 3)
**Target:** Minggu 3 | **Prioritas: MEDIUM-HIGH**

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| C1: Fix N+1 query di `CommissionService::distributeMLM()` | High | M | Phase 1 selesai |
| C2: Aktifkan Gzip response compression | Medium | S | Server config |
| C3: Rate limiting global `throttle:60,1` untuk semua endpoint auth | Medium | S | - |
| C4: Optimize query dashboard admin (single aggregate query) | Low | M | - |

**Dependency dengan Performance team:** Konfirmasi index sudah ditambahkan (B2) sebelum Performance team mulai load testing.

---

### PHASE 3 — Fitur Wallet & Notifikasi (Minggu 4-5)
**Target:** Minggu 4-5 | **Prioritas: MEDIUM** | **Butuh approval Supervisor sebelum mulai**

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| D1: Migration tabel `wallet_ledgers` | High | M | Phase 1 selesai |
| D2: Model `WalletLedger` dengan method `getBalance()` | High | M | D1 |
| D3: Update `CommissionService` auto-credit wallet saat pay | High | M | D1, D2 |
| D4: `WalletController` (GET /user/wallet, POST /user/wallet/withdraw) | High | L | D1, D2 |
| D5: Register route wallet | High | S | D4 |
| D6: Admin `WithdrawalController` (approve/reject) | Medium | M | D4 |
| E1: Setup Laravel Mail (Mailtrap dev) | Medium | S | - |
| E2: Email konfirmasi order | Medium | M | E1 |
| E3: Email notifikasi status order berubah | Medium | M | E1 |
| E4: Notifikasi komisi masuk (DB + email) | Low | M | E1, D3 |

---

### PHASE 4 — Payment Gateway (Bulan 2)
**Target:** Bulan 2 | **Prioritas: HIGH saat waktunya**

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| F1: Integrasi Midtrans Snap API | High | L | Kontrak Midtrans signed |
| F2: Endpoint buat Snap token | High | M | F1 |
| F3: Webhook handler Midtrans | High | L | F1, F2 |
| F4: Deprecated alur manual payment proof | Medium | S | F3 production-ready |

---

### PHASE 5 — Testing Backend (Bulan 3)
**Target:** Bulan 3 | **Paralel dengan fitur development**

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| G1: Unit test `OrderService` | High | L | - |
| G2: Unit test `CommissionService` | Critical | L | - |
| G3: Unit test `TierService` | High | M | - |
| G4: Feature test auth endpoints | High | M | - |
| G5: Feature test checkout flow | High | L | - |
| G6: Feature test admin authorization | Medium | M | - |

---

## ROADMAP TIM FRONTEND

### PHASE 0 — Critical Firebase Migration (SEKARANG — Minggu 1-2)
**Target:** Minggu 1-2 | **Prioritas: CRITICAL — BLOCKER PRODUCTION**

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| A4: Pindahkan Firebase API key ke `.env` | Critical | S | Lakukan HARI INI |
| A1: Migrasi `PaymentSettings.jsx` dari Firebase ke `settingsApi` | Critical | M | A4 |
| A2: Migrasi `Appearance.jsx` (538 baris) dari Firebase ke `settingsApi` | Critical | L | A4 |
| A3: Hapus `src/lib/firebase.js` dan dependency `firebase` di `package.json` | Critical | S | A1, A2 selesai |

**Catatan:** Firebase API key saat ini berpotensi exposed di git history. Setelah A3 selesai, lakukan rotasi key di Firebase Console.

---

### PHASE 1 — Stabilisasi & Quick Wins (Minggu 2-3)
**Target:** Minggu 2-3 | **Paralel dengan Phase 0 cleanup**

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| H1: ESLint pass 100% (`npm run lint` zero error) | High | M | - |
| C1: Standardisasi error handling `client.js` (401, 403, 422, 500) | High | M | - |
| B1: Review AuthContext token persistence + auto-logout | High | S | - |
| D3: `React.lazy()` + `<Suspense>` untuk semua halaman | High | M | - |
| D4: Error boundary `src/components/ErrorBoundary.jsx` | High | S | - |
| G2: Validasi upload bukti bayar di `Checkout.jsx` (max 2MB, MIME) | High | S | - |
| E1: Tampilkan MOQ warning di `CartDrawer.jsx` untuk role starcenter | High | M | Backend B4 |
| F1: Vite manual chunks (vendor, charts, ui) | High | M | - |

---

### PHASE 2 — Komponen & UI Refinement (Minggu 3-4)
**Target:** Minggu 3-4

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| D2: Pecah `admin/Products.jsx` (815 baris) menjadi komponen terpisah | High | L | - |
| E2: Status "Habis" di product card | High | S | Backend B4 selesai |
| B2: Cart persistence multi-tab sync via storage event | Medium | M | - |
| B3: AppearanceContext cache dengan timestamp | Medium | S | Phase 0 A1-A2 selesai |
| D1: Pecah `Catalog.jsx` (277 baris) | Medium | M | - |
| D5: Loading skeleton komponen | Medium | M | UI/UX A3 selesai |
| D6: Image lazy load di Catalog | Medium | S | - |
| H3: Debounce search input 300ms | High | S | - |

---

### PHASE 3 — Fitur Baru (Minggu 5-6)
**Target:** Minggu 5-6 | **Bergantung Phase 3 Backend**

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| C2: Buat `walletApi.js` | Medium | S | Backend D4, D5 |
| B4: Buat `WalletContext` | Medium | M | C2 |
| E3: Halaman Wallet (`src/pages/profile/Wallet.jsx`) | Medium | L | Backend Phase 3 |
| E4: Toast notifikasi order status change | Medium | M | - |
| G1: Inline validation di Register form | Medium | M | - |

---

### PHASE 4 — Optimasi Lanjut (Bulan 2)
**Target:** Bulan 2

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| F2: Analisis bundle dengan `vite-bundle-visualizer` | Medium | S | - |
| F3: Hapus unused dependencies post-Firebase | Medium | S | Phase 0 selesai |
| H2: Setup Vitest untuk komponen kritis | Medium | M | - |
| E5: Download invoice sebagai PDF | Low | M | - |
| C3: Retry logic 5xx dengan exponential backoff | Low | M | - |

---

## ROADMAP TIM UI/UX

### PHASE 0 — Design System Dasar (Minggu 1-2)
**Target:** Minggu 1-2 | **Berjalan paralel dengan Frontend Phase 0**

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| A1: Audit design token Tailwind (warna, spacing, typography) | High | M | - |
| A2: Buat style guide komponen (Button, Input, Card, Badge, Modal) | High | L | A1 |
| E1: Mobile-first audit seluruh halaman (375/768/1280px) | High | M | - |
| E2: Touch target minimum 44x44px di mobile | High | S | E1 |
| D4: Modal konfirmasi destruktif untuk aksi berbahaya | High | S | - |
| D1: Audit hierarchy KPI di admin dashboard | High | M | - |
| D2: Standarisasi UX data table (filter, search, pagination, sort) | High | M | - |

---

### PHASE 1 — User Flow Critical (Minggu 2-3)
**Target:** Minggu 2-3

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| B1: Review + redesign alur Checkout (progress stepper) | High | L | - |
| B2: Desain tampilan MOQ warning di Cart Drawer | High | M | - |
| C1: Review visualisasi Network Tree (zoom, collapse, mobile) | High | L | - |
| C2: Desain halaman Join Starcenter (benefit, syarat, CTA) | High | L | - |
| A3: Definisikan skeleton loading pattern | Medium | M | A2 |
| A4: Empty state illustrations (cart, order, komisi, downline) | Medium | M | A2 |

---

### PHASE 2 — Penyempurnaan UX (Minggu 3-5)
**Target:** Minggu 3-5

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| B5: Timeline status order (visual timeline dengan ikon + tanggal) | Medium | M | - |
| C3: UI Referral link sharing (copy + WhatsApp share + QR) | Medium | M | - |
| C4: Dashboard Starcenter (komisi, downline aktif, progress tier) | Medium | L | - |
| B3: Perbaiki Cart Drawer UX (real-time quantity, hapus) | Medium | M | - |
| B4: Invoice page printable & PDF-ready | Medium | M | - |
| D3: Bulk action pattern (select → bulk pay commission) | Medium | M | - |
| E3: Kontras warna WCAG AA | Medium | M | A1 |
| E4: Keyboard navigation semua form dan modal | Medium | M | - |
| E5: Focus indicator visible (Tailwind ring) | Medium | S | - |
| F1: Redesign Login & Register (validasi inline, referral auto-fill) | Medium | M | - |

---

### PHASE 3 — Fitur Baru UX (Bulan 2)
**Target:** Bulan 2 | **Bergantung konfirmasi skema wallet dari Backend**

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| C5: Desain halaman Wallet (saldo, riwayat, form withdraw) | Medium | L | Backend Phase 3 skema disepakati |
| D5: Admin Appearance CMS editor WYSIWYG | Medium | L | Frontend Phase 0 A1-A2 selesai |
| F2: Onboarding tooltip first-time user | Low | M | - |

---

## ROADMAP TIM QA/TESTING

### PHASE 0 — Setup & Strategy (Minggu 1)
**Target:** Minggu 1 | **Berjalan paralel**

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| A1: Buat Test Plan dokumen | High | M | - |
| A2: Setup test environment (SQLite dev, seed data konsisten) | High | M | - |
| A3: Pastikan `php artisan test` berjalan (struktur Feature/Unit/Services) | High | S | - |
| A5: Bug tracking workflow dan template bug report | High | S | - |
| A4: Setup Vitest (unit) + Playwright (E2E) | Medium | M | - |

---

### PHASE 1 — Critical Path Testing (Minggu 1-2)
**Target:** Minggu 1-2 | **Prioritas CRITICAL untuk semua yang financial**

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| B1: Test Register flow (valid, duplicate, invalid ref code) | Critical | M | - |
| B2: Test Login (valid, wrong pw, rate limit 6th = 429) | Critical | M | Backend A2 |
| B4: Test Admin middleware — non-admin ke `/admin/*` = 403 | Critical | S | - |
| G5: Test authorization IDOR — user A tidak bisa akses order user B | Critical | M | - |
| G6: Test admin route protection | Critical | S | - |
| C3: Test Cart operations (add, update, remove, localStorage persist) | Critical | M | - |
| C4: Test Checkout Regular user (kalkulasi server-side, tier discount) | Critical | L | - |
| C5: Test Checkout Starcenter (MOQ validation, tier discount) | Critical | L | - |
| C7: Test Order status flow semua transisi | Critical | L | - |
| D1: Test Commission distribution Regular (1 level 5%) | Critical | L | - |
| D2: Test Commission distribution Starcenter MLM (7 level) | Critical | XL | Seed chain 7 level |
| D3: Test Commission cancellation saat order cancel | Critical | M | - |
| D6: Test Closure table integrity (insert user baru → 7 entry) | Critical | L | - |
| D7: Test Admin pay commission (single, bulk, tidak bisa 2x) | Critical | M | - |
| E1: Test Auto-upgrade tier saat cumulative_spending cross threshold | Critical | M | - |
| E2: Test Tier discount applied dengan benar di checkout | Critical | M | - |
| G1: Test SQL injection di form search/filter/login | Critical | M | - |
| G2: Test XSS di input nama produk, alamat, dll | Critical | M | - |
| G7: Verifikasi tidak ada Firebase key exposed di bundle production | Critical | S | Frontend Phase 0 selesai |
| H4: Concurrent checkout test (10 user, stok terbatas) | Critical | L | Backend B4 |

---

### PHASE 2 — High Priority Testing (Minggu 2-3)
**Target:** Minggu 2-3

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| F2: Test CRUD Produk admin | Critical | M | - |
| F3: Test Order management admin | Critical | M | - |
| F5: Test Commission management admin | Critical | M | - |
| F7: Test Settings setelah migrasi Firebase | Critical | M | Frontend Phase 0 selesai |
| B3: Test Logout & token invalidation | High | M | - |
| B5: Test Referral code auto-fill dari URL | High | S | - |
| B6: Test Password update | High | M | - |
| C1: Test Catalog & Search (filter, pagination, edge cases) | High | M | - |
| C2: Test Product Detail (variant selection, harga update) | High | M | - |
| C6: Test Upload validasi bukti bayar (MIME, size, corrupted) | High | M | Backend B5 |
| C9: Test Order history user (hanya order sendiri) | High | M | - |
| C10: Test Inventory validation setelah backend B4 | High | M | Backend B4 |
| D4: Test Network Tree visualization performa (100+ downline) | High | L | - |
| D5: Test Referral link (unique, QR valid) | High | S | - |
| E3: Test Auto-downgrade via command `tier:check-downgrades` | High | M | Backend A1 |
| E5: Test Admin edit tier | High | M | - |
| F1: Test Dashboard stats akurasi | High | M | - |
| F4: Test User management (filter, update role) | High | M | - |
| F6: Test Tier management | High | M | - |
| G3: Test CSRF | High | S | - |
| G4: Test rate limiting login (request ke-6 = 429) | High | S | Backend A2 |
| H1: Lighthouse audit (Performance > 85, Accessibility > 90) | High | M | - |
| H3: Deteksi N+1 dengan Laravel Debugbar/Telescope | High | M | - |
| I1: Smoke test suite (< 5 menit, critical path) | High | M | - |
| I2: Full regression checklist | High | L | - |
| J1: Cross-browser: Chrome, Firefox, Safari, Edge | High | M | - |
| J2: Mobile Safari iOS | High | M | - |
| J3: Chrome Mobile Android | High | M | - |

---

### PHASE 3 — Medium Priority Testing (Minggu 3-4)
**Target:** Minggu 3-4

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| E4: Test bug fix B1 tidak regresi | Medium | S | Backend B6 |
| B7: Test Sanctum token expiration | Medium | M | - |
| C8: Test Invoice public access tanpa login | Medium | S | - |
| D8: Test Commission export CSV/PDF | Medium | M | - |
| H2: API response time baseline (< 500ms list, < 200ms detail) | Medium | M | - |
| H5: Large dataset test (10k users, 50k orders, 100k commissions) | Medium | XL | Backend B1, B2 |
| I3: Automated regression dengan Playwright | Medium | XL | - |
| J4: Tablet breakpoint | Medium | M | - |

---

## ROADMAP TIM DEVOPS/DEPLOYMENT

### PHASE 0 — Setup Dasar (Minggu 1)
**Target:** Minggu 1

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| Setup MySQL production server | Critical | M | - |
| Buat environment staging (mirror production) | High | M | - |
| Setup backup otomatis harian untuk database | High | M | MySQL server |
| Dokumentasi deployment checklist step-by-step | Critical | S | - |
| Rollback procedure frontend (Firebase Hosting) dan backend | Critical | M | - |

---

### PHASE 1 — Production Infrastructure (Minggu 2)
**Target:** Minggu 2 | **Bergantung Backend Phase 1**

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| Konfigurasi Nginx dengan Gzip/Brotli compression | High | M | Server tersedia |
| Setup PHP process manager (PHP-FPM tuning) | High | M | - |
| Konfigurasi MySQL dengan `slow_query_log` (threshold 100ms) | High | S | MySQL ready |
| Setup environment variables production di server | High | S | - |
| Aktifkan CDN caching Firebase Hosting untuk static assets | Medium | S | - |

---

### PHASE 2 — CI/CD & Automation (Minggu 2-3)
**Target:** Minggu 2-3

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| Buat GitHub Actions workflow untuk `npm run build` + `php artisan test` | High | M | - |
| Auto-deploy frontend ke Firebase Hosting saat merge ke main | High | M | Firebase project setup |
| Health check endpoint `/api/health` | Medium | S | - |
| Monitoring uptime (misal UptimeRobot free tier) | Medium | S | - |
| Setup Sentry untuk error tracking production (frontend + backend) | High | M | - |

---

### PHASE 3 — Queue & Async Infrastructure (Minggu 4-5)
**Target:** Minggu 4-5 | **Bergantung Backend Phase 3**

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| Setup Supervisor process untuk `php artisan queue:work --tries=3` | High | M | Backend E1, E2 |
| Setup Redis untuk queue dan cache production | Medium | M | Server Redis |
| Queue monitoring dengan Laravel Horizon | Low | M | Redis |

---

### PHASE 4 — Production Hardening (Bulan 2)
**Target:** Bulan 2

| Task | Prioritas | Complexity | Dependencies |
|------|-----------|------------|--------------|
| SSL/TLS certificate dan HTTPS enforcement | Critical | S | Domain DNS |
| Setup SPF/DKIM record untuk email deliverability | Medium | S | Domain DNS |
| IP whitelist untuk Midtrans webhook | Medium | S | Backend F3 |
| Scheduled maintenance window notification | Low | S | - |
| Load testing dengan k6 (100 concurrent users checkout) | High | L | Staging environment |
| Security audit: `npm audit` + `composer audit` | High | M | - |

---

## DEPENDENCY MAP LINTAS TIM

```
Backend Phase 0 (DONE)
    └── Backend Phase 1 ──────┬── QA Phase 1 (concurrent checkout, stok)
                              ├── Frontend E1, E2 (MOQ, stok habis)
                              └── Performance (load test, indexes)

Frontend Phase 0 (Firebase) ──── QA F7 (test settings post-migrasi)
    └── selesai ───────────────── Frontend A3 (hapus dependency)

Backend Phase 3 (Wallet) ─────── Frontend Phase 3 (halaman wallet)
    └── perlu approval ────────── UI/UX C5 (desain wallet)

UI/UX Phase 0 (design system) ── Frontend D5 (skeleton loading)
UI/UX Phase 1 (flows) ────────── Frontend D1, D2 (komponen baru)

DevOps Phase 1 (Nginx) ────────── Performance D1 (compression)
DevOps Phase 3 (Queue) ────────── Backend E1, E2 (async commission)
```

---

## TIMELINE VISUAL

```
Minggu 1        Minggu 2        Minggu 3        Minggu 4-5      Bulan 2         Bulan 3
|_______________|_______________|_______________|_______________|_______________|
BACKEND
[DONE: P0    ][   P1 MySQ/Idx ][   P2 Optim   ][   P3 Wallet  ][  P4 Midtrans ][  P5 Tests  ]

FRONTEND
[P0 Firebase  ][P0+P1 Cleanup  ][  P2 Komponen ][  P3 Fitur    ][ P4 Optimasi  ]

UI/UX
[P0 DesignSys ][  P1 User Flow ][  P2 Refinement               ][  P3 Wallet   ]

QA
[P0 Setup     ][P1 Critical    ][  P2 High Prio][   P3 Medium  ][  Regression  ][ Full Cover ]

DEVOPS
[P0 Setup     ][  P1 Infra     ][P2 CI/CD      ][  P3 Queue    ][P4 Hardening  ]
```

---

## PRIORITAS TINDAKAN MINGGU INI (2026-04-16)

Berdasarkan analisis: **3 hal yang paling mendesak saat ini:**

**1. Frontend (CRITICAL, mulai hari ini):**
- `A4` — pindahkan Firebase API key ke `.env` (S, 30 menit)
- `A1` — mulai migrasi `PaymentSettings.jsx` dari Firebase ke `settingsApi`
- `A2` — mulai migrasi `Appearance.jsx` dari Firebase ke `settingsApi`

**2. Backend (mulai paralel):**
- `B4` — validasi dan kurangi stok di `OrderService` (stok tidak pernah berkurang = bug finansial)
- `B6` — fix bug `TierService::checkDowngrades()` reset `last_transaction_at`

**3. QA (setup dulu sebelum terlambat):**
- `A1-A5` — setup test plan, environment, dan PHPUnit structure
- `D2` — buat seeder chain MLM 7 level untuk test commission

---

## RISIKO TERATAS (TOP 5)

| Rank | Risiko | Dampak | Mitigasi |
|------|--------|--------|----------|
| 1 | Firebase API key mungkin exposed di git history | Critical | Rotate key SEKARANG, jangan tunggu migrasi selesai |
| 2 | Stok tidak pernah berkurang — overbooking bisa terjadi | Critical | Backend B4 prioritas tinggi minggu ini |
| 3 | Commission MLM N+1 query — bisa timeout saat chain panjang di production | High | Fix sebelum production launch (Backend C1) |
| 4 | Test coverage hampir 0% — bug commission bisa lolos ke production | High | QA setup + Backend G2 harus dikerjakan paralel |
| 5 | SQLite ke MySQL migration bisa expose hidden query issues | High | Full regression test wajib setelah migrasi |

---

## INSTRUKSI UNTUK SETIAP TIM

### Backend Team
Next action: Kerjakan **B4** (kurangi stok di OrderService) dan **B6** (fix TierService bug) minggu ini. B1 (MySQL migration) perlu koordinasi DevOps untuk server. Jangan mulai Phase 3 (Wallet) sebelum mendapat approval Supervisor.

### Frontend Team
Next action: **Hari ini** pindahkan Firebase key ke `.env` (A4). Lalu prioritaskan migrasi `Appearance.jsx` dan `PaymentSettings.jsx`. Ini adalah satu-satunya hal yang menghalangi project dari production readiness.

### UI/UX Team
Next action: Mulai audit design token Tailwind (A1) dan buat style guide komponen (A2). Koordinasi dengan Frontend untuk memastikan handoff design berjalan sebelum Frontend memulai komponen baru di Phase 2.

### QA Team
Next action: Setup test environment dan buat seeder MLM chain 7 level segera. Tanpa ini, Commission distribution testing tidak bisa dimulai — padahal ini adalah area paling berisiko finansial di seluruh project.

### DevOps Team
Next action: Provision MySQL production server dan setup environment staging. Backend tidak bisa melanjutkan B1 tanpa server tersedia.
