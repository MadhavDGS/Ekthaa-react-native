# Ekthaa Business - React Native Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g expo-cli`
- For iOS: Xcode (Mac only)
- For Android: Android Studio with Android SDK

### Installation Steps

1. **Navigate to project directory**
```bash
cd /Users/sreemadhav/SreeMadhav/Mhv\ CODES/Ekthaa-react/Ekthaa-React-Native
```

2. **Install dependencies** (if not already installed)
```bash
npm install
```

3. **Start the development server**
```bash
npm start
# or
expo start
```

4. **Run on device/emulator**
- **Android**: Press `a` in the terminal or run `npm run android`
- **iOS**: Press `i` in the terminal or run `npm run ios` (Mac only)
- **Web**: Press `w` in the terminal or run `npm run web`

### Using Expo Go App (Recommended for Testing)

1. Install Expo Go on your phone:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Start the dev server: `npm start`

3. Scan the QR code:
   - iOS: Use Camera app
   - Android: Use Expo Go app scanner

## 📁 Project Structure

```
Ekthaa-React-Native/
├── App.js                          # Root navigation component
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── README.md                       # Project documentation
├── SETUP_GUIDE.md                  # This file
└── src/
    ├── constants/
    │   ├── theme.ts               # Design system (colors, typography, etc.)
    │   └── api.ts                 # API endpoints configuration
    ├── services/
    │   └── api.ts                 # Axios API service with interceptors
    ├── types/
    │   └── index.ts               # TypeScript interfaces
    └── screens/
        ├── auth/
        │   ├── LoginScreen.tsx    # Login page
        │   └── RegisterScreen.tsx # Registration page
        ├── dashboard/
        │   └── DashboardScreen.tsx # Main dashboard
        ├── customers/
        │   ├── CustomersScreen.tsx        # Customer list
        │   ├── CustomerDetailsScreen.tsx  # Customer details with transactions
        │   └── AddCustomerScreen.tsx      # Add new customer
        ├── products/
        │   ├── ProductsScreen.tsx   # Product catalogue
        │   └── AddProductScreen.tsx # Add new product
        ├── transactions/
        │   └── TransactionsScreen.tsx # All transactions
        ├── business/
        │   └── BusinessScreen.tsx   # Business management
        └── profile/
            └── ProfileScreen.tsx    # User profile
```

## 🔧 Configuration

### Backend API

The app is configured to connect to:
```
https://ekthaa-react-business.onrender.com
```

To change the backend URL, edit `src/constants/api.ts`:
```typescript
export const API_BASE_URL = 'YOUR_BACKEND_URL';
```

### App Configuration

Edit `app.json` for:
- App name and slug
- Icon and splash screen
- Bundle identifiers
- Permissions
- etc.

## 🎨 Design System

Located in `src/constants/theme.ts`:

### Colors
- Primary: `#7c3aed` (Purple)
- Payment Green: `#059669`
- Credit Red: `#ef4444`
- Orange: `#ea580c`
- Blue: `#2563eb`

### Typography
- Font sizes: 11px - 48px
- Weights: 400 (regular) - 800 (extra bold)

### Spacing
- 8px, 12px, 16px, 20px, 24px, 32px

### Shadows
- Small, Medium, Large, Purple glow, FAB

## 📱 Features Implemented

✅ **Authentication**
- Login with phone + password
- Registration
- Token-based auth with AsyncStorage

✅ **Dashboard**
- Hero card with total outstanding balance
- Action grid (6 quick actions)
- Recent customers list

✅ **Customer Management**
- List all customers with search
- Customer details with balance
- Add new customers
- WhatsApp-style transaction history

✅ **Product Management**
- Product catalogue with categories
- Stock management
- Low stock alerts
- Add new products

✅ **Transaction Management**
- View all transactions
- Filter by type (credit/payment)
- Color-coded displays

✅ **Business & Profile**
- Business information display
- Profile management
- Logout functionality

✅ **Bottom Navigation**
- 5 tabs: Customers, Products, Dashboard, Business, Transactions
- Color-coded icons
- Active state highlighting

## 🔐 Authentication Flow

1. User enters phone number and password
2. App calls `/login` endpoint
3. Backend returns JWT token
4. Token stored in AsyncStorage
5. All subsequent API calls include token in Authorization header
6. On 401 response, user is redirected to login

## 🌐 API Endpoints Used

```
POST /login              - User login
POST /register           - User registration
POST /logout             - User logout
GET  /dashboard          - Dashboard summary
GET  /customers          - List all customers
GET  /customer/:id       - Customer details
POST /add_customer       - Add new customer
GET  /transactions       - List transactions
GET  /products           - List products
POST /add_product        - Add new product
GET  /business_info      - Business information
GET  /profile            - User profile
```

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache and restart
expo start -c
```

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Android Build Issues
```bash
# Clean Android build
cd android
./gradlew clean
cd ..
expo start
```

### iOS Build Issues
```bash
# Clean iOS build
cd ios
pod install
cd ..
expo start
```

## 📦 Building for Production

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

### Using EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Register new account
- [ ] View dashboard with data
- [ ] Navigate to all bottom tabs
- [ ] Add new customer
- [ ] View customer details
- [ ] Add new product
- [ ] View transactions
- [ ] Refresh data (pull-to-refresh)
- [ ] Logout and return to login

### Test Credentials

Use credentials from your backend database or create new account.

## 📝 Development Notes

### Adding New Screens

1. Create screen file in appropriate folder under `src/screens/`
2. Import in `App.js`
3. Add to Stack Navigator
4. Link from other screens

### Adding New API Endpoints

1. Add endpoint constant in `src/constants/api.ts`
2. Add method in `src/services/api.ts`
3. Call from screen component

### Styling Guidelines

- Use theme constants from `src/constants/theme.ts`
- Follow spacing system (8px increments)
- Use consistent shadows
- Match web app design (refer to UI_DOCUMENTATION.md)

## 🎯 Next Steps

1. **Test the app**:
   ```bash
   npm start
   ```

2. **Test API connectivity**: Try logging in with backend credentials

3. **Customize**:
   - Update app name in `app.json`
   - Replace icon/splash images
   - Adjust colors if needed

4. **Add missing features**:
   - Transaction add/edit functionality
   - Image uploads
   - Map integration
   - Vouchers & offers screens

## 📞 Support

For issues or questions:
- Check console logs for errors
- Verify backend is running: https://ekthaa-react-business.onrender.com
- Check network connectivity
- Review API response formats

---

**Built with** ❤️ **using React Native + Expo**
