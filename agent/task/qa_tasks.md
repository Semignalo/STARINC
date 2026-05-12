# Task List — Tim QA

> Proyek: SDP-V2 (E-commerce + MLM Platform)
> Stack: React 19 + Laravel 13 + SQLite (dev) / MySQL (prod)
> Tanggal: 2026-04-15

---

## 1. Ringkasan Tanggung Jawab

Tim QA memastikan kualitas aplikasi melalui test manual dan otomatis pada alur bisnis kritis, integrasi frontend-backend, dan regression testing setelah setiap perubahan. Fokus utama: alur e-commerce, sistem MLM multi-level, dan integritas data finansial (komisi).

---

## 2. Task Breakdown

### A. Test Strategy & Setup

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| A1 | Buat Test Plan dokumen | High | Dokumentasikan scope, approach, criteria pass/fail untuk setiap modul. Simpan di `agent/docs/qa/test-plan.md`. |
| A2 | Setup test environment | High | Provision environment terpisah: SQLite untuk dev testing, MySQL untuk staging. Seed data dummy konsisten. |
| A3 | Setup PHPUnit backend | High | Pastikan `php artisan test` berjalan. Buat struktur test folder: `Feature/`, `Unit/`, `Services/`. |
| A4 | Setup Vitest / Playwright frontend | Medium | Pilih tool: Vitest untuk unit, Playwright untuk E2E. Setup config. |
| A5 | Bug tracking workflow | High | Tentukan template bug report: title, steps, expected, actual, severity, environment, screenshot. |

### B. Authentication & Authorization Testing

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| B1 | Test Register flow | Critical | Valid data, duplicate email, invalid referral code, auto-generate referral code, role default = regular. |
| B2 | Test Login flow | Critical | Valid credentials, wrong password, non-existent user, rate limit (5 attempts/minute per P1.4). |
| B3 | Test Logout & token invalidation | High | Token harus tidak valid setelah logout. Test dari multiple device. |
| B4 | Test Admin middleware protection | Critical | User role `regular` dan `starcenter` dilarang akses `/admin/*`. Return 403. |
| B5 | Test Referral code auto-fill | High | URL dengan `?ref=XXXX` harus auto-fill di form register. |
| B6 | Test Password update | High | Update password valid, invalid old password, mismatch confirmation. |
| B7 | Test Sanctum token expiration | Medium | Simulasikan token expired, pastikan auto-redirect ke login. |

### C. E-commerce Flow Testing

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| C1 | Test Catalog & Search | High | Filter kategori, search keyword, pagination, sort. Test edge: hasil kosong, special characters. |
| C2 | Test Product Detail | High | Variant selection, gambar gallery, harga update berdasarkan variant. |
| C3 | Test Cart operations | Critical | Add to cart, update quantity, remove item, persist di localStorage, sync antar tab. |
| C4 | Test Checkout — Regular user | Critical | Kalkulasi harga server-side benar, tier discount applied, kirim bukti bayar berhasil. |
| C5 | Test Checkout — Starcenter user | Critical | Validasi MOQ, tier discount, upload bukti bayar. Test MOQ fail case. |
| C6 | Test Upload bukti bayar validasi | High | Validasi MIME type (jpg/png/pdf), max size, file rusak. |
| C7 | Test Order status flow | Critical | `pending_payment` → admin confirm → `awaiting_confirmation` → `completed`/`cancelled`. Test semua transisi. |
| C8 | Test Invoice public access | Medium | Invoice bisa diakses via order number tanpa login. |
| C9 | Test Order history user | High | User hanya melihat order milik sendiri, tidak bisa akses order orang lain. |
| C10 | Test Inventory validation (P1.3) | High | Setelah implementasi stok, test: order saat stok cukup, stok habis, race condition concurrent order. |

### D. MLM & Commission Testing

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| D1 | Test Commission distribution — Regular | Critical | Regular user checkout, upline (1 level) dapat komisi 5%. |
| D2 | Test Commission distribution — Starcenter MLM | Critical | Starcenter checkout, upline sampai 7 level dapat komisi sesuai rate. |
| D3 | Test Commission cancellation | Critical | Order cancel → semua commission terkait di-cancel. |
| D4 | Test Network Tree visualization | High | Tampilkan downline sampai kedalaman N, performance saat tree besar (100+ downline). |
| D5 | Test Referral link generation | High | Link unique per user, QR code valid. |
| D6 | Test Closure table integrity | Critical | Insert user baru, pastikan semua entry `starcenter_network` (depth 1-7) ter-generate benar. |
| D7 | Test Admin pay commission | Critical | Pay single, bulk pay, status update ke `paid`. Tidak bisa pay 2x. |
| D8 | Test Commission export | Medium | CSV/PDF export, data lengkap dan format benar. |

### E. Tier System Testing

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| E1 | Test Auto-upgrade tier | Critical | User cumulative_spending cross threshold → tier upgrade otomatis saat order completed. |
| E2 | Test Tier discount applied | Critical | Checkout dengan tier aktif, discount percent applied dengan benar ke total. |
| E3 | Test Auto-downgrade (scheduled) | High | Command `tier:check-downgrades` — user tidak transaksi >N hari downgrade tier. |
| E4 | Test B1 bug | Medium | Verifikasi bug B1: setelah downgrade, `last_transaction_at` reset ke now() — pastikan perbaikan tidak regresi. |
| E5 | Test Admin edit tier | High | Edit threshold & discount. Pastikan user existing tidak broken. |

