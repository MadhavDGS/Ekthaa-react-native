# Ekthaa React Business - API Documentation

**Base URL**: `https://ekthaa-react-business.onrender.com/api`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Endpoints

### 1. Register Business
**POST** `/auth/register`

**Request Body:**
```json
{
  "business_name": "string (required)",
  "phone_number": "string (10 digits, required)",
  "password": "string (required)"
}
```

**Response:** `200 OK`
```json
{
  "message": "Registration successful",
  "token": "jwt_token_string",
  "user": {
    "id": "user_id",
    "name": "Business Name",
    "phone_number": "1234567890",
    "user_type": "business"
  },
  "business": {
    "id": "business_id",
    "name": "Business Name",
    "access_pin": "1234",
    "is_active": true
  }
}
```

### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "phone_number": "string (10 digits)",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": "user_id",
    "name": "Business Name",
    "phone_number": "1234567890",
    "user_type": "business"
  },
  "business": {
    "id": "business_id",
    "name": "Business Name",
    "access_pin": "1234"
  }
}
```

---

## 📊 Dashboard

### Get Dashboard Data
**GET** `/dashboard` 🔒

**Response:** `200 OK`
```json
{
  "summary": {
    "total_credit": 1002253,
    "total_payment": 645534,
    "total_customers": 17,
    "outstanding_balance": 346042,
    "pending_customers_count": 14,
    "recent_customers": [
      {
        "id": "customer_id",
        "name": "Customer Name",
        "balance": 15000
      }
    ]
  },
  "recent_transactions": [
    {
      "$id": "transaction_id",
      "business_id": "b07ad21c-938f-460b-9e7b-faae6a45ebd0",
      "customer_id": "e7784f84-e9e8-4a9e-8fb8-8469ed5299c8",
      "transaction_type": "credit",
      "amount": 5000,
      "notes": "",
      "payment_method": null,
      "receipt_image_url": null,
      "bill_image_url": null,
      "media_url": null,
      "transaction_reference": null,
      "recurring_transaction_id": null,
      "created_at": "2025-12-18T04:34:34.123+00:00",
      "created_by": null,
      "updated_at": null,
      "type": null
    }
  ]
}
```

**Note:** Transaction objects include Appwrite metadata fields like `$id`, `$createdAt`, etc.

---

## 👥 Customers

### 1. Get All Customers
**GET** `/customers` 🔒

**Response:** `200 OK`
```json
{
  "customers": [
    {
      "id": "customer_id",
      "name": "Customer Name",
      "phone_number": "9876543210",
      "address": "123 Main St",
      "balance": 15000,
      "total_credit": 50000,
      "total_payment": 35000,
      "created_at": "2025-01-15T12:00:00Z"
    }
  ]
}
```

### 2. Get Single Customer
**GET** `/customer/<customer_id>` 🔒

**Response:** `200 OK`
```json
{
  "customer": {
    "id": "customer_id",
    "name": "Customer Name",
    "phone_number": "9876543210",
    "address": "123 Main St",
    "balance": 15000,
    "total_credit": 50000,
    "total_payment": 35000,
    "created_at": "2025-01-15T12:00:00Z"
  }
}
```

### 3. Get Customer Transactions
**GET** `/customer/<customer_id>/transactions` 🔒

**Response:** `200 OK`
```json
{
  "transactions": [
    {
      "$id": "transaction_id",
      "transaction_type": "credit",
      "amount": 5000,
      "notes": "Purchase",
      "created_at": "2025-12-18T04:34:34.123+00:00"
    }
  ]
}
```

### 4. Add Customer
**POST** `/customer` 🔒

**Request Body:**
```json
{
  "name": "string (required)",
  "phone_number": "string (10 digits, required)",
  "address": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "message": "Customer added successfully",
  "customer": {
    "id": "customer_id",
    "name": "Customer Name",
    "phone_number": "9876543210",
    "ad$id": "transaction_id",
      "business_id": "business_id",
      "customer_id": "customer_id",
      "transaction_type": "credit",
      "amount": 5000,
      "notes": "",
      "payment_method": null,
      "receipt_image_url": null,
      "bill_image_url": null,
      "media_url": null,
      "transaction_reference": null,
      "recurring_transaction_id": null,
      "created_at": "2025-12-18T04:34:34.123+00:00",
      "created_by": null,
      "updated_at": null,
      "type": null
    }
  ]
}
```

### 2. Create Transaction
**POST** `/transaction` 🔒

**Request Body:**
```json
{
  "customer_id": "string (required)",
  "type": "credit | payment (required)",
  "amount": "number (required)",
  "notes": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "message": "Transaction created successfully",
  "transaction": {
    "id": "transaction_id",
    "type": "credit",
    "amount": 5000,
    "notes": "Payment received"
  }
}
```

**⚠️ Note:** Backend does NOT support transaction update or delete operations.json
{
  "customer_id": "string (required)",
  "type": "credit | payment (required)",
  "amount": "number (required)",
  "notes": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "message": "Transaction created successfully",
  "transaction": {
    "id": "transaction_id",
    "type": "credit",
    "amount": 5000,
    "notes": "Payment received"
  }
}
```

