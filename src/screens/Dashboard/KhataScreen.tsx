/**
 * Khata Screen - PhonePe/GPay Style Financial Dashboard
 * Modern payment app design with complete financial overview
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
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, AvatarColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';
import SvgIcon from '../../components/SvgIcon';
import Illustration from '../../components/Illustration';

const { width } = Dimensions.get('window');

export default function KhataScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [businessName, setBusinessName] = useState('Business Account');

  // Calculate today and this month stats - MUST be before conditional returns
  const { todayStats, monthStats } = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const todayTxns = recentTransactions.filter(t => {
      const txDate = new Date(t.created_at || t.$createdAt).getTime();
      return txDate >= todayStart && txDate < todayEnd;
    });

    const monthTxns = recentTransactions.filter(t => {
      const txDate = new Date(t.created_at || t.$createdAt);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    return {
      todayStats: {
        credits: todayTxns.filter(t => t.transaction_type === 'credit').reduce((sum, t) => sum + (t.amount || 0), 0),
        payments: todayTxns.filter(t => t.transaction_type === 'payment').reduce((sum, t) => sum + (t.amount || 0), 0),
        count: todayTxns.length,
      },
      monthStats: {
        credits: monthTxns.filter(t => t.transaction_type === 'credit').reduce((sum, t) => sum + (t.amount || 0), 0),
        payments: monthTxns.filter(t => t.transaction_type === 'payment').reduce((sum, t) => sum + (t.amount || 0), 0),
        count: monthTxns.length,
      },
    };
  }, [recentTransactions]);

  // Filter customers who owe money (negative balance means they owe us)
  const customersWhoOwe = useMemo(() => {
    return customers
      .filter(c => {
        const balance = c.balance || 0;
        return balance < 0; // Negative balance = customer owes money
      })
      .sort((a, b) => (a.balance || 0) - (b.balance || 0)) // Most negative first
      .slice(0, 5);
  }, [customers]);

  // Filtered customers based on search
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customersWhoOwe;
    return customers.filter(c =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone_number?.includes(searchQuery)
    );
  }, [customers, searchQuery, customersWhoOwe]);

  useEffect(() => {
    // Hide header for seamless gradient
    navigation.setOptions({
      headerShown: false,
    });
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load cached data first
      const [cachedDashboard, cachedTransactions, cachedCustomers, cachedProfile] = await Promise.all([
        AsyncStorage.getItem('dashboard_cache'),
        AsyncStorage.getItem('transactions_cache'),
        AsyncStorage.getItem('customers_cache'),
        AsyncStorage.getItem('userData'),
      ]);

      if (cachedDashboard) setSummary(JSON.parse(cachedDashboard));
      if (cachedTransactions) setRecentTransactions(JSON.parse(cachedTransactions));
      if (cachedCustomers) setCustomers(JSON.parse(cachedCustomers));
      if (cachedProfile) {
        const user = JSON.parse(cachedProfile);
        setBusinessName(user?.business_name || user?.name || 'Business Account');
      }

      // Load fresh data
      const [dashboardData, transactionsData, customersData] = await Promise.allSettled([
        ApiService.getDashboard(),
        ApiService.getTransactions(),
        ApiService.getCustomers(),
      ]);

      if (dashboardData.status === 'fulfilled') {
        setSummary(dashboardData.value);
        await AsyncStorage.setItem('dashboard_cache', JSON.stringify(dashboardData.value));
        if (dashboardData.value?.business?.name) {
          setBusinessName(dashboardData.value.business.name);
        }
      }

      if (transactionsData.status === 'fulfilled') {
        const txns = transactionsData.value.transactions || [];
        setRecentTransactions(txns);
        await AsyncStorage.setItem('transactions_cache', JSON.stringify(txns));
      }

      if (customersData.status === 'fulfilled') {
        const custs = customersData.value.customers || [];
        setCustomers(custs);
        await AsyncStorage.setItem('customers_cache', JSON.stringify(custs));
      }
    } catch (error) {
      console.error('Error loading khata data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(Math.round(amount)).toLocaleString('en-IN')}`;
  };

  const getColor = (i: number) => {
    const color = AvatarColors[i % 10];
    return isDark ? color.bgDark : color.bg;
  };

  if (loading && !summary) {
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
              <Text style={styles.appTitle}>Khata</Text>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={[styles.loadingContainer, { backgroundColor: Colors.background }]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  const summaryData = summary?.summary || summary;
  const toReceive = summaryData?.total_credit || 0;
  const toGive = summaryData?.total_payment || 0;
  const netBalance = toReceive - toGive;
  const customersCount = customers.length;

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      {/* Modern Gradient Header - PhonePe/GPay Style */}
      <LinearGradient
        colors={['#5A9A8E', '#4A7D73', '#3A6A60', '#2A5550']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.4, 0.7, 1]}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']} style={Platform.OS === 'web' && { paddingTop: 0 }}>
          <View style={styles.headerTitle}>
            <Text style={styles.appTitle}>Khata</Text>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
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
              <Text style={styles.statValue}>{formatCurrency(toReceive)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>To Give</Text>
              <Text style={styles.statValue}>{formatCurrency(toGive)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Content Area */}
      <ScrollView
        style={[styles.content, { backgroundColor: Colors.background }]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[Colors.primary]} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
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
                <SvgIcon name="transactionRecord" size={16} color="#fff" />
              </View>
              <Text style={[styles.modernStatValue, { color: Colors.primary }]}>
                {todayStats.count}
              </Text>
              <Text style={[styles.modernStatLabel, { color: Colors.textSecondary }]}>Transactions</Text>
            </View>

            {/* Credits */}
            <View style={[styles.modernStatCard, { backgroundColor: isDark ? 'rgba(220, 38, 38, 0.12)' : '#FEE2E2' }]}>
              <View style={[styles.modernStatIconContainer, { backgroundColor: '#dc2626' }]}>
                <SvgIcon name="deposit" size={16} color="#fff" />
              </View>
              <Text style={[styles.modernStatValue, { color: '#dc2626' }]}>
                ₹{todayStats.credits.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.modernStatLabel, { color: Colors.textSecondary }]}>Credits</Text>
            </View>

            {/* Payments */}
            <View style={[styles.modernStatCard, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : '#DCFCE7' }]}>
              <View style={[styles.modernStatIconContainer, { backgroundColor: '#22c55e' }]}>
                <SvgIcon name="savings" size={16} color="#fff" />
              </View>
              <Text style={[styles.modernStatValue, { color: '#22c55e' }]}>
                ₹{todayStats.payments.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.modernStatLabel, { color: Colors.textSecondary }]}>Payments</Text>
            </View>
          </View>
        </View>

        {/* This Month Summary */}
        <View style={[styles.modernSummaryCard, { backgroundColor: Colors.card }]}>
          <View style={styles.summaryTitleRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="calendar" size={20} color={Colors.textPrimary} />
              <Text style={[styles.modernSummaryTitle, { color: Colors.textPrimary }]}>This Month</Text>
            </View>
            <View style={[styles.monthBadge, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.2)' : '#E8F5F3' }]}>
              <Text style={[styles.monthBadgeText, { color: Colors.primary }]}>{monthStats.count} transactions</Text>
            </View>
          </View>

          <View style={styles.monthStatsRow}>
            <View style={styles.monthStat}>
              <Text style={[styles.monthStatLabel, { color: Colors.textSecondary }]}>Given</Text>
              <Text style={[styles.monthStatValue, { color: '#dc2626' }]}>₹{monthStats.credits.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.monthStat}>
              <Text style={[styles.monthStatLabel, { color: Colors.textSecondary }]}>Received</Text>
              <Text style={[styles.monthStatValue, { color: '#22c55e' }]}>₹{monthStats.payments.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.quickStatsGrid}>
          <TouchableOpacity
            style={[styles.quickStatCard, { backgroundColor: Colors.card }]}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <SvgIcon name="customerService" size={32} color={Colors.primary} />
            <View style={styles.quickStatData}>
              <Text style={[styles.quickStatValue, { color: Colors.textPrimary }]}>{customersCount}</Text>
              <Text style={[styles.quickStatLabel, { color: Colors.textSecondary }]}>Customers</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickStatCard, { backgroundColor: Colors.card }]}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <SvgIcon name="record" size={32} color="#8b5cf6" />
            <View style={styles.quickStatData}>
              <Text style={[styles.quickStatValue, { color: Colors.textPrimary }]}>{recentTransactions.length}</Text>
              <Text style={[styles.quickStatLabel, { color: Colors.textSecondary }]}>Transactions</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Customers */}
        <View style={[styles.searchCard, { backgroundColor: Colors.card }]}>
          <View style={[styles.searchBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }]}>
            <Ionicons name="search" size={20} color={Colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: Colors.textPrimary }]}
              placeholder="Search customers..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Customers Who Owe */}
        <View style={[styles.section, { backgroundColor: Colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
              {searchQuery ? 'Search Results' : 'Customers Who Owe You'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Customers')}>
              <Text style={[styles.viewAllText, { color: Colors.primary }]}>View All →</Text>
            </TouchableOpacity>
          </View>

          {filteredCustomers.length > 0 ? (
            <>
              {filteredCustomers.map((customer, index) => (
                <TouchableOpacity
                  key={customer.$id || customer.id || `customer-${customer.phone_number}`}
                  style={[styles.customerCard, { borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6' }]}
                  onPress={() => navigation.navigate('CustomerDetails', { customerId: customer.$id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.customerInfo}>
                    <View style={[styles.customerAvatar, { backgroundColor: getColor(index) }]}>
                      <Text style={styles.customerInitial}>
                        {customer.name?.[0]?.toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.customerName, { color: Colors.textPrimary }]}>{customer.name}</Text>
                      <Text style={[styles.customerPhone, { color: Colors.textSecondary }]}>{customer.phone_number}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.customerBalance, { color: '#ef4444' }]}>
                      {formatCurrency(customer.balance)}
                    </Text>
                    <Text style={[styles.dueLabel, { color: Colors.textTertiary }]}>Due</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Illustration name="happyCustomer" width={160} height={160} />
              <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
                {searchQuery ? 'No customers found' : 'All customers are settled!'}
              </Text>
              <Text style={[styles.emptySubtext, { color: Colors.textTertiary }]}>
                {searchQuery ? 'Try different search terms' : 'Great job managing your finances!'}
              </Text>
            </View>
          )}
        </View>

        {/* Recent Transactions */}
        <View style={[styles.section, { backgroundColor: Colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={[styles.viewAllText, { color: Colors.primary }]}>View All →</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.slice(0, 10).length > 0 ? (
            <>
              {recentTransactions.slice(0, 10).map((txn) => (
                <View key={txn.$id || txn.id || `txn-${Math.random()}`} style={[styles.txnCard, { borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6' }]}>
                  <View style={styles.txnLeft}>
                    <View
                      style={[
                        styles.txnIcon,
                        { backgroundColor: txn.transaction_type === 'credit' ? '#dc262615' : '#22c55e15' },
                      ]}
                    >
                      <Ionicons
                        name={txn.transaction_type === 'credit' ? 'arrow-down' : 'arrow-up'}
                        size={20}
                        color={txn.transaction_type === 'credit' ? '#dc2626' : '#22c55e'}
                      />
                    </View>
                    <View>
                      <Text style={[styles.txnCustomer, { color: Colors.textPrimary }]}>{txn.customer_name || 'Customer'}</Text>
                      <Text style={[styles.txnDate, { color: Colors.textSecondary }]}>
                        {new Date(txn.created_at || txn.$createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={[
                        styles.txnAmount,
                        { color: txn.transaction_type === 'credit' ? '#dc2626' : '#22c55e' },
                      ]}
                    >
                      {txn.transaction_type === 'credit' ? '-' : '+'}{formatCurrency(txn.amount)}
                    </Text>
                    <Text style={[styles.txnType, { color: Colors.textTertiary }]}>
                      {txn.transaction_type === 'credit' ? 'Credit' : 'Payment'}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Illustration name="onlinePayments" width={160} height={160} />
              <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>No transactions yet</Text>
              <Text style={[styles.emptySubtext, { color: Colors.textTertiary }]}>Start adding transactions to track your business</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientHeader: {
    paddingBottom: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  monthBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  monthBadgeText: {
    fontSize: Typography.font3xs,
    fontWeight: Typography.semiBold,
  },
  monthStatsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  monthStat: {
    flex: 1,
    alignItems: 'center',
  },
  monthStatLabel: {
    fontSize: Typography.fontSm,
    marginBottom: 4,
  },
  monthStatValue: {
    fontSize: Typography.fontLg,
    fontWeight: Typography.bold,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  quickStatCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  quickStatData: {
    flex: 1,
    alignItems: 'flex-start',
  },
  quickStatValue: {
    fontSize: Typography.fontXl,
    fontWeight: Typography.bold,
  },
  quickStatLabel: {
    fontSize: Typography.fontXs,
    marginTop: 2,
  },
  searchCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontMd,
  },
  section: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
  },
  viewAllText: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
  },
  customerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerInitial: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
    color: '#ffffff',
  },
  customerName: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.semiBold,
  },
  customerPhone: {
    fontSize: Typography.fontSm,
  },
  customerBalance: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
  },
  dueLabel: {
    fontSize: Typography.font3xs,
    marginTop: 2,
  },
  txnCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  txnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnCustomer: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.semiBold,
  },
  txnDate: {
    fontSize: Typography.fontSm,
  },
  txnAmount: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
  },
  txnType: {
    fontSize: Typography.font3xs,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontMd,
    marginTop: Spacing.md,
    fontWeight: Typography.semiBold,
  },
  emptySubtext: {
    fontSize: Typography.fontSm,
    marginTop: Spacing.xs,
  },
});
