# Product Requirements Document (PRD)
## SDP-V2 — Platform E-Commerce & MLM Star Inc.

**Versi:** 2.0  
**Tanggal:** 21 April 2026  
**Status:** Production-Ready  

---

## 1. Ringkasan Eksekutif

SDP-V2 adalah platform e-commerce sekaligus MLM (Multi-Level Marketing) yang dibangun khusus untuk PT Star Inc. Sistem ini memungkinkan pelanggan berbelanja produk, bergabung sebagai distributor (Starcenter), dan mendapatkan komisi dari jaringan downline hingga 7 level.

Platform ini adalah monorepo full-stack dengan:
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Laravel 13 + SQLite/MySQL + Sanctum Auth
- **Target pengguna**: Pelanggan ritel, distributor Starcenter, dan admin internal

---

## 2. Latar Belakang & Masalah

### 2.1 Konteks Bisnis
PT Star Inc. menjual produk kecantikan dan kesehatan melalui sistem jaringan distribusi bertingkat. Sebelum SDP-V2, tidak ada platform digital terintegrasi yang menangani:
- Pembelian produk online oleh pelanggan ritel
- Pencatatan komisi otomatis untuk jaringan distributor
- Manajemen status pesanan dan pembayaran oleh admin

### 2.2 Masalah yang Diselesaikan
| # | Masalah | Solusi |
|---|---------|--------|
| 1 | Komisi distributor dihitung manual, rawan kesalahan | Distribusi komisi otomatis berbasis closure table (hingga 7 level) |
| 2 | Tidak ada cara pelanggan membuktikan pembayaran | Upload bukti transfer + review admin terintegrasi |
| 3 | Harga dapat dimanipulasi dari sisi frontend | Kalkulasi harga penuh di server (server-side trust) |
| 4 | Tidak ada tracking tier/discount otomatis | Sistem tier otomatis berbasis cumulative spending |
| 5 | Stok tidak terkelola saat banyak order bersamaan | DB-level locking untuk mencegah race condition |

---

## 3. Tujuan & Sasaran

### 3.1 Tujuan Bisnis
- Mengotomasi seluruh alur dari pembelian produk hingga distribusi komisi
- Mengelola jaringan Starcenter hingga 7 level secara efisien
- Memberikan transparansi bagi distributor terhadap komisi dan jaringan mereka
- Memudahkan admin mengelola order, produk, user, dan pembayaran

### 3.2 Metrik Keberhasilan
| Metrik | Target |
|--------|--------|
| Uptime sistem | ≥ 99.5% |
| Waktu kalkulasi order | < 2 detik |
| Distribusi komisi | Otomatis dalam < 5 detik setelah order selesai |
| Akurasi komisi | 100% (zero manual calculation) |
| Tier user terupdate | Realtime setelah setiap order selesai |

---

## 4. Pengguna & Peran

### 4.1 Segmen Pengguna

#### Regular User (Pelanggan)
- Belanja produk dengan harga tier (10–25% diskon berdasarkan spending kumulatif)
- Mendapatkan kode referral unik
- Mendapat komisi single-level (5%) jika ada yang daftar via referral mereka dan berbelanja
- Tracking pesanan dan riwayat komisi di profil

#### Starcenter (Distributor)
- Semua fitur Regular User
- Komisi multi-level hingga 7 level (10% → 0.5% menurun per level)
- MOQ (Minimum Order Quantity) berlaku: IDR 5.000.000 per order
- Tier terkunci di Diamond (30% diskon tetap)
- Dapat melihat jaringan downline di dashboard

#### Admin
- Akses penuh ke semua fitur manajemen
- Manajemen produk, order, user, komisi, tier, dan tampilan
- Review bukti pembayaran dan ubah status order
- Tidak ada batasan MOQ atau tier

### 4.2 Matriks Hak Akses

