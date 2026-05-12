# SDP-V2: E-Commerce & MLM Platform

[![Tests](https://github.com/starinc/sdp-v2/actions/workflows/test.yml/badge.svg)](https://github.com/starinc/sdp-v2/actions/workflows/test.yml)
[![Lint](https://github.com/starinc/sdp-v2/actions/workflows/lint.yml/badge.svg)](https://github.com/starinc/sdp-v2/actions/workflows/lint.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack e-commerce and multi-level marketing (MLM) platform built with **React 19 + Vite** (frontend) and **Laravel 13** (backend).

## 🚀 Features

- **E-Commerce Core**: Product catalog, shopping cart, checkout, order management
- **MLM System**: Multi-level commission distribution (up to 7 levels for Starcenters)
- **Tier System**: Automatic tier upgrades based on cumulative spending
- **Admin Panel**: User management, order management, commission tracking, dashboard analytics
- **User Authentication**: Registration, login, profile management, password recovery
- **Email Notifications**: Order confirmations, payment status updates, shipping notifications, commission alerts
- **Payment Management**: Payment proof upload, admin review/approval workflow
- **Responsive Design**: Mobile-friendly UI with professional branding

## 📋 Project Structure

```
SDP-V2/
├── src/                      # React frontend (Vite)
│   ├── pages/               # Page components
│   ├── components/          # Reusable components
│   ├── api/                 # API client modules
│   ├── contexts/            # React context providers
│   └── App.jsx              # Main app component
├── starinc-api/             # Laravel backend
│   ├── app/
│   │   ├── Http/Controllers/  # API controllers
│   │   ├── Models/            # Eloquent models
│   │   ├── Services/          # Business logic
│   │   └── Mail/              # Email mailables
│   ├── routes/              # API routes
│   ├── database/
│   │   ├── migrations/      # Database migrations
│   │   └── factories/       # Model factories
│   ├── tests/               # Feature & unit tests
│   └── resources/views/     # Email templates
├── .github/workflows/       # CI/CD pipelines
├── CHECKPOINT.md            # Development progress tracking
├── CLAUDE.md                # Claude Code instructions
└── LOCAL_SETUP.md           # Local development guide

```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **Context API** - State management

### Backend
- **Laravel 13** - PHP framework
- **MySQL 8.0** - Database
- **Eloquent ORM** - Database abstraction
- **Sanctum** - Stateless API authentication
- **Queue** - Background job processing
- **Mailables** - Email templates

## 🏃 Quick Start

### Prerequisites
- PHP 8.3+
- Composer
- Node.js 18+
- MySQL 8.0+ (or SQLite for development)

### Development Setup

**1. Backend Setup**
```bash
cd starinc-api

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Database
php artisan migrate:fresh --seed

# Start server
php artisan serve
```

**2. Frontend Setup**
```bash
# From root directory
npm install
npm run dev
```

**3. Access Application**
- Frontend: http://localhost:5173
- API: http://localhost:8000/api

### Default Test Credentials
- Admin: `admin@sdp.com` / `password123`
- User: `user@sdp.com` / `password123`
- Starcenter: `center.pusat@starinc.com` / `password123`

## 🧪 Testing

### Run All Tests
```bash
cd starinc-api
php artisan test
```

### Run Specific Test Suite
```bash
# Feature tests
php artisan test --filter=Feature

# Unit tests
php artisan test --filter=Unit

# Password recovery tests
php artisan test --filter=PasswordResetTest
```

### Expected Results
```
✅ 42 unit tests
✅ 35 feature tests
✅ 9 password recovery tests
─────────────
✅ 86 tests total passing
```

## 📦 Available Commands

### Frontend (Root Directory)
```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend (starinc-api/)
```bash
php artisan serve                 # Start API server
php artisan migrate              # Run migrations
php artisan migrate:fresh --seed # Reset DB with seed
php artisan test                 # Run test suite
php artisan tinker               # Interactive REPL
./vendor/bin/pint                # Format PHP code
```

## 🚀 CI/CD Pipeline

GitHub Actions automatically runs:
- **Tests** on every push and pull request
- **Lint checks** for code quality
- **Coverage reports** for test coverage

View workflow status: [Actions Tab](https://github.com/starinc/sdp-v2/actions)

### Workflow Files
- `.github/workflows/test.yml` - Run all tests on PHP 8.3 with MySQL
- `.github/workflows/lint.yml` - PHP code quality checks (Pint, PHPStan)

## 📖 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Claude Code development instructions
- **[CHECKPOINT.md](./CHECKPOINT.md)** - Development progress tracking
- **[LOCAL_SETUP.md](./LOCAL_SETUP.md)** - Complete local setup guide
- **[API Documentation](./starinc-api/ROUTES.md)** - API endpoint reference (coming soon)

## 🏗️ Architecture Overview

### Frontend Architecture
- **Entry Point**: `src/App.jsx` with React Router
- **Layouts**: `RootLayout` (public) and `AdminLayout` (protected)
- **State Management**: AuthContext, CartContext, AppearanceContext
- **API Client**: `src/api/client.js` (Axios instance with interceptors)

### Backend Architecture
- **Authentication**: Laravel Sanctum with Bearer tokens
- **Controllers**: HTTP request handlers in `app/Http/Controllers/Api/`
- **Services**: Business logic in `app/Services/`
- **Models**: Eloquent models in `app/Models/`
- **Middleware**: Authorization checks (EnsureIsAdmin, etc.)

### Database
- **Key Tables**: Users, Orders, OrderItems, Commissions, Tiers, StarcenterNetwork
- **Key Features**:
  - Closure table for MLM hierarchy (StarcenterNetwork)
  - Payment proof management with admin review workflow
  - Commission tracking with multi-level support
  - Tier system with automatic upgrades

## 👥 User Roles

| Role | Capabilities |
|------|--------------|
| **Regular** | Browse products, checkout, single-level commissions, no MOQ |
| **Starcenter** | All regular + multi-level MLM commissions (up to 7 levels), MOQ requirement |
| **Admin** | Full platform control: users, orders, commissions, settings, reporting |

## 💳 Commission System

- **Regular Users**: 1-level commissions from direct referrals
- **Starcenters**: Multi-level commissions from entire downline tree (up to 7 levels)
- **Rates**: Configurable per level via admin settings
- **Status**: pending → paid (admin action)

## 🔐 Security Features

- Bearer token authentication (Sanctum)
- Admin-only endpoints protected via middleware
- Input validation on all API endpoints
- File upload validation (MIME type + size)
- Password hashing with bcrypt
- CORS configured for frontend domain
- Email verification for password reset tokens

## 📧 Email Notifications

The platform queues these emails:
- **OrderConfirmed** - Order successfully placed
- **PaymentApproved** - Payment proof approved by admin
- **PaymentRejected** - Payment proof rejected with reason
- **OrderShipped** - Order shipped with tracking info
- **CommissionDistributed** - Commission credited to account

All emails are queued via database queue for async delivery.

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests: `php artisan test`
4. Run linter: `./vendor/bin/pint`
5. Push to origin and create a Pull Request
6. CI/CD pipeline must pass before merge

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👨‍💼 Support

For issues, feature requests, or questions:
- Create an issue on GitHub
- Contact: support@starinc.com

---

**Last Updated:** 2026-04-20  
**Current Version:** 2.0.0 (Stabilization Phase)  
**Status:** ✅ 82% Production-Ready
