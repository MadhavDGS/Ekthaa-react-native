# Missing API Functionality Report

## ✅ Currently Implemented Features

### Authentication
- ✅ Login - `POST /api/auth/login`
- ✅ Register - `POST /api/auth/register`
- ✅ Logout - `POST /api/auth/logout`

### Dashboard
- ✅ Get Dashboard Data - `GET /api/dashboard`
  - Uses: `outstanding_balance`, `total_credit`, `total_payment`, `total_customers`, `recent_transactions`

### Customers
- ✅ Get All Customers - `GET /api/customers`
- ✅ Get Single Customer - `GET /api/customer/:id`
- ✅ Add Customer - `POST /api/customer`
- ✅ Get Customer Transactions - `GET /api/transactions?customer_id=:id`

### Products
- ✅ Get All Products - `GET /api/products`
- ✅ Add Product - `POST /api/product`
- ✅ Update Product (Quantity) - `PUT /api/product/:id`
- ⚠️ Delete Product - API method exists but not used in UI

### Transactions
- ✅ Get All Transactions - `GET /api/transactions`

### Profile
- ✅ Get Profile - `GET /api/profile`
  - Uses: `name`, `phone_number`, `access_pin`

### QR Code
- ✅ Get QR Code Image - `GET /api/business/qr-code`
- ✅ Display Business PIN - Shows `access_pin` from profile

---

## ❌ Missing Critical Features

### 1. Product Categories & Units (**HIGH PRIORITY**)
**Available Endpoints:**
- `GET /api/products/categories` - Returns array of categories
- `GET /api/products/units` - Returns array of units

**Current Problem:**
- AddProductScreen uses free text input for category and unit
- No dropdown/autocomplete
- Inconsistent category names (e.g., "Food-Groceries" vs "food-groceries")

**Implementation Needed:**
- Fetch categories and units on AddProductScreen mount
- Show Picker/dropdown instead of TextInput
- Pre-fill with existing categories

---

### 2. Customer Reminder (**HIGH PRIORITY**)
**Available Endpoints:**
- `POST /api/customer/:id/remind` - Send reminder to single customer
- `GET /api/customers/remind-all` - Send bulk reminders

**Current Problem:**
- No reminder button on CustomerDetailsScreen
- No bulk reminder functionality on CustomersScreen

**Implementation Needed:**
- Add "Send Reminder" button on CustomerDetailsScreen
- Add "Remind All" button on CustomersScreen
- Show confirmation dialog with customer balance
- Display success/error message

---

### 3. Profile Stats (**MEDIUM PRIORITY**)
**Available Data:**
- Profile API returns: `total_customers`, `total_transactions`, `created_at`

**Current Problem:**
- ProfileScreen shows "--" for all stats
- Data is available but not used

**Implementation Needed:**
- Load profile data including stats
- Display actual counts for customers/transactions
- Show "Member since" date formatted

---

### 4. PIN Regeneration (**MEDIUM PRIORITY**)
**Available Endpoint:**
- `POST /api/profile/regenerate-pin` - Generates new 4-digit PIN

**Current Problem:**
- No way to regenerate PIN if compromised
- No UI for this feature

**Implementation Needed:**
- Add "Regenerate PIN" button on QRCodeScreen or ProfileScreen
- Show confirmation dialog (security warning)
- Update displayed PIN after regeneration

---

### 5. Transaction Add Functionality (**HIGH PRIORITY**)
**Available Endpoint:**
- `POST /api/transaction` - Create credit/payment transaction

**Current Problem:**
- No screen to add transaction directly
- Can only view transactions

**Implementation Needed:**
- Create AddTransactionScreen
- Allow selecting customer, type (credit/payment), amount, notes
- Navigate from CustomerDetailsScreen or TransactionsScreen

---

### 6. Location Services (**LOW PRIORITY**)
**Available Endpoints:**
- `GET /api/location` - Get business location
- `POST /api/location/update` - Update business location with lat/lng

**Current Problem:**
- No location display or update
- No map integration

**Implementation Needed:**
- Add location section in ProfileScreen
- Allow updating address with map picker
- Display business location on map

---

### 7. Recurring Transactions (**LOW PRIORITY**)
**Available Endpoints:**
- `GET /api/recurring-transactions`
- `POST /api/recurring-transaction`
- `PUT /api/recurring-transaction/:id/toggle`
- `DELETE /api/recurring-transaction/:id`

**Current Problem:**
- Feature completely missing
- No UI for managing recurring transactions

**Implementation Needed:**
- Create RecurringTransactionsScreen
- List all recurring transactions
- Add/edit/delete/toggle functionality
- Show next due date

---

### 8. Vouchers & Offers (**LOW PRIORITY**)
**Available Endpoints:**
- `GET /api/vouchers`, `POST /api/voucher`, `PUT/DELETE /api/voucher/:id`
- `GET /api/offers`, `POST /api/offer`, `PUT/DELETE /api/offer/:id`

**Current Problem:**
- Feature completely missing
- No UI for marketing features

**Implementation Needed:**
- Create VouchersScreen and OffersScreen
- CRUD operations for both
- Toggle active/inactive status

---

### 9. Invoice Generation (**LOW PRIORITY**)
**Available Endpoint:**
- `POST /api/generate-invoice`

