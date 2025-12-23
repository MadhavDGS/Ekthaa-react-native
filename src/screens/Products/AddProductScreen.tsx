/**
 * Add Product Screen
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
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';import { IconSizes, AvatarSizes, SpacingScale } from '../../constants/scales';import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';
import { getAllLevel1InventoryCategories, getLevel2InventoryOptions } from '../../constants/inventoryCategories';

export default function AddProductScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  const allCategories = getAllLevel1InventoryCategories();
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSubcategoryPicker, setShowSubcategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  
  const [customCategory, setCustomCategory] = useState('');
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [showCustomSubcategoryInput, setShowCustomSubcategoryInput] = useState(false);
  const [showCustomUnitInput, setShowCustomUnitInput] = useState(false);

  React.useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const unitsData = await ApiService.getProductUnits();
      setUnits([...(unitsData.units || []), 'Other']);
    } catch (error) {
      console.error('Error loading units:', error);
      setUnits(['Piece', 'Kg', 'Litre', 'Meter', 'Box', 'Packet', 'Other']);
    }
  };

  const handleCategoryChange = (selectedCategoryId: string) => {
    if (selectedCategoryId === 'other') {
      setShowCustomCategoryInput(true);
      setShowCustomSubcategoryInput(true);
      setCategory('other');
      setSubcategory('');
      setSubcategories([]);
    } else {
      setShowCustomCategoryInput(false);
      setShowCustomSubcategoryInput(false);
      setCustomCategory('');
      setCustomSubcategory('');
      setCategory(selectedCategoryId);
      setSubcategory('');
      const subcats = getLevel2InventoryOptions(selectedCategoryId);
      setSubcategories([...subcats, 'Other']);
    }
    setShowCategoryPicker(false);
  };

  const handleSubcategoryChange = (selectedSubcategory: string) => {
    if (selectedSubcategory === 'Other') {
      setShowCustomSubcategoryInput(true);
      setSubcategory('Other');
    } else {
      setShowCustomSubcategoryInput(false);
      setCustomSubcategory('');
      setSubcategory(selectedSubcategory);
    }
    setShowSubcategoryPicker(false);
  };

  const handleUnitChange = (selectedUnit: string) => {
    if (selectedUnit === 'Other') {
      setShowCustomUnitInput(true);
      setUnit('Other');
    } else {
      setShowCustomUnitInput(false);
      setCustomUnit('');
      setUnit(selectedUnit);
    }
    setShowUnitPicker(false);
  };

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
    // Determine final values for category, subcategory, and unit
    const finalCategory = showCustomCategoryInput ? customCategory : 
      allCategories.find(c => c.id === category)?.name || category;
    const finalSubcategory = showCustomSubcategoryInput ? customSubcategory : subcategory;
    const finalUnit = showCustomUnitInput ? customUnit : unit;

    if (!name || !finalCategory || !finalSubcategory || !price || !finalUnit || !stockQuantity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (showCustomCategoryInput && !customCategory.trim()) {
      Alert.alert('Error', 'Please enter a custom category name');
      return;
    }

    if (showCustomSubcategoryInput && !customSubcategory.trim()) {
      Alert.alert('Error', 'Please enter a custom subcategory name');
      return;
    }

    if (showCustomUnitInput && !customUnit.trim()) {
      Alert.alert('Error', 'Please enter a custom unit');
      return;
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stockQuantity);
    const thresholdNum = parseInt(lowStockThreshold);

    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert('Error', 'Please enter a valid stock quantity');
      return;
    }

    try {
      setLoading(true);
      await ApiService.addProduct({
        name,
        description: description || undefined,
        category: finalCategory,
        subcategory: finalSubcategory,
        price: priceNum,
        unit: finalUnit,
        stock_quantity: stockNum,
        low_stock_threshold: thresholdNum,
        product_image: imageUri || undefined,
      });
      
      Alert.alert('Success', 'Product added successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
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
          {/* <View style={styles.header}>
            <Ionicons name="cube" size={43} color={Colors.primary} />
            <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>New Product</Text>
            <Text style={[styles.headerSubtitle, { color: Colors.textSecondary }]}>Add product to your inventory</Text>
          </View> */}

          {/* Image Upload Section */}
          <TouchableOpacity style={[styles.imageUploadCard, { backgroundColor: Colors.card }]} onPress={showImageOptions} activeOpacity={0.8}>
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.productImage} />
                <View style={styles.imageOverlay}>
                  <Ionicons name="camera" size={25} color="#fff" />
                  <Text style={styles.overlayText}>Change Photo</Text>
                </View>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <View style={[styles.cameraIconCircle, { backgroundColor: Colors.primary + '15' }]}>
                  <Ionicons name="camera" size={29} color={Colors.primary} />
                </View>
                <Text style={[styles.uploadText, { color: Colors.textPrimary }]}>Add Product Photo</Text>
                <Text style={[styles.uploadSubtext, { color: Colors.textSecondary }]}>Tap to upload</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={[styles.form, { backgroundColor: Colors.card }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.textPrimary }]}>Product Name *</Text>
              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '10' }]}>
                  <Ionicons name="cube-outline" size={18} color={Colors.primary} />
                </View>
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="Enter product name"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.textPrimary }]}>Description (optional)</Text>
              <View style={[styles.inputContainer, { alignItems: 'flex-start', backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <View style={[styles.iconWrapper, { marginTop: 4, backgroundColor: Colors.primary + '10' }]}>
                  <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
                </View>
                <TextInput
                  style={[styles.input, styles.textArea, { color: Colors.textPrimary }]}
                  placeholder="Enter product description"
                  placeholderTextColor="#9ca3af"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.textPrimary }]}>Main Category *</Text>
              <TouchableOpacity 
                style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '10' }]}>
                  <Ionicons name="apps-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={[styles.input, !category && styles.placeholder, { color: category ? Colors.textPrimary : Colors.textSecondary }]}>
                  {category 
                    ? (showCustomCategoryInput ? 'Other (Custom)' : allCategories.find(c => c.id === category)?.name || category)
                    : 'Select main category'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#9ca3af" />
              </TouchableOpacity>
              {showCategoryPicker && (
                <View style={[styles.pickerContainer, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}>
                  <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                    {allCategories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.pickerItem, { borderBottomColor: Colors.borderLight }]}
                        onPress={() => handleCategoryChange(cat.id)}
                      >
                        <Ionicons name={cat.icon as any} size={18} color={cat.color} style={{ marginRight: Spacing.md }} />
                        <Text style={[styles.pickerItemText, { color: Colors.textPrimary }]}>{cat.name}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={[styles.pickerItem, { borderBottomColor: Colors.borderLight }]}
                      onPress={() => handleCategoryChange('other')}
                    >
                      <Ionicons name="add-circle-outline" size={18} color="#9ca3af" style={{ marginRight: Spacing.md }} />
                      <Text style={[styles.pickerItemText, { color: Colors.textPrimary }]}>Other (Add Custom)</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              )}
            </View>

            {showCustomCategoryInput && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: Colors.textPrimary }]}>Custom Category Name *</Text>
                <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                  <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '10' }]}>
                    <Ionicons name="create-outline" size={20} color={Colors.primary} />
                  </View>
                  <TextInput
                    style={[styles.input, { color: Colors.textPrimary }]}
                    placeholder="Enter custom category"
                    placeholderTextColor="#9ca3af"
                    value={customCategory}
                    onChangeText={setCustomCategory}
                  />
                </View>
              </View>
            )}

            {category && !showCustomCategoryInput && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: Colors.textPrimary }]}>Subcategory *</Text>
                  <TouchableOpacity 
                    style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}
                    onPress={() => setShowSubcategoryPicker(!showSubcategoryPicker)}
                  >
                    <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '10' }]}>
                      <Ionicons name="list-outline" size={18} color={Colors.primary} />
                    </View>
                    <Text style={[styles.input, !subcategory && styles.placeholder, { color: subcategory ? Colors.textPrimary : Colors.textSecondary }]}>
                      {subcategory 
                        ? (showCustomSubcategoryInput ? 'Other (Custom)' : subcategory)
                        : 'Select subcategory'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                  {showSubcategoryPicker && (
                    <View style={[styles.pickerContainer, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}>
                      <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                        {subcategories.map((subcat) => (
                          <TouchableOpacity
                            key={subcat}
                            style={[styles.pickerItem, { borderBottomColor: Colors.borderLight }]}
                            onPress={() => handleSubcategoryChange(subcat)}
                          >
                            <Text style={[styles.pickerItemText, { color: Colors.textPrimary }]}>{subcat}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {showCustomSubcategoryInput && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: Colors.textPrimary }]}>Custom Subcategory Name *</Text>
                    <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                      <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '10' }]}>
                        <Ionicons name="create-outline" size={20} color={Colors.primary} />
                      </View>
                      <TextInput
                        style={[styles.input, { color: Colors.textPrimary }]}
                        placeholder="Enter custom subcategory"
                        placeholderTextColor="#9ca3af"
                        value={customSubcategory}
                        onChangeText={setCustomSubcategory}
                      />
                    </View>
                  </View>
                )}
              </>
            )}

            {showCustomCategoryInput && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: Colors.textPrimary }]}>Custom Subcategory *</Text>
                <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                  <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '10' }]}>
                    <Ionicons name="create-outline" size={20} color={Colors.primary} />
                  </View>
                  <TextInput
                    style={[styles.input, { color: Colors.textPrimary }]}
                    placeholder="Enter custom subcategory"
                    placeholderTextColor="#9ca3af"
                    value={customSubcategory}
                    onChangeText={setCustomSubcategory}
                  />
                </View>
              </View>
            )}

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={[styles.label, { color: Colors.textPrimary }]}>Price *</Text>
                <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                  <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '10' }]}>
                    <Ionicons name="cash-outline" size={18} color={Colors.primary} />
                  </View>
                  <TextInput
                    style={[styles.input, { color: Colors.textPrimary }]}
                    placeholder="0.00"
                    placeholderTextColor="#9ca3af"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: Colors.textPrimary }]}>Unit *</Text>
                <TouchableOpacity 
                  style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}
                  onPress={() => setShowUnitPicker(!showUnitPicker)}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '10' }]}>
                    <Ionicons name="scale-outline" size={18} color={Colors.primary} />
                  </View>
                  <Text style={[styles.input, !unit && styles.placeholder, { color: unit ? Colors.textPrimary : Colors.textSecondary }]}>
                    {unit 
                      ? (showCustomUnitInput ? 'Other (Custom)' : unit)
                      : 'Select'}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color="#9ca3af" />
                </TouchableOpacity>
                {showUnitPicker && (
                  <View style={[styles.pickerContainer, { maxHeight: 150, backgroundColor: Colors.card, borderColor: Colors.borderLight }]}>
                    <ScrollView nestedScrollEnabled>
                      {units.map((u) => (
                        <TouchableOpacity
                          key={u}
                          style={[styles.pickerItem, { borderBottomColor: Colors.borderLight }]}
                          onPress={() => handleUnitChange(u)}
                        >
                          <Text style={[styles.pickerItemText, { color: Colors.textPrimary }]}>{u}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            {showCustomUnitInput && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: Colors.textPrimary }]}>Custom Unit Name *</Text>
                <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                  <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '10' }]}>
                    <Ionicons name="create-outline" size={20} color={Colors.primary} />
                  </View>
                  <TextInput
                    style={[styles.input, { color: Colors.textPrimary }]}
                    placeholder="Enter custom unit (e.g., Dozen)"
                    placeholderTextColor="#9ca3af"
                    value={customUnit}
                    onChangeText={setCustomUnit}
                  />
                </View>
              </View>
            )}

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={[styles.label, { color: Colors.textPrimary }]}>Stock Quantity *</Text>
                <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                  <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '10' }]}>
                    <Ionicons name="layers-outline" size={18} color={Colors.primary} />
                  </View>
                  <TextInput
                    style={[styles.input, { color: Colors.textPrimary }]}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    value={stockQuantity}
                    onChangeText={setStockQuantity}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: Colors.textPrimary }]}>Low Stock Alert</Text>
                <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                  <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '10' }]}>
                    <Ionicons name="alert-circle-outline" size={18} color={Colors.primary} />
                  </View>
                  <TextInput
                    style={[styles.input, { color: Colors.textPrimary }]}
                    placeholder="5"
                    placeholderTextColor="#9ca3af"
                    value={lowStockThreshold}
                    onChangeText={setLowStockThreshold}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled, { backgroundColor: Colors.primary, ...Platform.select({ ios: { shadowColor: Colors.primary }, android: {} }) }]}
            onPress={handleAddProduct}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitButtonText}>Adding Product...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Add Product</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.space8,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontBase,
    fontWeight: Typography.bold,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontXs,
  },
  form: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: Typography.fontXs,
    fontWeight: Typography.semiBold,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  iconWrapper: {
    width: IconSizes.large,
    height: IconSizes.large,
    borderRadius: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.font3xs,
    paddingVertical: 0,
  },
  submitButton: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.xs,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.bold,
    color: '#fff',
  },
  placeholder: {
  },
  pickerContainer: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    maxHeight: 160,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  pickerScroll: {
    maxHeight: 160,
  },
  pickerItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  pickerItemText: {
    fontSize: Typography.fontXs,
  },
  imageUploadCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  imagePreviewContainer: {
    position: 'relative',
    width: 86,
    height: 86,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.lg,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: Typography.fontXs,
    fontWeight: Typography.semiBold,
    marginTop: Spacing.xs,
  },
  imagePlaceholder: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  cameraIconCircle: {
    width: IconSizes.xlarge + 10,
    height: IconSizes.xlarge + 10,
    borderRadius: (IconSizes.xlarge + 10) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  uploadText: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
    marginBottom: Spacing.xs,
  },
  uploadSubtext: {
    fontSize: Typography.fontXs,
  },
  textArea: {
    minHeight: 50,
    paddingTop: Spacing.sm,
  },
});
