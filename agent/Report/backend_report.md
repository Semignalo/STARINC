# Backend Phase 0 Report — Cleanup & Stabilisasi

> Tanggal: 2026-04-16
> Developer: Backend Agent
> Phase: 0 (Critical Cleanup & Stabilisasi)

---

## Ringkasan Eksekusi

Semua 4 task Phase 0 (A1–A4) telah diselesaikan. Berikut detail masing-masing.

---

## A1 — Daftarkan `tier:check-downgrades` di Scheduler

**Status: SELESAI**

**File:** `starinc-api/routes/console.php`

**Perubahan:**
- Menambahkan `use Illuminate\Support\Facades\Schedule;`
- Mendaftarkan command `tier:check-downgrades` untuk dijalankan setiap hari pukul 02:00

```php
Schedule::command('tier:check-downgrades')->dailyAt('02:00');
```

**Dampak:** Tanpa ini, tier downgrade tidak pernah berjalan secara otomatis. Sekarang scheduler akan mengeksekusi `TierService::checkDowngrades()` setiap malam.

---

## A2 — Rate Limiting di Endpoint Auth

**Status: SELESAI**

**File:** `starinc-api/routes/api.php`

**Perubahan:**
- Membungkus `POST /register` dan `POST /login` dengan `middleware('throttle:5,1')`
- Artinya: maksimal 5 request per 1 menit per IP

```php
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});
```

**Dampak:** Endpoint sebelumnya rentan brute-force attack. Sekarang request ke-6 dalam 1 menit akan mendapat response `429 Too Many Requests`.

---

## A3 — Pindahkan Inline Route Logic ke Controller

**Status: SELESAI**

**File-file yang dibuat/diubah:**
1. `starinc-api/app/Http/Controllers/Api/NetworkController.php` (baru)
2. `starinc-api/app/Http/Controllers/Api/CommissionController.php` (baru)
3. `starinc-api/routes/api.php` (diupdate)

**Perubahan:**

`NetworkController@referralInfo` — memindahkan 40+ baris logika bisnis dari route closure ke controller proper dengan:
- Logika berbeda untuk starcenter/admin (multi-level network) vs regular user (direct referrals only)
- Response format konsisten `{ data: {...} }`

`CommissionController@myCommissions` — memindahkan query paginate inline ke controller:
- Eager load `order` dan `sourceUser`
- Paginate 20 per halaman
- Response format konsisten `{ data: {...} }`

Route file sekarang bersih:
```php
Route::get('/user/commissions', [CommissionController::class, 'myCommissions']);
Route::get('/user/referral-link', [NetworkController::class, 'referralInfo']);
```

**Dampak:** Route file jauh lebih bersih dan mudah dibaca. Business logic sekarang testable di unit test.

---

## A4 — Validasi `variant_id` Milik `product_id` di Checkout

**Status: SELESAI**

**File-file yang dibuat/diubah:**
1. `starinc-api/app/Http/Requests/CheckoutRequest.php` (baru)
2. `starinc-api/app/Http/Controllers/Api/OrderController.php` (diupdate)

**Perubahan:**

Dibuat `CheckoutRequest` (FormRequest) yang menggantikan validasi inline di controller. Validasi mencakup:
1. Semua field customer_info dan items (sama seperti sebelumnya)
2. **Validasi baru**: Method `after()` yang memverifikasi setiap `variant_id` benar-benar milik `product_id` yang dikirim

```php
public function after(): array
{
    return [
        function ($validator) {
            foreach ($items as $index => $item) {
                if (empty($item['variant_id'])) continue;

                $variantExists = ProductVariant::where('id', $item['variant_id'])
                    ->where('product_id', $item['product_id'])
                    ->exists();

                if (!$variantExists) {
                    $validator->errors()->add(
                        "items.{$index}.variant_id",
                        'Variant tidak valid untuk produk yang dipilih.'
                    );
                }
            }
        },
    ];
}
```

`OrderController::checkout()` sekarang menggunakan `CheckoutRequest` (method injection via type-hint).

**Dampak:** Sebelumnya, seorang user bisa mengirim `variant_id` dari produk lain yang harganya lebih murah. Sekarang server memvalidasi relasi variant↔product sebelum masuk ke `OrderService`.

Catatan: `OrderService` juga sudah memiliki proteksi serupa (baris `->where('product_id', $product->id)->firstOrFail()`), sehingga sekarang ada double protection — validasi di request layer (cepat, error 422) dan di service layer (defense in depth).

---

## Kode Quality

