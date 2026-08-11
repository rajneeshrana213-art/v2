## Finance Engine – Technical Overview

This document explains how the **finance engine** in LearnXChain works, in two parts:

- **SaaS subscription billing for schools** (Razorpay, LearnXChain plans)  
- **School‑side fee engine** (student fees, dues, concessions, receipts, ledger, notifications) – this is the core “finance engine for school”.

---

## 1. Core responsibilities

- **A. Plan subscriptions (SaaS plans – platform billing)**
  - Implements the paid plan flow for schools using Razorpay.
  - Core logic lives in `SubscriptionService` (`lib/services/finance/subscription-service.ts`).

- **B. Feature‑level billing (platform add‑ons)**
  - Allows schools to pay to enable individual features (pay‑per‑feature model).
  - Flows are implemented in `create-feature-order` and `verify-payment` APIs.

- **C. Invoices for subscriptions (platform billing)**
  - Generates and stores GST‑compliant invoices as PDFs.
  - Utilities in `lib/utils/invoice-utils.ts`, HTML templates in `templates/invoice-templates`, and invoice download via `SubscriptionService.getPlanInvoice`.

For subscription‑specific details, also see `docs/subscription-system.md`.

---

## 1.1. School Fee Engine – Core Modules (Non‑subscription)

This is the **finance engine for schools** (student fees, receipts, ledgers), separate from the SaaS subscription.

- **Fee structure & student plans**
  - `FeeStructureService` (`lib/services/finance/FeeStructureService.ts`)
    - Create / list / update / delete fee structures per school + academic year, optionally per class.
    - Prevents deleting a fee structure if it is already assigned to any `studentFeePlan`.
  - `studentFeePlan` model (Prisma) ties fee structures to individual students with per‑fee‑head amounts.

- **Concessions / waivers**
  - `ConcessionService` (`lib/services/finance/ConcessionService.ts`)
    - Apply concessions as:
      - `FIXED_AMOUNT`, `PERCENTAGE`, or `FULL_WAIVER`.
      - Either globally to the whole plan or to specific fee heads.
    - Supports approval workflow (`PENDING` → `APPROVED`) with approver tracking.
    - `calculateEffectiveFee` computes fee after applying all approved concessions, used before generating demands.

- **Fee demand, ledger & accounting**
  - `LedgerPostingService` (`lib/services/finance/LedgerPostingService.ts`)
    - Generic **double‑entry ledger** engine:
      - Validates accounts (same school + academic year).
      - Ensures financial period is open (not locked).
      - Enforces `debit == credit`.
      - Writes into `financeLedger` with `transactionGroupId`, `transactionType`, `referenceTable`, `referenceId`.
  - Demand generation (recurring/monthly fee posting)
    - Currently partially wired; monthly cron in `lib/cron-jobs/finance-notifications.ts` references a missing `DemandCronService`.
    - Core idea: create **DEMAND_GENERATION** ledger entries (Debit `STUDENT_RECEIVABLE`, Credit fee head revenue accounts).

- **Payment collection, settlement & reversal**
  - `PaymentSettlementService` (`lib/services/finance/PaymentSettlementService.ts`)
    - Settles a payment amount against outstanding dues **by fee‑head priority**.
    - Uses system accounts:
      - `STUDENT_RECEIVABLE`, `CASH_IN_HAND`, `BANK_ACCOUNT`, `STUDENT_ADVANCE`.
    - Flow:
      - Compute outstanding dues per fee head (from `financeLedger` + fee plan).
      - Allocate payment across fee heads.
      - Post ledger:
        - Debit cash/bank, Credit `STUDENT_RECEIVABLE`.
        - If there is an excess, Debit cash/bank, Credit `STUDENT_ADVANCE`.
    - Provides helpers:
      - `getStudentBalance` (receivable, advance, net balance, collected).
      - `getPayments`, `getPaymentById`, `getCollections` (date‑range collections report).
  - `ReceiptService` (`lib/services/finance/ReceiptService.ts`)
    - Generates **PDF fee receipts** (College copy + Student copy) via `puppeteer`.
    - Uploads receipt, saves `receiptUrl` and `receiptNumber` on `Payment`.
    - Can send WhatsApp receipt notifications via `WhatsAppNotificationService`.
  - `ReversalService` (`lib/services/finance/ReversalService.ts`)
    - Reverses a payment:
      - Validates it isn’t already reversed.
      - Finds all related ledger entries (linked to `Payment`).
      - Posts opposite entries as `REVERSAL` via `LedgerPostingService`.
      - Marks `Payment.status = REFUNDED` and adjusts description.
      - Returns new balance via `PaymentSettlementService.getStudentBalance`.

