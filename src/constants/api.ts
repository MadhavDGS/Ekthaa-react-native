/**
 * API Configuration
 * Backend deployed at: https://kathape-react-business.onrender.com
 */

export const API_BASE_URL = 'https://kathape-react-business.onrender.com';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',

  // Dashboard
  DASHBOARD: '/api/dashboard',

  // Customers
  CUSTOMERS: '/api/customers',
  CUSTOMER_DETAILS: '/api/customer',
  ADD_CUSTOMER: '/api/customer',
  CUSTOMER_TRANSACTIONS: '/api/customer', // /:id/transactions
  CUSTOMER_REMIND: '/api/customer', // /:id/remind

  // Transactions
  TRANSACTIONS: '/api/transactions',
  ADD_TRANSACTION: '/api/transaction',
  TRANSACTION_BILL: '/api/transaction', // /:id/bill

  // Products
  PRODUCTS: '/api/products',
  PRODUCT_DETAILS: '/api/product', // /:id
  ADD_PRODUCT: '/api/product',
  UPDATE_PRODUCT: '/api/product', // PUT /:id
  DELETE_PRODUCT: '/api/product', // DELETE /:id
  PRODUCT_CATEGORIES: '/api/products/categories',
  PRODUCT_UNITS: '/api/products/units',

  // Business Profile
  BUSINESS_INFO: '/api/profile',
  UPDATE_BUSINESS: '/api/profile',
  PROFILE: '/api/profile',
  UPDATE_PROFILE: '/api/profile', // PUT
  REGENERATE_PIN: '/api/profile/regenerate-pin',
  UPLOAD_LOGO: '/api/profile/upload-logo',
  UPLOAD_PROFILE_PHOTO: '/api/profile/upload-photo',

  // Location
  LOCATION: '/api/location',
  UPDATE_LOCATION: '/api/location/update',

  // QR Code & Access PIN
  QR_CODE: '/api/business/qr-code',
  QR_CODE_ALT: '/api/profile/qr',
  ACCESS_PIN: '/api/business/access-pin',

  // Recurring Transactions
  RECURRING_TRANSACTIONS: '/api/recurring-transactions',
  ADD_RECURRING: '/api/recurring-transaction',
  TOGGLE_RECURRING: '/api/recurring-transaction', // PUT /:id/toggle
  DELETE_RECURRING: '/api/recurring-transaction', // DELETE /:id

  // Vouchers
  VOUCHERS: '/api/vouchers',
  ADD_VOUCHER: '/api/voucher',
  UPDATE_VOUCHER: '/api/voucher', // PUT /:id
  TOGGLE_VOUCHER: '/api/voucher', // PUT /:id/toggle
  DELETE_VOUCHER: '/api/voucher', // DELETE /:id

  // Offers
  OFFERS: '/api/offers',
  ADD_OFFER: '/api/offer',
  UPDATE_OFFER: '/api/offer', // PUT /:id
  TOGGLE_OFFER: '/api/offer', // PUT /:id/toggle
  DELETE_OFFER: '/api/offer', // DELETE /:id

  // Reminders
  BULK_REMINDERS: '/api/customers/remind-all',

  // Invoice
  GENERATE_INVOICE: '/api/generate-invoice',

  // Stats
  STATS: '/api/dashboard',
};
