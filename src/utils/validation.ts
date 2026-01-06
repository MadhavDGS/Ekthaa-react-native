/**
 * Validation Utilities
 * Centralized data validation to prevent garbage data
 */

export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (!cleaned) {
    return { valid: false, error: 'Phone number is required' };
  }
  
  if (cleaned.length !== 10) {
    return { valid: false, error: 'Phone number must be exactly 10 digits' };
  }
  
  if (!/^[6-9]/.test(cleaned)) {
    return { valid: false, error: 'Phone number must start with 6, 7, 8, or 9' };
  }
  
  return { valid: true };
};

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: true }; // Email is optional
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
};

export const validatePrice = (price: string | number): { valid: boolean; error?: string } => {
  const priceNum = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(priceNum)) {
    return { valid: false, error: 'Price must be a valid number' };
  }
  
  if (priceNum < 0) {
    return { valid: false, error: 'Price cannot be negative' };
  }
  
  if (priceNum > 10000000) {
    return { valid: false, error: 'Price cannot exceed ₹1 crore' };
  }
  
  return { valid: true };
};

export const validateQuantity = (quantity: string | number): { valid: boolean; error?: string } => {
  const qtyNum = typeof quantity === 'string' ? parseInt(quantity) : quantity;
  
  if (isNaN(qtyNum)) {
    return { valid: false, error: 'Quantity must be a valid number' };
  }
  
  if (qtyNum < 0) {
    return { valid: false, error: 'Quantity cannot be negative' };
  }
  
  if (qtyNum > 1000000) {
    return { valid: false, error: 'Quantity cannot exceed 1 million' };
  }
  
  return { valid: true };
};

export const validateGST = (gst: string): { valid: boolean; error?: string } => {
  if (!gst) {
    return { valid: true }; // GST is optional
  }
  
  // GST format: 22AAAAA0000A1Z5
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  
  if (!gstRegex.test(gst.toUpperCase())) {
    return { valid: false, error: 'Invalid GST format (e.g., 22AAAAA0000A1Z5)' };
  }
  
  return { valid: true };
};

export const validatePincode = (pincode: string): { valid: boolean; error?: string } => {
  if (!pincode) {
    return { valid: true }; // Pincode is optional
  }
  
  const cleaned = pincode.replace(/\D/g, '');
  
  if (cleaned.length !== 6) {
    return { valid: false, error: 'Pincode must be exactly 6 digits' };
  }
  
  return { valid: true };
};

export const validateProductName = (name: string): { valid: boolean; error?: string } => {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Product name is required' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, error: 'Product name must be at least 2 characters' };
  }
  
  if (name.length > 100) {
    return { valid: false, error: 'Product name cannot exceed 100 characters' };
  }
  
  return { valid: true };
};

export const validateCustomerName = (name: string): { valid: boolean; error?: string } => {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Customer name is required' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, error: 'Customer name must be at least 2 characters' };
  }
  
  if (name.length > 100) {
    return { valid: false, error: 'Customer name cannot exceed 100 characters' };
  }
  
  return { valid: true };
};

export const sanitizeNumericInput = (value: string): string => {
  // Remove all non-numeric characters except decimal point
  return value.replace(/[^0-9.]/g, '');
};

export const sanitizePhoneInput = (value: string): string => {
  // Remove all non-numeric characters
  return value.replace(/\D/g, '').slice(0, 10);
};
