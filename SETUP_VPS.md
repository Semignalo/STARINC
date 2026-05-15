# SETUP VPS — STARINC (dari Nol)

> Target: VPS IDCloudHost (`157.10.161.83`) + Domain `starincofficial.id` (Hostinger registrar, Cloudflare DNS) + Resend email
> Strategi: Reset total VPS, setup fresh, database kosong.

---

## ARSITEKTUR FINAL

```
                 ┌─────────────┐
                 │  Cloudflare │ ← DNS + Proxy + SSL edge
                 └──────┬──────┘
                        │
       ┌────────────────┼────────────────┐
       │                                  │
   starincofficial.id              api.starincofficial.id
   (React build static)            (Laravel API)
       │                                  │
       └────────────┬─────────────────────┘
                    ▼
              VPS IDCloudHost (Ubuntu 24.04)
              ├── Nginx → /var/www/starinc/dist  (frontend static)
              ├── Nginx → PHP-FPM → /var/www/starinc-api  (Laravel)
              ├── MySQL 8 (starinc_db_v2)
              ├── Supervisor → queue:work
              └── Cron → schedule:run /menit
```

**Resend** kirim email dari `noreply@starincofficial.id` (perlu verify domain via DNS).

---

## PERSIAPAN SEBELUM RESET VPS

### A. Backup yang harus diselamatkan
- [ ] **Project lain di VPS** (kalau ada yang masih dipakai) — backup ke local
- [ ] **Database project lain** — `mysqldump` semua database yang masih dibutuhkan
- [ ] **SSH key** — pastikan `~/.ssh/authorized_keys` di laptop masih ada copy-nya
- [ ] **Catatan port custom** kalau pernah ganti port SSH

