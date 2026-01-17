/**
 * Product Detail Screen
 * View, edit and delete catalog items
 */

import React, { useState, useEffect } from 'react';
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

// Predefined description points
const DESCRIPTION_BADGES = [
  '⭐ Premium Quality',
  '✓ 100% Original',
  '🏆 Best Seller',
  '🌿 Fresh Stock',
  '💯 Guaranteed',
  '🔥 Hot Deal',
  '📦 Fast Delivery',
  '🎯 Top Rated',
];

// Fallback placeholder
const PRODUCT_PLACEHOLDER = require('../../../assets/product-placeholder.jpg');

export default function ProductDetailScreen({ route, navigation }: any) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const Colors = getThemedColors(isDark);
  const { productId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  
  // Product data
  const [product, setProduct] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [hidePrice, setHidePrice] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  useEffect(() => {
    navigation.setOptions({
      title: editMode ? 'Edit Product' : 'Product Details',
      headerRight: () => !editMode ? (
        <TouchableOpacity 
          onPress={() => setEditMode(true)} 
          style={{ marginRight: 8 }}
        >
          <Ionicons name="create-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      ) : null,
    });
  }, [editMode, navigation, Colors]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getCatalogItem(productId);
      const item = response.item || response;
      setProduct(item);
      setName(item.name || '');
      setDescription(item.description || '');
      setPrice(item.price?.toString() || '0');
      setCategory(item.category || '');
      setImageUri(item.image_url || '');
      setHidePrice(item.price === 0);
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

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
      'Change Product Image',
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
    if (currentDesc.includes(badge)) return;
    
    const newDesc = currentDesc ? `${currentDesc}\n${badge}` : badge;
    setDescription(newDesc);
    setShowBadgeModal(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return;
    }
    
    if (!hidePrice && (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
      Alert.alert('Error', 'Please enter a valid price or enable "Hide price"');
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        name: name.trim(),
        description: description.trim(),
        price: hidePrice ? 0 : parseFloat(price),
        category: category.trim(),
      };

      // If image changed (is a local file URI), upload it
      if (imageUri && imageUri.startsWith('file://')) {
        // For now, update without image change - backend would need form data
        // This is a simplified version
      }

      await ApiService.updateCatalogItem(productId, updateData);
      
      Alert.alert('Success', 'Product updated successfully!', [
        { text: 'OK', onPress: () => {
          setEditMode(false);
          loadProduct();
        }}
      ]);
    } catch (error: any) {
      console.error('Update product error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await ApiService.deleteCatalogItem(productId);
              Alert.alert('Deleted', 'Product removed from catalog', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error: any) {
              console.error('Delete product error:', error);
              Alert.alert('Error', error.response?.data?.error || 'Failed to delete product');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: Colors.backgroundSecondary }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>Loading product...</Text>
      </View>
    );
  }

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
        {/* Image Section */}
        <TouchableOpacity
          style={[styles.imagePicker, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
          onPress={editMode ? showImageOptions : undefined}
          activeOpacity={editMode ? 0.7 : 1}
          disabled={!editMode}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.productImage} />
          ) : (
            <Image source={PRODUCT_PLACEHOLDER} style={styles.productImage} />
          )}
          {editMode && (
            <View style={[styles.editBadge, { backgroundColor: Colors.primary }]}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Form/Details */}
        <View style={[styles.formCard, { backgroundColor: Colors.card }]}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors.textSecondary }]}>Product Name</Text>
            {editMode ? (
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6', color: Colors.textPrimary }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter product name"
                placeholderTextColor={Colors.textTertiary}
              />
            ) : (
              <Text style={[styles.valueText, { color: Colors.textPrimary }]}>{name}</Text>
            )}
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={[styles.label, { color: Colors.textSecondary, marginBottom: 0 }]}>Price (₹)</Text>
              {editMode && (
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  onPress={() => {
                    setHidePrice(!hidePrice);
                    if (!hidePrice) setPrice('0');
                  }}
                >
                  <View style={[styles.checkbox, { 
                    borderColor: hidePrice ? Colors.primary : Colors.borderLight,
                    backgroundColor: hidePrice ? Colors.primary : 'transparent'
                  }]}>
                    {hidePrice && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                  <Text style={[{ fontSize: 12, color: Colors.textSecondary }]}>Hide price</Text>
                </TouchableOpacity>
              )}
            </View>
            {editMode ? (
              <TextInput
                style={[
                  styles.input, 
                  { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6', color: Colors.textPrimary },
                  hidePrice && { opacity: 0.5 }
                ]}
                value={hidePrice ? 'Contact for price' : price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.textTertiary}
                editable={!hidePrice}
              />
            ) : (
              <Text style={[styles.valueText, { color: parseFloat(price) === 0 ? Colors.textSecondary : Colors.primary, fontWeight: '600', fontSize: 18 }]}>
                {parseFloat(price) === 0 ? 'Contact for price' : `₹${parseFloat(price).toLocaleString('en-IN')}`}
              </Text>
            )}
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors.textSecondary }]}>Category</Text>
            {editMode ? (
              <TouchableOpacity
                style={[styles.input, styles.dropdown, { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6' }]}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={[{ color: category ? Colors.textPrimary : Colors.textTertiary }]}>
                  {category || 'Select category'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            ) : (
              <Text style={[styles.valueText, { color: Colors.textPrimary }]}>{category || 'Not specified'}</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={[styles.label, { color: Colors.textSecondary, marginBottom: 0 }]}>Description</Text>
              {editMode && (
                <TouchableOpacity 
                  style={[styles.addBadgeBtn, { backgroundColor: Colors.primary + '15', borderColor: Colors.primary }]}
                  onPress={() => setShowBadgeModal(true)}
                >
                  <Ionicons name="add" size={14} color={Colors.primary} />
                  <Text style={[{ fontSize: 11, color: Colors.primary, marginLeft: 2 }]}>Add Badge</Text>
                </TouchableOpacity>
              )}
            </View>
            {editMode ? (
              <TextInput
                style={[
                  styles.input, 
                  styles.textArea,
                  { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6', color: Colors.textPrimary }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter product description"
                placeholderTextColor={Colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            ) : (
              <Text style={[styles.valueText, { color: Colors.textPrimary }]}>
                {description || 'No description'}
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {editMode && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
              onPress={() => {
                setEditMode(false);
                // Reset values
                setName(product.name || '');
                setDescription(product.description || '');
                setPrice(product.price?.toString() || '0');
                setCategory(product.category || '');
                setImageUri(product.image_url || '');
                setHidePrice(product.price === 0);
              }}
            >
              <Text style={[styles.cancelButtonText, { color: Colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: Colors.primary }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Delete Button */}
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: Colors.creditRed + '15', borderColor: Colors.creditRed }]}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color={Colors.creditRed} size="small" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color={Colors.creditRed} />
              <Text style={[styles.deleteButtonText, { color: Colors.creditRed }]}>Delete from Catalog</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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

      {/* Badge Modal */}
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
            <ScrollView style={styles.modalList}>
              {DESCRIPTION_BADGES.map((badge) => (
                <TouchableOpacity
                  key={badge}
                  style={[styles.modalItem, { borderBottomColor: Colors.borderLight }]}
                  onPress={() => addBadgeToDescription(badge)}
                >
                  <Text style={[styles.modalItemText, { color: Colors.textPrimary }]}>{badge}</Text>
                  <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  imagePicker: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
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
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 15,
    lineHeight: 22,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 15,
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
