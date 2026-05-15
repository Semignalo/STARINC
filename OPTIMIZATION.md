# OPTIMIZATION RECOMMENDATIONS — STARINC

> Dibuat: 2026-05-13 | Scope: Frontend + Backend + Security + Database

---

## RINGKASAN TEMUAN

| Prioritas | Jumlah |
|-----------|--------|
| 🔴 Critical | 2 |
| 🟠 High | 4 |
| 🟡 Medium | 6 |
| 🟢 Low | 3 |

---

## 🔴 CRITICAL

### 1. Authorization Gap di `servePaymentProof`
**File:** `starinc-api/app/Http/Controllers/Api/OrderController.php` ~line 183

Endpoint `/orders/payment-proof/{id}` tidak ada cek otorisasi di controller — hanya mengandalkan middleware `EnsureIsAdmin` di route. Kalau middleware diubah/dihapus, siapa pun dengan ID proof bisa download file bukti pembayaran orang lain.

```php
// Tambahkan di awal method:
if ($proof->order->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
    abort(403);
}
```

---

### 2. DoS via Search Input Tak Terbatas
**File:** `starinc-api/app/Http/Controllers/Api/ProductController.php` ~line 29

Query `LIKE '%...%'` tanpa batasan panjang input. String panjang bisa trigger slow query.

```php
// Tambahkan validasi:
$request->validate([
    'search'   => 'nullable|string|max:100',
    'category' => 'nullable|string|max:100',
]);
```

---

## 🟠 HIGH

### 3. N+1 Query di `calculateTotalWeight`
**File:** `starinc-api/app/Services/OrderService.php` ~line 156

Loop per item melakukan `Product::find()` — 10 item = 10 query terpisah.

```php
// Ganti:
$products = Product::whereIn('id', array_column($items, 'product_id'))
    ->pluck('weight', 'id');
foreach ($items as $item) {
    $weight = $products[$item['product_id']] ?? 500;
}
```

---

### 4. Load Semua User untuk Count di `networkTree`
**File:** `starinc-api/app/Http/Controllers/Api/AdminController.php` ~line 103

Semua user di-load ke memory PHP hanya untuk dihitung per role. Dengan 10.000+ user = 12MB+ wasted.

```php
// Ganti:
$counts = [
    'total'      => User::count(),
    'admin'      => User::where('role', 'admin')->count(),
    'starcenter' => User::where('role', 'starcenter')->count(),
    'regular'    => User::where('role', 'regular')->count(),
];
```

---

### 5. Missing Database Indexes
**Buat migration baru** `add_missing_indexes`:

```php
// orders: sering di-ORDER BY
Schema::table('orders', function (Blueprint $table) {
    $table->index('created_at');
    $table->index(['user_id', 'created_at']); // untuk "my orders"
});

// commissions: sering di-JOIN/WHERE
Schema::table('commissions', function (Blueprint $table) {
    $table->index('order_id');
    $table->index(['order_id', 'user_id', 'level']); // cek duplikat
});

// payment_proofs
Schema::table('payment_proofs', function (Blueprint $table) {
    $table->index('order_id');
});

// users
Schema::table('users', function (Blueprint $table) {
    $table->index(['user_id', 'status']); // CommissionService query
});
```

---

### 6. Unbounded Export Query
**File:** `starinc-api/app/Http/Controllers/Api/AdminController.php` ~line 431 & 466

`Order::get()` dan `Commission::get()` tanpa LIMIT — kalau data ratusan ribu, bisa timeout/OOM.

```php
// Gunakan chunking:
$query->chunk(500, function ($orders) use ($file) {
    foreach ($orders as $o) {
        fputcsv($file, [...]);
    }
});
```

---

## 🟡 MEDIUM

### 7. Filter Logic di Catalog Tanpa `useMemo`
**File:** `src/pages/Catalog.jsx` ~line 44-81

`let result = [...products]` + filter logic dieksekusi ulang setiap re-render, bukan hanya saat filter berubah. ProductGrid bisa re-render 5-8x per interaksi filter.

```jsx
const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery) result = result.filter(...);
    // ... filter logic ...
    return result;
}, [products, searchQuery, priceRange, filters, showOutOfStock]);
```

---

