/**
 * Complete Profile Screen - Step-by-Step Profile Completion
 * Helps users complete their profile after initial registration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Alert,
  ScrollView,
  Modal,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { AvatarSizes } from '../../constants/scales';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

// Business Categories with Subcategories
const BUSINESS_CATEGORIES = [
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

interface Step {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  validation?: (value: string) => string | null;
  required?: boolean;
  isSpecial?: 'profile-photo' | 'location' | 'category' | 'subcategory' | 'operating-hours' | 'multi-field';
  fields?: Array<{
    id: string;
    label: string;
    placeholder: string;
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    setValue: (value: string) => void;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    maxLength?: number;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  }>;
}

export default function CompleteProfileScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fadeAnim = useState(new Animated.Value(1))[0];
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Keyboard visibility listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Form state
  const [profilePhoto, setProfilePhoto] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [category, setCategory] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [operatingHours, setOperatingHours] = useState('9 AM - 9 PM');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);

  const steps: Step[] = [
    // Step 1: Profile Photo
    {
      id: 'profilePhoto',
      title: 'Add your business logo',
      subtitle: 'Upload a profile photo or logo (optional)',
      icon: 'camera',
      placeholder: '',
      value: profilePhoto,
      setValue: setProfilePhoto,
      isSpecial: 'profile-photo',
    },
    // Step 2: Location - Multi-field (City, State, Pincode)
    {
      id: 'location',
      title: 'Where is your business?',
      subtitle: 'Add your location details',
      icon: 'location',
      placeholder: '',
      value: address,
      setValue: setAddress,
      isSpecial: 'multi-field',
      fields: [
        {
          id: 'city',
          label: 'City',
          placeholder: 'e.g., Mumbai',
          icon: 'business',
          value: city,
          setValue: setCity,
        },
        {
          id: 'state',
          label: 'State',
          placeholder: 'e.g., Maharashtra',
          icon: 'map',
          value: state,
          setValue: setState,
        },
        {
          id: 'pincode',
          label: 'Pincode',
          placeholder: '6-digit pincode',
          icon: 'pin',
          value: pincode,
          setValue: setPincode,
          keyboardType: 'numeric',
          maxLength: 6,
        },
      ],
    },
    // Step 3: Contact Info - Multi-field (Email, Address)
    {
      id: 'contact',
      title: 'Contact Information',
      subtitle: 'How can customers reach you?',
      icon: 'mail',
      placeholder: '',
      value: email,
      setValue: setEmail,
      isSpecial: 'multi-field',
      fields: [
        {
          id: 'email',
          label: 'Email',
          placeholder: 'your.email@example.com',
          icon: 'mail',
          value: email,
          setValue: setEmail,
          keyboardType: 'email-address',
          autoCapitalize: 'none',
        },
        {
          id: 'address',
          label: 'Full Address',
          placeholder: 'Enter your business address',
          icon: 'home',
          value: address,
          setValue: setAddress,
        },
      ],
    },
    // Step 4: Category
    {
      id: 'category',
      title: 'Business category?',
      subtitle: 'What type of business do you run?',
      icon: 'grid',
      placeholder: 'Select category',
      value: category,
      setValue: setCategory,
      isSpecial: 'category',
    },
    // Step 5: Subcategory
    {
      id: 'subcategory',
      title: 'Business subcategory?',
      subtitle: 'More specific type of business',
      icon: 'apps',
      placeholder: 'Select subcategory',
      value: subcategory,
      setValue: setSubcategory,
      isSpecial: 'subcategory',
    },
    // Step 6: Operating Hours
    {
      id: 'operatingHours',
      title: 'Operating hours?',
      subtitle: 'When is your business open?',
      icon: 'time',
      placeholder: 'e.g., 9 AM - 9 PM',
      value: operatingHours,
      setValue: setOperatingHours,
    },
    // Step 7: GST Number
    {
      id: 'gst',
      title: 'GST Number',
      subtitle: 'If you have GST registration (optional)',
      icon: 'document-text',
      placeholder: 'Enter GST number',
      value: gstNumber,
      setValue: setGstNumber,
      autoCapitalize: 'characters',
    },
    // Step 8: Description
    {
      id: 'description',
      title: 'About your business',
      subtitle: 'Brief description (optional)',
      icon: 'text',
      placeholder: 'What does your business do?',
      value: description,
      setValue: setDescription,
      multiline: true,
    },
  ];

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleProfilePhotoPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleLocationPick = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant location permissions');
        return;
      }

      setLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode[0]) {
        const loc = reverseGeocode[0];
        const fullAddress = `${loc.street || ''} ${loc.name || ''}, ${loc.city || ''}, ${loc.region || ''} ${loc.postalCode || ''}`.trim();
        setAddress(fullAddress);
        if (loc.city) setCity(loc.city);
        if (loc.region) setState(loc.region);
        if (loc.postalCode) setPincode(loc.postalCode);
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    setError('');

    // Animate transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Final step - save all data
      await handleComplete();
    }
  };

  const handleSkip = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      navigation.goBack();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      // Upload profile photo if selected
      let photoUrl = null;
      if (profilePhoto) {
        const photoResponse = await ApiService.uploadProfilePhoto(profilePhoto);
        photoUrl = photoResponse.photo_url;
      }

      // Update profile with all collected data
      await ApiService.updateProfile({
        email: email || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        pincode: pincode || undefined,
        category: category || undefined,
        subcategory: subcategory || undefined,
        business_type: businessType || undefined,
        gst_number: gstNumber || undefined,
        description: description || undefined,
        website: website || undefined,
        facebook: facebook || undefined,
        instagram: instagram || undefined,
        operating_hours: operatingHours || undefined,
        profile_photo_url: photoUrl || undefined,
      });

      Alert.alert(
        'Success!',
        'Your profile has been updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryModal = () => (
    <Modal visible={showCategoryModal} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: Colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: Colors.textPrimary }]}>Select Category</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {BUSINESS_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.name}
                style={[styles.categoryOption, { borderBottomColor: Colors.borderLight }]}
                onPress={() => {
                  setCategory(cat.name);
                  setSubcategory(''); // Reset subcategory when category changes
                  setShowCategoryModal(false);
                }}
              >
                <Text style={[styles.categoryOptionText, { color: Colors.textPrimary }]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderSubcategoryModal = () => {
    const selectedCategory = BUSINESS_CATEGORIES.find(cat => cat.name === category);
    if (!selectedCategory) return null;

    return (
      <Modal visible={showSubcategoryModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: Colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors.textPrimary }]}>Select Subcategory</Text>
              <TouchableOpacity onPress={() => setShowSubcategoryModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {selectedCategory.subcategories.map((subcat) => (
                <TouchableOpacity
                  key={subcat}
                  style={[styles.categoryOption, { borderBottomColor: Colors.borderLight }]}
                  onPress={() => {
                    setSubcategory(subcat);
                    setShowSubcategoryModal(false);
                  }}
                >
                  <Text style={[styles.categoryOptionText, { color: Colors.textPrimary }]}>
                    {subcat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderStepContent = () => {
    if (currentStep.isSpecial === 'profile-photo') {
      return (
        <View style={styles.photoContainer}>
          <TouchableOpacity
            style={[styles.photoPlaceholder, { backgroundColor: Colors.backgroundSecondary }]}
            onPress={handleProfilePhotoPick}
          >
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.photoImage} />
            ) : (
              <>
                <Ionicons name="camera" size={48} color={Colors.textTertiary} />
                <Text style={[styles.photoPlaceholderText, { color: Colors.textSecondary }]}>
                  Tap to upload photo
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    if (currentStep.isSpecial === 'multi-field' && currentStep.fields) {
      return (
        <View style={styles.multiFieldContainer}>
          {currentStep.fields.map((field) => (
            <View key={field.id} style={styles.fieldWrapper}>
              <Text style={[styles.fieldLabel, { color: Colors.textPrimary }]}>{field.label}</Text>
              <View style={[styles.inputContainer, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}>
                <Ionicons name={field.icon} size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder={field.placeholder}
                  placeholderTextColor={Colors.textTertiary}
                  value={field.value}
                  onChangeText={field.setValue}
                  keyboardType={field.keyboardType || 'default'}
                  maxLength={field.maxLength}
                  autoCapitalize={field.autoCapitalize || 'sentences'}
                />
              </View>
            </View>
          ))}
          {currentStep.id === 'location' && (
            <TouchableOpacity
              style={[styles.locationButton, { backgroundColor: Colors.primary }]}
              onPress={handleLocationPick}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="navigate" size={20} color="#fff" />
                  <Text style={styles.locationButtonText}>Get Current Location</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (currentStep.isSpecial === 'category') {
      return (
        <TouchableOpacity
          style={[styles.selectButton, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
          onPress={() => setShowCategoryModal(true)}
        >
          <Ionicons name={currentStep.icon} size={20} color={Colors.textTertiary} style={styles.inputIcon} />
          <Text style={[styles.selectButtonText, { color: category ? Colors.textPrimary : Colors.textTertiary }]}>
            {category || currentStep.placeholder}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
        </TouchableOpacity>
      );
    }

    if (currentStep.isSpecial === 'subcategory') {
      if (!category) {
        return (
          <View style={[styles.warningBox, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb' }]}>
            <Ionicons name="warning" size={20} color="#f59e0b" />
            <Text style={[styles.warningText, { color: isDark ? '#fbbf24' : '#d97706' }]}>
              Please select a category first
            </Text>
          </View>
        );
      }

      return (
        <TouchableOpacity
          style={[styles.selectButton, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}
          onPress={() => setShowSubcategoryModal(true)}
        >
          <Ionicons name={currentStep.icon} size={20} color={Colors.textTertiary} style={styles.inputIcon} />
          <Text style={[styles.selectButtonText, { color: subcategory ? Colors.textPrimary : Colors.textTertiary }]}>
            {subcategory || currentStep.placeholder}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.inputContainer, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}>
        <Ionicons name={currentStep.icon} size={20} color={Colors.textTertiary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: Colors.textPrimary }]}
          placeholder={currentStep.placeholder}
          placeholderTextColor={Colors.textTertiary}
          value={currentStep.value}
          onChangeText={currentStep.setValue}
          keyboardType={currentStep.keyboardType || 'default'}
          maxLength={currentStep.maxLength}
          autoCapitalize={currentStep.autoCapitalize || 'sentences'}
          multiline={currentStep.multiline}
          numberOfLines={currentStep.multiline ? 4 : 1}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.headerProgress}>
            <Text style={[styles.stepText, { color: Colors.textSecondary }]}>
              Step {currentStepIndex + 1} of {steps.length}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: Colors.primary }]} />
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Icon */}
            <View style={[styles.iconWrapper, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.2)' : '#e8f5f3' }]}>
              <Ionicons name={currentStep.icon} size={40} color="#5a9a8e" />
            </View>

            {/* Title & Subtitle */}
            <Text style={[styles.title, { color: Colors.textPrimary }]}>{currentStep.title}</Text>
            <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>{currentStep.subtitle}</Text>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Step Content */}
            {renderStepContent()}
          </Animated.View>
        </ScrollView>

        {/* Action Buttons */}
        {!keyboardVisible && (
          <View style={[styles.footer, { backgroundColor: Colors.background }]}>
            <TouchableOpacity
              style={[styles.skipButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
              onPress={handleSkip}
            >
              <Text style={[styles.skipButtonText, { color: Colors.textSecondary }]}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: Colors.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.nextButtonText}>
                    {currentStepIndex === steps.length - 1 ? 'Complete' : 'Next'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {renderCategoryModal()}
        {renderSubcategoryModal()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space2,
    paddingBottom: Spacing.space3,
    gap: Spacing.space3,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerProgress: {
    flex: 1,
  },
  stepText: {
    fontSize: 13,
    marginBottom: Spacing.space2,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: Spacing.space6,
    paddingBottom: Spacing.space6,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: Spacing.space4,
    marginBottom: Spacing.space4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.space2,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: Spacing.space6,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: Spacing.space3,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.space4,
    gap: Spacing.space2,
  },
  errorText: {
    flex: 1,
    color: '#ef4444',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.space3,
    minHeight: 54,
  },
  inputIcon: {
    marginRight: Spacing.space2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Spacing.space3,
  },
  multiFieldContainer: {
    gap: Spacing.space4,
  },
  fieldWrapper: {
    gap: Spacing.space2,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.space3,
    borderRadius: BorderRadius.lg,
    gap: Spacing.space2,
    marginTop: Spacing.space2,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.space3,
    height: 54,
  },
  selectButtonText: {
    flex: 1,
    fontSize: 15,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholderText: {
    marginTop: Spacing.space2,
    fontSize: 14,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.space4,
    borderRadius: BorderRadius.lg,
    gap: Spacing.space2,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space4,
    gap: Spacing.space3,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  skipButton: {
    flex: 1,
    paddingVertical: Spacing.space4,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.space4,
    borderRadius: BorderRadius.lg,
    gap: Spacing.space2,
    ...Shadows.md,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '70%',
    paddingBottom: Spacing.space4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  categoryOption: {
    paddingVertical: Spacing.space4,
    paddingHorizontal: Spacing.space4,
    borderBottomWidth: 1,
  },
  categoryOptionText: {
    fontSize: 16,
  },
});
