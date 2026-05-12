# Task List — Tim Performance

> Proyek: SDP-V2 (E-commerce + MLM Platform)
> Stack: React 19 + Laravel 13 + MySQL (prod)
> Tanggal: 2026-04-15

---

## 1. Ringkasan Tanggung Jawab

Tim Performance bertanggung jawab mengoptimalkan kecepatan aplikasi di frontend (bundle size, render, loading) dan backend (query, caching, N+1). Target: Lighthouse > 85, API response < 300ms (p95), zero N+1 pada endpoint critical.

---

## 2. Task Breakdown

### A. Backend — Database Optimization

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| A1 | Tambahkan database indexes | Critical | migration baru | Index wajib: `users.referrer_id`, `users.referral_code`, `users.(role, tier_id)`, `orders.(user_id, status)`, `orders.order_number`, `commissions.(user_id, status)`, `commissions.order_id`, `starcenter_network.(upline_id, depth)`, `starcenter_network.downline_id`. (Reference: P2.3) |
| A2 | Migrasi SQLite → MySQL | Critical | `.env`, `database.sqlite` | SQLite tidak support concurrent writes. Target produksi MySQL 8. (Reference: P0.4) |
| A3 | Query slow log monitoring | High | MySQL config | Aktifkan `slow_query_log` dengan threshold 100ms. Review log mingguan. |
| A4 | Analyze query execution plan | High | - | `EXPLAIN` pada query top 10 endpoint. Pastikan pakai index, tidak full table scan. |
| A5 | Connection pool tuning | Medium | `config/database.php` | Tune max connections, idle timeout untuk MySQL production. |

### B. Backend — Caching

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| B1 | Cache `SystemSetting::getValue()` | High | `app/Models/SystemSetting.php` | Wrap dengan `Cache::remember('setting_{key}', 3600, ...)`. Invalidate saat update. (Reference: P2.1) |
| B2 | Cache Appearance settings | High | `app/Models/AppearanceSetting.php` | Setting jarang berubah, cache 1 jam. |
| B3 | Cache Tier list | Medium | `app/Services/TierService.php` | Cache list tiers aktif, invalidate saat admin edit tier. |
| B4 | Cache Product list public | Medium | `app/Http/Controllers/Api/ProductController.php` | Cache endpoint list public 5 menit dengan tag. Invalidate saat CRUD produk. |
| B5 | Migrasi CACHE_STORE ke Redis | Medium | `.env`, `config/cache.php` | Dari `database` ke `redis` di production untuk latency rendah. |

### C. Backend — N+1 & Query Optimization

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| C1 | Fix N+1 di `CommissionService::distributeMLM()` | Critical | `app/Services/CommissionService.php` | Eager load MLM chain sekali: `StarcenterNetwork::where('downline_id', ...)->orderBy('depth')->with('upline')->get()`. (Reference: P2.2) |
| C2 | Eager load relations di Order list admin | High | `app/Http/Controllers/Api/Admin/OrderController.php` | `->with(['user', 'items.product', 'paymentProof'])`. |
| C3 | Eager load relations di Commission list | High | `app/Http/Controllers/Api/Admin/CommissionController.php` | `->with(['user', 'sourceUser', 'order'])`. |
| C4 | Pindahkan inline query dari routes ke Controller | Medium | `routes/api.php` | Route `/user/referral-link` (50+ baris) dan `/user/commissions` diposisikan di Controller untuk reusability + testability. (Reference: B2, B3) |
| C5 | Pagination di semua endpoint list | High | - | Pastikan semua list endpoint pakai `paginate()`, tidak `get()` all. |
| C6 | Optimize query Dashboard stats | High | `app/Http/Controllers/Api/Admin/DashboardController.php` | Gunakan subquery/aggregate, hindari multiple COUNT queries terpisah. |

### D. Backend — API Response Optimization

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| D1 | Gzip/Brotli compression | High | Nginx/Apache config | Enable compression response JSON. Target 70% reduction. |
| D2 | API Resource class | Medium | `app/Http/Resources/` | Gunakan `JsonResource` untuk transformasi konsisten + hindari kirim kolom tidak perlu. |
| D3 | HTTP cache headers | Medium | middleware | `ETag` + `Cache-Control` untuk endpoint public (products, appearance). |
| D4 | Response field selection | Low | - | Support `?fields=id,name,price` untuk mengurangi payload. |

### E. Backend — Queue & Async

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| E1 | Commission distribution ke Queue | High | `app/Services/CommissionService.php` | Move MLM distribution ke Job async agar response admin update status order cepat. |
| E2 | Email notification ke Queue | High | `app/Mail/` | Semua email via `ShouldQueue` (Phase 3). |
| E3 | Setup Queue worker production | High | Supervisor config | `php artisan queue:work --tries=3` via supervisor. |
| E4 | Horizon untuk monitoring queue | Low | - | Install Laravel Horizon jika pakai Redis queue. |

### F. Frontend — Bundle Optimization

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| F1 | Vite manual chunks | Critical | `vite.config.js` | Split: `vendor` (react, router), `charts` (recharts), `ui` (sweetalert2, lucide). Target initial bundle < 300KB. (Reference: P2.4) |
| F2 | Hapus Firebase dependency | Critical | `package.json` | Setelah migrasi P0.1-P0.3 selesai, hapus `firebase`. Save ~200KB. |
| F3 | Bundle analyzer | High | - | Jalankan `vite-bundle-visualizer`. Identifikasi module besar yang tidak perlu. |
| F4 | Tree-shaking audit | Medium | - | Cek `lucide-react`, `recharts` — pastikan named import, bukan `import *`. |
| F5 | Remove unused dependencies | High | `package.json` | Audit + uninstall package tidak terpakai. |

