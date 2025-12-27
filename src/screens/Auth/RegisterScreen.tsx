/**
 * Register Screen
 * Business registration matching web app design
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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { AvatarSizes, IconSizes } from '../../constants/scales';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

export default function RegisterScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Additional business details
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

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    if (!businessName || !phoneNumber || !password) {
      setError('Business name, phone and password are required');
      return;
    }

    if (phoneNumber.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (pincode && pincode.length !== 6) {
      setError('Pincode must be 6 digits');
      return;
    }

    try {
      setLoading(true);
      
      // Register and get the auth token
      const response = await ApiService.register(businessName, phoneNumber, password);
      
      // Update business details with additional information
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

      // If we have additional details, update the profile
      if (Object.keys(updateData).length > 0) {
        await ApiService.updateProfile(updateData);
      }

      setSuccess('Registration successful! Welcome to Ekthaa!');
      
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }, 1000);
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed. Please try again.');
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={[styles.logoContainer, { backgroundColor: 'transparent' }]}>
              <Image
                source={require('../../../assets/logo.png')}
                style={{ width: 120, height: 120, resizeMode: 'contain' }}
              />
            </View>
          </View>

          {/* Register Card */}
          <View style={[styles.registerCard, { backgroundColor: Colors.card }]}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={[styles.heading1, { color: Colors.textPrimary }]}>Register to</Text>
              <Text style={[styles.heading2, { color: Colors.primary }]}>Ekthaa</Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={Colors.creditRed} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Success Message */}
            {success ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.paymentGreen} />
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            {/* Business Name Input */}
            <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
              <Ionicons name="storefront" size={16} color={Colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: Colors.textPrimary }]}
                placeholder="Enter business name"
                placeholderTextColor={Colors.textTertiary}
                value={businessName}
                onChangeText={setBusinessName}
                autoComplete="name"
              />
            </View>

            {/* Phone Input */}
            <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
              <Ionicons name="call" size={16} color={Colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: Colors.textPrimary }]}
                placeholder="Enter your mobile number"
                placeholderTextColor={Colors.textTertiary}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
                autoComplete="tel"
              />
            </View>

            {/* Password Input */}
            <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
              <Ionicons name="lock-closed" size={16} color={Colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: Colors.textPrimary }]}
                placeholder="Create a password"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>

            {/* Additional Business Details Section */}
            <View style={styles.sectionDivider}>
              <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Business Details (Optional)</Text>
            </View>

            {/* Email Input */}
            <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
              <Ionicons name="mail" size={16} color={Colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: Colors.textPrimary }]}
                placeholder="Email address"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Address Input */}
            <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
              <Ionicons name="location" size={16} color={Colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: Colors.textPrimary }]}
                placeholder="Business address"
                placeholderTextColor={Colors.textTertiary}
                value={address}
                onChangeText={setAddress}
                autoComplete="street-address"
              />
            </View>

            {/* City & State Row */}
            <View style={styles.rowInputs}>
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

            {/* Pincode Input */}
            <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
              <Ionicons name="pin" size={16} color={Colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: Colors.textPrimary }]}
                placeholder="Pincode"
                placeholderTextColor={Colors.textTertiary}
                value={pincode}
                onChangeText={setPincode}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            {/* Category & Business Type Row */}
            <View style={styles.rowInputs}>
              <View style={[styles.halfInputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <Ionicons name="grid" size={16} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="Category"
                  placeholderTextColor={Colors.textTertiary}
                  value={category}
                  onChangeText={setCategory}
                />
              </View>

              <View style={[styles.halfInputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <Ionicons name="briefcase" size={16} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="Business Type"
                  placeholderTextColor={Colors.textTertiary}
                  value={businessType}
                  onChangeText={setBusinessType}
                />
              </View>
            </View>

            {/* GST Number Input */}
            <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
              <Ionicons name="document-text" size={16} color={Colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: Colors.textPrimary }]}
                placeholder="GST Number (optional)"
                placeholderTextColor={Colors.textTertiary}
                value={gstNumber}
                onChangeText={setGstNumber}
                autoCapitalize="characters"
              />
            </View>

            {/* Description Input */}
            <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
              <Ionicons name="document-text" size={16} color={Colors.textTertiary} style={styles.textAreaIcon} />
              <TextInput
                style={[styles.input, styles.textArea, { color: Colors.textPrimary }]}
                placeholder="Business description"
                placeholderTextColor={Colors.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Website Input */}
            <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
              <Ionicons name="globe" size={16} color={Colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: Colors.textPrimary }]}
                placeholder="Website URL (optional)"
                placeholderTextColor={Colors.textTertiary}
                value={website}
                onChangeText={setWebsite}
                keyboardType="url"
                autoCapitalize="none"
                autoComplete="off"
              />
            </View>

            {/* Social Media Section */}
            <View style={styles.sectionDivider}>
              <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Social Media (Optional)</Text>
            </View>

            {/* Facebook Input */}
            <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
              <Ionicons name="logo-facebook" size={16} color={Colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: Colors.textPrimary }]}
                placeholder="Facebook profile URL"
                placeholderTextColor={Colors.textTertiary}
                value={facebook}
                onChangeText={setFacebook}
                keyboardType="url"
  sectionDivider: {
    marginTop: Spacing.space4,
    marginBottom: Spacing.space3,
  },
  sectionTitle: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
    textAlign: 'center',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: Spacing.space3,
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
  textAreaContainer: {
    alignItems: 'flex-start',
    minHeight: 80,
  },
  textAreaIcon: {
    marginTop: Spacing.space1,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
    paddingTop: 0,
  },
                autoCapitalize="none"
              />
            </View>

            {/* Instagram Input */}
            <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
              <Ionicons name="logo-instagram" size={16} color={Colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: Colors.textPrimary }]}
                placeholder="Instagram profile URL"
                placeholderTextColor={Colors.textTertiary}
                value={instagram}
                onChangeText={setInstagram}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            {/* autoComplete="name"
              />
            </View>

            {/* Phone Input */}
            <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
              <Ionicons name="call" size={16} color={Colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: Colors.textPrimary }]}
                placeholder="Enter your mobile number"
                placeholderTextColor={Colors.textTertiary}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
                autoComplete="tel"
              />
            </View>

            {/* Password Input */}
            <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
              <Ionicons name="lock-closed" size={16} color={Colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: Colors.textPrimary }]}
                placeholder="Create a password"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: Colors.primary }, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <>
                  <ActivityIndicator color={Colors.white} size="small" />
                  <Text style={[styles.registerButtonText, { color: Colors.white }]}>Registering...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="person-add" size={20} color={Colors.white} />
                  <Text style={[styles.registerButtonText, { color: Colors.white }]}>Register</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginLink}>
              <Text style={[styles.loginText, { color: Colors.textSecondary }]}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLinkText, { color: Colors.primary }]}>Login</Text>
              </TouchableOpacity>
            </View>
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
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.space4,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.space6,
  },
  logoContainer: {
    width: AvatarSizes.xxlarge + 46,
    height: AvatarSizes.xxlarge + 46,
    borderRadius: (AvatarSizes.xxlarge + 46) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerCard: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.space6,
    ...Shadows.md,
  },
  cardHeader: {
    marginBottom: Spacing.space5,
    alignItems: 'center',
  },
  heading1: {
    fontSize: Typography.fontLg,
    fontWeight: Typography.bold,
    marginBottom: 4,
  },
  heading2: {
    fontSize: Typography.fontLg,
    fontWeight: Typography.bold,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.space3,
    marginBottom: Spacing.space3,
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
    color: '#dc2626',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.space3,
    marginBottom: Spacing.space3,
    gap: 12,
  },
  successText: {
    flex: 1,
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
    color: '#059669',
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
  input: {
    flex: 1,
    fontSize: Typography.fontBase,
    paddingVertical: 0,
  },
  registerButton: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.space4,
    paddingHorizontal: Spacing.space6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.space4,
    flexDirection: 'row',
    gap: 11,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.space4,
  },
  loginText: {
    fontSize: Typography.fontSm,
  },
  loginLinkText: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
  },
});
