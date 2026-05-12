# Akun Dummy SDP-V2

Database dikonfigurasi dengan akun dummy berikut. Semua data diverifikasi langsung dari database.

---

## Admin Account

| ID | Email | Password | Role | Tier |
|----|-------|----------|------|------|
| 1 | admin@starinc.id | **password** | admin | Diamond |

> ⚠️ Password admin adalah `password`, bukan `password123`

---

## Starcenter Accounts

| ID | Email | Password | Role | Referral Code | Tier | Region |
|----|-------|----------|------|----------------|------|--------|
| 2 | sc.jawatimur@starinc.com | password123 | starcenter | SCJT001 | Diamond | Jawa Timur |
| 3 | sc.jawatengah@starinc.com | password123 | starcenter | SCJG001 | Diamond | Jawa Tengah |
| 4 | sc.jawabarat@starinc.com | password123 | starcenter | SCJB001 | Diamond | Jawa Barat |

---

## Regular / Downline Accounts

### Downlines SC Jawa Timur (referrer: sc.jawatimur@starinc.com)

| ID | Email | Password | Role | Referral Code | Tier |
|----|-------|----------|------|----------------|------|
| 5 | downline.2.1@starinc.com | password123 | regular | 4VSTPKSO | Bronze |
| 6 | downline.2.2@starinc.com | password123 | regular | MEBHM7UD | Gold |
| 7 | downline.2.3@starinc.com | password123 | regular | WOC34U2U | Gold |

### Downlines SC Jawa Tengah (referrer: sc.jawatengah@starinc.com)

| ID | Email | Password | Role | Referral Code | Tier |
|----|-------|----------|------|----------------|------|
| 8 | downline.3.1@starinc.com | password123 | regular | SNSY421V | Gold |
| 9 | downline.3.2@starinc.com | password123 | regular | REZUUGYV | Silver |
| 10 | downline.3.3@starinc.com | password123 | regular | 3IXJFLXG | Silver |

### Downlines SC Jawa Barat (referrer: sc.jawabarat@starinc.com)

| ID | Email | Password | Role | Referral Code | Tier |
|----|-------|----------|------|----------------|------|
| 11 | downline.4.1@starinc.com | password123 | regular | EBTPUUOP | Gold |
| 12 | downline.4.2@starinc.com | password123 | regular | GFPYPZIX | Silver |
| 13 | downline.4.3@starinc.com | password123 | regular | 50IKOWRK | Silver |

---

## Ringkasan Password

| Akun | Password |
|------|----------|
| Admin (admin@starinc.id) | `password` |
| Semua akun lainnya (SC + downline) | `password123` |

---

## Tier System

| Tier ID | Nama |
|---------|------|
| 1 | Bronze |
| 2 | Silver |
| 3 | Gold |
| 4 | Platinum |
| 5 | Diamond |

---

## Data Transaksi

Setiap akun downline memiliki transaksi dengan status berbeda (±120 total):

| Status | Distribusi |
|--------|-----------|
| completed | ~70% |
| processing / shipped | ~15% |
| pending_payment | ~10% |
| rejected | ~5% |

---

## Akses

| URL | Keterangan |
|-----|-----------|
| `http://localhost:5173` | Frontend (Vite dev server) |
| `http://localhost:5173/admin` | Admin panel |
| `http://localhost:8000/api` | Backend API |

Login admin panel: `admin@starinc.id` / `password`

---

## Playwright Profiles (Pre-authenticated)

Tersedia di `.playwright/profiles/`:

| File | Email | Role |
|------|-------|------|
| admin.json | admin@starinc.id | admin |
| starcenter.json | sc.jawatimur@starinc.com | starcenter |
| regular.json | downline.2.1@starinc.com | regular |

---

## Reset Database

```bash
cd starinc-api
php artisan migrate:fresh --seed
```

> Catatan: Setelah reset, Playwright profiles perlu di-regenerate karena token Sanctum akan berubah.