| Fitur | Regular | Starcenter | Admin |
|-------|---------|------------|-------|
| Belanja produk | ✓ | ✓ | ✓ |
| Upload bukti bayar | ✓ | ✓ | ✓ |
| Lihat komisi sendiri | ✓ | ✓ | ✓ |
| Jaringan 7 level | ✗ | ✓ | ✓ |
| MOQ berlaku | ✗ | ✓ | ✗ |
| Tier terkunci Diamond | ✗ | ✓ | ✗ |
| Manajemen produk | ✗ | ✗ | ✓ |
| Review pembayaran | ✗ | ✗ | ✓ |
| Ubah role/tier user | ✗ | ✗ | ✓ |
| Dashboard analytics | ✗ | ✗ | ✓ |
| Konfigurasi sistem | ✗ | ✗ | ✓ |

---

## 5. Fitur & Persyaratan Fungsional

### 5.1 Autentikasi & Manajemen Akun

#### F-AUTH-01: Registrasi
- User dapat mendaftar dengan email, nama, password, dan opsional kode referral
- Kode referral 8 karakter unik digenerate otomatis untuk setiap user baru
- Jika ada kode referral valid, relasi downline-upline tersimpan di closure table
- Throttle: 5 request per menit per IP
- Default tier Bronze diberikan otomatis

#### F-AUTH-02: Login
- Login dengan email dan password
- Token Sanctum dihasilkan saat login, token lama direvoke
- Token tersimpan di localStorage, auto-inject di setiap request
- Redirect ke halaman asal setelah login berhasil

#### F-AUTH-03: Lupa Password
- User memasukkan email, sistem kirim link reset via email
- Link valid untuk sekali pakai
- User memasukkan password baru via link

#### F-AUTH-04: Manajemen Profil
- User dapat update nama, telepon, alamat, kota, kode pos
- User dapat ganti password (wajib verifikasi password lama)

#### F-AUTH-05: Keamanan Session
- Token divalidasi saat tab browser mendapat fokus kembali
- Jika token kadaluarsa (401), otomatis redirect ke login
- Logout merevoke token dari server

---

### 5.2 Katalog Produk

#### F-PROD-01: Daftar Produk
- Tampil dalam grid dengan gambar, judul, harga asli, label diskon, dan badge promo
- Filter berdasarkan: kategori, promo
- Pencarian berdasarkan kata kunci (title dan description)
- Pagination standar (20 produk per halaman)
- Harga tampil dengan potongan tier user yang sedang login

#### F-PROD-02: Detail Produk
- Galeri gambar/video produk (multi-media, sortable)
- Pilihan varian (ukuran, warna, dll.)
- Harga dengan label diskon tier user
- Status stok (tersedia/habis)
- Tombol tambah ke keranjang
- Produk terkait

#### F-PROD-03: Keranjang Belanja
- Sidebar drawer untuk keranjang
- Persisten di localStorage (multi-tab sync)
- Update kuantitas, hapus item
- Total harga diperbarui realtime
- Badge jumlah item di navbar

---

### 5.3 Checkout & Order

#### F-ORDER-01: Proses Checkout (3 Langkah)
**Langkah 1 — Info Pelanggan:**
- Nama penerima, nomor HP, alamat lengkap
- Validasi input sebelum lanjut

**Langkah 2 — Review Order:**
- Daftar item dengan kuantitas dan harga satuan
- Subtotal, diskon tier (%), nominal diskon
- Biaya pengiriman flat (IDR 20.000)
- Total akhir
- Semua kalkulasi dilakukan di **server** (tidak menggunakan harga dari frontend)

**Langkah 3 — Konfirmasi Pembayaran:**
- Tampil info rekening bank tujuan (dari sistem settings)
- Nomor order yang harus dicantumkan di keterangan transfer
- Tombol konfirmasi dan upload bukti bayar

#### F-ORDER-02: Validasi Server-Side
- Harga produk diambil dari DB (bukan dari request)
- Stok divalidasi dengan row-level locking (`lockForUpdate`)
- Diskon tier dikalkulasi dari tier user saat checkout
- MOQ (IDR 5.000.000) divalidasi untuk user Starcenter
- Transaksi atomic: order + item + pemotongan stok dalam satu DB transaction

