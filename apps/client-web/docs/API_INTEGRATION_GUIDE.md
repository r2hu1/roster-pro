# API Integration Guide

Base URL: `https://api.yourdomain.com/v1`

All 5 endpoints used in the QR code flow are **public** — no session or API key required.

### Next.js API Rewrites

In the client-web app, all API calls are proxied via Next.js rewrites (see `next.config.ts`):

```
/api/:path*  →  ${API_URL}/v1/:path*
```

This means in the frontend code you use `/api/organization/table/token/decode` instead of `https://api.../v1/organization/table/token/decode`. The `API_URL` env var defaults to `http://localhost:3000` in development.

**Example:** `GET /api/organization/table/token/decode?token=...` proxies to `GET http://localhost:3000/v1/organization/table/token/decode?token=...`

---

## Flow Overview

```
User scans QR code
       |
       v
GET /api/organization/table/token/decode?token=<encrypted_token>
       |
       +--> Returns: { organization, table }
       |
       v
POST /api/organization/menu/all  (body: { organizationId })
       |
       +--> Returns: menu categories with items
       |
       v
POST /api/organization/orders     (body: { organizationId, items, totals... })
       |
       +--> Returns: created order with invoiceNumber
       |
       v
GET /api/organization/orders/:id/stream?organizationId=<orgId>  (SSE)
       |
       +--> Real-time order and status updates
       |
       v
GET /api/organization/orders/:orderId/invoice?organizationId=<orgId>
       |
       +--> Final invoice for display/print
```

---

## 1. Decode QR Token

Decrypts the token embedded in the QR code to get organization & table details.

```
GET /api/organization/table/token/decode?token=<encrypted_token>
```

### Response

```json
{
  "status": "success",
  "code": 200,
  "data": {
    "organization": {
      "id": "uuid",
      "name": "Restaurant Name",
      "logo": "https://...",
      "phone": "+91-9999999999",
      "address": "123 Street, City"
    },
    "table": {
      "id": "uuid",
      "name": "Table-01",
      "status": "available",
      "number": "01"
    }
  }
}
```

### Errors

| Code | Message |
|------|---------|
| 400  | Token is required |
| 401  | Invalid QR code. |
| 404  | Invalid QR code, table not found. |
| 500  | Failed to decode QR token |

---

## 2. Get Menu (with items)

Fetch all menu categories with their items for the organization.

```
POST /api/organization/menu/all
Content-Type: application/json

{
  "organizationId": "uuid (from token decode)"
}
```

### Response

```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": "uuid",
      "menu": "Starters",
      "items": [
        {
          "id": "uuid",
          "menuId": "uuid",
          "organizationId": "uuid",
          "name": "Paneer Tikka",
          "description": "Grilled cottage cheese",
          "ingredients": ["paneer", "spices"],
          "price": { "half": 150, "full": 280 },
          "image": "https://...",
          "category": "veg",
          "isAvailable": true,
          "isVegetarian": true,
          "preparationTime": 15
        }
      ]
    }
  ]
}
```

### Notes

- Results are **cached in Redis for 300 seconds**.
- `price` is an object with `half` and `full` variants.
- `isAvailable: false` means the item is temporarily out of stock.

---

## 3. Create Order

Submit the customer's order with selected items and calculated totals.

```
POST /api/organization/orders
Content-Type: application/json

{
  "organizationId": "uuid",
  "tableNumber": "01",
  "subtotal": 560,
  "taxableAmount": 560,
  "grandTotal": 660.8,
  "customerName": "John Doe",
  "customerPhone": "9999999999",
  "customerEmail": "john@example.com",
  "items": [
    {
      "menuItemId": "uuid",
      "name": "Paneer Tikka",
      "variant": "full",
      "quantity": 2,
      "unitPrice": 280,
      "notes": "Extra spicy"
    }
  ],
  "cgstAmount": 50.4,
  "sgstAmount": 50.4,
  "roundOff": 0
}
```

### Variant Values

| Value  | Meaning         |
|--------|-----------------|
| `half` | Half portion    |
| `full` | Full portion    |

### Response (201 Created)

```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "uuid",
    "organizationId": "uuid",
    "invoiceNumber": "INV-2026-000001",
    "tableNumber": "01",
    "status": "pending",
    "paymentStatus": "pending",
    "items": [ ... ],
    "subtotal": 560,
    "discount": 0,
    "taxableAmount": 560,
    "cgstAmount": 50.4,
    "sgstAmount": 50.4,
    "igstAmount": 0,
    "roundOff": 0,
    "grandTotal": 660.8,
    "notes": null,
    "createdAt": "2026-07-08T10:30:00Z",
    "updatedAt": "2026-07-08T10:30:00Z"
  }
}
```