- Semua file diformat menggunakan `./vendor/bin/pint`
- Pint memperbaiki: binary_operator_spaces, concat_space, no_unused_imports, single_quote, ordered_imports
- Route list diverifikasi: semua endpoint baru terdaftar dengan benar

---

## Checklist Phase 0

| Task | Status | File |
|------|--------|------|
| A1 — Scheduler tier downgrade | SELESAI | `routes/console.php` |
| A2 — Rate limiting auth endpoints | SELESAI | `routes/api.php` |
| A3 — Pindahkan inline logic ke controller | SELESAI | `NetworkController.php`, `CommissionController.php`, `routes/api.php` |
| A4 — Validasi variant milik product | SELESAI | `CheckoutRequest.php`, `OrderController.php` |

---

## Catatan untuk Phase Berikutnya

- **Phase 1** (B1–B6) mencakup migrasi ke MySQL, database indexes, cache settings, validasi stok, upload proof security, dan bug fix TierService
- Bug `TierService::checkDowngrades()` (reset `last_transaction_at`) sudah diidentifikasi — ditangani di Phase 1 task B6
- Task B4 (validasi stok di OrderService) bergantung pada Phase 1 — direkomendasikan segera dikerjakan karena stok saat ini tidak pernah berkurang

---

# Backend Phase 1 Report — Production Readiness

> Tanggal: 2026-04-16
> Developer: Backend Agent
> Phase: 1 (Production Readiness)

---

## Ringkasan Eksekusi

Semua 6 task Phase 1 (B1–B6) telah diselesaikan. Migration MySQL berjalan sukses dengan seluruh 13 migration DONE.

---

## B1 — Migrasi SQLite ke MySQL

**Status: SELESAI**

**File:** `starinc-api/.env`

**Perubahan:**
```diff
- DB_CONNECTION=sqlite
+ DB_CONNECTION=mysql
+ DB_HOST=127.0.0.1
+ DB_PORT=3306
+ DB_DATABASE=sdp_v2
+ DB_USERNAME=root
+ DB_PASSWORD=
```

`php artisan migrate --force` berhasil dengan semua 13 migration DONE. MySQL (Laragon) digunakan sebagai database. Database `sdp_v2` harus sudah dibuat sebelumnya di MySQL.

**Catatan penting untuk deployment:**
- Set `DB_PASSWORD` sesuai password MySQL production
- Jalankan `php artisan migrate --seed` untuk data awal
- Pastikan MySQL user memiliki hak akses CREATE INDEX

---

## B2 — Database Indexes untuk Performa

**Status: SELESAI**

**File yang dibuat:** `starinc-api/database/migrations/2026_04_16_000001_add_performance_indexes.php`

**Indexes yang ditambahkan:**

| Tabel | Index | Nama | Kegunaan |
|-------|-------|------|----------|
| `users` | `referrer_id` | `idx_users_referrer_id` | Tree traversal MLM |
| `users` | `referral_code` | `idx_users_referral_code` | Lookup kode referral saat register |
| `orders` | `(user_id, status)` | `idx_orders_user_status` | Filter order per user per status |
| `orders` | `order_number` | `idx_orders_order_number` | Lookup invoice (duplikasi UNIQUE index, harmless) |
| `commissions` | `(user_id, status)` | `idx_commissions_user_status` | Dashboard komisi per user |
| `starcenter_network` | `(upline_id, depth)` | `idx_network_upline_depth` | Traversal MLM chain |

---

## B3 — Cache SystemSetting::getValue()

**Status: SELESAI**

**File:** `starinc-api/app/Models/SystemSetting.php`

**Perubahan:**
- `getValue()` sekarang menggunakan `Cache::remember("setting_{$key}", 3600, ...)` — TTL 1 jam
- Nilai `null` di-cache sebagai sentinel string `'__NULL__'` untuk membedakan "key tidak ada" vs "belum di-cache"
- `setValue()` sekarang memanggil `Cache::forget("setting_{$key}")` setelah update — cache otomatis ter-invalidasi
- Ditambahkan method `getCached()` sebagai alias eksplisit (meningkatkan keterbacaan kode)
- Ditambahkan method `flushCache()` untuk invalidasi semua cache settings sekaligus (berguna saat bulk update)

**Dampak:** Setting seperti `flat_shipping_cost` dan `starcenter_moq` sebelumnya di-query ke DB setiap kali `createOrder()` dipanggil. Sekarang hanya 1 DB hit per jam per key.

---

## B4 — Validasi dan Pengurangan Stok Produk

**Status: SELESAI**