#### F-ORDER-03: Invoice & Bukti Pembayaran
- Setiap order menghasilkan nomor unik (format: INV-XXXXXXXX)
- Invoice menampilkan detail order dan instruksi pembayaran
- User dapat upload bukti transfer (1 file, disimpan di private storage)
- File bukti bayar tidak dapat diakses publik; hanya admin via endpoint protected

#### F-ORDER-04: Status Order
| Status | Arti | Trigger |
|--------|------|---------|
| `pending_payment` | Menunggu pembayaran | Order dibuat |
| `processing` | Pembayaran dikonfirmasi | Admin approve bukti bayar |
| `shipped` | Sudah dikirim | Admin input nomor resi |
| `completed` | Pesanan selesai | Admin set completed → trigger komisi |
| `rejected` | Ditolak | Admin reject → stok dikembalikan |

#### F-ORDER-05: Notifikasi Email
- Konfirmasi order (saat order dibuat)
- Pembayaran disetujui (saat admin approve bukti bayar)
- Pembayaran ditolak + catatan penolakan
- Pesanan dikirim + nomor resi

---

### 5.4 Sistem Tier & Diskon

#### F-TIER-01: Konfigurasi Tier

| Tier | Min. Spending Kumulatif | Diskon |
|------|------------------------|--------|
| Bronze | IDR 0 | 10% |
| Silver | IDR 5.000.000 | 15% |
| Gold | IDR 10.000.000 | 20% |
| Platinum | IDR 20.000.000 | 25% |
| Diamond | IDR 50.000.000 | 30% |

#### F-TIER-02: Upgrade Tier Otomatis
- Setelah order berstatus `completed`, cumulative_spending user bertambah (subtotal - diskon)
- Sistem memeriksa apakah user memenuhi syarat tier yang lebih tinggi
- Upgrade terjadi otomatis tanpa intervensi admin
- Starcenter dan Admin tier-nya tidak diubah oleh sistem upgrade (terkunci)

#### F-TIER-03: Downgrade Tier (Inaktivitas)
- Cron job harian memeriksa user yang tidak bertransaksi dalam N hari (default: 30 hari)
- User yang melewati batas inaktivitas diturunkan 1 tier
- Setiap 30 hari tambahan tanpa transaksi, turun 1 tier lagi
- Minimum: Bronze (tidak bisa di bawah Bronze)
- Starcenter dan Admin tidak terkena downgrade

#### F-TIER-04: Manajemen Tier oleh Admin
- Admin dapat melihat dan mengedit threshold min_spend dan diskon setiap tier
- Admin dapat manual-adjust tier user jika diperlukan

---

### 5.5 Sistem Komisi & MLM

#### F-MLM-01: Registrasi & Referral
- Setiap user baru mendapat kode referral unik 8 karakter
- Saat daftar dengan kode referral, sistem membuat entri di closure table `starcenter_network`
- Closure table menyimpan semua relasi upline-downline hingga 7 level secara flat

#### F-MLM-02: Distribusi Komisi

**Regular User (Single Level):**
- Jika downline level-1 menyelesaikan order, upline langsung mendapat komisi 5%
- Rate dapat dikonfigurasi admin (`sdp_commission_rate`)

**Starcenter (Multi Level):**
- Komisi terdistribusi hingga 7 level upline menggunakan data closure table
- Satu query untuk fetch semua upline (efisien)

| Level | Rate Default |
|-------|-------------|
| 1 | 10% |
| 2 | 5% |
| 3 | 3% |
| 4 | 2% |
| 5 | 1.5% |
| 6 | 1% |
| 7 | 0.5% |

- Rate setiap level dapat dikonfigurasi oleh admin

#### F-MLM-03: Pencegahan Duplikasi
- Constraint unik (user_id, order_id, level) mencegah komisi ganda
- Komisi yang sudah dibatalkan tidak dapat dibuat ulang untuk order yang sama

#### F-MLM-04: Siklus Status Komisi
- `pending` → komisi terdistribusi, belum dibayarkan
- `paid` → admin sudah mentransfer ke distributor
- `cancelled` → order dibatalkan/ditolak setelah komisi dibuat

