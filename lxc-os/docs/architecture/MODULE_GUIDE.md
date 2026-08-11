# Module Guide

> Detailed guide to all modules in LearnXChain

## Overview

LearnXChain is organized into functional modules, each handling a specific domain of the school management system.

---

## Module Structure

Each module typically consists of:

1. **Services** (`lib/services/[module]/`) - Business logic
2. **API Routes** (`pages/api/v1/[module]/`) - HTTP endpoints
3. **Validations** (`lib/validations/[module].ts`) - Input validation
4. **Types** - TypeScript interfaces and types
5. **Components** (`components/[module]/`) - UI components (if applicable)

---

## Core Modules

### 1. Authentication Module

**Location**: `pages/api/auth/`, `lib/auth.ts`

**Purpose**: Handle user authentication and authorization

**Key Features**:
- User login/logout
- JWT token generation and validation
- Password reset
- OTP verification
- Google OAuth integration

**API Endpoints**:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/verify-otp` - Verify OTP

**Services**:
- `lib/auth.ts` - Authentication utilities
- `lib/services/password-service.ts` - Password management

---

### 2. Student Module

**Location**: `pages/api/v1/student/`, `lib/services/student-service.ts`

**Purpose**: Manage student information and operations

**Key Features**:
- Student CRUD operations
- Admission management
- Student profile management
- Attendance tracking
- Fee management
- Academic records

**API Endpoints**:
- `GET /api/v1/student` - List all students
- `POST /api/v1/student` - Create student
- `GET /api/v1/student/[id]` - Get student details
- `PUT /api/v1/student/[id]` - Update student
- `DELETE /api/v1/student/[id]` - Delete student
- `GET /api/v1/student/[id]/attendance` - Get attendance
- `GET /api/v1/student/[id]/fees` - Get fee details

**Services**:
- `StudentService` - Main student operations
- `student-dashboard-service.ts` - Dashboard data
- `student-id-card-service.ts` - ID card generation
- `student-leaderboard-service.ts` - Leaderboard management

---

### 3. Teacher Module

**Location**: `pages/api/v1/teacher/`, `lib/services/teacher-service.ts`

**Purpose**: Manage teacher information and operations

**Key Features**:
- Teacher CRUD operations
- Subject assignment
- Class assignment
- Lesson management
- Assignment creation
- Attendance marking

**API Endpoints**:
- `GET /api/v1/teacher` - List all teachers
- `POST /api/v1/teacher` - Create teacher
- `GET /api/v1/teacher/[id]` - Get teacher details
- `PUT /api/v1/teacher/[id]` - Update teacher
- `DELETE /api/v1/teacher/[id]` - Delete teacher

**Services**:
- `TeacherService` - Main teacher operations
- `teacher/academic-service.ts` - Academic operations
- `teacher/assessment-service.ts` - Assessment management
- `teacher/assignment-service.ts` - Assignment management

---

### 4. Admin Module

**Location**: `pages/api/v1/admin/`, `lib/services/admin/`

**Purpose**: School administration and management

**Key Features**:
- Class management
- Subject management
- Timetable management
- Exam management
- Notice/announcement management
- Event management
- Holiday management
- Visitor management

**API Endpoints**:
- `/api/v1/admin/class` - Class management
- `/api/v1/admin/subject` - Subject management
- `/api/v1/admin/timetable` - Timetable management
- `/api/v1/admin/exam` - Exam management
- `/api/v1/admin/notice` - Notice management
- `/api/v1/admin/event` - Event management

**Services**:
- `admin/class-service.ts` - Class operations
- `admin/subject-service.ts` - Subject operations
- `admin/timetable-service.ts` - Timetable operations
- `admin/exam-service.ts` - Exam operations

---

### 5. Finance Module

**Location**: `pages/api/v1/finance/`, `lib/services/finance/`

**Purpose**: Financial management and fee collection

**Key Features**:
- Fee structure management
- Fee head management
- Student fee plans
- Payment processing
- Invoice generation
- Receipt generation
- Concession management
- Financial reports
- Ledger management

**API Endpoints**:
- `/api/v1/finance/fee-head` - Fee head management
- `/api/v1/finance/fee-structure` - Fee structure management
- `/api/v1/finance/student-fee-plan` - Student fee plans
- `/api/v1/finance/payment` - Payment processing
- `/api/v1/finance/invoice` - Invoice management
- `/api/v1/finance/ledger` - Ledger entries
- `/api/v1/finance/reports` - Financial reports

**Services**:
- `finance/fee-service.ts` - Fee management
- `finance/payment-service.ts` - Payment processing
- `finance/invoice-service.ts` - Invoice generation
- `finance/ledger-service.ts` - Ledger management
- `finance/concession-service.ts` - Concession management

**Integration**:
- Razorpay for online payments
- Automated invoice generation
- Email notifications for payments

---

### 6. Transport Module

**Location**: `pages/api/v1/transport/`, `lib/services/transport/`

**Purpose**: Transport and fleet management

**Key Features**:
- Bus management
- Route management
- Driver management
- Trip tracking
- GPS tracking
- Maintenance alerts
- Driver behavior monitoring
- Route optimization

**API Endpoints**:
- `/api/v1/transport/bus` - Bus management
- `/api/v1/transport/route` - Route management
- `/api/v1/transport/driver` - Driver management
- `/api/v1/transport/trip` - Trip tracking
- `/api/v1/transport/analytics` - Transport analytics

**Services**:
- `transport-service.ts` - Main transport operations
- `trip-service.ts` - Trip tracking
- `driver-behavior-service.ts` - Driver monitoring
- `location-service.ts` - GPS tracking
- `transport/route-optimization.ts` - Route optimization

---

### 7. Hostel Module

**Location**: `pages/api/v1/hostel/`, `lib/services/hostel/`

**Purpose**: Hostel and accommodation management

**Key Features**:
- Hostel management
- Room management
- Room allocation
- Mess menu management
- Attendance tracking
- Visitor management

**API Endpoints**:
- `/api/v1/hostel` - Hostel management
- `/api/v1/hostel/room` - Room management
- `/api/v1/hostel/allocation` - Room allocation
- `/api/v1/hostel/mess` - Mess menu management
- `/api/v1/hostel/attendance` - Hostel attendance

**Services**:
- `hostel/hostel-service.ts` - Hostel operations
- `hostel/room-service.ts` - Room management
- `hostel/allocation-service.ts` - Allocation management
- `hostel/mess-service.ts` - Mess management

---

### 8. Library Module

**Location**: `pages/api/v1/library/`, `lib/services/library-service.ts`

**Purpose**: Library and book management

**Key Features**:
- Book catalog management
- Book issue/return
- Fine calculation
- Inventory management
- Member management

**API Endpoints**:
- `/api/v1/library/book` - Book management
- `/api/v1/library/issue` - Issue book
- `/api/v1/library/return` - Return book
- `/api/v1/library/fine` - Fine management

**Services**:
- `library-service.ts` - Library operations

---

### 9. Communication Module

**Location**: `pages/api/v1/communication/`, `lib/services/communication/`

**Purpose**: Communication and messaging

**Key Features**:
- Notice/announcement management
- Direct messaging
- Group messaging
- Email notifications
- SMS notifications
- WhatsApp notifications
- Push notifications

**API Endpoints**:
- `/api/v1/communication/notice` - Notice management
- `/api/v1/communication/message` - Messaging
- `/api/v1/communication/group` - Group management

**Services**:
- `emailService.ts` - Email sending
- `sms-service.ts` - SMS sending
- `whatsapp-service.ts` - WhatsApp messaging
- `notification/notification-service.ts` - Notification delivery
- `msg91-service.ts` - MSG91 integration

---

### 10. Notification Module

**Location**: `pages/api/v1/notification/`, `lib/services/notification/`

**Purpose**: Multi-channel notification system

**Key Features**:
- Email notifications
- SMS notifications
- Push notifications
- WhatsApp notifications
- Notification templates
- Notification scheduling
- Notification logs

**API Endpoints**:
- `/api/v1/notification/send` - Send notification
- `/api/v1/notification/template` - Template management
- `/api/v1/notification/log` - Notification logs

**Services**:
- `notification/notification-service.ts` - Notification orchestration
- `notification/email-notification.ts` - Email notifications
- `notification/sms-notification.ts` - SMS notifications
- `notification/template-service.ts` - Template management

---

### 11. Dashboard Module

**Location**: `pages/api/v1/dashboard/`, `lib/services/dashboard/`

**Purpose**: Role-based dashboard data

**Key Features**:
- Admin dashboard
- Student dashboard
- Teacher dashboard
- Parent dashboard
- Analytics and insights
- Summary statistics

**API Endpoints**:
- `/api/v1/dashboard/admin` - Admin dashboard
- `/api/v1/dashboard/student/[id]` - Student dashboard
- `/api/v1/dashboard/teacher/[id]` - Teacher dashboard

**Services**:
- `dashboard/admin-dashboard.ts` - Admin dashboard data
- `student-dashboard-service.ts` - Student dashboard data
- `dashboard/teacher-dashboard.ts` - Teacher dashboard data

---

### 12. Analytics Module

**Location**: `pages/api/v1/analytics/`, `lib/services/analytics/`

**Purpose**: Data analytics and reporting

**Key Features**:
- Student performance analytics
- Financial analytics
- Attendance analytics
- Transport analytics
- Custom reports

**API Endpoints**:
- `/api/v1/analytics/student` - Student analytics
- `/api/v1/analytics/finance` - Financial analytics
- `/api/v1/analytics/attendance` - Attendance analytics

**Services**:
- `analytics/student-analytics.ts` - Student analytics
- `analytics/finance-analytics.ts` - Financial analytics
- `analytics/attendance-analytics.ts` - Attendance analytics

---

### 13. Project Management Module

**Location**: `pages/api/v1/project/`, `lib/services/project/`

**Purpose**: Student project and task management

**Key Features**:
- Project creation and management
- Task assignment
- Agile board (Kanban)
- GitHub integration
- Collaboration tools

**API Endpoints**:
- `/api/v1/project` - Project management
- `/api/v1/project/task` - Task management
- `/api/v1/project/agile` - Agile board

**Services**:
- `project/project-service.ts` - Project operations
- `project/task-service.ts` - Task management
- `project/agile-service.ts` - Agile board

---

## Shared Services

### Email Service

**File**: `lib/services/emailService.ts`

**Purpose**: Send emails via multiple providers

**Features**:
- SendGrid integration
- Nodemailer integration
- Email templates (EJS)
- Attachment support

### SMS Service

**File**: `lib/services/sms-service.ts`

**Purpose**: Send SMS via Twilio

### Password Service

**File**: `lib/services/password-service.ts`

**Purpose**: Password hashing and validation

**Features**:
- bcrypt hashing
- Password strength validation
- Password reset token generation

### Stream Service

**File**: `lib/stream-client.ts`

**Purpose**: Video calling and chat via Stream.io

---

## Cron Jobs

**Location**: `lib/cron-jobs/`

**Purpose**: Scheduled background tasks

**Jobs**:
- `attendance-reminder.ts` - Daily attendance reminders
- `fee-reminder.ts` - Fee payment reminders
- `subscription-check.ts` - Subscription expiry checks
- `backup.ts` - Database backups

---

## Middleware

**Location**: `lib/middleware/`

### Auth Middleware

**File**: `auth.ts`

**Purpose**: Authenticate API requests

**Usage**:
```typescript
import { authMiddleware } from '@/lib/middleware/auth';

export default authMiddleware(handler);
```

### CORS Middleware

**File**: `cors.ts`

**Purpose**: Handle CORS for API routes

### Error Handler

**File**: `errorHandler.ts`

**Purpose**: Centralized error handling

---

## Validation Schemas

**Location**: `lib/validations/`

All input validation uses **Zod** schemas:

- `student.ts` - Student validation
- `teacher.ts` - Teacher validation
- `finance.ts` - Finance validation
- `transport.ts` - Transport validation
- `hostel.ts` - Hostel validation
- `library.ts` - Library validation

**Example**:
```typescript
import { z } from 'zod';

export const studentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  dateOfBirth: z.string().datetime(),
});
```

---

## Adding a New Module

To add a new module:

1. **Create service** in `lib/services/[module]/`
2. **Create validation** in `lib/validations/[module].ts`
3. **Create API routes** in `pages/api/v1/[module]/`
4. **Update Prisma schema** if needed
5. **Create UI components** in `components/[module]/`
6. **Add to dashboard config** if needed
7. **Update documentation**

---

**Last Updated:** January 2026
