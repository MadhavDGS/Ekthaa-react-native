/**
 * Dashboard Screen - PhonePe/GPay/Paytm Style
 * 4-column grid like real payment apps
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, AvatarColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getDashboard();
      console.log('📊 Dashboard data:', data);
      setSummary(data);
    } catch (error) {
      console.error('❌ Dashboard error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${amount?.toLocaleString('en-IN') || 0}`;

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: Colors.backgroundSecondary }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Use correct field names from API: summary.total_credit and summary.total_payment
  const summaryData = summary?.summary || summary;
  const netBalance = (summaryData?.total_credit || 0) - (summaryData?.total_payment || 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadDashboard} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { backgroundColor: Colors.primary }]}>
        <Text style={styles.heroLabel}>Net Balance</Text>
        <Text style={styles.heroAmount}>{formatCurrency(Math.abs(netBalance))}</Text>
        <Text style={styles.heroSub}>{netBalance >= 0 ? 'You will receive' : 'You will give'}</Text>
        <View style={styles.heroRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>To Receive</Text>
            <Text style={styles.heroStatValue}>{formatCurrency(summaryData?.total_credit || 0)}</Text>
          </View>
          <View style={styles.heroDiv} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>To Give</Text>
            <Text style={styles.heroStatValue}>{formatCurrency(summaryData?.total_payment || 0)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.action} onPress={() => navigation.navigate('Customers')}>
          <View style={[styles.actionIcon, { backgroundColor: isDark ? '#4c1d95' : '#e9d5ff' }]}>
            <Ionicons name="people" size={16} color={Colors.primary} />
          </View>
          <Text style={[styles.actionLabel, { color: Colors.textPrimary }]}>Customers</Text>
          <Text style={[styles.actionCount, { color: Colors.primary }]}>{summaryData?.total_customers || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={() => navigation.navigate('Products')}>
          <View style={[styles.actionIcon, { backgroundColor: isDark ? '#7c2d12' : '#fed7aa' }]}>
            <Ionicons name="cube" size={16} color={Colors.orange} />
          </View>
          <Text style={[styles.actionLabel, { color: Colors.textPrimary }]}>Products</Text>
          <Text style={[styles.actionCount, { color: Colors.primary }]}>{summary?.totalProducts || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={() => navigation.navigate('Transactions')}>
          <View style={[styles.actionIcon, { backgroundColor: isDark ? '#064e3b' : '#a7f3d0' }]}>
            <Ionicons name="receipt" size={16} color={Colors.paymentGreen} />
          </View>
          <Text style={[styles.actionLabel, { color: Colors.textPrimary }]}>Transactions</Text>
          <Text style={[styles.actionCount, { color: Colors.primary }]}>{summary?.totalTransactions || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={() => navigation.navigate('AddCustomer')}>
          <View style={[styles.actionIcon, { backgroundColor: isDark ? '#831843' : '#fbcfe8' }]}>
            <Ionicons name="person-add" size={16} color={isDark ? '#f9a8d4' : '#db2777'} />
          </View>
          <Text style={[styles.actionLabel, { color: Colors.textPrimary }]}>Add New</Text>
        </TouchableOpacity>
      </View>

      {summaryData?.recent_customers?.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Recent Customers</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Customers')}>
              <Text style={[styles.viewAll, { color: Colors.primary }]}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.list, { backgroundColor: Colors.card }]}>
            {summaryData.recent_customers.slice(0, 6).map((c: any, i: number) => (
              <TouchableOpacity key={c.id} style={[styles.item, { borderBottomColor: Colors.borderLight }]} onPress={() => navigation.navigate('CustomerDetails', { customer: c })}>
                <View style={[styles.avatar, { backgroundColor: getColor(i, isDark) }]}>
                  <Text style={styles.avatarText}>{c.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: Colors.textPrimary }]}>{c.name}</Text>
                  <Text style={[styles.itemBalance, { color: c.balance > 0 ? Colors.creditGreen : Colors.creditRed }]}>
                    {c.balance > 0 ? '+' : ''}{formatCurrency(Math.abs(c.balance || 0))}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={13} color={Colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const getColor = (i: number, isDark: boolean) => {
  const color = AvatarColors[i % 10];
  return isDark ? color.bgDark : color.bg;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 90 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: {
    margin: Spacing.md,
    marginTop: Spacing.xs,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Platform.select({
      ios: { shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 9 },
      android: { elevation: 8 },
    }),
  },
  heroLabel: { fontSize: Typography.font3xs, color: 'rgba(255,255,255,0.9)', fontWeight: Typography.medium, marginBottom: Spacing.xs },
  heroAmount: { fontSize: Typography.font2xl, fontWeight: Typography.extraBold, color: '#fff', letterSpacing: -1, marginBottom: Spacing.xs },
  heroSub: { fontSize: Typography.font3xs, color: 'rgba(255,255,255,0.85)', fontWeight: Typography.medium, marginBottom: Spacing.lg },
  heroRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.md, padding: BorderRadius.md },
  heroStat: { flex: 1, alignItems: 'center' },
  heroDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: Spacing.sm },
  heroStatLabel: { fontSize: Typography.font3xs, color: 'rgba(255,255,255,0.85)', marginBottom: Spacing.xs, fontWeight: Typography.medium },
  heroStatValue: { fontSize: Typography.fontSm, fontWeight: Typography.bold, color: '#fff' },
  actions: { flexDirection: 'row', paddingHorizontal: Spacing.md, justifyContent: 'space-between', marginTop: Spacing.xs },
  action: { alignItems: 'center', width: (width - 46) / 4 },
  actionIcon: {
    width: (width - 46) / 4 - 5,
    height: (width - 46) / 4 - 5,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
      android: { elevation: 3 },
    }),
  },
  actionLabel: { fontSize: Typography.font3xs, fontWeight: Typography.semiBold, textAlign: 'center', marginBottom: 2 },
  actionCount: { fontSize: Typography.fontSm, fontWeight: Typography.bold },
  section: { marginTop: Spacing.lg, paddingHorizontal: Spacing.md },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: Typography.fontBase, fontWeight: Typography.bold },
  viewAll: { fontSize: Typography.font3xs, fontWeight: Typography.semiBold },
  list: {
    borderRadius: BorderRadius.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  item: { flexDirection: 'row', alignItems: 'center', padding: BorderRadius.md, borderBottomWidth: 1 },
  avatar: { width: 29, height: 29, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm },
  avatarText: { fontSize: Typography.fontSm, fontWeight: Typography.bold, color: '#fff' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: Typography.fontXs, fontWeight: Typography.semiBold, marginBottom: 2 },
  itemBalance: { fontSize: Typography.font3xs, fontWeight: Typography.semiBold },
});