#### F-MLM-05: Dashboard Jaringan (User)
- Regular: Lihat downline langsung (level 1) dan kode referral
- Starcenter: Lihat seluruh jaringan hingga 7 level dalam tree view
- Info: total referral, link referral siap share

---

### 5.6 Dashboard & Profil User

#### F-USER-01: Halaman Profil (4 Tab)
**Tab Overview:**
- Info tier saat ini, progress ke tier berikutnya (progress bar)
- Cumulative spending & sisa yang diperlukan untuk naik tier
- Timer terakhir transaksi (warning jika mendekati batas downgrade)
- Tombol edit profil (nama, telepon, alamat)

**Tab Pesanan:**
- Riwayat order dengan status dan tanggal
- Link ke invoice dan upload bukti bayar

**Tab Jaringan:**
- Kode referral & link referral
- Daftar downline (sesuai level yang diizinkan per role)
- Statistik total downline

**Tab Komisi:**
- Riwayat komisi yang diterima
- Filter dan pagination
- Detail: siapa pembeli, nominal order, rate, level, status

---

### 5.7 Fitur Admin

#### F-ADMIN-01: Dashboard Analytics
- **Stat Cards**: Total revenue, order aktif, total pelanggan, pembayaran pending
- **Grafik Bulanan**: Revenue dan jumlah order (12 bulan terakhir, Recharts)
- **Top 5 Produk**: Berdasarkan jumlah penjualan
- **Komisi Stats**: Total pending vs paid
- **Alert**: Pembayaran yang menunggu verifikasi
- **Recent Orders**: 5 order terbaru
- Tombol refresh data

#### F-ADMIN-02: Manajemen Produk
- CRUD produk lengkap (judul, harga, harga asli, kategori, deskripsi, stok)
- Manajemen varian (nama, harga, stok per varian)
- Upload media produk: gambar dan video (maks 20MB per file)
- Sortable media gallery
- Soft delete (produk terhapus tidak muncul di katalog, histori order tetap utuh)
- Label promo, sort_order untuk urutan tampil di homepage

#### F-ADMIN-03: Manajemen Order
- Tabel order dengan filter: status, rentang tanggal
- Pagination (30 order per halaman)
- Review bukti bayar: approve/reject dengan catatan admin
- Ubah status order (sesuai alur yang valid)
- Input nomor resi dan provider pengiriman
- Lihat detail order (item, harga, info pelanggan)
- Export order ke JSON dengan filter

#### F-ADMIN-04: Manajemen User
- Daftar user dengan pencarian dan pagination
- Lihat detail user: profil, tier, cumulative spending
- Lihat jaringan user (upline & downline tree)
- Lihat riwayat order user
- Lihat riwayat komisi user
- Edit role user: regular ↔ starcenter ↔ admin
  - Assign Starcenter otomatis set tier Diamond
- Reset password user (admin action, tanpa mengetahui password lama)
- Manual adjust tier user

#### F-ADMIN-05: Manajemen Komisi
- Tabel komisi dengan filter status (pending/paid/cancelled)
- Pagination
- Mark komisi sebagai paid (satu per satu)
- Bulk mark paid (multiple komisi sekaligus)
- Export komisi ke JSON

#### F-ADMIN-06: Konfigurasi Sistem
**Tier Settings:**
- Edit min_spend dan discount_percent setiap tier

**Payment Settings:**
- Nama bank, nomor rekening, nama pemilik rekening
- Tampil di invoice pelanggan

**Commission Settings:**
- Rate komisi Regular (`sdp_commission_rate`)
- Rate Starcenter per level (1–7)
- MOQ Starcenter (minimal order value)
- Max level distribusi

**General Settings:**
- Biaya pengiriman flat

**Tier Downgrade Settings:**
- Hari inaktivitas sebelum downgrade

#### F-ADMIN-07: Konfigurasi Tampilan (Appearance)
- Upload hero video dan gambar (dengan progress bar)
- Edit judul dan subjudul hero
- Upload logo
- Pilih warna aksen (CSS custom property)
- Konfigurasi 2 seksi produk unggulan (video, judul, deskripsi)
- Semua perubahan tersimpan ke DB, di-cache 5 menit di frontend

