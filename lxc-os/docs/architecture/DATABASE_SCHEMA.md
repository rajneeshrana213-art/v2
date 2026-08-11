# Database Schema Documentation

> Complete database schema reference for LearnXChain

## Overview

LearnXChain uses **PostgreSQL** as the database and **Prisma ORM** for database access. The schema is defined in `prisma/schema.prisma`.

## Schema Organization

The database is organized into the following modules:

1. **Core Models** - School, User, Authentication
2. **Academic Models** - Class, Subject, Lesson, Assignment, Exam
3. **Finance Models** - Fee, Payment, Invoice, Ledger
4. **Transport Models** - Bus, Route, Driver, Trip
5. **Hostel Models** - Hostel, Room, Allocation
6. **Library Models** - Book, Issue, Return
7. **Communication Models** - Notice, Event, Message, Notification
8. **HRM Models** - Employee, Department, Designation, Payroll

---

## Core Models

### School

The central model representing a school/organization.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `schoolName` | String | School name |
| `schoolLogo` | String? | Logo URL |
| `schoolCode` | String? | Unique school code |
| `latitude` | Float? | Location latitude |
| `longitude` | Float? | Location longitude |
| `userId` | String | Owner user ID (unique) |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:**
- `user` - Owner (one-to-one with User)
- `students` - Students (one-to-many)
- `teachers` - Teachers (one-to-many)
- `classes` - Classes (one-to-many)
- `subjects` - Subjects (one-to-many)

**Indexes:**
- `schoolCode` (unique)
- `userId` (unique)

---

### User

Base user model for all roles in the system.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `name` | String | Full name |
| `userName` | String? | Username (unique) |
| `email` | String | Email address (unique) |
| `phone` | String | Phone number |
| `profilePic` | String? | Profile picture URL |
| `password` | String? | Hashed password |
| `address` | String | Street address |
| `city` | String | City |
| `state` | String | State |
| `country` | String | Country |
| `pincode` | String | Postal code |
| `bloodType` | String | Blood type |
| `sex` | UserSex | Gender (MALE/FEMALE/OTHER) |
| `role` | Role | User role |
| `schoolId` | String? | Associated school ID |
| `reputation` | Int | User reputation points |
| `coins` | Int | Reward coins |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:**
- `school` - Associated school
- `ownedSchool` - Owned school (for superadmin)
- `student` - Student profile (one-to-one)
- `teacher` - Teacher profile (one-to-one)
- `parent` - Parent profile (one-to-one)
- `employee` - Employee profile (one-to-one)

**Indexes:**
- `email` (unique)
- `userName` (unique)
- `schoolId`
- `role`
- `schoolId + role` (composite)

**Enums:**
```prisma
enum Role {
  superadmin
  admin
  teacher
  student
  parent
  employee
  driver
  transport
  accounts
  library
  hostel
}

enum UserSex {
  MALE
  FEMALE
  OTHER
}
```

---

## Academic Models

### Student

Student-specific information extending User.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `admissionNumber` | String | Unique admission number |
| `userId` | String | User ID (unique) |
| `schoolId` | String | School ID |
| `classId` | String | Current class ID |
| `dateOfBirth` | DateTime | Date of birth |
| `fatherName` | String | Father's name |
| `motherName` | String | Mother's name |
| `guardianName` | String? | Guardian's name |
| `guardianPhone` | String? | Guardian's phone |
| `previousSchool` | String? | Previous school |
| `admissionDate` | DateTime | Admission date |
| `status` | ActiveStatus | ACTIVE/INACTIVE |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:**
- `user` - User profile
- `school` - School
- `class` - Current class
- `attendances` - Attendance records
- `payments` - Payment records
- `results` - Exam results
- `assignments` - Assignments

**Indexes:**
- `admissionNumber` (unique)
- `userId` (unique)
- `schoolId`
- `classId`
- `status`

---

### Teacher

