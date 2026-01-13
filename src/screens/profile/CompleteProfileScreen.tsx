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
import Illustration from '../../components/Illustration';
import MapComponent from '../../components/MapComponent';

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
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [tempLatitude, setTempLatitude] = useState(0);
  const [tempLongitude, setTempLongitude] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load existing profile data and calculate starting step
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await ApiService.getProfile();
        if (data.business) {
          const profile = data.business;
          
          // Set existing values
          if (profile.profile_photo_url) setProfilePhoto(profile.profile_photo_url);
          if (profile.email) setEmail(profile.email);
          if (profile.address) setAddress(profile.address);
          if (profile.city) setCity(profile.city);
          if (profile.state) setState(profile.state);
          if (profile.pincode) setPincode(profile.pincode);
          if (profile.category) setCategory(profile.category);
          if (profile.business_type) setBusinessType(profile.business_type);
          if (profile.gst_number) setGstNumber(profile.gst_number);
          if (profile.description) setDescription(profile.description);
          if (profile.website) setWebsite(profile.website);
          if (profile.facebook) setFacebook(profile.facebook);
          if (profile.instagram) setInstagram(profile.instagram);
          if (profile.subcategory) setSubcategory(profile.subcategory);
          if (profile.operating_hours) setOperatingHours(profile.operating_hours);
          
          // Calculate starting step - find first incomplete step
          let startStep = 0;
          if (profile.profile_photo_url) startStep = 1;
          if (profile.city && profile.state && profile.pincode) startStep = 2;
          if (profile.email && profile.address) startStep = 3;
          if (profile.category) startStep = 4;
          if (profile.subcategory) startStep = 5;
          if (profile.operating_hours && profile.operating_hours !== '9 AM - 9 PM') startStep = 6;
          if (profile.gst_number) startStep = 7;
          if (profile.description) startStep = 8;
          
          // If profile is complete (startStep >= 8), show last step
          // Otherwise use the calculated startStep (max 7 since array has 8 items with indices 0-7)
          const safeStartStep = Math.min(startStep, 7);
          setCurrentStepIndex(safeStartStep);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    loadProfile();
  }, []);

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

  // Safety check - if currentStep is undefined, reset to first step
  useEffect(() => {
    if (!currentStep && !initialLoading) {
      setCurrentStepIndex(0);
    }
  }, [currentStep, initialLoading]);

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

  const handleMapPick = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant location permissions');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setTempLatitude(location.coords.latitude);
      setTempLongitude(location.coords.longitude);
      setShowMapPicker(true);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const handleMapLocationConfirm = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (reverseGeocode[0]) {
        const loc = reverseGeocode[0];
        const fullAddress = `${loc.street || ''} ${loc.name || ''}, ${loc.city || ''}, ${loc.region || ''} ${loc.postalCode || ''}`.trim();
        setAddress(fullAddress);
        if (loc.city) setCity(loc.city);
        if (loc.region) setState(loc.region);
        if (loc.postalCode) setPincode(loc.postalCode);
      }
      setShowMapPicker(false);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get address from location');
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

      // Update profile with all collected data (filter out empty values)
      const profileData: any = {};
      if (email) profileData.email = email;
      if (address) profileData.address = address;
      if (city) profileData.city = city;
      if (state) profileData.state = state;
      if (pincode) profileData.pincode = pincode;
      if (category) profileData.category = category;
      if (subcategory) profileData.subcategory = subcategory;
      if (businessType) profileData.business_type = businessType;
      if (gstNumber) profileData.gst_number = gstNumber;
      if (description) profileData.description = description;
      if (website) profileData.website = website;
      if (facebook) profileData.facebook = facebook;
      if (instagram) profileData.instagram = instagram;
      if (operatingHours && operatingHours !== '9 AM - 9 PM') profileData.operating_hours = operatingHours;
      if (photoUrl) profileData.profile_photo_url = photoUrl;

      await ApiService.updateProfile(profileData);

      Alert.alert(
        '🎉 Profile Complete!',
        'Your business profile is now complete. Customers can now find and connect with you easily!',
        [
          { 
            text: 'View Profile', 
            onPress: () => {
              navigation.goBack();
              setTimeout(() => navigation.navigate('Profile'), 100);
            }
          },
          { 
            text: 'Done', 
            onPress: () => navigation.goBack(),
            style: 'cancel'
          }
        ]
      );
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderMapPickerModal = () => (
    <Modal
      visible={showMapPicker}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setShowMapPicker(false)}
    >
      <SafeAreaView style={[styles.mapModalContainer, { backgroundColor: Colors.background }]} edges={['top']}>
        <View style={[styles.mapModalHeader, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
          <TouchableOpacity onPress={() => setShowMapPicker(false)} style={styles.mapModalCloseButton}>
            <Ionicons name="close" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.mapModalTitle, { color: Colors.textPrimary }]}>Select Location</Text>
          <TouchableOpacity
            onPress={() => handleMapLocationConfirm(tempLatitude, tempLongitude)}
            style={[styles.mapModalDoneButton, { backgroundColor: Colors.primary }]}
          >
            <Text style={styles.mapModalDoneText}>Confirm</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <MapComponent
            latitude={tempLatitude}
            longitude={tempLongitude}
            editable={true}
            onLocationChange={(lat, lng) => {
              setTempLatitude(lat);
              setTempLongitude(lng);
            }}
            style={{ flex: 1 }}
          />
        </View>
        <View style={[styles.mapHint, { backgroundColor: Colors.card }]}>
          <Ionicons name="information-circle" size={20} color={Colors.primary} />
          <Text style={[styles.mapHintText, { color: Colors.textSecondary }]}>Tap on the map to select your business location</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );

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
    // Safety check
    if (!currentStep) return null;
    
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
                <Illustration name="profileSetup" size={100} />
                <Text style={[styles.photoPlaceholderText, { color: Colors.textSecondary }]}>
                  Tap to upload logo
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <View style={[styles.tipCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4' }]}>
            <Ionicons name="bulb" size={16} color="#10b981" />
            <Text style={[styles.tipText, { color: isDark ? '#6ee7b7' : '#059669' }]}>
              A clear logo helps customers recognize your business
            </Text>
          </View>
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
            <>
              <View style={styles.locationActionsRow}>
                <TouchableOpacity
                  style={[styles.locationButton, { backgroundColor: Colors.primary, flex: 1 }]}
                  onPress={handleLocationPick}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="navigate" size={20} color="#fff" />
                      <Text style={styles.locationButtonText}>Use Current</Text>
                    </>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.locationButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', flex: 1, borderWidth: 1, borderColor: Colors.borderLight }]}
                  onPress={handleMapPick}
                >
                  <Ionicons name="map" size={20} color={Colors.primary} />
                  <Text style={[styles.locationButtonText, { color: Colors.primary }]}>Pick on Map</Text>
                </TouchableOpacity>
              </View>
              
              <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : '#eef2ff' }]}>
                <Ionicons name="information-circle" size={16} color="#6366f1" />
                <Text style={[styles.infoBoxText, { color: isDark ? '#c7d2fe' : '#6366f1' }]}>Your location helps customers find you easily</Text>
              </View>
            </>
          )}
        </View>
      );
    }

    if (currentStep.isSpecial === 'category') {
      return (
        <View>
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
          
          <View style={[styles.tipCard, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : '#eef2ff', marginTop: Spacing.space3 }]}>
            <Ionicons name="information-circle" size={16} color="#6366f1" />
            <Text style={[styles.tipText, { color: isDark ? '#c7d2fe' : '#6366f1' }]}>
              Choose the category that best describes your business
            </Text>
          </View>
        </View>
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

  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]} edges={['top']}>
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Safety check - if currentStep is undefined, show error
  if (!currentStep) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]} edges={['top']}>
        <View style={[styles.container, styles.center]}>
          <Ionicons name="alert-circle" size={48} color={Colors.textTertiary} />
          <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>Error loading profile steps</Text>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: Colors.primary, marginTop: Spacing.space4, paddingHorizontal: Spacing.space6 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.nextButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
            <View style={styles.stepIndicatorRow}>
              <Text style={[styles.stepText, { color: Colors.textSecondary }]}>
                Step {currentStepIndex + 1} of {steps.length}
              </Text>
              <Text style={[styles.progressPercent, { color: Colors.primary }]}>
                {Math.round(progress)}%
              </Text>
            </View>
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

        {renderMapPickerModal()}
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.space3,
    fontSize: 14,
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
  stepIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.space2,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
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
  locationActionsRow: {
    flexDirection: 'row',
    gap: Spacing.space2,
    marginTop: Spacing.space2,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.space3,
    borderRadius: BorderRadius.lg,
    gap: Spacing.space2,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.space3,
    borderRadius: BorderRadius.md,
    gap: Spacing.space2,
    marginTop: Spacing.space3,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
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
    borderWidth: 3,
    borderColor: '#5a9a8e20',
    borderStyle: 'dashed',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholderText: {
    marginTop: Spacing.space2,
    fontSize: 13,
    fontWeight: '500',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.space3,
    borderRadius: BorderRadius.md,
    gap: Spacing.space2,
    marginTop: Spacing.space4,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
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
  mapModalContainer: {
    flex: 1,
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.space4,
    borderBottomWidth: 1,
  },
  mapModalCloseButton: {
    padding: Spacing.space2,
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  mapModalDoneButton: {
    paddingHorizontal: Spacing.space5,
    paddingVertical: Spacing.space2,
    borderRadius: 8,
  },
  mapModalDoneText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  mapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.space4,
    gap: Spacing.space2,
  },
  mapHintText: {
    flex: 1,
    fontSize: 14,
  },
});
