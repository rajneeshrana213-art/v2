---
name: communication-integration
description: >
  Patterns and templates for all communication channels in LearnXChain:
  MSG91 WhatsApp/SMS, email (AWS SES/SendGrid/Nodemailer), push notifications,
  notification templates, and the unified notification dispatch system. Use this
  skill when building or modifying any notification, message, or alert feature.
---

# LearnXChain — Communication Integration Skill

> **Communication is the nervous system of the platform.** Fees, attendance,
> transport alerts — they all depend on reliable messaging. Follow these patterns
> to avoid dropped messages, duplicate sends, and cost overruns.

---

## 📡 Communication Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                   Notification Dispatch                        │
│  lib/services/notification.ts — central dispatcher             │
├──────────┬──────────┬──────────┬──────────────────────────────┤
│ WhatsApp │   SMS    │  Email   │  Push Notifications          │
│ (MSG91)  │ (MSG91)  │ (SES)   │  (Expo Push / OneSignal)     │
├──────────┴──────────┴──────────┴──────────────────────────────┤
│  Templates: lib/services/msg91-template-service.ts            │
│  Channels: NotificationChannel model (per-school config)      │
│  Logs:     NotificationLog model (delivery tracking)          │
└───────────────────────────────────────────────────────────────┘
```

### Service Files
| Service | File | Purpose |
|---|---|---|
| WhatsApp | `lib/services/whatsapp-service.ts` | WhatsApp messaging via MSG91 |
| SMS | `lib/services/sms-service.ts` | SMS dispatch via MSG91 |
| MSG91 Core | `lib/services/msg91-service.ts` | Raw MSG91 API wrapper |
| MSG91 Templates | `lib/services/msg91-template-service.ts` | Template management |
| Email | `lib/services/emailService.ts` | Email via AWS SES/SendGrid/Nodemailer |
| Email Utility | `lib/utils/mailer.ts` | Lower-level email dispatch helper |
| Push Notifications | `lib/services/notification.ts` | Push notification dispatch |
| Transport Alerts | `lib/services/transport-notification.ts` | Transport-specific alerts |

---

## 📱 WhatsApp / SMS via MSG91

### Configuration (`.env`)
```env
MSG91_AUTH_KEY=your_auth_key_here
MSG91_SENDER_ID=LRNXCH
MSG91_DLT_TE_ID=template_entity_id
```

### Sending WhatsApp Message
```typescript
import { MSG91Service } from '@/lib/services/msg91-service';

// Send a WhatsApp message using a pre-approved template
await MSG91Service.sendWhatsapp({
  phone: '919876543210',  // Include country code
  templateId: 'fee_reminder_v1',
  variables: {
    student_name: 'Rahul',
    amount: '₹5,000',
    due_date: '15 Apr 2026',
  },
});
```

### Sending SMS
```typescript
import { MSG91Service } from '@/lib/services/msg91-service';

// Send an SMS
await MSG91Service.sendSms({
  phone: '919876543210',
  message: 'Your OTP is 123456. Valid for 5 minutes. — LearnXChain',
  templateId: 'otp_template',
});
```

### Template Management
```typescript
import { MSG91TemplateService } from '@/lib/services/msg91-template-service';

// List all templates for a school
const templates = await MSG91TemplateService.getTemplates(schoolId);

// Create a new template
await MSG91TemplateService.createTemplate({
  schoolId,
  name: 'Fee Reminder',
  channel: 'WHATSAPP',
  content: 'Dear {{student_name}}, your fee of {{amount}} is due on {{due_date}}.',
  variables: ['student_name', 'amount', 'due_date'],
});
```

### Cost Awareness
| Channel | Approximate Cost | Notes |
|---|---|---|
| WhatsApp (Utility) | ₹0.35 / msg | Template must be pre-approved by Meta |
| WhatsApp (Marketing) | ₹0.80 / msg | Higher cost, requires opt-in |
| SMS (Transactional) | ₹0.15 / msg | DLT registration required in India |
| SMS (Promotional) | ₹0.20 / msg | Time-restricted (9AM-9PM IST) |

---

## 📧 Email via AWS SES / SendGrid / Nodemailer

### Sending Email
```typescript
import { EmailService } from '@/lib/services/emailService';

// Send a plain email
await EmailService.send({
  to: 'parent@example.com',
  subject: 'Fee Receipt — LearnXChain',
  html: '<h1>Payment Received</h1><p>Amount: ₹5,000</p>',
});

// Send with a template
await EmailService.sendWithTemplate({
  to: 'admin@school.com',
  template: 'fee_receipt',
  data: {
    studentName: 'Rahul',
    amount: '₹5,000',
    receiptNo: 'INV-2026-001',
  },
});
```

### Error Notifier (Auto-Email on Errors)
The logger (`lib/utils/logger.ts`) has a built-in `EmailTransport` that automatically
sends email notifications to admins when `Logger.error()` is called.

**Rate limits**: Max 5 error emails per minute to prevent spam during cascading failures.

**Exclusions**: Emails related to `[EmailService]`, `[ErrorNotifier]`, `EAUTH`, or `[Bulk Upload]`
are excluded to prevent infinite loops.

---

## 🔔 Push Notifications

### Database Models
```prisma
model NotificationChannel {
  id          String   @id @default(cuid())
  schoolId    String
  channel     String   // 'EMAIL', 'WHATSAPP', 'SMS', 'PUSH'
  isEnabled   Boolean  @default(true)
  config      Json?    // Channel-specific configuration
  school      School   @relation(...)
}