---

## 📦 Products

### 1. Get All Products
**GET** `/products` 🔒

**Response:** `200 OK`
```json
{
  "products": [
    {
      "id": "product_id",
      "name": "Product Name",
      "category": "Food & Groceries",
      "subcategory": "Rice",
      "description": "Premium quality rice",
      "price": 2550.00,
      "unit": "ml",
      "stock_quantity": 30,
      "low_stock_threshold": 10,
      "is_low_stock": false,
      "is_public": true,
      "product_image_url": "https://cloudinary.com/...",
      "hsn_code": "10063021",
      "created_at": "2025-12-20T08:00:00Z"
    }
  ]
}
```

### 2. Get Single Product
**GET** `/product/<product_id>` 🔒

**Response:** `200 OK`
```json
{
  "product": {
    "id": "product_id",
    "name": "Product Name",
    "category": "Food & Groceries",
    "price": 2550.00,
    "stock_quantity": 30
  }
}
```

### 3. Add Product
**POST** `/product` 🔒

**Request Body:**
```json
{
  "name": "string (required)",
  "category": "string (required)",
  "subcategory": "string (optional)",
  "price": "number (required)",
  "unit": "string (required)",
  "stock_quantity": "number (required)",
  "low_stock_threshold": "number (optional, default: 10)",
  "description": "string (optional)",
  "is_public": "boolean (optional, default: false)",
  "hsn_code": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "message": "Product added successfully",
  "product": {
    "id": "product_id",
    "name": "Product Name",
    "price": 2550.00
  }
}
```

### 4. Update Product
**PUT** `/product/<product_id>` 🔒

**Request Body:** Same as Add Product

**Response:** `200 OK`
```json
{
  "message": "Product updated successfully",
  "product": { ... }
}
```

### 5. Delete Product
**DELETE** `/product/<product_id>` 🔒

**Response:** `200 OK`
```json
{
  "message": "Product deleted successfully"
}
```

### 6. Get Product Categories
**GET** `/products/categories` 🔒

**Response:** `200 OK`
```json
{
  "categories": [
    "Food & Groceries",
    "Beverages",
    "Personal Care",
    "Electronics"
  ]
}
```

### 7. Get Product Units
**GET** `/products/units` 🔒

**Response:** `200 OK`
```json
{
  "units": [
    "Piece",
    "Kg",
    "Litre",
    "Meter",
    "Box",
    "Packet"
  ]
}
```

---

## 👤 Business Profile

### 1. Get Profile
**GET** `/profile` 🔒