---

## 6. Persyaratan Non-Fungsional

### 6.1 Performa
| Aspek | Target |
|-------|--------|
| Waktu respon API | < 500ms untuk 95% request |
| Waktu kalkulasi order | < 2 detik |
| Distribusi komisi | < 5 detik setelah order selesai |
| Cache setting | 1 jam di server, 5 menit di frontend |
| Pagination | Maks 30–50 item per halaman |

### 6.2 Keamanan
| Aspek | Implementasi |
|-------|-------------|
| Autentikasi | Sanctum Bearer token, revoke saat logout |
| Otorisasi admin | Middleware `EnsureIsAdmin` pada semua route admin |
| Harga produk | Kalkulasi 100% server-side (tidak mempercayai input frontend) |
| File bukti bayar | Private storage, tidak dapat diakses publik |
| Race condition stok | `lockForUpdate()` pada query produk saat checkout |
| SQL Injection | Eloquent query builder + prepared statements |
| File upload | Validasi MIME type, size limit 20MB |
| Throttling | Register & login: 5 request/menit per IP |
| XSS | React auto-escape, tidak ada `dangerouslySetInnerHTML` |
| Duplikasi komisi | Constraint unik DB (user_id, order_id, level) |

### 6.3 Skalabilitas
- Closure table (`starcenter_network`) memungkinkan query seluruh jaringan 7 level dalam satu SELECT
- Indexes pada kolom yang sering di-query: orders.status, orders.user_id, commissions.user_id
- Queue database untuk email agar tidak blocking HTTP response
- Sistem caching settings mengurangi query DB berulang

### 6.4 Keandalan & Data Integrity
- DB transaction atomic untuk seluruh proses pembuatan order
- Soft delete pada produk menjaga histori order tetap valid
- Stock restore otomatis saat order ditolak/dibatalkan
- Pembatalan komisi otomatis saat order dibatalkan setelah completed

---

## 7. Arsitektur Sistem

### 7.1 Stack Teknologi

**Frontend:**
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| React | 19.2 | UI framework |
| React Router | 7.13 | Client-side routing |
| Vite | 6.x | Build tool & dev server |
| Tailwind CSS | 4.x | Utility-first styling |
| Axios | 1.15 | HTTP client |
| Recharts | 3.8 | Dashboard charts |
| SweetAlert2 | 11.26 | Modal & notifikasi |
| Lucide React | 0.563 | Icon library |

**Backend:**
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| PHP | ^8.3 | Runtime |
| Laravel | 13 | Framework |
| Laravel Sanctum | ^4.0 | API authentication |
| Eloquent ORM | bawaan Laravel | Database abstraction |
| SQLite/MySQL | - | Database (dev/prod) |
| Laravel Queues | database driver | Async jobs (email) |
| Laravel Cache | database driver | Setting caching |

### 7.2 Pola Komunikasi Frontend–Backend

```
React Page
  │
  ├─ API Module (src/api/*.js)
  │     └─ Axios Instance (src/api/client.js)
  │           ├─ Request: inject Bearer token
  │           └─ Response: handle 401/403/422/500
  │
  └─ Laravel API (localhost:8000/api)
        ├─ Route (routes/api.php)
        ├─ Controller (app/Http/Controllers/Api/)
        └─ Service / Model
```

### 7.3 State Management Frontend

| Context | State | Persistensi |
|---------|-------|-------------|
| `AuthContext` | User, token, role | localStorage (`auth_token`) |
| `CartContext` | Item keranjang, total | localStorage (`shopping-cart`) |
| `AppearanceContext` | Branding & tema | localStorage (5 min TTL cache) |

### 7.4 Database Schema (Ringkasan)

