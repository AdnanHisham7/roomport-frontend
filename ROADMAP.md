# RoomPort — Product Roadmap

This document describes the technical and product evolution of RoomPort over the next 1–3 years. Every entry solves a real problem, has a clear technical path, and is grounded in the current architecture.

---

## Table of Contents

- [Phase 1 — Immediate (1–2 months)](#phase-1--immediate-12-months)
- [Phase 2 — Growth (3–6 months)](#phase-2--growth-36-months)
- [Phase 3 — Scale & Enterprise (6–12 months)](#phase-3--scale--enterprise-612-months)
- [Phase 4 — Long-Term Vision (1–3 years)](#phase-4--long-term-vision-13-years)
- [Architecture Evolution](#architecture-evolution)

---

## Phase 1 — Immediate (1–2 months)

### Automated Test Suite

**Problem:** The codebase has zero automated tests. Every change carries silent regression risk, especially in the billing and agreement signing flows.

**Solution:** Vitest + Supertest for API integration tests covering auth, subscription billing math, upgrade request resolution, and agreement signing. Playwright for the three critical browser flows: builder onboarding, tenant e-signature, and SuperAdmin upgrade approval.

**Technical Considerations:** Co-locate unit tests next to use cases. Seed a test MongoDB instance with factory helpers. CI runs `npm test` on every push.

**Business Impact:** Prevents billing regressions reaching production. Required before any serious enterprise sale.

**Priority:** Critical | **Complexity:** Medium

---

### Background Job Queue

**Problem:** Transactional emails, SMS reminders, and notification writes happen synchronously inside use cases. A slow SMTP server or Twilio timeout blocks the HTTP response and could cause the client to retry, creating duplicate sends.

**Solution:** Replace all fire-and-forget `.catch(err => logger.error(...))` async side-effects with BullMQ jobs backed by the existing Redis instance. One queue per channel: `email`, `sms`, `notification`.

**Technical Considerations:** BullMQ workers run as a separate process (`worker.ts`) alongside the main server. Jobs are idempotent via a `jobId` derived from the entity ID + event type. Dead-letter queue for permanently failed jobs, with a SuperAdmin view.

**Business Impact:** Faster API responses, no duplicate emails on retry, observable failure handling.

**Priority:** Critical | **Complexity:** Medium

---

### `.env.example` Alignment

**Problem:** The existing `.env.example` uses different variable names (`MONGODB_URI`, `SMTP_HOST`) from what the code actually reads (`MONGO_URI`, `EMAIL_HOST`). A new developer following the example will get startup errors.

**Solution:** Regenerate `.env.example` directly from `infrastructure/config/env.ts` as part of a pre-commit hook so they can never drift again.

**Priority:** Critical | **Complexity:** Small

---

### API Rate Limiting on All Routes

**Problem:** Rate limiting currently exists only on auth endpoints. Expense creation, document upload, and tenant creation endpoints are unprotected from abuse.

**Solution:** Apply `express-rate-limit` globally with a tiered strategy: 200 req/15 min for authenticated routes, 30 req/15 min for public routes, 10 req/15 min for auth. Store state in Redis (already available) so limits work correctly across multiple server instances.

**Priority:** High | **Complexity:** Small

---

### Webhook Idempotency

**Problem:** The Stripe webhook handler (`handle-webhook-usecase.ts`) has no idempotency key check. A Stripe retry after a 5xx will create a duplicate subscription.

**Solution:** Store processed `stripe-signature` hashes in Redis with a 24-hour TTL. Check before processing. Return 200 immediately on a duplicate.

**Priority:** Critical | **Complexity:** Small

---

## Phase 2 — Growth (3–6 months)

### Tenant Portal

**Problem:** Tenants have no self-service access. They cannot view their lease, check payment history, or raise a maintenance request — all of this goes through the builder, creating bottlenecks.

**Solution:** A dedicated tenant portal behind a `/tenant` layout. Tenants log in with the credentials they receive on onboarding. Views: current lease, payment history, document vault (their own documents), and a maintenance request form.

**Technical Considerations:** Existing `tenant` role in the auth system. New RTK Query slice. Backend routes already scoped to `tenantId`. Maintenance requests are a new domain: `MaintenanceRequest` entity, repository, use case, and controller.

**Business Impact:** Reduces builder support load. Becomes a sales differentiator vs. manual workflows.

**Priority:** High | **Complexity:** Large

---

### Automated Rent Payment Reminders

**Problem:** The `rent-reminder.cron.ts` exists but has limited targeting logic. Builders report that tenants forget rent is due and need a consistent nudge.

**Solution:** A configurable reminder schedule per builder (e.g. 7 days before, 3 days before, on the due date, 3 days after). Each reminder logs to the `ActivityLog` so the builder can see it was sent. Tenants can unsubscribe from SMS but not email.

**Technical Considerations:** Cron triggers a BullMQ job (from Phase 1) for each due-soon tenant. Templates stored in the database so builders can customise the wording. Rate limit per tenant per day to prevent spam on misconfigured schedules.

**Business Impact:** Reduces overdue payment rates. Directly increases builder retention.

**Priority:** High | **Complexity:** Medium

---

### Online Rent Payment (Razorpay)

**Problem:** Builders currently collect rent offline. There is no way for tenants to pay digitally through the platform, which limits tracking accuracy and causes reconciliation errors.

**Solution:** Tenant portal payment flow backed by Razorpay (dominant in India). On success, the webhook auto-marks the period as paid and sends a receipt. Builders see real-time payment status.

**Technical Considerations:** New `RazorpayService` alongside the existing `StripeService`. Razorpay webhook signature verification. `PaymentRecord` already has `method` and `paidAt` fields — reuse them. Idempotency key per period to prevent double-marking.

**Business Impact:** Unlocks a platform transaction fee revenue model (0.5–1% per payment). Strong retention: once builders have digital payment history, they will not leave.

**Priority:** High | **Complexity:** Large

---

### Rich Analytics Dashboard

**Problem:** The current dashboard shows occupancy rate and recent transactions, but builders need trend data to make decisions: which building has the highest vacancy, where expenses are growing, when rent collection peaks.

**Solution:** Expand the analytics use case with pre-computed monthly rollups stored in a `BuilderAnalyticsSnapshot` collection (updated nightly by a cron job). Frontend charts: revenue trend (12 months), occupancy trend (12 months), expense breakdown by category, top 5 buildings by revenue.

**Technical Considerations:** Pre-computation avoids expensive real-time aggregations as the dataset grows. RTK Query polling set to `0` (manual refresh) for the dashboard — no need for live data on historical charts. Recharts is already installed.

**Business Impact:** Builders using data to improve operations become stickier. Adds a "Pro analytics" tier justification.

**Priority:** Medium | **Complexity:** Medium

---

### Maintenance Request Management

**Problem:** There is no structured way to log, assign, and track property maintenance. Builders manage this on WhatsApp, which creates no audit trail and no accountability.

**Solution:** `MaintenanceRequest` entity with status (`open`, `in_progress`, `resolved`), priority (`low`, `medium`, `high`, `urgent`), photo attachments, and an optional assignee (manager role). Builders see an open-requests board. Tenants submit through the tenant portal.

**Technical Considerations:** Clean Architecture addition: entity → repository → use case → controller → router. Photo uploads go through existing Cloudinary service. Notifications to the builder on new request, to the tenant on status change.

**Priority:** Medium | **Complexity:** Large

---

## Phase 3 — Scale & Enterprise (6–12 months)

### Multi-Manager Role with Permission Scoping

**Problem:** A builder with multiple buildings assigns one manager per building today, but the `manager` role can see all buildings under the builder. Larger operators need per-building access control.

**Solution:** A `BuildingPermission` join entity linking a `userId` to a `buildingId` with a scope (`read`, `write`, `manage`). The subscription gate and all repository queries check this table when the caller is `manager`. SuperAdmin and builder roles bypass it.

**Technical Considerations:** This is an additive change — existing managers get blanket `manage` permission on all buildings at migration time. New managers are scoped. The permission check lives in a reusable `assertBuildingAccess` helper already partially in place across controllers.

**Business Impact:** Unlocks the enterprise buyer segment (property management companies with 10+ buildings and dedicated per-building staff).

**Priority:** High | **Complexity:** Large

---

### Bulk Operations

**Problem:** Builders with 50+ units spend significant time on repetitive actions: bulk rent reminders, bulk status updates on vacant units, bulk document expiry checks.

**Solution:** A `BulkOperationsController` backed by BullMQ (from Phase 1). Operations: bulk mark-paid for a building's period, bulk vacancy status update, bulk agreement expiry export. Each bulk job is async — the builder gets a notification when it completes.

**Technical Considerations:** Jobs run in the background queue with progress events via SSE or WebSocket. Idempotency keys prevent double-execution on retry. Rate-limited to one bulk job per builder at a time to protect MongoDB.

**Priority:** Medium | **Complexity:** Medium

---

### Audit Trail and Compliance Exports

**Problem:** In India, rental agreements and rent receipts are legally significant documents. Builders need to export a certified record of all payments and agreements for tax purposes (ITR, GST).

**Solution:** A `ComplianceExport` use case that generates a structured PDF report (or CSV) of all payment records, agreements, and tenants for a financial year, per building. Reports are signed with a platform certificate and stored in Cloudinary with a tamper-evident hash.

**Technical Considerations:** PDF generation via Puppeteer (server-side HTML-to-PDF). Hash stored in `ComplianceExportRecord` alongside the Cloudinary URL. Builder can verify the hash at any time.

**Business Impact:** Directly addresses a legal pain point. Becomes a key enterprise sales argument.

**Priority:** High | **Complexity:** Large

---

### Real-Time Notifications via WebSockets

**Problem:** The notification system is polling-based. SuperAdmin sees upgrade requests only on page load. Builders miss urgent maintenance alerts.

**Solution:** Socket.IO room per `userId` (established on login). The notification use case emits to the room after creating the DB record. The frontend Redux store receives the socket event and appends to the notification list without a full refetch.

**Technical Considerations:** Socket.IO with Redis adapter (already available) for multi-instance support. Fall back to polling if the WebSocket connection drops. The existing `NotificationModel` is unchanged — sockets are a delivery channel, not a new storage mechanism.

**Priority:** Medium | **Complexity:** Medium

---

### White-Label Builder Branding

**Problem:** Larger property management companies want to present the platform under their own brand — their logo, colours, and domain — when tenants log in to sign agreements or view their lease.

**Solution:** A `BuilderBranding` entity: logo URL, primary colour, company name, custom domain (optional). The agreement signing flow and tenant portal read from this entity for the current builder. Custom domain support via a reverse-proxy mapping stored in the platform config.

**Technical Considerations:** Branding config served via a public `/public/branding/:builderId` endpoint. Frontend reads it on the public and tenant portal layouts. Custom domain SSL via Let's Encrypt automation.

**Business Impact:** Unlocks premium tier pricing. Directly meets enterprise RFP requirements.

**Priority:** Medium | **Complexity:** Large

---

## Phase 4 — Long-Term Vision (1–3 years)

### AI Lease Assistant

**Problem:** Drafting a lease agreement is time-consuming and error-prone. Builders copy from old templates and miss clauses. Tenants sign without understanding the terms.

**Solution:** An AI-assisted agreement editor. The builder describes the key terms (rent, duration, rules) in plain language. The assistant generates a structured agreement using a fine-tuned prompt over the builder's previous agreements and a library of legally reviewed clause templates for Indian residential and commercial tenancies. A plain-language summary is also generated for the tenant before signing.

**Technical Considerations:** Claude API (Anthropic) via server-side proxy — the API key never leaves the backend. Agreement generation is async (BullMQ job). The generated text goes into the existing draft review flow before the builder sends it for signing.

**Business Impact:** Reduces agreement creation from 20 minutes to 2 minutes. Reduces legal disputes from poorly-drafted clauses.

**Priority:** High | **Complexity:** Large

---

### Predictive Vacancy Intelligence

**Problem:** Builders cannot predict when a unit will become vacant until the tenant gives notice. Vacancy costs money — every empty day is lost rent.

**Solution:** A vacancy prediction model trained on the builder's historical data: agreement end dates, typical renewal rates by building/unit type, seasonal patterns. The dashboard surfaces "likely to vacate in 60 days" alerts so the builder can start marketing the unit in advance.

**Technical Considerations:** Start with a rule-based heuristic (agreement ending in N days + no renewal signal). Graduate to a simple ML model (logistic regression on Vertex AI or SageMaker) once sufficient data exists (>500 agreement cycles). Prediction results stored nightly in `VacancyPrediction` collection.

**Business Impact:** Reduces average vacancy period. Directly increases builder revenue. Differentiates the platform from generic property software.

**Priority:** Medium | **Complexity:** Enterprise

---

### Marketplace for Verified Vendors

**Problem:** When a maintenance request comes in, the builder needs a plumber, electrician, or painter. There is currently no structured way to find and hire verified vendors.

**Solution:** A vendor marketplace within the platform. Vendors register and are verified by SuperAdmin. Builders browse by category and pin code. Maintenance requests can be assigned directly to a vendor, who gets an SMS/email with job details. Payment (if any) flows through the platform.

**Technical Considerations:** New `Vendor` entity and portal. Vendor rating stored per job completion. Search backed by a MongoDB geospatial index (`$near`) on vendor location. A thin transaction fee on vendor payments creates an additional revenue stream.

**Business Impact:** Deep platform lock-in. Vendors become a distribution channel for new builder sign-ups.

**Priority:** Medium | **Complexity:** Enterprise

---

### Mobile Applications (React Native)

**Problem:** Builders and managers visit properties daily. They need to log an expense, mark a rent payment, or respond to a maintenance request from their phone — not a laptop.

**Solution:** React Native apps for iOS and Android sharing the same RTK Query API layer as the web frontend. Core flows for mobile: rent payment marking, expense logging, maintenance request status updates, and notification handling (push via FCM).

**Technical Considerations:** Shared TypeScript types package between web and mobile. Push notifications via Expo Notifications + FCM. Biometric login (FaceID / fingerprint) using `expo-local-authentication`.

**Business Impact:** Significantly increases daily active usage. Reduces churn — builders who use the mobile app daily have much higher retention.

**Priority:** High | **Complexity:** Enterprise

---

## Architecture Evolution

### Database

**Now:** Single MongoDB Atlas cluster, all collections in one database.

**Phase 2:** Read replicas for analytics queries. Separate `roomport-analytics` database for pre-computed snapshots — keeps operational queries fast.

**Phase 3:** Consider time-series collections (MongoDB native) for payment history and activity logs to improve range query performance as data volumes grow.

**Phase 4:** Evaluate sharding by `ownerId` (builder ID) if per-builder data volumes exceed 10GB. Each builder's data becomes a natural shard key.

---

### Caching

**Now:** Redis used only for OTP storage.

**Phase 2:** Cache platform settings (`PlatformSetting` document) in Redis with a 5-minute TTL — it is read on every subscription operation and never changes in real-time.

**Phase 3:** Cache builder dashboard metrics (pre-computed nightly). Cache public building listings (rarely updated, frequently read).

**Phase 4:** Consider a CDN (Cloudflare) in front of the API for public routes (`/api/v1/public/*`).

---

### Event-Driven Architecture

**Now:** Direct in-process calls between use cases for side effects (notifications, emails).

**Phase 2:** BullMQ queues decouple email/SMS from the request path. Fire events, not function calls.

**Phase 3:** An internal event bus (EventEmitter wrapped in a typed `DomainEventEmitter`) lets use cases emit domain events (`TenantCreated`, `RentPaid`, `AgreementSigned`) and lets listeners (notification, activity log, analytics) react independently. No use case needs to know who is listening.

**Phase 4:** For multi-service scenarios, evaluate a lightweight message broker (Redis Streams or AWS SQS) to decouple services if the platform is split into microservices.

---

### Infrastructure and DevOps

**Now:** No CI/CD, no containerisation, manual deployment.

**Phase 1:** GitHub Actions: lint → type-check → test on every pull request. Block merges on failure.

**Phase 2:** Docker Compose for local development (API + MongoDB + Redis in one `docker-compose up`). Dockerfile for the backend. Vercel for the frontend.

**Phase 3:** Kubernetes (AWS EKS or GKE) for the backend. Horizontal pod autoscaling on CPU. Separate deployment for the BullMQ worker process. Managed MongoDB Atlas and Redis (Upstash or AWS ElastiCache).

**Phase 4:** Multi-region deployment for low latency in non-Indian markets. Active-passive failover. RTO < 15 minutes, RPO < 1 minute (MongoDB Atlas continuous backup).

---

### Observability

**Now:** Winston logs to stdout. No metrics, no tracing.

**Phase 2:** Structured JSON logs shipped to a log aggregator (Datadog, Grafana Loki, or Axiom). Basic dashboards: request rate, error rate, response time per route.

**Phase 3:** OpenTelemetry tracing across the full request path (HTTP → use case → repository → MongoDB). Distributed trace context propagated into BullMQ jobs. Alerting on error rate > 1% or p99 latency > 500ms.

**Phase 4:** Custom business metrics (new subscriptions per day, upgrade conversions, trial-to-paid rate) published to a metrics store and displayed on a founder dashboard.

---

### Security Hardening

**Phase 2:** Content Security Policy headers via Helmet. Dependency scanning (Dependabot or Snyk) on CI.

**Phase 3:** SOC 2 Type 1 readiness: access logging on all data reads, encryption at rest (MongoDB Atlas native), field-level encryption for tenant PII (Aadhaar numbers, PAN).

**Phase 4:** Penetration test before enterprise sales. VAPT report as a sales artefact. ISO 27001 roadmap for institutional buyers.
