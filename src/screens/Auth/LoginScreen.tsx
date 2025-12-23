/**
 * Login Screen
 * Clean modern design matching web app
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { AvatarSizes, IconSizes } from '../../constants/scales';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

export default function LoginScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async () => {
    setError('');
    setSuccess('');

    if (!phoneNumber || !password) {
      setError('Please enter phone number and password');
      return;
    }

    if (phoneNumber.length !== 10) {
      setError('Phone number must be 10 digits');
      return;
    }

    try {
      setLoading(true);
      console.log('🔐 Attempting login with phone:', phoneNumber);
      const response = await ApiService.login(phoneNumber, password);
      console.log('✅ Login successful!', response);
      setSuccess('Login successful! Redirecting...');

      // Small delay to show success message, then trigger re-render
      setTimeout(() => {
        // Force re-render by navigating to a dummy route and back
        // This will trigger the auth check in App.tsx
        setLoading(false);
        // The App.tsx will automatically navigate to Main when it detects the token
      }, 500);
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
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

          {/* Login Card */}
          <View style={[styles.loginCard, { backgroundColor: Colors.card }]}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={[styles.heading1, { color: Colors.textPrimary }]}>Login to Access Your</Text>
              <Text style={[styles.heading2, { color: Colors.primary }]}>Credit Book</Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: isDark ? 'rgba(248, 113, 113, 0.2)' : 'rgba(239, 68, 68, 0.1)', borderColor: isDark ? 'rgba(248, 113, 113, 0.4)' : 'rgba(239, 68, 68, 0.3)' }]}>
                <Ionicons name="alert-circle" size={13} color={Colors.creditRed} />
                <Text style={[styles.errorText, { color: Colors.creditRed }]}>{error}</Text>
              </View>
            ) : null}

            {/* Success Message */}
            {success ? (
              <View style={[styles.successContainer, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)', borderColor: isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)' }]}>
                <Ionicons name="checkmark-circle" size={13} color={Colors.paymentGreen} />
                <Text style={[styles.successText, { color: Colors.paymentGreen }]}>{success}</Text>
              </View>
            ) : null}

            {/* Phone Input */}
            <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
              <Ionicons name="call" size={13} color={Colors.textTertiary} />
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
              <Ionicons name="lock-closed" size={13} color={Colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: Colors.textPrimary }]}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: Colors.primary }, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.loginButtonText}>Logging in...</Text>
                </>
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: Colors.borderLight }]} />
              <Text style={[styles.dividerText, { color: Colors.textSecondary }]}>Or</Text>
              <View style={[styles.dividerLine, { backgroundColor: Colors.borderLight }]} />
            </View>

            {/* Signup Link */}
            <View style={styles.signupLink}>
              <Text style={[styles.signupText, { color: Colors.textSecondary }]}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.signupLinkText, { color: Colors.primary }]}>Create an account</Text>
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
    width: AvatarSizes.xxlarge + 21,
    height: AvatarSizes.xxlarge + 21,
    borderRadius: (AvatarSizes.xxlarge + 21) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginCard: {
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
    marginBottom: 3,
  },
  heading2: {
    fontSize: Typography.fontLg,
    fontWeight: Typography.bold,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.space3,
    marginBottom: Spacing.space3,
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.space3,
    marginBottom: Spacing.space3,
    gap: 10,
  },
  successText: {
    flex: 1,
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space4,
    marginBottom: Spacing.space3,
    gap: 9,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontBase,
    paddingVertical: 0,
  },
  loginButton: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.space4,
    paddingHorizontal: Spacing.space6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.space4,
    flexDirection: 'row',
    gap: 9,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.space4,
    gap: 9,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: Typography.fontSm,
  },
  signupLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.space2,
  },
  signupText: {
    fontSize: Typography.fontSm,
  },
  signupLinkText: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
  },
});
