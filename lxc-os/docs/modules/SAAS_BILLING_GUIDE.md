# SaaS Auto-Renewal Billing System

This document provides a comprehensive technical overview of the LearnXChain SaaS-grade auto-renewal billing system.

## 1. Overview
The billing system is designed to handle recurring subscriptions for schools using Razorpay Subscriptions (Mandates). It ensures automated charging, secure webhook processing with idempotency, real-time access enforcement, and automated financial reporting.

## 2. Technology Stack
- **Payment Gateway**: Razorpay (Subscriptions API)
- **Database**: PostgreSQL with Prisma ORM
- **Framework**: Next.js (API Routes)
- **PDF Generation**: Puppeteer
- **Notifications**: MSG91 (WhatsApp/Email)

## 3. Core Database Models
- **`Plan`**: Defines the subscription packages (price, duration, user limits, `razorpayPlanId`).
- **`Subscription`**: Tracks the active status, start/end dates, and links to the school/group.
- **`Payment`**: Logs every transaction attempt, its status, and Razorpay references.
- **`WebhookLog`**: Ensures **Idempotency**. Every Razorpay event is logged here to prevent duplicate processing.
- **`SchoolSubscriptionConfig`**: Stores school-specific billing rules like grace periods and auto-suspension toggles.

## 4. The Subscription Lifecycle

### A. Initial Setup (The Mandate)
1. **Selection**: Admin selects a plan and chooses "Auto-Renew".
2. **Order Creation**: `SubscriptionService.createRazorpayOrder` creates a **Razorpay Subscription ID** instead of a one-time order ID.
3. **Authorization**: The user completes the first payment. Razorpay stores the payment method as a "Mandate" for future charges.
4. **Activation**: On successful payment, the middleware/webhook activates the subscription and sets the initial `endDate`.

### B. Recurring Charges
1. **Renewal Attempt**: On the `endDate`, Razorpay automatically attempts to charge the saved payment method.
2. **Webhook**: Razorpay sends a `subscription.charged` event to our webhook endpoint.
3. **Extension**: Our system verifies the event, logs it for idempotency, creates a new `Payment` record, and extends the `Subscription.endDate` by the plan's duration (e.g., +30 days).

### C. Access Enforcement (The Guard)
The `api-guard.ts` middleware intercepts every API request:
- **Active**: If `Date.now() < endDate`, access is granted.
- **Grace Period**: If `endDate < Date.now() < (endDate + gracePeriodDays)`, access is granted with a "Subscription Expiring" warning.
- **Expired**: If the grace period is exceeded, access is blocked with a `402 Payment Required` error.

## 5. Webhook Handling & Security
Endpoint: `/api/v1/finance/webhook/razorpay`

- **Raw Body Verification**: We use the raw request body for HMAC signature verification to ensure the request strictly comes from Razorpay.
- **Idempotency**: Before processing any event, we check if the `razorpay_event_id` exists in the `WebhookLog`.
- **Event Mapping**: 
  - `subscription.charged`: Extends plan and generates a "PAID" invoice.
  - `payment.failed`: Triggers an immediate "FAILED" status invoice and sends an alert.
  - `invoice.paid`: Secondary confirmation event to ensure payment records stay in sync.

## 6. Smart Invoices & Reminders
- **Dynamic Status**: Invoices automatically show **PAID**, **DUE**, or **FAILED** based on the real-time payment status.
- **Automated Reminders**: A daily cron job (`checkSubscriptions`) sends reminders 7, 3, and 1 day(s) before expiry.
- **Due Documentation**: Every reminder email includes a link to a **"DUE" status invoice** showing the upcoming charge amount.

## 7. Financial Analytics (MRR/ARR)
The Superadmin dashboard tracks:
- **MRR**: Monthly Recurring Revenue (Sum of active monthly plan prices).
- **ARR**: Annual Recurring Revenue (MRR × 12).
- **Churn/Health**: Count of failed vs. successful payments and active vs. expired subscriptions.

## 8. Developer Quick Start
- **Service Layer**: `lib/services/finance/subscription-service.ts`
- **Invoices**: `lib/utils/invoice-utils.ts`
- **Middleware**: `lib/middleware/api-guard.ts`
- **Cron Jobs**: `lib/cron-jobs/subscription-management.ts`

---
*Last Updated: March 2026*
