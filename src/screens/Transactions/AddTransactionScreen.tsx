/**
 * Add Transaction Screen - Minimal & Beautiful Design
 * Clean, focused interface for adding transactions
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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [buttonScale] = useState(new Animated.Value(1));

  const isCredit = transactionType === 'credit';

  // Softer, more refined colors
  const themeColor = isCredit ? '#f87171' : '#34d399';
  const darkThemeColor = isCredit ? '#dc2626' : '#059669';
  const lightThemeColor = isCredit ? 'rgba(248, 113, 113, 0.1)' : 'rgba(52, 211, 153, 0.1)';
  const gradientColors = isCredit
    ? ['#f87171', '#ef4444', '#dc2626']
    : ['#34d399', '#10b981', '#059669'];

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

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSaveTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    animateButton();

    try {
      setLoading(true);
      await ApiService.addTransaction({
        customer_id: customerId,
        type: transactionType,
        amount: parseFloat(amount),
        notes: notes || undefined,
        receipt_url: receiptImage || undefined,
        created_by: 'business', // Mobile app transactions created by business
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
        {/* Customer Info - Minimal & Clean */}
        <View style={styles.topSection}>
          <LinearGradient
            colors={[lightThemeColor, lightThemeColor]}
            style={[styles.avatarGradient]}
          >
            <View style={[styles.avatar, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.avatarText, { color: isDark ? themeColor : darkThemeColor }]}>
                {customerName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </LinearGradient>
          <Text style={[styles.customerName, { color: Colors.textPrimary }]}>
            {customerName}
          </Text>
          <View style={[styles.typeBadge, {
            backgroundColor: isDark ? lightThemeColor : lightThemeColor,
            borderColor: isDark ? themeColor + '30' : darkThemeColor + '30'
          }]}>
            <Ionicons
              name={isCredit ? 'arrow-up-circle' : 'arrow-down-circle'}
              size={14}
              color={isDark ? themeColor : darkThemeColor}
            />
            <Text style={[styles.typeBadgeText, { color: isDark ? themeColor : darkThemeColor }]}>
              {isCredit ? 'Credit' : 'Payment'}
            </Text>
          </View>
        </View>

        {/* Amount Input - Large & Centered */}
        <View style={styles.centerSection}>
          <View style={styles.amountInputContainer}>
            <Text style={[styles.currencySymbol, { color: Colors.textSecondary }]}>₹</Text>
            <TextInput
              style={[styles.amountInput, { color: Colors.textPrimary }]}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={Colors.textTertiary}
              autoFocus
              maxLength={10}
              selectionColor={isDark ? themeColor : darkThemeColor}
            />
          </View>
          {amount && parseFloat(amount) > 0 && (
            <Text style={[styles.amountHint, { color: Colors.textTertiary }]}>
              {isCredit ? 'You will receive' : 'You received'}
            </Text>
          )}
        </View>

        {/* Bottom Section - Pill Buttons */}
        <View style={styles.bottomSection}>
          {/* Note Button */}
          {showNoteInput ? (
            <View style={[styles.noteInputContainer, {
              backgroundColor: isDark ? Colors.card : Colors.backgroundSecondary,
              borderColor: Colors.borderLight
            }]}>
              <Ionicons name="create-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={[styles.noteInput, { color: Colors.textPrimary }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add a note..."
                placeholderTextColor={Colors.textTertiary}
                multiline
                maxLength={200}
                autoFocus
              />
              <TouchableOpacity onPress={() => setShowNoteInput(false)}>
                <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.pillButtonsRow}>
              <TouchableOpacity
                style={[styles.pillButton, {
                  backgroundColor: isDark ? Colors.card : Colors.backgroundSecondary,
                  borderColor: notes ? (isDark ? themeColor : darkThemeColor) : Colors.borderLight,
                  borderWidth: notes ? 1.5 : 1,
                }]}
                onPress={() => setShowNoteInput(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={notes ? 'create' : 'create-outline'}
                  size={18}
                  color={notes ? (isDark ? themeColor : darkThemeColor) : Colors.textSecondary}
                />
                <Text style={[styles.pillButtonText, {
                  color: notes ? (isDark ? themeColor : darkThemeColor) : Colors.textSecondary,
                  fontWeight: notes ? '600' : '500'
                }]}>
                  {notes ? 'Note added' : 'Add note'}
                </Text>
              </TouchableOpacity>

              {/* Receipt Button */}
              <TouchableOpacity
                style={[styles.pillButton, {
                  backgroundColor: isDark ? Colors.card : Colors.backgroundSecondary,
                  borderColor: receiptImage ? (isDark ? themeColor : darkThemeColor) : Colors.borderLight,
                  borderWidth: receiptImage ? 1.5 : 1,
                }]}
                onPress={handlePickImage}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={receiptImage ? 'camera' : 'camera-outline'}
                  size={18}
                  color={receiptImage ? (isDark ? themeColor : darkThemeColor) : Colors.textSecondary}
                />
                <Text style={[styles.pillButtonText, {
                  color: receiptImage ? (isDark ? themeColor : darkThemeColor) : Colors.textSecondary,
                  fontWeight: receiptImage ? '600' : '500'
                }]}>
                  {receiptImage ? 'Receipt added' : 'Add receipt'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Save Button - Gradient */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              onPress={handleSaveTransaction}
              disabled={!amount || loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={!amount || loading ? ['#9ca3af', '#6b7280'] : gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButton}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name={isCredit ? 'arrow-up' : 'arrow-down'}
                      size={22}
                      color="#fff"
                    />
                    <Text style={styles.saveButtonText}>
                      {isCredit ? 'Give Credit' : 'Receive Payment'}
                    </Text>
                    {amount && parseFloat(amount) > 0 && (
                      <View style={styles.amountBadge}>
                        <Text style={styles.amountBadgeText}>
                          ₹{parseFloat(amount).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
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
    paddingTop: Spacing.xl + Spacing.md,
    paddingBottom: Spacing.lg,
  },
  avatarGradient: {
    width: AvatarSizes.xlarge + 20,
    height: AvatarSizes.xlarge + 20,
    borderRadius: (AvatarSizes.xlarge + 20) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: AvatarSizes.xlarge,
    height: AvatarSizes.xlarge,
    borderRadius: AvatarSizes.xlarge / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
  },
  customerName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
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
    fontSize: 72,
    fontWeight: '300',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 72,
    fontWeight: '800',
    minWidth: 120,
    maxWidth: 250,
    textAlign: 'left',
  },
  amountHint: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: Spacing.sm,
  },
  bottomSection: {
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl + Spacing.md : Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  pillButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  pillButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  pillButtonText: {
    fontSize: 15,
  },
  noteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    minHeight: 56,
  },
  noteInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 80,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    minHeight: 56,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  amountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  amountBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