### G. Frontend — Code Splitting & Lazy Load

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| G1 | React.lazy untuk routes | Critical | `src/App.jsx` | Lazy load semua page: `const Catalog = lazy(() => import(...))`. Wrap dengan `<Suspense>`. (Reference: P2.5) |
| G2 | Lazy load admin panel | Critical | `src/App.jsx` | Admin panel (Products.jsx 815 baris, dll) harus lazy — user publik tidak perlu download. |
| G3 | Image lazy load | High | `src/components/ProductCard.jsx` | `loading="lazy"` native + Intersection Observer untuk optimasi. (Reference: Phase 2.4) |
| G4 | Dynamic import heavy components | Medium | - | Recharts di Dashboard, map library (jika ada). |

### H. Frontend — Rendering Optimization

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| H1 | `useMemo` & `useCallback` audit | Medium | komponen list | Memoize komputasi berat (cart total, filter produk). Hindari re-render list besar. |
| H2 | Virtualization untuk list panjang | Medium | admin tables | `react-window` untuk tabel 500+ row (orders, commissions). |
| H3 | Debounce search input | High | `src/pages/Catalog.jsx` | Search 300ms debounce sebelum request API. |
| H4 | Optimize Context re-render | Medium | Context providers | Split context jika value sering berubah (misal CartContext quantity). |
| H5 | Hindari inline function di props | Low | - | Extract handlers, gunakan `useCallback`. |

### I. Frontend — Asset Optimization

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| I1 | Image format WebP/AVIF | High | upload handler backend | Convert upload produk ke WebP. Fallback JPG. |
| I2 | Responsive images | High | `src/components/ProductCard.jsx` | `srcset` dengan multiple resolution. |
| I3 | Font optimization | Medium | - | Subset font, preload, `font-display: swap`. |
| I4 | Preload critical assets | Medium | `index.html` | `<link rel="preload">` hero image, main CSS. |
| I5 | CDN untuk static assets | Medium | Firebase Hosting / Cloudflare | Aktifkan CDN caching untuk assets. |

### J. Monitoring & Metrics

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| J1 | Setup APM backend | High | - | Laravel Telescope (dev) + Sentry (prod) untuk track slow query & error. |
| J2 | Frontend RUM | Medium | - | Sentry browser atau Web Vitals ke custom endpoint. |
| J3 | Web Vitals tracking | High | `src/main.jsx` | Capture LCP, FID, CLS kirim ke backend analytics. |
| J4 | Baseline performance report | Critical | - | Ukur current state: Lighthouse, API response time p50/p95/p99. Jadi baseline measurement sebelum optimasi. |
| J5 | Load testing | High | - | k6 / Apache Bench skenario: 100 concurrent user checkout. |

---

## 3. Prioritas Task

### Critical (Pengaruh terbesar, segera)
- A1, A2, C1, F1, F2, G1, G2, J4

### High (Minggu 1-2)
- A3, A4, B1, B2, C2, C3, C5, C6, D1, E1, E2, E3, F3, F5, G3, H3, I1, I2, J1, J3, J5

### Medium (Minggu 3-4)
- A5, B3, B4, B5, C4, D2, D3, F4, G4, H1, H2, H4, I3, I4, I5, J2

### Low
- D4, E4, H5

---

## 4. Target & KPI

| Metric | Current (Baseline) | Target |
|--------|---------------------|--------|
| Lighthouse Performance (mobile) | TBD | > 85 |
| Lighthouse Performance (desktop) | TBD | > 90 |
| Initial JS Bundle Size | TBD | < 300 KB gzipped |
| API Response p50 | TBD | < 150 ms |
| API Response p95 | TBD | < 500 ms |
| Time to First Byte (TTFB) | TBD | < 400 ms |
| Largest Contentful Paint (LCP) | TBD | < 2.5 s |
| First Input Delay (FID) | TBD | < 100 ms |
| Cumulative Layout Shift (CLS) | TBD | < 0.1 |
| N+1 query di endpoint critical | - | 0 |

---

## 5. Deliverables

1. Performance baseline report (task J4)
2. Migration script untuk indexes (task A1)
3. Bundle analysis report before/after
4. Load test report
5. Monitoring dashboard setup (Sentry/Telescope)
6. Performance budget dokumen: batas bundle size, response time per endpoint

---

## 6. Risiko & Catatan

- **Risiko**: Migrasi MySQL (A2) bisa memunculkan edge case yang tidak muncul di SQLite (collation, case sensitivity, transaction behavior). Koordinasi dengan QA untuk regression test.
- **Risiko**: Optimasi prematur tanpa baseline bisa menyebabkan refactor tidak perlu. Selalu ukur dulu (J4).
- **Catatan**: Commission distribution ke queue (E1) penting karena saat ini blocking — admin klik update status, tunggu seluruh MLM selesai.
- **Catatan**: Index terlalu banyak juga buruk (slow insert). Tambah hanya yang benar-benar terpakai di query production.
- **Dependency**: Redis (B5) butuh infrastructure production tersedia. Sementara pakai `file` atau `database` driver.
- **Koordinasi**: Sync dengan Backend team sebelum refactor Service (C1) — pastikan tidak break business logic.
