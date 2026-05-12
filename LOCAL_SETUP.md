# 🚀 SDP-V2 Local Development Setup

Panduan lengkap untuk menjalankan SDP-V2 secara lokal (100% local, tanpa cloud).

## 📋 Prerequisites

- **Node.js** v18+ (untuk frontend)
- **PHP** 8.2+ (untuk backend)
- **Composer** (untuk dependencies Laravel)
- **SQLite** (sudah built-in di PHP)
- **Laragon** atau setup PHP lokal sendiri

## 🔧 Setup Backend (Laravel)

### 1. Install Dependencies
```bash
cd starinc-api
composer install
```

### 2. Setup Environment
```bash
cp .env.example .env
php artisan key:generate
```

Pastikan `.env` sudah benar:
```env
APP_DEBUG=true
DB_CONNECTION=sqlite
QUEUE_CONNECTION=database
CACHE_STORE=database
```

### 3. Database Migration & Seeding
```bash
# Buat database dan jalankan migration
php artisan migrate

# Populate dengan dummy data (120+ orders, users, products)
php artisan migrate:fresh --seed
```

### 4. Start Backend Server
```bash
php artisan serve
# API berjalan di: http://localhost:8000
```

**Akun admin dummy:**
- Email: `admin@sdp.com`
- Password: `password123`

**Akun user dummy:**
- Center: `center.pusat@starinc.com` / `password123`
- Downline: `downline.l1.*.1@example.com` / `password123`

---

## 🎨 Setup Frontend (React + Vite)

### 1. Install Dependencies
```bash
cd ..  # kembali ke root
npm install
```

### 2. Environment Configuration
File `.env` sudah ter-setup:
```env
VITE_API_URL=http://localhost:8000/api
VITE_STORAGE_URL=http://localhost:8000/storage
```

**Tidak ada Firebase, tidak ada cloud — pure local.**

### 3. Start Dev Server
```bash
npm run dev
# Frontend berjalan di: http://localhost:5173
```

### 4. Build untuk Production (optional)
```bash
npm run build
# Output: dist/ folder
```

---

## ✅ Verifikasi Setup Berhasil

### Checklist:
- [ ] Backend running: `http://localhost:8000/api/tiers` → returns JSON
- [ ] Frontend running: `http://localhost:5173` → loads page
- [ ] Login berhasil: admin@sdp.com / password123
- [ ] Dummy data ada: `/admin/orders` shows 120+ orders

### Quick Test:
```bash
# Terminal 1 — Backend
cd starinc-api && php artisan serve

# Terminal 2 — Frontend
npm run dev

# Terminal 3 — Test API
curl http://localhost:8000/api/tiers
# Should return array of tiers
```

---

## 📁 Project Structure

```
SDP-V2/
├── src/                          # React Frontend
│   ├── pages/                   # Pages (Home, Products, Admin, etc)
│   ├── components/              # Reusable components
│   ├── api/                     # API client modules
│   ├── context/                 # Auth, Cart, Appearance contexts
│   └── assets/                  # Images, styles
│
├── starinc-api/                 # Laravel Backend
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   ├── Services/            # Business logic (Order, Commission, Tier)
│   │   └── Middleware/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php              # All API routes
│
├── .env                         # Frontend env (VITE_API_URL, etc)
└── LOCAL_SETUP.md              # Ini file
```

---

## 🔐 Key Features Implemented

### Backend
- ✅ Auth (Sanctum tokens)
- ✅ Products (CRUD + media)
- ✅ Orders (checkout, payment proof, status machine)
- ✅ Commission (single-level + MLM 7-level)
- ✅ Tier system (auto-upgrade)
- ✅ Admin dashboard + management
- ✅ Tracking number support

### Frontend
- ✅ Product catalog + search/filter
- ✅ Shopping cart
- ✅ Checkout (3-step)
- ✅ Order tracking + invoice
- ✅ User profile + commission history
- ✅ MLM network tree visualization
- ✅ Admin panel (full CRUD)
- ✅ Payment proof review

---

## 🐛 Troubleshooting

### Frontend tidak bisa connect ke API
**Problem:** `http://localhost:5173` → API error

**Solution:**
1. Pastikan backend running: `php artisan serve`
2. Cek `.env` memiliki `VITE_API_URL=http://localhost:8000/api`
3. Jalankan `npm run dev` ulang

### Database error
**Problem:** `SQLSTATE[HY000]: General error`

**Solution:**
```bash
cd starinc-api
rm database/database.sqlite  # Hapus DB lama
php artisan migrate:fresh --seed  # Buat ulang
```

### Port 8000 atau 5173 sudah dipakai
**Solution:**
```bash
# Backend pada port custom
php artisan serve --port=8001

# Frontend pada port custom
npm run dev -- --port 5174

# Update .env jika backend port berbeda:
# VITE_API_URL=http://localhost:8001/api
```

---

## 📚 Useful Commands

```bash
# Backend
php artisan tinker                 # Interactive REPL
php artisan migrate               # Run migrations
php artisan migrate:fresh --seed  # Reset DB + seed
php artisan test                  # Run PHPUnit tests (WIP)

# Frontend
npm run dev                        # Dev server
npm run build                      # Production build
npm run lint                       # ESLint
npm run preview                    # Preview build locally
```

---

## 🚀 Next Steps (Development Roadmap)

1. **Testing** — Tambah PHPUnit untuk OrderService, CommissionService, TierService
2. **Email** — Setup Laravel Mail untuk order notifications
3. **Optimization** — Fix N+1 queries di CommissionService
4. **Production** — Setup MySQL, deploy backend ke server (Railway, Heroku, VPS)

---

**Last Updated:** 2026-04-17
**Semua local, tanpa cloud atau Firebase. Pure development workflow.**
