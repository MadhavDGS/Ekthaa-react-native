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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      const data = await ApiService.getProfile();
      setUser(data.user);
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

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
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
        {/* Profile Header Card */}
        <View style={[styles.profileHeader, { backgroundColor: Colors.primary, ...Platform.select({ ios: { shadowColor: Colors.primary }, android: {} }) }]}>
          <View style={[styles.avatarLarge, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)' }]}>
            <Text style={[styles.avatarLargeText, { color: '#fff' }]}>
              {user?.business_name?.charAt(0).toUpperCase() || 'B'}
            </Text>
          </View>
          <Text style={[styles.businessName, { color: '#fff' }]}>{user?.business_name || 'Business Name'}</Text>
          <View style={styles.phoneRow}>
            <Ionicons name="call" size={10} color="rgba(255,255,255,0.9)" />
            <Text style={[styles.phoneNumber, { color: 'rgba(255,255,255,0.95)' }]}>{user?.phone_number || 'N/A'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={13} color="#fff" />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={[styles.statsContainer, { backgroundColor: Colors.card }]}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>--</Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Customers</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: Colors.borderLight }]} />
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>--</Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Products</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: Colors.borderLight }]} />
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>--</Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Since</Text>
          </View>
        </View>

        {/* Business Tools Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Business Tools</Text>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]} onPress={() => navigation.navigate('QRCode')}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? '#4c1d95' : Colors.bgLightPurple }]}>
              <Ionicons name="qr-code" size={17} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Payment QR Code</Text>
              <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>Share your payment QR</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]} onPress={() => Alert.alert('Coming Soon', 'Reports feature coming soon!')}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? '#1e3a8a' : Colors.bgLightBlue }]}>
              <Ionicons name="document-text" size={17} color={Colors.blue} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.settingText, { color: Colors.textPrimary }]}>Reports & Analytics</Text>
              <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>View business insights</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]} onPress={() => Alert.alert('Coming Soon', 'Offers feature coming soon!')}>
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
            <View style={[styles.settingIcon, { backgroundColor: isDark ? '#4c1d95' : Colors.bgLightPurple }]}>
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

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? '#4c1d95' : Colors.bgLightPurple }]}>
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

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]}>
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

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: Colors.card }]} onPress={() => Alert.alert('Share', 'Share Ekthaa with friends!')}>
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
    borderRadius: BorderRadius.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    fontWeight: 'bold',
  },
  businessName: {
    fontSize: Typography.fontXl,
    fontWeight: 'bold',
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
    fontWeight: '600',
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
    fontWeight: 'bold',
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
    fontWeight: '600',
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
    fontWeight: '500',
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
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  footerText: {
    fontSize: Typography.fontBase,
    fontWeight: '500',
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
