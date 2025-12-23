/**
 * Customers Screen - GPay/PhonePe Style
 * Polished customer list with beautiful cards
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../../services/api';
import { getThemedColors, AvatarColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { AvatarSizes, IconSizes, TextScale, SpacingScale } from '../../constants/scales';
import { listStyles, avatarStyles, searchBarStyles } from '../../styles/commonStyles';
import { useTheme } from '../../context/ThemeContext';
import { SkeletonCard } from '../../components/Skeletons';

const { width } = Dimensions.get('window');

export default function CustomersScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetch, setLastFetch] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      // Only fetch if data is stale (5+ minutes old) or doesn't exist
      if (!customers.length || now - lastFetch > fiveMinutes) {
        loadCustomers();
      }
    }, [customers.length, lastFetch])
  );

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, customers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCustomers();
      console.log('📋 Customers loaded:', data.customers?.length || 0);
      console.log('🔍 Sample customer balance:', data.customers?.[0]?.name, 'Balance:', data.customers?.[0]?.balance);
      setCustomers(data.customers || []);
      setLastFetch(Date.now());
    } catch (error) {
      console.error('❌ Load customers error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterCustomers = () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone_number.includes(searchQuery)
    );
    setFilteredCustomers(filtered);
  };

  const formatCurrency = (amount: number) => `₹${Math.abs(amount)?.toLocaleString('en-IN') || 0}`;

  const getAvatarColor = (index: number) => {
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
    return colors[index % colors.length];
  };

  const renderCustomer = ({ item, index }: any) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: Colors.card }]}
      onPress={() => navigation.navigate('CustomerDetails', { customerId: item.id })}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(index) }]}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: Colors.textPrimary }]}>{item.name}</Text>
        <View style={styles.phone}>
          <Ionicons name="call" size={10} color={Colors.textSecondary} />
          <Text style={[styles.phoneText, { color: Colors.textSecondary }]}>{item.phone_number}</Text>
        </View>
      </View>
      <View style={styles.balanceBox}>
        <Text style={[styles.balance, { color: item.balance > 0 ? Colors.creditRed : item.balance < 0 ? Colors.creditGreen : Colors.textSecondary }]}>
          {formatCurrency(item.balance)}
        </Text>
        <Text style={[styles.balanceLabel, { color: Colors.textTertiary }]}>
          {item.balance > 0 ? "You'll receive" : item.balance < 0 ? 'Advance paid' : 'Settled'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={12} color={Colors.textTertiary} />
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
        <View style={[styles.search, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
          <View style={[styles.searchBar, { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6' }]}>
            <Ionicons name="search" size={14} color={Colors.textTertiary} />
            <View style={[styles.input, { height: 20, backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb', borderRadius: 4 }]} />
          </View>
        </View>
        <SkeletonCard isDark={isDark} />
        <SkeletonCard isDark={isDark} />
        <SkeletonCard isDark={isDark} />
        <SkeletonCard isDark={isDark} />
        <SkeletonCard isDark={isDark} />
        <SkeletonCard isDark={isDark} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]}>
      <View style={[styles.search, { backgroundColor: Colors.card, borderBottomColor: Colors.borderLight }]}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6' }]}>
          <Ionicons name="search" size={14} color={Colors.textTertiary} />
          <TextInput
            style={[styles.input, { color: Colors.textPrimary }]}
            placeholder="Search customers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={14} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomer}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadCustomers(); }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={46} color={Colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>No Customers</Text>
            <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
              {searchQuery ? 'No matches found' : 'Add your first customer'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.primary }]}
        onPress={() => navigation.navigate('AddCustomer')}
        activeOpacity={0.8}
      >
        <Ionicons name="person-add" size={17} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  search: { paddingHorizontal: SpacingScale.sectionPadding, paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    height: 32,
  },
  input: { flex: 1, fontSize: Typography.fontXs, marginLeft: Spacing.xs, height: 40 },
  list: { padding: SpacingScale.sectionPadding, paddingBottom: 95 },
  card: {
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: BorderRadius.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 5 },
      android: { elevation: 2 },
    }),
  },
  avatar: { width: AvatarSizes.medium, height: AvatarSizes.medium, borderRadius: AvatarSizes.medium / 2, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm },
  avatarText: { fontSize: TextScale.listTitle, fontWeight: Typography.bold, color: '#fff' },
  info: { flex: 1 },
  name: { fontSize: Typography.fontSm, fontWeight: Typography.semiBold, marginBottom: Spacing.xs },
  phone: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  phoneText: { fontSize: Typography.font3xs, marginLeft: Spacing.xs },
  balanceBox: { alignItems: 'flex-end', marginRight: Spacing.xs },
  balance: { fontSize: Typography.fontBase, fontWeight: Typography.bold, marginBottom: 2 },
  balanceLabel: { fontSize: Typography.font3xs, fontWeight: Typography.semiBold, textTransform: 'uppercase' },
  empty: { alignItems: 'center', paddingTop: 58 },
  emptyTitle: { fontSize: Typography.fontMd, fontWeight: Typography.bold, marginTop: Spacing.md, marginBottom: Spacing.xs },
  emptyText: { fontSize: Typography.fontXs, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 22,
    right: 22,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
});
