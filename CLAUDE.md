# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Style & User Preferences

### Bahasa
- User berkomunikasi dalam **Bahasa Indonesia**. Selalu balas dalam Bahasa Indonesia kecuali user pakai Bahasa Inggris duluan.

### Gaya Komunikasi User
- Pesan singkat dan langsung — tidak panjang lebar. Contoh: "oke push ke vps", "masih gak bisa", "pull lagi".
- Kalau ada masalah, user cukup bilang gejalanya saja tanpa detail teknis. Claude yang harus diagnosa sendiri.
- "oke" = setuju/lanjutkan. Tidak perlu konfirmasi ulang, langsung kerjakan.
- User tidak butuh penjelasan panjang — cukup update singkat + hasil akhir.

### Cara Claude Harus Menjawab
- **Jawaban singkat dan padat.** Jangan jelaskan hal yang sudah obvious dari kode.
- **Langsung kerjakan** saat user bilang "oke" atau memberi instruksi. Tidak perlu recap atau tanya ulang.
- **Update singkat saat bekerja** — satu kalimat per langkah penting, bukan narasi panjang.
- **Jangan tulis ulang apa yang baru dikerjakan** di akhir respons — user bisa lihat sendiri.
- Kalau ada error/masalah, diagnosa dulu sebelum lapor — jangan dump raw error ke user.
- Gunakan format list/code block hanya kalau memang perlu, bukan untuk memperindah jawaban.

### Hal yang Perlu Diingat
- User pakai **Windows 11 laptop baru** — `localhost` resolve ke IPv6 (`::1`). Selalu pakai `127.0.0.1` untuk URL lokal.
- **`.env.local`** selalu override `.env` di Vite. Kalau ada masalah koneksi frontend, cek `.env.local` dulu.
- Local database: **MySQL `starinc_db_v2`** (bukan SQLite, bukan `starinc_db` yang lama). Password root kosong.
- VPS: **IDCloudHost** IP `157.10.161.83`, user SSH `STARINC`.

---

## Project Overview

**Repo ini adalah STARINC** — platform brand showcase + MLM STARCENTER. Ini adalah repo baru yang di-copy dari SDP-V2 (2026-05-12). Repo lama SDP-V2 di `C:\laragon\www\SDP-V2\` di-freeze sebagai arsip.

### Kenapa ada dua repo?
SDP-V2 lama dicampur antara konsep "marketplace" dan "brand STARINC". Diputuskan untuk pisah total:
- **Repo ini (STARINC)** → platform khusus STARCENTER member. Checkout hanya untuk `role = starcenter`. Non-member di-redirect ke SDP.
- **Repo SDP (belum dibuat)** → marketplace multi-brand dengan sistem reseller flat % global, vendor admin-curated.

### Status Phases
- ✅ **Phase 0** — Selesai. Repo ini dibuat, DB `starinc_db_v2` sudah ada di MySQL lokal.
- 🔲 **Phase 1** — Belum dimulai. Todo:
  1. Update `starinc-api/.env`: `DB_DATABASE=starinc_db_v2`
  2. `npm install` (root) + `composer install` (starinc-api/)
  3. `php artisan migrate:fresh --seed`
  4. Rename branding "SDP" → "STARINC" (AdminLayout, ProfileNetwork, package.json, index.html, config/app.php)
  5. Login-wall checkout — hanya `role IN ('starcenter', 'admin')` bisa checkout
  6. Non-member klik Beli → modal redirect ke SDP
  7. Update seeder — hapus user `regular`, hanya starcenter
- 🔲 **Phase 2** — Design SDP marketplace
- 🔲 **Phase 3** — Build SDP marketplace (repo baru)
- 🔲 **Phase 4** — Integrasi & Launch

This is a full-stack e-commerce and MLM (multi-level marketing) platform. It is a monorepo with a React + Vite frontend at the root and a Laravel 13 API backend in `starinc-api/`.

## Commands

### Frontend (root directory)
```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Backend (starinc-api/)
```bash
# PHP / Laravel
php artisan serve          # Start API server (default: localhost:8000)
php artisan migrate        # Run database migrations
php artisan migrate:fresh --seed  # Reset DB and seed
php artisan test           # Run PHPUnit tests
php artisan tinker         # Interactive REPL
./vendor/bin/pint          # Format PHP code (Laravel Pint)

# Composer scripts
composer run dev           # Start Laravel + Vite concurrently
composer run test          # Clear config then run tests
```

### Full-stack development
Run `php artisan serve` in `starinc-api/` and `npm run dev` in the root simultaneously.

## Architecture

### Frontend → Backend Communication
All API calls go through `src/api/client.js` — an Axios instance configured with:
- Base URL: `VITE_API_URL` (default `http://localhost:8000/api`)
- Request interceptor: auto-injects `Authorization: Bearer <token>` from localStorage
- Response interceptor: handles 401 (redirect to login) and 422 (validation errors)

API modules in `src/api/` mirror backend controllers: `authApi.js`, `productApi.js`, `orderApi.js`, `networkApi.js`, `adminApi.js`, `settingsApi.js`.