```
users
  ├─ tier_id → tiers
  ├─ referrer_id → users (self-referential)
  └─ referral_code (unique 8 char)

orders
  ├─ user_id → users
  ├─ customer_info (JSON)
  └─ status (enum: 5 status)

order_items
  ├─ order_id → orders
  ├─ product_id → products
  └─ product_variant_id → product_variants (nullable)

payment_proofs
  └─ order_id → orders (1:1)

commissions
  ├─ user_id → users (earner)
  ├─ order_id → orders
  ├─ source_user_id → users (buyer)
  └─ level (1–7)

starcenter_network (closure table)
  ├─ upline_id → users
  ├─ downline_id → users
  └─ depth (1–7)

products
  ├─ product_variants (1:many)
  └─ product_media (1:many)

system_settings (key-value, cached 1 jam)
appearance_settings (key-value, cached 5 menit)
```

---

## 8. Alur Bisnis Utama

### 8.1 Alur Pembelian Produk

```
1. User buka katalog → pilih produk → pilih varian
2. Tambah ke keranjang (localStorage)
3. Buka keranjang → klik Checkout
4. Isi info penerima (langkah 1)
5. Review order (langkah 2)
   └─ Server kalkulasi: harga DB × kuantitas - diskon tier + ongkir
6. Konfirmasi (langkah 3)
   └─ Order dibuat, stok dikurangi, email dikirim
7. User transfer ke rekening tujuan
8. User upload bukti transfer di halaman invoice
9. Admin review bukti bayar
   ├─ Approve → status: processing, email konfirmasi
   └─ Reject → email rejection + catatan
10. Admin kirim barang → input nomor resi → status: shipped, email notifikasi
11. Admin set completed
    ├─ cumulative_spending user bertambah
    ├─ TierService.evaluateUpgrade() → cek tier naik
    └─ CommissionService.distribute() → distribusi komisi
```

### 8.2 Alur Distribusi Komisi

```
Order status → completed
  │
  └─ CommissionService.distribute(order)
        │
        ├─ Cek role buyer: Regular atau Starcenter?
        │
        ├─ [Regular buyer] → 1 level
        │     └─ Cari referrer_id user
        │           └─ Buat 1 commission record (rate: 5%)
        │
        └─ [Starcenter buyer] → hingga 7 level
              └─ Query StarcenterNetwork WHERE downline_id = buyer
                    GROUP BY depth ORDER BY depth ASC
                    └─ Loop setiap ancestor:
                          └─ Buat commission record (rate sesuai depth/level)
```

### 8.3 Alur Join Starcenter

```
1. User buka halaman /join-starcenter
2. Daftar/login sebagai Regular User
3. Admin mengubah role → Starcenter di halaman UserDetail
   └─ Tier otomatis di-set ke Diamond (terkunci)
4. User mulai bisa:
   └─ Checkout dengan nilai ≥ MOQ (IDR 5.000.000)
   └─ Lihat jaringan 7 level
   └─ Terima komisi multi-level
```

---

## 9. Konfigurasi & Pengaturan

### 9.1 Environment Variables

**Frontend (.env):**
```
VITE_API_URL=http://localhost:8000/api
VITE_STORAGE_URL=http://localhost:8000/storage
```

**Backend (starinc-api/.env):**
```
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
QUEUE_CONNECTION=database
CACHE_STORE=database
MAIL_FROM_ADDRESS=admin@sdp.com
FRONTEND_URL=http://localhost:5173
```

### 9.2 System Settings (Database-Driven, dapat diubah via Admin Panel)

| Key | Default | Keterangan |
|-----|---------|------------|
| `sdp_commission_rate` | 5% | Komisi Regular user |
| `starcenter_level_1_rate` | 10% | Komisi Starcenter level 1 |
| `starcenter_level_2_rate` | 5% | Komisi Starcenter level 2 |
| `starcenter_level_3_rate` | 3% | Komisi Starcenter level 3 |
| `starcenter_level_4_rate` | 2% | Komisi Starcenter level 4 |
| `starcenter_level_5_rate` | 1.5% | Komisi Starcenter level 5 |
| `starcenter_level_6_rate` | 1% | Komisi Starcenter level 6 |
| `starcenter_level_7_rate` | 0.5% | Komisi Starcenter level 7 |
| `starcenter_moq` | IDR 5.000.000 | MOQ Starcenter |
| `flat_shipping_cost` | IDR 20.000 | Biaya pengiriman flat |
| `tier_downgrade_days` | 30 | Hari inaktivitas sebelum downgrade |
| `payment_bank_name` | BCA | Nama bank tujuan |
| `payment_account_number` | 888888888 | Nomor rekening |
| `payment_account_name` | PT BBK | Nama pemilik rekening |

