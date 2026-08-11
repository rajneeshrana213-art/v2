# Super-admin Dashboard API Documentation

This document covers all API endpoints available for the Super-admin Dashboard. These endpoints are for global system management.

## General
### Get Super-admin Dashboard Data
- **Endpoint**: `GET /api/v1/dashboard/super-admin` or `GET /api/v1/superadmin/dashboard`
- **Description**: Returns global summary data, including total schools, active subscriptions, and system-wide revenue.

### System Health
- **Endpoint**: `GET /api/v1/superadmin/system-health`
- **Description**: Returns status of various system services and database health.

---

## School Management
### List Schools
- **Endpoint**: `GET /api/v1/superadmin/schools`
- **Description**: Returns a list of all registered schools.

### Create School
- **Endpoint**: `POST /api/v1/superadmin/schools/create`
- **Description**: Provisions a new school, creates an admin user, and initializes default settings.

### School Details/Update
- **Endpoint**: `GET/PATCH /api/v1/superadmin/schools/[id]`
- **Description**: Operations for a specific school.

---

## Subscription & Finance
### Active Subscriptions
- **Endpoint**: `GET /api/v1/superadmin/subscription-control`
- **Description**: Manages global subscription plans and school-specific overrides.

### System Transactions
- **Endpoint**: `GET /api/v1/superadmin/transactions`
- **Description**: Returns all financial transactions across the platform.

---

## User Support
### Global Support Tickets
- **Endpoint**: `GET /api/v1/superadmin/tickets`
- **Description**: Returns support tickets from school admins.
