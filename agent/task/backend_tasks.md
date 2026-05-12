# Task List — Tim Backend Developer

> Proyek: SDP-V2 (E-commerce + MLM Platform)
> Stack: Laravel 13 + Sanctum + Eloquent ORM + SQLite (dev) → MySQL (prod)
> Tanggal: 2026-04-16

---

## 1. Ringkasan Tanggung Jawab

Tim Backend bertanggung jawab atas semua logika server-side: API endpoints, business logic di Services, database schema & migrations, autentikasi via Sanctum, middleware, scheduled tasks, dan keamanan API. Fokus saat ini: stabilisasi sebelum production (Phase 0–1), lalu pengembangan fitur wallet & notifikasi (Phase 3).

**Prinsip Arsitektur yang Wajib Diikuti:**
- Controller hanya handle HTTP (validate input → call service → return response)
- Service berisi SEMUA business logic
- Model hanya berisi `fillable`, `casts`, `relationships`, `scopes`
- Semua response JSON: `{ data: {...} }` atau `{ message: '...' }`
- Gunakan `DB::transaction()` untuk operasi multi-tabel

---

## 2. Task Breakdown

### A. CRITICAL — Phase 0 (Cleanup & Stabilisasi)

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| A1 ✅ | Daftarkan `tier:check-downgrades` di scheduler | Critical | `starinc-api/routes/console.php` | Tambahkan `Schedule::command('tier:check-downgrades')->dailyAt('02:00');`. Tanpa ini tier downgrade tidak pernah berjalan. |
| A2 ✅ | Tambahkan rate limiting di endpoint auth | Critical | `starinc-api/routes/api.php` | Wrap `POST /login` dan `POST /register` dengan `middleware('throttle:5,1')`. Endpoint saat ini rentan brute-force. |
| A3 ✅ | Pindahkan inline route logic ke Controller | High | `starinc-api/routes/api.php` | Route `/user/referral-link` dan `/user/commissions` punya 50+ baris logika bisnis langsung di `api.php`. Pindahkan ke `NetworkController` dan `CommissionController`. |
| A4 ✅ | Validasi `variant_id` milik `product_id` di checkout | High | `starinc-api/app/Http/Controllers/Api/OrderController.php` | Tambahkan validasi bahwa variant yang dikirim memang milik produk yang sama. Cegah manipulasi harga dari frontend. |

### B. Production Readiness — Phase 1

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| B1 ✅ | Migrasi SQLite → MySQL | High | `starinc-api/.env` | Ubah `DB_CONNECTION=mysql`, set kredensial MySQL, jalankan `php artisan migrate:fresh --seed`. SQLite tidak mendukung concurrent writes untuk production. |
| B2 ✅ | Tambahkan database indexes | High | Buat migration baru | Tambahkan indexes untuk `users.referrer_id`, `users.referral_code`, `orders.(user_id, status)`, `orders.order_number`, `commissions.(user_id, status)`, `starcenter_network.(upline_id, depth)`. Lihat detail di GUIDELINE.md bagian P2.3. |
| B3 ✅ | Cache `SystemSetting::getValue()` | High | `starinc-api/app/Models/SystemSetting.php` | Tambahkan method `getCached(string $key)` menggunakan `Cache::remember("setting_{$key}", 3600, ...)`. Invalidate cache saat settings diupdate. Saat ini method dipanggil berkali-kali per request tanpa cache. |
| B4 ✅ | Validasi & pengurangan stok produk | High | `starinc-api/app/Services/OrderService.php` | Di method `createOrder()`, setelah kalkulasi `$lineTotal`: (1) cek `$product->stock >= $quantity`, throw exception jika kurang. (2) Kurangi stok setelah order confirmed. Saat ini stok tidak pernah berkurang. |
| B5 ✅ | Validasi upload bukti pembayaran | Medium | `starinc-api/app/Http/Controllers/Api/OrderController.php` | Batasi MIME type (`image/jpeg`, `image/png`, `application/pdf`), max size 2MB, simpan di private storage (`storage/app/private/`), bukan public. |
| B6 ✅ | Perbaiki bug `TierService::checkDowngrades()` | Medium | `starinc-api/app/Services/TierService.php` | Setelah downgrade, `last_transaction_at` di-reset ke `now()` — ini menyebabkan user tidak bisa didowngrade lagi selama 30 hari berikutnya. Hapus reset ini atau gunakan kolom `downgraded_at` terpisah. |

### C. Optimasi Performa — Phase 2

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| C1 | Eager load MLM chain di `CommissionService` | High | `starinc-api/app/Services/CommissionService.php` | Method `distributeMLM()` saat ini N+1 query per order. Refactor: ambil seluruh chain sekaligus dengan `StarcenterNetwork::where('downline_id', $id)->orderBy('depth')->with('upline')->get()`. |
| C2 | Aktifkan response compression | Medium | `starinc-api/app/Http/Kernel.php` | Tambahkan middleware `\Illuminate\Http\Middleware\GzipResponse` atau `deflate` untuk semua API response. Mengurangi bandwidth signifikan untuk response JSON besar. |
| C3 | Tambahkan API rate limiting global | Medium | `starinc-api/routes/api.php` | Selain throttle di auth, tambahkan `throttle:60,1` untuk semua endpoint authenticated. Cegah scraping dan abuse. |
| C4 | Query optimization di admin dashboard stats | Low | `starinc-api/app/Http/Controllers/Api/Admin/DashboardController.php` | Gunakan `DB::select()` dengan agregasi single query untuk revenue/orders/users/commissions, bukan 4 query terpisah. |

