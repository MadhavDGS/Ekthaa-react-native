/**
 * Business Details Screen
 * Collects additional business information after registration
 * with skip option
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { IconSizes } from '../../constants/scales';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

export default function BusinessDetailsScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Basic Information
  const [email, setEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [description, setDescription] = useState('');
  
  // Location Information
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  
  // Business Category
  const [category, setCategory] = useState('');
  const [businessType, setBusinessType] = useState('');
  
  // Social Media
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');

  const handleSkip = () => {
    Alert.alert(
      'Skip Business Details',
      'You can add these details later from your profile settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Skip',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    setError('');

    // Validate email if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Please enter a valid email address');
        return;
      }
    }

    // Validate pincode if provided
    if (pincode && (pincode.length !== 6 || !pincode.match(/^\d+$/))) {
      setError('PIN code must be exactly 6 digits');
      return;
    }

    // Validate GST number format if provided (proper validation)
    if (gstNumber && gstNumber.length > 0) {
      if (gstNumber.length !== 15) {
        setError('GST number must be 15 characters');
        return;
      }
      // GST format: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(gstNumber.toUpperCase())) {
        setError('Invalid GST number format');
        return;
      }
    }

    try {
      setLoading(true);
      
      const updateData: any = {};
      
      // Only send non-empty fields
      if (email) updateData.email = email.trim();
      if (gstNumber) updateData.gst_number = gstNumber.trim().toUpperCase();
      if (description) updateData.description = description.trim();
      if (address) updateData.address = address.trim();
      if (city) updateData.city = city.trim();
      if (state) updateData.state = state.trim();
      if (pincode) updateData.pincode = pincode.trim();
      if (category) updateData.category = category.trim();
      if (businessType) updateData.business_type = businessType.trim();
      if (website) updateData.website = website.trim();
      if (facebook) updateData.facebook = facebook.trim();
      if (instagram) updateData.instagram = instagram.trim();

      if (Object.keys(updateData).length > 0) {
        await ApiService.updateProfile(updateData);
      }
      
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save details. Please try again.');
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
        <View style={[styles.header, { backgroundColor: Colors.card }]}>
          <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>Complete Your Profile</Text>
          <Text style={[styles.headerSubtitle, { color: Colors.textSecondary }]}>
            Add business details to get started
          </Text>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={[styles.skipButtonText, { color: Colors.primary }]}>Skip for now</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Card Container */}
          <View style={[styles.card, { backgroundColor: Colors.card }]}>
            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={Colors.creditRed} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Basic Information Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
                <Ionicons name="information-circle" size={16} color={Colors.primary} /> Basic Information
              </Text>

              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <Ionicons name="mail" size={16} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="Email (optional)"
                  placeholderTextColor={Colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <Ionicons name="document-text" size={16} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="GST Number (optional)"
                  placeholderTextColor={Colors.textTertiary}
                  value={gstNumber}
                  onChangeText={setGstNumber}
                  autoCapitalize="characters"
                  maxLength={15}
                />
              </View>

              <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <Ionicons name="create" size={16} color={Colors.textTertiary} style={styles.textAreaIcon} />
                <TextInput
                  style={[styles.input, styles.textArea, { color: Colors.textPrimary }]}
                  placeholder="Business description (optional)"
                  placeholderTextColor={Colors.textTertiary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Location Information Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
                <Ionicons name="location" size={16} color={Colors.primary} /> Location
              </Text>

              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <Ionicons name="home" size={16} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="Address (optional)"
                  placeholderTextColor={Colors.textTertiary}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.halfInputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                  <Ionicons name="business" size={16} color={Colors.textTertiary} />
                  <TextInput
                    style={[styles.input, { color: Colors.textPrimary }]}
                    placeholder="City"
                    placeholderTextColor={Colors.textTertiary}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>

                <View style={[styles.halfInputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                  <Ionicons name="map" size={16} color={Colors.textTertiary} />
                  <TextInput
                    style={[styles.input, { color: Colors.textPrimary }]}
                    placeholder="State"
                    placeholderTextColor={Colors.textTertiary}
                    value={state}
                    onChangeText={setState}
                  />
                </View>
              </View>

              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <Ionicons name="pin" size={16} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="PIN code (optional)"
                  placeholderTextColor={Colors.textTertiary}
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </View>

            {/* Business Category Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
                <Ionicons name="pricetags" size={16} color={Colors.primary} /> Business Category
              </Text>

              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <Ionicons name="albums" size={16} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="Category (e.g., Retail, Service)"
                  placeholderTextColor={Colors.textTertiary}
                  value={category}
                  onChangeText={setCategory}
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <Ionicons name="briefcase" size={16} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="Business type (e.g., Shop, Restaurant)"
                  placeholderTextColor={Colors.textTertiary}
                  value={businessType}
                  onChangeText={setBusinessType}
                />
              </View>
            </View>

            {/* Social Media Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
                <Ionicons name="share-social" size={16} color={Colors.primary} /> Online Presence
              </Text>

              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <Ionicons name="globe" size={16} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="Website (optional)"
                  placeholderTextColor={Colors.textTertiary}
                  value={website}
                  onChangeText={setWebsite}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <Ionicons name="logo-facebook" size={16} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="Facebook (optional)"
                  placeholderTextColor={Colors.textTertiary}
                  value={facebook}
                  onChangeText={setFacebook}
                  autoCapitalize="none"
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <Ionicons name="logo-instagram" size={16} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="Instagram (optional)"
                  placeholderTextColor={Colors.textTertiary}
                  value={instagram}
                  onChangeText={setInstagram}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: Colors.primary }, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <>
                  <ActivityIndicator color={Colors.white} size="small" />
                  <Text style={[styles.saveButtonText, { color: Colors.white }]}>Saving...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                  <Text style={[styles.saveButtonText, { color: Colors.white }]}>Complete Setup</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  headerTitle: {
    fontSize: Typography.fontXl,
    fontWeight: Typography.bold,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: Typography.fontSm,
    marginBottom: Spacing.space2,
  },
  skipButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.space2,
  },
  skipButtonText: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
  },
  scrollContent: {
    padding: Spacing.space4,
  },
  card: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.space5,
    ...Shadows.md,
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
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
    color: '#dc2626',
  },
  section: {
    marginBottom: Spacing.space5,
  },
  sectionTitle: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
    marginBottom: Spacing.space3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space4,
    marginBottom: Spacing.space3,
    gap: 11,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textAreaIcon: {
    marginTop: 4,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontBase,
    paddingVertical: 0,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.space3,
  },
  halfInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.space3,
    paddingVertical: Spacing.space4,
    gap: 8,
  },
  saveButton: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.space4,
    paddingHorizontal: Spacing.space6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.space2,
    flexDirection: 'row',
    gap: 11,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
  },
});
