# Koordinasi Antar Tim

> File ini digunakan untuk komunikasi antar tim (Backend, Frontend, QA, dsb.)
> Format: tanggal · dari tim · ke tim · pesan

---

## 2026-04-16 · Backend → Frontend

### [DONE] Field `stock` & `is_out_of_stock` sudah tersedia di response API produk

Merespons catatan: _"Field stock di ProductCard menunggu backend menambahkannya ke response API"_

**Status: Sudah live — tidak perlu perubahan di frontend.**

#### Yang sudah dikerjakan backend:

1. **Kolom `stock` sudah ada di DB** — migration `2026_04_16_000002_add_stock_to_products_table` sudah jalan.  
   Field `stock` (integer, nullable) ada di tabel `products` dan `product_variants`.

2. **Field `stock` sudah muncul di semua response produk** — endpoint berikut sudah mengembalikan field `stock`:
   - `GET /api/products` (list)
   - `GET /api/products/{id}` (detail)
   - `POST /api/admin/products` (create — response)
   - `PUT /api/admin/products/{id}` (update — response)

3. **Field baru `is_out_of_stock` (boolean) ditambahkan ke response** — computed accessor di `Product` model.  
   Frontend bisa langsung pakai ini tanpa perlu hitung manual.  
   Logic:
   - Produk **tanpa variant**: `true` jika `stock === 0`, `false` jika `stock === null` (unlimited) atau `stock > 0`
   - Produk **dengan variant**: `true` hanya jika **semua** variant habis. Variant dengan `stock === null` mengikuti stok produk induk.

4. **Admin sekarang bisa set stok via API** — `stock` ditambahkan ke validation rules di `POST/PUT /api/admin/products`:
   ```json
   {
     "stock": 50,
     "variants": [
       { "name": "Ukuran S", "price": 150000, "stock": 10 },
       { "name": "Ukuran M", "price": 150000, "stock": 0 }
     ]
   }
   ```
   Kirim `"stock": null` untuk produk unlimited (tidak tracking stok).

#### Rekomendasi update kecil di `ProductCard.jsx`:

Saat ini `ProductCard` menggunakan:
```js
const isOutOfStock = stock !== undefined && stock !== null && stock <= 0;
```

Bisa disederhanakan dengan field baru dari backend:
```js
const isOutOfStock = is_out_of_stock === true;
```

Ini akan otomatis handle produk dengan variant (misal: semua variant habis → card tampil "Habis").  
**Tidak wajib** — cara lama masih bekerja untuk produk tanpa variant.

#### File yang diubah backend:
- `starinc-api/app/Models/Product.php` — tambah accessor `is_out_of_stock`
- `starinc-api/app/Http/Controllers/Api/ProductController.php` — tambah `stock` & `variants.*.stock` ke validation `store()` dan `update()`
