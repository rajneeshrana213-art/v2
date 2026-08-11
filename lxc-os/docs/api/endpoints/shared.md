# Shared & Miscellaneous API Documentation

This document covers cross-cutting APIs and specialized modules like Library and Authentication.

## Authentication & Account
### Change Password
- **Endpoint**: `POST /api/v1/auth/change-password`
- **Description**: Allows authenticated users to change their password.

### Forgot/Reset Password
- **Endpoints**: `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`
- **Description**: Password recovery flow.

### User Account
- **Endpoint**: `GET/PATCH /api/v1/account`
- **Description**: Manages personal account settings.

---

## Library Management
### Books
- **Endpoint**: `GET/POST /api/v1/library/books`
- **Description**: Manages the school library book collection.

### Book Issues & Fines
- **Endpoints**: `GET /api/v1/library/issues`, `GET /api/v1/library/fines`
- **Description**: Tracks borrowed books and outstanding fines.

---

## Academic Entities
### General Academic Data
- **Endpoint**: `GET /api/v1/academic/[entity]`
- **Description**: Generic endpoint for fetching academic entities like years, terms, etc.

---

## Attendance
### Marking Attendance
- **Endpoint**: `POST /api/v1/attendance/mark`
- **Description**: Unified endpoint for marking student/teacher/staff attendance.

---

## Communication
### Users & Contacts
- **List Users**: `GET /api/v1/communication/users`
- **Description**: Fetches contact lists for chat/communication.

### Call Services
- **Manage Calls**: `GET/POST /api/v1/communication/call`
- **Description**: Integration with voice/video call services.

---

## Analytics
### System Analytics
- **Basic Usage**: `GET /api/v1/analytics/basic-usage`
- **Role Analytics**: `GET /api/v1/analytics/roles`
- **Module Analytics**: `GET /api/v1/analytics/schools-modules`
- **Description**: Detailed system-wide analytics for admins and super-admins.

---

## AI Services
### Timetable Generation
- **Endpoint**: `POST /api/v1/ai-timetable`
- **Description**: Triggers AI-based timetable generation.
