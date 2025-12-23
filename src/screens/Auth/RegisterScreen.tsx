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

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    if (!businessName || !phoneNumber || !password) {
      setError('All fields are required');
      return;
    }

    if (phoneNumber.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    try {
      setLoading(true);
      await ApiService.register(businessName, phoneNumber, password);
      setSuccess('Registration successful! Welcome to Ekthaa!');
      
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            <View style={[styles.logoContainer, { backgroundColor: Colors.bgLightPurple }]}>
              <Ionicons name="business" size={72} color={Colors.primary} />
            </View>
          </View>

          {/* Register Card */}
          <View style={[styles.registerCard, { backgroundColor: Colors.card }]}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={[styles.heading1, { color: Colors.textPrimary }]}>Create Your Business</Text>
              <Text style={[styles.heading2, { color: Colors.primary }]}>Credit Book</Text>
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
