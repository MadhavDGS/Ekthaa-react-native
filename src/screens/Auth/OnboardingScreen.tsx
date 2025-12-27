/**
 * Onboarding Screen
 * Step-by-step business profile completion after registration
 * Each field appears one at a time with Next/Skip options
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
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { IconSizes } from '../../constants/scales';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

interface OnboardingStep {
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
}

export default function OnboardingScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fadeAnim = useState(new Animated.Value(1))[0];

  // Form state
  const [email, setEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [category, setCategory] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');

  const steps: OnboardingStep[] = [
    {
      id: 'email',
      title: 'What\'s your email?',
      subtitle: 'We\'ll send you important updates',
      icon: 'mail',
      placeholder: 'your.email@example.com',
      value: email,
      setValue: setEmail,
      keyboardType: 'email-address',
      autoCapitalize: 'none',
      validation: (value) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return null;
      },
    },
    {
      id: 'address',
      title: 'Where is your business?',
      subtitle: 'Help customers find you easily',
      icon: 'location',
      placeholder: 'Enter your business address',
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
      title: 'What\'s your PIN code?',
      subtitle: 'Help us locate you better',
      icon: 'pin',
      placeholder: '6-digit PIN code',
      value: pincode,
      setValue: setPincode,
      keyboardType: 'numeric',
      maxLength: 6,
      validation: (value) => {
        if (value && (value.length !== 6 || !/^\d+$/.test(value))) {
          return 'PIN code must be exactly 6 digits';
        }
        return null;
      },
    },
    {
      id: 'category',
      title: 'What\'s your business category?',
      subtitle: 'e.g., Retail, Service, Manufacturing',
      icon: 'albums',
      placeholder: 'Enter category',
      value: category,
      setValue: setCategory,
    },
    {
      id: 'businessType',
      title: 'What type of business?',
      subtitle: 'e.g., Shop, Restaurant, Salon',
      icon: 'briefcase',
      placeholder: 'Enter business type',
      value: businessType,
      setValue: setBusinessType,
    },
    {
      id: 'gstNumber',
      title: 'Do you have GST number?',
      subtitle: 'Optional - 15 characters',
      icon: 'document-text',
      placeholder: 'GST Number (optional)',
      value: gstNumber,
      setValue: setGstNumber,
      autoCapitalize: 'characters',
      maxLength: 15,
      validation: (value) => {
        if (value && value.length > 0) {
          if (value.length !== 15) {
            return 'GST number must be 15 characters';
          }
          const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
          if (!gstRegex.test(value.toUpperCase())) {
            return 'Invalid GST number format';
          }
        }
        return null;
      },
    },
    {
      id: 'description',
      title: 'Tell us about your business',
      subtitle: 'A brief description of what you do',
      icon: 'create',
      placeholder: 'Describe your business...',
      value: description,
      setValue: setDescription,
      multiline: true,
    },
    {
      id: 'website',
      title: 'Do you have a website?',
      subtitle: 'Your online presence',
      icon: 'globe',
      placeholder: 'https://yourwebsite.com',
      value: website,
      setValue: setWebsite,
      keyboardType: 'url',
      autoCapitalize: 'none',
    },
    {
      id: 'facebook',
      title: 'Facebook page link?',
      subtitle: 'Optional',
      icon: 'logo-facebook',
      placeholder: 'facebook.com/yourpage',
      value: facebook,
      setValue: setFacebook,
      autoCapitalize: 'none',
    },
    {
      id: 'instagram',
      title: 'Instagram handle?',
      subtitle: 'Optional',
      icon: 'logo-instagram',
      placeholder: '@yourbusiness',
      value: instagram,
      setValue: setInstagram,
      autoCapitalize: 'none',
    },
  ];

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    setError('');
    
    // Validate current step if validation function exists
    if (currentStep.validation) {
      const validationError = currentStep.validation(currentStep.value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // If last step, save and complete
    if (currentStepIndex === steps.length - 1) {
      handleComplete();
      return;
    }

    // Animate to next step
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentStepIndex(currentStepIndex + 1);
  };

  const handleSkip = () => {
    setError('');
    
    // If last step, complete without saving current field
    if (currentStepIndex === steps.length - 1) {
      handleComplete();
      return;
    }

    // Animate to next step
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentStepIndex(currentStepIndex + 1);
  };

  const handleBack = () => {
    setError('');
    if (currentStepIndex > 0) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      setError('');

      const updateData: any = {};

      // Only send non-empty fields
      if (email.trim()) updateData.email = email.trim();
      if (gstNumber.trim()) updateData.gst_number = gstNumber.trim().toUpperCase();
      if (description.trim()) updateData.description = description.trim();
      if (address.trim()) updateData.address = address.trim();
      if (city.trim()) updateData.city = city.trim();
      if (state.trim()) updateData.state = state.trim();
      if (pincode.trim()) updateData.pincode = pincode.trim();
      if (category.trim()) updateData.category = category.trim();
      if (businessType.trim()) updateData.business_type = businessType.trim();
      if (website.trim()) updateData.website = website.trim();
      if (facebook.trim()) updateData.facebook = facebook.trim();
      if (instagram.trim()) updateData.instagram = instagram.trim();

      // Save data if there's anything to save
      if (Object.keys(updateData).length > 0) {
        await ApiService.updateProfile(updateData);
      }

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAll = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header with progress */}
        <View style={[styles.header, { backgroundColor: Colors.card }]}>
          <View style={styles.headerTop}>
            {currentStepIndex > 0 && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            )}
            <View style={styles.headerRight}>
              <Text style={[styles.stepCounter, { color: Colors.textSecondary }]}>
                {currentStepIndex + 1} of {steps.length}
              </Text>
              <TouchableOpacity onPress={handleSkipAll}>
                <Text style={[styles.skipAllText, { color: Colors.primary }]}>Skip All</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Progress bar */}
          <View style={[styles.progressBar, { backgroundColor: Colors.borderLight }]}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: Colors.primary, width: `${progress}%` },
              ]}
            />
          </View>
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={[styles.card, { backgroundColor: Colors.card }]}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: Colors.bgLightPurple }]}>
              <Ionicons name={currentStep.icon} size={48} color={Colors.primary} />
            </View>

            {/* Title and subtitle */}
            <Text style={[styles.title, { color: Colors.textPrimary }]}>
              {currentStep.title}
            </Text>
            <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
              {currentStep.subtitle}
            </Text>

            {/* Error message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={Colors.creditRed} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Input field */}
            <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
              <Ionicons name={currentStep.icon} size={20} color={Colors.textTertiary} />
              <TextInput
                style={[
                  styles.input,
                  { color: Colors.textPrimary },
                  currentStep.multiline && styles.multilineInput,
                ]}
                placeholder={currentStep.placeholder}
                placeholderTextColor={Colors.textTertiary}
                value={currentStep.value}
                onChangeText={currentStep.setValue}
                keyboardType={currentStep.keyboardType || 'default'}
                maxLength={currentStep.maxLength}
                autoCapitalize={currentStep.autoCapitalize || 'sentences'}
                multiline={currentStep.multiline}
                numberOfLines={currentStep.multiline ? 4 : 1}
                autoFocus
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.skipButton, { borderColor: Colors.borderLight }]}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={[styles.skipButtonText, { color: Colors.textSecondary }]}>Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: Colors.primary }]}
                onPress={handleNext}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <>
                    <Text style={[styles.nextButtonText, { color: Colors.white }]}>
                      {currentStepIndex === steps.length - 1 ? 'Complete' : 'Next'}
                    </Text>
                    <Ionicons
                      name={currentStepIndex === steps.length - 1 ? 'checkmark' : 'arrow-forward'}
                      size={20}
                      color={Colors.white}
                    />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
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
    paddingTop: Spacing.space4,
    paddingBottom: Spacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.space3,
  },
  backButton: {
    padding: Spacing.space2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.space4,
    marginLeft: 'auto',
  },
  stepCounter: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
  },
  skipAllText: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.bold,
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
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.space4,
  },
  card: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.space6,
    ...Shadows.md,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.space5,
  },
  title: {
    fontSize: Typography.font2xl,
    fontWeight: Typography.bold,
    textAlign: 'center',
    marginBottom: Spacing.space2,
  },
  subtitle: {
    fontSize: Typography.fontBase,
    textAlign: 'center',
    marginBottom: Spacing.space5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.space3,
    marginBottom: Spacing.space4,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
    color: '#dc2626',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space4,
    marginBottom: Spacing.space5,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontLg,
    paddingVertical: 0,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.space3,
  },
  skipButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.space4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
  },
  nextButton: {
    flex: 2,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.space4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  nextButtonText: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
  },
});
