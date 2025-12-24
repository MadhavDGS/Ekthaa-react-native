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
  SafeAreaView,
} from 'react-native';
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
  const Colors = getThemedColors(isDark);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [businessName, setBusinessName] = useState('Business Account');
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Hide header for seamless gradient
    navigation.setOptions({
      headerShown: false,
    });
    loadDashboard();
    loadBusinessName();
  }, []);

  const loadBusinessName = async () => {
    try {
      // First try to get from stored userData
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('📊 User data:', user);
        setBusinessName(user?.business_name || user?.name || 'Business Account');
      }

      // Then fetch fresh data from profile API
      try {
        const profileData = await ApiService.getProfile();
        if (profileData?.user?.business_name || profileData?.user?.name) {
          const name = profileData.user.business_name || profileData.user.name;
          setBusinessName(name);
          // Update stored userData
          if (userData) {
            const user = JSON.parse(userData);
            user.business_name = name;
            await AsyncStorage.setItem('userData', JSON.stringify(user));
          }
        }
      } catch (error) {
        console.log('📊 Could not fetch fresh profile data');
      }
    } catch (error) {
      console.error('❌ Error loading business name:', error);
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getDashboard();
      console.log('📊 Dashboard data:', data);
      console.log('📊 Business name:', data?.business?.name || data?.summary?.business_name);
      setSummary(data);

      // Set business name from response
      if (data?.business?.name) {
        setBusinessName(data.business.name);
      } else if (data?.summary?.business_name) {
        setBusinessName(data.summary.business_name);
      }

      // Fetch recent transactions
      try {
        const transactionsData = await ApiService.getTransactions();
        if (transactionsData?.transactions) {
          // Get last 5 transactions
          const recent = transactionsData.transactions.slice(0, 5);
          setRecentTransactions(recent);
        }
      } catch (error) {
        console.log('Could not fetch recent transactions:', error);
      }
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
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <LinearGradient
          colors={['#5A9A8E', '#4A7D73', '#3A6A60', '#2A5550']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.4, 0.7, 1]}
          style={styles.gradientHeader}
        >
          <SafeAreaView>
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
                <Ionicons name="swap-horizontal-outline" size={22} color={Colors.primary} />
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
                <Ionicons name="pricetag-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ width: 60, height: 12, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4, marginTop: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
                <Ionicons name="analytics-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ width: 60, height: 12, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4, marginTop: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
                <Ionicons name="qr-code-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ width: 60, height: 12, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4, marginTop: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }]}>
                <Ionicons name="share-social-outline" size={22} color={Colors.primary} />
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
        <SafeAreaView>
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
            onPress={() => navigation.navigate('Customers')}
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
            onPress={() => navigation.navigate('Transactions')}
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

        {/* Daily Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: Colors.card }]}>
          <View style={styles.summaryHeader}>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            <Text style={[styles.summaryTitle, { color: Colors.textPrimary }]}>Today's Activity</Text>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={[styles.summaryStatValue, { color: Colors.primary }]}>
                {recentTransactions.filter(t => {
                  const today = new Date().toDateString();
                  const txDate = new Date(t.created_at || t.$createdAt).toDateString();
                  return today === txDate;
                }).length}
              </Text>
              <Text style={[styles.summaryStatLabel, { color: Colors.textSecondary }]}>Transactions</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStatItem}>
              <Text style={[styles.summaryStatValue, { color: Colors.primary }]}>
                ₹{recentTransactions.filter(t => {
                  const today = new Date().toDateString();
                  const txDate = new Date(t.created_at || t.$createdAt).toDateString();
                  return today === txDate && t.type === 'credit';
                }).reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.summaryStatLabel, { color: Colors.textSecondary }]}>Credits</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStatItem}>
              <Text style={[styles.summaryStatValue, { color: Colors.primary }]}>
                ₹{recentTransactions.filter(t => {
                  const today = new Date().toDateString();
                  const txDate = new Date(t.created_at || t.$createdAt).toDateString();
                  return today === txDate && t.type === 'payment';
                }).reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.summaryStatLabel, { color: Colors.textSecondary }]}>Payments</Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
                <Text style={[styles.viewAll, { color: Colors.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            {recentTransactions.map((transaction: any) => (
              <TouchableOpacity
                key={transaction.$id || transaction.id}
                style={[styles.transactionItem, { backgroundColor: Colors.card }]}
                onPress={() => navigation.navigate('Transactions')}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.transactionIcon,
                  {
                    backgroundColor: transaction.type === 'credit'
                      ? (isDark ? 'rgba(220, 38, 38, 0.15)' : '#fee2e2')
                      : (isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7')
                  }
                ]}>
                  <Ionicons
                    name={transaction.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                    size={18}
                    color={transaction.type === 'credit' ? '#dc2626' : '#22c55e'}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionCustomer, { color: Colors.textPrimary }]} numberOfLines={1}>
                    {transaction.customer_name || 'Unknown'}
                  </Text>
                  <Text style={[styles.transactionDate, { color: Colors.textSecondary }]}>
                    {new Date(transaction.created_at || transaction.$createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.transactionAmountText,
                    { color: transaction.type === 'credit' ? '#dc2626' : '#22c55e' }
                  ]}>
                    {transaction.type === 'credit' ? '+' : '-'}₹{(transaction.amount || 0).toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.transactionType, { color: Colors.textTertiary }]}>
                    {transaction.type === 'credit' ? 'Credit' : 'Payment'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Customers */}
        {summaryData?.recent_customers?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Recent Activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Customers')}>
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

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.primary }]}
        onPress={() => navigation.navigate('Customers')}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
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
});