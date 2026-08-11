# Teacher Dashboard API Documentation

This document covers all API endpoints available for the Teacher Dashboard.

## General
### Get Teacher Dashboard Data
- **Endpoint**: `GET /api/v1/dashboard/teacher`
- **Description**: Returns summary data for the teacher dashboard, including class schedule, attendance overview, and pending tasks.

---

## Academic
### Class Schedule
- **Endpoint**: `GET /api/v1/teacher/dashboard/academic`
- **Description**: Returns the academic schedule and classes assigned to the teacher.

### Assignments
- **Endpoint**: `GET/POST /api/v1/teacher/dashboard/assignment`
- **Description**: Allows teachers to create and manage assignments for their classes.

### Assessments
- **Endpoint**: `GET/POST /api/v1/teacher/dashboard/assessment`
- **Description**: Allows teachers to create and manage student assessments and grades.

---

## Profile
### Get Teacher Profile
- **Endpoint**: `GET /api/v1/teacher/dashboard/profile`
- **Description**: Returns the teacher's profile and contract details.

---

## Registration
### Register Teacher (Self/Public)
- **Endpoint**: `POST /api/v1/teacher/register`
- **Body**: Multi-part form data (profile pic, resume, joining letter)
- **Description**: Public or self-registration for teachers.
