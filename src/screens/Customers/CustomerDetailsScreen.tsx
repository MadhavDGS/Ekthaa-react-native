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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Customer not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.backgroundSecondary }]} edges={['top']}>
      {/* App Bar */}
      <View style={[styles.appBar, { backgroundColor: Colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={[styles.appBarTitle, { color: Colors.white }]}>{customer.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Customer Info Card */}
        <View style={[styles.customerInfoCard, { backgroundColor: Colors.white }]}>
          <View style={[styles.avatarLarge, { backgroundColor: Colors.bgLightPurple }]}>
            <Text style={[styles.avatarLargeText, { color: Colors.primary }]}>
              {customer.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.customerNameLarge, { color: Colors.textPrimary }]}>{customer.name}</Text>
          <Text style={[styles.customerPhoneLarge, { color: Colors.textSecondary }]}>{customer.phone_number}</Text>
          {customer.address && (
            <Text style={[styles.customerAddressLarge, { color: Colors.textTertiary }]}>{customer.address}</Text>
          )}
        </View>

        {/* Current Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: Colors.bgLightPurple }]}>
          <Text style={[styles.balanceLabel, { color: Colors.textSecondary }]}>CURRENT BALANCE</Text>
          <Text
            style={[
              styles.balanceAmountLarge,
              { color: customer.balance > 0 ? Colors.creditRed : Colors.paymentGreen },
            ]}
          >
            {formatCurrency(Math.abs(customer.balance))}
          </Text>
          <Text
            style={[
              styles.balanceStatus,
              { color: customer.balance > 0 ? Colors.creditRed : Colors.paymentGreen },
            ]}
          >
            {customer.balance > 0 ? 'TO RECEIVE' : customer.balance < 0 ? 'RECEIVED' : 'SETTLED'}
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.creditButton, { backgroundColor: Colors.creditRed }]}>
              <Ionicons name="arrow-up" size={18} color={Colors.white} />
              <Text style={[styles.actionButtonText, { color: Colors.white }]}>Take Credit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.paymentButton, { backgroundColor: Colors.paymentGreen }]}>
              <Ionicons name="arrow-down" size={18} color={Colors.white} />
              <Text style={[styles.actionButtonText, { color: Colors.white }]}>Pay Back</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transactions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Transactions</Text>
          
          {transactions.length > 0 ? (
            <View style={styles.transactionsContainer}>
              {transactions.map((transaction) => (
                <View
                  key={transaction.id}
                  style={[
                    styles.transactionBubble,
                    transaction.type === 'credit'
                      ? styles.transactionBubbleRight
                      : styles.transactionBubbleLeft,
                  ]}
                >
                  <View style={styles.bubbleHeader}>
                    <Text style={[styles.bubbleType, { color: Colors.textSecondary }]}>
                      {transaction.type === 'credit' ? 'Credit Given' : 'Payment Received'}
                    </Text>
                  </View>
                  
                  <View style={styles.bubbleAmount}>
                    <View
                      style={[
                        styles.bubbleIcon,
                        {
                          backgroundColor:
                            transaction.type === 'credit'
                              ? Colors.creditRed
                              : Colors.paymentGreen,
                        },
                      ]}
                    >
                      <Ionicons
                        name={transaction.type === 'credit' ? 'arrow-up' : 'arrow-down'}
                      size={14}
                        color={Colors.white}
                      />
                    </View>
                    <Text
                      style={[
                        styles.bubbleAmountText,
                        {
                          color:
                            transaction.type === 'credit'
                              ? Colors.creditRed
                              : Colors.paymentGreen,
                        },
                      ]}
                    >
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>

                  {transaction.notes && (
                    <View style={styles.bubbleNotes}>
                      <Text style={[styles.bubbleNotesText, { color: Colors.textSecondary }]}>{transaction.notes}</Text>
                    </View>
                  )}

                  <Text style={[styles.bubbleTimestamp, { color: Colors.textTertiary }]}>
                    {formatDate(transaction.created_at)} • {formatTime(transaction.created_at)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: Colors.white }]}>
              <Ionicons name="receipt-outline" size={43} color={Colors.textTertiary} />
              <Text style={[styles.emptyStateText, { color: Colors.textSecondary }]}>No transactions yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB - Add Transaction */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: Colors.primary }]}>
        <Ionicons name="add" size={25} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
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
    fontSize: Typography.fontBase,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space3,
    ...Shadows.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    fontSize: Typography.fontMd,
    fontWeight: Typography.bold,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.space4,
    paddingBottom: 100,
  },
  customerInfoCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.space6,
    alignItems: 'center',
    marginBottom: Spacing.space4,
    ...Shadows.sm,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.space4,
  },
  avatarLargeText: {
    fontSize: 32,
    fontWeight: Typography.bold,
  },
  customerNameLarge: {
    fontSize: Typography.fontXl,
    fontWeight: Typography.bold,
    marginBottom: Spacing.space2,
  },
  customerPhoneLarge: {
    fontSize: Typography.fontBase,
    marginBottom: Spacing.space2,
  },
  customerAddressLarge: {
    fontSize: Typography.fontSm,
    textAlign: 'center',
  },
  balanceCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.space6,
    alignItems: 'center',
    marginBottom: Spacing.space4,
  },
  balanceLabel: {
    fontSize: Typography.fontXs,
    fontWeight: Typography.semiBold,
    letterSpacing: 1,
    marginBottom: Spacing.space2,
  },
  balanceAmountLarge: {
    fontSize: Typography.font2xl,
    fontWeight: Typography.extraBold,
    marginBottom: Spacing.space2,
  },
  balanceStatus: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
    marginBottom: Spacing.space4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 11,
    marginTop: Spacing.space2,
  },
  creditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.space3,
    paddingHorizontal: Spacing.space5,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.space3,
    paddingHorizontal: Spacing.space5,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  actionButtonText: {
    fontSize: Typography.fontSm,
    fontWeight: Typography.semiBold,
  },
  section: {
    marginBottom: Spacing.space6,
  },
  sectionTitle: {
    fontSize: Typography.fontLg,
    fontWeight: Typography.bold,
    marginBottom: Spacing.space4,
  },
  transactionsContainer: {
    gap: Spacing.space3,
  },
  transactionBubble: {
    maxWidth: '85%',
    borderRadius: BorderRadius.md,
    padding: Spacing.space4,
  },
  transactionBubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(209, 250, 229, 0.5)',
    borderTopLeftRadius: 4,
  },
  transactionBubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(254, 226, 226, 0.5)',
    borderTopRightRadius: 4,
  },
  bubbleHeader: {
    marginBottom: Spacing.space2,
  },
  bubbleType: {
    fontSize: Typography.fontXs,
    fontWeight: Typography.semiBold,
    textTransform: 'uppercase',
  },
  bubbleAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: Spacing.space2,
  },
  bubbleIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleAmountText: {
    fontSize: Typography.fontLg,
    fontWeight: Typography.bold,
  },
  bubbleNotes: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.space2,
    marginBottom: Spacing.space2,
  },
  bubbleNotesText: {
    fontSize: Typography.fontSm,
  },
  bubbleTimestamp: {
    fontSize: Typography.font3xs,
    textAlign: 'right',
  },
  emptyState: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.space8,
    alignItems: 'center',
    ...Shadows.sm,
  },
  emptyStateText: {
    fontSize: Typography.fontSm,
    marginTop: Spacing.space3,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 81,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.fab,
  },
});
