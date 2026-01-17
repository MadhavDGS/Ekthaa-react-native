/**
 * Business Setup Screen
 * Mandatory setup after registration - Business Type, Category, Sub Category
 * Single page with 3 required fields
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

// Business Types
const BUSINESS_TYPES = [
  { id: 'wholesale', label: 'Wholesale', icon: 'cube-outline', description: 'Sell products in bulk' },
  { id: 'retail', label: 'Retail', icon: 'storefront-outline', description: 'Sell directly to customers' },
  { id: 'distributor', label: 'Distributor', icon: 'git-network-outline', description: 'Supply to retailers' },
  { id: 'manufacturer', label: 'Manufacturer', icon: 'construct-outline', description: 'Produce goods' },
];

// Categories with Subcategories
const CATEGORIES = [
  {
    name: 'Retail',
    subcategories: ['Grocery Store', 'Supermarket', 'Convenience Store', 'Clothing Store', 'Electronics Store', 'Hardware Store', 'Pharmacy', 'Other Retail']
  },
  {
    name: 'Food & Restaurant',
    subcategories: ['Restaurant', 'Fast Food', 'Cafe', 'Bakery', 'Sweet Shop', 'Ice Cream Parlor', 'Cloud Kitchen', 'Catering']
  },
  {
    name: 'Services',
    subcategories: ['Salon & Spa', 'Laundry', 'Repair Services', 'Consulting', 'Photography', 'Event Planning', 'Cleaning Services', 'Other Services']
  },
  {
    name: 'Healthcare',
    subcategories: ['Clinic', 'Hospital', 'Diagnostic Center', 'Dental Clinic', 'Veterinary', 'Medical Store', 'Pharmacy']
  },
  {
    name: 'Education',
    subcategories: ['School', 'Coaching Classes', 'Training Institute', 'Language Classes', 'Music Classes', 'Dance Academy', 'Sports Academy']
  },
  {
    name: 'Automobile',
    subcategories: ['Car Showroom', 'Bike Showroom', 'Service Center', 'Spare Parts', 'Car Wash', 'Tyre Shop']
  },
  {
    name: 'Real Estate',
    subcategories: ['Property Dealer', 'Construction', 'Interior Designer', 'Architect']
  },
  {
    name: 'Other',
    subcategories: ['Manufacturing', 'Wholesale', 'Distribution', 'Logistics', 'Other Business']
  }
];

export default function BusinessSetupScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  
  const [businessType, setBusinessType] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);

  const selectedCategory = CATEGORIES.find(cat => cat.name === category);
  const subcategories = selectedCategory?.subcategories || [];

  const handleSave = async () => {
    // Validation
    if (!businessType) {
      Alert.alert('Required', 'Please select a business type');
      return;
    }
    if (!category) {
      Alert.alert('Required', 'Please select a category');
      return;
    }
    if (!subcategory) {
      Alert.alert('Required', 'Please select a sub-category');
      return;
    }

    setLoading(true);
    try {
      // Update profile with business info
      await ApiService.updateProfile({
        business_type: businessType,
        category: category,
        subcategory: subcategory,
      });

      // Mark setup as completed
      await AsyncStorage.setItem('business_setup_completed', 'true');

      Alert.alert(
        'Setup Complete!',
        'Your business profile is ready. You can complete additional details anytime from Profile settings.',
        [
          { 
            text: 'Get Started', 
            onPress: () => {
              // Navigate to main app
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Business setup error:', error);
      Alert.alert('Error', error.message || 'Failed to save business information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '15' }]}>
            <Ionicons name="business" size={40} color={Colors.primary} />
          </View>
          <Text style={[styles.title, { color: Colors.textPrimary }]}>
            Setup Your Business
          </Text>
          <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
            Help us understand your business better
          </Text>
        </View>

        {/* Business Type Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: Colors.textPrimary }]}>
            Business Type <Text style={{ color: Colors.creditRed }}>*</Text>
          </Text>
          <View style={styles.typeGrid}>
            {BUSINESS_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  { 
                    backgroundColor: businessType === type.id ? Colors.primary + '15' : Colors.card,
                    borderColor: businessType === type.id ? Colors.primary : Colors.borderLight,
                  }
                ]}
                onPress={() => setBusinessType(type.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.typeIcon,
                  { backgroundColor: businessType === type.id ? Colors.primary + '20' : Colors.backgroundSecondary }
                ]}>
                  <Ionicons 
                    name={type.icon as any} 
                    size={28} 
                    color={businessType === type.id ? Colors.primary : Colors.textSecondary} 
                  />
                </View>
                <Text style={[
                  styles.typeLabel,
                  { color: businessType === type.id ? Colors.primary : Colors.textPrimary }
                ]}>
                  {type.label}
                </Text>
                <Text style={[styles.typeDesc, { color: Colors.textTertiary }]}>
                  {type.description}
                </Text>
                {businessType === type.id && (
                  <View style={[styles.checkmark, { backgroundColor: Colors.primary }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: Colors.textPrimary }]}>
            Category <Text style={{ color: Colors.creditRed }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.dropdown,
              { 
                backgroundColor: Colors.card,
                borderColor: category ? Colors.primary : Colors.borderLight,
              }
            ]}
            onPress={() => setShowCategoryModal(true)}
          >
            <Ionicons 
              name="grid-outline" 
              size={20} 
              color={category ? Colors.primary : Colors.textSecondary} 
            />
            <Text style={[
              styles.dropdownText,
              { color: category ? Colors.textPrimary : Colors.textTertiary }
            ]}>
              {category || 'Select category'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Sub Category Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: Colors.textPrimary }]}>
            Sub Category <Text style={{ color: Colors.creditRed }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.dropdown,
              { 
                backgroundColor: Colors.card,
                borderColor: subcategory ? Colors.primary : Colors.borderLight,
                opacity: !category ? 0.5 : 1,
              }
            ]}
            onPress={() => category && setShowSubcategoryModal(true)}
            disabled={!category}
          >
            <Ionicons 
              name="list-outline" 
              size={20} 
              color={subcategory ? Colors.primary : Colors.textSecondary} 
            />
            <Text style={[
              styles.dropdownText,
              { color: subcategory ? Colors.textPrimary : Colors.textTertiary }
            ]}>
              {subcategory || (category ? 'Select sub-category' : 'Select category first')}
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { 
              backgroundColor: Colors.primary,
              opacity: (businessType && category && subcategory) ? 1 : 0.5,
            }
          ]}
          onPress={handleSave}
          disabled={!businessType || !category || !subcategory || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.saveButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors.textPrimary }]}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.modalItem,
                    { borderBottomColor: Colors.borderLight },
                    category === cat.name && { backgroundColor: Colors.primary + '15' }
                  ]}
                  onPress={() => {
                    setCategory(cat.name);
                    setSubcategory(''); // Reset subcategory when category changes
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    { color: category === cat.name ? Colors.primary : Colors.textPrimary }
                  ]}>
                    {cat.name}
                  </Text>
                  {category === cat.name && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Subcategory Modal */}
      <Modal
        visible={showSubcategoryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSubcategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors.textPrimary }]}>Select Sub-Category</Text>
              <TouchableOpacity onPress={() => setShowSubcategoryModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {subcategories.map((sub) => (
                <TouchableOpacity
                  key={sub}
                  style={[
                    styles.modalItem,
                    { borderBottomColor: Colors.borderLight },
                    subcategory === sub && { backgroundColor: Colors.primary + '15' }
                  ]}
                  onPress={() => {
                    setSubcategory(sub);
                    setShowSubcategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    { color: subcategory === sub ? Colors.primary : Colors.textPrimary }
                  ]}>
                    {sub}
                  </Text>
                  {subcategory === sub && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '48%',
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeDesc: {
    fontSize: 11,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    gap: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: BorderRadius.md,
    marginTop: 16,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 15,
  },
});
