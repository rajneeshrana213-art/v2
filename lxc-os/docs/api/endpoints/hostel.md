# Hostel Module API Documentation

This document covers all API endpoints for hostel management, room allocation, and resident services.

## Infrastructure
### Rooms & Accommodation
- **Manage Rooms**: `GET/POST /api/v1/hostel/rooms`
- **Hostel Details**: `GET /api/v1/hostel`
- **Description**: Manages physical hostel infrastructure and room inventory.

### Room Assignment
- **Manage Assignments**: `GET/POST /api/v1/hostel/accommodation`
- **Student Specific**: `GET /api/v1/hostel/[id]` (Specific student record)
- **Description**: Allocates rooms to students and manages check-in/out.

---

## Services & Fees
### Hostel Fees
- **Manage Fees**: `GET/POST /api/v1/hostel/fees`
- **Description**: Handles hostel-specific billings and fee structures.

### Inventory & Maintenance
- **Inventory**: `GET/POST /api/v1/hostel/inventory`
- **Complaints**: `GET/POST /api/v1/hostel/complaints`
- **Description**: Tracks hostel assets and student maintenance requests.

---

## Welfare & Health
### Medical & Outpass
- **Medical Records**: `GET/POST /api/v1/hostel/medical`
- **Outpass Management**: `GET/POST /api/v1/hostel/outpass`
- **Description**: Manages resident health records and leave permits.

### Expenses
- **Hostel Expenses**: `GET/POST /api/v1/hostel/expenses`
- **Description**: Tracks operational costs specific to the hostel.