- **Ad‑hoc invoices (non‑recurring charges)**
  - `AdHocInvoiceService` (`lib/services/finance/AdHocInvoiceService.ts`)
    - Creates **one‑off invoices** for:
      - A specific student (debit `STUDENT_RECEIVABLE`).
      - Or school‑level sales (debit `CASH_IN_HAND`).
    - Uses/creates `ADHOC_REVENUE` account as income.
    - Posts `DEMAND_GENERATION` or immediate `PAYMENT_COLLECTION` ledger entries.
    - Generates a simple invoice number like `INV-YYYY-000001` (stored as ledger description).

- **Late fees**
  - `LateFeeService` (`lib/services/finance/LateFeeService.ts`)
    - Calculates late fees based on:
      - Days from due date.
      - Configured `LateFeeRule[]` (fixed amount and/or percentage).
    - `applyLateFee`:
      - Ensures or creates a “Late Fee” fee head and revenue account.
      - Posts additional `DEMAND_GENERATION` ledger: Debit `STUDENT_RECEIVABLE`, Credit late‑fee revenue.

- **Notifications & WhatsApp integration (for school fees)**
  - `WhatsAppNotificationService` (`lib/services/finance/WhatsAppNotificationService.ts`)
    - Sends:
      - Fee due reminders (single + bulk).
      - Payment received confirmations.
      - Overdue alerts.
      - Cheque clearance and cheque bounce notifications.
      - Receipt links and payment links (for online payments if integrated).
    - Uses MSG91 WhatsApp + SMS APIs with per‑school templates.
  - API: `POST /api/v1/finance/notifications/send-dues`
    - Single or bulk dues reminders by calling `WhatsAppNotificationService`.
  - Cron in `lib/cron-jobs/finance-notifications.ts`
    - Daily fee‑due reminders (7 days before due).
    - Weekly overdue alerts (30+ days overdue).

- **School fee dashboard & reports**
  - `DashboardOptimizationService` (`lib/services/finance/DashboardOptimizationService.ts`)
    - Optimized aggregations:
      - Per‑student balances.
      - Summary metrics (total outstanding, total demand, total paid, collection rate).
      - Aging buckets (0–30, 31–60, 61–90, 90+).
      - Class‑wise receivables and defaulter lists.
  - API endpoints under `pages/api/v1/finance/reports/*`
    - `collections`, `outstanding-summary`, `class-receivables`, `aging`, `defaulters` – use the above services.

---

---

## 2. Payment gateway & flows (Platform Billing – Subscriptions)

- **Payment gateway support**
  - Currently **Razorpay** is the only integrated online payment gateway.
  - Configuration depends on `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` environment variables.

- **Plan subscription flow (Razorpay Checkout)**
  - **Create order**
    - API: `POST /api/v1/finance/subscription/create-order`
    - Delegates to `SubscriptionService.createRazorpayOrder`.
    - Steps:
      - Loads `plan` by `planId` and validates optional `couponCode`.
      - Computes base amount and GST (18%), including extra‑user charges for `MODEL_B` via `calculateExtraUserCharge`.
      - If `totalAmount <= 0`, skips Razorpay and directly:
        - Creates a `Payment` with `COMPLETED` status and amount `0`.
        - Creates or updates the active `subscription` row.
        - Optionally increments coupon usage and calls `createPlanInvoice`.
      - Otherwise:
        - Creates a Razorpay order (`razorpayInstance.orders.create`).
        - Stores a `Payment` record with `PENDING` status linked to `schoolId` and `planId`.
  - **Verify payment**
    - API: `POST /api/v1/finance/subscription/verify-payment`
    - For plan payments (no `featureKey` in body), delegates to `SubscriptionService.verifyRazorpayPayment`.
    - Steps:
      - Recomputes the Razorpay HMAC signature and rejects if invalid.
      - Fetches Razorpay payment details, reads `method`, and marks local `Payment` as `COMPLETED`.
      - Re‑loads plan and optional coupon; re‑applies the same discount rules used at order creation.
      - Either **updates** the current active `subscription` or **creates** a new one, with:
        - New `startDate` = now, `endDate` = now + plan duration (or trial days) × billing period.
        - `orderId`, `receipt`, `status = ACTIVE`, `isActive = true`, optional `userLimit`.
      - Increments coupon usage and calls `createPlanInvoice(subscription.id)` to generate & email a PDF invoice.

