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
import { useTheme } from '../../context/ThemeContext';

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

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
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
      <View style={styles.txnWrapper}>
        <View style={[styles.bubble, { backgroundColor: Colors.card }, isCredit ? styles.bubbleCredit : styles.bubblePayment]}>
          <View style={styles.txnHeader}>
            <View style={[styles.icon, { backgroundColor: isCredit ? '#fee2e2' : '#dcfce7' }]}>
              <Ionicons name={isCredit ? 'arrow-down' : 'arrow-up'} size={18} color={isCredit ? '#dc2626' : '#059669'} />
            </View>
            <View style={styles.txnInfo}>
              <Text style={[styles.txnTitle, { color: Colors.textPrimary }]}>{item.customer_name || 'Unknown'}</Text>
              <Text style={[styles.txnTime, { color: Colors.textSecondary }]}>{formatTime(item.created_at)}</Text>
            </View>
            <Text style={[styles.txnAmount, { color: isCredit ? '#dc2626' : '#059669' }]}>
              {isCredit ? '+' : '-'}{formatCurrency(item.amount)}
            </Text>
          </View>
          {item.notes && <Text style={[styles.txnNotes, { color: Colors.textSecondary }]}>{item.notes}</Text>}
        </View>
      </View>
    );
  };

  const renderDateHeader = ({ section }: any) => (
    <View style={styles.dateHeader}>
      <View style={[styles.dateLine, { backgroundColor: Colors.borderLight }]} />
      <Text style={[styles.dateText, { color: Colors.textSecondary }]}>{section.displayDate}</Text>
      <View style={[styles.dateLine, { backgroundColor: Colors.borderLight }]} />
    </View>
  );

  const groupedData = groupByDate(filteredTransactions);

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={[styles.statsCard, { backgroundColor: Colors.primary, ...Platform.select({ ios: { shadowColor: Colors.primary }, android: {} }) }]}>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Received</Text>
            <Text style={styles.statValue}>{formatCurrency(stats.totalCredit)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Given</Text>
            <Text style={styles.statValue}>{formatCurrency(stats.totalDebit)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.filters}>
        {['all', 'credit', 'payment'].map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.filter, { backgroundColor: filterType === type ? Colors.primary : Colors.card }]}
            onPress={() => setFilterType(type as any)}
          >
            <Text style={[styles.filterText, { color: filterType === type ? '#fff' : Colors.textSecondary }]}>
              {type === 'all' ? 'All' : type === 'credit' ? 'Received' : 'Given'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); loadTransactions(); }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={58} color="#d1d5db" />
            <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>No Transactions</Text>
            <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>Transactions will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsCard: {
    margin: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: Spacing.lg,
    padding: Spacing.xl,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  statRow: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: Spacing.lg },
  statLabel: { fontSize: Typography.fontSm, color: 'rgba(255,255,255,0.9)', marginBottom: Spacing.xs, fontWeight: Typography.medium },
  statValue: { fontSize: Typography.fontLg, fontWeight: Typography.extraBold, color: '#fff' },
  filters: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.md },
  filter: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, alignItems: 'center' },
  filterActive: { },
  filterText: { fontSize: Typography.fontBase, fontWeight: Typography.semiBold },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 90 },
  dateHeader: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.lg },
  dateLine: { flex: 1, height: 1 },
  dateText: { fontSize: Typography.fontXs, fontWeight: Typography.bold, marginHorizontal: Spacing.md, textTransform: 'uppercase' },
  txnWrapper: { marginBottom: Spacing.sm },
  bubble: {
    borderRadius: Spacing.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  bubbleCredit: { borderLeftColor: '#dc2626' },
  bubblePayment: { borderLeftColor: '#059669' },
  txnHeader: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  txnInfo: { flex: 1 },
  txnTitle: { fontSize: Typography.fontSm, fontWeight: Typography.semiBold, marginBottom: 2 },
  txnTime: { fontSize: Typography.fontXs },
  txnAmount: { fontSize: Typography.fontMd, fontWeight: Typography.bold },
  txnNotes: { fontSize: Typography.fontSm, marginTop: Spacing.sm, marginLeft: 47 },
  empty: { alignItems: 'center', paddingTop: 72 },
  emptyTitle: { fontSize: Typography.fontXl, fontWeight: Typography.bold, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  emptyText: { fontSize: Typography.fontSm },
});
