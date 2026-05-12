# STARINC Platform — Developer Guideline
> Last updated: 2026-05-06 | Stack: React 19 + Vite / Laravel 13 / MySQL | Developed with Claude Code

---

## Daftar Isi
1. [Status Proyek Saat Ini](#1-status-proyek-saat-ini)
2. [Yang Sudah Selesai](#2-yang-sudah-selesai)
3. [Yang Belum Selesai](#3-yang-belum-selesai)
4. [Yang Perlu Diperbaiki](#4-yang-perlu-diperbaiki--bug--technical-debt)
5. [Arsitektur Sistem](#5-arsitektur-sistem)
6. [Panduan Develop dengan Claude Code](#6-panduan-develop-dengan-claude-code-hemat-token)
7. [Roadmap Pengembangan](#7-roadmap-pengembangan)
8. [Konvensi & Standar Kode](#8-konvensi--standar-kode)

---

## 1. Status Proyek Saat Ini

```
[████████████████████] 98% — Phase 0-5 Done, Sisa: SSL/domain + Supervisor queue worker
```

Fondasi arsitektur solid, Firebase dihapus, Midtrans sandbox live, email verification aktif, Phase 2 optimasi selesai (lazy loading, code splitting, error boundary, skeleton). VPS live di IDCloudHost (157.10.161.83) MySQL + Nginx + Laravel. Yang tersisa: Wallet/ledger, notifikasi email (SMTP config), Supervisor queue worker, SSL/domain.

**Tech Stack:**
- Frontend : React 19 + Vite 7 + Tailwind CSS 4 + Axios
- Backend  : Laravel 13 + Sanctum (Bearer Token)
- Database : SQLite (dev) → target MySQL (prod)
- Auth     : Laravel Sanctum (stateless API token)
- Deploy   : Firebase Hosting (frontend) + target VPS (backend)

---

## 2. Yang Sudah Selesai

### Backend (Laravel API)

#### Autentikasi & User
- [x] Register, Login, Logout via Sanctum
- [x] Profile update (nama, HP, alamat, kota, kode pos)
- [x] Update password
- [x] Role system: `regular`, `starcenter`, `admin`
- [x] Referral code generation otomatis (8 char unique)
- [x] Middleware `EnsureIsAdmin` untuk proteksi route admin
- [x] Email verification saat registrasi (`MustVerifyEmail`, `EmailVerificationController`)
- [x] Forgot password & reset password flow (`PasswordResetController`)

#### Database Schema
- [x] Migration: `users` (extended dengan phone, address, role, tier_id, referrer_id, referral_code, cumulative_spending, last_transaction_at)
- [x] Migration: `tiers` (sort_order, min_spend, discount_percent)
- [x] Migration: `products` + `product_variants` + `product_media`
- [x] Migration: `orders` + `order_items`
- [x] Migration: `payment_proofs`
- [x] Migration: `commissions` (level 1-7, source_user_id, status)
- [x] Migration: `system_settings` + `appearance_settings`
- [x] Migration: `starcenter_network` (closure table, depth 1-7)
- [x] Seeders: Admin, Tier, SystemSetting, Appearance, DummyData

#### Logika Bisnis (Services)
- [x] `OrderService` — server-side price calculation, tier discount, MOQ validation starcenter, inventory
- [x] `TierService::evaluateUpgrade()` — auto-upgrade tier berdasarkan cumulative_spending
- [x] `TierService::checkDowngrades()` — logika penurunan tier >N hari tidak transaksi
- [x] `CommissionService::distribute()` — SDP single-level (5%) + Starcenter MLM multi-level (max 7 level)
- [x] `CommissionService::cancelForOrder()` — cancel komisi saat order di-cancel
- [x] Artisan Command: `tier:check-downgrades`

#### Admin API
- [x] Dashboard stats (revenue, orders, users, commissions)
- [x] CRUD Produk + upload media
- [x] Manajemen order (list, update status, review payment proof)
- [x] Manajemen user (list, detail, update role)
- [x] Manajemen komisi (list, pay single, bulk pay, export)
- [x] Settings: tiers, system settings (komisi rates, MOQ, shipping)
- [x] Export orders (CSV/PDF placeholder)

#### Payment Gateway (Midtrans)
- [x] `MidtransService` — generate Snap token dengan item_details, customer_details, retry suffix
- [x] `WebhookController::midtrans()` — validasi signature SHA512, idempotency guard, handle settlement/capture/expire/deny
- [x] Migration `midtrans_order_id` + `payment_method` di tabel `orders`
- [x] Webhook route public `POST /api/webhook/midtrans` (tanpa auth)
- [x] Re-pay endpoint `POST /orders/{orderNumber}/repay` — generate snap token baru dengan suffix `-{timestamp}`
- [x] Cancel order endpoint `POST /orders/{orderNumber}/cancel` — hanya saat `pending_payment`, restore stok
- [x] Feature tests `MidtransWebhookTest` — 10 tests (signature, settlement, capture, expire, idempotency, retry order_id)

#### User API
- [x] Checkout dengan validasi server-side
- [x] Checkout returns `snap_token` untuk Midtrans Snap popup
- [x] Upload bukti transfer (private storage, MIME validation)
- [x] Cancel order sebelum pembayaran
- [x] Riwayat order saya
- [x] Komisi saya (paginated)
- [x] Referral link + jaringan downline

### Frontend (React)

#### Halaman Publik
- [x] Home (hero, produk unggulan, CMS dari API) — redesign editorial, bilingual EN/ID
- [x] Catalog (filter, search, pagination)
- [x] Product Detail (gambar, varian, tambah ke cart) — tampilkan "Stok Habis", disable button jika stok habis
- [x] Cart Drawer (state + localStorage persist)
- [x] Checkout (form alamat, kalkulasi real-time, Midtrans Snap popup, fallback manual transfer)
- [x] Invoice (by order number) — tampil info Midtrans atau transfer manual, upload bukti bayar, tombol Bayar Sekarang (repay), tombol Batalkan Pesanan
- [x] Login & Register (dengan referral code dari URL param)
- [x] Verify Email (instruksi + resend button setelah register)
- [x] Forgot Password & Reset Password
- [x] Join Starcenter page
- [x] Center Shop (halaman khusus starcenter)

#### Halaman User Authenticated
- [x] Profile (info, edit, ganti password)
- [x] Track Orders / Profile Orders (riwayat + status timeline, upload bukti bayar, cancel pesanan)
- [x] Network Tree (visualisasi jaringan downline)

#### Halaman Admin
- [x] Dashboard (chart revenue via Recharts)
- [x] Products (CRUD + upload gambar + stock management)
- [x] Orders (list, filter, update status, lihat bukti bayar, tampil info Midtrans jika bayar via gateway)
- [x] Users (list, filter, update role, detail user, network, order history)
- [x] Commissions (list, pay, bulk pay)
- [x] Tiers (edit threshold & discount)
- [x] Appearance (CMS beranda, logo upload, editorial section)
- [x] Payment Settings (rekening bank via Laravel API)
- [x] Starcenter Applications (list, detail, approve/reject)

#### State Management
- [x] `AuthContext` — user, token, login/logout
- [x] `CartContext` — cart state + localStorage sync
- [x] `AppearanceContext` — tema dari API

#### API Layer
- [x] `src/api/client.js` — Axios instance + interceptors (auth header, 401 redirect)
- [x] `authApi.js`, `productApi.js`, `orderApi.js`, `networkApi.js`, `adminApi.js`, `settingsApi.js`

---

## 3. Yang Belum Selesai

### CRITICAL — Harus Selesai Sebelum Production

#### P0.1 — Scheduled Task Tier Downgrade Tidak Terdaftar

**File:** `starinc-api/routes/console.php`

Command `tier:check-downgrades` sudah ada tapi tidak dijadwalkan. Tambahkan:

```php
// starinc-api/routes/console.php
use Illuminate\Support\Facades\Schedule;

Schedule::command('tier:check-downgrades')->dailyAt('02:00');
```

Lalu pastikan cron server berjalan:
```bash
# Di server production (crontab -e):
* * * * * cd /path/to/starinc-api && php artisan schedule:run >> /dev/null 2>&1
```

#### P0.2 — Migrasi Database SQLite → MySQL

Untuk production, SQLite tidak mendukung concurrent writes dengan baik.

```bash
# starinc-api/.env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=starinc_db
DB_USERNAME=root
DB_PASSWORD=secret
```

Setelah ubah .env:
```bash
cd starinc-api
php artisan migrate:fresh --seed
```

#### P0.3 — Konfigurasi SMTP Email untuk Production

Email sudah di-queue (`Mail::queue()`) tapi belum bisa terkirim karena `MAIL_PASSWORD` di `.env` masih kosong. Semua mailable sudah dibuat (OrderConfirmed, PaymentApproved, PaymentRejected, OrderShipped, VerifyEmail, ResetPassword).

**Opsi A — Gmail SMTP (lebih cepat):**
```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=starinc.id@gmail.com
MAIL_PASSWORD=<app-password-16-digit>
MAIL_FROM_ADDRESS="starinc.id@gmail.com"
```
Setup: aktifkan 2FA di Google → buka myaccount.google.com/apppasswords → generate App Password.

**Opsi B — Resend API (lebih proper, sudah terinstall):**
```
MAIL_MAILER=resend
MAIL_FROM_ADDRESS="noreply@starinc.com"  # harus domain sendiri
```
Package `resend/resend-laravel` sudah terinstall, `RESEND_API_KEY` sudah ada di `.env`.

---

### P1 — Fitur Bisnis yang Belum Ada

#### P1.1 — Wallet / Ledger Komisi

Saat ini ketika admin klik "Pay Commission", status berubah jadi `paid` tapi tidak ada sistem saldo wallet untuk user starcenter. Tidak ada cara user melihat total saldo atau melakukan penarikan (withdrawal).

Yang perlu dibuat:
- Tabel `wallet_ledgers` (user_id, type: credit/debit, amount, description, reference_id)
- Endpoint `GET /user/wallet` — total saldo + riwayat transaksi
- Endpoint `POST /user/wallet/withdraw` — request penarikan
- Halaman frontend: Wallet di Profile

#### P1.2 — Notifikasi (Email)

Email sudah di-queue untuk semua event penting (OrderConfirmed, PaymentApproved, PaymentRejected, OrderShipped, VerifyEmail, ResetPassword). **Yang tersisa hanya konfigurasi SMTP** — lihat P0.3 di atas.

Opsional: WhatsApp via Fonnte/Wablas API (belum dikerjakan).

#### P1.3 — Validasi & Pengurangan Stok di OrderService

UI "Stok Habis" sudah ada di `ProductDetail.jsx`. Admin bisa set stock lewat form produk. Yang **masih belum ada**:

```php
// starinc-api/app/Services/OrderService.php — createOrder()
// Tambahkan sebelum menyimpan order:
foreach ($items as $item) {
    $product = Product::find($item['product_id']);
    if ($product->stock !== null && $product->stock < $item['quantity']) {
        throw new \Exception("Stok {$product->title} tidak mencukupi.");
    }
}
// Setelah order tersimpan:
foreach ($order->items as $item) {
    Product::where('id', $item->product_id)->whereNotNull('stock')
        ->decrement('stock', $item->quantity);
}
```

#### P1.4 — Rate Limiting Auth

Login/register sudah ada `throttle:30,1` tapi terlalu longgar. Perketat:

```php
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/register', ...);
    Route::post('/login', ...);
});
```

---

### P2 — Optimasi Performa

#### P2.1 — Cache System Settings

`SystemSetting::getValue()` dipanggil berkali-kali per request tanpa cache:

```php
// Tambahkan helper di SystemSetting model:
public static function getCached(string $key, mixed $default = null): mixed
{
    return Cache::remember("setting_{$key}", 3600, fn() =>
        static::getValue($key, $default)
    );
}

// Invalidate cache saat settings diupdate:
Cache::forget("setting_{$key}");
```

#### P2.2 — Eager Loading MLM Chain

`CommissionService::distributeMLM()` saat ini loop dengan N query per order. Refactor:

```php
// Ambil seluruh chain sekaligus:
$chain = StarcenterNetwork::where('downline_id', $starcenter->id)
    ->orderBy('depth')
    ->with('upline')
    ->get();
```

#### P2.3 — Database Indexes

Tambahkan indexes di migration atau via migration baru:
```php
// users
$table->index('referrer_id');
$table->index('referral_code');
$table->index(['role', 'tier_id']);

// orders
$table->index(['user_id', 'status']);
$table->index('order_number');

// commissions
$table->index(['user_id', 'status']);
$table->index('order_id');

// starcenter_network
$table->index(['upline_id', 'depth']);
$table->index('downline_id');
```

#### P2.4 — Frontend Bundle Optimization

Setelah Firebase dihapus, lanjutkan optimasi Vite:

```js
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          ui: ['sweetalert2', 'lucide-react'],
        }
      }
    }
  }
})
```

#### P2.5 — React Lazy Loading

```jsx
// App.jsx — ganti static imports dengan lazy:
const Catalog = lazy(() => import('./pages/Catalog'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

// Wrap routes dengan Suspense:
<Suspense fallback={<PageLoader />}>
  <Routes>...</Routes>
</Suspense>
```

---

## 4. Yang Perlu Diperbaiki — Bug & Technical Debt

### Bug / Logic Issues

| ID | File | Masalah | Prioritas |
|----|------|---------|-----------|
| B1 | `TierService::checkDowngrades()` | Setelah downgrade, `last_transaction_at` di-reset ke `now()`. Berarti user tidak akan didowngrade lagi selama 30 hari berikutnya meskipun masih tidak belanja. | Medium |
| B2 | `api.php` route `/user/referral-link` | 50+ baris logika bisnis inline di route file, bukan di controller | Low |
| B3 | `api.php` route `/user/commissions` | Query + paginate inline di route file | Low |
| B4 | `OrderController` | Tidak ada validasi bahwa `variant_id` memang milik `product_id` yang dikirim | Medium |
| B5 | `src/pages/admin/Appearance.jsx` | `firebase.js` exposed API key | ✅ Fixed — Firebase dihapus |
| B6 | `OrderService::createOrder()` | Tidak ada validasi atau pengurangan stok — order bisa dibuat meski stok 0 | Medium |

### Technical Debt

| ID | Area | Debt | Effort |
|----|------|------|--------|
| T1 | Backend | Tidak ada Repository pattern (Service langsung ke Model) | High effort, Low urgency |
| T2 | Backend | `api.php` terlalu panjang (150+ baris), perlu route grouping yang lebih bersih | Low |
| T3 | Frontend | Tidak ada error boundary di React | Medium |
| T4 | Frontend | Tidak ada loading skeleton, hanya spinner sederhana | Low |
| T5 | Frontend | `Catalog.jsx` dan `Products.jsx` terlalu panjang (277 + 815 baris) — perlu dipecah ke komponen | Medium |
| T6 | Testing | Tidak ada unit test untuk Services atau API endpoints | High |

---

## 5. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  React 19 + Vite + Tailwind 4                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐    │
│  │AuthCtx   │ │CartCtx   │ │AppearanceCtx         │    │
│  └──────────┘ └──────────┘ └──────────────────────┘    │
│  src/api/ (Axios) ──── Authorization: Bearer <token>    │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────┐
│              LARAVEL 13 API SERVER                       │
│  routes/api.php                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │Controllers   │→ │Services      │→ │Models        │  │
│  │(HTTP layer)  │  │(Business     │  │(Eloquent ORM)│  │
│  │              │  │ Logic)       │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  Middleware: auth:sanctum, EnsureIsAdmin, throttle       │
│  Scheduler: tier:check-downgrades (daily 02:00)         │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  DATABASE (MySQL)                        │
│  users → tiers                                          │
│  users → orders → order_items                           │
│  orders → payment_proofs                                │
│  orders → commissions → users (earner + source)         │
│  users → starcenter_network (closure table, depth 1-7)  │
│  system_settings / appearance_settings                  │
└─────────────────────────────────────────────────────────┘
```

### Alur Request Checkout (Contoh Alur Kritis)

```
Frontend Checkout.jsx
  → POST /api/checkout (items[], customer_info)
  → OrderController::checkout()
    → OrderService::createOrder()
      ├── Hitung harga dari DB (bukan dari frontend)
      ├── Ambil discount dari user->tier->discount_percent
      ├── Validasi MOQ jika role starcenter
      └── DB::transaction → simpan Order + OrderItems
  ← Response: { order_number, total, ... }

Admin verify bukti bayar → PUT /api/admin/orders/{id}/status (completed)
  → OrderController::updateStatus()
    → TierService::evaluateUpgrade(buyer)    ← upgrade tier
    → CommissionService::distribute(order)   ← sebar komisi ke upline
```

---

## 6. Panduan Develop dengan Claude Code (Hemat Token)

### Prinsip Dasar — Token = Uang

> Satu sesi Claude Code yang buruk bisa menghabiskan 10x token lebih banyak dari yang seharusnya.
> Gunakan prinsip ini: **semakin sedikit konteks yang dimuat, semakin hemat.**

---

### Strategi Hemat Token

#### A. Mulai Sesi dengan Konteks Minimal

Jangan buka semua file di awal. Beri instruksi spesifik:

```
// BURUK — Claude akan baca semua file
"Perbaiki sistem komisi di proyek ini"

// BAGUS — konteks sudah cukup, langsung ke file
"Di starinc-api/app/Services/CommissionService.php,
 method distributeMLM() loop query N+1.
 Refactor agar chain di-eager load sebelum loop."
```

#### B. Gunakan CLAUDE.md dan GUIDELINE.md sebagai Briefing

Sebelum mulai task baru, referensikan file ini:

```
"Baca GUIDELINE.md section 'Yang Belum Selesai' bagian P0.1,
 lalu migrasikan PaymentSettings.jsx dari Firebase ke Laravel API."
```

Claude akan tahu konteks tanpa perlu membaca seluruh codebase.

#### C. Satu Sesi = Satu Task

Jangan campurkan task berbeda dalam satu sesi:

```
// BURUK — 2 task berbeda, konteks melebar
"Perbaiki komisi DAN buat halaman wallet"

// BAGUS — fokus satu task
"Buat migration tabel wallet_ledgers dan model WalletLedger
 sesuai skema di GUIDELINE.md bagian P1.1"
```

#### D. Berikan Lokasi File yang Spesifik

```
// BURUK — Claude harus scan seluruh proyek
"Tambahkan validasi stok produk"

// BAGUS — langsung ke target
"Di starinc-api/app/Services/OrderService.php, method createOrder(),
 setelah baris kalkulasi $lineTotal, tambahkan validasi:
 jika $product->stock < $quantity throw exception."
```

#### E. Gunakan Perintah Terstruktur untuk Backend

Urutan kerja yang efisien untuk fitur baru:

```
Step 1: "Buat migration untuk tabel [nama]"
Step 2: "Buat Model [Nama] dengan fillable, relationships, casts"
Step 3: "Tambahkan method di [Service] untuk logika bisnis"
Step 4: "Tambahkan endpoint di [Controller] dan route di api.php"
Step 5: "Buat fungsi di src/api/[module]Api.js"
Step 6: "Buat/update komponen React yang pakai API ini"
```

Dengan langkah terpisah, tiap sesi pendek dan fokus.

#### F. Gunakan Mode `/compact` atau `--continue` Saat Sesi Panjang

Jika sesi sudah panjang dan konteks membengkak, minta Claude untuk ringkas:

```
"Ringkas sesi ini: apa yang sudah dilakukan, apa yang belum,
 file mana yang berubah. Simpan sebagai catatan."
```

#### G. Template Prompt untuk Task Umum

**Membuat API endpoint baru:**
```
Tambahkan endpoint [METHOD] /api/[path] di Laravel.
- Controller: [NamaController]
- Validasi input: [field: rules]
- Service method yang dipanggil: [ServiceName::method()]
- Response format: { data: {...} }
- Auth required: yes/no
- Admin only: yes/no
```

**Membuat komponen React baru:**
```
Buat komponen [NamaKomponen] di src/[lokasi].
- Data dari API: [endpoint]
- State yang dibutuhkan: [daftar state]
- Props: [daftar props]
- Gunakan pola yang sama dengan [komponen serupa yang sudah ada]
- Tailwind classes: mobile-first
```

**Debugging:**
```
Di [file:baris], terjadi error: [pesan error].
Context: [apa yang dilakukan user saat error].
Jangan ubah file lain. Fokus fix di file ini saja.
```

---

### Workflow Harian yang Direkomendasikan

```
1. Buka GUIDELINE.md → pilih 1 item dari backlog
2. Mulai sesi Claude Code dengan instruksi spesifik
3. Claude buat perubahan
4. Test manual (atau php artisan test)
5. Commit ke git dengan pesan deskriptif
6. Update GUIDELINE.md — centang item yang selesai
7. Tutup sesi
```

---

### Perintah Git yang Wajib Dijalankan Setelah Setiap Sesi

```bash
# Backend
cd starinc-api
php artisan test                    # pastikan tidak ada regresi
./vendor/bin/pint                   # format kode PHP

# Frontend
npm run lint                        # cek ESLint
npm run build                       # pastikan build tidak error

# Commit
git add [file spesifik, bukan git add .]
git commit -m "feat: [deskripsi singkat]"
```

---

## 7. Roadmap Pengembangan

### Phase 0 — Cleanup & Stabilisasi (Minggu 1)
> Target: Platform bebas dari Firebase, aman, dan scheduled task jalan

| # | Task | File(s) | Estimasi | Status |
|---|------|---------|----------|--------|
| 0.1 | Migrasi `PaymentSettings.jsx` dari Firebase ke `/api/admin/settings` | `PaymentSettings.jsx` | 1 sesi | ✅ Done |
| 0.2 | Migrasi `Appearance.jsx` dari Firebase ke `/api/admin/appearance` | `Appearance.jsx` | 2 sesi | ✅ Done |
| 0.3 | Hapus `src/lib/firebase.js` dan `firebase` dari `package.json` | `package.json`, `firebase.js` | 1 sesi | ✅ Done |
| 0.4 | Daftarkan `Schedule::command('tier:check-downgrades')` | `routes/console.php` | 5 menit | ✅ Done |
| 0.5 | Tambahkan `throttle:5,1` di route login & register | `routes/api.php` | 5 menit | ✅ Done |
| 0.6 | Pindahkan inline route logic ke `NetworkController` + `CommissionController` | `routes/api.php` | 1 sesi | ✅ Done |
| 0.7 | **Verifikasi Email Registrasi** — `MustVerifyEmail`, controller, frontend flow | `User.php`, `EmailVerificationController.php`, `VerifyEmail.jsx` | 2 sesi | ✅ Done |

### Phase 1 — Production Readiness (Minggu 2)
> Target: Bisa dipakai user nyata

| # | Task | File(s) | Estimasi |
|---|------|---------|----------|
| 1.1 | Migrasi SQLite → MySQL (update .env + test semua endpoint) | `.env`, `database.sqlite` | 1 sesi | ✅ Done (VPS pakai MySQL 8.0) |
| 1.2 | Tambahkan database indexes via migration baru | migration baru | 1 sesi | ✅ Done |
| 1.3 | Cache `SystemSetting::getValue()` dengan `Cache::remember()` | `SystemSetting.php` | 1 sesi | ✅ Done |
| 1.4 | Validasi & pengurangan stok produk di `OrderService` | `OrderService.php` | 1 sesi | ✅ Done |
| 1.5 | Validasi upload bukti bayar (MIME type, max size, private storage) | `OrderController.php` | 1 sesi | ✅ Done |
| 1.6 | Frontend: Tampilkan peringatan MOQ di Cart untuk starcenter | `CartDrawer.jsx` | 1 sesi | ✅ Done |

### Phase 2 — Optimasi Performa (Minggu 3)
> Target: Cepat di mobile, skor Lighthouse > 85

| # | Task | File(s) | Estimasi |
|---|------|---------|----------|
| 2.1 | Refactor `CommissionService` — eager load MLM chain | `CommissionService.php` | 1 sesi | ✅ Done |
| 2.2 | React.lazy() untuk semua halaman + `<Suspense>` | `App.jsx` | 1 sesi | ✅ Done |
| 2.3 | Vite manual chunk splitting (vendor, charts, ui) | `vite.config.js` | 1 sesi | ✅ Done |
| 2.4 | Lazy loading gambar produk (`loading="lazy"` + Intersection Observer) | `ProductCard.jsx`, `Catalog.jsx` | 1 sesi | ✅ Done |
| 2.5 | Error boundary React untuk halaman admin | buat `ErrorBoundary.jsx` | 1 sesi | ✅ Done |
| 2.6 | Loading skeleton untuk list produk & order | buat `Skeleton.jsx` | 1 sesi | ✅ Done |

### Phase 3 — Fitur Wallet & Notifikasi (Minggu 4-5)
> Target: Ekosistem komisi lengkap

| # | Task | File(s) | Estimasi |
|---|------|---------|----------|
| 3.1 | Migration tabel `wallet_ledgers` | migration baru | 1 sesi | ✅ Done |
| 3.2 | Model `WalletLedger` + relasi ke `User` | `WalletLedger.php` | 30 menit | ✅ Done |
| 3.3 | Update `AdminController` — credit wallet saat commission paid | `AdminController.php` | 1 sesi | ✅ Done |
| 3.4 | API: `GET /user/wallet` + `POST /user/wallet/withdraw` | `WalletController.php` | 1 sesi | ✅ Done |
| 3.5 | Frontend: Tab Wallet di Profile + `ProfileWallet.jsx` + `walletApi.js` | multiple | 2 sesi | ✅ Done |
| 3.6 | Konfigurasi Resend API untuk email | `starinc-api/.env` | 30 menit | ✅ Done — `MAIL_MAILER=resend`, from `noreply@starincofficial.id` |

### Phase 4 — Payment Gateway Midtrans ✅ SELESAI
> Semua sudah dikerjakan — sandbox live dan verified

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 4.1 | Install `midtrans/midtrans-php`, konfigurasi `.env` + `config/services.php` | `composer.json`, `.env` | ✅ Done |
| 4.2 | Buat `MidtransService` — generate Snap token + retry suffix | `app/Services/MidtransService.php` | ✅ Done |
| 4.3 | Update `OrderController::checkout()` — return `snap_token` + `repaySnapToken()` + `cancelOrder()` | `OrderController.php` | ✅ Done |
| 4.4 | Migration `midtrans_order_id` + `payment_method` di tabel `orders` | migration | ✅ Done |
| 4.5 | `WebhookController::midtrans()` — signature, idempotency, retry order_id, tier+commission trigger | `WebhookController.php` | ✅ Done |
| 4.6 | Route webhook public + repay + cancel | `routes/api.php` | ✅ Done |
| 4.7 | Frontend: Snap JS lazy-loaded, `window.snap.pay()` di Checkout + Invoice | `Checkout.jsx`, `Invoice.jsx` | ✅ Done |
| 4.8 | Admin Orders: tampil info Midtrans (payment_method, transaction_id) | `admin/Orders.jsx` | ✅ Done |
| 4.9 | Feature tests: `MidtransWebhookTest` — 10 tests passing | `tests/Feature/` | ✅ Done |
| 4.10 | Cancel order UI (Invoice + ProfileOrders) + API + backend | multiple | ✅ Done |

### Phase 5 — PWA & Advanced (Bulan 3+)
> Target: Platform bisa diinstall di HP

| # | Task | Estimasi |
|---|------|----------|
| 5.1 | Service Worker + Web App Manifest (PWA) via vite-plugin-pwa | 2 sesi | ✅ Done — SW + manifest + runtime cache appearance & products |
| 5.2 | Push notification untuk status order | 2 sesi | ⏳ Skip — butuh infrastructure tambahan |
| 5.3 | Unit & Feature tests (PHPUnit untuk Services) | 3-4 sesi | ✅ Done — 104 tests, 271 assertions |
| 5.4 | API rate limiting & response compression | 1 sesi | ✅ Done — global throttle:60,1 + throttle:5,1 auth |
| 5.5 | Admin report: export CSV orders/commissions + PDF laporan bulanan | 2 sesi | ✅ Done — CSV download + dompdf monthly report |

---

## 8. Konvensi & Standar Kode

### Backend (Laravel)

```
Naming:
- Controller  : [Resource]Controller (misal: WalletController)
- Service     : [Domain]Service (misal: WalletService)
- Model       : PascalCase singular (misal: WalletLedger)
- Migration   : yyyy_mm_dd_hhmmss_[action]_[table]_table.php
- Route group : prefix '/admin' + middleware EnsureIsAdmin

Aturan:
- Controller HANYA handle HTTP (validate, call service, return response)
- Service berisi SEMUA business logic
- Model hanya berisi fillable, casts, relationships, scopes
- Semua response JSON pakai format: { data: {...} } atau { message: '...' }
- Gunakan DB::transaction() untuk operasi multi-tabel
```

### Frontend (React)

```
Naming:
- Komponen   : PascalCase (misal: WalletCard.jsx)
- Halaman    : PascalCase, di src/pages/
- Hooks      : camelCase dengan prefix 'use' (misal: useWallet.js)
- API module : camelCase dengan suffix 'Api' (misal: walletApi.js)
- Context    : PascalCase dengan suffix 'Context' (misal: WalletContext.jsx)

Aturan:
- SEMUA API call melalui src/api/ (jangan fetch langsung di komponen)
- Gunakan Tailwind, jangan custom CSS kecuali terpaksa
- Mobile-first: mulai dari kelas tanpa prefix, tambah md: lg: untuk besar
- Jangan tambahkan state yang tidak perlu (gunakan data dari API response)
- Prop drilling lebih dari 2 level → pakai Context
```

### Git Commit Format

```
feat: [deskripsi fitur baru]
fix: [deskripsi bug yang diperbaiki]
refactor: [perubahan kode tanpa ubah behavior]
perf: [optimasi performa]
chore: [task non-code: update deps, config, dsb]

Contoh:
feat: tambah endpoint wallet ledger dan model WalletLedger
fix: perbaiki N+1 query di CommissionService distributeMLM
perf: cache SystemSetting::getValue() dengan Redis
```

---

## Catatan Penting untuk Sesi Claude Code

1. **Selalu sebut nama file + baris** saat melaporkan bug atau minta perubahan
2. **Satu task per sesi** — jangan gabungkan backend + frontend dalam satu instruksi panjang
3. **Setelah selesai satu Phase**, jalankan `php artisan test` dan `npm run build` untuk memastikan tidak ada regresi
4. **Update file ini** setiap kali ada item yang selesai — checklist ini adalah sumber kebenaran status proyek
5. **Jangan skip database indexes** — ini yang paling sering dilupakan dan paling berdampak saat data mulai besar

---

*File ini dikelola secara manual. Update setiap kali ada perubahan signifikan pada proyek.*
