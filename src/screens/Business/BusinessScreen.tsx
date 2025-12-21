/**
 * Business Screen - GPay/PhonePe Style
 * Polished settings and profile UI
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../services/api';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export default function BusinessScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getProfile();
      console.log('💼 Profile loaded:', data.business?.name);
      setProfile(data.business || {});
    } catch (error) {
      console.error('❌ Load profile error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            navigation.replace('Auth', { screen: 'Login' });
          },
        },
      ]
    );
  };

  const MenuItem = ({ icon, title, subtitle, color, onPress, showChevron = true }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: Colors.textPrimary }]}>{title}</Text>
        {subtitle && <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={18} color="#d1d5db" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={() => { setRefreshing(true); loadProfile(); }}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      <View style={[styles.profileCard, { backgroundColor: Colors.primary, ...Platform.select({ ios: { shadowColor: Colors.primary }, android: {} }) }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.name?.charAt(0)?.toUpperCase() || 'B'}</Text>
        </View>
        <Text style={styles.businessName}>{profile?.name || 'Business'}</Text>
        <View style={styles.phoneRow}>
          <Ionicons name="call" size={13} color="rgba(255,255,255,0.9)" />
          <Text style={styles.phoneText}>{profile?.phone_number || 'Not Set'}</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Business Tools</Text>
        <View style={[styles.menu, { backgroundColor: Colors.card }]}>
          <MenuItem
            icon="document-text-outline"
            title="Reports & Analytics"
            subtitle="View detailed business insights"
            color="#3b82f6"
            onPress={() => Alert.alert('Coming Soon', 'Reports feature coming soon!')}
          />
          <View style={[styles.divider, { backgroundColor: Colors.borderLight }]} />
          <MenuItem
            icon="qr-code-outline"
            title="Payment QR Code"
            subtitle="Share your payment QR"
            color={Colors.primary}
            onPress={() => navigation.navigate('QRCode')}
          />
          <View style={[styles.divider, { backgroundColor: Colors.borderLight }]} />
          <MenuItem
            icon="pricetag-outline"
            title="Offers & Promotions"
            subtitle="Manage special offers"
            color="#10b981"
            onPress={() => Alert.alert('Coming Soon', 'Offers feature coming soon!')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Preferences</Text>
        <View style={[styles.menu, { backgroundColor: Colors.card }]}>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={[styles.menuIcon, { backgroundColor: '#8b5cf615' }]}>
              <Ionicons name="notifications-outline" size={24} color="#8b5cf6" />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: Colors.textPrimary }]}>Notifications</Text>
              <Text style={[styles.menuSubtitle, { color: Colors.textSecondary }]}>Transaction alerts</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#d1d5db', true: Colors.primary + '60' }}
              thumbColor={notifications ? Colors.primary : '#f3f4f6'}
            />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: Colors.borderLight }]} />
          <MenuItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            color="#06b6d4"
            onPress={() => Alert.alert('Language', 'Multiple languages coming soon!')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Support</Text>
        <View style={[styles.menu, { backgroundColor: Colors.card }]}>
          <MenuItem
            icon="share-social-outline"
            title="Share App"
            subtitle="Invite friends to Ekthaa"
            color="#ec4899"
            onPress={() => Alert.alert('Share', 'Share Ekthaa with friends!')}
          />
          <View style={[styles.divider, { backgroundColor: Colors.borderLight }]} />
          <MenuItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help or contact support"
            color="#14b8a6"
            onPress={() => Alert.alert('Support', 'Email: support@ekthaa.com\nPhone: +91 98765 43210')}
          />
          <View style={[styles.divider, { backgroundColor: Colors.borderLight }]} />
          <MenuItem
            icon="information-circle-outline"
            title="About"
            subtitle="Version 1.0.0"
            color="#6366f1"
            onPress={() => Alert.alert('Ekthaa', 'Version 1.0.0\nDigital Ledger for Everyone')}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color="#dc2626" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: Colors.textSecondary }]}>Made with ❤️ for small businesses</Text>
        <Text style={[styles.footerSubtext, { color: Colors.textSecondary }]}>Ekthaa - Digital Ledger for Everyone</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 36 },
  profileCard: {
    margin: Spacing.lg,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    padding: Spacing.space6,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.25, shadowRadius: 9 },
      android: { elevation: 6 },
    }),
  },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  avatarText: { fontSize: Typography.font2xl, fontWeight: Typography.extraBold, color: '#fff' },
  businessName: { fontSize: Typography.fontXl, fontWeight: Typography.extraBold, color: '#fff', marginBottom: Spacing.sm },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.lg },
  phoneText: { fontSize: Typography.fontSm, color: 'rgba(255,255,255,0.95)', fontWeight: Typography.medium },
  editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, gap: Spacing.xs },
  editText: { fontSize: Typography.fontBase, fontWeight: Typography.semiBold, color: '#fff' },
  section: { marginTop: Spacing.sm, paddingHorizontal: Spacing.lg },
  sectionTitle: { fontSize: Typography.fontXs, fontWeight: Typography.bold, textTransform: 'uppercase', marginBottom: Spacing.md, marginLeft: Spacing.xs },
  menu: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg },
  menuIcon: { width: 43, height: 43, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: Typography.fontMd, fontWeight: Typography.semiBold, marginBottom: 2 },
  menuSubtitle: { fontSize: Typography.fontSm },
  divider: { height: 1, marginLeft: 70 },
  logoutButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.space6,
    borderRadius: BorderRadius.md,
    backgroundColor: '#fee2e2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    ...Platform.select({
      ios: { shadowColor: '#dc2626', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  logoutText: { fontSize: Typography.fontMd, fontWeight: Typography.bold, color: '#dc2626' },
  footer: { alignItems: 'center', marginTop: Spacing.space8, marginBottom: Spacing.lg },
  footerText: { fontSize: Typography.fontBase, marginBottom: Spacing.xs },
  footerSubtext: { fontSize: Typography.fontXs },
});
