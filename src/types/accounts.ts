/**
 * Account Management Types
 * Types for multi-account and role-based access
 */

export type UserRole = 'owner' | 'worker' | 'admin';

export interface BusinessMember {
  id: string;
  user_id: string;
  business_id: string;
  role: UserRole;
  name: string;
  phone_number: string;
  email?: string;
  permissions: MemberPermissions;
  added_by: string;
  added_at: string;
  is_active: boolean;
}

export interface MemberPermissions {
  // Transaction permissions
  can_add_transaction: boolean;
  can_view_transactions: boolean;
  can_delete_transaction: boolean;
  
  // Customer permissions
  can_add_customer: boolean;
  can_view_customers: boolean;
  can_edit_customer: boolean;
  
  // Product permissions
  can_add_product: boolean;
  can_edit_product: boolean;
  can_delete_product: boolean;
  
  // Inventory permissions
  can_manage_inventory: boolean;
  
  // Business permissions
  can_edit_business: boolean;
  can_view_reports: boolean;
  can_manage_members: boolean;
}

export interface LinkedAccount {
  id: string;
  business_id: string;
  business_name: string;
  role: UserRole;
  profile_photo?: string;
  is_current: boolean;
}

// Default permissions for each role
export const DEFAULT_PERMISSIONS: Record<UserRole, MemberPermissions> = {
  owner: {
    can_add_transaction: true,
    can_view_transactions: true,
    can_delete_transaction: true,
    can_add_customer: true,
    can_view_customers: true,
    can_edit_customer: true,
    can_add_product: true,
    can_edit_product: true,
    can_delete_product: true,
    can_manage_inventory: true,
    can_edit_business: true,
    can_view_reports: true,
    can_manage_members: true,
  },
  admin: {
    can_add_transaction: true,
    can_view_transactions: true,
    can_delete_transaction: true,
    can_add_customer: true,
    can_view_customers: true,
    can_edit_customer: true,
    can_add_product: true,
    can_edit_product: true,
    can_delete_product: true,
    can_manage_inventory: true,
    can_edit_business: false,
    can_view_reports: true,
    can_manage_members: false,
  },
  worker: {
    can_add_transaction: true,
    can_view_transactions: true,
    can_delete_transaction: false,
    can_add_customer: true,
    can_view_customers: true,
    can_edit_customer: false,
    can_add_product: false,
    can_edit_product: false,
    can_delete_product: false,
    can_manage_inventory: false,
    can_edit_business: false,
    can_view_reports: false,
    can_manage_members: false,
  },
};

// Role display info
export const ROLE_INFO: Record<UserRole, { label: string; description: string; color: string }> = {
  owner: {
    label: 'Owner',
    description: 'Full access to all features and settings',
    color: '#f59e0b',
  },
  admin: {
    label: 'Admin',
    description: 'Can manage daily operations',
    color: '#3b82f6',
  },
  worker: {
    label: 'Worker',
    description: 'Can add transactions and view data',
    color: '#10b981',
  },
};
