# API Documentation Index

Welcome to the LearnXChain API Documentation. This documentation is organized by dashboard context to provide easy access for frontend developers.

## Dashboard-Specific APIs

- **[Admin Dashboard](file:///a:/LearnXChain/docs/api-docs/admin.md)**
  - Student & Teacher Registration
  - Class & Section Management
  - Roles & Permissions
  - Staff Management
  - Support Tickets

- **[Student Dashboard](file:///a:/LearnXChain/docs/api-docs/student.md)**
  - Performance Overview
  - Assignments & Homework
  - Learning Roadmaps
  - Leaderboards

- **[Teacher Dashboard](file:///a:/LearnXChain/docs/api-docs/teacher.md)**
  - Class Schedule
  - Student Progress Tracking
  - Assignment Creation
  - Profile Management

- **[Parent Dashboard](file:///a:/LearnXChain/docs/api-docs/parent.md)**
  - Children Tracking
  - Communication with School
  - Fee Payments

- **[Super-admin Dashboard](file:///a:/LearnXChain/docs/api-docs/super-admin.md)**
  - School Management
  - Global Subscription Control
  - System Health & Analytics

- **[Finance Engine](file:///a:/LearnXChain/docs/api-docs/finance.md)**
  - Fee Invoicing & Collection
  - Salary & Payroll
  - Expenses & Income
  - Financial Reporting

- **[Transport Module](file:///a:/LearnXChain/docs/api-docs/transport.md)**
  - Fleet & Driver Management
  - Route & Trip Planning
  - Real-time Tracking & SOS

- **[Hostel Management](file:///a:/LearnXChain/docs/api-docs/hostel.md)**
  - Room Allocation
  - Resident Inventory
  - Medical & Outpass Records

- **[Shared & Miscellaneous APIs](file:///a:/LearnXChain/docs/api-docs/shared.md)**
  - Authentication & Account
  - Library Management
  - Academic Entities
  - AI Services

---

## Shared Features (Miscellaneous)

### Analytics
- **Summary Analytics**: `GET /api/v1/analytics`
- **Description**: Common analytics endpoints used across multiple dashboards.

### Notifications
- **List Notifications**: `GET /api/v1/notification`
- **Mark as Read**: `PATCH /api/v1/notification/[id]`
- **Description**: Unified notification system for all users.

### Transport
- **Fleet Management**: `GET /api/v1/transport`
- **Route Tracking**: `GET /api/v1/transport/routes`
- **Description**: Endpoints for school transport management.

### Hostel
- **Room Assignment**: `POST /api/v1/hostel/assign`
- **Fee Management**: `GET /api/v1/hostel/fees`
- **Description**: Hostel management APIs.
