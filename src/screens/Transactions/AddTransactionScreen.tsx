/**
 * Add Transaction Screen - Google Pay Inspired
 * Handles adding credit/payment transactions
 */

import React, { useState, useEffect } from 'react';
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
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { IconSizes, AvatarSizes } from '../../constants/scales';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

export default function AddTransactionScreen({ route, navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const { customerId, customerName, transactionType } = route.params;
  
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);

  const isCredit = transactionType === 'credit';
  const themeColor = isCredit ? '#ef4444' : '#10b981';
  const lightThemeColor = isCredit ? '#fef2f2' : '#f0fdf4';

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: '',
      headerStyle: {
        backgroundColor: Colors.background,
      },
      headerShadowVisible: false,
      headerTintColor: Colors.textPrimary,
    });
  }, [navigation, Colors]);

  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Only allow one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleaned);
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload receipt');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSaveTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      await ApiService.addTransaction({
        customer_id: customerId,
        type: transactionType,
        amount: parseFloat(amount),
        notes: notes || undefined,
        receipt_url: receiptImage || undefined,
      });

      Alert.alert(
        'Success',
        `${isCredit ? 'Credit' : 'Payment'} added successfully`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: Colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Customer Info - Top */}
        <View style={styles.topSection}>
          <View style={[styles.avatar, { backgroundColor: themeColor + '20' }]}>
            <Text style={[styles.avatarText, { color: themeColor }]}>
              {customerName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.customerName, { color: Colors.textPrimary }]}>{customerName}</Text>
          <Text style={[styles.transactionTypeLabel, { color: Colors.textSecondary }]}>
            {isCredit ? 'Credit Transaction' : 'Payment Transaction'}
          </Text>
        </View>

        {/* Amount Input - Centered */}
        <View style={styles.centerSection}>
          <View style={styles.amountInputContainer}>
            <Text style={[styles.currencySymbol, { color: Colors.textPrimary }]}>₹</Text>
            <TextInput
              style={[styles.amountInput, { color: Colors.textPrimary }]}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={Colors.textTertiary}
              autoFocus
              maxLength={10}
            />
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Note Input - Expandable */}
          {showNoteInput ? (
            <View style={[styles.noteInputContainer, { borderTopColor: Colors.borderLight }]}>
              <TextInput
                style={[styles.noteInput, { color: Colors.textPrimary }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add a note (optional)"
                placeholderTextColor={Colors.textTertiary}
                multiline
                maxLength={200}
              />
              <TouchableOpacity onPress={() => setShowNoteInput(false)} style={styles.closeNote}>
                <Ionicons name="checkmark" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.optionRow, { borderTopColor: Colors.borderLight }]}
              onPress={() => setShowNoteInput(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={20} color={Colors.textSecondary} />
              <Text style={[styles.optionText, { color: notes ? Colors.textPrimary : Colors.textSecondary }]}>
                {notes || 'Add note'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Receipt */}
          <TouchableOpacity
            style={[styles.optionRow, { borderTopColor: Colors.borderLight }]}
            onPress={handlePickImage}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={20} color={Colors.textSecondary} />
            <Text style={[styles.optionText, { color: receiptImage ? Colors.textPrimary : Colors.textSecondary }]}>
              {receiptImage ? 'Receipt added' : 'Add receipt'}
            </Text>
            {receiptImage && <Ionicons name="checkmark-circle" size={20} color="#10b981" />}
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: isCredit ? '#ef4444' : '#10b981',
                opacity: !amount || loading ? 0.5 : 1,
              },
            ]}
            onPress={handleSaveTransaction}
            disabled={!amount || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isCredit ? `Give ₹${amount || '0'} Credit` : `Receive ₹${amount || '0'} Payment`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  avatar: {
    width: AvatarSizes.xlarge,
    height: AvatarSizes.xlarge,
    borderRadius: AvatarSizes.xlarge / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontSize: Typography.font2xl,
    fontWeight: Typography.bold,
  },
  customerName: {
    fontSize: Typography.fontLg,
    fontWeight: Typography.bold,
    marginBottom: 4,
  },
  transactionTypeLabel: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 56,
    fontWeight: Typography.extraBold,
  },
  amountInput: {
    fontSize: 56,
    fontWeight: Typography.extraBold,
    minWidth: 100,
    maxWidth: 200,
  },
  bottomSection: {
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    borderTopWidth: 1,
  },
  optionText: {
    flex: 1,
    fontSize: Typography.fontBase,
  },
  noteInputContainer: {
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  noteInput: {
    flex: 1,
    fontSize: Typography.fontBase,
    minHeight: 40,
    maxHeight: 80,
  },
  closeNote: {
    padding: 4,
  },
  saveButton: {
    margin: Spacing.lg,
    padding: Spacing.md + 2,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonText: {
    color: '#fff',
    fontSize: Typography.fontLg,
    fontWeight: Typography.bold,
  },
});