---

## 10. API Endpoint Reference

### 10.1 Public Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/register` | Daftar user baru |
| POST | `/login` | Login, dapat token |
| POST | `/forgot-password` | Request link reset password |
| POST | `/reset-password` | Konfirmasi reset password |
| GET | `/products` | Daftar produk (filter, search, pagination) |
| GET | `/products/{id}` | Detail produk + varian + media |
| GET | `/appearance` | Pengaturan tampilan homepage |
| GET | `/settings/payment` | Info rekening pembayaran |
| GET | `/tiers` | Daftar tier |

### 10.2 Authenticated Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/logout` | Revoke token |
| GET | `/user/profile` | Profil user saat ini |
| PUT | `/user/profile` | Update profil |
| PUT | `/user/password` | Ganti password |
| POST | `/checkout` | Buat order |
| GET | `/user/orders` | Riwayat order user |
| GET | `/orders/{orderNumber}/invoice` | Invoice order (ownership check) |
| POST | `/orders/{id}/payment-proof` | Upload bukti bayar |
| GET | `/user/commissions` | Riwayat komisi user |
| GET | `/user/referral-link` | Info referral & jaringan |
| GET | `/settings/system` | System settings (MOQ, dll.) |

### 10.3 Admin Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/admin/dashboard` | Stats & grafik dashboard |
| GET | `/admin/orders` | Semua order (filter, paginasi) |
| PUT | `/admin/orders/{id}/status` | Ubah status order |
| PUT | `/admin/orders/{id}/payment` | Review bukti bayar |
| PUT | `/admin/orders/{id}/tracking` | Input nomor resi |
| GET | `/admin/orders/export` | Export order ke JSON |
| POST | `/admin/products` | Buat produk |
| PUT | `/admin/products/{id}` | Update produk |
| DELETE | `/admin/products/{id}` | Hapus produk (soft delete) |
| POST | `/admin/products/{id}/media` | Upload media produk |
| GET | `/admin/users` | Daftar user (search, paginasi) |
| GET | `/admin/users/{id}` | Detail user + jaringan + order |
| PUT | `/admin/users/{id}/role` | Ubah role user |
| PUT | `/admin/users/{id}/password` | Reset password user |
| PUT | `/admin/users/{id}/tier` | Manual adjust tier |
| GET | `/admin/users/{id}/commissions` | Komisi user |
| GET | `/admin/commissions` | Semua komisi (filter status) |
| PUT | `/admin/commissions/{id}/pay` | Tandai komisi paid |
| POST | `/admin/commissions/bulk-pay` | Bulk tandai paid |
| GET | `/admin/commissions/export` | Export komisi ke JSON |
| POST | `/admin/upload` | Upload file (video/gambar) |
| GET | `/admin/settings` | Semua system settings |
| PUT | `/admin/settings` | Update system settings |
| PUT | `/admin/settings/tiers/{id}` | Update konfigurasi tier |
| GET | `/admin/appearance` | Pengaturan tampilan |
| PUT | `/admin/appearance` | Update pengaturan tampilan |

---

## 11. Struktur Proyek

