# INSTANT LOAD — Diagnosis & Rekomendasi

> Dibuat: 2026-05-13 | Fokus: First paint <1 detik, tidak ada blank screen

---

## DIAGNOSIS: Kenapa Web Sering Lambat / Tidak Ter-load?

Saat browser buka URL, urutan yang terjadi sekarang:

```
1. Fetch HTML (kosong, cuma <div id="root">)           ~ 100ms
2. Fetch Google Fonts CSS (blocking)                   ~ 300-1000ms
3. Fetch JS bundle utama (lucide-react + recharts etc) ~ 500ms-2s
4. Parse + eksekusi React + semua Context Provider
5. ⚠️ AuthProvider BLOKIR render → fetch /api/auth/me  ~ 200-2000ms
6. Render PageLoader (spinner)
7. Lazy-load Home.jsx (round trip JS lagi)              ~ 200-500ms
8. Home mount → 3 API call (products x2 + testimonials)
9. Hero video <video preload="auto"> download FULL     ~ 5-30MB!
10. Paint pertama
```

**Total worst case: 10-30 detik** di koneksi lambat. Kalau backend lag → layar PUTIH selamanya.

---

## 🔴 ROOT CAUSE — 5 Blocker Utama

### #1 AuthProvider Memblokir Seluruh App
**File:** [src/contexts/AuthContext.jsx:121](src/contexts/AuthContext.jsx#L121)

```jsx
<AuthContext.Provider value={value}>
    {!loading && children}   // ⚠️ INI MASALAHNYA
</AuthContext.Provider>
```

Kalau ada `auth_token` di localStorage, browser **menunggu** API `getProfile()` selesai sebelum render APAPUN. Kalau backend down, slow, atau timeout → layar putih total. Bahkan halaman publik (Home, Catalog) tidak muncul.

**Fix instant:**
```jsx
return (
    <AuthContext.Provider value={value}>
        {children}   // Render langsung, biar konsumen handle loading sendiri
    </AuthContext.Provider>
);
```
Komponen yang butuh user (Navbar profile menu, checkout) cukup pakai `if (!currentUser) return <Skeleton />`. Halaman publik tidak perlu nunggu.

---

### #2 Hero Video `preload="auto"` dari CDN Eksternal
**File:** [src/pages/Home.jsx:80-88](src/pages/Home.jsx#L80-L88)

```jsx
<video autoPlay loop muted playsInline preload="auto" ...>
    <source src={settings?.heroVideoUrl} type="video/mp4" />
</video>
```

`preload="auto"` = browser **download seluruh video** (puluhan MB!) sebelum frame pertama tampil. Default URL `https://cdn.pixabay.com/...` — kalau Pixabay slow / di-blok / region lambat, hero blank.

**Fix instant:**
```jsx
<video
    autoPlay loop muted playsInline
    preload="metadata"                                  // ⬅ cuma load metadata
    poster={settings?.heroVideoPoster || '/hero-poster.jpg'}  // ⬅ wajib ada
    className="absolute inset-0 w-full h-full object-cover"
>
    <source src={settings?.heroVideoUrl} type="video/mp4" />
</video>
```

Plus: **upload video ke storage sendiri** (`/storage/videos/hero.mp4`) — jangan dari Pixabay. Atau hosting di Cloudflare R2 / Bunny CDN.

---

### #3 Google Fonts 7 Weight = Render Blocking
**File:** [index.html:7-9](index.html#L7-L9)

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap">
```

7 weight × 2 (latin + latin-ext) = ~14 font file. Render-blocking sampai font CSS selesai download.

**Fix instant:**
```html
<!-- Preconnect dulu (di parallel dengan parsing HTML) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Reduce ke 3 weight yang benar-benar dipakai -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap" rel="stylesheet"></noscript>
```

`media="print" onload="this.media='all'"` = **trick non-blocking** untuk CSS eksternal.

Atau paling top: **self-host fonts** di `public/fonts/` + `@font-face` di CSS. Tidak ada round trip ke Google.

---

### #4 Blank Screen Sampai React Mount
**File:** [index.html:12-14](index.html#L12-L14)

```html
<body>
    <div id="root"></div>   <!-- KOSONG sampai JS bundle selesai parse -->
    <script type="module" src="/src/main.jsx"></script>
</body>
```

User lihat **layar putih** dari "fetch HTML selesai" sampai "React mount selesai". Bisa 2-5 detik.

**Fix instant — inline loading skeleton:**
```html
<body>
    <div id="root">
        <div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#fff;font-family:system-ui">
            <div style="text-align:center">
                <div style="width:48px;height:48px;border:3px solid #eee;border-top-color:#C5A059;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto"></div>
                <p style="margin-top:16px;color:#999;font-size:13px">STARINC</p>
            </div>
        </div>
        <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </div>
    <script type="module" src="/src/main.jsx"></script>
</body>
```

Begitu React mount, `<div id="root">` di-replace dengan App — skeleton hilang otomatis. User langsung lihat **sesuatu** dalam ~200ms.

---

### #5 Tidak Ada Preconnect ke Backend API
**File:** [index.html](index.html)

Browser baru tahu mau connect ke `localhost:8000` / VPS API **setelah** JS bundle parse dan execute. Padahal preconnect butuh 100-300ms (TCP + TLS handshake).

**Fix instant — tambah di `<head>`:**
```html
<link rel="preconnect" href="http://127.0.0.1:8000">
<link rel="dns-prefetch" href="http://127.0.0.1:8000">

<!-- Production di VPS -->
<link rel="preconnect" href="https://api.starinc.id">
```

Browser mulai handshake **paralel** dengan parsing HTML.

---

## 🟠 OPTIMASI BUNDLE & ASSET

### #6 Vite Build Belum Optimal
**File:** [vite.config.js](vite.config.js)

Tambah:
```js
import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    // ... yang sudah ada
    compression({ algorithm: 'gzip', ext: '.gz' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  build: {
    cssMinify: 'lightningcss',
    minify: 'esbuild',
    target: 'es2020',          // modern browser only, smaller output
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:    ['react', 'react-dom', 'react-router-dom'],
          axios:     ['axios'],
          icons:     ['lucide-react'],           // ⬅ pisahkan (besar)
          charts:    ['recharts'],
          ui:        ['sweetalert2'],
          pdf:       ['react-pdf'],              // ⬅ pisahkan
          ocr:       ['tesseract.js'],           // ⬅ pisahkan (dipakai 1 page)
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
});
```

Install: `npm i -D vite-plugin-compression lightningcss`

Lalu di Laravel/Nginx VPS, aktifkan brotli/gzip serving:
```nginx
location / {
    gzip_static on;
    brotli_static on;
}
```

---

### #7 PageLoader Pakai `min-h-screen` — Layout Shift
**File:** [src/components/PageLoader.jsx](src/components/PageLoader.jsx)

Saat lazy chunk loaded, PageLoader hilang → Home muncul → layout shift. CLS (Cumulative Layout Shift) score jelek.

**Fix:** Pakai container `min-h-[400px]` dengan skeleton yang menyerupai struktur halaman, bukan full screen spinner.

---

### #8 Cache TTL Appearance Terlalu Pendek
**File:** [src/contexts/AppearanceContext.jsx:28](src/contexts/AppearanceContext.jsx#L28)

```js
const CACHE_TTL = 5 * 60 * 1000;  // ⚠️ 5 menit
```

Appearance settings jarang berubah. Naikkan jadi 1 jam, dan invalidate manual saat admin save.

```js
const CACHE_TTL = 60 * 60 * 1000;  // 1 jam
```

---

### #9 PWA Cache Strategy Belum Maksimal
**File:** [vite.config.js:33-44](vite.config.js#L33-L44)

```js
runtimeCaching: [
  {
    urlPattern: /^https?:\/\/.*\/api\/appearance/,
    handler: 'StaleWhileRevalidate',           // ⬅ bagus, render dulu dari cache
    options: { cacheName: 'api-appearance', expiration: { maxAgeSeconds: 86400 } }, // 1 hari
  },
  {
    urlPattern: /^https?:\/\/.*\/api\/products/,
    handler: 'StaleWhileRevalidate',           // ⬅ ganti dari NetworkFirst
    options: { cacheName: 'api-products', expiration: { maxEntries: 100, maxAgeSeconds: 1800 } },
  },
  {
    urlPattern: /\/storage\/.*\.(png|jpg|jpeg|webp|mp4)$/,
    handler: 'CacheFirst',                     // ⬅ tambahkan untuk gambar produk
    options: { cacheName: 'storage-assets', expiration: { maxEntries: 200, maxAgeSeconds: 7 * 86400 } },
  }
],
```

`StaleWhileRevalidate` = render dari cache **instant**, fetch fresh data di background. Perfect untuk content yang jarang berubah.

---

### #10 Lucide-React Tree-Shaking
**File:** Semua komponen yang `import { Icon } from 'lucide-react'`

Lucide v0.563 sudah tree-shaking otomatis, tapi pastikan tidak ada `import * as Icons from 'lucide-react'` di mana pun (akan import semua).

Cek dengan: `npm run build && ls -lh dist/assets/` — kalau ada chunk `icons-*.js` > 200KB, ada masalah.

---

## 🟡 BACKEND — Response Time

### #11 Tambah HTTP Cache Headers
**File:** `starinc-api/app/Http/Controllers/Api/SettingsController.php` (getAppearance)

```php
return response()->json($data)
    ->header('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600')
    ->header('ETag', md5(json_encode($data)));
```

Browser cache 5 menit; service worker bisa serve sambil background-refresh sampai 1 jam.

---

### #12 Endpoint `/api/products` Tanpa Query Cache
**File:** `starinc-api/app/Http/Controllers/Api/ProductController.php`

Tambah Redis/file cache untuk query list yang sama:
```php
$cacheKey = 'products:list:' . md5(json_encode($request->all()));
$products = Cache::remember($cacheKey, 300, function () use ($request) {
    return Product::with('variants')->where(...)->paginate(...);
});
```

Invalidate dengan tag saat admin save product.

---

### #13 Cek Slow Query di Local
Aktifkan Laravel query log dan ukur:
```bash
php artisan tinker
DB::enableQueryLog();
// trigger /api/appearance via curl
dd(DB::getQueryLog());
```

Kalau ada query > 50ms saat startup, tambah index (lihat OPTIMIZATION.md poin #5).

---

## 🟢 NICE TO HAVE

### #14 Preload Critical API Call di HTML
Browser bisa start fetch sebelum JS execute:

```html
<link rel="preload" as="fetch" href="http://127.0.0.1:8000/api/appearance" crossorigin>
```

Saat React mount + AppearanceContext fetch → cache hit dari HTTP cache.

---

### #15 Image `<img>` Pakai `decoding="async"` + Ukuran Eksplisit
Di [src/pages/Home.jsx:29-33](src/pages/Home.jsx#L29-L33):

```jsx
<img
    src={imageUrl || '/logo.png'} alt={title}
    width="400" height="400"           // ⬅ wajib, cegah layout shift
    loading="lazy"
    decoding="async"                    // ⬅ tambahkan
    onError={e => { e.target.src = '/logo.png'; }}
/>
```

---

### #16 Convert Logo & Hero Image ke WebP/AVIF
`/logo.png` kemungkinan PNG. Convert ke WebP:
```bash
cwebp -q 85 public/logo.png -o public/logo.webp
```

Lalu pakai `<picture>` dengan fallback.

---

### #17 Reduce Total Round Trip di Home Mount
**File:** [src/pages/Home.jsx:60-72](src/pages/Home.jsx#L60-L72)

3 API call serial promise = 3 round trip. Buat 1 endpoint composite di backend:

```php
// GET /api/home
return [
    'products' => Product::limit(9)->get(),
    'promo'    => Product::where('is_promo', true)->limit(20)->get(),
    'testimonials' => Testimonial::active()->get(),
];
```

Frontend cukup 1 fetch.

---

## URUTAN PENGERJAAN (DAMPAK TERTINGGI DULU)

```
HARI INI (15 menit, dampak besar):
  1. [#1]  Hapus {!loading && children} di AuthContext
  2. [#2]  Ganti preload="auto" → "metadata" di hero video
  3. [#4]  Inline skeleton di index.html
  4. [#5]  Preconnect ke API backend di index.html

HARI INI (30 menit):
  5. [#3]  Reduce font weights & non-blocking load
  6. [#8]  Cache TTL appearance: 5 menit → 1 jam
  7. [#9]  PWA cache: StaleWhileRevalidate untuk products

MINGGU INI:
  8. [#6]  vite-plugin-compression + manualChunks lebih granular
  9. [#11] HTTP Cache-Control headers di backend
  10. [#12] Redis/file cache untuk /api/products
  11. [#2-lanjut] Host video sendiri, bukan dari Pixabay

NICE TO HAVE:
  12. [#14] Preload fetch di HTML
  13. [#15-16] Image optimization (width/height/WebP)
  14. [#17] Composite endpoint /api/home
```

---

## TARGET METRIC

Setelah fix #1-#5 saja, di koneksi 4G normal:
- **First Contentful Paint:** ~3000ms → ~400ms
- **Largest Contentful Paint:** ~8000ms → ~1500ms
- **Time to Interactive:** ~12000ms → ~2000ms
- **Blank screen risk:** ✅ Tidak ada (skeleton selalu muncul)

Cek hasil: Chrome DevTools → Lighthouse → Mobile + Slow 4G throttling.
