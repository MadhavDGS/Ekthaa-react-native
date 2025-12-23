/**
 * Transactions Screen - GPay/PhonePe Style
 * Polished transaction timeline with beautiful bubbles
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
  RefreshControl,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../../services/api';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { AvatarSizes, IconSizes, TextScale, SpacingScale } from '../../constants/scales';
import { useTheme } from '../../context/ThemeContext';
import { SkeletonTransaction } from '../../components/Skeletons';

const { width } = Dimensions.get('window');

export default function TransactionsScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'payment' | 'credit'>('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalDebit: 0, totalCredit: 0, balance: 0 });
  const [lastFetch, setLastFetch] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      if (!transactions.length || now - lastFetch > fiveMinutes) {
        loadTransactions();
      }
    }, [transactions.length, lastFetch])
  );

  useEffect(() => {
    filterTransactions();
  }, [searchQuery, filterType, transactions]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getTransactions();
      const txnList = data.transactions || [];
      console.log('📋 Transactions loaded:', txnList.length);
      setTransactions(txnList);
      setLastFetch(Date.now());

      const totalDebit = txnList.filter((t: any) => t.transaction_type === 'payment').reduce((sum: number, t: any) => sum + t.amount, 0);
      const totalCredit = txnList.filter((t: any) => t.transaction_type === 'credit').reduce((sum: number, t: any) => sum + t.amount, 0);
      setStats({ totalDebit, totalCredit, balance: totalCredit - totalDebit });
    } catch (error) {
      console.error('❌ Load transactions error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.transaction_type === filterType);
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(t =>
        t.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredTransactions(filtered);
  };

  const formatCurrency = (amount: number) => `₹${amount?.toLocaleString('en-IN') || 0}`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const groupByDate = (data: any[]) => {
    const groups: any = {};
    data.forEach(txn => {
      const dateKey = new Date(txn.created_at).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(txn);
    });

    return Object.entries(groups)
      .map(([date, items]: any) => ({
        date,
        displayDate: formatDate(items[0].created_at),
        data: items.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const renderTransaction = ({ item }: any) => {
    const isCredit = item.transaction_type === 'credit';

    return (
      <TouchableOpacity
        style={[styles.txnCard, { backgroundColor: Colors.card }]}
        activeOpacity={0.6}
      >
        <View style={styles.txnHeader}>
          <View style={[styles.iconCircle, { backgroundColor: isCredit ? (isDark ? '#7f1d1d' : '#fee2e2') : (isDark ? '#064e3b' : '#d1fae5') }]}>
            <Ionicons
              name={isCredit ? 'arrow-down-circle' : 'arrow-up-circle'}
              size={18}
              color={isCredit ? (isDark ? '#fca5a5' : '#dc2626') : (isDark ? '#6ee7b7' : '#059669')}
            />
          </View>
          <View style={styles.txnInfo}>
            <Text style={[styles.customerName, { color: Colors.textPrimary }]} numberOfLines={1}>{item.customer_name || 'Unknown'}</Text>
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={11} color={Colors.textTertiary} />
              <Text style={[styles.txnTime, { color: Colors.textSecondary }]}>{formatTime(item.created_at)}</Text>
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text style={[styles.txnAmount, { color: isCredit ? (isDark ? '#fca5a5' : '#dc2626') : (isDark ? '#6ee7b7' : '#059669') }]}>
              {isCredit ? '+' : '-'}{formatCurrency(item.amount)}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: isCredit ? (isDark ? '#7f1d1d' : '#fee2e2') : (isDark ? '#064e3b' : '#d1fae5') }]}>
              <Text style={[styles.typeBadgeText, { color: isCredit ? (isDark ? '#fca5a5' : '#dc2626') : (isDark ? '#6ee7b7' : '#059669') }]}>
                {isCredit ? 'Received' : 'Given'}
              </Text>
            </View>
          </View>
        </View>
        {item.notes && (
          <View style={styles.notesContainer}>
            <Ionicons name="document-text-outline" size={12} color={Colors.textTertiary} style={{ marginRight: Spacing.xs }} />
            <Text style={[styles.txnNotes, { color: Colors.textSecondary }]} numberOfLines={2}>{item.notes}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderDateHeader = ({ section }: any) => (
    <View style={styles.dateHeaderContainer}>
      <View style={[styles.dateBadge, { backgroundColor: isDark ? '#1f2937' : '#f3f4f6' }]}>
        <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} style={{ marginRight: Spacing.xs }} />
        <Text style={[styles.dateText, { color: Colors.textPrimary }]}>{section.displayDate}</Text>
      </View>
    </View>
  );

  const groupedData = groupByDate(filteredTransactions);

  return (
    <View style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
      {/* Stats Card */}
      <View style={[styles.statsCard, { backgroundColor: Colors.card }]}>
        <View style={styles.balanceMain}>
          <View style={styles.balanceHeader}>
            <Ionicons name="wallet-outline" size={18} color={Colors.textSecondary} />
            <Text style={[styles.balanceLabel, { color: Colors.textSecondary }]}>Net Balance</Text>
          </View>
          <Text style={[styles.balanceValue, { color: stats.balance >= 0 ? (isDark ? '#6ee7b7' : '#059669') : (isDark ? '#fca5a5' : '#dc2626') }]}>
            {formatCurrency(Math.abs(stats.balance))}
          </Text>
          <Text style={[styles.balanceStatus, { color: Colors.textTertiary }]}>
            {stats.balance >= 0 ? 'You will receive' : 'You will give'}
          </Text>
        </View>

        <View style={styles.statsChips}>
          <View style={[styles.statChip, { backgroundColor: isDark ? '#064e3b' : '#d1fae5' }]}>
            <Ionicons name="arrow-down-circle" size={14} color={isDark ? '#6ee7b7' : '#059669'} style={{ marginRight: Spacing.xs }} />
            <View>
              <Text style={[styles.chipLabel, { color: isDark ? '#6ee7b7' : '#047857' }]}>Received</Text>
              <Text style={[styles.chipValue, { color: isDark ? '#6ee7b7' : '#059669' }]}>{formatCurrency(stats.totalCredit)}</Text>
            </View>
          </View>
          <View style={[styles.statChip, { backgroundColor: isDark ? '#7f1d1d' : '#fee2e2' }]}>
            <Ionicons name="arrow-up-circle" size={14} color={isDark ? '#fca5a5' : '#dc2626'} style={{ marginRight: Spacing.xs }} />
            <View>
              <Text style={[styles.chipLabel, { color: isDark ? '#fca5a5' : '#b91c1c' }]}>Given</Text>
              <Text style={[styles.chipValue, { color: isDark ? '#fca5a5' : '#dc2626' }]}>{formatCurrency(stats.totalDebit)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: Colors.card }]}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#1f2937' : '#f3f4f6' }]}>
          <Ionicons name="search" size={14} color={Colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: Colors.textPrimary }]}
            placeholder="Search by customer or notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={14} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {['all', 'credit', 'payment'].map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterChip,
              { backgroundColor: isDark ? '#1f2937' : '#f3f4f6' },
              filterType === type && {
                backgroundColor: Colors.primary,
                ...Platform.select({
                  ios: { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
                  android: { elevation: 4 },
                })
              }
            ]}
            onPress={() => setFilterType(type as any)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterText,
              { color: filterType === type ? '#fff' : Colors.textPrimary },
              filterType === type && { fontFamily: Typography.fonts.bold }
            ]}>
              {type === 'all' ? 'All' : type === 'credit' ? 'Received' : 'Given'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      <FlatList
        data={groupedData}
        renderItem={({ item }) => (
          <View>
            {renderDateHeader({ section: item })}
            {item.data.map((txn: any) => (
              <View key={txn.id}>
                {renderTransaction({ item: txn })}
              </View>
            ))}
          </View>
        )}
        keyExtractor={(item, idx) => item.date + idx}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadTransactions(); }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={Colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>No Transactions</Text>
            <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>Transactions will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  balanceMain: {
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  balanceLabel: {
    fontSize: Typography.fontXs,
    fontFamily: Typography.fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: Typography.font2xl,
    fontWeight: '900',
    marginBottom: Spacing.xs,
    letterSpacing: -1,
  },
  balanceStatus: {
    fontSize: Typography.font3xs,
    fontFamily: Typography.fonts.medium,
  },
  statsChips: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  chipLabel: {
    fontSize: Typography.font3xs,
    fontFamily: Typography.fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  chipValue: {
    fontSize: Typography.fontSm,
    fontWeight: '800',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    height: 32,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontXs,
    marginLeft: Spacing.xs,
    fontFamily: Typography.fonts.medium,
    height: 32,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    flex: 1,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  filterText: {
    fontSize: Typography.fontXs,
    fontFamily: Typography.fonts.semiBold,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 95,
  },
  dateHeaderContainer: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  dateText: {
    fontSize: Typography.fontSm,
    fontFamily: Typography.fonts.bold,
    letterSpacing: 0.3,
  },
  txnCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  txnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: AvatarSizes.medium,
    height: AvatarSizes.medium,
    borderRadius: AvatarSizes.medium / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  txnInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  customerName: {
    fontSize: Typography.fontBase,
    fontFamily: Typography.fonts.bold,
    marginBottom: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  txnTime: {
    fontSize: Typography.font3xs,
    fontFamily: Typography.fonts.medium,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  txnAmount: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    fontSize: Typography.font3xs,
    fontFamily: Typography.fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  txnNotes: {
    flex: 1,
    fontSize: Typography.fontXs,
    lineHeight: 18,
    fontFamily: Typography.fonts.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 72,
  },
  emptyTitle: {
    fontSize: Typography.fontBase,
    fontFamily: Typography.fonts.bold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.font3xs,
    textAlign: 'center',
  },
});
