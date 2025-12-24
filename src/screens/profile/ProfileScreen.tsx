/**
 * Profile Screen - Unified Business & Profile Management
 * Combines profile settings, business tools, and preferences
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Switch,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { SkeletonHeader, SkeletonCard } from '../../components/Skeletons';
import ApiService from '../../services/api';
import { User } from '../../types';

export default function ProfileScreen({ navigation }: any) {
  const { isDark, themeMode, setThemeMode } = useTheme();
  const Colors = getThemedColors(isDark);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      const data = await ApiService.getProfile();
      console.log('📡 Profile API response:', JSON.stringify(data, null, 2));
      // Backend returns { business: {...} }, not { user: {...} }
      if (data.business) {
        setUser(data.business);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  const handleShareApp = async () => {
    try {
      const result = await Share.share({
        message: 'Check out Ekthaa - Your Digital Business Ledger! 📊\n\nManage customers, transactions, and inventory with ease.\n\nDownload now: https://ekthaa.com/download',
        title: 'Share Ekthaa App',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared via activity type
          console.log('Shared via:', result.activityType);
        } else {
          // Shared successfully
          console.log('App shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // User dismissed the share dialog
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing app:', error);
      Alert.alert('Error', 'Unable to share the app. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
        <ScrollView style={styles.content}>
          {/* Profile Header Skeleton */}
          <View style={[styles.profileHeader, { backgroundColor: Colors.card }]}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', marginBottom: 12 }} />
            <View style={{ width: 140, height: 20, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4, marginBottom: 8 }} />
            <View style={{ width: 100, height: 14, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4 }} />
          </View>

          {/* Stats Skeleton */}
          <View style={[styles.statsContainer, { backgroundColor: Colors.card }]}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.statCard}>
                <View style={{ width: 40, height: 24, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4, marginBottom: 6 }} />
                <View style={{ width: 60, height: 12, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4 }} />
              </View>
            ))}
          </View>

          {/* Menu Sections Skeleton */}
          <View style={styles.section}>
            <View style={{ width: 80, height: 16, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4, marginBottom: 12 }} />
            {[1, 2].map((i) => (
              <View key={i} style={[styles.settingCard, { backgroundColor: Colors.card, marginBottom: 8 }]}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <View style={{ width: 100, height: 14, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4 }} />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={{ width: 80, height: 16, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4, marginBottom: 12 }} />
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.settingCard, { backgroundColor: Colors.card, marginBottom: 8 }]}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <View style={{ width: 120, height: 14, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4 }} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]} edges={['top']}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
        }
      >
        {/* Profile Header (Minimal) */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarLarge, { backgroundColor: Colors.primary }]}>
            <Text style={[styles.avatarLargeText, { color: '#fff' }]}>
              {user?.name?.charAt(0).toUpperCase() || 'B'}
            </Text>
          </View>
          <Text style={[styles.businessName, { color: Colors.textPrimary }]}>{user?.name || 'Business Name'}</Text>
          <View style={styles.phoneRow}>
            <Ionicons name="call" size={12} color={Colors.textSecondary} />
            <Text style={[styles.phoneNumber, { color: Colors.textSecondary }]}>{user?.phone_number || 'N/A'}</Text>
          </View>
          {user?.latitude && user?.longitude && (
            <View style={styles.phoneRow}>
              <Ionicons name="location" size={12} color={Colors.textSecondary} />
              <Text style={[styles.phoneNumber, { color: Colors.textSecondary }]}>
                Business Location Set
              </Text>
            </View>
          )}
        </View>

        {/* Stats Cards */}
        <View style={[styles.statsContainer, { backgroundColor: Colors.card }]}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{user?.total_customers || 0}</Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Customers</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: Colors.borderLight }]} />
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{user?.total_transactions || 0}</Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Transactions</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: Colors.borderLight }]} />
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {user?.$createdAt ? new Date(user.$createdAt).getFullYear() : '--'}
            </Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Since</Text>
          </View>
        </View>

        {/* Business Location Map */}
        {user?.latitude && user?.longitude && (
          <View style={[styles.section, { backgroundColor: Colors.card }]}>
            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Business Location</Text>
            <MapView
              style={styles.mapPreview}
              region={{
                latitude: user.latitude,
                longitude: user.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={{ latitude: user.latitude, longitude: user.longitude }} />
            </MapView>
            <Text style={[styles.mapCoordinates, { color: Colors.textSecondary }]}>
              {user.latitude.toFixed(6)}, {user.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {/* Business Tools Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Business Tools</Text>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]} onPress={() => navigation.navigate('QRCode')}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.2)' : 'rgba(90, 154, 142, 0.1)' }]}>
              <Ionicons name="qr-code" size={17} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Payment QR Code</Text>
              <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>Share your payment QR</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]} onPress={() => navigation.navigate('Analytics')}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? '#1e3a8a' : Colors.bgLightBlue }]}>
              <Ionicons name="document-text" size={17} color={Colors.blue} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Reports & Analytics</Text>
              <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>View business insights</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]} onPress={() => navigation.navigate('Offers')}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? '#064e3b' : Colors.bgLightGreen }]}>
              <Ionicons name="pricetag" size={17} color={Colors.paymentGreen} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Offers & Promotions</Text>
              <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>Manage special offers</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Appearance</Text>

          <View style={[styles.settingCard, { backgroundColor: Colors.card }]}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.2)' : 'rgba(90, 154, 142, 0.1)' }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={17} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Dark Mode</Text>
            </View>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
              trackColor={{ false: Colors.borderLight, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Settings</Text>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]} onPress={() => navigation.navigate('EditProfile', { user })}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.2)' : 'rgba(90, 154, 142, 0.1)' }]}>
              <Ionicons name="person" size={17} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? '#1e3a8a' : Colors.bgLightBlue }]}>
              <Ionicons name="business" size={17} color={Colors.blue} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Business Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.settingCard, { backgroundColor: Colors.card }]}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? '#064e3b' : Colors.bgLightGreen }]}>
              <Ionicons name="notifications" size={17} color={Colors.paymentGreen} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Notifications</Text>
              <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>Transaction alerts</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.borderLight, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]} onPress={() => Alert.alert('Language', 'Multiple languages coming soon!')}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? '#1e3a8a' : 'rgba(6, 182, 212, 0.15)' }]}>
              <Ionicons name="language" size={17} color={Colors.blue} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Language</Text>
              <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>English</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]} onPress={() => navigation.navigate('PrivacySecurity')}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? '#7c2d12' : Colors.bgLightOrange }]}>
              <Ionicons name="shield-checkmark" size={17} color={Colors.orange} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Privacy & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Help & Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Help & Support</Text>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]} onPress={handleShareApp}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? '#831843' : 'rgba(236, 72, 153, 0.15)' }]}>
              <Ionicons name="share-social" size={17} color={isDark ? '#f9a8d4' : '#ec4899'} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Share App</Text>
              <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>Invite friends to Ekthaa</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]} onPress={() => Alert.alert('Support', 'Email: support@ekthaa.com\nPhone: +91 98765 43210')}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? '#064e3b' : 'rgba(20, 184, 166, 0.15)' }]}>
              <Ionicons name="help-circle" size={17} color={isDark ? '#5eead4' : '#14b8a6'} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Help & Support</Text>
              <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>Get help or contact us</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]} onPress={() => Alert.alert('Ekthaa', 'Version 1.0.0\nDigital Ledger for Everyone')}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? '#312e81' : 'rgba(99, 102, 241, 0.15)' }]}>
              <Ionicons name="information-circle" size={17} color={isDark ? '#a5b4fc' : '#6366f1'} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.settingText, { color: Colors.textPrimary }]}>About</Text>
              <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>Version 1.0.0</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: isDark ? 'rgba(248, 113, 113, 0.2)' : 'rgba(239, 68, 68, 0.1)' }]} onPress={handleLogout}>
          <Ionicons name="log-out" size={14} color={Colors.creditRed} />
          <Text style={[styles.logoutText, { color: Colors.creditRed }]}>Logout</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: Colors.textSecondary }]}>Made with ❤️ for small businesses</Text>
          <Text style={[styles.footerSubtext, { color: Colors.textTertiary }]}>Ekthaa - Digital Ledger for Everyone</Text>
        </View>

        {/* Version */}
        <Text style={[styles.versionText, { color: Colors.textTertiary }]}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  avatarLarge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarLargeText: {
    fontSize: 23,
    fontFamily: Typography.fonts.bold,
  },
  businessName: {
    fontSize: Typography.fontXl,
    fontFamily: Typography.fonts.bold,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  phoneNumber: {
    fontSize: Typography.fontXs,
    marginLeft: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
  },
  editText: {
    color: '#fff',
    fontSize: Typography.fontXs,
    fontFamily: Typography.fonts.semiBold,
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontLg,
    fontFamily: Typography.fonts.bold,
  },
  statLabel: {
    fontSize: Typography.fontXs,
    marginTop: Spacing.xs,
  },
  divider: {
    width: 1,
    marginHorizontal: Spacing.md,
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontBase,
    fontFamily: Typography.fonts.semiBold,
    marginBottom: Spacing.sm,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingIcon: {
    width: 29,
    height: 29,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  menuContent: {
    flex: 1,
  },
  settingText: {
    fontSize: Typography.fontBase,
    fontFamily: Typography.fonts.medium,
  },
  menuSubtitle: {
    fontSize: Typography.fontXs,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xl,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  logoutText: {
    fontSize: Typography.fontBase,
    fontFamily: Typography.fonts.semiBold,
    marginLeft: Spacing.xs,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  footerText: {
    fontSize: Typography.fontBase,
    fontFamily: Typography.fonts.medium,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: Typography.fontXs,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  versionText: {
    textAlign: 'center',
    fontSize: Typography.fontXs,
    marginTop: Spacing.md,
  },
});
