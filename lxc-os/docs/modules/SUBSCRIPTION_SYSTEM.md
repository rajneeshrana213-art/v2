## Subscription & Billing System Overview

This document explains how the current **school subscription, user limit, and billing** system works in LearnXChain, plus pros/cons and ideas for improvement.

### 1. High‑level architecture

- **Plan definition (Model B – Fixed Plan)**
  - Plans are stored in the Prisma `plan` model (price, durationDays, userLimit, etc.).
  - The Superadmin UI (`membership-plans` pages) manages these records.

- **Per‑school subscription config**
  - API: `GET /api/v1/superadmin/subscription-control/[schoolId]`
  - Data: `SchoolSubscriptionConfig` table.
  - Fields:
    - `planModel`: `"MODEL_A"` (Pay‑Per‑Feature) or `"MODEL_B"` (Fixed Plan with user limit).
    - `allowedUsers`, `extraUserPrice`, `gracePeriodDays`.
    - `isReadOnlyAfterGrace`, `autoSuspendAfterGrace`, `bonusUsers`.
  - Frontend: `pages/dashboard/superadmin/assign-plan/index.tsx` – “Active Plan Model / Usage & Limits / Rules & Automation” sections.

- **Usage & limit enforcement**
  - Service: `lib/services/superadmin/SubscriptionService.ts`.
  - `validateUserLimit(schoolId)`
    - Counts active users with specific roles.
    - For `MODEL_B`, compares `userCount` against `allowedUsers + bonusUsers` and throws if exceeded.
  - `checkWriteAccess(schoolId)`
    - Looks at latest `subscription` row and `SchoolSubscriptionConfig`.
    - Applies **grace period**, and can force **read‑only** or **auto‑suspend** the school after expiry.

- **Billing history / invoices UI**
  - API: `GET /api/v1/superadmin/subscription-control/[schoolId]/invoices`
    - Reads Prisma `Payment` records for the school.
    - Returns: `amount`, `status`, `createdAt`, `invoiceNumber`, `invoiceUrl`, etc.
  - Frontend table: “Billing History” on `assign-plan` page.
  - Download: if `invoiceUrl` exists, the UI shows a **Download** button which opens the PDF.
  - There is also a dedicated invoice download API:
    - `GET /api/v1/finance/invoice/plan/[subscriptionId]`
    - Uses `SubscriptionService.getPlanInvoice` to generate/fetch PDF and stream it.

### 2. Plan purchase & payment flow (Model B)

**Frontend (Superadmin – Assign Plan page)**  
File: `pages/dashboard/superadmin/assign-plan/index.tsx`

1. Superadmin selects a school; config + active subscription and invoices are fetched.
2. Under “Membership Plans”, clicking **Assign Plan** calls `handleSelectPlan(plan)`:
   - Calls `createOrder` via `useApi.post`:
     - Endpoint: `POST /api/v1/finance/subscription/create-order`
     - Payload: `{ schoolId, planId }`.
   - On success, opens Razorpay Checkout with the returned `orderId`, `amount`, `keyId`.
