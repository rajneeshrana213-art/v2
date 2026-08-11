# Transport Module API Documentation

This document covers all API endpoints for school transport, fleet management, and real-time tracking.

## Fleet & Personnel
### Buses
- **Manage Buses**: `GET/POST/PATCH/DELETE /api/v1/transport/buses`
- **Description**: Manages school vehicle inventory and details.

### Drivers
- **Manage Drivers**: `GET/POST/PATCH/DELETE /api/v1/transport/drivers`
- **Driver Profile**: `GET /api/v1/transport/driver`
- **Description**: Manages transport staff and driver assignments.

---

## Routes & Logistics
### Routes & Stops
- **Manage Routes**: `GET/POST /api/v1/transport/routes`
- **Manage Stops**: `GET/POST /api/v1/transport/stops`
- **Description**: Defines geographical routes and designated pickup/drop-off points.

### Trips
- **Manage Trips**: `GET/POST /api/v1/transport/trips`
- **Description**: Records and schedules daily transport trips.

---

## Real-time Features
### Tracking
- **Live Tracking**: `GET /api/v1/transport/tracking`
- **Trip Progress**: `GET /api/v1/transport/tracking/[tripId]`
- **Description**: Real-time GPS tracking for buses and trips.

### Safety & SOS
- **SOS Alerts**: `GET/POST /api/v1/transport/sos`
- **Description**: Emergency alert system for drivers and transport admins.

---

## Overview
### Dashboard
- **Admin Dashboard**: `GET /api/v1/transport/dashboard`
- **Description**: Summary of fleet status, active trips, and route efficiency.
