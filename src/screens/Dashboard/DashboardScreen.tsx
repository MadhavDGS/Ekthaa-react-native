/**
* Dashboard Screen - PhonePe/GPay/Paytm Style
* 4-column grid like real payment apps
*/

import React, { useState, useEffect, useMemo } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, AvatarColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AvatarSizes, IconSizes, TextScale, SpacingScale } from '../../constants/scales';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const Colors = getThemedColors(isDark);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [businessName, setBusinessName] = useState('Business Account');
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Memoize today's transaction calculations - MUST be before conditional returns
  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayTxns = recentTransactions.filter(t => {
      const txDate = new Date(t.created_at || t.$createdAt).toDateString();
      return today === txDate;
    });

    return {
      count: todayTxns.length,
      credits: todayTxns
        .filter(t => t.transaction_type === 'credit')
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      payments: todayTxns
        .filter(t => t.transaction_type === 'payment')
        .reduce((sum, t) => sum + (t.amount || 0), 0),
    };
  }, [recentTransactions]);

  useEffect(() => {
    let isMounted = true;

    // Hide header for seamless gradient
    navigation.setOptions({
      headerShown: false,
    });

    const loadData = async () => {
      if (isMounted) {
        // Load cached data first for instant display
        await loadCachedData();
        // Then load fresh data in parallel
        await loadDashboard();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadCachedData = async () => {
    try {
      // Load cached dashboard data for instant display
      const cachedDashboard = await AsyncStorage.getItem('dashboard_cache');
      const cachedTransactions = await AsyncStorage.getItem('transactions_cache');
      const userData = await AsyncStorage.getItem('userData');

      if (cachedDashboard) {
        const data = JSON.parse(cachedDashboard);
        setSummary(data);
        if (data?.business?.name) {
          setBusinessName(data.business.name);
        } else if (data?.summary?.business_name) {
          setBusinessName(data.summary.business_name);
        }
      }

      if (cachedTransactions) {
        const transactions = JSON.parse(cachedTransactions);
        setRecentTransactions(transactions.slice(0, 5));
      }

      if (userData) {
        const user = JSON.parse(userData);
        if (user?.business_name || user?.name) {
          setBusinessName(user.business_name || user.name);
        }
      }

      // If we have cached data, show it and mark as not loading
      if (cachedDashboard || cachedTransactions) {
        setLoading(false);
      }
    } catch (error) {
      console.log('Could not load cached data:', error);
    }
  };

  const loadDashboard = async () => {
    try {
      // If this is a refresh (not initial load), show loading
      if (!loading) {
        setLoading(true);
      }

      // Make all API calls in PARALLEL (much faster!)
      const [dashboardData, profileData, transactionsData] = await Promise.allSettled([
        ApiService.getDashboard(),
        ApiService.getProfile(),
        ApiService.getTransactions()
      ]);

      // Process dashboard data
      if (dashboardData.status === 'fulfilled') {
        const data = dashboardData.value;
        console.log('📊 Dashboard data:', data);
        setSummary(data);

        // Cache dashboard data
        await AsyncStorage.setItem('dashboard_cache', JSON.stringify(data));

        // Set business name from dashboard
        if (data?.business?.name) {
          setBusinessName(data.business.name);
        } else if (data?.summary?.business_name) {
          setBusinessName(data.summary.business_name);
        }
      }

      // Process profile data
      if (profileData.status === 'fulfilled') {
        const profile = profileData.value;
        if (profile?.user?.business_name || profile?.user?.name) {
          const name = profile.user.business_name || profile.user.name;
          setBusinessName(name);
          
          // Update cached userData
          const userData = await AsyncStorage.getItem('userData');
          if (userData) {
            const user = JSON.parse(userData);
            user.business_name = name;
            await AsyncStorage.setItem('userData', JSON.stringify(user));
          }
        }
      }

      // Process transactions data
      if (transactionsData.status === 'fulfilled') {
        const txns = transactionsData.value;
        if (txns?.transactions) {
          const recent = txns.transactions.slice(0, 5);
          setRecentTransactions(recent);
          
          // Cache transactions
          await AsyncStorage.setItem('transactions_cache', JSON.stringify(txns.transactions));
        }
      }

    } catch (error) {
      console.error('❌ Dashboard error:', error);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${amount?.toLocaleString('en-IN') || 0}`;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <LinearGradient
          colors={['#5A9A8E', '#4A7D73', '#3A6A60', '#2A5550']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.4, 0.7, 1]}
          style={styles.gradientHeader}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerTitle}>
              <Text style={styles.appTitle}>Ekthaa</Text>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            </View>
          </SafeAreaView>

          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={{ width: 120, height: 14, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4 }} />
            </View>
            <View style={{ width: 140, height: 36, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 6, marginTop: 8 }} />
            <View style={{ width: 100, height: 12, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginTop: 8 }} />

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={{ width: 60, height: 12, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4, marginBottom: 4 }} />
                <View style={{ width: 70, height: 16, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 4 }} />
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={{ width: 60, height: 12, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4, marginBottom: 4 }} />
                <View style={{ width: 70, height: 16, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 4 }} />
              </View>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={[styles.content, { backgroundColor: Colors.background }]}>
          <View style={styles.actionCards}>
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
                <Ionicons name="people-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ width: 60, height: 12, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4, marginTop: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
                <Ionicons name="cube-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ width: 60, height: 12, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4, marginTop: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
                <Ionicons name="receipt-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ width: 60, height: 12, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4, marginTop: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
                <Ionicons name="person-add-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ width: 60, height: 12, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4, marginTop: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
                <Ionicons name="document-text-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ width: 60, height: 12, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4, marginTop: 8 }} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Use correct field names from API: summary.total_credit and summary.total_payment
  const summaryData = summary?.summary || summary;
  const netBalance = (summaryData?.total_credit || 0) - (summaryData?.total_payment || 0);

  // Error state UI
  if (error && !loading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.textSecondary} />
        <Text style={{ color: Colors.textPrimary, marginTop: 16, fontSize: 18, textAlign: 'center', fontWeight: '600' }}>{error}</Text>
        <TouchableOpacity
          onPress={() => {
            setError(null);
            loadDashboard();
          }}
          style={{ marginTop: 20, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
        >
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <LinearGradient
        colors={['#5A9A8E', '#4A7D73', '#3A6A60', '#2A5550']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.4, 0.7, 1]}
        style={styles.gradientHeader}
      >
        {/* Seamless Teal Header */}
        <SafeAreaView edges={['top']} style={Platform.OS === 'web' && { paddingTop: 0 }}>
          <View style={styles.headerTitle}>
            <Text style={styles.appTitle}>Ekthaa</Text>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.getParent()?.navigate('Profile')}
              activeOpacity={0.7}
            >
              <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.accountLabel}>{businessName}</Text>
          </View>
          <Text style={styles.balanceAmount}>{formatCurrency(Math.abs(netBalance))}</Text>
          <Text style={styles.balanceSubtext}>{netBalance >= 0 ? 'You will receive' : 'You will give'}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>To Receive</Text>
              <Text style={styles.statValue}>{formatCurrency(summaryData?.total_credit || 0)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>To Give</Text>
              <Text style={styles.statValue}>{formatCurrency(summaryData?.total_payment || 0)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Content Area */}
      <ScrollView
        style={[styles.content, { backgroundColor: Colors.background }]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadDashboard} colors={[Colors.primary]} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Action Cards */}
        <View style={styles.actionCards}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('More')}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
              <Ionicons name="people-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={[styles.cardLabel, { color: Colors.textPrimary }]}>Customers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Products')}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
              <Ionicons name="cube-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={[styles.cardLabel, { color: Colors.textPrimary }]}>Products</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('More')}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
              <Ionicons name="receipt-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={[styles.cardLabel, { color: Colors.textPrimary }]}>Transactions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AddCustomer')}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
              <Ionicons name="person-add-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={[styles.cardLabel, { color: Colors.textPrimary }]}>Add New</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('InvoiceGenerator')}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
              <Ionicons name="document-text-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={[styles.cardLabel, { color: Colors.textPrimary }]}>Invoice</Text>
          </TouchableOpacity>
        </View>

        {/* Modern Daily Summary Card */}
        <View style={[styles.modernSummaryCard, { backgroundColor: Colors.card }]}>
          <View style={styles.summaryTitleRow}>
            <View>
              <Text style={[styles.modernSummaryTitle, { color: Colors.textPrimary }]}>Today's Activity</Text>
              <Text style={[styles.modernSummarySubtitle, { color: Colors.textSecondary }]}>
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </View>
          </View>

          <View style={styles.modernStatsGrid}>
            {/* Transactions Count */}
            <View style={[styles.modernStatCard, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.12)' : '#E8F5F3' }]}>
              <View style={[styles.modernStatIconContainer, { backgroundColor: Colors.primary }]}>
                <Ionicons name="swap-horizontal" size={16} color="#fff" />
              </View>
              <Text style={[styles.modernStatValue, { color: Colors.primary }]}>
                {todayStats.count}
              </Text>
              <Text style={[styles.modernStatLabel, { color: Colors.textSecondary }]}>Transactions</Text>
            </View>

            {/* Credits */}
            <View style={[styles.modernStatCard, { backgroundColor: isDark ? 'rgba(220, 38, 38, 0.12)' : '#FEE2E2' }]}>
              <View style={[styles.modernStatIconContainer, { backgroundColor: '#dc2626' }]}>
                <Ionicons name="arrow-down" size={16} color="#fff" />
              </View>
              <Text style={[styles.modernStatValue, { color: '#dc2626' }]}>
                ₹{todayStats.credits.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.modernStatLabel, { color: Colors.textSecondary }]}>Credits</Text>
            </View>

            {/* Payments */}
            <View style={[styles.modernStatCard, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : '#DCFCE7' }]}>
              <View style={[styles.modernStatIconContainer, { backgroundColor: '#22c55e' }]}>
                <Ionicons name="arrow-up" size={16} color="#fff" />
              </View>
              <Text style={[styles.modernStatValue, { color: '#22c55e' }]}>
                ₹{todayStats.payments.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.modernStatLabel, { color: Colors.textSecondary }]}>Payments</Text>
            </View>
          </View>
        </View>

        {/* Recent Customers */}
        {summaryData?.recent_customers?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Recent Activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate('More')}>
                <Text style={[styles.viewAll, { color: Colors.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.customerList}>
              {summaryData.recent_customers.slice(0, 5).map((c: any, i: number) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.customerItem, { backgroundColor: Colors.card }]}
                  onPress={() => navigation.navigate('CustomerDetails', { customer: c })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.customerAvatar, { backgroundColor: getColor(i, isDark) }]}>
                    <Text style={styles.customerAvatarText}>{c.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.customerInfo}>
                    <Text style={[styles.customerName, { color: Colors.textPrimary }]} numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text style={[styles.customerBalance, {
                      color: c.balance > 0 ? Colors.creditGreen : Colors.creditRed
                    }]}>
                      {c.balance > 0 ? '+' : ''}{formatCurrency(Math.abs(c.balance || 0))}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

    </View>
  );
}

const getColor = (i: number, isDark: boolean) => {
  const color = AvatarColors[i % 10];
  return isDark ? color.bgDark : color.bg;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientHeader: {
    paddingBottom: Spacing.md,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5A9A8E',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  headerTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
    }),
  },
  profileButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTop: {
    marginBottom: Spacing.lg,
  },
  accountLabel: {
    fontSize: Typography.fontXs,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: Typography.fonts.semiBold,
  },
  balanceAmount: {
    fontSize: 40,
    fontFamily: Typography.fonts.extraBold,
    color: '#ffffff',
    marginBottom: Spacing.xs,
    letterSpacing: -1.5,
  },
  balanceSubtext: {
    fontSize: Typography.fontXs,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: Spacing.lg,
    fontFamily: Typography.fonts.medium,
  },
  statsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: Spacing.md,
  },
  statLabel: {
    fontSize: Typography.font3xs,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 4,
    fontFamily: Typography.fonts.medium,
  },
  statValue: {
    fontSize: Typography.fontBase,
    fontFamily: Typography.fonts.bold,
    color: '#ffffff',
  },
  content: {
    flex: 1,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    marginTop: -20,
  },
  contentContainer: {
    paddingBottom: 95,
  },
  actionCards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SpacingScale.sectionPadding,
    paddingVertical: SpacingScale.verticalSection,
  },
  actionCard: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  cardLabel: {
    fontSize: TextScale.cardLabel,
    fontFamily: Typography.fonts.semiBold,
  },
  section: {
    paddingHorizontal: SpacingScale.sectionPadding,
    paddingTop: SpacingScale.verticalSection,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: TextScale.sectionTitle,
    fontFamily: Typography.fonts.bold,
  },
  viewAll: {
    fontSize: Typography.fontSm,
    fontFamily: Typography.fonts.semiBold,
  },
  customerList: {
    gap: Spacing.xs,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 8
      },
      android: { elevation: 2 },
    }),
  },
  customerAvatar: {
    width: AvatarSizes.medium,
    height: AvatarSizes.medium,
    borderRadius: AvatarSizes.medium / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerAvatarText: {
    fontSize: TextScale.listTitle,
    fontFamily: Typography.fonts.bold,
    color: '#ffffff',
  },
  customerInfo: {
    flex: 1,
    gap: 2,
  },
  customerName: {
    fontSize: TextScale.listTitle,
    fontFamily: Typography.fonts.semiBold,
  },
  customerBalance: {
    fontSize: TextScale.listSubtitle,
    fontFamily: Typography.fonts.bold,
  },
  // Modern Summary Card Styles
  modernSummaryCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  summaryTitleRow: {
    marginBottom: Spacing.md,
  },
  modernSummaryTitle: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
    marginBottom: 2,
  },
  modernSummarySubtitle: {
    fontSize: Typography.fontXs,
  },
  modernStatsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modernStatCard: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    gap: 6,
  },
  modernStatIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernStatValue: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
  },
  modernStatLabel: {
    fontSize: Typography.font3xs,
    textAlign: 'center',
  },
  // Transaction Styles (Removed - not used anymore)
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
      android: { elevation: 1 },
    }),
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCustomer: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: Typography.fontXs,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
    marginBottom: 2,
  },
  transactionType: {
    fontSize: Typography.fontXs,
  },
});