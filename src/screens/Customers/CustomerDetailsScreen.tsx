/**
 * Customer Details Screen - GPay-Inspired Design
 * Shows customer info, balance, and GPay-style transaction timeline
 */

import React, { useState, useEffect, useRef } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { getThemedColors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AvatarSizes, IconSizes } from '../../constants/scales';
import { useTheme } from '../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { SkeletonHeader, SkeletonTransaction } from '../../components/Skeletons';
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
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: customer?.name || 'Customer Details',
      headerBackTitleVisible: false,
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSendReminder}
          style={{ marginRight: 8, justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={0.7}
        >
          <Ionicons name="logo-whatsapp" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, customer]);

  // Reload data when screen comes into focus (e.g., after adding a transaction)
  useFocusEffect(
    React.useCallback(() => {
      loadCustomerDetails();
    }, [customerId])
  );

  const loadCustomerDetails = async () => {
    try {
      if (!refreshing) {
        setLoading(true);
      }
      const [customerData, transactionsData] = await Promise.all([
        ApiService.getCustomerDetails(customerId),
        ApiService.getTransactions(customerId),
      ]);
      setCustomer(customerData.customer);
      const txns = transactionsData.transactions || [];
      // Keep original order (oldest first, latest at bottom)
      setTransactions(txns);
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
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSendReminder = async () => {
    if (!customer) return;

    const balance = customer.balance || 0;
    if (balance <= 0) {
      Alert.alert('No Balance', 'This customer has no outstanding balance.');
      return;
    }

    // Confirmation dialog before sending
    Alert.alert(
      'Send Payment Reminder?',
      `Send WhatsApp reminder to ${customer.name} for ₹${Math.abs(balance).toFixed(0)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            const message = `Hi ${customer.name}, this is a payment reminder. Your current balance is ₹${Math.abs(balance).toFixed(0)}. Please clear your dues at your earliest convenience. Thank you!`;
            const whatsappAppUrl = `whatsapp://send?phone=91${customer.phone_number}&text=${encodeURIComponent(message)}`;
            const whatsappWebUrl = `https://wa.me/91${customer.phone_number}?text=${encodeURIComponent(message)}`;

            try {
              const supported = await Linking.canOpenURL(whatsappAppUrl);
              if (supported) {
                await Linking.openURL(whatsappAppUrl);
              } else {
                await Linking.openURL(whatsappWebUrl);
              }
            } catch (error) {
              console.error('Error opening WhatsApp:', error);
              try {
                await Linking.openURL(whatsappWebUrl);
              } catch (webError) {
                Alert.alert('Error', 'Failed to open WhatsApp');
              }
            }
          },
        },
      ]
    );
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
        <SkeletonHeader isDark={isDark} />
        <SkeletonTransaction isDark={isDark} />
        <SkeletonTransaction isDark={isDark} />
        <SkeletonTransaction isDark={isDark} />
        <SkeletonTransaction isDark={isDark} />
        <SkeletonTransaction isDark={isDark} />
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
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background : '#f5f5f5' }]}>
      {/* Balance Card - Clean & Minimal */}
      <View style={[styles.balanceCard, {
        backgroundColor: Colors.card,
        borderColor: Colors.borderLight,
      }]}>
        <View style={styles.balanceHeader}>
          <Text style={[styles.balanceLabel, { color: Colors.textSecondary }]}>Outstanding Balance</Text>
          <View style={[styles.balanceBadge, {
            backgroundColor: customer.balance > 0
              ? (isDark ? 'rgba(90, 154, 142, 0.2)' : 'rgba(90, 154, 142, 0.1)')
              : (isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(156, 163, 175, 0.1)')
          }]}>
            <Text style={[styles.balanceBadgeText, {
              color: customer.balance > 0 ? Colors.primary : Colors.textSecondary
            }]}>
              {customer.balance > 0 ? 'To Receive' : customer.balance < 0 ? 'Advance Given' : 'Settled'}
            </Text>
          </View>
        </View>
        <Text style={[styles.balanceAmount, { color: Colors.textPrimary }]}>
          {formatCurrency(Math.abs(customer.balance))}
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
        }
      >
        {/* Transactions - GPay Style */}
        {transactions.length > 0 ? (
          <View style={styles.transactionsContainer}>
            {groupByDate(transactions).map((group, groupIndex) => (
              <View key={groupIndex}>
                {/* Date Separator */}
                <View style={styles.dateSeparatorContainer}>
                  <View style={[styles.dateBadge, {
                    backgroundColor: isDark ? Colors.card : '#e5e7eb'
                  }]}>
                    <Text style={[styles.dateText, { color: Colors.textSecondary }]}>
                      {group.displayDate}
                    </Text>
                  </View>
                </View>

                {/* Transactions for this date */}
                {group.data.map((transaction) => {
                  const isCredit = transaction.transaction_type === 'credit';
                  const isBusinessCreated = transaction.created_by === 'business';

                  return (
                    <View
                      key={transaction.id}
                      style={[
                        styles.transactionRow,
                        isBusinessCreated ? styles.transactionRowRight : styles.transactionRowLeft
                      ]}
                    >
                      {/* Avatar for customer/non-business transactions (left) */}
                      {!isBusinessCreated && (
                        <View style={[styles.avatar, {
                          backgroundColor: isDark ? 'rgba(90, 154, 142, 0.2)' : 'rgba(90, 154, 142, 0.15)'
                        }]}>
                          <Text style={[styles.avatarText, { color: Colors.primary }]}>
                            {customer.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}

                      {/* Transaction Bubble */}
                      <View style={[
                        styles.transactionBubble,
                        !isBusinessCreated ? styles.bubbleReceived : styles.bubbleSent,
                        {
                          backgroundColor: !isBusinessCreated
                            ? (isDark ? '#2a2a2a' : '#f5f5f5')
                            : (isDark ? 'rgba(90, 154, 142, 0.15)' : 'rgba(90, 154, 142, 0.08)')
                        }
                      ]}>
                        {/* Amount */}
                        <Text style={[styles.transactionAmount, { color: Colors.textPrimary }]}>
                          {formatCurrency(transaction.amount)}
                        </Text>

                        {/* Status Row */}
                        <View style={styles.statusRow}>
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={isCredit ? '#ef4444' : '#10b981'}
                          />
                          <Text style={[styles.statusText, { color: isCredit ? '#ef4444' : '#10b981' }]} numberOfLines={1}>
                            {isCredit ? 'Credit Taken' : 'Payment Made'}
                          </Text>
                          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
                        </View>

                        {/* Notes */}
                        {transaction.notes && (
                          <Text style={[styles.notes, { color: Colors.textSecondary }]} numberOfLines={2}>
                            {transaction.notes}
                          </Text>
                        )}

                        {/* Time */}
                        <Text style={[styles.time, { color: Colors.textTertiary }]}>
                          {formatTime(transaction.created_at)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: Colors.card }]}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textTertiary} />
            <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>No transactions yet</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={[styles.bottomActions, {
        backgroundColor: Colors.card,
        borderTopColor: Colors.borderLight
      }]}>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.creditButton}
            onPress={() => navigation.navigate('AddTransaction', {
              customerId: customer.id,
              customerName: customer.name,
              transactionType: 'credit',
            })}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-up-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Give Credit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.paymentButton}
            onPress={() => navigation.navigate('AddTransaction', {
              customerId: customer.id,
              customerName: customer.name,
              transactionType: 'payment',
            })}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-down-outline" size={20} color="#fff" />
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
  balanceCard: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  balanceLabel: {
    fontSize: Typography.fontSm,
    fontFamily: Typography.fonts.semiBold,
  },
  balanceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  balanceBadgeText: {
    fontSize: Typography.font3xs,
    fontFamily: Typography.fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  transactionsContainer: {
    paddingHorizontal: Spacing.md,
  },
  dateSeparatorContainer: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dateBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  dateText: {
    fontSize: Typography.fontXs,
    fontFamily: Typography.fonts.semiBold,
  },
  transactionRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  transactionRowLeft: {
    justifyContent: 'flex-start',
  },
  transactionRowRight: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  avatarText: {
    fontSize: 14,
    fontFamily: Typography.fonts.bold,
  },
  transactionBubble: {
    minWidth: '50%',
    maxWidth: '75%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  bubbleReceived: {
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  bubbleSent: {
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  transactionAmount: {
    fontSize: Typography.fontLg,
    fontWeight: '800',
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  statusText: {
    flex: 1,
    fontSize: Typography.fontSm,
    fontFamily: Typography.fonts.semiBold,
  },
  notes: {
    fontSize: Typography.fontXs,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  time: {
    fontSize: Typography.font3xs,
    textAlign: 'right',
    marginTop: 2,
  },
  emptyState: {
    borderRadius: BorderRadius.md,
    padding: Spacing.space6,
    alignItems: 'center',
    margin: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
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
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  creditButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
    backgroundColor: '#ef4444',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
    backgroundColor: '#10b981',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  actionButtonText: {
    color: '#fff',
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
  },
});
