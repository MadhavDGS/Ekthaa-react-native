/**
 * Add Catalog Item Screen
 * Add a new product directly to the customer-facing catalog
 * With image upload to Cloudinary
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

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors.textSecondary }]}>Category (optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6', color: Colors.textPrimary }]}
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Food, Electronics, Clothing"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors.textSecondary }]}>Description (optional)</Text>
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
});
