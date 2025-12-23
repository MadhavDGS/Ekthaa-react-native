/**
 * Customer Details Screen
 * Shows customer info, balance, and WhatsApp-style transaction bubbles
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
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AvatarSizes, IconSizes } from '../../constants/scales';
import { useTheme } from '../../context/ThemeContext';
import ApiService from '../../services/api';
import { Customer, Transaction } from '../../types';

export default function CustomerDetailsScreen({ route, navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const { customerId } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: customer?.name || 'Customer Details',
      headerBackTitleVisible: false,
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSendReminder}
          style={{ marginRight: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, customer]);

  useEffect(() => {
    loadCustomerDetails();
  }, [customerId]);

  const loadCustomerDetails = async () => {
    try {
      const [customerData, transactionsData] = await Promise.all([
        ApiService.getCustomerDetails(customerId),
        ApiService.getTransactions(customerId),
      ]);
      setCustomer(customerData.customer);
      setTransactions(transactionsData.transactions || []);
    } catch (error) {
      console.error('Error loading customer details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCustomerDetails();
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSendReminder = async () => {
    if (!customer) return;
    
    const balance = customer.balance || 0;
    if (balance <= 0) {
      Alert.alert('No Balance', 'This customer has no outstanding balance.');
      return;
    }

    const message = `Hi ${customer.name}, this is a payment reminder. Your current balance is ₹${Math.abs(balance).toFixed(0)}. Please clear your dues at your earliest convenience. Thank you!`;
    const whatsappAppUrl = `whatsapp://send?phone=91${customer.phone_number}&text=${encodeURIComponent(message)}`;
    const whatsappWebUrl = `https://wa.me/91${customer.phone_number}?text=${encodeURIComponent(message)}`;

    try {
      // Try to open WhatsApp app first
      const supported = await Linking.canOpenURL(whatsappAppUrl);
      if (supported) {
        await Linking.openURL(whatsappAppUrl);
      } else {
        // Fall back to WhatsApp Web
        await Linking.openURL(whatsappWebUrl);
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      // If all else fails, try web as last resort
      try {
        await Linking.openURL(whatsappWebUrl);
      } catch (webError) {
        Alert.alert('Error', 'Failed to open WhatsApp');
      }
    }
  };

  const groupByDate = (txns: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};
    txns.forEach(txn => {
      const date = new Date(txn.created_at).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(txn);
    });
    
    return Object.entries(groups)
      .map(([date, items]) => ({
        date,
        displayDate: formatDate(items[0].created_at),
        data: items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Colors.textPrimary }]}>Customer not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#f5f5f5' }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
        }
      >
        {/* Balance Summary */}
        <View style={[styles.balanceSummary, { backgroundColor: customer.balance > 0 ? '#fee2e2' : '#d1fae5' }]}>
          <View>
            <Text style={[styles.balanceLabel, { color: '#6b7280' }]}>Outstanding Balance</Text>
            <Text style={[styles.balanceAmount, { color: customer.balance > 0 ? '#dc2626' : '#059669' }]}>
              {formatCurrency(Math.abs(customer.balance))}
            </Text>
            <Text style={[styles.balanceStatus, { color: customer.balance > 0 ? '#dc2626' : '#059669' }]}>
              {customer.balance > 0 ? 'You will get' : customer.balance < 0 ? 'You gave' : 'Settled up'}
            </Text>
          </View>
        </View>

        {/* Transactions - Chat Style */}
        {transactions.length > 0 ? (
          <View style={styles.chatContainer}>
            {groupByDate(transactions).map((group, groupIndex) => (
              <View key={groupIndex}>
                {/* Date Separator */}
                <Text style={styles.dateSeparator}>{group.displayDate}</Text>
                
                {/* Transactions for this date */}
                {group.data.map((transaction) => {
                  const isCredit = transaction.type === 'credit';
                  return (
                    <View key={transaction.id} style={[styles.messageRow, isCredit ? styles.messageRowRight : styles.messageRowLeft]}>
                      {/* Avatar for payment received (left side) */}
                      {!isCredit && (
                        <View style={[styles.avatar, { backgroundColor: Colors.primary + '20' }]}>
                          <Text style={[styles.avatarText, { color: Colors.primary }]}>
                            {customer.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      
                      {/* Message Bubble */}
                      <View style={[styles.messageBubble, isCredit ? styles.bubbleCredit : styles.bubblePayment]}>
                        {/* Transaction Type Label */}
                        <Text style={[styles.transactionLabel, { color: isCredit ? '#ef4444' : '#10b981' }]}>
                          {isCredit ? 'Credit Taken' : 'Payment Received'}
                        </Text>
                        
                        <Text style={styles.amount}>₹{transaction.amount.toLocaleString('en-IN')}</Text>
                        
                        <View style={styles.statusRow}>
                          <Ionicons name="checkmark-circle" size={14} color={isCredit ? '#ef4444' : '#10b981'} />
                          <Text style={[styles.statusText, { color: isCredit ? '#ef4444' : '#10b981' }]} numberOfLines={1}>
                            {isCredit ? 'You will get back' : 'You received'}
                          </Text>
                          <Ionicons name="chevron-forward" size={12} color="#9ca3af" />
                        </View>
                        
                        {transaction.notes && (
                          <Text style={styles.notes} numberOfLines={2}>{transaction.notes}</Text>
                        )}
                        
                        <Text style={styles.time}>{formatTime(transaction.created_at)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: Colors.card }]}>
            <Ionicons name="receipt-outline" size={IconSizes.xlarge} color={Colors.textTertiary} />
            <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>No transactions yet</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={[styles.bottomActions, { backgroundColor: Colors.card, borderTopColor: Colors.borderLight }]}>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.creditButton]}
            onPress={() => navigation.navigate('AddTransaction', {
              customerId: customer.id,
              customerName: customer.name,
              transactionType: 'credit',
            })}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-up-outline" size={IconSizes.medium} color="#fff" />
            <Text style={styles.actionButtonText}>Give Credit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.paymentButton]}
            onPress={() => navigation.navigate('AddTransaction', {
              customerId: customer.id,
              customerName: customer.name,
              transactionType: 'payment',
            })}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-down-outline" size={IconSizes.medium} color="#fff" />
            <Text style={styles.actionButtonText}>Receive Payment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Typography.fontSm,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  balanceSummary: {
    padding: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  balanceLabel: {
    fontSize: Typography.fontXs,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: Typography.extraBold,
    marginBottom: Spacing.xs,
  },
  balanceStatus: {
    fontSize: Typography.fontXs,
    fontWeight: Typography.medium,
  },
  chatContainer: {
    paddingHorizontal: Spacing.md,
  },
  dateSeparator: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: Typography.fontXs,
    marginVertical: Spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: AvatarSizes.small,
    height: AvatarSizes.small,
    borderRadius: AvatarSizes.small / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  avatarText: {
    fontSize: Typography.fontXs,
    fontWeight: Typography.bold,
  },
  messageBubble: {
    minWidth: '45%',
    maxWidth: '75%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  bubblePayment: {
    backgroundColor: '#f0fdf4',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  bubbleCredit: {
    backgroundColor: '#fef2f2',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  amount: {
    fontSize: Typography.fontXl,
    fontWeight: Typography.extraBold,
    color: '#111827',
    marginBottom: Spacing.xs,
  },
  transactionLabel: {
    fontSize: Typography.font3xs,
    fontWeight: Typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.xs,
    flexWrap: 'nowrap',
  },
  statusText: {
    fontSize: Typography.fontXs,
    fontWeight: Typography.semiBold,
    flex: 1,
    numberOfLines: 1,
  },
  notes: {
    fontSize: Typography.fontXs,
    color: '#6b7280',
    marginBottom: Spacing.xs,
  },
  time: {
    fontSize: Typography.font3xs,
    color: '#9ca3af',
    textAlign: 'right',
  },
  emptyState: {
    borderRadius: BorderRadius.md,
    padding: Spacing.space6,
    alignItems: 'center',
    margin: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 2 },
    }),
  },
  emptyText: {
    fontSize: Typography.fontSm,
    marginTop: Spacing.md,
  },
  bottomActions: {
    padding: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
    borderTopWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  creditButton: {
    backgroundColor: '#ef4444',
  },
  paymentButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
  },
});