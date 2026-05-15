# DEPLOY SAFETY — STARINC ke VPS

> Dokumen ini fokus pada **mencegah masalah yang sudah pernah terjadi** sebelumnya:
> 1. Koneksi backend gak nyambung dari frontend
> 2. Gambar produk gak tampil
>
> Setiap fix di bawah sudah dilakukan di code atau dijelaskan cara setup-nya.

---

## ROOT CAUSE — Kenapa Sebelumnya Bermasalah?

### 🔴 Penyebab #1: Laravel di belakang Cloudflare/Nginx tidak detect HTTPS
**Gejala:**
- Frontend HTTPS, tapi gambar produk gagal load
- Console error: `Mixed Content: blocked http://...`
- Atau gambar URL keluar sebagai `http://api.starincofficial.id/storage/...`

**Penyebab:** Laravel `Storage::disk('public')->url($file)` membaca scheme dari request. Karena Cloudflare/Nginx terminate SSL, request internal masuk sebagai HTTP. Laravel generate URL pakai HTTP → browser block.

**✅ Sudah di-fix:**
- [`bootstrap/app.php`](starinc-api/bootstrap/app.php) — tambah `trustProxies(at: '*', ...)` untuk respect `X-Forwarded-Proto` dari proxy.
- [`AppServiceProvider.php`](starinc-api/app/Providers/AppServiceProvider.php) — `URL::forceScheme('https')` di production.

---

### 🔴 Penyebab #2: Vite build embed env localhost ke production bundle
**Gejala:**
- Frontend di production tetap call `http://localhost:8000/api`
- Network tab: request ke localhost (fail karena bukan komputer dev)

**Penyebab:** Vite EMBED env vars saat `npm run build`. Kalau build di laptop dengan `.env` localhost lalu upload `dist/` → URL localhost hardcoded di JS bundle.

**✅ Sudah disiapkan:**
- [`.env.production.example`](.env.production.example) — template untuk frontend
- **Aturan wajib:** Build HARUS di VPS, BUKAN di laptop (lihat tahap deploy di bawah).

---

### 🔴 Penyebab #3: Hardcoded fallback ke localhost di komponen
**Gejala:**
- Sebagian gambar tampil, sebagian tidak (yang tidak: ProfileOrders dll)
- URL gambar: `http://localhost:8000/storage/...`

**Penyebab:** Komponen lama pakai `import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'`. Kalau env tidak ke-load saat build → fallback dipakai.

**✅ Sudah di-fix:**
- [`ProfileOrders.jsx`](src/components/profile/ProfileOrders.jsx) — pakai `main_image_url` accessor langsung dari backend, tanpa fallback hardcoded.

---

### 🔴 Penyebab #4: `php artisan storage:link` belum dijalankan
**Gejala:** Semua URL `/storage/...` return 404.

**Penyebab:** Storage Laravel ada di `storage/app/public/`, harus ada symlink ke `public/storage/` supaya Nginx bisa serve. Symlink ini TIDAK ada di git (`public/storage` di gitignore).

**✅ Solusi:** Wajib dijalankan setelah pertama kali clone (sudah ada di tahap deploy).

---

### 🔴 Penyebab #5: CORS tidak include domain frontend
**Gejala:** Browser console: `CORS policy: No 'Access-Control-Allow-Origin'`

**Penyebab:** [`config/cors.php`](starinc-api/config/cors.php) sudah pakai `env('FRONTEND_URL')`, tapi env tidak diset di production.

**✅ Solusi:** Set `FRONTEND_URL=https://starincofficial.id` di `.env` backend (sudah ada di template).

---

### 🔴 Penyebab #6: Cloudflare SSL mode "Flexible"
**Gejala:** Infinite redirect loop, atau gambar/API random fail.

**Penyebab:** SSL mode "Flexible" = Cloudflare ke browser HTTPS, tapi Cloudflare ke origin HTTP. Saat `URL::forceScheme('https')` aktif, Laravel generate URL `https://` lalu Cloudflare redirect ke HTTP lagi → loop.