### D. Fitur Wallet & Komisi — Phase 3

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| D1 | Buat migration tabel `wallet_ledgers` | High | Buat `database/migrations/..._create_wallet_ledgers_table.php` | Kolom: `user_id`, `type` (credit/debit), `amount`, `description`, `reference_id` (nullable, FK ke commissions), `reference_type`. |
| D2 | Buat Model `WalletLedger` | High | Buat `starinc-api/app/Models/WalletLedger.php` | `fillable`, `casts`, relasi `belongsTo(User::class)`. Tambahkan method `getBalance(int $userId)` yang sum credit - debit. |
| D3 | Update `CommissionService` untuk credit wallet | High | `starinc-api/app/Services/CommissionService.php` | Saat admin pay commission (status → `paid`), otomatis buat entry `WalletLedger` type `credit` dengan `reference_id` = commission id. |
| D4 | Buat `WalletController` | High | Buat `starinc-api/app/Http/Controllers/Api/WalletController.php` | Endpoints: `GET /user/wallet` (saldo + riwayat paginated), `POST /user/wallet/withdraw` (request penarikan, buat entry `debit` pending). |
| D5 | Daftarkan route wallet | High | `starinc-api/routes/api.php` | Tambahkan di group `auth:sanctum`: `GET /user/wallet` dan `POST /user/wallet/withdraw`. |
| D6 | Admin: review & approve withdrawal | Medium | Buat `starinc-api/app/Http/Controllers/Api/Admin/WithdrawalController.php` | `GET /admin/withdrawals` (list pending), `PUT /admin/withdrawals/{id}/approve`, `PUT /admin/withdrawals/{id}/reject`. |

### E. Notifikasi — Phase 3

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| E1 | Setup Laravel Mail (Mailtrap untuk dev) | Medium | `starinc-api/.env`, `starinc-api/config/mail.php` | Set `MAIL_MAILER=smtp`, konfigurasi Mailtrap credentials. Buat `App\Mail\OrderCreated` Mailable. |
| E2 | Email konfirmasi order | Medium | Buat `starinc-api/app/Mail/OrderCreated.php` | Kirim ke buyer setelah order berhasil dibuat. Trigger di `OrderService::createOrder()`. Berisi: order number, total, instruksi pembayaran. |
| E3 | Email notifikasi status order berubah | Medium | Buat `starinc-api/app/Mail/OrderStatusUpdated.php` | Kirim ke buyer saat admin update status ke `awaiting_confirmation` atau `completed`. Trigger di `OrderController::updateStatus()`. |
| E4 | Notifikasi komisi masuk | Low | Buat `starinc-api/app/Notifications/CommissionReceived.php` | Gunakan Laravel Notification. Kirim ke earner saat komisi di-pay. Channel: database + email. |

### F. Payment Gateway — Phase 4

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| F1 | Integrasi Midtrans Snap API | High | Buat `starinc-api/app/Services/PaymentService.php` | Install package `midtrans/midtrans-php`. Buat `PaymentService::createSnapToken(Order $order)`. Konfigurasi `MIDTRANS_SERVER_KEY` di `.env`. |
| F2 | Endpoint buat Snap token | High | `starinc-api/app/Http/Controllers/Api/OrderController.php` | `POST /orders/{order}/payment` → return Snap token untuk redirect frontend ke Midtrans. |
| F3 | Webhook handler Midtrans | High | Buat `starinc-api/app/Http/Controllers/Api/PaymentWebhookController.php` | `POST /webhook/midtrans` — verifikasi signature, update status order otomatis. Exempt dari `auth:sanctum` middleware, tambahkan custom signature validation. |
| F4 | Hapus alur manual payment proof | Medium | `starinc-api/routes/api.php`, `OrderController.php` | Setelah Midtrans aktif, deprecated endpoint upload bukti bayar manual. Admin tidak perlu konfirmasi manual lagi. |

### G. Testing — Phase 5

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| G1 | Unit test `OrderService` | High | Buat `starinc-api/tests/Unit/OrderServiceTest.php` | Test: kalkulasi harga, tier discount, validasi MOQ starcenter, pengurangan stok, validasi variant. |
| G2 | Unit test `CommissionService` | Critical | Buat `starinc-api/tests/Unit/CommissionServiceTest.php` | Test: distribusi 1 level (regular), distribusi 7 level (starcenter), cancel komisi saat order dibatalkan. Ini paling kritis karena menyangkut finansial. |
| G3 | Unit test `TierService` | High | Buat `starinc-api/tests/Unit/TierServiceTest.php` | Test: auto-upgrade saat cumulative_spending melewati threshold, downgrade setelah N hari tidak transaksi. |
| G4 | Feature test auth endpoints | High | Buat `starinc-api/tests/Feature/AuthTest.php` | Test: register, login, logout, throttle (6th request harus 429), validasi input. |
| G5 | Feature test checkout flow | High | Buat `starinc-api/tests/Feature/CheckoutTest.php` | Test: checkout sukses, checkout stok habis, checkout harga tidak sesuai frontend (server harus ignore harga dari client). |
| G6 | Feature test admin authorization | Medium | Buat `starinc-api/tests/Feature/AdminAuthorizationTest.php` | Pastikan semua route `/admin/*` return 403 untuk role `regular` dan `starcenter`. |

