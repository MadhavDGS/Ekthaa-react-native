/**
 * QR Code Screen - Payment QR Code Display
 * Simple React Native UI for showing business payment QR code
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Share,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import ApiService from '../../services/api';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { API_BASE_URL } from '../../constants/api';

export default function QRCodeScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [qrImageData, setQrImageData] = useState<string>('');

  useFocusEffect(
    useCallback(() => {
      loadProfileAndQR();
    }, [])
  );

  useEffect(() => {
    // Use native header
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Payment QR Code',
    });
  }, [navigation]);

  const loadProfileAndQR = async () => {
    try {
      setLoading(true);
      
      // Load profile data
      const data = await ApiService.getProfile();
      setProfile(data.user || data.business || {});
      console.log('💼 Profile loaded with PIN:', data.user?.access_pin || data.business?.access_pin);
      
      // Fetch QR code image with authentication - try multiple endpoints
      const token = await ApiService.getToken();
      if (token) {
        console.log('🔐 Fetching QR code with auth token...');
        
        // Try primary endpoint first
        let response = await fetch(`${API_BASE_URL}/api/business/qr-code`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        // If 404, try alternative endpoint
        if (response.status === 404) {
          console.log('🔄 Trying alternative QR endpoint...');
          response = await fetch(`${API_BASE_URL}/api/profile/qr`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        }
        
        if (response.ok) {
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            setQrImageData(base64data);
            console.log('✅ QR code loaded successfully');
          };
          reader.readAsDataURL(blob);
        } else {
          console.error('❌ QR code fetch failed:', response.status);
          console.error('❌ Response:', await response.text());
        }
      }
    } catch (error) {
      console.error('❌ Load profile/QR error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const message = `Pay to ${profile?.name || 'Business'}\nPhone: ${profile?.phone_number || 'N/A'}\n\nUse Ekthaa app for digital payments!`;
      await Share.share({
        message,
        title: 'Payment Details',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDownload = async () => {
    try {
      if (!qrImageData) {
        Alert.alert('Error', 'QR code not loaded yet');
        return;
      }

      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save images');
        return;
      }

      // Convert base64 to file
      const filename = `ekthaa-qr-${Date.now()}.png`;
      const fileUri = FileSystem.cacheDirectory ? `${FileSystem.cacheDirectory}${filename}` : `${filename}`;
      
      // Remove data:image/png;base64, prefix if present
      const base64Code = qrImageData.split(',')[1] || qrImageData;
      
      await FileSystem.writeAsStringAsync(fileUri, base64Code, {
        encoding: 'base64',
      });

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('Ekthaa', asset, false);
      
      Alert.alert('Success', 'QR code saved to gallery!');
      console.log('✅ QR code downloaded successfully');
    } catch (error) {
      console.error('❌ Download error:', error);
      Alert.alert('Error', 'Failed to download QR code');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]} edges={['bottom']}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: Colors.card }]}>
          <View style={styles.qrContainer}>
            {loading ? (
              <View style={[styles.qrPlaceholder, { backgroundColor: Colors.primary + '10', borderColor: Colors.primary + '20' }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>Loading QR Code...</Text>
              </View>
            ) : qrImageData ? (
              <Image
                source={{ uri: qrImageData }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.qrPlaceholder, { backgroundColor: Colors.primary + '10', borderColor: Colors.primary + '20' }]}>
                <Ionicons name="qr-code-outline" size={162} color={Colors.primary} />
                <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>Unable to load QR</Text>
              </View>
            )}
            <Text style={[styles.qrLabel, { color: Colors.textSecondary }]}>Scan to Pay</Text>
          </View>

          {/* Business PIN Display */}
          {profile?.access_pin && (
            <View style={[styles.pinSection, { backgroundColor: Colors.primary + '10' }]}>
              <Text style={[styles.pinLabel, { color: Colors.textSecondary }]}>Business Access PIN</Text>
              <View style={styles.pinContainer}>
                {profile.access_pin.split('').map((digit: string, index: number) => (
                  <View key={index} style={[styles.pinDigit, { backgroundColor: Colors.card, borderColor: Colors.primary }]}>
                    <Text style={[styles.pinDigitText, { color: Colors.primary }]}>{digit}</Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.pinHint, { color: Colors.textSecondary }]}>Share this PIN with customers to add credit</Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: Colors.borderLight }]} />

          <View style={styles.infoSection}>
            <Text style={[styles.infoTitle, { color: Colors.textPrimary }]}>Business Details</Text>
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={18} color={Colors.textSecondary} />
              <Text style={[styles.infoText, { color: Colors.textSecondary }]}>{profile?.name || 'Loading...'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={18} color={Colors.textSecondary} />
              <Text style={[styles.infoText, { color: Colors.textSecondary }]}>{profile?.phone_number || 'N/A'}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: Colors.borderLight }]} />

          <View style={styles.instructions}>
            <Text style={[styles.instructionsTitle, { color: Colors.textPrimary }]}>How to receive payment?</Text>
            <View style={styles.instructionItem}>
              <View style={[styles.instructionBadge, { backgroundColor: Colors.primary }]}>
                <Text style={styles.instructionNumber}>1</Text>
              </View>
              <Text style={[styles.instructionText, { color: Colors.textSecondary }]}>Ask customer to scan this QR code</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={[styles.instructionBadge, { backgroundColor: Colors.primary }]}>
                <Text style={styles.instructionNumber}>2</Text>
              </View>
              <Text style={[styles.instructionText, { color: Colors.textSecondary }]}>Enter the payment amount</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={[styles.instructionBadge, { backgroundColor: Colors.primary }]}>
                <Text style={styles.instructionNumber}>3</Text>
              </View>
              <Text style={[styles.instructionText, { color: Colors.textSecondary }]}>Complete payment on their app</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.primary + '10' }]} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={Colors.primary} />
            <Text style={[styles.actionButtonText, { color: Colors.primary }]}>Share QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonSecondary, { backgroundColor: Colors.backgroundSecondary }]}
            onPress={handleDownload}
          >
            <Ionicons name="download-outline" size={20} color={Colors.textSecondary} />
            <Text style={[styles.actionButtonText, { ...styles.actionButtonTextSecondary, color: Colors.textSecondary }]}>
              Download
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.note, { backgroundColor: Colors.primary + '10' }]}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
          <Text style={[styles.noteText, { color: Colors.primary }]}>
            Your customers can scan this QR code to add credit or make payments directly to your business.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.space6,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.space6,
  },
  qrPlaceholder: {
    width: 216,
    height: 216,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  qrImage: {
    width: 216,
    height: 216,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontBase,
  },
  qrLabel: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.semiBold,
  },
  pinSection: {
    marginVertical: Spacing.xl,
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  pinLabel: {
    fontSize: Typography.fontBase,
    fontWeight: Typography.semiBold,
    marginBottom: Spacing.md,
  },
  pinContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  pinDigit: {
    width: 45,
    height: 54,
    borderRadius: Spacing.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDigitText: {
    fontSize: Typography.fontXl,
    fontWeight: Typography.bold,
  },
  pinHint: {
    fontSize: Typography.fontXs,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xl,
  },
  infoSection: {
    gap: Spacing.md,
  },
  infoTitle: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoText: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.medium,
  },
  instructions: {
    gap: Spacing.lg,
  },
  instructionsTitle: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
    marginBottom: Spacing.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  instructionBadge: {
    width: 25,
    height: 25,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionNumber: {
    fontSize: Typography.fontBase,
    fontWeight: Typography.bold,
    color: '#fff',
  },
  instructionText: {
    flex: 1,
    fontSize: Typography.fontBase,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  actionButtonSecondary: {
  },
  actionButtonText: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
  },
  actionButtonTextSecondary: {
  },
  note: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  noteText: {
    flex: 1,
    fontSize: Typography.fontSm,
    lineHeight: 16,
  },
});
