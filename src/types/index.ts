/**
 * Type Definitions
 */

export interface User {
  id: string;
  business_name: string;
  phone_number: string;
  email?: string;
  profile_photo_url?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone_number: string;
  address?: string;
  balance: number;
  created_at: string;
  latitude?: number;
  longitude?: number;
}

export interface Transaction {
  id: string;
  customer_id: string;
  customer_name: string;
  type: 'credit' | 'payment';
  amount: number;
  notes?: string;
  receipt_url?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  stock_quantity: number;
  low_stock_threshold: number;
  image_url?: string;
  created_at: string;
}

export interface Voucher {
  id: string;
  title: string;
  description: string;
  discount_type: string;
  discount_value: number;
  min_purchase?: number;
  max_discount?: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  product_id?: string;
  discount_percentage: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

export interface DashboardSummary {
  outstanding_balance: number;
  recent_customers: Customer[];
  total_customers: number;
  total_products: number;
  total_transactions: number;
  low_stock_count: number;
}

export interface BusinessInfo {
  id: string;
  business_name: string;
  phone_number: string;
  email?: string;
  address?: string;
  gst_number?: string;
  logo_url?: string;
  latitude?: number;
  longitude?: number;
}
