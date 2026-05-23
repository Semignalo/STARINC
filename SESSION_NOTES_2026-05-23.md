# Session Notes — 2026-05-23

Sesi panjang. Ini ringkasan semua yang dikerjakan dan status akhirnya.

---

## Yang Sudah Dikerjakan

### 1. Cloudinary Integration
- Dual-driver upload: `local` (default) + `cloudinary` (optional)
- `MediaStorageService` dengan strategy pattern di `starinc-api/app/Services/Media/`
- Upload limit PHP dinaikkan: `upload_max_filesize=50M`, `post_max_size=64M` di php.ini Laragon
- Admin bisa pilih driver per-upload di form produk + appearance settings

### 2. Instagram Feed (Graph API)
- Pakai **Instagram Login API** (`graph.instagram.com/v21.0/me/media`)
- Token: IGAA... type (dari "Akses API Instagram dengan login bisnis Instagram")
- Auto-refresh setiap Senin 02:00 via Laravel scheduler (`schedule:weeklyOn(1, '02:00')`)
- Cache: `instagram:active_token` + `instagram:token_expires_at`
- `InstagramService.php` dengan `refreshToken()` + `getPosts()` method
- Frontend: `InstagramPostModal` dengan fallback manual jika API gagal
- Embed iframe **tidak dipakai** karena starinc.official punya age restriction

### 3. Admin UI — Full Rebuild
Seluruh admin panel di-rebuild ke style Linear/Notion: monochrome, clean, no color noise.
- Dashboard, Products, Orders, Users, Commissions, Tiers, Settings, Appearance

### 4. Frontend Design Sweep
- **Palette**: Dark navy (#0F172A) + gold accent (#C5A059) — hanya pada btn-primary + Footer
- **CSS**: `@theme` block di `index.css` + `.btn-primary` utility dengan gradient navy + gold border-bottom
- **Rounded corners**: `rounded-md` untuk inputs, `rounded-lg` untuk cards — konsisten di semua halaman

### 5. Homepage Sections
- **Featured Products**: 1 row (4 produk), View All button highlighted navy+gold
- **Featured Split**: `grid-cols-[1.8fr_1fr]`, `aspect-[4/5] max-h-[85vh]`, rasio portrait
- **Video embed**: YouTube embed, aspect ratio landscape tetap ikut original, diperbesar

### 6. Catalog Page
- `lg:grid-cols-4`, search bar inline, tidak ada filter/count/sort
- Gambar produk dengan rounded corners

### 7. ProductDetail — Aesop-style Rebuild
- Breadcrumb: Home > Catalog > Category > Title
- Grid `md:grid-cols-[1.3fr_1fr]` (gambar kiri dominan)
- Tabs: Description / Ingredients / Packaging (conditional — tampil jika ada data)
- Feature Split section: gambar kiri + judul+teks kanan
- Customer Reflections: slider dummy testimonials
- Trust strip: navy gradient + gold icons (di bawah)
- Related products section

### 8. Database Schema Additions
- `ingredients` + `packaging` (TEXT nullable) via migration `2026_05_23_000001_*`
- `feature_image`, `feature_image_driver`, `feature_image_public_id`, `feature_title`, `feature_text` via migration `2026_05_23_000002_*`
- C-STAR product di-seed dengan data dummy lengkap

### 9. Page Polish (Checkout, Auth, Profile, About)
- Input class konsisten: `h-11 rounded-md border-gray-200 focus:ring-gray-900`
- Cards: `rounded-lg border border-gray-200`
- About page: dark section dengan navy gradient, matching Footer + Partnership

### 10. AKUN_DUMMY.md Update
- File lama outdated: masih pakai email `downline.X.Y@` (tanpa prefix `sc.`) + role `regular`
- Setelah Phase 1 STARINC split, semua user non-admin → role `starcenter`
- Email downline: `sc.downline.X.Y@starinc.com`
- File diupdate sesuai state DB aktual (13 users, id 1–13)

---

## Bug / Pitfall Penting

| Masalah | Fix |
|---------|-----|
| `PHP_Incomplete_Class` dari Eloquent Collection di cache | Panggil `->get()->toArray()` sebelum `Cache::remember()` |
| Cross-tab cache invalidation | `storage` event listener + `localStorage.setItem('appearance_bust', Date.now())` |
| Instagram iframe diblokir (age restriction) | Modal pakai layout custom + link "Open in Instagram" |
| `localhost` resolve ke IPv6 di Windows 11 | Selalu pakai `127.0.0.1` |
| Cloudinary URL malformed di `.env` | Pakai individual vars (`CLOUDINARY_CLOUD_NAME` dst), bukan `CLOUDINARY_URL` |

---

## State Saat Ini

### Halaman yang Sudah Di-review & Polish
✅ Catalog, ProductDetail, Checkout, Login/Register, Profile, About

### Halaman yang BELUM Di-review
- FAQ
- Partnership
- JoinStarcenter / DaftarCenter
- TrackOrders
- Invoice
- CenterShop (starcenter-only shop)
- Navbar + CartDrawer

### Homepage Sections yang BELUM Di-review
- Hero section
- Testimonials
- Partnership CTA
- Quote section

---

## Konfigurasi Penting

### URLs Lokal
- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:8000/api`
- Admin: `http://localhost:5173/admin`
- Center Shop: `http://localhost:5173/center`

### Database
- MySQL: `starinc_db` (bukan starinc_db_v2 lagi — sudah dipakai langsung)
- Password root: kosong

### VPS
- IP: `157.10.161.83`
- SSH user: `STARINC`
- Provider: IDCloudHost

### Env Keys Penting
- `VITE_API_URL=http://localhost:8000/api` (atau `127.0.0.1`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID`

---

## Dummy Credentials (Quick Reference)

| Akun | Email | Password |
|------|-------|----------|
| Admin | `admin@starinc.id` | `password` |
| SC Regional | `sc.jawatimur@starinc.com` | `password123` |
| SC Downline | `sc.downline.2.1@starinc.com` | `password123` |

Lihat `AKUN_DUMMY.md` untuk list lengkap.