- **Feature activation flow (Razorpay Checkout)**
  - **Create feature order**
    - API: `POST /api/v1/finance/subscription/create-feature-order`
    - Validates `schoolId`, `featureKey`, and positive `amount`.
    - Computes 18% GST, creates Razorpay order, and writes a `Payment` row with `PENDING` status and descriptive `description`.
  - **Verify feature payment**
    - Same `verify-payment` API, but with `featureKey` present in the body.
    - On success:
      - Updates the `Payment` to `COMPLETED` and stores payment metadata.
      - Upserts `SchoolFeatureConfig` for that `schoolId` + `featureKey` with `status = ENABLED`.

- **Webhooks**
  - `SubscriptionService.handleWebhook` verifies Razorpay webhook signatures and currently:
    - Marks *failed* payments (`payment.failed`) as `FAILED` in the local `Payment` table.
    - Provides scaffolding for Razorpay subscription events:
      - `subscription.charged`: creates a new `Payment` and extends `subscription.endDate`.
      - `subscription.completed`: turns off `isAutoRenewEnabled`.
  - Auto‑renew via Razorpay Subscriptions is **partially implemented** at service level, but not fully wired from UI / controllers.

---

## 3. Mid‑session / mid‑cycle behaviour (Subscriptions)

- **Plan changes while an active subscription exists**
  - On successful payment, `SubscriptionService.verifyRazorpayPayment`:
    - Looks up the **current active subscription** for the school (`isActive = true` and `endDate >= now`).
    - If one exists, it **updates that same row** with a fresh `startDate`, `endDate`, `planId`, and payment info.
  - This effectively “resets” the subscription term starting from the new payment date, using the new plan’s duration.
  - **There is no explicit proration** of unused time from the old plan; the old remaining period is effectively overwritten.

- **Mid‑session feature activations**
  - Feature purchases are independent of plan cycles.
  - A feature can be bought at any time; `SchoolFeatureConfig` is updated with `activatedOn` = now.
  - Pricing logic for feature renewals over time is currently simple (one‑time activation payment per call).

- **Auto‑renew / recurring charges**
  - The primary live flow is still **manual renewal** triggered by a user through Razorpay Checkout.
  - `enableAutoRenewForSubscription` and webhook scaffolding exist, but:
    - Razorpay subscription objects need to be created in controllers / UI.
    - The system does not yet auto‑create Razorpay orders on expiry in a fully automated way.

In summary: **mid‑session plan changes are supported**, but they behave like a “start new term now” action, without proration; feature activations are fully mid‑session capable.

---

## 4. Invoices & billing history (Subscriptions)

- **Invoice generation (`createPlanInvoice`)**
  - File: `lib/utils/invoice-utils.ts`
  - Steps:
    - Ensures a unique `invoiceNumber` using `generateInvoiceNumber(schoolId)` and the `invoiceCounter` table.
    - Computes GST breakup (CGST+SGST vs IGST) based on the school’s state using `calculateGstBreakup`.
    - Derives base vs extra‑user charges (for `MODEL_B` / extra seats) via `calculateExtraUserCharge`.
    - Builds invoice structures:
      - `seller` = LearnXChain GST profile + logo.
      - `buyer` = school details (address, GSTIN, contact).
      - `lineItems` = plan subscription and optional “Extra User Seats” line.
      - `taxSummary` and `amountInWords`.
    - Renders HTML with `generatePlanInvoiceHtml` and uses `puppeteer` to create a PDF.
    - Uploads the PDF via `uploadFile` and stores `invoiceUrl` on the `Payment` row.
    - Emails the invoice PDF to the school owner using `sendInvoicePdfEmail`.

- **Invoice download**
  - API: `GET /api/v1/finance/invoice/plan/[subscriptionId]`
  - Uses `SubscriptionService.getPlanInvoice` to:
    - Check access control: only the school owner or superadmin can download.
    - Fetch an existing invoice from `invoiceUrl` if present.
    - If missing, regenerate via `createPlanInvoice` and then fetch.
    - Stream the PDF buffer back with proper `Content-Type` and `Content-Disposition`.

- **Billing history listing**
  - API: `GET /api/v1/superadmin/subscription-control/[schoolId]/invoices`
  - Returns a transformed list of `Payment` records including:
    - `amount`, `status`, `createdAt`, `method`, `type`, `description`, `invoiceNumber`, `invoiceUrl`, `receiptUrl`.
  - Used by superadmin UI to show a **Billing History** table and provide invoice/receipt download links.

- **Other finance invoices / receipts**
  - Generic fee invoice helpers (`createFeeInvoice`, `createCashFeeReceipts`) are **deprecated** placeholders that now log warnings and do nothing; the current canonical path for plan billing is through `createPlanInvoice`.

---

## 5. Pros & cons – School Fee Engine (Non‑subscription)

### 5.1. What’s already there

