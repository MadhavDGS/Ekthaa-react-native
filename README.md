# Ekthaa Business - React Native App

A modern mobile credit book application for businesses to manage customers, products, and transactions.

## 🚀 Features

- **Authentication**: Secure login and registration
- **Dashboard**: Hero card with total outstanding balance and quick actions
- **Customer Management**: Add, view, and manage customers with balances
- **Transaction Management**: WhatsApp-style transaction bubbles (credits & payments)
- **Product Catalogue**: Manage products with categories, stock, and pricing
- **Business Management**: Business profile and settings
- **Modern UI**: Matches web app design with purple theme (#7c3aed)

## 📱 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **UI Components**: React Native + Ionicons
- **Backend**: https://ekthaa-react-business.onrender.com

## 🎨 Design System

Based on the web app's UI_DOCUMENTATION.md:

- **Primary Purple**: #7c3aed
- **Payment Green**: #059669
- **Credit Red**: #ef4444
- **Orange/Blue**: For categories and actions
- **10 Avatar Colors**: Rotating pastel palette
- **WhatsApp-style Bubbles**: For transactions
- **Card-based Layout**: Rounded corners, shadows
- **Bottom Navigation**: 5 tabs (Customers, Products, Home, Business, Transactions)

## 📦 Installation

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 🔧 Configuration

The app connects to the deployed backend at:
```
https://ekthaa-react-business.onrender.com
```

Update `src/constants/api.ts` if backend URL changes.

## 📂 Project Structure

```
src/
├── constants/
│   ├── theme.ts          # Design system (colors, typography, spacing)
│   └── api.ts            # API endpoints configuration
├── services/
│   └── api.ts            # API service layer with Axios
├── types/
│   └── index.ts          # TypeScript interfaces
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   ├── dashboard/
│   │   └── DashboardScreen.tsx
│   ├── customers/
│   │   ├── CustomersScreen.tsx
│   │   ├── CustomerDetailsScreen.tsx
│   │   └── AddCustomerScreen.tsx
│   ├── products/
│   │   ├── ProductsScreen.tsx
│   │   └── AddProductScreen.tsx
│   ├── transactions/
│   │   └── TransactionsScreen.tsx
│   ├── business/
│   │   └── BusinessScreen.tsx
│   └── profile/
│       └── ProfileScreen.tsx
└── App.tsx               # Root navigation
```

## 🎯 Core Screens

### 1. **Login/Register**
- Clean card-based design
- Phone number + password authentication
- Error/success messaging
- Links between login/register

### 2. **Dashboard**
- Purple gradient hero card showing total to receive
- 6 action cards (Customers, Products, Transactions, Add Customer, Add Product, QR Code)
- Recent customers list with avatars and balances
- Pull-to-refresh

### 3. **Customers**
- List with search functionality
- 10 rotating avatar colors
- Balance display (TO RECEIVE / RECEIVED)
- Add customer floating action

### 4. **Customer Details**
- Large avatar with customer info
- Current balance card with action buttons
- WhatsApp-style transaction bubbles:
  - **Credit**: Right-aligned, red theme, up arrow
  - **Payment**: Left-aligned, green theme, down arrow
- Transaction notes and timestamps
- FAB for adding transactions

### 5. **Products**
- Stock value header with low stock alerts
- Category filter pills (All Products, categories)
- Product cards with:
  - Product icon, name, category badge
  - Price per unit
  - Stock quantity with warnings
  - Quantity stepper controls
- Search functionality

### 6. **Transactions**
- Filter pills (All, Credits, Payments)
- Transaction cards with customer name, type, amount
- Color-coded amounts (red for credits, green for payments)
- Date/time timestamps

### 7. **Business Management**
- Business info display (name, phone, email, address, GST)
- Quick action cards:
  - Edit business info
  - Set location
  - QR code
  - Vouchers & offers
- Business stats grid

### 8. **Profile**
- Large profile avatar with business name
- Stats row (Customers, Products, Since)
- Settings options:
  - Edit profile
  - Business settings
  - Notifications
  - Privacy & security
- Help & support section
- Logout button

## 🎨 UI Highlights

- **Bottom Navigation**: Fixed at bottom with 5 tabs, color-coded icons
- **App Bar**: Purple #7c3aed with title and profile/action buttons
- **Cards**: White background, rounded corners (12-20px), subtle shadows
- **Shadows**: 3-level elevation system + purple glow for hero elements
- **Typography**: System fonts, 11px-48px range, weights 400-800
- **Spacing**: 8px-32px consistent spacing system
- **Touch Targets**: Minimum 44px for all interactive elements

## 🔄 Backend Integration

All API calls are handled through `src/services/api.ts`:

- Automatic token injection via Axios interceptors
- Token stored in AsyncStorage
- 401 handling for expired tokens
- Error propagation to UI

### Key Endpoints Used:
- `/login`, `/register`, `/logout`
- `/dashboard` - Summary data
- `/customers`, `/customer/:id`
- `/transactions`, `/add_transaction`
- `/products`, `/add_product`
- `/business_info`, `/profile`
- `/vouchers`, `/offers`
- `/qr_code`, `/access_pin`

## 🚧 Future Enhancements

- [ ] Complete transaction add/edit functionality
- [ ] Image upload for receipts and products
- [ ] Map integration for business location
- [ ] Vouchers & offers management screens
- [ ] QR code display and scanning
- [ ] WhatsApp bulk reminders
- [ ] Push notifications
- [ ] Offline support with data sync
- [ ] Export reports (PDF/Excel)
- [ ] Multi-language support

## 📄 License

Proprietary - Ekthaa Business App

## 👨‍💻 Development

Built with reference to UI_DOCUMENTATION.md from the web app to ensure consistent design language across platforms.

---

**Version**: 1.0.0  
**Last Updated**: December 2024
