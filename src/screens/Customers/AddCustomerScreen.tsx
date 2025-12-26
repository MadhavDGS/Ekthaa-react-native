/**
 * Add Customer Screen
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
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { IconSizes, SpacingScale } from '../../constants/scales';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

export default function AddCustomerScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCustomer = async () => {
    if (!name || !phoneNumber) {
      Alert.alert('Error', 'Please enter customer name and phone number');
      return;
    }

    if (phoneNumber.length !== 10) {
      Alert.alert('Error', 'Phone number must be 10 digits');
      return;
    }

    try {
      setLoading(true);
      await ApiService.addCustomer({
        name,
        phone_number: phoneNumber,
        address: address || undefined,
      });
      
      Alert.alert('Success', 'Customer added successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add customer');
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
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* <View style={styles.header}>
            <Ionicons name="person-add" size={43} color={Colors.primary} />
            <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>New Customer</Text>
            <Text style={[styles.headerSubtitle, { color: Colors.textSecondary }]}>Add customer details to your ledger</Text>
          </View> */}

          <View style={[styles.form, { backgroundColor: Colors.card }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.textPrimary }]}>Customer Name *</Text>
              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '10' }]}>
                  <Ionicons name="person-outline" size={18} color={Colors.primary} />
                </View>
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="Enter customer name"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.textPrimary }]}>Phone Number *</Text>
              <View style={[styles.inputContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '10' }]}>
                  <Ionicons name="call-outline" size={18} color={Colors.primary} />
                </View>
                <TextInput
                  style={[styles.input, { color: Colors.textPrimary }]}
                  placeholder="Enter 10-digit phone number"
                  placeholderTextColor="#9ca3af"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.textPrimary }]}>Address (Optional)</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.borderLight }]}>
                <View style={[styles.iconWrapper, { alignSelf: 'flex-start', backgroundColor: Colors.primary + '10' }]}>
                  <Ionicons name="location-outline" size={18} color={Colors.primary} />
                </View>
                <TextInput
                  style={[styles.input, styles.textArea, { color: Colors.textPrimary }]}
                  placeholder="Enter address"
                  placeholderTextColor="#9ca3af"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled, { backgroundColor: Colors.primary, ...Platform.select({ ios: { shadowColor: Colors.primary }, android: {} }) }]}
            onPress={handleAddCustomer}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitButtonText}>Adding Customer...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Add Customer</Text>
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
  textAreaContainer: {
    paddingVertical: Spacing.md,
    minHeight: 95,
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
  textArea: {
    minHeight: 65,
    paddingTop: Spacing.xs,
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
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
    color: '#fff',
  },
});
