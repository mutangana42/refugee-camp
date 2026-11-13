# Refugee Camp Resource Distribution API

Express 5 REST API backed by MySQL. It provides JWT authentication, role-based access, refugee and camp records, donation receiving, inventory control, request approval, distribution tracking, notifications, audit logs, and reports.

## Setup

1. Install MySQL 8+ and Node.js 20+.
2. Copy `.env.example` to `.env` and set the database credentials, a strong `JWT_SECRET`, and an initial `ADMIN_PASSWORD`.
3. Run:

```powershell
npm install
npm run migrate
npm run seed:admin
npm run dev
```

The migration command creates `refugee_camp_db` if necessary. The API defaults to `http://localhost:5000`; health is available at `GET /health`.

## Authentication

Log in with `POST /api/v1/auth/login`:

```json
{ "username": "admin", "password": "your-password" }
```

Send the returned token on protected requests:

```text
Authorization: Bearer <token>
```

Roles are Administrator, Manager, Volunteer, Donor, Refugee, and Warehouse Officer. Write operations are restricted by role at the route level.

## Main endpoints

All paths below start with `/api/v1`.

| Area | Endpoints |
| --- | --- |
| Authentication | `POST /auth/login`, `GET /auth/me`, `PATCH /auth/password` |
| Users | `GET/POST /users`, `GET/PATCH /users/:id` |
| Camp | CRUD `/zones`, `/shelters` |
| Beneficiaries | CRUD `/families`, `/refugees` |
| Resource catalogue | CRUD `/resource-categories`, `/resources` |
| Donors | CRUD `/donors` |
| Donations | `GET/POST /donations`, `GET /donations/:id` |
| Inventory | `GET /inventory`, `PATCH /inventory/:resourceId/adjust`, `GET /stock-movements` |
| Requests | `GET/POST /resource-requests`, `GET /resource-requests/:id`, `PATCH /resource-requests/:id/review` |
| Distributions | `GET/POST /distributions`, `GET /distributions/:id` |
| Reports | `GET /reports/dashboard`, `/reports/inventory`, `/reports/distributions`, `/reports/donations` |
| Other | `GET /notifications`, `PATCH /notifications/:id/read`, `GET /audit-logs` |

List endpoints generated from standard resources accept `page`, `limit`, `search`, and resource-specific filters.

## Transaction payloads

Receive a donation (stock is increased atomically):

```json
{
  "donor_id": 1,
  "donation_date": "2026-06-28",
  "remarks": "Monthly delivery",
  "items": [
    { "resource_id": 1, "quantity": 500, "unit_cost": 1.25 },
    { "resource_id": 2, "quantity": 200 }
  ]
}
```

Create a distribution (stock is checked, locked, and reduced atomically):

```json
{
  "refugee_id": 1,
  "request_id": 4,
  "remarks": "Approved weekly allocation",
  "items": [
    { "resource_id": 1, "quantity": 5 },
    { "resource_id": 2, "quantity": 2 }
  ]
}
```

When `request_id` is supplied, it must be approved, belong to the same refugee, and the distribution cannot exceed its requested items. Successful distribution marks it completed.

## Response and error shape

Successful responses use `{ "data": ... }`; paginated lists also include `pagination`. Errors use:

```json
{ "error": { "message": "Validation failed", "details": [] } }
```