**Current Problem:**
- No invoice generation feature

**Implementation Needed:**
- Add invoice generation from transaction
- Download/share PDF invoice

---

### 10. Transaction Bill Images (**MEDIUM PRIORITY**)
**Available Data:**
- Transactions have `bill_image_url` and `receipt_image_url` fields

**Current Problem:**
- Images not displayed in transaction bubbles
- No way to view/upload bill images

**Implementation Needed:**
- Display bill image thumbnail in transaction cards
- Allow clicking to view full image
- Add upload functionality when creating transaction

---

### 11. Customer Transaction History Endpoint (**MEDIUM PRIORITY**)
**Available Endpoint:**
- `GET /api/customer/:id/transactions` - Get transactions for specific customer

**Current Problem:**
- CustomerDetailsScreen uses generic `/transactions?customer_id=:id`
- Not using dedicated endpoint

**Implementation Needed:**
- Switch to dedicated endpoint for better performance
- May return additional customer-specific transaction data

---

### 12. Product Delete Functionality (**MEDIUM PRIORITY**)
**Available Endpoint:**
- `DELETE /api/product/:id`

**Current Problem:**
- API method exists in service but no UI implementation
- No delete button on product cards

**Implementation Needed:**
- Add delete icon/swipe action on product cards
- Confirmation dialog before deletion
- Refresh list after deletion

---

## 📊 Usage Summary

**Total Endpoints Available:** 43  
**Endpoints Used:** 13 (30%)  
**Critical Missing:** 5  
**Medium Priority Missing:** 5  
**Low Priority Missing:** 5

---

## 🎯 Recommended Implementation Order

### Phase 1: Essential Features (This Update)
1. ✅ Product Categories & Units Dropdowns
2. ✅ Customer Reminder (Single + Bulk)
3. ✅ Profile Stats Display
4. ✅ PIN Regeneration

### Phase 2: Core Functionality
5. Add Transaction Screen
6. Product Delete Functionality
7. Transaction Bill Image Display

### Phase 3: Advanced Features
8. Recurring Transactions
9. Location Services
10. Customer Transaction History Endpoint

### Phase 4: Marketing & Business Tools
11. Vouchers & Offers
12. Invoice Generation

---

## 💡 API Data Usage Analysis

### Dashboard API Response
```json
{
  "summary": {
    "total_credit": 1002253,           // ✅ Used
    "total_payment": 645534,            // ✅ Used
    "total_customers": 17,              // ✅ Used
    "outstanding_balance": 346042,      // ✅ Used
    "pending_customers_count": 14,      // ❌ NOT USED
    "recent_customers": [...]           // ❌ NOT USED (could show on dashboard)
  },
  "recent_transactions": [...]          // ✅ Used
}
```

### Profile API Response
```json
{
  "business": {
    "name": "Devi kirana",              // ✅ Used
    "phone_number": "1234567890",       // ✅ Used
    "access_pin": "1234",               // ✅ Used in QR
    "email": "...",                     // ❌ NOT USED
    "gst_number": "...",                // ❌ NOT USED
    "description": "...",               // ❌ NOT USED
    "address": "...",                   // ❌ NOT USED
    "city": "...",                      // ❌ NOT USED
    "state": "...",                     // ❌ NOT USED
    "total_customers": 17,              // ❌ NOT USED (should show in profile stats)
    "total_transactions": 136,          // ❌ NOT USED (should show in profile stats)
    "created_at": "2025-01-01",         // ❌ NOT USED (should show "Member since")
    "latitude": 19.0760,                // ❌ NOT USED
    "longitude": 72.8777,               // ❌ NOT USED
    "profile_image_url": "..."          // ❌ NOT USED
  }
}
```

### Transaction API Response (Appwrite Format)
```json
{
  "$id": "transaction_id",              // ✅ Used as key
  "transaction_type": "credit",         // ✅ Used
  "amount": 5000,                       // ✅ Used
  "notes": "",                          // ✅ Used
  "created_at": "2025-12-18...",        // ✅ Used
  "payment_method": null,               // ❌ NOT USED
  "receipt_image_url": null,            // ❌ NOT USED (should display)
  "bill_image_url": null,               // ❌ NOT USED (should display)
  "media_url": null,                    // ❌ NOT USED
  "transaction_reference": null,        // ❌ NOT USED
  "recurring_transaction_id": null      // ❌ NOT USED
}
```

---

## 🔧 Files That Need Updates

1. **AddProductScreen.tsx** - Add categories/units dropdowns
2. **CustomerDetailsScreen.tsx** - Add reminder button
3. **CustomersScreen.tsx** - Add bulk reminder button
4. **ProfileScreen.tsx** - Display actual stats, add PIN regeneration
5. **QRCodeScreen.tsx** - Add PIN regeneration option
6. **ProductsScreen.tsx** - Add delete functionality
7. **TransactionsScreen.tsx** - Display bill images
8. **DashboardScreen.tsx** - Show pending customers count, recent customers

---

## ⚠️ Backend Limitations

**No Update/Delete Endpoints for:**
- Customers (can only create, not edit/delete)
- Transactions (can only create, not edit/delete)

**Recommendation:** If edit/delete is needed, backend endpoints must be added first.
