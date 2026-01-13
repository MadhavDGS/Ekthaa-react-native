/**
 * Add Product Lite Screen - Simplified version for quick product additions from dashboard
 * Only captures: Image, Name, Description, Price
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { IconSizes, SpacingScale, RadiusScale, AvatarSizes } from '../../constants/scales';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

export default function AddProductLiteScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera is required!');
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
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Product Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAddProduct = async () => {
    if (!name || !price) {
      Alert.alert('Error', 'Please enter product name and price');
      return;
    }

    const priceNum = parseFloat(price);

    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      setLoading(true);
      
      // Add product with minimal required fields
      // Using default values for category/subcategory/unit/stock to satisfy schema
      await ApiService.addProduct({
        name,
        description: description || undefined,
        category: 'General', // Default category
        subcategory: 'Other', // Default subcategory
        price: priceNum,
        unit: 'Piece', // Default unit
        stock_quantity: 0, // Default stock
        low_stock_threshold: 0, // Default threshold
        product_image: imageUri || undefined,
      });

      Alert.alert('Success', 'Product added successfully!', [
        {
          text: 'Add Another',
          onPress: () => {
            setName('');
            setDescription('');
            setPrice('');
            setImageUri(null);
          },
        },
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
          style: 'cancel',
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={IconSizes.medium} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>Add Product</Text>
          <Text style={[styles.headerSubtitle, { color: Colors.textSecondary }]}>Quick add to showcase</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Image Upload Section */}
          <TouchableOpacity
            style={[styles.imageUploadCard, { backgroundColor: Colors.card }]}
            onPress={showImageOptions}
            activeOpacity={0.8}
          >
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.productImage} />
                <View style={styles.imageOverlay}>
                  <Ionicons name="camera" size={IconSizes.medium} color="#fff" />
                  <Text style={styles.overlayText}>Change Photo</Text>
                </View>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <View style={[styles.cameraIconCircle, { backgroundColor: Colors.primary + '15' }]}>
                  <Ionicons name="camera" size={IconSizes.large} color={Colors.primary} />
                </View>
                <Text style={[styles.uploadText, { color: Colors.textPrimary }]}>Add Product Photo</Text>
                <Text style={[styles.uploadSubtext, { color: Colors.textSecondary }]}>Tap to upload</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Form */}
          <View style={[styles.form, { backgroundColor: Colors.card }]}>
            {/* Product Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.textPrimary }]}>Product Name *</Text>
              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '10' }]}>
                  <Ionicons name="cube-outline" size={IconSizes.small} color={Colors.primary} />
                </View>
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="e.g., Premium Basmati Rice"
                  placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.textPrimary }]}>Description</Text>
              <View style={[styles.inputContainer, { alignItems: 'flex-start', backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <View style={[styles.iconWrapper, { marginTop: 4, backgroundColor: Colors.primary + '10' }]}>
                  <Ionicons name="document-text-outline" size={IconSizes.small} color={Colors.primary} />
                </View>
                <TextInput
                  style={[styles.input, styles.textArea, { color: Colors.textPrimary }]}
                  placeholder="Brief description of your product"
                  placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.textPrimary }]}>Price *</Text>
              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '10' }]}>
                  <Ionicons name="cash-outline" size={IconSizes.small} color={Colors.primary} />
                </View>
                <Text style={[styles.currencySymbol, { color: Colors.textSecondary }]}>₹</Text>
                <TextInput
                  style={[styles.input, styles.priceInput, { color: Colors.textPrimary }]}
                  placeholder="0.00"
                  placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Info Note */}
            <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.1)' : '#e8f5f3' }]}>
              <Ionicons name="information-circle" size={IconSizes.small} color="#5a9a8e" />
              <Text style={[styles.infoText, { color: Colors.textSecondary }]}>
                You can add more details like category, stock, and units later from the full product page.
              </Text>
            </View>
          </View>

          {/* Add Button */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: Colors.primary }]}
            onPress={handleAddProduct}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="add-circle" size={IconSizes.small} color="#fff" />
                <Text style={styles.addButtonText}>Add Product</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Bottom Spacing */}
          <View style={{ height: SpacingScale.sectionPadding }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SpacingScale.cardPadding,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: SpacingScale.cardPadding,
    ...Shadows.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RadiusScale.button,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SpacingScale.cardPadding,
    paddingTop: SpacingScale.cardPadding,
  },
  imageUploadCard: {
    borderRadius: RadiusScale.card,
    overflow: 'hidden',
    marginBottom: SpacingScale.cardPadding,
    ...Shadows.md,
  },
  imagePreviewContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    color: '#fff',
    marginTop: Spacing.sm,
    fontSize: 14,
    fontWeight: '600',
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  uploadSubtext: {
    fontSize: 13,
  },
  form: {
    borderRadius: RadiusScale.card,
    padding: SpacingScale.cardPadding,
    marginBottom: SpacingScale.cardPadding,
    ...Shadows.sm,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RadiusScale.input,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: RadiusScale.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Spacing.xs,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: Spacing.xs,
  },
  priceInput: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: RadiusScale.button,
    marginTop: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: Spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: RadiusScale.button,
    ...Shadows.md,
    gap: Spacing.sm,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