**File-file yang dibuat/diubah:**
1. `starinc-api/database/migrations/2026_04_16_000002_add_stock_to_products_table.php` (baru)
2. `starinc-api/app/Models/Product.php` (update fillable + casts)
3. `starinc-api/app/Models/ProductVariant.php` (update fillable + casts)
4. `starinc-api/app/Services/OrderService.php` (logic stok)
5. `starinc-api/app/Http/Controllers/Api/OrderController.php` (restoreStock saat rejected)

**Desain kolom stok:**
- `products.stock` dan `product_variants.stock` bertipe `unsignedInteger nullable`
- `null` = unlimited/tidak di-track (backward compatible, produk lama tidak terpengaruh)
- `0` = habis
- `>0` = tersedia

**Alur di OrderService::createOrder():**
1. Produk di-lock dengan `lockForUpdate()` dalam `DB::transaction()` — mencegah race condition saat checkout bersamaan
2. `validateStock()` memvalidasi stok sebelum order dibuat — throw Exception jika kurang
3. Stok dikurangi setelah order item terbuat — hanya jika `stock !== null`

**Restore stok saat dibatalkan:**
- Method `restoreStock(Order $order)` ditambahkan ke `OrderService`
- Dipanggil di `OrderController::updateStatus()` saat status berubah ke `rejected`

---

## B5 — Validasi Upload Bukti Pembayaran

**Status: SELESAI**

**File-file yang dibuat/diubah:**
1. `starinc-api/app/Http/Requests/UploadPaymentProofRequest.php` (baru)
2. `starinc-api/app/Http/Controllers/Api/OrderController.php` (diupdate)
3. `starinc-api/routes/api.php` (tambah endpoint serve file)

**Perubahan keamanan:**

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| MIME type | `jpg,jpeg,png,webp` | `jpg,jpeg,png,pdf` |
| Max size | 5MB | 2MB |
| Storage | `public` disk (URL publik) | `local` disk (private) |
| Validasi | Inline di Controller | `UploadPaymentProofRequest` FormRequest |

**Endpoint baru:**
- `GET /api/admin/payment-proofs/{proofId}/file` — dilindungi `EnsureIsAdmin`, serve file dari private storage
- User tidak bisa lagi mengakses file bukti bayar via URL publik

**Tambahan validasi bisnis:** Upload hanya diizinkan jika status order adalah `pending_payment` atau `processing`.

---

## B6 — Fix Bug TierService::checkDowngrades()

**Status: SELESAI**

**File:** `starinc-api/app/Services/TierService.php`

**Bug:** Setelah user di-downgrade, kode lama melakukan:
```php
$user->last_transaction_at = now(); // SALAH — reset timer setelah downgrade
```

Ini menyebabkan setelah satu kali downgrade, user tidak bisa didowngrade lagi selama 30 hari berikutnya meski tidak ada transaksi baru, karena `last_transaction_at` di-set ke `now()`.

**Fix:** Baris reset dihapus. Timer `last_transaction_at` tetap berjalan dari tanggal transaksi terakhir yang sebenarnya. Jika user masih tidak bertransaksi, downgrade berikutnya akan terjadi di run scheduler berikutnya sesuai kalkulasi `dropCount`.

---

## File yang Dibuat/Dimodifikasi

| File | Action | Deskripsi |
|------|--------|-----------|
| `starinc-api/.env` | Modified | DB_CONNECTION dari sqlite ke mysql |
| `database/migrations/2026_04_16_000001_add_performance_indexes.php` | Created | 6 DB indexes untuk query performa |
| `database/migrations/2026_04_16_000002_add_stock_to_products_table.php` | Created | Kolom stock di products dan product_variants |
| `app/Models/SystemSetting.php` | Modified | Cache via Cache::remember, invalidasi di setValue() |
| `app/Models/Product.php` | Modified | Tambah 'stock' ke fillable dan casts |
| `app/Models/ProductVariant.php` | Modified | Tambah 'stock' ke fillable dan casts |
| `app/Services/OrderService.php` | Modified | Validasi stok, lockForUpdate, restoreStock() |
| `app/Services/TierService.php` | Modified | Hapus bug reset last_transaction_at |
| `app/Http/Controllers/Api/OrderController.php` | Modified | UploadPaymentProofRequest, private storage, servePaymentProof(), restoreStock() |
| `app/Http/Requests/UploadPaymentProofRequest.php` | Created | FormRequest validasi upload bukti bayar |
| `routes/api.php` | Modified | Tambah route GET /admin/payment-proofs/{id}/file |

---

## Checklist Phase 1

