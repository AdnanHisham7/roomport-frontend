# RoomPort — Rental Property Management Platform

RoomPort is a multi-tenant SaaS platform for rental property builders and managers. It handles the full lifecycle of a rental property: buildings, floors, units, tenants, lease agreements, rent collection, documents, and analytics — all behind a subscription gate with a dedicated SuperAdmin control plane.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [API Overview](#api-overview)
- [Design Decisions](#design-decisions)
- [Security](#security)
- [Future Improvements](#future-improvements)

---

## Overview

**Problem:** Property builders managing multiple buildings juggle spreadsheets, WhatsApp, and manual receipts. There is no single system that ties together tenant onboarding, rent tracking, digital lease signing, and expense management.

**Solution:** RoomPort gives each builder an isolated workspace scoped to their account, with subscription-gated access, digital agreement signing, and a real-time dashboard. A SuperAdmin layer sits above all tenants for platform governance, billing management, and builder onboarding.

**Who it is for:**
- Property builders managing residential and commercial buildings
- Property managers acting under a builder account
- Platform operators (SuperAdmin)

---

## Features

### Authentication
- Email/password registration with OTP-based email verification
- JWT access + refresh token pair with silent refresh and retry logic in RTK Query
- Role-based access: `super_admin`, `admin` (builder), `manager`, `tenant`
- Forgot password and OTP-verified reset flow
- Rate-limited auth endpoints (10 req / 15 min)

### Builder Portal
- Multi-building management with floor and unit hierarchy
- Tenant onboarding with optional rent agreement creation at signup
- Digital lease agreements with OTP-based tenant e-signature flow
- Rent payment records per billing period with overdue detection
- Expense tracker with category breakdown, date-range and period summaries
- Document vault per building / unit / tenant
- Activity log for all significant events
- Upgrade and renewal request submission to SuperAdmin
- Dashboard with occupancy rate, pending payments, expiring agreements, and revenue charts

### SuperAdmin Control Plane
- Builder management: view all builders, their subscriptions, buildings, and tenant counts
- Subscription management: create, edit, and manually mark billing periods as paid
- Upgrade request resolution with server-computed pro-rated top-up amounts
- Demo request pipeline with one-click builder registration and welcome email
- Platform settings: per-unit and per-building pricing for monthly and yearly cycles
- Notification centre for upgrade requests and other platform events

### Subscription & Billing
- Monthly and yearly billing cycles
- Subscription gate middleware blocking builder access on expiry
- Pro-rated billing for mid-cycle upgrades (computed server-side — single source of truth)
- Upgrade request preview endpoint so the admin UI always shows what will actually be charged

### Public / Marketplace
- Public building listings with floor plan UI
- Room detail pages
- Inquiry submission from prospective tenants
- Demo / get-started form

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Redux Toolkit + RTK Query | State management and API layer |
| React Hook Form + Zod | Form validation |
| Framer Motion | Animations |
| Recharts | Analytics charts |
| Lucide React | Icons |
| Sonner | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server |
| TypeScript (strict) | Type safety |
| MongoDB + Mongoose | Database |
| Zod | Request validation |
| Winston | Structured logging |
| JWT | Authentication |
| Cloudinary | Image and document storage |
| Nodemailer (SMTP) | Transactional email |
| Twilio | SMS rent reminders |
| Stripe | Payment processing |
| Redis | OTP storage |
| node-cron | Scheduled rent reminders |

---

## Architecture

### Backend — Clean Architecture

```
Domain Layer        → Entities and repository interfaces (no framework dependencies)
Application Layer   → Use cases and DTOs (pure business logic)
Infrastructure Layer→ Mongoose models, repositories, external services, DI container
Interface Layer     → Express controllers, routers, middleware, Zod validators
```

Dependency direction is strictly inward: infrastructure depends on application which depends on domain. Use cases receive all dependencies through constructor injection via a central DI container.

### Frontend — Feature-Layered React

```
store/api/     → RTK Query endpoint slices, one file per domain
pages/         → Route-level page components (builder/, superadmin/, public/)
components/    → Reusable UI (ui/) and domain-specific (tenant/, building/, agreement/)
hooks/         → Cross-cutting custom hooks
utils/         → Pure helpers (format, cn)
types/         → Shared TypeScript interfaces
routes/        → Route definitions and auth guards
```

---

## Folder Structure

```
rental-platform/
├── backend/
│   ├── src/
│   │   ├── domain/
│   │   │   ├── entities/          # TypeScript interfaces for all domain objects
│   │   │   └── repository/        # Repository interfaces (ports)
│   │   ├── application/
│   │   │   ├── usecase/           # One class per domain (auth, building, tenant, subscription…)
│   │   │   ├── dtos/              # Input/output shapes for use cases
│   │   │   └── interface/         # Use case interfaces
│   │   ├── infrastructure/
│   │   │   ├── db/model/          # Mongoose schemas and models
│   │   │   ├── repository/        # Mongoose repository implementations
│   │   │   ├── services/          # Cloudinary, email, SMS, Stripe, Redis, JWT
│   │   │   ├── config/            # db.ts, env.ts (single process.env access point)
│   │   │   ├── cron/              # Scheduled jobs
│   │   │   ├── DIContainer/       # Wires all dependencies
│   │   │   └── middleware/        # Subscription gate
│   │   ├── interface/
│   │   │   ├── controllers/       # Express request handlers (no business logic)
│   │   │   ├── routers/           # Route definitions with validate() middleware
│   │   │   ├── middleware/        # auth, error handler, upload, validate
│   │   │   └── validators/        # Zod schemas (auth, tenant, building, domain)
│   │   └── shared/
│   │       ├── error/             # AppError hierarchy
│   │       ├── enums/             # Role and OTP purpose enums
│   │       └── logger/            # Winston logger
│   ├── .env.example
│   ├── eslint.config.mjs
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── store/api/             # RTK Query slices
    │   ├── pages/
    │   │   ├── builder/           # Builder portal pages
    │   │   ├── superadmin/        # Admin control plane pages
    │   │   └── public/            # Public marketplace pages
    │   ├── components/
    │   │   ├── ui/                # Design-system primitives
    │   │   ├── tenant/            # Tenant-specific modals and forms
    │   │   ├── building/          # Building-specific components
    │   │   └── agreement/         # Agreement signing UI
    │   ├── routes/                # Route config and guards
    │   ├── hooks/                 # useAuth and cross-cutting hooks
    │   ├── utils/                 # format, cn
    │   └── types/                 # Shared interfaces
    ├── tsconfig.app.json
    └── eslint.config.js
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- A Cloudinary account
- (Optional) Stripe, Twilio, SMTP credentials

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in required variables (see Environment Variables below)
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Set VITE_API_URL to your backend base URL
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | No | `development` or `production` |
| `PORT` | No | HTTP port (default: 5000) |
| `MONGO_URI` | **Yes** | MongoDB connection string |
| `JWT_ACCESS_SECRET` | **Yes** | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | **Yes** | Secret for signing refresh tokens |
| `JWT_AGREEMENT_SECRET` | **Yes** | Secret for signing agreement signing tokens |
| `JWT_ACCESS_EXPIRES_IN` | No | Access token TTL (default: 15m) |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token TTL (default: 7d) |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | **Yes** | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | **Yes** | Cloudinary API secret |
| `EMAIL_HOST` | No | SMTP host (default: smtp.gmail.com) |
| `EMAIL_PORT` | No | SMTP port (default: 587) |
| `EMAIL_USER` | No | SMTP username |
| `EMAIL_PASS` | No | SMTP password |
| `EMAIL_FROM` | No | From address (default: no-reply@roomport.in) |
| `TWILIO_ACCOUNT_SID` | No | Twilio SID — for SMS reminders |
| `TWILIO_AUTH_TOKEN` | No | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | No | Twilio sender number |
| `STRIPE_SECRET_KEY` | No | Stripe secret key — for builder billing |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `STRIPE_PAYMENT_SUCCESS_URL` | No | Redirect after successful payment |
| `STRIPE_PAYMENT_CANCEL_URL` | No | Redirect after cancelled payment |
| `REDIS_URL` | No | Redis connection URL (default: redis://localhost:6379) |
| `APP_URL` | No | Frontend origin for CORS (default: http://localhost:3000) |
| `FRONTEND_URL` | No | Used in email links |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | **Yes** | Backend base URL, e.g. `http://localhost:5000/api/v1` |

---

## Scripts

### Backend

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with nodemon |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled production server |
| `npm run lint` | Run ESLint (zero warnings policy) |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run type-check` | Run `tsc --noEmit` |

### Frontend

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run `tsc --noEmit` |

---

## API Overview

Base path: `/api/v1`

| Module | Path | Description |
|---|---|---|
| Auth | `/auth` | Register, login, OTP, email verification, password reset, refresh |
| Users | `/users` | Profile management |
| Buildings | `/buildings` | CRUD for buildings and nested floors |
| Units | `/units` | Unit management within floors |
| Tenants | `/tenants` | Tenant onboarding, transfers, lease history |
| Agreements | `/agreements` | Digital lease creation and OTP e-signature flow |
| Expenses | `/expenses` | Expense records, tracker summary, date-range reports |
| Documents | `/documents` | Document vault upload and retrieval |
| Payment Records | `/payment-records` | Rent payment tracking per period |
| Notifications | `/notifications` | In-app notification management |
| Activity Logs | `/activity-logs` | Audit trail for all significant events |
| Analytics | `/analytics` | Builder dashboard metrics |
| Subscriptions | `/subscriptions` | Demo booking, builder subscriptions, upgrade requests |
| Inquiries | `/inquiries` | Prospective tenant inquiry management |
| Uploads | `/uploads` | Cloudinary image upload |
| Public | `/public` | Public building and room listings |
| Super Admin | `/super-admin` | Builder management, subscription admin, platform settings |
| Payments | `/payments` | Stripe checkout and webhook handler |

---

## Design Decisions

**Single source of truth for billing math.** Pro-rated upgrade amounts are computed exclusively on the backend (`previewUpgrade` use case method, which uses the same `computeFullAmount`/`computeProRatedAmount` helpers as the actual `resolveUpgradeRequest` flow). The admin UI calls the preview endpoint; it never recomputes independently. This eliminates any possibility of the modal showing a different number from what is actually charged.

**Zod validation at the router boundary.** All 20 controllers are free of manual `if (!field)` checks. A single `validate(schema, part)` middleware validates and coerces the request before the controller runs, so controllers only contain business dispatch. Validation errors return the same `{ message, suggestion }` shape as `AppError`, handled by the central `globalErrorHandler`.

**Centralised `env.ts` config.** All `process.env` access is consolidated into `infrastructure/config/env.ts`. Missing required variables throw at startup — misconfiguration is caught immediately rather than as a runtime error deep in a service call.

**Structured logging with Winston.** All `console.*` calls are replaced with a `logger` instance that emits coloured human-readable output in development and structured JSON in production, ready to ship to any log aggregator.

**Multi-tenant data isolation.** Every repository query scopes results to the authenticated builder's `userId` unless the caller is `super_admin`. The subscription gate middleware enforces this at the route level.

---

## Security

- JWT access tokens (short-lived) + refresh tokens (long-lived, rotated on use)
- OTP-based email verification and password reset (Redis TTL-backed)
- Zod validation on all mutating endpoints — invalid input never reaches business logic
- Helmet for HTTP security headers
- CORS restricted to configured frontend origin
- Rate limiting on all auth endpoints (10 req / 15 min)
- Role-based access control on every protected route
- Subscription gate middleware blocking expired builder accounts
- Agreement signing uses a separate short-lived JWT issued per signing session

---

## Future Improvements

See [ROADMAP.md](./ROADMAP.md) for the full product roadmap.

Quick wins on the backlog:
- End-to-end test suite (Vitest + Supertest for API, Playwright for critical flows)
- Pagination on analytics queries for large accounts
- Background job queue (BullMQ) to decouple email/SMS from request paths
- Admin impersonation for debugging builder accounts
