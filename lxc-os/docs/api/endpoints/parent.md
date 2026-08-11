# Parent Dashboard API Documentation

This document covers all API endpoints available for the Parent Dashboard.

## General
### Get Parent Dashboard Data
- **Endpoint**: `GET /api/v1/dashboard/parent`
- **Description**: Returns summary data for the parent dashboard, including information about all linked children, their attendance, and fee status.

---

## Communication
### List Chats
- **Endpoint**: `GET /api/v1/communication/chat`
- **Description**: Fetches chat conversations with teachers or school staff.

### Send Message
- **Endpoint**: `POST /api/v1/communication/chat`
- **Description**: Sends a message in a chat conversation.

---

## Finance
### View Fee Invoices
- **Endpoint**: `GET /api/v1/finance/invoice/view`
- **Description**: Returns fee invoices for the parent's children.

### Make Payment
- **Endpoint**: `POST /api/v1/finance/payments/collect`
- **Description**: Initiates a payment for pending fees.