Teacher-specific information extending User.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `teacherSchoolId` | String | Teacher school ID |
| `userId` | String | User ID (unique) |
| `schoolId` | String | School ID |
| `dateOfBirth` | DateTime | Date of birth |
| `dateofJoin` | DateTime? | Joining date |
| `qualification` | String | Educational qualification |
| `workExperience` | String | Work experience |
| `salary` | Int | Monthly salary |
| `contractType` | String? | Contract type |
| `status` | ActiveStatus | ACTIVE/INACTIVE |
| `accountNumber` | String | Bank account number |
| `bankName` | String | Bank name |
| `ifscCode` | String | IFSC code |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:**
- `user` - User profile
- `school` - School
- `subjects` - Teaching subjects
- `classes` - Teaching classes
- `lessons` - Created lessons

---

### Class

Class/grade information.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `name` | String | Class name (e.g., "Grade 10-A") |
| `capacity` | Int | Maximum capacity |
| `schoolId` | String | School ID |
| `teacherId` | String? | Class teacher ID |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:**
- `school` - School
- `teacher` - Class teacher
- `students` - Students in class
- `subjects` - Subjects taught
- `timetable` - Class timetable
- `sections` - Class sections

---

### Subject

Subject/course information.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `name` | String | Subject name |
| `code` | String? | Subject code |
| `description` | String? | Description |
| `schoolId` | String | School ID |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:**
- `school` - School
- `teachers` - Teaching teachers
- `classes` - Classes taught in
- `lessons` - Lessons
- `assignments` - Assignments

---

### Lesson

Lesson/lecture information.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `title` | String | Lesson title |
| `description` | String? | Description |
| `subjectId` | String | Subject ID |
| `classId` | String | Class ID |
| `teacherId` | String | Teacher ID |
| `date` | DateTime | Lesson date |
| `startTime` | String | Start time |
| `endTime` | String | End time |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:**
- `subject` - Subject
- `class` - Class
- `teacher` - Teacher
- `attendances` - Attendance records

---

### Assignment

Student assignments.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `title` | String | Assignment title |
| `description` | String | Description |
| `subjectId` | String | Subject ID |
| `classId` | String | Class ID |
| `teacherId` | String | Teacher ID |
| `dueDate` | DateTime | Due date |
| `totalMarks` | Int | Total marks |
| `attachments` | String? | Attachment URLs (JSON) |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:**
- `subject` - Subject
- `class` - Class
- `teacher` - Teacher
- `submissions` - Student submissions

---

### Attendance

Attendance tracking.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `studentId` | String | Student ID |
| `lessonId` | String | Lesson ID |
| `date` | DateTime | Attendance date |
| `status` | AttendanceStatus | PRESENT/ABSENT/LATE/EMERGENCY |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Enums:**
```prisma
enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EMERGENCY
}
```

---

## Finance Models

### AcademicYear

Academic year configuration for finance.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `name` | String | Year name (e.g., "2024-2025") |
| `startDate` | DateTime | Start date |
| `endDate` | DateTime | End date |
| `isActive` | Boolean | Is current year |
| `schoolId` | String | School ID |

---

### FeeHead

Fee categories/types.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `name` | String | Fee head name |
| `description` | String? | Description |
| `amount` | Float | Default amount |
| `frequency` | FeeFrequency | MONTHLY/QUARTERLY/YEARLY/ONE_TIME |
| `schoolId` | String | School ID |

**Enums:**
```prisma
enum FeeFrequency {
  MONTHLY
  QUARTERLY
  YEARLY
  ONE_TIME
}
```

---

### FeeStructure

Fee structure templates.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `name` | String | Structure name |
| `classId` | String? | Applicable class |
| `academicYearId` | String | Academic year |
| `totalAmount` | Float | Total amount |
| `schoolId` | String | School ID |

**Relations:**
- `feeHeads` - Associated fee heads
- `studentFeePlans` - Student plans using this structure

---

### StudentFeePlan

Student-specific fee plan.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `studentId` | String | Student ID |
| `feeStructureId` | String | Fee structure ID |
| `academicYearId` | String | Academic year ID |
| `totalAmount` | Float | Total fee amount |
| `paidAmount` | Float | Amount paid |
| `pendingAmount` | Float | Amount pending |
| `status` | FeeStatus | PENDING/PARTIAL/PAID |

---

### Payment