### Frontend State Management
Three React Contexts manage global state:
- **AuthContext** — current user, token, login/logout
- **CartContext** — shopping cart (persisted to localStorage)
- **AppearanceContext** — theme/branding fetched from API

### Routing Structure (App.jsx)
- Public routes under `RootLayout`: home, products, checkout, orders, profile, login
- Admin routes under `AdminLayout` at `/admin/*`: dashboard, products, orders, users, commissions, tiers, settings

### Backend Architecture
- **Controllers** (`app/Http/Controllers/Api/`) handle HTTP, delegate business logic to Services
- **Services** contain all business logic:
  - `OrderService` — server-side price calculation, inventory checks, tier discounts
  - `CommissionService` — distributes commissions (1 level for regular, up to 7 levels for Starcenter MLM)
  - `TierService` — upgrades user tiers based on cumulative spending
- **Middleware** `EnsureIsAdmin` protects all `/admin/*` routes, checking `$user->role === 'admin'`
- Authentication uses Laravel Sanctum (stateless Bearer tokens)

### User Role System
Three roles: `regular`, `starcenter`, `admin`
- Regular users: single-level commissions, no MOQ requirement
- Starcenter: multi-level MLM commissions (up to 7 levels), MOQ applies
- Admin: full access to admin panel

### Commission/MLM System
`StarcenterNetwork` table uses a closure-table adjacency structure with a `depth` column (1–7) to track upline chains. `CommissionService::distribute()` is called after order completion and walks the tree to assign commission records.

### Key Data Models
- **User**: `referrer_id`, `referral_code` (unique 8-char), `tier_id`, `role`, `cumulative_spending`, `password`, `email`
- **Order**: `order_number` (INV-XXXXXXXX), `status` (`pending_payment` → `processing` → `shipped`/`completed`/`rejected`), `tracking_number`
- **Commission**: `level` (1–7), `status` (`pending`/`paid`/`cancelled`), linked to User + Order + SourceUser
- **Tier**: `min_spend`, discount percentage; tiers auto-upgrade based on cumulative spending
- **StarcenterNetwork**: closure-table with `upline_id`, `downline_id`, `depth` (1–7)

## Admin Features

### User Management (`/admin/users`)
Admin dapat mengelola user account secara penuh:
- **View User Detail** — lihat semua info profil, tier, cumulative spending, role
- **View User Network** — lihat downline/upline tree dari user (untuk starcenter)
- **Edit User Password** — admin bisa reset password user (security: require confirmation)
- **Edit User Role** — ubah role user (regular → starcenter → admin)
- **Edit User Tier** — manual adjust tier jika diperlukan (untuk testing atau escalation)
- **View User Orders** — lihat history order dari user
- **View User Commissions** — lihat commission history dari user

**Backend Endpoints:**
- `GET /admin/users/{id}` — user detail + network + orders + commissions
- `PUT /admin/users/{id}/password` — update user password (admin action, needs confirmation)
- `PUT /admin/users/{id}/role` — change user role
- `PUT /admin/users/{id}/tier` — manual tier adjustment (admin only)
- `GET /admin/users/{id}/network` — view user's downline/upline tree
- `GET /admin/users/{id}/orders` — user's order history
- `GET /admin/users/{id}/commissions` — user's commission history

### Order Management (`/admin/orders`)
- Full order lifecycle management with status changes
- Payment proof review (approve/reject with notes)
- Tracking number input for shipped orders
- Order export with filters (status, date range)
- Pagination support (30 items per page)

### Dashboard (`/admin`)
- Revenue stats + monthly charts
- Active orders, pending payments count
- Commission stats (pending, paid)
- Top 5 products by sales
- Recent orders snapshot

## Environment Configuration

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:8000/api
VITE_STORAGE_URL=http://localhost:8000/storage
```

### Backend (`starinc-api/.env`, based on `.env.example`)
Key settings: `DB_CONNECTION=sqlite`, `QUEUE_CONNECTION=database`, `CACHE_STORE=database`. SQLite database is at `starinc-api/database/database.sqlite`.

## Development Setup

**See `LOCAL_SETUP.md` for complete local development guide (100% local, no Firebase).**

Key commands:
```bash
# Backend startup
cd starinc-api && php artisan migrate:fresh --seed && php artisan serve

# Frontend startup
npm run dev

# Test API
curl http://localhost:8000/api/tiers
```

Default test credentials:
- Admin: `admin@starinc.id` / `password`
- Starcenter: `sc.jawatimur@starinc.com` / `password123`
- Regular: `downline.2.1@starinc.com` / `password123`

## Playwright Profiles
Authenticated browser profiles are available at `.playwright/profiles/`.
Available profiles:
- admin: Admin dengan full access ke admin panel (admin@starinc.id / password)
- starcenter: Starcenter user dengan MLM multi-level commission (sc.jawatimur@starinc.com / password123)
- regular: Regular customer dengan single-level commission (downline.2.1@starinc.com / password123)

Config: `.playwright/profiles.json`
To load a profile, use `playwright-cli -s={session} state-load .playwright/profiles/<role>.json` to restore cookies and localStorage.
Run `/setup-profiles` to create new profiles or refresh expired sessions.