### 8. `handleVisibilityChange` di AuthContext Bisa Spam API
**File:** `src/contexts/AuthContext.jsx` ~line 84-102

Tab switch bolak-balik bisa trigger banyak profile fetch dalam hitungan detik.

```jsx
// Tambahkan debounce:
const debouncedRefresh = useCallback(
    debounce(() => { if (token) fetchProfile(); }, 2000),
    [token]
);
document.addEventListener('visibilitychange', debouncedRefresh);
```

---

### 9. CartContext: Interdependent `useCallback` — Risiko Stale Closure
**File:** `src/contexts/CartContext.jsx` ~line 53-106

`updateQuantity` bergantung pada `removeFromCart`, yang bergantung pada state `cart`. Rapid cart updates bisa pakai stale value. Migrasi ke `useReducer` mengeliminasi masalah ini:

```jsx
const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD': ...
        case 'REMOVE': ...
        case 'UPDATE_QTY': ...
        case 'CLEAR': return [];
    }
};
const [cart, dispatch] = useReducer(cartReducer, []);
```

---

### 10. NIK Validation Menerima Non-Numerik
**File:** `starinc-api/app/Http/Controllers/Api/StarCenterApplicationController.php` ~line 43

```php
// Sebelum:
'nik' => 'nullable|string|size:16',

// Sesudah:
'nik' => 'nullable|digits:16',
```

---

### 11. Tidak Ada API Caching Layer (Frontend)
**File:** `src/api/client.js`

Tidak ada request deduplication atau caching — kalau komponen berbeda mount bersamaan dan memanggil endpoint yang sama, bisa trigger multiple request identik.

**Opsi ringan:** Tambahkan simple in-memory cache di `client.js`:
```js
const cache = new Map();
export const cachedGet = (url, ttl = 60000) => {
    if (cache.has(url) && Date.now() - cache.get(url).ts < ttl) {
        return Promise.resolve(cache.get(url).data);
    }
    return apiClient.get(url).then(res => {
        cache.set(url, { data: res, ts: Date.now() });
        return res;
    });
};
```

**Opsi proper:** Install `@tanstack/react-query` (deduplikasi + stale-while-revalidate otomatis).

---

### 12. `tesseract.js` Tidak Dipakai
**File:** `package.json`

Library OCR `tesseract.js` ada di dependencies tapi tidak dipakai di mana pun. Tambah ~2MB ke bundle.

```bash
npm uninstall tesseract.js
```

---

## 🟢 LOW

### 13. `with(['user'])` Tak Dipakai di exportOrders
**File:** `starinc-api/app/Http/Controllers/Api/AdminController.php` ~line 431

```php
// Hapus with(['user']) karena user tidak diakses di loop CSV:
$orders = $query->orderBy('created_at', 'desc')->get();
```

---

### 14. LCP Delay: Hero Video Tanpa Poster
**File:** `src/pages/Home.jsx` ~line 84

`poster={settings?.heroVideoPoster || undefined}` — kalau admin tidak set poster, video mulai buffering tanpa placeholder. LCP score buruk.

Wajibkan poster image di admin settings, atau generate thumbnail server-side saat video di-upload.

---

### 15. PWA Cache TTL Produk Terlalu Pendek
**File:** `vite.config.js` ~line 33-44

Cache TTL untuk `/api/products` hanya 300s (5 menit). Produk jarang berubah, bisa naik ke 1800s (30 menit) untuk UX yang lebih cepat. Invalidate manual di admin saat produk diubah.

---

## URUTAN PENGERJAAN YANG DISARANKAN

```
Sprint ini:
  1. [Critical] Authorization check servePaymentProof
  2. [Critical] Search input validation
  3. [High]     Missing database indexes (buat migration)
  4. [High]     Fix N+1 calculateTotalWeight
  5. [Medium]   NIK validation fix (1 baris)
  6. [Low]      Hapus tesseract.js

Sprint depan:
  7. [High]     Fix networkTree role counting
  8. [High]     Chunking untuk export
  9. [Medium]   useMemo di Catalog filter
  10. [Medium]  CartContext → useReducer

Nice to have:
  11. [Medium]  Debounce handleVisibilityChange
  12. [Medium]  API caching layer (react-query)
  13. [Low]     Hero video poster requirement
  14. [Low]     PWA cache TTL adjustment
```