```
SDP-V2/
├── src/                          # React frontend
│   ├── api/                      # HTTP client modules
│   │   ├── client.js             # Axios instance + interceptors
│   │   ├── authApi.js
│   │   ├── productApi.js
│   │   ├── orderApi.js
│   │   ├── networkApi.js
│   │   ├── adminApi.js
│   │   └── settingsApi.js
│   ├── contexts/                 # Global state
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── AppearanceContext.jsx
│   ├── layouts/                  # Page layouts
│   │   ├── RootLayout.jsx
│   │   └── AdminLayout.jsx
│   ├── pages/                    # Public pages
│   │   ├── Home.jsx
│   │   ├── Catalog.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Checkout.jsx
│   │   ├── Invoice.jsx
│   │   ├── TrackOrders.jsx
│   │   ├── Profile.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── JoinStarcenter.jsx
│   │   └── CenterShop.jsx
│   └── pages/admin/              # Admin pages
│       ├── Dashboard.jsx
│       ├── Products.jsx
│       ├── Orders.jsx
│       ├── Users.jsx
│       ├── UserDetail.jsx
│       ├── Commissions.jsx
│       ├── Tiers.jsx
│       ├── Appearance.jsx
│       └── PaymentSettings.jsx
│
├── starinc-api/                  # Laravel backend
│   ├── app/
│   │   ├── Http/Controllers/Api/ # 8 controllers
│   │   ├── Models/               # 10 Eloquent models
│   │   ├── Services/             # Business logic
│   │   │   ├── OrderService.php
│   │   │   ├── CommissionService.php
│   │   │   └── TierService.php
│   │   └── Http/Middleware/
│   │       └── EnsureIsAdmin.php
│   ├── database/
│   │   ├── migrations/           # 13 schema migrations
│   │   └── seeders/              # 6 data seeders
│   └── routes/
│       └── api.php               # 40+ API routes
│
├── .playwright/                  # E2E testing
│   └── profiles/                 # Auth profiles (admin, starcenter, regular)
├── CLAUDE.md                     # Developer guide
├── PRD.md                        # Dokumen ini
└── vite.config.js
```

---

## 12. Akun Default & Testing

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@starinc.id | password |
| Starcenter | sc.jawatimur@starinc.com | password123 |
| Regular | downline.2.1@starinc.com | password123 |

**Playwright Profiles:**
- Admin, Starcenter, Regular tersimpan di `.playwright/profiles/`
- Jalankan `/setup-profiles` untuk membuat atau refresh profil

---

## 13. Batasan & Asumsi

### 13.1 Batasan Saat Ini
1. **Payment Gateway**: Hanya mendukung transfer bank manual (tidak ada payment gateway otomatis)
2. **Notifikasi Real-time**: Tidak ada WebSocket; user harus refresh untuk melihat update status
3. **Mobile App**: Saat ini hanya web (responsive)
4. **Multi-bahasa**: Saat ini hanya Bahasa Indonesia
5. **Export**: Hanya JSON (belum ada CSV/Excel)
6. **Currency**: Hanya IDR (Rupiah)

### 13.2 Asumsi Bisnis
- Satu user hanya bisa memiliki satu referrer (fixed saat registrasi, tidak bisa diubah)
- Komisi dihitung dari subtotal setelah diskon tier, bukan total setelah ongkir
- Biaya pengiriman flat untuk semua order (tidak ada perhitungan berdasarkan lokasi)
- Starcenter tidak bisa downgrade tier (terkunci Diamond)
- Satu upload bukti bayar per order (tidak bisa diupload ulang jika ditolak; butuh order baru)

---

## 14. Roadmap & Pengembangan Masa Depan

### Prioritas Tinggi
- [ ] Integrasi payment gateway (Midtrans/Xendit) untuk konfirmasi otomatis
- [ ] Notifikasi real-time (WebSocket/pusher) untuk status order
- [ ] Export data ke CSV/Excel selain JSON
- [ ] Mobile-responsive improvement (PWA)

### Prioritas Sedang
- [ ] Upload ulang bukti bayar jika ditolak
- [ ] SKU/barcode untuk produk
- [ ] Perhitungan ongkir berdasarkan lokasi (integrasi Raja Ongkir)
- [ ] Laporan komisi dengan grafik per distributor

### Prioritas Rendah
- [ ] Multi-bahasa (EN/ID toggle)
- [ ] Voucher/kupon diskon
- [ ] Product review & rating oleh pelanggan
- [ ] Affiliate dashboard yang lebih kaya fitur

---

*Dokumen ini dibuat berdasarkan analisis menyeluruh terhadap codebase SDP-V2 pada tanggal 21 April 2026.*
