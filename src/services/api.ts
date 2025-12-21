/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Enable credentials and proper error handling
      validateStatus: (status) => status < 500,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        console.log('📡 Request URL:', config.baseURL + config.url);
        console.log('📡 Request Method:', config.method);
        console.log('📡 Request Data:', config.data);
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
          // Token expired or invalid
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('userData');
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
      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        console.log('📡 API: Token saved to AsyncStorage');
      }
      return response.data;
    } catch (error: any) {
      console.error('📡 API: Login request failed');
      console.error('📡 API: Error:', error.message);
      console.error('📡 API: Error response:', error.response?.data);
      console.error('📡 API: Error status:', error.response?.status);
      throw error;
    }
  }

  async register(businessName: string, phoneNumber: string, password: string) {
    const response = await this.api.post(API_ENDPOINTS.REGISTER, {
      business_name: businessName,
      phone_number: phoneNumber,
      password,
    });
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async logout() {
    await this.api.post(API_ENDPOINTS.LOGOUT);
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
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
  }) {
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
    const response = await this.api.post(API_ENDPOINTS.ADD_PRODUCT, data);
    return response.data;
  }

  async updateProduct(productId: string, data: any) {
    const response = await this.api.put(`/product/${productId}`, data);
    return response.data;
  }

  async deleteProduct(productId: string) {
    const response = await this.api.delete(`/product/${productId}`);
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

  async regeneratePin() {
    const response = await this.api.post(API_ENDPOINTS.REGENERATE_PIN);
    return response.data;
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
