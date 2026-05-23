# Akun Dummy STARINC

Database STARINC dikonfigurasi dengan akun dummy berikut. Semua data diverifikasi langsung dari database `starinc_db`.

> ⚠️ Repo ini adalah **STARINC** (member-only platform). Sejak split dari SDP-V2, role `regular` sudah dihapus — semua user non-admin sekarang berperan `starcenter`. Hanya `starcenter` + `admin` yang bisa checkout.

---

## Admin Account

| ID | Email | Password | Role | Tier |
|----|-------|----------|------|------|
| 1 | `admin@starinc.id` | **`password`** | admin | Diamond |

> ⚠️ Password admin adalah `password`, bukan `password123`

---

## Starcenter Regional (Top-Level)

| ID | Email | Password | Role | Referral Code | Region |
|----|-------|----------|------|----------------|--------|
| 2 | `sc.jawatimur@starinc.com` | `password123` | starcenter | `SCJT0001` | Jawa Timur |
| 3 | `sc.jawatengah@starinc.com` | `password123` | starcenter | `SCJG0001` | Jawa Tengah |
| 4 | `sc.jawabarat@starinc.com` | `password123` | starcenter | `SCJB0001` | Jawa Barat |

---

## Starcenter Downline

### Downline SC Jawa Timur (referrer: `sc.jawatimur@starinc.com`)

| ID | Email | Password | Role | Referral Code |
|----|-------|----------|------|----------------|
| 5 | `sc.downline.2.1@starinc.com` | `password123` | starcenter | `WEVEMBET` |
| 6 | `sc.downline.2.2@starinc.com` | `password123` | starcenter | `RN7BHQQF` |
| 7 | `sc.downline.2.3@starinc.com` | `password123` | starcenter | `I1QOWWHQ` |

### Downline SC Jawa Tengah (referrer: `sc.jawatengah@starinc.com`)

| ID | Email | Password | Role | Referral Code |
|----|-------|----------|------|----------------|
| 8 | `sc.downline.3.1@starinc.com` | `password123` | starcenter | `2YIPLYF3` |
| 9 | `sc.downline.3.2@starinc.com` | `password123` | starcenter | `LCW7L4SW` |
| 10 | `sc.downline.3.3@starinc.com` | `password123` | starcenter | `YZQPTRAA` |

### Downline SC Jawa Barat (referrer: `sc.jawabarat@starinc.com`)

| ID | Email | Password | Role | Referral Code |
|----|-------|----------|------|----------------|
| 11 | `sc.downline.4.1@starinc.com` | `password123` | starcenter | `QQWIGICG` |
| 12 | `sc.downline.4.2@starinc.com` | `password123` | starcenter | `QWYSILLP` |
| 13 | `sc.downline.4.3@starinc.com` | `password123` | starcenter | `QC4U5WQD` |

---

## Ringkasan Password

| Akun | Password |
|------|----------|
| Admin (`admin@starinc.id`) | `password` |
| Semua starcenter (regional + downline) | `password123` |

---

## Tier System

| Tier ID | Nama | Min. Cumulative Spend |
|---------|------|------------------------|
| 1 | Bronze | 0 |
| 2 | Silver | (lihat tabel tiers di admin) |
| 3 | Gold | |
| 4 | Platinum | |
| 5 | Diamond | (tertinggi) |

> Tier dihitung otomatis dari `cumulative_spending`. Admin bisa override manual via `/admin/users/{id}/tier`.

---

## Akses URL

| URL | Keterangan |
|-----|-----------|
| `http://localhost:5173` | Frontend (Vite dev server) |
| `http://localhost:5173/admin` | Admin panel |
| `http://localhost:5173/center` | Center Shop (khusus starcenter login) |
| `http://localhost:8000/api` | Backend API |

Login admin panel: `admin@starinc.id` / `password`

---

## Playwright Profiles (Pre-authenticated)

Tersedia di `.playwright/profiles/`:

| File | Email | Role |
|------|-------|------|
| `admin.json` | `admin@starinc.id` | admin |
| `starcenter.json` | `sc.jawatimur@starinc.com` | starcenter |

> ⚠️ Profile `regular.json` sudah deprecated — semua user non-admin sekarang starcenter.

---

## Reset Database

```bash
cd starinc-api
php artisan migrate:fresh --seed
```

> Catatan: Setelah reset, Playwright profiles perlu di-regenerate karena token Sanctum akan berubah.
> Referral code akan ber-regenerate dengan nilai random baru — update file ini bila berubah.

---

## Quick Test Login (curl)

```bash
# Admin
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@starinc.id","password":"password"}'

# Starcenter regional
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sc.jawatimur@starinc.com","password":"password123"}'

# Starcenter downline
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sc.downline.2.1@starinc.com","password":"password123"}'
```