Payment transactions.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `amount` | Float | Payment amount |
| `razorpayOrderId` | String | Razorpay order ID (unique) |
| `razorpayPaymentId` | String? | Razorpay payment ID |
| `paymentMethod` | String? | Payment method |
| `status` | PaymentStatus | PENDING/SUCCESS/FAILED |
| `paymentDate` | DateTime? | Payment date |
| `studentId` | String? | Student ID |
| `schoolId` | String? | School ID |
| `invoiceNumber` | String? | Invoice number |
| `receiptNumber` | String? | Receipt number |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Enums:**
```prisma
enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
}
```

---

### FinanceLedger

Financial ledger for all transactions.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `transactionType` | TransactionType | DEBIT/CREDIT |
| `amount` | Float | Transaction amount |
| `description` | String | Description |
| `date` | DateTime | Transaction date |
| `accountId` | String | Account ID |
| `paymentId` | String? | Related payment ID |
| `schoolId` | String | School ID |

---

## Transport Models

### Bus

Bus information.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `busNumber` | String | Bus number |
| `registrationNumber` | String | Registration number |
| `capacity` | Int | Seating capacity |
| `driverId` | String? | Assigned driver ID |
| `schoolId` | String | School ID |
| `status` | BusStatus | ACTIVE/MAINTENANCE/INACTIVE |

---

### Route

Transport routes.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `name` | String | Route name |
| `busId` | String | Assigned bus ID |
| `schoolId` | String | School ID |

**Relations:**
- `bus` - Assigned bus
- `stops` - Bus stops on route
- `trips` - Trip records

---

### BusStop

Bus stop locations.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `name` | String | Stop name |
| `latitude` | Float | Location latitude |
| `longitude` | Float | Location longitude |
| `arrivalTime` | String | Expected arrival time |
| `routeId` | String | Route ID |

---

### Trip

Trip tracking records.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `busId` | String | Bus ID |
| `routeId` | String | Route ID |
| `driverId` | String | Driver ID |
| `startTime` | DateTime | Trip start time |
| `endTime` | DateTime? | Trip end time |
| `status` | TripStatus | STARTED/IN_PROGRESS/COMPLETED |

---

## Hostel Models

### Hostel

Hostel information.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `name` | String | Hostel name |
| `type` | HostelType | BOYS/GIRLS/MIXED |
| `capacity` | Int | Total capacity |
| `schoolId` | String | School ID |

---

### Room

Hostel room information.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `roomNumber` | String | Room number |
| `hostelId` | String | Hostel ID |
| `capacity` | Int | Room capacity |
| `floor` | Int | Floor number |
| `type` | RoomType | SHARED/PRIVATE |

---

### RoomAllocation

Student room allocations.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `studentId` | String | Student ID |
| `roomId` | String | Room ID |
| `startDate` | DateTime | Allocation start date |
| `endDate` | DateTime? | Allocation end date |
| `status` | AllocationStatus | ACTIVE/EXPIRED |

---

## Library Models

### Book

Library book catalog.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `title` | String | Book title |
| `author` | String | Author name |
| `isbn` | String? | ISBN number |
| `category` | String | Book category |
| `quantity` | Int | Total copies |
| `available` | Int | Available copies |
| `libraryId` | String | Library ID |

---

### BookIssue

Book issue/return records.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `bookId` | String | Book ID |
| `userId` | String | User ID |
| `issueDate` | DateTime | Issue date |
| `dueDate` | DateTime | Due date |
| `returnDate` | DateTime? | Return date |
| `status` | IssueStatus | ISSUED/RETURNED/OVERDUE |
| `fine` | Float? | Late return fine |

---

## Indexes and Performance

### Key Indexes

1. **User lookups**: `email`, `phone`, `userName`
2. **School filtering**: `schoolId` on most tables
3. **Date range queries**: `createdAt`, `date` fields
4. **Status filtering**: `status` fields
5. **Composite indexes**: `schoolId + status`, `schoolId + role`

### Query Optimization Tips

1. Always include `schoolId` in queries for multi-tenant filtering
2. Use `select` to fetch only required fields
3. Use `include` judiciously to avoid N+1 queries
4. Implement pagination for large datasets
5. Use database indexes for frequently queried fields

---

## Database Migrations

### Creating Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Migration Best Practices

1. Always test migrations in development first
2. Backup production database before migrations
3. Use descriptive migration names
4. Review generated SQL before applying
5. Plan for data migrations when changing schemas

---

**Last Updated:** January 2026