**✅ Solusi:** SSL mode di Cloudflare WAJIB **Full (strict)**. Pastikan VPS sudah punya Let's Encrypt cert via Certbot dulu.

---

## ✅ PRE-DEPLOY CHECKLIST (jangan skip)

Sebelum `git push` & deploy ke VPS, pastikan:

### Backend
- [ ] `starinc-api/.env.production.example` sudah di-copy jadi `.env` di VPS, semua `GANTI_*` sudah diisi
- [ ] `APP_DEBUG=false`
- [ ] `APP_ENV=production`
- [ ] `APP_URL=https://api.starincofficial.id` (HTTPS, tanpa trailing slash)
- [ ] `FRONTEND_URL=https://starincofficial.id` (HTTPS)
- [ ] `DB_PASSWORD` bukan password kosong/lemah
- [ ] `RESEND_API_KEY` sudah diisi
- [ ] `MIDTRANS_IS_PRODUCTION=true` + key production (bukan sandbox)

### Frontend
- [ ] `.env.production.example` sudah di-copy jadi `.env.production` di VPS
- [ ] `VITE_API_URL=https://api.starincofficial.id/api` (HTTPS, tanpa trailing slash, dengan `/api`)
- [ ] `VITE_STORAGE_URL=https://api.starincofficial.id/storage`
- [ ] `VITE_MIDTRANS_IS_PRODUCTION=true`

### Infrastruktur
- [ ] Certbot SSL sudah jalan di kedua subdomain
- [ ] Cloudflare SSL mode = **Full (strict)** (bukan Flexible)
- [ ] DNS records untuk Resend (SPF/DKIM/DMARC) sudah ditambahkan & verified
- [ ] `storage/app/public` permission `775`, owner `deploy:www-data`
- [ ] Nginx `client_max_body_size 10M` (untuk upload payment proof/KTP)

---

## 🚀 PROSEDUR DEPLOY YANG AMAN

### Pertama kali (fresh setup)

```bash
# === DI VPS sebagai user `deploy` ===

# 1. Clone
cd /var/www
git clone <REPO_URL> starinc
cd starinc

# 2. Backend
cd starinc-api
cp .env.production.example .env
nano .env                                # ISI semua GANTI_*
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force              # kosong, no seed
php artisan storage:link                 # ⚠️ JANGAN LUPA — gambar 404 kalau skip
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo chown -R deploy:www-data .
sudo chmod -R 775 storage bootstrap/cache

# 3. Frontend (DI VPS, BUKAN di laptop)
cd ..
cp .env.production.example .env.production
nano .env.production                     # ISI semua GANTI_*
npm ci
npm run build                            # output: dist/

# 4. Buat admin pertama
cd starinc-api
php artisan tinker
# (di tinker, lihat SETUP_VPS.md tahap 6)
```

### Update setelah ada code baru di git

Buat file `deploy.sh` di `/var/www/starinc/`:

```bash
#!/bin/bash
set -e                                   # stop kalau ada error

echo "→ Pull latest code"
git pull

echo "→ Backend dependencies"
cd starinc-api
composer install --no-dev --optimize-autoloader --no-interaction

echo "→ Run migrations"
php artisan migrate --force

echo "→ Clear & rebuild cache"
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "→ Frontend build (DI VPS, bukan local)"
cd ..
npm ci
npm run build

echo "→ Restart queue worker"
sudo supervisorctl restart starinc-queue:*

echo "→ Reload nginx"
sudo systemctl reload nginx

echo "✓ Deploy selesai"
```

Set executable: `chmod +x deploy.sh`. Pakai: `./deploy.sh`.

---

## 🧪 SMOKE TEST SETELAH DEPLOY (urut, jangan lompat)