---

## 3. Deliverables per Phase

| Phase | Target Selesai | Deliverables |
|-------|---------------|--------------|
| Phase 0 | Minggu 1 | Scheduler aktif, rate limiting auth, route cleanup, validasi variant |
| Phase 1 | Minggu 2 | MySQL production, indexes, cache settings, stok validasi, upload secure |
| Phase 2 | Minggu 3 | N+1 fix di CommissionService, response compression, rate limiting global |
| Phase 3 | Minggu 4-5 | Wallet ledger lengkap, email notifikasi order & komisi |
| Phase 4 | Bulan 2 | Midtrans terintegrasi, webhook otomatis, hapus manual payment |
| Phase 5 | Bulan 3 | Test coverage >80% untuk Services, feature tests semua endpoint kritis |

---

## 4. Bug & Technical Debt yang Harus Ditangani

| ID | File | Masalah | Prioritas |
|----|------|---------|-----------|
| B1 | `TierService.php` | `checkDowngrades()` reset `last_transaction_at` ke `now()` setelah downgrade — user tidak bisa didowngrade lagi selama 30 hari | Medium |
| B2 | `api.php` route `/user/referral-link` | 50+ baris logika bisnis inline di route file, bukan di controller | Low |
| B3 | `api.php` route `/user/commissions` | Query + paginate inline di route file | Low |
| B4 | `OrderController.php` | Tidak ada validasi bahwa `variant_id` milik `product_id` yang dikirim | Medium |
| B5 | `api.php` | File terlalu panjang (150+ baris), perlu route grouping lebih bersih | Low |
| B6 | `CommissionService.php` | N+1 query saat distributeMLM() — setiap level buat query baru ke DB | High |

---

## 5. Konvensi Kode Backend

```
Naming:
- Controller  : [Resource]Controller  (WalletController, WithdrawalController)
- Service     : [Domain]Service       (WalletService, PaymentService)
- Model       : PascalCase singular   (WalletLedger, PaymentProof)
- Migration   : yyyy_mm_dd_hhmmss_[action]_[table]_table.php
- Mail        : [Event]               (OrderCreated, CommissionReceived)
- Route group : prefix '/admin' + middleware EnsureIsAdmin

Response format:
- Success     : return response()->json(['data' => $result], 200);
- Created     : return response()->json(['data' => $result], 201);
- Error       : return response()->json(['message' => $msg], 4xx);
- Validation  : otomatis dari FormRequest → return 422

Aturan wajib:
- DB::transaction() untuk operasi yang menyentuh >1 tabel
- FormRequest untuk validasi input (jangan validate() inline di controller)
- Service method harus pure / testable (jangan akses Request di dalam Service)
- Semua kode diformat dengan: ./vendor/bin/pint
```

---

## 6. Checklist Sebelum Merge ke Main

- [ ] `php artisan test` — semua test hijau
- [ ] `./vendor/bin/pint` — kode sudah diformat
- [ ] `php artisan migrate` — migration baru tidak error
- [ ] Tidak ada `dd()`, `var_dump()`, atau `Log::debug()` tertinggal
- [ ] Semua route baru sudah ada middleware yang sesuai (`auth:sanctum`, `EnsureIsAdmin`)
- [ ] Response format konsisten `{ data: ... }` atau `{ message: ... }`
- [ ] Operasi multi-tabel menggunakan `DB::transaction()`

---

## 7. Risiko & Catatan Koordinasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Migrasi SQLite → MySQL bisa expose hidden query issues | High | Jalankan full test suite setelah migrasi |
| `CommissionService` N+1 bisa timeout saat MLM chain panjang | High | Fix eager loading sebelum production |
| Webhook Midtrans perlu IP whitelist di server | Medium | Koordinasi dengan Supervisor/DevOps |
| Email notifikasi bisa masuk spam | Low | Setup SPF/DKIM record di domain |
| Stok race condition saat banyak order bersamaan | Medium | Gunakan `DB::transaction()` + `lockForUpdate()` saat kurangi stok |

**Koordinasi dengan Tim Lain:**
- **Frontend**: Beritahu saat endpoint wallet (`GET /user/wallet`, `POST /user/wallet/withdraw`) sudah live
- **QA**: Prioritaskan test `CommissionService` dan checkout flow — ini yang paling berisiko finansial
- **Performance**: Konfirmasi indexes sudah ditambahkan sebelum Performance tim mulai load testing
- **Supervisor**: Minta approval sebelum merge Phase 3+ ke main — menyangkut data keuangan