3. After payment success, Razorpay’s JS handler calls:
   - `POST /api/v1/finance/subscription/verify-payment`
     - Payload: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, schoolId, planId }`.
   - On success, UI reloads config, invoices, and plans to reflect the new active plan.

**Backend – create order**  
File: `pages/api/v1/finance/subscription/create-order.ts`  
Service: `lib/services/finance/subscription-service.ts`

1. Validates JWT from `Authorization: Bearer <token>` using `verifyAuth`.
2. For **feature activation** (`isFeatureActivation === true`):
   - Validates `schoolId`, `featureKey`, and a positive `amount`.
   - Calculates GST (18%), creates a Razorpay order directly via `razorpayInstance`.
   - Writes a `Payment` row with `status = PENDING` and description like `"Feature Activation: <name>"`.
3. For **plan payments**:
   - Validates `planId` and `schoolId`.
   - Calls `SubscriptionService.createRazorpayOrder({ planId, schoolId, couponCode?, isTrial? })`:
     - Loads plan from DB.
     - Applies **only explicit coupon discounts** (auto first‑time discounts were removed).
     - Uses `calculateAmounts(plan.price, discount, isTrial)`:
       - `baseAmount` = `plan.price - discount` (or trial price override).
       - `gstAmount` = `baseAmount * 0.18` (rounded to 2 decimals).
       - `totalAmount` = `baseAmount + gstAmount`.
     - Creates a Razorpay order with `amount = totalAmount * 100` (paise).
     - Creates a `Payment` row with `amount = totalAmount`, `status = PENDING`, and links `planId` + `schoolId`.
   - Returns order details to the client.

**Backend – verify payment**  
File: `pages/api/v1/finance/subscription/verify-payment.ts`

1. Validates JWT from `Authorization` and CORS.
2. If `featureKey` is present:
   - Validates all Razorpay fields and `schoolId`/`featureKey`.
   - Re‑computes/validates Razorpay signature using `RAZORPAY_KEY_SECRET`.
   - Fetches payment details from Razorpay and updates the local `Payment` row:
     - Sets `status = COMPLETED`, `razorpayPaymentId`, `paymentDate`, `paymentMethod`.
   - Upserts `SchoolFeatureConfig` to mark the feature `ENABLED` with `activatedOn` now.
3. For **plan payments**:
   - Delegates to `SubscriptionService.verifyRazorpayPayment(data)`:
     - Verifies Razorpay signature.
     - Finds local `Payment` by `razorpayOrderId` and ensures `planId` + `schoolId` match.
     - Marks payment `COMPLETED` and stores payment method.
     - Loads plan and (optionally) coupon; re‑applies the same discount rules as in order creation.
     - Finds current active subscription for school:
       - If exists, **updates** it with new start/end, payment, status, etc.
       - Else, **creates** a new `subscription` row.
     - Updates coupon usage count if used.
     - Generates and emails plan invoice PDF via `createPlanInvoice(subscription.id)`.

### 3. User limits & extra users

- The **plan** defines a base `userLimit` (e.g. 500 users).
- `SchoolSubscriptionConfig` holds `allowedUsers` and `bonusUsers`:
  - Base idea: `allowedUsers` starts at `plan.userLimit` (manually aligned via UI).
  - If usage goes beyond this limit, superadmin can:
    - Increase `allowedUsers` (effectively purchasing more seats, priced by `extraUserPrice`).
    - Or use **Waive Overages** button, which calls `SubscriptionService.waiveOverage`:
      - Computes current overage and updates `bonusUsers` so current usage fits.
- Enforcement is done wherever `SubscriptionService.validateUserLimit` / `checkWriteAccess` are called before writes (e.g. in school‑side APIs – not all endpoints are wired yet).

### 4. Automation & grace rules

- **Grace period & read‑only / suspend**
  - Controlled by `SchoolSubscriptionConfig`:
    - `gracePeriodDays` – how long after subscription end date the school can still operate.
    - `isReadOnlyAfterGrace` – if true, writes are blocked (throws an error) after grace.
    - `autoSuspendAfterGrace` – if true, school is automatically marked `isActive = false` in DB.
  - Logic lives in `SubscriptionService.checkWriteAccess`:
    - Compares current time to `subscription.endDate + gracePeriodDays`.
    - Applies read‑only or suspension if configured.

- **Overage waivers**
  - Admin can click **Waive Overages**; backend adds enough `bonusUsers` so current count is within limits.

### 5. Is auto‑debit / auto‑renewal implemented?

- **Primary flow is still manual billing via Razorpay Checkout.**
  - Superadmin initiates a new plan purchase from the Assign Plan page.
  - There is no fully automated creation of Razorpay orders on expiry yet.
- **Cron‑based automation**:
  - `checkSubscriptions` runs in the background to:
    - Mark overdue subscriptions as `EXPIRED` and `isActive = false`.
    - Optionally auto‑suspend schools if `autoSuspendAfterGrace` is enabled in `SchoolSubscriptionConfig`.
    - Send reminder emails using `sendSubscriptionReminder` for subscriptions nearing expiry so schools can proactively renew.
- **Webhook framework**:
  - `SubscriptionService.handleWebhook`:
    - Handles `payment.failed` to mark local `Payment` as `FAILED`.
    - Includes scaffolding for Razorpay Subscription events (`subscription.charged` / `subscription.completed`) to:
      - Link a Razorpay subscription ID to our `subscription` rows via `razorpaySubscriptionId` and `isAutoRenewEnabled`.
      - Create recurring `Payment` rows and extend `endDate` when charges succeed.
      - Disable auto‑renew when the Razorpay subscription completes.
- Razorpay subscription APIs (recurring mandates) are **partially prepared** at the model/service level but still need UI + controller wiring to be fully live.

### 6. Pros & cons of the current design

#### Pros

- **Clear separation** between:
  - Plan catalog (`plan` model),
  - Per‑school config (`SchoolSubscriptionConfig`),
  - Runtime subscription state (`subscription` table),
  - Payments (`Payment` table).
- **Flexible monetization models**:
  - MODEL_A: Pay‑Per‑Feature (per‑feature monthly prices).
  - MODEL_B: Fixed Plan with user limit + extra user price + bonus users.
- **Feature‑level billing support**:
  - Independent Razorpay orders + payments per feature enable granular upsells.
- **Basic automation hooks**:
  - Grace periods, read‑only mode, and auto‑suspend after expiry.
  - Overages can be waived without changing historic subscription data.

#### Cons / limitations

- **No real auto‑renew / auto‑debit**:
  - Renewals require manual action; expired schools won’t be auto‑charged.
  - Razorpay’s subscription/mandate features are not leveraged.

- **User limit vs plan coupling is implicit**:
  - `allowedUsers` is not automatically synced with `plan.userLimit` when assigning a plan.
  - Increasing `allowedUsers` does not automatically generate extra‑user invoices; the logic is manual/implicit.

- **Mixed responsibilities in APIs**:
  - `create-order` endpoint handles both plan and feature payments.
  - Superadmin vs. school‑side paths share the same finance service, which can be harder to reason about.

- **Invoice history relies on `invoiceUrl` being populated**:
  - If `createPlanInvoice` fails or runs late, Billing History may show payments but no invoice download.

- **Auth inconsistencies (being fixed)**:
  - Several finance endpoints originally passed `req,res` into `verifyAuth`, causing JWT errors; they now consistently read the bearer token and pass it as a string.

### 7. Suggested improvements

#### 7.1. Tighten plan ↔ config linkage

- When a plan is assigned:
  - Automatically set `SchoolSubscriptionConfig.allowedUsers = plan.userLimit`.
  - Optionally store `subscription.userLimit` to freeze the limit per subscription.
- When a plan is changed mid‑term:
  - Decide whether to pro‑rate, or only apply new limits/price on the **next** billing cycle.

#### 7.2. Explicit extra user billing

- Treat `allowedUsers - plan.userLimit` as **paid extra seats**.
- Use `extraUserPrice` (default from global settings) to compute a separate line item:
  - Monthly charge = `max(0, allowedUsers - plan.userLimit) * extraUserPrice`.
- Add helper methods:
  - `calculateExtraUserCharge(schoolId)` – used by invoice generator.
  - UI indicator on “Usage & Limits” showing **base vs. extra seats**.

#### 7.3. Improve automation & checks

- Ensure `SubscriptionService.validateUserLimit` and `checkWriteAccess` are called in all write‑paths for school‑side APIs (not only a subset).
- Add background job / cron to:
  - Check for subscriptions nearing expiry.
  - Send reminder emails / notifications using existing notification infrastructure.
  - Optionally auto‑mark subscriptions as `EXPIRED` when end date passes (even if no request comes in).

#### 7.4. True auto‑renew / auto‑debit (future)

- Integrate Razorpay **Subscriptions / e‑mandate**:
  - On plan assignment, create a Razorpay subscription object with the desired billing interval.
  - Store Razorpay subscription ID on our `subscription` records.
  - Listen to `subscription.charged`, `subscription.completed`, and `payment.failed` webhooks:
    - On success: create `Payment` + extend subscription end date + generate invoice.
    - On failure: apply grace rules + send reminders + possibly auto‑suspend after repeated failures.
- UI improvements:
  - Toggle per school: **“Enable Auto‑Renew”**.
  - Display upcoming billing date and last auto‑charge status in the superadmin panel.

#### 7.5. Developer ergonomics

- Wrap all finance endpoints with `withAuth` middleware to avoid repeating token parsing.
- Split `create-order` into two clear endpoints:
  - `/subscription/create-plan-order`
  - `/subscription/create-feature-order`
  for easier reasoning and independent evolution.

---

This file should give you a quick mental model of how subscriptions, user limits, payments, and invoices currently behave, what’s already implemented, and what remains manual (especially renewals and extra‑user billing). Future changes should keep this doc updated so superadmins and developers have a single source of truth for subscription logic.


