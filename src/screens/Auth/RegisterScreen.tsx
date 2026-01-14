/**
 * Register Screen - Simplified Registration
 * Quick registration with essential fields only
 * Additional details can be completed from profile section
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
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';


export default function RegisterScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state - only essential fields
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!businessName.trim()) {
      setError('Please enter your business name');
      return;
    }
    
    if (!phoneNumber.trim() || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Register the business
      const registerResponse = await ApiService.register(
        businessName.trim(),
        phoneNumber.trim(),
        password
      );

      // Store auth token
      await AsyncStorage.setItem('authToken', registerResponse.token);
      await AsyncStorage.setItem('businessId', registerResponse.business_id);
      await AsyncStorage.setItem('user', JSON.stringify(registerResponse.business));

      Alert.alert(
        'Success!',
        'Your account has been created successfully. Complete your profile to get more customers!',
        [{ text: 'OK', onPress: () => navigation.replace('Main') }]
      );
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <View style={[styles.iconWrapper, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.2)' : '#e8f5f3' }]}>
              <Ionicons name="storefront" size={40} color="#5a9a8e" />
            </View>

            <Text style={[styles.title, { color: Colors.textPrimary }]}>Create Your Account</Text>
            <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
              Start managing your business with Kathape
            </Text>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Business Name Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: Colors.textPrimary }]}>Business Name *</Text>
              <View style={[styles.inputWrapper, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}>
                <Ionicons name="storefront-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="Enter your business name"
                  placeholderTextColor={Colors.textTertiary}
                  value={businessName}
                  onChangeText={setBusinessName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: Colors.textPrimary }]}>Mobile Number *</Text>
              <View style={[styles.inputWrapper, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}>
                <Ionicons name="call-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={Colors.textTertiary}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: Colors.textPrimary }]}>Password *</Text>
              <View style={[styles.inputWrapper, { backgroundColor: Colors.card, borderColor: Colors.borderLight }]}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary, flex: 1 }]}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={Colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, { opacity: loading ? 0.7 : 1 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.registerButtonText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {/* Info Note */}
            <View style={[styles.infoNote, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : '#eef2ff', borderColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#c7d2fe' }]}>
              <Ionicons name="information-circle" size={20} color="#6366f1" />
              <Text style={[styles.infoText, { color: isDark ? '#c7d2fe' : '#6366f1' }]}>
                You can complete your profile details later from the dashboard
              </Text>
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: Colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
                <Text style={styles.loginLink}>Login</Text>
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
    paddingBottom: Spacing.space6,
  },
  header: {
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space2,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: Spacing.space6,
    paddingTop: Spacing.space4,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.space4,
  },
  title: {
    fontSize: 28,
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
  inputSection: {
    marginBottom: Spacing.space4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.space2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.space3,
    height: 54,
  },
  inputIcon: {
    marginRight: Spacing.space2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  registerButton: {
    backgroundColor: '#5a9a8e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.space4,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.space2,
    gap: Spacing.space2,
    ...Shadows.md,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.space3,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.space4,
    gap: Spacing.space2,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.space6,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5a9a8e',
  },
});
