# Admin Dashboard API Documentation

This document covers all API endpoints available for the Admin Dashboard. All endpoints require authentication and a valid `schoolId`.

## General
### Get Admin Features
- **Endpoint**: `GET /api/v1/dashboard/admin-features`
- **Description**: Returns all features and their status for the current school.

### Get Subscription Status
- **Endpoint**: `GET /api/v1/dashboard/admin-subscription-status`
- **Description**: Returns the subscription status and plan model for the current school.

---

## Students
### List Students
- **Endpoint**: `GET /api/v1/dashboard/admin/students`
- **Query Parameters**: `page`, `limit`, `search`, `classId`, `status`
- **Description**: Fetches a paginated list of students.

### Register Student
- **Endpoint**: `POST /api/v1/dashboard/admin/students`
- **Body**: `registerStudentSchema` (Multi-part form data for profile pic)
- **Description**: Registers a new student and their parent.

### Bulk Upload Students
- **Endpoint**: `POST /api/v1/dashboard/admin/students/bulk-upload`
- **Body**: Array of student objects.
- **Description**: Bulk registers students and streams progress.

### Student Details/Update/Delete
- **Endpoint**: `GET/PATCH/DELETE /api/v1/dashboard/admin/students/[id]`
- **Description**: Operations for a specific student.

---

## Teachers
### List Teachers
- **Endpoint**: `GET /api/v1/dashboard/admin/teachers`
- **Query Parameters**: `page`, `limit`, `search`, `status`
- **Description**: Fetches a paginated list of teachers.

### Register Teacher
- **Endpoint**: `POST /api/v1/dashboard/admin/teachers`
- **Body**: Multi-part form data.
- **Description**: Registers a new teacher.

---

## Classes & Sections
### List Classes
- **Endpoint**: `GET /api/v1/dashboard/admin/classes`
- **Description**: Fetches all classes for the school.

### Create Class
- **Endpoint**: `POST /api/v1/dashboard/admin/classes`
- **Description**: Creates a new class.

### List Sections
- **Endpoint**: `GET /api/v1/dashboard/admin/sections`
- **Query Parameters**: `classId`
- **Description**: Fetches sections, optionally filtered by class.

---

## Timetable
### List Timetables
- **Endpoint**: `GET /api/v1/dashboard/admin/timetable`
- **Query Parameters**: `classId`, `sectionId`
- **Description**: Fetches timetables for a class and section.

### Create/Save Timetable
- **Endpoint**: `POST /api/v1/dashboard/admin/timetable`
- **Description**: Creates or updates a timetable entry.

### Copy Timetable
- **Endpoint**: `POST /api/v1/dashboard/admin/timetable/copy`
- **Description**: Copies timetable from one section to another.

---

## Roles & Permissions
### List Roles
- **Endpoint**: `GET /api/v1/dashboard/admin/roles`
- **Description**: Fetches all roles in the school.

### Update Permissions
- **Endpoint**: `POST /api/v1/dashboard/admin/roles/permissions`
- **Description**: Updates permissions for a specific role.

---

## Staff Management
### List Staff
- **Endpoint**: `GET /api/v1/dashboard/admin/staff`
- **Description**: Fetches all non-teaching staff.

### Bulk Upload Staff
- **Endpoint**: `POST /api/v1/dashboard/admin/staff/bulk-upload`
- **Description**: Bulk registers staff members.

---

## Tickets & Feedback
### List Tickets
- **Endpoint**: `GET /api/v1/dashboard/admin/tickets`
- **Description**: Fetches support tickets.

### Ticket Stats
- **Endpoint**: `GET /api/v1/dashboard/admin/tickets/stats`
- **Description**: Returns quick stats for student/parent tickets.

### List Feedback
- **Endpoint**: `GET /api/v1/dashboard/admin/feedback`
- **Description**: Fetches user feedback/surveys.