### Notes

- `invoiceNumber` is auto-generated in the format `INV-{YYYY}-{000001}`.
- Setting `status` or `paymentStatus` is optional — defaults to `"pending"`.
- The associated table's status is automatically updated to `"occupied"`.

---

## 4. Live Order Status (SSE)

Get real-time updates on the order status via Server-Sent Events.

```
GET /api/organization/orders/:id/stream?organizationId=<orgId>
```

### Events

| Event   | Payload                          | When                     |
|---------|----------------------------------|--------------------------|
| `init`  | Full `OrderResponse` object      | On connection            |
| `created` | Full `OrderResponse` object    | Order is created         |
| `updated` | Full `OrderResponse` object    | Order status is updated  |
| `deleted` | `{ id: "uuid" }`              | Order is deleted         |
| `ping`  | Empty (heartbeat)                | Every 30 seconds         |

### Usage Example (Browser)

```js
const evtSource = new EventSource(
  `/api/organization/orders/${orderId}/stream?organizationId=${orgId}`
);

evtSource.addEventListener("init", (e) => {
  const order = JSON.parse(e.data);
  // Render initial order state
});

evtSource.addEventListener("updated", (e) => {
  const order = JSON.parse(e.data);
  // Update UI with new status
});

evtSource.addEventListener("ping", () => {
  // Connection is alive — optional
});
```

### Status Values (Order Status Flow)

```
pending → confirmed → preparing → ready → served → completed
                                                      ↓
                                                  cancelled
```

---

## 5. Get Invoice / Receipt

Fetch the formatted invoice for display or printing.

```
GET /api/organization/orders/:orderId/invoice?organizationId=<orgId>
```

### Response

```json
{
  "status": "success",
  "code": 200,
  "data": {
    "invoiceNumber": "INV-2026-000001",
    "issuedAt": "2026-07-08T10:30:00Z",
    "organization": {
      "id": "uuid",
      "name": "Restaurant Name",
      "address": "123 Street, City",
      "phone": "+91-9999999999",
      "gstin": "GSTIN12345"
    },
    "customer": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9999999999",
      "tableNumber": "01"
    },
    "items": [
      {
        "id": "uuid",
        "name": "Paneer Tikka",
        "logo": null,
        "quantity": 2,
        "unitPrice": 280,
        "total": 560
      }
    ],
    "totals": {
      "subtotal": 560,
      "discount": 0,
      "taxableAmount": 560,
      "cgst": 50.4,
      "sgst": 50.4,
      "igst": 0,
      "roundOff": 0,
      "grandTotal": 660.8
    },
    "payment": {
      "status": "pending",
      "method": null
    },
    "notes": null
  }
}
```

---

## Common Response Envelope

Every endpoint returns a consistent envelope:

```json
{
  "status": "success" | "error",
  "code": 200,
  "data": { ... },
  "message": "..."          // only on error
}
```

---

## Full Integration Sequence (Pseudocode)

```ts
// Step 1: Extract token from QR code URL
const token = extractTokenFromUrl(qrCodeUrl) // "https://url.com/<token>"

// Step 2: Decode token
const { organization, table } = await fetch(
  `/api/organization/table/token/decode?token=${token}`
).then(r => r.json()).then(d => d.data)

// Step 3: Fetch menu
const menu = await fetch(`/api/organization/menu/all`, {
  method: "POST",
  body: JSON.stringify({ organizationId: organization.id }),
  headers: { "Content-Type": "application/json" }
}).then(r => r.json()).then(d => d.data)

// Step 4: User builds cart, confirms → create order
const order = await fetch(`/api/organization/orders`, {
  method: "POST",
  body: JSON.stringify({
    organizationId: organization.id,
    tableNumber: table.number,
    subtotal: cart.subtotal,
    taxableAmount: cart.taxableAmount,
    grandTotal: cart.grandTotal,
    items: cart.items.map(i => ({
      menuItemId: i.id,
      name: i.name,
      variant: i.variant,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    cgstAmount: cart.cgst,
    sgstAmount: cart.sgst,
  }),
  headers: { "Content-Type": "application/json" }
}).then(r => r.json()).then(d => d.data)

// Step 5: Listen to real-time updates
const sse = new EventSource(
  `/api/organization/orders/${order.id}/stream?organizationId=${organization.id}`
)

// Step 6: When order is served/completed → show invoice
const invoice = await fetch(
  `/api/organization/orders/${order.id}/invoice?organizationId=${organization.id}`
).then(r => r.json()).then(d => d.data)
```