### F. Admin Panel Testing

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| F1 | Test Admin Dashboard stats | High | Revenue, orders, users, commissions chart menampilkan data akurat. |
| F2 | Test CRUD Produk | Critical | Create, update, delete, upload media. Validasi input. |
| F3 | Test Order management | Critical | Filter status, search order number, update status, lihat bukti bayar. |
| F4 | Test User management | High | Filter role, update role (regular ↔ starcenter ↔ admin), detail user menampilkan network + komisi. |
| F5 | Test Commission management | Critical | List, pay single, bulk pay (select multiple), export. |
| F6 | Test Tier management | High | Edit tier threshold & discount percent. |
| F7 | Test Settings (setelah migrasi) | Critical | Appearance & Payment Settings setelah migrasi dari Firebase. Data ter-save dan ter-load dari Laravel API. |

### G. Security Testing

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| G1 | Test SQL injection | Critical | Coba inject di form search, filter, login. Pastikan Eloquent prepared statements. |
| G2 | Test XSS | Critical | Input script di nama produk, komentar, alamat. Pastikan ter-sanitize di React. |
| G3 | Test CSRF | High | Sanctum stateless token — pastikan tidak rentan. |
| G4 | Test rate limiting login (P1.4) | High | Login 6x dalam 1 menit harus diblokir. |
| G5 | Test authorization IDOR | Critical | User A tidak bisa akses order/komisi user B via manipulasi ID. |
| G6 | Test admin route protection | Critical | Non-admin ke `/api/admin/*` harus 403. |
| G7 | Test Firebase API key exposure | Critical | Setelah P0.1-P0.3 selesai, verifikasi tidak ada key exposed di bundle production. |

### H. Performance & Load Testing

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| H1 | Lighthouse audit frontend | High | Target: Performance > 85, Accessibility > 90, SEO > 90, Best Practices > 90. |
| H2 | API response time baseline | Medium | Ukur response time semua endpoint. Baseline < 500ms untuk list, < 200ms untuk detail. |
| H3 | N+1 query detection | High | Pakai Laravel Debugbar / Telescope saat test untuk deteksi N+1. Fokus: CommissionService (P2.2). |
| H4 | Concurrent checkout test | Critical | 10 user checkout barang sama dengan stok terbatas. Pastikan integritas stok. |
| H5 | Large dataset test | Medium | Seed 10k users, 50k orders, 100k commissions. Test response time admin panel. |

### I. Regression Testing

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| I1 | Smoke test suite | High | Kumpulan test quick (< 5 menit) untuk validasi critical path setelah setiap deploy. |
| I2 | Full regression checklist | High | Checklist komprehensif yang dijalankan sebelum release major. |
| I3 | Automated regression | Medium | Otomatisasi bertahap dengan Playwright untuk E2E. |

### J. Cross-browser & Device Testing

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| J1 | Chrome, Firefox, Safari, Edge (desktop) | High | Test alur checkout dan admin di 4 browser utama. |
| J2 | Mobile Safari (iOS) | High | Test di iOS real device / BrowserStack. |
| J3 | Chrome Mobile (Android) | High | Test di Android real device. |
| J4 | Tablet breakpoint | Medium | Test iPad / tablet Android. |

---

## 3. Prioritas Task

### Critical (Selesaikan segera)
- A1, A2, A3, A5, B1, B2, B4, C3, C4, C5, C7, D1, D2, D3, D6, D7, E1, E2, F2, F3, F5, F7, G1, G2, G5, G6, G7, H4

### High (Minggu 1-2)
- B3, B5, B6, C1, C2, C6, C9, C10, D4, D5, E3, E5, F1, F4, F6, G3, G4, H1, H3, I1, I2, J1, J2, J3

### Medium (Minggu 3-4)
- A4, B7, C8, D8, E4, H2, H5, I3, J4

---

## 4. Deliverables

1. Test plan dokumen di `agent/docs/qa/test-plan.md`
2. Test case matrix (Excel/Markdown) mapping requirement ke test case
3. Bug report per issue dengan severity (Critical/High/Medium/Low)
4. Regression test report setiap release
5. Performance report: Lighthouse score, API response time, load test result
6. Automated test suite (PHPUnit + Vitest/Playwright) dengan coverage report

---

## 5. Risiko & Catatan

- **Risiko Kritis**: Commission distribution melibatkan uang — bug di sini bisa berdampak finansial langsung. Prioritas paling tinggi untuk test coverage.
- **Risiko**: Migrasi SQLite → MySQL (P0.4) berpotensi memunculkan bug behavior (collation, case sensitivity). Full regression wajib setelah migrasi.
- **Catatan**: Gunakan database transaction pada seeder test agar state tidak kontaminasi antar test.
- **Koordinasi**: Review setiap PR dari tim Frontend & Backend sebelum merge ke main.
- **Dependency**: Test D1-D8 membutuhkan seeder yang membentuk upline-downline chain sampai 7 level.