| # | Test | Cara cek | Kalau gagal |
|---|------|----------|-------------|
| 1 | HTTPS frontend | `curl -I https://starincofficial.id` → 200 | Certbot belum jalan / DNS belum propagate |
| 2 | HTTPS API | `curl https://api.starincofficial.id/api/products` → JSON | Nginx config api / PHP-FPM down |
| 3 | API URL benar di build | View source frontend → cari `api.starincofficial.id` | Build pakai env wrong, rebuild di VPS |
| 4 | Storage symlink | `curl -I https://api.starincofficial.id/storage/test.png` → 404 (bukan 500) | `php artisan storage:link` belum jalan |
| 5 | CORS allow | DevTools → Network → tidak ada CORS error | `FRONTEND_URL` di `.env` salah |
| 6 | Upload gambar | Admin upload produk → preview muncul | Permission `storage/` salah |
| 7 | Gambar URL https | DevTools → inspect `<img src>` → `https://api...` | `TrustProxies` / `forceScheme` belum aktif → restart php-fpm |
| 8 | Login admin | Login pakai akun yang dibuat tadi | Sanctum / CORS / SESSION_DOMAIN salah |
| 9 | Email Resend | Register user baru → cek email masuk | Resend domain belum verified / API key salah |
| 10 | Queue jalan | `sudo supervisorctl status` → `RUNNING` | Supervisor conf path salah |
| 11 | Scheduler | `crontab -l` → ada line schedule:run | Cron belum diset |
| 12 | Logs bersih | `tail storage/logs/laravel.log` → tidak ada error spam | Cek error spesifik |

---

## 🆘 TROUBLESHOOTING CEPAT

### Gambar masih tidak tampil setelah deploy
1. **DevTools → klik gambar yang gagal → cek URL**
   - Kalau `localhost:8000` → frontend build pakai env salah, rebuild di VPS
   - Kalau `http://api...` (bukan https) → TrustProxies belum aktif, jalankan:
     ```bash
     php artisan config:clear && php artisan config:cache
     sudo systemctl reload php8.3-fpm
     ```
   - Kalau `https://api.../storage/...` tapi 404 → `php artisan storage:link`

### "Network Error" / API tidak terjangkau
1. `curl https://api.starincofficial.id/api/products` dari laptop → kalau gagal:
   - Cek DNS Cloudflare A record point ke IP VPS yang benar
   - Cek Nginx jalan: `sudo systemctl status nginx`
   - Cek port 443 terbuka: `sudo ufw status`

### CORS error
1. Cek `.env` backend: `FRONTEND_URL=https://starincofficial.id` (HTTPS, tanpa trailing slash)
2. Setelah edit `.env`: `php artisan config:cache`
3. Restart PHP-FPM: `sudo systemctl reload php8.3-fpm`

### Email tidak masuk
1. Resend dashboard → cek log: domain ter-verified? API key benar?
2. `tail -f storage/logs/laravel.log` saat trigger email
3. Test manual: `php artisan tinker` → `Mail::raw('test', fn($m)=>$m->to('your@email')->subject('test'));`

### Site lambat / 502 random
1. `sudo systemctl status php8.3-fpm` — restart kalau lagi crash
2. Cek RAM: `free -h` — kalau penuh, OOM. Naik spec VPS atau aktifkan swap
3. Cek slow query MySQL: `tail /var/log/mysql/slow.log`

---

## 🔄 ROLLBACK PLAN

Kalau deploy bermasalah dan harus mundur:

```bash
cd /var/www/starinc
git log --oneline -5                    # cari commit hash sebelumnya
git checkout <commit-hash-aman>
./deploy.sh
```

Untuk database, kalau ada migration yang bermasalah:
```bash
cd starinc-api
php artisan migrate:rollback --step=1
```

> Selalu **snapshot VPS via panel IDCloudHost** sebelum deploy besar (perubahan struktur DB, dll).

---

## ⚠️ HAL YANG SERING TERLUPA

1. **Cloudflare auto-purge cache** setelah deploy frontend baru, biar user dapat asset terbaru. Atau pakai versioned filename (Vite sudah otomatis).
2. **`config:cache` setelah ubah `.env`** — tanpa ini perubahan tidak terbaca.
3. **`storage:link`** — symlink hilang setiap kali pindah server, harus rerun.
4. **`chown` setelah `composer install`** — Composer kadang ganti owner file.
5. **Cloudflare DKIM record HARUS DNS-only** (abu-abu), bukan Proxied (oranye) — kalau proxied, Resend verification gagal.
