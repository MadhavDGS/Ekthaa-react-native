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
  const [activeTab, setActiveTab] = useState<'today' | 'month'>('today');

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

  // Filter customers who owe money (positive balance means they owe us)
  const customersWhoOwe = useMemo(() => {
    return customers
      .filter(c => {
        const balance = c.balance || 0;
        return balance > 0; // Positive balance = customer owes money
      })
      .sort((a, b) => (b.balance || 0) - (a.balance || 0)) // Highest balance first
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
        {/* Unified Activity Card with Tabs */}
        <View style={[styles.activityCard, { backgroundColor: Colors.card }]}>
          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'today' && styles.activeTab]}
              onPress={() => setActiveTab('today')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, { color: activeTab === 'today' ? Colors.primary : Colors.textSecondary }]}>
                Today
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'month' && styles.activeTab]}
              onPress={() => setActiveTab('month')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, { color: activeTab === 'month' ? Colors.primary : Colors.textSecondary }]}>
                This Month
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats Display */}
          <View style={styles.compactStatsRow}>
            <View style={styles.compactStat}>
              <View style={styles.compactStatRow}>
                <Ionicons name="arrow-down" size={16} color="#dc2626" />
                <Text style={[styles.compactStatLabel, { color: Colors.textSecondary }]}>Credits</Text>
              </View>
              <Text style={[styles.compactStatValue, { color: '#dc2626' }]}>
                ₹{(activeTab === 'today' ? todayStats.credits : monthStats.credits).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={[styles.compactDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }]} />

            <View style={styles.compactStat}>
              <View style={styles.compactStatRow}>
                <Ionicons name="arrow-up" size={16} color="#22c55e" />
                <Text style={[styles.compactStatLabel, { color: Colors.textSecondary }]}>Payments</Text>
              </View>
              <Text style={[styles.compactStatValue, { color: '#22c55e' }]}>
                ₹{(activeTab === 'today' ? todayStats.payments : monthStats.payments).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Net & Transaction Count */}
          <View style={[styles.summaryFooter, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.1)' : '#f0fdf4' }]}>
            <View style={styles.summaryFooterItem}>
              <Text style={[styles.summaryFooterLabel, { color: Colors.textSecondary }]}>Net</Text>
              <Text style={[styles.summaryFooterValue, { color: Colors.textPrimary }]}>
                {activeTab === 'today' 
                  ? (todayStats.payments - todayStats.credits >= 0 ? '+' : '')
                  : (monthStats.payments - monthStats.credits >= 0 ? '+' : '')
                }₹{Math.abs((activeTab === 'today' ? todayStats.payments - todayStats.credits : monthStats.payments - monthStats.credits)).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.summaryFooterItem}>
              <Text style={[styles.summaryFooterLabel, { color: Colors.textSecondary }]}>Transactions</Text>
              <Text style={[styles.summaryFooterValue, { color: Colors.textPrimary }]}>
                {activeTab === 'today' ? todayStats.count : monthStats.count}
              </Text>
            </View>
          </View>
        </View>

        {/* Customers Who Owe */}
        <View style={[styles.section, { backgroundColor: Colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
              {searchQuery ? 'Search Results' : 'Customers Who Owe You'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity 
                onPress={() => setSearchQuery(searchQuery ? '' : ' ')}
                style={[styles.searchIconButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }]}
              >
                <Ionicons name="search" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Customers')}>
                <Text style={[styles.viewAllText, { color: Colors.primary }]}>View All →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Integrated Search Input */}
          {searchQuery !== '' && (
            <View style={[styles.integratedSearchBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }]}>
              <Ionicons name="search" size={18} color={Colors.textTertiary} />
              <TextInput
                style={[styles.searchInput, { color: Colors.textPrimary }]}
                placeholder="Search customers..."
                placeholderTextColor={Colors.textTertiary}
                value={searchQuery === ' ' ? '' : searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
          )}

          {filteredCustomers.length > 0 ? (
            <>
              {filteredCustomers.map((customer, index) => (
                <TouchableOpacity
                  key={customer.$id || customer.id || `customer-${customer.phone_number}`}
                  style={[styles.customerCard, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }]}
                  onPress={() => navigation.navigate('CustomerDetails', { customerId: customer.$id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.customerInfo}>
                    <View style={[styles.customerAvatar, { backgroundColor: getColor(index) }]}>
                      <Text style={styles.customerInitial}>
                        {customer.name?.[0]?.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.customerDetails}>
                      <Text style={[styles.customerName, { color: Colors.textPrimary }]} numberOfLines={1}>
                        {customer.name}
                      </Text>
                      <Text style={[styles.customerPhone, { color: Colors.textSecondary }]}>
                        {customer.phone_number?.slice(0, 3)}•••{customer.phone_number?.slice(-3)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.customerBalanceContainer}>
                    <Text style={[styles.customerBalance, { color: '#ef4444' }]}>
                      {formatCurrency(customer.balance)} ↑
                    </Text>
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
  // Unified Activity Card
  activityCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#5A9A8E',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  compactStatsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  compactStat: {
    flex: 1,
  },
  compactStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  compactStatLabel: {
    fontSize: 12,
  },
  compactStatValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  compactDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  summaryFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  summaryFooterItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryFooterLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  summaryFooterValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  integratedSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  section: {
    marginHorizontal: Spacing.md,
    marginTop: 20,
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    minHeight: 48,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  customerDetails: {
    flex: 1,
    gap: 2,
  },
  customerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  customerPhone: {
    fontSize: 12,
  },
  customerBalanceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  customerBalance: {
    fontSize: 15,
    fontWeight: '700',
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
