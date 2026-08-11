# Finance Module API Documentation

This document covers all API endpoints for the Finance Engine, including fee management, expenses, salary, and reporting.

## Fee Management
### Invoices
- **List Invoices**: `GET /api/v1/finance/invoice/view`
- **Create Ad-hoc Invoice**: `POST /api/v1/finance/ad-hoc-invoice`
- **Description**: Manages student fee invoices and custom billings.

### Payment Collection
- **Collect Payment**: `POST /api/v1/finance/collect` or `POST /api/v1/finance/payments/collect`
- **Payment History**: `GET /api/v1/finance/payments`
- **Description**: Handles fee collection from parents/students.

### Concessions & Groups
- **Fee Groups**: `GET/POST /api/v1/finance/fee-groups`
- **Concessions**: `GET/POST /api/v1/finance/concessions`
- **Description**: Manages fee structures and student-specific discounts.

---

## Operations
### Expenses & Income
- **Expenses**: `GET/POST /api/v1/finance/expenses`
- **Income**: `GET/POST /api/v1/finance/income`
- **Categories**: `GET/POST /api/v1/finance/expense-categories`
- **Description**: Tracks non-fee income and school expenditures.

### Salary Management
- **List Salaries**: `GET /api/v1/finance/salary`
- **Process Payroll**: `POST /api/v1/finance/salary`
- **Description**: Manages staff and teacher payroll.

---

## Accounting & Audit
### Ledger & Transactions
- **General Ledger**: `GET /api/v1/finance/ledger`
- **Transactions**: `GET /api/v1/finance/transactions`
- **Reversals**: `POST /api/v1/finance/reversal`
- **Description**: Core accounting records and transaction adjustment.

### Reporting
- **Financial Reports**: `GET /api/v1/finance/reports`
- **Audit Logs**: `GET /api/v1/finance/audit`
- **Finance Dashboard Stats**: `GET /api/v1/finance/dashboard`
- **Description**: Aggregate data for financial analysis and compliance.

---

## System Integration
### Webhooks
- **Payment Gateway Webhook**: `POST /api/v1/finance/webhook`
- **Description**: Receives asynchronous updates from payment providers.