- **End‑to‑end student fee lifecycle** (for offline / semi‑online payments)
  - Fee structures per school/year/class.
  - Student fee plans with per‑head amounts.
  - Concessions/waivers with approval.
  - Late fee logic and revenue head creation.
  - Double‑entry ledgers for demand, payments, reversals.
  - Payment settlement prioritizing fee heads.
  - Student balances, aging, class‑wise receivables, and defaulters.
  - PDF receipts and WhatsApp/SMS notifications (due, paid, overdue, cheque events, receipt links).

- **Strengths (Pros)**
  - **Accounting‑correct**: Uses double‑entry ledger and system accounts, suitable for audits.
  - **Flexible fee model**: Multiple fee heads, concessions, late fees, ad‑hoc invoices.
  - **Notification‑rich**: Deep integration with MSG91 for reminders and confirmations.
  - **Dashboard‑ready**: Optimized services to power real‑time finance dashboards and reports.
  - **Reversal safety**: Payment reversals create clean compensating entries and recompute balances.

### 5.2. Gaps / limitations (Cons)

- **Demand generation engine not fully wired**
  - Monthly/recurring demand creation depends on a missing `DemandCronService`; right now, the **framework is ready**, but full automatic fee scheduling is not live.

- **Online payment gateway for school fees is not completed**
  - There is **notification support for payment links**, but no end‑to‑end integration (Razorpay/UPI/etc.) specifically for student fee collection.
  - Current `collect` API assumes **cash/cheque/bank transfer** recorded by admins, not parent‑side online checkout.

- **UI coverage is partial**
  - Back‑end services are rich, but many flows (late fee configuration, ad‑hoc invoices listing, advanced dashboards) still need polished frontend screens.

- **Limited configurability stored in DB**
  - Some configs (like late fee rules) are hard‑coded defaults and should move to a `SchoolSettings` or similar table for per‑school customization.

---

## 6. Pros & cons – Subscription Billing (Platform)

### Pros

- **Single, clear gateway integration**
  - Razorpay is tightly integrated with consistent HMAC verification, order → payment → subscription flows, and webhook scaffolding.

- **Separation of concerns**
  - Subscription logic (`SubscriptionService`) is separate from invoice utilities, notification jobs, and UI components.
  - Plan vs. per‑school subscription vs. payments and invoices use distinct Prisma models.
  
- **Feature‑level monetization**
  - Pay‑per‑feature model is supported via dedicated order + verification paths and `SchoolFeatureConfig`.
  
- **GST‑aware invoicing**
  - Plan invoices are GST compliant with clear tax breakup and IGST vs CGST+SGST handling, plus PDF generation and email delivery.

### Cons / limitations

- **Limited payment gateway flexibility**
  - Only Razorpay is supported; adding Stripe, PayPal, etc. would require new services and controller endpoints.
  
- **No proration for mid‑session plan changes**
  - Upgrading/downgrading mid‑cycle simply resets the term; unused time on the old plan is not automatically credited or refunded.
  
- **Partial auto‑renew implementation**
  - Razorpay subscription webhooks and `enableAutoRenewForSubscription` exist, but:
    - UI does not yet expose full auto‑renew toggles and flows.
    - There is no end‑to‑end tested recurring billing pipeline in production code.
  
- **Cron‑based demand generation for student fees not wired**
  - Monthly demand generation for school fee engine references a missing `DemandCronService`, so that part of automation is currently disabled.

---

## 7. What this means for frontend implementation

When we build frontends, we should treat **school fee engine** and **platform subscription billing** as two separate verticals:

- **School Fee Frontend (what you asked for)**
  - Use:
    - `POST /api/v1/finance/collect` (record payments + generate receipts).
    - `POST /api/v1/finance/reversal/[paymentId]` (void/reverse payments).
    - `POST /api/v1/finance/ad-hoc-invoice` (create one‑time invoices).
    - `POST /api/v1/finance/notifications/send-dues` (single/bulk dues reminders).
    - `GET` finance reports (`collections`, `outstanding-summary`, `aging`, `class-receivables`, `defaulters`) for dashboards.
  - Build:
    - Student fee ledger views, receipts download, payment history, dashboards and defaulter lists.

- **Subscription Billing Frontend (platform side)**
  - Use:
    - `POST /api/v1/finance/subscription/create-order`
    - `POST /api/v1/finance/subscription/create-feature-order`
    - `POST /api/v1/finance/subscription/verify-payment`
    - `GET /api/v1/finance/invoice/plan/[subscriptionId]`
  - Build:
    - Superadmin plan assignment, billing history, and invoice downloads.

Together, this gives a complete picture of what exists today, and where we still need to add payment‑gateway or automation pieces on the **school fee** side.


