# E1 & E2 — Mobile-First Audit + Touch Target

> Tanggal: 2026-04-16
> Status: DONE

---

## Metodologi Audit

Breakpoints yang diperiksa: 375px (mobile), 768px (tablet), 1280px (desktop)
Sumber: Analisis kode komponen, bukan test device langsung.

---

## Audit Per Halaman/Komponen

### 1. Navbar (`components/Navbar.jsx`)

**Belum dibaca secara lengkap, berdasarkan struktur project:**
- Pastikan hamburger menu ada di mobile
- Touch target semua nav item minimal 44x44px

### 2. CartDrawer (`components/CartDrawer.jsx`)

| Elemen | Mobile 375px | Status |
|--------|-------------|--------|
| Drawer width | `w-full sm:w-[400px]` | PASS — full width di mobile |
| Close button | `p-2` = ~32px | WARNING — tambahkan `p-3` untuk 44px |
| +/- quantity buttons | `px-2 py-1` = ~28px height | FAIL — terlalu kecil untuk touch |
| Remove button | `p-1` = ~24px | FAIL — terlalu kecil untuk touch |
| Checkout button | `py-3.5` = ~52px | PASS |
| Free shipping progress | Ada | PASS |

**Perbaikan:**
```jsx
// Quantity buttons — tambahkan min size
<button className="p-2.5 hover:bg-gray-50 text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center">
  <Minus size={14} />
</button>

// Remove button — tambahkan padding
<button className="p-2 text-gray-400 hover:text-red-500 min-w-[44px] min-h-[44px] flex items-center justify-center">
  <Trash2 size={16} />
</button>
```

### 3. Checkout (`pages/Checkout.jsx`)

| Elemen | Mobile 375px | Status |
|--------|-------------|--------|
| Layout | `grid-cols-1 md:grid-cols-2` | PASS — stack vertikal di mobile |
| Input fields | `py-2` + border = ~40px | WARNING — tambahkan `py-3` untuk 44px+ |
| Place Order button | `py-4` = ~56px | PASS |
| Padding halaman | `px-4 py-8` | PASS |

**Perbaikan input:**
```jsx
className="w-full px-4 py-3 border border-gray-200 rounded-sm ..."
// py-3 = ~48px total dengan border, memenuhi 44px touch target
```

### 4. Admin Layout (`layouts/AdminLayout.jsx`)

| Elemen | Mobile 375px | Status |
|--------|-------------|--------|
| Sidebar `w-64` | Fixed 256px — mengambil seluruh lebar | CRITICAL FAIL |
| Main content `ml-64` | Terdorong ke kanan, tidak visible | CRITICAL FAIL |
| Nav links di sidebar | `py-3` = ~44px | PASS untuk desktop |

**Admin panel belum memiliki layout mobile sama sekali.** Ini adalah masalah serius.

**Solusi untuk Admin Mobile:**
```jsx
// Tambahkan state mobile menu
const [sidebarOpen, setSidebarOpen] = useState(false);

// Sidebar: responsive
<aside className={cn(
  "fixed inset-y-0 left-0 z-50 w-64 bg-[#111827] text-white flex flex-col transition-transform duration-300",
  sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
)}>

// Overlay backdrop di mobile saat sidebar open
{sidebarOpen && (
  <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)}/>
)}

// Hamburger di top bar mobile
<div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#111827] p-4 flex items-center gap-3">
  <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white p-2">
    <Menu size={24}/>
  </button>
  <span className="text-white font-bold">SDP Admin</span>
</div>

// Main content
<main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen mt-16 md:mt-0">
```

### 5. JoinStarcenter (`pages/JoinStarcenter.jsx`)

| Elemen | Mobile 375px | Status |
|--------|-------------|--------|
| Hero section | `px-4 pt-32 pb-24` | PASS tapi padding besar |
| Headline font | `text-4xl md:text-6xl` | PASS |
| CTA buttons | `py-4` = ~56px | PASS |
| Benefit cards | `grid-cols-1` di mobile | PASS |
| Commission card | `hidden md:block` | Disembunyikan di mobile — WARNING |
| Form referral | `flex-col sm:flex-row` | PASS |
| Input referral | `py-4` = ~56px | PASS |

**Concern:** Commission card disembunyikan di mobile. Pertimbangkan tampilkan dalam format compact (list) di mobile karena ini informasi penting.

### 6. Dashboard Admin (`pages/admin/Dashboard.jsx`)

| Elemen | Mobile 375px | Status |
|--------|-------------|--------|
| Stats grid | `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` | PASS — stack di mobile |
| Charts | `ResponsiveContainer` | PASS — responsive |
| Chart min-h | `min-h-[300px]` | WARNING — bisa terlalu tinggi di mobile, pertimbangkan `min-h-[200px] md:min-h-[300px]` |
| Recent orders table | Tidak ada `overflow-x-auto` di wrapper | FAIL — bisa overflow di mobile |

**Perbaikan Orders table mobile:**
```jsx
<div className="overflow-x-auto">  {/* sudah ada di Orders.jsx tapi belum di Dashboard */}
  <table className="w-full min-w-[500px]">  {/* min-width untuk prevent collapse */}
```

---

## Summary Gap Kritis

| # | Gap | Halaman | Severity |
|---|-----|---------|----------|
| 1 | Admin layout tidak ada mobile responsiveness | AdminLayout.jsx | CRITICAL |
| 2 | Quantity +/- buttons di CartDrawer terlalu kecil | CartDrawer.jsx | HIGH |
| 3 | Remove item button di CartDrawer terlalu kecil | CartDrawer.jsx | HIGH |
| 4 | Input form checkout tidak memenuhi 44px | Checkout.jsx | MEDIUM |
| 5 | Dashboard table tidak ada overflow-x-auto | Dashboard.jsx | MEDIUM |
| 6 | Commission preview card disembunyikan di mobile | JoinStarcenter.jsx | LOW |

---

## Standar Touch Target untuk Frontend

Setiap elemen interaktif WAJIB memenuhi:

```
Minimum: 44px x 44px
```

Cara memenuhi di Tailwind:
```
Tombol kecil: tambahkan min-w-[44px] min-h-[44px] + flex items-center justify-center
Atau: p-3 (12px padding) + content icon = cukup untuk 44px total
Atau: py-3 untuk tombol teks
```

---

## Checklist Mobile Audit (Untuk QA)

- [ ] Admin layout bisa digunakan di 375px
- [ ] CartDrawer: semua tombol min 44x44px
- [ ] Checkout: semua input min height 44px
- [ ] Semua form input di mobile: cukup besar untuk jari
- [ ] Tidak ada horizontal scroll yang tidak disengaja di halaman manapun
- [ ] Table data di mobile: ada overflow-x-auto
- [ ] Modal: max-h-[90vh] + overflow-y-auto agar tidak overflow layar kecil
- [ ] Bottom action button mobile: tidak tertutup keyboard virtual
