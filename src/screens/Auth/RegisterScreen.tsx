/**
 * Register Screen - Multi-Step Registration
 * Step-by-step business registration with Next/Skip options
 */

import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { AvatarSizes } from '../../constants/scales';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

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
  secureTextEntry?: boolean;
  validation?: (value: string) => string | null;
  required?: boolean;
  isSpecial?: 'profile-photo' | 'location';
}

export default function RegisterScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fadeAnim = useState(new Animated.Value(1))[0];
  const [registered, setRegistered] = useState(false);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
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

  const steps: Step[] = [
    {
      id: 'businessName',
      title: 'What\'s your business name?',
      subtitle: 'Enter your business or shop name',
      icon: 'storefront',
      placeholder: 'Enter business name',
      value: businessName,
      setValue: setBusinessName,
      required: true,
    },
    {
      id: 'phoneNumber',
      title: 'Your mobile number?',
      subtitle: 'We\'ll use this for login',
      icon: 'call',
      placeholder: 'Enter 10-digit mobile number',
      value: phoneNumber,
      setValue: setPhoneNumber,
      maxLength: 10,
      validation: (value) => {
        if (value.length !== 10) return 'Phone number must be 10 digits';
        return null;
      },
      required: true,
    },
    {
      id: 'password',
      title: 'Create a password',
      subtitle: 'Keep it secure and memorable',
      icon: 'lock-closed',
      placeholder: 'Create password',
      value: password,
      setValue: setPassword,
      autoCapitalize: 'none',
      secureTextEntry: true,
      validation: (value) => {
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      },
      required: true,
    },
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
    {
      id: 'location',
      title: 'Where is your business?',
      subtitle: 'Get your current location automatically',
      icon: 'location',
      placeholder: '',
      value: address,
      setValue: setAddress,
      isSpecial: 'location',
    },
    {
      id: 'email',
      title: 'What\'s your email?',
      subtitle: 'We\'ll send important updates',
      icon: 'mail',
      placeholder: 'your.email@example.com',
      value: email,
      setValue: setEmail,
      autoCapitalize: 'none',
      validation: (value) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email';
        }
        return null;
      },
    },
    {
      id: 'address',
      title: 'Business address',
      subtitle: 'Full address of your business',
      icon: 'home',
      placeholder: 'Enter full address',
      value: address,
      setValue: setAddress,
    },
    {
      id: 'city',
      title: 'Which city?',
      subtitle: 'Your business location',
      icon: 'business',
      placeholder: 'e.g., Mumbai',
      value: city,
      setValue: setCity,
    },
    {
      id: 'state',
      title: 'Which state?',
      subtitle: 'State where your business operates',
      icon: 'map',
      placeholder: 'e.g., Maharashtra',
      value: state,
      setValue: setState,
    },
    {
      id: 'pincode',
      title: 'What\'s your pincode?',
      subtitle: 'Area pin code',
      icon: 'pin',
      placeholder: 'Enter 6-digit pincode',
      value: pincode,
      setValue: setPincode,
      maxLength: 6,
      validation: (value) => {
        if (value && value.length !== 6) return 'Pincode must be 6 digits';
        return null;
      },
    },
    {
      id: 'category',
      title: 'Business category?',
      subtitle: 'What type of business do you run?',
      icon: 'grid',
      placeholder: 'e.g., Retail, Restaurant',
      value: category,
      setValue: setCategory,
    },
    {
      id: 'businessType',
      title: 'Business type?',
      subtitle: 'Legal structure of your business',
      icon: 'briefcase',
      placeholder: 'e.g., Sole Proprietor',
      value: businessType,
      setValue: setBusinessType,
    },
    {
      id: 'gst',
      title: 'GST Number',
      subtitle: 'If you have GST registration',
      icon: 'document-text',
      placeholder: 'Enter GST number',
      value: gstNumber,
      setValue: setGstNumber,
      autoCapitalize: 'characters',
    },
    {
      id: 'description',
      title: 'About your business',
      subtitle: 'Brief description',
      icon: 'text',
      placeholder: 'What does your business do?',
      value: description,
      setValue: setDescription,
      multiline: true,
    },
    {
      id: 'website',
      title: 'Website URL',
      subtitle: 'Your business website (optional)',
      icon: 'globe',
      placeholder: 'https://yourbusiness.com',
      value: website,
      setValue: setWebsite,
      keyboardType: 'url',
      autoCapitalize: 'none',
    },
    {
      id: 'facebook',
      title: 'Facebook profile',
      subtitle: 'Your business Facebook page',
      icon: 'logo-facebook',
      placeholder: 'Facebook URL',
      value: facebook,
      setValue: setFacebook,
      keyboardType: 'url',
      autoCapitalize: 'none',
    },
    {
      id: 'instagram',
      title: 'Instagram profile',
      subtitle: 'Your business Instagram page',
      icon: 'logo-instagram',
      placeholder: 'Instagram URL',
      value: instagram,
      setValue: setInstagram,
      keyboardType: 'url',
      autoCapitalize: 'none',
    },
  ];

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Direct setter mapping to avoid closure issues
  const getSetterForStep = (stepId: string) => {
    const setterMap: { [key: string]: (value: string) => void } = {
      businessName: setBusinessName,
      phoneNumber: setPhoneNumber,
      password: setPassword,
      profilePhoto: setProfilePhoto,
      location: setAddress,
      email: setEmail,
      address: setAddress,
      city: setCity,
      state: setState,
      pincode: setPincode,
      category: setCategory,
      businessType: setBusinessType,
      gst: setGstNumber,
      description: setDescription,
      website: setWebsite,
      facebook: setFacebook,
      instagram: setInstagram,
    };
    return setterMap[stepId] || (() => {});
  };

  const handleProfilePhotoPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

    // Validate required fields
    if (currentStep.required && !currentStep.value) {
      setError(`${currentStep.title.replace('?', '')} is required`);
      return;
    }

    // Run validation if exists
    if (currentStep.validation) {
      const validationError = currentStep.validation(currentStep.value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // If we're on the last required step (password), register the user
    if (currentStep.id === 'password' && !registered) {
      await handleRegister();
      return;
    }

    // Move to next step
    if (currentStepIndex < steps.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStepIndex(currentStepIndex + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Finished - update profile with remaining details
      await handleUpdateProfile();
    }
  };

  const handleSkip = () => {
    setError('');
    if (currentStepIndex < steps.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStepIndex(currentStepIndex + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Finished - go to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStepIndex > 0) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStepIndex(currentStepIndex - 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      await ApiService.register(businessName, phoneNumber, password);
      setRegistered(true);
      // Move to next step automatically
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const updateData: any = {};
      if (email) updateData.email = email;
      if (address) updateData.address = address;
      if (city) updateData.city = city;
      if (state) updateData.state = state;
      if (pincode) updateData.pincode = pincode;
      if (category) updateData.category = category;
      if (businessType) updateData.business_type = businessType;
      if (gstNumber) updateData.gst_number = gstNumber;
      if (description) updateData.description = description;
      if (website) updateData.website = website;
      if (facebook) updateData.facebook = facebook;
      if (instagram) updateData.instagram = instagram;

      if (Object.keys(updateData).length > 0) {
        await ApiService.updateProfile(updateData);
      }

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (err: any) {
      console.error('Update profile error:', err);
      // Even if update fails, navigate to app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: Colors.borderLight }]}>
          <View style={styles.headerTop}>
            {currentStepIndex > 0 && !loading && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginLink, { color: Colors.primary }]}>
                {currentStepIndex === 0 ? 'Login' : ''}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Progress Bar */}
          <View style={[styles.progressBar, { backgroundColor: Colors.borderLight }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: Colors.primary, width: `${progress}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: Colors.textTertiary }]}>
            Step {currentStepIndex + 1} of {steps.length}
          </Text>
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Logo - Only on first step */}
          {currentStepIndex === 0 && (
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logo}
              />
              <Text style={[styles.appName, { color: Colors.primary }]}>Ekthaa</Text>
            </View>
          )}

          {/* Step Card */}
          <View style={[styles.stepCard, { backgroundColor: Colors.card }]}>
            <Ionicons name={currentStep.icon} size={48} color={Colors.primary} />
            <Text style={[styles.stepTitle, { color: Colors.textPrimary }]}>
              {currentStep.title}
            </Text>
            <Text style={[styles.stepSubtitle, { color: Colors.textSecondary }]}>
              {currentStep.subtitle}
            </Text>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={Colors.creditRed} />
                <Text style={[styles.errorText, { color: Colors.creditRed }]}>{error}</Text>
              </View>
            ) : null}

            {/* Special Input: Profile Photo */}
            {currentStep.isSpecial === 'profile-photo' ? (
              <View style={styles.specialInputContainer}>
                <TouchableOpacity
                  style={[styles.photoButton, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}
                  onPress={handleProfilePhotoPick}
                >
                  {profilePhoto ? (
                    <Image source={{ uri: profilePhoto }} style={styles.profilePhotoPreview} />
                  ) : (
                    <>
                      <Ionicons name="camera" size={32} color={Colors.textTertiary} />
                      <Text style={[styles.photoButtonText, { color: Colors.textSecondary }]}>
                        Tap to upload photo
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : currentStep.isSpecial === 'location' ? (
              /* Special Input: Location */
              <View style={styles.specialInputContainer}>
                <TouchableOpacity
                  style={[styles.locationButton, { backgroundColor: Colors.primary }]}
                  onPress={handleLocationPick}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Ionicons name="location" size={24} color={Colors.white} />
                      <Text style={[styles.locationButtonText, { color: Colors.white }]}>
                        Get Current Location
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                {address ? (
                  <Text style={[styles.locationPreview, { color: Colors.textSecondary }]}>
                    {address}
                  </Text>
                ) : null}
              </View>
            ) : (
              /* Regular Text Input */
              <View style={[styles.inputWrapper, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <TextInput
                  key={`input-${currentStep.id}`}
                  style={[
                    styles.input,
                    { color: Colors.textPrimary },
                    currentStep.multiline && styles.textArea,
                  ]}
                  placeholder={currentStep.placeholder}
                  placeholderTextColor={Colors.textTertiary}
                  value={currentStep.value}
                  onChangeText={(text) => {
                    console.log('TextInput onChange:', currentStep.id, text);
                    const setter = getSetterForStep(currentStep.id);
                    setter(text);
                  }}
                  keyboardType={currentStep.keyboardType || 'default'}
                  maxLength={currentStep.maxLength}
                  autoCapitalize={currentStep.autoCapitalize || 'sentences'}
                  secureTextEntry={currentStep.secureTextEntry || false}
                  textContentType={currentStep.secureTextEntry ? 'password' : undefined}
                  multiline={currentStep.multiline || false}
                  numberOfLines={currentStep.multiline ? 3 : 1}
                  editable={true}
                />
              </View>
            )}
          </View>
        </Animated.View>

        {/* Footer Buttons */}
        <View style={[styles.footer, { borderTopColor: Colors.borderLight }]}>
          <TouchableOpacity
            style={[styles.skipButton, { backgroundColor: Colors.backgroundSecondary }]}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={[styles.skipButtonText, { color: Colors.textSecondary }]}>
              {currentStepIndex === steps.length - 1 ? 'Finish' : 'Skip'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: Colors.primary }]}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Text style={[styles.nextButtonText, { color: Colors.white }]}>
                  {currentStep.id === 'password' && !registered
                    ? 'Register'
                    : currentStepIndex === steps.length - 1
                    ? 'Complete'
                    : 'Next'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
              </>
            )}
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space3,
    paddingBottom: Spacing.space4,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.space3,
  },
  backButton: {
    padding: Spacing.space2,
  },
  loginLink: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.space2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: Typography.fontXs,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.space4,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.space6,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: Typography.fontXl,
    fontWeight: Typography.bold,
    marginTop: Spacing.space2,
  },
  stepCard: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.space6,
    alignItems: 'center',
    ...Shadows.md,
  },
  stepTitle: {
    fontSize: Typography.fontXl,
    fontWeight: Typography.bold,
    marginTop: Spacing.space4,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: Typography.fontBase,
    marginTop: Spacing.space2,
    marginBottom: Spacing.space5,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.space3,
  },
  errorText: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
  },
  inputWrapper: {
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space4,
  },
  input: {
    fontSize: Typography.fontBase,
    paddingVertical: 0,
    minHeight: 24,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  specialInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  photoButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profilePhotoPreview: {
    width: '100%',
    height: '100%',
  },
  photoButtonText: {
    fontSize: Typography.fontSm,
    marginTop: Spacing.space2,
    textAlign: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: Spacing.space4,
    paddingHorizontal: Spacing.space6,
    borderRadius: BorderRadius.md,
  },
  locationButtonText: {
    fontSize: Typography.fontBase,
    fontWeight: Typography.semiBold,
  },
  locationPreview: {
    fontSize: Typography.fontSm,
    marginTop: Spacing.space3,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.space4,
    gap: Spacing.space3,
    borderTopWidth: 1,
  },
  skipButton: {
    flex: 1,
    paddingVertical: Spacing.space4,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: Typography.fontBase,
    fontWeight: Typography.semiBold,
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.space4,
    borderRadius: BorderRadius.md,
  },
  nextButtonText: {
    fontSize: Typography.fontBase,
    fontWeight: Typography.bold,
  },
});
