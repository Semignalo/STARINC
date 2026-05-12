# A1 — Audit Design Token Tailwind

> Tanggal: 2026-04-16
> Status: DONE

---

## Hasil Audit `src/index.css` (Tailwind v4 @theme)

### Typography

| Token | Nilai | Catatan |
|-------|-------|---------|
| `--font-sans` | `'Outfit', sans-serif` | Body text, UI label, navigation |
| `--font-serif` | `'Playfair Display', serif` | Heading utama, nama produk, section title |

**Penggunaan saat ini:**
- Semua `h1–h6` dan class `.font-serif` sudah menggunakan serif secara konsisten via `@layer base`
- Body text menggunakan sans secara default via `html { font-family }` — konsisten

**Rekomendasi:**
- Tetap pertahankan hierarki ini. Tidak perlu font tambahan.
- Pastikan font diload dari Google Fonts dengan `display=swap` untuk performa.

---

### Color Palette

| Token | Hex | Penggunaan |
|-------|-----|------------|
| `--color-primary` | `#1A1A1A` | Teks utama, CTA primary, background gelap |
| `--color-primary-foreground` | `#FFFFFF` | Teks di atas primary |
| `--color-accent` | `#C5A059` | Soft Gold — highlight, badge, accent border |
| `--color-accent-light` | `#E5D1A3` | Background accent ringan, hover state |
| `--color-accent-dark` | `#997B3D` | Pressed/active accent |
| `--color-accent-foreground` | `#FFFFFF` | Teks di atas accent |
| `--color-sale` | `#E53E3E` | Badge diskon, harga coret |
| `--color-muted` | `#F9FAFB` | Background section alternatif |
| `--color-muted-foreground` | `#6B7280` | Teks sekunder, placeholder, helper text |

**Inkonsistensi yang Ditemukan:**

1. **Tombol Checkout & CTA utama** menggunakan `bg-[#047857]` (hijau) hardcoded, bukan brand color.
   - Ditemukan di: `Checkout.jsx` line 197, `CartDrawer.jsx` line 181
   - Rekomendasi: Ganti dengan `bg-[var(--color-primary)]` atau buat token `--color-cta` jika hijau memang disengaja sebagai secondary CTA.

2. **Admin sidebar** menggunakan `bg-[#111827]` dan `bg-[#1F2937]` hardcoded.
   - Ini dapat diterima untuk admin panel (dark theme terpisah), tapi sebaiknya dijadikan token CSS atau class Tailwind named.

3. **JoinStarcenter.jsx** menggunakan `bg-blue-600`, `from-blue-400 to-emerald-400` — warna di luar brand palette.
   - Halaman ini memang bertujuan berbeda (marketing page), tapi perlu pertimbangan: apakah accent gold bisa digunakan sebagai pengganti?

---

### Spacing & Border Radius

Tailwind v4 default spacing scale sudah cukup. Tidak ada custom spacing yang perlu ditambahkan.

| Pola | Penggunaan | Konsistensi |
|------|------------|-------------|
| `rounded-sm` | Input, button di public area | Konsisten di Checkout, CartDrawer |
| `rounded-lg` | Card admin, modal | Konsisten di Dashboard, Orders modal |
| `rounded-xl` | Card besar admin, stat card | Konsisten di Dashboard |
| `rounded-full` | Badge, pill label | Konsisten |

**Rekomendasi:**
- Buat kesepakatan: public/storefront pakai `rounded-sm` (editorial feel), admin pakai `rounded-lg`/`rounded-xl` (modern dashboard feel). Ini sudah hampir konsisten, tinggal dijaga.

---

## Rekomendasi Token Tambahan

Tambahkan ke `src/index.css` untuk mengurangi hardcode:

```css
@theme {
  /* Existing tokens ... */

  /* Admin theme tokens */
  --color-admin-bg: #111827;
  --color-admin-sidebar: #1F2937;
  --color-admin-accent: #C5A059; /* sama dengan accent public */

  /* CTA green (saat ini hardcoded) */
  --color-cta: #047857;
  --color-cta-hover: #065F46;

  /* Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-info: #3B82F6;
}
```

---

## Checklist Konsistensi Warna

- [x] Warna brand gold (accent) digunakan konsisten di public area
- [x] Typography hierarchy serif/sans sudah diterapkan
- [ ] Tombol CTA utama masih hardcoded hijau — perlu keputusan: ganti ke primary atau buat token CTA
- [ ] Warna admin sidebar belum dijadikan CSS token
- [ ] Halaman JoinStarcenter menggunakan warna di luar brand palette