### B. Akun & API yang harus disiapkan
- [ ] Akses panel **IDCloudHost** (untuk reinstall VPS)
- [ ] Akses dashboard **Cloudflare** (akun yang manage `starincofficial.id`)
- [ ] Akses **Hostinger** (untuk pastikan nameserver di-point ke Cloudflare — biasanya `xxx.ns.cloudflare.com`)
- [ ] Daftar **Resend** di https://resend.com → API key + domain ready untuk verify
- [ ] **Midtrans dashboard** (https://dashboard.midtrans.com) → ambil **Production Server Key** & **Client Key** (bukan sandbox)
- [ ] SSH key dari laptop ready (`~/.ssh/id_ed25519.pub` atau `id_rsa.pub`)

### C. Keputusan subdomain
- `starincofficial.id` → frontend (apex)
- `www.starincofficial.id` → redirect ke apex
- `api.starincofficial.id` → backend Laravel

---

## TAHAP 1 — RESET VPS

1. **Login IDCloudHost panel**
2. **Snapshot dulu** (kalau ragu, biar bisa rollback)
3. **Reinstall OS** → pilih **Ubuntu 24.04 LTS**
4. **Set root password** baru (catat di password manager)
5. **Tunggu provisioning selesai** (~5 menit)

---

## TAHAP 2 — HARDENING DASAR

Login pertama via SSH sebagai `root`:

```bash
ssh root@157.10.161.83
```

Yang harus dikerjakan:
- [ ] **Update sistem:** `apt update && apt upgrade -y`
- [ ] **Set timezone:** `timedatectl set-timezone Asia/Jakarta`
- [ ] **Buat user non-root** (misal `deploy`):
  ```bash
  adduser deploy
  usermod -aG sudo deploy
  ```
- [ ] **Upload SSH public key ke user baru:**
  ```bash
  mkdir -p /home/deploy/.ssh
  nano /home/deploy/.ssh/authorized_keys   # paste public key dari laptop
  chmod 700 /home/deploy/.ssh
  chmod 600 /home/deploy/.ssh/authorized_keys
  chown -R deploy:deploy /home/deploy/.ssh
  ```
- [ ] **Disable root login & password auth** di `/etc/ssh/sshd_config`:
  ```
  PermitRootLogin no
  PasswordAuthentication no
  ```
  Restart: `systemctl restart ssh`
- [ ] **Firewall UFW:**
  ```bash
  ufw allow OpenSSH
  ufw allow 'Nginx Full'
  ufw enable
  ```
- [ ] **(Opsional) Fail2ban:** `apt install -y fail2ban`

> **Sekarang logout dan login ulang sebagai `deploy`.** Sisa setup pakai user ini.

---

## TAHAP 3 — INSTALL SOFTWARE STACK

```bash
sudo apt install -y nginx mysql-server git unzip curl supervisor certbot python3-certbot-nginx
```

### PHP 8.3
```bash
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:ondrej/php
sudo apt update
sudo apt install -y php8.3-fpm php8.3-cli php8.3-mysql php8.3-mbstring \
  php8.3-xml php8.3-curl php8.3-zip php8.3-gd php8.3-bcmath php8.3-intl
```

### Composer
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verifikasi:
```bash
php -v        # PHP 8.3.x
mysql --version
node -v       # v20.x
npm -v
composer -V
nginx -v
```

---

## TAHAP 4 — SETUP MYSQL

```bash
sudo mysql_secure_installation
```
Set password root. Pilih `Y` untuk semua hardening (remove anonymous, disallow remote root, drop test db, reload privileges).

Login lalu buat database & user:
```bash
sudo mysql
```
```sql
CREATE DATABASE starinc_db_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'starinc'@'localhost' IDENTIFIED BY 'GANTI_DENGAN_PASSWORD_KUAT';
GRANT ALL PRIVILEGES ON starinc_db_v2.* TO 'starinc'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> Catat password DB di password manager.

---

## TAHAP 5 — DNS DI CLOUDFLARE

Login Cloudflare → pilih domain `starincofficial.id` → **DNS** tab.

Tambahkan records:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `starincofficial.id` (atau `@`) | `157.10.161.83` | 🟠 Proxied |
| A | `www` | `157.10.161.83` | 🟠 Proxied |
| A | `api` | `157.10.161.83` | 🟠 Proxied |

**SSL/TLS** tab → mode: **Full (strict)** (akan jalan setelah Certbot dipasang)

**Resend domain verification** akan butuh tambahan records (TXT/CNAME) — lihat tahap 8.

---

## TAHAP 6 — CLONE PROJECT & SETUP BACKEND

```bash
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www
cd /var/www
git clone <URL_REPO_GITHUB_STARINC> starinc
cd starinc/starinc-api
composer install --no-dev --optimize-autoloader
```

### Setup `.env` backend
```bash
cp .env.example .env
nano .env
```

Edit yang penting:
```env
APP_NAME=STARINC
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.starincofficial.id

LOG_CHANNEL=daily
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=starinc_db_v2
DB_USERNAME=starinc
DB_PASSWORD=PASSWORD_DB_YANG_TADI

CACHE_STORE=database
QUEUE_CONNECTION=database
SESSION_DRIVER=database
SESSION_DOMAIN=.starincofficial.id

SANCTUM_STATEFUL_DOMAINS=starincofficial.id,www.starincofficial.id

# Resend
MAIL_MAILER=resend
RESEND_API_KEY=re_xxxxxxxxxxxx
MAIL_FROM_ADDRESS="noreply@starincofficial.id"
MAIL_FROM_NAME="STARINC"

# Midtrans (PRODUCTION)
MIDTRANS_SERVER_KEY=Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=true

# Frontend URL (untuk email link)
FRONTEND_URL=https://starincofficial.id
```

Lalu:
```bash
php artisan key:generate
php artisan migrate --force          # kosong, no seed
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Permission folder
```bash
sudo chown -R deploy:www-data /var/www/starinc/starinc-api
sudo chmod -R 775 /var/www/starinc/starinc-api/storage
sudo chmod -R 775 /var/www/starinc/starinc-api/bootstrap/cache
```

### Buat admin pertama (karena DB kosong)
```bash
php artisan tinker
```
```php
\App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@starincofficial.id',
    'password' => bcrypt('GANTI_PASSWORD_KUAT'),
    'role' => 'admin',
    'referral_code' => 'ADMIN001',
    'email_verified_at' => now(),
]);
exit
```

---

## TAHAP 7 — BUILD FRONTEND

```bash
cd /var/www/starinc
```

### Setup `.env.production` frontend
```bash
nano .env.production
```
```env
VITE_API_URL=https://api.starincofficial.id/api
VITE_STORAGE_URL=https://api.starincofficial.id/storage
VITE_MIDTRANS_CLIENT_KEY=Mid-client-xxxxx
VITE_MIDTRANS_IS_PRODUCTION=true
```

Build:
```bash
npm ci
npm run build
```

Output di `dist/` — ini yang akan di-serve Nginx.

---

## TAHAP 8 — KONFIGURASI NGINX

### Frontend (`starincofficial.id` + `www`)
File: `/etc/nginx/sites-available/starincofficial.id`
```nginx
server {
    listen 80;
    server_name starincofficial.id www.starincofficial.id;
    root /var/www/starinc/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1000;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|webp|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Backend (`api.starincofficial.id`)
File: `/etc/nginx/sites-available/api.starincofficial.id`
```nginx
server {
    listen 80;
    server_name api.starincofficial.id;
    root /var/www/starinc/starinc-api/public;
    index index.php;

    client_max_body_size 10M;  # untuk upload payment proof / KTP

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht { deny all; }
}
```

Aktifkan & reload:
```bash
sudo ln -s /etc/nginx/sites-available/starincofficial.id /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.starincofficial.id /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### SSL via Let's Encrypt
> **Penting:** Di Cloudflare, sementara ubah DNS jadi **DNS only (abu-abu)** dulu, supaya Certbot bisa verify. Setelah dapat sertifikat, balikin ke **Proxied (oranye)**.

```bash
sudo certbot --nginx -d starincofficial.id -d www.starincofficial.id -d api.starincofficial.id
```

Auto-renew sudah aktif by default. Test: `sudo certbot renew --dry-run`.

Kembalikan Cloudflare proxy ke **🟠 Proxied** + SSL mode **Full (strict)**.

---

## TAHAP 9 — RESEND EMAIL DOMAIN VERIFICATION

1. Login Resend → **Domains** → **Add domain** `starincofficial.id`
2. Resend kasih records (3-4 buah: SPF TXT, DKIM CNAME, DMARC TXT)
3. Buka Cloudflare DNS → tambahkan semua records dari Resend
4. **Penting:** Set Proxy = **DNS only (abu-abu)** untuk records CNAME DKIM (kalau proxied, verification gagal)
5. Tunggu 1-15 menit, klik **Verify** di Resend
6. Setelah verified, ambil **API key** → masukkan ke `.env` Laravel (`RESEND_API_KEY`)
7. Test kirim email dari tinker:
   ```bash
   cd /var/www/starinc/starinc-api
   php artisan tinker
   ```
   ```php
   \Mail::raw('Test STARINC', fn($m) => $m->to('emailmu@gmail.com')->subject('Test'));
   ```

---

## TAHAP 10 — QUEUE WORKER (SUPERVISOR)

File: `/etc/supervisor/conf.d/starinc-queue.conf`
```ini
[program:starinc-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/starinc/starinc-api/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=deploy
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/starinc/starinc-api/storage/logs/queue.log
stopwaitsecs=3600
```

Aktifkan:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start starinc-queue:*
```

---

## TAHAP 11 — LARAVEL SCHEDULER (CRON)

```bash
crontab -e
```
Tambahkan:
```cron
* * * * * cd /var/www/starinc/starinc-api && php artisan schedule:run >> /dev/null 2>&1
```

---

## TAHAP 12 — SMOKE TEST

- [ ] `https://starincofficial.id` → Home page muncul, hero load
- [ ] `https://api.starincofficial.id/api/products` → return JSON (atau empty array)
- [ ] Login dengan admin yang dibuat tadi → masuk `/admin`
- [ ] Upload gambar produk → cek file masuk ke `storage/app/public/`
- [ ] Test register user baru → email verifikasi terkirim via Resend
- [ ] Test checkout (kalau sudah ada produk) → invoice generate
- [ ] Cek log: `tail -f /var/www/starinc/starinc-api/storage/logs/laravel.log`
- [ ] Cek queue jalan: `sudo supervisorctl status`

---

## DEPLOYMENT WORKFLOW HARIAN

Setelah setup selesai, untuk update code:

```bash
ssh deploy@157.10.161.83
cd /var/www/starinc
git pull
cd starinc-api
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
cd ..
npm ci
npm run build
sudo supervisorctl restart starinc-queue:*
sudo systemctl reload nginx
```

> Nanti bisa dibungkus jadi `deploy.sh` biar tinggal `./deploy.sh`.

---

## CHECKLIST FINAL SEBELUM LIVE

- [ ] `APP_DEBUG=false` di backend `.env`
- [ ] Midtrans pakai **production key**, bukan sandbox
- [ ] Cloudflare SSL = **Full (strict)**
- [ ] Resend domain ter-verify (3-4 records DNS)
- [ ] Backup harian database sudah di-setup (lihat di bawah)
- [ ] Admin password kuat, bukan `password`
- [ ] `.env` tidak ter-commit ke git
- [ ] Firewall UFW aktif

---

## BACKUP STRATEGY (RECOMMENDED)

Tambah cron untuk backup DB harian:
```cron
0 2 * * * mysqldump -u starinc -p'PASSWORD' starinc_db_v2 | gzip > /home/deploy/backups/starinc_$(date +\%Y\%m\%d).sql.gz
0 3 * * * find /home/deploy/backups -name "*.sql.gz" -mtime +14 -delete
```

Untuk file uploads, sync ke storage external (R2/S3) atau rsync ke laptop berkala.

---

## TROUBLESHOOTING UMUM

| Gejala | Cek |
|--------|-----|
| 502 Bad Gateway | `sudo systemctl status php8.3-fpm` — restart kalau down |
| Permission denied saat upload | `chmod -R 775 storage/`, owner `deploy:www-data` |
| Email tidak terkirim | Cek `storage/logs/laravel.log`, verify Resend domain |
| CORS error di frontend | `config/cors.php` → allowed_origins include domain frontend |
| Sanctum 401 padahal sudah login | `SANCTUM_STATEFUL_DOMAINS` dan `SESSION_DOMAIN` benar |
| White screen di prod | `APP_DEBUG=true` sementara, cek log, balikin false |
