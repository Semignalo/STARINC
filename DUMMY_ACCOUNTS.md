# SDP-V2 Dummy Accounts untuk Testing

## Akun Admin
| Email | Password | Role | Nama | Catatan |
|-------|----------|------|------|---------|
| `admin@sdp.test` | `Admin@12345` | admin | Administrator | Full access ke admin panel |

## Akun Starcenter (Distributor MLM)
| Email | Password | Role | Nama | MOQ | Catatan |
|-------|----------|------|------|-----|---------|
| `starcenter1@sdp.test` | `Star@12345` | starcenter | PT Starcenter 1 | Rp 5.000.000 | Minimum order quantity berlaku |
| `starcenter2@sdp.test` | `Star@12345` | starcenter | PT Starcenter 2 | Rp 5.000.000 | Testing multi-distributor |

## Akun Regular (Customer)
| Email | Password | Role | Nama | Catatan |
|-------|----------|------|------|---------|
| `customer1@sdp.test` | `Cust@12345` | regular | Budi Santoso | No MOQ requirement |
| `customer2@sdp.test` | `Cust@12345` | regular | Siti Nurhaliza | Testing referral code |

## Cara Testing

### 1. Login & Checkout Flow
```bash
# Regular User
Email: customer1@sdp.test
Password: Cust@12345
```
- Buka `/checkout` → no MOQ warning
- Upload bukti bayar ✓ (max 2MB, jpg/png/pdf)
- Test upload > 2MB → error validation ✓

### 2. Starcenter Flow
```bash
# Starcenter User
Email: starcenter1@sdp.test
Password: Star@12345
```
- Buka cart → MOQ warning (Rp 5.000.000) ✓
- Cart total < 5jt → checkout disabled ✓
- Cart total > 5jt → checkout enabled ✓
- MOQ value fetch dari API `/settings/system` ✓

### 3. Admin Panel
```bash
# Admin User
Email: admin@sdp.test
Password: Admin@12345
```
- Akses `/admin` ✓
- Dashboard dengan metrics ✓
- Manage products, orders, commissions ✓
- Settings → update MOQ threshold ✓

### 4. Test Error Handling
```bash
# Test 403 (Access Denied)
1. Login sebagai customer1@sdp.test
2. Coba akses /admin directly di URL
3. Should see: Swal "Akses Ditolak" ✓

# Test 500 Error
1. Backend: matikan PHP
2. Frontend: coba akses halaman
3. Should see: Swal "Server Error" ✓

# Test Token Re-validation
1. Login → tab active
2. Nonaktifkan tab (switch tab lain) selama > 1 menit
3. Kembali ke tab → token automatically re-validated ✓
```

### 5. Test Lazy Loading
- Akses `/products` → PageLoader spinner muncul
- Akses `/profile` → PageLoader spinner muncul
- Akses `/admin` → PageLoader spinner + chunks load individually ✓

### 6. Test Bundle Splitting
```bash
npm run build
# Check output untuk chunks:
# - vendor-*.js (React, Router)
# - ui-*.js (Sweetalert, Lucide)
# - charts-*.js (Recharts)
# - [PageName]-*.js (Individual pages)
```

---

## Referral Code Testing

Untuk test referral link, gunakan salah satu kode di bawah:

```
# Starcenter 1 referral code
?ref=STAR0001

# Starcenter 2 referral code
?ref=STAR0002

# Example:
/join-starcenter?ref=STAR0001
```

---

## Test Checklist

- [ ] Login dengan berbagai role (admin, starcenter, regular)
- [ ] MOQ warning di CartDrawer (starcenter only)
- [ ] Checkout flow dengan MOQ validation
- [ ] Upload bukti bayar (size & type validation)
- [ ] Error handling (401, 403, 422, 500)
- [ ] Token re-validation saat tab aktif kembali
- [ ] Lazy loading pages (PageLoader visible)
- [ ] Bundle chunks di DevTools Network tab

---

## Seed Data (Database)

Akun-akun di atas sudah di-seed di `database.sqlite`. Jika perlu reset:

```bash
cd starinc-api
php artisan migrate:fresh --seed
```

Setelah itu gunakan akun-akun di atas untuk login.

---

## Troubleshooting

### "Invalid credentials" saat login
- Pastikan backend sudah running: `php artisan serve`
- Cek `.env` `DB_DATABASE` path ke database.sqlite

### MOQ value tetap hardcode (tidak fetch dari API)
- Pastikan route `/api/settings/system` sudah ada di `api.php`
- Cek browser console untuk API error
- Backend return format: `{ "moq_threshold": 5000000 }`

### Upload validation tidak jalan
- Pastikan Invoice.jsx sudah updated
- Cek browser console untuk validation error message
- Test file: buat file > 2MB atau .exe untuk test

### Error Boundary tidak menangkap error
- Error Boundary hanya catch component render error, bukan async error
- Untuk async error: gunakan try/catch di komponen
- Test dengan console.error() di useEffect

---

**Last Updated**: 2026-04-17
**Phase**: 1 Complete ✅
