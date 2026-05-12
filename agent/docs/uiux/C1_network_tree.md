# C1 — Review Visualisasi Network Tree

> Tanggal: 2026-04-16
> Status: DONE

---

## Evaluasi `NetworkTree.jsx` Saat Ini

### Yang Sudah Bagus

- Komponen recursive `NetworkNode` sudah berjalan (expand/collapse per node)
- Root node sudah di-highlight berbeda (border-primary, bg-primary/5)
- Node card informatif: nama, email, tier badge, level badge
- `overflow-x-auto` sudah ada — scroll horizontal pada tree lebar

### Gap yang Ditemukan

1. **Collapse/Expand hanya per-node individual** — tidak ada "Expand All" / "Collapse All"
2. **Tidak ada indikasi depth yang jelas** — sulit tahu sedang di level berapa
3. **Tree vertikal ke bawah** — untuk 7 level, tree bisa sangat panjang ke bawah secara vertikal, lebih baik pertimbangkan tree horizontal (ke kanan)
4. **Node card lebar 64-80px** — di mobile (375px), 1 node sudah memenuhi layar, scroll horizontal tidak ideal
5. **Tidak ada filter/zoom level** — user dengan 100+ downline tidak bisa membatasi tampilan
6. **Connector lines dengan CSS absolute positioning** — rentan layout bug di berbagai layar

---

## Rekomendasi Redesign

### Opsi 1: Tree Vertikal dengan Depth Limiter (Direkomendasikan untuk MVP)

**Pertahankan layout vertikal** tapi tambahkan:

1. **Depth limiter toggle** — tampilkan hanya N level (default: 3 level, user bisa expand lebih)
2. **"Expand All / Collapse All" button** di header section
3. **Breadcrumb path** saat user mengklik node (untuk navigasi masuk ke subtree)
4. **Compact mode** di mobile — node card lebih kecil, hanya nama + badge

### Opsi 2: Tree Horizontal (Lebih Scalable)

```
[Root] → [L1-A] → [L2-A1]
               → [L2-A2]
       → [L1-B] → [L2-B1]
```

- Cocok untuk tree dengan banyak level
- Tidak direkomendasikan jika banyak siblings di level yang sama

---

## Desain yang Direkomendasikan

### Header Section

```
┌─────────────────────────────────────────────────────────────┐
│  Jaringan Downline Anda        [Expand All] [Collapse All]  │
│  Total: 24 member | Level 1: 3 | Level 2: 8 | Level 3+: 13 │
└─────────────────────────────────────────────────────────────┘
```

### Depth Limiter

```
Tampilkan hingga level: [1] [2] [3] [4] [5] [6] [7]
                                  ↑
                            tab aktif dengan accent
```

Implementasi: prop `maxDepth` yang di-pass ke NetworkNode untuk menghentikan render di depth tertentu.

### Node Card (Desktop)

```
┌─────────────────────────────────────┐
│  [Avatar initial]  Nama Lengkap     │
│                    email@...        │
│                    [GOLD] [Lvl 2]   │
│                    Rp 2.3jt spent   │  ← tambahkan jika data tersedia
└─────────────────────────────────────┘
Width: w-72 (desktop)
```

### Node Card (Mobile Compact)

```
┌──────────────────────────────────┐
│  [Avatar]  Nama    [GOLD][Lvl 2] │
└──────────────────────────────────┘
Width: w-full max-w-[240px]
Font: text-xs untuk meta info
```

---

## Connector Lines

Ganti implementasi `absolute` positioning dengan pendekatan yang lebih reliable:

```
Gunakan CSS border-left pada parent container (sudah ada tapi perlu penyesuaian)
Atau pertimbangkan library react-d3-tree jika tree menjadi kompleks
```

Untuk MVP tanpa library eksternal:
- Hapus absolute connector lines yang saat ini rentan bug
- Gunakan left border + pseudo-element yang lebih prediktable

---

## Interaksi Mobile

- Pada mobile (<768px): tampilkan tree dalam list style flat (tidak hirarki visual)
- Indikasi level dengan indent + level badge
- Setiap item bisa di-tap untuk melihat detail downline di halaman/modal baru

```
Mobile flat list:
[Anda (Root)]
  ↳ [Nama A — Lvl 1]
      ↳ [Nama A1 — Lvl 2]
      ↳ [Nama A2 — Lvl 2]
  ↳ [Nama B — Lvl 1]
```

---

## Empty State

```
[Icon: Network atau Users besar — gray-300]
[Heading: "Jaringan Anda masih kosong"]
[Body: "Bagikan kode referral Anda untuk mulai membangun jaringan downline"]
[Button: "Salin Kode Referral" → action copy]
```

---

## Prioritas Implementasi

1. Tambahkan `maxDepth` prop + UI toggle depth limiter — HIGH IMPACT
2. Tambahkan Expand All / Collapse All button — HIGH IMPACT
3. Perbaiki connector lines agar tidak break di mobile — MEDIUM
4. Compact mode mobile — MEDIUM
5. Library react-d3-tree (jika tree 100+ node perlu zoom/pan) — LOW untuk MVP