**Response:** `200 OK`
```json
{
  "business": {
    "id": "business_id",
    "user_id": "user_id",
    "name": "Devi kirana",
    "phone_number": "1234567890",
    "email": "business@example.com",
    "gst_number": "GST12345",
    "description": "Quality products store",
    "access_pin": "1234",
    "location": "Main Street",
    "address": "123 Main St, City",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "profile_image_url": "https://cloudinary.com/...",
    "is_active": true,
    "total_customers": 17,
    "total_transactions": 136,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### 2. Update Profile
**PUT** `/profile` 🔒

**Request Body:**
```json
{
  "name": "string",
  "phone_number": "string (10 digits)",
  "email": "string",
  "gst_number": "string",
  "description": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "pincode": "string"
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "business": { ... }
}
```

### 3. Get Business Access PIN
**GET** `/business/access-pin` 🔒

**Response:** `200 OK`
```json
{
  "access_pin": "1234",
  "business_id": "business_id",
  "business_name": "Devi kirana"
}
```

### 4. Regenerate PIN
**POST** `/profile/regenerate-pin` 🔒

**Response:** `200 OK`
```json
{
  "message": "PIN regenerated successfully",
  "access_pin": "5678"
}
```

### 5. Generate QR Code
**GET** `/business/qr-code` 🔒

**Response:** `200 OK` (PNG Image)
- Returns a QR code image containing: `KATHAPE_BUSINESS:{business_id}:{access_pin}`
- QR code color: Purple (#7c3aed)

---

## 🔁 Recurring Transactions

### 1. Get All Recurring
**GET** `/recurring-transactions` 🔒

**Response:** `200 OK`
```json
{
  "recurring_transactions": [
    {
      "id": "recurring_id",
      "customer_id": "customer_id",
      "customer_name": "Customer Name",
      "type": "credit",
      "amount": 5000,
      "frequency": "monthly",
      "start_date": "2025-01-01",
      "next_due_date": "2025-02-01",
      "notes": "Monthly rent",
      "is_active": true
    }
  ]
}
```

### 2. Create Recurring Transaction
**POST** `/recurring-transaction` 🔒

**Request Body:**
```json
{
  "customer_id": "string (required)",
  "type": "credit | payment (required)",
  "amount": "number (required)",
  "frequency": "daily | weekly | monthly (required)",
  "start_date": "YYYY-MM-DD (required)",
  "notes": "string (optional)"
}
```

---

## 🎟️ Vouchers & Offers

### Get Vouchers
**GET** `/vouchers` 🔒

**Response:** `200 OK`
```json
{
  "vouchers": [
    {
      "id": "voucher_id",
      "code": "SAVE10",
      "discount_type": "percentage",
      "discount_value": 10,
      "is_active": true
    }
  ]
}
```

### Get Offers
**GET** `/offers` 🔒

**Response:** `200 OK`
```json
{
  "offers": [
    {
      "id": "offer_id",
      "title": "Weekend Sale",
      "description": "Get 20% off",
      "is_active": true
    }
  ]
}
```

---

## 🔔 Reminders

### Send Reminder to Customer
**POST** `/customer/<customer_id>/remind` 🔒

**Response:** `200 OK`
```json
{
  "message": "Reminder sent successfully",
  "via": "WhatsApp"
}
```

---

## 📍 Location

### Update Location
**POST** `/location/update` 🔒

**Request Body:**
```json
{
  "latitude": 19.0760,
  "longitude": 72.8777,
  "address": "123 Main St"
}
```

**Response:** `200 OK`
```json
{
  "message": "Location updated successfully"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

**401 Unauthorized**
```json
{
  "error": "Token is missing"
}
```

**403 Forbidden**
```json
{
  "error": "Access denied. Business account required."
}
```

**404 Not Found**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to process request: <error_details>"
}
```

---

## Notes

🔒 = Requires Authentication (Bearer Token)

**Key Fields to Note:**
- `access_pin`: 4-digit PIN for business (used in QR codes)
- `balance`: Customer's outstanding balance (positive = they owe you, negative = you owe them)
- `type`: Transaction type ("credit" = you gave credit, "payment" = they paid you)
- `is_low_stock`: Automatically calculated based on `stock_quantity` and `low_stock_threshold`
