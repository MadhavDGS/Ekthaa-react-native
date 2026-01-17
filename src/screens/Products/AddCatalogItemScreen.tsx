/**
 * Add Catalog Item Screen
 * Add a new product directly to the customer-facing catalog
 * With image upload to Cloudinary, category dropdown and quality badges
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import ApiService from '../../services/api';
import { Spacing, Typography, BorderRadius } from '../../constants/theme';
import { getThemedColors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

// Fallback placeholder
const PRODUCT_PLACEHOLDER = require('../../../assets/product-placeholder.jpg');

// Product categories
const PRODUCT_CATEGORIES = [
  'Groceries',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Bakery',
  'Beverages',
  'Snacks',
  'Personal Care',
  'Household',
  'Electronics',
  'Clothing',
  'Stationery',
  'Medicine',
  'Others',
];

// Predefined description badges
const DESCRIPTION_BADGES = [
  '⭐ Premium Quality',
  '✓ 100% Original',
  '🏆 Best Seller',
  '🌿 Fresh Stock',
  '💯 Guaranteed',
  '🔥 Hot Deal',
  '📦 Fast Delivery',
  '🎯 Top Rated',
  '♻️ Eco Friendly',
  '🆕 New Arrival',
];

export default function AddCatalogItemScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const Colors = getThemedColors(isDark);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [hidePrice, setHidePrice] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Product Image',
      'Choose how to add an image',
      [
        { text: 'Camera', onPress: handleTakePhoto },
        { text: 'Gallery', onPress: handlePickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const addBadgeToDescription = (badge: string) => {
    const currentDesc = description.trim();
    if (currentDesc.includes(badge)) {
      setShowBadgeModal(false);
      return;
    }
    const newDesc = currentDesc ? `${currentDesc}\n${badge}` : badge;
    setDescription(newDesc);
    setShowBadgeModal(false);
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return;
    }
    
    // Price validation: required if not hidden, must be valid number
    if (!hidePrice) {
      if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
        Alert.alert('Error', 'Please enter a valid price or enable "Hide price"');
        return;
      }
    }

    setLoading(true);
    try {
      const catalogData: any = {
        name: name.trim(),
        description: description.trim(),
        price: hidePrice ? 0 : parseFloat(price),
        category: category.trim(),
        is_visible: true,
      };

      // If image is selected, include it for upload
      if (imageUri) {
        catalogData.image = imageUri;
      }

      await ApiService.addCatalogItem(catalogData);
      
      Alert.alert(
        'Success',
        'Product added to catalog!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Add catalog item error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Picker */}
        <TouchableOpacity
          style={[styles.imagePicker, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
          onPress={showImageOptions}
          activeOpacity={0.7}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.productImage} />
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <Ionicons name="camera-outline" size={48} color={Colors.textTertiary} />
              <Text style={[styles.imagePickerText, { color: Colors.textSecondary }]}>
                Tap to add product image
              </Text>
            </View>
          )}
          {imageUri && (
            <View style={[styles.editBadge, { backgroundColor: Colors.primary }]}>
              <Ionicons name="pencil" size={16} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Form */}
        <View style={[styles.formCard, { backgroundColor: Colors.card }]}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors.textSecondary }]}>Product Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6', color: Colors.textPrimary }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter product name"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={[styles.label, { color: Colors.textSecondary, marginBottom: 0 }]}>Price (₹) {hidePrice ? '' : '(optional)'}</Text>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                onPress={() => {
                  setHidePrice(!hidePrice);
                  if (!hidePrice) setPrice('0');
                }}
                activeOpacity={0.7}
              >
                <View style={[
                  { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
                  hidePrice && { backgroundColor: Colors.primary }
                ]}>
                  {hidePrice && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={[{ fontSize: 13, color: Colors.textSecondary }]}>Hide price</Text>
              </TouchableOpacity>
            </View>
            {!hidePrice ? (
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6', color: Colors.textPrimary }]}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="decimal-pad"
              />
            ) : (
              <View style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6', justifyContent: 'center' }]}>
                <Text style={[{ color: Colors.textSecondary, fontStyle: 'italic' }]}>Price hidden - Customers will contact you</Text>
              </View>
            )}
          </View>

          {/* Category - Now a dropdown */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors.textSecondary }]}>Category (optional)</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdown, { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6' }]}
              onPress={() => setShowCategoryModal(true)}
              activeOpacity={0.7}
            >
              <Text style={[{ fontSize: Typography.fontMd, color: category ? Colors.textPrimary : Colors.textTertiary }]}>
                {category || 'Select category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Description with badge button */}
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={[styles.label, { color: Colors.textSecondary, marginBottom: 0 }]}>Description (optional)</Text>
              <TouchableOpacity 
                style={[styles.addBadgeBtn, { backgroundColor: Colors.primary + '15', borderColor: Colors.primary }]}
                onPress={() => setShowBadgeModal(true)}
              >
                <Ionicons name="ribbon-outline" size={14} color={Colors.primary} />
                <Text style={[{ fontSize: 11, color: Colors.primary, marginLeft: 4 }]}>Add Badge</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6', color: Colors.textPrimary }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your product..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#e8f5f3' }]}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
          <Text style={[styles.infoText, { color: Colors.textSecondary }]}>
            Products added to the catalog will be visible to customers. You can hide or remove them later.
          </Text>
        </View>
      </ScrollView>

      {/* Category Selection Modal */}
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
              {PRODUCT_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.modalItem,
                    { borderBottomColor: Colors.borderLight },
                    category === cat && { backgroundColor: Colors.primary + '15' }
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText, 
                    { color: category === cat ? Colors.primary : Colors.textPrimary }
                  ]}>
                    {cat}
                  </Text>
                  {category === cat && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Badge Selection Modal */}
      <Modal
        visible={showBadgeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBadgeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors.textPrimary }]}>Add Quality Badge</Text>
              <TouchableOpacity onPress={() => setShowBadgeModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSubtitle, { color: Colors.textSecondary }]}>
              Tap to add to description
            </Text>
            <ScrollView style={styles.modalList}>
              {DESCRIPTION_BADGES.map((badge) => (
                <TouchableOpacity
                  key={badge}
                  style={[styles.modalItem, { borderBottomColor: Colors.borderLight }]}
                  onPress={() => addBadgeToDescription(badge)}
                >
                  <Text style={[styles.modalItemText, { color: Colors.textPrimary, fontSize: 16 }]}>{badge}</Text>
                  <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: Colors.card, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: Colors.primary }, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Add to Catalog</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  imagePicker: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  imagePickerText: {
    fontSize: Typography.fontSm,
  },
  editBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
    marginBottom: 6,
  },
  input: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: Typography.fontMd,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSm,
    lineHeight: 20,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: Typography.fontMd,
    fontWeight: Typography.semiBold,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
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
  modalSubtitle: {
    fontSize: 13,
    paddingHorizontal: Spacing.md,
    paddingTop: 8,
  },
  modalList: {
    padding: Spacing.sm,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 15,
  },
});
