/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import * as FileSystem from 'expo-file-system/legacy';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000, // Reduced from 30s to 15s
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Only treat 2xx as success
      validateStatus: (status) => status >= 200 && status < 300,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        if (__DEV__) {
          console.log('📡 Request URL:', config.url);
          console.log('📡 Request Method:', config.method);
          // Don't log sensitive data like passwords
          if (config.url?.includes('/login') || config.url?.includes('/register')) {
            console.log('📡 Request Data: [REDACTED - Auth endpoint]');
          } else {
            console.log('📡 Request Data:', config.data);
          }
        }
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('📡 Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Only clear token if it's actually invalid, not on first request
          const errorMessage = error.response?.data?.error || '';
          if (typeof errorMessage === 'string' && errorMessage.includes('invalid or expired')) {
            // Token expired or invalid - clear auth data
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userData');
            console.log('🔐 Token cleared due to expiration');
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(phoneNumber: string, password: string) {
    console.log('📡 API: Making login request to:', API_BASE_URL + API_ENDPOINTS.LOGIN);
    console.log('📡 API: Phone number:', phoneNumber);
    try {
      const response = await this.api.post(API_ENDPOINTS.LOGIN, {
        phone_number: phoneNumber,
        password,
      });
      console.log('📡 API: Login response status:', response.status);
      console.log('📡 API: Login response data:', response.data);

      // Check if login was successful
      if (!response.data.token) {
        throw new Error('Login failed: No token received');
      }

      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      console.log('📡 API: Token saved to AsyncStorage');
      return response.data;
    } catch (error: any) {
      console.error('📡 API: Login request failed');
      console.error('📡 API: Error:', error.message);
      console.error('📡 API: Error response:', error.response?.data);
      console.error('📡 API: Error status:', error.response?.status);

      // Throw a user-friendly error message
      if (error.response?.status === 404) {
        throw new Error('Invalid phone number or password');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid credentials');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async register(businessName: string, phoneNumber: string, password: string) {
    try {
      const response = await this.api.post(API_ENDPOINTS.REGISTER, {
        business_name: businessName,
        phone_number: phoneNumber,
        password,
      });
      
      if (__DEV__) {
        console.log('📡 API: Register response status:', response.status);
        console.log('📡 API: Register response data:', response.data);
        console.log('📡 API: Token NOT saved to AsyncStorage (will be saved after onboarding)');
      }
      
      // Don't save token here - let RegisterScreen handle it after all steps complete
      return response.data;
    } catch (error: any) {
      if (__DEV__) {
        console.error('📡 API: Register request failed');
        console.error('📡 API: Error:', error.message);
        console.error('📡 API: Error response:', error.response?.data);
        console.error('📡 API: Error status:', error.response?.status);
      }
      throw error;
    }
  }

  async logout() {
    try {
      await this.api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Ignore logout errors - clear local data anyway
      console.log('Logout API call failed (ignored):', error);
    }
    // Always clear local auth data regardless of API response
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.api.post('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  }

  // Helper method to get auth token
  async getToken() {
    return await AsyncStorage.getItem('authToken');
  }

  // Dashboard
  async getDashboard() {
    try {
      const response = await this.api.get(API_ENDPOINTS.DASHBOARD);
      console.log('📡 Dashboard response status:', response.status);
      console.log('📡 Dashboard response data:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('📡 Dashboard request failed:', error.message);
      console.error('📡 Dashboard error response:', error.response?.data);
      console.error('📡 Dashboard error status:', error.response?.status);
      throw error;
    }
  }

  // Customers
  async getCustomers() {
    const response = await this.api.get(API_ENDPOINTS.CUSTOMERS);
    return response.data;
  }

  async getCustomerDetails(customerId: string) {
    const response = await this.api.get(`${API_ENDPOINTS.CUSTOMER_DETAILS}/${customerId}`);
    return response.data;
  }

  async addCustomer(data: {
    name: string;
    phone_number: string;
    address?: string;
  }) {
    const response = await this.api.post(API_ENDPOINTS.ADD_CUSTOMER, data);
    return response.data;
  }

  // Note: Backend doesn't support customer update/delete operations
  // Customers can only be created (POST /api/customer)
  // To "delete", would need backend endpoint implementation

  // Transactions
  async getTransactions(customerId?: string) {
    const response = await this.api.get(API_ENDPOINTS.TRANSACTIONS, {
      params: customerId ? { customer_id: customerId } : {},
    });
    return response.data;
  }

  async addTransaction(data: {
    customer_id: string;
    type: 'credit' | 'payment';
    amount: number;
    notes?: string;
    receipt_url?: string;
    created_by?: string;
  }) {
    // If receipt_url is provided and is a local file, use FormData to upload
    if (data.receipt_url && data.receipt_url.startsWith('file://')) {
      const formData = new FormData();
      formData.append('customer_id', data.customer_id);
      formData.append('type', data.type);
      formData.append('amount', data.amount.toString());
      formData.append('created_by', data.created_by || 'business');
      
      if (data.notes) {
        formData.append('notes', data.notes);
      }
      
      // Add receipt image file (backend expects 'bill_photo' field name)
      const filename = data.receipt_url.split('/').pop() || 'receipt.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('bill_photo', {
        uri: data.receipt_url,
        name: filename,
        type: fileType,
      } as any);
      
      const response = await this.api.post(API_ENDPOINTS.ADD_TRANSACTION, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
    
    // Otherwise use regular JSON
    const response = await this.api.post(API_ENDPOINTS.ADD_TRANSACTION, data);
    return response.data;
  }

  // Note: Backend doesn't support transaction update/delete operations
  // Transactions can only be created (POST /api/transaction)
  // To "delete", would need backend endpoint implementation

  // Products
  async getProducts() {
    const response = await this.api.get(API_ENDPOINTS.PRODUCTS);
    return response.data;
  }

  async addProduct(data: {
    name: string;
    category: string;
    subcategory?: string;
    description?: string;
    price: number;
    unit: string;
    stock_quantity: number;
    low_stock_threshold?: number;
    image_url?: string;
    product_image?: string;
  }) {
    // If product_image is a local file URI, use FormData
    if (data.product_image && data.product_image.startsWith('file://')) {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('category', data.category);
      if (data.subcategory) formData.append('subcategory', data.subcategory);
      if (data.description) formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('unit', data.unit);
      formData.append('stock_quantity', data.stock_quantity.toString());
      if (data.low_stock_threshold !== undefined) {
        formData.append('low_stock_threshold', data.low_stock_threshold.toString());
      }
      
      // Add the image file
      const filename = data.product_image.split('/').pop() || 'product.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('product_image', {
        uri: data.product_image,
        name: filename,
        type: fileType,
      } as any);
      
      const response = await this.api.post(API_ENDPOINTS.ADD_PRODUCT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
    
    // Otherwise use regular JSON
    const response = await this.api.post(API_ENDPOINTS.ADD_PRODUCT, data);
    return response.data;
  }

  async updateProduct(productId: string, data: any) {
    const response = await this.api.put(`/api/product/${productId}`, data);
    return response.data;
  }

  async deleteProduct(productId: string) {
    const response = await this.api.delete(`/api/product/${productId}`);
    return response.data;
  }

  async getProductCategories() {
    const response = await this.api.get(API_ENDPOINTS.PRODUCT_CATEGORIES);
    return response.data;
  }

  async getProductUnits() {
    const response = await this.api.get(API_ENDPOINTS.PRODUCT_UNITS);
    return response.data;
  }

  // Business
  async getBusinessInfo() {
    const response = await this.api.get(API_ENDPOINTS.BUSINESS_INFO);
    return response.data;
  }

  async updateBusiness(data: any) {
    const response = await this.api.post(API_ENDPOINTS.UPDATE_BUSINESS, data);
    return response.data;
  }

  // Profile
  async getProfile() {
    const response = await this.api.get(API_ENDPOINTS.PROFILE);
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.api.put(API_ENDPOINTS.UPDATE_PROFILE, data);
    return response.data;
  }

  async getLocation() {
    const response = await this.api.get('/api/location');
    return response.data;
  }

  async updateLocation(latitude: number, longitude: number) {
    const response = await this.api.post('/api/location/update', {
      latitude,
      longitude,
    });
    return response.data;
  }

  async regeneratePin() {
    const response = await this.api.post(API_ENDPOINTS.REGENERATE_PIN);
    return response.data;
  }

  async uploadProfilePhoto(photoUri: string) {
    const formData = new FormData();
    
    // Create file object from URI
    const filename = photoUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('profile_photo', {
      uri: photoUri,
      name: filename,
      type: type,
    } as any);
    
    const response = await this.api.post(API_ENDPOINTS.UPLOAD_PROFILE_PHOTO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }


  // Invoice Generation
  async generateInvoice(data: any): Promise<string> {
    try {
      const response = await this.api.post('/api/generate-invoice', data, {
        responseType: 'blob'
      });

      const blob = response.data;
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64data = reader.result as string;
            const buyerName = data.buyer_name?.replace(/[^a-z0-9]/gi, '_') || 'invoice';
            const filename = `invoice_${buyerName}_${Date.now()}.pdf`;

            const filepath = `${FileSystem.documentDirectory}${filename}`;

            await FileSystem.writeAsStringAsync(
              filepath,
              base64data.split(',')[1],
              { encoding: 'base64' }
            );

            resolve(filepath);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Generate invoice error:', error);
      throw error;
    }
  }

  async updateLocation(data: { latitude: number; longitude: number; address: string }) {
    const response = await this.api.post(API_ENDPOINTS.UPDATE_LOCATION, data);
    return response.data;
  }

  async getLocation() {
    const response = await this.api.get(API_ENDPOINTS.LOCATION);
    return response.data;
  }

  // Vouchers & Offers
  async getVouchers() {
    const response = await this.api.get(API_ENDPOINTS.VOUCHERS);
    return response.data;
  }

  async getOffers() {
    const response = await this.api.get(API_ENDPOINTS.OFFERS);
    return response.data;
  }

  async addVoucher(data: {
    title: string;
    description: string;
    discount_type: string;
    discount_value: number;
    min_purchase?: number;
    max_discount?: number;
    valid_from: string;
    valid_until: string;
  }) {
    const response = await this.api.post(API_ENDPOINTS.ADD_VOUCHER, data);
    return response.data;
  }

  async addOffer(data: {
    title: string;
    description: string;
    product_id?: string;
    discount_percentage: number;
    valid_from: string;
    valid_until: string;
  }) {
    const response = await this.api.post(API_ENDPOINTS.ADD_OFFER, data);
    return response.data;
  }

  // QR Code
  async getQRCode() {
    const response = await this.api.get(API_ENDPOINTS.QR_CODE);
    return response.data;
  }

  async getAccessPin() {
    const response = await this.api.get(API_ENDPOINTS.ACCESS_PIN);
    return response.data;
  }

  // Stats
  async getStats() {
    const response = await this.api.get(API_ENDPOINTS.STATS);
    return response.data;
  }

  // Offers management methods

  async createOffer(data: any) {
    const response = await this.api.post('/api/offer', data);
    return response.data;
  }

  async toggleOffer(offerId: string) {
    const response = await this.api.put(`/api/offer/${offerId}/toggle`);
    return response.data;
  }

  async deleteOffer(offerId: string) {
    const response = await this.api.delete(`/api/offer/${offerId}`);
    return response.data;
  }



  async createVoucher(data: any) {
    const response = await this.api.post('/api/voucher', data);
    return response.data;
  }

  async toggleVoucher(voucherId: string) {
    const response = await this.api.put(`/api/voucher/${voucherId}/toggle`);
    return response.data;
  }

  async deleteVoucher(voucherId: string) {
    const response = await this.api.delete(`/api/voucher/${voucherId}`);
    return response.data;
  }

  // Image upload helper
  async uploadImage(uri: string, endpoint: string) {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri,
      name: filename,
      type,
    } as any);

    const response = await this.api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export default new ApiService();