| Task | Status | File Utama |
|------|--------|------------|
| B1 — MySQL migration | SELESAI | `.env` |
| B2 — Database indexes | SELESAI | `2026_04_16_000001_add_performance_indexes.php` |
| B3 — Cache SystemSetting | SELESAI | `SystemSetting.php` |
| B4 — Validasi & pengurangan stok | SELESAI | `OrderService.php`, `ProductVariant.php` |
| B5 — Validasi upload bukti pembayaran | SELESAI | `UploadPaymentProofRequest.php`, `OrderController.php` |
| B6 — Fix bug TierService downgrade | SELESAI | `TierService.php` |

---

## Catatan Penting & Risiko

1. **Stok race condition**: Sudah ditangani dengan `DB::transaction()` + `lockForUpdate()`. Namun perlu diuji load test dengan concurrent requests sebelum production.

2. **Cache database**: `CACHE_STORE=database` di `.env` — artinya `Cache::remember()` untuk SystemSetting menyimpan ke tabel `cache` di MySQL, bukan Redis/Memcached. Ini sudah cukup untuk stage awal. Upgrade ke Redis direkomendasikan saat traffic tinggi.

3. **Private storage**: File bukti pembayaran sekarang di `storage/app/payment-proofs/`. Pastikan direktori ini tidak masuk ke `.gitignore` (atau buat exception) dan tidak dapat diakses via web server langsung.

4. **Backward compatibility stok**: Produk lama yang tidak punya kolom `stock` (nilai `null`) diperlakukan sebagai unlimited — tidak ada breaking change.

5. **Koordinasi Frontend**: Beritahu frontend bahwa response upload bukti pembayaran berubah — tidak lagi return `proof.file_path` yang bisa diakses publik. Return hanya `proof_id`, `status`, `created_at`.

---

## Catatan untuk Phase Berikutnya (Phase 2 — Optimasi Performa)

- **C1**: N+1 query di `CommissionService::distributeMLM()` — prioritas tinggi sebelum production
- **C2**: Response compression (Gzip) di middleware
- **C3**: Rate limiting global `throttle:60,1` untuk semua endpoint authenticated
- Setelah indexes ditambahkan (B2), koordinasikan dengan Performance tim untuk load testing

---

# Hotfix — Frontend Integration: POST /api/admin/upload

> Tanggal: 2026-04-16
> Trigger: Catatan dari tim Frontend (frontend_phase0_report.md)

---

## Deskripsi

Tim frontend melaporkan bahwa halaman **Appearance** di admin panel membutuhkan endpoint `POST /api/admin/upload` untuk fitur upload video/gambar hero. Endpoint ini diperlukan setelah migrasi dari Firebase Storage ke Laravel API (task A2 frontend).

---

## Yang Diimplementasikan

### 1. Form Request — `UploadAdminFileRequest`

**File:** `starinc-api/app/Http/Requests/UploadAdminFileRequest.php` (baru)

Validasi:
- `file`: required, MIME types: `jpg, jpeg, png, gif, webp, mp4, webm, mov`, max **50MB**
- `folder`: optional, string, hanya karakter alphanumeric + `-_/`, max 100 karakter

### 2. Controller Method — `SettingsController::upload()`

**File:** `starinc-api/app/Http/Controllers/Api/SettingsController.php`

Alur:
1. Validasi via `UploadAdminFileRequest`
2. File disimpan ke `storage/app/public/{folder}/` (default folder: `uploads`)
3. Return URL publik yang bisa diakses browser: `{ url: "/storage/{folder}/{filename}" }`

### 3. Route

**File:** `starinc-api/routes/api.php`

```
POST /api/admin/upload
Middleware: auth:sanctum + EnsureIsAdmin
```

### 4. Storage Symlink

`php artisan storage:link` dijalankan — symlink `public/storage → storage/app/public` berhasil dibuat.

---

## Kontrak API

**Request:**
```
POST /api/admin/upload
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data

file:   <File>    # required, image/video
folder: "hero"    # optional, default: "uploads"
```

**Response (200 OK):**
```json
{
  "url": "/storage/hero/abc123_video.mp4"
}
```

**Response error (422):**
```json
{
  "message": "Format file tidak didukung. Gunakan: jpg, png, gif, webp, mp4, webm, atau mov.",
  "errors": { "file": ["..."] }
}
```

---

## File yang Dibuat/Dimodifikasi

| File | Action |
|------|--------|
| `app/Http/Requests/UploadAdminFileRequest.php` | Created |
| `app/Http/Controllers/Api/SettingsController.php` | Modified (tambah `upload()` method) |
| `routes/api.php` | Modified (tambah route `POST /admin/upload`) |
| `public/storage` (symlink) | Created via `php artisan storage:link` |
