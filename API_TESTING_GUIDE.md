# API Testing Guide with curl

This guide helps you test the Ekthaa Business API endpoints using curl commands.

## Setup

First, get your JWT token by logging in:

```bash
export API_BASE="https://ekthaa-react-business.onrender.com/api"

# Login to get token
curl -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "YOUR_PHONE",
    "password": "YOUR_PASSWORD"
  }'

# Save the token from response
export TOKEN="YOUR_JWT_TOKEN_HERE"
```

---

## Authentication Tests

### Test Registration
```bash
curl -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Test Business",
    "phone_number": "9999999999",
    "password": "test123"
  }'
```

**Expected Response:**
```json
{
  "message": "Registration successful",
  "token": "eyJ...",
  "user": { "id": "...", "name": "Test Business", "user_type": "business" },
  "business": { "id": "...", "access_pin": "1234" }
}
```

### Test Login
```bash
curl -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "9999999999",
    "password": "test123"
  }'
```

---

## Dashboard Tests

### Get Dashboard Data
```bash
curl -X GET "$API_BASE/dashboard" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Fields:**
- `summary.total_credit` (number)
- `summary.total_payment` (number)
- `summary.total_customers` (number)
- `summary.outstanding_balance` (number)
- `recent_transactions` (array)
- `business` (object with access_pin)

---

## Customer Tests

### Get All Customers
```bash
curl -X GET "$API_BASE/customers" \
  -H "Authorization: Bearer $TOKEN"
```

### Add Customer
```bash
curl -X POST "$API_BASE/customer" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone_number": "9876543210",
    "address": "123 Main St"
  }'
```

### Get Single Customer
```bash
curl -X GET "$API_BASE/customer/CUSTOMER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Transaction Tests

### Get All Transactions
```bash
curl -X GET "$API_BASE/transactions" \
  -H "Authorization: Bearer $TOKEN"
```

### Add Credit Transaction
```bash
curl -X POST "$API_BASE/transaction" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "CUSTOMER_ID",
    "type": "credit",
    "amount": 5000,
    "notes": "Product purchase"
  }'
```

### Add Payment Transaction
```bash
curl -X POST "$API_BASE/transaction" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "CUSTOMER_ID",
    "type": "payment",
    "amount": 2000,
    "notes": "Cash received"
  }'
```

---

## Product Tests

### Get All Products
```bash
curl -X GET "$API_BASE/products" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "products": [
    {
      "id": "...",
      "name": "Product Name",
      "category": "Food & Groceries",
      "price": 2550.00,
      "stock_quantity": 30,
      "product_image_url": "https://..."
    }
  ]
}
```

### Add Product
```bash
curl -X POST "$API_BASE/product" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Rice",
    "category": "Food & Groceries",
    "subcategory": "Rice",
    "price": 2550,
    "unit": "kg",
    "stock_quantity": 50,
    "low_stock_threshold": 10,
    "description": "Premium quality basmati rice"
  }'
```

### Update Product (PUT method)
```bash
curl -X PUT "$API_BASE/product/PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stock_quantity": 45
  }'
```

### Delete Product (DELETE method)
```bash
curl -X DELETE "$API_BASE/product/PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Product Categories
```bash
curl -X GET "$API_BASE/products/categories" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Product Units
```bash
curl -X GET "$API_BASE/products/units" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Profile Tests

### Get Profile
```bash
curl -X GET "$API_BASE/profile" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "business": {
    "id": "...",
    "name": "Devi kirana",
    "phone_number": "1234567890",
    "access_pin": "1234",
    "email": "business@example.com",
    "total_customers": 17,
    "total_transactions": 136,
    "profile_image_url": "https://..."
  }
}
```

### Update Profile
```bash
curl -X PUT "$API_BASE/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Business Name",
    "email": "newemail@example.com",
    "description": "Best quality products"
  }'
```

### Get Access PIN
```bash
curl -X GET "$API_BASE/business/access-pin" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "access_pin": "1234",
  "business_id": "...",
  "business_name": "Devi kirana"
}
```

### Regenerate PIN
```bash
curl -X POST "$API_BASE/profile/regenerate-pin" \
  -H "Authorization: Bearer $TOKEN"
```

### Get QR Code (Returns PNG Image)
```bash
curl -X GET "$API_BASE/business/qr-code" \
  -H "Authorization: Bearer $TOKEN" \
  --output qr_code.png
```

**QR Data Format:** `KATHAPE_BUSINESS:{business_id}:{access_pin}`

---

## Recurring Transaction Tests

### Get All Recurring Transactions
```bash
curl -X GET "$API_BASE/recurring-transactions" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Recurring Transaction
```bash
curl -X POST "$API_BASE/recurring-transaction" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "CUSTOMER_ID",
    "type": "credit",
    "amount": 5000,
    "frequency": "monthly",
    "start_date": "2025-01-01",
    "notes": "Monthly subscription"
  }'
```

---

## Vouchers & Offers Tests

### Get Vouchers
```bash
curl -X GET "$API_BASE/vouchers" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Offers
```bash
curl -X GET "$API_BASE/offers" \
  -H "Authorization: Bearer $TOKEN"
```

### Add Voucher
```bash
curl -X POST "$API_BASE/voucher" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Year Sale",
    "description": "Get 10% off on all products",
    "discount_type": "percentage",
    "discount_value": 10,
    "min_purchase": 1000,
    "valid_from": "2025-01-01",
    "valid_until": "2025-01-31"
  }'
```

---

## Reminders Tests

### Send Reminder to Customer
```bash
curl -X POST "$API_BASE/customer/CUSTOMER_ID/remind" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Location Tests

### Update Location
```bash
curl -X POST "$API_BASE/location/update" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 19.0760,
    "longitude": 72.8777,
    "address": "123 Main Street, Mumbai"
  }'
```

---

## Error Response Formats

### 401 Unauthorized
```json
{
  "error": "Token is missing"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Business account required."
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Server Error
```json
{
  "error": "Failed to process request: <details>"
}
```

---

## Quick Test Script

Create a file `test_api.sh`:

```bash
#!/bin/bash

API_BASE="https://ekthaa-react-business.onrender.com/api"

echo "🧪 Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "YOUR_PHONE",
    "password": "YOUR_PASSWORD"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# Extract token (requires jq: brew install jq)
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "Token: $TOKEN"

echo -e "\n🧪 Testing Dashboard..."
curl -s -X GET "$API_BASE/dashboard" \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n🧪 Testing Profile..."
curl -s -X GET "$API_BASE/profile" \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n🧪 Testing Products..."
curl -s -X GET "$API_BASE/products" \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n🧪 Testing Customers..."
curl -s -X GET "$API_BASE/customers" \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n🧪 Getting QR Code..."
curl -s -X GET "$API_BASE/business/qr-code" \
  -H "Authorization: Bearer $TOKEN" \
  --output qr_code.png
echo "QR Code saved to qr_code.png"

echo -e "\n✅ All tests complete!"
```

Run with: `chmod +x test_api.sh && ./test_api.sh`

---

## Notes

- All authenticated endpoints require `Authorization: Bearer <token>` header
- QR code endpoint returns a PNG image, not JSON
- Transaction types: "credit" (you gave credit to customer) vs "payment" (customer paid you)
- Balance calculation: credit adds to balance, payment reduces balance
- Products with `stock_quantity <= low_stock_threshold` show `is_low_stock: true`