model NotificationLog {
  id          String   @id @default(cuid())
  schoolId    String
  channel     String
  recipient   String
  subject     String?
  message     String
  status      String   // 'SENT', 'FAILED', 'PENDING'
  sentAt      DateTime?
  error       String?
  school      School   @relation(...)
}

model NotificationTemplate {
  id          String   @id @default(cuid())
  schoolId    String
  name        String
  channel     String
  subject     String?
  content     String
  variables   Json?
  school      School   @relation(...)
}
```

### Trigger-Based Notifications
```prisma
model TriggerNotification {
  id          String   @id @default(cuid())
  schoolId    String
  event       String   // 'FEE_DUE', 'ATTENDANCE_ABSENT', 'BUS_ARRIVING'
  channel     String   // 'WHATSAPP', 'SMS', 'EMAIL', 'PUSH'
  templateId  String?
  isActive    Boolean  @default(true)
  school      School   @relation(...)
}
```

### Dispatching Multi-Channel Notifications
```typescript
// Pattern: Send via ALL enabled channels for an event
import { NotificationDispatcher } from '@/lib/services/notification';

await NotificationDispatcher.send({
  schoolId: user.schoolId,
  event: 'FEE_DUE',
  recipientId: parentUserId,
  data: {
    studentName: 'Rahul',
    amount: '₹5,000',
    dueDate: '15 Apr 2026',
  },
});

// The dispatcher:
// 1. Looks up TriggerNotification for this event + school
// 2. Checks which channels are enabled
// 3. Renders the template with the data
// 4. Sends via each enabled channel
// 5. Logs the result in NotificationLog
```

---

## 🚌 Transport Notifications (Special Case)

Transport has its own notification service because alerts are real-time and location-based:

```typescript
import { TransportNotificationService } from '@/lib/services/transport-notification';

// Notify parents when bus is approaching their stop
await TransportNotificationService.notifyApproaching({
  tripId,
  busStopId,
  estimatedArrival: '2 minutes',
});

// Notify admin about driver behavior incident
await TransportNotificationService.notifyIncident({
  driverId,
  incidentType: 'SPEEDING',
  speed: 85,
  threshold: 60,
});
```

---

## 📋 Notification Event Catalog

| Event Key | Trigger | Default Channels | Recipient |
|---|---|---|---|
| `FEE_DUE` | Fee due date approaching | WhatsApp + SMS | Parent |
| `FEE_PAID` | Payment received | WhatsApp + Email | Parent |
| `FEE_OVERDUE` | Fee past due date | WhatsApp + SMS + Email | Parent |
| `ATTENDANCE_ABSENT` | Student marked absent | WhatsApp | Parent |
| `EXAM_SCHEDULED` | New exam created | Email | Student + Parent |
| `RESULT_PUBLISHED` | Results announced | WhatsApp + Email | Student + Parent |
| `BUS_ARRIVING` | Bus near stop | Push + WhatsApp | Parent |
| `BUS_DEPARTED` | Bus left school | Push | Parent |
| `LEAVE_APPROVED` | Leave request approved | WhatsApp | Teacher/Staff |
| `NOTICE_PUBLISHED` | New notice posted | Email + Push | All relevant |
| `ASSIGNMENT_DUE` | Assignment due soon | Push | Student |

---

## 🔒 Security Rules

1. **Never send to unverified numbers/emails** — always check `isVerified` flag
2. **Rate limit outbound messages** — max 100 per school per hour (configurable)
3. **Log every send attempt** — success or failure, in `NotificationLog`
4. **Template variables are sanitized** — never inject raw user input into templates
5. **Unsubscribe support** — respect `NotificationChannel.isEnabled` per school
6. **DLT compliance** — all SMS templates must be DLT-registered for Indian numbers

---

## ⚠️ Anti-Patterns

```typescript
// ❌ Sending messages in a loop (N+1 sends)
for (const parent of parents) {
  await MSG91Service.sendWhatsapp({ phone: parent.phone, ... });
}
// ✅ Use batch send
await MSG91Service.sendBulkWhatsapp(parents.map(p => ({
  phone: p.phone, templateId: '...', variables: { ... }
})));

// ❌ Not logging notification failures
try { await sendSms(...); } catch {} // BAD — failure is silently lost
// ✅ Always log
try { await sendSms(...); } catch (err) {
  Logger.error(`[Notification] SMS failed: ${err.message}`);
  await logNotificationFailure(recipient, 'SMS', err.message);
}

// ❌ Hardcoding phone numbers
const adminPhone = '919876543210'; // BAD
// ✅ Read from school config or user profile

// ❌ Sending notifications during tests
// All notification services should be mocked in test files
```
