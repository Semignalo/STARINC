# C2 — Desain Halaman Join Starcenter

> Tanggal: 2026-04-16
> Status: DONE

---

## Evaluasi `JoinStarcenter.jsx` Saat Ini

### Yang Sudah Bagus

- Hero section dengan visual yang kuat (dark background, gradient text)
- Benefit cards dengan ikon berwarna
- Commission breakdown card (10%, 5%, 0.5%-2%)
- Form referral code + CTA ke register
- Mobile-responsive layout (flex-col / flex-row)

### Gap yang Ditemukan

1. **Tidak ada perbandingan Regular vs Starcenter** — user tidak tau bedanya sebelum memutuskan
2. **Syarat menjadi Starcenter tidak tertulis** — tidak ada info minimum pembelian, proses upgrade, dll
3. **Warna halaman ini sangat berbeda dari brand** — menggunakan biru & hijau, padahal brand adalah hitam + gold
4. **CTA "Daftar Jadi Mitra" langsung ke register** — user yang sudah login tidak tahu harus ke mana
5. **Commission card tidak menjelaskan konteks** — "10% dari apa? Order siapa?"
6. **Tidak ada social proof** — testimoni, jumlah mitra, dll (nice-to-have)
7. **Tombol biru (`bg-blue-600`)** — tidak konsisten dengan brand

---

## Rekomendasi Redesign

### Prinsip

- Pertahankan dark hero karena kontras dan attention-grabbing
- Ubah accent color utama ke brand gold (`#C5A059`) sebagai pengganti biru
- Tambahkan section perbandingan Regular vs Starcenter
- Perjelas syarat dan proses upgrade

---

## Struktur Halaman Baru

```
1. [HERO SECTION]
   - Headline: tetap kuat
   - Ubah accent dari biru ke gold (#C5A059)
   - CTA: "Mulai Sekarang" (primary gold) + "Pelajari Lebih Lanjut" (ghost)
   - Visual card: commission breakdown (pertahankan)

2. [PERBANDINGAN Regular vs Starcenter]
   - Tabel atau card side-by-side

3. [BENEFIT SECTION]
   - 4 benefit cards (pertahankan, ubah warna ikon ke brand)

4. [PROSES BERGABUNG]
   - Timeline steps: Daftar → Beli Pertama → Upgrade → Aktif

5. [FAQ SINGKAT]
   - 3-4 pertanyaan umum

6. [FORM JOIN / CTA]
   - Input referral code
   - Button ke register
```

---

## Desain Section: Perbandingan Regular vs Starcenter

```
┌─────────────────────┬────────────────────────────────┐
│                     │  REGULAR        │  STARCENTER  │
├─────────────────────┼─────────────────┼──────────────┤
│ Komisi Downline     │  1 Level (5%)   │  7 Level     │
│ Minimum Transaksi   │  Tidak ada      │  Rp 5 Juta   │
│ Risiko Downgrade    │  Ada            │  Tidak ada   │
│ Akses Center Shop   │  Tidak          │  Ya          │
│ Diskon Tier         │  Ada            │  Ada + lebih │
└─────────────────────┴─────────────────┴──────────────┘
```

**Implementasi visual:**

```jsx
// Card comparison
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
  {/* Regular Card */}
  <div className="border border-gray-200 rounded-2xl p-6">
    <h3 className="font-bold text-gray-900 text-xl mb-1">Regular Member</h3>
    <p className="text-gray-500 text-sm mb-4">Untuk belanja kebutuhan pribadi</p>
    <ul className="space-y-2 text-sm">
      <li className="flex items-center gap-2 text-green-600">
        <Check size={16}/> Akses katalog produk
      </li>
      <li className="flex items-center gap-2 text-green-600">
        <Check size={16}/> Diskon tier berjenjang
      </li>
      <li className="flex items-center gap-2 text-green-600">
        <Check size={16}/> Komisi 1 level (5%)
      </li>
      <li className="flex items-center gap-2 text-gray-400">
        <X size={16}/> Komisi 7 level
      </li>
      <li className="flex items-center gap-2 text-gray-400">
        <X size={16}/> Anti-downgrade
      </li>
    </ul>
  </div>

  {/* Starcenter Card */}
  <div className="border-2 border-[var(--color-accent)] rounded-2xl p-6 relative bg-amber-50/30">
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-accent)] text-white text-xs px-3 py-1 rounded-full font-bold uppercase">
      Direkomendasikan
    </div>
    <h3 className="font-bold text-gray-900 text-xl mb-1">Starcenter Partner</h3>
    <p className="text-gray-500 text-sm mb-4">Untuk distributor dan reseller aktif</p>
    <ul className="space-y-2 text-sm">
      {/* All regular benefits */}
      <li className="flex items-center gap-2 text-green-600"><Check size={16}/> Semua benefit Regular</li>
      <li className="flex items-center gap-2 text-green-600"><Check size={16}/> Komisi 7 level (hingga 10%)</li>
      <li className="flex items-center gap-2 text-green-600"><Check size={16}/> Anti-downgrade tier</li>
      <li className="flex items-center gap-2 text-green-600"><Check size={16}/> Akses Center Shop eksklusif</li>
      <li className="flex items-center gap-2 text-amber-600">
        <AlertTriangle size={16}/> Min. transaksi Rp 5 juta
      </li>
    </ul>
  </div>
</div>
```

---

## Desain Section: Proses Bergabung

```
[Step 1]           [Step 2]           [Step 3]           [Step 4]
Daftar Akun    →  Aktivasi Awal   →  Upgrade Role   →  Jalankan Bisnis
                  (min Rp 5jt)       (oleh Admin)
```

Visual: horizontal timeline dengan lingkaran bernomor + label + deskripsi singkat.

```jsx
<div className="flex items-start gap-0 overflow-x-auto">
  {steps.map((step, i) => (
    <div key={i} className="flex-1 text-center relative min-w-[140px]">
      <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] text-white font-bold flex items-center justify-center mx-auto mb-3">
        {i + 1}
      </div>
      <h4 className="font-bold text-sm text-gray-900 mb-1">{step.title}</h4>
      <p className="text-xs text-gray-500">{step.desc}</p>
      {i < steps.length - 1 && (
        <div className="absolute top-5 left-[60%] w-[80%] h-0.5 bg-gray-200" />
      )}
    </div>
  ))}
</div>
```

---

## Perubahan Warna dari Biru ke Brand

| Elemen Saat Ini | Rekomendasi |
|-----------------|-------------|
| `bg-blue-600` (tombol CTA) | `bg-[var(--color-accent)]` atau `bg-[var(--color-primary)]` |
| `text-blue-300` (badge "Peluang Kemitraan") | `text-[var(--color-accent-light)]` |
| `from-blue-400 to-emerald-400` (gradient headline) | `from-[var(--color-accent)] to-white/80` |
| `bg-blue-900/40` (backdrop) | `bg-amber-900/20` atau tetap gelap tanpa warna |
| `focus:ring-blue-500` (input) | `focus:ring-[var(--color-accent)]` |

---

## Catatan untuk Frontend

- Halaman ini tidak membutuhkan Auth untuk dilihat (public)
- Jika user sudah login sebagai starcenter, tampilkan banner: "Anda sudah menjadi Starcenter Partner" + link ke profile network
- Jika user sudah login sebagai regular, tampilkan CTA "Upgrade ke Starcenter" yang berbeda dari CTA "Daftar Baru"
